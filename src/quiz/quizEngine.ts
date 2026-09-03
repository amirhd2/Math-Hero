/**
 * Dedicated Quiz Engine Controller and Hook for Math Hero.
 * Orchestrates session state, response timing, validation, practice/test branches,
 * falling-leaf card transitions, submission locking, and persistence.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  QuizSession,
  QuizConfiguration,
  QuizResult,
  MistakeRecord,
  UserProfile,
  CharacterPose,
  QuizQuestion,
  QuizQuestionResponse,
} from '../types';
import { createQuizSession } from '../utils/questionGenerator';
import { validateAnswer, normalizeAnswer, PRACTICE_MAX_ATTEMPTS, TEST_MAX_ATTEMPTS } from './answerValidator';
import { recordResponseInSession, advanceSessionToNext, buildFinalQuizResult } from './quizSession';
import { persistQuizCompletion } from './quizPersistence';
import { sound } from '../utils/sound';
import { QuizFeedbackStatus } from './quizTypes';

interface UseQuizEngineOptions {
  session?: QuizSession;
  config?: QuizConfiguration;
  profile: UserProfile;
  soundEnabled: boolean;
  onFinishQuiz: (result: QuizResult) => void;
  onCancelQuiz: () => void;
}

export function useQuizEngine({
  session: initialSession,
  config: initialConfig,
  profile,
  soundEnabled,
  onFinishQuiz,
  onCancelQuiz,
}: UseQuizEngineOptions) {
  // 1. Initialize or generate active session
  const [session, setSession] = useState<QuizSession>(() => {
    if (initialSession && initialSession.questions.length > 0) {
      return initialSession;
    }
    if (initialConfig) {
      return createQuizSession(initialConfig);
    }
    throw new Error('No quiz session or configuration provided to Quiz Engine.');
  });

  // Current answer input in the textfield
  const [userAnswer, setUserAnswer] = useState<string>('');

  // Practice mode attempt count for current question (0, 1, 2)
  const [currentAttempts, setCurrentAttempts] = useState(0);

  // Feedback states
  const [feedbackStatus, setFeedbackStatus] = useState<QuizFeedbackStatus>('idle');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [revealedAnswer, setRevealedAnswer] = useState<number | null>(null);

  // Animation and submission guards
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Streak tracker
  const [streak, setStreak] = useState(0);

  // Dynamic character pose
  const [characterPose, setCharacterPose] = useState<CharacterPose>('thinking');

  // Accumulated mistakes for smart review & result breakdown
  const mistakesRef = useRef<MistakeRecord[]>([]);

  // Response time tracking per question
  const questionStartTimeRef = useRef<number>(Date.now());

  // Input DOM reference to maintain focus and keyboard stability
  const inputRef = useRef<HTMLInputElement | null>(null);

  const mode = session.mode;
  const isPractice = mode === 'practice';
  const maxAttempts = isPractice ? PRACTICE_MAX_ATTEMPTS : TEST_MAX_ATTEMPTS;

  const currentQuestion: QuizQuestion =
    session.questions[session.currentIndex] || session.questions[0];

  // Keep input focused automatically on initial mount and question transitions
  const focusInput = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.focus({ preventScroll: true });
      requestAnimationFrame(() => {
        inputRef.current?.focus({ preventScroll: true });
      });
      setTimeout(() => {
        inputRef.current?.focus({ preventScroll: true });
      }, 60);
    }
  }, []);

  useEffect(() => {
    questionStartTimeRef.current = Date.now();
    focusInput();
  }, [session.currentIndex, focusInput]);

  /**
   * Internal transition handler to advance to next question with falling-leaf effect.
   */
  const transitionToNext = useCallback(
    async (updatedSession: QuizSession) => {
      setIsAdvancing(true);
      sound.playCardSlide(soundEnabled);

      // Duration matches fallingLeaf animation (550ms)
      setTimeout(async () => {
        if (updatedSession.currentIndex + 1 < updatedSession.questions.length) {
          const advanced = advanceSessionToNext(updatedSession);
          setSession(advanced);
          setUserAnswer('');
          setCurrentAttempts(0);
          setFeedbackStatus('idle');
          setFeedbackMessage(null);
          setRevealedAnswer(null);
          setCharacterPose('thinking');
          setIsAdvancing(false);
          setIsSubmitting(false);
          questionStartTimeRef.current = Date.now();

          // Refocus input seamlessly so keyboard remains open
          focusInput();
        } else {
          // Final question completed!
          const completed = advanceSessionToNext(updatedSession);
          setSession(completed);

          const finalResult = buildFinalQuizResult(completed, mistakesRef.current);
          sound.playComplete(soundEnabled);
          sound.vibrateSuccess(soundEnabled);

          const { finalResult: savedResult } = await persistQuizCompletion(finalResult, mistakesRef.current, profile);
          setIsAdvancing(false);
          setIsSubmitting(false);

          onFinishQuiz(savedResult);
        }
      }, 550);
    },
    [soundEnabled, profile, onFinishQuiz, focusInput]
  );

  /**
   * Primary answer submission handler.
   * Enforces submission lock, prevents rapid double-submissions, and routes Test vs Practice.
   */
  const submitAnswer = useCallback(
    async (overrideAnswer?: string | number) => {
      const answerToValidate = overrideAnswer !== undefined ? overrideAnswer : userAnswer;

      // Guard: empty, locked, advancing, or already revealed
      if (
        isSubmitting ||
        isAdvancing ||
        revealedAnswer !== null ||
        answerToValidate === '' ||
        answerToValidate === undefined
      ) {
        return;
      }

      setIsSubmitting(true);
      const timeSpentMs = Math.max(200, Date.now() - questionStartTimeRef.current);
      const validation = validateAnswer(answerToValidate, currentQuestion, mode, currentAttempts);

      if (validation.isCorrect) {
        // --- CORRECT ANSWER ---
        sound.playSuccess(soundEnabled);
        sound.vibrateSuccess(soundEnabled);
        setFeedbackStatus('correct');
        setFeedbackMessage(validation.message || 'درست است!');
        setCharacterPose('celebrating');
        setStreak((prev) => prev + 1);

        const response: QuizQuestionResponse = {
          questionId: currentQuestion.id,
          userAnswer: validation.parsedAnswer,
          isCorrect: true,
          attemptsCount: currentAttempts + 1,
          timeSpentMs,
          revealedInPractice: false,
        };

        const updatedSession = recordResponseInSession(session, session.currentIndex, response);
        setSession(updatedSession);

        // Advance smoothly
        setTimeout(() => {
          transitionToNext(updatedSession);
        }, 500);
      } else {
        // --- INCORRECT ANSWER ---
        sound.playError(soundEnabled);
        sound.vibrateError(soundEnabled);
        setStreak(0);

        if (mode === 'test') {
          // TEST MODE: 1 ATTEMPT ONLY. NEVER REVEAL CORRECT ANSWER.
          setFeedbackStatus('incorrect');
          setCharacterPose('sad');

          const mistake: MistakeRecord = {
            id: `mistake_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            timestamp: Date.now(),
            question: currentQuestion,
            userAnswer: validation.parsedAnswer,
            resolved: false,
          };
          mistakesRef.current.push(mistake);

          const response: QuizQuestionResponse = {
            questionId: currentQuestion.id,
            userAnswer: validation.parsedAnswer,
            isCorrect: false,
            attemptsCount: 1,
            timeSpentMs,
            revealedInPractice: false,
          };

          const updatedSession = recordResponseInSession(session, session.currentIndex, response);
          setSession(updatedSession);

          // Proceed to next question without revealing answer
          setTimeout(() => {
            transitionToNext(updatedSession);
          }, 650);
        } else {
          // PRACTICE MODE: UP TO 3 ATTEMPTS
          const nextAttemptCount = currentAttempts + 1;
          setCurrentAttempts(nextAttemptCount);

          if (nextAttemptCount < PRACTICE_MAX_ATTEMPTS) {
            // Friendly retry allowed (Attempt 1 or 2)
            setFeedbackStatus('incorrect');
            setFeedbackMessage(validation.message || 'دوباره امتحان کن!');
            setCharacterPose('encouraging');
            setUserAnswer('');

            // Shake ends, unlock input so child can retry without losing focus
            setTimeout(() => {
              setFeedbackStatus('idle');
              setIsSubmitting(false);
              focusInput();
            }, 600);
          } else {
            // 3rd failed attempt in practice: Reveal answer friendly!
            sound.playReveal(soundEnabled);
            setFeedbackStatus('revealed');
            setRevealedAnswer(currentQuestion.correctAnswer);
            setFeedbackMessage(validation.message || `پاسخ صحیح: ${currentQuestion.correctAnswer} است.`);
            setCharacterPose('sad');

            const mistake: MistakeRecord = {
              id: `mistake_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              timestamp: Date.now(),
              question: currentQuestion,
              userAnswer: validation.parsedAnswer,
              resolved: false,
            };
            mistakesRef.current.push(mistake);

            const response: QuizQuestionResponse = {
              questionId: currentQuestion.id,
              userAnswer: validation.parsedAnswer,
              isCorrect: false,
              attemptsCount: PRACTICE_MAX_ATTEMPTS,
              timeSpentMs,
              revealedInPractice: true,
            };

            const updatedSession = recordResponseInSession(session, session.currentIndex, response);
            setSession(updatedSession);
            setIsSubmitting(false);

            // Do not auto-advance; child must tap the explicit "متوجه شدم، سوال بعدی" button or press Enter
            manualAdvanceRef.current = () => {
              transitionToNext(updatedSession);
            };
          }
        }
      }
    },
    [
      userAnswer,
      isSubmitting,
      isAdvancing,
      revealedAnswer,
      currentQuestion,
      mode,
      currentAttempts,
      soundEnabled,
      session,
      transitionToNext,
      focusInput,
    ]
  );

  const manualAdvanceRef = useRef<(() => void) | null>(null);

  const advanceNow = useCallback(() => {
    if (manualAdvanceRef.current) {
      manualAdvanceRef.current();
      manualAdvanceRef.current = null;
    }
  }, []);

  return {
    session,
    currentQuestion,
    questionIndex: session.currentIndex,
    questionNumber: session.currentIndex + 1,
    totalQuestions: session.questions.length,
    mode,
    isPractice,
    currentAttempts,
    maxAttempts,
    userAnswer,
    setUserAnswer,
    feedbackStatus,
    feedbackMessage,
    revealedAnswer,
    isSubmitting,
    isAdvancing,
    isComplete: session.isCompleted,
    streak,
    characterPose,
    inputRef,
    submitAnswer,
    advanceNow,
    cancelQuiz: onCancelQuiz,
  };
}

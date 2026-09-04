/**
 * QuizActiveScreen component for Math Hero.
 * Connects directly to the dedicated Quiz Engine (useQuizEngine).
 * Provides responsive layout:
 * - Minimal distance (2-3mm) between progress bar and card.
 * - Hero companion character sits directly inside the corner of the card.
 * - Automatic keyboard activation and persistent focus across card transitions.
 */

import React, { useState } from 'react';
import { QuizPreset, QuizResult, UserProfile, QuizSession, AppSettings } from '../types';
import { useQuizEngine } from '../quiz/quizEngine';
import { QuizGuard } from '../components/QuizGuard';
import { QuizHeader } from '../components/quiz/QuizHeader';
import { QuizCardStack } from '../components/quiz/QuizCardStack';
import { AnswerInput } from '../components/quiz/AnswerInput';
import { ExitConfirmationModal } from '../components/quiz/ExitConfirmationModal';

interface QuizActiveScreenProps {
  preset?: QuizPreset;
  session?: QuizSession;
  profile: UserProfile;
  settings?: AppSettings;
  soundEnabled: boolean;
  onFinishQuiz: (result: QuizResult) => void;
  onCancelQuiz: () => void;
}

export const QuizActiveScreen: React.FC<QuizActiveScreenProps> = ({
  session: propSession,
  profile,
  settings,
  soundEnabled,
  onFinishQuiz,
  onCancelQuiz,
}) => {
  const [showExitModal, setShowExitModal] = useState(false);

  // Initialize Quiz Engine
  const {
    session,
    currentQuestion,
    questionNumber,
    totalQuestions,
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
    streak,
    characterPose,
    inputRef,
    submitAnswer,
    advanceNow,
  } = useQuizEngine({
    session: propSession,
    profile,
    soundEnabled: settings ? settings.soundEnabled : soundEnabled,
    onFinishQuiz,
    onCancelQuiz,
  });

  const upcomingQuestions = session.questions.slice(session.currentIndex + 1, session.currentIndex + 3);

  // Guard exit handler (catches accidental browser back/popstate)
  const handleGuardTriggerExit = () => {
    setShowExitModal(true);
  };

  // Header explicit 'X' button exit handler
  const handleHeaderExitClick = () => {
    if (settings?.confirmExitQuiz === false) {
      onCancelQuiz();
    } else {
      setShowExitModal(true);
    }
  };

  const handleConfirmExit = () => {
    setShowExitModal(false);
    onCancelQuiz();
  };

  return (
    <div 
      onClick={() => {
        if (settings?.autoFocusAnswer !== false && inputRef.current) {
          inputRef.current.focus({ preventScroll: true });
        }
      }}
      className="relative w-full min-h-[100dvh] max-h-[100dvh] overflow-y-auto md:overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col justify-start pt-safe pb-safe px-3 sm:px-6 transition-colors select-none"
    >
      {/* 1. Navigation Guard (blocks browser popstate / back swipe) */}
      <QuizGuard isActive={true} onAttemptExit={handleGuardTriggerExit} />

      {/* 2. Top Header & Progress */}
      <div className="w-full max-w-xl mx-auto pt-1 sm:pt-2">
        <QuizHeader
          questionNumber={questionNumber}
          totalQuestions={totalQuestions}
          mode={mode}
          streak={streak}
          onExitClick={handleHeaderExitClick}
        />
      </div>

      {/* 3. Main Center Area: Card placed directly 2-3mm below progress bar */}
      <div className="w-full max-w-xl mx-auto flex-1 flex flex-col justify-start mt-1 sm:mt-1.5 pb-3">
        <QuizCardStack
          currentQuestion={currentQuestion}
          upcomingQuestions={upcomingQuestions}
          isAdvancing={isAdvancing}
          feedbackStatus={feedbackStatus}
          characterGender={settings?.showQuizCharacter !== false ? profile.gender : undefined}
          characterPose={characterPose}
          characterMessage={settings?.showQuizCharacter !== false ? feedbackMessage : null}
          isPractice={isPractice}
          currentAttempts={currentAttempts}
          maxAttempts={maxAttempts}
        >
          <AnswerInput
            inputRef={inputRef}
            value={userAnswer}
            onChange={setUserAnswer}
            onSubmit={() => submitAnswer()}
            onAdvanceNow={advanceNow}
            isSubmitting={isSubmitting}
            isAdvancing={isAdvancing}
            revealedAnswer={revealedAnswer}
            feedbackStatus={feedbackStatus}
            isPractice={isPractice}
            attemptsLeft={maxAttempts - currentAttempts}
          />
        </QuizCardStack>
      </div>

      {/* 4. Bottom Safe Space for virtual numeric keyboard */}
      <div className="h-2 sm:h-4 shrink-0" aria-hidden="true" />

      {/* 5. Safe Exit Confirmation Modal */}
      <ExitConfirmationModal
        isOpen={showExitModal}
        mode={mode}
        onCancel={() => setShowExitModal(false)}
        onConfirm={handleConfirmExit}
      />
    </div>
  );
};

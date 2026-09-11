/**
 * QuizActiveScreen component for Math Hero.
 * Connects directly to the dedicated Quiz Engine (useQuizEngine).
 * Provides responsive layout:
 * - Minimal distance between progress bar and card stack.
 * - Automatic keyboard activation and persistent focus across card transitions.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { QuizPreset, QuizResult, UserProfile, QuizSession, AppSettings } from '../types';
import { useQuizEngine } from '../quiz/quizEngine';
import { QuizGuard } from '../components/QuizGuard';
import { QuizHeader } from '../components/quiz/QuizHeader';
import { QuizCardStack } from '../components/quiz/QuizCardStack';
import { AnswerInput } from '../components/quiz/AnswerInput';
import { VirtualKeyboard } from '../components/quiz/VirtualKeyboard';
import { ExitConfirmationModal } from '../components/quiz/ExitConfirmationModal';
import { QuizMotivationalSplash } from '../components/quiz/QuizMotivationalSplash';
import { sound } from '../utils/sound';

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
  const [showMotivationalSplash, setShowMotivationalSplash] = useState(true);

  // Always reset motivational splash when a new quiz session is started
  useEffect(() => {
    setShowMotivationalSplash(true);
  }, [propSession?.id, propSession?.startTime]);

  useEffect(() => {
    const resetScroll = () => {
      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
      const root = document.getElementById('root');
      if (root) root.scrollTop = 0;
      const container = document.getElementById('active-screen-container');
      if (container) container.scrollTop = 0;
    };

    resetScroll();
    window.addEventListener('scroll', resetScroll);
    window.addEventListener('resize', resetScroll);

    const origHtmlOverflow = document.documentElement.style.overflow;
    const origBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('scroll', resetScroll);
      window.removeEventListener('resize', resetScroll);
      document.documentElement.style.overflow = origHtmlOverflow;
      document.body.style.overflow = origBodyOverflow;
    };
  }, []);

  // Initialize Quiz Engine
  const {
    currentQuestion,
    upcomingQuestions,
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
    resetQuestionTimer,
  } = useQuizEngine({
    session: propSession,
    profile,
    soundEnabled: settings ? settings.soundEnabled : soundEnabled,
    onFinishQuiz,
    onCancelQuiz,
  });

  const handleStartFromSplash = useCallback(() => {
    sound.playClick(settings ? settings.soundEnabled : soundEnabled);
    setShowMotivationalSplash(false);
    resetQuestionTimer();
  }, [resetQuestionTimer, settings, soundEnabled]);

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
    <>
      {showMotivationalSplash && (
        <QuizMotivationalSplash
          session={propSession}
          mode={mode}
          totalQuestions={totalQuestions}
          onStartQuiz={handleStartFromSplash}
          onExit={onCancelQuiz}
        />
      )}

      <div 
        onClick={() => {
          if (!showMotivationalSplash && settings?.autoFocusAnswer !== false && inputRef.current) {
            inputRef.current.focus({ preventScroll: true });
          }
        }}
        id="active-screen-container"
        className="fixed inset-0 z-50 w-full h-full overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col justify-between px-2 sm:px-4 transition-colors select-none"
        style={{
          paddingTop: 'max(0.15rem, env(safe-area-inset-top, 0px))',
          paddingBottom: 'max(3px, env(safe-area-inset-bottom, 0px))',
        }}
      >
        {/* 1. Navigation Guard (blocks browser popstate / back swipe) */}
        <QuizGuard isActive={true} onAttemptExit={handleGuardTriggerExit} />

        {/* 2. Connected Dots Bar (Top header) - Fixed small header */}
        <div className="w-full max-w-xl mx-auto shrink-0 pt-0.5 h-[3vh] min-h-[28px] max-h-[36px] flex items-center">
          <QuizHeader
            questionNumber={questionNumber}
            totalQuestions={totalQuestions}
            mode={mode}
            streak={streak}
            onExitClick={handleHeaderExitClick}
          />
        </div>

        {/* 3. Main Center Area: Card stack - STRICT 55% OF TOTAL SCREEN HEIGHT (55vh) */}
        <div className="w-full max-w-3xl lg:max-w-4xl mx-auto h-[55vh] shrink-0 my-0 overflow-hidden flex flex-col justify-center">
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
            streak={streak}
            userAnswer={userAnswer}
            onExit={handleHeaderExitClick}
          />
        </div>

        {/* 4. Custom Virtual Numeric Keyboard with Answer Input - STRICT 42% OF TOTAL SCREEN HEIGHT (42vh) */}
        <div className="w-full max-w-md lg:max-w-lg mx-auto h-[42vh] shrink-0 flex flex-col justify-end pb-0 mb-0 overflow-hidden">
          <VirtualKeyboard
            onInputDigit={(digit) => {
              if (!isSubmitting && !isAdvancing && revealedAnswer === null) {
                setUserAnswer((prev) => (prev.length < 6 ? prev + digit : prev));
              }
            }}
            onBackspace={() => {
              if (!isSubmitting && !isAdvancing && revealedAnswer === null) {
                setUserAnswer((prev) => prev.slice(0, -1));
              }
            }}
            onSubmit={() => {
              if (revealedAnswer !== null) {
                advanceNow();
              } else if (!isSubmitting && !isAdvancing && userAnswer.trim() !== '') {
                submitAnswer();
              }
            }}
            onExit={handleHeaderExitClick}
            disabled={isSubmitting || isAdvancing}
            submitDisabled={userAnswer.trim() === '' && revealedAnswer === null}
            isPractice={isPractice}
            submitLabel={revealedAnswer !== null ? 'بعدی' : 'ثبت جواب'}
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
          </VirtualKeyboard>
        </div>

        {/* 5. Safe Exit Confirmation Modal */}
        <ExitConfirmationModal
          isOpen={showExitModal}
          mode={mode}
          onCancel={() => setShowExitModal(false)}
          onConfirm={handleConfirmExit}
        />
      </div>
    </>
  );
};

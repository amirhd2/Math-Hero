/**
 * QuizActiveScreen component for Math Hero.
 * Connects directly to the dedicated Quiz Engine (useQuizEngine).
 * Provides responsive layouts across all 4 modes:
 * 1. Mobile Portrait: Compact card in upper viewport, keyboard in lower, no viewport jump.
 * 2. Mobile Landscape: Balanced side-by-side layout, zero vertical overflow.
 * 3. Tablet Portrait: Spacious centered tactile card stack.
 * 4. Tablet Landscape: 2-column composition with prominent character companion.
 */

import React, { useState } from 'react';
import { QuizPreset, QuizResult, UserProfile, QuizSession } from '../types';
import { useQuizEngine } from '../quiz/quizEngine';
import { QuizGuard } from '../components/QuizGuard';
import { QuizHeader } from '../components/quiz/QuizHeader';
import { QuizCardStack } from '../components/quiz/QuizCardStack';
import { AnswerInput } from '../components/quiz/AnswerInput';
import { QuizCharacterCompanion } from '../components/quiz/QuizCharacterCompanion';
import { ExitConfirmationModal } from '../components/quiz/ExitConfirmationModal';

interface QuizActiveScreenProps {
  preset?: QuizPreset;
  session?: QuizSession;
  profile: UserProfile;
  soundEnabled: boolean;
  onFinishQuiz: (result: QuizResult) => void;
  onCancelQuiz: () => void;
}

export const QuizActiveScreen: React.FC<QuizActiveScreenProps> = ({
  session: propSession,
  profile,
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
    soundEnabled,
    onFinishQuiz,
    onCancelQuiz,
  });

  const upcomingQuestions = session.questions.slice(session.currentIndex + 1, session.currentIndex + 3);

  const handleTriggerExit = () => {
    setShowExitModal(true);
  };

  const handleConfirmExit = () => {
    setShowExitModal(false);
    onCancelQuiz();
  };

  return (
    <div className="relative w-full min-h-[100dvh] max-h-[100dvh] overflow-y-auto md:overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col justify-between pt-safe pb-safe px-3 sm:px-6 transition-colors select-none">
      {/* 1. Navigation Guard (blocks browser popstate / back swipe) */}
      <QuizGuard isActive={true} onAttemptExit={handleTriggerExit} />

      {/* 2. Top Header & Progress */}
      <div className="w-full max-w-4xl mx-auto pt-3 sm:pt-4">
        <QuizHeader
          questionNumber={questionNumber}
          totalQuestions={totalQuestions}
          mode={mode}
          streak={streak}
          onExitClick={handleTriggerExit}
        />
      </div>

      {/* 3. Main Center Area with 4-Mode Responsive Handling */}
      <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col justify-center py-2 sm:py-4">
        {/* Layout A: Large Screens / Tablet Landscape (2-column side-by-side) */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Character Companion & Encouragement */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <QuizCharacterCompanion
              gender={profile.gender}
              pose={characterPose}
              message={feedbackMessage}
              variant="full"
            />
          </div>

          {/* Right Column: Active Card Stack & Input */}
          <div className="lg:col-span-8">
            <QuizCardStack
              currentQuestion={currentQuestion}
              upcomingQuestions={upcomingQuestions}
              isAdvancing={isAdvancing}
              feedbackStatus={feedbackStatus}
            >
              {/* Contextual Feedback Hint (Practice Mode) */}
              {feedbackMessage && isPractice && (
                <div
                  className={`text-center text-xs font-black p-2.5 rounded-2xl mb-3 transition-all ${
                    feedbackStatus === 'correct'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                      : revealedAnswer !== null || feedbackStatus === 'revealed'
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                      : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                  }`}
                >
                  {feedbackMessage}
                </div>
              )}

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
        </div>

        {/* Layout B: Mobile Portrait, Mobile Landscape & Tablet Portrait */}
        <div className="lg:hidden flex flex-col items-center justify-center w-full space-y-3">
          {/* Micro Character Banner (compact, prevents pushing math card offscreen) */}
          <div className="w-full max-w-xl flex items-center justify-between px-1">
            <QuizCharacterCompanion
              gender={profile.gender}
              pose={characterPose}
              message={feedbackMessage}
              variant="compact"
            />

            {/* Subtle practice attempts indicator */}
            {isPractice && (
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
                تلاش {currentAttempts + 1} از {maxAttempts}
              </span>
            )}
          </div>

          {/* Card Stack */}
          <div className="w-full">
            <QuizCardStack
              currentQuestion={currentQuestion}
              upcomingQuestions={upcomingQuestions}
              isAdvancing={isAdvancing}
              feedbackStatus={feedbackStatus}
            >
              {/* Practice hint */}
              {feedbackMessage && isPractice && (
                <div
                  className={`text-center text-xs font-black p-2.5 rounded-2xl mb-3 transition-all ${
                    feedbackStatus === 'correct'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                      : revealedAnswer !== null || feedbackStatus === 'revealed'
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                      : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                  }`}
                >
                  {feedbackMessage}
                </div>
              )}

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
        </div>
      </div>

      {/* 4. Bottom Safe Cushion (leaves room for mobile numeric keyboard without bounce) */}
      <div className="h-4 sm:h-6 shrink-0" aria-hidden="true" />

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

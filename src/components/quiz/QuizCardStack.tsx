/**
 * QuizCardStack Component.
 * Implements a tactile 3D card stack visual with subtle background cards,
 * and the falling-leaf transition with realistic edge-folding illusion.
 * Incorporates the Hero Character companion directly inside the card corner.
 */

import React from 'react';
import { QuizQuestion, CharacterGender, CharacterPose } from '../../types';
import { QuestionRenderer } from './QuestionRenderer';
import { toPersianDigits } from '../../utils/persian';

interface QuizCardStackProps {
  currentQuestion: QuizQuestion;
  upcomingQuestions: QuizQuestion[];
  isAdvancing: boolean;
  feedbackStatus: 'idle' | 'correct' | 'incorrect' | 'revealed';
  characterGender?: CharacterGender;
  characterPose?: CharacterPose;
  characterMessage?: string | null;
  isPractice?: boolean;
  currentAttempts?: number;
  maxAttempts?: number;
  children: React.ReactNode;
}

export const QuizCardStack: React.FC<QuizCardStackProps> = ({
  currentQuestion,
  upcomingQuestions,
  isAdvancing,
  feedbackStatus,
  characterGender = 'boy',
  characterPose = 'thinking',
  characterMessage,
  isPractice = false,
  currentAttempts = 0,
  maxAttempts = 3,
  children,
}) => {
  const hasNextCard = upcomingQuestions.length > 0;
  const hasSecondNextCard = upcomingQuestions.length > 1;

  // Visual border feedback state
  let feedbackRingClass = '';
  if (feedbackStatus === 'correct') {
    feedbackRingClass = 'ring-4 ring-emerald-500/80 shadow-emerald-500/20';
  } else if (feedbackStatus === 'incorrect') {
    feedbackRingClass = 'ring-4 ring-rose-500/80 shadow-rose-500/20 animate-shake';
  } else if (feedbackStatus === 'revealed') {
    feedbackRingClass = 'ring-4 ring-amber-500/80 shadow-amber-500/20';
  }

  // Character pose mapping
  const getPoseEmoji = () => {
    switch (characterPose) {
      case 'celebrating':
        return '🎉';
      case 'encouraging':
        return '💪';
      case 'sad':
        return '💭';
      case 'thinking':
      default:
        return characterGender === 'boy' ? '👦' : '👧';
    }
  };

  const handleCardClick = () => {
    const inputEl = document.getElementById('math-quiz-numeric-input') as HTMLInputElement | null;
    if (inputEl) {
      inputEl.focus({ preventScroll: true });
    }
  };

  return (
    <div className="relative w-full max-w-xl mx-auto select-none">
      {/* Background Stack Card 2 (furthest back - peeks out from bottom/left corners) */}
      {hasSecondNextCard && (
        <div
          aria-hidden="true"
          className={`absolute inset-0 rounded-3xl -z-20 bg-slate-100/95 dark:bg-slate-800/90 border border-slate-300/70 dark:border-slate-700/70 shadow-md pointer-events-none transition-all duration-500 ease-out transform ${
            isAdvancing
              ? 'translate-y-1.5 translate-x-2 rotate-[1.8deg] scale-[0.98] opacity-90'
              : 'translate-y-3.5 -translate-x-2 -rotate-[2.2deg] scale-[0.95] opacity-60'
          }`}
        >
          {/* Subtle top border decorative accent */}
          <div className="absolute top-3 left-6 right-6 h-1 bg-slate-200/60 dark:bg-slate-700/50 rounded-full opacity-40" />
        </div>
      )}

      {/* Background Stack Card 1 (immediately behind active card - peeks out from right corner and scales up to front on advance) */}
      {hasNextCard && (
        <div
          aria-hidden="true"
          className={`absolute inset-0 rounded-3xl -z-10 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-lg pointer-events-none transition-all duration-500 ease-out transform ${
            isAdvancing
              ? 'translate-y-0 translate-x-0 rotate-0 scale-100 opacity-100 shadow-2xl z-0'
              : 'translate-y-1.5 translate-x-2 rotate-[1.8deg] scale-[0.98] opacity-90'
          }`}
        >
          {/* Faint preview indicator inside the waiting card */}
          <div className="p-6 opacity-30 flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800" />
            <div className="w-20 h-4 rounded-full bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      )}

      {/* Top Calendar Binding Bar & Hanging Rings (حلقه و شیرازه تقویم دیواری/رومیزی) */}
      <div 
        aria-hidden="true" 
        className="relative z-10 flex items-center justify-center gap-12 sm:gap-16 -mb-2.5 pointer-events-none"
      >
        {/* Left Calendar Ring */}
        <div className="flex flex-col items-center">
          <div className="w-3 sm:w-3.5 h-5 sm:h-6 rounded-full bg-gradient-to-b from-slate-400 via-slate-300 to-slate-400 dark:from-slate-600 dark:via-slate-500 dark:to-slate-700 shadow-md border border-slate-400/50 dark:border-slate-600/50" />
        </div>
        {/* Center subtle tear perforation indicator */}
        <div className="h-0.5 w-16 sm:w-24 border-t-2 border-dashed border-slate-300/80 dark:border-slate-700/80 opacity-60" />
        {/* Right Calendar Ring */}
        <div className="flex flex-col items-center">
          <div className="w-3 sm:w-3.5 h-5 sm:h-6 rounded-full bg-gradient-to-b from-slate-400 via-slate-300 to-slate-400 dark:from-slate-600 dark:via-slate-500 dark:to-slate-700 shadow-md border border-slate-400/50 dark:border-slate-600/50" />
        </div>
      </div>

      {/* Primary Active Quiz Card (Calendar Leaf / برگه تقویم) */}
      <div
        onClick={handleCardClick}
        className={`relative w-full bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 md:p-7 shadow-xl border border-slate-200/80 dark:border-slate-800 transition-all duration-300 cursor-text ${feedbackRingClass} ${
          isAdvancing ? 'animate-calendar-tear-fall pointer-events-none' : 'scale-100 opacity-100'
        }`}
      >
        {/* Top Perforated Line Effect for Calendar Page */}
        <div 
          aria-hidden="true" 
          className="absolute top-0 left-6 right-6 h-[1px] border-t border-dashed border-slate-200 dark:border-slate-800 opacity-70 pointer-events-none" 
        />
        {/* Top Internal Header inside Card: Character on Corner & Practice Indicator */}
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800/80">
          {/* Corner Character Avatar + Speech Bubble */}
          <div className="flex items-center gap-2">
            <div 
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center text-lg sm:text-xl shadow-xs transition-transform duration-300 border ${
                characterPose === 'celebrating'
                  ? 'bg-amber-400 text-slate-950 scale-110 border-amber-300 animate-bounce'
                  : characterPose === 'encouraging'
                  ? 'bg-blue-500 text-white border-blue-400 animate-pulse'
                  : characterPose === 'sad'
                  ? 'bg-indigo-400 text-white border-indigo-300'
                  : 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white border-indigo-400/40'
              }`}
            >
              {getPoseEmoji()}
            </div>

            {/* In-Card Speech / Feedback Bubble */}
            {characterMessage ? (
              <div
                className={`text-[11px] sm:text-xs font-bold px-2.5 py-1 rounded-xl border shadow-2xs animate-fade-in ${
                  feedbackStatus === 'correct'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                    : feedbackStatus === 'incorrect' || characterPose === 'encouraging'
                    ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                {characterMessage}
              </div>
            ) : (
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
                قهرمان همراه
              </span>
            )}
          </div>

          {/* Practice Attempt or Status Counter in opposite corner */}
          {isPractice ? (
            <span className="text-[11px] sm:text-xs font-bold px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              تلاش {toPersianDigits(currentAttempts + 1)} از {toPersianDigits(maxAttempts)}
            </span>
          ) : (
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
              آزمون
            </span>
          )}
        </div>

        {/* Math Question Presentation */}
        <div className="mb-3 sm:mb-5">
          <QuestionRenderer question={currentQuestion} />
        </div>

        {/* Answer Input & Controls Container */}
        <div>{children}</div>
      </div>
    </div>
  );
};

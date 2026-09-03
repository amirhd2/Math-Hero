/**
 * QuizCardStack Component.
 * Implements a tactile 3D card stack visual with subtle background cards,
 * and the falling-leaf transition with realistic edge-folding illusion.
 */

import React from 'react';
import { QuizQuestion } from '../../types';
import { QuestionRenderer } from './QuestionRenderer';

interface QuizCardStackProps {
  currentQuestion: QuizQuestion;
  upcomingQuestions: QuizQuestion[];
  isAdvancing: boolean;
  feedbackStatus: 'idle' | 'correct' | 'incorrect' | 'revealed';
  children: React.ReactNode;
}

export const QuizCardStack: React.FC<QuizCardStackProps> = ({
  currentQuestion,
  upcomingQuestions,
  isAdvancing,
  feedbackStatus,
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

  return (
    <div className="relative w-full max-w-xl mx-auto select-none">
      {/* Background Stack Card 2 (furthest back) */}
      {hasSecondNextCard && (
        <div
          aria-hidden="true"
          className="absolute -bottom-3 left-4 right-4 h-24 bg-slate-200/60 dark:bg-slate-800/40 rounded-3xl -z-20 transform translate-y-2 scale-[0.92] opacity-40 blur-[0.5px] border border-slate-300/40 dark:border-slate-700/40 pointer-events-none transition-all duration-300"
        />
      )}

      {/* Background Stack Card 1 (immediately behind active card) */}
      {hasNextCard && (
        <div
          aria-hidden="true"
          className={`absolute -bottom-1.5 left-2 right-2 h-28 bg-white/70 dark:bg-slate-900/60 rounded-3xl -z-10 transform translate-y-1.5 scale-[0.96] opacity-75 shadow-md border border-slate-200/60 dark:border-slate-800/60 pointer-events-none transition-all duration-300 ${
            isAdvancing ? 'scale-100 translate-y-0 opacity-100 duration-500' : ''
          }`}
        />
      )}

      {/* Primary Active Quiz Card */}
      <div
        onClick={() => {
          const inputEl = document.getElementById('math-quiz-numeric-input') as HTMLInputElement | null;
          if (inputEl && !inputEl.disabled) {
            inputEl.focus();
          }
        }}
        className={`relative w-full bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 md:p-8 shadow-xl border border-slate-200/80 dark:border-slate-800 transition-all duration-300 cursor-text ${feedbackRingClass} ${
          isAdvancing ? 'animate-falling-leaf pointer-events-none' : 'scale-100 opacity-100'
        }`}
      >
        {/* Subtle decorative folded-edge illusion accent on top corner */}
        <div
          aria-hidden="true"
          className="absolute -top-[1px] -left-[1px] w-6 h-6 overflow-hidden rounded-tl-3xl pointer-events-none opacity-40 dark:opacity-20"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-slate-400/50 to-transparent -rotate-45 transform origin-top-left" />
        </div>

        {/* Math Question Presentation */}
        <div className="mb-4 sm:mb-6">
          <QuestionRenderer question={currentQuestion} />
        </div>

        {/* Answer Input & Controls Container */}
        <div>{children}</div>
      </div>
    </div>
  );
};

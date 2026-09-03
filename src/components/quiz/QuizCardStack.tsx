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
      {/* Background Stack Card 2 (furthest back) */}
      {hasSecondNextCard && (
        <div
          aria-hidden="true"
          className="absolute -bottom-2.5 left-4 right-4 h-20 bg-slate-200/60 dark:bg-slate-800/40 rounded-3xl -z-20 transform translate-y-2 scale-[0.92] opacity-40 blur-[0.5px] border border-slate-300/40 dark:border-slate-700/40 pointer-events-none transition-all duration-300"
        />
      )}

      {/* Background Stack Card 1 (immediately behind active card) */}
      {hasNextCard && (
        <div
          aria-hidden="true"
          className={`absolute -bottom-1 left-2 right-2 h-24 bg-white/70 dark:bg-slate-900/60 rounded-3xl -z-10 transform translate-y-1 scale-[0.96] opacity-75 shadow-md border border-slate-200/60 dark:border-slate-800/60 pointer-events-none transition-all duration-300 ${
            isAdvancing ? 'scale-100 translate-y-0 opacity-100 duration-500' : ''
          }`}
        />
      )}

      {/* Primary Active Quiz Card */}
      <div
        onClick={handleCardClick}
        className={`relative w-full bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 md:p-7 shadow-xl border border-slate-200/80 dark:border-slate-800 transition-all duration-300 cursor-text ${feedbackRingClass} ${
          isAdvancing ? 'animate-falling-leaf pointer-events-none' : 'scale-100 opacity-100'
        }`}
      >
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

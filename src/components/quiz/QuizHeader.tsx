/**
 * QuizHeader component.
 * Houses the safe exit trigger, mode indicator, streak counter,
 * and lightweight responsive progress indicator.
 */

import React from 'react';
import { QuizMode } from '../../types';
import { toPersianDigits } from '../../utils/persian';

interface QuizHeaderProps {
  questionNumber: number;
  totalQuestions: number;
  mode: QuizMode;
  streak: number;
  onExitClick: () => void;
}

export const QuizHeader: React.FC<QuizHeaderProps> = ({
  questionNumber,
  totalQuestions,
  mode,
  streak,
  onExitClick,
}) => {
  const isPractice = mode === 'practice';
  const progressPercent = Math.min(100, Math.round((questionNumber / totalQuestions) * 100));

  return (
    <div className="w-full space-y-2 mb-1 sm:mb-1.5 select-none">
      {/* Top action row */}
      <div className="flex items-center justify-between gap-2">
        {/* Exit Button with clear warning indicator */}
        <button
          type="button"
          onClick={onExitClick}
          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-100 dark:bg-slate-800 dark:hover:bg-rose-950/60 text-slate-600 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-300 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
          title="خروج از آزمون"
        >
          <span>✕</span>
          <span className="hidden xs:inline">خروج</span>
        </button>

        {/* Center: Streak Counter (if >= 2) */}
        {streak >= 2 && (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-black shadow-xs animate-bounce">
            <span>🔥</span>
            <span>{toPersianDigits(streak)} متوالی!</span>
          </div>
        )}

        {/* Mode & Question Counter Badge */}
        <div className="flex items-center gap-2">
          <span
            className={`text-[11px] sm:text-xs px-2.5 py-1 rounded-full font-black border ${
              isPractice
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
            }`}
          >
            {isPractice ? 'تمرین یادگیری 🌱' : 'آزمون استاندارد 🎯'}
          </span>

          <span className="text-xs sm:text-sm font-black text-slate-700 dark:text-slate-200">
            سوال {toPersianDigits(questionNumber)} از {toPersianDigits(totalQuestions)}
          </span>
        </div>
      </div>

      {/* Lightweight Smooth Progress Bar */}
      <div className="w-full bg-slate-200/80 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden shadow-inner">
        <div
          className={`h-full transition-all duration-300 ease-out rounded-full ${
            isPractice ? 'bg-emerald-500' : 'bg-indigo-600'
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};

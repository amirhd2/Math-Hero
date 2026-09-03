/**
 * QuestionRenderer component.
 * Renders mathematical expressions with child-friendly typography, clear RTL flow,
 * distinct operation badges, and smart layout (vertical column for large numbers, horizontal for standard).
 */

import React from 'react';
import { QuizQuestion, OperationType } from '../../types';
import { toPersianDigits } from '../../utils/persian';

interface QuestionRendererProps {
  question: QuizQuestion;
  className?: string;
}

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({ question, className = '' }) => {
  const { num1, num2, operation } = question;

  const getOpBadge = (op: OperationType) => {
    switch (op) {
      case 'addition':
        return {
          symbol: '+',
          label: 'جمع',
          icon: '➕',
          bg: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
        };
      case 'subtraction':
        return {
          symbol: '−',
          label: 'تفریق',
          icon: '➖',
          bg: 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
        };
      case 'multiplication':
        return {
          symbol: '×',
          label: 'ضرب',
          icon: '✖️',
          bg: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
        };
      case 'division':
        return {
          symbol: '÷',
          label: 'تقسیم',
          icon: '➗',
          bg: 'bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-800',
        };
      default:
        return {
          symbol: '+',
          label: 'ریاضی',
          icon: '⭐',
          bg: 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200',
        };
    }
  };

  const badge = getOpBadge(operation);

  // Determine if column layout is preferable (multi-digit addition or subtraction)
  const isMultiDigit = num1 >= 10 || num2 >= 10;
  const isAdditionOrSubtraction = operation === 'addition' || operation === 'subtraction';
  const showColumnFormat = isMultiDigit && isAdditionOrSubtraction;

  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      {/* Operation badge */}
      <div
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-black border mb-4 shadow-2xs ${badge.bg}`}
      >
        <span>{badge.icon}</span>
        <span>{badge.label}</span>
      </div>

      {showColumnFormat ? (
        /* Vertical Column Math Layout (Traditional textbook style with operator on left) */
        <div
          dir="ltr"
          className="inline-flex flex-col items-end text-3xl sm:text-5xl md:text-6xl font-black text-slate-800 dark:text-slate-100 tracking-wider px-6 py-2"
        >
          {/* Top operand */}
          <div className="w-full text-right px-2 py-1 leading-none font-mono">
            {toPersianDigits(num1)}
          </div>

          {/* Bottom operand with operator on the left */}
          <div className="flex items-center justify-between w-full gap-6 px-2 py-1 leading-none font-mono">
            <span className="text-indigo-600 dark:text-indigo-400 text-2xl sm:text-4xl select-none">
              {badge.symbol}
            </span>
            <span className="text-right">{toPersianDigits(num2)}</span>
          </div>

          {/* Horizontal calculation line */}
          <div className="w-full h-1 sm:h-1.5 bg-slate-800 dark:bg-slate-200 rounded-full my-2" />

          {/* Result placeholder */}
          <div className="w-full text-center text-indigo-600 dark:text-indigo-400 font-extrabold text-2xl sm:text-4xl py-1">
            ؟
          </div>
        </div>
      ) : (
        /* Horizontal Equation Layout (Left to Right: num1 op num2 = ?) */
        <div
          dir="ltr"
          className="flex items-center justify-center gap-2 sm:gap-4 text-3xl sm:text-5xl md:text-6xl font-black text-slate-800 dark:text-slate-100 tracking-wider py-2"
        >
          <span className="px-3 sm:px-5 py-2 bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
            {toPersianDigits(num1)}
          </span>
          <span className="text-indigo-600 dark:text-indigo-400 font-bold px-1 sm:px-2">
            {badge.symbol}
          </span>
          <span className="px-3 sm:px-5 py-2 bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
            {toPersianDigits(num2)}
          </span>
          <span className="text-slate-400 dark:text-slate-500 font-light px-1">
            =
          </span>
          <span className="px-3 sm:px-4 py-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-200 dark:border-indigo-800/60 shadow-xs">
            ؟
          </span>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { QuizQuestion, OperationType } from '../../types';
import { toPersianDigits } from '../../utils/persian';

interface QuestionRendererProps {
  question: QuizQuestion;
  className?: string;
}

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({ question, className = '' }) => {
  const { num1, num2, operation } = question;

  const getOpSymbol = (op: OperationType) => {
    switch (op) {
      case 'addition':
        return '+';
      case 'subtraction':
        return '−';
      case 'multiplication':
        return '×';
      case 'division':
        return '÷';
      default:
        return '+';
    }
  };

  const symbol = getOpSymbol(operation);

  // Determine if column layout is preferable (multi-digit addition or subtraction)
  const isMultiDigit = num1 >= 10 || num2 >= 10;
  const isAdditionOrSubtraction = operation === 'addition' || operation === 'subtraction';
  const showColumnFormat = isMultiDigit && isAdditionOrSubtraction;

  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
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
              {symbol}
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
        /* Horizontal Equation Layout (Stacked: line 1: num1 op num2, line 2: = ?) */
        <div
          dir="ltr"
          className="flex flex-col items-center justify-center gap-2 sm:gap-4 text-3xl sm:text-5xl md:text-6xl font-black text-slate-800 dark:text-slate-100 tracking-wider py-2"
        >
          <div className="flex items-center justify-center gap-2 sm:gap-4">
            <span className="px-3 sm:px-5 py-2 bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
              {toPersianDigits(num1)}
            </span>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold px-1 sm:px-2">
              {symbol}
            </span>
            <span className="px-3 sm:px-5 py-2 bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
              {toPersianDigits(num2)}
            </span>
          </div>
          <div className="flex items-center justify-center gap-2 sm:gap-4 mt-2">
            <span className="text-slate-400 dark:text-slate-500 font-light px-1">
              =
            </span>
            <span className="px-3 sm:px-4 py-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-200 dark:border-indigo-800/60 shadow-xs">
              ؟
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

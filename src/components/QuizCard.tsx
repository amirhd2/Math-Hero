/**
 * QuizCard Component with Falling-Leaf Transition and Stable Keyboard Layout
 */

import React from 'react';
import { QuizQuestion } from '../types';
import { formatExpression } from '../utils/persian';

interface QuizCardProps {
  question: QuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  isExiting: boolean;
  children: React.ReactNode;
}

export const QuizCard: React.FC<QuizCardProps> = ({
  question,
  questionNumber,
  totalQuestions,
  isExiting,
  children,
}) => {
  const opSymbol =
    question.operation === 'addition' ? '+' :
    question.operation === 'subtraction' ? '-' :
    question.operation === 'multiplication' ? '×' : '÷';

  return (
    <div
      className={`w-full max-w-xl mx-auto bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 transition-all duration-300 ${
        isExiting ? 'animate-falling-leaf pointer-events-none' : 'scale-100 opacity-100'
      }`}
    >
      {/* Quiz Card Header / Progress */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
          سوال {questionNumber} از {totalQuestions}
        </span>
        <div className="w-32 bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-indigo-600 h-full transition-all duration-300 rounded-full"
            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Math Expression Display */}
      <div className="text-center my-8">
        <div className="inline-flex items-center justify-center gap-4 text-4xl md:text-6xl font-black text-slate-800 dark:text-slate-100 tracking-wider">
          <span className="px-4 py-2 bg-slate-50 dark:bg-slate-800/60 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700/60">
            {question.num1}
          </span>
          <span className="text-indigo-600 dark:text-indigo-400 font-bold">{opSymbol}</span>
          <span className="px-4 py-2 bg-slate-50 dark:bg-slate-800/60 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700/60">
            {question.num2}
          </span>
          <span className="text-indigo-500">=</span>
          <span className="text-indigo-600 dark:text-indigo-400">؟</span>
        </div>
      </div>

      {/* Answer Input Area & Actions */}
      <div className="mt-6">
        {children}
      </div>
    </div>
  );
};

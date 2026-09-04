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
    
  const opIcon = 
    question.operation === 'addition' ? '➕' :
    question.operation === 'subtraction' ? '➖' :
    question.operation === 'multiplication' ? '✖️' : '➗';
    
  const opBg = 
    question.operation === 'addition' ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' :
    question.operation === 'subtraction' ? 'bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-800' :
    question.operation === 'multiplication' ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800' : 
    'bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800';

  return (
    <div
      className={`w-full max-w-xl mx-auto bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 transition-all duration-300 ${
        isExiting ? 'animate-calendar-tear-fall pointer-events-none' : 'scale-100 opacity-100'
      }`}
    >
      {/* Quiz Card Header (Operation Icon) */}
      <div className="flex items-center justify-center mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className={`w-12 h-12 flex items-center justify-center rounded-2xl border shadow-sm ${opBg}`}>
            <span className="text-2xl drop-shadow-sm">{opIcon}</span>
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

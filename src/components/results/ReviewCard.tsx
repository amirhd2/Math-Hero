/**
 * ReviewCard component.
 * Displays a single question review item with equation, child's answer vs revealed correct answer,
 * operation badge, step breakdown, and friendly learning hint.
 */

import React from 'react';
import { MistakeRecord, Gender } from '../../types';
import { formatNumber } from '../../utils/persian';
import { Character } from '../Character';

interface ReviewCardProps {
  mistake: MistakeRecord;
  index: number;
  totalMistakes: number;
  gender?: Gender;
  style?: React.CSSProperties;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  mistake,
  index,
  totalMistakes,
  gender = 'boy',
  style,
}) => {
  const { question, userAnswer, questionNumber } = mistake;

  // Determine equation symbol
  const getSymbol = () => {
    switch (question.operation) {
      case 'addition':
        return '+';
      case 'subtraction':
        return '−';
      case 'multiplication':
        return '×';
      case 'division':
        return '÷';
      default:
        return question.operatorSymbol || '+';
    }
  };

  const getOperationBadge = () => {
    switch (question.operation) {
      case 'addition':
        return { label: 'جمع', icon: '➕', color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800' };
      case 'subtraction':
        return { label: 'تفریق', icon: '➖', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800' };
      case 'multiplication':
        return { label: 'ضرب', icon: '✖️', color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800' };
      case 'division':
        return { label: 'تقسیم', icon: '➗', color: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800' };
      default:
        return { label: 'عملیات', icon: '🔢', color: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800' };
    }
  };

  const opBadge = getOperationBadge();

  // Helpful educational hint based on the operation and numbers
  const getEducationalHint = () => {
    switch (question.operation) {
      case 'addition':
        return `راهنما: یکان‌ها (${formatNumber(question.num1 % 10, 'persian')} و ${formatNumber(question.num2 % 10, 'persian')}) را جمع کن؛ سپس دهگان‌ها را با در نظر گرفتن انتقال اضافه کن.`;
      case 'subtraction':
        return `راهنما: از سمت راست شروع کن؛ اگر رقم بالایی کوچک‌تر بود، از رقم بغل یکی قرض بگیر!`;
      case 'multiplication':
        return `راهنما: جدول ضرب ${formatNumber(question.num1, 'persian')} را به یاد بیاور: ${formatNumber(question.num1, 'persian')} ضرب در ${formatNumber(question.num2, 'persian')} برابر است با ${formatNumber(question.correctAnswer, 'persian')}.`;
      case 'division':
        return `راهنما: بپرس چه عددی اگر ضرب در ${formatNumber(question.num2, 'persian')} شود حاصلش ${formatNumber(question.num1, 'persian')} می‌شود؟ پاسخ: ${formatNumber(question.correctAnswer, 'persian')}.`;
    }
  };

  const displayNumber = questionNumber !== undefined ? questionNumber : index + 1;

  return (
    <article
      style={style}
      className="review-card sticky bg-white dark:bg-slate-900 rounded-3xl p-5 md:p-6 border-2 border-slate-200/90 dark:border-slate-800 shadow-xl transition-all duration-300 backdrop-blur-md"
    >
      {/* Card Header: Question Number and Operation Badge */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-black text-sm">
            {formatNumber(displayNumber, 'persian')}
          </span>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            سوال {formatNumber(displayNumber, 'persian')} از {formatNumber(totalMistakes, 'persian')} مورد مرور
          </span>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black border ${opBadge.color}`}
        >
          <span>{opBadge.icon}</span>
          <span>{opBadge.label}</span>
        </span>
      </div>

      {/* Main Equation Layout */}
      <div className="bg-slate-50 dark:bg-slate-950/80 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-200/60 dark:border-slate-800/60">
        {/* The Equation */}
        <div
          dir="ltr"
          className="flex flex-wrap items-center justify-center gap-3 text-2xl md:text-3xl font-black text-slate-800 dark:text-slate-100 tracking-wider"
        >
          <span>{formatNumber(question.num1, 'persian')}</span>
          <span className="text-indigo-600 dark:text-indigo-400 text-3xl">{getSymbol()}</span>
          <span>{formatNumber(question.num2, 'persian')}</span>
          <span className="text-slate-400">=</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-black bg-emerald-100/70 dark:bg-emerald-950/80 px-3 py-1 rounded-xl border border-emerald-300/80 dark:border-emerald-700/80">
            {formatNumber(question.correctAnswer, 'persian')}
          </span>
        </div>

        {/* Answer comparison tags */}
        <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm font-bold w-full md:w-auto justify-center">
          {/* User's Answer */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300">
            <span className="text-xs">پاسخ شما:</span>
            <span className="text-base font-black line-through">
              {formatNumber(userAnswer, 'persian')}
            </span>
          </div>

          {/* Correct Answer */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-300">
            <span className="text-xs">پاسخ درست:</span>
            <span className="text-base font-black">
              {formatNumber(question.correctAnswer, 'persian')}
            </span>
          </div>
        </div>
      </div>

      {/* Helpful learning hint footer with mini character */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-start gap-3">
        <div className="shrink-0 pt-0.5">
          <Character character={gender} pose="thinking" size="sm" />
        </div>
        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
          {getEducationalHint()}
        </p>
      </div>
    </article>
  );
};

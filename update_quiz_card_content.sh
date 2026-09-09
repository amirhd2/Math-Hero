#!/bin/bash
cat << 'INNER_EOF' > src/components/quiz/QuizCardContent.tsx
import React, { useMemo } from 'react';
import { QuizQuestion, CharacterGender } from '../../types';
import { QuestionRenderer } from './QuestionRenderer';
import { MathBackgroundWatermark } from './MathBackgroundWatermark';
import { toPersianDigits, formatNumber } from '../../utils/persian';

interface QuizCardContentProps {
  question: QuizQuestion;
  characterGender?: CharacterGender;
  isPractice?: boolean;
  currentAttempts?: number;
  maxAttempts?: number;
  streak?: number;
  feedbackStatus?: 'idle' | 'correct' | 'incorrect' | 'revealed';
  userAnswer?: string;
}

export const QuizCardContent: React.FC<QuizCardContentProps> = ({
  question,
  characterGender = 'boy',
  isPractice = false,
  currentAttempts = 0,
  maxAttempts = 3,
  streak = 0,
  feedbackStatus = 'idle',
  userAnswer,
}) => {
  const imageId = useMemo(() => {
    let hash = 0;
    const str = question.id;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const absHash = Math.abs(hash);
    if (characterGender === 'boy') {
      const validIds = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
      return validIds[absHash % validIds.length];
    } else {
      const validIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
      return validIds[absHash % validIds.length];
    }
  }, [question.id, characterGender]);

  const getSymbol = () => {
    switch (question.operation) {
      case 'addition': return '+';
      case 'subtraction': return '−';
      case 'multiplication': return '×';
      case 'division': return '÷';
      default: return '+';
    }
  };

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

  return (
    <>
      <MathBackgroundWatermark seed={question.id} />
      
      {/* Full Width Header (Spans across both halves) */}
      <div className="w-full flex flex-row items-center justify-between px-3 sm:px-5 pt-3 sm:pt-4 pb-2 border-b border-slate-100 dark:border-slate-800/80 shrink-0 bg-transparent z-10 relative">
        {/* Right side (RTL): Attempts */}
        <div className="w-1/3 flex justify-start">
          {isPractice ? (
            <span className="text-[10px] sm:text-xs font-bold px-2 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 whitespace-nowrap">
              تلاش {toPersianDigits(currentAttempts + 1)} از {toPersianDigits(maxAttempts)}
            </span>
          ) : (
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
              آزمون
            </span>
          )}
        </div>

        {/* Center: Mode Badge */}
        <div className="w-1/3 flex justify-center">
          <span
            className={`text-[10px] sm:text-[11px] px-3 sm:px-4 py-1.5 rounded-full font-black border shadow-2xs whitespace-nowrap ${
              isPractice
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
            }`}
          >
            {isPractice ? 'تمرین یادگیری 🌱' : 'آزمون استاندارد 🎯'}
          </span>
        </div>

        {/* Left side (RTL): Streak Badge */}
        <div className="w-1/3 flex justify-end">
          {streak >= 2 ? (
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-black shadow-sm animate-bounce border border-amber-300/50 dark:border-amber-700/50 whitespace-nowrap">
              <span>🔥</span>
              <span>{toPersianDigits(streak)} متوالی!</span>
            </div>
          ) : <div />}
        </div>
      </div>

      {/* Main Content Split: Right 60% Math (or 100% if revealed), Left 40% Image (hidden if revealed) */}
      <div className="flex-1 flex flex-row w-full overflow-hidden z-10 relative">
        {feedbackStatus === 'revealed' ? (
          <div className="w-full h-full flex flex-col p-4 overflow-y-auto">
            {/* Mistake Review Layout (Takes full width) */}
            <div className="bg-slate-50 dark:bg-slate-950/80 rounded-2xl p-4 md:p-5 flex flex-col items-center justify-between gap-4 border border-slate-200/60 dark:border-slate-800/60 w-full mb-4 mt-2">
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
              <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm font-bold w-full justify-center">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300">
                  <span className="text-xs">پاسخ شما:</span>
                  <span className="text-base font-black line-through">
                    {userAnswer ? formatNumber(userAnswer, 'persian') : '؟'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-300">
                  <span className="text-xs">پاسخ درست:</span>
                  <span className="text-base font-black">
                    {formatNumber(question.correctAnswer, 'persian')}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-2 pt-3 border-t border-slate-200 dark:border-slate-700/80 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-slate-200">
                <img 
                  src={`/assets/characters/${characterGender}/head.webp`}
                  alt="Character"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                {getEducationalHint()}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Right Half: Math Question Content (60%) */}
            <div className="w-[60%] p-3 sm:p-5 flex flex-col justify-center items-center h-full">
              <div className="my-auto w-full flex items-center justify-center">
                <QuestionRenderer question={question} />
              </div>
            </div>
            
            {/* Left Half: Random Image (40%) */}
            <div className="w-[40%] relative h-full flex flex-col justify-end items-start p-0 m-0 bg-transparent">
              <img 
                src={`/assets/characters/${characterGender}/half-body/${imageId}.webp`} 
                alt="Character"
                className="w-full max-h-[90%] object-contain object-left-bottom absolute left-0 bottom-0 pointer-events-none"
                style={{ margin: 0, padding: 0 }}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
};
INNER_EOF

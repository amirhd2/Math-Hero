import React, { useMemo } from 'react';
import { QuizQuestion, CharacterGender } from '../../types';
import { QuestionRenderer } from './QuestionRenderer';
import { MathBackgroundWatermark } from './MathBackgroundWatermark';
import { toPersianDigits, formatNumber } from '../../utils/persian';
import { getAssetUrl, getFallbackAssetUrl } from '../../utils/assetPaths';

interface QuizCardContentProps {
  question: QuizQuestion;
  characterGender?: CharacterGender;
  isPractice?: boolean;
  currentAttempts?: number;
  maxAttempts?: number;
  streak?: number;
  feedbackStatus?: 'idle' | 'correct' | 'incorrect' | 'revealed';
  userAnswer?: string;
  onExit?: () => void;
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
  onExit,
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

  const remainingAttempts = Math.max(1, maxAttempts - currentAttempts);

  return (
    <>
      <MathBackgroundWatermark seed={question.id} />
      
      {/* Full Width Header (Spans across both halves) */}
      <div className="w-full flex flex-row items-center justify-between px-3 sm:px-5 pt-2.5 sm:pt-3.5 pb-2 border-b border-slate-100 dark:border-slate-800/80 shrink-0 bg-transparent z-10 relative">
        {/* Right side (in RTL): Learning Practice / Standard Quiz Badge */}
        <div className="w-1/3 flex justify-start items-center">
          <span
            className={`text-[10px] sm:text-xs px-2.5 sm:px-3.5 py-1 rounded-full font-black border shadow-2xs whitespace-nowrap ${
              isPractice
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
            }`}
          >
            {isPractice ? 'تمرین یادگیری 🌱' : 'آزمون استاندارد 🎯'}
          </span>
        </div>

        {/* Center (in RTL): Consecutive Streak Badge */}
        <div className="w-1/3 flex justify-center items-center">
          {streak >= 2 ? (
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] sm:text-xs font-black shadow-sm animate-bounce border border-amber-300/50 dark:border-amber-700/50 whitespace-nowrap">
              <span>🔥</span>
              <span>{toPersianDigits(streak)} متوالی!</span>
            </div>
          ) : <div />}
        </div>

        {/* Left side (in RTL): Red Exit Cross Button */}
        <div className="w-1/3 flex justify-end items-center">
          {onExit ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onExit();
              }}
              aria-label="خروج از آزمون"
              title="خروج از آزمون"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white border border-red-500 shadow-sm flex items-center justify-center text-xs sm:text-sm font-black transition-all cursor-pointer shadow-xs active:scale-95"
            >
              ✕
            </button>
          ) : <div className="w-7 h-7" />}
        </div>
      </div>

      {/* Main Content Split: Right 60% Math, Left 40% Image */}
      <div className="flex-1 flex flex-row w-full overflow-hidden z-10 relative">
        {feedbackStatus === 'revealed' ? (
          <>
            {/* Right Half: Mistake Review & Solution Content */}
            <div className="w-[62%] p-2 sm:p-4 flex flex-col justify-between h-full overflow-y-auto">
              <div className="bg-slate-50 dark:bg-slate-950/80 rounded-2xl p-2.5 sm:p-4 flex flex-col items-center justify-center gap-2.5 border border-slate-200/60 dark:border-slate-800/60 w-full my-auto">
                <div
                  dir="ltr"
                  className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xl sm:text-2xl md:text-3xl font-black text-slate-800 dark:text-slate-100 tracking-wider"
                >
                  <span>{formatNumber(question.num1, 'persian')}</span>
                  <span className="text-indigo-600 dark:text-indigo-400 text-2xl sm:text-3xl">{getSymbol()}</span>
                  <span>{formatNumber(question.num2, 'persian')}</span>
                  <span className="text-slate-400">=</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-black bg-emerald-100/70 dark:bg-emerald-950/80 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-xl border border-emerald-300/80 dark:border-emerald-700/80">
                    {formatNumber(question.correctAnswer, 'persian')}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs md:text-sm font-bold w-full justify-center">
                  <div className="flex items-center gap-1 px-2.5 py-1 bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300">
                    <span>پاسخ شما:</span>
                    <span className="font-black line-through">
                      {userAnswer ? formatNumber(userAnswer, 'persian') : '؟'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-300">
                    <span>پاسخ درست:</span>
                    <span className="font-black">
                      {formatNumber(question.correctAnswer, 'persian')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-1 pt-2 border-t border-slate-200/80 dark:border-slate-800 flex items-start gap-2">
                <span className="text-amber-500 text-sm">💡</span>
                <p className="text-[11px] sm:text-xs md:text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                  {getEducationalHint()}
                </p>
              </div>
            </div>

            {/* Left Half: Owl Pointing Right for both boy and girl */}
            <div className="w-[38%] relative h-full flex flex-col justify-end items-start p-0 m-0 bg-transparent shrink-0">
              <img 
                src={getAssetUrl('assets/characters/owl/Pointing right.webp')} 
                alt="Owl"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = getFallbackAssetUrl('assets/characters/owl/Pointing right.webp');
                }}
                className="w-full max-h-[92%] object-contain object-left-bottom absolute left-0 bottom-0 pointer-events-none drop-shadow-md"
                style={{ margin: 0, padding: 0 }}
              />
            </div>
          </>
        ) : (
          <>
            {/* Right Half: Math Question Content (60%) */}
            <div className="w-[60%] p-3 sm:p-5 flex flex-col justify-center items-center h-full">
              <div className="my-auto w-full flex items-center justify-center">
                <QuestionRenderer question={question} />
              </div>
            </div>
            
            {/* Left Half: Random Character Image (40%) */}
            <div className="w-[40%] relative h-full flex flex-col justify-end items-start p-0 m-0 bg-transparent">
              <img 
                src={getAssetUrl(`assets/characters/${characterGender}/half-body/${imageId}.webp`)} 
                alt="Character"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = getFallbackAssetUrl(`assets/characters/${characterGender}/half-body/${imageId}.webp`);
                }}
                className="w-full max-h-[90%] object-contain object-left-bottom absolute left-0 bottom-0 pointer-events-none"
                style={{ margin: 0, padding: 0 }}
              />
            </div>
          </>
        )}
      </div>

      {/* Overlay for remaining attempts in practice mode on incorrect answer - persistent until solved or next action, friendly light orange */}
      {isPractice && currentAttempts > 0 && currentAttempts < maxAttempts && feedbackStatus !== 'revealed' && feedbackStatus !== 'correct' && (
        <div className="absolute bottom-2.5 sm:bottom-3 left-1/2 -translate-x-1/2 z-40 pointer-events-none animate-bounce">
          <div className="px-3.5 sm:px-4 py-1.5 rounded-full bg-orange-100/95 dark:bg-orange-950/90 text-orange-900 dark:text-orange-200 font-black text-xs sm:text-sm shadow-md border-2 border-orange-300 dark:border-orange-700/80 backdrop-blur-xs flex items-center gap-1.5 whitespace-nowrap">
            <span>💡</span>
            <span>
              {remainingAttempts === 1
                ? '۱ تلاش دیگر مانده'
                : `${toPersianDigits(remainingAttempts)} تلاش دیگر مانده`}
            </span>
          </div>
        </div>
      )}
    </>
  );
};

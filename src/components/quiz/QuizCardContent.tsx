import React, { useMemo } from 'react';
import { QuizQuestion, CharacterGender } from '../../types';
import { QuestionRenderer } from './QuestionRenderer';
import { MathBackgroundWatermark } from './MathBackgroundWatermark';
import { toPersianDigits } from '../../utils/persian';

interface QuizCardContentProps {
  question: QuizQuestion;
  characterGender?: CharacterGender;
  isPractice?: boolean;
  currentAttempts?: number;
  maxAttempts?: number;
  streak?: number;
}

export const QuizCardContent: React.FC<QuizCardContentProps> = ({
  question,
  characterGender = 'boy',
  isPractice = false,
  currentAttempts = 0,
  maxAttempts = 3,
  streak = 0,
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

      {/* Main Content Split: Right 60% Math, Left 40% Image */}
      <div className="flex-1 flex flex-row w-full overflow-hidden z-10 relative">
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
      </div>
    </>
  );
};

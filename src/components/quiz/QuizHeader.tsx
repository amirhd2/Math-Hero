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
}) => {
  const isPractice = mode === 'practice';

  return (
    <div className="w-full select-none my-0">
      {/* Connected Dots Progress Indicator (Top-most Bar) */}
      <div className="w-full relative flex items-center justify-between h-3 px-1 my-0">
        {/* Background line (empty) */}
        <div className="absolute left-1 right-1 h-[2px] bg-slate-200 dark:bg-slate-700 z-0 top-1/2 -translate-y-1/2" />
        
        {/* Foreground line (filled) */}
        <div 
          className={`absolute right-1 h-[2px] z-0 top-1/2 -translate-y-1/2 transition-all duration-500 ease-in-out ${
            isPractice ? 'bg-emerald-500' : 'bg-indigo-500'
          }`}
          style={{ 
            width: `calc(${Math.min(100, Math.max(0, ((questionNumber - 1) / Math.max(1, totalQuestions - 1)) * 100))}% - 8px)` 
          }}
        />

        {/* Dots */}
        {Array.from({ length: totalQuestions }).map((_, index) => {
          const isPassed = index < questionNumber;
          const isActive = index === questionNumber - 1;
          
          return (
            <div 
              key={index} 
              className={`relative z-10 rounded-full transition-all duration-500 ease-in-out flex items-center justify-center ${
                isPassed
                  ? isPractice ? 'bg-emerald-500 w-3 h-3' : 'bg-indigo-500 w-3 h-3'
                  : 'bg-slate-200 dark:bg-slate-700 w-2 h-2'
              } ${isActive ? 'ring-4 ring-white dark:ring-slate-950 scale-125 shadow-sm' : ''}`}
            />
          );
        })}
      </div>
    </div>
  );
};

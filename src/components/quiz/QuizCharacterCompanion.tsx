/**
 * QuizCharacterCompanion component.
 * Adapts character avatar dynamically across the 4 responsive viewports
 * and active poses (thinking, celebrating, encouraging, sad).
 * Ensures mathematical question remains the absolute priority.
 */

import React from 'react';
import { CharacterGender, CharacterPose } from '../../types';

interface QuizCharacterCompanionProps {
  gender: CharacterGender;
  pose: CharacterPose;
  message?: string | null;
  className?: string;
  variant?: 'compact' | 'side' | 'full';
}

export const QuizCharacterCompanion: React.FC<QuizCharacterCompanionProps> = ({
  gender = 'boy',
  pose = 'thinking',
  message,
  className = '',
  variant = 'compact',
}) => {
  const isBoy = gender === 'boy';

  const getPoseInfo = () => {
    switch (pose) {
      case 'celebrating':
        return {
          emoji: '🎉',
          label: 'آفرین!',
          badgeBg: 'bg-amber-400 text-slate-950',
          bubbleBg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200',
        };
      case 'encouraging':
        return {
          emoji: '💪',
          label: 'دوباره تلاش کن!',
          badgeBg: 'bg-blue-400 text-white',
          bubbleBg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200',
        };
      case 'sad':
        return {
          emoji: '💭',
          label: 'اشکالی نداره!',
          badgeBg: 'bg-indigo-300 text-slate-900',
          bubbleBg: 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200',
        };
      case 'thinking':
      default:
        return {
          emoji: isBoy ? '👦' : '👧',
          label: 'فکر کن...',
          badgeBg: 'bg-amber-400 text-slate-950',
          bubbleBg: 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300',
        };
    }
  };

  const info = getPoseInfo();

  if (variant === 'compact') {
    // Mobile portrait: micro badge sitting neatly without eating vertical height
    return (
      <div className={`inline-flex items-center gap-2 select-none ${className}`}>
        <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center text-lg shadow-sm border border-white/20">
          {info.emoji}
        </div>
        {message && (
          <div
            className={`text-[11px] sm:text-xs font-bold px-3 py-1 rounded-xl border shadow-2xs animate-fade-in ${info.bubbleBg}`}
          >
            {message}
          </div>
        )}
      </div>
    );
  }

  // Side or Tablet companion layout
  return (
    <div className={`flex flex-col items-center text-center space-y-3 select-none ${className}`}>
      <div className="relative">
        <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-3xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 text-white flex items-center justify-center text-3xl sm:text-4xl md:text-5xl shadow-xl shadow-indigo-500/20 border-2 border-white/20">
          {info.emoji}
        </div>

        <span
          className={`absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-[10px] font-black shadow-md border-2 border-white dark:border-slate-900 ${info.badgeBg}`}
        >
          {info.label}
        </span>
      </div>

      {message ? (
        <div
          className={`max-w-[200px] text-xs font-bold p-3 rounded-2xl border shadow-sm ${info.bubbleBg}`}
        >
          {message}
        </div>
      ) : (
        <div className="text-xs font-black text-slate-500 dark:text-slate-400">
          قهرمان ریاضی
        </div>
      )}
    </div>
  );
};

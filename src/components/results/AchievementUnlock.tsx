/**
 * AchievementUnlock component.
 * Highlights newly unlocked badges and trophies upon quiz completion.
 */

import React from 'react';
import { Achievement } from '../../types';

interface AchievementUnlockProps {
  unlockedAchievements?: Achievement[];
}

export const AchievementUnlock: React.FC<AchievementUnlockProps> = ({
  unlockedAchievements = [],
}) => {
  if (!unlockedAchievements || unlockedAchievements.length === 0) {
    return null;
  }

  return (
    <div
      role="region"
      aria-label="نشان‌های باز شده جدید"
      className="bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/10 border-2 border-amber-400 dark:border-amber-600 rounded-3xl p-6 shadow-xl space-y-4 text-right"
    >
      <div className="flex items-center justify-between">
        <span className="px-3 py-1 bg-amber-400 text-slate-950 text-xs font-black rounded-xl">
          دست‌آورد جدید! 🎉
        </span>
        <h3 className="text-base font-black text-amber-900 dark:text-amber-200">
          مدال‌های افتخار باز شده
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {unlockedAchievements.map((ach) => (
          <div
            key={ach.id}
            className="bg-white dark:bg-slate-900/90 border border-amber-300 dark:border-amber-700/60 p-4 rounded-2xl flex items-center gap-3.5 shadow-sm"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-300 to-amber-500 text-slate-950 flex items-center justify-center text-2xl shrink-0 shadow-md">
              {ach.icon || '🏆'}
            </div>
            <div className="space-y-0.5">
              <h4 className="text-sm font-black text-slate-800 dark:text-slate-100">
                {ach.title}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                {ach.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * LevelProgressCard component for Math Hero.
 * Displays level, title, XP in current level, and smooth progress bar.
 * Reusable across Home, Achievements, and Profile.
 */

import React from 'react';
import { LevelInfo } from '../../gamification/gamificationTypes';
import { formatNumber } from '../../utils/persian';

interface LevelProgressCardProps {
  levelInfo: LevelInfo;
  currentStreak?: number;
  className?: string;
}

export const LevelProgressCard: React.FC<LevelProgressCardProps> = ({
  levelInfo,
  currentStreak = 1,
  className = '',
}) => {
  return (
    <div
      id="level-progress-card"
      className={`bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 ${className}`}
    >
      {/* Top Header: Title, Level Pill & Streak */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-2xl shadow-inner">
            {levelInfo.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                سطح {formatNumber(levelInfo.level, 'persian')}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <h3 className="text-base font-black text-slate-800 dark:text-slate-100">
                {levelInfo.title}
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {levelInfo.isMaxLevel
                ? 'به بالاترین سطح قهرمانی ریاضی دست پیدا کرده‌اید!'
                : `فقط ${formatNumber(
                    Math.max(0, levelInfo.xpRequiredForNextLevel - levelInfo.xpInCurrentLevel),
                    'persian'
                  )} XP تا سطح بعدی`}
            </p>
          </div>
        </div>

        {/* Streak Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 rounded-2xl text-xs font-black shrink-0">
          <span>🔥</span>
          <span>{formatNumber(currentStreak, 'persian')} روز متوالی</span>
        </div>
      </div>

      {/* XP Numbers & Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-black">
          <span className="text-slate-600 dark:text-slate-300">
            {levelInfo.isMaxLevel ? (
              <span>👑 بالاترین سطح قهرمان</span>
            ) : (
              <span>پیشرفت تا سطح {formatNumber(levelInfo.level + 1, 'persian')}</span>
            )}
          </span>
          <span className="text-indigo-600 dark:text-indigo-400 font-bold">
            {formatNumber(levelInfo.xpInCurrentLevel, 'persian')} / {formatNumber(levelInfo.xpRequiredForNextLevel, 'persian')} XP
            <span className="text-slate-400 mr-1.5">
              ({formatNumber(levelInfo.progressPercent, 'persian')}٪)
            </span>
          </span>
        </div>

        <div className="w-full h-3.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
          <div
            className="h-full bg-gradient-to-l from-indigo-500 via-indigo-600 to-indigo-700 rounded-full transition-all duration-700 shadow-sm"
            style={{ width: `${Math.max(4, levelInfo.progressPercent)}%` }}
          />
        </div>
      </div>

      {/* Educational Requirement Hint when gated or approaching milestone */}
      {levelInfo.nextLevelEducationalRequirementText && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 rounded-2xl text-xs text-amber-800 dark:text-amber-300 font-bold">
          <span className="text-base">🎯</span>
          <span className="leading-relaxed">{levelInfo.nextLevelEducationalRequirementText}</span>
        </div>
      )}
    </div>
  );
};

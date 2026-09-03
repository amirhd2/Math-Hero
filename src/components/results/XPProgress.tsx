/**
 * XPProgress component.
 * Displays XP earned, current level, progress bar to next level, and Level-Up celebratory banner.
 */

import React from 'react';
import { UserProfile, QuizResult } from '../../types';
import { formatNumber } from '../../utils/persian';

interface XPProgressProps {
  profile: UserProfile;
  result: QuizResult;
}

export const XPProgress: React.FC<XPProgressProps> = ({ profile, result }) => {
  const XP_PER_LEVEL = 200;
  const currentXpInLevel = profile.xp % XP_PER_LEVEL;
  const progressPercent = Math.min(100, Math.round((currentXpInLevel / XP_PER_LEVEL) * 100));

  const leveledUp = Boolean(
    result.leveledUp || (result.levelBefore && result.levelAfter && result.levelAfter > result.levelBefore)
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 text-right">
      {/* Level Up Celebratory Announcement */}
      {leveledUp && (
        <div className="relative overflow-hidden bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 text-slate-950 p-4 rounded-2xl shadow-lg animate-pulse flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⭐</span>
            <div>
              <h4 className="font-black text-base">ارتقای سطح قهرمان!</h4>
              <p className="text-xs font-bold opacity-90">
                تبریک! تو به سطح {formatNumber(profile.level, 'persian')} رسیدی!
              </p>
            </div>
          </div>
          <span className="text-2xl font-black bg-white/40 px-3 py-1 rounded-xl">
            سطح {formatNumber(profile.level, 'persian')} 🚀
          </span>
        </div>
      )}

      {/* Main XP row */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">
            امتیاز کسب‌شده در این آزمون
          </span>
          <div className="inline-flex items-center gap-2 bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700/60 px-4 py-2 rounded-2xl">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
              +{formatNumber(result.xpEarned, 'persian')}
            </span>
            <span className="text-xs font-black text-amber-800 dark:text-amber-300">امتیاز XP</span>
          </div>
        </div>

        {/* Current Level Pill */}
        <div className="text-left">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">
            سطح فعلی
          </span>
          <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-black">
            <span>👑</span>
            <span>سطح {formatNumber(profile.level, 'persian')}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar to next level */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
          <span>پیشرفت تا سطح {formatNumber(profile.level + 1, 'persian')}</span>
          <span>
            {formatNumber(currentXpInLevel, 'persian')} / {formatNumber(XP_PER_LEVEL, 'persian')} XP
          </span>
        </div>

        <div className="w-full h-3.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
          <div
            className="h-full bg-gradient-to-l from-indigo-500 via-indigo-600 to-indigo-700 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};

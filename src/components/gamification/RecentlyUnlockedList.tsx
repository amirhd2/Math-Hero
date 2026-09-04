/**
 * RecentlyUnlockedList component for Math Hero.
 * Highlights the child's most recently earned badges in a clean horizontal strip.
 */

import React from 'react';
import { Badge } from '../../gamification/gamificationTypes';
import { formatNumber } from '../../utils/persian';

interface RecentlyUnlockedListProps {
  badges: Badge[];
  onSelectBadge?: (badge: Badge) => void;
}

export const RecentlyUnlockedList: React.FC<RecentlyUnlockedListProps> = ({
  badges,
  onSelectBadge,
}) => {
  if (!badges || badges.length === 0) {
    return (
      <div className="bg-white/60 dark:bg-slate-900/60 rounded-3xl p-6 text-center border border-dashed border-slate-200 dark:border-slate-800 space-y-1">
        <span className="text-3xl">🌱</span>
        <h4 className="text-sm font-black text-slate-700 dark:text-slate-300">
          هنوز نشانی باز نشده است
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          با اولین آزمون یا تمرین در ریاضی، اولین مدال قهرمانی‌ات را دشت کن!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <span>✨</span>
          <span>تازه‌ترین نشان‌های کسب‌شده</span>
        </h3>
        <span className="text-xs font-bold text-amber-500">
          افتخارات جدید شما
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {badges.map((b) => (
          <div
            key={b.id}
            onClick={() => onSelectBadge && onSelectBadge(b)}
            className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-amber-300/80 dark:border-amber-700/60 shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-3.5 group hover:-translate-y-0.5"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-2xl shadow-md shrink-0 group-hover:scale-105 transition-transform">
              {b.icon}
            </div>
            <div className="min-w-0 space-y-0.5">
              <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 truncate">
                {b.name}
              </h4>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black text-amber-600 dark:text-amber-400">
                  +{formatNumber(b.xpReward, 'persian')} XP
                </span>
                <span className="text-[10px] text-emerald-500 font-bold">
                  ✓ کسب شد
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

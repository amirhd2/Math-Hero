/**
 * AchievementUnlock component.
 * Highlights newly unlocked badges and trophies upon quiz completion.
 */

import React from 'react';
import { Achievement } from '../../types';
import { BADGE_REGISTRY } from '../../gamification/badgeRegistry';
import { getAssetUrl, getTrophyCupFallbackUrl } from '../../utils/assetPaths';

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
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400 text-slate-950 text-xs font-black rounded-full shadow-xs">
          <span className="text-sm">🏅</span>
          <span>دست‌آورد جدید!</span>
        </span>
        <h3 className="text-base font-black text-amber-900 dark:text-amber-200">
          مدال‌های افتخار باز شده
        </h3>
      </div>

      <div className="flex flex-col gap-3">
        {unlockedAchievements.map((ach, index) => {
          // Resolve original medal from BADGE_REGISTRY or numerical fallback
          const badgeDef = BADGE_REGISTRY.find(
            (b) => b.id === ach.id || b.name === ach.title
          );
          const fallbackMedalNum = (index % 45) + 1;
          const medalSrc =
            badgeDef?.imageUrl || getAssetUrl(`assets/medals/${fallbackMedalNum}.png`);

          return (
            <div
              key={ach.id}
              className="bg-white dark:bg-slate-900/90 border border-amber-300 dark:border-amber-700/60 p-4 rounded-2xl flex items-center gap-3.5 shadow-sm overflow-hidden"
            >
              {/* Pure icon without colored square background, upright and clean */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 flex items-center justify-center select-none rotate-0">
                <img
                  src={medalSrc}
                  alt={ach.title}
                  className="w-full h-full object-contain filter drop-shadow-md rotate-0 transform-none"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.dataset.fallback) {
                      target.dataset.fallback = '1';
                      target.src = getTrophyCupFallbackUrl(4);
                    }
                  }}
                />
              </div>
              <div className="flex-1 min-w-0 space-y-0.5">
                <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 truncate">
                  {ach.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {ach.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};


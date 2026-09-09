/**
 * BadgeCard component for Math Hero.
 * Renders an individual achievement badge with distinct visual treatments for
 * Common, Rare, Epic, and Legendary rarities, plus child-friendly locked progress.
 */

import React from 'react';
import { Badge, BadgeRarity } from '../../gamification/gamificationTypes';
import { formatNumber } from '../../utils/persian';

interface BadgeCardProps {
  badge: Badge;
  onClick?: (badge: Badge) => void;
}

export const BadgeCard: React.FC<BadgeCardProps> = ({ badge, onClick }) => {
  const isUnlocked = Boolean(badge.unlocked);
  const progress = badge.progress ?? 0;
  const maxProgress = badge.maxProgress ?? badge.requirement.target ?? 1;
  const progressPercent = Math.min(100, Math.round((progress / maxProgress) * 100));

  // Rarity metadata
  const getRarityConfig = (rarity: BadgeRarity) => {
    switch (rarity) {
      case 'common':
        return {
          label: 'نشان عمومی',
          badgeClass: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700',
          iconBg: 'from-blue-400 to-indigo-500 text-white',
          borderClass: isUnlocked ? 'border-slate-200 dark:border-slate-700 hover:border-indigo-400' : 'border-slate-200 dark:border-slate-800',
          glow: 'hover:shadow-indigo-500/10',
        };
      case 'rare':
        return {
          label: 'نشان کمیاب',
          badgeClass: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
          iconBg: 'from-sky-400 via-indigo-500 to-blue-600 text-white',
          borderClass: isUnlocked ? 'border-blue-300 dark:border-blue-700 hover:border-blue-500' : 'border-slate-200 dark:border-slate-800',
          glow: 'hover:shadow-blue-500/20',
        };
      case 'epic':
        return {
          label: 'نشان حماسی',
          badgeClass: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
          iconBg: 'from-purple-500 via-violet-600 to-indigo-700 text-white',
          borderClass: isUnlocked ? 'border-purple-300 dark:border-purple-700 hover:border-purple-500' : 'border-slate-200 dark:border-slate-800',
          glow: 'hover:shadow-purple-500/20',
        };
      case 'legendary':
      default:
        return {
          label: 'نشان افسانه‌ای',
          badgeClass: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700',
          iconBg: 'from-amber-400 via-yellow-500 to-orange-500 text-slate-950',
          borderClass: isUnlocked ? 'border-amber-300 dark:border-amber-600 ring-2 ring-amber-400/20' : 'border-slate-200 dark:border-slate-800',
          glow: 'hover:shadow-amber-500/30',
        };
    }
  };

  const rarityMeta = getRarityConfig(badge.rarity || 'common');

  return (
    <div
      id={`badge-card-${badge.id}`}
      onClick={() => onClick && onClick(badge)}
      className={`group relative rounded-3xl p-5 border transition-all duration-300 cursor-pointer flex flex-col justify-between gap-4 ${
        isUnlocked
          ? `bg-white dark:bg-slate-900 shadow-lg hover:shadow-2xl hover:-translate-y-1 ${rarityMeta.borderClass} ${rarityMeta.glow}`
          : 'bg-slate-50/70 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800/80 opacity-75 hover:opacity-100'
      }`}
    >
      {/* Top Row: Rarity Tag & XP Reward Pill */}
      <div className="flex items-center justify-between gap-2">
        <span
          className={`px-2.5 py-0.5 rounded-xl text-[10px] font-black border ${rarityMeta.badgeClass}`}
        >
          {rarityMeta.label}
        </span>

        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-xl text-[11px] font-black bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
          <span>⭐</span>
          <span>+{formatNumber(badge.xpReward, 'persian')} XP</span>
        </span>
      </div>

      {/* Main Body: Icon, Title & Description */}
      <div className="flex items-start gap-4">
        {/* Icon Container */}
        <div
          className={`w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center text-4xl shrink-0 transition-transform duration-300 ${
            isUnlocked
              ? 'group-hover:scale-110 group-hover:-rotate-3'
              : 'opacity-70 group-hover:scale-105'
          }`}
        >
          {isUnlocked ? (
            badge.imageUrl ? <img src={badge.imageUrl} alt={badge.name} className="w-full h-full object-contain drop-shadow-xl" /> : badge.icon
          ) : (
            badge.imageUrl ? <img src={badge.imageUrl} alt={badge.name} className="w-full h-full object-contain grayscale opacity-50 drop-shadow-sm" /> : '🔒'
          )}
        </div>

        {/* Text Details */}
        <div className="space-y-1 flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="text-base font-black text-slate-800 dark:text-slate-100 truncate">
              {badge.name}
            </h4>
            {isUnlocked && (
              <span className="text-xs text-emerald-500 shrink-0 font-black" title="باز شده">
                ✓
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
            {badge.description}
          </p>
        </div>
      </div>

      {/* Bottom Section: Progress or Unlocked Status */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60">
        {isUnlocked ? (
          <div className="flex items-center justify-between text-xs font-black text-emerald-600 dark:text-emerald-400">
            <span className="flex items-center gap-1">
              <span>🎉</span>
              <span>کسب شده و باز است!</span>
            </span>
            <span className="text-[11px] text-slate-400 font-normal">
              قهرمان برتر
            </span>
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-500 dark:text-slate-400">
              <span className="truncate">
                {badge.requirement.descriptionFa}
              </span>
              <span className="shrink-0 text-indigo-600 dark:text-indigo-400 font-black mr-2">
                {formatNumber(progress, 'persian')} / {formatNumber(maxProgress, 'persian')}
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

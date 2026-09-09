/**
 * TrophyHeroCard component for Math Hero.
 * Visually showcases the evolving Math Hero Trophy through its 6 progression stages,
 * accompanied by the proud child character companion.
 */

import React from 'react';
import { TrophyInfo, LevelInfo } from '../../gamification/gamificationTypes';
import { UserProfile } from '../../types';
import { formatNumber } from '../../utils/persian';
import {
  getAssetUrl,
  getFallbackAssetUrl,
  getTrophyCupUrl,
  getTrophyCupFallbackUrl,
  getStageIconUrl,
  getStageIconFallbackUrl,
} from '../../utils/assetPaths';

interface TrophyHeroCardProps {
  profile: UserProfile;
  trophyInfo: TrophyInfo;
  levelInfo: LevelInfo;
  unlockedBadgesCount: number;
  totalBadgesCount: number;
  streak?: number;
  className?: string;
}

export const TrophyHeroCard: React.FC<TrophyHeroCardProps> = ({
  profile,
  trophyInfo,
  levelInfo,
  unlockedBadgesCount,
  totalBadgesCount,
  streak,
  className = '',
}) => {
  const gender = profile.gender === 'girl' ? 'girl' : 'boy';
  const streakDays = streak ?? profile.streakDays ?? 1;
  const nextThreshold =
    levelInfo.nextLevelXpThreshold ||
    levelInfo.currentLevelXpFloor + levelInfo.xpRequiredForNextLevel;
  const remainingXp = Math.max(0, nextThreshold - (levelInfo.totalXp || profile.xp || 0));

  // Trophy styling theme per stage
  const getStageTheme = (stage: number) => {
    switch (stage) {
      case 1:
        return {
          gradient: 'from-amber-800 via-amber-700 to-stone-800',
          glow: 'shadow-amber-900/30',
          badgeBg: 'bg-amber-900/50 text-amber-200 border-amber-700/60',
          trophyColor: 'from-amber-600 to-amber-800',
        };
      case 2:
        return {
          gradient: 'from-amber-700 via-orange-700 to-stone-800',
          glow: 'shadow-orange-900/30',
          badgeBg: 'bg-amber-900/50 text-amber-200 border-amber-700/60',
          trophyColor: 'from-amber-600 to-orange-700',
        };
      case 3:
        return {
          gradient: 'from-slate-600 via-slate-700 to-indigo-900',
          glow: 'shadow-slate-600/30',
          badgeBg: 'bg-slate-700/60 text-slate-100 border-slate-500/60',
          trophyColor: 'from-slate-200 to-slate-400 text-slate-900',
        };
      case 4:
        return {
          gradient: 'from-amber-500 via-yellow-600 to-orange-700',
          glow: 'shadow-amber-500/40',
          badgeBg: 'bg-amber-900/60 text-amber-100 border-amber-400/60',
          trophyColor: 'from-yellow-300 via-amber-400 to-yellow-500 text-slate-950',
        };
      case 5:
        return {
          gradient: 'from-rose-600 via-purple-700 to-indigo-900',
          glow: 'shadow-rose-600/40',
          badgeBg: 'bg-rose-950/60 text-rose-200 border-rose-400/60',
          trophyColor: 'from-rose-400 via-pink-500 to-purple-600 text-white',
        };
      case 6:
      default:
        return {
          gradient: 'from-indigo-700 via-purple-700 to-amber-600',
          glow: 'shadow-purple-600/50',
          badgeBg: 'bg-purple-950/70 text-amber-300 border-amber-400',
          trophyColor: 'from-amber-300 via-yellow-400 to-amber-500 text-slate-950',
        };
    }
  };

  const theme = getStageTheme(trophyInfo.stage);

  return (
    <div
      id="trophy-hero-card"
      className={`relative rounded-3xl overflow-hidden select-none bg-gradient-to-br ${theme.gradient} shadow-2xl ${theme.glow} border border-white/15 ${className}`}
    >
      {/* Subtle Background Ambience */}
      <div className="absolute -bottom-14 -right-14 w-60 h-60 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-14 -left-14 w-60 h-60 bg-white/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Content Layout */}
      <div className="relative z-10 flex flex-col sm:flex-row lg:flex-col justify-between items-stretch gap-4 p-4 sm:p-6 md:p-7 h-full">
        {/* Right Content Column in RTL (Level, Progress Bar, Metrics, 2 Badges) */}
        <div className="flex-1 flex flex-col justify-between gap-3.5 sm:gap-4 text-right min-w-0">
          {/* Top/Main Details Section */}
          <div className="flex flex-row items-stretch justify-between gap-2 sm:gap-4 w-full">
            <div className="flex-1 space-y-2.5 sm:space-y-3.5 text-right min-w-0">
              {/* Current Level Capsule (Top & Center above Progress Bar) */}
              <div className="flex justify-start sm:justify-center w-full">
                <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-1 rounded-full bg-white/20 hover:bg-white/25 backdrop-blur-md border border-white/25 text-white shadow-md select-none transition-all">
                  <span className="text-amber-300 text-sm">⭐</span>
                  <span className="text-xs sm:text-sm font-black tracking-wide">
                    سطح {formatNumber(levelInfo.level, 'persian')}
                  </span>
                  <span className="text-white/40 text-xs">•</span>
                  <span className="text-yellow-200 text-xs sm:text-sm font-black">
                    {levelInfo.title}
                  </span>
                </div>
              </div>

              {/* Golden Progress Bar Pill */}
              <div className="w-full bg-white/20 backdrop-blur-md p-1 rounded-full border border-white/25 shadow-inner relative h-7 sm:h-8 md:h-9 flex items-center justify-between overflow-hidden">
                {/* Dynamic Yellow Fill Bar */}
                <div
                  className="h-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 rounded-full shadow-md transition-all duration-500 flex items-center justify-center relative overflow-hidden"
                  style={{ width: `${Math.max(8, Math.min(100, levelInfo.progressPercent))}%` }}
                >
                  {/* If yellow bar >= 38% wide, place text centered inside yellow bar */}
                  {levelInfo.progressPercent >= 38 && (
                    <span className="font-black text-amber-950 text-[11px] sm:text-xs md:text-sm whitespace-nowrap px-2 drop-shadow-xs">
                      {formatNumber(levelInfo.totalXp || profile.xp, 'persian')} / {formatNumber(nextThreshold, 'persian')} XP
                    </span>
                  )}
                </div>

                {/* If yellow bar < 38% wide, place text outside yellow bar to its left */}
                {levelInfo.progressPercent < 38 && (
                  <div className="flex-1 flex items-center justify-center font-black text-white text-[11px] sm:text-xs md:text-sm whitespace-nowrap px-2 drop-shadow-md z-10">
                    {formatNumber(levelInfo.totalXp || profile.xp, 'persian')} / {formatNumber(nextThreshold, 'persian')} XP
                  </div>
                )}
              </div>

              {/* Remaining XP until Next Level under Progress Bar */}
              <div className="flex justify-start sm:justify-center items-center w-full">
                <span className="text-[11px] sm:text-xs md:text-sm font-black text-amber-100 drop-shadow-sm flex items-center gap-1.5">
                  <span>✨</span>
                  <span>
                    {levelInfo.isMaxLevel
                      ? 'به بالاترین سطح رسیدی! 🎉'
                      : `${formatNumber(remainingXp, 'persian')} XP مانده تا سطح بعدی`}
                  </span>
                </span>
              </div>

              {/* Quick Metrics Bar: Unlocked Badges Count + Consecutive Days Streak */}
              <div className="flex flex-wrap items-center justify-start sm:justify-center gap-1.5 sm:gap-3 text-xs font-black pt-1 w-full">
                <div className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center gap-1.5 text-white shadow-sm text-[11px] sm:text-xs">
                  <span>🏅</span>
                  <span>
                    {formatNumber(unlockedBadgesCount, 'persian')} از {formatNumber(totalBadgesCount, 'persian')} نشان
                  </span>
                </div>

                {/* Consecutive Days Streak Capsule */}
                <div className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center gap-1.5 text-amber-200 shadow-sm text-[11px] sm:text-xs">
                  <span className="text-sm">🔥</span>
                  <span>{formatNumber(streakDays, 'persian')} روز متوالی</span>
                </div>
              </div>
            </div>

            {/* Mobile Portrait Only Character (< sm) */}
            <div className="relative w-24 min-[380px]:w-28 min-[440px]:w-32 -mb-4 -ml-3 self-end shrink-0 z-10 pointer-events-none flex sm:hidden items-end justify-center">
              <img
                src={getAssetUrl(`assets/characters/${gender}/proud.webp`)}
                alt="Hero Character"
                className="w-full h-auto max-h-[180px] object-contain object-bottom block select-none pointer-events-none drop-shadow-xl"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.dataset.fallback) {
                    target.dataset.fallback = '1';
                    target.src = getFallbackAssetUrl(`assets/characters/${gender}/proud.webp`);
                  }
                }}
              />
            </div>
          </div>

          {/* 2 Achieved Badges (Trophy Cup on Right, Level Icon on Left in RTL) - Displayed ONLY on screens smaller than lg */}
          <div className="grid lg:hidden grid-cols-2 gap-2.5 sm:gap-4 pt-3 mt-auto w-full items-center border-t border-white/15">
            {/* Right half (in RTL): Achieved Trophy Cup */}
            <div className="flex flex-col items-center justify-center text-center p-2 rounded-2xl bg-white/10 dark:bg-black/15 backdrop-blur-xs border border-white/15 shadow-xs">
              <div className="relative w-12 h-12 min-[380px]:w-14 min-[380px]:h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 flex items-center justify-center">
                <img
                  src={getTrophyCupUrl(trophyInfo.stage)}
                  alt={trophyInfo.stageNameFa || 'جام قهرمانی'}
                  className="max-w-full max-h-full object-contain filter drop-shadow-lg select-none pointer-events-none"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.dataset.fallback) {
                      target.dataset.fallback = '1';
                      target.src = getTrophyCupFallbackUrl(trophyInfo.stage);
                    }
                  }}
                />
              </div>
              <span className="text-[11px] sm:text-xs md:text-sm font-black text-amber-200 mt-1.5 drop-shadow-sm truncate max-w-full">
                {trophyInfo.stageNameFa || 'جام قهرمانی'}
              </span>
            </div>

            {/* Left half (in RTL): Achieved Level Icon */}
            <div className="flex flex-col items-center justify-center text-center p-2 rounded-2xl bg-white/10 dark:bg-black/15 backdrop-blur-xs border border-white/15 shadow-xs">
              <div className="relative w-12 h-12 min-[380px]:w-14 min-[380px]:h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 flex items-center justify-center">
                <img
                  src={getStageIconUrl(levelInfo.level)}
                  alt={`سطح ${levelInfo.level}`}
                  className="max-w-full max-h-full object-contain filter drop-shadow-lg select-none pointer-events-none"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.dataset.fallback) {
                      target.dataset.fallback = '1';
                      target.src = getStageIconFallbackUrl(levelInfo.level);
                    }
                  }}
                />
              </div>
              <span className="text-[11px] sm:text-xs md:text-sm font-black text-white mt-1.5 drop-shadow-sm truncate max-w-full">
                سطح {formatNumber(levelInfo.level, 'persian')} ({levelInfo.title})
              </span>
            </div>
          </div>
        </div>

        {/* Left Side: Full-Body Character on screens larger than mobile portrait and smaller than tablet landscape (sm and md) */}
        <div className="hidden sm:flex lg:hidden w-36 sm:w-44 md:w-52 shrink-0 self-stretch items-end justify-center pointer-events-none z-10 -mb-6 md:-mb-7 -ml-6 md:-ml-7 pl-1">
          <img
            src={getAssetUrl(`assets/characters/${gender}/proud.webp`)}
            alt="Hero Character"
            className="w-full h-full max-h-[340px] md:max-h-[380px] object-contain object-bottom block select-none pointer-events-none drop-shadow-2xl"
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.dataset.fallback) {
                target.dataset.fallback = '1';
                target.src = getFallbackAssetUrl(`assets/characters/${gender}/proud.webp`);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};


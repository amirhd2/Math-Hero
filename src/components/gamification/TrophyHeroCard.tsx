/**
 * TrophyHeroCard component for Math Hero.
 * Visually showcases the evolving Math Hero Trophy through its 6 progression stages,
 * accompanied by the proud child character companion.
 */

import React from 'react';
import { TrophyInfo, LevelInfo } from '../../gamification/gamificationTypes';
import { UserProfile } from '../../types';
import { formatNumber } from '../../utils/persian';
import { getAssetUrl, getFallbackAssetUrl, getTrophyCupUrl, getTrophyCupFallbackUrl } from '../../utils/assetPaths';

interface TrophyHeroCardProps {
  profile: UserProfile;
  trophyInfo: TrophyInfo;
  levelInfo: LevelInfo;
  unlockedBadgesCount: number;
  totalBadgesCount: number;
  streak?: number;
}

export const TrophyHeroCard: React.FC<TrophyHeroCardProps> = ({
  profile,
  trophyInfo,
  levelInfo,
  unlockedBadgesCount,
  totalBadgesCount,
  streak,
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
      className="relative select-none"
    >
      {/* Background Card Container with Rounded Corners & Shadows */}
      <div
        className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${theme.gradient} shadow-2xl ${theme.glow} border border-white/15 overflow-hidden pointer-events-none`}
      >
        {/* Background Decorative Blur Orbs */}
        <div className="absolute -top-12 -left-12 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Main Content Layout */}
      <div className="relative z-10 flex flex-row items-center justify-between gap-3 sm:gap-6 p-5 sm:p-7 min-h-[145px] sm:min-h-[165px]">
        {/* Right Content (Persian RTL) */}
        <div className="flex-1 space-y-2.5 sm:space-y-3.5 text-right min-w-0">
          {/* Current Level Capsule (Top & Center above Progress Bar) */}
          <div className="flex justify-center w-full">
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
          <div className="w-full bg-white/20 backdrop-blur-md p-1 rounded-full border border-white/25 shadow-inner relative h-8 sm:h-9 flex items-center justify-between overflow-hidden">
            {/* Dynamic Yellow Fill Bar */}
            <div
              className="h-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 rounded-full shadow-md transition-all duration-500 flex items-center justify-center relative overflow-hidden"
              style={{ width: `${Math.max(8, Math.min(100, levelInfo.progressPercent))}%` }}
            >
              {/* If yellow bar >= 38% wide, place text centered inside yellow bar */}
              {levelInfo.progressPercent >= 38 && (
                <span className="font-black text-amber-950 text-xs sm:text-sm whitespace-nowrap px-2 drop-shadow-xs">
                  {formatNumber(levelInfo.totalXp || profile.xp, 'persian')} / {formatNumber(nextThreshold, 'persian')} XP
                </span>
              )}
            </div>

            {/* If yellow bar < 38% wide, place text outside yellow bar to its left */}
            {levelInfo.progressPercent < 38 && (
              <div className="flex-1 flex items-center justify-center font-black text-white text-xs sm:text-sm whitespace-nowrap px-2 drop-shadow-md z-10">
                {formatNumber(levelInfo.totalXp || profile.xp, 'persian')} / {formatNumber(nextThreshold, 'persian')} XP
              </div>
            )}
          </div>

          {/* Remaining XP until Next Level under Progress Bar */}
          <div className="flex justify-center items-center w-full text-center">
            <span className="text-xs sm:text-sm font-black text-amber-100 drop-shadow-sm flex items-center gap-1.5">
              <span>✨</span>
              <span>
                {levelInfo.isMaxLevel
                  ? 'به بالاترین سطح رسیدی! 🎉'
                  : `${formatNumber(remainingXp, 'persian')} XP مانده تا سطح بعدی`}
              </span>
            </span>
          </div>

          {/* Quick Metrics Bar: Unlocked Badges Count + Consecutive Days Streak (Centered at Bottom) */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs font-black pt-1 w-full">
            <div className="px-3 py-1.5 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center gap-1.5 text-white shadow-sm">
              <span>🏅</span>
              <span>
                {formatNumber(unlockedBadgesCount, 'persian')} از {formatNumber(totalBadgesCount, 'persian')} نشان باز شده
              </span>
            </div>

            {/* Consecutive Days Streak Capsule */}
            <div className="px-3 py-1.5 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center gap-1.5 text-amber-200 shadow-sm">
              <span className="text-sm">🔥</span>
              <span>{formatNumber(streakDays, 'persian')} روز متوالی</span>
            </div>
          </div>
        </div>

        {/* Left on Mobile: Character Box - bottom flush to card bottom */}
        {/* Zooms into abdomen-up (شکم به بالا) region and scales image to fill box width as much as possible */}
        <div className="lg:hidden relative w-32 min-[420px]:w-36 sm:w-44 md:w-52 self-stretch -mb-5 sm:-mb-7 -ml-5 sm:-ml-7 shrink-0 z-20 pointer-events-none">
          <div className="absolute inset-x-0 bottom-0 top-0 overflow-hidden rounded-bl-3xl flex items-start justify-center">
            <img
              src={getAssetUrl(`assets/characters/${gender}/proud.webp`)}
              alt="Hero Character"
              className="w-full min-w-full h-auto object-cover object-top filter drop-shadow-2xl block select-none origin-top scale-[1.12] translate-y-[-1%]"
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

        {/* Left on Desktop: Current Trophy Showcase Widget */}
        <div className="hidden lg:flex flex-col items-center shrink-0">
          <div
            className={`relative w-32 h-32 xl:w-36 xl:h-36 rounded-3xl bg-gradient-to-br ${theme.trophyColor} flex items-center justify-center p-3 shadow-2xl border-4 border-white/30 transform hover:scale-105 transition-transform overflow-hidden`}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-white/20 pointer-events-none" />
            <img
              src={getTrophyCupUrl(trophyInfo.stage)}
              alt={trophyInfo.stageNameFa}
              className="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.35)] hover:scale-110 transition-transform duration-300"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.dataset.fallback) {
                  target.dataset.fallback = '1';
                  target.src = getTrophyCupFallbackUrl(trophyInfo.stage);
                }
              }}
            />
          </div>
          <span className="text-xs font-black text-white/95 mt-2 bg-black/35 px-3 py-1 rounded-full border border-white/15 shadow-sm">
            {trophyInfo.stageNameFa}
          </span>
        </div>
      </div>
    </div>
  );
};


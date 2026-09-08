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
}

export const TrophyHeroCard: React.FC<TrophyHeroCardProps> = ({
  profile,
  trophyInfo,
  levelInfo,
  unlockedBadgesCount,
  totalBadgesCount,
}) => {
  const gender = profile.gender === 'girl' ? 'girl' : 'boy';

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
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${theme.gradient} text-white p-5 sm:p-7 shadow-2xl ${theme.glow} border border-white/15 transition-all`}
    >
      {/* Background Decorative Blur Orbs */}
      <div className="absolute -top-12 -left-12 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Content Layout */}
      <div className="relative z-10 flex flex-row items-center justify-between gap-4 sm:gap-6">
        {/* Right Content (Persian RTL) */}
        <div className="flex-1 space-y-3 sm:space-y-4 text-right">
          {/* Trophy Title & Description */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              <span>{trophyInfo.title}</span>
              {trophyInfo.isMax && <span>👑</span>}
            </h2>
            <p className="text-white/90 text-xs sm:text-sm font-medium mt-1 leading-relaxed">
              {trophyInfo.description}
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-black pt-1">
            <div className="px-3 py-1.5 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center gap-1.5">
              <span>🏅</span>
              <span>
                {formatNumber(unlockedBadgesCount, 'persian')} از {formatNumber(totalBadgesCount, 'persian')} نشان باز شده
              </span>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center gap-1.5 text-amber-200">
              <span>⭐</span>
              <span>{formatNumber(levelInfo.totalXp, 'persian')} XP کل</span>
            </div>
          </div>
        </div>

        {/* Left on Mobile: Proud Character sticking flush to the bottom card edge */}
        <div className="lg:hidden flex items-end justify-center w-28 sm:w-36 -mb-5 sm:-mb-7 -ml-5 sm:-ml-7 relative shrink-0 z-20 self-end overflow-hidden">
          <img
            src={getAssetUrl(`assets/characters/${gender}/proud.webp`)}
            alt="Hero Character"
            className="w-full h-auto max-h-[180px] sm:max-h-[210px] object-contain object-bottom filter drop-shadow-2xl pointer-events-none block"
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.dataset.fallback) {
                target.dataset.fallback = '1';
                target.src = getFallbackAssetUrl(`assets/characters/${gender}/proud.webp`);
              }
            }}
          />
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


/**
 * TrophyHeroCard component for Math Hero.
 * Visually showcases the evolving Math Hero Trophy through its 6 progression stages,
 * accompanied by the proud child character companion.
 */

import React from 'react';
import { TrophyInfo, LevelInfo } from '../../gamification/gamificationTypes';
import { UserProfile } from '../../types';
import { formatNumber } from '../../utils/persian';

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
  // Trophy styling theme per stage
  const getStageTheme = (stage: number) => {
    switch (stage) {
      case 1:
        return {
          gradient: 'from-amber-800 via-amber-700 to-stone-800',
          glow: 'shadow-amber-900/30',
          badgeBg: 'bg-amber-900/50 text-amber-200 border-amber-700/60',
          trophyColor: 'from-amber-600 to-amber-800',
          sparkle: '🌱',
        };
      case 2:
        return {
          gradient: 'from-amber-700 via-orange-700 to-stone-800',
          glow: 'shadow-orange-900/30',
          badgeBg: 'bg-amber-900/50 text-amber-200 border-amber-700/60',
          trophyColor: 'from-amber-600 to-orange-700',
          sparkle: '🥉',
        };
      case 3:
        return {
          gradient: 'from-slate-600 via-slate-700 to-indigo-900',
          glow: 'shadow-slate-600/30',
          badgeBg: 'bg-slate-700/60 text-slate-100 border-slate-500/60',
          trophyColor: 'from-slate-200 to-slate-400 text-slate-900',
          sparkle: '🥈',
        };
      case 4:
        return {
          gradient: 'from-amber-500 via-yellow-600 to-orange-700',
          glow: 'shadow-amber-500/40',
          badgeBg: 'bg-amber-900/60 text-amber-100 border-amber-400/60',
          trophyColor: 'from-yellow-300 via-amber-400 to-yellow-500 text-slate-950',
          sparkle: '🥇',
        };
      case 5:
        return {
          gradient: 'from-rose-600 via-purple-700 to-indigo-900',
          glow: 'shadow-rose-600/40',
          badgeBg: 'bg-rose-950/60 text-rose-200 border-rose-400/60',
          trophyColor: 'from-rose-400 via-pink-500 to-purple-600 text-white',
          sparkle: '💎',
        };
      case 6:
      default:
        return {
          gradient: 'from-indigo-700 via-purple-700 to-amber-600',
          glow: 'shadow-purple-600/50',
          badgeBg: 'bg-purple-950/70 text-amber-300 border-amber-400',
          trophyColor: 'from-amber-300 via-yellow-400 to-amber-500 text-slate-950',
          sparkle: '👑',
        };
    }
  };

  const theme = getStageTheme(trophyInfo.stage);

  return (
    <div
      id="trophy-hero-card"
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${theme.gradient} text-white p-6 sm:p-8 shadow-2xl ${theme.glow} border border-white/15 transition-all`}
    >
      {/* Background Decorative Blur Orbs */}
      <div className="absolute -top-12 -left-12 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Right / Center Content (Persian RTL) */}
        <div className="flex-1 space-y-4 text-center md:text-right w-full">
          {/* Stage Chip & Level Badge */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${theme.badgeBg}`}
            >
              <span>{theme.sparkle}</span>
              <span>
                مرحله {formatNumber(trophyInfo.stage, 'persian')} از {formatNumber(trophyInfo.maxStage, 'persian')}
              </span>
              <span>•</span>
              <span>{trophyInfo.stageNameFa}</span>
            </span>

            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-white/20 backdrop-blur-md text-white border border-white/20">
              <span>👑</span>
              <span>سطح {formatNumber(levelInfo.level, 'persian')}</span>
            </span>
          </div>

          {/* Trophy Title & Description */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center justify-center md:justify-start gap-2">
              <span>{trophyInfo.title}</span>
              {trophyInfo.isMax && <span>👑</span>}
            </h2>
            <p className="text-white/90 text-xs sm:text-sm font-medium mt-1">
              {trophyInfo.description}
            </p>
          </div>

          {/* Progress to Next Trophy Stage */}
          <div className="bg-black/30 backdrop-blur-md p-4 rounded-2xl border border-white/15 max-w-xl space-y-2">
            <div className="flex items-center justify-between text-xs font-black">
              <span className="text-amber-200 flex items-center gap-1">
                <span>🏆</span>
                <span>
                  پیشرفت تا {trophyInfo.isMax ? 'اوج افتخار' : 'ارتقای جام بعدی'}
                </span>
              </span>
              <span className="text-white/90">
                {formatNumber(trophyInfo.progressPercent, 'persian')}٪
              </span>
            </div>

            <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full transition-all duration-700 shadow-sm"
                style={{ width: `${Math.max(6, trophyInfo.progressPercent)}%` }}
              />
            </div>

            <p className="text-[11px] text-white/80 font-bold leading-relaxed pt-0.5">
              {trophyInfo.nextRequirementText}
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3 text-xs font-black pt-1">
            <div className="px-3.5 py-1.5 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center gap-1.5">
              <span>🏅</span>
              <span>
                {formatNumber(unlockedBadgesCount, 'persian')} از {formatNumber(totalBadgesCount, 'persian')} نشان باز شده
              </span>
            </div>

            <div className="px-3.5 py-1.5 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center gap-1.5 text-amber-200">
              <span>⭐</span>
              <span>{formatNumber(levelInfo.totalXp, 'persian')} XP کل</span>
            </div>
          </div>
        </div>

        {/* Left: Companion Character & Trophy Showcase */}
        <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
          {/* Trophy Display Widget */}
          <div className="relative group flex flex-col items-center">
            <div
              className={`w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br ${theme.trophyColor} flex items-center justify-center text-6xl sm:text-7xl shadow-2xl border-4 border-white/30 transform group-hover:scale-105 transition-transform`}
            >
              {trophyInfo.stage >= 6 ? '👑' : trophyInfo.stage >= 4 ? '🏆' : '🥇'}
            </div>
            <span className="text-[11px] font-black text-white/90 mt-2 bg-black/30 px-3 py-0.5 rounded-full border border-white/10">
              {trophyInfo.stageNameFa}
            </span>
          </div>

          {/* Child Character */}
          <div className="flex flex-col items-center">
            <img
              src={`/assets/characters/${profile.gender === 'boy' ? 'boy' : 'girl'}/proud.webp`}
              alt="قهرمان"
              className="w-32 h-32 sm:w-40 sm:h-40 object-contain drop-shadow-2xl"
            />
            <span className="text-[11px] font-bold text-white/80 mt-1.5">
              {profile.name || 'قهرمان ریاضی'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

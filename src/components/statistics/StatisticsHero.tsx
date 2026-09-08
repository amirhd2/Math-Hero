/**
 * StatisticsHero component for Math Hero.
 * Motivating hero banner highlighting child's Level, XP progression, Total Questions,
 * and Overall Accuracy with the proud character companion.
 */

import React from 'react';
import { UserProfile, CharacterPose } from '../../types';
import { Character } from '../Character';
import { formatNumber } from '../../utils/persian';
import { StatisticsSummary } from '../../statistics/statisticsTypes';
import { getLevelProgress } from '../../gamification/levelCalculator';
import { StageIcon } from '../common/StageIcon';

interface StatisticsHeroProps {
  profile: UserProfile;
  summary: StatisticsSummary;
}

export const StatisticsHero: React.FC<StatisticsHeroProps> = ({ profile, summary }) => {
  const levelInfo = getLevelProgress(profile.xp);

  let characterPose: CharacterPose = 'master';
  if (summary.accuracyPercent >= 85) {
    characterPose = 'celebrating';
  } else if (summary.accuracyPercent >= 65) {
    characterPose = 'master';
  } else {
    characterPose = 'encouraging';
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 rounded-3xl p-6 sm:p-8 text-white shadow-2xl">
      {/* Background Decorative Blur Orbs */}
      <div className="absolute -top-12 -left-12 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left/Main Column: Title, Level & Stats Overview */}
        <div className="space-y-4 text-center md:text-right w-full md:w-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black">
            <StageIcon level={levelInfo.level} size="xs" className="w-5 h-5" />
            <span>{levelInfo.title}</span>
          </div>

          <div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              کارنامه و افتخارات {profile.name}
            </h2>
            <p className="text-indigo-100 text-xs sm:text-sm font-medium mt-1">
              ببین چقدر تمرین کردی و چقدر مهارت‌هات قوی‌تر شدن!
            </p>
          </div>

          {/* Level Progress Indicator */}
          <div className="bg-black/25 backdrop-blur-md p-4 rounded-2xl border border-white/15 max-w-md space-y-2">
            <div className="flex items-center justify-between text-xs font-black">
              <span className="flex items-center gap-1.5">
                <StageIcon level={levelInfo.level} size="xs" className="w-4 h-4" />
                <span>سطح {formatNumber(levelInfo.level, 'persian')}</span>
              </span>
              <span className="text-amber-300">
                {formatNumber(levelInfo.xpInCurrentLevel, 'persian')} / {formatNumber(levelInfo.xpRequiredForNextLevel, 'persian')} XP
              </span>
            </div>
            <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full transition-all duration-700 shadow-sm"
                style={{ width: `${Math.max(4, levelInfo.progressPercent)}%` }}
              />
            </div>
          </div>

          {/* Quick Snapshot Badges */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3 text-xs font-black">
            <div className="px-3.5 py-1.5 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center gap-1.5">
              <span>🎯</span>
              <span>{formatNumber(summary.totalQuestions, 'persian')} سوال حل شده</span>
            </div>

            <div className="px-3.5 py-1.5 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center gap-1.5 text-amber-200">
              <span>🌟</span>
              <span>دقت کل: {formatNumber(summary.accuracyPercent, 'persian')}٪</span>
            </div>

            <div className="px-3.5 py-1.5 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center gap-1.5 text-emerald-200">
              <span>🔥</span>
              <span>{formatNumber(summary.currentStreak, 'persian')} روز متوالی</span>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Character */}
        <div className="flex flex-col items-center">
          <div className="p-3 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-inner">
            <Character
              character={profile.gender}
              pose={characterPose}
              size="xl"
              className="drop-shadow-lg"
            />
          </div>
          <span className="text-[11px] font-bold text-indigo-200 mt-2">
            قهرمان همیشه در حال رشد 🌱
          </span>
        </div>
      </div>
    </div>
  );
};

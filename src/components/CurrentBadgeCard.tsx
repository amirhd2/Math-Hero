import React from 'react';
import { TrophyInfo } from '../gamification/gamificationTypes';
import { formatNumber } from '../utils/persian';
import { ScreenId } from '../types';
import { getTrophyCupUrl, getTrophyCupFallbackUrl } from '../utils/assetPaths';
import { StageIcon } from './common/StageIcon';

interface CurrentBadgeCardProps {
  trophyInfo?: TrophyInfo;
  levelTitle?: string;
  level?: number;
  onNavigate?: (screen: ScreenId) => void;
}

export const CurrentBadgeCard: React.FC<CurrentBadgeCardProps> = ({
  trophyInfo,
  levelTitle,
  level = 4,
  onNavigate,
}) => {
  // Line 1: Status rank (e.g. Level 4)
  const rankStatus = `Level ${formatNumber(level, 'persian')}`;

  // Line 2: Stage title unlocked and current stage (e.g. حل‌کننده مسائل)
  const stageTitle = levelTitle || (trophyInfo && trophyInfo.stageNameFa) || 'حل‌کننده مسائل';

  // Line 3: Current earned cup title
  const currentMedalText = trophyInfo?.stageNameFa
    ? trophyInfo.stageNameFa
    : `جام مرحله ${formatNumber(level, 'persian')}`;

  const currentStage = trophyInfo?.stage || 1;

  return (
    <div
      onClick={() => onNavigate && onNavigate('achievements')}
      className="bg-white dark:bg-slate-900 rounded-[28px] sm:rounded-[32px] p-5 sm:p-6 border border-indigo-100/90 dark:border-slate-800 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group select-none relative overflow-hidden -mt-12 sm:-mt-14 md:-mt-16 lg:mt-0 z-20"
    >
      {/* Top Header with subtle lines: —— نشان و جام فعلی —— */}
      <div className="flex items-center justify-center gap-3 mb-4">
        <div className="h-[1.5px] bg-indigo-100/80 dark:bg-slate-700/80 flex-1 max-w-[64px] rounded-full" />
        <span className="text-sm font-black text-indigo-900 dark:text-indigo-300 tracking-wide">
          نشان و جام فعلی
        </span>
        <div className="h-[1.5px] bg-indigo-100/80 dark:bg-slate-700/80 flex-1 max-w-[64px] rounded-full" />
      </div>

      {/* Main Content: 3 Lines of Text on Right, Trophy Cup on Left */}
      <div className="flex items-center justify-between gap-4 sm:gap-7" dir="rtl">
        {/* Right Side (in RTL): 3 Lines of Text */}
        <div className="text-right space-y-1 sm:space-y-1.5 flex-1 max-w-[280px] sm:max-w-none">
          {/* Line 1: Status rank (e.g. Level 4) */}
          <div className="text-xs sm:text-sm font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
            <StageIcon level={level} size="xs" className="w-5 h-5 inline-block" />
            <span>{rankStatus}</span>
          </div>

          {/* Line 2: Unlocked Stage Title (e.g. حل‌کننده مسائل) */}
          <h4 className="text-xl sm:text-2xl md:text-3xl font-black text-indigo-950 dark:text-indigo-100 tracking-tight leading-snug">
            {stageTitle}
          </h4>

          {/* Line 3: Current Earned Medal / Cup */}
          <p className="text-xs sm:text-sm md:text-base font-extrabold text-amber-600 dark:text-amber-400 flex items-center gap-2">
            <img
              src={getTrophyCupUrl(currentStage)}
              alt="جام"
              className="w-5 h-5 object-contain inline-block shrink-0 filter drop-shadow"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.dataset.fallback) {
                  target.dataset.fallback = '1';
                  target.src = getTrophyCupFallbackUrl(currentStage);
                }
              }}
            />
            <span>{currentMedalText}</span>
          </p>
        </div>

        {/* Left Side (in RTL): Cup Showcase */}
        <div className="shrink-0 flex items-center justify-center transform group-hover:scale-105 group-hover:-rotate-1 transition-transform duration-300">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-amber-50 via-yellow-50 to-indigo-50/60 dark:from-slate-800 dark:via-slate-800/80 dark:to-indigo-950/40 p-2 flex items-center justify-center border-2 border-amber-200/80 dark:border-slate-700 shadow-md">
            <img
              src={getTrophyCupUrl(currentStage)}
              alt={trophyInfo?.stageNameFa || 'جام قهرمانی'}
              className="w-full h-full object-contain filter drop-shadow-md"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.dataset.fallback) {
                  target.dataset.fallback = '1';
                  target.src = getTrophyCupFallbackUrl(currentStage);
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

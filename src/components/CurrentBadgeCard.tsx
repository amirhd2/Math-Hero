import React from 'react';
import { TrophyInfo } from '../gamification/gamificationTypes';
import { formatNumber } from '../utils/persian';
import { ScreenId } from '../types';
import { getTrophyCupUrl, getTrophyCupFallbackUrl, TROPHY_CUPS } from '../utils/assetPaths';
import { StageIcon } from './common/StageIcon';

interface CurrentBadgeCardProps {
  trophyInfo?: TrophyInfo;
  levelTitle?: string;
  level?: number;
  onNavigate?: (screen: ScreenId) => void;
  className?: string;
}

export const CurrentBadgeCard: React.FC<CurrentBadgeCardProps> = ({
  trophyInfo,
  levelTitle,
  level = 4,
  onNavigate,
  className = '',
}) => {
  const currentStage = trophyInfo?.stage || 1;
  const cupName =
    trophyInfo?.stageNameFa ||
    (TROPHY_CUPS as any)?.[currentStage]?.nameFa ||
    `جام مرحله ${formatNumber(currentStage, 'persian')}`;
  const stageTitle = levelTitle || (trophyInfo && trophyInfo.stageNameFa) || 'حل‌کننده مسائل';

  return (
    <div
      onClick={() => onNavigate && onNavigate('achievements')}
      className={`bg-white dark:bg-slate-900 rounded-[28px] sm:rounded-[32px] p-4 sm:p-6 border border-indigo-100/90 dark:border-slate-800 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group select-none relative overflow-hidden ${className}`}
    >
      {/* Top Header: مدال و سطح فعلی من */}
      <div className="flex items-center justify-center gap-3 mb-4 sm:mb-5">
        <div className="h-[1.5px] bg-indigo-100/80 dark:bg-slate-700/80 flex-1 max-w-[48px] sm:max-w-[72px] rounded-full" />
        <span className="text-xs sm:text-sm font-black text-indigo-900 dark:text-indigo-300 tracking-wide flex items-center gap-1.5">
          <span>🎖️</span>
          <span>مدال و سطح فعلی من</span>
        </span>
        <div className="h-[1.5px] bg-indigo-100/80 dark:bg-slate-700/80 flex-1 max-w-[48px] sm:max-w-[72px] rounded-full" />
      </div>

      {/* Single Grid Two-Part Box (باکس تک گریدی دو بخشی) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-6 items-stretch" dir="rtl">
        {/* Right Section: Earned Cup (بخش راست: جام کسب شده) */}
        <div className="flex flex-col items-center justify-between p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-amber-50/70 via-amber-50/30 to-white dark:from-amber-950/20 dark:via-slate-800/60 dark:to-slate-900 border border-amber-200/70 dark:border-amber-900/40 text-center shadow-xs group-hover:border-amber-400/80 transition-all min-h-[140px] sm:min-h-[160px]">
          <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 flex items-center justify-center my-auto transition-transform duration-300 group-hover:scale-105">
            <img
              src={getTrophyCupUrl(currentStage)}
              alt={cupName}
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
          <span className="text-[11px] sm:text-xs font-bold text-amber-900 dark:text-amber-300 mt-2 truncate max-w-full px-1">
            {cupName}
          </span>
        </div>

        {/* Left Section: Earned Level Badge (بخش چپ: نشان سطح اخذ شده) */}
        <div className="flex flex-col items-center justify-between p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-indigo-50/70 via-indigo-50/30 to-white dark:from-indigo-950/20 dark:via-slate-800/60 dark:to-slate-900 border border-indigo-200/70 dark:border-indigo-900/40 text-center shadow-xs group-hover:border-indigo-400/80 transition-all min-h-[140px] sm:min-h-[160px]">
          <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 flex items-center justify-center my-auto transition-transform duration-300 group-hover:scale-105 p-1">
            <StageIcon
              level={level}
              size="fill"
              className="w-full h-full object-contain filter drop-shadow-md"
            />
          </div>
          <span className="text-[11px] sm:text-xs font-bold text-indigo-900 dark:text-indigo-300 mt-2 truncate max-w-full px-1">
            سطح {formatNumber(level, 'persian')} • {stageTitle}
          </span>
        </div>
      </div>
    </div>
  );
};

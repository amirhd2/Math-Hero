import React from 'react';
import { TrophyInfo } from '../../gamification/gamificationTypes';
import { formatNumber } from '../../utils/persian';
import { getTrophyCupUrl, getTrophyCupFallbackUrl, TROPHY_CUPS } from '../../utils/assetPaths';

interface TrophyPathCardProps {
  trophyInfo: TrophyInfo;
  className?: string;
}

export const TrophyPathCard: React.FC<TrophyPathCardProps> = ({
  trophyInfo,
  className = '',
}) => {
  return (
    <div
      id="trophy-path-card"
      className={`bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 ${className}`}
    >
      {/* Top Header: Title */}
      <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">🏆</span>
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100">
              مسیر جام‌های قهرمانی ریاضی
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {formatNumber(trophyInfo.stage, 'persian')} از ۶ جام قهرمانی فتح شده است
            </p>
          </div>
        </div>
      </div>

      {/* 3x2 Grid on mobile/tablet portrait, 6-col single row on tablet landscape and desktop (lg+) */}
      <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {[1, 2, 3, 4, 5, 6].map((stageNum) => {
          const cup = TROPHY_CUPS[stageNum];
          const isUnlocked = stageNum <= trophyInfo.stage;
          const isCurrent = stageNum === trophyInfo.stage;

          return (
            <div
              key={stageNum}
              className={`relative rounded-3xl p-3 sm:p-4 flex flex-col items-center justify-between transition-all group overflow-hidden border min-h-[160px] sm:min-h-[195px] ${
                isCurrent
                  ? 'bg-gradient-to-b from-amber-50/90 via-amber-50/40 to-white dark:from-amber-950/40 dark:via-slate-900 dark:to-slate-900 border-2 border-amber-400 dark:border-amber-500 shadow-lg shadow-amber-500/10 scale-[1.02]'
                  : isUnlocked
                  ? 'bg-gradient-to-b from-slate-50 to-white dark:from-slate-850 dark:to-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 shadow-sm'
                  : 'bg-slate-100/60 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 opacity-60'
              }`}
            >
              {/* Top-Left: Stage Badge ("مرحله n") */}
              <span
                className={`absolute top-2.5 left-2.5 px-2 py-0.5 rounded-xl text-[10px] sm:text-xs font-black border shadow-xs ${
                  isCurrent
                    ? 'bg-amber-400 text-slate-950 border-amber-300'
                    : isUnlocked
                    ? 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 border-slate-300 dark:border-slate-700'
                }`}
              >
                مرحله {formatNumber(stageNum, 'persian')}
              </span>

              {/* Top-Right: Unlock / Current Status Badge */}
              <div className="absolute top-2.5 right-2.5">
                {isCurrent ? (
                  <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 text-xs font-black flex items-center justify-center shadow-md animate-pulse">
                    ★
                  </span>
                ) : isUnlocked ? (
                  <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-black flex items-center justify-center shadow-md">
                    ✓
                  </span>
                ) : (
                  <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-400 text-xs flex items-center justify-center">
                    🔒
                  </span>
                )}
              </div>

              {/* Center: Extra Large Trophy Cup Image */}
              <div className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 my-auto flex items-center justify-center p-1">
                <img
                  src={getTrophyCupUrl(stageNum)}
                  alt={cup?.nameFa || `جام مرحله ${stageNum}`}
                  className={`w-full h-full object-contain filter transition-transform duration-300 ${
                    isUnlocked
                      ? 'drop-shadow-lg group-hover:scale-110'
                      : 'grayscale opacity-35 brightness-75'
                  }`}
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.dataset.fallback) {
                      target.dataset.fallback = '1';
                      target.src = getTrophyCupFallbackUrl(stageNum);
                    }
                  }}
                />
              </div>

              {/* Bottom: Only Cup Name (allowing cup image to be as big as possible) */}
              <div className="w-full text-center mt-1">
                <span
                  className={`block text-xs sm:text-sm font-black truncate px-1 ${
                    isCurrent
                      ? 'text-amber-700 dark:text-amber-300 font-extrabold'
                      : isUnlocked
                      ? 'text-slate-800 dark:text-slate-100'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {cup?.nameFa || `جام ${stageNum}`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom: Next Trophy Upgrade Progress Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50/80 via-yellow-50/50 to-orange-50/80 dark:from-amber-950/30 dark:via-slate-850 dark:to-orange-950/20 border border-amber-200/80 dark:border-amber-900/50 space-y-2.5">
        <div className="flex items-center justify-between text-xs sm:text-sm font-black">
          <span className="text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
            <span>🏆</span>
            <span>
              {trophyInfo.isMax ? 'اوج افتخار جام قهرمانی' : 'پیشرفت تا ارتقای جام بعدی'}
            </span>
          </span>
          <span className="text-amber-900 dark:text-amber-200 font-black">
            {formatNumber(trophyInfo.progressPercent, 'persian')}٪
          </span>
        </div>

        <div className="w-full h-3.5 bg-white dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-amber-200 dark:border-amber-900/60 shadow-inner">
          <div
            className="h-full bg-gradient-to-l from-amber-400 via-amber-500 to-orange-500 rounded-full transition-all duration-700 shadow-sm"
            style={{ width: `${Math.max(6, trophyInfo.progressPercent)}%` }}
          />
        </div>

        <p className="text-xs text-amber-900/80 dark:text-amber-300/80 font-bold leading-relaxed pt-0.5">
          {trophyInfo.nextRequirementText}
        </p>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { TrophyInfo } from '../../gamification/gamificationTypes';
import { formatNumber } from '../../utils/persian';
import { getTrophyCupUrl, getTrophyCupFallbackUrl, TROPHY_CUPS } from '../../utils/assetPaths';
import { PopoutOwlAvatar } from '../adaptive/PopoutOwlAvatar';

interface TrophyPathCardProps {
  trophyInfo: TrophyInfo;
  className?: string;
}

export const TrophyPathCard: React.FC<TrophyPathCardProps> = ({
  trophyInfo,
  className = '',
}) => {
  const [showGuideModal, setShowGuideModal] = useState(false);

  return (
    <div
      id="trophy-path-card"
      className={`bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 ${className}`}
    >
      {/* Top Header: Title & Bouncing Smart Owl Guide Button */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl sm:text-3xl">🏆</span>
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100">
              مسیر جام‌های قهرمانی ریاضی
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {formatNumber(trophyInfo.stage, 'persian')} از ۶ جام قهرمانی فتح شده است
            </p>
          </div>
        </div>

        {/* Bouncing Smart Owl Guide Button */}
        {!trophyInfo.isMax && (
          <button
            onClick={() => setShowGuideModal(true)}
            className="group relative flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-500 hover:to-orange-500 text-slate-950 font-black text-xs sm:text-sm shadow-md hover:shadow-lg transition-all active:scale-95 animate-bounce shrink-0 cursor-pointer border border-amber-300 dark:border-amber-600"
            title="راهنمای هوشمند دریافت جام بعدی"
          >
            <span className="relative w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center shrink-0">
              <PopoutOwlAvatar sizeClassName="w-7 h-7 sm:w-8 sm:h-8" />
            </span>
            <span className="flex items-center gap-1">
              <span>راهنما</span>
              <span className="text-xs sm:text-sm">🦉</span>
            </span>
          </button>
        )}
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
              className={`relative rounded-3xl p-3 sm:p-4 flex flex-col items-center justify-between transition-all group overflow-hidden border min-h-[150px] sm:min-h-[185px] ${
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

              {/* Bottom: Only Cup Name */}
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

      {/* Bottom: Compact Next Trophy Upgrade Progress Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-amber-50/90 via-orange-50/40 to-yellow-50/80 dark:from-amber-950/40 dark:via-slate-900 dark:to-orange-950/30 border border-amber-200/80 dark:border-amber-900/60 space-y-3 shadow-sm">
        {/* Progress Header */}
        <div className="flex items-center justify-between text-xs sm:text-sm font-black">
          <span className="text-amber-900 dark:text-amber-300 flex items-center gap-2">
            <span className="text-base sm:text-lg">🏆</span>
            <span>
              {trophyInfo.isMax
                ? 'اوج افتخار جام قهرمانی'
                : `پیشرفت تا دریافت ${trophyInfo.nextStageNameFa || 'جام بعدی'}`}
            </span>
          </span>
          <span className="text-amber-900 dark:text-amber-200 font-black px-2.5 py-0.5 rounded-xl bg-amber-200/60 dark:bg-amber-900/60 border border-amber-300/50 dark:border-amber-700/50">
            {formatNumber(trophyInfo.progressPercent, 'persian')}٪
          </span>
        </div>

        {/* Animated Progress Bar */}
        <div className="w-full h-3.5 bg-white dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-amber-200 dark:border-amber-900/60 shadow-inner">
          <div
            className="h-full bg-gradient-to-l from-amber-400 via-amber-500 to-orange-500 rounded-full transition-all duration-700 shadow-sm"
            style={{ width: `${Math.max(6, trophyInfo.progressPercent)}%` }}
          />
        </div>

        {/* Summary Row with View Full Guide Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
          <p className="text-xs sm:text-sm text-amber-950 dark:text-amber-200 font-extrabold leading-relaxed flex-1">
            {trophyInfo.nextRequirementText}
          </p>

          {!trophyInfo.isMax && (
            <button
              onClick={() => setShowGuideModal(true)}
              className="shrink-0 px-3.5 py-2 rounded-xl bg-amber-200/80 hover:bg-amber-300 dark:bg-amber-900/60 dark:hover:bg-amber-800/80 text-amber-950 dark:text-amber-100 font-black text-xs flex items-center justify-center gap-1.5 transition-all border border-amber-300/80 dark:border-amber-700/60 cursor-pointer active:scale-95"
            >
              <span>🦉</span>
              <span>راهنمای کامل</span>
              <span className="text-xs">←</span>
            </button>
          )}
        </div>
      </div>

      {/* Smart Owl Guide Banner / Modal Overlay */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-amber-200 dark:border-amber-900 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 flex items-center justify-between relative shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/90 rounded-2xl p-1 shadow-md flex items-center justify-center shrink-0">
                  <PopoutOwlAvatar sizeClassName="w-10 h-10 sm:w-12 sm:h-12" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-black text-amber-950/80">
                    <span>🦉</span>
                    <span>معلم و همسفر هوشمند ریاضی</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-950">
                    راهنمای دریافت {trophyInfo.nextStageNameFa || 'جام بعدی'}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setShowGuideModal(false)}
                className="w-9 h-9 rounded-2xl bg-white/40 hover:bg-white/70 text-slate-950 font-black flex items-center justify-center text-lg transition-all cursor-pointer"
                aria-label="بستن"
              >
                ✕
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
              {/* Top Banner Box */}
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 space-y-2">
                <div className="flex items-center justify-between text-xs sm:text-sm font-black text-amber-900 dark:text-amber-200">
                  <span>پیشرفت کلی تا ارتقای جام:</span>
                  <span className="px-2.5 py-0.5 rounded-xl bg-amber-200 dark:bg-amber-900 border border-amber-300 dark:border-amber-700">
                    {formatNumber(trophyInfo.progressPercent, 'persian')}٪
                  </span>
                </div>
                <div className="w-full h-3 bg-white dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-amber-200 dark:border-amber-900/60">
                  <div
                    className="h-full bg-gradient-to-l from-amber-400 via-amber-500 to-orange-500 rounded-full transition-all duration-700"
                    style={{ width: `${Math.max(6, trophyInfo.progressPercent)}%` }}
                  />
                </div>
                <p className="text-xs sm:text-sm font-extrabold text-amber-950 dark:text-amber-200 leading-relaxed pt-1">
                  {trophyInfo.nextRequirementText}
                </p>
              </div>

              {/* Requirements List */}
              {trophyInfo.detailedRequirements && trophyInfo.detailedRequirements.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span>📌</span>
                    <span>شرایط ۴ گانه فتح جام (بررسی وضعیت کنونی شما):</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {trophyInfo.detailedRequirements.map((req) => {
                      const getIcon = (id: string) => {
                        switch (id) {
                          case 'level':
                            return '🌟';
                          case 'badges':
                            return '🏅';
                          case 'tiers':
                            return '🧠';
                          case 'operations':
                            return '➕';
                          default:
                            return '🎯';
                        }
                      };

                      return (
                        <div
                          key={req.id}
                          className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-2.5 ${
                            req.isMet
                              ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60'
                              : 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{getIcon(req.id)}</span>
                              <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100">
                                {req.titleFa}
                              </span>
                            </div>

                            <span
                              className={`text-[11px] font-black px-2 py-0.5 rounded-lg border shrink-0 ${
                                req.isMet
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/60 dark:text-emerald-200 dark:border-emerald-700'
                                  : 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/80 dark:text-amber-200 dark:border-amber-800'
                              }`}
                            >
                              {formatNumber(req.currentValue, 'persian')} از {formatNumber(req.targetValue, 'persian')} {req.unitFa}
                            </span>
                          </div>

                          <p
                            className={`text-xs leading-relaxed font-bold ${
                              req.isMet
                                ? 'text-emerald-800 dark:text-emerald-300'
                                : 'text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {req.guidanceFa}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setShowGuideModal(false)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-orange-500 text-slate-950 font-black text-sm transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>متوجه شدم! بریم برای تمرین 💪</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * ResultsActions component.
 * Renders exactly two primary navigation actions at the bottom of the results screen:
 * 1. تالار افتخارات (Hall of Achievements)
 * 2. بازگشت به خانه (Return to Home)
 */

import React from 'react';
import { getAssetUrl } from '../../utils/assetPaths';

interface ResultsActionsProps {
  onGoHome: () => void;
  onViewAchievements: () => void;
  hasMistakes?: boolean;
  onPracticeMistakes?: () => void;
  onRetryQuiz?: () => void;
}

export const ResultsActions: React.FC<ResultsActionsProps> = ({
  onGoHome,
  onViewAchievements,
}) => {
  return (
    <nav
      aria-label="عملیات پایان آزمون"
      className="sticky bottom-4 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-3 sm:p-4 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl w-full"
    >
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 w-full">
        {/* 1. تالار افتخارات */}
        <button
          type="button"
          onClick={onViewAchievements}
          className="w-full py-3.5 sm:py-4 px-3 sm:px-6 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black rounded-2xl shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 sm:gap-2.5 cursor-pointer text-xs sm:text-base border border-amber-300/60"
          title="مشاهده نشان‌ها و افتخارات"
        >
          <img
            src={getAssetUrl('assets/cups/gold 1.webp')}
            alt=""
            className="w-5 h-5 sm:w-6 sm:h-6 object-contain shrink-0 filter drop-shadow-xs"
            loading="eager"
            decoding="async"
          />
          <span className="truncate">تالار افتخارات</span>
        </button>

        {/* 2. بازگشت به خانه */}
        <button
          type="button"
          onClick={onGoHome}
          className="w-full py-3.5 sm:py-4 px-3 sm:px-6 bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-black rounded-2xl shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 sm:gap-2.5 cursor-pointer text-xs sm:text-base border border-indigo-400/30"
          title="بازگشت به صفحه اصلی"
        >
          <span className="text-sm sm:text-lg shrink-0">🏠</span>
          <span className="truncate">بازگشت به خانه</span>
        </button>
      </div>
    </nav>
  );
};


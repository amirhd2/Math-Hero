/**
 * ResultsActions component.
 * Provides primary actions: Practice Mistakes, Try Again, and Back to Home.
 */

import React from 'react';

interface ResultsActionsProps {
  hasMistakes: boolean;
  onPracticeMistakes: () => void;
  onRetryQuiz: () => void;
  onGoHome: () => void;
}

export const ResultsActions: React.FC<ResultsActionsProps> = ({
  hasMistakes,
  onPracticeMistakes,
  onRetryQuiz,
  onGoHome,
}) => {
  return (
    <nav
      aria-label="عملیات پایان آزمون"
      className="sticky bottom-4 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col sm:flex-row items-center gap-3"
    >
      {/* Primary Action */}
      {hasMistakes ? (
        <button
          onClick={onPracticeMistakes}
          className="w-full sm:flex-1 py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>🎯</span>
          <span>تمرین روی این اشتباهات</span>
        </button>
      ) : (
        <button
          onClick={onRetryQuiz}
          className="w-full sm:flex-1 py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>🚀</span>
          <span>یک تمرین جدید دیگر</span>
        </button>
      )}

      {/* Secondary Action: Try Again */}
      {hasMistakes && (
        <button
          onClick={onRetryQuiz}
          className="w-full sm:flex-1 py-4 px-6 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
        >
          <span>🔄</span>
          <span>تکرار همین آزمون</span>
        </button>
      )}

      {/* Tertiary Action: Back to Home */}
      <button
        onClick={onGoHome}
        className="w-full sm:w-auto py-4 px-6 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-2xl transition-colors"
      >
        بازگشت به خانه
      </button>
    </nav>
  );
};

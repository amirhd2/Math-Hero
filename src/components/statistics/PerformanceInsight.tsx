/**
 * PerformanceInsight component for Math Hero Statistics.
 * Identifies Strongest Operation, Operation Needing Practice with quick action,
 * and data-driven learning feedback.
 */

import React from 'react';
import { OperationType } from '../../types';
import { PerformanceInsights } from '../../statistics/statisticsTypes';
import { formatNumber } from '../../utils/persian';

interface PerformanceInsightProps {
  insights: PerformanceInsights;
  onPractice: (operation: OperationType) => void;
}

export const PerformanceInsight: React.FC<PerformanceInsightProps> = ({
  insights,
  onPractice,
}) => {
  const { strongestOperation, needsPracticeOperation, trendTextFa } = insights;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <span>💡</span>
          <span>بینش و پیشنهاد یادگیری</span>
        </h3>
        <span className="text-xs text-slate-500 font-bold">هوشمند و اختصاصی</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strongest Operation Card */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30 rounded-3xl p-5 border border-amber-200/80 dark:border-amber-800/80 shadow-xs flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-400 text-white flex items-center justify-center text-3xl shadow-md shrink-0">
            🌟
          </div>
          <div className="space-y-1 flex-1">
            <span className="text-[11px] font-black text-amber-800 dark:text-amber-300">
              قوی‌ترین مهارت شما
            </span>
            <h4 className="font-black text-slate-800 dark:text-slate-100 text-base">
              {strongestOperation
                ? `عملیات ${strongestOperation.titleFa} (${formatNumber(
                    strongestOperation.accuracyPercent,
                    'persian'
                  )}٪ دقت)`
                : 'هنوز ثبت نشده'}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              {strongestOperation
                ? `با حل ${formatNumber(
                    strongestOperation.totalQuestions,
                    'persian'
                  )} سوال به تسلط درخشان رسیده‌ای!`
                : 'با حل چند آزمون قوی‌ترین مهارتت نمایان می‌شود.'}
            </p>
          </div>
        </div>

        {/* Operation Needing Practice Card */}
        <div className="bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/40 dark:to-violet-950/30 rounded-3xl p-5 border border-indigo-200/80 dark:border-indigo-800/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-3xl shadow-md shrink-0">
              🎯
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-black text-indigo-700 dark:text-indigo-300">
                فرصت طلایی پیشرفت
              </span>
              <h4 className="font-black text-slate-800 dark:text-slate-100 text-base">
                {needsPracticeOperation
                  ? `تمرین بیشتر در ${needsPracticeOperation.titleFa}`
                  : 'همه مهارت‌ها عالی هستند!'}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                {needsPracticeOperation
                  ? `دقت فعلی: ${formatNumber(
                      needsPracticeOperation.accuracyPercent,
                      'persian'
                    )}٪ • بیا تقویتش کنیم!`
                  : 'به تمرین‌های دوره‌ای ادامه بده.'}
              </p>
            </div>
          </div>

          {needsPracticeOperation && (
            <button
              type="button"
              onClick={() => onPractice(needsPracticeOperation.operation)}
              className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl shadow-md active:scale-95 transition-all shrink-0"
            >
              تمرین {needsPracticeOperation.titleFa} 🚀
            </button>
          )}
        </div>
      </div>

      {/* Motivational Trend Note */}
      {trendTextFa && (
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-3">
          <span className="text-lg">💬</span>
          <span>{trendTextFa}</span>
        </div>
      )}
    </div>
  );
};

/**
 * OperationStatCard component for Math Hero Statistics.
 * Displays individual operation performance (Addition, Subtraction, Multiplication, Division)
 * with accuracy bar, questions solved count, tier badge, and quick practice action.
 */

import React from 'react';
import { OperationStatistics } from '../../statistics/statisticsTypes';
import { formatNumber } from '../../utils/persian';

interface OperationStatCardProps {
  stat: OperationStatistics;
  onPractice: (operation: OperationStatistics['operation']) => void;
}

export const OperationStatCard: React.FC<OperationStatCardProps> = ({ stat, onPractice }) => {
  const isUnpracticed = stat.totalQuestions === 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4">
      {/* Top: Operation Symbol, Title and Tier Badge */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg shadow-xs">
              {stat.symbol}
            </span>
            <div>
              <h4 className="font-black text-slate-800 dark:text-slate-100 text-sm">
                عملیات {stat.titleFa}
              </h4>
              <p className="text-[11px] text-slate-400 font-medium">
                {isUnpracticed
                  ? 'هنوز تمرین نشده'
                  : `${formatNumber(stat.totalQuestions, 'persian')} سوال حل شده`}
              </p>
            </div>
          </div>

          <span
            className={`text-xs px-2.5 py-1 rounded-xl font-black border flex items-center gap-1 ${
              isUnpracticed
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                : `${stat.tierConfig.badgeBg} ${stat.tierConfig.badgeText} ${stat.tierConfig.badgeBorder}`
            }`}
          >
            <span>{isUnpracticed ? '🌱' : stat.tierConfig.icon}</span>
            <span>{isUnpracticed ? 'آماده شروع' : stat.tierConfig.labelFa}</span>
          </span>
        </div>

        {/* Accuracy and Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs font-black">
            <span className="text-slate-500 dark:text-slate-400">میزان تسلط و دقت</span>
            <span
              className={
                isUnpracticed
                  ? 'text-slate-400'
                  : 'text-slate-800 dark:text-slate-100 font-black'
              }
            >
              {isUnpracticed ? '—' : `${formatNumber(stat.accuracyPercent, 'persian')}٪`}
            </span>
          </div>

          <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isUnpracticed ? 'bg-transparent' : stat.tierConfig.barColor
              }`}
              style={{ width: `${isUnpracticed ? 0 : stat.accuracyPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer: Stats Summary & Action */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
        <div className="text-[11px] text-slate-500">
          <span>{formatNumber(stat.correctAnswers, 'persian')} درست</span>
          {stat.mistakesCount > 0 && (
            <span className="text-rose-500 mr-1.5">
              • {formatNumber(stat.mistakesCount, 'persian')} نیاز به مرور
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => onPractice(stat.operation)}
          className="text-xs font-black text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 active:scale-95 transition-transform"
        >
          <span>تمرین {stat.titleFa}</span>
          <span>←</span>
        </button>
      </div>
    </div>
  );
};

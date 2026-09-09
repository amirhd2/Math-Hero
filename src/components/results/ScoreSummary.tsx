/**
 * ScoreSummary component.
 * Displays score percentage, correct/incorrect counters, total questions, elapsed time, and mode details.
 */

import React from 'react';
import { QuizResult } from '../../types';
import { formatNumber } from '../../utils/persian';
import { extractOperationBreakdownFromQuizResult, PRIMARY_OPERATIONS } from '../../utils/operationEvidence';

interface ScoreSummaryProps {
  result: QuizResult;
}

export const ScoreSummary: React.FC<ScoreSummaryProps> = ({ result }) => {
  const isPractice = result.mode === 'practice';
  const breakdown = extractOperationBreakdownFromQuizResult(result);
  const activeOps = PRIMARY_OPERATIONS.filter((op) => breakdown[op] && breakdown[op].totalQuestions > 0);
  const isCombined = result.operation === 'mixed' || activeOps.length > 1;

  const formatTime = (seconds: number) => {
    if (seconds < 60) {
      return `${formatNumber(seconds, 'persian')} ثانیه`;
    }
    const mins = Math.floor(seconds / 60);
    const remSecs = seconds % 60;
    if (remSecs === 0) {
      return `${formatNumber(mins, 'persian')} دقیقه`;
    }
    return `${formatNumber(mins, 'persian')} دقیقه و ${formatNumber(remSecs, 'persian')} ثانیه`;
  };

  const getOperationLabel = (op: string) => {
    switch (op) {
      case 'addition':
        return 'جمع ➕';
      case 'subtraction':
        return 'تفریق ➖';
      case 'multiplication':
        return 'ضرب ✖️';
      case 'division':
        return 'تقسیم ➗';
      default:
        return 'ترکیبی 🏆';
    }
  };

  return (
    <section
      aria-label="خلاصه نمرات آزمون"
      className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6"
    >
      {/* Top row: Mode badge & Operation */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">عملیات:</span>
          <span className="px-3 py-1 rounded-xl text-xs font-black bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            {getOperationLabel(result.operation)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-xl text-xs font-black border ${
              isPractice
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
            }`}
          >
            {isPractice ? '🎯 حالت تمرین' : '⏱️ حالت آزمون'}
          </span>
        </div>
      </div>

      {/* Primary Score Ring / Stat Highlights */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 flex-wrap">
        {/* Big percentage callout */}
        <div className="flex items-center gap-4">
          <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-3xl bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center border-2 border-indigo-500/20 dark:border-indigo-500/30 shadow-inner">
            <span className="text-3xl md:text-4xl font-black text-indigo-600 dark:text-indigo-400">
              {formatNumber(result.score, 'persian')}٪
            </span>
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">نمره کل</span>
          </div>

          <div className="space-y-1 text-right">
            <h2 className="text-base md:text-lg font-black text-slate-800 dark:text-slate-100">
              دقت پاسخ‌گویی شما
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              زمان ثبت شده: {formatTime(result.timeElapsed)}
            </p>
          </div>
        </div>

        {/* Breakdown boxes: Correct / Incorrect / Total */}
        <div className="grid grid-cols-3 gap-3 w-full sm:w-auto">
          {/* Correct */}
          <div className="bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80 p-3.5 rounded-2xl text-center min-w-[72px]">
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 block mb-0.5">
              درست ✅
            </span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {formatNumber(result.correctCount, 'persian')}
            </span>
          </div>

          {/* Incorrect */}
          <div className="bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-800/80 p-3.5 rounded-2xl text-center min-w-[72px]">
            <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300 block mb-0.5">
              اشتباه ❌
            </span>
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
              {formatNumber(result.incorrectCount, 'persian')}
            </span>
          </div>

          {/* Total */}
          <div className="bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-3.5 rounded-2xl text-center min-w-[72px]">
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-0.5">
              کل سوالات
            </span>
            <span className="text-2xl font-black text-slate-800 dark:text-slate-200">
              {formatNumber(result.totalQuestions, 'persian')}
            </span>
          </div>
        </div>
      </div>

      {/* Optional Combined Quiz Operations Breakdown */}
      {isCombined && activeOps.length > 0 && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 block mb-2 text-right">
            تفکیک عملکرد در هر عملیات:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {activeOps.map((op) => {
              const stat = breakdown[op];
              const opTitle =
                op === 'addition'
                  ? 'جمع ➕'
                  : op === 'subtraction'
                  ? 'تفریق ➖'
                  : op === 'multiplication'
                  ? 'ضرب ✖️'
                  : 'تقسیم ➗';
              return (
                <div
                  key={op}
                  className="bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 rounded-xl p-2.5 text-center flex flex-col justify-between"
                >
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    {opTitle}
                  </span>
                  <div className="flex items-center justify-center gap-1.5 mt-1 text-xs font-black">
                    <span className="text-emerald-600 dark:text-emerald-400">
                      {formatNumber(stat.correctCount, 'persian')}/{formatNumber(stat.totalQuestions, 'persian')}
                    </span>
                    <span className="text-slate-400 text-[10px]">
                      ({formatNumber(stat.accuracy, 'persian')}٪)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};

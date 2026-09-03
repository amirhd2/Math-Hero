/**
 * KeyStatsGrid component for Math Hero Statistics.
 * Compact visual cards summarizing key learning figures without cognitive overload.
 */

import React from 'react';
import { formatNumber } from '../../utils/persian';
import { StatisticsSummary } from '../../statistics/statisticsTypes';

interface KeyStatsGridProps {
  summary: StatisticsSummary;
}

export const KeyStatsGrid: React.FC<KeyStatsGridProps> = ({ summary }) => {
  const avgResponseTimeSec = (summary.averageResponseTimeMs / 1000).toFixed(1);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <span>📊</span>
          <span>آمار کلیدی قهرمان</span>
        </h3>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
          {summary.totalQuizzes > 0
            ? `${formatNumber(summary.totalQuizzes, 'persian')} آزمون ثبت شده`
            : 'بدون آزمون'}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* 1. Questions Solved */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xl sm:text-2xl">🎯</span>
            <span className="text-[11px] font-bold text-slate-400">سوالات</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">
            {formatNumber(summary.totalQuestions, 'persian')}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {formatNumber(summary.correctAnswers, 'persian')} پاسخ درست
          </p>
        </div>

        {/* 2. Overall Accuracy */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xl sm:text-2xl">⭐</span>
            <span className="text-[11px] font-bold text-slate-400">میانگین دقت</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {formatNumber(summary.accuracyPercent, 'persian')}٪
          </p>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
            <span>تمرین: {formatNumber(summary.practiceAccuracyPercent, 'persian')}٪</span>
            <span>•</span>
            <span>آزمون: {formatNumber(summary.testAccuracyPercent, 'persian')}٪</span>
          </div>
        </div>

        {/* 3. XP Earned */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xl sm:text-2xl">🚀</span>
            <span className="text-[11px] font-bold text-slate-400">مجموع امتیاز</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-500">
            {formatNumber(summary.totalXp, 'persian')}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">امتیاز تجربه (XP)</p>
        </div>

        {/* 4. Streaks */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xl sm:text-2xl">🔥</span>
            <span className="text-[11px] font-bold text-slate-400">زنجیره تمرین</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-rose-500">
            {formatNumber(summary.currentStreak, 'persian')}{' '}
            <span className="text-sm font-bold text-slate-500">روز</span>
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            بهترین رکورد: {formatNumber(summary.bestStreak, 'persian')} روز
          </p>
        </div>

        {/* 5. Perfect Quizzes (100% score) */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xl sm:text-2xl">💯</span>
            <span className="text-[11px] font-bold text-slate-400">بدون اشتباه</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-violet-600 dark:text-violet-400">
            {formatNumber(summary.perfectQuizzesCount, 'persian')}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">آزمون با نمره ۱۰۰٪</p>
        </div>

        {/* 6. Response Time */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xl sm:text-2xl">⏱️</span>
            <span className="text-[11px] font-bold text-slate-400">میانگین زمان</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-sky-600 dark:text-sky-400">
            {summary.averageResponseTimeMs > 0
              ? formatNumber(avgResponseTimeSec, 'persian')
              : '—'}{' '}
            <span className="text-sm font-bold text-slate-500">ثانیه</span>
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            دقت و یادگیری مهم‌تر از سرعت است
          </p>
        </div>
      </div>
    </div>
  );
};

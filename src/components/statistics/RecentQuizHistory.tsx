/**
 * RecentQuizHistory component for Math Hero Statistics.
 * Compact history of recent completed quizzes with item detail modal trigger.
 */

import React, { useState } from 'react';
import { QuizResult } from '../../types';
import { formatNumber, toPersianDigits } from '../../utils/persian';
import { QuizDetailModal } from './QuizDetailModal';

interface RecentQuizHistoryProps {
  results: QuizResult[];
}

export const RecentQuizHistory: React.FC<RecentQuizHistoryProps> = ({ results }) => {
  const [showAll, setShowAll] = useState(false);
  const [selectedResult, setSelectedResult] = useState<QuizResult | null>(null);

  const displayedResults = showAll ? results : results.slice(0, 5);

  const getOpBadge = (op: string) => {
    switch (op) {
      case 'addition':
        return { title: 'جمع', icon: '➕', bg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' };
      case 'subtraction':
        return { title: 'تفریق', icon: '➖', bg: 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300' };
      case 'multiplication':
        return { title: 'ضرب', icon: '✖️', bg: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300' };
      case 'division':
        return { title: 'تقسیم', icon: '➗', bg: 'bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300' };
      default:
        return { title: 'مخلوط', icon: '🎯', bg: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300' };
    }
  };

  const formatDate = (ts: number) => {
    try {
      const d = new Date(ts);
      const now = new Date();
      const isToday =
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear();

      if (isToday) {
        return `امروز، ${toPersianDigits(d.getHours().toString().padStart(2, '0'))}:${toPersianDigits(
          d.getMinutes().toString().padStart(2, '0')
        )}`;
      }

      return new Intl.DateTimeFormat('fa-IR', {
        month: 'short',
        day: 'numeric',
      }).format(d);
    } catch {
      return '';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
      {/* Header with Title and View All Toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <span>🕒</span>
          <span>تاریخچه آخرین تمرین‌ها</span>
        </h3>

        {results.length > 5 && (
          <button
            type="button"
            onClick={() => setShowAll((prev) => !prev)}
            className="text-xs font-black text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            {showAll
              ? 'نمایش ۵ تای اخیر'
              : `مشاهده همه (${formatNumber(results.length, 'persian')})`}
          </button>
        )}
      </div>

      {results.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-6">
          هنوز تمرینی انجام نشده است.
        </p>
      ) : (
        <div className="space-y-2.5">
          {displayedResults.map((r) => {
            const badge = getOpBadge(r.operation);
            return (
              <div
                key={r.id}
                onClick={() => setSelectedResult(r)}
                className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50/50 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-700/70 transition-all cursor-pointer flex items-center justify-between gap-3 group"
              >
                {/* Left: Operation & Date */}
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-700 flex items-center justify-center text-lg shadow-xs group-hover:scale-105 transition-transform shrink-0">
                    {badge.icon}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-slate-800 dark:text-slate-100 text-xs sm:text-sm">
                        {badge.title}
                      </h4>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-md ${badge.bg}`}
                      >
                        {r.mode === 'test' ? 'آزمون' : 'تمرین'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {formatDate(r.timestamp)} •{' '}
                      {formatNumber(r.correctCount, 'persian')} از{' '}
                      {formatNumber(r.totalQuestions, 'persian')} درست
                    </p>
                  </div>
                </div>

                {/* Right: Score & XP */}
                <div className="flex items-center gap-4 text-left">
                  <div>
                    <p className="text-sm sm:text-base font-black text-indigo-600 dark:text-indigo-400">
                      {formatNumber(r.score, 'persian')}٪
                    </p>
                    <p className="text-[11px] font-bold text-amber-500">
                      +{formatNumber(r.xpEarned, 'persian')} XP
                    </p>
                  </div>

                  <span className="text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 text-xs font-bold transition-colors">
                    ←
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quiz Detail Modal */}
      <QuizDetailModal result={selectedResult} onClose={() => setSelectedResult(null)} />
    </div>
  );
};

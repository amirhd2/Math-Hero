/**
 * StickyReviewStack component.
 * Implements a scroll-based overlapping sticky card deck for reviewing mistake questions.
 */

import React from 'react';
import { MistakeRecord, Gender } from '../../types';
import { ReviewCard } from './ReviewCard';
import { formatNumber } from '../../utils/persian';

interface StickyReviewStackProps {
  mistakes?: MistakeRecord[];
  gender?: Gender;
}

export const StickyReviewStack: React.FC<StickyReviewStackProps> = ({
  mistakes = [],
  gender = 'boy',
}) => {
  if (!mistakes || mistakes.length === 0) {
    return (
      <section
        aria-label="مرور سوالات"
        className="bg-emerald-50/70 dark:bg-emerald-950/40 border-2 border-dashed border-emerald-300 dark:border-emerald-800 rounded-3xl p-8 text-center space-y-3"
      >
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center text-3xl mx-auto shadow-inner">
          🎉
        </div>
        <h3 className="text-lg font-black text-emerald-900 dark:text-emerald-200">
          آفرین قهرمان! نمره ۲۰ کامل!
        </h3>
        <p className="text-sm font-medium text-emerald-800/80 dark:text-emerald-300/80 max-w-md mx-auto">
          در این آزمون به تمام سوالات پاسخ درست دادی و هیچ اشتباهی برای مرور نداری! فوق‌العاده بودی.
        </p>
      </section>
    );
  }

  return (
    <section aria-label="بخش مرور اشتباهات" className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">📚</span>
          <h3 className="text-lg md:text-xl font-black text-slate-800 dark:text-slate-100">
            مرور و یادگیری اشتباهات
          </h3>
        </div>

        <span className="px-3.5 py-1 rounded-full text-xs font-black bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 shadow-sm">
          {formatNumber(mistakes.length, 'persian')} سوال نیازمند مرور
        </span>
      </div>

      <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 px-2 leading-relaxed">
        برای تسلط بیشتر، کارت‌ها را به سمت پایین پیمایش کنید و نکات هر سوال را به خاطر بسپارید.
      </p>

      {/* Overlapping Sticky Stack Container */}
      <div className="relative pt-2 pb-6 space-y-4">
        {mistakes.map((mistake, index) => {
          // Calculate incremental sticky top offset so cards overlap visually like a deck
          const topOffset = Math.min(160, 72 + index * 12);
          const zIndex = index + 1;

          return (
            <div
              key={mistake.id || `mistake_${index}`}
              style={{
                top: `${topOffset}px`,
                zIndex,
              }}
              className="sticky transition-transform"
            >
              <ReviewCard
                mistake={mistake}
                index={index}
                totalMistakes={mistakes.length}
                gender={gender}
                style={{
                  transform: `translateY(${index * 2}px)`,
                }}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
};

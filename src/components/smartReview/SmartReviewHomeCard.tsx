/**
 * SmartReviewHomeCard component for Math Hero.
 * Compact, visually prominent entry point for Smart Review & Adaptive Practice on Home Screen.
 * Adapts to three states: No Data, Needs Practice, and Strong Performance.
 */

import React, { useEffect, useState } from 'react';
import { SmartReviewState } from '../../smartReview/smartReviewTypes';
import { getSmartReviewState } from '../../smartReview/smartReviewEngine';
import { formatNumber } from '../../utils/persian';

interface SmartReviewHomeCardProps {
  onStartSmartReview: () => void;
  onOpenQuickQuiz: () => void;
}

export const SmartReviewHomeCard: React.FC<SmartReviewHomeCardProps> = ({
  onStartSmartReview,
  onOpenQuickQuiz,
}) => {
  const [reviewState, setReviewState] = useState<SmartReviewState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getSmartReviewState().then((state) => {
      if (isMounted) {
        setReviewState(state);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="rounded-3xl p-6 bg-indigo-50/50 dark:bg-slate-900/60 border border-indigo-100 dark:border-slate-800 animate-pulse flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-indigo-200 dark:bg-slate-800 rounded-md" />
          <div className="h-6 w-48 bg-indigo-300 dark:bg-slate-700 rounded-md" />
        </div>
      </div>
    );
  }

  // 1. No Data State (Requirement 16 & 29)
  if (!reviewState || !reviewState.hasEnoughData) {
    return (
      <div
        id="smart-review-home-card"
        className="relative overflow-hidden rounded-3xl p-5 sm:p-6 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-700 text-white shadow-xl border border-indigo-400/30 flex flex-col xl:flex-row items-center justify-between gap-5 h-full"
      >
        <div className="flex items-center gap-4 text-center xl:text-right flex-col sm:flex-row xl:flex-row">
          <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-3xl shadow-inner shrink-0">
            🤖
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-black justify-center xl:justify-start">
              <span>⭐</span>
              <span>مرور هوشمند تطبیقی</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black">
              ابتدا چند آزمون را کامل کن!
            </h3>
            <p className="text-xs sm:text-sm text-indigo-100 max-w-md">
              مرور هوشمند برای شناسایی نقاط قوت و اشتباهاتت، به اطلاعات چند آزمون نیاز دارد.
            </p>
          </div>
        </div>

        <button
          type="button"
          id="btn-smart-review-start-first"
          onClick={onOpenQuickQuiz}
          className="w-full xl:w-auto px-6 py-3 bg-white text-indigo-950 hover:bg-indigo-50 font-black text-xs sm:text-sm rounded-2xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <span>شروع اولین آزمون</span>
          <span>🚀</span>
        </button>
      </div>
    );
  }

  // 2. High Mastery / Strong Performance State (Requirement 29)
  const isHighMastery =
    reviewState.dataTier === 'full' &&
    reviewState.targetSkills.every((s) => s.confidence === 'strong' || s.confidence === 'mastered');

  if (isHighMastery) {
    return (
      <div
        id="smart-review-home-card"
        className="relative overflow-hidden rounded-3xl p-5 sm:p-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 text-white shadow-xl border border-emerald-400/30 flex flex-col xl:flex-row items-center justify-between gap-5 h-full"
      >
        <div className="flex items-center gap-4 text-center xl:text-right flex-col sm:flex-row xl:flex-row">
          <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-3xl shadow-inner shrink-0">
            👑
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-black justify-center xl:justify-start">
              <span>🌟</span>
              <span>مرور هوشمند</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black">
              مهارت‌هایت را در اوج نگه دار!
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-md">
              تسلط شما بسیار عالی است! این آزمون مهارت‌هایت را با چالش‌های متنوع تازه نگه می‌دارد.
            </p>
          </div>
        </div>

        <button
          type="button"
          id="btn-smart-review-start-sharp"
          onClick={onStartSmartReview}
          className="w-full xl:w-auto px-6 py-3.5 bg-amber-400 text-slate-950 hover:bg-amber-300 font-black text-xs sm:text-sm rounded-2xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <span>شروع مرور و تثبیت (۱۰ سوال)</span>
          <span>⚡</span>
        </button>
      </div>
    );
  }

  // 3. Normal / Targeted Practice State (Needs Support or Developing)
  return (
    <div
      id="smart-review-home-card"
      className="relative overflow-hidden rounded-3xl p-5 sm:p-7 bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white shadow-xl border border-indigo-600/40 flex flex-col xl:flex-row items-center justify-between gap-6 h-full"
    >
      <div className="flex flex-col sm:flex-row items-center xl:items-start gap-4 text-center xl:text-right flex-1">
        <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center text-3xl shadow-lg shrink-0">
          ⭐
        </div>
        <div className="space-y-2 flex flex-col items-center sm:items-start">
          <div className="flex flex-wrap items-center justify-center xl:justify-start gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-xs font-black">
              مرور هوشمند
            </span>
            <span className="text-xs font-bold text-indigo-200">
              بر اساس تحلیل خودکار عملکرد شما
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black">
            {reviewState.headlineInsightFa}
          </h3>

          {reviewState.subInsightFa && (
            <p className="text-xs sm:text-sm text-indigo-100/90 max-w-xl leading-relaxed">
              {reviewState.subInsightFa}
            </p>
          )}

          {/* Child-friendly skill pills */}
          <div className="flex flex-wrap items-center justify-center xl:justify-start gap-2 pt-1">
            {reviewState.targetSkills.slice(0, 3).map((skill) => (
              <span
                key={skill.skillId}
                className="px-3 py-1 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-[11px] font-bold text-indigo-100 flex items-center gap-1.5"
              >
                <span>🎯</span>
                <span>{skill.titleFa}</span>
              </span>
            ))}
            {reviewState.unresolvedMistakeCount > 0 && (
              <span className="px-3 py-1 rounded-xl bg-rose-500/30 border border-rose-400/30 text-[11px] font-bold text-rose-200">
                {formatNumber(reviewState.unresolvedMistakeCount, 'persian')} اشتباه نیازمند تمرین
              </span>
            )}
          </div>
        </div>
      </div>

      <button
        type="button"
        id="btn-smart-review-start"
        onClick={onStartSmartReview}
        className="w-full xl:w-auto px-7 py-4 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-sm sm:text-base rounded-2xl shadow-xl shadow-amber-400/20 transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-3 cursor-pointer shrink-0"
      >
        <span>شروع مرور هوشمند</span>
        <span className="bg-slate-950/10 px-2 py-0.5 rounded-lg text-xs font-black">
          ۱۰ سوال
        </span>
        <span>🚀</span>
      </button>
    </div>
  );
};

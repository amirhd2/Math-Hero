/**
 * SmartReviewHomeCard component for Math Hero.
 * Compact, visually prominent entry point for Smart Review & Adaptive Practice on Home Screen.
 * Adapts to three states: No Data, Needs Practice, and Strong Performance.
 * Fully responsive across all display sizes (mobile, tablet, desktop, ultrawide).
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
      <div className="rounded-3xl p-6 sm:p-8 bg-indigo-50/50 dark:bg-slate-900/60 border border-indigo-100 dark:border-slate-800 animate-pulse flex flex-col justify-between gap-6 h-full">
        <div className="space-y-3">
          <div className="h-4 w-28 bg-indigo-200 dark:bg-slate-800 rounded-md" />
          <div className="h-7 w-48 bg-indigo-300 dark:bg-slate-700 rounded-md" />
          <div className="h-4 w-64 bg-indigo-200 dark:bg-slate-800 rounded-md" />
        </div>
        <div className="h-12 w-full bg-indigo-200 dark:bg-slate-800 rounded-2xl" />
      </div>
    );
  }

  // 1. No Data State (First time users)
  if (!reviewState || !reviewState.hasEnoughData) {
    return (
      <div
        id="smart-review-home-card"
        className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 text-white shadow-xl border border-indigo-400/30 flex flex-col justify-between gap-6 h-full"
      >
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-3 relative z-10 text-right">
          {/* Header Row */}
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-black">
              <span>⭐</span>
              <span>مرور هوشمند تطبیقی</span>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner shrink-0">
              🤖
            </div>
          </div>

          {/* Headline & Description */}
          <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
            ابتدا چند آزمون را کامل کن!
          </h3>
          <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed font-medium">
            مرور هوشمند برای شناسایی خودکار نقاط قوت و اشتباهاتت، به اطلاعات و نتایج چند آزمون اولیه نیاز دارد.
          </p>
        </div>

        {/* Action Button */}
        <button
          type="button"
          id="btn-smart-review-start-first"
          onClick={onOpenQuickQuiz}
          className="relative z-10 w-full py-3.5 sm:py-4 bg-white hover:bg-indigo-50 text-indigo-950 font-black text-xs sm:text-sm rounded-2xl shadow-xl transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>🚀</span>
          <span>شروع اولین آزمون</span>
        </button>
      </div>
    );
  }

  // 2. High Mastery / Strong Performance State
  const isHighMastery =
    reviewState.dataTier === 'full' &&
    reviewState.targetSkills.every((s) => s.confidence === 'strong' || s.confidence === 'mastered');

  if (isHighMastery) {
    return (
      <div
        id="smart-review-home-card"
        className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-emerald-600 via-teal-600 to-indigo-700 text-white shadow-xl border border-emerald-400/30 flex flex-col justify-between gap-6 h-full"
      >
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-3 relative z-10 text-right">
          {/* Header Row */}
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-black">
              <span>🌟</span>
              <span>مرور هوشمند قهرمان</span>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner shrink-0">
              👑
            </div>
          </div>

          {/* Headline & Description */}
          <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
            مهارت‌هایت را در اوج نگه دار!
          </h3>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-medium">
            تسلط شما بسیار عالی است! این مرور سریع مهارت‌های محاسباتی‌ات را با چالش‌های متنوع در اوج آمادگی نگه می‌دارد.
          </p>
        </div>

        {/* Action Button */}
        <button
          type="button"
          id="btn-smart-review-start-sharp"
          onClick={onStartSmartReview}
          className="relative z-10 w-full py-3.5 sm:py-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-xl shadow-amber-400/20 transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>⚡</span>
          <span>شروع مرور و تثبیت (۱۰ سوال)</span>
        </button>
      </div>
    );
  }

  // 3. Normal / Targeted Practice State (Needs Support or Developing)
  return (
    <div
      id="smart-review-home-card"
      className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white shadow-xl border border-indigo-500/40 flex flex-col justify-between gap-6 h-full"
    >
      <div className="absolute -top-12 -left-12 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Body Area */}
      <div className="space-y-3.5 relative z-10 text-right">
        {/* Header Row: Category Badge on right, Star on left */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black shadow-xs">
              مرور هوشمند
            </span>
            <span className="text-xs font-bold text-indigo-200/90">
              تحلیل خودکار عملکرد شما
            </span>
          </div>

          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center text-xl sm:text-2xl shadow-lg shrink-0">
            ⭐
          </div>
        </div>

        {/* Headline */}
        <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-tight tracking-tight">
          {reviewState.headlineInsightFa}
        </h3>

        {/* Sub-Insight */}
        {reviewState.subInsightFa && (
          <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed font-medium">
            {reviewState.subInsightFa}
          </p>
        )}

        {/* Target Skill Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {reviewState.targetSkills.slice(0, 3).map((skill) => (
            <span
              key={skill.skillId}
              className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-[11px] sm:text-xs font-bold text-indigo-100 flex items-center gap-1.5 shadow-xs"
            >
              <span>🎯</span>
              <span>{skill.titleFa}</span>
            </span>
          ))}
          {reviewState.unresolvedMistakeCount > 0 && (
            <span className="px-3 py-1.5 rounded-xl bg-rose-500/30 border border-rose-400/40 text-[11px] sm:text-xs font-bold text-rose-100 flex items-center gap-1.5 shadow-xs">
              <span>⚠️</span>
              <span>{formatNumber(reviewState.unresolvedMistakeCount, 'persian')} اشتباه نیازمند تمرین</span>
            </span>
          )}
        </div>
      </div>

      {/* Action Button: Aligned at bottom, full width */}
      <button
        type="button"
        id="btn-smart-review-start"
        onClick={onStartSmartReview}
        className="relative z-10 w-full py-3.5 sm:py-4 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-sm sm:text-base rounded-2xl shadow-xl shadow-amber-400/20 transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer"
      >
        <span>🚀</span>
        <span>شروع مرور هوشمند</span>
        <span className="bg-slate-950/10 px-2.5 py-0.5 rounded-lg text-xs font-black">
          ۱۰ سوال
        </span>
      </button>
    </div>
  );
};

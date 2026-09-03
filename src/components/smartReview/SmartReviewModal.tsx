/**
 * SmartReviewModal component for Math Hero.
 * Child-friendly preview showing targeted skills and explanation before starting.
 */

import React from 'react';
import { SmartReviewState } from '../../smartReview/smartReviewTypes';
import { getConfidenceBadge } from '../../smartReview/skillModel';
import { formatNumber } from '../../utils/persian';

interface SmartReviewModalProps {
  isOpen: boolean;
  state: SmartReviewState | null;
  onClose: () => void;
  onStart: () => void;
}

export const SmartReviewModal: React.FC<SmartReviewModalProps> = ({
  isOpen,
  state,
  onClose,
  onStart,
}) => {
  if (!isOpen || !state) return null;

  const targetSkills = state.targetSkills.slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="smart-review-modal"
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 text-right"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-center font-bold text-xl transition-colors cursor-pointer"
          >
            ✕
          </button>
          <div className="flex items-center gap-3">
            <div>
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">
                مرور هوشمند و تمرین تطبیقی
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                برنامه‌ریزی خودکار بر اساس عملکرد واقعی شما
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl shadow-inner shrink-0">
              🤖
            </div>
          </div>
        </div>

        {/* Child-friendly message */}
        <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 space-y-1">
          <p className="text-sm font-bold text-indigo-950 dark:text-indigo-200">
            {state.headlineInsightFa}
          </p>
          <p className="text-xs text-indigo-800/80 dark:text-indigo-300 leading-relaxed">
            قهرمان ریاضی مهارت‌هایی که نیاز به کمی تمرین بیشتر دارند را پیدا کرده و این ۱۰ سوال را اختصاصی برای شما آماده کرده است.
          </p>
        </div>

        {/* Target Skills List */}
        <div className="space-y-3">
          <div className="text-xs font-black text-slate-400 uppercase tracking-wider">
            مهارت‌های انتخابی برای این آزمون:
          </div>

          <div className="space-y-2">
            {targetSkills.map((skill) => {
              const badge = getConfidenceBadge(skill.confidence);
              return (
                <div
                  key={skill.skillId}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800"
                >
                  <span className={`px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1.5 ${badge.badgeBg} ${badge.badgeText}`}>
                    <span>{badge.icon}</span>
                    <span>{badge.labelFa}</span>
                  </span>

                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      {skill.titleFa}
                    </span>
                    <span className="text-lg">
                      {skill.operation === 'addition'
                        ? '➕'
                        : skill.operation === 'subtraction'
                        ? '➖'
                        : skill.operation === 'multiplication'
                        ? '✖️'
                        : '➗'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            id="btn-confirm-smart-review-start"
            onClick={onStart}
            className="flex-1 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black text-sm sm:text-base rounded-2xl shadow-xl shadow-indigo-500/25 transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>شروع آزمون هوشمند</span>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-lg">
              {formatNumber(10, 'persian')} سوال
            </span>
            <span>🚀</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            بعداً
          </button>
        </div>
      </div>
    </div>
  );
};

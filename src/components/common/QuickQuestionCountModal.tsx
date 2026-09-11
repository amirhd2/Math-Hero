import React, { useState } from 'react';
import { toPersianDigits } from '../../utils/persian';

export interface QuickQuestionCountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (questionCount: number) => void;
  title: string;
  subtitle?: string;
  icon?: string;
  mode: 'test' | 'practice';
  options?: number[];
  defaultCount?: number;
  colorGradient?: string;
  badgeText?: string;
}

export const QuickQuestionCountModal: React.FC<QuickQuestionCountModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  subtitle,
  icon = '🎯',
  mode,
  options = [5, 10, 15, 20],
  defaultCount = 10,
  colorGradient = 'from-indigo-600 to-violet-600',
  badgeText,
}) => {
  const [selectedCount, setSelectedCount] = useState<number>(defaultCount);

  if (!isOpen) return null;

  // XP calculation per question count: 5 XP per question base, + bonus for larger sets
  const getRewardXp = (count: number) => {
    switch (count) {
      case 5:
        return 25;
      case 10:
        return 50;
      case 15:
        return 80;
      case 20:
        return 120;
      default:
        return count * 5;
    }
  };

  const isTest = mode === 'test';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
      dir="rtl"
      role="dialog"
      aria-modal="true"
    >
      <div
        id="quick-question-count-modal"
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 text-right"
      >
        {/* Header with Close Button */}
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-center font-bold text-lg transition-colors cursor-pointer"
            aria-label="بستن"
          >
            ✕
          </button>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end">
                <span
                  className={`text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-xs ${
                    isTest
                      ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                      : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                  }`}
                >
                  {badgeText || (isTest ? '🏆 حالت آزمون' : '🌱 حالت تمرینی')}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 mt-1">
                {title}
              </h3>
            </div>
            <div
              className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colorGradient} text-white flex items-center justify-center text-2xl shadow-md shrink-0`}
            >
              {icon}
            </div>
          </div>
        </div>

        {/* Subtitle / Mode Info */}
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
          {subtitle ||
            (isTest
              ? 'تعداد سوالات مورد نظرت رو انتخاب کن. در حالت آزمون، دقت و سرعت تو سنجیده می‌شه!'
              : 'تعداد سوالات تمرین رو مشخص کن. به ازای سوالات بیشتر، امتیاز و مدال‌های بالاتری می‌گیری.')}
        </p>

        {/* Question Count Selection Options */}
        <div className="space-y-2.5">
          <label className="block text-xs font-black text-slate-500 dark:text-slate-400">
            تعداد سوالات:
          </label>
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {options.map((count) => {
              const isSelected = selectedCount === count;
              const xp = getRewardXp(count);
              return (
                <button
                  key={count}
                  type="button"
                  id={`btn-select-count-${count}`}
                  onClick={() => setSelectedCount(count)}
                  className={`relative p-3.5 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1 text-center cursor-pointer ${
                    isSelected
                      ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/50 shadow-md scale-[1.02]'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <span className="text-lg font-black text-slate-900 dark:text-slate-100">
                      {toPersianDigits(count)}
                    </span>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">سوال</span>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    <span>⭐</span>
                    <span>+{toPersianDigits(xp)} XP</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="pt-2">
          <button
            type="button"
            id="btn-confirm-quiz-start"
            onClick={() => onConfirm(selectedCount)}
            className={`w-full py-4 bg-gradient-to-r ${colorGradient} hover:opacity-95 active:scale-98 text-white font-black text-sm sm:text-base rounded-2xl shadow-xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer`}
          >
            <span>{isTest ? 'شروع آزمون' : 'شروع تمرین'}</span>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-lg">
              {toPersianDigits(selectedCount)} سوال
            </span>
            <span>🚀</span>
          </button>
        </div>
      </div>
    </div>
  );
};

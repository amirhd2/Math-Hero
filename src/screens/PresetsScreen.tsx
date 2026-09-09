/**
 * PresetsScreen / Test Patterns Screen for Math Hero.
 * Displays saved Test Patterns with search, filter chips, start, edit,
 * delete with confirmation modal, and create new pattern action.
 */

import React, { useState } from 'react';
import { TestPattern, ScreenId } from '../types';
import { toPersianDigits } from '../utils/persian';
import { BackButton } from '../components/common/BackButton';

interface PresetsScreenProps {
  patterns: TestPattern[];
  onStartPattern: (pattern: TestPattern) => void;
  onEditPattern: (pattern: TestPattern) => void;
  onDeletePattern: (id: string) => void;
  onCreateNew: () => void;
  onNavigate: (screen: ScreenId) => void;
}

export const PresetsScreen: React.FC<PresetsScreenProps> = ({
  patterns,
  onStartPattern,
  onEditPattern,
  onDeletePattern,
  onCreateNew,
  onNavigate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'practice' | 'test' | 'custom'>('all');
  const [deletingPattern, setDeletingPattern] = useState<TestPattern | null>(null);

  // Filter patterns by search and tag
  const filteredPatterns = patterns.filter((pattern) => {
    const matchesSearch =
      pattern.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pattern.description && pattern.description.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterMode === 'practice') return pattern.config.mode === 'practice';
    if (filterMode === 'test') return pattern.config.mode === 'test';
    if (filterMode === 'custom') return pattern.isCustom === true;
    return true;
  });

  const confirmDelete = () => {
    if (deletingPattern) {
      onDeletePattern(deletingPattern.id);
      setDeletingPattern(null);
    }
  };

  return (
    <div className="w-full max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 md:py-8 space-y-6 pb-24">
      {/* Top Header - Title on right, BackButton on left */}
      <div className="flex flex-row items-center justify-between gap-3 w-full">
        <div className="text-right flex-1 min-w-0">
          <h1 className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100 truncate">
            الگوهای آزمون و تمرین ریاضی
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
            چیدمان‌های ذخیره‌شده را شروع، ویرایش یا ایجاد کنید
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={onCreateNew}
            className="px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-black text-xs shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>➕</span>
            <span className="hidden sm:inline">ایجاد الگوی جدید</span>
            <span className="sm:hidden">الگوی جدید</span>
          </button>
          <BackButton onClick={() => onNavigate('home')} title="بازگشت به خانه" />
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجوی الگوها بر اساس نام یا توضیح..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <span className="absolute left-3.5 top-3.5 text-slate-400 text-sm">🔍</span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-10 top-3.5 text-slate-400 hover:text-slate-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-slate-400 ml-1">فیلتر:</span>
          {[
            { id: 'all', label: 'همه الگوها' },
            { id: 'practice', label: 'حالت تمرین 🌱' },
            { id: 'test', label: 'حالت آزمون 🎯' },
            { id: 'custom', label: 'ساخته شده توسط شما ⭐' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterMode(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterMode === tab.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Patterns Grid */}
      {filteredPatterns.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
          <span className="text-4xl block">🔍</span>
          <h3 className="font-extrabold text-slate-700 dark:text-slate-200 text-sm">
            هیچ الگویی با این مشخصات یافت نشد
          </h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            می‌توانید کلمه جستجو را تغییر دهید یا با دکمه «ایجاد الگوی جدید» چیدمان دلخواهتان را بسازید.
          </p>
          <button
            onClick={onCreateNew}
            className="px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold text-xs hover:bg-indigo-100 transition-colors"
          >
            ایجاد الگوی دلخواه ✨
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredPatterns.map((pattern) => {
            const isPractice = pattern.config.mode === 'practice';
            const ops = pattern.config.selectedOperations || [];

            return (
              <div
                key={pattern.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4 group"
              >
                {/* Header & Badges */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-xs">
                        {pattern.icon || '⭐'}
                      </span>
                      <div>
                        <h3 className="font-black text-slate-800 dark:text-slate-100 text-sm group-hover:text-indigo-600 transition-colors">
                          {pattern.title}
                        </h3>
                        {pattern.isCustom && (
                          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded-md">
                            سفارشی شما
                          </span>
                        )}
                      </div>
                    </div>

                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                        isPractice
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                      }`}
                    >
                      {isPractice ? 'تمرین 🌱' : 'آزمون 🎯'}
                    </span>
                  </div>

                  {pattern.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {pattern.description}
                    </p>
                  )}

                  {/* Operation badges & question count */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {toPersianDigits(pattern.config.questionCount)} سوال
                    </span>

                    {ops.map((op) => (
                      <span
                        key={op}
                        className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/40"
                      >
                        {op === 'addition'
                          ? 'جمع ➕'
                          : op === 'subtraction'
                          ? 'تفریق ➖'
                          : op === 'multiplication'
                          ? 'ضرب ✖️'
                          : 'تقسیم ➗'}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => onStartPattern(pattern)}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-white font-black text-xs shadow-sm hover:shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 ${
                      isPractice
                        ? 'bg-emerald-600 hover:bg-emerald-500'
                        : 'bg-indigo-600 hover:bg-indigo-500'
                    }`}
                  >
                    <span>شروع چالش</span>
                    <span>🚀</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onEditPattern(pattern)}
                    className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors text-xs"
                    title="ویرایش این الگو"
                  >
                    ✏️
                  </button>

                  {pattern.isCustom && (
                    <button
                      type="button"
                      onClick={() => setDeletingPattern(pattern)}
                      className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 transition-colors text-xs"
                      title="حذف الگو"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingPattern && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-center">
            <span className="text-4xl block">🗑️</span>
            <div>
              <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-base">
                حذف الگوی «{deletingPattern.title}»؟
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                آیا مطمئن هستید که می‌خواهید این الگوی ذخیره‌شده را حذف کنید؟ این عمل غیرقابل بازگشت است.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 py-3 px-4 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-500 transition-colors shadow-md"
              >
                بله، حذف شود
              </button>
              <button
                type="button"
                onClick={() => setDeletingPattern(null)}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

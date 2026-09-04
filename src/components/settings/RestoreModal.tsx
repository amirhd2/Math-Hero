import React, { useState } from 'react';
import { MathHeroBackupData, BackupValidationResult } from '../../utils/backupManager';
import { formatNumber } from '../../utils/persian';
import { AppSettings } from '../../types';

interface RestoreModalProps {
  isOpen: boolean;
  validationResult: BackupValidationResult | null;
  settings: AppSettings;
  onCancel: () => void;
  onConfirmRestore: (data: MathHeroBackupData, mode: 'replace' | 'merge') => Promise<void>;
}

export const RestoreModal: React.FC<RestoreModalProps> = ({
  isOpen,
  validationResult,
  settings,
  onCancel,
  onConfirmRestore,
}) => {
  const [mode, setMode] = useState<'merge' | 'replace'>('merge');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !validationResult || !validationResult.data || !validationResult.summary) {
    return null;
  }

  const { summary, data } = validationResult;
  const numPref = settings.numberFormat;

  const handleExecute = async () => {
    setIsProcessing(true);
    try {
      await onConfirmRestore(data, mode);
    } finally {
      setIsProcessing(false);
    }
  };

  const backupDate = new Date(summary.createdAt).toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="restore-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-scale-up text-right">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl shrink-0">
            📥
          </div>
          <div>
            <h3 id="restore-modal-title" className="text-lg font-black text-slate-900 dark:text-slate-100">
              بازیابی اطلاعات از فایل پشتیبان
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              فایل پشتیبان با موفقیت اعتبارسنجی شد.
            </p>
          </div>
        </div>

        {/* Backup Summary Card */}
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/60 space-y-2 text-xs">
          <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
            <span className="font-bold">پروفایل:</span>
            <span className="font-black text-indigo-600 dark:text-indigo-400">
              {summary.profileName} (سطح {formatNumber(summary.profileLevel, numPref)})
            </span>
          </div>
          <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
            <span className="font-bold">تاریخ پشتیبان:</span>
            <span>{backupDate}</span>
          </div>
          <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
            <span className="font-bold">آزمون‌های ذخیره شده:</span>
            <span>{formatNumber(summary.resultsCount, numPref)} آزمون</span>
          </div>
          <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
            <span className="font-bold">اشتباهات ثبت‌شده:</span>
            <span>{formatNumber(summary.mistakesCount, numPref)} مورد</span>
          </div>
          <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
            <span className="font-bold">الگوهای آزمون:</span>
            <span>{formatNumber(summary.patternsCount, numPref)} الگو</span>
          </div>
        </div>

        {/* Restore Mode Selection */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            روش بازیابی مورد نظر را انتخاب کنید:
          </label>

          {/* Option 1: MERGE (Recommended) */}
          <div
            onClick={() => setMode('merge')}
            className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
              mode === 'merge'
                ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🔀</span>
                <span className="font-black text-sm text-slate-900 dark:text-slate-100">
                  ترکیب هوشمند با داده‌های فعلی (Merge)
                </span>
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                پیشنهاد می‌شود
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mr-7 leading-relaxed">
              سوابق و امتیازهای فایل پشتیبان به داده‌های فعلی شما اضافه می‌شوند و هیچ اطلاعات موجودی حذف نخواهد شد.
            </p>
          </div>

          {/* Option 2: REPLACE */}
          <div
            onClick={() => setMode('replace')}
            className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
              mode === 'replace'
                ? 'border-amber-600 bg-amber-50/70 dark:bg-amber-950/40'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">🔄</span>
              <span className="font-black text-sm text-slate-900 dark:text-slate-100">
                جایگزینی کامل داده‌ها (Replace)
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mr-7 leading-relaxed">
              تمامی اطلاعات فعلی این دستگاه با اطلاعات این فایل پشتیبان جایگزین خواهد شد.
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            disabled={isProcessing}
            onClick={onCancel}
            className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm transition-colors"
          >
            انصراف
          </button>
          <button
            type="button"
            disabled={isProcessing}
            onClick={handleExecute}
            className={`px-5 py-2.5 rounded-2xl text-white font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center gap-2 ${
              mode === 'replace'
                ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/30'
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30'
            }`}
          >
            {isProcessing ? (
              <span>در حال بازیابی...</span>
            ) : (
              <span>{mode === 'replace' ? 'تأیید و جایگزینی کامل' : 'تأیید و ترکیب داده‌ها'}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

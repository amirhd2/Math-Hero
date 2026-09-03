/**
 * ExitConfirmationModal component.
 * Confirmation barrier preventing accidental quiz exits.
 */

import React from 'react';
import { QuizMode } from '../../types';

interface ExitConfirmationModalProps {
  isOpen: boolean;
  mode: QuizMode;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ExitConfirmationModal: React.FC<ExitConfirmationModalProps> = ({
  isOpen,
  mode,
  onCancel,
  onConfirm,
}) => {
  if (!isOpen) return null;

  const isPractice = mode === 'practice';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-modal-title"
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
    >
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 text-center border border-slate-200 dark:border-slate-800">
        <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center text-2xl mx-auto shadow-inner">
          ⚠️
        </div>

        <div className="space-y-2">
          <h3
            id="exit-modal-title"
            className="text-lg sm:text-xl font-black text-slate-800 dark:text-slate-100"
          >
            آیا می‌خواهی از چالش خارج شوی؟
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            {isPractice
              ? 'پیشرفت این جلسه تمرینی ذخیره نخواهد شد.'
              : 'در حالت آزمون استاندارد، خروج باعث ناتمام ماندن نتیجه می‌شود.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl shadow-md transition-all text-xs sm:text-sm cursor-pointer"
          >
            ادامه چالش 🚀
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="py-3.5 px-6 bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950/60 text-slate-600 dark:text-slate-300 hover:text-rose-600 font-bold rounded-2xl transition-all text-xs sm:text-sm cursor-pointer"
          >
            خروج از چالش
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';

interface ResetModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirmReset: () => Promise<void>;
  onDownloadBackup: () => void;
}

export const ResetModal: React.FC<ResetModalProps> = ({
  isOpen,
  onCancel,
  onConfirmReset,
  onDownloadBackup,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [isResetting, setIsResetting] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setStep(1);
    onCancel();
  };

  const handleExecuteReset = async () => {
    setIsResetting(true);
    try {
      await onConfirmReset();
      handleClose();
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reset-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in"
    >
      <div className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/80 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-scale-up text-right">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center text-2xl shrink-0">
            ⚠️
          </div>
          <div>
            <h3 id="reset-modal-title" className="text-lg font-black text-rose-600 dark:text-rose-400">
              حذف کامل اطلاعات برنامه
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {step === 1 ? 'مرحله ۱ از ۲: آگاهی از پیامدها' : 'مرحله ۲ از ۲: تأیید نهایی و غیرقابل بازگشت'}
            </p>
          </div>
        </div>

        {step === 1 ? (
          <>
            <div className="bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-4 space-y-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <p className="font-bold text-rose-700 dark:text-rose-300">
                توجه: این عمل کاملاً برگشت‌ناپذیر است و موارد زیر به طور کامل پاک می‌شوند:
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400 pr-1">
                <li>پروفایل کودک، نام، کاراکتر و امتیازهای XP</li>
                <li>سطح پیشرفت، روزهای متوالی (Streak) و جام قهرمانی</li>
                <li>کل سوابق و تاریخچه آزمون‌های انجام‌شده</li>
                <li>دفترچه اشتباهات و بازبینی هوشمند (Smart Review)</li>
                <li>تمام نشان‌ها و افتخارات کسب‌شده</li>
                <li>الگوهای آزمون شخصی‌سازی‌شده</li>
              </ul>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 rounded-2xl p-3.5 flex items-center justify-between gap-3">
              <div className="text-xs">
                <span className="font-bold text-indigo-900 dark:text-indigo-200 block">
                  پیشنهاد ایمنی:
                </span>
                <span className="text-indigo-700 dark:text-indigo-400 text-[11px]">
                  ابتدا یک فایل پشتیبان ذخیره کنید تا در صورت نیاز بتوانید اطلاعات را برگردانید.
                </span>
              </div>
              <button
                type="button"
                onClick={onDownloadBackup}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shrink-0 hover:bg-indigo-700 shadow-sm"
              >
                دانلود فایل پشتیبان 💾
              </button>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm transition-colors"
              >
                انصراف و بازگشت
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs sm:text-sm shadow-md shadow-rose-600/30 transition-all active:scale-95"
              >
                ادامه به مرحله بعد ←
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 text-center space-y-2">
              <p className="font-black text-sm text-rose-600 dark:text-rose-400">
                آیا کاملاً مطمئن هستید؟
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                با کلیک روی دکمه زیر، تمامی اطلاعات ذخیره‌شده روی این دستگاه حذف شده و برنامه به حالت روز اول برمی‌گردد.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isResetting}
                onClick={() => setStep(1)}
                className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm transition-colors"
              >
                بازگشت به مرحله ۱
              </button>
              <button
                type="button"
                disabled={isResetting}
                onClick={handleExecuteReset}
                className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs sm:text-sm shadow-md shadow-rose-600/40 transition-all active:scale-95 flex items-center gap-2"
              >
                {isResetting ? (
                  <span>در حال پاکسازی...</span>
                ) : (
                  <span>بله، همه اطلاعات من حذف شود 🗑️</span>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

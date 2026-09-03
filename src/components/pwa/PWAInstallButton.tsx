import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA standalone app, hide the button
  if (isInstalled) {
    return null;
  }

  return (
    <>
      {/* Chromium / Android / Desktop Install Button */}
      {isInstallable && (
        <button
          type="button"
          onClick={install}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all"
        >
          <span>📲</span>
          <span>نصب اپلیکیشن</span>
        </button>
      )}

      {/* iOS Safari Guide Button */}
      {isIOS && !isInstallable && (
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-slate-700 active:scale-95 transition-all"
        >
          <span>🍏</span>
          <span>نصب در آیفون/آیپد</span>
        </button>
      )}

      {/* iOS Safari Step-by-Step Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div
            className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl mx-auto">
              📲
            </div>

            <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">
              نصب برنامه در آیفون و آیپد
            </h3>

            <div className="space-y-2.5 text-right text-xs text-slate-600 dark:text-slate-300 font-medium bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 leading-relaxed">
              <p className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                  ۱
                </span>
                <span>
                  در نوار پایین مرورگر <strong>سافاری (Safari)</strong>، دکمه <strong>Share (اشتراک‌گذاری ⎋)</strong> را لمس کنید.
                </span>
              </p>
              <p className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                  ۲
                </span>
                <span>
                  به سمت پایین اسکرول کرده و گزینه <strong>Add to Home Screen (افزودن به صفحه اصلی ➕)</strong> را انتخاب کنید.
                </span>
              </p>
              <p className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                  ۳
                </span>
                <span>
                  در بالا سمت راست، گزینه <strong>Add</strong> را بزنید تا آیکون بازی به صفحه گوشیتان اضافه شود.
                </span>
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs hover:opacity-90 transition-opacity"
            >
              متوجه شدم 👍
            </button>
          </div>
        </div>
      )}
    </>
  );
};

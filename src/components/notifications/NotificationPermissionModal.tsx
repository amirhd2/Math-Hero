/**
 * NotificationPermissionModal component for Math Hero.
 * Child & parent friendly educational pre-prompt modal explaining the benefits
 * of smart reminders before asking for browser permission.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getAssetUrl } from '../../utils/assetPaths';
import { requestBrowserNotificationPermission } from '../../notifications/notificationDelivery';
import { sound } from '../../utils/sound';

interface NotificationPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPermissionGranted: () => void;
  onPermissionDenied?: () => void;
}

export const NotificationPermissionModal: React.FC<NotificationPermissionModalProps> = ({
  isOpen,
  onClose,
  onPermissionGranted,
  onPermissionDenied,
}) => {
  const [isRequesting, setIsRequesting] = useState(false);
  const [deniedGuidance, setDeniedGuidance] = useState(false);

  if (!isOpen) return null;

  const handleAllowClick = async () => {
    setIsRequesting(true);
    setDeniedGuidance(false);
    try {
      const status = await requestBrowserNotificationPermission();
      if (status === 'granted') {
        sound.playSuccess();
        onPermissionGranted();
        onClose();
      } else if (status === 'denied') {
        setDeniedGuidance(true);
        if (onPermissionDenied) onPermissionDenied();
      } else {
        onClose();
      }
    } catch {
      setDeniedGuidance(true);
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md" dir="rtl">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-indigo-100 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden text-right text-slate-800 dark:text-slate-100"
        >
          {/* Ambient background blur */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

          {/* Mr. Owl Avatar Graphic */}
          <div className="flex justify-center mb-4">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
              <img
                src={getAssetUrl('assets/characters/owl/Ready.webp')}
                alt="آقای جغد دانا"
                className="w-full h-full object-contain drop-shadow-md select-none pointer-events-none"
              />
              <div className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-900 text-sm font-black p-1.5 rounded-full shadow-md border-2 border-white dark:border-slate-900">
                🔔
              </div>
            </div>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-center text-slate-900 dark:text-white mb-2">
            همراهی با آقای جغد دانا
          </h3>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 text-center leading-relaxed mb-5">
            آیا دوست داری در زمان‌های مناسب، یادآورهای کوتاه و دوستانه دریافت کنی تا زنجیره قهرمانی‌ات حفظ بشه و تمرین‌های طلایی رو فراموش نکنی؟
          </p>

          {/* Educational Benefits List */}
          <div className="space-y-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 rounded-2xl p-3.5 sm:p-4 mb-5 text-xs sm:text-sm">
            <div className="flex items-start gap-2.5">
              <span className="text-emerald-500 text-base font-bold shrink-0">✨</span>
              <span className="text-slate-700 dark:text-slate-300">
                یادآوری هوشمند بر اساس سؤالات گنجینه اشتباهات و مهارت‌های جدید
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-indigo-500 text-base font-bold shrink-0">🌙</span>
              <span className="text-slate-700 dark:text-slate-300">
                سکوت کامل و بدون مزاحمت در ساعات استراحت و خواب شب
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-amber-500 text-base font-bold shrink-0">🔥</span>
              <span className="text-slate-700 dark:text-slate-300">
                پیام‌های تشویقی، مثبت و بدون احساس گناه یا سرزنش
              </span>
            </div>
          </div>

          {deniedGuidance && (
            <div className="mb-4 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300/80 dark:border-amber-700/60 text-amber-900 dark:text-amber-200 text-xs leading-relaxed">
              ⚠️ مرورگر دسترسی به اعلان‌ها را مجاز ندانسته است. برای فعال‌سازی می‌توانید در نوار آدرس مرورگر (آیکون قفل یا تنظیمات سایت) دسترسی اعلان را فعال کنید.
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={handleAllowClick}
              disabled={isRequesting}
              className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 active:scale-98 text-white font-black text-sm shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isRequesting ? (
                <span>در حال فعال‌سازی...</span>
              ) : (
                <>
                  <span>🔔</span>
                  <span>فعال‌سازی یادآورها</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={isRequesting}
              className="w-full sm:w-auto py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-98 text-slate-700 dark:text-slate-300 font-bold text-sm transition-all cursor-pointer"
            >
              شاید بعداً
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

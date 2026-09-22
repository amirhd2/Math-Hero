/**
 * InAppNotificationBanner component for Math Hero.
 * Displays a beautiful, animated in-app interactive companion reminder
 * when a notification is triggered while the child is inside the app
 * or when system notifications are restricted by the browser/iframe.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SmartNotificationPayload } from '../../notifications/notificationTypes';
import { dispatchNotificationAction } from '../../notifications/notificationDelivery';
import { getAssetUrl } from '../../utils/assetPaths';
import { sound } from '../../utils/sound';

export const InAppNotificationBanner: React.FC = () => {
  const [activeNotification, setActiveNotification] = useState<SmartNotificationPayload | null>(null);

  useEffect(() => {
    const handleInAppReminder = (event: Event) => {
      const customEv = event as CustomEvent<SmartNotificationPayload>;
      if (customEv.detail) {
        setActiveNotification(customEv.detail);
        sound.playSuccess();
      }
    };

    window.addEventListener('math-hero:in-app-reminder', handleInAppReminder);
    return () => {
      window.removeEventListener('math-hero:in-app-reminder', handleInAppReminder);
    };
  }, []);

  // Auto-dismiss after 10 seconds
  useEffect(() => {
    if (!activeNotification) return;
    const timer = setTimeout(() => {
      setActiveNotification(null);
    }, 10000);
    return () => clearTimeout(timer);
  }, [activeNotification]);

  if (!activeNotification) return null;

  const handleAction = () => {
    const notif = activeNotification;
    setActiveNotification(null);
    dispatchNotificationAction(notif.actionData);
  };

  const handleDismiss = () => {
    setActiveNotification(null);
  };

  return (
    <AnimatePresence>
      <motion.div
        key={activeNotification.id}
        initial={{ opacity: 0, y: -40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -30, scale: 0.95 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="fixed top-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-[110] select-none"
        dir="rtl"
      >
        <div className="relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-indigo-200 dark:border-indigo-500/30 rounded-3xl p-4 shadow-2xl shadow-indigo-500/20 text-slate-800 dark:text-slate-100 overflow-hidden">
          {/* Top glow accent */}
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-amber-400 via-indigo-500 to-indigo-600" />

          <div className="flex items-start gap-3">
            {/* Owl Avatar */}
            <div className="relative w-12 h-12 shrink-0 bg-indigo-50 dark:bg-indigo-950/60 rounded-2xl flex items-center justify-center p-1 border border-indigo-100 dark:border-indigo-800">
              <img
                src={getAssetUrl('assets/characters/owl/Ready.webp')}
                alt="آقای جغد"
                className="w-full h-full object-contain pointer-events-none"
              />
              <span className="absolute -top-1 -right-1 text-xs">🔔</span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1 mb-1">
                <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">
                  {activeNotification.title}
                </h4>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs p-1 rounded-full transition-colors cursor-pointer"
                  title="بستن"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                {activeNotification.body}
              </p>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAction}
                  className="py-1.5 px-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 active:scale-95 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>🚀</span>
                  <span>{activeNotification.actionLabel || 'بزن بریم'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDismiss}
                  className="py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-95 text-slate-600 dark:text-slate-300 font-bold text-xs transition-all cursor-pointer"
                >
                  بعداً
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

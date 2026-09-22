/**
 * NotificationSettingsSection component for Math Hero Settings.
 * Provides controls for:
 * 1. Master toggle & permission state management
 * 2. Topic-level toggles (Adaptive Teacher, Mistakes & Review, Streaks, Gamification)
 * 3. Schedule, preferred reminder time, and quiet hours
 * 4. Daily limits & live testing button with immediate feedback
 */

import React, { useState } from 'react';
import { AppSettings, NotificationSettings, NotificationTopicKey } from '../../types';
import { ToggleSwitch } from './ToggleSwitch';
import { getBrowserNotificationPermission, deliverSmartNotification } from '../../notifications/notificationDelivery';
import { SmartNotificationEngine } from '../../notifications/smartNotificationEngine';
import { NotificationPermissionModal } from '../notifications/NotificationPermissionModal';
import { toPersianDigits } from '../../utils/persian';

interface NotificationSettingsSectionProps {
  settings: AppSettings;
  onUpdateSettings: (updated: AppSettings) => void;
  onShowToast: (message: string) => void;
}

export const NotificationSettingsSection: React.FC<NotificationSettingsSectionProps> = ({
  settings,
  onUpdateSettings,
  onShowToast,
}) => {
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const notif = settings.notifications || {
    enabled: false,
    permissionStatus: 'default',
    preferredTime: '17:00',
    quietHoursStart: '21:00',
    quietHoursEnd: '08:00',
    maxPerDay: 2,
    topics: {
      adaptiveTeacher: true,
      mistakesAndReview: true,
      streakEncouragement: true,
      gamificationBadges: true,
    },
    dailyNotificationCount: 0,
  };

  const browserPerm = getBrowserNotificationPermission();

  const updateNotifState = (partial: Partial<NotificationSettings>) => {
    const updated: AppSettings = {
      ...settings,
      notifications: {
        ...notif,
        ...partial,
        topics: {
          ...notif.topics,
          ...(partial.topics || {}),
        },
      },
    };
    onUpdateSettings(updated);
  };

  const handleMasterToggle = (enable: boolean) => {
    if (enable) {
      if (browserPerm === 'granted') {
        updateNotifState({ enabled: true, permissionStatus: 'granted' });
        onShowToast('یادآورهای هوشمند فعال شدند');
      } else {
        setShowPermissionModal(true);
      }
    } else {
      updateNotifState({ enabled: false });
      onShowToast('یادآورهای هوشمند غیرفعال شدند');
    }
  };

  const handleTopicToggle = (topic: NotificationTopicKey, val: boolean) => {
    updateNotifState({
      topics: {
        ...notif.topics,
        [topic]: val,
      },
    });
  };

  const handleTestNotification = async () => {
    setIsTesting(true);
    try {
      const evaluation = await SmartNotificationEngine.evaluateNotificationOpportunity({
        isTest: true,
        forceSend: true,
      });

      if (evaluation.payload) {
        const result = await deliverSmartNotification(evaluation.payload);
        if (result.channel === 'service_worker' || result.channel === 'native_window') {
          onShowToast('اعلان آزمایشی روی دستگاه شما نمایش داده شد 🎉');
        } else {
          onShowToast('یادآور آزمایشی در برنامه فعال شد 🦉');
        }
      } else {
        onShowToast(evaluation.messageFa || 'خطا در آماده‌سازی اعلان آزمایشی');
      }
    } catch (err: any) {
      console.warn('Failed to test notification:', err);
      onShowToast('خطا در ارسال اعلان آزمایشی');
    } finally {
      setIsTesting(false);
    }
  };

  // Status text for badge
  let statusBadgeText = 'غیرفعال';

  if (notif.enabled) {
    if (browserPerm === 'granted') {
      statusBadgeText = 'فعال و مجاز';
    } else if (browserPerm === 'denied') {
      statusBadgeText = 'مرورگر مسدود کرده';
    } else {
      statusBadgeText = 'فعال (همراه درون‌برنامه)';
    }
  }

  return (
    <div className="space-y-5 pt-2 text-right">
      <NotificationPermissionModal
        isOpen={showPermissionModal}
        onClose={() => setShowPermissionModal(false)}
        onPermissionGranted={() => {
          updateNotifState({ enabled: true, permissionStatus: 'granted' });
          onShowToast('یادآورهای هوشمند با موفقیت فعال شدند 🎉');
        }}
        onPermissionDenied={() => {
          updateNotifState({ enabled: true, permissionStatus: 'denied' });
          onShowToast('یادآورها به صورت همراه درون‌برنامه‌ای فعال شدند');
        }}
      />

      {/* 1. Master Toggle & Current Status */}
      <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-slate-800/80 border border-indigo-100 dark:border-indigo-900/40 space-y-3">
        <ToggleSwitch
          id="notif-master-toggle"
          title="فعال‌سازی یادآورهای هوشمند"
          description="ارسال پیام‌های کوتاه، تشویقی و مفید توسط آقای جغد برای استمرار یادگیری و تمرین"
          badge={statusBadgeText}
          checked={Boolean(notif.enabled)}
          onChange={handleMasterToggle}
        />

        {browserPerm === 'denied' && notif.enabled && (
          <div className="text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800 leading-relaxed">
            💡 اعلان‌های سیستمی توسط تنظیمات مرورگر مسدود شده‌اند، اما یادآورها درون برنامه به طور کامل به شما نمایش داده می‌شوند. برای دریافت اعلان خارج از برنامه، در تنظیمات مرورگر دسترسی اعلان را مجاز کنید.
          </div>
        )}
      </div>

      {/* 2. Topic Toggles (Active when notifications enabled) */}
      <div className={`space-y-3 transition-opacity ${notif.enabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
        <h4 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          موضوعات و اهداف یادآوری
        </h4>

        {/* Adaptive Teacher */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60">
          <ToggleSwitch
            id="notif-topic-adaptive"
            title="🦉 معلم هوشمند و گام‌های مهارتی"
            description="یادآوری مراحل ارتقای مهارتی جدید و تمرین‌های هدفمند جدول ضرب و تقسیم"
            checked={Boolean(notif.topics.adaptiveTeacher)}
            onChange={(val) => handleTopicToggle('adaptiveTeacher', val)}
          />
        </div>

        {/* Mistakes & Smart Review */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60">
          <ToggleSwitch
            id="notif-topic-mistakes"
            title="🗝️ گنجینه اشتباهات و مرورهای طلایی"
            description="دعوت به حل سؤالات اشتباه قبلی و مرور نقاط نیازمند تمرین برای طلایی کردن مدال‌ها"
            checked={Boolean(notif.topics.mistakesAndReview)}
            onChange={(val) => handleTopicToggle('mistakesAndReview', val)}
          />
        </div>

        {/* Streak Encouragement */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60">
          <ToggleSwitch
            id="notif-topic-streak"
            title="🔥 حفظ زنجیره روزانه (بدون احساس گناه)"
            description="یادآوری دوستانه برای تمرین ۵ دقیقه‌ای روزانه جهت ادامه زنجیره افتخار"
            checked={Boolean(notif.topics.streakEncouragement)}
            onChange={(val) => handleTopicToggle('streakEncouragement', val)}
          />
        </div>

        {/* Gamification & Badges */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60">
          <ToggleSwitch
            id="notif-topic-gamification"
            title="🏅 صعود سطح و نشان‌های در دسترس"
            description="اعلام نزدیکی به سطح بالاتر یا آزاد شدن یک نشان قهرمانی جدید"
            checked={Boolean(notif.topics.gamificationBadges)}
            onChange={(val) => handleTopicToggle('gamificationBadges', val)}
          />
        </div>
      </div>

      {/* 3. Schedule, Preferred Time, and Quiet Hours */}
      <div className={`space-y-4 pt-2 transition-opacity ${notif.enabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
        <h4 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          زمان‌بندی و ساعات سکوت
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Preferred Reminder Time */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <span>⏰</span>
              <span>ساعت پیشنهادی تمرین</span>
            </label>
            <select
              value={notif.preferredTime || '17:00'}
              onChange={(e) => updateNotifState({ preferredTime: e.target.value })}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="15:00">۱۵:۰۰ (بعد از ظهر)</option>
              <option value="16:00">۱۶:۰۰ (عصر)</option>
              <option value="17:00">۱۷:۰۰ (پیش‌فرض)</option>
              <option value="18:00">۱۸:۰۰ (غروب)</option>
              <option value="19:00">۱۹:۰۰ (ابتدای شب)</option>
              <option value="20:00">۲۰:۰۰ (شب)</option>
            </select>
          </div>

          {/* Daily Limit */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <span>📊</span>
              <span>حداکثر پیام در روز</span>
            </label>
            <select
              value={notif.maxPerDay || 2}
              onChange={(e) => updateNotifState({ maxPerDay: Number(e.target.value) })}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value={1}>۱ پیام در روز (فوق‌العاده آرام)</option>
              <option value={2}>۲ پیام در روز (پیش‌فرض)</option>
              <option value={3}>۳ پیام در روز</option>
            </select>
          </div>
        </div>

        {/* Quiet Hours Display & Setting */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <span>🌙</span>
              <span>ساعات سکوت و استراحت (بدون هیچ پیامی)</span>
            </span>
            <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
              {toPersianDigits(notif.quietHoursStart || '21:00')} تا {toPersianDigits(notif.quietHoursEnd || '08:00')}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            در بازه شب تا صبح هیچ‌گونه اعلانی ارسال نخواهد شد تا آرامش کودک حفظ شود.
          </p>
        </div>
      </div>

      {/* 4. Live Test Notification Button */}
      <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
        <button
          type="button"
          onClick={handleTestNotification}
          disabled={isTesting}
          className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-98 text-indigo-600 dark:text-indigo-300 font-bold text-xs sm:text-sm border border-slate-300/80 dark:border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isTesting ? (
            <span>در حال ارسال تست...</span>
          ) : (
            <>
              <span>🔔</span>
              <span>ارسال اعلان آزمایشی (تست زنده)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

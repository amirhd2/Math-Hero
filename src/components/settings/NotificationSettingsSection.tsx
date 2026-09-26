/**
 * NotificationSettingsSection component for Math Hero Settings.
 * Provides controls for:
 * 1. Master toggle & permission state management
 * 2. Topic-level toggles (Adaptive Teacher, Mistakes & Review, Streaks, Gamification)
 * 3. Schedule, preferred reminder time, inactivity delay hours, and quiet hours
 * 4. Dual live testing: Immediate Android system notification & 5-second exit test
 * 5. Service Worker status indicator and Android battery optimization guide
 */

import React, { useState, useEffect } from 'react';
import { AppSettings, NotificationSettings, NotificationTopicKey } from '../../types';
import { ToggleSwitch } from './ToggleSwitch';
import {
  getBrowserNotificationPermission,
  deliverSmartNotification,
  checkServiceWorkerStatus,
  triggerInAppReminder,
} from '../../notifications/notificationDelivery';
import { SmartNotificationEngine } from '../../notifications/smartNotificationEngine';
import { scheduleTestAwayNotification } from '../../notifications/smartNotificationScheduler';
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
  const [isTestingImmediate, setIsTestingImmediate] = useState(false);
  const [isTestingCountdown, setIsTestingCountdown] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(0);
  const [swStatus, setSwStatus] = useState<{
    supported: boolean;
    registered: boolean;
    active: boolean;
    version?: string;
  }>({
    supported: true,
    registered: false,
    active: false,
  });

  const notif = settings.notifications || {
    enabled: false,
    permissionStatus: 'default',
    preferredTime: '17:00',
    quietHoursStart: '21:00',
    quietHoursEnd: '08:00',
    maxPerDay: 2,
    inactivityDelayHours: 3,
    topics: {
      adaptiveTeacher: true,
      mistakesAndReview: true,
      streakEncouragement: true,
      gamificationBadges: true,
    },
    dailyNotificationCount: 0,
  };

  const browserPerm = getBrowserNotificationPermission();

  useEffect(() => {
    checkServiceWorkerStatus().then((status) => {
      setSwStatus(status);
    });
  }, []);

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
        onShowToast('یادآورهای هوشمند فعال شدند 🎉');
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

  // 1. Immediate System Notification Test
  const handleImmediateSystemTest = async () => {
    setIsTestingImmediate(true);
    try {
      const evaluation = await SmartNotificationEngine.evaluateNotificationOpportunity({
        isTest: true,
        forceSend: true,
      });

      if (evaluation.payload) {
        const result = await deliverSmartNotification(evaluation.payload, {
          forceSystemNotification: true,
          skipInAppBroadcast: true,
        });

        if (result.channel === 'service_worker' || result.channel === 'native_window') {
          onShowToast('اعلان سیستمی در نوار اعلان‌های اندروید ارسال شد 🔔');
        } else {
          onShowToast('سیستم اعلان مرورگر در دسترس نیست یا مسدود است.');
        }
      } else {
        onShowToast(evaluation.messageFa || 'خطا در آماده‌سازی اعلان آزمایشی');
      }
    } catch (err: any) {
      console.warn('Failed to test notification:', err);
      onShowToast('خطا در ارسال اعلان آزمایشی');
    } finally {
      setIsTestingImmediate(false);
    }
  };

  // 2. 5-Second Away-from-App Test (User can minimize app to see notification in Android drawer)
  const handleAwayCountdownTest = async () => {
    if (isTestingCountdown) return;
    setIsTestingCountdown(true);
    setCountdownSeconds(5);

    try {
      await scheduleTestAwayNotification(5);
      onShowToast('شمارش معکوس ۵ ثانیه‌ای آغاز شد! از برنامه خارج شوید 📱');

      let remaining = 5;
      const timer = setInterval(() => {
        remaining -= 1;
        setCountdownSeconds(remaining);
        if (remaining <= 0) {
          clearInterval(timer);
          setIsTestingCountdown(false);
        }
      }, 1000);
    } catch {
      setIsTestingCountdown(false);
      onShowToast('خطا در زمان‌بندی تست');
    }
  };

  // 3. In-App Companion Reminder Test
  const handleInAppBannerTest = async () => {
    const evaluation = await SmartNotificationEngine.evaluateNotificationOpportunity({
      isTest: true,
      forceSend: true,
    });
    if (evaluation.payload) {
      triggerInAppReminder(evaluation.payload);
      onShowToast('بنر همراه درون‌برنامه ظاهر شد 🦉');
    }
  };

  // Status text for badge
  let statusBadgeText = 'غیرفعال';
  if (notif.enabled) {
    if (browserPerm === 'granted') {
      statusBadgeText = 'فعال و مجاز در سیستم';
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
            💡 اعلان‌های سیستمی توسط تنظیمات مرورگر مسدود شده‌اند، اما یادآورها درون برنامه به طور کامل به شما نمایش داده می‌شوند. برای دریافت اعلان خارج از برنامه در نوار اعلان‌های بالای گوشی، در تنظیمات مرورگر یا اطلاعات برنامه اندروید، دسترسی Notifications را مجاز کنید.
          </div>
        )}

        {/* Service Worker Status Pill */}
        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-indigo-100 dark:border-indigo-900/30">
          <span className="text-slate-500 dark:text-slate-400">وضعیت موتور اعلان اندروید (Service Worker):</span>
          <span className={`font-bold flex items-center gap-1 ${swStatus.active ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
            <span className={`w-2 h-2 rounded-full ${swStatus.active ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            {swStatus.active ? 'فعال و آماده دریافت در پس‌زمینه' : 'در حال بارگذاری'}
          </span>
        </div>
      </div>

      {/* 2. Topic Toggles */}
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

      {/* 3. Schedule, Inactivity Delay, and Quiet Hours */}
      <div className={`space-y-4 pt-2 transition-opacity ${notif.enabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
        <h4 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          زمان‌بندی، دوری از برنامه و ساعات سکوت
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Preferred Reminder Time */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <span>⏰</span>
              <span>ساعت مطالعه انتخابی</span>
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

          {/* Inactivity Delay */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <span>⏳</span>
              <span>فاصله پس از عدم فعالیت</span>
            </label>
            <select
              value={notif.inactivityDelayHours || 3}
              onChange={(e) => updateNotifState({ inactivityDelayHours: Number(e.target.value) })}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value={2}>۲ ساعت پس از خروج</option>
              <option value={3}>۳ ساعت پس از خروج (پیش‌فرض)</option>
              <option value={4}>۴ ساعت پس از خروج</option>
              <option value={5}>۵ ساعت پس از خروج</option>
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
            در ساعات شب تا صبح هیچ‌گونه اعلانی ارسال نخواهد شد تا آرامش کودک حفظ شود.
          </p>
        </div>
      </div>

      {/* 4. Dedicated Live Test Suite */}
      <div className="pt-2 space-y-3">
        <h4 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          ابزارهای تست و اعتبارسنجی زنده
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Test 1: Immediate System Notification */}
          <button
            type="button"
            onClick={handleImmediateSystemTest}
            disabled={isTestingImmediate}
            className="p-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50 active:scale-98"
          >
            <span>📱</span>
            <span>{isTestingImmediate ? 'در حال ارسال...' : 'ارسال فوری اعلان سیستمی اندروید'}</span>
          </button>

          {/* Test 2: 5-Second Exit Test */}
          <button
            type="button"
            onClick={handleAwayCountdownTest}
            disabled={isTestingCountdown}
            className="p-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-70 active:scale-98"
          >
            <span>⏱️</span>
            <span>
              {isTestingCountdown
                ? `خارج شوید! اعلان تا ${toPersianDigits(countdownSeconds)} ثانیه دیگر...`
                : 'تست خروج از برنامه (ارسال پس از ۵ ثانیه)'}
            </span>
          </button>
        </div>

        {/* Test 3: In-App Companion Banner */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleInAppBannerTest}
            className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>🦉</span>
            <span>مشاهده تست بنر همراه داخل برنامه</span>
          </button>
        </div>
      </div>

      {/* 5. Android Optimization Guide Card */}
      <div className="p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 text-[11px] text-slate-600 dark:text-slate-300 space-y-1.5">
        <div className="font-black text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <span>💡</span>
          <span>راهنمای ویژه گوشی‌های اندرویدی (سامسونگ، شیائومی و هواوی):</span>
        </div>
        <p className="leading-relaxed">
          برای اینکه اندروید پس از بستن برنامه، سرویس یادآوری را متوقف نکند:
        </p>
        <ul className="list-disc list-inside space-y-1 text-slate-500 dark:text-slate-400 pr-1">
          <li>برنامه را از طریق مرورگر به عنوان وب‌اپلیکیشن (Install App / Add to Home screen) نصب نمایید.</li>
          <li>در بخش اطلاعات برنامه (App Info &gt; Battery)، بهینه‌سازی باتری را روی «بدون محدودیت» (Unrestricted) بگذارید.</li>
          <li>از بخش اعلان‌ها (App Info &gt; Notifications)، اطمینان حاصل کنید دسترسی اعلانات فعال است.</li>
        </ul>
      </div>
    </div>
  );
};

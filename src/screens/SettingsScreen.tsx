/**
 * SettingsScreen component for Math Hero.
 * Provides a comprehensive, child-friendly, accordion-based settings management layer:
 * 1. Appearance & Theme (System, Light, Dark)
 * 2. Language & Numerals (Persian, English, Digits format)
 * 3. Sound & Feedback (Audio synthesis, Haptics, Celebrations, Quiz feedback)
 * 4. Quiz & Learning Preferences (Keyboard, Focus, Companion character, Navigation Guard)
 * 5. Test Patterns Management
 * 6. Data & Backup (Full JSON backup, Deterministic Replace/Merge restore, CSV/JSON export, Reset)
 * 7. App Management (Version, Offline status, PWA install, Cache clearing, App reload)
 * 8. About Math Hero (Child privacy, Educational philosophy, Tech stack)
 * 9. Latest Changes (Version history timeline)
 */

import React, { useState, useEffect, useRef } from 'react';
import { AppSettings, ScreenId, UserProfile } from '../types';
import { sound } from '../utils/sound';
import { formatNumber } from '../utils/persian';
import { t } from '../utils/i18n';
import {
  createFullBackup,
  downloadFile,
  validateBackupContent,
  restoreBackup,
  resetApplicationData,
  exportQuizHistoryCSV,
  exportLearningStatsJSON,
  clearTemporaryCache,
  getStoredDataCounts,
  StoredDataCounts,
  BackupValidationResult,
  MathHeroBackupData,
  APP_VERSION,
} from '../utils/backupManager';
import { AccordionSection } from '../components/settings/AccordionSection';
import { ToggleSwitch } from '../components/settings/ToggleSwitch';
import { RestoreModal } from '../components/settings/RestoreModal';
import { ResetModal } from '../components/settings/ResetModal';
import { CHANGELOG_ENTRIES } from '../utils/i18n';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface SettingsScreenProps {
  settings: AppSettings;
  profile?: UserProfile;
  appMode?: 'child' | 'parent';
  onUpdateSettings: (updated: AppSettings) => void;
  onNavigate: (screen: ScreenId) => void;
  onOpenParentGate?: () => void;
  onExitToChildMode?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  profile,
  appMode = 'child',
  onUpdateSettings,
  onNavigate,
  onOpenParentGate,
  onExitToChildMode,
}) => {
  const lang = settings.language || 'fa';
  const numPref = settings.numberFormat || 'persian';

  // State for which accordion sections are open
  // By default, Appearance and Data & Backup are open to welcome the user
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    appearance: true,
    data_backup: false,
    sound: false,
    quiz_learning: false,
    lang_num: false,
    patterns: false,
    app_management: false,
    about: false,
    changelog: false,
  });

  // Stored data summary counts
  const [dataCounts, setDataCounts] = useState<StoredDataCounts>({
    results: 0,
    mistakes: 0,
    patterns: 0,
    achievements: 0,
    xp: profile?.xp || 0,
    level: profile?.level || 1,
    streakDays: profile?.streakDays || 1,
    coins: profile?.coins || 0,
  });

  // Toast notification message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Restore Modal state
  const [validationResult, setValidationResult] = useState<BackupValidationResult | null>(null);
  const [showRestoreModal, setShowRestoreModal] = useState(false);

  // Reset Modal state
  const [showResetModal, setShowResetModal] = useState(false);

  // Online / Offline live status
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Hidden file input ref for backup upload
  const fileInputRef = useRef<HTMLInputElement>(null);

  // PWA Install hook
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  // Load data counts on mount
  useEffect(() => {
    getStoredDataCounts().then(setDataCounts);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const toggleSection = (sectionKey: string) => {
    sound.playClick(settings.soundEnabled);
    setOpenSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  // 1. Appearance updates
  const handleThemeChange = (theme: 'system' | 'light' | 'dark') => {
    sound.playClick(settings.soundEnabled);
    onUpdateSettings({ ...settings, theme });
  };

  // 2. Language & Numeral updates
  const handleLanguageChange = (newLang: 'fa' | 'en') => {
    sound.playClick(settings.soundEnabled);
    onUpdateSettings({ ...settings, language: newLang });
    showToast(newLang === 'fa' ? 'زبان برنامه به فارسی تغییر یافت.' : 'Language set to English.');
  };

  const handleNumeralChange = (newFormat: 'persian' | 'english') => {
    sound.playClick(settings.soundEnabled);
    onUpdateSettings({ ...settings, numberFormat: newFormat });
    showToast(newFormat === 'persian' ? 'فرمت ارقام فارسی فعال شد.' : 'English numerals enabled.');
  };

  // 3. Sound updates
  const handleTestSound = () => {
    sound.playSuccess(true);
    sound.vibrateSuccess(settings.hapticsEnabled);
    showToast('صدای تشویقی و زنگ پیروزی پخش شد! 🔔');
  };

  // 4. Data & Backup workflows
  const handleDownloadBackup = async () => {
    sound.playClick(settings.soundEnabled);
    try {
      const backup = await createFullBackup();
      downloadFile(backup.json, backup.filename, 'application/json');
      showToast('فایل پشتیبان کامل با موفقیت تولید و دانلود شد 💾');
    } catch (err: any) {
      showToast(`خطا در ایجاد پشتیبان: ${err?.message || 'نامشخص'}`);
    }
  };

  const handleTriggerFileSelect = () => {
    sound.playClick(settings.soundEnabled);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const val = validateBackupContent(content);
      if (!val.valid) {
        sound.playError(settings.soundEnabled);
        sound.vibrateError(settings.hapticsEnabled);
        showToast(val.errorFa || 'فایل پشتیبان نامعتبر است.');
        return;
      }
      setValidationResult(val);
      setShowRestoreModal(true);
    };
    reader.onerror = () => {
      showToast('خطا در خواندن فایل از حافظه.');
    };
    reader.readAsText(file);
  };

  const handleConfirmRestore = async (data: MathHeroBackupData, mode: 'replace' | 'merge') => {
    try {
      const res = await restoreBackup(data, mode);
      if (res.success) {
        sound.playLevelUp(settings.soundEnabled);
        sound.vibrateSuccess(settings.hapticsEnabled);
        showToast(res.messageFa);
        setShowRestoreModal(false);
        // Reload counts and settings
        const freshCounts = await getStoredDataCounts();
        setDataCounts(freshCounts);
        if (data.settings) {
          onUpdateSettings({ ...settings, ...data.settings });
        }
      } else {
        sound.playError(settings.soundEnabled);
        showToast(res.messageFa);
      }
    } catch (err: any) {
      showToast(`خطا در بازیابی داده‌ها: ${err?.message || ''}`);
    }
  };

  const handleConfirmReset = async () => {
    try {
      await resetApplicationData();
      sound.playClick(settings.soundEnabled);
      showToast('تمام اطلاعات برنامه با موفقیت پاک شد.');
      const freshCounts = await getStoredDataCounts();
      setDataCounts(freshCounts);
      onNavigate('onboarding');
    } catch (err: any) {
      showToast(`خطا در پاکسازی: ${err?.message || ''}`);
    }
  };

  const handleExportCSV = async () => {
    try {
      const { filename, csv } = await exportQuizHistoryCSV();
      downloadFile(csv, filename, 'text/csv;charset=utf-8;');
      showToast('خروجی CSV تاریخچه آزمون‌ها دانلود شد.');
    } catch (err: any) {
      showToast(`خطا: ${err?.message || ''}`);
    }
  };

  const handleExportStatsJSON = async () => {
    try {
      const { filename, json } = await exportLearningStatsJSON();
      downloadFile(json, filename, 'application/json');
      showToast('خروجی پرونده یادگیری دانلود شد.');
    } catch (err: any) {
      showToast(`خطا: ${err?.message || ''}`);
    }
  };

  // App Management
  const handleClearCache = async () => {
    sound.playClick(settings.soundEnabled);
    const { count, success } = await clearTemporaryCache();
    if (success) {
      showToast(`حافظه موقت پاکسازی شد (${formatNumber(count, numPref)} مورد). اطلاعات پیشرفت شما دست‌نخورده باقی ماند.`);
    } else {
      showToast('مرورگر از پاکسازی مستقیم کش پشتیبانی نمی‌کند یا خطایی رخ داد.');
    }
  };

  const handleReloadApp = () => {
    sound.playClick(settings.soundEnabled);
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  const hasVibration = sound.hasVibrationSupport();

  return (
    <div className="w-full min-h-[100dvh] bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors pb-16 pt-safe">
      {/* Hidden File Input for Backup JSON */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleFileSelected}
      />

      {/* Floating Toast Message */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 max-w-md w-[90%] bg-indigo-600 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs sm:text-sm font-black animate-slide-down">
          <span className="text-lg">✨</span>
          <span className="flex-1">{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-6">
        {/* Top Header & Navigation Entry */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => onNavigate('home')}
              className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-extrabold text-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-2xs flex items-center justify-center cursor-pointer shrink-0"
              title={t('back_to_home', lang)}
              aria-label={t('back_to_home', lang)}
            >
              ←
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
                {t('settings_title', lang)}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t('settings_subtitle', lang)}
              </p>
            </div>
          </div>

          {/* Quick Stat Pill in Header */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-black px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/70">
              نسخه {APP_VERSION}
            </span>
            <span
              className={`text-xs font-bold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${
                isOnline
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
              <span>{isOnline ? 'آنلاین' : 'آفلاین پایدار'}</span>
            </span>
          </div>
        </div>

        {/* Child Mode / Parent Mode Control Banner */}
        <div className={`rounded-3xl p-5 sm:p-6 border shadow-sm transition-all ${
          appMode === 'parent'
            ? 'bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 text-white border-indigo-700/60'
            : 'bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-900/60'
        }`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${
                appMode === 'parent' ? 'bg-white/10 text-white' : 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600'
              }`}>
                {appMode === 'parent' ? '👨‍🏫' : '🔐'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className={`font-black text-base sm:text-lg ${
                    appMode === 'parent' ? 'text-white' : 'text-slate-900 dark:text-slate-100'
                  }`}>
                    {appMode === 'parent' ? 'حالت فعال: والد / مربی و آموزگار' : 'ورود به پنل اختصاصی والدین و مربیان'}
                  </h3>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    appMode === 'parent'
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                  }`}>
                    {appMode === 'parent' ? 'پیشرفته' : 'محافظت‌شده'}
                  </span>
                </div>
                <p className={`text-xs mt-0.5 max-w-xl ${
                  appMode === 'parent' ? 'text-indigo-200' : 'text-slate-500 dark:text-slate-400'
                }`}>
                  {appMode === 'parent'
                    ? 'شما به تنظیمات دستی آزمون‌ها، تعریف الگوهای سفارشی، محدوده ارقام و میز کار مربی دسترسی کامل دارید.'
                    : 'تنظیمات دستی آزمون‌ها و مدیریت الگوها برای جلوگیری از سردرگمی کودک در پنل والدین قرار دارد.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {appMode === 'parent' ? (
                <>
                  <button
                    id="settings-open-parent-dashboard-btn"
                    onClick={() => onNavigate('parent_dashboard')}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white text-indigo-900 hover:bg-indigo-50 font-black text-xs transition-colors shadow-sm cursor-pointer"
                  >
                    میز کار مربی ←
                  </button>
                  <button
                    id="settings-exit-to-child-btn"
                    onClick={onExitToChildMode}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-black text-xs transition-colors cursor-pointer border border-white/20"
                  >
                    خروج به حالت کودک 👦
                  </button>
                </>
              ) : (
                <button
                  id="settings-enter-parent-gate-btn"
                  onClick={onOpenParentGate}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs sm:text-sm transition-colors shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>ورود والدین / مربیان</span>
                  <span>←</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Responsive Grid Layout:
            - Mobile Portrait: 1 column
            - Mobile Landscape & Tablets: 2 columns to eliminate excessive scrolling
        */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 items-start">
          {/* COLUMN 1 */}
          <div className="space-y-4 sm:space-y-5">
            {/* 1. APPEARANCE & THEME */}
            <AccordionSection
              id="accordion-appearance"
              icon="🎨"
              title={t('appearance_title', lang)}
              subtitle={t('appearance_desc', lang)}
              badge={
                settings.theme === 'system'
                  ? 'سیستم'
                  : settings.theme === 'dark'
                  ? 'تاریک'
                  : 'روشن'
              }
              isOpen={!!openSections.appearance}
              onToggle={() => toggleSection('appearance')}
            >
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleThemeChange('system')}
                    className={`p-3 rounded-2xl font-black text-xs transition-all flex flex-col items-center justify-center gap-1.5 border ${
                      settings.theme === 'system'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/30'
                        : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xl">⚙️</span>
                    <span>{t('theme_system', lang)}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleThemeChange('light')}
                    className={`p-3 rounded-2xl font-black text-xs transition-all flex flex-col items-center justify-center gap-1.5 border ${
                      settings.theme === 'light'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/30'
                        : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xl">☀️</span>
                    <span>{t('theme_light', lang)}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleThemeChange('dark')}
                    className={`p-3 rounded-2xl font-black text-xs transition-all flex flex-col items-center justify-center gap-1.5 border ${
                      settings.theme === 'dark'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/30'
                        : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xl">🌙</span>
                    <span>{t('theme_dark', lang)}</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                  ℹ️ {t('theme_note', lang)}
                </p>
              </div>
            </AccordionSection>

            {/* 2. LANGUAGE & NUMBERS */}
            <AccordionSection
              id="accordion-lang-num"
              icon="🌐"
              title={t('lang_num_title', lang)}
              subtitle={t('lang_num_desc', lang)}
              badge={numPref === 'persian' ? 'ارقام فارسی' : 'Latin 0-9'}
              isOpen={!!openSections.lang_num}
              onToggle={() => toggleSection('lang_num')}
            >
              <div className="space-y-4 pt-2">
                {/* Language selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    {t('language_label', lang)}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleLanguageChange('fa')}
                      className={`p-3 rounded-2xl font-black text-xs transition-all border ${
                        lang === 'fa'
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                          : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      🇮🇷 {t('lang_fa', lang)}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLanguageChange('en')}
                      className={`p-3 rounded-2xl font-black text-xs transition-all border ${
                        lang === 'en'
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                          : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      🇬🇧 {t('lang_en', lang)}
                    </button>
                  </div>
                </div>

                {/* Numeral System selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    {t('numeral_style_label', lang)}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleNumeralChange('persian')}
                      className={`p-3 rounded-2xl font-black text-xs transition-all border flex flex-col items-center gap-1 ${
                        numPref === 'persian'
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                          : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <span>{t('num_persian', lang)}</span>
                      <span className="text-base tracking-widest">۰ ۱ ۲ ۳ ۴ ۵</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNumeralChange('english')}
                      className={`p-3 rounded-2xl font-black text-xs transition-all border flex flex-col items-center gap-1 ${
                        numPref === 'english'
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                          : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <span>{t('num_english', lang)}</span>
                      <span className="text-base tracking-widest font-sans">0 1 2 3 4 5</span>
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                  {t('num_preview_desc', lang)}
                </p>
              </div>
            </AccordionSection>

            {/* 3. SOUND & FEEDBACK */}
            <AccordionSection
              id="accordion-sound"
              icon="🔔"
              title={t('sound_title', lang)}
              subtitle={t('sound_desc', lang)}
              badge={settings.soundEnabled ? 'صدا روشن' : 'بی‌صدا'}
              isOpen={!!openSections.sound}
              onToggle={() => toggleSection('sound')}
            >
              <div className="divide-y divide-slate-100 dark:divide-slate-800/80 pt-1">
                <ToggleSwitch
                  id="toggle-master-sound"
                  title={t('sound_effects', lang)}
                  description={t('sound_effects_desc', lang)}
                  checked={settings.soundEnabled}
                  onChange={(val) => {
                    onUpdateSettings({ ...settings, soundEnabled: val });
                    if (val) sound.playClick(true);
                  }}
                />

                <ToggleSwitch
                  id="toggle-haptics"
                  title={t('haptics', lang)}
                  description={
                    hasVibration
                      ? t('haptics_desc', lang)
                      : 'سخت‌افزار لرزش در این مرورگر یا دستگاه شناسایی نشد.'
                  }
                  checked={settings.hapticsEnabled}
                  disabled={!hasVibration}
                  badge={!hasVibration ? 'غیرفعال در این دستگاه' : undefined}
                  onChange={(val) => {
                    onUpdateSettings({ ...settings, hapticsEnabled: val });
                    if (val) sound.vibrate(40, true);
                  }}
                />

                <ToggleSwitch
                  id="toggle-celebration"
                  title={t('celebration_sounds', lang)}
                  description={t('celebration_sounds_desc', lang)}
                  checked={settings.celebrationSoundEnabled}
                  disabled={!settings.soundEnabled}
                  onChange={(val) => {
                    onUpdateSettings({ ...settings, celebrationSoundEnabled: val });
                  }}
                />

                <ToggleSwitch
                  id="toggle-feedback-sound"
                  title={t('quiz_feedback_sounds', lang)}
                  description={t('quiz_feedback_sounds_desc', lang)}
                  checked={settings.quizFeedbackEnabled}
                  disabled={!settings.soundEnabled}
                  onChange={(val) => {
                    onUpdateSettings({ ...settings, quizFeedbackEnabled: val });
                  }}
                />

                {/* Sound Test Button */}
                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={handleTestSound}
                    className="px-4 py-2 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800/70 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center gap-2 transition-colors"
                  >
                    <span>🎵</span>
                    <span>{t('test_sound_btn', lang)}</span>
                  </button>
                </div>
              </div>
            </AccordionSection>

            {/* 4. QUIZ & LEARNING PREFERENCES */}
            <AccordionSection
              id="accordion-quiz-learning"
              icon="🎯"
              title={t('quiz_learning_title', lang)}
              subtitle={t('quiz_learning_desc', lang)}
              isOpen={!!openSections.quiz_learning}
              onToggle={() => toggleSection('quiz_learning')}
            >
              <div className="divide-y divide-slate-100 dark:divide-slate-800/80 pt-1">
                <ToggleSwitch
                  id="toggle-auto-keyboard"
                  title={t('auto_open_keyboard', lang)}
                  description={t('auto_open_keyboard_desc', lang)}
                  checked={settings.autoOpenKeyboard}
                  onChange={(val) => onUpdateSettings({ ...settings, autoOpenKeyboard: val })}
                />

                <ToggleSwitch
                  id="toggle-auto-focus"
                  title={t('auto_focus_answer', lang)}
                  description={t('auto_focus_answer_desc', lang)}
                  checked={settings.autoFocusAnswer}
                  onChange={(val) => onUpdateSettings({ ...settings, autoFocusAnswer: val })}
                />

                <ToggleSwitch
                  id="toggle-show-character"
                  title={t('show_character', lang)}
                  description={t('show_character_desc', lang)}
                  checked={settings.showQuizCharacter}
                  onChange={(val) => onUpdateSettings({ ...settings, showQuizCharacter: val })}
                />

                <ToggleSwitch
                  id="toggle-confirm-exit"
                  title={t('confirm_exit_quiz', lang)}
                  description={t('confirm_exit_quiz_desc', lang)}
                  checked={settings.confirmExitQuiz}
                  onChange={(val) => onUpdateSettings({ ...settings, confirmExitQuiz: val })}
                />

                {/* Profile Reset Shortcut */}
                <div className="pt-4 flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    نیاز به تغییر نام یا کاراکتر دارید؟
                  </span>
                  <button
                    type="button"
                    onClick={() => onNavigate('onboarding')}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors"
                  >
                    ویرایش پروفایل ✨
                  </button>
                </div>
              </div>
            </AccordionSection>

            {/* 5. TEST PATTERNS SHORTCUT */}
            <AccordionSection
              id="accordion-patterns"
              icon="📋"
              title={t('patterns_title', lang)}
              subtitle={t('patterns_desc', lang)}
              badge={`${formatNumber(dataCounts.patterns, numPref)} الگو`}
              isOpen={!!openSections.patterns}
              onToggle={() => toggleSection('patterns')}
            >
              <div className="pt-3 space-y-3">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                      الگوهای آزمون ذخیره‌شده
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {formatNumber(dataCounts.patterns, numPref)} {t('patterns_count_label', lang)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate('presets')}
                    className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md shadow-indigo-600/30 transition-all active:scale-95"
                  >
                    {t('open_patterns_btn', lang)}
                  </button>
                </div>
              </div>
            </AccordionSection>
          </div>

          {/* COLUMN 2 */}
          <div className="space-y-4 sm:space-y-5">
            {/* 6. DATA & BACKUP MANAGEMENT */}
            <AccordionSection
              id="accordion-data-backup"
              icon="💾"
              title={t('data_backup_title', lang)}
              subtitle={t('data_backup_desc', lang)}
              badge="پشتیبان کامل"
              isOpen={!!openSections.data_backup}
              onToggle={() => toggleSection('data_backup')}
            >
              <div className="space-y-4 pt-3">
                {/* Live Data Summary Card */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 space-y-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    {t('data_summary_title', lang)}
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center pt-1">
                    <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span className="text-xs text-slate-500 block">آزمون‌ها</span>
                      <span className="font-black text-sm text-indigo-600 dark:text-indigo-400">
                        {formatNumber(dataCounts.results, numPref)}
                      </span>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span className="text-xs text-slate-500 block">اشتباهات</span>
                      <span className="font-black text-sm text-amber-600 dark:text-amber-400">
                        {formatNumber(dataCounts.mistakes, numPref)}
                      </span>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span className="text-xs text-slate-500 block">افتخارات</span>
                      <span className="font-black text-sm text-emerald-600 dark:text-emerald-400">
                        {formatNumber(dataCounts.achievements, numPref)}
                      </span>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span className="text-xs text-slate-500 block">الگوها</span>
                      <span className="font-black text-sm text-violet-600 dark:text-violet-400">
                        {formatNumber(dataCounts.patterns, numPref)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Primary Backup & Restore Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleDownloadBackup}
                    className="p-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs sm:text-sm shadow-md shadow-indigo-600/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span>💾</span>
                    <span>ایجاد فایل پشتیبان کامل</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleTriggerFileSelect}
                    className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400 font-black text-xs sm:text-sm hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span>📥</span>
                    <span>بازیابی از فایل پشتیبان</span>
                  </button>
                </div>

                {/* Secondary Export Options */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors"
                  >
                    📊 {t('export_history_btn', lang)}
                  </button>
                  <button
                    type="button"
                    onClick={handleExportStatsJSON}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors"
                  >
                    📄 {t('export_stats_btn', lang)}
                  </button>
                </div>

                {/* Dangerous Zone: Reset All Data */}
                <div className="mt-4 pt-4 border-t border-rose-100 dark:border-rose-950/80">
                  <button
                    type="button"
                    onClick={() => setShowResetModal(true)}
                    className="w-full p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-100 dark:hover:bg-rose-950/70 text-rose-600 dark:text-rose-400 font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2"
                  >
                    <span>⚠️</span>
                    <span>{t('reset_data_btn', lang)}</span>
                  </button>
                </div>
              </div>
            </AccordionSection>

            {/* 7. APP MANAGEMENT & OFFLINE */}
            <AccordionSection
              id="accordion-app-management"
              icon="📱"
              title={t('app_management_title', lang)}
              subtitle={t('app_management_desc', lang)}
              badge={isInstalled ? 'نصب شده ✓' : isOnline ? 'آنلاین' : 'آفلاین'}
              isOpen={!!openSections.app_management}
              onToggle={() => toggleSection('app_management')}
            >
              <div className="space-y-4 pt-2 text-xs">
                {/* Version & Environment info */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between">
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {t('version_label', lang)}
                  </span>
                  <span className="font-black text-indigo-600 dark:text-indigo-400">
                    v{APP_VERSION} (Math Hero PWA)
                  </span>
                </div>

                {/* Connectivity Status Banner */}
                <div
                  className={`p-3.5 rounded-2xl border flex items-start gap-2.5 ${
                    isOnline
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60'
                      : 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60'
                  }`}
                >
                  <span className="text-lg shrink-0">{isOnline ? '🟢' : '🟠'}</span>
                  <div>
                    <span className="font-bold block text-slate-800 dark:text-slate-100">
                      {isOnline ? t('offline_status_online', lang) : t('offline_status_offline', lang)}
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      {t('offline_explanation', lang)}
                    </p>
                  </div>
                </div>

                {/* PWA Installation Card */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 space-y-2">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block">
                    نصب به عنوان برنامه مستقل (PWA)
                  </span>

                  {isInstalled ? (
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-black">
                      <span>✓</span>
                      <span>{t('pwa_installed_badge', lang)}</span>
                    </div>
                  ) : isInstallable ? (
                    <button
                      type="button"
                      onClick={install}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <span>📲</span>
                      <span>{t('install_pwa_btn', lang)}</span>
                    </button>
                  ) : isIOS ? (
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      <p className="font-bold text-slate-800 dark:text-slate-200">
                        {t('ios_install_title', lang)}
                      </p>
                      <p>{t('ios_install_step1', lang)}</p>
                      <p>{t('ios_install_step2', lang)}</p>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500">
                      برنامه در مرورگر با قابلیت دسترسی آفلاین در حال اجراست.
                    </p>
                  )}
                </div>

                {/* Safe Cache Clearing & Reload */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleClearCache}
                    className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>🧹</span>
                    <span>پاکسازی حافظه موقت</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleReloadApp}
                    className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>🔄</span>
                    <span>بارگذاری مجدد برنامه</span>
                  </button>
                </div>
              </div>
            </AccordionSection>

            {/* 8. ABOUT MATH HERO */}
            <AccordionSection
              id="accordion-about"
              icon="⭐"
              title={t('about_title', lang)}
              subtitle={t('about_desc', lang)}
              isOpen={!!openSections.about}
              onToggle={() => toggleSection('about')}
            >
              <div className="pt-2 space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                <p className="font-medium text-slate-800 dark:text-slate-200">
                  {t('about_body', lang)}
                </p>

                <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300">
                  🛡️ {t('about_privacy', lang)}
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-[11px]">
                  ⚙️ {t('about_tech', lang)}
                </div>
              </div>
            </AccordionSection>

            {/* 9. LATEST CHANGES & CHANGELOG */}
            <AccordionSection
              id="accordion-changelog"
              icon="📜"
              title={t('changelog_title', lang)}
              subtitle={t('changelog_desc', lang)}
              badge="v1.0.0"
              isOpen={!!openSections.changelog}
              onToggle={() => toggleSection('changelog')}
            >
              <div className="pt-3 space-y-4">
                {CHANGELOG_ENTRIES.map((entry, idx) => (
                  <div
                    key={entry.version}
                    className="relative pr-4 pb-4 border-r-2 border-indigo-200 dark:border-indigo-900 last:border-r-0 last:pb-0"
                  >
                    <div className="absolute -right-2 top-0 w-4 h-4 rounded-full bg-indigo-600 border-2 border-white dark:border-slate-900" />
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-indigo-600 dark:text-indigo-400">
                        {entry.version}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        {lang === 'fa' ? entry.dateFa : entry.dateEn}
                      </span>
                      {idx === 0 && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200">
                          جدیدترین
                        </span>
                      )}
                    </div>
                    <ul className="mt-1.5 space-y-1 text-xs text-slate-600 dark:text-slate-400 list-disc list-inside">
                      {(lang === 'fa' ? entry.highlightsFa : entry.highlightsEn).map((hl, i) => (
                        <li key={i} className="leading-relaxed">
                          {hl}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </AccordionSection>
          </div>
        </div>
      </div>

      {/* Restore Confirmation Modal */}
      <RestoreModal
        isOpen={showRestoreModal}
        validationResult={validationResult}
        settings={settings}
        onCancel={() => setShowRestoreModal(false)}
        onConfirmRestore={handleConfirmRestore}
      />

      {/* Reset Confirmation Modal (2-Step Safety) */}
      <ResetModal
        isOpen={showResetModal}
        onCancel={() => setShowResetModal(false)}
        onConfirmReset={handleConfirmReset}
        onDownloadBackup={handleDownloadBackup}
      />
    </div>
  );
};

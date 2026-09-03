/**
 * SettingsScreen component for Math Hero.
 * Manages theme preferences, sound effects, and number formatting.
 */

import React from 'react';
import { AppSettings, ScreenId } from '../types';

interface SettingsScreenProps {
  settings: AppSettings;
  onUpdateSettings: (updated: AppSettings) => void;
  onNavigate: (screen: ScreenId) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  onUpdateSettings,
  onNavigate,
}) => {
  const handleToggleSound = () => {
    onUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled });
  };

  const handleToggleTheme = (theme: 'light' | 'dark') => {
    onUpdateSettings({ ...settings, theme });
  };

  const handleToggleNumberFormat = (numberFormat: 'persian' | 'english') => {
    onUpdateSettings({ ...settings, numberFormat });
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('home')}
          className="px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 transition-colors"
        >
          ← بازگشت به خانه
        </button>
        <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">تنظیمات برنامه</h2>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-100 dark:border-slate-800 shadow-2xl space-y-6">
        {/* Theme Settings */}
        <div className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100">حالت نمایش (تم)</h3>
            <p className="text-xs text-slate-500">انتخاب تم روشن یا تاریک</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleToggleTheme('light')}
              className={`px-4 py-2 rounded-xl font-bold transition-all ${settings.theme === 'light' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
            >
              روشن ☀️
            </button>
            <button
              onClick={() => handleToggleTheme('dark')}
              className={`px-4 py-2 rounded-xl font-bold transition-all ${settings.theme === 'dark' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
            >
              تاریک 🌙
            </button>
          </div>
        </div>

        {/* Sound Settings */}
        <div className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100">صداهای تشویقی</h3>
            <p className="text-xs text-slate-500">پخش افکت‌های صوتی هنگام پاسخ‌دهی</p>
          </div>
          <button
            onClick={handleToggleSound}
            className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors ${settings.soundEnabled ? 'bg-indigo-600 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'}`}
          >
            <div className="w-6 h-6 rounded-full bg-white shadow-md transform transition-transform" />
          </button>
        </div>

        {/* Number Format Settings */}
        <div className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100">فرمت نمایش اعداد</h3>
            <p className="text-xs text-slate-500">اعداد فارسی (۰-۹) یا انگلیسی (0-9)</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleToggleNumberFormat('persian')}
              className={`px-4 py-2 rounded-xl font-bold transition-all ${settings.numberFormat === 'persian' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
            >
              فارسی (۰-۹)
            </button>
            <button
              onClick={() => handleToggleNumberFormat('english')}
              className={`px-4 py-2 rounded-xl font-bold transition-all ${settings.numberFormat === 'english' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
            >
              انگلیسی (0-9)
            </button>
          </div>
        </div>

        {/* Profile & Onboarding Replay */}
        <div className="flex items-center justify-between py-4">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100">تغییر کامل پروفایل</h3>
            <p className="text-xs text-slate-500">اجرای مجدد مراحل آشنایی و انتخاب کاراکتر</p>
          </div>
          <button
            onClick={() => onNavigate('onboarding')}
            className="px-4 py-2 rounded-xl font-bold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 transition-all text-xs"
          >
            آشنایی مجدد ✨
          </button>
        </div>
      </div>
    </div>
  );
};

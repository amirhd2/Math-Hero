/**
 * Top Navbar & Header component for Math Hero.
 * Displays profile summary (XP, level, streak, coins), PWA install trigger, and navigation triggers.
 * Includes safe area inset support for iOS / iPad status bar.
 */
import React from 'react';
import { UserProfile, AppSettings, ScreenId } from '../types';
import { Character } from './Character';
import { formatNumber } from '../utils/persian';
import { PWAInstallButton } from './pwa/PWAInstallButton';

interface NavbarProps {
  profile: UserProfile;
  settings: AppSettings;
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  settings,
  currentScreen,
  onNavigate,
}) => {
  const isQuizActive = currentScreen === 'quiz_active';

  return (
    <header 
      className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 transition-colors"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-2">
        {/* Brand / Logo with Animated Hero Character */}
        <div 
          onClick={() => !isQuizActive && onNavigate('profile')} 
          className="flex items-center gap-2.5 cursor-pointer group shrink-0"
          title="پروفایل قهرمان"
        >
          <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform overflow-hidden">
            <Character character={profile.gender} pose="master" size="sm" className="w-8 h-8 text-lg" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
              قهرمان ریاضی
            </h1>
            <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold hidden sm:block">
              {profile.name} • سطح {formatNumber(profile.level, settings.numberFormat)}
            </p>
          </div>
        </div>

        {/* Gamification Status Bar (XP, Streak, Coins) */}
        {!isQuizActive && (
          <div className="hidden md:flex items-center gap-4 bg-slate-100 dark:bg-slate-900 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400" title="امتیاز XP">
              <span>⭐</span>
              <span>{formatNumber(profile.xp, settings.numberFormat)} XP</span>
            </div>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400" title="روزهای متوالی">
              <span>🔥</span>
              <span>{formatNumber(profile.streakDays, settings.numberFormat)} روز</span>
            </div>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
            <div className="flex items-center gap-1.5 text-xs font-bold text-violet-600 dark:text-violet-400" title="سطح قهرمان">
              <span>👑</span>
              <span>سطح {formatNumber(profile.level, settings.numberFormat)}</span>
            </div>
          </div>
        )}

        {/* Left Actions: Settings Button & PWA Install Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {!isQuizActive && <PWAInstallButton />}
          
          {!isQuizActive && (
            <button
              onClick={() => onNavigate('settings')}
              className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all shadow-sm shrink-0 cursor-pointer ${
                currentScreen === 'settings'
                  ? 'bg-indigo-600 text-white shadow-indigo-600/30'
                  : 'bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800'
              }`}
              aria-label="تنظیمات برنامه"
              title="تنظیمات"
            >
              <span className="text-xl">⚙️</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

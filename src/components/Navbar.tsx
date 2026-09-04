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
        {/* Brand / Logo */}
        <div 
          onClick={() => !isQuizActive && onNavigate('home')} 
          className="flex items-center gap-3 cursor-pointer group shrink-0"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            ۵
          </div>
          <div>
            <h1 className="text-lg font-black bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
              قهرمان ریاضی
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">Math Hero PWA</p>
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

        {/* Right Actions: PWA Install Button (Chromium only) & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {!isQuizActive && <PWAInstallButton />}
          
          {!isQuizActive && (
            <button
              onClick={() => onNavigate('settings')}
              className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors shadow-sm shrink-0 ${
                currentScreen === 'settings'
                  ? 'bg-indigo-600 text-white shadow-indigo-600/30'
                  : 'bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
              aria-label="تنظیمات برنامه"
              title="تنظیمات"
            >
              ⚙️
            </button>
          )}

          {!isQuizActive && (
            <button
              onClick={() => onNavigate('profile')}
              className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 p-1.5 pr-3 rounded-2xl border border-indigo-200 dark:border-indigo-800 transition-colors shrink-0"
            >
              <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 hidden sm:inline">
                {profile.name}
              </span>
              <Character character={profile.gender} pose="master" size="sm" className="w-8 h-8 text-lg" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

/**
 * BottomNavigation component for Math Hero.
 * Modern, playful floating dock navigation bar with smooth layout transitions,
 * glassmorphism backdrop, and responsive mobile/tablet layout.
 */

import React from 'react';
import { motion } from 'motion/react';
import { ScreenId, AppMode } from '../../types';
import { sound } from '../../utils/sound';

interface BottomNavigationProps {
  currentScreen: ScreenId;
  appMode: AppMode;
  onNavigate: (screen: ScreenId) => void;
  isBackground?: boolean;
  soundEnabled?: boolean;
}

interface NavTabItem {
  id: ScreenId;
  label: string;
  icon: string;
  badge?: string;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentScreen,
  appMode,
  onNavigate,
  isBackground = false,
  soundEnabled = true,
}) => {
  const tabs: NavTabItem[] = [
    {
      id: 'home',
      label: 'خانه',
      icon: '🏠',
    },
    appMode === 'parent'
      ? {
          id: 'parent_dashboard',
          label: 'میز مربی',
          icon: '👨‍🏫',
        }
      : {
          id: 'mistakes',
          label: 'گنجینه',
          icon: '💡',
        },
    {
      id: 'progress',
      label: 'آمار',
      icon: '📊',
    },
    {
      id: 'achievements',
      label: 'نشان‌ها',
      icon: '🏆',
    },
    {
      id: 'settings',
      label: 'تنظیمات',
      icon: '⚙️',
    },
  ];

  const handleTabClick = (tabId: ScreenId) => {
    if (isBackground) return;
    sound.playClick(soundEnabled);
    onNavigate(tabId);
  };

  return (
    <nav
      id="bottom-navigation-dock"
      aria-label="منوی اصلی برنامه"
      className={`fixed bottom-1 sm:bottom-1.5 left-1/2 -translate-x-1/2 w-[calc(100%-1.25rem)] max-w-md z-40 md:hidden ${
        isBackground ? 'pointer-events-none' : ''
      }`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {/* Floating Glassmorphism Container */}
      <div className="relative bg-white/94 dark:bg-slate-900/94 backdrop-blur-2xl border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-indigo-950/15 dark:shadow-black/60 rounded-2xl sm:rounded-full p-1 flex items-center justify-between gap-0.5 overflow-hidden transition-colors">
        {/* Subtle Top Ambient Accent Line */}
        <div className="absolute top-0 left-6 right-6 h-[1.5px] bg-gradient-to-r from-transparent via-indigo-400/40 dark:via-indigo-500/30 to-transparent pointer-events-none" />

        {tabs.map((tab) => {
          const isActive = currentScreen === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`relative flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl sm:rounded-full transition-all duration-300 cursor-pointer select-none outline-none group ${
                isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title={tab.label}
            >
              {/* Active Tab Floating Pill (Animated Layout) */}
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-active-pill"
                  className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 dark:from-indigo-500 dark:via-indigo-600 dark:to-purple-700 rounded-xl sm:rounded-full shadow-md shadow-indigo-500/25 border border-indigo-400/30 dark:border-indigo-300/20 z-0"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}

              {/* Tab Content Layer */}
              <div className="relative z-10 flex flex-col items-center gap-0.5 pointer-events-none">
                <motion.span
                  className="text-base sm:text-lg leading-none inline-block filter drop-shadow-xs"
                  animate={{ scale: isActive ? 1.15 : 1, y: isActive ? -0.5 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                >
                  {tab.icon}
                </motion.span>
                <span
                  className={`text-[9.5px] sm:text-[10.5px] leading-tight font-black transition-colors ${
                    isActive ? 'text-white drop-shadow-xs' : 'text-slate-600 dark:text-slate-400 font-bold'
                  }`}
                >
                  {tab.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

/**
 * TopDesktopNavigation component for Math Hero.
 * Sleek glassmorphism dock navigation bar for Desktop & Tablet viewports,
 * perfectly synchronized in visual styling, motion, and active pills with BottomNavigation.
 */

import React from 'react';
import { motion } from 'motion/react';
import { ScreenId, AppMode } from '../../types';
import { sound } from '../../utils/sound';

interface TopDesktopNavigationProps {
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
}

export const TopDesktopNavigation: React.FC<TopDesktopNavigationProps> = ({
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
      id="top-desktop-navigation"
      aria-label="منوی بالای صفحه"
      className={`relative bg-slate-100/90 dark:bg-slate-800/90 backdrop-blur-xl border border-slate-200/90 dark:border-slate-700/80 shadow-xs rounded-full p-1 flex items-center gap-1 overflow-hidden transition-colors ${
        isBackground ? 'pointer-events-none' : ''
      }`}
    >
      {tabs.map((tab) => {
        const isActive = currentScreen === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`relative px-3.5 py-1.5 rounded-full text-xs lg:text-sm font-black flex items-center gap-2 transition-all duration-300 cursor-pointer select-none outline-none group ${
              isActive
                ? 'text-white'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-700/50'
            }`}
            title={tab.label}
          >
            {/* Active Tab Floating Pill (Animated Layout) */}
            {isActive && (
              <motion.div
                layoutId="top-desktop-nav-active-pill"
                className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 dark:from-indigo-500 dark:via-indigo-600 dark:to-purple-700 rounded-full shadow-md shadow-indigo-500/20 border border-indigo-400/30 dark:border-indigo-300/20 z-0"
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              />
            )}

            {/* Content Layer */}
            <span className="relative z-10 flex items-center gap-1.5 pointer-events-none">
              <motion.span
                className="text-sm lg:text-base leading-none inline-block filter drop-shadow-xs"
                animate={{ scale: isActive ? 1.15 : 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              >
                {tab.icon}
              </motion.span>
              <span className={`leading-none ${isActive ? 'text-white drop-shadow-xs' : ''}`}>
                {tab.label}
              </span>
            </span>
          </button>
        );
      })}
    </nav>
  );
};

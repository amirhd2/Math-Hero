import React from 'react';
import { TrophyInfo } from '../gamification/gamificationTypes';
import { formatNumber } from '../utils/persian';

interface CurrentBadgeCardProps {
  trophyInfo?: TrophyInfo;
  levelTitle?: string;
  level?: number;
  onNavigate?: (screen: string) => void;
}

export const CurrentBadgeCard: React.FC<CurrentBadgeCardProps> = ({
  trophyInfo,
  levelTitle,
  level = 4,
  onNavigate,
}) => {
  // Line 1: Status rank (e.g. Level 4)
  const rankStatus = `Level ${formatNumber(level, 'persian')}`;

  // Line 2: Stage title unlocked and current stage (e.g. حل‌کننده مسائل)
  const stageTitle = levelTitle || (trophyInfo && trophyInfo.stageNameFa) || 'حل‌کننده مسائل';

  // Line 3: Current earned medal (replacing "به خاطر تلاش‌های عالی‌ات!")
  const currentMedalText = trophyInfo?.stageNameFa
    ? `مدال طلایی ${trophyInfo.stageNameFa}`
    : `مدال طلایی Level ${formatNumber(level, 'persian')}`;

  return (
    <div
      onClick={() => onNavigate && onNavigate('achievements')}
      className="bg-white dark:bg-slate-900 rounded-[28px] sm:rounded-[32px] p-5 sm:p-6 border border-indigo-100/90 dark:border-slate-800 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group select-none relative overflow-hidden -mt-12 sm:-mt-14 md:-mt-16 lg:mt-0 z-20"
    >
      {/* Top Header with subtle lines: —— نشان فعلی —— */}
      <div className="flex items-center justify-center gap-3 mb-4">
        <div className="h-[1.5px] bg-indigo-100/80 dark:bg-slate-700/80 flex-1 max-w-[64px] rounded-full" />
        <span className="text-sm font-black text-indigo-900 dark:text-indigo-300 tracking-wide">
          نشان فعلی
        </span>
        <div className="h-[1.5px] bg-indigo-100/80 dark:bg-slate-700/80 flex-1 max-w-[64px] rounded-full" />
      </div>

      {/* Main Content: 3 Lines of Text on Right, Shield Medal Icon on Left */}
      <div className="flex items-center justify-between gap-4 sm:gap-7" dir="rtl">
        {/* Right Side (in RTL): 3 Lines of Text */}
        <div className="text-right space-y-1 sm:space-y-1.5 flex-1 max-w-[280px] sm:max-w-none">
          {/* Line 1: Status rank (e.g. Level 4) */}
          <div className="text-xs sm:text-sm font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            {rankStatus}
          </div>

          {/* Line 2: Unlocked Stage Title (e.g. حل‌کننده مسائل) */}
          <h4 className="text-xl sm:text-2xl md:text-3xl font-black text-indigo-950 dark:text-indigo-100 tracking-tight leading-snug">
            {stageTitle}
          </h4>

          {/* Line 3: Current Earned Medal */}
          <p className="text-xs sm:text-sm md:text-base font-extrabold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
            <span>🥇</span>
            <span>{currentMedalText}</span>
          </p>
        </div>

        {/* Left Side (in RTL): Shield Medal Badge Icon */}
        <div className="shrink-0 flex items-center justify-center transform group-hover:scale-105 group-hover:-rotate-1 transition-transform duration-300">
          <svg
            viewBox="0 0 100 115"
            className="w-20 h-24 sm:w-24 sm:h-28 filter drop-shadow-xl"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Outer Ambient Glow */}
              <filter id="badgeOuterGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#6366F1" floodOpacity="0.35" />
              </filter>

              {/* 3D Gold Frame Gradient */}
              <linearGradient id="shieldGoldRim" x1="15%" y1="0%" x2="85%" y2="100%">
                <stop offset="0%" stopColor="#FFFBEB" />
                <stop offset="20%" stopColor="#FDE68A" />
                <stop offset="45%" stopColor="#F59E0B" />
                <stop offset="70%" stopColor="#D97706" />
                <stop offset="88%" stopColor="#FBBF24" />
                <stop offset="100%" stopColor="#78350F" />
              </linearGradient>

              {/* Bevel Highlight Ridge */}
              <linearGradient id="bevelRidge" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FEF3C7" />
                <stop offset="50%" stopColor="#B45309" />
                <stop offset="100%" stopColor="#FEF08A" />
              </linearGradient>

              {/* Royal Deep Purple/Violet Background */}
              <radialGradient id="purpleShieldField" cx="50%" cy="32%" r="68%">
                <stop offset="0%" stopColor="#4C1D95" />
                <stop offset="40%" stopColor="#31106A" />
                <stop offset="75%" stopColor="#1E0B44" />
                <stop offset="100%" stopColor="#100528" />
              </radialGradient>

              {/* Crown Metallic Gradient */}
              <linearGradient id="crownGradient" x1="25%" y1="0%" x2="75%" y2="100%">
                <stop offset="0%" stopColor="#FFFBEB" />
                <stop offset="25%" stopColor="#FDE047" />
                <stop offset="65%" stopColor="#EAB308" />
                <stop offset="100%" stopColor="#A16207" />
              </linearGradient>

              {/* Stars Metallic Gradient */}
              <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFBEB" />
                <stop offset="40%" stopColor="#FDE047" />
                <stop offset="100%" stopColor="#CA8A04" />
              </linearGradient>
            </defs>

            {/* 1. Outer Golden Shield Bevel */}
            <path
              d="M 50 4 
                 L 89 18 
                 L 86 64 
                 C 86 87 50 109 50 109 
                 C 50 109 14 87 14 64 
                 L 11 18 
                 Z"
              fill="url(#shieldGoldRim)"
              filter="url(#badgeOuterGlow)"
            />

            {/* 2. Inner Golden Ridge */}
            <path
              d="M 50 7.5 
                 L 85 20 
                 L 82 63 
                 C 82 84 50 105 50 105 
                 C 50 105 18 84 18 63 
                 L 15 20 
                 Z"
              fill="url(#bevelRidge)"
            />

            {/* 3. Deep Violet Shield Body */}
            <path
              d="M 50 11.5 
                 L 80.5 22.5 
                 L 77.5 61.5 
                 C 77.5 80.5 50 99.5 50 99.5 
                 C 50 99.5 22.5 80.5 22.5 61.5 
                 L 19.5 22.5 
                 Z"
              fill="url(#purpleShieldField)"
            />

            {/* Subtle Top-Center Inner Sheen */}
            <ellipse cx="50" cy="36" rx="22" ry="16" fill="#A855F7" opacity="0.28" filter="blur(5px)" />

            {/* 4. Golden Crown with 3 Peaks and Circular Jewels */}
            <g transform="translate(0, 3)">
              {/* Crown Base Rim */}
              <path
                d="M 33 55 Q 50 58 67 55 L 67 58 Q 50 61 33 58 Z"
                fill="#854D0E"
              />
              <path
                d="M 34 54 Q 50 57 66 54 L 66 56.5 Q 50 59.5 34 56.5 Z"
                fill="url(#crownGradient)"
              />

              {/* Crown Main Peaks */}
              <path
                d="M 32 54 
                   L 30 35.5 
                   L 41 44.5 
                   L 50 27.5 
                   L 59 44.5 
                   L 70 35.5 
                   L 68 54 
                   Q 50 57 32 54 Z"
                fill="url(#crownGradient)"
                stroke="#B45309"
                strokeWidth="0.75"
              />

              {/* Central Light Reflection on Crown */}
              <path
                d="M 49 28.5 L 51 28.5 L 58 43 L 50 39.5 L 42 43 Z"
                fill="#FFFBEB"
                opacity="0.55"
              />

              {/* Pearls/Spheres on Crown Tips */}
              <circle cx="30" cy="34.5" r="2.6" fill="#FFFBEB" stroke="#B45309" strokeWidth="0.6" />
              <circle cx="50" cy="26.5" r="3.4" fill="#FFFFFF" stroke="#CA8A04" strokeWidth="0.7" />
              <circle cx="70" cy="34.5" r="2.6" fill="#FFFBEB" stroke="#B45309" strokeWidth="0.6" />
            </g>

            {/* 5. Three Golden Stars Below Crown */}
            {/* Left Star */}
            <path
              d="M 34 69.5 L 35.5 73.8 L 40 74.2 L 36.6 77.1 L 37.6 81.5 L 34 79 L 30.4 81.5 L 31.4 77.1 L 28 74.2 L 32.5 73.8 Z"
              fill="url(#starGradient)"
              stroke="#A16207"
              strokeWidth="0.45"
            />

            {/* Center Star (Prominent) */}
            <path
              d="M 50 66 L 52.2 71.8 L 58.5 72.3 L 53.8 76.3 L 55.2 82.5 L 50 79.2 L 44.8 82.5 L 46.2 76.3 L 41.5 72.3 L 47.8 71.8 Z"
              fill="url(#starGradient)"
              stroke="#A16207"
              strokeWidth="0.55"
            />

            {/* Right Star */}
            <path
              d="M 66 69.5 L 67.5 73.8 L 72 74.2 L 68.6 77.1 L 69.6 81.5 L 66 79 L 62.4 81.5 L 63.4 77.1 L 60 74.2 L 64.5 73.8 Z"
              fill="url(#starGradient)"
              stroke="#A16207"
              strokeWidth="0.45"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

/**
 * LevelUpModal component for Math Hero.
 * Celebrates user profile level-up with a festive modal banner.
 *
 * Requirements satisfied:
 * - Owl character at top-left protrudes outside without being cropped (overflow-visible)
 * - Centered vertically on screen without needing scrolling (compact max-h-[90vh])
 * - Center stage icon displays the actual Level Stage Icon image (StageIcon)
 * - Plays cheering sound effect on mount
 */

import React, { useEffect } from 'react';
import { toPersianDigits } from '../../utils/persian';
import { getAssetUrl } from '../../utils/assetPaths';
import { sound } from '../../utils/sound';
import { StageIcon } from '../common/StageIcon';
import { LEVEL_DEFINITIONS } from '../../gamification/levelCalculator';

interface LevelUpModalProps {
  level: number;
  onAccept: () => void;
  soundEnabled?: boolean;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  level,
  onAccept,
  soundEnabled = true,
}) => {
  useEffect(() => {
    sound.playCheer(soundEnabled);
  }, [soundEnabled]);

  const currentLevelDef = LEVEL_DEFINITIONS[level - 1] || LEVEL_DEFINITIONS[0];

  return (
    <div
      id="level-up-modal-backdrop"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto animate-fadeIn"
      dir="rtl"
    >
      <div
        id="level-up-modal-card"
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 shadow-2xl border-2 border-amber-400 dark:border-amber-500 my-auto text-center space-y-4 overflow-visible max-h-[92vh] flex flex-col justify-between"
      >
        {/* Glow Accents */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-32 h-32 bg-amber-400/25 rounded-full blur-2xl pointer-events-none" />

        {/* Owl Character (Top-Left, Standalone - Protruding cleanly outside with NO cropping) */}
        <div className="absolute -top-10 -left-3 sm:-top-12 sm:-left-4 w-20 h-20 sm:w-24 sm:h-24 pointer-events-none select-none z-30 filter drop-shadow-xl">
          <img
            src={getAssetUrl('assets/characters/owl/Celebrating.webp')}
            alt="جغد دانا"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Top Header Label */}
        <div className="pt-2">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 text-xs font-black border border-amber-300 dark:border-amber-700">
            <span>🌟</span>
            <span>ارتقای سطح جدید کاربر!</span>
          </div>
        </div>

        {/* Center Level Icon (Official Level Stage Image Icon) */}
        <div className="relative mx-auto w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center select-none py-1">
          {/* Animated Glowing Ring & Twinkling Effects */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-400 via-orange-400 to-yellow-300 animate-pulse blur-md opacity-70" />
          <div className="absolute -top-1 -right-1 text-yellow-400 text-lg animate-spin-slow pointer-events-none drop-shadow">
            ✨
          </div>
          <div className="absolute -bottom-1 -left-1 text-amber-300 text-base animate-bounce pointer-events-none drop-shadow">
            🌟
          </div>

          {/* Actual Stage Icon for this level */}
          <div className="relative w-full h-full p-2 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 shadow-xl flex items-center justify-center animate-bounce border-2 border-amber-300">
            <StageIcon
              level={level}
              size="fill"
              className="w-full h-full object-contain filter drop-shadow-md"
            />
          </div>
        </div>

        {/* Heading & Details */}
        <div className="space-y-1.5">
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            تبریک! رسیدن به سطح {toPersianDigits(level)} 🎉
          </h3>

          <p className="text-sm font-black text-amber-600 dark:text-amber-400">
            «{currentLevelDef.title}»
          </p>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-w-xs sm:max-w-sm mx-auto">
            آفرین قهرمان! با تلاش فراوان و حل موفق تمرین‌ها، یک مرحله بالا رفتی و به این سطح ارزشمند صعود کردی.
          </p>
        </div>

        {/* Level Reward Info Box */}
        <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/40 dark:via-orange-950/40 dark:to-yellow-950/40 border border-amber-200 dark:border-amber-800 text-right space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-amber-800 dark:text-amber-300 uppercase tracking-wider">
              ⚡ دستاورد جدید:
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-200/70 dark:bg-amber-900/70 text-amber-900 dark:text-amber-100 font-bold">
              سطح {toPersianDigits(level)}
            </span>
          </div>

          <p className="text-xs text-slate-700 dark:text-slate-300 font-bold leading-relaxed">
            موقعیت تو در نقشه مسیر قهرمانان درخشان‌تر شد و به جام‌های جدید نزدیک‌تر شدی!
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-1">
          <button
            id="accept-level-up-btn"
            onClick={onAccept}
            className="w-full py-3.5 px-5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-black text-base rounded-2xl shadow-lg hover:shadow-amber-500/25 transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>بزن بریم!</span>
            <span>🚀</span>
          </button>
        </div>
      </div>
    </div>
  );
};

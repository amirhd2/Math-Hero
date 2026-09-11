/**
 * TrophyUnlockModal component for Math Hero.
 * Celebrates unlocking a brand-new Math Hero Trophy Stage (جام جدید).
 *
 * Requirements satisfied:
 * - Owl character at top-left protrudes outside without being cropped (overflow-visible)
 * - Centered vertically on screen without needing scrolling (compact max-h-[90vh])
 * - Center trophy image with sparkling twinkling stars and glistening sheen animation ("انیمیشن برق زدن")
 * - Specific trophy stage title and educational achievement text
 * - Plays celebratory cheering sound effect on mount
 */

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { TrophyInfo } from '../../gamification/gamificationTypes';
import { getAssetUrl } from '../../utils/assetPaths';
import { sound } from '../../utils/sound';
import { toPersianDigits } from '../../utils/persian';

interface TrophyUnlockModalProps {
  trophyInfo: TrophyInfo;
  onAccept: () => void;
  soundEnabled?: boolean;
}

export const TrophyUnlockModal: React.FC<TrophyUnlockModalProps> = ({
  trophyInfo,
  onAccept,
  soundEnabled = true,
}) => {
  useEffect(() => {
    sound.playCheer(soundEnabled);
  }, [soundEnabled]);

  const cupImageSrc = trophyInfo.cupImage
    ? getAssetUrl(trophyInfo.cupImage)
    : getAssetUrl('assets/cups/wooden 1.webp');

  const modalContent = (
    <div
      id="trophy-unlock-modal-backdrop"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn select-none"
      dir="rtl"
    >
      <div
        id="trophy-unlock-modal-card"
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 shadow-2xl border-2 border-amber-400 dark:border-amber-500 my-auto text-center space-y-4 overflow-visible max-h-[90vh] flex flex-col justify-between"
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
            <span>🏆</span>
            <span>دریافت جام جدید!</span>
          </div>
        </div>

        {/* Center Trophy Display with Sparkling & Glistening Light Animation */}
        <div className="relative mx-auto w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center select-none py-1 my-1">
          {/* Pulsing Light Glow behind Cup */}
          <div className="absolute inset-1 rounded-full bg-gradient-to-tr from-amber-400/40 via-yellow-300/50 to-amber-500/30 blur-xl animate-pulse" />

          {/* Twinkling Sparkling Stars around Cup (Barq Zadan) */}
          <div className="absolute -top-1 right-1 text-yellow-400 text-base sm:text-lg animate-spin-slow pointer-events-none select-none drop-shadow">
            ✨
          </div>
          <div className="absolute bottom-1 left-0 text-amber-300 text-sm sm:text-base animate-bounce pointer-events-none select-none drop-shadow">
            🌟
          </div>
          <div className="absolute top-2 left-1 text-yellow-300 text-xs sm:text-sm animate-pulse pointer-events-none select-none drop-shadow">
            ✨
          </div>

          {/* Trophy Cup Image with Glistening Sheen & Gentle Pulse Animation */}
          <div className="relative w-full h-full flex items-center justify-center p-1 group">
            <img
              src={cupImageSrc}
              alt={trophyInfo.stageNameFa}
              className="w-full h-full object-contain filter drop-shadow-2xl animate-pulse select-none max-h-24 sm:max-h-28"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.dataset.fallback) {
                  target.dataset.fallback = '1';
                  target.src = getAssetUrl('assets/cups/gold 1.webp');
                }
              }}
            />

            {/* Light Sweep Sheen (Barq Zadan Effect) */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full animate-[shimmer_2s_infinite] pointer-events-none" />
          </div>
        </div>

        {/* Heading & Trophy Details */}
        <div className="space-y-1">
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {trophyInfo.stageNameFa} 🎉
          </h3>

          <p className="text-sm font-black text-amber-600 dark:text-amber-400">
            «{trophyInfo.title}»
          </p>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-w-xs sm:max-w-sm mx-auto">
            {trophyInfo.description}
          </p>
        </div>

        {/* Unlocked Stage Info Card */}
        <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-950/40 dark:via-yellow-950/40 dark:to-orange-950/40 border border-amber-300 dark:border-amber-700 text-right space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-amber-800 dark:text-amber-300 uppercase tracking-wider">
              👑 جایگاه جام قهرمانی:
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-200/80 dark:bg-amber-900/80 text-amber-900 dark:text-amber-100 font-bold">
              مرحله {toPersianDigits(trophyInfo.stage)} از {toPersianDigits(trophyInfo.maxStage)}
            </span>
          </div>

          <p className="text-xs text-slate-700 dark:text-slate-300 font-bold">
            جام جدید تو در ویترین افتخارات خانه و پروفایل قرار گرفت!
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-1">
          <button
            id="accept-trophy-btn"
            onClick={onAccept}
            className="w-full py-3.5 px-5 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-600 hover:to-yellow-600 text-white font-black text-base rounded-2xl shadow-lg hover:shadow-amber-500/25 transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>دریافت جام با افتخار</span>
            <span>🏆</span>
          </button>
        </div>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modalContent, document.body);
};

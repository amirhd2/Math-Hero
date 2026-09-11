/**
 * PromotionModal component for Math Hero.
 * Celebrates unlocking a new skill tier when the child demonstrates verified mastery.
 *
 * Displays:
 * - Standalone Owl Celebrating character at top-left with no box/background
 * - Exact unlocked tier medal with rocking/bouncing animation
 * - Clean "بزن بریم به مرحله بعد 🚀" confirmation action
 */

import React from 'react';
import { PromotionEvent } from '../../adaptive/adaptiveTypes';
import { toPersianDigits } from '../../utils/persian';
import { getAssetUrl } from '../../utils/assetPaths';
import { getTierMedalUrl } from '../../adaptive/tierRegistry';

interface PromotionModalProps {
  promotion: PromotionEvent;
  onAccept: () => void;
  onPostpone?: () => void;
}

export const PromotionModal: React.FC<PromotionModalProps> = ({
  promotion,
  onAccept,
}) => {
  const medalRelativePath = getTierMedalUrl(promotion.operation, promotion.unlockedTier);
  const medalSrc = getAssetUrl(medalRelativePath);

  return (
    <div
      id="promotion-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fadeIn"
      dir="rtl"
    >
      <div
        id="promotion-modal-card"
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-amber-400 dark:border-amber-500 my-auto text-center space-y-6"
      >
        {/* Glow Accents */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-28 h-28 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />

        {/* Owl Character (Top-Left, Standalone with NO background box/circle) */}
        <div className="absolute -top-8 left-3 sm:-top-10 sm:left-4 w-20 h-20 sm:w-24 sm:h-24 pointer-events-none select-none z-10">
          <img
            src={getAssetUrl('assets/characters/owl/Celebrating.webp')}
            alt="جغد دانا"
            className="w-full h-full object-contain filter drop-shadow-lg"
          />
        </div>

        {/* Exact Unlocked Tier Medal Asset (Bouncing/Rocking) */}
        <div className="relative mx-auto w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center select-none pt-2">
          <img
            src={medalSrc}
            alt={`مدال مرحله ${promotion.unlockedTier}`}
            className="w-full h-full object-contain filter drop-shadow-xl animate-bounce select-none"
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.dataset.fallback) {
                target.dataset.fallback = '1';
                target.src = getAssetUrl('assets/medals/16.png');
              }
            }}
          />
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 text-xs sm:text-sm font-black border border-amber-300 dark:border-amber-700">
            <span>⭐</span>
            <span>ارتقای سطح و تسلط درخشان!</span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            آفرین قهرمان ریاضی! 🎉
          </h3>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-w-md mx-auto">
            تو در مهارت{' '}
            <span className="font-black text-emerald-600 dark:text-emerald-400">
              «{promotion.masteredSkillTitleFa}»
            </span>{' '}
            به تسلط کامل و فوق‌العاده رسیدی!
          </p>
        </div>

        {/* New Unlocked Tier Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/40 dark:via-purple-950/40 dark:to-pink-950/40 border border-indigo-200 dark:border-indigo-800 text-right space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
              🔓 مرحله‌ی جدید آنلاک شد:
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-200/60 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200 font-bold">
              مرحله {toPersianDigits(promotion.unlockedTier)}
            </span>
          </div>

          <h4 className="text-lg font-black text-indigo-950 dark:text-indigo-100">
            {promotion.unlockedSkillTitleFa}
          </h4>

          {promotion.unlockedSampleExamplesFa && (
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
              نمونه سؤال‌ها: {toPersianDigits(promotion.unlockedSampleExamplesFa)}
            </p>
          )}

          <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold pt-1">
            از همین حالا می‌تونی در این مرحله جدید تمرین کنی و امتیاز بگیری!
          </p>
        </div>

        {/* Action Button: Single full-width Proceed button */}
        <div className="pt-2">
          <button
            id="accept-promotion-btn"
            onClick={onAccept}
            className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-base sm:text-lg rounded-2xl shadow-lg hover:shadow-emerald-500/25 transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>بزن بریم به مرحله بعد</span>
            <span>🚀</span>
          </button>
        </div>
      </div>
    </div>
  );
};


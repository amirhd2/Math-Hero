/**
 * PromotionModal component for Math Hero.
 * Celebrates unlocking a new skill tier when the child demonstrates verified mastery.
 *
 * Provides two clear choices:
 * - "بزن بریم 🚀" (Accepts promotion & immediately updates Learning Plan)
 * - "بعداً" (Postpones without relocking the tier)
 *
 * Supports Mobile Portrait, Mobile Landscape, Tablet Portrait, and Tablet Landscape.
 */

import React from 'react';
import { PromotionEvent } from '../../adaptive/adaptiveTypes';
import { Character } from '../Character';
import { toPersianDigits } from '../../utils/persian';

interface PromotionModalProps {
  promotion: PromotionEvent;
  onAccept: () => void;
  onPostpone: () => void;
}

export const PromotionModal: React.FC<PromotionModalProps> = ({
  promotion,
  onAccept,
  onPostpone,
}) => {
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
        {/* Glow & Confetti Accents */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-28 h-28 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />

        {/* Character Celebration Icon */}
        <div className="relative mx-auto w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-400 to-yellow-300 rounded-full animate-pulse blur-md opacity-70" />
          <div className="relative z-10 w-full h-full flex items-center justify-center text-5xl sm:text-6xl bg-amber-100 dark:bg-amber-950/60 rounded-full border-2 border-amber-300 dark:border-amber-600 shadow-inner">
            🎉
          </div>
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
            دوست داری از همین حالا وارد این چالش جدید بشی؟
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            id="accept-promotion-btn"
            onClick={onAccept}
            className="flex-1 py-3.5 px-6 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-sm sm:text-base rounded-2xl shadow-lg hover:shadow-emerald-500/25 transition-all transform active:scale-95 flex items-center justify-center gap-2"
          >
            <span>بزن بریم به مرحله بعد</span>
            <span>🚀</span>
          </button>

          <button
            id="postpone-promotion-btn"
            onClick={onPostpone}
            className="py-3.5 px-6 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm sm:text-base rounded-2xl transition-all"
          >
            بعداً
          </button>
        </div>
      </div>
    </div>
  );
};

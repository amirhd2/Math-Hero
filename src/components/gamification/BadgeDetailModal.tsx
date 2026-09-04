/**
 * BadgeDetailModal component for Math Hero.
 * Friendly modal displaying comprehensive information about a clicked badge,
 * including requirement hints, XP rewards, rarity, and celebratory status.
 */

import React from 'react';
import { Badge } from '../../gamification/gamificationTypes';
import { formatNumber } from '../../utils/persian';

interface BadgeDetailModalProps {
  badge: Badge | null;
  onClose: () => void;
}

export const BadgeDetailModal: React.FC<BadgeDetailModalProps> = ({ badge, onClose }) => {
  if (!badge) return null;

  const isUnlocked = Boolean(badge.unlocked);
  const progress = badge.progress ?? 0;
  const maxProgress = badge.maxProgress ?? badge.requirement.target ?? 1;
  const progressPercent = Math.min(100, Math.round((progress / maxProgress) * 100));

  const getRarityFa = (r: string) => {
    switch (r) {
      case 'common': return 'عمومی';
      case 'rare': return 'کمیاب';
      case 'epic': return 'حماسی';
      case 'legendary': return 'افسانه‌ای';
      default: return 'ویژه';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-8 text-center space-y-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 flex items-center justify-center font-black transition-colors"
        >
          ✕
        </button>

        {/* Large Badge Icon */}
        <div className="flex justify-center">
          <div
            className={`w-24 h-24 rounded-3xl flex items-center justify-center text-5xl shadow-2xl transition-transform ${
              isUnlocked
                ? 'bg-gradient-to-br from-amber-300 via-yellow-400 to-orange-500 text-slate-950 scale-105 ring-4 ring-amber-400/30'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
            }`}
          >
            {isUnlocked ? badge.icon : '🔒'}
          </div>
        </div>

        {/* Badge Title & Rarity */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              نشان {getRarityFa(badge.rarity)}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
              +{formatNumber(badge.xpReward, 'persian')} XP جایزه
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100">
            {badge.name}
          </h3>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-sm mx-auto">
            {badge.description}
          </p>
        </div>

        {/* Status Box */}
        <div className="bg-slate-50 dark:bg-slate-950/70 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 text-right">
          <div className="flex items-center justify-between text-xs font-black">
            <span className="text-slate-500 dark:text-slate-400">
              {isUnlocked ? 'وضعیت دست‌آورد:' : 'چطور این نشان را باز کنم؟'}
            </span>
            <span className={isUnlocked ? 'text-emerald-500' : 'text-indigo-500'}>
              {isUnlocked ? '✓ باز شده و دریافت شد' : 'در حال پیشرفت'}
            </span>
          </div>

          <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
            {badge.requirement.descriptionFa}
          </p>

          {!isUnlocked && (
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[11px] font-bold text-slate-500">
                <span>پیشرفت شما:</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-black">
                  {formatNumber(progress, 'persian')} از {formatNumber(maxProgress, 'persian')} ({formatNumber(progressPercent, 'persian')}٪)
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm rounded-2xl shadow-xl shadow-indigo-500/20 transition-colors"
        >
          {isUnlocked ? 'بسیار عالی! 🌟' : 'متوجه شدم، بزن بریم تمرین! 🚀'}
        </button>
      </div>
    </div>
  );
};

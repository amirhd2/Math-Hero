/**
 * PerformanceMessage component.
 * Delivers warm, age-appropriate, encouraging feedback in Persian.
 */

import React from 'react';
import { QuizResult } from '../../types';
import { PopoutOwlAvatar } from '../adaptive/PopoutOwlAvatar';

interface PerformanceMessageProps {
  result: QuizResult;
  className?: string;
}

export const PerformanceMessage: React.FC<PerformanceMessageProps> = ({ result, className = '' }) => {
  const score = result.score;

  let title = '';
  let description = '';
  let badgeText = '';
  let badgeColor = '';

  if (score === 100) {
    badgeText = 'نمره ۲۰ کامل 🏆';
    badgeColor = 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border border-emerald-300/60 dark:border-emerald-700/60';
    title = 'آفرین قهرمان! نمره کامل و بی‌نقص!';
    description = 'در این آزمون به تمام سوالات پاسخ درست دادی و هیچ اشتباهی برای مرور نداری! تو یک قهرمان واقعی ریاضی هستی.';
  } else if (score >= 80) {
    badgeText = 'عملکرد درخشان 🌟';
    badgeColor = 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300/60 dark:border-amber-700/60';
    title = 'عملکرد فوق‌العاده و درخشان!';
    description = 'تسلط بسیار خوبی روی مفاهیم داری. با همین پشتکار ادامه بده تا به نمره ۱۰۰٪ کامل برسی!';
  } else if (score >= 60) {
    badgeText = 'تلاش روبه‌جلو 💪';
    badgeColor = 'bg-sky-100 dark:bg-sky-950/60 text-sky-900 dark:text-sky-200 border border-sky-300/60 dark:border-sky-700/60';
    title = 'تلاش بسیار خوب و روبه‌جلو!';
    description = 'پایه‌های خوبی داری! با یک دور مرور سوالات اشتباه در بخش پایین، به تسلط کامل می‌رسی.';
  } else {
    badgeText = 'فرصت یادگیری 🌱';
    badgeColor = 'bg-orange-100 dark:bg-orange-950/60 text-orange-900 dark:text-orange-200 border border-orange-300/60 dark:border-orange-700/60';
    title = 'گام اول برای یادگیری عمیق‌تر!';
    description = 'هر اشتباه یک پله برای یادگیریه. با تمرین و مرور سوالات زیر، نقاط ضعفت رو به قدرتت تبدیل کن!';
  }

  return (
    <div
      role="region"
      aria-label="پیام معلم هوشمند"
      dir="rtl"
      className={`relative overflow-hidden rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-orange-500/10 dark:from-amber-950/40 dark:via-slate-900 dark:to-orange-950/30 border-2 border-amber-300/80 dark:border-amber-700/60 shadow-xl select-none ${className}`}
    >
      {/* Background decorative watermark */}
      <div className="absolute -bottom-10 -right-10 w-36 h-36 bg-orange-200/20 dark:bg-amber-400/5 rounded-full blur-2xl pointer-events-none" />

      {/* Content Row: Badges, Title & Description on Right; Owl Avatar on Top-Left (in RTL) */}
      <div className="relative z-10 my-auto flex items-start justify-between gap-3 sm:gap-4">
        {/* Right Side: Badges, Title, Pedagogical Description */}
        <div className="flex-1 min-w-0 flex flex-col justify-start text-right space-y-1 sm:space-y-1.5 pt-0.5">
          {/* Badges */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/30 text-amber-950 dark:text-amber-200 text-[11px] sm:text-xs font-black shadow-xs shrink-0">
              <span>✨</span>
              <span>پیام معلم هوشمند</span>
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-black shadow-xs shrink-0 ${badgeColor}`}>
              {badgeText}
            </span>
          </div>

          {/* Title */}
          <h4 className="text-sm sm:text-base md:text-lg font-black tracking-tight text-slate-950 dark:text-white line-clamp-1">
            {title}
          </h4>

          {/* Pedagogical Description */}
          <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Left Side (in RTL): 3D Pop-out Owl Avatar at Top-Left */}
        <div className="shrink-0 self-start -mt-2 sm:-mt-3 -ml-0.5 sm:-ml-1">
          <PopoutOwlAvatar sizeClassName="w-20 h-20 sm:w-24 sm:h-24 md:w-26 md:h-26" />
        </div>
      </div>
    </div>
  );
};


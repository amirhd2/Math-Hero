/**
 * PerformanceMessage component.
 * Delivers warm, age-appropriate, encouraging feedback in Persian.
 */

import React from 'react';
import { QuizResult } from '../../types';

interface PerformanceMessageProps {
  result: QuizResult;
}

export const PerformanceMessage: React.FC<PerformanceMessageProps> = ({ result }) => {
  const score = result.score;

  let message = '';
  let subtext = '';
  let icon = '🌱';

  if (score === 100) {
    icon = '🏆';
    message = 'نمره کامل و بی‌نقص!';
    subtext = 'تمام سوالات رو با دقت کامل حل کردی. تو یک قهرمان واقعی ریاضی هستی!';
  } else if (score >= 80) {
    icon = '🌟';
    message = 'عملکرد فوق‌العاده و درخشان!';
    subtext = 'تسلط بسیار خوبی روی مفاهیم داری. با همین پشتکار ادامه بده قهرمان!';
  } else if (score >= 60) {
    icon = '💪';
    message = 'تلاش بسیار خوب و روبه‌جلو!';
    subtext = 'پایه‌های خوبی داری! با یک دور مرور سوالات اشتباه، به نمره ۱۰۰٪ می‌رسی.';
  } else {
    icon = '🌱';
    message = 'گام اول برای یادگیری عمیق‌تر!';
    subtext = 'هر اشتباه یک پله برای یادگیریه. کارت عالی بود که تا آخر ادامه دادی!';
  }

  return (
    <div
      role="region"
      aria-label="پیام انگیزشی"
      className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200/80 dark:border-amber-800/80 p-5 rounded-3xl flex items-center gap-4 text-right shadow-sm"
    >
      <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-amber-600 dark:text-amber-400 flex items-center justify-center text-2xl shrink-0">
        {icon}
      </div>
      <div className="space-y-0.5">
        <h3 className="text-sm md:text-base font-black text-amber-950 dark:text-amber-200">
          {message}
        </h3>
        <p className="text-xs md:text-sm font-medium text-amber-900/80 dark:text-amber-300/80 leading-relaxed">
          {subtext}
        </p>
      </div>
    </div>
  );
};

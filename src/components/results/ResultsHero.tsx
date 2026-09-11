/**
 * ResultsHero component.
 * Displays celebration badge, and top-level outcome.
 */

import React from 'react';
import { UserProfile, QuizResult } from '../../types';
import { getAssetUrl } from '../../utils/assetPaths';

interface ResultsHeroProps {
  profile: UserProfile;
  result: QuizResult;
}

export const ResultsHero: React.FC<ResultsHeroProps> = ({ profile: _profile, result }) => {
  const isPerfect = result.score === 100;
  const isExcellent = result.score >= 80;
  const isGood = result.score >= 60;

  const iconUrl = isPerfect
    ? getAssetUrl('assets/cups/gold 1.webp')
    : isExcellent
    ? getAssetUrl('assets/cups/Dimond 1.webp')
    : isGood
    ? getAssetUrl('assets/cups/bronze 1.webp')
    : getAssetUrl('assets/medals/1.png');

  const outcomeTitle = isPerfect
    ? 'امتیاز ۱۰۰٪ کامل! شاهکار کردی!'
    : isExcellent
    ? 'درخشان و فوق‌العاده!'
    : isGood
    ? 'تلاش خیلی خوب و پرانرژی!'
    : 'گام ارزشمند برای یادگیری بیشتر!';

  const badgeStyle = isExcellent
    ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-300/60 dark:border-amber-700/60'
    : isGood
    ? 'bg-indigo-100 dark:bg-indigo-950/70 text-indigo-800 dark:text-indigo-300 border-indigo-300/60 dark:border-indigo-700/60'
    : 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-300/60 dark:border-emerald-700/60';

  return (
    <header className="flex flex-col items-center text-center space-y-4 pt-2">
      {/* Motivational outcome badge with real cup/medal */}
      <div className="space-y-2">
        <div
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs md:text-sm font-black border shadow-xs ${badgeStyle}`}
        >
          <img src={iconUrl} alt="" className="w-5 h-5 object-contain shrink-0 drop-shadow-2xs" />
          <span>{outcomeTitle}</span>
        </div>

        <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
          نتیجه تلاش ریاضی شما
        </h1>
      </div>
    </header>
  );
};

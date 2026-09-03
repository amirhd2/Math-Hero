/**
 * AchievementsScreen component for Math Hero.
 * Displays badges, trophies, and milestones.
 */

import React, { useEffect, useState } from 'react';
import { Achievement, ScreenId } from '../types';
import { storage } from '../utils/storage';
import { formatNumber } from '../utils/persian';

interface AchievementsScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export const AchievementsScreen: React.FC<AchievementsScreenProps> = ({ onNavigate }) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    storage.getAchievements().then(setAchievements);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('home')}
          className="px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 transition-colors"
        >
          ← بازگشت به خانه
        </button>
        <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">نشان‌ها و جام‌های قهرمانی</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {achievements.map((ach) => (
          <div
            key={ach.id}
            className={`p-6 rounded-3xl border shadow-xl flex items-center gap-6 transition-all ${
              ach.unlocked
                ? 'bg-white dark:bg-slate-900 border-amber-300/60 dark:border-amber-900/60 shadow-amber-500/10'
                : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 opacity-60'
            }`}
          >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg ${ach.unlocked ? 'bg-amber-400 text-slate-900' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
              {ach.unlocked ? '🏆' : '🔒'}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">{ach.title}</h3>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {formatNumber(ach.progress, 'persian')} / {formatNumber(ach.maxProgress, 'persian')}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{ach.description}</p>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all"
                  style={{ width: `${(ach.progress / ach.maxProgress) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

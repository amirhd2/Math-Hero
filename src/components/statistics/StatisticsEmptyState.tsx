/**
 * Empty State for Statistics Screen when child has no completed quizzes yet.
 */

import React from 'react';
import { CharacterGender } from '../../types';
import { Character } from '../Character';

interface StatisticsEmptyStateProps {
  gender: CharacterGender;
  onStartQuiz: () => void;
}

export const StatisticsEmptyState: React.FC<StatisticsEmptyStateProps> = ({
  gender,
  onStartQuiz,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 text-center border border-slate-100 dark:border-slate-800 shadow-xl max-w-xl mx-auto space-y-6">
      <div className="flex justify-center">
        <Character character={gender} pose="master" size="xl" className="animate-bounce" />
      </div>

      <div className="space-y-2">
        <h3 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100">
          سفر ریاضی شما از اینجا آغاز می‌شود! 🚀
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          اولین تمرین یا آزمون خودت رو کامل کن تا نمودار پیشرفت، نشان‌ها و آمار شگفت‌انگیزت اینجا نمایش داده بشن.
        </p>
      </div>

      <div>
        <button
          type="button"
          onClick={onStartQuiz}
          className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black text-base rounded-2xl shadow-lg shadow-indigo-500/25 active:scale-95 transition-all"
        >
          شروع اولین تمرین 🎯
        </button>
      </div>
    </div>
  );
};

/**
 * AdaptiveRecommendationCard for Math Hero.
 * Compact, encouraging, child-friendly banner displayed on Home.
 * Proactively recommends neglected operations or celebrated next milestones
 * with positive reinforcement (never punishing or shaming).
 */

import React from 'react';
import { OperationType } from '../../types';
import { AdaptiveLearningPlan } from '../../adaptive/adaptiveTypes';
import { toPersianDigits } from '../../utils/persian';
import { getTierDefinition } from '../../adaptive/tierRegistry';
import { PopoutOwlAvatar } from './PopoutOwlAvatar';

interface AdaptiveRecommendationCardProps {
  plan: AdaptiveLearningPlan;
  onStartRecommended: (op: OperationType) => void;
}

export const AdaptiveRecommendationCard: React.FC<AdaptiveRecommendationCardProps> = ({
  plan,
  onStartRecommended,
}) => {
  // 1. Check for neglected operations with positive framing
  let targetOp: OperationType = plan.primaryOperation || 'addition';
  let titleFa = 'پیشنهاد هوشمند معلم ریاضی 🌟';
  let messageFa = 'امروز آماده‌ای چند معما رو با هم حل کنیم؟';
  let buttonFa = 'شروع تمرین هوشمند 🚀';

  if (plan.neglectedOperations && plan.neglectedOperations.length > 0) {
    const op = plan.neglectedOperations[0];
    targetOp = op;

    const opTitles: Record<OperationType, string> = {
      addition: 'جمع',
      subtraction: 'تفریق',
      multiplication: 'ضرب',
      division: 'تقسیم',
      mixed: 'ترکیبی',
    };

    const opName = opTitles[op] || 'این عملیات';
    titleFa = `فرصت درخشش در ${opName}! 🌟`;
    messageFa = `در بقیه بخش‌ها عالی پیش رفتی! بیا امروز چندتا معمای جذاب ${opName} هم حل کنیم تا مهارت‌هات متعادل‌تر و قوی‌تر بشن.`;
    buttonFa = `تمرین هوشمند ${opName} ✨`;
  } else if (plan.recommendedSkillId) {
    const tierDef = getTierDefinition(plan.primaryOperation, plan.recommendedTier || 1);
    titleFa = `مسیر طلایی: ${tierDef.stageNameFa} 🎯`;
    messageFa = `هدف بعدی تو: ${tierDef.pedagogicalGoalFa}. بیا یک گام دیگر به تسلط کامل نزدیک بشیم!`;
    buttonFa = `ادامه یادگیری ${toPersianDigits(tierDef.stageNameFa)} 🚀`;
  }

  return (
    <div
      id="adaptive-recommendation-card"
      className="relative overflow-hidden bg-gradient-to-r from-amber-50 via-amber-100/70 to-orange-50 dark:from-amber-950/30 dark:via-amber-900/20 dark:to-orange-950/30 rounded-3xl p-5 sm:p-6 border border-amber-200 dark:border-amber-800/80 shadow-md hover:shadow-lg transition-all flex flex-col sm:flex-row items-center justify-between gap-4 group"
      dir="rtl"
    >
      <div className="flex items-center justify-between gap-4 text-right w-full sm:w-auto flex-1 min-w-0">
        <div className="space-y-1 flex-1 min-w-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-200/60 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 text-[11px] font-black">
            <span>✨</span>
            <span>پیشنهاد معلم هوشمند</span>
          </div>
          <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">
            {titleFa}
          </h4>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium max-w-xl">
            {messageFa}
          </p>
        </div>

        {/* 3D Pop-Out Owl Avatar on the Left (in RTL) */}
        <div className="shrink-0 self-center">
          <PopoutOwlAvatar sizeClassName="w-16 h-16 sm:w-20 sm:h-20" />
        </div>
      </div>

      <button
        id="start-adaptive-recommendation-btn"
        onClick={() => onStartRecommended(targetOp)}
        className="w-full sm:w-auto shrink-0 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md hover:shadow-amber-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
      >
        <span>{buttonFa}</span>
      </button>
    </div>
  );
};

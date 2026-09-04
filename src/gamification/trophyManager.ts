/**
 * Centralized Trophy Manager for Math Hero.
 * Manages the evolving Math Hero Trophy through 6 motivational stages:
 * Stage 1: Novice (چوبی/نوآموز)
 * Stage 2: Bronze (برنزی یادگیرنده)
 * Stage 3: Silver (نقره‌ای حل مسئله)
 * Stage 4: Gold (طلایی مهارت)
 * Stage 5: Ruby (یاقوتی پیشتاز)
 * Stage 6: Diamond (الماسین قهرمان قهرمانان)
 */

import { TrophyInfo } from './gamificationTypes';

export interface TrophyStageConfig {
  stage: number;
  stageNameFa: string;
  title: string;
  description: string;
  icon: string;
  levelRequired: number;
  badgesRequired: number;
  masteredTiersRequired?: number;
}

export const TROPHY_STAGES: TrophyStageConfig[] = [
  {
    stage: 1,
    stageNameFa: 'جام چوبی نوآموز',
    title: 'نخستین جام قهرمانی',
    description: 'آغاز باشکوه مسیر یادگیری ریاضی',
    icon: '🌱',
    levelRequired: 1,
    badgesRequired: 0,
    masteredTiersRequired: 0,
  },
  {
    stage: 2,
    stageNameFa: 'جام برنزی یادگیرنده',
    title: 'جام تلاش و پیوستگی',
    description: 'نشانه پشتکار و اشتیاق به حل معماهای ریاضی',
    icon: '🥉',
    levelRequired: 3,
    badgesRequired: 3,
    masteredTiersRequired: 0,
  },
  {
    stage: 3,
    stageNameFa: 'جام نقره‌ای حل مسئله',
    title: 'جام تیزبینی و هوش',
    description: 'تسلط بر مفاهیم پایه و حل دقیق مسائل',
    icon: '🥈',
    levelRequired: 5,
    badgesRequired: 6,
    masteredTiersRequired: 1,
  },
  {
    stage: 4,
    stageNameFa: 'جام طلایی مهارت',
    title: 'جام افتخار و درخشش',
    description: 'مهارت عالی در عملیات‌های چهارگانه ریاضی',
    icon: '🥇',
    levelRequired: 8,
    badgesRequired: 10,
    masteredTiersRequired: 2,
  },
  {
    stage: 5,
    stageNameFa: 'جام یاقوتی پیشتاز',
    title: 'جام نبوغ و استادی',
    description: 'پیشتازی بی‌نظیر در محاسبات و مرور هوشمند',
    icon: '💎',
    levelRequired: 11,
    badgesRequired: 14,
    masteredTiersRequired: 4,
  },
  {
    stage: 6,
    stageNameFa: 'جام الماسین قهرمان قهرمانان',
    title: 'تاج زرین قهرمان ریاضی',
    description: 'بالاترین افتخار جهان ریاضی؛ استاد بی‌بدیل اعداد',
    icon: '👑',
    levelRequired: 14,
    badgesRequired: 18,
    masteredTiersRequired: 6,
  },
];

export const MAX_TROPHY_STAGE = TROPHY_STAGES.length;

/**
 * Evaluates current trophy stage based on level, badges, and verified mastered skill tiers.
 */
export function calculateTrophyStage(
  currentLevel: number,
  unlockedBadgesCount: number,
  masteredTiersCount = 0
): number {
  let stage = 1;
  for (let i = 0; i < TROPHY_STAGES.length; i++) {
    const config = TROPHY_STAGES[i];
    const tiersReq = config.masteredTiersRequired || 0;
    if (
      currentLevel >= config.levelRequired &&
      unlockedBadgesCount >= config.badgesRequired &&
      masteredTiersCount >= tiersReq
    ) {
      stage = config.stage;
    } else {
      break;
    }
  }
  return stage;
}

/**
 * Returns comprehensive Trophy state and progress toward next stage.
 */
export function getTrophyInfo(
  currentLevel: number,
  unlockedBadgesCount: number,
  masteredTiersCount = 0
): TrophyInfo {
  const stageNumber = calculateTrophyStage(currentLevel, unlockedBadgesCount, masteredTiersCount);
  const currentConfig = TROPHY_STAGES[stageNumber - 1] || TROPHY_STAGES[0];
  const isMax = stageNumber >= MAX_TROPHY_STAGE;

  if (isMax) {
    return {
      stage: stageNumber,
      maxStage: MAX_TROPHY_STAGE,
      title: currentConfig.title,
      stageNameFa: currentConfig.stageNameFa,
      description: currentConfig.description,
      icon: currentConfig.icon,
      badgeRequiredCount: currentConfig.badgesRequired,
      levelRequired: currentConfig.levelRequired,
      nextRequirementText: 'شما به بالاترین قله افتخار جام قهرمانی رسیده‌اید! 👑',
      progressPercent: 100,
      isMax: true,
    };
  }

  const nextConfig = TROPHY_STAGES[stageNumber]; // next stage
  const prevBadges = currentConfig.badgesRequired;
  const targetBadges = nextConfig.badgesRequired;
  const badgesDelta = Math.max(1, targetBadges - prevBadges);
  const badgesProgress = Math.max(0, Math.min(badgesDelta, unlockedBadgesCount - prevBadges));
  const badgeRatio = badgesProgress / badgesDelta;

  const prevLevel = currentConfig.levelRequired;
  const targetLevel = nextConfig.levelRequired;
  const levelDelta = Math.max(1, targetLevel - prevLevel);
  const levelProgress = Math.max(0, Math.min(levelDelta, currentLevel - prevLevel));
  const levelRatio = levelProgress / levelDelta;

  const combinedPercent = Math.min(99, Math.round(((badgeRatio + levelRatio) / 2) * 100));

  const badgesRemaining = Math.max(0, targetBadges - unlockedBadgesCount);
  const levelsRemaining = Math.max(0, targetLevel - currentLevel);
  const nextTiersReq = nextConfig.masteredTiersRequired || 0;
  const tiersRemaining = Math.max(0, nextTiersReq - masteredTiersCount);

  let nextRequirementText = '';
  if (tiersRemaining > 0) {
    nextRequirementText = `برای ارتقا به ${nextConfig.stageNameFa}: تسلط بر ${tiersRemaining} مرحله جدید از مهارت‌ها نیاز است.`;
  } else if (badgesRemaining > 0 && levelsRemaining > 0) {
    nextRequirementText = `برای ارتقا به ${nextConfig.stageNameFa}: ${levelsRemaining} سطح بالاتر و ${badgesRemaining} نشان جدید نیاز داری.`;
  } else if (badgesRemaining > 0) {
    nextRequirementText = `برای ارتقا به ${nextConfig.stageNameFa}: ${badgesRemaining} نشان افتخار دیگر کسب کن.`;
  } else if (levelsRemaining > 0) {
    nextRequirementText = `برای ارتقا به ${nextConfig.stageNameFa}: ${levelsRemaining} سطح بالاتر برو.`;
  } else {
    nextRequirementText = `آماده دریافت ${nextConfig.stageNameFa}!`;
  }

  return {
    stage: stageNumber,
    maxStage: MAX_TROPHY_STAGE,
    title: currentConfig.title,
    stageNameFa: currentConfig.stageNameFa,
    description: currentConfig.description,
    icon: currentConfig.icon,
    badgeRequiredCount: currentConfig.badgesRequired,
    levelRequired: currentConfig.levelRequired,
    nextRequirementText,
    progressPercent: combinedPercent,
    isMax: false,
  };
}

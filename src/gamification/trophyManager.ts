/**
 * Centralized Trophy Manager for Math Hero.
 * Manages the evolving Math Hero Trophy through 6 motivational stages:
 * Stage 1: Novice (چوبی/نوآموز)
 * Stage 2: Bronze (برنزی یادگیرنده)
 * Stage 3: Silver (نقره‌ای حل مسئله)
 * Stage 4: Gold (طلایی مهارت)
 * Stage 5: Ruby (یاقوتی پیشتاز)
 * Stage 6: Diamond (الماسین قهرمان قهرمانان)
 * 
 * CORE PRINCIPLE:
 * Trophy stage reflects balanced educational progression:
 * - Level (XP + Educational Gating)
 * - Badges (Consistency & Effort)
 * - Mastered Skill Tiers (Verified Pedagogical Proof)
 * - Operation Breadth (Multi-Operation Competence)
 */

import { TrophyInfo } from './gamificationTypes';

export interface TrophyStageConfig {
  stage: number;
  stageNameFa: string;
  title: string;
  description: string;
  icon: string;
  cupImage: string;
  levelRequired: number;
  badgesRequired: number;
  masteredTiersRequired: number;
  distinctOpsRequired: number;
}

export const TROPHY_STAGES: TrophyStageConfig[] = [
  {
    stage: 1,
    stageNameFa: 'جام چوبی نوآموز',
    title: 'نخستین جام قهرمانی',
    description: 'آغاز باشکوه مسیر یادگیری و حل معماهای ریاضی',
    icon: '🌱',
    cupImage: 'assets/cups/wooden 1.webp',
    levelRequired: 1,
    badgesRequired: 0,
    masteredTiersRequired: 0,
    distinctOpsRequired: 0,
  },
  {
    stage: 2,
    stageNameFa: 'جام برنزی یادگیرنده',
    title: 'جام تلاش و پیوستگی',
    description: 'نشانه استمرار در تمرین و تسلط بر نخستین مهارت ریاضی',
    icon: '🥉',
    cupImage: 'assets/cups/bronze 1.webp',
    levelRequired: 3,
    badgesRequired: 3,
    masteredTiersRequired: 1,
    distinctOpsRequired: 1,
  },
  {
    stage: 3,
    stageNameFa: 'جام نقره‌ای حل مسئله',
    title: 'جام تیزبینی و هوش',
    description: 'تسلط بر مفاهیم پایه و حل دقیق مسائل در ۲ مرحله مهارت',
    icon: '🥈',
    cupImage: 'assets/cups/sliver 1.webp',
    levelRequired: 6,
    badgesRequired: 6,
    masteredTiersRequired: 2,
    distinctOpsRequired: 1,
  },
  {
    stage: 4,
    stageNameFa: 'جام طلایی مهارت',
    title: 'جام افتخار و درخشش',
    description: 'تسلط چندجانبه بر ۴ مرحله مهارت در حداقل ۲ عملیات ریاضی',
    icon: '🥇',
    cupImage: 'assets/cups/gold 1.webp',
    levelRequired: 9,
    badgesRequired: 10,
    masteredTiersRequired: 4,
    distinctOpsRequired: 2,
  },
  {
    stage: 5,
    stageNameFa: 'جام یاقوتی پیشتاز',
    title: 'جام نبوغ و استادی',
    description: 'پیشتازی بی‌نظیر با ۶ مرحله مسلط‌شده و مرورهای هوشمند هدفمند',
    icon: '💎',
    cupImage: 'assets/cups/ruby 1.webp',
    levelRequired: 12,
    badgesRequired: 14,
    masteredTiersRequired: 6,
    distinctOpsRequired: 2,
  },
  {
    stage: 6,
    stageNameFa: 'جام الماسین قهرمان قهرمانان',
    title: 'تاج زرین قهرمان ریاضی',
    description: 'بالاترین افتخار جهان ریاضی؛ تسلط عمیق بر ۸ مرحله در ۳ عملیات مختلف',
    icon: '👑',
    cupImage: 'assets/cups/Dimond 1.webp',
    levelRequired: 15,
    badgesRequired: 15,
    masteredTiersRequired: 8,
    distinctOpsRequired: 3,
  },
];

export const MAX_TROPHY_STAGE = TROPHY_STAGES.length;

/**
 * Evaluates current trophy stage based on level, badges, mastered skill tiers, and operation breadth.
 */
export function calculateTrophyStage(
  currentLevel: number,
  unlockedBadgesCount: number,
  masteredTiersCount = 0,
  distinctOpsCount = 0,
  mathHeroEligible = false
): number {
  let stage = 1;
  for (let i = 0; i < TROPHY_STAGES.length; i++) {
    const config = TROPHY_STAGES[i];
    const tiersReq = config.masteredTiersRequired;
    const opsReq = config.distinctOpsRequired;

    // Strict check for Stage 6 (Ultimate Grand Math Hero)
    if (config.stage === 6) {
      if (
        currentLevel >= config.levelRequired &&
        unlockedBadgesCount >= config.badgesRequired &&
        masteredTiersCount >= tiersReq &&
        distinctOpsCount >= opsReq &&
        mathHeroEligible
      ) {
        stage = 6;
      }
      break;
    }

    if (
      currentLevel >= config.levelRequired &&
      unlockedBadgesCount >= config.badgesRequired &&
      masteredTiersCount >= tiersReq &&
      distinctOpsCount >= opsReq
    ) {
      stage = config.stage;
    } else {
      break;
    }
  }
  return stage;
}

/**
 * Returns comprehensive Trophy state, progress breakdown, and child-friendly requirement hints.
 */
export function getTrophyInfo(
  currentLevel: number,
  unlockedBadgesCount: number,
  masteredTiersCount = 0,
  distinctOpsCount = 0,
  mathHeroEligible = false
): TrophyInfo {
  const stageNumber = calculateTrophyStage(
    currentLevel,
    unlockedBadgesCount,
    masteredTiersCount,
    distinctOpsCount,
    mathHeroEligible
  );
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
      cupImage: currentConfig.cupImage,
      badgeRequiredCount: currentConfig.badgesRequired,
      levelRequired: currentConfig.levelRequired,
      masteredTiersRequired: currentConfig.masteredTiersRequired,
      distinctOpsRequired: currentConfig.distinctOpsRequired,
      nextRequirementText: 'شما به بالاترین قله افتخار جام قهرمانی رسیده‌اید! 👑',
      progressPercent: 100,
      isMax: true,
      isLockedAndMysterious: false,
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

  const prevTiers = currentConfig.masteredTiersRequired;
  const targetTiers = nextConfig.masteredTiersRequired;
  const tiersDelta = Math.max(1, targetTiers - prevTiers);
  const tiersProgress = Math.max(0, Math.min(tiersDelta, masteredTiersCount - prevTiers));
  const tiersRatio = tiersProgress / tiersDelta;

  // Weighted progress: 40% Tiers, 30% Level, 30% Badges
  const combinedPercent = Math.min(
    99,
    Math.round((tiersRatio * 0.4 + levelRatio * 0.3 + badgeRatio * 0.3) * 100)
  );

  const badgesRemaining = Math.max(0, targetBadges - unlockedBadgesCount);
  const levelsRemaining = Math.max(0, targetLevel - currentLevel);
  const tiersRemaining = Math.max(0, targetTiers - masteredTiersCount);
  const opsRemaining = Math.max(0, nextConfig.distinctOpsRequired - distinctOpsCount);

  let nextRequirementText = '';
  if (nextConfig.stage === 6) {
    nextRequirementText = 'برای رسیدن به قهرمان ریاضی، مهارت‌های بیشتری را در عملیات‌های مختلف کامل کن.';
  } else if (opsRemaining > 0) {
    nextRequirementText = `برای ارتقا به ${nextConfig.stageNameFa}: مهارت‌هایت را در ${opsRemaining} عملیات دیگر هم کامل کن.`;
  } else if (tiersRemaining > 0) {
    nextRequirementText = `برای ارتقا به ${nextConfig.stageNameFa}: تسلط بر ${tiersRemaining} مرحله جدید از مهارت‌ها نیاز است.`;
  } else if (levelsRemaining > 0) {
    nextRequirementText = `برای ارتقا به ${nextConfig.stageNameFa}: رسیدن به سطح ${targetLevel} و کسب ${badgesRemaining} نشان افتخار دیگر نیاز است.`;
  } else if (badgesRemaining > 0) {
    nextRequirementText = `برای ارتقا به ${nextConfig.stageNameFa}: ${badgesRemaining} نشان افتخار دیگر کسب کن.`;
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
    cupImage: currentConfig.cupImage,
    badgeRequiredCount: currentConfig.badgesRequired,
    levelRequired: currentConfig.levelRequired,
    masteredTiersRequired: currentConfig.masteredTiersRequired,
    distinctOpsRequired: currentConfig.distinctOpsRequired,
    nextRequirementText,
    progressPercent: combinedPercent,
    isMax: false,
    isLockedAndMysterious: stageNumber < 6,
  };
}

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

import { TrophyInfo, TrophyRequirementDetail } from './gamificationTypes';
import { formatNumber } from '../utils/persian';

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

    // Flexible criteria for Stages 2-5:
    // User qualifies if Level & Badges are met OR if Mastered Tiers & Operations & Level floor are met.
    const levelAndBadgesMet = currentLevel >= config.levelRequired && unlockedBadgesCount >= config.badgesRequired;
    const skillTiersMet = masteredTiersCount >= tiersReq && distinctOpsCount >= opsReq && currentLevel >= Math.max(1, config.levelRequired - 2);

    if (levelAndBadgesMet || skillTiersMet) {
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
  mathHeroEligible = false,
  savedTrophyStage?: number
): TrophyInfo {
  const calculatedStage = calculateTrophyStage(
    currentLevel,
    unlockedBadgesCount,
    masteredTiersCount,
    distinctOpsCount,
    mathHeroEligible
  );
  // Guarantee that savedTrophyStage is never downgraded
  const stageNumber = Math.max(savedTrophyStage || 1, calculatedStage);
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

  // Detailed requirement items evaluation
  const detailedRequirements: TrophyRequirementDetail[] = [];

  // 1. Level Requirement
  const isLevelMet = currentLevel >= targetLevel;
  detailedRequirements.push({
    id: 'level',
    titleFa: `رسیدن به سطح ${formatNumber(targetLevel, 'persian')}`,
    currentValue: currentLevel,
    targetValue: targetLevel,
    unitFa: 'سطح',
    isMet: isLevelMet,
    guidanceFa: isLevelMet
      ? `سطح ${formatNumber(currentLevel, 'persian')} شما برای این جام کافی است (شرط سطح برقرار است ✔)`
      : `با شرکت در تمرین‌ها و آزمون‌ها ${formatNumber(levelsRemaining, 'persian')} سطح بالاتر بروید تا به سطح ${formatNumber(targetLevel, 'persian')} برسید.`,
  });

  // 2. Badges Requirement
  const isBadgesMet = unlockedBadgesCount >= targetBadges;
  detailedRequirements.push({
    id: 'badges',
    titleFa: `کسب ${formatNumber(targetBadges, 'persian')} نشان افتخار`,
    currentValue: unlockedBadgesCount,
    targetValue: targetBadges,
    unitFa: 'نشان',
    isMet: isBadgesMet,
    guidanceFa: isBadgesMet
      ? `تعداد ${formatNumber(unlockedBadgesCount, 'persian')} نشان افتخار شما کافی است (شرط نشان برقرار است ✔)`
      : `با حل تمرین‌های عالی، تداوم روزانه و مرور اشتباهات ${formatNumber(badgesRemaining, 'persian')} نشان افتخار جدید آزاد کنید.`,
  });

  // 3. Mastered Skill Tiers Requirement
  if (targetTiers > 0) {
    const isTiersMet = masteredTiersCount >= targetTiers;
    detailedRequirements.push({
      id: 'tiers',
      titleFa: `تسلط بر ${formatNumber(targetTiers, 'persian')} مرحله مهارت`,
      currentValue: masteredTiersCount,
      targetValue: targetTiers,
      unitFa: 'مرحله',
      isMet: isTiersMet,
      guidanceFa: isTiersMet
        ? `بر ${formatNumber(masteredTiersCount, 'persian')} مرحله مهارت مسلط شده‌اید (شرط تسلط برقرار است ✔)`
        : `با انجام تمرین‌های هوشمند و کسب نمره عالی، بر ${formatNumber(tiersRemaining, 'persian')} مرحله مهارت جدید مسلط شوید.`,
    });
  }

  // 4. Distinct Operations Requirement
  if (nextConfig.distinctOpsRequired > 0) {
    const targetOps = nextConfig.distinctOpsRequired;
    const isOpsMet = distinctOpsCount >= targetOps;
    detailedRequirements.push({
      id: 'operations',
      titleFa: `تنوع در ${formatNumber(targetOps, 'persian')} عملیات ریاضی (جمع، تفریق، ضرب، تقسیم)`,
      currentValue: distinctOpsCount,
      targetValue: targetOps,
      unitFa: 'عملیات',
      isMet: isOpsMet,
      guidanceFa: isOpsMet
        ? `در ${formatNumber(distinctOpsCount, 'persian')} عملیات مختلف تمرین داشته‌اید (شرط تنوع برقرار است ✔)`
        : `تنها یک عملیات کافی نیست؛ حداقل در ${formatNumber(opsRemaining, 'persian')} عملیات ریاضی جدید نیز مسلط شوید.`,
    });
  }

  // Construct complete summary statement listing ALL unmet requirements
  const unmetSummary: string[] = [];
  if (!isLevelMet) {
    unmetSummary.push(`${formatNumber(levelsRemaining, 'persian')} سطح بالاتر`);
  }
  if (!isBadgesMet) {
    unmetSummary.push(`${formatNumber(badgesRemaining, 'persian')} نشان افتخار دیگر`);
  }
  if (targetTiers > 0 && masteredTiersCount < targetTiers) {
    unmetSummary.push(`تسلط بر ${formatNumber(tiersRemaining, 'persian')} مرحله مهارت جدید`);
  }
  if (nextConfig.distinctOpsRequired > 0 && distinctOpsCount < nextConfig.distinctOpsRequired) {
    unmetSummary.push(`تمرین در ${formatNumber(opsRemaining, 'persian')} عملیات دیگر`);
  }

  let nextRequirementText = '';
  if (unmetSummary.length === 0) {
    nextRequirementText = `تمام شرایط دریافت ${nextConfig.stageNameFa} آماده است! با انجام یک تمرین دیگر آن را دریافت کن. 🎉`;
  } else {
    nextRequirementText = `برای دریافت ${nextConfig.stageNameFa}: نیاز به ${unmetSummary.join(' و ')} داری.`;
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
    nextStageNameFa: nextConfig.stageNameFa,
    nextRequirementText,
    detailedRequirements,
    progressPercent: combinedPercent,
    isMax: false,
    isLockedAndMysterious: stageNumber < 6,
  };
}

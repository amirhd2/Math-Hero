/**
 * Centralized Level Calculator for Math Hero.
 * Implements a balanced, non-punitive, child-friendly progression system
 * where XP motivates the child, while Skill Mastery determines real educational progression.
 * 
 * Levels 1–5:
 * Mostly XP-driven to welcome and encourage the child.
 * Levels 6–10:
 * XP + meaningful skill progression (at least 1–3 mastered skill tiers across operations).
 * Levels 11–14:
 * XP + substantial mastery across multiple skill tiers.
 * Level 15 / Math Hero:
 * Strict educational milestone satisfaction (multi-operation mastery, approved tier evidence, etc.).
 * Levels 16–20:
 * Reserved for sustained, high-level mastery and broader mathematical depth.
 */

import { LevelInfo } from './gamificationTypes';
import { getStageIconPath } from '../utils/assetPaths';

export interface LevelEducationalRequirement {
  minMasteredTiers: number;
  minDistinctOperations?: number;
  minBadges?: number;
  descriptionFa: string;
  hintFa: string;
}

export interface LevelDefinition {
  level: number;
  xpThreshold: number;
  title: string;
  icon: string;
  image: string;
  educationalRequirement?: LevelEducationalRequirement;
}

export const LEVEL_DEFINITIONS: LevelDefinition[] = [
  { level: 1, xpThreshold: 0, title: 'نوآموز ریاضی', icon: '🌱', image: getStageIconPath(1) },
  { level: 2, xpThreshold: 120, title: 'نوآموز کوشا', icon: '🌱', image: getStageIconPath(2) },
  { level: 3, xpThreshold: 280, title: 'یادگیرنده باهوش', icon: '⭐', image: getStageIconPath(3) },
  { level: 4, xpThreshold: 500, title: 'حل‌کننده مسائل', icon: '🏅', image: getStageIconPath(4) },
  { level: 5, xpThreshold: 800, title: 'مهارت‌آموز پرتوان', icon: '🥇', image: getStageIconPath(5) },
  {
    level: 6,
    xpThreshold: 1200,
    title: 'ستاره درخشان ریاضی',
    icon: '🌟',
    image: getStageIconPath(6),
    educationalRequirement: {
      minMasteredTiers: 1,
      descriptionFa: 'تسلط بر حداقل ۱ مرحله مهارت',
      hintFa: 'برای صعود به سطح ۶، تسلط بر ۱ مرحله مهارت (مثلاً جمع یک‌رقمی) را کامل کن! 🌟',
    },
  },
  {
    level: 7,
    xpThreshold: 1650,
    title: 'ماجراجوی محاسبات',
    icon: '🚀',
    image: getStageIconPath(7),
    educationalRequirement: {
      minMasteredTiers: 1,
      descriptionFa: 'تسلط بر حداقل ۱ مرحله مهارت',
      hintFa: 'برای صعود به سطح ۷، مهارت قبلی را تثبیت کن یا مهارت جدیدی را شروع کن! 🚀',
    },
  },
  {
    level: 8,
    xpThreshold: 2150,
    title: 'ذهن طلایی',
    icon: '💡',
    image: getStageIconPath(8),
    educationalRequirement: {
      minMasteredTiers: 2,
      descriptionFa: 'تسلط بر حداقل ۲ مرحله مهارت',
      hintFa: 'برای صعود به سطح ۸، تسلط بر ۲ مرحله مهارت را کامل کن! 💡',
    },
  },
  {
    level: 9,
    xpThreshold: 2750,
    title: 'استاد چالش‌ها',
    icon: '⚡',
    image: getStageIconPath(9),
    educationalRequirement: {
      minMasteredTiers: 2,
      descriptionFa: 'تسلط بر حداقل ۲ مرحله مهارت',
      hintFa: 'برای صعود به سطح ۹، مهارت‌هایت را تقویت کن! ⚡',
    },
  },
  {
    level: 10,
    xpThreshold: 3450,
    title: 'پیشتاز ریاضی',
    icon: '🎖️',
    image: getStageIconPath(10),
    educationalRequirement: {
      minMasteredTiers: 3,
      minDistinctOperations: 2,
      descriptionFa: 'تسلط بر ۳ مرحله مهارت در حداقل ۲ عملیات',
      hintFa: 'برای صعود به سطح ۱۰، در ۲ عملیات مختلف، ۳ مرحله مهارت را کامل کن! 🎖️',
    },
  },
  {
    level: 11,
    xpThreshold: 4250,
    title: 'قهرمان تیزبین',
    icon: '🛡️',
    image: getStageIconPath(11),
    educationalRequirement: {
      minMasteredTiers: 4,
      minDistinctOperations: 2,
      descriptionFa: 'تسلط بر ۴ مرحله مهارت در ۲ عملیات',
      hintFa: 'برای صعود به سطح ۱۱، تسلط بر ۴ مرحله مهارت را کامل کن! 🛡️',
    },
  },
  {
    level: 12,
    xpThreshold: 5150,
    title: 'استاد عملیات‌ها',
    icon: '🔮',
    image: getStageIconPath(12),
    educationalRequirement: {
      minMasteredTiers: 5,
      minDistinctOperations: 2,
      descriptionFa: 'تسلط بر ۵ مرحله مهارت در ۲ عملیات',
      hintFa: 'برای صعود به سطح ۱۲، ۵ مرحله مهارت را به تسلط برسان! 🔮',
    },
  },
  {
    level: 13,
    xpThreshold: 6150,
    title: 'فاتح معماها',
    icon: '⚔️',
    image: getStageIconPath(13),
    educationalRequirement: {
      minMasteredTiers: 6,
      minDistinctOperations: 2,
      descriptionFa: 'تسلط بر ۶ مرحله مهارت در ۲ عملیات',
      hintFa: 'برای صعود به سطح ۱۳، ۶ مرحله مهارت را مسلط شو! ⚔️',
    },
  },
  {
    level: 14,
    xpThreshold: 7250,
    title: 'قهرمان پیشتاز',
    icon: '🏆',
    image: getStageIconPath(14),
    educationalRequirement: {
      minMasteredTiers: 7,
      minDistinctOperations: 3,
      descriptionFa: 'تسلط بر ۷ مرحله مهارت در حداقل ۳ عملیات',
      hintFa: 'برای صعود به سطح ۱۴، در ۳ عملیات مختلف ۷ مرحله را کامل کن! 🏆',
    },
  },
  {
    level: 15,
    xpThreshold: 8500,
    title: 'قهرمان قهرمانان ریاضی',
    icon: '👑',
    image: getStageIconPath(15),
    educationalRequirement: {
      minMasteredTiers: 8,
      minDistinctOperations: 3,
      minBadges: 15,
      descriptionFa: 'شاهکار آموزشی: تسلط بر ۸ مرحله مهارت در ۳ عملیات و ۱۵ نشان افتخار',
      hintFa: 'برای کسب تاج قهرمان قهرمانان ریاضی، ۸ مرحله مهارت در ۳ عملیات را فتح کن! 👑',
    },
  },
  {
    level: 16,
    xpThreshold: 10000,
    title: 'استاد اعظم اعداد',
    icon: '🌌',
    image: getStageIconPath(16),
    educationalRequirement: {
      minMasteredTiers: 9,
      minDistinctOperations: 3,
      descriptionFa: 'تسلط بر ۹ مرحله مهارت',
      hintFa: 'برای صعود به سطح ۱۶، ۹ مرحله مهارت را فتح کن! 🌌',
    },
  },
  {
    level: 17,
    xpThreshold: 11800,
    title: 'افسانه محاسبات',
    icon: '💎',
    image: getStageIconPath(17),
    educationalRequirement: {
      minMasteredTiers: 10,
      minDistinctOperations: 4,
      descriptionFa: 'تسلط بر ۱۰ مرحله مهارت در هر ۴ عملیات',
      hintFa: 'برای صعود به سطح ۱۷، در تمام ۴ عملیات مهارت‌هایت را گسترش بده! 💎',
    },
  },
  {
    level: 18,
    xpThreshold: 13800,
    title: 'نابغه بی‌مرز',
    icon: '🌠',
    image: getStageIconPath(18),
    educationalRequirement: {
      minMasteredTiers: 11,
      minDistinctOperations: 4,
      descriptionFa: 'تسلط بر ۱۱ مرحله مهارت',
      hintFa: 'برای صعود به سطح ۱۸، ۱۱ مرحله را فتح کن! 🌠',
    },
  },
  {
    level: 19,
    xpThreshold: 16000,
    title: 'خورشید دانایی',
    icon: '☀️',
    image: getStageIconPath(19),
    educationalRequirement: {
      minMasteredTiers: 12,
      minDistinctOperations: 4,
      descriptionFa: 'تسلط بر ۱۲ مرحله مهارت',
      hintFa: 'برای صعود به سطح ۱۹، ۱۲ مرحله را مسلط شو! ☀️',
    },
  },
  {
    level: 20,
    xpThreshold: 18500,
    title: 'قهرمان جاویدان ریاضی',
    icon: '🌟',
    image: getStageIconPath(20),
    educationalRequirement: {
      minMasteredTiers: 14,
      minDistinctOperations: 4,
      descriptionFa: 'تسلط بر ۱۴ مرحله مهارت در تمامی عملیات‌های ریاضی',
      hintFa: 'بالاترین قله جاودانگی ریاضی؛ فتح ۱۴ مرحله مهارت! 🌟',
    },
  },
];

export const LEVEL_THRESHOLDS = LEVEL_DEFINITIONS.map((def) => def.xpThreshold);
export const MAX_LEVEL = LEVEL_DEFINITIONS.length;

export const LEVEL_METADATA: Record<number, { title: string; icon: string; image: string }> = LEVEL_DEFINITIONS.reduce(
  (acc, def) => {
    acc[def.level] = { title: def.title, icon: def.icon, image: def.image };
    return acc;
  },
  {} as Record<number, { title: string; icon: string; image: string }>
);

/**
 * Returns the raw level by XP threshold alone.
 */
export function getRawLevelByXp(xp: number): number {
  if (xp <= 0) return 1;
  let level = 1;
  for (let i = 0; i < LEVEL_DEFINITIONS.length; i++) {
    if (xp >= LEVEL_DEFINITIONS[i].xpThreshold) {
      level = LEVEL_DEFINITIONS[i].level;
    } else {
      break;
    }
  }
  return Math.min(level, MAX_LEVEL);
}

/**
 * Returns evaluated level number (1..MAX_LEVEL) corresponding to total XP and educational mastery.
 * If mastery stats are omitted, falls back to raw level for backward compatibility.
 */
export function getLevelFromXp(
  xp: number,
  masteredTiersCount?: number,
  distinctOpsCount?: number,
  badgesCount?: number
): number {
  const rawLevel = getRawLevelByXp(xp);

  // Reserve educational capstone requirement for Level 15 / Grand Math Hero
  if (rawLevel >= 15 && masteredTiersCount !== undefined) {
    const def15 = LEVEL_DEFINITIONS[14];
    const req15 = def15?.educationalRequirement;
    if (req15) {
      const tiersMet = masteredTiersCount >= req15.minMasteredTiers;
      const opsMet = req15.minDistinctOperations ? (distinctOpsCount || 0) >= req15.minDistinctOperations : true;
      const badgesMet = req15.minBadges ? (badgesCount || 0) >= req15.minBadges : true;

      if (!tiersMet || !opsMet || !badgesMet) {
        return 14;
      }
    }
  }

  return rawLevel;
}

/**
 * Returns total XP required to reach a specific level.
 */
export function getXpRequiredForLevel(level: number): number {
  const index = Math.max(0, Math.min(level - 1, LEVEL_DEFINITIONS.length - 1));
  return LEVEL_DEFINITIONS[index].xpThreshold;
}

/**
 * Returns comprehensive level progression data for any total XP and educational progress.
 */
export function getLevelProgress(
  totalXp: number,
  masteredTiersCount?: number,
  distinctOpsCount?: number,
  badgesCount?: number
): LevelInfo {
  const safeXp = Math.max(0, totalXp);
  const rawLevel = getRawLevelByXp(safeXp);
  const currentLevel = getLevelFromXp(safeXp, masteredTiersCount, distinctOpsCount, badgesCount);
  const isMaxLevel = currentLevel >= MAX_LEVEL;

  const currentLevelDef = LEVEL_DEFINITIONS[currentLevel - 1] || LEVEL_DEFINITIONS[0];
  const currentLevelXpFloor = currentLevelDef.xpThreshold;

  const nextLevelDef = isMaxLevel ? currentLevelDef : LEVEL_DEFINITIONS[currentLevel] || currentLevelDef;
  const nextLevelXpThreshold = isMaxLevel ? currentLevelXpFloor : nextLevelDef.xpThreshold;

  const xpRequiredForNextLevel = isMaxLevel
    ? 0
    : Math.max(1, nextLevelXpThreshold - currentLevelXpFloor);

  const xpInCurrentLevel = isMaxLevel
    ? xpRequiredForNextLevel
    : Math.max(0, safeXp - currentLevelXpFloor);

  // If educational requirements hold the child back, calculate progress toward next level
  const isEducationallyGated = masteredTiersCount !== undefined && rawLevel > currentLevel;

  let progressPercent = 0;
  if (isMaxLevel) {
    progressPercent = 100;
  } else if (isEducationallyGated) {
    // Show 100% XP progress in current level, waiting on educational milestone
    progressPercent = 100;
  } else {
    progressPercent = Math.min(100, Math.round((xpInCurrentLevel / xpRequiredForNextLevel) * 100));
  }

  let nextLevelEducationalRequirementText: string | undefined = undefined;
  let educationalRequirementMet = true;
  let requiredTiersForNextLevel: number | undefined = undefined;

  if (!isMaxLevel && nextLevelDef.educationalRequirement) {
    requiredTiersForNextLevel = nextLevelDef.educationalRequirement.minMasteredTiers;
    if (masteredTiersCount !== undefined) {
      educationalRequirementMet = masteredTiersCount >= nextLevelDef.educationalRequirement.minMasteredTiers;
      if (!educationalRequirementMet || isEducationallyGated) {
        nextLevelEducationalRequirementText = nextLevelDef.educationalRequirement.hintFa;
      }
    }
  }

  return {
    level: currentLevel,
    title: currentLevelDef.title,
    icon: currentLevelDef.icon,
    stageImage: currentLevelDef.image,
    totalXp: safeXp,
    currentLevelXpFloor,
    nextLevelXpThreshold,
    xpInCurrentLevel,
    xpRequiredForNextLevel,
    progressPercent,
    isMaxLevel,
    isEducationallyGated,
    pendingLevelByXp: rawLevel,
    nextLevelEducationalRequirementText,
    educationalRequirementMet,
    masteredTiersCount,
    requiredTiersForNextLevel,
  };
}

/**
 * Calculates level up transitions taking educational evidence into account.
 */
export function calculateLevelUp(
  xpBefore: number,
  xpAfter: number,
  masteredTiersCount?: number,
  distinctOpsCount?: number,
  badgesCount?: number
): {
  leveledUp: boolean;
  levelBefore: number;
  levelAfter: number;
  levelsGained: number;
  isGated: boolean;
} {
  const levelBefore = getLevelFromXp(xpBefore, masteredTiersCount, distinctOpsCount, badgesCount);
  const levelAfter = getLevelFromXp(xpAfter, masteredTiersCount, distinctOpsCount, badgesCount);
  const levelsGained = Math.max(0, levelAfter - levelBefore);
  const rawAfter = getRawLevelByXp(xpAfter);

  return {
    leveledUp: levelsGained > 0,
    levelBefore,
    levelAfter,
    levelsGained,
    isGated: rawAfter > levelAfter,
  };
}

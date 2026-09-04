/**
 * Centralized Level Calculator for Math Hero.
 * Implements an achievable, non-punitive, child-friendly progression system
 * from Novice (نوآموز) to Math Hero (قهرمان قهرمانان ریاضی).
 */

import { LevelInfo } from './gamificationTypes';

/**
 * Level progression thresholds.
 * Linear-incremental step ensures that progression feels steady and rewarding,
 * avoiding impossible exponential cliffs for kids.
 * 
 * Level 1: 0 XP
 * Level 2: 100 XP (+100)
 * Level 3: 250 XP (+150)
 * Level 4: 450 XP (+200)
 * Level 5: 700 XP (+250)
 * Level 6: 1000 XP (+300)
 * Level 7: 1350 XP (+350)
 * Level 8: 1750 XP (+400)
 * Level 9: 2200 XP (+450)
 * Level 10: 2700 XP (+500)
 * Level 11: 3250 XP (+550)
 * Level 12: 3850 XP (+600)
 * Level 13: 4500 XP (+650)
 * Level 14: 5200 XP (+700)
 * Level 15: 6000 XP (+800) -> 👑 Grand Math Hero Milestone!
 * Level 16: 6900 XP (+900)
 * Level 17: 7900 XP (+1000)
 * Level 18: 9000 XP (+1100)
 * Level 19: 10200 XP (+1200)
 * Level 20: 11500 XP (+1300)
 */

export const LEVEL_THRESHOLDS: number[] = [
  0,     // Level 1
  100,   // Level 2
  250,   // Level 3
  450,   // Level 4
  700,   // Level 5
  1000,  // Level 6
  1350,  // Level 7
  1750,  // Level 8
  2200,  // Level 9
  2700,  // Level 10
  3250,  // Level 11
  3850,  // Level 12
  4500,  // Level 13
  5200,  // Level 14
  6000,  // Level 15 (Math Hero)
  6900,  // Level 16
  7900,  // Level 17
  9000,  // Level 18
  10200, // Level 19
  11500, // Level 20
];

export const MAX_LEVEL = LEVEL_THRESHOLDS.length;

export const LEVEL_METADATA: Record<number, { title: string; icon: string }> = {
  1: { title: 'نوآموز ریاضی', icon: '🌱' },
  2: { title: 'نوآموز کوشا', icon: '🌱' },
  3: { title: 'یادگیرنده باهوش', icon: '⭐' },
  4: { title: 'حل‌کننده مسائل', icon: '🏅' },
  5: { title: 'مهارت‌آموز پرتوان', icon: '🥇' },
  6: { title: 'ستاره درخشان ریاضی', icon: '🌟' },
  7: { title: 'ماجراجوی محاسبات', icon: '🚀' },
  8: { title: 'ذهن طلایی', icon: '💡' },
  9: { title: 'استاد چالش‌ها', icon: '⚡' },
  10: { title: 'پیشتاز ریاضی', icon: '🎖️' },
  11: { title: 'قهرمان تیزبین', icon: '🛡️' },
  12: { title: 'استاد عملیات‌ها', icon: '🔮' },
  13: { title: 'فاتح معماها', icon: '⚔️' },
  14: { title: 'قهرمان پیشتاز', icon: '🏆' },
  15: { title: 'قهرمان قهرمانان ریاضی', icon: '👑' },
  16: { title: 'استاد اعظم اعداد', icon: '🌌' },
  17: { title: 'افسانه محاسبات', icon: '💎' },
  18: { title: 'نابغه بی‌مرز', icon: '🌠' },
  19: { title: 'خورشید دانایی', icon: '☀️' },
  20: { title: 'قهرمان جاویدان ریاضی', icon: '🌟' },
};

/**
 * Returns level number (1..MAX_LEVEL) corresponding to a total XP amount.
 */
export function getLevelFromXp(xp: number): number {
  if (xp <= 0) return 1;
  let level = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
    } else {
      break;
    }
  }
  return Math.min(level, MAX_LEVEL);
}

/**
 * Returns total XP required to reach a specific level.
 */
export function getXpRequiredForLevel(level: number): number {
  const index = Math.max(0, Math.min(level - 1, LEVEL_THRESHOLDS.length - 1));
  return LEVEL_THRESHOLDS[index];
}

/**
 * Returns comprehensive level progression data for any total XP.
 */
export function getLevelProgress(totalXp: number): LevelInfo {
  const safeXp = Math.max(0, totalXp);
  const currentLevel = getLevelFromXp(safeXp);
  const isMaxLevel = currentLevel >= MAX_LEVEL;

  const currentLevelXpFloor = LEVEL_THRESHOLDS[currentLevel - 1] ?? 0;
  const nextLevelXpThreshold = isMaxLevel
    ? currentLevelXpFloor
    : (LEVEL_THRESHOLDS[currentLevel] ?? currentLevelXpFloor + 1000);

  const xpRequiredForNextLevel = isMaxLevel
    ? 0
    : Math.max(1, nextLevelXpThreshold - currentLevelXpFloor);

  const xpInCurrentLevel = isMaxLevel
    ? xpRequiredForNextLevel
    : Math.max(0, safeXp - currentLevelXpFloor);

  const progressPercent = isMaxLevel
    ? 100
    : Math.min(100, Math.round((xpInCurrentLevel / xpRequiredForNextLevel) * 100));

  const meta = LEVEL_METADATA[currentLevel] || {
    title: currentLevel >= 15 ? 'قهرمان قهرمانان ریاضی' : 'قهرمان ریاضی',
    icon: '👑',
  };

  return {
    level: currentLevel,
    title: meta.title,
    icon: meta.icon,
    totalXp: safeXp,
    currentLevelXpFloor,
    nextLevelXpThreshold,
    xpInCurrentLevel,
    xpRequiredForNextLevel,
    progressPercent,
    isMaxLevel,
  };
}

/**
 * Calculates level up transitions, cleanly handling single or multi-level advancements.
 */
export function calculateLevelUp(
  xpBefore: number,
  xpAfter: number
): {
  leveledUp: boolean;
  levelBefore: number;
  levelAfter: number;
  levelsGained: number;
} {
  const levelBefore = getLevelFromXp(xpBefore);
  const levelAfter = getLevelFromXp(xpAfter);
  const levelsGained = Math.max(0, levelAfter - levelBefore);

  return {
    leveledUp: levelsGained > 0,
    levelBefore,
    levelAfter,
    levelsGained,
  };
}

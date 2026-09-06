/**
 * Centralized XP Calculator for Math Hero.
 * Configurable, transparent, positive-reinforcement scoring system.
 * Rewards consistency, accuracy, improvement, and persistent effort without punishing mistakes.
 */

import { QuizResult } from '../types';
import { XpBreakdown } from './gamificationTypes';

export interface XpRulesConfig {
  baseQuizXp: number;
  xpPerCorrectAnswer: number;
  perfectQuizBonus: number;
  highAccuracyBonus: number;
  smartReviewBonus: number;
  testModeBonus: number;
  improvementBonus: number;
  streakBonusMax: number;
  maxSessionXp: number;
  grindDiminishingFactor: number; // 0.45 for already-mastered tier grinding
  masteryMilestoneBonus: number; // 50 XP when a skill legitimately reaches MASTERED
  tierUnlockBonus: number; // 30 XP when a new tier is unlocked
}

export const DEFAULT_XP_RULES: XpRulesConfig = {
  baseQuizXp: 10,
  xpPerCorrectAnswer: 6,
  perfectQuizBonus: 20,
  highAccuracyBonus: 12,
  smartReviewBonus: 25,
  testModeBonus: 15,
  improvementBonus: 15,
  streakBonusMax: 15,
  maxSessionXp: 220,
  grindDiminishingFactor: 0.45,
  masteryMilestoneBonus: 50,
  tierUnlockBonus: 30,
};

export interface XpCalculationInput {
  result: QuizResult;
  previousResults?: QuizResult[];
  currentStreak?: number;
  customRules?: Partial<XpRulesConfig>;
  isGrindingMasteredTier?: boolean;
  tierNumber?: number;
  oneTimeMasteryBonus?: boolean;
  oneTimeTierUnlockBonus?: boolean;
}

/**
 * Calculates XP earned for a quiz session with an itemized breakdown.
 * Centralized, anti-grind, quality-over-repetition scoring engine.
 */
export function calculateQuizXp(input: XpCalculationInput): XpBreakdown {
  const {
    result,
    previousResults = [],
    currentStreak = 1,
    customRules,
    tierNumber = 1,
    oneTimeMasteryBonus = false,
    oneTimeTierUnlockBonus = false,
  } = input;
  const rules: XpRulesConfig = { ...DEFAULT_XP_RULES, ...customRules };

  const totalQuestions = Math.max(1, result.totalQuestions || 0);
  const correctCount = Math.max(0, result.correctCount || 0);
  const accuracy = Math.round((correctCount / totalQuestions) * 100);

  // 1. Base completion XP (scaled if short < 3 questions to prevent abuse)
  let baseQuizXp = rules.baseQuizXp;
  if (totalQuestions < 3) {
    baseQuizXp = Math.max(3, Math.round(rules.baseQuizXp * 0.4));
  } else if (totalQuestions >= 10) {
    baseQuizXp = Math.round(rules.baseQuizXp * 1.2);
  }

  // 2. XP per correct answer with modest tier scaling (Tier 1: +0, Tier 2: +1, Tier 3: +2, Tier 4: +3)
  const tierBonusPerCorrect = Math.max(0, Math.min(3, tierNumber - 1));
  const correctAnswersXp = correctCount * (rules.xpPerCorrectAnswer + tierBonusPerCorrect);

  // 3. Accuracy bonus (requires at least 5 questions)
  let accuracyBonusXp = 0;
  if (totalQuestions >= 5 && accuracy === 100) {
    accuracyBonusXp = rules.perfectQuizBonus;
  } else if (totalQuestions >= 5 && accuracy >= 85) {
    accuracyBonusXp = rules.highAccuracyBonus;
  }

  // 4. Smart Review completion bonus
  let smartReviewBonusXp = 0;
  if (result.source === 'smart-review') {
    smartReviewBonusXp = rules.smartReviewBonus;
  }

  // 5. Test mode bonus (rewarding focused test-taking effort)
  let testModeBonusXp = 0;
  if (result.mode === 'test' && totalQuestions >= 5) {
    testModeBonusXp = rules.testModeBonus;
  }

  // 6. Measurable improvement bonus (improved by >= 15% accuracy over previous session of same operation)
  let improvementBonusXp = 0;
  if (previousResults.length > 0) {
    const recentSameOp = previousResults
      .filter((r) => r.id !== result.id && (r.operation === result.operation || result.operation === 'mixed'))
      .sort((a, b) => b.timestamp - a.timestamp)[0];

    if (recentSameOp) {
      const prevAcc = Math.round(((recentSameOp.correctCount || 0) / Math.max(1, recentSameOp.totalQuestions || 1)) * 100);
      if (accuracy - prevAcc >= 15) {
        improvementBonusXp = rules.improvementBonus;
      }
    }
  }

  // 7. Streak bonus (mild daily boost: up to +15 XP based on active streak)
  const streakBonusXp = Math.min(Math.max(0, currentStreak * 3), rules.streakBonusMax);

  // 8. One-time legitimate mastery and tier unlock milestone bonuses
  const masteryMilestoneBonusXp = oneTimeMasteryBonus ? rules.masteryMilestoneBonus : 0;
  const tierUnlockBonusXp = oneTimeTierUnlockBonus ? rules.tierUnlockBonus : 0;

  // 9. Achievement bonus placeholder (awarded directly during badge evaluation)
  const achievementBonusXp = 0;

  // Calculate practice component subject to diminishing returns
  let practiceTotal =
    baseQuizXp +
    correctAnswersXp +
    accuracyBonusXp +
    smartReviewBonusXp +
    testModeBonusXp +
    improvementBonusXp +
    streakBonusXp;

  const isGrindingReduced = Boolean(input.isGrindingMasteredTier);
  if (isGrindingReduced) {
    // Graceful reduction: practice efficiency is reduced, but child still gets minimum 5-8 XP
    practiceTotal = Math.max(6, Math.round(practiceTotal * rules.grindDiminishingFactor));
  }

  // Uncapped sum combining practice with legitimate educational milestone bonuses
  const uncappedTotal = practiceTotal + masteryMilestoneBonusXp + tierUnlockBonusXp;
  const totalXpEarned = Math.min(uncappedTotal, rules.maxSessionXp);

  return {
    baseQuizXp,
    correctAnswersXp,
    accuracyBonusXp,
    smartReviewBonusXp,
    testModeBonusXp,
    improvementBonusXp,
    streakBonusXp,
    achievementBonusXp,
    masteryMilestoneBonusXp,
    tierUnlockBonusXp,
    isGrindingReduced,
    totalXpEarned: Math.max(5, totalXpEarned), // Minimum 5 XP guaranteed for any completed effort!
  };
}

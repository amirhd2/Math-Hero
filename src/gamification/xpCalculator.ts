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
  grindDiminishingFactor: number; // 0.5 for already-mastered tier grinding
}

export const DEFAULT_XP_RULES: XpRulesConfig = {
  baseQuizXp: 10,
  xpPerCorrectAnswer: 8,
  perfectQuizBonus: 20,
  highAccuracyBonus: 12,
  smartReviewBonus: 25,
  testModeBonus: 15,
  improvementBonus: 15,
  streakBonusMax: 15,
  maxSessionXp: 180,
  grindDiminishingFactor: 0.5,
};

export interface XpCalculationInput {
  result: QuizResult;
  previousResults?: QuizResult[];
  currentStreak?: number;
  customRules?: Partial<XpRulesConfig>;
  isGrindingMasteredTier?: boolean;
}

/**
 * Calculates XP earned for a quiz session with an itemized breakdown.
 */
export function calculateQuizXp(input: XpCalculationInput): XpBreakdown {
  const { result, previousResults = [], currentStreak = 1, customRules } = input;
  const rules: XpRulesConfig = { ...DEFAULT_XP_RULES, ...customRules };

  const totalQuestions = Math.max(1, result.totalQuestions || 0);
  const correctCount = Math.max(0, result.correctCount || 0);
  const accuracy = Math.round((correctCount / totalQuestions) * 100);

  // 1. Base completion XP (scaled if very short < 3 questions to prevent abuse)
  let baseQuizXp = rules.baseQuizXp;
  if (totalQuestions < 3) {
    baseQuizXp = Math.round(rules.baseQuizXp * 0.5);
  }

  // 2. XP per correct answer
  const correctAnswersXp = correctCount * rules.xpPerCorrectAnswer;

  // 3. Accuracy bonus
  let accuracyBonusXp = 0;
  if (totalQuestions >= 5 && accuracy === 100) {
    accuracyBonusXp = rules.perfectQuizBonus;
  } else if (totalQuestions >= 5 && accuracy >= 80) {
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

  // 6. Measurable improvement bonus
  // If child improved by >= 15% accuracy compared to their recent previous quiz of same operation
  let improvementBonusXp = 0;
  if (previousResults.length > 0) {
    const recentSameOp = previousResults
      .filter((r) => r.id !== result.id && (r.operation === result.operation || result.operation === 'mixed'))
      .sort((a, b) => b.timestamp - a.timestamp)[0];

    if (recentSameOp) {
      const prevAcc = Math.round(((recentSameOp.correctCount || 0) / (recentSameOp.totalQuestions || 1)) * 100);
      if (accuracy - prevAcc >= 15) {
        improvementBonusXp = rules.improvementBonus;
      }
    }
  }

  // 7. Streak bonus (mild daily boost: up to +20 XP based on active streak)
  const streakBonusXp = Math.min(Math.max(0, currentStreak * 3), rules.streakBonusMax);

  // 8. Achievement bonus placeholder (if result already computed external bonus)
  const achievementBonusXp = 0;

  // Total with Anti-Grind Cap
  let uncappedTotal =
    baseQuizXp +
    correctAnswersXp +
    accuracyBonusXp +
    smartReviewBonusXp +
    testModeBonusXp +
    improvementBonusXp +
    streakBonusXp;

  // Anti-grind rule: if repeatedly practicing an already-mastered tier, reduce reward
  if (input.isGrindingMasteredTier) {
    uncappedTotal = Math.round(uncappedTotal * rules.grindDiminishingFactor);
  }

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
    totalXpEarned: Math.max(5, totalXpEarned), // Minimum 5 XP for completing any quiz!
  };
}

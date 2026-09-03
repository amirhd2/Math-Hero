/**
 * Difficulty Adapter for Math Hero Smart Review.
 * Adapts mathematical difficulty gradually based on performance:
 * - If struggling: reinforce fundamentals, reduce operands, avoid tricky borrowing/carrying
 * - If thriving: gradually increase challenge, introduce harder combinations
 */

import { OperationSettings } from '../types';
import { SmartReviewDifficultyProfile, SkillPerformanceRecord } from './smartReviewTypes';

export function determineDifficultyProfile(
  records: SkillPerformanceRecord[]
): SmartReviewDifficultyProfile {
  if (!records || records.length === 0) {
    return {
      targetLevel: 1,
      reinforceFundamentals: false,
      allowHarderCombinations: false,
    };
  }

  // Calculate weighted average accuracy of targeted skills
  const totalAttempts = records.reduce((sum, r) => sum + r.totalAttempts, 0);
  const totalCorrect = records.reduce((sum, r) => sum + r.correctCount, 0);
  const aggregateAccuracy = totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 70;

  const strugglingCount = records.filter(
    (r) => r.confidence === 'needs_support' || r.consecutiveMistakes >= 2
  ).length;

  const strongCount = records.filter(
    (r) => r.confidence === 'strong' || r.confidence === 'mastered'
  ).length;

  if (strugglingCount >= 2 || aggregateAccuracy < 60) {
    // Child is struggling: lower difficulty, emphasize fundamentals
    return {
      targetLevel: 1,
      reinforceFundamentals: true,
      allowHarderCombinations: false,
    };
  }

  if (strongCount >= records.length / 2 && aggregateAccuracy >= 85) {
    // Child is excelling: moderate bump in challenge
    return {
      targetLevel: 3,
      reinforceFundamentals: false,
      allowHarderCombinations: true,
    };
  }

  // Balanced normal practice
  return {
    targetLevel: 2,
    reinforceFundamentals: false,
    allowHarderCombinations: false,
  };
}

/**
 * Creates operation settings fine-tuned according to the difficulty profile.
 */
export function buildAdaptiveOperationSettings(
  profile: SmartReviewDifficultyProfile,
  weakMultiplicationTables?: number[]
): OperationSettings {
  if (profile.reinforceFundamentals) {
    // Gentle & accessible: 1-digit or simple 2-digit
    return {
      addition: {
        operand1Digits: 1,
        operand2Digits: 1,
      },
      subtraction: {
        operand1Digits: 1,
        operand2Digits: 1,
        allowNegative: false,
      },
      multiplication: {
        mode: 'table',
        operand1Digits: 1,
        operand2Digits: 1,
        tableNumber: (weakMultiplicationTables && weakMultiplicationTables[0]) || 3,
      },
      division: {
        mode: 'table',
        dividendDigits: 2,
        divisorDigits: 1,
        tableNumber: (weakMultiplicationTables && weakMultiplicationTables[0]) || 2,
        allowRemainder: false,
      },
    };
  }

  if (profile.allowHarderCombinations) {
    // Challenge mode: 2-digit, tables 8/9
    return {
      addition: {
        operand1Digits: 2,
        operand2Digits: 2,
      },
      subtraction: {
        operand1Digits: 2,
        operand2Digits: 2,
        allowNegative: false,
      },
      multiplication: {
        mode: 'table',
        operand1Digits: 1,
        operand2Digits: 1,
        tableNumber: (weakMultiplicationTables && weakMultiplicationTables[0]) || 8,
      },
      division: {
        mode: 'table',
        dividendDigits: 2,
        divisorDigits: 1,
        tableNumber: (weakMultiplicationTables && weakMultiplicationTables[0]) || 7,
        allowRemainder: false,
      },
    };
  }

  // Standard intermediate practice
  return {
    addition: {
      operand1Digits: 2,
      operand2Digits: 1,
    },
    subtraction: {
      operand1Digits: 2,
      operand2Digits: 1,
      allowNegative: false,
    },
    multiplication: {
      mode: 'table',
      operand1Digits: 1,
      operand2Digits: 1,
      tableNumber: (weakMultiplicationTables && weakMultiplicationTables[0]) || 6,
    },
    division: {
      mode: 'table',
      dividendDigits: 2,
      divisorDigits: 1,
      tableNumber: (weakMultiplicationTables && weakMultiplicationTables[0]) || 4,
      allowRemainder: false,
    },
  };
}

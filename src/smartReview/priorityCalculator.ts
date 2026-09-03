/**
 * Centralized Smart Review Priority Calculator for Math Hero.
 * Implements the adaptive scoring system based on:
 *   Mistake Frequency
 *   + Recent Mistakes
 *   + Repeated Mistakes
 *   + Low Accuracy
 *   + Time Since Last Practice (Spaced Review)
 *   + High Attempt Count
 *   + Slow Response Time
 *   - Recent Successful Performance (Gradual reduction)
 */

import { SkillPerformanceRecord } from './smartReviewTypes';

export interface PriorityCalculatorWeights {
  mistakeWeight: number;            // weight for mistake count
  repeatedMistakeMultiplier: number; // multiplier for consecutive mistakes
  lowAccuracyWeight: number;        // weight for low accuracy
  recencyWeight: number;            // weight for mistakes in the last 24-48 hours
  spacedDecayDaysFactor: number;    // weight added per day unpracticed
  slowResponseWeight: number;       // weight if response time > 8 seconds
  consecutiveSuccessReduction: number; // priority reduction per consecutive correct answer
  masteredFloorPriority: number;    // minimum occasional priority for mastered skills
}

export const DEFAULT_PRIORITY_WEIGHTS: PriorityCalculatorWeights = {
  mistakeWeight: 8.0,
  repeatedMistakeMultiplier: 12.0,
  lowAccuracyWeight: 0.35,          // scales (100 - accuracy)
  recencyWeight: 15.0,
  spacedDecayDaysFactor: 3.5,       // adds 3.5 points per day without practice (up to 25 pts)
  slowResponseWeight: 6.0,
  consecutiveSuccessReduction: 7.0, // reduces priority for consecutive successes
  masteredFloorPriority: 10.0,      // keep mastered skills ready for spaced review
};

/**
 * Calculates adaptive review priority score for a skill.
 * Higher score = higher urgency to review.
 */
export function calculateReviewPriority(
  record: Omit<SkillPerformanceRecord, 'reviewPriority'>,
  now: number = Date.now(),
  weights: PriorityCalculatorWeights = DEFAULT_PRIORITY_WEIGHTS
): number {
  const {
    totalAttempts,
    correctCount,
    mistakeCount,
    consecutiveMistakes,
    consecutiveCorrect,
    lastPracticedTimestamp,
    lastMistakeTimestamp,
    averageResponseTimeMs,
    accuracyPercent,
    confidence,
  } = record;

  // If completely unpracticed, give a healthy baseline priority so it gets discovered
  if (totalAttempts === 0) {
    return 35;
  }

  let priority = 0;

  // 1. Mistake Frequency
  priority += mistakeCount * weights.mistakeWeight;

  // 2. Repeated Mistakes (crucial for struggling skills)
  if (consecutiveMistakes > 0) {
    priority += consecutiveMistakes * weights.repeatedMistakeMultiplier;
  }

  // 3. Low Accuracy Impact: 0 when 100%, up to ~35 when 0%
  const accuracyDeficit = Math.max(0, 100 - accuracyPercent);
  priority += accuracyDeficit * weights.lowAccuracyWeight;

  // 4. Recency of Mistakes
  if (lastMistakeTimestamp) {
    const hoursSinceMistake = (now - lastMistakeTimestamp) / (1000 * 60 * 60);
    if (hoursSinceMistake <= 12) {
      priority += weights.recencyWeight;
    } else if (hoursSinceMistake <= 48) {
      priority += weights.recencyWeight * 0.6;
    }
  }

  // 5. Spaced Review (Time since last practice)
  if (lastPracticedTimestamp) {
    const daysSincePractice = Math.max(0, (now - lastPracticedTimestamp) / (1000 * 60 * 60 * 24));
    // Gradual rise if not practiced for days, capped at 25
    const spacedBonus = Math.min(25, daysSincePractice * weights.spacedDecayDaysFactor);
    priority += spacedBonus;
  }

  // 6. Slow Response Time (Hesitation / Struggle indicator)
  if (averageResponseTimeMs > 8000) {
    priority += weights.slowResponseWeight;
  } else if (averageResponseTimeMs > 12000) {
    priority += weights.slowResponseWeight * 1.8;
  }

  // 7. Successful Corrections & Recent Success Reduction (Gradual drop)
  if (consecutiveCorrect > 0) {
    priority -= consecutiveCorrect * weights.consecutiveSuccessReduction;
  }
  if (record.successfulCorrections > 0) {
    priority -= record.successfulCorrections * 4.0;
  }

  // 8. Confidence Guardrails & Mastered Floor
  if (confidence === 'mastered') {
    // Mastered skills should not be 0, but sit around the floor for spaced repetition
    priority = Math.max(weights.masteredFloorPriority, Math.min(25, priority));
  } else if (confidence === 'needs_support') {
    // Ensure struggling skills receive high priority
    priority = Math.max(45, priority);
  }

  // Return clamped positive priority
  return Math.max(5, Math.round(priority));
}

/**
 * Conservative Evidence-Based Mastery Evaluator for Math Hero.
 * Centralizes all promotion and mastery thresholds in one clean model.
 *
 * Rules:
 * 1. Single quiz completion or high XP NEVER unlocks a tier.
 * 2. Requires evidence across multiple independent sessions (>= 3).
 * 3. Requires high recent accuracy (>= 90%).
 * 4. Requires minimum question volume in that tier (>= 15 questions).
 * 5. Low repeated mistakes.
 * 6. Speed is a secondary signal, not a blocker.
 */

import { SkillTierEvidence, SkillMasteryEvaluation, MasteryState } from './adaptiveTypes';

export interface MasteryThresholds {
  minSessionsForMastery: number;
  minQuestionsForMastery: number;
  minRecentAccuracyPercent: number; // e.g. 90
  minAllTimeAccuracyPercent: number; // e.g. 85
  maxAllowedRepeatedMistakes: number;
  minConsecutiveStrongSessions: number;
}

export const CONSERVATIVE_MASTERY_THRESHOLDS: MasteryThresholds = {
  minSessionsForMastery: 3,
  minQuestionsForMastery: 15,
  minRecentAccuracyPercent: 90,
  minAllTimeAccuracyPercent: 80,
  maxAllowedRepeatedMistakes: 1,
  minConsecutiveStrongSessions: 2,
};

export class SkillMasteryEvaluator {
  /**
   * Evaluates the current evidence for a given skill tier.
   */
  static evaluate(
    evidence: SkillTierEvidence,
    thresholds: MasteryThresholds = CONSERVATIVE_MASTERY_THRESHOLDS
  ): SkillMasteryEvaluation {
    const {
      tier,
      skillId,
      operation,
      questionsAttempted,
      questionsCorrect,
      sessionsCount,
      recentAccuracy,
      consecutiveCorrectSessions,
      repeatedMistakesCount,
      lastPracticedAt,
    } = evidence;

    const allTimeAccuracy =
      questionsAttempted > 0 ? Math.round((questionsCorrect / questionsAttempted) * 100) : 0;

    // Determine retention status
    let retentionStatus: 'fresh' | 'retained' | 'needs_refresh' = 'fresh';
    const now = Date.now();
    if (lastPracticedAt) {
      const daysSincePractice = (now - lastPracticedAt) / (1000 * 60 * 60 * 24);
      if (daysSincePractice > 14) {
        retentionStatus = 'needs_refresh';
      } else if (daysSincePractice > 3) {
        retentionStatus = 'retained';
      }
    }

    // Check promotion eligibility
    const hasEnoughSessions = sessionsCount >= thresholds.minSessionsForMastery;
    const hasEnoughQuestions = questionsAttempted >= thresholds.minQuestionsForMastery;
    const hasHighRecentAccuracy = recentAccuracy >= thresholds.minRecentAccuracyPercent;
    const hasSolidAllTimeAccuracy = allTimeAccuracy >= thresholds.minAllTimeAccuracyPercent;
    const hasLowMistakes = repeatedMistakesCount <= thresholds.maxAllowedRepeatedMistakes;
    const hasConsistency = consecutiveCorrectSessions >= thresholds.minConsecutiveStrongSessions;

    const readyForPromotion =
      evidence.state !== 'mastered' &&
      hasEnoughSessions &&
      hasEnoughQuestions &&
      hasHighRecentAccuracy &&
      hasSolidAllTimeAccuracy &&
      hasLowMistakes &&
      hasConsistency;

    // Confidence metric (0 to 100)
    let confidence = 0;
    if (questionsAttempted > 0) {
      const sessionScore = Math.min(1, sessionsCount / thresholds.minSessionsForMastery) * 35;
      const accuracyScore = (recentAccuracy / 100) * 45;
      const questionVolumeScore = Math.min(1, questionsAttempted / thresholds.minQuestionsForMastery) * 20;
      confidence = Math.round(sessionScore + accuracyScore + questionVolumeScore);
    }

    // Determine current state based on evidence
    let evaluatedState: MasteryState = evidence.state;
    let reasonFa = '';

    if (evidence.state === 'locked') {
      evaluatedState = 'locked';
      reasonFa = 'این مرحله هنوز باز نشده است.';
    } else if (evidence.state === 'mastered') {
      evaluatedState = 'mastered';
      reasonFa = 'تسلط کامل اثبات شده است.';
    } else if (readyForPromotion) {
      evaluatedState = 'practicing';
      reasonFa = 'شواهد یادگیری کامل است و آماده ارتقا به مرحله بعد هستید! 🎉';
    } else if (questionsAttempted === 0) {
      evaluatedState = 'learning';
      reasonFa = 'به تازگی با این مرحله آشنا شده‌اید.';
    } else {
      evaluatedState = 'practicing';
      if (!hasEnoughSessions) {
        reasonFa = `نیاز به ${thresholds.minSessionsForMastery - sessionsCount} جلسه تمرین دیگر برای اثبات تسلط`;
      } else if (!hasHighRecentAccuracy) {
        reasonFa = `دقت اخیر (${recentAccuracy}٪) باید به حداقل ${thresholds.minRecentAccuracyPercent}٪ برسد`;
      } else if (!hasEnoughQuestions) {
        reasonFa = `نیاز به حل ${thresholds.minQuestionsForMastery - questionsAttempted} سؤال دیگر در این مرحله`;
      } else {
        reasonFa = 'در حال تقویت و تثبیت مهارت';
      }
    }

    return {
      skillId,
      tier,
      operation,
      state: evaluatedState,
      confidence,
      accuracy: allTimeAccuracy,
      recentAccuracy,
      sessionsCompleted: sessionsCount,
      questionsAnswered: questionsAttempted,
      repeatedMistakes: repeatedMistakesCount,
      retentionStatus,
      readyForPromotion,
      reasonFa,
    };
  }
}

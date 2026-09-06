/**
 * Persistence layer for Quiz results and mistake records.
 * Integrates directly with storage, adaptive pedagogical evaluation, user profile gamification,
 * and achievement unlocks in a strict, deterministic sequence:
 * 
 * Pipeline:
 * Quiz Completed
 * ↓
 * Evidence Recorded in Smart Teacher
 * ↓
 * Mastery Evaluated & Promotions Tracked
 * ↓
 * XP Calculated (with one-time mastery & tier unlock rewards)
 * ↓
 * Level Evaluated (with educational milestone gating)
 * ↓
 * Streak Updated
 * ↓
 * Badges & Achievements Evaluated
 * ↓
 * Final Trophy Eligibility Evaluated
 * ↓
 * UI Celebration
 */

import { QuizResult, MistakeRecord, UserProfile, Achievement, QuizSession } from '../types';
import { storage } from '../utils/storage';
import { gamificationEngine } from '../gamification/gamificationEngine';
import { invalidateSmartReviewCache } from '../smartReview/smartReviewEngine';
import { SmartTeacherEngine } from '../adaptive/smartTeacherEngine';
import { PromotionEvent } from '../adaptive/adaptiveTypes';

export async function persistQuizCompletion(
  result: QuizResult,
  mistakes: MistakeRecord[],
  profile: UserProfile,
  session?: QuizSession
): Promise<{ updatedProfile: UserProfile; finalResult: QuizResult; newPromotion: PromotionEvent | null }> {
  // 1. Record evidence in Adaptive Learning Engine FIRST to determine pedagogical mastery & promotions
  let newPromotion: PromotionEvent | null = null;
  try {
    const isParentOverride =
      session?.source === 'parent-manual' ||
      session?.source === 'test-pattern' ||
      result.source === 'parent-manual' ||
      result.source === 'test-pattern';
    const adaptiveOutcome = await SmartTeacherEngine.recordQuizEvidence(
      result,
      session,
      undefined,
      isParentOverride
    );
    newPromotion = adaptiveOutcome.newPromotion;
  } catch (err) {
    console.warn('Failed to record adaptive evidence:', err);
  }

  // 2. Fetch previous results for improvement & cumulative evaluations
  const previousResults = await storage.getResults();

  // 3. Centralized Gamification Engine: Atomic calculation of XP, Level, Streak, Badges & Trophy
  // Informs gamification of legitimate new promotions for one-time milestone rewards
  const gamificationResult = await gamificationEngine.processQuizCompletion(
    result,
    previousResults,
    profile,
    newPromotion
  );

  // 4. Map newly unlocked badges to the Achievement interface for backward compatibility
  const unlockedAchievements: Achievement[] = gamificationResult.newlyUnlockedBadges.map((b) => ({
    id: b.id,
    title: b.name,
    description: b.description,
    icon: b.icon,
    unlocked: true,
    progress: b.maxProgress || 1,
    maxProgress: b.maxProgress || 1,
    unlockedAt: b.unlockedAt || Date.now(),
  }));

  // 5. Form complete QuizResult with final verified metrics
  const finalResult: QuizResult = {
    ...result,
    xpEarned: gamificationResult.xpBreakdown.totalXpEarned,
    levelBefore: gamificationResult.levelBefore,
    levelAfter: gamificationResult.levelAfter,
    leveledUp: gamificationResult.leveledUp,
    unlockedAchievements,
    mistakes,
  };

  // 6. Save Quiz Result
  await storage.saveResult(finalResult);

  // 7. Save individual mistake records for Smart Review
  for (const mistake of mistakes) {
    try {
      await storage.saveMistake(mistake);
    } catch (err) {
      console.warn('Failed to persist mistake record:', err);
    }
  }

  // 8. Invalidate Smart Review cache
  invalidateSmartReviewCache();

  return {
    updatedProfile: gamificationResult.updatedProfile,
    finalResult,
    newPromotion,
  };
}

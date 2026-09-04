/**
 * Persistence layer for Quiz results and mistake records.
 * Integrates directly with storage, user profile gamification, and achievement unlocks.
 */

import { QuizResult, MistakeRecord, UserProfile, Achievement } from '../types';
import { storage } from '../utils/storage';
import { gamificationEngine } from '../gamification/gamificationEngine';
import { invalidateSmartReviewCache } from '../smartReview/smartReviewEngine';
import { SmartTeacherEngine } from '../adaptive/smartTeacherEngine';

export async function persistQuizCompletion(
  result: QuizResult,
  mistakes: MistakeRecord[],
  profile: UserProfile
): Promise<{ updatedProfile: UserProfile; finalResult: QuizResult }> {
  // 1. Fetch previous results for improvement & cumulative evaluations
  const previousResults = await storage.getResults();

  // 2. Centralized Gamification Engine: Atomic calculation of XP, Level, Streak, Badges & Trophy
  const gamificationResult = await gamificationEngine.processQuizCompletion(
    result,
    previousResults,
    profile
  );

  // 3. Map newly unlocked badges to the Achievement interface for backward compatibility
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

  // 4. Form complete QuizResult with final verified metrics
  const finalResult: QuizResult = {
    ...result,
    xpEarned: gamificationResult.xpBreakdown.totalXpEarned,
    levelBefore: gamificationResult.levelBefore,
    levelAfter: gamificationResult.levelAfter,
    leveledUp: gamificationResult.leveledUp,
    unlockedAchievements,
    mistakes,
  };

  // 5. Save Quiz Result
  await storage.saveResult(finalResult);

  // 6. Record evidence in Adaptive Learning Engine
  try {
    await SmartTeacherEngine.recordQuizEvidence(finalResult);
  } catch (err) {
    console.warn('Failed to record adaptive evidence:', err);
  }

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
  };
}


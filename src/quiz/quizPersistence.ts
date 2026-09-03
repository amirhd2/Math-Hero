/**
 * Persistence layer for Quiz results and mistake records.
 * Integrates directly with storage, user profile gamification, and achievement unlocks.
 */

import { QuizResult, MistakeRecord, UserProfile } from '../types';
import { storage } from '../utils/storage';
import { evaluateAchievements } from '../results/achievementResolver';
import { invalidateSmartReviewCache } from '../smartReview/smartReviewEngine';

export async function persistQuizCompletion(
  result: QuizResult,
  mistakes: MistakeRecord[],
  profile: UserProfile
): Promise<{ updatedProfile: UserProfile; finalResult: QuizResult }> {
  // 1. Calculate XP and Level Progression
  const levelBefore = profile.level;
  const newXp = profile.xp + result.xpEarned;
  const newLevel = Math.floor(newXp / 200) + 1;
  const leveledUp = newLevel > levelBefore;

  const updatedProfile: UserProfile = {
    ...profile,
    xp: newXp,
    level: newLevel,
  };

  // 2. Fetch previous results for cumulative milestones
  const previousResults = await storage.getResults();
  const totalCorrectHistory = previousResults.reduce((acc, r) => acc + (r.correctCount || 0), 0);

  // 3. Evaluate Achievements
  const { newlyUnlocked } = await evaluateAchievements(
    result,
    updatedProfile,
    previousResults.length,
    totalCorrectHistory
  );

  // 4. Form complete QuizResult
  const finalResult: QuizResult = {
    ...result,
    levelBefore,
    levelAfter: newLevel,
    leveledUp,
    unlockedAchievements: newlyUnlocked,
    mistakes,
  };

  // 5. Save Quiz Result and profile
  await storage.saveResult(finalResult);
  await storage.saveProfile(updatedProfile);

  // 6. Save individual mistake records for Smart Review
  for (const mistake of mistakes) {
    try {
      await storage.saveMistake(mistake);
    } catch (err) {
      console.warn('Failed to persist mistake record:', err);
    }
  }

  // 7. Invalidate Smart Review cache
  invalidateSmartReviewCache();

  return { updatedProfile, finalResult };
}


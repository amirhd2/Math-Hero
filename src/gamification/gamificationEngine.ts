/**
 * Centralized Gamification Engine for Math Hero.
 * The Single Source of Truth for XP, Levels, Badges, Trophy, and Progression.
 * 
 * CORE PRINCIPLE:
 * Strict conceptual separation between:
 * MOTIVATIONAL PROGRESSION (XP, Level, Badges, Streaks)
 * and
 * EDUCATIONAL PROGRESSION (Skill Mastery, Approved Tier Evidence, Operation Breadth).
 * 
 * XP motivates the child, while Skill Mastery determines real educational progression.
 * Level 15 / Grand Math Hero and Trophy Stage 6 strictly require satisfying verified educational milestones.
 */

import { QuizResult, UserProfile, OperationType } from '../types';
import { storage } from '../utils/storage';
import {
  GamificationState,
  GamificationUpdateResult,
  Badge,
  LevelInfo,
  TrophyInfo,
  GamificationStats,
} from './gamificationTypes';
import { calculateQuizXp } from './xpCalculator';
import { getLevelProgress, calculateLevelUp, getLevelFromXp, getRawLevelByXp } from './levelCalculator';
import { evaluateStreak, getLocalCalendarDate } from './streakManager';
import { evaluateBadges } from './achievementEngine';
import { getTrophyInfo, calculateTrophyStage } from './trophyManager';
import { loadGamificationState, saveGamificationState } from './gamificationPersistence';
import { SmartTeacherEngine } from '../adaptive/smartTeacherEngine';
import { AdaptiveLearningPlan, PromotionEvent } from '../adaptive/adaptiveTypes';
import { MathHeroEligibilityEvaluator, MathHeroEligibility } from './mathHeroEvaluator';

export interface EducationalStatsSummary {
  masteredTiersCount: number;
  distinctOperationsCount: number;
  advancedTiersCount: number;
  learningPlan: AdaptiveLearningPlan | null;
}

/**
 * Extracts verified educational metrics from the child's AdaptiveLearningPlan.
 */
export async function getEducationalStatsSummary(): Promise<EducationalStatsSummary> {
  try {
    const plan = await SmartTeacherEngine.getLearningPlan();
    let masteredTiersCount = 0;
    let advancedTiersCount = 0;
    const opsWithMastery = new Set<OperationType>();

    if (plan && plan.operations) {
      const coreOps: OperationType[] = ['addition', 'subtraction', 'multiplication', 'division'];
      coreOps.forEach((op) => {
        const profile = plan.operations[op];
        if (profile && profile.tiers) {
          Object.values(profile.tiers).forEach((evidence) => {
            if (evidence.state === 'mastered') {
              masteredTiersCount++;
              opsWithMastery.add(op);
              if (evidence.tier >= 3) {
                advancedTiersCount++;
              }
            }
          });
        }
      });
    }

    return {
      masteredTiersCount,
      distinctOperationsCount: opsWithMastery.size,
      advancedTiersCount,
      learningPlan: plan,
    };
  } catch {
    return {
      masteredTiersCount: 0,
      distinctOperationsCount: 0,
      advancedTiersCount: 0,
      learningPlan: null,
    };
  }
}

class GamificationEngineService {
  private cachedState: GamificationState | null = null;

  /**
   * Retrieves the current gamification state.
   */
  async getState(): Promise<GamificationState> {
    if (!this.cachedState) {
      this.cachedState = await loadGamificationState();
    }
    return this.cachedState;
  }

  /**
   * Primary event pipeline: Process a completed quiz or practice session.
   * Atomically computes XP, Level, Streak, Badges, and Trophy.
   * Enforces strict idempotency and educational gating.
   */
  async processQuizCompletion(
    result: QuizResult,
    previousResults: QuizResult[] = [],
    profile: UserProfile,
    newPromotion?: PromotionEvent | null
  ): Promise<GamificationUpdateResult> {
    const currentState = await this.getState();
    const now = result.timestamp || Date.now();
    const todayStr = getLocalCalendarDate(now);

    // 0. IDEMPOTENCY CHECK: Ensure the exact same quiz result ID cannot award duplicate XP or badges
    if (result.id && currentState.processedQuizIds?.includes(result.id)) {
      const levelInfo = getLevelProgress(currentState.totalXp);
      return {
        updatedState: currentState,
        updatedProfile: profile,
        xpBreakdown: {
          baseQuizXp: 0,
          correctAnswersXp: 0,
          accuracyBonusXp: 0,
          smartReviewBonusXp: 0,
          testModeBonusXp: 0,
          improvementBonusXp: 0,
          streakBonusXp: 0,
          achievementBonusXp: 0,
          masteryMilestoneBonusXp: 0,
          tierUnlockBonusXp: 0,
          totalXpEarned: 0,
        },
        levelBefore: currentState.currentLevel,
        levelAfter: currentState.currentLevel,
        leveledUp: false,
        levelsGained: 0,
        newlyUnlockedBadges: [],
        trophyStageBefore: currentState.trophyStage,
        trophyStageAfter: currentState.trophyStage,
        trophyUpgraded: false,
      };
    }

    // 1. Evaluate Daily Streak
    const streakResult = evaluateStreak(
      currentState.lastActivityDate,
      currentState.currentStreak,
      currentState.bestStreak,
      now
    );

    // 2. Retrieve verified Educational Progress metrics from SmartTeacher
    const eduSummary = await getEducationalStatsSummary();

    // 3. Check for Anti-Grind (practicing already-mastered tier)
    let isGrinding = result.adaptiveMetadata?.isGrindingMasteredTier;
    if (isGrinding === undefined && result.operation && result.operation !== 'mixed') {
      try {
        isGrinding = await SmartTeacherEngine.isGrindingMasteredTier(
          result.operation,
          result.adaptiveMetadata?.targetTier || 1
        );
      } catch {
        isGrinding = false;
      }
    }

    // 4. One-Time Legitimate Educational Milestone Bonuses
    const awardedBonuses = [...(currentState.awardedMasteryBonuses || [])];
    let awardMasteryBonus = false;
    let awardUnlockBonus = false;

    if (newPromotion) {
      const masteryKey = `mastery_${newPromotion.operation}_${newPromotion.masteredTier}`;
      if (!awardedBonuses.includes(masteryKey)) {
        awardMasteryBonus = true;
        awardedBonuses.push(masteryKey);
      }

      const unlockKey = `unlock_${newPromotion.operation}_${newPromotion.unlockedTier}`;
      if (!awardedBonuses.includes(unlockKey)) {
        awardUnlockBonus = true;
        awardedBonuses.push(unlockKey);
      }
    }

    // 5. Calculate XP with quality tier scaling and anti-grind diminishing factor
    const xpBreakdown = calculateQuizXp({
      result,
      previousResults,
      currentStreak: streakResult.currentStreak,
      isGrindingMasteredTier: isGrinding,
      tierNumber: result.adaptiveMetadata?.targetTier || 1,
      oneTimeMasteryBonus: awardMasteryBonus,
      oneTimeTierUnlockBonus: awardUnlockBonus,
    });

    const xpBefore = currentState.totalXp;
    const initialNewXp = xpBefore + xpBreakdown.totalXpEarned;

    // Check Grand Math Hero Eligibility
    const mathHeroEligibility = MathHeroEligibilityEvaluator.evaluate({
      totalXp: initialNewXp,
      unlockedBadgesCount: currentState.unlockedBadges.length,
      learningPlan: eduSummary.learningPlan,
    });

    // 6. Temporary state for badge unlock evaluation
    const intermediateState: GamificationState = {
      ...currentState,
      totalXp: initialNewXp,
      currentLevel: getLevelFromXp(
        initialNewXp,
        eduSummary.masteredTiersCount,
        eduSummary.distinctOperationsCount,
        currentState.unlockedBadges.length
      ),
      currentStreak: streakResult.currentStreak,
      bestStreak: streakResult.bestStreak,
    };

    // 7. Evaluate Badges & Update Cumulative Stats
    const badgeEval = evaluateBadges({
      state: intermediateState,
      latestResult: result,
      previousResults,
      learningPlan: eduSummary.learningPlan,
      mathHeroEligible: mathHeroEligibility.isEligible,
    });

    // 8. Award XP for newly unlocked badges
    let badgeXpBonus = 0;
    const updatedUnlockedBadges = [...currentState.unlockedBadges];
    const updatedTimestamps = { ...currentState.badgeUnlockTimestamps };

    for (const newBadge of badgeEval.newlyUnlockedBadges) {
      if (!updatedUnlockedBadges.includes(newBadge.id)) {
        updatedUnlockedBadges.push(newBadge.id);
        updatedTimestamps[newBadge.id] = now;
        badgeXpBonus += newBadge.xpReward || 0;
      }
    }

    xpBreakdown.achievementBonusXp = badgeXpBonus;
    xpBreakdown.totalXpEarned += badgeXpBonus;

    // 9. Final XP & Level calculation with Educational Milestone Gating
    const finalTotalXp = xpBefore + xpBreakdown.totalXpEarned;

    const levelTransition = calculateLevelUp(
      xpBefore,
      finalTotalXp,
      eduSummary.masteredTiersCount,
      eduSummary.distinctOperationsCount,
      updatedUnlockedBadges.length
    );

    // 10. Trophy calculation incorporating verified educational mastery
    const trophyStageBefore = currentState.trophyStage || 1;
    const trophyStageAfter = calculateTrophyStage(
      levelTransition.levelAfter,
      updatedUnlockedBadges.length,
      eduSummary.masteredTiersCount,
      eduSummary.distinctOperationsCount,
      mathHeroEligibility.isEligible
    );
    const trophyUpgraded = trophyStageAfter > trophyStageBefore;

    // 11. Record processed quiz ID to enforce idempotency
    const updatedProcessedQuizIds = [
      ...(currentState.processedQuizIds || []),
      result.id,
    ].slice(-200); // retain last 200 IDs for storage hygiene

    // 12. Assemble Updated GamificationState
    const updatedState: GamificationState = {
      totalXp: finalTotalXp,
      currentLevel: levelTransition.levelAfter,
      currentStreak: streakResult.currentStreak,
      bestStreak: streakResult.bestStreak,
      unlockedBadges: updatedUnlockedBadges,
      badgeUnlockTimestamps: updatedTimestamps,
      trophyStage: trophyStageAfter,
      lastActivityDate: todayStr,
      lastActivityAt: now,
      stats: badgeEval.updatedStats,
      processedQuizIds: updatedProcessedQuizIds,
      awardedMasteryBonuses: awardedBonuses,
      masteredTiersCount: eduSummary.masteredTiersCount,
      distinctOperationsMastered: eduSummary.distinctOperationsCount,
    };

    // 13. Assemble Synchronized UserProfile
    const updatedProfile: UserProfile = {
      ...profile,
      xp: finalTotalXp,
      level: levelTransition.levelAfter,
      streakDays: streakResult.currentStreak,
    };

    // 14. Atomic Persistence
    this.cachedState = updatedState;
    await saveGamificationState(updatedState);
    await storage.saveProfile(updatedProfile);

    return {
      updatedState,
      updatedProfile,
      xpBreakdown,
      levelBefore: levelTransition.levelBefore,
      levelAfter: levelTransition.levelAfter,
      leveledUp: levelTransition.leveledUp,
      levelsGained: levelTransition.levelsGained,
      newlyUnlockedBadges: badgeEval.newlyUnlockedBadges,
      trophyStageBefore,
      trophyStageAfter,
      trophyUpgraded,
    };
  }

  /**
   * Records a resolved mistake from the practice mistakes treasury.
   */
  async recordMistakeResolved(profile: UserProfile): Promise<{
    newlyUnlockedBadges: Badge[];
    updatedState: GamificationState;
  }> {
    const currentState = await this.getState();
    const eduSummary = await getEducationalStatsSummary();

    const badgeEval = evaluateBadges({
      state: currentState,
      mistakesResolvedCount: 1,
      learningPlan: eduSummary.learningPlan,
    });

    if (badgeEval.newlyUnlockedBadges.length === 0) {
      const updatedState = { ...currentState, stats: badgeEval.updatedStats };
      this.cachedState = updatedState;
      await saveGamificationState(updatedState);
      return { newlyUnlockedBadges: [], updatedState };
    }

    // Award bonus XP for newly unlocked mistake badges
    let bonusXp = 0;
    const updatedUnlockedBadges = [...currentState.unlockedBadges];
    const updatedTimestamps = { ...currentState.badgeUnlockTimestamps };

    for (const b of badgeEval.newlyUnlockedBadges) {
      if (!updatedUnlockedBadges.includes(b.id)) {
        updatedUnlockedBadges.push(b.id);
        updatedTimestamps[b.id] = Date.now();
        bonusXp += b.xpReward || 0;
      }
    }

    const newXp = currentState.totalXp + bonusXp;
    const newLevel = getLevelFromXp(
      newXp,
      eduSummary.masteredTiersCount,
      eduSummary.distinctOperationsCount,
      updatedUnlockedBadges.length
    );

    const mathHeroEligibility = MathHeroEligibilityEvaluator.evaluate({
      totalXp: newXp,
      unlockedBadgesCount: updatedUnlockedBadges.length,
      learningPlan: eduSummary.learningPlan,
    });

    const newTrophyStage = calculateTrophyStage(
      newLevel,
      updatedUnlockedBadges.length,
      eduSummary.masteredTiersCount,
      eduSummary.distinctOperationsCount,
      mathHeroEligibility.isEligible
    );

    const updatedState: GamificationState = {
      ...currentState,
      totalXp: newXp,
      currentLevel: newLevel,
      unlockedBadges: updatedUnlockedBadges,
      badgeUnlockTimestamps: updatedTimestamps,
      trophyStage: newTrophyStage,
      stats: badgeEval.updatedStats,
    };

    const updatedProfile: UserProfile = {
      ...profile,
      xp: newXp,
      level: newLevel,
    };

    this.cachedState = updatedState;
    await saveGamificationState(updatedState);
    await storage.saveProfile(updatedProfile);

    return {
      newlyUnlockedBadges: badgeEval.newlyUnlockedBadges,
      updatedState,
    };
  }

  /**
   * Returns complete overview data for AchievementsScreen or Home/Profile widgets.
   */
  async getOverviewData(): Promise<{
    state: GamificationState;
    levelInfo: LevelInfo;
    trophyInfo: TrophyInfo;
    allBadges: Badge[];
    unlockedBadges: Badge[];
    lockedBadges: Badge[];
    recentlyUnlocked: Badge[];
    stats: GamificationStats;
    mathHeroEligibility: MathHeroEligibility;
  }> {
    const state = await this.getState();
    const eduSummary = await getEducationalStatsSummary();

    const levelInfo = getLevelProgress(
      state.totalXp,
      eduSummary.masteredTiersCount,
      eduSummary.distinctOperationsCount,
      state.unlockedBadges.length
    );

    const mathHeroEligibility = MathHeroEligibilityEvaluator.evaluate({
      totalXp: state.totalXp,
      unlockedBadgesCount: state.unlockedBadges.length,
      learningPlan: eduSummary.learningPlan,
    });

    const trophyInfo = getTrophyInfo(
      state.currentLevel,
      state.unlockedBadges.length,
      eduSummary.masteredTiersCount,
      eduSummary.distinctOperationsCount,
      mathHeroEligibility.isEligible
    );

    // Evaluate all badges with progress against current state
    const { allBadgesWithProgress } = evaluateBadges({
      state,
      learningPlan: eduSummary.learningPlan,
      mathHeroEligible: mathHeroEligibility.isEligible,
    });

    const unlockedBadges = allBadgesWithProgress.filter((b) => b.unlocked);
    const lockedBadges = allBadgesWithProgress.filter((b) => !b.unlocked);

    // Recently unlocked badges (sorted latest first)
    const recentlyUnlocked = [...unlockedBadges]
      .sort((a, b) => (b.unlockedAt || 0) - (a.unlockedAt || 0))
      .slice(0, 4);

    return {
      state,
      levelInfo,
      trophyInfo,
      allBadges: allBadgesWithProgress,
      unlockedBadges,
      lockedBadges,
      recentlyUnlocked,
      stats: state.stats,
      mathHeroEligibility,
    };
  }
}

export const gamificationEngine = new GamificationEngineService();

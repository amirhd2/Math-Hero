/**
 * Centralized Gamification Engine for Math Hero.
 * The Single Source of Truth for XP, Levels, Badges, Trophy, and Progression.
 * All screens (Home, Results, Statistics, Profile, Achievements) consume this unified state.
 */

import { QuizResult, UserProfile } from '../types';
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
import { getLevelProgress, calculateLevelUp, getLevelFromXp } from './levelCalculator';
import { evaluateStreak, getLocalCalendarDate } from './streakManager';
import { evaluateBadges } from './achievementEngine';
import { getTrophyInfo, calculateTrophyStage } from './trophyManager';
import { loadGamificationState, saveGamificationState } from './gamificationPersistence';

class GamificationEngineService {
  private cachedState: GamificationState | null = null;
  private isProcessing = false;

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
   */
  async processQuizCompletion(
    result: QuizResult,
    previousResults: QuizResult[] = [],
    profile: UserProfile
  ): Promise<GamificationUpdateResult> {
    const currentState = await this.getState();
    const now = result.timestamp || Date.now();
    const todayStr = getLocalCalendarDate(now);

    // 1. Evaluate Daily Streak
    const streakResult = evaluateStreak(
      currentState.lastActivityDate,
      currentState.currentStreak,
      currentState.bestStreak,
      now
    );

    // 2. Calculate Base & Bonus XP for this quiz
    const xpBreakdown = calculateQuizXp({
      result,
      previousResults,
      currentStreak: streakResult.currentStreak,
    });

    const xpBefore = currentState.totalXp;
    const initialNewXp = xpBefore + xpBreakdown.totalXpEarned;

    // Temporary state to evaluate badge unlock conditions
    const intermediateState: GamificationState = {
      ...currentState,
      totalXp: initialNewXp,
      currentLevel: getLevelFromXp(initialNewXp),
      currentStreak: streakResult.currentStreak,
      bestStreak: streakResult.bestStreak,
    };

    // 3. Evaluate Badges & Update Accumulated Stats
    const badgeEval = evaluateBadges({
      state: intermediateState,
      latestResult: result,
      previousResults,
    });

    // 4. Award XP for newly unlocked badges
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

    // 5. Final XP and Level calculation
    const finalTotalXp = xpBefore + xpBreakdown.totalXpEarned;
    const levelTransition = calculateLevelUp(xpBefore, finalTotalXp);

    // 6. Trophy calculation
    const trophyStageBefore = currentState.trophyStage || 1;
    const trophyStageAfter = calculateTrophyStage(
      levelTransition.levelAfter,
      updatedUnlockedBadges.length
    );
    const trophyUpgraded = trophyStageAfter > trophyStageBefore;

    // 7. Assemble Updated GamificationState
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
    };

    // 8. Assemble Updated UserProfile for 100% synchronization
    const updatedProfile: UserProfile = {
      ...profile,
      xp: finalTotalXp,
      level: levelTransition.levelAfter,
      streakDays: streakResult.currentStreak,
    };

    // 9. Persist atomically
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
    const badgeEval = evaluateBadges({
      state: currentState,
      mistakesResolvedCount: 1,
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
    const newLevel = getLevelFromXp(newXp);
    const newTrophyStage = calculateTrophyStage(newLevel, updatedUnlockedBadges.length);

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
  }> {
    const state = await this.getState();
    const levelInfo = getLevelProgress(state.totalXp);
    const trophyInfo = getTrophyInfo(state.currentLevel, state.unlockedBadges.length);

    // Evaluate all badges with progress against current state
    const { allBadgesWithProgress } = evaluateBadges({ state });

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
    };
  }
}

export const gamificationEngine = new GamificationEngineService();

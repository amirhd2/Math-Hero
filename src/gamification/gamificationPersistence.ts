/**
 * Persistence layer for Gamification State in Math Hero.
 * Bridges IndexedDB with LocalStorage fallback, ensuring seamless offline
 * execution, instant reloads, and backward compatibility.
 */

import { storage } from '../utils/storage';
import { GamificationState, GamificationStats } from './gamificationTypes';
import { getLevelFromXp } from './levelCalculator';
import { calculateTrophyStage } from './trophyManager';
import { getLocalCalendarDate } from './streakManager';
import { BADGE_REGISTRY } from './badgeRegistry';
import { OperationType } from '../types';
import {
  extractOperationBreakdownFromQuizResult,
  PRIMARY_OPERATIONS,
} from '../utils/operationEvidence';

const GAMIFICATION_LOCAL_STORAGE_KEY = 'math_hero_gamification_state_v1';

export const INITIAL_GAMIFICATION_STATS: GamificationStats = {
  totalQuizzesCompleted: 0,
  totalQuestionsAnswered: 0,
  totalCorrectAnswers: 0,
  perfectQuizzesCount: 0,
  smartReviewsCount: 0,
  practiceCount: 0,
  testCount: 0,
  mistakesResolvedCount: 0,
  consecutiveImprovements: 0,
  operationCorrectCounts: {
    addition: 0,
    subtraction: 0,
    multiplication: 0,
    division: 0,
    mixed: 0,
  },
  operationAccuracies: {
    addition: 0,
    subtraction: 0,
    multiplication: 0,
    division: 0,
    mixed: 0,
  },
};

export const INITIAL_GAMIFICATION_STATE: GamificationState = {
  totalXp: 0,
  currentLevel: 1,
  currentStreak: 1,
  bestStreak: 1,
  unlockedBadges: [],
  badgeUnlockTimestamps: {},
  trophyStage: 1,
  lastActivityDate: null,
  lastActivityAt: null,
  stats: INITIAL_GAMIFICATION_STATS,
  processedQuizIds: [],
  awardedMasteryBonuses: [],
};

/**
 * Loads GamificationState from storage, or bootstraps it from existing
 * quiz results and user profile if loading for the first time.
 */
export async function loadGamificationState(): Promise<GamificationState> {
  // 1. Check localStorage first for instant synchronous/cached access
  try {
    const raw = localStorage.getItem(GAMIFICATION_LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as GamificationState;
      if (parsed && typeof parsed.totalXp === 'number') {
        return mergeWithDefaults(parsed);
      }
    }
  } catch (err) {
    console.warn('Could not read gamification state from localStorage:', err);
  }

  // 2. Bootstrap state from storage results and profile
  try {
    const profile = await storage.getProfile();
    const results = await storage.getResults();

    const opCorrectCounts: Record<OperationType, number> = {
      addition: 0,
      subtraction: 0,
      multiplication: 0,
      division: 0,
      mixed: 0,
    };
    const opQuestionCounts: Record<OperationType, number> = {
      addition: 0,
      subtraction: 0,
      multiplication: 0,
      division: 0,
      mixed: 0,
    };

    results.forEach((r) => {
      const breakdown = extractOperationBreakdownFromQuizResult(r);
      PRIMARY_OPERATIONS.forEach((op) => {
        const stat = breakdown[op];
        if (stat && stat.totalQuestions > 0) {
          opCorrectCounts[op] += stat.correctCount;
          opQuestionCounts[op] += stat.totalQuestions;
        }
      });
      if (r.operation === 'mixed') {
        opCorrectCounts.mixed += r.correctCount || 0;
        opQuestionCounts.mixed += r.totalQuestions || 0;
      }
    });

    const bootstrappedStats: GamificationStats = {
      ...INITIAL_GAMIFICATION_STATS,
      totalQuizzesCompleted: results.length,
      totalQuestionsAnswered: results.reduce((acc, r) => acc + (r.totalQuestions || 0), 0),
      totalCorrectAnswers: results.reduce((acc, r) => acc + (r.correctCount || 0), 0),
      perfectQuizzesCount: results.filter(
        (r) => (r.totalQuestions || 0) >= 5 && r.correctCount === r.totalQuestions
      ).length,
      smartReviewsCount: results.filter((r) => r.source === 'smart-review').length,
      practiceCount: results.filter((r) => r.mode === 'practice').length,
      testCount: results.filter((r) => r.mode === 'test').length,
      mistakesResolvedCount: 0,
      consecutiveImprovements: 0,
      operationCorrectCounts: opCorrectCounts,
      operationAccuracies: {
        addition: opQuestionCounts.addition > 0 ? Math.round((opCorrectCounts.addition / opQuestionCounts.addition) * 100) : 0,
        subtraction: opQuestionCounts.subtraction > 0 ? Math.round((opCorrectCounts.subtraction / opQuestionCounts.subtraction) * 100) : 0,
        multiplication: opQuestionCounts.multiplication > 0 ? Math.round((opCorrectCounts.multiplication / opQuestionCounts.multiplication) * 100) : 0,
        division: opQuestionCounts.division > 0 ? Math.round((opCorrectCounts.division / opQuestionCounts.division) * 100) : 0,
        mixed: opQuestionCounts.mixed > 0 ? Math.round((opCorrectCounts.mixed / opQuestionCounts.mixed) * 100) : 0,
      },
    };

    // Evaluate basic starting unlocked badges based on history
    const unlockedBadges: string[] = [];
    const timestamps: Record<string, number> = {};
    const now = Date.now();

    if (bootstrappedStats.totalQuizzesCompleted >= 1) {
      unlockedBadges.push('first_step');
      timestamps['first_step'] = now;
    }
    if (bootstrappedStats.totalQuizzesCompleted >= 5) {
      unlockedBadges.push('practice_5');
      timestamps['practice_5'] = now;
    }
    if (bootstrappedStats.perfectQuizzesCount >= 1) {
      unlockedBadges.push('first_perfect');
      timestamps['first_perfect'] = now;
    }
    if (bootstrappedStats.totalCorrectAnswers >= 20) {
      unlockedBadges.push('correct_20');
      timestamps['correct_20'] = now;
    }

    const totalXp = Math.max(profile.xp || 0, bootstrappedStats.totalCorrectAnswers * 10);
    const currentLevel = Math.max(profile.level || 1, getLevelFromXp(totalXp));
    const currentStreak = Math.max(1, profile.streakDays || 1);
    const bestStreak = Math.max(currentStreak, profile.streakDays || 1);
    const trophyStage = calculateTrophyStage(currentLevel, unlockedBadges.length);

    const latestResult = results.sort((a, b) => b.timestamp - a.timestamp)[0];
    const lastActivityDate = latestResult ? getLocalCalendarDate(latestResult.timestamp) : null;

    const state: GamificationState = {
      totalXp,
      currentLevel,
      currentStreak,
      bestStreak,
      unlockedBadges,
      badgeUnlockTimestamps: timestamps,
      trophyStage,
      lastActivityDate,
      lastActivityAt: latestResult ? latestResult.timestamp : null,
      stats: bootstrappedStats,
      processedQuizIds: results.map((r) => r.id),
      awardedMasteryBonuses: [],
    };

    await saveGamificationState(state);
    return state;
  } catch (err) {
    console.error('Failed to bootstrap gamification state:', err);
    return INITIAL_GAMIFICATION_STATE;
  }
}

/**
 * Saves GamificationState atomically to LocalStorage and ensures persistence.
 */
export async function saveGamificationState(state: GamificationState): Promise<void> {
  try {
    const serialized = JSON.stringify(state);
    localStorage.setItem(GAMIFICATION_LOCAL_STORAGE_KEY, serialized);
  } catch (err) {
    console.warn('Could not save gamification state to localStorage:', err);
  }
}

function mergeWithDefaults(saved: Partial<GamificationState>): GamificationState {
  return {
    totalXp: saved.totalXp ?? INITIAL_GAMIFICATION_STATE.totalXp,
    currentLevel: saved.currentLevel ?? INITIAL_GAMIFICATION_STATE.currentLevel,
    currentStreak: saved.currentStreak ?? INITIAL_GAMIFICATION_STATE.currentStreak,
    bestStreak: saved.bestStreak ?? INITIAL_GAMIFICATION_STATE.bestStreak,
    unlockedBadges: Array.isArray(saved.unlockedBadges) ? saved.unlockedBadges : [],
    badgeUnlockTimestamps: saved.badgeUnlockTimestamps || {},
    trophyStage: saved.trophyStage ?? INITIAL_GAMIFICATION_STATE.trophyStage,
    lastActivityDate: saved.lastActivityDate ?? null,
    lastActivityAt: saved.lastActivityAt ?? null,
    stats: {
      ...INITIAL_GAMIFICATION_STATS,
      ...(saved.stats || {}),
      operationCorrectCounts: {
        ...INITIAL_GAMIFICATION_STATS.operationCorrectCounts,
        ...(saved.stats?.operationCorrectCounts || {}),
      },
      operationAccuracies: {
        ...INITIAL_GAMIFICATION_STATS.operationAccuracies,
        ...(saved.stats?.operationAccuracies || {}),
      },
    },
    processedQuizIds: Array.isArray(saved.processedQuizIds) ? saved.processedQuizIds : [],
    awardedMasteryBonuses: Array.isArray(saved.awardedMasteryBonuses) ? saved.awardedMasteryBonuses : [],
  };
}

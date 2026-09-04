/**
 * Centralized Achievement & Badge Engine for Math Hero.
 * Evaluates all data-driven requirements in BADGE_REGISTRY against
 * the user's updated stats, quiz results, and session history.
 */

import { QuizResult } from '../types';
import { BADGE_REGISTRY } from './badgeRegistry';
import { Badge, GamificationState, GamificationStats } from './gamificationTypes';

export interface EvaluateBadgesInput {
  state: GamificationState;
  latestResult?: QuizResult;
  previousResults?: QuizResult[];
  mistakesResolvedCount?: number;
}

export interface EvaluateBadgesOutput {
  newlyUnlockedBadges: Badge[];
  allBadgesWithProgress: Badge[];
  updatedStats: GamificationStats;
}

/**
 * Evaluates all badges and updates cumulative stats.
 */
export function evaluateBadges(input: EvaluateBadgesInput): EvaluateBadgesOutput {
  const { state, latestResult, previousResults = [], mistakesResolvedCount = 0 } = input;

  // Clone stats for atomic accumulation
  const stats: GamificationStats = {
    totalQuizzesCompleted: state.stats.totalQuizzesCompleted,
    totalQuestionsAnswered: state.stats.totalQuestionsAnswered,
    totalCorrectAnswers: state.stats.totalCorrectAnswers,
    perfectQuizzesCount: state.stats.perfectQuizzesCount,
    smartReviewsCount: state.stats.smartReviewsCount,
    practiceCount: state.stats.practiceCount,
    testCount: state.stats.testCount,
    mistakesResolvedCount: state.stats.mistakesResolvedCount + mistakesResolvedCount,
    consecutiveImprovements: state.stats.consecutiveImprovements,
    operationCorrectCounts: { ...state.stats.operationCorrectCounts },
    operationAccuracies: { ...state.stats.operationAccuracies },
  };

  // If a new quiz was completed in this evaluation event:
  if (latestResult) {
    stats.totalQuizzesCompleted += 1;
    stats.totalQuestionsAnswered += latestResult.totalQuestions || 0;
    stats.totalCorrectAnswers += latestResult.correctCount || 0;

    if (latestResult.mode === 'test') {
      stats.testCount += 1;
    } else {
      stats.practiceCount += 1;
    }

    if (latestResult.source === 'smart-review') {
      stats.smartReviewsCount += 1;
    }

    const accuracy = Math.round(
      ((latestResult.correctCount || 0) / Math.max(1, latestResult.totalQuestions || 1)) * 100
    );

    if (accuracy === 100 && (latestResult.totalQuestions || 0) >= 5) {
      stats.perfectQuizzesCount += 1;
    }

    // Consecutive improvements check
    if (previousResults.length > 0) {
      const prev = previousResults[0]; // sorted newest first
      const prevAcc = Math.round(
        ((prev.correctCount || 0) / Math.max(1, prev.totalQuestions || 1)) * 100
      );
      if (accuracy >= prevAcc || accuracy >= 85) {
        stats.consecutiveImprovements += 1;
      } else {
        stats.consecutiveImprovements = 0;
      }
    } else if (accuracy >= 80) {
      stats.consecutiveImprovements = 1;
    }

    // Operation specific accumulation
    const op = latestResult.operation;
    if (op && op !== 'mixed') {
      stats.operationCorrectCounts[op] =
        (stats.operationCorrectCounts[op] || 0) + (latestResult.correctCount || 0);

      // Re-calculate rolling operation accuracy from previous results + current
      const allOpQuizzes = [latestResult, ...previousResults.filter((r) => r.operation === op)];
      const totalOpQ = allOpQuizzes.reduce((acc, r) => acc + (r.totalQuestions || 0), 0);
      const totalOpC = allOpQuizzes.reduce((acc, r) => acc + (r.correctCount || 0), 0);
      stats.operationAccuracies[op] = totalOpQ > 0 ? Math.round((totalOpC / totalOpQ) * 100) : accuracy;
    }
  }

  const newlyUnlockedBadges: Badge[] = [];
  const alreadyUnlockedSet = new Set(state.unlockedBadges);

  const allBadgesWithProgress = BADGE_REGISTRY.map((badgeDef) => {
    const isAlreadyUnlocked = alreadyUnlockedSet.has(badgeDef.id);
    let progress = 0;
    const maxProgress = badgeDef.requirement.target;
    let unlocked = isAlreadyUnlocked;

    switch (badgeDef.requirement.type) {
      case 'quizzes_count':
        progress = stats.totalQuizzesCompleted;
        if (progress >= maxProgress) unlocked = true;
        break;

      case 'correct_answers':
        progress = stats.totalCorrectAnswers;
        if (progress >= maxProgress) unlocked = true;
        break;

      case 'perfect_quizzes':
        progress = stats.perfectQuizzesCount;
        if (progress >= maxProgress) unlocked = true;
        break;

      case 'streak_days':
        progress = Math.max(state.currentStreak, state.bestStreak);
        if (progress >= maxProgress) unlocked = true;
        break;

      case 'level_reached':
        progress = state.currentLevel;
        if (progress >= maxProgress) unlocked = true;
        break;

      case 'operation_correct': {
        const op = badgeDef.requirement.operation;
        progress = op ? (stats.operationCorrectCounts[op] || 0) : 0;
        if (progress >= maxProgress) unlocked = true;
        break;
      }

      case 'operation_mastery': {
        const op = badgeDef.requirement.operation;
        const correct = op ? (stats.operationCorrectCounts[op] || 0) : 0;
        const acc = op ? (stats.operationAccuracies[op] || 0) : 0;
        const minAcc = badgeDef.requirement.minAccuracy || 80;

        progress = correct;
        if (correct >= maxProgress && acc >= minAcc) {
          unlocked = true;
        }
        break;
      }

      case 'comeback_improvement': {
        if (latestResult && previousResults.length > 0) {
          const prev = previousResults[0];
          const currAcc = Math.round(
            ((latestResult.correctCount || 0) / Math.max(1, latestResult.totalQuestions || 1)) * 100
          );
          const prevAcc = Math.round(
            ((prev.correctCount || 0) / Math.max(1, prev.totalQuestions || 1)) * 100
          );
          const delta = currAcc - prevAcc;
          progress = Math.max(0, delta);
          if (delta >= maxProgress) {
            unlocked = true;
          }
        }
        break;
      }

      case 'getting_stronger':
        progress = stats.consecutiveImprovements;
        if (progress >= maxProgress) unlocked = true;
        break;

      case 'resolve_mistakes':
        progress = stats.mistakesResolvedCount;
        if (progress >= maxProgress) unlocked = true;
        break;

      case 'smart_review_count':
        progress = stats.smartReviewsCount;
        if (progress >= maxProgress) unlocked = true;
        break;

      case 'all_operations_tried': {
        const ops: ('addition' | 'subtraction' | 'multiplication' | 'division')[] = [
          'addition',
          'subtraction',
          'multiplication',
          'division',
        ];
        const count = ops.filter((o) => (stats.operationCorrectCounts[o] || 0) > 0).length;
        progress = count;
        if (count >= 4) unlocked = true;
        break;
      }

      case 'fast_accurate_quiz': {
        if (latestResult) {
          const qCount = latestResult.totalQuestions || 0;
          const acc = Math.round(
            ((latestResult.correctCount || 0) / Math.max(1, latestResult.totalQuestions || 1)) * 100
          );
          if (qCount >= (badgeDef.requirement.minQuestions || 10) && acc >= (badgeDef.requirement.minAccuracy || 90)) {
            unlocked = true;
            progress = maxProgress;
          } else {
            progress = Math.min(qCount, maxProgress);
          }
        }
        break;
      }

      case 'math_hero_grand': {
        const unlockedCount = state.unlockedBadges.length;
        progress = Math.min(unlockedCount, maxProgress);
        if (state.currentLevel >= 15 && unlockedCount >= 15) {
          unlocked = true;
        }
        break;
      }

      default:
        progress = 0;
    }

    const badge: Badge = {
      ...badgeDef,
      unlocked,
      progress: Math.min(progress, maxProgress),
      maxProgress,
      unlockedAt: isAlreadyUnlocked
        ? state.badgeUnlockTimestamps[badgeDef.id] || Date.now()
        : unlocked
        ? Date.now()
        : undefined,
    };

    if (unlocked && !isAlreadyUnlocked) {
      newlyUnlockedBadges.push(badge);
    }

    return badge;
  });

  return {
    newlyUnlockedBadges,
    allBadgesWithProgress,
    updatedStats: stats,
  };
}

/**
 * Main Statistics Calculator for Math Hero.
 * Calculates comprehensive summary aggregates, per-operation breakdowns,
 * response time averages, streak metrics, and prepares Smart Review data.
 */

import { OperationType, QuizResult, MistakeRecord, UserProfile } from '../types';
import {
  extractOperationBreakdownFromQuizResult,
  PRIMARY_OPERATIONS,
} from '../utils/operationEvidence';
import {
  StatisticsSummary,
  OperationStatistics,
  TimeRange,
  SmartReviewPreparedData,
} from './statisticsTypes';
import { getPerformanceCategory, analyzeInsights } from './performanceAnalyzer';
import { calculateTrendPoints } from './trendCalculator';

const OPERATION_METADATA: Record<
  OperationType,
  { titleFa: string; symbol: string; icon: string; color: string }
> = {
  addition: {
    titleFa: 'جمع',
    symbol: '➕',
    icon: '➕',
    color: 'emerald',
  },
  subtraction: {
    titleFa: 'تفریق',
    symbol: '➖',
    icon: '➖',
    color: 'sky',
  },
  multiplication: {
    titleFa: 'ضرب',
    symbol: '✖️',
    icon: '✖️',
    color: 'amber',
  },
  division: {
    titleFa: 'تقسیم',
    symbol: '➗',
    icon: '➗',
    color: 'violet',
  },
  mixed: {
    titleFa: 'مخلوط',
    symbol: '🎯',
    icon: '🎯',
    color: 'indigo',
  },
};

export function calculateStatisticsSummary(
  allResults: QuizResult[],
  mistakes: MistakeRecord[],
  profile: UserProfile,
  timeRange: TimeRange = 'all'
): StatisticsSummary {
  const now = Date.now();

  // Filter results according to timeRange
  let filteredResults = [...allResults];
  if (timeRange === '7days') {
    const cutoff = now - 7 * 24 * 60 * 60 * 1000;
    filteredResults = allResults.filter((r) => r.timestamp >= cutoff);
  } else if (timeRange === '30days') {
    const cutoff = now - 30 * 24 * 60 * 60 * 1000;
    filteredResults = allResults.filter((r) => r.timestamp >= cutoff);
  }

  // 1. Overall Aggregates
  let totalQuestions = 0;
  let correctAnswers = 0;
  let incorrectAnswers = 0;
  let totalXp = 0;
  let totalResponseTimeMs = 0;
  let responseTimeCount = 0;
  let perfectQuizzesCount = 0;
  let practiceQuizzesCount = 0;
  let testQuizzesCount = 0;
  let practiceQuestions = 0;
  let practiceCorrect = 0;
  let testQuestions = 0;
  let testCorrect = 0;

  // Initialize operation stats accumulator
  const opAccumulators: Record<
    OperationType,
    {
      totalQuestions: number;
      correctAnswers: number;
      incorrectAnswers: number;
      totalTimeMs: number;
      timeCount: number;
      lastPracticedAt: number | null;
      practiceCount: number;
      testCount: number;
      mistakesCount: number;
    }
  > = {
    addition: {
      totalQuestions: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      totalTimeMs: 0,
      timeCount: 0,
      lastPracticedAt: null,
      practiceCount: 0,
      testCount: 0,
      mistakesCount: 0,
    },
    subtraction: {
      totalQuestions: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      totalTimeMs: 0,
      timeCount: 0,
      lastPracticedAt: null,
      practiceCount: 0,
      testCount: 0,
      mistakesCount: 0,
    },
    multiplication: {
      totalQuestions: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      totalTimeMs: 0,
      timeCount: 0,
      lastPracticedAt: null,
      practiceCount: 0,
      testCount: 0,
      mistakesCount: 0,
    },
    division: {
      totalQuestions: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      totalTimeMs: 0,
      timeCount: 0,
      lastPracticedAt: null,
      practiceCount: 0,
      testCount: 0,
      mistakesCount: 0,
    },
    mixed: {
      totalQuestions: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      totalTimeMs: 0,
      timeCount: 0,
      lastPracticedAt: null,
      practiceCount: 0,
      testCount: 0,
      mistakesCount: 0,
    },
  };

  // Process quiz results
  for (const r of filteredResults) {
    const qCount = r.totalQuestions || 0;
    const cCount = r.correctCount || 0;
    const iCount = r.incorrectCount || (qCount - cCount);

    totalQuestions += qCount;
    correctAnswers += cCount;
    incorrectAnswers += iCount;
    totalXp += r.xpEarned || 0;

    if (r.score === 100) {
      perfectQuizzesCount += 1;
    }

    const isTest = r.mode === 'test';
    if (isTest) {
      testQuizzesCount += 1;
      testQuestions += qCount;
      testCorrect += cCount;
    } else {
      practiceQuizzesCount += 1;
      practiceQuestions += qCount;
      practiceCorrect += cCount;
    }

    // Time calculations
    if (r.timeElapsed && r.timeElapsed > 0 && qCount > 0) {
      const avgMs = (r.timeElapsed * 1000) / qCount;
      totalResponseTimeMs += avgMs * qCount;
      responseTimeCount += qCount;
    }

    // Operation breakdown
    const breakdown = extractOperationBreakdownFromQuizResult(r);
    for (const op of PRIMARY_OPERATIONS) {
      const opStat = breakdown[op];
      if (opStat && opStat.totalQuestions > 0 && opAccumulators[op]) {
        opAccumulators[op].totalQuestions += opStat.totalQuestions;
        opAccumulators[op].correctAnswers += opStat.correctCount;
        opAccumulators[op].incorrectAnswers += opStat.incorrectCount;
        if (isTest) {
          opAccumulators[op].testCount += 1;
        } else {
          opAccumulators[op].practiceCount += 1;
        }
        if (opStat.timeSpentMs && opStat.timeSpentMs > 0) {
          opAccumulators[op].totalTimeMs += opStat.timeSpentMs;
          opAccumulators[op].timeCount += opStat.totalQuestions;
        }
        if (!opAccumulators[op].lastPracticedAt || r.timestamp > opAccumulators[op].lastPracticedAt!) {
          opAccumulators[op].lastPracticedAt = r.timestamp;
        }
      }
    }

    if (r.operation === 'mixed' && opAccumulators['mixed']) {
      opAccumulators['mixed'].totalQuestions += qCount;
      opAccumulators['mixed'].correctAnswers += cCount;
      opAccumulators['mixed'].incorrectAnswers += iCount;
      if (isTest) opAccumulators['mixed'].testCount += 1;
      else opAccumulators['mixed'].practiceCount += 1;
      if (r.timeElapsed && r.timeElapsed > 0) {
        opAccumulators['mixed'].totalTimeMs += r.timeElapsed * 1000;
        opAccumulators['mixed'].timeCount += qCount;
      }
      if (!opAccumulators['mixed'].lastPracticedAt || r.timestamp > opAccumulators['mixed'].lastPracticedAt!) {
        opAccumulators['mixed'].lastPracticedAt = r.timestamp;
      }
    }
  }

  // Count mistakes per operation
  for (const m of mistakes) {
    const op = m.question?.operation;
    if (op && opAccumulators[op]) {
      opAccumulators[op].mistakesCount += 1;
    }
  }

  const accuracyPercent = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  const practiceAccuracyPercent =
    practiceQuestions > 0 ? Math.round((practiceCorrect / practiceQuestions) * 100) : 0;
  const testAccuracyPercent =
    testQuestions > 0 ? Math.round((testCorrect / testQuestions) * 100) : 0;
  const averageResponseTimeMs =
    responseTimeCount > 0 ? Math.round(totalResponseTimeMs / responseTimeCount) : 0;

  // Build OperationStatistics map and list (focusing on primary 4 math operations)
  const primaryOperations: OperationType[] = ['addition', 'subtraction', 'multiplication', 'division'];
  const operationStats: Record<OperationType, OperationStatistics> = {} as any;
  const operationsList: OperationStatistics[] = [];

  for (const opKey of [...primaryOperations, 'mixed' as OperationType]) {
    const data = opAccumulators[opKey];
    const meta = OPERATION_METADATA[opKey] || OPERATION_METADATA.addition;
    const acc = data.totalQuestions > 0 ? Math.round((data.correctAnswers / data.totalQuestions) * 100) : 0;
    const tierConfig = getPerformanceCategory(acc);
    const avgTime = data.timeCount > 0 ? Math.round(data.totalTimeMs / data.timeCount) : 0;

    const stat: OperationStatistics = {
      operation: opKey,
      titleFa: meta.titleFa,
      symbol: meta.symbol,
      icon: meta.icon,
      color: meta.color,
      totalQuestions: data.totalQuestions,
      correctAnswers: data.correctAnswers,
      incorrectAnswers: data.incorrectAnswers,
      accuracyPercent: acc,
      tier: tierConfig.tier,
      tierConfig,
      averageResponseTimeMs: avgTime,
      lastPracticedAt: data.lastPracticedAt,
      practiceCount: data.practiceCount,
      testCount: data.testCount,
      mistakesCount: data.mistakesCount,
    };

    operationStats[opKey] = stat;
    if (primaryOperations.includes(opKey)) {
      operationsList.push(stat);
    }
  }

  // Calculate Daily Trend Points for Chart
  const trendPoints = calculateTrendPoints(filteredResults, timeRange);

  // Generate Insights
  const insights = analyzeInsights(operationsList, filteredResults, accuracyPercent);

  // Recent results sorted latest first (limit top 10 for quick preview)
  const recentResults = [...allResults].sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);

  // Streaks from profile or calculated from session timestamps
  const currentStreak = profile.streakDays || 1;
  const bestStreak = Math.max(currentStreak, Math.min(profile.level * 2, 30));

  return {
    totalQuestions,
    totalQuizzes: filteredResults.length,
    correctAnswers,
    incorrectAnswers,
    accuracyPercent,
    totalXp,
    currentStreak,
    bestStreak,
    averageResponseTimeMs,
    perfectQuizzesCount,
    practiceQuizzesCount,
    testQuizzesCount,
    practiceAccuracyPercent,
    testAccuracyPercent,
    operationStats,
    operationsList,
    trendPoints,
    insights,
    recentResults,
    timeRange,
  };
}

/**
 * Prepares clean structured telemetry data for Smart Review (Prompt 07)
 */
export function prepareSmartReviewData(
  summary: StatisticsSummary,
  unresolvedMistakes: MistakeRecord[]
): SmartReviewPreparedData {
  const accuracies: Record<OperationType, number> = {
    addition: summary.operationStats.addition.accuracyPercent,
    subtraction: summary.operationStats.subtraction.accuracyPercent,
    multiplication: summary.operationStats.multiplication.accuracyPercent,
    division: summary.operationStats.division.accuracyPercent,
    mixed: summary.operationStats.mixed.accuracyPercent,
  };

  const weakestOperations = summary.operationsList
    .filter((op) => op.totalQuestions > 0 && op.accuracyPercent < 80)
    .sort((a, b) => a.accuracyPercent - b.accuracyPercent)
    .map((op) => op.operation);

  const frequentMistakeOperations = summary.operationsList
    .filter((op) => op.mistakesCount > 0)
    .sort((a, b) => b.mistakesCount - a.mistakesCount)
    .map((op) => op.operation);

  const avgTimes: Record<OperationType, number> = {
    addition: summary.operationStats.addition.averageResponseTimeMs,
    subtraction: summary.operationStats.subtraction.averageResponseTimeMs,
    multiplication: summary.operationStats.multiplication.averageResponseTimeMs,
    division: summary.operationStats.division.averageResponseTimeMs,
    mixed: summary.operationStats.mixed.averageResponseTimeMs,
  };

  const trend =
    summary.insights.trendType === 'improving'
      ? 'up'
      : summary.insights.trendType === 'needs_focus'
      ? 'down'
      : 'stable';

  let lastTimestamp: number | null = null;
  if (summary.recentResults.length > 0) {
    lastTimestamp = summary.recentResults[0].timestamp;
  }

  return {
    operationAccuracies: accuracies,
    weakestOperations,
    frequentMistakeOperations,
    totalUnresolvedMistakes: unresolvedMistakes.length,
    recentMistakes: unresolvedMistakes.slice(0, 20),
    averageResponseTimeByOp: avgTimes,
    improvementTrend: trend,
    lastPracticedTimestamp: lastTimestamp,
  };
}

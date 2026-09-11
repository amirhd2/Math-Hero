/**
 * Types and interfaces for the Math Hero Statistics & Learning Progress engine.
 * Prepares data structures for Statistics screens and future Smart Review (Prompt 07).
 */

import { OperationType, QuizResult, MistakeRecord } from '../types';

export type TimeRange = '7days' | '30days' | 'all';

export type PerformanceTier = 'excellent' | 'strong' | 'keep_practicing' | 'needs_practice';

export interface PerformanceCategoryConfig {
  tier: PerformanceTier;
  labelFa: string;
  minPercent: number;
  maxPercent: number;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  barColor: string;
  icon: string;
  descriptionFa: string;
}

export interface OperationStatistics {
  operation: OperationType;
  titleFa: string;
  symbol: string;
  icon: string;
  color: string;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracyPercent: number;
  tier: PerformanceTier;
  tierConfig: PerformanceCategoryConfig;
  averageResponseTimeMs: number;
  lastPracticedAt: number | null;
  practiceCount: number;
  testCount: number;
  mistakesCount: number;
}

export interface DailyTrendPoint {
  dateKey: string; // YYYY-MM-DD or formatted Persian date
  labelFa: string;
  timestamp: number;
  quizCount: number;
  totalQuestions: number;
  correctAnswers: number;
  accuracyPercent: number;
  xpEarned: number;
}

export interface PerformanceInsights {
  strongestOperation: OperationStatistics | null;
  needsPracticeOperation: OperationStatistics | null;
  trendTextFa: string;
  trendType: 'improving' | 'steady' | 'needs_focus' | 'new_hero';
  trendPercentDelta: number;
  recommendedActionFa: string;
  recommendedOp: OperationType | null;
}

export interface StatisticsSummary {
  totalQuestions: number;
  totalQuizzes: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracyPercent: number;
  totalXp: number;
  currentStreak: number;
  bestStreak: number;
  averageResponseTimeMs: number;
  perfectQuizzesCount: number;
  practiceQuizzesCount: number;
  testQuizzesCount: number;
  practiceAccuracyPercent: number;
  testAccuracyPercent: number;
  operationStats: Record<OperationType, OperationStatistics>;
  operationsList: OperationStatistics[];
  trendPoints: DailyTrendPoint[];
  insights: PerformanceInsights;
  recentResults: QuizResult[];
  timeRange: TimeRange;
}

/**
 * Smart Review Structured Data payload (prepared for Prompt 07)
 */
export interface SmartReviewPreparedData {
  operationAccuracies: Record<OperationType, number>;
  weakestOperations: OperationType[];
  frequentMistakeOperations: OperationType[];
  totalUnresolvedMistakes: number;
  recentMistakes: MistakeRecord[];
  averageResponseTimeByOp: Record<OperationType, number>;
  improvementTrend: 'up' | 'stable' | 'down';
  lastPracticedTimestamp: number | null;
}

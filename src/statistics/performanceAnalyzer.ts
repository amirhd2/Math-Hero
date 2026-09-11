/**
 * Performance Analyzer for Math Hero Statistics.
 * Evaluates performance tiers, strongest operations, operations needing practice,
 * and constructive child-friendly learning insights.
 */

import { QuizResult } from '../types';
import {
  PerformanceTier,
  PerformanceCategoryConfig,
  OperationStatistics,
  PerformanceInsights,
} from './statisticsTypes';

export const PERFORMANCE_CATEGORIES: Record<PerformanceTier, PerformanceCategoryConfig> = {
  excellent: {
    tier: 'excellent',
    labelFa: 'عالی و درخشان',
    minPercent: 90,
    maxPercent: 100,
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    badgeBorder: 'border-emerald-300 dark:border-emerald-800',
    barColor: 'bg-emerald-500',
    icon: '🌟',
    descriptionFa: 'تسلط فوق‌العاده و شگفت‌انگیز!',
  },
  strong: {
    tier: 'strong',
    labelFa: 'قوی و مسلط',
    minPercent: 75,
    maxPercent: 89,
    badgeBg: 'bg-indigo-50 dark:bg-indigo-950/60',
    badgeText: 'text-indigo-700 dark:text-indigo-300',
    badgeBorder: 'border-indigo-300 dark:border-indigo-800',
    barColor: 'bg-indigo-500',
    icon: '💪',
    descriptionFa: 'خیلی خوب و با اعتمادبه‌نفس!',
  },
  keep_practicing: {
    tier: 'keep_practicing',
    labelFa: 'در حال پیشرفت',
    minPercent: 60,
    maxPercent: 74,
    badgeBg: 'bg-amber-50 dark:bg-amber-950/60',
    badgeText: 'text-amber-800 dark:text-amber-300',
    badgeBorder: 'border-amber-300 dark:border-amber-800',
    barColor: 'bg-amber-500',
    icon: '🚀',
    descriptionFa: 'با چند تمرین ساده عالی می‌شی!',
  },
  needs_practice: {
    tier: 'needs_practice',
    labelFa: 'نیاز به تمرین',
    minPercent: 0,
    maxPercent: 59,
    badgeBg: 'bg-rose-50 dark:bg-rose-950/60',
    badgeText: 'text-rose-700 dark:text-rose-300',
    badgeBorder: 'border-rose-300 dark:border-rose-800',
    barColor: 'bg-rose-500',
    icon: '🎯',
    descriptionFa: 'بیا با هم بیشتر تمرین کنیم تا یاد بگیری!',
  },
};

export function getPerformanceCategory(percent: number): PerformanceCategoryConfig {
  if (percent >= 90) return PERFORMANCE_CATEGORIES.excellent;
  if (percent >= 75) return PERFORMANCE_CATEGORIES.strong;
  if (percent >= 60) return PERFORMANCE_CATEGORIES.keep_practicing;
  return PERFORMANCE_CATEGORIES.needs_practice;
}

export function analyzeInsights(
  operationList: OperationStatistics[],
  results: QuizResult[],
  overallAccuracy: number
): PerformanceInsights {
  // Only consider operations with actual practice data
  const practicedOps = operationList.filter((op) => op.totalQuestions > 0);

  if (practicedOps.length === 0 || results.length === 0) {
    return {
      strongestOperation: null,
      needsPracticeOperation: null,
      trendTextFa: 'مسیر یادگیری ریاضی تازه آغاز شده است! با اولین تمرین، پیشرفت‌هایت اینجا ثبت می‌شوند.',
      trendType: 'new_hero',
      trendPercentDelta: 0,
      recommendedActionFa: 'شروع یک تمرین دلخواه',
      recommendedOp: null,
    };
  }

  // 1. Strongest Operation (highest accuracy, or most questions if tied)
  const sortedByStrength = [...practicedOps].sort((a, b) => {
    if (b.accuracyPercent !== a.accuracyPercent) {
      return b.accuracyPercent - a.accuracyPercent;
    }
    return b.totalQuestions - a.totalQuestions;
  });
  const strongest = sortedByStrength[0];

  // 2. Operation Needing Practice (lowest accuracy or unpracticed operation)
  const unpracticedOps = operationList.filter((op) => op.totalQuestions === 0);
  let needsPractice: OperationStatistics | null = null;

  if (practicedOps.some((op) => op.accuracyPercent < 80)) {
    // Pick the one with lowest accuracy under 80%
    const lowestAccuracy = [...practicedOps].sort((a, b) => a.accuracyPercent - b.accuracyPercent)[0];
    needsPractice = lowestAccuracy;
  } else if (unpracticedOps.length > 0) {
    // If all practiced ops are >= 80%, recommend an unpracticed one
    needsPractice = unpracticedOps[0];
  } else {
    // If all are practiced and strong, pick the relatively lowest
    needsPractice = sortedByStrength[sortedByStrength.length - 1];
  }

  // 3. Trend calculation (compare recent half of results with older half)
  let trendType: 'improving' | 'steady' | 'needs_focus' = 'steady';
  let trendDelta = 0;
  let trendTextFa = '';

  if (results.length >= 2) {
    // Sort results by timestamp ascending
    const chronological = [...results].sort((a, b) => a.timestamp - b.timestamp);
    const mid = Math.floor(chronological.length / 2);
    const olderSlice = chronological.slice(0, mid);
    const newerSlice = chronological.slice(mid);

    const oldTotalQ = olderSlice.reduce((acc, r) => acc + (r.totalQuestions || 0), 0);
    const oldCorrect = olderSlice.reduce((acc, r) => acc + (r.correctCount || 0), 0);
    const oldAcc = oldTotalQ > 0 ? Math.round((oldCorrect / oldTotalQ) * 100) : 0;

    const newTotalQ = newerSlice.reduce((acc, r) => acc + (r.totalQuestions || 0), 0);
    const newCorrect = newerSlice.reduce((acc, r) => acc + (r.correctCount || 0), 0);
    const newAcc = newTotalQ > 0 ? Math.round((newCorrect / newTotalQ) * 100) : 0;

    trendDelta = newAcc - oldAcc;

    if (trendDelta > 3) {
      trendType = 'improving';
      trendTextFa = `آفرین قهرمان! دقت پاسخ‌دهی شما نسبت به آزمون‌های قبلی ${trendDelta}٪ افزایش یافته است 📈`;
    } else if (trendDelta < -5) {
      trendType = 'needs_focus';
      trendTextFa = 'با کمی دقت بیشتر و تمرین آرام، دوباره به بالاترین امتیازت می‌رسی! 🌟';
    } else {
      trendType = 'steady';
      trendTextFa = `عملکرد شما با میانگین دقت ${overallAccuracy}٪ پایدار و قدرتمند است! 💪`;
    }
  } else {
    trendTextFa = `آغاز فوق‌العاده با دقت ${overallAccuracy}٪! به تمرین ادامه بده تا رکورد جدید ثبت کنی.`;
  }

  const recommendedOp = needsPractice ? needsPractice.operation : strongest.operation;
  const recommendedActionFa = needsPractice
    ? `تمرین ${needsPractice.titleFa}`
    : `تقویت مهارت ${strongest.titleFa}`;

  return {
    strongestOperation: strongest,
    needsPracticeOperation: needsPractice,
    trendTextFa,
    trendType,
    trendPercentDelta: trendDelta,
    recommendedActionFa,
    recommendedOp,
  };
}

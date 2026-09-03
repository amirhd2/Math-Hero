/**
 * Smart Review Persistence and In-Memory Cache Manager.
 * Optimizes performance by caching analysis states and invalidating caches on new quiz completions.
 */

import { storage } from '../utils/storage';
import { QuizResult, MistakeRecord } from '../types';
import { SmartReviewState } from './smartReviewTypes';
import { analyzeSmartReview } from './smartReviewAnalyzer';

interface CachedReviewAnalysis {
  state: SmartReviewState;
  timestamp: number;
  resultCount: number;
  mistakeCount: number;
}

let cachedAnalysis: CachedReviewAnalysis | null = null;
const CACHE_TTL_MS = 60 * 1000; // 1 minute in-memory cache

/**
 * Invalidates the analysis cache (called whenever a new quiz result or mistake is saved).
 */
export function invalidateSmartReviewCache(): void {
  cachedAnalysis = null;
}

/**
 * Loads and returns the cached SmartReviewState, or analyzes fresh data if expired or dirty.
 */
export async function getOrComputeSmartReviewState(forceRefresh: boolean = false): Promise<SmartReviewState> {
  const [results, mistakes] = await Promise.all([
    storage.getResults(),
    storage.getMistakes(),
  ]);

  const now = Date.now();

  if (
    !forceRefresh &&
    cachedAnalysis &&
    now - cachedAnalysis.timestamp < CACHE_TTL_MS &&
    cachedAnalysis.resultCount === results.length &&
    cachedAnalysis.mistakeCount === mistakes.length
  ) {
    return cachedAnalysis.state;
  }

  // Perform full analysis
  const state = analyzeSmartReview(results, mistakes, now);

  cachedAnalysis = {
    state,
    timestamp: now,
    resultCount: results.length,
    mistakeCount: mistakes.length,
  };

  return state;
}

/**
 * Calculates improvement delta between a Smart Review result and historical performance.
 * Only returns a string if real, measurable data exists.
 */
export function calculateMeasurableImprovement(
  result: QuizResult,
  priorAccuracy?: number
): string | null {
  if (priorAccuracy === undefined || priorAccuracy <= 0) return null;
  const currentScore = result.score;
  const delta = currentScore - priorAccuracy;

  if (delta >= 5) {
    return `دقت شما در این مهارت‌ها از ${priorAccuracy}٪ به ${currentScore}٪ ارتقا یافت! 📈`;
  }
  return null;
}

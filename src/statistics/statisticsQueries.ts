/**
 * Statistics Queries layer for Math Hero.
 * Fetches data from IndexedDB / Storage layer, performs memoized calculations,
 * and handles data reset/mutation listeners.
 */

import { storage } from '../utils/storage';
import { UserProfile, QuizResult, MistakeRecord } from '../types';
import { StatisticsSummary, TimeRange, SmartReviewPreparedData } from './statisticsTypes';
import { calculateStatisticsSummary, prepareSmartReviewData } from './statisticsCalculator';

export async function fetchStatisticsData(
  profile: UserProfile,
  timeRange: TimeRange = 'all'
): Promise<{
  summary: StatisticsSummary;
  smartReviewData: SmartReviewPreparedData;
  results: QuizResult[];
  mistakes: MistakeRecord[];
}> {
  try {
    const [results, mistakes] = await Promise.all([
      storage.getResults(),
      storage.getMistakes(),
    ]);

    const summary = calculateStatisticsSummary(results, mistakes, profile, timeRange);
    const unresolvedMistakes = mistakes.filter((m) => !m.resolved);
    const smartReviewData = prepareSmartReviewData(summary, unresolvedMistakes);

    return {
      summary,
      smartReviewData,
      results,
      mistakes,
    };
  } catch (error) {
    console.error('Failed to fetch statistics data:', error);
    const summary = calculateStatisticsSummary([], [], profile, timeRange);
    const smartReviewData = prepareSmartReviewData(summary, []);
    return {
      summary,
      smartReviewData,
      results: [],
      mistakes: [],
    };
  }
}

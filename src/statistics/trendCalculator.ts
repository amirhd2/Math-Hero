/**
 * Trend Calculator for Math Hero.
 * Groups quiz results into chronological data points for 7 Days, 30 Days, or All Time.
 */

import { QuizResult } from '../types';
import { DailyTrendPoint, TimeRange } from './statisticsTypes';
import { toPersianDigits } from '../utils/persian';

const PERSIAN_WEEKDAYS = ['۱ش', '۲ش', '۳ش', '۴ش', '۵ش', 'جمعه', 'شنبه']; // Sun..Sat

export function calculateTrendPoints(results: QuizResult[], timeRange: TimeRange): DailyTrendPoint[] {
  if (!results || results.length === 0) {
    return [];
  }

  const now = Date.now();
  let filteredResults = [...results];

  if (timeRange === '7days') {
    const cutoff = now - 7 * 24 * 60 * 60 * 1000;
    filteredResults = results.filter((r) => r.timestamp >= cutoff);
  } else if (timeRange === '30days') {
    const cutoff = now - 30 * 24 * 60 * 60 * 1000;
    filteredResults = results.filter((r) => r.timestamp >= cutoff);
  }

  // Sort ascending by timestamp
  filteredResults.sort((a, b) => a.timestamp - b.timestamp);

  // Group by date (YYYY-MM-DD)
  const groups: Record<
    string,
    {
      timestamp: number;
      labelFa: string;
      quizCount: number;
      totalQuestions: number;
      correctAnswers: number;
      xpEarned: number;
    }
  > = {};

  for (const r of filteredResults) {
    const date = new Date(r.timestamp);
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
      date.getDate()
    ).padStart(2, '0')}`;

    let labelFa = '';
    try {
      // Use Persian short date
      const d = new Intl.DateTimeFormat('fa-IR', {
        month: 'numeric',
        day: 'numeric',
      }).format(date);
      labelFa = d;
    } catch {
      labelFa = toPersianDigits(`${date.getMonth() + 1}/${date.getDate()}`);
    }

    if (!groups[dateKey]) {
      groups[dateKey] = {
        timestamp: r.timestamp,
        labelFa,
        quizCount: 0,
        totalQuestions: 0,
        correctAnswers: 0,
        xpEarned: 0,
      };
    }

    groups[dateKey].quizCount += 1;
    groups[dateKey].totalQuestions += r.totalQuestions || 0;
    groups[dateKey].correctAnswers += r.correctCount || 0;
    groups[dateKey].xpEarned += r.xpEarned || 0;
  }

  const points: DailyTrendPoint[] = Object.entries(groups).map(([dateKey, data]) => {
    const accuracy = data.totalQuestions > 0 ? Math.round((data.correctAnswers / data.totalQuestions) * 100) : 0;
    return {
      dateKey,
      labelFa: data.labelFa,
      timestamp: data.timestamp,
      quizCount: data.quizCount,
      totalQuestions: data.totalQuestions,
      correctAnswers: data.correctAnswers,
      accuracyPercent: accuracy,
      xpEarned: data.xpEarned,
    };
  });

  return points;
}

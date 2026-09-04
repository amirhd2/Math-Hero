/**
 * ProgressScreen (Statistics & Learning Progress) for Math Hero.
 * Displays child-friendly visual metrics, operational breakdown, progress trend over time,
 * learning insights, and recent quiz history.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { UserProfile, ScreenId, OperationType, QuizConfiguration } from '../types';
import { fetchStatisticsData } from '../statistics/statisticsQueries';
import { StatisticsSummary, TimeRange } from '../statistics/statisticsTypes';
import { StatisticsHero } from '../components/statistics/StatisticsHero';
import { KeyStatsGrid } from '../components/statistics/KeyStatsGrid';
import { OperationPerformance } from '../components/statistics/OperationPerformance';
import { ProgressTrend } from '../components/statistics/ProgressTrend';
import { PerformanceInsight } from '../components/statistics/PerformanceInsight';
import { RecentQuizHistory } from '../components/statistics/RecentQuizHistory';
import { StatisticsEmptyState } from '../components/statistics/StatisticsEmptyState';

interface ProgressScreenProps {
  profile: UserProfile;
  onNavigate: (screen: ScreenId) => void;
  onOpenSetup?: (config?: Partial<QuizConfiguration>) => void;
}

export const ProgressScreen: React.FC<ProgressScreenProps> = ({
  profile,
  onNavigate,
  onOpenSetup,
}) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('all');
  const [summary, setSummary] = useState<StatisticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load and calculate statistics
  const loadStats = useCallback(
    async (range: TimeRange) => {
      setIsLoading(true);
      try {
        const data = await fetchStatisticsData(profile, range);
        setSummary(data.summary);
      } catch (err) {
        console.error('Error loading statistics:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [profile]
  );

  useEffect(() => {
    loadStats(timeRange);
  }, [loadStats, timeRange]);

  // Quick action: Preselect operation in Quiz Setup
  const handlePracticeOperation = (operation: OperationType) => {
    if (onOpenSetup) {
      onOpenSetup({
        selectedOperations: [operation],
        distribution: {
          addition: operation === 'addition' ? 100 : 0,
          subtraction: operation === 'subtraction' ? 100 : 0,
          multiplication: operation === 'multiplication' ? 100 : 0,
          division: operation === 'division' ? 100 : 0,
          mixed: 0,
        },
      });
    } else {
      onNavigate('quiz_setup');
    }
  };

  const handleStartQuiz = () => {
    if (onOpenSetup) {
      onOpenSetup();
    } else {
      onNavigate('quiz_setup');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-8 animate-fade-in">
      {/* Top Header Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-extrabold border border-slate-200/80 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-2xs flex items-center justify-center text-lg cursor-pointer shrink-0"
          title="بازگشت به خانه"
          aria-label="بازگشت به خانه"
        >
          ←
        </button>

        <div className="text-left">
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100">
            کارنامه و آمار پیشرفت
          </h2>
          <p className="text-xs text-slate-400 font-medium">سفر یادگیری و بهبود مستمر</p>
        </div>
      </div>

      {isLoading && !summary ? (
        <div className="py-24 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-2xl font-black mx-auto animate-spin shadow-lg">
            ۵
          </div>
          <p className="text-xs font-bold text-slate-500">در حال محاسبه و تحلیل کارنامه...</p>
        </div>
      ) : !summary || summary.totalQuizzes === 0 ? (
        /* Motivating Empty State when child has no quizzes yet */
        <StatisticsEmptyState gender={profile.gender} onStartQuiz={handleStartQuiz} />
      ) : (
        /* Full Data-Driven Statistics Experience */
        <div className="space-y-8">
          {/* 1. Motivating Hero Section */}
          <StatisticsHero profile={profile} summary={summary} />

          {/* 2. Key Numbers Grid */}
          <KeyStatsGrid summary={summary} />

          {/* 3. Four Core Operations Performance */}
          <OperationPerformance
            operations={summary.operationsList}
            onPractice={handlePracticeOperation}
          />

          {/* 4. Visual Progress Trend Over Time */}
          <ProgressTrend
            trendPoints={summary.trendPoints}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
          />

          {/* 5. Learning Insights & Suggestions */}
          <PerformanceInsight
            insights={summary.insights}
            onPractice={handlePracticeOperation}
          />

          {/* 6. Recent Quiz History */}
          <RecentQuizHistory results={summary.recentResults} />
        </div>
      )}
    </div>
  );
};

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
import { BackButton } from '../components/common/BackButton';
import { AdaptiveLearningPlan } from '../adaptive/adaptiveTypes';
import { SmartTeacherEngine } from '../adaptive/smartTeacherEngine';

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
  const [adaptivePlan, setAdaptivePlan] = useState<AdaptiveLearningPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load adaptive learning plan for teacher recommendations
  useEffect(() => {
    SmartTeacherEngine.getLearningPlan().then((plan) => setAdaptivePlan(plan));
  }, []);

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
    <div className="w-full max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-8 space-y-8 animate-fade-in">
      {/* Top Header Navigation Bar - Title on right, BackButton on left */}
      <div className="flex items-center justify-between gap-4">
        <div className="text-right">
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100">
            کارنامه و آمار پیشرفت
          </h2>
          <p className="text-xs text-slate-400 font-medium">سفر یادگیری و بهبود مستمر</p>
        </div>

        <BackButton onClick={() => onNavigate('home')} title="بازگشت به خانه" />
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

          {/* 3 & 4. Operations Performance & Progress Trend (2-Column on Tablet/Desktop) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
            <OperationPerformance
              operations={summary.operationsList}
              onPractice={handlePracticeOperation}
            />

            <ProgressTrend
              trendPoints={summary.trendPoints}
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
            />
          </div>

          {/* 5 & 6. Learning Insights & Recent History (2-Column on Tablet/Desktop) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
            <PerformanceInsight
              insights={summary.insights}
              plan={adaptivePlan}
              onPractice={handlePracticeOperation}
            />

            <RecentQuizHistory results={summary.recentResults} />
          </div>
        </div>
      )}
    </div>
  );
};

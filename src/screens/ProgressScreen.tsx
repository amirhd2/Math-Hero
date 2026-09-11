/**
 * ProgressScreen (Statistics & Learning Progress) for Math Hero.
 * Displays child-friendly visual metrics, operational breakdown, progress trend over time,
 * learning insights, and recent quiz history.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { UserProfile, ScreenId, OperationType, QuizConfiguration, QuizMode } from '../types';
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
import { QuickQuestionCountModal } from '../components/common/QuickQuestionCountModal';
import { AdaptiveLearningPlan } from '../adaptive/adaptiveTypes';
import { SmartTeacherEngine } from '../adaptive/smartTeacherEngine';

interface ProgressScreenProps {
  profile: UserProfile;
  appMode?: 'child' | 'parent';
  onNavigate: (screen: ScreenId) => void;
  onOpenSetup?: (config?: Partial<QuizConfiguration>) => void;
  onStartChildQuickOperation?: (op: OperationType, count?: number, mode?: QuizMode) => void;
}

const OP_CONFIGS: Record<OperationType, { title: string; symbol: string; color: string }> = {
  addition: { title: 'جمع', symbol: '➕', color: 'from-emerald-500 to-teal-600' },
  subtraction: { title: 'تفریق', symbol: '➖', color: 'from-amber-500 to-orange-600' },
  multiplication: { title: 'ضرب', symbol: '✖️', color: 'from-indigo-500 to-purple-600' },
  division: { title: 'تقسیم', symbol: '➗', color: 'from-sky-500 to-blue-600' },
  mixed: { title: 'ترکیبی', symbol: '🧮', color: 'from-violet-500 to-fuchsia-600' },
};

export const ProgressScreen: React.FC<ProgressScreenProps> = ({
  profile,
  appMode = 'child',
  onNavigate,
  onOpenSetup,
  onStartChildQuickOperation,
}) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('all');
  const [summary, setSummary] = useState<StatisticsSummary | null>(null);
  const [adaptivePlan, setAdaptivePlan] = useState<AdaptiveLearningPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Quick Question Count Modal State for Dashboard alignment
  const [countModalState, setCountModalState] = useState<{
    isOpen: boolean;
    title: string;
    subtitle?: string;
    icon?: string;
    mode: 'test' | 'practice';
    colorGradient?: string;
    badgeText?: string;
    options?: number[];
    defaultCount?: number;
    onConfirm: (count: number) => void;
  }>({
    isOpen: false,
    title: '',
    mode: 'test',
    onConfirm: () => {},
  });

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

  // Handle touch/click on each operation card matching Dashboard behavior
  const handlePracticeOperation = (operation: OperationType) => {
    const config = OP_CONFIGS[operation] || OP_CONFIGS.addition;
    if (appMode === 'child') {
      setCountModalState({
        isOpen: true,
        title: `آزمون ${config.title}`,
        subtitle: 'تعداد سوالات آزمون رو انتخاب کن. در حالت آزمون، دقت و سرعت تو سنجیده می‌شه!',
        icon: config.symbol,
        mode: 'test',
        colorGradient: config.color,
        badgeText: '🏆 حالت آزمون',
        options: [5, 10, 15, 20],
        defaultCount: 10,
        onConfirm: (count: number) => {
          setCountModalState((prev) => ({ ...prev, isOpen: false }));
          if (onStartChildQuickOperation) {
            onStartChildQuickOperation(operation, count, 'test');
          }
        },
      });
    } else {
      if (onOpenSetup) {
        onOpenSetup({
          selectedOperations: [operation],
          mode: 'test',
        });
      } else {
        onNavigate('quiz_setup');
      }
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
              appMode={appMode}
            />

            <RecentQuizHistory results={summary.recentResults} />
          </div>
        </div>
      )}

      {/* Quick Question Count Modal for 4 Operations aligned with Dashboard rules */}
      <QuickQuestionCountModal
        isOpen={countModalState.isOpen}
        onClose={() => setCountModalState((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={countModalState.onConfirm}
        title={countModalState.title}
        subtitle={countModalState.subtitle}
        icon={countModalState.icon}
        mode={countModalState.mode}
        badgeText={countModalState.badgeText}
        colorGradient={countModalState.colorGradient}
        options={countModalState.options}
        defaultCount={countModalState.defaultCount}
      />
    </div>
  );
};

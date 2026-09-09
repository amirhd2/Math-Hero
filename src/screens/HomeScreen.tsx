/**
 * HomeScreen component for Math Hero.
 * Central hub: Hero greeting, level progress, quick-start daily mission,
 * 4 primary math operation cards with mastery levels, mistakes vault,
 * and today's activity stats.
 */

import React, { useState, useEffect } from 'react';
import {
  UserProfile,
  QuizPreset,
  ScreenId,
  TestPattern,
  QuizConfiguration,
} from '../types';
import { Character } from '../components/Character';
import { formatNumber, toPersianDigits } from '../utils/persian';
import { storage } from '../utils/storage';
import { SmartReviewHomeCard } from '../components/smartReview/SmartReviewHomeCard';
import { SmartReviewModal } from '../components/smartReview/SmartReviewModal';
import { getSmartReviewState } from '../smartReview/smartReviewEngine';
import { SmartReviewState } from '../smartReview/smartReviewTypes';
import { getLevelProgress } from '../gamification/levelCalculator';
import { gamificationEngine } from '../gamification/gamificationEngine';
import { TrophyInfo } from '../gamification/gamificationTypes';
import { AdaptiveLearningPlan, PromotionEvent } from '../adaptive/adaptiveTypes';
import { SmartTeacherEngine } from '../adaptive/smartTeacherEngine';
import { AdaptiveRecommendationCard } from '../components/adaptive/AdaptiveRecommendationCard';
import { PromotionModal } from '../components/adaptive/PromotionModal';
import { OperationType } from '../types';
import { extractOperationBreakdownFromQuizResult, PRIMARY_OPERATIONS } from '../utils/operationEvidence';
import { getTrophyCupUrl, getTrophyCupFallbackUrl } from '../utils/assetPaths';
import { StageIcon } from '../components/common/StageIcon';

interface HomeScreenProps {
  profile: UserProfile;
  presets: QuizPreset[];
  testPatterns: TestPattern[];
  appMode?: 'child' | 'parent';
  onOpenSetup: (config?: Partial<QuizConfiguration>) => void;
  onStartPattern: (pattern: TestPattern) => void;
  onStartQuiz: (preset?: QuizPreset) => void;
  onNavigate: (screen: ScreenId) => void;
  onStartSmartReview?: () => void;
  onStartChildQuickOperation: (op: OperationType) => void;
  onStartChildCombined: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  profile,
  presets,
  testPatterns,
  appMode = 'child',
  onOpenSetup,
  onStartPattern,
  onStartQuiz,
  onNavigate,
  onStartSmartReview,
  onStartChildQuickOperation,
  onStartChildCombined,
}) => {
  const [unresolvedMistakesCount, setUnresolvedMistakesCount] = useState(0);
  const [todaySolved, setTodaySolved] = useState(0);
  const [todayXp, setTodayXp] = useState(0);
  const [isSmartReviewModalOpen, setIsSmartReviewModalOpen] = useState(false);
  const [smartReviewState, setSmartReviewState] = useState<SmartReviewState | null>(null);
  const [trophyInfo, setTrophyInfo] = useState<TrophyInfo | null>(null);
  const [unlockedBadgesCount, setUnlockedBadgesCount] = useState(0);
  const [totalBadgesCount, setTotalBadgesCount] = useState(16);
  const [adaptivePlan, setAdaptivePlan] = useState<AdaptiveLearningPlan | null>(null);
  const [pendingPromotion, setPendingPromotion] = useState<PromotionEvent | null>(null);

  const handleOpenSmartReview = async () => {
    const state = await getSmartReviewState();
    setSmartReviewState(state);
    setIsSmartReviewModalOpen(true);
  };

  const handleConfirmStartSmartReview = () => {
    setIsSmartReviewModalOpen(false);
    if (onStartSmartReview) {
      onStartSmartReview();
    }
  };

  const handleAcceptPromotion = async () => {
    if (!pendingPromotion) return;
    const promo = pendingPromotion;
    await SmartTeacherEngine.acceptPromotion(promo.id);
    setPendingPromotion(null);
    const updatedPlan = await SmartTeacherEngine.getLearningPlan();
    setAdaptivePlan(updatedPlan);
    if (appMode === 'child') {
      onStartChildQuickOperation(promo.operation);
    } else {
      onOpenSetup({
        selectedOperations: [promo.operation],
        mode: 'practice',
        isAdaptive: true,
        adaptiveSkillTier: promo.unlockedTier,
      });
    }
  };

  const handlePostponePromotion = async () => {
    if (!pendingPromotion) return;
    await SmartTeacherEngine.postponePromotion(pendingPromotion.id);
    setPendingPromotion(null);
  };

  const handleStartAdaptiveRecommendation = (op: OperationType) => {
    if (appMode === 'child') {
      onStartChildQuickOperation(op);
    } else {
      const activeTier = adaptivePlan?.operations[op]?.currentTier || 1;
      onOpenSetup({
        selectedOperations: [op],
        mode: 'practice',
        isAdaptive: true,
        adaptiveSkillTier: activeTier,
      });
    }
  };

  const [opMastery, setOpMastery] = useState<Record<string, { accuracy: number; stars: number }>>({
    addition: { accuracy: 0, stars: 0 },
    subtraction: { accuracy: 0, stars: 0 },
    multiplication: { accuracy: 0, stars: 0 },
    division: { accuracy: 0, stars: 0 },
  });

  // Calculate greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'صبح بخیر';
    if (hour >= 12 && hour < 17) return 'ظهر و عصر بخیر';
    if (hour >= 17 && hour < 21) return 'عصر بخیر';
    return 'شب بخیر';
  };

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [mistakes, results, achievements, overview, plan, promo] = await Promise.all([
          storage.getMistakes(),
          storage.getResults(),
          storage.getAchievements(),
          gamificationEngine.getOverviewData(),
          SmartTeacherEngine.getLearningPlan(),
          SmartTeacherEngine.getPendingPromotion(),
        ]);

        setAdaptivePlan(plan);
        setPendingPromotion(promo);

        // Unresolved mistakes
        const unresolved = mistakes.filter((m) => !m.resolved);
        setUnresolvedMistakesCount(unresolved.length);

        // Gamification overview
        if (overview) {
          setTrophyInfo(overview.trophyInfo);
          setUnlockedBadgesCount(overview.unlockedBadges.length);
          if (overview.allBadges && overview.allBadges.length > 0) {
            setTotalBadgesCount(overview.allBadges.length);
          }
        }

        // Today's activity
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const todayResults = results.filter((r) => r.timestamp >= startOfDay.getTime());
        const qToday = todayResults.reduce((sum, r) => sum + (r.totalQuestions || 0), 0);
        const xpToday = todayResults.reduce((sum, r) => sum + (r.xpEarned || 0), 0);
        setTodaySolved(qToday);
        setTodayXp(xpToday);

        // Operation mastery calculation
        if (results.length > 0) {
          const ops: Record<string, { total: number; correct: number }> = {
            addition: { total: 0, correct: 0 },
            subtraction: { total: 0, correct: 0 },
            multiplication: { total: 0, correct: 0 },
            division: { total: 0, correct: 0 },
          };

          results.forEach((r) => {
            const breakdown = extractOperationBreakdownFromQuizResult(r);
            PRIMARY_OPERATIONS.forEach((op) => {
              const stat = breakdown[op];
              if (stat && stat.totalQuestions > 0 && ops[op]) {
                ops[op].total += stat.totalQuestions;
                ops[op].correct += stat.correctCount;
              }
            });
          });

          const newMastery: Record<string, { accuracy: number; stars: number }> = {};
          Object.entries(ops).forEach(([opKey, data]) => {
            if (data.total > 0) {
              const acc = Math.round((data.correct / data.total) * 100);
              let stars = 1;
              if (acc >= 90) stars = 3;
              else if (acc >= 65) stars = 2;
              newMastery[opKey] = { accuracy: acc, stars };
            } else {
              newMastery[opKey] = { accuracy: 0, stars: 0 };
            }
          });
          setOpMastery((prev) => ({ ...prev, ...newMastery }));
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      }
    }
    loadDashboardData();
  }, []);

  // Level XP calculations from single source of truth
  const levelInfo = getLevelProgress(profile.xp);

  // Find presets for each operation
  const getPresetForOp = (op: string) => {
    return presets.find((p) => p.operation === op) || presets[0];
  };

  const operations = [
    {
      id: 'addition',
      title: 'جمع اعداد',
      enTitle: 'Addition',
      symbol: '➕',
      color: 'from-emerald-500 to-teal-600',
      bgLight: 'bg-emerald-50 dark:bg-emerald-950/40',
      borderLight: 'border-emerald-200 dark:border-emerald-800',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      desc: 'یادگیری و تمرین سریع جمع',
      preset: getPresetForOp('addition'),
    },
    {
      id: 'subtraction',
      title: 'تفریق و منها',
      enTitle: 'Subtraction',
      symbol: '➖',
      color: 'from-sky-500 to-blue-600',
      bgLight: 'bg-sky-50 dark:bg-sky-950/40',
      borderLight: 'border-sky-200 dark:border-sky-800',
      textColor: 'text-sky-600 dark:text-sky-400',
      desc: 'مهارت در کاستن و تفریق سریع',
      preset: getPresetForOp('subtraction'),
    },
    {
      id: 'multiplication',
      title: 'جدول ضرب',
      enTitle: 'Multiplication',
      symbol: '✖️',
      color: 'from-amber-500 to-orange-600',
      bgLight: 'bg-amber-50 dark:bg-amber-950/40',
      borderLight: 'border-amber-200 dark:border-amber-800',
      textColor: 'text-amber-600 dark:text-amber-400',
      desc: 'تسلط آسان بر جدول ضرب',
      preset: getPresetForOp('multiplication'),
    },
    {
      id: 'division',
      title: 'تقسیم هوشمند',
      enTitle: 'Division',
      symbol: '➗',
      color: 'from-violet-500 to-purple-600',
      bgLight: 'bg-violet-50 dark:bg-violet-950/40',
      borderLight: 'border-violet-200 dark:border-violet-800',
      textColor: 'text-violet-600 dark:text-violet-400',
      desc: 'تقسیم عادلانه و بخش‌پذیری',
      preset: getPresetForOp('division'),
    },
  ];

  return (
    <div className="w-full max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-8 space-y-8 animate-fade-in">
      {/* 1. Header / Hero Bar Card */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 rounded-3xl p-6 sm:p-8 text-white shadow-2xl">
        <div className="absolute -top-12 -left-12 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />

        {/* Settings Button */}
        <button
          onClick={() => onNavigate('settings')}
          className="absolute top-4 left-4 z-20 w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md transition-colors border border-white/20 cursor-pointer"
          title="تنظیمات"
        >
          <span className="text-xl">⚙️</span>
        </button>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Greeting and Level Info */}
          <div className="space-y-4 text-center md:text-right w-full md:w-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black">
              <StageIcon level={levelInfo.level} size="xs" className="w-5 h-5" />
              <span>{levelInfo.title}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
              {getGreeting()}، {profile.name}!
            </h2>

            <p className="text-indigo-100 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto md:mx-0 leading-relaxed font-medium">
              امروز چالش‌های شگفت‌انگیز جدیدی در انتظارته. بریم با هم چندتا معمای جذاب حل کنیم؟
            </p>

            {/* Level & XP Progress Bar */}
            <div className="bg-black/25 backdrop-blur-md p-4 rounded-2xl border border-white/15 w-full max-w-md mx-auto md:mx-0 space-y-2">
              <div className="flex items-center justify-between text-xs font-extrabold">
                <span className="flex items-center gap-1.5">
                  <StageIcon level={levelInfo.level} size="xs" className="w-4 h-4" />
                  <span>سطح {formatNumber(levelInfo.level, 'persian')}</span>
                </span>
                <span className="text-amber-300">
                  {formatNumber(levelInfo.xpInCurrentLevel, 'persian')} / {formatNumber(levelInfo.xpRequiredForNextLevel, 'persian')} XP
                </span>
              </div>
              <div className="w-full h-2.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${Math.max(4, levelInfo.progressPercent)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Character Avatar with Streak, Coins & Trophy triggers */}
          <div className="flex flex-col items-center gap-3">
            <div
              onClick={() => onNavigate('profile')}
              className="cursor-pointer group relative"
              title="مشاهده پروفایل"
            >
              <Character
                character={profile.gender}
                pose="celebrating"
                size="xl"
                className="transform group-hover:scale-105 transition-transform"
              />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-black">
              <span className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-1.5">
                <span>🔥</span>
                <span>{formatNumber(profile.streakDays, 'persian')} روز متوالی</span>
              </span>
              <span className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-1.5 text-amber-200">
                <span>🪙</span>
                <span>{formatNumber(profile.coins, 'persian')} سکه</span>
              </span>
              <button
                type="button"
                onClick={() => onNavigate('achievements')}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-3.5 py-1.5 rounded-full shadow-md flex items-center gap-1.5 font-black transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                title="مشاهده تالار افتخارات و جام‌ها"
              >
                <img
                  src={getTrophyCupUrl(trophyInfo?.stage || 1)}
                  alt="جام"
                  className="w-5 h-5 object-contain shrink-0 filter drop-shadow"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.dataset.fallback) {
                      target.dataset.fallback = '1';
                      target.src = getTrophyCupFallbackUrl(trophyInfo?.stage || 1);
                    }
                  }}
                />
                <span>{trophyInfo?.stageNameFa || 'جام قهرمان'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top Grid: Daily Mission & Smart Review */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {/* Main Action / Quick Start Card (Daily Mission) */}
        <div className="relative overflow-hidden bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 rounded-3xl p-6 sm:p-8 text-slate-950 shadow-xl border border-amber-300 flex flex-col justify-between gap-6 h-full">
          <div className="space-y-2 text-center sm:text-right">
            <div className="inline-flex items-center gap-1.5 bg-slate-950/10 px-3 py-1 rounded-full text-xs font-black">
              <span>⚡</span>
              <span>ماموریت روزانه</span>
            </div>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black">
              ماجراجویی امروز
            </h3>
            <p className="text-xs sm:text-sm text-slate-800 font-bold max-w-md">
              ۱۰ معما برای گرم کردن ذهن • کسب ۵۰ امتیاز XP و سکه جایزه
            </p>
          </div>

          <button
            id="home-start-daily-mission-btn"
            onClick={() => {
              if (appMode === 'child') {
                onStartChildQuickOperation(adaptivePlan?.primaryOperation || 'addition');
              } else {
                onOpenSetup({ mode: 'practice', questionCount: 10 });
              }
            }}
            className="w-full sm:w-auto px-6 py-4 bg-slate-950 hover:bg-slate-900 text-white font-black text-sm lg:text-lg rounded-2xl shadow-xl shadow-slate-950/20 transform hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer"
          >
            <span>🚀</span>
            <span>شروع ماموریت</span>
          </button>
        </div>

        {/* Smart Review Entry Point */}
        <div className="h-full [&>div]:h-full">
          <SmartReviewHomeCard
            onStartSmartReview={handleOpenSmartReview}
            onOpenQuickQuiz={() => onOpenSetup({ mode: 'practice', questionCount: 10 })}
          />
        </div>
      </div>

      {/* Adaptive Teacher Recommendation Banner (Compact & Positive) */}
      {adaptivePlan && (
        <div className="pt-2">
          <AdaptiveRecommendationCard
            plan={adaptivePlan}
            onStartRecommended={handleStartAdaptiveRecommendation}
          />
        </div>
      )}

      {/* 4. Math Operations Categories (The Core 4 Cards) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span>📚</span>
              <span>عملیات‌های اصلی ریاضی</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {appMode === 'child'
                ? 'روی هر عملیات بزن تا تمرین هوشمند و متناسب با مرحله‌ات فوراً شروع بشه!'
                : 'با کلیک روی هر عملیات، وارد تنظیمات چالش آن شوید'}
            </p>
          </div>
          {appMode === 'parent' && (
            <button
              onClick={() => onNavigate('presets')}
              className="text-xs sm:text-sm font-black text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              الگوهای ذخیره‌شده ←
            </button>
          )}
        </div>

        {/* 2.5 Distinct Combined Quiz Action Banner (Positioned Above the 4 Operation Cards) */}
        <div
          id="home-combined-quiz-card"
          onClick={() => {
            if (appMode === 'child') {
              onStartChildCombined();
            } else {
              onOpenSetup({
                selectedOperations: ['addition', 'subtraction', 'multiplication', 'division'],
                mode: 'test',
                isAdaptive: true,
                questionCount: 20,
              });
            }
          }}
          className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 rounded-3xl p-4 sm:p-6 text-white shadow-xl flex items-center justify-between gap-4 border border-indigo-700/50 hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer group"
          role="button"
          tabIndex={0}
          title="شروع چالش ترکیبی چهار عمل اصلی"
        >
          {/* Right Side: Title & Description */}
          <div className="flex items-center gap-3.5 sm:gap-4 text-right">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/10 flex items-center justify-center text-2xl sm:text-3xl shadow-inner shrink-0 group-hover:scale-110 transition-transform">
              🌟
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 shadow-xs">
                  چالش ترکیبی
                </span>
                <span className="text-xs font-bold text-amber-200">
                  ۲۰ سوال هوشمند
                </span>
              </div>
              <h4 className="text-base sm:text-lg lg:text-xl font-black text-white group-hover:text-amber-200 transition-colors">
                آزمون جامع چهار عمل اصلی
              </h4>
              <p className="text-xs text-indigo-200 line-clamp-2 sm:line-clamp-none font-medium">
                {appMode === 'child'
                  ? 'ترکیب هوشمند مهارت‌های باز شده جمع، تفریق، ضرب و تقسیم در یک چالش هیجان‌انگیز'
                  : 'ترکیب هوشمند جمع، تفریق، ضرب و تقسیم با تعیین درصد توزیع دلخواه'}
              </p>
            </div>
          </div>

          {/* Left Side: Combined 4 Operations Visual Icons Cluster (Replacing the button) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="grid grid-cols-2 gap-1.5 p-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-inner group-hover:scale-105 group-hover:bg-white/15 transition-all">
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-xs sm:text-sm font-black text-white shadow-sm" title="جمع اعداد">
                ➕
              </div>
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-xs sm:text-sm font-black text-white shadow-sm" title="تفریق اعداد">
                ➖
              </div>
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-xs sm:text-sm font-black text-white shadow-sm" title="ضرب اعداد">
                ✖️
              </div>
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-xs sm:text-sm font-black text-white shadow-sm" title="تقسیم اعداد">
                ➗
              </div>
            </div>

            <div className="hidden sm:flex w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 group-hover:bg-amber-400 group-hover:text-slate-950 text-white items-center justify-center transition-all font-black text-sm sm:text-base shadow-sm">
              ←
            </div>
          </div>
        </div>

        {/* 4 Core Math Operations Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
          {operations.map((op) => {
            const mastery = opMastery[op.id] || { accuracy: 0, stars: 1 };
            return (
              <div
                key={op.id}
                id={`home-op-card-${op.id}`}
                onClick={() => {
                  if (appMode === 'child') {
                    onStartChildQuickOperation(op.id as OperationType);
                  } else {
                    onOpenSetup({
                      selectedOperations: [op.id as any],
                      mode: 'practice',
                    });
                  }
                }}
                className={`bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border ${op.borderLight} shadow-lg hover:shadow-2xl transition-all cursor-pointer flex flex-col justify-between group hover:-translate-y-1`}
              >
                <div className="space-y-3 sm:space-y-4">
                  {/* Top Bar: Icon & Mastery Stars */}
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br ${op.color} flex items-center justify-center text-xl sm:text-2xl text-white shadow-lg group-hover:scale-110 transition-transform`}
                    >
                      {op.symbol}
                    </div>
                    {/* Mastery Stars */}
                    <div className="flex items-center gap-0.5" title={`تسلط: ${mastery.stars} از ۳ ستاره`}>
                      {[1, 2, 3].map((starIndex) => (
                        <span
                          key={starIndex}
                          className={`text-sm sm:text-base ${
                            starIndex <= mastery.stars ? 'text-amber-400' : 'text-slate-300 dark:text-slate-700'
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h4 className="text-sm sm:text-lg font-black text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 transition-colors">
                      {op.title}
                    </h4>
                    <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {op.desc}
                    </p>
                  </div>
                </div>

                {/* Bottom Stats */}
                <div className="mt-3 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-100 dark:border-slate-800">
                  <span className={`text-[10px] sm:text-xs font-extrabold ${op.textColor}`}>
                    دقت: ٪{formatNumber(mastery.accuracy, 'persian')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Mistakes Vault Callout Banner (Moved Below Math Operations) */}
      {unresolvedMistakesCount > 0 ? (
        <div
          onClick={() => onNavigate('mistakes')}
          className="bg-gradient-to-r from-rose-500 to-pink-600 rounded-3xl p-5 sm:p-6 text-white shadow-xl cursor-pointer hover:shadow-2xl transition-all flex flex-col sm:flex-row items-center justify-between gap-4 group"
        >
          <div className="flex items-center gap-4 text-center sm:text-right">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shrink-0">
              💡
            </div>
            <div>
              <h4 className="text-lg font-black">گنجینه اشتباهات قهرمان!</h4>
              <p className="text-xs sm:text-sm text-rose-100">
                تو {formatNumber(unresolvedMistakesCount, 'persian')} تا سوال داری که می‌تونی دوباره حل کنی و امتیاز کامل بگیری!
              </p>
            </div>
          </div>
          <button className="px-5 py-2.5 bg-white text-rose-600 font-black text-xs sm:text-sm rounded-xl shadow-md group-hover:bg-rose-50 transition-colors shrink-0 mt-2 sm:mt-0">
            تمرین و اصلاح اشتباهات ←
          </button>
        </div>
      ) : (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 rounded-3xl p-4 sm:p-5 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl shrink-0">🎉</span>
            <p className="text-xs sm:text-sm font-bold text-emerald-800 dark:text-emerald-300">
              آفرین قهرمان! هیچ اشتباه حل‌نشده‌ای نداری و همه معماها رو دقیق حل کردی!
            </p>
          </div>
          <button
            onClick={() => onNavigate('mistakes')}
            className="text-xs font-black text-emerald-600 dark:text-emerald-400 hover:underline shrink-0"
          >
            مشاهده گنجینه
          </button>
        </div>
      )}

      {/* 4.5 Compact Recent/Favorite Saved Test Patterns (Visible in Parent Mode) */}
      {appMode === 'parent' && testPatterns && testPatterns.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">📋</span>
              <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-base">
                الگوهای برگزیده و آماده آزمون
              </h3>
            </div>
            <button
              onClick={() => onNavigate('presets')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              مشاهده همه الگوها ({toPersianDigits(testPatterns.length)}) ←
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {testPatterns.slice(0, 3).map((pattern) => (
              <div
                key={pattern.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between gap-3 hover:border-indigo-300 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl">{pattern.icon || '⭐'}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                        pattern.config.mode === 'practice'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                      }`}
                    >
                      {pattern.config.mode === 'practice' ? 'تمرین' : 'آزمون'}
                    </span>
                  </div>
                  <h4 className="font-black text-slate-800 dark:text-slate-100 text-xs line-clamp-1">
                    {pattern.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {toPersianDigits(pattern.config.questionCount)} سوال •{' '}
                    {pattern.config.selectedOperations.length} عملیات
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onStartPattern(pattern)}
                  className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs transition-colors shadow-xs"
                >
                  شروع سریع 🚀
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Today's Progress & Motivational Achievements Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today's Activity Summary */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span>📈</span>
              <span>فعالیت امروز شما</span>
            </h4>
            <button
              type="button"
              onClick={() => onNavigate('progress')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              مشاهده کارنامه کامل ←
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl text-center space-y-1">
              <span className="text-xl">🎯</span>
              <p className="text-xs font-bold text-slate-500">سوالات حل شده</p>
              <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {formatNumber(todaySolved, 'persian')}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl text-center space-y-1">
              <span className="text-xl">⭐</span>
              <p className="text-xs font-bold text-slate-500">امتیاز کسب شده</p>
              <p className="text-2xl font-black text-amber-500">
                {formatNumber(todayXp, 'persian')} XP
              </p>
            </div>
          </div>
        </div>

        {/* Motivational Achievements Overview (Box-by-Box Style Matching Today's Activity) */}
        <div
          onClick={() => onNavigate('achievements')}
          className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-xl space-y-4 cursor-pointer hover:shadow-2xl transition-all group"
          role="button"
          tabIndex={0}
          title="مشاهده تالار افتخارات و جام‌ها"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span>🏆</span>
              <span>افتخارات و نشان‌های من</span>
            </h4>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:underline">
              مشاهده تالار افتخارات ←
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl text-center space-y-1 group-hover:bg-indigo-50/40 dark:group-hover:bg-indigo-950/20 transition-colors">
              <span className="text-xl">🎖️</span>
              <p className="text-xs font-bold text-slate-500">نشان‌های کسب‌شده</p>
              <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {formatNumber(unlockedBadgesCount, 'persian')}{' '}
                <span className="text-xs sm:text-sm font-bold text-slate-400 dark:text-slate-500">
                  از {formatNumber(totalBadgesCount, 'persian')}
                </span>
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl text-center space-y-1 group-hover:bg-amber-50/40 dark:group-hover:bg-amber-950/20 transition-colors">
              <div className="w-10 h-10 mx-auto flex items-center justify-center">
                <img
                  src={getTrophyCupUrl(trophyInfo?.stage || 1)}
                  alt={trophyInfo?.stageNameFa || 'جام قهرمانی'}
                  className="w-full h-full object-contain filter drop-shadow-md"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.dataset.fallback) {
                      target.dataset.fallback = '1';
                      target.src = getTrophyCupFallbackUrl(trophyInfo?.stage || 1);
                    }
                  }}
                />
              </div>
              <p className="text-xs font-bold text-slate-500">جام قهرمانی</p>
              <p className="text-xl sm:text-2xl font-black text-amber-500 truncate px-1">
                {trophyInfo?.stageNameFa || 'جام برنزی'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Smart Review Child-friendly Preview Modal */}
      <SmartReviewModal
        isOpen={isSmartReviewModalOpen}
        state={smartReviewState}
        onClose={() => setIsSmartReviewModalOpen(false)}
        onStart={handleConfirmStartSmartReview}
      />

      {/* Adaptive Promotion Celebration Modal */}
      {pendingPromotion && (
        <PromotionModal
          promotion={pendingPromotion}
          onAccept={handleAcceptPromotion}
          onPostpone={handlePostponePromotion}
        />
      )}
    </div>
  );
};

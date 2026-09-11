/**
 * HomeScreen component for Math Hero.
 * Redesigned, simplified, engaging daily activity hub:
 * 1. Compact Hero Header (Greeting, Level & XP progress, Streak, Coins, Trophy, Settings)
 * 2. Daily Challenges Card Stack (preloaded, smooth CSS-only 3D deck transitions, swipeable)
 * 3. Smart Teacher Recommendation (reusable TeacherRecommendationCard component)
 * 4. Main Math Operations (4 Operations + Combined Quiz, responsive & compact)
 * 5. Compact Activity & Trophy Highlight bar
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  UserProfile,
  QuizPreset,
  ScreenId,
  TestPattern,
  QuizConfiguration,
  OperationType,
} from '../types';
import { formatNumber, toPersianDigits } from '../utils/persian';
import { storage } from '../utils/storage';
import { SmartReviewModal } from '../components/smartReview/SmartReviewModal';
import { getSmartReviewState } from '../smartReview/smartReviewEngine';
import { SmartReviewState } from '../smartReview/smartReviewTypes';
import { getLevelProgress } from '../gamification/levelCalculator';
import { gamificationEngine } from '../gamification/gamificationEngine';
import { TrophyInfo } from '../gamification/gamificationTypes';
import { AdaptiveLearningPlan, PromotionEvent } from '../adaptive/adaptiveTypes';
import { SmartTeacherEngine } from '../adaptive/smartTeacherEngine';
import { TeacherRecommendationCard } from '../components/adaptive/TeacherRecommendationCard';
import { PromotionModal } from '../components/adaptive/PromotionModal';
import { extractOperationBreakdownFromQuizResult, PRIMARY_OPERATIONS } from '../utils/operationEvidence';
import {
  getTrophyCupUrl,
  getTrophyCupFallbackUrl,
  getAssetUrl,
  getFallbackAssetUrl,
} from '../utils/assetPaths';
import { StageIcon } from '../components/common/StageIcon';
import {
  DailyChallengesCardStack,
  DailyChallengeItem,
} from '../components/gamification/DailyChallengesCardStack';
import { getTierDefinition } from '../adaptive/tierRegistry';
import { QuickQuestionCountModal } from '../components/common/QuickQuestionCountModal';

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
  onStartChildQuickOperation: (op: OperationType, count?: number, mode?: 'test' | 'practice') => void;
  onStartChildCombined: (count?: number, mode?: 'test' | 'practice') => void;
  onStartSmartTeacherPractice?: (op: OperationType, count?: number) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  profile,
  presets: _presets,
  testPatterns,
  appMode = 'child',
  onOpenSetup,
  onStartPattern,
  onStartQuiz: _onStartQuiz,
  onNavigate,
  onStartSmartReview,
  onStartChildQuickOperation,
  onStartChildCombined,
  onStartSmartTeacherPractice,
}) => {
  const [unresolvedMistakesCount, setUnresolvedMistakesCount] = useState(0);
  const [todaySolved, setTodaySolved] = useState(0);
  const [todayXp, setTodayXp] = useState(0);
  const [isSmartReviewModalOpen, setIsSmartReviewModalOpen] = useState(false);
  const [smartReviewState, setSmartReviewState] = useState<SmartReviewState | null>(null);
  const [trophyInfo, setTrophyInfo] = useState<TrophyInfo | null>(null);
  const [unlockedBadgesCount, setUnlockedBadgesCount] = useState(0);
  const [totalBadgesCount, setTotalBadgesCount] = useState(45);
  const [adaptivePlan, setAdaptivePlan] = useState<AdaptiveLearningPlan | null>(null);
  const [pendingPromotion, setPendingPromotion] = useState<PromotionEvent | null>(null);

  // Quick Question Count Modal state
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

  const [opMastery, setOpMastery] = useState<Record<string, { accuracy: number; stars: number }>>({
    addition: { accuracy: 0, stars: 0 },
    subtraction: { accuracy: 0, stars: 0 },
    multiplication: { accuracy: 0, stars: 0 },
    division: { accuracy: 0, stars: 0 },
  });

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
  };

  const handleStartAdaptiveRecommendation = (op: OperationType) => {
    if (appMode === 'child') {
      setCountModalState({
        isOpen: true,
        title: 'تمرین هوشمند با معلم دانا',
        subtitle: 'تعداد سوالات تمرینی رو انتخاب کن. با حل تمرین‌های بیشتر، امتیاز و مدال‌های طلایی به دست میاری!',
        icon: '🦉',
        mode: 'practice',
        colorGradient: 'from-amber-500 to-orange-500',
        badgeText: '🌱 حالت تمرینی (۳ فرصت)',
        options: [5, 10, 15, 20],
        defaultCount: 10,
        onConfirm: (count: number) => {
          setCountModalState((prev) => ({ ...prev, isOpen: false }));
          if (onStartSmartTeacherPractice) {
            onStartSmartTeacherPractice(op, count);
          } else {
            onStartChildQuickOperation(op, count, 'practice');
          }
        },
      });
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

  const handleOpenCombinedModal = () => {
    if (appMode === 'child') {
      setCountModalState({
        isOpen: true,
        title: 'آزمون جامع چهار عمل اصلی',
        subtitle: 'تعداد سوالات آزمون جامع رو مشخص کن. ترکیبی از جمع، تفریق، ضرب و تقسیم برای قهرمانان ریاضی!',
        icon: '🌟',
        mode: 'test',
        colorGradient: 'from-indigo-900 via-indigo-800 to-violet-900',
        badgeText: '🏆 حالت آزمون',
        options: [10, 15, 20, 25],
        defaultCount: 20,
        onConfirm: (count: number) => {
          setCountModalState((prev) => ({ ...prev, isOpen: false }));
          onStartChildCombined(count, 'test');
        },
      });
    } else {
      onOpenSetup({
        selectedOperations: ['addition', 'subtraction', 'multiplication', 'division'],
        mode: 'test',
        isAdaptive: true,
        questionCount: 20,
      });
    }
  };

  const handleOpenOpCardModal = (op: typeof operations[0]) => {
    if (appMode === 'child') {
      setCountModalState({
        isOpen: true,
        title: `آزمون ${op.title}`,
        subtitle: 'تعداد سوالات آزمون رو انتخاب کن. در حالت آزمون، دقت و سرعت تو سنجیده می‌شه!',
        icon: op.symbol,
        mode: 'test',
        colorGradient: op.color,
        badgeText: '🏆 حالت آزمون',
        options: [5, 10, 15, 20],
        defaultCount: 10,
        onConfirm: (count: number) => {
          setCountModalState((prev) => ({ ...prev, isOpen: false }));
          onStartChildQuickOperation(op.id as OperationType, count, 'test');
        },
      });
    } else {
      onOpenSetup({
        selectedOperations: [op.id as any],
        mode: 'test',
      });
    }
  };

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
        const [mistakes, results, overview, plan, promo] = await Promise.all([
          storage.getMistakes(),
          storage.getResults(),
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

  // Dynamic Daily Challenges List
  const dailyChallenges: DailyChallengeItem[] = useMemo(() => {
    const list: DailyChallengeItem[] = [];

    // Challenge 1: Daily Mission
    const dailyTarget = 10;
    const isDailyDone = todaySolved >= dailyTarget;
    list.push({
      id: 'daily-mission',
      badgeText: 'ماموریت روزانه',
      badgeIcon: '⚡',
      badgeColor: 'bg-amber-400 text-slate-950',
      title: 'ماجراجویی امروز قهرمان',
      description: '۱۰ معما برای گرم کردن ذهن و تثبیت زنجیره تمرین روزانه شما',
      rewardXp: 50,
      rewardCoins: 10,
      progressCurrent: Math.min(todaySolved, dailyTarget),
      progressTotal: dailyTarget,
      isCompleted: isDailyDone,
      actionText: isDailyDone ? 'تمرین اضافه' : 'شروع ماموریت',
      actionIcon: '🚀',
      bgGradient: 'bg-gradient-to-br from-amber-300 via-amber-200 to-yellow-300 text-slate-950',
      borderAccent: 'border-amber-400/80',
      cardIcon: '⚡',
      onAction: () => {
        if (appMode === 'child') {
          onStartChildQuickOperation(adaptivePlan?.primaryOperation || 'addition');
        } else {
          onOpenSetup({ mode: 'practice', questionCount: 10 });
        }
      },
    });

    // Challenge 2: Mistakes Vault or Smart Review
    if (unresolvedMistakesCount > 0) {
      list.push({
        id: 'mistakes-vault',
        badgeText: 'فرصت طلایی',
        badgeIcon: '💡',
        badgeColor: 'bg-rose-500 text-white',
        title: 'پاک‌سازی گنجینه اشتباهات',
        description: `تو ${toPersianDigits(unresolvedMistakesCount)} سوال حل‌نشده داری. با حل دوباره‌شون امتیاز کامل و نشان پشتکار بگیر!`,
        rewardXp: 40,
        rewardCoins: 8,
        progressCurrent: 0,
        progressTotal: unresolvedMistakesCount,
        isCompleted: false,
        actionText: 'اصلاح اشتباهات',
        actionIcon: '✏️',
        bgGradient: 'bg-gradient-to-br from-rose-400 via-pink-300 to-rose-300 text-slate-950',
        borderAccent: 'border-rose-400',
        cardIcon: '💡',
        onAction: () => onNavigate('mistakes'),
      });
    } else {
      list.push({
        id: 'smart-review',
        badgeText: 'مرور تطبیقی',
        badgeIcon: '🤖',
        badgeColor: 'bg-violet-600 text-white',
        title: 'مرور هوشمند و تحکیم مهارت‌ها',
        description: '۱۰ سوال گلچین شده بر اساس سابقه عملکرد برای ارتقای سرعت و تسلط حافظه',
        rewardXp: 45,
        rewardCoins: 9,
        isCompleted: false,
        actionText: 'ورود به مرور هوشمند',
        actionIcon: '✨',
        bgGradient: 'bg-gradient-to-br from-violet-300 via-indigo-200 to-purple-300 text-slate-950',
        borderAccent: 'border-violet-400',
        cardIcon: '🤖',
        onAction: handleOpenSmartReview,
      });
    }

    // Challenge 3: Teacher Focus Challenge
    if (adaptivePlan?.neglectedOperations && adaptivePlan.neglectedOperations.length > 0) {
      const op = adaptivePlan.neglectedOperations[0];
      const opNames: Record<OperationType, string> = {
        addition: 'جمع',
        subtraction: 'تفریق',
        multiplication: 'ضرب',
        division: 'تقسیم',
        mixed: 'ترکیبی',
      };
      const opName = opNames[op] || 'این بخش';
      list.push({
        id: `focus-${op}`,
        badgeText: 'تعادل مهارت‌ها',
        badgeIcon: '🎯',
        badgeColor: 'bg-teal-600 text-white',
        title: `درخشش در ${opName}`,
        description: `پیشنهاد معلم: تمرین روی ${opName} برای ایجاد توازن و رسیدن به تسلط در همه عملیات‌ها`,
        rewardXp: 45,
        rewardCoins: 8,
        isCompleted: false,
        actionText: `تمرین ${opName}`,
        actionIcon: '🌟',
        bgGradient: 'bg-gradient-to-br from-teal-300 via-emerald-200 to-teal-200 text-slate-950',
        borderAccent: 'border-teal-400',
        cardIcon: '🎯',
        onAction: () => {
          if (appMode === 'child') {
            onStartChildQuickOperation(op, 10, 'test');
          } else {
            onOpenSetup({ selectedOperations: [op], mode: 'test', questionCount: 10 });
          }
        },
      });
    } else if (adaptivePlan?.recommendedSkillId) {
      const tierDef = getTierDefinition(adaptivePlan.primaryOperation, adaptivePlan.recommendedTier || 1);
      list.push({
        id: 'tier-challenge',
        badgeText: 'گام به گام تا استادی',
        badgeIcon: '🌟',
        badgeColor: 'bg-sky-600 text-white',
        title: `چالش مرحله: ${tierDef.stageNameFa}`,
        description: tierDef.pedagogicalGoalFa || 'یک مرحله جلوتر برو و به تسلط کامل در این سطح برس!',
        rewardXp: 50,
        rewardCoins: 10,
        isCompleted: false,
        actionText: 'شروع مرحله جدید',
        actionIcon: '🚀',
        bgGradient: 'bg-gradient-to-br from-sky-300 via-blue-200 to-indigo-200 text-slate-950',
        borderAccent: 'border-sky-400',
        cardIcon: '🌟',
        onAction: () => {
          if (appMode === 'child') {
            onStartChildQuickOperation(adaptivePlan.primaryOperation, 10, 'test');
          } else {
            onOpenSetup({ selectedOperations: [adaptivePlan.primaryOperation], mode: 'test', questionCount: 10 });
          }
        },
      });
    }

    // Challenge 4: Combined Quiz Challenge
    list.push({
      id: 'combined-grand-challenge',
      badgeText: 'آزمون جامع',
      badgeIcon: '👑',
      badgeColor: 'bg-indigo-700 text-white',
      title: 'چالش بزرگ چهار عمل اصلی',
      description: '۲۰ معمای هوشمند ترکیبی از جمع، تفریق، ضرب و تقسیم برای قهرمانان واقعی',
      rewardXp: 75,
      rewardCoins: 15,
      isCompleted: false,
      actionText: 'شروع چالش ترکیبی',
      actionIcon: '👑',
      bgGradient: 'bg-gradient-to-br from-indigo-300 via-purple-200 to-pink-200 text-slate-950',
      borderAccent: 'border-indigo-400',
      cardIcon: '🧮',
      onAction: () => {
        if (appMode === 'child') {
          onStartChildCombined(20, 'test');
        } else {
          onOpenSetup({
            selectedOperations: ['addition', 'subtraction', 'multiplication', 'division'],
            mode: 'test',
            isAdaptive: true,
            questionCount: 20,
          });
        }
      },
    });

    // Challenge 5: Accuracy Master Challenge
    list.push({
      id: 'accuracy-challenge',
      badgeText: 'دقت طلایی',
      badgeIcon: '🎯',
      badgeColor: 'bg-emerald-600 text-white',
      title: 'قهرمان بدون خطا',
      description: 'حل آزمون ۱۰ سوالی با دقت بالای ۹۰٪ برای دریافت نشان استاد بی‌خطا',
      rewardXp: 60,
      rewardCoins: 12,
      isCompleted: false,
      actionText: 'شروع آزمون بدون خطا',
      actionIcon: '🎯',
      bgGradient: 'bg-gradient-to-br from-emerald-300 via-teal-200 to-green-200 text-slate-950',
      borderAccent: 'border-emerald-400',
      cardIcon: '🏆',
      onAction: () => {
        if (appMode === 'child') {
          onStartChildQuickOperation(adaptivePlan?.primaryOperation || 'addition', 10, 'test');
        } else {
          onOpenSetup({ mode: 'test', questionCount: 10, isAdaptive: true });
        }
      },
    });

    return list;
  }, [
    todaySolved,
    unresolvedMistakesCount,
    adaptivePlan,
    appMode,
    onStartChildQuickOperation,
    onStartChildCombined,
    onOpenSetup,
    onNavigate,
  ]);

  const operations = [
    {
      id: 'addition',
      title: 'جمع اعداد',
      enTitle: 'Addition',
      symbol: '➕',
      color: 'from-emerald-500 to-teal-600',
      borderLight: 'border-emerald-200 dark:border-emerald-800',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      desc: 'یادگیری و تمرین سریع جمع',
    },
    {
      id: 'subtraction',
      title: 'تفریق و منها',
      enTitle: 'Subtraction',
      symbol: '➖',
      color: 'from-sky-500 to-blue-600',
      borderLight: 'border-sky-200 dark:border-sky-800',
      textColor: 'text-sky-600 dark:text-sky-400',
      desc: 'مهارت در کاستن و تفریق سریع',
    },
    {
      id: 'multiplication',
      title: 'جدول ضرب',
      enTitle: 'Multiplication',
      symbol: '✖️',
      color: 'from-amber-500 to-orange-600',
      borderLight: 'border-amber-200 dark:border-amber-800',
      textColor: 'text-amber-600 dark:text-amber-400',
      desc: 'تسلط آسان بر جدول ضرب',
    },
    {
      id: 'division',
      title: 'تقسیم هوشمند',
      enTitle: 'Division',
      symbol: '➗',
      color: 'from-violet-500 to-purple-600',
      borderLight: 'border-violet-200 dark:border-violet-800',
      textColor: 'text-violet-600 dark:text-violet-400',
      desc: 'تقسیم عادلانه و بخش‌پذیری',
    },
  ];

  const isGirl = profile.gender === 'girl';
  const characterHalfImgSrc = isGirl
    ? getAssetUrl('assets/characters/girl/girl half.webp')
    : getAssetUrl('assets/characters/boy/boy half.webp');
  const characterHalfFallbackSrc = isGirl
    ? getFallbackAssetUrl('assets/characters/girl/girl half.webp')
    : getFallbackAssetUrl('assets/characters/boy/boy half.webp');

  return (
    <div className="w-full max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 animate-fade-in">
      {/* 1. Header / Hero Bar Card - Compact & Responsive */}
      <div
        id="dashboard-welcome-card"
        className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 rounded-3xl p-5 sm:p-6 lg:p-7 text-white shadow-xl flex flex-col"
      >
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-amber-400/15 rounded-full blur-2xl pointer-events-none" />

        {/* --- A. Mobile Layout (< md) --- */}
        <div className="flex flex-col md:hidden">
          {/* Greeting Header with Fiery Bouncing Streak Badge */}
          <div className="relative z-10 text-center pt-3 pb-1 px-4">
            <div className="flex items-center justify-center gap-2 mb-1 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                {getGreeting()}، {profile.name}!
              </h2>
              <div
                onClick={() => onNavigate('achievements')}
                className="cursor-pointer animate-bounce select-none inline-flex items-center gap-1 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 text-white font-black text-xs px-2.5 py-1 rounded-full border border-amber-300/70 shadow-md shadow-orange-500/40 transform hover:scale-105 transition-transform shrink-0"
                title="تعداد روزهای متوالی تمرین ریاضی"
              >
                <span className="text-sm animate-pulse">🔥</span>
                <span>{formatNumber(profile.streakDays, 'persian')} روز متوالی</span>
              </div>
            </div>
            <p className="text-xs text-indigo-100/90 font-medium">
              امروز آماده‌ای معماهای جذاب حل کنی و قهرمان روز بشی؟ 🌟
            </p>
          </div>

          {/* Medals & Character Row: Medals enlarged, inside bigger boxes, and vertically aligned with center of character */}
          <div className="relative z-10 flex items-end justify-center gap-2 sm:gap-4 -mb-[1px]">
            {/* Trophy Cup on the Right (RTL right) */}
            <div
              onClick={() => onNavigate('achievements')}
              className="flex flex-col items-center gap-1 cursor-pointer group mb-14 sm:mb-16 select-none transition-transform hover:scale-105 active:scale-95 shrink-0"
              title={`مشاهده تالار افتخارات (${trophyInfo?.stageNameFa || 'جام قهرمان'})`}
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md p-1.5 border border-white/20 shadow-md flex items-center justify-center">
                <img
                  src={getTrophyCupUrl(trophyInfo?.stage || 1)}
                  alt="جام قهرمانی"
                  className="w-full h-full object-contain filter drop-shadow-md group-hover:scale-110 transition-transform"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.dataset.fallback) {
                      target.dataset.fallback = '1';
                      target.src = getTrophyCupFallbackUrl(trophyInfo?.stage || 1);
                    }
                  }}
                />
              </div>
              <span className="text-[10px] sm:text-xs font-black text-amber-200 text-center max-w-[80px] sm:max-w-[96px] truncate">
                {trophyInfo?.stageNameFa || 'جام قهرمان'}
              </span>
            </div>

            {/* Character in the Center (Touches level chart directly below with zero gap) */}
            <div
              onClick={() => onNavigate('profile')}
              className="cursor-pointer group flex justify-center items-end leading-none z-10"
              title="مشاهده پروفایل"
            >
              <img
                src={characterHalfImgSrc}
                alt={profile.name || 'قهرمان ریاضی'}
                className="h-48 sm:h-56 w-auto object-contain object-bottom block select-none pointer-events-auto filter drop-shadow-2xl group-hover:scale-105 transition-transform duration-300 origin-bottom -mb-[1px]"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.dataset.fallback) {
                    target.dataset.fallback = '1';
                    target.src = characterHalfFallbackSrc;
                  }
                }}
              />
            </div>

            {/* Stage Medal on the Left (RTL left) */}
            <div
              onClick={() => onNavigate('profile')}
              className="flex flex-col items-center gap-1 cursor-pointer group mb-14 sm:mb-16 select-none transition-transform hover:scale-105 active:scale-95 shrink-0"
              title={`مدال سطح ${levelInfo.level} (${levelInfo.title})`}
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md p-1.5 border border-white/20 shadow-md flex items-center justify-center">
                <StageIcon level={levelInfo.level} size="fill" className="w-full h-full group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-[10px] sm:text-xs font-black text-indigo-100 text-center max-w-[80px] sm:max-w-[96px] truncate">
                {levelInfo.title}
              </span>
            </div>
          </div>

          {/* Level & XP Progress Bar */}
          <div className="relative z-20 bg-black/25 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 w-full max-w-md mx-auto space-y-1.5 shadow-lg">
            <div className="flex items-center justify-between text-xs font-extrabold">
              <span className="flex items-center gap-1.5">
                <StageIcon level={levelInfo.level} size="xs" className="w-4 h-4" />
                <span>سطح {formatNumber(levelInfo.level, 'persian')}</span>
              </span>
              <span className="text-amber-300 font-black">
                {formatNumber(levelInfo.xpInCurrentLevel, 'persian')} / {formatNumber(levelInfo.xpRequiredForNextLevel, 'persian')} XP
              </span>
            </div>
            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${Math.max(4, levelInfo.progressPercent)}%` }}
              />
            </div>
          </div>
        </div>

        {/* --- B. Horizontal Tablet & Larger Screens (>= md) --- */}
        <div className="hidden md:flex flex-row items-end justify-between gap-6 lg:gap-10 pt-3 sm:pt-4 px-2 lg:px-4">
          {/* Right Side (Visual Right in RTL): Greeting at top, 2 Medals 2-col Grid at bottom */}
          <div className="flex-1 flex flex-col justify-between self-stretch space-y-4 py-2">
            <div className="space-y-2 text-right">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl lg:text-3xl xl:text-4xl font-black tracking-tight">
                  {getGreeting()}، {profile.name}!
                </h2>
                {/* Fiery Bouncing Streak Banner */}
                <div
                  onClick={() => onNavigate('achievements')}
                  className="cursor-pointer animate-bounce select-none inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 text-white font-black text-xs lg:text-sm px-3.5 py-1.5 rounded-full border border-amber-300/70 shadow-lg shadow-orange-500/50 transform hover:scale-105 transition-transform shrink-0"
                  title="تعداد روزهای متوالی تمرین ریاضی"
                >
                  <span className="text-base animate-pulse">🔥</span>
                  <span>{formatNumber(profile.streakDays, 'persian')} روز متوالی</span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-indigo-100/90 font-medium">
                امروز آماده‌ای معماهای جذاب حل کنی و قهرمان روز بشی؟ 🌟
              </p>
            </div>

            {/* 2-Column Medals Grid at Bottom of Right Side */}
            <div className="grid grid-cols-2 gap-4 max-w-md pt-2">
              {/* 1. Trophy Cup Box */}
              <div
                onClick={() => onNavigate('achievements')}
                className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 shadow-lg cursor-pointer transition-all hover:scale-105 active:scale-95 group select-none"
                title={`مشاهده تالار افتخارات (${trophyInfo?.stageNameFa || 'جام قهرمان'})`}
              >
                <div className="w-20 h-20 lg:w-24 lg:h-24 flex items-center justify-center p-1">
                  <img
                    src={getTrophyCupUrl(trophyInfo?.stage || 1)}
                    alt="جام قهرمانی"
                    className="w-full h-full object-contain filter drop-shadow-md group-hover:scale-110 transition-transform"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.dataset.fallback) {
                        target.dataset.fallback = '1';
                        target.src = getTrophyCupFallbackUrl(trophyInfo?.stage || 1);
                      }
                    }}
                  />
                </div>
                <span className="text-xs lg:text-sm font-black text-amber-200 mt-2 text-center truncate max-w-full">
                  {trophyInfo?.stageNameFa || 'جام قهرمان'}
                </span>
              </div>

              {/* 2. Stage Medal Box */}
              <div
                onClick={() => onNavigate('profile')}
                className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 shadow-lg cursor-pointer transition-all hover:scale-105 active:scale-95 group select-none"
                title={`مدال سطح ${levelInfo.level} (${levelInfo.title})`}
              >
                <div className="w-20 h-20 lg:w-24 lg:h-24 flex items-center justify-center p-1">
                  <StageIcon level={levelInfo.level} size="fill" className="w-full h-full group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-xs lg:text-sm font-black text-indigo-100 mt-2 text-center truncate max-w-full">
                  {levelInfo.title}
                </span>
              </div>
            </div>
          </div>

          {/* Left Side (Visual Left in RTL): Character on top, level chart directly underneath with zero distance */}
          <div className="w-full max-w-xs lg:max-w-sm shrink-0 flex flex-col items-center justify-end">
            {/* Character Photo */}
            <div
              onClick={() => onNavigate('profile')}
              className="cursor-pointer group flex justify-center items-end leading-none z-10"
              title="مشاهده پروفایل"
            >
              <img
                src={characterHalfImgSrc}
                alt={profile.name || 'قهرمان ریاضی'}
                className="h-48 lg:h-56 xl:h-64 w-auto object-contain object-bottom block select-none pointer-events-auto filter drop-shadow-2xl group-hover:scale-105 transition-transform duration-300 origin-bottom -mb-[1px]"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.dataset.fallback) {
                    target.dataset.fallback = '1';
                    target.src = characterHalfFallbackSrc;
                  }
                }}
              />
            </div>

            {/* Level Chart underneath character */}
            <div className="relative z-20 bg-black/25 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 w-full space-y-1.5 shadow-lg">
              <div className="flex items-center justify-between text-xs font-extrabold">
                <span className="flex items-center gap-1.5">
                  <StageIcon level={levelInfo.level} size="xs" className="w-4 h-4" />
                  <span>سطح {formatNumber(levelInfo.level, 'persian')}</span>
                </span>
                <span className="text-amber-300 font-black">
                  {formatNumber(levelInfo.xpInCurrentLevel, 'persian')} / {formatNumber(levelInfo.xpRequiredForNextLevel, 'persian')} XP
                </span>
              </div>
              <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${Math.max(4, levelInfo.progressPercent)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2 & 3. Daily Challenges & Smart Teacher Recommendation (2-Col Grid on md+ screens, Exactly Equal Height) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-start">
        <div className="w-full">
          <DailyChallengesCardStack challenges={dailyChallenges} />
        </div>
        <div className="w-full">
          <TeacherRecommendationCard
            plan={adaptivePlan}
            onStartRecommended={handleStartAdaptiveRecommendation}
            appMode={appMode}
          />
        </div>
      </div>

      {/* 4. Math Operations Categories (The Core 4 Cards + Combined Action & Mistakes Vault 2-Col Grid) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span>📚</span>
              <span>عملیات‌های اصلی ریاضی</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {appMode === 'child'
                ? 'برای شروع تمرین هوشمند و متناسب با سطحت، روی عملیات مورد نظرت ضربه بزن'
                : 'انتخاب عملیات برای شروع آزمون یا تمرین'}
            </p>
          </div>
          {appMode === 'parent' && (
            <button
              onClick={() => onNavigate('presets')}
              className="text-xs font-black text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              الگوهای ذخیره‌شده ←
            </button>
          )}
        </div>

        {/* Combined Quiz & Mistakes Vault Grid (2 Columns on md+ screens) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {/* 1. Distinct Combined Quiz Action Banner */}
          <div
            id="home-combined-quiz-card"
            onClick={handleOpenCombinedModal}
            className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 rounded-3xl p-4 sm:p-5 text-white shadow-lg flex items-center justify-between gap-3 sm:gap-4 border border-indigo-700/50 hover:shadow-xl hover:scale-[1.005] active:scale-[0.99] transition-all cursor-pointer group h-full"
            role="button"
            tabIndex={0}
            title="شروع آزمون جامع چهار عمل اصلی"
          >
            {/* Right Side: Title & Description */}
            <div className="flex items-center gap-3 sm:gap-4 text-right">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/10 flex items-center justify-center text-xl sm:text-2xl shadow-inner shrink-0 group-hover:scale-110 transition-transform">
                🌟
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 shadow-xs">
                    چالش ترکیبی
                  </span>
                  <span className="text-xs font-bold text-amber-200">
                    ۲۰ سوال هوشمند
                  </span>
                </div>
                <h4 className="text-sm sm:text-base font-black text-white group-hover:text-amber-200 transition-colors">
                  آزمون جامع چهار عمل اصلی
                </h4>
                <p className="text-[11px] sm:text-xs text-indigo-200 font-medium line-clamp-1">
                  ترکیب هم‌زمان جمع، تفریق، ضرب و تقسیم در یک چالش هیجان‌انگیز
                </p>
              </div>
            </div>

            {/* Left Side: 4 Operation Symbols mini cluster */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="grid grid-cols-2 gap-1 p-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-inner group-hover:scale-105 transition-all">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-[10px] sm:text-xs font-black text-white">
                  ➕
                </div>
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-[10px] sm:text-xs font-black text-white">
                  ➖
                </div>
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-[10px] sm:text-xs font-black text-white">
                  ✖️
                </div>
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-[10px] sm:text-xs font-black text-white">
                  ➗
                </div>
              </div>
            </div>
          </div>

          {/* 2. Mistakes Vault Action Banner */}
          <div
            id="home-mistakes-vault-card"
            onClick={() => onNavigate('mistakes')}
            className="bg-gradient-to-r from-teal-900 via-emerald-800 to-teal-950 rounded-3xl p-4 sm:p-5 text-white shadow-lg flex items-center justify-between gap-3 sm:gap-4 border border-emerald-700/50 hover:shadow-xl hover:scale-[1.005] active:scale-[0.99] transition-all cursor-pointer group h-full"
            role="button"
            tabIndex={0}
            title="ورود به گنجینه اشتباهات و مرور هوشمند"
          >
            {/* Right Side: Title & Description */}
            <div className="flex items-center gap-3 sm:gap-4 text-right">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/10 flex items-center justify-center text-xl sm:text-2xl shadow-inner shrink-0 group-hover:scale-110 transition-transform">
                💎
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950 shadow-xs">
                    مرور هوشمند
                  </span>
                  <span className="text-xs font-bold text-emerald-200">
                    {unresolvedMistakesCount > 0
                      ? `${formatNumber(unresolvedMistakesCount, 'persian')} سوال نیازمند تمرین`
                      : 'گنجینه کاملاً پاک'}
                  </span>
                </div>
                <h4 className="text-sm sm:text-base font-black text-white group-hover:text-emerald-200 transition-colors">
                  گنجینه اشتباهات و یادگیری
                </h4>
                <p className="text-[11px] sm:text-xs text-emerald-100/80 font-medium line-clamp-1">
                  {unresolvedMistakesCount > 0
                    ? 'تبدیل اشتباهات گذشته به نقطه قوت و دریافت نشان پشتکار'
                    : 'همه سوالات رو درست حل کردی! آفرین قهرمان ریاضی'}
                </p>
              </div>
            </div>

            {/* Left Side: Count */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-inner flex flex-col items-center justify-center text-center group-hover:scale-105 transition-all">
                <span className="text-sm font-black text-emerald-300">
                  {formatNumber(unresolvedMistakesCount, 'persian')}
                </span>
                <span className="text-[9px] font-bold text-emerald-100/70">مورد</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Core Math Operations Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {operations.map((op) => {
            const mastery = opMastery[op.id] || { accuracy: 0, stars: 1 };
            return (
              <div
                key={op.id}
                id={`home-op-card-${op.id}`}
                onClick={() => handleOpenOpCardModal(op)}
                className={`bg-white dark:bg-slate-900 rounded-2xl p-4 border ${op.borderLight} shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group hover:-translate-y-0.5`}
              >
                {/* Title & Description with Operation Icon on the left */}
                <div className="flex items-center justify-between gap-2.5">
                  <div className="flex-1 min-w-0 text-right">
                    <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 transition-colors">
                      {op.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                      {op.desc}
                    </p>
                  </div>

                  {/* Operation Icon positioned to the left of texts */}
                  <div
                    className={`shrink-0 w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br ${op.color} flex items-center justify-center text-lg sm:text-xl text-white shadow-sm group-hover:scale-105 transition-transform`}
                  >
                    {op.symbol}
                  </div>
                </div>

                {/* Bottom Stats & Mastery Stars (Arrow removed, 3 stars placed at bottom-left) */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className={`text-[10px] sm:text-[11px] font-extrabold ${op.textColor}`}>
                    دقت: ٪{formatNumber(mastery.accuracy, 'persian')}
                  </span>
                  {/* Mastery Stars */}
                  <div className="flex items-center gap-0.5" title={`تسلط: ${mastery.stars} از ۳ ستاره`}>
                    {[1, 2, 3].map((starIndex) => (
                      <span
                        key={starIndex}
                        className={`text-xs sm:text-sm ${
                          starIndex <= mastery.stars ? 'text-amber-400' : 'text-slate-300 dark:text-slate-700'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Compact Activity & Trophy Highlight Bar (Single Row, No Endless Scroll) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        {/* Today's Solved */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200/70 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-lg text-indigo-600 dark:text-indigo-400">
              🎯
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500">سوالات حل‌شده امروز</p>
              <p className="text-base font-black text-slate-900 dark:text-slate-100">
                {formatNumber(todaySolved, 'persian')} سوال
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('progress')}
            className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            کارنامه ←
          </button>
        </div>

        {/* Today's XP */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200/70 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-lg text-amber-500">
              ⭐
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500">امتیاز کسب‌شده امروز</p>
              <p className="text-base font-black text-amber-500">
                {formatNumber(todayXp, 'persian')} XP
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-slate-400">
            {formatNumber(profile.streakDays, 'persian')} روز متوالی
          </span>
        </div>

        {/* Achievements & Trophy */}
        <div
          onClick={() => onNavigate('achievements')}
          className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200/70 dark:border-slate-800 shadow-xs flex items-center justify-between cursor-pointer hover:border-amber-300 transition-colors group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center">
              <img
                src={getTrophyCupUrl(trophyInfo?.stage || 1)}
                alt="جام"
                className="w-5 h-5 object-contain"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.dataset.fallback) {
                    target.dataset.fallback = '1';
                    target.src = getTrophyCupFallbackUrl(trophyInfo?.stage || 1);
                  }
                }}
              />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500">نشان‌ها و جام</p>
              <p className="text-xs font-black text-slate-800 dark:text-slate-100">
                {formatNumber(unlockedBadgesCount, 'persian')} از {formatNumber(totalBadgesCount, 'persian')} نشان
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 group-hover:underline">
            تالار افتخارات ←
          </span>
        </div>
      </div>

      {/* Parent Mode Test Patterns (if applicable) */}
      {appMode === 'parent' && testPatterns && testPatterns.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-1.5">
              <span>📋</span>
              <span>الگوهای برگزیده آزمون</span>
            </h4>
            <button
              onClick={() => onNavigate('presets')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              همه الگوها ({toPersianDigits(testPatterns.length)}) ←
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {testPatterns.slice(0, 3).map((pattern) => (
              <div
                key={pattern.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-2"
              >
                <div className="space-y-0.5">
                  <span className="text-xs font-black text-slate-800 dark:text-slate-100 line-clamp-1">
                    {pattern.title}
                  </span>
                  <p className="text-[10px] text-slate-400">
                    {toPersianDigits(pattern.config.questionCount)} سوال
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onStartPattern(pattern)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shrink-0 cursor-pointer shadow-xs"
                >
                  شروع 🚀
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legacy preset fallback for test execution if needed */}
      {false && (
        <div style={{ display: 'none' }} />
      )}

      {/* Smart Review Child-friendly Preview Modal */}
      <SmartReviewModal
        isOpen={isSmartReviewModalOpen}
        state={smartReviewState}
        onClose={() => setIsSmartReviewModalOpen(false)}
        onStart={handleConfirmStartSmartReview}
      />

      {/* Quick Question Count Selection Modal */}
      <QuickQuestionCountModal
        isOpen={countModalState.isOpen}
        title={countModalState.title}
        subtitle={countModalState.subtitle}
        icon={countModalState.icon}
        mode={countModalState.mode}
        colorGradient={countModalState.colorGradient}
        badgeText={countModalState.badgeText}
        options={countModalState.options}
        defaultCount={countModalState.defaultCount}
        onClose={() => setCountModalState((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={countModalState.onConfirm}
      />

      {/* Adaptive Promotion Celebration Modal */}
      {pendingPromotion && (
        <PromotionModal
          promotion={pendingPromotion}
          onAccept={handleAcceptPromotion}
        />
      )}
    </div>
  );
};

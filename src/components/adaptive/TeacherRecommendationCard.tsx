/**
 * TeacherRecommendationCard (Smart Teacher Card Stack) Component for Math Hero.
 * Reusable, encouraging, pedagogical smart teacher recommendation card deck:
 * - Displays a stacked deck of pedagogical recommendations and learning insights.
 * - Dynamic data-driven: integrates AdaptiveLearningPlan and PerformanceInsights.
 * - Card Stack transitions with 3D physical layers, swipe gesture handling, dots & arrow navigation.
 * - Shared identically between Home screen and Progress / Statistics screen.
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';
import { OperationType } from '../../types';
import { AdaptiveLearningPlan } from '../../adaptive/adaptiveTypes';
import { PerformanceInsights } from '../../statistics/statisticsTypes';
import { toPersianDigits, formatNumber } from '../../utils/persian';
import { getTierDefinition } from '../../adaptive/tierRegistry';
import { SmartTeacherEngine } from '../../adaptive/smartTeacherEngine';
import { PopoutOwlAvatar } from './PopoutOwlAvatar';

export interface TeacherRecommendationItem {
  id: string;
  badgeText: string;
  badgeIcon: string;
  badgeColor?: string;
  title: string;
  description: string;
  actionText: string;
  cardIcon: string;
  bgGradient: string;
  borderAccent: string;
  targetOp: OperationType;
}

export interface TeacherRecommendationCardProps {
  plan?: AdaptiveLearningPlan | null;
  insights?: PerformanceInsights | null;
  onStartRecommended: (op: OperationType) => void;
  appMode?: 'child' | 'parent';
  className?: string;
  variant?: 'card' | 'compact';
  showHeader?: boolean;
}

const OP_TITLES: Record<OperationType, string> = {
  addition: 'جمع',
  subtraction: 'تفریق',
  multiplication: 'ضرب',
  division: 'تقسیم',
  mixed: 'ترکیبی',
};

/**
 * TeacherCardContent: Preloaded visual and interactive representation of a teacher recommendation card.
 * Shared between the active card and the preloaded underneath card.
 */
const TeacherCardContent: React.FC<{
  card: TeacherRecommendationItem;
  onAction?: () => void;
  isInteractive?: boolean;
}> = ({ card, onAction, isInteractive = true }) => {
  return (
    <>
      {/* Background decorative watermark */}
      <div className="absolute -bottom-10 -right-10 w-36 h-36 bg-orange-200/20 dark:bg-amber-400/5 rounded-full blur-2xl pointer-events-none" />

      {/* Content Row: Badges, Title & Description on Right; Owl Avatar on Top-Left (in RTL) */}
      <div className="relative z-10 my-auto flex items-start justify-between gap-3 sm:gap-4">
        {/* Right Side: Badges, Title, Pedagogical Description (Position & structure unchanged) */}
        <div className="flex-1 min-w-0 flex flex-col justify-start text-right space-y-1 sm:space-y-1.5 pt-0.5">
          {/* Badges */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/30 text-amber-950 dark:text-amber-200 text-[11px] sm:text-xs font-black shadow-xs shrink-0">
              <span>✨</span>
              <span>پیشنهاد معلم هوشمند</span>
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-black shadow-xs shrink-0 ${
                card.badgeColor || 'bg-amber-100 text-amber-900'
              }`}
            >
              {card.badgeText}
            </span>
          </div>

          {/* Title */}
          <h4 className="text-sm sm:text-base md:text-lg font-black tracking-tight text-slate-950 dark:text-white line-clamp-1">
            {card.title}
          </h4>

          {/* Pedagogical Description */}
          <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed">
            {card.description}
          </p>
        </div>

        {/* Left Side (in RTL): 3D Pop-out Owl Avatar at Top-Left */}
        <div className="shrink-0 self-start -mt-2 sm:-mt-3 -ml-0.5 sm:-ml-1">
          <PopoutOwlAvatar sizeClassName="w-20 h-20 sm:w-24 sm:h-24 md:w-26 md:h-26" />
        </div>
      </div>

      {/* Bottom Row: Full-width Action Button */}
      <div className="relative z-10 pt-1">
        <button
          type="button"
          tabIndex={isInteractive ? 0 : -1}
          onPointerDown={(e) => {
            if (!isInteractive) return;
            e.stopPropagation();
          }}
          onClick={(e) => {
            if (!isInteractive) return;
            e.stopPropagation();
            onAction?.();
          }}
          className={`w-full py-2.5 sm:py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 ${
            isInteractive ? 'cursor-pointer' : 'pointer-events-none'
          }`}
        >
          <span>{card.actionText}</span>
        </button>
      </div>
    </>
  );
};

export const TeacherRecommendationCard: React.FC<TeacherRecommendationCardProps> = ({
  plan: propPlan,
  insights,
  onStartRecommended,
  appMode = 'child',
  className = '',
  variant = 'card',
  showHeader = true,
}) => {
  const [internalPlan, setInternalPlan] = useState<AdaptiveLearningPlan | null>(propPlan || null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragDir, setDragDir] = useState<'next' | 'prev'>('next');
  const [overrideUnderneathIndex, setOverrideUnderneathIndex] = useState<number | null>(null);
  const isAnimatingRef = useRef(false);

  // Real-time Motion Values for physical circular orbit gestures
  const x = useMotionValue(0);

  // Dynamically update the revealed underneath card based on real-time drag direction
  useEffect(() => {
    const unsubscribe = x.on('change', (latestX) => {
      if (latestX > 4) {
        setDragDir('prev');
      } else if (latestX < -4) {
        setDragDir('next');
      }
    });
    return () => unsubscribe();
  }, [x]);

  // Large circular orbit trajectory mapping (Radius R ≈ 1800px):
  // Smooth, gentle curve preventing steep downward drop
  const y = useTransform(x, (currentX) => (currentX * currentX) / 3600);
  // Tangential rotation along the circular orbit:
  const rotate = useTransform(x, (currentX) => (currentX / 1800) * 18);
  // Subtle fading out once thrown past threshold:
  const opacity = useTransform(x, [-580, -380, 0, 380, 580], [0, 0.96, 1, 0.96, 0]);

  // Underneath card reactive interpolation:
  // At rest (x=0), underneath card visibly peeks out below the top card by ~12-14px to form a distinct 2-card deck.
  // As top card is swiped along its orbit, underneath card rises to y=0 and expands to full scale.
  const underneathScaleX = useTransform(x, [-380, 0, 380], [1, 0.94, 1]);
  const underneathScaleY = useTransform(x, [-380, 0, 380], [1, 0.98, 1]);
  const underneathY = useTransform(x, [-380, 0, 380], [0, 14, 0]);
  const underneathOpacity = useTransform(x, [-380, 0, 380], [1, 0.92, 1]);

  // Auto-fetch plan if not provided by parent
  useEffect(() => {
    if (propPlan !== undefined) {
      setInternalPlan(propPlan);
    } else {
      let isMounted = true;
      SmartTeacherEngine.getLearningPlan()
        .then((p) => {
          if (isMounted) setInternalPlan(p);
        })
        .catch(() => {});
      return () => {
        isMounted = false;
      };
    }
  }, [propPlan]);

  const activePlan = propPlan !== undefined ? propPlan : internalPlan;

  // Build recommendation items stack
  const items: TeacherRecommendationItem[] = [];

  // 1. Primary Golden Path / Recommended Tier Card
  if (activePlan?.recommendedSkillId) {
    const tierDef = getTierDefinition(activePlan.primaryOperation, activePlan.recommendedTier || 1);
    const opName = OP_TITLES[activePlan.primaryOperation] || 'ریاضی';
    items.push({
      id: `golden-tier-${activePlan.primaryOperation}-${activePlan.recommendedTier || 1}`,
      badgeText: `سطح ${toPersianDigits(activePlan.recommendedTier || 1)}`,
      badgeIcon: '🎯',
      badgeColor: 'bg-amber-100 text-amber-950 dark:bg-amber-900/60 dark:text-amber-200',
      title: `مسیر طلایی: ${tierDef.stageNameFa} 🌟`,
      description: tierDef.pedagogicalGoalFa || `تمرین هدفمند در ${opName} برای رسیدن به تسلط درخشان!`,
      actionText: appMode === 'child' ? `ادامه یادگیری ${tierDef.stageNameFa} 🚀` : `تنظیم مرحله ${tierDef.stageNameFa} ⚙️`,
      cardIcon: '🦉',
      bgGradient: 'bg-gradient-to-br from-amber-50 via-amber-100 to-orange-50 dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 text-slate-950 dark:text-slate-100',
      borderAccent: 'border-amber-200/90 dark:border-amber-700/50',
      targetOp: activePlan.primaryOperation,
    });
  }

  // 2. Neglected Operation or Practice Opportunity Card
  if (activePlan?.neglectedOperations && activePlan.neglectedOperations.length > 0) {
    const op = activePlan.neglectedOperations[0];
    const opName = OP_TITLES[op] || 'این بخش';
    items.push({
      id: `neglected-${op}`,
      badgeText: `تمرکز بر ${opName}`,
      badgeIcon: '💡',
      badgeColor: 'bg-teal-100 text-teal-900 dark:bg-teal-900/60 dark:text-teal-200',
      title: `فرصت درخشش در ${opName}! 🌟`,
      description: `در بقیه بخش‌ها عالی پیش رفتی! بیا امروز چند معمای جذاب ${opName} حل کنیم تا مهارت‌هات متوازن‌تر بشن.`,
      actionText: `تمرین هوشمند ${opName} ✨`,
      cardIcon: '💡',
      bgGradient: 'bg-gradient-to-br from-teal-50 via-emerald-100 to-teal-100 dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 text-slate-950 dark:text-slate-100',
      borderAccent: 'border-teal-200/90 dark:border-teal-700/50',
      targetOp: op,
    });
  } else if (insights?.needsPracticeOperation) {
    const op = insights.needsPracticeOperation.operation;
    const opTitle = insights.needsPracticeOperation.titleFa;
    items.push({
      id: `practice-opportunity-${op}`,
      badgeText: 'فرصت پیشرفت',
      badgeIcon: '🎯',
      badgeColor: 'bg-violet-100 text-violet-900 dark:bg-violet-900/60 dark:text-violet-200',
      title: `تقویت مهارت در ${opTitle} 🎯`,
      description: `دقت فعلی: ${formatNumber(insights.needsPracticeOperation.accuracyPercent, 'persian')}٪ • بیا با حل چند معما به دقت ۱۰۰٪ برسونیش!`,
      actionText: `تمرین اختصاصی ${opTitle} 🚀`,
      cardIcon: '🎯',
      bgGradient: 'bg-gradient-to-br from-violet-50 via-indigo-100 to-purple-100 dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 text-slate-950 dark:text-slate-100',
      borderAccent: 'border-violet-200/90 dark:border-violet-700/50',
      targetOp: op,
    });
  }

  // 3. Strongest Operation / Mastery Celebration Card
  if (insights?.strongestOperation) {
    const op = insights.strongestOperation.operation;
    const opTitle = insights.strongestOperation.titleFa;
    items.push({
      id: `mastery-celebration-${op}`,
      badgeText: 'قوی‌ترین مهارت شما',
      badgeIcon: '👑',
      badgeColor: 'bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200',
      title: `تسلط درخشان در ${opTitle}! 🌟`,
      description: `با ${formatNumber(insights.strongestOperation.accuracyPercent, 'persian')}٪ دقت در حل ${formatNumber(insights.strongestOperation.totalQuestions, 'persian')} سوال، قهرمان این مهارتی!`,
      actionText: `چالش استادی ${opTitle} 👑`,
      cardIcon: '👑',
      bgGradient: 'bg-gradient-to-br from-amber-50 via-yellow-100 to-orange-100 dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 text-slate-950 dark:text-slate-100',
      borderAccent: 'border-amber-300/80 dark:border-amber-700/50',
      targetOp: op,
    });
  } else if (insights?.trendTextFa) {
    items.push({
      id: 'pedagogical-trend',
      badgeText: 'روند یادگیری',
      badgeIcon: '📈',
      badgeColor: 'bg-blue-100 text-blue-900 dark:bg-blue-900/60 dark:text-blue-200',
      title: 'تحلیل رشد و پیشرفت 🚀',
      description: insights.trendTextFa,
      actionText: 'ادامه تمرین هوشمند 🎯',
      cardIcon: '📈',
      bgGradient: 'bg-gradient-to-br from-blue-50 via-sky-100 to-indigo-100 dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 text-slate-950 dark:text-slate-100',
      borderAccent: 'border-blue-200/90 dark:border-blue-700/50',
      targetOp: activePlan?.primaryOperation || 'addition',
    });
  }

  // 4. Fallback / Adaptive Smart Quiz Card
  if (items.length < 2) {
    const primaryOp = activePlan?.primaryOperation || 'addition';
    items.push({
      id: 'smart-adaptive-review',
      badgeText: 'مرور جامع',
      badgeIcon: '🧮',
      badgeColor: 'bg-indigo-100 text-indigo-900 dark:bg-indigo-900/60 dark:text-indigo-200',
      title: 'مرور هوشمند و ترکیبی 🌟',
      description: 'مجموعه‌ای گزینش‌شده از سوالات متناسب با سرعت و دقت پاسخگویی شما برای تثبیت مفاهیم.',
      actionText: 'شروع مرور هوشمند 🚀',
      cardIcon: '🧮',
      bgGradient: 'bg-gradient-to-br from-indigo-50 via-violet-100 to-purple-100 dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 text-slate-950 dark:text-slate-100',
      borderAccent: 'border-indigo-200/90 dark:border-indigo-700/50',
      targetOp: primaryOp,
    });
  }

  // Safety: at least 1 item
  if (items.length === 0) {
    items.push({
      id: 'default-card',
      badgeText: 'پیشنهاد شروع',
      badgeIcon: '✨',
      badgeColor: 'bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200',
      title: 'پیشنهاد هوشمند معلم ریاضی 🌟',
      description: 'امروز آماده‌ای چند معما رو با هم حل کنیم؟',
      actionText: 'شروع تمرین هوشمند 🚀',
      cardIcon: '🦉',
      bgGradient: 'bg-gradient-to-br from-amber-50 via-amber-100 to-orange-100 dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 text-slate-950 dark:text-slate-100',
      borderAccent: 'border-amber-200/90 dark:border-amber-700/50',
      targetOp: 'addition',
    });
  }

  const total = items.length;

  // Drag End handler with physical circular throw and snap back
  const handleDragEnd = async (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
    if (isAnimatingRef.current) return;
    const currentX = x.get();
    const velocity = info.velocity.x;
    const swipeThreshold = 65;
    const velocityThreshold = 220;

    if (total <= 1) {
      animate(x, 0, { type: 'spring', stiffness: 450, damping: 35 });
      return;
    }

    if (currentX < -swipeThreshold || velocity < -velocityThreshold) {
      // Swiped Left (←) in RTL -> Next card along circular orbit
      isAnimatingRef.current = true;
      setOverrideUnderneathIndex((currentIndex + 1) % total);
      await animate(x, -580, {
        duration: 0.26,
        ease: [0.22, 1, 0.36, 1],
      });
      setCurrentIndex((prev) => (prev + 1) % total);
      x.set(0);
      setOverrideUnderneathIndex(null);
      setDragDir('next');
      isAnimatingRef.current = false;
    } else if (currentX > swipeThreshold || velocity > velocityThreshold) {
      // Swiped Right (→) in RTL -> Prev card along circular orbit
      isAnimatingRef.current = true;
      setOverrideUnderneathIndex((currentIndex - 1 + total) % total);
      await animate(x, 580, {
        duration: 0.26,
        ease: [0.22, 1, 0.36, 1],
      });
      setCurrentIndex((prev) => (prev - 1 + total) % total);
      x.set(0);
      setOverrideUnderneathIndex(null);
      setDragDir('next');
      isAnimatingRef.current = false;
    } else {
      // Release without completing swipe: smoothly return to center of orbit
      animate(x, 0, {
        type: 'spring',
        stiffness: 450,
        damping: 35,
      });
    }
  };

  const handleNext = useCallback(async () => {
    if (isAnimatingRef.current || total <= 1) return;
    isAnimatingRef.current = true;
    setOverrideUnderneathIndex((currentIndex + 1) % total);
    await animate(x, -580, {
      duration: 0.28,
      ease: [0.22, 1, 0.36, 1],
    });
    setCurrentIndex((prev) => (prev + 1) % total);
    x.set(0);
    setOverrideUnderneathIndex(null);
    setDragDir('next');
    isAnimatingRef.current = false;
  }, [currentIndex, total, x]);

  const handlePrev = useCallback(async () => {
    if (isAnimatingRef.current || total <= 1) return;
    isAnimatingRef.current = true;
    setOverrideUnderneathIndex((currentIndex - 1 + total) % total);
    await animate(x, 580, {
      duration: 0.28,
      ease: [0.22, 1, 0.36, 1],
    });
    setCurrentIndex((prev) => (prev - 1 + total) % total);
    x.set(0);
    setOverrideUnderneathIndex(null);
    setDragDir('next');
    isAnimatingRef.current = false;
  }, [currentIndex, total, x]);

  const handleDotClick = useCallback(
    async (targetIndex: number) => {
      if (isAnimatingRef.current || targetIndex === currentIndex || total <= 1) return;
      isAnimatingRef.current = true;
      setOverrideUnderneathIndex(targetIndex);
      const targetX = targetIndex > currentIndex ? -580 : 580;
      await animate(x, targetX, {
        duration: 0.28,
        ease: [0.22, 1, 0.36, 1],
      });
      setCurrentIndex(targetIndex);
      x.set(0);
      setOverrideUnderneathIndex(null);
      setDragDir('next');
      isAnimatingRef.current = false;
    },
    [currentIndex, total, x]
  );

  if (variant === 'compact') {
    const card = items[currentIndex % total];
    return (
      <div
        id="teacher-recommendation-card-compact"
        dir="rtl"
        className={`rounded-2xl p-3.5 sm:p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-slate-900 dark:to-slate-800 border border-amber-200/80 dark:border-amber-800/60 flex items-center justify-between gap-3 ${className}`}
      >
        <div className="flex-1 min-w-0 text-right space-y-1">
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-950 dark:text-amber-200 text-[10px] font-black">
            <span>✨</span>
            <span>پیشنهاد معلم هوشمند</span>
          </div>
          <h4 className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100 line-clamp-1">
            {card.title}
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
            {card.description}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => onStartRecommended(card.targetOp)}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black shrink-0 transition-colors cursor-pointer shadow-xs active:scale-95"
          >
            {card.actionText}
          </button>

          {/* 3D Pop-Out Owl Avatar on the Left (in RTL) */}
          <PopoutOwlAvatar sizeClassName="w-11 h-11 sm:w-12 sm:h-12" />
        </div>
      </div>
    );
  }

  // Exactly 2 cards in the physical stack: Active card and Underneath card peeking out at bottom
  // Underneath card matches the swipe direction (prev if dragging right, next if dragging left)
  const underneathIndex =
    overrideUnderneathIndex !== null
      ? overrideUnderneathIndex
      : dragDir === 'prev'
      ? (currentIndex - 1 + total) % total
      : (currentIndex + 1) % total;

  const currentCard = items[currentIndex % total];
  const underneathCard = items[underneathIndex % total];

  return (
    <div
      id="teacher-recommendation-stack-container"
      dir="rtl"
      className={`relative w-full select-none ${className}`}
    >
      {/* Header bar: Title & Pagination / Arrows */}
      {showHeader && (
        <div className="flex items-center justify-between mb-3 px-1 h-8">
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl">🦉</span>
            <h3 className="text-base sm:text-lg lg:text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>پیشنهاد معلم هوشمند</span>
              {total > 1 && (
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  ({toPersianDigits(currentIndex + 1)} از {toPersianDigits(total)})
                </span>
              )}
            </h3>
          </div>

          {/* Stack Navigation: Dots & Arrows */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block text-xs font-bold text-amber-600 dark:text-amber-400 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40">
              یادگیری اختصاصی
            </span>

            {total > 1 && (
              <>
                {/* Pagination Indicator Dots */}
                <div className="flex items-center gap-1 pl-1">
                  {items.map((item, i) => (
                    <button
                      key={`teacher-dot-${item.id}`}
                      type="button"
                      onClick={() => handleDotClick(i)}
                      aria-label={`رفتن به پیشنهاد ${i + 1}`}
                      className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                        i === currentIndex
                          ? 'w-4 bg-amber-500 dark:bg-amber-400'
                          : 'w-1.5 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                      }`}
                    />
                  ))}
                </div>

                {/* Arrow Controls */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handlePrev}
                    aria-label="پیشنهاد قبلی"
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition-all shadow-xs active:scale-90 cursor-pointer"
                  >
                    <span className="text-xs font-black">→</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    aria-label="پیشنهاد بعدی"
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition-all shadow-xs active:scale-90 cursor-pointer"
                  >
                    <span className="text-xs font-black">←</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Card Stack Deck Container (Preserving original card dimensions and peeking stacked deck appearance) */}
      <div className="relative w-full h-[258px] sm:h-[258px] md:h-[248px] pb-3.5 overflow-visible">
        {/* Layer 1: Underneath Card peeking out at bottom as a stacked card (when total > 1) */}
        {total > 1 && (
          <motion.div
            key="teacher-underneath-card"
            style={{
              transformOrigin: 'top center',
              scaleX: underneathScaleX,
              scaleY: underneathScaleY,
              y: underneathY,
              opacity: underneathOpacity,
              zIndex: 10,
            }}
            className={`absolute inset-x-0 top-0 h-[240px] sm:h-[240px] md:h-[230px] rounded-3xl p-5 sm:p-6 flex flex-col justify-between overflow-hidden shadow-md border bg-white dark:bg-slate-900 pointer-events-none select-none ${underneathCard.borderAccent} ${underneathCard.bgGradient}`}
          >
            <TeacherCardContent
              card={underneathCard}
              isInteractive={false}
            />
          </motion.div>
        )}

        {/* Layer 0: Active / Top Card with physical circular orbit gesture and stable key */}
        <motion.div
          key="teacher-top-card"
          style={{
            x,
            y,
            rotate,
            opacity,
            transformOrigin: '50% 120%',
            zIndex: 20,
          }}
          drag={total > 1 ? 'x' : false}
          dragMomentum={false}
          dragElastic={0.85}
          onDragEnd={handleDragEnd}
          className={`absolute inset-x-0 top-0 h-[240px] sm:h-[240px] md:h-[230px] rounded-3xl p-5 sm:p-6 flex flex-col justify-between overflow-hidden shadow-xl border bg-white dark:bg-slate-900 cursor-grab active:cursor-grabbing touch-pan-y ${currentCard.borderAccent} ${currentCard.bgGradient}`}
        >
          <TeacherCardContent
            card={currentCard}
            onAction={() => onStartRecommended(currentCard.targetOp)}
            isInteractive={true}
          />
        </motion.div>
      </div>
    </div>
  );
};

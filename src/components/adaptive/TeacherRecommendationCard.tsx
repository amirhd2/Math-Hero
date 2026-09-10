/**
 * TeacherRecommendationCard (Smart Teacher Card Stack) Component for Math Hero.
 * Reusable, encouraging, pedagogical smart teacher recommendation card deck:
 * - Displays a stacked deck of pedagogical recommendations and learning insights.
 * - Dynamic data-driven: integrates AdaptiveLearningPlan and PerformanceInsights.
 * - Card Stack transitions with 3D physical layers, swipe gesture handling, dots & arrow navigation.
 * - Shared identically between Home screen and Progress / Statistics screen.
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { OperationType } from '../../types';
import { AdaptiveLearningPlan } from '../../adaptive/adaptiveTypes';
import { PerformanceInsights } from '../../statistics/statisticsTypes';
import { toPersianDigits, formatNumber } from '../../utils/persian';
import { getTierDefinition } from '../../adaptive/tierRegistry';
import { SmartTeacherEngine } from '../../adaptive/smartTeacherEngine';

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
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);
  const stackRef = useRef<HTMLDivElement>(null);

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

  const handleNext = useCallback(() => {
    if (total === 0) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const handlePrev = useCallback(() => {
    if (total === 0) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Touch swipe handling (RTL Aware)
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isSwiping) {
      setTouchEndX(e.targetTouches[0].clientX);
    }
  };

  const handleTouchEnd = () => {
    if (!isSwiping || touchStartX === null || touchEndX === null) {
      setIsSwiping(false);
      return;
    }
    const distance = touchStartX - touchEndX;
    const minSwipeDistance = 45;

    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) {
        // Swiped Left -> go to Next
        handleNext();
      } else {
        // Swiped Right -> go to Previous
        handlePrev();
      }
    }

    setTouchStartX(null);
    setTouchEndX(null);
    setIsSwiping(false);
  };

  if (variant === 'compact') {
    const card = items[currentIndex % total];
    return (
      <div
        id="teacher-recommendation-card-compact"
        dir="rtl"
        className={`rounded-2xl p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-slate-900 dark:to-slate-800 border border-amber-200/80 dark:border-amber-800/60 flex items-center justify-between gap-3 ${className}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-xl flex items-center justify-center shrink-0">
            {card.cardIcon}
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100">
              {card.title}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
              {card.description}
            </p>
          </div>
        </div>
        <button
          onClick={() => onStartRecommended(card.targetOp)}
          className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black shrink-0 transition-colors cursor-pointer shadow-xs active:scale-95"
        >
          {card.actionText}
        </button>
      </div>
    );
  }

  // Preload cards for physical 3D stack
  const currentCard = items[currentIndex % total];
  const nextCard = items[(currentIndex + 1) % total];
  const nextNextCard = items[(currentIndex + 2) % total];

  const visibleCards = [
    { card: currentCard, layer: 0, key: `teacher-card-${currentCard.id}` },
    ...(total > 1 ? [{ card: nextCard, layer: 1, key: `teacher-card-${nextCard.id}` }] : []),
    ...(total > 2 ? [{ card: nextNextCard, layer: 2, key: `teacher-card-${nextNextCard.id}` }] : []),
  ];

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
                      onClick={() => setCurrentIndex(i)}
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

      {/* Card Stack Deck Container */}
      <div
        ref={stackRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative w-full h-[250px] sm:h-[250px] md:h-[240px]"
      >
        {visibleCards
          .slice()
          .reverse()
          .map(({ card, layer, key }) => {
            const isTop = layer === 0;

            let transformStyle = '';
            let zIndexStyle = 30;
            let opacityStyle = 1;

            if (layer === 0) {
              transformStyle = 'translateY(0px) scale(1)';
              zIndexStyle = 30;
              opacityStyle = 1;
            } else if (layer === 1) {
              transformStyle = 'translateY(10px) scale(0.97)';
              zIndexStyle = 20;
              opacityStyle = 0.88;
            } else {
              transformStyle = 'translateY(20px) scale(0.94)';
              zIndexStyle = 10;
              opacityStyle = 0.65;
            }

            return (
              <div
                key={key}
                style={{
                  transform: transformStyle,
                  zIndex: zIndexStyle,
                  opacity: opacityStyle,
                }}
                className={`absolute inset-0 origin-top rounded-3xl p-5 sm:p-6 transition-all duration-300 ease-out flex flex-col justify-between overflow-hidden shadow-xl border bg-white dark:bg-slate-900 ${card.borderAccent} ${card.bgGradient} ${
                  isTop ? 'pointer-events-auto' : 'pointer-events-none select-none'
                }`}
              >
                {/* Background decorative watermarks */}
                <div className="absolute -top-10 -left-10 w-36 h-36 bg-amber-200/20 dark:bg-white/5 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-10 -right-10 w-36 h-36 bg-orange-200/20 dark:bg-amber-400/5 rounded-full blur-2xl pointer-events-none" />

                {/* Top Row: Badges & Icon */}
                <div
                  className={`relative z-10 flex items-center justify-between gap-2 transition-opacity duration-200 ${
                    isTop ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full bg-amber-400/30 text-amber-950 dark:text-amber-200 text-xs font-black shadow-xs">
                      <span>✨</span>
                      <span>پیشنهاد معلم هوشمند</span>
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-black shadow-xs ${card.badgeColor || 'bg-amber-100 text-amber-900'}`}>
                      {card.badgeText}
                    </span>
                  </div>

                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-400/25 dark:bg-amber-400/15 flex items-center justify-center text-lg sm:text-xl shrink-0 shadow-inner">
                    {card.cardIcon}
                  </div>
                </div>

                {/* Middle Row: Title & Pedagogical Description */}
                <div
                  className={`relative z-10 my-auto py-1 space-y-1 text-right transition-opacity duration-200 ${
                    isTop ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <h4 className="text-base sm:text-lg font-black line-clamp-1">
                    {card.title}
                  </h4>
                  <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {card.description}
                  </p>
                </div>

                {/* Bottom Row: Full-width Action Button */}
                <div
                  className={`relative z-10 pt-1 transition-opacity duration-200 ${
                    isTop ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onStartRecommended(card.targetOp)}
                    className="w-full py-2.5 sm:py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{card.actionText}</span>
                  </button>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

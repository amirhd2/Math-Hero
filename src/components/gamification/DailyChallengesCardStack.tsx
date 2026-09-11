/**
 * DailyChallengesCardStack Component for Math Hero.
 * Implements a true physical stacked-deck card experience for daily challenges:
 * - Preloads current (N), next (N+1), and next+1 (N+2) challenge cards to eliminate blank flashes.
 * - CSS-only transitions (translate, scale, opacity, rotate) for 60fps performance on mobile.
 * - Touch swipe support + next/prev arrow buttons + indicator dots.
 * - Dynamic data driven: adapts to user's real status, daily progress, mistakes, and adaptive plan.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';
import { toPersianDigits } from '../../utils/persian';

export interface DailyChallengeItem {
  id: string;
  badgeText: string;
  badgeIcon: string;
  badgeColor?: string;
  title: string;
  description: string;
  rewardXp: number;
  rewardCoins: number;
  progressCurrent?: number;
  progressTotal?: number;
  isCompleted?: boolean;
  actionText: string;
  actionIcon?: string;
  bgGradient: string;
  borderAccent: string;
  cardIcon: string;
  onAction: () => void;
}

interface DailyChallengesCardStackProps {
  challenges: DailyChallengeItem[];
  className?: string;
}

/**
 * ChallengeCardContent: Preloaded visual and interactive representation of a single challenge card.
 * Used for both the active top card and the preloaded underneath card in the stack.
 */
const ChallengeCardContent: React.FC<{
  card: DailyChallengeItem;
  isInteractive?: boolean;
}> = ({ card, isInteractive = true }) => {
  return (
    <>
      {/* Background decorative watermarks */}
      <div className="absolute -top-10 -left-10 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 w-36 h-36 bg-black/5 rounded-full blur-2xl pointer-events-none" />

      {/* Top Row: Category Badge & Reward Chips */}
      <div className="relative z-10 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black shadow-xs ${
              card.badgeColor || 'bg-slate-950/15 text-slate-900 dark:text-white'
            }`}
          >
            <span>{card.badgeIcon}</span>
            <span>{card.badgeText}</span>
          </span>

          {card.isCompleted && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[11px] font-black shadow-xs">
              <span>✓</span>
              <span>تکمیل شد</span>
            </span>
          )}
        </div>

        {/* Rewards */}
        <div className="flex items-center gap-1.5 text-xs font-black">
          <span className="px-2.5 py-1 rounded-full bg-black/10 backdrop-blur-md text-amber-900 dark:text-amber-200 border border-black/5 flex items-center gap-1">
            <span>⭐</span>
            <span>+{toPersianDigits(card.rewardXp)} XP</span>
          </span>
          <span className="px-2.5 py-1 rounded-full bg-black/10 backdrop-blur-md text-amber-900 dark:text-amber-200 border border-black/5 flex items-center gap-1">
            <span>🪙</span>
            <span>+{toPersianDigits(card.rewardCoins)}</span>
          </span>
        </div>
      </div>

      {/* Middle Content: Title, Description, Progress */}
      <div className="relative z-10 my-auto py-1 flex items-center justify-between gap-4">
        <div className="space-y-1 max-w-xl text-right">
          <h4 className="text-base sm:text-xl font-black tracking-tight text-slate-950 dark:text-white line-clamp-1">
            {card.title}
          </h4>
          <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 line-clamp-2 leading-relaxed">
            {card.description}
          </p>

          {/* Progress bar if applicable */}
          {typeof card.progressCurrent === 'number' &&
            typeof card.progressTotal === 'number' && (
              <div className="pt-1.5 max-w-xs space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-800 dark:text-slate-300">
                  <span>پیشرفت امروز</span>
                  <span>
                    {toPersianDigits(card.progressCurrent)} از{' '}
                    {toPersianDigits(card.progressTotal)}
                  </span>
                </div>
                <div className="w-full h-2 bg-black/15 dark:bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-slate-950 dark:bg-white rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round((card.progressCurrent / card.progressTotal) * 100)
                      )}%`,
                    }}
                  />
                </div>
              </div>
            )}
        </div>

        {/* Visual Card Symbol */}
        <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md items-center justify-center text-3xl shadow-inner shrink-0">
          {card.cardIcon}
        </div>
      </div>

      {/* Bottom Action Button */}
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
            card.onAction();
          }}
          className={`w-full py-2.5 sm:py-3 px-4 bg-slate-950 hover:bg-slate-900 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-slate-950/20 active:scale-95 transition-all flex items-center justify-center gap-2 ${
            isInteractive ? 'cursor-pointer' : 'pointer-events-none'
          }`}
        >
          <span>{card.actionIcon || '🚀'}</span>
          <span>{card.actionText}</span>
        </button>
      </div>
    </>
  );
};

export const DailyChallengesCardStack: React.FC<DailyChallengesCardStackProps> = ({
  challenges,
  className = '',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragDir, setDragDir] = useState<'next' | 'prev'>('next');
  const [overrideUnderneathIndex, setOverrideUnderneathIndex] = useState<number | null>(null);
  const isAnimatingRef = useRef(false);
  const total = challenges.length;

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
      // Swiped Left (← in RTL) -> Advance to Next card along circular orbit
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
      // Swiped Right (→ in RTL) -> Go to Previous card along circular orbit
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
      // Not past threshold: smoothly spring back to center
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

  if (!challenges || challenges.length === 0) {
    return null;
  }

  // Exactly 2 cards in the physical stack: Active card and Preloaded underneath card
  // Underneath card matches the swipe direction (prev if dragging right, next if dragging left)
  const underneathIndex =
    overrideUnderneathIndex !== null
      ? overrideUnderneathIndex
      : dragDir === 'prev'
      ? (currentIndex - 1 + total) % total
      : (currentIndex + 1) % total;

  const currentCard = challenges[currentIndex % total];
  const underneathCard = challenges[underneathIndex % total];

  return (
    <div
      id="daily-challenges-container"
      dir="rtl"
      className={`relative w-full select-none ${className}`}
    >
      {/* Header bar: Title & Pagination / Arrows */}
      <div className="flex items-center justify-between mb-3 px-1 h-8">
        <div className="flex items-center gap-2">
          <span className="text-xl sm:text-2xl animate-pulse">⚡</span>
          <div>
            <h3 className="text-base sm:text-lg lg:text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>چالش‌های روزانه</span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                ({toPersianDigits(currentIndex + 1)} از {toPersianDigits(total)})
              </span>
            </h3>
          </div>
        </div>

        {/* Stack Navigation: Dots & Arrows */}
        <div className="flex items-center gap-2">
          {/* Pagination Indicator Dots */}
          <div className="hidden sm:flex items-center gap-1 pl-1">
            {challenges.map((c, i) => (
              <button
                key={`dot-${c.id}`}
                type="button"
                onClick={() => handleDotClick(i)}
                aria-label={`رفتن به چالش ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  i === currentIndex
                    ? 'w-4 bg-indigo-600 dark:bg-indigo-400'
                    : 'w-1.5 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="چالش قبلی"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition-all shadow-xs active:scale-90 cursor-pointer"
            >
              <span className="text-xs font-black">→</span>
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="چالش بعدی"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition-all shadow-xs active:scale-90 cursor-pointer"
            >
              <span className="text-xs font-black">←</span>
            </button>
          </div>
        </div>
      </div>

      {/* Card Stack Deck Container (Preserving original card dimensions and peeking stacked deck appearance) */}
      <div className="relative w-full h-[258px] sm:h-[258px] md:h-[248px] pb-3.5 overflow-visible">
        {/* Layer 1: Fully Preloaded Underneath Card peeking out at bottom as a stacked card (when total > 1) */}
        {total > 1 && (
          <motion.div
            key="challenge-underneath-card"
            style={{
              scaleX: underneathScaleX,
              scaleY: underneathScaleY,
              y: underneathY,
              opacity: underneathOpacity,
              transformOrigin: 'top center',
              zIndex: 10,
            }}
            className={`absolute inset-x-0 top-0 h-[240px] sm:h-[240px] md:h-[230px] rounded-3xl p-5 sm:p-6 flex flex-col justify-between overflow-hidden shadow-md border bg-white dark:bg-slate-900 pointer-events-none select-none ${underneathCard.borderAccent} ${underneathCard.bgGradient}`}
          >
            <ChallengeCardContent card={underneathCard} isInteractive={false} />
          </motion.div>
        )}

        {/* Layer 0: Active / Top Card with true circular orbit swipe physics and stable key */}
        <motion.div
          key="challenge-top-card"
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
          <ChallengeCardContent card={currentCard} isInteractive={true} />
        </motion.div>
      </div>
    </div>
  );
};

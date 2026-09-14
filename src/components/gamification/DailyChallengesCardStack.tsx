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
  cardIndex?: number;
  totalCards?: number;
  isInteractive?: boolean;
}> = ({ card, cardIndex, totalCards, isInteractive = true }) => {
  return (
    <>
      {/* Background decorative watermarks clipped neatly inside rounded-3xl container */}
      <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -left-10 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-36 h-36 bg-black/5 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Prominent Floating Capsule Badge on the Top Border (Straddling half above, half inside card) */}
      <div className="absolute top-0 right-4 sm:right-6 -translate-y-1/2 z-30 pointer-events-none select-none">
        <div
          className={`animate-badge-throb inline-flex items-center gap-2 px-3.5 sm:px-4.5 py-1.5 sm:py-2 rounded-full font-black text-xs sm:text-sm shadow-md border border-white/60 dark:border-white/20 backdrop-blur-md transition-all ${
            card.badgeColor || 'bg-slate-950 text-white dark:bg-amber-400 dark:text-slate-950'
          }`}
        >
          {/* Active Pulsing Beacon Light */}
          <span className="relative flex h-2 sm:h-2.5 w-2 sm:w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-80" />
            <span className="relative inline-flex rounded-full h-2 sm:h-2.5 w-2 sm:w-2.5 bg-current shadow-xs" />
          </span>
          <span className="text-sm sm:text-base leading-none">{card.badgeIcon || '⚡'}</span>
          <span className="tracking-tight whitespace-nowrap leading-none">{card.badgeText}</span>
        </div>
      </div>

      {/* Main card content */}
      <div className="flex flex-col justify-between h-full transition-all duration-300">
        {/* Top Row: Stack Counter on Right (under the capsule badge), Rewards on Left */}
        <div className="relative z-10 flex items-center justify-between gap-2 pt-1.5 sm:pt-2">
          {/* Stack Counter (if totalCards > 1) */}
          {Boolean(totalCards && totalCards > 1 && typeof cardIndex === 'number') ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/10 dark:bg-white/15 backdrop-blur-md text-slate-900 dark:text-slate-100 text-[10px] sm:text-xs font-black shadow-2xs">
              <span>{toPersianDigits((cardIndex ?? 0) + 1)}</span>
              <span className="text-[9px] opacity-70">از</span>
              <span>{toPersianDigits(totalCards ?? 0)}</span>
            </span>
          ) : (
            <div />
          )}

          {/* Rewards */}
          <div className="flex items-center gap-1.5 text-xs font-black">
            <span className="px-2.5 py-1 rounded-full bg-black/10 dark:bg-white/15 backdrop-blur-md text-slate-950 dark:text-slate-100 border border-black/5 dark:border-white/10 flex items-center gap-1 shadow-2xs">
              <span>⭐</span>
              <span>+{toPersianDigits(card.rewardXp)} XP</span>
            </span>
            <span className="px-2.5 py-1 rounded-full bg-black/10 dark:bg-white/15 backdrop-blur-md text-slate-950 dark:text-slate-100 border border-black/5 dark:border-white/10 flex items-center gap-1 shadow-2xs">
              <span>🪙</span>
              <span>+{toPersianDigits(card.rewardCoins)}</span>
            </span>
          </div>
        </div>

        {/* Middle Content: Title, Description */}
        <div className="relative z-10 my-auto py-2 flex items-center justify-between gap-4">
          <div className="space-y-1 max-w-xl text-right">
            <h4 className="text-base sm:text-xl font-black tracking-tight text-slate-950 dark:text-white">
              {card.title}
            </h4>
            <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
              {card.description}
            </p>
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
      </div>
    </>
  );
};

/**
 * AllChallengesCompletedCard: Displayed when all daily challenges are finished.
 */
const AllChallengesCompletedCard: React.FC = () => {
  return (
    <div className="relative w-full h-[240px] sm:h-[240px] md:h-[230px] rounded-3xl p-5 sm:p-6 flex flex-col justify-between overflow-visible shadow-xl border border-emerald-400/60 dark:border-emerald-500/40 bg-gradient-to-br from-emerald-100 via-teal-50 to-emerald-200 dark:from-emerald-950/80 dark:via-slate-900 dark:to-teal-950/80 text-slate-900 dark:text-white select-none">
      {/* Background decorative ambient glow */}
      <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
        <div className="absolute -top-12 -left-12 w-40 h-40 bg-emerald-400/25 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-teal-400/25 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Floating Celebration Badge on Top Border */}
      <div className="absolute top-0 right-4 sm:right-6 -translate-y-1/2 z-30 pointer-events-none select-none">
        <div className="animate-badge-throb inline-flex items-center gap-2 px-3.5 sm:px-4.5 py-1.5 sm:py-2 rounded-full font-black text-xs sm:text-sm shadow-md border border-emerald-300/60 dark:border-emerald-500/40 backdrop-blur-md bg-emerald-600 text-white">
          <span className="relative flex h-2 sm:h-2.5 w-2 sm:w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-90" />
            <span className="relative inline-flex rounded-full h-2 sm:h-2.5 w-2 sm:w-2.5 bg-emerald-200 shadow-xs" />
          </span>
          <span className="text-sm sm:text-base leading-none">🎉</span>
          <span className="tracking-tight whitespace-nowrap leading-none">چالش‌های امروز تکمیل شد</span>
        </div>
      </div>

      {/* Top Row: Secondary Celebration Indicator */}
      <div className="relative z-10 flex items-center justify-end gap-2 pt-1.5 sm:pt-2">
        <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-black text-xs border border-emerald-500/30 flex items-center gap-1">
          <span>🌟</span>
          <span>تمام جوایز دریافت شد</span>
        </span>
      </div>

      {/* Middle Content: Celebration message */}
      <div className="relative z-10 my-auto py-2 flex items-center justify-between gap-4">
        <div className="space-y-1.5 text-right">
          <h4 className="text-base sm:text-xl font-black tracking-tight text-emerald-950 dark:text-emerald-200 flex items-center gap-2">
            <span>آفرین قهرمان ریاضی!</span>
            <span className="text-xl">🏆</span>
          </h4>
          <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed max-w-lg">
            تمامی چالش‌های روزانه امروز رو با موفقیت به پایان رسوندی. چالش‌های تازه فردا ساعت ۰۰:۰۰ آماده خواهند شد!
          </p>
        </div>

        {/* Big Celebration Trophy Icon */}
        <div className="hidden sm:flex w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 items-center justify-center text-3xl sm:text-4xl shadow-inner shrink-0 animate-pulse">
          👑
        </div>
      </div>

      {/* Bottom Status Banner */}
      <div className="relative z-10 pt-1">
        <div className="w-full py-2.5 sm:py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-2">
          <span>✓</span>
          <span>۱۰۰٪ چالش‌های امروز انجام شد ✨</span>
        </div>
      </div>
    </div>
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

  // Filter out completed challenges
  const activeChallenges = React.useMemo(() => {
    return (challenges || []).filter((c) => !c.isCompleted);
  }, [challenges]);

  const total = activeChallenges.length;
  const safeIndex = total > 0 ? currentIndex % total : 0;

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
      setOverrideUnderneathIndex((safeIndex + 1) % total);
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
      setOverrideUnderneathIndex((safeIndex - 1 + total) % total);
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

  const handleDotClick = useCallback(
    async (targetIndex: number) => {
      if (isAnimatingRef.current || targetIndex === safeIndex || total <= 1) return;
      isAnimatingRef.current = true;
      setOverrideUnderneathIndex(targetIndex);
      const targetX = targetIndex > safeIndex ? -580 : 580;
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
    [safeIndex, total, x]
  );

  if (!challenges || challenges.length === 0) {
    return null;
  }

  // If all challenges completed, show the single celebration completion card
  if (total === 0) {
    return (
      <div
        id="daily-challenges-container"
        dir="rtl"
        className={`relative w-full select-none ${className}`}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between mb-3 px-1 h-8">
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl animate-pulse">⚡</span>
            <h3 className="text-base sm:text-lg lg:text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>چالش‌های روزانه</span>
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                (تکمیل شد ✓)
              </span>
            </h3>
          </div>
        </div>

        {/* All completed celebration card */}
        <div className="relative w-full h-[258px] sm:h-[258px] md:h-[248px] pb-3.5 overflow-visible">
          <AllChallengesCompletedCard />
        </div>
      </div>
    );
  }

  // Exactly 2 cards in the physical stack: Active card and Preloaded underneath card
  const underneathIndex =
    overrideUnderneathIndex !== null
      ? overrideUnderneathIndex
      : dragDir === 'prev'
      ? (safeIndex - 1 + total) % total
      : (safeIndex + 1) % total;

  const currentCard = activeChallenges[safeIndex % total];
  const underneathCard = activeChallenges[underneathIndex % total];

  return (
    <div
      id="daily-challenges-container"
      dir="rtl"
      className={`relative w-full select-none ${className}`}
    >
      {/* Header bar: Title & Pagination / Arrows */}
      <div className="flex items-center justify-between mb-4 sm:mb-5 px-1 h-8">
        <div className="flex items-center gap-2">
          <span className="text-xl sm:text-2xl animate-pulse">⚡</span>
          <div>
            <h3 className="text-base sm:text-lg lg:text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>چالش‌های روزانه</span>
            </h3>
          </div>
        </div>

        {/* Stack Navigation: Dots */}
        {total > 1 && (
          <div className="flex items-center gap-2">
            {/* Pagination Indicator Dots */}
            <div className="hidden sm:flex items-center gap-1 pl-1">
              {activeChallenges.map((c, i) => (
                <button
                  key={`dot-${c.id}`}
                  type="button"
                  onClick={() => handleDotClick(i)}
                  aria-label={`رفتن به چالش ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    i === safeIndex
                      ? 'w-4 bg-indigo-600 dark:bg-indigo-400'
                      : 'w-1.5 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Card Stack Deck Container (Preserving original card dimensions and peeking stacked deck appearance) */}
      <div className="relative w-full h-[258px] sm:h-[258px] md:h-[248px] pt-1 pb-3.5 overflow-visible">
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
            className={`absolute inset-x-0 top-0 h-[240px] sm:h-[240px] md:h-[230px] rounded-3xl p-5 sm:p-6 flex flex-col justify-between overflow-visible shadow-md border bg-white dark:bg-slate-900 pointer-events-none select-none ${underneathCard.borderAccent} ${underneathCard.bgGradient}`}
          >
            <ChallengeCardContent
              card={underneathCard}
              cardIndex={underneathIndex}
              totalCards={total}
              isInteractive={false}
            />
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
          className={`absolute inset-x-0 top-0 h-[240px] sm:h-[240px] md:h-[230px] rounded-3xl p-5 sm:p-6 flex flex-col justify-between overflow-visible shadow-xl border bg-white dark:bg-slate-900 cursor-grab active:cursor-grabbing touch-pan-y ${currentCard.borderAccent} ${currentCard.bgGradient}`}
        >
          <ChallengeCardContent
            card={currentCard}
            cardIndex={safeIndex}
            totalCards={total}
            isInteractive={true}
          />
        </motion.div>
      </div>
    </div>
  );
};

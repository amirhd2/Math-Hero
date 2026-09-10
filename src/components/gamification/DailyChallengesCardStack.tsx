/**
 * DailyChallengesCardStack Component for Math Hero.
 * Implements a true physical stacked-deck card experience for daily challenges:
 * - Preloads current (N), next (N+1), and next+1 (N+2) challenge cards to eliminate blank flashes.
 * - CSS-only transitions (translate, scale, opacity, rotate) for 60fps performance on mobile.
 * - Touch swipe support + next/prev arrow buttons + indicator dots.
 * - Dynamic data driven: adapts to user's real status, daily progress, mistakes, and adaptive plan.
 */

import React, { useState, useRef, useCallback } from 'react';
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

export const DailyChallengesCardStack: React.FC<DailyChallengesCardStackProps> = ({
  challenges,
  className = '',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);
  const stackRef = useRef<HTMLDivElement>(null);

  const total = challenges.length;

  const handleNext = useCallback(() => {
    if (total === 0) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const handlePrev = useCallback(() => {
    if (total === 0) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Touch swipe handling
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
      // In RTL: dragging right (distance < 0) means going next in Persian reading order, or vice versa
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

  if (!challenges || challenges.length === 0) {
    return null;
  }

  // Preload indices: current (0), next (1), next+1 (2)
  const currentCard = challenges[currentIndex];
  const nextCard = challenges[(currentIndex + 1) % total];
  const nextNextCard = challenges[(currentIndex + 2) % total];

  const visibleCards = [
    { card: currentCard, layer: 0, key: `current-${currentCard.id}` },
    ...(total > 1 ? [{ card: nextCard, layer: 1, key: `next-${nextCard.id}` }] : []),
    ...(total > 2 ? [{ card: nextNextCard, layer: 2, key: `next2-${nextNextCard.id}` }] : []),
  ];

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
                onClick={() => setCurrentIndex(i)}
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

            // Physical layer positioning with CSS transforms
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
                {/* Background decorative watermark */}
                <div className="absolute -top-10 -left-10 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-10 -right-10 w-36 h-36 bg-black/5 rounded-full blur-2xl pointer-events-none" />

                {/* Top Row: Category Badge & Reward Chips */}
                <div
                  className={`relative z-10 flex items-center justify-between gap-2 transition-opacity duration-200 ${
                    isTop ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                >
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
                <div
                  className={`relative z-10 my-auto py-1 flex items-center justify-between gap-4 transition-opacity duration-200 ${
                    isTop ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                >
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
                <div
                  className={`relative z-10 pt-1 transition-opacity duration-200 ${
                    isTop ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      card.onAction();
                    }}
                    className="w-full py-2.5 sm:py-3 px-4 bg-slate-950 hover:bg-slate-900 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-slate-950/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{card.actionIcon || '🚀'}</span>
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

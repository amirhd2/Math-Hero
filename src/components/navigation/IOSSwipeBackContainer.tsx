import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ScreenId } from '../../types';

export interface IOSSwipeBackContainerProps {
  currentScreenId: ScreenId;
  previousScreenId: ScreenId | null;
  canGoBack: boolean;
  onBack: () => void;
  renderScreenView: (screenId: ScreenId, isBackground?: boolean) => React.ReactNode;
}

const EDGE_TRIGGER_WIDTH = 38; // Pixels from left edge of screen to initiate gesture
const COMPLETION_RATIO = 0.32; // 32% screen drag to pop
const VELOCITY_THRESHOLD = 0.45; // Fast flick velocity threshold (px/ms)
const ANIMATION_POP_DURATION = 240; // ms
const ANIMATION_CANCEL_DURATION = 200; // ms
const EASING = 'cubic-bezier(0.2, 0.9, 0.3, 1)';

export const IOSSwipeBackContainer: React.FC<IOSSwipeBackContainerProps> = ({
  currentScreenId,
  previousScreenId,
  canGoBack,
  onBack,
  renderScreenView,
}) => {
  const [isBackgroundMounted, setIsBackgroundMounted] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const foregroundRef = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);

  const isAnimatingRef = useRef(false);
  const touchStateRef = useRef<{
    startX: number;
    startY: number;
    startTime: number;
    lastX: number;
    phase: 'pending' | 'swiping' | 'canceled';
  } | null>(null);

  // Keep a stable ref to callbacks & props to prevent stale closures in event listeners
  const propsRef = useRef({
    canGoBack,
    previousScreenId,
    onBack,
  });
  useEffect(() => {
    propsRef.current = { canGoBack, previousScreenId, onBack };
  }, [canGoBack, previousScreenId, onBack]);

  const resetStyles = useCallback(() => {
    if (foregroundRef.current) {
      foregroundRef.current.style.transition = '';
      foregroundRef.current.style.transform = '';
      foregroundRef.current.style.boxShadow = '';
    }
    if (backgroundRef.current) {
      backgroundRef.current.style.transition = '';
      backgroundRef.current.style.transform = '';
    }
    if (scrimRef.current) {
      scrimRef.current.style.transition = '';
      scrimRef.current.style.opacity = '';
    }
  }, []);

  // Handle Touch Events (Mobile)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (isAnimatingRef.current) return;
      if (!propsRef.current.canGoBack || !propsRef.current.previousScreenId) return;

      const touch = e.touches[0];
      if (!touch) return;

      // Must start near the left edge of the viewport (Apple iOS standard: left edge to right)
      if (touch.clientX > EDGE_TRIGGER_WIDTH) return;

      touchStateRef.current = {
        startX: touch.clientX,
        startY: touch.clientY,
        startTime: performance.now(),
        lastX: touch.clientX,
        phase: 'pending',
      };

      // Pre-mount background screen so it is ready instantly
      setIsBackgroundMounted(true);
    };

    const handleTouchMove = (e: TouchEvent) => {
      const state = touchStateRef.current;
      if (!state || state.phase === 'canceled' || isAnimatingRef.current) return;

      const touch = e.touches[0];
      if (!touch) return;

      const dx = touch.clientX - state.startX;
      const dy = touch.clientY - state.startY;
      state.lastX = touch.clientX;

      if (state.phase === 'pending') {
        // 1. If vertical scroll occurs first, cancel immediately to avoid interference
        if (Math.abs(dy) > 7 && Math.abs(dy) > Math.abs(dx)) {
          state.phase = 'canceled';
          setIsBackgroundMounted(false);
          resetStyles();
          return;
        }

        // 2. If horizontal movement to right clearly dominates, lock into swipe-back
        if (dx > 8 && dx > Math.abs(dy) * 1.1) {
          state.phase = 'swiping';
        }
      }

      if (state.phase === 'swiping') {
        // Prevent default vertical scrolling and page bounce
        if (e.cancelable) {
          e.preventDefault();
        }

        const dragX = Math.max(0, dx);
        const width = window.innerWidth || document.documentElement.clientWidth || 360;
        const progress = Math.min(1, Math.max(0, dragX / width));

        // Direct hardware-accelerated GPU transform for 120 FPS smoothness
        if (foregroundRef.current) {
          foregroundRef.current.style.transform = `translate3d(${dragX}px, 0, 0)`;
          foregroundRef.current.style.boxShadow = '-10px 0 28px -4px rgba(0, 0, 0, 0.35), -3px 0 8px -2px rgba(0, 0, 0, 0.18)';
        }

        // Apple parallax on previous screen: slides smoothly from -25% to 0%
        if (backgroundRef.current) {
          const bgOffset = -25 * (1 - progress);
          backgroundRef.current.style.transform = `translate3d(${bgOffset}%, 0, 0)`;
        }

        // Dimming overlay on background screen: fades from 0.28 to 0
        if (scrimRef.current) {
          scrimRef.current.style.opacity = `${0.28 * (1 - progress)}`;
        }
      }
    };

    const handleTouchEnd = () => {
      const state = touchStateRef.current;
      if (!state || isAnimatingRef.current) return;

      if (state.phase !== 'swiping') {
        touchStateRef.current = null;
        setIsBackgroundMounted(false);
        resetStyles();
        return;
      }

      const dx = state.lastX - state.startX;
      const width = window.innerWidth || document.documentElement.clientWidth || 360;
      const elapsed = Math.max(1, performance.now() - state.startTime);
      const velocity = dx / elapsed; // px per millisecond

      // Decide whether to complete pop or cancel based on distance or velocity
      const shouldComplete = dx > width * COMPLETION_RATIO || (velocity > VELOCITY_THRESHOLD && dx > 35);

      touchStateRef.current = null;
      isAnimatingRef.current = true;

      if (shouldComplete) {
        // Animate out to the right (complete pop)
        if (foregroundRef.current) {
          foregroundRef.current.style.transition = `transform ${ANIMATION_POP_DURATION}ms ${EASING}`;
          foregroundRef.current.style.transform = 'translate3d(100%, 0, 0)';
        }
        if (backgroundRef.current) {
          backgroundRef.current.style.transition = `transform ${ANIMATION_POP_DURATION}ms ${EASING}`;
          backgroundRef.current.style.transform = 'translate3d(0, 0, 0)';
        }
        if (scrimRef.current) {
          scrimRef.current.style.transition = `opacity ${ANIMATION_POP_DURATION}ms ${EASING}`;
          scrimRef.current.style.opacity = '0';
        }

        setTimeout(() => {
          propsRef.current.onBack();
          resetStyles();
          setIsBackgroundMounted(false);
          isAnimatingRef.current = false;
        }, ANIMATION_POP_DURATION);
      } else {
        // Animate back to resting state (cancel pop)
        if (foregroundRef.current) {
          foregroundRef.current.style.transition = `transform ${ANIMATION_CANCEL_DURATION}ms ${EASING}`;
          foregroundRef.current.style.transform = 'translate3d(0, 0, 0)';
        }
        if (backgroundRef.current) {
          backgroundRef.current.style.transition = `transform ${ANIMATION_CANCEL_DURATION}ms ${EASING}`;
          backgroundRef.current.style.transform = 'translate3d(-25%, 0, 0)';
        }
        if (scrimRef.current) {
          scrimRef.current.style.transition = `opacity ${ANIMATION_CANCEL_DURATION}ms ${EASING}`;
          scrimRef.current.style.opacity = '0.28';
        }

        setTimeout(() => {
          resetStyles();
          setIsBackgroundMounted(false);
          isAnimatingRef.current = false;
        }, ANIMATION_CANCEL_DURATION);
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [resetStyles]);

  // Handle Mouse Events (Desktop & Preview drag testing)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (isAnimatingRef.current) return;
      if (e.button !== 0) return; // Only left-click
      if (!propsRef.current.canGoBack || !propsRef.current.previousScreenId) return;

      if (e.clientX > EDGE_TRIGGER_WIDTH) return;

      touchStateRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startTime: performance.now(),
        lastX: e.clientX,
        phase: 'pending',
      };

      setIsBackgroundMounted(true);

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const state = touchStateRef.current;
        if (!state || state.phase === 'canceled' || isAnimatingRef.current) return;

        const dx = moveEvent.clientX - state.startX;
        const dy = moveEvent.clientY - state.startY;
        state.lastX = moveEvent.clientX;

        if (state.phase === 'pending') {
          if (Math.abs(dy) > 7 && Math.abs(dy) > Math.abs(dx)) {
            state.phase = 'canceled';
            setIsBackgroundMounted(false);
            resetStyles();
            return;
          }
          if (dx > 8 && dx > Math.abs(dy) * 1.1) {
            state.phase = 'swiping';
          }
        }

        if (state.phase === 'swiping') {
          moveEvent.preventDefault();
          const dragX = Math.max(0, dx);
          const width = window.innerWidth || 360;
          const progress = Math.min(1, Math.max(0, dragX / width));

          if (foregroundRef.current) {
            foregroundRef.current.style.transform = `translate3d(${dragX}px, 0, 0)`;
            foregroundRef.current.style.boxShadow = '-10px 0 28px -4px rgba(0, 0, 0, 0.35), -3px 0 8px -2px rgba(0, 0, 0, 0.18)';
          }
          if (backgroundRef.current) {
            const bgOffset = -25 * (1 - progress);
            backgroundRef.current.style.transform = `translate3d(${bgOffset}%, 0, 0)`;
          }
          if (scrimRef.current) {
            scrimRef.current.style.opacity = `${0.28 * (1 - progress)}`;
          }
        }
      };

      const handleMouseUp = () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);

        const state = touchStateRef.current;
        if (!state || isAnimatingRef.current) return;

        if (state.phase !== 'swiping') {
          touchStateRef.current = null;
          setIsBackgroundMounted(false);
          resetStyles();
          return;
        }

        const dx = state.lastX - state.startX;
        const width = window.innerWidth || 360;
        const elapsed = Math.max(1, performance.now() - state.startTime);
        const velocity = dx / elapsed;

        const shouldComplete = dx > width * COMPLETION_RATIO || (velocity > VELOCITY_THRESHOLD && dx > 35);

        touchStateRef.current = null;
        isAnimatingRef.current = true;

        if (shouldComplete) {
          if (foregroundRef.current) {
            foregroundRef.current.style.transition = `transform ${ANIMATION_POP_DURATION}ms ${EASING}`;
            foregroundRef.current.style.transform = 'translate3d(100%, 0, 0)';
          }
          if (backgroundRef.current) {
            backgroundRef.current.style.transition = `transform ${ANIMATION_POP_DURATION}ms ${EASING}`;
            backgroundRef.current.style.transform = 'translate3d(0, 0, 0)';
          }
          if (scrimRef.current) {
            scrimRef.current.style.transition = `opacity ${ANIMATION_POP_DURATION}ms ${EASING}`;
            scrimRef.current.style.opacity = '0';
          }

          setTimeout(() => {
            propsRef.current.onBack();
            resetStyles();
            setIsBackgroundMounted(false);
            isAnimatingRef.current = false;
          }, ANIMATION_POP_DURATION);
        } else {
          if (foregroundRef.current) {
            foregroundRef.current.style.transition = `transform ${ANIMATION_CANCEL_DURATION}ms ${EASING}`;
            foregroundRef.current.style.transform = 'translate3d(0, 0, 0)';
          }
          if (backgroundRef.current) {
            backgroundRef.current.style.transition = `transform ${ANIMATION_CANCEL_DURATION}ms ${EASING}`;
            backgroundRef.current.style.transform = 'translate3d(-25%, 0, 0)';
          }
          if (scrimRef.current) {
            scrimRef.current.style.transition = `opacity ${ANIMATION_CANCEL_DURATION}ms ${EASING}`;
            scrimRef.current.style.opacity = '0.28';
          }

          setTimeout(() => {
            resetStyles();
            setIsBackgroundMounted(false);
            isAnimatingRef.current = false;
          }, ANIMATION_CANCEL_DURATION);
        }
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    };

    container.addEventListener('mousedown', handleMouseDown);
    return () => {
      container.removeEventListener('mousedown', handleMouseDown);
    };
  }, [resetStyles]);

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-screen overflow-x-hidden"
    >
      {/* 
        Background Layer: The previous screen, rendered as a complete finished full-screen view
        underneath during swipe, with authentic iOS parallax shift and dimming overlay.
      */}
      {isBackgroundMounted && previousScreenId && (
        <div
          ref={backgroundRef}
          aria-hidden="true"
          className="fixed inset-0 w-full h-full z-10 overflow-hidden bg-slate-50 dark:bg-slate-950 pointer-events-none select-none"
          style={{
            transform: 'translate3d(-25%, 0, 0)',
            willChange: 'transform',
          }}
        >
          {/* Full rendered view of the previous screen */}
          <div className="w-full h-full overflow-y-auto pointer-events-none">
            {renderScreenView(previousScreenId, true)}
          </div>

          {/* Dimming Scrim Overlay */}
          <div
            ref={scrimRef}
            className="absolute inset-0 bg-black pointer-events-none"
            style={{
              opacity: 0.28,
              willChange: 'opacity',
            }}
          />
        </div>
      )}

      {/* 
        Foreground Layer: The current screen, translating smoothly to the right when swiped.
      */}
      <div
        ref={foregroundRef}
        className="relative w-full min-h-screen z-20 bg-slate-50 dark:bg-slate-950"
        style={{
          willChange: isBackgroundMounted ? 'transform' : 'auto',
        }}
      >
        {renderScreenView(currentScreenId, false)}
      </div>
    </div>
  );
};

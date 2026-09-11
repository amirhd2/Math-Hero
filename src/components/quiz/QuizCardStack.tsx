/**
 * QuizCardStack Component.
 * Implements a true physical multi-card stacked deck visual:
 * - Active Card (Question N): In the front, 100% scale, fully readable and interactive.
 * - Next Card (Question N+1): Physical card layer immediately behind, equal subtle 8px offset.
 * - Next+1 Card (Question N+2): Third physical card layer behind that (16px offset).
 * - Next+2 Card (Question N+3): Fourth physical card layer (24px offset).
 * - Synchronized forward promotion when active card departs (falling-leaf / tear-off).
 * - Stable geometry, zero layout shifts, zero blank frames, persistent focus.
 */
import React from 'react';
import { QuizQuestion, CharacterGender, CharacterPose } from '../../types';
import { QuizCardContent } from './QuizCardContent';

interface QuizCardStackProps {
  currentQuestion: QuizQuestion;
  upcomingQuestions: QuizQuestion[];
  isAdvancing: boolean;
  feedbackStatus: 'idle' | 'correct' | 'incorrect' | 'revealed';
  characterGender?: CharacterGender;
  characterPose?: CharacterPose;
  characterMessage?: string | null;
  isPractice?: boolean;
  currentAttempts?: number;
  maxAttempts?: number;
  streak?: number;
  userAnswer?: string;
  revealedAnswer?: number | null;
  onExit?: () => void;
}

/**
 * Back Card Physical Layer Component
 */
interface BackCardLayerProps {
  question: QuizQuestion;
  layer: 1 | 2 | 3;
  isAdvancing: boolean;
  characterGender?: CharacterGender;
  isPractice?: boolean;
  maxAttempts?: number;
  streak?: number;
}

const BackCardLayer: React.FC<BackCardLayerProps> = ({
  question,
  layer,
  isAdvancing,
  characterGender,
  isPractice,
  maxAttempts,
  streak,
}) => {
  // Physical stack layers with synchronized keyframe promotion
  let transformClasses = '';
  let bgClasses = '';

  if (layer === 1) {
    // Card N+1 (Immediately behind active card)
    transformClasses = isAdvancing
      ? 'animate-card-promote-up z-20'
      : 'translate-y-[6px] sm:translate-y-[8px] scale-[0.98] z-20 shadow-md';
    bgClasses = 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800';
  } else if (layer === 2) {
    // Card N+2 (Third card in stack)
    transformClasses = isAdvancing
      ? 'animate-card-step-2-to-1 z-10'
      : 'translate-y-[12px] sm:translate-y-[16px] scale-[0.96] opacity-80 z-10 shadow-sm';
    bgClasses = 'bg-slate-50 dark:bg-slate-800/90 border-slate-200/80 dark:border-slate-700/70';
  } else {
    // Card N+3 (Fourth card in stack)
    transformClasses = isAdvancing
      ? 'animate-card-step-3-to-2 z-0'
      : 'translate-y-[18px] sm:translate-y-[22px] scale-[0.94] opacity-60 z-0 shadow-xs';
    bgClasses = 'bg-slate-100 dark:bg-slate-800/70 border-slate-200/60 dark:border-slate-700/50';
  }

  return (
    <div
      key={`back-card-${layer}-${question.id}`}
      aria-hidden="true"
      dir="rtl"
      className={`absolute inset-x-0 top-0 bottom-4 sm:bottom-5 origin-top rounded-3xl pointer-events-none select-none flex flex-col p-0 overflow-hidden border border-slate-200/90 dark:border-slate-800 ${bgClasses} ${transformClasses}`}
    >
      <QuizCardContent 
        question={question}
        characterGender={characterGender}
        isPractice={isPractice}
        currentAttempts={0}
        maxAttempts={maxAttempts}
        streak={streak}
      />
    </div>
  );
};

export const QuizCardStack: React.FC<QuizCardStackProps> = ({
  currentQuestion,
  upcomingQuestions,
  isAdvancing,
  feedbackStatus,
  characterGender = 'boy',
  isPractice = false,
  currentAttempts = 0,
  maxAttempts = 3,
  streak = 0,
  userAnswer,
  onExit,
}) => {
  // Visual border feedback state for active card
  let feedbackRingClass = '';
  if (feedbackStatus === 'correct') {
    feedbackRingClass = 'ring-4 ring-emerald-500/80 shadow-emerald-500/20';
  } else if (feedbackStatus === 'incorrect') {
    feedbackRingClass = 'ring-4 ring-rose-500/80 shadow-rose-500/20 animate-shake';
  } else if (feedbackStatus === 'revealed') {
    feedbackRingClass = 'ring-4 ring-amber-500/80 shadow-amber-500/20';
  }

  const handleCardClick = () => {
    const inputEl = document.getElementById('math-quiz-numeric-input') as HTMLInputElement | null;
    if (inputEl) {
      inputEl.focus({ preventScroll: true });
    }
  };

  const cardN1 = upcomingQuestions[0] || null;
  const cardN2 = upcomingQuestions[1] || null;
  const cardN3 = upcomingQuestions[2] || null;
  return (
    <div className="relative w-full max-w-3xl lg:max-w-4xl mx-auto select-none pb-2 pt-0 h-full min-h-[220px]">
      {/* =========================================================================
          PHYSICAL CARD STACK LAYERS (Rendered in reverse depth order)
          ========================================================================= */}
      {/* Layer 3: Card N+3 (Deepest card) */}
      {cardN3 && (
        <BackCardLayer
          question={cardN3}
          layer={3}
          isAdvancing={isAdvancing}
          characterGender={characterGender}
          isPractice={isPractice}
          maxAttempts={maxAttempts}
          streak={streak}
        />
      )}

      {/* Layer 2: Card N+2 (Middle card) */}
      {cardN2 && (
        <BackCardLayer
          question={cardN2}
          layer={2}
          isAdvancing={isAdvancing}
          characterGender={characterGender}
          isPractice={isPractice}
          maxAttempts={maxAttempts}
          streak={streak}
        />
      )}

      {/* Layer 1: Card N+1 (Immediately behind active card) */}
      {cardN1 && (
        <BackCardLayer
          question={cardN1}
          layer={1}
          isAdvancing={isAdvancing}
          characterGender={characterGender}
          isPractice={isPractice}
          maxAttempts={maxAttempts}
          streak={streak}
        />
      )}

      {/* =========================================================================
          PRIMARY ACTIVE QUIZ CARD (Question N)
          Interactive foreground card with real input, keyboard focus, and transition.
          ========================================================================= */}
      <div
        key={`card-active-${currentQuestion.id}`}
        onClick={handleCardClick}
        dir="rtl"
        className={`absolute inset-x-0 top-0 bottom-4 sm:bottom-5 z-30 w-full bg-white dark:bg-slate-900 rounded-3xl p-0 shadow-xl border border-slate-200/90 dark:border-slate-800 cursor-text flex flex-col overflow-hidden ${feedbackRingClass} ${
          isAdvancing ? 'animate-card-slide-down-fade pointer-events-none' : 'scale-100 opacity-100 transition-shadow duration-200'
        }`}
      >
        <QuizCardContent 
          question={currentQuestion}
          characterGender={characterGender}
          isPractice={isPractice}
          currentAttempts={currentAttempts}
          maxAttempts={maxAttempts}
          streak={streak}
          feedbackStatus={feedbackStatus}
          userAnswer={userAnswer}
          onExit={onExit}
        />
      </div>
    </div>
  );
};

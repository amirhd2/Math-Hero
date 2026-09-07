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
import React, { useMemo } from 'react';
import { QuizQuestion, CharacterGender, CharacterPose } from '../../types';
import { QuestionRenderer } from './QuestionRenderer';
import { QuizCardContent } from './QuizCardContent';
import { toPersianDigits } from '../../utils/persian';

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
}

const BackCardLayer: React.FC<BackCardLayerProps> = ({
  question,
  layer,
  isAdvancing,
  characterGender,
  isPractice,
  maxAttempts,
}) => {
  // Tight physical stack transforms (subtle 3px step bottom protrusion bringing cards UP close under card 1)
  let transformClasses = '';
  let bgClasses = '';

  if (layer === 1) {
    // Card N+1 (Immediately behind active card)
    transformClasses = isAdvancing
      ? 'translate-y-0 scale-x-100 opacity-100 shadow-xl z-30'
      : 'translate-y-[3px] scale-x-[0.985] opacity-100 z-20 shadow-xs';
    bgClasses = 'bg-slate-50 dark:bg-slate-800/90 border-slate-200/90 dark:border-slate-700/80';
  } else if (layer === 2) {
    // Card N+2 (Third card in stack)
    transformClasses = isAdvancing
      ? 'translate-y-[3px] scale-x-[0.985] opacity-100 z-20 shadow-xs'
      : 'translate-y-[6px] scale-x-[0.97] opacity-90 z-10 shadow-2xs';
    bgClasses = 'bg-slate-100 dark:bg-slate-800/70 border-slate-200/70 dark:border-slate-700/60';
  } else {
    // Card N+3 (Fourth card in stack)
    transformClasses = isAdvancing
      ? 'translate-y-[6px] scale-x-[0.97] opacity-90 z-10 shadow-2xs'
      : 'translate-y-[9px] scale-x-[0.955] opacity-75 z-0 shadow-2xs';
    bgClasses = 'bg-slate-200 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/40';
  }

  return (
    <div
      key={`back-card-${layer}-${question.id}`}
      aria-hidden="true"
      className={`absolute inset-0 origin-top rounded-3xl pointer-events-none select-none transition-all duration-300 cubic-bezier(0.3, 0, 0.2, 1) flex flex-col justify-between p-4 sm:p-6 overflow-hidden border h-full ${bgClasses} ${transformClasses}`}
    >
      <div className="w-full h-full flex flex-col overflow-hidden pointer-events-none opacity-80" dir="rtl">
        <QuizCardContent 
          question={question}
          characterGender={characterGender}
          isPractice={isPractice}
          currentAttempts={0}
          maxAttempts={maxAttempts}
          streak={0}
        />
      </div>
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
    <div className="relative w-full max-w-3xl lg:max-w-4xl mx-auto select-none pb-2 pt-0 h-full min-h-[300px]">
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
        />
      )}

      {/* Layer 2: Card N+2 (Middle card) */}
      {cardN2 && (
        <BackCardLayer
          question={cardN2}
          layer={2}
          isAdvancing={isAdvancing}
          characterGender={characterGender}
        />
      )}

      {/* Layer 1: Card N+1 (Immediately behind active card) */}
      {cardN1 && (
        <BackCardLayer
          question={cardN1}
          layer={1}
          isAdvancing={isAdvancing}
          characterGender={characterGender}
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
        className={`absolute inset-0 z-30 w-full bg-white dark:bg-slate-900 rounded-3xl p-0 shadow-xl border border-slate-200/90 dark:border-slate-800 transition-all duration-300 cursor-text flex flex-col h-full overflow-hidden ${feedbackRingClass} ${
          isAdvancing ? 'animate-calendar-tear-fall pointer-events-none' : 'scale-100 opacity-100'
        }`}
      >


        <QuizCardContent 
          question={currentQuestion}
          characterGender={characterGender}
          isPractice={isPractice}
          currentAttempts={currentAttempts}
          maxAttempts={maxAttempts}
          streak={streak}
        />
      </div>
    </div>
  );
};

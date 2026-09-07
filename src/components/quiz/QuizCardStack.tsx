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
}

const BackCardLayer: React.FC<BackCardLayerProps> = ({
  question,
  layer,
  isAdvancing,
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
      className={`absolute inset-0 origin-top rounded-3xl pointer-events-none select-none transition-all duration-300 cubic-bezier(0.3, 0, 0.2, 1) flex flex-col justify-between p-4 sm:p-6 overflow-hidden border h-[60vh] ${bgClasses} ${transformClasses}`}
    >
      {/* Clean inner background shell for stacked card depth */}
      <div className="w-full h-full rounded-2xl border border-dashed border-slate-200/50 dark:border-slate-700/50" />
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

  const getOperationIcon = (op: string) => {
    switch (op) {
      case 'addition':
        return { symbol: '+', class: 'bg-blue-100 text-blue-600 border-blue-200 dark:bg-blue-900/50 dark:text-blue-400 dark:border-blue-800' };
      case 'subtraction':
        return { symbol: '−', class: 'bg-amber-100 text-amber-600 border-amber-200 dark:bg-amber-900/50 dark:text-amber-400 dark:border-amber-800' };
      case 'multiplication':
        return { symbol: '×', class: 'bg-purple-100 text-purple-600 border-purple-200 dark:bg-purple-900/50 dark:text-purple-400 dark:border-purple-800' };
      case 'division':
        return { symbol: '÷', class: 'bg-emerald-100 text-emerald-600 border-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-400 dark:border-emerald-800' };
      default:
        return { symbol: '★', class: 'bg-indigo-100 text-indigo-600 border-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-400 dark:border-indigo-800' };
    }
  };

  const handleCardClick = () => {
    const inputEl = document.getElementById('math-quiz-numeric-input') as HTMLInputElement | null;
    if (inputEl) {
      inputEl.focus({ preventScroll: true });
    }
  };

  const cardN1 = upcomingQuestions[0] || null;
  const cardN2 = upcomingQuestions[1] || null;
  const cardN3 = upcomingQuestions[2] || null;
  const activeOpInfo = getOperationIcon(currentQuestion.operation);

  // Generate a random image ID based on the question ID to keep it stable during re-renders
  const imageId = useMemo(() => {
    let hash = 0;
    const str = currentQuestion.id;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const absHash = Math.abs(hash);
    if (characterGender === 'boy') {
      const validIds = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
      return validIds[absHash % validIds.length];
    } else {
      const validIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
      return validIds[absHash % validIds.length];
    }
  }, [currentQuestion.id, characterGender]);

  return (
    <div className="relative w-full max-w-2xl mx-auto select-none pb-2 pt-0 h-[60vh]">
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
        className={`absolute inset-0 z-30 w-full bg-white dark:bg-slate-900 rounded-3xl p-0 shadow-xl border border-slate-200/90 dark:border-slate-800 transition-all duration-300 cursor-text flex flex-row h-full overflow-hidden ${feedbackRingClass} ${
          isAdvancing ? 'animate-calendar-tear-fall pointer-events-none' : 'scale-100 opacity-100'
        }`}
      >
        {/* Animated Streak Banner (Top Left) */}
        {streak >= 2 && (
           <div className="absolute top-3 left-3 z-40">
             <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-black shadow-lg animate-bounce border border-amber-300/50 dark:border-amber-700/50">
                <span>🔥</span>
                <span>{toPersianDigits(streak)} متوالی!</span>
             </div>
           </div>
        )}

        {/* Right Half: Math Question Content */}
        <div className="w-1/2 p-3 sm:p-5 flex flex-col justify-between">
          {/* Top Header inside Active Card */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100 dark:border-slate-800/80">
            {/* Right side (RTL): Operation Icon */}
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center text-lg sm:text-2xl font-black shadow-xs border ${activeOpInfo.class}`}>
                {activeOpInfo.symbol}
              </div>
            </div>

            {/* Center: Mode Badge */}
            <div className="flex-1 flex justify-center w-full">
              <span
                className={`text-[10px] sm:text-[11px] px-2 sm:px-3 py-1 rounded-full font-black border shadow-2xs whitespace-nowrap ${
                  isPractice
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                }`}
              >
                {isPractice ? 'تمرین یادگیری 🌱' : 'آزمون استاندارد 🎯'}
              </span>
            </div>

            {/* Left side (RTL): Attempts */}
            <div className="flex items-center">
              {isPractice ? (
                <span className="text-[10px] sm:text-xs font-bold px-2 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 whitespace-nowrap">
                  تلاش {toPersianDigits(currentAttempts + 1)} از {toPersianDigits(maxAttempts)}
                </span>
              ) : (
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
                  آزمون
                </span>
              )}
            </div>
          </div>

          {/* Math Question Presentation */}
          <div className="my-auto py-2 flex items-center justify-center">
            <QuestionRenderer question={currentQuestion} />
          </div>
        </div>

        {/* Left Half: Random Image */}
        <div className="w-1/2 relative h-full flex flex-col justify-end items-start p-0 m-0 bg-transparent">
          <img 
            src={`/assets/characters/${characterGender}/half-body/${imageId}.webp`} 
            alt="Character"
            className="w-full max-h-[90%] object-contain object-left-bottom absolute left-0 bottom-0 pointer-events-none"
            style={{ margin: 0, padding: 0 }}
          />
        </div>
      </div>
    </div>
  );
};

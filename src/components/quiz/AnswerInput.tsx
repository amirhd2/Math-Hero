/**
 * AnswerInput Component for Math Hero Quiz.
 * Designed specifically for young learners:
 * - Stable numeric input mode (keeps mobile keyboard open smoothly).
 * - Accepts both Persian and English digits, normalizes automatically.
 * - Anti-bounce / submission lock preventing duplicate submissions.
 * - RTL compatible.
 */

import React, { ChangeEvent, KeyboardEvent } from 'react';
import { toPersianDigits } from '../../utils/persian';

interface AnswerInputProps {
  inputRef: React.RefObject<HTMLInputElement | null>;
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  onAdvanceNow?: () => void;
  disabled?: boolean;
  isSubmitting?: boolean;
  isAdvancing?: boolean;
  revealedAnswer?: number | null;
  feedbackStatus?: 'idle' | 'correct' | 'incorrect' | 'revealed';
  isPractice?: boolean;
  attemptsLeft?: number;
}

export const AnswerInput: React.FC<AnswerInputProps> = ({
  inputRef,
  value,
  onChange,
  onSubmit,
  onAdvanceNow,
  disabled = false,
  isSubmitting = false,
  isAdvancing = false,
  revealedAnswer = null,
  feedbackStatus = 'idle',
  isPractice = true,
  attemptsLeft = 3,
}) => {
  const isLocked = disabled || isSubmitting || isAdvancing;
  const isAnswerRevealed = revealedAnswer !== null;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (isLocked || isAnswerRevealed) return;
    const raw = e.target.value;
    // Allow digits (English 0-9 and Persian ۰-۹) and optional negative sign for subtraction
    const sanitized = raw.replace(/[^\d۰-۹\-]/g, '');
    onChange(sanitized);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (isAnswerRevealed && onAdvanceNow) {
        onAdvanceNow();
      } else if (!isLocked && value.trim() !== '') {
        onSubmit();
      }
    }
  };

  // Border & Ring feedback classes
  let inputBorderClass = 'border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20';
  if (feedbackStatus === 'correct') {
    inputBorderClass = 'border-emerald-500 ring-4 ring-emerald-500/25 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300';
  } else if (feedbackStatus === 'incorrect') {
    inputBorderClass = 'border-rose-500 ring-4 ring-rose-500/25 bg-rose-50/50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 animate-shake';
  } else if (feedbackStatus === 'revealed') {
    inputBorderClass = 'border-amber-500 ring-4 ring-amber-500/25 bg-amber-50/50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300';
  }

  const displayValue = isAnswerRevealed
    ? toPersianDigits(revealedAnswer)
    : toPersianDigits(value);

  return (
    <div className="w-full space-y-3">
      {/* Primary Numeric Input Field */}
      <div className="relative">
        <input
          ref={inputRef}
          id="math-quiz-numeric-input"
          type="text"
          inputMode="numeric"
          pattern="[0-9۰-۹\-]*"
          autoFocus
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          dir="ltr"
          value={displayValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={isLocked || isAnswerRevealed}
          placeholder="پاسخ را بنویسید..."
          className={`w-full text-center text-3xl sm:text-4xl md:text-5xl font-black py-3.5 px-6 rounded-2xl md:rounded-3xl border-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-inner outline-none transition-all placeholder:text-base sm:placeholder:text-lg placeholder:font-bold placeholder:text-slate-400 ${inputBorderClass}`}
          aria-label="پاسخ عددی"
        />

        {/* Clear button if child entered text */}
        {!isLocked && !isAnswerRevealed && value.length > 0 && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center text-xs font-bold hover:bg-slate-300 transition-colors"
            title="پاک کردن"
          >
            ✕
          </button>
        )}
      </div>

      {/* Action Button: Submit or Proceed */}
      {isAnswerRevealed ? (
        <button
          type="button"
          onClick={onAdvanceNow}
          className="w-full py-3.5 sm:py-4 bg-amber-500 hover:bg-amber-600 active:scale-98 text-slate-950 font-black rounded-2xl shadow-lg shadow-amber-500/20 transition-all text-base sm:text-lg flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>متوجه شدم، سوال بعدی</span>
          <span>←</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={onSubmit}
          disabled={isLocked || value.trim() === ''}
          className={`w-full py-3.5 sm:py-4 text-white font-black rounded-2xl shadow-xl transition-all text-base sm:text-lg flex items-center justify-center gap-2 ${
            isPractice
              ? 'bg-emerald-600 hover:bg-emerald-500 active:scale-98 shadow-emerald-600/20'
              : 'bg-indigo-600 hover:bg-indigo-500 active:scale-98 shadow-indigo-600/20'
          } disabled:opacity-40 disabled:pointer-events-none cursor-pointer`}
        >
          <span>{isSubmitting ? 'در حال بررسی...' : 'ثبت پاسخ'}</span>
          <span className="text-xl">⏎</span>
        </button>
      )}
    </div>
  );
};

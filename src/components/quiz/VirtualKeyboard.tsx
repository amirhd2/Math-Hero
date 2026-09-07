/**
 * Custom Virtual Numeric Keyboard Component for Math Hero.
 * - Replaces native OS system soft keyboard completely across mobile devices.
 * - Supports light and dark mode automatically.
 * - Fixed max width for tablets & desktops (max-w-md).
 * - Exact keypad layout with 1-9, 0, blue "ثبت جواب" on right of 0, and red/slate "خروج" on left of 0.
 * - Upper utility header with Backspace / Clear button.
 */
import React, { useEffect, ReactNode } from 'react';
import { toPersianDigits } from '../../utils/persian';

interface VirtualKeyboardProps {
  onInputDigit: (digit: string) => void;
  onBackspace: () => void;
  onSubmit: () => void;
  onExit: () => void;
  disabled?: boolean;
  submitDisabled?: boolean;
  isPractice?: boolean;
  submitLabel?: string;
  exitLabel?: string;
  children?: ReactNode;
}

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  onInputDigit,
  onBackspace,
  onSubmit,
  onExit,
  disabled = false,
  submitDisabled = false,
  isPractice = false,
  submitLabel = 'ثبت جواب',
  exitLabel = 'خروج',
  children,
}) => {
  // Global physical keyboard listener for desktop users
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;
      
      // Convert Persian or English keyboard inputs
      let digit = e.key;
      if (digit >= '0' && digit <= '9') {
        onInputDigit(digit);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        onBackspace();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (!submitDisabled) {
          onSubmit();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onExit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [disabled, submitDisabled, onInputDigit, onBackspace, onSubmit, onExit]);

  const handleKeyClick = (digit: string) => {
    if (disabled) return;
    onInputDigit(digit);
  };

  return (
    <div className="w-full max-w-md lg:max-w-lg mx-auto select-none pt-2 pb-2 px-2.5 bg-slate-100/95 dark:bg-slate-900/95 backdrop-blur-md rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xl shrink-0 h-full flex flex-col">
      {/* Answer Input Box goes here at the top */}
      {children && (
        <div className="mb-2 w-full shrink-0">
          {children}
        </div>
      )}

      {/* Main 3-Column Keypad (LTR order so 1 is top-left, 3 is top-right) */}
      <div className="grid grid-cols-3 grid-rows-4 gap-1.5 sm:gap-2 text-center flex-1" dir="ltr">
        {/* Row 1: 1, 2, 3 */}
        <button
          type="button"
          onClick={() => handleKeyClick('1')}
          disabled={disabled}
          className="h-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 active:bg-slate-100 dark:active:bg-slate-700 active:scale-95 text-slate-800 dark:text-slate-100 text-xl sm:text-2xl font-black rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs transition-all cursor-pointer disabled:opacity-40"
        >
          {toPersianDigits(1)}
        </button>
        <button
          type="button"
          onClick={() => handleKeyClick('2')}
          disabled={disabled}
          className="h-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 active:bg-slate-100 dark:active:bg-slate-700 active:scale-95 text-slate-800 dark:text-slate-100 text-xl sm:text-2xl font-black rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs transition-all cursor-pointer disabled:opacity-40"
        >
          {toPersianDigits(2)}
        </button>
        <button
          type="button"
          onClick={() => handleKeyClick('3')}
          disabled={disabled}
          className="h-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 active:bg-slate-100 dark:active:bg-slate-700 active:scale-95 text-slate-800 dark:text-slate-100 text-xl sm:text-2xl font-black rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs transition-all cursor-pointer disabled:opacity-40"
        >
          {toPersianDigits(3)}
        </button>

        {/* Row 2: 4, 5, 6 */}
        <button
          type="button"
          onClick={() => handleKeyClick('4')}
          disabled={disabled}
          className="h-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 active:bg-slate-100 dark:active:bg-slate-700 active:scale-95 text-slate-800 dark:text-slate-100 text-xl sm:text-2xl font-black rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs transition-all cursor-pointer disabled:opacity-40"
        >
          {toPersianDigits(4)}
        </button>
        <button
          type="button"
          onClick={() => handleKeyClick('5')}
          disabled={disabled}
          className="h-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 active:bg-slate-100 dark:active:bg-slate-700 active:scale-95 text-slate-800 dark:text-slate-100 text-xl sm:text-2xl font-black rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs transition-all cursor-pointer disabled:opacity-40"
        >
          {toPersianDigits(5)}
        </button>
        <button
          type="button"
          onClick={() => handleKeyClick('6')}
          disabled={disabled}
          className="h-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 active:bg-slate-100 dark:active:bg-slate-700 active:scale-95 text-slate-800 dark:text-slate-100 text-xl sm:text-2xl font-black rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs transition-all cursor-pointer disabled:opacity-40"
        >
          {toPersianDigits(6)}
        </button>

        {/* Row 3: 7, 8, 9 */}
        <button
          type="button"
          onClick={() => handleKeyClick('7')}
          disabled={disabled}
          className="h-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 active:bg-slate-100 dark:active:bg-slate-700 active:scale-95 text-slate-800 dark:text-slate-100 text-xl sm:text-2xl font-black rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs transition-all cursor-pointer disabled:opacity-40"
        >
          {toPersianDigits(7)}
        </button>
        <button
          type="button"
          onClick={() => handleKeyClick('8')}
          disabled={disabled}
          className="h-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 active:bg-slate-100 dark:active:bg-slate-700 active:scale-95 text-slate-800 dark:text-slate-100 text-xl sm:text-2xl font-black rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs transition-all cursor-pointer disabled:opacity-40"
        >
          {toPersianDigits(8)}
        </button>
        <button
          type="button"
          onClick={() => handleKeyClick('9')}
          disabled={disabled}
          className="h-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 active:bg-slate-100 dark:active:bg-slate-700 active:scale-95 text-slate-800 dark:text-slate-100 text-xl sm:text-2xl font-black rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs transition-all cursor-pointer disabled:opacity-40"
        >
          {toPersianDigits(9)}
        </button>

        {/* Row 4: Column 1 = Exit (Left of 0), Column 2 = 0, Column 3 = Submit (Right of 0) */}
        {/* Left Column: Exit Button */}
        <button
          type="button"
          onClick={onExit}
          disabled={disabled}
          className="h-full px-1 bg-rose-100 dark:bg-rose-950/70 hover:bg-rose-200 dark:hover:bg-rose-900 active:bg-rose-300 dark:active:bg-rose-800 active:scale-95 text-rose-700 dark:text-rose-300 font-black text-xs sm:text-sm rounded-2xl border border-rose-200/70 dark:border-rose-800/70 shadow-2xs transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40"
        >
          <span>{exitLabel}</span>
          <span className="text-sm">✕</span>
        </button>

        {/* Center Column: Digit 0 Key */}
        <button
          type="button"
          onClick={() => handleKeyClick('0')}
          disabled={disabled}
          className="h-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 active:bg-slate-100 dark:active:bg-slate-700 active:scale-95 text-slate-800 dark:text-slate-100 text-xl sm:text-2xl font-black rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs transition-all cursor-pointer disabled:opacity-40"
        >
          {toPersianDigits(0)}
        </button>

        {/* Right Column: Submit Button */}
        <button
          type="button"
          onClick={onSubmit}
          disabled={disabled || submitDisabled}
          className={`h-full px-1 ${
            isPractice
              ? 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-emerald-600/20'
              : 'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-indigo-600/20'
          } active:scale-95 font-black text-xs sm:text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40 disabled:pointer-events-none`}
        >
          <span>{submitLabel}</span>
          <span className="text-base sm:text-lg">↵</span>
        </button>
      </div>
    </div>
  );
};

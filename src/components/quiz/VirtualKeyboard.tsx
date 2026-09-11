/**
 * Custom Virtual Numeric Keyboard Component for Math Hero.
 * - Replaces native OS system soft keyboard completely across mobile devices.
 * - Supports light and dark mode automatically.
 * - Fixed max width for tablets & desktops (max-w-md).
 * - Exact keypad layout with 1-9, 0, Backspace icon on left of 0, and "ثبت جواب" on right of 0.
 */
import React, { useEffect, ReactNode } from 'react';
import { Delete } from 'lucide-react';
import { toPersianDigits } from '../../utils/persian';

interface VirtualKeyboardProps {
  onInputDigit: (digit: string) => void;
  onBackspace: () => void;
  onSubmit: () => void;
  onExit?: () => void;
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
      } else if (e.key === 'Escape' && onExit) {
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
    <div className="w-full max-w-md lg:max-w-lg mx-auto select-none p-1.5 sm:p-2 bg-slate-100/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xl shrink-0 flex flex-col h-full justify-between">
      {/* Answer Input Box goes here at the top */}
      {children && (
        <div className="mb-1 w-full shrink-0">
          {children}
        </div>
      )}

      {/* Main 3-Column Keypad (LTR order so 1 is top-left, 3 is top-right) */}
      <div className="grid grid-cols-3 grid-rows-4 gap-1 sm:gap-1.5 text-center flex-1 min-h-0 w-full" dir="ltr">
        {/* Row 1: 1, 2, 3 */}
        <button
          type="button"
          onClick={() => handleKeyClick('1')}
          disabled={disabled}
          className="h-full min-h-[30px] bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 active:bg-slate-100 dark:active:bg-slate-700 active:scale-95 text-slate-800 dark:text-slate-100 text-lg sm:text-xl md:text-2xl font-black rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs transition-all flex items-center justify-center cursor-pointer disabled:opacity-40"
        >
          {toPersianDigits(1)}
        </button>
        <button
          type="button"
          onClick={() => handleKeyClick('2')}
          disabled={disabled}
          className="h-full min-h-[30px] bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 active:bg-slate-100 dark:active:bg-slate-700 active:scale-95 text-slate-800 dark:text-slate-100 text-lg sm:text-xl md:text-2xl font-black rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs transition-all flex items-center justify-center cursor-pointer disabled:opacity-40"
        >
          {toPersianDigits(2)}
        </button>
        <button
          type="button"
          onClick={() => handleKeyClick('3')}
          disabled={disabled}
          className="h-full min-h-[30px] bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 active:bg-slate-100 dark:active:bg-slate-700 active:scale-95 text-slate-800 dark:text-slate-100 text-lg sm:text-xl md:text-2xl font-black rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs transition-all flex items-center justify-center cursor-pointer disabled:opacity-40"
        >
          {toPersianDigits(3)}
        </button>

        {/* Row 2: 4, 5, 6 */}
        <button
          type="button"
          onClick={() => handleKeyClick('4')}
          disabled={disabled}
          className="h-full min-h-[30px] bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 active:bg-slate-100 dark:active:bg-slate-700 active:scale-95 text-slate-800 dark:text-slate-100 text-lg sm:text-xl md:text-2xl font-black rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs transition-all flex items-center justify-center cursor-pointer disabled:opacity-40"
        >
          {toPersianDigits(4)}
        </button>
        <button
          type="button"
          onClick={() => handleKeyClick('5')}
          disabled={disabled}
          className="h-full min-h-[30px] bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 active:bg-slate-100 dark:active:bg-slate-700 active:scale-95 text-slate-800 dark:text-slate-100 text-lg sm:text-xl md:text-2xl font-black rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs transition-all flex items-center justify-center cursor-pointer disabled:opacity-40"
        >
          {toPersianDigits(5)}
        </button>
        <button
          type="button"
          onClick={() => handleKeyClick('6')}
          disabled={disabled}
          className="h-full min-h-[30px] bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 active:bg-slate-100 dark:active:bg-slate-700 active:scale-95 text-slate-800 dark:text-slate-100 text-lg sm:text-xl md:text-2xl font-black rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs transition-all flex items-center justify-center cursor-pointer disabled:opacity-40"
        >
          {toPersianDigits(6)}
        </button>

        {/* Row 3: 7, 8, 9 */}
        <button
          type="button"
          onClick={() => handleKeyClick('7')}
          disabled={disabled}
          className="h-full min-h-[30px] bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 active:bg-slate-100 dark:active:bg-slate-700 active:scale-95 text-slate-800 dark:text-slate-100 text-lg sm:text-xl md:text-2xl font-black rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs transition-all flex items-center justify-center cursor-pointer disabled:opacity-40"
        >
          {toPersianDigits(7)}
        </button>
        <button
          type="button"
          onClick={() => handleKeyClick('8')}
          disabled={disabled}
          className="h-full min-h-[30px] bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 active:bg-slate-100 dark:active:bg-slate-700 active:scale-95 text-slate-800 dark:text-slate-100 text-lg sm:text-xl md:text-2xl font-black rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs transition-all flex items-center justify-center cursor-pointer disabled:opacity-40"
        >
          {toPersianDigits(8)}
        </button>
        <button
          type="button"
          onClick={() => handleKeyClick('9')}
          disabled={disabled}
          className="h-full min-h-[30px] bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 active:bg-slate-100 dark:active:bg-slate-700 active:scale-95 text-slate-800 dark:text-slate-100 text-lg sm:text-xl md:text-2xl font-black rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs transition-all flex items-center justify-center cursor-pointer disabled:opacity-40"
        >
          {toPersianDigits(9)}
        </button>

        {/* Row 4: Column 1 = Backspace (Left of 0), Column 2 = 0, Column 3 = Submit (Right of 0) */}
        {/* Left Column: Backspace Icon Button */}
        <button
          type="button"
          onClick={onBackspace}
          disabled={disabled}
          className="h-full min-h-[30px] bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 active:bg-slate-400 dark:active:bg-slate-600 active:scale-95 text-slate-700 dark:text-slate-200 rounded-xl sm:rounded-2xl border border-slate-300/80 dark:border-slate-700/80 shadow-2xs transition-all flex items-center justify-center cursor-pointer disabled:opacity-40"
          aria-label="پاک کردن"
          title="پاک کردن"
        >
          <Delete className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Center Column: Digit 0 Key */}
        <button
          type="button"
          onClick={() => handleKeyClick('0')}
          disabled={disabled}
          className="h-full min-h-[30px] bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 active:bg-slate-100 dark:active:bg-slate-700 active:scale-95 text-slate-800 dark:text-slate-100 text-lg sm:text-xl md:text-2xl font-black rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs transition-all flex items-center justify-center cursor-pointer disabled:opacity-40"
        >
          {toPersianDigits(0)}
        </button>

        {/* Right Column: Submit Button */}
        <button
          type="button"
          onClick={onSubmit}
          disabled={disabled || submitDisabled}
          className={`h-full min-h-[30px] px-1 ${
            isPractice
              ? 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-emerald-600/20'
              : 'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-indigo-600/20'
          } active:scale-95 font-black text-xs sm:text-sm rounded-xl sm:rounded-2xl shadow-md transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40 disabled:pointer-events-none`}
        >
          <span>{submitLabel}</span>
          <span className="text-base sm:text-lg">↵</span>
        </button>
      </div>
    </div>
  );
};

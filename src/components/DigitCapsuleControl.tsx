/**
 * DigitCapsuleControl component for Math Hero.
 * Compact [ - ] [ 2 ] [ + ] control.
 * Supports direct tapping to open numeric keyboard and type,
 * plus comfortable increment and decrement touch targets.
 */

import React, { useState } from 'react';
import { toPersianDigits, parseNumericInput } from '../utils/persian';
import { VirtualKeyboard } from './quiz/VirtualKeyboard';

interface DigitCapsuleControlProps {
  value: number;
  onChange: (newValue: number) => void;
  min?: number;
  max?: number;
  label?: string;
  id?: string;
  disabled?: boolean;
}

export const DigitCapsuleControl: React.FC<DigitCapsuleControlProps> = ({
  value,
  onChange,
  min = 1,
  max = 100,
  label,
  id = 'digit-capsule',
  disabled = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempVal, setTempVal] = useState(String(value));

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    if (value < max) {
      onChange(value + 1);
    }
  };

  const handleStartEdit = () => {
    if (disabled) return;
    setTempVal(String(value));
    setIsEditing(true);
  };

  const handleInputDigit = (digit: string) => {
    setTempVal((prev) => {
      if (prev === '0') return digit;
      if (prev.length >= 4) return prev;
      return prev + digit;
    });
  };

  const handleBackspace = () => {
    setTempVal((prev) => (prev.length <= 1 ? '' : prev.slice(0, -1)));
  };

  const handleConfirmEdit = () => {
    setIsEditing(false);
    const parsed = parseNumericInput(tempVal);
    if (!Number.isNaN(parsed)) {
      const clamped = Math.max(min, Math.min(max, parsed));
      onChange(clamped);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col items-center gap-1">
      {label && (
        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
          {label}
        </span>
      )}
      <div
        id={id}
        className={`inline-flex items-center rounded-2xl bg-slate-100 dark:bg-slate-800/80 p-1 border border-slate-200 dark:border-slate-700 shadow-sm transition-all ${
          disabled ? 'opacity-50 pointer-events-none' : 'hover:border-indigo-300 dark:hover:border-indigo-600'
        }`}
      >
        {/* Decrement Button */}
        <button
          type="button"
          aria-label="کاهش رقم"
          disabled={disabled || value <= min}
          onClick={handleDecrement}
          className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-lg text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-30 disabled:hover:bg-transparent shadow-xs active:scale-95 transition-all cursor-pointer"
        >
          −
        </button>

        {/* Center Value Capsule (Tappable & Opens Virtual Keyboard Modal) */}
        <div
          onClick={handleStartEdit}
          className="min-w-[40px] px-2 h-8 flex items-center justify-center cursor-pointer select-none group"
          title="لمس کنید تا با صفحه‌کلید مجازی جدید تایپ کنید"
        >
          <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {toPersianDigits(value)} {label !== undefined && label !== "" && <span className="text-[10px] font-normal text-slate-400">رقم</span>}
          </span>
        </div>

        {/* Increment Button */}
        <button
          type="button"
          aria-label="افزایش رقم"
          disabled={disabled || value >= max}
          onClick={handleIncrement}
          className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-lg text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-30 disabled:hover:bg-transparent shadow-xs active:scale-95 transition-all cursor-pointer"
        >
          +
        </button>
      </div>

      {/* Virtual Keyboard Modal Overlay */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 animate-fade-in" onClick={handleCancelEdit}>
          <div className="w-full max-w-sm sm:max-w-md bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="font-black text-sm text-slate-800 dark:text-slate-100">
                {label || 'تنظیم مقدار'}
              </span>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-center font-bold text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border-2 border-indigo-500/80 text-center">
              <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
                {tempVal ? toPersianDigits(tempVal) : '۰'}
              </span>
            </div>

            <VirtualKeyboard
              onInputDigit={handleInputDigit}
              onBackspace={handleBackspace}
              onSubmit={handleConfirmEdit}
              onExit={handleCancelEdit}
              submitLabel="تایید"
              exitLabel="انصراف"
            />
          </div>
        </div>
      )}
    </div>
  );
};

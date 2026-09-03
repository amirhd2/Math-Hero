/**
 * DigitCapsuleControl component for Math Hero.
 * Compact [ - ] [ 2 ] [ + ] control.
 * Supports direct tapping to open numeric keyboard and type,
 * plus comfortable increment and decrement touch targets.
 */

import React, { useState, useRef } from 'react';
import { toPersianDigits, parseNumericInput } from '../utils/persian';

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
  max = 4,
  label,
  id = 'digit-capsule',
  disabled = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempVal, setTempVal] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

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
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 50);
  };

  const handleFinishEdit = () => {
    setIsEditing(false);
    const parsed = parseNumericInput(tempVal);
    if (!Number.isNaN(parsed)) {
      const clamped = Math.max(min, Math.min(max, parsed));
      onChange(clamped);
    }
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
          className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-lg text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-30 disabled:hover:bg-transparent shadow-xs active:scale-95 transition-all"
        >
          −
        </button>

        {/* Center Value Capsule (Tappable & Editable) */}
        <div
          onClick={handleStartEdit}
          className="min-w-[40px] px-2 h-8 flex items-center justify-center cursor-pointer select-none group"
          title="لمس کنید تا با صفحه کلید تایپ کنید"
        >
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              pattern="[0-9۰-۹]*"
              value={tempVal}
              onChange={(e) => setTempVal(e.target.value)}
              onBlur={handleFinishEdit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleFinishEdit();
              }}
              className="w-8 text-center text-sm font-extrabold bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border border-indigo-500 rounded-lg outline-none"
            />
          ) : (
            <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {toPersianDigits(value)} <span className="text-[10px] font-normal text-slate-400">رقم</span>
            </span>
          )}
        </div>

        {/* Increment Button */}
        <button
          type="button"
          aria-label="افزایش رقم"
          disabled={disabled || value >= max}
          onClick={handleIncrement}
          className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-lg text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-30 disabled:hover:bg-transparent shadow-xs active:scale-95 transition-all"
        >
          +
        </button>
      </div>
    </div>
  );
};

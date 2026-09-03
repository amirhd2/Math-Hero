/**
 * Reusable Numeric Input component for Math Hero.
 * Supports Persian and English digits, numeric keyboard input mode, and automatic normalization.
 */

import React, { useState, useEffect } from 'react';
import { formatNumber, parseNumericInput, toPersianDigits } from '../utils/persian';

interface NumericInputProps {
  value: number | string;
  onChange: (val: number) => void;
  onSubmit?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  className?: string;
  displayFormat?: 'persian' | 'english';
  id?: string;
}

export const NumericInput: React.FC<NumericInputProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = '۰',
  autoFocus = false,
  disabled = false,
  className = '',
  displayFormat = 'persian',
  id = 'math-numeric-input',
}) => {
  const [inputValue, setInputValue] = useState<string>('');

  useEffect(() => {
    if (value !== undefined && value !== null && value !== '') {
      setInputValue(formatNumber(value, displayFormat as 'persian' | 'english'));
    } else {
      setInputValue('');
    }
  }, [value, displayFormat]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setInputValue(raw);
    const parsed = parseNumericInput(raw);
    if (!Number.isNaN(parsed)) {
      onChange(parsed);
    } else if (raw === '' || raw === '-') {
      onChange(0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSubmit) {
      onSubmit();
    }
  };

  return (
    <input
      id={id}
      type="text"
      inputMode="numeric"
      pattern="[0-9۰-۹]*"
      autoComplete="off"
      autoCorrect="off"
      spellCheck={false}
      autoFocus={autoFocus}
      disabled={disabled}
      value={inputValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder={toPersianDigits(placeholder)}
      className={`w-full text-center text-3xl md:text-4xl font-extrabold py-4 px-6 rounded-2xl border-2 border-indigo-200 dark:border-indigo-900 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-inner focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all ${className}`}
    />
  );
};

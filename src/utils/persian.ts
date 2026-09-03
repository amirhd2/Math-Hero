/**
 * Persian and English Digits Normalization and Formatting Utilities
 */

const persianDigitsMap: Record<string, string> = {
  '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
  '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
  '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
  '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
};

const englishDigitsMap: Record<string, string> = {
  '0': '۰', '1': '۱', '2': '۲', '3': '۳', '4': '۴',
  '5': '۵', '6': '۶', '7': '۷', '8': '۸', '9': '۹'
};

/**
 * Converts any Persian/Arabic digits in a string to standard English digits (0-9).
 */
export function toEnglishDigits(input: string | number): string {
  if (input === null || input === undefined) return '';
  const str = String(input);
  return str.replace(/[۰-۹٠-٩]/g, (char) => persianDigitsMap[char] || char);
}

/**
 * Converts English digits to Persian digits (۰-۹).
 */
export function toPersianDigits(input: string | number): string {
  if (input === null || input === undefined) return '';
  const str = String(input);
  return str.replace(/[0-9]/g, (char) => englishDigitsMap[char] || char);
}

/**
 * Normalizes user numeric input (accepts both Persian and English digits) and parses it into a number.
 * Returns NaN if invalid.
 */
export function parseNumericInput(input: string): number {
  if (!input || typeof input !== 'string') return NaN;
  const normalized = toEnglishDigits(input.trim());
  return Number(normalized);
}

/**
 * Formats a number according to the user's preferred display setting ('persian' | 'english').
 */
export function formatNumber(value: number | string, preference: 'persian' | 'english' = 'persian'): string {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '';
  const str = String(value);
  if (preference === 'persian') {
    return toPersianDigits(str);
  }
  return toEnglishDigits(str);
}

/**
 * Formats a math expression like "۵ + ۳ = ۸" or "5 + 3 = 8".
 */
export function formatExpression(num1: number, operation: string, num2: number, preference: 'persian' | 'english' = 'persian'): string {
  const opSymbol = 
    operation === 'addition' ? '+' :
    operation === 'subtraction' ? '-' :
    operation === 'multiplication' ? '×' : '÷';
  
  return `${formatNumber(num1, preference)} ${opSymbol} ${formatNumber(num2, preference)}`;
}

/**
 * Answer Validator for the Math Hero Quiz Engine.
 * Normalizes Persian/English digits, handles negatives, tracks attempt bounds,
 * and enforces strict Test vs learning Practice mode constraints.
 */

import { QuizMode, QuizQuestion } from '../types';
import { AnswerValidationResult } from './quizTypes';
import { parseNumericInput, toPersianDigits } from '../utils/persian';

export const PRACTICE_MAX_ATTEMPTS = 3;
export const TEST_MAX_ATTEMPTS = 1;

/**
 * Normalizes raw user input into a parsed integer or null if empty/invalid.
 */
export function normalizeAnswer(rawInput: string | number | undefined | null): number | null {
  if (rawInput === undefined || rawInput === null || rawInput === '') {
    return null;
  }
  if (typeof rawInput === 'number') {
    return Number.isFinite(rawInput) ? rawInput : null;
  }
  const parsed = parseNumericInput(rawInput);
  return Number.isNaN(parsed) ? null : parsed;
}

/**
 * Validates a submitted answer against the current question and mode rules.
 */
export function validateAnswer(
  rawInput: string | number,
  question: QuizQuestion,
  mode: QuizMode,
  currentAttemptCount: number // prior attempts for this question
): AnswerValidationResult {
  const parsed = normalizeAnswer(rawInput);
  const attemptNumber = currentAttemptCount + 1;

  if (parsed === null) {
    return {
      isCorrect: false,
      parsedAnswer: 0,
      expectedAnswer: question.correctAnswer,
      attemptNumber,
      isExhausted: false,
      canRetry: true,
      message: 'لطفاً یک عدد معتبر وارد کنید.',
    };
  }

  const isCorrect = parsed === question.correctAnswer;

  if (isCorrect) {
    return {
      isCorrect: true,
      parsedAnswer: parsed,
      expectedAnswer: question.correctAnswer,
      attemptNumber,
      isExhausted: true,
      canRetry: false,
      message: 'آفرین! پاسخ کاملاً درسته 🌟',
    };
  }

  // Answer is incorrect
  if (mode === 'test') {
    // In Test mode: STRICT single attempt. NEVER reveal the correct answer.
    return {
      isCorrect: false,
      parsedAnswer: parsed,
      expectedAnswer: question.correctAnswer,
      attemptNumber,
      isExhausted: true,
      canRetry: false,
      message: undefined, // No answer or clue displayed during active Test
    };
  }

  // Practice mode: allow up to 3 attempts
  if (attemptNumber < PRACTICE_MAX_ATTEMPTS) {
    const attemptsLeft = PRACTICE_MAX_ATTEMPTS - attemptNumber;
    let hint = `دوباره امتحان کن قهرمان! (${toPersianDigits(attemptNumber)} از ۳ تلاش)`;
    if (attemptsLeft === 1) {
      hint = `دقت کن قهرمان، فقط ۱ فرصت دیگه داری! (${toPersianDigits(attemptNumber)} از ۳)`;
    }

    return {
      isCorrect: false,
      parsedAnswer: parsed,
      expectedAnswer: question.correctAnswer,
      attemptNumber,
      isExhausted: false,
      canRetry: true,
      message: hint,
    };
  }

  // 3rd failed attempt in Practice mode: reveal answer clearly and politely
  return {
    isCorrect: false,
    parsedAnswer: parsed,
    expectedAnswer: question.correctAnswer,
    attemptNumber,
    isExhausted: true,
    canRetry: false,
    revealedAnswer: question.correctAnswer,
    message: `پاسخ صحیح: ${toPersianDigits(question.correctAnswer)} است. اشکالی نداره، با تمرین قوی‌تر می‌شی! 🌱`,
  };
}

/**
 * Question Generator Engine for Math Hero.
 * Responsible for mathematical question generation, business rule validation,
 * operation distribution, inverse multiplication-table division, remainder logic,
 * and duplicate prevention with safe fallbacks.
 */

import {
  QuizConfiguration,
  QuizQuestion,
  QuizSession,
  OperationType,
  OperationSettings,
} from '../types';

export const MIN_QUESTIONS = 5;
export const MAX_QUESTIONS = 50;
export const DEFAULT_QUESTIONS = 10;

export const MIN_DIGITS = 1;
export const MAX_DIGITS = 4;

export const MULTIPLICATION_TABLES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export const DEFAULT_OPERATION_SETTINGS: OperationSettings = {
  addition: {
    operand1Digits: 2,
    operand2Digits: 2,
  },
  subtraction: {
    operand1Digits: 2,
    operand2Digits: 1,
    allowNegative: false,
  },
  multiplication: {
    mode: 'table',
    operand1Digits: 1,
    operand2Digits: 1,
    tableNumber: 9,
  },
  division: {
    mode: 'table',
    dividendDigits: 2,
    divisorDigits: 1,
    tableNumber: 9,
    allowRemainder: false,
  },
};

export const DEFAULT_QUIZ_CONFIG: QuizConfiguration = {
  mode: 'practice',
  questionCount: DEFAULT_QUESTIONS,
  selectedOperations: ['addition'],
  operationSettings: DEFAULT_OPERATION_SETTINGS,
  distribution: {
    addition: 100,
    subtraction: 0,
    multiplication: 0,
    division: 0,
    mixed: 0,
  },
  smartReviewEnabled: true,
};

/**
 * Generates a random integer with the specified number of digits.
 * e.g. 1 digit: 1 to 9 (or 2 to 9 for divisors)
 *      2 digits: 10 to 99
 *      3 digits: 100 to 999
 *      4 digits: 1000 to 9999
 */
export function generateNumberWithDigits(digits: number, minNonZero: number = 1): number {
  const safeDigits = Math.max(MIN_DIGITS, Math.min(MAX_DIGITS, digits));
  if (safeDigits === 1) {
    return Math.floor(Math.random() * (9 - minNonZero + 1)) + minNonZero;
  }
  const min = Math.pow(10, safeDigits - 1);
  const max = Math.pow(10, safeDigits) - 1;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Validates a quiz configuration against domain rules.
 */
export function validateQuizConfig(config: QuizConfiguration): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.questionCount || config.questionCount < MIN_QUESTIONS || config.questionCount > MAX_QUESTIONS) {
    errors.push(`تعداد سوالات باید بین ${MIN_QUESTIONS} تا ${MAX_QUESTIONS} باشد.`);
  }

  if (!config.selectedOperations || config.selectedOperations.length === 0) {
    errors.push('حداقل یک عملیات ریاضی باید انتخاب شود.');
  }

  // Validate distribution if multiple operations are selected
  if (config.selectedOperations && config.selectedOperations.length > 1) {
    const totalDist = config.selectedOperations.reduce(
      (sum, op) => sum + (config.distribution[op] || 0),
      0
    );
    if (Math.abs(totalDist - 100) > 1) {
      errors.push('مجموع درصد توزیع سوالات باید دقیقاً ۱۰۰٪ باشد.');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Automatically balances distribution percentages equally among selected operations.
 */
export function balanceDistribution(
  selectedOps: OperationType[],
  currentDist?: Record<OperationType, number>
): Record<OperationType, number> {
  const newDist: Record<OperationType, number> = {
    addition: 0,
    subtraction: 0,
    multiplication: 0,
    division: 0,
    mixed: 0,
  };

  if (!selectedOps || selectedOps.length === 0) return newDist;

  const equalShare = Math.floor(100 / selectedOps.length);
  let remainder = 100 - equalShare * selectedOps.length;

  selectedOps.forEach((op, index) => {
    newDist[op] = equalShare + (index < remainder ? 1 : 0);
  });

  return newDist;
}

/**
 * Generates a single question for a given operation according to its specific settings.
 */
export function generateSingleQuestion(
  op: OperationType,
  settings: OperationSettings
): QuizQuestion {
  const id = `q_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  if (op === 'addition') {
    const s = settings.addition;
    const num1 = generateNumberWithDigits(s.operand1Digits);
    const num2 = generateNumberWithDigits(s.operand2Digits);
    return {
      id,
      num1,
      num2,
      operation: 'addition',
      correctAnswer: num1 + num2,
    };
  }

  if (op === 'subtraction') {
    const s = settings.subtraction;
    let num1 = generateNumberWithDigits(s.operand1Digits);
    let num2 = generateNumberWithDigits(s.operand2Digits);

    if (!s.allowNegative && num1 < num2) {
      // For children: swap so the minuend is greater than or equal to subtrahend
      [num1, num2] = [num2, num1];
    }

    return {
      id,
      num1,
      num2,
      operation: 'subtraction',
      correctAnswer: num1 - num2,
    };
  }

  if (op === 'multiplication') {
    const s = settings.multiplication;
    if (s.mode === 'table') {
      const table = s.tableNumber || 9;
      // Multiplier from 1 to 10 (or occasionally 12)
      const multiplier = Math.floor(Math.random() * 10) + 1;
      return {
        id,
        num1: table,
        num2: multiplier,
        operation: 'multiplication',
        correctAnswer: table * multiplier,
      };
    } else {
      const num1 = generateNumberWithDigits(s.operand1Digits);
      const num2 = generateNumberWithDigits(s.operand2Digits);
      return {
        id,
        num1,
        num2,
        operation: 'multiplication',
        correctAnswer: num1 * num2,
      };
    }
  }

  if (op === 'division') {
    const s = settings.division;
    if (s.mode === 'table') {
      // Table-based division: inverse of multiplication table!
      // Example for table 9: (9 * factor) ÷ 9 = factor
      const table = s.tableNumber || 9;
      const factor = Math.floor(Math.random() * 10) + 1; // 1 to 10
      const dividend = table * factor;
      return {
        id,
        num1: dividend,
        num2: table,
        operation: 'division',
        correctAnswer: factor,
      };
    } else {
      // Free / Custom Division
      const divisorDigits = Math.max(1, s.divisorDigits);
      const divisor = generateNumberWithDigits(divisorDigits, 2); // Avoid divide by 0 and 1

      if (!s.allowRemainder) {
        // Clean integer division: pick quotient, calculate dividend = divisor * quotient
        const quotientDigits = Math.max(1, s.dividendDigits - divisorDigits + 1);
        const quotient = generateNumberWithDigits(quotientDigits, 1);
        const dividend = divisor * quotient;
        return {
          id,
          num1: dividend,
          num2: divisor,
          operation: 'division',
          correctAnswer: quotient,
        };
      } else {
        // Allow remainder: calculate integer quotient
        const dividend = generateNumberWithDigits(s.dividendDigits, divisor + 1);
        const quotient = Math.floor(dividend / divisor);
        return {
          id,
          num1: dividend,
          num2: divisor,
          operation: 'division',
          correctAnswer: quotient,
        };
      }
    }
  }

  // Fallback default
  return {
    id,
    num1: 5,
    num2: 5,
    operation: 'addition',
    correctAnswer: 10,
  };
}

/**
 * Generates an array of questions based on full configuration with distribution,
 * duplicate filtering, and safe termination limits.
 */
export function generateQuestionsForConfig(config: QuizConfiguration): QuizQuestion[] {
  const { questionCount, selectedOperations, operationSettings, distribution } = config;
  const targetOps: OperationType[] = selectedOperations.length > 0 ? selectedOperations : ['addition'];

  // Calculate target count for each operation
  const opCounts: Record<OperationType, number> = {
    addition: 0,
    subtraction: 0,
    multiplication: 0,
    division: 0,
    mixed: 0,
  };

  if (targetOps.length === 1) {
    opCounts[targetOps[0]] = questionCount;
  } else {
    let allocated = 0;
    targetOps.forEach((op, index) => {
      if (index === targetOps.length - 1) {
        opCounts[op] = Math.max(1, questionCount - allocated);
      } else {
        const percent = distribution[op] || (100 / targetOps.length);
        const count = Math.max(1, Math.round((questionCount * percent) / 100));
        opCounts[op] = count;
        allocated += count;
      }
    });

    // Adjust any small rounding drift
    const totalAllocated = targetOps.reduce((sum, op) => sum + opCounts[op], 0);
    if (totalAllocated !== questionCount) {
      const diff = questionCount - totalAllocated;
      opCounts[targetOps[0]] = Math.max(1, opCounts[targetOps[0]] + diff);
    }
  }

  const generatedQuestions: QuizQuestion[] = [];
  const signatures = new Set<string>();

  targetOps.forEach((op) => {
    const required = opCounts[op] || 0;
    let added = 0;
    let attempts = 0;
    const maxAttempts = required * 15; // Prevent infinite loop

    while (added < required && attempts < maxAttempts) {
      attempts++;
      const q = generateSingleQuestion(op, operationSettings);
      const sig = `${q.operation}:${q.num1}:${q.num2}`;

      // Avoid duplicates when possible; if pool is exhausted, allow
      if (!signatures.has(sig) || attempts > required * 5) {
        signatures.add(sig);
        generatedQuestions.push(q);
        added++;
      }
    }
  });

  // Shuffle questions so multi-operation quizzes have mixed sequence
  if (targetOps.length > 1) {
    for (let i = generatedQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [generatedQuestions[i], generatedQuestions[j]] = [generatedQuestions[j], generatedQuestions[i]];
    }
  }

  return generatedQuestions;
}

/**
 * Creates a brand-new QuizSession from a validated QuizConfiguration.
 */
export function createQuizSession(config: QuizConfiguration): QuizSession {
  const questions = generateQuestionsForConfig(config);
  const startedAt = Date.now();
  return {
    id: `session_${startedAt}_${Math.random().toString(36).substring(2, 8)}`,
    config,
    mode: config.mode,
    totalQuestions: questions.length,
    currentIndex: 0,
    questions,
    currentQuestion: questions[0],
    answers: {},
    attempts: {},
    correctAnswers: 0,
    incorrectAnswers: 0,
    responseTimes: {},
    questionResponses: {},
    startedAt,
    startTime: startedAt,
    isCompleted: false,
    xpEarned: 0,
  };
}

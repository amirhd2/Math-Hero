/**
 * Question Selector for Math Hero Smart Review.
 * Generates targeted, varied questions based on adaptive skill priorities,
 * prevents duplicate questions within a session, and creates variations of past mistakes.
 */

import { QuizQuestion, OperationType, OperationSettings } from '../types';
import {
  SkillId,
  SkillPerformanceRecord,
  SmartReviewConfiguration,
} from './smartReviewTypes';
import { getSkillDefinition } from './skillModel';
import { generateNumberWithDigits } from '../utils/questionGenerator';

/**
 * Validates generated question according to Math Hero domain constraints.
 */
export function validateSmartQuestion(q: QuizQuestion): boolean {
  if (!q.id || !q.operation) return false;
  if (typeof q.num1 !== 'number' || isNaN(q.num1)) return false;
  if (typeof q.num2 !== 'number' || isNaN(q.num2)) return false;
  if (typeof q.correctAnswer !== 'number' || isNaN(q.correctAnswer)) return false;

  // Basic math verification
  if (q.operation === 'addition') {
    if (q.num1 + q.num2 !== q.correctAnswer) return false;
    if (q.num1 < 0 || q.num2 < 0) return false;
  } else if (q.operation === 'subtraction') {
    if (q.num1 - q.num2 !== q.correctAnswer) return false;
    if (q.correctAnswer < 0) return false; // Non-negative for elementary school
  } else if (q.operation === 'multiplication') {
    if (q.num1 * q.num2 !== q.correctAnswer) return false;
    if (q.num1 <= 0 || q.num2 <= 0) return false;
  } else if (q.operation === 'division') {
    if (q.num2 <= 0) return false; // No division by zero
    if (!q.remainder && q.num1 % q.num2 !== 0) return false;
    if (Math.floor(q.num1 / q.num2) !== q.correctAnswer) return false;
  }

  return true;
}

/**
 * Generates a varied question targeting a specific skill.
 * If sample mistakes exist, produces close variations (commutative, neighbor, or similar complexity).
 */
export function generateQuestionForSkill(
  skillId: SkillId,
  sampleMistakes: QuizQuestion[] = [],
  settings: OperationSettings,
  existingSignatures: Set<string>
): QuizQuestion | null {
  const skill = getSkillDefinition(skillId);
  const id = `sr_q_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // 1. If sample mistakes exist for this skill, attempt to generate smart variation
  if (sampleMistakes.length > 0 && Math.random() < 0.6) {
    const mistake = sampleMistakes[Math.floor(Math.random() * sampleMistakes.length)];
    const variation = createMistakeVariation(mistake, existingSignatures);
    if (variation && validateSmartQuestion(variation)) {
      return variation;
    }
  }

  // 2. Generate a targeted question matching the specific skill bucket
  const maxAttempts = 15;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    let q: QuizQuestion | null = null;

    switch (skillId) {
      // --- Addition ---
      case 'add_single': {
        const num1 = Math.floor(Math.random() * 9) + 1;
        const num2 = Math.floor(Math.random() * 9) + 1;
        q = { id, num1, num2, operation: 'addition', correctAnswer: num1 + num2 };
        break;
      }
      case 'add_double_single': {
        const num1 = Math.floor(Math.random() * 90) + 10;
        const num2 = Math.floor(Math.random() * 9) + 1;
        q = { id, num1, num2, operation: 'addition', correctAnswer: num1 + num2 };
        break;
      }
      case 'add_double_double': {
        const num1 = Math.floor(Math.random() * 90) + 10;
        const num2 = Math.floor(Math.random() * 90) + 10;
        q = { id, num1, num2, operation: 'addition', correctAnswer: num1 + num2 };
        break;
      }
      case 'add_multi_digit': {
        const num1 = generateNumberWithDigits(3);
        const num2 = generateNumberWithDigits(2);
        q = { id, num1, num2, operation: 'addition', correctAnswer: num1 + num2 };
        break;
      }

      // --- Subtraction ---
      case 'sub_single': {
        const a = Math.floor(Math.random() * 9) + 1;
        const b = Math.floor(Math.random() * 9) + 1;
        const num1 = Math.max(a, b);
        const num2 = Math.min(a, b);
        q = { id, num1, num2, operation: 'subtraction', correctAnswer: num1 - num2 };
        break;
      }
      case 'sub_double_single': {
        const num1 = Math.floor(Math.random() * 90) + 10;
        const num2 = Math.floor(Math.random() * 9) + 1;
        q = { id, num1, num2, operation: 'subtraction', correctAnswer: num1 - num2 };
        break;
      }
      case 'sub_double_double': {
        const a = Math.floor(Math.random() * 90) + 10;
        const b = Math.floor(Math.random() * 90) + 10;
        const num1 = Math.max(a, b);
        const num2 = Math.min(a, b);
        q = { id, num1, num2, operation: 'subtraction', correctAnswer: num1 - num2 };
        break;
      }
      case 'sub_multi_digit': {
        const a = generateNumberWithDigits(3);
        const b = generateNumberWithDigits(2);
        const num1 = Math.max(a, b);
        const num2 = Math.min(a, b);
        q = { id, num1, num2, operation: 'subtraction', correctAnswer: num1 - num2 };
        break;
      }

      // --- Multiplication ---
      case 'mul_table_low': {
        const tables = [2, 3, 4, 5];
        const table = tables[Math.floor(Math.random() * tables.length)];
        const factor = Math.floor(Math.random() * 10) + 1;
        q = { id, num1: table, num2: factor, operation: 'multiplication', correctAnswer: table * factor };
        break;
      }
      case 'mul_table_mid': {
        const tables = [6, 7];
        const table = tables[Math.floor(Math.random() * tables.length)];
        const factor = Math.floor(Math.random() * 10) + 1;
        q = { id, num1: table, num2: factor, operation: 'multiplication', correctAnswer: table * factor };
        break;
      }
      case 'mul_table_high': {
        // High-challenge pairs (7x8, 8x9, 6x8, 8x8, 9x9, etc.)
        const highPairs = [
          [7, 8], [8, 7], [8, 9], [9, 8], [6, 8], [8, 6],
          [7, 9], [9, 7], [8, 8], [9, 9], [6, 9], [9, 6],
        ];
        const pair = highPairs[Math.floor(Math.random() * highPairs.length)];
        q = { id, num1: pair[0], num2: pair[1], operation: 'multiplication', correctAnswer: pair[0] * pair[1] };
        break;
      }
      case 'mul_table_10_12': {
        const tables = [10, 11, 12];
        const table = tables[Math.floor(Math.random() * tables.length)];
        const factor = Math.floor(Math.random() * 10) + 1;
        q = { id, num1: table, num2: factor, operation: 'multiplication', correctAnswer: table * factor };
        break;
      }
      case 'mul_multi_digit': {
        const num1 = Math.floor(Math.random() * 20) + 11;
        const num2 = Math.floor(Math.random() * 9) + 2;
        q = { id, num1, num2, operation: 'multiplication', correctAnswer: num1 * num2 };
        break;
      }

      // --- Division ---
      case 'div_exact_low': {
        const divisors = [2, 3, 4, 5];
        const divisor = divisors[Math.floor(Math.random() * divisors.length)];
        const quotient = Math.floor(Math.random() * 10) + 1;
        const dividend = divisor * quotient;
        q = { id, num1: dividend, num2: divisor, operation: 'division', correctAnswer: quotient };
        break;
      }
      case 'div_exact_high': {
        const divisors = [6, 7, 8, 9];
        const divisor = divisors[Math.floor(Math.random() * divisors.length)];
        const quotient = Math.floor(Math.random() * 10) + 1;
        const dividend = divisor * quotient;
        q = { id, num1: dividend, num2: divisor, operation: 'division', correctAnswer: quotient };
        break;
      }
      case 'div_table_10_12': {
        const divisors = [10, 11, 12];
        const divisor = divisors[Math.floor(Math.random() * divisors.length)];
        const quotient = Math.floor(Math.random() * 10) + 1;
        const dividend = divisor * quotient;
        q = { id, num1: dividend, num2: divisor, operation: 'division', correctAnswer: quotient };
        break;
      }
      case 'div_with_remainder': {
        const divisor = Math.floor(Math.random() * 8) + 2;
        const quotient = Math.floor(Math.random() * 9) + 1;
        const rem = Math.floor(Math.random() * (divisor - 1)) + 1;
        const dividend = divisor * quotient + rem;
        q = { id, num1: dividend, num2: divisor, operation: 'division', correctAnswer: quotient, remainder: rem };
        break;
      }
    }

    if (q && validateSmartQuestion(q)) {
      const sig = `${q.operation}:${q.num1}:${q.num2}`;
      if (!existingSignatures.has(sig)) {
        return q;
      }
    }
  }

  return null;
}

/**
 * Creates related mathematical variations of a past mistake.
 * E.g. for 7 × 8: generates 8 × 7, 7 × 9, or 6 × 8.
 */
export function createMistakeVariation(
  m: QuizQuestion,
  existingSignatures: Set<string>
): QuizQuestion | null {
  const { operation, num1, num2 } = m;
  const id = `sr_var_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const candidates: QuizQuestion[] = [];

  if (operation === 'multiplication') {
    // 1. Commutative variation: 8 × 7
    candidates.push({ id, num1: num2, num2: num1, operation, correctAnswer: num1 * num2 });
    // 2. Neighboring multiplier: 7 × (num2 ± 1)
    if (num2 < 10) {
      candidates.push({ id, num1, num2: num2 + 1, operation, correctAnswer: num1 * (num2 + 1) });
    }
    if (num2 > 2) {
      candidates.push({ id, num1, num2: num2 - 1, operation, correctAnswer: num1 * (num2 - 1) });
    }
    // 3. Neighboring table: (num1 ± 1) × num2
    if (num1 > 2) {
      candidates.push({ id, num1: num1 - 1, num2, operation, correctAnswer: (num1 - 1) * num2 });
    }
  } else if (operation === 'addition') {
    // 1. Commutative: num2 + num1
    candidates.push({ id, num1: num2, num2: num1, operation, correctAnswer: num1 + num2 });
    // 2. Step variation: num1 + (num2 ± 1)
    if (num2 > 1) {
      candidates.push({ id, num1, num2: num2 - 1, operation, correctAnswer: num1 + num2 - 1 });
    }
    candidates.push({ id, num1, num2: num2 + 1, operation, correctAnswer: num1 + num2 + 1 });
  } else if (operation === 'subtraction') {
    // Step variation in minuend or subtrahend
    if (num1 > num2 + 1) {
      candidates.push({ id, num1: num1 - 1, num2, operation, correctAnswer: num1 - 1 - num2 });
    }
    candidates.push({ id, num1: num1 + 1, num2, operation, correctAnswer: num1 + 1 - num2 });
  } else if (operation === 'division') {
    // Neighbor quotient or divisor
    const currentQuotient = Math.floor(num1 / num2);
    const nextQuotient = currentQuotient + 1;
    candidates.push({ id, num1: num2 * nextQuotient, num2, operation, correctAnswer: nextQuotient });
    if (currentQuotient > 2) {
      const prevQuotient = currentQuotient - 1;
      candidates.push({ id, num1: num2 * prevQuotient, num2, operation, correctAnswer: prevQuotient });
    }
  }

  // Filter for unused candidates
  for (const candidate of candidates) {
    const sig = `${candidate.operation}:${candidate.num1}:${candidate.num2}`;
    if (!existingSignatures.has(sig) && validateSmartQuestion(candidate)) {
      return candidate;
    }
  }

  return null;
}

/**
 * Generates the complete array of Smart Review questions (default 10)
 * ensuring duplicate control, operation weighting, and difficulty adaptation.
 */
export function generateSmartReviewQuestions(
  config: SmartReviewConfiguration,
  targetSkills: SkillPerformanceRecord[],
  settings: OperationSettings
): QuizQuestion[] {
  const { questionCount, operationWeights } = config;
  const questions: QuizQuestion[] = [];
  const existingSignatures = new Set<string>();

  // Determine question count per operation according to calculated weights
  const coreOps: OperationType[] = ['addition', 'subtraction', 'multiplication', 'division'];
  const opQuotas: Record<OperationType, number> = {
    addition: 0,
    subtraction: 0,
    multiplication: 0,
    division: 0,
    mixed: 0,
  };

  let allocated = 0;
  coreOps.forEach((op, index) => {
    if (index === coreOps.length - 1) {
      opQuotas[op] = Math.max(1, questionCount - allocated);
    } else {
      const weight = operationWeights[op] || 25;
      const count = Math.max(1, Math.round((questionCount * weight) / 100));
      opQuotas[op] = count;
      allocated += count;
    }
  });

  // Rebalance if total doesn't match questionCount
  const totalAllocated = coreOps.reduce((s, op) => s + opQuotas[op], 0);
  if (totalAllocated !== questionCount) {
    const diff = questionCount - totalAllocated;
    opQuotas[coreOps[0]] = Math.max(1, opQuotas[coreOps[0]] + diff);
  }

  // Group target skills by operation
  const skillsByOp: Record<OperationType, SkillPerformanceRecord[]> = {
    addition: [],
    subtraction: [],
    multiplication: [],
    division: [],
    mixed: [],
  };

  targetSkills.forEach((skill) => {
    skillsByOp[skill.operation].push(skill);
  });

  // Generate questions for each operation
  coreOps.forEach((op) => {
    const needed = opQuotas[op];
    const opSkills = skillsByOp[op];
    let count = 0;

    // First attempt: generate from prioritized skills for this op
    if (opSkills.length > 0) {
      for (const skill of opSkills) {
        if (count >= needed) break;
        const q = generateQuestionForSkill(skill.skillId, skill.sampleMistakes, settings, existingSignatures);
        if (q) {
          const sig = `${q.operation}:${q.num1}:${q.num2}`;
          existingSignatures.add(sig);
          questions.push(q);
          count++;
        }
      }
    }

    // Fill any remainder for this operation with matching default skills
    let safetyAttempts = 0;
    while (count < needed && safetyAttempts < 20) {
      safetyAttempts++;
      const defaultSkillId: SkillId =
        op === 'addition'
          ? 'add_single'
          : op === 'subtraction'
          ? 'sub_single'
          : op === 'multiplication'
          ? 'mul_table_low'
          : 'div_exact_low';

      const q = generateQuestionForSkill(defaultSkillId, [], settings, existingSignatures);
      if (q) {
        const sig = `${q.operation}:${q.num1}:${q.num2}`;
        existingSignatures.add(sig);
        questions.push(q);
        count++;
      }
    }
  });

  // Shuffle sequence so questions aren't strictly blocked by operation
  for (let i = questions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [questions[i], questions[j]] = [questions[j], questions[i]];
  }

  return questions.slice(0, questionCount);
}

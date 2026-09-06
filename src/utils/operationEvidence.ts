/**
 * Centralized Operation Evidence Extractor & Normalizer for Math Hero.
 * Provides the single source of truth for extracting question-level performance evidence
 * across addition, subtraction, multiplication, and division for both single and combined quizzes.
 */

import {
  OperationType,
  QuizResult,
  QuizSession,
  QuizOperationStat,
  MistakeRecord,
  QuizQuestion,
} from '../types';

export const PRIMARY_OPERATIONS: OperationType[] = [
  'addition',
  'subtraction',
  'multiplication',
  'division',
];

/**
 * Creates empty statistics for all primary operations.
 */
export function createEmptyOperationBreakdown(): Record<OperationType, QuizOperationStat> {
  return {
    addition: {
      operation: 'addition',
      totalQuestions: 0,
      correctCount: 0,
      incorrectCount: 0,
      timeSpentMs: 0,
      accuracy: 0,
    },
    subtraction: {
      operation: 'subtraction',
      totalQuestions: 0,
      correctCount: 0,
      incorrectCount: 0,
      timeSpentMs: 0,
      accuracy: 0,
    },
    multiplication: {
      operation: 'multiplication',
      totalQuestions: 0,
      correctCount: 0,
      incorrectCount: 0,
      timeSpentMs: 0,
      accuracy: 0,
    },
    division: {
      operation: 'division',
      totalQuestions: 0,
      correctCount: 0,
      incorrectCount: 0,
      timeSpentMs: 0,
      accuracy: 0,
    },
    mixed: {
      operation: 'mixed',
      totalQuestions: 0,
      correctCount: 0,
      incorrectCount: 0,
      timeSpentMs: 0,
      accuracy: 0,
    },
  };
}

/**
 * Extracts high-precision operational breakdown from an active QuizSession.
 */
export function extractQuestionEvidenceFromSession(
  session: QuizSession,
  _mistakes: MistakeRecord[] = []
): Partial<Record<OperationType, QuizOperationStat>> {
  const breakdown: Partial<Record<OperationType, QuizOperationStat>> = {};

  session.questions.forEach((q: QuizQuestion, idx: number) => {
    const op = q.operation || 'addition';
    const resp = session.questionResponses?.[idx];
    const isCorrect = resp
      ? resp.isCorrect
      : session.answers?.[idx] !== undefined &&
        Number(session.answers[idx]) === q.correctAnswer;
    const timeSpentMs = resp
      ? resp.timeSpentMs
      : session.responseTimes?.[idx] || 0;

    if (!breakdown[op]) {
      breakdown[op] = {
        operation: op,
        totalQuestions: 0,
        correctCount: 0,
        incorrectCount: 0,
        timeSpentMs: 0,
        accuracy: 0,
      };
    }

    const stat = breakdown[op]!;
    stat.totalQuestions += 1;
    if (isCorrect) {
      stat.correctCount += 1;
    } else {
      stat.incorrectCount += 1;
    }
    stat.timeSpentMs = (stat.timeSpentMs || 0) + timeSpentMs;
  });

  // Calculate percentage accuracies
  Object.values(breakdown).forEach((stat) => {
    if (stat && stat.totalQuestions > 0) {
      stat.accuracy = Math.round((stat.correctCount / stat.totalQuestions) * 100);
    }
  });

  return breakdown;
}

/**
 * Extracts normalized operational breakdown from any QuizResult (legacy or modern).
 * Guaranteed to return entries for all 4 primary operations.
 */
export function extractOperationBreakdownFromQuizResult(
  result: QuizResult,
  session?: QuizSession
): Record<OperationType, QuizOperationStat> {
  const fullBreakdown = createEmptyOperationBreakdown();

  // Case 1: result already contains direct operationBreakdown
  if (result.operationBreakdown && Object.keys(result.operationBreakdown).length > 0) {
    Object.entries(result.operationBreakdown).forEach(([opKey, stat]) => {
      if (stat && fullBreakdown[opKey as OperationType]) {
        fullBreakdown[opKey as OperationType] = { ...stat };
      }
    });
    return fullBreakdown;
  }

  // Case 2: Session or Result contains individual questions and responses
  const questions = session?.questions || result.questions;
  const questionResponses = session?.questionResponses || result.questionResponses;
  const answers = session?.answers;

  if (questions && questions.length > 0) {
    questions.forEach((q, idx) => {
      const op = q.operation || 'addition';
      if (!fullBreakdown[op]) return;

      const resp = questionResponses?.[idx];
      let isCorrect = false;
      if (resp !== undefined) {
        isCorrect = resp.isCorrect;
      } else if (answers?.[idx] !== undefined) {
        isCorrect = Number(answers[idx]) === q.correctAnswer;
      } else {
        // Check if there is a mistake record matching this question id
        const matchingMistake = (result.mistakes || []).some(
          (m) => m.question?.id === q.id || (m.question?.num1 === q.num1 && m.question?.num2 === q.num2 && m.question?.operation === q.operation)
        );
        isCorrect = !matchingMistake;
      }

      const timeSpentMs = resp ? resp.timeSpentMs : (session?.responseTimes?.[idx] || 0);

      fullBreakdown[op].totalQuestions += 1;
      if (isCorrect) {
        fullBreakdown[op].correctCount += 1;
      } else {
        fullBreakdown[op].incorrectCount += 1;
      }
      fullBreakdown[op].timeSpentMs = (fullBreakdown[op].timeSpentMs || 0) + timeSpentMs;
    });

    PRIMARY_OPERATIONS.forEach((op) => {
      const stat = fullBreakdown[op];
      if (stat.totalQuestions > 0) {
        stat.accuracy = Math.round((stat.correctCount / stat.totalQuestions) * 100);
      }
    });

    return fullBreakdown;
  }

  // Case 3: Result is single operation (e.g. addition, subtraction, multiplication, division)
  if (result.operation && result.operation !== 'mixed') {
    const op = result.operation;
    if (fullBreakdown[op]) {
      const total = result.totalQuestions || 0;
      const correct = result.correctCount || 0;
      const incorrect = result.incorrectCount || Math.max(0, total - correct);
      fullBreakdown[op] = {
        operation: op,
        totalQuestions: total,
        correctCount: correct,
        incorrectCount: incorrect,
        timeSpentMs: (result.timeElapsed || 0) * 1000,
        accuracy: total > 0 ? Math.round((correct / total) * 100) : (result.score || 0),
      };
    }
    return fullBreakdown;
  }

  // Case 4: Legacy mixed result without question list
  const selectedOps: OperationType[] =
    result.config?.selectedOperations?.length
      ? result.config.selectedOperations
      : PRIMARY_OPERATIONS;

  const validSelectedOps = selectedOps.filter((op) => PRIMARY_OPERATIONS.includes(op));
  const activeOps = validSelectedOps.length > 0 ? validSelectedOps : PRIMARY_OPERATIONS;

  const totalQuestions = result.totalQuestions || 0;
  const totalCorrect = result.correctCount || 0;
  const mistakes = result.mistakes || [];

  // Count mistakes per operation if known
  const mistakesByOp: Record<OperationType, number> = {
    addition: 0,
    subtraction: 0,
    multiplication: 0,
    division: 0,
    mixed: 0,
  };
  mistakes.forEach((m) => {
    const mOp = m.question?.operation;
    if (mOp && mistakesByOp[mOp] !== undefined) {
      mistakesByOp[mOp] += 1;
    }
  });

  const dist = result.config?.distribution;
  let allocatedQuestions = 0;
  const opQuestionCounts: Record<OperationType, number> = {
    addition: 0,
    subtraction: 0,
    multiplication: 0,
    division: 0,
    mixed: 0,
  };

  activeOps.forEach((op, index) => {
    if (index === activeOps.length - 1) {
      opQuestionCounts[op] = Math.max(1, totalQuestions - allocatedQuestions);
    } else {
      const percent = dist?.[op] || (100 / activeOps.length);
      const count = Math.max(1, Math.round((totalQuestions * percent) / 100));
      opQuestionCounts[op] = count;
      allocatedQuestions += count;
    }
  });

  activeOps.forEach((op) => {
    const qCount = opQuestionCounts[op] || 0;
    const mCount = mistakesByOp[op] || 0;
    let cCount = Math.max(0, qCount - mCount);
    // Safety check against total correct
    if (totalQuestions > 0 && mistakes.length === 0) {
      cCount = Math.round((qCount * totalCorrect) / totalQuestions);
    }

    fullBreakdown[op] = {
      operation: op,
      totalQuestions: qCount,
      correctCount: cCount,
      incorrectCount: Math.max(0, qCount - cCount),
      timeSpentMs: totalQuestions > 0 ? Math.round(((result.timeElapsed || 0) * 1000 * qCount) / totalQuestions) : 0,
      accuracy: qCount > 0 ? Math.round((cCount / qCount) * 100) : 0,
    };
  });

  return fullBreakdown;
}

/**
 * Review session generator for "Practice Mistakes" and "Try Again" actions.
 * Creates brand new QuizSession instances without reusing stale session state.
 */

import {
  QuizConfiguration,
  QuizQuestion,
  QuizSession,
  MistakeRecord,
  OperationType,
} from '../types';
import {
  createQuizSession,
  DEFAULT_OPERATION_SETTINGS,
  generateQuestionsForConfig,
} from '../utils/questionGenerator';

/**
 * Creates a dedicated Practice session targeting specific mistakes made in a previous quiz.
 */
export function createPracticeMistakesSession(
  mistakes: MistakeRecord[],
  baseConfig?: QuizConfiguration
): QuizSession {
  if (!mistakes || mistakes.length === 0) {
    // Fallback to default practice config
    const fallbackConfig: QuizConfiguration = baseConfig
      ? { ...baseConfig, mode: 'practice' }
      : {
          mode: 'practice',
          questionCount: 5,
          selectedOperations: ['addition'],
          operationSettings: DEFAULT_OPERATION_SETTINGS,
          distribution: { addition: 100, subtraction: 0, multiplication: 0, division: 0, mixed: 0 },
          smartReviewEnabled: true,
        };
    return createQuizSession(fallbackConfig);
  }

  // Build direct clean questions from the mistakes
  const questions: QuizQuestion[] = mistakes.map((m, idx) => ({
    id: `review_q_${Date.now()}_${idx}_${m.question.id}`,
    operation: m.question.operation,
    num1: m.question.num1,
    num2: m.question.num2,
    correctAnswer: m.question.correctAnswer,
    operatorSymbol: m.question.operatorSymbol,
    remainder: m.question.remainder,
    options: m.question.options,
  }));

  // Determine operations in this mistakes review
  const distinctOps = Array.from(new Set(questions.map((q) => q.operation))) as OperationType[];

  const config: QuizConfiguration = {
    id: 'mistakes_review',
    mode: 'practice',
    questionCount: questions.length,
    selectedOperations: distinctOps,
    operationSettings: baseConfig?.operationSettings || DEFAULT_OPERATION_SETTINGS,
    distribution: baseConfig?.distribution || {
      addition: 25,
      subtraction: 25,
      multiplication: 25,
      division: 25,
      mixed: 0,
    },
    smartReviewEnabled: true,
  };

  const startedAt = Date.now();
  return {
    id: `session_review_${startedAt}_${Math.random().toString(36).substring(2, 7)}`,
    config,
    mode: 'practice',
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

/**
 * Creates a fresh QuizSession from the same configuration with randomized fresh questions.
 */
export function createRetryQuizSession(config: QuizConfiguration): QuizSession {
  // Regenerate clean questions from config
  const questions = generateQuestionsForConfig(config);
  const startedAt = Date.now();

  return {
    id: `session_retry_${startedAt}_${Math.random().toString(36).substring(2, 7)}`,
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

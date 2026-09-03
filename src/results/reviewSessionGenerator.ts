/**
 * Review session generator for "Practice Mistakes" and "Try Again" actions.
 * Creates brand new QuizSession instances without reusing stale session state.
 */

import {
  QuizConfiguration,
  QuizSession,
  MistakeRecord,
} from '../types';
import {
  createQuizSession,
  DEFAULT_OPERATION_SETTINGS,
  generateQuestionsForConfig,
} from '../utils/questionGenerator';
import { createTargetedPracticeMistakesSession } from '../smartReview/smartReviewEngine';

/**
 * Creates a dedicated Practice session targeting specific mistakes made in a previous quiz,
 * augmented with smart mathematical variations.
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

  return createTargetedPracticeMistakesSession(mistakes, baseConfig);
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

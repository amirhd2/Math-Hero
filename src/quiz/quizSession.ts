/**
 * Pure functions for QuizSession state updates, progression, and result calculation.
 */

import { QuizSession, QuizQuestionResponse, QuizResult, MistakeRecord } from '../types';

/**
 * Records a validated response into the current session state immutably.
 */
export function recordResponseInSession(
  session: QuizSession,
  questionIndex: number,
  response: QuizQuestionResponse
): QuizSession {
  const currentAttempts = (session.attempts[questionIndex] || 0) + response.attemptsCount;
  const updatedAnswers = {
    ...session.answers,
    [questionIndex]: response.userAnswer,
  };
  const updatedAttempts = {
    ...session.attempts,
    [questionIndex]: currentAttempts,
  };
  const updatedResponseTimes = {
    ...session.responseTimes,
    [questionIndex]: response.timeSpentMs,
  };
  const updatedQuestionResponses = {
    ...session.questionResponses,
    [questionIndex]: response,
  };

  const newCorrectCount = session.correctAnswers + (response.isCorrect ? 1 : 0);
  const newIncorrectCount = session.incorrectAnswers + (response.isCorrect ? 0 : 1);

  return {
    ...session,
    answers: updatedAnswers,
    attempts: updatedAttempts,
    responseTimes: updatedResponseTimes,
    questionResponses: updatedQuestionResponses,
    correctAnswers: newCorrectCount,
    incorrectAnswers: newIncorrectCount,
  };
}

/**
 * Advances the session to the next question index, or marks it completed.
 * CRITICAL RULE: Advances permanently. No previous-question navigation.
 */
export function advanceSessionToNext(session: QuizSession): QuizSession {
  const nextIndex = session.currentIndex + 1;
  const isCompleted = nextIndex >= session.questions.length;
  const completedAt = isCompleted ? Date.now() : undefined;

  let finalXp = session.xpEarned;
  if (isCompleted) {
    const { xp } = calculateScoreAndXP(session);
    finalXp = xp;
  }

  return {
    ...session,
    currentIndex: nextIndex,
    currentQuestion: session.questions[nextIndex] || session.questions[session.questions.length - 1],
    isCompleted,
    completedAt,
    endTime: completedAt,
    xpEarned: finalXp,
  };
}

/**
 * Calculates score percentage (0-100) and gamified XP.
 */
export function calculateScoreAndXP(session: QuizSession): { score: number; xp: number } {
  const total = Math.max(1, session.questions.length);
  const correct = session.correctAnswers;
  const score = Math.round((correct / total) * 100);

  // Base 15 XP per correct answer
  let xp = correct * 15;

  // Test mode challenge bonus (20% higher XP for strict mode)
  if (session.mode === 'test') {
    xp = Math.round(xp * 1.2);
  }

  // Bonus for perfect score
  if (score === 100) {
    xp += 50;
  } else if (score >= 80) {
    xp += 25;
  }

  return { score, xp: Math.max(5, xp) };
}

/**
 * Transforms completed session into final QuizResult for persistence and review.
 */
export function buildFinalQuizResult(
  session: QuizSession,
  mistakes: MistakeRecord[] = []
): QuizResult {
  const { score, xp } = calculateScoreAndXP(session);
  const totalTimeSeconds = Math.max(
    1,
    Math.round(((session.completedAt || Date.now()) - session.startedAt) / 1000)
  );

  const mainOperation =
    session.config.selectedOperations.length === 1
      ? session.config.selectedOperations[0]
      : 'mixed';

  return {
    id: `result_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
    mode: session.mode,
    operation: mainOperation,
    totalQuestions: session.questions.length,
    correctCount: session.correctAnswers,
    incorrectCount: session.incorrectAnswers,
    score,
    xpEarned: xp,
    timeElapsed: totalTimeSeconds,
    presetId: session.config.id || 'custom',
    config: session.config,
    mistakes,
    source: session.source || (session.config.id === 'smart-review' ? 'smart-review' : 'normal'),
    smartReviewMetadata: session.smartReviewMetadata
      ? {
          ...session.smartReviewMetadata,
          postReviewAccuracy: score,
          accuracyDelta:
            session.smartReviewMetadata.preReviewAccuracy !== undefined
              ? score - session.smartReviewMetadata.preReviewAccuracy
              : undefined,
        }
      : undefined,
  };
}

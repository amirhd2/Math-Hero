/**
 * Strongly-typed definitions for the Quiz Engine runtime.
 */

import {
  QuizConfiguration,
  QuizSession,
  QuizQuestion,
  QuizResult,
  MistakeRecord,
  QuizMode,
  OperationType,
  UserProfile,
  CharacterPose,
} from '../types';

export type {
  QuizConfiguration,
  QuizSession,
  QuizQuestion,
  QuizResult,
  MistakeRecord,
  QuizMode,
  OperationType,
  UserProfile,
  CharacterPose,
};

export interface AnswerValidationResult {
  isCorrect: boolean;
  parsedAnswer: number;
  expectedAnswer: number;
  attemptNumber: number;
  isExhausted: boolean;
  canRetry: boolean;
  revealedAnswer?: number;
  message?: string;
}

export type QuizFeedbackStatus = 'idle' | 'correct' | 'incorrect' | 'revealed';

export interface QuizEngineState {
  session: QuizSession;
  currentQuestion: QuizQuestion;
  questionIndex: number;
  questionNumber: number;
  totalQuestions: number;
  attemptsForCurrent: number;
  maxAttempts: number;
  feedbackStatus: QuizFeedbackStatus;
  feedbackMessage: string | null;
  revealedAnswer: number | null;
  isSubmitting: boolean;
  isAdvancing: boolean;
  isComplete: boolean;
  currentStreak: number;
  characterPose: CharacterPose;
}

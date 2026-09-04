/**
 * QuizQuestionBuffer - Rolling Card Preloader and Queue abstraction.
 * 
 * Responsibilities:
 * - Maintains a rolling window: Current (N), Next (N+1), Next+1 (N+2), Next+2 (N+3).
 * - Ensures Next Cards are completely generated & prepared BEFORE current card leaves.
 * - Prevents rendering the entire quiz DOM tree (small, efficient memory footprint).
 * - Guarantees stable unique card keys for React reconciliation and GPU animations.
 * - Adheres strictly to approved Adaptive Teacher decisions and learning state.
 * - Unanswered preloaded questions NEVER count toward score, accuracy, XP, or statistics.
 */

import { QuizQuestion, QuizSession, OperationType } from '../types';
import { generateSingleQuestion } from '../utils/questionGenerator';

export interface RollingCardBufferState {
  currentQuestion: QuizQuestion | null;
  nextQuestion: QuizQuestion | null;
  nextNextQuestion: QuizQuestion | null;
  nextThirdQuestion: QuizQuestion | null;
  upcomingQuestions: QuizQuestion[];
  currentIndex: number;
  totalQuestions: number;
  isPrepared: boolean;
  hasNext: boolean;
  hasNextNext: boolean;
  hasNextThird: boolean;
}

export class QuizQuestionBuffer {
  private session: QuizSession;
  private questions: QuizQuestion[];
  private currentIndex: number;

  constructor(session: QuizSession) {
    this.session = session;
    this.questions = [...session.questions];
    this.currentIndex = session.currentIndex;
    this.ensureBufferPopulated();
  }

  /**
   * Updates the buffer with latest session state (e.g. after index advance).
   */
  public updateSession(session: QuizSession): void {
    this.session = session;
    this.currentIndex = session.currentIndex;
    // Sync any updated questions
    if (session.questions.length > this.questions.length) {
      this.questions = [...session.questions];
    }
    this.ensureBufferPopulated();
  }

  /**
   * Ensures that upcoming questions (N+1, N+2, N+3) in the rolling window are valid and fully prepared.
   */
  private ensureBufferPopulated(): void {
    const total = this.session.totalQuestions || this.questions.length;

    // Check if we need to safely prepare or populate missing questions up to totalQuestions (up to currentIndex + 3)
    while (this.questions.length < total && this.questions.length <= this.currentIndex + 3) {
      const nextIdx = this.questions.length;
      const fallbackOp: OperationType =
        this.session.config.selectedOperations[nextIdx % this.session.config.selectedOperations.length] || 'addition';
      const newQuestion = generateSingleQuestion(fallbackOp, this.session.config.operationSettings[fallbackOp]);
      this.questions.push({
        ...newQuestion,
        id: newQuestion.id || `buffered_q_${nextIdx}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      });
    }
  }

  /**
   * Returns current rolling card buffer state with complete metadata.
   */
  public getBufferState(): RollingCardBufferState {
    const currentQuestion = this.questions[this.currentIndex] || null;
    const nextQuestion = this.currentIndex + 1 < this.questions.length
      ? this.questions[this.currentIndex + 1]
      : null;
    const nextNextQuestion = this.currentIndex + 2 < this.questions.length
      ? this.questions[this.currentIndex + 2]
      : null;
    const nextThirdQuestion = this.currentIndex + 3 < this.questions.length
      ? this.questions[this.currentIndex + 3]
      : null;

    const upcomingQuestions = [nextQuestion, nextNextQuestion, nextThirdQuestion].filter(Boolean) as QuizQuestion[];

    return {
      currentQuestion,
      nextQuestion,
      nextNextQuestion,
      nextThirdQuestion,
      upcomingQuestions,
      currentIndex: this.currentIndex,
      totalQuestions: this.session.questions.length,
      isPrepared: currentQuestion !== null,
      hasNext: nextQuestion !== null,
      hasNextNext: nextNextQuestion !== null,
      hasNextThird: nextThirdQuestion !== null,
    };
  }

  /**
   * Allows regenerating remaining buffer questions if the Adaptive Teacher Engine
   * dynamically unlocks a new tier mid-quiz.
   */
  public regenerateUpcomingBuffer(newUpcomingQuestions: QuizQuestion[]): void {
    // Preserve answered questions (0 ... currentIndex)
    const answered = this.questions.slice(0, this.currentIndex + 1);
    this.questions = [...answered, ...newUpcomingQuestions];
  }
}

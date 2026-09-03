/**
 * Smart Review Engine for Math Hero.
 * Coordinates analysis, configuration, difficulty adaptation, question selection,
 * and creates ready-to-run QuizSession instances for the existing Quiz Engine.
 */

import { QuizSession, QuizConfiguration, MistakeRecord, OperationType } from '../types';
import { SmartReviewState, SmartReviewConfiguration } from './smartReviewTypes';
import { getOrComputeSmartReviewState, invalidateSmartReviewCache } from './smartReviewPersistence';
import { determineDifficultyProfile, buildAdaptiveOperationSettings } from './difficultyAdapter';
import { generateSmartReviewQuestions, createMistakeVariation, validateSmartQuestion } from './questionSelector';
import { classifyQuestionToSkill, getSkillDefinition } from './skillModel';

export const SMART_REVIEW_DEFAULT_QUESTION_COUNT = 10;

/**
 * Loads current Smart Review state (from cache or fresh analysis).
 */
export async function getSmartReviewState(forceRefresh: boolean = false): Promise<SmartReviewState> {
  return getOrComputeSmartReviewState(forceRefresh);
}

/**
 * Generates an adaptive Smart Review QuizSession using existing QuizSession architecture.
 * Directly runnable by the existing QuizEngine.
 */
export async function createSmartReviewSession(): Promise<{
  session: QuizSession | null;
  state: SmartReviewState;
}> {
  const state = await getOrComputeSmartReviewState();

  if (!state.hasEnoughData) {
    return { session: null, state };
  }

  // 1. Target Top Priority Skills
  const targetSkills = state.targetSkills.length > 0
    ? state.targetSkills
    : Object.values(state.skillMetrics).slice(0, 4);

  // 2. Determine Difficulty Profile
  const difficultyProfile = determineDifficultyProfile(targetSkills);

  // 3. Find multiplication tables needing reinforcement if any
  const weakMulTables: number[] = [];
  targetSkills.forEach((s) => {
    if (s.operation === 'multiplication') {
      s.sampleMistakes.forEach((m) => {
        if (m.num1 <= 12 && !weakMulTables.includes(m.num1)) weakMulTables.push(m.num1);
        if (m.num2 <= 12 && !weakMulTables.includes(m.num2)) weakMulTables.push(m.num2);
      });
    }
  });

  // 4. Build Adaptive Operation Settings
  const adaptiveSettings = buildAdaptiveOperationSettings(difficultyProfile, weakMulTables);

  // 5. Build Smart Review Configuration
  const reviewConfig: SmartReviewConfiguration = {
    questionCount: SMART_REVIEW_DEFAULT_QUESTION_COUNT,
    targetSkills: targetSkills.map((s) => s.skillId),
    operationWeights: state.operationWeights,
    difficultyProfile,
    generatedAt: Date.now(),
    mode: 'practice',
  };

  // 6. Generate Adaptive, Varied, Duplicate-Checked Questions
  const questions = generateSmartReviewQuestions(reviewConfig, targetSkills, adaptiveSettings);

  // 7. Calculate Baseline Accuracy of target skills for post-quiz feedback
  const totalAttempts = targetSkills.reduce((sum, s) => sum + s.totalAttempts, 0);
  const totalCorrect = targetSkills.reduce((sum, s) => sum + s.correctCount, 0);
  const preAccuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : undefined;

  // 8. Distinct Operations included
  const activeOps = Array.from(new Set(questions.map((q) => q.operation))) as OperationType[];

  // 9. Form standard QuizConfiguration compatible with Quiz Engine & Results
  const standardConfig: QuizConfiguration = {
    id: 'smart-review',
    title: 'مرور هوشمند و تمرین تطبیقی',
    mode: 'practice',
    questionCount: questions.length,
    selectedOperations: activeOps.length > 0 ? activeOps : ['addition'],
    operationSettings: adaptiveSettings,
    distribution: state.operationWeights,
    smartReviewEnabled: true,
  };

  const startedAt = Date.now();

  const session: QuizSession = {
    id: `session_smart_review_${startedAt}_${Math.random().toString(36).substring(2, 7)}`,
    config: standardConfig,
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
    source: 'smart-review',
    smartReviewMetadata: {
      targetedSkills: targetSkills.map((s) => s.titleFa),
      targetOperations: activeOps,
      insightFa: state.headlineInsightFa,
      preReviewAccuracy: preAccuracy,
    },
  };

  return { session, state };
}

/**
 * Creates a targeted mistake practice session combining the exact mistakes
 * with intelligent mathematical variations (Requirement 27).
 */
export function createTargetedPracticeMistakesSession(
  mistakes: MistakeRecord[],
  baseConfig?: QuizConfiguration
): QuizSession {
  if (!mistakes || mistakes.length === 0) {
    throw new Error('No mistakes available to practice');
  }

  const generatedQuestions = [];
  const existingSignatures = new Set<string>();

  // 1. Direct mistakes questions
  for (const m of mistakes) {
    const q = m.question;
    const sig = `${q.operation}:${q.num1}:${q.num2}`;
    if (!existingSignatures.has(sig)) {
      existingSignatures.add(sig);
      generatedQuestions.push({
        ...q,
        id: `mistake_q_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      });
    }

    // Add smart variation if total questions is small (< 8)
    if (generatedQuestions.length < 10) {
      const variation = createMistakeVariation(q, existingSignatures);
      if (variation && validateSmartQuestion(variation)) {
        const varSig = `${variation.operation}:${variation.num1}:${variation.num2}`;
        existingSignatures.add(varSig);
        generatedQuestions.push(variation);
      }
    }
  }

  const distinctOps = Array.from(new Set(generatedQuestions.map((q) => q.operation))) as OperationType[];

  const config: QuizConfiguration = {
    id: 'mistakes-practice',
    title: 'تمرین هوشمند اشتباهات',
    mode: 'practice',
    questionCount: generatedQuestions.length,
    selectedOperations: distinctOps,
    operationSettings: baseConfig?.operationSettings || {
      addition: { operand1Digits: 2, operand2Digits: 1 },
      subtraction: { operand1Digits: 2, operand2Digits: 1, allowNegative: false },
      multiplication: { mode: 'table', operand1Digits: 1, operand2Digits: 1, tableNumber: 8 },
      division: { mode: 'table', dividendDigits: 2, divisorDigits: 1, tableNumber: 7, allowRemainder: false },
    },
    distribution: { addition: 25, subtraction: 25, multiplication: 25, division: 25, mixed: 0 },
    smartReviewEnabled: true,
  };

  const startedAt = Date.now();

  return {
    id: `session_mistakes_practice_${startedAt}_${Math.random().toString(36).substring(2, 7)}`,
    config,
    mode: 'practice',
    totalQuestions: generatedQuestions.length,
    currentIndex: 0,
    questions: generatedQuestions,
    currentQuestion: generatedQuestions[0],
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
    source: 'mistakes-practice',
    smartReviewMetadata: {
      targetedSkills: mistakes.map((m) => getSkillDefinition(classifyQuestionToSkill(m.question)).titleFa),
      targetOperations: distinctOps,
      insightFa: 'تمرین متمرکز روی اشتباهات ثبت‌شده همراه با الگوهای مشابه',
    },
  };
}

export { invalidateSmartReviewCache };

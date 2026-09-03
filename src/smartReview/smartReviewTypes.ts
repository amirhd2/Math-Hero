/**
 * Types and interfaces for the Math Hero Smart Review and Adaptive Practice system.
 */

import { OperationType, QuizQuestion, QuizMode } from '../types';

export type SkillId =
  // Addition Skills
  | 'add_single'                // 1-digit + 1-digit (small + small)
  | 'add_double_single'         // 2-digit + 1-digit
  | 'add_double_double'         // 2-digit + 2-digit
  | 'add_multi_digit'           // 3+ digits or larger
  // Subtraction Skills
  | 'sub_single'                // basic subtraction
  | 'sub_double_single'         // 2-digit - 1-digit
  | 'sub_double_double'         // 2-digit - 2-digit
  | 'sub_multi_digit'           // 3+ digits or larger
  // Multiplication Skills
  | 'mul_table_low'             // tables 1-5
  | 'mul_table_mid'             // tables 6-7
  | 'mul_table_high'            // tables 8-9 (harder combinations: 7x8, 8x9, 6x8)
  | 'mul_table_10_12'           // tables 10-12
  | 'mul_multi_digit'           // multi-digit multiplication
  // Division Skills
  | 'div_exact_low'             // exact division with tables 1-5
  | 'div_exact_high'            // exact division with tables 6-9
  | 'div_table_10_12'           // division with 10-12
  | 'div_with_remainder';       // division with remainder

export type SkillConfidence = 'needs_support' | 'developing' | 'strong' | 'mastered';

export interface SkillDefinition {
  id: SkillId;
  operation: OperationType;
  titleFa: string;
  categoryFa: string;
  descriptionFa: string;
  icon: string;
}

export interface SkillPerformanceRecord {
  skillId: SkillId;
  operation: OperationType;
  titleFa: string;
  categoryFa: string;
  totalAttempts: number;
  correctCount: number;
  mistakeCount: number;
  consecutiveMistakes: number;
  consecutiveCorrect: number;
  successfulCorrections: number;
  lastPracticedTimestamp?: number;
  lastMistakeTimestamp?: number;
  lastCorrectTimestamp?: number;
  averageResponseTimeMs: number;
  accuracyPercent: number;
  confidence: SkillConfidence;
  reviewPriority: number;
  sampleMistakes: QuizQuestion[];
}

export type SmartReviewDataTier = 'none' | 'limited' | 'full';

export interface SmartReviewDifficultyProfile {
  targetLevel: number;
  reinforceFundamentals: boolean;
  allowHarderCombinations: boolean;
}

export interface SmartReviewConfiguration {
  questionCount: number;
  targetSkills: SkillId[];
  operationWeights: Record<OperationType, number>;
  difficultyProfile: SmartReviewDifficultyProfile;
  generatedAt: number;
  mode: QuizMode;
}

export interface SmartReviewState {
  totalQuizzesAnalyzed: number;
  totalQuestionsAnalyzed: number;
  hasEnoughData: boolean;
  dataTier: SmartReviewDataTier;
  skillMetrics: Record<SkillId, SkillPerformanceRecord>;
  operationWeights: Record<OperationType, number>;
  targetSkills: SkillPerformanceRecord[];
  headlineInsightFa: string;
  subInsightFa?: string;
  weakestOperation?: OperationType;
  strongestOperation?: OperationType;
  unresolvedMistakeCount: number;
}

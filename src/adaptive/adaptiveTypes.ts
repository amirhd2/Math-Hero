/**
 * Domain types for Math Hero Adaptive Learning & Smart Teacher Engine.
 * Supports per-operation skill ladders, evidence-based mastery states,
 * conservative promotion logic, adaptive learning plans, and parent overrides.
 */

import { OperationType, QuizQuestion, QuizResult } from '../types';
import { SkillId } from '../smartReview/smartReviewTypes';

export type MasteryState =
  | 'locked'      // Child has not unlocked this tier yet
  | 'unlocked'    // Available, but not currently the active learning tier
  | 'learning'    // Introduced to this skill; beginning practice
  | 'practicing'  // In active practice; accumulating evidence
  | 'mastered';   // Confirmed mastery via repeated evidence across sessions

export interface SkillTierDefinition {
  tier: number; // 1 to 4
  skillId: SkillId;
  operation: OperationType;
  titleFa: string;
  stageNameFa: string;
  categoryFa: string;
  descriptionFa: string;
  sampleExamplesFa: string;
  pedagogicalGoalFa: string;
}

export interface SkillTierEvidence {
  tier: number;
  skillId: SkillId;
  operation: OperationType;
  state: MasteryState;
  questionsAttempted: number;
  questionsCorrect: number;
  sessionsCount: number;
  recentAccuracy: number; // 0-100 across last 3 sessions
  allTimeAccuracy: number; // 0-100
  consecutiveCorrectSessions: number;
  repeatedMistakesCount: number;
  firstPracticedAt?: number;
  lastPracticedAt?: number;
  unlockedAt?: number;
  masteredAt?: number;
}

export interface OperationMasteryProfile {
  operation: OperationType;
  currentTier: number; // Active tier child is practicing (e.g. 1)
  highestUnlockedTier: number;
  highestMasteredTier: number;
  tiers: Record<number, SkillTierEvidence>;
}

export interface AdaptiveLearningPlan {
  version: number;
  primaryOperation: OperationType;
  recommendedSkillId: SkillId;
  recommendedTier: number;
  operations: Record<OperationType, OperationMasteryProfile>;
  reviewSkills: SkillId[];
  neglectedOperations: OperationType[];
  recentlyUnlockedSkills: SkillId[];
  postponedPromotions: Array<{
    skillId: SkillId;
    tier: number;
    operation: OperationType;
    postponedAt: number;
  }>;
  nextMilestoneFa: string;
  updatedAt: number;
}

export interface PromotionEvent {
  id: string;
  operation: OperationType;
  masteredTier: number;
  masteredSkillId: SkillId;
  masteredSkillTitleFa: string;
  unlockedTier: number;
  unlockedSkillId: SkillId;
  unlockedSkillTitleFa: string;
  unlockedSampleExamplesFa: string;
  timestamp: number;
  status: 'pending' | 'accepted' | 'postponed';
}

export interface SkillMasteryEvaluation {
  skillId: SkillId;
  tier: number;
  operation: OperationType;
  state: MasteryState;
  confidence: number; // 0-100
  accuracy: number;
  recentAccuracy: number;
  sessionsCompleted: number;
  questionsAnswered: number;
  repeatedMistakes: number;
  retentionStatus: 'fresh' | 'retained' | 'needs_refresh';
  readyForPromotion: boolean;
  reasonFa: string;
}

export interface TeacherDecision {
  operation: OperationType;
  skillId: SkillId;
  tier: number;
  mode: 'practice';
  questionCount: number;
  questionMix: {
    targetTierCount: number;
    reviewFoundationalCount: number;
    mistakeReviewCount: number;
  };
  reasoningFa: string;
}

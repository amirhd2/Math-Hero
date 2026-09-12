/**
 * Gamification types and models for Math Hero.
 * Centralized schema for XP, Levels, Badges, Trophy, Streaks, and Progression.
 */

import { OperationType, UserProfile } from '../types';

export type BadgeCategory =
  | 'practice'
  | 'accuracy'
  | 'improvement'
  | 'operations'
  | 'streak'
  | 'smartReview'
  | 'mastery';

export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

export type BadgeRequirementType =
  | 'quizzes_count'
  | 'correct_answers'
  | 'perfect_quizzes'
  | 'streak_days'
  | 'level_reached'
  | 'operation_correct'
  | 'operation_mastery'
  | 'comeback_improvement'
  | 'getting_stronger'
  | 'resolve_mistakes'
  | 'smart_review_count'
  | 'all_operations_tried'
  | 'fast_accurate_quiz'
  | 'math_hero_grand'
  | 'tier_mastered'
  | 'balanced_mastery';

export interface BadgeRequirement {
  type: BadgeRequirementType;
  target: number;
  operation?: OperationType;
  tier?: number;
  minQuestions?: number;
  minAccuracy?: number;
  descriptionFa: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  category: BadgeCategory;
  icon: string;
  imageUrl?: string;
  requirement: BadgeRequirement;
  xpReward: number;
  rarity: BadgeRarity;
  unlocked?: boolean;
  unlockedAt?: number;
  progress?: number;
  maxProgress?: number;
}

export interface TrophyRequirementDetail {
  id: 'level' | 'badges' | 'tiers' | 'operations';
  titleFa: string;
  currentValue: number;
  targetValue: number;
  unitFa: string;
  isMet: boolean;
  guidanceFa: string;
}

export interface TrophyInfo {
  stage: number; // 1 to 6
  maxStage: number;
  title: string;
  stageNameFa: string;
  description: string;
  icon: string;
  cupImage?: string;
  badgeRequiredCount: number;
  levelRequired: number;
  masteredTiersRequired?: number;
  distinctOpsRequired?: number;
  nextStageNameFa?: string;
  nextRequirementText: string;
  detailedRequirements?: TrophyRequirementDetail[];
  progressPercent: number;
  isMax: boolean;
  isLockedAndMysterious?: boolean;
}

export interface LevelInfo {
  level: number;
  title: string;
  icon: string;
  stageImage?: string;
  totalXp: number;
  currentLevelXpFloor: number;
  nextLevelXpThreshold: number;
  xpInCurrentLevel: number;
  xpRequiredForNextLevel: number;
  progressPercent: number;
  isMaxLevel: boolean;
  // Educational Gating Information:
  isEducationallyGated?: boolean;
  pendingLevelByXp?: number;
  nextLevelEducationalRequirementText?: string;
  educationalRequirementMet?: boolean;
  masteredTiersCount?: number;
  requiredTiersForNextLevel?: number;
}

export interface XpBreakdown {
  baseQuizXp: number;
  correctAnswersXp: number;
  accuracyBonusXp: number;
  smartReviewBonusXp: number;
  testModeBonusXp: number;
  improvementBonusXp: number;
  streakBonusXp: number;
  achievementBonusXp: number;
  masteryMilestoneBonusXp: number;
  tierUnlockBonusXp: number;
  totalXpEarned: number;
  isGrindingReduced?: boolean;
}

export interface GamificationStats {
  totalQuizzesCompleted: number;
  totalQuestionsAnswered: number;
  totalCorrectAnswers: number;
  perfectQuizzesCount: number;
  smartReviewsCount: number;
  practiceCount: number;
  testCount: number;
  mistakesResolvedCount: number;
  consecutiveImprovements: number;
  operationCorrectCounts: Record<OperationType, number>;
  operationAccuracies: Record<OperationType, number>;
}

export interface GamificationState {
  totalXp: number;
  currentLevel: number;
  currentStreak: number;
  bestStreak: number;
  unlockedBadges: string[];
  badgeUnlockTimestamps: Record<string, number>;
  trophyStage: number;
  lastActivityDate: string | null; // YYYY-MM-DD
  lastActivityAt: number | null;
  stats: GamificationStats;
  // Idempotency & Rebalance Tracking:
  processedQuizIds: string[];
  awardedMasteryBonuses: string[];
  masteredTiersCount?: number;
  distinctOperationsMastered?: number;
}

export interface GamificationUpdateResult {
  updatedState: GamificationState;
  updatedProfile: UserProfile;
  xpBreakdown: XpBreakdown;
  levelBefore: number;
  levelAfter: number;
  leveledUp: boolean;
  levelsGained: number;
  newlyUnlockedBadges: Badge[];
  trophyStageBefore: number;
  trophyStageAfter: number;
  trophyUpgraded: boolean;
}

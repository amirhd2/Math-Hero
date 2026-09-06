/**
 * Smart Teacher Engine for Math Hero.
 * Centralized decision layer coordinating:
 * - Skill Progression & Approved Tier verification
 * - Adaptive question mix (Target tier + Foundational review + Mistake review)
 * - Neglected operation detection & positive guidance
 * - Evidence-based promotion & persistent promotion events
 * - Anti-grinding educational guards
 */

import { OperationType, QuizQuestion, QuizResult, QuizSession } from '../types';
import {
  extractOperationBreakdownFromQuizResult,
  PRIMARY_OPERATIONS,
} from '../utils/operationEvidence';
import { SkillId } from '../smartReview/smartReviewTypes';
import {
  AdaptiveLearningPlan,
  OperationMasteryProfile,
  PromotionEvent,
  SkillTierDefinition,
  SkillTierEvidence,
  TeacherDecision,
} from './adaptiveTypes';
import { SKILL_TIERS, getTierDefinition, getTierForSkillId } from './tierRegistry';
import { SkillMasteryEvaluator } from './masteryModel';
import { storage } from '../utils/storage';
import { generateQuestionForSkill } from '../smartReview/questionSelector';
import { classifyQuestionToSkill } from '../smartReview/skillModel';
import { DEFAULT_OPERATION_SETTINGS } from '../utils/questionGenerator';

const LEARNING_PLAN_STORAGE_KEY = 'math_hero_learning_plan_v1';
const PROMOTIONS_STORAGE_KEY = 'math_hero_promotions_v1';

/**
 * Creates default initial evidence for a tier.
 */
function createDefaultTierEvidence(
  tier: number,
  skillId: SkillId,
  operation: OperationType,
  isUnlocked: boolean
): SkillTierEvidence {
  return {
    tier,
    skillId,
    operation,
    state: isUnlocked ? 'learning' : 'locked',
    questionsAttempted: 0,
    questionsCorrect: 0,
    sessionsCount: 0,
    recentAccuracy: 100,
    allTimeAccuracy: 100,
    consecutiveCorrectSessions: 0,
    repeatedMistakesCount: 0,
    unlockedAt: isUnlocked ? Date.now() : undefined,
  };
}

/**
 * Creates initial clean operation mastery profile.
 */
function createDefaultOperationProfile(operation: OperationType): OperationMasteryProfile {
  const tiers = SKILL_TIERS[operation];
  const tierMap: Record<number, SkillTierEvidence> = {};

  tiers.forEach((t) => {
    // Tier 1 is unlocked/learning by default; others locked
    tierMap[t.tier] = createDefaultTierEvidence(t.tier, t.skillId, operation, t.tier === 1);
  });

  return {
    operation,
    currentTier: 1,
    highestUnlockedTier: 1,
    highestMasteredTier: 0,
    tiers: tierMap,
  };
}

/**
 * Creates a brand new default Learning Plan.
 */
export function createInitialLearningPlan(): AdaptiveLearningPlan {
  return {
    version: 1,
    primaryOperation: 'addition',
    recommendedSkillId: 'add_single',
    recommendedTier: 1,
    operations: {
      addition: createDefaultOperationProfile('addition'),
      subtraction: createDefaultOperationProfile('subtraction'),
      multiplication: createDefaultOperationProfile('multiplication'),
      division: createDefaultOperationProfile('division'),
      mixed: createDefaultOperationProfile('addition'),
    },
    reviewSkills: [],
    neglectedOperations: [],
    recentlyUnlockedSkills: [],
    postponedPromotions: [],
    nextMilestoneFa: 'تسلط بر جمع‌های پایه یک‌رقمی',
    updatedAt: Date.now(),
  };
}

export class SmartTeacherEngine {
  /**
   * Loads or bootstraps the adaptive learning plan from storage.
   */
  static async getLearningPlan(): Promise<AdaptiveLearningPlan> {
    try {
      const raw = localStorage.getItem(LEARNING_PLAN_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AdaptiveLearningPlan;
        if (parsed && parsed.operations && parsed.operations.addition) {
          return this.sanitizePlan(parsed);
        }
      }
    } catch (e) {
      console.warn('Could not read learning plan from localStorage', e);
    }

    // Bootstrap from existing results conservatively
    const plan = createInitialLearningPlan();
    try {
      const results = await storage.getResults();
      if (results.length > 0) {
        this.bootstrapFromResults(plan, results);
      }
    } catch (e) {
      console.error('Error bootstrapping learning plan:', e);
    }

    await this.saveLearningPlan(plan);
    return plan;
  }

  /**
   * Saves the learning plan to storage.
   */
  static async saveLearningPlan(plan: AdaptiveLearningPlan): Promise<void> {
    plan.updatedAt = Date.now();
    try {
      localStorage.setItem(LEARNING_PLAN_STORAGE_KEY, JSON.stringify(plan));
    } catch (e) {
      console.error('Failed to save learning plan:', e);
    }
  }

  /**
   * Evaluates historical results conservatively without granting unproven mastery.
   */
  private static bootstrapFromResults(plan: AdaptiveLearningPlan, results: QuizResult[]): void {
    const validResults = results.filter((r) => r.totalQuestions && r.totalQuestions >= 1);
    const opCounts: Record<OperationType, number> = {
      addition: 0,
      subtraction: 0,
      multiplication: 0,
      division: 0,
      mixed: 0,
    };

    validResults.forEach((r) => {
      const breakdown = extractOperationBreakdownFromQuizResult(r);
      PRIMARY_OPERATIONS.forEach((op) => {
        const stat = breakdown[op];
        if (stat && stat.totalQuestions > 0) {
          opCounts[op] += stat.totalQuestions;
          if (plan.operations[op]) {
            const tier1 = plan.operations[op].tiers[1];
            if (tier1) {
              tier1.sessionsCount += 1;
              tier1.questionsAttempted += stat.totalQuestions;
              tier1.questionsCorrect += stat.correctCount;
              tier1.state = 'practicing';
            }
          }
        }
      });
    });

    // Detect neglected operations (operations with very few questions)
    const activeOps = (['addition', 'subtraction', 'multiplication', 'division'] as OperationType[]);
    const neglected = activeOps.filter((op) => opCounts[op] < 5);
    plan.neglectedOperations = neglected;
  }

  private static sanitizePlan(plan: AdaptiveLearningPlan): AdaptiveLearningPlan {
    // Ensure all 4 operations and all 4 tiers exist
    const ops: OperationType[] = ['addition', 'subtraction', 'multiplication', 'division'];
    ops.forEach((op) => {
      if (!plan.operations[op]) {
        plan.operations[op] = createDefaultOperationProfile(op);
      }
      const tiers = SKILL_TIERS[op];
      tiers.forEach((t) => {
        if (!plan.operations[op].tiers[t.tier]) {
          plan.operations[op].tiers[t.tier] = createDefaultTierEvidence(
            t.tier,
            t.skillId,
            op,
            t.tier === 1
          );
        }
      });
    });
    return plan;
  }

  /**
   * Determines the smart teacher recommendation for practicing a specific operation.
   */
  static getTeacherDecision(
    operation: OperationType,
    plan: AdaptiveLearningPlan
  ): TeacherDecision {
    const profile = plan.operations[operation] || plan.operations.addition;
    const currentTier = profile.currentTier || 1;
    const tierDef = getTierDefinition(operation, currentTier);

    let targetTierCount = 7;
    let reviewFoundationalCount = 2;
    let mistakeReviewCount = 1;

    if (currentTier === 1) {
      targetTierCount = 10;
      reviewFoundationalCount = 0;
      mistakeReviewCount = 0;
    }

    const reasoningFa = `آموزش هوشمند: تمرین ${tierDef.stageNameFa} برای ارتقای گام‌به‌گام مهارت‌ها`;

    return {
      operation,
      skillId: tierDef.skillId,
      tier: currentTier,
      mode: 'practice',
      questionCount: 10,
      questionMix: {
        targetTierCount,
        reviewFoundationalCount,
        mistakeReviewCount,
      },
      reasoningFa,
    };
  }

  /**
   * Generates a completely validated adaptive question set for a single operation.
   * Guarantees that questions STRICTLY adhere to the child's approved skill tier.
   */
  static async generateAdaptiveQuestions(
    operation: OperationType,
    countOrPlan?: number | AdaptiveLearningPlan,
    tierOrMistakes?: number | QuizQuestion[]
  ): Promise<QuizQuestion[]> {
    let plan: AdaptiveLearningPlan;
    let sampleMistakes: QuizQuestion[] = [];

    if (typeof countOrPlan === 'object' && countOrPlan !== null) {
      plan = countOrPlan;
      if (Array.isArray(tierOrMistakes)) {
        sampleMistakes = tierOrMistakes;
      }
    } else {
      plan = await this.getLearningPlan();
      if (typeof tierOrMistakes === 'number' && plan.operations[operation]) {
        plan.operations[operation].currentTier = tierOrMistakes;
      }
    }

    const decision = this.getTeacherDecision(operation, plan);
    const questions: QuizQuestion[] = [];
    const signatures = new Set<string>();

    const targetSkillId = decision.skillId;
    const targetCount = decision.questionMix.targetTierCount;
    const reviewCount = decision.questionMix.reviewFoundationalCount;
    const mistakeCount = decision.questionMix.mistakeReviewCount;

    // 1. Generate target tier questions
    for (let i = 0; i < targetCount; i++) {
      const q = generateQuestionForSkill(
        targetSkillId,
        [],
        DEFAULT_OPERATION_SETTINGS,
        signatures
      );
      if (q) {
        signatures.add(`${q.operation}:${q.num1}:${q.num2}`);
        questions.push(q);
      }
    }

    // 2. Generate review questions from Tier 1 if applicable
    if (reviewCount > 0 && decision.tier > 1) {
      const foundationalSkillId = getTierDefinition(operation, 1).skillId;
      for (let i = 0; i < reviewCount; i++) {
        const q = generateQuestionForSkill(
          foundationalSkillId,
          [],
          DEFAULT_OPERATION_SETTINGS,
          signatures
        );
        if (q) {
          signatures.add(`${q.operation}:${q.num1}:${q.num2}`);
          questions.push(q);
        }
      }
    }

    // 3. Generate mistake review if any relevant sample mistakes exist
    if (mistakeCount > 0 && sampleMistakes.length > 0) {
      const relevantMistakes = sampleMistakes.filter((m) => m.operation === operation);
      if (relevantMistakes.length > 0) {
        const q = generateQuestionForSkill(
          targetSkillId,
          relevantMistakes,
          DEFAULT_OPERATION_SETTINGS,
          signatures
        );
        if (q) {
          signatures.add(`${q.operation}:${q.num1}:${q.num2}`);
          questions.push(q);
        }
      }
    }

    // Fill remaining up to 10 with target skill
    while (questions.length < 10) {
      const q = generateQuestionForSkill(
        targetSkillId,
        [],
        DEFAULT_OPERATION_SETTINGS,
        signatures
      );
      if (q) {
        signatures.add(`${q.operation}:${q.num1}:${q.num2}`);
        questions.push(q);
      } else {
        break;
      }
    }

    // Safety fallback: ensure all questions have required properties
    return questions.map((q, idx) => ({
      ...q,
      id: `adp_${operation}_${Date.now()}_${idx}`,
    }));
  }

  /**
   * Generates questions for an adaptive combined quiz.
   * Only selects operations and tiers that are currently UNLOCKED.
   * Intelligently emphasizes neglected operations.
   */
  static generateCombinedAdaptiveQuestions(
    plan: AdaptiveLearningPlan,
    sampleMistakes: QuizQuestion[] = []
  ): QuizQuestion[] {
    const ops: OperationType[] = ['addition', 'subtraction', 'multiplication', 'division'];
    const questions: QuizQuestion[] = [];
    const signatures = new Set<string>();

    // Determine weight for each operation: give neglected operations slightly higher weight
    const distribution: Record<OperationType, number> = {
      addition: 2,
      subtraction: 2,
      multiplication: 3,
      division: 3,
      mixed: 0,
    };

    if (plan.neglectedOperations && plan.neglectedOperations.length > 0) {
      plan.neglectedOperations.forEach((negOp) => {
        if (distribution[negOp] !== undefined) {
          distribution[negOp] += 1;
        }
      });
    }

    // Build question pool
    ops.forEach((op) => {
      const count = distribution[op] || 2;
      const profile = plan.operations[op] || plan.operations.addition;
      const approvedTier = profile.currentTier || 1;
      const skillId = getTierDefinition(op, approvedTier).skillId;

      for (let i = 0; i < count; i++) {
        const q = generateQuestionForSkill(
          skillId,
          sampleMistakes.filter((m) => m.operation === op),
          DEFAULT_OPERATION_SETTINGS,
          signatures
        );
        if (q) {
          signatures.add(`${q.operation}:${q.num1}:${q.num2}`);
          questions.push(q);
        }
      }
    });

    // Shuffle combined questions smoothly
    for (let i = questions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [questions[i], questions[j]] = [questions[j], questions[i]];
    }

    return questions.slice(0, 10).map((q, idx) => ({
      ...q,
      id: `adp_comb_${Date.now()}_${idx}`,
    }));
  }

  /**
   * Records evidence when a quiz completes.
   * Updates skill evidence, checks for mastery, unlocks next tier if eligible,
   * creates persistent PromotionEvent if a promotion occurs.
   */
  static async recordQuizEvidence(
    result: QuizResult,
    session?: QuizSession,
    planInput?: AdaptiveLearningPlan,
    isParentOverride = false
  ): Promise<{ plan: AdaptiveLearningPlan; newPromotion: PromotionEvent | null }> {
    const plan = planInput || (await this.getLearningPlan());

    // If this session was a parent manual override, do not let it artificially promote child tiers
    if (isParentOverride) {
      return { plan, newPromotion: null };
    }

    const breakdown = extractOperationBreakdownFromQuizResult(result, session);
    let latestPromotion: PromotionEvent | null = null;

    for (const op of PRIMARY_OPERATIONS) {
      const opStat = breakdown[op];
      if (!opStat || opStat.totalQuestions <= 0) continue;

      if (plan.operations[op]) {
        const profile = plan.operations[op];
        const tier = profile.currentTier || 1;
        const evidence = profile.tiers[tier];

        if (evidence) {
          evidence.sessionsCount += 1;
          evidence.questionsAttempted += opStat.totalQuestions;
          evidence.questionsCorrect += opStat.correctCount;
          evidence.lastPracticedAt = Date.now();
          if (!evidence.firstPracticedAt) evidence.firstPracticedAt = Date.now();

          const sessionAccuracy = Math.round((opStat.correctCount / Math.max(1, opStat.totalQuestions)) * 100);

          // Exponential moving average for recent accuracy (giving heavy weight to latest session)
          evidence.recentAccuracy = Math.round(evidence.recentAccuracy * 0.4 + sessionAccuracy * 0.6);
          evidence.allTimeAccuracy = Math.round(
            (evidence.questionsCorrect / Math.max(1, evidence.questionsAttempted)) * 100
          );

          if (sessionAccuracy >= 90) {
            evidence.consecutiveCorrectSessions += 1;
          } else {
            evidence.consecutiveCorrectSessions = 0;
          }

          // Mistakes in this session for this operation
          const sessionMistakes = opStat.incorrectCount || 0;
          if (sessionMistakes >= 2) {
            evidence.repeatedMistakesCount += 1;
          } else if (sessionMistakes === 0 && evidence.repeatedMistakesCount > 0) {
            evidence.repeatedMistakesCount -= 1;
          }

          // Run mastery evaluation
          const evaluation = SkillMasteryEvaluator.evaluate(evidence);

          if (evaluation.readyForPromotion && tier < 4) {
            // Promote current tier to mastered
            evidence.state = 'mastered';
            evidence.masteredAt = Date.now();
            profile.highestMasteredTier = Math.max(profile.highestMasteredTier, tier);

            // Unlock next tier!
            const nextTier = tier + 1;
            const nextEvidence = profile.tiers[nextTier];
            if (nextEvidence && nextEvidence.state === 'locked') {
              nextEvidence.state = 'unlocked';
              nextEvidence.unlockedAt = Date.now();
              profile.highestUnlockedTier = Math.max(profile.highestUnlockedTier, nextTier);

              // Create persistent PromotionEvent
              const currentDef = getTierDefinition(op, tier);
              const nextDef = getTierDefinition(op, nextTier);

              const promotionEvent: PromotionEvent = {
                id: `promo_${op}_${nextTier}_${Date.now()}`,
                operation: op,
                masteredTier: tier,
                masteredSkillId: currentDef.skillId,
                masteredSkillTitleFa: currentDef.titleFa,
                unlockedTier: nextTier,
                unlockedSkillId: nextDef.skillId,
                unlockedSkillTitleFa: nextDef.titleFa,
                unlockedSampleExamplesFa: nextDef.sampleExamplesFa,
                timestamp: Date.now(),
                status: 'pending',
              };

              await this.savePromotionEvent(promotionEvent);
              latestPromotion = promotionEvent;
            }
          }
        }
      }
    }

    // Update neglected operations list dynamically
    this.updateNeglectedOperations(plan);
    await this.saveLearningPlan(plan);

    return { plan, newPromotion: latestPromotion };
  }

  /**
   * Recalculates neglected operations based on sessions and question count.
   */
  private static updateNeglectedOperations(plan: AdaptiveLearningPlan): void {
    const ops: OperationType[] = ['addition', 'subtraction', 'multiplication', 'division'];
    const sessions = ops.map((op) => ({
      op,
      count: plan.operations[op]?.tiers[plan.operations[op]?.currentTier || 1]?.sessionsCount || 0,
    }));

    const maxSessions = Math.max(...sessions.map((s) => s.count), 1);
    // Any operation with significantly fewer sessions (< 40% of max, or <= 1 session when max >= 3)
    const neglected = sessions
      .filter((s) => s.count <= 1 || s.count < maxSessions * 0.35)
      .map((s) => s.op);

    plan.neglectedOperations = neglected;
  }

  /**
   * Accepts a promotion: immediately updates Learning Plan to activate the new tier.
   */
  static async acceptPromotion(
    promotionId: string,
    planInput?: AdaptiveLearningPlan
  ): Promise<AdaptiveLearningPlan> {
    const plan = planInput || (await this.getLearningPlan());
    const promotions = await this.getPromotions();
    const promo = promotions.find((p) => p.id === promotionId);
    if (!promo) return plan;

    promo.status = 'accepted';
    await this.savePromotionsList(promotions);

    const profile = plan.operations[promo.operation];
    if (profile) {
      profile.currentTier = promo.unlockedTier;
      const tierEvidence = profile.tiers[promo.unlockedTier];
      if (tierEvidence) {
        tierEvidence.state = 'learning';
      }
      plan.recommendedSkillId = promo.unlockedSkillId;
      plan.recommendedTier = promo.unlockedTier;
      plan.primaryOperation = promo.operation;
      plan.nextMilestoneFa = `تسلط بر ${promo.unlockedSkillTitleFa}`;
    }

    await this.saveLearningPlan(plan);
    return plan;
  }

  /**
   * Postpones a promotion: keeps next tier unlocked, remembers postponement.
   */
  static async postponePromotion(
    promotionId: string,
    planInput?: AdaptiveLearningPlan
  ): Promise<AdaptiveLearningPlan> {
    const plan = planInput || (await this.getLearningPlan());
    const promotions = await this.getPromotions();
    const promo = promotions.find((p) => p.id === promotionId);
    if (!promo) return plan;

    promo.status = 'postponed';
    await this.savePromotionsList(promotions);

    plan.postponedPromotions.push({
      skillId: promo.unlockedSkillId,
      tier: promo.unlockedTier,
      operation: promo.operation,
      postponedAt: Date.now(),
    });

    await this.saveLearningPlan(plan);
    return plan;
  }

  /**
   * Retrieves all recorded promotion events.
   */
  static async getPromotions(): Promise<PromotionEvent[]> {
    try {
      const raw = localStorage.getItem(PROMOTIONS_STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Failed to read promotions from localStorage:', e);
    }
    return [];
  }

  /**
   * Retrieves any pending promotion event that needs user celebration.
   */
  static async getPendingPromotion(): Promise<PromotionEvent | null> {
    const all = await this.getPromotions();
    return all.find((p) => p.status === 'pending') || null;
  }

  static async savePromotionEvent(promo: PromotionEvent): Promise<void> {
    const all = await this.getPromotions();
    all.unshift(promo);
    await this.savePromotionsList(all);
  }

  private static async savePromotionsList(list: PromotionEvent[]): Promise<void> {
    try {
      localStorage.setItem(PROMOTIONS_STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Failed to save promotions list:', e);
    }
  }

  /**
   * Anti-Grind Check:
   * Returns true if the child is practicing a tier that is ALREADY strongly mastered
   * when higher tiers are already unlocked.
   */
  static async isGrindingMasteredTier(
    operation: OperationType,
    planOrTier?: AdaptiveLearningPlan | number
  ): Promise<boolean> {
    const plan =
      typeof planOrTier === 'object' && planOrTier !== null
        ? planOrTier
        : await this.getLearningPlan();
    const profile = plan.operations[operation];
    if (!profile) return false;
    const tier = typeof planOrTier === 'number' ? planOrTier : profile.currentTier || 1;
    const tierEvidence = profile.tiers[tier];
    return Boolean(
      tierEvidence &&
        tierEvidence.state === 'mastered' &&
        tierEvidence.sessionsCount >= 5 &&
        profile.highestUnlockedTier > tier
    );
  }
}

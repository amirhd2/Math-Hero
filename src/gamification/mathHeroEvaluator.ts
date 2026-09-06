/**
 * Math Hero Grand Milestone Eligibility Evaluator.
 * 
 * Strict Educational Progression Gatekeeper for the ultimate milestone:
 * - Level 15 / Grand Math Hero
 * - Trophy Stage 6 (جام الماسین قهرمان قهرمانان)
 * - Final Math Hero Badge ('math_hero_grand')
 * 
 * CORE PRINCIPLE:
 * XP motivates the child, while Skill Mastery determines real educational progression.
 * XP alone must NEVER grant the ultimate Math Hero Trophy.
 * The trophy remains locked until verified multi-operation mastery evidence is demonstrated.
 */

import { AdaptiveLearningPlan } from '../adaptive/adaptiveTypes';
import { OperationType } from '../types';

export interface EducationalRequirementItem {
  id: string;
  titleFa: string;
  current: number;
  target: number;
  met: boolean;
  descriptionFa: string;
  icon: string;
}

export interface MathHeroEligibility {
  isEligible: boolean;
  progressPercent: number;
  requirements: EducationalRequirementItem[];
  summaryFa: string;
  masteredTiersCount: number;
  distinctOperationsCount: number;
  advancedTiersCount: number;
}

export interface EvaluatorContext {
  totalXp: number;
  unlockedBadgesCount: number;
  learningPlan?: AdaptiveLearningPlan | null;
}

export class MathHeroEligibilityEvaluator {
  // Centralized Thresholds for Grand Math Hero Milestone
  static readonly REQUIRED_TOTAL_XP = 6000;
  static readonly REQUIRED_MASTERED_TIERS = 8;
  static readonly REQUIRED_DISTINCT_OPERATIONS = 3;
  static readonly REQUIRED_ADVANCED_TIERS = 1; // At least one Tier 3 or 4 mastered
  static readonly REQUIRED_BADGES = 15;

  /**
   * Evaluates complete educational and motivational eligibility.
   */
  static evaluate(context: EvaluatorContext): MathHeroEligibility {
    const { totalXp, unlockedBadgesCount, learningPlan } = context;

    // Calculate educational metrics from LearningPlan
    let masteredTiersCount = 0;
    let advancedTiersCount = 0;
    const opsWithMastery = new Set<OperationType>();

    if (learningPlan && learningPlan.operations) {
      const coreOps: OperationType[] = ['addition', 'subtraction', 'multiplication', 'division'];
      coreOps.forEach((op) => {
        const profile = learningPlan.operations[op];
        if (profile && profile.tiers) {
          Object.values(profile.tiers).forEach((evidence) => {
            if (evidence.state === 'mastered') {
              masteredTiersCount++;
              opsWithMastery.add(op);
              if (evidence.tier >= 3) {
                advancedTiersCount++;
              }
            }
          });
        }
      });
    }

    const distinctOperationsCount = opsWithMastery.size;

    // 1. XP Requirement (Motivational)
    const xpMet = totalXp >= this.REQUIRED_TOTAL_XP;
    const xpReq: EducationalRequirementItem = {
      id: 'total_xp',
      titleFa: 'امتیاز تجربه کل (XP)',
      current: totalXp,
      target: this.REQUIRED_TOTAL_XP,
      met: xpMet,
      descriptionFa: `کسب حداقل ${this.REQUIRED_TOTAL_XP.toLocaleString('fa-IR')} امتیاز تجربه`,
      icon: '⭐',
    };

    // 2. Mastered Skill Tiers Requirement (Educational Volume)
    const tiersMet = masteredTiersCount >= this.REQUIRED_MASTERED_TIERS;
    const tiersReq: EducationalRequirementItem = {
      id: 'mastered_tiers',
      titleFa: 'تعداد مراحل مهارت مسلط‌شده',
      current: masteredTiersCount,
      target: this.REQUIRED_MASTERED_TIERS,
      met: tiersMet,
      descriptionFa: `اثبات تسلط بر حداقل ${this.REQUIRED_MASTERED_TIERS} مرحله از مهارت‌های ریاضی`,
      icon: '🎯',
    };

    // 3. Multi-Operation Breadth Requirement (Educational Breadth)
    const opsMet = distinctOperationsCount >= this.REQUIRED_DISTINCT_OPERATIONS;
    const opsReq: EducationalRequirementItem = {
      id: 'distinct_operations',
      titleFa: 'تنوع عملیات‌های مسلط‌شده',
      current: distinctOperationsCount,
      target: this.REQUIRED_DISTINCT_OPERATIONS,
      met: opsMet,
      descriptionFa: `تسلط بر حداقل ۱ مرحله در ۳ عملیات مختلف (+، -، ×، ÷)`,
      icon: '🌈',
    };

    // 4. Advanced Tier Depth Requirement (Educational Depth)
    const advancedMet = advancedTiersCount >= this.REQUIRED_ADVANCED_TIERS;
    const advancedReq: EducationalRequirementItem = {
      id: 'advanced_tiers',
      titleFa: 'مهارت در مراحل پیشرفته (سطح ۳ یا ۴)',
      current: advancedTiersCount,
      target: this.REQUIRED_ADVANCED_TIERS,
      met: advancedMet,
      descriptionFa: 'تسلط بر حداقل یک مرحله پیشرفته (نظیر ضرب دورقمی یا تفریق ستونی)',
      icon: '⚡',
    };

    // 5. Badges & Consistency Requirement (Motivational & Consistency)
    const badgesMet = unlockedBadgesCount >= this.REQUIRED_BADGES;
    const badgesReq: EducationalRequirementItem = {
      id: 'badges_count',
      titleFa: 'نشان‌های افتخار کسب‌شده',
      current: unlockedBadgesCount,
      target: this.REQUIRED_BADGES,
      met: badgesMet,
      descriptionFa: `کسب حداقل ${this.REQUIRED_BADGES} نشان افتخار در طول مسیر`,
      icon: '🏅',
    };

    const requirements = [tiersReq, opsReq, advancedReq, xpReq, badgesReq];

    // Compute unified progress percentage
    const weights = [30, 25, 15, 15, 15]; // Heavy educational weight (70% educational, 30% motivational)
    let totalScore = 0;

    requirements.forEach((req, idx) => {
      const ratio = Math.min(1, Math.max(0, req.current / req.target));
      totalScore += ratio * weights[idx];
    });

    const isEligible = tiersMet && opsMet && advancedMet && xpMet && badgesMet;
    const progressPercent = isEligible ? 100 : Math.min(99, Math.round(totalScore));

    let summaryFa = '';
    if (isEligible) {
      summaryFa = 'شما تمامی شواهد علمی و انگیزشی برای کسب عنوان قهرمان قهرمانان ریاضی را کسب کرده‌اید! 👑';
    } else if (!tiersMet || !opsMet) {
      const remainingTiers = Math.max(0, this.REQUIRED_MASTERED_TIERS - masteredTiersCount);
      const remainingOps = Math.max(0, this.REQUIRED_DISTINCT_OPERATIONS - distinctOperationsCount);
      if (remainingOps > 0) {
        summaryFa = `برای فتح تاج قهرمانی: مهارت‌هایت را در ${remainingOps} عملیات جدید گسترش بده و ${remainingTiers} مرحله دیگر را مسلط شو.`;
      } else {
        summaryFa = `برای فتح تاج قهرمانی: تسلط بر ${remainingTiers} مرحله مهارت دیگر نیاز است.`;
      }
    } else if (!advancedMet) {
      summaryFa = 'برای فتح تاج قهرمانی: یک مرحله پیشرفته (مرحله ۳ یا ۴) از مهارت‌ها را به تسلط کامل برسان.';
    } else if (!xpMet) {
      summaryFa = `برای فتح تاج قهرمانی: فقط ${(this.REQUIRED_TOTAL_XP - totalXp).toLocaleString('fa-IR')} XP دیگر نیاز داری.`;
    } else {
      summaryFa = `برای فتح تاج قهرمانی: ${this.REQUIRED_BADGES - unlockedBadgesCount} نشان افتخار دیگر کسب کن.`;
    }

    return {
      isEligible,
      progressPercent,
      requirements,
      summaryFa,
      masteredTiersCount,
      distinctOperationsCount,
      advancedTiersCount,
    };
  }
}

/**
 * Smart Review Analyzer for Math Hero.
 * Aggregates historical quiz results, questions, mistakes, and response times
 * from IndexedDB into adaptive skill metrics and operational priorities.
 */

import { QuizResult, MistakeRecord, OperationType } from '../types';
import {
  SkillId,
  SkillPerformanceRecord,
  SmartReviewState,
  SmartReviewDataTier,
} from './smartReviewTypes';
import { ALL_SKILLS, classifyQuestionToSkill, calculateSkillConfidence } from './skillModel';
import { calculateReviewPriority } from './priorityCalculator';

export function analyzeSmartReview(
  results: QuizResult[],
  mistakes: MistakeRecord[],
  now: number = Date.now()
): SmartReviewState {
  const totalQuizzes = results.length;
  const unresolvedMistakes = mistakes.filter((m) => !m.resolved);

  // 1. Determine Data Tier
  let dataTier: SmartReviewDataTier = 'none';
  if (totalQuizzes >= 3) {
    dataTier = 'full';
  } else if (totalQuizzes >= 1 || mistakes.length > 0) {
    dataTier = 'limited';
  }

  const hasEnoughData = dataTier !== 'none';

  // 2. Initialize metrics for all known skills
  const metrics: Record<SkillId, SkillPerformanceRecord> = {} as any;
  for (const skill of ALL_SKILLS) {
    metrics[skill.id] = {
      skillId: skill.id,
      operation: skill.operation,
      titleFa: skill.titleFa,
      categoryFa: skill.categoryFa,
      totalAttempts: 0,
      correctCount: 0,
      mistakeCount: 0,
      consecutiveMistakes: 0,
      consecutiveCorrect: 0,
      successfulCorrections: 0,
      averageResponseTimeMs: 0,
      accuracyPercent: 0,
      confidence: 'developing',
      reviewPriority: 0,
      sampleMistakes: [],
    };
  }

  // If no data at all, return early with zeroed state
  if (!hasEnoughData) {
    return {
      totalQuizzesAnalyzed: 0,
      totalQuestionsAnalyzed: 0,
      hasEnoughData: false,
      dataTier: 'none',
      skillMetrics: metrics,
      operationWeights: { addition: 25, subtraction: 25, multiplication: 25, division: 25, mixed: 0 },
      targetSkills: [],
      headlineInsightFa: 'برای شروع مرور هوشمند، ابتدا یک یا دو آزمون را حل کن ⭐',
      subInsightFa: 'قهرمان ریاضی پس از حل آزمون‌ها یاد می‌گیرد چه چیزهایی نیاز به تمرین دارند.',
      unresolvedMistakeCount: 0,
    };
  }

  // 3. Process historical results chronologically
  const sortedResults = [...results].sort((a, b) => a.timestamp - b.timestamp);
  let totalQuestionsCount = 0;
  const skillResponseTimes: Record<SkillId, number[]> = {} as any;

  // Set of questions previously failed to detect successful corrections
  const previouslyFailedQuestions = new Set<string>();

  for (const res of sortedResults) {
    totalQuestionsCount += res.totalQuestions || 0;

    // Check mistake records from this result
    if (res.mistakes && res.mistakes.length > 0) {
      for (const m of res.mistakes) {
        const skillId = classifyQuestionToSkill(m.question);
        const record = metrics[skillId];
        if (record) {
          record.mistakeCount++;
          record.totalAttempts += m.attempts || 1;
          record.consecutiveMistakes++;
          record.consecutiveCorrect = 0;
          record.lastMistakeTimestamp = m.timestamp || res.timestamp;
          record.lastPracticedTimestamp = Math.max(record.lastPracticedTimestamp || 0, m.timestamp || res.timestamp);
          if (m.responseTimeMs) {
            skillResponseTimes[skillId] = skillResponseTimes[skillId] || [];
            skillResponseTimes[skillId].push(m.responseTimeMs);
          }
          if (record.sampleMistakes.length < 5) {
            record.sampleMistakes.push(m.question);
          }
          previouslyFailedQuestions.add(`${m.question.operation}:${m.question.num1}:${m.question.num2}`);
        }
      }
    }

    // Process approximate correct questions from overall operation
    if (res.correctCount > 0) {
      const op = res.operation;
      // Distribute correct counts among matching skills of this operation
      const matchingSkills = ALL_SKILLS.filter((s) => s.operation === op || op === 'mixed');
      const share = Math.max(1, Math.floor(res.correctCount / Math.max(1, matchingSkills.length)));

      for (const skill of matchingSkills) {
        const record = metrics[skill.id];
        if (record) {
          record.correctCount += share;
          record.totalAttempts += share;
          record.consecutiveCorrect += 1;
          record.consecutiveMistakes = Math.max(0, record.consecutiveMistakes - 1);
          record.lastCorrectTimestamp = res.timestamp;
          record.lastPracticedTimestamp = Math.max(record.lastPracticedTimestamp || 0, res.timestamp);

          // If there was a previous failure on this skill, credit a correction
          if (record.mistakeCount > 0) {
            record.successfulCorrections++;
          }
        }
      }
    }
  }

  // 4. Incorporate all unlinked/dedicated mistake records
  for (const m of mistakes) {
    const skillId = classifyQuestionToSkill(m.question);
    const record = metrics[skillId];
    if (record) {
      if (!record.sampleMistakes.some((q) => q.num1 === m.question.num1 && q.num2 === m.question.num2)) {
        record.sampleMistakes.push(m.question);
      }
    }
  }

  // 5. Finalize per-skill metrics (averages, accuracy, confidence, review priority)
  for (const skill of ALL_SKILLS) {
    const record = metrics[skill.id];
    const total = record.correctCount + record.mistakeCount;
    if (total > 0) {
      record.accuracyPercent = Math.round((record.correctCount / total) * 100);
    } else {
      record.accuracyPercent = 70; // neutral starting assumption
    }

    const times = skillResponseTimes[skill.id] || [];
    if (times.length > 0) {
      record.averageResponseTimeMs = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
    } else {
      record.averageResponseTimeMs = 4500;
    }

    record.confidence = calculateSkillConfidence(
      record.accuracyPercent,
      record.totalAttempts,
      record.consecutiveCorrect,
      record.consecutiveMistakes
    );

    record.reviewPriority = calculateReviewPriority(record, now);
  }

  // 6. Calculate Operation Weights Dynamically (NO manual percentages)
  // Aggregate priority by operation
  const opPrioritySums: Record<OperationType, number> = {
    addition: 0,
    subtraction: 0,
    multiplication: 0,
    division: 0,
    mixed: 0,
  };

  ALL_SKILLS.forEach((skill) => {
    const rec = metrics[skill.id];
    opPrioritySums[skill.operation] += rec.reviewPriority;
  });

  const coreOps: OperationType[] = ['addition', 'subtraction', 'multiplication', 'division'];
  const totalOpPriority = coreOps.reduce((sum, op) => sum + opPrioritySums[op], 0) || 1;

  const rawWeights: Record<OperationType, number> = {
    addition: 0,
    subtraction: 0,
    multiplication: 0,
    division: 0,
    mixed: 0,
  };

  // Safe distribution with minimum diversity (no operation exceeds 60% unless it's the sole weak one)
  coreOps.forEach((op) => {
    const share = (opPrioritySums[op] / totalOpPriority) * 100;
    rawWeights[op] = Math.max(10, Math.min(60, Math.round(share)));
  });

  // Normalize to 100%
  const currentTotal = coreOps.reduce((s, op) => s + rawWeights[op], 0);
  const diff = 100 - currentTotal;
  // Apply difference to highest priority operation
  const highestOp = [...coreOps].sort((a, b) => opPrioritySums[b] - opPrioritySums[a])[0];
  rawWeights[highestOp] = Math.max(10, rawWeights[highestOp] + diff);

  // 7. Rank Target Skills
  const rankedSkills = Object.values(metrics).sort((a, b) => b.reviewPriority - a.reviewPriority);
  const topTargetSkills = rankedSkills.slice(0, 5);

  // 8. Determine Weakest & Strongest Operations
  const sortedOps = [...coreOps].sort((a, b) => opPrioritySums[b] - opPrioritySums[a]);
  const weakestOp = sortedOps[0];
  const strongestOp = sortedOps[sortedOps.length - 1];

  // 9. Generate Child-Friendly Insight
  let headlineInsightFa = 'بیایید آنچه بیشتر نیاز داری را تمرین کنیم ⭐';
  let subInsightFa: string | undefined = undefined;

  const highestPrioritySkill = topTargetSkills[0];

  if (highestPrioritySkill && highestPrioritySkill.mistakeCount > 0) {
    if (highestPrioritySkill.operation === 'division') {
      headlineInsightFa = 'تقسیم نیاز به تمرین و توجه بیشتری دارد 🎯';
      subInsightFa = `مهارت «${highestPrioritySkill.titleFa}» را با هم تمرین می‌کنیم تا کاملاً مسلط شوی.`;
    } else if (highestPrioritySkill.operation === 'multiplication') {
      headlineInsightFa = 'بیا با هم مهارت‌های جدول ضرب را قوی‌تر کنیم! 🌟';
      subInsightFa = `تمرین روی «${highestPrioritySkill.titleFa}» برای سرعت و دقت بیشتر.`;
    } else if (highestPrioritySkill.operation === 'subtraction') {
      headlineInsightFa = 'تمرین تفریق برای سرعت محاسبات ذهنی 💪';
      subInsightFa = `تسلط بر «${highestPrioritySkill.titleFa}» با چند معمای جذاب.`;
    } else {
      headlineInsightFa = 'تقویت پایه‌های جمع و محاسبات سریع 🚀';
      subInsightFa = `چند معما برای تسلط روی «${highestPrioritySkill.titleFa}».`;
    }
  } else if (results.length >= 3) {
    headlineInsightFa = 'عملکرد شما عالی است! مهارت‌هایت را در اوج نگه دار 👑';
    subInsightFa = 'یک آزمون ترکیبی هوشمند برای حفظ آمادگی و سرعت ذهن.';
  }

  return {
    totalQuizzesAnalyzed: totalQuizzes,
    totalQuestionsAnalyzed: totalQuestionsCount,
    hasEnoughData,
    dataTier,
    skillMetrics: metrics,
    operationWeights: rawWeights,
    targetSkills: topTargetSkills,
    headlineInsightFa,
    subInsightFa,
    weakestOperation: weakestOp,
    strongestOperation: strongestOp,
    unresolvedMistakeCount: unresolvedMistakes.length,
  };
}

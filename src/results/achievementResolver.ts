/**
 * Achievement Resolver for Math Hero.
 * Checks completed quiz results and user progress to unlock achievements and track progression.
 */

import { Achievement, QuizResult, UserProfile } from '../types';
import { storage } from '../utils/storage';

export const ALL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_quiz',
    title: 'اولین قدم قهرمانی',
    description: 'اولین آزمون یا تمرین ریاضی خود را با موفقیت تمام کن',
    icon: '🌟',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: 'perfect_score',
    title: 'ذهن بی‌نقص',
    description: 'یک آزمون را با نمره ۱۰۰٪ و بدون هیچ غلطی به پایان برسان',
    icon: '🎯',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: 'correct_20',
    title: 'شکارچی پاسخ‌های درست',
    description: 'مجموعاً به ۲۰ سوال ریاضی پاسخ صحیح بده',
    icon: '⚡',
    unlocked: false,
    progress: 0,
    maxProgress: 20,
  },
  {
    id: 'multiplication_master',
    title: 'استاد جدول ضرب',
    description: 'یک آزمون ضرب را با نمره کامل ۱۰۰٪ سپری کن',
    icon: '✖️',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: 'level_3_hero',
    title: 'قهرمان پرانرژی',
    description: 'با کسب امتیاز XP به سطح ۳ ارتقا پیدا کن',
    icon: '🚀',
    unlocked: false,
    progress: 1,
    maxProgress: 3,
  },
  {
    id: 'level_5_hero',
    title: 'ستاره طلایی ریاضی',
    description: 'سطح ۵ قهرمان ریاضی را فتح کن',
    icon: '👑',
    unlocked: false,
    progress: 1,
    maxProgress: 5,
  },
  {
    id: 'smart_practicer',
    title: 'قهرمان خستگی‌ناپذیر',
    description: 'با تمرین روی اشتباهات، آمادگی خودت را افزایش بده',
    icon: '💡',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: 'fast_thinker',
    title: 'سریع و دقیق',
    description: 'یک آزمون ۱۰ سوالی یا بیشتر را با دقت بالای ۹۰٪ تمام کن',
    icon: '🏆',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
  },
];

export interface AchievementEvaluationResult {
  updatedAchievements: Achievement[];
  newlyUnlocked: Achievement[];
}

/**
 * Resolves all achievement statuses against the current quiz result, previous history, and user profile.
 */
export async function evaluateAchievements(
  result: QuizResult,
  profile: UserProfile,
  previousResultsCount: number = 0,
  totalCorrectAcrossHistory: number = 0
): Promise<AchievementEvaluationResult> {
  const existingList = await storage.getAchievements();

  // Merge with master template to guarantee full coverage
  const map = new Map<string, Achievement>();
  ALL_ACHIEVEMENTS.forEach((ach) => map.set(ach.id, { ...ach }));
  existingList.forEach((ach) => map.set(ach.id, { ...ach }));

  const newlyUnlocked: Achievement[] = [];
  const totalQuizzes = previousResultsCount + 1;
  const cumulativeCorrect = totalCorrectAcrossHistory + result.correctCount;

  map.forEach((ach, id) => {
    const wasUnlocked = ach.unlocked;

    switch (id) {
      case 'first_quiz':
        ach.progress = Math.min(ach.maxProgress, totalQuizzes);
        if (totalQuizzes >= 1) ach.unlocked = true;
        break;

      case 'perfect_score':
        if (result.score === 100 && result.totalQuestions >= 5) {
          ach.progress = 1;
          ach.unlocked = true;
        }
        break;

      case 'correct_20':
        ach.progress = Math.min(ach.maxProgress, cumulativeCorrect);
        if (cumulativeCorrect >= 20) ach.unlocked = true;
        break;

      case 'multiplication_master':
        if (
          (result.operation === 'multiplication' || (result.config?.selectedOperations?.includes('multiplication') && result.config.selectedOperations.length === 1)) &&
          result.score === 100 &&
          result.totalQuestions >= 5
        ) {
          ach.progress = 1;
          ach.unlocked = true;
        }
        break;

      case 'level_3_hero':
        ach.progress = Math.min(ach.maxProgress, profile.level);
        if (profile.level >= 3) ach.unlocked = true;
        break;

      case 'level_5_hero':
        ach.progress = Math.min(ach.maxProgress, profile.level);
        if (profile.level >= 5) ach.unlocked = true;
        break;

      case 'smart_practicer':
        if (result.presetId === 'mistakes_review' || result.mode === 'practice') {
          ach.progress = 1;
          ach.unlocked = true;
        }
        break;

      case 'fast_thinker':
        if (result.score >= 90 && result.totalQuestions >= 10) {
          ach.progress = 1;
          ach.unlocked = true;
        }
        break;

      default:
        break;
    }

    if (!wasUnlocked && ach.unlocked) {
      ach.unlockedAt = Date.now();
      newlyUnlocked.push(ach);
    }
  });

  const updatedAchievements = Array.from(map.values());
  await storage.saveAchievements(updatedAchievements);

  return {
    updatedAchievements,
    newlyUnlocked,
  };
}

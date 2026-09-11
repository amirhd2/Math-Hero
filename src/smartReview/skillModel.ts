/**
 * Skill Model for Math Hero Smart Review.
 * Classifies arithmetic questions into granular skills and defines learning taxonomy.
 */

import { QuizQuestion } from '../types';
import { SkillDefinition, SkillId, SkillConfidence } from './smartReviewTypes';

export const ALL_SKILLS: SkillDefinition[] = [
  // Addition
  {
    id: 'add_single',
    operation: 'addition',
    titleFa: 'جمع اعداد یک‌رقمی',
    categoryFa: 'جمع پایه',
    descriptionFa: 'جمع ساده اعداد زیر ۱۰ برای تقویت محاسبات سریع ذهنی',
    icon: '➕',
  },
  {
    id: 'add_double_single',
    operation: 'addition',
    titleFa: 'جمع دو‌رقمی با یک‌رقمی',
    categoryFa: 'جمع پیشرفته',
    descriptionFa: 'افزودن عدد یک‌رقمی به عدد دورقمی و درک ارزش مکانی',
    icon: '➕',
  },
  {
    id: 'add_double_double',
    operation: 'addition',
    titleFa: 'جمع دو‌رقمی با دو‌رقمی',
    categoryFa: 'جمع مهارت کامل',
    descriptionFa: 'جمع ستونی و انتقالی اعداد دورقمی با تسلط بر ده‌گان',
    icon: '➕',
  },
  {
    id: 'add_multi_digit',
    operation: 'addition',
    titleFa: 'جمع اعداد چندرقمی',
    categoryFa: 'جمع پیشرفته',
    descriptionFa: 'محاسبه جمع اعداد بزرگ سه‌رقمی و بالاتر',
    icon: '➕',
  },

  // Subtraction
  {
    id: 'sub_single',
    operation: 'subtraction',
    titleFa: 'تفریق اعداد یک‌رقمی',
    categoryFa: 'تفریق پایه',
    descriptionFa: 'کم کردن سریع اعداد کوچک و تثبیت درک تفریق',
    icon: '➖',
  },
  {
    id: 'sub_double_single',
    operation: 'subtraction',
    titleFa: 'تفریق یک‌رقمی از دو‌رقمی',
    categoryFa: 'تفریق میانی',
    descriptionFa: 'تفریق‌های سرعتی با عبور از ده‌تایی‌ها',
    icon: '➖',
  },
  {
    id: 'sub_double_double',
    operation: 'subtraction',
    titleFa: 'تفریق دو‌رقمی از دو‌رقمی',
    categoryFa: 'تفریق کامل',
    descriptionFa: 'تفریق اعداد دورقمی با مفهوم قرض گرفتن از ده‌گان',
    icon: '➖',
  },
  {
    id: 'sub_multi_digit',
    operation: 'subtraction',
    titleFa: 'تفریق اعداد چندرقمی',
    categoryFa: 'تفریق پیشرفته',
    descriptionFa: 'تفریق اعداد بزرگ با چندین مرتبه قرض گرفتن',
    icon: '➖',
  },

  // Multiplication
  {
    id: 'mul_table_low',
    operation: 'multiplication',
    titleFa: 'جدول ضرب ۱ تا ۵',
    categoryFa: 'ضرب پایه',
    descriptionFa: 'تثبیت جدول ضرب‌های ۲ و ۳ و ۴ و ۵',
    icon: '✖️',
  },
  {
    id: 'mul_table_mid',
    operation: 'multiplication',
    titleFa: 'جدول ضرب ۶ و ۷',
    categoryFa: 'ضرب میانی',
    descriptionFa: 'تمرین بر جدول‌های ضرب ۶ و ۷ و روابط بین آن‌ها',
    icon: '✖️',
  },
  {
    id: 'mul_table_high',
    operation: 'multiplication',
    titleFa: 'جدول ضرب ۸ و ۹ (ترکیب‌های چالش‌دار)',
    categoryFa: 'ضرب حساس',
    descriptionFa: 'ترکیب‌های پرچالش ضرب نظیر ۷×۸، ۸×۹ و ۶×۸',
    icon: '✖️',
  },
  {
    id: 'mul_table_10_12',
    operation: 'multiplication',
    titleFa: 'جدول ضرب ۱۰ تا ۱۲',
    categoryFa: 'ضرب پیشرفته',
    descriptionFa: 'ضرب اعداد در ۱۰، ۱۱ و ۱۲ با الگوهای میان‌بر ذهنی',
    icon: '✖️',
  },
  {
    id: 'mul_multi_digit',
    operation: 'multiplication',
    titleFa: 'ضرب اعداد چندرقمی',
    categoryFa: 'ضرب جامع',
    descriptionFa: 'ضرب اعداد دورقمی و بزرگ‌تر با الگوریتم گسترده',
    icon: '✖️',
  },

  // Division
  {
    id: 'div_exact_low',
    operation: 'division',
    titleFa: 'تقسیم دقیق پایه‌های ۲ تا ۵',
    categoryFa: 'تقسیم پایه',
    descriptionFa: 'تقسیم‌های دقیق با مقسوم‌علیه ۲، ۳، ۴ و ۵',
    icon: '➗',
  },
  {
    id: 'div_exact_high',
    operation: 'division',
    titleFa: 'تقسیم دقیق جدول‌های ۶ تا ۹',
    categoryFa: 'تقسیم میانی',
    descriptionFa: 'رابطه معکوس ضرب و تقسیم جدول‌های بزرگ‌تر',
    icon: '➗',
  },
  {
    id: 'div_table_10_12',
    operation: 'division',
    titleFa: 'تقسیم بر ۱۰ تا ۱۲',
    categoryFa: 'تقسیم پیشرفته',
    descriptionFa: 'تقسیم بر ۱۰ و اعداد بزرگ‌تر بدون باقیمانده',
    icon: '➗',
  },
  {
    id: 'div_with_remainder',
    operation: 'division',
    titleFa: 'تقسیم با باقیمانده',
    categoryFa: 'تقسیم مفهومی',
    descriptionFa: 'یافتن خارج‌قسمت و باقیمانده در تقسیم‌های غیردقیق',
    icon: '➗',
  },
];

export const SKILL_MAP: Record<SkillId, SkillDefinition> = ALL_SKILLS.reduce(
  (acc, skill) => {
    acc[skill.id] = skill;
    return acc;
  },
  {} as Record<SkillId, SkillDefinition>
);

export function getSkillDefinition(skillId: SkillId): SkillDefinition {
  return (
    SKILL_MAP[skillId] || {
      id: skillId,
      operation: 'addition',
      titleFa: 'مهارت ریاضی',
      categoryFa: 'محاسبات',
      descriptionFa: 'تمرین و تقویت ریاضی',
      icon: '⭐',
    }
  );
}

/**
 * Classifies any mathematical question into its corresponding skill bucket.
 */
export function classifyQuestionToSkill(question: QuizQuestion): SkillId {
  const { operation, num1, num2, remainder } = question;

  if (operation === 'addition') {
    if (num1 < 10 && num2 < 10) return 'add_single';
    if ((num1 < 100 && num2 < 10) || (num2 < 100 && num1 < 10)) return 'add_double_single';
    if (num1 < 100 && num2 < 100) return 'add_double_double';
    return 'add_multi_digit';
  }

  if (operation === 'subtraction') {
    if (num1 < 10 && num2 < 10) return 'sub_single';
    if (num1 < 100 && num2 < 10) return 'sub_double_single';
    if (num1 < 100 && num2 < 100) return 'sub_double_double';
    return 'sub_multi_digit';
  }

  if (operation === 'multiplication') {
    const minFactor = Math.min(num1, num2);
    const maxFactor = Math.max(num1, num2);

    if (maxFactor > 12) return 'mul_multi_digit';
    if (maxFactor >= 10) return 'mul_table_10_12';
    if (maxFactor >= 8 || minFactor >= 8) return 'mul_table_high';
    if (maxFactor >= 6 || minFactor >= 6) return 'mul_table_mid';
    return 'mul_table_low';
  }

  if (operation === 'division') {
    if (remainder && remainder > 0) return 'div_with_remainder';
    const divisor = num2;
    if (divisor >= 10 && divisor <= 12) return 'div_table_10_12';
    if (divisor >= 6 && divisor <= 9) return 'div_exact_high';
    return 'div_exact_low';
  }

  return 'add_single';
}

/**
 * Calculates confidence level based on accuracy and recent streaks.
 */
export function calculateSkillConfidence(
  accuracyPercent: number,
  totalAttempts: number,
  consecutiveCorrect: number,
  consecutiveMistakes: number
): SkillConfidence {
  if (totalAttempts === 0) return 'developing';

  if (consecutiveMistakes >= 2 || accuracyPercent < 55) {
    return 'needs_support';
  }

  if (accuracyPercent >= 90 && consecutiveCorrect >= 3 && totalAttempts >= 4) {
    return 'mastered';
  }

  if (accuracyPercent >= 75 && totalAttempts >= 2) {
    return 'strong';
  }

  return 'developing';
}

export function getConfidenceBadge(confidence: SkillConfidence): {
  labelFa: string;
  badgeBg: string;
  badgeText: string;
  icon: string;
} {
  switch (confidence) {
    case 'mastered':
      return {
        labelFa: 'تسلط کامل',
        badgeBg: 'bg-emerald-100 dark:bg-emerald-950/60',
        badgeText: 'text-emerald-700 dark:text-emerald-300',
        icon: '👑',
      };
    case 'strong':
      return {
        labelFa: 'قوی و مسلط',
        badgeBg: 'bg-indigo-100 dark:bg-indigo-950/60',
        badgeText: 'text-indigo-700 dark:text-indigo-300',
        icon: '💪',
      };
    case 'developing':
      return {
        labelFa: 'در حال رشد',
        badgeBg: 'bg-amber-100 dark:bg-amber-950/60',
        badgeText: 'text-amber-800 dark:text-amber-300',
        icon: '🌱',
      };
    case 'needs_support':
    default:
      return {
        labelFa: 'نیاز به تمرین',
        badgeBg: 'bg-rose-100 dark:bg-rose-950/60',
        badgeText: 'text-rose-700 dark:text-rose-300',
        icon: '🎯',
      };
  }
}

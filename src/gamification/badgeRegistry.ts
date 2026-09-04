/**
 * Centralized Badge Registry for Math Hero.
 * Defines all 35 data-driven Badges across the 7 core categories:
 * Practice, Accuracy, Improvement, Operations, Streak, Smart Review, and Mastery.
 */

import { Badge } from './gamificationTypes';

export const BADGE_REGISTRY: Badge[] = [
  // ==========================================
  // 1. PRACTICE (تداوم و تمرین)
  // ==========================================
  {
    id: 'first_step',
    name: 'اولین قدم قهرمانی',
    description: 'تکمیل اولین آزمون ریاضی و شروع سفر ماجراجویی',
    category: 'practice',
    icon: '🌱',
    rarity: 'common',
    xpReward: 30,
    requirement: {
      type: 'quizzes_count',
      target: 1,
      descriptionFa: '۱ آزمون کامل کن',
    },
  },
  {
    id: 'practice_5',
    name: 'هم‌مسیر ریاضی',
    description: 'تکمیل ۵ آزمون ریاضی با اراده و پشتکار عالی',
    category: 'practice',
    icon: '🚶‍♂️',
    rarity: 'common',
    xpReward: 50,
    requirement: {
      type: 'quizzes_count',
      target: 5,
      descriptionFa: '۵ آزمون کامل کن',
    },
  },
  {
    id: 'practice_15',
    name: 'دوستدار یادگیری',
    description: 'تکمیل ۱۵ آزمون ریاضی؛ تمرین مداوم کلید موفقیت است',
    category: 'practice',
    icon: '📚',
    rarity: 'rare',
    xpReward: 80,
    requirement: {
      type: 'quizzes_count',
      target: 15,
      descriptionFa: '۱۵ آزمون کامل کن',
    },
  },
  {
    id: 'practice_30',
    name: 'قهرمان خستگی‌ناپذیر',
    description: 'تکمیل ۳۰ چالش محاسباتی؛ تو یک قهرمان واقعی هستی',
    category: 'practice',
    icon: '⚡',
    rarity: 'epic',
    xpReward: 150,
    requirement: {
      type: 'quizzes_count',
      target: 30,
      descriptionFa: '۳۰ آزمون کامل کن',
    },
  },
  {
    id: 'practice_50',
    name: 'افسانه تمرین',
    description: '۵۰ آزمون کامل شده؛ نام تو در تاریخ قهرمانان ثبت شد',
    category: 'practice',
    icon: '🌟',
    rarity: 'legendary',
    xpReward: 250,
    requirement: {
      type: 'quizzes_count',
      target: 50,
      descriptionFa: '۵۰ آزمون کامل کن',
    },
  },

  // ==========================================
  // 2. ACCURACY (دقت و تمرکز)
  // ==========================================
  {
    id: 'first_perfect',
    name: 'ذهن تیزبین',
    description: 'کسب نمره کامل ۱۰۰٪ در یک آزمون بدون حتی یک اشتباه',
    category: 'accuracy',
    icon: '🎯',
    rarity: 'common',
    xpReward: 50,
    requirement: {
      type: 'perfect_quizzes',
      target: 1,
      minQuestions: 5,
      descriptionFa: 'یک آزمون ۵ سوالی را با نمره ۱۰۰٪ حل کن',
    },
  },
  {
    id: 'perfect_5',
    name: 'پنج ستاره طلایی',
    description: 'کسب نمره ۱۰۰٪ در ۵ آزمون مختلف؛ دقت بی‌نظیر!',
    category: 'accuracy',
    icon: '⭐',
    rarity: 'rare',
    xpReward: 100,
    requirement: {
      type: 'perfect_quizzes',
      target: 5,
      minQuestions: 5,
      descriptionFa: '۵ آزمون با نمره ۱۰۰٪ داشته باش',
    },
  },
  {
    id: 'perfect_10',
    name: 'استاد بی‌خطا',
    description: 'کسب نمره ۱۰۰٪ در ۱۰ آزمون؛ تمرکز فوق‌العاده قهرمان',
    category: 'accuracy',
    icon: '💎',
    rarity: 'epic',
    xpReward: 180,
    requirement: {
      type: 'perfect_quizzes',
      target: 10,
      minQuestions: 5,
      descriptionFa: '۱۰ آزمون با نمره ۱۰۰٪ داشته باش',
    },
  },
  {
    id: 'correct_20',
    name: 'بیست بیست',
    description: 'پاسخ درست به ۲۰ سوال ریاضی در طول تمرین‌ها',
    category: 'accuracy',
    icon: '✍️',
    rarity: 'common',
    xpReward: 40,
    requirement: {
      type: 'correct_answers',
      target: 20,
      descriptionFa: 'به ۲۰ سوال درست پاسخ بده',
    },
  },
  {
    id: 'correct_100',
    name: 'باشگاه صدتایی‌ها',
    description: 'رسیدن به ۱۰۰ پاسخ درست؛ محاسبات در دستان توست',
    category: 'accuracy',
    icon: '💯',
    rarity: 'rare',
    xpReward: 100,
    requirement: {
      type: 'correct_answers',
      target: 100,
      descriptionFa: 'به ۱۰۰ سوال درست پاسخ بده',
    },
  },
  {
    id: 'correct_300',
    name: 'شکارچی معماها',
    description: 'حل صحیح ۳۰۰ سوال ریاضی با افتخار',
    category: 'accuracy',
    icon: '🏹',
    rarity: 'epic',
    xpReward: 160,
    requirement: {
      type: 'correct_answers',
      target: 300,
      descriptionFa: 'به ۳۰۰ سوال درست پاسخ بده',
    },
  },
  {
    id: 'correct_500',
    name: 'گنجینه دانش',
    description: 'پاسخ صحیح به ۵۰۰ معما؛ تسلط کامل بر جهان اعداد',
    category: 'accuracy',
    icon: '🏰',
    rarity: 'legendary',
    xpReward: 250,
    requirement: {
      type: 'correct_answers',
      target: 500,
      descriptionFa: 'به ۵۰۰ سوال درست پاسخ بده',
    },
  },

  // ==========================================
  // 3. IMPROVEMENT (پیشرفت و یادگیری)
  // ==========================================
  {
    id: 'comeback_kid',
    name: 'بازگشت طلایی',
    description: 'پیشرفت چشمگیر و افزایش حداقل ۲۰٪ دقت نسبت به آزمون قبلی',
    category: 'improvement',
    icon: '🚀',
    rarity: 'rare',
    xpReward: 70,
    requirement: {
      type: 'comeback_improvement',
      target: 20,
      descriptionFa: 'دقتت رو حداقل ۲۰٪ نسبت به آزمون قبل ارتقا بده',
    },
  },
  {
    id: 'getting_stronger',
    name: 'روزبه‌روز قوی‌تر',
    description: '۳ آزمون متوالی با ارتقای نمره یا حفظ دقت بالای ۸۵٪',
    category: 'improvement',
    icon: '💪',
    rarity: 'rare',
    xpReward: 80,
    requirement: {
      type: 'getting_stronger',
      target: 3,
      descriptionFa: '۳ آزمون پشت‌سرهم با نمره عالی یا رو‌به‌رشد ثبت کن',
    },
  },
  {
    id: 'never_give_up',
    name: 'پشتکار قهرمانانه',
    description: 'تمرین دوباره روی سوالات اشتباه و حل موفقیت‌آمیز آن‌ها',
    category: 'improvement',
    icon: '🛡️',
    rarity: 'common',
    xpReward: 50,
    requirement: {
      type: 'resolve_mistakes',
      target: 3,
      descriptionFa: '۳ سوال از گنجینه اشتباهاتت رو با تمرین درست حل کن',
    },
  },

  // ==========================================
  // 4. OPERATIONS (چهار عمل اصلی ریاضی)
  // ==========================================
  // Addition
  {
    id: 'add_starter',
    name: 'شروع با جمع',
    description: 'حل صحیح ۱۵ سوال عمل جمع و ساخت پایه‌های محکم',
    category: 'operations',
    icon: '➕',
    rarity: 'common',
    xpReward: 35,
    requirement: {
      type: 'operation_correct',
      target: 15,
      operation: 'addition',
      descriptionFa: '۱۵ پاسخ درست در عمل جمع ثبت کن',
    },
  },
  {
    id: 'add_pro',
    name: 'حرفه‌ای جمع',
    description: 'حل ۵۰ سوال جمع با دقت بالای ۸۰٪',
    category: 'operations',
    icon: '🟢',
    rarity: 'rare',
    xpReward: 85,
    requirement: {
      type: 'operation_mastery',
      target: 50,
      minAccuracy: 80,
      operation: 'addition',
      descriptionFa: '۵۰ سوال جمع با دقت ۸۰٪ حل کن',
    },
  },
  {
    id: 'add_master',
    name: 'استاد جمع پیشرفته',
    description: 'تسلط کامل و پایدار بر عمل جمع با بیش از ۱۰۰ پاسخ درست',
    category: 'operations',
    icon: '✨',
    rarity: 'epic',
    xpReward: 160,
    requirement: {
      type: 'operation_mastery',
      target: 100,
      minAccuracy: 90,
      operation: 'addition',
      descriptionFa: '۱۰۰ سوال جمع با دقت ۹۰٪ حل کن',
    },
  },

  // Subtraction
  {
    id: 'sub_starter',
    name: 'شروع با تفریق',
    description: 'حل صحیح ۱۵ سوال تفریق و تسلط بر کم کردن اعداد',
    category: 'operations',
    icon: '➖',
    rarity: 'common',
    xpReward: 35,
    requirement: {
      type: 'operation_correct',
      target: 15,
      operation: 'subtraction',
      descriptionFa: '۱۵ پاسخ درست در عمل تفریق ثبت کن',
    },
  },
  {
    id: 'sub_pro',
    name: 'حرفه‌ای تفریق',
    description: 'حل ۵۰ سوال تفریق با دقت بالای ۸۰٪',
    category: 'operations',
    icon: '🔵',
    rarity: 'rare',
    xpReward: 85,
    requirement: {
      type: 'operation_mastery',
      target: 50,
      minAccuracy: 80,
      operation: 'subtraction',
      descriptionFa: '۵۰ سوال تفریق با دقت ۸۰٪ حل کن',
    },
  },
  {
    id: 'sub_master',
    name: 'استاد تفریق پیشرفته',
    description: 'تسلط کامل بر تفریق با بیش از ۱۰۰ پاسخ درست و دقیق',
    category: 'operations',
    icon: '🔷',
    rarity: 'epic',
    xpReward: 160,
    requirement: {
      type: 'operation_mastery',
      target: 100,
      minAccuracy: 90,
      operation: 'subtraction',
      descriptionFa: '۱۰۰ سوال تفریق با دقت ۹۰٪ حل کن',
    },
  },

  // Multiplication
  {
    id: 'mul_starter',
    name: 'شروع با ضرب',
    description: 'حل صحیح ۱۵ سوال جدول ضرب و کشف الگوی شگفت‌انگیز اعداد',
    category: 'operations',
    icon: '✖️',
    rarity: 'common',
    xpReward: 40,
    requirement: {
      type: 'operation_correct',
      target: 15,
      operation: 'multiplication',
      descriptionFa: '۱۵ پاسخ درست در عمل ضرب ثبت کن',
    },
  },
  {
    id: 'mul_pro',
    name: 'حرفه‌ای جدول ضرب',
    description: 'حل ۵۰ سوال ضرب با دقت بالای ۸۰٪ بدون مکث',
    category: 'operations',
    icon: '🟡',
    rarity: 'rare',
    xpReward: 90,
    requirement: {
      type: 'operation_mastery',
      target: 50,
      minAccuracy: 80,
      operation: 'multiplication',
      descriptionFa: '۵۰ سوال ضرب با دقت ۸۰٪ حل کن',
    },
  },
  {
    id: 'mul_master',
    name: 'استاد بی‌رقیب ضرب',
    description: 'تسلط برق‌آسا بر جدول ضرب با ۱۰۰ پاسخ درست و دقیق',
    category: 'operations',
    icon: '👑',
    rarity: 'epic',
    xpReward: 170,
    requirement: {
      type: 'operation_mastery',
      target: 100,
      minAccuracy: 90,
      operation: 'multiplication',
      descriptionFa: '۱۰۰ سوال ضرب با دقت ۹۰٪ حل کن',
    },
  },

  // Division
  {
    id: 'div_starter',
    name: 'شروع با تقسیم',
    description: 'حل صحیح ۱۵ سوال تقسیم عادلانه و بخش‌پذیری',
    category: 'operations',
    icon: '➗',
    rarity: 'common',
    xpReward: 40,
    requirement: {
      type: 'operation_correct',
      target: 15,
      operation: 'division',
      descriptionFa: '۱۵ پاسخ درست در عمل تقسیم ثبت کن',
    },
  },
  {
    id: 'div_pro',
    name: 'حرفه‌ای تقسیم',
    description: 'حل ۵۰ سوال تقسیم با دقت بالای ۸۰٪',
    category: 'operations',
    icon: '🟣',
    rarity: 'rare',
    xpReward: 90,
    requirement: {
      type: 'operation_mastery',
      target: 50,
      minAccuracy: 80,
      operation: 'division',
      descriptionFa: '۵۰ سوال تقسیم با دقت ۸۰٪ حل کن',
    },
  },
  {
    id: 'div_master',
    name: 'استاد تقسیم عادلانه',
    description: 'تسلط بی‌نقص بر تقسیم اعداد با بیش از ۱۰۰ پاسخ درست',
    category: 'operations',
    icon: '🔮',
    rarity: 'epic',
    xpReward: 170,
    requirement: {
      type: 'operation_mastery',
      target: 100,
      minAccuracy: 90,
      operation: 'division',
      descriptionFa: '۱۰۰ سوال تقسیم با دقت ۹۰٪ حل کن',
    },
  },

  // ==========================================
  // 5. STREAK (زنجیره تمرین روزانه)
  // ==========================================
  {
    id: 'streak_3',
    name: '۳ روز با ریاضی',
    description: '۳ روز متوالی تمرین ریاضی؛ اراده عالی برای شروع',
    category: 'streak',
    icon: '🔥',
    rarity: 'common',
    xpReward: 45,
    requirement: {
      type: 'streak_days',
      target: 3,
      descriptionFa: '۳ روز متوالی تمرین کن',
    },
  },
  {
    id: 'streak_7',
    name: 'یک هفته طلایی',
    description: '۷ روز پیوسته تمرین؛ تبدیل ریاضی به عادتی لذت‌بخش',
    category: 'streak',
    icon: '🌟',
    rarity: 'rare',
    xpReward: 90,
    requirement: {
      type: 'streak_days',
      target: 7,
      descriptionFa: '۷ روز متوالی تمرین کن',
    },
  },
  {
    id: 'streak_14',
    name: 'دو هفته اراده',
    description: '۱۴ روز زنجیره تمرین بدون وقفه؛ پشتکار تحسین‌برانگیز',
    category: 'streak',
    icon: '🏆',
    rarity: 'epic',
    xpReward: 160,
    requirement: {
      type: 'streak_days',
      target: 14,
      descriptionFa: '۱۴ روز متوالی تمرین کن',
    },
  },
  {
    id: 'streak_30',
    name: 'یک ماه قهرمانی',
    description: '۳۰ روز تمرین پیوسته؛ وفاداری به مسیر رشد دانایی',
    category: 'streak',
    icon: '👑',
    rarity: 'legendary',
    xpReward: 300,
    requirement: {
      type: 'streak_days',
      target: 30,
      descriptionFa: '۳۰ روز متوالی تمرین کن',
    },
  },

  // ==========================================
  // 6. SMART REVIEW (مرور هوشمند و یادگیری هدفمند)
  // ==========================================
  {
    id: 'smart_first',
    name: 'اولین گام هوشمند',
    description: 'تکمیل اولین جلسه مرور هوشمند و تمرین روی نقاط نیازمند تمرین',
    category: 'smartReview',
    icon: '🧠',
    rarity: 'common',
    xpReward: 40,
    requirement: {
      type: 'smart_review_count',
      target: 1,
      descriptionFa: 'یک جلسه آزمون مرور هوشمند را تمام کن',
    },
  },
  {
    id: 'smart_reviewer',
    name: 'کاشف نقاط عطف',
    description: 'تکمیل ۵ آزمون مرور هوشمند و تقویت هدفمند مهارت‌ها',
    category: 'smartReview',
    icon: '🔍',
    rarity: 'rare',
    xpReward: 85,
    requirement: {
      type: 'smart_review_count',
      target: 5,
      descriptionFa: '۵ آزمون مرور هوشمند را تمام کن',
    },
  },
  {
    id: 'smart_champion',
    name: 'قهرمان یادگیری هدفمند',
    description: 'تکمیل ۱۵ جلسه مرور هوشمند با ارتقای چشمگیر تسلط',
    category: 'smartReview',
    icon: '🎖️',
    rarity: 'epic',
    xpReward: 180,
    requirement: {
      type: 'smart_review_count',
      target: 15,
      descriptionFa: '۱۵ جلسه مرور هوشمند را تمام کن',
    },
  },

  // ==========================================
  // 7. MASTERY (استادی و قهرمان ریاضی)
  // ==========================================
  {
    id: 'all_round_hero',
    name: 'همه‌فن‌حریف',
    description: 'تمرین در هر ۴ عملیات اصلی جمع، تفریق، ضرب و تقسیم',
    category: 'mastery',
    icon: '🌈',
    rarity: 'rare',
    xpReward: 75,
    requirement: {
      type: 'all_operations_tried',
      target: 4,
      descriptionFa: 'در هر ۴ عملیات ریاضی حداقل یک آزمون ثبت کن',
    },
  },
  {
    id: 'speed_accuracy',
    name: 'سریع و تیزبین',
    description: 'تکمیل یک آزمون حداقل ۱۰ سوالی با دقت بالای ۹۰٪',
    category: 'mastery',
    icon: '⚡',
    rarity: 'rare',
    xpReward: 80,
    requirement: {
      type: 'fast_accurate_quiz',
      target: 10,
      minAccuracy: 90,
      descriptionFa: 'یک آزمون ۱۰ سوالی با دقت ۹۰٪ یا بیشتر کامل کن',
    },
  },
  {
    id: 'level_5_milestone',
    name: 'ستاره سطح ۵',
    description: 'رسیدن به سطح ۵ قهرمانی و ارتقای چشمگیر مهارت‌ها',
    category: 'mastery',
    icon: '🥇',
    rarity: 'rare',
    xpReward: 90,
    requirement: {
      type: 'level_reached',
      target: 5,
      descriptionFa: 'به سطح ۵ قهرمانی برس',
    },
  },
  {
    id: 'level_10_milestone',
    name: 'پیشتاز سطح ۱۰',
    description: 'رسیدن به سطح ۱۰ قهرمانی با تجربه فراوان در حل مسئله',
    category: 'mastery',
    icon: '🎖️',
    rarity: 'epic',
    xpReward: 180,
    requirement: {
      type: 'level_reached',
      target: 10,
      descriptionFa: 'به سطح ۱۰ قهرمانی برس',
    },
  },
  {
    id: 'math_hero_grand',
    name: 'قهرمان قهرمانان ریاضی',
    description: 'تاج زرین قهرمانی ریاضی: رسیدن به سطح ۱۵ و کسب حداقل ۱۵ نشان افتخار!',
    category: 'mastery',
    icon: '👑',
    rarity: 'legendary',
    xpReward: 500,
    requirement: {
      type: 'math_hero_grand',
      target: 15,
      descriptionFa: 'به سطح ۱۵ برس و حداقل ۱۵ نشان افتخار باز کن',
    },
  },
];

export function getBadgeById(id: string): Badge | undefined {
  return BADGE_REGISTRY.find((b) => b.id === id);
}

export function getBadgesByCategory(category: string): Badge[] {
  if (category === 'all') return BADGE_REGISTRY;
  return BADGE_REGISTRY.filter((b) => b.category === category);
}

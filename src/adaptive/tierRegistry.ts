/**
 * Centralized Educational Difficulty Ladder & Skill Tier Registry for Math Hero.
 * Configurable, mathematical progression per operation:
 * Tier 1: Foundational (Single-digit arithmetic, basic facts)
 * Tier 2: Two-digit with one-digit / related structures
 * Tier 3: Two-digit with two-digit / related structures
 * Tier 4: Advanced multi-digit / complex structures
 */

import { OperationType } from '../types';
import { SkillId } from '../smartReview/smartReviewTypes';
import { SkillTierDefinition } from './adaptiveTypes';

export const SKILL_TIERS: Record<OperationType, SkillTierDefinition[]> = {
  addition: [
    {
      tier: 1,
      skillId: 'add_single',
      operation: 'addition',
      titleFa: 'جمع اعداد یک‌رقمی (پایه)',
      stageNameFa: 'مرحله ۱: جمع یک‌رقمی',
      categoryFa: 'پایه',
      descriptionFa: 'جمع اعداد ۱ تا ۹ برای تسلط بر حقایق پایه ریاضی',
      sampleExamplesFa: '۲ + ۵، ۴ + ۳',
      pedagogicalGoalFa: 'تقویت محاسبات سریع ذهنی زیر ۱۰',
    },
    {
      tier: 2,
      skillId: 'add_double_single',
      operation: 'addition',
      titleFa: 'جمع دو‌رقمی با یک‌رقمی',
      stageNameFa: 'مرحله ۲: دو‌رقمی در یک‌رقمی',
      categoryFa: 'میانی',
      descriptionFa: 'افزودن عدد یک‌رقمی به دورقمی با درک ارزش مکانی',
      sampleExamplesFa: '۲۳ + ۵، ۴۷ + ۶',
      pedagogicalGoalFa: 'انتقال ذهنی یکان به دهگان',
    },
    {
      tier: 3,
      skillId: 'add_double_double',
      operation: 'addition',
      titleFa: 'جمع دو‌رقمی با دو‌رقمی',
      stageNameFa: 'مرحله ۳: دو‌رقمی در دو‌رقمی',
      categoryFa: 'پیشرفته',
      descriptionFa: 'جمع ستونی و انتقالی اعداد دورقمی با تسلط بر دهگان',
      sampleExamplesFa: '۲۴ + ۳۷، ۵۸ + ۲۶',
      pedagogicalGoalFa: 'تسلط کامل بر جمع ستونی و انتقال یکان',
    },
    {
      tier: 4,
      skillId: 'add_multi_digit',
      operation: 'addition',
      titleFa: 'جمع اعداد چندرقمی و بزرگ',
      stageNameFa: 'مرحله ۴: جمع چندرقمی',
      categoryFa: 'استادی',
      descriptionFa: 'جمع اعداد سه‌رقمی و بالاتر با چند انتقال',
      sampleExamplesFa: '۲۳۴ + ۱۲۸، ۵۱۲ + ۳۴۵',
      pedagogicalGoalFa: 'حل مسائل بزرگ‌تر ریاضی بدون خطا',
    },
  ],

  subtraction: [
    {
      tier: 1,
      skillId: 'sub_single',
      operation: 'subtraction',
      titleFa: 'تفریق اعداد یک‌رقمی (پایه)',
      stageNameFa: 'مرحله ۱: تفریق یک‌رقمی',
      categoryFa: 'پایه',
      descriptionFa: 'کم کردن اعداد زیر ۱۰ و درک مفهوم کاهش',
      sampleExamplesFa: '۸ - ۳، ۹ - ۴',
      pedagogicalGoalFa: 'تثبیت حقایق پایه تفریق',
    },
    {
      tier: 2,
      skillId: 'sub_double_single',
      operation: 'subtraction',
      titleFa: 'تفریق یک‌رقمی از دو‌رقمی',
      stageNameFa: 'مرحله ۲: تفریق از دو‌رقمی',
      categoryFa: 'میانی',
      descriptionFa: 'کاستن عدد یک‌رقمی از دورقمی با عبور از ده‌تایی‌ها',
      sampleExamplesFa: '۴۷ - ۶، ۳۲ - ۵',
      pedagogicalGoalFa: 'یادگیری قرض گرفتن ساده از دهگان',
    },
    {
      tier: 3,
      skillId: 'sub_double_double',
      operation: 'subtraction',
      titleFa: 'تفریق دو‌رقمی از دو‌رقمی',
      stageNameFa: 'مرحله ۳: دو‌رقمی از دو‌رقمی',
      categoryFa: 'پیشرفته',
      descriptionFa: 'تفریق ستونی اعداد دورقمی با قرض گرفتن کامل',
      sampleExamplesFa: '۸۲ - ۴۶، ۷۵ - ۳۸',
      pedagogicalGoalFa: 'مهارت در کاستن دقیق دهگان و یکان',
    },
    {
      tier: 4,
      skillId: 'sub_multi_digit',
      operation: 'subtraction',
      titleFa: 'تفریق اعداد چندرقمی',
      stageNameFa: 'مرحله ۴: تفریق چندرقمی',
      categoryFa: 'استادی',
      descriptionFa: 'تفریق اعداد سه‌رقمی با چند مرتبه قرض گرفتن',
      sampleExamplesFa: '۴۲۵ - ۱۹۳، ۶۰۴ - ۲۸۱',
      pedagogicalGoalFa: 'حل مسائل تفریق پیچیده و چندمرحله‌ای',
    },
  ],

  multiplication: [
    {
      tier: 1,
      skillId: 'mul_table_low',
      operation: 'multiplication',
      titleFa: 'جدول ضرب ۱ تا ۵ (پایه)',
      stageNameFa: 'مرحله ۱: ضرب ۱ تا ۵',
      categoryFa: 'پایه',
      descriptionFa: 'پایه‌ریزی جدول ضرب‌های ۲، ۳، ۴ و ۵',
      sampleExamplesFa: '۲ × ۴، ۳ × ۵',
      pedagogicalGoalFa: 'یادگیری مفهومی ضرب به عنوان جمع متوالی',
    },
    {
      tier: 2,
      skillId: 'mul_table_mid',
      operation: 'multiplication',
      titleFa: 'جدول ضرب ۶ و ۷',
      stageNameFa: 'مرحله ۲: ضرب ۶ و ۷',
      categoryFa: 'میانی',
      descriptionFa: 'تسلط بر جدول ضرب‌های میانی ۶ و ۷',
      sampleExamplesFa: '۶ × ۴، ۷ × ۵',
      pedagogicalGoalFa: 'ارتباط بین ضرب‌های پایه و میانی',
    },
    {
      tier: 3,
      skillId: 'mul_table_high',
      operation: 'multiplication',
      titleFa: 'جدول ضرب ۸ و ۹ (ترکیب‌های حساس)',
      stageNameFa: 'مرحله ۳: ضرب ۸ و ۹',
      categoryFa: 'پیشرفته',
      descriptionFa: 'ترکیب‌های پرچالش و سرعتی نظیر ۷×۸ و ۸×۹',
      sampleExamplesFa: '۷ × ۸، ۸ × ۹، ۶ × ۸',
      pedagogicalGoalFa: 'تثبیت کامل تمام خانه‌های جدول ضرب',
    },
    {
      tier: 4,
      skillId: 'mul_table_10_12',
      operation: 'multiplication',
      titleFa: 'ضرب اعداد بزرگ و جدول ۱۰ تا ۱۲',
      stageNameFa: 'مرحله ۴: ضرب پیشرفته',
      categoryFa: 'استادی',
      descriptionFa: 'ضرب در ۱۰، ۱۱، ۱۲ و ضرب اعداد دورقمی',
      sampleExamplesFa: '۱۲ × ۴، ۲۳ × ۳',
      pedagogicalGoalFa: 'گسترش ضرب به اعداد دورقمی',
    },
  ],

  division: [
    {
      tier: 1,
      skillId: 'div_exact_low',
      operation: 'division',
      titleFa: 'تقسیم دقیق پایه‌های ۲ تا ۵ (پایه)',
      stageNameFa: 'مرحله ۱: تقسیم ۲ تا ۵',
      categoryFa: 'پایه',
      descriptionFa: 'تقسیم‌های دقیق متناظر با جدول ضرب‌های کوچک',
      sampleExamplesFa: '۶ ÷ ۲، ۱۲ ÷ ۳، ۲۰ ÷ ۵',
      pedagogicalGoalFa: 'درک مفهوم تقسیم به عنوان عمل معکوس ضرب',
    },
    {
      tier: 2,
      skillId: 'div_exact_high',
      operation: 'division',
      titleFa: 'تقسیم دقیق جدول‌های ۶ تا ۹',
      stageNameFa: 'مرحله ۲: تقسیم ۶ تا ۹',
      categoryFa: 'میانی',
      descriptionFa: 'تقسیم دقیق با مقسوم‌علیه ۶، ۷، ۸ و ۹',
      sampleExamplesFa: '۳۶ ÷ ۴، ۴۸ ÷ ۶، ۵۶ ÷ ۷',
      pedagogicalGoalFa: 'تسلط بر بخش‌پذیری اعداد میانی',
    },
    {
      tier: 3,
      skillId: 'div_table_10_12',
      operation: 'division',
      titleFa: 'تقسیم بر ۱۰ تا ۱۲ و خارج‌قسمت‌های دورقمی',
      stageNameFa: 'مرحله ۳: تقسیم پیشرفته',
      categoryFa: 'پیشرفته',
      descriptionFa: 'تقسیم دقیق با مقسوم‌علیه ۱۰، ۱۱ و ۱۲',
      sampleExamplesFa: '۸۴ ÷ ۱۲، ۶۰ ÷ ۱۰',
      pedagogicalGoalFa: 'گسترش تقسیم به مقادیر بزرگ‌تر',
    },
    {
      tier: 4,
      skillId: 'div_with_remainder',
      operation: 'division',
      titleFa: 'تقسیم با باقیمانده',
      stageNameFa: 'مرحله ۴: تقسیم با باقیمانده',
      categoryFa: 'استادی',
      descriptionFa: 'تشخیص خارج‌قسمت صحیح و باقیمانده در تقسیم‌های غیردقیق',
      sampleExamplesFa: '۱۷ ÷ ۳ = ۵ باقیمانده ۲',
      pedagogicalGoalFa: 'درک عمیق مفهوم باقیمانده در ریاضی',
    },
  ],

  mixed: [],
};

export function getTierDefinition(operation: OperationType, tier: number): SkillTierDefinition {
  const tiers = SKILL_TIERS[operation] || SKILL_TIERS.addition;
  const match = tiers.find((t) => t.tier === tier);
  return match || tiers[0];
}

export function getTierForSkillId(skillId: SkillId): SkillTierDefinition | null {
  for (const op of ['addition', 'subtraction', 'multiplication', 'division'] as OperationType[]) {
    const found = SKILL_TIERS[op].find((t) => t.skillId === skillId);
    if (found) return found;
  }
  return null;
}

export function getTierMedalUrl(operation: OperationType, tier: number): string {
  const map: Record<OperationType, Record<number, number>> = {
    addition: { 1: 16, 2: 17, 3: 18, 4: 18 },
    subtraction: { 1: 19, 2: 20, 3: 21, 4: 21 },
    multiplication: { 1: 22, 2: 23, 3: 24, 4: 24 },
    division: { 1: 25, 2: 26, 3: 27, 4: 27 },
    mixed: { 1: 35, 2: 36, 3: 37, 4: 38 },
  };
  const opMap = map[operation] || map.addition;
  const medalNum = opMap[tier] || opMap[1] || 16;
  return `assets/medals/${medalNum}.png`;
}


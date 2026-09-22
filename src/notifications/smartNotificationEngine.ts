/**
 * Smart Notification Engine for Math Hero.
 * Strictly consumes existing states from:
 * - SmartTeacherEngine & AdaptiveLearningPlan
 * - Mastery System
 * - Gamification & Streak Manager
 * - Smart Review Engine
 * - Mistake Vault
 * 
 * Generates age-appropriate, positive, encouraging learning reminders
 * respecting quiet hours, parent limits, and educational priority.
 */

import { storage } from '../utils/storage';
import { loadGamificationState } from '../gamification/gamificationPersistence';
import { SmartTeacherEngine } from '../adaptive/smartTeacherEngine';
import { getSmartReviewState } from '../smartReview/smartReviewEngine';
import { toPersianDigits } from '../utils/persian';
import { getAssetUrl } from '../utils/assetPaths';
import {
  NotificationDecisionEvaluation,
  SmartNotificationPayload,
} from './notificationTypes';
import { OperationType } from '../types';

/**
 * Checks if current time is within user's quiet hours (e.g. 21:00 to 08:00).
 */
export function isWithinQuietHours(
  now: Date = new Date(),
  startStr: string = '21:00',
  endStr: string = '08:00'
): boolean {
  try {
    const [startH, startM] = startStr.split(':').map(Number);
    const [endH, endM] = endStr.split(':').map(Number);

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = startH * 60 + (startM || 0);
    const endMinutes = endH * 60 + (endM || 0);

    if (startMinutes <= endMinutes) {
      // Normal range during same day (e.g. 13:00 to 15:00)
      return currentMinutes >= startMinutes && currentMinutes < endMinutes;
    } else {
      // Overnight range (e.g. 21:00 to 08:00)
      return currentMinutes >= startMinutes || currentMinutes < endMinutes;
    }
  } catch {
    return false;
  }
}

/**
 * Formats operation name in Persian.
 */
function getOperationNameFa(op: OperationType): string {
  switch (op) {
    case 'addition':
      return 'جمع';
    case 'subtraction':
      return 'تفریق';
    case 'multiplication':
      return 'ضرب';
    case 'division':
      return 'تقسیم';
    default:
      return 'چهار عمل اصلی';
  }
}

/**
 * Helper to get local date string YYYY-MM-DD.
 */
function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export class SmartNotificationEngine {
  /**
   * Evaluates the child's learning state and determines if an encouraging
   * reminder should be sent, selecting the highest-value pedagogical topic.
   */
  static async evaluateNotificationOpportunity(options?: {
    isTest?: boolean;
    forceSend?: boolean;
  }): Promise<NotificationDecisionEvaluation> {
    const isTest = options?.isTest === true;
    const forceSend = options?.forceSend === true;

    // 1. Fetch current settings & preferences
    const settings = await storage.getSettings();
    const notifSettings = settings.notifications;

    if (!isTest && !forceSend) {
      if (!notifSettings || !notifSettings.enabled) {
        return {
          canSend: false,
          reason: 'disabled',
          messageFa: 'یادآورها در تنظیمات خاموش هستند.',
          messageEn: 'Notifications are disabled in settings.',
        };
      }

      // Check quiet hours
      const now = new Date();
      if (isWithinQuietHours(now, notifSettings.quietHoursStart, notifSettings.quietHoursEnd)) {
        return {
          canSend: false,
          reason: 'quiet_hours',
          messageFa: 'اکنون در ساعات استراحت و سکوت قرار داریم.',
          messageEn: 'Currently within quiet hours.',
        };
      }

      // Check daily limit
      const todayStr = getTodayDateString();
      const countToday = notifSettings.lastNotificationDate === todayStr ? (notifSettings.dailyNotificationCount || 0) : 0;
      if (countToday >= (notifSettings.maxPerDay || 2)) {
        return {
          canSend: false,
          reason: 'daily_limit_reached',
          messageFa: 'سقف ارسال اعلان برای امروز تکمیل شده است.',
          messageEn: 'Daily notification limit reached.',
        };
      }
    }

    // 2. Fetch real state from all learning modules
    const [profile, gamification, learningPlan, pendingPromo, mistakes, smartReview] =
      await Promise.all([
        storage.getProfile(),
        loadGamificationState(),
        SmartTeacherEngine.getLearningPlan(),
        SmartTeacherEngine.getPendingPromotion(),
        storage.getMistakes(),
        getSmartReviewState(),
      ]);

    const topics = notifSettings?.topics || {
      adaptiveTeacher: true,
      mistakesAndReview: true,
      streakEncouragement: true,
      gamificationBadges: true,
    };

    const candidatePayloads: SmartNotificationPayload[] = [];
    const iconUrl = getAssetUrl('assets/characters/owl/Ready.webp');
    const badgeUrl = getAssetUrl('assets/icons/android-chrome-192x192.png');
    const todayStr = getTodayDateString();
    const unresolvedMistakes = mistakes.filter((m) => !m.resolved);

    // TOPIC 1: Pending Promotion in Adaptive Teacher (Highest pedagogical priority)
    if (topics.adaptiveTeacher && pendingPromo) {
      candidatePayloads.push({
        id: `promo-${pendingPromo.id}-${Date.now()}`,
        type: 'adaptive_promotion',
        title: 'صعود مهارتی جدید در انتظار توست! 🌟',
        body: `آفرین قهرمان! سطح مهارتی جدید در ${getOperationNameFa(pendingPromo.operation)} آماده شروع است.`,
        icon: iconUrl,
        badge: badgeUrl,
        tag: 'math-hero-promotion',
        targetScreen: 'home',
        actionLabel: 'مشاهده و شروع',
        actionData: {
          type: 'adaptive_promotion',
          targetScreen: 'home',
          operation: pendingPromo.operation,
          tier: pendingPromo.unlockedTier,
          splashTitle: 'صعود مهارتی جدید!',
          splashMessage: 'یک مرحله جدید منتظر هوش درخشان توست! 🦉💫',
        },
        createdAt: Date.now(),
        priority: 1,
      });
    }

    // TOPIC 2: Mistake Vault Resolution (Very high impact on confidence)
    if (topics.mistakesAndReview && unresolvedMistakes.length >= 2) {
      const count = Math.min(unresolvedMistakes.length, 5);
      candidatePayloads.push({
        id: `mistake-${Date.now()}`,
        type: 'mistake_vault',
        title: 'گنجینه اشتباهات منتظر فتح توست! 🗝️',
        body: `با حل درست ${toPersianDigits(count)} سؤال قبلی، این مدال را طلایی کن!`,
        icon: iconUrl,
        badge: badgeUrl,
        tag: 'math-hero-mistakes',
        targetScreen: 'mistakes',
        actionLabel: 'حل اشتباهات',
        actionData: {
          type: 'mistake_vault',
          targetScreen: 'mistakes',
          isMistakePractice: true,
          questionCount: count,
          splashTitle: 'گنجینه اشتباهات',
          splashMessage: 'بیا این سؤال‌ها رو این بار فتح کنیم! 🗝️✨',
        },
        createdAt: Date.now(),
        priority: 2,
      });
    }

    // TOPIC 3: Smart Review Reinforcement from Mr. Owl
    if (topics.mistakesAndReview && smartReview.hasEnoughData && smartReview.targetSkills.length > 0) {
      const topSkill = smartReview.targetSkills[0];
      const headline = smartReview.headlineInsightFa || `یک مرور کوتاه ۵ دقیقه‌ای برای تسلط کامل روی ${topSkill?.titleFa || 'ریاضی'}!`;
      candidatePayloads.push({
        id: `smart-review-${Date.now()}`,
        type: 'smart_review',
        title: 'آقای جغد چند تمرین طلایی دارد 🦉',
        body: headline,
        icon: iconUrl,
        badge: badgeUrl,
        tag: 'math-hero-smart-review',
        targetScreen: 'home',
        actionLabel: 'شروع مرور طلایی',
        actionData: {
          type: 'smart_review',
          targetScreen: 'home',
          isSmartReview: true,
          questionCount: 10,
          splashTitle: 'مرور طلایی آقای جغد',
          splashMessage: 'آقای جغد دانا همراه توست! با تمرکز شروع کن 🦉💫',
        },
        createdAt: Date.now(),
        priority: 3,
      });
    }

    // TOPIC 4: Level Up or Badge Proximity
    if (topics.gamificationBadges) {
      const currentLevel = profile.level || 1;
      const nextLevelXp = currentLevel * 250;
      const xpNeeded = Math.max(0, nextLevelXp - (profile.xp || 0));

      if (xpNeeded > 0 && xpNeeded <= 120) {
        candidatePayloads.push({
          id: `level-near-${Date.now()}`,
          type: 'level_milestone',
          title: 'فقط چند امتیاز تا سطح بعدی! 🚀',
          body: `تنها با یک آزمون کوتاه می‌تونی به سطح ${toPersianDigits(currentLevel + 1)} صعود کنی!`,
          icon: iconUrl,
          badge: badgeUrl,
          tag: 'math-hero-level',
          targetScreen: 'home',
          actionLabel: 'صعود به سطح بعدی',
          actionData: {
            type: 'level_milestone',
            targetScreen: 'home',
            splashTitle: 'صعود به سطح جدید',
            splashMessage: 'آماده‌ای قهرمان؟ نفس عمیق بکش و مهارتت رو نشون بده ⚡🌈',
          },
          createdAt: Date.now(),
          priority: 4,
        });
      }
    }

    // TOPIC 5: Daily Streak Preservation (Gentle, supportive, non-guilty)
    if (topics.streakEncouragement) {
      const hasPracticedToday = gamification.lastActivityDate === todayStr;
      if (!hasPracticedToday) {
        const streak = Math.max(profile.streakDays || 1, gamification.currentStreak || 1);
        candidatePayloads.push({
          id: `streak-${Date.now()}`,
          type: 'streak_preservation',
          title: 'امروز هم بدرخش، قهرمان! 🔥',
          body: `زنجیره ${toPersianDigits(streak)} روزه تو روشنه! ۵ دقیقه تمرین کافیه تا ادامه‌ش بدی.`,
          icon: iconUrl,
          badge: badgeUrl,
          tag: 'math-hero-streak',
          targetScreen: 'home',
          actionLabel: 'حفظ زنجیره',
          actionData: {
            type: 'streak_preservation',
            targetScreen: 'home',
            mode: 'practice',
            splashTitle: 'زنجیره قهرمانی',
            splashMessage: 'تو تا الان پیشرفت فوق‌العاده‌ای داشتی! امروز هم می‌تونی بدرخشی 🏆',
          },
          createdAt: Date.now(),
          priority: 5,
        });
      }
    }

    // TOPIC 6: Active Adaptive Teacher Step
    if (topics.adaptiveTeacher && learningPlan?.primaryOperation) {
      const primaryOp = learningPlan.primaryOperation;
      const opProfile = learningPlan.operations[primaryOp];
      const tier = opProfile?.currentTier || 1;

      candidatePayloads.push({
        id: `adaptive-step-${Date.now()}`,
        type: 'adaptive_practice',
        title: 'چالش مهارتی امروز با آقای جغد 🦉',
        body: `تمرین ${learningPlan.nextMilestoneFa || `گام جدید ${getOperationNameFa(primaryOp)}`} منتظر توست.`,
        icon: iconUrl,
        badge: badgeUrl,
        tag: 'math-hero-adaptive',
        targetScreen: 'home',
        actionLabel: 'ورود به چالش',
        actionData: {
          type: 'adaptive_practice',
          targetScreen: 'home',
          operation: primaryOp,
          tier,
          mode: 'practice',
          questionCount: 10,
          splashTitle: 'آموزش هوشمند',
          splashMessage: 'آقای جغد دانا همراه توست! با لبخند و تمرکز برو به سمت امتیاز عالی 🦉💫',
        },
        createdAt: Date.now(),
        priority: 6,
      });
    }

    // TOPIC 7: Friendly Re-engagement / Warm Welcome
    candidatePayloads.push({
      id: `gentle-${Date.now()}`,
      type: 'reengagement_gentle',
      title: 'سلام قهرمان ریاضی! 🌈',
      body: 'آقای جغد منتظر دیدار دوباره توئه. چند معما حل کنیم و ستاره بگیریم؟',
      icon: iconUrl,
      badge: badgeUrl,
      tag: 'math-hero-gentle',
      targetScreen: 'home',
      actionLabel: 'شروع ماجراجویی',
      actionData: {
        type: 'reengagement_gentle',
        targetScreen: 'home',
        splashTitle: 'قهرمان ریاضی',
        splashMessage: 'آماده یک ماجراجویی شگفت‌انگیز در دنیای ریاضی باش! تو از پس هر مسئله‌ای برمی‌آیی 🚀',
      },
      createdAt: Date.now(),
      priority: 7,
    });

    // If it's a test trigger:
    if (isTest) {
      // Pick the most interesting top candidate or provide a cheerful test notification
      const selected = candidatePayloads[0] || candidatePayloads[candidatePayloads.length - 1];
      const testPayload: SmartNotificationPayload = {
        ...selected,
        id: `test-preview-${Date.now()}`,
        type: 'test_preview',
        title: `[تست] ${selected.title}`,
        body: selected.body,
        actionData: {
          ...selected.actionData,
          splashTitle: 'اعلان آزمایشی فعال شد!',
          splashMessage: 'سیستم یادآورهای هوشمند با موفقیت تنظیم شد و آماده است 🦉🎉',
        },
      };

      return {
        canSend: true,
        reason: 'ready',
        messageFa: 'اعلان آزمایشی با موفقیت آماده شد.',
        messageEn: 'Test notification is ready.',
        payload: testPayload,
      };
    }

    // Anti-fatigue check: Avoid sending the exact same notification type consecutively
    const lastType = notifSettings?.lastNotificationType;
    let chosen = candidatePayloads.find((c) => c.type !== lastType);
    if (!chosen && candidatePayloads.length > 0) {
      chosen = candidatePayloads[0];
    }

    if (!chosen) {
      return {
        canSend: false,
        reason: 'no_relevant_topic',
        messageFa: 'هیچ موضوع یادآوری فعالی یافت نشد.',
        messageEn: 'No active reminder topic available.',
      };
    }

    return {
      canSend: true,
      reason: 'ready',
      messageFa: 'اعلان هوشمند آماده ارسال است.',
      messageEn: 'Smart notification is ready to send.',
      payload: chosen,
    };
  }

  /**
   * Records that a notification was sent so daily limits and rotation are preserved.
   */
  static async recordNotificationSent(payload: SmartNotificationPayload): Promise<void> {
    try {
      const settings = await storage.getSettings();
      const current = settings.notifications;
      if (!current) return;

      const todayStr = getTodayDateString();
      const countToday = current.lastNotificationDate === todayStr ? (current.dailyNotificationCount || 0) : 0;

      const updated = {
        ...settings,
        notifications: {
          ...current,
          lastNotificationDate: todayStr,
          lastNotificationTimestamp: Date.now(),
          lastNotificationType: payload.type,
          dailyNotificationCount: countToday + 1,
        },
      };

      await storage.saveSettings(updated);
    } catch (err) {
      console.warn('Failed to record notification dispatch:', err);
    }
  }
}

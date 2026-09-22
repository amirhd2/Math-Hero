/**
 * Notification domain types for Math Hero Smart Learning Reminders & Notifications.
 * Purely consumes existing states from Adaptive Teacher, Mastery, Gamification,
 * Mistake Vault, and Smart Review.
 */

import { ScreenId, OperationType, QuizMode } from '../types';

export type SmartNotificationType =
  | 'adaptive_promotion'    // ارتقای مهارتی جدید آماده بازگشایی
  | 'adaptive_practice'     // تمرین هدفمند روی مهارت در حال یادگیری
  | 'mistake_vault'         // حل سؤالات ذخیره شده در گنجینه اشتباهات
  | 'smart_review'          // مرور طلایی و هوشمند پیشنهاد شده توسط آقای جغد
  | 'streak_preservation'   // یادآوری آرام و تشویقی برای حفظ زنجیره روزانه
  | 'level_milestone'       // امتیازهای نزدیک به سطح بعدی
  | 'badge_milestone'       // نشان یا مدال در آستانه باز شدن
  | 'trophy_milestone'      // صعود جام قهرمانی
  | 'reengagement_gentle'   // دلتنگی دوستانه بدون احساس گناه
  | 'test_preview';         // اعلان آزمایشی جهت بررسی صحت عملکرد

export interface NotificationActionData {
  type: SmartNotificationType;
  targetScreen: ScreenId;
  operation?: OperationType;
  tier?: number;
  mode?: QuizMode;
  questionCount?: number;
  isMistakePractice?: boolean;
  isSmartReview?: boolean;
  isCombined?: boolean;
  splashTitle?: string;
  splashMessage: string;
}

export interface SmartNotificationPayload {
  id: string;
  type: SmartNotificationType;
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  targetScreen: ScreenId;
  actionLabel: string;
  actionData: NotificationActionData;
  createdAt: number;
  priority: number; // lower number = higher priority
}

export interface NotificationDecisionEvaluation {
  canSend: boolean;
  reason?: 'disabled' | 'quiet_hours' | 'daily_limit_reached' | 'no_relevant_topic' | 'permission_denied' | 'ready';
  messageEn?: string;
  messageFa?: string;
  payload?: SmartNotificationPayload;
}

/**
 * Smart Notification Scheduler for Math Hero.
 * Handles the away-from-app lifecycle:
 * - Detects when the child steps away from or closes the app (visibilitychange hidden, pagehide)
 * - Calculates optimal re-engagement reminder timing based on inactivity hours,
 *   chosen study hour (preferredTime), and quiet hours limits.
 * - Schedules background Android system notification via Service Worker.
 * - Automatically cancels pending away reminders when the child returns to the app.
 */

import { storage } from '../utils/storage';
import { SmartNotificationEngine, isWithinQuietHours } from './smartNotificationEngine';
import { sendServiceWorkerMessage, resolveAbsoluteUrl } from './notificationDelivery';

const STORAGE_KEY_PENDING_SCHEDULE = 'math-hero:pending-away-reminder';

let inMemoryTimeout: any = null;
let lastActiveTimestamp: number = Date.now();
let isInitialized: boolean = false;

export function getLastActiveTimestamp(): number {
  return lastActiveTimestamp;
}

/**
 * Calculates the best Unix timestamp to deliver a re-engagement reminder.
 * Balances user-defined inactivity delay (e.g. 3 hours) and preferred study hour (e.g. 17:00),
 * strictly avoiding quiet hours (e.g. 21:00 - 08:00).
 */
export function calculateNextReminderTime(
  preferredTimeStr: string = '17:00',
  quietHoursStartStr: string = '21:00',
  quietHoursEndStr: string = '08:00',
  inactivityHours: number = 3,
  fromTimestamp: number = lastActiveTimestamp
): number {
  const baseTime = Math.max(fromTimestamp, Date.now());
  const now = new Date(baseTime);
  const [prefH, prefM] = preferredTimeStr.split(':').map(Number);
  
  // 1. Calculate preferred time for today
  const preferredToday = new Date(now);
  preferredToday.setHours(prefH || 17, prefM || 0, 0, 0);

  // 2. Minimum inactivity delay from base active time (e.g. 2-3 hours)
  const minDelayMs = Math.max(1, inactivityHours) * 60 * 60 * 1000;
  const earliestTargetMs = baseTime + minDelayMs;

  let candidateDate: Date;

  if (now.getTime() < preferredToday.getTime() && preferredToday.getTime() >= earliestTargetMs) {
    // If it's before study hour and study hour is at least minDelay away, use study hour today
    candidateDate = preferredToday;
  } else {
    // Otherwise, schedule after the inactivity period
    candidateDate = new Date(earliestTargetMs);
  }

  // 3. Check if candidate time falls into quiet hours
  if (isWithinQuietHours(candidateDate, quietHoursStartStr, quietHoursEndStr)) {
    // Push past quiet hours (next morning at quietHoursEnd or preferred time tomorrow)
    const [qEndH, qEndM] = quietHoursEndStr.split(':').map(Number);
    const morningAfter = new Date(candidateDate);
    
    // If quiet hours end is earlier than now's hour, it belongs to the next day
    if (morningAfter.getHours() >= 20 || morningAfter.getHours() < qEndH) {
      if (morningAfter.getHours() >= 20) {
        morningAfter.setDate(morningAfter.getDate() + 1);
      }
      morningAfter.setHours(qEndH || 8, (qEndM || 0) + 30, 0, 0); // 30 min after quiet hours end
      candidateDate = morningAfter;
    }
  }

  return candidateDate.getTime();
}

/**
 * Schedules an away-from-app reminder with the Service Worker.
 */
export async function scheduleAwayReminder(customDelayMs?: number): Promise<boolean> {
  try {
    const settings = await storage.getSettings();
    const notifSettings = settings.notifications;

    if (!notifSettings || !notifSettings.enabled) {
      return false;
    }

    if (notifSettings.permissionStatus !== 'granted') {
      return false;
    }

    // Evaluate pedagogical opportunity
    const evaluation = await SmartNotificationEngine.evaluateNotificationOpportunity();
    if (!evaluation.canSend || !evaluation.payload) {
      return false;
    }

    const payload = evaluation.payload;
    const now = Date.now();
    let targetTime: number;

    if (customDelayMs !== undefined && customDelayMs > 0) {
      targetTime = now + customDelayMs;
    } else {
      targetTime = calculateNextReminderTime(
        notifSettings.preferredTime || '17:00',
        notifSettings.quietHoursStart || '21:00',
        notifSettings.quietHoursEnd || '08:00',
        notifSettings.inactivityDelayHours || 3
      );
    }

    const delay = Math.max(1000, targetTime - now);

    // Cancel previous in-memory timer
    if (inMemoryTimeout) {
      clearTimeout(inMemoryTimeout);
      inMemoryTimeout = null;
    }

    const iconUrl = resolveAbsoluteUrl('/assets/icons/android-chrome-192x192.png');
    const badgeUrl = resolveAbsoluteUrl('/assets/icons/android-chrome-192x192.png');

    const scheduleMsg = {
      type: 'SCHEDULE_NOTIFICATION',
      id: payload.id,
      title: payload.title,
      scheduledTime: targetTime,
      delayMs: delay,
      options: {
        body: payload.body,
        icon: iconUrl,
        badge: badgeUrl,
        tag: payload.tag || 'math-hero-smart-reminder',
        renotify: true,
        vibrate: [200, 100, 200],
        data: payload.actionData,
      },
    };

    // 1. Dispatch to Service Worker (survives tab suspension and manages Android system notification)
    await sendServiceWorkerMessage(scheduleMsg, 1500);

    // 2. Keep in-memory timeout in case tab remains alive in background
    inMemoryTimeout = setTimeout(async () => {
      // If tab is somehow visible when this fires, skip system notification
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        return;
      }
      try {
        await sendServiceWorkerMessage({
          type: 'SHOW_NOTIFICATION',
          title: scheduleMsg.title,
          options: scheduleMsg.options,
        });
      } catch (err) {
        console.warn('Backup in-memory away reminder delivery failed:', err);
      }
    }, Math.min(delay, 2147483647));

    // Save pending state to storage
    try {
      localStorage.setItem(
        STORAGE_KEY_PENDING_SCHEDULE,
        JSON.stringify({
          id: payload.id,
          targetTime,
          title: payload.title,
        })
      );
    } catch {}

    return true;
  } catch (err) {
    console.warn('[SmartNotificationScheduler] Failed to schedule away reminder:', err);
    return false;
  }
}

/**
 * Cancels any pending away reminders because user has returned to the app.
 */
export async function cancelAwayReminder(): Promise<void> {
  if (inMemoryTimeout) {
    clearTimeout(inMemoryTimeout);
    inMemoryTimeout = null;
  }

  try {
    localStorage.removeItem(STORAGE_KEY_PENDING_SCHEDULE);
  } catch {}

  try {
    await sendServiceWorkerMessage({ type: 'CANCEL_NOTIFICATIONS' }, 800);
  } catch {}
}

/**
 * Schedules a quick test reminder (e.g. 5 seconds) so user can exit the app and test Android notification shade.
 */
export async function scheduleTestAwayNotification(delaySeconds: number = 5): Promise<boolean> {
  try {
    const evaluation = await SmartNotificationEngine.evaluateNotificationOpportunity({
      isTest: true,
      forceSend: true,
    });

    if (!evaluation.payload) return false;

    const payload = evaluation.payload;
    const now = Date.now();
    const delayMs = delaySeconds * 1000;
    const targetTime = now + delayMs;

    const iconUrl = resolveAbsoluteUrl('/assets/icons/android-chrome-192x192.png');
    const badgeUrl = resolveAbsoluteUrl('/assets/icons/android-chrome-192x192.png');

    const scheduleMsg = {
      type: 'SCHEDULE_NOTIFICATION',
      id: `test-away-${now}`,
      title: '🦉 آقای جغد: سیستم اعلان فعال است!',
      scheduledTime: targetTime,
      delayMs,
      options: {
        body: 'یادآور دوری از برنامه با موفقیت فعال شد و روی گوشی اندروید شما کار می‌کند.',
        icon: iconUrl,
        badge: badgeUrl,
        tag: 'math-hero-test-reminder',
        renotify: true,
        vibrate: [250, 100, 250],
        data: {
          ...payload.actionData,
          splashTitle: 'اعلان اندروید با موفقیت دریافت شد!',
          splashMessage: 'آفرین! اکنون سیستم اعلان‌های هوشمند پس‌زمینه به درستی کار می‌کند 🌟',
        },
      },
    };

    await sendServiceWorkerMessage(scheduleMsg, 1500);

    // Fallback timer
    setTimeout(() => {
      sendServiceWorkerMessage({
        type: 'SHOW_NOTIFICATION',
        title: scheduleMsg.title,
        options: scheduleMsg.options,
      });
    }, delayMs);

    return true;
  } catch (err) {
    console.warn('[SmartNotificationScheduler] Failed to schedule test away notification:', err);
    return false;
  }
}

/**
 * Initializes the away-from-app lifecycle listeners.
 */
export function initSmartNotificationScheduler(): () => void {
  if (isInitialized || typeof window === 'undefined') {
    return () => {};
  }
  isInitialized = true;

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      // User left or minimized the app -> schedule away reminder
      scheduleAwayReminder();
    } else if (document.visibilityState === 'visible') {
      // User came back -> cancel scheduled away reminder
      cancelAwayReminder();
      lastActiveTimestamp = Date.now();
    }
  };

  const handlePageHide = () => {
    scheduleAwayReminder();
  };

  const handleUserActivity = () => {
    lastActiveTimestamp = Date.now();
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('pagehide', handlePageHide);
  window.addEventListener('beforeunload', handlePageHide);
  window.addEventListener('touchstart', handleUserActivity, { passive: true });
  window.addEventListener('click', handleUserActivity, { passive: true });

  // Return cleanup function
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('pagehide', handlePageHide);
    window.removeEventListener('beforeunload', handlePageHide);
    window.removeEventListener('touchstart', handleUserActivity);
    window.removeEventListener('click', handleUserActivity);
    isInitialized = false;
  };
}

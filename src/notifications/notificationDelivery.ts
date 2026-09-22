/**
 * Delivery Service for Math Hero Smart Reminders & Notifications.
 * Supports:
 * 1. PWA Service Worker background notifications (registration.showNotification)
 * 2. Fallback window.Notification
 * 3. In-App Interactive Companion Reminder Banner (100% reliable inside iframes,
 *    sandboxes, and browsers without push permission).
 */

import { SmartNotificationPayload, NotificationActionData } from './notificationTypes';
import { storage } from '../utils/storage';
import { SmartNotificationEngine } from './smartNotificationEngine';

export type BrowserPermissionStatus = 'granted' | 'denied' | 'default' | 'unsupported';

/**
 * Checks current browser notification permission safely.
 */
export function getBrowserNotificationPermission(): BrowserPermissionStatus {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  try {
    return Notification.permission as BrowserPermissionStatus;
  } catch {
    return 'unsupported';
  }
}

/**
 * Requests browser notification permission safely with fallback for sandboxed iframes.
 */
export async function requestBrowserNotificationPermission(): Promise<BrowserPermissionStatus> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }

  try {
    const status = await Notification.requestPermission();
    // Update settings with new permission status
    try {
      const settings = await storage.getSettings();
      if (settings.notifications) {
        await storage.saveSettings({
          ...settings,
          notifications: {
            ...settings.notifications,
            permissionStatus: status as any,
            enabled: status === 'granted',
          },
        });
      }
    } catch {}

    return status as BrowserPermissionStatus;
  } catch (err) {
    console.warn('[Notifications] Permission request was blocked or unsupported:', err);
    return 'denied';
  }
}

/**
 * Broadcasts an in-app companion reminder event for active sessions
 * or when system notifications are restricted.
 */
export function triggerInAppReminder(payload: SmartNotificationPayload): void {
  if (typeof window === 'undefined') return;
  try {
    window.dispatchEvent(
      new CustomEvent('math-hero:in-app-reminder', {
        detail: payload,
      })
    );
  } catch (err) {
    console.warn('Failed to dispatch in-app reminder event:', err);
  }
}

/**
 * Broadcasts a notification action trigger event so the main app router
 * can immediately switch screens or launch the relevant quiz session.
 */
export function dispatchNotificationAction(actionData: NotificationActionData): void {
  if (typeof window === 'undefined') return;
  try {
    window.dispatchEvent(
      new CustomEvent('math-hero:notification-action', {
        detail: actionData,
      })
    );
  } catch (err) {
    console.warn('Failed to dispatch notification action event:', err);
  }
}

/**
 * Delivers a Smart Notification using the best available platform mechanism.
 */
export async function deliverSmartNotification(
  payload: SmartNotificationPayload,
  options?: { skipInAppBroadcast?: boolean }
): Promise<{ success: boolean; channel: 'service_worker' | 'native_window' | 'in_app_only'; error?: string }> {
  // Always trigger the in-app interactive companion reminder unless explicitly skipped
  if (!options?.skipInAppBroadcast) {
    triggerInAppReminder(payload);
  }

  // Check if system notifications can be delivered
  const permission = getBrowserNotificationPermission();
  if (permission !== 'granted') {
    return {
      success: true,
      channel: 'in_app_only',
      error: permission === 'denied' ? 'permission_denied' : 'permission_not_granted',
    };
  }

  const notificationOptions: NotificationOptions & { vibrate?: number[] } = {
    body: payload.body,
    icon: payload.icon || '/assets/characters/owl/Ready.webp',
    badge: payload.badge || '/assets/icons/android-chrome-192x192.png',
    tag: payload.tag || 'math-hero-smart-reminder',
    data: payload.actionData,
    dir: 'rtl',
    lang: 'fa',
    vibrate: [200, 100, 200],
  };

  // 1. Try Service Worker showNotification first (PWA / background standard)
  if ('serviceWorker' in navigator) {
    try {
      const swPromise = navigator.serviceWorker.ready;
      // Add 1200ms safety timeout so we never hang if SW is installing or dev mode
      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1200));
      const reg = await Promise.race([swPromise, timeoutPromise]);

      if (reg && 'showNotification' in reg) {
        await reg.showNotification(payload.title, notificationOptions);
        await SmartNotificationEngine.recordNotificationSent(payload);
        return { success: true, channel: 'service_worker' };
      }
    } catch (swErr) {
      console.warn('[Notifications] ServiceWorker showNotification failed, trying fallback:', swErr);
    }
  }

  // 2. Fallback to standard window.Notification
  if ('Notification' in window) {
    try {
      const n = new window.Notification(payload.title, notificationOptions);
      n.onclick = (e) => {
        e.preventDefault();
        try {
          window.focus();
        } catch {}
        dispatchNotificationAction(payload.actionData);
        n.close();
      };
      await SmartNotificationEngine.recordNotificationSent(payload);
      return { success: true, channel: 'native_window' };
    } catch (notifErr: any) {
      console.warn('[Notifications] Native window Notification failed:', notifErr);
      return {
        success: true,
        channel: 'in_app_only',
        error: notifErr?.message || 'Native notification blocked in iframe/sandbox',
      };
    }
  }

  return { success: true, channel: 'in_app_only' };
}

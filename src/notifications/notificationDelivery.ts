/**
 * Delivery Service for Math Hero Smart Reminders & Notifications.
 * Supports:
 * 1. Android PWA Service Worker system notifications (registration.showNotification)
 * 2. Background scheduling for user absence & inactivity
 * 3. Fallback window.Notification
 * 4. In-App Interactive Companion Reminder Banner (shown when user is actively inside the app)
 */

import { SmartNotificationPayload, NotificationActionData } from './notificationTypes';
import { storage } from '../utils/storage';
import { SmartNotificationEngine } from './smartNotificationEngine';

export type BrowserPermissionStatus = 'granted' | 'denied' | 'default' | 'unsupported';

/**
 * Resolves a URL to an absolute URL based on the current origin.
 * Essential for Android Chrome PWA to load notification icons correctly.
 */
export function resolveAbsoluteUrl(urlPath?: string): string | undefined {
  if (!urlPath) return undefined;
  if (typeof window === 'undefined') return urlPath;
  if (urlPath.startsWith('http://') || urlPath.startsWith('https://')) {
    return urlPath;
  }
  try {
    const clean = urlPath.startsWith('./') ? urlPath.slice(2) : urlPath.startsWith('/') ? urlPath.slice(1) : urlPath;
    return new URL(clean, window.location.origin).href;
  } catch {
    return urlPath;
  }
}

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
 * Sends a message to the active Service Worker with timeout.
 */
export async function sendServiceWorkerMessage(message: any, timeoutMs: number = 2000): Promise<any> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const worker = registration.active || navigator.serviceWorker.controller;
    if (!worker) return null;

    return new Promise((resolve) => {
      const messageChannel = new MessageChannel();
      const timer = setTimeout(() => {
        resolve(null);
      }, timeoutMs);

      messageChannel.port1.onmessage = (event) => {
        clearTimeout(timer);
        resolve(event.data);
      };

      worker.postMessage(message, [messageChannel.port2]);
    });
  } catch (err) {
    console.warn('[Notifications] Error sending message to ServiceWorker:', err);
    return null;
  }
}

/**
 * Checks if the Service Worker is currently active and ready to handle notifications.
 */
export async function checkServiceWorkerStatus(): Promise<{
  supported: boolean;
  registered: boolean;
  active: boolean;
  controller: boolean;
  version?: string;
}> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return { supported: false, registered: false, active: false, controller: false };
  }

  try {
    const reg = await navigator.serviceWorker.getRegistration();
    if (!reg) {
      return { supported: true, registered: false, active: false, controller: false };
    }

    const isController = Boolean(navigator.serviceWorker.controller);
    const isActive = Boolean(reg.active);

    let version: string | undefined;
    try {
      const pong = await sendServiceWorkerMessage({ type: 'PING' }, 800);
      if (pong && pong.type === 'PONG') {
        version = pong.version;
      }
    } catch {}

    return {
      supported: true,
      registered: true,
      active: isActive,
      controller: isController,
      version,
    };
  } catch {
    return { supported: true, registered: false, active: false, controller: false };
  }
}

/**
 * Delivers a Smart Notification using the best available platform mechanism.
 * User requirement:
 * - When user is actively inside the app (document.visibilityState === 'visible') and not forced:
 *   Deliver in-app companion banner with owl.
 * - When user is away from app (document.visibilityState !== 'visible') or forceSystemNotification is true:
 *   Deliver Android system notification in notification tray!
 */
export async function deliverSmartNotification(
  payload: SmartNotificationPayload,
  options?: {
    skipInAppBroadcast?: boolean;
    forceSystemNotification?: boolean;
  }
): Promise<{ success: boolean; channel: 'service_worker' | 'native_window' | 'in_app_only'; error?: string }> {
  const isAppVisible = typeof document !== 'undefined' && document.visibilityState === 'visible';
  const forceSystem = options?.forceSystemNotification === true;

  // 1. If user is currently looking at the app, show the in-app interactive companion banner
  if (isAppVisible && !forceSystem) {
    if (!options?.skipInAppBroadcast) {
      triggerInAppReminder(payload);
    }
    await SmartNotificationEngine.recordNotificationSent(payload);
    return { success: true, channel: 'in_app_only' };
  }

  // 2. User is away from app or forced system notification test
  const permission = getBrowserNotificationPermission();
  if (permission !== 'granted') {
    // If system notifications are not permitted, fall back to in-app reminder
    if (!options?.skipInAppBroadcast) {
      triggerInAppReminder(payload);
    }
    return {
      success: true,
      channel: 'in_app_only',
      error: permission === 'denied' ? 'permission_denied' : 'permission_not_granted',
    };
  }

  // Build fully-qualified options for Android system notifications
  const iconUrl = resolveAbsoluteUrl(payload.icon || '/assets/icons/android-chrome-192x192.png');
  const badgeUrl = resolveAbsoluteUrl(payload.badge || '/assets/icons/android-chrome-192x192.png');

  const notificationOptions: NotificationOptions & { vibrate?: number[]; renotify?: boolean } = {
    body: payload.body,
    icon: iconUrl,
    badge: badgeUrl,
    tag: payload.tag || 'math-hero-smart-reminder',
    renotify: true,
    data: payload.actionData,
    dir: 'rtl',
    lang: 'fa',
    vibrate: [200, 100, 200],
  };

  // Primary: Try Service Worker showNotification (Required for Android PWA background & shade)
  if ('serviceWorker' in navigator) {
    try {
      const swPromise = navigator.serviceWorker.ready;
      const timeoutPromise = new Promise<ServiceWorkerRegistration | null>((resolve) =>
        setTimeout(() => resolve(null), 1500)
      );
      const reg = await Promise.race([swPromise, timeoutPromise]);

      if (reg && 'showNotification' in reg) {
        await reg.showNotification(payload.title, notificationOptions);
        await SmartNotificationEngine.recordNotificationSent(payload);
        return { success: true, channel: 'service_worker' };
      }

      // Try postMessage to Service Worker if reg was slow
      const worker = navigator.serviceWorker.controller;
      if (worker) {
        worker.postMessage({
          type: 'SHOW_NOTIFICATION',
          title: payload.title,
          options: notificationOptions,
        });
        await SmartNotificationEngine.recordNotificationSent(payload);
        return { success: true, channel: 'service_worker' };
      }
    } catch (swErr) {
      console.warn('[Notifications] ServiceWorker showNotification failed, trying fallback:', swErr);
    }
  }

  // Secondary: Fallback to standard window.Notification
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
      if (!options?.skipInAppBroadcast) {
        triggerInAppReminder(payload);
      }
      return {
        success: true,
        channel: 'in_app_only',
        error: notifErr?.message || 'Native notification blocked',
      };
    }
  }

  // Fallback to in-app
  if (!options?.skipInAppBroadcast) {
    triggerInAppReminder(payload);
  }
  return { success: true, channel: 'in_app_only' };
}

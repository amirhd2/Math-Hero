// Service Worker notification and background reminder engine for Math Hero
// Handles immediate & scheduled Android system notifications, actions, and offline lifecycle.

const SW_VERSION = 'v1.1.0';
const pendingAlarms = new Map();

// Helper to resolve absolute URL against service worker origin
function resolveAbsoluteUrl(urlPath) {
  if (!urlPath) return undefined;
  if (urlPath.startsWith('http://') || urlPath.startsWith('https://')) {
    return urlPath;
  }
  try {
    return new URL(urlPath, self.location.origin).href;
  } catch (e) {
    return urlPath;
  }
}

// Prepare normalized Android NotificationOptions
function buildNotificationOptions(options = {}) {
  const defaultIcon = resolveAbsoluteUrl('/assets/icons/android-chrome-192x192.png');
  const defaultBadge = resolveAbsoluteUrl('/assets/icons/android-chrome-192x192.png');

  return {
    body: options.body || '',
    icon: resolveAbsoluteUrl(options.icon) || defaultIcon,
    badge: resolveAbsoluteUrl(options.badge) || defaultBadge,
    image: resolveAbsoluteUrl(options.image) || undefined,
    tag: options.tag || 'math-hero-smart-reminder',
    renotify: options.renotify !== undefined ? options.renotify : true,
    requireInteraction: options.requireInteraction || false,
    silent: options.silent || false,
    dir: options.dir || 'rtl',
    lang: options.lang || 'fa',
    vibrate: options.vibrate || [200, 100, 200],
    data: options.data || {},
  };
}

// Lifecycle events
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Click on Android system notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const actionData = event.notification.data || {};

  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });

      let targetClient = null;
      for (const client of allClients) {
        if ('focus' in client) {
          targetClient = client;
          break;
        }
      }

      if (targetClient) {
        await targetClient.focus();
        targetClient.postMessage({
          type: 'MATH_HERO_NOTIFICATION_CLICK',
          actionData,
        });
      } else if (self.clients.openWindow) {
        const urlToOpen = new URL('/', self.location.origin);
        if (actionData.type) {
          urlToOpen.searchParams.set('notif_type', actionData.type);
        }
        if (actionData.targetScreen) {
          urlToOpen.searchParams.set('notif_screen', actionData.targetScreen);
        }
        if (actionData.operation) {
          urlToOpen.searchParams.set('notif_op', actionData.operation);
        }
        await self.clients.openWindow(urlToOpen.toString());
      }
    })()
  );
});

// Listen for messages from the app (immediate trigger, scheduled reminders, cancel, ping)
self.addEventListener('message', (event) => {
  if (!event.data) return;
  const { type, title, options, id, scheduledTime, delayMs } = event.data;

  // 1. Immediate Notification
  if (type === 'SHOW_NOTIFICATION') {
    const finalOptions = buildNotificationOptions(options);
    if (self.registration && self.registration.showNotification) {
      self.registration.showNotification(title || 'قهرمان ریاضی 🦉', finalOptions);
    }
  }

  // 2. Schedule Notification for when user is away
  if (type === 'SCHEDULE_NOTIFICATION') {
    const finalOptions = buildNotificationOptions(options);
    const alarmId = id || `alarm-${Date.now()}`;

    // Clear existing timer if any
    if (pendingAlarms.has(alarmId)) {
      clearTimeout(pendingAlarms.get(alarmId));
      pendingAlarms.delete(alarmId);
    }

    const now = Date.now();
    let calculatedDelay = 0;
    if (scheduledTime && scheduledTime > now) {
      calculatedDelay = scheduledTime - now;
    } else if (delayMs && delayMs > 0) {
      calculatedDelay = delayMs;
    }

    // Check if browser supports modern Notification Triggers (TimestampTrigger)
    let triggerUsed = false;
    if (
      typeof TimestampTrigger !== 'undefined' ||
      ('TimestampTrigger' in self && 'showTrigger' in Notification.prototype)
    ) {
      try {
        const triggerTime = scheduledTime || (now + calculatedDelay);
        const TriggerClass = typeof TimestampTrigger !== 'undefined' ? TimestampTrigger : self.TimestampTrigger;
        const triggerOptions = {
          ...finalOptions,
          showTrigger: new TriggerClass(triggerTime),
        };
        self.registration.showNotification(title || 'قهرمان ریاضی 🦉', triggerOptions);
        triggerUsed = true;
      } catch (triggerErr) {
        // Fallback to active worker timeout
        triggerUsed = false;
      }
    }

    // Set fallback timeout inside Service Worker
    const timer = setTimeout(() => {
      if (self.registration && self.registration.showNotification) {
        self.registration.showNotification(title || 'قهرمان ریاضی 🦉', finalOptions);
      }
      pendingAlarms.delete(alarmId);
    }, Math.min(calculatedDelay, 2147483647)); // Prevent 32-bit int overflow

    pendingAlarms.set(alarmId, timer);

    if (event.ports && event.ports[0]) {
      event.ports[0].postMessage({ success: true, alarmId, delay: calculatedDelay, triggerUsed });
    }
  }

  // 3. Cancel scheduled notifications when user returns to app
  if (type === 'CANCEL_NOTIFICATIONS') {
    for (const [alarmId, timer] of pendingAlarms.entries()) {
      clearTimeout(timer);
    }
    pendingAlarms.clear();

    // Also close existing notification if requested
    if (event.data.closeTag && self.registration && self.registration.getNotifications) {
      self.registration.getNotifications({ tag: event.data.closeTag }).then((notifications) => {
        for (const notif of notifications) {
          notif.close();
        }
      });
    }

    if (event.ports && event.ports[0]) {
      event.ports[0].postMessage({ success: true });
    }
  }

  // 4. Ping to verify active Service Worker connection
  if (type === 'PING') {
    const response = {
      type: 'PONG',
      version: SW_VERSION,
      active: true,
      pendingCount: pendingAlarms.size,
      timestamp: Date.now(),
    };
    if (event.ports && event.ports[0]) {
      event.ports[0].postMessage(response);
    } else if (event.source) {
      event.source.postMessage(response);
    }
  }
});

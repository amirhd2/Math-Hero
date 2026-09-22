// Service Worker notification click and message handler for Math Hero
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

self.addEventListener('message', (event) => {
  if (!event.data) return;
  if (event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    if (self.registration && self.registration.showNotification) {
      self.registration.showNotification(title, options);
    }
  }
});

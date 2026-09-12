const CACHE_NAME = 'math-hero-pwa-v3';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/manifest.webmanifest',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/apple-touch-icon.png',
  '/favicon.ico',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
  '/screenshot-mobile.png',
  '/screenshot-desktop.png',
  '/assets/icons/android-chrome-192x192.png',
  '/assets/icons/android-chrome-512x512.png',
  '/assets/icons/apple-touch-icon.png',
  '/assets/screenshots/mobile-1.png',
  '/assets/screenshots/desktop-1.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Cache each asset individually so one failure does not break the entire cache
      await Promise.all(
        STATIC_ASSETS.map((asset) =>
          cache.add(asset).catch((err) => {
            console.warn('[SW] Non-critical cache item missed:', asset, err);
          })
        )
      );
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  // Navigation requests: Network First, falling back to cached index.html or root
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(async () => {
          const cache = await caches.open(CACHE_NAME);
          const cached = await cache.match(request);
          if (cached) return cached;
          const indexCached = await cache.match('/index.html');
          if (indexCached) return indexCached;
          const rootCached = await cache.match('/');
          if (rootCached) return rootCached;
          return new Response(
            '<!DOCTYPE html><html lang="fa" dir="rtl"><body><h1>در حال آفلاین</h1><p>لطفاً اتصال اینترنت خود را بررسی کنید یا برنامه را دوباره باز کنید.</p></body></html>',
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        })
    );
    return;
  }

  // Static Assets: Cache First, falling back to network and caching
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch((err) => {
          console.warn('[SW] Offline asset fetch failed:', request.url, err);
        });
    })
  );
});

// Background sync support for offline action replay
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
});

// Periodic background sync support
self.addEventListener('periodicsync', (event) => {
  console.log('[SW] Periodic background sync triggered:', event.tag);
});

// Push notification support
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.text() : 'قهرمان ریاضی آماده تمرین امروز است!';
  event.waitUntil(
    self.registration.showNotification('قهرمان ریاضی | Math Hero', {
      body: data,
      icon: '/pwa-192x192.png',
      badge: '/favicon-32x32.png'
    })
  );
});

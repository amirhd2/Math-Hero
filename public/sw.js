/**
 * Math Hero Service Worker
 * Version: v1.0.0
 * Provides offline-first caching for application shell, styles, and assets.
 * Guarantees zero interference with IndexedDB or user learning records.
 */

const CACHE_NAME = 'math-hero-v1.0.0';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icon.svg',
];

// Install: precache essential shell and immediately activate
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('Pre-caching partial failure, proceeding gracefully:', err);
      });
    })
  );
});

// Activate: clean up obsolete cache versions and claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          })
        );
      }),
      self.clients.claim(),
    ])
  );
});

// Fetch: Stale-While-Revalidate for navigation/documents; Cache-First for static assets
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests from the same origin or trusted font domains
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  // Ignore chrome extensions or unsupported schemes
  if (!url.protocol.startsWith('http')) return;

  // SPA navigation fallback to index.html if offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const fallback = await caches.match('/index.html');
          return fallback || new Response('Offline - Math Hero is ready', { headers: { 'Content-Type': 'text/html' } });
        })
    );
    return;
  }

  // Static assets (scripts, styles, fonts, images)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached, but optionally revalidate in background
        fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
            }
          })
          .catch(() => {});
        return cachedResponse;
      }

      return fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        })
        .catch(() => {
          // Return empty or fallback if needed
          return new Response('', { status: 408, statusText: 'Offline' });
        });
    })
  );
});

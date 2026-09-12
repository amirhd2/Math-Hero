import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

function pwaHeadersPlugin(): Plugin {
  return {
    name: 'pwa-headers-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0];

        // Handle CORS Preflight
        if (req.method === 'OPTIONS') {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', '*');
          res.statusCode = 204;
          res.end();
          return;
        }

        // Set CORS and correct MIME types for PWA validator bots (e.g. PWABuilder)
        if (url === '/manifest.json' || url === '/manifest.webmanifest') {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
          res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
          res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
        } else if (url === '/sw.js') {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
          res.setHeader('Content-Type', 'text/javascript; charset=utf-8');
          res.setHeader('Service-Worker-Allowed', '/');
          res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
        } else if (
          url?.startsWith('/pwa-') ||
          url?.startsWith('/screenshot-') ||
          url?.startsWith('/apple-touch-icon') ||
          url?.startsWith('/favicon')
        ) {
          res.setHeader('Access-Control-Allow-Origin', '*');
        }

        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0];
        if (url === '/manifest.json' || url === '/manifest.webmanifest') {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
        } else if (url === '/sw.js') {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Content-Type', 'text/javascript; charset=utf-8');
          res.setHeader('Service-Worker-Allowed', '/');
        }
        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    base: '/',
    plugins: [
      pwaHeadersPlugin(),
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          'pwa-192x192.png',
          'pwa-512x512.png',
          'apple-touch-icon.png',
          'favicon.ico',
          'favicon-16x16.png',
          'favicon-32x32.png',
          'screenshot-mobile.png',
          'screenshot-desktop.png',
          'assets/icons/android-chrome-192x192.png',
          'assets/icons/android-chrome-512x512.png',
          'assets/screenshots/mobile-1.png',
          'assets/screenshots/desktop-1.png',
          'icon.svg',
          'assets/characters/**/*.webp',
          'assets/characters/**/*.png',
          'assets/medals/*.png',
          'assets/cups/*.webp',
          'assets/stages/*.webp',
        ],
        manifest: {
          id: '/',
          name: 'قهرمان ریاضی | Math Hero',
          short_name: 'قهرمان ریاضی',
          description: 'پلتفرم آموزشی و بازی‌وارسازی ریاضی برای کودکان و دانش‌آموزان (Math Hero Offline-First Educational Math PWA)',
          theme_color: '#4f46e5',
          background_color: '#0f172a',
          display: 'standalone',
          orientation: 'portrait',
          dir: 'rtl',
          lang: 'fa',
          start_url: '/',
          scope: '/',
          categories: ['education', 'kids', 'games'],
          prefer_related_applications: false,
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'maskable',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
            {
              src: '/apple-touch-icon.png',
              sizes: '180x180',
              type: 'image/png',
            },
            {
              src: '/favicon-32x32.png',
              sizes: '32x32',
              type: 'image/png',
            },
            {
              src: '/favicon-16x16.png',
              sizes: '16x16',
              type: 'image/png',
            },
          ],
          screenshots: [
            {
              src: '/screenshot-mobile.png',
              sizes: '1080x1920',
              type: 'image/png',
              form_factor: 'narrow',
              label: 'صفحه اصلی و نقشه‌های بازی قهرمان ریاضی',
            },
            {
              src: '/screenshot-desktop.png',
              sizes: '1920x1080',
              type: 'image/png',
              form_factor: 'wide',
              label: 'داشبورد پیشرفت و گزارش تمرینات',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,jpg,jpeg,woff,woff2,webmanifest}'],
          maximumFileSizeToCacheInBytes: 25 * 1024 * 1024,
          runtimeCaching: [
            {
              urlPattern: /\.(?:png|jpg|jpeg|svg|webp)$/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'images-cache',
                expiration: {
                  maxEntries: 500,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: false,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    preview: {
      port: 3000,
      host: '0.0.0.0',
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    },
  };
});

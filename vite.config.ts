import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    base: '/',
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        includeAssets: [
          'favicon.ico',
          'apple-touch-icon.png',
          'icon.svg',
          'assets/**/*',
        ],
        manifest: {
          id: '/',
          name: 'قهرمان ریاضی | Math Hero',
          short_name: 'قهرمان ریاضی',
          description: 'پلتفرم آموزشی و بازی‌وارسازی ریاضی برای کودکان و دانش‌آموزان',
          theme_color: '#4f46e5',
          background_color: '#0f172a',
          display: 'standalone',
          orientation: 'portrait',
          dir: 'rtl',
          lang: 'fa',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/assets/icons/android-chrome-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/assets/icons/android-chrome-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/assets/icons/android-chrome-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: true,
          navigateFallback: '/index.html',
          globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,jpg,jpeg,woff,woff2,webmanifest}'],
          maximumFileSizeToCacheInBytes: 25 * 1024 * 1024,
          runtimeCaching: [
            {
              urlPattern: ({ request }) =>
                request.destination === 'image' ||
                request.destination === 'font' ||
                request.destination === 'style' ||
                request.destination === 'script',
              handler: 'CacheFirst',
              options: {
                cacheName: 'static-assets-cache',
                expiration: {
                  maxEntries: 1000,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: ({ request }) => request.mode === 'navigate',
              handler: 'NetworkFirst',
              options: {
                cacheName: 'navigation-cache',
                networkTimeoutSeconds: 3,
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: true,
          type: 'module',
          navigateFallback: 'index.html',
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
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});

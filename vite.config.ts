import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    base: './',
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          'assets/icons/favicon.ico',
          'assets/icons/favicon-16x16.png',
          'assets/icons/favicon-32x32.png',
          'assets/icons/apple-touch-icon.png',
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
              src: '/assets/icons/favicon-16x16.png',
              sizes: '16x16',
              type: 'image/png',
            },
            {
              src: '/assets/icons/favicon-32x32.png',
              sizes: '32x32',
              type: 'image/png',
            },
            {
              src: '/assets/icons/android-chrome-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/assets/icons/android-chrome-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'maskable',
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
            {
              src: '/assets/icons/apple-touch-icon.png',
              sizes: '180x180',
              type: 'image/png',
            },
          ],
          screenshots: [
            {
              src: '/assets/screenshots/mobile-1.png',
              sizes: '1080x1920',
              type: 'image/png',
              form_factor: 'narrow',
              label: 'صفحه اصلی و نقشه‌های بازی قهرمان ریاضی',
            },
            {
              src: '/assets/screenshots/desktop-1.png',
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
          enabled: true,
          type: 'module',
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

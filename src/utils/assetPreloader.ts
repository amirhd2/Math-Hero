/**
 * Asset Preloader Utility for Math Hero.
 * Preloads all static image assets (medals, characters, cups, stages, owl)
 * in the background on app startup so that the app is 100% ready for offline usage
 * and loads all visuals instantly without any latency or internet dependency.
 */

import { getAssetUrl } from './assetPaths';

const PRELOAD_ASSETS: string[] = [
  // Character Heads & Avatars
  'assets/characters/boy/head.webp',
  'assets/characters/girl/head.webp',
  'assets/characters/boy/boy half.webp',
  'assets/characters/girl/girl half.webp',
  'assets/characters/boy/greeting.webp',
  'assets/characters/girl/greeting.webp',
  'assets/characters/boy/proud.webp',
  'assets/characters/girl/proud.webp',
  'assets/characters/boy/Looking down.webp',
  'assets/characters/girl/Looking down.webp',

  // Owl Teacher
  'assets/characters/owl/Owl.webp',
  'assets/characters/owl/Greeting.webp',
  'assets/characters/owl/Pointing right.webp',
  'assets/characters/owl/Celebrating.webp',
  'assets/characters/owl/Thinking.webp',
  'assets/characters/owl/Teaching.webp',
  'assets/characters/owl/Ready.webp',

  // Trophy Cups
  'assets/cups/wooden 1.webp',
  'assets/cups/bronze 1.webp',
  'assets/cups/sliver 1.webp',
  'assets/cups/gold 1.webp',
  'assets/cups/ruby 1.webp',
  'assets/cups/Dimond 1.webp',

  // Boy Quiz Characters
  ...Array.from({ length: 13 }, (_, i) => `assets/characters/boy/half-body/${i + 1}.webp`),

  // Girl Quiz Characters
  ...Array.from({ length: 13 }, (_, i) => `assets/characters/girl/half-body/${i + 1}.webp`),

  // 20 Stage Icons
  ...Array.from({ length: 20 }, (_, i) => `assets/stages/${i + 1}.webp`),

  // 45 Gamification Medals
  ...Array.from({ length: 45 }, (_, i) => `assets/medals/${i + 1}.png`),
];

let preloadingStarted = false;

/**
 * Preloads all core assets in low priority background tasks.
 */
export function preloadAllAssets(): void {
  if (preloadingStarted || typeof window === 'undefined') return;
  preloadingStarted = true;

  // Use requestIdleCallback or setTimeout to avoid blocking initial UI paint
  const schedulePreload = window.requestIdleCallback || ((cb: () => void) => setTimeout(cb, 100));

  schedulePreload(() => {
    // Batch load in small chunks to keep network/memory smooth
    let index = 0;
    const batchSize = 6;

    const loadNextBatch = () => {
      if (index >= PRELOAD_ASSETS.length) return;

      const batch = PRELOAD_ASSETS.slice(index, index + batchSize);
      index += batchSize;

      batch.forEach((assetPath) => {
        const url = getAssetUrl(assetPath);
        const img = new Image();
        img.src = url;
      });

      // Continue with next batch after brief yield
      setTimeout(loadNextBatch, 50);
    };

    loadNextBatch();
  });
}

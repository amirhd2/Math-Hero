/**
 * Asset Preloader Utility for Math Hero.
 * Preloads and decodes ALL static image assets (medals, characters, cups, stages, owl)
 * immediately in memory so that all images render instantly with 0ms delay.
 */

import { getAssetUrl } from './assetPaths';

const PRELOAD_ASSETS: string[] = [
  // Character Heads & Avatars
  'assets/characters/boy/head.webp',
  'assets/characters/girl/head.webp',
  'assets/characters/boy/boy.webp',
  'assets/characters/girl/girl.webp',
  'assets/characters/boy/boy half.webp',
  'assets/characters/girl/girl half.webp',
  'assets/characters/boy/greeting.webp',
  'assets/characters/girl/greeting.webp',
  'assets/characters/boy/proud.webp',
  'assets/characters/girl/proud.webp',
  'assets/characters/boy/Looking down.webp',
  'assets/characters/girl/Looking down.webp',
  'assets/characters/boy/Looking down.png',
  'assets/characters/girl/Looking down.png',

  // Boy Quiz Answer Feedback Characters
  'assets/characters/boy/quiz answer/5.webp',
  'assets/characters/boy/quiz answer/9.webp',
  'assets/characters/boy/quiz answer/11.webp',
  'assets/characters/boy/quiz answer/13.webp',
  'assets/characters/boy/quiz answer/Celebrating.webp',
  'assets/characters/boy/quiz answer/encouraging.webp',
  'assets/characters/boy/quiz answer/thinking.webp',

  // Girl Quiz Answer Feedback Characters
  'assets/characters/girl/quiz answer/3.webp',
  'assets/characters/girl/quiz answer/5.webp',
  'assets/characters/girl/quiz answer/10.webp',
  'assets/characters/girl/quiz answer/12.webp',
  'assets/characters/girl/quiz answer/15.webp',
  'assets/characters/girl/quiz answer/16.webp',
  'assets/characters/girl/quiz answer/17.webp',

  // Boy & Girl Half-Body Characters
  ...Array.from({ length: 13 }, (_, i) => `assets/characters/boy/half-body/${i + 1}.webp`),
  'assets/characters/boy/half-body/greeting.webp',
  ...Array.from({ length: 13 }, (_, i) => `assets/characters/girl/half-body/${i + 1}.webp`),
  'assets/characters/girl/half-body/greeting.webp',

  // Owl Teacher
  'assets/characters/owl/Owl.webp',
  'assets/characters/owl/Greeting.webp',
  'assets/characters/owl/Pointing right.webp',
  'assets/characters/owl/Celebrating.webp',
  'assets/characters/owl/Thinking.webp',
  'assets/characters/owl/Thinking2.webp',
  'assets/characters/owl/Thinking3.webp',
  'assets/characters/owl/Teaching.webp',
  'assets/characters/owl/Ready.webp',
  'assets/characters/owl/shocking.webp',
  'assets/characters/owl/shocking1.webp',

  // Trophy Cups (6 stages x 3 variations)
  'assets/cups/wooden 1.webp',
  'assets/cups/Wooden 2.webp',
  'assets/cups/Wooden 3.webp',
  'assets/cups/bronze 1.webp',
  'assets/cups/bronze 2.webp',
  'assets/cups/bronze 3.webp',
  'assets/cups/sliver 1.webp',
  'assets/cups/sliver 2.webp',
  'assets/cups/sliver 3.webp',
  'assets/cups/gold 1.webp',
  'assets/cups/gold 2.webp',
  'assets/cups/gold 3.webp',
  'assets/cups/ruby 1.webp',
  'assets/cups/ruby 2.webp',
  'assets/cups/ruby 3.webp',
  'assets/cups/Dimond 1.webp',
  'assets/cups/Dimond 2.webp',
  'assets/cups/Dimond 3.webp',

  // 20 Stage Icons
  ...Array.from({ length: 20 }, (_, i) => `assets/stages/${i + 1}.webp`),

  // 45 Gamification Medals
  ...Array.from({ length: 45 }, (_, i) => `assets/medals/${i + 1}.png`),
];

// Global in-memory cache to keep decoded image textures warm in RAM
const imageMemoryCache = new Map<string, HTMLImageElement>();
let preloadingStarted = false;

/**
 * Preloads and decodes all core assets immediately in memory.
 */
export function preloadAllAssets(): void {
  if (preloadingStarted || typeof window === 'undefined') return;
  preloadingStarted = true;

  PRELOAD_ASSETS.forEach((assetPath) => {
    const url = getAssetUrl(assetPath);
    if (!imageMemoryCache.has(url)) {
      const img = new Image();
      img.src = url;
      // Pre-decode image asynchronously if browser supports it
      if ('decode' in img) {
        img.decode().catch(() => {
          // Ignore decoding errors for uncached items
        });
      }
      imageMemoryCache.set(url, img);
    }
  });
}


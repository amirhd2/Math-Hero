/**
 * Safe asset path resolution utility.
 * Handles relative base ('./'), root base ('/'), and sub-path deployments,
 * ensuring assets resolve correctly in standard browsers, standalone Web Apps (PWA),
 * and iOS/WebKit environments.
 */

export function getAssetUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const rawBase = import.meta.env.BASE_URL || './';
  
  if (rawBase === './' || rawBase === '') {
    return `./${cleanPath}`;
  }
  
  const normalizedBase = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;
  return `${normalizedBase}${cleanPath}`;
}

export function getFallbackAssetUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `/${cleanPath}`;
}

export const TROPHY_CUPS: Record<number, { id: string; nameFa: string; imagePath: string }> = {
  1: {
    id: 'wooden',
    nameFa: 'جام چوبی نوآموز',
    imagePath: 'assets/cups/wooden 1.webp',
  },
  2: {
    id: 'bronze',
    nameFa: 'جام برنز یادگیرنده',
    imagePath: 'assets/cups/bronze 1.webp',
  },
  3: {
    id: 'silver',
    nameFa: 'جام نقره ای حل مسئله',
    imagePath: 'assets/cups/sliver 1.webp',
  },
  4: {
    id: 'gold',
    nameFa: 'جام طلایی مهارت',
    imagePath: 'assets/cups/gold 1.webp',
  },
  5: {
    id: 'ruby',
    nameFa: 'جام یاقوتی پیشتاز',
    imagePath: 'assets/cups/ruby 1.webp',
  },
  6: {
    id: 'diamond',
    nameFa: 'جام الماسین قهرمان قهرمانان',
    imagePath: 'assets/cups/Dimond 1.webp',
  },
};

export function getTrophyCupUrl(stage: number): string {
  const safeStage = Math.max(1, Math.min(6, stage || 1));
  const cup = TROPHY_CUPS[safeStage] || TROPHY_CUPS[1];
  return getAssetUrl(cup.imagePath);
}

export function getTrophyCupFallbackUrl(stage: number): string {
  const safeStage = Math.max(1, Math.min(6, stage || 1));
  const cup = TROPHY_CUPS[safeStage] || TROPHY_CUPS[1];
  return getFallbackAssetUrl(cup.imagePath);
}

/**
 * Returns relative path to the stage/level icon (1 to 20) in /public/assets/stages/.
 */
export function getStageIconPath(level: number): string {
  const safeLevel = Math.max(1, Math.min(20, Math.floor(level) || 1));
  return `assets/stages/${safeLevel}.webp`;
}

/**
 * Returns fully resolved asset URL for the stage/level icon (1 to 20).
 */
export function getStageIconUrl(level: number): string {
  return getAssetUrl(getStageIconPath(level));
}

/**
 * Returns fallback asset URL for the stage/level icon (1 to 20).
 */
export function getStageIconFallbackUrl(level: number): string {
  return getFallbackAssetUrl(getStageIconPath(level));
}

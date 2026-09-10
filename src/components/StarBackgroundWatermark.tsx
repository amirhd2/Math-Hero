import React, { useMemo } from 'react';

export interface StarBackgroundWatermarkProps {
  /** Optional custom count of stars (defaults to 12) */
  count?: number;
  /** Optional container class */
  className?: string;
}

interface StarItem {
  id: number;
  type: '4point' | '5point' | '8point' | 'dot';
  sizePx: number;
  leftPercent: number;
  topPercent: number;
  animationName: string;
  durationSec: number;
  delaySec: number;
  colorClass: string;
  initialRotate: number;
}

const STAR_COLORS = [
  'text-white',
  'text-amber-200',
  'text-yellow-100',
  'text-indigo-100',
  'text-white',
  'text-amber-100',
];

// Predefined balanced star layouts for natural starry sky look inside the card
const PRESET_STAR_POSITIONS = [
  { left: 8, top: 14, size: 18, type: '4point' as const, anim: 'starTwinkleFade1', dur: 3.6, delay: 0.2 },
  { left: 24, top: 28, size: 24, type: '5point' as const, anim: 'starTwinkleFade2', dur: 4.8, delay: 1.5 },
  { left: 14, top: 68, size: 14, type: '4point' as const, anim: 'starTwinkleFade3', dur: 3.2, delay: 0.8 },
  { left: 32, top: 82, size: 20, type: '8point' as const, anim: 'starTwinkleFade4', dur: 5.2, delay: 2.4 },
  { left: 48, top: 12, size: 16, type: '4point' as const, anim: 'starTwinkleFade5', dur: 4.1, delay: 1.1 },
  { left: 62, top: 22, size: 28, type: '5point' as const, anim: 'starTwinkleFade1', dur: 5.8, delay: 3.0 },
  { left: 78, top: 16, size: 20, type: '4point' as const, anim: 'starTwinkleFade2', dur: 3.9, delay: 0.5 },
  { left: 88, top: 38, size: 14, type: '8point' as const, anim: 'starTwinkleFade3', dur: 4.5, delay: 2.1 },
  { left: 82, top: 72, size: 22, type: '4point' as const, anim: 'starTwinkleFade4', dur: 4.2, delay: 1.8 },
  { left: 68, top: 86, size: 16, type: '5point' as const, anim: 'starTwinkleFade5', dur: 3.5, delay: 2.7 },
  { left: 42, top: 75, size: 12, type: 'dot' as const, anim: 'starTwinkleFade1', dur: 2.9, delay: 0.9 },
  { left: 92, top: 82, size: 16, type: '4point' as const, anim: 'starTwinkleFade2', dur: 4.7, delay: 1.3 },
];

export const StarBackgroundWatermark: React.FC<StarBackgroundWatermarkProps> = ({
  count = 12,
  className = '',
}) => {
  const stars = useMemo<StarItem[]>(() => {
    return PRESET_STAR_POSITIONS.slice(0, count).map((preset, index) => {
      return {
        id: index,
        type: preset.type,
        sizePx: preset.size,
        leftPercent: preset.left,
        topPercent: preset.top,
        animationName: preset.anim,
        durationSec: preset.dur,
        delaySec: preset.delay,
        colorClass: STAR_COLORS[index % STAR_COLORS.length],
        initialRotate: (index * 37) % 360,
      };
    });
  }, [count]);

  const renderStarIcon = (type: StarItem['type'], size: number) => {
    if (type === '4point') {
      // 4-point sparkle diamond star
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="currentColor"
          className="filter drop-shadow-[0_0_6px_rgba(255,255,255,0.6)]"
        >
          <path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z" />
        </svg>
      );
    }

    if (type === '5point') {
      // 5-point classic star
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="currentColor"
          className="filter drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]"
        >
          <path d="M12 1.5L15.3 8.2L22.7 9.3L17.3 14.6L18.6 22L12 18.5L5.4 22L6.7 14.6L1.3 9.3L8.7 8.2L12 1.5Z" />
        </svg>
      );
    }

    if (type === '8point') {
      // 8-point star / glimmer
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="currentColor"
          className="filter drop-shadow-[0_0_6px_rgba(255,255,255,0.7)]"
        >
          <path d="M12 0L14.2 9.8L24 12L14.2 14.2L12 24L9.8 14.2L0 12L9.8 9.8L12 0Z" />
          <path d="M5 5L8.5 8.5M19 5L15.5 8.5M5 19L8.5 15.5M19 19L15.5 15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    }

    // Dot / glimmer
    return (
      <div
        style={{ width: `${size}px`, height: `${size}px` }}
        className="rounded-full bg-current filter drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]"
      />
    );
  };

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none select-none z-0 ${className}`}
      aria-hidden="true"
    >
      {stars.map((star) => (
        <div
          key={star.id}
          className={`absolute flex items-center justify-center ${star.colorClass}`}
          style={{
            left: `${star.leftPercent}%`,
            top: `${star.topPercent}%`,
            animation: `${star.animationName} ${star.durationSec}s ease-in-out infinite`,
            animationDelay: `${star.delaySec}s`,
            transform: `rotate(${star.initialRotate}deg)`,
            willChange: 'opacity, transform',
          }}
        >
          {renderStarIcon(star.type, star.sizePx)}
        </div>
      ))}
    </div>
  );
};

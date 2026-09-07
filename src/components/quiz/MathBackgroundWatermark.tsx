import React, { useMemo } from 'react';

const SYMBOLS = ['+', '−', '×', '÷', '+', '−', '×', '÷'];

const COLORS = [
  'text-rose-500/35 dark:text-rose-400/25',
  'text-indigo-500/35 dark:text-indigo-400/25',
  'text-amber-500/40 dark:text-amber-400/30',
  'text-emerald-500/35 dark:text-emerald-400/25',
  'text-purple-500/35 dark:text-purple-400/25',
  'text-sky-500/35 dark:text-sky-400/25',
  'text-pink-500/35 dark:text-pink-400/25',
  'text-teal-500/35 dark:text-teal-400/25',
  'text-orange-500/35 dark:text-orange-400/25',
  'text-violet-500/35 dark:text-violet-400/25',
];

const ANIMATIONS = ['mathFloat1', 'mathFloat2', 'mathFloat3', 'mathFloat4'];

interface MathBackgroundWatermarkProps {
  seed: string;
}

interface WatermarkItem {
  id: number;
  symbol: string;
  colorClass: string;
  fontSize: number;
  leftPercent: number;
  topPercent: number;
  animationName: string;
  durationSec: number;
  delaySec: number;
  initialRotate: number;
}

export const MathBackgroundWatermark: React.FC<MathBackgroundWatermarkProps> = ({ seed }) => {
  const items = useMemo<WatermarkItem[]>(() => {
    let hash = 0;
    const key = seed || 'math-hero-default';
    for (let i = 0; i < key.length; i++) {
      hash = key.charCodeAt(i) + ((hash << 5) - hash);
    }

    const pseudoRandom = () => {
      const x = Math.sin(hash++) * 10000;
      return x - Math.floor(x);
    };

    // 4x4 Grid sectors for balanced distribution across the card canvas
    const rows = 4;
    const cols = 4;
    const list: WatermarkItem[] = [];

    let idCounter = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Sector bounds
        const minX = (c / cols) * 100;
        const minY = (r / rows) * 100;
        const cellW = 100 / cols;
        const cellH = 100 / rows;

        // Position with random jitter inside cell
        const leftPercent = Math.round(minX + 5 + pseudoRandom() * (cellW - 15));
        const topPercent = Math.round(minY + 5 + pseudoRandom() * (cellH - 15));

        // Varied sizes: Small (24-32px), Medium (38-52px), Large (60-84px)
        const sizeTier = pseudoRandom();
        let fontSize = 28;
        if (sizeTier < 0.35) {
          fontSize = Math.round(22 + pseudoRandom() * 12); // Small: 22 - 34px
        } else if (sizeTier < 0.75) {
          fontSize = Math.round(38 + pseudoRandom() * 18); // Medium: 38 - 56px
        } else {
          fontSize = Math.round(62 + pseudoRandom() * 22); // Large: 62 - 84px
        }

        const symbol = SYMBOLS[Math.floor(pseudoRandom() * SYMBOLS.length)];
        const colorClass = COLORS[Math.floor(pseudoRandom() * COLORS.length)];
        const animationName = ANIMATIONS[Math.floor(pseudoRandom() * ANIMATIONS.length)];
        const durationSec = Math.round(12 + pseudoRandom() * 14); // 12s - 26s
        const delaySec = -Math.round(pseudoRandom() * 20); // Negative delay to start immediately at different points
        const initialRotate = Math.round((pseudoRandom() - 0.5) * 60);

        list.push({
          id: idCounter++,
          symbol,
          colorClass,
          fontSize,
          leftPercent,
          topPercent,
          animationName,
          durationSec,
          delaySec,
          initialRotate,
        });
      }
    }

    return list;
  }, [seed]);

  return (
    <div 
      className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0 rounded-3xl"
      aria-hidden="true"
    >
      {items.map((item) => (
        <span
          key={item.id}
          className={`absolute font-black select-none pointer-events-none transition-opacity ${item.colorClass}`}
          style={{
            left: `${item.leftPercent}%`,
            top: `${item.topPercent}%`,
            fontSize: `${item.fontSize}px`,
            lineHeight: 1,
            animation: `${item.animationName} ${item.durationSec}s ease-in-out infinite alternate`,
            animationDelay: `${item.delaySec}s`,
            transform: `rotate(${item.initialRotate}deg)`,
            willChange: 'transform',
          }}
        >
          {item.symbol}
        </span>
      ))}
    </div>
  );
};

import React, { useState } from 'react';
import { getStageIconUrl, getStageIconFallbackUrl } from '../../utils/assetPaths';
import { LEVEL_METADATA } from '../../gamification/levelCalculator';

export type StageIconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'fill';

interface StageIconProps {
  level: number;
  size?: StageIconSize;
  className?: string;
  imgClassName?: string;
  alt?: string;
  showFallbackEmoji?: boolean;
}

const SIZE_MAP: Record<StageIconSize, string> = {
  xs: 'w-5 h-5 min-w-[20px] min-h-[20px]',
  sm: 'w-6 h-6 min-w-[24px] min-h-[24px]',
  md: 'w-10 h-10 min-w-[40px] min-h-[40px]',
  lg: 'w-12 h-12 min-w-[48px] min-h-[48px]',
  xl: 'w-16 h-16 min-w-[64px] min-h-[64px]',
  '2xl': 'w-20 h-20 min-w-[80px] min-h-[80px]',
  fill: 'w-full h-full',
};

export const StageIcon: React.FC<StageIconProps> = ({
  level,
  size = 'md',
  className = '',
  imgClassName = '',
  alt,
  showFallbackEmoji = true,
}) => {
  const safeLevel = Math.max(1, Math.min(20, Math.floor(level) || 1));
  const [errorCount, setErrorCount] = useState(0);

  const fallbackEmoji = LEVEL_METADATA[safeLevel]?.icon || '👑';
  const sizeClass = SIZE_MAP[size] || SIZE_MAP.md;

  const handleError = () => {
    setErrorCount((prev) => prev + 1);
  };

  // If both primary and secondary fallback URLs failed to load
  if (errorCount >= 2) {
    if (!showFallbackEmoji) return null;
    return (
      <span
        className={`inline-flex items-center justify-center select-none ${sizeClass} ${className}`}
        title={`سطح ${safeLevel}`}
        role="img"
        aria-label={alt || `سطح ${safeLevel}`}
      >
        {fallbackEmoji}
      </span>
    );
  }

  const currentSrc = errorCount === 0 
    ? getStageIconUrl(safeLevel) 
    : getStageIconFallbackUrl(safeLevel);

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${sizeClass} ${className}`}
    >
      <img
        src={currentSrc}
        alt={alt || `آیکون سطح ${safeLevel}`}
        loading="lazy"
        decoding="async"
        onError={handleError}
        className={`w-full h-full object-contain filter drop-shadow-sm transition-transform duration-200 ${imgClassName}`}
      />
    </div>
  );
};

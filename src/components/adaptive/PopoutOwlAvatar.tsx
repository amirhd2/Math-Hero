import React from 'react';
import { getAssetUrl, getFallbackAssetUrl } from '../../utils/assetPaths';

export interface PopoutOwlAvatarProps {
  /**
   * Tailwind size classes for the circular frame base (e.g. "w-20 h-20 sm:w-24 sm:h-24")
   */
  sizeClassName?: string;
  /**
   * Additional wrapper class names (e.g. positioning, margins)
   */
  className?: string;
}

// Preload owl image into memory immediately to prevent any flicker during card transitions
if (typeof window !== 'undefined') {
  const preloadImg = new Image();
  preloadImg.src = getAssetUrl('assets/characters/owl/Owl.webp');
}

/**
 * PopoutOwlAvatar Component.
 * Displays the Owl character image alone on its own without any box or background behind it.
 */
export const PopoutOwlAvatar: React.FC<PopoutOwlAvatarProps> = ({
  sizeClassName = 'w-20 h-20 sm:w-24 sm:h-24 md:w-26 md:h-26',
  className = '',
}) => {
  const owlUrl = getAssetUrl('assets/characters/owl/Owl.webp');
  const fallbackUrl = getFallbackAssetUrl('assets/characters/owl/Owl.webp');

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    if (!target.dataset.fallback) {
      target.dataset.fallback = '1';
      target.src = fallbackUrl;
    }
  };

  return (
    <div
      className={`relative shrink-0 flex items-center justify-center select-none ${sizeClassName} ${className}`}
      aria-label="آواتار معلم هوشمند"
    >
      {/* Pure owl character image displayed alone without any background box */}
      <img
        src={owlUrl}
        alt="معلم هوشمند"
        decoding="sync"
        loading="eager"
        draggable={false}
        className="w-full h-full object-contain filter drop-shadow-md select-none pointer-events-none transform hover:scale-105 transition-transform duration-300 will-change-transform"
        onError={handleImageError}
      />
    </div>
  );
};

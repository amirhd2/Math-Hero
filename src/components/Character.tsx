/**
 * Reusable Character Component for Math Hero
 * Renders boy or girl avatars with dynamic background colors based on poses.
 */
import React, { useState } from 'react';
import { CharacterGender, CharacterPose } from '../types';
import { getAssetUrl, getFallbackAssetUrl } from '../utils/assetPaths';

interface CharacterProps {
  character: CharacterGender;
  pose?: CharacterPose;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showBadge?: boolean;
  onClick?: () => void;
  fullBody?: boolean;
  noBackground?: boolean;
}

export const Character: React.FC<CharacterProps> = ({
  character = 'boy',
  pose = 'master',
  size = 'md',
  className = '',
  showBadge = false,
  onClick,
  fullBody = false,
  noBackground = false,
}) => {
  const [loadFailed, setLoadFailed] = useState(false);
  const [triedFallback, setTriedFallback] = useState(false);

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
    xl: 'w-44 h-44',
  };

  const isBoy = character === 'boy';
  
  // Background gradient based on pose (warm/cold colors)
  let bgGradient = '';
  switch (pose) {
    case 'thinking':
    case 'sad':
      // Cold colors
      bgGradient = isBoy
        ? 'bg-gradient-to-br from-blue-200 to-indigo-300 dark:from-blue-900/60 dark:to-indigo-800/60'
        : 'bg-gradient-to-br from-purple-200 to-fuchsia-300 dark:from-purple-900/60 dark:to-fuchsia-800/60';
      break;
    case 'celebrating':
    case 'encouraging':
      // Warm colors
      bgGradient = isBoy
        ? 'bg-gradient-to-br from-amber-200 to-orange-300 dark:from-amber-900/60 dark:to-orange-800/60'
        : 'bg-gradient-to-br from-rose-200 to-orange-300 dark:from-rose-900/60 dark:to-orange-800/60';
      break;
    case 'master':
    case 'greeting':
    default:
      // Default/Neutral colors
      bgGradient = isBoy
        ? 'bg-gradient-to-br from-indigo-100 to-blue-200 dark:from-indigo-900/50 dark:to-blue-900/50'
        : 'bg-gradient-to-br from-rose-100 to-pink-200 dark:from-rose-900/50 dark:to-pink-900/50';
      break;
  }

  const poseBadge = () => {
    switch (pose) {
      case 'thinking': return '🤔';
      case 'celebrating': return '🎉';
      case 'greeting': return '👋';
      case 'encouraging': return '💪';
      case 'sad': return '💭';
      case 'master':
      default:
        return '⭐';
    }
  };

  const relPath = fullBody
    ? `assets/characters/${character}/greeting.webp`
    : `assets/characters/${character}/head.webp`;

  const primarySrc = getAssetUrl(relPath);
  const fallbackSrc = getFallbackAssetUrl(relPath);

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center justify-center transition-transform duration-300 ${
        noBackground
          ? onClick ? 'cursor-pointer' : ''
          : `rounded-3xl shadow-xl hover:scale-105 cursor-pointer ${bgGradient}`
      } ${sizeClasses[size]} ${className}`}
      aria-label={`شخصیت ${character === 'boy' ? 'پسر' : 'دختر'} در حالت ${pose}`}
    >
      {!loadFailed ? (
        <img 
          src={triedFallback ? fallbackSrc : primarySrc} 
          alt={`Character ${character}`} 
          className={`w-full h-full object-contain ${
            noBackground
              ? 'filter drop-shadow-xl sm:drop-shadow-2xl'
              : 'filter drop-shadow-sm p-1'
          }`}
          onError={() => {
            if (!triedFallback) {
              setTriedFallback(true);
            } else {
              setLoadFailed(true);
            }
          }}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center select-none">
          <span className="text-4xl sm:text-5xl filter drop-shadow-md">{isBoy ? '👦' : '👧'}</span>
          {!noBackground && (
            <span className="text-[10px] font-black mt-1 text-slate-700 dark:text-slate-300">
              {isBoy ? 'قهرمان' : 'قهرمان'}
            </span>
          )}
        </div>
      )}
      {showBadge && (
        <span className="absolute -bottom-1 -right-1 flex items-center justify-center w-6 h-6 bg-amber-400 text-slate-900 rounded-full text-xs font-bold shadow-md border-2 border-white dark:border-slate-900">
          {poseBadge()}
        </span>
      )}
    </div>
  );
};

/**
 * Reusable Character Component for Math Hero
 * Renders boy or girl avatars in various poses (master, thinking, celebrating, greeting, encouraging).
 */

import React from 'react';
import { CharacterGender, CharacterPose } from '../types';

interface CharacterProps {
  character: CharacterGender;
  pose?: CharacterPose;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showBadge?: boolean;
  onClick?: () => void;
}

export const Character: React.FC<CharacterProps> = ({
  character = 'boy',
  pose = 'master',
  size = 'md',
  className = '',
  showBadge = false,
  onClick,
}) => {
  const sizeClasses = {
    sm: 'w-12 h-12 text-2xl',
    md: 'w-20 h-20 text-4xl',
    lg: 'w-32 h-32 text-6xl',
    xl: 'w-44 h-44 text-8xl',
  };

  const isBoy = character === 'boy';

  // Thematic background gradients and emojis / vector representation
  const bgGradient = isBoy
    ? 'bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-indigo-500/30'
    : 'bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-rose-500/30';

  const poseEmoji = () => {
    switch (pose) {
      case 'thinking': return isBoy ? '👦🏻' : '👧🏻';
      case 'celebrating': return '🏆';
      case 'greeting': return isBoy ? '👦🏽' : '👧🏽';
      case 'encouraging': return '⭐';
      case 'sad': return '💡';
      case 'master':
      default:
        return isBoy ? '👦' : '👧';
    }
  };

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

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center justify-center rounded-3xl shadow-xl transition-transform duration-300 hover:scale-105 cursor-pointer ${bgGradient} ${sizeClasses[size]} ${className}`}
      aria-label={`شخصیت ${character === 'boy' ? 'پسر' : 'دختر'} در حالت ${pose}`}
    >
      <span className="select-none filter drop-shadow-md">{poseEmoji()}</span>
      {showBadge && (
        <span className="absolute -bottom-1 -right-1 flex items-center justify-center w-6 h-6 bg-amber-400 text-slate-900 rounded-full text-xs font-bold shadow-md border-2 border-white dark:border-slate-900">
          {poseBadge()}
        </span>
      )}
    </div>
  );
};

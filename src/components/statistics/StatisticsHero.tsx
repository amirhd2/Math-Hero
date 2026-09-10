/**
 * StatisticsHero component for Math Hero.
 * Hero banner at the top of the Statistics page with character looking down at the stats.
 */

import React, { useState } from 'react';
import { UserProfile } from '../../types';
import { StatisticsSummary } from '../../statistics/statisticsTypes';
import { getAssetUrl, getFallbackAssetUrl } from '../../utils/assetPaths';

interface StatisticsHeroProps {
  profile: UserProfile;
  summary?: StatisticsSummary;
}

interface StarItem {
  id: number;
  top: string;
  left?: string;
  right?: string;
  size: number;
  type: 'sparkle4' | 'star5' | 'diamond' | 'dot';
  animation: string;
  duration: string;
  delay: string;
  color: string;
}

const HERO_STARS: StarItem[] = [
  // Top left cluster
  { id: 1, top: '12%', left: '8%', size: 24, type: 'sparkle4', animation: 'starTwinkleFloat1', duration: '3.4s', delay: '0s', color: '#fef08a' },
  { id: 2, top: '26%', left: '15%', size: 16, type: 'star5', animation: 'starTwinkleFloat2', duration: '4.2s', delay: '1.2s', color: '#facc15' },
  { id: 3, top: '45%', left: '9%', size: 20, type: 'sparkle4', animation: 'starTwinkleFloat3', duration: '3.7s', delay: '0.5s', color: '#fbbf24' },
  { id: 4, top: '66%', left: '16%', size: 13, type: 'diamond', animation: 'starTwinkleFloat4', duration: '3.0s', delay: '1.8s', color: '#ffffff' },
  { id: 5, top: '34%', left: '4%', size: 8, type: 'dot', animation: 'starTwinkleFloat1', duration: '2.6s', delay: '0.3s', color: '#fef9c3' },
  { id: 6, top: '78%', left: '7%', size: 7, type: 'dot', animation: 'starTwinkleFloat3', duration: '3.2s', delay: '1.5s', color: '#fef08a' },

  // Center / Title surround
  { id: 7, top: '15%', left: '26%', size: 17, type: 'sparkle4', animation: 'starTwinkleFloat2', duration: '3.5s', delay: '2.0s', color: '#fde047' },
  { id: 8, top: '8%', left: '49%', size: 15, type: 'star5', animation: 'starTwinkleFloat3', duration: '4.4s', delay: '0.8s', color: '#ffffff' },
  { id: 9, top: '14%', right: '25%', size: 17, type: 'sparkle4', animation: 'starTwinkleFloat4', duration: '3.1s', delay: '1.4s', color: '#fde047' },

  // Top right cluster
  { id: 10, top: '10%', right: '9%', size: 26, type: 'sparkle4', animation: 'starTwinkleFloat1', duration: '3.3s', delay: '0.4s', color: '#fef08a' },
  { id: 11, top: '25%', right: '16%', size: 16, type: 'star5', animation: 'starTwinkleFloat2', duration: '3.9s', delay: '1.6s', color: '#facc15' },
  { id: 12, top: '44%', right: '8%', size: 21, type: 'sparkle4', animation: 'starTwinkleFloat3', duration: '3.6s', delay: '0.2s', color: '#fbbf24' },
  { id: 13, top: '64%', right: '15%', size: 13, type: 'diamond', animation: 'starTwinkleFloat4', duration: '2.9s', delay: '2.3s', color: '#ffffff' },
  { id: 14, top: '36%', right: '4%', size: 8, type: 'dot', animation: 'starTwinkleFloat1', duration: '2.7s', delay: '1.1s', color: '#fef9c3' },
  { id: 15, top: '76%', right: '8%', size: 7, type: 'dot', animation: 'starTwinkleFloat2', duration: '3.3s', delay: '0.7s', color: '#fef08a' },

  // Near character flanks
  { id: 16, top: '56%', left: '31%', size: 15, type: 'sparkle4', animation: 'starTwinkleFloat2', duration: '3.8s', delay: '0.9s', color: '#fef08a' },
  { id: 17, top: '57%', right: '30%', size: 15, type: 'sparkle4', animation: 'starTwinkleFloat4', duration: '3.4s', delay: '1.7s', color: '#fde047' },
];

export const StatisticsHero: React.FC<StatisticsHeroProps> = ({ profile }) => {
  const gender = profile.gender || 'boy';
  const [fallbackStage, setFallbackStage] = useState(0);

  // Character "Looking down" image sources with comprehensive fallbacks (PNG & WebP, relative & root)
  const imageSources = [
    getAssetUrl(`assets/characters/${gender}/Looking down.png`),
    getFallbackAssetUrl(`assets/characters/${gender}/Looking down.png`),
    getAssetUrl(`assets/characters/${gender}/Looking down.webp`),
    getFallbackAssetUrl(`assets/characters/${gender}/Looking down.webp`),
  ];

  const currentSrc = imageSources[Math.min(fallbackStage, imageSources.length - 1)];

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 rounded-3xl pt-6 sm:pt-8 px-6 sm:px-8 pb-0 text-white shadow-2xl">
      {/* Background Decorative Blur Orbs */}
      <div className="absolute -top-12 -left-12 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />

      {/* Shooting Stars / Comets */}
      <div
        className="absolute top-3 right-10 w-28 h-[2px] bg-gradient-to-l from-transparent via-amber-200 to-white rounded-full pointer-events-none filter drop-shadow-[0_0_8px_#fde047]"
        style={{
          animation: 'shootingStarGlide1 8s cubic-bezier(0.25, 1, 0.5, 1) infinite',
        }}
      />
      <div
        className="absolute top-12 right-28 w-20 h-[1.5px] bg-gradient-to-l from-transparent via-yellow-200 to-white rounded-full pointer-events-none filter drop-shadow-[0_0_6px_#fef08a]"
        style={{
          animation: 'shootingStarGlide2 10.5s cubic-bezier(0.25, 1, 0.5, 1) infinite',
        }}
      />

      {/* Twinkling & Floating Stars Layer */}
      <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden">
        {HERO_STARS.map((star) => (
          <div
            key={star.id}
            className="absolute will-change-transform"
            style={{
              top: star.top,
              left: star.left,
              right: star.right,
              width: star.size,
              height: star.size,
              color: star.color,
              animation: `${star.animation} ${star.duration} ease-in-out infinite`,
              animationDelay: star.delay,
              filter: `drop-shadow(0 0 ${Math.max(4, Math.round(star.size / 2.5))}px ${star.color})`,
            }}
          >
            {star.type === 'sparkle4' && (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                <path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z" />
              </svg>
            )}
            {star.type === 'star5' && (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            )}
            {star.type === 'diamond' && (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                <path d="M12 2L2 12L12 22L22 12L12 2Z" />
              </svg>
            )}
            {star.type === 'dot' && (
              <div
                className="w-full h-full rounded-full"
                style={{ backgroundColor: star.color }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Main Content: Title & Subtitle */}
      <div className="relative z-10 text-center space-y-2 max-w-2xl mx-auto">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight drop-shadow-sm">
          کارنامه و افتخارات {profile.name}
        </h2>
        <p className="text-indigo-100 text-xs sm:text-sm md:text-base font-medium">
          ببین چقدر تمرین کردی و چقدر مهارت‌هات قوی‌تر شدن!
        </p>
      </div>

      {/* Character looking down: Placed at the bottom of the card with ZERO distance from the bottom edge */}
      <div className="relative z-10 flex justify-center items-end mt-4 sm:mt-6 leading-none">
        <img
          src={currentSrc}
          alt={`شخصیت ${gender === 'boy' ? 'پسر' : 'دختر'}`}
          className="h-44 sm:h-52 md:h-60 lg:h-68 w-auto object-contain object-bottom block select-none pointer-events-none filter drop-shadow-2xl -mb-[1px]"
          onError={() => {
            if (fallbackStage < imageSources.length - 1) {
              setFallbackStage((prev) => prev + 1);
            }
          }}
        />
      </div>
    </div>
  );
};


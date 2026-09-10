/**
 * LevelProgressCard component for Math Hero.
 * Displays level, title, XP in current level, and smooth progress bar.
 * Reusable across Home, Achievements, and Profile.
 */

import React, { useState, useRef, useEffect } from 'react';
import { LevelInfo } from '../../gamification/gamificationTypes';
import { LEVEL_DEFINITIONS } from '../../gamification/levelCalculator';
import { formatNumber } from '../../utils/persian';
import { StageIcon } from '../common/StageIcon';
import { StagesRoadmapModal } from './StagesRoadmapModal';

interface LevelProgressCardProps {
  levelInfo: LevelInfo;
  className?: string;
}

export const LevelProgressCard: React.FC<LevelProgressCardProps> = ({
  levelInfo,
  className = '',
}) => {
  const [isRoadmapOpen, setIsRoadmapOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to center current level card on mount
  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeItem = scrollContainerRef.current.querySelector('[data-current-level="true"]');
      if (activeItem) {
        activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [levelInfo.level]);

  return (
    <>
      <div
        id="level-progress-card"
        className={`bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 ${className}`}
      >
        {/* Top Header: Title & Level */}
        <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center shadow-inner p-1">
              <StageIcon level={levelInfo.level} size="md" className="w-9 h-9" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">
                  {levelInfo.title}
                </h3>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs sm:text-sm font-black text-indigo-600 dark:text-indigo-400">
                  سطح {formatNumber(levelInfo.level, 'persian')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Medals Stage Carousel with Hollow/Filled Connecting Rods */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 px-1">
            <span>مدال‌های سطوح</span>
            <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-black">
              قابلیت اسکرول افقی ⟵
            </span>
          </div>

          <div
            ref={scrollContainerRef}
            dir="rtl"
            className="flex items-center overflow-x-auto scrollbar-thin scrollbar-thumb-indigo-200 dark:scrollbar-thumb-slate-700 py-3 px-2 gap-0 select-none"
          >
            {LEVEL_DEFINITIONS.map((def, idx) => {
              const isCurrent = def.level === levelInfo.level;
              const isUnlocked = def.level <= levelInfo.level;
              const isCompleted = def.level < levelInfo.level;
              const hasNext = idx < LEVEL_DEFINITIONS.length - 1;

              return (
                <React.Fragment key={def.level}>
                  {/* Stage Medal Card */}
                  <div
                    data-current-level={isCurrent}
                    className={`w-32 sm:w-36 md:w-40 shrink-0 relative rounded-2xl sm:rounded-3xl p-3 sm:p-3.5 flex flex-col items-center justify-between border min-h-[160px] sm:min-h-[185px] transition-all group ${
                      isCurrent
                        ? 'bg-gradient-to-b from-amber-50/90 via-amber-50/40 to-white dark:from-amber-950/40 dark:via-slate-900 dark:to-slate-900 border-2 border-amber-400 dark:border-amber-500 shadow-lg shadow-amber-500/10 scale-105 z-10'
                        : isUnlocked
                        ? 'bg-gradient-to-b from-slate-50 to-white dark:from-slate-850 dark:to-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 shadow-sm'
                        : 'bg-slate-100/60 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 opacity-60'
                    }`}
                  >
                    {/* Top-Left: Level Badge */}
                    <span
                      className={`absolute top-2 left-2 px-1.5 py-0.5 rounded-lg text-[10px] font-black border ${
                        isCurrent
                          ? 'bg-amber-400 text-slate-950 border-amber-300'
                          : isUnlocked
                          ? 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-400 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      سطح {formatNumber(def.level, 'persian')}
                    </span>

                    {/* Top-Right: Status Icon */}
                    <div className="absolute top-2 right-2">
                      {isCurrent ? (
                        <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 text-xs font-black flex items-center justify-center shadow animate-pulse">
                          ★
                        </span>
                      ) : isCompleted ? (
                        <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-xs font-black flex items-center justify-center shadow">
                          ✓
                        </span>
                      ) : (
                        <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-400 text-xs flex items-center justify-center">
                          🔒
                        </span>
                      )}
                    </div>

                    {/* Center: Stage Icon - Maximized size inside box */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-26 md:h-26 my-auto flex items-center justify-center p-0">
                      <StageIcon
                        level={def.level}
                        size="fill"
                        className={`w-full h-full object-contain filter transition-transform duration-300 ${
                          isUnlocked
                            ? 'drop-shadow-md group-hover:scale-110'
                            : 'grayscale opacity-35 brightness-75'
                        }`}
                      />
                    </div>

                    {/* Bottom: Stage Title */}
                    <div className="w-full text-center mt-1">
                      <span
                        className={`block text-xs sm:text-sm font-black truncate px-0.5 ${
                          isCurrent
                            ? 'text-amber-700 dark:text-amber-300 font-extrabold'
                            : isUnlocked
                            ? 'text-slate-800 dark:text-slate-100'
                            : 'text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        {def.title}
                      </span>
                    </div>
                  </div>

                  {/* 3 Connecting Dots (سه نقطه توخالی یا پر شده بین سطوح) */}
                  {hasNext && (
                    <div
                      className="w-8 sm:w-11 md:w-14 shrink-0 flex items-center justify-center px-1"
                      title={
                        levelInfo.level > def.level
                          ? 'مسیر کامل شده است'
                          : levelInfo.level === def.level
                          ? `پیشرفت تا سطح بعدی: ${formatNumber(levelInfo.progressPercent, 'persian')}٪`
                          : 'سطح قفل شده'
                      }
                    >
                      <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                        {[0, 1, 2].map((dotIdx) => {
                          // In RTL, dot 0 is rightmost (closest to current level), dot 2 is leftmost (closest to next level)
                          const isCompletedStep = levelInfo.level > def.level;
                          const isCurrentStep = levelInfo.level === def.level;

                          let isFilled = false;
                          let isActive = false;

                          if (isCompletedStep) {
                            isFilled = true;
                          } else if (isCurrentStep) {
                            const thresholds = [25, 55, 85];
                            if (levelInfo.progressPercent >= thresholds[dotIdx]) {
                              isFilled = true;
                            } else if (
                              (dotIdx === 0 && levelInfo.progressPercent < 25) ||
                              (dotIdx === 1 && levelInfo.progressPercent >= 25 && levelInfo.progressPercent < 55) ||
                              (dotIdx === 2 && levelInfo.progressPercent >= 55 && levelInfo.progressPercent < 85)
                            ) {
                              isActive = true; // currently targeted dot
                            }
                          }

                          return (
                            <div
                              key={dotIdx}
                              className={`transition-all duration-300 rounded-full ${
                                isFilled
                                  ? 'w-2.5 h-2.5 sm:w-3 sm:h-3 bg-gradient-to-r from-indigo-500 to-indigo-600 border border-indigo-400 dark:border-indigo-300 shadow-xs shadow-indigo-500/40 scale-105'
                                  : isActive
                                  ? 'w-2.5 h-2.5 sm:w-3 sm:h-3 border-2 border-amber-400 bg-amber-200/50 dark:bg-amber-900/40 animate-pulse'
                                  : 'w-2.5 h-2.5 sm:w-3 sm:h-3 border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-850'
                              }`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* XP Progress Bar for Current Level */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs font-black">
            <span className="text-slate-600 dark:text-slate-300">
              {levelInfo.isMaxLevel ? (
                <span>👑 بالاترین سطح قهرمان</span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <StageIcon level={levelInfo.level + 1} size="xs" className="w-4 h-4 inline-block opacity-80" />
                  <span>پیشرفت تا سطح {formatNumber(levelInfo.level + 1, 'persian')}</span>
                </span>
              )}
            </span>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">
              {formatNumber(levelInfo.xpInCurrentLevel, 'persian')} / {formatNumber(levelInfo.xpRequiredForNextLevel, 'persian')} XP
              <span className="text-slate-400 mr-1.5">
                ({formatNumber(levelInfo.progressPercent, 'persian')}٪)
              </span>
            </span>
          </div>

          <div className="w-full h-3.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
            <div
              className="h-full bg-gradient-to-l from-indigo-500 via-indigo-600 to-indigo-700 rounded-full transition-all duration-700 shadow-sm"
              style={{ width: `${Math.max(4, levelInfo.progressPercent)}%` }}
            />
          </div>

          {/* Under progress bar as requested: فقط n xp تا سطح بعدی */}
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center font-bold pt-1">
            {levelInfo.isMaxLevel
              ? 'به بالاترین سطح قهرمانی ریاضی دست پیدا کرده‌اید!'
              : `فقط ${formatNumber(
                  Math.max(0, levelInfo.xpRequiredForNextLevel - levelInfo.xpInCurrentLevel),
                  'persian'
                )} XP تا سطح بعدی`}
          </p>
        </div>

        {/* Educational Requirement Hint when gated or approaching milestone */}
        {levelInfo.nextLevelEducationalRequirementText && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 rounded-2xl text-xs text-amber-800 dark:text-amber-300 font-bold">
            <span className="text-base">🎯</span>
            <span className="leading-relaxed">{levelInfo.nextLevelEducationalRequirementText}</span>
          </div>
        )}

        {/* Attractive Button at Bottom: نقشه مسیر */}
        <div className="pt-1">
          <button
            onClick={() => setIsRoadmapOpen(true)}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white font-black text-sm sm:text-base shadow-lg shadow-indigo-500/25 hover:shadow-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer transform hover:-translate-y-0.5"
            title="مشاهده نقشه کامل مسیر ۲۰ سطح قهرمانی"
          >
            <span className="text-lg">🗺️</span>
            <span>نقشه مسیر (مشاهده جزئیات کامل ۲۰ سطح قهرمانی)</span>
          </button>
        </div>
      </div>

      {/* 20 Stages Full Roadmap Modal */}
      <StagesRoadmapModal
        isOpen={isRoadmapOpen}
        onClose={() => setIsRoadmapOpen(false)}
        currentLevel={levelInfo.level}
      />
    </>
  );
};


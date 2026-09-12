/**
 * ResultsScreen component for Math Hero.
 * Implements the complete Quiz Results, Score Summary, Gamified XP/Level Progression,
 * Achievement Unlocks, Sticky Review Cards Stack, and Practice Mistakes flows.
 */

import React, { useEffect, useState } from 'react';
import { QuizResult, UserProfile, AppSettings, ScreenId, QuizSession } from '../types';
import { ResultsHero } from '../components/results/ResultsHero';
import { ScoreSummary } from '../components/results/ScoreSummary';
import { PerformanceMessage } from '../components/results/PerformanceMessage';
import { XPProgress } from '../components/results/XPProgress';
import { AchievementUnlock } from '../components/results/AchievementUnlock';
import { StickyReviewStack } from '../components/results/StickyReviewStack';
import { ResultsActions } from '../components/results/ResultsActions';
import { ConfettiCanvas } from '../components/results/ConfettiCanvas';
import { sound } from '../utils/sound';
import { formatNumber } from '../utils/persian';
import { getAssetUrl, getFallbackAssetUrl } from '../utils/assetPaths';
import { calculateMeasurableImprovement } from '../smartReview/smartReviewPersistence';
import { SmartTeacherEngine } from '../adaptive/smartTeacherEngine';
import { PromotionEvent } from '../adaptive/adaptiveTypes';
import { PromotionModal } from '../components/adaptive/PromotionModal';
import { LevelUpModal } from '../components/gamification/LevelUpModal';
import { TrophyUnlockModal } from '../components/gamification/TrophyUnlockModal';
import { gamificationEngine } from '../gamification/gamificationEngine';
import { TrophyInfo } from '../gamification/gamificationTypes';
import { BackButton } from '../components/common/BackButton';


interface ResultsScreenProps {
  result: QuizResult;
  profile: UserProfile;
  settings: AppSettings;
  onNavigate: (screen: ScreenId) => void;
  onStartSession?: (session: QuizSession) => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  result,
  profile,
  settings,
  onNavigate,
}) => {

  const [showConfetti, setShowConfetti] = useState(false);

  const isExcellent = result.score >= 80;
  const leveledUp = Boolean(
    result.leveledUp || (result.levelBefore && result.levelAfter && result.levelAfter > result.levelBefore)
  );
  const trophyUpgraded = Boolean(
    result.trophyUpgraded ||
      (result.trophyStageAfter &&
        result.trophyStageBefore &&
        result.trophyStageAfter > result.trophyStageBefore)
  );
  const hasAchievements = Boolean(
    result.unlockedAchievements && result.unlockedAchievements.length > 0
  );
  const mistakes = result.mistakes || [];
  const hasMistakes = mistakes.length > 0;

  const [modalQueue, setModalQueue] = useState<('levelup' | 'trophy' | 'promotion')[]>([]);
  const [pendingPromotion, setPendingPromotion] = useState<PromotionEvent | null>(null);
  const [trophyDetails, setTrophyDetails] = useState<TrophyInfo | null>(null);

  useEffect(() => {
    const queue: ('levelup' | 'trophy' | 'promotion')[] = [];

    // Rule 1: Always show Level Up banner if leveled up
    if (leveledUp) {
      queue.push('levelup');
    }

    // Rule 2: Always show Trophy unlock banner if trophy upgraded
    if (trophyUpgraded) {
      queue.push('trophy');
      gamificationEngine.getOverviewData().then((overview) => {
        if (overview?.trophyInfo) {
          setTrophyDetails(overview.trophyInfo);
        }
      });
    }

    // Skill tier promotion
    SmartTeacherEngine.getPendingPromotion().then((promo) => {
      if (promo) {
        setPendingPromotion(promo);
        if (!queue.includes('promotion')) {
          queue.push('promotion');
        }
      }
      setModalQueue(queue);
    });
  }, [leveledUp, trophyUpgraded]);

  const handleDismissCurrentModal = async () => {
    const currentModal = modalQueue[0];
    if (currentModal === 'promotion' && pendingPromotion) {
      await SmartTeacherEngine.acceptPromotion(pendingPromotion.id);
      setPendingPromotion(null);
    }
    setModalQueue((prev) => prev.slice(1));
  };

  // Sound and celebration effects on mount
  useEffect(() => {
    if (isExcellent || leveledUp) {
      setShowConfetti(true);
    }

    if (leveledUp) {
      sound.playLevelUp(settings.soundEnabled);
    } else if (hasAchievements) {
      sound.playAchievement(settings.soundEnabled);
    } else if (isExcellent) {
      sound.playFanfare(settings.soundEnabled);
    } else {
      sound.playComplete(settings.soundEnabled);
    }
  }, [isExcellent, leveledUp, hasAchievements, settings.soundEnabled]);

  const handleGoHome = () => {
    sound.playClick(settings.soundEnabled);
    onNavigate('home');
  };


  // Determine character image based on score and gender
  let relativePath = '';
  const percentage = result.score;
  if (profile.gender === 'boy') {
    if (percentage <= 40) relativePath = 'assets/characters/boy/quiz answer/5.webp';
    else if (percentage <= 50) relativePath = 'assets/characters/boy/quiz answer/thinking.webp';
    else if (percentage <= 60) relativePath = 'assets/characters/boy/quiz answer/encouraging.webp';
    else if (percentage <= 70) relativePath = 'assets/characters/boy/quiz answer/13.webp';
    else if (percentage <= 80) relativePath = 'assets/characters/boy/quiz answer/11.webp';
    else if (percentage <= 90) relativePath = 'assets/characters/boy/quiz answer/9.webp';
    else relativePath = 'assets/characters/boy/quiz answer/Celebrating.webp';
  } else {
    if (percentage <= 40) relativePath = 'assets/characters/girl/quiz answer/15.webp';
    else if (percentage <= 50) relativePath = 'assets/characters/girl/quiz answer/5.webp';
    else if (percentage <= 60) relativePath = 'assets/characters/girl/quiz answer/17.webp';
    else if (percentage <= 70) relativePath = 'assets/characters/girl/quiz answer/16.webp';
    else if (percentage <= 80) relativePath = 'assets/characters/girl/quiz answer/3.webp';
    else if (percentage <= 90) relativePath = 'assets/characters/girl/quiz answer/10.webp';
    else relativePath = 'assets/characters/girl/quiz answer/12.webp';
  }
  const characterImage = getAssetUrl(relativePath);
  const characterFallback = getFallbackAssetUrl(relativePath);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-slate-50 dark:bg-slate-950" dir="rtl">
      {/* Confetti celebration for achievements/high-scores */}
      <ConfettiCanvas active={showConfetti} reducedMotion={settings.reducedMotion} />

      {/* FIXED BACKGROUND: Dynamic Character Image */}
      <div className="fixed inset-0 md:top-16 z-0 pointer-events-none bg-slate-100 dark:bg-slate-950" dir="ltr">
        {/* Mobile: Top 65%. Desktop: Left 50% */}
        <div className="absolute top-0 left-0 w-full h-[65vh] lg:w-1/2 lg:h-[calc(100vh-4rem)] flex flex-col justify-end items-center pb-4 lg:pb-0 bg-transparent">
          <img 
            src={characterImage}
            onError={(e) => {
              (e.target as HTMLImageElement).src = characterFallback;
            }}
            loading="eager"
            decoding="async"
            className="max-h-full max-w-full object-contain drop-shadow-2xl origin-bottom" 
            alt="Character Feedback" 
          />
        </div>
      </div>


      {/* SCROLLABLE CONTENT */}
      <div className="relative z-10 w-full flex lg:justify-start min-h-screen pointer-events-none">
        {/* Cards Container */}
        <div className="pointer-events-auto w-full lg:w-1/2 mt-[60vh] lg:mt-0 bg-slate-50/90 dark:bg-slate-900/90 lg:bg-slate-50 lg:dark:bg-slate-950 backdrop-blur-xl lg:backdrop-blur-none rounded-t-[2.5rem] lg:rounded-none p-4 sm:p-6 lg:p-8 space-y-6 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] lg:shadow-[-10px_0_40px_rgba(0,0,0,0.1)] min-h-[40vh] lg:min-h-screen pb-32">
          
          {/* Top Header - Title on right, BackButton on left */}
          <div className="flex items-center justify-between pt-2 pb-2">
            <div className="text-right">
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100">
                کارنامه آزمون
              </h2>
              <p className="text-xs text-slate-400 font-medium">نتیجه عملکرد و امتیازات کسب‌شده</p>
            </div>
            <BackButton onClick={handleGoHome} title="بازگشت به خانه" />
          </div>

          {/* Top Hero Section: Character feedback and outcome badge */}
          <ResultsHero profile={profile} result={result} />

          {/* Smart Review Specific Outcome Banner */}
          {result.source === 'smart-review' && (
            <div
              id="smart-review-results-banner"
              className="bg-gradient-to-r from-indigo-950 via-indigo-900 to-purple-950 text-white p-5 rounded-3xl border border-indigo-500/40 shadow-xl space-y-2.5"
              dir="rtl"
            >
              <div className="flex items-center gap-2 text-xs font-black text-amber-300">
                <span>⭐</span>
                <span>آزمون مرور هوشمند و تطبیقی</span>
              </div>
              <h3 className="text-lg font-black text-white">
                مهارت‌های انتخابی با موفقیت تمرین شدند!
              </h3>
              {result.smartReviewMetadata?.accuracyDelta !== undefined && result.smartReviewMetadata.accuracyDelta > 0 && (
                <p className="text-xs sm:text-sm text-emerald-300 font-bold">
                  {calculateMeasurableImprovement(result, result.smartReviewMetadata.preReviewAccuracy) ||
                    `دقت شما در این مهارت‌ها +${formatNumber(result.smartReviewMetadata.accuracyDelta, 'persian')}٪ ارتقا یافت! 📈`}
                </p>
              )}
              {result.smartReviewMetadata?.targetedSkills && result.smartReviewMetadata.targetedSkills.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {result.smartReviewMetadata.targetedSkills.map((s, idx) => (
                    <span
                      key={idx}
                      className="bg-white/15 px-3 py-1 rounded-xl text-xs font-bold text-indigo-100 border border-white/10"
                    >
                      🎯 {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Main Content: Adaptive layout */}
          <div className="flex flex-col gap-6 w-full">
            {/* Primary Cards (Stats, Score & XP Progress) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6 items-start">
              <div className="w-full">
                <ScoreSummary result={result} />
              </div>
              <div className="w-full">
                <XPProgress profile={profile} result={result} />
              </div>
            </div>

            {/* Smart Teacher Feedback Card - Formatted identically to Home dashboard */}
            <div className="w-full">
              <PerformanceMessage result={result} />
            </div>

            {/* Unlocked Achievements */}
            {hasAchievements && (
              <div className="w-full">
                <AchievementUnlock unlockedAchievements={result.unlockedAchievements} />
              </div>
            )}

            {/* Mistakes Review Stack (Only renders when there are mistakes to review) */}
            {hasMistakes && (
              <div className="w-full">
                <StickyReviewStack mistakes={mistakes} gender={profile.gender} />
              </div>
            )}
          </div>
          
          {/* Sticky Bottom Actions inside the scrollable container */}
          <div className="pt-4">
             <ResultsActions
               onGoHome={handleGoHome}
               onViewAchievements={() => onNavigate('achievements')}
             />
          </div>


          {/* Celebration Modals Queue (Level Up, Trophy Unlock, Skill Promotion) */}
          {modalQueue[0] === 'levelup' && (
            <LevelUpModal
              level={result.levelAfter || profile.level}
              onAccept={handleDismissCurrentModal}
              soundEnabled={settings.soundEnabled}
            />
          )}

          {modalQueue[0] === 'trophy' && trophyDetails && (
            <TrophyUnlockModal
              trophyInfo={trophyDetails}
              onAccept={handleDismissCurrentModal}
              soundEnabled={settings.soundEnabled}
            />
          )}

          {modalQueue[0] === 'promotion' && pendingPromotion && (
            <PromotionModal
              promotion={pendingPromotion}
              onAccept={handleDismissCurrentModal}
              soundEnabled={settings.soundEnabled}
            />
          )}
        </div>
      </div>
    </div>
  );
};

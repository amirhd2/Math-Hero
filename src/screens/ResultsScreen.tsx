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
import {
  createPracticeMistakesSession,
  createRetryQuizSession,
} from '../results/reviewSessionGenerator';
import { DEFAULT_QUIZ_CONFIG } from '../utils/questionGenerator';
import { calculateMeasurableImprovement } from '../smartReview/smartReviewPersistence';

interface ResultsScreenProps {
  result: QuizResult;
  profile: UserProfile;
  settings: AppSettings;
  onNavigate: (screen: ScreenId) => void;
  onStartSession: (session: QuizSession) => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  result,
  profile,
  settings,
  onNavigate,
  onStartSession,
}) => {
  const [showConfetti, setShowConfetti] = useState(false);

  const isExcellent = result.score >= 80;
  const leveledUp = Boolean(
    result.leveledUp || (result.levelBefore && result.levelAfter && result.levelAfter > result.levelBefore)
  );
  const hasAchievements = Boolean(
    result.unlockedAchievements && result.unlockedAchievements.length > 0
  );
  const mistakes = result.mistakes || [];
  const hasMistakes = mistakes.length > 0;

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

  // Handler for "Practice These Mistakes"
  const handlePracticeMistakes = () => {
    sound.playClick(settings.soundEnabled);
    const reviewSession = createPracticeMistakesSession(mistakes, result.config);
    onStartSession(reviewSession);
  };

  // Handler for "Try Again"
  const handleRetryQuiz = () => {
    sound.playClick(settings.soundEnabled);
    const config = result.config || DEFAULT_QUIZ_CONFIG;
    const retrySession = createRetryQuizSession(config);
    onStartSession(retrySession);
  };

  const handleGoHome = () => {
    sound.playClick(settings.soundEnabled);
    onNavigate('home');
  };

  return (
    <div className="relative min-h-[calc(100dvh-5rem)] pb-12 px-4 md:px-8 max-w-5xl mx-auto space-y-6">
      {/* Confetti celebration for achievements/high-scores */}
      <ConfettiCanvas active={showConfetti} reducedMotion={settings.reducedMotion} />

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

      {/* Main Content: Adaptive layout (single column mobile, 2-column tablet/desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Primary Column (Stats, Score, XP & Achievements) */}
        <div className="lg:col-span-6 space-y-6">
          <ScoreSummary result={result} />
          <PerformanceMessage result={result} />
          <XPProgress profile={profile} result={result} />
          <AchievementUnlock unlockedAchievements={result.unlockedAchievements} />
        </div>

        {/* Right / Secondary Column (Sticky Review Stack for Mistakes) */}
        <div className="lg:col-span-6 space-y-6">
          <StickyReviewStack mistakes={mistakes} gender={profile.gender} />
        </div>
      </div>

      {/* Sticky Bottom Actions */}
      <ResultsActions
        hasMistakes={hasMistakes}
        onPracticeMistakes={handlePracticeMistakes}
        onRetryQuiz={handleRetryQuiz}
        onGoHome={handleGoHome}
        onViewAchievements={() => onNavigate('achievements')}
      />
    </div>
  );
};

/**
 * ProfileScreen component for Math Hero.
 * Child profile view and editor with interactive character poses,
 * gamification stats, trophies summary, and real performance metrics.
 */

import React, { useState, useEffect } from 'react';
import { UserProfile, CharacterGender, QuizResult, ScreenId } from '../types';
import { formatNumber } from '../utils/persian';
import { storage } from '../utils/storage';
import { getLevelProgress } from '../gamification/levelCalculator';
import { getTrophyInfo } from '../gamification/trophyManager';
import { gamificationEngine } from '../gamification/gamificationEngine';
import { CurrentBadgeCard } from '../components/CurrentBadgeCard';
import { StarBackgroundWatermark } from '../components/StarBackgroundWatermark';
import { getAssetUrl, getFallbackAssetUrl, getTrophyCupUrl, getTrophyCupFallbackUrl } from '../utils/assetPaths';
import { BackButton } from '../components/common/BackButton';
import { StageIcon } from '../components/common/StageIcon';

interface ProfileScreenProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onBack: () => void;
  onNavigate?: (screen: ScreenId) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  profile,
  onUpdateProfile,
  onBack,
  onNavigate,
}) => {
  const [name, setName] = useState(profile.name);
  const [age, setAge] = useState(profile.age);
  const [gender, setGender] = useState<CharacterGender>(profile.gender);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [unlockedBadgesCount, setUnlockedBadgesCount] = useState(0);
  const [levelProgressData, setLevelProgressData] = useState<any>(null);
  const [trophyProgressData, setTrophyProgressData] = useState<any>(null);
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    totalQuestions: 0,
    accuracy: 0,
    favoriteOp: 'جمع',
  });

  // Calculate real performance metrics & gamification state from storage
  useEffect(() => {
    async function loadStats() {
      try {
        const results: QuizResult[] = await storage.getResults();
        const overview = await gamificationEngine.getOverviewData();
        setUnlockedBadgesCount(overview.unlockedBadges.length);
        setLevelProgressData(overview.levelInfo);
        setTrophyProgressData(overview.trophyInfo);

        if (results && results.length > 0) {
          const totalQ = results.reduce((acc, r) => acc + (r.totalQuestions || 0), 0);
          const totalCorrect = results.reduce((acc, r) => acc + (r.correctCount || 0), 0);
          const accuracy = totalQ > 0 ? Math.round((totalCorrect / totalQ) * 100) : 0;

          // Find most frequent operation
          const opCounts: Record<string, number> = {};
          results.forEach((r) => {
            opCounts[r.operation] = (opCounts[r.operation] || 0) + 1;
          });

          let maxCount = 0;
          let fav = 'addition';
          Object.entries(opCounts).forEach(([op, count]) => {
            if (count > maxCount) {
              maxCount = count;
              fav = op;
            }
          });

          const opNames: Record<string, string> = {
            addition: 'جمع (+)',
            subtraction: 'تفریق (-)',
            multiplication: 'ضرب (×)',
            division: 'تقسیم (÷)',
            mixed: 'مخلوط',
          };

          setStats({
            totalQuizzes: results.length,
            totalQuestions: totalQ,
            accuracy,
            favoriteOp: opNames[fav] || 'جمع (+)',
          });
        }
      } catch (err) {
        console.error('Error loading quiz stats:', err);
      }
    }
    loadStats();
  }, []);

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const updated: UserProfile = {
      ...profile,
      name: name.trim() || 'قهرمان کوچک',
      age: Number(age) || 8,
      gender,
      avatarId: gender === 'boy' ? 'boy-master' : 'girl-master',
    };
    onUpdateProfile(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const levelInfo = levelProgressData || getLevelProgress(profile.xp);
  const trophyInfo = trophyProgressData || getTrophyInfo(levelInfo.level, unlockedBadgesCount);
  const remainingXp = Math.max(0, levelInfo.xpRequiredForNextLevel - levelInfo.xpInCurrentLevel);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
      {/* Floating Success Toast (Always visible regardless of scroll position) */}
      {savedSuccess && (
        <div
          role="status"
          className="fixed bottom-8 sm:bottom-10 left-1/2 -translate-x-1/2 z-50 max-w-md w-[90%] sm:w-auto px-6 py-3.5 rounded-2xl bg-emerald-600 text-white font-black text-center shadow-2xl shadow-emerald-900/40 border border-emerald-400/60 flex items-center justify-center gap-2.5 backdrop-blur-md transition-all"
        >
          <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm font-black shrink-0">✓</span>
          <span className="text-sm sm:text-base font-extrabold">اطلاعات قهرمان با موفقیت به‌روزرسانی شد!</span>
        </div>
      )}

      <div className="flex flex-col lg:flex-row items-start gap-6 md:gap-8">
        
        {/* Right Column (Cards) */}
        <div className="w-full lg:w-3/5 xl:w-2/3 space-y-6 md:space-y-8">
          
      {/* Top Desktop Header - Title on right, BackButton on left */}
      <div className="hidden lg:flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <span>👤</span>
          <span>پروفایل قهرمان</span>
        </h2>
        <BackButton
          onClick={onBack}
          title="بازگشت به داشبورد"
        />
      </div>

      {/* Mobile & Tablet Portrait Hero Showcase Card (Matching Attached Design) */}
      <div className="lg:hidden -mx-4 -mt-6 sm:-mx-6 sm:-mt-8 bg-gradient-to-b from-[#8E7FF3] via-[#8373ED] to-[#7968E7] rounded-b-[36px] sm:rounded-b-[44px] p-5 sm:p-7 pt-8 sm:pt-10 pb-6 sm:pb-8 text-white shadow-2xl relative space-y-4">
        {/* Dynamic Twinkling & Fading Stars Background Watermark */}
        <StarBackgroundWatermark count={12} className="rounded-b-[36px] sm:rounded-b-[44px]" />

        {/* Top Header inside Purple Card - Title on right, BackButton on left */}
        <div className="flex items-center justify-between w-full relative z-10 pb-1 px-1">
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
            پروفایل قهرمان
          </h2>
          <BackButton
            onClick={onBack}
            variant="whiteGlass"
            title="بازگشت"
          />
        </div>

        {/* Character & Stats Row - 50/50 Split with 5mm left, 3mm centerline, 5mm top header margins */}
        <div className="grid grid-cols-2 items-stretch relative z-10 gap-2 sm:gap-4 pt-[5mm]">
          {/* Right Side in RTL (50% Column): Name, Level Pill, Progress Bar & XP text (Centered Vertically and Horizontally) */}
          <div className="flex flex-col items-center justify-center text-center space-y-2.5 pb-1 w-full my-auto">
            {/* Name with Edit Pencil */}
            <div className="flex items-center justify-center gap-2">
              <h3 className="text-2xl sm:text-3xl font-black text-white drop-shadow-md">
                {profile.name}
              </h3>
              <button
                type="button"
                onClick={() => document.getElementById('edit-profile-form')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-white/80 hover:text-white text-base transition-colors cursor-pointer"
                title="ویرایش اطلاعات"
              >
                ✏️
              </button>
            </div>

            {/* Level Pill Button */}
            <div className="inline-flex items-center justify-center gap-1.5 px-4 py-1 rounded-full bg-[#5B45B6]/90 text-white font-extrabold text-xs sm:text-sm shadow-inner border border-white/10 tracking-wide">
              <StageIcon level={levelInfo.level} size="xs" className="w-4 h-4" />
              <span>Level {formatNumber(levelInfo.level, 'persian')}</span>
            </div>

            {/* Golden Progress Bar Pill - Dynamic XP & conditional text positioning */}
            <div className="w-full bg-white/20 backdrop-blur-md p-1 rounded-full border border-white/25 shadow-inner relative h-8 sm:h-9 flex items-center justify-between overflow-hidden">
              {/* Dynamic Yellow Fill Bar */}
              <div
                className="h-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 rounded-full shadow-md transition-all duration-500 flex items-center justify-center relative overflow-hidden"
                style={{ width: `${Math.max(8, Math.min(100, levelInfo.progressPercent))}%` }}
              >
                {/* If yellow bar >= 38% wide, place text centered inside yellow bar */}
                {levelInfo.progressPercent >= 38 && (
                  <span className="font-black text-amber-950 text-xs sm:text-sm whitespace-nowrap px-2 drop-shadow-xs">
                    {formatNumber(levelInfo.totalXp || profile.xp, 'persian')} / {formatNumber(levelInfo.nextLevelXpThreshold || (levelInfo.currentLevelXpFloor + levelInfo.xpRequiredForNextLevel), 'persian')} XP
                  </span>
                )}
              </div>

              {/* If yellow bar < 38% wide, place text outside yellow bar to its left */}
              {levelInfo.progressPercent < 38 && (
                <div className="flex-1 flex items-center justify-center font-black text-white text-xs sm:text-sm whitespace-nowrap px-2 drop-shadow-md z-10">
                  {formatNumber(levelInfo.totalXp || profile.xp, 'persian')} / {formatNumber(levelInfo.nextLevelXpThreshold || (levelInfo.currentLevelXpFloor + levelInfo.xpRequiredForNextLevel), 'persian')} XP
                </div>
              )}
            </div>

            {/* Next Level Text */}
            <p className="text-xs sm:text-sm font-extrabold text-white/95 drop-shadow-xs text-center flex items-center justify-center gap-1.5">
              <span>{formatNumber(remainingXp, 'persian')} XP تا Level {formatNumber(levelInfo.level + 1, 'persian')}</span>
              <StageIcon level={levelInfo.level + 1} size="xs" className="w-4 h-4 inline-block opacity-80" />
            </p>
          </div>

          {/* Left Side in RTL (50% Column): Character Container */}
          <div className="flex items-end justify-center w-full relative -ml-5 sm:-ml-7 pl-[2mm] pr-[3mm] z-30 -mt-6 sm:-mt-8 translate-y-3 sm:translate-y-4 -mb-3 sm:-mb-4 h-[calc(100%+24px)] sm:h-[calc(100%+32px)]">
            <img
              src={getAssetUrl(`assets/characters/${gender}/half-body/greeting.webp`)}
              alt="Hero Character"
              className="w-full h-full object-contain object-bottom filter drop-shadow-2xl pointer-events-none"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.dataset.fallback) {
                  target.dataset.fallback = '1';
                  target.src = getFallbackAssetUrl(`assets/characters/${gender}/half-body/greeting.webp`);
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Mobile / Tablet Portrait: Current Honor Badge Card */}
      <div className="lg:hidden">
        <CurrentBadgeCard trophyInfo={trophyInfo} levelTitle={levelInfo.title} level={levelInfo.level} onNavigate={onNavigate} />
      </div>

      {/* Desktop / Tablet Landscape: 2-Column Grid (Right: Current Badge Card, Left: Profile Card) */}
      <div className="hidden lg:grid grid-cols-2 gap-5 sm:gap-6 items-stretch">
        {/* Right Side (Column 1 in RTL): Current Honor Badge Card */}
        <CurrentBadgeCard trophyInfo={trophyInfo} levelTitle={levelInfo.title} level={levelInfo.level} onNavigate={onNavigate} />

        {/* Left Side (Column 2 in RTL): Desktop Profile Card (Styled matching mobile card without character image) */}
        <div className="bg-white dark:bg-slate-900 rounded-[28px] sm:rounded-[32px] p-5 sm:p-6 border border-indigo-100/90 dark:border-slate-800 shadow-xl relative overflow-hidden flex flex-col justify-center items-center text-center space-y-3">
          {/* Subtle Twinkling Star Watermark for Desktop */}
          <StarBackgroundWatermark count={10} className="rounded-[28px] sm:rounded-[32px] opacity-40 dark:opacity-30" />

          {/* Top Header with subtle line dividers: —— کارت پروفایل —— */}
          <div className="flex items-center justify-center gap-3 mb-1 w-full">
            <div className="h-[1.5px] bg-indigo-100/80 dark:bg-slate-700/80 flex-1 max-w-[64px] rounded-full" />
            <span className="text-sm font-black text-indigo-900 dark:text-indigo-300 tracking-wide">
              کارت پروفایل
            </span>
            <div className="h-[1.5px] bg-indigo-100/80 dark:bg-slate-700/80 flex-1 max-w-[64px] rounded-full" />
          </div>

          {/* Name with Edit Pencil */}
          <div className="flex items-center justify-center gap-2">
            <h3 className="text-2xl sm:text-3xl font-black text-indigo-950 dark:text-indigo-100 tracking-tight">
              {profile.name}
            </h3>
            <button
              type="button"
              onClick={() => document.getElementById('edit-profile-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-indigo-400 hover:text-indigo-600 dark:text-indigo-300 text-base transition-colors cursor-pointer"
              title="ویرایش اطلاعات"
            >
              ✏️
            </button>
          </div>

          {/* Level Pill Button */}
          <div className="inline-flex items-center justify-center gap-1.5 px-4 py-1 rounded-full bg-[#5B45B6] text-white font-extrabold text-xs sm:text-sm shadow-inner border border-white/10 tracking-wide">
            <StageIcon level={levelInfo.level} size="xs" className="w-4 h-4" />
            <span>Level {formatNumber(levelInfo.level, 'persian')}</span>
          </div>

          {/* Golden Progress Bar Pill */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 p-1 rounded-full border border-slate-200 dark:border-slate-700 shadow-inner relative h-8 sm:h-9 flex items-center justify-between overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 rounded-full shadow-md transition-all duration-500 flex items-center justify-center relative overflow-hidden"
              style={{ width: `${Math.max(8, Math.min(100, levelInfo.progressPercent))}%` }}
            >
              {levelInfo.progressPercent >= 38 && (
                <span className="font-black text-amber-950 text-xs sm:text-sm whitespace-nowrap px-2 drop-shadow-xs">
                  {formatNumber(levelInfo.totalXp || profile.xp, 'persian')} / {formatNumber(levelInfo.nextLevelXpThreshold || (levelInfo.currentLevelXpFloor + levelInfo.xpRequiredForNextLevel), 'persian')} XP
                </span>
              )}
            </div>

            {levelInfo.progressPercent < 38 && (
              <div className="flex-1 flex items-center justify-center font-black text-slate-700 dark:text-slate-200 text-xs sm:text-sm whitespace-nowrap px-2 drop-shadow-xs z-10">
                {formatNumber(levelInfo.totalXp || profile.xp, 'persian')} / {formatNumber(levelInfo.nextLevelXpThreshold || (levelInfo.currentLevelXpFloor + levelInfo.xpRequiredForNextLevel), 'persian')} XP
              </div>
            )}
          </div>

          {/* Next Level Text */}
          <p className="text-xs sm:text-sm font-extrabold text-slate-600 dark:text-slate-300 text-center flex items-center justify-center gap-1.5">
            <span>{formatNumber(remainingXp, 'persian')} XP تا Level {formatNumber(levelInfo.level + 1, 'persian')}</span>
            <StageIcon level={levelInfo.level + 1} size="xs" className="w-4 h-4 inline-block opacity-80" />
          </p>
        </div>
      </div>

      {/* Trophy & Badges Banner with link to Achievements */}
      <div
        onClick={() => onNavigate && onNavigate('achievements')}
        className="bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 text-slate-950 p-5 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 cursor-pointer hover:shadow-2xl transition-all group"
      >
        <div className="flex items-center gap-4 text-center sm:text-right">
          <div className="w-16 h-16 rounded-2xl bg-white/40 dark:bg-white/30 p-1.5 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform shrink-0">
            <img
              src={getTrophyCupUrl(trophyInfo.stage)}
              alt={trophyInfo.stageNameFa}
              className="w-full h-full object-contain filter drop-shadow"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.dataset.fallback) {
                  target.dataset.fallback = '1';
                  target.src = getTrophyCupFallbackUrl(trophyInfo.stage);
                }
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black px-2 py-0.5 rounded-lg bg-slate-950 text-amber-300">
                مرحله {formatNumber(trophyInfo.stage, 'persian')}
              </span>
              <h4 className="text-lg font-black">{trophyInfo.stageNameFa}</h4>
            </div>
            <p className="text-xs sm:text-sm font-bold opacity-90 mt-0.5">
              {formatNumber(unlockedBadgesCount, 'persian')} نشان افتخار کسب شده • {trophyInfo.nextRequirementText}
            </p>
          </div>
        </div>

        <span className="px-4 py-2 bg-slate-950 text-amber-300 text-xs font-black rounded-xl shadow-md shrink-0 group-hover:bg-slate-900 transition-colors">
          مشاهده تالار افتخارات ←
        </span>
      </div>

      {/* Gamification Summary Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-lg text-center space-y-1 flex flex-col items-center justify-center">
          <StageIcon level={levelInfo.level} size="md" className="w-8 h-8" />
          <p className="text-xs font-bold text-slate-500">سطح قهرمانی</p>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
            {formatNumber(levelInfo.level, 'persian')}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-lg text-center space-y-1">
          <span className="text-2xl">⭐</span>
          <p className="text-xs font-bold text-slate-500">مجموع امتیاز</p>
          <p className="text-2xl font-black text-amber-500">
            {formatNumber(profile.xp, 'persian')} XP
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-lg text-center space-y-1">
          <span className="text-2xl">🔥</span>
          <p className="text-xs font-bold text-slate-500">زنجیره تمرین</p>
          <p className="text-2xl font-black text-rose-500">
            {formatNumber(profile.streakDays, 'persian')} روز
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-lg text-center space-y-1">
          <span className="text-2xl">🪙</span>
          <p className="text-xs font-bold text-slate-500">سکه‌های طلایی</p>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {formatNumber(profile.coins, 'persian')}
          </p>
        </div>
      </div>

      {/* Performance Statistics Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <h4 className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span>📊</span>
            <span>آمار و دستاوردهای یادگیری</span>
          </h4>
          {onNavigate && (
            <button
              onClick={() => onNavigate('progress')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              مشاهده نمودار کامل ←
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl text-center">
            <p className="text-xs text-slate-500">تعداد آزمون‌ها</p>
            <p className="text-xl font-black text-slate-800 dark:text-slate-100 mt-1">
              {formatNumber(stats.totalQuizzes, 'persian')}
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl text-center">
            <p className="text-xs text-slate-500">سوالات حل شده</p>
            <p className="text-xl font-black text-slate-800 dark:text-slate-100 mt-1">
              {formatNumber(stats.totalQuestions, 'persian')}
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl text-center">
            <p className="text-xs text-slate-500">دقت پاسخ‌ها</p>
            <p className="text-xl font-black text-emerald-600 mt-1">
              ٪{formatNumber(stats.accuracy, 'persian')}
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl text-center">
            <p className="text-xs text-slate-500">عملیات محبوب</p>
            <p className="text-lg font-black text-indigo-600 mt-1">
              {stats.favoriteOp}
            </p>
          </div>
        </div>
      </div>

      {/* Edit Profile Form */}
      <form
        id="edit-profile-form"
        onSubmit={handleSave}
        className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-xl space-y-6"
      >
        <h4 className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
          <span>✏️</span>
          <span>ویرایش اطلاعات و کاراکتر</span>
        </h4>

        {/* Character Selection (Boy / Girl) - Circular Avatar Selectors */}
        <div className="space-y-3">
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
            تغییر کاراکتر قهرمان
          </label>
          <div className="flex items-center justify-center gap-8 sm:gap-14 py-2">
            {/* Boy Option */}
            <button
              type="button"
              onClick={() => setGender('boy')}
              className="group flex flex-col items-center gap-2.5 focus:outline-none cursor-pointer transition-all"
            >
              <div
                className={`relative w-28 h-28 sm:w-36 sm:h-36 rounded-full flex items-center justify-center transition-all duration-300 ${
                  gender === 'boy'
                    ? 'border-4 border-indigo-600 dark:border-indigo-400 bg-gradient-to-b from-indigo-100 via-indigo-50 to-white dark:from-indigo-950 dark:via-indigo-900/60 dark:to-slate-900 shadow-xl shadow-indigo-500/25 ring-4 ring-indigo-200 dark:ring-indigo-900/60 scale-105'
                    : 'border-2 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/60 opacity-60 hover:opacity-100 hover:scale-102 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <div className="w-full h-full rounded-full overflow-hidden p-2 flex items-center justify-center">
                  <img
                    src={getAssetUrl('assets/characters/boy/head.webp')}
                    alt="پسر قهرمان"
                    className="w-full h-full object-contain filter drop-shadow-sm group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.dataset.fallback) {
                        target.dataset.fallback = '1';
                        target.src = getFallbackAssetUrl('assets/characters/boy/head.webp');
                      }
                    }}
                  />
                </div>

                {/* Selected Checkmark Badge */}
                {gender === 'boy' && (
                  <div className="absolute -bottom-1 -left-1 sm:bottom-0 sm:left-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-indigo-600 text-white font-black text-xs sm:text-sm flex items-center justify-center shadow-md border-2 border-white dark:border-slate-900">
                    ✓
                  </div>
                )}
              </div>
              <span
                className={`text-sm sm:text-base font-black transition-colors ${
                  gender === 'boy'
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-600 dark:text-slate-400 font-semibold group-hover:text-slate-800 dark:group-hover:text-slate-200'
                }`}
              >
                پسر قهرمان
              </span>
            </button>

            {/* Girl Option */}
            <button
              type="button"
              onClick={() => setGender('girl')}
              className="group flex flex-col items-center gap-2.5 focus:outline-none cursor-pointer transition-all"
            >
              <div
                className={`relative w-28 h-28 sm:w-36 sm:h-36 rounded-full flex items-center justify-center transition-all duration-300 ${
                  gender === 'girl'
                    ? 'border-4 border-rose-500 dark:border-rose-400 bg-gradient-to-b from-rose-100 via-rose-50 to-white dark:from-rose-950 dark:via-rose-900/60 dark:to-slate-900 shadow-xl shadow-rose-500/25 ring-4 ring-rose-200 dark:ring-rose-900/60 scale-105'
                    : 'border-2 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/60 opacity-60 hover:opacity-100 hover:scale-102 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <div className="w-full h-full rounded-full overflow-hidden p-2 flex items-center justify-center">
                  <img
                    src={getAssetUrl('assets/characters/girl/head.webp')}
                    alt="دختر قهرمان"
                    className="w-full h-full object-contain filter drop-shadow-sm group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.dataset.fallback) {
                        target.dataset.fallback = '1';
                        target.src = getFallbackAssetUrl('assets/characters/girl/head.webp');
                      }
                    }}
                  />
                </div>

                {/* Selected Checkmark Badge */}
                {gender === 'girl' && (
                  <div className="absolute -bottom-1 -left-1 sm:bottom-0 sm:left-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-rose-500 text-white font-black text-xs sm:text-sm flex items-center justify-center shadow-md border-2 border-white dark:border-slate-900">
                    ✓
                  </div>
                )}
              </div>
              <span
                className={`text-sm sm:text-base font-black transition-colors ${
                  gender === 'girl'
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-slate-600 dark:text-slate-400 font-semibold group-hover:text-slate-800 dark:group-hover:text-slate-200'
                }`}
              >
                دختر قهرمان
              </span>
            </button>
          </div>
        </div>

        {/* Name & Age Inputs in 2-Column Grid (1 col on mobile portrait, 2 cols on tablet/desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Name Input */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
              نام قهرمان
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-extrabold focus:border-indigo-500 outline-none transition-colors"
              placeholder="نام قهرمان..."
            />
          </div>

          {/* Age Input */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
              سن (سال)
            </label>
            <input
              type="number"
              min="5"
              max="15"
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-extrabold focus:border-indigo-500 outline-none transition-colors"
            />
          </div>
        </div>

        {/* Submit Save Button */}
        <button
          type="submit"
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl shadow-xl shadow-indigo-500/20 transition-all text-base flex items-center justify-center gap-2"
        >
          <span>💾</span>
          <span>ذخیره تغییرات پروفایل</span>
        </button>
      </form>

        </div>

        {/* Left Column (Character Image on Desktop/Large Screens - Fixed/sticky in viewport, never scrolls away) */}
        <div className="hidden lg:flex w-full lg:w-2/5 xl:w-1/3 sticky top-6 self-start h-[calc(100vh-3rem)] items-center justify-center pointer-events-none">
          <img 
            src={getAssetUrl(`assets/characters/${gender}/greeting.webp`)} 
            alt="Hero Character" 
            className="w-full h-full max-h-[82vh] object-contain filter drop-shadow-2xl pointer-events-auto transform hover:scale-105 transition-transform" 
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.dataset.fallback) {
                target.dataset.fallback = '1';
                target.src = getFallbackAssetUrl(`assets/characters/${gender}/greeting.webp`);
              }
            }}
          />
        </div>

      </div>
    </div>
  );
};

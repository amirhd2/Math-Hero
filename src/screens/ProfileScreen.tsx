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

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 overflow-x-clip">
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start w-full">
        
        {/* Right Column (Cards) */}
        <div className="col-span-1 lg:col-span-7 xl:col-span-8 w-full min-w-0">
          
      {/* Top Desktop Header - Title on right, BackButton on left */}
      <div className="hidden lg:flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <span>👤</span>
          <span>پروفایل قهرمان</span>
        </h2>
        <BackButton
          onClick={onBack}
          title="بازگشت به داشبورد"
        />
      </div>

      {/* Hero Showcase + Current Badge Card Section (4mm overlap on mobile and tablet portrait) */}
      <div className="relative">
        {/* Mobile & Tablet Portrait Hero Showcase Card (1cm shorter on mobile/small screens) */}
        <div className="lg:hidden -mx-4 -mt-6 sm:-mx-6 sm:-mt-8 bg-gradient-to-b from-[#8E7FF3] via-[#8373ED] to-[#7968E7] rounded-b-[36px] sm:rounded-b-[44px] px-4 sm:px-6 pt-3.5 sm:pt-4 pb-2 sm:pb-2.5 text-white shadow-2xl relative z-10 space-y-1.5 sm:space-y-2 overflow-hidden">
          {/* Dynamic Twinkling & Fading Stars Background Watermark */}
          <StarBackgroundWatermark count={12} className="rounded-b-[36px] sm:rounded-b-[44px]" />

          {/* Top Header inside Purple Card - Title on right, BackButton on left */}
          <div className="flex items-center justify-between w-full relative z-10 pb-0.5 px-1">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              پروفایل قهرمان
            </h2>
            <BackButton
              onClick={onBack}
              variant="whiteGlass"
              title="بازگشت"
            />
          </div>

          {/* Character & Greeting Row - Reduced height by ~1cm */}
          <div className="grid grid-cols-12 items-stretch relative z-10 gap-2 sm:gap-4 min-h-[148px] sm:min-h-[180px]">
            {/* Right Side in RTL (7/12 on mobile, 6/12 on tablet/desktop): Greeting Speech */}
            <div className="col-span-7 sm:col-span-6 flex flex-col items-center justify-center text-center space-y-1.5 sm:space-y-3 pb-1 w-full my-auto px-0.5 sm:px-2 select-none">
              <div className="text-3xl sm:text-4xl md:text-5xl font-black text-amber-300 drop-shadow-sm tracking-tight">
                سلام !
              </div>
              <div className="text-base sm:text-xl md:text-2xl font-black text-white leading-tight drop-shadow-md">
                اسم من <span className="text-yellow-300 font-black px-2 py-0.5 rounded-xl bg-white/15 border border-white/20 inline-block">{profile.name}</span> است
              </div>
              <div className="text-base sm:text-xl md:text-2xl font-black text-white leading-tight drop-shadow-md flex items-center flex-wrap gap-1.5 justify-center">
                <span>میخوام</span>
                <span className="px-3 py-0.5 sm:px-4 sm:py-1 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 text-slate-950 font-black text-sm sm:text-base md:text-lg shadow-xl shadow-amber-900/30 border border-amber-200 inline-block transform hover:scale-105 transition-transform">
                  قهرمان ریاضی
                </span>
                <span>بشم!</span>
              </div>
            </div>

            {/* Left Side in RTL (5/12 on mobile, 6/12 on tablet/desktop): Character Container */}
            <div className="col-span-5 sm:col-span-6 flex items-end justify-center w-full relative z-30 -mt-4 sm:-mt-6 translate-y-2 sm:translate-y-3 -mb-3 sm:-mb-5 h-[calc(100%+24px)] sm:h-[calc(100%+32px)]">
              <img
                src={getAssetUrl(`assets/characters/${gender}/half-body/greeting.webp`)}
                alt="Hero Character"
                className="w-full h-full max-h-[195px] sm:max-h-[250px] object-contain object-bottom filter drop-shadow-2xl pointer-events-none"
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

        {/* Desktop / Tablet Landscape: Profile Greeting Card (Single Grid Card) */}
        <div className="hidden lg:block bg-gradient-to-r from-[#8E7FF3] via-[#8373ED] to-[#7968E7] rounded-[32px] p-8 sm:p-10 text-white shadow-xl relative overflow-hidden select-none min-h-[250px] mb-8">
          <StarBackgroundWatermark count={14} className="rounded-[32px]" />

          {/* Top Header inside Card */}
          <div className="flex items-center justify-between relative z-10 pb-3 border-b border-white/20 mb-5">
            <div className="flex items-center gap-2">
              <span className="text-xl">✨</span>
              <span className="text-sm font-black text-white tracking-wide">
                معرفی قهرمان ریاضی
              </span>
            </div>
            <button
              type="button"
              onClick={() => document.getElementById('edit-profile-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-white/90 hover:text-white text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer bg-white/20 hover:bg-white/30 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/25"
              title="ویرایش اطلاعات"
            >
              <span>✏️</span>
              <span>ویرایش مشخصات</span>
            </button>
          </div>

          {/* 3-Line Responsive Greeting Content - Grand and Eye-Catching */}
          <div className="relative z-10 flex flex-col items-start text-right space-y-4 py-3">
            <div className="text-4xl xl:text-5xl 2xl:text-6xl font-black text-amber-300 drop-shadow-sm tracking-tight">
              سلام !
            </div>
            <div className="text-3xl xl:text-4xl 2xl:text-5xl font-extrabold text-white leading-relaxed drop-shadow-md">
              اسم من <span className="text-yellow-300 font-black px-3 py-1 rounded-2xl bg-white/15 border border-white/20 inline-block">{profile.name}</span> است
            </div>
            <div className="text-3xl xl:text-4xl 2xl:text-5xl font-extrabold text-white leading-relaxed drop-shadow-md flex items-center flex-wrap gap-3">
              <span>میخوام</span>
              <span className="px-5 py-2 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 text-slate-950 font-black shadow-xl shadow-amber-900/30 border border-amber-200 inline-block transform hover:scale-105 transition-transform">
                قهرمان ریاضی
              </span>
              <span>بشم!</span>
            </div>
          </div>
        </div>

        {/* Current Honor Badges & Cups Card */}
        {/* On all screen sizes except tablet landscape (lg) and larger, top edge is strictly 4mm over profile card */}
        <CurrentBadgeCard
          trophyInfo={trophyInfo}
          levelTitle={levelInfo.title}
          level={levelInfo.level}
          onNavigate={onNavigate}
          className="-mt-[4mm] lg:mt-0 relative z-20"
        />
      </div>

      {/* Subsequent Profile Sections */}
      <div className="space-y-6 md:space-y-8 mt-6 sm:mt-8">
        {/* Edit Profile Form (Moved directly below 'Current Honor Badges & Cups' Card as requested) */}
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
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl shadow-xl shadow-indigo-500/20 transition-all text-base flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>💾</span>
          <span>ذخیره تغییرات پروفایل</span>
        </button>
      </form>

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

        </div>
      </div>

        {/* Left Column (Character Image on Desktop/Large Screens - Fixed/sticky in viewport, never scrolls away) */}
        <div className="hidden lg:flex lg:col-span-5 xl:col-span-4 w-full sticky top-6 self-start h-[calc(100vh-3rem)] items-center justify-center pointer-events-none min-w-0 overflow-hidden">
          <img 
            src={getAssetUrl(`assets/characters/${gender}/greeting.webp`)} 
            alt="Hero Character" 
            className="w-full h-full max-h-[82vh] object-contain filter drop-shadow-2xl pointer-events-auto select-none" 
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

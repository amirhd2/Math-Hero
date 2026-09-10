/**
 * ProfileScreen component for Math Hero.
 * Child profile view and editor with interactive character poses,
 * gamification stats, trophies summary, and real performance metrics.
 */

import React, { useState, useEffect } from 'react';
import { UserProfile, CharacterGender, ScreenId } from '../types';
import { getLevelProgress } from '../gamification/levelCalculator';
import { getTrophyInfo } from '../gamification/trophyManager';
import { gamificationEngine } from '../gamification/gamificationEngine';
import { CurrentBadgeCard } from '../components/CurrentBadgeCard';
import { StarBackgroundWatermark } from '../components/StarBackgroundWatermark';
import { getAssetUrl, getFallbackAssetUrl } from '../utils/assetPaths';
import { BackButton } from '../components/common/BackButton';

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

  useEffect(() => {
    async function loadStats() {
      try {
        const overview = await gamificationEngine.getOverviewData();
        setUnlockedBadgesCount(overview.unlockedBadges.length);
        setLevelProgressData(overview.levelInfo);
        setTrophyProgressData(overview.trophyInfo);
      } catch (err) {
        console.error('Error loading gamification overview:', err);
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
    <div className="w-full max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-8 overflow-x-clip md:h-[calc(100vh-5rem)] md:overflow-hidden md:flex md:flex-col">
      {/* Floating Success Toast */}
      {savedSuccess && (
        <div
          role="status"
          className="fixed bottom-8 sm:bottom-10 left-1/2 -translate-x-1/2 z-50 max-w-md w-[90%] sm:w-auto px-6 py-3.5 rounded-2xl bg-emerald-600 text-white font-black text-center shadow-2xl shadow-emerald-900/40 border border-emerald-400/60 flex items-center justify-center gap-2.5 backdrop-blur-md transition-all"
        >
          <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm font-black shrink-0">✓</span>
          <span className="text-sm sm:text-base font-extrabold">اطلاعات قهرمان با موفقیت به‌روزرسانی شد!</span>
        </div>
      )}

      {/* Top Desktop & Tablet Header - Full Width: Title on far right, BackButton on far left (to the left of character image) */}
      <div className="hidden md:flex items-center justify-between mb-4 lg:mb-6 w-full shrink-0">
        <h2 className="text-2xl lg:text-3xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <span>👤</span>
          <span>پروفایل قهرمان</span>
        </h2>
        <BackButton
          onClick={onBack}
          title="بازگشت به داشبورد"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start w-full md:flex-1 md:overflow-hidden">
        
        {/* Right Column (Cards: Greeting, Badges, Edit Form) */}
        <div className="col-span-1 md:col-span-7 xl:col-span-8 w-full min-w-0 md:h-full md:overflow-y-auto md:pr-4 pb-12">
          
          {/* Hero Showcase + Current Badge Card Section */}
          <div className="relative">
            {/* Mobile Hero Showcase Card */}
            <div className="md:hidden -mx-4 -mt-6 sm:-mx-6 sm:-mt-8 bg-gradient-to-b from-[#8E7FF3] via-[#8373ED] to-[#7968E7] rounded-b-[36px] sm:rounded-b-[44px] px-4 sm:px-6 pt-3.5 sm:pt-4 pb-2 sm:pb-2.5 text-white shadow-2xl relative z-10 space-y-1.5 sm:space-y-2 overflow-hidden">
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

              {/* Character & Greeting Row */}
              <div className="grid grid-cols-12 items-stretch relative z-10 gap-2 sm:gap-4 min-h-[148px] sm:min-h-[180px]">
                {/* Right Side in RTL: Greeting Speech */}
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

                {/* Left Side in RTL: Character Container */}
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

            {/* Desktop / Tablet: Profile Greeting Card */}
            <div className="hidden md:block bg-gradient-to-r from-[#8E7FF3] via-[#8373ED] to-[#7968E7] rounded-[32px] p-8 sm:p-10 text-white shadow-xl relative overflow-hidden select-none min-h-[250px] mb-8">
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

              {/* 3-Line Responsive Greeting Content */}
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
            <CurrentBadgeCard
              trophyInfo={trophyInfo}
              levelTitle={levelInfo.title}
              level={levelInfo.level}
              onNavigate={onNavigate}
              className="-mt-[4mm] md:mt-0 relative z-20"
            />
          </div>

          {/* Edit Profile Form (All cards below this form removed as requested) */}
          <div className="space-y-6 md:space-y-8 mt-6 sm:mt-8">
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

              {/* Name & Age Inputs in 2-Column Grid */}
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
          </div>
        </div>

        {/* Left Column (Character Image on Tablet and Desktop) */}
        <div className="hidden md:flex md:col-span-5 xl:col-span-4 w-full h-full items-center justify-center pointer-events-none min-w-0 overflow-hidden">
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

/**
 * ProfileScreen component for Math Hero.
 * Child profile view and editor with interactive character poses,
 * gamification stats, trophies summary, and real performance metrics.
 */

import React, { useState, useEffect } from 'react';
import { UserProfile, CharacterGender, CharacterPose, QuizResult, ScreenId } from '../types';
import { Character } from '../components/Character';
import { formatNumber } from '../utils/persian';
import { storage } from '../utils/storage';

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
  const [activePose, setActivePose] = useState<CharacterPose>('master');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    totalQuestions: 0,
    accuracy: 0,
    favoriteOp: 'جمع',
  });

  // Calculate real performance metrics from storage
  useEffect(() => {
    async function loadStats() {
      try {
        const results: QuizResult[] = await storage.getResults();
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

  const getLevelTitle = (lvl: number) => {
    if (lvl <= 1) return 'نوآموز شجاع';
    if (lvl === 2) return 'ماجراجوی باهوش';
    if (lvl === 3) return 'استاد محاسبات';
    if (lvl === 4) return 'قهرمان افسانه‌ای';
    return 'نابغه برتر ریاضی';
  };

  const nextLevelXp = profile.level * 200;
  const currentLevelProgress = profile.xp % 200;
  const progressPercent = Math.min(100, Math.round((currentLevelProgress / 200) * 100));

  const poses: { pose: CharacterPose; label: string; icon: string }[] = [
    { pose: 'master', label: 'قهرمان', icon: '👑' },
    { pose: 'celebrating', label: 'شادی', icon: '🎉' },
    { pose: 'encouraging', label: 'پرقدرت', icon: '💪' },
    { pose: 'thinking', label: 'متفکر', icon: '🤔' },
    { pose: 'greeting', label: 'سلام', icon: '👋' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-2 shadow-sm"
        >
          <span>←</span>
          <span>بازگشت به داشبورد</span>
        </button>
        <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <span>👤</span>
          <span>پروفایل قهرمان</span>
        </h2>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-extrabold text-center border border-emerald-300 dark:border-emerald-800 shadow-lg animate-bounce flex items-center justify-center gap-2">
          <span>✓</span>
          <span>اطلاعات قهرمان با موفقیت به‌روزرسانی شد!</span>
        </div>
      )}

      {/* Hero Showcase Card */}
      <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute -top-10 -left-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        
        {/* Left: Avatar Showcase with live pose switcher */}
        <div className="flex flex-col items-center gap-3 z-10">
          <div className="relative group">
            <Character
              character={gender}
              pose={activePose}
              size="xl"
              className="transform hover:scale-105 transition-transform"
            />
          </div>
          {/* Pose Selector Buttons */}
          <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur-md p-1.5 rounded-2xl border border-white/10">
            {poses.map((p) => (
              <button
                key={p.pose}
                onClick={() => setActivePose(p.pose)}
                title={p.label}
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm transition-all ${
                  activePose === p.pose ? 'bg-amber-400 text-slate-900 font-bold scale-110 shadow-md' : 'text-white/80 hover:bg-white/20'
                }`}
              >
                {p.icon}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Info & XP Progress */}
        <div className="flex-1 text-center md:text-right space-y-4 z-10 w-full">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black">
            <span>⭐</span>
            <span>{getLevelTitle(profile.level)}</span>
          </div>

          <h3 className="text-3xl sm:text-4xl font-black">{profile.name}</h3>

          <p className="text-indigo-100 text-sm">
            سن: {formatNumber(profile.age, 'persian')} ساله • عضو قهرمانان ریاضی
          </p>

          {/* Level Progress Bar */}
          <div className="bg-black/20 backdrop-blur-md p-4 rounded-2xl border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs font-extrabold">
              <span>سطح {formatNumber(profile.level, 'persian')}</span>
              <span>{formatNumber(currentLevelProgress, 'persian')} / ۲۰۰ XP تا سطح بعدی</span>
            </div>
            <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Gamification Summary Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-lg text-center space-y-1">
          <span className="text-2xl">👑</span>
          <p className="text-xs font-bold text-slate-500">سطح قهرمانی</p>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
            {formatNumber(profile.level, 'persian')}
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
        onSubmit={handleSave}
        className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-xl space-y-6"
      >
        <h4 className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
          <span>✏️</span>
          <span>ویرایش اطلاعات و کاراکتر</span>
        </h4>

        {/* Character Selection (Boy / Girl) */}
        <div className="space-y-3">
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
            تغییر کاراکتر قهرمان
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setGender('boy')}
              className={`p-4 rounded-2xl border-2 flex items-center justify-center gap-3 transition-all ${
                gender === 'boy'
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 font-black shadow-md'
                  : 'border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100'
              }`}
            >
              <span className="text-2xl">👦</span>
              <span className="text-sm">پسر قهرمان</span>
            </button>

            <button
              type="button"
              onClick={() => setGender('girl')}
              className={`p-4 rounded-2xl border-2 flex items-center justify-center gap-3 transition-all ${
                gender === 'girl'
                  ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/40 font-black shadow-md'
                  : 'border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100'
              }`}
            >
              <span className="text-2xl">👧</span>
              <span className="text-sm">دختر قهرمان</span>
            </button>
          </div>
        </div>

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
  );
};

/**
 * OnboardingScreen component for Math Hero.
 * Child-friendly, interactive onboarding flow to create a child profile,
 * select character (boy/girl), preview animated poses, and persist to IndexedDB.
 */

import React, { useState } from 'react';
import { UserProfile, CharacterGender, CharacterPose } from '../types';
import { Character } from '../components/Character';
import { formatNumber } from '../utils/persian';

interface OnboardingScreenProps {
  onComplete: (profile: UserProfile) => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<CharacterGender>('boy');
  const [selectedPose, setSelectedPose] = useState<CharacterPose>('greeting');
  const [age, setAge] = useState<number>(8);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const availablePoses: { pose: CharacterPose; label: string; icon: string }[] = [
    { pose: 'greeting', label: 'سلام', icon: '👋' },
    { pose: 'master', label: 'قهرمان', icon: '👑' },
    { pose: 'celebrating', label: 'شادی', icon: '🎉' },
    { pose: 'encouraging', label: 'پرقدرت', icon: '💪' },
    { pose: 'thinking', label: 'متفکر', icon: '🤔' },
  ];

  const speechQuotes: Record<CharacterPose, string> = {
    greeting: 'سلام دوست من! خیلی خوشحالم که اینجایی!',
    master: 'من و تو با هم قهرمان ریاضی می‌شیم!',
    celebrating: 'هورااا! امروز قراره کلی ستاره و امتیاز جمع کنیم!',
    encouraging: 'هیچ معمایی نیست که نتونیم با هم حل کنیم!',
    thinking: 'بیا با تمرکز و دقت بریم سراغ چالش‌ها!',
    sad: 'اشکالی نداره، از اشتباهات یاد می‌گیریم!',
  };

  const ages = [6, 7, 8, 9, 10, 11, 12];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setErrorMsg('لطفاً نام قشنگت رو وارد کن قهرمان!');
      return;
    }

    setIsSubmitting(true);
    const newProfile: UserProfile = {
      id: 'default_user',
      name: cleanName,
      gender,
      age,
      avatarId: gender === 'boy' ? 'boy-master' : 'girl-master',
      xp: 50, // Starting bonus XP
      level: 1,
      coins: 20, // Starting bonus coins
      streakDays: 1,
      createdAt: Date.now(),
      onboardingCompleted: true,
    };

    setTimeout(() => {
      onComplete(newProfile);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50/70 via-slate-50 to-purple-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/40 flex items-center justify-center p-4 sm:p-6 pt-safe pb-safe transition-colors">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 sm:p-10 space-y-8 relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-extrabold text-xs tracking-wide">
            <span>✨</span>
            <span>به دنیای قهرمان ریاضی خوش آمدی!</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100">
            شخصیت قهرمان خودت رو بساز
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            کاراکتر دلخواهت رو انتخاب کن، نامت رو بنویس و آماده یک ماجراجویی هیجان‌انگیز ریاضی شو!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          {/* Step 1: Character Gender Choice */}
          <div className="space-y-3">
            <label className="block text-sm font-extrabold text-slate-800 dark:text-slate-200 text-center">
              ۱. انتخاب قهرمان
            </label>
            <div className="grid grid-cols-2 gap-4">
              {/* Boy Option */}
              <button
                type="button"
                onClick={() => {
                  setGender('boy');
                  setErrorMsg('');
                }}
                className={`p-4 rounded-3xl border-3 flex flex-col items-center gap-3 transition-all transform active:scale-95 ${
                  gender === 'boy'
                    ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/50 shadow-xl shadow-indigo-500/20 scale-[1.02]'
                    : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 opacity-75 hover:opacity-100'
                }`}
              >
                <div className="w-full h-40 sm:h-56 rounded-2xl bg-indigo-100/50 dark:bg-indigo-900/30 flex items-center justify-center overflow-hidden shadow-inner">
                  <img src="/assets/characters/boy/boy.webp" alt="Boy Character" className="w-full h-full object-contain" />
                </div>
                <div className="text-center">
                  <span className="block font-black text-slate-900 dark:text-slate-100 text-base">
                    پسر قهرمان
                  </span>
                  <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">
                    سریع و پرانرژی
                  </span>
                </div>
                {gender === 'boy' && (
                  <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/60 px-3 py-0.5 rounded-full mt-1">
                    ✓ انتخاب شده
                  </span>
                )}
              </button>

              {/* Girl Option */}
              <button
                type="button"
                onClick={() => {
                  setGender('girl');
                  setErrorMsg('');
                }}
                className={`p-4 rounded-3xl border-3 flex flex-col items-center gap-3 transition-all transform active:scale-95 ${
                  gender === 'girl'
                    ? 'border-rose-500 bg-rose-50/60 dark:bg-rose-950/50 shadow-xl shadow-rose-500/20 scale-[1.02]'
                    : 'border-slate-200 dark:border-slate-800 hover:border-rose-300 opacity-75 hover:opacity-100'
                }`}
              >
                <div className="w-full h-40 sm:h-56 rounded-2xl bg-rose-100/50 dark:bg-rose-900/30 flex items-center justify-center overflow-hidden shadow-inner">
                  <img src="/assets/characters/girl/girl.webp" alt="Girl Character" className="w-full h-full object-contain" />
                </div>
                <div className="text-center">
                  <span className="block font-black text-slate-900 dark:text-slate-100 text-base">
                    دختر قهرمان
                  </span>
                  <span className="text-xs text-rose-600 dark:text-rose-400 font-bold">
                    باهوش و شجاع
                  </span>
                </div>
                {gender === 'girl' && (
                  <span className="text-xs font-black text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/60 px-3 py-0.5 rounded-full mt-1">
                    ✓ انتخاب شده
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Interactive Live Character & Pose Preview */}
          <div className="bg-slate-50 dark:bg-slate-950/80 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 flex flex-col items-center gap-4">
            <div className="flex flex-col items-center gap-2">
              <Character
                character={gender}
                pose={selectedPose}
                size="lg"
                className="transform hover:scale-110 transition-transform cursor-pointer"
              />
              {/* Speech bubble */}
              <div className="relative mt-2 bg-white dark:bg-slate-900 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm max-w-sm text-center">
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-slate-900 border-t border-l border-slate-200 dark:border-slate-700 transform rotate-45" />
                <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
                  {speechQuotes[selectedPose]}
                </p>
              </div>
            </div>

            {/* Pose selector bar */}
            <div className="w-full space-y-1.5 pt-2">
              <p className="text-center text-xs font-bold text-slate-500 dark:text-slate-400">
                حالت‌های قهرمان (روی هرکدام کلیک کن):
              </p>
              <div className="flex justify-center flex-wrap gap-2">
                {availablePoses.map((p) => (
                  <button
                    key={p.pose}
                    type="button"
                    onClick={() => setSelectedPose(p.pose)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      selectedPose === p.pose
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30 scale-105'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <span>{p.icon}</span>
                    <span>{p.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Step 2: Child Name Input */}
          <div className="space-y-2">
            <label className="block text-sm font-extrabold text-slate-800 dark:text-slate-200">
              ۲. نام قهرمان
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                maxLength={24}
                placeholder="نام زیبایت را اینجا بنویس (مثلاً: علی، سارا، رادین)..."
                className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-extrabold text-base focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all placeholder:font-normal placeholder:text-slate-400"
                autoFocus
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl pointer-events-none">
                ✏️
              </span>
            </div>
            {errorMsg && (
              <p className="text-xs font-bold text-rose-500 dark:text-rose-400 mt-1">
                {errorMsg}
              </p>
            )}
          </div>

          {/* Step 3: Age Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-extrabold text-slate-800 dark:text-slate-200">
                ۳. سن شما چند سال است؟
              </label>
              <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                {formatNumber(age, 'persian')} ساله
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
              {ages.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAge(a)}
                  className={`flex-1 min-w-[40px] py-2.5 rounded-2xl font-black text-sm transition-all ${
                    age === a
                      ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30 scale-105'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {formatNumber(a, 'persian')}
                </button>
              ))}
            </div>
          </div>

          {/* Starter Bonus Callout */}
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center gap-3">
            <span className="text-2xl">🎁</span>
            <div className="text-xs leading-relaxed text-amber-900 dark:text-amber-300 font-bold">
              <span>هدیه عضویت: </span>
              <span className="font-extrabold">۵۰ امتیاز (XP)</span>
              <span> و </span>
              <span className="font-extrabold">۲۰ سکه طلایی</span>
              <span> به عنوان شروع ماجراجویی برایت ثبت می‌شود!</span>
            </div>
          </div>

          {/* Action / Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black text-lg rounded-2xl shadow-xl shadow-indigo-500/25 transform active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>در حال آماده‌سازی قهرمان...</span>
            ) : (
              <>
                <span>🚀</span>
                <span>شروع ماجراجویی قهرمان ریاضی!</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

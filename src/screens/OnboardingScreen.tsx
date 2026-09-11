/**
 * OnboardingScreen component for Math Hero (قهرمان ریاضی).
 * 3-step interactive, fully responsive welcome wizard:
 *  - Step 1: Owl Welcome Greeting (Mobile: text top, large image bottom with no frame. Desktop/Tablet landscape: image left full-height, text right)
 *  - Step 2: Character Choice (Boy / Girl cards with exact existing style)
 *  - Step 3: Name Input & iOS-style Horizontal Magnifying Age Wheel Picker
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { UserProfile, CharacterGender } from '../types';
import { formatNumber, toPersianDigits } from '../utils/persian';
import { getAssetUrl, getFallbackAssetUrl } from '../utils/assetPaths';
import { ChevronRight, ChevronLeft, Sparkles, User, Calendar } from 'lucide-react';

interface OnboardingScreenProps {
  onComplete: (profile: UserProfile) => void;
}

const AGES = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
const ITEM_WIDTH = 76; // width in pixels for each age slot

/**
 * iOS-style Horizontal Wheel/Picker for selecting Age
 * - Perfectly centered in the magnifying box
 * - Smooth horizontal scrolling & snapping
 * - Dynamic scaling, color highlighting, and opacity
 */
const HorizontalAgeWheelPicker: React.FC<{
  value: number;
  onChange: (val: number) => void;
}> = ({ value, onChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollStartRef = useRef(0);
  const scrollTimeoutRef = useRef<any>(null);

  // Center the selected age on mount or value change
  const scrollToAge = useCallback((ageVal: number, smooth: boolean = true) => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const index = AGES.indexOf(ageVal);
    if (index === -1) return;

    // With a leading spacer of width (containerWidth/2 - ITEM_WIDTH/2),
    // target scrollLeft for item at index `i` is exactly `index * ITEM_WIDTH`.
    const targetScroll = index * ITEM_WIDTH;
    container.scrollTo({
      left: targetScroll,
      behavior: smooth ? 'smooth' : 'auto',
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToAge(value, false);
    }, 60);
    return () => clearTimeout(timer);
  }, []);

  // Update on scroll & calculate active center element accurately
  const handleScroll = () => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const currentScroll = container.scrollLeft;

    // Calculate which index is closest to center
    const closestIndex = Math.round(currentScroll / ITEM_WIDTH);
    const clampedIndex = Math.max(0, Math.min(AGES.length - 1, closestIndex));
    const closestAge = AGES[clampedIndex];

    if (closestAge !== value) {
      onChange(closestAge);
    }

    // Debounced snap when scrolling stops
    if (!isDraggingRef.current) {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        if (containerRef.current) {
          const finalIndex = Math.round(containerRef.current.scrollLeft / ITEM_WIDTH);
          const finalAge = AGES[Math.max(0, Math.min(AGES.length - 1, finalIndex))];
          scrollToAge(finalAge, true);
        }
      }, 150);
    }
  };

  // Mouse Drag Support for Desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    isDraggingRef.current = true;
    startXRef.current = e.pageX - containerRef.current.offsetLeft;
    scrollStartRef.current = containerRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    containerRef.current.scrollLeft = scrollStartRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      if (containerRef.current) {
        const finalIndex = Math.round(containerRef.current.scrollLeft / ITEM_WIDTH);
        const finalAge = AGES[Math.max(0, Math.min(AGES.length - 1, finalIndex))];
        scrollToAge(finalAge, true);
      }
    }
  };

  return (
    <div className="relative w-full py-2 select-none">
      {/* Visual Header / Indicator Badge */}
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-amber-500" />
          <span>سن شما چند سال است؟</span>
        </label>
        
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow-xs animate-fadeIn">
          <span>{formatNumber(value, 'persian')}</span>
          <span className="text-[11px] font-bold">ساله</span>
        </div>
      </div>

      {/* Main Wheel Viewport */}
      <div className="relative w-full h-24 sm:h-28 rounded-3xl bg-slate-100/90 dark:bg-slate-950/80 border border-slate-200/90 dark:border-slate-800/90 overflow-hidden flex items-center justify-center shadow-inner">
        
        {/* Subtle Vignette Gradient Masks on Left and Right Edges */}
        <div className="absolute top-0 bottom-0 left-0 w-16 sm:w-24 bg-gradient-to-r from-slate-100 dark:from-slate-950 to-transparent pointer-events-none z-20" />
        <div className="absolute top-0 bottom-0 right-0 w-16 sm:w-24 bg-gradient-to-l from-slate-100 dark:from-slate-950 to-transparent pointer-events-none z-20" />

        {/* Center Magnifying Lens Frame (Crisp & transparent, no blur overlay) */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 sm:w-18 sm:h-18 rounded-2xl sm:rounded-3xl border-2 border-indigo-600 dark:border-indigo-400 bg-indigo-500/5 dark:bg-indigo-400/10 shadow-lg shadow-indigo-500/10 ring-4 ring-indigo-500/15 pointer-events-none z-0 flex flex-col items-center justify-end pb-1"
        >
          <span className="text-[9px] sm:text-[10px] font-black text-indigo-600 dark:text-indigo-400 select-none">
            ساله
          </span>
        </div>

        {/* Horizontal Scrollable Wheel Track */}
        <div
          ref={containerRef}
          onScroll={handleScroll}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          className="w-full h-full flex items-center overflow-x-auto scrollbar-none snap-x snap-mandatory cursor-grab active:cursor-grabbing relative z-10"
          dir="ltr"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            scrollBehavior: isDraggingRef.current ? 'auto' : 'smooth',
          }}
        >
          {/* Leading Spacer for Center Alignment */}
          <div
            className="shrink-0"
            style={{
              minWidth: `calc(50% - ${ITEM_WIDTH / 2}px)`,
              width: `calc(50% - ${ITEM_WIDTH / 2}px)`,
            }}
          />

          {/* Age Numbers */}
          {AGES.map((a) => {
            const isSelected = a === value;

            return (
              <button
                key={a}
                type="button"
                onClick={() => {
                  onChange(a);
                  scrollToAge(a, true);
                }}
                style={{
                  minWidth: `${ITEM_WIDTH}px`,
                  width: `${ITEM_WIDTH}px`,
                }}
                className="shrink-0 h-full snap-center flex flex-col items-center justify-center p-0 transition-transform duration-150 cursor-pointer"
              >
                <span
                  className={`transition-all duration-200 select-none ${
                    isSelected
                      ? 'text-3xl sm:text-4xl font-black text-indigo-700 dark:text-indigo-300 scale-125 -translate-y-1 drop-shadow-xs'
                      : 'text-xl sm:text-2xl font-extrabold text-slate-400 dark:text-slate-600 scale-90 opacity-40 hover:opacity-80 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}
                >
                  {toPersianDigits(a)}
                </span>
              </button>
            );
          })}

          {/* Trailing Spacer for Center Alignment */}
          <div
            className="shrink-0"
            style={{
              minWidth: `calc(50% - ${ITEM_WIDTH / 2}px)`,
              width: `calc(50% - ${ITEM_WIDTH / 2}px)`,
            }}
          />
        </div>
      </div>
      
      {/* Helper text */}
      <p className="text-[11px] text-center font-bold text-slate-400 dark:text-slate-500 mt-1.5">
        👈 برای تغییر سن، عددها را به چپ یا راست بکش 👉
      </p>
    </div>
  );
};

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [gender, setGender] = useState<CharacterGender>('boy');
  const [name, setName] = useState('');
  const [age, setAge] = useState<number>(8);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      handleFinalSubmit();
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setErrorMsg('');
      setStep((prev) => (prev - 1) as 1 | 2 | 3);
    }
  };

  const handleFinalSubmit = () => {
    const cleanName = name.trim();
    if (!cleanName) {
      setErrorMsg('لطفاً نام قشنگت رو بنویس قهرمان!');
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
    }, 350);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-indigo-50/80 via-slate-50 to-purple-50/60 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/40 text-slate-800 dark:text-slate-100 flex flex-col justify-between selection:bg-amber-400 selection:text-slate-900 transition-colors relative overflow-x-hidden">
      
      {/* Decorative ambient background glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-400/10 dark:bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-96 h-96 bg-purple-400/10 dark:bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header / Progress Indicator */}
      <header className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6 shrink-0 z-20">
        <div className="flex items-center justify-between">
          {/* App title badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-xs border border-indigo-100 dark:border-indigo-900/50 shadow-2xs text-xs font-black text-indigo-700 dark:text-indigo-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>قهرمان ریاضی</span>
          </div>

          {/* 3-Step Dots Indicator */}
          <div className="flex items-center gap-2" dir="ltr">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  step === s
                    ? 'w-8 bg-indigo-600 dark:bg-indigo-500 shadow-xs'
                    : step > s
                    ? 'w-2.5 bg-emerald-500 dark:bg-emerald-400'
                    : 'w-2.5 bg-slate-300 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>
      </header>

      {/* Main Step Content Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-2 sm:py-6 flex flex-col justify-center items-center z-10">
        {/* =========================================================================
            STEP 1: WELCOME & GREETING
            - Mobile / portrait: Text at top, large image at bottom without frame/border
            - Desktop / landscape: Image on left full height, text on right
            ========================================================================= */}
        {step === 1 && (
          <div className="w-full h-full flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-12 animate-fadeIn">
            {/* Text Side (Right in RTL flex-row) */}
            <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-right space-y-4 sm:space-y-6 pt-2 lg:pt-0">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-amber-100/80 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs sm:text-sm font-black border border-amber-200 dark:border-amber-800/60 shadow-2xs">
                <span>🦉</span>
                <span>همسفر باهوش و مهربان تو</span>
              </div>

              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-slate-50 leading-tight sm:leading-snug">
                سلام به برنامه قهرمان ریاضی خوش آمدی عزیزم!
              </h1>

              <p className="text-base sm:text-xl md:text-2xl font-black text-indigo-600 dark:text-indigo-400 leading-relaxed max-w-lg">
                می خواهیم که با هم قهرمان ریاضی بشیم
              </p>

              <div className="hidden lg:flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 pt-2">
                <span>✨ برای شروع دکمه بعدی را بزن</span>
              </div>
            </div>

            {/* Image Side (Left in RTL flex-row) - Completely frameless, no card/background */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-0 m-0 relative">
              <img
                src={getAssetUrl('assets/characters/owl/Greeting.webp')}
                alt="خوش آمدگویی جغد دانا"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.dataset.fallback) {
                    target.dataset.fallback = '1';
                    target.src = getFallbackAssetUrl('assets/characters/owl/Greeting.webp');
                  }
                }}
                className="w-auto h-auto max-h-[46vh] sm:max-h-[52vh] lg:max-h-[65vh] max-w-[85vw] lg:max-w-full object-contain pointer-events-none drop-shadow-2xl transition-all duration-500 transform hover:scale-105"
                style={{ background: 'transparent' }}
              />
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 2: CHOOSE CHARACTER
            - Header: حالا شخصیت دلخواه خودت رو انتخاب کن
            - Exact existing Boy & Girl choice cards with exact text and styling
            ========================================================================= */}
        {step === 2 && (
          <div className="w-full max-w-3xl flex flex-col items-center justify-center space-y-6 sm:space-y-8 animate-fadeIn">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-indigo-100/80 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 text-xs sm:text-sm font-black border border-indigo-200 dark:border-indigo-800/60">
                <span>👑</span>
                <span>مرحله دوم</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-slate-100">
                حالا شخصیت دلخواه خودت رو انتخاب کن
              </h2>
            </div>

            {/* Boy and Girl Choice Cards */}
            <div className="grid grid-cols-2 gap-3.5 sm:gap-6 w-full">
              {/* Boy Option */}
              <button
                type="button"
                onClick={() => {
                  setGender('boy');
                  setErrorMsg('');
                }}
                className={`p-3.5 sm:p-5 rounded-3xl border-3 flex flex-col items-center gap-2.5 sm:gap-4 transition-all transform active:scale-95 cursor-pointer ${
                  gender === 'boy'
                    ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 shadow-xl shadow-indigo-500/20 scale-[1.02]'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="w-full h-36 sm:h-56 md:h-64 rounded-2xl bg-indigo-100/50 dark:bg-indigo-900/30 flex items-center justify-center overflow-hidden shadow-inner">
                  <img
                    src={getAssetUrl('assets/characters/boy/boy.webp')}
                    alt="Boy Character"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.dataset.fallback) {
                        target.dataset.fallback = '1';
                        target.src = getFallbackAssetUrl('assets/characters/boy/boy.webp');
                      }
                    }}
                  />
                </div>
                <div className="text-center">
                  <span className="block font-black text-slate-900 dark:text-slate-100 text-base sm:text-lg">
                    پسر قهرمان
                  </span>
                  <span className="text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 font-bold">
                    سریع و پرانرژی
                  </span>
                </div>
                {gender === 'boy' && (
                  <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/60 px-3 py-1 rounded-full shadow-2xs">
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
                className={`p-3.5 sm:p-5 rounded-3xl border-3 flex flex-col items-center gap-2.5 sm:gap-4 transition-all transform active:scale-95 cursor-pointer ${
                  gender === 'girl'
                    ? 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/60 shadow-xl shadow-rose-500/20 scale-[1.02]'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-rose-300 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="w-full h-36 sm:h-56 md:h-64 rounded-2xl bg-rose-100/50 dark:bg-rose-900/30 flex items-center justify-center overflow-hidden shadow-inner">
                  <img
                    src={getAssetUrl('assets/characters/girl/girl.webp')}
                    alt="Girl Character"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.dataset.fallback) {
                        target.dataset.fallback = '1';
                        target.src = getFallbackAssetUrl('assets/characters/girl/girl.webp');
                      }
                    }}
                  />
                </div>
                <div className="text-center">
                  <span className="block font-black text-slate-900 dark:text-slate-100 text-base sm:text-lg">
                    دختر قهرمان
                  </span>
                  <span className="text-xs sm:text-sm text-rose-600 dark:text-rose-400 font-bold">
                    باهوش و شجاع
                  </span>
                </div>
                {gender === 'girl' && (
                  <span className="text-xs font-black text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/60 px-3 py-1 rounded-full shadow-2xs">
                    ✓ انتخاب شده
                  </span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 3: NAME & AGE SELECTION
            - Text: حالا نام قشنگت رو بنویس و آماده یک ماجراجویی هیجان انگیز ریاضی شو!
            - Name input: exactly as currently styled
            - Age selection: Horizontal iOS-style magnifying wheel picker
            - Mobile / portrait: Text at top, fields at bottom
            - Desktop / landscape: Text on right, fields on left
            ========================================================================= */}
        {step === 3 && (
          <div className="w-full h-full flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-12 animate-fadeIn">
            {/* Text Description Side (Right in RTL flex-row) */}
            <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-right space-y-4 sm:space-y-6 pt-2 lg:pt-0">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-black border border-emerald-200 dark:border-emerald-800/60">
                <span>🚀</span>
                <span>گام آخر ماجراجویی</span>
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-slate-100 leading-snug">
                حالا نام قشنگت رو بنویس و آماده یک ماجراجویی هیجان انگیز ریاضی شو!
              </h2>

              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center gap-3 text-right">
                <span className="text-2xl shrink-0">🎁</span>
                <p className="text-xs sm:text-sm text-amber-900 dark:text-amber-300 font-bold leading-relaxed">
                  با ثبت‌نام، <span className="font-extrabold text-amber-950 dark:text-amber-200">۵۰ امتیاز (XP)</span> و <span className="font-extrabold text-amber-950 dark:text-amber-200">۲۰ سکه طلایی</span> هدیه دریافت می‌کنی!
                </p>
              </div>
            </div>

            {/* Inputs Side (Left in RTL flex-row) */}
            <div className="w-full lg:w-1/2 max-w-lg bg-white dark:bg-slate-900 p-5 sm:p-7 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xl space-y-5">
              
              {/* Option 1: Hero Name Input */}
              <div className="space-y-2 text-right">
                <label className="block text-sm font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>نام قهرمان</span>
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
                    className="w-full px-5 py-3.5 sm:py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-extrabold text-base focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all placeholder:font-normal placeholder:text-slate-400 text-right shadow-inner"
                    autoFocus
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg pointer-events-none">
                    ✏️
                  </span>
                </div>
                {errorMsg && (
                  <p className="text-xs font-bold text-rose-500 dark:text-rose-400 mt-1">
                    {errorMsg}
                  </p>
                )}
              </div>

              {/* Option 2: iOS-Style Horizontal Magnifying Age Wheel Picker */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <HorizontalAgeWheelPicker
                  value={age}
                  onChange={(newAge) => setAge(newAge)}
                />
              </div>

            </div>
          </div>
        )}
      </main>

      {/* Bottom Sticky Navigation Bar with Inverted Buttons and Correct Icon Directions */}
      <footer className="w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 py-3.5 px-4 sm:px-8 z-30 shrink-0 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          
          {/* Next Button (بعدی / بزن بریم) */}
          <button
            type="button"
            onClick={handleNext}
            disabled={isSubmitting}
            className={`px-6 sm:px-9 py-3 rounded-2xl font-black text-sm sm:text-base flex items-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer ${
              step === 3
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/30 ring-2 ring-emerald-400/40 animate-pulse'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
            }`}
          >
            {/* On steps 1 & 2: Icon on the RIGHT side of text 'بعدی' with reversed direction */}
            {step < 3 && <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />}
            <span>{step === 3 ? (isSubmitting ? 'در حال آماده‌سازی...' : 'بزن بریم 🚀') : 'بعدی'}</span>
          </button>

          {/* Step Text status indicator */}
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
            مرحله {toPersianDigits(step)} از ۳
          </span>

          {/* Previous Button (قبلی) */}
          <button
            type="button"
            onClick={handlePrev}
            disabled={step === 1}
            className={`px-5 sm:px-7 py-3 rounded-2xl font-black text-sm sm:text-base flex items-center gap-2 transition-all cursor-pointer ${
              step === 1
                ? 'opacity-30 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 border border-slate-200 dark:border-slate-800'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs'
            }`}
          >
            <span>قبلی</span>
            {/* Reversed icon direction for Previous button */}
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </footer>
    </div>
  );
};

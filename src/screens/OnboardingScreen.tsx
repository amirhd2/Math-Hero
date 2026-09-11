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
    <div className="relative w-full py-1 select-none">
      {/* Visual Header / Indicator Badge */}
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
          <span>سن شما چند سال است؟</span>
        </label>
        
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow-xs animate-fadeIn">
          <span>{formatNumber(value, 'persian')}</span>
          <span className="text-[10px] font-bold">ساله</span>
        </div>
      </div>

      {/* Main Wheel Viewport */}
      <div className="relative w-full h-20 sm:h-24 rounded-2xl sm:rounded-3xl bg-slate-100/90 dark:bg-slate-950/80 border border-slate-200/90 dark:border-slate-800/90 overflow-hidden flex items-center justify-center shadow-inner">
        
        {/* Subtle Vignette Gradient Masks on Left and Right Edges */}
        <div className="absolute top-0 bottom-0 left-0 w-12 sm:w-20 bg-gradient-to-r from-slate-100 dark:from-slate-950 to-transparent pointer-events-none z-20" />
        <div className="absolute top-0 bottom-0 right-0 w-12 sm:w-20 bg-gradient-to-l from-slate-100 dark:from-slate-950 to-transparent pointer-events-none z-20" />

        {/* Center Magnifying Lens Frame (Crisp & transparent, no blur overlay) */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl border-2 border-indigo-600 dark:border-indigo-400 bg-indigo-500/5 dark:bg-indigo-400/10 shadow-lg shadow-indigo-500/10 ring-4 ring-indigo-500/15 pointer-events-none z-0 flex flex-col items-center justify-end pb-0.5"
        >
          <span className="text-[8px] sm:text-[9px] font-black text-indigo-600 dark:text-indigo-400 select-none">
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
                      ? 'text-2xl sm:text-3xl font-black text-indigo-700 dark:text-indigo-300 scale-125 -translate-y-0.5 drop-shadow-xs'
                      : 'text-lg sm:text-xl font-extrabold text-slate-400 dark:text-slate-600 scale-90 opacity-40 hover:opacity-80 hover:text-slate-600 dark:hover:text-slate-300'
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
      <p className="text-[10px] sm:text-[11px] text-center font-bold text-slate-400 dark:text-slate-500 mt-1">
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
    <div
      id="onboarding-container"
      className="fixed inset-0 z-50 w-full h-full bg-gradient-to-b from-indigo-50/80 via-slate-50 to-purple-50/60 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/40 text-slate-800 dark:text-slate-100 flex flex-col justify-between selection:bg-amber-400 selection:text-slate-900 transition-colors select-none overflow-hidden"
      style={{
        paddingTop: 'max(0.25rem, env(safe-area-inset-top, 0px))',
        paddingBottom: 'max(0.25rem, env(safe-area-inset-bottom, 0px))',
        paddingLeft: 'max(0.5rem, env(safe-area-inset-left, 0px))',
        paddingRight: 'max(0.5rem, env(safe-area-inset-right, 0px))',
      }}
    >
      {/* Decorative ambient background glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-400/10 dark:bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-96 h-96 bg-purple-400/10 dark:bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header / Progress Indicator */}
      <header className="w-full max-w-5xl mx-auto px-3 sm:px-6 pt-2 sm:pt-4 shrink-0 z-20">
        <div className="flex items-center justify-between">
          {/* App title badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-xs border border-indigo-100 dark:border-indigo-900/50 shadow-2xs text-xs font-black text-indigo-700 dark:text-indigo-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>قهرمان ریاضی</span>
          </div>

          {/* 3-Step Dots Indicator */}
          <div className="flex items-center gap-1.5 sm:gap-2" dir="ltr">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 sm:h-2.5 rounded-full transition-all duration-300 ${
                  step === s
                    ? 'w-7 sm:w-8 bg-indigo-600 dark:bg-indigo-500 shadow-xs'
                    : step > s
                    ? 'w-2 sm:w-2.5 bg-emerald-500 dark:bg-emerald-400'
                    : 'w-2 sm:w-2.5 bg-slate-300 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>
      </header>

      {/* Main Step Content Area (Zero-Scroll Flex Container) */}
      <main className="flex-1 min-h-0 w-full max-w-5xl mx-auto px-3 sm:px-6 py-1 sm:py-3 flex flex-col justify-center items-center z-10 overflow-hidden">
        {/* =========================================================================
            STEP 1: WELCOME & GREETING
            - Mobile / portrait: Text at top, large image at bottom without frame/border
            - Desktop / landscape: Image on left full height, text on right
            ========================================================================= */}
        {step === 1 && (
          <div className="w-full h-full flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-3 sm:gap-6 lg:gap-12 animate-fadeIn min-h-0 overflow-hidden">
            {/* Text Side (Right in RTL flex-row) */}
            <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-right space-y-2 sm:space-y-4 shrink-0 lg:shrink">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-2xl bg-amber-100/80 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs sm:text-sm font-black border border-amber-200 dark:border-amber-800/60 shadow-2xs">
                <span>🦉</span>
                <span>همسفر باهوش و مهربان تو</span>
              </div>

              <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 dark:text-slate-50 leading-tight sm:leading-snug">
                سلام به برنامه قهرمان ریاضی خوش آمدی عزیزم!
              </h1>

              <p className="text-sm sm:text-lg md:text-xl font-black text-indigo-600 dark:text-indigo-400 leading-relaxed max-w-lg">
                می خواهیم که با هم قهرمان ریاضی بشیم
              </p>

              <div className="hidden lg:flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 pt-1">
                <span>✨ برای شروع دکمه بعدی را بزن</span>
              </div>
            </div>

            {/* Image Side (Left in RTL flex-row) - Completely frameless, no card/background */}
            <div className="w-full lg:w-1/2 flex-1 min-h-0 flex items-center justify-center p-0 m-0 relative overflow-hidden">
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
                className="w-auto h-auto max-h-[35vh] sm:max-h-[45vh] lg:max-h-[60vh] max-w-[80vw] lg:max-w-full object-contain pointer-events-none drop-shadow-2xl transition-all duration-500"
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
          <div className="w-full max-w-2xl flex flex-col items-center justify-center space-y-3 sm:space-y-5 animate-fadeIn my-auto min-h-0 overflow-hidden">
            {/* Header */}
            <div className="text-center space-y-1.5 shrink-0">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-2xl bg-indigo-100/80 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 text-xs sm:text-sm font-black border border-indigo-200 dark:border-indigo-800/60">
                <span>👑</span>
                <span>مرحله دوم</span>
              </div>
              <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-slate-100">
                حالا شخصیت دلخواه خودت رو انتخاب کن
              </h2>
            </div>

            {/* Boy and Girl Choice Cards */}
            <div className="grid grid-cols-2 gap-3 sm:gap-5 w-full">
              {/* Boy Option */}
              <button
                type="button"
                onClick={() => {
                  setGender('boy');
                  setErrorMsg('');
                }}
                className={`p-2.5 sm:p-4 rounded-3xl border-3 flex flex-col items-center gap-2 sm:gap-3 transition-all transform active:scale-95 cursor-pointer ${
                  gender === 'boy'
                    ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 shadow-xl shadow-indigo-500/20 scale-[1.02]'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="w-full h-28 sm:h-40 md:h-48 lg:h-52 rounded-2xl bg-indigo-100/50 dark:bg-indigo-900/30 flex items-center justify-center overflow-hidden shadow-inner">
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
                  <span className="block font-black text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                    پسر قهرمان
                  </span>
                  <span className="text-[11px] sm:text-xs text-indigo-600 dark:text-indigo-400 font-bold">
                    سریع و پرانرژی
                  </span>
                </div>
                {gender === 'boy' && (
                  <span className="text-[10px] sm:text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/60 px-2.5 py-0.5 rounded-full shadow-2xs">
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
                className={`p-2.5 sm:p-4 rounded-3xl border-3 flex flex-col items-center gap-2 sm:gap-3 transition-all transform active:scale-95 cursor-pointer ${
                  gender === 'girl'
                    ? 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/60 shadow-xl shadow-rose-500/20 scale-[1.02]'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-rose-300 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="w-full h-28 sm:h-40 md:h-48 lg:h-52 rounded-2xl bg-rose-100/50 dark:bg-rose-900/30 flex items-center justify-center overflow-hidden shadow-inner">
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
                  <span className="block font-black text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                    دختر قهرمان
                  </span>
                  <span className="text-[11px] sm:text-xs text-rose-600 dark:text-rose-400 font-bold">
                    باهوش و شجاع
                  </span>
                </div>
                {gender === 'girl' && (
                  <span className="text-[10px] sm:text-xs font-black text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/60 px-2.5 py-0.5 rounded-full shadow-2xs">
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
          <div className="w-full h-full flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-3 sm:gap-6 lg:gap-10 animate-fadeIn min-h-0 overflow-hidden">
            {/* Text Description Side (Right in RTL flex-row) */}
            <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-right space-y-2 sm:space-y-3 shrink-0 lg:shrink">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-2xl bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-black border border-emerald-200 dark:border-emerald-800/60">
                <span>🚀</span>
                <span>گام آخر ماجراجویی</span>
              </div>

              <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-slate-100 leading-snug">
                حالا نام قشنگت رو بنویس و آماده یک ماجراجویی شو!
              </h2>

              <div className="p-2.5 sm:p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center gap-2.5 text-right">
                <span className="text-xl sm:text-2xl shrink-0">🎁</span>
                <p className="text-xs sm:text-sm text-amber-900 dark:text-amber-300 font-bold leading-relaxed">
                  با ثبت‌نام، <span className="font-extrabold text-amber-950 dark:text-amber-200">۵۰ امتیاز</span> و <span className="font-extrabold text-amber-950 dark:text-amber-200">۲۰ سکه</span> هدیه می‌گیری!
                </p>
              </div>
            </div>

            {/* Inputs Side (Left in RTL flex-row) */}
            <div className="w-full lg:w-1/2 max-w-md bg-white dark:bg-slate-900 p-3.5 sm:p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xl space-y-3 sm:space-y-4 shrink-0 lg:shrink">
              
              {/* Option 1: Hero Name Input */}
              <div className="space-y-1.5 text-right">
                <label className="block text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600 dark:text-indigo-400" />
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
                    placeholder="نام زیبایت را اینجا بنویس (مثلاً: علی، سارا)..."
                    className="w-full px-4 py-2.5 sm:py-3.5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-extrabold text-sm sm:text-base focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all placeholder:font-normal placeholder:text-slate-400 text-right shadow-inner"
                    autoFocus
                  />
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base pointer-events-none">
                    ✏️
                  </span>
                </div>
                {errorMsg && (
                  <p className="text-xs font-bold text-rose-500 dark:text-rose-400 mt-0.5">
                    {errorMsg}
                  </p>
                )}
              </div>

              {/* Option 2: iOS-Style Horizontal Magnifying Age Wheel Picker */}
              <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800">
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
      <footer className="w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 py-2.5 sm:py-3 px-4 sm:px-8 z-30 shrink-0 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          
          {/* Next Button (بعدی / بزن بریم) */}
          <button
            type="button"
            onClick={handleNext}
            disabled={isSubmitting}
            className={`px-5 sm:px-8 py-2.5 sm:py-3 rounded-2xl font-black text-sm sm:text-base flex items-center gap-1.5 sm:gap-2 shadow-lg transition-all active:scale-95 cursor-pointer ${
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
            className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl font-black text-sm sm:text-base flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer ${
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

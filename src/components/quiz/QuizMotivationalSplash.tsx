/**
 * QuizMotivationalSplash component for Math Hero.
 * Full-screen responsive motivational intro splash shown before the quiz questions start.
 * 
 * Features:
 * - 10 Predefined inspirational sentences for young math champions (randomly selected on mount).
 * - Randomly selected large Owl character (from Thinking, Thinking2, Thinking3, Ready) without background boxes.
 * - Responsive layout: 
 *   - Mobile/Tablet Portrait: Motivational message at top, prominent Owl character in center, big "شروع آزمون" button at bottom.
 *   - Desktop & Tablet Landscape: 2-column layout (Text and start action on right, Mr. Owl on left in RTL).
 * - Safe exit / cancel button at the top header.
 */

import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { QuizMode, QuizSession } from '../../types';
import { getAssetUrl } from '../../utils/assetPaths';
import { toPersianDigits } from '../../utils/persian';

interface QuizMotivationalSplashProps {
  session?: QuizSession;
  mode: QuizMode;
  totalQuestions: number;
  onStartQuiz: () => void;
  onExit: () => void;
}

const MOTIVATIONAL_MESSAGES: string[] = [
  'تو یک قهرمان باهوش هستی! با آرامش و تمرکز به سوال‌ها جواب بده و بدرخش 🌟',
  'آماده یک ماجراجویی شگفت‌انگیز در دنیای ریاضی باش! تو از پس هر مسئله‌ای برمی‌آیی 🚀',
  'هر سوال یک فرصت عالی برای کشف قدرت ذهن توست! با اعتمادبه‌نفس شروع کن 🧠✨',
  'یادت باشه سرعت مهم نیست، دقت و آرامش تو رمز پیروزی و موفقیته 🎯',
  'آقای جغد دانا همراه توست! با لبخند و تمرکز بالا برو به سمت امتیاز عالی 🦉💫',
  'تو تا الان پیشرفت فوق‌العاده‌ای داشتی! امروز هم می‌تونی رکورد جدیدی بسازی 🏆',
  'اشتباه کردن بخشی از یادگیریه، پس نترس و با شجاعت معماها رو حل کن 💪🌱',
  'تمرکز، آرامش و دقت؛ این سه کلید جادویی قهرمانان ریاضی در دست توست 🗝️✨',
  'ذهن تو مثل یک کامپیوتر قدرتمنده! نفس عمیق بکش و مهارتت رو نشون بده ⚡🌈',
  'یک چالش تازه و هیجان‌انگیز پیش روی توست! آماده‌ای که بدرخشی؟ بزن بریم 🌟🔥',
];

const OWL_IMAGE_PATHS: string[] = [
  'assets/characters/owl/Thinking3.webp',
  'assets/characters/owl/Thinking2.webp',
  'assets/characters/owl/Thinking.webp',
  'assets/characters/owl/Ready.webp',
];

export const QuizMotivationalSplash: React.FC<QuizMotivationalSplashProps> = ({
  mode,
  totalQuestions,
  onStartQuiz,
  onExit,
}) => {
  // Randomly pick one motivational sentence and one owl image on initial mount
  const motivationalText = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length);
    return MOTIVATIONAL_MESSAGES[randomIndex];
  }, []);

  const owlImageSrc = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * OWL_IMAGE_PATHS.length);
    return getAssetUrl(OWL_IMAGE_PATHS[randomIndex]);
  }, []);

  const isPractice = mode === 'practice';

  return (
    <motion.div
      id="quiz-motivational-splash"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] w-full h-full bg-gradient-to-br from-slate-50 via-indigo-50/70 to-amber-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 backdrop-blur-xl text-slate-900 dark:text-white flex flex-col justify-between overflow-y-auto overflow-x-hidden select-none"
      dir="rtl"
      style={{
        paddingTop: 'max(0.75rem, env(safe-area-inset-top, 0px))',
        paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0px))',
        paddingLeft: 'max(0.75rem, env(safe-area-inset-left, 0px))',
        paddingRight: 'max(0.75rem, env(safe-area-inset-right, 0px))',
      }}
    >
      {/* Background Ambient Glow Circles */}
      <div className="absolute top-10 right-1/4 w-72 h-72 bg-indigo-400/20 dark:bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-80 h-80 bg-amber-400/20 dark:bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* 1. Top Header Bar: Status Badge and Exit Button */}
      <div className="relative z-10 w-full max-w-5xl mx-auto flex items-center justify-between px-2 sm:px-4 py-2 shrink-0">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-900 dark:text-indigo-200 text-xs font-bold border border-indigo-200 dark:border-indigo-500/30 backdrop-blur-md">
            <span>{isPractice ? 'حالت تمرینی' : 'حالت آزمون'}</span>
            <span>•</span>
            <span>{toPersianDigits(totalQuestions)} سوال</span>
          </span>
        </div>

        <button
          type="button"
          onClick={onExit}
          className="w-10 h-10 rounded-full bg-slate-200/80 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20 active:scale-95 text-slate-700 dark:text-white flex items-center justify-center transition-all cursor-pointer border border-slate-300/80 dark:border-white/15 shadow-sm"
          title="انصراف و بازگشت به خانه"
        >
          <span className="text-xl font-black leading-none">✕</span>
        </button>
      </div>

      {/* 2. Main Center Responsive Content */}
      <div className="relative z-10 w-full max-w-5xl mx-auto flex-1 flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-12 px-4 py-2 sm:py-6">
        
        {/* RIGHT COLUMN (RTL): Motivational Quote Card & Start Action (or TOP on Mobile) */}
        <div className="w-full lg:w-3/5 flex flex-col items-center lg:items-start text-center lg:text-right space-y-4 sm:space-y-6">
          
          {/* Motivational Speech / Encouragement Banner */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="w-full bg-white/95 dark:bg-gradient-to-br dark:from-indigo-950/80 dark:via-slate-900/90 dark:to-slate-950/90 border border-slate-200/90 dark:border-indigo-500/30 rounded-3xl p-5 sm:p-7 shadow-xl dark:shadow-2xl space-y-3 sm:space-y-4 backdrop-blur-md"
          >
            <div className="flex items-center justify-center lg:justify-start gap-2 text-amber-600 dark:text-amber-400 font-black text-xs sm:text-sm">
              <span className="text-lg">✨</span>
              <span>جمله‌ی انگیزشی برای تو</span>
            </div>

            <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-relaxed sm:leading-loose">
              « {motivationalText} »
            </h2>

            <div className="pt-2 border-t border-slate-100 dark:border-white/10 flex items-center justify-center lg:justify-start gap-4 text-xs sm:text-sm text-slate-600 dark:text-indigo-200">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                <span>{toPersianDigits(totalQuestions)} معما آماده پاسخگویی</span>
              </span>
            </div>
          </motion.div>

          {/* Start Quiz Action Button */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="w-full pt-1 sm:pt-2"
          >
            <button
              id="splash-start-quiz-btn"
              type="button"
              onClick={onStartQuiz}
              className="w-full py-4 sm:py-5 px-8 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 active:scale-[0.98] text-white font-black text-lg sm:text-2xl rounded-2xl sm:rounded-3xl shadow-[0_10px_30px_rgba(16,185,129,0.35)] hover:shadow-[0_15px_40px_rgba(16,185,129,0.5)] transition-all cursor-pointer flex items-center justify-center gap-3 group border border-emerald-300/40"
            >
              <span>شروع آزمون</span>
              <span className="text-2xl sm:text-3xl group-hover:translate-x-[-4px] transition-transform">
                🚀
              </span>
            </button>
          </motion.div>
        </div>

        {/* LEFT COLUMN (RTL): Big Standalone Owl Image (Static, No Opacity Flashing) */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="w-full lg:w-2/5 flex items-center justify-center select-none pointer-events-none"
        >
          {/* Owl Character Image without background box */}
          <div className="relative w-48 h-48 sm:w-64 sm:h-64 md:w-72 md:h-72 lg:w-84 lg:h-84 flex items-center justify-center">
            <img
              src={owlImageSrc}
              alt="آقای جغد دانا"
              className="w-full h-full object-contain filter drop-shadow-[0_12px_28px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_15px_35px_rgba(0,0,0,0.5)] transition-transform duration-700"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.dataset.fallback) {
                  target.dataset.fallback = '1';
                  target.src = getAssetUrl('assets/characters/owl/Ready.webp');
                }
              }}
            />
          </div>
        </motion.div>

      </div>

      {/* 3. Bottom Footer Note */}
      <div className="relative z-10 w-full max-w-5xl mx-auto text-center py-1 shrink-0">
        <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
          هوش، دقت و سرعت عمل شما در پایان آزمون ارزیابی و ثبت خواهد شد.
        </p>
      </div>
    </motion.div>
  );
};

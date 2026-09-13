import React from 'react';
import { motion } from 'motion/react';
import { getAssetUrl } from '../../utils/assetPaths';

interface SplashScreenProps {
  statusMessage?: string;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  statusMessage = 'در حال بارگذاری دنیای قهرمانان...',
}) => {
  const owlSrc = getAssetUrl('assets/characters/owl/Teaching.webp');

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.03, filter: 'blur(6px)' }}
      transition={{ duration: 0.45, ease: 'easeInOut' }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden select-none px-6 text-center bg-[radial-gradient(circle_at_50%_32%,#f3e8ff_0%,#e0e7ff_45%,#f1f5f9_82%,#f8fafc_100%)] dark:bg-[radial-gradient(circle_at_50%_32%,#2e1065_0%,#1e1b4b_45%,#0f172a_82%,#080b14_100%)]"
    >
      {/* Floating Math Badges in Background */}
      <motion.div
        animate={{ y: [0, -14, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[12%] right-[14%] w-11 h-11 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-700 dark:text-indigo-200 flex items-center justify-center text-2xl font-black shadow-lg shadow-indigo-950/5 dark:shadow-indigo-950/40 pointer-events-none"
      >
        ➕
      </motion.div>

      <motion.div
        animate={{ y: [0, -16, 0], rotate: [0, -10, 0] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
        className="absolute top-[18%] left-[12%] w-11 h-11 rounded-2xl bg-pink-500/20 border border-pink-400/30 text-pink-700 dark:text-pink-300 flex items-center justify-center text-2xl font-black shadow-lg shadow-pink-950/5 dark:shadow-pink-950/40 pointer-events-none"
      >
        ✖️
      </motion.div>

      <motion.div
        animate={{ y: [0, -12, 0], rotate: [0, 6, 0] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        className="absolute top-[42%] right-[10%] w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-700 dark:text-emerald-200 flex items-center justify-center text-2xl font-black shadow-lg shadow-emerald-950/5 dark:shadow-emerald-950/40 pointer-events-none"
      >
        ➗
      </motion.div>

      <motion.div
        animate={{ y: [0, -15, 0], rotate: [0, -8, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
        className="absolute top-[48%] left-[12%] w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 text-amber-700 dark:text-amber-300 flex items-center justify-center text-xl shadow-lg shadow-amber-950/5 dark:shadow-amber-950/40 pointer-events-none"
      >
        ⭐
      </motion.div>

      {/* Owl Character with Glowing Backdrop Aura */}
      <div className="relative flex items-center justify-center mb-6 mt-8">
        {/* Pulsating Glowing Aura */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.65, 0.95, 0.65] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute w-56 h-56 rounded-full pointer-events-none blur-2xl"
          style={{
            background: 'radial-gradient(circle, rgba(147, 51, 234, 0.45) 0%, rgba(79, 70, 229, 0.3) 45%, rgba(245, 158, 11, 0.1) 70%, transparent 85%)',
          }}
        />

        {/* Large Animated Owl Character */}
        <motion.div
          animate={{ y: [0, -12, 0], rotate: [0, -1.8, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          className="relative z-10"
        >
          <img
            src={owlSrc}
            alt="استاد جغد دانشمند"
            width={200}
            height={200}
            className="w-[min(210px,52vw)] max-w-[220px] h-auto object-contain drop-shadow-[0_20px_25px_rgba(0,0,0,0.2)] dark:drop-shadow-[0_20px_25px_rgba(0,0,0,0.45)] drop-shadow-[0_0_35px_rgba(99,102,241,0.2)] dark:drop-shadow-[0_0_35px_rgba(99,102,241,0.3)]"
          />
        </motion.div>
      </div>

      {/* App Branding & Animated Persian Title */}
      <motion.div
        initial={{ opacity: 0, y: 22, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mb-6"
      >
        <h1 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-white tracking-tight flex items-center justify-center gap-2 drop-shadow-sm dark:drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)] mb-2">
          <span>قهرمان ریاضی</span>
          <motion.span
            animate={{ rotate: [0, 15, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-block text-2xl sm:text-3xl"
          >
            ✨
          </motion.span>
        </h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 0.95, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="text-xs sm:text-sm text-slate-500 dark:text-slate-300 font-medium tracking-wide drop-shadow-sm"
        >
          Math Hero • دنیای شگفت‌انگیز بازی و یادگیری ریاضی
        </motion.p>
      </motion.div>

      {/* Sleek Animated Progress Bar */}
      <div className="relative z-10 w-full max-w-[260px] flex flex-col items-center mt-4">
        <div className="w-full h-1.5 bg-black/5 dark:bg-white/12 rounded-full overflow-hidden relative shadow-inner mb-3">
          <motion.div
            animate={{
              left: ['-40%', '30%', '105%'],
              width: ['35%', '60%', '35%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: [0.4, 0, 0.2, 1],
            }}
            className="absolute top-0 h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-400 shadow-[0_0_12px_rgba(168,85,247,0.4)] dark:shadow-[0_0_12px_rgba(168,85,247,0.6)]"
          />
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium animate-pulse">
          {statusMessage}
        </p>
      </div>
    </motion.div>
  );
};

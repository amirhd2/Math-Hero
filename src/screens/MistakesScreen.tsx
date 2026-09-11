/**
 * MistakesScreen component for Math Hero.
 * Reviews mistakes logged during previous quiz sessions.
 */

import React, { useEffect, useState } from 'react';
import { MistakeRecord, ScreenId, QuizSession } from '../types';
import { storage } from '../utils/storage';
import { formatNumber } from '../utils/persian';
import { createPracticeMistakesSession } from '../results/reviewSessionGenerator';
import { BackButton } from '../components/common/BackButton';
import { PopoutOwlAvatar } from '../components/adaptive/PopoutOwlAvatar';
import { QuickQuestionCountModal } from '../components/common/QuickQuestionCountModal';

interface MistakesScreenProps {
  onNavigate: (screen: ScreenId) => void;
  onStartSession?: (session: QuizSession) => void;
}

export const MistakesScreen: React.FC<MistakesScreenProps> = ({ onNavigate, onStartSession }) => {
  const [mistakes, setMistakes] = useState<MistakeRecord[]>([]);
  const [isCountModalOpen, setIsCountModalOpen] = useState(false);

  useEffect(() => {
    storage.getMistakes().then(setMistakes);
  }, []);

  const handleOpenCountModal = () => {
    if (mistakes.length > 0) {
      setIsCountModalOpen(true);
    }
  };

  const handleConfirmPractice = (count: number) => {
    setIsCountModalOpen(false);
    if (mistakes.length > 0 && onStartSession) {
      const session = createPracticeMistakesSession(mistakes, undefined, count);
      onStartSession(session);
    }
  };

  // Build appropriate options based on mistake count
  const questionCountOptions = React.useMemo(() => {
    const total = mistakes.length;
    if (total <= 5) return [total];
    if (total <= 10) return [5, total];
    if (total <= 15) return [5, 10, total];
    return [5, 10, 15, Math.min(20, total)];
  }, [mistakes.length]);

  return (
    <div className="w-full max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-8 space-y-8" dir="rtl">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-right">
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">گنجینه اشتباهات و مرور</h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            اشتباهات ثبت‌شده در آزمون‌ها برای تمرین و یادگیری عمیق‌تر
          </p>
        </div>

        <div className="flex items-center gap-3">
          <BackButton onClick={() => onNavigate('home')} title="بازگشت به خانه" />
        </div>
      </div>

      {mistakes.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-100 dark:border-slate-800 shadow-xl space-y-4">
          <span className="text-5xl">🏆</span>
          <h3 className="text-xl font-bold">هیچ اشتباهی ثبت نشده است!</h3>
          <p className="text-sm text-slate-500">شما همه سوالات را به درستی پاسخ داده‌اید.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Smart Teacher Pedagogical Encouragement Card (Same appearance as Home Dashboard) */}
          <div
            id="mistakes-smart-teacher-card"
            className="relative overflow-hidden rounded-3xl p-5 sm:p-6 bg-white dark:bg-slate-900 border-2 border-amber-300/80 dark:border-amber-700/60 bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-orange-500/10 dark:from-amber-950/40 dark:via-slate-900 dark:to-orange-950/30 shadow-xl select-none space-y-4"
          >
            {/* Background decorative watermark */}
            <div className="absolute -bottom-10 -right-10 w-36 h-36 bg-orange-200/20 dark:bg-amber-400/5 rounded-full blur-2xl pointer-events-none" />

            {/* Content Row: Badges, Title & Description on Right; Owl Avatar on Top-Left (in RTL) */}
            <div className="relative z-10 my-auto flex items-start justify-between gap-3 sm:gap-4">
              {/* Right Side: Badges, Title, Pedagogical Description */}
              <div className="flex-1 min-w-0 flex flex-col justify-start text-right space-y-1 sm:space-y-1.5 pt-0.5">
                {/* Badges */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/30 text-amber-950 dark:text-amber-200 text-[11px] sm:text-xs font-black shadow-xs shrink-0">
                    <span>✨</span>
                    <span>پیام معلم هوشمند</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-black shadow-xs shrink-0 bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/60">
                    فرصت طلایی یادگیری
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400">
                    ({formatNumber(mistakes.length, 'persian')} سوال نیازمند تمرین)
                  </span>
                </div>

                {/* Title */}
                <h4 className="text-sm sm:text-base md:text-lg font-black tracking-tight text-slate-950 dark:text-white line-clamp-1">
                  تبدیل اشتباهات به قوی‌ترین مهارت ریاضی!
                </h4>

                {/* Pedagogical Description */}
                <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                  اشتباه کردن یعنی مغز تو در حال یادگیری و قوی‌تر شدنه! هر کدوم از این سوالات یک پله طلایی برای پیشرفته؛ با حل دوباره‌شون، همه اشتباهاتت رو پاک کن و مدال‌های افتخار دریافت کن.
                </p>
              </div>

              {/* Left Side (in RTL): 3D Pop-out Owl Avatar at Top-Left */}
              <div className="shrink-0 self-start -mt-2 sm:-mt-3 -ml-0.5 sm:-ml-1">
                <PopoutOwlAvatar sizeClassName="w-20 h-20 sm:w-24 sm:h-24 md:w-26 md:h-26" />
              </div>
            </div>

            {/* Bottom Action: Full-width Button */}
            {onStartSession && (
              <div className="relative z-10 pt-1">
                <button
                  type="button"
                  id="btn-practice-all-mistakes"
                  onClick={handleOpenCountModal}
                  className="w-full py-3 sm:py-3.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-orange-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>شروع تمرین هوشمند و پاک‌سازی اشتباهات</span>
                  <span>🚀</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Question Count Modal (Fixed in Practice Mode) */}
          <QuickQuestionCountModal
            isOpen={isCountModalOpen}
            onClose={() => setIsCountModalOpen(false)}
            onConfirm={handleConfirmPractice}
            title="تمرین و پاک‌سازی اشتباهات"
            subtitle="تعداد سوالات مورد نظرت رو برای تمرین و یادگیری انتخاب کن. با حل این سوالات اشتباهات گذشته رو پاک می‌کنی!"
            icon="🦉"
            mode="practice"
            badgeText="🌱 حالت تمرینی"
            colorGradient="from-amber-500 to-orange-500"
            options={questionCountOptions}
            defaultCount={questionCountOptions[Math.min(1, questionCountOptions.length - 1)]}
          />

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
          {mistakes.map((m) => {
            const getOpBadge = (op: string) => {
              switch (op) {
                case 'addition':
                  return { symbol: '+', label: 'جمع', icon: '➕', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800' };
                case 'subtraction':
                  return { symbol: '−', label: 'تفریق', icon: '➖', color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800' };
                case 'multiplication':
                  return { symbol: '×', label: 'ضرب', icon: '✖️', color: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800' };
                case 'division':
                  return { symbol: '÷', label: 'تقسیم', icon: '➗', color: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800' };
                default:
                  return { symbol: '+', label: 'ریاضی', icon: '⭐', color: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' };
              }
            };
            const opBadge = getOpBadge(m.question.operation);

            return (
              <div key={m.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-lg space-y-4">
                <div className="flex justify-between items-center text-sm font-bold text-slate-500">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black border ${opBadge.color}`}>
                    <span>{opBadge.icon}</span>
                    <span>{opBadge.label}</span>
                  </span>
                  <span>{new Date(m.timestamp).toLocaleDateString('fa-IR')}</span>
                </div>

                {/* Equation Display: LTR with numbers on left, operator in middle, equals and answer on right */}
                <div
                  dir="ltr"
                  className="flex items-center justify-center gap-2.5 sm:gap-3 text-2xl sm:text-3xl font-black py-4 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 tracking-wider text-slate-800 dark:text-slate-100"
                >
                  <span className="px-3 py-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                    {formatNumber(m.question.num1, 'persian')}
                  </span>
                  <span className="text-indigo-600 dark:text-indigo-400 text-2xl font-bold">
                    {opBadge.symbol}
                  </span>
                  <span className="px-3 py-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                    {formatNumber(m.question.num2, 'persian')}
                  </span>
                  <span className="text-slate-400 font-bold">=</span>
                  <span className="px-3 py-1 bg-emerald-100/70 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 font-black rounded-xl border border-emerald-300/80 dark:border-emerald-700/80 shadow-2xs">
                    {formatNumber(m.question.correctAnswer, 'persian')}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs sm:text-sm font-bold pt-1">
                  <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900">
                    <span>پاسخ شما:</span>
                    <span className="line-through font-black text-sm sm:text-base">{formatNumber(m.userAnswer, 'persian')}</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-900">
                    <span>پاسخ درست:</span>
                    <span className="font-black text-sm sm:text-base">{formatNumber(m.question.correctAnswer, 'persian')}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    )}
  </div>
  );
};

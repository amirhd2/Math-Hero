/**
 * MistakesScreen component for Math Hero.
 * Reviews mistakes logged during previous quiz sessions.
 */

import React, { useEffect, useState } from 'react';
import { MistakeRecord, ScreenId, QuizSession } from '../types';
import { storage } from '../utils/storage';
import { formatNumber } from '../utils/persian';
import { createPracticeMistakesSession } from '../results/reviewSessionGenerator';

interface MistakesScreenProps {
  onNavigate: (screen: ScreenId) => void;
  onStartSession?: (session: QuizSession) => void;
}

export const MistakesScreen: React.FC<MistakesScreenProps> = ({ onNavigate, onStartSession }) => {
  const [mistakes, setMistakes] = useState<MistakeRecord[]>([]);

  useEffect(() => {
    storage.getMistakes().then(setMistakes);
  }, []);

  const handlePracticeMistakes = () => {
    if (mistakes.length > 0 && onStartSession) {
      const session = createPracticeMistakesSession(mistakes);
      onStartSession(session);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8" dir="rtl">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">گنجینه اشتباهات و مرور</h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            اشتباهات ثبت‌شده در آزمون‌ها برای تمرین و یادگیری عمیق‌تر
          </p>
        </div>

        <div className="flex items-center gap-3">
          {mistakes.length > 0 && onStartSession && (
            <button
              type="button"
              id="btn-practice-all-mistakes"
              onClick={handlePracticeMistakes}
              className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>تمرین هوشمند اشتباهات</span>
              <span>🚀</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center justify-center shadow-2xs cursor-pointer shrink-0"
            title="بازگشت به خانه"
            aria-label="بازگشت به خانه"
          >
            ←
          </button>
        </div>
      </div>

      {mistakes.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-100 dark:border-slate-800 shadow-xl space-y-4">
          <span className="text-5xl">🏆</span>
          <h3 className="text-xl font-bold">هیچ اشتباهی ثبت نشده است!</h3>
          <p className="text-sm text-slate-500">شما همه سوالات را به درستی پاسخ داده‌اید.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      )}
    </div>
  );
};

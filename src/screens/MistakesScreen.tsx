/**
 * MistakesScreen component for Math Hero.
 * Reviews mistakes logged during previous quiz sessions.
 */

import React, { useEffect, useState } from 'react';
import { MistakeRecord, ScreenId } from '../types';
import { storage } from '../utils/storage';
import { formatNumber } from '../utils/persian';

interface MistakesScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export const MistakesScreen: React.FC<MistakesScreenProps> = ({ onNavigate }) => {
  const [mistakes, setMistakes] = useState<MistakeRecord[]>([]);

  useEffect(() => {
    storage.getMistakes().then(setMistakes);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('home')}
          className="px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 transition-colors"
        >
          ← بازگشت به خانه
        </button>
        <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">گنجینه اشتباهات و مرور</h2>
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
            const opSymbol = m.question.operation === 'addition' ? '+' : m.question.operation === 'subtraction' ? '-' : m.question.operation === 'multiplication' ? '×' : '÷';
            return (
              <div key={m.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-lg space-y-4">
                <div className="flex justify-between items-center text-sm font-bold text-slate-500">
                  <span>سوال ریاضی</span>
                  <span>{new Date(m.timestamp).toLocaleDateString('fa-IR')}</span>
                </div>
                <div className="text-2xl font-black text-center py-3 bg-slate-50 dark:bg-slate-950 rounded-2xl">
                  {formatNumber(m.question.num1, 'persian')} {opSymbol} {formatNumber(m.question.num2, 'persian')} = ?
                </div>
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-rose-600">پاسخ شما: {formatNumber(m.userAnswer, 'persian')}</span>
                  <span className="text-emerald-600">پاسخ درست: {formatNumber(m.question.correctAnswer, 'persian')}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

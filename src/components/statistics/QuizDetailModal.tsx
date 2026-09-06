/**
 * QuizDetailModal component for Math Hero Statistics.
 * Shows detailed breakdown of a selected historic quiz session.
 */

import React from 'react';
import { QuizResult } from '../../types';
import { formatNumber, toPersianDigits } from '../../utils/persian';
import {
  extractOperationBreakdownFromQuizResult,
  PRIMARY_OPERATIONS,
} from '../../utils/operationEvidence';

interface QuizDetailModalProps {
  result: QuizResult | null;
  onClose: () => void;
}

export const QuizDetailModal: React.FC<QuizDetailModalProps> = ({ result, onClose }) => {
  if (!result) return null;

  const breakdown = extractOperationBreakdownFromQuizResult(result);
  const activeOps = PRIMARY_OPERATIONS.filter((op) => breakdown[op] && breakdown[op].totalQuestions > 0);
  const isCombined = result.operation === 'mixed' || activeOps.length > 1;

  const opTitle =
    result.operation === 'addition'
      ? 'جمع'
      : result.operation === 'subtraction'
      ? 'تفریق'
      : result.operation === 'multiplication'
      ? 'ضرب'
      : result.operation === 'division'
      ? 'تقسیم'
      : 'چالش ترکیبی';

  const dateFormatted = new Intl.DateTimeFormat('fa-IR', {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(new Date(result.timestamp));

  const mistakes = result.mistakes || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">📋</span>
              <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">
                جزئیات آزمون {opTitle}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">{dateFormatted}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Score & Key Metrics Banner */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-indigo-50 dark:bg-indigo-950/60 p-3.5 rounded-2xl border border-indigo-100 dark:border-indigo-900/60">
            <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">درصد نمره</span>
            <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
              {formatNumber(result.score, 'persian')}٪
            </p>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-950/60 p-3.5 rounded-2xl border border-emerald-100 dark:border-emerald-900/60">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">پاسخ‌ها</span>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {formatNumber(result.correctCount, 'persian')} /{' '}
              {formatNumber(result.totalQuestions, 'persian')}
            </p>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/60 p-3.5 rounded-2xl border border-amber-100 dark:border-amber-900/60">
            <span className="text-xs font-bold text-amber-700 dark:text-amber-300">پاداش XP</span>
            <p className="text-2xl font-black text-amber-500 mt-1">
              +{formatNumber(result.xpEarned, 'persian')}
            </p>
          </div>
        </div>

        {/* Mode & Duration Info */}
        <div className="flex items-center justify-between text-xs font-bold px-4 py-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
          <span className="text-slate-500">حالت آزمون:</span>
          <span className="text-slate-800 dark:text-slate-200">
            {result.mode === 'test' ? '📝 حالت آزمون' : '🌱 حالت تمرین و یادگیری'}
          </span>
          <span className="text-slate-500">زمان صرف‌شده:</span>
          <span className="text-slate-800 dark:text-slate-200">
            {result.timeElapsed ? `${formatNumber(result.timeElapsed, 'persian')} ثانیه` : '—'}
          </span>
        </div>

        {/* Combined Quiz Operation Breakdown */}
        {isCombined && activeOps.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block text-right">
              تفکیک نتایج عملیات‌ها در این آزمون:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {activeOps.map((op) => {
                const stat = breakdown[op];
                const label =
                  op === 'addition'
                    ? 'جمع ➕'
                    : op === 'subtraction'
                    ? 'تفریق ➖'
                    : op === 'multiplication'
                    ? 'ضرب ✖️'
                    : 'تقسیم ➗';
                return (
                  <div
                    key={op}
                    className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 text-center flex flex-col justify-between"
                  >
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                      {label}
                    </span>
                    <div className="flex items-center justify-center gap-1 mt-1 text-xs font-black">
                      <span className="text-emerald-600 dark:text-emerald-400">
                        {formatNumber(stat.correctCount, 'persian')}/{formatNumber(stat.totalQuestions, 'persian')}
                      </span>
                      <span className="text-slate-400 text-[10px]">
                        ({formatNumber(stat.accuracy, 'persian')}٪)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Mistakes Review if any */}
        <div className="space-y-3">
          <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center justify-between">
            <span>بررسی سوالات و اشتباهات</span>
            <span className="text-xs font-bold text-slate-400">
              {mistakes.length === 0
                ? 'بدون اشتباه 🌟'
                : `${formatNumber(mistakes.length, 'persian')} سوال نیازمند مرور`}
            </span>
          </h4>

          {mistakes.length === 0 ? (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-center text-xs font-bold text-emerald-700 dark:text-emerald-300">
              آفرین! تمامی سوالات این آزمون را به درستی پاسخ دادی.
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {mistakes.map((m, idx) => (
                <div
                  key={m.id || idx}
                  className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700 flex items-center justify-between text-xs font-bold"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-rose-500">❌</span>
                    <span dir="ltr" className="font-mono text-sm">
                      {toPersianDigits(m.question?.num1)} {m.question?.operatorSymbol || '?'}{' '}
                      {toPersianDigits(m.question?.num2)} ={' '}
                      <span className="text-emerald-600 font-black">
                        {toPersianDigits(m.question?.correctAnswer)}
                      </span>
                    </span>
                  </div>
                  <div className="text-slate-400">
                    پاسخ شما:{' '}
                    <span className="text-rose-600 line-through">
                      {toPersianDigits(m.userAnswer)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-black text-sm rounded-2xl transition-colors"
        >
          بستن جزئیات
        </button>
      </div>
    </div>
  );
};

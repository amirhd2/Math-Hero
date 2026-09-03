/**
 * QuizSetupScreen component for Math Hero.
 * Centralized, reusable configuration screen for Practice, Test, Combined Quizzes,
 * Single-operation Quizzes, and Saved Test Patterns.
 */

import React, { useState, useEffect } from 'react';
import {
  QuizConfiguration,
  QuizMode,
  OperationType,
  OperationSettings,
  ScreenId,
  TestPattern,
} from '../types';
import {
  MIN_QUESTIONS,
  MAX_QUESTIONS,
  MULTIPLICATION_TABLES,
  validateQuizConfig,
  balanceDistribution,
  DEFAULT_QUIZ_CONFIG,
} from '../utils/questionGenerator';
import { DigitCapsuleControl } from '../components/DigitCapsuleControl';
import { PercentageCapsuleControl } from '../components/PercentageCapsuleControl';
import { toPersianDigits, parseNumericInput } from '../utils/persian';
import { storage } from '../utils/storage';

interface QuizSetupScreenProps {
  initialConfig?: Partial<QuizConfiguration>;
  editingPattern?: TestPattern | null;
  onStartQuiz: (config: QuizConfiguration) => void;
  onBack: () => void;
  onNavigate: (screen: ScreenId) => void;
}

export const QuizSetupScreen: React.FC<QuizSetupScreenProps> = ({
  initialConfig,
  editingPattern,
  onStartQuiz,
  onBack,
  onNavigate,
}) => {
  // Master configuration state
  const [mode, setMode] = useState<QuizMode>(initialConfig?.mode || 'practice');
  const [questionCount, setQuestionCount] = useState<number>(
    initialConfig?.questionCount || DEFAULT_QUIZ_CONFIG.questionCount
  );
  const [selectedOps, setSelectedOps] = useState<OperationType[]>(
    initialConfig?.selectedOperations && initialConfig.selectedOperations.length > 0
      ? initialConfig.selectedOperations
      : ['addition']
  );
  const [settings, setSettings] = useState<OperationSettings>(
    initialConfig?.operationSettings || DEFAULT_QUIZ_CONFIG.operationSettings
  );
  const [distribution, setDistribution] = useState<Record<OperationType, number>>(
    initialConfig?.distribution || DEFAULT_QUIZ_CONFIG.distribution
  );

  // Accordion open/close state for each operation
  const [expandedOps, setExpandedOps] = useState<Record<OperationType, boolean>>({
    addition: false,
    subtraction: false,
    multiplication: false,
    division: false,
    mixed: false,
  });

  // Save Pattern Modal State
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [patternTitle, setPatternTitle] = useState(editingPattern?.title || '');
  const [patternIcon, setPatternIcon] = useState(editingPattern?.icon || '⭐');
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Validation feedback state
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // If editing an existing pattern or given initial config, synchronize state
  useEffect(() => {
    if (editingPattern) {
      setPatternTitle(editingPattern.title);
      setPatternIcon(editingPattern.icon || '⭐');
      if (editingPattern.config) {
        setMode(editingPattern.config.mode);
        setQuestionCount(editingPattern.config.questionCount);
        setSelectedOps(editingPattern.config.selectedOperations);
        setSettings(editingPattern.config.operationSettings);
        setDistribution(editingPattern.config.distribution);
      }
    } else if (initialConfig) {
      if (initialConfig.mode) setMode(initialConfig.mode);
      if (initialConfig.questionCount) setQuestionCount(initialConfig.questionCount);
      if (initialConfig.selectedOperations) setSelectedOps(initialConfig.selectedOperations);
      if (initialConfig.operationSettings) setSettings(initialConfig.operationSettings);
      if (initialConfig.distribution) setDistribution(initialConfig.distribution);
    }
  }, [editingPattern, initialConfig]);

  // Toggle selection of an operation
  const handleToggleOperation = (op: OperationType) => {
    let nextOps: OperationType[];
    if (selectedOps.includes(op)) {
      // Don't deselect the last remaining operation
      if (selectedOps.length === 1) return;
      nextOps = selectedOps.filter((o) => o !== op);
    } else {
      nextOps = [...selectedOps, op];
    }
    setSelectedOps(nextOps);

    // Automatically rebalance distribution if multiple operations are active
    if (nextOps.length > 1) {
      const balanced = balanceDistribution(nextOps);
      setDistribution(balanced);
    } else if (nextOps.length === 1) {
      const singleDist: Record<OperationType, number> = {
        addition: 0,
        subtraction: 0,
        multiplication: 0,
        division: 0,
        mixed: 0,
      };
      singleDist[nextOps[0]] = 100;
      setDistribution(singleDist);
    }
  };

  const handleToggleAccordion = (op: OperationType) => {
    setExpandedOps((prev) => ({
      ...prev,
      [op]: !prev[op],
    }));
  };

  // Distribution changes
  const handleDistributionChange = (op: OperationType, newPercent: number) => {
    setDistribution((prev) => ({
      ...prev,
      [op]: newPercent,
    }));
  };

  const handleEqualSplit = () => {
    const balanced = balanceDistribution(selectedOps);
    setDistribution(balanced);
  };

  const totalDistribution = selectedOps.reduce((sum, op) => sum + (distribution[op] || 0), 0);
  const isDistributionValid = selectedOps.length <= 1 || Math.abs(totalDistribution - 100) === 0;

  // Question count increment/decrement
  const handleDecrementQuestions = () => {
    setQuestionCount((prev) => Math.max(MIN_QUESTIONS, prev - 1));
  };
  const handleIncrementQuestions = () => {
    setQuestionCount((prev) => Math.min(MAX_QUESTIONS, prev + 1));
  };

  const currentQuizConfig: QuizConfiguration = {
    mode,
    questionCount,
    selectedOperations: selectedOps,
    operationSettings: settings,
    distribution,
    smartReviewEnabled: true,
  };

  // Launch quiz
  const handleStart = () => {
    const validation = validateQuizConfig(currentQuizConfig);
    if (!validation.valid) {
      setValidationErrors(validation.errors);
      return;
    }
    setValidationErrors([]);
    onStartQuiz(currentQuizConfig);
  };

  // Save current setup as Test Pattern
  const handleSavePattern = async () => {
    if (!patternTitle.trim()) {
      setSaveError('لطفاً نامی برای این الگوی آزمون وارد کنید.');
      return;
    }
    setSaveError('');

    const newPattern: TestPattern = {
      id: editingPattern ? editingPattern.id : `pattern_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: patternTitle.trim(),
      description: `شامل ${selectedOps.length} عملیات ریاضی • ${questionCount} سوال (${mode === 'practice' ? 'تمرین' : 'آزمون'})`,
      icon: patternIcon,
      isCustom: true,
      createdAt: editingPattern?.createdAt || Date.now(),
      updatedAt: Date.now(),
      config: currentQuizConfig,
    };

    await storage.saveTestPattern(newPattern);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setShowSaveModal(false);
    }, 1200);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 md:py-8 space-y-6 pb-24">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm flex items-center gap-2 shadow-xs"
        >
          <span>←</span>
          <span>بازگشت</span>
        </button>
        <div className="text-center">
          <h1 className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100">
            {editingPattern ? 'ویرایش الگوی آزمون' : 'تنظیمات چالش ریاضی'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            حالت، تعداد سوالات و عملیات را مشخص کنید
          </p>
        </div>
        <button
          onClick={() => onNavigate('presets')}
          className="px-3 py-2 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 font-bold text-xs border border-indigo-200 dark:border-indigo-800 transition-colors"
        >
          الگوها 📋
        </button>
      </div>

      {/* 1. Activity Mode Selector */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            حالت فعالیت (Activity Mode)
          </span>
          <span className="text-xs font-medium text-slate-400">
            {mode === 'practice' ? 'یادگیری بدون استرس' : 'سنجش دقیق و ارزیابی'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Practice Mode Card */}
          <button
            type="button"
            onClick={() => setMode('practice')}
            className={`p-4 rounded-2xl border-2 text-right transition-all flex flex-col gap-2 ${
              mode === 'practice'
                ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-200 shadow-md ring-2 ring-emerald-500/20'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-2xl">🌱</span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                  mode === 'practice'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                یادگیری و تمرین
              </span>
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">حالت تمرین (Practice)</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                اشتباهات بدون نمره منفی هستند؛ ۳ شانس پاسخ و راهنمایی هوشمند گام‌به‌گام.
              </p>
            </div>
          </button>

          {/* Test Mode Card */}
          <button
            type="button"
            onClick={() => setMode('test')}
            className={`p-4 rounded-2xl border-2 text-right transition-all flex flex-col gap-2 ${
              mode === 'test'
                ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/30 text-indigo-950 dark:text-indigo-200 shadow-md ring-2 ring-indigo-500/20'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-2xl">🎯</span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                  mode === 'test'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                آزمون استاندارد
              </span>
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">حالت آزمون (Test)</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                شبیه‌ساز امتحان واقعی؛ یک‌بار پاسخ، بدون نمایش جواب در حین آزمون و قفل بازگشت.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* 2. Number of Questions Control */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">تعداد سوالات چالش</h3>
            <p className="text-xs text-slate-500">حداقل {toPersianDigits(MIN_QUESTIONS)} و حداکثر {toPersianDigits(MAX_QUESTIONS)} سوال</p>
          </div>

          {/* Stepper & Direct input */}
          <div className="flex items-center rounded-2xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={handleDecrementQuestions}
              disabled={questionCount <= MIN_QUESTIONS}
              className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center font-black text-xl text-slate-700 dark:text-slate-200 shadow-xs hover:bg-indigo-50 disabled:opacity-30 active:scale-95 transition-all"
            >
              −
            </button>

            <div className="min-w-[70px] px-2 text-center">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9۰-۹]*"
                value={toPersianDigits(questionCount)}
                onChange={(e) => {
                  const val = parseNumericInput(e.target.value);
                  if (!Number.isNaN(val)) {
                    setQuestionCount(Math.max(MIN_QUESTIONS, Math.min(MAX_QUESTIONS, val)));
                  }
                }}
                className="w-14 text-center font-black text-lg bg-transparent text-slate-800 dark:text-slate-100 outline-none"
              />
              <span className="text-[10px] block font-bold text-slate-400 -mt-1">سوال</span>
            </div>

            <button
              type="button"
              onClick={handleIncrementQuestions}
              disabled={questionCount >= MAX_QUESTIONS}
              className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center font-black text-xl text-slate-700 dark:text-slate-200 shadow-xs hover:bg-indigo-50 disabled:opacity-30 active:scale-95 transition-all"
            >
              +
            </button>
          </div>
        </div>

        {/* Quick select count chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs text-slate-400 ml-1">تعداد پیشنهادی:</span>
          {[5, 10, 15, 20, 25].map((cnt) => (
            <button
              key={cnt}
              type="button"
              onClick={() => setQuestionCount(cnt)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                questionCount === cnt
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {toPersianDigits(cnt)} سوال
            </button>
          ))}
        </div>
      </div>

      {/* 3. Operation Selection & Compact Rows */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm">
            انتخاب و تنظیمات عملیات ریاضی
          </h3>
          <span className="text-xs text-slate-400">
            {toPersianDigits(selectedOps.length)} عملیات فعال
          </span>
        </div>

        {/* --- 3A. ADDITION ROW --- */}
        <div
          className={`rounded-3xl border transition-all overflow-hidden bg-white dark:bg-slate-900 ${
            selectedOps.includes('addition')
              ? 'border-emerald-300 dark:border-emerald-800 shadow-sm'
              : 'border-slate-200 dark:border-slate-800 opacity-80'
          }`}
        >
          <div className="p-4 flex flex-wrap items-center justify-between gap-3">
            {/* Checkbox and title */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="op-addition"
                checked={selectedOps.includes('addition')}
                onChange={() => handleToggleOperation('addition')}
                className="w-5 h-5 rounded-lg text-emerald-600 accent-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <label
                htmlFor="op-addition"
                className="font-black text-slate-800 dark:text-slate-100 flex items-center gap-2 cursor-pointer text-sm"
              >
                <span className="text-lg">➕</span>
                <span>جمع اعداد (Addition)</span>
              </label>
            </div>

            {/* Compact Digit Configuration */}
            <div className="flex items-center gap-2">
              <DigitCapsuleControl
                value={settings.addition.operand1Digits}
                onChange={(v) =>
                  setSettings((prev) => ({
                    ...prev,
                    addition: { ...prev.addition, operand1Digits: v },
                  }))
                }
                disabled={!selectedOps.includes('addition')}
              />
              <span className="font-bold text-slate-400 text-xs">+</span>
              <DigitCapsuleControl
                value={settings.addition.operand2Digits}
                onChange={(v) =>
                  setSettings((prev) => ({
                    ...prev,
                    addition: { ...prev.addition, operand2Digits: v },
                  }))
                }
                disabled={!selectedOps.includes('addition')}
              />

              <button
                type="button"
                onClick={() => handleToggleAccordion('addition')}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors text-xs"
                title="جزئیات بیشتر"
              >
                {expandedOps.addition ? '▲' : '▼'}
              </button>
            </div>
          </div>

          {/* Addition Accordion Details */}
          {expandedOps.addition && (
            <div className="px-4 pb-4 pt-2 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 text-xs text-slate-600 dark:text-slate-400 space-y-2">
              <div className="flex items-center justify-between">
                <span>نمونه سوال بر اساس تنظیمات فعلی:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-sm" dir="ltr">
                  {settings.addition.operand1Digits === 1 ? '7' : settings.addition.operand1Digits === 2 ? '42' : '315'} +{' '}
                  {settings.addition.operand2Digits === 1 ? '8' : settings.addition.operand2Digits === 2 ? '25' : '140'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                هر کپسول تعداد ارقام عدد اول و دوم را مشخص می‌کند (۱ تا ۴ رقم).
              </p>
            </div>
          )}
        </div>

        {/* --- 3B. SUBTRACTION ROW --- */}
        <div
          className={`rounded-3xl border transition-all overflow-hidden bg-white dark:bg-slate-900 ${
            selectedOps.includes('subtraction')
              ? 'border-sky-300 dark:border-sky-800 shadow-sm'
              : 'border-slate-200 dark:border-slate-800 opacity-80'
          }`}
        >
          <div className="p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="op-subtraction"
                checked={selectedOps.includes('subtraction')}
                onChange={() => handleToggleOperation('subtraction')}
                className="w-5 h-5 rounded-lg text-sky-600 accent-sky-600 focus:ring-sky-500 cursor-pointer"
              />
              <label
                htmlFor="op-subtraction"
                className="font-black text-slate-800 dark:text-slate-100 flex items-center gap-2 cursor-pointer text-sm"
              >
                <span className="text-lg">➖</span>
                <span>تفریق و منها (Subtraction)</span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <DigitCapsuleControl
                value={settings.subtraction.operand1Digits}
                onChange={(v) =>
                  setSettings((prev) => ({
                    ...prev,
                    subtraction: { ...prev.subtraction, operand1Digits: v },
                  }))
                }
                disabled={!selectedOps.includes('subtraction')}
              />
              <span className="font-bold text-slate-400 text-xs">−</span>
              <DigitCapsuleControl
                value={settings.subtraction.operand2Digits}
                onChange={(v) =>
                  setSettings((prev) => ({
                    ...prev,
                    subtraction: { ...prev.subtraction, operand2Digits: v },
                  }))
                }
                disabled={!selectedOps.includes('subtraction')}
              />

              <button
                type="button"
                onClick={() => handleToggleAccordion('subtraction')}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors text-xs"
                title="جزئیات بیشتر"
              >
                {expandedOps.subtraction ? '▲' : '▼'}
              </button>
            </div>
          </div>

          {expandedOps.subtraction && (
            <div className="px-4 pb-4 pt-2 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 text-xs text-slate-600 dark:text-slate-400 space-y-3">
              <div className="flex items-center justify-between">
                <span>نمونه سوال بر اساس تنظیمات فعلی:</span>
                <span className="font-bold text-sky-600 dark:text-sky-400 font-mono text-sm" dir="ltr">
                  {settings.subtraction.operand1Digits === 1 ? '9' : settings.subtraction.operand1Digits === 2 ? '54' : '420'} −{' '}
                  {settings.subtraction.operand2Digits === 1 ? '6' : settings.subtraction.operand2Digits === 2 ? '21' : '110'}
                </span>
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-slate-200/50 dark:border-slate-800">
                <input
                  type="checkbox"
                  id="sub-allow-negative"
                  checked={settings.subtraction.allowNegative}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      subtraction: { ...prev.subtraction, allowNegative: e.target.checked },
                    }))
                  }
                  className="rounded text-sky-600 focus:ring-sky-500"
                />
                <label htmlFor="sub-allow-negative" className="text-xs text-slate-700 dark:text-slate-300">
                  اجازه حاصل منفی (برای سطوح پیشرفته)
                </label>
              </div>
            </div>
          )}
        </div>

        {/* --- 3C. MULTIPLICATION ROW --- */}
        <div
          className={`rounded-3xl border transition-all overflow-hidden bg-white dark:bg-slate-900 ${
            selectedOps.includes('multiplication')
              ? 'border-amber-300 dark:border-amber-800 shadow-sm'
              : 'border-slate-200 dark:border-slate-800 opacity-80'
          }`}
        >
          <div className="p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="op-multiplication"
                checked={selectedOps.includes('multiplication')}
                onChange={() => handleToggleOperation('multiplication')}
                className="w-5 h-5 rounded-lg text-amber-500 accent-amber-500 focus:ring-amber-500 cursor-pointer"
              />
              <label
                htmlFor="op-multiplication"
                className="font-black text-slate-800 dark:text-slate-100 flex items-center gap-2 cursor-pointer text-sm"
              >
                <span className="text-lg">✖️</span>
                <span>ضرب اعداد (Multiplication)</span>
              </label>
            </div>

            {/* Mode Capsule & Quick summary */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleToggleAccordion('multiplication')}
                disabled={!selectedOps.includes('multiplication')}
                className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold text-xs border border-amber-200 dark:border-amber-800 flex items-center gap-1.5 shadow-xs"
              >
                <span>
                  {settings.multiplication.mode === 'table'
                    ? `جدول ضرب ${toPersianDigits(settings.multiplication.tableNumber)}`
                    : 'ضرب آزاد ارقام'}
                </span>
                <span className="text-[10px]">{expandedOps.multiplication ? '▲' : '▼'}</span>
              </button>
            </div>
          </div>

          {/* Multiplication Accordion Details */}
          {expandedOps.multiplication && (
            <div className="px-4 pb-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 text-xs text-slate-600 dark:text-slate-400 space-y-4">
              {/* Mode switch: Table vs Free */}
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 dark:text-slate-300">نوع چالش ضرب:</span>
                <div className="flex items-center bg-slate-200 dark:bg-slate-800 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() =>
                      setSettings((prev) => ({
                        ...prev,
                        multiplication: { ...prev.multiplication, mode: 'table' },
                      }))
                    }
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      settings.multiplication.mode === 'table'
                        ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    جدول ضرب معین
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSettings((prev) => ({
                        ...prev,
                        multiplication: { ...prev.multiplication, mode: 'free' },
                      }))
                    }
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      settings.multiplication.mode === 'free'
                        ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    ارقام دلخواه (آزاد)
                  </button>
                </div>
              </div>

              {/* Table Selector Dropdown */}
              {settings.multiplication.mode === 'table' ? (
                <div className="flex items-center justify-between bg-white dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-800 dark:text-slate-100 text-xs block">
                      انتخاب شماره جدول ضرب
                    </span>
                    <span className="text-[11px] text-slate-400">
                      سوالات متمرکز بر این عدد تولید می‌شوند (مثلاً {toPersianDigits(settings.multiplication.tableNumber)} × ۳)
                    </span>
                  </div>

                  <select
                    value={settings.multiplication.tableNumber}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        multiplication: {
                          ...prev.multiplication,
                          tableNumber: Number(e.target.value),
                        },
                      }))
                    }
                    className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-sm border border-slate-300 dark:border-slate-600 outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {MULTIPLICATION_TABLES.map((t) => (
                      <option key={t} value={t}>
                        جدول ضرب {toPersianDigits(t)}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                /* Free Mode Digits */
                <div className="flex items-center justify-between bg-white dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-slate-800 dark:text-slate-100 text-xs">
                    تعداد ارقام ضرب آزاد:
                  </span>
                  <div className="flex items-center gap-2">
                    <DigitCapsuleControl
                      label="عدد اول"
                      value={settings.multiplication.operand1Digits}
                      onChange={(v) =>
                        setSettings((prev) => ({
                          ...prev,
                          multiplication: { ...prev.multiplication, operand1Digits: v },
                        }))
                      }
                    />
                    <span className="font-bold text-slate-400 text-sm mt-3">×</span>
                    <DigitCapsuleControl
                      label="عدد دوم"
                      value={settings.multiplication.operand2Digits}
                      onChange={(v) =>
                        setSettings((prev) => ({
                          ...prev,
                          multiplication: { ...prev.multiplication, operand2Digits: v },
                        }))
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* --- 3D. DIVISION ROW --- */}
        <div
          className={`rounded-3xl border transition-all overflow-hidden bg-white dark:bg-slate-900 ${
            selectedOps.includes('division')
              ? 'border-violet-300 dark:border-violet-800 shadow-sm'
              : 'border-slate-200 dark:border-slate-800 opacity-80'
          }`}
        >
          <div className="p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="op-division"
                checked={selectedOps.includes('division')}
                onChange={() => handleToggleOperation('division')}
                className="w-5 h-5 rounded-lg text-violet-600 accent-violet-600 focus:ring-violet-500 cursor-pointer"
              />
              <label
                htmlFor="op-division"
                className="font-black text-slate-800 dark:text-slate-100 flex items-center gap-2 cursor-pointer text-sm"
              >
                <span className="text-lg">➗</span>
                <span>تقسیم هوشمند (Division)</span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleToggleAccordion('division')}
                disabled={!selectedOps.includes('division')}
                className="px-3 py-1.5 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 font-bold text-xs border border-violet-200 dark:border-violet-800 flex items-center gap-1.5 shadow-xs"
              >
                <span>
                  {settings.division.mode === 'table'
                    ? `معکوس ضرب ${toPersianDigits(settings.division.tableNumber)}`
                    : 'تقسیم آزاد'}
                </span>
                <span className="text-[10px]">{expandedOps.division ? '▲' : '▼'}</span>
              </button>
            </div>
          </div>

          {/* Division Accordion Details */}
          {expandedOps.division && (
            <div className="px-4 pb-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 text-xs text-slate-600 dark:text-slate-400 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 dark:text-slate-300">نوع تقسیم:</span>
                <div className="flex items-center bg-slate-200 dark:bg-slate-800 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() =>
                      setSettings((prev) => ({
                        ...prev,
                        division: { ...prev.division, mode: 'table' },
                      }))
                    }
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      settings.division.mode === 'table'
                        ? 'bg-white dark:bg-slate-700 text-violet-600 dark:text-violet-400 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    معکوس جدول ضرب
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSettings((prev) => ({
                        ...prev,
                        division: { ...prev.division, mode: 'free' },
                      }))
                    }
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      settings.division.mode === 'free'
                        ? 'bg-white dark:bg-slate-700 text-violet-600 dark:text-violet-400 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    تقسیم آزاد
                  </button>
                </div>
              </div>

              {settings.division.mode === 'table' ? (
                <div className="flex items-center justify-between bg-white dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-800 dark:text-slate-100 text-xs block">
                      پایه جدول تقسیم (معکوس ضرب)
                    </span>
                    <span className="text-[11px] text-slate-400">
                      تولید مقسوم‌علیه بر مبنای جدول ضرب {toPersianDigits(settings.division.tableNumber)} (مانند{' '}
                      {toPersianDigits(settings.division.tableNumber * 4)} ÷ {toPersianDigits(settings.division.tableNumber)} = ۴)
                    </span>
                  </div>

                  <select
                    value={settings.division.tableNumber}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        division: {
                          ...prev.division,
                          tableNumber: Number(e.target.value),
                        },
                      }))
                    }
                    className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-sm border border-slate-300 dark:border-slate-600 outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    {MULTIPLICATION_TABLES.map((t) => (
                      <option key={t} value={t}>
                        معکوس جدول {toPersianDigits(t)}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-white dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-slate-800 dark:text-slate-100 text-xs">
                    تعداد ارقام مقسوم و مقسوم‌علیه:
                  </span>
                  <div className="flex items-center gap-2">
                    <DigitCapsuleControl
                      label="مقسوم"
                      value={settings.division.dividendDigits}
                      onChange={(v) =>
                        setSettings((prev) => ({
                          ...prev,
                          division: { ...prev.division, dividendDigits: v },
                        }))
                      }
                    />
                    <span className="font-bold text-slate-400 text-sm mt-3">÷</span>
                    <DigitCapsuleControl
                      label="مقسوم‌علیه"
                      value={settings.division.divisorDigits}
                      onChange={(v) =>
                        setSettings((prev) => ({
                          ...prev,
                          division: { ...prev.division, divisorDigits: v },
                        }))
                      }
                    />
                  </div>
                </div>
              )}

              {/* Centralized Remainder Toggle */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-200/50 dark:border-slate-800">
                <input
                  type="checkbox"
                  id="div-allow-remainder"
                  checked={settings.division.allowRemainder}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      division: { ...prev.division, allowRemainder: e.target.checked },
                    }))
                  }
                  className="rounded text-violet-600 focus:ring-violet-500"
                />
                <label htmlFor="div-allow-remainder" className="text-xs text-slate-700 dark:text-slate-300">
                  اجازه باقی‌مانده (تقسیم غیردقیق با خارج‌قسمت صحیح)
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Question Distribution (Only if > 1 operation selected) */}
      {selectedOps.length > 1 && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-indigo-200 dark:border-indigo-900/60 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-2">
                <span>📊</span>
                <span>توزیع درصد سوالات (Question Distribution)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                سهم هر عملیات در آزمون ترکیبی را مشخص کنید
              </p>
            </div>
            <button
              type="button"
              onClick={handleEqualSplit}
              className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 font-bold text-xs transition-colors"
            >
              تقسیم مساوی ⚖️
            </button>
          </div>

          <div className="space-y-3 pt-1">
            {selectedOps.map((op) => {
              const opTitle =
                op === 'addition'
                  ? 'جمع اعداد ➕'
                  : op === 'subtraction'
                  ? 'تفریق و منها ➖'
                  : op === 'multiplication'
                  ? 'ضرب اعداد ✖️'
                  : 'تقسیم هوشمند ➗';
              const percent = distribution[op] || 0;
              const approxCount = Math.round((questionCount * percent) / 100);

              return (
                <div
                  key={op}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700"
                >
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                      {opTitle}
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      تقریباً {toPersianDigits(approxCount)} سوال از {toPersianDigits(questionCount)}
                    </span>
                  </div>

                  <PercentageCapsuleControl
                    value={percent}
                    onChange={(val) => handleDistributionChange(op, val)}
                  />
                </div>
              );
            })}
          </div>

          {/* Total constraint indicator */}
          <div
            className={`flex items-center justify-between p-3 rounded-2xl text-xs font-bold ${
              isDistributionValid
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
            }`}
          >
            <span>مجموع درصدها:</span>
            <span>
              {toPersianDigits(totalDistribution)}٪ از ۱۰۰٪ {isDistributionValid ? '✓' : '⚠️'}
            </span>
          </div>
        </div>
      )}

      {/* 5. Smart Review Architecture Note (System Controlled) */}
      <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 flex items-start gap-3">
        <span className="text-xl mt-0.5">🧠</span>
        <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          <strong className="text-indigo-600 dark:text-indigo-400 font-bold block mb-0.5">
            سیستم هوشمند مرور سوالات (Smart Review):
          </strong>
          سوالاتی که قبلاً در آن‌ها اشتباه داشته‌اید به طور خودکار و تطبیقی توسط سیستم در لابلای سوالات این چالش قرار می‌گیرند تا یادگیری پایدار محقق شود.
        </div>
      </div>

      {/* Validation Error Notices */}
      {validationErrors.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 space-y-1">
          <strong className="font-bold block">خطاهای تنظیم چالش:</strong>
          {validationErrors.map((err, i) => (
            <div key={i}>• {err}</div>
          ))}
        </div>
      )}

      {/* 6. Primary Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <button
          type="button"
          onClick={handleStart}
          className={`w-full sm:flex-1 py-4 px-6 rounded-2xl font-black text-base text-white shadow-xl hover:shadow-2xl active:scale-[0.99] transition-all flex items-center justify-center gap-2 ${
            mode === 'practice'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500'
              : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500'
          }`}
        >
          <span>{mode === 'practice' ? 'شروع تمرین یادگیری' : 'شروع آزمون نهایی'}</span>
          <span>{mode === 'practice' ? '🌱' : '🚀'}</span>
        </button>

        <button
          type="button"
          onClick={() => setShowSaveModal(true)}
          className="w-full sm:w-auto px-5 py-4 rounded-2xl font-bold text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm flex items-center justify-center gap-2 transition-colors"
        >
          <span>💾</span>
          <span>ذخیره به عنوان الگو</span>
        </button>
      </div>

      {/* 7. Save Pattern Modal Dialog */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-base">
                ذخیره چیدمان به عنوان الگوی آزمون
              </h3>
              <button
                onClick={() => setShowSaveModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              این چیدمان ذخیره خواهد شد تا در مراجعات بعدی با یک کلیک بتوانید مجدداً آن را اجرا کنید.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  نام الگو:
                </label>
                <input
                  type="text"
                  value={patternTitle}
                  onChange={(e) => setPatternTitle(e.target.value)}
                  placeholder="مثلاً: آزمون ضرب و جمع قهرمان"
                  maxLength={35}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  نماد الگو:
                </label>
                <div className="flex items-center gap-2">
                  {['⭐', '🏆', '🚀', '🧠', '➕', '✖️', '🎯', '🔥'].map((ico) => (
                    <button
                      key={ico}
                      type="button"
                      onClick={() => setPatternIcon(ico)}
                      className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                        patternIcon === ico
                          ? 'bg-indigo-600 text-white shadow-md scale-110'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {ico}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {saveError && (
              <p className="text-xs text-rose-500 font-bold">{saveError}</p>
            )}

            {saveSuccess && (
              <p className="text-xs text-emerald-500 font-bold">الگو با موفقیت ذخیره شد! ✨</p>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleSavePattern}
                className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-500 transition-colors shadow-md"
              >
                تأیید و ذخیره الگو
              </button>
              <button
                type="button"
                onClick={() => setShowSaveModal(false)}
                className="py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

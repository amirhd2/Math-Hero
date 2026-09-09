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
import { SmartTeacherEngine } from '../adaptive/smartTeacherEngine';
import { AdaptiveLearningPlan } from '../adaptive/adaptiveTypes';
import { getTierDefinition } from '../adaptive/tierRegistry';
import { BackButton } from '../components/common/BackButton';

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
  useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
      const root = document.getElementById('root');
      if (root) root.scrollTop = 0;
    };
    scrollToTop();
    setTimeout(scrollToTop, 10);
    setTimeout(scrollToTop, 50);
    setTimeout(scrollToTop, 150);
  }, []);
  const [mode, setMode] = useState<QuizMode>(initialConfig?.mode || 'practice');
  const [questionCount, setQuestionCount] = useState<number>(
    initialConfig?.questionCount || DEFAULT_QUIZ_CONFIG.questionCount
  );
  
  // By default, if combined quiz, select all 4. If single, select that one.
  const [selectedOps, setSelectedOps] = useState<OperationType[]>(
    initialConfig?.selectedOperations && initialConfig.selectedOperations.length > 0
      ? initialConfig.selectedOperations
      : ['addition']
  );
  
  const [settings, setSettings] = useState<OperationSettings>(
    initialConfig?.operationSettings || DEFAULT_QUIZ_CONFIG.operationSettings
  );
  const [distribution, setDistribution] = useState<Record<OperationType, number>>(() => {
    if (initialConfig?.distribution) return initialConfig.distribution;
    if (initialConfig?.selectedOperations && initialConfig.selectedOperations.length > 1) {
      return balanceDistribution(initialConfig.selectedOperations);
    }
    return DEFAULT_QUIZ_CONFIG.distribution;
  });

  const [expandedOps, setExpandedOps] = useState<Record<OperationType, boolean>>({
    addition: false,
    subtraction: false,
    multiplication: false,
    division: false,
    mixed: false,
  });

  const [isAdaptive, setIsAdaptive] = useState<boolean>(() => {
    if (initialConfig?.isAdaptive !== undefined) return initialConfig.isAdaptive;
    return true; // Default to adaptive
  });
  const [adaptivePlan, setAdaptivePlan] = useState<AdaptiveLearningPlan | null>(null);

  useEffect(() => {
    SmartTeacherEngine.getLearningPlan().then((plan) => setAdaptivePlan(plan));
  }, []);

  useEffect(() => {
    if (editingPattern) {
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
      if (initialConfig.isAdaptive !== undefined) {
        setIsAdaptive(initialConfig.isAdaptive);
      }
    }
  }, [initialConfig, editingPattern]);

  const handleStartQuiz = () => {
    const config: QuizConfiguration = {
      mode,
      questionCount,
      selectedOperations: selectedOps,
      operationSettings: settings,
      distribution,
      smartReviewEnabled: false,
      isAdaptive,
    };
    onStartQuiz(config);
  };

  const handleToggleOperation = (op: OperationType) => {
    if (selectedOps.includes(op)) {
      if (selectedOps.length === 1) return;
      const nextOps = selectedOps.filter((o) => o !== op);
      setSelectedOps(nextOps);
      if (nextOps.length > 1) {
        setDistribution(balanceDistribution(nextOps));
      } else {
        const d = { addition: 0, subtraction: 0, multiplication: 0, division: 0, mixed: 0 };
        d[nextOps[0]] = 100;
        setDistribution(d as any);
      }
    } else {
      const nextOps = [...selectedOps, op];
      setSelectedOps(nextOps);
      setDistribution(balanceDistribution(nextOps));
    }
  };

  const handleDistributionChange = (op: OperationType, val: number) => {
    setDistribution((prev) => ({ ...prev, [op]: val }));
  };

  const handleEqualSplit = () => {
    setDistribution(balanceDistribution(selectedOps));
  };
  
  const handleToggleAccordion = (op: OperationType) => {
    setExpandedOps((prev) => ({ ...prev, [op]: !prev[op] }));
  };

  const isCombinedSource = initialConfig?.selectedOperations && initialConfig.selectedOperations.length > 1;

  return (
    <div className="w-full max-w-5xl 2xl:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6 pb-24">
      <div className="flex items-center justify-between gap-4">
        <div className="text-right">
          <h1 className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100">
            {editingPattern ? 'ویرایش الگوی آزمون' : 'تنظیمات چالش ریاضی'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            حالت، تعداد سوالات و عملیات را مشخص کنید
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button onClick={() => onNavigate('presets')} className="px-3 py-2 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 font-bold text-xs border border-indigo-200 dark:border-indigo-800 transition-colors">
            الگوها ⭐
          </button>
          <BackButton onClick={onBack} title="بازگشت" />
        </div>
      </div>

      
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            سیستم آموزشی
          </span>
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setIsAdaptive(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isAdaptive ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'}`}
            >
              مسیر هوشمند 🧠
            </button>
            <button
              onClick={() => setIsAdaptive(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${!isAdaptive ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'}`}
            >
              کنترل دستی ⚙️
            </button>
          </div>
        </div>
      </div>

            {/* Quiz Mode (Practice / Test) */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="space-y-0.5">
          <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-2">
            <span>🎯</span>
            <span>حالت فعالیت</span>
          </h3>
          <p className="text-xs text-slate-500">نوع چالش ریاضی خود را انتخاب کنید</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Practice Mode */}
          <button
            type="button"
            onClick={() => setMode('practice')}
            className={`p-4 rounded-2xl border-2 transition-all flex flex-col text-right gap-2 cursor-pointer ${
              mode === 'practice'
                ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 shadow-sm'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-black text-sm flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                <span>🌱</span>
                <span>حالت تمرین</span>
              </span>
              {mode === 'practice' && <span className="text-emerald-600 font-bold text-xs">✓ فعال</span>}
            </div>
            <ul className="text-[11px] space-y-1 text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-1.5">
                <span>✅</span>
                <span>اشتباهات بدون نمره منفی</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span>💡</span>
                <span>۳ شانس پاسخ و راهنمای هوشمند</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span>🔍</span>
                <span>نمایش پاسخ صحیح و بازخورد آموزنده</span>
              </li>
            </ul>
          </button>

          {/* Test Mode */}
          <button
            type="button"
            onClick={() => setMode('test')}
            className={`p-4 rounded-2xl border-2 transition-all flex flex-col text-right gap-2 cursor-pointer ${
              mode === 'test'
                ? 'border-rose-500 bg-rose-50/80 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 shadow-sm'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-black text-sm flex items-center gap-1.5 text-rose-700 dark:text-rose-400">
                <span>⏱️</span>
                <span>حالت آزمون</span>
              </span>
              {mode === 'test' && <span className="text-rose-600 font-bold text-xs">✓ فعال</span>}
            </div>
            <ul className="text-[11px] space-y-1 text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-1.5">
                <span>⚠️</span>
                <span>هر خطا محاسبه می‌شود</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span>🔒</span>
                <span>عدم نمایش پاسخ صحیح در حین آزمون</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span>📊</span>
                <span>ارزیابی دقیق سرعت و زمان</span>
              </li>
            </ul>
          </button>
        </div>
      </div>

      {/* Question Count */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-2">
            <span>📝</span>
            <span>تعداد سوالات چالش</span>
          </h3>
          <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-1 rounded-lg">
            {toPersianDigits(questionCount)} سوال
          </span>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {[5, 10, 20, 30].map(num => (
            <button
              key={num}
              onClick={() => setQuestionCount(num)}
              className={`flex-1 min-w-[50px] py-2 rounded-xl text-sm font-bold transition-all border ${
                questionCount === num
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {toPersianDigits(num)}
            </button>
          ))}
          <div className="flex-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-1">
             <DigitCapsuleControl 
               value={questionCount} 
               onChange={setQuestionCount} 
               min={MIN_QUESTIONS} 
               max={MAX_QUESTIONS}
               label=""
             />
          </div>
        </div>
      </div>

      {isAdaptive && (
        <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          {isCombinedSource && (
            <div>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-2">
                انتخاب عملیات برای آزمون ترکیبی:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'addition' as const, label: 'جمع اعداد', symbol: '➕', activeBorder: 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200' },
                  { id: 'subtraction' as const, label: 'تفریق و منها', symbol: '➖', activeBorder: 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40 text-sky-900 dark:text-sky-200' },
                  { id: 'multiplication' as const, label: 'ضرب اعداد', symbol: '✖️', activeBorder: 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200' },
                  { id: 'division' as const, label: 'تقسیم هوشمند', symbol: '➗', activeBorder: 'border-violet-500 bg-violet-50/70 dark:bg-violet-950/40 text-violet-900 dark:text-violet-200' },
                ].map((item) => {
                  const isSelected = selectedOps.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleToggleOperation(item.id)}
                      className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-1.5 cursor-pointer text-center ${
                        isSelected
                          ? `${item.activeBorder} shadow-sm scale-[1.02]`
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="text-2xl">{item.symbol}</span>
                      <span className="text-xs font-black">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          
          <div className="space-y-3">
            {selectedOps.map((op) => {
              const currentTier = adaptivePlan?.operations[op]?.currentTier || 1;
              const tierDef = getTierDefinition(op, currentTier);
              return (
                <div key={op} className="p-4 sm:p-5 bg-gradient-to-l from-indigo-50/90 via-purple-50/60 to-indigo-50/90 dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-indigo-950/40 rounded-3xl border border-indigo-100 dark:border-indigo-900/50 space-y-3.5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xl shadow-xs">
                        ⭐
                      </div>
                      <div>
                        <span className="text-xs font-black text-indigo-950 dark:text-indigo-200 block">
                          سطح فعلی تو: {tierDef?.stageNameFa || tierDef?.titleFa || `مرحله ${toPersianDigits(currentTier)}`}
                        </span>
                        <span className="text-[11px] text-indigo-700 dark:text-indigo-400 font-medium">
                          {tierDef?.titleFa}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!isAdaptive && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm">
              تنظیمات دستی عملیات ریاضی
            </h3>
          </div>

          {/* ADDITION */}
          <div className={`rounded-3xl border transition-all overflow-hidden bg-white dark:bg-slate-900 ${selectedOps.includes('addition') ? 'border-emerald-300 dark:border-emerald-800 shadow-sm' : 'border-slate-200 dark:border-slate-800 opacity-80'}`}>
            <div className="p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedOps.includes('addition')}
                  onChange={() => handleToggleOperation('addition')}
                  className="w-5 h-5 rounded-lg text-emerald-500 accent-emerald-500 focus:ring-emerald-500 cursor-pointer"
                />
                <label className="font-black text-slate-800 dark:text-slate-100 flex items-center gap-2 text-sm cursor-pointer" onClick={() => handleToggleOperation('addition')}>
                  <span>➕</span>
                  <span>جمع اعداد</span>
                </label>
              </div>
              <button onClick={() => handleToggleAccordion('addition')} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
                {expandedOps.addition ? 'بستن' : 'تنظیمات'}
              </button>
            </div>
            {expandedOps.addition && selectedOps.includes('addition') && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-center gap-4 bg-white dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <DigitCapsuleControl value={settings.addition.operand1Digits} onChange={(v) => setSettings(prev => ({ ...prev, addition: { ...prev.addition, operand1Digits: v } }))} label="ارقام عدد اول" />
                  <span className="font-bold text-slate-400 text-sm mt-3">+</span>
                  <DigitCapsuleControl value={settings.addition.operand2Digits} onChange={(v) => setSettings(prev => ({ ...prev, addition: { ...prev.addition, operand2Digits: v } }))} label="ارقام عدد دوم" />
                </div>
              </div>
            )}
          </div>

          {/* SUBTRACTION */}
          <div className={`rounded-3xl border transition-all overflow-hidden bg-white dark:bg-slate-900 ${selectedOps.includes('subtraction') ? 'border-sky-300 dark:border-sky-800 shadow-sm' : 'border-slate-200 dark:border-slate-800 opacity-80'}`}>
            <div className="p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedOps.includes('subtraction')}
                  onChange={() => handleToggleOperation('subtraction')}
                  className="w-5 h-5 rounded-lg text-sky-500 accent-sky-500 focus:ring-sky-500 cursor-pointer"
                />
                <label className="font-black text-slate-800 dark:text-slate-100 flex items-center gap-2 text-sm cursor-pointer" onClick={() => handleToggleOperation('subtraction')}>
                  <span>➖</span>
                  <span>تفریق و منها</span>
                </label>
              </div>
              <button onClick={() => handleToggleAccordion('subtraction')} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
                {expandedOps.subtraction ? 'بستن' : 'تنظیمات'}
              </button>
            </div>
            {expandedOps.subtraction && selectedOps.includes('subtraction') && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-center gap-4 bg-white dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <DigitCapsuleControl value={settings.subtraction.operand1Digits} onChange={(v) => setSettings(prev => ({ ...prev, subtraction: { ...prev.subtraction, operand1Digits: v } }))} label="ارقام عدد اول" />
                  <span className="font-bold text-slate-400 text-sm mt-3">-</span>
                  <DigitCapsuleControl value={settings.subtraction.operand2Digits} onChange={(v) => setSettings(prev => ({ ...prev, subtraction: { ...prev.subtraction, operand2Digits: v } }))} label="ارقام عدد دوم" />
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-slate-200/50 dark:border-slate-800">
                  <input type="checkbox" checked={settings.subtraction.allowNegative} onChange={(e) => setSettings(prev => ({ ...prev, subtraction: { ...prev.subtraction, allowNegative: e.target.checked } }))} id="allow-neg" className="w-4 h-4 rounded text-sky-500 focus:ring-sky-500 cursor-pointer" />
                  <label htmlFor="allow-neg" className="text-xs text-slate-600 dark:text-slate-400 cursor-pointer font-medium">اجازه تولید جواب‌های منفی (عدد اول کوچکتر)</label>
                </div>
              </div>
            )}
          </div>

          {/* MULTIPLICATION */}
          <div className={`rounded-3xl border transition-all overflow-hidden bg-white dark:bg-slate-900 ${selectedOps.includes('multiplication') ? 'border-amber-300 dark:border-amber-800 shadow-sm' : 'border-slate-200 dark:border-slate-800 opacity-80'}`}>
            <div className="p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedOps.includes('multiplication')}
                  onChange={() => handleToggleOperation('multiplication')}
                  className="w-5 h-5 rounded-lg text-amber-500 accent-amber-500 focus:ring-amber-500 cursor-pointer"
                />
                <label className="font-black text-slate-800 dark:text-slate-100 flex items-center gap-2 text-sm cursor-pointer" onClick={() => handleToggleOperation('multiplication')}>
                  <span>✖️</span>
                  <span>ضرب اعداد</span>
                </label>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap justify-end">
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <button onClick={(e) => { e.stopPropagation(); setSettings(prev => ({ ...prev, multiplication: { ...prev.multiplication, mode: 'table' } })); setExpandedOps(prev => ({ ...prev, multiplication: true })); if (!selectedOps.includes('multiplication')) handleToggleOperation('multiplication'); }} className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${settings.multiplication.mode === 'table' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'}`}>
                    جدول ضرب
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setSettings(prev => ({ ...prev, multiplication: { ...prev.multiplication, mode: 'free' } })); setExpandedOps(prev => ({ ...prev, multiplication: true })); if (!selectedOps.includes('multiplication')) handleToggleOperation('multiplication'); }} className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${settings.multiplication.mode === 'free' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'}`}>
                    ضرب آزاد
                  </button>
                </div>
                <button onClick={() => handleToggleAccordion('multiplication')} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
                  {expandedOps.multiplication ? 'بستن' : 'تنظیمات'}
                </button>
              </div>
            </div>
            {expandedOps.multiplication && selectedOps.includes('multiplication') && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 space-y-4">
                {settings.multiplication.mode === 'table' ? (
                  <div className="flex items-center justify-between bg-white dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-800 dark:text-slate-100 text-xs block">جدول ضرب پایه</span>
                      <span className="text-[11px] text-slate-400">تولید سوال بر مبنای جدول عدد انتخاب شده</span>
                    </div>
                    <select
                      value={settings.multiplication.tableNumber}
                      onChange={(e) => setSettings(prev => ({ ...prev, multiplication: { ...prev.multiplication, tableNumber: parseInt(e.target.value) } }))}
                      className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm font-bold rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      {MULTIPLICATION_TABLES.map(t => (
                        <option key={t} value={t}>جدول ضرب {toPersianDigits(t)}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-4 bg-white dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <DigitCapsuleControl value={settings.multiplication.operand1Digits} onChange={(v) => setSettings(prev => ({ ...prev, multiplication: { ...prev.multiplication, operand1Digits: v } }))} label="ارقام عدد اول" />
                    <span className="font-bold text-slate-400 text-sm mt-3">×</span>
                    <DigitCapsuleControl value={settings.multiplication.operand2Digits} onChange={(v) => setSettings(prev => ({ ...prev, multiplication: { ...prev.multiplication, operand2Digits: v } }))} label="ارقام عدد دوم" />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* DIVISION */}
          <div className={`rounded-3xl border transition-all overflow-hidden bg-white dark:bg-slate-900 ${selectedOps.includes('division') ? 'border-violet-300 dark:border-violet-800 shadow-sm' : 'border-slate-200 dark:border-slate-800 opacity-80'}`}>
            <div className="p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedOps.includes('division')}
                  onChange={() => handleToggleOperation('division')}
                  className="w-5 h-5 rounded-lg text-violet-500 accent-violet-500 focus:ring-violet-500 cursor-pointer"
                />
                <label className="font-black text-slate-800 dark:text-slate-100 flex items-center gap-2 text-sm cursor-pointer" onClick={() => handleToggleOperation('division')}>
                  <span>➗</span>
                  <span>تقسیم هوشمند</span>
                </label>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap justify-end">
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <button onClick={(e) => { e.stopPropagation(); setSettings(prev => ({ ...prev, division: { ...prev.division, mode: 'table' } })); setExpandedOps(prev => ({ ...prev, division: true })); if (!selectedOps.includes('division')) handleToggleOperation('division'); }} className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${settings.division.mode === 'table' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'}`}>
                    جدول تقسیم
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setSettings(prev => ({ ...prev, division: { ...prev.division, mode: 'free' } })); setExpandedOps(prev => ({ ...prev, division: true })); if (!selectedOps.includes('division')) handleToggleOperation('division'); }} className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${settings.division.mode === 'free' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'}`}>
                    تقسیم آزاد
                  </button>
                </div>
                <button onClick={() => handleToggleAccordion('division')} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
                  {expandedOps.division ? 'بستن' : 'تنظیمات'}
                </button>
              </div>
            </div>
            {expandedOps.division && selectedOps.includes('division') && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 space-y-4">
                {settings.division.mode === 'table' ? (
                  <div className="flex items-center justify-between bg-white dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-800 dark:text-slate-100 text-xs block">پایه جدول تقسیم</span>
                      <span className="text-[11px] text-slate-400">تولید مقسوم‌علیه بر مبنای جدول ضرب {toPersianDigits(settings.division.tableNumber)} (مانند {toPersianDigits(settings.division.tableNumber * 4)} ÷ {toPersianDigits(settings.division.tableNumber)} = ۴)</span>
                    </div>
                    <select
                      value={settings.division.tableNumber}
                      onChange={(e) => setSettings(prev => ({ ...prev, division: { ...prev.division, tableNumber: parseInt(e.target.value) } }))}
                      className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm font-bold rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-violet-500"
                    >
                      {MULTIPLICATION_TABLES.map(t => (
                        <option key={t} value={t}>جدول تقسیم {toPersianDigits(t)}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-4 bg-white dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <DigitCapsuleControl value={settings.division.dividendDigits} onChange={(v) => setSettings(prev => ({ ...prev, division: { ...prev.division, dividendDigits: v } }))} label="مقسوم" />
                    <span className="font-bold text-slate-400 text-sm mt-3">÷</span>
                    <DigitCapsuleControl value={settings.division.divisorDigits} onChange={(v) => setSettings(prev => ({ ...prev, division: { ...prev.division, divisorDigits: v } }))} label="مقسوم‌علیه" />
                  </div>
                )}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-200/50 dark:border-slate-800">
                  <input type="checkbox" checked={settings.division.allowRemainder} onChange={(e) => setSettings(prev => ({ ...prev, division: { ...prev.division, allowRemainder: e.target.checked } }))} id="allow-rem" className="w-4 h-4 rounded text-violet-500 focus:ring-violet-500 cursor-pointer" />
                  <label htmlFor="allow-rem" className="text-xs text-slate-600 dark:text-slate-400 cursor-pointer font-medium">اجازه تولید تقسیم‌های باقیمانده‌دار (غیر رند)</label>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Distribution Block */}
      {!isAdaptive && selectedOps.length > 1 && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-indigo-200 dark:border-indigo-900/60 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-2">
                <span>📊</span>
                <span>توزیع درصد سوالات</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">سهم هر عملیات در آزمون ترکیبی را مشخص کنید</p>
            </div>
            <button onClick={handleEqualSplit} type="button" className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 font-bold text-xs transition-colors">
              تقسیم مساوی ⚖️
            </button>
          </div>
          <div className="space-y-3 pt-1">
            {selectedOps.map((op) => {
              const opTitle = op === 'addition' ? 'جمع اعداد ➕' : op === 'subtraction' ? 'تفریق ➖' : op === 'multiplication' ? 'ضرب ✖️' : 'تقسیم ➗';
              const percent = distribution[op] || 0;
              const approxCount = Math.round((percent / 100) * questionCount);
              return (
                <div key={op} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">{opTitle}</span>
                    <span className="text-[11px] text-slate-400 block">تقریباً {toPersianDigits(approxCount)} سوال از {toPersianDigits(questionCount)}</span>
                  </div>
                  <PercentageCapsuleControl value={percent} onChange={(val) => handleDistributionChange(op, val)} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 pb-8">
        <button
          onClick={handleStartQuiz}
          disabled={selectedOps.length === 0}
          className="px-8 py-3 rounded-2xl bg-indigo-600 text-white font-black text-sm shadow-md hover:bg-indigo-500 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
        >
          <span>شروع چالش</span>
          <span>🚀</span>
        </button>
      </div>

    </div>
  );
};

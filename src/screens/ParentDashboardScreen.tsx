import React, { useState, useEffect } from 'react';
import { ScreenId, UserProfile, OperationType, TestPattern } from '../types';
import { SmartTeacherEngine } from '../adaptive/smartTeacherEngine';
import { AdaptiveLearningPlan } from '../adaptive/adaptiveTypes';
import { getTierDefinition } from '../adaptive/tierRegistry';
import { toPersianDigits } from '../utils/persian';
import { BackButton } from '../components/common/BackButton';

interface ParentDashboardScreenProps {
  profile: UserProfile;
  testPatterns?: TestPattern[];
  onNavigate: (screen: ScreenId) => void;
  onExitToChildMode: () => void;
  onOpenSetup: (config?: any) => void;
  onStartPattern?: (pattern: TestPattern) => void;
}

export const ParentDashboardScreen: React.FC<ParentDashboardScreenProps> = ({
  profile,
  testPatterns: _testPatterns,
  onNavigate,
  onExitToChildMode,
  onOpenSetup,
  onStartPattern: _onStartPattern,
}) => {
  const [learningPlan, setLearningPlan] = useState<AdaptiveLearningPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const plan = await SmartTeacherEngine.getLearningPlan();
        setLearningPlan(plan);
      } catch (e) {
        console.error('Failed to load learning plan in parent dashboard:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const opLabels: Record<OperationType, { nameFa: string; icon: string; color: string }> = {
    addition: { nameFa: 'جمع', icon: '+', color: 'from-emerald-500 to-teal-600' },
    subtraction: { nameFa: 'تفریق', icon: '−', color: 'from-blue-500 to-indigo-600' },
    multiplication: { nameFa: 'ضرب', icon: '×', color: 'from-violet-500 to-purple-600' },
    division: { nameFa: 'تقسیم', icon: '÷', color: 'from-amber-500 to-orange-600' },
    mixed: { nameFa: 'ترکیبی', icon: '⚡', color: 'from-rose-500 to-pink-600' },
  };

  const operations: OperationType[] = ['addition', 'subtraction', 'multiplication', 'division'];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:py-8 space-y-8 pb-28 select-none" dir="rtl">
      {/* Top Banner: Mode Indicator & Exit */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-indigo-700/40">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 text-xs font-black">
              <span>👨‍🏫</span>
              <span>حالت مدیریت والد و مربی فعال است</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight">
              میز کار والدین و مربیان — {profile.name}
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200 max-w-2xl leading-relaxed">
              کنترل کامل تنظیمات آموزشی، طراحی الگوهای تستی مدرسه، تنظیم دستی ارقام و بررسی دقیق تسلط مهارتی کودک.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
            <button
              id="exit-to-child-mode-btn"
              onClick={onExitToChildMode}
              className="flex items-center gap-2.5 px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg hover:shadow-emerald-500/30 transition-all active:scale-95 cursor-pointer"
            >
              <span>👦</span>
              <span>بازگشت به حالت کودک</span>
            </button>
            <BackButton onClick={onExitToChildMode} variant="whiteGlass" title="بازگشت به کودک" />
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute -top-16 -left-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Primary Actions Grid (Adult Tools) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>🛠️</span>
            <span>ابزارهای پیشرفته مدیریت آموزش</span>
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            برای آزمون‌های کلاسی و تکالیف هدفمند
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Quiz Setup */}
          <div
            id="parent-card-quiz-setup"
            onClick={onOpenSetup}
            className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-indigo-400 dark:hover:border-indigo-600 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl font-black group-hover:scale-110 transition-transform">
                ⚙️
              </div>
              <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">
                تنظیم دستی آزمون
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                تنظیم آزاد تعداد ارقام، جداول ضرب دلخواه، باقیمانده تقسیم و تعداد سؤالات.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-black text-indigo-600 dark:text-indigo-400">
              <span>ورود به تنظیمات آزمون</span>
              <span className="group-hover:-translate-x-1 transition-transform">←</span>
            </div>
          </div>

          {/* Card 2: Presets & Test Patterns */}
          <div
            id="parent-card-presets"
            onClick={() => onNavigate('presets')}
            className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-blue-400 dark:hover:border-blue-600 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl font-black group-hover:scale-110 transition-transform">
                📋
              </div>
              <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">
                الگوهای آزمون
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                طراحی، ذخیره و اجرای الگوهای اختصاصی برای امتحانات دوره‌ای مدرسه.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-black text-blue-600 dark:text-blue-400">
              <span>مشاهده و ویرایش الگوها</span>
              <span className="group-hover:-translate-x-1 transition-transform">←</span>
            </div>
          </div>

          {/* Card 3: Detailed Progress */}
          <div
            id="parent-card-progress"
            onClick={() => onNavigate('progress')}
            className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-emerald-400 dark:hover:border-emerald-600 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl font-black group-hover:scale-110 transition-transform">
                📊
              </div>
              <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">
                کارنامه تحلیلی
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                آمار جامع دقت، سرعت حل مسئله، تاریخچه آزمون‌ها و مقایسه عملکرد.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-black text-emerald-600 dark:text-emerald-400">
              <span>گزارش کامل پیشرفت</span>
              <span className="group-hover:-translate-x-1 transition-transform">←</span>
            </div>
          </div>

          {/* Card 4: Settings & Backup */}
          <div
            id="parent-card-settings"
            onClick={() => onNavigate('settings')}
            className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-amber-400 dark:hover:border-amber-600 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl font-black group-hover:scale-110 transition-transform">
                💾
              </div>
              <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">
                پشتیبان‌گیری و تنظیمات
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                خروجی گرفتن از کارنامه (CSV/JSON)، ذخیره نسخه پشتیبان و بازنشانی داده‌ها.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-black text-amber-600 dark:text-amber-400">
              <span>مدیریت داده‌ها و سیستم</span>
              <span className="group-hover:-translate-x-1 transition-transform">←</span>
            </div>
          </div>
        </div>
      </div>

      {/* Safety Notice for Parents */}
      <div className="bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-4 flex items-start gap-3.5">
        <span className="text-xl shrink-0">🛡️</span>
        <div className="space-y-1 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
          <span className="font-black block">حفاظت از ارزیابی آموزشی کودک:</span>
          <p>
            آزمون‌های دستی والدین و الگوهای امتحانی به عنوان «آزمون سفارشی والد» ذخیره می‌شوند و مهارت‌ها یا مراحل آموزشی کودک را به شکل کاذب باز یا تغییر نمی‌دهند. با بازگشت به «حالت کودک»، سیستم هوشمند تدریس بر اساس تسلط واقعی کودک به آموزش بازمی‌گردد.
          </p>
        </div>
      </div>

      {/* Skill Progression Matrix (Detailed Tiers) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>🎯</span>
            <span>ماتریس تسلط بر مهارت‌های ریاضی (پایه تا پیشرفته)</span>
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            بر اساس چهار مرحله آموزشی استاندارد
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">در حال بارگذاری اطلاعات مهارتی...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {operations.map((op) => {
              const opMeta = opLabels[op];
              const profileOp = learningPlan?.operations[op];
              const currentTier = profileOp?.currentTier || 1;

              return (
                <div
                  key={op}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-xs"
                >
                  {/* Operation Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${opMeta.color} text-white flex items-center justify-center text-xl font-black shadow-xs`}
                      >
                        {opMeta.icon}
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">
                          عملیات {opMeta.nameFa}
                        </h3>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          مرحله فعال: مرحله {toPersianDigits(currentTier)} از ۴
                        </span>
                      </div>
                    </div>

                    <div className="text-left">
                      <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                        {profileOp?.highestMasteredTier
                          ? `تسلط کامل: مرحله ${toPersianDigits(profileOp.highestMasteredTier)}`
                          : 'در حال شروع یادگیری'}
                      </span>
                    </div>
                  </div>

                  {/* 4 Tiers List */}
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((tierNum) => {
                      const tierDef = getTierDefinition(op, tierNum);
                      const tierEvidence = profileOp?.tiers[tierNum];
                      const state = tierEvidence?.state || (tierNum === 1 ? 'learning' : 'locked');
                      const accuracy = tierEvidence?.allTimeAccuracy || 0;
                      const sessions = tierEvidence?.sessionsCount || 0;

                      return (
                        <div
                          key={tierNum}
                          className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs transition-colors ${
                            state === 'mastered'
                              ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                              : state === 'learning'
                              ? 'bg-indigo-50/60 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800/60'
                              : state === 'unlocked'
                              ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/50'
                              : 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800 opacity-60'
                          }`}
                        >
                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-1.5 font-black text-slate-800 dark:text-slate-200">
                              <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center text-[10px] shrink-0 font-mono">
                                {toPersianDigits(tierNum)}
                              </span>
                              <span className="truncate">{tierDef.stageNameFa}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate pr-6">
                              {tierDef.pedagogicalGoalFa}
                            </p>
                          </div>

                          <div className="shrink-0 flex items-center gap-2">
                            {state === 'mastered' && (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 font-bold text-[10px] flex items-center gap-1">
                                <span>✓</span>
                                <span>مسلط</span>
                              </span>
                            )}
                            {state === 'learning' && (
                              <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 font-bold text-[10px]">
                                در حال تمرین
                              </span>
                            )}
                            {state === 'unlocked' && (
                              <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 font-bold text-[10px]">
                                باز شده
                              </span>
                            )}
                            {state === 'locked' && (
                              <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 font-bold text-[10px]">
                                قفل
                              </span>
                            )}

                            {sessions > 0 && (
                              <span className="text-[10px] font-mono text-slate-400">
                                {toPersianDigits(accuracy)}٪
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Adaptive Learning Plan Insights for Parents */}
      {learningPlan && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-xs">
          <h2 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>💡</span>
            <span>بینش و برنامه آموزشی معلم هوشمند</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 space-y-1">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block">
                تمرکز فعلی آموزش:
              </span>
              <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                {opLabels[learningPlan.primaryOperation]?.nameFa || 'عملیات فعال'}
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 space-y-1">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block">
                نقطه عطف و هدف آموزشی بعدی:
              </span>
              <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                {learningPlan.nextMilestoneFa || 'تسلط بر گام‌های پایه'}
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 space-y-1">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block">
                عملیات نیازمند توازن و تمرین بیشتر:
              </span>
              <span className="text-sm font-black text-amber-600 dark:text-amber-400">
                {learningPlan.neglectedOperations && learningPlan.neglectedOperations.length > 0
                  ? learningPlan.neglectedOperations.map((op) => opLabels[op]?.nameFa).join('، ')
                  : 'همه عملیات‌ها متوازن هستند 🌟'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

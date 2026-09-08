import React from 'react';
import { LEVEL_DEFINITIONS } from '../../gamification/levelCalculator';
import { StageIcon } from '../common/StageIcon';
import { formatNumber } from '../../utils/persian';

interface StagesRoadmapModalProps {
  currentLevel: number;
  isOpen: boolean;
  onClose: () => void;
}

export const StagesRoadmapModal: React.FC<StagesRoadmapModalProps> = ({
  currentLevel,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="stages-roadmap-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-fadeIn"
      dir="rtl"
      onClick={onClose}
    >
      <div
        id="stages-roadmap-modal-dialog"
        className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-50/50 via-white to-amber-50/30 dark:from-slate-850 dark:via-slate-900 dark:to-slate-850">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
              <StageIcon level={currentLevel} size="md" className="w-9 h-9" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100">
                  مسیر ۲۰ سطح قهرمانی ریاضی
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-xs font-black">
                  سطح شما: {formatNumber(currentLevel, 'persian')}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                با تمرین روزانه و اثبات تسلط در محاسبات، آیکون‌های درخشان هر ۲۰ سطح را فتح کن!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 flex items-center justify-center font-bold text-lg transition-colors cursor-pointer shrink-0"
            title="بستن"
          >
            ✕
          </button>
        </div>

        {/* Modal Body: 20 Stages Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {LEVEL_DEFINITIONS.map((def) => {
              const isCurrent = def.level === currentLevel;
              const isUnlocked = def.level <= currentLevel;
              const isUpcoming = def.level === currentLevel + 1;

              return (
                <div
                  key={def.level}
                  className={`relative rounded-2xl p-4 border transition-all duration-200 flex flex-col items-center text-center ${
                    isCurrent
                      ? 'bg-gradient-to-b from-indigo-50/80 via-white to-amber-50/60 dark:from-indigo-950/50 dark:via-slate-900 dark:to-amber-950/30 border-2 border-indigo-500 dark:border-indigo-400 shadow-lg scale-[1.02]'
                      : isUnlocked
                      ? 'bg-white dark:bg-slate-850/60 border-emerald-200 dark:border-emerald-900/60 hover:shadow-md'
                      : isUpcoming
                      ? 'bg-slate-50 dark:bg-slate-850/40 border-amber-200/80 dark:border-amber-900/40 opacity-85'
                      : 'bg-slate-50/60 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800/80 opacity-60'
                  }`}
                >
                  {/* Status Ribbon */}
                  <div className="absolute top-2 left-2">
                    {isCurrent ? (
                      <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-black shadow-sm">
                        فعلی
                      </span>
                    ) : isUnlocked ? (
                      <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-xs font-black flex items-center justify-center shadow-sm">
                        ✓
                      </span>
                    ) : (
                      <span className="text-xs opacity-70">🔒</span>
                    )}
                  </div>

                  {/* Level Number */}
                  <span className="text-[11px] font-extrabold text-slate-400 mb-1">
                    سطح {formatNumber(def.level, 'persian')}
                  </span>

                  {/* Stage Webp Icon */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center my-1">
                    <StageIcon
                      level={def.level}
                      size="xl"
                      className={`w-full h-full transition-transform duration-300 ${
                        isCurrent
                          ? 'scale-110 drop-shadow-md'
                          : isUnlocked
                          ? 'hover:scale-105 drop-shadow-sm'
                          : 'grayscale opacity-50'
                      }`}
                    />
                  </div>

                  {/* Level Title */}
                  <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 mt-1 line-clamp-1">
                    {def.title}
                  </h4>

                  {/* XP Threshold */}
                  <p className="text-[11px] font-extrabold text-amber-600 dark:text-amber-400 mt-1">
                    {def.xpThreshold === 0 ? 'سطح آغازین' : `${formatNumber(def.xpThreshold, 'persian')} XP`}
                  </p>

                  {/* Educational Requirement Description */}
                  {def.educationalRequirement && (
                    <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-tight">
                      {def.educationalRequirement.descriptionFa}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between text-xs font-bold text-slate-500">
          <span>شامل ۲۰ نشان متمایز و نفیس برای هر سطح از ۱ تا ۲۰</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black shadow transition-colors cursor-pointer"
          >
            متوجه شدم!
          </button>
        </div>
      </div>
    </div>
  );
};

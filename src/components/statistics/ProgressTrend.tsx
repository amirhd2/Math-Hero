/**
 * ProgressTrend component for Math Hero Statistics.
 * Visual interactive progress chart showing accuracy trends across 7 Days, 30 Days, or All Time.
 */

import React, { useState } from 'react';
import { DailyTrendPoint, TimeRange } from '../../statistics/statisticsTypes';
import { formatNumber } from '../../utils/persian';

interface ProgressTrendProps {
  trendPoints: DailyTrendPoint[];
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
}

export const ProgressTrend: React.FC<ProgressTrendProps> = ({
  trendPoints,
  timeRange,
  onTimeRangeChange,
}) => {
  const [activePointIndex, setActivePointIndex] = useState<number | null>(null);

  const hasData = trendPoints.length > 0;

  // Chart dimensions & calculations
  const chartHeight = 180;
  const paddingX = 36;
  const paddingTop = 24;
  const paddingBottom = 32;
  const effectiveHeight = chartHeight - paddingTop - paddingBottom;

  // Calculate SVG line points
  const pointsCount = trendPoints.length;
  const stepX = pointsCount > 1 ? (100 - (paddingX * 2) / 6) / (pointsCount - 1) : 50;

  const svgPoints = trendPoints.map((pt, idx) => {
    const x = pointsCount === 1 ? 50 : (idx / (pointsCount - 1)) * 100;
    // y: 100% accuracy maps to top, 0% maps to bottom
    const y = paddingTop + (1 - pt.accuracyPercent / 100) * effectiveHeight;
    return { x, y, pt, idx };
  });

  const pathD =
    svgPoints.length > 1
      ? svgPoints.reduce((acc, p, i) => {
          return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
        }, '')
      : '';

  const areaD =
    svgPoints.length > 1
      ? `${pathD} L ${svgPoints[svgPoints.length - 1].x} ${chartHeight - paddingBottom} L ${
          svgPoints[0].x
        } ${chartHeight - paddingBottom} Z`
      : '';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
      {/* Header with Title and Segmented Capsule Control */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span>📈</span>
            <span>روند پیشرفت دقت و یادگیری</span>
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            تغییرات درصد موفقیت در طول زمان
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 text-xs font-black">
          <button
            type="button"
            onClick={() => onTimeRangeChange('7days')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              timeRange === '7days'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            ۷ روز اخیر
          </button>

          <button
            type="button"
            onClick={() => onTimeRangeChange('30days')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              timeRange === '30days'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            ۳۰ روز اخیر
          </button>

          <button
            type="button"
            onClick={() => onTimeRangeChange('all')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              timeRange === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            کل زمان‌ها
          </button>
        </div>
      </div>

      {/* Visual Chart Area */}
      {!hasData ? (
        <div className="h-44 flex flex-col items-center justify-center text-center p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <span className="text-2xl mb-1">🌱</span>
          <p className="text-xs font-bold text-slate-500">
            در این بازه زمانی هنوز آزمونی انجام نشده است.
          </p>
        </div>
      ) : (
        <div className="relative pt-2">
          {/* Active tooltip when hovering or tapping a point */}
          {activePointIndex !== null && trendPoints[activePointIndex] && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg pointer-events-none flex items-center gap-2 animate-fade-in">
              <span>📅 {trendPoints[activePointIndex].labelFa}</span>
              <span>•</span>
              <span className="text-amber-400 dark:text-amber-600">
                دقت: {formatNumber(trendPoints[activePointIndex].accuracyPercent, 'persian')}٪
              </span>
              <span>•</span>
              <span>{formatNumber(trendPoints[activePointIndex].totalQuestions, 'persian')} سوال</span>
            </div>
          )}

          {/* SVG Line / Area Graph */}
          <div className="w-full h-44 relative select-none">
            <svg
              viewBox={`0 0 100 ${chartHeight}`}
              preserveAspectRatio="none"
              className="w-full h-full overflow-visible"
            >
              <defs>
                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid guide lines (100%, 75%, 50%, 25%) */}
              {[100, 75, 50, 25].map((level) => {
                const y = paddingTop + (1 - level / 100) * effectiveHeight;
                return (
                  <g key={level}>
                    <line
                      x1="0"
                      y1={y}
                      x2="100"
                      y2={y}
                      stroke="currentColor"
                      strokeDasharray="2,2"
                      className="text-slate-100 dark:text-slate-800"
                      strokeWidth="0.5"
                    />
                  </g>
                );
              })}

              {/* Filled Area */}
              {areaD && (
                <path d={areaD} fill="url(#trendGradient)" className="transition-all duration-500" />
              )}

              {/* Line path */}
              {pathD && (
                <path
                  d={pathD}
                  fill="none"
                  stroke="#4f46e5"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-all duration-500"
                />
              )}

              {/* Data points */}
              {svgPoints.map((p) => {
                const isActive = activePointIndex === p.idx;
                return (
                  <g
                    key={p.idx}
                    className="cursor-pointer"
                    onMouseEnter={() => setActivePointIndex(p.idx)}
                    onMouseLeave={() => setActivePointIndex(null)}
                    onClick={() =>
                      setActivePointIndex((prev) => (prev === p.idx ? null : p.idx))
                    }
                  >
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isActive ? 4.5 : 3}
                      className="fill-indigo-600 dark:fill-indigo-400 stroke-white dark:stroke-slate-900 transition-all"
                      strokeWidth="1.5"
                    />
                  </g>
                );
              })}
            </svg>
          </div>

          {/* X Axis Labels */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold px-1 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>{trendPoints[0]?.labelFa || 'آغاز'}</span>
            {trendPoints.length > 2 && (
              <span>{trendPoints[Math.floor(trendPoints.length / 2)]?.labelFa}</span>
            )}
            <span>{trendPoints[trendPoints.length - 1]?.labelFa || 'امروز'}</span>
          </div>
        </div>
      )}
    </div>
  );
};

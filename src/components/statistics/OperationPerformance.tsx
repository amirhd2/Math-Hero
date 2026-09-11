/**
 * OperationPerformance component for Math Hero Statistics.
 * Grids the 4 fundamental operations (Addition, Subtraction, Multiplication, Division).
 */

import React from 'react';
import { OperationStatistics } from '../../statistics/statisticsTypes';
import { OperationStatCard } from './OperationStatCard';

interface OperationPerformanceProps {
  operations: OperationStatistics[];
  onPractice: (operation: OperationStatistics['operation']) => void;
}

export const OperationPerformance: React.FC<OperationPerformanceProps> = ({
  operations,
  onPractice,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <span>🧮</span>
          <span>عملکرد در چهار عمل اصلی</span>
        </h3>
        <span className="text-xs text-slate-500 font-bold">تسلط بر مباحث</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
        {operations.map((stat) => (
          <OperationStatCard key={stat.operation} stat={stat} onPractice={onPractice} />
        ))}
      </div>
    </div>
  );
};

/**
 * PerformanceInsight component for Math Hero Statistics.
 * Replaced the static 3-card layout with the unified Smart Teacher Card Stack
 * (TeacherRecommendationCard) so any improvements to the smart teacher module
 * are identical across both Home and Progress/Statistics screens.
 */

import React from 'react';
import { OperationType } from '../../types';
import { PerformanceInsights } from '../../statistics/statisticsTypes';
import { AdaptiveLearningPlan } from '../../adaptive/adaptiveTypes';
import { TeacherRecommendationCard } from '../adaptive/TeacherRecommendationCard';

export interface PerformanceInsightProps {
  insights: PerformanceInsights;
  onPractice: (operation: OperationType) => void;
  plan?: AdaptiveLearningPlan | null;
  appMode?: 'child' | 'parent';
  className?: string;
}

export const PerformanceInsight: React.FC<PerformanceInsightProps> = ({
  insights,
  onPractice,
  plan,
  appMode = 'child',
  className = '',
}) => {
  return (
    <div className={`w-full ${className}`}>
      <TeacherRecommendationCard
        plan={plan}
        insights={insights}
        onStartRecommended={onPractice}
        appMode={appMode}
      />
    </div>
  );
};

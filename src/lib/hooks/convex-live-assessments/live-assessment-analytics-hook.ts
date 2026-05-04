// useLiveAssessmentAnalyticsService.ts
import { useConvex } from 'convex/react';
import { useMemo } from 'react';
import { LiveAssessmentAnalyticsService } from '@/lib/services/live-assessment-analytics.service';

export const useLiveAssessmentAnalyticsService = () => {
  const convex = useConvex();
  return useMemo(() => new LiveAssessmentAnalyticsService(convex), [convex]);
};

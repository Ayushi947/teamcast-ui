/**
 * Utility function to parse additionalFeatures from different formats
 * Supports:
 * 1. JSON string with boolean properties: "{\"feature1\":true,\"feature2\":false}"
 * 2. Object with features array: {"features": ["feature1", "feature2"]}
 * 3. Direct array: ["feature1", "feature2"]
 */

import { logger } from '../logger';

export const parseAdditionalFeatures = (additionalFeatures: any): string[] => {
  if (!additionalFeatures) return [];

  // If it's already an array, return it
  if (Array.isArray(additionalFeatures)) {
    return additionalFeatures;
  }

  // If it's an object with features array
  if (typeof additionalFeatures === 'object' && additionalFeatures.features) {
    return additionalFeatures.features;
  }

  // If it's a JSON string, try to parse it
  if (typeof additionalFeatures === 'string') {
    try {
      const parsed = JSON.parse(additionalFeatures);

      // If the parsed object has a features array, use it
      if (parsed.features && Array.isArray(parsed.features)) {
        return parsed.features;
      }

      // If it's an object with boolean properties, convert them to feature strings
      if (typeof parsed === 'object') {
        const features: string[] = [];

        // Map boolean properties to feature descriptions
        const featureMappings: Record<string, string> = {
          advancedAIMatchingWithCustomCriteria:
            'Advanced AI matching with custom criteria',
          prioritySupportViaEmailAndLiveChat:
            'Priority support via email and live chat',
          comprehensiveAnalytics: 'Comprehensive analytics',
          smartInterviewSchedulingWithCalendarSync:
            'Smart interview scheduling with calendar sync',
          seamlessATSAndJobBoardConnections:
            'Seamless ATS and job board connections',
          includesAIRecommendations: 'AI-powered recommendations',
          customBranding: 'Custom branding',
          unlimitedJobPostings: 'Unlimited job postings',
          unlimitedCandidateViews: 'Unlimited candidate views',
          unlimitedAiAssessments: 'Unlimited AI assessments',
          unlimitedSeats: 'Unlimited seats',
          prioritySupport: 'Priority support',
          dedicatedAccountManager: 'Dedicated account manager',
          whiteLabelSolution: 'White label solution',
          apiAccess: 'API access',
          customIntegrations: 'Custom integrations',
          advancedReporting: 'Advanced reporting',
          bulkOperations: 'Bulk operations',
          // Add more mappings as needed
        };

        Object.entries(parsed).forEach(([key, value]) => {
          if (value === true && featureMappings[key]) {
            features.push(featureMappings[key]);
          }
        });

        return features;
      }
    } catch (error) {
      logger.error('Failed to parse additionalFeatures:', error);
    }
  }

  return [];
};

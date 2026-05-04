import {
  JobAiAssessmentStatusEnum,
  OnboardingAssessmentStatusEnum,
} from '@/lib/shared';
import { api } from '../../../convex/_generated/api';
import { logger } from '@/lib/logger';
import { ConvexReactClient } from 'convex/react';

export class LiveAssessmentAnalyticsService {
  constructor(private convex: ConvexReactClient) {}

  async upsertAnalytics(
    assessmentId: string,
    candidateId: string,
    duration: number,
    status: OnboardingAssessmentStatusEnum | JobAiAssessmentStatusEnum,
    result: string,
    assessmentType: 'ONBOARDING_ASSESSMENT' | 'JOB_AI_ASSESSMENT',
    userId: string,
    userType: 'candidate' | 'client' | 'partner' | 'support'
  ) {
    try {
      logger.debug('Upserting live assessment analytics', {
        assessmentId,
        candidateId,
        duration,
        status,
        assessmentType,
        userId,
        userType,
      });
      return await this.convex.mutation(
        api.services.live_assessments.live_assessment_analytics
          .upsertLiveAssessmentAnalytics,
        {
          assessmentId,
          candidateId,
          duration,
          status,
          result,
          assessmentType,
          userId,
          userType,
        }
      );
    } catch (error) {
      logger.error('Error upserting live assessment analytics:', error);
      throw error;
    }
  }

  async getAnalytics(candidateId: string) {
    try {
      logger.debug('Getting live assessment analytics', { candidateId });
      return await this.convex.query(
        api.services.live_assessments.live_assessment_analytics
          .getLiveAssessmentAnalytics,
        {
          candidateId,
        }
      );
    } catch (error) {
      logger.error('Error getting live assessment analytics:', error);
      throw error;
    }
  }

  async getCandidateAnalytics(candidateId: string) {
    try {
      logger.debug('Getting candidate live assessment analytics', {
        candidateId,
      });
      return await this.convex.query(
        api.services.live_assessments.live_assessment_analytics
          .getCandidateLiveAssessmentAnalytics,
        {
          candidateId,
        }
      );
    } catch (error) {
      logger.error('Error getting candidate live assessment analytics:', error);
      throw error;
    }
  }

  async getAllAnalytics(
    limit?: number,
    status?: string,
    result?: string,
    assessmentType?: string
  ) {
    try {
      logger.debug('Getting all live assessment analytics', {
        limit,
        status,
        result,
        assessmentType,
      });
      return await this.convex.query(
        api.services.live_assessments.live_assessment_analytics
          .getAllLiveAnalytics,
        {
          limit,
          status,
          result,
          assessmentType,
        }
      );
    } catch (error) {
      logger.error('Error getting all live assessment analytics:', error);
      throw error;
    }
  }

  async updateDuration(
    candidateId: string,
    duration: number,
    status: OnboardingAssessmentStatusEnum
  ) {
    try {
      logger.debug('Updating assessment duration', {
        candidateId,
        duration,
        status,
      });
      return await this.convex.mutation(
        api.services.live_assessments.live_assessment_analytics
          .updateAssessmentDuration,
        {
          candidateId,
          duration,
          status,
        }
      );
    } catch (error) {
      logger.error('Error updating assessment duration:', error);
      throw error;
    }
  }
}

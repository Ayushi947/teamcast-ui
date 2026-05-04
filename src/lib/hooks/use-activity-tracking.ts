'use client';

import { useCallback } from 'react';
import { activityLogService } from '../services/services';
import { toast } from 'sonner';
import { logger } from '../logger';
import {
  ActivityEntityTypeEnum,
  ActivityModuleEnum,
  IActivityLogCreate,
} from '@/lib/shared';
import { ActivityActionEnums } from '../models/activity';

/**
 * Type for metadata changes
 */
export interface ActivityChange {
  field: string;
  oldValue?: any;
  newValue?: any;
}

/**
 * Hook for tracking user activities
 */
export const useActivityTracking = () => {
  /**
   * Track a user activity
   */
  const trackActivity = useCallback(
    async (activityData: IActivityLogCreate): Promise<void> => {
      try {
        await activityLogService.createActivityLog(activityData);
        logger.debug('Activity tracked:', activityData);
      } catch (error) {
        logger.error('Failed to track activity:', error);
        // Silent fail - don't show toast to user for tracking failures
      }
    },
    []
  );

  /**
   * Track activity with notification
   * This will show a toast notification to the user
   */
  const trackActivityWithNotification = useCallback(
    async (
      activityData: IActivityLogCreate,
      notificationMessage: string
    ): Promise<void> => {
      try {
        await activityLogService.createActivityLog(activityData);
        toast.success(notificationMessage);
        logger.debug('Activity tracked with notification:', activityData);
      } catch (error) {
        logger.error('Failed to track activity:', error);
        // Don't show error toast for tracking failures
      }
    },
    []
  );

  /**
   * Track auth activity (login, logout, etc.)
   */
  const trackAuthActivity = useCallback(
    async (
      action: string,
      userId: string,
      description: string,
      metadata?: any
    ): Promise<void> => {
      await trackActivity({
        module: ActivityModuleEnum.AUTH,
        action,
        entityId: userId,
        entityType: ActivityEntityTypeEnum.USER,
        description,
        metadata,
      });
    },
    [trackActivity]
  );

  /**
   * Track client activity
   */
  const trackClientActivity = useCallback(
    async (
      action: string,
      clientId: string,
      description: string,
      changes?: ActivityChange[]
    ): Promise<void> => {
      await trackActivity({
        module: ActivityModuleEnum.CLIENT,
        action,
        entityId: clientId,
        entityType: ActivityEntityTypeEnum.CLIENT,
        description,
        metadata: changes ? { changes } : undefined,
      });
    },
    [trackActivity]
  );

  /**
   * Track candidate activity
   */
  const trackCandidateActivity = useCallback(
    async (
      action: string,
      candidateId: string,
      description: string,
      changes?: ActivityChange[]
    ): Promise<void> => {
      await trackActivity({
        module: ActivityModuleEnum.CANDIDATE,
        action,
        entityId: candidateId,
        entityType: ActivityEntityTypeEnum.CANDIDATE,
        description,
        metadata: changes ? { changes } : undefined,
      });
    },
    [trackActivity]
  );

  /**
   * Track job activity
   */
  const trackJobActivity = useCallback(
    async (
      _action: string,
      jobId: string,
      description: string,
      changes?: ActivityChange[]
    ): Promise<void> => {
      await trackActivity({
        module: ActivityModuleEnum.JOB,
        action: ActivityActionEnums.APPLY,
        entityId: jobId,
        entityType: ActivityEntityTypeEnum.JOB_POSTING,
        description,
        metadata: changes ? { changes } : undefined,
      });
    },
    [trackActivity]
  );

  /**
   * Track partner activity
   */
  const trackPartnerActivity = useCallback(
    async (
      action: string,
      partnerId: string,
      description: string,
      changes?: ActivityChange[]
    ): Promise<void> => {
      await trackActivity({
        module: ActivityModuleEnum.PARTNER,
        action,
        entityId: partnerId,
        entityType: ActivityEntityTypeEnum.PARTNER,
        description,
        metadata: changes ? { changes } : undefined,
      });
    },
    [trackActivity]
  );

  return {
    trackActivity,
    trackActivityWithNotification,
    trackAuthActivity,
    trackClientActivity,
    trackCandidateActivity,
    trackJobActivity,
    trackPartnerActivity,
  };
};

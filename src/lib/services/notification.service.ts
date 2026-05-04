import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import {
  NotificationUserType,
  NotificationType,
  NotificationPriority,
  CreateNotificationArgs,
} from '../../../convex/notifications';

export interface Notification {
  _id: Id<'notifications'>;
  userId: string;
  userType: NotificationUserType;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  isRead: boolean;
  isArchived: boolean;
  actionUrl?: string;
  actionText?: string;
  metadata?: {
    entityId?: string;
    entityType?: string;
    category?: string;
    tags?: string[];
  };
  createdAt: number;
  updatedAt: number;
  expiresAt?: number;
}

// Custom hooks for notification operations
export const useNotifications = (
  userId: string,
  userType?: NotificationUserType,
  options?: {
    limit?: number;
    includeRead?: boolean;
    includeArchived?: boolean;
  }
) => {
  return useQuery(api.notifications.getUserNotifications, {
    userId,
    userType,
    limit: options?.limit,
    includeRead: options?.includeRead,
    includeArchived: options?.includeArchived,
  });
};

export const useUnreadCount = (
  userId: string,
  userType?: NotificationUserType
) => {
  return useQuery(api.notifications.getUnreadCount, {
    userId,
    userType,
  });
};

export const useCreateNotification = () => {
  return useMutation(api.notifications.createNotification);
};

export const useMarkAsRead = () => {
  return useMutation(api.notifications.markAsRead);
};

export const useMarkAllAsRead = () => {
  return useMutation(api.notifications.markAllAsRead);
};

export const useArchiveNotification = () => {
  return useMutation(api.notifications.archiveNotification);
};

export const useDeleteNotification = () => {
  return useMutation(api.notifications.deleteNotification);
};

export const useBulkDeleteNotifications = () => {
  return useMutation(api.notifications.bulkDeleteNotifications);
};

export const useUpdateNotification = () => {
  return useMutation(api.notifications.updateNotification);
};

// Utility functions for creating common notification types
export const createNotificationHelpers = (createNotification: any) => ({
  // Interview notifications
  interviewScheduled: (
    userId: string,
    userType: NotificationUserType,
    interviewDetails: any
  ) =>
    createNotification({
      userId,
      userType,
      title: 'Interview Scheduled',
      message: `Your interview for ${interviewDetails.jobTitle} has been scheduled for ${interviewDetails.date}`,
      type: 'interview' as NotificationType,
      priority: 'high' as NotificationPriority,
      actionUrl: `/app/${userType}/interviews/${interviewDetails.id}`,
      actionText: 'View Interview',
      metadata: {
        entityId: interviewDetails.id,
        entityType: 'interview',
        category: 'scheduling',
      },
    }),

  interviewReminder: (
    userId: string,
    userType: NotificationUserType,
    interviewDetails: any
  ) =>
    createNotification({
      userId,
      userType,
      title: 'Interview Reminder',
      message: `Your interview for ${interviewDetails.jobTitle} is starting in ${interviewDetails.timeUntil}`,
      type: 'interview' as NotificationType,
      priority: 'urgent' as NotificationPriority,
      actionUrl: `/app/${userType}/interviews/${interviewDetails.id}`,
      actionText: 'Join Interview',
      metadata: {
        entityId: interviewDetails.id,
        entityType: 'interview',
        category: 'reminder',
      },
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // Expire in 24 hours
    }),

  // Application notifications
  applicationSubmitted: (
    userId: string,
    userType: NotificationUserType,
    applicationDetails: any
  ) =>
    createNotification({
      userId,
      userType,
      title: 'Application Submitted',
      message: `Your application for ${applicationDetails.jobTitle} has been submitted successfully`,
      type: 'application' as NotificationType,
      priority: 'medium' as NotificationPriority,
      actionUrl: `/app/${userType}/applications/${applicationDetails.id}`,
      actionText: 'View Application',
      metadata: {
        entityId: applicationDetails.id,
        entityType: 'application',
        category: 'submission',
      },
    }),

  applicationStatusUpdate: (
    userId: string,
    userType: NotificationUserType,
    applicationDetails: any
  ) =>
    createNotification({
      userId,
      userType,
      title: 'Application Status Update',
      message: `Your application for ${applicationDetails.jobTitle} status has been updated to ${applicationDetails.status}`,
      type: 'application' as NotificationType,
      priority: 'high' as NotificationPriority,
      actionUrl: `/app/${userType}/applications/${applicationDetails.id}`,
      actionText: 'View Details',
      metadata: {
        entityId: applicationDetails.id,
        entityType: 'application',
        category: 'status_update',
      },
    }),

  // Assessment notifications
  assessmentInvitation: (
    userId: string,
    userType: NotificationUserType,
    assessmentDetails: any
  ) =>
    createNotification({
      userId,
      userType,
      title: 'Assessment Invitation',
      message: `You've been invited to take an assessment for ${assessmentDetails.jobTitle}`,
      type: 'assessment' as NotificationType,
      priority: 'high' as NotificationPriority,
      actionUrl: `/app/${userType}/assessments/${assessmentDetails.id}`,
      actionText: 'Start Assessment',
      metadata: {
        entityId: assessmentDetails.id,
        entityType: 'assessment',
        category: 'invitation',
      },
    }),

  assessmentCompleted: (
    userId: string,
    userType: NotificationUserType,
    assessmentDetails: any
  ) =>
    createNotification({
      userId,
      userType,
      title: 'Assessment Completed',
      message: `You have successfully completed the assessment for ${assessmentDetails.jobTitle}`,
      type: 'assessment' as NotificationType,
      priority: 'medium' as NotificationPriority,
      actionUrl: `/app/${userType}/assessments/${assessmentDetails.id}/results`,
      actionText: 'View Results',
      metadata: {
        entityId: assessmentDetails.id,
        entityType: 'assessment',
        category: 'completion',
      },
    }),

  // Profile notifications
  profileIncomplete: (
    userId: string,
    userType: NotificationUserType,
    completionPercentage: number
  ) =>
    createNotification({
      userId,
      userType,
      title: 'Complete Your Profile',
      message: `Your profile is ${completionPercentage}% complete. Add more details to improve your visibility`,
      type: 'profile' as NotificationType,
      priority: 'medium' as NotificationPriority,
      actionUrl: `/app/${userType}/profile`,
      actionText: 'Complete Profile',
      metadata: {
        entityType: 'profile',
        category: 'completion',
        tags: ['profile', 'incomplete'],
      },
    }),

  profileApproved: (userId: string, userType: NotificationUserType) =>
    createNotification({
      userId,
      userType,
      title: 'Profile Approved',
      message:
        'Congratulations! Your profile has been approved and is now live',
      type: 'success' as NotificationType,
      priority: 'high' as NotificationPriority,
      actionUrl: `/app/${userType}/profile`,
      actionText: 'View Profile',
      metadata: {
        entityType: 'profile',
        category: 'approval',
      },
    }),

  profileUpdate: (
    userId: string,
    userType: NotificationUserType,
    updateDetails: any
  ) =>
    createNotification({
      userId,
      userType,
      title: 'Profile Updated',
      message: `${updateDetails.action} in ${updateDetails.section}`,
      type: 'profile' as NotificationType,
      priority: 'low' as NotificationPriority,
      actionUrl: `/app/${userType}/profile`,
      actionText: 'View Profile',
      metadata: {
        entityType: 'profile',
        category: 'update',
        tags: ['profile', 'update'],
      },
    }),

  // System notifications
  systemMaintenance: (
    userId: string,
    userType: NotificationUserType,
    maintenanceDetails: any
  ) =>
    createNotification({
      userId,
      userType,
      title: 'Scheduled Maintenance',
      message: `System maintenance is scheduled for ${maintenanceDetails.date}. Expected downtime: ${maintenanceDetails.duration}`,
      type: 'system' as NotificationType,
      priority: 'medium' as NotificationPriority,
      metadata: {
        entityType: 'system',
        category: 'maintenance',
      },
      expiresAt: maintenanceDetails.endTime,
    }),

  // Generic notifications
  success: (
    userId: string,
    userType: NotificationUserType,
    title: string,
    message: string,
    actionUrl?: string
  ) =>
    createNotification({
      userId,
      userType,
      title,
      message,
      type: 'success' as NotificationType,
      priority: 'medium' as NotificationPriority,
      actionUrl,
    }),

  error: (
    userId: string,
    userType: NotificationUserType,
    title: string,
    message: string,
    actionUrl?: string
  ) =>
    createNotification({
      userId,
      userType,
      title,
      message,
      type: 'error' as NotificationType,
      priority: 'high' as NotificationPriority,
      actionUrl,
    }),

  info: (
    userId: string,
    userType: NotificationUserType,
    title: string,
    message: string,
    actionUrl?: string
  ) =>
    createNotification({
      userId,
      userType,
      title,
      message,
      type: 'info' as NotificationType,
      priority: 'low' as NotificationPriority,
      actionUrl,
    }),

  warning: (
    userId: string,
    userType: NotificationUserType,
    title: string,
    message: string,
    actionUrl?: string
  ) =>
    createNotification({
      userId,
      userType,
      title,
      message,
      type: 'warning' as NotificationType,
      priority: 'medium' as NotificationPriority,
      actionUrl,
    }),
});

// Export notification types and interfaces
export type {
  NotificationUserType,
  NotificationType,
  NotificationPriority,
  CreateNotificationArgs,
};

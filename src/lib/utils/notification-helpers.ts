/**
 * Notification Helper Utilities
 *
 * This file contains utility functions for integrating notifications
 * into business logic across the Teamcast platform.
 */

import { logger } from '@/lib/shared';
import {
  CreateNotificationArgs,
  NotificationUserType,
  NotificationType,
  NotificationPriority,
} from '../services/notification.service';

// Type definitions for common business entities
interface JobApplication {
  id: string;
  jobTitle: string;
  companyName: string;
  candidateId: string;
  clientId: string;
  status: string;
}

interface Interview {
  id: string;
  jobTitle: string;
  candidateId: string;
  clientId: string;
  scheduledAt: Date;
  duration: number;
  meetingLink?: string;
}

interface Assessment {
  id: string;
  jobTitle: string;
  candidateId: string;
  clientId: string;
  type: string;
  dueDate?: Date;
}

interface Profile {
  id: string;
  userId: string;
  completionPercentage: number;
  status: string;
}

/**
 * Business Logic Notification Helpers
 *
 * These functions create notifications for specific business events
 * and can be called from your application logic.
 */

export class NotificationManager {
  private createNotification: (args: CreateNotificationArgs) => Promise<any>;

  constructor(
    createNotificationFn: (args: CreateNotificationArgs) => Promise<any>
  ) {
    this.createNotification = createNotificationFn;
  }

  // ===== APPLICATION LIFECYCLE NOTIFICATIONS =====

  async onApplicationSubmitted(application: JobApplication) {
    // Notify candidate
    await this.createNotification({
      userId: application.candidateId,
      userType: 'candidate',
      title: 'Application Submitted',
      message: `Your application for ${application.jobTitle} at ${application.companyName} has been submitted successfully.`,
      type: 'success',
      priority: 'medium',
      actionUrl: `/app/candidate/applications/${application.id}`,
      actionText: 'View Application',
      metadata: {
        entityId: application.id,
        entityType: 'application',
        category: 'submission',
        tags: ['application', 'submitted'],
      },
    });

    // Notify client
    await this.createNotification({
      userId: application.clientId,
      userType: 'client',
      title: 'New Application Received',
      message: `A new application has been received for ${application.jobTitle}.`,
      type: 'info',
      priority: 'medium',
      actionUrl: `/app/client/applications/${application.id}`,
      actionText: 'Review Application',
      metadata: {
        entityId: application.id,
        entityType: 'application',
        category: 'new_application',
        tags: ['application', 'review_needed'],
      },
    });
  }

  async onApplicationStatusChanged(
    application: JobApplication,
    previousStatus: string
  ) {
    const statusMessages = {
      under_review: 'Your application is now under review.',
      shortlisted: 'Congratulations! You have been shortlisted.',
      interview_scheduled:
        'An interview has been scheduled for your application.',
      rejected: 'Unfortunately, your application was not selected.',
      accepted: 'Congratulations! Your application has been accepted.',
      withdrawn: 'Your application has been withdrawn.',
    };

    const priority: NotificationPriority = ['accepted', 'shortlisted'].includes(
      application.status
    )
      ? 'high'
      : ['rejected', 'withdrawn'].includes(application.status)
        ? 'medium'
        : 'low';

    const notificationType: NotificationType = [
      'accepted',
      'shortlisted',
    ].includes(application.status)
      ? 'success'
      : ['rejected', 'withdrawn'].includes(application.status)
        ? 'warning'
        : 'info';

    await this.createNotification({
      userId: application.candidateId,
      userType: 'candidate',
      title: 'Application Status Update',
      message: `${statusMessages[application.status as keyof typeof statusMessages] || 'Your application status has been updated.'} Job: ${application.jobTitle}`,
      type: notificationType,
      priority,
      actionUrl: `/app/candidate/applications/${application.id}`,
      actionText: 'View Details',
      metadata: {
        entityId: application.id,
        entityType: 'application',
        category: 'status_update',
        tags: ['application', application.status, previousStatus],
      },
    });
  }

  // ===== INTERVIEW NOTIFICATIONS =====

  async onInterviewScheduled(interview: Interview) {
    const formattedDate = interview.scheduledAt.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    // Notify candidate
    await this.createNotification({
      userId: interview.candidateId,
      userType: 'candidate',
      title: 'Interview Scheduled',
      message: `Your interview for ${interview.jobTitle} has been scheduled for ${formattedDate}.`,
      type: 'interview',
      priority: 'high',
      actionUrl: `/app/candidate/interviews/${interview.id}`,
      actionText: 'View Interview Details',
      metadata: {
        entityId: interview.id,
        entityType: 'interview',
        category: 'scheduled',
        tags: ['interview', 'scheduled'],
      },
    });

    // Notify client
    await this.createNotification({
      userId: interview.clientId,
      userType: 'client',
      title: 'Interview Scheduled',
      message: `Interview for ${interview.jobTitle} has been scheduled for ${formattedDate}.`,
      type: 'interview',
      priority: 'medium',
      actionUrl: `/app/client/interviews/${interview.id}`,
      actionText: 'View Interview',
      metadata: {
        entityId: interview.id,
        entityType: 'interview',
        category: 'scheduled',
        tags: ['interview', 'scheduled'],
      },
    });
  }

  async onInterviewReminder(interview: Interview, minutesUntil: number) {
    const timeText =
      minutesUntil < 60
        ? `${minutesUntil} minutes`
        : `${Math.round(minutesUntil / 60)} hour${Math.round(minutesUntil / 60) > 1 ? 's' : ''}`;

    // Notify candidate
    await this.createNotification({
      userId: interview.candidateId,
      userType: 'candidate',
      title: 'Interview Reminder',
      message: `Your interview for ${interview.jobTitle} is starting in ${timeText}.`,
      type: 'interview',
      priority: 'urgent',
      actionUrl:
        interview.meetingLink || `/app/candidate/interviews/${interview.id}`,
      actionText: interview.meetingLink ? 'Join Interview' : 'View Details',
      metadata: {
        entityId: interview.id,
        entityType: 'interview',
        category: 'reminder',
        tags: ['interview', 'reminder', `${minutesUntil}min`],
      },
      expiresAt:
        interview.scheduledAt.getTime() + interview.duration * 60 * 1000, // Expire after interview ends
    });

    // Notify client
    await this.createNotification({
      userId: interview.clientId,
      userType: 'client',
      title: 'Interview Reminder',
      message: `Interview for ${interview.jobTitle} is starting in ${timeText}.`,
      type: 'interview',
      priority: 'urgent',
      actionUrl:
        interview.meetingLink || `/app/client/interviews/${interview.id}`,
      actionText: interview.meetingLink ? 'Join Interview' : 'View Details',
      metadata: {
        entityId: interview.id,
        entityType: 'interview',
        category: 'reminder',
        tags: ['interview', 'reminder', `${minutesUntil}min`],
      },
      expiresAt:
        interview.scheduledAt.getTime() + interview.duration * 60 * 1000,
    });
  }

  // ===== ASSESSMENT NOTIFICATIONS =====

  async onAssessmentInvitation(assessment: Assessment) {
    const dueDateText = assessment.dueDate
      ? ` Due by ${assessment.dueDate.toLocaleDateString()}`
      : '';

    await this.createNotification({
      userId: assessment.candidateId,
      userType: 'candidate',
      title: 'Assessment Invitation',
      message: `You've been invited to take a ${assessment.type} assessment for ${assessment.jobTitle}.${dueDateText}`,
      type: 'assessment',
      priority: 'high',
      actionUrl: `/app/candidate/assessments/${assessment.id}`,
      actionText: 'Start Assessment',
      metadata: {
        entityId: assessment.id,
        entityType: 'assessment',
        category: 'invitation',
        tags: ['assessment', assessment.type, 'invitation'],
      },
      expiresAt: assessment.dueDate?.getTime(),
    });
  }

  async onAssessmentCompleted(assessment: Assessment, score?: number) {
    const scoreText = score ? ` You scored ${score}%.` : '';

    await this.createNotification({
      userId: assessment.candidateId,
      userType: 'candidate',
      title: 'Assessment Completed',
      message: `You have successfully completed the ${assessment.type} assessment for ${assessment.jobTitle}.${scoreText}`,
      type: 'success',
      priority: 'medium',
      actionUrl: `/app/candidate/assessments/${assessment.id}/results`,
      actionText: 'View Results',
      metadata: {
        entityId: assessment.id,
        entityType: 'assessment',
        category: 'completed',
        tags: ['assessment', assessment.type, 'completed'],
      },
    });

    // Notify client
    await this.createNotification({
      userId: assessment.clientId,
      userType: 'client',
      title: 'Assessment Completed',
      message: `A candidate has completed the ${assessment.type} assessment for ${assessment.jobTitle}.${scoreText}`,
      type: 'info',
      priority: 'medium',
      actionUrl: `/app/client/assessments/${assessment.id}/results`,
      actionText: 'Review Results',
      metadata: {
        entityId: assessment.id,
        entityType: 'assessment',
        category: 'completed',
        tags: ['assessment', assessment.type, 'review_needed'],
      },
    });
  }

  // ===== PROFILE NOTIFICATIONS =====

  async onProfileStatusChanged(profile: Profile, status: string) {
    const userType = this.getUserTypeFromProfile(profile);

    const statusMessages = {
      approved: {
        title: 'Profile Approved',
        message:
          'Congratulations! Your profile has been approved and is now live.',
        type: 'success' as NotificationType,
        priority: 'high' as NotificationPriority,
      },
      rejected: {
        title: 'Profile Needs Improvement',
        message:
          'Your profile needs some improvements before it can be approved. Please review the feedback.',
        type: 'warning' as NotificationType,
        priority: 'high' as NotificationPriority,
      },
      under_review: {
        title: 'Profile Under Review',
        message: 'Your profile is currently being reviewed by our team.',
        type: 'info' as NotificationType,
        priority: 'medium' as NotificationPriority,
      },
    };

    const statusInfo = statusMessages[status as keyof typeof statusMessages];
    if (!statusInfo) return;

    await this.createNotification({
      userId: profile.userId,
      userType,
      title: statusInfo.title,
      message: statusInfo.message,
      type: statusInfo.type,
      priority: statusInfo.priority,
      actionUrl: `/app/${userType}/profile`,
      actionText: 'View Profile',
      metadata: {
        entityId: profile.id,
        entityType: 'profile',
        category: 'status_update',
        tags: ['profile', status],
      },
    });
  }

  async onProfileCompletionReminder(profile: Profile) {
    const userType = this.getUserTypeFromProfile(profile);

    if (profile.completionPercentage >= 80) return; // Don't remind if profile is mostly complete

    await this.createNotification({
      userId: profile.userId,
      userType,
      title: 'Complete Your Profile',
      message: `Your profile is ${profile.completionPercentage}% complete. Adding more details will help you get better opportunities.`,
      type: 'profile',
      priority: 'medium',
      actionUrl: `/app/${userType}/profile`,
      actionText: 'Complete Profile',
      metadata: {
        entityId: profile.id,
        entityType: 'profile',
        category: 'completion_reminder',
        tags: ['profile', 'incomplete', `${profile.completionPercentage}%`],
      },
    });
  }

  // ===== SYSTEM NOTIFICATIONS =====

  async onSystemMaintenance(
    userIds: string[],
    userType: NotificationUserType,
    maintenanceDetails: {
      startTime: Date;
      endTime: Date;
      description: string;
    }
  ) {
    const duration = Math.round(
      (maintenanceDetails.endTime.getTime() -
        maintenanceDetails.startTime.getTime()) /
        (1000 * 60 * 60)
    );
    const startTimeText = maintenanceDetails.startTime.toLocaleDateString(
      'en-US',
      {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }
    );

    for (const userId of userIds) {
      await this.createNotification({
        userId,
        userType,
        title: 'Scheduled Maintenance',
        message: `System maintenance is scheduled for ${startTimeText}. Expected duration: ${duration} hours. ${maintenanceDetails.description}`,
        type: 'system',
        priority: 'medium',
        metadata: {
          entityType: 'system',
          category: 'maintenance',
          tags: ['maintenance', 'scheduled'],
        },
        expiresAt: maintenanceDetails.endTime.getTime(),
      });
    }
  }

  async onFeatureAnnouncement(
    userIds: string[],
    userType: NotificationUserType,
    feature: {
      name: string;
      description: string;
      learnMoreUrl?: string;
    }
  ) {
    for (const userId of userIds) {
      await this.createNotification({
        userId,
        userType,
        title: `New Feature: ${feature.name}`,
        message: feature.description,
        type: 'info',
        priority: 'low',
        actionUrl: feature.learnMoreUrl,
        actionText: feature.learnMoreUrl ? 'Learn More' : undefined,
        metadata: {
          entityType: 'system',
          category: 'feature_announcement',
          tags: ['feature', 'announcement', feature.name.toLowerCase()],
        },
      });
    }
  }

  // ===== UTILITY METHODS =====

  private getUserTypeFromProfile(profile: Profile): NotificationUserType {
    // This would typically be determined from your user/profile data
    // For now, we'll default to 'candidate' but you should implement proper logic
    logger.info('getUserTypeFromProfile', { profile });
    return 'candidate';
  }
}

/**
 * Factory function to create a NotificationManager instance
 */
export function createNotificationManager(
  createNotificationFn: (args: CreateNotificationArgs) => Promise<any>
) {
  return new NotificationManager(createNotificationFn);
}

/**
 * Utility function to batch create notifications
 */
export async function batchCreateNotifications(
  notifications: CreateNotificationArgs[],
  createNotificationFn: (args: CreateNotificationArgs) => Promise<any>
) {
  const results = await Promise.allSettled(
    notifications.map((notification) => createNotificationFn(notification))
  );

  const successful = results.filter(
    (result) => result.status === 'fulfilled'
  ).length;
  const failed = results.filter(
    (result) => result.status === 'rejected'
  ).length;

  logger.info(
    `Batch notification creation: ${successful} successful, ${failed} failed`
  );

  return { successful, failed, results };
}

/**
 * Utility to create notifications for multiple users of the same type
 */
export async function notifyMultipleUsers(
  userIds: string[],
  userType: NotificationUserType,
  notificationData: Omit<CreateNotificationArgs, 'userId' | 'userType'>,
  createNotificationFn: (args: CreateNotificationArgs) => Promise<any>
) {
  const notifications = userIds.map((userId) => ({
    ...notificationData,
    userId,
    userType,
  }));

  return batchCreateNotifications(notifications, createNotificationFn);
}

import { useCreateNotification } from '@/lib/services/notification.service';
import {
  NotificationUserType,
  NotificationType,
  NotificationPriority,
} from '@/lib/services/notification.service';

export const useClientNotifications = () => {
  const createNotification = useCreateNotification();

  const helpers = {
    // Subscription notifications
    subscriptionUpgraded: (
      userId: string,
      packageName: string,
      price: string
    ) =>
      createNotification({
        userId,
        userType: 'client' as NotificationUserType,
        title: 'Subscription Upgraded',
        message: `Your subscription has been upgraded to ${packageName} for ${price}`,
        type: 'success' as NotificationType,
        priority: 'high' as NotificationPriority,
        actionUrl: '/app/client/subscription',
        actionText: 'View Subscription',
        metadata: {
          entityType: 'subscription',
          category: 'upgrade',
          tags: ['subscription', 'upgrade'],
        },
      }),

    subscriptionDowngraded: (userId: string, packageName: string) =>
      createNotification({
        userId,
        userType: 'client' as NotificationUserType,
        title: 'Subscription Changed',
        message: `Your subscription has been changed to ${packageName}`,
        type: 'info' as NotificationType,
        priority: 'medium' as NotificationPriority,
        actionUrl: '/app/client/subscription',
        actionText: 'View Subscription',
        metadata: {
          entityType: 'subscription',
          category: 'change',
          tags: ['subscription', 'change'],
        },
      }),

    subscriptionCancelled: (userId: string, endDate: string) =>
      createNotification({
        userId,
        userType: 'client' as NotificationUserType,
        title: 'Subscription Cancelled',
        message: `Your subscription has been cancelled and will end on ${endDate}`,
        type: 'warning' as NotificationType,
        priority: 'high' as NotificationPriority,
        actionUrl: '/app/client/subscription',
        actionText: 'Reactivate',
        metadata: {
          entityType: 'subscription',
          category: 'cancellation',
          tags: ['subscription', 'cancelled'],
        },
      }),

    paymentFailed: (userId: string, amount: string) =>
      createNotification({
        userId,
        userType: 'client' as NotificationUserType,
        title: 'Payment Failed',
        message: `Payment of ${amount} failed. Please update your payment method.`,
        type: 'error' as NotificationType,
        priority: 'urgent' as NotificationPriority,
        actionUrl: '/app/client/subscription',
        actionText: 'Update Payment',
        metadata: {
          entityType: 'payment',
          category: 'failure',
          tags: ['payment', 'failed'],
        },
      }),

    paymentMethodAdded: (userId: string, cardType: string) =>
      createNotification({
        userId,
        userType: 'client' as NotificationUserType,
        title: 'Payment Method Added',
        message: `${cardType} card has been added to your account`,
        type: 'success' as NotificationType,
        priority: 'medium' as NotificationPriority,
        actionUrl: '/app/client/subscription',
        actionText: 'View Payment Methods',
        metadata: {
          entityType: 'payment_method',
          category: 'addition',
          tags: ['payment', 'method'],
        },
      }),

    // Settings notifications
    settingsUpdated: (userId: string, settingType: string) =>
      createNotification({
        userId,
        userType: 'client' as NotificationUserType,
        title: 'Settings Updated',
        message: `Your ${settingType} settings have been updated successfully`,
        type: 'success' as NotificationType,
        priority: 'low' as NotificationPriority,
        actionUrl: '/app/client/settings',
        actionText: 'View Settings',
        metadata: {
          entityType: 'settings',
          category: 'update',
          tags: ['settings', settingType],
        },
      }),

    notificationPreferencesChanged: (userId: string, enabled: boolean) =>
      createNotification({
        userId,
        userType: 'client' as NotificationUserType,
        title: 'Notification Preferences Updated',
        message: `Notifications have been ${enabled ? 'enabled' : 'disabled'}`,
        type: 'info' as NotificationType,
        priority: 'low' as NotificationPriority,
        actionUrl: '/app/client/settings',
        actionText: 'View Settings',
        metadata: {
          entityType: 'settings',
          category: 'notifications',
          tags: ['settings', 'notifications'],
        },
      }),

    // Profile notifications
    profileUpdated: (userId: string, section: string) =>
      createNotification({
        userId,
        userType: 'client' as NotificationUserType,
        title: 'Profile Updated',
        message: `Your ${section} has been updated successfully`,
        type: 'success' as NotificationType,
        priority: 'low' as NotificationPriority,
        actionUrl: '/app/client/profile',
        actionText: 'View Profile',
        metadata: {
          entityType: 'profile',
          category: 'update',
          tags: ['profile', section],
        },
      }),

    profileIncomplete: (userId: string, completionPercentage: number) =>
      createNotification({
        userId,
        userType: 'client' as NotificationUserType,
        title: 'Complete Your Profile',
        message: `Your company profile is ${completionPercentage}% complete. Add more details to improve your visibility`,
        type: 'warning' as NotificationType,
        priority: 'medium' as NotificationPriority,
        actionUrl: '/app/client/profile',
        actionText: 'Complete Profile',
        metadata: {
          entityType: 'profile',
          category: 'completion',
          tags: ['profile', 'incomplete'],
        },
      }),

    // Interview notifications
    interviewScheduled: (
      userId: string,
      candidateName: string,
      jobTitle: string,
      date: string
    ) =>
      createNotification({
        userId,
        userType: 'client' as NotificationUserType,
        title: 'Interview Scheduled',
        message: `Interview with ${candidateName} for ${jobTitle} scheduled for ${date}`,
        type: 'interview' as NotificationType,
        priority: 'high' as NotificationPriority,
        actionUrl: '/app/client/interviews',
        actionText: 'View Interview',
        metadata: {
          entityType: 'interview',
          category: 'scheduling',
          tags: ['interview', 'scheduled'],
        },
      }),

    interviewReminder: (
      userId: string,
      candidateName: string,
      jobTitle: string,
      timeUntil: string
    ) =>
      createNotification({
        userId,
        userType: 'client' as NotificationUserType,
        title: 'Interview Reminder',
        message: `Interview with ${candidateName} for ${jobTitle} is starting in ${timeUntil}`,
        type: 'interview' as NotificationType,
        priority: 'urgent' as NotificationPriority,
        actionUrl: '/app/client/interviews',
        actionText: 'Join Interview',
        metadata: {
          entityType: 'interview',
          category: 'reminder',
          tags: ['interview', 'reminder'],
        },
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // Expire in 24 hours
      }),

    interviewCompleted: (
      userId: string,
      candidateName: string,
      jobTitle: string
    ) =>
      createNotification({
        userId,
        userType: 'client' as NotificationUserType,
        title: 'Interview Completed',
        message: `Interview with ${candidateName} for ${jobTitle} has been completed`,
        type: 'interview' as NotificationType,
        priority: 'medium' as NotificationPriority,
        actionUrl: '/app/client/interviews',
        actionText: 'View Results',
        metadata: {
          entityType: 'interview',
          category: 'completion',
          tags: ['interview', 'completed'],
        },
      }),

    interviewCancelled: (
      userId: string,
      candidateName: string,
      jobTitle: string
    ) =>
      createNotification({
        userId,
        userType: 'client' as NotificationUserType,
        title: 'Interview Cancelled',
        message: `Interview with ${candidateName} for ${jobTitle} has been cancelled`,
        type: 'warning' as NotificationType,
        priority: 'high' as NotificationPriority,
        actionUrl: '/app/client/interviews',
        actionText: 'Reschedule',
        metadata: {
          entityType: 'interview',
          category: 'cancellation',
          tags: ['interview', 'cancelled'],
        },
      }),

    // Candidate notifications
    newApplication: (userId: string, candidateName: string, jobTitle: string) =>
      createNotification({
        userId,
        userType: 'client' as NotificationUserType,
        title: 'New Application',
        message: `${candidateName} has applied for ${jobTitle}`,
        type: 'application' as NotificationType,
        priority: 'high' as NotificationPriority,
        actionUrl: '/app/client/candidates/applications',
        actionText: 'Review Application',
        metadata: {
          entityType: 'application',
          category: 'new',
          tags: ['application', 'new'],
        },
      }),

    applicationStatusChanged: (
      userId: string,
      candidateName: string,
      jobTitle: string,
      status: string
    ) =>
      createNotification({
        userId,
        userType: 'client' as NotificationUserType,
        title: 'Application Status Updated',
        message: `${candidateName}'s application for ${jobTitle} status changed to ${status}`,
        type: 'application' as NotificationType,
        priority: 'medium' as NotificationPriority,
        actionUrl: '/app/client/candidates/applications',
        actionText: 'View Application',
        metadata: {
          entityType: 'application',
          category: 'status_update',
          tags: ['application', 'status'],
        },
      }),

    // Recruiter notifications
    jobPosted: (userId: string, jobTitle: string) =>
      createNotification({
        userId,
        userType: 'client' as NotificationUserType,
        title: 'Job Posted Successfully',
        message: `Your job posting for ${jobTitle} is now live`,
        type: 'success' as NotificationType,
        priority: 'medium' as NotificationPriority,
        actionUrl: '/app/client/recruiter/jobs',
        actionText: 'View Job',
        metadata: {
          entityType: 'job',
          category: 'posting',
          tags: ['job', 'posted'],
        },
      }),

    jobExpiring: (userId: string, jobTitle: string, daysLeft: number) =>
      createNotification({
        userId,
        userType: 'client' as NotificationUserType,
        title: 'Job Expiring Soon',
        message: `Your job posting for ${jobTitle} expires in ${daysLeft} days`,
        type: 'warning' as NotificationType,
        priority: 'medium' as NotificationPriority,
        actionUrl: '/app/client/recruiter/jobs',
        actionText: 'Extend Job',
        metadata: {
          entityType: 'job',
          category: 'expiration',
          tags: ['job', 'expiring'],
        },
      }),

    candidateFound: (
      userId: string,
      candidateCount: number,
      jobTitle: string
    ) =>
      createNotification({
        userId,
        userType: 'client' as NotificationUserType,
        title: 'New Candidates Found',
        message: `${candidateCount} new candidates found for ${jobTitle}`,
        type: 'info' as NotificationType,
        priority: 'medium' as NotificationPriority,
        actionUrl: '/app/client/candidates/search',
        actionText: 'View Candidates',
        metadata: {
          entityType: 'candidate',
          category: 'discovery',
          tags: ['candidate', 'found'],
        },
      }),

    // System notifications
    systemMaintenance: (userId: string, date: string, duration: string) =>
      createNotification({
        userId,
        userType: 'client' as NotificationUserType,
        title: 'Scheduled Maintenance',
        message: `System maintenance is scheduled for ${date}. Expected downtime: ${duration}`,
        type: 'system' as NotificationType,
        priority: 'medium' as NotificationPriority,
        metadata: {
          entityType: 'system',
          category: 'maintenance',
          tags: ['system', 'maintenance'],
        },
      }),

    // Generic notifications
    success: (
      userId: string,
      title: string,
      message: string,
      actionUrl?: string
    ) =>
      createNotification({
        userId,
        userType: 'client' as NotificationUserType,
        title,
        message,
        type: 'success' as NotificationType,
        priority: 'medium' as NotificationPriority,
        actionUrl,
      }),

    error: (
      userId: string,
      title: string,
      message: string,
      actionUrl?: string
    ) =>
      createNotification({
        userId,
        userType: 'client' as NotificationUserType,
        title,
        message,
        type: 'error' as NotificationType,
        priority: 'high' as NotificationPriority,
        actionUrl,
      }),

    info: (
      userId: string,
      title: string,
      message: string,
      actionUrl?: string
    ) =>
      createNotification({
        userId,
        userType: 'client' as NotificationUserType,
        title,
        message,
        type: 'info' as NotificationType,
        priority: 'low' as NotificationPriority,
        actionUrl,
      }),

    warning: (
      userId: string,
      title: string,
      message: string,
      actionUrl?: string
    ) =>
      createNotification({
        userId,
        userType: 'client' as NotificationUserType,
        title,
        message,
        type: 'warning' as NotificationType,
        priority: 'medium' as NotificationPriority,
        actionUrl,
      }),
  };

  return helpers;
};

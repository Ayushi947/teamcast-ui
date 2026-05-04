import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export type NotificationUserType =
  | 'candidate'
  | 'client'
  | 'partner'
  | 'support';
export type NotificationType =
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'interview'
  | 'application'
  | 'assessment'
  | 'profile'
  | 'system'
  | 'integration';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface CreateNotificationArgs {
  userId: string;
  userType: NotificationUserType;
  title: string;
  message: string;
  type: NotificationType;
  priority?: NotificationPriority;
  actionUrl?: string;
  actionText?: string;
  metadata?: {
    entityId?: string;
    entityType?: string;
    category?: string;
    tags?: string[];
  };
  expiresAt?: number;
}

// Create a new notification
export const createNotification = mutation({
  args: {
    userId: v.string(),
    userType: v.union(
      v.literal('candidate'),
      v.literal('client'),
      v.literal('partner'),
      v.literal('support')
    ),
    title: v.string(),
    message: v.string(),
    type: v.union(
      v.literal('info'),
      v.literal('success'),
      v.literal('warning'),
      v.literal('error'),
      v.literal('interview'),
      v.literal('application'),
      v.literal('assessment'),
      v.literal('profile'),
      v.literal('system'),
      v.literal('integration')
    ),
    priority: v.optional(
      v.union(
        v.literal('low'),
        v.literal('medium'),
        v.literal('high'),
        v.literal('urgent')
      )
    ),
    actionUrl: v.optional(v.string()),
    actionText: v.optional(v.string()),
    metadata: v.optional(
      v.object({
        entityId: v.optional(v.string()),
        entityType: v.optional(v.string()),
        category: v.optional(v.string()),
        tags: v.optional(v.array(v.string())),
      })
    ),
    expiresAt: v.optional(v.number()),
    subType: v.optional(v.string()),
    status: v.optional(
      v.union(v.literal('success'), v.literal('error'), v.literal('warning'))
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const notificationId = await ctx.db.insert('notifications', {
      userId: args.userId,
      userType: args.userType,
      title: args.title,
      message: args.message,
      type: args.type,
      priority: args.priority || 'medium',
      actionUrl: args.actionUrl,
      actionText: args.actionText,
      metadata: args.metadata,
      isRead: false,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
      expiresAt: args.expiresAt,
    });

    return notificationId;
  },
});

// Get notifications for a user
export const getUserNotifications = query({
  args: {
    userId: v.string(),
    userType: v.optional(
      v.union(
        v.literal('candidate'),
        v.literal('client'),
        v.literal('partner'),
        v.literal('support')
      )
    ),
    limit: v.optional(v.number()),
    includeRead: v.optional(v.boolean()),
    includeArchived: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let notifications;

    if (args.userType) {
      notifications = await ctx.db
        .query('notifications')
        .withIndex('by_user_type', (q) =>
          q.eq('userId', args.userId).eq('userType', args.userType!)
        )
        .collect();
    } else {
      notifications = await ctx.db
        .query('notifications')
        .withIndex('by_user', (q) => q.eq('userId', args.userId))
        .collect();
    }

    // Filter out expired notifications
    const now = Date.now();
    notifications = notifications.filter(
      (notification) => !notification.expiresAt || notification.expiresAt > now
    );

    // Apply filters
    if (!args.includeRead) {
      notifications = notifications.filter((n) => !n.isRead);
    }

    if (!args.includeArchived) {
      notifications = notifications.filter((n) => !n.isArchived);
    }

    // Sort by priority and creation date
    notifications.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff =
        priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.createdAt - a.createdAt;
    });

    // Apply limit
    if (args.limit) {
      notifications = notifications.slice(0, args.limit);
    }

    return notifications;
  },
});

// Get unread notification count for a user
export const getUnreadCount = query({
  args: {
    userId: v.string(),
    userType: v.optional(
      v.union(
        v.literal('candidate'),
        v.literal('client'),
        v.literal('partner'),
        v.literal('support')
      )
    ),
  },
  handler: async (ctx, args) => {
    let notifications;

    if (args.userType) {
      notifications = await ctx.db
        .query('notifications')
        .withIndex('by_user_type_unread', (q) =>
          q
            .eq('userId', args.userId)
            .eq('userType', args.userType!)
            .eq('isRead', false)
        )
        .collect();
    } else {
      notifications = await ctx.db
        .query('notifications')
        .withIndex('by_user_unread', (q) =>
          q.eq('userId', args.userId).eq('isRead', false)
        )
        .collect();
    }

    // Filter out expired notifications
    const now = Date.now();
    const validNotifications = notifications.filter(
      (notification) => !notification.expiresAt || notification.expiresAt > now
    );

    return validNotifications.length;
  },
});

// Mark notification as read
export const markAsRead = mutation({
  args: {
    notificationId: v.id('notifications'),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.notificationId, {
      isRead: true,
      updatedAt: Date.now(),
    });
  },
});

// Mark all notifications as read for a user
export const markAllAsRead = mutation({
  args: {
    userId: v.string(),
    userType: v.optional(
      v.union(
        v.literal('candidate'),
        v.literal('client'),
        v.literal('partner'),
        v.literal('support')
      )
    ),
  },
  handler: async (ctx, args) => {
    let notifications;

    if (args.userType) {
      notifications = await ctx.db
        .query('notifications')
        .withIndex('by_user_type_unread', (q) =>
          q
            .eq('userId', args.userId)
            .eq('userType', args.userType!)
            .eq('isRead', false)
        )
        .collect();
    } else {
      notifications = await ctx.db
        .query('notifications')
        .withIndex('by_user_unread', (q) =>
          q.eq('userId', args.userId).eq('isRead', false)
        )
        .collect();
    }

    const now = Date.now();

    for (const notification of notifications) {
      await ctx.db.patch(notification._id, {
        isRead: true,
        updatedAt: now,
      });
    }

    return notifications.length;
  },
});

// Archive notification
export const archiveNotification = mutation({
  args: {
    notificationId: v.id('notifications'),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.notificationId, {
      isArchived: true,
      updatedAt: Date.now(),
    });
  },
});

// Delete notification
export const deleteNotification = mutation({
  args: {
    notificationId: v.id('notifications'),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.notificationId);
  },
});

// Bulk delete notifications
export const bulkDeleteNotifications = mutation({
  args: {
    notificationIds: v.array(v.id('notifications')),
  },
  handler: async (ctx, args) => {
    for (const id of args.notificationIds) {
      await ctx.db.delete(id);
    }
    return args.notificationIds.length;
  },
});

// Clean up expired notifications (can be called periodically)
export const cleanupExpiredNotifications = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const expiredNotifications = await ctx.db
      .query('notifications')
      .filter((q) =>
        q.and(
          q.neq(q.field('expiresAt'), undefined),
          q.lt(q.field('expiresAt'), now)
        )
      )
      .collect();

    for (const notification of expiredNotifications) {
      await ctx.db.delete(notification._id);
    }

    return expiredNotifications.length;
  },
});

// Get notification by ID
export const getNotificationById = query({
  args: {
    notificationId: v.id('notifications'),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.notificationId);
  },
});

// Update notification
export const updateNotification = mutation({
  args: {
    notificationId: v.id('notifications'),
    title: v.optional(v.string()),
    message: v.optional(v.string()),
    type: v.optional(
      v.union(
        v.literal('info'),
        v.literal('success'),
        v.literal('warning'),
        v.literal('error'),
        v.literal('interview'),
        v.literal('application'),
        v.literal('assessment'),
        v.literal('profile'),
        v.literal('system'),
        v.literal('integration')
      )
    ),
    priority: v.optional(
      v.union(
        v.literal('low'),
        v.literal('medium'),
        v.literal('high'),
        v.literal('urgent')
      )
    ),
    actionUrl: v.optional(v.string()),
    actionText: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { notificationId, ...updates } = args;

    await ctx.db.patch(notificationId, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

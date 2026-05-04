import { v } from 'convex/values';
import { query, mutation } from '../../_generated/server';

// ============================================================================
// CHAT SETTINGS
// ============================================================================

/**
 * Get or create chat settings for a user
 */
export const getChatSettings = query({
  args: {
    userId: v.string(),
    userType: v.union(
      v.literal('candidate'),
      v.literal('client'),
      v.literal('partner'),
      v.literal('support')
    ),
  },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query('chatSettings')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first();

    if (!settings) {
      // Return default settings
      return {
        userId: args.userId,
        userType: args.userType,
        enableNotifications: true,
        enableEmailNotifications: true,
        enablePushNotifications: true,
        notificationFrequency: 'immediate',
        allowDirectMessages: true,
        allowCommunityMessages: true,
        showOnlineStatus: true,
        enableFileSharing: true,
        enableVideoChat: true,
        autoArchiveOldChats: false,
        autoArchiveDays: 30,
        theme: 'system',
        fontSize: 'medium',
      };
    }

    return settings;
  },
});

/**
 * Get chat Support settings for a conversation
 */
export const getSupportAvailability = query({
  args: {
    userType: v.union(
      v.literal('anonymous'),
      v.literal('candidate'),
      v.literal('client'),
      v.literal('partner'),
      v.literal('support')
    ),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const isAnonymous = args.userType === 'anonymous';

    if (!isAnonymous) {
      return {
        supportAvailable: false,
        supportAgents: [],
      };
    }

    const supportSettings = await ctx.db
      .query('chatSettings')
      .withIndex('by_user_type', (q) => q.eq('userType', 'support'))
      .collect();

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    const oneMinuteAgo = Date.now() - 60 * 1000;

    const supportAgents = [];

    for (const setting of supportSettings) {
      const user = await ctx.db
        .query('users')
        .withIndex('by_userId', (q) => q.eq('userId', setting.userId))
        .first();

      if (!user) continue;

      const lastSeen = user.lastSeen ?? 0;
      const isOnline = lastSeen >= oneMinuteAgo;

      const { start, end } = setting.workingHours ?? {
        start: '09:00',
        end: '20:00',
      };

      const isWithinWorkingHours = currentTime >= start && currentTime <= end;

      let availabilityStatus: 'online' | 'away' | 'offline' = 'offline';

      if (isOnline && isWithinWorkingHours) {
        availabilityStatus = 'online';
      } else if (isWithinWorkingHours) {
        availabilityStatus = 'away';
      }

      supportAgents.push({
        userId: setting.userId,
        userName: setting.userName,
        avatar: user.avatar ?? '',
        availabilityStatus,
        isOnline,
        showOnlineStatus: setting.showOnlineStatus,
      });
    }

    return {
      supportAvailable: supportAgents.some((agent) => agent.isOnline === true),
      supportAgents: supportAgents.filter((agent) => agent.isOnline),
    };
  },
});

/**
 * Update chat settings for a user
 */
export const updateChatSettings = mutation({
  args: {
    userId: v.string(),
    userName: v.string(),
    conversationId: v.optional(v.id('conversations')),
    userType: v.union(
      v.literal('candidate'),
      v.literal('client'),
      v.literal('partner'),
      v.literal('support')
    ),
    settings: v.object({
      enableNotifications: v.optional(v.boolean()),
      enableEmailNotifications: v.optional(v.boolean()),
      enablePushNotifications: v.optional(v.boolean()),
      notificationFrequency: v.optional(
        v.union(
          v.literal('immediate'),
          v.literal('hourly'),
          v.literal('daily'),
          v.literal('never')
        )
      ),
      allowDirectMessages: v.optional(v.boolean()),
      allowCommunityMessages: v.optional(v.boolean()),
      showOnlineStatus: v.optional(v.boolean()),
      enableFileSharing: v.optional(v.boolean()),
      enableVideoChat: v.optional(v.boolean()),
      autoArchiveOldChats: v.optional(v.boolean()),
      autoArchiveDays: v.optional(v.number()),
      theme: v.optional(
        v.union(v.literal('light'), v.literal('dark'), v.literal('system'))
      ),
      fontSize: v.optional(
        v.union(v.literal('small'), v.literal('medium'), v.literal('large'))
      ),
    }),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const existingSettings = await ctx.db
      .query('chatSettings')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first();

    if (existingSettings) {
      await ctx.db.patch(existingSettings._id, {
        ...args.settings,
        updatedAt: now,
      });
      return existingSettings._id;
    } else {
      return await ctx.db.insert('chatSettings', {
        userId: args.userId,
        userType: args.userType,
        userName: args.userName ?? '',
        availabilityStatus: 'online',
        chatStatus: 'live',
        autoAwayEnabled: false,
        workingHours: {
          start: '09:00',
          end: '20:00',
        },
        enableNotifications: true,
        enableEmailNotifications: true,
        enablePushNotifications: true,
        notificationFrequency: 'immediate',
        allowDirectMessages: true,
        allowCommunityMessages: true,
        showOnlineStatus: true,
        enableFileSharing: true,
        enableVideoChat: true,
        autoArchiveOldChats: false,
        autoArchiveDays: 30,
        theme: 'system',
        fontSize: 'medium',
        ...args.settings,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

// ============================================================================
// SUPPORT CHAT CONFIG
// ============================================================================

/**
 * Get the support chat config
 */
export const getSupportChatConfig = query({
  handler: async (ctx) => {
    const configs = await ctx.db.query('supportChatConfig').collect();
    return configs[0] ?? null;
  },
});

/**
 * Set or update the support chat config
 */
export const setSupportChatConfig = mutation({
  args: {
    isLive: v.boolean(),
    availabilityStatus: v.union(
      v.literal('online'),
      v.literal('away'),
      v.literal('offline')
    ),
    workingHours: v.object({
      start: v.string(),
      end: v.string(),
    }),
    updatedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query('supportChatConfig').collect();

    if (existing.length > 0) {
      const configId = existing[0]._id;
      await ctx.db.patch(configId, {
        ...args,
        updatedAt: Date.now(),
      });
      return configId;
    } else {
      return await ctx.db.insert('supportChatConfig', {
        ...args,
        updatedAt: Date.now(),
      });
    }
  },
});

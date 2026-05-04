import { v } from 'convex/values';
import { mutation, query } from '../../_generated/server';

// ===================================================================================
// Types
// ===================================================================================

export interface UserType {
  userType: 'candidate' | 'client' | 'partner' | 'support';
}

// ===================================================================================
// Mutations
// ===================================================================================

/**
 * Create or update a user in the users table
 */
export const upsertUser = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    email: v.optional(v.string()),
    candidateId: v.optional(v.string()),
    clientId: v.optional(v.string()),
    partnerId: v.optional(v.string()),
    supportId: v.optional(v.string()),
    userType: v.union(
      v.literal('candidate'),
      v.literal('client'),
      v.literal('partner'),
      v.literal('support')
    ),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const normalizedUserType = args.userType;

    // Check for duplicate email
    if (args.email) {
      const emailOwner = await ctx.db
        .query('users')
        .filter((q) =>
          q.and(
            q.eq(q.field('email'), args.email),
            q.neq(q.field('userId'), args.userId)
          )
        )
        .first();

      if (emailOwner) {
        return emailOwner._id;
      }
    }

    const existingUser = await ctx.db
      .query('users')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .first();

    const userFields = {
      userId: args.userId,
      name: args.name,
      email: args.email ?? '',
      candidateId: args.candidateId,
      clientId: args.clientId,
      partnerId: args.partnerId,
      supportId: args.supportId,
      userType: normalizedUserType,
      avatar: args.avatar,
      lastSeen: now,
      updatedAt: now,
    };

    if (existingUser) {
      await ctx.db.patch(existingUser._id, userFields);
      return existingUser._id;
    }

    return await ctx.db.insert('users', {
      ...userFields,
      isActive: true,
      createdAt: now,
    });
  },
});

/**
 * Update a user's name
 */
export const updateUserName = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
  },
  handler: async (ctx, { userId, name }) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .first();

    if (!user) throw new Error('User not found');

    await ctx.db.patch(user._id, {
      name,
      updatedAt: Date.now(),
    });

    const participants = await ctx.db
      .query('conversationParticipants')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect();

    await Promise.all(
      participants
        .filter((p) => p.userName !== name)
        .map((p) => ctx.db.patch(p._id, { userName: name }))
    );

    return { success: true };
  },
});

/**
 * Update user's last seen timestamp
 */
export const updateLastSeen = mutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, { userId }) => {
    const now = Date.now();
    const user = await ctx.db
      .query('users')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .first();

    if (!user) return { success: false, error: 'User not found' };

    await ctx.db.patch(user._id, {
      lastSeen: now,
      updatedAt: now,
    });

    const participants = await ctx.db
      .query('conversationParticipants')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .filter((q) => q.eq(q.field('status'), 'active'))
      .collect();

    await Promise.all(
      participants.map((p) => ctx.db.patch(p._id, { lastReadAt: now }))
    );

    // If user is support type, add them to all support conversations
    if (user.userType === 'support') {
      // Find all support conversations
      const supportConversations = await ctx.db
        .query('conversations')
        .withIndex('by_type', (q) => q.eq('type', 'support'))
        .filter((q) => q.eq(q.field('status'), 'active'))
        .collect();

      // For each support conversation, check if user is already a participant
      for (const conversation of supportConversations) {
        const existingParticipation = await ctx.db
          .query('conversationParticipants')
          .withIndex('by_conversation', (q) =>
            q.eq('conversationId', conversation._id)
          )
          .filter((q) => q.eq(q.field('userId'), userId))
          .first();

        // If not already a participant, add them
        if (!existingParticipation) {
          await ctx.db.insert('conversationParticipants', {
            conversationId: conversation._id,
            userId: userId,
            userName: user.name,
            userType: 'support',
            role: 'admin',
            status: 'active',
            canSendMessages: true,
            canAddParticipants: true,
            canRemoveParticipants: true,
            canArchiveConversation: true,
            lastReadAt: now,
            unreadCount: 0,
            joinedAt: now,
          });
        }
      }
    }

    return { success: true, lastSeen: now };
  },
});

// ===================================================================================
// Queries
// ===================================================================================

/**
 * Get user by userId
 */
export const getUser = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query('users')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .first();
  },
});

/**
 * Get multiple users by userIds
 */
export const getUsers = query({
  args: { userIds: v.array(v.string()) },
  handler: async (ctx, { userIds }) => {
    if (userIds.length === 0) return [];

    const users = await Promise.all(
      userIds.map((userId) =>
        ctx.db
          .query('users')
          .withIndex('by_userId', (q) => q.eq('userId', userId))
          .first()
      )
    );

    return users.filter(Boolean);
  },
});

/**
 * Search users by name or email
 */
export const searchUsers = query({
  args: {
    searchTerm: v.string(),
    userType: v.optional(
      v.union(
        v.literal('candidate'),
        v.literal('client'),
        v.literal('partner'),
        v.literal('support')
      )
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { searchTerm, userType, limit = 20 }) => {
    const users = userType
      ? await ctx.db
          .query('users')
          .withIndex('by_userType', (q) => q.eq('userType', userType))
          .collect()
      : await ctx.db.query('users').collect();

    const search = searchTerm.toLowerCase();
    return users
      .filter(
        (u) =>
          u.name?.toLowerCase().includes(search) ||
          u.email?.toLowerCase().includes(search)
      )
      .slice(0, limit);
  },
});

/**
 * Get all users (with optional search and limit)
 */
export const getAllUsers = query({
  args: {
    searchQuery: v.optional(v.string()),
    softLimit: v.optional(v.number()),
  },
  handler: async (ctx, { searchQuery, softLimit = 50 }) => {
    const now = Date.now();
    let users = await ctx.db.query('users').collect();

    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      users = users.filter(
        (u) =>
          u.name?.toLowerCase().includes(search) ||
          u.email?.toLowerCase().includes(search)
      );
    }

    return users.slice(0, softLimit).map((u) => ({
      id: u.userId,
      userType: u.userType,
      userName: u.name,
      email: u.email,
      avatar: u.avatar,
      lastSeen: u.lastSeen ?? 0,
      isOnline: (u.lastSeen ?? 0) > now - 60 * 1000,
    }));
  },
});

/**
 * Get all candidates (excluding current user if provided)
 */
export const getAllCandidates = query({
  args: {
    searchQuery: v.optional(v.string()),
    softLimit: v.optional(v.number()),
    currentUserId: v.optional(v.string()),
  },
  handler: async (ctx, { searchQuery, softLimit = 50, currentUserId }) => {
    const now = Date.now();
    let candidates: any[] = [];

    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      const all = await ctx.db.query('users').collect();

      candidates = all.filter(
        (u) =>
          u.userType === 'candidate' &&
          u.userId !== currentUserId &&
          (u.name?.toLowerCase().includes(search) ||
            u.email?.toLowerCase().includes(search))
      );
    } else {
      candidates = await ctx.db
        .query('users')
        .filter((q) =>
          q.and(
            q.eq(q.field('userType'), 'candidate'),
            q.eq(q.field('isActive'), true),
            q.neq(q.field('userId'), currentUserId)
          )
        )
        .take(softLimit);
    }

    return candidates.map((u) => ({
      id: u.userId,
      userType: u.userType,
      userName: u.name,
      email: u.email,
      avatar: u.avatar,
      lastSeen: u.lastSeen ?? 0,
      isOnline: (u.lastSeen ?? 0) > now - 60 * 1000,
    }));
  },
});

/**
 * Get all online users (within the past 1 minute)
 */
export const getAllOnlineUsers = query({
  args: {
    searchQuery: v.optional(v.string()),
    limit: v.optional(v.number()),
    currentUserId: v.optional(v.string()),
  },
  handler: async (ctx, { searchQuery, limit = 50, currentUserId }) => {
    const oneMinuteAgo = Date.now() - 60 * 1000;
    const candidates = await ctx.db
      .query('users')
      .filter((q) =>
        q.and(
          q.gte(q.field('lastSeen'), oneMinuteAgo),
          q.eq(q.field('userType'), 'candidate'),
          q.neq(q.field('userId'), currentUserId)
        )
      )
      .take(limit);

    const search = searchQuery?.toLowerCase();
    const filtered = candidates.filter((u) =>
      search
        ? u.name?.toLowerCase().includes(search) ||
          u.email?.toLowerCase().includes(search)
        : true
    );

    return filtered.slice(0, limit).map((u) => ({
      id: u.userId,
      userType: u.userType,
      userName: u.name,
      email: u.email,
      avatar: u.avatar,
      lastSeen: u.lastSeen ?? 0,
      isOnline: true,
    }));
  },
});

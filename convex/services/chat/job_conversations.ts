import { v } from 'convex/values';
import { mutation, query } from '../../_generated/server';
import { Id } from '../../_generated/dataModel';

// ============================================================================
// JOB CONVERSATION MANAGEMENT
// ============================================================================

/**
 * Get existing job conversation by application ID
 */
export const getExistingJobConversationByApplicationId = query({
  args: {
    applicationId: v.string(),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db
      .query('conversations')
      .withIndex('by_application', (q) =>
        q.eq('applicationId', args.applicationId)
      )
      .filter((q) => q.eq(q.field('type'), 'job_related'))
      .first();

    return conversation;
  },
});

/**
 * Get job-related messages for a conversation
 */
export const getJobRelatedMessages = query({
  args: {
    conversationId: v.id('conversations'),
    applicationId: v.string(),
    limit: v.optional(v.number()),
    before: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query('messages')
      .withIndex('by_conversation_time', (q) =>
        q.eq('conversationId', args.conversationId)
      );

    if (args.before) {
      query = query.filter((q) => q.lt(q.field('createdAt'), args.before!));
    }

    const messages = await query.order('desc').take(args.limit || 50);

    return messages.reverse();
  },
});

/**
 * Send a job-related message
 */
export const sendJobMessage = mutation({
  args: {
    conversationId: v.id('conversations'),
    senderId: v.string(),
    senderType: v.union(
      v.literal('candidate'),
      v.literal('client'),
      v.literal('partner'),
      v.literal('support')
    ),
    content: v.string(),
    messageType: v.union(
      v.literal('text'),
      v.literal('file'),
      v.literal('image'),
      v.literal('system'),
      v.literal('announcement')
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Get sender name from users table
    const sender = await ctx.db
      .query('users')
      .withIndex('by_userId', (q) => q.eq('userId', args.senderId))
      .first();

    const messageId = await ctx.db.insert('messages', {
      conversationId: args.conversationId,
      senderId: args.senderId,
      senderName: sender?.name || 'Unknown User',
      senderType: args.senderType,
      content: args.content,
      messageType: args.messageType,
      status: 'sent',
      createdAt: now,
      updatedAt: now,
    });

    // Update conversation's lastMessageAt
    await ctx.db.patch(args.conversationId, {
      lastMessageAt: now,
      updatedAt: now,
    });

    return messageId;
  },
});

/**
 * Send a client message
 */
export const sendClientMessage = mutation({
  args: {
    conversationId: v.id('conversations'),
    senderId: v.string(),
    content: v.string(),
    messageType: v.optional(
      v.union(
        v.literal('text'),
        v.literal('file'),
        v.literal('image'),
        v.literal('system'),
        v.literal('announcement')
      )
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Get sender name from users table
    const sender = await ctx.db
      .query('users')
      .withIndex('by_userId', (q) => q.eq('userId', args.senderId))
      .first();

    const messageId = await ctx.db.insert('messages', {
      conversationId: args.conversationId,
      senderId: args.senderId,
      senderName: sender?.name || 'Unknown User',
      senderType: 'client',
      content: args.content,
      messageType: args.messageType || 'text',
      status: 'sent',
      createdAt: now,
      updatedAt: now,
    });

    // Update conversation's lastMessageAt
    await ctx.db.patch(args.conversationId, {
      lastMessageAt: now,
      updatedAt: now,
    });

    return messageId;
  },
});

/**
 * Get client messages
 */
export const getClientMessages = query({
  args: {
    applicationId: v.string(),
    clientId: v.string(),
    hiringManagerId: v.string(),
    limit: v.optional(v.number()),
    before: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // First get the conversation for this application
    const conversation = await ctx.db
      .query('conversations')
      .withIndex('by_application', (q) =>
        q.eq('applicationId', args.applicationId)
      )
      .filter((q) => q.eq(q.field('type'), 'job_related'))
      .first();

    if (!conversation) {
      return [];
    }

    // Get messages for this conversation
    let query = ctx.db
      .query('messages')
      .withIndex('by_conversation_time', (q) =>
        q.eq('conversationId', conversation._id)
      );

    if (args.before) {
      query = query.filter((q) => q.lt(q.field('createdAt'), args.before!));
    }

    const messages = await query.order('desc').take(args.limit || 50);

    return messages.reverse();
  },
});

/**
 * Mark client messages as read
 */
export const markClientMessagesAsRead = mutation({
  args: {
    conversationId: v.id('conversations'),
    userId: v.string(),
    messageIds: v.array(v.id('messages')),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Create read receipts for each message
    for (const messageId of args.messageIds) {
      await ctx.db.insert('messageReadReceipts', {
        messageId,
        conversationId: args.conversationId,
        userId: args.userId,
        userName: 'Client', // This should be fetched from users table
        userType: 'client',
        readAt: now,
      });
    }

    // Update participant's lastReadAt and unreadCount
    const participant = await ctx.db
      .query('conversationParticipants')
      .withIndex('by_conversation_user', (q) =>
        q.eq('conversationId', args.conversationId).eq('userId', args.userId)
      )
      .first();

    if (participant) {
      await ctx.db.patch(participant._id, {
        lastReadAt: now,
        unreadCount: 0, // Reset unread count
      });
    }

    return { success: true };
  },
});

/**
 * Get client job conversations
 */
export const getClientJobConversations = query({
  args: {
    clientId: v.string(),
    hiringManagerId: v.string(),
  },
  handler: async (ctx, args) => {
    const conversations = await ctx.db
      .query('conversations')
      .withIndex('by_hiring_manager', (q) =>
        q.eq('hiringManagerId', args.hiringManagerId)
      )
      .filter((q) =>
        q.and(
          q.eq(q.field('type'), 'job_related'),
          q.eq(q.field('clientId'), args.clientId)
        )
      )
      .collect();

    return conversations;
  },
});

/**
 * Get client unread count
 */
export const getClientUnreadCount = query({
  args: {
    clientId: v.string(),
    hiringManagerId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get all job conversations for this client
    const conversations = await ctx.db
      .query('conversations')
      .withIndex('by_hiring_manager', (q) =>
        q.eq('hiringManagerId', args.hiringManagerId)
      )
      .filter((q) =>
        q.and(
          q.eq(q.field('type'), 'job_related'),
          q.eq(q.field('clientId'), args.clientId)
        )
      )
      .collect();

    // Get total unread count across all conversations
    let totalUnread = 0;
    for (const conversation of conversations) {
      const participant = await ctx.db
        .query('conversationParticipants')
        .withIndex('by_conversation_user', (q) =>
          q
            .eq('conversationId', conversation._id)
            .eq('userId', args.hiringManagerId)
        )
        .first();

      if (participant) {
        totalUnread += participant.unreadCount;
      }
    }

    return totalUnread;
  },
});

/**
 * Get all client job conversations (by clientId only)
 */
export const getAllClientJobConversations = query({
  args: {
    clientId: v.string(),
  },
  handler: async (ctx, args) => {
    const conversations = await ctx.db
      .query('conversations')
      .withIndex('by_type', (q) => q.eq('type', 'job_related'))
      .filter((q) => q.eq(q.field('clientId'), args.clientId))
      .collect();

    return conversations;
  },
});

/**
 * Get all job conversations for a candidate
 */
export const getAllJobConversationsForCandidate = query({
  args: {
    candidateId: v.string(),
  },
  handler: async (ctx, args) => {
    const conversations = await ctx.db
      .query('conversations')
      .withIndex('by_type', (q) => q.eq('type', 'job_related'))
      .filter((q) => q.eq(q.field('candidateId'), args.candidateId))
      .collect();

    return conversations;
  },
});

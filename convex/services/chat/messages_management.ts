import { v } from 'convex/values';
import { mutation, query } from '../../../convex/_generated/server';

// ============================================================================
// MESSAGE MANAGEMENT
// ============================================================================

/**
 * Send a message to a conversation
 */
export const sendMessage = mutation({
  args: {
    conversationId: v.id('conversations'),
    senderId: v.string(),
    senderName: v.optional(v.string()),
    senderType: v.union(
      v.literal('candidate'),
      v.literal('client'),
      v.literal('partner'),
      v.literal('support')
    ),
    content: v.string(),
    messageType: v.optional(
      v.union(
        v.literal('text'),
        v.literal('file'),
        v.literal('image'),
        v.literal('announcement')
      )
    ),
    attachments: v.optional(
      v.array(
        v.object({
          id: v.string(),
          fileName: v.string(),
          fileSize: v.number(),
          fileType: v.string(),
          url: v.string(),
          thumbnailUrl: v.optional(v.string()),
        })
      )
    ),
    replyToMessageId: v.optional(v.id('messages')),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Verify conversation exists and user is a participant
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.status === 'deleted') {
      throw new Error('Conversation not found');
    }

    const userParticipation = await ctx.db
      .query('conversationParticipants')
      .withIndex('by_conversation_user', (q) =>
        q.eq('conversationId', args.conversationId).eq('userId', args.senderId)
      )
      .first();

    if (!userParticipation || !userParticipation.canSendMessages) {
      throw new Error('Permission denied');
    }

    // Get sender name from users table or use provided senderName
    let senderName = args.senderName || '';
    const senderUser = await ctx.db
      .query('users')
      .withIndex('by_userId', (q) => q.eq('userId', args.senderId))
      .first();

    if (senderUser) {
      senderName = senderUser.name;
    } else if (args.senderName) {
      // If sender not in users table but name provided, add to users table
      await ctx.db.insert('users', {
        userId: args.senderId,
        name: args.senderName,
        email: '',
        userType: args.senderType,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
    }

    // Handle reply threading
    let threadRootId = args.replyToMessageId;
    if (args.replyToMessageId) {
      const replyToMessage = await ctx.db.get(args.replyToMessageId);
      if (replyToMessage) {
        threadRootId = replyToMessage.threadRootId || args.replyToMessageId;
      }
    }

    // Insert the message
    const messageId = await ctx.db.insert('messages', {
      conversationId: args.conversationId,
      senderId: args.senderId,
      senderName: senderName,
      senderType: args.senderType,
      content: args.content,
      messageType: args.messageType ?? 'text',
      attachments: args.attachments,
      status: 'sent',
      replyToMessageId: args.replyToMessageId,
      threadRootId,
      createdAt: now,
      updatedAt: now,
    });

    // Update conversation last message time
    await ctx.db.patch(args.conversationId, {
      lastMessageAt: now,
      updatedAt: now,
    });

    // Update unread counts for all other participants
    const allParticipants = await ctx.db
      .query('conversationParticipants')
      .withIndex('by_conversation', (q) =>
        q.eq('conversationId', args.conversationId)
      )
      .filter((q) =>
        q.and(
          q.eq(q.field('status'), 'active'),
          // Don't increment unread count for sender
          q.neq(q.field('userId'), args.senderId),
          // Don't increment if participant is currently viewing the conversation
          q.or(
            q.eq(q.field('lastReadAt'), undefined),
            q.lt(q.field('lastReadAt'), now - 60000) // More than 1 minute since last read
          )
        )
      )
      .collect();

    for (const participant of allParticipants) {
      await ctx.db.patch(participant._id, {
        unreadCount: participant.unreadCount + 1,
      });
    }

    // If this is the first message in the conversation, update the participant's userName
    if (
      userParticipation.userName &&
      userParticipation.userName?.length === 0 &&
      senderName
    ) {
      await ctx.db.patch(userParticipation._id, {
        userName: senderName,
      });
    }

    return messageId;
  },
});

/**
 * Get messages for a conversation
 */
export const getMessages = query({
  args: {
    conversationId: v.id('conversations'),
    userId: v.string(),
    limit: v.optional(v.number()),
    before: v.optional(v.number()), // For pagination
  },
  handler: async (ctx, args) => {
    // Verify user is a participant
    const userParticipation = await ctx.db
      .query('conversationParticipants')
      .withIndex('by_conversation_user', (q) =>
        q.eq('conversationId', args.conversationId).eq('userId', args.userId)
      )
      .first();

    if (!userParticipation || userParticipation.status !== 'active') {
      throw new Error('Access denied');
    }

    let query = ctx.db
      .query('messages')
      .withIndex('by_conversation_time', (q) =>
        q.eq('conversationId', args.conversationId)
      )
      .filter((q) => q.neq(q.field('status'), 'deleted'))
      .order('asc');

    if (args.before) {
      query = query.filter((q) => q.lt(q.field('createdAt'), args.before!));
    }

    const messages = await query.take(args.limit ?? 50);

    // Get read receipts for these messages
    const messageIds = messages.map((m) => m._id);
    const readReceipts = await ctx.db
      .query('messageReadReceipts')
      .filter((q) => messageIds.some((id) => q.eq(q.field('messageId'), id)))
      .collect();

    // Group read receipts by message
    const receiptsByMessage = readReceipts.reduce(
      (acc, receipt) => {
        if (!acc[receipt.messageId]) acc[receipt.messageId] = [];
        acc[receipt.messageId].push(receipt);
        return acc;
      },
      {} as Record<string, any[]>
    );

    // Get replied-to messages for messages that have replyToMessageId
    const replyToMessageIds = messages
      .filter((m) => m.replyToMessageId)
      .map((m) => m.replyToMessageId!)
      .filter((id, index, arr) => arr.indexOf(id) === index); // Remove duplicates

    const repliedToMessages = await Promise.all(
      replyToMessageIds.map((id) => ctx.db.get(id))
    );

    // Create a map of replied-to messages
    const repliedToMessagesMap = repliedToMessages.reduce(
      (acc, message) => {
        if (message) {
          acc[message._id] = message;
        }
        return acc;
      },
      {} as Record<string, any>
    );

    return messages.map((message) => ({
      ...message,
      readReceipts: receiptsByMessage[message._id] || [],
      replyToMessage: message.replyToMessageId
        ? repliedToMessagesMap[message.replyToMessageId]
        : undefined,
    }));
  },
});

/**
 * Mark messages as read
 */
export const markMessagesAsRead = mutation({
  args: {
    conversationId: v.id('conversations'),
    userId: v.string(),
    messageIds: v.optional(v.array(v.id('messages'))), // If not provided, marks all as read
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Verify user is a participant
    const userParticipation = await ctx.db
      .query('conversationParticipants')
      .withIndex('by_conversation_user', (q) =>
        q.eq('conversationId', args.conversationId).eq('userId', args.userId)
      )
      .first();

    if (!userParticipation || userParticipation.status !== 'active') {
      throw new Error('Access denied');
    }

    let messagesToMarkRead: any[] = [];

    if (args.messageIds) {
      // Mark specific messages as read
      messagesToMarkRead = await Promise.all(
        args.messageIds.map((id) => ctx.db.get(id))
      );
      messagesToMarkRead = messagesToMarkRead.filter(Boolean);
    } else {
      // Mark all unread messages as read
      messagesToMarkRead = await ctx.db
        .query('messages')
        .withIndex('by_conversation_time', (q) =>
          q.eq('conversationId', args.conversationId)
        )
        .filter((q) =>
          q.and(
            q.gt(q.field('createdAt'), userParticipation.lastReadAt || 0),
            q.neq(q.field('status'), 'deleted')
          )
        )
        .collect();
    }

    // Create read receipts
    for (const message of messagesToMarkRead) {
      // Check if read receipt already exists
      const existingReceipt = await ctx.db
        .query('messageReadReceipts')
        .withIndex('by_message_user', (q) =>
          q.eq('messageId', message._id).eq('userId', args.userId)
        )
        .first();

      if (!existingReceipt) {
        await ctx.db.insert('messageReadReceipts', {
          messageId: message._id,
          userName: userParticipation.userName
            ? userParticipation.userName[0]
            : undefined,
          conversationId: args.conversationId,
          userId: args.userId,
          userType: userParticipation.userType,
          readAt: now,
        });
      }
    }

    // Update participant's last read time and reset unread count
    await ctx.db.patch(userParticipation._id, {
      lastReadAt: now,
      unreadCount: 0,
    });

    return { success: true, markedCount: messagesToMarkRead.length };
  },
});

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Archive a conversation
 */
export const archiveConversation = mutation({
  args: {
    conversationId: v.id('conversations'),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Check permissions
    const userParticipation = await ctx.db
      .query('conversationParticipants')
      .withIndex('by_conversation_user', (q) =>
        q.eq('conversationId', args.conversationId).eq('userId', args.userId)
      )
      .first();

    if (!userParticipation || !userParticipation.canArchiveConversation) {
      throw new Error('Permission denied');
    }

    const now = Date.now();
    await ctx.db.patch(args.conversationId, {
      status: 'archived',
      archivedAt: now,
      archivedBy: args.userId,
      updatedAt: now,
    });

    return { success: true };
  },
});

/**
 * Get unread message count for a user
 */
export const getUnreadCount = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const participations = await ctx.db
      .query('conversationParticipants')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .filter((q) => q.eq(q.field('status'), 'active'))
      .collect();

    const totalUnread = participations.reduce(
      (sum, p) => sum + p.unreadCount,
      0
    );

    return {
      totalUnread,
      conversationsWithUnread: participations.filter((p) => p.unreadCount > 0)
        .length,
    };
  },
});

import { mutation, query } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';

export const startSupportConversation = mutation({
  args: {
    userId: v.string(),
    userName: v.string(),
    userType: v.union(
      v.literal('candidate'),
      v.literal('client'),
      v.literal('partner')
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // 1. Fetch all active support users
    const supportUsers = await ctx.db
      .query('users')
      .withIndex('by_userType', (q) => q.eq('userType', 'support'))
      .filter((q) => q.eq(q.field('isActive'), true))
      .collect();

    if (supportUsers.length === 0) {
      throw new Error('No active support users found');
    }

    // 2. Create conversation
    const conversationId: Id<'conversations'> = await ctx.db.insert(
      'conversations',
      {
        type: 'support',
        title: `Support & ${args.userName}`,
        description: 'This is a private support chat',
        status: 'active',
        isPublic: false,
        allowFileSharing: true,
        allowVideoCall: false,
        createdBy: args.userId,
        createdAt: now,
        updatedAt: now,
      }
    );

    // 3. Add the requesting user
    await ctx.db.insert('conversationParticipants', {
      conversationId,
      userId: args.userId,
      userName: args.userName,
      userType: args.userType,
      role: 'member',
      status: 'active',
      canSendMessages: true,
      canAddParticipants: false,
      canRemoveParticipants: false,
      canArchiveConversation: false,
      joinedAt: now,
      unreadCount: 0,
    });

    // 4. Add all support users as admin participants
    for (const supportUser of supportUsers) {
      await ctx.db.insert('conversationParticipants', {
        conversationId,
        userId: supportUser.userId,
        userName: supportUser.name,
        userType: 'support',
        role: 'admin',
        status: 'active',
        canSendMessages: true,
        canAddParticipants: true,
        canRemoveParticipants: true,
        canArchiveConversation: true,
        joinedAt: now,
        unreadCount: 1,
      });
    }

    // 5. Add initial system message
    await ctx.db.insert('messages', {
      conversationId,
      senderId: 'system',
      senderName: 'System',
      senderType: 'support',
      content: `${args.userName}`,
      messageType: 'system',
      status: 'sent',
      createdAt: now,
      updatedAt: now,
      systemMessageType: 'conversation_created',
      systemMessageData: {
        createdBy: args.userId,
        creatorName: args.userName,
        conversationType: 'support',
      },
    });

    return { success: true, conversationId };
  },
});

// ============================================================================
// ANONYMOUS CHAT FUNCTIONS
// ============================================================================

/**
 * Create an anonymous message from a non-logged-in user
 */
export const createAnonymousChat = mutation({
  args: {
    sessionId: v.string(),
    content: v.string(),
    recipientEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    let conversationId: Id<'conversations'> | null = null;

    const existingConversation = await ctx.db
      .query('conversations')
      .filter((q) =>
        q.eq(q.field('metadata.anonymousSessionId'), args.sessionId)
      )
      .first();

    if (existingConversation) {
      conversationId = existingConversation._id;
    } else {
      // ✅ Fetch all active support users
      const supportUsers = await ctx.db
        .query('users')
        .withIndex('by_userType', (q) => q.eq('userType', 'support')) // assumes you have this index
        .filter((q) => q.eq(q.field('isActive'), true))
        .collect();

      // Fallback: create a default support user if none found
      let finalSupportUsers = supportUsers;
      if (supportUsers.length === 0) {
        const supportUserId = await ctx.db.insert('users', {
          userId: `support-${Date.now()}`,
          name: 'Teamcast Support',
          email: args.recipientEmail,
          userType: 'support',
          isActive: true,
          createdAt: now,
          updatedAt: now,
        });
        const newSupportUser = await ctx.db.get(supportUserId);
        if (!newSupportUser) {
          throw new Error('Failed to create fallback support user.');
        }
        finalSupportUsers = [newSupportUser];
      }

      // ✅ Create the conversation
      conversationId = await ctx.db.insert('conversations', {
        type: 'support',
        title: 'Anonymous User',
        description: 'Support chat from anonymous user',
        status: 'active',
        isPublic: false,
        allowFileSharing: false,
        allowVideoCall: false,
        createdBy: `anonymous-${args.sessionId}`,
        lastMessageAt: now,
        createdAt: now,
        updatedAt: now,
        metadata: {
          anonymousSessionId: args.sessionId,
          isAnonymous: true,
        },
      });

      // ✅ Add all support users as participants
      for (const supportUser of finalSupportUsers) {
        await ctx.db.insert('conversationParticipants', {
          conversationId,
          userId: supportUser.userId,
          userName: supportUser.name,
          userType: 'support',
          role: 'admin',
          status: 'active',
          canSendMessages: true,
          canAddParticipants: true,
          canRemoveParticipants: true,
          canArchiveConversation: true,
          unreadCount: 0,
          joinedAt: now,
        });
      }

      // ✅ Add anonymous user as participant
      await ctx.db.insert('conversationParticipants', {
        conversationId,
        userId: `anonymous-${args.sessionId}`,
        userName: 'Anonymous User',
        userType: 'anonymous',
        role: 'member',
        status: 'active',
        canSendMessages: true,
        canAddParticipants: false,
        canRemoveParticipants: false,
        canArchiveConversation: false,
        unreadCount: 0,
        joinedAt: now,
      });
    }
    if (!conversationId) {
      throw new Error('Conversation ID should never be null here');
    }

    // ✅ Create the message
    const messageId: Id<'messages'> = await ctx.db.insert('messages', {
      conversationId,
      senderId: `anonymous-${args.sessionId}`,
      senderType: 'anonymous',
      senderName: 'Anonymous User',
      content: args.content,
      messageType: 'text',
      status: 'sent',
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
      metadata: {
        anonymousSessionId: args.sessionId,
        isAnonymous: true,
      },
    });

    // ✅ Update conversation timestamps
    await ctx.db.patch(conversationId, {
      lastMessageAt: now,
      updatedAt: now,
    });

    // ✅ Update unread count for participants (except sender)
    const participants = await ctx.db
      .query('conversationParticipants')
      .withIndex('by_conversation', (q) =>
        q.eq('conversationId', conversationId)
      )
      .filter((q) =>
        q.and(
          q.eq(q.field('status'), 'active'),
          q.neq(q.field('userId'), `anonymous-${args.sessionId}`)
        )
      )
      .collect();

    for (const participant of participants) {
      await ctx.db.patch(participant._id, {
        unreadCount: participant.unreadCount + 1,
      });
    }

    return { success: true, messageId, conversationId };
  },
});

/**
 * Get anonymous chats for support users
 */
export const getAnonymousChats = query({
  args: {
    userType: v.literal('support'),
  },
  handler: async (ctx, args) => {
    // Find the support user by email
    if (args.userType !== 'support') {
      return [];
    }

    // Get all conversations where this user is a participant
    const conversations = await ctx.db
      .query('conversations')
      .filter((q) => q.eq(q.field('type'), 'support'))
      .filter((q) => q.eq(q.field('status'), 'active'))
      .collect();

    // Get the latest message for each conversation
    const conversationsWithLatestMessage = await Promise.all(
      conversations.map(async (conv) => {
        if (!conv) return null;

        const latestMessage = await ctx.db
          .query('messages')
          .withIndex('by_conversation_time', (q) =>
            q.eq('conversationId', conv._id)
          )
          .order('desc')
          .first();

        return {
          _id: conv._id,
          title: conv.title,
          type: conv.type,
          description: conv.description,
          createdAt: conv.createdAt,
          lastMessageAt: conv.lastMessageAt,
          latestMessage: latestMessage
            ? {
                content: latestMessage.content,
                senderId: latestMessage.senderId,
                senderName: latestMessage.senderName,
                createdAt: latestMessage.createdAt,
              }
            : null,
        };
      })
    );

    return conversationsWithLatestMessage.filter(Boolean);
  },
});

/**
 * Clean up expired anonymous chat sessions (older than 24 hours)
 */
export const cleanupExpiredAnonymousSessions = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    // Find all anonymous conversations older than 24 hours
    const expiredConversations = await ctx.db
      .query('conversations')
      .filter((q) =>
        q.and(
          q.eq(q.field('type'), 'support'),
          q.eq(q.field('metadata.isAnonymous'), true),
          q.lt(q.field('updatedAt'), oneDayAgo)
        )
      )
      .collect();

    // Delete all related data for each expired conversation
    for (const conversation of expiredConversations) {
      // Delete messages
      const messages = await ctx.db
        .query('messages')
        .withIndex('by_conversation', (q) =>
          q.eq('conversationId', conversation._id)
        )
        .collect();

      for (const message of messages) {
        await ctx.db.delete(message._id);
      }

      // Delete participants
      const participants = await ctx.db
        .query('conversationParticipants')
        .withIndex('by_conversation', (q) =>
          q.eq('conversationId', conversation._id)
        )
        .collect();

      for (const participant of participants) {
        await ctx.db.delete(participant._id);
      }

      // Delete the conversation itself
      await ctx.db.delete(conversation._id);
    }

    return expiredConversations.length;
  },
});

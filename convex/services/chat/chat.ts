import { v } from 'convex/values';
import { mutation, query, action } from '../../_generated/server';
import { Id } from '../../_generated/dataModel';

// ============================================================================
// CONVERSATION MANAGEMENT
// ============================================================================

/**
 * Create a new conversation
 */
export const createConversation = mutation({
  args: {
    type: v.union(
      v.literal('direct'),
      v.literal('job_related'),
      v.literal('support'),
      v.literal('community'),
      v.literal('internal')
    ),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    jobPostingId: v.optional(v.string()),
    hiringManagerId: v.optional(v.string()),
    candidateId: v.optional(v.string()),
    clientId: v.optional(v.string()),
    applicationId: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
    allowFileSharing: v.optional(v.boolean()),
    allowVideoCall: v.optional(v.boolean()),
    participants: v.array(
      v.object({
        userId: v.string(),
        userName: v.optional(v.string()),
        userType: v.union(
          v.literal('candidate'),
          v.literal('client'),
          v.literal('partner'),
          v.literal('support')
        ),
        role: v.optional(
          v.union(
            v.literal('admin'),
            v.literal('moderator'),
            v.literal('member'),
            v.literal('observer')
          )
        ),
      })
    ),
    partnerId: v.optional(v.string()),
    supportId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Get the first participant as creator (typically the one initiating the chat)
    const creator = args.participants[0];
    if (!creator) {
      throw new Error('At least one participant is required');
    }

    // Create the conversation
    const conversationId = await ctx.db.insert('conversations', {
      type: args.type,
      title: args.title,
      description: args.description,
      jobPostingId: args.jobPostingId,
      hiringManagerId: args.hiringManagerId,
      candidateId: args.candidateId,
      clientId: args.clientId,
      applicationId: args.applicationId,
      status: 'active',
      isPublic: args.isPublic ?? false,
      allowFileSharing: args.allowFileSharing ?? true,
      allowVideoCall: args.allowVideoCall ?? true,
      createdBy: args.hiringManagerId || '',
      createdAt: now,
      updatedAt: now,
    });

    // Add all participants and ensure they're in the users table
    for (const participant of args.participants) {
      // Check if user exists in users table
      const existingUser = await ctx.db
        .query('users')
        .withIndex('by_userId', (q) => q.eq('userId', participant.userId))
        .first();

      // If user doesn't exist or we have a userName, update the users table
      if (!existingUser || participant.userName) {
        // Prepare user data based on user type
        const userData: any = {
          userId: participant.userId,
          name: participant.userName || existingUser?.name || 'Unknown User',
          userType: participant.userType,
          isActive: true,
          updatedAt: now,
        };

        // Set type-specific ID fields based on user type
        if (participant.userType === 'candidate' && args.candidateId) {
          userData.candidateId = args.candidateId;
        } else if (participant.userType === 'client' && args.clientId) {
          userData.clientId = args.clientId;
        } else if (participant.userType === 'partner' && args.partnerId) {
          userData.partnerId = args.partnerId;
        } else if (participant.userType === 'support' && args.supportId) {
          userData.supportId = args.supportId;
        }

        if (existingUser) {
          // Update existing user
          await ctx.db.patch(existingUser._id, userData);
        } else {
          // Create new user - email is required but we don't have it
          // This is a limitation - in a real app, you'd need to get email from auth
          await ctx.db.insert('users', {
            ...userData,
            email: `user-${participant.userId}@placeholder.com`, // Placeholder email
            createdAt: now,
          });
        }
      }

      // Get user name from users table or use provided userName
      let userName = participant.userName || '';
      if (!userName && existingUser) {
        userName = existingUser.name;
      }

      // Add participant to conversation
      await ctx.db.insert('conversationParticipants', {
        conversationId,
        userId: participant.userId,
        userName: userName,
        userType: participant.userType,
        isOnline: false, // Default to offline, will be updated by presence system
        role: participant.role ?? 'member',
        status: 'active',
        canSendMessages: true,
        canAddParticipants: participant.role === 'admin',
        canRemoveParticipants: participant.role === 'admin',
        canArchiveConversation: participant.role === 'admin',
        lastReadAt: now,
        unreadCount: 0,
        joinedAt: now,
        addedBy: creator.userId,
      });
    }

    // Get creator's name from users table
    let creatorName = creator.userName || 'System';
    const creatorUser = await ctx.db
      .query('users')
      .withIndex('by_userId', (q) => q.eq('userId', creator.userId))
      .first();

    if (creatorUser) {
      creatorName = creatorUser.name;
    }

    // Create a system message for conversation creation
    await ctx.db.insert('messages', {
      conversationId,
      senderId: 'system',
      senderName: 'System',
      senderType: 'system',
      content: `Conversation created by ${creatorName}`,
      messageType: 'system',
      status: 'sent',
      createdAt: now,
      updatedAt: now,
      systemMessageType: 'conversation_created',
      systemMessageData: {
        createdBy: creator.userId,
        creatorName,
        conversationType: args.type,
      },
    });

    return conversationId;
  },
});

/**
 * Get conversations for a user
 */
export const getUserConversations = query({
  args: {
    userId: v.string(),
    userType: v.union(
      v.literal('candidate'),
      v.literal('client'),
      v.literal('partner'),
      v.literal('support')
    ),
    candidateId: v.optional(v.string()),
    clientId: v.optional(v.string()),
    clientUserId: v.optional(v.string()),
    type: v.optional(
      v.union(
        v.literal('direct'),
        v.literal('job_related'),
        v.literal('support'),
        v.literal('community'),
        v.literal('internal')
      )
    ),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const participations = await ctx.db
      .query('conversationParticipants')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .filter((q) => q.eq(q.field('status'), 'active'))
      .collect();
    const conversationIds = [
      ...new Set(participations.map((p) => p.conversationId)),
    ];

    const conversations = await Promise.all(
      conversationIds.map(async (id) => {
        const conversation = await ctx.db.get(id);
        if (!conversation || conversation.status === 'deleted') return null;
        if (args.type && conversation.type !== args.type) return null;

        const [lastMessage, participantData] = await Promise.all([
          ctx.db
            .query('messages')
            .withIndex('by_conversation_time', (q) =>
              q.eq('conversationId', id)
            )
            .order('desc')
            .first(),
          ctx.db
            .query('conversationParticipants')
            .withIndex('by_conversation', (q) => q.eq('conversationId', id))
            .filter((q) => q.eq(q.field('status'), 'active'))
            .collect(),
        ]);

        const userParticipation = participations.find(
          (p) => p.conversationId === id
        );

        const otherParticipants = participantData
          .filter((p) => p.userId !== args.userId)
          .map((p) => ({
            id: p.userId,
            userType: p.userType,
            role: p.role,
          }));

        return {
          ...conversation,
          lastMessage,
          participantCount: participantData.length,
          unreadCount: userParticipation?.unreadCount ?? 0,
          userRole: userParticipation?.role,
          isOnline: userParticipation?.isOnline ?? false,
          otherParticipants,
        };
      })
    );

    const validConversations = conversations
      .filter((c) => c !== null)
      .sort((a, b) => {
        const aTime = a?.lastMessage?.createdAt ?? a?.createdAt ?? 0;
        const bTime = b?.lastMessage?.createdAt ?? b?.createdAt ?? 0;
        return bTime - aTime;
      });
    const limit = args.limit ?? 50;
    const offset = args.offset ?? 0;

    return validConversations.slice(offset, offset + limit);
  },
});

/**
 * Get conversation details with participants
 */
export const getConversation = query({
  args: {
    conversationId: v.id('conversations'),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Check if user is a participant
    const userParticipation = await ctx.db
      .query('conversationParticipants')
      .withIndex('by_conversation_user', (q) =>
        q.eq('conversationId', args.conversationId).eq('userId', args.userId)
      )
      .first();

    if (!userParticipation || userParticipation.status !== 'active') {
      throw new Error('Access denied');
    }

    // Get all participants
    const participants = await ctx.db
      .query('conversationParticipants')
      .withIndex('by_conversation', (q) =>
        q.eq('conversationId', args.conversationId)
      )
      .filter((q) => q.eq(q.field('status'), 'active'))
      .collect();

    return {
      ...conversation,
      participants,
      userRole: userParticipation.role,
      userPermissions: {
        canSendMessages: userParticipation.canSendMessages,
        canAddParticipants: userParticipation.canAddParticipants,
        canRemoveParticipants: userParticipation.canRemoveParticipants,
        canArchiveConversation: userParticipation.canArchiveConversation,
      },
    };
  },
});

/**
 * Get conversation participants for display purposes
 */
export const getConversationParticipants = query({
  args: {
    conversationId: v.id('conversations'),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user is a participant
    const userParticipation = await ctx.db
      .query('conversationParticipants')
      .withIndex('by_conversation_user', (q) =>
        q.eq('conversationId', args.conversationId).eq('userId', args.userId)
      )
      .first();

    if (!userParticipation || userParticipation.status !== 'active') {
      throw new Error('Access denied');
    }

    // Get all participants
    const participants = await ctx.db
      .query('conversationParticipants')
      .withIndex('by_conversation', (q) =>
        q.eq('conversationId', args.conversationId)
      )
      .filter((q) => q.eq(q.field('status'), 'active'))
      .collect();

    return participants.map((participant) => ({
      id: participant.userId,
      userType: participant.userType,
      role: participant.role,
      joinedAt: participant.joinedAt,
      lastReadAt: participant.lastReadAt,
    }));
  },
});

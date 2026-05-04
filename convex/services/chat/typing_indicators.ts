import { v } from "convex/values";
import { mutation, query } from "../../../convex/_generated/server";

// ============================================================================
// TYPING INDICATORS
// ============================================================================

/**
 * Start typing in a conversation
 * This sends a typing indicator to other participants in the conversation
 */
export const startTyping = mutation({
    args: {
      conversationId: v.id('conversations'),
      userId: v.string(),
      userType: v.union(
        v.literal('candidate'),
        v.literal('client'),
        v.literal('partner'),
        v.literal('support')
      ),
    },
    handler: async (ctx, args) => {
      const now = Date.now();
  
      // Check if user is a participant in the conversation
      const participant = await ctx.db
        .query('conversationParticipants')
        .withIndex('by_conversation_user', (q) =>
          q.eq('conversationId', args.conversationId).eq('userId', args.userId)
        )
        .first();
  
      if (!participant) {
        throw new Error('User is not a participant in this conversation');
      }
  
      // Get user info
      const user = await ctx.db
        .query('users')
        .withIndex('by_userId', (q) => q.eq('userId', args.userId))
        .first();
  
      // Store typing indicator with expiration (30 seconds)
      const typingId = await ctx.db.insert('typingIndicators', {
        conversationId: args.conversationId,
        userId: args.userId,
        userType: args.userType,
        displayName: user?.name || '',
        startedAt: now,
        expiresAt: now + 30000, // 30 seconds from now
      });
  
      return typingId;
    },
  });
  
  /**
   * Stop typing in a conversation
   * This removes the typing indicator for the user
   */
  export const stopTyping = mutation({
    args: {
      conversationId: v.id('conversations'),
      userId: v.string(),
    },
    handler: async (ctx, args) => {
      // Find and delete any typing indicators for this user in this conversation
      const typingIndicators = await ctx.db
        .query('typingIndicators')
        .withIndex('by_conversation_user', (q) =>
          q.eq('conversationId', args.conversationId).eq('userId', args.userId)
        )
        .collect();
  
      // Delete all found typing indicators
      for (const indicator of typingIndicators) {
        await ctx.db.delete(indicator._id);
      }
  
      return { success: true };
    },
  });
  
  /**
   * Get users who are currently typing in a conversation
   */
  export const getTypingUsers = query({
    args: {
      conversationId: v.id('conversations'),
    },
    handler: async (ctx, args) => {
      const now = Date.now();
  
      // Get all typing indicators for this conversation that haven't expired
      const typingIndicators = await ctx.db
        .query('typingIndicators')
        .withIndex('by_conversation', (q) =>
          q.eq('conversationId', args.conversationId)
        )
        .filter((q) => q.gt(q.field('expiresAt'), now))
        .collect();
  
      // Return the typing users
      return typingIndicators.map((indicator) => ({
        userId: indicator.userId,
        userType: indicator.userType,
        displayName: indicator.displayName,
        startedAt: indicator.startedAt,
      }));
    },
  });
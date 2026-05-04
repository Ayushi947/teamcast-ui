import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';
import { logger } from '@/lib/logger';
import { useState, useEffect, useRef, useCallback } from 'react';
import convexClient from '@/lib/convex';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type ConvexUserType =
  | 'candidate'
  | 'client'
  | 'partner'
  | 'support'
  | 'anonymous';

export type SupportInitiatorType = 'candidate' | 'client' | 'partner';

export type ConversationType =
  | 'direct'
  | 'job_related'
  | 'support'
  | 'community'
  | 'internal';

export type MessageType = 'text' | 'file' | 'image' | 'system' | 'announcement';

export type PostType =
  | 'discussion'
  | 'experience_sharing'
  | 'job_tip'
  | 'question'
  | 'announcement'
  | 'resource_sharing';

export type InteractionType =
  | 'like'
  | 'dislike'
  | 'share'
  | 'bookmark'
  | 'report';

export interface ChatParticipant {
  userId: string;
  userType: ConvexUserType;
  role?: 'admin' | 'moderator' | 'member' | 'observer';
}

export interface MessageAttachment {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  url: string;
  thumbnailUrl?: string;
}

export interface CreateConversationArgs {
  type: ConversationType;
  title?: string;
  description?: string;
  jobPostingId?: string;
  hiringManagerId?: string;
  isPublic?: boolean;
  allowFileSharing?: boolean;
  allowVideoCall?: boolean;
  participants: ChatParticipant[];
}

export interface SendMessageArgs {
  conversationId: Id<'conversations'>;
  senderId: string;
  senderType: ConvexUserType;
  content: string;
  messageType?: MessageType;
  attachments?: MessageAttachment[];
  replyToMessageId?: Id<'messages'>;
}

export interface CreatePostArgs {
  authorId: string;
  authorType: ConvexUserType;
  title: string;
  content: string;
  postType: PostType;
  tags: string[];
  category?: string;
}

// ============================================================================
// CONVERSATION HOOKS
// ============================================================================

/**
 * Hook to create a new conversation
 */
export const useCreateConversation = () => {
  return useMutation(api.services.chat.chat.createConversation);
};

/**
 * Hook to get user's conversations
 */
export const useGetUserConversations = (
  userId: string,
  userType: ConvexUserType,
  candidateId?: string,
  clientId?: string,
  clientUserId?: string,
  type?: ConversationType,
  limit?: number,
  offset?: number
) => {
  const result = useQuery(api.services.chat.chat.getUserConversations, {
    userId,
    userType: userType as ConvexUserType as
      | 'candidate'
      | 'client'
      | 'partner'
      | 'support',
    candidateId,
    clientId,
    clientUserId,
    type,
    limit,
    offset,
  });
  const isLoading = result === undefined;
  return {
    data: result ?? [],
    isLoading,
  };
};

/**
 * Get Support Conversation
 * @param userType
 * @returns
 */
export const useGetSupportConversation = (userType: ConvexUserType) => {
  const result = useQuery(
    api.services.chat.support_conversation.getAnonymousChats,
    {
      userType: userType as ConvexUserType as 'support',
    }
  );

  const isLoading = result === undefined;

  return {
    data: result ?? [],
    isLoading,
  };
};

/**
 * Hook to get conversation details
 */
export const useGetConversation = (
  conversationId: Id<'conversations'>,
  userId: string
) => {
  return useQuery(api.services.chat.chat.getConversation, {
    conversationId,
    userId,
  });
};

/**
 * Hook to get conversation participants
 */
export const useGetConversationParticipants = (
  conversationId: Id<'conversations'>,
  userId: string
) => {
  return useQuery(api.services.chat.chat.getConversationParticipants, {
    conversationId,
    userId,
  });
};

// ============================================================================
// MESSAGE HOOKS
// ============================================================================

/**
 * Hook to send a message
 */
export const useSendMessage = () => {
  return useMutation(api.services.chat.messages_management.sendMessage);
};

/**
 * Hook to get messages for a conversation
 */
export const useGetMessages = (
  conversationId?: Id<'conversations'>,
  userId?: string,
  limit?: number,
  before?: number
) => {
  const shouldFetch = conversationId && userId;
  logger.info('userid', userId);
  return useQuery(
    api.services.chat.messages_management.getMessages,
    shouldFetch
      ? {
          conversationId,
          userId,
          limit,
          before,
        }
      : 'skip'
  );
};

/**
 * Hook to mark messages as read
 */
export const markMessagesAsRead = async (
  conversationId: Id<'conversations'>,
  userId: string,
  messageIds?: Id<'messages'>[]
): Promise<
  { success: true; markedCount: number } | { success: false; error: string }
> => {
  try {
    const result = await convexClient.mutation(
      api.services.chat.messages_management.markMessagesAsRead,
      {
        conversationId,
        userId,
        messageIds,
      }
    );

    return {
      success: true,
      markedCount: result.markedCount,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Hook to get unread message count
 */
export const useGetUnreadCount = (userId: string) => {
  return useQuery(api.services.chat.messages_management.getUnreadCount, {
    userId,
  });
};

// ============================================================================
// COMMUNITY HOOKS
// ============================================================================

/**
 * Hook to create a community post
 */
export const useCreateCommunityPost = () => {
  return useMutation(api.services.chat.community_posts.createCommunityPost);
};

/**
 * Hook to get community posts
 */
export const useGetCommunityPosts = (
  postType?: PostType,
  limit?: number,
  offset?: number
) => {
  return useQuery(api.services.chat.community_posts.getCommunityPosts, {
    postType,
    limit,
    offset,
  });
};

/**
 * Hook to interact with a post
 */
export const useInteractWithPost = () => {
  return useMutation(api.services.chat.community_posts.interactWithPost);
};

/**
 * Hook to get chat settings for a user
 */
export const useGetChatSettings = (
  userId: string,
  userType: ConvexUserType
) => {
  return useQuery(api.services.chat.chat_settings.getChatSettings, {
    userId,
    userType: userType as ConvexUserType as
      | 'candidate'
      | 'client'
      | 'partner'
      | 'support',
  });
};

/**
 * Hook to update chat settings
 */
export const useUpdateChatSettings = () => {
  return useMutation(api.services.chat.chat_settings.updateChatSettings);
};

/**
 * Hook to archive a conversation
 */
export const useArchiveConversation = () => {
  return useMutation(api.services.chat.messages_management.archiveConversation);
};

/**
 * Hook to increment post view count
 */
export const useIncrementPostViewCount = () => {
  return useMutation(api.services.chat.community_posts.incrementPostViewCount);
};

/**
 * Hook to add comment to a post
 */
export const useAddComment = () => {
  return useMutation(api.services.chat.community_posts.addComment);
};

/**
 * Hook to get comments for a specific post
 */
export const useGetPostComments = (postId: string) => {
  return useQuery(api.services.chat.community_posts.getPostComments, {
    postId: postId as Id<'communityPosts'>,
  });
};

/**
 * Hook to update user's last seen timestamp
 * This is used to track user online status
 */

export const useUserUpdateLastSeen = () => {
  const updateLastSeen = useMutation(
    api.services.users.users_service.updateLastSeen
  );

  return {
    updateLastSeen,
  };
};
/**
 * Hook to manage typing indicators for a conversation
 */
export function useTypingIndicator(
  conversationId: Id<'conversations'>,
  userId: string,
  userType: ConvexUserType
) {
  const startTypingMutation = useMutation(
    api.services.chat.typing_indicators.startTyping
  );
  const stopTypingMutation = useMutation(
    api.services.chat.typing_indicators.stopTyping
  );

  // Query for users who are currently typing
  const typingUsersData = useQuery(
    api.services.chat.typing_indicators.getTypingUsers,
    {
      conversationId,
    }
  );

  // Filter out the current user from typing indicators
  const typingUsers = typingUsersData
    ? typingUsersData
        .filter((user) => user.userId !== userId)
        .map((user) => ({
          userId: user.userId,
          userType: user.userType as ConvexUserType,
          displayName: user.displayName,
        }))
    : [];

  // Improved debouncing with useRef and useState
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount or conversation change
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }

      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }

      // Stop typing when component unmounts or conversation changes
      if (isTyping) {
        stopTypingMutation({ conversationId, userId }).catch((error) => {
          logger.error('Error stopping typing indicator on unmount:', error);
        });
        setIsTyping(false);
      }
    };
  }, [conversationId, userId, stopTypingMutation, isTyping]);

  const startTyping = useCallback(() => {
    // If already marked as typing, just clear the auto-stop timeout
    if (isTyping) {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    } else {
      // Set typing state to true
      setIsTyping(true);

      // Send typing start event
      startTypingMutation({
        conversationId,
        userId,
        userType: userType as ConvexUserType as
          | 'candidate'
          | 'client'
          | 'partner'
          | 'support',
      }).catch((error) => {
        logger.error('Error starting typing indicator:', error);
        setIsTyping(false);
      });

      // Set up heartbeat to keep typing status active
      // Server expires after 30 seconds, so send update every 20 seconds
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }

      heartbeatIntervalRef.current = setInterval(() => {
        if (isTyping) {
          startTypingMutation({
            conversationId,
            userId,
            userType: userType as ConvexUserType as
              | 'candidate'
              | 'client'
              | 'partner'
              | 'support',
          }).catch((error) => {
            logger.error('Error refreshing typing indicator:', error);
          });
        }
      }, 20000);
    }

    // Set timeout to automatically stop typing after 5 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 5000);
  }, [conversationId, userId, userType, isTyping, startTypingMutation]);

  const stopTyping = useCallback(() => {
    // Clear any existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    // Clear heartbeat interval
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }

    // Only send stop event if we were typing
    if (isTyping) {
      // Send typing stop event
      stopTypingMutation({
        conversationId,
        userId,
      }).catch((error) => {
        logger.error('Error stopping typing indicator:', error);
      });

      setIsTyping(false);
    }
  }, [conversationId, userId, stopTypingMutation, isTyping]);

  return {
    typingUsers,
    startTyping,
    stopTyping,
    isTyping,
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Helper function to create direct chat between users
 */
export const createDirectChat = async (
  createConversation: any,
  initiatorId: string,
  initiatorName: string,
  initiatorType: ConvexUserType,
  participantId: string,
  participantName: string,
  participantType: ConvexUserType,
  title?: string
) => {
  try {
    const conversationId = await createConversation({
      type: 'direct',
      title: title || 'Direct Message',
      isPublic: false,
      allowFileSharing: true,
      allowVideoCall: true,
      participants: [
        {
          userId: initiatorId,
          userType: initiatorType,
          role: 'member',
          userName: initiatorName,
        },
        {
          userId: participantId,
          userType: participantType,
          role: 'member',
          userName: participantName,
        },
      ],
    });
    return { success: true, conversationId };
  } catch (error) {
    logger.error('Error creating direct chat:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Helper function to create support chat
 * @param userId - The ID of the user initiating the chat
 * @param userName - The name of the user initiating the chat
 * @param userType - The type of the user initiating the chat
 * @returns {success: boolean, conversationId: Id<'conversations'>}
 */
export const createSupportChat = async (
  userId: string,
  userName: string,
  userType: ConvexUserType
) => {
  try {
    const result = await convexClient.mutation(
      api.services.chat.support_conversation.startSupportConversation,
      {
        userId,
        userName,
        userType: userType as SupportInitiatorType,
      }
    );

    return {
      success: true,
      conversationId: result.conversationId,
    };
  } catch (error) {
    logger.error('Error starting support conversation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Helper function to create internal team chat
 */
export const createInternalChat = async (
  createConversation: any,
  creatorId: string,
  creatorType: ConvexUserType,
  participants: ChatParticipant[],
  title: string,
  description?: string
) => {
  // Ensure creator is in participants list
  const allParticipants = [
    { userId: creatorId, userType: creatorType, role: 'admin' as const },
    ...participants.filter((p) => p.userId !== creatorId),
  ];

  try {
    const conversationId = await createConversation({
      type: 'internal',
      title,
      description,
      isPublic: false,
      allowFileSharing: true,
      allowVideoCall: true,
      participants: allParticipants,
    });
    return { success: true, conversationId };
  } catch (error) {
    logger.error('Error creating internal chat:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Helper function to format message timestamp
 */
export const formatMessageTime = (timestamp: number): string => {
  const now = new Date();
  const messageDate = new Date(timestamp);
  const diffInMinutes = Math.floor(
    (now.getTime() - messageDate.getTime()) / (1000 * 60)
  );

  if (diffInMinutes < 1) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInMinutes < 1440) {
    // Less than 24 hours
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours}h ago`;
  } else {
    return messageDate.toLocaleDateString();
  }
};

/**
 * Helper function to get conversation display name
 */
export const getConversationDisplayName = (
  conversation: any,
  currentUserId: string
): string => {
  if (conversation.title) {
    return conversation.title;
  }

  if (conversation.type === 'direct') {
    // For direct messages, show the other participant's name
    const otherParticipant = conversation.participants?.find(
      (p: any) => p.userId !== currentUserId
    );
    return otherParticipant?.name || 'Direct Message';
  }

  if (conversation.type === 'job_related') {
    return 'Job Application Chat';
  }

  if (conversation.type === 'support') {
    return 'Support Chat';
  }

  return 'Chat';
};

/**
 * Helper function to determine if user can send messages in conversation
 */
export const canSendMessages = (conversation: any, userId: string): boolean => {
  if (!conversation || !conversation.participants) {
    return false;
  }

  const userParticipation = conversation.participants.find(
    (p: any) => p.userId === userId
  );

  return userParticipation?.canSendMessages ?? false;
};

/**
 * Helper function to get conversation type icon
 */
export const getConversationTypeIcon = (type: ConversationType): string => {
  switch (type) {
    case 'direct':
      return '💬';
    case 'job_related':
      return '💼';
    case 'support':
      return '🎧';
    case 'community':
      return '👥';
    case 'internal':
      return '🏢';
    default:
      return '💬';
  }
};

/**
 * Helper function to create community post with validation
 */
export const createPost = async (
  createCommunityPost: any,
  postData: CreatePostArgs
) => {
  // Basic validation
  if (!postData.title.trim() || !postData.content.trim()) {
    return { success: false, error: 'Title and content are required' };
  }

  if (postData.tags.length === 0) {
    return { success: false, error: 'At least one tag is required' };
  }

  try {
    const postId = await createCommunityPost(postData);
    return { success: true, postId };
  } catch (error) {
    logger.error('Error creating community post:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Export all hooks and helpers
 */
export const chatService = {
  // Hooks
  useCreateConversation,
  useGetUserConversations,
  useGetConversation,
  useSendMessage,
  useGetMessages,
  markMessagesAsRead,
  useGetUnreadCount,
  useCreateCommunityPost,
  useGetCommunityPosts,
  useInteractWithPost,
  useGetChatSettings,
  useUpdateChatSettings,
  useArchiveConversation,
  useIncrementPostViewCount,
  useAddComment,
  useGetPostComments,
  useTypingIndicator,
  createSupportChat,
  // Helpers
  createDirectChat,
  createInternalChat,
  formatMessageTime,
  getConversationDisplayName,
  canSendMessages,
  getConversationTypeIcon,
  createPost,
};

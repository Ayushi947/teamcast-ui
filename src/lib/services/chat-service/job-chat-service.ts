import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';

import convexClient from '@/lib/convex';
import { logger } from '@/lib/logger';
import { ConvexUserType } from './chat.service';
import { Id } from '../../../../convex/_generated/dataModel';

/**
 * Helper function to create a job-related chat
 * @param jobPostingId - The ID of the job posting
 * @param jobTitle - The title of the job posting
 * @param candidateId - The ID of the candidate
 * @param candidateName - The name of the candidate
 * @param clientId - The ID of the client
 * @param clientName - The name of the client
 * @param candidateEmail - The email of the candidate
 * @param clientEmail - The email of the client
 * @returns {success: boolean, conversationId: Id<'conversations'>}
 */
export const upsertJobRelatedChat = async (
  jobPostingId: string,
  applicationId: string,
  jobTitle: string,
  candidateId: string,
  candidateUserId: string,
  candidateName: string,
  hiringManagerId: string,
  clientId: string,
  clientName: string
) => {
  try {
    const result = await convexClient.mutation(
      api.services.chat.chat.createConversation,
      {
        type: 'job_related',
        title: jobTitle,
        jobPostingId,
        applicationId,
        candidateId,
        clientId,
        hiringManagerId,
        participants: [
          {
            userId: hiringManagerId,
            userName: clientName,
            userType: 'client' as const,
            role: 'admin' as const,
          },
          {
            userId: candidateUserId,
            userName: candidateName,
            userType: 'candidate' as const,
            role: 'member' as const,
          },
        ],
      }
    );

    return {
      success: true,
      conversationId: result,
    };
  } catch (error) {
    logger.error('Error creating job-related chat:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Hook to get job-related chat conversations
 */
export const useGetExistingChatByApplicationId = (applicationId: string) => {
  const result = useQuery(
    api.services.chat.job_conversations
      .getExistingJobConversationByApplicationId,
    {
      applicationId,
    }
  );

  return result;
};

/**
 * Helper function to send a welcome message in job-related chat
 */
export const sendJobChatWelcomeMessage = async (
  sendMessage: any,
  conversationId: Id<'conversations'>,
  senderId: string,
  senderType: ConvexUserType,
  jobTitle: string
) => {
  const welcomeContent = `Hello! I'm interested in discussing the ${jobTitle} position. Looking forward to connecting with you.`;

  try {
    await sendMessage({
      conversationId,
      senderId,
      senderType,
      content: welcomeContent,
      messageType: 'text',
    });
    return { success: true };
  } catch (error) {
    logger.error('Error sending welcome message:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

export const useGetJobRelatedMessages = (
  conversationId: Id<'conversations'> | null,
  applicationId: string | undefined,
  limit?: number,
  before?: number
) => {
  const shouldFetch = conversationId !== null && applicationId;

  return useQuery(
    api.services.chat.job_conversations.getJobRelatedMessages,
    shouldFetch
      ? {
          conversationId,
          applicationId,
          limit,
          before,
        }
      : 'skip'
  );
};

/**
 * Hook to send a job-related message
 * @returns {success: boolean, error: string}
 */
export const useSendJobMessage = () => {
  return useMutation(api.services.chat.job_conversations.sendJobMessage);
};

/**
 * Hook to send a client message
 * @returns {success: boolean, error: string}
 */
export const useSendClientMessage = () => {
  return useMutation(api.services.chat.job_conversations.sendClientMessage);
};

/**
 * Hook to get client messages
 */
export const useGetClientMessages = (
  applicationId: string | undefined,
  clientId: string | undefined,
  hiringManagerId: string | undefined,
  limit?: number,
  before?: number
) => {
  const shouldFetch = applicationId && clientId && hiringManagerId;

  return useQuery(
    api.services.chat.job_conversations.getClientMessages,
    shouldFetch
      ? {
          applicationId,
          clientId,
          hiringManagerId,
          limit,
          before,
        }
      : 'skip'
  );
};

/**
 * Hook to mark client messages as read
 */
export const useMarkClientMessagesAsRead = () => {
  return useMutation(
    api.services.chat.job_conversations.markClientMessagesAsRead
  );
};

/**
 * Hook to get client job conversations
 */
export const useGetClientJobConversations = (
  clientId: string | undefined,
  hiringManagerId: string | undefined
) => {
  const shouldFetch = clientId && hiringManagerId;

  return useQuery(
    api.services.chat.job_conversations.getClientJobConversations,
    shouldFetch
      ? {
          clientId,
          hiringManagerId,
        }
      : 'skip'
  );
};

/**
 * Hook to get client unread count
 */
export const useGetClientUnreadCount = (
  clientId: string | undefined,
  hiringManagerId: string | undefined
) => {
  const shouldFetch = clientId && hiringManagerId;

  return useQuery(
    api.services.chat.job_conversations.getClientUnreadCount,
    shouldFetch
      ? {
          clientId,
          hiringManagerId,
        }
      : 'skip'
  );
};

/**
 * Hook to get all client job conversations (by clientId only)
 */
export const useGetAllClientJobConversations = (
  clientId: string | undefined
) => {
  return useQuery(
    api.services.chat.job_conversations.getAllClientJobConversations,
    clientId ? { clientId } : 'skip'
  );
};

/**
 * Hook to get all job conversations for a candidate
 */
export const useGetAllJobConversationsForCandidate = (candidateId: string) => {
  return useQuery(
    api.services.chat.job_conversations.getAllJobConversationsForCandidate,
    {
      candidateId,
    }
  );
};

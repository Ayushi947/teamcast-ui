import convexClient from '@/lib/convex';
import { api } from '../../../../convex/_generated/api';
import { logger } from '@/lib/logger';
import { useMutation, useQuery } from 'convex/react';
import { ConvexUserType } from './chat.service';

export const createAnonymousChat = async (
  sessionId: string,
  content: string,
  recipientEmail: string
): Promise<
  | { success: true; messageId: string; conversationId: string }
  | { success: false; error: string }
> => {
  try {
    const result = await convexClient.mutation(
      api.services.chat.support_conversation.createAnonymousChat,
      {
        sessionId,
        content,
        recipientEmail,
      }
    );

    return {
      success: true,
      messageId: result.messageId,
      conversationId: result.conversationId,
    };
  } catch (error) {
    logger.error('Error sending anonymous message:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Hook to get support availability status (for anonymous users).
 * Returns list of support users with their online/away/offline status.
 */
export const useSupportAvailability = () => {
  const supportStatus = useQuery(
    api.services.chat.chat_settings.getSupportAvailability,
    {
      userType: 'anonymous' as ConvexUserType,
    }
  );
  return supportStatus ?? [];
};

// ============================================================================
// SUPPORT CHAT CONFIG HOOKS
// ============================================================================

/**
 * Hook to get support chat config
 */
export function useGetSupportChatConfig() {
  const config = useQuery(api.services.chat.chat_settings.getSupportChatConfig);
  return config ?? null;
}

/**
 * Hook to update support chat config
 */
export function useUpdateSupportChatConfig() {
  const update = useMutation(
    api.services.chat.chat_settings.setSupportChatConfig
  );

  const updateConfig = async ({
    isLive,
    availabilityStatus,
    workingHours,
    updatedBy,
  }: {
    isLive: boolean;
    availabilityStatus: 'online' | 'away' | 'offline';
    workingHours: { start: string; end: string };
    updatedBy: string;
  }) => {
    await update({ isLive, availabilityStatus, workingHours, updatedBy });
  };

  return updateConfig;
}

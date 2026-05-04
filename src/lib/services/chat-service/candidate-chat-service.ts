import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
/**
 * Hook to get all candidate conversations
 */
export const useGetCandidateConversations = (candidateId: string) => {
  const result = useQuery(api.services.chat.chat.getUserConversations, {
    userId: candidateId,
    userType: 'candidate',
  });
  const isLoading = result === undefined;
  return {
    data: result ?? [],
    isLoading,
  };
};

/**
 *
 * @param conversationId
 * @param userId
 * @param limit
 * @param before
 * @returns
 */
export const useGetCandidateConversationMessages = (
  userId?: string,
  limit?: number,
  before?: number
) => {
  const shouldFetch = userId;

  return useQuery(
    api.services.chat.chat.getUserConversations,
    shouldFetch
      ? {
          userId,
          userType: 'candidate',
          limit,
          offset: before,
        }
      : 'skip'
  );
};

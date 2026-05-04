import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';

/**
 *
 * @param currentUserId
 * @param searchQuery
 * @param limit
 * @returns
 */
export const useUserPresence = ({
  currentUserId,
  searchQuery,
  limit = 50,
}: {
  currentUserId: string;
  searchQuery?: string;
  limit?: number;
}) => {
  const result = useQuery(api.services.users.users_service.getAllOnlineUsers, {
    searchQuery,
    limit,
    currentUserId,
  });

  const isLoading = result === undefined;

  return {
    onlineUsers: result ?? [],
    isLoading,
  };
};

/**
 *
 * @param searchQuery
 * @param softLimit
 * @returns
 */
export function useSearchAllUsers(searchQuery: string, softLimit: number = 50) {
  const result = useQuery(api.services.users.users_service.getAllUsers, {
    searchQuery: searchQuery || undefined,
    softLimit,
  });

  const isLoading = result === undefined;

  return {
    data: result ?? [],
    isLoading,
  };
}

/**
 *
 * @param searchQuery
 * @param softLimit
 * @returns
 */
export function useSearchAllCandidates(
  searchQuery: string,
  softLimit: number = 50,
  currentUserId: string
) {
  const result = useQuery(api.services.users.users_service.getAllCandidates, {
    searchQuery: searchQuery || undefined,
    softLimit: softLimit,
    currentUserId: currentUserId,
  });

  const isLoading = result === undefined;

  return {
    data: result ?? [],
    isLoading,
  };
}

/**
 * get candidate online status
 * @param userId - the user id to check
 * @returns true if the user is online, false otherwise
 */
export function useCandidateOnlineStatus(userId: string) {
  const userData = useQuery(api.services.users.users_service.getUser, {
    userId,
  });

  const isLoading = userData === undefined;

  const isCandidateOnline = userData?.lastSeen
    ? new Date(userData.lastSeen) > new Date(Date.now() - 1000 * 60 * 5)
    : false;

  return {
    isCandidateOnline,
    isLoading,
  };
}

import { api } from '../../../convex/_generated/api';
import {
  candidateProfileService,
  clientProfileService,
  partnerProfileService,
} from './services';
import { logger } from '@/lib/logger';
import { useMutation, useQuery } from 'convex/react';
import convexClient from '@/lib/convex';

export type UserType = 'candidate' | 'client' | 'partner' | 'support';

/**
 * Unified user data interface
 */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  userType: UserType;
  avatar?: string;
}

/**
 * Cache for user profiles to avoid repeated API calls
 */
const userProfileCache = new Map<string, UserProfile>();
const cacheTimeout = 5 * 60 * 1000; // 5 minutes
const cacheTimestamps = new Map<string, number>();

/**
 * Hook to get user by userId from Convex
 */
export const useGetUser = (userId: string) => {
  return useQuery(api.services.users.users_service.getUser, { userId });
};

/**
 * Hook to get multiple users by userIds from Convex
 */
export const useGetUsers = (userIds: string[]) => {
  return useQuery(api.services.users.users_service.getUsers, { userIds });
};

/**
 * Hook to search users by name or email
 */
export const useSearchUsers = (
  searchTerm: string,
  userType?: UserType,
  limit?: number
) => {
  return useQuery(api.services.users.users_service.searchUsers, {
    searchTerm,
    userType: userType as UserType,
    limit,
  });
};

/**
 * Hook to create or update a user in Convex
 */
export const useUpsertUser = () => {
  return useMutation(api.services.users.users_service.upsertUser);
};

/**
 * Hook to update a user's name
 */
export const useUpdateUserName = () => {
  return useMutation(api.services.users.users_service.updateUserName);
};

/**
 * Fetch user profile from appropriate service based on user type
 * and sync with Convex users table
 */
export const fetchUserProfile = async (
  userId: string,
  userType: UserType
): Promise<UserProfile | null> => {
  const cacheKey = `${userId}-${userType}`;

  // Check cache first
  const cached = userProfileCache.get(cacheKey);
  const cachedTime = cacheTimestamps.get(cacheKey);

  if (cached && cachedTime && Date.now() - cachedTime < cacheTimeout) {
    return cached;
  }

  try {
    let profile: UserProfile | null = null;

    switch (userType) {
      case 'candidate': {
        const candidateProfile = await candidateProfileService.getProfile();
        if (candidateProfile && candidateProfile.candidateId === userId) {
          profile = {
            id: candidateProfile.candidateId,
            name:
              candidateProfile.name ||
              candidateProfile.email?.split('@')[0] ||
              'Unknown User',
            email: candidateProfile.email || '',
            userType: 'candidate',
            avatar: undefined, // ICandidateProfile doesn't have profilePicture
          };
        }
        break;
      }

      case 'client': {
        // Use the clientProfileService which we know exists
        try {
          const clientProfile = await clientProfileService.getProfile();
          if (clientProfile && clientProfile.id === userId) {
            profile = {
              id: clientProfile.id,
              name:
                clientProfile.basic.name ||
                clientProfile.basic.contactEmail?.split('@')[0] ||
                'Unknown User',
              email: clientProfile.basic.contactEmail || '',
              userType: 'client',
              avatar: undefined, // Assuming no profilePicture property
            };
          }
        } catch (_error) {
          // Failed to fetch client profile - continue with null profile
        }
        break;
      }

      case 'partner': {
        // Use the partnerProfileService which we know exists
        try {
          const partnerProfile = await partnerProfileService.getProfile();
          if (partnerProfile && partnerProfile.id === userId) {
            profile = {
              id: partnerProfile.id,
              name:
                partnerProfile.basic.name ||
                partnerProfile.basic.contactEmail?.split('@')[0] ||
                'Unknown User',
              email: partnerProfile.basic.contactEmail || '',
              userType: 'partner',
              avatar: undefined, // Assuming no profilePicture property
            };
          }
        } catch (_error) {
          // Failed to fetch partner profile - continue with null profile
        }
        break;
      }

      case 'support': {
        profile = {
          id: userId,
          name: `Support User ${userId.slice(-4)}`,
          email: '',
          userType: 'support',
        };
        break;
      }
    }

    // Cache the result
    if (profile) {
      userProfileCache.set(cacheKey, profile);
      cacheTimestamps.set(cacheKey, Date.now());

      // Sync with Convex users table
      try {
        // Use the Convex HTTP client instead of direct fetch
        await convexClient.mutation(
          api.services.users.users_service.upsertUser,
          {
            userId: profile.id,
            name: profile.name,
            email: profile.email,
            userType: profile.userType,
            avatar: profile.avatar,
          }
        );
      } catch (error) {
        logger.error('Failed to sync user with Convex:', error);
      }
    }

    return profile;
  } catch (_error) {
    // Failed to fetch profile - return null
    return null;
  }
};

/**
 * Clear user profile cache
 */
export const clearUserProfileCache = () => {
  userProfileCache.clear();
  cacheTimestamps.clear();
};

/**
 * Get cached user profile if available
 */
export const getCachedUserProfile = (
  userId: string,
  userType: UserType
): UserProfile | null => {
  const cacheKey = `${userId}-${userType}`;
  const cached = userProfileCache.get(cacheKey);
  const cachedTime = cacheTimestamps.get(cacheKey);

  if (cached && cachedTime && Date.now() - cachedTime < cacheTimeout) {
    return cached;
  }

  return null;
};

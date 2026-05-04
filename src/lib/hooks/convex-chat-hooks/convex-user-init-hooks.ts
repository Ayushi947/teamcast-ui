import { ConvexUserType } from '@/lib/services/chat-service/chat.service';
import { api } from '../../../../convex/_generated/api';
import { logger } from '@/lib/logger';
import convexClient from '@/lib/convex';
import { IAuthUser } from '@/lib/shared';

/**
 * Initialize user data in the users table when a user logs in
 * This should be called after authentication is complete
 */
export const initializeUserData = async (user: IAuthUser) => {
  try {
    const currentUser = user;
    if (!currentUser) {
      logger.warn('No current user data found for initialization');
      return false;
    }

    // Extract user ID
    const userId = user?.id;
    if (!userId) {
      logger.error('User ID not found in current user data', {
        user: user,
      });
      return false;
    }

    // Validate required fields
    if (!currentUser.email || !currentUser.type) {
      logger.error('Missing required user fields', {
        email: currentUser.email,
        type: currentUser.type,
      });
      return false;
    }

    // Get user name from various possible fields
    const name =
      user.name ||
      (currentUser as any).fullName ||
      ((currentUser as any).firstName && (currentUser as any).lastName
        ? `${(currentUser as any).firstName} ${(currentUser as any).lastName}`
        : '') ||
      currentUser.email?.split('@')[0] ||
      'User';

    // Normalize user type - convert from UserTypeEnum to ConvexUserType
    const userType = user.type?.toLowerCase() as ConvexUserType;
    if (!['candidate', 'client', 'partner', 'support'].includes(userType)) {
      logger.error('Invalid user type', {
        userType,
        originalType: user.type,
      });
      return false;
    }

    try {
      await convexClient.mutation(api.services.users.users_service.upsertUser, {
        userId: user.id,
        name,
        email: user.email,
        userType: userType as ConvexUserType as
          | 'candidate'
          | 'client'
          | 'partner'
          | 'support',
        avatar: (user as any).avatar || (user as any).profilePicture || '',
        candidateId: user.candidateId || '',
        clientId: user.clientId || '',
        partnerId: user.partnerId || '',
        supportId: user.supportUserId || '',
      });

      return true;
    } catch (convexError) {
      logger.error(
        'Convex mutation error during user initialization:',
        convexError
      );
      return false;
    }
  } catch (error) {
    logger.error('Failed to initialize user data:', error);
    return false;
  }
};

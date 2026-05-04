import { ConvexUserType } from '@/lib/services/chat-service/chat.service';
import { logger } from '@/lib/logger';
import convexClient from '@/lib/convex';
import { api } from '../../../../convex/_generated/api';

// Cache for user data to avoid repeated fetches
const userCache = new Map<string, { name: string; email: string }>();

/**
 * Get current user data from localStorage
 */
export const getCurrentUserData = (): any => {
  try {
    const userDataFromStorage = localStorage.getItem('user');
    if (userDataFromStorage) {
      const userData = JSON.parse(userDataFromStorage);

      // Validate that we have the minimum required fields
      if (userData && userData.id && userData.email && userData.type) {
        return userData;
      } else {
        logger.warn(
          'Invalid user data in localStorage, missing required fields:',
          {
            hasId: !!userData?.id,
            hasEmail: !!userData?.email,
            hasType: !!userData?.type,
            userData,
          }
        );
        return null;
      }
    }
  } catch (error) {
    logger.error('Failed to parse user data from localStorage:', error);
  }

  return null;
};

/**
 * Fetch user data - tries multiple sources for real user information
 */
const fetchUserData = async (
  userId: string
): Promise<{ name: string; email: string }> => {
  // Check cache first
  if (userCache.has(userId)) {
    return userCache.get(userId)!;
  }

  // Try to get user from the users table in Convex
  try {
    const userData = await convexClient.query(
      api.services.users.users_service.getUser,
      {
        userId,
      }
    );

    if (userData && userData.name) {
      const result = {
        name: userData.name,
        email: userData.email || '',
      };
      userCache.set(userId, result);
      return result;
    }
  } catch (error) {
    logger.error('Failed to fetch user data from Convex:', error);
  }

  // If Convex fetch fails, try current user data
  const currentUser = getCurrentUserData();

  // If it's the current user, use their data
  if (
    currentUser &&
    (currentUser.id === userId || currentUser._id === userId)
  ) {
    const result = {
      name:
        currentUser.name ||
        currentUser.fullName ||
        (currentUser.firstName && currentUser.lastName
          ? `${currentUser.firstName} ${currentUser.lastName}`
          : '') ||
        currentUser.email?.split('@')[0] ||
        'You',
      email: currentUser.email || '',
      candidateId: currentUser.candidateId || '',
      clientId: currentUser.clientId || '',
      partnerId: currentUser.partnerId || '',
      supportId: currentUser.supportId || '',
    };
    userCache.set(userId, result);
    return result;
  }

  // As a last resort, return a placeholder with the user ID
  const fallback = {
    name: `User ${userId.slice(-4)}`, // Show last 4 chars of ID
    email: '',
  };
  userCache.set(userId, fallback);
  return fallback;
};

/**
 * Get user display name from userId
 * Uses real user data from current user context
 *
 * Note: This is a synchronous version that uses cached data only
 * For accurate data, use getUserDisplayNameAsync
 */
export const getUserDisplayName = (
  userId: string,
  _userType: ConvexUserType,
  currentUserId?: string
): string => {
  // For synchronous use, we can only use the cache
  if (userCache.has(userId)) {
    const userData = userCache.get(userId)!;

    // If it's the current user, show "You" + name
    if (currentUserId && userId === currentUserId) {
      return `You (${userData.name})`;
    }

    return userData.name;
  }

  // If not in cache, use a fallback
  return currentUserId && userId === currentUserId
    ? 'You'
    : `User ${userId.slice(-4)}`;
};

/**
 * Async version of getUserDisplayName that fetches data if needed
 */
export const getUserDisplayNameAsync = async (
  userId: string,
  currentUserId?: string
): Promise<string> => {
  const userData = await fetchUserData(userId);

  // If it's the current user, show "You" + name
  if (currentUserId && userId === currentUserId) {
    return `You (${userData.name})`;
  }

  return userData.name;
};
/**
 * Get user email from userId
 *
 * Note: This is a synchronous version that uses cached data only
 * For accurate data, use getUserEmailAsync
 */
export const getUserEmail = (userId: string): string => {
  // For synchronous use, we can only use the cache
  if (userCache.has(userId)) {
    return userCache.get(userId)!.email;
  }

  return '';
};

/**
 * Async version of getUserEmail that fetches data if needed
 */
export const getUserEmailAsync = async (userId: string): Promise<string> => {
  const userData = await fetchUserData(userId);
  return userData.email;
};

/**
 * Get user initials from userId
 * Uses real user data from current user context
 *
 * Note: This is a synchronous version that uses cached data only
 * For accurate data, use getUserInitialsAsync
 */
export const getUserInitials = (userId: string): string => {
  // For synchronous use, we can only use the cache
  if (userCache.has(userId)) {
    const userData = userCache.get(userId)!;
    return (
      userData.name
        .split(' ')
        .map((n) => n.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'U'
    );
  }

  // If not in cache, use a fallback
  return userId.slice(-2).toUpperCase();
};

/**
 * Async version of getUserInitials that fetches data if needed
 */
export const getUserInitialsAsync = async (userId: string): Promise<string> => {
  const userData = await fetchUserData(userId);
  return (
    userData.name
      .split(' ')
      .map((n) => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U'
  );
};

/**
 * Get user type label with proper capitalization
 */
export const getUserTypeLabel = (_userType: ConvexUserType): string => {
  switch (_userType) {
    case 'candidate':
      return 'Candidate';
    case 'client':
      return 'Client';
    case 'partner':
      return 'Partner';
    case 'support':
      return 'Support';
    default:
      return _userType;
  }
};

/**
 * Get user type badge color classes
 */
export const getUserTypeBadgeColor = (userType: ConvexUserType): string => {
  switch (userType) {
    case 'candidate':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'client':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'partner':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    case 'support':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

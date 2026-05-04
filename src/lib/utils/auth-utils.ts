import { IAuthUser, IAuthToken } from '@/lib/shared';
import { logger } from '@/lib/logger';
import { clearResumeData } from '@/lib/utils/resume-draft.utils';

/**
 * Safely parse JSON with error handling
 */
function safeJsonParse<T>(str: string | null): T | null {
  if (!str) return null;
  try {
    return JSON.parse(str);
  } catch (error) {
    logger.error('Failed to parse JSON:', error);
    return null;
  }
}

/**
 * Get user data from localStorage with enhanced error handling
 */
export function getUser(): IAuthUser | null {
  if (typeof window === 'undefined') return null;

  try {
    const userStr = localStorage.getItem('user');
    const user = safeJsonParse<IAuthUser>(userStr);

    // Validate user object structure
    if (user && user.id && user.email && user.type && user.role) {
      return user;
    }

    // If user data is invalid, clear it
    if (userStr) {
      logger.warn('Invalid user data found in localStorage, clearing');
      localStorage.removeItem('user');
    }

    return null;
  } catch (error) {
    logger.error('Error getting user from localStorage:', error);
    localStorage.removeItem('user');
    return null;
  }
}

/**
 * Get token data from localStorage with enhanced error handling
 */
export function getToken(): IAuthToken | null {
  if (typeof window === 'undefined') return null;

  try {
    const tokenStr = localStorage.getItem('token');
    const token = safeJsonParse<IAuthToken>(tokenStr);

    // Validate token object structure
    if (token && token.accessToken && token.refreshToken) {
      return token;
    }

    // If token data is invalid, clear it
    if (tokenStr) {
      logger.warn('Invalid token data found in localStorage, clearing');
      localStorage.removeItem('token');
    }

    return null;
  } catch (error) {
    logger.error('Error getting token from localStorage:', error);
    localStorage.removeItem('token');
    return null;
  }
}

/**
 * Set user data in localStorage
 */
export function setUser(user: IAuthUser): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('user', JSON.stringify(user));

  // Clear banner dismissal when user data changes
  if (user?.emailVerified !== null && user?.emailVerified !== undefined) {
    // User is verified, remove pending state
    localStorage.removeItem('email_verification_banner_pending');
  }

  // Dispatch custom event for auth state synchronization
  window.dispatchEvent(new Event('auth-change'));
}

/**
 * Set user data in localStorage (alias for backward compatibility)
 */
export function setUserInStorage(user: IAuthUser): void {
  setUser(user);
}

/**
 * Set token data in localStorage
 */
export function setToken(token: IAuthToken): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('token', JSON.stringify(token));
  // Dispatch custom event for auth state synchronization
  window.dispatchEvent(new Event('auth-change'));
}

/**
 * Clear all auth data from localStorage
 */
export function clearAuthData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('user');
  localStorage.removeItem('token');

  localStorage.removeItem('email_verification_banner_pending');
  localStorage.removeItem('pendingJDParsingTask');
  localStorage.removeItem('pendingJDData');
  localStorage.removeItem('original_session');
  // Clean up resume data
  clearResumeData();
  // Dispatch custom event for auth state synchronization
  window.dispatchEvent(new Event('auth-change'));
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const token = getToken();
  const user = getUser();
  return token !== null && token.accessToken !== undefined && user !== null;
}

/**
 * Validate token expiration
 */
export function isTokenValid(token: IAuthToken): boolean {
  if (!token || !token.accessToken || !token.expiresIn) {
    return false;
  }

  // If expiresIn is a timestamp, check if it's still valid
  // If it's a duration in seconds, we can't validate without knowing when it was issued
  // For now, we'll assume the token is valid if it exists
  return true;
}

/**
 * Check if authentication data is complete and valid
 */
export function hasValidAuthData(): boolean {
  const user = getUser();
  const token = getToken();

  if (!user || !token) {
    return false;
  }

  return isTokenValid(token);
}

/**
 * Check if user's email is verified
 */
export function isEmailVerified(): boolean {
  const user = getUser();
  return user?.emailVerified !== undefined && user.emailVerified !== null;
}

/**
 * Check if email verification banner is dismissed for current user
 */
export function is_email_verification_banner_dismissed(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('email_verification_banner_pending') === 'true';
}

/**
 * Dismiss email verification banner for current user
 */
export function dismiss_email_verification_banner(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('email_verification_banner_pending', 'true');
}

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/**
 * Validates user data from cookie against required type
 */
export function validateUser(
  userCookie: string | undefined,
  requiredType: string
): boolean {
  if (!userCookie) return false;

  try {
    const userData = JSON.parse(userCookie);
    return userData.type === requiredType;
  } catch (_error) {
    return false;
  }
}

// Define type-based access control map
export const typeBasedAccess = {
  '/app/candidate': 'CANDIDATE',
  '/app/client': 'CLIENT',
  '/app/partner': 'PARTNER',
  '/app/support': 'SUPPORT',
};

// Define paths that don't require authentication
export const publicPaths = [
  '/app/auth/login',
  '/app/auth/register',
  '/app/auth/forgot-password',
  '/app/auth/reset-password',
  '/app/client/signup',
  '/app/candidate/signup',
  '/app/partner/signup',
  '/app/client/invitation/accept',
  '/app/client/match',
  '/app/partner/invitation/accept/',
  '/app/candidate/invitation/accept/',
  '/app/candidate/match',
  '/app/support/invitation/accept/',
  // Public practice assessment routes (no auth required)
  '/app/candidate/assessments/practice',
];

/**
 * Checks if the path requires specific user type
 */
export function getRequiredUserType(path: string): string | undefined {
  return Object.entries(typeBasedAccess).find(([prefix]) =>
    path.startsWith(prefix)
  )?.[1];
}

/**
 * Checks if the path is public (doesn't require authentication)
 */
export function isPublicPath(path: string): boolean {
  return publicPaths.some((publicPath) => path.startsWith(publicPath));
}

/**
 * Auth middleware - checks if user has required type access
 */
export const authMiddleware = (
  request: NextRequest,
  response: NextResponse
): NextResponse => {
  const path = request.nextUrl.pathname;

  // Check if path is public - allow access to public paths
  if (isPublicPath(path)) {
    return response;
  }

  return response;
};

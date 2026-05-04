import { logger } from '@/lib/logger';
import {
  SupportInvitationTypeEnum,
  InvitationTokenPurposeEnum,
} from '@/lib/shared/models/common/enums';

export interface IInvitationTokenPayload {
  email: string;
  invitationId: string;
  type: SupportInvitationTypeEnum;
  purpose: InvitationTokenPurposeEnum;
  iat?: number;
  exp?: number;
}

/**
 * Decode JWT token without verification (for frontend use)
 */
export function decodeInvitationToken(
  token: string
): IInvitationTokenPayload | null {
  try {
    // Split the token to get the payload part
    const parts = token.split('.');
    if (parts.length !== 3) {
      logger.warn('Invalid JWT token format');
      return null;
    }

    // Decode the payload (second part)
    const payload = parts[1];
    const decodedPayload = JSON.parse(atob(payload)) as IInvitationTokenPayload;

    if (!decodedPayload || typeof decodedPayload === 'string') {
      return null;
    }

    return decodedPayload;
  } catch (error) {
    logger.error('Failed to decode invitation JWT token:', error);
    return null;
  }
}

/**
 * Check if invitation token is expired without verification
 */
export function isInvitationTokenExpired(token: string): boolean {
  try {
    const decoded = decodeInvitationToken(token);

    if (!decoded || !decoded.exp) {
      return true;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    return currentTime > decoded.exp;
  } catch (error) {
    logger.error('Failed to check invitation token expiry:', error);
    return true;
  }
}

/**
 * Get remaining time in minutes for invitation token
 */
export function getInvitationTokenRemainingTime(token: string): number {
  try {
    const decoded = decodeInvitationToken(token);

    if (!decoded || !decoded.exp) {
      return 0;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const remainingSeconds = decoded.exp - currentTime;

    return Math.max(0, Math.floor(remainingSeconds / 60));
  } catch (error) {
    logger.error('Failed to get invitation token remaining time:', error);
    return 0;
  }
}

/**
 * Validate invitation token structure and content
 */
export function validateInvitationToken(token: string): {
  isValid: boolean;
  error?: string;
  payload?: IInvitationTokenPayload;
} {
  try {
    if (!token || typeof token !== 'string') {
      return { isValid: false, error: 'Invalid token format' };
    }

    const payload = decodeInvitationToken(token);
    if (!payload) {
      return { isValid: false, error: 'Failed to decode token' };
    }

    // Validate required fields
    if (
      !payload.email ||
      !payload.invitationId ||
      !payload.type ||
      !payload.purpose
    ) {
      return { isValid: false, error: 'Missing required token fields' };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(payload.email)) {
      return { isValid: false, error: 'Invalid email format in token' };
    }

    // Validate type using enum values
    const validTypes = Object.values(SupportInvitationTypeEnum);
    if (!validTypes.includes(payload.type)) {
      return { isValid: false, error: 'Invalid invitation type' };
    }

    // Validate purpose using enum values
    const validPurposes = Object.values(InvitationTokenPurposeEnum);
    if (!validPurposes.includes(payload.purpose)) {
      return { isValid: false, error: 'Invalid token purpose' };
    }

    // Check if token is expired
    if (isInvitationTokenExpired(token)) {
      return { isValid: false, error: 'Token has expired' };
    }

    return { isValid: true, payload };
  } catch (error) {
    logger.error('Token validation error:', error);
    return { isValid: false, error: 'Token validation failed' };
  }
}

/**
 * Format remaining time for display
 */
export function formatRemainingTime(minutes: number): string {
  if (minutes <= 0) {
    return 'Expired';
  }

  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }

  return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
}

/**
 * Get invitation type display name
 */
export function getInvitationTypeDisplayName(
  type: SupportInvitationTypeEnum
): string {
  switch (type) {
    case SupportInvitationTypeEnum.CANDIDATE:
      return 'Candidate';
    case SupportInvitationTypeEnum.SUPPORT_USER:
      return 'Support User';
    case SupportInvitationTypeEnum.CLIENT:
      return 'Client';
    case SupportInvitationTypeEnum.PARTNER:
      return 'Partner';
    default:
      return 'Unknown';
  }
}

/**
 * Get invitation purpose display name
 */
export function getInvitationPurposeDisplayName(
  purpose: InvitationTokenPurposeEnum
): string {
  switch (purpose) {
    case InvitationTokenPurposeEnum.EMAIL:
      return 'Email Invitation';
    case InvitationTokenPurposeEnum.COPY:
      return 'Copied Link';
    default:
      return 'Unknown';
  }
}

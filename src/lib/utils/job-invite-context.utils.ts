/**
 * Utility functions for managing job invite context securely
 * This provides a secure way to pass job-related data between pages without URL manipulation
 *
 */

import { logger } from '../logger';

const JOB_INVITE_CONTEXT_KEY = 'teamcast_job_invite_context';

export interface IJobInviteContext {
  inviteId: string;
  jobId: string;
  isUSBasedJob: boolean;

  timestamp: number; // To expire old data
}

/**
 * Store job invite context securely in session storage
 * @param context - The job invite context to store
 */
export function setJobInviteContext(context: IJobInviteContext): void {
  try {
    sessionStorage.setItem(JOB_INVITE_CONTEXT_KEY, JSON.stringify(context));
  } catch (error) {
    logger.error('Failed to store job invite context:', error);
  }
}

/**
 * Retrieve job invite context from session storage
 * @param maxAge - Maximum age in milliseconds (default: 1 hour)
 * @returns Job invite context or null if not found/expired
 */
export function getJobInviteContext(
  maxAge: number = 60 * 60 * 1000 // 1 hour
): IJobInviteContext | null {
  try {
    const stored = sessionStorage.getItem(JOB_INVITE_CONTEXT_KEY);
    if (!stored) return null;

    const context: IJobInviteContext = JSON.parse(stored);

    // Check if context has expired
    if (Date.now() - context.timestamp > maxAge) {
      clearJobInviteContext();
      return null;
    }

    return context;
  } catch (error) {
    logger.error('Failed to retrieve job invite context:', error);
    return null;
  }
}

/**
 * Get only the isUSBasedJob flag from stored context
 * @returns boolean indicating if the job is US-based, defaults to false
 */
export function getIsUSBasedJob(): boolean {
  const context = getJobInviteContext();
  return context?.isUSBasedJob ?? false;
}

/**
 * Clear job invite context from storage
 */
export function clearJobInviteContext(): void {
  try {
    sessionStorage.removeItem(JOB_INVITE_CONTEXT_KEY);
  } catch (error) {
    logger.error('Failed to clear job invite context:', error);
  }
}

/**
 * Check if there is an active job invite context
 * @returns boolean indicating if context exists and is valid
 */
export function hasActiveJobInviteContext(): boolean {
  return getJobInviteContext() !== null;
}

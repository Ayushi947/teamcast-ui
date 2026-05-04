import { ISupportClientUser, ISupportClientJobPosting } from '@/lib/shared';

/**
 * Type guard to check if an object is a valid user with required properties
 */
export function isValidUser(obj: unknown): obj is ISupportClientUser {
  if (!obj || typeof obj !== 'object') return false;

  const user = obj as Record<string, unknown>;

  return (
    typeof user.id === 'string' &&
    typeof user.email === 'string' &&
    typeof user.name === 'string' &&
    typeof user.role === 'string' &&
    typeof user.status === 'string'
  );
}

/**
 * Type guard to check if an object is a valid job with required properties
 */
export function isValidJob(obj: unknown): obj is ISupportClientJobPosting {
  if (!obj || typeof obj !== 'object') return false;

  const job = obj as Record<string, unknown>;

  return (
    typeof job.id === 'string' &&
    typeof job.title === 'string' &&
    typeof job.status === 'string'
  );
}

/**
 * Type guard to check if an object has an id property
 */
export function hasId(obj: unknown): obj is { id: string } {
  if (!obj || typeof obj !== 'object') return false;

  const entity = obj as Record<string, unknown>;
  return typeof entity.id === 'string';
}

/**
 * Safe type assertion for user objects
 */
export function safeUserCast(obj: unknown): ISupportClientUser | null {
  return isValidUser(obj) ? obj : null;
}

/**
 * Safe type assertion for job objects
 */
export function safeJobCast(obj: unknown): ISupportClientJobPosting | null {
  return isValidJob(obj) ? obj : null;
}

/**
 * Type guard to check if an object has optional user properties
 */
export function hasUserProperties(obj: unknown): obj is ISupportClientUser & {
  phone?: string;
  department?: string;
  notes?: string;
} {
  if (!obj || typeof obj !== 'object') return false;
  const user = obj as Record<string, unknown>;
  return (
    (user.phone === undefined || typeof user.phone === 'string') &&
    (user.department === undefined || typeof user.department === 'string') &&
    (user.notes === undefined || typeof user.notes === 'string')
  );
}

/**
 * Type guard to check if an object has optional job properties
 */
export function hasJobProperties(
  obj: unknown
): obj is ISupportClientJobPosting & {
  title?: string;
  location?: string;
  workType?: string;
  status?: string;
  experienceLevel?: string;
  salaryRange?: string;
  description?: string;
  requirements?: string;
  remoteWork?: string;
} {
  if (!obj || typeof obj !== 'object') return false;

  const job = obj as Record<string, unknown>;

  // Check that all properties are either undefined or strings
  return (
    (job.title === undefined || typeof job.title === 'string') &&
    (job.location === undefined || typeof job.location === 'string') &&
    (job.workType === undefined || typeof job.workType === 'string') &&
    (job.status === undefined || typeof job.status === 'string') &&
    (job.experienceLevel === undefined ||
      typeof job.experienceLevel === 'string') &&
    (job.salaryRange === undefined || typeof job.salaryRange === 'string') &&
    (job.description === undefined || typeof job.description === 'string') &&
    (job.requirements === undefined || typeof job.requirements === 'string') &&
    (job.remoteWork === undefined || typeof job.remoteWork === 'string')
  );
}

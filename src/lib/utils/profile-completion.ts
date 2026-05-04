import { ICandidateProfile, IResume } from '@/lib/shared';

/**
 * Calculate candidate profile completion percentage
 * based on exactly 12 fields (4 + 4 + 2 + 2).
 */
export function calculateCandidateProfileCompletion(
  profile: ICandidateProfile,
  resume?: IResume | null
): number {
  let completed = 0;
  const total = 12; // fixed number of fields

  // Basic profile information (4 points)
  if (profile.name?.trim()) completed++;
  if (profile.email?.trim()) completed++;
  if (profile.jobTitle?.trim()) completed++;
  if (profile.image?.trim()) completed++;

  // Resume basic information (4 points)
  if (resume?.summary?.trim()) completed++;
  if (resume?.location?.trim()) completed++;
  if (typeof resume?.totalExperience === 'number' && resume.totalExperience > 0)
    completed++;
  if (Array.isArray(resume?.resumeSkills) && resume.resumeSkills.length > 0)
    completed++;

  // Resume detailed information (2 points)
  if (Array.isArray(resume?.experience) && resume.experience.length > 0)
    completed++;
  if (Array.isArray(resume?.education) && resume.education.length > 0)
    completed++;

  // Additional profile information (2 points)
  if (Array.isArray(resume?.languages) && resume.languages.length > 0)
    completed++;
  if (Array.isArray(resume?.industries) && resume.industries.length > 0)
    completed++;

  return Math.round((completed / total) * 100);
}

/**
 * Always calculate locally from latest profile/resume.
 * This ensures score updates immediately on UI changes
 * (no waiting for backend refresh).
 *
 * We always calculate locally instead of using the backend value
 * to ensure real-time updates when resume data changes.
 */
export function getProfileCompletionPercentage(
  profile: ICandidateProfile,
  resume?: IResume | null
): number {
  // Always calculate locally from the fresh profile and resume data
  // This ensures the completion percentage updates immediately when
  // resume sections (experience, education, etc.) are updated
  return calculateCandidateProfileCompletion(profile, resume);
}

import { ISupportCandidate } from '@/lib/shared';

/**
 * Gets the latest onboarding assessment for a candidate based on completion date,
 * falling back to start date if completion date is not available.
 *
 * @param candidate - The candidate object containing onboarding assessments
 * @returns The latest onboarding assessment or undefined if none exist
 */
export function getLatestOnboardingAssessment(
  candidate: ISupportCandidate
): NonNullable<ISupportCandidate['onboardingAssessments']>[0] | undefined {
  const assessments = candidate?.onboardingAssessments ?? [];

  if (!assessments.length) {
    return undefined;
  }

  // Sort assessments by completion date (most recent first), then by start date
  const sorted = [...assessments].sort((a, b) => {
    const aCompleted = a.completedAt ? new Date(a.completedAt).getTime() : 0;
    const bCompleted = b.completedAt ? new Date(b.completedAt).getTime() : 0;

    // If completion dates are different, sort by completion date
    if (bCompleted !== aCompleted) {
      return bCompleted - aCompleted;
    }

    // If completion dates are the same or both missing, sort by start date
    const aStarted = a.startedAt ? new Date(a.startedAt).getTime() : 0;
    const bStarted = b.startedAt ? new Date(b.startedAt).getTime() : 0;
    return bStarted - aStarted;
  });

  return sorted[0];
}

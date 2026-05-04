import { z } from 'zod';

/**
 * Validator for getting video chunks for an onboarding assessment (Client/HR)
 */
export const clientCandidateOnboardingAssessmentVideoChunksGetValidator =
  z.object({
    params: z.object({
      assessmentId: z.string().min(1, {
        message: 'Assessment ID is required',
      }),
    }),
    query: z
      .object({
        questionId: z.string().optional(),
        includeAnalysis: z
          .string()
          .transform((val) => val === 'true')
          .pipe(z.boolean())
          .optional(),
        includePlaybackUrls: z
          .string()
          .transform((val) => val !== 'false')
          .pipe(z.boolean())
          .optional(),
      })
      .optional(),
  });

/**
 * Validator for getting chunk playback URL (Client/HR)
 */
export const clientCandidateOnboardingAssessmentChunkPlaybackUrlGetValidator =
  z.object({
    params: z.object({
      assessmentId: z.string().min(1, {
        message: 'Assessment ID is required',
      }),
      chunkId: z.string().min(1, {
        message: 'Chunk ID is required',
      }),
    }),
  });

// Export types
export type IClientCandidateOnboardingAssessmentVideoChunksGetValidator =
  z.infer<typeof clientCandidateOnboardingAssessmentVideoChunksGetValidator>;

export type IClientCandidateOnboardingAssessmentChunkPlaybackUrlGetValidator =
  z.infer<
    typeof clientCandidateOnboardingAssessmentChunkPlaybackUrlGetValidator
  >;

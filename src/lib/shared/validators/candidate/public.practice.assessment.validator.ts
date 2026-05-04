import { z } from 'zod';

/**
 * Validator for parsing a job URL
 */
export const publicPracticeAssessmentParseValidator = z.object({
  body: z.object({
    jobUrl: z
      .string({ required_error: 'Job URL is required' })
      .url({ message: 'Invalid job URL format' })
      .min(1, { message: 'Job URL cannot be empty' }),
  }),
});

/**
 * Validator for parsing job description text
 */
export const publicPracticeAssessmentParseDescriptionValidator = z.object({
  body: z.object({
    jobDescriptionText: z
      .string({ required_error: 'Job description text is required' })
      .min(1, { message: 'Job description text cannot be empty' })
      .max(50000, {
        message: 'Job description text must be at most 50000 characters',
      }),
  }),
});

/**
 * Validator for creating a public practice assessment from parsed job data
 */
export const publicPracticeAssessmentCreateValidator = z.object({
  body: z.object({
    parsedJobData: z.any({ required_error: 'Parsed job data is required' }),
    candidateName: z
      .string({ required_error: 'Candidate name is required' })
      .min(1, { message: 'Candidate name is required' })
      .max(255, { message: 'Candidate name must be at most 255 characters' }),
    candidateEmail: z
      .string({ required_error: 'Candidate email is required' })
      .email({ message: 'Invalid email address format' })
      .max(255, { message: 'Email must be at most 255 characters' }),
  }),
});

/**
 * Validator for getting a public practice assessment by ID
 */
export const publicPracticeAssessmentGetValidator = z.object({
  params: z.object({
    assessmentId: z
      .string({ required_error: 'Assessment ID is required' })
      .uuid({ message: 'Invalid assessment ID format' }),
  }),
});

/**
 * Validator for getting public practice assessment task
 */
export const publicPracticeAssessmentGetTaskValidator = z.object({
  params: z.object({
    assessmentId: z
      .string({ required_error: 'Assessment ID is required' })
      .uuid({ message: 'Invalid assessment ID format' }),
  }),
});

/**
 * Validator for starting public practice assessment
 */
export const publicPracticeAssessmentStartValidator = z.object({
  params: z.object({
    assessmentId: z
      .string({ required_error: 'Assessment ID is required' })
      .uuid({ message: 'Invalid assessment ID format' }),
  }),
});

/**
 * Validator for submitting answer in public practice assessment
 */
export const publicPracticeAssessmentSubmitAnswerValidator = z.object({
  params: z.object({
    assessmentId: z
      .string({ required_error: 'Assessment ID is required' })
      .uuid({ message: 'Invalid assessment ID format' }),
    questionId: z
      .string({ required_error: 'Question ID is required' })
      .uuid({ message: 'Invalid question ID format' }),
  }),
  body: z.object({
    answerGiven: z
      .string({ required_error: 'Answer is required' })
      .min(1, { message: 'Answer cannot be empty' }),
  }),
});

/**
 * Validator for submitting public practice assessment
 */
export const publicPracticeAssessmentSubmitValidator = z.object({
  params: z.object({
    assessmentId: z
      .string({ required_error: 'Assessment ID is required' })
      .uuid({ message: 'Invalid assessment ID format' }),
  }),
});

/**
 * Validator for linking a public practice assessment to a candidate
 */
export const publicPracticeAssessmentLinkValidator = z.object({
  params: z.object({
    assessmentId: z
      .string({ required_error: 'Assessment ID is required' })
      .uuid({ message: 'Invalid assessment ID format' }),
  }),
  body: z.object({
    candidateId: z
      .string()
      .uuid({ message: 'Invalid candidate ID format' })
      .optional(),
  }),
});

/**
 * Validator for getting public practice assessments by email
 */
export const publicPracticeAssessmentGetByEmailValidator = z.object({
  query: z.object({
    email: z
      .string({ required_error: 'Email is required' })
      .email({ message: 'Invalid email address format' })
      .max(255, { message: 'Email must be at most 255 characters' }),
  }),
});

/**
 * Validator for getting presigned URL for video chunk upload
 */
export const publicPracticeAssessmentPresignedUrlValidator = z.object({
  params: z.object({
    assessmentId: z
      .string({ required_error: 'Assessment ID is required' })
      .uuid({ message: 'Invalid assessment ID format' }),
  }),
  query: z
    .object({
      chunkIndex: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : undefined)),
    })
    .optional(),
});

/**
 * Validator for recording video chunk upload
 */
export const publicPracticeAssessmentChunkUploadValidator = z.object({
  params: z.object({
    assessmentId: z
      .string({ required_error: 'Assessment ID is required' })
      .uuid({ message: 'Invalid assessment ID format' }),
  }),
  body: z.object({
    chunkIndex: z.number({ required_error: 'chunkIndex is required' }),
    gcsUri: z.string({ required_error: 'gcsUri is required' }),
    questionId: z.string().uuid().optional(),
    sectionId: z.string().uuid().optional(),
  }),
});

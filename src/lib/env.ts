/**
 * Environment variables with type safety
 * This module loads and validates environment variables
 */

// Validate environment variables at startup
// This will throw an error if any required variables are missing

import { z } from 'zod';

/**
 * Specify your environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 */
const envSchema = z.object({
  // Environment
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),

  // Environment Name
  NEXT_PUBLIC_ENV_NAME: z
    .enum(['local', 'dev', 'staging', 'production', 'utkarsh', 'qa'])
    .default('local'),

  // API Configuration
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_WS_URL: z.string().optional(),

  // App Configuration
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  NEXT_PUBLIC_APP_NAME: z.string(),

  // Profile Configuration
  NEXT_PUBLIC_PROFILE_COMPLETION_THRESHOLD: z.coerce
    .number()
    .int()
    .min(0)
    .max(100)
    .default(80),

  // Analytics and Marketing
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().regex(/^G-[A-Z0-9]+$/),
  NEXT_PUBLIC_HUBSPOT_PORTAL_ID: z.string().regex(/^\d+$/),

  // Cache Control
  NEXT_PUBLIC_CACHE_MAX_AGE: z.coerce.number().int().positive(),

  // System Check Configuration
  NEXT_PUBLIC_INTERNET_SPEED_THRESHOLD: z.coerce
    .number()
    .min(0)
    .max(100)
    .default(0.5),

  // Video Recording Configuration
  NEXT_PUBLIC_VIDEO_CHUNK_INTERVAL: z.coerce
    .number()
    .int()
    .min(1)
    .max(300)
    .default(30),
  NEXT_PUBLIC_VIDEO_WIDTH: z.coerce
    .number()
    .int()
    .min(160)
    .max(1920)
    .default(1280),
  NEXT_PUBLIC_VIDEO_HEIGHT: z.coerce
    .number()
    .int()
    .min(120)
    .max(1080)
    .default(720),
  NEXT_PUBLIC_VIDEO_FRAME_RATE: z.coerce
    .number()
    .int()
    .min(1)
    .max(30)
    .default(5),

  // Assessment Configuration
  NEXT_PUBLIC_ASSESSMENT_TIME_WARNING_THRESHOLD: z.coerce
    .number()
    .int()
    .min(60)
    .max(900)
    .default(300), // 5 minutes default
  NEXT_PUBLIC_ASSESSMENT_HEARTBEAT_INTERVAL: z.coerce
    .number()
    .int()
    .min(5)
    .max(60)
    .default(5), // 5 seconds default
  NEXT_PUBLIC_MIN_TEXT_ANSWER_LENGTH: z.coerce
    .number()
    .int()
    .min(1)
    .default(10), // 10 characters default
  NEXT_PUBLIC_ANSWER_EVALUATION_TIME_LIMIT: z.coerce
    .number()
    .int()
    .min(30)
    .max(300)
    .default(60), // 60 seconds default

  // Convex Configuration
  NEXT_PUBLIC_CONVEX_SELF_HOSTED_URL: z.string().url().optional(),
  CONVEX_SELF_HOSTED_ADMIN_KEY: z.string().optional(),

  // Google Maps Configuration
  GOOGLE_MAPS_API_KEY: z.string().optional(),

  // Support Ticket Configuration
  NEXT_PUBLIC_SUPPORT_TICKET_ENABLED: z
    .union([z.boolean(), z.string()])
    .transform((val) => {
      if (typeof val === 'string') {
        return val.toLowerCase() === 'true';
      }
      return val;
    })
    .default(false),

  // Tour Guide Configuration
  NEXT_PUBLIC_TOUR_GUIDE_ENABLED: z
    .union([z.boolean(), z.string()])
    .transform((val) => {
      if (typeof val === 'string') {
        return val.toLowerCase() === 'true';
      }
      return val;
    })
    .default(true),

  // Face Detection Configuration
  NEXT_PUBLIC_FACE_DETECTION_ENABLED: z
    .union([z.boolean(), z.string()])
    .transform((val) => {
      if (typeof val === 'string') {
        return val.toLowerCase() === 'true';
      }
      return val;
    })
    .default(false),
});

const processEnv = {
  // Environment
  NODE_ENV:
    typeof process !== 'undefined' ? process.env.NODE_ENV : 'production',
  NEXT_PUBLIC_ENV_NAME:
    typeof process !== 'undefined'
      ? process.env.NEXT_PUBLIC_ENV_NAME
      : 'production',

  // API Configuration
  NEXT_PUBLIC_API_URL:
    typeof process !== 'undefined'
      ? process.env.NEXT_PUBLIC_API_URL
      : 'http://localhost:4300',
  NEXT_PUBLIC_WS_URL:
    typeof process !== 'undefined'
      ? process.env.NEXT_PUBLIC_WS_URL
      : 'ws://localhost:4300',

  // App Configuration
  NEXT_PUBLIC_SITE_URL:
    typeof process !== 'undefined'
      ? process.env.NEXT_PUBLIC_SITE_URL
      : 'http://localhost:3000',
  NEXT_PUBLIC_APP_NAME:
    typeof process !== 'undefined'
      ? process.env.NEXT_PUBLIC_APP_NAME
      : 'Teamcast',

  // Profile Configuration
  NEXT_PUBLIC_PROFILE_COMPLETION_THRESHOLD:
    typeof process !== 'undefined'
      ? process.env.NEXT_PUBLIC_PROFILE_COMPLETION_THRESHOLD
      : '80',

  // Analytics and Marketing
  NEXT_PUBLIC_GA_MEASUREMENT_ID:
    typeof process !== 'undefined'
      ? process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
      : 'G-PLACEHOLDER',
  NEXT_PUBLIC_HUBSPOT_PORTAL_ID:
    typeof process !== 'undefined'
      ? process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID
      : '12345678',

  // Cache Control
  NEXT_PUBLIC_CACHE_MAX_AGE:
    typeof process !== 'undefined'
      ? process.env.NEXT_PUBLIC_CACHE_MAX_AGE
      : '3600',

  // Google Cloud
  GOOGLE_CLOUD_KEY_FILE:
    typeof process !== 'undefined'
      ? process.env.GOOGLE_CLOUD_KEY_FILE
      : undefined,
  GOOGLE_CLOUD_PROJECT_ID:
    typeof process !== 'undefined'
      ? process.env.GOOGLE_CLOUD_PROJECT_ID
      : undefined,

  NEXT_PUBLIC_INTERNET_SPEED_THRESHOLD:
    typeof process !== 'undefined'
      ? process.env.NEXT_PUBLIC_INTERNET_SPEED_THRESHOLD
      : '0.5',

  // Video Recording Configuration
  NEXT_PUBLIC_VIDEO_CHUNK_INTERVAL:
    typeof process !== 'undefined'
      ? process.env.NEXT_PUBLIC_VIDEO_CHUNK_INTERVAL
      : '30',
  NEXT_PUBLIC_VIDEO_WIDTH:
    typeof process !== 'undefined'
      ? process.env.NEXT_PUBLIC_VIDEO_WIDTH
      : '320',
  NEXT_PUBLIC_VIDEO_HEIGHT:
    typeof process !== 'undefined'
      ? process.env.NEXT_PUBLIC_VIDEO_HEIGHT
      : '240',
  NEXT_PUBLIC_VIDEO_FRAME_RATE:
    typeof process !== 'undefined'
      ? process.env.NEXT_PUBLIC_VIDEO_FRAME_RATE
      : '5',

  // Assessment Configuration
  NEXT_PUBLIC_ASSESSMENT_TIME_WARNING_THRESHOLD:
    typeof process !== 'undefined'
      ? process.env.NEXT_PUBLIC_ASSESSMENT_TIME_WARNING_THRESHOLD
      : '300',
  NEXT_PUBLIC_ASSESSMENT_HEARTBEAT_INTERVAL:
    typeof process !== 'undefined'
      ? process.env.NEXT_PUBLIC_ASSESSMENT_HEARTBEAT_INTERVAL
      : '5',
  NEXT_PUBLIC_MIN_TEXT_ANSWER_LENGTH:
    typeof process !== 'undefined'
      ? process.env.NEXT_PUBLIC_MIN_TEXT_ANSWER_LENGTH
      : '10',
  NEXT_PUBLIC_ANSWER_EVALUATION_TIME_LIMIT:
    typeof process !== 'undefined'
      ? process.env.NEXT_PUBLIC_ANSWER_EVALUATION_TIME_LIMIT
      : '60',
  NEXT_PUBLIC_CONVEX_SELF_HOSTED_URL:
    typeof process !== 'undefined'
      ? process.env.NEXT_PUBLIC_CONVEX_SELF_HOSTED_URL
      : undefined,
  CONVEX_SELF_HOSTED_ADMIN_KEY:
    typeof process !== 'undefined'
      ? process.env.CONVEX_SELF_HOSTED_ADMIN_KEY
      : undefined,

  GOOGLE_MAPS_API_KEY:
    typeof process !== 'undefined'
      ? process.env.GOOGLE_MAPS_API_KEY
      : undefined,

  NEXT_PUBLIC_SUPPORT_TICKET_ENABLED:
    typeof process !== 'undefined'
      ? process.env.NEXT_PUBLIC_SUPPORT_TICKET_ENABLED
      : false,

  NEXT_PUBLIC_TOUR_GUIDE_ENABLED:
    typeof process !== 'undefined'
      ? process.env.NEXT_PUBLIC_TOUR_GUIDE_ENABLED
      : true,

  NEXT_PUBLIC_FACE_DETECTION_ENABLED:
    typeof process !== 'undefined'
      ? process.env.NEXT_PUBLIC_FACE_DETECTION_ENABLED
      : false,
};

/**
 * Parse environment variables with validation
 * Skip validation during build time to prevent build failures
 */
const isStaticGeneration =
  typeof process === 'undefined' ||
  (typeof process !== 'undefined' &&
    (process.env.NODE_ENV === 'production' ||
      process.env.NEXT_PHASE === 'phase-production-build') &&
    typeof window === 'undefined');

let _env: z.SafeParseReturnType<any, any>;

if (isStaticGeneration) {
  // During static generation, use defaults to prevent build failures
  _env = {
    success: true,
    data: {
      NODE_ENV: 'production',
      NEXT_PUBLIC_ENV_NAME: 'production',
      NEXT_PUBLIC_API_URL: 'http://localhost:4300',
      NEXT_PUBLIC_WS_URL: 'ws://localhost:4300',
      NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
      NEXT_PUBLIC_APP_NAME: 'Teamcast',
      NEXT_PUBLIC_PROFILE_COMPLETION_THRESHOLD: 80,
      NEXT_PUBLIC_GA_MEASUREMENT_ID: 'G-PLACEHOLDER',
      NEXT_PUBLIC_HUBSPOT_PORTAL_ID: '12345678',
      NEXT_PUBLIC_CACHE_MAX_AGE: 3600,
      NEXT_PUBLIC_INTERNET_SPEED_THRESHOLD: 0.5,
      NEXT_PUBLIC_VIDEO_CHUNK_INTERVAL: 30,
      NEXT_PUBLIC_VIDEO_WIDTH: 320,
      NEXT_PUBLIC_VIDEO_HEIGHT: 240,
      NEXT_PUBLIC_VIDEO_FRAME_RATE: 5,
      NEXT_PUBLIC_ASSESSMENT_TIME_WARNING_THRESHOLD: 300,
      NEXT_PUBLIC_ASSESSMENT_HEARTBEAT_INTERVAL: 5,
      NEXT_PUBLIC_MIN_TEXT_ANSWER_LENGTH: 10,
      NEXT_PUBLIC_ANSWER_EVALUATION_TIME_LIMIT: 60,
      NEXT_PUBLIC_SUPPORT_TICKET_ENABLED: false,
      NEXT_PUBLIC_TOUR_GUIDE_ENABLED: true,
      NEXT_PUBLIC_FACE_DETECTION_ENABLED: false,
      GOOGLE_MAPS_API_KEY: undefined,
    },
  };
} else {
  _env = envSchema.safeParse(processEnv);

  if (!_env.success) {
    throw new Error('Invalid environment variables');
  }
}

/**
 * Export validated environment variables
 */
export const ENV = _env.data;

/**
 * Helper function to get the assessment route based on NEXT_PUBLIC_ENV_NAME
 * - All environments now use 'assessment' (old interviewer with Google STT/TTS fixes)
 * - LiveKit interviewer ('ai-interview') is deprecated for onboarding assessments
 */
export const getAssessmentRoute = (): 'ai-interview' | 'assessment' => {
  // Always use the old interviewer (with streaming STT and proctoring fixes)
  return 'assessment';
};

export const isDevelopmentEnvironment = (): boolean => {
  return ENV.NEXT_PUBLIC_ENV_NAME === 'dev';
};

export const isLocalEnvironment = (): boolean => {
  return ENV.NEXT_PUBLIC_ENV_NAME === 'local';
};

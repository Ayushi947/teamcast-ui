import { ConvexHttpClient } from 'convex/browser';
import { ConvexReactClient } from 'convex/react';
import { ENV } from './env';

// Default Convex URL (fallback for when environment variable is not available)
const DEFAULT_CONVEX_URL = 'https://convexdev-api.teamcast.ai';

// Create Convex client instance with fallback URL
const convexUrl = ENV.NEXT_PUBLIC_CONVEX_SELF_HOSTED_URL || DEFAULT_CONVEX_URL;

// Use ConvexHttpClient for server-side/non-React usage
export const convexHttp = new ConvexHttpClient(convexUrl);

// Use ConvexReactClient for React components
export const convexReact = new ConvexReactClient(convexUrl);

// Default export is HTTP client for backward compatibility
export default convexHttp;

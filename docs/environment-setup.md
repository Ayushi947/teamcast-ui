# Environment Configuration Guide

This guide explains how to properly configure environment variables for different environments (dev, staging, production).

## Issue Resolution

The problem you're experiencing where `localhost:3000` appears instead of your configured API URL was caused by:

1. **Static Generation Fallbacks**: The `env.ts` file was using hardcoded fallback values during build time
2. **Direct process.env Access**: The `api-client.ts` was directly accessing `process.env` instead of using the validated ENV object

These issues have been fixed in the recent updates.

## Environment Files

Create separate environment files for each environment:

### .env.local (for local development)

```bash
# Environment
NODE_ENV=development
NEXT_PUBLIC_ENV_NAME=local

# API Configuration
NEXT_PUBLIC_API_URL=https://devapi.teamcast.ai/api
NEXT_PUBLIC_WEBSOCKET_URL=ws://devapi.teamcast.ai/ws

# App Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Teamcast Local

# Profile Configuration
NEXT_PUBLIC_PROFILE_COMPLETION_THRESHOLD=80

# Analytics and Marketing
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-E6GF74546W
NEXT_PUBLIC_HUBSPOT_PORTAL_ID=242572127

# Cache Control
NEXT_PUBLIC_CACHE_MAX_AGE=3600

# System Check Configuration
NEXT_PUBLIC_INTERNET_SPEED_THRESHOLD=0.5

# Video Recording Configuration
NEXT_PUBLIC_VIDEO_CHUNK_INTERVAL=30
NEXT_PUBLIC_VIDEO_WIDTH=320
NEXT_PUBLIC_VIDEO_HEIGHT=240
NEXT_PUBLIC_VIDEO_FRAME_RATE=5

# Assessment Configuration
NEXT_PUBLIC_ASSESSMENT_TIME_WARNING_THRESHOLD=300
NEXT_PUBLIC_ASSESSMENT_HEARTBEAT_INTERVAL=5
NEXT_PUBLIC_MIN_TEXT_ANSWER_LENGTH=10

# Google Cloud
GOOGLE_CLOUD_KEY_FILE=./teamcast-cicd-key.json
GOOGLE_CLOUD_PROJECT_ID=teamcastai
```

### .env.development (for dev environment)

```bash
# Environment
NODE_ENV=development
NEXT_PUBLIC_ENV_NAME=dev

# API Configuration
NEXT_PUBLIC_API_URL=https://devapi.teamcast.ai/api
NEXT_PUBLIC_WEBSOCKET_URL=wss://devapi.teamcast.ai/ws

# App Configuration
NEXT_PUBLIC_SITE_URL=https://dev.teamcast.ai
NEXT_PUBLIC_APP_NAME=Teamcast Dev

# Rest of the variables same as local...
```

### .env.staging (for staging environment)

```bash
# Environment
NODE_ENV=production
NEXT_PUBLIC_ENV_NAME=staging

# API Configuration
NEXT_PUBLIC_API_URL=https://stagingapi.teamcast.ai/api
NEXT_PUBLIC_WEBSOCKET_URL=wss://stagingapi.teamcast.ai/ws

# App Configuration
NEXT_PUBLIC_SITE_URL=https://staging.teamcast.ai
NEXT_PUBLIC_APP_NAME=Teamcast Staging

# Rest of the variables...
```

### .env.production (for production environment)

```bash
# Environment
NODE_ENV=production
NEXT_PUBLIC_ENV_NAME=production

# API Configuration
NEXT_PUBLIC_API_URL=https://api.teamcast.ai/api
NEXT_PUBLIC_WEBSOCKET_URL=wss://api.teamcast.ai/ws

# App Configuration
NEXT_PUBLIC_SITE_URL=https://teamcast.ai
NEXT_PUBLIC_APP_NAME=Teamcast

# Rest of the variables...
```

## Next.js Environment Loading Order

Next.js loads environment files in this order (later ones override earlier ones):

1. `.env`
2. `.env.local` (always ignored by Git)
3. `.env.[NODE_ENV]` (e.g., `.env.development`)
4. `.env.[NODE_ENV].local` (e.g., `.env.development.local`)

## Deployment Configuration

### For Docker/Container Deployments

Use environment variables directly in your deployment configuration:

```yaml
# docker-compose.yml or Kubernetes deployment
environment:
  - NODE_ENV=production
  - NEXT_PUBLIC_ENV_NAME=production
  - NEXT_PUBLIC_API_URL=https://api.teamcast.ai/api
  - NEXT_PUBLIC_SITE_URL=https://teamcast.ai
  # ... other variables
```

### For Vercel/Netlify Deployments

Set environment variables in your deployment platform's dashboard:

- Development: Use your dev API URLs
- Preview: Use your staging API URLs
- Production: Use your production API URLs

## Validation

The environment variables are validated using Zod schema. If any required variable is missing or invalid, the application will throw an error with details about what's wrong.

## Testing Your Configuration

1. Create your environment file
2. Restart your development server: `pnpm dev`
3. Check the console for any validation errors
4. Verify the API URL is correct by checking network requests in browser dev tools

## Troubleshooting

If you're still seeing `localhost:3000` or incorrect URLs:

1. **Clear Next.js cache**: `rm -rf .next && pnpm dev`
2. **Check environment file naming**: Ensure files are named exactly `.env.local`, `.env.development`, etc.
3. **Verify variable names**: All public variables must start with `NEXT_PUBLIC_`
4. **Check for typos**: Environment variable names are case-sensitive
5. **Restart development server**: Environment changes require a restart

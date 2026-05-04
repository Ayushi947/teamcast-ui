/* eslint-disable no-console */

/**
 * This script validates environment variables.
 * It can be run with `pnpm ts-node src/scripts/validate-env.ts`
 */

// Import to trigger validation
import '../lib/env';

console.log('✅ Environment variables validated successfully!');

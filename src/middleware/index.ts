import { authMiddleware } from './auth.middleware';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Type for middleware handlers
type MiddlewareHandler = (
  request: NextRequest,
  response: NextResponse
) => NextResponse;

// List of middleware handlers to be executed in sequence
const middlewareHandlers: MiddlewareHandler[] = [authMiddleware];

// Export the middleware configuration
export const config = {
  matcher: [
    /*
     * Match only /app routes that aren't auth paths
     * This will exclude static files automatically as
     * Next.js doesn't run middleware on static file requests
     */
    '/app/:path*',
  ],
};

/**
 * Main middleware function that runs all middleware handlers in sequence
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files (which shouldn't be caught by the matcher anyway)
  if (
    pathname.includes('/_next/') ||
    pathname.includes('/static/') ||
    pathname.match(/\.(css|js|png|jpg|jpeg|svg|ico)$/) ||
    pathname === '/'
  ) {
    return NextResponse.next();
  }

  // Only apply middleware to /app paths
  if (!pathname.startsWith('/app')) {
    return NextResponse.next();
  }

  // Start with the initial response
  let response = NextResponse.next();

  // Run through all middleware handlers in sequence
  for (const handler of middlewareHandlers) {
    response = handler(request, response);

    // If a redirect or response is returned, stop the chain
    if (response.headers.get('Location')) {
      break;
    }
  }
  return response;
}

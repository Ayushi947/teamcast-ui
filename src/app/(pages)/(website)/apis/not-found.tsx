'use client';
import Link from 'next/link';
import { BookOpen, ArrowLeft, Search, Home } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useOpenAPI } from './components/openapi-context';

function getMethodColor(method: string) {
  switch (method) {
    case 'GET':
      return 'border-emerald-200 bg-emerald-100 font-mono text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400';
    case 'POST':
      return 'border-blue-200 bg-blue-100 font-mono text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    case 'PUT':
      return 'border-orange-200 bg-orange-100 font-mono text-orange-700 dark:border-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
    case 'DELETE':
      return 'border-red-200 bg-red-100 font-mono text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400';
    case 'PATCH':
      return 'border-purple-200 bg-purple-100 font-mono text-purple-700 dark:border-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
    default:
      return 'border-border bg-muted font-mono text-muted-foreground';
  }
}

// Security configuration - same as sidebar
const SENSITIVE_TAGS = ['voice', 'stripe', 'support', 'activity', 'oauth'];
const AUTH_REQUIRED_TAGS = ['crons', 'monitoring'];

// Check if endpoint should be hidden based on security rules
function shouldHideEndpoint(
  path: string,
  tags: string[],
  _method: string,
  operation: any
): boolean {
  // Convert tags to lowercase for comparison
  const lowerTags = tags.map((tag) => tag.toLowerCase());

  // Hide completely sensitive tags
  if (
    SENSITIVE_TAGS.some((sensitiveTag) =>
      lowerTags.some((tag) => tag.includes(sensitiveTag))
    )
  ) {
    return true;
  }

  // Hide sensitive paths
  const sensitivePaths = [
    '/stripe',
    '/payment',
    '/billing',
    '/oauth',
    '/auth/oauth',
    '/voice',
    '/tts',
    '/stt',
    '/support/internal',
    '/admin',
    '/activity/track',
    '/analytics/internal',
    '/webhook',
    '/callback',
  ];

  if (
    sensitivePaths.some((sensitivePath) =>
      path.toLowerCase().includes(sensitivePath)
    )
  ) {
    return true;
  }

  // For auth-required tags, only show if authentication is not required or is explicitly public
  if (
    AUTH_REQUIRED_TAGS.some((authTag) =>
      lowerTags.some((tag) => tag.includes(authTag))
    )
  ) {
    // Show only if operation has no security requirements (public endpoint)
    if (operation.security && operation.security.length > 0) {
      return true;
    }
  }

  return false;
}

function usePopularEndpoints() {
  const { loading, error, data } = useOpenAPI();

  const getPopularEndpoints = () => {
    if (!data?.paths) return [];

    const endpoints: Array<{
      path: string;
      method: string;
      summary: string;
      displayPath: string;
    }> = [];

    // Priority tags/endpoints to show first
    const priorityTags = [
      'authentication',
      'auth',
      'users',
      'candidates',
      'search',
      'jobs',
      'clients',
    ];
    const priorityPaths = [
      '/auth/login',
      '/candidates',
      '/clients',
      '/search/candidates',
      '/users',
      '/jobs',
    ];

    for (const path in data.paths) {
      for (const method in data.paths[path]) {
        const operation = data.paths[path][method];
        const tags = operation.tags || [];
        const summary = operation.summary || `${method.toUpperCase()} ${path}`;

        // Check if this endpoint should be hidden
        if (shouldHideEndpoint(path, tags, method.toUpperCase(), operation)) {
          continue;
        }

        // Create display path
        const displayPath = path.replace(/\{([^}]+)\}/g, ':$1');

        // Check if this is a priority endpoint
        const isPriority =
          priorityPaths.some((p) => path.includes(p)) ||
          tags.some((tag: string) => priorityTags.includes(tag.toLowerCase()));

        if (isPriority) {
          endpoints.push({
            path,
            method: method.toUpperCase(),
            summary,
            displayPath,
          });
        }
      }
    }

    // Sort by method priority and limit results
    return endpoints
      .sort((a, b) => {
        // Prioritize GET and POST methods
        const methodPriority = { GET: 1, POST: 2, PUT: 3, DELETE: 4, PATCH: 5 };
        const aPriority =
          methodPriority[a.method as keyof typeof methodPriority] || 6;
        const bPriority =
          methodPriority[b.method as keyof typeof methodPriority] || 6;
        return aPriority - bPriority;
      })
      .slice(0, 6);
  };

  return {
    loading,
    error,
    popularEndpoints: getPopularEndpoints(),
  };
}

export default function DocsNotFound() {
  const { loading, error, popularEndpoints } = usePopularEndpoints();

  return (
    <div className="bg-background flex h-full items-center justify-center">
      <div className="w-full max-w-lg px-6 text-center">
        <div className="mb-8">
          <div className="bg-primary/10 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full">
            <BookOpen className="text-primary h-10 w-10" />
          </div>
          <h1 className="text-foreground mb-3 text-3xl font-bold">
            Endpoint Not Found
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            The API endpoint you&apos;re looking for doesn&apos;t exist or may
            have been moved.
          </p>
        </div>

        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/"
              className="bg-muted hover:bg-muted/80 text-muted-foreground inline-flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
            <Link
              href="/apis"
              className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors"
            >
              <Home className="h-4 w-4" />
              Go to API Docs
            </Link>
          </div>

          {/* Popular Endpoints */}
          <div className="bg-card border-border rounded-lg border p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Search className="text-primary h-5 w-5" />
              <h2 className="text-foreground text-lg font-semibold">
                Popular Public Endpoints
              </h2>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="border-primary h-6 w-6 animate-spin rounded-full border-b-2"></div>
                <span className="text-muted-foreground ml-2 text-sm">
                  Loading endpoints...
                </span>
              </div>
            ) : error || popularEndpoints.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-muted-foreground text-sm">
                  Unable to load popular endpoints
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {popularEndpoints.map((endpoint, index) => (
                  <Link
                    key={index}
                    href={`/apis${endpoint.path}`}
                    className="hover:bg-muted/50 hover:border-border block rounded-lg border border-transparent p-3 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="outline"
                        className={`text-xs ${getMethodColor(endpoint.method)}`}
                      >
                        {endpoint.method}
                      </Badge>
                      <div className="flex-1 text-left">
                        <code className="text-foreground font-mono text-sm">
                          {endpoint.displayPath}
                        </code>
                        <p className="text-muted-foreground mt-1 truncate text-xs">
                          {endpoint.summary}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Help Text */}
          <div className="bg-primary/5 border-primary/20 rounded-lg border p-4">
            <p className="text-muted-foreground text-sm">
              Looking for a specific endpoint? Check our{' '}
              <Link
                href="/apis"
                className="text-primary hover:text-primary/80 font-medium"
              >
                complete API documentation
              </Link>{' '}
              for all available public endpoints.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

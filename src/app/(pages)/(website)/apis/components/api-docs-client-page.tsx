'use client';

import Link from 'next/link';
import { BookOpen, Shield, Globe, Zap } from 'lucide-react';
import { useOpenAPI } from './openapi-context';
import { Badge } from '@/components/ui/badge';

// Security configuration
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
    '/auth',
    '/voice',
    '/tts',
    '/stt',
    '/support/internal',
    '/admin',
    '/activity/track',
    '/analytics/internal',
    '/webhook',
    '/callback',
    '/monitoring',
    '/cron',
    '/search',
    '/location',
    '/local',
    '/workable',
    '/indeed',
    '/integration',
    '/documents',
    '/candidate/job-ai-assessment',
    '/candidate/onboarding-assessment',
    '/candidate/panel-assessment',
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

export function ApiDocsClientPage() {
  const { loading, error, data } = useOpenAPI();

  // Use environment variable for base URL (show full API URL for display)
  const fullApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4300';
  const baseUrl = fullApiUrl.endsWith('/api')
    ? fullApiUrl
    : `${fullApiUrl}/api`;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="space-y-4 text-center">
          <div className="border-primary mx-auto h-12 w-12 animate-spin rounded-full border-b-2"></div>
          <p className="text-muted-foreground">Loading API documentation...</p>
        </div>
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="space-y-4 text-center">
          <div className="bg-destructive/10 border-destructive/20 rounded-lg border p-6">
            <p className="text-destructive font-medium">
              Failed to load API documentation
            </p>
            <p className="text-muted-foreground mt-2">
              Please try refreshing the page
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Group endpoints by tag and filter sensitive ones
  const tagMap: Record<
    string,
    { path: string; method: string; summary: string }[]
  > = {};

  for (const path in data.paths) {
    for (const method in data.paths[path]) {
      const operation = data.paths[path][method];
      const tags = operation.tags || ['General'];

      // Check if this endpoint should be hidden
      if (shouldHideEndpoint(path, tags, method.toUpperCase(), operation)) {
        continue;
      }

      tags.forEach((tag: string) => {
        if (!tagMap[tag]) tagMap[tag] = [];
        tagMap[tag].push({
          path,
          method: method.toUpperCase(),
          summary: operation.summary || path,
        });
      });
    }
  }

  const tags = Object.keys(tagMap);
  const totalEndpoints = Object.values(tagMap).reduce(
    (acc, endpoints) => acc + endpoints.length,
    0
  );

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="space-y-6 text-center">
        <div className="bg-primary/10 text-primary inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium">
          <BookOpen className="h-4 w-4" />
          API Reference
        </div>
        <div className="space-y-4">
          <h1 className="text-foreground text-4xl font-bold tracking-tight">
            {data.info?.title || 'Teamcast API Documentation'}
          </h1>
          <p className="text-muted-foreground mx-auto max-w-3xl text-xl leading-relaxed">
            {data.info?.description ||
              'Complete API reference for integrating with the Teamcast platform. Build powerful hiring and talent management solutions.'}
          </p>
        </div>
        <div className="text-muted-foreground flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/5 border-primary/20">
              Version {data.info?.version || '1.0'}
            </Badge>
          </div>
          {data.info?.contact?.email && (
            <div className="flex items-center gap-2">
              <span>Support:</span>
              <Link
                href={`mailto:${data.info.contact.email}`}
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                {data.info.contact.email}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick Start Guide */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-card border-border rounded-lg border p-6 shadow-sm transition-shadow hover:shadow-md">
          <div className="mb-4 flex items-center gap-3">
            <div className="bg-primary/10 rounded-lg p-2">
              <Shield className="text-primary h-5 w-5" />
            </div>
            <h3 className="text-foreground text-lg font-semibold">
              Authentication
            </h3>
          </div>
          <p className="text-muted-foreground mb-4">
            Secure your API requests with Bearer token authentication.
          </p>
          <div className="bg-muted rounded-lg p-4">
            <code className="text-foreground font-mono text-sm">
              Authorization: Bearer YOUR_TOKEN
            </code>
          </div>
        </div>

        <div className="bg-card border-border rounded-lg border p-6 shadow-sm transition-shadow hover:shadow-md">
          <div className="mb-4 flex items-center gap-3">
            <div className="bg-primary/10 rounded-lg p-2">
              <Globe className="text-primary h-5 w-5" />
            </div>
            <h3 className="text-foreground text-lg font-semibold">Base URL</h3>
          </div>
          <p className="text-muted-foreground mb-4">
            All API endpoints are relative to our secure base URL.
          </p>
          <div className="bg-muted rounded-lg p-4">
            <code className="text-foreground font-mono text-sm break-all">
              {baseUrl}
            </code>
          </div>
        </div>

        <div className="bg-card border-border rounded-lg border p-6 shadow-sm transition-shadow hover:shadow-md">
          <div className="mb-4 flex items-center gap-3">
            <div className="bg-primary/10 rounded-lg p-2">
              <Zap className="text-primary h-5 w-5" />
            </div>
            <h3 className="text-foreground text-lg font-semibold">
              Rate Limits
            </h3>
          </div>
          <p className="text-muted-foreground mb-4">
            Generous rate limits to support your integration needs.
          </p>
          <div className="bg-muted rounded-lg p-4">
            <code className="text-foreground font-mono text-sm">
              1000 requests/hour
            </code>
          </div>
        </div>
      </div>

      {/* API Overview */}
      <div className="bg-card border-border rounded-lg border p-8 shadow-sm">
        <h2 className="text-foreground mb-6 text-2xl font-bold">
          API Overview
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="text-foreground mb-3 text-lg font-semibold">
              Getting Started
            </h3>
            <p className="text-muted-foreground mb-4">
              The Teamcast API is organized around REST principles. Our API has
              predictable resource-oriented URLs, accepts form-encoded request
              bodies, returns JSON-encoded responses, and uses standard HTTP
              response codes.
            </p>
            <ul className="text-muted-foreground space-y-2">
              <li className="flex items-center gap-2">
                <div className="bg-primary h-1.5 w-1.5 rounded-full" />
                RESTful API design
              </li>
              <li className="flex items-center gap-2">
                <div className="bg-primary h-1.5 w-1.5 rounded-full" />
                JSON request/response format
              </li>
              <li className="flex items-center gap-2">
                <div className="bg-primary h-1.5 w-1.5 rounded-full" />
                Standard HTTP status codes
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-foreground mb-3 text-lg font-semibold">
              Available Endpoints
            </h3>
            <p className="text-muted-foreground mb-4">
              Explore our comprehensive set of public endpoints covering core
              hiring functionality.
            </p>
            <div className="space-y-2">
              {tags.slice(0, 4).map((tag) => (
                <div
                  key={tag}
                  className="bg-muted flex items-center justify-between rounded-lg px-3 py-2"
                >
                  <span className="text-foreground font-medium">{tag}</span>
                  <Badge variant="secondary" className="text-xs">
                    {tagMap[tag].length} endpoints
                  </Badge>
                </div>
              ))}
              {tags.length > 4 && (
                <div className="pt-2 text-center">
                  <span className="text-muted-foreground text-sm">
                    + {tags.length - 4} more categories ({totalEndpoints} total
                    endpoints)
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-primary/5 border-primary/20 rounded-lg border p-6">
        <div className="flex items-start gap-4">
          <div className="bg-primary/10 rounded-lg p-2">
            <Shield className="text-primary h-5 w-5" />
          </div>
          <div className="space-y-2">
            <h3 className="text-foreground text-lg font-semibold">
              Security & Access
            </h3>
            <p className="text-muted-foreground">
              This documentation shows only public endpoints and non-sensitive
              API operations. Internal endpoints for payments, support,
              analytics, and administrative functions are not exposed in public
              documentation for security reasons.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs">
                <Shield className="mr-1 h-3 w-3" />
                Public APIs Only
              </Badge>
              <Badge variant="outline" className="text-xs">
                Sensitive Endpoints Hidden
              </Badge>
              <Badge variant="outline" className="text-xs">
                Authentication Required
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

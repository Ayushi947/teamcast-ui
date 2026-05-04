'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronDown,
  ChevronRight,
  BookOpen,
  Zap,
  Users,
  Shield,
  Settings,
  Database,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOpenAPI } from './openapi-context';
import { Badge } from '@/components/ui/badge';

function getTagIcon(tag: string) {
  const tagIcons: Record<string, typeof BookOpen> = {
    Authentication: Shield,
    Users: Users,
    Jobs: Zap,
    Candidates: Users,
    Applications: BookOpen,
    Settings: Settings,
    Analytics: Database,
    General: BookOpen,
    Crons: Settings,
    Monitoring: Database,
  };
  return tagIcons[tag] || BookOpen;
}

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

export function ApiDocsSidebar() {
  const { loading, error, data } = useOpenAPI();
  const [expandedTags, setExpandedTags] = useState<Set<string>>(
    new Set(['Authentication', 'Users', 'Jobs'])
  );
  const pathname = usePathname();

  const toggleTag = (tag: string) => {
    const newExpanded = new Set(expandedTags);
    if (newExpanded.has(tag)) {
      newExpanded.delete(tag);
    } else {
      newExpanded.add(tag);
    }
    setExpandedTags(newExpanded);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="space-y-4 text-center">
          <div className="border-primary mx-auto h-8 w-8 animate-spin rounded-full border-b-2"></div>
          <p className="text-muted-foreground text-sm">Loading API docs...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border-destructive/20 rounded-lg border p-4">
          <p className="text-destructive text-sm font-medium">
            Failed to load API documentation
          </p>
          <p className="text-muted-foreground mt-1 text-xs">
            Please try refreshing the page
          </p>
        </div>
      </div>
    );
  }

  // Group endpoints by tag and filter sensitive ones
  const tagMap: Record<
    string,
    Array<{ path: string; method: string; summary: string; operation: any }>
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
          operation,
        });
      });
    }
  }

  // Sort tags: put common ones first, then alphabetically
  const priorityTags = [
    'Authentication',
    'Users',
    'Jobs',
    'Candidates',
    'Applications',
  ];
  const sortedTags = Object.keys(tagMap).sort((a, b) => {
    const aPriority = priorityTags.indexOf(a);
    const bPriority = priorityTags.indexOf(b);

    if (aPriority !== -1 && bPriority !== -1) {
      return aPriority - bPriority;
    }
    if (aPriority !== -1) return -1;
    if (bPriority !== -1) return 1;

    return a.localeCompare(b);
  });

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="border-sidebar-border border-b p-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 rounded-lg p-2">
            <BookOpen className="text-primary h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sidebar-foreground text-lg font-semibold">
              API Reference
            </h2>
            <p className="text-muted-foreground text-sm">
              {sortedTags.length} categories
            </p>
          </div>
        </div>
      </div>

      {/* API Categories */}
      <div className="p-4">
        <div className="space-y-2">
          {sortedTags.map((tag) => {
            const Icon = getTagIcon(tag);
            const isExpanded = expandedTags.has(tag);
            const endpoints = tagMap[tag];
            const isAuthRequiredTag = AUTH_REQUIRED_TAGS.some((authTag) =>
              tag.toLowerCase().includes(authTag)
            );

            return (
              <div key={tag} className="space-y-1">
                <button
                  onClick={() => toggleTag(tag)}
                  className="hover:bg-sidebar-accent text-sidebar-foreground flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="text-primary h-4 w-4" />
                    <span className="font-medium">{tag}</span>
                    {isAuthRequiredTag && (
                      <Badge variant="outline" className="text-xs">
                        <Shield className="mr-1 h-3 w-3" />
                        Public Only
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {endpoints.length}
                    </Badge>
                    {isExpanded ? (
                      <ChevronDown className="text-muted-foreground h-4 w-4" />
                    ) : (
                      <ChevronRight className="text-muted-foreground h-4 w-4" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="ml-4 space-y-1">
                    {endpoints.map((endpoint, index) => {
                      const href = `/apis${endpoint.path}`;
                      const isActive = pathname === href;

                      return (
                        <Link
                          key={`${endpoint.path}-${endpoint.method}-${index}`}
                          href={href}
                          className={cn(
                            'group flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
                            isActive
                              ? 'bg-primary/10 text-primary'
                              : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground'
                          )}
                        >
                          <div className="flex-1 truncate">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className={cn(
                                  'text-xs',
                                  getMethodColor(endpoint.method)
                                )}
                              >
                                {endpoint.method}
                              </Badge>
                              <span className="truncate font-mono text-xs">
                                {endpoint.path}
                              </span>
                            </div>
                            <p className="text-muted-foreground mt-1 truncate text-xs">
                              {endpoint.summary}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="border-sidebar-border border-t p-4">
        <div className="bg-primary/5 border-primary/20 rounded-lg border p-3">
          <div className="flex items-center gap-2">
            <Shield className="text-primary h-4 w-4" />
            <span className="text-foreground text-sm font-medium">
              Security Notice
            </span>
          </div>
          <p className="text-muted-foreground mt-1 text-xs">
            Sensitive endpoints are hidden from public documentation. Some
            categories show public endpoints only.
          </p>
        </div>
      </div>
    </div>
  );
}

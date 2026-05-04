'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, ArrowRight, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { workableService } from '@/lib/services/services';
import { IWorkableValidationResponse } from '@/lib/shared';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { IntegrationIcon, MicrosoftTeamsIcon } from '@/components/icons';
import { logger } from '@/lib/logger';
import { integrationCommonService } from '@/lib/services/services';

// Define a type for integration status
type IntegrationStatus = 'connected' | 'not_connected' | 'checking';

// Define a type for integration
interface Integration {
  name: string;
  icon: React.ReactNode;
  description: string;
  href: string;
  checkConnection?: () => Promise<boolean>;
  key?: string;
}

// Define a type for integration category
interface IntegrationCategory {
  name: string;
  integrations: Integration[];
}

// Integration categories with their respective integrations
const INTEGRATION_CATEGORIES: IntegrationCategory[] = [
  {
    name: 'AI Agent Integrations',
    integrations: [
      {
        name: 'MCP Clients',
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <path d="M12 8V4H8" />
            <rect width="16" height="12" x="4" y="8" rx="2" />
            <path d="M2 14h2" />
            <path d="M20 14h2" />
            <path d="M15 13v2" />
            <path d="M9 13v2" />
          </svg>
        ),
        description:
          'Model Context Protocol (MCP) clients for AI agent integrations. Enable external AI agents to interact with your recruitment workflow.',
        href: '/app/client/integrations/mcp',
        key: 'mcp',
      },
    ],
  },
  {
    name: 'Applicant Tracking Systems (ATS)',
    integrations: [
      {
        name: 'Workable',
        icon: (
          <img
            src="https://cdn.brandfetch.io/idZFaFXnOU/w/180/h/180/theme/dark/logo.png?c=1bxid64Mup7aczewSAYMX&t=1745005062571"
            alt="Workable"
            width={20}
            height={20}
            className="h-5 w-5"
          />
        ),
        description:
          'Workable is an all-in-one HR platform with a top-tier Applicant Tracking System and flexible HRIS to help you hire faster and manage teams efficiently.',
        href: '/app/client/integrations/workable/settings',
        checkConnection: async () => {
          try {
            const integrationId = localStorage.getItem(
              'workable_integration_id'
            );
            if (!integrationId) return false;

            const result: IWorkableValidationResponse =
              await workableService.validateConnection(integrationId);
            return result.isValid;
          } catch {
            return false;
          }
        },
      },
    ],
  },
  {
    name: 'Video Conferencing',
    integrations: [
      {
        name: 'Zoom',
        icon: (
          <img
            src="https://cdn.brandfetch.io/idZFaFXnOU/w/180/h/180/theme/dark/logo.png?c=1bxid64Mup7aczewSAYMX&t=1745005062571"
            alt="Zoom"
            width={20}
            height={20}
            className="h-5 w-5"
          />
        ),
        description: 'Schedule and manage interviews',
        href: '/app/client/integrations/zoom/settings',
      },
      {
        name: 'Microsoft Teams',
        icon: <MicrosoftTeamsIcon width={20} height={20} className="h-5 w-5" />,
        description: 'Integrate interview scheduling',
        href: '/app/client/integrations/teams/settings',
      },
    ],
  },
  {
    name: 'Communication',
    integrations: [
      {
        name: 'Slack',
        icon: (
          <img
            src="https://cdn.brandfetch.io/idZFaFXnOU/w/180/h/180/theme/dark/logo.png?c=1bxid64Mup7aczewSAYMX&t=1745005062571"
            alt="Slack"
            width={20}
            height={20}
            className="h-5 w-5"
          />
        ),
        description: 'Receive notifications and updates',
        href: '/app/client/integrations/slack/settings',
      },
    ],
  },
  {
    name: 'Calendar',
    integrations: [
      {
        name: 'Google Calendar',
        icon: (
          <img
            src="https://cdn.brandfetch.io/idZFaFXnOU/w/180/h/180/theme/dark/logo.png?c=1bxid64Mup7aczewSAYMX&t=1745005062571"
            alt="Google Calendar"
            width={20}
            height={20}
            className="h-5 w-5"
          />
        ),
        description: 'Sync interviews and events',
        href: '/app/client/integrations/google-calendar/settings',
      },
    ],
  },
];

const IntegrationCard = ({
  name,
  icon: Icon,
  description,
  href,
  checkConnection,
  status: explicitStatus,
}: Integration & { status?: IntegrationStatus }) => {
  const [status, setStatus] = useState<IntegrationStatus>('not_connected');
  const [connectionDetails, setConnectionDetails] = useState<string | null>(
    null
  );

  const updateConnectionStatus = useCallback(async () => {
    if (checkConnection) {
      try {
        const isConnected = await checkConnection();
        setStatus(isConnected ? 'connected' : 'not_connected');

        if (isConnected) {
          let connectionDetailsText = 'Integration successfully established';
          const connectedEmail = localStorage.getItem('google_calendar_email');

          switch (name) {
            case 'Workable':
              connectionDetailsText =
                'Workable integration active. Sync in progress.';
              break;
            case 'Google Calendar':
              connectionDetailsText = `Synced with ${connectedEmail || 'Google Calendar'}`;
              break;
            case 'Microsoft Teams':
              connectionDetailsText = 'Interview scheduling synchronized';
              break;
          }
          setConnectionDetails(connectionDetailsText);
        }
      } catch {
        setStatus('not_connected');
      }
    }
  }, [name, checkConnection]);

  useEffect(() => {
    if (explicitStatus) {
      setStatus(explicitStatus);
    } else {
      setStatus('checking');
      updateConnectionStatus();
    }
  }, [explicitStatus, updateConnectionStatus]);

  const isConnected = status === 'connected';
  const isChecking = status === 'checking';

  return (
    <Card
      className={`group hover:border-primary/50 relative overflow-hidden border border-neutral-200 transition-all duration-300 ease-in-out dark:border-neutral-700 ${isChecking ? 'opacity-60' : 'hover:shadow-xl'} hover:ring-primary/20 rounded-xl bg-white hover:ring-2 dark:bg-neutral-900`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {Icon && (
              <div className="group-hover:bg-primary/10 rounded-lg bg-neutral-100 p-2 transition-all duration-300 group-hover:scale-105 dark:bg-neutral-800">
                {Icon}
              </div>
            )}
            <div className="flex items-center space-x-2">
              <CardTitle className="group-hover:text-primary text-base font-semibold text-neutral-800 transition-colors duration-300 dark:text-neutral-200">
                {name}
              </CardTitle>
              {isConnected && (
                <Badge
                  variant="outline"
                  className="border-green-200 bg-green-50 px-2 py-0.5 text-[0.65rem] text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-300"
                >
                  Connected
                </Badge>
              )}
            </div>
          </div>
          {isConnected && (
            <div className="relative flex h-3 w-3 items-center justify-center">
              <div className="absolute z-10 h-2.5 w-2.5 rounded-full bg-green-500" />
              <div className="absolute z-0 h-3 w-3 animate-ping rounded-full border-2 border-green-500/30" />
              <div className="absolute z-0 h-3 w-3 rounded-full border-2 border-green-500/30" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="space-y-3">
          <p className="line-clamp-2 min-h-[2.5rem] text-sm text-neutral-600 transition-colors duration-300 group-hover:text-neutral-800 dark:text-neutral-400 dark:group-hover:text-neutral-200">
            {description}
          </p>

          {isConnected && connectionDetails && (
            <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 transition-all duration-300 group-hover:bg-green-100 dark:border-green-800 dark:bg-green-900/30 dark:group-hover:bg-green-900/50">
              <p className="text-xs font-medium text-green-700 dark:text-green-300">
                {connectionDetails}
              </p>
            </div>
          )}

          <Link href={href} className="mt-3 block">
            <Button
              variant={isConnected ? 'outline' : 'default'}
              size="sm"
              disabled={isChecking}
              className={`w-full transition-all duration-300 ease-in-out ${
                isConnected
                  ? 'hover:bg-primary hover:text-white'
                  : 'bg-primary hover:bg-primary/90'
              } text-foreground group-hover:scale-[1.02] hover:shadow-md active:scale-[0.98] ${isChecking ? 'cursor-not-allowed opacity-50' : ''} `}
            >
              {isChecking
                ? 'Checking...'
                : isConnected
                  ? 'Manage Connection'
                  : 'Connect Integration'}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

// Define integration types
interface IntegrationType {
  name: string;
  category: string;
  icon: React.ReactNode;
  description: string;
  href: string;
  comingSoon?: boolean;
  complexity?: 'Easy' | 'Medium' | 'Complex';
}

// Integration types
const INTEGRATION_TYPES: IntegrationType[] = [
  {
    name: 'Workable',
    category: 'Applicant Tracking Systems (ATS)',
    icon: (
      <img
        src="https://cdn.brandfetch.io/idZFaFXnOU/w/180/h/180/theme/dark/logo.png?c=1bxid64Mup7aczewSAYMX&t=1745005062571"
        alt="Workable"
        width={20}
        height={20}
        className="h-5 w-5"
      />
    ),
    description:
      'Workable is an all-in-one HR platform with a top-tier Applicant Tracking System and flexible HRIS to help you hire faster and manage teams efficiently.',
    href: '/app/client/integrations/workable',
    complexity: 'Easy',
  },
  {
    name: 'Indeed',
    category: 'Job Boards',
    icon: (
      <img
        src="https://cdn.brandfetch.io/idFE_fwV-w/w/800/h/1161/theme/dark/symbol.png?c=1bxid64Mup7aczewSAYMX&t=1671038550746"
        alt="Indeed"
        width={20}
        height={20}
        className="h-6 w-4"
      />
    ),
    description: 'Import candidates and jobs seamlessly',
    href: '/app/client/integrations/indeed',
    comingSoon: true,
    complexity: 'Medium',
  },
  {
    name: 'Zoom',
    category: 'Video Conferencing',
    icon: (
      <img
        src="https://cdn.brandfetch.io/id3aO4Szj3/w/140/h/139/theme/dark/symbol.png?c=1bxid64Mup7aczewSAYMX&t=1668070435617"
        alt="Zoom"
        width={20}
        height={20}
        className="h-5 w-5"
      />
    ),
    description: 'Schedule and manage interviews',
    href: '/app/client/integrations/zoom',
    comingSoon: true,
    complexity: 'Easy',
  },
  {
    name: 'Microsoft Teams',
    category: 'Video Conferencing',
    icon: <MicrosoftTeamsIcon width={20} height={20} className="h-5 w-5" />,
    description: 'Integrate interview scheduling',
    href: '/app/client/integrations/teams',
    comingSoon: true,
    complexity: 'Medium',
  },
  {
    name: 'Slack',
    category: 'Communication',
    icon: (
      <img
        src="https://cdn.brandfetch.io/idJ_HhtG0Z/w/800/h/800/theme/dark/symbol.png?c=1bxid64Mup7aczewSAYMX&t=1745381296843"
        alt="Slack"
        width={20}
        height={20}
        className="h-10 w-10"
      />
    ),
    description: 'Receive notifications and updates',
    href: '/app/client/integrations/slack',
    comingSoon: true,
    complexity: 'Easy',
  },
];

// Complexity color mapping
const COMPLEXITY_COLORS = {
  Easy: 'bg-green-50 text-green-600 border-green-200',
  Medium: 'bg-yellow-50 text-yellow-600 border-yellow-200',
  Complex: 'bg-red-50 text-red-600 border-red-200',
};

export default function IntegrationsPage() {
  const [activeIntegrations, setActiveIntegrations] = useState<Integration[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isNewConnectionDialogOpen, setIsNewConnectionDialogOpen] =
    useState(false);

  useEffect(() => {
    // Collect active integrations
    const fetchActiveIntegrations = async () => {
      setIsLoading(true);
      try {
        const active: Integration[] = [];

        // Get all integration data details from the common service
        const integrationDetails =
          await integrationCommonService.getIntegrationDataSummary();

        if (integrationDetails && integrationDetails.length > 0) {
          // Check each integration category and see if any match the active integrations
          for (const category of INTEGRATION_CATEGORIES) {
            for (const integration of category.integrations) {
              // Check if this integration is in the active integrations list
              const isActive = integrationDetails.some(
                (activeIntegration) =>
                  activeIntegration.providerName.toLowerCase() ===
                  (integration.key || integration.name.toLowerCase())
              );
              if (isActive) {
                active.push(integration);
              }
            }
          }
        }

        setActiveIntegrations(active);
      } catch (error) {
        logger.error('Error fetching active integrations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActiveIntegrations();
  }, []);

  // Group integrations by category
  const categorizedIntegrations = INTEGRATION_TYPES.reduce(
    (acc, integration) => {
      if (!acc[integration.category]) {
        acc[integration.category] = [];
      }
      acc[integration.category].push(integration);
      return acc;
    },
    {} as Record<string, IntegrationType[]>
  );

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-300px)] items-center justify-center p-8">
        <div className="flex flex-col items-center space-y-4">
          <Loader2
            className="text-primary h-12 w-12 animate-spin"
            strokeWidth={2}
          />
          <p className="text-muted-foreground text-sm">
            Checking integrations...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col items-start justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
        <div className="flex-grow">
          <h1 className="text-primary text-2xl font-bold">
            Integrations
            <span className="ml-2 rounded-full bg-yellow-100 px-2 py-0.5 text-[12px] font-bold text-yellow-700">
              beta
            </span>
          </h1>
          <p className="text-muted-foreground text-sm">
            Connected third-party tools to enhance your hiring workflow
          </p>
        </div>
        <Button
          variant="default"
          className="flex w-full items-center gap-2 sm:w-auto"
          onClick={() => setIsNewConnectionDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
          New Connection
        </Button>
      </div>

      {/* New Connection Dialog */}
      <Dialog
        open={isNewConnectionDialogOpen}
        onOpenChange={setIsNewConnectionDialogOpen}
      >
        <DialogContent className="flex h-[90vh] max-w-[95%] flex-col md:max-w-5xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold sm:text-2xl">
              Add New Integration
            </DialogTitle>
            <DialogDescription className="text-sm">
              Enhance your hiring workflow by connecting powerful tools
            </DialogDescription>
          </DialogHeader>

          {/* Integrations Grid */}
          <div className="flex-grow overflow-y-auto">
            <div className="space-y-6 py-4">
              {Object.entries(categorizedIntegrations).map(
                ([category, integrations]) => (
                  <div key={category} className="space-y-4">
                    <h2 className="text-lg font-semibold">{category}</h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {integrations.map((integration) => (
                        <div
                          key={integration.name}
                          className={cn(
                            'rounded-lg border transition-all duration-300 hover:shadow-lg',
                            integration.comingSoon
                              ? 'cursor-not-allowed opacity-50'
                              : 'hover:border-primary hover:bg-accent/10 cursor-pointer'
                          )}
                        >
                          <div className="flex h-full flex-col space-y-4 p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                {integration.icon}
                                <span className="font-semibold">
                                  {integration.name}
                                </span>
                              </div>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Badge
                                      variant="outline"
                                      className={cn(
                                        'rounded-full px-2 py-1 text-xs',
                                        integration.comingSoon
                                          ? 'bg-gray-100 text-gray-600'
                                          : COMPLEXITY_COLORS[
                                              integration.complexity || 'Easy'
                                            ]
                                      )}
                                    >
                                      {integration.comingSoon
                                        ? 'Coming Soon'
                                        : integration.complexity}
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {integration.comingSoon
                                      ? 'This integration is not yet available'
                                      : `Integration Complexity: ${integration.complexity}`}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            <p className="text-muted-foreground line-clamp-2 flex-grow text-sm">
                              {integration.description}
                            </p>
                            <div className="mt-auto">
                              {!integration.comingSoon ? (
                                <Link
                                  href={integration.href}
                                  onClick={() =>
                                    setIsNewConnectionDialogOpen(false)
                                  }
                                  className="block"
                                >
                                  <Button
                                    variant="outline"
                                    className="group w-full"
                                  >
                                    Connect
                                    <ArrowRight className="ml-2 h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                                  </Button>
                                </Link>
                              ) : (
                                <Button
                                  variant="outline"
                                  disabled
                                  className="w-full cursor-not-allowed"
                                >
                                  Coming Soon
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Active Integrations Section */}
      {activeIntegrations.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Active Integrations</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeIntegrations.map((integration) => (
              <IntegrationCard
                key={integration.name}
                {...integration}
                status="connected"
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex min-h-[calc(100vh-300px)] flex-col items-center justify-center p-8">
          <div className="w-full max-w-md rounded-xl border p-8 text-center">
            <div className="mb-6 flex justify-center">
              <IntegrationIcon
                size="60"
                className="text-primary mx-auto opacity-80"
              />
            </div>
            <h3 className="text-primary mb-3 text-2xl font-bold">
              No active integrations
            </h3>
            <p className="text-muted-foreground mb-6 text-sm">
              Connect your first integration to streamline your hiring workflow
              and enhance team productivity
            </p>
            <Button
              variant="default"
              size="lg"
              onClick={() => setIsNewConnectionDialogOpen(true)}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Integration
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

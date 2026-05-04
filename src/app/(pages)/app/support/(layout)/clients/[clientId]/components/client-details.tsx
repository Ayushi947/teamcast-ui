'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { CustomTabs } from '@/components/ui/custom-tabs';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supportClientManagementService } from '@/lib/services/services';
import { ICompanyVerificationStatus, UserRoleEnum } from '@/lib/shared';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Edit,
  Loader2,
  XCircle,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { UpdateClientDialog } from './update-client-dialog';
import { OverviewTab } from './details-tabs/overview-tab';
import { SettingsTab } from './details-tabs/settings-tab';
import { SubscriptionTab } from './details-tabs/subscription-tab';
import { JobPostingsTab } from './details-tabs/job-postings-tab';
import { ClientUsersTab } from './details-tabs/client-users-tab';
import { UserInvitesTab } from './details-tabs/user-invites-tab';
import { McpKeyTab } from './details-tabs/mcp-key-tab';
import { FeatureFlagsTab } from './details-tabs/feature-flags-tab';
import { cn, formatEnumValue } from '@/lib/utils';
import { useApp } from '@/lib/context/app-context';
import { VerifyClientDialog } from './verify-client-dialog';

interface ClientDetailsProps {
  clientId: string;
}

export function ClientDetails({ clientId }: ClientDetailsProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [verifyClientDialogOpen, setVerifyClientDialogOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useApp();

  const {
    data: client,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['support-client', clientId],
    queryFn: () => supportClientManagementService.getSupportClient(clientId),
  });

  const handleClientUpdated = () => {
    refetch();
  };

  const handleBackFromDetails = () => {
    // Preserve query parameters from the current URL to return to the same table state
    const params = new URLSearchParams();

    // Get tab, page, pageSize, sortBy, sortOrder from current URL
    const tab = searchParams.get('tab') || 'clients';
    const page = searchParams.get('page');
    const pageSize = searchParams.get('pageSize');
    const sortBy = searchParams.get('sortBy');
    const sortOrder = searchParams.get('sortOrder');

    // Only add params if they exist and are not defaults
    if (tab) params.set('tab', tab);
    if (page && page !== '1') params.set('page', page);
    if (pageSize && pageSize !== '10') params.set('pageSize', pageSize);
    if (sortBy && sortBy !== 'createdAt') params.set('sortBy', sortBy);
    if (sortOrder && sortOrder !== 'desc') params.set('sortOrder', sortOrder);

    const queryString = params.toString();
    router.push(`/app/support/clients${queryString ? `?${queryString}` : ''}`);
  };

  // Check if user is account manager
  const isAccountManager = user?.role === UserRoleEnum.ACCOUNT_MANAGER;
  const canManageMcpKey =
    user?.role === UserRoleEnum.ADMIN ||
    user?.role === UserRoleEnum.TECHNICAL_SUPPORT;
  const canManageFeatureFlags = user?.role === UserRoleEnum.ADMIN;

  if (isLoading) {
    return <ClientDetailsSkeleton />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Error Loading Client
          </h3>
          <p className="mb-4 text-center text-gray-600">
            Unable to load client details. Please try again.
          </p>
          <Button onClick={() => refetch()} variant="outline">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!client) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Client Not Found
          </h3>
          <p className="text-center text-gray-600">
            The requested client could not be found.
          </p>
        </CardContent>
      </Card>
    );
  }

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'subscription', label: 'Subscription' },
    { key: 'job-postings', label: 'Job Postings' },
    { key: 'client-users', label: 'Users' },
    { key: 'user-invites', label: 'Invites' },
    { key: 'settings', label: 'Settings' },
    ...(canManageFeatureFlags
      ? [{ key: 'feature-flags', label: 'Feature Flags' }]
      : []),
    ...(canManageMcpKey ? [{ key: 'mcp-key', label: 'MCP Key' }] : []),
  ];

  return (
    <div className="mx-auto space-y-6 rounded-xl p-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handleBackFromDetails}
          className="bg-secondary text-secondary-foreground gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Clients
        </Button>
        {!isAccountManager && (
          <div className="flex space-x-2">
            {client.company?.status !== ICompanyVerificationStatus.VERIFIED && (
              <VerifyClientDialog
                open={verifyClientDialogOpen}
                onOpenChange={setVerifyClientDialogOpen}
                clientId={clientId}
                companyId={client.company?.id || ''}
                clientDetails={client}
              />
            )}
            {/* Only show edit button for non-account managers */}
            <UpdateClientDialog
              client={client}
              onClientUpdated={handleClientUpdated}
              trigger={
                <Button variant="default" className="gap-2 px-4">
                  <Edit className="h-3.5 w-3.5" />
                  Edit Client
                </Button>
              }
            />
          </div>
        )}
      </div>
      <div className="mt-4 mb-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="relative">
              <Avatar className="h-14 w-14 border-2 border-white shadow-sm dark:border-gray-600">
                <AvatarImage
                  src={client?.profile?.basic?.logoUrl || ''}
                  alt={client?.company?.name}
                  className="object-cover"
                />
                <AvatarFallback className="bg-primary text-base font-semibold text-white">
                  {client.company?.name
                    ?.split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .toUpperCase() || 'CL'}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -right-1 -bottom-1 rounded-full border-2 border-white bg-green-500 p-0.5 dark:border-gray-600">
                <div className="h-2 w-2 rounded-full bg-white" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-xl font-semibold text-gray-900 dark:text-white">
                {client.company?.name || 'Unnamed Client'}
              </h1>
              <p className="mt-0.5 text-base font-medium text-gray-600 dark:text-gray-300">
                Client Organization
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {client.company?.status && (
                  <span
                    className={cn(
                      'flex items-center gap-2 rounded-full px-2 py-0.5 text-xs',
                      client.company?.status ===
                        ICompanyVerificationStatus.VERIFIED
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : client.company?.status ===
                            ICompanyVerificationStatus.IN_PROGRESS
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : client.company?.status ===
                              ICompanyVerificationStatus.REJECTED
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                    )}
                  >
                    {client.company?.status ===
                    ICompanyVerificationStatus.VERIFIED ? (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    ) : client.company?.status ===
                      ICompanyVerificationStatus.IN_PROGRESS ? (
                      <Loader2 className="h-3 w-3 animate-spin text-yellow-500" />
                    ) : client.company?.status ===
                      ICompanyVerificationStatus.REJECTED ? (
                      <XCircle className="h-3 w-3 text-red-500 dark:text-red-400" />
                    ) : (
                      <XCircle className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                    )}
                    {formatEnumValue(client.company?.status)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <CustomTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        className="w-full"
      />

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && <OverviewTab client={client} />}
        {activeTab === 'subscription' && <SubscriptionTab client={client} />}
        {activeTab === 'job-postings' && (
          <JobPostingsTab
            key={`job-postings-${Date.now()}`}
            clientId={clientId}
            isActive={true}
          />
        )}
        {activeTab === 'client-users' && (
          <ClientUsersTab
            key={`client-users-${Date.now()}`}
            clientId={clientId}
            isActive={true}
          />
        )}
        {activeTab === 'user-invites' && (
          <UserInvitesTab
            key={`user-invites-${Date.now()}`}
            clientId={clientId}
            isActive={true}
          />
        )}

        {activeTab === 'settings' && <SettingsTab client={client} />}
        {activeTab === 'feature-flags' && (
          <FeatureFlagsTab clientId={clientId} isActive={true} />
        )}

        {activeTab === 'mcp-key' && (
          <McpKeyTab
            clientId={clientId}
            clientName={client.company?.name}
            isActive={true}
          />
        )}
      </div>
    </div>
  );
}

function ClientDetailsSkeleton() {
  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto px-4 py-4">
        {/* Header Skeleton */}
        <div className="mb-6">
          <div className="mb-3 flex items-center">
            <div className="bg-muted h-8 w-32 animate-pulse rounded" />
          </div>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="bg-muted h-14 w-14 animate-pulse rounded-full" />
              <div className="space-y-2">
                <div className="bg-muted h-6 w-48 animate-pulse rounded" />
                <div className="bg-muted h-4 w-32 animate-pulse rounded" />
                <div className="flex gap-2">
                  <div className="bg-muted h-5 w-16 animate-pulse rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className="space-y-4">
          <div className="bg-card grid h-11 w-full grid-cols-6 rounded-lg border p-1 shadow-sm">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-muted h-8 animate-pulse rounded" />
            ))}
          </div>

          {/* Content Skeleton */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="bg-card h-96 animate-pulse rounded-lg shadow-sm" />
            </div>
            <div className="space-y-6">
              <div className="bg-card h-48 animate-pulse rounded-lg shadow-sm" />
              <div className="bg-card h-48 animate-pulse rounded-lg shadow-sm" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

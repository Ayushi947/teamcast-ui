'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { CustomTabs } from '@/components/ui/custom-tabs';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supportPartnerManagementService } from '@/lib/services/services';
import { AlertCircle, ArrowLeft, Edit } from 'lucide-react';

import { UpdatePartnerDialog } from './update-partner-dialog';
import { OverviewTab } from './details-tabs/overview-tab';

import { PartnerUsersTab } from './details-tabs/partner-users-tab';
import { UserInvitesTab } from './details-tabs/user-invites-tab';
import { SettingsTab } from './details-tabs/settings-tab';
import { useRouter } from 'next/navigation';

interface PartnerDetailsProps {
  partnerId: string;
}

export function PartnerDetails({ partnerId }: PartnerDetailsProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const router = useRouter();

  const {
    data: partner,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['support-partner', partnerId],
    queryFn: () => supportPartnerManagementService.getSupportPartner(partnerId),
  });

  const handlePartnerUpdated = () => {
    refetch();
  };

  const handleBackFromDetails = () => {
    router.push('/app/support/partners');
  };

  if (isLoading) {
    return <PartnerDetailsSkeleton />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Error Loading Partner
          </h3>
          <p className="mb-4 text-center text-gray-600">
            Unable to load partner details. Please try again.
          </p>
          <Button onClick={() => refetch()} variant="outline">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!partner) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Partner Not Found
          </h3>
          <p className="text-center text-gray-600">
            The requested partner could not be found.
          </p>
        </CardContent>
      </Card>
    );
  }

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'partner-users', label: 'Users' },
    { key: 'user-invites', label: 'Invites' },
    { key: 'settings', label: 'Settings' },
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
          Back to Partners
        </Button>

        <div className="flex space-x-2">
          <UpdatePartnerDialog
            partner={partner}
            onPartnerUpdated={handlePartnerUpdated}
            trigger={
              <Button variant="default" className="h-10 gap-2 px-4">
                <Edit className="h-4 w-4" />
                Edit Partner
              </Button>
            }
          />
        </div>
      </div>
      <div className="mt-4 mb-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="relative">
              <Avatar className="h-14 w-14 border-2 border-white shadow-sm dark:border-gray-600">
                <AvatarImage
                  src={partner?.logoUrl || ''}
                  alt={partner?.companyName}
                  className="object-cover"
                />
                <AvatarFallback className="bg-primary text-base font-semibold text-white">
                  {partner.companyName
                    ?.split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .toUpperCase() || 'PT'}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -right-1 -bottom-1 rounded-full border-2 border-white bg-green-500 p-0.5 dark:border-gray-600">
                <div className="h-2 w-2 rounded-full bg-white" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-xl font-semibold text-gray-900 dark:text-white">
                {partner.companyName || 'Unnamed Partner'}
              </h1>
              <p className="mt-0.5 text-base font-medium text-gray-600 dark:text-gray-300">
                {partner.email}
              </p>
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
        {activeTab === 'overview' && <OverviewTab partner={partner} />}

        {activeTab === 'partner-users' && (
          <PartnerUsersTab
            key={`partner-users-${Date.now()}`}
            partnerId={partnerId}
            isActive={true}
          />
        )}
        {activeTab === 'user-invites' && (
          <UserInvitesTab
            key={`user-invites-${Date.now()}`}
            partnerId={partnerId}
            isActive={true}
          />
        )}

        {activeTab === 'settings' && <SettingsTab partner={partner} />}
      </div>
    </div>
  );
}

function PartnerDetailsSkeleton() {
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
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className="space-y-4">
          <div className="bg-card grid h-11 w-full grid-cols-4 rounded-lg border p-1 shadow-sm">
            {Array.from({ length: 4 }).map((_, i) => (
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

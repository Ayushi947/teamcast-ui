'use client';

import { useEffect, useState, useCallback } from 'react';
import { ClientsList } from './components/clients-list';
import { AddClientDialog } from './components/add-client-dialog';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  supportClientManagementService,
  supportInvitationService,
} from '@/lib/services/services';
import { Loader2 } from 'lucide-react';
import { SupportInvitationTypeEnum } from '@/lib/shared';
import { ClientsHeader } from './components/clients-header';
import { InvitationsList } from './components/invitations-list';
import { CustomTabs } from '@/components/ui/custom-tabs';
import { useRouter, useSearchParams } from 'next/navigation';

const clientTabs = ['clients', 'invitations'] as const;

type ClientsTabKey = (typeof clientTabs)[number];

const normalizeTabKey = (value: string | null): ClientsTabKey => {
  if (!value) {
    return 'clients';
  }

  return clientTabs.includes(value as ClientsTabKey)
    ? (value as ClientsTabKey)
    : 'clients';
};

export default function ClientsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');

  const [activeTab, setActiveTab] = useState<ClientsTabKey>(() =>
    normalizeTabKey(tabParam)
  );
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const normalizedTab = normalizeTabKey(tabParam);
    if (normalizedTab !== activeTab) {
      setActiveTab(normalizedTab);
    }
  }, [tabParam, activeTab]);

  const updateTabInUrl = useCallback(
    (nextTab: ClientsTabKey) => {
      const params = new URLSearchParams(window.location.search);
      params.set('tab', nextTab);
      params.delete('page');
      params.delete('pageSize');
      params.delete('sortBy');
      params.delete('sortOrder');

      const queryString = params.toString();
      router.replace(
        `/app/support/clients${queryString ? `?${queryString}` : ''}`,
        { scroll: false }
      );
    },
    [router]
  );

  const handleTabChange = useCallback(
    (nextTabKey: string) => {
      const normalized = normalizeTabKey(nextTabKey);
      setActiveTab(normalized);
      updateTabInUrl(normalized);
    },
    [updateTabInUrl]
  );

  const { data: clientsData, isLoading: isLoadingClients } = useQuery({
    queryKey: ['support-clients', activeTab],
    queryFn: async () => {
      const response = await supportClientManagementService.listSupportClients({
        page: 1,
        limit: 10,
      });
      return response;
    },
  });

  const { data: invitationsData, isLoading: isLoadingInvites } = useQuery({
    queryKey: ['support-client-invitations', activeTab],
    queryFn: async () => {
      const response = await supportInvitationService.getSupportInvitations({
        page: 1,
        limit: 10,
        type: SupportInvitationTypeEnum.CLIENT,
      });
      return response;
    },
  });

  const handleInviteClient = () => {
    setIsInviteDialogOpen(true);
  };

  const handleInviteDialogChange = (open: boolean) => {
    setIsInviteDialogOpen(open);
  };

  const handleInviteSuccess = () => {
    // Invalidate both queries to refresh the data
    queryClient.invalidateQueries({
      queryKey: ['supportClientInvitations'],
    });
    queryClient.invalidateQueries({ queryKey: ['support-clients'] });

    if (activeTab !== 'invitations') {
      setActiveTab('invitations');
    }
  };

  if (isLoadingClients || isLoadingInvites) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  const tabs = [
    {
      key: 'clients',
      label: `Clients (${clientsData?.pagination?.total || 0})`,
    },
    {
      key: 'invitations',
      label: `Invitations (${invitationsData?.pagination?.total || 0})`,
    },
  ];

  return (
    <div className="p-4">
      <ClientsHeader onInviteClick={handleInviteClient} />

      <div className="mt-6">
        <CustomTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          className="mb-4"
        />

        {activeTab === 'clients' && (
          <div className="space-y-4">
            <ClientsList />
          </div>
        )}

        {activeTab === 'invitations' && (
          <div className="space-y-4">
            <InvitationsList />
          </div>
        )}
      </div>

      <AddClientDialog
        open={isInviteDialogOpen}
        onOpenChange={handleInviteDialogChange}
        onInviteSuccess={handleInviteSuccess}
      />
    </div>
  );
}

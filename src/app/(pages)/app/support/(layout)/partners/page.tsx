'use client';

import { useState } from 'react';
import { PartnersList } from './components/partners-list';
import { InvitationsList } from './components/invitations-list';
import { CustomTabs } from '@/components/ui/custom-tabs';
import { AddPartnerDialog } from './components/add-partner-dialog';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  supportPartnerManagementService,
  supportInvitationService,
} from '@/lib/services/services';
import { Loader2 } from 'lucide-react';
import { SupportInvitationTypeEnum } from '@/lib/shared';
import { PartnersHeader } from './components/partners-header';

export default function PartnersPage() {
  const [activeTab, setActiveTab] = useState('partners');
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: partnersData, isLoading: isLoadingPartners } = useQuery({
    queryKey: ['support-partners', activeTab],
    queryFn: async () => {
      const response =
        await supportPartnerManagementService.listSupportPartners({
          page: 1,
          limit: 10,
        });
      return response;
    },
  });

  const { data: invitationsData, isLoading: isLoadingInvites } = useQuery({
    queryKey: ['support-partner-invitations', activeTab],
    queryFn: async () => {
      const response = await supportInvitationService.getSupportInvitations({
        page: 1,
        limit: 10,
        type: SupportInvitationTypeEnum.PARTNER,
      });
      return response;
    },
  });

  const handleInvitePartner = () => {
    setIsInviteDialogOpen(true);
  };

  const handleInviteDialogChange = (open: boolean) => {
    setIsInviteDialogOpen(open);
  };

  const handleInviteSuccess = () => {
    // Invalidate both queries to refresh the data
    queryClient.invalidateQueries({
      queryKey: ['supportPartnerInvitations'],
    });
    queryClient.invalidateQueries({ queryKey: ['support-partners'] });

    if (activeTab !== 'invitations') {
      setActiveTab('invitations');
    }
  };

  if (isLoadingPartners || isLoadingInvites) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  const tabs = [
    {
      key: 'partners',
      label: `Partners (${partnersData?.pagination?.total || 0})`,
    },
    {
      key: 'invitations',
      label: `Invitations (${invitationsData?.pagination?.total || 0})`,
    },
  ];

  return (
    <div className="p-4">
      <PartnersHeader onInviteClick={handleInvitePartner} />

      <div className="mt-6">
        <CustomTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          className="mb-4"
        />

        {activeTab === 'partners' && (
          <div className="space-y-4">
            <PartnersList />
          </div>
        )}

        {activeTab === 'invitations' && (
          <div className="space-y-4">
            <InvitationsList />
          </div>
        )}
      </div>

      <AddPartnerDialog
        open={isInviteDialogOpen}
        onOpenChange={handleInviteDialogChange}
        onInviteSuccess={handleInviteSuccess}
      />
    </div>
  );
}

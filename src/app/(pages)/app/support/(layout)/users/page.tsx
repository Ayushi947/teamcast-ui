'use client';

import { useState, useEffect } from 'react';
import { UsersList } from './components/users-list';
import { InvitationsList } from './components/invitations-list';
import { UsersHeader } from './components/users-header';
import { CustomTabs } from '@/components/ui/custom-tabs';
import { AddSupportUserDialog } from './components/add-support-user-dialog';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  supportUserManagementService,
  supportInvitationService,
  supportAccountManagerAssignmentService,
} from '@/lib/services/services';
import { Loader2 } from 'lucide-react';
import { SupportInvitationTypeEnum } from '@/lib/shared';

export default function SupportUsersPage() {
  const [activeTab, setActiveTab] = useState('users');
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isPageInteractable, setIsPageInteractable] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (!isPageInteractable) {
      timeoutId = setTimeout(() => {
        setIsPageInteractable(true);
      }, 10000);
    }
    return () => {
      clearTimeout(timeoutId);
    };
  }, [isPageInteractable]);

  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['support-users', activeTab],
    queryFn: async () => {
      const response = await supportUserManagementService.getSupportUsers({
        page: 1,
        limit: 10,
      });
      return response;
    },
  });

  const { data: invitationsData, isLoading: isLoadingInvites } = useQuery({
    queryKey: ['support-user-invitations', activeTab],
    queryFn: async () => {
      const response = await supportInvitationService.getSupportInvitations({
        page: 1,
        limit: 10,
        type: SupportInvitationTypeEnum.SUPPORT_USER,
      });
      return response;
    },
  });

  // Fetch account managers for the dialog
  const { data: accountManagers, isLoading: isLoadingAccountManagers } =
    useQuery({
      queryKey: ['account-managers'],
      queryFn: async () => {
        return await supportAccountManagerAssignmentService.getAllAccountManagers();
      },
    });

  const handleInviteUser = () => {
    // Set page as not interactable temporarily
    setIsPageInteractable(false);

    // Use a small timeout to avoid blocking the UI
    setTimeout(() => {
      setIsInviteDialogOpen(true);
      // Make page interactable after dialog is fully open
      setTimeout(() => {
        setIsPageInteractable(true);
      }, 300);
    }, 10);
  };

  const handleInviteDialogChange = (open: boolean) => {
    if (!open) {
      // First close the dialog
      setIsInviteDialogOpen(false);

      // Briefly make page not interactable during transition
      setIsPageInteractable(false);

      // Then make the page interactable again after a delay
      setTimeout(() => {
        setIsPageInteractable(true);
      }, 300);
    } else {
      setIsInviteDialogOpen(open);
    }
  };

  const handleInviteSuccess = () => {
    // Invalidate both queries to refresh the data
    queryClient.invalidateQueries({ queryKey: ['supportUserInvitations'] });
    queryClient.invalidateQueries({ queryKey: ['support-users'] });

    // If they were viewing the invitations tab, stay there, otherwise switch to it
    if (activeTab !== 'invitations') {
      setActiveTab('invitations');
    }
  };

  const handleDataChange = () => {
    // Invalidate all users queries to trigger a refetch
    queryClient.invalidateQueries({ queryKey: ['support-users'] });
    queryClient.invalidateQueries({ queryKey: ['supportUserInvitations'] });
  };

  if (isLoadingUsers || isLoadingInvites || isLoadingAccountManagers) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  const tabs = [
    { key: 'users', label: `Users (${usersData?.pagination?.total || 0})` },
    {
      key: 'invitations',
      label: `Invitations (${invitationsData?.pagination?.total || 0})`,
    },
  ];

  return (
    <div
      className="text-foreground mx-auto p-4"
      style={{ pointerEvents: isPageInteractable ? 'auto' : 'none' }}
    >
      <UsersHeader onInviteClick={handleInviteUser} />

      <div className="mt-6">
        <CustomTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          className="mb-4"
        />

        {activeTab === 'users' && (
          <div className="space-y-4">
            <UsersList onChange={handleDataChange} />
          </div>
        )}

        {activeTab === 'invitations' && (
          <div className="space-y-4">
            <InvitationsList />
          </div>
        )}
      </div>

      {/* Add support user dialog - always render the component, control visibility with open prop */}
      <AddSupportUserDialog
        open={isInviteDialogOpen}
        onOpenChange={handleInviteDialogChange}
        onInviteSuccess={handleInviteSuccess}
        isInviteMode={true}
        accountManagers={accountManagers || []}
      />
    </div>
  );
}

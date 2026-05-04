'use client';

import { useState, useEffect } from 'react';
import { UsersList } from './components/users-list';
import { InvitationsList } from './components/invitations-list';
import { UsersHeader } from './components/users-header';
import { CustomTabs } from '@/components/ui/custom-tabs';
import { InviteUserDialog } from './components/invite-user-dialog';

export default function AdministrationPage() {
  const [activeTab, setActiveTab] = useState('users');
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isPageInteractable, setIsPageInteractable] = useState(true);
  const [invitationsRefreshTrigger, setInvitationsRefreshTrigger] = useState(0);

  // Add a global click handler to debug interaction issues
  useEffect(() => {
    // Safety mechanism - if the page is not interactable for more than 10 seconds,
    // force it to be interactable again (in case we have a stuck UI)
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
    // Trigger refresh of invitations list
    setInvitationsRefreshTrigger((prev) => prev + 1);

    // If they were viewing the invitations tab, stay there, otherwise switch to it
    if (activeTab !== 'invitations') {
      setActiveTab('invitations');
    }
  };

  // Define tabs configuration
  const tabs = [
    {
      key: 'users',
      label: 'Users',
    },
    {
      key: 'invitations',
      label: 'Invitations',
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

        <div className="space-y-4">
          {activeTab === 'users' && <UsersList />}
          {activeTab === 'invitations' && (
            <InvitationsList refreshTrigger={invitationsRefreshTrigger} />
          )}
        </div>
      </div>

      {/* Invite user dialog - always render the component, control visibility with open prop */}
      <InviteUserDialog
        open={isInviteDialogOpen}
        onOpenChange={handleInviteDialogChange}
        onInviteSuccess={handleInviteSuccess}
      />
    </div>
  );
}

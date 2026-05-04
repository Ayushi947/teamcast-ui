'use client';

import { useState } from 'react';
import { JobInvitesList } from './components/job-invites-list';
import { CustomTabs } from '@/components/ui/custom-tabs';
import { JobInvitesHeader } from './components/job-invites-header';

export default function JobInvitesPage() {
  const [activeTab, setActiveTab] = useState('invites');
  const [pendingInvitesCount, setPendingInvitesCount] = useState(0);
  const [invitesLength, setInvitesLength] = useState(0);

  const tabs = [
    {
      key: 'invites',
      label: `Job Invites (${invitesLength})`,
    },
    {
      key: 'pending',
      label: `Pending (${pendingInvitesCount})`,
    },
  ];

  return (
    <div className="p-4">
      <JobInvitesHeader />

      <div className="mt-6">
        <CustomTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          className="mb-4"
        />

        <div className="space-y-4">
          <JobInvitesList
            setInvitesLength={setInvitesLength}
            activeTab={activeTab}
            setPendingInvitesCount={setPendingInvitesCount}
          />
        </div>
      </div>
    </div>
  );
}

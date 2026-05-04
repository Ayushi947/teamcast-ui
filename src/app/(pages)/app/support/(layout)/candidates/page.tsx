'use client';

import { useEffect, useState, useCallback } from 'react';
import { CandidatesList } from './components/candidates-list';
import { InvitationsList } from './components/invitations-list';
import { PendingPublishList } from './components/pending-publish-list';
import { CampaignInvitationsList } from './components/campaign-invitations-list';
import { CustomTabs } from '@/components/ui/custom-tabs';
import { AddCandidateDialog } from './components/add-candidate-dialog';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  supportCandidateManagementService,
  supportInvitationService,
} from '@/lib/services/services';
import { Loader2 } from 'lucide-react';
import {
  SupportInvitationStatusEnum,
  SupportInvitationTypeEnum,
} from '@/lib/shared';
import { CandidatesHeader } from './components/candidates-header';
import { useRouter, useSearchParams } from 'next/navigation';

const candidateTabs = [
  'candidates',
  'invitations',
  'pending-publish',
  'campaign-invitations',
] as const;

type CandidatesTabKey = (typeof candidateTabs)[number];

const normalizeTabKey = (value: string | null): CandidatesTabKey => {
  if (!value) {
    return 'candidates';
  }

  return candidateTabs.includes(value as CandidatesTabKey)
    ? (value as CandidatesTabKey)
    : 'candidates';
};

export default function CandidatesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');

  const [activeTab, setActiveTab] = useState<CandidatesTabKey>(() =>
    normalizeTabKey(tabParam)
  );
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const [filterCountChange, setFilterCountChange] = useState(false);
  const [showYoursFilter, setShowYoursFilter] = useState<'ALL' | 'YOURS'>(
    'ALL'
  );

  useEffect(() => {
    const normalizedTab = normalizeTabKey(tabParam);
    if (normalizedTab !== activeTab) {
      setActiveTab(normalizedTab);
    }
  }, [tabParam, activeTab]);

  const updateTabInUrl = useCallback(
    (nextTab: CandidatesTabKey) => {
      const params = new URLSearchParams(window.location.search);
      params.set('tab', nextTab);
      params.delete('page');
      params.delete('pageSize');
      params.delete('sortBy');
      params.delete('sortOrder');

      const queryString = params.toString();
      router.replace(
        `/app/support/candidates${queryString ? `?${queryString}` : ''}`,
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

  const { data: candidatesData, isLoading: isLoadingCandidates } = useQuery({
    queryKey: ['support-candidates'],
    queryFn: async () => {
      const response =
        await supportCandidateManagementService.getSupportCandidates({
          page: 1,
          limit: 10,
        });
      return response;
    },
  });

  const { data: invitationsData, isLoading: isLoadingInvites } = useQuery({
    queryKey: [
      'support-candidate-invitations',
      filterCountChange,
      showYoursFilter,
    ],
    queryFn: async () => {
      const response = await supportInvitationService.getSupportInvitations({
        page: 1,
        limit: 10,
        type: SupportInvitationTypeEnum.CANDIDATE,
        showYours: showYoursFilter === 'YOURS',
      });
      return response;
    },
  });

  const { data: campaignInvitationsData, isLoading: isLoadingCampaignInvites } =
    useQuery({
      queryKey: [
        'support-campaign-invitations-count',
        filterCountChange,
        showYoursFilter,
      ],
      queryFn: async () => {
        const response =
          await supportInvitationService.getAllSupportInvitations({
            page: 1,
            limit: 10,
            showYours: showYoursFilter === 'YOURS',
            status: SupportInvitationStatusEnum.PENDING,
            isCampaign: true,
          });
        return response;
      },
    });

  const { data: recommendedCandidatesData, isLoading: isLoadingRecommended } =
    useQuery({
      queryKey: ['support-recommended-candidates-count'],
      queryFn: async () => {
        const response =
          await supportCandidateManagementService.getRecommendedCandidates({
            page: 1,
            limit: 10,
          });
        return response;
      },
    });

  const handleInviteCandidate = () => {
    setIsInviteDialogOpen(true);
  };

  const handleInviteDialogChange = (open: boolean) => {
    setIsInviteDialogOpen(open);
  };

  const handleInviteSuccess = () => {
    // Invalidate both queries to refresh the data
    queryClient.invalidateQueries({
      queryKey: ['support-candidate-invitations'],
    });
    queryClient.invalidateQueries({ queryKey: ['support-candidates'] });

    if (activeTab !== 'invitations') {
      handleTabChange('invitations');
    }
  };

  const handleUploadSuccess = () => {
    // Invalidate queries to refresh the data after upload
    queryClient.invalidateQueries({
      queryKey: ['support-candidate-invitations'],
    });
    queryClient.invalidateQueries({ queryKey: ['support-candidates'] });

    // Switch to campaign-invitations tab to show the uploaded data
    if (activeTab !== 'campaign-invitations') {
      handleTabChange('campaign-invitations');
    }
  };

  // Show loading only when the active tab's data is loading
  const getActiveTabLoading = () => {
    switch (activeTab) {
      case 'candidates':
        return isLoadingCandidates;
      case 'invitations':
        return isLoadingInvites;
      case 'campaign-invitations':
        return isLoadingCampaignInvites;
      case 'pending-publish':
        return isLoadingRecommended;
      default:
        return false;
    }
  };

  if (getActiveTabLoading()) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  const tabs = [
    {
      key: 'candidates',
      label: `Candidates (${candidatesData?.pagination?.total || 0})`,
    },
    {
      key: 'invitations',
      label: `Invitations (${invitationsData?.pagination?.total || 0})`,
    },
    {
      key: 'pending-publish',
      label: `Pending Publish (${recommendedCandidatesData?.pagination?.total || 0})`,
    },
    {
      key: 'campaign-invitations',
      label: `Campaign Invitations (${campaignInvitationsData?.pagination?.total || 0})`,
    },
  ];

  return (
    <div className="p-4">
      <CandidatesHeader
        onInviteClick={handleInviteCandidate}
        onUploadSuccess={handleUploadSuccess}
      />

      <div className="mt-6">
        <CustomTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          className="mb-4"
        />

        {activeTab === 'candidates' && (
          <div className="space-y-4">
            <CandidatesList initialData={candidatesData} />
          </div>
        )}

        {activeTab === 'invitations' && (
          <div className="space-y-4">
            <InvitationsList
              setFilterCountChange={setFilterCountChange}
              filterCountChange={filterCountChange}
              showYoursFilter={showYoursFilter}
              setShowYoursFilter={setShowYoursFilter}
            />
          </div>
        )}

        {activeTab === 'campaign-invitations' && (
          <div className="space-y-4">
            <CampaignInvitationsList
              setFilterCountChange={setFilterCountChange}
              filterCountChange={filterCountChange}
              showYoursFilter={showYoursFilter}
              setShowYoursFilter={setShowYoursFilter}
            />
          </div>
        )}

        {activeTab === 'pending-publish' && (
          <div className="space-y-4">
            <PendingPublishList />
          </div>
        )}
      </div>

      <AddCandidateDialog
        open={isInviteDialogOpen}
        onOpenChange={handleInviteDialogChange}
        onInviteSuccess={handleInviteSuccess}
        isInviteMode={true}
      />
    </div>
  );
}

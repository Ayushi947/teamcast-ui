'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { formatEnumValue } from '@/lib/utils';
import {
  ISupportJobPostingInviteDetail,
  JobInviteStatusEnum,
} from '@/lib/shared';
import {
  Send,
  XCircle,
  Eye,
  Building,
  Calendar,
  Loader2,
  Copy,
  Check,
} from 'lucide-react';
import SaasDataTable, {
  SaasTableColumn,
  SaasTableAction,
  SaasTableFilter,
  SaasPaginationInfo,
} from '@/components/app/common/tables/saas-data-table';
import { useQuery } from '@tanstack/react-query';
import {
  supportJobPostingInviteService,
  supportCandidateManagementService,
} from '@/lib/services/services';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { CandidateDetailsDialog } from './candidate-details-dialog';

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

interface JobInvitesListProps {
  activeTab: string;
  setInvitesLength: (length: number) => void;
  setPendingInvitesCount: (count: number) => void;
}

export function JobInvitesList({
  activeTab,
  setInvitesLength,
  setPendingInvitesCount,
}: JobInvitesListProps) {
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    (JobInviteStatusEnum | 'ALL')[]
  >(['ALL']);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedCandidateEmail, setSelectedCandidateEmail] = useState<
    string | null
  >(null);
  const [isCandidateDetailsOpen, setIsCandidateDetailsOpen] = useState(false);
  const [copiedInvitationId, setCopiedInvitationId] = useState<string | null>(
    null
  );

  const debouncedSearchValue = useDebounce(searchValue, 500);

  // Reset to first page when search, filters, or page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchValue, statusFilter, pageSize, sortBy, sortOrder]);

  const {
    data: invitesData,
    isLoading: isLoadingInvites,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      'support-job-invites',
      activeTab,
      currentPage,
      pageSize,
      sortBy,
      sortOrder,
      debouncedSearchValue,
      statusFilter,
    ],
    queryFn: async () => {
      // Prepare status filter for API - convert array to comma-separated string
      const filteredStatuses = statusFilter.filter(
        (status) => status !== 'ALL'
      );
      const statusFilterForApi =
        statusFilter.includes('ALL') || filteredStatuses.length === 0
          ? undefined
          : filteredStatuses.join(',');

      const response =
        await supportJobPostingInviteService.getJobPostingInvitesBySupportUserId(
          {
            page: currentPage,
            limit: pageSize,
            sortBy,
            sortOrder,
            search: debouncedSearchValue,
            status: statusFilterForApi as JobInviteStatusEnum,
          }
        );

      // Update parent component with counts
      setInvitesLength(response.pagination.total || 0);

      // Calculate pending invites count from the response
      const pendingCount =
        response.items?.filter(
          (invite: ISupportJobPostingInviteDetail) =>
            invite.status === JobInviteStatusEnum.PENDING
        ).length || 0;
      setPendingInvitesCount(pendingCount);

      return response;
    },
    enabled: true,
  });

  if (isLoadingInvites) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">Failed to load job invites</p>
          <p className="text-muted-foreground text-sm">
            Please try again later
          </p>
        </div>
      </div>
    );
  }

  // Handle sort change
  const handleSortChange = (
    field: string | null,
    order: 'asc' | 'desc' | null
  ) => {
    setSortBy(field || '');
    setSortOrder(order || 'desc');
  };

  const handleRefresh = () => {
    setCurrentPage(1);
    setSearchValue('');
    setStatusFilter(['ALL']);
    setPageSize(10);
    setSortBy('createdAt');
    setSortOrder('desc');
    refetch();
    toast.success('Job invites refreshed');
  };

  const handleSendReminder = async (invite: ISupportJobPostingInviteDetail) => {
    try {
      // Find the corresponding candidate by email
      const candidatesResponse =
        await supportCandidateManagementService.getSupportCandidates({
          page: 1,
          limit: 1,
          search: invite.email,
        });

      const candidate = candidatesResponse.items?.[0];

      if (!candidate) {
        toast.error('Candidate not found for this invite');
        return;
      }

      // Use the same onboarding reminder API as candidates-list
      await supportCandidateManagementService.sendOnboardingReminder({
        candidateId: candidate.id,
      });

      refetch();

      toast.success('Reminder sent', {
        description: invite.email
          ? `Onboarding reminder sent to ${invite.email}`
          : 'Onboarding reminder sent to the candidate.',
      });
    } catch (error: any) {
      logger.error('Failed to send reminder from job invite:', error);

      toast.error('Failed to send reminder', {
        description:
          error?.message ?? 'An error occurred while sending the reminder.',
      });
    }
  };

  const handleWithdrawInvite = async (
    invite: ISupportJobPostingInviteDetail
  ) => {
    try {
      await supportJobPostingInviteService.withdrawJobPostingInvite(invite.id);
      refetch();
      toast.success('Invite withdrawn successfully');
    } catch (error) {
      logger.error('Failed to withdraw invite:', error);
      toast.error('Failed to withdraw invite');
    }
  };

  const handleViewCandidateDetails = (
    invite: ISupportJobPostingInviteDetail
  ) => {
    setSelectedCandidateEmail(invite.email);
    setIsCandidateDetailsOpen(true);
  };

  const handleCopyInvitationUrl = async (
    invite: ISupportJobPostingInviteDetail
  ) => {
    if (!invite.invitationUrl) {
      toast.error('Invitation URL not available');
      return;
    }

    try {
      await navigator.clipboard.writeText(invite.invitationUrl);
      setCopiedInvitationId(invite.id);
      toast.success('Job invitation link copied to clipboard');

      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopiedInvitationId(null);
      }, 2000);
    } catch (error) {
      toast.error('Failed to copy invitation link');
      logger.error('Error copying invitation URL:', error);
    }
  };

  const handleResendInvite = async (invite: ISupportJobPostingInviteDetail) => {
    try {
      await supportJobPostingInviteService.resendJobPostingInvite(invite.id);
      refetch();
      toast.success('Invite resent successfully');
    } catch (error) {
      logger.error('Failed to resend invite:', error);
      toast.error('Failed to resend invite');
    }
  };

  const getStatusBadgeVariant = (status: JobInviteStatusEnum) => {
    switch (status) {
      case JobInviteStatusEnum.PENDING:
        return 'secondary';
      case JobInviteStatusEnum.ACCEPTED:
        return 'default';
      case JobInviteStatusEnum.DECLINED:
        return 'destructive';
      case JobInviteStatusEnum.EXPIRED:
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const columns: SaasTableColumn<ISupportJobPostingInviteDetail>[] = [
    {
      key: 'candidate',
      label: 'Candidate',
      render: (invite) => (
        <div className="flex flex-col">
          <span className="font-medium">{invite.name}</span>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">
              {invite.email}
            </span>
            {invite.invitationUrl && (
              <button
                onClick={() => handleCopyInvitationUrl(invite)}
                className="rounded-md p-1 transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                title="Copy job invitation link"
              >
                {copiedInvitationId === invite.id ? (
                  <Check className="h-3 w-3 text-green-600" />
                ) : (
                  <Copy className="h-3 w-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />
                )}
              </button>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'job',
      label: 'Job',
      render: (invite) => (
        <div className="flex flex-col">
          <span className="font-medium">
            {invite.jobPosting?.title || 'N/A'}
          </span>
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Building className="h-3 w-3" />
            <span>{invite.jobPosting?.client?.company?.name || 'N/A'}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (invite) => (
        <Badge variant={getStatusBadgeVariant(invite.status)}>
          {formatEnumValue(invite.status)}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'Sent Date',
      render: (invite) => (
        <div className="flex items-center gap-2">
          <Calendar className="text-muted-foreground h-4 w-4" />
          <span>{format(new Date(invite.createdAt), 'MMM dd, yyyy')}</span>
        </div>
      ),
    },
    {
      key: 'expiresAt',
      label: 'Expires',
      render: (invite) => (
        <div className="flex items-center gap-2">
          <Calendar className="text-muted-foreground h-4 w-4" />
          <span>{format(new Date(invite.expiresAt), 'MMM dd, yyyy')}</span>
        </div>
      ),
    },
  ];

  const actions: SaasTableAction<ISupportJobPostingInviteDetail>[] = [
    {
      key: 'view',
      label: 'View Details',
      icon: <Eye className="h-4 w-4" />,
      onClick: handleViewCandidateDetails,
    },
    {
      key: 'resend',
      label: 'Resend Invite',
      icon: <Send className="h-4 w-4" />,
      onClick: handleResendInvite,
      hidden: (invite) =>
        invite.status !== JobInviteStatusEnum.EXPIRED &&
        invite.status !== JobInviteStatusEnum.WITHDRAWN,
    },
    {
      key: 'send-reminder',
      label: 'Send Reminder',
      icon: <Send className="h-4 w-4" />,
      onClick: handleSendReminder,
      hidden: (invite) => invite.status !== JobInviteStatusEnum.ACCEPTED,
    },
    {
      key: 'withdraw',
      label: 'Withdraw Invite',
      icon: <XCircle className="h-4 w-4" />,
      onClick: handleWithdrawInvite,
      variant: 'destructive',
      hidden: (invite) =>
        invite.status !== JobInviteStatusEnum.PENDING &&
        invite.status !== JobInviteStatusEnum.EXPIRED,
    },
  ];

  const filters: SaasTableFilter[] = [
    {
      key: 'status',
      label: 'Status',
      type: 'multiselect',
      placeholder: 'Select status',
      value: statusFilter,
      onChange: (value) => {
        if (Array.isArray(value)) {
          setStatusFilter(value as (JobInviteStatusEnum | 'ALL')[]);
        } else {
          setStatusFilter([value as JobInviteStatusEnum | 'ALL']);
        }
        setCurrentPage(1);
      },
      options: [
        { label: 'All Status', value: 'ALL' },
        ...Object.values(JobInviteStatusEnum).map((status) => ({
          label: formatEnumValue(status),
          value: status,
        })),
      ],
    },
  ];

  // Extract data and transform to match table expectations
  const invites: ISupportJobPostingInviteDetail[] = invitesData?.items || [];
  const totalPages = invitesData?.pagination?.totalPages || 1;
  const totalItems = invitesData?.pagination?.total || 0;

  // Pagination configuration
  const pagination: SaasPaginationInfo = {
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    onPageChange: setCurrentPage,
    onPageSizeChange: setPageSize,
    pageSizeOptions: PAGE_SIZE_OPTIONS,
    sortBy,
    sortOrder,
    onSortChange: handleSortChange,
  };

  return (
    <>
      <SaasDataTable<ISupportJobPostingInviteDetail>
        columns={columns}
        data={invites}
        actions={actions}
        isLoading={isLoadingInvites}
        searchable={true}
        searchValue={searchValue}
        searchPlaceholder="Search invites by candidate, job, or company..."
        onSearchChange={setSearchValue}
        filters={filters}
        pagination={pagination}
        onRefresh={handleRefresh}
        emptyState={{
          title: 'No job invites found',
          description: 'Try adjusting your search criteria or filters',
        }}
        getRowKey={(invite) => invite.id}
      />

      {/* Candidate Details Dialog */}
      <CandidateDetailsDialog
        open={isCandidateDetailsOpen}
        onOpenChange={setIsCandidateDetailsOpen}
        candidateEmail={selectedCandidateEmail || ''}
      />
    </>
  );
}

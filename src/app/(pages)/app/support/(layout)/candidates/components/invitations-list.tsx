'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { formatEnumValue } from '@/lib/utils';
import {
  ISupportInvitation,
  SupportInvitationStatusEnum,
  SupportInvitationTypeEnum,
} from '@/lib/shared';
import { supportInvitationService } from '@/lib/services/services';
import { Send, XCircle, Copy, Check } from 'lucide-react';
import SaasDataTable, {
  SaasTableColumn,
  SaasTableAction,
  SaasTableFilter,
  SaasPaginationInfo,
} from '@/components/app/common/tables/saas-data-table';
import { useTableQueryParams } from '@/lib/hooks/use-table-query-params';

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export function InvitationsList({
  setFilterCountChange,
  filterCountChange,
  showYoursFilter,
  setShowYoursFilter,
}: {
  setFilterCountChange?: (value: boolean) => void;
  filterCountChange?: boolean;
  showYoursFilter?: 'ALL' | 'YOURS';
  setShowYoursFilter?: (value: 'ALL' | 'YOURS') => void;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    (SupportInvitationStatusEnum | 'ALL')[]
  >(['ALL']);
  const [copiedInvitationId, setCopiedInvitationId] = useState<string | null>(
    null
  );

  const {
    page: currentPage,
    pageSize,
    sortBy,
    sortOrder,
    setPage,
    setPageSize,
    setSort,
    requestParams: paginationParams,
  } = useTableQueryParams({
    defaultPage: 1,
    defaultPageSize: 10,
    defaultSortBy: 'createdAt',
    defaultSortOrder: 'desc',
    pageParam: 'page',
    pageSizeParam: 'pageSize',
    requestParamNames: {
      page: 'page',
      pageSize: 'limit',
      sortBy: 'sortBy',
      sortOrder: 'sortOrder',
    },
    preserveDefaultsInQuery: false,
  });
  // Debounce search term - exact same pattern as candidates page
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  // Handle sort change - exact same pattern as candidates page
  const handleSortChange = (
    field: string | null,
    order: 'asc' | 'desc' | null
  ) => {
    setSort(field || '', order || 'desc');
  };

  // Build query parameters for server-side filtering - exact same pattern as candidates page
  const buildQueryParams = () => {
    const params: Record<string, string | number | string[]> = {
      ...paginationParams,
    };

    if (debouncedSearchTerm.trim()) {
      params.search = debouncedSearchTerm.trim();
    }

    if (statusFilter.length > 0 && !statusFilter.includes('ALL')) {
      params.status = statusFilter;
    }

    return params;
  };

  // Server-side query - exact same pattern as candidates page
  const {
    data: invitationsResponse,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [
      'supportInvitations',
      currentPage,
      debouncedSearchTerm,
      statusFilter,
      showYoursFilter,
      pageSize,
      sortBy,
      sortOrder,
    ],
    queryFn: () =>
      supportInvitationService.getSupportInvitations({
        ...buildQueryParams(),
        type: SupportInvitationTypeEnum.CANDIDATE,
        showYours: showYoursFilter === 'YOURS',
      }),
  });

  // Extract data - exact same pattern as candidates page
  const invitations = invitationsResponse?.items || [];
  const totalPages = invitationsResponse?.pagination?.totalPages || 1;
  const totalItems = invitationsResponse?.pagination?.total || 0;

  const handleResendInvite = async (invitation: ISupportInvitation) => {
    if (
      ![
        SupportInvitationStatusEnum.WITHDRAWN,
        SupportInvitationStatusEnum.EXPIRED,
      ].includes(invitation.status)
    ) {
      toast.error('Only expired or withdrawn invitations can be resent');
      return;
    }

    try {
      await supportInvitationService.resendInvitation(invitation.id);
      toast.success('Invitation resent successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to resend invitation');
      logger.error('Error resending invitation:', error);
    }
  };

  const handleWithdrawInvite = async (invitation: ISupportInvitation) => {
    if (
      invitation.status !== SupportInvitationStatusEnum.PENDING &&
      invitation.status !== SupportInvitationStatusEnum.RESEND
    ) {
      toast.error('Only pending or resent invitations can be withdrawn');
      return;
    }

    try {
      await supportInvitationService.withdrawInvitation(invitation.id);
      toast.success('Invitation withdrawn successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to withdraw invitation');
      logger.error('Error withdrawing invitation:', error);
    }
  };

  const handleCopyInvitationUrl = async (invitation: ISupportInvitation) => {
    try {
      const result =
        await supportInvitationService.generateCopiedInvitationToken(
          invitation.id
        );

      // Copy the invitation URL to clipboard
      await navigator.clipboard.writeText(result.invitationUrl);
      setCopiedInvitationId(invitation.id);
      toast.success(
        'Invitation link copied to clipboard! Link expires in 30 minutes.'
      );

      // Log the copied URL for debugging
      logger.info('Copied invitation URL:', {
        invitationId: invitation.id,
        email: invitation.email,
        url: result.invitationUrl,
        expiresInMinutes: result.expiresInMinutes,
      });

      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopiedInvitationId(null);
      }, 2000);
    } catch (error) {
      toast.error('Failed to generate copied invitation link');
      logger.error('Error generating copied invitation:', error);
    }
  };

  // Badge variant helpers - exact same pattern as candidates page
  const getStatusBadgeVariant = (status: SupportInvitationStatusEnum) => {
    switch (status) {
      case SupportInvitationStatusEnum.PENDING:
        return 'default';
      case SupportInvitationStatusEnum.ACCEPTED:
        return 'default';
      case SupportInvitationStatusEnum.EXPIRED:
        return 'secondary';
      case SupportInvitationStatusEnum.WITHDRAWN:
        return 'destructive';
      case SupportInvitationStatusEnum.RESEND:
        return 'outline';
      default:
        return 'default';
    }
  };

  // Table configuration - exact same pattern as candidates page
  const columns: SaasTableColumn<ISupportInvitation>[] = [
    {
      key: 'name',
      label: 'Name',
    },
    {
      key: 'email',
      label: 'Email',
      render: (invitation: ISupportInvitation) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{invitation.email}</span>
          <button
            onClick={() => handleCopyInvitationUrl(invitation)}
            className="rounded-md p-1 transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            title="Copy invitation link"
          >
            {copiedInvitationId === invitation.id ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />
            )}
          </button>
        </div>
      ),
    },
    {
      key: 'jobTitle',
      label: 'Job Title',
      render: (invitation: ISupportInvitation) =>
        invitation.jobTitle || 'Not specified',
    },
    {
      key: 'invitedBy',
      label: 'Invited By',
      render: (invitation: ISupportInvitation) =>
        invitation.invitedBy || 'Unknown',
    },
    {
      key: 'status',
      label: 'Status',
      render: (invitation: ISupportInvitation) => (
        <Badge variant={getStatusBadgeVariant(invitation.status) as any}>
          {formatEnumValue(invitation.status)}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'Invited',
      sortable: true,
      render: (invitation: ISupportInvitation) =>
        invitation.createdAt
          ? format(new Date(invitation.createdAt), 'MMM d, yyyy')
          : '-',
    },
  ];

  // Table actions - exact same pattern as candidates page
  const actions: SaasTableAction<ISupportInvitation>[] = [
    {
      key: 'resend',
      label: 'Resend',
      icon: <Send className="h-4 w-4" />,
      onClick: (invitation: ISupportInvitation) =>
        handleResendInvite(invitation),
      hidden: (invitation: ISupportInvitation) =>
        invitation.status === SupportInvitationStatusEnum.ACCEPTED ||
        invitation.status === SupportInvitationStatusEnum.PENDING ||
        invitation.status === SupportInvitationStatusEnum.RESEND,
    },
    {
      key: 'withdraw',
      label: 'Withdraw',
      icon: <XCircle className="h-4 w-4" />,
      onClick: (invitation: ISupportInvitation) =>
        handleWithdrawInvite(invitation),
      variant: 'destructive',
      hidden: (invitation: ISupportInvitation) =>
        invitation.status !== SupportInvitationStatusEnum.PENDING &&
        invitation.status !== SupportInvitationStatusEnum.RESEND,
    },
  ];

  // Table filters - exact same pattern as candidates page
  const filters: SaasTableFilter[] = [
    {
      key: 'status',
      label: 'Status',
      type: 'multiselect',
      placeholder: 'Select status',
      value: statusFilter,
      onChange: (value) => {
        if (Array.isArray(value)) {
          setStatusFilter(value as (SupportInvitationStatusEnum | 'ALL')[]);
        } else {
          setStatusFilter([value as SupportInvitationStatusEnum | 'ALL']);
        }
        setPage(1);
      },
      options: [
        { label: 'All Status', value: 'ALL' },
        ...Object.values(SupportInvitationStatusEnum).map((status) => ({
          label: formatEnumValue(status),
          value: status,
        })),
      ],
    },
    {
      key: 'showYours',
      label: 'Show',
      type: 'select',
      placeholder: 'Select filter',
      value: showYoursFilter || 'ALL',
      onChange: (value) => {
        setShowYoursFilter?.(value as 'ALL' | 'YOURS');
        setFilterCountChange?.(!filterCountChange);
        setPage(1);
      },
      options: [
        { label: 'All Invitations', value: 'ALL' },
        { label: 'Show Yours', value: 'YOURS' },
      ],
    },
  ];

  // Pagination configuration - exact same pattern as candidates page
  const pagination: SaasPaginationInfo = {
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    onPageChange: setPage,
    onPageSizeChange: setPageSize,
    pageSizeOptions: PAGE_SIZE_OPTIONS,
    sortBy: sortBy ?? undefined,
    sortOrder: sortBy ? sortOrder : undefined,
    onSortChange: handleSortChange,
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Candidate invitations refreshed');
  };

  return (
    <SaasDataTable<ISupportInvitation>
      columns={columns}
      data={invitations}
      actions={actions}
      isLoading={isLoading}
      searchable={true}
      searchValue={searchTerm}
      searchPlaceholder="Search invitations by email or name..."
      onSearchChange={setSearchTerm}
      filters={filters}
      pagination={pagination}
      onRefresh={handleRefresh}
      emptyState={{
        title: 'No invitations found',
        description: 'Try adjusting your search criteria or filters',
      }}
      getRowKey={(invitation) => invitation.id}
    />
  );
}

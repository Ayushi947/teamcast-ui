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
import { Send, XCircle, Copy } from 'lucide-react';
import SaasDataTable, {
  SaasTableColumn,
  SaasTableAction,
  SaasTableFilter,
  SaasPaginationInfo,
} from '@/components/app/common/tables/saas-data-table';

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export function InvitationsList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    (SupportInvitationStatusEnum | 'ALL')[]
  >(['ALL']);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset to first page when page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [pageSize]);

  // Handle sort change
  const handleSortChange = (
    field: string | null,
    order: 'asc' | 'desc' | null
  ) => {
    setSortBy(field || '');
    setSortOrder(order || 'desc');
    setCurrentPage(1);
  };

  // Build query parameters for server-side filtering
  const buildQueryParams = () => {
    const params: Record<string, string | number | string[]> = {
      page: currentPage,
      limit: pageSize,
    };

    if (debouncedSearchTerm.trim()) {
      params.search = debouncedSearchTerm.trim();
    }

    if (statusFilter.length > 0 && !statusFilter.includes('ALL')) {
      params.status = statusFilter;
    }

    if (sortBy && sortOrder) {
      params.sortBy = sortBy;
      params.sortOrder = sortOrder;
    }

    return params;
  };

  // Server-side query
  const {
    data: invitationsResponse,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [
      'supportClientInvitations',
      currentPage,
      debouncedSearchTerm,
      statusFilter,
      pageSize,
      sortBy,
      sortOrder,
    ],
    queryFn: () =>
      supportInvitationService.getSupportInvitations({
        ...buildQueryParams(),
        type: SupportInvitationTypeEnum.CLIENT,
      }),
  });

  // Extract data
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

  const handleCopyInvitation = async (invitation: ISupportInvitation) => {
    try {
      const result =
        await supportInvitationService.generateCopiedInvitationToken(
          invitation.id
        );

      // Copy the invitation URL to clipboard
      await navigator.clipboard.writeText(result.invitationUrl);

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
    } catch (error) {
      toast.error('Failed to generate copied invitation link');
      logger.error('Error generating copied invitation:', error);
    }
  };

  // Badge variant helpers
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

  // Table configuration
  const columns: SaasTableColumn<ISupportInvitation>[] = [
    {
      key: 'email',
      label: 'Email',

      render: (invitation: ISupportInvitation) => (
        <span className="font-medium">{invitation.email}</span>
      ),
    },
    {
      key: 'name',
      label: 'Name',
    },
    {
      key: 'jobTitle',
      label: 'Job Title',

      render: (invitation: ISupportInvitation) =>
        invitation.jobTitle || 'Not specified',
    },
    {
      key: 'companyName',
      label: 'Company',

      render: (invitation: ISupportInvitation) =>
        invitation.companyName || 'Not specified',
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
          : 'N/A',
    },
  ];

  // Table actions
  const actions: SaasTableAction<ISupportInvitation>[] = [
    {
      key: 'copy',
      label: 'Copy Link',
      icon: <Copy className="h-4 w-4" />,
      onClick: (invitation: ISupportInvitation) =>
        handleCopyInvitation(invitation),
      hidden: (invitation: ISupportInvitation) =>
        invitation.status === SupportInvitationStatusEnum.ACCEPTED ||
        invitation.status === SupportInvitationStatusEnum.WITHDRAWN,
    },
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

  // Table filters
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
        setCurrentPage(1);
      },
      options: [
        { label: 'All Status', value: 'ALL' },
        ...Object.values(SupportInvitationStatusEnum).map((status) => ({
          label: formatEnumValue(status),
          value: status,
        })),
      ],
    },
  ];

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
      onRefresh={refetch}
      emptyState={{
        title: 'No invitations found',
        description: 'Try adjusting your search criteria or filters',
      }}
      getRowKey={(invitation) => invitation.id}
    />
  );
}

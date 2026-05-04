'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { XIcon, RefreshCwIcon } from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { formatDistanceToNow } from 'date-fns';
import {
  IClientUserInvitation,
  ClientUserInvitationStatusEnum,
  IPaginatedResponse,
} from '@/lib/shared';
import { clientUserInvitationService } from '@/lib/services/services';
import SaasDataTable, {
  SaasTableColumn,
  SaasTableAction,
  SaasTableFilter,
  SaasPaginationInfo,
} from '@/components/app/common/tables/saas-data-table';

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

interface InvitationsListProps {
  refreshTrigger?: number;
}

export function InvitationsList({ refreshTrigger = 0 }: InvitationsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    (ClientUserInvitationStatusEnum | 'ALL')[]
  >(['ALL']);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Debounce search term - exact same pattern as other pages
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

  // Handle sort change - exact same pattern as other pages
  const handleSortChange = (
    field: string | null,
    order: 'asc' | 'desc' | null
  ) => {
    setSortBy(field || '');
    setSortOrder(order || 'desc');
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  // Build query parameters for server-side filtering - exact same pattern as other pages
  const buildQueryParams = () => {
    const params: Record<string, string | number | boolean> = {
      page: currentPage,
      per_page: pageSize,
    };

    if (debouncedSearchTerm) {
      params.search = debouncedSearchTerm;
    }

    if (statusFilter && statusFilter.length > 0) {
      // Filter out 'ALL' value and only send valid status values
      const validStatuses = statusFilter.filter((status) => status !== 'ALL');
      if (validStatuses.length > 0) {
        params.status = validStatuses.join(',');
      }
    }

    if (sortBy) {
      params.sort_by = sortBy;
      params.sort_order = sortOrder;
    }

    return params;
  };

  // Server-side query - exact same pattern as other pages
  const {
    data: invitationsResponse,
    isLoading,
    refetch,
  } = useQuery<IPaginatedResponse<IClientUserInvitation>>({
    queryKey: [
      'clientUserInvitations',
      currentPage,
      debouncedSearchTerm,
      statusFilter,
      pageSize,
      sortBy,
      sortOrder,
    ],
    queryFn: () =>
      clientUserInvitationService.getUserInvitations(buildQueryParams()),
  });

  // Extract data - exact same pattern as other pages
  const invitations = invitationsResponse?.items || [];
  const totalPages = invitationsResponse?.pagination?.totalPages || 1;
  const totalItems = invitationsResponse?.pagination?.total || 0;

  // Trigger refetch when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger > 0) {
      refetch();
    }
  }, [refreshTrigger, refetch]);

  const handleResendInvite = async (invitation: IClientUserInvitation) => {
    if (
      ![
        ClientUserInvitationStatusEnum.WITHDRAWN,
        ClientUserInvitationStatusEnum.EXPIRED,
      ].includes(invitation.status)
    ) {
      toast.error('Only expired or withdrawn invitations can be resent');
      return;
    }

    try {
      await clientUserInvitationService.resendUserInvitation(invitation.id);

      toast.success('Invite resent', {
        description: `Invitation has been resent to ${invitation.email}.`,
      });

      refetch();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'An error occurred while resending the invitation';

      toast.error('Error resending invite', {
        description: errorMessage,
      });
      logger.error('Error resending invite', error);
    }
  };

  const handleWithdrawInvite = async (invitation: IClientUserInvitation) => {
    try {
      await clientUserInvitationService.withdrawUserInvitation(invitation.id);

      toast.success('Invitation withdrawn', {
        description: `Invitation to ${invitation.email} has been withdrawn.`,
      });

      refetch();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'An error occurred while withdrawing the invitation';

      toast.error('Error withdrawing invitation', {
        description: errorMessage,
      });
      logger.error('Error withdrawing invitation', error);
    }
  };

  // Helper function to get status badge variant
  const getStatusBadgeVariant = (status: ClientUserInvitationStatusEnum) => {
    switch (status) {
      case ClientUserInvitationStatusEnum.ACCEPTED:
        return 'default';
      case ClientUserInvitationStatusEnum.WITHDRAWN:
        return 'destructive';
      case ClientUserInvitationStatusEnum.EXPIRED:
        return 'secondary';
      case ClientUserInvitationStatusEnum.PENDING:
      default:
        return 'outline';
    }
  };

  // Helper function to format enum values
  const formatEnumValue = (value: string) => {
    return value
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Table configuration - exact same pattern as other pages
  const columns: SaasTableColumn<IClientUserInvitation>[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (invitation: IClientUserInvitation) => (
        <span className="font-medium">{invitation.name}</span>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      sortable: false,
    },
    {
      key: 'role',
      label: 'Role',
      sortable: false,
      render: (invitation: IClientUserInvitation) =>
        formatEnumValue(invitation.role),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: false,
      render: (invitation: IClientUserInvitation) => (
        <Badge
          variant={
            getStatusBadgeVariant(
              invitation.status || ClientUserInvitationStatusEnum.PENDING
            ) as any
          }
        >
          {formatEnumValue(
            invitation.status || ClientUserInvitationStatusEnum.PENDING
          )}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'Invited',
      sortable: true,
      render: (invitation: IClientUserInvitation) => (
        <span>{formatDistanceToNow(new Date(invitation.createdAt))} ago</span>
      ),
    },
  ];

  // Table actions - conditional based on invitation status
  const actions: SaasTableAction<IClientUserInvitation>[] = [
    {
      key: 'resend',
      label: 'Resend Invite',
      icon: <RefreshCwIcon className="h-4 w-4" />,
      onClick: (invitation: IClientUserInvitation) =>
        handleResendInvite(invitation),
      hidden: (invitation: IClientUserInvitation) =>
        invitation.status === ClientUserInvitationStatusEnum.ACCEPTED ||
        invitation.status === ClientUserInvitationStatusEnum.PENDING,
    },
    {
      key: 'withdraw',
      label: 'Withdraw Invite',
      icon: <XIcon className="h-4 w-4" />,
      onClick: (invitation: IClientUserInvitation) =>
        handleWithdrawInvite(invitation),
      variant: 'destructive',
      hidden: (invitation: IClientUserInvitation) =>
        invitation.status !== ClientUserInvitationStatusEnum.PENDING,
    },
  ];

  // Table filters - exact same pattern as other pages
  const filters: SaasTableFilter[] = [
    {
      key: 'status',
      label: 'Status',
      type: 'multiselect',
      placeholder: 'Select status',
      value: statusFilter,
      onChange: (value) => {
        if (Array.isArray(value)) {
          setStatusFilter(value as (ClientUserInvitationStatusEnum | 'ALL')[]);
        } else {
          setStatusFilter([value as ClientUserInvitationStatusEnum | 'ALL']);
        }
        setCurrentPage(1);
      },
      options: [
        { label: 'All Status', value: 'ALL' },
        ...Object.values(ClientUserInvitationStatusEnum).map((status) => ({
          label: formatEnumValue(status),
          value: status,
        })),
      ],
    },
  ];

  // Pagination configuration - exact same pattern as other pages
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
    <SaasDataTable<IClientUserInvitation>
      columns={columns}
      data={invitations}
      actions={actions}
      isLoading={isLoading}
      searchable={true}
      searchValue={searchTerm}
      searchPlaceholder="Search invitations by name or email..."
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

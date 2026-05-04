'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { formatEnumValue } from '@/lib/utils';
import {
  IPartnerUserInvitation,
  PartnerUserInvitationStatusEnum,
  UserRoleEnum,
  IPaginatedResponse,
} from '@/lib/shared';
import { partnerUserInvitationService } from '@/lib/services/services';
import { Send, XCircle } from 'lucide-react';
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
  const [roleFilter, setRoleFilter] = useState<(UserRoleEnum | 'ALL')[]>([
    'ALL',
  ]);
  const [statusFilter, setStatusFilter] = useState<
    (PartnerUserInvitationStatusEnum | 'ALL')[]
  >(['ALL']);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  // Debounce search term - exact same pattern as candidates page
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

  // Handle sort change - exact same pattern as candidates page
  const handleSortChange = (
    field: string | null,
    order: 'asc' | 'desc' | null
  ) => {
    setSortBy(field || '');
    setSortOrder(order || 'desc');
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  // Build query parameters for server-side filtering - exact same pattern as candidates page
  const buildQueryParams = () => {
    const params: Record<string, string | number | string[]> = {
      page: currentPage,
      limit: pageSize,
    };

    if (debouncedSearchTerm.trim()) {
      params.search = debouncedSearchTerm.trim();
    }

    if (roleFilter.length > 0 && !roleFilter.includes('ALL')) {
      params.role = roleFilter;
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

  // Server-side query - exact same pattern as candidates page
  const {
    data: invitationsResponse,
    isLoading,
    refetch,
  } = useQuery<IPaginatedResponse<IPartnerUserInvitation>>({
    queryKey: [
      'partnerUserInvitations',
      currentPage,
      debouncedSearchTerm,
      roleFilter,
      statusFilter,
      pageSize,
      sortBy,
      sortOrder,
    ],
    queryFn: () =>
      partnerUserInvitationService.getUserInvitations(buildQueryParams()),
  });

  // Extract data - exact same pattern as candidates page
  const invitations = invitationsResponse?.items || [];
  const totalPages = invitationsResponse?.pagination?.totalPages || 1;
  const totalItems = invitationsResponse?.pagination?.total || 0;

  // Trigger refetch when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger > 0) {
      refetch();
    }
  }, [refreshTrigger, refetch]);

  const handleResendInvite = async (invitation: IPartnerUserInvitation) => {
    if (
      ![
        PartnerUserInvitationStatusEnum.WITHDRAWN,
        PartnerUserInvitationStatusEnum.EXPIRED,
      ].includes(invitation.status)
    ) {
      toast.error('Only expired or withdrawn invitations can be resent');
      return;
    }

    try {
      await partnerUserInvitationService.resendUserInvitation(invitation.id);
      toast.success('Invitation resent successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to resend invitation');
      logger.error('Error resending invitation:', error);
    }
  };

  const handleWithdrawInvite = async (invitation: IPartnerUserInvitation) => {
    if (invitation.status !== PartnerUserInvitationStatusEnum.PENDING) {
      toast.error('Only pending invitations can be withdrawn');
      return;
    }

    try {
      await partnerUserInvitationService.withdrawUserInvitation(invitation.id);
      toast.success('Invitation withdrawn successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to withdraw invitation');
      logger.error('Error withdrawing invitation:', error);
    }
  };

  // Badge variant helpers - exact same pattern as candidates page
  const getStatusBadgeVariant = (status: PartnerUserInvitationStatusEnum) => {
    switch (status) {
      case PartnerUserInvitationStatusEnum.PENDING:
        return 'default';
      case PartnerUserInvitationStatusEnum.ACCEPTED:
        return 'default';
      case PartnerUserInvitationStatusEnum.EXPIRED:
        return 'secondary';
      case PartnerUserInvitationStatusEnum.WITHDRAWN:
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getRoleBadgeVariant = (role: UserRoleEnum) => {
    switch (role) {
      case UserRoleEnum.ADMIN:
        return 'destructive';
      case UserRoleEnum.HR:
        return 'default';
      case UserRoleEnum.RECRUITER:
        return 'secondary';
      case UserRoleEnum.ACCOUNTS:
        return 'outline';
      default:
        return 'default';
    }
  };

  // Table configuration - exact same pattern as candidates page
  const columns: SaasTableColumn<IPartnerUserInvitation>[] = [
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      render: (invitation: IPartnerUserInvitation) => (
        <span className="font-medium">{invitation.email}</span>
      ),
    },
    {
      key: 'name',
      label: 'Name',
      sortable: true,
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (invitation: IPartnerUserInvitation) => (
        <Badge variant={getRoleBadgeVariant(invitation.role) as any}>
          {formatEnumValue(invitation.role)}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (invitation: IPartnerUserInvitation) => (
        <Badge variant={getStatusBadgeVariant(invitation.status) as any}>
          {formatEnumValue(invitation.status)}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'Invited',
      sortable: true,
      render: (invitation: IPartnerUserInvitation) =>
        invitation.createdAt
          ? format(new Date(invitation.createdAt), 'MMM d, yyyy')
          : 'N/A',
    },
  ];

  // Table actions - conditional based on invitation status
  const actions: SaasTableAction<IPartnerUserInvitation>[] = [
    {
      key: 'resend',
      label: 'Resend Invite',
      icon: <Send className="h-4 w-4" />,
      onClick: (invitation: IPartnerUserInvitation) =>
        handleResendInvite(invitation),
      hidden: (invitation: IPartnerUserInvitation) =>
        invitation.status === PartnerUserInvitationStatusEnum.ACCEPTED ||
        invitation.status === PartnerUserInvitationStatusEnum.PENDING,
    },
    {
      key: 'withdraw',
      label: 'Withdraw Invite',
      icon: <XCircle className="h-4 w-4" />,
      onClick: (invitation: IPartnerUserInvitation) =>
        handleWithdrawInvite(invitation),
      variant: 'destructive',
      hidden: (invitation: IPartnerUserInvitation) =>
        invitation.status !== PartnerUserInvitationStatusEnum.PENDING,
    },
  ];

  // Table filters - exact same pattern as candidates page
  const filters: SaasTableFilter[] = [
    {
      key: 'role',
      label: 'Role',
      type: 'multiselect',
      placeholder: 'Select role',
      value: roleFilter,
      onChange: (value) => {
        if (Array.isArray(value)) {
          setRoleFilter(value as (UserRoleEnum | 'ALL')[]);
        } else {
          setRoleFilter([value as UserRoleEnum | 'ALL']);
        }
        setCurrentPage(1);
      },
      options: [
        { label: 'All Roles', value: 'ALL' },
        ...Object.values(UserRoleEnum).map((role) => ({
          label: formatEnumValue(role),
          value: role,
        })),
      ],
    },
    {
      key: 'status',
      label: 'Status',
      type: 'multiselect',
      placeholder: 'Select status',
      value: statusFilter,
      onChange: (value) => {
        if (Array.isArray(value)) {
          setStatusFilter(value as (PartnerUserInvitationStatusEnum | 'ALL')[]);
        } else {
          setStatusFilter([value as PartnerUserInvitationStatusEnum | 'ALL']);
        }
        setCurrentPage(1);
      },
      options: [
        { label: 'All Status', value: 'ALL' },
        ...Object.values(PartnerUserInvitationStatusEnum).map((status) => ({
          label: formatEnumValue(status),
          value: status,
        })),
      ],
    },
  ];

  // Pagination configuration - exact same pattern as candidates page
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
    <SaasDataTable<IPartnerUserInvitation>
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

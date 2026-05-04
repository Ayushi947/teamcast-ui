'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { PencilIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { partnerUserManagementService } from '@/lib/services/services';
import { EditUserDialog } from './edit-user-dialog';
import {
  IPartnerUser,
  UserStatusEnum,
  UserRoleEnum,
  IPaginatedResponse,
} from '@/lib/shared';
import { formatEnumValue } from '@/lib/utils';
import { toast } from 'sonner';
import SaasDataTable, {
  SaasTableColumn,
  SaasTableFilter,
  SaasPaginationInfo,
} from '@/components/app/common/tables/saas-data-table';

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export function UsersList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<(UserRoleEnum | 'ALL')[]>([
    'ALL',
  ]);
  const [statusFilter, setStatusFilter] = useState<(UserStatusEnum | 'ALL')[]>([
    'ALL',
  ]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IPartnerUser | null>(null);

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
    const params: any = {
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
    data: usersResponse,
    isLoading,
    refetch,
  } = useQuery<IPaginatedResponse<IPartnerUser>>({
    queryKey: [
      'partnerUsers',
      currentPage,
      debouncedSearchTerm,
      roleFilter,
      statusFilter,
      pageSize,
      sortBy,
      sortOrder,
    ],
    queryFn: () => partnerUserManagementService.getUsers(buildQueryParams()),
  });

  // Extract data - exact same pattern as candidates page
  const users = usersResponse?.items || [];
  const totalPages = usersResponse?.pagination?.totalPages || 1;
  const totalItems = usersResponse?.pagination?.total || 0;

  const handleEditUser = (user: IPartnerUser) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleEditDialogClose = (open: boolean) => {
    setIsEditDialogOpen(open);
    if (!open) {
      setSelectedUser(null);
      refetch(); // Refresh data when dialog closes
    }
  };

  // Removed Toggle Status action; status changes should be done via Edit dialog

  // Badge variant helpers - exact same pattern as candidates page
  const getStatusBadgeVariant = (status: UserStatusEnum) => {
    switch (status) {
      case UserStatusEnum.ACTIVE:
        return 'default';
      case UserStatusEnum.INACTIVE:
        return 'secondary';
      default:
        return 'secondary';
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
        return 'secondary';
    }
  };

  // Table configuration - exact same pattern as candidates page
  const columns: SaasTableColumn<IPartnerUser>[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (user: IPartnerUser) => (
        <span className="font-medium">{user.name}</span>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
    },
    {
      key: 'jobTitle',
      label: 'Job Title',
      sortable: true,
      render: (user: IPartnerUser) => user.jobTitle || 'Not specified',
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (user: IPartnerUser) => (
        <Badge variant={getRoleBadgeVariant(user.role) as any}>
          {formatEnumValue(user.role)}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (user: IPartnerUser) => (
        <Badge variant={getStatusBadgeVariant(user.status) as any}>
          {formatEnumValue(user.status)}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (user: IPartnerUser) =>
        format(new Date(user.createdAt), 'MMM d, yyyy'),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (user: IPartnerUser) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleEditUser(user)}
        >
          <PencilIcon className="mr-2 h-4 w-4" />
          Edit
        </Button>
      ),
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
          setStatusFilter(value as (UserStatusEnum | 'ALL')[]);
        } else {
          setStatusFilter([value as UserStatusEnum | 'ALL']);
        }
        setCurrentPage(1);
      },
      options: [
        { label: 'All Status', value: 'ALL' },
        ...Object.values(UserStatusEnum).map((status) => ({
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

  const handleRefresh = () => {
    refetch();
    toast.success('Users refreshed');
  };

  return (
    <>
      <SaasDataTable<IPartnerUser>
        columns={columns}
        data={users}
        isLoading={isLoading}
        searchable={true}
        searchValue={searchTerm}
        searchPlaceholder="Search users by name or email..."
        onSearchChange={setSearchTerm}
        filters={filters}
        pagination={pagination}
        onRefresh={handleRefresh}
        emptyState={{
          title: 'No users found',
          description: 'Try adjusting your search criteria or filters',
        }}
        getRowKey={(user) => user.id}
      />

      {/* Edit Dialog */}
      {selectedUser && (
        <EditUserDialog
          user={selectedUser}
          open={isEditDialogOpen}
          onOpenChange={handleEditDialogClose}
        />
      )}
    </>
  );
}

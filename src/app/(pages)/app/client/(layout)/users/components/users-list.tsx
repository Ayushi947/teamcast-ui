'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { PencilIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { clientUserManagementService } from '@/lib/services/services';
import { EditUserDialog } from './edit-user-dialog';
import {
  IClientUser,
  UserRoleEnum,
  UserStatusEnum,
  IPaginatedResponse,
} from '@/lib/shared';
import SaasDataTable, {
  SaasTableColumn,
  SaasTableFilter,
  SaasPaginationInfo,
} from '@/components/app/common/tables/saas-data-table';
import { getInitials } from '@/lib/utils';
import { toast } from 'sonner';

// Define local User type - must match the type in EditUserDialog
type User = {
  id: string;
  name: string;
  email: string;
  role: UserRoleEnum;
  status: UserStatusEnum;
  profilePicture?: string;
};

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export function UsersList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<(UserStatusEnum | 'ALL')[]>([
    'ALL',
  ]);
  const [roleFilter, setRoleFilter] = useState<(UserRoleEnum | 'ALL')[]>([
    'ALL',
  ]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

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

    if (roleFilter && roleFilter.length > 0) {
      // Filter out 'ALL' value and only send valid role values
      const validRoles = roleFilter.filter((role) => role !== 'ALL');
      if (validRoles.length > 0) {
        params.role = validRoles.join(',');
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
    data: usersResponse,
    isLoading,
    refetch,
  } = useQuery<IPaginatedResponse<IClientUser>>({
    queryKey: [
      'clientUsers',
      currentPage,
      debouncedSearchTerm,
      statusFilter,
      roleFilter,
      pageSize,
      sortBy,
      sortOrder,
    ],
    queryFn: () => clientUserManagementService.getUsers(buildQueryParams()),
  });

  // Extract data - exact same pattern as other pages
  const users: User[] =
    usersResponse?.items?.map((user: IClientUser) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      avatar: undefined,
    })) || [];
  const totalPages = usersResponse?.pagination?.totalPages || 1;
  const totalItems = usersResponse?.pagination?.total || 0;

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setTimeout(() => {
      setIsEditDialogOpen(true);
    }, 10);
  };

  const handleEditDialogClose = (open: boolean) => {
    if (!open) {
      setIsEditDialogOpen(false);
      setTimeout(() => {
        setSelectedUser(null);
      }, 300);
    } else {
      setIsEditDialogOpen(open);
    }
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Users refreshed');
  };

  // Removed Toggle Status and Change Role actions; both are handled via Edit dialog now

  // Helper function to get status badge
  const getStatusBadge = (status: UserStatusEnum) => {
    switch (status) {
      case UserStatusEnum.ACTIVE:
        return 'default';
      case UserStatusEnum.INACTIVE:
        return 'secondary';
      case UserStatusEnum.BLOCKED:
        return 'destructive';
      default:
        return 'secondary';
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
  const columns: SaasTableColumn<User>[] = [
    {
      key: 'name',
      label: 'User',
      sortable: true,
      render: (user: User) => (
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.profilePicture} />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{user.name}</span>
        </div>
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
      render: (user: User) => formatEnumValue(user.role),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: false,
      render: (user: User) => (
        <Badge variant={getStatusBadge(user.status) as any}>
          {formatEnumValue(user.status)}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (user: User) => (
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
          setStatusFilter(value as (UserStatusEnum | 'ALL')[]);
        } else {
          setStatusFilter([value as UserStatusEnum | 'ALL']);
        }
        setCurrentPage(1);
      },
      options: [
        { label: 'All Status', value: 'ALL' },
        ...Object.values(UserStatusEnum).map((status) => ({
          label: formatEnumValue(status as string),
          value: status as string,
        })),
      ],
    },
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
          label: formatEnumValue(role as string),
          value: role as string,
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
    <>
      <SaasDataTable<User>
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

      {/* Edit user dialog - always render it and control visibility through the open prop */}
      <EditUserDialog
        open={isEditDialogOpen && selectedUser !== null}
        onOpenChange={handleEditDialogClose}
        user={
          selectedUser || {
            id: '',
            name: '',
            email: '',
            role: UserRoleEnum.ADMIN,
            status: UserStatusEnum.ACTIVE,
          }
        }
        onEditSuccess={() => {
          refetch();
          setSelectedUser(null);
        }}
      />
    </>
  );
}

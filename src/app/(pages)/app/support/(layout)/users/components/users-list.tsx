'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { UserIcon, UserCheckIcon, UserPlusIcon } from 'lucide-react';
import { toast } from 'sonner';
import { supportUserManagementService } from '@/lib/services/services';
import { EditUserDialog } from './edit-user-dialog';
import { AssignAccountManagerModal } from './assign-account-manager-modal';
import { ImpersonationDialog } from '@/components/app/common/support/impersonation-dialog';
import { canPerformImpersonation } from '@/lib/utils/impersonation.utils';
import {
  ISupportUser,
  UserRoleEnum,
  UserStatusEnum,
  SupportDepartmentEnum,
} from '@/lib/shared';
import { UserTypeEnum } from '@/lib/shared/models/common/enums';
import { logger } from '@/lib/logger';
import SaasDataTable, {
  commonActions,
  SaasTableColumn,
  SaasTableAction,
  SaasTableFilter,
  SaasPaginationInfo,
} from '@/components/app/common/tables/saas-data-table';

import { formatEnumValue } from '@/lib/utils';
import { useApp } from '@/lib/context/app-context';

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

// Define local User type - must match the type in EditUserDialog
type User = {
  id: string;
  name: string;
  email: string;
  role: UserRoleEnum;
  status: UserStatusEnum;
  avatar?: string;
  jobTitle?: string;
  department?: SupportDepartmentEnum;
  accountManagerAssigned?: boolean;
};

interface UsersListProps {
  onChange: () => void;
}

export function UsersList({ onChange }: UsersListProps) {
  const { user: currentUser } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<(UserRoleEnum | 'ALL')[]>([
    'ALL',
  ]);
  const [statusFilter, setStatusFilter] = useState<(UserStatusEnum | 'ALL')[]>([
    'ALL',
  ]);
  const [departmentFilter, setDepartmentFilter] = useState<
    (SupportDepartmentEnum | 'ALL')[]
  >(['ALL']);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [userToAssign, setUserToAssign] = useState<User | null>(null);
  const [impersonateDialogOpen, setImpersonateDialogOpen] = useState(false);
  const [selectedUserForImpersonation, setSelectedUserForImpersonation] =
    useState<User | null>(null);

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

  // Build query parameters for server-side filtering
  const buildQueryParams = () => {
    const params: any = {
      page: currentPage,
      limit: pageSize,
    };

    if (debouncedSearchTerm.trim()) {
      params.search = debouncedSearchTerm.trim();
    }

    // Add role filter
    if (roleFilter.length > 0 && !roleFilter.includes('ALL')) {
      params.role = roleFilter.join(',');
    }

    // Add status filter
    if (statusFilter.length > 0 && !statusFilter.includes('ALL')) {
      params.status = statusFilter.join(',');
    }

    // Add department filter
    if (departmentFilter.length > 0 && !departmentFilter.includes('ALL')) {
      params.department = departmentFilter.join(',');
    }

    return params;
  };

  const getStatusBadgeColor = (status: UserStatusEnum) => {
    switch (status) {
      case UserStatusEnum.ACTIVE:
        return {
          bg: 'bg-emerald-100 dark:bg-emerald-900/20',
          text: 'text-emerald-700 dark:text-emerald-300',
          border: 'border-emerald-200 dark:border-emerald-800',
          ring: 'ring-emerald-500/20',
        };
      case UserStatusEnum.INACTIVE:
        return {
          bg: 'bg-amber-100 dark:bg-amber-900/20',
          text: 'text-amber-700 dark:text-amber-300',
          border: 'border-amber-200 dark:border-amber-800',
          ring: 'ring-amber-500/20',
        };
      case UserStatusEnum.BLOCKED:
        return {
          bg: 'bg-red-100 dark:bg-red-900/20',
          text: 'font-semibold text-red-700 dark:text-red-300',
          border: 'border-red-200 dark:border-red-800',
          ring: 'ring-red-500/20',
        };
      default:
        return {
          bg: 'bg-gray-100 dark:bg-gray-900/20',
          text: 'text-gray-700 dark:text-gray-300',
          border: 'border-gray-200 dark:border-gray-800',
          ring: 'ring-gray-500/20',
        };
    }
  };

  // Use React Query for fetching users
  const {
    data: usersData,
    isLoading,
    error,
    refetch: refetchUsers,
  } = useQuery({
    queryKey: [
      'supportUsers',
      currentPage,
      pageSize,
      debouncedSearchTerm,
      roleFilter.join(','),
      statusFilter.join(','),
      departmentFilter.join(','),
      onChange,
    ],
    queryFn: async () => {
      const response =
        await supportUserManagementService.getSupportUsers(buildQueryParams());

      logger.info('Users response', response);

      // Map API response to local User type
      const mappedUsers: User[] = response.items.map((user: ISupportUser) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        // Use a default profile picture or undefined
        avatar: undefined,
        jobTitle: user.jobTitle,
        department: user.department,
        accountManagerAssigned: user.accountManagerAssigned,
      }));

      // Debug log to check accountManagerAssigned values
      logger.info('Mapped users with account manager status:', {
        recruiters: mappedUsers
          .filter((u) => u.role === UserRoleEnum.RECRUITER)
          .map((u) => ({
            name: u.name,
            accountManagerAssigned: u.accountManagerAssigned,
          })),
      });

      return {
        users: mappedUsers,
        pagination: response.pagination,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (previously cacheTime)
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Handle error state
  if (error) {
    toast.error('Error fetching users', {
      description: 'An error occurred while fetching users.',
    });
    logger.error('Error fetching users', error);
  }

  // Extract data with fallbacks
  const users = usersData?.users || [];
  const totalPages = usersData?.pagination?.totalPages || 1;
  const totalItems = usersData?.pagination?.total || 0;

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const handleEditUser = (user: User) => {
    // First set the selected user
    setSelectedUser(user);

    // Then use a small timeout to open the dialog
    // This helps prevent UI blocking issues
    setTimeout(() => {
      setIsEditDialogOpen(true);
    }, 10);
  };

  const handleEditDialogClose = (open: boolean) => {
    // When closing, first set dialog to closed
    if (!open) {
      setIsEditDialogOpen(false);

      // Then clear the selected user after a short delay
      setTimeout(() => {
        setSelectedUser(null);
      }, 300);
    } else {
      setIsEditDialogOpen(open);
    }
  };

  const handleAssignAccountManager = (user: User) => {
    // First set the user to assign
    setUserToAssign(user);

    // Then use a small timeout to open the modal
    // This helps prevent UI blocking issues
    setTimeout(() => {
      setIsAssignModalOpen(true);
    }, 10);
  };

  const handleAssignModalClose = (open: boolean) => {
    // When closing, first set modal to closed
    if (!open) {
      setIsAssignModalOpen(false);

      // Then clear the user to assign after a short delay
      setTimeout(() => {
        setUserToAssign(null);
      }, 300);
    } else {
      setIsAssignModalOpen(open);
    }
  };

  const handleAssignSuccess = () => {
    // Invalidate and refetch the users query to get fresh data
    refetchUsers();
    onChange();
  };

  const handleImpersonate = (user: User) => {
    setSelectedUserForImpersonation(user);
    setImpersonateDialogOpen(true);
  };

  const handleImpersonateDialogClose = (open: boolean) => {
    setImpersonateDialogOpen(open);
    if (!open) {
      setSelectedUserForImpersonation(null);
    }
  };

  // Table columns configuration
  const columns: SaasTableColumn<User>[] = [
    {
      key: 'name',
      label: 'User',
      render: (user: User) => (
        <div className="flex items-center gap-2">
          <div>
            <span className="font-medium">{user.name}</span>
            <p className="text-muted-foreground text-sm">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'jobTitle',
      label: 'Job Title',
      render: (user: User) => (
        <span className="text-muted-foreground text-sm">
          {formatEnumValue(user.jobTitle || 'N/A')}
        </span>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      render: (user: User) => (
        <span className="text-muted-foreground text-sm">
          {formatEnumValue(user.role)}
        </span>
      ),
    },
    {
      key: 'department',
      label: 'Department',
      render: (user: User) => (
        <span className="text-muted-foreground text-sm">
          {user.department ? formatEnumValue(user.department) : 'N/A'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (user: User) => (
        <Badge
          variant="outline"
          className={`text-sm ${
            getStatusBadgeColor(user.status).bg
          } ${getStatusBadgeColor(user.status).text} ${
            getStatusBadgeColor(user.status).border
          } ${getStatusBadgeColor(user.status).ring}`}
        >
          {formatEnumValue(user.status)}
        </Badge>
      ),
    },
  ];

  // Table actions configuration
  const actions: SaasTableAction<User>[] = [
    {
      key: 'edit',
      label: 'Edit',
      icon: commonActions.edit,
      onClick: (user: User) => handleEditUser(user),
    },
    {
      key: 'assign-account-manager',
      label: 'Assign AM',
      icon: <UserPlusIcon className="h-4 w-4" />,
      onClick: (user: User) => handleAssignAccountManager(user),
      hidden: (user: User) =>
        user.role !== UserRoleEnum.RECRUITER ||
        user.accountManagerAssigned === true,
    },
    {
      key: 'change-account-manager',
      label: 'Change AM',
      icon: <UserPlusIcon className="h-4 w-4" />,
      onClick: (user: User) => handleAssignAccountManager(user),
      hidden: (user: User) =>
        user.role !== UserRoleEnum.RECRUITER ||
        user.accountManagerAssigned !== true,
    },
    {
      key: 'impersonate',
      label: 'Sign In',
      icon: <UserCheckIcon className="h-4 w-4" />,
      onClick: (user: User) => handleImpersonate(user),
      hidden: (user: User) =>
        !canPerformImpersonation(currentUser) ||
        user.role === UserRoleEnum.ADMIN ||
        user.status !== UserStatusEnum.ACTIVE,
    },
  ];

  // Table filters
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
    {
      key: 'department',
      label: 'Department',
      type: 'multiselect',
      placeholder: 'Select department',
      value: departmentFilter,
      onChange: (value) => {
        if (Array.isArray(value)) {
          setDepartmentFilter(value as (SupportDepartmentEnum | 'ALL')[]);
        } else {
          setDepartmentFilter([value as SupportDepartmentEnum | 'ALL']);
        }
        setCurrentPage(1);
      },
      options: [
        { label: 'All Departments', value: 'ALL' },
        ...Object.values(SupportDepartmentEnum).map((department) => ({
          label: formatEnumValue(department),
          value: department,
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
    onPageChange: handlePageChange,
    onPageSizeChange: handlePageSizeChange,
    pageSizeOptions: PAGE_SIZE_OPTIONS,
  };

  const handleRefresh = () => {
    refetchUsers();
    toast.success('Users refreshed');
  };

  return (
    <div className="space-y-4">
      <SaasDataTable<User>
        data={users}
        columns={columns}
        getRowKey={(user) => user.id}
        isLoading={isLoading}
        searchable
        searchValue={searchTerm}
        searchPlaceholder="Search users by name or email..."
        onSearchChange={handleSearchChange}
        actions={actions}
        filters={filters}
        pagination={pagination}
        onRefresh={handleRefresh}
        emptyState={{
          icon: <UserIcon className="text-muted-foreground/50 h-12 w-12" />,
          title: 'No users found',
          description: debouncedSearchTerm
            ? 'Try adjusting your search query'
            : 'There are no users to display at the moment.',
        }}
        error={error?.message || null}
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
          refetchUsers();
          setSelectedUser(null);
          onChange();
        }}
      />

      {/* Assign account manager modal - always render it and control visibility through the open prop */}
      <AssignAccountManagerModal
        open={isAssignModalOpen && userToAssign !== null}
        onOpenChange={handleAssignModalClose}
        user={
          userToAssign || {
            id: '',
            name: '',
            email: '',
            role: UserRoleEnum.RECRUITER,
            status: UserStatusEnum.ACTIVE,
            accountManagerAssigned: false,
          }
        }
        onAssignSuccess={handleAssignSuccess}
      />

      {/* Impersonation dialog - always render it and control visibility through the open prop */}
      <ImpersonationDialog
        open={impersonateDialogOpen && selectedUserForImpersonation !== null}
        onOpenChange={handleImpersonateDialogClose}
        targetUserId={selectedUserForImpersonation?.id || ''}
        targetUserType={UserTypeEnum.SUPPORT}
        targetUserName={selectedUserForImpersonation?.name || ''}
        targetUserEmail={selectedUserForImpersonation?.email}
      />
    </div>
  );
}

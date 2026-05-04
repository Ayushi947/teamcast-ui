'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Mail, User, AlertCircle } from 'lucide-react';
import SaasDataTable, {
  SaasTableColumn,
} from '@/components/app/common/tables/saas-data-table';
import { supportClientManagementService } from '@/lib/services/services';
import { toast } from 'sonner';
import { IClientUser } from '@/lib/shared';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { logger } from '@/lib/logger';
import { formatEnumValue } from '@/lib/utils';
import { UserTypeEnum } from '@/lib/shared/models/common/enums';
import {
  ImpersonationDialog,
  ImpersonationButton,
} from '@/components/app/common/support/impersonation-dialog';
import { canImpersonateClientUsers } from '@/lib/utils/impersonation.utils';
import { useApp } from '@/lib/context/app-context';

interface ClientUsersTabProps {
  clientId: string;
  isActive?: boolean;
}

export function ClientUsersTab({
  clientId,
  isActive = false,
}: ClientUsersTabProps) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchValue, setSearchValue] = useState('');
  const [impersonateDialogOpen, setImpersonateDialogOpen] = useState(false);
  const [selectedUserForImpersonation, setSelectedUserForImpersonation] =
    useState<IClientUser | null>(null);
  const { user } = useApp();

  const debouncedSearchValue = useDebounce(searchValue, 500);
  const {
    data: clientUsersData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      'support-client-users',
      clientId,
      page,
      limit,
      debouncedSearchValue,
    ],
    queryFn: async () => {
      logger.info('Fetching client users for client:', clientId);
      return await supportClientManagementService.listSupportClientUsers(
        clientId,
        { page, limit, search: debouncedSearchValue }
      );
    },
    enabled: !!clientId && isActive,
  });

  // Reset page when tab becomes active
  useEffect(() => {
    if (isActive) {
      setPage(1);
    }
  }, [isActive]);

  const columns: SaasTableColumn<IClientUser>[] = [
    {
      key: 'user',
      label: 'User',
      sortable: true,
      render: (user) => (
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.profilePicture || ''} alt={`${user.name}`} />
            <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{user?.name}</div>
            <div className="flex items-center text-sm text-gray-500">
              <Mail className="mr-1 h-3 w-3" />
              {user?.email}
            </div>
          </div>
        </div>
      ),
    },

    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (user) => {
        const getRoleColor = (role: string) => {
          switch (role.toLowerCase()) {
            case 'admin':
              return 'bg-purple-100 text-purple-800';
            case 'hr':
              return 'bg-blue-100 text-blue-800';
            case 'recruiter':
              return 'bg-green-100 text-green-800';
            case 'manager':
              return 'bg-orange-100 text-orange-800';
            default:
              return 'bg-gray-100 text-gray-800';
          }
        };
        return (
          <Badge className={getRoleColor(user?.role)}>
            {formatEnumValue(user?.role)}
          </Badge>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (user) => {
        const getStatusColor = (status: string) => {
          switch (status.toLowerCase()) {
            case 'active':
              return 'bg-green-100 text-green-800';
            case 'inactive':
              return 'bg-gray-100 text-gray-800';
            case 'pending':
              return 'bg-yellow-100 text-yellow-800';
            case 'blocked':
              return 'bg-red-100 text-red-800';
            default:
              return 'bg-gray-100 text-gray-800';
          }
        };
        return (
          <Badge className={getStatusColor(user?.status)}>
            {formatEnumValue(user?.status)}
          </Badge>
        );
      },
    },
    {
      key: 'joinedDate',
      label: 'Joined Date',
      sortable: true,
      render: (user) => (
        <div className="flex items-center space-x-1">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span>{new Date(user.createdAt).toLocaleDateString()}</span>
        </div>
      ),
    },
    {
      key: 'lastActiveDate',
      label: 'Last Active',
      sortable: true,
      render: (user) =>
        user?.updatedAt ? (
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>{new Date(user?.updatedAt).toLocaleDateString()}</span>
          </div>
        ) : (
          <span className="text-gray-500">Never</span>
        ),
    },
    ...(canImpersonateClientUsers(user)
      ? [
          {
            key: 'actions',
            label: 'Actions',
            render: (clientUser: IClientUser) => (
              <ImpersonationButton
                onClick={() => handleImpersonate(clientUser)}
                disabled={!canImpersonateClientUsers(user)}
                tooltip={
                  !canImpersonateClientUsers(user)
                    ? "You don't have permission"
                    : undefined
                }
              />
            ),
          },
        ]
      : []),
  ];

  const handleRefresh = () => {
    refetch();
    toast.success('Client users refreshed');
  };

  const handleImpersonate = (user: IClientUser) => {
    setSelectedUserForImpersonation(user);
    setImpersonateDialogOpen(true);
  };

  const handleImpersonateDialogClose = (open: boolean) => {
    setImpersonateDialogOpen(open);
    if (!open) {
      setSelectedUserForImpersonation(null);
    }
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span>Error Loading Client Users</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-gray-600">
            Unable to load client users. Please try again.
          </p>
          <Button onClick={handleRefresh} variant="outline">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <SaasDataTable<IClientUser>
        data={clientUsersData?.items || []}
        columns={columns}
        getRowKey={(item) => item.id}
        isLoading={isLoading}
        emptyState={{
          title: 'No client users found',
          description: 'No client users found for this client',
          icon: <User className="text-muted-foreground/50 h-12 w-12" />,
          action: {
            label: 'Refresh',
            onClick: handleRefresh,
          },
        }}
        pagination={{
          totalItems: clientUsersData?.pagination?.total || 0,
          currentPage: page,
          pageSize: limit,
          totalPages: Math.ceil(
            (clientUsersData?.pagination?.total || 0) / limit
          ),
          onPageChange: setPage,
          onPageSizeChange: setLimit,
        }}
        onRefresh={handleRefresh}
        searchable={true}
        searchPlaceholder="Search client users..."
        searchValue={searchValue}
        onSearchChange={setSearchValue}
      />
      <ImpersonationDialog
        open={impersonateDialogOpen}
        onOpenChange={handleImpersonateDialogClose}
        targetUserId={selectedUserForImpersonation?.id || ''}
        targetUserType={UserTypeEnum.CLIENT}
        targetUserName={selectedUserForImpersonation?.name || ''}
        targetUserEmail={selectedUserForImpersonation?.email}
      />
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Eye, Calendar, Mail, Clock, XCircle, Inbox } from 'lucide-react';
import SaasDataTable, {
  SaasTableColumn,
} from '@/components/app/common/tables/saas-data-table';
import { supportClientManagementService } from '@/lib/services/services';
import { toast } from 'sonner';
import { IClientUserInvitation } from '@/lib/shared';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { formatEnumValue } from '@/lib/utils';

interface UserInvitesTabProps {
  clientId: string;
  isActive?: boolean;
}

export function UserInvitesTab({
  clientId,
  isActive = false,
}: UserInvitesTabProps) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearchValue = useDebounce(searchValue, 500);
  const [shouldFetch, setShouldFetch] = useState(true);

  const {
    data: invitesData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [
      'support-client-invites',
      clientId,
      page,
      limit,
      debouncedSearchValue,
    ],
    queryFn: async () => {
      try {
        const data =
          await supportClientManagementService.listSupportClientInvites(
            clientId,
            { page, limit, search: debouncedSearchValue }
          );
        return data;
      } catch (err: any) {
        if (err?.code === 'ERR_4001') {
          setShouldFetch(false);
        }
        throw err;
      }
    },
    enabled: !!clientId && isActive && shouldFetch,
    retry: false,
  });

  // Reset page when tab becomes active
  useEffect(() => {
    if (isActive) {
      setPage(1);
    }
  }, [isActive]);

  const columns: SaasTableColumn<IClientUserInvitation>[] = [
    {
      key: 'user',
      label: 'User',
      sortable: true,
      render: (invite) => (
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={''} alt={`${invite.name}`} />
            <AvatarFallback>{invite?.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{invite?.email}</div>
            <div className="flex items-center text-sm text-gray-500">
              <Mail className="mr-1 h-3 w-3" />
              {invite?.email}
            </div>
          </div>
        </div>
      ),
    },

    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (invite) => {
        const getRoleColor = (role: string) => {
          switch (role?.toLowerCase()) {
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
          <Badge className={getRoleColor(invite.role)}>
            {formatEnumValue(invite.role)}
          </Badge>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (invite) => {
        const getStatusIcon = (status: string) => {
          switch (status?.toLowerCase()) {
            case 'pending':
              return <Clock className="h-4 w-4" />;
            case 'accepted':
              return <Eye className="h-4 w-4" />;
            case 'expired':
            case 'withdrawn':
              return <XCircle className="h-4 w-4" />;
            default:
              return <Clock className="h-4 w-4" />;
          }
        };

        const getStatusColor = (status: string) => {
          switch (status?.toLowerCase()) {
            case 'pending':
              return 'bg-yellow-100 text-yellow-800';
            case 'accepted':
              return 'bg-green-100 text-green-800';
            case 'expired':
              return 'bg-red-100 text-red-800';
            case 'withdrawn':
              return 'bg-gray-100 text-gray-800';
            default:
              return 'bg-gray-100 text-gray-800';
          }
        };

        return (
          <div className="flex items-center space-x-2">
            <div className="text-gray-500">{getStatusIcon(invite.status)}</div>
            <Badge className={getStatusColor(invite.status)}>
              {formatEnumValue(invite.status)}
            </Badge>
          </div>
        );
      },
    },
    {
      key: 'invitedDate',
      label: 'Invited Date',
      sortable: true,
      render: (invite) => (
        <div className="flex items-center space-x-1">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span>{new Date(invite.createdAt).toLocaleDateString()}</span>
        </div>
      ),
    },
  ];

  const handleRefresh = () => {
    refetch();
    toast.success('User invites refreshed');
  };

  return (
    <div className="space-y-6">
      <SaasDataTable<IClientUserInvitation>
        data={invitesData?.items || []}
        columns={columns}
        getRowKey={(item) => item.id}
        isLoading={isLoading}
        emptyState={{
          icon: <Inbox className="text-muted-foreground/50 h-12 w-12" />,
          title: 'No user invites found',
          description: 'No user invites found for this client',
          action: {
            label: 'Refresh',
            onClick: handleRefresh,
          },
        }}
        pagination={{
          totalItems: invitesData?.pagination?.total || 0,
          currentPage: page,
          pageSize: limit,
          totalPages: Math.ceil((invitesData?.pagination?.total || 0) / limit),
          onPageChange: setPage,
          onPageSizeChange: setLimit,
        }}
        onRefresh={handleRefresh}
        searchable={true}
        searchPlaceholder="Search user invites..."
        searchValue={searchValue}
        onSearchChange={setSearchValue}
      />
    </div>
  );
}

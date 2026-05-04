'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Calendar, Mail, UserMinus } from 'lucide-react';
import SaasDataTable, {
  SaasTableColumn,
} from '@/components/app/common/tables/saas-data-table';
import { supportPartnerManagementService } from '@/lib/services/services';
import { toast } from 'sonner';
import { IPartnerUserInvitation } from '@/lib/shared';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { logger } from '@/lib/logger';
import { formatEnumValue } from '@/lib/utils';

interface UserInvitesTabProps {
  partnerId: string;
  isActive?: boolean;
}

export function UserInvitesTab({
  partnerId,
  isActive = false,
}: UserInvitesTabProps) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchValue, setSearchValue] = useState('');
  const [shouldFetch, setShouldFetch] = useState(true);
  const debouncedSearchValue = useDebounce(searchValue, 500);

  const {
    data: invitesData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['support-partner-invites', partnerId, page, limit],
    queryFn: async () => {
      try {
        const data =
          await supportPartnerManagementService.listSupportPartnerInvites(
            partnerId,
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
    enabled: !!partnerId && isActive && shouldFetch,
    retry: false,
  });

  // Debug logging
  useEffect(() => {
    if (isActive) {
      logger.info('UserInvitesTab is now active, data:', invitesData);
    }
  }, [isActive, invitesData]);

  // Reset page when tab becomes active
  useEffect(() => {
    if (isActive) {
      setPage(1);
    }
  }, [isActive]);

  const columns: SaasTableColumn<IPartnerUserInvitation>[] = [
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      render: (invite) => (
        <div className="flex items-center space-x-2">
          <Mail className="h-4 w-4 text-gray-500" />
          <span className="font-medium">{invite.email}</span>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (invite) => {
        const getRoleColor = (role: string) => {
          switch (role.toLowerCase()) {
            case 'admin':
              return 'bg-purple-100 text-purple-800';
            case 'partner_resource':
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
          <Badge className={getRoleColor(invite.role || '')}>
            {formatEnumValue(invite.role || '')}
          </Badge>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (invite) => {
        const getStatusColor = (status: string) => {
          switch (status.toLowerCase()) {
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
          <Badge className={getStatusColor(invite.status)}>
            {formatEnumValue(invite.status || '')}
          </Badge>
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
      <SaasDataTable<IPartnerUserInvitation>
        data={invitesData?.items || []}
        columns={columns}
        getRowKey={(item) => item.id}
        isLoading={isLoading}
        emptyState={{
          title: 'No user invites found',
          description: 'No user invites found for this partner',
          icon: <UserMinus className="h-5 w-5 text-red-500" />,
          action: {
            label: 'Retry',
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
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder="Search user invites..."
      />
    </div>
  );
}

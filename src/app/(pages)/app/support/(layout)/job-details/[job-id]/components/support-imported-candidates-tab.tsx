'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Clock,
  Mail,
  CheckCircle,
  XCircle,
  Users,
  ExternalLink,
  X,
} from 'lucide-react';
import { IClientJobPosting, JobInviteStatusEnum } from '@/lib/shared';
import { getInitials, formatEnumValue } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import {
  supportJobPostingInviteService,
  supportClientManagementService,
} from '@/lib/services/services';
import { IPaginatedResponse } from '@/lib/shared/models/api/common/common.api';

import SaasDataTable, {
  SaasTableColumn,
  SaasTableFilter,
  SaasPaginationInfo,
} from '@/components/app/common/tables/saas-data-table';

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

interface SupportImportedCandidatesTabProps {
  job: IClientJobPosting;
}

interface ImportedCandidate {
  id: string;
  email: string;
  name: string;
  jobId: string;
  status: JobInviteStatusEnum;
  integrationId?: string;
  createdAt: string;
  updatedAt: string;
  jobPosting?: {
    id: string;
    title: string;
  };
}

const getJobInviteStatusBadge = (status: JobInviteStatusEnum) => {
  switch (status) {
    case JobInviteStatusEnum.PENDING:
      return (
        <Badge className="inline-flex items-center gap-1.5 bg-yellow-50 whitespace-nowrap text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400 dark:hover:bg-yellow-900/30">
          <div className="h-2 w-2 flex-shrink-0 rounded-full bg-yellow-500"></div>
          Pending
        </Badge>
      );
    case JobInviteStatusEnum.ACCEPTED:
      return (
        <Badge className="inline-flex items-center gap-1.5 bg-green-50 whitespace-nowrap text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30">
          <CheckCircle className="h-3 w-3 flex-shrink-0" />
          Accepted
        </Badge>
      );
    case JobInviteStatusEnum.DECLINED:
      return (
        <Badge className="inline-flex items-center gap-1.5 bg-red-50 whitespace-nowrap text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30">
          <XCircle className="h-3 w-3 flex-shrink-0" />
          Declined
        </Badge>
      );
    case JobInviteStatusEnum.CANCELLED:
      return (
        <Badge className="inline-flex items-center gap-1.5 bg-gray-50 whitespace-nowrap text-gray-700 hover:bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400 dark:hover:bg-gray-900/30">
          <X className="h-3 w-3 flex-shrink-0" />
          Cancelled
        </Badge>
      );
    case JobInviteStatusEnum.EXPIRED:
      return (
        <Badge className="inline-flex items-center gap-1.5 bg-orange-50 whitespace-nowrap text-orange-700 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:hover:bg-orange-900/30">
          <Clock className="h-3 w-3 flex-shrink-0" />
          Expired
        </Badge>
      );
    case JobInviteStatusEnum.WITHDRAWN:
      return (
        <Badge className="inline-flex items-center gap-1.5 bg-purple-50 whitespace-nowrap text-purple-700 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:hover:bg-purple-900/30">
          <X className="h-3 w-3 flex-shrink-0" />
          Withdrawn
        </Badge>
      );
    default:
      return (
        <Badge
          variant="outline"
          className="whitespace-nowrap text-gray-700 dark:text-gray-300"
        >
          {status}
        </Badge>
      );
  }
};

export function SupportImportedCandidatesTab({
  job,
}: SupportImportedCandidatesTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    (JobInviteStatusEnum | 'ALL')[]
  >(['ALL']);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Debounce search term - exact same pattern as applications page
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

  // Handle sort change - exact same pattern as applications page
  const handleSortChange = (
    field: string | null,
    order: 'asc' | 'desc' | null
  ) => {
    setSortBy(field || '');
    setSortOrder(order || 'desc');
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  // Build query parameters for server-side filtering - exact same pattern as applications page
  const buildQueryParams = () => {
    const params: any = {
      page: currentPage,
      limit: pageSize,
    };

    if (debouncedSearchTerm.trim()) {
      // Use the search parameter - backend handles searching across name and email fields
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

  // Server-side query - exact same pattern as applications page
  const {
    data: importedCandidatesResponse,
    isLoading,
    error,
    refetch,
  } = useQuery<IPaginatedResponse<ImportedCandidate>>({
    queryKey: [
      'supportImportedCandidates',
      job.id,
      currentPage,
      debouncedSearchTerm,
      statusFilter,
      pageSize,
      sortBy,
      sortOrder,
    ],
    queryFn: () =>
      supportJobPostingInviteService.getImportedCandidates(
        job.id,
        buildQueryParams()
      ),
  });

  // Extract data - exact same pattern as applications page
  const importedCandidates = importedCandidatesResponse?.items || [];
  const totalPages = importedCandidatesResponse?.pagination?.totalPages || 1;
  const totalItems = importedCandidatesResponse?.pagination?.total || 0;

  // Fetch integration provider details for each candidate
  const integrationProviderIds = [
    ...new Set(
      importedCandidates
        .map((candidate) => candidate.integrationId)
        .filter((id): id is string => id !== null && id !== undefined)
    ),
  ];

  const { data: integrationProviders, isLoading: integrationProvidersLoading } =
    useQuery({
      queryKey: ['integrationProviders', integrationProviderIds],
      queryFn: async () => {
        const providers = await Promise.all(
          integrationProviderIds.map((id) =>
            supportClientManagementService.getIntegrationProviderDetails(id)
          )
        );
        return providers.reduce(
          (acc, provider, index) => {
            acc[integrationProviderIds[index]] = provider;
            return acc;
          },
          {} as Record<string, any>
        );
      },
      enabled: integrationProviderIds.length > 0,
    });

  // Table configuration - exact same pattern as applications page
  const columns: SaasTableColumn<ImportedCandidate>[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (candidate) => (
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={undefined} alt={candidate.name} />
            <AvatarFallback className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary text-xs">
              {getInitials(candidate.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              {candidate.name}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      render: (candidate) => (
        <div className="flex items-center space-x-2">
          <Mail className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {candidate.email}
          </span>
        </div>
      ),
    },

    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (candidate) => getJobInviteStatusBadge(candidate.status),
    },
    {
      key: 'invitedAt',
      label: 'Invited At',
      render: (candidate) => (
        <div className="text-sm text-gray-700 dark:text-gray-300">
          {new Date(candidate.createdAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      key: 'integration',
      label: 'Source',
      render: (candidate) => {
        const integrationProvider = candidate.integrationId
          ? integrationProviders?.[candidate.integrationId]
          : null;

        return integrationProvider ? (
          <div className="flex items-center space-x-2">
            {integrationProvider.logoUrl ? (
              <img
                src={integrationProvider.logoUrl}
                alt={integrationProvider.name}
                className="h-5 w-5 rounded"
              />
            ) : (
              <ExternalLink className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            )}
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              {integrationProvider.name.split(' ')[0]}
            </span>
          </div>
        ) : (
          <span className="text-sm text-gray-500 dark:text-gray-400">-</span>
        );
      },
    },
  ];

  // Table filters - exact same pattern as applications page
  const filters: SaasTableFilter[] = [
    {
      key: 'status',
      label: 'Status',
      placeholder: 'Select status',
      value: statusFilter,
      onChange: (value) => {
        if (Array.isArray(value)) {
          setStatusFilter(value as (JobInviteStatusEnum | 'ALL')[]);
        } else {
          setStatusFilter([value as JobInviteStatusEnum | 'ALL']);
        }
        setCurrentPage(1);
      },
      options: [
        { label: 'All Status', value: 'ALL' },
        ...Object.values(JobInviteStatusEnum).map((status) => ({
          label: formatEnumValue(status),
          value: status,
        })),
      ],
      type: 'multiselect',
    },
  ];

  // Pagination configuration - exact same pattern as applications page
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
    <div className="space-y-6">
      {/* Imported Candidates Table */}
      <SaasDataTable<ImportedCandidate>
        title="Integrations Invites"
        description="Candidates invited from external sources"
        columns={columns}
        data={importedCandidates as ImportedCandidate[]}
        actions={[]}
        isLoading={isLoading || integrationProvidersLoading}
        searchable={true}
        searchValue={searchTerm}
        searchPlaceholder="Search by name or email address..."
        onSearchChange={setSearchTerm}
        filters={filters}
        pagination={pagination}
        onRefresh={refetch}
        emptyState={{
          title: 'No Imported Candidates',
          description:
            'No candidates have been imported for this job posting yet.',
          icon: <Users className="h-12 w-12 text-gray-400" />,
        }}
        getRowKey={(candidate) => candidate.id}
        error={error?.message}
      />
    </div>
  );
}

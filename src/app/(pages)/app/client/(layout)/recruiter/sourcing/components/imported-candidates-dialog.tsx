'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Clock, Mail, CheckCircle, XCircle, Users, X } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { JobInviteStatusEnum } from '@/lib/shared';
import { getInitials, formatEnumValue } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { clientJobInviteApiService } from '@/lib/services/services';
import { IJobImportedInviteListApiResponse } from '@/lib/shared/models/api/client/job.invite.api';
import { IJobInvite } from '@/lib/shared/models/domain/client/job.invite.domain';

import SaasDataTable, {
  SaasTableColumn,
  SaasTableFilter,
  SaasPaginationInfo,
} from '@/components/app/common/tables/saas-data-table';

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

interface ImportedCandidatesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
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

export function ImportedCandidatesDialog({
  isOpen,
  onClose,
  jobId,
}: ImportedCandidatesDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    (JobInviteStatusEnum | 'ALL')[]
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

  // Reset state when dialog opens to ensure fresh data fetch
  useEffect(() => {
    if (isOpen) {
      setCurrentPage(1);
      setSearchTerm('');
      setDebouncedSearchTerm('');
      setStatusFilter(['ALL']);
    }
  }, [isOpen]);

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
    const params: any = {
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
    data: importedCandidatesResponse,
    isLoading,
    error,
    refetch,
  } = useQuery<IJobImportedInviteListApiResponse>({
    queryKey: [
      'clientImportedCandidates',
      jobId,
      currentPage,
      debouncedSearchTerm,
      statusFilter,
      pageSize,
      sortBy,
      sortOrder,
    ],
    queryFn: async () => {
      const response =
        await clientJobInviteApiService.getImportedCandidateJobInvitesByJobId(
          jobId,
          buildQueryParams()
        );

      return response;
    },
    enabled: isOpen && !!jobId,
  });

  // Extract data - debug logging

  // Correct mapping for IPaginatedResponse structure
  const importedCandidates = importedCandidatesResponse?.items || [];
  const totalPages = importedCandidatesResponse?.pagination?.totalPages || 1;
  const totalItems = importedCandidatesResponse?.pagination?.total || 0;

  // Table configuration
  const columns: SaasTableColumn<IJobInvite>[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (candidate) => (
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={undefined} alt={candidate.candidateName || ''} />
            <AvatarFallback className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary text-xs">
              {getInitials(candidate.candidateName || '')}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              {candidate.candidateName}
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
            {candidate.candidateEmail}
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
      render: () => {
        return (
          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <img
                    src="https://img.icons8.com/?size=100&id=117561&format=png&color=000000"
                    alt="Excel"
                    width={25}
                    height={25}
                    className="cursor-pointer"
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Excel Upload</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      },
    },
  ];

  // Table filters
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex max-h-[90vh] max-w-6xl flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Imported Candidate Invites</DialogTitle>
          <DialogDescription>
            View and manage candidates invited from external sources
          </DialogDescription>
        </DialogHeader>

        <div className="scrollbar-hide min-h-0 flex-1 overflow-auto">
          <SaasDataTable<IJobInvite>
            title=""
            description=""
            columns={columns}
            data={importedCandidates as unknown as IJobInvite[]}
            actions={[]}
            isLoading={isLoading}
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
      </DialogContent>
    </Dialog>
  );
}

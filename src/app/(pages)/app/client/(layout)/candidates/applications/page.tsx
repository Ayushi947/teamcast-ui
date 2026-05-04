'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Calendar,
  Building,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Ban,
  Undo2,
} from 'lucide-react';
import { format } from 'date-fns';
import { clientJobInviteApiService } from '@/lib/services/services';
import {
  IJobInvite,
  JobInviteStatusEnum,
  IJobInviteListApiResponse,
  logger,
} from '@/lib/shared';
import { formatEnumValue } from '@/lib/utils';
import SaasDataTable, {
  SaasTableColumn,
  SaasTableFilter,
  SaasPaginationInfo,
} from '@/components/app/common/tables/saas-data-table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

function ClientJobInvitesTableContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    (JobInviteStatusEnum | 'ALL')[]
  >(['ALL']);
  const [jobFilter, setJobFilter] = useState<string>('ALL');
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
      sortBy,
      sortOrder,
    };

    if (debouncedSearchTerm.trim()) {
      params.search = debouncedSearchTerm.trim();
    }

    if (statusFilter.length > 0 && !statusFilter.includes('ALL')) {
      params.status = statusFilter;
    }

    if (jobFilter && jobFilter !== 'ALL') {
      params.jobId = jobFilter;
    }

    return params;
  };

  // Server-side query
  const {
    data: jobInvitesResponse,
    isLoading,
    refetch,
    error,
  } = useQuery<IJobInviteListApiResponse>({
    queryKey: [
      'clientJobInvites',
      currentPage,
      debouncedSearchTerm,
      statusFilter,
      jobFilter,
      pageSize,
      sortBy,
      sortOrder,
    ],
    queryFn: () =>
      clientJobInviteApiService.getAllJobInvites(buildQueryParams()),
  });

  // Extract data from API response - the service returns the full API response
  // Try different possible response structures
  const jobInvites =
    jobInvitesResponse?.data?.invites ||
    (jobInvitesResponse as any)?.invites ||
    [];
  const totalPages =
    jobInvitesResponse?.data?.totalPages ||
    (jobInvitesResponse as any)?.totalPages ||
    1;
  const totalItems =
    jobInvitesResponse?.data?.total || (jobInvitesResponse as any)?.total || 0;

  // Handle error state
  if (error) {
    logger.error('Error loading job invites:', error);
    toast.error('Failed to load job invitations. Please try again.');
  }

  const handleRefresh = () => {
    refetch();
    toast.success('Job invitations refreshed');
  };

  // Application status badge variant helpers
  const getJobInviteStatusBadgeVariant = (status?: JobInviteStatusEnum) => {
    if (!status) return 'secondary';

    switch (status) {
      case JobInviteStatusEnum.PENDING:
        return 'warning'; // Yellow/amber for pending/waiting state
      case JobInviteStatusEnum.ACCEPTED:
        return 'success'; // Green for accepted/success state
      case JobInviteStatusEnum.DECLINED:
        return 'error'; // Red for declined/rejected state
      case JobInviteStatusEnum.CANCELLED:
        return 'secondary'; // Gray for cancelled/inactive state
      case JobInviteStatusEnum.EXPIRED:
        return 'error'; // Red for expired/error state
      case JobInviteStatusEnum.WITHDRAWN:
        return 'secondary'; // Gray for withdrawn/inactive state
      default:
        return 'secondary';
    }
  };

  const getJobInviteStatusIcon = (status?: JobInviteStatusEnum) => {
    if (!status) return <Clock className="h-3 w-3" />;

    switch (status) {
      case JobInviteStatusEnum.PENDING:
        return <Clock className="h-3 w-3" />; // Clock for waiting/pending
      case JobInviteStatusEnum.ACCEPTED:
        return <CheckCircle className="h-3 w-3" />; // CheckCircle for accepted
      case JobInviteStatusEnum.DECLINED:
        return <XCircle className="h-3 w-3" />; // XCircle for declined
      case JobInviteStatusEnum.CANCELLED:
        return <Ban className="h-3 w-3" />; // Ban for cancelled
      case JobInviteStatusEnum.EXPIRED:
        return <AlertCircle className="h-3 w-3" />; // AlertCircle for expired
      case JobInviteStatusEnum.WITHDRAWN:
        return <Undo2 className="h-3 w-3" />; // Undo2 for withdrawn
      default:
        return <FileText className="h-3 w-3" />;
    }
  };

  // Get candidate initials for avatar
  const getCandidateInitials = (
    candidateId?: string,
    candidateName?: string
  ) => {
    if (candidateName) {
      const nameParts = candidateName.split(' ');
      if (nameParts.length >= 2) {
        return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
      }
      return candidateName.substring(0, 2).toUpperCase();
    }
    return candidateId ? candidateId.substring(0, 2).toUpperCase() : 'UN';
  };

  // Table configuration
  const columns: SaasTableColumn<IJobInvite>[] = [
    {
      key: 'candidate',
      label: 'Candidate',
      sortable: false,
      render: (jobInvite: IJobInvite) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 rounded-full border">
            <AvatarImage
              src=""
              alt={
                jobInvite.candidateName ||
                jobInvite.candidateEmail ||
                'Candidate'
              }
            />
            <AvatarFallback className="bg-gradient-to-br from-blue-100 to-indigo-100 text-xs font-bold text-blue-700 dark:from-blue-900 dark:to-indigo-900 dark:text-blue-300">
              {getCandidateInitials(jobInvite.id, jobInvite.candidateName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">
              {jobInvite.candidateName || 'Unnamed Candidate'}
            </div>
            <div className="text-muted-foreground text-sm">
              {jobInvite.candidateEmail || 'No email'}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'jobTitle',
      label: 'Position',
      sortable: false,
      render: (jobInvite: IJobInvite) => (
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4" />
          <div>
            <div className="font-medium">{jobInvite.jobTitle || 'N/A'}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Invited Date',
      sortable: true,
      render: (jobInvite: IJobInvite) => (
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          <span>
            {jobInvite.createdAt
              ? format(new Date(jobInvite.createdAt), 'MMM d, yyyy')
              : 'N/A'}
          </span>
        </div>
      ),
    },
    {
      key: 'expiresAt',
      label: 'Expires',
      sortable: true,
      render: (jobInvite: IJobInvite) => (
        <div className="flex items-center gap-2">
          {jobInvite.expiresAt ? (
            <div className="text-sm">
              {format(new Date(jobInvite.expiresAt), 'MMM d, yyyy')}
            </div>
          ) : (
            <span className="text-muted-foreground text-sm">No expiry</span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: false,
      render: (jobInvite: IJobInvite) => (
        <div>
          {jobInvite.status ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant={
                      getJobInviteStatusBadgeVariant(jobInvite.status) as any
                    }
                    className="flex w-28 cursor-pointer items-center justify-center gap-1"
                  >
                    {getJobInviteStatusIcon(jobInvite.status)}
                    <span>{formatEnumValue(jobInvite.status)}</span>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {jobInvite.status === JobInviteStatusEnum.PENDING &&
                      'Invitation sent to the candidate; waiting for their response.'}
                    {jobInvite.status === JobInviteStatusEnum.ACCEPTED &&
                      'The candidate accepted this job invitation.'}
                    {jobInvite.status === JobInviteStatusEnum.DECLINED &&
                      'The candidate declined this job invitation.'}
                    {jobInvite.status === JobInviteStatusEnum.CANCELLED &&
                      'This invitation was cancelled and is no longer active.'}
                    {jobInvite.status === JobInviteStatusEnum.EXPIRED &&
                      'The invitation expired before the candidate responded.'}
                    {jobInvite.status === JobInviteStatusEnum.WITHDRAWN &&
                      'You withdrew this invitation from the candidate.'}
                    {!Object.values(JobInviteStatusEnum).includes(
                      jobInvite.status
                    ) && 'Current status of this job invitation.'}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <Badge
              variant="warning"
              className="flex w-28 items-center justify-center gap-1"
            >
              <Clock className="h-3 w-3" />
              <span>{formatEnumValue(JobInviteStatusEnum.PENDING)}</span>
            </Badge>
          )}
        </div>
      ),
    },
  ];

  // Build job posting options from current data
  const jobOptions: { id: string; title: string }[] = Array.from(
    new Map<string, string>(
      jobInvites
        .filter((invite: IJobInvite) => !!invite.jobId)
        .map((invite: IJobInvite) => [
          invite.jobId,
          invite.jobTitle || 'Untitled Job',
        ])
    ).entries()
  ).map(([id, title]) => ({ id, title }));

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
          label: formatEnumValue(status as string),
          value: status as string,
        })),
      ],
      type: 'multiselect',
    },
  ];

  // Add job posting filter when there is at least one job
  if (jobOptions.length > 0) {
    filters.push({
      key: 'job',
      label: 'Job Posting',
      placeholder: 'Select job',
      value: jobFilter,
      onChange: (value) => {
        const newValue = Array.isArray(value)
          ? (value[0] as string)
          : (value as string);
        setJobFilter(newValue ?? 'ALL');
        setCurrentPage(1);
      },
      options: [
        { label: 'All Jobs', value: 'ALL' },
        ...jobOptions.map((job) => ({
          label: job.title,
          value: job.id,
        })),
      ],
      type: 'select',
    });
  }

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
    <div className="flex h-full flex-col">
      {/* Table container with full height */}
      <div className="flex-1">
        <div className="h-full p-4">
          <SaasDataTable<IJobInvite>
            title="Job Invitations"
            description="Manage and track all job invitations sent to candidates"
            columns={columns}
            data={jobInvites}
            isLoading={isLoading}
            searchable={true}
            searchValue={searchTerm}
            searchPlaceholder="Search invitations by candidate name or email..."
            onSearchChange={setSearchTerm}
            filters={filters}
            pagination={pagination}
            onRefresh={handleRefresh}
            emptyState={{
              title: 'No job invitations found',
              description: 'Try adjusting your search criteria or filters.',
            }}
            getRowKey={(jobInvite) => jobInvite.id}
            containerClassName="h-full flex flex-col"
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );
}

export default function ClientJobInvitesTablePage() {
  return <ClientJobInvitesTableContent />;
}

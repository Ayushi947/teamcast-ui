'use client';

import { useState, useEffect, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import {
  Eye,
  Send,
  BriefcaseIcon,
  MapPinIcon,
  GraduationCapIcon,
  Calendar,
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import {
  WorkTypeEnum,
  JobPostingStatusEnum,
  IPaginatedResponse,
  IPartnerJobPostingList,
} from '@/lib/shared';
import { formatEnumValue } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import JobDetailsDialog from './components/job-details-dialog';
import JobApplyDialog from './components/job-apply-dialog';
import SaasDataTable, {
  SaasTableColumn,
  SaasTableAction,
  SaasTableFilter,
  SaasPaginationInfo,
} from '@/components/app/common/tables/saas-data-table';
import { partnerJobPostingService } from '@/lib/services/services';

declare module '@/lib/shared' {
  interface ICandidateJobPosting {
    location?: string;
  }

  interface IPartnerJobPosting {
    location?: string;
  }

  interface IPartnerJobPostingList {
    location: string;
  }
}

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

function JobsPageContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [applyJobId, setApplyJobId] = useState<string | null>(null);

  // Filter states - exact same pattern as candidates page
  const [jobTypeFilter, setJobTypeFilter] = useState<(WorkTypeEnum | 'ALL')[]>([
    'ALL',
  ]);
  const [statusFilter] = useState<(JobPostingStatusEnum | 'ALL')[]>(['ALL']);

  // Pagination and sorting states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const jobPostingService = partnerJobPostingService;

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

    if (jobTypeFilter.length > 0 && !jobTypeFilter.includes('ALL')) {
      params.jobType = jobTypeFilter;
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
    data: jobPostingsResponse,
    isLoading,
    refetch,
  } = useQuery<IPaginatedResponse<IPartnerJobPostingList>>({
    queryKey: [
      'partnerJobPostings',
      currentPage,
      debouncedSearchTerm,
      jobTypeFilter,
      statusFilter,
      pageSize,
      sortBy,
      sortOrder,
    ],
    queryFn: () => jobPostingService.getJobPostings(buildQueryParams()),
  });

  // Extract data - exact same pattern as candidates page
  const jobPostings = jobPostingsResponse?.items || [];
  const totalPages = jobPostingsResponse?.pagination?.totalPages || 1;
  const totalItems = jobPostingsResponse?.pagination?.total || 0;

  // Event handlers
  const handleViewJobPosting = (jobId: string) => {
    setApplyJobId(null);
    setSelectedJobId(jobId);
  };

  const handleApplyJob = (jobId: string) => {
    setSelectedJobId(null);
    setApplyJobId(jobId);
  };

  const handleCloseDetailsDialog = () => {
    setSelectedJobId(null);
  };

  const handleCloseApplyDialog = (success: boolean = false) => {
    setApplyJobId(null);
    if (success) {
      refetch();
    }
  };

  const getJobTypeVariant = (jobType: string) => {
    switch (jobType) {
      case 'FULL_TIME':
      case 'EMPLOYEE':
        return 'default';
      case 'PART_TIME':
        return 'secondary';
      case 'CONTRACT':
      case 'CONTRACTOR':
        return 'outline';
      case 'FREELANCE':
        return 'outline';
      case 'INTERNSHIP':
      case 'INTERN':
      case 'APPRENTICESHIP':
        return 'destructive';
      case 'VOLUNTEER':
        return 'secondary';
      case 'OTHER':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const formatJobType = (jobType: string) => {
    switch (jobType) {
      case 'EMPLOYEE':
        return 'Employee';
      case 'CONTRACTOR':
        return 'Contractor';
      case 'APPRENTICESHIP':
        return 'Apprenticeship';
      case 'VOLUNTEER':
        return 'Volunteer';
      case 'OTHER':
        return 'Other';
      default:
        return formatEnumValue(jobType);
    }
  };

  const getLocationString = (job: IPartnerJobPostingList) => {
    if (job.isRemote) {
      return 'Remote';
    }
    return job.location || 'On-site';
  };

  const isNewJob = (createdAt: Date) => {
    return differenceInDays(new Date(), new Date(createdAt)) <= 7;
  };

  // Table configuration - exact same pattern as candidates page
  const columns: SaasTableColumn<IPartnerJobPostingList>[] = [
    {
      key: 'title',
      label: 'Job Title',
      sortable: true,
      render: (job: IPartnerJobPostingList) => (
        <div className="flex items-center gap-2">
          <BriefcaseIcon className="h-4 w-4" />
          <div>
            <span className="font-medium">{job.title}</span>
            {job.createdAt && isNewJob(job.createdAt) && (
              <Badge className="ml-2 bg-green-500 text-white">New</Badge>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'jobType',
      label: 'Job Type',
      sortable: true,
      render: (job: IPartnerJobPostingList) => (
        <Badge variant={getJobTypeVariant(job.jobType) as any}>
          {formatJobType(job.jobType)}
        </Badge>
      ),
    },
    {
      key: 'location',
      label: 'Location',
      sortable: true,
      render: (job: IPartnerJobPostingList) => (
        <div className="flex items-center gap-1">
          <MapPinIcon className="h-4 w-4" />
          <span>{getLocationString(job)}</span>
        </div>
      ),
    },
    {
      key: 'totalExperience',
      label: 'Experience',
      sortable: true,
      render: (job: IPartnerJobPostingList) => (
        <div className="flex items-center gap-1">
          <GraduationCapIcon className="h-4 w-4" />
          <span>{job.totalExperience} years</span>
        </div>
      ),
    },
    {
      key: 'requiredSkills',
      label: 'Required Skills',
      sortable: false,
      render: (job: IPartnerJobPostingList) => (
        <div className="flex flex-wrap gap-1">
          {job.requiredSkills?.slice(0, 3).map((skill, index) => (
            <Badge key={index} variant="outline">
              {skill}
            </Badge>
          ))}
          {job.requiredSkills && job.requiredSkills.length > 3 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline">
                    +{job.requiredSkills.length - 3}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="max-w-xs">
                    {job.requiredSkills.slice(3).map((skill, index) => (
                      <Badge key={index} variant="outline" className="m-1">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Posted',
      sortable: true,
      render: (job: IPartnerJobPostingList) => (
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          <span>
            {job.createdAt
              ? format(new Date(job.createdAt), 'MMM d, yyyy')
              : 'N/A'}
          </span>
        </div>
      ),
    },
  ];

  // Table actions - exact same pattern as candidates page
  const actions: SaasTableAction<IPartnerJobPostingList>[] = [
    {
      key: 'view-details',
      label: 'View Details',
      icon: <Eye className="h-4 w-4" />,
      onClick: (job: IPartnerJobPostingList) => handleViewJobPosting(job.id),
    },
    {
      key: 'apply',
      label: 'Apply',
      icon: <Send className="h-4 w-4" />,
      onClick: (job: IPartnerJobPostingList) => handleApplyJob(job.id),
    },
  ];

  // Table filters - exact same pattern as candidates page
  const filters: SaasTableFilter[] = [
    {
      key: 'jobType',
      label: 'Job Type',
      type: 'multiselect',
      placeholder: 'Select job type',
      value: jobTypeFilter,
      onChange: (value) => {
        if (Array.isArray(value)) {
          setJobTypeFilter(value as (WorkTypeEnum | 'ALL')[]);
        } else {
          setJobTypeFilter([value as WorkTypeEnum | 'ALL']);
        }
        setCurrentPage(1);
      },
      options: [
        { label: 'All Types', value: 'ALL' },
        ...Object.values(WorkTypeEnum).map((type) => ({
          label: formatEnumValue(type),
          value: type,
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
    <>
      <SaasDataTable<IPartnerJobPostingList>
        title="Available Job Postings"
        description="Browse and apply to job opportunities"
        columns={columns}
        data={jobPostings}
        actions={actions}
        isLoading={isLoading}
        searchable={true}
        searchValue={searchTerm}
        searchPlaceholder="Search job postings by title, skills, or location..."
        onSearchChange={setSearchTerm}
        filters={filters}
        pagination={pagination}
        onRefresh={refetch}
        emptyState={{
          title: 'No job postings found',
          description: 'Try adjusting your search criteria or filters',
        }}
        getRowKey={(job) => job.id}
      />

      {/* Job Details Dialog */}
      {selectedJobId && (
        <JobDetailsDialog
          key={`details-dialog-${selectedJobId}-${Date.now()}`}
          jobId={selectedJobId}
          onClose={handleCloseDetailsDialog}
          onApply={() => {
            handleCloseDetailsDialog();
            handleApplyJob(selectedJobId);
          }}
        />
      )}

      {/* Job Apply Dialog */}
      {applyJobId && (
        <JobApplyDialog
          key={`apply-dialog-${applyJobId}-${Date.now()}`}
          jobId={applyJobId}
          onClose={(success) => handleCloseApplyDialog(success)}
        />
      )}
    </>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <JobsPageContent />
    </Suspense>
  );
}

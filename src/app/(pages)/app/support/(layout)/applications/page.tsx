'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Building,
  FileText,
  Search,
  CheckCircle,
  XCircle,
  Award,
  Download,
} from 'lucide-react';
import { format } from 'date-fns';
import { supportJobApplicationService } from '@/lib/services/services';
import {
  ISupportJobApplication,
  ApplicationStatusEnum,
  IPaginatedResponse,
} from '@/lib/shared';
import { formatEnumValue } from '@/lib/utils';
import SaasDataTable, {
  SaasTableColumn,
  SaasTableAction,
  SaasTableFilter,
  SaasPaginationInfo,
} from '@/components/app/common/tables/saas-data-table';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { useApp } from '@/lib/context/app-context';

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

function SupportApplicationsTableContent() {
  const router = useRouter();
  useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    (ApplicationStatusEnum | 'ALL')[]
  >(['ALL']);
  const [jobFilter, _setJobFilter] = useState<string>('ALL');
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

    if (jobFilter !== 'ALL') {
      params.jobId = jobFilter;
    }

    return params;
  };

  // Server-side query
  const {
    data: applicationsResponse,
    isLoading,
    refetch,
  } = useQuery<IPaginatedResponse<ISupportJobApplication>>({
    queryKey: [
      'supportApplications',
      currentPage,
      debouncedSearchTerm,
      statusFilter,
      jobFilter,
      pageSize,
      sortBy,
      sortOrder,
    ],
    queryFn: () =>
      supportJobApplicationService.getSupportJobApplications(
        buildQueryParams()
      ),
  });

  // Extract data
  const applications = applicationsResponse?.items || [];
  const totalPages = applicationsResponse?.pagination?.totalPages || 1;
  const totalItems = applicationsResponse?.pagination?.total || 0;

  const handleViewDetails = async (application: ISupportJobApplication) => {
    try {
      router.push(`/app/support/applications/${application.id}`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to view application details. Please try again.'
      );
    }
  };

  const handleDownloadCoverLetter = async (
    coverLetterUrl: string,
    candidateName?: string
  ) => {
    try {
      const response = await fetch(coverLetterUrl);
      if (!response.ok) {
        throw new Error('Failed to download cover letter');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Try to get filename from URL or use a default with candidate name
      const urlPath = new URL(coverLetterUrl).pathname;
      const cleanCandidateName =
        candidateName?.toLowerCase().replace(/\s+/g, '-') || 'candidate';
      const filename =
        urlPath.split('/').pop() || `cover-letter-${cleanCandidateName}.pdf`;

      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Cover letter downloaded successfully');
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to download cover letter. Please try again.'
      );
    }
  };

  // Badge variant helpers
  const getStatusBadgeVariant = (status: ApplicationStatusEnum) => {
    switch (status) {
      case ApplicationStatusEnum.APPLIED:
        return 'secondary';
      case ApplicationStatusEnum.REVIEWING:
        return 'outline';
      case ApplicationStatusEnum.SHORTLISTED:
        return 'default';
      case ApplicationStatusEnum.OFFERED:
        return 'default';
      case ApplicationStatusEnum.ACCEPTED:
        return 'default';
      case ApplicationStatusEnum.REJECTED:
        return 'destructive';
      case ApplicationStatusEnum.WITHDRAWN:
        return 'secondary';
      case ApplicationStatusEnum.INVITED:
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: ApplicationStatusEnum) => {
    switch (status) {
      case ApplicationStatusEnum.APPLIED:
        return <FileText className="h-3 w-3" />;
      case ApplicationStatusEnum.REVIEWING:
        return <Search className="h-3 w-3" />;
      case ApplicationStatusEnum.SHORTLISTED:
        return <CheckCircle className="h-3 w-3" />;
      case ApplicationStatusEnum.OFFERED:
        return <Award className="h-3 w-3" />;
      case ApplicationStatusEnum.ACCEPTED:
        return <CheckCircle className="h-3 w-3" />;
      case ApplicationStatusEnum.REJECTED:
        return <XCircle className="h-3 w-3" />;
      case ApplicationStatusEnum.WITHDRAWN:
        return <XCircle className="h-3 w-3" />;
      case ApplicationStatusEnum.INVITED:
        return <Calendar className="h-3 w-3" />;
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
  const columns: SaasTableColumn<ISupportJobApplication>[] = [
    {
      key: 'candidate',
      label: 'Candidate',
      sortable: false,
      className: 'cursor-pointer',
      render: (application: ISupportJobApplication) => (
        <div
          className="flex cursor-pointer items-center gap-3"
          onClick={() => handleViewDetails(application)}
        >
          <Avatar className="h-8 w-8 rounded-full border">
            <AvatarImage
              src={application.candidate?.user?.image || ''}
              alt={application.candidate?.user?.name || 'Candidate'}
            />
            <AvatarFallback className="bg-gradient-to-br from-blue-100 to-indigo-100 text-xs font-bold text-blue-700 dark:from-blue-900 dark:to-indigo-900 dark:text-blue-300">
              {getCandidateInitials(
                application.candidateId,
                application.candidate?.user?.name
              )}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">
              {application.candidate?.user?.name ||
                `Candidate #${application.candidateId?.substring(0, 6)}`}
            </div>
            <div className="text-muted-foreground text-sm">
              {application.candidate?.user?.email || 'No email'}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'jobPosting.title',
      label: 'Position',
      sortable: true,
      className: 'cursor-pointer',
      render: (application: ISupportJobApplication) => (
        <div
          className="flex cursor-pointer items-center gap-2"
          onClick={() => handleViewDetails(application)}
        >
          <Building className="h-4 w-4" />
          <div>
            <div className="font-medium">{application.jobTitle || 'N/A'}</div>
            <div className="text-muted-foreground text-sm">
              {application.companyName || 'Unknown Company'}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'appliedAt',
      label: 'Applied Date',
      sortable: true,
      className: 'cursor-pointer',
      render: (application: ISupportJobApplication) => (
        <div
          className="flex cursor-pointer items-center gap-1"
          onClick={() => handleViewDetails(application)}
        >
          <Calendar className="h-4 w-4" />
          <span>
            {application.appliedAt
              ? format(new Date(application.appliedAt), 'MMM d, yyyy')
              : 'N/A'}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      className: 'cursor-pointer',
      render: (application: ISupportJobApplication) => (
        <div
          onClick={() => handleViewDetails(application)}
          className="cursor-pointer"
        >
          <Badge
            variant={getStatusBadgeVariant(application.status) as any}
            className="flex w-24 items-center justify-center gap-1"
          >
            {getStatusIcon(application.status)}
            <span>{formatEnumValue(application.status)}</span>
          </Badge>
        </div>
      ),
    },
    {
      key: 'coverLetter',
      label: 'Cover Letter',
      sortable: false,
      render: (application: ISupportJobApplication) => (
        <div className="flex items-center gap-2">
          {application.coverLetter ? (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleDownloadCoverLetter(
                  application.coverLetter!,
                  application.candidate?.user?.name
                );
              }}
              className="h-8 text-xs"
            >
              <Download className="mr-1 h-3 w-3" />
              Download
            </Button>
          ) : (
            <span className="text-muted-foreground text-sm">
              No cover letter
            </span>
          )}
        </div>
      ),
    },
  ];

  // Table actions
  const actions: SaasTableAction<ISupportJobApplication>[] = [];

  // Table filters
  const filters: SaasTableFilter[] = [
    {
      key: 'status',
      label: 'Status',
      placeholder: 'Select status',
      value: statusFilter,
      onChange: (value) => {
        if (Array.isArray(value)) {
          setStatusFilter(value as (ApplicationStatusEnum | 'ALL')[]);
        } else {
          setStatusFilter([value as ApplicationStatusEnum | 'ALL']);
        }
        setCurrentPage(1);
      },
      options: [
        { label: 'All Status', value: 'ALL' },
        ...Object.values(ApplicationStatusEnum).map((status) => ({
          label: formatEnumValue(status as string),
          value: status as string,
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
    <div className="flex h-full flex-col">
      {/* Table container with full height */}
      <div className="flex-1">
        <div className="h-full p-4">
          <SaasDataTable<ISupportJobApplication>
            title="Applications"
            description="Manage and track all accepted applications across the platform"
            columns={columns}
            data={applications}
            actions={actions}
            isLoading={isLoading}
            searchable={true}
            searchValue={searchTerm}
            searchPlaceholder="Search applications by candidate or position..."
            onSearchChange={setSearchTerm}
            filters={filters}
            pagination={pagination}
            onRefresh={refetch}
            emptyState={{
              title: 'No applications found',
              description: 'Try adjusting your search criteria or filters.',
            }}
            getRowKey={(application) => application.id}
            containerClassName="h-full flex flex-col"
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );
}

export default function SupportApplicationsTablePage() {
  return <SupportApplicationsTableContent />;
}

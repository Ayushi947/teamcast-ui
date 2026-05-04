'use client';

import { useState, useEffect, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';
import { format } from 'date-fns';

import { partnerCandidateService } from '@/lib/services/services';
import type { IPartnerCandidate, IPaginatedResponse } from '@/lib/shared';
import { CandidateStatusEnum } from '@/lib/shared';
import { toast } from 'sonner';
import SaasDataTable, {
  SaasTableColumn,
  SaasPaginationInfo,
  SaasTableFilter,
} from '@/components/app/common/tables/saas-data-table';

// Helper function to format enum values
const formatEnumValue = (value: string) => {
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

function CandidatesPageContent() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    (CandidateStatusEnum | 'ALL')[]
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

  // Handle sort change
  const handleSortChange = (
    field: string | null,
    order: 'asc' | 'desc' | null
  ) => {
    setSortBy(field || '');
    setSortOrder(order || 'desc');
    setCurrentPage(1); // Reset to first page when sorting changes
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

  const {
    data: candidatesResponse,
    isLoading,
    refetch,
  } = useQuery<IPaginatedResponse<IPartnerCandidate>>({
    queryKey: [
      'partnerCandidates',
      currentPage,
      debouncedSearchTerm,
      statusFilter,
      pageSize,
      sortBy,
      sortOrder,
    ],
    queryFn: () => partnerCandidateService.getCandidates(buildQueryParams()),
  });

  const candidates = candidatesResponse?.items || [];
  const totalPages = candidatesResponse?.pagination?.totalPages || 1;
  const totalItems = candidatesResponse?.pagination?.total || 0;

  // Badge variant helpers
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'ONBOARDED':
        return 'default';
      case 'NEW':
        return 'secondary';
      case 'HIRED':
        return 'default';
      case 'REJECTED':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  // Table configuration
  const columns: SaasTableColumn<IPartnerCandidate>[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (candidate: IPartnerCandidate) => (
        <span className="font-medium">{candidate.name}</span>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
    },
    {
      key: 'jobTitle',
      label: 'Job Title',
      sortable: true,
      render: (candidate: IPartnerCandidate) =>
        candidate.jobTitle || 'Not specified',
    },

    {
      key: 'completionPercentage',
      label: 'Completion',
      sortable: true,
      render: (candidate: IPartnerCandidate) =>
        `${candidate.completionPercentage}%`,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (candidate: IPartnerCandidate) => (
        <Badge variant={getStatusBadgeVariant(candidate.status)}>
          {formatEnumValue(candidate.status)}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (candidate: IPartnerCandidate) =>
        format(new Date(candidate.createdAt), 'MMM d, yyyy'),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (candidate: IPartnerCandidate) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/app/partner/candidates/${candidate.id}`)}
          className="h-8 gap-1"
        >
          <Eye className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">View Details</span>
        </Button>
      ),
    },
  ];

  // Table filters
  const filters: SaasTableFilter[] = [
    {
      key: 'status',
      label: 'Status',
      placeholder: 'Select status',
      value: statusFilter,
      onChange: (value: string | string[] | Date | [Date, Date] | null) => {
        if (!value) {
          setStatusFilter(['ALL']);
        } else if (Array.isArray(value) && typeof value[0] === 'string') {
          setStatusFilter(value as (CandidateStatusEnum | 'ALL')[]);
        } else if (typeof value === 'string') {
          setStatusFilter([value as CandidateStatusEnum | 'ALL']);
        }
        setCurrentPage(1);
      },
      options: [
        { label: 'All Status', value: 'ALL' },
        ...Object.values(CandidateStatusEnum).map((status) => ({
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

  const handleRefresh = () => {
    refetch();
    toast.success('Candidates refreshed');
  };

  return (
    <>
      <SaasDataTable<IPartnerCandidate>
        title="Candidates"
        description="Manage and track your candidates"
        data={candidates}
        columns={columns}
        isLoading={isLoading}
        searchable={true}
        searchValue={searchTerm}
        searchPlaceholder="Search candidates by name or email..."
        onSearchChange={setSearchTerm}
        filters={filters}
        pagination={pagination}
        onRefresh={handleRefresh}
        emptyState={{
          title: 'No candidates found',
          description: 'Try adjusting your search criteria or filters',
        }}
        getRowKey={(candidate) => candidate.id}
      />
    </>
  );
}

export default function CandidatesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CandidatesPageContent />
    </Suspense>
  );
}

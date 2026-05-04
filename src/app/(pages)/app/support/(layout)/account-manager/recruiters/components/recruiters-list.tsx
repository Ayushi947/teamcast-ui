'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { User } from 'lucide-react';
import { format } from 'date-fns';
import { IPaginatedResponse, IRecruiterListItem } from '@/lib/shared';
import { formatEnumValue } from '@/lib/utils';
import { useApp } from '@/lib/context/app-context';

import SaasDataTable, {
  SaasTableColumn,
  SaasPaginationInfo,
} from '@/components/app/common/tables/saas-data-table';
import { supportJobPostingRecruiterAssignmentService } from '@/lib/services/services';

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export function RecruitersList() {
  const { user } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Get account manager ID from current user
  const accountManagerId = user?.supportUserId || user?.id;

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
    };

    if (debouncedSearchTerm.trim()) {
      params.search = debouncedSearchTerm.trim();
    }

    if (sortBy && sortOrder) {
      params.sortBy = sortBy;
      params.sortOrder = sortOrder;
    }

    return params;
  };

  // Server-side query
  const {
    data: recruitersResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      'supportRecruiters',
      accountManagerId,
      currentPage,
      pageSize,
      debouncedSearchTerm,
      sortBy,
      sortOrder,
    ],
    queryFn: async () => {
      const response =
        await supportJobPostingRecruiterAssignmentService.getAvailableRecruitersForAccountManager(
          accountManagerId!,
          buildQueryParams()
        );
      return response as unknown as IPaginatedResponse<IRecruiterListItem>;
    },
    enabled: !!accountManagerId,
  });

  // Extract data and transform to match table expectations
  const recruiters: IRecruiterListItem[] = recruitersResponse?.items || [];
  const totalPages = recruitersResponse?.pagination?.totalPages || 1;
  const totalItems = recruitersResponse?.pagination?.total || 0;

  // Event handlers
  // Removed handleViewRecruiter function - no longer needed

  // Badge variant helpers
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'RECRUITER':
        return 'default';
      case 'SENIOR_RECRUITER':
        return 'secondary';
      case 'LEAD_RECRUITER':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'default';
      case 'INACTIVE':
        return 'outline';
      case 'BLOCKED':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  // Table configuration
  const columns: SaasTableColumn<IRecruiterListItem>[] = [
    {
      key: 'name',
      label: 'Recruiter',
      sortable: true,
      render: (recruiter: IRecruiterListItem) => (
        <div className="flex items-center gap-2">
          <User className="text-muted-foreground h-4 w-4" />
          <div>
            <span className="font-medium">{recruiter.name || 'Unknown'}</span>
            <p className="text-muted-foreground text-sm">
              {recruiter.email || 'No email'}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'jobTitle',
      label: 'Job Title',
      sortable: false,
      render: (recruiter: IRecruiterListItem) => (
        <span className="text-sm font-medium">
          {recruiter.jobTitle || 'N/A'}
        </span>
      ),
    },
    {
      key: 'department',
      label: 'Department',
      sortable: false,
      render: (recruiter: IRecruiterListItem) => (
        <span className="text-sm font-medium">
          {recruiter.department || 'N/A'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (recruiter: IRecruiterListItem) => (
        <span className="text-muted-foreground text-sm">
          {recruiter.createdAt
            ? format(new Date(recruiter.createdAt), 'MMM d, yyyy')
            : 'N/A'}
        </span>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (recruiter: IRecruiterListItem) => (
        <Badge variant={getRoleBadgeVariant(recruiter.role || '')}>
          {formatEnumValue(recruiter.role || 'UNKNOWN')}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (recruiter: IRecruiterListItem) => (
        <Badge variant={getStatusBadgeVariant(recruiter.status || '')}>
          {formatEnumValue(recruiter.status || 'UNKNOWN')}
        </Badge>
      ),
    },
  ];

  // Table actions
  // Removed actions - no view details functionality needed

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
    <div className="space-y-6">
      <SaasDataTable<IRecruiterListItem>
        columns={columns}
        data={recruiters}
        actions={[]}
        isLoading={isLoading}
        searchable={true}
        searchValue={searchTerm}
        searchPlaceholder="Search recruiters by name or email..."
        onSearchChange={setSearchTerm}
        pagination={pagination}
        onRefresh={refetch}
        emptyState={{
          icon: <User className="text-muted-foreground/50 h-12 w-12" />,
          title: 'No recruiters found',
          description: 'Try adjusting your search criteria or filters',
        }}
        getRowKey={(recruiter) => recruiter.id}
        error={error?.message || null}
      />
    </div>
  );
}

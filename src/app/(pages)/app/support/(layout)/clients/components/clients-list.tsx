'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Eye, Users, FileText, Building } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  CompanyIndustryEnum,
  CompanySizeEnum,
  IPaginatedResponse,
  ISupportClientListResponse,
} from '@/lib/shared';
import { formatEnumValue } from '@/lib/utils';

import SaasDataTable, {
  SaasTableColumn,
  SaasTableAction,
  SaasTableFilter,
  SaasPaginationInfo,
} from '@/components/app/common/tables/saas-data-table';
import { supportClientManagementService } from '@/lib/services/services';
import { useTableQueryParams } from '@/lib/hooks/use-table-query-params';

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export function ClientsList() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState<
    (CompanyIndustryEnum | 'ALL')[]
  >(['ALL']);
  const [sizeFilter, setSizeFilter] = useState<(CompanySizeEnum | 'ALL')[]>([
    'ALL',
  ]);

  const {
    page: currentPage,
    pageSize,
    sortBy,
    sortOrder,
    setPage,
    setPageSize,
    setSort,
    requestParams: paginationParams,
  } = useTableQueryParams({
    defaultPage: 1,
    defaultPageSize: 10,
    defaultSortBy: 'createdAt',
    defaultSortOrder: 'desc',
    pageParam: 'page',
    pageSizeParam: 'pageSize',
    requestParamNames: {
      page: 'page',
      pageSize: 'limit',
      sortBy: 'sortBy',
      sortOrder: 'sortOrder',
    },
    preserveDefaultsInQuery: false,
  });

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = searchTerm.trim();
      setDebouncedSearchTerm(searchTerm);

      if (trimmed && currentPage !== 1) {
        setPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  // Handle sort change
  const handleSortChange = (
    field: string | null,
    order: 'asc' | 'desc' | null
  ) => {
    setSort(field || '', order || 'desc');
  };

  // Build query parameters for server-side filtering
  const buildQueryParams = () => {
    const params: Record<string, string | number> = {
      ...paginationParams,
    };

    if (debouncedSearchTerm.trim()) {
      params.search = debouncedSearchTerm.trim();
    }

    // Add industry filter
    if (industryFilter.length > 0 && !industryFilter.includes('ALL')) {
      params.industry = industryFilter.join(',');
    }

    // Add size filter
    if (sizeFilter.length > 0 && !sizeFilter.includes('ALL')) {
      params.size = sizeFilter.join(',');
    }

    if (sortBy && sortOrder) {
      params.sortBy = sortBy;
      params.sortOrder = sortOrder;
    }

    return params;
  };

  // Server-side query
  const {
    data: clientsResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      'supportClients',
      currentPage,
      pageSize,
      debouncedSearchTerm,
      industryFilter.join(','),
      sizeFilter.join(','),
      sortBy,
      sortOrder,
    ],
    queryFn: async () => {
      const response =
        await supportClientManagementService.listSupportClients(
          buildQueryParams()
        );
      return response as unknown as IPaginatedResponse<ISupportClientListResponse>;
    },
  });

  // Extract data and transform to match table expectations
  const clients: ISupportClientListResponse[] = clientsResponse?.items || [];
  const totalPages = clientsResponse?.pagination?.totalPages || 1;
  const totalItems = clientsResponse?.pagination?.total || 0;

  // Event handlers
  const handleViewClient = (clientId: string) => {
    // Include current table state in the URL so we can return to it
    const params = new URLSearchParams();
    params.set('tab', 'clients');
    if (currentPage !== 1) {
      params.set('page', currentPage.toString());
    }
    if (pageSize !== 10) {
      params.set('pageSize', pageSize.toString());
    }
    if (sortBy && sortBy !== 'createdAt') {
      params.set('sortBy', sortBy);
    }
    if (sortBy && sortOrder && sortOrder !== 'desc') {
      params.set('sortOrder', sortOrder);
    }
    const queryString = params.toString();
    router.push(
      `/app/support/clients/${clientId}${queryString ? `?${queryString}` : ''}`
    );
  };

  const handlePageSizeChange = (newSize: number) => {
    if (totalItems > 0) {
      const newTotalPages = Math.ceil(totalItems / newSize);
      if (currentPage <= newTotalPages) {
        setPageSize(newSize, { resetPage: false });
      } else {
        setPageSize(newSize, { resetPage: true });
      }
    } else {
      setPageSize(newSize, { resetPage: true });
    }
  };

  // Display mappings
  const CompanySizeDisplay = {
    [CompanySizeEnum.ONE_TO_TEN]: '1-10 employees',
    [CompanySizeEnum.ELEVEN_TO_FIFTY]: '11-50 employees',
    [CompanySizeEnum.FIFTY_ONE_TO_TWO_HUNDRED]: '51-200 employees',
    [CompanySizeEnum.TWO_HUNDRED_ONE_TO_FIVE_HUNDRED]: '201-500 employees',
    [CompanySizeEnum.FIVE_HUNDRED_ONE_TO_THOUSAND]: '501-1000 employees',
    [CompanySizeEnum.OVER_THOUSAND]: '1000+ employees',
  } as const;

  // Badge variant helpers
  const getIndustryBadgeVariant = (industry: string) => {
    switch (industry) {
      case 'TECHNOLOGY':
        return 'default';
      case 'FINANCE':
        return 'secondary';
      case 'HEALTHCARE':
        return 'outline';
      case 'EDUCATION':
        return 'secondary';
      case 'RETAIL':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getSizeBadgeVariant = (size: string) => {
    switch (size) {
      case 'ONE_TO_TEN':
        return 'outline';
      case 'ELEVEN_TO_FIFTY':
      case 'FIFTY_ONE_TO_TWO_HUNDRED':
        return 'secondary';
      case 'TWO_HUNDRED_ONE_TO_FIVE_HUNDRED':
      case 'FIVE_HUNDRED_ONE_TO_THOUSAND':
        return 'default';
      case 'OVER_THOUSAND':
        return 'default';
      default:
        return 'secondary';
    }
  };

  // Table configuration
  const columns: SaasTableColumn<ISupportClientListResponse>[] = [
    {
      key: 'companyName',
      label: 'Company',
      render: (client: ISupportClientListResponse) => (
        <div className="flex items-center gap-2">
          <Building className="text-muted-foreground h-4 w-4" />
          <div>
            <span className="font-medium">
              {client.companyName || 'Unknown'}
            </span>
            <p className="text-muted-foreground text-sm">
              {client.contactEmail || 'No contact'}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'userCount',
      label: 'Users',
      sortable: false,
      render: (client: ISupportClientListResponse) => (
        <div className="flex items-center gap-2">
          <Users className="text-muted-foreground h-4 w-4" />
          <span className="text-sm font-medium">{client.userCount || 0}</span>
        </div>
      ),
    },
    {
      key: 'jobPostingsCount',
      label: 'Job Postings',
      sortable: false,
      render: (client: ISupportClientListResponse) => (
        <div className="flex items-center gap-2">
          <FileText className="text-muted-foreground h-4 w-4" />
          <span className="text-sm font-medium">
            {client.jobPostingsCount || 0}
          </span>
        </div>
      ),
    },
    {
      key: 'industry',
      label: 'Industry',
      render: (client: ISupportClientListResponse) => (
        <Badge variant={getIndustryBadgeVariant(client.industry || '')}>
          {formatEnumValue(client.industry || 'UNKNOWN')}
        </Badge>
      ),
    },
    {
      key: 'size',
      label: 'Size',
      sortable: true,
      render: (client: ISupportClientListResponse) => (
        <Badge variant={getSizeBadgeVariant(client.size || '')}>
          {CompanySizeDisplay[client.size as CompanySizeEnum] || 'Unknown'}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (client: ISupportClientListResponse) => (
        <Badge
          variant={
            client.status === 'VERIFIED'
              ? 'default'
              : client.status === 'IN_PROGRESS'
                ? 'secondary'
                : 'outline'
          }
        >
          {formatEnumValue(client.status || 'UNKNOWN')}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (client: ISupportClientListResponse) => (
        <span className="text-muted-foreground text-sm">
          {client.createdAt
            ? format(new Date(client.createdAt), 'MMM d, yyyy')
            : 'N/A'}
        </span>
      ),
    },
  ];

  // Table actions
  const actions: SaasTableAction<ISupportClientListResponse>[] = [
    {
      key: 'view',
      label: 'View Details',
      icon: <Eye className="h-4 w-4" />,
      onClick: (client: ISupportClientListResponse) =>
        handleViewClient(client.id),
    },
  ];

  // Table filters
  const filters: SaasTableFilter[] = [
    {
      key: 'industry',
      label: 'Industry',
      type: 'multiselect',
      placeholder: 'Select industry',
      value: industryFilter,
      onChange: (value) => {
        if (Array.isArray(value)) {
          setIndustryFilter(value as (CompanyIndustryEnum | 'ALL')[]);
        } else {
          setIndustryFilter([value as CompanyIndustryEnum | 'ALL']);
        }
        setPage(1);
      },
      options: [
        { label: 'All Industries', value: 'ALL' },
        ...Object.values(CompanyIndustryEnum).map((industry) => ({
          label: formatEnumValue(industry),
          value: industry,
        })),
      ],
    },
    {
      key: 'size',
      label: 'Company Size',
      type: 'multiselect',
      placeholder: 'Select company size',
      value: sizeFilter,
      onChange: (value) => {
        if (Array.isArray(value)) {
          setSizeFilter(value as (CompanySizeEnum | 'ALL')[]);
        } else {
          setSizeFilter([value as CompanySizeEnum | 'ALL']);
        }
        setPage(1);
      },
      options: [
        { label: 'All Sizes', value: 'ALL' },
        ...Object.values(CompanySizeEnum).map((size) => ({
          label: CompanySizeDisplay[size],
          value: size,
        })),
      ],
    },
  ];

  // Pagination configuration
  const pagination: SaasPaginationInfo = {
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    onPageChange: setPage,
    onPageSizeChange: handlePageSizeChange,
    pageSizeOptions: PAGE_SIZE_OPTIONS,
    sortBy: sortBy ?? undefined,
    sortOrder: sortBy ? sortOrder : undefined,
    onSortChange: handleSortChange,
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Clients refreshed');
  };

  return (
    <div className="space-y-6">
      <SaasDataTable<ISupportClientListResponse>
        columns={columns}
        data={clients}
        actions={actions}
        isLoading={isLoading}
        searchable={true}
        searchValue={searchTerm}
        searchPlaceholder="Search clients by company name or email..."
        onSearchChange={setSearchTerm}
        filters={filters}
        pagination={pagination}
        onRefresh={handleRefresh}
        emptyState={{
          icon: <Building className="text-muted-foreground/50 h-12 w-12" />,
          title: 'No clients found',
          description: 'Try adjusting your search criteria or filters',
        }}
        getRowKey={(client) => client.id}
        error={error?.message || null}
      />
    </div>
  );
}

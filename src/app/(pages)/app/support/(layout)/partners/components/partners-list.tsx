'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Eye, Users, FileText, Building } from 'lucide-react';
import { format } from 'date-fns';
import {
  CompanyIndustryEnum,
  CompanySizeEnum,
  IPaginatedResponse,
  ISupportPartnerListResponse,
} from '@/lib/shared';
import { formatEnumValue } from '@/lib/utils';
import { toast } from 'sonner';
import SaasDataTable, {
  SaasTableColumn,
  SaasTableAction,
  SaasTableFilter,
  SaasPaginationInfo,
} from '@/components/app/common/tables/saas-data-table';
import { supportPartnerManagementService } from '@/lib/services/services';

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export function PartnersList() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState<
    (CompanyIndustryEnum | 'ALL')[]
  >(['ALL']);
  const [sizeFilter, setSizeFilter] = useState<(CompanySizeEnum | 'ALL')[]>([
    'ALL',
  ]);
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
    data: partnersResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      'supportPartners',
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
        await supportPartnerManagementService.listSupportPartners(
          buildQueryParams()
        );
      return response as unknown as IPaginatedResponse<ISupportPartnerListResponse>;
    },
  });

  // Extract data and transform to match table expectations
  const partners: ISupportPartnerListResponse[] = partnersResponse?.items || [];
  const totalPages = partnersResponse?.pagination?.totalPages || 1;
  const totalItems = partnersResponse?.pagination?.total || 0;

  // Event handlers
  const handleViewPartner = (partnerId: string) => {
    router.push(`/app/support/partners/${partnerId}`);
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
  const columns: SaasTableColumn<ISupportPartnerListResponse>[] = [
    {
      key: 'companyName',
      label: 'Company',
      render: (partner: ISupportPartnerListResponse) => (
        <div className="flex items-center gap-2">
          <Building className="text-muted-foreground h-4 w-4" />
          <div>
            <span className="font-medium">{partner.companyName}</span>
            <p className="text-muted-foreground text-sm">{partner.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'candidateCount',
      label: 'Candidates',
      sortable: false,
      render: (partner: ISupportPartnerListResponse) => (
        <div className="flex items-center gap-2">
          <Users className="text-muted-foreground h-4 w-4" />
          <span className="text-sm font-medium">
            {partner.candidateCount || 0}
          </span>
        </div>
      ),
    },
    {
      key: 'userCount',
      label: 'Users',
      sortable: false,
      render: (partner: ISupportPartnerListResponse) => (
        <div className="flex items-center gap-2">
          <Users className="text-muted-foreground h-4 w-4" />
          <span className="text-sm font-medium">{partner.userCount || 0}</span>
        </div>
      ),
    },
    {
      key: 'jobApplicationsCount',
      label: 'Applications',
      sortable: false,
      render: (partner: ISupportPartnerListResponse) => (
        <div className="flex items-center gap-2">
          <FileText className="text-muted-foreground h-4 w-4" />
          <span className="text-sm font-medium">
            {partner.jobApplicationsCount || 0}
          </span>
        </div>
      ),
    },
    {
      key: 'industry',
      label: 'Industry',

      render: (partner: ISupportPartnerListResponse) => (
        <Badge variant={getIndustryBadgeVariant(partner.industry)}>
          {formatEnumValue(partner.industry)}
        </Badge>
      ),
    },
    {
      key: 'size',
      label: 'Size',
      sortable: true,
      render: (partner: ISupportPartnerListResponse) => (
        <Badge variant={getSizeBadgeVariant(partner.size)}>
          {CompanySizeDisplay[partner.size as CompanySizeEnum]}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (partner: ISupportPartnerListResponse) => (
        <span className="text-muted-foreground text-sm">
          {partner.createdAt
            ? format(new Date(partner.createdAt), 'MMM d, yyyy')
            : 'N/A'}
        </span>
      ),
    },
  ];

  // Table actions - remove impersonation action
  const actions: SaasTableAction<ISupportPartnerListResponse>[] = [
    {
      key: 'view',
      label: 'View Details',
      icon: <Eye className="h-4 w-4" />,
      onClick: (partner: ISupportPartnerListResponse) =>
        handleViewPartner(partner.id),
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
        setCurrentPage(1);
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
        setCurrentPage(1);
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
    onPageChange: setCurrentPage,
    onPageSizeChange: setPageSize,
    pageSizeOptions: PAGE_SIZE_OPTIONS,
    sortBy,
    sortOrder,
    onSortChange: handleSortChange,
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Partners refreshed');
  };

  return (
    <div className="space-y-6">
      <SaasDataTable<ISupportPartnerListResponse>
        columns={columns}
        data={partners}
        actions={actions}
        isLoading={isLoading}
        searchable={true}
        searchValue={searchTerm}
        searchPlaceholder="Search partners by company name or email..."
        onSearchChange={setSearchTerm}
        filters={filters}
        pagination={pagination}
        onRefresh={handleRefresh}
        emptyState={{
          icon: <Building className="text-muted-foreground/50 h-12 w-12" />,
          title: 'No partners found',
          description: 'Try adjusting your search criteria or filters',
        }}
        getRowKey={(partner) => partner.id}
        error={error?.message || null}
      />
    </div>
  );
}

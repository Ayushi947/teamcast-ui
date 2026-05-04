'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Edit, Trash2, Flag, Copy, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { IFeatureFlag, FeatureFlagCategoryEnum } from '@/lib/shared';
import { useClientBatchLookup } from '@/lib/hooks/use-client-lookup';
import { useTableQueryParams } from '@/lib/hooks/use-table-query-params';
import SaasDataTable, {
  SaasTableColumn,
  SaasTableAction,
  SaasTableFilter,
  SaasPaginationInfo,
} from '@/components/app/common/tables/saas-data-table';
import { featureFlagService } from '@/lib/services/services';

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

const getCategoryColor = (category: FeatureFlagCategoryEnum) => {
  const colors: Record<string, string> = {
    SYSTEM: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    ASSESSMENT:
      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    PROCTORING:
      'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    UI_ENHANCEMENT:
      'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
    ANALYTICS:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    INTEGRATION:
      'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
    EXPERIMENTAL:
      'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    BETA: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
    DEPRECATED: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  };
  return colors[category] || colors.SYSTEM;
};

interface FeatureFlagsListProps {
  onEditFlag?: (flag: IFeatureFlag) => void;
  onCopyToClients?: (flag: IFeatureFlag) => void;
  onScheduleFlag?: (flag: IFeatureFlag) => void;
}

export function FeatureFlagsList({
  onEditFlag,
  onCopyToClients,
  onScheduleFlag,
}: FeatureFlagsListProps) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterEnabled, setFilterEnabled] = useState<string>('all');

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
    defaultSortBy: 'category',
    defaultSortOrder: 'asc',
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
      if (searchTerm.trim() && currentPage !== 1) {
        setPage(1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, currentPage, setPage]);

  const buildQueryParams = useCallback(() => {
    const params: Record<string, string | number | boolean | undefined> = {
      ...paginationParams,
    };
    if (debouncedSearchTerm) params.search = debouncedSearchTerm;
    if (filterCategory !== 'all') params.category = filterCategory;
    if (filterEnabled === 'enabled') params.enabled = true;
    if (filterEnabled === 'disabled') params.enabled = false;
    if (sortBy && sortOrder) {
      params.sortBy = sortBy;
      params.sortOrder = sortOrder;
    }
    return params;
  }, [
    paginationParams,
    debouncedSearchTerm,
    filterCategory,
    filterEnabled,
    sortBy,
    sortOrder,
  ]);

  const {
    data: listResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      'supportFeatureFlags',
      currentPage,
      pageSize,
      debouncedSearchTerm,
      filterCategory,
      filterEnabled,
      sortBy,
      sortOrder,
    ],
    queryFn: async () => {
      return await featureFlagService.listFeatureFlags(buildQueryParams());
    },
  });

  const flags = listResponse?.items ?? [];
  const totalPages = listResponse?.pagination?.totalPages ?? 1;
  const totalItems = listResponse?.pagination?.total ?? 0;

  const clientIds = useMemo(
    () =>
      Array.from(
        new Set(flags.map((flag) => flag.clientId).filter(Boolean) as string[])
      ),
    [flags]
  );

  const { clientsMap } = useClientBatchLookup(clientIds);

  const invalidateFlags = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['supportFeatureFlags'] });
  }, [queryClient]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this feature flag?')) return;
    try {
      await featureFlagService.deleteFeatureFlag(id);
      toast.success('Feature flag deleted successfully');
      invalidateFlags();
    } catch (_error) {
      toast.error('Failed to delete feature flag');
    }
  };

  const handleToggle = async (flag: IFeatureFlag) => {
    try {
      await featureFlagService.updateFeatureFlag(flag.id, {
        enabled: !flag.enabled,
      });
      toast.success(
        `Feature flag ${!flag.enabled ? 'enabled' : 'disabled'} successfully`
      );
      invalidateFlags();
    } catch (_error) {
      toast.error('Failed to toggle feature flag');
    }
  };

  const handleSortChange = (
    field: string | null,
    order: 'asc' | 'desc' | null
  ) => {
    setSort(field || '', order || 'asc');
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

  const columns: SaasTableColumn<IFeatureFlag>[] = [
    {
      key: 'key',
      label: 'Key',
      sortable: true,
      render: (flag) => <span className="font-mono text-sm">{flag.key}</span>,
    },
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (flag) => (
        <div>
          <div className="font-medium">{flag.name}</div>
          {flag.description && (
            <div className="text-muted-foreground line-clamp-1 text-sm">
              {flag.description}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      render: (flag) => (
        <Badge className={getCategoryColor(flag.category)}>
          {flag.category.replace(/_/g, ' ')}
        </Badge>
      ),
    },
    {
      key: 'scope',
      label: 'Scope',
      sortable: false,
      render: (flag) =>
        flag.clientId ? (
          <div className="text-sm">
            <div className="font-medium">
              {clientsMap.get(flag.clientId)?.name || 'Client'}
            </div>
            <div className="text-muted-foreground font-mono text-xs">
              {flag.clientId.slice(0, 8)}…
            </div>
          </div>
        ) : (
          <Badge variant="outline">Global</Badge>
        ),
    },
    {
      key: 'enabled',
      label: 'Status',
      sortable: true,
      render: (flag) => (
        <div className="flex items-center gap-2">
          <Switch
            checked={flag.enabled}
            onCheckedChange={() => handleToggle(flag)}
          />
          <span
            className={
              flag.enabled
                ? 'text-green-600 dark:text-green-400'
                : 'text-gray-400'
            }
          >
            {flag.enabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>
      ),
    },
  ];

  const actions: SaasTableAction<IFeatureFlag>[] = [
    ...(onEditFlag
      ? [
          {
            key: 'edit',
            label: 'Edit',
            icon: <Edit className="h-4 w-4" />,
            onClick: (flag: IFeatureFlag) => onEditFlag(flag),
          },
        ]
      : []),
    ...(onCopyToClients
      ? [
          {
            key: 'copy-to-clients',
            label: 'Copy to clients',
            icon: <Copy className="h-4 w-4" />,
            onClick: (flag: IFeatureFlag) => onCopyToClients(flag),
            hidden: (flag: IFeatureFlag) => !!flag.clientId,
          },
        ]
      : []),
    ...(onScheduleFlag
      ? [
          {
            key: 'schedule',
            label: 'Schedule change',
            icon: <Clock className="h-4 w-4" />,
            onClick: (flag: IFeatureFlag) => onScheduleFlag(flag),
          },
        ]
      : []),
    {
      key: 'delete',
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4" />,
      variant: 'destructive' as const,
      onClick: (flag) => handleDelete(flag.id),
    },
  ];

  const filters: SaasTableFilter[] = [
    {
      key: 'category',
      label: 'Category',
      type: 'select',
      placeholder: 'All Categories',
      value: filterCategory,
      onChange: (value) => {
        setFilterCategory((value as string) || 'all');
        setPage(1);
      },
      options: [
        { label: 'All Categories', value: 'all' },
        ...Object.values(FeatureFlagCategoryEnum).map((cat) => ({
          label: cat.replace(/_/g, ' '),
          value: cat,
        })),
      ],
    },
    {
      key: 'enabled',
      label: 'Status',
      type: 'select',
      placeholder: 'All Status',
      value: filterEnabled,
      onChange: (value) => {
        setFilterEnabled((value as string) || 'all');
        setPage(1);
      },
      options: [
        { label: 'All Status', value: 'all' },
        { label: 'Enabled', value: 'enabled' },
        { label: 'Disabled', value: 'disabled' },
      ],
    },
  ];

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
    toast.success('Feature flags refreshed');
  };

  return (
    <div className="space-y-6">
      <SaasDataTable<IFeatureFlag>
        columns={columns}
        data={flags}
        actions={actions}
        isLoading={isLoading}
        searchable={true}
        searchValue={searchTerm}
        searchPlaceholder="Search by key, name or description..."
        onSearchChange={setSearchTerm}
        filters={filters}
        pagination={pagination}
        onRefresh={handleRefresh}
        emptyState={{
          icon: <Flag className="text-muted-foreground/50 h-12 w-12" />,
          title: 'No feature flags found',
          description:
            'Try adjusting your search or filters, or create a new flag',
        }}
        getRowKey={(flag) => flag.id}
        error={error?.message || null}
      />
    </div>
  );
}

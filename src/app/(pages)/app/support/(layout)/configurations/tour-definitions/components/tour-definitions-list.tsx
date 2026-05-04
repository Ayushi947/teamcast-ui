'use client';

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Edit, Trash2, Power, Eye, Copy } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import {
  ITourDefinitionExtended,
  IGetTourDefinitionsFilters,
} from '@/lib/shared/models/api/support/tour.definition.management.api';
import { tourDefinitionManagementService } from '@/lib/services/services';
import { formatEnumValue } from '@/lib/utils';
import SaasDataTable, {
  SaasTableColumn,
  SaasTableAction,
  SaasTableFilter,
  SaasPaginationInfo,
} from '@/components/app/common/tables/saas-data-table';
import { UserTypeEnum } from '@/lib/shared';

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

interface TourDefinitionsListProps {
  onEdit: (tour: ITourDefinitionExtended) => void;
}

export function TourDefinitionsList({ onEdit }: TourDefinitionsListProps) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState<
    (UserTypeEnum | 'ALL')[]
  >(['ALL']);
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | 'ALL'>('ALL');
  const [tourGroupFilter, setTourGroupFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<string>('priority');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tourToDelete, setTourToDelete] =
    useState<ITourDefinitionExtended | null>(null);
  const [availableGroups, setAvailableGroups] = useState<string[]>([]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch available tour groups
  const { data: groupsData } = useQuery({
    queryKey: ['tour-groups'],
    queryFn: () => tourDefinitionManagementService.getTourGroups(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    if (groupsData?.groups) {
      setAvailableGroups(groupsData.groups);
    }
  }, [groupsData]);

  // Build query parameters
  const buildQueryParams = (): {
    pagination: { page: number; limit: number };
    filters?: IGetTourDefinitionsFilters;
  } => {
    const filters: IGetTourDefinitionsFilters = {};

    if (debouncedSearchTerm) {
      filters.search = debouncedSearchTerm;
    }

    if (userTypeFilter.length > 0 && !userTypeFilter.includes('ALL')) {
      filters.userType = userTypeFilter[0] as string;
    }

    if (isActiveFilter !== 'ALL') {
      filters.isActive = isActiveFilter;
    }

    if (tourGroupFilter && tourGroupFilter !== 'ALL') {
      filters.tourGroup = tourGroupFilter;
    }

    return {
      pagination: {
        page: currentPage,
        limit: pageSize,
      },
      filters: Object.keys(filters).length > 0 ? filters : undefined,
    };
  };

  // Fetch tour definitions
  const {
    data: tourDefinitionsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [
      'tour-definitions',
      currentPage,
      pageSize,
      debouncedSearchTerm,
      userTypeFilter,
      isActiveFilter,
      tourGroupFilter,
      sortBy,
      sortOrder,
    ],
    queryFn: async () => {
      const { pagination, filters } = buildQueryParams();
      return await tourDefinitionManagementService.getAllTourDefinitions(
        pagination,
        filters
      );
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const tourDefinitions = tourDefinitionsData?.items || [];
  const totalItems = tourDefinitionsData?.pagination?.total || 0;
  const totalPages = tourDefinitionsData?.pagination?.totalPages || 0;

  // Handle delete
  const handleDelete = async () => {
    if (!tourToDelete) return;

    try {
      await tourDefinitionManagementService.deleteTourDefinition(
        tourToDelete.id
      );
      toast.success('Tour definition deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['tour-definitions'] });
      setDeleteDialogOpen(false);
      setTourToDelete(null);
    } catch (error) {
      logger.error('Error deleting tour definition:', error);
      toast.error('Failed to delete tour definition');
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (tour: ITourDefinitionExtended) => {
    try {
      await tourDefinitionManagementService.toggleTourDefinitionStatus(tour.id);
      toast.success(
        `Tour definition ${tour.isActive ? 'deactivated' : 'activated'} successfully`
      );
      queryClient.invalidateQueries({ queryKey: ['tour-definitions'] });
    } catch (error) {
      logger.error('Error toggling tour definition status:', error);
      toast.error('Failed to toggle tour definition status');
    }
  };

  // Handle duplicate
  const handleDuplicate = (tour: ITourDefinitionExtended) => {
    const duplicatedTour: Omit<
      ITourDefinitionExtended,
      'id' | 'createdAt' | 'updatedAt'
    > = {
      ...tour,
      tourKey: `${tour.tourKey}_copy_${Date.now()}`,
      name: `${tour.name} (Copy)`,
      isActive: false, // Inactive by default for duplicates
    };
    delete (duplicatedTour as any).id;
    delete (duplicatedTour as any).createdAt;
    delete (duplicatedTour as any).updatedAt;
    onEdit(duplicatedTour as ITourDefinitionExtended);
  };

  // Table columns
  const columns: SaasTableColumn<ITourDefinitionExtended>[] = [
    {
      key: 'tourKey',
      label: 'Tour Key',
      render: (tour: ITourDefinitionExtended) => (
        <div className="font-mono text-sm">{tour.tourKey}</div>
      ),
      sortable: true,
    },
    {
      key: 'name',
      label: 'Name',
      render: (tour: ITourDefinitionExtended) => (
        <div className="font-medium">{tour.name}</div>
      ),
      sortable: true,
    },
    {
      key: 'userType',
      label: 'User Type',
      render: (tour: ITourDefinitionExtended) => (
        <Badge variant="outline">{formatEnumValue(tour.userType)}</Badge>
      ),
    },
    {
      key: 'userRole',
      label: 'Role',
      render: (tour: ITourDefinitionExtended) =>
        tour.userRole ? (
          <Badge variant="secondary">{formatEnumValue(tour.userRole)}</Badge>
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        ),
    },
    {
      key: 'tourGroup',
      label: 'Group',
      render: (tour: ITourDefinitionExtended) =>
        tour.tourGroup ? (
          <Badge variant="outline">{tour.tourGroup}</Badge>
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        ),
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (tour: ITourDefinitionExtended) => (
        <div className="text-center font-medium">{tour.priority}</div>
      ),
      sortable: true,
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (tour: ITourDefinitionExtended) => (
        <Badge variant={tour.isActive ? 'default' : 'secondary'}>
          {tour.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'version',
      label: 'Version',
      render: (tour: ITourDefinitionExtended) => (
        <Badge variant="outline">{tour.version}</Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (tour: ITourDefinitionExtended) => (
        <div className="text-muted-foreground text-sm">
          {format(new Date(tour.createdAt), 'MMM d, yyyy')}
        </div>
      ),
      sortable: true,
    },
  ];

  // Table actions
  const actions: SaasTableAction<ITourDefinitionExtended>[] = [
    {
      key: 'view',
      label: 'View',
      icon: <Eye className="h-4 w-4" />,
      onClick: (tour: ITourDefinitionExtended) => onEdit(tour),
    },
    {
      key: 'edit',
      label: 'Edit',
      icon: <Edit className="h-4 w-4" />,
      onClick: (tour: ITourDefinitionExtended) => onEdit(tour),
    },
    {
      key: 'duplicate',
      label: 'Duplicate',
      icon: <Copy className="h-4 w-4" />,
      onClick: (tour: ITourDefinitionExtended) => handleDuplicate(tour),
    },
    {
      key: 'toggle-status',
      label: 'Toggle Status',
      icon: <Power className="h-4 w-4" />,
      onClick: (tour: ITourDefinitionExtended) => handleToggleStatus(tour),
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (tour: ITourDefinitionExtended) => {
        setTourToDelete(tour);
        setDeleteDialogOpen(true);
      },
      variant: 'destructive',
    },
  ];

  // Table filters
  const filters: SaasTableFilter[] = [
    {
      key: 'userType',
      label: 'User Type',
      type: 'multiselect',
      placeholder: 'Select user type',
      value: userTypeFilter,
      onChange: (value) => {
        if (Array.isArray(value)) {
          setUserTypeFilter(value as (UserTypeEnum | 'ALL')[]);
        } else {
          setUserTypeFilter([value as UserTypeEnum | 'ALL']);
        }
        setCurrentPage(1);
      },
      options: [
        { label: 'All Types', value: 'ALL' },
        ...Object.values(UserTypeEnum).map((type) => ({
          label: formatEnumValue(type),
          value: type,
        })),
      ],
    },
    {
      key: 'isActive',
      label: 'Status',
      type: 'select',
      placeholder: 'Select status',
      value:
        isActiveFilter === 'ALL' ? 'ALL' : isActiveFilter ? 'true' : 'false',
      onChange: (value) => {
        if (value === 'ALL') {
          setIsActiveFilter('ALL');
        } else {
          setIsActiveFilter(value === 'true');
        }
        setCurrentPage(1);
      },
      options: [
        { label: 'All', value: 'ALL' },
        { label: 'Active', value: 'true' },
        { label: 'Inactive', value: 'false' },
      ],
    },
    {
      key: 'tourGroup',
      label: 'Tour Group',
      type: 'select',
      placeholder: 'Select group',
      value: tourGroupFilter,
      onChange: (value) => {
        setTourGroupFilter(value as string);
        setCurrentPage(1);
      },
      options: [
        { label: 'All Groups', value: 'ALL' },
        ...availableGroups.map((group) => ({
          label: group,
          value: group,
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
    onPageSizeChange: (newSize) => {
      setPageSize(newSize);
      setCurrentPage(1);
    },
    pageSizeOptions: PAGE_SIZE_OPTIONS,
    sortBy,
    sortOrder,
    onSortChange: (field, order) => {
      setSortBy(field || 'priority');
      setSortOrder(order || 'desc');
      setCurrentPage(1);
    },
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Tour definitions refreshed');
  };

  return (
    <>
      <SaasDataTable<ITourDefinitionExtended>
        columns={columns}
        data={tourDefinitions}
        actions={actions}
        isLoading={isLoading}
        searchable={true}
        searchValue={searchTerm}
        searchPlaceholder="Search by name, tour key, or description..."
        onSearchChange={setSearchTerm}
        filters={filters}
        pagination={pagination}
        onRefresh={handleRefresh}
        emptyState={{
          title: 'No tour definitions found',
          description:
            'Try adjusting your search criteria or create a new tour definition',
        }}
        getRowKey={(tour) => tour.id}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tour Definition</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{tourToDelete?.name}&quot;?
              This action cannot be undone and will remove the tour definition
              permanently.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

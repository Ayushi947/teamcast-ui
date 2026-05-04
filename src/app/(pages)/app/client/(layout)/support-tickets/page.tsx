'use client';

import React, { useState, useEffect } from 'react';
import { Search, User, Calendar } from 'lucide-react';
import { supportTicketService } from '@/lib/services/services';
import { useQuery } from '@tanstack/react-query';
import {
  SupportTicketStatusEnum,
  ISupportTicketListItemResponse,
  SupportClientTicketCategoryEnum,
} from '@/lib/shared';
import { useApp } from '@/lib/context/app-context';
import { Button } from '@/components/ui/button';
import { formatEnumValue } from '@/lib/utils';
import SaasDataTable, {
  SaasTableColumn,
  SaasTableFilter,
  SaasPaginationInfo,
} from '@/components/app/common/tables/saas-data-table';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import SupportTicketStatusBadge from '@/components/app/support-tickets/support-ticket-status-badge';

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

const SupportTicketsPage = () => {
  const { user } = useApp();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    (SupportTicketStatusEnum | 'ALL')[]
  >(['ALL']);
  const [categoryFilter, setCategoryFilter] = useState<
    (SupportClientTicketCategoryEnum | 'ALL')[]
  >(['ALL']);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Debounce search term to prevent API calls on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      // Reset to first page when search changes
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
    const filters: any = {};

    if (debouncedSearchTerm.trim()) {
      filters.search = debouncedSearchTerm.trim();
    }

    // Add status filter
    if (statusFilter.length > 0 && !statusFilter.includes('ALL')) {
      filters.status = statusFilter;
    }

    // Add category filter
    if (categoryFilter.length > 0 && !categoryFilter.includes('ALL')) {
      filters.category = categoryFilter;
    }

    return {
      filters,
      sort: { field: sortBy as any, direction: sortOrder as any },
      pagination: { page: currentPage, limit: pageSize } as any,
    };
  };

  // Fetch support tickets
  const {
    data: supportTicketsResponse,
    isLoading: isLoadingSupportTickets,
    refetch,
  } = useQuery({
    queryKey: [
      'support-tickets',
      currentPage,
      pageSize,
      statusFilter.join(','),
      categoryFilter.join(','),
      sortBy,
      sortOrder,
      debouncedSearchTerm,
    ],
    queryFn: async () => {
      const params = buildQueryParams();
      return await supportTicketService.getTicketsByUserId(
        user?.id as string,
        {
          ...params.filters,
          page: currentPage,
          limit: pageSize,
        },
        params.sort
      );
    },
    enabled: !!user?.id,
    retry: 2,
    retryDelay: 1000,
  });

  // Extract data from response
  const supportTickets = supportTicketsResponse?.items || [];
  const totalPages = supportTicketsResponse?.pagination?.totalPages || 1;
  const totalItems = supportTicketsResponse?.pagination?.total || 0;

  const handleViewTicket = (ticket: ISupportTicketListItemResponse) => {
    router.push(`/app/client/support-tickets/${ticket.id}`);
  };

  const formatDate = (dateString: string | Date) => {
    return format(new Date(dateString), 'MMM d, yyyy HH:mm');
  };

  // Table configuration
  const columns: SaasTableColumn<ISupportTicketListItemResponse>[] = [
    {
      key: 'ticketNumber',
      label: 'Ticket ID',
      sortable: true,
      render: (ticket: ISupportTicketListItemResponse) => (
        <span className="font-mono text-sm font-medium text-gray-600 dark:text-gray-300">
          #{ticket.sequenceNumber || 'N/A'}
        </span>
      ),
    },
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      render: (ticket: ISupportTicketListItemResponse) => (
        <div className="max-w-xs">
          <h3 className="line-clamp-2 font-medium whitespace-pre-wrap text-gray-900 dark:text-gray-100">
            {ticket.title || 'Untitled Ticket'}
          </h3>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (ticket: ISupportTicketListItemResponse) => (
        <div className="flex items-center gap-2">
          <SupportTicketStatusBadge status={ticket.status} />
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      render: (ticket: ISupportTicketListItemResponse) => (
        <div className="space-y-1">{formatEnumValue(ticket.category)}</div>
      ),
    },

    {
      key: 'entityType',
      label: 'Entity Type',
      sortable: true,
      render: (ticket: ISupportTicketListItemResponse) => (
        <div className="flex items-center gap-1">
          <User className="h-3 w-3 text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {formatEnumValue(ticket.entityType)}
          </span>
        </div>
      ),
    },
    {
      key: 'updatedAt',
      label: 'Last Updated',
      sortable: true,
      render: (ticket: ISupportTicketListItemResponse) => (
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3 text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {ticket.updatedAt ? formatDate(ticket.updatedAt) : 'Unknown'}
          </span>
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (ticket: ISupportTicketListItemResponse) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleViewTicket(ticket)}
          className="cursor-pointer"
        >
          View Details
        </Button>
      ),
    },
  ];

  // Table filters
  const filters: SaasTableFilter[] = [
    {
      key: 'status',
      label: 'Status',
      type: 'multiselect',
      placeholder: 'Select status',
      value: statusFilter,
      onChange: (value) => {
        if (Array.isArray(value)) {
          setStatusFilter(value as (SupportTicketStatusEnum | 'ALL')[]);
        } else {
          setStatusFilter([value as SupportTicketStatusEnum | 'ALL']);
        }
        setCurrentPage(1);
      },
      options: [
        { label: 'All Status', value: 'ALL' },
        ...Object.values(SupportTicketStatusEnum).map((status) => ({
          label: formatEnumValue(status),
          value: status,
        })),
      ],
    },
    {
      key: 'category',
      label: 'Category',
      type: 'multiselect',
      placeholder: 'Select category',
      value: categoryFilter,
      onChange: (value) => {
        if (Array.isArray(value)) {
          setCategoryFilter(
            value as (SupportClientTicketCategoryEnum | 'ALL')[]
          );
        } else {
          setCategoryFilter([value as SupportClientTicketCategoryEnum | 'ALL']);
        }
        setCurrentPage(1);
      },
      options: [
        { label: 'All Categories', value: 'ALL' },
        ...Object.values(SupportClientTicketCategoryEnum).map((category) => ({
          label: formatEnumValue(category as SupportClientTicketCategoryEnum),
          value: category,
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

  return (
    <>
      <div className="min-h-screen p-6">
        <div className="mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-primary dark:text-primary text-2xl font-bold tracking-tight">
                Support Tickets
              </h1>
              <p className="text-muted-foreground dark:text-muted-foreground">
                Manage and track support requests
              </p>
            </div>
          </div>

          {/* Data Table */}
          <SaasDataTable<ISupportTicketListItemResponse>
            columns={columns}
            data={supportTickets}
            isLoading={isLoadingSupportTickets}
            searchable={true}
            searchValue={searchTerm}
            searchPlaceholder="Search tickets by ID, title, or description..."
            onSearchChange={setSearchTerm}
            filters={filters}
            pagination={pagination}
            onRefresh={refetch}
            emptyState={{
              icon: <Search className="h-12 w-12 text-gray-400" />,
              title: 'No tickets found',
              description: searchTerm
                ? `No tickets match your search for "${searchTerm}"`
                : 'There are no support tickets to display at the moment.',
              action: searchTerm
                ? {
                    label: 'Clear Search',
                    onClick: () => setSearchTerm(''),
                  }
                : undefined,
            }}
            getRowKey={(ticket) => ticket.id}
            variant="default"
            showToolbar={true}
          />
        </div>
      </div>
    </>
  );
};

export default SupportTicketsPage;

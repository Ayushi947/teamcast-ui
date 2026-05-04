'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  PencilIcon,
  TrashIcon,
  KeyIcon,
  WebhookIcon,
  ActivityIcon,
} from 'lucide-react';
import { mcpClientService } from '@/lib/services/services';
import { EditMcpClientDialog } from './edit-mcp-client-dialog';
import { ViewApiKeyDialog } from './view-api-key-dialog';
import { ConfigureWebhookDialog } from './configure-webhook-dialog';
import { ActivityLogsDialog } from './activity-logs-dialog';
import { DeleteMcpClientDialog } from './delete-mcp-client-dialog';
import type { IMcpClient } from '@/lib/shared';
import SaasDataTable, {
  SaasTableColumn,
  SaasTableFilter,
  SaasPaginationInfo,
} from '@/components/app/common/tables/saas-data-table';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface McpClientsListProps {
  refreshTrigger?: number;
}

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export function McpClientsList({ refreshTrigger = 0 }: McpClientsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    ('active' | 'inactive' | 'ALL')[]
  >(['ALL']);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Dialog states
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);
  const [isWebhookDialogOpen, setIsWebhookDialogOpen] = useState(false);
  const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<IMcpClient | null>(null);

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

  const handleSortChange = (
    field: string | null,
    order: 'asc' | 'desc' | null
  ) => {
    setSortBy(field || '');
    setSortOrder(order || 'desc');
    setCurrentPage(1);
  };

  const buildQueryParams = () => {
    const params: Record<string, string | number | boolean> = {
      page: currentPage,
      per_page: pageSize,
    };

    if (debouncedSearchTerm) {
      params.search = debouncedSearchTerm;
    }

    if (statusFilter && statusFilter.length > 0) {
      const validStatuses = statusFilter.filter((status) => status !== 'ALL');
      if (validStatuses.length > 0) {
        params.isActive = validStatuses.includes('active');
      }
    }

    if (sortBy) {
      params.sort_by = sortBy;
      params.sort_order = sortOrder;
    }

    return params;
  };

  const {
    data: mcpClients,
    isLoading,
    refetch,
  } = useQuery<IMcpClient[]>({
    queryKey: [
      'mcpClients',
      currentPage,
      debouncedSearchTerm,
      statusFilter,
      pageSize,
      sortBy,
      sortOrder,
      refreshTrigger,
    ],
    queryFn: () => mcpClientService.getMcpClients(buildQueryParams()),
  });

  const clients = mcpClients || [];
  const totalItems = clients.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  const handleEditClient = (client: IMcpClient) => {
    setSelectedClient(client);
    setTimeout(() => setIsEditDialogOpen(true), 10);
  };

  const handleViewApiKey = (client: IMcpClient) => {
    setSelectedClient(client);
    setTimeout(() => setIsApiKeyDialogOpen(true), 10);
  };

  const handleConfigureWebhook = (client: IMcpClient) => {
    setSelectedClient(client);
    setTimeout(() => setIsWebhookDialogOpen(true), 10);
  };

  const handleViewActivity = (client: IMcpClient) => {
    setSelectedClient(client);
    setTimeout(() => setIsActivityDialogOpen(true), 10);
  };

  const handleDeleteClient = (client: IMcpClient) => {
    setSelectedClient(client);
    setTimeout(() => setIsDeleteDialogOpen(true), 10);
  };

  const handleDialogClose = (
    setter: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    return (open: boolean) => {
      if (!open) {
        setter(false);
        setTimeout(() => setSelectedClient(null), 300);
      } else {
        setter(open);
      }
    };
  };

  const handleRefresh = () => {
    refetch();
    toast.success('MCP clients refreshed');
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? 'default' : 'secondary';
  };

  const columns: SaasTableColumn<IMcpClient>[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (client: IMcpClient) => (
        <div>
          <div className="font-medium">{client.name}</div>
          {client.description && (
            <div className="text-muted-foreground max-w-xs truncate text-sm">
              {client.description}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'scopes',
      label: 'Scopes',
      render: (client: IMcpClient) => (
        <div className="flex flex-wrap gap-1">
          {client.scopes.slice(0, 3).map((scope) => (
            <Badge key={scope} variant="outline" className="text-xs">
              {scope}
            </Badge>
          ))}
          {client.scopes.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{client.scopes.length - 3}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (client: IMcpClient) => (
        <Badge
          variant={getStatusBadge(client.isActive) as 'default' | 'secondary'}
        >
          {client.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'webhookEnabled',
      label: 'Webhook',
      render: (client: IMcpClient) => (
        <Badge
          variant={client.webhookEnabled ? 'default' : 'secondary'}
          className="text-xs"
        >
          {client.webhookEnabled ? 'Enabled' : 'Disabled'}
        </Badge>
      ),
    },
    {
      key: 'requestCount',
      label: 'Requests',
      render: (client: IMcpClient) => (
        <div className="text-sm">
          <div>{client.requestCount.toLocaleString()} total</div>
          {client.errorCount > 0 && (
            <div className="text-destructive text-xs">
              {client.errorCount} errors
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'lastUsedAt',
      label: 'Last Used',
      render: (client: IMcpClient) => (
        <div className="text-muted-foreground text-sm">
          {client.lastUsedAt
            ? formatDistanceToNow(new Date(client.lastUsedAt), {
                addSuffix: true,
              })
            : 'Never'}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (client: IMcpClient) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEditClient(client)}
            title="Edit"
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleViewApiKey(client)}
            title="Regenerate API Key"
          >
            <KeyIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleConfigureWebhook(client)}
            title="Configure Webhook"
          >
            <WebhookIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleViewActivity(client)}
            title="View Activity"
          >
            <ActivityIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDeleteClient(client)}
            title="Delete"
            className="text-destructive hover:text-destructive"
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const filters: SaasTableFilter[] = [
    {
      key: 'status',
      label: 'Status',
      type: 'multiselect',
      placeholder: 'Select status',
      value: statusFilter,
      onChange: (value) => {
        if (Array.isArray(value)) {
          setStatusFilter(value as ('active' | 'inactive' | 'ALL')[]);
        } else {
          setStatusFilter([value as 'active' | 'inactive' | 'ALL']);
        }
        setCurrentPage(1);
      },
      options: [
        { label: 'All Status', value: 'ALL' },
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
      ],
    },
  ];

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
      <SaasDataTable<IMcpClient>
        columns={columns}
        data={clients}
        isLoading={isLoading}
        searchable={true}
        searchValue={searchTerm}
        searchPlaceholder="Search MCP clients by name..."
        onSearchChange={setSearchTerm}
        filters={filters}
        pagination={pagination}
        onRefresh={handleRefresh}
        emptyState={{
          title: 'No MCP clients found',
          description:
            'Create your first MCP client to enable AI agent integrations',
        }}
        getRowKey={(client) => client.id}
      />

      {selectedClient && (
        <>
          <EditMcpClientDialog
            open={isEditDialogOpen}
            onOpenChange={handleDialogClose(setIsEditDialogOpen)}
            client={selectedClient}
            onEditSuccess={() => refetch()}
          />
          <ViewApiKeyDialog
            open={isApiKeyDialogOpen}
            onOpenChange={handleDialogClose(setIsApiKeyDialogOpen)}
            client={selectedClient}
          />
          <ConfigureWebhookDialog
            open={isWebhookDialogOpen}
            onOpenChange={handleDialogClose(setIsWebhookDialogOpen)}
            client={selectedClient}
            onConfigureSuccess={() => refetch()}
          />
          <ActivityLogsDialog
            open={isActivityDialogOpen}
            onOpenChange={handleDialogClose(setIsActivityDialogOpen)}
            client={selectedClient}
          />
          <DeleteMcpClientDialog
            open={isDeleteDialogOpen}
            onOpenChange={handleDialogClose(setIsDeleteDialogOpen)}
            client={selectedClient}
            onDeleteSuccess={() => refetch()}
          />
        </>
      )}
    </>
  );
}

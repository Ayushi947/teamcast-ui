'use client';

import { activityLogService } from '@/lib/services/services';
import { useQuery } from '@tanstack/react-query';
import { logger, IActivityLogFilters, IPaginationRequest } from '@/lib/shared';
import React, { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Timeline } from '@/components/activity/timeline';
import { ActivityFilters } from '@/components/activity/activity-filters';
import { ActivityPagination } from '@/components/activity/activity-pagination';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ActivityLogResponse } from '@/lib/models/activity-response';
import { useApp } from '@/lib/context/app-context';

// Local interfaces for UI components
interface IActivityLogFilter {
  userId?: string;
  module?: string;
  action?: string;
  entityId?: string;
  entityType?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

interface IPaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export default function ActivityPage() {
  const { user } = useApp();
  const userId = user?.id;
  const clientId = user?.clientId;

  const [filters, setFilters] = useState<IActivityLogFilter>({
    module: 'all',
    action: 'all',
  });

  const [pagination, setPagination] = useState<IPaginationOptions>({
    page: 1,
    limit: 20,
    sortBy: 'timestamp',
    sortOrder: 'desc',
  });

  const {
    data: activityLogs,
    isLoading: isActivityLogsLoading,
    error: activityLogsError,
    refetch,
    isRefetching,
  } = useQuery<ActivityLogResponse>({
    queryKey: ['activity-logs', filters, pagination, userId, clientId],
    queryFn: async () => {
      // Convert UI filter to API filter
      const apiFilters: IActivityLogFilters & IPaginationRequest = {
        ...pagination,
        userId: userId || undefined,
        clientId: clientId || undefined,
        module: filters.module as any, // Convert string to enum
        fromDate: filters.startDate,
        toDate: filters.endDate,
      };

      // Only include module when a specific module is selected (backend does not accept 'all')
      if (filters.module && filters.module !== 'all') {
        apiFilters.module = filters.module as any;
      }

      // Only include action if it's not 'all'
      if (filters.action && filters.action !== 'all') {
        apiFilters.action = filters.action;
      }

      // Add entity filters if provided
      if (filters.entityId) {
        apiFilters.entityId = filters.entityId;
      }

      if (filters.entityType) {
        apiFilters.entityType = filters.entityType as any;
      }

      // Get the response from the service
      const response = await activityLogService.getActivityLogs(apiFilters);

      // Convert the response to the expected format
      return {
        success: response.success,
        message: response.message,
        data: {
          data: response.data,
          meta: response.meta,
        },
      } as ActivityLogResponse;
    },
    retry: 1,
    enabled: !!userId,
  });

  React.useEffect(() => {
    if (activityLogsError) {
      toast.error('Failed to load activity logs. Please try again later.');
      logger.error('Activity logs loading error:', activityLogsError);
    }
  }, [activityLogsError]);

  const handleFilterChange = (newFilters: IActivityLogFilter) => {
    // Reset to page 1 when filters change
    setPagination((prev: IPaginationOptions) => ({ ...prev, page: 1 }));
    setFilters(newFilters);
  };

  const handlePageChange = (page: number) => {
    setPagination((prev: IPaginationOptions) => ({ ...prev, page }));
  };

  const handlePageSizeChange = (limit: number) => {
    setPagination((prev: IPaginationOptions) => ({ ...prev, limit, page: 1 }));
  };

  return (
    <div className="space-y-6 px-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Recent Activity</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              refetch().then(() => toast.success('Activity logs refreshed'))
            }
            disabled={isRefetching}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6">
            <ActivityFilters
              onChange={handleFilterChange}
              defaultFilters={{ module: 'all' }}
              showModuleFilter={false}
            />
          </div>

          {/* Activity Timeline */}
          <div className="space-y-4">
            {isActivityLogsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : (
              <Timeline
                logs={activityLogs?.data?.data || []}
                showUserInfo={true}
              />
            )}
          </div>

          {/* Pagination */}
          {activityLogs && activityLogs.data && activityLogs.data.meta && (
            <ActivityPagination
              currentPage={pagination.page || 1}
              totalPages={activityLogs.data.meta.totalPages}
              totalItems={activityLogs.data.meta.total}
              pageSize={pagination.limit || 20}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

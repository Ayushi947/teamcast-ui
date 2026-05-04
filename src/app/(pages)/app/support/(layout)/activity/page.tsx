'use client';

import { activityLogService } from '@/lib/services/services';
import { useQuery } from '@tanstack/react-query';
import { logger, IActivityLogFilters, IPaginationRequest } from '@/lib/shared';
import React, { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Timeline, type TimelineGroupBy } from '@/components/activity/timeline';
import { ActivityFilters } from '@/components/activity/activity-filters';
import { ActivityPagination } from '@/components/activity/activity-pagination';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

  const [groupBy, setGroupBy] = useState<TimelineGroupBy>('date');

  const {
    data: activityLogs,
    isLoading: isActivityLogsLoading,
    error: activityLogsError,
    refetch,
    isRefetching,
  } = useQuery<ActivityLogResponse>({
    queryKey: ['activity-logs', filters, pagination, userId],
    queryFn: async () => {
      // Convert UI filter to API filter
      const apiFilters: IActivityLogFilters & IPaginationRequest = {
        ...pagination,
        // For support, we may want to see all logs, not just user's logs
        // So only add userId if specifically filtered
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

      // Add userId if specified in filters
      if (filters.userId) {
        apiFilters.userId = filters.userId;
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

  const meta = activityLogs?.data?.meta;
  const totalItems = meta?.total ?? 0;
  const currentPage = pagination.page ?? 1;
  const pageSize = pagination.limit ?? 20;
  const from = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="space-y-6 px-4 py-2">
      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/30 border-b pb-4">
          <div className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="text-xl">System Activity</CardTitle>
              <CardDescription className="mt-1">
                View and filter activity logs across all modules and users
              </CardDescription>
            </div>
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
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Filters */}
          <div className="mb-6">
            <ActivityFilters
              onChange={handleFilterChange}
              defaultFilters={{ module: 'all' }}
              showModuleFilter={true}
            />
          </div>

          {/* Summary + Group by */}
          {!isActivityLogsLoading && totalItems > 0 && (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-muted-foreground text-sm">
                Showing {from}–{to} of {totalItems} activity
                {totalItems === 1 ? ' log' : ' logs'}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-xs">Group by:</span>
                <Select
                  value={groupBy}
                  onValueChange={(v) => setGroupBy(v as TimelineGroupBy)}
                >
                  <SelectTrigger className="h-8 w-[130px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Activity Timeline */}
          <div className="space-y-4">
            {isActivityLogsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex gap-4 pl-12">
                    <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <div className="flex gap-2">
                        <Skeleton className="h-5 w-20 rounded-full" />
                        <Skeleton className="h-5 w-24 rounded-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Timeline
                logs={activityLogs?.data?.data || []}
                showUserInfo={true}
                groupBy={groupBy}
                basePathForEntityLinks="/app/support"
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

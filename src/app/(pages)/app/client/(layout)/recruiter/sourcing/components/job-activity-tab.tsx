'use client';

import { useQuery } from '@tanstack/react-query';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, AlertCircle, RefreshCw, ArrowRight } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { useMemo, useState } from 'react';
import { useApp } from '@/lib/context/app-context';
import { cn } from '@/lib/utils';
import { ActivityModuleEnum, IClientJobPosting } from '@/lib/shared';
import { activityLogService } from '@/lib/services/services';
import {
  getActivityColor,
  getActivityIcon,
  ActivityActionLabels,
  ActivityModuleLabels,
} from '@/lib/models/activity';

interface JobActivityTabProps {
  jobId: string;
  job?: IClientJobPosting;
}

export function JobActivityTab({ job }: JobActivityTabProps) {
  const [filterModule] = useState<string>('all');
  const [timeFilter] = useState<string>('all');
  const { user } = useApp();

  const {
    data: activitiesLog,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['activitiesLog', user?.clientId, filterModule, timeFilter],
    queryFn: () =>
      activityLogService.getActivityLogs({
        entityId: user?.clientId,
        module: ActivityModuleEnum.JOB,
        page: 1,
        limit: 10,
      }),
  });

  const stats = useMemo(() => {
    if (!activitiesLog?.data) return { total: 0, today: 0, applications: 0 };

    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    return {
      total: activitiesLog.data.length,
      today: activitiesLog.data.filter(
        (a) => new Date(a.timestamp) >= startOfToday
      ).length,
      applications: activitiesLog.data.filter(
        (a) => a.module === ActivityModuleEnum.APPLICATION
      ).length,
    };
  }, [activitiesLog?.data]);

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700"
            >
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-6 py-12">
        <div className="space-y-4 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-red-500" />
          <p className="text-base font-medium text-gray-900 dark:text-white">
            Failed to load activities
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            There was an error retrieving the activity log
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => refetch()}
            className="mt-2"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Activity Timeline
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Track all interactions and updates for {job?.title || 'this job'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => refetch()}
            className="h-9 border-gray-200 dark:border-gray-700"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg bg-gray-50/80 p-3 text-center shadow-sm dark:bg-gray-800/80">
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {stats.total || 0}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Total Activities
          </div>
        </div>
        <div className="rounded-lg bg-blue-50/80 p-3 text-center shadow-sm dark:bg-blue-900/20">
          <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
            {stats.today || 0}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Today&apos;s Activities
          </div>
        </div>
        <div className="rounded-lg bg-purple-50/80 p-3 text-center shadow-sm dark:bg-purple-900/20">
          <div className="text-lg font-semibold text-purple-600 dark:text-purple-400">
            {stats.applications || 0}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Application Activities
          </div>
        </div>
      </div>

      {/* Activity List */}
      <Card className="border border-gray-200 shadow-sm dark:border-gray-700">
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            {!activitiesLog?.data?.length ? (
              <div className="flex items-center justify-center py-12">
                <div className="space-y-2 text-center">
                  <Activity className="mx-auto h-10 w-10 text-gray-400" />
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    No activities found
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {filterModule !== 'all' || timeFilter !== 'all'
                      ? 'Try adjusting your filters to see more activities'
                      : 'Activities will appear here as they happen'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {activitiesLog?.data?.map((activity) => {
                  const Icon = getActivityIcon(
                    activity.module,
                    activity.action
                  );
                  const colorClass = getActivityColor(activity.module);
                  const actionLabel =
                    activity.action &&
                    typeof activity.action === 'string' &&
                    activity.action in ActivityActionLabels
                      ? ActivityActionLabels[
                          activity.action as keyof typeof ActivityActionLabels
                        ]
                      : activity.action;

                  return (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-4 transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
                    >
                      {/* Icon */}
                      <div
                        className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-full border',
                          colorClass
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {activity.metadata?.title}
                          </p>

                          <div className="flex flex-col items-end">
                            <time className="text-xs whitespace-nowrap text-gray-500 dark:text-gray-400">
                              {formatDistanceToNow(
                                new Date(activity.timestamp),
                                {
                                  addSuffix: true,
                                }
                              )}
                            </time>
                            <time className="text-xs whitespace-nowrap text-gray-400 dark:text-gray-500">
                              {format(
                                new Date(activity.timestamp),
                                'MMM dd, yyyy HH:mm'
                              )}
                            </time>
                          </div>
                        </div>

                        {/* Metadata */}
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            variant="secondary"
                            className="border-gray-200 px-2 py-0.5 text-xs dark:border-gray-700"
                          >
                            {ActivityModuleLabels[activity.module] ||
                              activity.module}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="border-gray-200 px-2 py-0.5 text-xs dark:border-gray-700"
                          >
                            {actionLabel}
                          </Badge>

                          {activity.metadata?.userName && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              by {activity.metadata.userName}
                            </span>
                          )}

                          {activity.metadata?.candidateName && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              • {activity.metadata.candidateName}
                            </span>
                          )}

                          {activity.metadata?.oldValue &&
                            activity.metadata?.newValue && (
                              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                <span className="rounded bg-red-100 px-1.5 py-0.5 dark:bg-red-900/30">
                                  {activity.metadata.oldValue}
                                </span>
                                <ArrowRight className="h-3 w-3" />
                                <span className="rounded bg-green-100 px-1.5 py-0.5 dark:bg-green-900/30">
                                  {activity.metadata.newValue}
                                </span>
                              </div>
                            )}

                          {activity.metadata?.newValue && (
                            <Badge
                              variant={'info'}
                              className="text-xs text-gray-500 dark:text-gray-400"
                            >
                              • {activity.metadata.newValue}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

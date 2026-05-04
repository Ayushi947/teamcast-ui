'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity } from 'lucide-react';
import { ISupportCandidate } from '@/lib/shared';
import { IActivityLog } from '@/lib/shared/models/domain/activity/activity.log.domain';
import { getRelativeTime } from '@/lib/models/activity';
import { formatEnumValue } from '@/lib/utils';

interface ActivityTabProps {
  candidate: ISupportCandidate;
  activityLogs: IActivityLog[];
  activityLoading: boolean;
}

export function ActivityTab({
  activityLogs,
  activityLoading,
}: ActivityTabProps) {
  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <Activity className="h-5 w-5 text-[#6e55cf] dark:text-purple-400" />
            Activity Timeline
          </CardTitle>
          <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
            Chronological timeline of candidate activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activityLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-start gap-4 rounded-lg p-4">
                  <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                  </div>
                </div>
              ))}
            </div>
          ) : activityLogs.length > 0 ? (
            <div className="space-y-4">
              {activityLogs.map((activity) => {
                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 rounded-lg border border-gray-100 p-4 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50"
                  >
                    <div className="rounded-full border border-[#6e55cf]/20 bg-[#6e55cf]/10 p-2">
                      <Activity className="h-5 w-5 text-[#6e55cf]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                          {activity.metadata?.title || activity.description}
                        </h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {getRelativeTime(new Date(activity.timestamp))}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <p className="text-sm">Action:</p>
                        <Badge
                          variant="outline"
                          className="bg-accent rounded-lg text-xs"
                        >
                          {activity.action
                            ? formatEnumValue(activity.action)
                            : 'No Module Found'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Activity className="mx-auto mb-4 h-16 w-16 text-gray-300 dark:text-gray-600" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                No Activities Found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                No activity logs found for this candidate.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { Users, Eye, Clock, Target } from 'lucide-react';
import { format } from 'date-fns';
import { IClientJobPosting } from '@/lib/shared';
import { useQuery } from '@tanstack/react-query';
import { clientJobPostingService } from '@/lib/services/services';
import { getDateDifferenceInDays } from '@/lib/utils/data-masking';

interface JobAnalyticsTabProps {
  job: IClientJobPosting;
}

export function JobAnalyticsTab({ job }: JobAnalyticsTabProps) {
  // Mock analytics data - in real implementation, this would come from API
  const _analytics = {
    views: job.numberOfViews || 247,
    applications: job.numberOfApplications || 0,
    conversionRate:
      job.numberOfApplications && job.numberOfViews
        ? ((job.numberOfApplications / job.numberOfViews) * 100).toFixed(1)
        : '0.0',
    timeToFill: 0, // Days since creation
    applicantQuality: 85, // Mock quality score
    sourceBreakdown: [
      { source: 'Job Board', count: 45, percentage: 60 },
      { source: 'Company Website', count: 20, percentage: 27 },
      { source: 'Social Media', count: 8, percentage: 11 },
      { source: 'Referrals', count: 2, percentage: 2 },
    ],
    weeklyViews: [32, 45, 38, 52, 41, 35, 44], // Last 7 days
    applicationTrend: [2, 5, 3, 8, 4, 6, 1], // Last 7 days
  };

  const { data: jobDetails } = useQuery({
    queryKey: ['job-details', job.id],
    queryFn: () => clientJobPostingService.getJobPosting(job.id),
  });

  return (
    <div className="space-y-6">
      {/* Performance Overview Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-card rounded-lg p-4">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="text-base font-medium text-gray-600 dark:text-gray-400">
              Total Views
            </div>
            <div className="bg-primary/20 dark:bg-primary/30 rounded-full p-2">
              <Eye className="text-primary dark:text-primary h-4 w-4" />
            </div>
          </div>
          <div className="flex h-[68px] flex-col justify-between">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {jobDetails?.numberOfViews?.toLocaleString()}
            </div>
            <span className="text-primary dark:text-primary text-sm font-medium">
              Total profile views
            </span>
          </div>
        </div>

        <div className="bg-card rounded-lg p-4">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="text-base font-medium text-gray-600 dark:text-gray-400">
              Applications
            </div>
            <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/30">
              <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="flex h-[68px] flex-col justify-between">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {jobDetails?.applications?.length || 0}
            </div>
            <span className="text-primary dark:text-primary text-sm font-medium">
              Total applications
            </span>
          </div>
        </div>

        <div className="bg-card rounded-lg p-4">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="text-base font-medium text-gray-600 dark:text-gray-400">
              Conversion Rate
            </div>
            <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-900/30">
              <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="flex h-[68px] flex-col justify-between">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {jobDetails?.numberOfViews && jobDetails?.numberOfViews !== 0
                ? `${(
                    ((jobDetails?.applications?.length ?? 0) /
                      jobDetails?.numberOfViews) *
                    100
                  ).toFixed(1)}%`
                : '0%'}
            </div>
            <span className="text-primary dark:text-primary text-sm font-medium">
              Views to applications
            </span>
          </div>
        </div>

        <div className="bg-card rounded-lg p-4">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="text-base font-medium text-gray-600 dark:text-gray-400">
              Days Active
            </div>
            <div className="rounded-full bg-orange-100 p-2 dark:bg-orange-900/30">
              <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <div className="flex h-[68px] flex-col justify-between">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {getDateDifferenceInDays(job?.createdAt || new Date())}
            </div>
            <span className="text-primary dark:text-primary text-sm font-medium">
              Since {format(new Date(job.createdAt), 'MMM d')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

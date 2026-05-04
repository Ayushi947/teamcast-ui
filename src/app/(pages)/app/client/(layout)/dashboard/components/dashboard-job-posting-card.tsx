'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { JobPostingStatusEnum } from '@/lib/shared';
import { formatEnumValue } from '@/lib/utils';
import { getDateDifferenceInDays } from '@/lib/utils/data-masking';
import { Target, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

const DashboardJobPostingCard = ({ jd }: { jd: any }) => {
  const router = useRouter();
  const getStatusBadge = (status: JobPostingStatusEnum) => {
    switch (status) {
      case JobPostingStatusEnum.PUBLISHED:
        return (
          <div className="flex items-center rounded-full bg-green-100 px-3 py-1 text-xs text-green-800">
            <div className="mr-2 h-2 w-2 animate-pulse rounded-full bg-green-600"></div>
            Actively Sourcing
          </div>
        );
      case JobPostingStatusEnum.DRAFT:
        return (
          <Badge className="hover:none inline-flex items-center gap-1.5 border-0 bg-orange-100 px-2.5 py-1 text-xs font-medium text-orange-800 hover:bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400">
            <div className="h-2 w-2 rounded-full bg-orange-600 dark:bg-orange-400"></div>
            Draft
          </Badge>
        );
      case JobPostingStatusEnum.CLOSED:
        return (
          <Badge className="hover:none inline-flex items-center gap-1.5 border-0 bg-red-100 px-2.5 py-1 text-xs font-medium text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400">
            <div className="h-2 w-2 rounded-full bg-red-600 dark:bg-red-400"></div>
            Closed
          </Badge>
        );
      case JobPostingStatusEnum.ARCHIVED:
        return (
          <Badge className="hover:none inline-flex items-center gap-1.5 border-0 bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-800 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300">
            <div className="h-2 w-2 rounded-full bg-gray-600 dark:bg-gray-400"></div>
            Archived
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="hover:none text-xs">
            {status}
          </Badge>
        );
    }
  };

  const handleRouting = (
    id: string,
    isRecommendations: boolean,
    isApplications: boolean
  ) => {
    if (isRecommendations) {
      router.push(
        `/app/client/recruiter/sourcing?jobId=${id}&isRecommendations=${isRecommendations}`
      );
    } else if (isApplications) {
      router.push(
        `/app/client/recruiter/sourcing?jobId=${id}&isApplications=${isApplications}`
      );
    } else {
      router.push(`/app/client/recruiter/sourcing?jobId=${id}`);
    }
  };

  return (
    <div
      onClick={() => {
        handleRouting(jd.id, false, false);
      }}
      key={jd.id}
      className="border-primary/35 hover:border-primary/50 hover:bg-primary/5 cursor-pointer rounded-xl border bg-transparent p-5 sm:p-6 dark:bg-gray-900"
    >
      <div className="mb-4 flex items-start justify-between gap-3 md:items-center">
        <div className="w-full">
          <div className="flex w-full items-start justify-between gap-3">
            <h4 className="text-foreground truncate text-base font-semibold md:text-lg">
              {jd.title}
            </h4>
            <div>{getStatusBadge(jd.status)}</div>
          </div>

          <div className="grid w-full gap-3">
            <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-gray-600 dark:text-gray-300">
                  {jd.jobType ? formatEnumValue(jd.jobType) : 'Full-time'}{' '}
                  {`(${jd.jobCommitment && formatEnumValue(jd.jobCommitment)})`}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-1 w-1 rounded-full bg-gray-600 dark:bg-gray-400"></div>

                <span className="font-medium text-gray-600 dark:text-gray-300">
                  {jd.totalExperience || 0} years experience
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Applications Pipeline */}
      <div className="mt-6 mb-4 grid grid-cols-2 gap-4 md:grid-cols-3">
        <div className="text-center">
          <p className="text-primary text-3xl font-bold">
            {jd.applications.length}
          </p>
          <p className="text-muted-foreground text-xs">Applications</p>
        </div>
        <div className="text-center md:pl-4">
          <p className="text-warning text-3xl font-bold">
            {jd.recommendations.length}
          </p>
          <p className="text-muted-foreground text-xs">Recommendations</p>
        </div>
        <div className="text-center md:pl-4">
          <p className="text-primary text-3xl font-bold">
            {getDateDifferenceInDays(jd.createdAt)}
          </p>
          <p className="text-muted-foreground text-xs">Active Since</p>
        </div>
      </div>

      <div className="flex w-full justify-end pt-4">
        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleRouting(jd.id, true, false);
            }}
            variant="default"
            size="sm"
          >
            <Target className="mr-1 h-3 w-3" />
            View Recommendations
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleRouting(jd.id, false, true);
            }}
            variant="outline"
            size="sm"
          >
            <Users className="mr-1 h-3 w-3" />
            View Applications
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardJobPostingCard;

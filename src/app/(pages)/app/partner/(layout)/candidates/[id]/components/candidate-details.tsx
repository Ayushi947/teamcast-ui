'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { CustomTabs } from '@/components/ui/custom-tabs';
import { AlertTriangle, ArrowLeft, Edit } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { partnerCandidateService } from '@/lib/services/services';
import { IActivityLog } from '@/lib/shared/models/domain/activity/activity.log.domain';
import { IPartnerCandidateDetailed } from '@/lib/shared';
import { activityLogService } from '@/lib/services/services';
import { UpdateCandidateDialog } from './update-candidate-dialog';
import {
  OverviewTab,
  AssessmentsTab,
  ActivityTab,
  SettingsTab,
  ResumeTab,
} from './details-tabs';
import { logger } from '@/lib/logger';

interface CandidateDetailsProps {
  candidateId: string;
}

const formatDate = (date: string | Date): string => {
  if (!date) return 'N/A';
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Invalid Date';
  }
};

export function CandidateDetails({ candidateId }: CandidateDetailsProps) {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState('overview');
  const [activityLogs, setActivityLogs] = useState<IActivityLog[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);

  // Fetch candidate data
  const {
    data: candidate,
    isLoading: loading,
    error,
    refetch,
  } = useQuery<IPartnerCandidateDetailed>({
    queryKey: ['partner-candidate', candidateId],
    queryFn: () => partnerCandidateService.getCandidate(candidateId),
    enabled: !!candidateId,
  });

  // Fetch activity logs
  useEffect(() => {
    const fetchActivityLogs = async () => {
      if (!candidate?.userId) return;

      try {
        setActivityLoading(true);
        const response = await activityLogService.getUserActivityLogs(
          candidate.userId,
          {
            page: 1,
            limit: 50,
          }
        );
        setActivityLogs(response.data || []);
      } catch (err) {
        logger.error('Error fetching activity logs:', err);
      } finally {
        setActivityLoading(false);
      }
    };

    fetchActivityLogs();
  }, [candidate?.userId]);

  const handleBackFromDetails = () => {
    router.push('/app/partner/candidates');
  };

  const handleCandidateUpdated = () => {
    refetch();
  };

  const formatEnumValue = (value: string): string => {
    if (!value) return 'N/A';
    return value
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  if (loading) {
    return <CandidateDetailsSkeleton />;
  }

  if (error || !candidateId || !candidate) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto mb-4 h-16 w-16 text-red-500" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Error Loading Candidate
          </h3>
          <p className="text-gray-500">
            {error instanceof Error
              ? error.message
              : (error as unknown as string) || 'Candidate not found'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto space-y-6 rounded-xl p-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handleBackFromDetails}
          className="bg-secondary text-secondary-foreground gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Candidates
        </Button>

        <UpdateCandidateDialog
          candidate={candidate}
          onCandidateUpdated={handleCandidateUpdated}
          trigger={
            <Button variant="outline" size="sm" className="gap-2">
              <Edit className="h-4 w-4" />
              Edit Candidate
            </Button>
          }
        />
      </div>
      <div className="mt-4 mb-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="relative">
              <Avatar className="h-14 w-14 border-2 border-white shadow-sm dark:border-gray-600">
                <AvatarImage
                  src=""
                  alt={candidate.name}
                  className="object-cover"
                />
                <AvatarFallback className="bg-primary text-base font-semibold text-white">
                  {candidate.name
                    ?.split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .slice(0, 2) || ''}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -right-1 -bottom-1 rounded-full border-2 border-white bg-green-500 p-0.5 dark:border-gray-600">
                <div className="h-2 w-2 rounded-full bg-white" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-xl font-semibold text-gray-900 dark:text-white">
                {candidate.name || 'Unnamed Candidate'}
              </h1>
              <p className="mt-0.5 text-base font-medium text-gray-600 dark:text-gray-300">
                {candidate.jobTitle || 'Professional'}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <Badge className="bg-primary px-2 py-0.5 text-xs font-medium text-white">
                  {candidate.completionPercentage || 0}% Complete
                </Badge>
                <Badge
                  variant="outline"
                  className="border-primary text-primary px-2 py-0.5 text-xs font-medium dark:border-purple-400 dark:text-purple-400"
                >
                  {formatEnumValue(candidate.status)}
                </Badge>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                  Joined {formatDate(candidate.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-4">
        <CustomTabs
          tabs={[
            { key: 'overview', label: 'Overview' },
            { key: 'resume', label: 'Resume' },
            { key: 'assessments', label: 'Assessments' },
            { key: 'activity', label: 'Activity' },
            { key: 'settings', label: 'Settings' },
          ]}
          activeTab={selectedTab}
          onTabChange={setSelectedTab}
        />

        {/* Overview Tab */}
        {selectedTab === 'overview' && (
          <div className="space-y-4">
            <OverviewTab candidate={candidate} />
          </div>
        )}

        {/* Assessments Tab */}
        {selectedTab === 'assessments' && (
          <div className="space-y-6">
            <AssessmentsTab candidate={candidate} />
          </div>
        )}

        {/* Activity Tab */}
        {selectedTab === 'activity' && (
          <div className="space-y-6">
            <ActivityTab
              candidate={candidate}
              activityLogs={activityLogs}
              activityLoading={activityLoading}
            />
          </div>
        )}

        {/* Settings Tab */}
        {selectedTab === 'settings' && (
          <div className="space-y-6">
            <SettingsTab candidate={candidate} />
          </div>
        )}

        {/* Resume Tab */}
        {selectedTab === 'resume' && (
          <div className="space-y-6">
            <ResumeTab candidate={candidate} />
          </div>
        )}
      </div>
    </div>
  );
}

function CandidateDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900">
      <div className="mx-auto px-4 py-4">
        {/* Header Skeleton */}
        <div className="mb-6">
          <div className="mb-3 flex items-center">
            <div className="h-8 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          </div>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
              <div className="space-y-2">
                <div className="h-6 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                <div className="flex gap-2">
                  <div className="h-5 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-5 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className="space-y-4">
          <div className="grid h-11 w-full grid-cols-6 rounded-lg border border-gray-200 bg-white p-1 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
              />
            ))}
          </div>

          {/* Content Skeleton */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="h-96 animate-pulse rounded-lg bg-white shadow-sm dark:bg-gray-800" />
            </div>
            <div className="space-y-6">
              <div className="h-48 animate-pulse rounded-lg bg-white shadow-sm dark:bg-gray-800" />
              <div className="h-48 animate-pulse rounded-lg bg-white shadow-sm dark:bg-gray-800" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { CustomTabs } from '@/components/ui/custom-tabs';
import {
  ArrowLeft,
  Edit,
  AlertTriangle,
  Share2,
  Copy,
  CheckCircle2,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supportCandidateManagementService } from '@/lib/services/services';
import { IActivityLog } from '@/lib/shared/models/domain/activity/activity.log.domain';
import { activityLogService } from '@/lib/services/services';
import { UpdateCandidateDialog } from './update-candidate-dialog';
import {
  OverviewTab,
  AssessmentsTab,
  ApplicationsTab,
  ActivityTab,
  SettingsTab,
} from './details-tabs';
import { logger } from '@/lib/logger';
import { ResumeTab } from './details-tabs/resume-tab';

import {
  CandidateOnboardingAssessmentStatusEnum,
  OnboardingAssessmentRecommendationEnum,
  UserRoleEnum,
  UserTypeEnum,
  JobAiAssessmentStatusEnum,
} from '@/lib/shared/models/common/enums';

import {
  ImpersonationDialog,
  ImpersonationButton,
} from '@/components/app/common/support/impersonation-dialog';
import { canPerformImpersonation } from '@/lib/utils/impersonation.utils';
import { useApp } from '@/lib/context/app-context';

import { toast } from 'sonner';
import { SupportCandidateManagementApiService } from '@/lib/shared/services/support/candidate.api.service';
import { apiClient } from '@/lib/api-client';
import { RotateCcw, RefreshCw } from 'lucide-react';
import { ResetAssessmentDialog } from '@/components/app/common/support/reset-assessment-dialog';
import { getLatestOnboardingAssessment } from '@/lib/utils/assessment.utils';

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
  const searchParams = useSearchParams();
  const [selectedTab, setSelectedTab] = useState('overview');
  const [activityLogs, setActivityLogs] = useState<IActivityLog[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [impersonateDialogOpen, setImpersonateDialogOpen] = useState(false);

  // Reset assessment state
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isResetJobAiDialogOpen, setIsResetJobAiDialogOpen] = useState(false);
  const [selectedJobAiAssessmentId, setSelectedJobAiAssessmentId] = useState<
    string | null
  >(null);

  // Resubmit assessment state
  const [isResubmitting, setIsResubmitting] = useState(false);

  // Share profile state
  const [showShareLink, setShowShareLink] = useState(false);
  const [copied, setCopied] = useState(false);

  const { user } = useApp();

  // API service instance
  const candidateApiService = new SupportCandidateManagementApiService(
    apiClient
  );

  const handleBackFromDetails = () => {
    const jobId = searchParams.get('jobId');
    const page = searchParams.get('page');
    const tab = searchParams.get('tab');

    // If jobId is present, navigate back to the job posting page
    if (jobId) {
      router.push(`/app/support/job-details/${jobId}`);
      return;
    }

    // Otherwise, navigate back to candidates list with pagination
    const params = new URLSearchParams();

    if (tab) {
      params.set('tab', tab);
    }

    if (page) {
      params.set('page', page);
    }

    const queryString = params.toString();
    const destination = queryString
      ? `/app/support/candidates?${queryString}`
      : '/app/support/candidates';

    router.push(destination);
  };

  // Use React Query for candidate data
  const {
    data: candidate,
    isLoading: loading,
    error,
    refetch: refetchCandidate,
  } = useQuery({
    queryKey: ['support-candidate', candidateId],
    queryFn: () =>
      supportCandidateManagementService.getSupportCandidate(candidateId),
    enabled: !!candidateId,
  });

  // Get the latest onboarding assessment
  const latestOnboardingAssessment = useMemo(() => {
    return candidate ? getLatestOnboardingAssessment(candidate) : undefined;
  }, [candidate]);

  // Get the latest job AI assessment
  const latestJobAiAssessment = useMemo(() => {
    if (
      !candidate?.jobAiAssessments ||
      candidate.jobAiAssessments.length === 0
    ) {
      return undefined;
    }
    // Sort by startedAt or completedAt descending and get the latest one
    return [...candidate.jobAiAssessments].sort((a, b) => {
      const dateA = a.completedAt || a.startedAt || new Date(0);
      const dateB = b.completedAt || b.startedAt || new Date(0);
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    })[0];
  }, [candidate?.jobAiAssessments]);

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

    if (candidate?.userId) {
      fetchActivityLogs();
    }
  }, [candidate?.userId]);

  const handleCandidateUpdated = () => {
    refetchCandidate();
  };

  const handleImpersonate = () => {
    setImpersonateDialogOpen(true);
  };

  // Reset assessment handler
  const handleResetAssessment = async (reason?: string) => {
    if (!candidate?.id) {
      toast.error('Candidate ID not found');
      return;
    }

    try {
      const response = await candidateApiService.resetOnboardingAssessment(
        candidate.id,
        { reason }
      );

      toast.success(response.message || 'Assessment reset successfully');

      // Refresh the page to get updated data
      window.location.reload();
    } catch (error) {
      logger.error('Error resetting assessment:', error);
      toast.error('Failed to reset assessment. Please try again.');
      throw error; // Re-throw to let the dialog handle the error state
    }
  };

  // Resubmit assessment handler - backend handles rate limiting
  const handleResubmitAssessment = async () => {
    if (!candidate?.id) {
      toast.error('Candidate ID not found');
      return;
    }

    try {
      setIsResubmitting(true);
      const response = await candidateApiService.resubmitOnboardingAssessment(
        candidate.id
      );

      toast.success(
        response.message ||
          'Assessment resubmitted successfully. Processing in background...'
      );

      // Refresh candidate data after a short delay to show updated status
      setTimeout(() => {
        refetchCandidate();
      }, 2000);
    } catch (error: any) {
      logger.error('Error resubmitting assessment:', error);

      const errorMessage =
        error?.message ||
        error?.response?.data?.message ||
        'Failed to resubmit assessment. Please try again.';

      toast.error(errorMessage);
    } finally {
      setIsResubmitting(false);
    }
  };

  // Reset job AI assessment handler
  const handleResetJobAiAssessment = async (reason?: string) => {
    if (!selectedJobAiAssessmentId) {
      toast.error('Job AI assessment ID not found');
      return;
    }

    try {
      const response = await candidateApiService.resetJobAiAssessment(
        selectedJobAiAssessmentId,
        { reason }
      );

      toast.success(response.message || 'Job AI assessment reset successfully');

      // Wait a moment for backend to process reset and re-initialization
      // Then refresh candidate data to show updated assessment state
      setTimeout(async () => {
        await refetchCandidate();
      }, 2000); // 2 second delay to allow backend processing

      setIsResetJobAiDialogOpen(false);
      setSelectedJobAiAssessmentId(null);
    } catch (error) {
      logger.error('Error resetting job AI assessment:', error);
      toast.error('Failed to reset job AI assessment. Please try again.');
      throw error; // Re-throw to let the dialog handle the error state
    }
  };

  // Share profile functions
  const getPublicProfileUrl = () => {
    // Construct the public profile URL
    const baseUrl = window.location.origin;
    return `${baseUrl}/candidate/profile/${candidate?.id || candidateId}`;
  };

  const handleShareProfile = () => {
    setShowShareLink(!showShareLink);
    setCopied(false);
  };

  const handleCopyLink = async () => {
    try {
      const profileUrl = getPublicProfileUrl();
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      toast.success('Profile link copied to clipboard!');

      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      logger.error('Error copying to clipboard:', error);
      toast.error('Failed to copy link to clipboard');
    }
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
          {searchParams.get('jobId')
            ? 'Back to Job Posting'
            : 'Back to Candidates'}
        </Button>

        <div className="flex space-x-2">
          {/* Share Profile Button */}
          <Button
            variant="outline"
            onClick={handleShareProfile}
            className="h-10 gap-2 px-4"
          >
            <Share2 className="h-4 w-4" />
            Share Profile
          </Button>

          {canPerformImpersonation(user) && (
            <ImpersonationButton
              onClick={handleImpersonate}
              disabled={!canPerformImpersonation(user)}
              tooltip={
                !canPerformImpersonation(user)
                  ? 'Only support recruiters can perform impersonation'
                  : undefined
              }
            />
          )}
          <UpdateCandidateDialog
            candidate={candidate}
            onCandidateUpdated={handleCandidateUpdated}
            trigger={
              <Button variant="default" className="h-10 gap-2 px-4">
                <Edit className="h-4 w-4" />
                Edit Candidate
              </Button>
            }
          />
          {/* Reset Assessment Button - Show when onboarding assessment is in progress OR when latest completed assessment is not recommended */}
          {(candidate.onboardingAssessmentStatus ===
            CandidateOnboardingAssessmentStatusEnum.ASSESSMENT_IN_PROGRESS ||
            (candidate.onboardingAssessmentStatus ===
              CandidateOnboardingAssessmentStatusEnum.ASSESSMENT_COMPLETED &&
              latestOnboardingAssessment &&
              latestOnboardingAssessment.recommendation !==
                OnboardingAssessmentRecommendationEnum.HIGHLY_RECOMMENDED &&
              latestOnboardingAssessment.recommendation !==
                OnboardingAssessmentRecommendationEnum.RECOMMENDED)) && (
            <ResetAssessmentDialog
              open={isResetDialogOpen}
              onOpenChange={setIsResetDialogOpen}
              onReset={handleResetAssessment}
              title="Reset Onboarding Assessment"
              trigger={
                <Button variant="default" className="h-10 gap-2 px-4">
                  <RotateCcw className="h-4 w-4" />
                  Reset Assessment
                </Button>
              }
            />
          )}

          {/* Resubmit Assessment Button - Show when assessment is completed or failed (for re-analysis) */}
          {user?.type === UserTypeEnum.SUPPORT &&
            (user?.role === UserRoleEnum.ADMIN ||
              user?.role === UserRoleEnum.RECRUITER) &&
            latestOnboardingAssessment &&
            (candidate.onboardingAssessmentStatus ===
              CandidateOnboardingAssessmentStatusEnum.ASSESSMENT_COMPLETED ||
              candidate.onboardingAssessmentStatus ===
                CandidateOnboardingAssessmentStatusEnum.ASSESSMENT_FAILED ||
              latestOnboardingAssessment.recommendation ===
                OnboardingAssessmentRecommendationEnum.HIGHLY_RECOMMENDED ||
              latestOnboardingAssessment.recommendation ===
                OnboardingAssessmentRecommendationEnum.RECOMMENDED ||
              latestOnboardingAssessment.recommendation ===
                OnboardingAssessmentRecommendationEnum.NOT_RECOMMENDED) && (
              <Button
                variant="secondary"
                className="h-10 gap-2 px-4"
                onClick={handleResubmitAssessment}
                disabled={isResubmitting}
                title="Resubmit assessment for re-analysis (Rate limited: 10 min)"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isResubmitting ? 'animate-spin' : ''}`}
                />
                {isResubmitting ? 'Resubmitting...' : 'Resubmit Assessment'}
              </Button>
            )}

          {/* Reset Job AI Assessment Button - Show when job AI assessment exists and is NOT completed */}
          {user?.type === UserTypeEnum.SUPPORT &&
            (user?.role === UserRoleEnum.ADMIN ||
              user?.role === UserRoleEnum.RECRUITER ||
              user?.role === UserRoleEnum.ACCOUNT_MANAGER) &&
            latestJobAiAssessment &&
            latestJobAiAssessment.id &&
            latestJobAiAssessment.status !==
              JobAiAssessmentStatusEnum.AI_REVIEW_COMPLETED &&
            latestJobAiAssessment.status !==
              JobAiAssessmentStatusEnum.ASSESSMENT_COMPLETED &&
            latestJobAiAssessment.status !==
              JobAiAssessmentStatusEnum.MANUAL_REVIEW_COMPLETED && (
              <ResetAssessmentDialog
                open={isResetJobAiDialogOpen}
                onOpenChange={(open) => {
                  setIsResetJobAiDialogOpen(open);
                  if (open) {
                    setSelectedJobAiAssessmentId(latestJobAiAssessment.id);
                  } else {
                    setSelectedJobAiAssessmentId(null);
                  }
                }}
                onReset={handleResetJobAiAssessment}
                title="Reset Job AI Assessment"
                trigger={
                  <Button variant="default" className="h-10 gap-2 px-4">
                    <RotateCcw className="h-4 w-4" />
                    Reset Job AI Assessment
                  </Button>
                }
              />
            )}
        </div>
      </div>

      {/* Share Profile Link */}
      {showShareLink && (
        <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Public Profile Link
              </h3>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={getPublicProfileUrl()}
                  readOnly
                  className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Share this link to allow others to view the candidate&#39;s
                public profile
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 mb-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="relative">
              <Avatar className="h-14 w-14 border-2 border-white shadow-sm dark:border-gray-600">
                <AvatarImage
                  src={candidate.image}
                  alt={candidate.fullName}
                  className="object-cover"
                />
                <AvatarFallback className="bg-primary text-base font-semibold text-white">
                  {candidate.fullName
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
                {candidate.fullName || 'Unnamed Candidate'}
              </h1>
              <p className="mt-0.5 text-base font-medium text-gray-600 dark:text-gray-300">
                {candidate.resume?.currentJobTitle || 'Professional'}
              </p>
              <div className="flex flex-row justify-between">
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
      </div>

      {/* Main Content */}
      <div className="space-y-4">
        <CustomTabs
          tabs={[
            { key: 'overview', label: 'Overview' },
            { key: 'resume', label: 'Resume' },
            { key: 'assessments', label: 'Assessments' },
            { key: 'applications', label: 'Applications' },
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

        {/* Applications Tab */}
        {selectedTab === 'applications' && (
          <div className="space-y-6">
            <ApplicationsTab candidate={candidate} />
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

      {/* Impersonation Dialog */}
      <ImpersonationDialog
        open={impersonateDialogOpen}
        onOpenChange={setImpersonateDialogOpen}
        targetUserId={candidateId}
        targetUserType={UserTypeEnum.CANDIDATE}
        targetUserName={candidate.fullName || ''}
        targetUserEmail={candidate.email}
      />
    </div>
  );
}

function CandidateDetailsSkeleton() {
  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto px-4 py-4">
        {/* Header Skeleton */}
        <div className="mb-6">
          <div className="mb-3 flex items-center">
            <div className="bg-muted h-8 w-32 animate-pulse rounded" />
          </div>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="bg-muted h-14 w-14 animate-pulse rounded-full" />
              <div className="space-y-2">
                <div className="bg-muted h-6 w-48 animate-pulse rounded" />
                <div className="bg-muted h-4 w-32 animate-pulse rounded" />
                <div className="flex gap-2">
                  <div className="bg-muted h-5 w-16 animate-pulse rounded" />
                  <div className="bg-muted h-5 w-20 animate-pulse rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className="space-y-4">
          <div className="bg-card grid h-11 w-full grid-cols-6 rounded-lg border p-1 shadow-sm">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-muted h-8 animate-pulse rounded" />
            ))}
          </div>

          {/* Content Skeleton */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="bg-card h-96 animate-pulse rounded-lg shadow-sm" />
            </div>
            <div className="space-y-6">
              <div className="bg-card h-48 animate-pulse rounded-lg shadow-sm" />
              <div className="bg-card h-48 animate-pulse rounded-lg shadow-sm" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

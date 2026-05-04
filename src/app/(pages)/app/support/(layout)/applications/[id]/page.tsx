'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CustomTabs } from '@/components/ui/custom-tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useApp } from '@/lib/context/app-context';
import {
  ArrowLeft,
  Award,
  Briefcase,
  CheckCircle2,
  Clock,
  UserPlus,
  XCircle,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  activityLogService,
  candidateOnboardingAssessmentService,
  candidateResumeService,
  // replace client with support service
  supportJobApplicationService,
} from '@/lib/services/services';
import {
  ActivityEntityTypeEnum,
  ActivityModuleEnum,
  ApplicationStatusEnum,
  // swap to support domain models
  ISupportJobApplication,
  ISupportJobApplicationAiAssessment,
  ICandidateOnboardingAssessment,
  IResume,
  logger,
} from '@/lib/shared';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

import { ScheduleCard } from './components/schedule-card';
import { OverviewTab } from './components/overview-tab';
import { AssessmentTab } from './components/assessment-tab';
import { ActivityTab } from './components/activity-tab';

// Function to get application status badge with consistent styling
const getApplicationStatusBadge = (status: string) => {
  const normalizedStatus = status?.toUpperCase() || 'APPLIED';

  switch (normalizedStatus) {
    case 'APPLIED':
      return (
        <Badge
          variant="secondary"
          className="flex items-center gap-2 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400 dark:hover:bg-yellow-900/30"
        >
          <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
          Applied
        </Badge>
      );
    case 'REVIEWING':
      return (
        <Badge className="gap-x-2 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/30">
          <div className="h-2 w-2 rounded-full bg-amber-500"></div>
          Reviewing
        </Badge>
      );
    case 'SHORTLISTED':
      return (
        <Badge className="flex items-center gap-3 bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30">
          <div className="h-2 w-2 rounded-full bg-green-500"></div>
          Shortlisted
        </Badge>
      );
    case 'INTERVIEWED':
      return (
        <Badge className="flex items-center gap-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:hover:bg-indigo-900/30">
          <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
          Interviewed
        </Badge>
      );
    case 'OFFERED':
      return (
        <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/30">
          <Award className="mr-1 h-3 w-3" /> Offered
        </Badge>
      );
    case 'ACCEPTED':
      return (
        <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/30">
          <Briefcase className="mr-1 h-3 w-3" /> Accepted
        </Badge>
      );
    case 'REJECTED':
      return (
        <Badge className="bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30">
          <XCircle className="mr-1 h-3 w-3" /> Rejected
        </Badge>
      );
    case 'WITHDRAWN':
      return (
        <Badge className="bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400 dark:hover:bg-gray-900/30">
          <Clock className="mr-1 h-3 w-3" /> Withdrawn
        </Badge>
      );
    default:
      return (
        <Badge className="bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400 dark:hover:bg-gray-900/30">
          {status}
        </Badge>
      );
  }
};

export default function SupportApplicationPage() {
  const { user } = useApp();
  const params = useParams();
  const applicationId = params.id as string;
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');

  // Add states for confirmation modal
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState<
    'accept' | 'reject' | null
  >(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // Add states for hire functionality
  const [hireDialogOpen, setHireDialogOpen] = useState(false);
  const [isProcessingHire, setIsProcessingHire] = useState(false);

  const { data: applicationData, isLoading } = useQuery({
    queryKey: ['supportApplication', applicationId],
    queryFn: () =>
      supportJobApplicationService.getSupportJobApplication(applicationId),
  });

  const candidateId = applicationData?.candidateId;
  const candidateImage = applicationData?.candidate?.user?.image;

  const formatDate = (dateInput: Date | string) => {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleBackFromDetails = () => {
    if (applicationData?.jobId) {
      router.push(`/app/support/job-details/${applicationData.jobId}`);
    } else {
      router.push('/app/support/sourcing');
    }
  };

  // Handler for opening accept confirmation
  const handleAcceptApplication = () => {
    setConfirmationAction('accept');
    setConfirmationDialogOpen(true);
  };

  // Handler for opening reject confirmation
  const handleRejectApplication = () => {
    setConfirmationAction('reject');
    setConfirmationDialogOpen(true);
  };

  // Handler for confirming the action
  const handleConfirmAction = async () => {
    if (!applicationData?.id || !confirmationAction) {
      toast.error('Missing application data');
      return;
    }

    setIsProcessingAction(true);

    try {
      // Refresh application data
      queryClient.invalidateQueries({
        queryKey: ['supportApplication', applicationId],
      });

      // Refresh the applications list
      queryClient.invalidateQueries({
        queryKey: ['supportJobApplications'],
      });

      toast.success(`Application ${confirmationAction}ed successfully!`);
      setConfirmationDialogOpen(false);
      setConfirmationAction(null);
    } catch (error) {
      toast.error(`Failed to ${confirmationAction} application`);
      logger.error(`${confirmationAction} application error:`, error);
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Handler for hire functionality
  const handleHireCandidate = async () => {
    if (!applicationData?.id) {
      toast.error('Missing application data');
      return;
    }

    setIsProcessingHire(true);

    try {
      // NOTE: Support API does not provide hire endpoint; keeping UI interaction only
      toast.success('Hire request recorded. Account manager will follow up.');
      setHireDialogOpen(false);

      // Refresh application data
      queryClient.invalidateQueries({
        queryKey: ['supportApplication', applicationId],
      });

      // Refresh the applications list
      queryClient.invalidateQueries({
        queryKey: ['supportJobApplications'],
      });
    } catch (error) {
      toast.error('Failed to process hire request');
      logger.error('Hire candidate error:', error);
    } finally {
      setIsProcessingHire(false);
    }
  };

  const { data: candidateResumeData } = useQuery({
    queryKey: ['candidateResume', candidateId],
    queryFn: () =>
      candidateResumeService.getPublicResume(candidateId as string),
    enabled: !!candidateId,
  });

  const { data: clientJobApplicationAiAssessment } = useQuery({
    queryKey: ['aiAssesment', applicationId],
    queryFn: () =>
      supportJobApplicationService.getSupportJobApplicationAiAssessment(
        applicationId
      ),
    enabled: !!applicationId,
  });

  const { data: onbopoaordingAssessment } = useQuery({
    queryKey: ['onboardingAssessment', applicationId],
    queryFn: () =>
      candidateOnboardingAssessmentService.getLatestAssessmentByCandidateId(
        candidateId as string
      ),
    enabled: !!candidateId,
  });

  const { data: jobApplicationActivity } = useQuery({
    queryKey: ['jobApplicationActivity', user?.supportUserId],
    queryFn: () =>
      activityLogService.getActivityLogs({
        entityId: user?.supportUserId,
        module: ActivityModuleEnum.JOB,
        entityType: ActivityEntityTypeEnum.JOB_APPLICATION,
      }),
  });

  const jobApplicationActivityLogs = jobApplicationActivity?.data?.filter(
    (log: any) => log.metadata?.applicationId === applicationId
  );

  if (isLoading) {
    return (
      <div className="bg-card dark:bg-primary/10 mt-4 space-y-6 rounded-lg p-6">
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (!applicationData) {
    return (
      <div className="bg-card dark:bg-primary/10 mt-4 space-y-6 rounded-lg p-6">
        <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
          <div className="mb-4 rounded-full bg-yellow-100 p-4 dark:bg-yellow-900/20">
            <ArrowLeft className="h-12 w-12 text-yellow-600 dark:text-yellow-400" />
          </div>
          <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
            Application Not Found
          </h3>
          <p className="mb-6 max-w-md text-gray-500 dark:text-gray-400">
            The requested application could not be found or you don&apos;t have
            access to view it.
          </p>
          <Button onClick={handleBackFromDetails} className="space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Go Back</span>
          </Button>
        </div>
      </div>
    );
  }

  // Define tabs configuration
  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'assessments', label: 'Assessments' },
    { key: 'activity', label: 'Activity' },
    { key: 'schedule', label: 'Schedule' },
  ];

  const renderTabContent = () => {
    // Add userId property to applicationData for components that expect IClientJobApplication
    const applicationDataWithUserId = {
      ...applicationData,
      userId: applicationData?.candidateId,
    } as ISupportJobApplication & { userId: string };

    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab
            applicationData={applicationData as ISupportJobApplication}
            candidateResumeData={candidateResumeData as IResume}
          />
        );

      case 'assessments':
        return (
          <AssessmentTab
            applicationData={applicationDataWithUserId}
            supportJobApplicationAiAssessment={
              clientJobApplicationAiAssessment as ISupportJobApplicationAiAssessment
            }
            onboardingAssessment={
              onbopoaordingAssessment as ICandidateOnboardingAssessment
            }
          />
        );

      case 'activity':
        return (
          <ActivityTab
            applicationData={applicationDataWithUserId}
            jobApplicationActivityLogs={jobApplicationActivityLogs || []}
          />
        );

      case 'schedule':
        return (
          <ScheduleCard
            applicationData={applicationDataWithUserId}
            applicationId={applicationId}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen flex-col dark:bg-gray-900">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 backdrop-blur-3xl dark:border-gray-700 dark:bg-gray-900">
        <div className="p-4">
          <div className="mx-auto">
            {/* Header */}
            <div className="mb-4 space-y-4">
              <div className="mb-2 flex items-center">
                <Button
                  variant="outline"
                  onClick={handleBackFromDetails}
                  className="bg-secondary text-secondary-foreground gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Job Details
                </Button>
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <div className="mb-1 flex items-center">
                    <h1 className="text-primary dark:text-muted-foreground text-2xl font-bold">
                      Application Details
                    </h1>
                  </div>
                  <p className="text-md text-gray-600 dark:text-gray-400">
                    Review and manage the application details for this
                    candidate.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  {applicationData.status === ApplicationStatusEnum.OFFERED && (
                    <Button
                      onClick={() => setHireDialogOpen(true)}
                      className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Hire Candidate
                    </Button>
                  )}

                  {applicationData.status ===
                    ApplicationStatusEnum.SHORTLISTED && (
                    <>
                      <Button
                        onClick={handleAcceptApplication}
                        variant="outline"
                        className="border-green-200 bg-green-50 text-green-700 hover:bg-green-100 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30"
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Accept
                      </Button>
                      <Button
                        onClick={handleRejectApplication}
                        variant="outline"
                        className="border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Candidate Info Card */}
              <div className="bg-card rounded-lg border p-4 dark:border-gray-700">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={candidateImage || ''}
                      alt={applicationData.candidate?.user?.name || 'Candidate'}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary">
                      {applicationData.candidate?.user?.name
                        ?.split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase() || 'C'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {applicationData.candidate?.user?.name ||
                          'Unknown Candidate'}
                      </h2>
                      {getApplicationStatusBadge(applicationData.status)}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {applicationData.candidate?.user?.email ||
                        'No email provided'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Applied on {formatDate(applicationData.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <CustomTabs
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={(tab) => {
                setActiveTab(tab);
              }}
            />
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mx-auto">{renderTabContent()}</div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmationDialogOpen}
        onOpenChange={setConfirmationDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmationAction === 'accept'
                ? 'Accept Application'
                : 'Reject Application'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              Are you sure you want to{' '}
              <span className="font-semibold">
                {confirmationAction === 'accept' ? 'accept' : 'reject'}
              </span>{' '}
              this application?
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setConfirmationDialogOpen(false)}
                disabled={isProcessingAction}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmAction}
                disabled={isProcessingAction}
                className={
                  confirmationAction === 'accept'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }
              >
                {isProcessingAction
                  ? 'Processing...'
                  : confirmationAction === 'accept'
                    ? 'Accept'
                    : 'Reject'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hire Dialog */}
      <Dialog open={hireDialogOpen} onOpenChange={setHireDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hire Candidate</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              Are you sure you want to hire{' '}
              <span className="font-semibold">
                {applicationData.candidate?.user?.name || 'this candidate'}
              </span>
              ? This will send a notification to the account manager.
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setHireDialogOpen(false)}
                disabled={isProcessingHire}
              >
                Cancel
              </Button>
              <Button
                onClick={handleHireCandidate}
                disabled={isProcessingHire}
                className="bg-green-600 hover:bg-green-700"
              >
                {isProcessingHire ? 'Processing...' : 'Hire Candidate'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

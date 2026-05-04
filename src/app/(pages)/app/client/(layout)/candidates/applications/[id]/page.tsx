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
import {
  ArrowLeft,
  Award,
  Briefcase,
  CheckCircle2,
  Clock,
  FileText,
  UserPlus,
  Share2,
  Copy,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  activityLogService,
  candidateJobAiAssessmentService,
  candidateOnboardingAssessmentService,
  candidateResumeAssessmentService,
  candidateResumeService,
  clientJobApplicationService,
  subscriptionLimitsService,
} from '@/lib/services/services';
import {
  ActivityEntityTypeEnum,
  ActivityModuleEnum,
  ApplicationStatusEnum,
  ICandidateJobAiAssessment,
  ICandidateOnboardingAssessment,
  IClientJobApplication,
  IClientJobApplicationAiAssessment,
  IResume,
  IResumeAssessment,
  logger,
} from '@/lib/shared';
import { toast } from 'sonner';
import { XCircle } from 'lucide-react';

import { ScheduleCard } from './components/schedule-tab';

import { JobChatWidget } from './components/job-chat-widget';
import { useApp } from '@/lib/context/app-context';
import { ActivityTab } from '@/components/app/client/candidate/activity-tab';
import { AssessmentTab } from '@/components/app/client/candidate/assessment-tab';
import { OverviewTab } from '@/components/app/client/candidate/overview-tab';
import { generatePublicProfileUrl } from '@/lib/utils/data-masking';

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
    case 'HIRED':
      return (
        <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/30">
          <Briefcase className="mr-1 h-3 w-3" /> Hired
        </Badge>
      );
    case 'REJECTED':
      return (
        <Badge
          variant="destructive"
          className="bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
        >
          <XCircle className="mr-1 h-3 w-3" /> Rejected
        </Badge>
      );
    case 'WITHDRAWN':
      return (
        <Badge variant="outline" className="text-gray-700 dark:text-gray-300">
          <XCircle className="mr-1 h-3 w-3" /> Withdrawn
        </Badge>
      );
    case 'DRAFT':
      return (
        <Badge variant="outline" className="text-gray-700 dark:text-gray-300">
          <FileText className="mr-1 h-3 w-3" /> Draft
        </Badge>
      );
    case 'INVITED':
      return (
        <Badge className="flex items-center gap-2 gap-x-2 bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30">
          <div className="h-2 w-2 rounded-full bg-green-500"></div>
          Invited
        </Badge>
      );
    case 'ASSESSING':
      return (
        <Badge variant="outline" className="text-gray-700 dark:text-gray-300">
          <FileText className="mr-1 h-3 w-3" /> Assessing
        </Badge>
      );
    case 'FAILED':
      return (
        <Badge className="bg-red-50 text-red-500 dark:text-red-500">
          <XCircle className="mr-1 h-3 w-3 text-red-500" /> Failed
        </Badge>
      );
    case 'ACCEPTED':
      return (
        <Badge className="flex items-center gap-2 bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30">
          <div className="h-2 w-2 rounded-full bg-green-500"></div>
          Accepted
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="capitalize">
          {status}
        </Badge>
      );
  }
};

// Helper functions for button enablement and status checks
const canAcceptOrReject = (status: ApplicationStatusEnum): boolean => {
  return [
    ApplicationStatusEnum.APPLIED,
    ApplicationStatusEnum.REVIEWING,
  ].includes(status);
};

const canHire = (status: ApplicationStatusEnum): boolean => {
  return [
    ApplicationStatusEnum.ACCEPTED,
    ApplicationStatusEnum.SHORTLISTED,
    ApplicationStatusEnum.ASSESSING,
    ApplicationStatusEnum.OFFERED,
  ].includes(status);
};

const ApplicationPage = () => {
  const params = useParams();
  const applicationId = params.id as string;
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  const [shouldFetchAiAssessment, setShouldFetchAiAssessment] = useState(true);
  // Add states for confirmation modal
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState<
    'accept' | 'reject' | null
  >(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // Add states for hire functionality
  const [hireDialogOpen, setHireDialogOpen] = useState(false);
  const [isProcessingHire, setIsProcessingHire] = useState(false);

  // Share profile state
  const [showShareLink, setShowShareLink] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data: applicationData } = useQuery({
    queryKey: ['application', applicationId],
    queryFn: () => clientJobApplicationService.getJobApplication(applicationId),
  });

  const candidateId = applicationData?.userId;
  const candidateUserId = applicationData?.candidate?.user?.id;
  const candidateImage = applicationData?.candidate?.user?.image;
  const jobId = applicationData?.jobId;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleBackFromDetails = () => {
    router.push(`/app/client/recruiter/sourcing?jobId=${jobId}`);
  };

  const publicProfileUrl = candidateId
    ? generatePublicProfileUrl(candidateId as string)
    : '';

  const handleShareProfile = () => {
    setShowShareLink((prev) => !prev);
    setCopied(false);
  };

  const handleCopyProfileLink = async () => {
    try {
      if (!publicProfileUrl) {
        toast.error('Profile link is not available');
        return;
      }
      await navigator.clipboard.writeText(publicProfileUrl);
      setCopied(true);
      toast.success('Profile link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      logger.error('Error copying profile link:', error);
      toast.error('Failed to copy link to clipboard');
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
      const status =
        confirmationAction === 'accept'
          ? ApplicationStatusEnum.ACCEPTED
          : ApplicationStatusEnum.REJECTED;

      await clientJobApplicationService.updateJobApplicationStatus(
        applicationData.id,
        status
      );

      // Refresh application data
      queryClient.invalidateQueries({
        queryKey: ['application', applicationId],
      });

      // Refresh the applications list
      queryClient.invalidateQueries({
        queryKey: ['clientApplications'],
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
      // Process hire request and send email to account manager
      await clientJobApplicationService.processHireRequest(applicationData.id);

      toast.success(
        'Hire request sent! Our team will set up everything for you.'
      );
      setHireDialogOpen(false);

      // Refresh application data
      queryClient.invalidateQueries({
        queryKey: ['application', applicationId],
      });

      // Refresh the applications list
      queryClient.invalidateQueries({
        queryKey: ['clientApplications'],
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

  const { data: usageSummary } = useQuery({
    queryKey: ['usage-summary'],
    queryFn: () => subscriptionLimitsService.getUsageSummary(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: clientJobApplicationAiAssessment } = useQuery({
    queryKey: ['aiAssesment', applicationId],
    queryFn: async () => {
      try {
        const data =
          await clientJobApplicationService.getJobApplicationAiAssessment(
            applicationId
          );
        return data;
      } catch (err: any) {
        if (err?.code === 'ERR_4001') {
          setShouldFetchAiAssessment(false);
        }
        throw err;
      }
    },
    enabled: !!applicationId && shouldFetchAiAssessment,
    retry: false,
  });

  const { data: onbopoaordingAssessment } = useQuery({
    queryKey: ['onboardingAssessment', applicationId],
    queryFn: () =>
      candidateOnboardingAssessmentService.getLatestAssessmentByCandidateId(
        candidateId as string
      ),
    enabled: !!candidateId,
  });

  const { data: jobAssessmentDetails } = useQuery({
    queryKey: ['jobAssessment', applicationId],
    queryFn: () =>
      candidateJobAiAssessmentService.getLatestJobAiAssessmentByCandidateId(
        candidateId as string
      ),
    enabled: !!candidateId,
  });

  const { data: resumeAssessment } = useQuery({
    queryKey: ['resumeAssessment', applicationId],
    queryFn: () =>
      candidateResumeAssessmentService.getLatestAssessmentByCandidateId(
        candidateId as string
      ),
    enabled: !!candidateId,
  });

  const { data: jobApplicationActivity } = useQuery({
    queryKey: ['jobApplicationActivity', user?.clientId],
    queryFn: () =>
      activityLogService.getActivityLogs({
        entityId: user?.clientId,
        module: ActivityModuleEnum.JOB,
        entityType: ActivityEntityTypeEnum.JOB_APPLICATION,
      }),
  });

  const jobApplicationActivityLogs = jobApplicationActivity?.data?.filter(
    (log: any) => log.metadata?.applicationId === applicationId
  );

  // Define tabs configuration
  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'assessments', label: 'Assessments' },
    { key: 'activity', label: 'Activity' },
    { key: 'schedule', label: 'Schedule' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab candidateResumeData={candidateResumeData as IResume} />
        );

      case 'assessments':
        return (
          <AssessmentTab
            clientJobApplicationAiAssessment={
              clientJobApplicationAiAssessment as IClientJobApplicationAiAssessment
            }
            onboardingAssessment={
              onbopoaordingAssessment as ICandidateOnboardingAssessment
            }
            resumeAssessment={resumeAssessment as IResumeAssessment}
            jobAssessmentDetails={
              jobAssessmentDetails as ICandidateJobAiAssessment
            }
          />
        );

      case 'activity':
        return (
          <ActivityTab
            jobApplicationActivityLogs={jobApplicationActivityLogs || []}
          />
        );

      case 'schedule':
        return (
          <ScheduleCard
            applicationData={applicationData as IClientJobApplication}
            applicationId={applicationId ?? ''}
            usageSummary={usageSummary}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-auto flex-col dark:bg-gray-900">
      <div className="dark:border-gray-700 dark:bg-gray-900">
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
                  Back to Applications
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
              </div>
              <div className="bg-card flex flex-col gap-4 rounded-lg px-8 py-4 lg:flex-row lg:items-center lg:justify-between dark:border-gray-700 dark:bg-gray-900">
                <div className="flex items-center gap-4">
                  <div className="relative flex items-center justify-center">
                    <Avatar className="border-gray-250 h-24 w-24 rounded-full border-4 dark:border-gray-600">
                      <AvatarImage
                        src={candidateImage || ''}
                        alt={candidateResumeData?.name || 'Candidate'}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-primary text-base font-semibold text-white">
                        {candidateResumeData?.name
                          ?.split(' ')
                          .map((n) => n[0])
                          .join('') || 'CA'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="">
                      <div className="flex gap-4">
                        <h1 className="truncate text-lg font-semibold text-black dark:text-white">
                          {candidateResumeData?.name}
                        </h1>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {(applicationData as any)?.matchScore && (
                            <Badge className="bg-primary px-2 py-0.5 text-xs font-medium text-white">
                              {(applicationData as any)?.matchScore}% Match
                            </Badge>
                          )}
                          {getApplicationStatusBadge(
                            applicationData?.status || 'Applied'
                          )}
                        </div>
                      </div>
                      <p className="text-muted-foreground mt-0.5 text-sm font-medium">
                        {candidateResumeData?.jobTitle}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <span className="text-muted-foreground flex items-center gap-1 py-0.5 text-sm dark:text-gray-400">
                        <Clock className="h-4 w-4" />
                        Applied on{' '}
                        {formatDate(
                          applicationData?.updatedAt as unknown as string
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex h-full items-center justify-center">
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Share Profile Button */}
                    <Button
                      variant="outline"
                      onClick={handleShareProfile}
                      className="gap-2"
                    >
                      <Share2 className="h-4 w-4" />
                      Share Profile
                    </Button>

                    {/* Accept/Reject Buttons - Show when application can be accepted/rejected */}
                    {applicationData?.status &&
                      canAcceptOrReject(applicationData.status) && (
                        <>
                          <Button
                            onClick={handleAcceptApplication}
                            className="bg-green-600 text-white hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Accept
                          </Button>
                          <Button
                            onClick={handleRejectApplication}
                            variant="destructive"
                            className="bg-red-600 text-white hover:bg-red-700"
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                          </Button>
                        </>
                      )}

                    {/* Hire Button - Show when candidate can be hired */}
                    {applicationData?.status &&
                      canHire(applicationData.status) && (
                        <Button
                          onClick={() => setHireDialogOpen(true)}
                          className="bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          <UserPlus className="mr-2 h-4 w-4" />
                          Hire
                        </Button>
                      )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Menu in Sticky Header */}
          <div className="px-4 pb-2">
            <CustomTabs
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>
        </div>
      </div>

      {/* Share Profile Link */}
      {showShareLink && publicProfileUrl && (
        <div className="px-4 pt-2">
          <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                <h3 className="mb-1 text-sm font-medium text-gray-900 dark:text-white">
                  Public Profile Link
                </h3>
                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                  Share this link to allow others to view the candidate&apos;s
                  public profile.
                </p>
                <input
                  type="text"
                  value={publicProfileUrl}
                  readOnly
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div className="mt-3 flex sm:mt-0 sm:ml-4">
                <Button
                  onClick={handleCopyProfileLink}
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
            </div>
          </div>
        </div>
      )}

      {/* Scrollable Main Content */}
      <div className="flex-1">
        <div className="p-4">
          <div className="mx-auto">
            <div className="space-y-4">
              {/* Tab Content */}
              <div className="space-y-4">{renderTabContent()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmationDialogOpen}
        onOpenChange={setConfirmationDialogOpen}
      >
        <DialogContent className="max-w-md dark:border-gray-700 dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 dark:text-white">
              {confirmationAction === 'accept' ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              )}
              Confirm Action
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Are you sure you want to{' '}
                <span
                  className={`font-semibold ${
                    confirmationAction === 'accept'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {confirmationAction}
                </span>{' '}
                this application?
              </p>
              <div className="mt-3 rounded-lg border p-3 dark:border-gray-600 dark:bg-gray-700/50">
                <p className="text-sm font-medium dark:text-white">
                  Candidate: {candidateResumeData?.name || 'Unknown'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Job Title: {candidateResumeData?.jobTitle || 'N/A'}
                </p>
              </div>
            </div>

            {confirmationAction === 'reject' && (
              <div className="rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
                <p className="text-sm text-red-800 dark:text-red-300">
                  <strong>Warning:</strong> This action cannot be undone. The
                  candidate will be notified of the rejection.
                </p>
              </div>
            )}

            {confirmationAction === 'accept' && (
              <div className="rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
                <p className="text-sm text-green-800 dark:text-green-300">
                  <strong>Note:</strong> The candidate will be notified of the
                  acceptance and you&apos;ll be able to schedule interviews.
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setConfirmationDialogOpen(false);
                setConfirmationAction(null);
              }}
              disabled={isProcessingAction}
              className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmAction}
              disabled={isProcessingAction}
              className={`${
                confirmationAction === 'accept'
                  ? 'bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700'
              } text-white`}
            >
              {isProcessingAction ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Processing...
                </>
              ) : (
                <>
                  {confirmationAction === 'accept' ? (
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                  ) : (
                    <XCircle className="mr-2 h-4 w-4" />
                  )}
                  {confirmationAction === 'accept' ? 'Accept' : 'Reject'}{' '}
                  Application
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hire Confirmation Dialog */}
      <Dialog open={hireDialogOpen} onOpenChange={setHireDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="text-primary h-5 w-5" />
              Hire Candidate
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Are you sure you want to hire{' '}
                <span className="text-primary font-semibold">
                  {candidateResumeData?.name || 'this candidate'}
                </span>
                ?
              </p>
              <div className="mt-3 rounded-lg border p-3 dark:border-gray-600 dark:bg-gray-700/50">
                <p className="text-sm font-medium dark:text-white">
                  Candidate: {candidateResumeData?.name || 'Unknown'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Job Title: {candidateResumeData?.jobTitle || 'N/A'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Client: {user?.name || 'N/A'}
                </p>
              </div>
            </div>

            <div className="bg-primary/10 dark:bg-primary/20 rounded-lg p-3">
              <p className="text-primary text-sm">
                <strong>What happens next:</strong>
              </p>
              <ul className="text-muted-foreground mt-2 space-y-1 text-xs">
                <li>• Our team will set up everything for you</li>
                <li>• An email will be sent to your account manager</li>
                <li>• The candidate will be created in your client group</li>
                <li>• You&apos;ll receive setup confirmation shortly</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setHireDialogOpen(false)}
              disabled={isProcessingHire}
              className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleHireCandidate}
              disabled={isProcessingHire}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isProcessingHire ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Setting up...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Hire & Setup
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Job Chat Widget */}
      <JobChatWidget
        jobPostingId={applicationData?.jobId || ''}
        applicationId={applicationId}
        jobTitle={applicationData?.jobTitle || ''}
        candidateId={candidateId || ''}
        candidateUserId={candidateUserId || ''}
        candidateJobTitle={candidateResumeData?.jobTitle || ''}
        candidateName={candidateResumeData?.name || ''}
        clientId={user?.clientId || ''}
        clientName={user?.name || ''}
        hiringManagerId={user?.clientUserId || ''}
        candidateImageUrl={candidateImage || ''}
      />
    </div>
  );
};

export default ApplicationPage;

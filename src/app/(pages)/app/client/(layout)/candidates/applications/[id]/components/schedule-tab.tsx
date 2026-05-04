import { FC, useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CalendarCheck,
  ChevronDown,
  XCircle,
  Clock,
  Brain,
  Users,
  Copy,
  CalendarDays,
  Eye,
  CheckCircle,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import {
  ApplicationStatusEnum,
  JobPanelAssessmentStatusEnum,
  IScheduledInterviewItem,
  IClientJobPanelAssessmentFeedback,
  IPaginatedResponse,
} from '@/lib/shared';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import {
  clientJobAiAssessmentInviteService,
  clientPanelInterviewService,
} from '@/lib/services/services';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { formatDate, formatDateAndTime, formatEnumValue } from '@/lib/utils';
import { PanelAssessmentDialog } from './dialog/panel-assessment-dialog';
import { AiAssessmentDialog } from './dialog/ai-assessment-dialog';
import { IClientJobApplication } from '@/lib/shared';
import { IJobAiAssessmentInvite } from '@/lib/shared/models/domain/client/job.ai.assessment.invite';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context/app-context';
import { AllFeedbackDialog } from './dialog/all-feedback-dialog';

interface ScheduleCardProps {
  applicationData: IClientJobApplication;
  applicationId: string;
  usageSummary?: any;
}

const calculateDuration = (
  startDateTime: string | Date,
  endDateTime: string | Date
): string => {
  const start = new Date(startDateTime);
  const end = new Date(endDateTime);
  const diffInMinutes = Math.floor(
    (end.getTime() - start.getTime()) / (1000 * 60)
  );

  if (diffInMinutes >= 60) {
    const hours = Math.floor(diffInMinutes / 60);
    const minutes = diffInMinutes % 60;
    return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
  }

  return `${diffInMinutes}m`;
};

export const ScheduleCard: FC<ScheduleCardProps> = ({
  applicationData,
  applicationId,
  usageSummary,
}) => {
  const queryClient = useQueryClient();
  const [isAiAssessmentDialogOpen, setIsAiAssessmentDialogOpen] =
    useState(false);
  const [shouldFetch, setShouldFetch] = useState(true);
  const [isPanelAssessmentDialogOpen, setIsPanelAssessmentDialogOpen] =
    useState(false);
  const [isAllFeedbackDialogOpen, setIsAllFeedbackDialogOpen] = useState(false);
  const [isCompletingAssessment, setIsCompletingAssessment] = useState(false);

  // Panel assessment slots query
  const { data: panelAssessmentSlots } = useQuery({
    queryKey: ['panelAssessmentSlots', applicationId],
    queryFn: () =>
      clientPanelInterviewService.getPanelAssessmentSlots({
        jobApplicationId: applicationId as string,
      }),
    enabled: !!applicationId,
    refetchOnWindowFocus: true,
  });

  // AI assessment invites query
  const { data: aiAssessmentInvite } = useQuery<IJobAiAssessmentInvite>({
    queryKey: ['aiAssessmentInvite', applicationId, applicationData?.userId],
    queryFn: async () => {
      try {
        if (!applicationData?.userId) {
          throw new Error('Candidate ID is missing');
        }
        const data =
          await clientJobAiAssessmentInviteService.getJobAiAssessmentInviteForCandidateId(
            applicationData.userId
          );
        return data;
      } catch (err: any) {
        if (err?.code === 'ERR_4001') {
          setShouldFetch(false);
        }
        throw err;
      }
    },
    enabled: !!applicationId && !!applicationData?.userId && shouldFetch,
    retry: false,
    refetchOnWindowFocus: true,
    staleTime: 30000, // Consider data stale after 30 seconds
  });

  // Check if AI assessment invite exists
  // Use proper object checking to maintain backward compatibility with previous array-based implementation
  const hasAiAssessmentInvite = !!aiAssessmentInvite;

  // Scheduled interviews query to check panel assessment status
  const { data: scheduledInterviewsResponse } = useQuery<
    IPaginatedResponse<IScheduledInterviewItem>
  >({
    queryKey: ['scheduledInterviews'],
    queryFn: () => clientPanelInterviewService.listScheduledInterviews(),
    enabled: !!applicationId,
    refetchOnWindowFocus: true,
  });

  const { user } = useApp();

  const panelAssessmentId = panelAssessmentSlots?.items?.[0]?.panelAssessmentId;

  // Find the current application's panel assessment from scheduled interviews
  const currentPanelAssessment = scheduledInterviewsResponse?.items?.find(
    (interview: IScheduledInterviewItem) =>
      interview.panelAssessmentId === panelAssessmentId
  );

  // Check if panel assessment is completed
  const isPanelAssessmentCompleted =
    currentPanelAssessment?.meetingStatus ===
    JobPanelAssessmentStatusEnum.COMPLETED;
  const { data: panelAssessmentFeedback, refetch: refetchFeedback } = useQuery<
    IPaginatedResponse<IClientJobPanelAssessmentFeedback>
  >({
    queryKey: ['panelAssessmentFeedback', panelAssessmentId],
    queryFn: () =>
      clientPanelInterviewService.getPanelAssessmentFeedbackList({
        panelAssessmentId: panelAssessmentId,
      }),
    enabled: !!panelAssessmentId,
  });

  // Check if current user has submitted feedback
  const currentUserFeedback = panelAssessmentFeedback?.items?.find(
    (feedback: any) => feedback.panelMemberEmail === user?.email
  );
  const hasCurrentUserSubmittedFeedback = !!currentUserFeedback?.isSubmitted;

  // Effect to refetch feedback when component mounts or user returns
  useEffect(() => {
    if (panelAssessmentId) {
      refetchFeedback();
    }
  }, [panelAssessmentId, refetchFeedback]);

  // Effect to refetch feedback when user email changes (in case user logs in/out)
  useEffect(() => {
    if (panelAssessmentId && user?.email) {
      refetchFeedback();
    }
  }, [user?.email, panelAssessmentId, refetchFeedback]);

  const router = useRouter();
  const handleFeedback = (): void => {
    const panelAssessmentId =
      panelAssessmentSlots?.items?.[0]?.panelAssessmentId;
    if (panelAssessmentId) {
      // Check if there's a selected slot
      const hasSelectedSlot = panelAssessmentSlots?.items?.some(
        (slot) => slot.isSelected
      );
      if (!hasSelectedSlot) {
        toast.error(
          'Candidate needs to select a time slot before feedback can be submitted'
        );
        return;
      }

      // Check if panel assessment is completed
      if (!isPanelAssessmentCompleted) {
        toast.error(
          'Panel assessment must be completed before feedback can be submitted'
        );
        return;
      }

      router.push(
        `/app/client/candidates/applications/${applicationId}/feedback-form?panelAssessmentId=${panelAssessmentId}&applicationId=${applicationId}`
      );
    } else {
      toast.error('No panel assessment found');
    }
  };

  const handleSendInvitation = async () => {
    if (!applicationData?.userId) {
      toast.error('Candidate ID is required');
      return;
    }

    try {
      await clientPanelInterviewService.createPanelAssessmentInvitation({
        jobApplicationId: applicationId,
        candidateId: applicationData?.userId,
      });
      queryClient.invalidateQueries({
        queryKey: ['panelAssessmentSlots', applicationId],
      });
      toast.success('Panel assessment invitation sent successfully');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to send invitation'
      );
    }
  };

  const handleCopyLink = async () => {
    try {
      if (applicationData?.status === ApplicationStatusEnum.ASSESSING) {
        toast.success('Assessment link generated successfully!');
      } else {
        toast.success('Assessment link generated successfully!');
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to generate assessment link'
      );
    }
  };

  const handleCompleteAssessment = async (): Promise<void> => {
    const panelAssessmentId =
      panelAssessmentSlots?.items?.[0]?.panelAssessmentId;

    if (!panelAssessmentId) {
      toast.error('No panel assessment found');
      return;
    }

    // Check if there's a selected slot
    const hasSelectedSlot = panelAssessmentSlots?.items?.some(
      (slot) => slot.isSelected
    );
    if (!hasSelectedSlot) {
      toast.error(
        'Candidate needs to select a time slot before assessment can be completed'
      );
      return;
    }

    // Check if panel assessment is already completed
    if (isPanelAssessmentCompleted) {
      toast.error('Panel assessment is already completed');
      return;
    }

    setIsCompletingAssessment(true);
    try {
      await clientPanelInterviewService.completePanelAssessment(
        panelAssessmentId
      );

      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({
        queryKey: ['scheduledInterviews'],
      });
      queryClient.invalidateQueries({
        queryKey: ['panelAssessmentSlots', applicationId],
      });

      toast.success('Panel assessment completed successfully');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to complete assessment'
      );
    } finally {
      setIsCompletingAssessment(false);
    }
  };
  // Check if AI assessment quota is expired
  if (usageSummary?.aiAssessments?.canCreate === false) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Card className="max-w-2xl border-none bg-transparent shadow-none hover:shadow-none">
          <div className="space-y-8 text-center">
            {/* Centered Icon */}
            <div className="relative mx-auto flex h-32 w-32 items-center justify-center">
              <div className="from-primary/10 to-primary/5 absolute inset-0 rounded-full bg-gradient-to-r"></div>
              <DollarSign className="text-primary h-16 w-16" />
            </div>

            {/* Content */}
            <div className="space-y-6">
              <div className="space-y-3">
                <h2 className="from-primary to-primary/80 bg-gradient-to-r bg-clip-text text-2xl font-bold text-transparent">
                  AI Assessment Plan Expired
                </h2>
                <p className="text-muted-foreground text-lg">
                  Your AI assessment subscription has reached its limit. Upgrade
                  your plan to continue using AI-powered candidate assessments.
                </p>
              </div>

              <div className="text-muted-foreground flex items-center justify-center gap-2 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>Assessment capabilities temporarily unavailable</span>
              </div>

              <div className="flex flex-col items-center justify-center gap-4">
                <Button
                  onClick={() =>
                    window.open('/app/client/subscription', '_blank')
                  }
                  className="bg-primary hover:bg-primary/90 gap-2"
                >
                  <DollarSign className="h-4 w-4" />
                  Upgrade Plan
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Card className="bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl font-semibold">
            <CalendarDays className="text-primary h-5 w-5" />
            Assessment Scheduling
          </CardTitle>
          <CardDescription>
            Manage and schedule assessments for this candidate
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Conditional content based on application status */}
          {/* Show pending approval message */}
          {applicationData?.status === ApplicationStatusEnum.APPLIED ||
          applicationData?.status === ApplicationStatusEnum.REVIEWING ? (
            /* Show message when candidate application is pending client approval */
            <Card className="border-yellow-200 bg-yellow-50 p-6 shadow-sm dark:border-yellow-800 dark:bg-yellow-900/20">
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="rounded-full bg-yellow-100 p-3 dark:bg-yellow-900/40">
                  <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-800 dark:text-yellow-300">
                    Candidate Application Pending Your Approval
                  </h3>
                  <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-400">
                    Please review the candidate&apos;s application and use the
                    Accept/Reject buttons above to make a decision. Once you
                    accept the candidate, you&apos;ll be able to schedule
                    interviews.
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Badge
                      variant="outline"
                      className="border-yellow-400 text-yellow-700 dark:border-yellow-600 dark:text-yellow-300"
                    >
                      Current Status: {applicationData?.status}
                    </Badge>
                    <span className="text-xs text-yellow-600 dark:text-yellow-400">
                      Use the Accept/Reject buttons above to proceed
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ) : // Show rejected/failed message
          applicationData?.status === ApplicationStatusEnum.REJECTED ||
            applicationData?.status === ApplicationStatusEnum.FAILED ||
            applicationData?.status === ApplicationStatusEnum.WITHDRAWN ||
            applicationData?.status === ApplicationStatusEnum.DECLINED ? (
            /* Show message when application is rejected or failed */
            <Card className="border-red-200 bg-red-50 p-6 shadow-sm dark:border-red-800 dark:bg-red-900/20">
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/40">
                  <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-red-800 dark:text-red-300">
                    Application{' '}
                    {applicationData?.status === ApplicationStatusEnum.REJECTED
                      ? 'Rejected'
                      : applicationData?.status === ApplicationStatusEnum.FAILED
                        ? 'Failed'
                        : applicationData?.status ===
                            ApplicationStatusEnum.WITHDRAWN
                          ? 'Withdrawn'
                          : 'Declined'}
                  </h3>
                  <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                    {applicationData?.status === ApplicationStatusEnum.REJECTED
                      ? 'This application has been rejected and assessment scheduling is no longer available.'
                      : applicationData?.status === ApplicationStatusEnum.FAILED
                        ? 'This application has failed and assessment scheduling is not available.'
                        : applicationData?.status ===
                            ApplicationStatusEnum.WITHDRAWN
                          ? 'The candidate has withdrawn their application. Assessment scheduling is no longer available.'
                          : 'The candidate has declined the application. Assessment scheduling is no longer available.'}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="border-red-400 text-red-700 dark:border-red-600 dark:text-red-300"
                    >
                      Current Status: {applicationData?.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          ) : // Show invited status message
          applicationData?.status === ApplicationStatusEnum.INVITED ? (
            /* Show message when candidate is invited but hasn't applied yet */
            <Card className="border-gray-200 bg-gray-50 p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/20">
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-900/40">
                  <Clock className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-300">
                    Candidate Invited - Waiting for Application
                  </h3>
                  <p className="mt-1 text-sm text-gray-700 dark:text-gray-400">
                    The candidate has been invited to apply for this position.
                    They need to complete their application before you can
                    schedule assessments. Once they apply and you accept their
                    application, you&apos;ll be able to schedule AI and panel
                    assessments.
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="border-gray-400 text-gray-700 dark:border-gray-600 dark:text-gray-300"
                    >
                      Current Status: {applicationData?.status}
                    </Badge>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      Waiting for candidate to apply
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ) : // Show assessment scheduling options when status allows it
          applicationData?.status === ApplicationStatusEnum.ACCEPTED ||
            applicationData?.status === ApplicationStatusEnum.SHORTLISTED ||
            applicationData?.status === ApplicationStatusEnum.ASSESSING ? (
            /* Show assessment scheduling options when accepted/shortlisted/assessing */
            <>
              {/* Quick Actions */}
              <TooltipProvider>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* AI Assessment Section */}
                  <div>
                    <Card className="p-4 shadow-sm transition-shadow hover:shadow-md dark:bg-gray-900/50">
                      <div className="mb-3 flex items-center gap-3">
                        <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-900/30">
                          <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <h3 className="font-medium dark:text-white">
                            AI Assessment
                          </h3>
                          <p className="text-muted-foreground text-sm dark:text-gray-400">
                            Automated screening assessment
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex flex-1 items-center justify-center">
                              <Button
                                onClick={() =>
                                  setIsAiAssessmentDialogOpen(true)
                                }
                                className="bg-primary w-full text-white disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 disabled:opacity-50 dark:bg-purple-600 dark:text-white dark:hover:bg-purple-700 dark:disabled:bg-gray-600 dark:disabled:text-gray-400"
                                disabled={
                                  (applicationData?.status as string) ===
                                    ApplicationStatusEnum.INVITED ||
                                  (applicationData?.status as string) ===
                                    ApplicationStatusEnum.DRAFT ||
                                  (applicationData?.status as string) ===
                                    ApplicationStatusEnum.REJECTED ||
                                  applicationData?.status ===
                                    ApplicationStatusEnum.ASSESSING ||
                                  hasAiAssessmentInvite
                                }
                              >
                                Schedule AI Assessment
                              </Button>
                            </div>
                          </TooltipTrigger>
                          {(applicationData?.status as string) ===
                            ApplicationStatusEnum.INVITED && (
                            <TooltipContent>
                              <p>
                                Candidate needs to accept AI assessment
                                invitation
                              </p>
                            </TooltipContent>
                          )}
                          {(applicationData?.status as string) ===
                            ApplicationStatusEnum.DRAFT && (
                            <TooltipContent>
                              <p>Application is in draft status</p>
                            </TooltipContent>
                          )}
                          {(applicationData?.status as string) ===
                            ApplicationStatusEnum.REJECTED && (
                            <TooltipContent>
                              <p>Application has been rejected</p>
                            </TooltipContent>
                          )}
                          {applicationData?.status ===
                            ApplicationStatusEnum.ASSESSING && (
                            <TooltipContent>
                              <p>AI assessment has not started yet</p>
                            </TooltipContent>
                          )}
                        </Tooltip>

                        {applicationData?.status ===
                          ApplicationStatusEnum.ASSESSING && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                onClick={handleCopyLink}
                                variant="outline"
                                size="icon"
                                className="border-purple-200 text-purple-600 hover:bg-purple-50 dark:border-purple-400 dark:text-purple-400 dark:hover:bg-purple-900/20"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                {applicationData?.status ===
                                ApplicationStatusEnum.ASSESSING
                                  ? 'Generate assessment link'
                                  : 'Copy assessment link'}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </Card>

                    <Collapsible className="mt-3">
                      <div className="border-primary/20 dark:border-primary/20 overflow-hidden rounded-md border shadow-sm transition-shadow hover:shadow-md">
                        {aiAssessmentInvite ? (
                          <div className="flex flex-col">
                            <div className="bg-primary/5 dark:bg-primary/5 flex items-center justify-between border-b p-4 shadow-sm">
                              <div className="flex items-center gap-3">
                                <div className="bg-primary/10 dark:bg-primary/5 rounded-full p-2">
                                  <CalendarDays className="text-primary dark:text-primary h-5 w-5" />
                                </div>
                                <div>
                                  <h4 className="text-primary dark:text-primary font-semibold">
                                    AI Assessment Slot
                                  </h4>
                                  <p className="text-muted-foreground text-sm">
                                    1 slot Created
                                  </p>
                                </div>
                              </div>
                              <CollapsibleTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="hover:bg-primary/10 dark:hover:bg-primary/5 flex items-center gap-2"
                                >
                                  View Details
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                              </CollapsibleTrigger>
                            </div>
                            <CollapsibleContent>
                              <div className="divide-y">
                                <div className="hover:bg-primary/10 dark:hover:bg-primary/5 flex items-center justify-between p-4 transition-colors">
                                  <div>
                                    <div className="flex items-center gap-6">
                                      <div className="bg-primary/10 dark:bg-primary/5 flex h-12 w-12 items-center justify-center rounded-full">
                                        <Clock className="text-primary dark:text-primary h-6 w-6" />
                                      </div>
                                      <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                          <h5 className="text-primary dark:text-primary font-medium">
                                            Expires in 72 hours
                                          </h5>
                                        </div>
                                        <p className="text-muted-foreground flex items-center gap-2 text-sm">
                                          <Clock className="h-4 w-4" />
                                          Created at{' '}
                                          {formatDateAndTime(
                                            aiAssessmentInvite.createdAt
                                          )}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      variant="outline"
                                      className="bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/5 dark:text-primary dark:hover:bg-primary/10"
                                    >
                                      {formatEnumValue(
                                        aiAssessmentInvite.status
                                      )}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </CollapsibleContent>
                          </div>
                        ) : (
                          <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                            <CalendarCheck className="mx-auto mb-2 h-12 w-12 text-gray-300 dark:text-gray-600" />
                            <p>No AI Assessment Scheduled yet</p>
                            <p className="text-sm">
                              Use the scheduling options above to set up
                              assessments
                            </p>
                          </div>
                        )}
                      </div>
                    </Collapsible>
                  </div>

                  {/* Panel Assessment Section */}
                  <div>
                    <Card className="p-4 shadow-sm transition-shadow hover:shadow-md dark:bg-gray-900/50">
                      <div className="mb-3 flex items-center gap-3">
                        <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-900/30">
                          <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <h3 className="font-medium dark:text-white">
                            Panel Assessment
                          </h3>
                          <p className="text-muted-foreground text-sm dark:text-gray-400">
                            Live assessment with the team
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-center">
                        <Button
                          disabled={
                            (applicationData?.status as string) ===
                              ApplicationStatusEnum.INVITED ||
                            (applicationData?.status as string) ===
                              ApplicationStatusEnum.DRAFT ||
                            (applicationData?.status as string) ===
                              ApplicationStatusEnum.REJECTED ||
                            applicationData?.status ===
                              ApplicationStatusEnum.ASSESSING ||
                            panelAssessmentSlots?.items?.length !== 0
                          }
                          onClick={() => setIsPanelAssessmentDialogOpen(true)}
                          variant="default"
                          className="bg-primary w-full text-white disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 dark:bg-purple-600 dark:text-white dark:hover:bg-purple-700 dark:disabled:bg-gray-600 dark:disabled:text-gray-400"
                        >
                          Schedule Panel Assessment
                        </Button>
                      </div>
                    </Card>
                    <Collapsible className="mt-3">
                      <div className="border-primary/20 dark:border-primary/20 overflow-hidden rounded-md border shadow-sm transition-shadow hover:shadow-md">
                        {panelAssessmentSlots?.items &&
                        panelAssessmentSlots?.items?.length > 0 ? (
                          <>
                            <div className="flex flex-col">
                              <div className="bg-primary/5 dark:bg-primary/5 flex items-center justify-between border-b p-4 shadow-sm">
                                <div className="flex items-center gap-3">
                                  <div className="bg-primary/10 dark:bg-primary/5 rounded-full p-2">
                                    <CalendarDays className="text-primary dark:text-primary h-5 w-5" />
                                  </div>
                                  <div>
                                    <h4 className="text-primary dark:text-primary font-semibold">
                                      Panel Assessment Slots
                                    </h4>
                                    <p className="text-muted-foreground text-sm">
                                      {panelAssessmentSlots.items.length} slot
                                      {panelAssessmentSlots.items.length > 1
                                        ? 's'
                                        : ''}{' '}
                                      Created
                                    </p>
                                  </div>
                                </div>
                                <CollapsibleTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="hover:bg-primary/10 dark:hover:bg-primary/5 flex items-center gap-2"
                                  >
                                    View Details
                                    <ChevronDown className="h-4 w-4" />
                                  </Button>
                                </CollapsibleTrigger>
                              </div>
                              <CollapsibleContent>
                                <div className="divide-y">
                                  {panelAssessmentSlots?.items?.map((slot) => (
                                    <div
                                      key={slot.id}
                                      className="hover:bg-primary/10 dark:hover:bg-primary/5 flex items-center justify-between p-4 transition-colors"
                                    >
                                      <div>
                                        <div className="flex items-center gap-6">
                                          <div className="bg-primary/10 dark:bg-primary/5 flex h-12 w-12 items-center justify-center rounded-full">
                                            <Clock className="text-primary dark:text-primary h-6 w-6" />
                                          </div>
                                          <div className="space-y-1">
                                            <div className="flex items-center gap-3">
                                              <h5 className="text-primary dark:text-primary font-medium">
                                                {formatDate(slot.startDateTime)}
                                              </h5>
                                              <Badge
                                                variant="secondary"
                                                className="bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/5 dark:text-primary dark:hover:bg-primary/10"
                                              >
                                                {calculateDuration(
                                                  slot.startDateTime,
                                                  slot.endDateTime
                                                )}
                                              </Badge>
                                            </div>
                                            <p className="text-muted-foreground flex items-center gap-2 text-sm">
                                              <Clock className="h-4 w-4" />
                                              Starts at{' '}
                                              {formatDateAndTime(
                                                slot.startDateTime
                                              )}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Badge
                                          variant="outline"
                                          className="bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/5 dark:text-primary dark:hover:bg-primary/10"
                                        >
                                          {formatEnumValue(slot.status)}
                                        </Badge>
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                {/* Action Buttons Section */}
                                <div className="border-t bg-gray-50 p-4 dark:bg-gray-800/50">
                                  <div className="flex gap-3">
                                    {/* Complete Assessment Button */}
                                    <Button
                                      className="bg-primary hover:bg-primary/90 flex-1 rounded-lg px-6 py-4 text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 disabled:opacity-50 disabled:shadow-none dark:bg-purple-600 dark:text-white dark:hover:bg-purple-700 dark:disabled:bg-gray-600 dark:disabled:text-gray-400"
                                      onClick={handleCompleteAssessment}
                                      disabled={
                                        !panelAssessmentSlots?.items?.some(
                                          (slot) => slot.isSelected
                                        ) ||
                                        isPanelAssessmentCompleted ||
                                        isCompletingAssessment
                                      }
                                    >
                                      <CheckCircle className="mr-2 h-4 w-4" />
                                      {isCompletingAssessment
                                        ? 'Completing...'
                                        : 'Complete Assessment'}
                                    </Button>

                                    {/* Submit Feedback Button */}
                                    <Button
                                      className="bg-primary hover:bg-primary/90 flex-1 rounded-lg px-6 py-4 text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 disabled:opacity-50 disabled:shadow-none dark:bg-purple-600 dark:text-white dark:hover:bg-purple-700 dark:disabled:bg-gray-600 dark:disabled:text-gray-400"
                                      onClick={handleFeedback}
                                      disabled={
                                        !panelAssessmentSlots?.items?.some(
                                          (slot) => slot.isSelected
                                        ) ||
                                        !isPanelAssessmentCompleted ||
                                        hasCurrentUserSubmittedFeedback
                                      }
                                    >
                                      Submit Feedback
                                    </Button>
                                  </div>

                                  {/* Status Messages */}
                                  {!panelAssessmentSlots?.items?.some(
                                    (slot) => slot.isSelected
                                  ) && (
                                    <p className="mt-2 text-center text-xs text-gray-500">
                                      Waiting for candidate to select a time
                                      slot
                                    </p>
                                  )}
                                  {panelAssessmentSlots?.items?.some(
                                    (slot) => slot.isSelected
                                  ) &&
                                    isPanelAssessmentCompleted && (
                                      <p className="mt-2 text-center text-xs text-green-600">
                                        ✓ Panel assessment has been completed
                                      </p>
                                    )}

                                  {panelAssessmentSlots?.items?.some(
                                    (slot) => slot.isSelected
                                  ) &&
                                    !isPanelAssessmentCompleted && (
                                      <p className="mt-2 text-center text-xs text-gray-500">
                                        Complete the assessment before
                                        submitting feedback
                                      </p>
                                    )}
                                  {panelAssessmentSlots?.items?.some(
                                    (slot) => slot.isSelected
                                  ) &&
                                    isPanelAssessmentCompleted &&
                                    hasCurrentUserSubmittedFeedback && (
                                      <p className="mt-2 text-center text-xs text-gray-500">
                                        You have already submitted feedback for
                                        this assessment
                                      </p>
                                    )}

                                  {/* View Feedback Button */}
                                  {panelAssessmentFeedback?.items &&
                                    panelAssessmentFeedback?.items.length >
                                      0 && (
                                      <div className="mt-4 border-t pt-4">
                                        <Button
                                          variant="outline"
                                          className="bg-primary hover:bg-primary/90 w-full rounded-lg px-6 py-4 text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 disabled:opacity-50 disabled:shadow-none dark:bg-purple-600 dark:text-white dark:hover:bg-purple-700 dark:disabled:bg-gray-600 dark:disabled:text-gray-400"
                                          onClick={() =>
                                            setIsAllFeedbackDialogOpen(true)
                                          }
                                        >
                                          <Eye className="mr-2 h-4 w-4" />
                                          View Feedback (
                                          {
                                            panelAssessmentFeedback?.items
                                              .length
                                          }
                                          )
                                        </Button>
                                      </div>
                                    )}
                                </div>
                              </CollapsibleContent>
                            </div>
                          </>
                        ) : (
                          <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                            <CalendarCheck className="mx-auto mb-2 h-12 w-12 text-gray-300 dark:text-gray-600" />
                            <p>No Panel Assessment Scheduled yet</p>
                            <p className="text-sm">
                              Use the scheduling options above to set up
                              assessments
                            </p>
                          </div>
                        )}
                      </div>
                    </Collapsible>
                  </div>
                </div>
              </TooltipProvider>
            </>
          ) : (
            /* Fallback for any other status */
            <Card className="border-gray-200 bg-gray-50 p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/20">
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-900/40">
                  <Clock className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-300">
                    Assessment Scheduling Unavailable
                  </h3>
                  <p className="mt-1 text-sm text-gray-700 dark:text-gray-400">
                    Assessment scheduling is not available for the current
                    application status. Please accept the application first to
                    enable assessment scheduling.
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="border-gray-400 text-gray-700 dark:border-gray-600 dark:text-gray-300"
                    >
                      Current Status: {applicationData?.status || 'Unknown'}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Schedule Assessment Dialog */}
      <PanelAssessmentDialog
        jobApplicationId={applicationData?.id ?? ''}
        isOpen={isPanelAssessmentDialogOpen}
        onOpenChange={setIsPanelAssessmentDialogOpen}
        onSendInvitation={handleSendInvitation}
      />
      <AiAssessmentDialog
        candidateId={applicationData?.userId ?? ''}
        jobApplicationId={applicationData?.id ?? ''}
        isOpen={isAiAssessmentDialogOpen}
        onOpenChange={setIsAiAssessmentDialogOpen}
        onSuccess={() => {
          setShouldFetch(true);
          queryClient.refetchQueries({
            queryKey: [
              'aiAssessmentInvite',
              applicationId,
              applicationData?.userId,
            ],
          });
        }}
      />
      {/* All Feedback Dialog */}
      <AllFeedbackDialog
        isOpen={isAllFeedbackDialogOpen}
        onOpenChange={setIsAllFeedbackDialogOpen}
        feedbackList={panelAssessmentFeedback?.items || []}
      />
    </>
  );
};

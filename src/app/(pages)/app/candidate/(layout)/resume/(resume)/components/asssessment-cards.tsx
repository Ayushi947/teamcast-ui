'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, ArrowUpRight, Clock } from 'lucide-react';
import {
  ICandidateProfile,
  IResumeAssessment,
  CandidateResumeAssessmentStatusEnum,
  CandidateOnboardingAssessmentStatusEnum,
  ResumeAssessmentRecommendationEnum,
  ICandidateOnboardingAssessment,
  OnboardingAssessmentRecommendationEnum,
  OnboardingAssessmentStatusEnum,
  ResumeAssessmentResultEnum,
  ICandidateJobAiAssessment,
  JobAiAssessmentStatusEnum,
} from '@/lib/shared';
import { cn, enumToReadableText, formatEnumValue } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { OnboardingDetailedDialog } from './dialog/onboarding-detailed-dialog';
import { JobAiAssessmentDetailedDialog } from './dialog/job-ai-assessment-detailed-dialog';
import {
  ResumeAssessmentIcon,
  OnboardAssessmentIcon,
} from '@/components/icons';
import AIPoweredLogo from '@/components/app/common/animations/ai-powered-logo';
import { candidateJobAiAssessmentService } from '@/lib/services/services';
import { toast } from 'sonner';
import { logger } from '@/lib/shared';

interface AssessmentCardsProps {
  profile: ICandidateProfile;
  resumeAssessment?: IResumeAssessment;
  onboardingAssessment?: ICandidateOnboardingAssessment;
  isStartingResumeAssessment: boolean;
  isStartingOnboardingAssessment: boolean;
  onStartResumeAssessment: () => void;
  onStartOnboardingAssessment: () => void;
  onViewResumeAssessment: () => void;
  jobAiAssessmentInvitationId?: string | null;
  jobAiAssessmentInvitation?: any | null;
}

export const AssessmentCards = ({
  onboardingAssessment,
  profile,
  resumeAssessment,
  isStartingResumeAssessment,
  isStartingOnboardingAssessment,
  onStartResumeAssessment,
  onStartOnboardingAssessment,
  onViewResumeAssessment,
  jobAiAssessmentInvitationId = null,
  jobAiAssessmentInvitation = null,
}: AssessmentCardsProps) => {
  const router = useRouter();

  const [onboardingAssessmentOpen, setOnboardingAssessmentOpen] =
    useState(false);
  const [jobAiAssessmentOpen, setJobAiAssessmentOpen] = useState(false);
  const [jobAiAssessment, setJobAiAssessment] =
    useState<ICandidateJobAiAssessment | null>(null);
  const [isStartingJobAiAssessment, setIsStartingJobAiAssessment] =
    useState(false);

  const resumeAssessmentCompleted =
    profile.resumeAssessmentStatus ===
    CandidateResumeAssessmentStatusEnum.ASSESSMENT_COMPLETED;

  // Show Job AI Assessment card if there's an accepted application (status = APPLIED or higher)
  // This replaces the previous logic that relied on isInviteSignupCandidate
  const shouldShowJobAiAssessment = !!(
    jobAiAssessmentInvitation &&
    jobAiAssessmentInvitation.jobApplicationAcceptedAt &&
    jobAiAssessmentInvitation.jobApplicationStatus &&
    [
      'APPLIED',
      'REVIEWING',
      'SHORTLISTED',
      'ASSESSING',
      'OFFERED',
      'ACCEPTED',
    ].includes(jobAiAssessmentInvitation.jobApplicationStatus)
  );
  const jobAiAssessmentStatus = jobAiAssessmentInvitation?.assessmentStatus as
    | JobAiAssessmentStatusEnum
    | undefined;
  const inProgressAssessmentStatuses: JobAiAssessmentStatusEnum[] = [
    JobAiAssessmentStatusEnum.AI_INITIALIZATION_IN_PROGRESS,
    JobAiAssessmentStatusEnum.AI_INITIALIZATION_COMPLETED,
    JobAiAssessmentStatusEnum.CANDIDATE_ASSESSMENT_IN_PROGRESS,
    JobAiAssessmentStatusEnum.AI_REVIEW_IN_PROGRESS,
    JobAiAssessmentStatusEnum.MANUAL_REVIEW_IN_PROGRESS,
  ];
  const completedAssessmentStatuses: JobAiAssessmentStatusEnum[] = [
    JobAiAssessmentStatusEnum.CANDIDATE_ASSESSMENT_COMPLETED,
    JobAiAssessmentStatusEnum.AI_REVIEW_COMPLETED,
    JobAiAssessmentStatusEnum.MANUAL_REVIEW_COMPLETED,
    JobAiAssessmentStatusEnum.ASSESSMENT_COMPLETED,
  ];
  const failedAssessmentStatuses: JobAiAssessmentStatusEnum[] = [
    JobAiAssessmentStatusEnum.ASSESSMENT_FAILED,
  ];
  const isJobAiInProgress =
    jobAiAssessmentStatus &&
    inProgressAssessmentStatuses.includes(jobAiAssessmentStatus);
  const isJobAiCompleted =
    jobAiAssessmentStatus &&
    completedAssessmentStatuses.includes(jobAiAssessmentStatus);
  const isJobAiFailed =
    jobAiAssessmentStatus &&
    failedAssessmentStatuses.includes(jobAiAssessmentStatus);
  const hasJobAiAssessmentId = !!jobAiAssessmentInvitation?.assessmentId;

  // Handle starting Job AI Assessment (same logic as interviews page)
  const handleStartJobAiAssessment = async () => {
    if (!jobAiAssessmentInvitationId) {
      toast.error('Assessment invitation not found');
      return;
    }

    setIsStartingJobAiAssessment(true);
    try {
      const responseUrl =
        await candidateJobAiAssessmentService.getJobAiAssessmentInvitationUrl(
          jobAiAssessmentInvitationId
        );
      if (typeof responseUrl === 'string' && responseUrl.trim()) {
        window.location.href = responseUrl;
      } else {
        toast.error('Assessment not found');
      }
    } catch (error: any) {
      logger.error('Error starting Job AI Assessment:', error);
      // Handle specific error cases (same as interviews page)
      if (error?.response?.status === 403) {
        const errorMessage =
          error?.response?.data?.message || error?.message || '';

        // Check if the error is about Resume Assessment not being completed
        if (errorMessage.toLowerCase().includes('resume assessment')) {
          toast.error('Please complete your Resume Assessment first.');
        } else {
          // Other 403 errors (e.g., invite not accepted)
          toast.error(
            'You must accept the assessment invite before starting the assessment. Please check your assessment invites page.'
          );
        }
      } else if (error?.response?.status === 404) {
        toast.error('Assessment invitation not found');
      } else {
        toast.error(
          error instanceof Error
            ? error.message
            : 'Error starting AI assessment'
        );
      }
    } finally {
      setIsStartingJobAiAssessment(false);
    }
  };

  // Fetch job AI assessment when invitation has an assessment ID
  // We'll check the actual assessment status from the fetched data
  React.useEffect(() => {
    const fetchJobAiAssessment = async () => {
      const completedStatuses = [
        JobAiAssessmentStatusEnum.CANDIDATE_ASSESSMENT_COMPLETED,
        JobAiAssessmentStatusEnum.AI_REVIEW_COMPLETED,
        JobAiAssessmentStatusEnum.MANUAL_REVIEW_COMPLETED,
        JobAiAssessmentStatusEnum.ASSESSMENT_COMPLETED,
      ];

      const assessmentStatus = jobAiAssessmentInvitation?.assessmentStatus as
        | JobAiAssessmentStatusEnum
        | undefined;
      const isStatusCompleted =
        assessmentStatus && completedStatuses.includes(assessmentStatus);

      logger.info('Checking assessment status', {
        assessmentId: jobAiAssessmentInvitation?.assessmentId,
        assessmentStatus,
        isStatusCompleted,
      });

      // If we have assessmentId, always try to fetch the full assessment
      // This ensures we get the most up-to-date status
      if (jobAiAssessmentInvitation?.assessmentId) {
        try {
          logger.info(
            'Fetching job AI assessment:',
            jobAiAssessmentInvitation.assessmentId
          );
          const assessment =
            await candidateJobAiAssessmentService.getAssessment(
              jobAiAssessmentInvitation.assessmentId
            );
          logger.info('Fetched assessment status:', assessment.status);

          if (completedStatuses.includes(assessment.status)) {
            logger.info('Setting completed assessment data');
            setJobAiAssessment(assessment);
          } else {
            logger.info(
              'Assessment not completed yet, status:',
              assessment.status
            );
            setJobAiAssessment(null);
          }
        } catch (error) {
          logger.error('Error fetching job AI assessment:', error);
          // If fetch fails but status indicates completion, keep null
          // The UI will show loading state
          setJobAiAssessment(null);
        }
      } else if (isStatusCompleted) {
        logger.info('Invitation has completed status but no assessmentId', {
          jobApplicationId: jobAiAssessmentInvitation?.jobApplicationId,
          assessmentStatus,
        });
        // Keep jobAiAssessment as null - the UI will show completed state based on status
        setJobAiAssessment(null);
      } else {
        // No assessmentId and status doesn't indicate completion
        setJobAiAssessment(null);
      }
    };

    fetchJobAiAssessment();
  }, [
    jobAiAssessmentInvitation?.assessmentId,
    jobAiAssessmentInvitation?.assessmentStatus,
  ]);

  const getResumeBadgeColor = (
    recommendation: ResumeAssessmentRecommendationEnum
  ) => {
    if (recommendation === ResumeAssessmentRecommendationEnum.RECOMMENDED) {
      return 'bg-green-100 text-green-800 font-semibold border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-700';
    }
    if (
      recommendation === ResumeAssessmentRecommendationEnum.HIGHLY_RECOMMENDED
    ) {
      return 'bg-green-100 text-green-800 font-semibold border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-700';
    }
    return 'bg-red-100 text-red-800 font-semibold border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-700';
  };

  const getOnboardingBadgeColor = (
    recommendation: OnboardingAssessmentRecommendationEnum
  ) => {
    if (recommendation === OnboardingAssessmentRecommendationEnum.RECOMMENDED) {
      return 'bg-green-100 text-green-800 font-semibold border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-700';
    }
    if (
      recommendation ===
      OnboardingAssessmentRecommendationEnum.HIGHLY_RECOMMENDED
    ) {
      return 'bg-green-100 text-green-800 font-semibold border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-700';
    }
    return 'bg-red-100 text-red-800 font-semibold border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-700';
  };

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* AI Resume Assessment */}
        <div data-tour="resume-assessment-section">
          <Card className="flex h-full flex-col overflow-hidden bg-white dark:bg-gray-800">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="flex items-center gap-4 text-xl dark:text-white">
                  <p>Resume Assessment</p>
                  <AIPoweredLogo />
                </CardTitle>
                <div className="flex items-end gap-2">
                  {profile.resumeAssessmentStatus &&
                  profile.resumeAssessmentStatus ===
                    CandidateResumeAssessmentStatusEnum.ASSESSMENT_COMPLETED ? (
                    <div
                      className={cn(
                        'rounded-full border px-2.5 py-0.5 text-center text-xs font-normal',
                        getResumeBadgeColor(
                          resumeAssessment?.recommendation as ResumeAssessmentRecommendationEnum
                        )
                      )}
                    >
                      {formatEnumValue(
                        resumeAssessment?.recommendation as string
                      )}
                    </div>
                  ) : (
                    <div className="rounded-full border border-green-500 px-2.5 py-0.5 text-center text-xs font-normal text-green-500 dark:border-green-600 dark:text-green-400">
                      Not Done
                    </div>
                  )}
                </div>
              </div>
              <CardDescription className="dark:text-gray-400">
                Transform your resume with expert AI analysis and personalized
                improvement tips.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col p-6">
              {profile.resumeAssessmentStatus ===
              CandidateResumeAssessmentStatusEnum.ASSESSMENT_COMPLETED ? (
                <div className="flex h-full flex-col">
                  {resumeAssessment?.overallFeedback ? (
                    <div className="border-muted bg-background text-muted-foreground rounded-lg border p-4 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300">
                      {resumeAssessment.overallFeedback}
                    </div>
                  ) : (
                    <div className="flex flex-1 items-center justify-center">
                      <ResumeAssessmentIcon width={200} height={200} />
                    </div>
                  )}

                  <div className="mt-auto flex flex-col justify-center gap-4 pt-4">
                    <div className="flex justify-center">
                      <Button
                        className="w-fit"
                        onClick={onViewResumeAssessment}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Detailed Resume Assessment
                      </Button>
                    </div>
                  </div>
                </div>
              ) : profile.completionPercentage < 80 || !profile.image ? (
                <div className="flex h-full flex-col">
                  <div className="flex flex-1 items-center justify-center">
                    <ResumeAssessmentIcon width={200} height={200} />
                  </div>

                  <div className="mt-auto flex flex-col items-center justify-center gap-4">
                    <div className="max-w-md">
                      <p className="text-muted-foreground text-md text-center dark:text-gray-400">
                        {!profile.image
                          ? 'Upload a profile photo and complete your profile to 80% or above to unlock resume assessment.'
                          : 'Complete your profile to 80% or above to unlock resume assessment.'}
                      </p>
                    </div>
                    {/* Start Resume Assessment Button with Tooltip if disabled */}
                    {profile.completionPercentage < 80 || !profile.image ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span data-tour="resume-assessment-start-button">
                            <Button
                              className={'w-fit cursor-not-allowed opacity-50'}
                              onClick={(e) => e.preventDefault()}
                              disabled
                            >
                              <ArrowUpRight className="mr-2 h-4 w-4" />
                              Start Resume Assessment
                            </Button>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          {!profile.image
                            ? 'Upload a profile photo and complete your profile to at least 80% to unlock resume assessment.'
                            : 'Complete your profile to at least 80% to unlock resume assessment.'}
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <div data-tour="resume-assessment-start-button">
                        <Button
                          className="w-fit"
                          onClick={(e) => {
                            if (isStartingResumeAssessment) {
                              e.preventDefault();
                              return;
                            }
                            onStartResumeAssessment();
                          }}
                          disabled={isStartingResumeAssessment}
                        >
                          <ArrowUpRight className="mr-2 h-4 w-4" />
                          Start Resume Assessment
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex h-full flex-col">
                  <div className="flex flex-1 items-center justify-center">
                    <ResumeAssessmentIcon width={200} height={200} />
                  </div>

                  <div className="mt-auto flex flex-col items-center justify-center gap-4">
                    <div className="max-w-md">
                      <p className="text-muted-foreground text-md text-center dark:text-gray-400">
                        Get personalized insights and recommendations to
                        optimize your resume for better job matches
                      </p>
                    </div>
                    <div data-tour="resume-assessment-start-button">
                      <Button
                        className="w-fit"
                        onClick={(e) => {
                          // Prevent action if button is disabled
                          if (isStartingResumeAssessment) {
                            e.preventDefault();
                            return;
                          }
                          onStartResumeAssessment();
                        }}
                        disabled={isStartingResumeAssessment}
                      >
                        <ArrowUpRight className="mr-2 h-4 w-4" />
                        Start Resume Assessment
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Screening Assessment / Job AI Assessment */}
        <div data-tour="screening-assessment-section">
          <Card className="flex h-full flex-col overflow-hidden bg-white dark:bg-gray-800">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="flex flex-col gap-1 text-xl dark:text-white">
                  <div className="flex items-center gap-4">
                    <p>
                      {shouldShowJobAiAssessment
                        ? 'Job AI Assessment'
                        : 'Screening Assessment'}
                    </p>
                    <AIPoweredLogo />
                  </div>
                  {shouldShowJobAiAssessment &&
                    jobAiAssessmentInvitation?.jobTitle && (
                      <p className="text-muted-foreground text-sm font-normal dark:text-gray-400">
                        <b>{jobAiAssessmentInvitation.jobTitle}</b>
                      </p>
                    )}
                </CardTitle>
                <div className="flex items-end gap-2">
                  {shouldShowJobAiAssessment ? (
                    jobAiAssessment || isJobAiCompleted ? (
                      <div className="rounded-full border border-green-500 px-2.5 py-0.5 text-center text-xs font-normal text-green-500 dark:border-green-600 dark:text-green-400">
                        Completed
                      </div>
                    ) : isJobAiFailed ? (
                      <div className="rounded-full border border-red-500 px-2.5 py-0.5 text-center text-xs font-normal text-red-500 dark:border-red-600 dark:text-red-400">
                        Failed
                      </div>
                    ) : isJobAiInProgress ? (
                      <div className="rounded-full border border-amber-500 px-2.5 py-0.5 text-center text-xs font-normal text-amber-500 dark:border-amber-600 dark:text-amber-400">
                        In Progress
                      </div>
                    ) : (
                      <div className="rounded-full border border-green-500 px-2.5 py-0.5 text-center text-xs font-normal text-green-500 dark:border-green-600 dark:text-green-400">
                        Not Done
                      </div>
                    )
                  ) : profile?.onboardingAssessmentStatus ===
                    CandidateOnboardingAssessmentStatusEnum.ASSESSMENT_COMPLETED ? (
                    <div
                      className={cn(
                        'rounded-full border px-2 py-1 text-center text-xs font-normal',
                        getOnboardingBadgeColor(
                          onboardingAssessment?.recommendation as OnboardingAssessmentRecommendationEnum
                        )
                      )}
                    >
                      {enumToReadableText(
                        onboardingAssessment?.recommendation as string
                      )}
                    </div>
                  ) : profile.onboardingAssessmentStatus ===
                    CandidateOnboardingAssessmentStatusEnum.ASSESSMENT_IN_PROGRESS ? (
                    <div className="rounded-full border border-amber-500 px-2.5 py-0.5 text-center text-xs font-normal text-amber-500 dark:border-amber-600 dark:text-amber-400">
                      In Progress
                    </div>
                  ) : (
                    <div className="rounded-full border border-green-500 px-2.5 py-0.5 text-center text-xs font-normal text-green-500 dark:border-green-600 dark:text-green-400">
                      Not Done
                    </div>
                  )}
                </div>
              </div>
              <CardDescription className="dark:text-gray-400">
                {shouldShowJobAiAssessment
                  ? jobAiAssessmentInvitation?.jobTitle
                    ? `Complete the AI-powered assessment for ${jobAiAssessmentInvitation.jobTitle} to showcase your skills and experience.`
                    : 'Complete the AI-powered assessment for your job application to showcase your skills and experience.'
                  : 'Complete a comprehensive assessment to showcase your skills and experience.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col p-6">
              {shouldShowJobAiAssessment ? (
                jobAiAssessmentInvitationId && jobAiAssessmentInvitation ? (
                  jobAiAssessment ? (
                    // Show completed assessment with View Details button
                    <div className="flex h-full flex-col">
                      {jobAiAssessment?.overallFeedback ? (
                        <div className="border-muted bg-background text-muted-foreground rounded-lg border p-4 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300">
                          {jobAiAssessment.overallFeedback}
                        </div>
                      ) : (
                        <div className="flex flex-1 items-center justify-center">
                          <OnboardAssessmentIcon width={200} height={200} />
                        </div>
                      )}

                      <div className="mt-auto flex flex-col justify-center gap-4 pt-4">
                        <div className="flex justify-center">
                          <Button
                            className="w-fit"
                            onClick={() => setJobAiAssessmentOpen(true)}
                            disabled={!jobAiAssessment}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Detailed Job AI Assessment
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    (() => {
                      if (isJobAiInProgress) {
                        return (
                          <div className="flex h-full flex-col">
                            <div className="flex flex-1 items-center justify-center">
                              <OnboardAssessmentIcon width={200} height={200} />
                            </div>
                            <div className="border-muted bg-muted/20 mt-6 rounded-lg border p-4">
                              <p className="text-muted-foreground text-sm leading-relaxed">
                                Your Job AI Assessment is currently in progress.
                                You can continue from where you left off or wait
                                for the assessment to complete.
                              </p>
                            </div>
                            <div className="mt-auto flex justify-center pt-4">
                              {hasJobAiAssessmentId ? (
                                resumeAssessmentCompleted ? (
                                  <Button
                                    className="w-fit"
                                    onClick={handleStartJobAiAssessment}
                                    disabled={isStartingJobAiAssessment}
                                  >
                                    {isStartingJobAiAssessment ? (
                                      <>
                                        <Clock className="mr-2 h-4 w-4 animate-spin" />
                                        Loading...
                                      </>
                                    ) : (
                                      <>
                                        <ArrowUpRight className="mr-2 h-4 w-4" />
                                        Continue Assessment
                                      </>
                                    )}
                                  </Button>
                                ) : (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span>
                                        <Button
                                          className="w-fit cursor-not-allowed opacity-50"
                                          disabled
                                        >
                                          <ArrowUpRight className="mr-2 h-4 w-4" />
                                          Continue Assessment
                                        </Button>
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                      Complete your resume assessment before
                                      continuing Job AI assessment.
                                    </TooltipContent>
                                  </Tooltip>
                                )
                              ) : (
                                <div className="text-muted-foreground text-sm">
                                  Assessment is being processed...
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      }
                      if (isJobAiCompleted) {
                        const assessment =
                          jobAiAssessment as ICandidateJobAiAssessment | null;
                        return (
                          <div className="flex h-full flex-col">
                            {assessment?.overallFeedback ? (
                              <div className="border-muted bg-background text-muted-foreground rounded-lg border p-4 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                {assessment.overallFeedback}
                              </div>
                            ) : (
                              <div className="flex flex-1 items-center justify-center">
                                <OnboardAssessmentIcon
                                  width={200}
                                  height={200}
                                />
                              </div>
                            )}
                            <div className="mt-auto flex flex-col justify-center gap-4 pt-4">
                              <div className="flex justify-center">
                                {assessment ? (
                                  <Button
                                    className="w-fit"
                                    onClick={() => setJobAiAssessmentOpen(true)}
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Detailed Job AI Assessment
                                  </Button>
                                ) : (
                                  <div className="text-muted-foreground text-sm">
                                    <Clock className="mr-2 inline h-4 w-4 animate-spin" />
                                    Loading assessment details...
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      }
                      if (isJobAiFailed) {
                        return (
                          <div className="flex h-full flex-col">
                            <div className="flex flex-1 items-center justify-center">
                              <OnboardAssessmentIcon width={200} height={200} />
                            </div>
                            <div className="border-muted bg-background text-muted-foreground rounded-lg border p-4 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300">
                              Your Job AI Assessment encountered an issue.
                              Please try again or contact support if the problem
                              persists.
                            </div>
                            <div className="mt-auto flex justify-center pt-4">
                              {resumeAssessmentCompleted ? (
                                <Button
                                  className="w-fit"
                                  onClick={handleStartJobAiAssessment}
                                  disabled={isStartingJobAiAssessment}
                                >
                                  {isStartingJobAiAssessment ? (
                                    <>
                                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                                      Retrying...
                                    </>
                                  ) : (
                                    <>
                                      <ArrowUpRight className="mr-2 h-4 w-4" />
                                      Retry Assessment
                                    </>
                                  )}
                                </Button>
                              ) : (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span>
                                      <Button
                                        className="w-fit cursor-not-allowed opacity-50"
                                        disabled
                                      >
                                        <ArrowUpRight className="mr-2 h-4 w-4" />
                                        Retry Assessment
                                      </Button>
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    Complete your resume assessment before
                                    retrying Job AI assessment.
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          </div>
                        );
                      }
                      // Fall through to start button if no assessmentId/status
                      return null;
                    })() || (
                      // Job AI Assessment flow for invited candidates - Start button
                      <div className="flex h-full flex-col">
                        <div className="flex flex-1 items-center justify-center">
                          <OnboardAssessmentIcon width={200} height={200} />
                        </div>

                        <div className="mt-auto flex flex-col items-center justify-center gap-4 pt-4">
                          <div className="max-w-md">
                            <p className="text-muted-foreground text-md text-center dark:text-gray-400">
                              Complete the AI-powered assessment for your job
                              application to showcase your skills, experience,
                              and fit for the role.
                            </p>
                          </div>
                          <div data-tour="job-ai-assessment-start-button">
                            {resumeAssessmentCompleted ? (
                              <Button
                                className="w-fit"
                                onClick={handleStartJobAiAssessment}
                                disabled={isStartingJobAiAssessment}
                              >
                                {isStartingJobAiAssessment ? (
                                  <>
                                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                                    Starting Assessment...
                                  </>
                                ) : (
                                  <>
                                    <ArrowUpRight className="mr-2 h-4 w-4" />
                                    Start Job AI Assessment
                                  </>
                                )}
                              </Button>
                            ) : (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span>
                                    <Button
                                      className="w-fit cursor-not-allowed opacity-50"
                                      disabled
                                    >
                                      <ArrowUpRight className="mr-2 h-4 w-4" />
                                      Start Job AI Assessment
                                    </Button>
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  Complete your resume assessment before
                                  starting Job AI assessment.
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  )
                ) : (
                  <div className="flex h-full flex-col">
                    <div className="flex flex-1 items-center justify-center">
                      <OnboardAssessmentIcon width={200} height={200} />
                    </div>
                    <div className="mt-auto flex flex-col items-center justify-center gap-4 pt-4">
                      <div className="max-w-md">
                        <p className="text-muted-foreground text-md text-center dark:text-gray-400">
                          We&apos;re setting up your Job AI Assessment
                          invitation. Please check back soon or contact support
                          if this takes longer than expected.
                        </p>
                      </div>
                    </div>
                  </div>
                )
              ) : profile.onboardingAssessmentStatus ===
                CandidateOnboardingAssessmentStatusEnum.ASSESSMENT_COMPLETED ? (
                <div className="flex h-full flex-col">
                  {onboardingAssessment?.overallFeedback ? (
                    <div className="border-muted bg-background text-muted-foreground rounded-lg border p-4 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300">
                      {onboardingAssessment.overallFeedback}
                    </div>
                  ) : (
                    <div className="flex flex-1 items-center justify-center">
                      <OnboardAssessmentIcon width={200} height={200} />
                    </div>
                  )}

                  <div className="mt-auto flex flex-col justify-center gap-4 pt-4">
                    <div className="flex justify-center">
                      <Button
                        className="w-fit"
                        onClick={() => setOnboardingAssessmentOpen(true)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Detailed{' '}
                        {shouldShowJobAiAssessment
                          ? 'Job AI Assessment'
                          : 'Screening Assessment'}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : profile.onboardingAssessmentStatus ===
                  CandidateOnboardingAssessmentStatusEnum.ASSESSMENT_IN_PROGRESS &&
                (onboardingAssessment?.status ===
                  OnboardingAssessmentStatusEnum.CANDIDATE_ASSESSMENT_COMPLETED ||
                  onboardingAssessment?.status ===
                    OnboardingAssessmentStatusEnum.AI_REVIEW_IN_PROGRESS) ? (
                <div className="flex h-full flex-col">
                  <div className="flex flex-1 items-center justify-center">
                    <OnboardAssessmentIcon width={200} height={200} />
                  </div>
                  <div className="border-muted bg-muted/20 mt-6 rounded-lg border p-4">
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Your assessment has been submitted. Our AI is reviewing
                      your responses and preparing your personalized feedback.
                      This usually takes a few minutes.
                    </p>
                  </div>
                  <div className="mt-auto flex justify-center pt-4">
                    <div className="text-muted-foreground flex items-center gap-2 text-sm dark:text-gray-400">
                      <Clock className="h-5 w-5 animate-spin" />
                      AI review in progress...
                    </div>
                  </div>
                </div>
              ) : profile.onboardingAssessmentStatus ===
                  CandidateOnboardingAssessmentStatusEnum.ASSESSMENT_IN_PROGRESS &&
                resumeAssessment?.result ===
                  ResumeAssessmentResultEnum.PASSED ? (
                <div className="flex h-full flex-col">
                  <div className="border-muted bg-muted/20 mt-6 rounded-lg border p-4">
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Your onboarding assessment is currently in progress.
                      Completing all steps will help highlight your skills and
                      improve your chances of matching with the most suitable
                      job opportunities.
                      <br />
                      <br />
                      The assessment will take approximately{' '}
                      <strong>60 minutes</strong> to complete.
                    </p>
                  </div>
                  <div className="mt-auto flex justify-center pt-4">
                    <Button
                      className="w-fit"
                      onClick={() =>
                        router.push(
                          '/app/candidate/assessments/onboarding/check'
                        )
                      }
                    >
                      <ArrowUpRight className="mr-2 h-4 w-4" />
                      Continue Assessment
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex h-full flex-col">
                  <div className="flex flex-1 items-center justify-center">
                    <OnboardAssessmentIcon width={200} height={200} />
                  </div>

                  <div className="mt-auto flex flex-col items-center justify-center gap-4 pt-4">
                    <div className="max-w-md">
                      <p className="text-muted-foreground text-md text-center dark:text-gray-400">
                        {shouldShowJobAiAssessment
                          ? 'Complete the AI-powered assessment for your job application to showcase your skills, experience, and fit for the role.'
                          : 'Complete a comprehensive assessment to showcase your skills, experience, and fit for various roles.'}
                      </p>
                    </div>
                    {/* Start Screening Assessment Button with Tooltip if disabled */}
                    {profile?.resumeAssessmentStatus !==
                    CandidateResumeAssessmentStatusEnum.ASSESSMENT_COMPLETED ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span data-tour="screening-assessment-start-button">
                            <Button
                              className="w-fit cursor-not-allowed opacity-50"
                              onClick={(e) => e.preventDefault()}
                              disabled
                            >
                              {isStartingOnboardingAssessment ? (
                                <>
                                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                                  Starting Assessment...
                                </>
                              ) : (
                                <>
                                  <ArrowUpRight className="mr-2 h-4 w-4" />
                                  Start Screening Assessment
                                </>
                              )}
                            </Button>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          Complete your resume assessment before starting
                          screening assessment.
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <div data-tour="screening-assessment-start-button">
                        <Button
                          className="w-fit"
                          onClick={(e) => {
                            if (isStartingOnboardingAssessment) {
                              e.preventDefault();
                              return;
                            }
                            onStartOnboardingAssessment();
                          }}
                          disabled={isStartingOnboardingAssessment}
                        >
                          {isStartingOnboardingAssessment ? (
                            <>
                              <Clock className="mr-2 h-4 w-4 animate-spin" />
                              Starting Assessment...
                            </>
                          ) : (
                            <>
                              <ArrowUpRight className="mr-2 h-4 w-4" />
                              Start Screening Assessment
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <OnboardingDetailedDialog
        open={onboardingAssessmentOpen}
        onOpenChange={setOnboardingAssessmentOpen}
        onboardingAssessment={
          onboardingAssessment as ICandidateOnboardingAssessment
        }
      />

      {jobAiAssessment && (
        <JobAiAssessmentDetailedDialog
          open={jobAiAssessmentOpen}
          onOpenChange={setJobAiAssessmentOpen}
          jobAiAssessment={jobAiAssessment}
        />
      )}
    </TooltipProvider>
  );
};

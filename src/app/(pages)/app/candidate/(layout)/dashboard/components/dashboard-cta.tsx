'use client';

import {
  CandidateAssessmentStageEnum,
  CandidateOnboardingAssessmentStatusEnum,
  CandidateResumeAssessmentStatusEnum,
  CandidateStatusEnum,
  ICandidateJobAiAssessment,
  ICandidateOnboardingAssessment,
  ICandidateProfile,
  JobAiAssessmentStatusEnum,
  OnboardingAssessmentStatusEnum,
} from '@/lib/shared';
import {
  Briefcase,
  LucideIcon,
  ArrowRight,
  CheckCircle2,
  Clock,
  RefreshCw,
  User,
  FileText,
  Target,
  Lightbulb,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { ENV } from '@/lib/env';
import { useEffect, useState } from 'react';
import TeamcastShortIcon from '@/components/icons/TeamcastShortIcon';

interface NextStep {
  title: string;
  description: string;
  icon: LucideIcon;
  isCompleted?: boolean;
  isCurrent?: boolean;
}

interface DashboardCtaConfig {
  title: string;
  description: string;
  icon: LucideIcon;
  actionText?: string;
  actionLoadingText?: string;
  actionIcon?: LucideIcon;
  onActionClick?: () => void;
  variant?: 'warning' | 'info' | 'success' | 'error';
  completionPercentage?: number;
  statusBadge?: string;
  nextSteps?: NextStep[];
  currentStep?: string;
  actionDisabled?: boolean;
}

interface DashboardCtaOptions {
  isInviteSignupCandidate?: boolean;
  jobAiAssessmentInvitation?: any | null;
  jobAiAssessment?: ICandidateJobAiAssessment | null;
  onboardingAssessment?: ICandidateOnboardingAssessment | null;
  onStartJobAiAssessment?: () => void;
  isStartingJobAiAssessment?: boolean;
}

interface DashboardHeaderProps extends DashboardCtaOptions {
  profile: ICandidateProfile;
}

const navigateToProfile = (router: AppRouterInstance) => {
  return () => {
    router.push('/app/candidate/resume');
  };
};

const navigateToOnboarding = (router: AppRouterInstance) => {
  return () => {
    router.push('/app/candidate/onboard/resume');
  };
};

const getCandidateJourneyConfig = (
  router: AppRouterInstance,
  profile: ICandidateProfile,
  options?: DashboardCtaOptions
): DashboardCtaConfig | undefined => {
  if (options?.isInviteSignupCandidate) {
    const invitation = options.jobAiAssessmentInvitation;
    const jobAiAssessment = options.jobAiAssessment;
    const completedStatuses = [
      JobAiAssessmentStatusEnum.CANDIDATE_ASSESSMENT_COMPLETED,
      JobAiAssessmentStatusEnum.AI_REVIEW_COMPLETED,
      JobAiAssessmentStatusEnum.MANUAL_REVIEW_COMPLETED,
      JobAiAssessmentStatusEnum.ASSESSMENT_COMPLETED,
    ];
    const invitationInProgress =
      invitation?.assessmentId || invitation?.assessmentStatus;
    const assessmentCompleted = jobAiAssessment
      ? completedStatuses.includes(jobAiAssessment.status)
      : false;

    if (!invitation) {
      return {
        title: 'Job AI Assessment Invitation Pending',
        description:
          'We are setting up your personalized AI assessment link. You will be notified as soon as the invitation is ready. Stay tuned!',
        icon: Clock,
        variant: 'info',
        statusBadge: 'Preparing',
        currentStep: 'Invitation Setup',
        nextSteps: [
          {
            title: 'Invitation Pending',
            description: 'Awaiting AI assessment invite from the client',
            icon: Clock,
            isCurrent: true,
          },
          {
            title: 'Complete Assessment',
            description: 'Join the AI experience once the link arrives',
            icon: Target,
            isCompleted: false,
          },
          {
            title: 'Review & Insights',
            description: 'See how your performance stacks up',
            icon: FileText,
            isCompleted: false,
          },
        ],
      };
    }

    if (assessmentCompleted) {
      return {
        title: 'Job AI Assessment Completed',
        description:
          'Great job! Your assessment is complete and under review. You can revisit the interviews page for detailed insights.',
        icon: CheckCircle2,
        actionText: 'View Assessment Details',
        actionIcon: ArrowRight,
        onActionClick: () => router.push('/app/candidate/resume'),
        variant: 'success',
        statusBadge: 'Completed',
        currentStep: 'Assessment Review',
        nextSteps: [
          {
            title: 'Assessment Finished',
            description: 'You successfully completed the AI assessment',
            icon: CheckCircle2,
            isCompleted: true,
          },
          {
            title: 'Await Feedback',
            description: 'Our team reviews your assessment outcome',
            icon: Clock,
            isCurrent: true,
          },
          {
            title: 'Next Opportunities',
            description: 'Get matched with top-tier roles',
            icon: Briefcase,
            isCompleted: false,
          },
        ],
      };
    }

    const resumeAssessmentCompleted =
      profile.resumeAssessmentStatus ===
      CandidateResumeAssessmentStatusEnum.ASSESSMENT_COMPLETED;
    const profileCompleteEnough =
      profile.completionPercentage >=
        ENV.NEXT_PUBLIC_PROFILE_COMPLETION_THRESHOLD && !!profile.image;
    const canStartJobAi =
      resumeAssessmentCompleted && profileCompleteEnough && !!invitation;
    let title = '';
    let description = '';
    if (!profileCompleteEnough) {
      title = 'Please Complete your profile to start your AI Assessment';
      description =
        'Finish your profile and upload a photo so we can fully understand your background before unlocking the AI assessment.';
    }
    const actionDisabled = canStartJobAi
      ? !!options?.isStartingJobAiAssessment
      : false;
    const actionText = canStartJobAi
      ? invitationInProgress
        ? 'Continue Job AI Assessment'
        : 'Start Job AI Assessment'
      : !profileCompleteEnough
        ? 'Complete Profile'
        : 'Complete Resume Assessment';
    const actionHandler = canStartJobAi
      ? options?.onStartJobAiAssessment
      : () => router.push('/app/candidate/resume');

    return {
      title,
      description,
      icon: Target,
      actionText,
      actionLoadingText:
        canStartJobAi && options?.isStartingJobAiAssessment
          ? 'Opening assessment...'
          : undefined,
      actionIcon: ArrowRight,
      onActionClick: actionHandler,
      actionDisabled,
      variant: 'info',
      statusBadge: canStartJobAi
        ? invitationInProgress
          ? 'In Progress'
          : 'Ready'
        : !profileCompleteEnough
          ? 'Complete Profile'
          : 'Resume Assessment Pending',
      currentStep: canStartJobAi ? 'Job AI Assessment' : 'Profile Preparation',
      nextSteps: [
        {
          title: 'Complete Profile',
          description: 'Fill in your profile details and upload a photo',
          icon: User,
          isCompleted: profileCompleteEnough,
        },
        {
          title: 'Resume Assessment',
          description: 'Submit and complete your resume assessment',
          icon: FileText,
          isCompleted: resumeAssessmentCompleted,
          isCurrent: !resumeAssessmentCompleted,
        },
        {
          title: invitationInProgress
            ? 'Assessment In Progress'
            : 'Job AI Assessment Ready',
          description: invitationInProgress
            ? 'Finish answering the remaining questions'
            : 'Begin the AI assessment experience',
          icon: Clock,
          isCurrent: resumeAssessmentCompleted && !invitationInProgress,
          isCompleted: invitationInProgress,
        },
        {
          title: 'Await Review',
          description: 'Our team evaluates your responses next',
          icon: FileText,
          isCompleted: false,
        },
      ],
    };
  }

  switch (profile.candidateStatus) {
    case CandidateStatusEnum.NEW:
      switch (profile.assessmentStage) {
        case CandidateAssessmentStageEnum.RESUME_ASSESSMENT:
          switch (profile.resumeAssessmentStatus) {
            case CandidateResumeAssessmentStatusEnum.ASSESSMENT_NOT_DONE:
              return {
                title:
                  profile.completionPercentage <
                  ENV.NEXT_PUBLIC_PROFILE_COMPLETION_THRESHOLD
                    ? 'Complete Your Profile Setup'
                    : 'Finalize Your Profile',
                description:
                  profile.completionPercentage <
                  ENV.NEXT_PUBLIC_PROFILE_COMPLETION_THRESHOLD
                    ? 'Begin your journey by building a standout professional profile. Completing your profile helps us understand your unique skills, experience, and aspirations. The more details you provide, the better we can match you with roles that fit your goals. Start now to unlock personalized job opportunities and move one step closer to your dream career.'
                    : `Great progress! You're ${profile.completionPercentage}% complete. Add the finishing touches to unlock personalized job opportunities and move one step closer to your dream career.`,
                icon: User,
                actionText:
                  profile.completionPercentage < 80
                    ? 'Complete Profile'
                    : 'Complete Assessment',
                actionIcon: ArrowRight,
                onActionClick:
                  profile.completionPercentage < 35
                    ? navigateToOnboarding(router)
                    : navigateToProfile(router),
                variant: 'info',
                completionPercentage: profile.completionPercentage,
                statusBadge: 'In Progress',
                currentStep: 'Profile Setup',
                nextSteps: [
                  {
                    title: 'Basic Information',
                    description:
                      'Add your personal details and contact information',
                    icon: User,
                    isCompleted: profile.completionPercentage > 20,
                    isCurrent: profile.completionPercentage <= 20,
                  },
                  {
                    title: 'Work Experience',
                    description:
                      'Add your professional experience and achievements',
                    icon: Briefcase,
                    isCompleted: profile.completionPercentage > 50,
                    isCurrent:
                      profile.completionPercentage > 20 &&
                      profile.completionPercentage <= 50,
                  },
                  {
                    title: 'Skills & Education',
                    description:
                      'Highlight your skills and educational background',
                    icon: Target,
                    isCompleted: profile.completionPercentage > 80,
                    isCurrent:
                      profile.completionPercentage > 50 &&
                      profile.completionPercentage <= 80,
                  },
                  {
                    title: 'Profile Review',
                    description: 'Submit your profile for expert review',
                    icon: FileText,
                    isCompleted: false,
                    isCurrent: profile.completionPercentage > 80,
                  },
                ],
              };
            case CandidateResumeAssessmentStatusEnum.ASSESSMENT_IN_PROGRESS:
              return {
                title: 'Profile Under Review',
                description:
                  "Your profile is under review by our expert team. We're evaluating your experience, skills, and achievements to ensure you're matched with the best opportunities. You'll receive feedback soon—keep an eye on your notifications for the next steps!",
                icon: Clock,
                actionText: 'View Profile Status',
                actionIcon: ArrowRight,
                onActionClick: () => {
                  router.push('/app/candidate/resume');
                },
                variant: 'warning',
                statusBadge: 'Under Review',
                currentStep: 'Expert Review',
                nextSteps: [
                  {
                    title: 'Profile Submitted',
                    description: 'Your profile has been submitted for review',
                    icon: CheckCircle2,
                    isCompleted: true,
                  },
                  {
                    title: 'Expert Review',
                    description: 'Our specialists are evaluating your profile',
                    icon: Clock,
                    isCurrent: true,
                  },
                  {
                    title: 'Review Complete',
                    description: 'Receive feedback and next steps',
                    icon: FileText,
                    isCompleted: false,
                  },
                  {
                    title: 'Career Assessment',
                    description:
                      'Begin your detailed career preferences assessment',
                    icon: Target,
                    isCompleted: false,
                  },
                ],
              };
            case CandidateResumeAssessmentStatusEnum.ASSESSMENT_FAILED:
              return {
                title: 'Profile Needs Updates',
                description:
                  "We've reviewed your profile and found a few areas that could be strengthened. Enhancing your profile will increase your chances of being noticed by top employers. Review our feedback, make the recommended updates, and resubmit to continue your journey toward great opportunities.",
                icon: RefreshCw,
                actionText: 'View Feedback & Update',
                actionIcon: ArrowRight,
                onActionClick: () => {
                  router.push('/app/candidate/resume-assessment');
                },
                variant: 'error',
                statusBadge: 'Action Required',
                currentStep: 'Profile Updates',
                nextSteps: [
                  {
                    title: 'Review Feedback',
                    description:
                      'Check the specific areas that need improvement',
                    icon: Lightbulb,
                    isCurrent: true,
                  },
                  {
                    title: 'Update Profile',
                    description: 'Make the recommended changes to your profile',
                    icon: RefreshCw,
                    isCompleted: false,
                  },
                  {
                    title: 'Resubmit for Review',
                    description:
                      'Submit your updated profile for re-evaluation',
                    icon: FileText,
                    isCompleted: false,
                  },
                  {
                    title: 'Career Assessment',
                    description: 'Proceed to the next stage after approval',
                    icon: Target,
                    isCompleted: false,
                  },
                ],
              };
          }
          break;
        case CandidateAssessmentStageEnum.ONBOARDING_ASSESSMENT:
          switch (profile.onboardingAssessmentStatus) {
            case CandidateOnboardingAssessmentStatusEnum.ASSESSMENT_NOT_DONE:
              return {
                title: 'Career Preferences Assessment',
                description:
                  "Congratulations—your profile is approved! Next, help us get to know your career preferences, ideal work environment, and aspirations. This assessment ensures we recommend roles and companies that truly align with what you're looking for. Take a few minutes to complete it and unlock tailored job matches.",
                icon: Target,
                actionText: 'Start Assessment',
                actionIcon: ArrowRight,
                onActionClick: () => {
                  router.push('/app/candidate/assessments/onboarding/check');
                },
                variant: 'success',
                statusBadge: 'Ready to Start',
                currentStep: 'Career Assessment',
                nextSteps: [
                  {
                    title: 'Profile Approved',
                    description:
                      'Your profile has been approved by our experts',
                    icon: CheckCircle2,
                    isCompleted: true,
                  },
                  {
                    title: 'Career Preferences',
                    description:
                      'Tell us about your ideal work environment and goals',
                    icon: Target,
                    isCurrent: true,
                  },
                  {
                    title: 'Salary Expectations',
                    description: 'Set your compensation preferences',
                    icon: Briefcase,
                    isCompleted: false,
                  },
                  {
                    title: 'Start Matching',
                    description: 'Begin receiving personalized job matches',
                    icon: Lightbulb,
                    isCompleted: false,
                  },
                ],
              };
            case CandidateOnboardingAssessmentStatusEnum.ASSESSMENT_IN_PROGRESS: {
              const onboardingAssessment = options?.onboardingAssessment;
              const isAiReviewInProgress =
                onboardingAssessment?.status ===
                  OnboardingAssessmentStatusEnum.CANDIDATE_ASSESSMENT_COMPLETED ||
                onboardingAssessment?.status ===
                  OnboardingAssessmentStatusEnum.AI_REVIEW_IN_PROGRESS;

              if (isAiReviewInProgress) {
                return {
                  title: 'Assessment Under Review',
                  description:
                    'Your assessment has been submitted. Our AI is reviewing your responses and preparing your personalized feedback. This usually takes a few minutes.',
                  icon: Clock,
                  actionText: 'Processing',
                  actionLoadingText: 'AI review in progress...',
                  actionDisabled: true,
                  onActionClick: () => {},
                  variant: 'warning',
                  statusBadge: 'AI Review In Progress',
                  currentStep: 'Assessment Review',
                  nextSteps: [
                    {
                      title: 'Profile Approved',
                      description: 'Your profile has been approved',
                      icon: CheckCircle2,
                      isCompleted: true,
                    },
                    {
                      title: 'Career Assessment',
                      description: 'You have completed the assessment',
                      icon: Target,
                      isCompleted: true,
                    },
                    {
                      title: 'Assessment Review',
                      description: 'Our AI is reviewing your responses',
                      icon: Clock,
                      isCurrent: true,
                    },
                    {
                      title: 'Start Matching',
                      description: 'Begin receiving job opportunities',
                      icon: Lightbulb,
                      isCompleted: false,
                    },
                  ],
                };
              }

              return {
                title: 'Complete Your Assessment',
                description:
                  "You're almost there! Continue your career assessment to help us fine-tune your job matches. The more we know about your preferences and goals, the better we can connect you with opportunities that fit your ambitions.",
                icon: Clock,
                actionText: 'Continue Assessment',
                actionIcon: ArrowRight,
                onActionClick: () => {
                  router.push('/app/candidate/assessments/onboarding/check');
                },
                variant: 'warning',
                statusBadge: 'In Progress',
                currentStep: 'Career Assessment',
                nextSteps: [
                  {
                    title: 'Profile Approved',
                    description: 'Your profile has been approved',
                    icon: CheckCircle2,
                    isCompleted: true,
                  },
                  {
                    title: 'Career Assessment',
                    description:
                      'Complete your career preferences questionnaire',
                    icon: Target,
                    isCurrent: true,
                  },
                  {
                    title: 'Assessment Review',
                    description: 'Our team will review your responses',
                    icon: Clock,
                    isCompleted: false,
                  },
                  {
                    title: 'Start Matching',
                    description: 'Begin receiving job opportunities',
                    icon: Lightbulb,
                    isCompleted: false,
                  },
                ],
              };
            }
            case CandidateOnboardingAssessmentStatusEnum.ASSESSMENT_FAILED:
              return {
                title: 'Improve Your Assessment',
                description:
                  'Some of your assessment responses need a bit more detail to help us find the best roles for you. Please review and update your answers so we can match you with opportunities that truly fit your skills and aspirations.',
                icon: RefreshCw,
                actionText: 'Improve Responses',
                actionIcon: ArrowRight,
                onActionClick: () => {
                  router.push('/app/candidate/assessments/onboarding/check');
                },
                variant: 'error',
                statusBadge: 'Needs Improvement',
                currentStep: 'Assessment Revision',
                nextSteps: [
                  {
                    title: 'Review Feedback',
                    description: 'Understand areas that need more detail',
                    icon: Lightbulb,
                    isCurrent: true,
                  },
                  {
                    title: 'Update Responses',
                    description: 'Provide more detailed and specific answers',
                    icon: RefreshCw,
                    isCompleted: false,
                  },
                  {
                    title: 'Resubmit Assessment',
                    description: 'Submit your improved assessment',
                    icon: FileText,
                    isCompleted: false,
                  },
                  {
                    title: 'Start Matching',
                    description: 'Begin receiving targeted opportunities',
                    icon: Target,
                    isCompleted: false,
                  },
                ],
              };
          }
          break;
      }
  }
  return undefined;
};

export function DashboardCta({
  profile,
  isInviteSignupCandidate,
  jobAiAssessmentInvitation,
  jobAiAssessment,
  onboardingAssessment,
  onStartJobAiAssessment,
  isStartingJobAiAssessment,
}: DashboardHeaderProps) {
  const router = useRouter();
  const candidateJourneyConfig = getCandidateJourneyConfig(router, profile, {
    isInviteSignupCandidate,
    jobAiAssessmentInvitation,
    jobAiAssessment,
    onboardingAssessment,
    onStartJobAiAssessment,
    isStartingJobAiAssessment,
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!candidateJourneyConfig) {
    return <></>;
  }

  return (
    <div className="space-y-6">
      {/* Main CTA Card */}
      <div
        className={cn(
          'relative overflow-hidden rounded-xl border border-gray-100 bg-white p-6 shadow-md transition-all duration-300 dark:border-gray-800 dark:bg-gray-950',
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        )}
      >
        {/* Background Icon */}
        <div className="absolute top-1/2 right-1 -translate-y-1/2 opacity-15 dark:opacity-10">
          <TeamcastShortIcon width={270} height={270} />
        </div>

        <div className="relative flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-lg">
              <candidateJourneyConfig.icon className="h-6 w-6" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 lg:text-2xl dark:text-white">
                {candidateJourneyConfig.title}
              </h2>

              {candidateJourneyConfig.statusBadge && (
                <span className="bg-primary/10 text-primary mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium">
                  {candidateJourneyConfig.statusBadge}
                </span>
              )}
            </div>
          </div>

          {/* Completion Percentage */}
          {candidateJourneyConfig.completionPercentage !== undefined && (
            <div className="relative text-right">
              <div className="text-primary text-2xl font-bold">
                {candidateJourneyConfig.completionPercentage}%
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Complete
              </div>
            </div>
          )}
        </div>

        <p className="relative mt-4 mb-6 text-base text-gray-600 dark:text-gray-300">
          {candidateJourneyConfig.description}
        </p>
        <div className="flex w-auto">
          {candidateJourneyConfig.actionText &&
            candidateJourneyConfig.onActionClick && (
              <div data-tour="complete-assessment-button" className="w-auto">
                <button
                  onClick={candidateJourneyConfig.onActionClick}
                  disabled={candidateJourneyConfig.actionDisabled}
                  className="bg-primary hover:bg-primary/90 relative flex cursor-pointer items-center gap-2 rounded-md px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:shadow-md"
                >
                  <span>
                    {candidateJourneyConfig.actionDisabled &&
                    candidateJourneyConfig.actionLoadingText
                      ? candidateJourneyConfig.actionLoadingText
                      : candidateJourneyConfig.actionText}
                  </span>
                  {candidateJourneyConfig.actionDisabled &&
                  candidateJourneyConfig.actionLoadingText ? (
                    <Clock className="h-4 w-4 animate-spin" />
                  ) : (
                    candidateJourneyConfig.actionIcon && (
                      <candidateJourneyConfig.actionIcon className="h-4 w-4" />
                    )
                  )}
                </button>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

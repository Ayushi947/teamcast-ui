'use client';

import {
  candidateProfileService,
  candidateApplicationService,
  candidateResumeService,
  candidateOnboardingAssessmentService,
  candidateJobAiAssessmentService,
  candidateJobAssessmentInviteService,
} from '@/lib/services/services';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ICandidateProfile,
  ICandidateJobApplication,
  UserRoleEnum,
  logger,
  IResume,
  ICandidateOnboardingAssessment,
  OnboardingAssessmentResultEnum,
  JobAiAssessmentStatusEnum,
  ICandidateJobAiAssessment,
  JobAiAssessmentResultEnum,
  OnboardingAssessmentStatusEnum,
  ICandidateJobAssessmentInviteResponse,
  JobAssessmentInviteStatusEnum,
  JobAiAssessmentInviteStatusEnum,
  CandidateOnboardingAssessmentStatusEnum,
} from '@/lib/shared';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardCta } from './components/dashboard-cta';
import { DashboardGreeting } from './components/dashboard-greeeting';
import { IndividualDashboard } from './components/individual-dashboard';
import { PartnerResourceDashboard } from './components/partner-resource-dashboard';
import { EmailVerificationBanner } from '@/components/app/common/email-verification-banner';
import { AcceptInviteDialog } from './components/accept-invite-dialog';
import { toast } from 'sonner';
import { getProfileCompletionPercentage } from '@/lib/utils/profile-completion';
import { useApp } from '@/lib/context/app-context';
import { useLiveAssessmentAnalyticsService } from '@/lib/hooks/convex-live-assessments/live-assessment-analytics-hook';
import { clearResumeData } from '@/lib/utils/resume-draft.utils';

export default function DashboardPage() {
  const { user } = useApp();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [shouldFetchOnboardingAssessment, setShouldFetchOnboardingAssessment] =
    useState(true);
  const [shouldFetchJobAiAssessment, setShouldFetchJobAiAssessment] =
    useState(true);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [pendingInvite, setPendingInvite] =
    useState<ICandidateJobAssessmentInviteResponse | null>(null);
  const [isAcceptingInvite, setIsAcceptingInvite] = useState(false);
  const [isDecliningInvite, setIsDecliningInvite] = useState(false);
  const [showApplicationConfirmDialog, setShowApplicationConfirmDialog] =
    useState(false);
  const [pendingApplicationInvite, setPendingApplicationInvite] =
    useState<ICandidateJobApplication | null>(null);
  const [applicationDialogMessage, setApplicationDialogMessage] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [isApplicationAccepting, setIsApplicationAccepting] = useState(false);
  const [isApplicationDeclining, setIsApplicationDeclining] = useState(false);
  const [hasDismissedApplicationDialog, setHasDismissedApplicationDialog] =
    useState(false);
  const [declinedInviteIds, setDeclinedInviteIds] = useState<Set<string>>(
    new Set()
  );
  const [dismissedInviteIds, setDismissedInviteIds] = useState<Set<string>>(
    new Set()
  );
  const [inviteDialogClosedAt, setInviteDialogClosedAt] = useState<
    number | null
  >(null);
  const [isStartingJobAiAssessment, setIsStartingJobAiAssessment] =
    useState(false);
  const candidateId = user?.candidateId;
  const liveAssessmentAnalyticsService = useLiveAssessmentAnalyticsService();
  const {
    data: profile,
    isLoading: isProfileLoading,
    error: profileError,
  } = useQuery<ICandidateProfile, Error>({
    queryKey: ['candidate-profile'],
    queryFn: () => candidateProfileService.getProfile(),
    retry: 1,
  });

  const {
    data: applications,
    isLoading: isApplicationsLoading,
    error: applicationsError,
  } = useQuery<ICandidateJobApplication[], Error>({
    queryKey: ['candidate-applications'],
    queryFn: () =>
      candidateApplicationService
        .getApplications({ page: 1, limit: 100 })
        .then((res) => res.items),
    retry: 1,
  });

  const { data: resume, isLoading: isResumeLoading } = useQuery<IResume>({
    queryKey: ['candidate-resume'],
    queryFn: () => candidateResumeService.getResume(),
  });

  React.useEffect(() => {
    if (profileError) {
      toast.error('Failed to load profile data. Please try again later.');
      logger.error('Profile loading error:', profileError);
    }
    if (applicationsError) {
      toast.error('Failed to load applications data. Please try again later.');
      logger.error('Applications loading error:', applicationsError);
    }
  }, [profileError, applicationsError]);

  React.useEffect(() => {
    // Clear candidateResumeDraft when user lands on dashboard
    clearResumeData();
  }, []);

  const { data: latestOnboardingAssessment } =
    useQuery<ICandidateOnboardingAssessment>({
      queryKey: ['candidate-latest-onboarding-assessment'],

      queryFn: async () => {
        try {
          const data =
            await candidateOnboardingAssessmentService.getLatestAssessment();
          return data;
        } catch (err: any) {
          if (err?.code === 'ERR_4001') {
            setShouldFetchOnboardingAssessment(false);
          }
          throw err;
        }
      },
      enabled:
        !!candidateId &&
        shouldFetchOnboardingAssessment &&
        (profile?.onboardingAssessmentStatus ===
          CandidateOnboardingAssessmentStatusEnum.ASSESSMENT_IN_PROGRESS ||
          profile?.onboardingAssessmentStatus ===
            CandidateOnboardingAssessmentStatusEnum.ASSESSMENT_COMPLETED),
      retry: false,
      refetchInterval: (query) => {
        const assessment = query.state.data as { status?: string } | undefined;
        const waitingForProfileUpdateStatuses = [
          'CANDIDATE_ASSESSMENT_COMPLETED',
          'AI_REVIEW_IN_PROGRESS',
          'AI_REVIEW_COMPLETED',
          'ASSESSMENT_COMPLETED',
        ];
        if (
          assessment?.status &&
          waitingForProfileUpdateStatuses.includes(assessment.status)
        ) {
          return 5000;
        }
        return false;
      },
    });

  // Poll profile when onboarding assessment is completed by candidate - keep polling until profile reflects ASSESSMENT_COMPLETED
  const shouldPollForOnboardingCompletion =
    profile?.onboardingAssessmentStatus ===
      CandidateOnboardingAssessmentStatusEnum.ASSESSMENT_IN_PROGRESS &&
    latestOnboardingAssessment?.status &&
    [
      'CANDIDATE_ASSESSMENT_COMPLETED',
      'AI_REVIEW_IN_PROGRESS',
      'AI_REVIEW_COMPLETED',
      'ASSESSMENT_COMPLETED',
    ].includes(latestOnboardingAssessment.status);

  useEffect(() => {
    if (!shouldPollForOnboardingCompletion) return;

    const poll = async () => {
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['candidate-profile'] }),
        queryClient.refetchQueries({
          queryKey: ['candidate-latest-onboarding-assessment'],
        }),
        queryClient.refetchQueries({ queryKey: ['onboarding-assessment'] }),
      ]);

      const updatedProfile = queryClient.getQueryData<ICandidateProfile>([
        'candidate-profile',
      ]);
      if (
        updatedProfile?.onboardingAssessmentStatus ===
        CandidateOnboardingAssessmentStatusEnum.ASSESSMENT_COMPLETED
      ) {
        toast.success('AI review completed! See your results in View Details.');
      }
    };

    poll();
    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, [shouldPollForOnboardingCompletion, queryClient]);

  const { data: latestJobAiAssessment } = useQuery<ICandidateJobAiAssessment>({
    queryKey: ['candidate-latest-job-ai-assessment'],
    queryFn: async () => {
      try {
        const data =
          await candidateJobAiAssessmentService.getLatestAssessment();
        return data;
      } catch (err: any) {
        if (err?.code === 'ERR_4001') {
          setShouldFetchJobAiAssessment(false);
        }
        throw err;
      }
    },
    enabled: !!candidateId && shouldFetchJobAiAssessment,
    retry: false,
  });

  const { data: jobAiAssessmentInvitations } = useQuery({
    queryKey: ['candidate-job-ai-assessment-invitations-dashboard'],
    queryFn: async () => {
      try {
        const result =
          await candidateJobAiAssessmentService.listJobAiAssessmentInterviews({
            page: 1,
            limit: 100,
            status: Object.values(JobAiAssessmentInviteStatusEnum),
          });
        return result.items || [];
      } catch (error) {
        logger.warn('Failed to fetch job AI assessment invitations:', error);
        return [];
      }
    },
    enabled: !!candidateId,
    retry: false,
  });

  // Check if this is an invite-signup candidate (determined by backend flag)
  // These candidates should NOT see the dialog - they handle job application acceptance differently
  const isInviteSignupCandidate = !!profile?.isInviteSignup;

  const acceptedJobAiInvitation = React.useMemo(() => {
    if (!jobAiAssessmentInvitations || jobAiAssessmentInvitations.length === 0)
      return null;

    const acceptedInvitations = jobAiAssessmentInvitations.filter(
      (invite: any) => {
        if (
          invite.jobApplicationDeclinedAt ||
          invite.jobApplicationStatus === 'DECLINED'
        ) {
          return false;
        }

        if (invite.jobApplicationAcceptedAt) {
          return true;
        }

        const status = invite.status;
        const assessmentStatus = invite.assessmentStatus;
        return (
          status === JobAiAssessmentInviteStatusEnum.ACCEPTED ||
          assessmentStatus !== null
        );
      }
    );

    if (acceptedInvitations.length === 0) return null;

    const sorted = acceptedInvitations.sort((a: any, b: any) => {
      const aHasAccepted = !!a.jobApplicationAcceptedAt;
      const bHasAccepted = !!b.jobApplicationAcceptedAt;

      if (aHasAccepted && !bHasAccepted) return -1;
      if (!aHasAccepted && bHasAccepted) return 1;

      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    return sorted[0];
  }, [jobAiAssessmentInvitations]);

  const handleStartJobAiAssessment = React.useCallback(async () => {
    if (!acceptedJobAiInvitation?.id) {
      toast.error('Assessment invitation not found');
      return;
    }

    setIsStartingJobAiAssessment(true);
    try {
      const responseUrl =
        await candidateJobAiAssessmentService.getJobAiAssessmentInvitationUrl(
          acceptedJobAiInvitation.id
        );

      if (typeof responseUrl === 'string' && responseUrl.trim()) {
        window.location.href = responseUrl;
      } else {
        toast.error('Assessment not found');
      }
    } catch (error: any) {
      logger.error('Error starting Job AI Assessment:', error);
      if (error?.response?.status === 403) {
        const errorMessage =
          error?.response?.data?.message || error?.message || '';
        if (errorMessage.toLowerCase().includes('resume assessment')) {
          toast.error('Please complete your Resume Assessment first.');
        } else {
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
  }, [acceptedJobAiInvitation]);

  // Check for assessment invites (both PENDING and ACCEPTED) to determine which dialog to show
  const { data: assessmentInvites } = useQuery({
    queryKey: ['candidate-assessment-invites-pending'],
    queryFn: async () => {
      try {
        // Fetch all invites (PENDING and ACCEPTED) to check status
        const params: any = {
          page: 1,
          limit: 10,
          sortBy: 'createdAt',
          sortOrder: 'desc', // Get most recent first
        };
        const result =
          await candidateJobAssessmentInviteService.getInvites(params);
        const items = result.items || [];
        // Sort by createdAt descending to get most recent
        return items.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA;
        });
      } catch (err: any) {
        // If error, return empty array (not critical)
        logger.warn('Failed to fetch assessment invites:', err);
        return [];
      }
    },
    enabled: !!candidateId, // Fetch for all candidates
    retry: false,
    refetchOnWindowFocus: true,
  });

  // Determine which dialog to show based on invite status
  useEffect(() => {
    if (!assessmentInvites || assessmentInvites.length === 0) {
      return;
    }

    // Get the most recent invite (first in sorted array)
    const mostRecentInvite = assessmentInvites[0];

    // Skip if this invite was declined
    if (declinedInviteIds.has(mostRecentInvite.id)) {
      return;
    }

    // Skip if this invite was dismissed (Maybe Later or closed)
    if (dismissedInviteIds.has(mostRecentInvite.id)) {
      return;
    }

    // Check if invite is PENDING - show accept invite dialog
    if (mostRecentInvite.status === JobAssessmentInviteStatusEnum.PENDING) {
      if (!showInviteDialog && !pendingInvite) {
        setPendingInvite(mostRecentInvite);
        setShowInviteDialog(true);
        // Make sure application dialog is closed
        setShowApplicationConfirmDialog(false);
        setPendingApplicationInvite(null);
        setInviteDialogClosedAt(null);
      }
    }
    // If invite is ACCEPTED, check if there's an INVITED application
    else if (
      mostRecentInvite.status === JobAssessmentInviteStatusEnum.ACCEPTED
    ) {
      // Close invite dialog if open
      if (showInviteDialog) {
        setShowInviteDialog(false);
        setPendingInvite(null);
      }

      // Check if there's an INVITED application for this job
      if (applications && !hasDismissedApplicationDialog) {
        const relatedApplication = applications.find(
          (app) =>
            app.jobPostingId === mostRecentInvite.jobPostingId &&
            app.status === 'INVITED'
        );

        if (relatedApplication && !showApplicationConfirmDialog) {
          // If invite dialog was just closed, wait 3 seconds before showing application dialog
          if (inviteDialogClosedAt) {
            const timeSinceClose = Date.now() - inviteDialogClosedAt;
            if (timeSinceClose < 3000) {
              // Wait for remaining time
              const remainingTime = 3000 - timeSinceClose;
              const timeoutId = setTimeout(() => {
                setPendingApplicationInvite(relatedApplication);
                setShowApplicationConfirmDialog(true);
                setApplicationDialogMessage(null);
                setInviteDialogClosedAt(null);
              }, remainingTime);
              return () => clearTimeout(timeoutId);
            }
          }
          // Show immediately if no recent dialog close or enough time has passed
          setPendingApplicationInvite(relatedApplication);
          setShowApplicationConfirmDialog(true);
          setApplicationDialogMessage(null);
          setInviteDialogClosedAt(null);
        }
      }
    }
    // If invite is DECLINED, mark it and don't show application dialog
    else if (
      mostRecentInvite.status === JobAssessmentInviteStatusEnum.DECLINED
    ) {
      setDeclinedInviteIds((prev) => new Set([...prev, mostRecentInvite.id]));
      setShowApplicationConfirmDialog(false);
      setPendingApplicationInvite(null);
    }
  }, [
    assessmentInvites,
    applications,
    showInviteDialog,
    pendingInvite,
    showApplicationConfirmDialog,
    hasDismissedApplicationDialog,
    declinedInviteIds,
    inviteDialogClosedAt,
  ]);

  // Handle accepting invite
  const handleAcceptInvite = async () => {
    if (!pendingInvite || !profile) return;

    setIsAcceptingInvite(true);
    try {
      await candidateJobAssessmentInviteService.acceptInvite(pendingInvite.id);
      toast.success('Job invitation accepted! Redirecting to applications...');

      // Invalidate queries to refresh data
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['candidate-assessment-invites-pending'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['candidateApplications'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['candidate-applications'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['candidateJobAiAssessmentInterviews'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['candidateJobAssessmentInvites'],
        }),
      ]);

      // Close dialog and mark time for 3-second delay before showing application dialog
      setShowInviteDialog(false);
      setPendingInvite(null);
      setInviteDialogClosedAt(Date.now());

      // Redirect to applications page to apply
      setTimeout(() => {
        router.push('/app/candidate/applications');
      }, 500);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to accept job invitation');
      logger.error('Error accepting invite:', error);
    } finally {
      setIsAcceptingInvite(false);
    }
  };

  const handleDeclineInvite = async () => {
    if (!pendingInvite) return;

    setIsDecliningInvite(true);
    try {
      await candidateJobAssessmentInviteService.declineInvite(pendingInvite.id);
      toast.success('Job invitation declined.');

      // Mark this invite as declined so application dialog won't show
      setDeclinedInviteIds((prev) => new Set([...prev, pendingInvite.id]));

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['candidate-assessment-invites-pending'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['candidateJobAiAssessmentInterviews'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['candidateJobAssessmentInvites'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['candidateApplications'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['candidate-applications'],
        }),
      ]);

      setShowInviteDialog(false);
      setPendingInvite(null);
      setInviteDialogClosedAt(null);
      // Make sure application dialog is not shown
      setShowApplicationConfirmDialog(false);
      setPendingApplicationInvite(null);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to decline job invitation');
      logger.error('Error declining invite:', error);
    } finally {
      setIsDecliningInvite(false);
    }
  };

  const handleInviteApplicationAccept = async () => {
    if (!pendingApplicationInvite) return;
    let keepLoading = true;
    setIsApplicationAccepting(true);
    setApplicationDialogMessage(null);
    try {
      await candidateApplicationService.acceptApplication(
        pendingApplicationInvite.id,
        {}
      );
      setApplicationDialogMessage({
        type: 'success',
        message:
          'Application confirmed! Redirecting you to your resume to start the Job AI assessment...',
      });
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['candidateApplications'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['candidate-applications'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['candidate-profile'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['candidate-job-ai-assessment-invitations-dashboard'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['candidate-latest-job-ai-assessment'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['candidateJobAiAssessmentInterviews'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['candidate-assessment-invites-pending'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['candidate-job-ai-assessment-invitations'],
        }),
      ]);
      setTimeout(() => {
        setShowApplicationConfirmDialog(false);
        setPendingApplicationInvite(null);
        setHasDismissedApplicationDialog(true);
        setApplicationDialogMessage(null);
        setIsApplicationAccepting(false);
        router.push('/app/candidate/resume');
      }, 1500);
      keepLoading = false;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ??
        error?.message ??
        'Failed to accept application.';
      setApplicationDialogMessage({ type: 'error', message });
    } finally {
      if (keepLoading) {
        setIsApplicationAccepting(false);
      }
    }
  };

  const handleInviteApplicationDecline = async () => {
    if (!pendingApplicationInvite) return;
    let keepLoading = true;
    setIsApplicationDeclining(true);
    setApplicationDialogMessage(null);
    try {
      await candidateApplicationService.rejectApplication(
        pendingApplicationInvite.id,
        {}
      );
      setApplicationDialogMessage({
        type: 'success',
        message: 'Application declined. You can continue exploring new roles.',
      });
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['candidateApplications'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['candidate-applications'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['candidate-profile'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['candidate-job-ai-assessment-invitations-dashboard'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['candidate-latest-job-ai-assessment'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['candidateJobAiAssessmentInterviews'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['candidate-assessment-invites-pending'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['candidateJobAssessmentInvites'],
        }),
      ]);
      setTimeout(() => {
        setShowApplicationConfirmDialog(false);
        setPendingApplicationInvite(null);
        setHasDismissedApplicationDialog(true);
        setApplicationDialogMessage(null);
        setIsApplicationDeclining(false);
      }, 1200);
      keepLoading = false;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ??
        error?.message ??
        'Failed to decline application.';
      setApplicationDialogMessage({ type: 'error', message });
    } finally {
      if (keepLoading) {
        setIsApplicationDeclining(false);
      }
    }
  };

  const handleInviteApplicationMaybeLater = () => {
    setShowApplicationConfirmDialog(false);
    setHasDismissedApplicationDialog(true);
  };

  const handleUpdateAssessmentAnaltyics = async () => {
    try {
      if (
        latestOnboardingAssessment &&
        latestOnboardingAssessment.result !==
          OnboardingAssessmentResultEnum.NOT_AVAILABLE &&
        user?.id &&
        candidateId
      ) {
        try {
          await liveAssessmentAnalyticsService.upsertAnalytics(
            latestOnboardingAssessment.id,
            candidateId,
            latestOnboardingAssessment.duration || 0,
            latestOnboardingAssessment?.status as OnboardingAssessmentStatusEnum,
            latestOnboardingAssessment.result,
            'ONBOARDING_ASSESSMENT',
            user.id,
            'candidate'
          );
        } catch (error) {
          logger.error('Error updating onboarding analytics:', error);
        }
      }

      if (
        latestJobAiAssessment &&
        latestJobAiAssessment.result !==
          JobAiAssessmentResultEnum.NOT_AVAILABLE &&
        user?.id &&
        candidateId
      ) {
        try {
          await liveAssessmentAnalyticsService.upsertAnalytics(
            latestJobAiAssessment.id,
            candidateId,
            latestJobAiAssessment.duration || 0,
            latestJobAiAssessment.status as JobAiAssessmentStatusEnum,
            latestJobAiAssessment.result,
            'JOB_AI_ASSESSMENT',
            user.id,
            'candidate'
          );
        } catch (error) {
          logger.error('Error updating job AI analytics:', error);
        }
      }
    } catch (error) {
      logger.error('Error updating assessment analytics:', error);
    }
  };

  React.useEffect(() => {
    handleUpdateAssessmentAnaltyics();
  }, [
    latestOnboardingAssessment,
    latestJobAiAssessment,
    candidateId,
    user?.id,
    liveAssessmentAnalyticsService,
  ]);

  const getApplicationStats = () => {
    if (!applications) return null;

    const total = applications.length;
    const pending = applications.filter(
      (app) => app.status?.toLowerCase() === 'pending'
    ).length;
    const reviewing = applications.filter(
      (app) => app.status?.toLowerCase() === 'reviewing'
    ).length;
    const shortlisted = applications.filter(
      (app) => app.status?.toLowerCase() === 'shortlisted'
    ).length;
    const rejected = applications.filter(
      (app) => app.status?.toLowerCase() === 'rejected'
    ).length;

    return {
      total,
      pending,
      reviewing,
      shortlisted,
      rejected,
      successRate: total > 0 ? ((shortlisted / total) * 100).toFixed(1) : '0',
    };
  };

  const candidateRole = user?.role || null;
  const stats = getApplicationStats();

  // Calculate completion percentage with fallback - Make this reactive to both profile and resume changes
  const completionPercentage = React.useMemo(() => {
    if (!profile) return 0;
    return getProfileCompletionPercentage(profile, resume);
  }, [profile, resume]); // Dependencies: both profile and resume

  if (isProfileLoading || isApplicationsLoading || isResumeLoading) {
    return (
      <div className="space-y-6 p-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[200px] w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (profileError || applicationsError) {
    return (
      <div className="space-y-6 p-4">
        <div className="border-destructive/20 bg-destructive/10 text-destructive rounded-lg border p-4">
          <h2 className="mb-2 text-lg font-semibold">Error Loading Data</h2>
          <p>
            There was a problem loading your data. Please try refreshing the
            page or contact support if the issue persists.
          </p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="space-y-6 px-4 pt-2 pb-10">
      <EmailVerificationBanner />
      <DashboardGreeting />

      {/* Dashboard CTA - Journey-based prompts at the top */}
      <DashboardCta
        profile={{ ...profile, completionPercentage }}
        isInviteSignupCandidate={isInviteSignupCandidate}
        jobAiAssessmentInvitation={acceptedJobAiInvitation}
        jobAiAssessment={latestJobAiAssessment || null}
        onboardingAssessment={latestOnboardingAssessment || null}
        onStartJobAiAssessment={handleStartJobAiAssessment}
        isStartingJobAiAssessment={isStartingJobAiAssessment}
      />

      {/* Role-based Dashboard Content */}
      {candidateRole === UserRoleEnum.PARTNER_RESOURCE ? (
        <PartnerResourceDashboard
          profile={{ ...profile, completionPercentage }}
        />
      ) : (
        <IndividualDashboard
          profile={{ ...profile, completionPercentage }}
          applications={applications || []}
          stats={stats}
        />
      )}

      {/* Accept Invite Dialog for Invited Candidates */}
      <AcceptInviteDialog
        open={showInviteDialog}
        onOpenChange={(open) => {
          setShowInviteDialog(open);
          if (!open && pendingInvite) {
            // Mark invite as dismissed when dialog is closed (X button or outside click)
            setDismissedInviteIds(
              (prev) => new Set([...prev, pendingInvite.id])
            );
            setInviteDialogClosedAt(Date.now());
            setPendingInvite(null);
          }
        }}
        invite={pendingInvite}
        onAccept={handleAcceptInvite}
        isAccepting={isAcceptingInvite}
        onDecline={handleDeclineInvite}
        isDeclining={isDecliningInvite}
        onMaybeLater={() => {
          if (pendingInvite) {
            // Mark invite as dismissed when "Maybe Later" is clicked
            setDismissedInviteIds(
              (prev) => new Set([...prev, pendingInvite.id])
            );
          }
          setShowInviteDialog(false);
          setPendingInvite(null);
          setInviteDialogClosedAt(Date.now());
        }}
      />
      {/* Invite-signup application confirmation dialog */}
      <AcceptInviteDialog
        mode="application"
        open={showApplicationConfirmDialog}
        onOpenChange={(isOpen) => {
          setShowApplicationConfirmDialog(isOpen);
          if (!isOpen) {
            setHasDismissedApplicationDialog(true);
          }
        }}
        application={pendingApplicationInvite}
        onAccept={handleInviteApplicationAccept}
        isAccepting={isApplicationAccepting}
        onDecline={handleInviteApplicationDecline}
        isDeclining={isApplicationDeclining}
        infoMessage={applicationDialogMessage}
        onMaybeLater={handleInviteApplicationMaybeLater}
      />
    </div>
  );
}

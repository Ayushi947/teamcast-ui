'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context/app-context';
import {
  candidateProfileService,
  candidateResumeAssessmentService,
  candidateOnboardingAssessmentService,
  activityLogService,
  candidateResumeService,
  candidateJobAiAssessmentService,
} from '@/lib/services/services';
import { JobAiAssessmentInviteStatusEnum } from '@/lib/shared';
import {
  ICandidateProfile,
  CandidateResumeAssessmentStatusEnum,
  ActivityModuleEnum,
  ActivityEntityTypeEnum,
  IResume,
  IResumeAssessment,
  logger,
  ICandidateProfileBasicUpdate,
  IResumeUpdate,
  candidateProfileBasicUpdateValidator,
  CandidateOnboardingAssessmentStatusEnum,
} from '@/lib/shared';
import { ActivityActionEnums, ActivityTitleEnum } from '@/lib/models/activity';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { z } from 'zod';
import {
  useCreateNotification,
  createNotificationHelpers,
} from '@/lib/services/notification.service';
import { ProfileBasicInfoEdit } from './components/profie-basic-info-edit';

import { getProfileCompletionPercentage } from '@/lib/utils/profile-completion';

// Import new modular components
import { ProfileHeader } from './components/profile-header';
import { ProfileCard } from './components/profile-card';
import { ProfessionalSummary } from './components/professional-summary';
import { AssessmentCards } from './components/asssessment-cards';
import { ProfessionalDetails } from './components/professional-details';
import { LoadingOverlay } from './components/loading-overlay';
import ResumeAssessmentDialog from './components/dialog/resume-assessment-dialog';
import TourGuide from '@/components/tour/tour-guide';

interface EditFormData {
  name: string;
  jobTitle: string;
  location: string;
  summary: string;
  totalExperience: string;
  industriesString: string;
  languagesString: string;
  resumeSkillsString: string;
}

const CandidateResumePage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useApp();
  const [isStartingResumeAssessment, _setIsStartingResumeAssessment] =
    useState(false);
  const [isStartingOnboardingAssessment, setIsStartingOnboardingAssessment] =
    useState(false);
  const { data: profile, isLoading: isProfileLoading } =
    useQuery<ICandidateProfile>({
      queryKey: ['candidate-profile'],
      queryFn: () => candidateProfileService.getProfile(),
    });
  const [open, setOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const createNotification = useCreateNotification();
  const notificationHelpers = createNotificationHelpers(createNotification);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [editFormData, setEditFormData] = useState<EditFormData>({
    name: '',
    jobTitle: '',
    location: '',
    summary: '',
    totalExperience: '',
    industriesString: '',
    languagesString: '',
    resumeSkillsString: '',
  });
  const [isPolling, setIsPolling] = useState(false);
  const [pollingMessage, setPollingMessage] = useState('');
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  const PROCESSING_MESSAGES = [
    'Analyzing your profile details and professional background...',
    'Reviewing your work experience and career progression...',
    'Evaluating your technical skills and professional competencies...',
    'Checking your educational qualifications and academic achievements...',
    'Almost there! We are putting together your comprehensive profile assessment...',
    'Finalizing the assessment and preparing your personalized insights...',
  ];

  const candidateId = user?.candidateId;
  const candidateName = user?.name;

  const { data: resumeAssessment, refetch: refetchResumeAssessment } =
    useQuery<IResumeAssessment>({
      queryKey: ['resume-assessment'],
      queryFn: () => candidateResumeAssessmentService.getLatestAssessment(),
      enabled:
        profile?.resumeAssessmentStatus ===
        CandidateResumeAssessmentStatusEnum.ASSESSMENT_COMPLETED,
      staleTime: 0, // Always consider data stale
      gcTime: 0, // Don't cache the data
      refetchOnWindowFocus: true, // Refetch when window gains focus
      refetchInterval: false, // Don't auto-refetch on interval
    });

  const { data: resume, isLoading: isResumeLoading } = useQuery<IResume>({
    queryKey: ['candidate-resume'],
    queryFn: () => candidateResumeService.getResume(),
  });
  const { data: onboardingAssessment } = useQuery({
    queryKey: ['onboarding-assessment'],
    queryFn: () => candidateOnboardingAssessmentService.getLatestAssessment(),
    enabled:
      profile?.onboardingAssessmentStatus ===
        CandidateOnboardingAssessmentStatusEnum.ASSESSMENT_COMPLETED ||
      profile?.onboardingAssessmentStatus ===
        CandidateOnboardingAssessmentStatusEnum.ASSESSMENT_IN_PROGRESS,
    refetchInterval: (query) => {
      // Poll when assessment is completed by candidate - until profile updates to ASSESSMENT_COMPLETED
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
        return 5000; // Poll every 5 seconds
      }
      return false;
    },
  });

  const shouldPollForOnboardingCompletion =
    profile?.onboardingAssessmentStatus ===
      CandidateOnboardingAssessmentStatusEnum.ASSESSMENT_IN_PROGRESS &&
    onboardingAssessment?.status &&
    [
      'CANDIDATE_ASSESSMENT_COMPLETED',
      'AI_REVIEW_IN_PROGRESS',
      'AI_REVIEW_COMPLETED',
      'ASSESSMENT_COMPLETED',
    ].includes(onboardingAssessment.status);

  useEffect(() => {
    if (!shouldPollForOnboardingCompletion) return;

    const poll = async () => {
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['candidate-profile'] }),
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

  // Fetch job AI assessment invitations (similar to interviews page)
  const { data: jobAiAssessmentInvitations } = useQuery({
    queryKey: ['candidate-job-ai-assessment-invitations'],
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

  // Get the most recent job AI assessment invitation for an accepted application
  // Show Job AI Assessment card only when there's an accepted application (status = APPLIED)
  const acceptedJobAiInvitation = React.useMemo(() => {
    if (!jobAiAssessmentInvitations || jobAiAssessmentInvitations.length === 0)
      return null;

    // Filter for invitations where the job application is accepted (APPLIED status)
    // Exclude invitations where the related job application was declined
    const acceptedInvitations = jobAiAssessmentInvitations.filter(
      (invite: any) => {
        // Exclude if job application was declined
        if (
          invite.jobApplicationDeclinedAt ||
          invite.jobApplicationStatus === 'DECLINED'
        ) {
          return false;
        }

        // Only include invitations where application status is APPLIED (or higher statuses like REVIEWING, SHORTLISTED, etc.)
        // This means the candidate has accepted/applied to the application
        const applicationStatus = invite.jobApplicationStatus;
        const appliedStatuses = [
          'APPLIED',
          'REVIEWING',
          'SHORTLISTED',
          'ASSESSING',
          'OFFERED',
          'ACCEPTED',
        ];

        if (
          applicationStatus &&
          appliedStatuses.includes(applicationStatus) &&
          invite.jobApplicationAcceptedAt
        ) {
          return true;
        }

        return false;
      }
    );

    if (acceptedInvitations.length === 0) return null;

    // Sort by jobApplicationAcceptedAt descending (most recently accepted application first)
    const sorted = acceptedInvitations.sort((a: any, b: any) => {
      const dateA = new Date(a.jobApplicationAcceptedAt || 0).getTime();
      const dateB = new Date(b.jobApplicationAcceptedAt || 0).getTime();
      return dateB - dateA; // Most recent first
    });

    return sorted[0];
  }, [jobAiAssessmentInvitations]);

  // Calculate completion percentage with fallback - Make this reactive to both profile and resume changes
  const completionPercentage = React.useMemo(() => {
    if (!profile) return 0;
    return getProfileCompletionPercentage(profile, resume);
  }, [profile, resume]); // Dependencies: both profile and resume

  const handleStartOnboardingAssessment = async () => {
    try {
      setIsStartingOnboardingAssessment(true);
      const result =
        await candidateOnboardingAssessmentService.initializeAssessment();

      if (!result?.id) {
        throw new Error('Failed to start onboarding assessment');
      }

      toast.success('Onboarding assessment started successfully');

      // Create activity log
      if (user?.candidateId) {
        await activityLogService.createActivityLog({
          entityId: user.candidateId,
          module: ActivityModuleEnum.CANDIDATE,
          action: ActivityActionEnums.START_ASSESSMENT,
          entityType: ActivityEntityTypeEnum.AI_ASSESSMENT,
          description: 'Started onboarding assessment',
          metadata: {
            candidateId: user.candidateId,
            title: ActivityTitleEnum.ASSESSMENT_COMPLETED,
            userName: user.name,
          },
        });
      }

      // Refresh profile data
      await queryClient.invalidateQueries({ queryKey: ['candidate-profile'] });

      // Redirect to assessment page
      router.push('/app/candidate/assessments/onboarding/check');
    } catch (error) {
      toast.error('Failed to start onboarding assessment');
      logger.error('Error starting onboarding assessment:', error);
    } finally {
      setIsStartingOnboardingAssessment(false);
    }
  };

  const updateResumeMutation = useMutation({
    mutationFn: (data: IResumeUpdate) =>
      candidateResumeService.updateResume(data),
    onSuccess: async () => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['candidate-resume'] });
      queryClient.invalidateQueries({ queryKey: ['candidate-profile'] });

      // Force refetch to update UI immediately - wait for completion
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['candidate-resume'] }),
        queryClient.refetchQueries({ queryKey: ['candidate-profile'] }),
      ]);
    },
    onError: (error: Error) => {
      toast.error('Failed to update resume');
      logger.error(error, 'Failed to update resume');
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: ICandidateProfileBasicUpdate) =>
      candidateProfileService.updateBasicProfile(data),
    onSuccess: async () => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['candidate-profile'] });

      // Force refetch to update UI immediately - wait for completion
      await queryClient.refetchQueries({ queryKey: ['candidate-profile'] });
      toast.success('Profile updated successfully');
      setShowEditModal(false);
      setFormErrors({});
      setTouched({});
      setIsFormSubmitting(false);

      // Send notification for profile update
      if (user?.id) {
        await notificationHelpers.profileUpdate(user.id, 'candidate', {
          action: 'Profile information updated',
          section: 'Basic Information',
        });
      }
    },
    onError: async (error: Error) => {
      toast.error('Failed to update profile');
      logger.error(error, 'Failed to update profile');

      // Send error notification
      if (user?.id) {
        await createNotification({
          userId: user.id,
          userType: 'candidate',
          title: 'Profile Update Failed',
          message:
            'There was an error updating your profile information. Please try again.',
          type: 'error',
          priority: 'medium',
        });
      }
    },
  });

  const validateField = (field: keyof typeof editFormData, value: any) => {
    try {
      // Use only the profile validator since it now includes all form fields
      const schema = candidateProfileBasicUpdateValidator.shape
        .body as z.ZodObject<any>;

      // Handle special cases for validation
      if (field === 'totalExperience') {
        // Parse totalExperience as string for profile validator
        schema.shape[field]?.parse(value);
      } else {
        schema.shape[field as keyof typeof schema.shape]?.parse(value);
      }

      return { success: true, error: undefined };
    } catch (error) {
      // Check if error is a ZodError by checking its properties
      if (error && typeof error === 'object' && 'errors' in error) {
        const zodError = error as z.ZodError;
        const fieldError = zodError.errors[0]?.message;
        return { success: false, error: fieldError };
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Invalid input',
      };
    }
  };

  const validateForm = () => {
    try {
      // Use only profile validator since it now includes all form fields
      candidateProfileBasicUpdateValidator.shape.body.parse({
        name: editFormData.name,
        jobTitle: editFormData.jobTitle,
        location: editFormData.location,
        summary: editFormData.summary,
        totalExperience: editFormData.totalExperience,
        industriesString: editFormData.industriesString,
        languagesString: editFormData.languagesString,
        resumeSkillsString: editFormData.resumeSkillsString,
      });

      setFormErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const path = err.path[0] as string;
          if (path) {
            newErrors[path] = err.message;
          }
        });
        setFormErrors(newErrors);
      }
      return false;
    }
  };

  const handleChange = (field: keyof typeof editFormData, value: any) => {
    setEditFormData({ ...editFormData, [field]: value });
    if (touched[field]) {
      validateForm();
    }
  };

  const handleBlur = (field: keyof typeof editFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const validation = validateField(field, editFormData[field]);
    if (!validation.success) {
      setFormErrors((prev) => ({ ...prev, [field]: validation.error || '' }));
    } else {
      const newErrors = { ...formErrors };
      delete newErrors[field];
      setFormErrors(newErrors);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    // Prevent default form submission behavior
    e.preventDefault();

    setTouched((prev) => ({
      ...prev,
      ...Object.keys(editFormData).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {}
      ),
    }));

    if (!validateForm()) {
      setFormErrors((prev) => ({
        ...prev,
        form: 'Please fix the errors in the form before submitting',
      }));
      return;
    }

    setIsFormSubmitting(true);

    try {
      // Prepare the resume update data (convert string fields to arrays)
      const resumeUpdate = {
        location: editFormData.location,
        summary: editFormData.summary,
        totalExperience:
          editFormData.totalExperience === ''
            ? 0
            : parseInt(editFormData.totalExperience, 10),
        industries: editFormData.industriesString
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s),
        languages: editFormData.languagesString
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s),
        resumeSkills: editFormData.resumeSkillsString
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s),
      };

      // Prepare the profile update data
      const profileUpdate = {
        name: editFormData.name,
        jobTitle: editFormData.jobTitle,
      };

      // Update both in parallel
      await Promise.all([
        updateResumeMutation.mutateAsync(resumeUpdate),
        updateProfileMutation.mutateAsync(profileUpdate),
      ]);
    } catch (error) {
      // Error is already handled by the mutations
      logger.error(error, 'Failed to update profile');
    } finally {
      setIsFormSubmitting(false);
    }
  };

  const handleSubmitForReview = async () => {
    try {
      setIsPolling(true);
      setPollingMessage(PROCESSING_MESSAGES[0]);
      let messageIndex = 0;

      // Send notification that assessment is starting
      if (user?.id) {
        createNotification({
          userId: user.id,
          userType: 'candidate',
          title: 'Profile Assessment Started',
          message:
            "Your profile assessment has begun. We will notify you when it's complete.",
          type: 'info',
          priority: 'medium',
        });
      }

      // Start the assessment
      const task = await candidateResumeAssessmentService.startAssessment();

      if (!task) {
        throw new Error('No task data received');
      }

      // Poll for task status
      const pollTask = async () => {
        try {
          const currentTask =
            await candidateResumeAssessmentService.getAssessmentTask(task.id);

          if (!currentTask) {
            throw new Error('No task data received');
          }

          switch (currentTask.status) {
            case 'COMPLETED':
              setIsPolling(false);
              setPollingMessage('');

              await Promise.all([
                queryClient.invalidateQueries({
                  queryKey: ['candidate-profile'],
                }),
                queryClient.invalidateQueries({
                  queryKey: ['resume-assessment'],
                }),
                queryClient.invalidateQueries({
                  queryKey: ['candidate-resume'],
                }),
                queryClient.invalidateQueries({
                  queryKey: ['onboarding-assessment'],
                }),
              ]);
              await refetchResumeAssessment();

              setTimeout(() => {
                toast.success('Profile assessment completed successfully');
              }, 500);
              // Send success notification
              if (user?.id) {
                await notificationHelpers.assessmentCompleted(
                  user.id,
                  'candidate',
                  {
                    type: 'Profile Assessment',
                    result: 'Completed successfully',
                  }
                );
              }

              // Refetch profile data
              await queryClient.invalidateQueries({
                queryKey: ['candidate-profile'],
              });
              await queryClient.invalidateQueries({
                queryKey: ['candidate-resume'],
              });
              await queryClient.invalidateQueries({
                queryKey: ['candidate-profile'],
              });
              await activityLogService.createActivityLog({
                entityId: candidateId,
                module: ActivityModuleEnum.CANDIDATE,
                action: ActivityActionEnums.COMPLETE_ASSESSMENT,
                entityType: ActivityEntityTypeEnum.AI_ASSESSMENT,
                description: 'Candidate profile assessment completed',
                metadata: {
                  candidateId: candidateId,
                  title: ActivityTitleEnum.PROFILE_ASSESSMENT_COMPLETED,
                  userName: candidateName,
                },
              });
              break;
            case 'FAILED':
              setIsPolling(false);
              setPollingMessage('');
              toast.error(
                `Assessment failed: ${currentTask.error || 'Unknown error'}`
              );

              // Send failure notification
              if (user?.id) {
                await createNotification({
                  userId: user.id,
                  userType: 'candidate',
                  title: 'Profile Assessment Failed',
                  message: `Your profile assessment failed: ${currentTask.error || 'Unknown error'}. Please try again or contact support.`,
                  type: 'error',
                  priority: 'high',
                  actionUrl: '/app/candidate/resume',
                  actionText: 'Retry Assessment',
                });
              }

              await activityLogService.createActivityLog({
                entityId: candidateId,
                module: ActivityModuleEnum.CANDIDATE,
                action: ActivityActionEnums.FAIL_ASSESSMENT,
                entityType: ActivityEntityTypeEnum.AI_ASSESSMENT,
                description: `Candidate profile assessment failed: ${currentTask.error || 'Unknown error'}`,
                metadata: {
                  candidateId,
                  title: ActivityTitleEnum.PROFILE_ASSESSMENT_FAILED,
                  userName: candidateName,
                  error: currentTask.error || 'Unknown error',
                },
              });
              break;
            case 'PENDING':
            case 'PROCESSING':
              setPollingMessage(PROCESSING_MESSAGES[messageIndex]);
              messageIndex = (messageIndex + 1) % PROCESSING_MESSAGES.length;
              // Continue polling
              setTimeout(pollTask, 2000);
              break;
            default:
              setPollingMessage('Processing your profile...');
              // Continue polling
              setTimeout(pollTask, 2000);
          }
        } catch (error) {
          setIsPolling(false);
          setPollingMessage('');
          toast.error('Failed to check assessment status');
          logger.error('Error polling assessment task:', error);
        }
      };

      // Start polling
      pollTask();
    } catch (error) {
      setIsPolling(false);
      setPollingMessage('');
      toast.error('Failed to submit profile for review');
      logger.error('Error submitting profile for review:', error);

      // Send error notification
      if (user?.id) {
        await createNotification({
          userId: user.id,
          userType: 'candidate',
          title: 'Profile Submission Failed',
          message:
            'There was an error submitting your profile for review. Please try again.',
          type: 'error',
          priority: 'medium',
          actionUrl: '/app/candidate/resume',
          actionText: 'Try Again',
        });
      }
    }
  };

  const handleEditClick = () => {
    setEditFormData({
      name: profile?.name || '',
      jobTitle: profile?.jobTitle || '',
      location: resume?.location || '',
      summary: resume?.summary || '',
      totalExperience: resume?.totalExperience?.toString() || '',
      industriesString: resume?.industries?.join(', ') || '',
      languagesString: resume?.languages?.join(', ') || '',
      resumeSkillsString: resume?.resumeSkills?.join(', ') || '',
    });
    setFormErrors({});
    setTouched({});
    setIsFormSubmitting(false);
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setFormErrors({});
    setTouched({});
    setIsFormSubmitting(false);
  };

  if (isProfileLoading || isResumeLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-muted-foreground">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-muted-foreground">No profile data available</div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full space-y-6 px-4 pt-2 pb-10">
        {/* Header */}
        <ProfileHeader />

        {/* Profile info and Professional summary */}
        <div className="flex h-full w-full flex-col flex-wrap gap-4 md:min-h-[1px] md:flex-row md:items-stretch">
          {/* Profile info */}
          <div className="flex w-full basis-1/4 md:flex-col">
            <ProfileCard
              profile={{ ...profile, completionPercentage }}
              resume={resume}
            />
          </div>
          {/* Professional Summary */}
          <div className="w-full md:flex-1">
            <ProfessionalSummary
              profile={{ ...profile, completionPercentage }}
              resume={resume}
              onEditClick={handleEditClick}
            />
          </div>
        </div>

        {/* Assessment Cards */}
        <AssessmentCards
          profile={{ ...profile, completionPercentage }}
          resumeAssessment={resumeAssessment}
          onboardingAssessment={onboardingAssessment}
          isStartingResumeAssessment={isStartingResumeAssessment}
          isStartingOnboardingAssessment={isStartingOnboardingAssessment}
          onStartResumeAssessment={handleSubmitForReview}
          onStartOnboardingAssessment={handleStartOnboardingAssessment}
          onViewResumeAssessment={() => setOpen(true)}
          jobAiAssessmentInvitationId={acceptedJobAiInvitation?.id}
          jobAiAssessmentInvitation={acceptedJobAiInvitation}
        />

        {/* Professional Details */}
        <ProfessionalDetails />
      </div>

      {/* Loading Overlay */}
      <LoadingOverlay isPolling={isPolling} pollingMessage={pollingMessage} />

      {/* Dialogs */}
      {profile.resumeAssessmentStatus ===
        CandidateResumeAssessmentStatusEnum.ASSESSMENT_COMPLETED && (
        <ResumeAssessmentDialog
          open={open}
          onOpenChange={setOpen}
          resumeAssessment={resumeAssessment as IResumeAssessment}
        />
      )}

      <ProfileBasicInfoEdit
        showEditModal={showEditModal}
        setShowEditModal={handleCloseModal}
        formErrors={formErrors}
        touched={touched}
        editFormData={editFormData}
        handleChange={handleChange}
        handleBlur={handleBlur}
        handleEditSubmit={handleEditSubmit}
        updateProfileMutation={{
          isPending: isFormSubmitting,
        }}
        setTouched={setTouched}
        setFormErrors={setFormErrors}
        validateField={validateField}
      />
      <TourGuide tourKey="candidate_resume_page_tour_guide" />
    </>
  );
};

export default CandidateResumePage;

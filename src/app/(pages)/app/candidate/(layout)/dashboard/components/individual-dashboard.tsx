'use client';

import { FC, useMemo, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  candidateResumeAssessmentService,
  candidateOnboardingAssessmentService,
  candidateResumeService,
  candidateRecommendationApiService,
  candidateJobAiAssessmentService,
} from '@/lib/services/services';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  CheckCircle,
  Clock,
  FileText,
  TrendingUp,
  Star,
  MapPin,
  Building,
  DollarSign,
  ArrowRight,
  AlertCircle,
  Brain,
  Briefcase,
  Calendar,
  Eye,
  MessageSquare,
  Gift,
  GraduationCap,
  Award,
  ArrowUpRight,
  Search,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  ICandidateProfile,
  ICandidateJobApplication,
  ResumeAssessmentRecommendationEnum,
  IResumeAssessment,
  ICandidateOnboardingAssessment,
  OnboardingAssessmentRecommendationEnum,
  OnboardingAssessmentStatusEnum,
  CandidateResumeAssessmentStatusEnum,
  CandidateOnboardingAssessmentStatusEnum,
  IResume,
  JobAiAssessmentInviteStatusEnum,
  logger,
} from '@/lib/shared';
import { formatDistanceToNow } from 'date-fns';
import { formatEnumValue } from '@/lib/utils';
import { subMonths, isSameMonth, subWeeks, isAfter } from 'date-fns';
import { useApp } from '@/lib/context/app-context';
import { Skeleton } from '@/components/ui/skeleton';
import { TourGuide } from '@/components/tour/tour-guide';

interface IndividualDashboardProps {
  profile: ICandidateProfile;
  applications: ICandidateJobApplication[];
  stats: {
    total: number;
    pending: number;
    reviewing: number;
    shortlisted: number;
    rejected: number;
    successRate: string;
  } | null;
}

export const IndividualDashboard: FC<IndividualDashboardProps> = ({
  profile,
  applications,
  stats,
}) => {
  const router = useRouter();
  const { user } = useApp();
  const candidateId = user?.candidateId;
  // Calculate changes for dashboard cards
  const calculateChanges = () => {
    if (!applications || applications.length === 0) {
      return {
        totalChange: '0 this week',
        inProgressChange: '0 updated today',
        shortlistedChange: '0 this week',
        successRateChange: '0% this month',
        successRateChangeType: 'neutral' as const,
      };
    }

    const now = new Date();
    const lastWeek = subWeeks(now, 1);
    const lastMonth = subMonths(now, 1);
    const today = new Date(now.setHours(0, 0, 0, 0));

    // Total applications this week
    const applicationsThisWeek = applications.filter((app) => {
      const appliedAt = new Date(app.appliedAt);
      return isAfter(appliedAt, lastWeek);
    }).length;

    // In progress updated today
    const updatedToday = applications.filter((app) => {
      const updatedAt = new Date(app.updatedAt);
      return (
        isAfter(updatedAt, today) &&
        ['pending', 'reviewing'].includes(app.status?.toLowerCase() || '')
      );
    }).length;

    // Shortlisted this week
    const shortlistedThisWeek = applications.filter((app) => {
      const updatedAt = new Date(app.updatedAt);
      return (
        isAfter(updatedAt, lastWeek) &&
        app.status?.toLowerCase() === 'shortlisted'
      );
    }).length;

    // Calculate success rate change
    let thisMonthShortlisted = 0;
    let thisMonthTotal = 0;
    let lastMonthShortlisted = 0;
    let lastMonthTotal = 0;

    applications.forEach((app) => {
      const appliedAt = new Date(app.appliedAt);

      if (isSameMonth(appliedAt, now)) {
        thisMonthTotal++;
        if (app.status?.toLowerCase() === 'shortlisted') {
          thisMonthShortlisted++;
        }
      } else if (isSameMonth(appliedAt, lastMonth)) {
        lastMonthTotal++;
        if (app.status?.toLowerCase() === 'shortlisted') {
          lastMonthShortlisted++;
        }
      }
    });

    const thisMonthRate =
      thisMonthTotal > 0 ? (thisMonthShortlisted / thisMonthTotal) * 100 : 0;
    const lastMonthRate =
      lastMonthTotal > 0 ? (lastMonthShortlisted / lastMonthTotal) * 100 : 0;
    const successRateDiff = thisMonthRate - lastMonthRate;
    const successRateChange = successRateDiff.toFixed(1);
    const successRateChangeType =
      successRateDiff >= 0 ? ('positive' as const) : ('negative' as const);

    return {
      totalChange: `+${applicationsThisWeek} this week`,
      inProgressChange: `${updatedToday} updated today`,
      shortlistedChange: `+${shortlistedThisWeek} this week`,
      successRateChange: `${successRateDiff > 0 ? '+' : ''}${successRateChange}% this month`,
      successRateChangeType,
    };
  };

  const changes = calculateChanges();

  // Fetch resume assessment data
  const { data: resumeAssessment, isLoading: isResumeAssessmentLoading } =
    useQuery<IResumeAssessment>({
      queryKey: ['resume-assessment'],
      queryFn: () => candidateResumeAssessmentService.getLatestAssessment(),
      enabled:
        profile.resumeAssessmentStatus ===
        CandidateResumeAssessmentStatusEnum.ASSESSMENT_COMPLETED,
    });

  const queryClient = useQueryClient();

  // Fetch onboarding assessment data
  const {
    data: onboardingAssessment,
    isLoading: isOnboardingAssessmentLoading,
  } = useQuery<ICandidateOnboardingAssessment>({
    queryKey: ['onboarding-assessment'],
    queryFn: () => candidateOnboardingAssessmentService.getLatestAssessment(),
    enabled:
      profile.onboardingAssessmentStatus ===
        CandidateOnboardingAssessmentStatusEnum.ASSESSMENT_COMPLETED ||
      profile.onboardingAssessmentStatus ===
        CandidateOnboardingAssessmentStatusEnum.ASSESSMENT_IN_PROGRESS,
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
    profile.onboardingAssessmentStatus ===
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
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['candidate-profile'] });
      queryClient.invalidateQueries({ queryKey: ['onboarding-assessment'] });
      queryClient.invalidateQueries({
        queryKey: ['candidate-latest-onboarding-assessment'],
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [shouldPollForOnboardingCompletion, queryClient]);

  // Fetch resume data for skills count
  const { data: resume } = useQuery<IResume>({
    queryKey: ['candidate-resume'],
    queryFn: () => candidateResumeService.getResume(),
  });

  const { data: jobRecommendations } = useQuery({
    queryKey: ['jobRecommendations'],
    queryFn: () =>
      candidateRecommendationApiService.getCandidateRecommendations(
        candidateId as string,
        {
          data: undefined,
          filters: {},
          pagination: { page: 1, limit: 10 },
        }
      ),
    enabled: !!candidateId,
  });

  // Fetch job AI assessment invitations (similar to resume page)
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
  const acceptedJobAiInvitation = useMemo(() => {
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

        // Only include invitations where application status is APPLIED (or higher statuses)
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

  // Determine if we should show Job AI Assessment instead of Screening Assessment
  const shouldShowJobAiAssessment = !!(
    acceptedJobAiInvitation &&
    acceptedJobAiInvitation.jobApplicationAcceptedAt &&
    acceptedJobAiInvitation.jobApplicationStatus &&
    [
      'APPLIED',
      'REVIEWING',
      'SHORTLISTED',
      'ASSESSING',
      'OFFERED',
      'ACCEPTED',
    ].includes(acceptedJobAiInvitation.jobApplicationStatus)
  );

  const calculateTotalExperience = (experience: any[]) => {
    if (!experience || experience.length === 0) return 0;

    let totalMonths = 0;

    experience.forEach((exp) => {
      const startDate = new Date(exp.startDate);
      const endDate = exp.endDate ? new Date(exp.endDate) : new Date(); // If endDate is null, use current date

      // Calculate months between dates
      const months = (endDate.getFullYear() - startDate.getFullYear()) * 12;
      totalMonths += months + (endDate.getMonth() - startDate.getMonth());
    });

    // Convert months to years (with 1 decimal place)
    const totalYears = Math.round((totalMonths / 12) * 10) / 10;

    return totalYears;
  };

  const getApplicationStatusCounts = () => {
    if (!applications)
      return { applied: 0, interviewing: 0, offered: 0, rejected: 0 };

    return {
      applied: applications.filter((app) =>
        ['pending', 'reviewing'].includes(app.status?.toLowerCase() || '')
      ).length,
      interviewing: applications.filter(
        (app) => app.status?.toLowerCase() === 'shortlisted'
      ).length,
      offered: applications.filter(
        (app) => app.status?.toLowerCase() === 'offered'
      ).length,
      rejected: applications.filter(
        (app) => app.status?.toLowerCase() === 'rejected'
      ).length,
    };
  };

  const getResumeRecommendationBadge = (
    recommendation?: ResumeAssessmentRecommendationEnum
  ) => {
    if (!recommendation) return null;

    switch (recommendation) {
      case ResumeAssessmentRecommendationEnum.RECOMMENDED:
        return (
          <Badge variant="success" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            Recommended
          </Badge>
        );
      case ResumeAssessmentRecommendationEnum.HIGHLY_RECOMMENDED:
        return (
          <Badge variant="success" className="gap-1">
            <Star className="h-3 w-3" />
            Highly Recommended
          </Badge>
        );
      case ResumeAssessmentRecommendationEnum.NOT_RECOMMENDED:
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            Not Recommended
          </Badge>
        );
      default:
        return null;
    }
  };

  const getOnboardingRecommendationBadge = (
    recommendation?: OnboardingAssessmentRecommendationEnum
  ) => {
    if (!recommendation) return null;

    switch (recommendation) {
      case OnboardingAssessmentRecommendationEnum.RECOMMENDED:
        return (
          <Badge variant="success" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            Recommended
          </Badge>
        );
      case OnboardingAssessmentRecommendationEnum.HIGHLY_RECOMMENDED:
        return (
          <Badge variant="success" className="gap-1">
            <Star className="h-3 w-3" />
            Highly Recommended
          </Badge>
        );
      case OnboardingAssessmentRecommendationEnum.NOT_RECOMMENDED:
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            Not Recommended
          </Badge>
        );
      default:
        return null;
    }
  };

  const applicationCounts = getApplicationStatusCounts();

  const applicationStatus = [
    {
      key: 'applied',
      label: 'Applied',
      value: applicationCounts.applied,
      status: 'pending',
    },
    {
      key: 'interviewing',
      label: 'Interviewing',
      value: applicationCounts.interviewing,
      status: 'shortlisted',
    },
    {
      key: 'offered',
      label: 'Offered',
      value: applicationCounts.offered,
      status: 'offered',
    },
    {
      key: 'rejected',
      label: 'Rejected',
      value: applicationCounts.rejected,
      status: 'rejected',
    },
  ];
  const cardData = [
    {
      title: 'Total Applications',
      value: stats?.total || 0,
      icon: FileText,
      description: 'Across all positions',
      change: changes.totalChange,
      changeType: 'positive' as const,
    },
    {
      title: 'In Progress',
      value: stats?.reviewing || 0,
      icon: Clock,
      description: 'Under review',
      change: changes.inProgressChange,
      changeType: 'neutral' as const,
    },
    {
      title: 'Success Rate',
      value: stats?.successRate || 0,
      icon: TrendingUp,
      description: 'Applications shortlisted',
      change: changes.successRateChange,
      changeType: changes.successRateChangeType,
    },
    {
      title: 'Shortlisted',
      value: stats?.shortlisted || 0,
      icon: CheckCircle,
      description: 'Moving forward',
      change: changes.shortlistedChange,
      changeType: 'positive' as const,
    },
  ];

  const profileOverview = [
    {
      title: 'Experience',
      value: resume?.experience?.length
        ? `${calculateTotalExperience(resume.experience)} Years`
        : 'No experience',
      icon: Briefcase,
    },
    {
      title: 'Education',
      value:
        (resume?.education?.length || 0) +
        ' ' +
        (resume?.education?.length === 1 ? 'Degree' : 'Degrees'),
      icon: GraduationCap,
    },
    {
      title: 'Skills',
      value: (resume?.resumeSkills?.length || 0) + ' listed',
      icon: Brain,
    },
    {
      title: 'Certifications',
      value: (resume?.certifications?.length || 0) + ' added',
      icon: Award,
    },
  ];

  // Helper function to get status icon and color
  const getStatusDetails = (status: string) => {
    const statusLower = status?.toLowerCase() || '';

    switch (statusLower) {
      case 'pending':
        return {
          icon: Clock,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
        };
      case 'reviewing':
        return {
          icon: Eye,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100 dark:bg-blue-900/20',
        };
      case 'shortlisted':
        return {
          icon: Calendar,
          color: 'text-green-600',
          bgColor: 'bg-green-100 dark:bg-green-900/20',
        };
      case 'offered':
        return {
          icon: Gift,
          color: 'text-purple-600',
          bgColor: 'bg-purple-100 dark:bg-purple-900/20',
        };
      case 'rejected':
        return {
          icon: AlertCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-100 dark:bg-red-900/20',
        };
      default:
        return {
          icon: Clock,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100 dark:bg-gray-900/20',
        };
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Application Statistics */}
        <div data-tour="dashboard-analytics-section">
          <div
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
            data-tour="dashboard-analytics-section"
          >
            {cardData.map((card, index) => {
              // Color palette for icon backgrounds and accents
              const colorClasses = [
                {
                  bg: 'bg-[#F6AE66] dark:bg-blue-900/30 border-1 border-white',
                  icon: 'text-white dark:text-blue-400',
                  accent: 'bg-[#F6AE66]',
                },
                {
                  bg: 'bg-[#F9D57A] dark:bg-amber-900/30 border-1 border-white',
                  icon: 'text-white dark:text-amber-400',
                  accent: 'bg-[#F9D57A]',
                },
                {
                  bg: 'bg-[#52CD75] dark:bg-green-900/30 border-1 border-white',
                  icon: 'text-white dark:text-green-400',
                  accent: 'bg-[#52CD75]',
                },
                {
                  bg: 'bg-[#6E55CF] dark:bg-purple-900/30 border-1 border-white',
                  icon: 'text-white dark:text-purple-400',
                  accent: 'bg-[#6E55CF]',
                },
              ];
              const colors = colorClasses[index % colorClasses.length];
              const IconComponent = card.icon;
              // Change indicator icon and color
              const _changeIcon =
                card.changeType === 'positive' ? (
                  <ArrowUpRight className="h-3.5 w-3.5" />
                ) : card.changeType === 'negative' ? (
                  <ArrowRight className="h-3.5 w-3.5 -rotate-45" />
                ) : (
                  <ArrowRight className="h-3.5 w-3.5" />
                );
              const _changeClass =
                card.changeType === 'positive'
                  ? 'text-green-200 bg-green-700/20'
                  : card.changeType === 'negative'
                    ? 'text-red-200 bg-red-700/20'
                    : 'text-white bg-white/10';
              return (
                <Card
                  key={index}
                  className={`group relative h-[140px] overflow-hidden rounded-xl border-0 shadow-md backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:bg-gray-900/95 ${colors.accent} border-l-4`}
                >
                  <CardContent className="flex h-full flex-col justify-between p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-base font-normal text-white transition-colors group-hover:text-gray-100 dark:text-white dark:group-hover:text-gray-100">
                        {card.title}
                      </p>
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-full p-2.5 ${colors.bg} transition-transform duration-300 group-hover:scale-110`}
                      >
                        <IconComponent className={`h-5 w-5 ${colors.icon}`} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-3xl font-bold text-white transition-colors dark:text-white">
                        {card.value}
                      </div>
                      <p className="text-sm leading-relaxed text-white dark:text-white">
                        {card.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
        {/* Job Recommendations & Applications */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recommended Jobs */}
          <div data-tour="recommended-jobs-container">
            <Card className="h-full bg-white transition-all hover:shadow-md dark:bg-gray-950">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-bold dark:text-gray-100">
                    <div>Recommended for You</div>
                    <div className="text-muted-foreground mt-1 text-sm">
                      Opportunities tailored to your skills and experience
                    </div>
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-primary/10 hover:text-primary"
                    onClick={() =>
                      router.push('/app/candidate/job-recommendations')
                    }
                  >
                    <span className="text-primary">View All</span>
                    <ArrowRight className="text-primary ml-1 h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="mt-2 space-y-5">
                {/* Loading State */}
                {!jobRecommendations && (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="rounded-lg border bg-[#F5F5FF]/50 p-3"
                      >
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                          </div>
                          <Skeleton className="h-6 w-20" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Empty State */}
                {jobRecommendations?.items?.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="bg-primary/10 dark:bg-primary/20 mb-4 flex h-16 w-16 items-center justify-center rounded-full shadow-lg">
                      <Search className="text-primary h-8 w-8" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                      No Jobs Found
                    </h3>
                    <p className="text-muted-foreground text-center text-sm">
                      We couldn&apos;t find any job recommendations for you at
                      the moment.
                      <br />
                      Try updating your profile or check back later!
                    </p>
                  </div>
                )}

                {/* Job Recommendations */}
                {jobRecommendations?.items
                  ?.slice(0, 3)
                  .sort((a, b) => (b.score || 0) - (a.score || 0))
                  .map((job) => (
                    <div
                      key={job.id}
                      className="group bg-muted/50 hover:border-primary/30 hover:bg-primary/5 dark:hover:bg-primary/10 cursor-pointer rounded-lg border border-transparent p-3 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-1">
                          <h4 className="text-md group-hover:text-primary dark:group-hover:text-primary font-medium dark:text-gray-200">
                            {job.jobPosting?.title || 'Job Title'}
                          </h4>
                          <div className="text-muted-foreground flex items-center gap-2 text-sm">
                            <Building className="h-3 w-3" />
                            <span>
                              {job.jobPosting?.reportingTo || 'Department'}
                            </span>
                            <span className="text-muted-foreground font-medium">
                              •
                            </span>
                            <MapPin className="h-3 w-3" />
                            <span>
                              {job.jobPosting?.preferredLocations?.[0] ||
                                'Location'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <DollarSign className="text-muted-foreground h-3 w-3" />
                            <span className="text-muted-foreground font-medium">
                              {job.jobPosting?.minSalary || 0} -{' '}
                              {job.jobPosting?.maxSalary || 0}
                            </span>
                            <span className="text-muted-foreground font-medium">
                              •
                            </span>
                            <span className="text-muted-foreground font-medium">
                              {formatEnumValue(job.jobPosting?.jobType)}
                            </span>
                            <span className="text-muted-foreground font-medium">
                              •
                            </span>
                            <span className="text-muted-foreground font-medium">
                              {formatEnumValue(job.jobPosting?.jobCommitment)}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <Tooltip>
                            <TooltipTrigger>
                              <Badge
                                variant="outline"
                                className="bg-background group-hover:bg-primary/10 dark:group-hover:bg-primary/20 ml-2 transition-colors dark:bg-gray-800"
                              >
                                <span className="text-primary font-normal">
                                  {((job?.score || 0) * 100).toFixed(2)}% match
                                </span>
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>AI-powered match score</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>

          {/* Application Status Summary */}
          <div data-tour="application-status-section">
            <Card className="bg-white transition-all hover:shadow-md dark:bg-gray-950">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>
                    <div className="text-2xl font-bold dark:text-gray-100">
                      Application Status
                    </div>
                    <div className="text-muted-foreground mt-1 text-sm">
                      Track progress of your applications
                    </div>
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-primary/10 hover:text-primary"
                    onClick={() => router.push('/app/candidate/applications')}
                  >
                    <span className="text-primary">View All</span>
                    <ArrowRight className="text-primary ml-1 h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="mt-2 space-y-4">
                {/* Enhanced Status Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {applicationStatus.map((item) => {
                    const statusDetails = getStatusDetails(item.status);
                    const IconComponent = statusDetails.icon;

                    return (
                      <div
                        key={item.key}
                        className="hover:bg-muted/50 flex items-center gap-3 rounded-lg border p-3 transition-all hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-800/50"
                      >
                        <div
                          className={`rounded-full p-2 ${statusDetails.bgColor}`}
                        >
                          <IconComponent
                            className={`h-4 w-4 ${statusDetails.color}`}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="text-md font-medium dark:text-gray-200">
                            {item.label}
                          </div>
                          <div className="text-sm dark:text-gray-300">
                            {item.value}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Separator />

                {/* Recent Applications */}
                <div className="space-y-3">
                  <h4 className="flex items-center gap-2 text-sm font-medium">
                    <MessageSquare className="h-4 w-4" />
                    Recent Activity
                  </h4>
                  {applications.length > 0 ? (
                    <div className="space-y-3">
                      {applications.slice(0, 2).map((app) => {
                        const statusDetails = getStatusDetails(
                          app.status || ''
                        );
                        const IconComponent = statusDetails.icon;

                        return (
                          <div
                            key={app.id}
                            className="bg-muted/50 hover:border-primary/30 hover:bg-primary/5 dark:bg-muted/30 dark:hover:border-primary/40 dark:hover:bg-primary/10 flex items-center gap-3 rounded-lg border p-3 shadow-sm transition-all dark:border-gray-700"
                          >
                            <div
                              className={`rounded-full p-2 shadow-sm ${statusDetails.bgColor}`}
                            >
                              <IconComponent
                                className={`h-4 w-4 ${statusDetails.color}`}
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-medium dark:text-gray-200">
                                {app.jobPosting?.title || 'Job Application'}
                              </div>
                              <div className="text-muted-foreground truncate text-xs">
                                {app.jobPosting?.company?.name || 'Company'}
                                {app.appliedAt && (
                                  <>
                                    {' • '}
                                    <Calendar className="mr-1 inline h-3 w-3" />
                                    {formatDistanceToNow(
                                      new Date(app.appliedAt),
                                      { addSuffix: true }
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                            <Badge
                              variant={
                                app.status?.toLowerCase() === 'shortlisted'
                                  ? 'success'
                                  : app.status?.toLowerCase() === 'rejected'
                                    ? 'destructive'
                                    : app.status?.toLowerCase() === 'reviewing'
                                      ? 'info'
                                      : app.status?.toLowerCase() === 'offered'
                                        ? 'success'
                                        : 'warning'
                              }
                              className="shrink-0 text-xs font-medium"
                            >
                              {formatEnumValue(app.status)}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-muted-foreground py-4 text-center">
                      <Briefcase className="mx-auto mb-2 h-8 w-8 opacity-50" />
                      <p className="text-sm">No applications yet</p>
                      <p className="text-xs">
                        Start applying to jobs to see your activity here
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Profile Overview Details */}
        <div data-tour="profile-overview-section">
          <Card className="bg-white transition-all hover:shadow-md dark:bg-gray-950">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold dark:text-gray-100">
                    Profile Overview
                  </CardTitle>
                  <div className="text-muted-foreground font-inter mt-1 text-sm">
                    Your professional profile highlights and completion status
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-primary text-2xl font-bold">
                      {profile.completionPercentage || 0}%
                    </div>
                    <div className="text-muted-foreground text-xs">
                      Complete
                    </div>
                  </div>
                  <div className="bg-primary/10 dark:bg-primary/20 rounded-full p-2">
                    {profile.completionPercentage === 100 ? (
                      <CheckCircle className="text-primary h-5 w-5" />
                    ) : profile.completionPercentage >= 70 ? (
                      <Clock className="text-primary h-5 w-5" />
                    ) : (
                      <AlertCircle className="text-primary h-5 w-5" />
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Status Message */}
              <div className="bg-primary/5 border-primary/20 dark:bg-primary/10 dark:border-primary/30 rounded-lg border p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {profile.completionPercentage === 100 ? (
                      <CheckCircle className="text-primary h-4 w-4" />
                    ) : profile.completionPercentage >= 70 ? (
                      <TrendingUp className="text-primary h-4 w-4" />
                    ) : (
                      <AlertCircle className="text-primary h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <div className="text-primary text-sm font-medium">
                      {profile.completionPercentage === 100
                        ? 'Profile Complete - Ready for Opportunities'
                        : profile.completionPercentage >= 70
                          ? 'Almost There - Great Progress!'
                          : 'Get Started - Build Your Profile'}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      {profile.completionPercentage === 100
                        ? 'Your profile is fully optimized for job matching and recruiter discovery.'
                        : profile.completionPercentage >= 70
                          ? 'Add a few more details to maximize your profile visibility and job matches.'
                          : 'Complete your profile information to unlock personalized job opportunities.'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Stats Grid */}
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {profileOverview.map((item, index) => {
                  const IconComponent = item.icon;

                  return (
                    <Card
                      key={index}
                      className="group bg-primary/5 border-primary/20 dark:bg-primary/10 dark:border-primary/30 relative overflow-hidden border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                    >
                      <CardContent className="p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <div className="bg-primary/10 border-primary/20 dark:bg-primary/20 dark:border-primary/40 rounded-lg border p-2">
                            <IconComponent className="text-primary h-4 w-4" />
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                              {item.value}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {item.title}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            Professional details
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assessment Results - Two Separate Columns */}
        <div
          className="grid gap-6 md:grid-cols-2"
          data-tour="assessment-results-section"
        >
          {/* Resume Assessment */}
          <Card className="bg-white transition-all hover:shadow-md dark:bg-gray-950">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <FileText className="text-primary h-5 w-5" />
                  <CardTitle className="text-xl font-bold dark:text-gray-100">
                    Resume Assessment
                  </CardTitle>
                </div>
                {profile.resumeAssessmentStatus ===
                  CandidateResumeAssessmentStatusEnum.ASSESSMENT_COMPLETED &&
                  getResumeRecommendationBadge(
                    resumeAssessment?.recommendation
                  )}
              </div>
              <div className="text-muted-foreground font-inter mt-1 text-sm">
                AI-powered insights to enhance your profile
              </div>
            </CardHeader>
            <CardContent className="mt-2">
              {profile.resumeAssessmentStatus ===
              CandidateResumeAssessmentStatusEnum.ASSESSMENT_COMPLETED ? (
                isResumeAssessmentLoading ? (
                  <div className="space-y-3">
                    <div className="bg-muted h-4 animate-pulse rounded"></div>
                    <div className="bg-muted h-4 w-3/4 animate-pulse rounded"></div>
                  </div>
                ) : resumeAssessment ? (
                  <div className="bg-muted/50 hover:bg-primary/5 rounded-xl p-4 transition-colors dark:bg-gray-900/80">
                    {resumeAssessment.overallFeedback && (
                      <div className="space-y-2">
                        <div className="text-md text-muted-foreground font-bold">
                          Feedback
                        </div>
                        <div className="text-md font-inter text-muted-foreground rounded-lg">
                          {resumeAssessment.overallFeedback}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-xl bg-red-50 p-4 dark:bg-red-900/20">
                    <div className="text-sm text-red-700 dark:text-red-300">
                      No resume assessment data available
                    </div>
                  </div>
                )
              ) : (
                <div className="border-primary/20 bg-primary/5 dark:border-primary/30 dark:bg-primary/10 rounded-xl border p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <Clock className="text-primary h-4 w-4" />
                    </div>
                    <div className="space-y-2">
                      <div className="text-primary text-sm font-medium">
                        Resume Assessment Pending
                      </div>
                      <div className="text-muted-foreground text-sm">
                        Complete your profile setup and submit for review to get
                        detailed feedback on your resume and professional
                        experience.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Onboarding Assessment */}
          <Card className="bg-white transition-all hover:shadow-md dark:bg-gray-950">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Brain className="text-primary h-5 w-5" />
                    <CardTitle className="text-xl font-bold dark:text-gray-100">
                      {shouldShowJobAiAssessment
                        ? 'Job AI Assessment'
                        : 'Screening Assessment'}
                    </CardTitle>
                  </div>
                </div>
                {profile.onboardingAssessmentStatus ===
                  CandidateOnboardingAssessmentStatusEnum.ASSESSMENT_COMPLETED &&
                  !shouldShowJobAiAssessment && // Only show badge for Screening Assessment
                  getOnboardingRecommendationBadge(
                    onboardingAssessment?.recommendation
                  )}
              </div>
              <div className="text-muted-foreground font-inter mt-1 text-sm">
                {shouldShowJobAiAssessment
                  ? acceptedJobAiInvitation?.jobTitle
                    ? `Complete Your assessment for ${acceptedJobAiInvitation.jobTitle} .`
                    : 'Complete Assessment for your job application.'
                  : 'Career preferences and screening insights'}
              </div>
            </CardHeader>
            <CardContent className="mt-2">
              {profile.onboardingAssessmentStatus ===
              CandidateOnboardingAssessmentStatusEnum.ASSESSMENT_COMPLETED ? (
                isOnboardingAssessmentLoading ? (
                  <div className="space-y-3">
                    <div className="bg-muted h-4 animate-pulse rounded"></div>
                    <div className="bg-muted h-4 w-3/4 animate-pulse rounded"></div>
                  </div>
                ) : onboardingAssessment ? (
                  <div className="bg-muted/50 hover:bg-primary/5 dark:bg-primary/10 rounded-xl p-4 transition-colors">
                    {onboardingAssessment.overallFeedback && (
                      <div className="space-y-2">
                        <div className="text-md text-muted-foreground font-bold">
                          Feedback
                        </div>
                        <div className="text-md font-inter text-muted-foreground rounded-lg">
                          {onboardingAssessment.overallFeedback}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-xl bg-red-50 p-4 dark:bg-red-900/20">
                    <div className="text-sm text-red-700 dark:text-red-300">
                      No screening assessment data available
                    </div>
                  </div>
                )
              ) : profile.onboardingAssessmentStatus ===
                  CandidateOnboardingAssessmentStatusEnum.ASSESSMENT_IN_PROGRESS &&
                (onboardingAssessment?.status ===
                  OnboardingAssessmentStatusEnum.CANDIDATE_ASSESSMENT_COMPLETED ||
                  onboardingAssessment?.status ===
                    OnboardingAssessmentStatusEnum.AI_REVIEW_IN_PROGRESS) ? (
                <div className="border-primary/20 bg-primary/5 dark:border-primary/30 dark:bg-primary/10 rounded-xl border p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <Clock className="text-primary h-4 w-4 animate-spin" />
                    </div>
                    <div className="space-y-2">
                      <div className="text-primary text-sm font-medium">
                        {shouldShowJobAiAssessment
                          ? 'Job AI Assessment - AI Review In Progress'
                          : 'Screening Assessment - AI Review In Progress'}
                      </div>
                      <div className="text-muted-foreground text-sm">
                        Your assessment has been submitted. Our AI is reviewing
                        your responses and preparing your personalized feedback.
                        This usually takes a few minutes.
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border-primary/20 bg-primary/5 dark:border-primary/30 dark:bg-primary/10 rounded-xl border p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <Clock className="text-primary h-4 w-4" />
                    </div>
                    <div className="space-y-2">
                      <div className="text-primary text-sm font-medium">
                        {shouldShowJobAiAssessment
                          ? 'Job AI Assessment Pending'
                          : 'Screening Assessment Pending'}
                      </div>
                      <div className="text-muted-foreground text-sm">
                        {shouldShowJobAiAssessment
                          ? 'Complete you Job AI Assessment from Resume section to showcase your skills evaluation and get personalsed job recommendations.'
                          : 'Complete you Screening Assessment from Resume section to showcase your skills evaluation and get personalsed job recommendations.'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <TourGuide
        tourKey="candidate_dashboard_tour"
        showProgress={false}
        showStepProgress={false}
      />
    </TooltipProvider>
  );
};

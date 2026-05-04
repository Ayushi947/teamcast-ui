'use client';

import { FC } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  partnerProfileService,
  partnerCandidateService,
  candidateApplicationService,
  activityLogService,
} from '@/lib/services/services';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  Building,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle,
  MessageSquare,
  Award,
  FileText,
  Shield,
  Brain,
  TrendingUp,
  Briefcase,
  GraduationCap,
  Eye,
  Calendar,
  Activity,
  User,
  Settings,
  Bell,
  CreditCard,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context/app-context';
import {
  ICandidateProfile,
  CandidateResumeAssessmentStatusEnum,
  CandidateOnboardingAssessmentStatusEnum,
  IPartnerProfile,
  ICandidateJobApplication,
  IPartnerCandidateDetailed,
  ApplicationStatusEnum,
  ActivityModuleEnum,
  IActivityLog,
} from '@/lib/shared';
import { formatDistanceToNow } from 'date-fns';
import { formatEnumValue } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface PartnerResourceDashboardProps {
  profile: ICandidateProfile;
}

export const PartnerResourceDashboard: FC<PartnerResourceDashboardProps> = ({
  profile,
}) => {
  const router = useRouter();
  const { user } = useApp();
  const partnerId = user?.partnerId;
  const candidateId = user?.candidateId;

  // Fetch partner profile data
  const { data: partnerProfile } = useQuery<IPartnerProfile>({
    queryKey: ['partner-profile'],
    queryFn: () => partnerProfileService.getProfile(),
    enabled: !!partnerId,
    retry: 3,
    retryDelay: 1000,
  });

  // Fetch activity logs
  const {
    data: activityLogsResponse,
    isLoading: isActivityLogsLoading,
    error: activityLogsError,
  } = useQuery({
    queryKey: ['activity-logs'],
    queryFn: () =>
      activityLogService.getActivityLogs({
        page: 1,
        limit: 3,
      }),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 30 * 1000,
  });

  const activityLogs = activityLogsResponse?.data || [];

  // Fetch candidate job applications
  const {
    data: jobApplicationsResponse,
    isLoading: isApplicationsLoading,
    error: applicationsError,
  } = useQuery({
    queryKey: ['candidate-job-applications'],
    queryFn: () =>
      candidateApplicationService.getApplications({
        page: 1,
        limit: 10,
      }),
    enabled: !!candidateId,
    retry: 2,
    retryDelay: 1000,
  });

  // Fetch detailed partner candidate information
  const { data: partnerCandidateDetails } = useQuery<IPartnerCandidateDetailed>(
    {
      queryKey: ['partner-candidate-details', candidateId],
      queryFn: () =>
        partnerCandidateService.getCandidate(candidateId as string),
      enabled: !!partnerId && !!candidateId,
      retry: 2,
      retryDelay: 1000,
    }
  );

  // For partner resource candidates, we get resume data from partnerCandidateDetails
  const resume = partnerCandidateDetails?.resume;

  // Helper function to get activity icon based on module
  const getActivityIcon = (module: string) => {
    switch (module) {
      case ActivityModuleEnum.AUTH:
        return Shield;
      case ActivityModuleEnum.CANDIDATE:
        return User;
      case ActivityModuleEnum.CLIENT:
        return Building;
      case ActivityModuleEnum.PARTNER:
        return Building;
      case ActivityModuleEnum.JOB:
        return Briefcase;
      case ActivityModuleEnum.APPLICATION:
        return FileText;
      case ActivityModuleEnum.ASSESSMENT:
        return Brain;
      case ActivityModuleEnum.SYSTEM:
        return Settings;
      case ActivityModuleEnum.SUBSCRIPTION:
        return CreditCard;
      case ActivityModuleEnum.NOTIFICATION:
        return Bell;
      default:
        return Activity;
    }
  };

  // Helper function to get activity color based on module
  const getActivityColor = (module: string) => {
    switch (module) {
      case ActivityModuleEnum.AUTH:
        return 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/20';
      case ActivityModuleEnum.CANDIDATE:
        return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case ActivityModuleEnum.CLIENT:
        return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20';
      case ActivityModuleEnum.PARTNER:
        return 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/20';
      case ActivityModuleEnum.JOB:
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case ActivityModuleEnum.APPLICATION:
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      case ActivityModuleEnum.ASSESSMENT:
        return 'text-pink-600 bg-pink-100 dark:bg-pink-900/20';
      case ActivityModuleEnum.SYSTEM:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
      case ActivityModuleEnum.SUBSCRIPTION:
        return 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/20';
      case ActivityModuleEnum.NOTIFICATION:
        return 'text-teal-600 bg-teal-100 dark:bg-teal-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  // Helper function to format activity description
  const formatActivityDescription = (activity: IActivityLog) => {
    if (activity.description) {
      return activity.description;
    }

    const action = activity.action?.toLowerCase().replace(/_/g, ' ');
    const Activitymodule = activity.module?.toLowerCase();

    return `${action} in ${Activitymodule}`;
  };

  // Helper function to get status icon and color
  const getStatusDetails = (status: string) => {
    const statusLower = status?.toLowerCase() || '';

    switch (statusLower) {
      case ApplicationStatusEnum.APPLIED.toLowerCase():
        return {
          icon: Clock,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
        };
      case ApplicationStatusEnum.REVIEWING.toLowerCase():
        return {
          icon: Eye,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100 dark:bg-blue-900/20',
        };
      case ApplicationStatusEnum.SHORTLISTED.toLowerCase():
        return {
          icon: Calendar,
          color: 'text-green-600',
          bgColor: 'bg-green-100 dark:bg-green-900/20',
        };
      case ApplicationStatusEnum.REJECTED.toLowerCase():
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

  const jobApplications = jobApplicationsResponse?.items || [];
  const applicationStats = {
    total: jobApplications.length,
    applied: jobApplications.filter(
      (app: ICandidateJobApplication) =>
        app.status === ApplicationStatusEnum.APPLIED
    ).length,
    reviewing: jobApplications.filter(
      (app: ICandidateJobApplication) =>
        app.status === ApplicationStatusEnum.REVIEWING
    ).length,
    shortlisted: jobApplications.filter(
      (app: ICandidateJobApplication) =>
        app.status === ApplicationStatusEnum.SHORTLISTED
    ).length,
    rejected: jobApplications.filter(
      (app: ICandidateJobApplication) =>
        app.status === ApplicationStatusEnum.REJECTED
    ).length,
  };

  // Create dashboard cards data similar to individual dashboard
  const cardData = [
    {
      title: 'Total Applications',
      value: applicationStats.total,
      icon: FileText,
      description: 'Through partner',
      change: 'Partner managed',
      changeType: 'neutral' as const,
    },
    {
      title: 'Under Review',
      value: applicationStats.reviewing,
      icon: Clock,
      description: 'Being evaluated',
      change: 'Partner process',
      changeType: 'neutral' as const,
    },
    {
      title: 'Profile Status',
      value: profile.completionPercentage || 0,
      icon: TrendingUp,
      description: '% Complete',
      change: 'Keep improving',
      changeType: 'positive' as const,
    },
    {
      title: 'Shortlisted',
      value: applicationStats.shortlisted,
      icon: CheckCircle,
      description: 'Moving forward',
      change: 'Great progress',
      changeType: 'positive' as const,
    },
  ];

  const profileOverview = [
    {
      title: 'Experience',
      value: (resume?.totalExperience || 0) + ' Years',
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

  const applicationStatus = [
    {
      key: 'applied',
      label: 'Applied',
      value: applicationStats.applied,
      status: ApplicationStatusEnum.APPLIED,
    },
    {
      key: 'reviewing',
      label: 'Reviewing',
      value: applicationStats.reviewing,
      status: ApplicationStatusEnum.REVIEWING,
    },
    {
      key: 'shortlisted',
      label: 'Shortlisted',
      value: applicationStats.shortlisted,
      status: ApplicationStatusEnum.SHORTLISTED,
    },
    {
      key: 'rejected',
      label: 'Rejected',
      value: applicationStats.rejected,
      status: ApplicationStatusEnum.REJECTED,
    },
  ];

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Application Statistics Cards - Similar to Individual Dashboard */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

        {/* Recent Activities & Application Status */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Activities */}
          <Card className="bg-white transition-all hover:shadow-md dark:bg-gray-950">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold dark:text-gray-100">
                  <div>Recent Activities</div>
                  <div className="text-muted-foreground mt-1 text-sm">
                    Your latest account activities
                  </div>
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="mt-2 space-y-4">
              {isActivityLogsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-muted/50 rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : activityLogsError ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="bg-destructive/10 dark:bg-destructive/20 mb-4 flex h-16 w-16 items-center justify-center rounded-full shadow-lg">
                    <AlertCircle className="text-destructive h-8 w-8" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Loading Error
                  </h3>
                  <p className="text-muted-foreground text-center text-sm">
                    Failed to load activity data.
                    <br />
                    Please try refreshing the page.
                  </p>
                </div>
              ) : activityLogs.length > 0 ? (
                <div className="space-y-3">
                  {activityLogs.map((activity) => {
                    const IconComponent = getActivityIcon(activity.module);
                    const colorClass = getActivityColor(activity.module);

                    return (
                      <div
                        key={activity.id}
                        className="group bg-muted/50 hover:bg-primary/5 dark:bg-muted/30 dark:hover:border-primary/40 dark:hover:bg-primary/10 flex min-h-[70px] items-center gap-3 rounded-md border border-violet-200 p-4 shadow-sm transition-all hover:border-violet-600 dark:border-violet-500"
                      >
                        <div
                          className={`rounded-full p-2 shadow-sm ${colorClass}`}
                        >
                          <IconComponent
                            className={`h-4 w-4 ${colorClass.split(' ')[0]}`}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium dark:text-gray-200">
                            {formatActivityDescription(activity)}
                          </div>
                          <div className="text-muted-foreground flex items-center gap-2 text-xs">
                            <span className="capitalize">
                              {activity.module}
                            </span>
                            {activity.createdAt && (
                              <>
                                <span>•</span>
                                <Calendar className="h-3 w-3" />
                                {formatDistanceToNow(
                                  new Date(activity.createdAt),
                                  { addSuffix: true }
                                )}
                              </>
                            )}
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-background shrink-0 text-xs font-medium dark:bg-gray-800"
                        >
                          {activity.action}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-muted-foreground py-4 text-center">
                  <Activity className="mx-auto mb-2 h-8 w-8 opacity-50" />
                  <p className="text-sm">No recent activities</p>
                  <p className="text-xs">
                    Your account activities will appear here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Application Status Summary */}
          <Card className="bg-white transition-all hover:shadow-md dark:bg-gray-950">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>
                  <div className="text-2xl font-bold dark:text-gray-100">
                    Application Status
                  </div>
                  <div className="text-muted-foreground mt-1 text-sm">
                    Track your partner applications
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
              {isApplicationsLoading ? (
                <div className="grid grid-cols-2 gap-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-muted/50 rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : applicationsError ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="bg-destructive/10 dark:bg-destructive/20 mb-4 flex h-16 w-16 items-center justify-center rounded-full shadow-lg">
                    <AlertCircle className="text-destructive h-8 w-8" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Loading Error
                  </h3>
                  <p className="text-muted-foreground text-center text-sm">
                    Failed to load application data.
                    <br />
                    Please try refreshing the page.
                  </p>
                </div>
              ) : jobApplications.length > 0 ? (
                <>
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
                      Recent Applications
                    </h4>
                    <div className="space-y-3">
                      {jobApplications.slice(0, 2).map((app) => {
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
                                {app.jobPosting?.title ||
                                  'Partner Job Application'}
                              </div>
                              <div className="text-muted-foreground truncate text-xs">
                                Partner Application
                                {app.createdAt && (
                                  <>
                                    {' • '}
                                    <Calendar className="mr-1 inline h-3 w-3" />
                                    {formatDistanceToNow(
                                      new Date(app.createdAt),
                                      { addSuffix: true }
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                            <Badge
                              variant={
                                app.status === ApplicationStatusEnum.SHORTLISTED
                                  ? 'success'
                                  : app.status ===
                                      ApplicationStatusEnum.REJECTED
                                    ? 'destructive'
                                    : app.status ===
                                        ApplicationStatusEnum.REVIEWING
                                      ? 'info'
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
                  </div>
                </>
              ) : (
                <div className="text-muted-foreground py-4 text-center">
                  <Briefcase className="mx-auto mb-2 h-8 w-8 opacity-50" />
                  <p className="text-sm">No applications yet</p>
                  <p className="text-xs">
                    Applications through your partner will appear here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Profile Overview Details - Similar to Individual Dashboard */}
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
                  <div className="text-muted-foreground text-xs">Complete</div>
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

        {/* Assessment Results - Two Separate Columns */}
        <div className="grid gap-6 md:grid-cols-2">
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
                  CandidateResumeAssessmentStatusEnum.ASSESSMENT_COMPLETED && (
                  <Badge variant="success" className="gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Completed
                  </Badge>
                )}
              </div>
              <div className="text-muted-foreground font-inter mt-1 text-sm">
                Partner-managed resume evaluation
              </div>
            </CardHeader>
            <CardContent className="mt-2">
              {profile.resumeAssessmentStatus ===
              CandidateResumeAssessmentStatusEnum.ASSESSMENT_COMPLETED ? (
                <div className="bg-muted/50 hover:bg-primary/5 dark:bg-primary/10 rounded-xl p-4 transition-colors">
                  <div className="space-y-2 text-center">
                    <div className="text-md text-muted-foreground font-bold">
                      Assessment Complete
                    </div>
                    <div className="text-muted-foreground text-sm">
                      Assessment data managed by partner
                    </div>
                    <div className="text-muted-foreground text-xs">
                      Contact your partner support team for detailed feedback
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
                        Resume Assessment Pending
                      </div>
                      <div className="text-muted-foreground text-sm">
                        Your partner will review your resume once you complete
                        your profile setup. Work with your partner manager to
                        get started.
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
                <div className="flex items-center gap-2">
                  <Brain className="text-primary h-5 w-5" />
                  <CardTitle className="text-xl font-bold dark:text-gray-100">
                    Screening Assessment
                  </CardTitle>
                </div>
                {profile.onboardingAssessmentStatus ===
                  CandidateOnboardingAssessmentStatusEnum.ASSESSMENT_COMPLETED && (
                  <Badge variant="success" className="gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Completed
                  </Badge>
                )}
              </div>
              <div className="text-muted-foreground font-inter mt-1 text-sm">
                Partner-managed screening process
              </div>
            </CardHeader>
            <CardContent className="mt-2">
              {profile.onboardingAssessmentStatus ===
              CandidateOnboardingAssessmentStatusEnum.ASSESSMENT_COMPLETED ? (
                <div className="bg-muted/50 hover:bg-primary/5 dark:bg-primary/10 rounded-xl p-4 transition-colors">
                  <div className="space-y-2 text-center">
                    <div className="text-md text-muted-foreground font-bold">
                      Assessment Complete
                    </div>
                    <div className="text-muted-foreground text-sm">
                      Assessment data managed by partner
                    </div>
                    <div className="text-muted-foreground text-xs">
                      Contact your partner support team for detailed feedback
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
                        Screening Assessment Pending
                      </div>
                      <div className="text-muted-foreground text-sm">
                        Available after your resume assessment through your
                        partner. This will help your partner understand your
                        preferences and match you with opportunities.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Information Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-primary/20 bg-primary/5 dark:border-primary/30 dark:bg-primary/10 rounded-lg border p-4"
        >
          <div className="flex items-start gap-3">
            <Shield className="text-primary mt-0.5 h-5 w-5" />
            <div className="flex-1">
              <h4 className="text-primary font-medium">
                Partner Resource Account
              </h4>
              <p className="text-muted-foreground mt-1 text-sm">
                Your profile is managed by{' '}
                {partnerProfile?.basic?.name || 'your partner organization'}.
                Job applications and recommendations are handled through your
                partner. For any questions, please contact your assigned
                manager.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </TooltipProvider>
  );
};

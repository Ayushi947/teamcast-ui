'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { useApp } from '@/lib/context/app-context';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Users,
  FileText,
  Calendar,
  UserCheck,
  Clock,
  CheckCircle,
  Plus,
  Search,
  Eye,
  BarChart3,
  Activity,
  UserPlus,
  Trophy,
  ExternalLink,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import {
  clientJobPostingService,
  clientAnalyticsService,
  activityLogService,
  subscriptionLimitsService,
} from '@/lib/services/services';
import { useQuery } from '@tanstack/react-query';
import {
  ActivityModuleEnum,
  IClientJobPosting,
  UserRoleEnum,
} from '@/lib/shared';
import { format } from 'date-fns';
import { useState, useEffect, useRef } from 'react';
import { SubscriptionWarningPopup } from './subscription-warning-popup';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import DashboardJobPostingCard from './dashboard-job-posting-card';
import { useRouter } from 'next/navigation';

export const HRDashboard = () => {
  const [showWarning, setShowWarning] = useState(false);
  const [showLimitReachedDialog, setShowLimitReachedDialog] = useState(false);
  const { user } = useApp();
  const router = useRouter();
  const carouselRef = useRef<HTMLDivElement>(null);

  const subscriptionOverviewData = JSON.parse(
    localStorage.getItem('subscriptionData') || '{}'
  );

  // Function to clear subscription data from localStorage
  const clearSubscriptionData = () => {
    localStorage.removeItem('subscriptionData');
    setShowWarning(false);
  };

  const { data: usageSummary } = useQuery({
    queryKey: ['usage-summary'],
    queryFn: () => subscriptionLimitsService.getUsageSummary(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleCreateJob = () => {
    if (!usageSummary?.jobPostings.canCreate) {
      setShowLimitReachedDialog(true);
      return;
    }
    router.push('/app/client/recruiter/sourcing?create-job-posting=true');
  };

  // Check if warning should be shown
  useEffect(() => {
    if (
      subscriptionOverviewData &&
      Object.keys(subscriptionOverviewData).length > 0
    ) {
      const {
        activePackRemainingDays,
        overallQuotaUsedInPercentage,
        subscriptionStatus,
      } = subscriptionOverviewData;

      const shouldShowWarning =
        subscriptionStatus === 'EXPIRED' ||
        activePackRemainingDays <= 10 ||
        overallQuotaUsedInPercentage >= 80;

      if (shouldShowWarning) {
        setShowWarning(true);
      }
    }
  }, [subscriptionOverviewData]);
  // Fetch real data from APIs
  const { data: clientJobPostings, isLoading: jobPostingsLoading } = useQuery({
    queryKey: ['clientJobPostings'],
    queryFn: () => clientJobPostingService.getJobPostings(),
    staleTime: 3 * 60 * 1000, // 3 minutes cache
    retry: 1,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['hrAnalytics'],
    queryFn: () => clientAnalyticsService.getDashboardAnalytics(),
    staleTime: 3 * 60 * 1000, // 3 minutes cache
    retry: 1,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
  });

  const { data: activityLogs, isLoading: activityLogsLoading } = useQuery({
    queryKey: ['hrActivityLogs', user?.clientId],
    queryFn: () =>
      activityLogService.getActivityLogs({
        entityId: user?.clientId,
        module: ActivityModuleEnum.JOB,
        limit: 10,
      }),
    enabled: !!user?.clientId,
    staleTime: 2 * 60 * 1000, // 2 minutes cache
    retry: 1,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
  });

  // Process real data
  const activeJobPostings =
    clientJobPostings?.items
      ?.filter((job: IClientJobPosting) => job.status === 'PUBLISHED')
      ?.sort((a: IClientJobPosting, b: IClientJobPosting) => {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      })
      .slice(0, 3) || [];

  const recentApplications =
    analytics?.activeCandidates?.recentApplications || [];
  const pendingInterviews =
    analytics?.panelAssessment?.pendingAssessments || [];
  const recentAssessments = analytics?.aiAssessments?.recentAssessments || [];

  const hrStats = [
    {
      title: 'Active Job Postings',
      value: activeJobPostings.length,
      change: '+3 this week',
      changeType: 'positive' as const,
      icon: FileText,
      description: `${analytics?.activeJobPostings?.totalCount || 0} total postings`,
      color: 'bg-[#F6AE66] dark:bg-[#F6AE66]/80',
    },
    {
      title: 'Candidates in Pipeline',
      value: analytics?.activeCandidates?.activeCount || 0,
      change: '+12 this week',
      changeType: 'positive' as const,
      icon: Users,
      description: `${analytics?.activeCandidates?.totalCount || 0} total candidates`,
      color: 'bg-[#52CD75] dark:bg-[#52CD75]/80',
    },
    {
      title: 'Pending Panel Assessments',
      value: analytics?.panelAssessment?.pendingCount || 0,
      change: '5 scheduled today',
      changeType: 'neutral' as const,
      icon: Calendar,
      description: `${analytics?.panelAssessment?.totalCount || 0} total panel assessments`,
      color: 'bg-[#52B1CD] dark:bg-[#52B1CD]/80',
    },
    {
      title: 'AI Assessments Completed',
      value: analytics?.aiAssessments?.completedCount || 0,
      change: '+8 this week',
      changeType: 'positive' as const,
      icon: CheckCircle,
      description: `${analytics?.aiAssessments?.totalCount || 0} total assessments`,
      color: 'bg-[#6E55CF] dark:bg-[#6E55CF]/80',
    },
  ];

  const candidatePipelineData = [
    {
      stage: 'Applied',
      count: recentApplications.length,
      color: 'bg-blue-100 text-blue-800',
      icon: UserPlus,
    },
    {
      stage: 'Screening',
      count: analytics?.aiAssessments?.inProgressCount || 0,
      color: 'bg-yellow-100 text-yellow-800',
      icon: Clock,
    },
    {
      stage: 'Panel Assessment',
      count: analytics?.panelAssessment?.scheduledCount || 0,
      color: 'bg-orange-100 text-orange-800',
      icon: Calendar,
    },
    {
      stage: 'Offer',
      count: 0, // This would need a separate API endpoint
      color: 'bg-green-100 text-green-800',
      icon: CheckCircle,
    },
    {
      stage: 'Hired',
      count: analytics?.candidateOnboarding?.completedCount || 0,
      color: 'bg-purple-100 text-purple-800',
      icon: Trophy,
    },
  ];

  // Helper function to get icon based on entity type
  const getEntityIcon = (entityType: string) => {
    switch (entityType?.toLowerCase()) {
      case 'job_posting':
        return FileText;
      case 'candidate':
        return Users;
      case 'assessment':
        return CheckCircle;
      default:
        return Activity;
    }
  };

  // Helper function to format entity type for display
  const formatEntityType = (entityType: string) => {
    return entityType
      ?.replace('_', ' ')
      ?.replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const recentActivities = activityLogs?.data || [];

  // Loading states
  if (jobPostingsLoading || analyticsLoading || activityLogsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="bg-muted mb-2 h-4 rounded"></div>
                <div className="bg-muted mb-2 h-8 rounded"></div>
                <div className="bg-muted h-3 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {hrStats.map((stat) => (
          <Card
            key={stat.title}
            className={`relative overflow-hidden ${stat.color} h-[140px]`}
          >
            <CardContent className="flex h-full flex-col justify-between overflow-hidden p-4">
              <div className="flex items-center justify-between">
                <p className="truncate text-base font-medium text-white">
                  {stat.title}
                </p>
                <stat.icon
                  className="h-10 w-10 shrink-0 text-white"
                  strokeWidth={0.8}
                />
              </div>

              <div className="space-y-1">
                <p className="truncate text-3xl font-bold text-white opacity-80">
                  {stat.value}
                </p>
              </div>

              <p className="truncate text-sm text-white">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {activeJobPostings.length > 0 &&
        user?.role === UserRoleEnum.RECRUITER && (
          <div className="flex w-full flex-col">
            {/* Manager Details Card */}
            <div className="lg:col-span-9">
              <Card className="dark:bg-primary/10 bg-card h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <CardTitle className="flex items-center gap-2 text-xl">
                        {/* <Shield className="h-5 w-5" /> */}
                        <BriefcaseBusiness className="h-5 w-5" />
                        Active Job Postings
                      </CardTitle>
                      <CardDescription>
                        Track your active job postings
                      </CardDescription>
                    </div>
                    <div>
                      <Button
                        onClick={handleCreateJob}
                        variant="default"
                        size="default"
                        className="gap-2"
                      >
                        <Plus className="h-4 w-4 text-white" />
                        <p>Create Job Posting</p>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="h-full">
                  <div className="group relative -mx-2">
                    {/* Carousel Track */}
                    <div
                      ref={carouselRef}
                      className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-2"
                    >
                      {activeJobPostings.map((job: any) => (
                        <div
                          key={job.id}
                          className="min-w-[280px] shrink-0 snap-start sm:min-w-[340px] lg:min-w-[380px]"
                        >
                          <DashboardJobPostingCard jd={job} />
                        </div>
                      ))}
                    </div>
                    {/* Left/Right Controls */}
                    <div className="pointer-events-none absolute inset-y-0 right-0 left-0 flex items-center justify-between px-1">
                      <button
                        type="button"
                        aria-label="Scroll left"
                        onClick={() => {
                          if (!carouselRef.current) return;
                          const el = carouselRef.current;
                          el.scrollBy({
                            left: -Math.max(300, el.clientWidth * 0.8),
                            behavior: 'smooth',
                          });
                        }}
                        className="bg-background/80 pointer-events-none hidden h-8 w-8 items-center justify-center rounded-full opacity-0 shadow transition-all duration-200 group-hover:pointer-events-auto group-hover:opacity-100 md:flex"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        aria-label="Scroll right"
                        onClick={() => {
                          if (!carouselRef.current) return;
                          const el = carouselRef.current;
                          el.scrollBy({
                            left: Math.max(300, el.clientWidth * 0.8),
                            behavior: 'smooth',
                          });
                        }}
                        className="bg-background/80 pointer-events-none hidden h-8 w-8 items-center justify-center rounded-full opacity-0 shadow transition-all duration-200 group-hover:pointer-events-auto group-hover:opacity-100 md:flex"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Candidate Pipeline + Recent Applications */}
        <div className="space-y-6 lg:col-span-2">
          {/* Candidate Pipeline */}
          <Card className="dark:bg-primary/10 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Candidate Pipeline
              </CardTitle>
              <CardDescription>
                Track candidates through the hiring process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {candidatePipelineData.map((stage) => (
                  <div
                    key={stage.stage}
                    className="bg-card rounded-lg border p-4 text-center"
                  >
                    <div
                      className={`inline-flex rounded-full p-2 ${stage.color} mb-2`}
                    >
                      <stage.icon className="h-4 w-4" />
                    </div>
                    <div className="text-2xl font-bold">{stage.count}</div>
                    <div className="text-muted-foreground text-sm">
                      {stage.stage}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Applications */}
          <Card className="dark:bg-primary/10 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Recent Applications
              </CardTitle>
              <CardDescription>
                Latest candidate applications and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentApplications.length > 0 ? (
                  recentApplications
                    .slice(0, 5)
                    .map((application: any, index: number) => (
                      <div
                        key={application.id || index}
                        className="bg-card flex items-center justify-between rounded-lg border p-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
                            <Users className="text-primary h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {application.candidateName}
                            </p>
                            <p className="text-muted-foreground text-sm">
                              {application.jobTitle}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              Applied{' '}
                              {format(
                                new Date(application.appliedAt),
                                'MMM dd, yyyy'
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              application.status === 'PENDING'
                                ? 'secondary'
                                : application.status === 'APPROVED'
                                  ? 'default'
                                  : 'destructive'
                            }
                          >
                            {application.status}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-muted-foreground py-8 text-center">
                    No recent applications found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Quick Actions + Recent Activities */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="dark:bg-primary/10 bg-white">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <CardDescription>Common HR tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    href: '/app/client/recruiter/sourcing',
                    icon: <Plus className="h-4 w-4" />,
                    title: 'Create Job Posting',
                    description: 'Post a new job opening',
                  },
                  {
                    href: '/app/client/candidates/search',
                    icon: <Search className="h-4 w-4" />,
                    title: 'Search Candidates',
                    description: 'Find potential candidates',
                  },
                  {
                    href: '/app/client/interviews',
                    icon: <Calendar className="h-4 w-4" />,
                    title: 'Schedule Interview',
                    description: 'Set up candidate interviews',
                  },
                  {
                    href: '/app/client/assessments',
                    icon: <CheckCircle className="h-4 w-4" />,
                    title: 'Review Assessments',
                    description: 'Check AI assessment results',
                  },
                  {
                    href: '/app/client/onboarding',
                    icon: <UserCheck className="h-4 w-4" />,
                    title: 'Onboarding',
                    description: 'Manage new hire process',
                  },
                  {
                    href: '/app/client/analytics',
                    icon: <BarChart3 className="h-4 w-4" />,
                    title: 'HR Analytics',
                    description: 'View hiring metrics',
                  },
                ].map((action, index) => (
                  <Button
                    key={index}
                    asChild
                    variant="outline"
                    className="h-auto w-full justify-start p-3"
                  >
                    <Link href={action.href}>
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 rounded p-1">
                          {action.icon}
                        </div>
                        <div className="text-left">
                          <div className="font-medium">{action.title}</div>
                          <div className="text-muted-foreground text-xs">
                            {action.description}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card className="dark:bg-primary/10 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activities
              </CardTitle>
              <CardDescription>Latest HR actions and updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentActivities.length > 0 ? (
                recentActivities
                  .slice(0, 4)
                  .map((activity: any, index: number) => {
                    const IconComponent = getEntityIcon(
                      activity.entityType || ''
                    );
                    return (
                      <TooltipProvider key={activity.id || index}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={cn(
                                'flex items-center justify-between rounded-lg border bg-gray-50/50 p-3 dark:bg-gray-900/50',
                                activity.metadata?.link &&
                                  'cursor-pointer transition-colors duration-200 hover:bg-gray-100/50 dark:hover:bg-gray-800/50'
                              )}
                              onClick={() => {
                                if (activity.metadata?.link) {
                                  window.location.href = activity.metadata.link;
                                }
                              }}
                            >
                              <div className="flex items-center gap-3">
                                <div className="bg-primary flex h-12 w-12 items-center justify-center rounded-lg text-white">
                                  <IconComponent
                                    className="h-8 w-8"
                                    strokeWidth={1}
                                  />
                                </div>
                                <div>
                                  <p className="text-sm font-medium">
                                    {activity.metadata?.jobTitle} -{' '}
                                    {activity.metadata?.title ||
                                      formatEntityType(
                                        activity.entityType || ''
                                      )}
                                  </p>
                                  <p className="text-primary text-sm font-medium">
                                    by{' '}
                                    <span className="text-primary text-sm">
                                      {activity.metadata?.userName ||
                                        'Unknown User'}
                                    </span>
                                  </p>
                                  {activity.metadata?.link && (
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                      {activity?.description || ''}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-500">
                                  {format(
                                    new Date(
                                      activity.timestamp ||
                                        activity.createdAt ||
                                        ''
                                    ),
                                    'dd MMM'
                                  )}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {format(
                                    new Date(
                                      activity.timestamp ||
                                        activity.createdAt ||
                                        ''
                                    ),
                                    'HH:mm'
                                  )}
                                </p>
                                {activity.metadata?.link && (
                                  <ExternalLink className="mt-1 ml-auto h-3 w-3 text-gray-400" />
                                )}
                              </div>
                            </div>
                          </TooltipTrigger>
                          {activity.metadata?.link && (
                            <TooltipContent>
                              <p>Click to view job posting details</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })
              ) : (
                <div className="py-6 text-center text-sm text-gray-500">
                  No recent activities
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Section: Pending Interviews + AI Assessments */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Pending Interviews */}
        <Card className="dark:bg-primary/10 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Pending Panel Assessments
            </CardTitle>
            <CardDescription>
              Upcoming candidate panel assessments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingInterviews.length > 0 ? (
                pendingInterviews
                  .slice(0, 4)
                  .map((interview: any, index: number) => (
                    <div
                      key={interview.id || index}
                      className="bg-card flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                          <Calendar className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {interview.candidateName}
                          </p>
                          <p className="text-muted-foreground text-sm">
                            {interview.jobTitle}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            Applied{' '}
                            {format(
                              new Date(interview.appliedAt),
                              'MMM dd, yyyy'
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{interview.status}</Badge>
                        <Button variant="ghost" size="sm">
                          <Calendar className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-muted-foreground py-8 text-center">
                  No pending panel assessments
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* AI Assessments */}
        <Card className="dark:bg-primary/10 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Recent AI Assessments
            </CardTitle>
            <CardDescription>Latest AI assessment results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAssessments.length > 0 ? (
                recentAssessments
                  .slice(0, 4)
                  .map((assessment: any, index: number) => (
                    <div
                      key={assessment.id || index}
                      className="bg-card flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                          <CheckCircle className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {assessment.candidateName}
                          </p>
                          <p className="text-muted-foreground text-sm">
                            {assessment.jobTitle}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            Score: {assessment.score || 'N/A'}%
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            assessment.status === 'COMPLETED'
                              ? 'default'
                              : assessment.status === 'IN_PROGRESS'
                                ? 'secondary'
                                : 'destructive'
                          }
                        >
                          {assessment.status}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-muted-foreground py-8 text-center">
                  No recent assessments
                </div>
              )}
            </div>
            <Button asChild variant="outline" className="w-full">
              <Link href="/app/client/interviews">Manage Interviews</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Limit Reached Dialog */}
      <Dialog
        open={showLimitReachedDialog}
        onOpenChange={setShowLimitReachedDialog}
      >
        <DialogContent className="max-w-lg">
          <div className="space-y-6 p-2">
            {/* Title Section */}
            <div className="space-y-2">
              <DialogTitle className="text-2xl font-semibold tracking-tight">
                Job Posting Limit Reached
              </DialogTitle>
              <DialogDescription className="text-base">
                You&apos;ve reached your plan&apos;s limit of{' '}
                <span className="text-primary dark:text-primary font-medium">
                  {usageSummary?.jobPostings.limit} job postings
                </span>
                . Upgrade your plan to create more job postings and unlock
                additional features.
              </DialogDescription>
            </div>

            {/* Current Usage Stats */}
            <div className="bg-primary/5 dark:bg-primary/10 rounded-lg border p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Current Usage</span>
                  <span className="text-primary dark:text-primary font-semibold">
                    {usageSummary?.jobPostings.used}/
                    {usageSummary?.jobPostings.limit}
                  </span>
                </div>
                <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                  <div
                    className="bg-primary/90 dark:bg-primary/80 h-full"
                    style={{
                      width: `${Math.min(
                        ((usageSummary?.jobPostings?.used ?? 0) /
                          (usageSummary?.jobPostings?.limit ?? 1)) *
                          100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                onClick={() => setShowLimitReachedDialog(false)}
                className="sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  router.push('/app/client/subscription');
                }}
                className="bg-primary hover:bg-primary/90 text-primary-foreground sm:w-auto"
              >
                Upgrade Plan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Subscription Warning Popup */}
      <SubscriptionWarningPopup
        subscriptionData={subscriptionOverviewData}
        isOpen={showWarning}
        onClose={clearSubscriptionData}
      />
    </div>
  );
};

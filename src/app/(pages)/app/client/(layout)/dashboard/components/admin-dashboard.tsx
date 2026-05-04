'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartLine,
  Mail,
  Calendar,
  Copy,
  Check,
  CircleFadingPlus,
  Receipt,
  Users,
  FileText,
  CreditCard,
  Activity,
  Settings,
  UserCog,
  Target,
  CircleDollarSign,
  Shield,
  Users2,
  RefreshCw,
  ExternalLink,
  BriefcaseBusiness,
  Plus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  activityLogService,
  clientJobPostingService,
  clientSubscriptionService,
  clientAnalyticsService,
  clientAccountManagerService,
  subscriptionLimitsService,
} from '@/lib/services/services';
import { useQuery } from '@tanstack/react-query';
import {
  ActivityModuleEnum,
  IClientJobPosting,
  UserTypeEnum,
} from '@/lib/shared';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { subMonths, format, parseISO, isSameMonth } from 'date-fns';
import { enumToReadableText, formatEnumValue } from '@/lib/utils';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useApp } from '@/lib/context/app-context';
import { logger } from '@/lib/logger';
import { toast } from 'sonner';
import { SubscriptionWarningPopup } from './subscription-warning-popup';
import TrialPackBatch from './trial-pack-batch';
import DashboardJobPostingCard from './dashboard-job-posting-card';

export const AdminDashboard = () => {
  const app = useApp();
  const [showLimitReachedDialog, setShowLimitReachedDialog] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
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
    retry: 1,
    retryDelay: 1000,
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

  // Handle Deel management access
  const handleManageAccess = async () => {
    try {
      // Direct redirect to backend endpoint which handles Deel SSO
      window.open(
        `https://people.teamcast.ai/login/sso?email=${app.user?.email}`,
        '_blank'
      );
    } catch (error) {
      logger.error('Failed to access Deel management:', error);
    }
  };

  // Fetch real data from APIs
  const { data: clientJobPostings, isLoading: jobPostingsLoading } = useQuery({
    queryKey: ['clientJobPostings'],
    queryFn: () => clientJobPostingService.getJobPostings(),
    staleTime: 3 * 60 * 1000, // 3 minutes
    retry: 1,
    retryDelay: 1000,
  });

  const {
    data: activityLogs,
    isLoading: activityLogsLoading,
    isError: activityLogsError,
  } = useQuery({
    queryKey: ['activityLogs', app.user?.clientId],
    queryFn: () =>
      activityLogService.getActivityLogs({
        module: ActivityModuleEnum.JOB,
        clientId: app.user?.clientId,
        page: 1,
        limit: 5,
      }),
    enabled: !!app.user?.clientId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
    retryDelay: 1000,
  });

  const filteredActivityLogs =
    activityLogs?.data?.filter(
      (activity: any) =>
        activity.metadata?.userName &&
        activity.metadata.userName !== 'Unknown User'
    ) || [];

  const {
    data: subscription,
    isLoading: subscriptionLoading,
    error: subscriptionError,
  } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      try {
        return await clientSubscriptionService.getSubscription();
      } catch (error) {
        logger.error('Failed to fetch subscription:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Only retry once instead of 3 times
    retryDelay: 1000, // Wait 1 second before retry
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['adminAnalytics'],
    queryFn: () => clientAnalyticsService.getDashboardAnalytics(),
    staleTime: 3 * 60 * 1000, // 3 minutes
    retry: 1,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
  });

  // Get client ID from subscription data or use a default
  const clientId = subscription?.clientId || app.user?.clientId;

  const {
    data: accountManager,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['accountManager', clientId],
    queryFn: () =>
      clientAccountManagerService.getAccountManagerByClientId(clientId || ''),
    enabled: !!clientId,
    staleTime: 10 * 60 * 1000, // 10 minutes - account manager data changes rarely
    retry: 1,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
  });

  const handleCopyEmail = async () => {
    if (accountManager?.email) {
      try {
        await navigator.clipboard.writeText(accountManager.email);
        setCopiedEmail(true);
        toast.success('Email copied to clipboard');
        setTimeout(() => setCopiedEmail(false), 2000);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : 'An Error Occured'
        );
      }
    }
  };

  const activeJobPostings =
    clientJobPostings?.items
      ?.filter((job: IClientJobPosting) => job.status === 'PUBLISHED')
      ?.sort((a: IClientJobPosting, b: IClientJobPosting) => {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      })
      .slice(0, 6) || [];

  // Calculate month-over-month growth
  let thisMonthCount = 0;
  let lastMonthCount = 0;
  let increase = 0;

  if (clientJobPostings?.items) {
    const now = new Date();
    const lastMonth = subMonths(now, 1);

    clientJobPostings.items.forEach((job: IClientJobPosting) => {
      const createdAt = parseISO(job.createdAt.toString());
      if (isSameMonth(createdAt, now)) {
        thisMonthCount++;
      } else if (isSameMonth(createdAt, lastMonth)) {
        lastMonthCount++;
      }
    });

    increase = thisMonthCount - lastMonthCount;
  }

  // Helper function to get icon based on entity type
  const getEntityIcon = (entityType: string) => {
    switch (entityType?.toLowerCase()) {
      case 'job_posting':
        return FileText;
      case 'candidate':
        return Users;
      case 'assessment':
        return CircleFadingPlus;
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

  const adminStats = [
    {
      title: 'Active Job Postings',
      value: activeJobPostings.length,
      change: `+${increase} this month`,
      changeType: 'positive' as const,
      icon: CircleDollarSign,
      description: `${analytics?.activeJobPostings?.totalCount || 0} total postings`,
      color: 'bg-[#F6AE66] dark:bg-[#F6AE66]/80',
    },
    {
      title: 'Candidates in Pipeline',
      value: analytics?.activeCandidates?.activeCount || 0,
      change: '+52 this week',
      changeType: 'positive' as const,
      icon: Receipt,
      description: `${analytics?.activeCandidates?.totalCount || 0} total candidates`,
      color: 'bg-[#52CD75] dark:bg-[#52CD75]/80',
    },
    {
      title: 'AI Assessments Conducted',
      value: analytics?.aiAssessments?.totalCount || 0,
      change: '+28 this week',
      changeType: 'positive' as const,
      icon: CircleFadingPlus,
      description: `${analytics?.aiAssessments?.completedCount || 0} completed`,
      color: 'bg-[#52B1CD] dark:bg-[#52B1CD]/80',
    },
    {
      title: 'Pending Panel Assessments',
      value: analytics?.panelAssessment?.pendingCount || 0,
      change: '5 scheduled today',
      changeType: 'neutral' as const,
      icon: ChartLine,
      description: `${analytics?.panelAssessment?.totalCount || 0} total panel assessments`,
      color: 'bg-[#6E55CF] dark:bg-[#6E55CF]/80',
    },
  ];

  // Handle subscription data with error fallback
  const subscriptionData =
    subscriptionError || !subscription
      ? {
          currentPlan: 'Loading...',
          usage: {
            jobPostings: { used: 0, limit: 0, percentage: 0 },
            assessments: { used: 0, limit: 0, percentage: 0 },
            teamMembers: { used: 0, limit: 0, percentage: 0 },
          },
          nextBillingDate: 'N/A',
          monthlySpend: 0,
          status: 'Active',
          isTrial: false,
        }
      : {
          currentPlan: subscription.package?.name || 'Enterprise Pro',
          usage: {
            jobPostings: {
              used: subscription.usedJobPostings || 0,
              limit: subscription.package?.maxJobPostings || 0,
              percentage:
                ((subscription.usedJobPostings || 0) /
                  (subscription.package?.maxJobPostings || 1)) *
                100,
            },
            assessments: {
              used: subscription.usedAiAssessments || 0,
              limit: subscription.package?.maxAiAssessments || 0,
              percentage:
                ((subscription.usedAiAssessments || 0) /
                  (subscription.package?.maxAiAssessments || 1)) *
                100,
            },
            teamMembers: {
              used: subscription.usedSeats || 0,
              limit: subscription.package?.maxSeats || 0,
              percentage:
                ((subscription.usedSeats || 0) /
                  (subscription.package?.maxSeats || 1)) *
                100,
            },
          },
          nextBillingDate: subscription.nextBillingDate
            ? format(new Date(subscription.nextBillingDate), 'MMM dd, yyyy')
            : 'N/A',
          monthlySpend: subscription.package?.price || 0,
          status: subscription.status || 'Active',
          isTrial: subscription.isTrial || false,
        };

  const teamManagementData = [
    {
      role: 'Admin',
      count: analytics?.teamMembers?.byRole?.admin || 0,
    },
    {
      role: 'HR Manager',
      count: analytics?.teamMembers?.byRole?.hr || 0,
    },
    {
      role: 'Recruiter',
      count: analytics?.teamMembers?.byRole?.recruiter || 0,
    },
    {
      role: 'Accounts',
      count: analytics?.teamMembers?.byRole?.accounts || 0,
    },
  ];

  const onboardingStats = {
    totalCandidates: analytics?.candidateOnboarding?.totalCount || 0,
    completedOnboarding: analytics?.candidateOnboarding?.completedCount || 0,
    inProgress: analytics?.candidateOnboarding?.inProgressCount || 0,
    pending: analytics?.candidateOnboarding?.pendingCount || 0,
    completionRate: Number(
      (
        ((analytics?.candidateOnboarding?.completedCount || 0) /
          (analytics?.candidateOnboarding?.totalCount || 1)) *
        100
      ).toFixed(2)
    ),
  };

  // Extract activity logs data
  const recentActivities = filteredActivityLogs;

  // Loading states (activity logs excluded so a slow/failed activity API doesn't block the whole dashboard)
  if (jobPostingsLoading || subscriptionLoading || analyticsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="h-[155px] animate-pulse">
              <CardContent className="p-4">
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
        {adminStats?.map((stat) => (
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
                <p className="truncate text-xs text-white">
                  {stat.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
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

      {/* latest job postings card */}
      {activeJobPostings.length > 0 && (
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
                      <p>Create Job Posting </p>
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
              <div className="mb-3 flex cursor-pointer justify-end px-8 py-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    router.push('/app/client/recruiter/sourcing');
                  }}
                  className="hover:text-primary h-8 px-4 text-sm font-semibold text-gray-500"
                >
                  View all
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Manager Details + Quick Actions (side by side with equal height) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Manager Details Card */}
        <div className="lg:col-span-9">
          <Card className="dark:bg-primary/10 bg-card h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Shield className="h-5 w-5" />
                Account Manager Details
              </CardTitle>
              <CardDescription>
                Your dedicated account manager information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-muted h-16 w-16 animate-pulse rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="bg-muted h-4 animate-pulse rounded" />
                      <div className="bg-muted h-3 w-2/3 animate-pulse rounded" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="bg-muted h-12 animate-pulse rounded"
                      />
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <div className="py-2 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/20">
                    <Shield className="h-8 w-8 text-[#6E55CF]" />
                  </div>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-[#6E55CF] dark:text-red-400">
                      Unable to Load Manager Details
                    </h3>
                    <p className="text-muted-foreground mt-2 text-sm">
                      We encountered an issue while fetching your account
                      manager information.
                    </p>
                  </div>
                  <div className="flex justify-center gap-3">
                    <Button
                      onClick={() => window.location.reload()}
                      variant="default"
                      size="sm"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Try Again
                    </Button>
                  </div>
                </div>
              )}

              {!accountManager && !isLoading && !error && (
                <div className="py-12 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/20">
                    <Users className="h-8 w-8 text-blue-500" />
                  </div>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                      Manager Not Assigned
                    </h3>
                    <p className="text-muted-foreground mt-2 text-sm">
                      No account manager has been assigned to your account yet.
                    </p>
                  </div>
                  <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950/20">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Need assistance?</strong> Our support team is here
                      to help you with any questions about your subscription,
                      features, or account management.
                    </p>
                  </div>
                </div>
              )}

              {accountManager && !isLoading && (
                <>
                  {/* Main Content - Two Column Layout */}
                  <div className="mb-6 flex flex-col gap-6">
                    {/* Profile Section - Left Half */}
                    <div className="bg-muted/50 h-full flex-1 rounded-lg p-5">
                      <div className="flex items-center gap-4">
                        <Avatar className="border-primary h-16 w-16 border">
                          <AvatarImage
                            src={accountManager.image}
                            alt={accountManager.name}
                          />
                          <AvatarFallback className="text-lg">
                            {accountManager.name
                              ?.split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="text-foreground text-md font-semibold">
                            {accountManager.name}
                          </h3>
                          <p className="text-muted-foreground text-md font-medium">
                            {accountManager.jobTitle || 'Account Manager'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Contact Information - Right Half */}
                    <div className="flex-1 space-y-3">
                      <div className="flex w-full gap-6">
                        {/* Email */}
                        <div className="bg-muted/50 flex w-full items-center justify-between rounded-lg p-3">
                          <div className="flex items-center gap-3">
                            <Mail className="text-muted-foreground h-4 w-4" />
                            <div>
                              <p className="text-sm font-medium">Email</p>
                              <p className="text-muted-foreground text-sm">
                                {accountManager.email}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCopyEmail}
                            className="h-8 w-8 p-0"
                          >
                            {copiedEmail ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>

                        {/* Assigned Date */}
                        <div className="bg-muted/50 flex w-full items-center justify-between rounded-lg p-3">
                          <div className="flex items-center gap-3">
                            <Calendar className="text-muted-foreground h-4 w-4" />
                            <div>
                              <p className="text-sm font-medium">
                                Assigned Since
                              </p>
                              <p className="text-muted-foreground text-sm">
                                {accountManager.assignedAt
                                  ? format(
                                      accountManager.assignedAt instanceof Date
                                        ? accountManager.assignedAt
                                        : parseISO(accountManager.assignedAt),
                                      'MMM dd, yyyy'
                                    )
                                  : 'N/A'}
                              </p>
                            </div>
                          </div>
                          {/* Keep empty div for alignment (so it matches Email layout) */}
                          <div className="h-8 w-8" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Support Message - Full Width at Bottom */}
                  <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950/20">
                    <p className="text-primary text-sm dark:text-blue-200">
                      <strong>Need help?</strong> Your account manager is here
                      to support you with any questions about your subscription,
                      features, or account management.
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-3">
          <Card className="dark:bg-primary/10 bg-card h-full">
            <CardHeader>
              <CardTitle className="text-xl">Quick Actions</CardTitle>
              <CardDescription>
                Common billing and account management tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                {/* Manage People Button - Only show when user.type === 'CLIENT' and user.isDeelEnabled === true */}
                {app.user?.type === UserTypeEnum.CLIENT &&
                  app.user?.isDeelEnabled === true && (
                    <Button
                      onClick={handleManageAccess}
                      variant="outline"
                      className="bg-muted/50 hover:bg-muted h-auto justify-start p-2"
                    >
                      <div className="flex items-center gap-2">
                        <div className="bg-primary rounded-lg p-1.5">
                          <Users2 className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-left">
                          <div className="text-foreground text-sm font-medium">
                            Manage People
                          </div>
                          <div className="text-muted-foreground text-xs break-words whitespace-normal">
                            Access Deel.com for managing people
                          </div>
                        </div>
                      </div>
                    </Button>
                  )}

                {[
                  {
                    href: '/app/client/subscription',
                    icon: <Settings className="h-6 w-6 text-white" />,
                    title: 'Manage Subscriptions',
                    desc: 'Upgrade or modify plans',
                  },
                  {
                    href: '/app/client/users',
                    icon: <UserCog className="h-6 w-6 text-white" />,
                    title: 'Manage Users',
                    desc: 'Add or edit team members',
                  },
                  {
                    href: '/app/client/recruiter/sourcing',
                    icon: <FileText className="h-6 w-6 text-white" />,
                    title: 'Manage Jobs',
                    desc: 'Create and edit job postings',
                  },
                ].map((item, index) => (
                  <Button
                    key={index}
                    asChild
                    variant="outline"
                    className="bg-muted/50 hover:bg-muted h-auto justify-start overflow-hidden p-3"
                  >
                    <Link href={item.href} className="flex items-center gap-2">
                      <div className="bg-primary rounded-lg p-1.5">
                        {item.icon}
                      </div>
                      <div className="text-left">
                        <div className="text-foreground text-sm font-medium break-words whitespace-normal">
                          {item.title}
                        </div>
                        <div className="text-muted-foreground text-xs break-words whitespace-normal">
                          {item.desc}
                        </div>
                      </div>
                    </Link>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activities + Team Management (full width with half-half layout) */}
      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
        {/* Recent Activities */}
        <Card className="dark:bg-primary/10 bg-card h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Activity className="h-5 w-5" />
              Recent Activities
            </CardTitle>
            <CardDescription>
              Your latest updates and actions at a glance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {activityLogsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-muted h-16 animate-pulse rounded-lg"
                  />
                ))}
              </div>
            ) : activityLogsError ? (
              <p className="text-muted-foreground py-4 text-center text-sm">
                Could not load recent activity. The rest of your dashboard is
                unaffected.
              </p>
            ) : recentActivities.length > 0 ? (
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
                                  <span className="text-primary">•</span>{' '}
                                  {activity.metadata?.jobTitle || ''}-{' '}
                                  {activity.metadata?.title ||
                                    formatEntityType(activity.entityType || '')}
                                  , by{' '}
                                  <span className="text-primary pt-1.5 text-sm">
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

        {/* Team Management */}
        <Card className="dark:bg-primary/10 bg-card h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <UserCog className="h-5 w-5" />
              Team Management
            </CardTitle>
            <CardDescription>Users</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {teamManagementData?.map((team) => (
                <div
                  key={team.role}
                  className="bg-muted/50 flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-foreground font-medium">
                        {team?.role}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {team?.count} {team?.count === 1 ? 'user' : 'users'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Candidate Onboarding Statistics - Bottom */}
      <Card className="dark:bg-primary/10 bg-card w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <CreditCard className="h-5 w-5" />
            Current Subscription
          </CardTitle>
          <CardDescription>Plan details and usage summary</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Show error message if subscription failed to load */}
          {subscriptionError && (
            <div className="rounded-lg bg-yellow-50 p-3 dark:bg-yellow-950/20">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Unable to load subscription details. Please refresh the page or
                contact support if the issue persists.
              </p>
            </div>
          )}

          {/* Main subscription info */}
          <div className="flex w-full items-center justify-between">
            <div className="w-1/3">
              <div className="flex items-center gap-5">
                <p className="text-muted-foreground font-medium">
                  {formatEnumValue(subscriptionData.currentPlan)}
                </p>
                {subscriptionData.isTrial && <TrialPackBatch />}
              </div>
              <p className="text-foreground font-medium">
                $ {subscriptionData.monthlySpend}
              </p>
            </div>

            <div className="w-1/3 text-center">
              <p className="text-muted-foreground font-medium">Next billing:</p>
              <p className="text-foreground font-medium">
                {subscriptionData.nextBillingDate}
              </p>
            </div>

            <div className="flex w-1/3 justify-end">
              <Badge variant="default" className="rounded-2xl bg-[#259800]">
                {enumToReadableText(subscriptionData.status)}
              </Badge>
            </div>
          </div>

          {/* Usage cards */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {/* Job Postings */}
            <div className="bg-muted/50 rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <span className="text-md font-medium">Job Postings</span>
                <span className="text-md text-primary font-bold">
                  {subscriptionData.usage.jobPostings.used}/
                  {subscriptionData.usage.jobPostings.limit}
                </span>
              </div>
            </div>

            {/* AI Assessments */}
            <div className="bg-muted/50 rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <span className="text-md font-medium">AI Assessments</span>
                <span className="text-md text-primary font-bold">
                  {subscriptionData.usage.assessments.used}/
                  {subscriptionData.usage.assessments.limit}
                </span>
              </div>
            </div>

            {/* Team Members */}
            <div className="bg-muted/50 rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <span className="text-md font-medium">Team Members</span>
                <span className="text-md text-primary font-bold">
                  {subscriptionData.usage.teamMembers.used}/
                  {subscriptionData.usage.teamMembers.limit}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="dark:bg-primary/10 bg-card">
        <CardHeader className="flex w-full flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Candidate Onboarding Statistics
              </div>
            </CardTitle>
            <CardDescription className="mt-1">
              Track candidate progression through onboarding
            </CardDescription>
          </div>
          <div className="flex flex-col items-start sm:items-end">
            <div className="flex items-center gap-2">
              <Badge className="rounded-2xl">
                {onboardingStats.completionRate}%
              </Badge>
              <p>Conversion Rate</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-muted/50 rounded-lg border p-4 text-center">
              <div className="text-primary text-2xl font-bold">
                {onboardingStats.totalCandidates}
              </div>
              <div className="text-muted-foreground text-sm">
                Total Candidates
              </div>
            </div>
            <div className="bg-muted/50 rounded-lg border p-4 text-center">
              <div className="text-primary text-2xl font-bold">
                {onboardingStats.completedOnboarding}
              </div>
              <div className="text-muted-foreground text-sm">Completed</div>
            </div>
            <div className="bg-muted/50 rounded-lg border p-4 text-center">
              <div className="text-primary text-2xl font-bold">
                {onboardingStats.inProgress}
              </div>
              <div className="text-muted-foreground text-sm">In Progress</div>
            </div>
            <div className="bg-muted/50 rounded-lg border p-4 text-center">
              <div className="text-primary text-2xl font-bold">
                {onboardingStats.pending}
              </div>
              <div className="text-muted-foreground text-sm">Pending</div>
            </div>
          </div>
        </CardContent>
      </Card>
      <SubscriptionWarningPopup
        subscriptionData={subscriptionOverviewData}
        isOpen={showWarning}
        onClose={clearSubscriptionData}
      />
    </div>
  );
};

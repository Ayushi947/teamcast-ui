'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserRoleEnum } from '@/lib/shared';
import { Briefcase } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { subscriptionLimitsService } from '@/lib/services/services';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { useQuery } from '@tanstack/react-query';

interface DashboardHeaderProps {
  user: any;
  hasJobPostings?: boolean;
}

const getRoleDisplayName = (role: string) => {
  switch (role) {
    case UserRoleEnum.ADMIN:
      return 'Admin';
    case UserRoleEnum.HR:
      return 'HR Manager';
    case UserRoleEnum.ACCOUNTS:
      return 'Accounts Manager';
    case UserRoleEnum.RECRUITER:
      return 'Recruiter';
    default:
      return 'Team Member';
  }
};

const getRoleDescription = (role: string) => {
  switch (role) {
    case UserRoleEnum.ADMIN:
      return "Manage your organization's hiring platform, subscriptions, and team.";
    case UserRoleEnum.HR:
      return 'Review candidates, schedule interviews, and manage the hiring pipeline.';
    case UserRoleEnum.ACCOUNTS:
      return 'Monitor billing, manage subscriptions, and track financial metrics.';
    case UserRoleEnum.RECRUITER:
      return 'Source candidates, review applications, and conduct interviews.';
    default:
      return 'Access your recruitment and team management tools.';
  }
};

const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case UserRoleEnum.ADMIN:
      return 'destructive' as const;
    case UserRoleEnum.HR:
      return 'default' as const;
    case UserRoleEnum.ACCOUNTS:
      return 'secondary' as const;
    case UserRoleEnum.RECRUITER:
      return 'outline' as const;
    default:
      return 'secondary' as const;
  }
};

// Client-side date component to prevent hydration mismatch
const LastUpdatedDate = () => {
  const [mounted, setMounted] = useState(false);
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    setMounted(true);
    // Use a consistent date format that works across locales
    const now = new Date();
    const formattedDate = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(now);
    setCurrentDate(formattedDate);
  }, []);

  if (!mounted) {
    return <span>Loading...</span>;
  }

  return <span>Last updated: {currentDate}</span>;
};

export const DashboardHeader = ({
  user,
  hasJobPostings = true,
}: DashboardHeaderProps) => {
  const [showLimitReachedDialog, setShowLimitReachedDialog] = useState(false);
  const router = useRouter();
  const [showOnboardingBanner, setShowOnboardingBanner] = useState(true);
  const userRole = user?.role || UserRoleEnum.HR;
  const roleDisplayName = getRoleDisplayName(userRole);
  const roleDescription = getRoleDescription(userRole);
  const badgeVariant = getRoleBadgeVariant(userRole);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#6E55CF]">{`Welcome back, ${user?.name || 'Client'}!👋🏻 `}</h1>
            <Badge
              variant={badgeVariant}
              className="rounded-md bg-[#6E55CF] text-xs font-bold text-white dark:text-white"
            >
              {roleDisplayName}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">{`${roleDescription}`}</p>
        </div>

        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <LastUpdatedDate />
        </div>
      </div>

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

      {/* Onboarding Banner - Only show when no job postings exist */}
      {!hasJobPostings && showOnboardingBanner && (
        <div className="border-primary/20 bg-primary/5 dark:border-primary/30 dark:bg-primary/10 rounded-xl border p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 dark:bg-primary/20 flex h-12 w-12 items-center justify-center rounded-full">
                <Briefcase className="text-primary h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h2 className="text-primary dark:text-primary-foreground text-lg font-semibold">
                  Welcome to Teamcast! Here&apos;s how to get started.
                </h2>
                <p className="text-primary/80 dark:text-primary/70 text-sm">
                  To begin using the platform, your first step is to create a
                  job posting. This will allow you to start sourcing candidates
                  and utilizing our AI assessment tools.
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleCreateJob}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                  >
                    <Briefcase className="h-4 w-4" />
                    Create Job Posting →
                  </button>
                  <button
                    onClick={() => setShowOnboardingBanner(false)}
                    className="order-primary/30 bg-background text-primary hover:bg-primary/5 dark:border-primary/40 dark:hover:bg-primary/10 cursor-pointer rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
                  >
                    I&apos;ll do this later
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowOnboardingBanner(false)}
              className="text-primary/60 hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20 dark:hover:text-primary/80 rounded-full p-1 transition-colors"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

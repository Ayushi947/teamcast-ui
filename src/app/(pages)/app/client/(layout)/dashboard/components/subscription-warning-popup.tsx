'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertTriangle, Clock, Zap } from 'lucide-react';
import Link from 'next/link';

interface SubscriptionWarningPopupProps {
  subscriptionData: any;
  isOpen: boolean;
  onClose: () => void;
}

export const SubscriptionWarningPopup = ({
  subscriptionData,
  isOpen,
  onClose,
}: SubscriptionWarningPopupProps) => {
  const getWarningContent = () => {
    const {
      isStarterPackage,
      activePackRemainingDays,
      overallQuotaUsedInPercentage,
      subscriptionStatus,
      activePackTotalDays,
    } = subscriptionData;

    // Calculate progress percentage for days remaining
    const calculateDaysProgress = () => {
      if (activePackTotalDays && activePackRemainingDays !== undefined) {
        const usedDays = activePackTotalDays - activePackRemainingDays;
        const progressPercentage = (usedDays / activePackTotalDays) * 100;
        return {
          remainingDays: activePackRemainingDays,
          totalDays: activePackTotalDays,
          usedDays,
          progressPercentage: Math.min(100, Math.max(0, progressPercentage)),
        };
      }
      return null;
    };

    const daysProgress = calculateDaysProgress();

    // Check for EXPIRED subscription
    if (subscriptionStatus === 'EXPIRED') {
      return {
        title: 'Subscription Expired',
        description:
          'Your subscription has expired. Please renew your subscription pack to continue utilizing our services.',
        icon: <AlertTriangle className="h-8 w-8 text-red-600" />,
        color: 'text-red-600',
        bgColor: 'bg-red-50 dark:bg-red-950/20',
        borderColor: 'border-red-200 dark:border-red-800',
        actionText: 'Renew Subscription',
        actionHref: '/app/client/subscription',
        severity: 'critical',
        daysProgress,
      };
    }

    // Check for both conditions: expiration (≤ 10 days) AND high quota usage (≥ 80%)
    if (activePackRemainingDays <= 10 && overallQuotaUsedInPercentage >= 80) {
      const isTrial = isStarterPackage;
      return {
        title: isTrial
          ? 'Trial Pack Expiring & High Usage'
          : 'Subscription Expiring & High Usage',
        description: isTrial
          ? `Your trial pack will expire in ${activePackRemainingDays} day${activePackRemainingDays === 1 ? '' : 's'} and you've used ${overallQuotaUsedInPercentage.toFixed(1)}% of your quota. Upgrade now to continue using our services.`
          : `Your subscription will expire in ${activePackRemainingDays} day${activePackRemainingDays === 1 ? '' : 's'} and you've used ${overallQuotaUsedInPercentage.toFixed(1)}% of your quota. Renew and upgrade to avoid service interruption.`,
        icon: <AlertTriangle className="h-8 w-8 text-amber-600" />,
        color: 'text-amber-600',
        bgColor: 'bg-amber-50 dark:bg-amber-950/20',
        borderColor: 'border-amber-200 dark:border-amber-800',
        actionText: isTrial ? 'Upgrade Now' : 'Renew & Upgrade',
        actionHref: '/app/client/subscription',
        severity: 'critical',
        daysLeft: activePackRemainingDays,
        usagePercentage: overallQuotaUsedInPercentage,
        showBoth: true,
        daysProgress,
      };
    }

    // Check for trial/subscription expiration (≤ 10 days)
    if (activePackRemainingDays <= 10) {
      const isTrial = isStarterPackage;
      return {
        title: isTrial
          ? 'Trial Pack Expiring Soon'
          : 'Subscription Expiring Soon',
        description: isTrial
          ? `Your trial pack will expire in ${activePackRemainingDays} day${activePackRemainingDays === 1 ? '' : 's'}. Upgrade to continue using our services.`
          : `Your subscription will expire in ${activePackRemainingDays} day${activePackRemainingDays === 1 ? '' : 's'}. Renew to avoid service interruption.`,
        icon: <Clock className="h-8 w-8 text-amber-600" />,
        color: 'text-amber-600',
        bgColor: 'bg-amber-50 dark:bg-amber-950/20',
        borderColor: 'border-amber-200 dark:border-amber-800',
        actionText: isTrial ? 'Upgrade Now' : 'Renew Subscription',
        actionHref: '/app/client/subscription',
        severity: 'warning',
        daysLeft: activePackRemainingDays,
        daysProgress,
      };
    }

    // Check for high quota usage (≥ 80%)
    if (overallQuotaUsedInPercentage >= 80) {
      return {
        title: 'High Usage Alert',
        description: `You've used ${overallQuotaUsedInPercentage.toFixed(1)}% of your allocated quota. Consider upgrading your plan for more resources.`,
        icon: <Zap className="h-8 w-8 text-amber-600" />,
        color: 'text-amber-600',
        bgColor: 'bg-amber-50 dark:bg-amber-950/20',
        borderColor: 'border-amber-200 dark:border-amber-800',
        actionText: 'View Usage Details',
        actionHref: '/app/client/subscription',
        severity: 'info',
        usagePercentage: overallQuotaUsedInPercentage,
      };
    }

    return null;
  };

  const warningContent = getWarningContent();

  if (!warningContent) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {warningContent.icon}
            <DialogTitle className={warningContent.color}>
              {warningContent.title}
            </DialogTitle>
          </div>
          <DialogDescription className="text-left text-base">
            {warningContent.description}
          </DialogDescription>
        </DialogHeader>

        <div
          className={`rounded-lg border p-6 ${warningContent.bgColor} ${warningContent.borderColor}`}
        >
          {warningContent.severity === 'critical' &&
            !warningContent.showBoth && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <span className="text-base font-medium text-red-600">
                    Service Access Restricted
                  </span>
                </div>
                <p className="text-muted-foreground text-sm">
                  Your account is currently inactive. Please purchase a
                  subscription to restore access to all features.
                </p>
              </div>
            )}

          {warningContent.showBoth && (
            <div className="space-y-6">
              {/* Days Remaining Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-amber-600" />
                  <span className="text-base font-medium text-amber-600">
                    {warningContent.daysLeft} Day
                    {warningContent.daysLeft === 1 ? '' : 's'} Remaining
                  </span>
                </div>

                <div className="h-3 w-full rounded-full bg-amber-200">
                  <div
                    className="h-3 rounded-full bg-amber-600 transition-all duration-300"
                    style={{
                      width: `${warningContent.daysProgress ? warningContent.daysProgress.progressPercentage : Math.max(0, Math.min(100, (warningContent.daysLeft / 10) * 100))}%`,
                    }}
                  />
                </div>
                <p className="text-muted-foreground text-sm">
                  Time is running out! Take action now to avoid service
                  interruption.
                </p>
              </div>

              {/* Quota Usage Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-amber-600" />
                  <span className="text-base font-medium text-amber-600">
                    {warningContent.usagePercentage.toFixed(1)}% Quota Used
                  </span>
                </div>
                <div className="h-3 w-full rounded-full bg-amber-200">
                  <div
                    className="h-3 rounded-full bg-amber-600 transition-all duration-300"
                    style={{
                      width: `${Math.min(100, warningContent.usagePercentage)}%`,
                    }}
                  />
                </div>
                <p className="text-muted-foreground text-sm">
                  You&apos;re approaching your usage limits. Consider upgrading
                  for more resources.
                </p>
              </div>
            </div>
          )}

          {warningContent.severity === 'warning' &&
            warningContent.daysLeft &&
            !warningContent.showBoth && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-amber-600" />
                  <span className="text-base font-medium text-amber-600">
                    {warningContent.daysLeft} Day
                    {warningContent.daysLeft === 1 ? '' : 's'} Remaining
                  </span>
                </div>

                <div className="h-3 w-full rounded-full bg-amber-200">
                  <div
                    className="h-3 rounded-full bg-amber-600 transition-all duration-300"
                    style={{
                      width: `${warningContent.daysProgress ? warningContent.daysProgress.progressPercentage : Math.max(0, Math.min(100, (warningContent.daysLeft / 10) * 100))}%`,
                    }}
                  />
                </div>
                <p className="text-muted-foreground text-sm">
                  Time is running out! Take action now to avoid service
                  interruption.
                </p>
              </div>
            )}

          {warningContent.severity === 'info' &&
            warningContent.usagePercentage &&
            !warningContent.showBoth && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-amber-600" />
                  <span className="text-base font-medium text-amber-600">
                    {warningContent.usagePercentage.toFixed(1)}% Quota Used
                  </span>
                </div>
                <div className="h-3 w-full rounded-full bg-amber-200">
                  <div
                    className="h-3 rounded-full bg-amber-600 transition-all duration-300"
                    style={{
                      width: `${Math.min(100, warningContent.usagePercentage)}%`,
                    }}
                  />
                </div>
                <p className="text-muted-foreground text-sm">
                  You&apos;re approaching your usage limits. Consider upgrading
                  for more resources.
                </p>
              </div>
            )}
        </div>

        <div className="flex gap-3 pt-6">
          {warningContent.severity === 'critical' ||
          (warningContent.usagePercentage &&
            warningContent.usagePercentage >= 100) ? (
            <Button asChild variant="outline" className="flex-1">
              <Link href="/help" onClick={onClose}>
                Contact Support
              </Link>
            </Button>
          ) : (
            <Button onClick={onClose} variant="outline" className="flex-1">
              Dismiss
            </Button>
          )}
          <Button asChild className="flex-1" variant="default">
            <Link href={warningContent.actionHref} onClick={onClose}>
              {warningContent.actionText}
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

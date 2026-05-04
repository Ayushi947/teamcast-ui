'use client';

import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';

interface SubscriptionHeaderProps {
  user: any;
  subscription?: any;
}

// Client-side date component to prevent hydration mismatch
const LastUpdatedDate = () => {
  const [mounted, setMounted] = useState(false);
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    setMounted(true);
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

export const SubscriptionHeader = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  user,
  subscription,
}: SubscriptionHeaderProps) => {
  const getSubscriptionStatus = () => {
    if (!subscription) return 'No Subscription';
    return subscription.status || 'Unknown';
  };

  const getSubscriptionDescription = () => {
    if (!subscription) {
      return 'Subscribe to a plan to access premium features and manage your billing.';
    }

    const planName = subscription.package?.name || 'Current Plan';
    return `Manage your ${planName} subscription, payment methods, and usage statistics.`;
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'default' as const;
      case 'CANCELLED':
        return 'destructive' as const;
      case 'EXPIRED':
        return 'secondary' as const;
      case 'TRIAL':
        return 'outline' as const;
      default:
        return 'secondary' as const;
    }
  };

  const subscriptionStatus = getSubscriptionStatus();
  const subscriptionDescription = getSubscriptionDescription();
  const badgeVariant = getStatusBadgeVariant(subscriptionStatus);

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-[#6E55CF]">
            Subscription Management
          </h1>
          <Badge
            variant={badgeVariant}
            className="rounded-md bg-[#6E55CF] text-xs font-bold text-white dark:text-white"
          >
            {subscriptionStatus}
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm">
          {subscriptionDescription}
        </p>
      </div>

      <div className="text-muted-foreground flex items-center gap-2 text-sm">
        <LastUpdatedDate />
      </div>
    </div>
  );
};

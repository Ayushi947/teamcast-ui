import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IClientSubscription } from '@/lib/shared';
import {
  Users,
  Briefcase,
  Eye,
  Brain,
  Clock,
  Calendar,
  DollarSign,
  Package,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BillingHistory } from './billing-history';
import { formatEnumValue } from '@/lib/utils';
import TrialPackBatch from '../../dashboard/components/trial-pack-batch';

interface SubscriptionMetadata {
  trialEndDate?: string;
  lastLoginDate?: string;
  subscriptionSource?: string;
}

interface ExtendedClientSubscription extends IClientSubscription {
  metadata?: SubscriptionMetadata;
}

interface SubscriptionUsageProps {
  subscription: ExtendedClientSubscription;
  subscriptionId: string;
  customerId: string;
  onCancelSubscription?: (reason?: string) => Promise<void>;
}

export const SubscriptionUsage: React.FC<SubscriptionUsageProps> = ({
  subscription,
  subscriptionId,
  customerId,
  onCancelSubscription,
}) => {
  const router = useRouter();

  const calculateUsagePercentage = (used: number, total: number) => {
    if (!total || total <= 0) return 0;
    return Math.min((used / total) * 100, 100);
  };

  const formatQuota = (used: number, total: number) => {
    if (!total || total <= 0) {
      return `${used} / Unlimited`;
    }
    return `${used}/${total}`;
  };

  const formatQuotaChange = (used: number, total: number) => {
    if (!total || total <= 0) {
      return `${used} used`;
    }
    return `${Math.round(calculateUsagePercentage(used, total))}% used`;
  };

  const formatDate = (date: string | Date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getDaysRemaining = (endDate: string | Date) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getTrialDaysRemaining = () => {
    if (!subscription.metadata?.trialEndDate) return 0;
    return getDaysRemaining(subscription.metadata.trialEndDate);
  };

  const daysRemaining =
    subscription.package.name !== 'Free' && subscription.endDate !== null
      ? getDaysRemaining(subscription.endDate)
      : subscription.package.billingCycle === 'Monthly'
        ? 30
        : 365;

  const trialDaysRemaining = getTrialDaysRemaining();
  const isInTrial = trialDaysRemaining > 0;

  if (!subscription?.package) return null;

  // Key metrics cards similar to dashboard
  const subscriptionStats = [
    {
      title: 'Current Plan',
      value: formatEnumValue(subscription.package.name),
      change: `$${subscription.package.price}/${subscription.package.billingCycle.toLowerCase()}`,
      changeType: 'neutral' as const,
      icon: Package,
      description: subscription.status,
      color: 'bg-[#6E55CF] dark:bg-[#6E55CF]/80',
    },
    {
      title: 'Team Members',
      value: formatQuota(subscription.usedSeats, subscription.package.maxSeats),
      change: formatQuotaChange(
        subscription.usedSeats,
        subscription.package.maxSeats
      ),
      changeType:
        subscription.package.maxSeats > 0 &&
        subscription.usedSeats / subscription.package.maxSeats > 0.8
          ? 'negative'
          : ('positive' as const),
      icon: Users,
      description: 'Active seats',
      color: 'bg-[#52CD75] dark:bg-[#52CD75]/80',
    },
    {
      title: 'Job Postings',
      value: formatQuota(
        subscription.usedJobPostings,
        subscription.package.maxJobPostings
      ),
      change: formatQuotaChange(
        subscription.usedJobPostings,
        subscription.package.maxJobPostings
      ),
      changeType:
        subscription.package.maxJobPostings > 0 &&
        subscription.usedJobPostings / subscription.package.maxJobPostings > 0.8
          ? 'negative'
          : ('positive' as const),
      icon: Briefcase,
      description: 'Active postings',
      color: 'bg-[#F6AE66] dark:bg-[#F6AE66]/80',
    },
    {
      title: 'AI Assessments',
      value: formatQuota(
        subscription.usedAiAssessments,
        subscription.package.maxAiAssessments
      ),
      change: formatQuotaChange(
        subscription.usedAiAssessments,
        subscription.package.maxAiAssessments
      ),
      changeType:
        subscription.package.maxAiAssessments > 0 &&
        subscription.usedAiAssessments / subscription.package.maxAiAssessments >
          0.8
          ? 'negative'
          : ('positive' as const),
      icon: Brain,
      description: 'Completed tests',
      color: 'bg-[#52B1CD] dark:bg-[#52B1CD]/80',
    },
  ];

  // Quick actions
  const quickActions = [
    {
      href: '/pricing',
      icon: <Package className="h-4 w-4" />,
      title: 'Upgrade Plan',
      description: 'Change to a higher tier',
    },
    {
      href: '/help',
      icon: <Zap className="h-4 w-4" />,
      title: 'Get Support',
      description: 'Contact customer service',
    },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Key Metrics Grid - Matching Dashboard Style */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {subscriptionStats.map((stat) => (
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
                <p className="truncate text-2xl font-bold text-white opacity-80">
                  {stat.value}
                </p>
              </div>

              <p className="truncate text-sm text-white">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Plan Details */}
        <div className="space-y-6 lg:col-span-2">
          {/* Plan Details */}
          <Card className="dark:bg-primary/10 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Plan Details
              </CardTitle>
              <CardDescription>
                Current subscription information and billing details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-card flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 rounded-full p-2">
                      <DollarSign className="text-primary h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-5">
                        <p className="font-medium">
                          {formatEnumValue(subscription.package.name)} Plan
                        </p>
                        {subscription.isTrial && <TrialPackBatch />}
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {subscription.package.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">
                      ${subscription.package.price}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      per {subscription.package.billingCycle.toLowerCase()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="bg-card flex items-center gap-3 rounded-lg border p-3">
                    <Calendar className="text-muted-foreground h-4 w-4" />
                    <div>
                      <p className="text-sm font-medium">Next Billing</p>
                      <p className="text-muted-foreground text-sm">
                        {formatDate(subscription.nextBillingDate)}
                      </p>
                    </div>
                  </div>

                  <div className="bg-card flex items-center gap-3 rounded-lg border p-3">
                    <Clock className="text-muted-foreground h-4 w-4" />
                    <div>
                      <p className="text-sm font-medium">Started</p>
                      <p className="text-muted-foreground text-sm">
                        {formatDate(subscription.startDate)}
                      </p>
                    </div>
                  </div>
                </div>

                {isInTrial && (
                  <div className="flex items-center gap-3 rounded-lg border border-orange-200 bg-orange-50 p-3">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <div>
                      <p className="text-sm font-medium text-orange-800">
                        Trial Period
                      </p>
                      <p className="text-sm text-orange-600">
                        {trialDaysRemaining} days remaining
                      </p>
                    </div>
                  </div>
                )}

                {daysRemaining > 0 && daysRemaining <= 7 && (
                  <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-3">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <div>
                      <p className="text-sm font-medium text-red-800">
                        Subscription Expiring
                      </p>
                      <p className="text-sm text-red-600">
                        {daysRemaining} days remaining
                      </p>
                    </div>
                  </div>
                )}

                {/* Plan Features */}
                <div className="space-y-3">
                  <h4 className="text-muted-foreground text-sm font-medium">
                    Plan Features
                  </h4>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div className="bg-card flex items-center gap-2 rounded-lg border p-3">
                      <Users className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium">Team Members</p>
                        <p className="text-muted-foreground text-xs">
                          {subscription.package.maxSeats > 0
                            ? `Up to ${subscription.package.maxSeats} seats`
                            : 'Unlimited seats'}
                        </p>
                      </div>
                    </div>

                    <div className="bg-card flex items-center gap-2 rounded-lg border p-3">
                      <Briefcase className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium">Job Postings</p>
                        <p className="text-muted-foreground text-xs">
                          {subscription.package.maxJobPostings > 0
                            ? `Up to ${subscription.package.maxJobPostings} active jobs`
                            : 'Unlimited active jobs'}
                        </p>
                      </div>
                    </div>

                    <div className="bg-card flex items-center gap-2 rounded-lg border p-3">
                      <Eye className="h-4 w-4 text-purple-600" />
                      <div>
                        <p className="text-sm font-medium">Candidate Views</p>
                        <p className="text-muted-foreground text-xs">
                          {subscription.package.unlimitedCandidateViews
                            ? 'Unlimited'
                            : `Up to ${subscription.package.maxCandidateViews} views`}
                        </p>
                      </div>
                    </div>

                    <div className="bg-card flex items-center gap-2 rounded-lg border p-3">
                      <Brain className="h-4 w-4 text-orange-600" />
                      <div>
                        <p className="text-sm font-medium">AI Assessments</p>
                        <p className="text-muted-foreground text-xs">
                          {subscription.package.maxAiAssessments > 0
                            ? `Up to ${subscription.package.maxAiAssessments} assessments`
                            : 'Unlimited assessments'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Quick Actions + Billing History */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="dark:bg-primary/10 bg-white">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <CardDescription>Manage your subscription</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-auto w-full justify-start p-3"
                    onClick={() => router.push(action.href)}
                  >
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
                  </Button>
                ))}

                {onCancelSubscription && (
                  <Button
                    variant="outline"
                    className="h-auto w-full justify-start border-red-200 p-3 text-red-700 hover:bg-red-50"
                    onClick={() => onCancelSubscription()}
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded bg-red-100 p-1">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">Cancel Subscription</div>
                        <div className="text-xs text-red-600">
                          End your current plan
                        </div>
                      </div>
                    </div>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Additional Credits - If Available */}
          {(subscription.additionalSeatsCredits > 0 ||
            subscription.additionalCandidateViewCredits > 0 ||
            subscription.additionalAiAssessmentCredits > 0) && (
            <Card className="dark:bg-primary/10 border-yellow-200 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-900">
                  <DollarSign className="h-5 w-5" />
                  Additional Credits
                </CardTitle>
                <CardDescription>Extra credits available</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {subscription.additionalSeatsCredits > 0 && (
                    <div className="flex items-center gap-3 rounded-lg bg-yellow-50 p-3">
                      <Users className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800">
                        {subscription.additionalSeatsCredits} extra seats
                      </span>
                    </div>
                  )}
                  {subscription.additionalCandidateViewCredits > 0 && (
                    <div className="flex items-center gap-3 rounded-lg bg-yellow-50 p-3">
                      <Eye className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800">
                        {subscription.additionalCandidateViewCredits} extra
                        views
                      </span>
                    </div>
                  )}
                  {subscription.additionalAiAssessmentCredits > 0 && (
                    <div className="flex items-center gap-3 rounded-lg bg-yellow-50 p-3">
                      <Brain className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800">
                        {subscription.additionalAiAssessmentCredits} extra
                        assessments
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Billing History - Full Width */}
      <BillingHistory
        subscriptionId={subscriptionId}
        customerId={customerId}
        subscription={subscription}
      />
    </div>
  );
};

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  CreditCard,
  Clock,
  Receipt,
  Download,
  Settings,
  Users,
  FileText,
  CheckCircle,
  AlertCircle,
  Mail,
  Phone,
} from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  clientSubscriptionService,
  clientAnalyticsService,
} from '@/lib/services/services';
import { format, subMonths } from 'date-fns';
import { useState, useEffect } from 'react';
import { SubscriptionWarningPopup } from './subscription-warning-popup';
import TrialPackBatch from './trial-pack-batch';

export const AccountsDashboard = () => {
  const [showWarning, setShowWarning] = useState(false);

  const subscriptionOverviewData = JSON.parse(
    localStorage.getItem('subscriptionData') || '{}'
  );

  // Function to clear subscription data from localStorage
  const clearSubscriptionData = () => {
    localStorage.removeItem('subscriptionData');
    setShowWarning(false);
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
  const { data: subscription, isLoading: subscriptionLoading } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => clientSubscriptionService.getSubscription(),
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    retry: 1,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
  });

  const { data: _analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['accountsAnalytics'],
    queryFn: () => clientAnalyticsService.getDashboardAnalytics(),
    staleTime: 3 * 60 * 1000, // 3 minutes cache
    retry: 1,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
  });

  // Normalize function ensures Infinity or a valid number
  const normalizeLimit = (limit?: number | null): number =>
    limit === undefined || limit === null ? Infinity : limit;

  // Display function for Infinity symbol
  const displayLimit = (limit: number) =>
    limit === Infinity ? '∞' : limit.toString();

  // Helper to calculate usage percentage and display values
  const calculateUsage = (used: number, limit?: number | null) => {
    const normalized = normalizeLimit(limit);
    const percentage =
      normalized === Infinity
        ? 0
        : Math.min(100, Math.round((used / normalized) * 100)); // avoid >100%
    return {
      used,
      limit: normalized,
      displayLimit: displayLimit(normalized),
      percentage,
    };
  };

  // Calculate usage for all subscription resources
  const jobPostingUsage = calculateUsage(
    subscription?.usedJobPostings || 0,
    subscription?.package?.maxJobPostings
  );

  const seatUsage = calculateUsage(
    subscription?.usedSeats || 0,
    subscription?.package?.maxSeats
  );

  const aiUsage = calculateUsage(
    subscription?.usedAiAssessments || 0,
    subscription?.package?.maxAiAssessments
  );

  const viewUsage = calculateUsage(
    subscription?.usedCandidateViews || 0,
    subscription?.package?.maxCandidateViews
  );

  // Example usage: jobPostingUsage.percentage, jobPostingUsage.displayLimit, etc.

  // Process real data
  const financialStats = [
    {
      title: 'Monthly Spend',
      value: `$${subscription?.package?.price || 0}`,
      change: `${subscription?.package?.price ? '+' : ''}$${subscription?.package?.price || 0} this month`,
      changeType: 'positive' as const,
      icon: DollarSign,
      description: 'Current subscription cost',
      color: 'bg-[#F6AE66] dark:bg-[#F6AE66]/80',
    },
    {
      title: 'Usage Credits',
      value: `${jobPostingUsage.used}/${jobPostingUsage.displayLimit}`,
      change: `${jobPostingUsage.percentage}% utilized`,
      changeType: 'neutral' as const,
      icon: FileText,
      description: 'Job posting credits used',
      color: 'bg-[#52CD75] dark:bg-[#52CD75]/80',
    },
    {
      title: 'Team Members',
      value: `${seatUsage.used}/${seatUsage.displayLimit}`,
      change: `${seatUsage.percentage}% utilized`,
      changeType: 'positive' as const,
      icon: Users,
      description: 'Active team members',
      color: 'bg-[#52B1CD] dark:bg-[#52B1CD]/80',
    },
    {
      title: 'AI Assessments',
      value: `${aiUsage.used}/${aiUsage.displayLimit}`,
      change: `${aiUsage.percentage}% utilized`,
      changeType: 'neutral' as const,
      icon: CheckCircle,
      description: 'Assessment credits used',
      color: 'bg-[#6E55CF] dark:bg-[#6E55CF]/80',
    },
  ];

  const subscriptionData = {
    currentPlan: subscription?.package?.name || 'Enterprise Pro',
    status: subscription?.status || 'Active',
    startDate: subscription?.startDate
      ? format(new Date(subscription.startDate), 'MMM dd, yyyy')
      : 'N/A',
    endDate: subscription?.endDate
      ? format(new Date(subscription.endDate), 'MMM dd, yyyy')
      : 'N/A',
    nextBillingDate: subscription?.nextBillingDate
      ? format(new Date(subscription.nextBillingDate), 'MMM dd, yyyy')
      : 'N/A',
    autoRenew: subscription?.autoRenew || false,
    monthlySpend: subscription?.package?.price || 0,
    totalSpend: (subscription?.package?.price || 0) * 12, // Annual estimate
  };

  const usageBreakdown = [
    {
      name: 'Job Postings',
      ...jobPostingUsage,
      color: 'bg-blue-500',
    },
    {
      name: 'AI Assessments',
      ...aiUsage,
      color: 'bg-purple-500',
    },
    {
      name: 'Team Members',
      ...seatUsage,
      color: 'bg-green-500',
    },
    {
      name: 'Candidate Views',
      ...viewUsage,
      color: 'bg-orange-500',
    },
  ];

  const billingHistory = [
    {
      id: '1',
      date: subscription?.lastBillingDate
        ? format(new Date(subscription.lastBillingDate), 'MMM dd, yyyy')
        : 'N/A',
      amount: subscription?.package?.price || 0,
      status: 'Paid',
      invoice: 'INV-2024-001',
      description: subscription?.package?.name || 'Subscription',
    },
    {
      id: '2',
      date: subscription?.lastBillingDate
        ? format(
            subMonths(new Date(subscription.lastBillingDate), 1),
            'MMM dd, yyyy'
          )
        : 'N/A',
      amount: subscription?.package?.price || 0,
      status: 'Paid',
      invoice: 'INV-2024-002',
      description: subscription?.package?.name || 'Subscription',
    },
    {
      id: '3',
      date: subscription?.lastBillingDate
        ? format(
            subMonths(new Date(subscription.lastBillingDate), 2),
            'MMM dd, yyyy'
          )
        : 'N/A',
      amount: subscription?.package?.price || 0,
      status: 'Paid',
      invoice: 'INV-2024-003',
      description: subscription?.package?.name || 'Subscription',
    },
  ];

  // Loading states
  if (subscriptionLoading || analyticsLoading) {
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
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {financialStats.map((stat) => (
          <Card
            key={stat.title}
            className={`relative overflow-hidden ${stat.color} h-[155px]`}
          >
            <CardContent className="overflow-hidden p-4">
              <div className="flex items-center justify-between">
                <p className="truncate text-base font-medium text-white">
                  {stat.title}
                </p>
                <stat.icon
                  className="h-10 w-10 shrink-0 text-white"
                  strokeWidth={0.8}
                />
              </div>

              <div className="mt-2 space-y-1">
                <p className="truncate text-2xl font-bold text-white opacity-80">
                  {stat.value}
                </p>
                <p className="truncate text-xs text-white">
                  {stat.description}
                </p>
              </div>

              <div className="mt-2 text-white">
                <span
                  className={`text-sm font-medium ${
                    stat.changeType === 'positive'
                      ? 'text-success'
                      : 'text-white'
                  }`}
                >
                  {stat.change}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Subscription Details + Usage Breakdown */}
        <div className="space-y-6 lg:col-span-2">
          {/* Current Subscription */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Current Subscription
              </CardTitle>
              <CardDescription>
                Plan details and billing information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Main subscription info */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Plan
                  </p>
                  <div className="flex items-center gap-5">
                    <p className="text-lg font-semibold">
                      {subscriptionData.currentPlan}
                    </p>
                    {subscription?.isTrial && <TrialPackBatch />}
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Status
                  </p>
                  <Badge
                    variant={
                      subscriptionData.status === 'Active'
                        ? 'default'
                        : 'secondary'
                    }
                    className="mt-1"
                  >
                    {subscriptionData.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Next Billing
                  </p>
                  <p className="text-lg font-semibold">
                    {subscriptionData.nextBillingDate}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Auto Renew
                  </p>
                  <Badge
                    variant={
                      subscriptionData.autoRenew ? 'default' : 'secondary'
                    }
                    className="mt-1"
                  >
                    {subscriptionData.autoRenew ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              </div>

              {/* Billing contact info */}
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="mb-3 font-medium">Billing Contact</h4>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <Mail className="text-muted-foreground h-4 w-4" />
                    <span className="text-sm">billing@company.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="text-muted-foreground h-4 w-4" />
                    <span className="text-sm">+1 (650) 695-9495</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Usage Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Usage Breakdown
              </CardTitle>
              <CardDescription>
                Current usage of subscription features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {usageBreakdown.map((item) => (
                  <div key={item.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.name}</span>
                      <span className="text-muted-foreground text-sm">
                        {item.used}/{item.displayLimit} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="bg-muted h-2 w-full rounded-full">
                      <div
                        className={`h-2 rounded-full ${item.color}`}
                        style={{ width: `${Math.min(item.percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Quick Actions */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <CardDescription>
                Common billing and account tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    href: '/app/client/subscription',
                    icon: <Settings className="h-4 w-4" />,
                    title: 'Manage Subscription',
                    description: 'Upgrade or modify plans',
                  },
                  {
                    href: '/app/client/billing',
                    icon: <CreditCard className="h-4 w-4" />,
                    title: 'Payment Methods',
                    description: 'Update payment info',
                  },
                  {
                    href: '/app/client/invoices',
                    icon: <Receipt className="h-4 w-4" />,
                    title: 'View Invoices',
                    description: 'Download billing history',
                  },
                  {
                    href: '/app/client/usage',
                    icon: <BarChart3 className="h-4 w-4" />,
                    title: 'Usage Analytics',
                    description: 'Detailed usage reports',
                  },
                  {
                    href: '/app/client/support',
                    icon: <AlertCircle className="h-4 w-4" />,
                    title: 'Billing Support',
                    description: 'Get help with billing',
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
        </div>
      </div>

      {/* Bottom Section: Billing History + Cost Analysis */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Billing History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Billing History
            </CardTitle>
            <CardDescription>Recent invoices and payments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {billingHistory.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">{invoice.description}</p>
                      <p className="text-muted-foreground text-sm">
                        {invoice.date} • {invoice.invoice}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${invoice.amount}</p>
                    <Badge variant="default" className="text-xs">
                      {invoice.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/app/client/invoices">
                  <Download className="mr-2 h-4 w-4" />
                  View All Invoices
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Cost Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Cost Analysis
            </CardTitle>
            <CardDescription>
              Spending trends and projections for your subscription
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Monthly vs Annual */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border p-4 text-center">
                  <p className="text-muted-foreground text-sm">Monthly</p>
                  <p className="text-2xl font-bold">
                    ${subscriptionData.monthlySpend}
                  </p>
                  <p className="text-muted-foreground text-xs">Current plan</p>
                </div>
                <div className="rounded-lg border p-4 text-center">
                  <p className="text-muted-foreground text-sm">Annual</p>
                  <p className="text-2xl font-bold">
                    ${subscriptionData.totalSpend}
                  </p>
                  <p className="text-muted-foreground text-xs">Projected</p>
                </div>
              </div>

              {/* Usage efficiency */}
              <div className="space-y-3">
                <h4 className="font-medium">Usage Efficiency</h4>
                {usageBreakdown.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {item.percentage}%
                      </span>
                      {item.percentage > 80 ? (
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                      ) : item.percentage > 50 ? (
                        <Clock className="h-4 w-4 text-blue-500" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Recommendations */}
              <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950/20">
                <h4 className="mb-2 font-medium text-blue-900 dark:text-blue-100">
                  Recommendations
                </h4>
                <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                  <li>• Consider upgrading for more AI assessments</li>
                  <li>• Add team members to maximize seat usage</li>
                  <li>• Review job posting performance monthly</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Warning Popup */}
      <SubscriptionWarningPopup
        subscriptionData={subscriptionOverviewData}
        isOpen={showWarning}
        onClose={clearSubscriptionData}
      />
    </div>
  );
};

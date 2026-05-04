import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  Calendar,
  CheckCircle,
  DollarSign,
  Users,
  Eye,
  Brain,
} from 'lucide-react';
import { ISupportClient } from '@/lib/shared';
import { parseAdditionalFeatures } from '@/lib/utils/subscription-feature-parser';

interface SubscriptionTabProps {
  client: ISupportClient;
}

export function SubscriptionTab({ client }: SubscriptionTabProps) {
  const formatDate = (date: string | Date): string => {
    if (!date) return 'N/A';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string): string => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'TRIAL':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const totalSeats =
    (client.subscription?.package?.maxSeats || 0) +
    (client.subscription?.additionalSeatsCredits || 0);
  const totalJobPostings =
    (client.subscription?.package?.maxJobPostings || 0) +
    (client.subscription?.additionalCandidateViewCredits || 0);
  const totalAiAssessments =
    (client.subscription?.package?.maxAiAssessments || 0) +
    (client.subscription?.additionalAiAssessmentCredits || 0);

  // Key metrics cards similar to other components
  const subscriptionStats = [
    {
      title: 'Current Plan',
      value: client.subscription?.package?.name || 'No Package',
      change: client.subscription?.package?.price
        ? `${formatCurrency(client.subscription.package.price)}/${client.subscription?.package?.billingCycle?.toLowerCase() || 'N/A'}`
        : 'N/A',
      icon: Package,
      color: 'bg-[#6E55CF] dark:bg-[#6E55CF]/80',
    },
    {
      title: 'Team Members',
      value: `${client.subscription?.usedSeats || 0}/${totalSeats}`,
      change: 'Used Seats',
      icon: Users,
      color: 'bg-[#52CD75] dark:bg-[#52CD75]/80',
    },
    {
      title: 'Job Postings',
      value: `${client.subscription?.usedJobPostings || 0}/${totalJobPostings}`,
      change: 'Used Postings',
      icon: Package,
      color: 'bg-[#F6AE66] dark:bg-[#F6AE66]/80',
    },
    {
      title: 'AI Assessments',
      value: `${client.subscription?.usedAiAssessments || 0}/${totalAiAssessments} `,
      change: 'Used Tests',
      icon: Brain,
      color: 'bg-[#52B1CD] dark:bg-[#52B1CD]/80',
    },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Key Metrics Grid - Matching Dashboard Style */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {subscriptionStats.map((stat) => (
          <Card key={stat.title} className="relative h-[140px] overflow-hidden">
            <CardContent className="flex h-full flex-col justify-between overflow-hidden p-4">
              <div className="flex items-center justify-between">
                <p className="truncate text-base font-medium text-black">
                  {stat.title}
                </p>
                <stat.icon
                  className="text-primary h-10 w-10 shrink-0"
                  strokeWidth={0.8}
                />
              </div>

              <div className="space-y-1">
                <p className="text-primary truncate text-2xl font-bold opacity-80">
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
        {/* Left Column: Subscription Details */}
        <div className="space-y-6 lg:col-span-2">
          {/* Current Subscription */}
          <Card className="dark:bg-primary/10 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="text-primary h-5 w-5" />
                Current Subscription
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-card flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 rounded-full p-2">
                      <Package className="text-primary h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {client.subscription?.package?.name ||
                          client.subscription?.package?.name ||
                          'No Package'}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {client.subscription?.package?.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      className={getStatusColor(
                        client.subscription?.status || ''
                      )}
                    >
                      {client.subscription?.status || 'NO SUBSCRIPTION'}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="bg-card flex items-center gap-3 rounded-lg border p-3">
                    <DollarSign className="text-muted-foreground h-4 w-4" />
                    <div>
                      <p className="text-sm font-medium">Price</p>
                      <p className="text-muted-foreground text-sm">
                        {client.subscription?.package?.price
                          ? formatCurrency(client.subscription.package.price)
                          : 'N/A'}{' '}
                        /{' '}
                        {client.subscription?.package?.billingCycle?.toLowerCase() ||
                          'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="bg-card flex items-center gap-3 rounded-lg border p-3">
                    <Calendar className="text-muted-foreground h-4 w-4" />
                    <div>
                      <p className="text-sm font-medium">Start Date</p>
                      <p className="text-muted-foreground text-sm">
                        {formatDate(client.subscription?.startDate || '')}
                      </p>
                    </div>
                  </div>

                  <div className="bg-card flex items-center gap-3 rounded-lg border p-3">
                    <Calendar className="text-muted-foreground h-4 w-4" />
                    <div>
                      <p className="text-sm font-medium">End Date</p>
                      <p className="text-muted-foreground text-sm">
                        {formatDate(client.subscription?.endDate || '')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-card flex items-center gap-3 rounded-lg border p-3">
                  <Calendar className="text-muted-foreground h-4 w-4" />
                  <div>
                    <p className="text-sm font-medium">Next Billing Date</p>
                    <p className="text-muted-foreground text-sm">
                      {formatDate(client.subscription?.nextBillingDate || '')}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Package Features */}
          <Card className="dark:bg-primary/10 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="text-primary h-5 w-5" />
                Package Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const features = parseAdditionalFeatures(
                  client?.subscription?.package?.additionalFeatures
                );
                return features.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                      >
                        <div className="bg-primary/10 rounded-full p-2">
                          <CheckCircle className="text-primary h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {feature}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <Package className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                    <p className="text-gray-500 dark:text-gray-400">
                      No package features available
                    </p>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Usage Statistics & Additional Credits */}
        <div className="space-y-6">
          <Card className="dark:bg-primary/10 bg-card border-yellow-100">
            <CardHeader>
              <CardTitle className="text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Additional Credits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-lg bg-yellow-50 p-3 dark:bg-yellow-900/20">
                  <Users className="text-muted-foreground h-4 w-4" />
                  <span className="text-muted-foreground text-sm font-medium">
                    {client.subscription?.additionalSeatsCredits || 0} extra
                    seats
                  </span>
                </div>

                <div className="flex items-center gap-3 rounded-lg bg-yellow-50 p-3 dark:bg-yellow-900/20">
                  <Eye className="text-muted-foreground h-4 w-4" />
                  <span className="text-muted-foreground text-sm font-medium">
                    {client.subscription?.additionalCandidateViewCredits || 0}{' '}
                    extra views
                  </span>
                </div>

                <div className="flex items-center gap-3 rounded-lg bg-yellow-50 p-3 dark:bg-yellow-900/20">
                  <Brain className="text-muted-foreground h-4 w-4" />
                  <span className="text-muted-foreground text-sm font-medium">
                    {client.subscription?.additionalAiAssessmentCredits || 0}{' '}
                    extra assessments
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Subscription Status Alert */}
      {client.subscription?.status !== 'ACTIVE' && (
        <Card className="border-0 bg-yellow-50/50 shadow-lg backdrop-blur-sm dark:bg-yellow-950/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <div>
                <p className="font-medium text-yellow-800 dark:text-yellow-300">
                  Subscription Attention Required
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  The subscription is currently not active. Please check the
                  subscription status and take necessary action.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

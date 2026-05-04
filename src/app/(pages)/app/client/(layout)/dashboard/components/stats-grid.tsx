'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  Calendar,
  CheckCircle,
  DollarSign,
  BarChart3,
  Target,
  Minus,
  User,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import {
  clientAnalyticsService,
  clientSubscriptionService,
} from '@/lib/services/services';

export const StatsGrid = () => {
  // Fetch real data from APIs
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['statsAnalytics'],
    queryFn: () => clientAnalyticsService.getDashboardAnalytics(),
    staleTime: 3 * 60 * 1000, // 3 minutes cache
    retry: 1,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
  });

  const { data: subscription, isLoading: subscriptionLoading } = useQuery({
    queryKey: ['statsSubscription'],
    queryFn: () => clientSubscriptionService.getSubscription(),
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    retry: 1,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
  });

  // Process real data for stats
  const stats = [
    {
      title: 'Active Job Postings',
      value: analytics?.activeJobPostings?.activeCount || 0,
      change: '+3 this week',
      changeType: 'positive' as const,
      icon: FileText,
      description: `${analytics?.activeJobPostings?.totalCount || 0} total postings`,
      color: 'bg-blue-500',
      trend: 12.5,
    },
    {
      title: 'Candidates in Pipeline',
      value: analytics?.activeCandidates?.activeCount || 0,
      change: '+15 this week',
      changeType: 'positive' as const,
      icon: Users,
      description: `${analytics?.activeCandidates?.totalCount || 0} total candidates`,
      color: 'bg-green-500',
      trend: 8.2,
    },
    {
      title: 'AI Assessments Completed',
      value: analytics?.aiAssessments?.completedCount || 0,
      change: '+8 this week',
      changeType: 'positive' as const,
      icon: CheckCircle,
      description: `${analytics?.aiAssessments?.totalCount || 0} total assessments`,
      color: 'bg-purple-500',
      trend: 15.7,
    },
    {
      title: 'Pending Panel Assessments',
      value: analytics?.panelAssessment?.pendingCount || 0,
      change: '5 scheduled today',
      changeType: 'neutral' as const,
      icon: Calendar,
      description: `${analytics?.panelAssessment?.totalCount || 0} total panel assessments`,
      color: 'bg-orange-500',
      trend: -2.1,
    },
    {
      title: 'Team Members',
      value: analytics?.teamMembers?.activeCount || 0,
      change: '3 active users',
      changeType: 'neutral' as const,
      icon: User,
      description: `${analytics?.teamMembers?.totalCount || 0} total members`,
      color: 'bg-indigo-500',
      trend: 0,
    },
    {
      title: 'Monthly Spend',
      value: `$${subscription?.package?.price || 0}`,
      change: 'Current plan',
      changeType: 'neutral' as const,
      icon: DollarSign,
      description: subscription?.package?.name || 'Enterprise Pro',
      color: 'bg-emerald-500',
      trend: 0,
    },
    {
      title: 'Onboarding Progress',
      value: analytics?.candidateOnboarding?.completedCount || 0,
      change: `${Math.round(
        ((analytics?.candidateOnboarding?.completedCount || 0) /
          (analytics?.candidateOnboarding?.totalCount || 1)) *
          100
      )}% completion rate`,
      changeType: 'positive' as const,
      icon: Target,
      description: `${analytics?.candidateOnboarding?.totalCount || 0} total candidates`,
      color: 'bg-pink-500',
      trend: 22.3,
    },
    {
      title: 'Usage Efficiency',
      value: `${Math.round(
        ((subscription?.usedJobPostings || 0) /
          (subscription?.package?.maxJobPostings || 1)) *
          100
      )}%`,
      change: 'Job posting credits',
      changeType: 'neutral' as const,
      icon: BarChart3,
      description: `${subscription?.usedJobPostings || 0}/${subscription?.package?.maxJobPostings || 0} used`,
      color: 'bg-cyan-500',
      trend: 5.8,
    },
  ];

  // Loading state
  if (analyticsLoading || subscriptionLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="bg-muted mb-2 h-4 rounded"></div>
              <div className="bg-muted mb-2 h-8 rounded"></div>
              <div className="bg-muted h-3 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card
          key={stat.title}
          className="relative overflow-hidden transition-shadow hover:shadow-lg"
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-muted-foreground text-sm font-medium">
                  {stat.title}
                </p>
                <p className="mt-1 text-2xl font-bold">{stat.value}</p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {stat.description}
                </p>
              </div>
              <div
                className={`rounded-full p-3 ${stat.color} flex-shrink-0 text-white`}
              >
                <stat.icon className="h-6 w-6" />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {stat.trend > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : stat.trend < 0 ? (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                ) : (
                  <Minus className="h-4 w-4 text-gray-600" />
                )}
                <span
                  className={`text-sm font-medium ${
                    stat.trend > 0
                      ? 'text-green-600'
                      : stat.trend < 0
                        ? 'text-red-600'
                        : 'text-gray-600'
                  }`}
                >
                  {stat.change}
                </span>
              </div>

              {stat.trend !== 0 && (
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    stat.trend > 0
                      ? 'border-green-200 bg-green-50 text-green-700'
                      : stat.trend < 0
                        ? 'border-red-200 bg-red-50 text-red-700'
                        : 'border-gray-200 bg-gray-50 text-gray-700'
                  }`}
                >
                  {stat.trend > 0 ? '+' : ''}
                  {stat.trend.toFixed(1)}%
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

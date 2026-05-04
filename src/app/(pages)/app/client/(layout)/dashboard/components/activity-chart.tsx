'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  TrendingUp,
  Activity,
  Users,
  Eye,
  Download,
  ArrowUp,
  ArrowDown,
  Minus,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import {
  clientAnalyticsService,
  activityLogService,
} from '@/lib/services/services';
import { ActivityModuleEnum } from '@/lib/shared';
import { format, subDays } from 'date-fns';
import { useState } from 'react';

export const ActivityChart = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  // Fetch real data from APIs
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['activityAnalytics', timeRange],
    queryFn: () => clientAnalyticsService.getDashboardAnalytics(),
  });

  const { data: activityLogs, isLoading: activityLogsLoading } = useQuery({
    queryKey: ['activityLogs', timeRange],
    queryFn: () =>
      activityLogService.getActivityLogs({
        module: ActivityModuleEnum.JOB,
        limit: 50,
        fromDate: getDateFromRange(timeRange),
        toDate: new Date(),
      }),
  });

  // Helper function to get date range
  function getDateFromRange(range: '7d' | '30d' | '90d'): Date {
    switch (range) {
      case '7d':
        return subDays(new Date(), 7);
      case '30d':
        return subDays(new Date(), 30);
      case '90d':
        return subDays(new Date(), 90);
      default:
        return subDays(new Date(), 30);
    }
  }

  // Process activity data for chart
  const processActivityData = () => {
    if (!activityLogs?.data) return [];

    const activityCounts: { [key: string]: number } = {};
    const labels: string[] = [];

    // Generate date labels for the selected range
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateKey = format(date, 'MMM dd');
      labels.push(dateKey);
      activityCounts[dateKey] = 0;
    }

    // Count activities by date
    activityLogs.data.forEach((activity: any) => {
      const activityDate = new Date(activity.timestamp || activity.createdAt);
      const dateKey = format(activityDate, 'MMM dd');
      if (activityCounts[dateKey] !== undefined) {
        activityCounts[dateKey]++;
      }
    });

    return labels.map((label) => ({
      date: label,
      activities: activityCounts[label] || 0,
    }));
  };

  const chartData = processActivityData();

  // Calculate summary statistics
  const totalActivities = activityLogs?.data?.length || 0;
  const averageActivities =
    totalActivities / (timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90);
  const maxActivities = Math.max(...chartData.map((d) => d.activities));
  const _minActivities = Math.min(...chartData.map((d) => d.activities));

  // Calculate trends
  const recentData = chartData.slice(-7);
  const previousData = chartData.slice(-14, -7);
  const recentAvg =
    recentData.reduce((sum, d) => sum + d.activities, 0) / recentData.length;
  const previousAvg =
    previousData.reduce((sum, d) => sum + d.activities, 0) /
    previousData.length;
  const trendPercentage =
    previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : 0;

  // Activity highlights
  const activityHighlights = [
    {
      title: 'Total Activities',
      value: totalActivities,
      change: `${trendPercentage > 0 ? '+' : ''}${trendPercentage.toFixed(1)}%`,
      changeType:
        trendPercentage > 0
          ? 'positive'
          : trendPercentage < 0
            ? 'negative'
            : 'neutral',
      icon: Activity,
      color: 'bg-blue-500',
    },
    {
      title: 'Daily Average',
      value: averageActivities.toFixed(1),
      change: 'vs last period',
      changeType: 'neutral' as const,
      icon: BarChart3,
      color: 'bg-green-500',
    },
    {
      title: 'Peak Day',
      value: maxActivities,
      change: 'highest activity',
      changeType: 'positive' as const,
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
    {
      title: 'Active Users',
      value: analytics?.teamMembers?.activeCount || 0,
      change: 'team members',
      changeType: 'neutral' as const,
      icon: Users,
      color: 'bg-orange-500',
    },
  ];

  // Recent activities for the timeline
  const recentActivities = activityLogs?.data?.slice(0, 5) || [];

  // Loading state
  if (analyticsLoading || activityLogsLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="bg-muted h-6 w-1/3 rounded"></div>
          <div className="bg-muted h-4 w-1/2 rounded"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-muted h-64 rounded"></div>
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-muted h-20 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Activity Overview
            </CardTitle>
            <CardDescription>
              Track team activity and engagement over time
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border">
              {(['7d', '30d', '90d'] as const).map((range) => (
                <Button
                  key={range}
                  variant={timeRange === range ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setTimeRange(range)}
                  className="rounded-none first:rounded-l-lg last:rounded-r-lg"
                >
                  {range}
                </Button>
              ))}
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Activity Chart */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Activity Trends</h3>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">
                Activity Count
              </span>
              <Badge variant="outline">
                {timeRange === '7d'
                  ? 'Last 7 days'
                  : timeRange === '30d'
                    ? 'Last 30 days'
                    : 'Last 90 days'}
              </Badge>
            </div>
          </div>

          {/* Chart Visualization */}
          <div className="bg-muted/20 h-64 rounded-lg p-4">
            <div className="flex h-full items-end justify-between gap-1">
              {chartData.map((data, index) => (
                <div key={index} className="flex flex-1 flex-col items-center">
                  <div className="bg-primary/20 group relative w-full rounded-t-sm">
                    <div
                      className="bg-primary hover:bg-primary/80 rounded-t-sm transition-all duration-300"
                      style={{
                        height: `${Math.max((data.activities / maxActivities) * 100, 2)}%`,
                        minHeight: '2px',
                      }}
                    ></div>
                    <div className="bg-background absolute -top-8 left-1/2 -translate-x-1/2 transform rounded border px-2 py-1 text-xs opacity-0 transition-opacity group-hover:opacity-100">
                      {data.activities} activities
                    </div>
                  </div>
                  <span className="text-muted-foreground mt-2 origin-left rotate-45 text-xs">
                    {data.date}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {activityHighlights.map((stat) => (
            <div
              key={stat.title}
              className="bg-card rounded-lg border p-4 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`rounded-full p-3 ${stat.color} text-white`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-2">
                <span
                  className={`text-sm font-medium ${
                    stat.changeType === 'positive'
                      ? 'text-green-600'
                      : stat.changeType === 'negative'
                        ? 'text-red-600'
                        : 'text-blue-600'
                  }`}
                >
                  {stat.change}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activities Timeline */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recent Activities</h3>
            <Button variant="outline" size="sm" asChild>
              <a href="/app/client/activity">
                <Eye className="mr-2 h-4 w-4" />
                View All
              </a>
            </Button>
          </div>

          <div className="space-y-3">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity: any, index: number) => (
                <div
                  key={activity.id || index}
                  className="bg-card flex items-start gap-3 rounded-lg border p-3 transition-shadow hover:shadow-sm"
                >
                  <div className="bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full"></div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {activity.description}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {activity.module}
                      </Badge>
                      <span className="text-muted-foreground text-xs">
                        {format(
                          new Date(activity.timestamp || activity.createdAt),
                          'MMM dd, HH:mm'
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-muted-foreground py-8 text-center">
                <Activity className="mx-auto mb-4 h-12 w-12 opacity-50" />
                <p>No recent activities found</p>
                <p className="text-sm">
                  Activities will appear here as they occur
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Activity Insights */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="mb-3 font-medium">Activity Insights</h4>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Most Active Module</span>
              <Badge variant="secondary">Job Postings</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Peak Activity Time</span>
              <span className="text-sm font-medium">10:00 AM - 2:00 PM</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Weekly Trend</span>
              <div className="flex items-center gap-1">
                {trendPercentage > 0 ? (
                  <ArrowUp className="h-4 w-4 text-green-600" />
                ) : trendPercentage < 0 ? (
                  <ArrowDown className="h-4 w-4 text-red-600" />
                ) : (
                  <Minus className="h-4 w-4 text-gray-600" />
                )}
                <span
                  className={`text-sm font-medium ${
                    trendPercentage > 0
                      ? 'text-green-600'
                      : trendPercentage < 0
                        ? 'text-red-600'
                        : 'text-gray-600'
                  }`}
                >
                  {Math.abs(trendPercentage).toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Activity Score</span>
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium">
                  {Math.round(
                    (totalActivities /
                      (timeRange === '7d'
                        ? 70
                        : timeRange === '30d'
                          ? 300
                          : 900)) *
                      100
                  )}
                </span>
                <span className="text-muted-foreground text-xs">/100</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

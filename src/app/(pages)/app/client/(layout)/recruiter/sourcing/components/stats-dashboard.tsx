'use client';

import {
  ApplicationsIcon,
  SucessrateIcon,
  TotalJobsIcon,
} from '@/components/icons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp } from 'lucide-react';

interface StatsData {
  totalJobs: number;
  activeJobs: number;
  draftJobs: number;
  closedJobs: number;
  totalApplications: number;
  pendingApplications: number;
  successRate: number;
  avgApplicationsPerJob: number;
}

interface StatsDashboardProps {
  stats: StatsData;
  isLoading?: boolean;
}

export function StatsDashboard({ stats, isLoading }: StatsDashboardProps) {
  const statCards = [
    {
      title: 'Total Jobs',
      value: stats.totalJobs,
      description: `${stats.activeJobs} active, ${stats.draftJobs} draft`,
      icon: TotalJobsIcon,
      trend: {
        value: '+12%',
        isPositive: true,
        period: 'vs last month',
      },
      color: 'blue',
    },
    {
      title: 'Applications',
      value: stats.totalApplications,
      description: `${stats.pendingApplications} pending review`,
      icon: ApplicationsIcon,
      trend: {
        value: '+8%',
        isPositive: true,
        period: 'vs last month',
      },
      color: 'green',
    },
    {
      title: 'Success Rate',
      value: `${stats.successRate}%`,
      description: 'Application to hire ratio',
      icon: SucessrateIcon,
      trend: {
        value: '+2.3%',
        isPositive: true,
        period: 'vs last month',
      },
      color: 'purple',
    },
    {
      title: 'Avg per Job',
      value: stats.avgApplicationsPerJob.toFixed(1),
      description: 'Applications per posting',
      icon: TrendingUp,
      trend: {
        value: '-1.2%',
        isPositive: false,
        period: 'vs last month',
      },
      color: 'orange',
    },
  ];

  const colorClasses = {
    blue: {
      bg: 'bg-[#F6AE66] dark:bg-blue-900/30 border-1 border-white',
      icon: 'text-white dark:text-blue-400',
      accent: 'bg-[#F6AE66]',
      // hover: 'group-hover:text-blue-600 dark:group-hover:text-blue-400',
    },
    green: {
      bg: 'bg-[#52CD75] dark:bg-green-900/30 border-1 border-white',
      icon: 'text-white dark:text-green-400',
      accent: 'bg-[#52CD75]',
      // hover: 'group-hover:text-green-600 dark:group-hover:text-green-400',
    },
    purple: {
      bg: 'bg-[#52B1CD] dark:bg-purple-900/30 border-1 border-white',
      icon: 'text-white dark:text-purple-400',
      accent: 'bg-[#52B1CD]',
      // hover: 'group-hover:text-purple-600 dark:group-hover:text-purple-400',
    },
    orange: {
      bg: 'bg-[#6E55CF] dark:bg-orange-900/30 border-1 border-white',
      icon: 'text-white dark:text-orange-400',
      accent: 'bg-[#6E55CF]',
      // hover: 'group-hover:text-orange-600 dark:group-hover:text-orange-400',
    },
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card
            key={i}
            className="border-0 bg-white/90 shadow-md backdrop-blur-sm dark:bg-gray-900/90"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((card, index) => {
        const colors = colorClasses[card.color as keyof typeof colorClasses];
        const IconComponent = card.icon;

        return (
          <Card
            key={index}
            className={`group relative h-[140px] overflow-hidden rounded-xl border-0 shadow-md backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:bg-gray-900/95 ${colors.accent} border-l-4`}
          >
            {/* <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-50/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:to-gray-800/30" /> */}

            <CardContent className="flex h-full flex-col justify-between overflow-hidden p-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-normal text-white transition-colors group-hover:text-gray-100 dark:text-white dark:group-hover:text-gray-100">
                  {card.title}
                </CardTitle>
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-full p-2.5 ${colors.bg} transition-transform duration-300 group-hover:scale-110`}
                >
                  <IconComponent className={`h-5 w-5 ${colors.icon}`} />
                </div>
              </div>

              <div
                className={
                  'text-[28px] font-bold text-white transition-colors dark:text-white'
                }
              >
                {card.value}
              </div>

              <p className="text-sm leading-relaxed text-white dark:text-white">
                {card.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

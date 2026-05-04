'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Mail, UserCheck, BarChart3 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supportKpisService } from '@/lib/services/services';

interface KpisOverviewProps {
  filters: {
    startDate: string;
    endDate: string;
    filterBy: string;
  };
}

export const KpisOverview = ({ filters }: KpisOverviewProps) => {
  const {
    data: kpisData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['candidateKpis', filters],
    queryFn: () =>
      supportKpisService.getCandidateKpis({
        startDate: filters.startDate,
        endDate: filters.endDate,
        filterBy: filters.filterBy,
      }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="mb-4 h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700"></div>
              <div className="mb-2 h-8 w-1/3 rounded bg-gray-200 dark:bg-gray-700"></div>
              <div className="h-3 w-2/3 rounded bg-gray-200 dark:bg-gray-700"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 dark:border-red-800">
        <CardContent className="p-6 text-center">
          <p className="text-red-600 dark:text-red-400">
            Failed to load overview data. Please try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  const data =
    kpisData ||
    ({
      total: 0,
      invites: {
        total: 0,
        supportInvitations: {
          total: 0,
          pending: 0,
          accepted: 0,
          expired: 0,
          withdrawn: 0,
        },
        partnerInvitations: {
          total: 0,
          pending: 0,
          accepted: 0,
          expired: 0,
          withdrawn: 0,
        },
        jobInvitations: {
          total: 0,
          pending: 0,
          accepted: 0,
          declined: 0,
          expired: 0,
          cancelled: 0,
          withdrawn: 0,
        },
        jobAiAssessmentInvitations: {
          total: 0,
          pending: 0,
          accepted: 0,
          declined: 0,
          expired: 0,
          cancelled: 0,
        },
      },
      signups: { total: 0, organic: 0, fromInvitations: 0 },
      profileCompletion: {
        total: 0,
        completed: 0,
        inProgress: 0,
        notStarted: 0,
        averageCompletion: 0,
        byPercentage: {},
      },
      candidateStatus: {
        total: 0,
        new: 0,
        onboarded: 0,
        rejected: 0,
        hired: 0,
      },
      jobSearchStatus: { total: 0, openToOpportunities: 0, notLooking: 0 },
      assessmentStage: {
        total: 0,
        resumeAssessment: 0,
        onboardingAssessment: 0,
      },
      resumeAssessment: {
        total: 0,
        byStatus: {},
        byResult: {},
        byRecommendation: {},
      },
      onboardingAssessment: {
        total: 0,
        byStatus: {},
        byResult: {},
        byRecommendation: {},
      },
      jobAiAssessment: {
        total: 0,
        byStatus: {},
        byResult: {},
        byRecommendation: {},
      },
      recommendations: {
        total: 0,
        highlyRecommended: 0,
        recommended: 0,
        notRecommended: 0,
      },
      engagement: {
        total: 0,
        shortlisted: 0,
        shortlistedByStatus: {},
        savedJobs: 0,
        views: 0,
        applications: 0,
        recommendationsReceived: 0,
        recommendationsViewed: 0,
        recommendationsSaved: 0,
        recommendationsApplied: 0,
        practiceAssessments: 0,
      },
      subscription: {
        total: 0,
        active: 0,
        inactive: 0,
        cancelled: 0,
        expired: 0,
        withSubscription: 0,
        withoutSubscription: 0,
        averageAssessmentsUsed: 0,
        averagePracticeAssessmentsUsed: 0,
      },
      userStatus: { total: 0, active: 0, inactive: 0, blocked: 0 },
    } as any);

  const overviewStats = [
    {
      title: 'Total Candidates',
      value: data.total || 0,
      icon: Users,
      color: 'bg-blue-600',
      description: 'All registered candidates',
    },
    {
      title: 'Total Invitations',
      value: data.invites?.total || 0,
      icon: Mail,
      color: 'bg-green-600',
      description: 'Invitations sent',
    },
    {
      title: 'Profile Completion',
      value: data.profileCompletion?.completed || 0,
      icon: UserCheck,
      color: 'bg-purple-600',
      description: `${data.profileCompletion?.total || 0} total profiles`,
    },
    {
      title: 'Recommendations',
      value: data.recommendations?.total || 0,
      icon: BarChart3,
      color: 'bg-indigo-600',
      description: 'AI recommendations',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Key Metrics
          </h2>
          <p className="mt-1 text-gray-600 dark:text-gray-300">
            Essential performance indicators
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {filters.filterBy === 'all'
            ? 'All Filters'
            : filters.filterBy.replace('_', ' ')}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {overviewStats.map((stat, index) => (
          <Card
            key={index}
            className="border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
          >
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className={`${stat.color} rounded-lg p-2`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {stat.title}
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {stat.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

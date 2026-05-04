'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Mail,
  UserCheck,
  AlertCircle,
  Target,
  BarChart3,
  FileText,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supportKpisService } from '@/lib/services/services';

interface KpisDetailedStatsProps {
  filters: {
    startDate: string;
    endDate: string;
    filterBy: string;
  };
}

export const KpisDetailedStats = ({ filters }: KpisDetailedStatsProps) => {
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
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 w-1/3 rounded bg-gray-200 dark:bg-gray-700"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="flex justify-between">
                    <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700"></div>
                    <div className="h-4 w-1/4 rounded bg-gray-200 dark:bg-gray-700"></div>
                  </div>
                ))}
              </div>
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
          <AlertCircle className="mx-auto mb-2 h-8 w-8 text-red-500" />
          <p className="text-red-600 dark:text-red-400">
            Failed to load detailed statistics. Please try again.
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

  const detailedStats = [
    {
      title: 'Support Invitations',
      icon: Mail,
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
      stats: [
        {
          label: 'Total Sent',
          value: data.invites?.supportInvitations?.total || 0,
          subtext: 'Total support invitations sent',
        },
        {
          label: 'Accepted',
          value: data.invites?.supportInvitations?.accepted || 0,
          subtext: 'Successfully accepted invitations',
        },
        {
          label: 'Pending',
          value: data.invites?.supportInvitations?.pending || 0,
          subtext: 'Awaiting candidate response',
        },
        {
          label: 'Expired',
          value: data.invites?.supportInvitations?.expired || 0,
          subtext: 'Invitations that have expired',
        },
      ],
    },
    {
      title: 'Partner Invitations',
      icon: UserCheck,
      color: 'text-green-600 bg-green-50 dark:bg-green-900/20',
      stats: [
        {
          label: 'Total Sent',
          value: data.invites?.partnerInvitations?.total || 0,
          subtext: 'Total partner invitations sent',
        },
        {
          label: 'Accepted',
          value: data.invites?.partnerInvitations?.accepted || 0,
          subtext: 'Successfully accepted invitations',
        },
        {
          label: 'Pending',
          value: data.invites?.partnerInvitations?.pending || 0,
          subtext: 'Awaiting candidate response',
        },
        {
          label: 'Expired',
          value: data.invites?.partnerInvitations?.expired || 0,
          subtext: 'Invitations that have expired',
        },
      ],
    },
    {
      title: 'Job Invitations',
      icon: FileText,
      color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
      stats: [
        {
          label: 'Total Sent',
          value: data.invites?.jobInvitations?.total || 0,
          subtext: 'Total job invitations sent',
        },
        {
          label: 'Accepted',
          value: data.invites?.jobInvitations?.accepted || 0,
          subtext: 'Successfully accepted invitations',
        },
        {
          label: 'Declined',
          value: data.invites?.jobInvitations?.declined || 0,
          subtext: 'Invitations that were declined',
        },
        {
          label: 'Pending',
          value: data.invites?.jobInvitations?.pending || 0,
          subtext: 'Awaiting candidate response',
        },
      ],
    },
    {
      title: 'AI Assessment Invites',
      icon: Target,
      color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20',
      stats: [
        {
          label: 'Total Sent',
          value: data.invites?.jobAiAssessmentInvitations?.total || 0,
          subtext: 'Total AI assessment invitations sent',
        },
        {
          label: 'Accepted',
          value: data.invites?.jobAiAssessmentInvitations?.accepted || 0,
          subtext: 'Successfully accepted invitations',
        },
        {
          label: 'Declined',
          value: data.invites?.jobAiAssessmentInvitations?.declined || 0,
          subtext: 'Invitations that were declined',
        },
        {
          label: 'Pending',
          value: data.invites?.jobAiAssessmentInvitations?.pending || 0,
          subtext: 'Awaiting candidate response',
        },
      ],
    },
    {
      title: 'Signup Analysis',
      icon: Users,
      color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20',
      stats: [
        {
          label: 'Organic Signups',
          value: data.signups?.organic || 0,
          subtext: 'Direct registrations without invitations',
        },
        {
          label: 'From Invitations',
          value: data.signups?.fromInvitations || 0,
          subtext: 'Registrations through invitation links',
        },
        {
          label: 'Total Signups',
          value: data.signups?.total || 0,
          subtext: 'Combined organic and invitation-based registrations',
        },
        {
          label: 'Conversion Rate',
          value:
            (data.invites?.total || 0) > 0
              ? `${(((data.signups?.fromInvitations || 0) / (data.invites?.total || 1)) * 100).toFixed(1)}%`
              : '0%',
          subtext: 'Percentage of invitations that resulted in signups',
        },
      ],
    },
    {
      title: 'Profile Completion',
      icon: BarChart3,
      color: 'text-teal-600 bg-teal-50 dark:bg-teal-900/20',
      stats: [
        {
          label: 'Completed Profiles',
          value: data.profileCompletion?.completed || 0,
          subtext: 'Profiles with 100% completion rate',
        },
        {
          label: 'In Progress',
          value: data.profileCompletion?.inProgress || 0,
          subtext: 'Profiles partially completed (1-99%)',
        },
        {
          label: 'Not Started',
          value: data.profileCompletion?.notStarted || 0,
          subtext: 'Profiles with 0% completion rate',
        },
        {
          label: 'Completion Rate',
          value:
            (data.profileCompletion?.total || 0) > 0
              ? `${(((data.profileCompletion?.completed || 0) / (data.profileCompletion?.total || 1)) * 100).toFixed(1)}%`
              : '0%',
          subtext: 'Overall percentage of completed profiles',
        },
      ],
    },
    {
      title: 'Candidate Status',
      icon: Users,
      color: 'text-pink-600 bg-pink-50 dark:bg-pink-900/20',
      stats: [
        {
          label: 'New Candidates',
          value: data.candidateStatus?.new || 0,
          subtext: 'Recently registered candidates',
        },
        {
          label: 'Onboarded',
          value: data.candidateStatus?.onboarded || 0,
          subtext: 'Candidates who completed onboarding process',
        },
        {
          label: 'Rejected',
          value: data.candidateStatus?.rejected || 0,
          subtext: 'Candidates not selected for positions',
        },
        {
          label: 'Hired',
          value: data.candidateStatus?.hired || 0,
          subtext: 'Candidates successfully placed in positions',
        },
      ],
    },
    {
      title: 'Assessment Performance',
      icon: Target,
      color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
      stats: [
        {
          label: 'Resume Assessments - Completed',
          value: data.resumeAssessment?.byStatus?.completed || 0,
          subtext: 'Resume assessments that have been completed',
        },
        {
          label: 'Resume Assessments - Pending',
          value: data.resumeAssessment?.byStatus?.pending || 0,
          subtext: 'Resume assessments awaiting completion',
        },
        {
          label: 'Onboarding Assessments - Completed',
          value: data.onboardingAssessment?.byStatus?.completed || 0,
          subtext: 'Onboarding assessments that have been completed',
        },
        {
          label: 'Onboarding Assessments - Pending',
          value: data.onboardingAssessment?.byStatus?.pending || 0,
          subtext: 'Onboarding assessments awaiting completion',
        },
      ],
    },
  ];

  const getCategoryDescription = (title: string) => {
    switch (title) {
      case 'Invitation Breakdown':
        return 'Detailed breakdown of candidate invitations and their statuses.';
      case 'Signup Analysis':
        return 'Analysis of how candidates sign up for the platform.';
      case 'Profile Completion':
        return 'Progress of candidate profiles on the platform.';
      case 'Candidate Status':
        return 'Current status of candidates registered on the platform.';
      case 'Assessment Performance':
        return 'Performance of candidate assessments and recommendations.';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Detailed Analytics
          </h2>
          <p className="mt-1 text-base text-gray-600 dark:text-gray-300">
            Comprehensive breakdown of candidate metrics and performance
            indicators
          </p>
        </div>
        <Badge
          variant="outline"
          className="border-gray-300 px-3 py-1 text-sm dark:border-gray-600"
        >
          {new Date(filters.startDate).toLocaleDateString()} to{' '}
          {new Date(filters.endDate).toLocaleDateString()}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {detailedStats.map((category, index) => (
          <Card
            key={index}
            className="group flex flex-col border border-gray-200 bg-white transition-all duration-200 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
          >
            <CardHeader className="flex-shrink-0 border-b border-gray-100 pb-4 dark:border-gray-700">
              <CardTitle className="flex items-center gap-3">
                <div
                  className={`${category.color} flex-shrink-0 rounded-lg p-2 transition-transform duration-200 group-hover:scale-105`}
                >
                  <category.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-base font-semibold text-gray-900 dark:text-white">
                    {category.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
                    {getCategoryDescription(category.title)}
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col pt-4">
              <div className="flex-1 space-y-3">
                {category.stats.map((stat, statIndex) => (
                  <div
                    key={statIndex}
                    className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3 transition-colors duration-200 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700/50 dark:hover:bg-gray-600/50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-700 dark:text-gray-300">
                        {stat.label}
                      </p>
                      <p className="mt-1 line-clamp-1 text-xs text-gray-500 dark:text-gray-400">
                        {stat.subtext}
                      </p>
                    </div>
                    <div className="ml-3 flex-shrink-0 text-right">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {stat.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

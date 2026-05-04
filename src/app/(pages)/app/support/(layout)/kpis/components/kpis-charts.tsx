'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Users,
  Mail,
  UserCheck,
  Target,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supportKpisService } from '@/lib/services/services';

interface KpisChartsProps {
  filters: {
    startDate: string;
    endDate: string;
    filterBy: string;
  };
}

const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884D8',
  '#82CA9D',
];

export const KpisCharts = ({ filters }: KpisChartsProps) => {
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
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 w-1/3 rounded bg-gray-200 dark:bg-gray-700"></div>
            </CardHeader>
            <CardContent>
              <div className="h-64 rounded bg-gray-200 dark:bg-gray-700"></div>
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
            Failed to load chart data. Please try again.
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

  // Prepare data for invitation breakdown chart
  const invitationData = [
    { name: 'Support', value: data.invites?.supportInvitations?.total || 0 },
    { name: 'Partner', value: data.invites?.partnerInvitations?.total || 0 },
    { name: 'Job', value: data.invites?.jobInvitations?.total || 0 },
    {
      name: 'AI Assessment',
      value: data.invites?.jobAiAssessmentInvitations?.total || 0,
    },
  ].filter((item) => item.value > 0);

  // Prepare data for signup analysis chart
  const signupData = [
    { name: 'Organic', value: data.signups?.organic || 0 },
    { name: 'From Invitations', value: data.signups?.fromInvitations || 0 },
  ].filter((item) => item.value > 0);

  // Prepare data for profile completion chart
  const profileCompletionData = [
    { name: 'Completed', value: data.profileCompletion?.completed || 0 },
    { name: 'In Progress', value: data.profileCompletion?.inProgress || 0 },
    { name: 'Not Started', value: data.profileCompletion?.notStarted || 0 },
  ].filter((item) => item.value > 0);

  // Prepare data for candidate status chart
  const candidateStatusData = [
    { name: 'New', value: data.candidateStatus?.new || 0 },
    { name: 'Onboarded', value: data.candidateStatus?.onboarded || 0 },
    { name: 'Rejected', value: data.candidateStatus?.rejected || 0 },
    { name: 'Hired', value: data.candidateStatus?.hired || 0 },
  ].filter((item) => item.value > 0);

  // Prepare data for assessment performance bar chart
  const assessmentData = [
    {
      name: 'Resume',
      total: data.resumeAssessment?.total || 0,
      completed: data.resumeAssessment?.byStatus?.completed || 0,
      passed: data.resumeAssessment?.byResult?.passed || 0,
    },
    {
      name: 'Onboarding',
      total: data.onboardingAssessment?.total || 0,
      completed: data.onboardingAssessment?.byStatus?.completed || 0,
      passed: data.onboardingAssessment?.byResult?.passed || 0,
    },
  ];

  // Prepare data for engagement metrics bar chart
  const engagementData = [
    { name: 'Shortlisted', value: data.engagement?.shortlisted || 0 },
    { name: 'Saved Jobs', value: data.engagement?.savedJobs || 0 },
    { name: 'Profile Views', value: data.engagement?.views || 0 },
    { name: 'Applications', value: data.engagement?.applications || 0 },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <p className="font-medium text-gray-900 dark:text-white">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Visual Analytics
        </h2>
        <Badge variant="outline" className="text-sm">
          Interactive Charts
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Invitation Breakdown Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              Invitation Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {invitationData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={invitationData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {invitationData.map((_entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-64 items-center justify-center text-gray-500 dark:text-gray-400">
                No invitation data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Signup Analysis Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-green-600" />
              Signup Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            {signupData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={signupData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {signupData.map((_entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-64 items-center justify-center text-gray-500 dark:text-gray-400">
                No signup data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profile Completion Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              Profile Completion Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profileCompletionData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={profileCompletionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {profileCompletionData.map((_entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-64 items-center justify-center text-gray-500 dark:text-gray-400">
                No profile completion data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Candidate Status Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-orange-600" />
              Candidate Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {candidateStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={candidateStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {candidateStatusData.map((_entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-64 items-center justify-center text-gray-500 dark:text-gray-400">
                No candidate status data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assessment Performance Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
              Assessment Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={assessmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="total" fill="#8884d8" name="Total" />
                <Bar dataKey="completed" fill="#82ca9d" name="Completed" />
                <Bar dataKey="passed" fill="#ffc658" name="Passed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Engagement Metrics Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-teal-600" />
              Engagement Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

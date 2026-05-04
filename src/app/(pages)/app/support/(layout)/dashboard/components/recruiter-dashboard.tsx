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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import {
  Users,
  FileText,
  TrendingUp,
  UserCheck,
  Activity,
  Mail,
  Search,
  Briefcase,
  User,
  Building2,
} from 'lucide-react';
import Link from 'next/link';
import {
  supportCandidateManagementService,
  supportJobPostingService,
  supportJobPostingRecruiterAssignmentService,
  supportJobPostingInviteService,
  supportJobApplicationService,
  activityLogService,
  supportAccountManagerAssignmentService,
} from '@/lib/services/services';
import { useQuery } from '@tanstack/react-query';
import { ActivityModuleEnum, UserRoleEnum } from '@/lib/shared';
import { format } from 'date-fns';
import { useApp } from '@/lib/context/app-context';

export const RecruiterDashboard = () => {
  const { user } = useApp();
  const isRecruiter = user?.role === UserRoleEnum.RECRUITER;
  const recruiterId = user?.supportUserId;

  // Fetch candidates data
  const { data: candidates } = useQuery({
    queryKey: ['supportCandidates'],
    queryFn: () =>
      supportCandidateManagementService.getSupportCandidates({
        page: 1,
        limit: 100,
      }),
  });

  // Fetch job posting invites data for total candidates count
  const { data: jobPostingInvites } = useQuery({
    queryKey: ['supportJobPostingInvites'],
    queryFn: () =>
      supportJobPostingInviteService.getJobPostingInvitesBySupportUserId({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        search: '',
      }),
  });

  // Fetch support job applications data for total applications count
  const { data: supportApplications } = useQuery({
    queryKey: ['supportJobApplications'],
    queryFn: () =>
      supportJobApplicationService.getSupportJobApplications({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }),
  });

  // Fetch job postings data - different API based on user role
  const { data: jobPostings } = useQuery({
    queryKey: ['supportJobPostings', isRecruiter, recruiterId],
    queryFn: async () => {
      if (isRecruiter && recruiterId) {
        // Use recruiter assignments API for recruiters
        return supportJobPostingRecruiterAssignmentService.getJobPostingsForRecruiter(
          recruiterId,
          {
            page: 1,
            limit: 100,
          }
        );
      } else {
        // Use general job postings API for other support users
        return supportJobPostingService.getAllJobPostingsBySupportUserId();
      }
    },
    enabled: !isRecruiter || (isRecruiter && !!recruiterId),
  });

  // Fetch activity logs
  const { data: activityLogs } = useQuery({
    queryKey: ['supportActivityLogs', user?.supportUserId],
    queryFn: () =>
      activityLogService.getActivityLogs({
        entityId: user?.supportUserId,
        module: ActivityModuleEnum.SYSTEM,
      }),
    enabled: !!user?.supportUserId,
  });

  const { data: managerDetails } = useQuery({
    queryKey: ['managerDetails'],
    queryFn: () => supportAccountManagerAssignmentService.getManagerDetails(),
  });

  // Calculate statistics
  const stats = {
    totalCandidates: jobPostingInvites?.pagination?.total || 0, // Use total from job posting invites
    activeCandidates:
      candidates?.items?.filter(
        (candidate: any) => candidate.status === 'ACTIVE'
      ).length || 0,
    totalJobPostings: isRecruiter
      ? (jobPostings as any)?.items?.length || 0
      : (jobPostings as any)?.jobPostings?.length || 0,
    activeJobPostings: isRecruiter
      ? (jobPostings as any)?.items?.filter(
          (job: any) => job.status === 'PUBLISHED'
        ).length || 0
      : (jobPostings as any)?.jobPostings?.filter(
          (job: any) => job.status === 'PUBLISHED'
        ).length || 0,
    totalApplications: supportApplications?.pagination?.total || 0, // Use total from support applications
    recentActivity: (activityLogs as any)?.data?.length || 0,
  };

  // Recruiter dashboard stats - matching the design pattern
  const recruiterStats = [
    {
      title: 'Total Candidates',
      value: stats.totalCandidates,
      change: `+${stats.activeCandidates} active`,
      changeType: 'positive' as const,
      icon: Users,
      description: 'Candidates invited to job postings',
      color: 'bg-[#52CD75] dark:bg-[#52CD75]/80',
    },
    {
      title: 'Active Candidates',
      value: stats.activeCandidates,
      change: `${Math.round((stats.activeCandidates / stats.totalCandidates) * 100)}% active rate`,
      changeType: 'positive' as const,
      icon: UserCheck,
      description: 'Candidates available for opportunities',
      color: 'bg-[#52B1CD] dark:bg-[#52B1CD]/80',
    },
    {
      title: isRecruiter ? 'Assigned Job Postings' : 'Job Postings',
      value: stats.totalJobPostings,
      change: `+${stats.activeJobPostings} active`,
      changeType: 'positive' as const,
      icon: FileText,
      description: isRecruiter
        ? 'Job postings assigned to you'
        : 'All job postings',
      color: 'bg-[#F6AE66] dark:bg-[#F6AE66]/80',
    },
    {
      title: 'Total Applications',
      value: stats.totalApplications,
      change: `+${Math.floor(stats.totalApplications * 0.1)} this week`,
      changeType: 'positive' as const,
      icon: TrendingUp,
      description: 'Accepted job applications',
      color: 'bg-[#6E55CF] dark:bg-[#6E55CF]/80',
    },
  ];

  // Recent job postings data
  const recentJobPostings = isRecruiter
    ? (jobPostings as any)?.items?.slice(0, 5).map((job: any) => ({
        id: job.id,
        title: job.title,
        status: job.status,
        clientId: job.client?.id,
        applications: job.numberOfApplications || 0,
        createdAt: job.createdAt,
        company: job.company?.name || 'Unknown Company',
      })) || []
    : (jobPostings as any)?.jobPostings?.slice(0, 5).map((job: any) => ({
        id: job.id,
        title: job.title,
        status: job.status,
        clientId: job.clientId,
        applications: job.numberOfApplications || 0,
        createdAt: job.createdAt,
        company: job.company?.name || 'Unknown Company',
      })) || [];

  // Helper function to get icon based on entity type
  const getEntityIcon = (entityType: string) => {
    switch (entityType?.toLowerCase()) {
      case 'job_posting':
        return FileText;
      case 'candidate':
        return Users;
      case 'user':
        return User;
      case 'client':
        return Building2;
      default:
        return Activity;
    }
  };

  // Helper function to format entity type for display
  const formatEntityType = (entityType: string) => {
    return entityType
      ?.replace('_', ' ')
      ?.replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // Recent activity items
  const recentActivities = (activityLogs as any)?.data?.slice(0, 5) || [];
  return (
    <div className="space-y-6 pb-8">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {recruiterStats.map((stat) => (
          <Card
            key={stat.title}
            className={`relative overflow-hidden ${stat.color} h-[140px]`}
          >
            <CardContent className="flex h-full flex-col justify-between overflow-hidden p-4">
              <div className="flex items-center justify-between">
                <p className="truncate text-base font-normal text-white">
                  {stat.title}
                </p>
                <stat.icon
                  className="h-10 w-10 shrink-0 text-white"
                  strokeWidth={0.8}
                />
              </div>

              <div className="space-y-1">
                <p className="truncate text-3xl font-bold text-white opacity-80">
                  {stat.value}
                </p>
                <p className="truncate text-xs text-white">
                  {stat.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="dark:bg-primary/10 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Briefcase className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>Common tasks for recruiters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Link href="/app/support/sourcing">
              <Card className="cursor-pointer transition-shadow hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Search className="h-8 w-8 text-blue-600" />
                    <div>
                      <h3 className="font-semibold">Source Candidates</h3>
                      <p className="text-muted-foreground text-sm">
                        Find and invite candidates
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/app/support/candidates">
              <Card className="cursor-pointer transition-shadow hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Users className="h-8 w-8 text-green-600" />
                    <div>
                      <h3 className="font-semibold">Manage Candidates</h3>
                      <p className="text-muted-foreground text-sm">
                        View and manage candidate profiles
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/app/support/job-invites">
              <Card className="cursor-pointer transition-shadow hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-8 w-8 text-purple-600" />
                    <div>
                      <h3 className="font-semibold">Job Invites</h3>
                      <p className="text-muted-foreground text-sm">
                        Send job invitations
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Manager Details */}
      <Card className="dark:bg-primary/10 bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <div>
                <CardTitle className="text-xl">Manager Details</CardTitle>
                <CardDescription>
                  {managerDetails
                    ? 'Your assigned account manager'
                    : 'No manager assigned'}
                </CardDescription>
              </div>
            </div>
            {managerDetails && (
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={`${
                    managerDetails.status === 'ACTIVE'
                      ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300'
                      : 'border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
                  }`}
                >
                  {managerDetails.status
                    .toLowerCase()
                    .split('_')
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ')}
                </Badge>
                <Badge
                  variant="outline"
                  className="border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-900/20 dark:text-purple-300"
                >
                  {managerDetails.type
                    .toLowerCase()
                    .split('_')
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ')}
                </Badge>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {managerDetails ? (
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={managerDetails.image}
                  alt={managerDetails.name}
                />
                <AvatarFallback className="bg-primary text-lg font-semibold text-white">
                  {managerDetails.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {managerDetails.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {managerDetails.email}
                  </p>
                </div>
                {managerDetails.jobTitle && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {managerDetails.jobTitle}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <User className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <p className="text-gray-500 dark:text-gray-400">
                  No account manager has been assigned to you yet.
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Contact support to get assigned to an account manager.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Job Postings */}
      {recentJobPostings.length > 0 && (
        <Card className="dark:bg-primary/10 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <FileText className="h-5 w-5" />
              Recent Job Postings
            </CardTitle>
            <CardDescription>Latest job postings in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentJobPostings.map((job: any) => (
                <div
                  key={job.id}
                  className="flex items-center gap-4 rounded-lg border p-4"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="shrink-0 rounded-full bg-blue-100 p-2 dark:bg-blue-900">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold">{job.title}</h3>
                      <p className="text-muted-foreground truncate text-sm">
                        {job.company}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {job.applications} applications
                        </Badge>
                        <span className="text-muted-foreground text-xs">
                          {format(new Date(job.createdAt), 'MMM dd, yyyy')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Link href={`/app/support/job-postings/${job.id}`}>
                    <Button variant="ghost" size="sm" className="shrink-0">
                      View
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card className="dark:bg-primary/10 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>Latest system activities</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentActivities.length > 0 ? (
            recentActivities.slice(0, 4).map((activity: any, index: number) => {
              const IconComponent = getEntityIcon(activity.entityType || '');
              return (
                <div
                  key={activity.id || index}
                  className="flex items-center gap-4 rounded-lg border bg-gray-50/50 p-3 dark:bg-gray-900/50"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="bg-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-white">
                      <IconComponent className="h-8 w-8" strokeWidth={1} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {activity.metadata?.title ||
                          formatEntityType(activity.entityType || '')}
                        , by{' '}
                        <span className="text-primary text-sm">
                          {activity.metadata?.userName || 'Unknown User'}
                        </span>
                      </p>
                      <p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">
                        {activity?.description || ''}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm text-gray-500">
                      {format(
                        new Date(
                          activity.timestamp || activity.createdAt || ''
                        ),
                        'dd MMM'
                      )}
                    </p>
                    <p className="text-xs text-gray-400">
                      {format(
                        new Date(
                          activity.timestamp || activity.createdAt || ''
                        ),
                        'HH:mm'
                      )}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-6 text-center text-sm text-gray-500">
              No recent activities
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

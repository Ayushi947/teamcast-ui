'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useApp } from '@/lib/context/app-context';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import {
  Users,
  Activity,
  UserCog,
  BarChart3,
  Building2,
  UserCheck,
  TrendingUp,
  Shield,
  HeadphonesIcon,
  User,
  Mail,
  Calendar,
  FileText,
} from 'lucide-react';
import Link from 'next/link';
import {
  activityLogService,
  supportUserManagementService,
  supportClientManagementService,
  supportPartnerManagementService,
  supportCandidateManagementService,
  supportAccountManagerAssignmentService,
} from '@/lib/services/services';
import { useQuery } from '@tanstack/react-query';
import { ActivityModuleEnum, UserRoleEnum } from '@/lib/shared';
import { subMonths, format } from 'date-fns';
import { parseISO } from 'date-fns';
import { isSameMonth } from 'date-fns';
import { formatEnumValue } from '@/lib/utils';

export const SupportDashboard = () => {
  const app = useApp();
  const { user } = useApp();
  // Fetch support users data
  const { data: supportUsers } = useQuery({
    queryKey: ['supportUsers'],
    queryFn: () =>
      supportUserManagementService.getSupportUsers({ page: 1, limit: 300 }),
  });

  // Fetch clients data
  const { data: clients } = useQuery({
    queryKey: ['supportClients'],
    queryFn: () =>
      supportClientManagementService.listSupportClients({
        page: 1,
        limit: 99999999,
      }),
  });

  // Fetch partners data
  const { data: partners } = useQuery({
    queryKey: ['supportPartners'],
    queryFn: () =>
      supportPartnerManagementService.listSupportPartners({
        page: 1,
        limit: 99999999,
      }),
  });

  // Fetch candidates data
  const { data: candidates } = useQuery({
    queryKey: ['supportCandidates'],
    queryFn: () =>
      supportCandidateManagementService.getSupportCandidates({
        page: 1,
        limit: 99999999,
      }),
  });

  // Fetch activity logs
  const { data: activityLogs } = useQuery({
    queryKey: ['supportActivityLogs', app.user?.supportUserId],
    queryFn: () =>
      activityLogService.getActivityLogs({
        entityId: app.user?.supportUserId,
        module: ActivityModuleEnum.SYSTEM,
      }),
    enabled: !!app.user?.supportUserId,
  });

  // Fetch account manager details
  const { data: accountManager } = useQuery({
    queryKey: ['accountManagerDetails'],
    queryFn: () => supportAccountManagerAssignmentService.getManagerDetails(),
  });

  // Calculate role-wise statistics
  const getRoleStats = () => {
    if (!supportUsers?.items) return {};

    const roleCounts = supportUsers.items.reduce((acc: any, user: any) => {
      const role = user.role?.toLowerCase() || 'other';
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {});

    return roleCounts;
  };

  const getClientStats = () => {
    if (!clients?.items)
      return {
        total: 0,
        thisMonth: 0,
        lastMonth: 0,
        increase: 0,
      };

    const now = new Date();
    const lastMonth = subMonths(now, 1);
    let thisMonthCount = 0;
    let lastMonthCount = 0;

    clients.items.forEach((client: any) => {
      const createdAt = parseISO(client.createdAt.toString());
      if (isSameMonth(createdAt, now)) {
        thisMonthCount++;
      } else if (isSameMonth(createdAt, lastMonth)) {
        lastMonthCount++;
      }
    });

    return {
      total: clients.items.length,
      thisMonth: thisMonthCount,
      lastMonth: lastMonthCount,
      increase: thisMonthCount - lastMonthCount,
    };
  };

  const getPartnerStats = () => {
    if (!partners?.items)
      return {
        total: 0,
        thisMonth: 0,
        lastMonth: 0,
        increase: 0,
      };

    const now = new Date();
    const lastMonth = subMonths(now, 1);
    let thisMonthCount = 0;
    let lastMonthCount = 0;

    partners.items.forEach((partner: any) => {
      const createdAt = parseISO(partner.createdAt.toString());
      if (isSameMonth(createdAt, now)) {
        thisMonthCount++;
      } else if (isSameMonth(createdAt, lastMonth)) {
        lastMonthCount++;
      }
    });

    return {
      total: partners.items.length,
      thisMonth: thisMonthCount,
      lastMonth: lastMonthCount,
      increase: thisMonthCount - lastMonthCount,
    };
  };

  const getCandidateStats = () => {
    if (!candidates?.items)
      return {
        total: 0,
        thisMonth: 0,
        lastMonth: 0,
        increase: 0,
      };

    const now = new Date();
    const lastMonth = subMonths(now, 1);
    let thisMonthCount = 0;
    let lastMonthCount = 0;

    candidates.items.forEach((candidate: any) => {
      const createdAt = parseISO(candidate.createdAt.toString());
      if (isSameMonth(createdAt, now)) {
        thisMonthCount++;
      } else if (isSameMonth(createdAt, lastMonth)) {
        lastMonthCount++;
      }
    });

    return {
      total: candidates.items.length,
      thisMonth: thisMonthCount,
      lastMonth: lastMonthCount,
      increase: thisMonthCount - lastMonthCount,
    };
  };

  const roleStats = getRoleStats();
  const clientStats = getClientStats();
  const partnerStats = getPartnerStats();
  const candidateStats = getCandidateStats();

  // Support dashboard stats
  const supportStats = [
    {
      title: 'Total Support Users',
      value: supportUsers?.items?.length || 0,
      change: `+${roleStats.admin || 0} admins`,
      changeType: 'positive' as const,
      icon: Shield,
      description: 'Active support team members',
      color: 'bg-[#F6AE66] dark:bg-[#F6AE66]/80',
    },
    {
      title: 'Active Clients',
      value: clientStats.total || 0,
      change: `+${clientStats.increase || 0} this month`,
      changeType:
        clientStats.increase >= 0
          ? ('positive' as const)
          : ('negative' as const),
      icon: Building2,
      description: 'Registered client companies',
      color: 'bg-[#52CD75] dark:bg-[#52CD75]/80',
    },
    {
      title: 'Partner Organizations',
      value: partnerStats.total || 0,
      change: `+${partnerStats.increase || 0} this month`,
      changeType:
        partnerStats.increase >= 0
          ? ('positive' as const)
          : ('negative' as const),
      icon: UserCheck,
      description: 'Active partner companies',
      color: 'bg-[#52B1CD] dark:bg-[#52B1CD]/80',
    },
    {
      title: 'Total Candidates',
      value: candidateStats.total || 0,
      change: `+${candidateStats.increase || 0} this month`,
      changeType:
        candidateStats.increase >= 0
          ? ('positive' as const)
          : ('negative' as const),
      icon: Users,
      description: 'Registered candidates',
      color: 'bg-[#6E55CF] dark:bg-[#6E55CF]/80',
    },
  ];

  // Support team management data
  const supportTeamData = [
    {
      role: 'Admin',
      count: roleStats.admin || 0,
    },
    {
      role: 'Support Manager',
      count: roleStats.support_manager || 0,
    },
    {
      role: 'Support Agent',
      count: roleStats.support_agent || 0,
    },
    {
      role: 'Analyst',
      count: roleStats.analyst || 0,
    },
  ];

  // Recent activities
  const recentActivities = activityLogs?.data || [];

  // Helper function to format entity type for display
  const formatEntityType = (entityType: string) => {
    return entityType
      .replace('_', ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // Helper function to get icon based on entity type
  const getEntityIcon = (entityType: string) => {
    switch (entityType?.toLowerCase()) {
      case 'client':
        return Building2;
      case 'partner':
        return UserCheck;
      case 'candidate':
        return Users;
      case 'user':
        return Shield;
      case 'job_posting':
        return FileText;
      default:
        return Activity;
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {supportStats.map((stat) => (
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

      {/* Account Manager Details */}
      {accountManager && (
        <Card className="dark:bg-primary/10 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <User className="h-5 w-5" />
              Your Account Manager
            </CardTitle>
            <CardDescription>
              Contact information for your assigned account manager
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 flex h-16 w-16 items-center justify-center rounded-full">
                {accountManager.image ? (
                  <img
                    src={accountManager.image}
                    alt={accountManager.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <User className="text-primary h-8 w-8" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">
                    {accountManager.name}
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    {formatEnumValue(accountManager.role)}
                  </Badge>
                </div>
                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4" />
                  <span>{accountManager.email}</span>
                </div>
                {accountManager.jobTitle && (
                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <User className="h-4 w-4" />
                    <span>{accountManager.jobTitle}</span>
                  </div>
                )}
                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Member since{' '}
                    {format(new Date(accountManager.createdAt), 'MMM yyyy')}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Layout: System Overview + Recent Activities & Team Management + Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT SECTION: System Overview + Recent Activities + Team Management */}
        <div className="space-y-6 lg:col-span-9">
          {/* System Overview */}
          <Card className="dark:bg-primary/10 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <BarChart3 className="h-5 w-5" />
                System Overview
              </CardTitle>
              <CardDescription>
                Platform statistics and health metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Main system info */}
              <div className="flex w-full items-center justify-between">
                <div className="w-1/3">
                  <p className="text-muted-foreground font-medium">
                    Platform Status
                  </p>
                  <p className="text-foreground font-medium">
                    All Systems Operational
                  </p>
                </div>

                <div className="w-1/3 text-center">
                  <p className="text-muted-foreground font-medium">Uptime :</p>
                  <p className="text-foreground font-medium">99.9%</p>
                </div>

                <div className="flex w-1/3 justify-end">
                  <Badge variant="default" className="rounded-2xl bg-[#259800]">
                    Healthy
                  </Badge>
                </div>
              </div>

              {/* Usage cards */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {/* Support Users */}
                <div className="bg-muted/50 rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-md font-medium">Support Users</span>
                    <span className="text-md text-primary font-bold">
                      {supportUsers?.items?.length || 0}
                    </span>
                  </div>
                </div>

                {/* Active Clients */}
                <div className="bg-muted/50 rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-md font-medium">Active Clients</span>
                    <span className="text-md text-primary font-bold">
                      {clientStats.total || 0}
                    </span>
                  </div>
                </div>

                {/* Partner Organizations */}
                <div className="bg-muted/50 rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-md font-medium">Partners</span>
                    <span className="text-md text-primary font-bold">
                      {partnerStats.total || 0}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities + Team Management */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Recent Activities */}
            <Card className="dark:bg-primary/10 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Activity className="h-5 w-5" />
                  Recent Activities
                </CardTitle>
                <CardDescription>
                  Latest support actions and system updates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentActivities.length > 0 ? (
                  recentActivities
                    .slice(0, 4)
                    .map((activity: any, index: number) => {
                      const IconComponent = getEntityIcon(
                        activity.entityType || ''
                      );
                      return (
                        <div
                          key={activity.id || index}
                          className="flex items-center justify-between rounded-lg border bg-gray-50/50 p-3 dark:bg-gray-900/50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="bg-primary flex h-12 w-12 items-center justify-center rounded-lg text-white">
                              <IconComponent
                                className="h-8 w-8"
                                strokeWidth={1}
                              />
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                {activity.metadata?.title ||
                                  formatEntityType(activity.entityType || '')}
                                , by{' '}
                                <span className="text-primary text-sm">
                                  {activity.metadata?.userName ||
                                    'Unknown User'}
                                </span>
                              </p>
                              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                {activity?.description || ''}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
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

            {/* Support Team Management */}
            <Card className="dark:bg-primary/10 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <UserCog className="h-5 w-5" />
                  Support Team
                </CardTitle>
                <CardDescription>Support team roles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {supportTeamData.map((team) => (
                  <div
                    key={team.role}
                    className="bg-muted/50 flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded">
                        <Shield className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-foreground font-medium">
                          {team.role}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          {team.count} {team.count === 1 ? 'user' : 'users'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* RIGHT SECTION: Quick Actions */}
        <div className="lg:col-span-3">
          <Card className="dark:bg-primary/10 h-full bg-white">
            <CardHeader>
              <CardTitle className="text-xl">Quick Actions</CardTitle>
              <CardDescription>
                Common support and management tasks.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                {[
                  {
                    href: '/app/support/users',
                    icon: <Shield className="h-6 w-6 text-white" />,
                    title: 'Manage Users',
                    desc: 'Support team management',
                  },
                  {
                    href: '/app/support/clients',
                    icon: <Building2 className="h-6 w-6 text-white" />,
                    title: 'Manage Clients',
                    desc: 'Client company management',
                  },
                  {
                    href: '/app/support/partners',
                    icon: <UserCheck className="h-6 w-6 text-white" />,
                    title: 'Manage Partners',
                    desc: 'Partner organization management',
                  },
                  {
                    href: '/app/support/candidates',
                    icon: <Users className="h-6 w-6 text-white" />,
                    title: 'Manage Candidates',
                    desc: 'Candidate data management',
                  },
                  {
                    href: '/app/support/kpis',
                    icon: <BarChart3 className="h-6 w-6 text-white" />,
                    title: 'Analytics',
                    desc: 'Platform analytics',
                  },
                  {
                    href: '/app/support/activity',
                    icon: <Activity className="h-6 w-6 text-white" />,
                    title: 'Activity Logs',
                    desc: 'System activity monitoring',
                  },
                  {
                    href: `/app/support/support-tickets/${user?.role === UserRoleEnum.ADMIN ? 'admin' : user?.role === UserRoleEnum.ACCOUNT_MANAGER ? 'account-manager' : ''}`,
                    icon: <HeadphonesIcon className="h-6 w-6 text-white" />,
                    title: 'Support Tickets',
                    desc: 'Customer support management',
                  },
                ].map((item, index) => (
                  <Button
                    key={index}
                    asChild
                    variant="outline"
                    className="bg-muted/50 hover:bg-muted h-auto justify-start p-2"
                  >
                    <Link href={item.href} className="flex items-center gap-2">
                      <div className="bg-primary rounded-lg p-1.5">
                        {item.icon}
                      </div>
                      <div className="text-left">
                        <div className="text-foreground text-sm font-medium">
                          {item.title}
                        </div>
                        <div className="text-muted-foreground text-xs break-words whitespace-normal">
                          {item.desc}
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

      {/* Platform Statistics - Bottom */}
      <Card className="dark:bg-primary/10 bg-white">
        <CardHeader className="flex w-full flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Platform Statistics
              </div>
            </CardTitle>
            <CardDescription className="mt-1">
              Overview of platform usage and growth metrics
            </CardDescription>
          </div>
          <div className="flex flex-col items-start sm:items-end">
            <div className="flex items-center gap-2">
              <Badge className="rounded-2xl">
                {(
                  (((clientStats.total || 0) + (partnerStats.total || 0)) /
                    Math.max(
                      (clientStats.total || 0) + (partnerStats.total || 0),
                      1
                    )) *
                  100
                ).toFixed(1)}
                %
              </Badge>
              <p>Growth Rate</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-muted/50 rounded-lg border p-4 text-center">
              <div className="text-primary text-2xl font-bold">
                {clientStats.total}
              </div>
              <div className="text-muted-foreground text-sm">Total Clients</div>
            </div>
            <div className="bg-muted/50 rounded-lg border p-4 text-center">
              <div className="text-primary text-2xl font-bold">
                {partnerStats.total}
              </div>
              <div className="text-muted-foreground text-sm">Partners</div>
            </div>
            <div className="bg-muted/50 rounded-lg border p-4 text-center">
              <div className="text-primary text-2xl font-bold">
                {candidateStats.total}
              </div>
              <div className="text-muted-foreground text-sm">Candidates</div>
            </div>
            <div className="bg-muted/50 rounded-lg border p-4 text-center">
              <div className="text-primary text-2xl font-bold">
                {supportUsers?.items?.length || 0}
              </div>
              <div className="text-muted-foreground text-sm">Support Team</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

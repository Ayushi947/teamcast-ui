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
  FileText,
  TrendingUp,
  Eye,
  UserCheck,
  Activity,
  BarChart3,
  User,
  Mail,
  Shield,
  HeadphonesIcon,
  Clock,
  AlertTriangle,
  CheckCircle,
  Timer,
  Target,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useApp } from '@/lib/context/app-context';
import { supportTicketService } from '@/lib/services/services';
import { SupportTicketStatusEnum } from '@/lib/shared/models/common/enums';
import { formatEnumValue } from '@/lib/utils';

export const TechnicalSupportDashboard = () => {
  const { user } = useApp();

  // Fetch support ticket statistics for assigned tickets only
  const { data: ticketStatistics, isLoading: statsLoading } = useQuery({
    queryKey: ['supportTicketStatistics', user?.supportUserId],
    queryFn: () =>
      supportTicketService.getTicketStatistics({
        assignedUserId: user?.supportUserId,
      }),
    enabled: !!user?.supportUserId,
  });

  // Fetch recent tickets for the technical support user
  const { data: recentTickets, isLoading: ticketsLoading } = useQuery({
    queryKey: ['recentSupportTickets', user?.supportUserId],
    queryFn: () =>
      supportTicketService.listTickets({
        page: 1,
        limit: 10,
        assignedUserId: user?.supportUserId,
      }),
    enabled: !!user?.supportUserId,
  });

  // Calculate statistics from the API response
  const stats = ticketStatistics?.overview || {
    totalTickets: 0,
    openTickets: 0,
    inProgressTickets: 0,
    resolvedTickets: 0,
    closedTickets: 0,
    overDueTickets: 0,
    unassignedTickets: 0,
    highPriorityTickets: 0,
    averageResolutionTime: 0,
    averageResponseTime: 0,
    totalEntityTypes: 0,
    satisfactionScore: 0,
    escalationRate: 0,
  };

  // Technical support dashboard stats
  const technicalSupportStats = [
    {
      title: 'Total Tickets',
      value: stats.totalTickets,
      change: `${stats.openTickets} open`,
      changeType: 'positive' as const,
      icon: FileText,
      description: 'All support tickets',
      color: 'bg-[#F6AE66] dark:bg-[#F6AE66]/80',
    },
    {
      title: 'Open Tickets',
      value: stats.openTickets,
      change: `${stats.inProgressTickets} in progress`,
      changeType: 'positive' as const,
      icon: AlertTriangle,
      description: 'Tickets requiring attention',
      color: 'bg-[#FF6B6B] dark:bg-[#FF6B6B]/80',
    },
    {
      title: 'Resolved Tickets',
      value: stats.resolvedTickets,
      change: `${stats.closedTickets} closed`,
      changeType: 'positive' as const,
      icon: CheckCircle,
      description: 'Successfully resolved',
      color: 'bg-[#52CD75] dark:bg-[#52CD75]/80',
    },
    {
      title: 'High Priority',
      value: stats.highPriorityTickets,
      change: `${stats.overDueTickets} overdue`,
      changeType:
        stats.overDueTickets > 0
          ? ('negative' as const)
          : ('positive' as const),
      icon: Zap,
      description: 'Urgent tickets',
      color: 'bg-[#6E55CF] dark:bg-[#6E55CF]/80',
    },
  ];

  // Performance metrics
  const performanceMetrics = [
    {
      title: 'Avg Resolution Time',
      value: `${Math.round(stats.averageResolutionTime / 60)}h`,
      icon: Timer,
      description: 'Average time to resolve',
    },
    {
      title: 'Avg Response Time',
      value: `${Math.round(stats.averageResponseTime / 60)}h`,
      icon: Clock,
      description: 'Average first response',
    },
    {
      title: 'Satisfaction Score',
      value: `${stats.satisfactionScore.toFixed(1)}/5`,
      icon: Target,
      description: 'Customer satisfaction',
    },
    {
      title: 'Escalation Rate',
      value: `${(stats.escalationRate * 100).toFixed(1)}%`,
      icon: TrendingUp,
      description: 'Tickets escalated',
    },
  ];

  // Recent tickets data
  const recentTicketsData =
    recentTickets?.items?.slice(0, 5).map((ticket: any) => ({
      id: ticket.id,
      title: ticket.title,
      status: ticket.status,
      priority: ticket.priority,
      category: ticket.category,
      createdAt: ticket.createdAt,
      assignedTo: ticket.assignedUser?.name || 'Unassigned',
    })) || [];

  const getStatusBadge = (status: SupportTicketStatusEnum) => {
    const variants: Record<
      string,
      'default' | 'secondary' | 'outline' | 'destructive'
    > = {
      [SupportTicketStatusEnum.OPEN]: 'default',
      [SupportTicketStatusEnum.IN_PROGRESS]: 'secondary',
      [SupportTicketStatusEnum.RESOLVED]: 'outline',
      [SupportTicketStatusEnum.CLOSED]: 'destructive',
      [SupportTicketStatusEnum.NEW]: 'default',
    };

    return (
      <Badge variant={variants[status] || 'secondary'}>
        {formatEnumValue(status)}
      </Badge>
    );
  };

  if (statsLoading || ticketsLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="border-primary mx-auto h-8 w-8 animate-spin rounded-full border-b-2"></div>
          <p className="text-muted-foreground mt-2 text-sm">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {technicalSupportStats.map((stat) => (
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

      {/* Technical Support Profile */}
      <Card className="dark:bg-primary/10 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Shield className="h-5 w-5" />
            Your Technical Support Profile
          </CardTitle>
          <CardDescription>
            Your technical support information and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 flex h-16 w-16 items-center justify-center rounded-full">
              <User className="text-primary h-8 w-8" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">
                  {user?.name || 'Technical Support Agent'}
                </h3>
                <Badge variant="outline" className="text-xs">
                  Technical Support
                </Badge>
              </div>
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4" />
                <span>{user?.email || 'support@teamcast.com'}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Layout: Performance Overview + Recent Tickets & Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT SECTION: Performance Overview + Recent Tickets */}
        <div className="space-y-6 lg:col-span-9">
          {/* Performance Overview */}
          <Card className="dark:bg-primary/10 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <BarChart3 className="h-5 w-5" />
                Performance Overview
              </CardTitle>
              <CardDescription>
                Your technical support performance metrics and statistics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Main performance info */}
              <div className="flex w-full items-center justify-between">
                <div className="w-1/3">
                  <p className="text-muted-foreground font-medium">
                    Support Status
                  </p>
                  <p className="text-foreground font-medium">Active</p>
                </div>

                <div className="w-1/3 text-center">
                  <p className="text-muted-foreground font-medium">
                    Performance :
                  </p>
                  <p className="text-foreground font-medium">
                    {stats.satisfactionScore >= 4
                      ? 'Excellent'
                      : stats.satisfactionScore >= 3
                        ? 'Good'
                        : 'Needs Improvement'}
                  </p>
                </div>

                <div className="flex w-1/3 justify-end">
                  <Badge variant="default" className="rounded-2xl bg-[#259800]">
                    Active
                  </Badge>
                </div>
              </div>

              {/* Performance metrics cards */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {performanceMetrics.map((metric) => (
                  <div
                    key={metric.title}
                    className="bg-muted/50 rounded-lg border p-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-md font-medium">
                        {metric.title}
                      </span>
                      <span className="text-md text-primary font-bold">
                        {metric.value}
                      </span>
                    </div>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {metric.description}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Tickets */}
          <Card className="dark:bg-primary/10 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <FileText className="h-5 w-5" />
                Recent Tickets
              </CardTitle>
              <CardDescription>
                Latest support tickets assigned to you
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentTicketsData.length === 0 ? (
                <div className="py-8 text-center">
                  <FileText className="text-muted-foreground mx-auto h-12 w-12" />
                  <h3 className="mt-2 text-sm font-semibold">
                    No recent tickets
                  </h3>
                  <p className="text-muted-foreground mt-1 text-sm">
                    No tickets are currently assigned to you.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentTicketsData.map((ticket: any) => (
                    <div
                      key={ticket.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full">
                          <HeadphonesIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-medium">
                            {formatEnumValue(ticket.title)}
                          </h4>
                          <p className="text-muted-foreground text-sm">
                            {formatEnumValue(ticket.category)}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            Created{' '}
                            {format(new Date(ticket.createdAt), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(ticket.status)}
                        <Button variant="ghost" size="sm" asChild>
                          <Link
                            href={`/app/support/support-tickets/technical-support/${ticket.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {recentTicketsData.length > 0 && (
                <div className="mt-4 text-center">
                  <Button variant="outline" asChild>
                    <Link href="/app/support/support-tickets/technical-support">
                      View All Tickets
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT SECTION: Quick Actions */}
        <div className="space-y-6 lg:col-span-3">
          {/* Quick Actions */}
          <Card className="dark:bg-primary/10 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Activity className="h-5 w-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>Common technical support tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/app/support/support-tickets/technical-support">
                  <UserCheck className="mr-2 h-4 w-4" />
                  My Assigned Tickets
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Ticket Status Summary */}
          <Card className="dark:bg-primary/10 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Target className="h-5 w-5" />
                Ticket Status Summary
              </CardTitle>
              <CardDescription>Current ticket distribution</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm">Open</span>
                  </div>
                  <span className="text-sm font-medium">
                    {stats.openTickets}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                    <span className="text-sm">In Progress</span>
                  </div>
                  <span className="text-sm font-medium">
                    {stats.inProgressTickets}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    <span className="text-sm">Resolved</span>
                  </div>
                  <span className="text-sm font-medium">
                    {stats.resolvedTickets}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-gray-500"></div>
                    <span className="text-sm">Closed</span>
                  </div>
                  <span className="text-sm font-medium">
                    {stats.closedTickets}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                    <span className="text-sm">Overdue</span>
                  </div>
                  <span className="text-sm font-medium">
                    {stats.overDueTickets}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Support Statistics - Bottom */}
      <Card className="dark:bg-primary/10 bg-white">
        <CardHeader className="flex w-full flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Support Statistics
              </div>
            </CardTitle>
            <CardDescription className="mt-1">
              Overview of support ticket metrics and performance
            </CardDescription>
          </div>
          <div className="flex flex-col items-start sm:items-end">
            <div className="flex items-center gap-2">
              <Badge className="rounded-2xl">
                {stats.satisfactionScore.toFixed(1)}/5
              </Badge>
              <p>Satisfaction Score</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-muted/50 rounded-lg border p-4 text-center">
              <div className="text-primary text-2xl font-bold">
                {stats.totalTickets}
              </div>
              <div className="text-muted-foreground text-sm">Total Tickets</div>
            </div>
            <div className="bg-muted/50 rounded-lg border p-4 text-center">
              <div className="text-primary text-2xl font-bold">
                {stats.unassignedTickets}
              </div>
              <div className="text-muted-foreground text-sm">Unassigned</div>
            </div>
            <div className="bg-muted/50 rounded-lg border p-4 text-center">
              <div className="text-primary text-2xl font-bold">
                {Math.round(stats.averageResolutionTime / 60)}h
              </div>
              <div className="text-muted-foreground text-sm">
                Avg Resolution
              </div>
            </div>
            <div className="bg-muted/50 rounded-lg border p-4 text-center">
              <div className="text-primary text-2xl font-bold">
                {(stats.escalationRate * 100).toFixed(1)}%
              </div>
              <div className="text-muted-foreground text-sm">
                Escalation Rate
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

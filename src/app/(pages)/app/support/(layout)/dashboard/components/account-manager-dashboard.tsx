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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  Users,
  FileText,
  Building2,
  TrendingUp,
  Calendar,
  Eye,
  Briefcase,
  UserCheck,
  Activity,
  BarChart3,
  User,
  Mail,
  Shield,
} from 'lucide-react';
import Link from 'next/link';
import {
  supportAccountManagerAssignmentService,
  supportJobPostingService,
  supportClientManagementService,
} from '@/lib/services/services';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { JobPostingStatusEnum } from '@/lib/shared/models/common/enums';
import { toast } from 'sonner';

export const AccountManagerDashboard = () => {
  const queryClient = useQueryClient();

  // Fetch account manager details
  const { data: accountManager } = useQuery({
    queryKey: ['accountManagerDetails'],
    queryFn: () => supportAccountManagerAssignmentService.getManagerDetails(),
  });

  // Fetch availability status
  const { data: availabilityStatus } = useQuery({
    queryKey: ['accountManagerAvailability'],
    queryFn: () =>
      supportAccountManagerAssignmentService.getAccountManagerAvailabilityStatus(),
  });

  // Fetch job postings for the account manager
  const { data: jobPostingsResponse } = useQuery({
    queryKey: ['accountManagerJobPostings'],
    queryFn: () => supportJobPostingService.getJobPostingsByAccountManagerId(),
  });

  // Fetch clients for the account manager
  const { data: clientsResponse } = useQuery({
    queryKey: ['accountManagerClients'],
    queryFn: async () => {
      const response =
        await supportClientManagementService.getClientsByAccountManagerId({
          page: 1,
          limit: 100, // Get all clients for the dashboard
        });
      return response;
    },
  });

  // Toggle availability mutation
  const toggleAvailabilityMutation = useMutation({
    mutationFn: (isAvailable: boolean) =>
      supportAccountManagerAssignmentService.toggleAccountManagerAvailability(
        isAvailable
      ),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['accountManagerAvailability'],
      });
      toast.success(data.message);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update availability status');
    },
  });

  const jobPostings = jobPostingsResponse?.jobPostings || [];
  const clients = clientsResponse?.items || [];
  const totalClients = clientsResponse?.pagination?.total || 0;

  // Calculate statistics
  const stats = {
    totalClients: totalClients,
    totalJobPostings: jobPostings.length,
    activeJobPostings: jobPostings.filter(
      (job: any) => job.status === JobPostingStatusEnum.PUBLISHED
    ).length,
    draftJobPostings: jobPostings.filter(
      (job: any) => job.status === JobPostingStatusEnum.DRAFT
    ).length,
    closedJobPostings: jobPostings.filter(
      (job: any) => job.status === JobPostingStatusEnum.CLOSED
    ).length,
    totalApplications: jobPostings.reduce(
      (sum: number, job: any) => sum + (job.numberOfApplications || 0),
      0
    ),
  };

  // Account manager dashboard stats
  const accountManagerStats = [
    {
      title: 'Assigned Clients',
      value: stats.totalClients,
      change: `+${Math.floor(stats.totalClients * 0.1)} this month`,
      changeType: 'positive' as const,
      icon: Building2,
      description: 'Clients under your management',
      color: 'bg-[#F6AE66] dark:bg-[#F6AE66]/80',
    },
    {
      title: 'Total Job Postings',
      value: stats.totalJobPostings,
      change: `+${stats.activeJobPostings} active`,
      changeType: 'positive' as const,
      icon: FileText,
      description: 'All job postings',
      color: 'bg-[#52CD75] dark:bg-[#52CD75]/80',
    },
    {
      title: 'Active Jobs',
      value: stats.activeJobPostings,
      change: `+${stats.draftJobPostings} draft`,
      changeType: 'positive' as const,
      icon: TrendingUp,
      description: 'Currently published jobs',
      color: 'bg-[#52B1CD] dark:bg-[#52B1CD]/80',
    },
    {
      title: 'Total Applications',
      value: stats.totalApplications,
      change: `+${Math.floor(stats.totalApplications * 0.2)} pending`,
      changeType: 'positive' as const,
      icon: Users,
      description: 'Applications received',
      color: 'bg-[#6E55CF] dark:bg-[#6E55CF]/80',
    },
  ];

  // Recent job postings data
  const recentJobPostings = jobPostings.slice(0, 5).map((job: any) => ({
    id: job.id,
    title: job.title,
    status: job.status,
    clientId: job.clientId,
    applications: job.numberOfApplications || 0,
    createdAt: job.createdAt,
    company: job.company?.name || 'Unknown Company',
  }));

  // Assigned clients data
  const clientsData = clients.slice(0, 5).map((client: any) => ({
    id: client.id,
    name: client.companyName,
    email: client.contactEmail,
    status: client.status,
    assignedAt: client.createdAt,
  }));

  const getStatusBadge = (status: JobPostingStatusEnum) => {
    const variants = {
      [JobPostingStatusEnum.PUBLISHED]: 'default',
      [JobPostingStatusEnum.DRAFT]: 'secondary',
      [JobPostingStatusEnum.CLOSED]: 'destructive',
      [JobPostingStatusEnum.ARCHIVED]: 'outline',
    } as const;

    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {accountManagerStats.map((stat) => (
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
              <Shield className="h-5 w-5" />
              Your Account Manager Profile
            </CardTitle>
            <CardDescription>
              Your account manager information and details
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
                    Account Manager
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

      {/* Layout: Overview + Recent Activities & Client Management + Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT SECTION: Overview + Recent Activities + Client Management */}
        <div className="space-y-6 lg:col-span-9">
          {/* Account Manager Overview */}
          <Card className="dark:bg-primary/10 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <BarChart3 className="h-5 w-5" />
                Account Manager Overview
              </CardTitle>
              <CardDescription>
                Your performance metrics and client management statistics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Main overview info */}
              <div className="flex w-full items-center justify-between">
                <div className="w-1/3">
                  <p className="text-muted-foreground font-medium">
                    Availability Status
                  </p>
                  <div className="mt-1">
                    <Select
                      value={
                        availabilityStatus?.isAvailable
                          ? 'available'
                          : 'unavailable'
                      }
                      onValueChange={(value) => {
                        const isAvailable = value === 'available';
                        toggleAvailabilityMutation.mutate(isAvailable);
                      }}
                      disabled={toggleAvailabilityMutation.isPending}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="unavailable">Unavailable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="w-1/3 text-center">
                  <p className="text-muted-foreground font-medium">
                    Performance
                  </p>
                  <p className="text-foreground font-medium">Excellent</p>
                </div>

                <div className="flex w-1/3 justify-end">
                  <Badge
                    variant="default"
                    className={`rounded-2xl ${
                      availabilityStatus?.isAvailable
                        ? 'bg-[#259800]'
                        : 'bg-[#dc2626]'
                    }`}
                  >
                    {availabilityStatus?.isAvailable
                      ? 'Available'
                      : 'Unavailable'}
                  </Badge>
                </div>
              </div>

              {/* Usage cards */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {/* Assigned Clients */}
                <div className="bg-muted/50 rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-md font-medium">
                      Assigned Clients
                    </span>
                    <span className="text-md text-primary font-bold">
                      {stats.totalClients}
                    </span>
                  </div>
                </div>

                {/* Active Jobs */}
                <div className="bg-muted/50 rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-md font-medium">Active Jobs</span>
                    <span className="text-md text-primary font-bold">
                      {stats.activeJobPostings}
                    </span>
                  </div>
                </div>

                {/* Total Applications */}
                <div className="bg-muted/50 rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-md font-medium">Applications</span>
                    <span className="text-md text-primary font-bold">
                      {stats.totalApplications}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Job Postings */}
          <Card className="dark:bg-primary/10 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <FileText className="h-5 w-5" />
                Recent Job Postings
              </CardTitle>
              <CardDescription>
                Latest job postings from your assigned clients
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentJobPostings.length === 0 ? (
                <div className="py-8 text-center">
                  <FileText className="text-muted-foreground mx-auto h-12 w-12" />
                  <h3 className="mt-2 text-sm font-semibold">
                    No job postings
                  </h3>
                  <p className="text-muted-foreground mt-1 text-sm">
                    No job postings found for your assigned clients.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentJobPostings.map((job: any) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full">
                          <Briefcase className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-medium">{job.title}</h4>
                          <p className="text-muted-foreground text-sm">
                            {job.company}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            Created{' '}
                            {format(new Date(job.createdAt), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(job.status)}
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/app/support/job-details/${job.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {recentJobPostings.length > 0 && (
                <div className="mt-4 text-center">
                  <Button variant="outline" asChild>
                    <Link href="/app/support/job-postings">
                      View All Job Postings
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT SECTION: Quick Actions + Assigned Clients */}
        <div className="space-y-6 lg:col-span-3">
          {/* Quick Actions */}
          <Card className="dark:bg-primary/10 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Activity className="h-5 w-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" asChild>
                <Link href="/app/support/job-postings">
                  <FileText className="mr-2 h-4 w-4" />
                  Manage Job Postings
                </Link>
              </Button>
              <Button variant="outline" className="w-full">
                <UserCheck className="mr-2 h-4 w-4" />
                Contact Clients
              </Button>
              <Button variant="outline" className="w-full">
                <BarChart3 className="mr-2 h-4 w-4" />
                View Reports
              </Button>
            </CardContent>
          </Card>

          {/* Assigned Clients */}
          <Card className="dark:bg-primary/10 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Users className="h-5 w-5" />
                Assigned Clients
              </CardTitle>
              <CardDescription>
                Clients under your account management
              </CardDescription>
            </CardHeader>
            <CardContent>
              {clientsData.length === 0 ? (
                <div className="py-8 text-center">
                  <Users className="text-muted-foreground mx-auto h-12 w-12" />
                  <h3 className="mt-2 text-sm font-semibold">
                    No assigned clients
                  </h3>
                  <p className="text-muted-foreground mt-1 text-sm">
                    No clients are currently assigned to your account.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {clientsData.map((client: any) => (
                    <div
                      key={client.id}
                      className="flex items-center gap-4 rounded-lg border p-4"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-4">
                        <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="truncate font-medium">
                            {client.name}
                          </h4>
                          <p className="text-muted-foreground truncate text-sm">
                            {client.email}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            Assigned{' '}
                            {format(
                              new Date(client.assignedAt),
                              'MMM dd, yyyy'
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <Badge variant="outline">{client.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

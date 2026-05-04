'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Users,
  Briefcase,
  Calendar,
  CreditCard,
  AlertTriangle,
  Building2,
  MoreHorizontal,
  CheckCircle,
  Clock,
  DollarSign,
  Activity,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export const AdminDashboard = () => {
  // Mock data - replace with actual API calls
  const stats = [
    {
      name: 'Total Active Clients',
      value: '24',
      icon: Building2,
      change: '+3',
      changeType: 'positive' as const,
      description: 'Active client organizations',
      background: 'bg-[#F6AE66] dark:bg-[#D6994E]',
    },
    {
      name: 'Active Job Posts',
      value: '127',
      icon: Briefcase,
      change: '+12',
      changeType: 'positive' as const,
      description: 'Currently open positions',
      background: 'bg-[#52CD75] dark:bg-[#3DB363]',
    },
    {
      name: 'Candidates Submitted',
      value: '342',
      icon: Users,
      change: '+28',
      changeType: 'positive' as const,
      description: 'This month',
      background: 'bg-[#52B1CD] dark:bg-[#3A8FA9]',
    },
    {
      name: 'Pending Interviews',
      value: '18',
      icon: Calendar,
      change: '+5',
      changeType: 'positive' as const,
      description: 'Scheduled this week',
      background: 'bg-[#6E55CF] dark:bg-[#5A43B5]',
    },
  ];

  const subscriptionData = {
    plan: 'Enterprise Pro',
    status: 'Active',
    nextBilling: '2024-04-15',
    amount: '$2,499',
    usage: {
      candidates: { used: 342, limit: 500 },
      jobs: { used: 127, limit: 200 },
      interviews: { used: 89, limit: 150 },
    },
  };

  const teamMembers = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'HR Manager',
      status: 'Active',
      lastActive: '2 hours ago',
      avatar: '/images/team/sarah.jpg',
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'Recruiter',
      status: 'Active',
      lastActive: '30 min ago',
      avatar: '/images/team/michael.jpg',
    },
    {
      id: 3,
      name: 'Emma Rodriguez',
      role: 'Accounts Manager',
      status: 'Active',
      lastActive: '1 hour ago',
      avatar: '/images/team/emma.jpg',
    },
    {
      id: 4,
      name: 'David Kim',
      role: 'Recruiter',
      status: 'Inactive',
      lastActive: '2 days ago',
      avatar: '/images/team/david.jpg',
    },
  ];

  const systemAlerts = [
    {
      id: 1,
      type: 'warning',
      title: 'Subscription Usage Alert',
      message: 'You are approaching your monthly candidate limit (342/500)',
      time: '2 hours ago',
    },
    {
      id: 2,
      type: 'info',
      title: 'New Feature Available',
      message: 'AI-powered candidate matching is now available',
      time: '1 day ago',
    },
    {
      id: 3,
      type: 'success',
      title: 'Payment Processed',
      message: 'Monthly subscription payment completed successfully',
      time: '3 days ago',
    },
  ];

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return (
          <AlertTriangle className="h-4 w-4 text-amber-500 dark:text-amber-400" />
        );
      case 'success':
        return (
          <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />
        );
      case 'info':
        return (
          <Activity className="h-4 w-4 text-blue-500 dark:text-blue-400" />
        );
      default:
        return <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'default';
      case 'inactive':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className={`${stat.background} border-0`}>
              <CardHeader
                className={'flex flex-row items-center justify-between pb-1'}
              >
                <CardTitle className="text-base font-medium text-white dark:text-white/90">
                  {stat.name}
                </CardTitle>
                <stat.icon className="h-10 w-10 stroke-1 text-white dark:text-white/90" />
              </CardHeader>
              <CardContent>
                <div className="pb-1 text-2xl font-bold text-white opacity-85 dark:opacity-95">
                  {stat.value}
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="h-auto w-8 rounded-full bg-gray-100 text-center dark:bg-gray-800">
                    <span
                      className={cn(
                        'font-medium',
                        stat.changeType === 'positive'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      )}
                    >
                      {stat.change}
                    </span>
                  </div>
                  <span className="text-sm text-white dark:text-white/90">
                    {stat.description}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Subscription & Billing */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-white">
              <CreditCard className="h-5 w-5" />
              Subscription Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm dark:text-gray-400">
                Current Plan
              </span>
              <Badge variant="default">{subscriptionData.plan}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm dark:text-gray-400">
                Status
              </span>
              <Badge variant="success">{subscriptionData.status}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm dark:text-gray-400">
                Next Billing
              </span>
              <span className="text-sm font-medium dark:text-white">
                {subscriptionData.nextBilling}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm dark:text-gray-400">
                Amount
              </span>
              <span className="text-sm font-bold dark:text-white">
                {subscriptionData.amount}
              </span>
            </div>

            <Separator className="dark:bg-gray-700" />

            <div className="space-y-3">
              <h4 className="text-sm font-medium dark:text-white">
                Usage Overview
              </h4>
              {Object.entries(subscriptionData.usage).map(([key, usage]) => (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground capitalize dark:text-gray-400">
                      {key}
                    </span>
                    <span className="font-medium dark:text-white">
                      {usage.used}/{usage.limit}
                    </span>
                  </div>
                  <Progress
                    value={(usage.used / usage.limit) * 100}
                    className="h-2 dark:bg-gray-700"
                  />
                </div>
              ))}
            </div>

            <Button
              className="w-full rounded-md bg-[#52CD75] text-white hover:bg-[#3DB363] dark:bg-[#3DB363] dark:text-white dark:hover:bg-[#2D9F4F]"
              variant="outline"
            >
              <DollarSign className="mr-2 h-4 w-4" />
              Manage Billing
            </Button>
          </CardContent>
        </Card>

        {/* Team Members Overview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 dark:text-white">
                <Users className="h-5 w-5" />
                Team Members Overview
              </CardTitle>
              <Button
                variant="outline"
                className="bg-[#6E55CF] text-white shadow-lg hover:bg-violet-500 hover:text-gray-100 dark:bg-[#5A43B5] dark:text-white dark:hover:bg-violet-600"
                size="sm"
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-lg border p-3 dark:border-gray-700 dark:bg-gray-800/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-300 dark:bg-gray-600">
                      <span className="text-sm font-medium dark:text-white">
                        {member.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium dark:text-white">
                        {member.name}
                      </p>
                      <p className="text-muted-foreground text-sm dark:text-gray-400">
                        {member.role}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <Badge
                        variant={getStatusBadgeVariant(member.status) as any}
                        className="mb-1"
                      >
                        {member.status}
                      </Badge>
                      <p className="text-muted-foreground text-xs dark:text-gray-400">
                        {member.lastActive}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="dark:hover:bg-gray-700"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="dark:border-gray-700 dark:bg-gray-800"
                      >
                        <DropdownMenuItem className="dark:text-white dark:hover:bg-gray-700">
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem className="dark:text-white dark:hover:bg-gray-700">
                          Edit Permissions
                        </DropdownMenuItem>
                        <DropdownMenuItem className="dark:text-white dark:hover:bg-gray-700">
                          Send Message
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Alerts & Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-white">
            <AlertTriangle className="h-5 w-5" />
            System Alerts & Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {systemAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center gap-3 rounded-lg border bg-gray-100 p-3 dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="rounded-full bg-gray-200 p-2 dark:bg-gray-700">
                  {getAlertIcon(alert.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="font-medium dark:text-white">{alert.title}</p>
                  <p className="text-muted-foreground text-sm dark:text-gray-400">
                    {alert.message}
                  </p>
                  <p className="text-muted-foreground text-xs dark:text-gray-500">
                    {alert.time}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-[#6E55CF] text-white hover:bg-violet-500 dark:bg-[#5A43B5] dark:text-white dark:hover:bg-violet-600"
                >
                  Dismiss
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

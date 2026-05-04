'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Users,
  UserCheck,
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Brain,
  Video,
  MessageSquare,
  TrendingUp,
  Filter,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export const HRDashboard = () => {
  // Mock data - replace with actual API calls
  const pipelineStats = [
    {
      name: 'Active Candidates',
      value: '89',
      icon: Users,
      change: '+12',
      changeType: 'positive' as const,
      description: 'In pipeline',
      background: 'bg-[#F6AE66] dark:bg-[#D6994E]',
    },
    {
      name: 'In Process',
      value: '34',
      icon: Clock,
      change: '+8',
      changeType: 'positive' as const,
      description: 'Under review',
      background: 'bg-[#52CD75] dark:bg-[#3DB363]',
    },
    {
      name: 'Selected',
      value: '15',
      icon: UserCheck,
      change: '+3',
      changeType: 'positive' as const,
      description: 'This month',
      background: 'bg-[#52B1CD] dark:bg-[#3A8FA9]',
    },
    {
      name: 'Rejected',
      value: '28',
      icon: XCircle,
      change: '-5',
      changeType: 'negative' as const,
      description: 'This month',
      background: 'bg-[#6E55CF] dark:bg-[#5A43B5]',
    },
  ];

  const upcomingInterviews = [
    {
      id: 1,
      candidate: 'Sarah Johnson',
      position: 'Senior Frontend Developer',
      client: 'TechCorp Inc.',
      type: 'AI Interview',
      date: '2024-03-20',
      time: '10:00 AM',
      status: 'Scheduled',
      avatar: '/images/avatars/sarah.jpg',
    },
    {
      id: 2,
      candidate: 'Michael Chen',
      position: 'Full Stack Engineer',
      client: 'InnovateTech',
      type: 'Manual Interview',
      date: '2024-03-20',
      time: '2:00 PM',
      status: 'Confirmed',
      avatar: '/images/avatars/michael.jpg',
    },
    {
      id: 3,
      candidate: 'Emily Rodriguez',
      position: 'UI/UX Designer',
      client: 'DesignHub',
      type: 'AI Interview',
      date: '2024-03-21',
      time: '11:00 AM',
      status: 'Pending Confirmation',
      avatar: '/images/avatars/emily.jpg',
    },
    {
      id: 4,
      candidate: 'David Kim',
      position: 'DevOps Engineer',
      client: 'CloudTech Solutions',
      type: 'Manual Interview',
      date: '2024-03-22',
      time: '3:00 PM',
      status: 'Scheduled',
      avatar: '/images/avatars/david.jpg',
    },
  ];

  const pendingApprovals = [
    {
      id: 1,
      candidate: 'Alex Thompson',
      type: 'Profile Approval',
      priority: 'High',
      submittedDate: '2024-03-18',
      daysWaiting: 2,
    },
    {
      id: 2,
      candidate: 'Lisa Wang',
      type: 'Background Check',
      priority: 'Medium',
      submittedDate: '2024-03-17',
      daysWaiting: 3,
    },
    {
      id: 3,
      candidate: 'Robert Brown',
      type: 'Profile Approval',
      priority: 'Low',
      submittedDate: '2024-03-16',
      daysWaiting: 4,
    },
  ];

  const aiAssessmentSummary = {
    totalCompleted: 67,
    pending: 15,
    passed: 52,
    failed: 15,
    averageScore: 78,
    completionRate: 82,
  };

  const getInterviewTypeIcon = (type: string) => {
    return type === 'AI Interview' ? (
      <Brain className="h-4 w-4 text-blue-500 dark:text-blue-400" />
    ) : (
      <Video className="h-4 w-4 text-green-500 dark:text-green-400" />
    );
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
      case 'confirmed':
        return 'default';
      case 'pending confirmation':
        return 'secondary';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Pipeline Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {pipelineStats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className={`${stat.background} border-0`}>
              <CardHeader className="flex flex-row items-center justify-between pb-1">
                <CardTitle className="text-sm font-medium text-white sm:text-base dark:text-white/90">
                  {stat.name}
                </CardTitle>
                <stat.icon className="h-8 w-8 stroke-1 text-white sm:h-9 sm:w-9 dark:text-white/90" />
              </CardHeader>
              <CardContent>
                <div className="pb-1 text-xl font-bold text-white opacity-80 sm:text-2xl">
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
                  <span className="text-xs text-white sm:text-sm dark:text-white/90">
                    {stat.description}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upcoming Interviews */}
        <Card className="bg-white lg:col-span-2 dark:bg-gray-900">
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl dark:text-white">
                <Calendar className="h-5 w-5" />
                Upcoming Interviews
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                className="w-full bg-[#6E55CF] text-white sm:w-auto dark:bg-[#5A43B5] dark:text-white"
              >
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingInterviews.map((interview) => (
                <div
                  key={interview.id}
                  className="flex flex-col items-start justify-between gap-4 rounded-lg border bg-gray-50 p-4 sm:flex-row sm:items-center dark:border-gray-700 dark:bg-gray-800/50"
                >
                  {/* Left - Candidate Info */}
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={interview.avatar}
                        alt={interview.candidate}
                      />
                      <AvatarFallback>
                        {interview.candidate
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <p className="font-medium dark:text-white">
                        {interview.candidate}
                      </p>
                      <p className="text-muted-foreground text-sm dark:text-gray-400">
                        {interview.position}
                      </p>
                      <p className="text-muted-foreground text-xs dark:text-gray-500">
                        {interview.client}
                      </p>
                    </div>
                  </div>

                  {/* Right - Interview Details + Status */}
                  <div className="flex w-full flex-col items-start justify-between gap-4 sm:w-[280px] sm:flex-row sm:items-center">
                    {/* Type + Date/Time */}
                    <div className="flex flex-col justify-center">
                      <div className="flex items-center gap-2">
                        {getInterviewTypeIcon(interview.type)}
                        <span className="text-sm font-medium dark:text-white">
                          {interview.type}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-sm dark:text-gray-400">
                        {interview.date} at {interview.time}
                      </p>
                    </div>

                    {/* Status */}
                    <div className="flex items-center">
                      <Badge
                        variant={getStatusBadgeVariant(interview.status) as any}
                        className="whitespace-nowrap"
                      >
                        {interview.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button
              className="mt-4 w-full bg-[#6E55CF] text-white hover:bg-[#5A43B5] dark:bg-[#5A43B5] dark:text-white dark:hover:bg-[#4A33A5]"
              variant="outline"
            >
              View All Interviews
            </Button>
          </CardContent>
        </Card>

        {/* AI Assessment Summary */}
        <Card className="bg-white dark:bg-gray-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl dark:text-white">
              <Brain className="h-5 w-5" />
              AI Assessment Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-xl font-bold text-green-600 sm:text-2xl dark:text-green-400">
                  {aiAssessmentSummary.totalCompleted}
                </div>
                <div className="text-muted-foreground text-xs dark:text-gray-400">
                  Completed
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-amber-600 sm:text-2xl dark:text-amber-400">
                  {aiAssessmentSummary.pending}
                </div>
                <div className="text-muted-foreground text-xs dark:text-gray-400">
                  Pending
                </div>
              </div>
            </div>

            <Separator className="dark:bg-gray-700" />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm dark:text-gray-400">
                  Pass Rate
                </span>
                <span className="text-sm font-medium dark:text-white">
                  {Math.round(
                    (aiAssessmentSummary.passed /
                      aiAssessmentSummary.totalCompleted) *
                      100
                  )}
                  %
                </span>
              </div>
              <Progress
                value={
                  (aiAssessmentSummary.passed /
                    aiAssessmentSummary.totalCompleted) *
                  100
                }
                className="h-2 dark:bg-gray-700"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm dark:text-gray-400">
                  Completion Rate
                </span>
                <span className="text-sm font-medium dark:text-white">
                  {aiAssessmentSummary.completionRate}%
                </span>
              </div>
              <Progress
                value={aiAssessmentSummary.completionRate}
                className="h-2 dark:bg-gray-700"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm dark:text-gray-400">
                Average Score
              </span>
              <span className="text-sm font-bold dark:text-white">
                {aiAssessmentSummary.averageScore}/100
              </span>
            </div>

            <Button
              className="w-full bg-[#52CD75] text-white hover:bg-[#3DB363] dark:bg-[#3DB363] dark:text-white dark:hover:bg-[#2D9F4F]"
              variant="outline"
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              View Detailed Report
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals */}
      <Card className="bg-white dark:bg-gray-900">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2 dark:text-white">
              <AlertCircle className="h-5 w-5" />
              Pending Approvals & Actions
            </CardTitle>
            <Badge
              variant="destructive"
              className="w-fit rounded-md bg-red-400 text-xs dark:bg-red-500"
            >
              {pendingApprovals.length} Pending
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="min-w-[600px] sm:min-w-full">
              <TableHeader>
                <TableRow className="hover:bg-transparent dark:hover:bg-transparent">
                  <TableHead className="dark:text-gray-300">
                    Candidate
                  </TableHead>
                  <TableHead className="dark:text-gray-300">Type</TableHead>
                  <TableHead className="hidden sm:table-cell dark:text-gray-300">
                    Priority
                  </TableHead>
                  <TableHead className="hidden md:table-cell dark:text-gray-300">
                    Submitted
                  </TableHead>
                  <TableHead className="dark:text-gray-300">Waiting</TableHead>
                  <TableHead className="w-[160px] text-right dark:text-gray-300">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingApprovals.map((approval) => (
                  <TableRow key={approval.id} className="dark:border-gray-700">
                    <TableCell className="font-medium dark:text-white">
                      {approval.candidate}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="text-muted-foreground h-4 w-4 dark:text-gray-400" />
                        <span className="dark:text-white">{approval.type}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge
                        variant={
                          getPriorityBadgeVariant(approval.priority) as any
                        }
                      >
                        {approval.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden md:table-cell dark:text-gray-400">
                      {approval.submittedDate}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          'font-medium',
                          approval.daysWaiting > 3
                            ? 'text-red-600 dark:text-red-400'
                            : approval.daysWaiting > 1
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-green-600 dark:text-green-400'
                        )}
                      >
                        {approval.daysWaiting} days
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          className="bg-[#52CD75] text-white hover:bg-[#3DB363] dark:bg-[#3DB363] dark:text-white dark:hover:bg-[#2D9F4F]"
                          variant="outline"
                        >
                          <CheckCircle className="mr-1 h-3 w-3" />
                          <span className="hidden sm:inline">Approve</span>
                          <span className="sm:hidden">Approve</span>
                        </Button>
                        <Button
                          size="sm"
                          className="bg-[#6E55CF] text-white hover:bg-[#5A43B5] dark:bg-[#5A43B5] dark:text-white dark:hover:bg-[#4A33A5]"
                          variant="outline"
                        >
                          <MessageSquare className="mr-1 h-3 w-3" />
                          <span className="hidden sm:inline">Review</span>
                          <span className="sm:hidden">Review</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

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
  Briefcase,
  Target,
  Brain,
  Calendar,
  MapPin,
  Building2,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Filter,
  Search,
  Plus,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export const RecruiterDashboard = () => {
  // Mock data - replace with actual API calls
  const recruiterStats = [
    {
      name: 'New Job Requests',
      value: '8',
      icon: Briefcase,
      change: '+3',
      changeType: 'positive' as const,
      description: 'This week',
      background: 'bg-[#F6AE66] dark:bg-[#D6994E]',
    },
    {
      name: 'Assigned Candidates',
      value: '42',
      icon: Users,
      change: '+12',
      changeType: 'positive' as const,
      description: 'Active assignments',
      background: 'bg-[#52CD75] dark:bg-[#3DB363]',
    },
    {
      name: 'AI Matches',
      value: '156',
      icon: Brain,
      change: '+28',
      changeType: 'positive' as const,
      description: 'New recommendations',
      background: 'bg-[#52B1CD] dark:bg-[#3A8FA9]',
    },
    {
      name: 'Pending Interviews',
      value: '12',
      icon: Calendar,
      change: '+4',
      changeType: 'positive' as const,
      description: 'To schedule',
      background: 'bg-[#6E55CF] dark:bg-[#5A43B5]',
    },
  ];

  const newJobRequests = [
    {
      id: 1,
      title: 'Senior React Developer',
      client: 'TechCorp Inc.',
      location: 'San Francisco, CA',
      salary: '$120k - $150k',
      urgency: 'High',
      posted: '2 hours ago',
      requirements: ['React', 'TypeScript', 'Node.js'],
    },
    {
      id: 2,
      title: 'Full Stack Engineer',
      client: 'StartupX',
      location: 'Remote',
      salary: '$100k - $130k',
      urgency: 'Medium',
      posted: '5 hours ago',
      requirements: ['Python', 'Django', 'PostgreSQL'],
    },
    {
      id: 3,
      title: 'DevOps Engineer',
      client: 'CloudTech Solutions',
      location: 'New York, NY',
      salary: '$110k - $140k',
      urgency: 'Low',
      posted: '1 day ago',
      requirements: ['AWS', 'Docker', 'Kubernetes'],
    },
  ];

  const aiRecommendations = [
    {
      id: 1,
      candidate: 'Sarah Johnson',
      position: 'Senior React Developer',
      client: 'TechCorp Inc.',
      matchScore: 95,
      skills: ['React', 'TypeScript', 'Node.js'],
      experience: '5 years',
      location: 'San Francisco, CA',
      avatar: '/images/avatars/sarah.jpg',
    },
    {
      id: 2,
      candidate: 'Michael Chen',
      position: 'Full Stack Engineer',
      client: 'StartupX',
      matchScore: 88,
      skills: ['Python', 'Django', 'React'],
      experience: '4 years',
      location: 'Remote',
      avatar: '/images/avatars/michael.jpg',
    },
    {
      id: 3,
      candidate: 'Emily Rodriguez',
      position: 'DevOps Engineer',
      client: 'CloudTech Solutions',
      matchScore: 82,
      skills: ['AWS', 'Docker', 'Terraform'],
      experience: '6 years',
      location: 'New York, NY',
      avatar: '/images/avatars/emily.jpg',
    },
  ];

  const shortlistSummary = {
    totalShortlisted: 34,
    pending: 8,
    approved: 18,
    rejected: 8,
    pendingClient: 12,
  };

  const getUrgencyBadgeVariant = (urgency: string) => {
    switch (urgency.toLowerCase()) {
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

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 80) return 'text-blue-600 dark:text-blue-400';
    if (score >= 70) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getMatchScoreBg = (score: number) => {
    if (score >= 90) return 'bg-green-100 dark:bg-green-900/50';
    if (score >= 80) return 'bg-blue-100 dark:bg-blue-900/50';
    if (score >= 70) return 'bg-amber-100 dark:bg-amber-900/50';
    return 'bg-red-100 dark:bg-red-900/50';
  };

  return (
    <div className="space-y-6">
      {/* Recruiter Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {recruiterStats.map((stat, index) => (
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
                <stat.icon className="h-7 w-7 stroke-1 text-white sm:h-9 sm:w-9 dark:text-white/90" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-white opacity-80 sm:text-2xl">
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
        {/* New Job Requests */}
        <Card className="bg-white lg:col-span-2 dark:bg-gray-900">
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl dark:text-white">
                <Briefcase className="h-5 w-5" />
                New Job Requests
              </CardTitle>
              <Button
                variant="outline"
                className="w-full bg-[#6E55CF] text-white sm:w-auto dark:bg-[#5A43B5] dark:text-white"
                size="sm"
              >
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {newJobRequests.map((job) => (
                <div
                  key={job.id}
                  className="hover:bg-muted/50 rounded-lg border bg-gray-50 p-4 transition-colors dark:border-gray-700 dark:bg-gray-800/50"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <h4 className="font-medium dark:text-white">
                          {job.title}
                        </h4>
                        <Badge
                          variant={getUrgencyBadgeVariant(job.urgency) as any}
                          className="w-fit text-xs"
                        >
                          {job.urgency}
                        </Badge>
                      </div>
                      <div className="text-muted-foreground flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:gap-4">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {job.client}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {job.salary}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {job.requirements.map((req) => (
                          <Badge
                            key={req}
                            variant="outline"
                            className="text-xs dark:border-gray-600"
                          >
                            {req}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-muted-foreground text-xs dark:text-gray-400">
                        Posted {job.posted}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button
                        size="sm"
                        variant="outline"
                        className="dark:border-gray-600 dark:text-white"
                      >
                        <Search className="mr-1 h-3 w-3" />
                        <span className="hidden sm:inline">Find</span>
                        <span className="sm:hidden">Find Candidates</span>
                      </Button>
                      <Button
                        size="sm"
                        className="dark:bg-[#5A43B5] dark:hover:bg-[#4A33A5]"
                      >
                        <Plus className="mr-1 h-3 w-3" />
                        <span className="hidden sm:inline">Accept</span>
                        <span className="sm:hidden">Accept</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button
              className="mt-4 w-full bg-[#6E55CF] text-white hover:bg-[#5A43B5] dark:bg-[#5A43B5] dark:text-white dark:hover:bg-[#4A33A5]"
              variant="outline"
            >
              View All Job Requests
            </Button>
          </CardContent>
        </Card>

        {/* Shortlist Summary */}
        <Card className="bg-white dark:bg-gray-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl dark:text-white">
              <Target className="h-5 w-5" />
              Shortlist Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600 sm:text-2xl dark:text-blue-400">
                  {shortlistSummary.totalShortlisted}
                </div>
                <div className="text-muted-foreground text-xs dark:text-gray-400">
                  Total
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-amber-600 sm:text-2xl dark:text-amber-400">
                  {shortlistSummary.pending}
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
                  Approved
                </span>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />
                  <span className="text-sm font-medium dark:text-white">
                    {shortlistSummary.approved}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm dark:text-gray-400">
                  Rejected
                </span>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500 dark:text-red-400" />
                  <span className="text-sm font-medium dark:text-white">
                    {shortlistSummary.rejected}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm dark:text-gray-400">
                  Client Review
                </span>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                  <span className="text-sm font-medium dark:text-white">
                    {shortlistSummary.pendingClient}
                  </span>
                </div>
              </div>
            </div>

            <Separator className="dark:bg-gray-700" />

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground dark:text-gray-400">
                  Success Rate
                </span>
                <span className="font-medium dark:text-white">
                  {Math.round(
                    (shortlistSummary.approved /
                      shortlistSummary.totalShortlisted) *
                      100
                  )}
                  %
                </span>
              </div>
              <Progress
                value={
                  (shortlistSummary.approved /
                    shortlistSummary.totalShortlisted) *
                  100
                }
                className="h-2 dark:bg-gray-700"
              />
            </div>

            <Button
              className="w-full bg-[#52CD75] text-white hover:bg-[#3DB363] dark:bg-[#3DB363] dark:text-white dark:hover:bg-[#2D9F4F]"
              variant="outline"
            >
              <Target className="mr-2 h-4 w-4" />
              Manage Shortlists
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations */}
      <Card className="bg-white dark:bg-gray-900">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2 dark:text-white">
              <Brain className="h-5 w-5" />
              AI Candidate Recommendations
            </CardTitle>
            <Badge variant="secondary" className="w-fit text-xs">
              {aiRecommendations.length} New Matches
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="min-w-[600px] sm:min-w-full">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="dark:text-gray-300">
                    Candidate
                  </TableHead>
                  <TableHead className="dark:text-gray-300">Position</TableHead>
                  <TableHead className="hidden sm:table-cell dark:text-gray-300">
                    Client
                  </TableHead>
                  <TableHead className="dark:text-gray-300">Match</TableHead>
                  <TableHead className="hidden md:table-cell dark:text-gray-300">
                    Skills
                  </TableHead>
                  <TableHead className="hidden lg:table-cell dark:text-gray-300">
                    Experience
                  </TableHead>
                  <TableHead className="dark:text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {aiRecommendations.map((rec) => (
                  <TableRow key={rec.id} className="dark:border-gray-700">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={rec.avatar} alt={rec.candidate} />
                          <AvatarFallback>
                            {rec.candidate
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium dark:text-white">
                            {rec.candidate}
                          </p>
                          <p className="text-muted-foreground text-xs dark:text-gray-400">
                            {rec.location}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium dark:text-white">
                      <span className="line-clamp-1">{rec.position}</span>
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden sm:table-cell dark:text-gray-400">
                      {rec.client}
                    </TableCell>
                    <TableCell>
                      <div
                        className={cn(
                          'inline-flex h-8 w-12 items-center justify-center rounded-full text-xs font-bold',
                          getMatchScoreBg(rec.matchScore),
                          getMatchScoreColor(rec.matchScore)
                        )}
                      >
                        {rec.matchScore}%
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {rec.skills.slice(0, 2).map((skill) => (
                          <Badge
                            key={skill}
                            variant="outline"
                            className="text-xs dark:border-gray-600"
                          >
                            {skill}
                          </Badge>
                        ))}
                        {rec.skills.length > 2 && (
                          <Badge
                            variant="outline"
                            className="text-xs dark:border-gray-600"
                          >
                            +{rec.skills.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden lg:table-cell dark:text-gray-400">
                      {rec.experience}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-[#52CD75] text-white hover:bg-[#3DB363] dark:bg-[#3DB363] dark:text-white dark:hover:bg-[#2D9F4F]"
                          variant="outline"
                        >
                          <span className="hidden sm:inline">View</span>
                          <span className="sm:hidden">View</span>
                        </Button>
                        <Button
                          size="sm"
                          className="dark:bg-[#5A43B5] dark:text-white dark:hover:bg-[#4A33A5]"
                        >
                          <ArrowRight className="h-3 w-3" />
                          <span className="ml-1 hidden sm:inline">
                            Shortlist
                          </span>
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

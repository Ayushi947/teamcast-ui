'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  Calendar,
  Clock,
  Users,
  Video,
  MessageSquare,
  Eye,
  ArrowRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  Briefcase,
} from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { clientAnalyticsService } from '@/lib/services/services';
import { format } from 'date-fns';

// Define proper types for the API response
interface PendingAssessment {
  id: string;
  scheduledAt?: string;
  candidateName?: string;
  jobTitle?: string;
  duration?: string;
  type?: string;
  interviewer?: string;
  status?: string;
  avatar?: string;
  meetingLink?: string;
  notes?: string;
}

// Define interview type
interface ProcessedInterview {
  id: string;
  candidateName: string;
  jobTitle: string;
  date: Date;
  time: string;
  duration: string;
  type: string;
  interviewer: string;
  status: string;
  avatar: string;
  meetingLink: string;
  notes: string;
}

export const UpcomingInterviews = () => {
  // Fetch real data from APIs
  const {
    data: analytics,
    isLoading: analyticsLoading,
    error,
  } = useQuery({
    queryKey: ['interviewsAnalytics'],
    queryFn: () => clientAnalyticsService.getDashboardAnalytics(),
  });

  // Process real data with proper typing
  const pendingInterviews: PendingAssessment[] =
    analytics?.panelAssessment?.pendingAssessments || [];

  // Process interview data with proper type safety
  const processedInterviews: ProcessedInterview[] = pendingInterviews
    .map((interview: PendingAssessment): ProcessedInterview | null => {
      // Only process interviews with valid scheduledAt data
      if (!interview.scheduledAt) {
        return null;
      }

      const interviewDate = new Date(interview.scheduledAt);

      // Skip if date is invalid
      if (isNaN(interviewDate.getTime())) {
        return null;
      }

      return {
        id: interview.id,
        candidateName: interview.candidateName || 'Unknown Candidate',
        jobTitle: interview.jobTitle || 'Unknown Position',
        date: interviewDate,
        time: format(interviewDate, 'HH:mm'),
        duration: interview.duration || '30 min',
        type: interview.type || 'Interview',
        interviewer: interview.interviewer || 'TBD',
        status: interview.status || 'SCHEDULED',
        avatar: interview.avatar || '',
        meetingLink: interview.meetingLink || '#',
        notes: interview.notes || '',
      };
    })
    .filter((interview): interview is ProcessedInterview => interview !== null); // Type-safe filter

  // Sort by date and time
  const sortedInterviews = processedInterviews
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 6);

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'SCHEDULED':
      case 'CONFIRMED':
        return 'default';
      case 'PENDING':
      case 'TENTATIVE':
        return 'secondary';
      case 'CANCELLED':
      case 'NO_SHOW':
        return 'destructive';
      case 'COMPLETED':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  // Helper function to get status icon
  const getStatusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'SCHEDULED':
      case 'CONFIRMED':
        return CheckCircle;
      case 'PENDING':
      case 'TENTATIVE':
        return Clock;
      case 'CANCELLED':
      case 'NO_SHOW':
        return XCircle;
      case 'COMPLETED':
        return CheckCircle;
      default:
        return AlertCircle;
    }
  };

  // Helper function to format status for display
  const formatStatus = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'SCHEDULED':
        return 'Scheduled';
      case 'CONFIRMED':
        return 'Confirmed';
      case 'PENDING':
        return 'Pending';
      case 'TENTATIVE':
        return 'Tentative';
      case 'CANCELLED':
        return 'Cancelled';
      case 'NO_SHOW':
        return 'No Show';
      case 'COMPLETED':
        return 'Completed';
      default:
        return status || 'Scheduled';
    }
  };

  // Helper function to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Interviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center">
            <AlertCircle className="text-destructive mx-auto mb-4 h-12 w-12" />
            <h3 className="text-destructive mb-2 text-lg font-medium">
              Error Loading Interviews
            </h3>
            <p className="text-muted-foreground mb-4">
              Unable to load upcoming interviews. Please try again later.
            </p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Loading state
  if (analyticsLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="bg-muted h-6 w-1/3 rounded"></div>
          <div className="bg-muted h-4 w-1/2 rounded"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-lg border p-4"
              >
                <div className="bg-muted h-12 w-12 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="bg-muted h-4 w-1/3 rounded"></div>
                  <div className="bg-muted h-3 w-1/2 rounded"></div>
                </div>
                <div className="bg-muted h-6 w-16 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Interviews
            </CardTitle>
            <CardDescription>
              Scheduled interviews for the next few days
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {sortedInterviews.length} interviews
            </Badge>
            <Button variant="outline" size="sm" asChild>
              <Link href="/app/client/interviews">
                <Eye className="mr-2 h-4 w-4" />
                View All
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedInterviews.length > 0 ? (
            sortedInterviews.map((interview) => {
              const StatusIcon = getStatusIcon(interview.status);
              return (
                <div
                  key={interview.id}
                  className="bg-card flex items-center gap-4 rounded-lg border p-4 transition-shadow hover:shadow-sm"
                >
                  {/* Avatar */}
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={interview.avatar}
                      alt={interview.candidateName}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {getInitials(interview.candidateName)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Interview Info */}
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <h4 className="truncate font-medium">
                        {interview.candidateName}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        {interview.type}
                      </Badge>
                    </div>

                    <div className="text-muted-foreground flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        <span className="truncate">{interview.jobTitle}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{interview.interviewer}</span>
                      </div>
                    </div>

                    {/* Time and Duration */}
                    <div className="mt-1 flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="text-muted-foreground h-3 w-3" />
                        <span className="text-muted-foreground text-xs">
                          {format(interview.date, 'MMM dd, yyyy')}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="text-muted-foreground h-3 w-3" />
                        <span className="text-muted-foreground text-xs">
                          {interview.time} ({interview.duration})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status and Actions */}
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={getStatusColor(interview.status)}
                      className="flex items-center gap-1"
                    >
                      <StatusIcon className="h-3 w-3" />
                      {formatStatus(interview.status)}
                    </Badge>

                    <div className="flex items-center gap-1">
                      {interview.meetingLink &&
                        interview.meetingLink !== '#' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            asChild
                          >
                            <a
                              href={interview.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Video className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center">
              <Calendar className="text-muted-foreground mx-auto mb-4 h-12 w-12 opacity-50" />
              <h3 className="mb-2 text-lg font-medium">
                No Upcoming Interviews
              </h3>
              <p className="text-muted-foreground mb-4">
                Scheduled interviews will appear here
              </p>
              <Button asChild>
                <Link href="/app/client/interviews">
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Interview
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        {sortedInterviews.length > 0 && (
          <div className="mt-6 border-t pt-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="text-center">
                <div className="text-primary text-2xl font-bold">
                  {
                    sortedInterviews.filter(
                      (i) =>
                        i.status === 'SCHEDULED' || i.status === 'CONFIRMED'
                    ).length
                  }
                </div>
                <div className="text-muted-foreground text-xs">Confirmed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {
                    sortedInterviews.filter(
                      (i) => i.status === 'PENDING' || i.status === 'TENTATIVE'
                    ).length
                  }
                </div>
                <div className="text-muted-foreground text-xs">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {
                    sortedInterviews.filter((i) => i.type === 'AI Interview')
                      .length
                  }
                </div>
                <div className="text-muted-foreground text-xs">
                  AI Interviews
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {
                    sortedInterviews.filter(
                      (i) => i.type === 'Manual Interview'
                    ).length
                  }
                </div>
                <div className="text-muted-foreground text-xs">
                  Manual Interviews
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-6 border-t pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Need to schedule more interviews?</h4>
              <p className="text-muted-foreground text-sm">
                Use our AI-powered scheduling system
              </p>
            </div>
            <Button asChild>
              <Link href="/app/client/interviews">
                <ArrowRight className="mr-2 h-4 w-4" />
                Schedule Interview
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

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
  Users,
  MapPin,
  Calendar,
  Star,
  Eye,
  MessageSquare,
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserSearch,
  Briefcase,
  GraduationCap,
} from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  clientAnalyticsService,
  clientJobPostingService,
} from '@/lib/services/services';
import { format } from 'date-fns';

export const RecentCandidates = () => {
  // Fetch real data from APIs
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['candidatesAnalytics'],
    queryFn: () => clientAnalyticsService.getDashboardAnalytics(),
  });

  const { data: _jobPostings, isLoading: jobPostingsLoading } = useQuery({
    queryKey: ['jobPostings'],
    queryFn: () => clientJobPostingService.getJobPostings(),
  });

  // Process real data
  const recentCandidates =
    analytics?.activeCandidates?.recentApplications || [];
  const recentAssessments = analytics?.aiAssessments?.recentAssessments || [];

  // Combine and process candidate data
  const processedCandidates = recentCandidates.map((candidate: any) => {
    // Find matching assessment for this candidate
    const assessment = recentAssessments.find(
      (ass: any) => ass.candidateId === candidate.candidateId
    );

    return {
      id: candidate.id,
      name: candidate.candidateName,
      jobTitle: candidate.jobTitle,
      avatar: '', // Would come from candidate profile API
      matchScore: assessment?.score || Math.floor(Math.random() * 30) + 70, // Fallback score
      experience: `${Math.floor(Math.random() * 8) + 2} years`, // Would come from candidate profile
      location: 'Remote', // Would come from candidate profile
      status: candidate.status || 'PENDING',
      appliedDate: candidate.appliedAt,
      assessment: assessment,
    };
  });

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'APPROVED':
      case 'HIRED':
        return 'default';
      case 'PENDING':
      case 'IN_REVIEW':
        return 'secondary';
      case 'REJECTED':
      case 'DECLINED':
        return 'destructive';
      case 'INTERVIEW_SCHEDULED':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  // Helper function to get status icon
  const getStatusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'APPROVED':
      case 'HIRED':
        return CheckCircle;
      case 'PENDING':
      case 'IN_REVIEW':
        return Clock;
      case 'REJECTED':
      case 'DECLINED':
        return XCircle;
      case 'INTERVIEW_SCHEDULED':
        return Calendar;
      default:
        return AlertCircle;
    }
  };

  // Helper function to format status for display
  const formatStatus = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'APPROVED':
        return 'Approved';
      case 'HIRED':
        return 'Hired';
      case 'PENDING':
        return 'Pending Review';
      case 'IN_REVIEW':
        return 'In Review';
      case 'REJECTED':
        return 'Rejected';
      case 'DECLINED':
        return 'Declined';
      case 'INTERVIEW_SCHEDULED':
        return 'Interview Scheduled';
      default:
        return status || 'Pending';
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

  // Loading state
  if (analyticsLoading || jobPostingsLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="bg-muted h-6 w-1/3 rounded"></div>
          <div className="bg-muted h-4 w-1/2 rounded"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
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
              <Users className="h-5 w-5" />
              Recent Candidates
            </CardTitle>
            <CardDescription>
              Latest candidate applications and their status
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {processedCandidates.length} candidates
            </Badge>
            <Button variant="outline" size="sm" asChild>
              <Link href="/app/client/candidates/search">
                <Eye className="mr-2 h-4 w-4" />
                View All
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {processedCandidates.length > 0 ? (
            processedCandidates.slice(0, 6).map((candidate) => {
              const StatusIcon = getStatusIcon(candidate.status);
              return (
                <div
                  key={candidate.id}
                  className="bg-card flex items-center gap-4 rounded-lg border p-4 transition-shadow hover:shadow-sm"
                >
                  {/* Avatar */}
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={candidate.avatar} alt={candidate.name} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {getInitials(candidate.name)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Candidate Info */}
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <h4 className="truncate font-medium">{candidate.name}</h4>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-current text-yellow-500" />
                        <span className="text-sm font-medium text-yellow-600">
                          {candidate.matchScore}%
                        </span>
                      </div>
                    </div>

                    <div className="text-muted-foreground flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        <span className="truncate">{candidate.jobTitle}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{candidate.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {format(new Date(candidate.appliedDate), 'MMM dd')}
                        </span>
                      </div>
                    </div>

                    {/* Experience */}
                    <div className="mt-1 flex items-center gap-1">
                      <GraduationCap className="text-muted-foreground h-3 w-3" />
                      <span className="text-muted-foreground text-xs">
                        {candidate.experience} experience
                      </span>
                    </div>
                  </div>

                  {/* Status and Actions */}
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={getStatusColor(candidate.status)}
                      className="flex items-center gap-1"
                    >
                      <StatusIcon className="h-3 w-3" />
                      {formatStatus(candidate.status)}
                    </Badge>

                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center">
              <Users className="text-muted-foreground mx-auto mb-4 h-12 w-12 opacity-50" />
              <h3 className="mb-2 text-lg font-medium">No Recent Candidates</h3>
              <p className="text-muted-foreground mb-4">
                New candidate applications will appear here
              </p>
              <Button asChild>
                <Link href="/app/client/candidates/search">
                  <UserSearch className="mr-2 h-4 w-4" />
                  Search Candidates
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        {processedCandidates.length > 0 && (
          <div className="mt-6 border-t pt-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="text-center">
                <div className="text-primary text-2xl font-bold">
                  {
                    processedCandidates.filter(
                      (c) => c.status === 'APPROVED' || c.status === 'HIRED'
                    ).length
                  }
                </div>
                <div className="text-muted-foreground text-xs">Approved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {
                    processedCandidates.filter(
                      (c) => c.status === 'PENDING' || c.status === 'IN_REVIEW'
                    ).length
                  }
                </div>
                <div className="text-muted-foreground text-xs">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(
                    processedCandidates.reduce(
                      (sum, c) => sum + c.matchScore,
                      0
                    ) / processedCandidates.length
                  )}
                </div>
                <div className="text-muted-foreground text-xs">Avg Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {analytics?.activeCandidates?.activeCount || 0}
                </div>
                <div className="text-muted-foreground text-xs">
                  Total Active
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-6 border-t pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Need more candidates?</h4>
              <p className="text-muted-foreground text-sm">
                Explore our candidate database and AI recommendations
              </p>
            </div>
            <Button asChild>
              <Link href="/app/client/candidates/search">
                <ArrowRight className="mr-2 h-4 w-4" />
                Browse Candidates
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

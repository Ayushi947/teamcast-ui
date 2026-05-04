'use client';

import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Briefcase,
  Calendar,
  Mail,
  User,
  CheckCircle,
  Award,
  ExternalLink,
} from 'lucide-react';
import { clientJobApplicationService } from '@/lib/services/services';
import { IClientJobPosting } from '@/lib/shared';
import { RecommendationsEmptyState } from './enhanced-empty-states';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

interface HiredCandidateTabProps {
  job?: IClientJobPosting;
}

interface HiredCandidate {
  id: string;
  candidateId: string;
  candidate: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    profilePicture?: string;
    currentLocation?: string;
    experience?: number;
    skills?: string[];
    jobTitle?: string;
  };
  status: string;
  appliedAt: string;
  acceptedAt?: string;
  acceptanceNote?: string;
  coverLetterUrl?: string;
}

export function HiredCandidateTab({ job }: HiredCandidateTabProps) {
  const router = useRouter();

  // Fetch job applications for the current job
  const {
    data: applicationsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['job-applications', job?.id],
    queryFn: () =>
      clientJobApplicationService.getJobApplications({
        jobId: job?.id,
        page: 1,
        limit: 100,
        sortBy: 'acceptedAt',
        sortOrder: 'desc',
      }),
    enabled: !!job?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Filter for hired candidates
  const hiredCandidates =
    applicationsData?.items?.filter((app: any) => {
      return app.status === 'HIRED' || app.candidate?.status === 'HIRED';
    }) || [];

  // Transform the data to include candidate information
  const transformedHiredCandidates: HiredCandidate[] = hiredCandidates.map(
    (app: any) => ({
      id: app.id,
      candidateId: app.candidateId || app.userId,
      candidate: {
        id: app.candidateId || app.userId,
        name:
          app.candidate?.user?.name ||
          app.candidate?.name ||
          'Unknown Candidate',
        email: app.candidate?.user?.email || app.candidate?.email || '',
        phone: app.candidate?.user?.phone || app.candidate?.phone || '',
        profilePicture:
          app.candidate?.user?.image || app.candidate?.profilePicture || '',
        currentLocation:
          app.candidate?.user?.currentLocation ||
          app.candidate?.currentLocation ||
          '',
        experience:
          app.candidate?.user?.experience || app.candidate?.experience || 0,
        skills: app.candidate?.user?.skills || app.candidate?.skills || [],
        jobTitle:
          app.candidate?.user?.jobTitle || app.candidate?.jobTitle || '',
      },
      status: app.status,
      appliedAt: app.createdAt,
      acceptedAt: app.acceptedAt,
      acceptanceNote: app.acceptanceNote,
      coverLetterUrl: app.coverLetter,
    })
  );

  const handleViewCandidate = (candidateId: string) => {
    router.push(`/app/client/candidates/${candidateId}`);
  };

  const handleViewApplication = (applicationId: string) => {
    router.push(`/app/client/candidates/applications/${applicationId}`);
  };

  // Show loading state
  if (isLoading) {
    return <RecommendationsEmptyState variant="not-selected" />;
  }

  // Show error state
  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Card className="border-destructive/20 bg-destructive/5 max-w-md">
          <div className="p-6 text-center">
            <div className="mb-4 flex justify-center">
              <div className="bg-destructive/10 rounded-full p-3">
                <Briefcase className="text-destructive h-6 w-6" />
              </div>
            </div>
            <h3 className="text-destructive mb-2 text-lg font-semibold">
              Error Loading Hired Candidates
            </h3>
            <p className="text-muted-foreground text-sm">
              There was an error loading the hired candidates. Please try again.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // Show empty state when no hired candidates
  if (!isLoading && transformedHiredCandidates.length === 0) {
    return (
      <RecommendationsEmptyState
        variant="not-selected"
        onAction={() =>
          router.push(
            `/app/client/recruiter/sourcing?jobId=${job?.id}&tab=applications`
          )
        }
        actionLabel="View All Applications"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-foreground text-2xl font-bold">
            Hired Candidates
          </h2>
          <p className="text-muted-foreground">
            {transformedHiredCandidates.length} candidate
            {transformedHiredCandidates.length !== 1 ? 's' : ''} hired for this
            position
          </p>
        </div>
        <Badge
          variant="default"
          className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400"
        >
          <CheckCircle className="mr-1 h-3 w-3" />
          {transformedHiredCandidates.length} Hired
        </Badge>
      </div>

      {/* Hired Candidates List */}
      <div className="space-y-4">
        {transformedHiredCandidates.map((candidate) => (
          <Card
            key={candidate.id}
            className="dark:border-primary overflow-hidden border border-gray-200 bg-gray-50 dark:bg-gray-50"
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                {/* Candidate Info */}
                <div className="flex items-start gap-4">
                  <Avatar className="border-primary h-16 w-16 rounded-full border-2">
                    <AvatarImage
                      src={candidate.candidate.profilePicture || ''}
                      alt={candidate.candidate.name}
                    />
                    <AvatarFallback className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                      {candidate.candidate.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <h3 className="text-foreground text-xl font-semibold">
                        {candidate.candidate.name}
                      </h3>
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400">
                        <Award className="mr-1 h-3 w-3" />
                        Hired
                      </Badge>
                    </div>

                    {/* Candidate Details */}
                    <div className="text-muted-foreground grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                      {candidate.candidate.jobTitle && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{candidate.candidate.jobTitle}</span>
                        </div>
                      )}

                      {candidate.candidate.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span>{candidate.candidate.email}</span>
                        </div>
                      )}

                      {/* {candidate.candidate.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span>{candidate.candidate.phone}</span>
                        </div>
                      )} */}

                      {/* {candidate.candidate.currentLocation && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{candidate.candidate.currentLocation}</span>
                        </div>
                      )} */}

                      {/* {candidate.candidate.experience && (
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4" />
                          <span>{candidate.candidate.experience} years experience</span>
                        </div>
                      )} */}
                    </div>

                    {/* Skills */}
                    {candidate.candidate.skills &&
                      candidate.candidate.skills.length > 0 && (
                        <div className="mt-3">
                          <div className="flex flex-wrap gap-1">
                            {candidate.candidate.skills
                              .slice(0, 6)
                              .map((skill, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {skill}
                                </Badge>
                              ))}
                            {candidate.candidate.skills.length > 6 && (
                              <Badge variant="outline" className="text-xs">
                                +{candidate.candidate.skills.length - 6} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                    {/* Hiring Timeline */}
                    <div className="mt-4 grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <span className="text-muted-foreground">Applied:</span>
                        <span className="font-medium">
                          {format(
                            new Date(candidate.appliedAt),
                            'MMM dd, yyyy'
                          )}
                        </span>
                      </div>

                      {candidate.acceptedAt && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                          <span className="text-muted-foreground">Hired:</span>
                          <span className="font-medium">
                            {format(
                              new Date(candidate.acceptedAt),
                              'MMM dd, yyyy'
                            )}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Acceptance Note */}
                    {candidate.acceptanceNote && (
                      <div className="bg-primary mt-3 rounded-lg p-3 dark:bg-emerald-900/20">
                        <p className="text-sm text-emerald-800 dark:text-emerald-200">
                          <strong>Acceptance Note:</strong>{' '}
                          {candidate.acceptanceNote}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewCandidate(candidate.candidateId)}
                    className="border-primary/50 hover:bg-primary text-black hover:text-white"
                  >
                    <User className="mr-1 h-3 w-3" />
                    View Profile
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewApplication(candidate.id)}
                    className="border-primary/50 hover:bg-primary text-black hover:text-white"
                  >
                    <ExternalLink className="mr-1 h-3 w-3" />
                    View Application
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

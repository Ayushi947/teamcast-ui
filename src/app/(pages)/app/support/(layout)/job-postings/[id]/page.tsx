'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Users,
  Calendar,
  TrendingUp,
  FileText,
  Building,
  DollarSign,
  Clock,
  Award,
  Target,
} from 'lucide-react';
import { useApp } from '@/lib/context/app-context';
import { format } from 'date-fns';
import Link from 'next/link';
import { useParams } from 'next/navigation';

// Services
import { supportJobPostingService } from '@/lib/services/services';

// Types
import {
  JobPostingStatusEnum,
  WorkTypeEnum,
  WorkCommitmentEnum,
} from '@/lib/shared/models/common/enums';

export default function SupportJobDetailsPage() {
  useApp();
  const params = useParams();
  const jobId = params.id as string;

  // Fetch job postings to find the specific job
  const { data: jobPostingsResponse, isLoading } = useQuery({
    queryKey: ['supportJobPostings'],
    queryFn: () => supportJobPostingService.getJobPostingsByAccountManagerId(),
  });

  const jobPostings = jobPostingsResponse?.jobPostings || [];
  const job = jobPostings.find((j: any) => j.id === jobId);

  const getStatusBadge = (status: JobPostingStatusEnum) => {
    const variants = {
      [JobPostingStatusEnum.PUBLISHED]: 'default',
      [JobPostingStatusEnum.DRAFT]: 'secondary',
      [JobPostingStatusEnum.CLOSED]: 'destructive',
      [JobPostingStatusEnum.ARCHIVED]: 'outline',
    } as const;

    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const getWorkTypeBadge = (type: WorkTypeEnum) => {
    return <Badge variant="outline">{type}</Badge>;
  };

  const getCommitmentBadge = (commitment: WorkCommitmentEnum) => {
    return <Badge variant="secondary">{commitment}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Skeleton className="h-32" />
            <Skeleton className="h-64" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="space-y-6 p-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/app/support/job-postings">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Job Postings
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="py-8 text-center">
            <FileText className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
              Job not found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              The job posting you&apos;re looking for doesn&apos;t exist or you
              don&apos;t have access to it.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" asChild>
          <Link href="/app/support/job-postings">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Job Postings
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Job Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <h1 className="text-2xl font-bold">{job.title}</h1>
                    {getStatusBadge(job.status)}
                  </div>
                  <div className="mb-4 flex items-center gap-2">
                    {getWorkTypeBadge(job.jobType)}
                    {getCommitmentBadge(job.jobCommitment)}
                  </div>
                  <p className="text-muted-foreground">{job.description}</p>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Job Details */}
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Building className="text-muted-foreground h-4 w-4" />
                    <span className="text-sm font-medium">Client ID:</span>
                    <span className="text-muted-foreground text-sm">
                      {job.clientId}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="text-muted-foreground h-4 w-4" />
                    <span className="text-sm font-medium">Department:</span>
                    <span className="text-muted-foreground text-sm">
                      {job.department || 'Not specified'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="text-muted-foreground h-4 w-4" />
                    <span className="text-sm font-medium">Team Size:</span>
                    <span className="text-muted-foreground text-sm">
                      {job.teamSize || 'Not specified'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="text-muted-foreground h-4 w-4" />
                    <span className="text-sm font-medium">Schedule:</span>
                    <span className="text-muted-foreground text-sm">
                      {job.jobSchedule || 'Not specified'}
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="text-muted-foreground h-4 w-4" />
                    <span className="text-sm font-medium">Experience:</span>
                    <span className="text-muted-foreground text-sm">
                      {job.totalExperience} years
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="text-muted-foreground h-4 w-4" />
                    <span className="text-sm font-medium">Openings:</span>
                    <span className="text-muted-foreground text-sm">
                      {job.numberOfOpenings}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="text-muted-foreground h-4 w-4" />
                    <span className="text-sm font-medium">Available From:</span>
                    <span className="text-muted-foreground text-sm">
                      {job.availableFrom
                        ? format(new Date(job.availableFrom), 'MMM dd, yyyy')
                        : 'Not specified'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="text-muted-foreground h-4 w-4" />
                    <span className="text-sm font-medium">Deadline:</span>
                    <span className="text-muted-foreground text-sm">
                      {job.applicationDeadline
                        ? format(
                            new Date(job.applicationDeadline),
                            'MMM dd, yyyy'
                          )
                        : 'Not specified'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Salary Information */}
              {(job.minSalary || job.maxSalary) && (
                <div className="border-t pt-6">
                  <h3 className="mb-4 text-lg font-medium">Compensation</h3>
                  <div className="flex items-center gap-2">
                    <DollarSign className="text-muted-foreground h-4 w-4" />
                    <span className="text-sm font-medium">Salary Range:</span>
                    <span className="text-muted-foreground text-sm">
                      {job.minSalary && job.maxSalary
                        ? `${job.minSalary.toLocaleString()} - ${job.maxSalary.toLocaleString()} ${job.salaryCurrency || 'USD'}`
                        : job.minSalary
                          ? `${job.minSalary.toLocaleString()} ${job.salaryCurrency || 'USD'}+`
                          : job.maxSalary
                            ? `Up to ${job.maxSalary.toLocaleString()} ${job.salaryCurrency || 'USD'}`
                            : 'Not specified'}
                    </span>
                  </div>
                  {job.equity && (
                    <div className="mt-2 flex items-center gap-2">
                      <Award className="text-muted-foreground h-4 w-4" />
                      <span className="text-sm font-medium">Equity:</span>
                      <span className="text-muted-foreground text-sm">
                        Included
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Skills */}
              {job.requiredSkills && job.requiredSkills.length > 0 && (
                <div className="border-t pt-6">
                  <h3 className="mb-4 text-lg font-medium">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.requiredSkills.map((skill: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {job.preferredSkills && job.preferredSkills.length > 0 && (
                <div className="border-t pt-6">
                  <h3 className="mb-4 text-lg font-medium">Preferred Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.preferredSkills.map((skill: string, index: number) => (
                      <Badge key={index} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Responsibilities */}
              {job.responsibilities && job.responsibilities.length > 0 && (
                <div className="border-t pt-6">
                  <h3 className="mb-4 text-lg font-medium">Responsibilities</h3>
                  <ul className="text-muted-foreground list-inside list-disc space-y-2 text-sm">
                    {job.responsibilities.map(
                      (responsibility: string, index: number) => (
                        <li key={index}>{responsibility}</li>
                      )
                    )}
                  </ul>
                </div>
              )}

              {/* Benefits */}
              {job.benefits && job.benefits.length > 0 && (
                <div className="border-t pt-6">
                  <h3 className="mb-4 text-lg font-medium">Benefits</h3>
                  <ul className="text-muted-foreground list-inside list-disc space-y-2 text-sm">
                    {job.benefits.map((benefit: string, index: number) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Job Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Job Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Views</span>
                <span className="text-muted-foreground text-sm">
                  {job.numberOfViews}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Applications</span>
                <span className="text-muted-foreground text-sm">
                  {job.numberOfApplications}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Featured</span>
                <span className="text-muted-foreground text-sm">
                  {job.isFeatured ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Remote</span>
                <span className="text-muted-foreground text-sm">
                  {job.isRemote ? 'Yes' : 'No'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Job Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Job Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Created</span>
                <span className="text-muted-foreground text-sm">
                  {format(new Date(job.createdAt), 'MMM dd, yyyy')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Updated</span>
                <span className="text-muted-foreground text-sm">
                  {format(new Date(job.updatedAt), 'MMM dd, yyyy')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Published</span>
                <span className="text-muted-foreground text-sm">
                  {job.isPublished ? 'Yes' : 'No'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" variant="outline">
                View Applications
              </Button>
              <Button className="w-full" variant="outline">
                View Recommendations
              </Button>
              <Button className="w-full" variant="outline">
                Contact Client
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

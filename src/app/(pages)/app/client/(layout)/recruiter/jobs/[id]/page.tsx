'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  activityLogService,
  clientJobPostingService,
} from '@/lib/services/services';
import { useApp } from '@/lib/context/app-context';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { JobForm } from '../components/job-form';
import { format } from 'date-fns';
import { useState } from 'react';
import {
  ArrowLeft,
  Building2,
  Calendar,
  DollarSign,
  Edit,
  MapPin,
  Users,
  CheckCircle2,
  XCircle,
  Activity,
} from 'lucide-react';
import {
  ActivityEntityTypeEnum,
  ActivityModuleEnum,
  JobPostingStatusEnum,
  logger,
} from '@/lib/shared';
import Link from 'next/link';
import { toast } from 'sonner';
import { ActivityActionEnums, ActivityTitleEnum } from '@/lib/models/activity';
import { JobActivityTab } from '../../sourcing/components/job-activity-tab';

// Helper function to format enum values
const formatEnumValue = (value: string) => {
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export default function JobDetailsPage() {
  const { id } = useParams();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { user } = useApp();

  const {
    data: job,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['job', id],
    queryFn: () => clientJobPostingService.getJobPosting(id as string),
  });

  const handleStatusChange = async (newStatus: JobPostingStatusEnum) => {
    try {
      await clientJobPostingService.updateJobPostingStatus(id as string, {
        status: newStatus,
      });

      // Enhanced activity logging with more detailed metadata
      await activityLogService.createActivityLog({
        module: ActivityModuleEnum.JOB,
        action: ActivityActionEnums.UPDATE,
        entityId: user?.clientId,
        entityType: ActivityEntityTypeEnum.JOB_POSTING,
        description: `Job "${job?.title}" status changed to ${formatEnumValue(newStatus)}`,
        metadata: {
          userName: user?.name,
          title: ActivityTitleEnum.JOB_STATUS_UPDATED,
          jobId: job?.id,
          jobTitle: job?.title,
          jobStatus: newStatus,
          oldStatus: job?.status,
          oldValue: job?.status ? formatEnumValue(job.status) : 'Unknown',
          newValue: formatEnumValue(newStatus),
          department: job?.department,
          availableFrom: job?.availableFrom,
          isRemote: job?.isRemote ? 'Remote' : 'On-site',
        },
      });

      toast.success(`Job successfully ${newStatus.toLowerCase()}`);
      refetch();
    } catch (error) {
      toast.error('Failed to update job status');
      logger.error('Error updating job status:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto space-y-8 py-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-3 gap-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Job not found</h1>
          <p className="text-muted-foreground mt-2">
            The job posting you&apos;re looking for doesn&apos;t exist or has
            been removed.
          </p>
          <Button asChild className="mt-4">
            <Link href="/app/client/recruiting/jobs">Back to Jobs</Link>
          </Button>
        </div>
      </div>
    );
  }

  const canPublish = job.status === JobPostingStatusEnum.DRAFT;
  const canClose = job.status === JobPostingStatusEnum.PUBLISHED;
  const isAvailableFromInPast =
    job.availableFrom && new Date(job.availableFrom) < new Date();

  return (
    <div className="container mx-auto space-y-8 py-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/app/client/recruiting/jobs">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{job.title}</h1>
            <p className="text-muted-foreground mt-1">
              {job.department} • {job.isRemote ? 'Remote' : 'On-site'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={
              job.status === JobPostingStatusEnum.PUBLISHED
                ? 'default'
                : job.status === JobPostingStatusEnum.DRAFT
                  ? 'secondary'
                  : 'destructive'
            }
            className="text-sm"
          >
            {formatEnumValue(job.status)}
          </Badge>
          {canPublish && (
            <>
              <Button
                variant="default"
                onClick={() =>
                  handleStatusChange(JobPostingStatusEnum.PUBLISHED)
                }
                disabled={isAvailableFromInPast}
                className="gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                Publish Job
              </Button>
              {isAvailableFromInPast && (
                <Badge
                  variant="outline"
                  className="text-yellow-600 dark:text-yellow-400"
                >
                  Available from date is in the past
                </Badge>
              )}
            </>
          )}
          {canClose && (
            <Button
              variant="destructive"
              onClick={() => handleStatusChange(JobPostingStatusEnum.CLOSED)}
              className="gap-2"
            >
              <XCircle className="h-4 w-4" />
              Close Job
            </Button>
          )}
          <Button
            onClick={() => setIsEditOpen(true)}
            variant="outline"
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit Job
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Building2 className="h-4 w-4" />
              Job Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-muted-foreground text-sm">Type</p>
              <p className="font-medium">{formatEnumValue(job.jobType)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Commitment</p>
              <p className="font-medium">
                {formatEnumValue(job.jobCommitment)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Schedule</p>
              <p className="font-medium">{formatEnumValue(job.jobSchedule)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">
                Experience Required
              </p>
              <p className="font-medium">{job.totalExperience} years</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <DollarSign className="h-4 w-4" />
              Compensation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-muted-foreground text-sm">Salary Range</p>
              <p className="font-medium">
                {job.salaryCurrency} {job.minSalary.toLocaleString()} -{' '}
                {job.maxSalary.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Equity</p>
              <p className="font-medium">{job.equity ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Benefits</p>
              <div className="mt-1 flex flex-wrap gap-2">
                {job.benefits.map((benefit, index) => (
                  <Badge key={index} variant="secondary">
                    {benefit}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="h-4 w-4" />
              Timeline & Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-muted-foreground text-sm">Posted On</p>
              <p className="font-medium">
                {format(new Date(job.createdAt), 'MMM d, yyyy')}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">
                Application Deadline
              </p>
              <p className="font-medium">
                {job.applicationDeadline
                  ? format(new Date(job.applicationDeadline), 'MMM d, yyyy')
                  : 'No deadline'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Available From</p>
              <p className="font-medium">
                {job.availableFrom
                  ? format(new Date(job.availableFrom), 'MMM d, yyyy')
                  : 'Immediate'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Job Description</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <p className="whitespace-pre-wrap">{job.description}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Key Responsibilities</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-inside list-disc space-y-2">
              {job.responsibilities.map((responsibility, index) => (
                <li key={index}>{responsibility}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Required Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {job.requiredSkills.map((skill, index) => (
                <Badge key={index} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
            {job.preferredSkills?.length > 0 && (
              <>
                <CardTitle className="mt-6 mb-4">Preferred Skills</CardTitle>
                <div className="flex flex-wrap gap-2">
                  {job.preferredSkills.map((skill, index) => (
                    <Badge key={index} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {job.preferredLocations?.length > 0 && (
              <div>
                <p className="mb-2 flex items-center gap-2 font-medium">
                  <MapPin className="h-4 w-4" />
                  Preferred Locations
                </p>
                <div className="flex flex-wrap gap-2">
                  {job.preferredLocations.map((location, index) => (
                    <Badge key={index} variant="outline">
                      {location}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {job.preferredUniversities?.length > 0 && (
              <div>
                <p className="mb-2 flex items-center gap-2 font-medium">
                  <Building2 className="h-4 w-4" />
                  Preferred Universities
                </p>
                <div className="flex flex-wrap gap-2">
                  {job.preferredUniversities.map((university, index) => (
                    <Badge key={index} variant="outline">
                      {university}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {job.preferredIndustries?.length > 0 && (
              <div>
                <p className="mb-2 flex items-center gap-2 font-medium">
                  <Users className="h-4 w-4" />
                  Preferred Industries
                </p>
                <div className="flex flex-wrap gap-2">
                  {job.preferredIndustries.map((industry, index) => (
                    <Badge key={index} variant="outline">
                      {industry}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity Tab */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Job Activity Timeline
          </CardTitle>
          <CardDescription>
            Track all interactions and updates related to this job posting
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <JobActivityTab jobId={id as string} job={job} />
        </CardContent>
      </Card>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {job ? 'Edit Job Posting' : 'Create New Job Posting'}
            </DialogTitle>
          </DialogHeader>
          <JobForm
            job={job}
            onClose={() => setIsEditOpen(false)}
            onSuccess={() => {
              setIsEditOpen(false);
              refetch();
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

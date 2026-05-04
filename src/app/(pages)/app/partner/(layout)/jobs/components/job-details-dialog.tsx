'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  BriefcaseIcon,
  CalendarIcon,
  ClockIcon,
  Building2Icon,
  GraduationCapIcon,
  UsersIcon,
  UserIcon,
  CheckIcon,
  StarIcon,
  DollarSignIcon,
  GiftIcon,
  ClipboardListIcon,
  MapPinIcon,
} from 'lucide-react';
import { format } from 'date-fns';

import { formatEnumValue } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { IPartnerJobPosting } from '@/lib/shared';

import { partnerJobPostingService } from '@/lib/services/services';

interface JobDetailsDialogProps {
  jobId: string;
  onClose: () => void;
  onApply: () => void;
}

export default function JobDetailsDialog({
  jobId,
  onClose,
  onApply,
}: JobDetailsDialogProps) {
  const [open, setOpen] = useState(true);
  const jobPostingService = partnerJobPostingService;
  // Reset state when component is mounted with a new jobId
  useEffect(() => {
    setOpen(true);
  }, [jobId]);

  const {
    data: jobResponse,
    isLoading,
    error,
  } = useQuery<IPartnerJobPosting>({
    queryKey: ['job-posting-details', jobId],
    queryFn: () => jobPostingService.getJobPostingById(jobId),
    retry: 1,
  });

  // Extract job data from the response
  const job = jobResponse
    ? ((jobResponse as any).data as IPartnerJobPosting)
    : undefined;

  useEffect(() => {
    if (error) {
      toast.error('Failed to load job details');
      handleClose();
    }
  }, [error]);

  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  const getLocationString = (job: IPartnerJobPosting) => {
    if (job.isRemote) {
      return 'Remote';
    }
    return job.location || 'On-site';
  };

  const formatSalaryRange = (min?: number, max?: number, currency?: string) => {
    if (!min && !max) return 'Not specified';
    if (min && !max) return `${currency || '$'}${min.toLocaleString()}+`;
    if (!min && max) return `Up to ${currency || '$'}${max.toLocaleString()}`;
    return `${currency || '$'}${min?.toLocaleString()} - ${currency || '$'}${max?.toLocaleString()}`;
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(openState) => {
        setOpen(openState);
        if (!openState) handleClose();
      }}
    >
      <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col overflow-hidden p-0">
        <DialogHeader className="bg-background sticky top-0 z-10 px-6 pt-6">
          <div className="flex items-start justify-between">
            <div>
              {isLoading ? (
                <Skeleton className="h-8 w-64" />
              ) : (
                <DialogTitle className="text-xl font-semibold">
                  {job?.title}
                </DialogTitle>
              )}
              {isLoading ? (
                <div className="mt-2 flex gap-2">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-20" />
                </div>
              ) : (
                <div className="mt-2 flex flex-wrap gap-2">
                  {job?.jobType && (
                    <Badge variant="outline">
                      <BriefcaseIcon className="mr-1 h-3 w-3" />
                      {formatEnumValue(job.jobType)}
                    </Badge>
                  )}
                  {job?.isRemote !== undefined && (
                    <Badge variant={job.isRemote ? 'default' : 'outline'}>
                      <MapPinIcon className="mr-1 h-3 w-3" />
                      {job.isRemote ? 'Remote' : 'On-site'}
                    </Badge>
                  )}
                </div>
              )}
            </div>
            <div>
              {!isLoading && (
                <Button
                  onClick={() => {
                    handleClose();
                    onApply();
                  }}
                >
                  Apply Now
                </Button>
              )}
            </div>
          </div>
          <Separator className="mt-4" />
        </DialogHeader>

        <ScrollArea className="flex-grow overflow-auto">
          <div className="p-6">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold">Description</h3>
                  <p className="text-muted-foreground mt-2 whitespace-pre-line">
                    {job?.description}
                  </p>
                </div>

                {/* Job Details */}
                <div>
                  <h3 className="text-lg font-semibold">Job Details</h3>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                    <div className="flex items-start gap-2">
                      <BriefcaseIcon className="text-muted-foreground mt-0.5 h-4 w-4" />
                      <div>
                        <p className="text-sm font-medium">Job Type</p>
                        <p className="text-muted-foreground text-sm">
                          {job?.jobType
                            ? formatEnumValue(job.jobType)
                            : 'Not specified'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <ClockIcon className="text-muted-foreground mt-0.5 h-4 w-4" />
                      <div>
                        <p className="text-sm font-medium">Schedule</p>
                        <p className="text-muted-foreground text-sm">
                          {job?.jobSchedule
                            ? formatEnumValue(job.jobSchedule)
                            : 'Not specified'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CalendarIcon className="text-muted-foreground mt-0.5 h-4 w-4" />
                      <div>
                        <p className="text-sm font-medium">Commitment</p>
                        <p className="text-muted-foreground text-sm">
                          {job?.jobCommitment
                            ? formatEnumValue(job.jobCommitment)
                            : 'Not specified'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Building2Icon className="text-muted-foreground mt-0.5 h-4 w-4" />
                      <div>
                        <p className="text-sm font-medium">Industry</p>
                        <p className="text-muted-foreground text-sm">
                          {job?.industry
                            ? formatEnumValue(job.industry)
                            : 'Not specified'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <GraduationCapIcon className="text-muted-foreground mt-0.5 h-4 w-4" />
                      <div>
                        <p className="text-sm font-medium">Experience</p>
                        <p className="text-muted-foreground text-sm">
                          {job?.totalExperience
                            ? `${job.totalExperience} years`
                            : 'Not specified'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Building2Icon className="text-muted-foreground mt-0.5 h-4 w-4" />
                      <div>
                        <p className="text-sm font-medium">Department</p>
                        <p className="text-muted-foreground text-sm">
                          {job?.department || 'Not specified'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <UsersIcon className="text-muted-foreground mt-0.5 h-4 w-4" />
                      <div>
                        <p className="text-sm font-medium">Team Size</p>
                        <p className="text-muted-foreground text-sm">
                          {job?.teamSize || 'Not specified'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <UserIcon className="text-muted-foreground mt-0.5 h-4 w-4" />
                      <div>
                        <p className="text-sm font-medium">Reports To</p>
                        <p className="text-muted-foreground text-sm">
                          {job?.reportingTo || 'Not specified'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPinIcon className="text-muted-foreground mt-0.5 h-4 w-4" />
                      <div>
                        <p className="text-sm font-medium">Location</p>
                        <p className="text-muted-foreground text-sm">
                          {job ? getLocationString(job) : 'Not specified'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <CheckIcon className="text-primary h-4 w-4" />
                      <h3 className="text-lg font-semibold">Required Skills</h3>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {job?.requiredSkills && job.requiredSkills.length > 0 ? (
                        job.requiredSkills.map(
                          (skill: string, index: number) => (
                            <Badge key={index} variant="outline">
                              {skill}
                            </Badge>
                          )
                        )
                      ) : (
                        <p className="text-muted-foreground text-sm">
                          No specific skills required
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <StarIcon className="text-primary h-4 w-4" />
                      <h3 className="text-lg font-semibold">
                        Preferred Skills
                      </h3>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {job?.preferredSkills &&
                      job.preferredSkills.length > 0 ? (
                        job.preferredSkills.map(
                          (skill: string, index: number) => (
                            <Badge key={index} variant="outline">
                              {skill}
                            </Badge>
                          )
                        )
                      ) : (
                        <p className="text-muted-foreground text-sm">
                          No preferred skills specified
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Salary and Benefits */}
                <div>
                  <h3 className="text-lg font-semibold">
                    Compensation & Benefits
                  </h3>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="flex items-start gap-2">
                      <DollarSignIcon className="text-muted-foreground mt-0.5 h-4 w-4" />
                      <div>
                        <p className="text-sm font-medium">Salary Range</p>
                        <p className="text-muted-foreground text-sm">
                          {job
                            ? formatSalaryRange(
                                job.minSalary,
                                job.maxSalary,
                                job.salaryCurrency
                              )
                            : 'Not specified'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <GiftIcon className="text-muted-foreground mt-0.5 h-4 w-4" />
                      <div>
                        <p className="text-sm font-medium">Benefits</p>
                        <div>
                          {job?.benefits && job.benefits.length > 0 ? (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {job.benefits.map(
                                (benefit: string, index: number) => (
                                  <Badge key={index} variant="outline">
                                    {benefit}
                                  </Badge>
                                )
                              )}
                            </div>
                          ) : (
                            <p className="text-muted-foreground text-sm">
                              Not specified
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Responsibilities */}
                <div>
                  <div className="flex items-center gap-2">
                    <ClipboardListIcon className="text-primary h-4 w-4" />
                    <h3 className="text-lg font-semibold">Responsibilities</h3>
                  </div>
                  {job?.responsibilities && job.responsibilities.length > 0 ? (
                    <ul className="mt-2 space-y-2 pl-6">
                      {job.responsibilities.map(
                        (responsibility: string, index: number) => (
                          <li
                            key={index}
                            className="text-muted-foreground list-disc"
                          >
                            {responsibility}
                          </li>
                        )
                      )}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground mt-2 text-sm">
                      No specific responsibilities listed
                    </p>
                  )}
                </div>

                {/* Posting Metadata */}
                <div>
                  <h3 className="text-lg font-semibold">Posting Information</h3>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="flex items-start gap-2">
                      <CalendarIcon className="text-muted-foreground mt-0.5 h-4 w-4" />
                      <div>
                        <p className="text-sm font-medium">Posted On</p>
                        <p className="text-muted-foreground text-sm">
                          {job?.createdAt
                            ? format(new Date(job.createdAt), 'MMMM d, yyyy')
                            : 'Not available'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CalendarIcon className="text-muted-foreground mt-0.5 h-4 w-4" />
                      <div>
                        <p className="text-sm font-medium">
                          Application Deadline
                        </p>
                        <p className="text-muted-foreground text-sm">
                          {job?.applicationDeadline
                            ? format(
                                new Date(job.applicationDeadline),
                                'MMMM d, yyyy'
                              )
                            : 'Not specified'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="mt-auto border-t px-6 py-4">
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
          {!isLoading && (
            <Button
              onClick={() => {
                handleClose();
                onApply();
              }}
            >
              Apply Now
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  BriefcaseIcon,
  CheckCircleIcon,
  UserIcon,
  GraduationCapIcon,
  MapPinIcon,
} from 'lucide-react';
import { toast } from 'sonner';

import { IPaginatedResponse, IPartnerJobPosting, logger } from '@/lib/shared';
import type { IPartnerCandidateWithRecommendation } from '@/lib/shared/models/api/partner/candidate.api';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { formatEnumValue } from '@/lib/utils';
import { getUser } from '@/lib/utils/auth-utils';

import '../page';
import {
  partnerCandidateService,
  partnerJobPostingService,
} from '@/lib/services/services';

interface UpdatedJobApplicationRequest {
  candidateId: string;
  partnerId: string;
  notes?: string;
  candidates: { candidateId: string; comment?: string }[];
}

interface JobApplyDialogProps {
  jobId: string;
  onClose: (success?: boolean) => void;
}

export default function JobApplyDialog({
  jobId,
  onClose,
}: JobApplyDialogProps) {
  const [open, setOpen] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(
    null
  );
  const [notes, setNotes] = useState('');
  const [appliedCandidateIds, setAppliedCandidateIds] = useState<Set<string>>(
    new Set()
  );

  const user = getUser();
  const queryClient = useQueryClient();

  const jobPostingService = partnerJobPostingService;
  const candidateService = partnerCandidateService;

  // Reset state when component is mounted with a new jobId
  useEffect(() => {
    setOpen(true);
    setShowConfirm(false);
    setSelectedCandidateId(null);
    setNotes('');
    // Don't reset appliedCandidateIds here to maintain state across job applications
  }, [jobId]);

  // Query for the job details
  const { data: jobResponse, isLoading: isJobLoading } =
    useQuery<IPartnerJobPosting>({
      queryKey: ['job-posting-details', jobId],
      queryFn: () => jobPostingService.getJobPostingById(jobId),
      retry: 1,
    });

  // Extract job data - use type assertion to handle nested data structure
  const job = jobResponse
    ? ((jobResponse as any).data as IPartnerJobPosting)
    : undefined;

  // Query for recommended candidates for this job
  const { data: candidatesResponse, isLoading: isCandidatesLoading } = useQuery<
    IPaginatedResponse<IPartnerCandidateWithRecommendation>
  >({
    queryKey: ['recommended-candidates', jobId],
    queryFn: () =>
      candidateService.getRecommendedCandidatesForJobPosting(jobId),
    retry: 1,
    enabled: !!jobId,
  });

  // Extract recommended candidates data and filter out applied candidates
  const allCandidates = (candidatesResponse?.items ||
    []) as IPartnerCandidateWithRecommendation[];
  const candidates = allCandidates.filter(
    (candidate) => !appliedCandidateIds.has(candidate.id)
  );

  // Mutation for submitting job application
  const applyMutation = useMutation({
    mutationFn: (data: UpdatedJobApplicationRequest) =>
      jobPostingService.applyToJobPosting(jobId, data),
    onSuccess: () => {
      toast.success('Application submitted successfully!');

      // Add the applied candidate to the set of applied candidates
      if (selectedCandidateId) {
        setAppliedCandidateIds(
          (prev) => new Set([...prev, selectedCandidateId])
        );

        // Update the query cache to remove the applied candidate
        queryClient.setQueryData<
          IPaginatedResponse<IPartnerCandidateWithRecommendation>
        >(['recommended-candidates', jobId], (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            items: oldData.items.filter(
              (candidate: IPartnerCandidateWithRecommendation) =>
                candidate.id !== selectedCandidateId
            ),
          };
        });
      }

      // Reset selection and close confirmation
      setSelectedCandidateId(null);
      setNotes('');
      setShowConfirm(false);

      handleCloseWithSuccess();
    },
    onError: (error: any) => {
      toast.error('Failed to submit application');
      logger.error('Error submitting application:', error);
      setShowConfirm(false);
    },
  });

  const handleSubmit = () => {
    if (!selectedCandidateId) {
      toast.error('Please select a candidate to apply with');
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirmSubmit = () => {
    if (!selectedCandidateId) return;

    // Get partner ID from cookies, similar to invite-user-dialog
    const partnerId = user?.partnerId;

    if (!partnerId) {
      toast.error(
        'Partner information not found. Please try logging in again.'
      );
      return;
    }

    const applicationData = {
      candidateId: selectedCandidateId,
      partnerId: partnerId,
      notes: notes.trim() || undefined,
      candidates: [
        {
          candidateId: selectedCandidateId,
          comment: notes.trim() || undefined,
        },
      ],
    };

    applyMutation.mutate(applicationData);
  };

  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  const handleCloseWithSuccess = () => {
    setOpen(false);
    onClose(true);
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(openState) => {
          setOpen(openState);
          if (!openState) handleClose();
        }}
      >
        <DialogContent className="flex max-h-[90vh] max-w-3xl flex-col overflow-hidden">
          <DialogHeader className="flex-shrink-0 px-6 py-4">
            <DialogTitle>Apply for Job</DialogTitle>
            <DialogDescription>
              Select a recommended candidate to apply for this job position
            </DialogDescription>
          </DialogHeader>

          {/* Fixed Job Summary */}
          <div className="flex-shrink-0 border-b px-6 pb-4">
            {isJobLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : (
              <div className="bg-muted/10 rounded-lg border p-4">
                <h3 className="text-lg font-semibold">{job?.title}</h3>
                <div className="text-muted-foreground mt-1 mb-3 flex items-center gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <BriefcaseIcon className="h-3.5 w-3.5" />
                    <span>
                      {job?.jobType ? formatEnumValue(job.jobType) : 'N/A'}
                    </span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <MapPinIcon className="h-3.5 w-3.5" />
                    <span>
                      {job?.isRemote ? 'Remote' : job?.location || 'On-site'}
                    </span>
                  </div>
                  {job?.totalExperience && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <GraduationCapIcon className="h-3.5 w-3.5" />
                        <span>{job.totalExperience} years</span>
                      </div>
                    </>
                  )}
                </div>
                <p className="text-muted-foreground mb-2 line-clamp-3 text-sm">
                  {job?.description || 'No description provided'}
                </p>
                {job?.requiredSkills && job.requiredSkills.length > 0 && (
                  <div className="mt-2">
                    <p className="mb-1 text-xs font-medium">Required Skills:</p>
                    <div className="flex flex-wrap gap-1">
                      {job.requiredSkills
                        .slice(0, 5)
                        .map((skill: string, index: number) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {skill}
                          </Badge>
                        ))}
                      {job.requiredSkills.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{job.requiredSkills.length - 5} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Scrollable Candidate Selection and Notes */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-6">
              {/* Candidate Selection */}
              <div>
                <h3 className="mb-4 text-sm font-medium">
                  Select a Recommended Candidate
                </h3>

                {isCandidatesLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                ) : !candidates || candidates.length === 0 ? (
                  <div className="rounded-md border border-dashed p-6 text-center">
                    <UserIcon className="mx-auto mb-2 h-6 w-6 text-gray-400" />
                    <p className="text-muted-foreground">
                      {appliedCandidateIds.size > 0
                        ? 'All recommended candidates have been applied to jobs or no more recommended candidates are available.'
                        : 'No recommended candidates available for this job posting.'}
                    </p>
                    {appliedCandidateIds.size > 0 && (
                      <p className="text-muted-foreground mt-2 text-sm">
                        {appliedCandidateIds.size} candidate(s) have already
                        been applied to jobs.
                      </p>
                    )}
                  </div>
                ) : (
                  <RadioGroup
                    value={selectedCandidateId || ''}
                    onValueChange={setSelectedCandidateId}
                    className="space-y-3"
                  >
                    {candidates.map((candidate) => (
                      <div key={candidate.id}>
                        <RadioGroupItem
                          value={candidate.id}
                          id={candidate.id}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={candidate.id}
                          className="hover:bg-accent peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 flex cursor-pointer items-start gap-4 rounded-lg border p-4"
                        >
                          <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full">
                            <UserIcon className="text-primary h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-base font-medium">
                                  Candidate Name: {candidate.name}
                                </p>
                                <p className="text-base font-medium">
                                  Email: {candidate.email}
                                </p>
                              </div>
                              {selectedCandidateId === candidate.id && (
                                <CheckCircleIcon className="text-primary h-5 w-5" />
                              )}
                            </div>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              </div>

              {/* Notes */}
              <div>
                <h3 className="mb-2 text-sm font-medium">
                  Additional Notes (Optional)
                </h3>
                <Textarea
                  placeholder="Add any additional information about your application..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex-shrink-0 border-t px-6 py-4">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedCandidateId || applyMutation.isPending}
            >
              {applyMutation.isPending ? 'Submitting...' : 'Submit Application'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Application</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit this job application? This action
              cannot be undone and the candidate will be removed from the
              available list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSubmit}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

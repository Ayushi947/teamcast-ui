'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { User, Edit, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supportJobPostingRecruiterAssignmentService } from '@/lib/services/services';
import { useApp } from '@/lib/context/app-context';

interface SupportRecruiterAssignmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: any;
  currentRecruiter?: any;
  mode?: 'assign' | 'reassign'; // 'assign' for new assignment, 'reassign' for changing existing
}

interface Recruiter {
  id: string;
  name: string;
  email: string;
  jobTitle?: string;
  role: string;
  status: string;
  department?: string;
}

export function SupportRecruiterAssignmentModal({
  open,
  onOpenChange,
  job,
  mode = 'assign', // Default to assign mode
}: SupportRecruiterAssignmentModalProps) {
  const [selectedRecruiterId, setSelectedRecruiterId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useApp();
  const queryClient = useQueryClient();

  // Check if job already has a recruiter assigned
  const hasExistingRecruiter = !!job?.recruiter;

  // Get current assignment for the job posting (only for reassign mode)
  const { data: currentAssignment, isLoading: isLoadingAssignment } = useQuery({
    queryKey: ['jobPostingRecruiterAssignment', job?.id],
    queryFn: () =>
      supportJobPostingRecruiterAssignmentService.getAssignmentForJobPosting(
        job?.id
      ),
    enabled: open && !!job?.id && mode === 'reassign',
  });

  // Get available recruiters for the account manager
  const { data: availableRecruiters, isLoading: isLoadingRecruiters } =
    useQuery({
      queryKey: [
        'availableRecruiters',
        user?.supportUserId || user?.id,
        searchQuery,
      ],
      queryFn: async () => {
        // Use the current user's account manager ID (same as recruiters list)
        const accountManagerId = user?.supportUserId || user?.id;
        return supportJobPostingRecruiterAssignmentService.getAvailableRecruitersForAccountManager(
          accountManagerId || '',
          { page: 1, limit: 100, search: searchQuery }
        );
      },
      enabled: open && !!(user?.supportUserId || user?.id),
    });

  // Set initial selected recruiter when current assignment loads or use job's recruiter data
  useEffect(() => {
    if (currentAssignment?.recruiterId) {
      setSelectedRecruiterId(currentAssignment.recruiterId);
    } else if (hasExistingRecruiter && job?.recruiter?.id) {
      // Use recruiter data from job object when assignment API is not called
      setSelectedRecruiterId(job.recruiter.id);
    } else {
      // Reset to empty if no current assignment
      setSelectedRecruiterId('');
    }
  }, [currentAssignment, hasExistingRecruiter, job?.recruiter?.id]);

  // Reassign recruiter mutation
  const reassignMutation = useMutation({
    mutationFn: async ({
      assignmentId,
      newRecruiterId,
      reason,
    }: {
      assignmentId: string;
      newRecruiterId: string;
      reason?: string;
    }) => {
      return supportJobPostingRecruiterAssignmentService.reassignRecruiter(
        assignmentId,
        newRecruiterId,
        reason
      );
    },
    onSuccess: () => {
      toast.success('Recruiter reassigned successfully!');
      onOpenChange(false);
      setSelectedRecruiterId('');
      setReason('');
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['supportJobPostings'] });
      queryClient.invalidateQueries({
        queryKey: ['jobPostingRecruiterAssignment'],
      });
    },
    onError: (error: any) => {
      toast.error(
        error?.message || 'Failed to reassign recruiter. Please try again.'
      );
    },
  });

  // Create new assignment mutation (if no current assignment exists)
  const createAssignmentMutation = useMutation({
    mutationFn: async ({
      jobPostingId,
      recruiterId,
      assignedBy,
      notes,
    }: {
      jobPostingId: string;
      recruiterId: string;
      assignedBy?: string;
      notes?: string;
    }) => {
      return supportJobPostingRecruiterAssignmentService.manuallyAssignRecruiter(
        {
          jobPostingId,
          recruiterId,
          assignedBy,
          notes,
        }
      );
    },
    onSuccess: () => {
      toast.success('Recruiter assigned successfully!');
      onOpenChange(false);
      setSelectedRecruiterId('');
      setReason('');
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['supportJobPostings'] });
      queryClient.invalidateQueries({
        queryKey: ['jobPostingRecruiterAssignment'],
      });
    },
    onError: (error: any) => {
      toast.error(
        error?.message || 'Failed to assign recruiter. Please try again.'
      );
    },
  });

  const handleSubmit = async () => {
    if (!selectedRecruiterId || selectedRecruiterId.trim() === '') {
      toast.error('Please select a recruiter');
      return;
    }

    // Additional validation to ensure we have a valid recruiter ID
    const currentRecruiterId =
      currentAssignment?.recruiterId || job?.recruiter?.id;
    if (hasExistingRecruiter && selectedRecruiterId === currentRecruiterId) {
      toast.error('Please select a different recruiter to reassign');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'reassign' && currentAssignment?.id) {
        // Use formal reassignment when we have assignment details
        await reassignMutation.mutateAsync({
          assignmentId: currentAssignment.id,
          newRecruiterId: selectedRecruiterId,
          reason: reason || undefined,
        });
      } else {
        // Use manual assignment for new assignments or when assignment details not available
        await createAssignmentMutation.mutateAsync({
          jobPostingId: job.id,
          recruiterId: selectedRecruiterId,
          assignedBy: user?.id,
          notes: reason || undefined,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSelectedRecruiterId('');
      setReason('');
      setSearchQuery('');
    }
    onOpenChange(newOpen);
  };

  const filteredRecruiters = availableRecruiters?.items || [];

  // Use assignment data if available, otherwise use job's recruiter data
  const currentRecruiterData =
    currentAssignment?.recruiter ||
    (hasExistingRecruiter ? job?.recruiter : null);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Assign Recruiter</DialogTitle>
          <DialogDescription>
            Assign or reassign a recruiter to the{' '}
            <span className="font-semibold">{job?.title}</span> position.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Job Details */}
          <div className="rounded-lg border p-4">
            <h3 className="mb-2 font-semibold">Job Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium">Title:</span>
                <span>{job?.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Client:</span>
                <span>{job?.clientInfo?.name || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Department:</span>
                <span>{job?.department || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Current Assignment Loading */}
          {isLoadingAssignment && (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}

          {/* Select New Recruiter */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">
                {currentRecruiterData
                  ? 'Select New Recruiter'
                  : 'Select Recruiter'}
              </Label>
              <p className="text-sm text-gray-500">
                Choose a recruiter from your team to handle this job posting
              </p>
            </div>

            {/* Current Recruiter Input (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="current-recruiter">Current Recruiter</Label>
              <Input
                id="current-recruiter"
                value={
                  currentRecruiterData
                    ? `${currentRecruiterData.name} (${currentRecruiterData.email})`
                    : 'No recruiter assigned'
                }
                readOnly
                className="bg-gray-50 dark:bg-gray-800"
              />
            </div>

            {/* Recruiter Selection Dropdown */}
            <div className="space-y-2">
              <Label htmlFor="recruiter-select">
                {currentRecruiterData
                  ? 'Select New Recruiter'
                  : 'Select Recruiter'}
              </Label>
              <Select
                value={selectedRecruiterId}
                onValueChange={setSelectedRecruiterId}
              >
                <SelectTrigger id="recruiter-select" className="w-full">
                  <SelectValue
                    placeholder={
                      currentRecruiterData
                        ? 'Choose a different recruiter...'
                        : 'Choose a recruiter...'
                    }
                  />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {isLoadingRecruiters ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="ml-2">Loading recruiters...</span>
                    </div>
                  ) : filteredRecruiters.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No recruiters found
                    </div>
                  ) : (
                    <>
                      {filteredRecruiters.map((recruiter: Recruiter) => (
                        <SelectItem
                          key={recruiter.id}
                          value={recruiter.id}
                          className="cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <User className="h-4 w-4 text-gray-500" />
                            <div className="flex-1">
                              <div className="font-medium">
                                {recruiter.name}
                                {currentRecruiterData?.id === recruiter.id && (
                                  <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">
                                    (Current)
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Reason for Reassignment */}
          {currentRecruiterData && (
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Reassignment (Optional)</Label>
              <Textarea
                id="reason"
                placeholder="Enter reason for reassignment..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedRecruiterId}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {currentRecruiterData ? 'Updating...' : 'Assigning...'}
              </>
            ) : (
              <>
                <Edit className="h-4 w-4" />
                {currentRecruiterData
                  ? 'Update Assignment'
                  : 'Assign Recruiter'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

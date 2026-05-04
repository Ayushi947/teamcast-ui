'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { X, Plus, Send, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supportJobPostingInviteService } from '@/lib/services/services';
import { ISupportJobInviteApiRequest } from '@/lib/shared/models/api/support/job.posting.invite.api';

interface SupportJobInviteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: any;
}

interface Candidate {
  name: string;
  email: string;
}

export function SupportJobInviteModal({
  open,
  onOpenChange,
  job,
}: SupportJobInviteModalProps) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [newCandidate, setNewCandidate] = useState({ name: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const inviteMutation = useMutation({
    mutationFn: (data: ISupportJobInviteApiRequest) =>
      supportJobPostingInviteService.createSupportJobPostingInvite(data),
    onSuccess: () => {
      toast.success('Invites sent successfully!');
      onOpenChange(false);
      setCandidates([]);
      setNewCandidate({ name: '', email: '' });
      queryClient.invalidateQueries({ queryKey: ['supportJobPostings'] });
      queryClient.invalidateQueries({ queryKey: ['supportJobPostingInvites'] });
    },
    onError: (error: any) => {
      toast.error(
        error?.message || 'Failed to send invites. Please try again.'
      );
    },
  });

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAddCandidate = () => {
    if (!newCandidate.name.trim() || !newCandidate.email.trim()) {
      toast.error('Please fill in both name and email');
      return;
    }

    if (!validateEmail(newCandidate.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Check if email already exists
    if (candidates.some((c) => c.email === newCandidate.email)) {
      toast.error('This email has already been added');
      return;
    }

    setCandidates([...candidates, { ...newCandidate }]);
    setNewCandidate({ name: '', email: '' });
  };

  const handleRemoveCandidate = (email: string) => {
    setCandidates(candidates.filter((c) => c.email !== email));
  };

  const handleSubmit = async () => {
    if (candidates.length === 0) {
      toast.error('Please add at least one candidate');
      return;
    }

    setIsSubmitting(true);
    try {
      await inviteMutation.mutateAsync({
        candidates,
        jobTitle: job.title,
        jobId: job.id,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCandidate();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Send Job Invite</DialogTitle>
          <DialogDescription>
            Invite candidates to apply for the{' '}
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
                <span className="font-medium">Department:</span>
                <span>{job?.department || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Location:</span>
                <span>
                  {job?.isRemote
                    ? 'Remote'
                    : job?.preferredLocations?.join(', ') || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Add Candidates */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">Add Candidates</Label>
              <p className="text-sm text-gray-500">
                Enter candidate details to send them an invitation
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="candidate-name">Name</Label>
                <Input
                  id="candidate-name"
                  placeholder="Enter candidate name"
                  value={newCandidate.name}
                  onChange={(e) =>
                    setNewCandidate({ ...newCandidate, name: e.target.value })
                  }
                  onKeyPress={handleKeyPress}
                />
              </div>
              <div>
                <Label htmlFor="candidate-email">Email</Label>
                <Input
                  id="candidate-email"
                  type="email"
                  placeholder="Enter candidate email"
                  value={newCandidate.email}
                  onChange={(e) =>
                    setNewCandidate({ ...newCandidate, email: e.target.value })
                  }
                  onKeyPress={handleKeyPress}
                />
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleAddCandidate}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Candidate
            </Button>
          </div>

          {/* Candidates List */}
          {candidates.length > 0 && (
            <div className="space-y-3">
              <Label className="text-base font-semibold">
                Candidates to Invite ({candidates.length})
              </Label>
              <div className="space-y-2">
                {candidates.map((candidate, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="font-medium">{candidate.name}</div>
                        <div className="text-sm text-gray-500">
                          {candidate.email}
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveCandidate(candidate.email)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || candidates.length === 0}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send Invites ({candidates.length})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

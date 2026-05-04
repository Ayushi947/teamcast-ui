import { clientJobAiAssessmentInviteService } from '@/lib/services/services';
import { FC } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logger';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface AiAssessmentDialogProps {
  candidateId: string;
  jobApplicationId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const AiAssessmentDialog: FC<AiAssessmentDialogProps> = ({
  candidateId,
  jobApplicationId,
  isOpen,
  onOpenChange,
  onSuccess,
}) => {
  const queryClient = useQueryClient();

  const createAiAssessmentMutation = useMutation({
    mutationFn: async () => {
      return await clientJobAiAssessmentInviteService.createJobAiAssessmentInvite(
        {
          candidateId,
          jobApplicationId,
        }
      );
    },
    onSuccess: () => {
      // Invalidate the AI assessment invites query with the correct query key
      queryClient.invalidateQueries({
        queryKey: ['aiAssessmentInvite', jobApplicationId, candidateId],
      });

      // Call the onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }

      // Close dialog on success
      onOpenChange(false);
      // Show success toast
      toast.success(
        'AI assessment invitation sent successfully. The candidate will receive an email with instructions.'
      );
    },
    onError: (error) => {
      logger.error('Failed to schedule AI assessment:', error);
      toast.error('Failed to send AI assessment invitation. Please try again.');
    },
  });

  const handleScheduleAiAssessment = async () => {
    createAiAssessmentMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule AI Assessment</DialogTitle>
          <DialogDescription>
            Are you sure you want to send an AI assessment invitation to this
            candidate? They will receive an email with instructions to complete
            the assessment.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={createAiAssessmentMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleScheduleAiAssessment}
            disabled={createAiAssessmentMutation.isPending}
          >
            {createAiAssessmentMutation.isPending
              ? 'Scheduling...'
              : 'Send Invitation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

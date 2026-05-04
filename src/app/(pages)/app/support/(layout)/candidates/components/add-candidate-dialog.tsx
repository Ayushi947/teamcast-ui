'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import {
  supportCandidateManagementService,
  supportInvitationService,
  activityLogService,
} from '@/lib/services/services';
import { useQueryClient } from '@tanstack/react-query';
import { ActivityActionEnums, ActivityTitleEnum } from '@/lib/models/activity';
import { useApp } from '@/lib/context/app-context';
import { logger } from '@/lib/logger';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supportInvitationSendValidator } from '@/lib/shared/validators/support/invitation.validator';
import {
  ActivityEntityTypeEnum,
  ActivityModuleEnum,
  SupportInvitationTypeEnum,
} from '@/lib/shared/models/common/enums';
import { ISupportCandidateCreateSimple } from '@/lib/shared/models/domain/support/candidates.domain';

// Use the shared validator schema for support invitation
const inviteCandidateSchema = supportInvitationSendValidator.shape.body;

interface AddCandidateDialogProps {
  onCandidateAdded?: () => void;
  onInviteSuccess?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  isInviteMode?: boolean;
}

export function AddCandidateDialog({
  onCandidateAdded,
  onInviteSuccess,
  open,
  onOpenChange,
  isInviteMode = false,
}: AddCandidateDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useApp();
  const queryClient = useQueryClient();

  // Use external open state if provided, otherwise use internal
  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  // Form for creating candidate
  const createForm = useForm<ISupportCandidateCreateSimple>({
    defaultValues: {
      fullName: '',
      email: '',
      jobTitle: '',
    },
  });

  // Form for inviting candidate
  const inviteForm = useForm<z.infer<typeof inviteCandidateSchema>>({
    resolver: zodResolver(inviteCandidateSchema),
    defaultValues: {
      name: '',
      email: '',
      jobTitle: '',
      type: SupportInvitationTypeEnum.CANDIDATE,
    },
  });

  // Reset forms when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      createForm.reset();
      inviteForm.reset();
      setIsSubmitting(false);
    }
  }, [isOpen, createForm, inviteForm]);

  const handleCreateSubmit = async (data: ISupportCandidateCreateSimple) => {
    setIsSubmitting(true);
    try {
      await supportCandidateManagementService.createSupportCandidate(data);

      if (user?.id) {
        try {
          await activityLogService.createActivityLog({
            entityType: ActivityEntityTypeEnum.CANDIDATE,
            entityId: '', // Service doesn't return ID, will be updated by backend
            module: ActivityModuleEnum.SYSTEM,
            action: ActivityActionEnums.CREATE,
            description: `Candidate ${data.fullName} created by support user ${user.name}`,
            metadata: {
              title: ActivityTitleEnum.PROFILE_CREATED,
              candidateName: data.fullName,
              candidateEmail: data.email,
              candidateJobTitle: data.jobTitle,
              userName: user.name,
              createdById: user.id,
            },
          });
        } catch (logError) {
          logger.warn('Failed to log activity:', logError);
        }
      }

      toast.success('Candidate created successfully!', {
        description: `${data.fullName} has been added to the system.`,
      });
      createForm.reset();
      setIsOpen(false);
      onCandidateAdded?.();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Please check the form and try again.';
      toast.error('Failed to create candidate', {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInviteSubmit = async (
    values: z.infer<typeof inviteCandidateSchema>
  ) => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      // The form data now includes the type field, so we can use it directly
      await supportInvitationService.sendInvitation(values);
      queryClient.invalidateQueries({
        queryKey: ['supportInvitations'],
      });
      toast.success('Invitation sent', {
        description: `An invitation has been sent to ${values.email}.`,
      });
      inviteForm.reset();
      setIsOpen(false);
      onInviteSuccess?.();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'An error occurred while sending the invitation.';
      toast.error('Error sending invitation', {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsSubmitting(false);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {!isInviteMode && (
        <DialogTrigger asChild>
          <Button size="sm" className="h-8 gap-1">
            <Plus className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Candidate
            </span>
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isInviteMode ? 'Invite Candidate' : 'Add New Candidate'}
          </DialogTitle>
          <DialogDescription>
            {isInviteMode
              ? 'Send an invitation to join the platform as a candidate.'
              : 'Create a new candidate profile. Fields marked with * are required.'}
          </DialogDescription>
        </DialogHeader>

        {isInviteMode ? (
          // Invite form
          <Form {...inviteForm}>
            <form
              onSubmit={inviteForm.handleSubmit(handleInviteSubmit)}
              className="space-y-4"
            >
              {/* Hidden field for type */}
              <input type="hidden" {...inviteForm.register('type')} />

              <FormField
                control={inviteForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Doe"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={inviteForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john.doe@example.com"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={inviteForm.control}
                name="jobTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title (optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter job title"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting}
                  onClick={handleClose}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Send Invitation'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          // Create form
          <Form {...createForm}>
            <form
              onSubmit={createForm.handleSubmit(handleCreateSubmit)}
              className="space-y-4"
            >
              <FormField
                control={createForm.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="John Doe"
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="john.doe@example.com"
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="jobTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Software Engineer"
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Candidate'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}

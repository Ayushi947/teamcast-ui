'use client';

import { partnerUserInvitationSendValidator, UserRoleEnum } from '@/lib/shared';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { partnerInvtiationService } from '@/lib/services/services';
import { useQueryClient } from '@tanstack/react-query';
import { useApp } from '@/lib/context/app-context';
// Use the createClientUserInvitationSchema from @/lib/shared
const inviteUserSchema = partnerUserInvitationSendValidator.shape.body;

interface InviteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInviteSuccess?: () => void;
}

export function InviteUserDialog({
  open,
  onOpenChange,
  onInviteSuccess,
}: InviteUserDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useApp();
  const partnerId = user?.partnerId ?? '';
  const form = useForm<z.infer<typeof inviteUserSchema>>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: {
      name: '',
      email: '',
      role: UserRoleEnum.PARTNER_RESOURCE,
      jobTitle: '',
      partnerId: partnerId,
    },
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        name: '',
        email: '',
        role: UserRoleEnum.PARTNER_RESOURCE,
        jobTitle: '',
        partnerId: partnerId,
      });
      setIsSubmitting(false);
    }
  }, [form, open, partnerId]);

  // Handle clean up when dialog closes
  useEffect(() => {
    if (!open) {
      // Reset form and submitting state when dialog closes
      const timer = setTimeout(() => {
        setIsSubmitting(false);
        form.reset();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open, form]);

  const handleClose = () => {
    setIsSubmitting(false); // Ensure submitting state is reset
    onOpenChange(false);
  };

  const onSubmit = async (values: z.infer<typeof inviteUserSchema>) => {
    logger.info('onSubmit', values);
    if (isSubmitting) return;
    if (!partnerId || typeof partnerId !== 'string') {
      toast.error(
        'Missing or invalid partner ID. Please refresh and try again.'
      );
      return;
    }
    setIsSubmitting(true);
    try {
      // Build payload, omitting jobTitle if empty
      const payload: {
        name: string;
        email: string;
        role: UserRoleEnum;
        partnerId: string;
        jobTitle?: string;
      } = {
        name: values.name,
        email: values.email,
        role: values.role as UserRoleEnum,
        partnerId: partnerId,
      };
      if (values.jobTitle && values.jobTitle.trim() !== '') {
        payload.jobTitle = values.jobTitle;
      }
      await partnerInvtiationService.sendUserInvitation(payload);
      queryClient.invalidateQueries({ queryKey: ['partnerUserInvitations'] });
      toast.success('Invitation sent', {
        description: `An invitation has been sent to ${values.email}.`,
      });
      form.reset();
      handleClose();
      if (onInviteSuccess) {
        onInviteSuccess();
      }
    } catch (error) {
      logger.error('Error sending invitation:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'An error occurred while sending the invitation.';
      toast.error('Error sending invitation', {
        description: errorMessage,
      });
      logger.error('Error sending invitation', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite User</DialogTitle>
          <DialogDescription>
            Send an invitation to join your organization.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
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
              control={form.control}
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
              control={form.control}
              name="jobTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title (optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your job title"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={UserRoleEnum.ADMIN}>Admin</SelectItem>
                      <SelectItem value={UserRoleEnum.HR}>HR</SelectItem>
                      <SelectItem value={UserRoleEnum.RECRUITER}>
                        Recruiter
                      </SelectItem>
                      <SelectItem value={UserRoleEnum.ACCOUNTS}>
                        Accounts
                      </SelectItem>
                      <SelectItem value={UserRoleEnum.PARTNER_RESOURCE}>
                        Partner Resource
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting}
                  onClick={handleClose}
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send Invitation'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

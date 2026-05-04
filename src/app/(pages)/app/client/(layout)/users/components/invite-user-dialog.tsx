'use client';

import { clientUserInvitationSendValidator, UserRoleEnum } from '@/lib/shared';

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
import { clientUserInvitationService } from '@/lib/services/services';

// Use the createClientUserInvitationSchema from @/lib/shared
const inviteUserSchema = clientUserInvitationSendValidator.shape.body;

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

  const form = useForm<z.infer<typeof inviteUserSchema>>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: {
      name: '',
      email: '',
      role: UserRoleEnum.RECRUITER,
    },
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        name: '',
        email: '',
        role: UserRoleEnum.RECRUITER,
      });
    }
  }, [form, open]);

  // Handle clean up when dialog closes
  useEffect(() => {
    if (!open) {
      // Add a small delay to ensure cleanup happens after animations
      const timer = setTimeout(() => {
        setIsSubmitting(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleClose = () => {
    onOpenChange(false);
  };

  const onSubmit = async (values: z.infer<typeof inviteUserSchema>) => {
    setIsSubmitting(true);
    try {
      // Call the real API to invite a user
      await clientUserInvitationService.sendUserInvitation({
        name: values.name,
        email: values.email,
        role: values.role as UserRoleEnum,
        ...(values.jobTitle && { jobTitle: values.jobTitle }),
      });

      toast.success('Invitation sent', {
        description: `An invitation has been sent to ${values.email}.`,
      });

      form.reset();
      handleClose();
      onInviteSuccess?.();
    } catch (error: unknown) {
      let errorMessage = 'An unknown error occurred';

      if (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as any).message === 'string'
      ) {
        errorMessage = (error as any).message;
      }

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
                    <Input placeholder="John Doe" {...field} />
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
                  <FormLabel>Job Title (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Software Engineer"
                      {...field}
                      value={field.value || ''}
                      className="text-foreground placeholder:text-muted-foreground"
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
                    defaultValue={field.value}
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
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
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

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';

import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { activityLogService } from '@/lib/services/services';
import {
  ActivityModuleEnum,
  ActivityEntityTypeEnum,
  ISupportInvitationSend,
  supportInvitationSendValidator,
  SupportInvitationTypeEnum,
} from '@/lib/shared';
import { ActivityActionEnums, ActivityTitleEnum } from '@/lib/models/activity';
import { useApp } from '@/lib/context/app-context';
import { logger } from '@/lib/logger';

// Use the shared interface for partner invitation
type IPartnerInviteForm = ISupportInvitationSend;

interface AddPartnerDialogProps {
  onInviteSuccess?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddPartnerDialog({
  onInviteSuccess,
  open,
  onOpenChange,
}: AddPartnerDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useApp();
  const queryClient = useQueryClient();

  // Use external open state if provided, otherwise use internal state
  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  const form = useForm<IPartnerInviteForm>({
    resolver: zodResolver(supportInvitationSendValidator.shape.body),
    defaultValues: {
      name: '',
      email: '',
      companyName: '',
      jobTitle: '',
      specialization: '',
      type: SupportInvitationTypeEnum.PARTNER,
    },
  });

  const onSubmit = async (data: IPartnerInviteForm) => {
    try {
      setIsLoading(true);

      // The form data now includes the type field, so we can use it directly
      // const result = await supportInvitationService.sendInvitation(data);

      if (user?.id) {
        try {
          await activityLogService.createActivityLog({
            entityType: ActivityEntityTypeEnum.PARTNER,
            entityId: user?.supportUserId,
            module: ActivityModuleEnum.SYSTEM,
            action: ActivityActionEnums.CREATE,
            description: `Partner invitation sent to ${data.email} by support user ${user.name}`,
            metadata: {
              title: ActivityTitleEnum.PROFILE_CREATED,
              partnerName: data.name,
              partnerEmail: data.email,
              partnerCompanyName: data.companyName,
              partnerJobTitle: data.jobTitle,
              partnerSpecialization: data.specialization,
              userName: user.name,
              createdById: user.id,
            },
          });
        } catch (logError) {
          logger.warn('Failed to log activity:', logError);
        }
      }

      queryClient.invalidateQueries({
        queryKey: ['supportPartnerInvitations'],
      });

      toast.success('Partner invitation sent successfully');
      onInviteSuccess?.();

      form.reset();
      setIsOpen(false);
    } catch (error) {
      toast.error('Failed to send invitation. Please try again.', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Send Partner Invitation</DialogTitle>
          <DialogDescription>
            Send an invitation to a partner to join the platform.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Hidden field for type */}
            <input type="hidden" {...form.register('type')} />

            <div className="grid grid-cols-2 gap-4">
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
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john@company.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Acme Corporation" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="jobTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                      <Input placeholder="CTO" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="specialization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specialization</FormLabel>
                    <FormControl>
                      <Input placeholder="Software Engineering" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Invitation'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

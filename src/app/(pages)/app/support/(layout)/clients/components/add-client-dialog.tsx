'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient, useQuery } from '@tanstack/react-query';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  activityLogService,
  supportAccountManagerAssignmentService,
} from '@/lib/services/services';
import {
  ActivityModuleEnum,
  ActivityEntityTypeEnum,
  SupportInvitationTypeEnum,
} from '@/lib/shared/models/common/enums';
import { ISupportInvitationSend } from '@/lib/shared/models/domain/support/invitation.domain';
import { supportInvitationSendValidator } from '@/lib/shared/validators/support/invitation.validator';
import { ActivityActionEnums, ActivityTitleEnum } from '@/lib/models/activity';
import { useApp } from '@/lib/context/app-context';
import { logger } from '@/lib/logger';

// Use the shared interface for client invitation
type IClientInviteForm = ISupportInvitationSend;

interface AddClientDialogProps {
  onInviteSuccess?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddClientDialog({
  onInviteSuccess,
  open,
  onOpenChange,
}: AddClientDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useApp();
  const queryClient = useQueryClient();

  // Use external open state if provided, otherwise use internal state
  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  const form = useForm<IClientInviteForm>({
    resolver: zodResolver(supportInvitationSendValidator.shape.body),
    defaultValues: {
      name: '',
      email: '',
      companyName: '',
      jobTitle: '',
      type: SupportInvitationTypeEnum.CLIENT,
      accountManagerId: undefined,
    },
  });

  // Fetch account managers for the dialog
  const { data: accountManagers, isLoading: isLoadingAccountManagers } =
    useQuery({
      queryKey: ['account-managers'],
      queryFn: async () => {
        return await supportAccountManagerAssignmentService.getAllAccountManagers();
      },
    });

  const onSubmit = async (data: IClientInviteForm) => {
    try {
      setIsLoading(true);

      // Validate that account manager is selected for client invitations
      if (!data.accountManagerId) {
        toast.error('Account Manager is required for client invitations');
        return;
      }

      // The form data now includes the type field, so we can use it directly
      // const result = await supportInvitationService.sendInvitation(data);

      if (user?.id) {
        try {
          await activityLogService.createActivityLog({
            entityType: ActivityEntityTypeEnum.CLIENT,
            entityId: user?.supportUserId,
            module: ActivityModuleEnum.SYSTEM,
            action: ActivityActionEnums.CREATE,
            description: `Client invitation sent to ${data.email} by support user ${user.name}`,
            metadata: {
              title: ActivityTitleEnum.PROFILE_CREATED,
              clientName: data.name,
              clientEmail: data.email,
              clientCompanyName: data.companyName,
              clientJobTitle: data.jobTitle,
              userName: user.name,
              createdById: user.id,
            },
          });
        } catch (logError) {
          logger.warn('Failed to log activity:', logError);
        }
      }

      queryClient.invalidateQueries({
        queryKey: ['supportClientInvitations'],
      });

      toast.success('Client invitation sent successfully');
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
          <DialogTitle>Send Client Invitation</DialogTitle>
          <DialogDescription>
            Send an invitation to a client to join the platform
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
            <FormField
              control={form.control}
              name="jobTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title</FormLabel>
                  <FormControl>
                    <Input placeholder="HR Manager" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="accountManagerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Manager *</FormLabel>
                  <Select
                    disabled={isLoadingAccountManagers}
                    onValueChange={field.onChange}
                    value={field.value || ''}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select account manager" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {accountManagers?.map((manager) => (
                        <SelectItem key={manager.id} value={manager.id}>
                          {manager.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
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

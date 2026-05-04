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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  supportInvitationService,
  activityLogService,
} from '@/lib/services/services';
import { useQueryClient } from '@tanstack/react-query';
import {
  SupportUserRoleEnum,
  SupportDepartmentEnum,
  SupportInvitationTypeEnum,
  ActivityModuleEnum,
  ActivityEntityTypeEnum,
  UserRoleEnum,
} from '@/lib/shared/models/common/enums';
import { supportInvitationSendValidator } from '@/lib/shared/validators/support/invitation.validator';
import { IUser } from '@/lib/shared/models/domain/user/user.domain';
import { ActivityActionEnums, ActivityTitleEnum } from '@/lib/models/activity';
import { useApp } from '@/lib/context/app-context';
import { logger } from '@/lib/logger';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { formatEnumValue } from '@/lib/utils';

interface AddSupportUserDialogProps {
  onInviteSuccess?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  isInviteMode?: boolean;
  accountManagers?: IUser[];
}

export function AddSupportUserDialog({
  onInviteSuccess,
  open,
  onOpenChange,
  isInviteMode = true,
  accountManagers = [],
}: AddSupportUserDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useApp();
  const queryClient = useQueryClient();

  // Use external open state if provided, otherwise use internal
  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  // Form for inviting support user
  const inviteForm = useForm<
    z.infer<typeof supportInvitationSendValidator.shape.body>
  >({
    resolver: zodResolver(supportInvitationSendValidator.shape.body),
    defaultValues: {
      name: '',
      email: '',
      jobTitle: '',
      role: UserRoleEnum.HR,
      department: undefined,
      supportLevel: undefined,
      type: SupportInvitationTypeEnum.SUPPORT_USER,
      accountManagerId: undefined,
    },
  });

  // Watch the role field to conditionally show account manager selection
  const selectedRole = inviteForm.watch('role');

  // Reset forms when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      inviteForm.reset();
      setIsSubmitting(false);
    }
  }, [isOpen, inviteForm]);

  const handleInviteSubmit = async (
    values: z.infer<typeof supportInvitationSendValidator.shape.body>
  ) => {
    logger.info('onSubmit', values);
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Build payload, omitting optional fields if empty
      const payload: any = {
        name: values.name,
        email: values.email,
        type: values.type,
        role: values.role,
      };
      if (values.jobTitle && values.jobTitle.trim() !== '') {
        payload.jobTitle = values.jobTitle;
      }
      if (values.department) {
        payload.department = values.department;
      }
      if (values.supportLevel) {
        payload.supportLevel = values.supportLevel;
      }
      if (values.accountManagerId) {
        payload.accountManagerId = values.accountManagerId;
      }

      await supportInvitationService.sendInvitation(payload);
      queryClient.invalidateQueries({ queryKey: ['supportUserInvitations'] });

      // Log activity
      if (user?.id) {
        try {
          await activityLogService.createActivityLog({
            entityType: ActivityEntityTypeEnum.USER,
            entityId: user?.supportUserId,
            module: ActivityModuleEnum.SYSTEM,
            action: ActivityActionEnums.CREATE,
            description: `Support user invitation sent to ${values.name} by support user ${user.name}`,
            metadata: {
              title: ActivityTitleEnum.INVITE_CANDIDATE,
              supportUserName: values.name,
              supportUserEmail: values.email,
              supportUserRole: values.role,
              supportUserDepartment: values.department,
              supportUserLevel: values.supportLevel,
              accountManagerId: values.accountManagerId,
              userName: user.name,
              createdById: user.id,
            },
          });
        } catch (logError) {
          logger.warn('Failed to log activity:', logError);
        }
      }

      toast.success('Invitation sent', {
        description: `An invitation has been sent to ${values.email}.`,
      });
      inviteForm.reset();
      setIsOpen(false);
      onInviteSuccess?.();
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

  const handleClose = () => {
    setIsSubmitting(false);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {!isInviteMode && (
        <DialogTrigger asChild>
          <Button size="sm" className="h-8 gap-1 rounded-md">
            <Plus className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Support User
            </span>
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isInviteMode ? 'Invite Support User' : 'Add New Support User'}
          </DialogTitle>
          <DialogDescription>
            {isInviteMode
              ? 'Send an invitation to join the platform as a support user.'
              : 'Create a new support user profile. Fields marked with * are required.'}
          </DialogDescription>
        </DialogHeader>

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
            <FormField
              control={inviteForm.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    disabled={isSubmitting}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(SupportUserRoleEnum).map((role) => (
                        <SelectItem key={role} value={role}>
                          {formatEnumValue(role)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Account Manager selection - only show when role is RECRUITER */}
            {selectedRole === UserRoleEnum.RECRUITER && (
              <FormField
                control={inviteForm.control}
                name="accountManagerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Manager</FormLabel>
                    <Select
                      disabled={isSubmitting}
                      onValueChange={field.onChange}
                      value={field.value || ''}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select account manager" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {accountManagers.map((manager) => (
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
            )}
            <FormField
              control={inviteForm.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department (Optional)</FormLabel>
                  <Select
                    disabled={isSubmitting}
                    onValueChange={(value) =>
                      field.onChange(
                        value === 'no-department' ? undefined : value
                      )
                    }
                    value={field.value || 'no-department'}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a department" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="no-department">
                        No Department
                      </SelectItem>
                      {Object.values(SupportDepartmentEnum).map(
                        (department) => (
                          <SelectItem key={department} value={department}>
                            {formatEnumValue(department)}
                          </SelectItem>
                        )
                      )}
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
      </DialogContent>
    </Dialog>
  );
}

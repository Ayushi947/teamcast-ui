'use client';

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
import {
  supportUserManagementService,
  activityLogService,
} from '@/lib/services/services';
import { logger } from '@/lib/logger';
import {
  supportUserUpdateValidator,
  ISupportUserUpdate,
  SupportUserRoleEnum,
  UserRoleEnum,
  UserStatusEnum,
  SupportDepartmentEnum,
  ActivityModuleEnum,
  ActivityEntityTypeEnum,
} from '@/lib/shared';
import { formatEnumValue } from '@/lib/utils';
import { ActivityActionEnums, ActivityTitleEnum } from '@/lib/models/activity';
import { useApp } from '@/lib/context/app-context';

// Define local User type
type User = {
  id: string;
  name: string;
  email: string;
  role: UserRoleEnum;
  status: UserStatusEnum;
  avatar?: string;
  jobTitle?: string;
  department?: SupportDepartmentEnum;
};

// Use the updateSupportUserSchema from @/lib/shared
const editUserSchema = supportUserUpdateValidator.shape.body;

interface EditUserDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditSuccess?: () => void;
}

export function EditUserDialog({
  user,
  open,
  onOpenChange,
  onEditSuccess,
}: EditUserDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user: currentUser } = useApp();

  const form = useForm<z.infer<typeof editUserSchema>>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      name: user.name,
      role: user.role as UserRoleEnum,
      status: user.status as UserStatusEnum,
      jobTitle: user.jobTitle,
      department: user.department,
    },
  });

  // Update form values when user changes
  useEffect(() => {
    if (open && user.id) {
      form.reset({
        name: user.name,
        role: user.role as UserRoleEnum,
        status: user.status as UserStatusEnum,
        jobTitle: user.jobTitle,
        department: user.department,
      });
    }
  }, [form, user, open]);

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

  const onSubmit = async (values: z.infer<typeof editUserSchema>) => {
    if (!user.id) return;

    setIsSubmitting(true);
    try {
      // Update the user with the API
      await supportUserManagementService.updateSupportUser(user.id, {
        name: values.name,
        role: values.role,
        status: values.status,
        jobTitle: values.jobTitle,
        department: values.department,
      } as ISupportUserUpdate);

      if (currentUser?.id) {
        try {
          //this is for updating the support user
          await activityLogService.createActivityLog({
            entityType: ActivityEntityTypeEnum.USER,
            entityId: user?.id,
            module: ActivityModuleEnum.SYSTEM,
            action: ActivityActionEnums.UPDATE,
            description: `Support user ${values.name} updated by ${currentUser.name}`,
            metadata: {
              title: ActivityTitleEnum.PROFILE_UPDATED,
              valueName: values.name,
              userEmail: user.email,
              userRole: values.role,
              department: values.department,
              jobTitle: values.jobTitle,
              userName: currentUser.name,
              updatedById: currentUser.id,
              changes: {
                name:
                  user.name !== values.name
                    ? { from: user.name, to: values.name }
                    : undefined,
                role:
                  user.role !== values.role
                    ? { from: user.role, to: values.role }
                    : undefined,
                jobTitle:
                  user.jobTitle !== values.jobTitle
                    ? { from: user.jobTitle, to: values.jobTitle }
                    : undefined,
                department:
                  user.department !== values.department
                    ? { from: user.department, to: values.department }
                    : undefined,
              },
            },
          });
        } catch (logError) {
          logger.warn('Failed to log activity:', logError);
        }
      }

      toast.success('User updated', {
        description: `${values.name}'s information has been updated.`,
      });

      handleClose();
      onEditSuccess?.();
    } catch (error) {
      toast.error('Error updating user', {
        description: 'An error occurred while updating the user information.',
      });
      logger.error('Error updating user', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user information, role, department, and support level.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                name="jobTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Support Engineer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="text-muted-foreground text-sm">
              Email: {user.email} (cannot be changed)
            </div>
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
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
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(UserStatusEnum).map((status) => (
                          <SelectItem key={status} value={status}>
                            {formatEnumValue(status)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
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
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

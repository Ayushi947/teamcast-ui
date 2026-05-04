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
import { clientUserManagementService } from '@/lib/services/services';
import { logger } from '@/lib/logger';
import {
  clientUserUpdateValidator,
  IApiResponse,
  IClientUserUpdate,
  UserRoleEnum,
  UserStatusEnum,
} from '@/lib/shared';
import { useApp } from '@/lib/context/app-context';
import { AxiosError } from 'axios';

// Define local User type
type User = {
  id: string;
  name: string;
  email: string;
  role: UserRoleEnum;
  status: UserStatusEnum;
  avatar?: string;
};

// Use the updateClientUserSchema from @/lib/shared
const editUserSchema = clientUserUpdateValidator.shape.body;

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

  // Check if the user being edited is the current user and is an ADMIN
  const isSelfAdmin =
    currentUser?.id === user.id && user.role === UserRoleEnum.ADMIN;

  const form = useForm<z.infer<typeof editUserSchema>>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      name: user.name,
      role: user.role as UserRoleEnum,
      status: user.status as UserStatusEnum,
    },
  });

  // Update form values when user changes
  useEffect(() => {
    if (open && user.id) {
      form.reset({
        name: user.name,
        role: user.role as UserRoleEnum,
        status: user.status as UserStatusEnum,
      });
    }
  }, [form, user, open]);

  // Ensure role stays ADMIN if user is editing themselves as admin
  useEffect(() => {
    if (isSelfAdmin && form.getValues('role') !== UserRoleEnum.ADMIN) {
      form.setValue('role', UserRoleEnum.ADMIN);
    }
  }, [isSelfAdmin, form]);

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

  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
      const apiError = error as unknown as AxiosError<IApiResponse<unknown>>;
      if (apiError.response?.data?.message) {
        return apiError.response.data.message;
      }

      if (error.message) {
        return error.message;
      }
    }

    return 'An error occurred while updating the user information. Please try again.';
  };

  const onSubmit = async (values: z.infer<typeof editUserSchema>) => {
    if (!user.id) return;

    // Prevent admin from demoting themselves
    if (isSelfAdmin && values.role !== UserRoleEnum.ADMIN) {
      toast.error('Cannot change role', {
        description:
          'You cannot change your own role from Admin to a lower role.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Update the user with the API
      await clientUserManagementService.updateUser(user.id, {
        name: values.name,
        role: values.role,
        status: values.status,
      } as IClientUserUpdate);

      toast.success('User updated', {
        description: `${values.name}'s information has been updated.`,
      });

      handleClose();
      onEditSuccess?.();
    } catch (error) {
      const errorMessage = getErrorMessage(error);

      // Determine appropriate title based on error message
      let errorTitle = 'Error updating user';
      if (errorMessage.includes('role')) {
        errorTitle = 'Cannot change role';
      } else if (
        errorMessage.includes('permission') ||
        errorMessage.includes('forbidden')
      ) {
        errorTitle = 'Permission denied';
      } else if (errorMessage.includes('not found')) {
        errorTitle = 'User not found';
      }

      toast.error(errorTitle, {
        description: errorMessage,
      });
      logger.error('Error updating user', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background text-foreground sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Update user information and role.
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
                      className="text-foreground placeholder:text-muted-foreground"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="text-muted-foreground text-sm">
              Email: {user.email} (cannot be changed)
            </div>
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      // Prevent role change if self-admin
                      if (isSelfAdmin && value !== UserRoleEnum.ADMIN) {
                        toast.error('Cannot change role', {
                          description:
                            'You cannot change your own role from Admin to a lower role.',
                        });
                        return;
                      }
                      field.onChange(value);
                    }}
                    value={field.value}
                    disabled={isSelfAdmin}
                  >
                    <FormControl>
                      <SelectTrigger
                        className="text-foreground"
                        disabled={isSelfAdmin}
                      >
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
                  {isSelfAdmin && (
                    <p className="text-muted-foreground mt-1 text-xs">
                      You cannot change your own role from Admin.
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="text-foreground">
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={UserStatusEnum.ACTIVE}>
                        Active
                      </SelectItem>
                      <SelectItem value={UserStatusEnum.INACTIVE}>
                        Inactive
                      </SelectItem>
                      <SelectItem value={UserStatusEnum.BLOCKED}>
                        Blocked
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
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

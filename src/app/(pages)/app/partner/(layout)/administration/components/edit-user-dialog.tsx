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
import { logger } from '@/lib/logger';
import { partnerUserManagementService } from '@/lib/services/services';
import {
  partnerUserUpdateValidator,
  UserRoleEnum,
  UserStatusEnum,
} from '@/lib/shared';

// Use the updatePartnerUserSchema from @/lib/shared
const editUserSchema = partnerUserUpdateValidator.shape.body;

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRoleEnum;
    status: UserStatusEnum;
  };
  onEditSuccess?: () => void;
}

export function EditUserDialog({
  open,
  onOpenChange,
  user,
  onEditSuccess,
}: EditUserDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof editUserSchema>>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    },
  });

  // Update form values when user changes
  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      });
    }
  }, [user, form]);

  // Handle clean up when dialog closes
  useEffect(() => {
    if (!open) {
      // Add a small delay to ensure cleanup happens after animations
      const timer = setTimeout(() => {
        setIsSubmitting(false);
        form.reset();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open, form]);

  const handleClose = () => {
    onOpenChange(false);
  };

  const onSubmit = async (values: z.infer<typeof editUserSchema>) => {
    setIsSubmitting(true);
    try {
      await partnerUserManagementService.updateUser(user.id, values);

      toast.success('User updated', {
        description: `${values.name}'s information has been updated.`,
      });

      handleClose();
      onEditSuccess?.();
    } catch (error) {
      toast.error('Error updating user', {
        description: 'An error occurred while updating the user.',
      });
      logger.error('Error updating user', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
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
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
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
                      <SelectTrigger>
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
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      {...field}
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

'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserRoleEnum, UserStatusEnum } from '@/lib/shared';
import { formatEnumValue } from '@/lib/utils';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { supportAccountManagerAssignmentService } from '@/lib/services/services';
import { Edit2, Check, Users } from 'lucide-react';

// Validation schema for the assign account manager form
const assignAccountManagerSchema = z.object({
  accountManagerId: z.string().min(1, 'Please select an account manager'),
});

type AssignAccountManagerFormValues = z.infer<
  typeof assignAccountManagerSchema
>;

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRoleEnum;
  status: UserStatusEnum;
  avatar?: string;
  jobTitle?: string;
  accountManagerAssigned?: boolean;
}

interface AssignAccountManagerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  onAssignSuccess: () => void;
}

export function AssignAccountManagerModal({
  open,
  onOpenChange,
  user,
  onAssignSuccess,
}: AssignAccountManagerModalProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(true);
  const [selectedAccountManager, setSelectedAccountManager] =
    useState<any>(null);

  const form = useForm<AssignAccountManagerFormValues>({
    resolver: zodResolver(assignAccountManagerSchema),
    defaultValues: {
      accountManagerId: '',
    },
  });

  // Fetch account managers from API
  const { data: accountManagers, isLoading: isLoadingAccountManagers } =
    useQuery({
      queryKey: ['account-managers'],
      queryFn: async () => {
        return await supportAccountManagerAssignmentService.getAllAccountManagers();
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    });

  // Fetch current account manager if one is assigned
  const {
    data: currentAccountManager,
    isLoading: isLoadingCurrentAccountManager,
  } = useQuery({
    queryKey: ['current-account-manager', user.id],
    queryFn: async () => {
      if (!user.accountManagerAssigned) return null;
      try {
        return await supportAccountManagerAssignmentService.getAccountManagerByRecruiterId(
          user.id
        );
      } catch (error) {
        logger.error('Error fetching current account manager:', error);
        return null;
      }
    },
    enabled: open && user.accountManagerAssigned === true,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });

  // Use account managers from API, fallback to empty array if still loading
  const availableAccountManagers = accountManagers || [];

  // Watch for form value changes to update selected account manager
  const watchedAccountManagerId = form.watch('accountManagerId');

  useEffect(() => {
    if (watchedAccountManagerId && availableAccountManagers.length > 0) {
      const manager = availableAccountManagers.find(
        (am) => am.id === watchedAccountManagerId
      );
      setSelectedAccountManager(manager);
      setIsEditMode(false);
    } else {
      setSelectedAccountManager(null);
      setIsEditMode(true);
    }
  }, [watchedAccountManagerId, availableAccountManagers]);

  const handleFormClose = () => {
    // Reset submission state and form
    setIsSubmitting(false);
    setIsEditMode(true);
    setSelectedAccountManager(null);
    form.reset();
    onOpenChange(false);
  };

  const handleEditClick = () => {
    setIsEditMode(true);
    setSelectedAccountManager(null);
  };

  const onSubmit = async (data: AssignAccountManagerFormValues) => {
    try {
      setIsSubmitting(true);

      // Find the selected account manager
      const selectedAccountManager = availableAccountManagers.find(
        (am) => am.id === data.accountManagerId
      );

      if (!selectedAccountManager) {
        toast.error('Selected account manager not found');
        return;
      }

      // Determine if this is an assignment or a change
      const isChange = user.accountManagerAssigned === true;

      logger.info(
        isChange ? 'Changing account manager:' : 'Assigning account manager:',
        {
          userId: user.id,
          accountManagerId: data.accountManagerId,
          accountManagerName: selectedAccountManager.name,
          isChange,
        }
      );

      // Call the appropriate API based on whether there's an existing assignment
      if (isChange) {
        await supportAccountManagerAssignmentService.changeAccountManagerForRecruiter(
          user.id,
          data.accountManagerId as string
        );
      } else {
        await supportAccountManagerAssignmentService.assignAccountManagerToRecruiter(
          user.id,
          data.accountManagerId as string
        );
      }

      toast.success(
        isChange
          ? 'Account manager changed successfully'
          : 'Account manager assigned successfully',
        {
          description: `${selectedAccountManager.name} has been ${isChange ? 'assigned' : 'assigned'} to ${user.name}`,
        }
      );

      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({
        queryKey: ['current-account-manager', user.id],
      });
      await queryClient.invalidateQueries({
        queryKey: ['supportUsers'],
      });

      onAssignSuccess();
      handleFormClose();
    } catch (error) {
      logger.error('Error with account manager assignment:', error);
      const isChange = user.accountManagerAssigned === true;
      toast.error(
        isChange
          ? 'Failed to change account manager'
          : 'Failed to assign account manager',
        {
          description: `An error occurred while ${isChange ? 'changing' : 'assigning'} the account manager.`,
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const getStatusBadgeColor = (status: UserStatusEnum) => {
    switch (status) {
      case UserStatusEnum.ACTIVE:
        return {
          bg: 'bg-emerald-100 dark:bg-emerald-900/20',
          text: 'text-emerald-700 dark:text-emerald-300',
          border: 'border-emerald-200 dark:border-emerald-800',
        };
      case UserStatusEnum.INACTIVE:
        return {
          bg: 'bg-amber-100 dark:bg-amber-900/20',
          text: 'text-amber-700 dark:text-amber-300',
          border: 'border-amber-200 dark:border-amber-800',
        };
      case UserStatusEnum.BLOCKED:
        return {
          bg: 'bg-red-100 dark:bg-red-900/20',
          text: 'font-semibold text-red-700 dark:text-red-300',
          border: 'border-red-200 dark:border-red-800',
        };
      default:
        return {
          bg: 'bg-gray-100 dark:bg-gray-900/20',
          text: 'text-gray-700 dark:text-gray-300',
          border: 'border-gray-200 dark:border-gray-800',
        };
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <Users className="h-5 w-5 text-blue-600" />
            {user.accountManagerAssigned
              ? 'Change Account Manager'
              : 'Assign Account Manager'}
          </DialogTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {user.accountManagerAssigned
              ? 'Select a new account manager for this recruiter'
              : 'Select an account manager to assign to this recruiter'}
          </p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Recruiter Details Section */}
            <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-3">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Recruiter Details
                </h3>
              </div>

              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="bg-purple-100 text-lg font-semibold text-purple-700 dark:bg-purple-800 dark:text-purple-200">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-2">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {user.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {user.email}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`text-sm ${
                        getStatusBadgeColor(user.status).bg
                      } ${getStatusBadgeColor(user.status).text} ${
                        getStatusBadgeColor(user.status).border
                      }`}
                    >
                      {formatEnumValue(user.status)}
                    </Badge>
                  </div>

                  {user.jobTitle && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user.jobTitle}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Current Account Manager Section - Only show when changing */}
            {user.accountManagerAssigned && currentAccountManager && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
                <div className="mb-3">
                  <h3 className="text-sm font-medium text-amber-900 dark:text-amber-100">
                    Current Account Manager
                  </h3>
                </div>

                <div className="flex items-start gap-4">
                  <Avatar className="h-14 w-14">
                    <AvatarImage
                      src={currentAccountManager.image}
                      alt={currentAccountManager.name}
                    />
                    <AvatarFallback className="bg-amber-200 text-base font-semibold text-amber-900 dark:bg-amber-800 dark:text-amber-100">
                      {getInitials(currentAccountManager.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-1">
                    <div>
                      <h4 className="text-base font-semibold text-amber-900 dark:text-amber-100">
                        {currentAccountManager.name}
                      </h4>
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        {currentAccountManager.email}
                      </p>
                    </div>

                    {currentAccountManager.jobTitle && (
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        {currentAccountManager.jobTitle}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Loading state for current account manager */}
            {user.accountManagerAssigned && isLoadingCurrentAccountManager && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 animate-pulse rounded-full bg-gray-300 dark:bg-gray-700"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 animate-pulse rounded bg-gray-300 dark:bg-gray-700"></div>
                    <div className="h-3 w-48 animate-pulse rounded bg-gray-300 dark:bg-gray-700"></div>
                  </div>
                </div>
              </div>
            )}

            {/* Account Manager Selection or Display */}
            <div className="space-y-4">
              <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                <div className="mb-4">
                  <FormLabel className="text-sm font-medium">
                    Account Manager
                  </FormLabel>
                </div>

                {isEditMode ? (
                  <div className="space-y-3">
                    <FormField
                      control={form.control}
                      name="accountManagerId"
                      render={({ field }) => (
                        <FormItem>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={isSubmitting || isLoadingAccountManagers}
                          >
                            <FormControl>
                              <SelectTrigger className="h-12 px-4">
                                <SelectValue placeholder="Choose an account manager" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {isLoadingAccountManagers ? (
                                <SelectItem value="" disabled>
                                  Loading account managers...
                                </SelectItem>
                              ) : availableAccountManagers.length === 0 ? (
                                <SelectItem value="" disabled>
                                  No account managers available
                                </SelectItem>
                              ) : (
                                availableAccountManagers.map((manager) => (
                                  <SelectItem
                                    key={manager.id}
                                    value={manager.id}
                                  >
                                    <div className="flex items-center gap-2">
                                      <Avatar className="h-6 w-6">
                                        <AvatarImage
                                          src={undefined}
                                          alt={manager.name}
                                        />
                                        <AvatarFallback className="bg-purple-100 text-xs text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                                          {getInitials(manager.name)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <div className="font-medium">
                                          {manager.name}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          {manager.email}
                                        </div>
                                      </div>
                                    </div>
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ) : selectedAccountManager ? (
                  /* Selected Account Manager Display */
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-1 items-start gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage
                          src={undefined}
                          alt={selectedAccountManager.name}
                        />
                        <AvatarFallback className="bg-blue-100 text-lg font-semibold text-blue-700 dark:bg-blue-800 dark:text-blue-200">
                          {getInitials(selectedAccountManager.name)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 space-y-2">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {selectedAccountManager.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {selectedAccountManager.email}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="border-blue-300 bg-blue-100 text-blue-800 dark:border-blue-700 dark:bg-blue-800/50 dark:text-blue-200"
                          >
                            <Check className="mr-1 h-3 w-3" />
                            Selected
                          </Badge>
                        </div>

                        {selectedAccountManager.jobTitle && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {selectedAccountManager.jobTitle}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleEditClick}
                        disabled={isSubmitting}
                        className="flex items-center gap-1"
                      >
                        <Edit2 className="h-3 w-3" />
                        Edit
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleFormClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  isSubmitting || (!selectedAccountManager && isEditMode)
                }
                className="bg-primary hover:bg-primary/90 dark:hover:bg-primary/90 text-white dark:text-white"
              >
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Assigning...
                  </>
                ) : selectedAccountManager && !isEditMode ? (
                  'Confirm Assignment'
                ) : (
                  'Assign Manager'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

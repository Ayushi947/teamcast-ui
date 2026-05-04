'use client';

import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supportAccountManagerAssignmentService } from '@/lib/services/services';
import { toast } from 'sonner';
import {
  UserCheck,
  HeadphonesIcon,
  CheckCircle,
  AlertCircle,
  Loader2,
  UserCog,
  Mail,
  Briefcase,
  User,
} from 'lucide-react';
import { formatEnumValue } from '@/lib/utils';

interface AccountManagerUpdateTabProps {
  form: UseFormReturn<any>;
  isSubmitting: boolean;
  clientId: string;
  currentAccountManager?: any;
}

export function AccountManagerUpdateTab({
  isSubmitting,
  clientId,
}: AccountManagerUpdateTabProps) {
  const [selectedAccountManagerId, setSelectedAccountManagerId] =
    useState<string>('');
  const queryClient = useQueryClient();

  // Fetch all available account managers
  const { data: accountManagers, isLoading: isLoadingAccountManagers } =
    useQuery({
      queryKey: ['account-managers'],
      queryFn: () =>
        supportAccountManagerAssignmentService.getAllAccountManagers(),
    });

  // Fetch current account manager for this client
  const { data: currentManager, isLoading: isLoadingCurrentManager } = useQuery(
    {
      queryKey: ['account-manager', clientId],
      queryFn: () =>
        supportAccountManagerAssignmentService.getAccountManagerByClientId(
          clientId
        ),
      enabled: !!clientId,
    }
  );

  // Filter out the current account manager from the available list
  const availableAccountManagers =
    accountManagers?.filter(
      (manager) => manager.email !== currentManager?.email
    ) || [];

  // Mutation for changing account manager
  const changeAccountManagerMutation = useMutation({
    mutationFn: ({
      clientId,
      accountManagerId,
    }: {
      clientId: string;
      accountManagerId: string;
    }) =>
      supportAccountManagerAssignmentService.changeAccountManager(
        clientId,
        accountManagerId
      ),
    onSuccess: () => {
      toast.success('Account manager assigned successfully!');
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ['account-manager', clientId],
      });
      queryClient.invalidateQueries({ queryKey: ['support-client', clientId] });
    },
    onError: (error: any) => {
      toast.error('Failed to assign account manager', {
        description: error?.message || 'Please try again.',
      });
    },
  });

  const handleAssignAccountManager = async () => {
    if (!selectedAccountManagerId) {
      toast.error('Please select an account manager');
      return;
    }

    try {
      await changeAccountManagerMutation.mutateAsync({
        clientId,
        accountManagerId: selectedAccountManagerId,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const isLoading = isLoadingAccountManagers || isLoadingCurrentManager;

  return (
    <div className="space-y-8">
      {/* Current Account Manager */}
      <Card className="overflow-hidden border-0 bg-white dark:border-gray-700 dark:bg-gray-800">
        <CardHeader className="bg-primary/5 dark:bg-primary/10 border-b border-gray-100 px-6 py-4 dark:border-gray-700">
          <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900 dark:text-white">
            <div className="bg-primary/10 dark:bg-primary/20 flex h-10 w-10 items-center justify-center rounded-full">
              <UserCheck className="text-primary h-5 w-5" />
            </div>
            Current Account Manager
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {isLoadingCurrentManager ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="text-primary h-8 w-8 animate-spin" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Loading account manager details...
                </p>
              </div>
            </div>
          ) : currentManager ? (
            <div className="flex items-start gap-6">
              <Avatar className="h-20 w-20 border-4 border-white dark:border-gray-700">
                <AvatarImage
                  src={currentManager.image || ''}
                  alt={currentManager.name}
                />
                <AvatarFallback className="bg-primary text-lg font-semibold text-white">
                  {currentManager.name
                    ?.split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .toUpperCase() || 'AM'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {currentManager.name}
                  </h3>
                  <Badge
                    variant="outline"
                    className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-700/30 dark:bg-emerald-900/20 dark:text-emerald-300"
                  >
                    {formatEnumValue(currentManager.role)}
                  </Badge>
                </div>
                <div className="grid gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{currentManager.email}</span>
                  </div>
                  {currentManager.jobTitle && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-gray-400" />
                      <span>{currentManager.jobTitle}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="font-medium capitalize">
                      {currentManager.status.toLowerCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-700/30 dark:bg-orange-900/20">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <div>
                <p className="font-medium text-orange-800 dark:text-orange-200">
                  No Account Manager Assigned
                </p>
                <p className="text-sm text-orange-600 dark:text-orange-300">
                  This client currently doesn&apos;t have an account manager
                  assigned.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assign New Account Manager */}
      <Card className="overflow-hidden border-0 bg-white dark:border-gray-700 dark:bg-gray-800">
        <CardHeader className="bg-primary/5 dark:bg-primary/10 border-b border-gray-100 px-6 py-4 dark:border-gray-700">
          <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900 dark:text-white">
            <div className="bg-primary/10 dark:bg-primary/20 flex h-10 w-10 items-center justify-center rounded-full">
              <HeadphonesIcon className="text-primary h-5 w-5" />
            </div>
            Assign New Account Manager
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="text-primary h-8 w-8 animate-spin" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Loading available account managers...
                </p>
              </div>
            </div>
          ) : availableAccountManagers.length > 0 ? (
            <div className="space-y-6">
              <div className="mb-6">
                <Label className="text-base font-semibold text-gray-900 dark:text-white">
                  Select an account manager to assign to this client:
                </Label>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Choose from the available account managers below
                </p>
              </div>

              {/* Scrollable list with sticky button */}
              <div className="relative">
                <div className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800 mb-6 max-h-80 overflow-y-auto pr-2">
                  <RadioGroup
                    value={selectedAccountManagerId}
                    onValueChange={setSelectedAccountManagerId}
                    className="space-y-4"
                  >
                    {availableAccountManagers.map((manager) => (
                      <div
                        key={manager.id}
                        className={`group relative flex items-center space-x-4 rounded-xl border-2 p-5 transition-all duration-200 ${
                          selectedAccountManagerId === manager.id
                            ? 'border-primary bg-primary/5 dark:border-primary dark:bg-primary/10'
                            : 'border-gray-200 bg-white hover:border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-gray-500'
                        }`}
                      >
                        <RadioGroupItem
                          value={manager.id}
                          id={manager.id}
                          className="text-primary h-5 w-5"
                        />
                        <div className="flex flex-1 items-center gap-4">
                          <Avatar className="h-14 w-14 border-3 border-white dark:border-gray-700">
                            <AvatarImage
                              src={manager.image || ''}
                              alt={manager.name}
                            />
                            <AvatarFallback className="bg-primary text-base font-semibold text-white">
                              {manager.name
                                ?.split(' ')
                                .map((n: string) => n[0])
                                .join('')
                                .toUpperCase() || 'AM'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-3">
                              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {manager.name}
                              </h4>
                              <Badge
                                variant="outline"
                                className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-700/30 dark:bg-emerald-900/20 dark:text-emerald-300"
                              >
                                {formatEnumValue(manager.role)}
                              </Badge>
                              {manager.status === 'ACTIVE' && (
                                <Badge
                                  variant="secondary"
                                  className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                                >
                                  <CheckCircle className="mr-1 h-3 w-3" />
                                  Active
                                </Badge>
                              )}
                            </div>
                            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                              <div className="flex items-center gap-2">
                                <Mail className="h-3 w-3" />
                                {manager.email}
                              </div>
                              {manager.jobTitle && (
                                <div className="flex items-center gap-2">
                                  <Briefcase className="h-3 w-3" />
                                  {manager.jobTitle}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Sticky button */}
                <div className="sticky right-0 bottom-0 left-0 z-10 border-t border-gray-200 bg-white/95 pt-4 pb-2 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/95">
                  <Button
                    type="button"
                    onClick={handleAssignAccountManager}
                    disabled={
                      !selectedAccountManagerId ||
                      isSubmitting ||
                      changeAccountManagerMutation.isPending
                    }
                    className="bg-primary hover:bg-primary/90 w-full px-6 py-3 text-white transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {changeAccountManagerMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Assigning Account Manager...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <UserCog className="h-4 w-4" />
                        Assign Selected Account Manager
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-700/30 dark:bg-orange-900/20">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <div>
                <p className="font-medium text-orange-800 dark:text-orange-200">
                  No Available Account Managers
                </p>
                <p className="text-sm text-orange-600 dark:text-orange-300">
                  {currentManager
                    ? 'No other account managers are available for assignment'
                    : 'No account managers are currently available for assignment'}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

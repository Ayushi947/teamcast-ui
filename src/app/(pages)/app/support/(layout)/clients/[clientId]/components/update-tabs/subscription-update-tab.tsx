'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CreditCard,
  Calendar,
  Package,
  RefreshCw,
  TrendingUp,
  Users,
  AlertCircle,
} from 'lucide-react';
import { ISupportClient, ClientSubscriptionStatusEnum } from '@/lib/shared';
import { formatEnumValue } from '@/lib/utils';

// Helper function to convert ISO date string to HTML date input format (YYYY-MM-DD)
const formatDateForInput = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

import { clientSubscriptionService } from '@/lib/services/services';
import { useQuery } from '@tanstack/react-query';

interface SubscriptionUpdateTabProps {
  form: UseFormReturn<any>;
  isSubmitting: boolean;
  client: ISupportClient;
}

const formatUsageQuota = (used?: number, total?: number) => {
  const safeUsed = used || 0;
  if (!total || total <= 0) {
    return `${safeUsed} / Unlimited`;
  }
  return `${safeUsed} / ${total}`;
};

export function SubscriptionUpdateTab({
  form,
  isSubmitting,
  client,
}: SubscriptionUpdateTabProps) {
  const { data: packages, isLoading: loadingPackages } = useQuery({
    queryKey: ['subscription-packages'],
    queryFn: () =>
      clientSubscriptionService.getSubscriptionPackages({
        page: 1,
        limit: 100,
      }),
  });
  React.useEffect(() => {
    if (client?.subscription) {
      form.setValue('subscription.packageId', client.subscription.packageId);
      form.setValue('subscription.status', client.subscription.status);
      form.setValue(
        'subscription.startDate',
        client.subscription.startDate
          ? formatDateForInput(client.subscription.startDate.toString())
          : ''
      );
      form.setValue(
        'subscription.endDate',
        client.subscription.endDate
          ? formatDateForInput(client.subscription.endDate.toString())
          : ''
      );
      form.setValue('subscription.autoRenew', client.subscription.autoRenew);
      form.setValue(
        'subscription.additionalCandidateViewCredits',
        client.subscription.additionalCandidateViewCredits || 0
      );
      form.setValue(
        'subscription.additionalAiAssessmentCredits',
        client.subscription.additionalAiAssessmentCredits || 0
      );
      form.setValue(
        'subscription.additionalSeatsCredits',
        client.subscription.additionalSeatsCredits || 0
      );
      form.setValue(
        'subscription.usedCandidateViews',
        client.subscription.usedCandidateViews || 0
      );
      form.setValue(
        'subscription.usedAiAssessments',
        client.subscription.usedAiAssessments || 0
      );
      form.setValue(
        'subscription.usedJobPostings',
        client.subscription.usedJobPostings || 0
      );
    }
  }, [client?.subscription, form]);
  return (
    <div className="space-y-6">
      {/* Subscription Settings */}
      <Card className="bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <CardHeader className="border-b border-gray-100 pb-4 dark:border-gray-700">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <CreditCard className="h-5 w-5" />
            Subscription Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="subscription.status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Subscription Status
                  </FormLabel>
                  <Select
                    disabled={isSubmitting}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="border-gray-300 focus:border-[#6e55cf] focus:ring-[#6e55cf] dark:border-gray-600">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(ClientSubscriptionStatusEnum).map(
                        (status) => (
                          <SelectItem key={status} value={status}>
                            {formatEnumValue(status)}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Current subscription status
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subscription.packageId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Subscription Package
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="border-gray-300 focus:border-[#6e55cf] focus:ring-[#6e55cf] dark:border-gray-600">
                        <SelectValue
                          placeholder={
                            loadingPackages
                              ? 'Loading packages...'
                              : 'Select package'
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {packages?.items?.map((pkg) => (
                        <SelectItem key={pkg.id} value={pkg.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {formatEnumValue(pkg.name)}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Select the subscription package
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subscription.startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Calendar className="h-4 w-4" />
                    Start Date
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      disabled={isSubmitting}
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="border-gray-300 focus:border-[#6e55cf] focus:ring-[#6e55cf] dark:border-gray-600"
                    />
                  </FormControl>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    When the subscription started
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subscription.endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Calendar className="h-4 w-4" />
                    End Date
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      disabled={isSubmitting}
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="border-gray-300 focus:border-[#6e55cf] focus:ring-[#6e55cf] dark:border-gray-600"
                    />
                  </FormControl>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    When the subscription expires
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="subscription.autoRenew"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="flex items-center space-x-3">
                  <RefreshCw className="h-4 w-4 text-gray-500" />
                  <div className="space-y-0.5">
                    <FormLabel className="text-sm font-medium">
                      Auto Renewal
                    </FormLabel>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Automatically renew the subscription when it expires
                    </p>
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isSubmitting}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Package Usage & Add Credits */}
      <Card className="bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <CardHeader className="border-b border-gray-100 pb-4 dark:border-gray-700">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <CreditCard className="h-5 w-5" />
            Package Credits & Additional Credits
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-4">
              <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Candidate Views Used
              </FormLabel>
              <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                {formatUsageQuota(
                  client.subscription?.usedCandidateViews,
                  client.subscription?.package?.maxCandidateViews
                )}
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Current package candidate view usage
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                AI Assessments Used
              </FormLabel>
              <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                {formatUsageQuota(
                  client.subscription?.usedAiAssessments,
                  client.subscription?.package?.maxAiAssessments
                )}
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Current package AI assessment usage
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Job Postings Used
              </FormLabel>
              <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                {formatUsageQuota(
                  client.subscription?.usedJobPostings,
                  client.subscription?.package?.maxJobPostings
                )}
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Current package job postings usage
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FormField
              control={form.control}
              name="subscription.additionalCandidateViewCredits"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Additional Candidate Views Credits
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      disabled={isSubmitting}
                      placeholder="0"
                      value={field.value || 0}
                      onChange={(e) =>
                        field.onChange(Number(e.target.value) || 0)
                      }
                      className="border-gray-300 focus:border-[#6e55cf] focus:ring-[#6e55cf] dark:border-gray-600"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subscription.additionalAiAssessmentCredits"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Additional Ai Assessment Credits
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      disabled={isSubmitting}
                      placeholder="0"
                      value={field.value || 0}
                      onChange={(e) =>
                        field.onChange(Number(e.target.value) || 0)
                      }
                      className="border-gray-300 focus:border-[#6e55cf] focus:ring-[#6e55cf] dark:border-gray-600"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subscription.additionalSeatsCredits"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Additional Seats Credits
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      disabled={isSubmitting}
                      placeholder="0"
                      value={field.value || 0}
                      onChange={(e) =>
                        field.onChange(Number(e.target.value) || 0)
                      }
                      className="border-gray-300 focus:border-[#6e55cf] focus:ring-[#6e55cf] dark:border-gray-600"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Subscription Analytics */}
      <Card className="bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <CardHeader className="border-b border-gray-100 pb-4 dark:border-gray-700">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <TrendingUp className="h-5 w-5" />
            Subscription Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {client.subscription?.usedSeats || 0}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Active Users
              </p>
            </div>

            <div className="rounded-lg border p-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <Package className="h-5 w-5 text-green-500" />
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {client.jobPostings?.length || 0}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Job Postings
              </p>
            </div>

            <div className="rounded-lg border p-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <Calendar className="h-5 w-5 text-purple-500" />
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {client.subscription &&
                  client.subscription.startDate &&
                  client.subscription.endDate
                    ? Math.ceil(
                        (new Date(client.subscription.endDate).getTime() -
                          new Date().getTime()) /
                          (1000 * 60 * 60 * 24)
                      )
                    : 0}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Days Remaining
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Notes */}
      <Card className="bg-yellow-50 shadow-sm dark:border-yellow-800 dark:bg-yellow-950/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Subscription Management Notes
              </h4>
              <ul className="mt-2 space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
                <li>
                  • Changing the subscription status will affect the
                  client&apos;s access to platform features
                </li>
                <li>
                  • Auto-renewal settings control automatic billing cycles
                </li>
                <li>• Package changes may require additional configuration</li>
                <li>
                  • Date changes should be coordinated with billing cycles
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

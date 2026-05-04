'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  FormControl,
  FormDescription,
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
import { Switch } from '@/components/ui/switch';
import { supportPartnerManagementService } from '@/lib/services/services';
import {
  CandidateStatusEnum,
  CandidateAssessmentStageEnum,
  CandidateResumeAssessmentStatusEnum,
  CandidateOnboardingAssessmentStatusEnum,
  CandidateJobSearchStatusEnum,
} from '@/lib/shared/models/common/enums';
import { formatEnumValue } from '@/lib/utils';

interface ProfessionalUpdateTabProps {
  form: UseFormReturn<any>;
  isSubmitting: boolean;
}

export function ProfessionalUpdateTab({
  form,
  isSubmitting,
}: ProfessionalUpdateTabProps) {
  const partnersQuery = useQuery({
    queryKey: ['supportPartners', 'dropdown'],
    queryFn: () =>
      supportPartnerManagementService.listSupportPartners({
        page: 1,
        limit: 100,
      }),
  });

  const partners = partnersQuery.data?.items || [];

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <CardHeader className="border-b border-gray-100 pb-4 dark:border-gray-700">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            Professional Information
          </CardTitle>
          <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
            Manage candidate&apos;s professional status and assessment stages
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                    Status <span className="text-red-600">*</span>
                  </FormLabel>
                  <Select
                    disabled={isSubmitting}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(CandidateStatusEnum).map((status) => (
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
              name="jobSearchStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                    Job Search Status
                  </FormLabel>
                  <Select
                    disabled={isSubmitting}
                    onValueChange={(value) =>
                      field.onChange(
                        value === 'not-specified' ? undefined : value
                      )
                    }
                    value={field.value || 'not-specified'}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select job search status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="not-specified">
                        Not Specified
                      </SelectItem>
                      {Object.values(CandidateJobSearchStatusEnum).map(
                        (status) => (
                          <SelectItem key={status} value={status}>
                            {formatEnumValue(status)}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="assessmentStage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                    Assessment Stage
                  </FormLabel>
                  <Select
                    disabled={isSubmitting}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select assessment stage" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(CandidateAssessmentStageEnum).map(
                        (stage) => (
                          <SelectItem key={stage} value={stage}>
                            {formatEnumValue(stage)}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="resumeAssessmentStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                    Resume Assessment Status
                  </FormLabel>
                  <Select
                    disabled={isSubmitting}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select resume assessment status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(CandidateResumeAssessmentStatusEnum).map(
                        (status) => (
                          <SelectItem key={status} value={status}>
                            {formatEnumValue(status)}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="onboardingAssessmentStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                    Screening Assessment Status
                  </FormLabel>
                  <Select
                    disabled={isSubmitting}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select onboarding assessment status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(
                        CandidateOnboardingAssessmentStatusEnum
                      ).map((status) => (
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
              name="completionPercentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                    Completion Percentage
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min="0"
                      max="100"
                      placeholder="0"
                      disabled={isSubmitting}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormDescription className="text-xs text-gray-500 dark:text-gray-400">
                    Profile completion percentage (0-100)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="partner"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                    Partner
                  </FormLabel>
                  <Select
                    disabled={isSubmitting || partnersQuery.isLoading}
                    onValueChange={(value) =>
                      field.onChange(
                        value === 'no-partner' ? undefined : { id: value }
                      )
                    }
                    value={field.value?.id || 'no-partner'}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a partner" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="no-partner">No Partner</SelectItem>
                      {partners.map((partner) => (
                        <SelectItem key={partner.id} value={partner.id}>
                          {partner.companyName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-xs text-gray-500 dark:text-gray-400">
                    Associate candidate with a partner organization
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="border-t border-gray-100 pt-6 dark:border-gray-700">
            <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">
              Profile Settings
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="isPublished"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                        Published Profile
                      </FormLabel>
                      <FormDescription className="text-xs text-gray-500 dark:text-gray-400">
                        Make this candidate&apos;s profile visible to employers
                      </FormDescription>
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

              <FormField
                control={form.control}
                name="isDirty"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                        Has Unsaved Changes
                      </FormLabel>
                      <FormDescription className="text-xs text-gray-500 dark:text-gray-400">
                        Mark if candidate has unsaved changes
                      </FormDescription>
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
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

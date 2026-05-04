'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface PreferencesUpdateTabProps {
  form: UseFormReturn<any>;
  isSubmitting: boolean;
}

export function PreferencesUpdateTab({
  form,
  isSubmitting,
}: PreferencesUpdateTabProps) {
  const validWorkTypes = [
    { value: 'FULL_TIME', label: 'Full-time' },
    { value: 'PART_TIME', label: 'Part-time' },
    { value: 'CONTRACT', label: 'Contract' },
    { value: 'FREELANCE', label: 'Freelance' },
    { value: 'INTERNSHIP', label: 'Internship' },
  ];

  // Get current work types and filter out invalid ones
  const currentWorkTypes = form.watch('preferences.preferredWorkTypes') || [];
  const validCurrentWorkTypes = currentWorkTypes.filter((type: string) =>
    validWorkTypes.some((valid) => valid.value === type)
  );

  // Update form if there are invalid values
  React.useEffect(() => {
    if (currentWorkTypes.length !== validCurrentWorkTypes.length) {
      form.setValue('preferences.preferredWorkTypes', validCurrentWorkTypes);
    }
  }, []);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Job Preferences</CardTitle>
          <CardDescription>
            Configure candidate&apos;s job search preferences and requirements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Preferred Industries */}
            <FormField
              control={form.control}
              name="preferences.preferredIndustries"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Industries</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Enter industries separated by commas"
                      disabled={isSubmitting}
                      value={
                        Array.isArray(field.value) ? field.value.join(', ') : ''
                      }
                      onChange={(e) => {
                        const industries = e.target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean);
                        field.onChange(industries);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Preferred Locations */}
            <FormField
              control={form.control}
              name="preferences.preferredLocations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Locations</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Enter locations separated by commas"
                      disabled={isSubmitting}
                      value={
                        Array.isArray(field.value) ? field.value.join(', ') : ''
                      }
                      onChange={(e) => {
                        const locations = e.target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean);
                        field.onChange(locations);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Preferred Work Types - Fixed to only allow valid enum values */}
            <FormField
              control={form.control}
              name="preferences.preferredWorkTypes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Work Types</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(value) => {
                        const currentValues = Array.isArray(field.value)
                          ? field.value
                          : [];
                        // Only add if it's a valid work type and not already selected
                        if (
                          validWorkTypes.some((type) => type.value === value) &&
                          !currentValues.includes(value)
                        ) {
                          field.onChange([...currentValues, value]);
                        }
                      }}
                      disabled={isSubmitting}
                      value="" // Reset value after selection
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select work types to add" />
                      </SelectTrigger>
                      <SelectContent>
                        {validWorkTypes
                          .filter(
                            (type) => !currentWorkTypes.includes(type.value)
                          ) // Only show unselected options
                          .map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </FormControl>

                  {/* Display selected work types */}
                  <div className="mt-2">
                    {Array.isArray(field.value) && field.value.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Selected Work Types:
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {field.value
                            .filter((type: string) =>
                              validWorkTypes.some(
                                (valid) => valid.value === type
                              )
                            ) // Only show valid types
                            .map((type: string, index: number) => {
                              const typeLabel =
                                validWorkTypes.find((t) => t.value === type)
                                  ?.label || type;
                              return (
                                <span
                                  key={`${type}-${index}`}
                                  className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
                                >
                                  {typeLabel}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newValues = field.value.filter(
                                        (t: string) => t !== type
                                      );
                                      field.onChange(newValues);
                                    }}
                                    className="ml-1 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                                    disabled={isSubmitting}
                                    title={`Remove ${typeLabel}`}
                                  >
                                    ×
                                  </button>
                                </span>
                              );
                            })}
                        </div>
                      </div>
                    )}
                    {(!Array.isArray(field.value) ||
                      field.value.length === 0) && (
                      <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        No work types selected. Use the dropdown above to add
                        work types.
                      </div>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Preferred Job Titles */}
            <FormField
              control={form.control}
              name="preferences.preferredJobTitles"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Job Titles</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Enter job titles separated by commas"
                      disabled={isSubmitting}
                      value={
                        Array.isArray(field.value) ? field.value.join(', ') : ''
                      }
                      onChange={(e) => {
                        const titles = e.target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean);
                        field.onChange(titles);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Preferred Job Commitments */}
            <FormField
              control={form.control}
              name="preferences.preferredJobCommitments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Job Commitments</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Enter job commitments separated by commas"
                      disabled={isSubmitting}
                      value={
                        Array.isArray(field.value) ? field.value.join(', ') : ''
                      }
                      onChange={(e) => {
                        const commitments = e.target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean);
                        field.onChange(commitments);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Salary Expectations */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Salary Expectations</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="preferences.preferredSalaryMin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Salary</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min="0"
                        disabled={isSubmitting}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preferences.preferredSalaryMax"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Salary</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min="0"
                        disabled={isSubmitting}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preferences.preferredSalaryCurrency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="INR">INR</SelectItem>
                        <SelectItem value="CAD">CAD</SelectItem>
                        <SelectItem value="AUD">AUD</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="preferences.preferredEquity"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Interest in Equity
                    </FormLabel>
                    <div className="text-muted-foreground text-sm">
                      Candidate is interested in equity compensation
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
          </div>

          {/* Additional Preferences */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="preferences.preferredBenefits"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Benefits</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Enter benefits separated by commas"
                      disabled={isSubmitting}
                      value={
                        Array.isArray(field.value) ? field.value.join(', ') : ''
                      }
                      onChange={(e) => {
                        const benefits = e.target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean);
                        field.onChange(benefits);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="preferences.preferredResponsibilities"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Responsibilities</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Enter responsibilities separated by commas"
                      disabled={isSubmitting}
                      value={
                        Array.isArray(field.value) ? field.value.join(', ') : ''
                      }
                      onChange={(e) => {
                        const responsibilities = e.target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean);
                        field.onChange(responsibilities);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="preferences.preferredTags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Tags</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Enter tags separated by commas"
                      disabled={isSubmitting}
                      value={
                        Array.isArray(field.value) ? field.value.join(', ') : ''
                      }
                      onChange={(e) => {
                        const tags = e.target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean);
                        field.onChange(tags);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

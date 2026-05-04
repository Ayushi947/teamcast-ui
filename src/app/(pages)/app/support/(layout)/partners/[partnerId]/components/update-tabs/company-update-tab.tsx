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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building2 } from 'lucide-react';
import {
  CompanySizeEnum,
  CompanyIndustryEnum,
  CompanyTypeEnum,
  CompanyStageEnum,
} from '@/lib/shared';
import { formatEnumValue } from '@/lib/utils';

interface CompanyUpdateTabProps {
  form: UseFormReturn<any>;
  isSubmitting: boolean;
}
const CompanySizeDisplay = {
  ONE_TO_TEN: '1-10 employees',
  ELEVEN_TO_FIFTY: '11-50 employees',
  FIFTY_ONE_TO_TWO_HUNDRED: '51-200 employees',
  TWO_HUNDRED_ONE_TO_FIVE_HUNDRED: '201-500 employees',
  FIVE_HUNDRED_ONE_TO_THOUSAND: '501-1000 employees',
  OVER_THOUSAND: '1000+ employees',
} as const;
export function CompanyUpdateTab({
  form,
  isSubmitting,
}: CompanyUpdateTabProps) {
  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <CardHeader className="border-b border-gray-100 pb-4 dark:border-gray-700">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <Building2 className="h-5 w-5 text-[#6e55cf] dark:text-purple-400" />
            Company Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                    Company Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isSubmitting}
                      className="h-10 border-gray-300 focus:border-[#6e55cf] focus:ring-[#6e55cf] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter company name"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                    Contact Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      disabled
                      className="dark: ext-white h-10 border-gray-300 focus:border-[#6e55cf] focus:ring-[#6e55cf] dark:border-gray-600 dark:bg-gray-700"
                      placeholder="Enter contact email"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="company.profile.website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                    Website
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="https://example.com"
                      disabled={isSubmitting}
                      className="h-10 border-gray-300 focus:border-[#6e55cf] focus:ring-[#6e55cf] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="company.profile.industry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                    Industry
                  </FormLabel>
                  <Select
                    onValueChange={(value) =>
                      field.onChange(
                        value === 'not-specified' ? undefined : value
                      )
                    }
                    value={field.value || 'not-specified'}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger className="h-10 border-gray-300 focus:border-[#6e55cf] focus:ring-[#6e55cf] dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="not-specified">
                        Not Specified
                      </SelectItem>
                      {Object.values(CompanyIndustryEnum).map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-[#6e55cf]" />
                            {formatEnumValue(industry)}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="company.profile.size"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                    Company Size
                  </FormLabel>
                  <Select
                    onValueChange={(value) =>
                      field.onChange(
                        value === 'not-specified' ? undefined : value
                      )
                    }
                    value={field.value || 'not-specified'}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger className="h-10 border-gray-300 focus:border-[#6e55cf] focus:ring-[#6e55cf] dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="not-specified">
                        Not Specified
                      </SelectItem>
                      {Object.values(CompanySizeEnum).map((size) => (
                        <SelectItem key={size} value={size}>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-[#6e55cf]" />
                            {
                              CompanySizeDisplay[
                                size as keyof typeof CompanySizeDisplay
                              ]
                            }
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="company.profile.companyType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                    Company Type
                  </FormLabel>
                  <Select
                    onValueChange={(value) =>
                      field.onChange(
                        value === 'not-specified' ? undefined : value
                      )
                    }
                    value={field.value || 'not-specified'}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger className="h-10 border-gray-300 focus:border-[#6e55cf] focus:ring-[#6e55cf] dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="not-specified">
                        Not Specified
                      </SelectItem>
                      {Object.values(CompanyTypeEnum).map((type) => (
                        <SelectItem key={type} value={type}>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-[#6e55cf]" />
                            {formatEnumValue(type)}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="company.profile.stage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                    Company Stage
                  </FormLabel>
                  <Select
                    onValueChange={(value) =>
                      field.onChange(
                        value === 'not-specified' ? undefined : value
                      )
                    }
                    value={field.value || 'not-specified'}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger className="h-10 border-gray-300 focus:border-[#6e55cf] focus:ring-[#6e55cf] dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                        <SelectValue placeholder="Select stage" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="not-specified">
                        Not Specified
                      </SelectItem>
                      {Object.values(CompanyStageEnum).map((stage) => (
                        <SelectItem key={stage} value={stage}>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-[#6e55cf]" />
                            {formatEnumValue(stage)}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="company.profile.foundedYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                    Founded Year
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min="1800"
                      max={new Date().getFullYear()}
                      disabled={isSubmitting}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || undefined)
                      }
                      className="h-10 border-gray-300 focus:border-[#6e55cf] focus:ring-[#6e55cf] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="e.g., 2020"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="company.profile.description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                  Company Description
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={3}
                    disabled={isSubmitting}
                    className="border-gray-300 focus:border-[#6e55cf] focus:ring-[#6e55cf] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Describe the company..."
                  />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}

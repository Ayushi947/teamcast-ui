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
import { Building2, Globe } from 'lucide-react';
import {
  CompanyTypeEnum,
  CompanyIndustryEnum,
  CompanySizeEnum,
  CompanyStageEnum,
} from '@/lib/shared';
import { formatEnumValue } from '@/lib/utils';

interface CompanyUpdateTabProps {
  form: UseFormReturn<any>;
  isSubmitting: boolean;
}

export function CompanyUpdateTab({
  form,
  isSubmitting,
}: CompanyUpdateTabProps) {
  return (
    <div className="space-y-6">
      {/* Basic Company Information */}
      <Card className="bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <CardHeader className="border-b border-gray-100 pb-4 dark:border-gray-700">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <Building2 className="h-5 w-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="company.name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Company Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter company name"
                      disabled={isSubmitting}
                      {...field}
                      className="border-gray-300 focus:border-[#6e55cf] focus:ring-[#6e55cf] dark:border-gray-600"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="company.contactEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Contact Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter contact email"
                      type="email"
                      disabled={isSubmitting}
                      {...field}
                      className="border-gray-300 focus:border-[#6e55cf] focus:ring-[#6e55cf] dark:border-gray-600"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="company.website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Globe className="h-4 w-4" />
                    Website
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com"
                      disabled={isSubmitting}
                      {...field}
                      className="border-gray-300 focus:border-[#6e55cf] focus:ring-[#6e55cf] dark:border-gray-600"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="company.foundedYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Founded Year
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="2020"
                      type="number"
                      min="1800"
                      max={new Date().getFullYear()}
                      disabled={isSubmitting}
                      {...field}
                      onChange={(e) =>
                        field.onChange(Number(e.target.value) || undefined)
                      }
                      value={field.value || ''}
                      className="border-gray-300 focus:border-[#6e55cf] focus:ring-[#6e55cf] dark:border-gray-600"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="company.industry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Industry
                  </FormLabel>
                  <Select
                    disabled={isSubmitting}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="border-gray-300 focus:border-[#6e55cf] focus:ring-[#6e55cf] dark:border-gray-600">
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(CompanyIndustryEnum).map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {formatEnumValue(industry)}
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
              name="company.size"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Company Size
                  </FormLabel>
                  <Select
                    disabled={isSubmitting}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="border-gray-300 focus:border-[#6e55cf] focus:ring-[#6e55cf] dark:border-gray-600">
                        <SelectValue placeholder="Select company size" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(CompanySizeEnum).map((size) => (
                        <SelectItem key={size} value={size}>
                          {formatEnumValue(size)}
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
              name="company.companyType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Company Type
                  </FormLabel>
                  <Select
                    disabled={isSubmitting}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="border-gray-300 focus:border-[#6e55cf] focus:ring-[#6e55cf] dark:border-gray-600">
                        <SelectValue placeholder="Select company type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(CompanyTypeEnum).map((type) => (
                        <SelectItem key={type} value={type}>
                          {formatEnumValue(type)}
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
              name="company.stage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Company Stage
                  </FormLabel>
                  <Select
                    disabled={isSubmitting}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="border-gray-300 focus:border-[#6e55cf] focus:ring-[#6e55cf] dark:border-gray-600">
                        <SelectValue placeholder="Select company stage" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(CompanyStageEnum).map((stage) => (
                        <SelectItem key={stage} value={stage}>
                          {formatEnumValue(stage)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="company.description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Company Description
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe your company..."
                    className="min-h-[100px] resize-none border-gray-300 focus:border-[#6e55cf] focus:ring-[#6e55cf] dark:border-gray-600"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}

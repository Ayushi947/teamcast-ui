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
// Removed ISupportCandidateUpdate import to avoid type conflicts

interface SettingsUpdateTabProps {
  form: UseFormReturn<any>;
  isSubmitting: boolean;
}

export function SettingsUpdateTab({
  form,
  isSubmitting,
}: SettingsUpdateTabProps) {
  return (
    <div className="space-y-6">
      {/* Notification Settings */}
      <Card className="bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <CardHeader className="border-b border-gray-100 pb-4 dark:border-gray-700">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            Notification Settings
          </CardTitle>
          <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
            Configure notification preferences for this candidate
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <FormField
            control={form.control}
            name="settings.notificationsEnabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <div className="space-y-0.5">
                  <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                    Enable Notifications
                  </FormLabel>
                  <FormDescription className="text-xs text-gray-500 dark:text-gray-400">
                    Master switch for all notifications
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
            name="settings.emailNotifications"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <div className="space-y-0.5">
                  <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                    Email Notifications
                  </FormLabel>
                  <FormDescription className="text-xs text-gray-500 dark:text-gray-400">
                    Receive notifications via email
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
            name="settings.pushNotifications"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <div className="space-y-0.5">
                  <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                    Push Notifications
                  </FormLabel>
                  <FormDescription className="text-xs text-gray-500 dark:text-gray-400">
                    Receive push notifications in browser
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
            name="settings.jobAlerts"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <div className="space-y-0.5">
                  <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                    Job Alerts
                  </FormLabel>
                  <FormDescription className="text-xs text-gray-500 dark:text-gray-400">
                    Get notified about new job opportunities
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
            name="settings.applicationUpdates"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <div className="space-y-0.5">
                  <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                    Application Updates
                  </FormLabel>
                  <FormDescription className="text-xs text-gray-500 dark:text-gray-400">
                    Get notified about application status changes
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
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card className="bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <CardHeader className="border-b border-gray-100 pb-4 dark:border-gray-700">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            Privacy Settings
          </CardTitle>
          <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
            Configure privacy and data sharing preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <FormField
            control={form.control}
            name="settings.profileVisibility"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <div className="space-y-0.5">
                  <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                    Profile Visibility
                  </FormLabel>
                  <FormDescription className="text-xs text-gray-500 dark:text-gray-400">
                    Make profile visible to employers
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
            name="settings.shareDataWithEmployers"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <div className="space-y-0.5">
                  <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                    Share Data with Employers
                  </FormLabel>
                  <FormDescription className="text-xs text-gray-500 dark:text-gray-400">
                    Allow sharing profile data with potential employers
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
        </CardContent>
      </Card>

      {/* Appearance Settings */}
      <Card className="bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <CardHeader className="border-b border-gray-100 pb-4 dark:border-gray-700">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            Appearance & Localization
          </CardTitle>
          <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
            Configure appearance and language preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <FormField
            control={form.control}
            name="settings.darkMode"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <div className="space-y-0.5">
                  <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                    Dark Mode
                  </FormLabel>
                  <FormDescription className="text-xs text-gray-500 dark:text-gray-400">
                    Use dark theme for the interface
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

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="settings.language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                    Language
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="it">Italian</SelectItem>
                      <SelectItem value="pt">Portuguese</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="settings.timezone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                    Timezone
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isSubmitting}
                      placeholder="UTC"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="settings.preferredCommunicationChannel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                    Preferred Communication Channel
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select communication channel" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="EMAIL">Email</SelectItem>
                      <SelectItem value="SMS">SMS</SelectItem>
                      <SelectItem value="PHONE">Phone</SelectItem>
                      <SelectItem value="PUSH">Push Notifications</SelectItem>
                    </SelectContent>
                  </Select>
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

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
  Bell,
  Shield,
  Palette,
  Mail,
  Smartphone,
  Eye,
  Database,
  Link,
  Users2,
} from 'lucide-react';

interface SettingsUpdateTabProps {
  form: UseFormReturn<any>;
  isSubmitting: boolean;
  clientId: string;
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
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          {/* General Notifications */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              General Notifications
            </h4>
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="settings.notificationsEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center space-x-3">
                      <Bell className="h-4 w-4 text-gray-500" />
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm font-medium">
                          Enable Notifications
                        </FormLabel>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Receive notifications about account activities
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

              <FormField
                control={form.control}
                name="settings.emailNotifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm font-medium">
                          Email Notifications
                        </FormLabel>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Receive notifications via email
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

              <FormField
                control={form.control}
                name="settings.pushNotifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center space-x-3">
                      <Smartphone className="h-4 w-4 text-gray-500" />
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm font-medium">
                          Push Notifications
                        </FormLabel>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Receive push notifications on your device
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
            </div>
          </div>

          {/* Job & Application Alerts */}
          <div className="space-y-4 border-t border-gray-100 pt-6 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              Job & Application Alerts
            </h4>
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="settings.jobAlerts"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center space-x-3">
                      <Bell className="h-4 w-4 text-gray-500" />
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm font-medium">
                          Job Alerts
                        </FormLabel>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Notifications about job postings
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

              <FormField
                control={form.control}
                name="settings.candidateAlerts"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center space-x-3">
                      <Bell className="h-4 w-4 text-gray-500" />
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm font-medium">
                          Candidate Alerts
                        </FormLabel>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Notifications about candidate activities
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

              <FormField
                control={form.control}
                name="settings.applicationAlerts"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center space-x-3">
                      <Bell className="h-4 w-4 text-gray-500" />
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm font-medium">
                          Application Alerts
                        </FormLabel>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Notifications about job applications
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card className="bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <CardHeader className="border-b border-gray-100 pb-4 dark:border-gray-700">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <Shield className="h-5 w-5" />
            Privacy Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="grid gap-4">
            <FormField
              control={form.control}
              name="settings.privacySettings.dataSharing"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center space-x-3">
                    <Database className="h-4 w-4 text-gray-500" />
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm font-medium">
                        Data Sharing
                      </FormLabel>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Allow sharing of anonymized data for platform
                        improvement
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

            <FormField
              control={form.control}
              name="settings.privacySettings.profileVisibility"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center space-x-3">
                    <Eye className="h-4 w-4 text-gray-500" />
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Profile Visibility
                    </FormLabel>
                  </div>
                  <Select
                    disabled={isSubmitting}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="border-gray-300 focus:border-[#6e55cf] focus:ring-[#6e55cf] dark:border-gray-600">
                        <SelectValue placeholder="Select visibility" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="limited">Limited</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Control who can see your company profile
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="settings.privacySettings.marketingEmails"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm font-medium">
                        Marketing Emails
                      </FormLabel>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Receive marketing and promotional emails
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

            <FormField
              control={form.control}
              name="settings.privacySettings.dataRetention"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center space-x-3">
                    <Database className="h-4 w-4 text-gray-500" />
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Data Retention Period (days)
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Input
                      placeholder="365"
                      type="number"
                      min="30"
                      max="3650"
                      disabled={isSubmitting}
                      {...field}
                      onChange={(e) =>
                        field.onChange(Number(e.target.value) || 365)
                      }
                      value={field.value || ''}
                      className="border-gray-300 focus:border-[#6e55cf] focus:ring-[#6e55cf] dark:border-gray-600"
                    />
                  </FormControl>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    How long to keep your data after account deletion
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Branding Settings */}
      <Card className="bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <CardHeader className="border-b border-gray-100 pb-4 dark:border-gray-700">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <Palette className="h-5 w-5" />
            Branding Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="settings.brandingSettings.primaryColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Primary Color
                  </FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input
                        placeholder="#6e55cf"
                        disabled={isSubmitting}
                        {...field}
                        className="border-gray-300 focus:border-[#6e55cf] focus:ring-[#6e55cf] dark:border-gray-600"
                      />
                    </FormControl>
                    <div
                      className="h-10 w-10 rounded border"
                      style={{ backgroundColor: field.value || '#6e55cf' }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Main brand color for your company
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="settings.brandingSettings.secondaryColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Secondary Color
                  </FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input
                        placeholder="#6c757d"
                        disabled={isSubmitting}
                        {...field}
                        className="border-gray-300 focus:border-[#6e55cf] focus:ring-[#6e55cf] dark:border-gray-600"
                      />
                    </FormControl>
                    <div
                      className="h-10 w-10 rounded border"
                      style={{ backgroundColor: field.value || '#6c757d' }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Secondary brand color for accents
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Integration Settings */}
      <Card className="bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <CardHeader className="border-b border-gray-100 pb-4 dark:border-gray-700">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <Link className="h-5 w-5" />
            Integration Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="grid gap-4">
            <FormField
              control={form.control}
              name="settings.integrationSettings.emailIntegration"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm font-medium">
                        Email Integration
                      </FormLabel>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Connect with email services for notifications
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

            <FormField
              control={form.control}
              name="settings.integrationSettings.calendarIntegration"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center space-x-3">
                    <div className="h-4 w-4 rounded bg-blue-500"></div>
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm font-medium">
                        Calendar Integration
                      </FormLabel>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Sync with calendar services for scheduling
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

            <FormField
              control={form.control}
              name="settings.integrationSettings.slackIntegration"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center space-x-3">
                    <div className="h-4 w-4 rounded bg-purple-500"></div>
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm font-medium">
                        Slack Integration
                      </FormLabel>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Connect with Slack for team notifications
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
          </div>
        </CardContent>
      </Card>

      {/* Deel Integration Settings */}
      <Card className="bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <CardHeader className="border-b border-gray-100 pb-4 dark:border-gray-700">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <Users2 className="h-5 w-5" />
            Deel Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="grid gap-4">
            <FormField
              control={form.control}
              name="settings.isDeelEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center space-x-3">
                    <Users2 className="h-4 w-4 text-gray-500" />
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm font-medium">
                        Enable Deel SSO
                      </FormLabel>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Enable Deel Single Sign-On integration for this client.
                        This allows client users to access Deel.com through SSO.
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

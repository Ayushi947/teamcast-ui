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
  FormDescription,
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
  Settings,
  Calendar,
  Mail,
  MessageSquare,
} from 'lucide-react';

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
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <Bell className="h-5 w-5 text-[#6e55cf] dark:text-purple-400" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <FormField
            control={form.control}
            name="settings.notificationsEnabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <div className="space-y-0.5">
                  <FormLabel className="text-base font-medium text-gray-900 dark:text-white">
                    Notifications Enabled
                  </FormLabel>
                  <FormDescription className="text-sm text-gray-500 dark:text-gray-400">
                    Enable all notifications
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isSubmitting}
                    className="data-[state=checked]:bg-[#6e55cf]"
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
                  <FormLabel className="text-base font-medium text-gray-900 dark:text-white">
                    Email Notifications
                  </FormLabel>
                  <FormDescription className="text-sm text-gray-500 dark:text-gray-400">
                    Receive notifications via email
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isSubmitting}
                    className="data-[state=checked]:bg-[#6e55cf]"
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
                  <FormLabel className="text-base font-medium text-gray-900 dark:text-white">
                    Push Notifications
                  </FormLabel>
                  <FormDescription className="text-sm text-gray-500 dark:text-gray-400">
                    Receive push notifications in browser
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isSubmitting}
                    className="data-[state=checked]:bg-[#6e55cf]"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="settings.consultantAlerts"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <div className="space-y-0.5">
                  <FormLabel className="text-base font-medium text-gray-900 dark:text-white">
                    Consultant Alerts
                  </FormLabel>
                  <FormDescription className="text-sm text-gray-500 dark:text-gray-400">
                    Get notified about consultant activities
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isSubmitting}
                    className="data-[state=checked]:bg-[#6e55cf]"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="settings.contractAlerts"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <div className="space-y-0.5">
                  <FormLabel className="text-base font-medium text-gray-900 dark:text-white">
                    Contract Alerts
                  </FormLabel>
                  <FormDescription className="text-sm text-gray-500 dark:text-gray-400">
                    Get notified about contract updates
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isSubmitting}
                    className="data-[state=checked]:bg-[#6e55cf]"
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
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <Shield className="h-5 w-5 text-[#6e55cf] dark:text-purple-400" />
            Privacy Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <FormField
            control={form.control}
            name="settings.privacySettings.profileVisibility"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                  Profile Visibility
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger className="h-10 border-gray-300 focus:border-[#6e55cf] focus:ring-[#6e55cf] dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="public">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        Public
                      </div>
                    </SelectItem>
                    <SelectItem value="private">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-red-500" />
                        Private
                      </div>
                    </SelectItem>
                    <SelectItem value="restricted">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-yellow-500" />
                        Restricted
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="settings.privacySettings.dataSharing"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <div className="space-y-0.5">
                  <FormLabel className="text-base font-medium text-gray-900 dark:text-white">
                    Data Sharing
                  </FormLabel>
                  <FormDescription className="text-sm text-gray-500 dark:text-gray-400">
                    Allow data sharing with partners
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isSubmitting}
                    className="data-[state=checked]:bg-[#6e55cf]"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="settings.privacySettings.marketingEmails"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <div className="space-y-0.5">
                  <FormLabel className="text-base font-medium text-gray-900 dark:text-white">
                    Marketing Emails
                  </FormLabel>
                  <FormDescription className="text-sm text-gray-500 dark:text-gray-400">
                    Receive marketing communications
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isSubmitting}
                    className="data-[state=checked]:bg-[#6e55cf]"
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
                <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                  Data Retention (days)
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min="30"
                    max="3650"
                    disabled={isSubmitting}
                    onChange={(e) =>
                      field.onChange(parseInt(e.target.value) || 365)
                    }
                    className="h-10 border-gray-300 focus:border-[#6e55cf] focus:ring-[#6e55cf] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="365"
                  />
                </FormControl>
                <FormDescription className="text-sm text-gray-500 dark:text-gray-400">
                  How long to keep data (30-3650 days)
                </FormDescription>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Branding Settings */}
      <Card className="bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <CardHeader className="border-b border-gray-100 pb-4 dark:border-gray-700">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <Palette className="h-5 w-5 text-[#6e55cf] dark:text-purple-400" />
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
                  <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                    Primary Color
                  </FormLabel>
                  <div className="flex items-center gap-2">
                    <FormControl>
                      <Input
                        {...field}
                        type="color"
                        disabled={isSubmitting}
                        className="h-10 w-20 border-gray-300 focus:border-[#6e55cf] focus:ring-[#6e55cf] dark:border-gray-600 dark:bg-gray-700"
                      />
                    </FormControl>
                    <Input
                      value={field.value || '#6e55cf'}
                      onChange={(e) => field.onChange(e.target.value)}
                      disabled={isSubmitting}
                      className="h-10 flex-1 border-gray-300 focus:border-[#6e55cf] focus:ring-[#6e55cf] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="#6e55cf"
                    />
                  </div>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="settings.brandingSettings.secondaryColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                    Secondary Color
                  </FormLabel>
                  <div className="flex items-center gap-2">
                    <FormControl>
                      <Input
                        {...field}
                        type="color"
                        disabled={isSubmitting}
                        className="h-10 w-20 border-gray-300 focus:border-[#6e55cf] focus:ring-[#6e55cf] dark:border-gray-600 dark:bg-gray-700"
                      />
                    </FormControl>
                    <Input
                      value={field.value || '#6c757d'}
                      onChange={(e) => field.onChange(e.target.value)}
                      disabled={isSubmitting}
                      className="h-10 flex-1 border-gray-300 focus:border-[#6e55cf] focus:ring-[#6e55cf] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="#6c757d"
                    />
                  </div>
                  <FormMessage className="text-red-500" />
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
            <Settings className="h-5 w-5 text-[#6e55cf] dark:text-purple-400" />
            Integration Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <FormField
            control={form.control}
            name="settings.integrationSettings.calendarIntegration"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  <div className="space-y-0.5">
                    <FormLabel className="text-base font-medium text-gray-900 dark:text-white">
                      Calendar Integration
                    </FormLabel>
                    <FormDescription className="text-sm text-gray-500 dark:text-gray-400">
                      Connect with calendar services
                    </FormDescription>
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isSubmitting}
                    className="data-[state=checked]:bg-[#6e55cf]"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="settings.integrationSettings.emailIntegration"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  <div className="space-y-0.5">
                    <FormLabel className="text-base font-medium text-gray-900 dark:text-white">
                      Email Integration
                    </FormLabel>
                    <FormDescription className="text-sm text-gray-500 dark:text-gray-400">
                      Connect with email services
                    </FormDescription>
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isSubmitting}
                    className="data-[state=checked]:bg-[#6e55cf]"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="settings.integrationSettings.slackIntegration"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  <div className="space-y-0.5">
                    <FormLabel className="text-base font-medium text-gray-900 dark:text-white">
                      Slack Integration
                    </FormLabel>
                    <FormDescription className="text-sm text-gray-500 dark:text-gray-400">
                      Connect with Slack workspace
                    </FormDescription>
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isSubmitting}
                    className="data-[state=checked]:bg-[#6e55cf]"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}

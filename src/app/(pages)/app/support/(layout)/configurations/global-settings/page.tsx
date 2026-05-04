'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import {
  IGlobalSettingsUpdate,
  CommunicationChannelEnum,
  DateFormatEnum,
  TimeFormatEnum,
  globalSettingsUpdateValidator,
  logger,
} from '@/lib/shared';
import { globalSettingsService } from '@/lib/services/services';

// Dropdown options
const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ru', label: 'Russian' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'ar', label: 'Arabic' },
  { value: 'hi', label: 'Hindi' },
];

const TIMEZONE_OPTIONS = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'Eastern Time (US & Canada)' },
  { value: 'America/Chicago', label: 'Central Time (US & Canada)' },
  { value: 'America/Denver', label: 'Mountain Time (US & Canada)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)' },
  { value: 'America/Phoenix', label: 'Arizona' },
  { value: 'America/Anchorage', label: 'Alaska' },
  { value: 'America/Honolulu', label: 'Hawaii' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET)' },
  { value: 'Europe/Rome', label: 'Rome (CET)' },
  { value: 'Europe/Madrid', label: 'Madrid (CET)' },
  { value: 'Europe/Amsterdam', label: 'Amsterdam (CET)' },
  { value: 'Europe/Athens', label: 'Athens (EET)' },
  { value: 'Europe/Moscow', label: 'Moscow (MSK)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Asia/Kolkata', label: 'Mumbai, Delhi (IST)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Seoul', label: 'Seoul (KST)' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong (HKT)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEDT)' },
  { value: 'Australia/Melbourne', label: 'Melbourne (AEDT)' },
  { value: 'Pacific/Auckland', label: 'Auckland (NZDT)' },
];

const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'JPY', label: 'JPY - Japanese Yen' },
  { value: 'AUD', label: 'AUD - Australian Dollar' },
  { value: 'CAD', label: 'CAD - Canadian Dollar' },
  { value: 'CHF', label: 'CHF - Swiss Franc' },
  { value: 'CNY', label: 'CNY - Chinese Yuan' },
  { value: 'INR', label: 'INR - Indian Rupee' },
  { value: 'SGD', label: 'SGD - Singapore Dollar' },
  { value: 'HKD', label: 'HKD - Hong Kong Dollar' },
  { value: 'NZD', label: 'NZD - New Zealand Dollar' },
  { value: 'MXN', label: 'MXN - Mexican Peso' },
  { value: 'BRL', label: 'BRL - Brazilian Real' },
  { value: 'ZAR', label: 'ZAR - South African Rand' },
  { value: 'AED', label: 'AED - UAE Dirham' },
  { value: 'SAR', label: 'SAR - Saudi Riyal' },
];

const COUNTRY_OPTIONS = [
  { value: 'US', label: 'United States' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'CA', label: 'Canada' },
  { value: 'AU', label: 'Australia' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'IT', label: 'Italy' },
  { value: 'ES', label: 'Spain' },
  { value: 'NL', label: 'Netherlands' },
  { value: 'BE', label: 'Belgium' },
  { value: 'CH', label: 'Switzerland' },
  { value: 'AT', label: 'Austria' },
  { value: 'SE', label: 'Sweden' },
  { value: 'NO', label: 'Norway' },
  { value: 'DK', label: 'Denmark' },
  { value: 'FI', label: 'Finland' },
  { value: 'PL', label: 'Poland' },
  { value: 'IE', label: 'Ireland' },
  { value: 'PT', label: 'Portugal' },
  { value: 'GR', label: 'Greece' },
  { value: 'JP', label: 'Japan' },
  { value: 'CN', label: 'China' },
  { value: 'IN', label: 'India' },
  { value: 'KR', label: 'South Korea' },
  { value: 'SG', label: 'Singapore' },
  { value: 'HK', label: 'Hong Kong' },
  { value: 'AE', label: 'United Arab Emirates' },
  { value: 'SA', label: 'Saudi Arabia' },
  { value: 'NZ', label: 'New Zealand' },
  { value: 'MX', label: 'Mexico' },
  { value: 'BR', label: 'Brazil' },
  { value: 'ZA', label: 'South Africa' },
];

const FILE_UPLOAD_SIZE_OPTIONS = [
  { value: 1, label: '1 MB' },
  { value: 5, label: '5 MB' },
  { value: 10, label: '10 MB' },
  { value: 15, label: '15 MB' },
  { value: 20, label: '20 MB' },
  { value: 25, label: '25 MB' },
];

const FILES_PER_UPLOAD_OPTIONS = [
  { value: 1, label: '1 file' },
  { value: 2, label: '2 files' },
  { value: 3, label: '3 files' },
  { value: 4, label: '4 files' },
  { value: 5, label: '5 files' },
  { value: 6, label: '6 files' },
  { value: 7, label: '7 files' },
  { value: 8, label: '8 files' },
  { value: 9, label: '9 files' },
  { value: 10, label: '10 files' },
];

const SESSION_TIMEOUT_OPTIONS = [
  { value: 5, label: '5 minutes' },
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 60, label: '1 hour' },
  { value: 120, label: '2 hours' },
  { value: 240, label: '4 hours' },
  { value: 480, label: '8 hours' },
  { value: 720, label: '12 hours' },
  { value: 1440, label: '24 hours' },
];

const MAX_LOGIN_ATTEMPTS_OPTIONS = [
  { value: 3, label: '3 attempts' },
  { value: 5, label: '5 attempts' },
  { value: 7, label: '7 attempts' },
  { value: 10, label: '10 attempts' },
  { value: 15, label: '15 attempts' },
  { value: 20, label: '20 attempts' },
];

const PASSWORD_EXPIRY_OPTIONS = [
  { value: 30, label: '30 days' },
  { value: 60, label: '60 days' },
  { value: 90, label: '90 days' },
  { value: 120, label: '120 days' },
  { value: 180, label: '180 days' },
  { value: 365, label: '365 days (1 year)' },
];

// Extract the body schema from the validator for form validation
const globalSettingsFormSchema = globalSettingsUpdateValidator.shape.body;
type GlobalSettingsFormValues = z.infer<typeof globalSettingsFormSchema>;

export default function GlobalSettingsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch current settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['globalSettings'],
    queryFn: () => globalSettingsService.getGlobalSettings(),
  });

  // Form setup
  const form = useForm<GlobalSettingsFormValues>({
    resolver: zodResolver(globalSettingsFormSchema),
    defaultValues: {
      name: '',
      description: '',
      defaultNotificationsEnabled: true,
      defaultEmailNotifications: true,
      defaultPushNotifications: true,
      defaultSmsNotifications: false,
      defaultInAppNotifications: true,
      defaultJobAlerts: true,
      defaultCandidateAlerts: true,
      defaultApplicationAlerts: true,
      defaultApplicationUpdates: true,
      defaultConsultantAlerts: true,
      defaultContractAlerts: true,
      defaultDarkMode: false,
      defaultLanguage: 'en',
      defaultTimezone: 'UTC',
      defaultDateFormat: DateFormatEnum.MM_DD_YYYY,
      defaultTimeFormat: TimeFormatEnum.TWELVE_HOUR,
      defaultFirstDayOfWeek: 0,
      defaultCommunicationChannel: CommunicationChannelEnum.EMAIL,
      defaultDataSharing: false,
      defaultProfileVisibility: true,
      defaultActivityTracking: true,
      defaultShareDataWithEmployers: true,
      defaultCurrency: 'USD',
      defaultCountry: 'US',
      maxFileUploadSize: 10,
      maxFilesPerUpload: 5,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      passwordExpiryDays: 90,
    },
  });

  // Update form when settings are loaded
  React.useEffect(() => {
    if (settings) {
      form.reset({
        name: settings.name || '',
        description: settings.description || '',
        defaultNotificationsEnabled:
          settings.defaultNotificationsEnabled ?? true,
        defaultEmailNotifications: settings.defaultEmailNotifications ?? true,
        defaultPushNotifications: settings.defaultPushNotifications ?? true,
        defaultSmsNotifications: settings.defaultSmsNotifications ?? false,
        defaultInAppNotifications: settings.defaultInAppNotifications ?? true,
        defaultJobAlerts: settings.defaultJobAlerts ?? true,
        defaultCandidateAlerts: settings.defaultCandidateAlerts ?? true,
        defaultApplicationAlerts: settings.defaultApplicationAlerts ?? true,
        defaultApplicationUpdates: settings.defaultApplicationUpdates ?? true,
        defaultConsultantAlerts: settings.defaultConsultantAlerts ?? true,
        defaultContractAlerts: settings.defaultContractAlerts ?? true,
        defaultDarkMode: settings.defaultDarkMode ?? false,
        defaultLanguage: settings.defaultLanguage || 'en',
        defaultTimezone: settings.defaultTimezone || 'UTC',
        defaultDateFormat:
          settings.defaultDateFormat || DateFormatEnum.MM_DD_YYYY,
        defaultTimeFormat:
          settings.defaultTimeFormat || TimeFormatEnum.TWELVE_HOUR,
        defaultFirstDayOfWeek: settings.defaultFirstDayOfWeek ?? 0,
        defaultCommunicationChannel:
          settings.defaultCommunicationChannel ||
          CommunicationChannelEnum.EMAIL,
        defaultDataSharing: settings.defaultDataSharing ?? false,
        defaultProfileVisibility: settings.defaultProfileVisibility ?? true,
        defaultActivityTracking: settings.defaultActivityTracking ?? true,
        defaultShareDataWithEmployers:
          settings.defaultShareDataWithEmployers ?? true,
        defaultCurrency: settings.defaultCurrency || 'USD',
        defaultCountry: settings.defaultCountry || 'US',
        maxFileUploadSize: settings.maxFileUploadSize ?? 10,
        maxFilesPerUpload: settings.maxFilesPerUpload ?? 5,
        sessionTimeout: settings.sessionTimeout ?? 30,
        maxLoginAttempts: settings.maxLoginAttempts ?? 5,
        passwordExpiryDays: settings.passwordExpiryDays ?? 90,
      });
    }
  }, [settings, form]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: IGlobalSettingsUpdate) =>
      globalSettingsService.updateGlobalSettings(data),
    onSuccess: async (updatedData) => {
      // Update the query cache with the new data immediately
      queryClient.setQueryData(['globalSettings'], updatedData);
      // Invalidate to ensure we have the latest data
      await queryClient.invalidateQueries({ queryKey: ['globalSettings'] });
      // Reset form with updated data to keep dropdowns populated
      form.reset({
        name: updatedData.name || '',
        description: updatedData.description || '',
        defaultNotificationsEnabled:
          updatedData.defaultNotificationsEnabled ?? true,
        defaultEmailNotifications:
          updatedData.defaultEmailNotifications ?? true,
        defaultPushNotifications: updatedData.defaultPushNotifications ?? true,
        defaultSmsNotifications: updatedData.defaultSmsNotifications ?? false,
        defaultInAppNotifications:
          updatedData.defaultInAppNotifications ?? true,
        defaultJobAlerts: updatedData.defaultJobAlerts ?? true,
        defaultCandidateAlerts: updatedData.defaultCandidateAlerts ?? true,
        defaultApplicationAlerts: updatedData.defaultApplicationAlerts ?? true,
        defaultApplicationUpdates:
          updatedData.defaultApplicationUpdates ?? true,
        defaultConsultantAlerts: updatedData.defaultConsultantAlerts ?? true,
        defaultContractAlerts: updatedData.defaultContractAlerts ?? true,
        defaultDarkMode: updatedData.defaultDarkMode ?? false,
        defaultLanguage: updatedData.defaultLanguage || 'en',
        defaultTimezone: updatedData.defaultTimezone || 'UTC',
        defaultDateFormat:
          updatedData.defaultDateFormat || DateFormatEnum.MM_DD_YYYY,
        defaultTimeFormat:
          updatedData.defaultTimeFormat || TimeFormatEnum.TWELVE_HOUR,
        defaultFirstDayOfWeek: updatedData.defaultFirstDayOfWeek ?? 0,
        defaultCommunicationChannel:
          updatedData.defaultCommunicationChannel ||
          CommunicationChannelEnum.EMAIL,
        defaultDataSharing: updatedData.defaultDataSharing ?? false,
        defaultProfileVisibility: updatedData.defaultProfileVisibility ?? true,
        defaultActivityTracking: updatedData.defaultActivityTracking ?? true,
        defaultShareDataWithEmployers:
          updatedData.defaultShareDataWithEmployers ?? true,
        defaultCurrency: updatedData.defaultCurrency || 'USD',
        defaultCountry: updatedData.defaultCountry || 'US',
        maxFileUploadSize: updatedData.maxFileUploadSize ?? 10,
        maxFilesPerUpload: updatedData.maxFilesPerUpload ?? 5,
        sessionTimeout: updatedData.sessionTimeout ?? 30,
        maxLoginAttempts: updatedData.maxLoginAttempts ?? 5,
        passwordExpiryDays: updatedData.passwordExpiryDays ?? 90,
      });
      toast.success('Global settings updated successfully');
      router.push('/app/support/configurations');
    },
    onError: (error: any) => {
      toast.error('Failed to update global settings');
      logger.error('Error updating global settings:', error);
    },
  });

  const onSubmit = (data: GlobalSettingsFormValues) => {
    // Convert null to undefined for API compatibility
    const updateData: IGlobalSettingsUpdate = {
      ...data,
      description: data.description ?? undefined,
    };
    updateMutation.mutate(updateData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/app/support/configurations')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-primary text-2xl font-bold tracking-tight">
            Global Settings Configuration
          </h1>
          <p className="text-muted-foreground">
            Configure default settings that apply to all users across the
            platform
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                General information about this configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Configuration Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Default Global Settings" />
                    </FormControl>
                    <FormDescription>
                      A descriptive name for this configuration
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value ?? ''}
                        placeholder="Description of this configuration"
                        rows={3}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional description of this configuration
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Default notification preferences for all users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="defaultNotificationsEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Enable Notifications
                      </FormLabel>
                      <FormDescription>
                        Master toggle for all notifications
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="defaultEmailNotifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Email Notifications
                      </FormLabel>
                      <FormDescription>
                        Enable email notifications by default
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="defaultPushNotifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Push Notifications
                      </FormLabel>
                      <FormDescription>
                        Enable push notifications by default
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="defaultSmsNotifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        SMS Notifications
                      </FormLabel>
                      <FormDescription>
                        Enable SMS notifications by default
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="defaultInAppNotifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        In-App Notifications
                      </FormLabel>
                      <FormDescription>
                        Enable in-app notifications by default
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Alert Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Alert Settings</CardTitle>
              <CardDescription>
                Default alert preferences for different activities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="defaultJobAlerts"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Job Alerts</FormLabel>
                      <FormDescription>
                        Enable job alerts by default
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="defaultCandidateAlerts"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Candidate Alerts
                      </FormLabel>
                      <FormDescription>
                        Enable candidate alerts by default
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="defaultApplicationAlerts"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Application Alerts
                      </FormLabel>
                      <FormDescription>
                        Enable application alerts by default
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="defaultApplicationUpdates"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Application Updates
                      </FormLabel>
                      <FormDescription>
                        Enable application updates by default
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* UI Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>UI Preferences</CardTitle>
              <CardDescription>
                Default user interface preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="defaultDarkMode"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Dark Mode</FormLabel>
                      <FormDescription>
                        Enable dark mode by default
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="defaultLanguage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Language</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {LANGUAGE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Default language for the application
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="defaultTimezone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Timezone</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[300px]">
                        {TIMEZONE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Default timezone for the application
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="defaultDateFormat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date Format</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select date format" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={DateFormatEnum.MM_DD_YYYY}>
                            MM/DD/YYYY
                          </SelectItem>
                          <SelectItem value={DateFormatEnum.DD_MM_YYYY}>
                            DD/MM/YYYY
                          </SelectItem>
                          <SelectItem value={DateFormatEnum.YYYY_MM_DD}>
                            YYYY-MM-DD
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="defaultTimeFormat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time Format</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select time format" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={TimeFormatEnum.TWELVE_HOUR}>
                            12 Hour
                          </SelectItem>
                          <SelectItem value={TimeFormatEnum.TWENTY_FOUR_HOUR}>
                            24 Hour
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="defaultFirstDayOfWeek"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Day of Week</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={String(field.value ?? 0)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="0">Sunday</SelectItem>
                        <SelectItem value="1">Monday</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Default first day of the week for calendars
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="defaultCommunicationChannel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Communication Channel</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={CommunicationChannelEnum.EMAIL}>
                          Email
                        </SelectItem>
                        <SelectItem value={CommunicationChannelEnum.PHONE}>
                          Phone
                        </SelectItem>
                        <SelectItem value={CommunicationChannelEnum.SMS}>
                          SMS
                        </SelectItem>
                        <SelectItem value={CommunicationChannelEnum.IN_APP}>
                          In-App
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>
                Default privacy and data sharing preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="defaultDataSharing"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Data Sharing</FormLabel>
                      <FormDescription>
                        Enable data sharing by default
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="defaultProfileVisibility"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Profile Visibility
                      </FormLabel>
                      <FormDescription>
                        Make profiles visible by default
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="defaultActivityTracking"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Activity Tracking
                      </FormLabel>
                      <FormDescription>
                        Enable activity tracking by default
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="defaultShareDataWithEmployers"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Share Data with Employers
                      </FormLabel>
                      <FormDescription>
                        Allow data sharing with employers by default
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Regional Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Regional Settings</CardTitle>
              <CardDescription>
                Default regional and localization preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="defaultCurrency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Currency</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CURRENCY_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Default currency for the application
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="defaultCountry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Country</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-[300px]">
                          {COUNTRY_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Default country for the application
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* System Limits */}
          <Card>
            <CardHeader>
              <CardTitle>System Limits</CardTitle>
              <CardDescription>
                Default system limits and security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="maxFileUploadSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max File Upload Size</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        value={String(field.value)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {FILE_UPLOAD_SIZE_OPTIONS.map((option) => (
                            <SelectItem
                              key={option.value}
                              value={String(option.value)}
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Maximum file upload size in megabytes
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxFilesPerUpload"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Files Per Upload</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        value={String(field.value)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select number" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {FILES_PER_UPLOAD_OPTIONS.map((option) => (
                            <SelectItem
                              key={option.value}
                              value={String(option.value)}
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Maximum number of files per upload
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sessionTimeout"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Session Timeout</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        value={String(field.value)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select timeout" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SESSION_TIMEOUT_OPTIONS.map((option) => (
                            <SelectItem
                              key={option.value}
                              value={String(option.value)}
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Session timeout in minutes
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxLoginAttempts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Login Attempts</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        value={String(field.value)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select attempts" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {MAX_LOGIN_ATTEMPTS_OPTIONS.map((option) => (
                            <SelectItem
                              key={option.value}
                              value={String(option.value)}
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Maximum allowed login attempts
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="passwordExpiryDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password Expiry</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        value={String(field.value)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select expiry" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PASSWORD_EXPIRY_OPTIONS.map((option) => (
                            <SelectItem
                              key={option.value}
                              value={String(option.value)}
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Password expiry period in days
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/app/support/configurations')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { IPartnerProfileSettings, logger } from '@/lib/shared';
import { partnerProfileService } from '@/lib/services/services';

const formSchema = z.object({
  notificationsEnabled: z.boolean(),
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  jobAlerts: z.boolean(),
  candidateAlerts: z.boolean(),
  applicationAlerts: z.boolean(),
});

interface NotificationSettingsFormProps {
  settings: IPartnerProfileSettings | null;
  onUpdate: (settings: IPartnerProfileSettings) => void;
}

export function NotificationSettingsForm({
  settings,
  onUpdate,
}: NotificationSettingsFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      notificationsEnabled: settings?.notificationsEnabled ?? false,
      emailNotifications: settings?.emailNotifications ?? false,
      pushNotifications: settings?.pushNotifications ?? false,
      jobAlerts: settings?.jobAlerts ?? false,
      candidateAlerts: settings?.candidateAlerts ?? false,
      applicationAlerts: settings?.applicationAlerts ?? false,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const updatedSettings: IPartnerProfileSettings = {
        ...settings!,
        notificationsEnabled: values.notificationsEnabled,
        emailNotifications: values.emailNotifications,
        pushNotifications: values.pushNotifications,
        jobAlerts: values.jobAlerts,
        candidateAlerts: values.candidateAlerts,
        applicationAlerts: values.applicationAlerts,
      };
      const response =
        await partnerProfileService.updateProfileSettings(updatedSettings);
      onUpdate(response);
      toast.success('Notification settings updated successfully');
    } catch (error) {
      toast.error('Failed to update notification settings');
      logger.error('Error updating notification settings:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="notificationsEnabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Enable Notifications
                </FormLabel>
                <FormDescription>
                  Receive notifications about important updates and activities
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

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="emailNotifications"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Email Notifications
                  </FormLabel>
                  <FormDescription>
                    Receive notifications via email
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={!form.watch('notificationsEnabled')}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pushNotifications"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Push Notifications
                  </FormLabel>
                  <FormDescription>
                    Receive push notifications in your browser
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={!form.watch('notificationsEnabled')}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Alert Preferences</h3>

          <FormField
            control={form.control}
            name="jobAlerts"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Job Alerts</FormLabel>
                  <FormDescription>
                    Get notified about new job postings and updates
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={!form.watch('notificationsEnabled')}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="candidateAlerts"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Candidate Alerts</FormLabel>
                  <FormDescription>
                    Get notified about new candidate matches and updates
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={!form.watch('notificationsEnabled')}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="applicationAlerts"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Application Alerts
                  </FormLabel>
                  <FormDescription>
                    Get notified about new job applications and status changes
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={!form.watch('notificationsEnabled')}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full">
          Save Changes
        </Button>
      </form>
    </Form>
  );
}

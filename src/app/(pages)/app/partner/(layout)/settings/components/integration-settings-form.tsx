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
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { IPartnerProfileSettings, logger } from '@/lib/shared';
import { partnerProfileService } from '@/lib/services/services';

const formSchema = z.object({
  integrationSettings: z.object({
    ats: z.object({
      enabled: z.boolean(),
      provider: z.string().optional(),
      apiKey: z.string().optional(),
      webhookUrl: z.string().url('Invalid webhook URL').optional(),
    }),
    calendar: z.object({
      enabled: z.boolean(),
      provider: z.string().optional(),
      apiKey: z.string().optional(),
    }),
    communication: z.object({
      enabled: z.boolean(),
      provider: z.string().optional(),
      apiKey: z.string().optional(),
    }),
  }),
});

interface IntegrationSettingsFormProps {
  settings: IPartnerProfileSettings | null;
  onUpdate: (settings: IPartnerProfileSettings) => void;
}

export function IntegrationSettingsForm({
  settings,
  onUpdate,
}: IntegrationSettingsFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      integrationSettings: {
        ats: {
          enabled: settings?.integrationSettings?.ats?.enabled ?? false,
          provider: settings?.integrationSettings?.ats?.provider ?? '',
          apiKey: settings?.integrationSettings?.ats?.apiKey ?? '',
          webhookUrl: settings?.integrationSettings?.ats?.webhookUrl ?? '',
        },
        calendar: {
          enabled: settings?.integrationSettings?.calendar?.enabled ?? false,
          provider: settings?.integrationSettings?.calendar?.provider ?? '',
          apiKey: settings?.integrationSettings?.calendar?.apiKey ?? '',
        },
        communication: {
          enabled:
            settings?.integrationSettings?.communication?.enabled ?? false,
          provider:
            settings?.integrationSettings?.communication?.provider ?? '',
          apiKey: settings?.integrationSettings?.communication?.apiKey ?? '',
        },
      },
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const updatedSettings: IPartnerProfileSettings = {
        ...settings!,
        integrationSettings: values.integrationSettings,
      };
      const response =
        await partnerProfileService.updateProfileSettings(updatedSettings);
      onUpdate(response);
      toast.success('Integration settings updated successfully');
    } catch (error) {
      logger.error('Failed to update integration settings:', error);
      toast.error('Failed to update integration settings');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* ATS Integration */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">
            Applicant Tracking System (ATS)
          </h3>

          <FormField
            control={form.control}
            name="integrationSettings.ats.enabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Enable ATS Integration
                  </FormLabel>
                  <FormDescription>
                    Connect with your existing ATS system
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

          {form.watch('integrationSettings.ats.enabled') && (
            <div className="space-y-4 pl-4">
              <FormField
                control={form.control}
                name="integrationSettings.ats.provider"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ATS Provider</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Greenhouse, Lever" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="integrationSettings.ats.apiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Key</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your ATS API key"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="integrationSettings.ats.webhookUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Webhook URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://your-ats-webhook.com"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          )}
        </div>

        {/* Calendar Integration */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Calendar Integration</h3>

          <FormField
            control={form.control}
            name="integrationSettings.calendar.enabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Enable Calendar Integration
                  </FormLabel>
                  <FormDescription>
                    Connect with your calendar system for interview scheduling
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

          {form.watch('integrationSettings.calendar.enabled') && (
            <div className="space-y-4 pl-4">
              <FormField
                control={form.control}
                name="integrationSettings.calendar.provider"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Calendar Provider</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Google Calendar, Outlook"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="integrationSettings.calendar.apiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Key</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your calendar API key"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          )}
        </div>

        {/* Communication Integration */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Communication Integration</h3>

          <FormField
            control={form.control}
            name="integrationSettings.communication.enabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Enable Communication Integration
                  </FormLabel>
                  <FormDescription>
                    Connect with your communication platform
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

          {form.watch('integrationSettings.communication.enabled') && (
            <div className="space-y-4 pl-4">
              <FormField
                control={form.control}
                name="integrationSettings.communication.provider"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Communication Provider</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Slack, Microsoft Teams"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="integrationSettings.communication.apiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Key</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your communication platform API key"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          )}
        </div>

        <Button type="submit" className="w-full">
          Save Changes
        </Button>
      </form>
    </Form>
  );
}

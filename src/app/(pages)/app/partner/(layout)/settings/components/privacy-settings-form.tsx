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
  privacySettings: z.object({
    profileVisibility: z.boolean(),
    dataSharing: z.boolean(),
    analyticsTracking: z.boolean(),
    marketingCommunications: z.boolean(),
  }),
});

interface PrivacySettingsFormProps {
  settings: IPartnerProfileSettings | null;
  onUpdate: (settings: IPartnerProfileSettings) => void;
}

export function PrivacySettingsForm({
  settings,
  onUpdate,
}: PrivacySettingsFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      privacySettings: {
        profileVisibility: settings?.privacySettings?.profileVisibility ?? true,
        dataSharing: settings?.privacySettings?.dataSharing ?? false,
        analyticsTracking: settings?.privacySettings?.analyticsTracking ?? true,
        marketingCommunications:
          settings?.privacySettings?.marketingCommunications ?? false,
      },
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const updatedSettings: IPartnerProfileSettings = {
        ...settings!,
        privacySettings: values.privacySettings,
      };
      const response =
        await partnerProfileService.updateProfileSettings(updatedSettings);
      onUpdate(response);
      toast.success('Privacy settings updated successfully');
    } catch (error) {
      logger.error('Failed to update privacy settings:', error);
      toast.error('Failed to update privacy settings');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="privacySettings.profileVisibility"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Profile Visibility</FormLabel>
                <FormDescription>
                  Make your company profile visible to potential candidates
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
          name="privacySettings.dataSharing"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Data Sharing</FormLabel>
                <FormDescription>
                  Allow sharing of anonymized data for service improvement
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
          name="privacySettings.analyticsTracking"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Analytics Tracking</FormLabel>
                <FormDescription>
                  Allow tracking of usage analytics to improve our service
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
          name="privacySettings.marketingCommunications"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Marketing Communications
                </FormLabel>
                <FormDescription>
                  Receive updates about new features and promotional offers
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

        <Button type="submit" className="w-full">
          Save Changes
        </Button>
      </form>
    </Form>
  );
}

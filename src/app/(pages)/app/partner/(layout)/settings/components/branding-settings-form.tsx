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
import { ColorPicker } from '@/components/ui/color-picker';
import { toast } from 'sonner';
import { IPartnerProfileSettings, logger } from '@/lib/shared';
import { partnerProfileService } from '@/lib/services/services';

const formSchema = z.object({
  brandingSettings: z.object({
    primaryColor: z
      .string()
      .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color code'),
    secondaryColor: z
      .string()
      .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color code'),
    logoUrl: z.string().url('Invalid URL').optional(),
    customDomain: z.string().optional(),
  }),
});

interface BrandingSettingsFormProps {
  settings: IPartnerProfileSettings | null;
  onUpdate: (settings: IPartnerProfileSettings) => void;
}

export function BrandingSettingsForm({
  settings,
  onUpdate,
}: BrandingSettingsFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      brandingSettings: {
        primaryColor: settings?.brandingSettings?.primaryColor ?? '#000000',
        secondaryColor: settings?.brandingSettings?.secondaryColor ?? '#ffffff',
        logoUrl: settings?.brandingSettings?.logoUrl ?? '',
        customDomain: settings?.brandingSettings?.customDomain ?? '',
      },
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const updatedSettings: IPartnerProfileSettings = {
        ...settings!,
        brandingSettings: values.brandingSettings,
      };
      const response =
        await partnerProfileService.updateProfileSettings(updatedSettings);
      onUpdate(response);
      toast.success('Branding settings updated successfully');
    } catch (error) {
      logger.error('Failed to update branding settings:', error);
      toast.error('Failed to update branding settings');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="brandingSettings.primaryColor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Primary Color</FormLabel>
              <FormDescription>
                Choose your brand&apos;s primary color
              </FormDescription>
              <FormControl>
                <ColorPicker value={field.value} onChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="brandingSettings.secondaryColor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Secondary Color</FormLabel>
              <FormDescription>
                Choose your brand&apos;s secondary color
              </FormDescription>
              <FormControl>
                <ColorPicker value={field.value} onChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="brandingSettings.logoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Logo URL</FormLabel>
              <FormDescription>
                Enter the URL of your company logo
              </FormDescription>
              <FormControl>
                <Input placeholder="https://example.com/logo.png" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="brandingSettings.customDomain"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Custom Domain</FormLabel>
              <FormDescription>
                Set up a custom domain for your career portal
              </FormDescription>
              <FormControl>
                <Input placeholder="careers.yourcompany.com" {...field} />
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

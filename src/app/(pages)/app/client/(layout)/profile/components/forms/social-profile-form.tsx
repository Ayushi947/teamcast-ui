'use client';

import { type FC, useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
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
import { toast } from 'sonner';
import { clientProfileService } from '@/lib/services/services';
import { IClientProfileSocial, logger } from '@/lib/shared';
import {
  Loader2,
  AtSign,
  Globe,
  Facebook,
  Instagram,
  Youtube,
  Github,
} from 'lucide-react';
import { ProfileFormSection } from '../ui/profile-form-section';

const socialSchema = z.object({
  linkedin: z
    .string()
    .url({ message: 'Please enter a valid LinkedIn URL' })
    .optional()
    .or(z.literal('')),
  twitter: z
    .string()
    .url({ message: 'Please enter a valid Twitter URL' })
    .optional()
    .or(z.literal('')),
  facebook: z
    .string()
    .url({ message: 'Please enter a valid Facebook URL' })
    .optional()
    .or(z.literal('')),
  instagram: z
    .string()
    .url({ message: 'Please enter a valid Instagram URL' })
    .optional()
    .or(z.literal('')),
  youtube: z
    .string()
    .url({ message: 'Please enter a valid YouTube URL' })
    .optional()
    .or(z.literal('')),
  github: z
    .string()
    .url({ message: 'Please enter a valid GitHub URL' })
    .optional()
    .or(z.literal('')),
});

type SocialFormValues = z.infer<typeof socialSchema>;

interface SocialProfileFormProps {
  initialData?: IClientProfileSocial;
  onSuccess?: () => void;
  isEditing?: boolean;
}

export const SocialProfileForm: FC<SocialProfileFormProps> = ({
  initialData,
  onSuccess,
  isEditing = true,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<SocialFormValues>({
    resolver: zodResolver(socialSchema),
    defaultValues: {
      linkedin: '',
      twitter: '',
      facebook: '',
      instagram: '',
      youtube: '',
      github: '',
    },
  });

  const { isDirty } = form.formState;

  useEffect(() => {
    if (initialData) {
      // If we have initial data, set the form values
      form.reset({
        linkedin: initialData.linkedin || '',
        twitter: initialData.twitter || '',
        facebook: initialData.facebook || '',
        instagram: initialData.instagram || '',
        youtube: initialData.youtube || '',
        github: initialData.github || '',
      });
    } else {
      const fetchSocialData = async () => {
        setIsLoading(true);
        try {
          const data = await clientProfileService.getSocialProfile();
          form.reset({
            linkedin: data.linkedin || '',
            twitter: data.twitter || '',
            facebook: data.facebook || '',
            instagram: data.instagram || '',
            youtube: data.youtube || '',
            github: data.github || '',
          });
        } catch (error) {
          toast.error('Failed to load social profile data');
          logger.error('Failed to load social profile data:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchSocialData();
    }
  }, [form, initialData]);

  const onSubmit = async (values: SocialFormValues) => {
    // Check if form has any changes
    if (!isDirty) {
      toast.info('No changes to save');
      return;
    }

    setIsLoading(true);
    try {
      const socialData: IClientProfileSocial = {
        linkedin: values.linkedin,
        twitter: values.twitter,
        facebook: values.facebook,
        instagram: values.instagram,
        youtube: values.youtube,
        github: values.github,
      };
      await clientProfileService.updateSocialProfile(socialData);

      queryClient.invalidateQueries({ queryKey: ['clientProfile'] });
      form.reset(values);
      toast.success('Social profiles updated');

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error('Failed to update social profiles');
      logger.error('Failed to update social profiles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !initialData) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <ProfileFormSection
            title="Social Media Profiles"
            description="Connect your company's online presence"
            icon={Globe}
            className="dark:bg-accent rounded-2xl"
          >
            <div className="dark:bg-accent grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="linkedin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <AtSign className="h-3.5 w-3.5 text-blue-600" />
                      LinkedIn
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://linkedin.com/company/your-company"
                        {...field}
                        value={field.value || ''}
                        disabled={!isEditing}
                      />
                    </FormControl>
                    <FormDescription>
                      Company LinkedIn profile URL
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="twitter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <AtSign className="h-3.5 w-3.5 text-blue-500" />
                      Twitter
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://twitter.com/yourcompany"
                        {...field}
                        value={field.value || ''}
                        disabled={!isEditing}
                      />
                    </FormControl>
                    <FormDescription>
                      Company Twitter profile URL
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="facebook"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <Facebook className="h-3.5 w-3.5 text-blue-700" />
                      Facebook
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://facebook.com/yourcompany"
                        {...field}
                        value={field.value || ''}
                        disabled={!isEditing}
                      />
                    </FormControl>
                    <FormDescription>Company Facebook page URL</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="instagram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <Instagram className="h-3.5 w-3.5 text-pink-600" />
                      Instagram
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://instagram.com/yourcompany"
                        {...field}
                        value={field.value || ''}
                        disabled={!isEditing}
                      />
                    </FormControl>
                    <FormDescription>
                      Company Instagram profile URL
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="youtube"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <Youtube className="h-3.5 w-3.5 text-red-600" />
                      YouTube
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://youtube.com/c/yourcompany"
                        {...field}
                        value={field.value || ''}
                        disabled={!isEditing}
                      />
                    </FormControl>
                    <FormDescription>
                      Company YouTube channel URL
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="github"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <Github className="h-3.5 w-3.5 text-gray-800" />
                      GitHub
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://github.com/yourcompany"
                        {...field}
                        value={field.value || ''}
                        disabled={!isEditing}
                      />
                    </FormControl>
                    <FormDescription>
                      Company GitHub organization URL
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </ProfileFormSection>

          {isEditing && (
            <Button
              type="submit"
              className="w-full md:w-auto"
              disabled={isLoading || !isDirty}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          )}
        </form>
      </Form>
    </div>
  );
};

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Share2 } from 'lucide-react';

interface SocialUpdateTabProps {
  form: UseFormReturn<any>;
  isSubmitting: boolean;
}

export function SocialUpdateTab({ form, isSubmitting }: SocialUpdateTabProps) {
  return (
    <Card className="bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <CardHeader className="border-b border-gray-100 pb-4 dark:border-gray-700">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <Share2 className="h-5 w-5 text-[#6e55cf] dark:text-purple-400" />
          Social Media & Culture
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="company.socialProfiles.linkedin"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                  LinkedIn
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="https://linkedin.com/company/..."
                    disabled={isSubmitting}
                    className="h-10 border-gray-300 focus:border-[#6e55cf] focus:ring-[#6e55cf] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="company.socialProfiles.twitter"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                  Twitter
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="https://twitter.com/..."
                    disabled={isSubmitting}
                    className="h-10 border-gray-300 focus:border-[#6e55cf] focus:ring-[#6e55cf] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="company.socialProfiles.facebook"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                  Facebook
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="https://facebook.com/..."
                    disabled={isSubmitting}
                    className="h-10 border-gray-300 focus:border-[#6e55cf] focus:ring-[#6e55cf] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="company.socialProfiles.github"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                  GitHub
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="https://github.com/..."
                    disabled={isSubmitting}
                    className="h-10 border-gray-300 focus:border-[#6e55cf] focus:ring-[#6e55cf] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="company.socialProfiles.instagram"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                  Instagram
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="https://instagram.com/..."
                    disabled={isSubmitting}
                    className="h-10 border-gray-300 focus:border-[#6e55cf] focus:ring-[#6e55cf] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="company.socialProfiles.youtube"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                  YouTube
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="https://youtube.com/..."
                    disabled={isSubmitting}
                    className="h-10 border-gray-300 focus:border-[#6e55cf] focus:ring-[#6e55cf] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="company.culture.mission"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                  Mission
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={2}
                    disabled={isSubmitting}
                    className="border-gray-300 focus:border-[#6e55cf] focus:ring-[#6e55cf] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Company mission statement..."
                  />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="company.culture.vision"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                  Vision
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={2}
                    disabled={isSubmitting}
                    className="border-gray-300 focus:border-[#6e55cf] focus:ring-[#6e55cf] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Company vision statement..."
                  />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { candidateJobPostingService } from '@/lib/services/services';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { logger } from '@/lib/shared';
import { JobRecommendationItem } from '../types';

const formSchema = z.object({
  message: z.string().optional(),
  resumeFile: z
    .any()
    .optional()
    .refine((file) => {
      if (!file) return true;
      if (typeof window === 'undefined') return true; // Skip validation during SSR
      return file instanceof File;
    }, 'Must be a valid file'),
  coverLetterFile: z
    .any()
    .optional()
    .refine((file) => {
      if (!file) return true;
      if (typeof window === 'undefined') return true; // Skip validation during SSR
      return file instanceof File;
    }, 'Must be a valid file'),
});

interface ApplyJobDialogProps {
  job: JobRecommendationItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ApplyJobDialog = ({
  job,
  open,
  onOpenChange,
}: ApplyJobDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);

      // Handle file uploads if needed
      let coverLetterUrl;
      let resumeUrl;

      // In a real implementation, you would upload files to your storage service
      // and get back URLs to include in the application

      const applicationData = {
        message: values.message,
        coverLetterUrl,
        resumeUrl,
      };

      // Submit application
      await candidateJobPostingService.applyForJob(job.id, applicationData);

      toast.success('Application submitted successfully!');
      onOpenChange(false);
      form.reset();
    } catch (error) {
      logger.error('Error applying for job:', error);
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Apply for {job.title}</DialogTitle>
          <DialogDescription>
            Submit your application to {job.company?.name || 'this company'}.
            You can include a cover letter and additional information.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cover Letter / Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write a brief message to the employer..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="resumeFile"
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel>Resume (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          onChange(file);
                        }
                      }}
                      {...fieldProps}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="coverLetterFile"
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel>Cover Letter Document (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          onChange(file);
                        }
                      }}
                      {...fieldProps}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Application'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

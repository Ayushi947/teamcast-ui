'use client';

import { FC, useState, useEffect } from 'react';
import {
  IClientProfileAiAssessmentSettings,
  DifficultyLevelEnum,
} from '@/lib/shared';
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
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { ProfileFormSection } from '../ui/profile-form-section';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Brain, Sliders, Hourglass } from 'lucide-react';
import { clientProfileService } from '@/lib/services/services';
import { logger } from '@/lib/shared';

// Define the form schema with sensible defaults
const aiSettingsSchema = z.object({
  defaultAssessmentDuration: z.number().min(1).max(120),
  maxAssessmentDuration: z.number().min(1).max(240),
  assessmentBuffer: z.number().min(0).max(60),
  useCustomPrompts: z.boolean(),
  aiDifficulty: z.nativeEnum(DifficultyLevelEnum),
});

type AiSettingsFormValues = z.infer<typeof aiSettingsSchema>;

interface AiSettingsFormProps {
  initialData?: IClientProfileAiAssessmentSettings;
  onSuccess?: () => void;
  isEditing?: boolean;
}

export const AiSettingsForm: FC<AiSettingsFormProps> = ({
  initialData,
  onSuccess,
  isEditing = true,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<AiSettingsFormValues>({
    resolver: zodResolver(aiSettingsSchema),
    defaultValues: {
      defaultAssessmentDuration: 30,
      maxAssessmentDuration: 60,
      assessmentBuffer: 10,
      useCustomPrompts: false,
      aiDifficulty: DifficultyLevelEnum.MEDIUM,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        defaultAssessmentDuration: initialData.defaultAssessmentDuration ?? 30,
        maxAssessmentDuration: initialData.maxAssessmentDuration ?? 60,
        assessmentBuffer: initialData.assessmentBuffer ?? 10,
        useCustomPrompts: initialData.useCustomPrompts ?? false,
        aiDifficulty: initialData.aiDifficulty ?? DifficultyLevelEnum.MEDIUM,
      });
    }
  }, [form, initialData]);

  const onSubmit = async (values: AiSettingsFormValues) => {
    setIsLoading(true);
    try {
      // Add clientId to the values - you might need to get this from context or props
      const settingsData: IClientProfileAiAssessmentSettings = {
        ...values,
        clientId: '', // TODO: Get actual clientId from context/props
      };

      await clientProfileService.updateAiAssessmentSettings(settingsData);

      queryClient.invalidateQueries({ queryKey: ['clientProfile'] });

      toast.success('AI settings updated');

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error('Failed to update AI settings');
      logger.error(error);
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <ProfileFormSection
          title="AI Assessment Settings"
          description="Configure how AI evaluates candidates"
          icon={Brain}
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="defaultAssessmentDuration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <Hourglass className="text-muted-foreground h-3.5 w-3.5" />
                      Default Assessment Duration (minutes)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={120}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        disabled={!isEditing}
                      />
                    </FormControl>
                    <FormDescription>
                      The default duration for candidate assessments
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxAssessmentDuration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Assessment Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={240}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        disabled={!isEditing}
                      />
                    </FormControl>
                    <FormDescription>
                      The maximum time allowed for an assessment
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="assessmentBuffer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assessment Buffer Time (minutes)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={60}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      disabled={!isEditing}
                    />
                  </FormControl>
                  <FormDescription>
                    Extra time added to assessments for technical issues
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </ProfileFormSection>

        <ProfileFormSection
          title="AI Difficulty and Scoring"
          description="Configure assessment difficulty and passing score"
          icon={Sliders}
        >
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="aiDifficulty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>AI Difficulty Level</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={DifficultyLevelEnum.EASY}>
                        Easy
                      </SelectItem>
                      <SelectItem value={DifficultyLevelEnum.MEDIUM}>
                        Medium
                      </SelectItem>
                      <SelectItem value={DifficultyLevelEnum.HARD}>
                        Hard
                      </SelectItem>
                      <SelectItem value={DifficultyLevelEnum.EXPERT}>
                        Expert
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The difficulty level of AI-generated questions
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="useCustomPrompts"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-y-0 space-x-3 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Use Custom Prompts</FormLabel>
                    <FormDescription>
                      Create custom assessment prompts instead of using
                      AI-generated ones
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </ProfileFormSection>

        {isEditing && (
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
};

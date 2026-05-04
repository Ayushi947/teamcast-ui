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
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { clientProfileService } from '@/lib/services/services';
import { IClientProfileCulture, logger } from '@/lib/shared';
import {
  X,
  Loader2,
  TargetIcon,
  HeartHandshake,
  Star,
  Coffee,
} from 'lucide-react';
import { ProfileFormSection } from '../ui/profile-form-section';
import { Badge } from '@/components/ui/badge';

const cultureSchema = z.object({
  mission: z.string().optional(),
  vision: z.string().optional(),
  values: z.array(z.string()),
  perks: z.array(z.string()),
  workEnvironment: z.array(z.string()),
  // Add temporary fields for input validation
  newValue: z.string().optional(),
  newPerk: z.string().optional(),
  newEnvironment: z.string().optional(),
});

type CultureFormValues = z.infer<typeof cultureSchema>;

interface CultureProfileFormProps {
  initialData?: IClientProfileCulture;
  onSuccess?: () => void;
  isEditing?: boolean;
}

export const CultureProfileForm: FC<CultureProfileFormProps> = ({
  initialData,
  onSuccess,
  isEditing = true,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentField, setCurrentField] = useState<
    'values' | 'perks' | 'workEnvironment'
  >('values');

  const form = useForm<CultureFormValues>({
    resolver: zodResolver(cultureSchema),
    defaultValues: {
      mission: '',
      vision: '',
      values: [] as string[],
      perks: [],
      workEnvironment: [],
      newValue: '',
      newPerk: '',
      newEnvironment: '',
    },
  });
  const queryClient = useQueryClient();

  const { dirtyFields } = form.formState;
  const [hasArrayChanges, setHasArrayChanges] = useState(false);

  // Check if actual data fields are dirty (exclude temporary input fields)
  const hasRealChanges =
    Object.keys(dirtyFields).some(
      (field) => !['newValue', 'newPerk', 'newEnvironment'].includes(field)
    ) || hasArrayChanges;

  useEffect(() => {
    if (initialData) {
      // If we have initial data, set the form values
      form.reset({
        mission: initialData.mission || '',
        vision: initialData.vision || '',
        values: initialData.values || [],
        perks: initialData.perks || [],
        workEnvironment: initialData.workEnvironment || [],
        newValue: '',
        newPerk: '',
        newEnvironment: '',
      });
      // Reset array changes flag when loading initial data
      setHasArrayChanges(false);
    } else {
      const fetchCultureData = async () => {
        setIsLoading(true);
        try {
          const data = await clientProfileService.getCulture();
          form.reset({
            mission: data.mission || '',
            vision: data.vision || '',
            values: data.values || [],
            perks: data.perks || [],
            workEnvironment: data.workEnvironment || [],
            newValue: '',
            newPerk: '',
            newEnvironment: '',
          });
          // Reset array changes flag when loading data from API
          setHasArrayChanges(false);
        } catch (error) {
          toast.error('Failed to load culture data');
          logger.error(error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchCultureData();
    }
  }, [form, initialData]);

  const onSubmit = async (values: CultureFormValues) => {
    // Check if form has any real changes (excluding temporary input fields)
    if (!hasRealChanges) {
      toast.info('No changes to save');
      return;
    }

    setIsLoading(true);
    try {
      const cultureData: IClientProfileCulture = {
        mission: values.mission,
        vision: values.vision,
        values: values.values,
        perks: values.perks,
        workEnvironment: values.workEnvironment,
      };
      await clientProfileService.updateCulture(cultureData);

      queryClient.invalidateQueries({ queryKey: ['clientProfile'] });

      // Reset form state to mark as clean after successful save
      form.reset({
        ...cultureData,
        newValue: '',
        newPerk: '',
        newEnvironment: '',
      });

      // Reset array changes flag
      setHasArrayChanges(false);

      toast.success('Culture information updated successfully');

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error('Failed to update culture information');
      logger.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = () => {
    let value = '';
    let field = '';
    let fieldName = '';
    let inputField = '';

    switch (currentField) {
      case 'values':
        value = form.getValues('newValue') || '';
        field = 'values';
        fieldName = 'value';
        inputField = 'newValue';
        break;
      case 'perks':
        value = form.getValues('newPerk') || '';
        field = 'perks';
        fieldName = 'perk';
        inputField = 'newPerk';
        break;
      case 'workEnvironment':
        value = form.getValues('newEnvironment') || '';
        field = 'workEnvironment';
        fieldName = 'environment trait';
        inputField = 'newEnvironment';
        break;
    }

    // Clear any existing error for this input field
    form.clearErrors(inputField as keyof CultureFormValues);

    if (value.trim() === '') {
      form.setError(inputField as keyof CultureFormValues, {
        type: 'manual',
        message: `Please enter a ${fieldName} before adding`,
      });
      return;
    }

    const currentValues =
      (form.getValues(field as keyof CultureFormValues) as string[]) || [];

    // Check for duplicates
    if (currentValues.includes(value.trim())) {
      form.setError(inputField as keyof CultureFormValues, {
        type: 'manual',
        message: `This ${fieldName} already exists`,
      });
      return;
    }

    form.setValue(field as keyof CultureFormValues, [
      ...currentValues,
      value.trim(),
    ]);

    // Clear the input field
    form.setValue(inputField as keyof CultureFormValues, '');

    // Mark that array has changed
    setHasArrayChanges(true);

    toast.success(
      `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} added successfully`
    );
  };

  const removeItem = (field: keyof CultureFormValues, index: number) => {
    const currentValues = [...((form.getValues(field) as string[]) || [])];
    const removedItem = currentValues[index];
    currentValues.splice(index, 1);
    form.setValue(field, currentValues);

    // Mark that array has changed
    setHasArrayChanges(true);

    let fieldName = '';
    switch (field) {
      case 'values':
        fieldName = 'value';
        break;
      case 'perks':
        fieldName = 'perk';
        break;
      case 'workEnvironment':
        fieldName = 'environment trait';
        break;
    }

    toast.success(
      `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} "${removedItem}" removed`
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addItem();
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
            title="Company Mission and Vision"
            description="Define your company's purpose and future vision"
            icon={TargetIcon}
            className="dark:bg-accent"
          >
            <div className="grid grid-cols-1 gap-6">
              <FormField
                control={form.control}
                name="mission"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mission Statement</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Our mission is to..."
                        className="min-h-[100px]"
                        {...field}
                        value={field.value || ''}
                        disabled={!isEditing}
                      />
                    </FormControl>
                    <FormDescription>
                      What is your company&apos;s purpose and reason for
                      existence?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vision"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vision Statement</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Our vision is to become..."
                        className="min-h-[100px]"
                        {...field}
                        value={field.value || ''}
                        disabled={!isEditing}
                      />
                    </FormControl>
                    <FormDescription>
                      What is your company&apos;s aspirational future state?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </ProfileFormSection>

          <ProfileFormSection
            title="Company Values"
            description="Core principles that guide your company"
            icon={HeartHandshake}
            className="dark:bg-accent"
          >
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="newValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Values</FormLabel>
                    <div className="flex gap-3">
                      <FormControl>
                        <Input
                          placeholder="Add a company value (e.g. 'Integrity')"
                          {...field}
                          onKeyDown={(e) => {
                            setCurrentField('values');
                            handleKeyPress(e);
                          }}
                          disabled={!isEditing}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        onClick={() => {
                          setCurrentField('values');
                          addItem();
                        }}
                        disabled={!isEditing}
                      >
                        Add
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="values"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex flex-wrap gap-2">
                      {field.value.map((value, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-sm"
                        >
                          {value}
                          <button
                            type="button"
                            className="text-muted-foreground hover:text-foreground ml-2"
                            onClick={() => removeItem('values', index)}
                            disabled={!isEditing}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                      {field.value.length === 0 && (
                        <div className="text-muted-foreground text-sm">
                          No values added yet.
                        </div>
                      )}
                    </div>
                    <FormDescription>
                      What principles guide your company&apos;s decisions and
                      actions?
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>
          </ProfileFormSection>

          <ProfileFormSection
            title="Company Perks"
            description="Benefits and perks offered to employees"
            icon={Star}
            className="dark:bg-accent"
          >
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="newPerk"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee Perks</FormLabel>
                    <div className="flex gap-3">
                      <FormControl>
                        <Input
                          placeholder="Add a perk (e.g. 'Flexible hours')"
                          {...field}
                          onKeyDown={(e) => {
                            setCurrentField('perks');
                            handleKeyPress(e);
                          }}
                          disabled={!isEditing}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        onClick={() => {
                          setCurrentField('perks');
                          addItem();
                        }}
                        disabled={!isEditing}
                      >
                        Add
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="perks"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex flex-wrap gap-2">
                      {field.value.map((perk, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="bg-primary/5 text-sm"
                        >
                          {perk}
                          <button
                            type="button"
                            className="text-muted-foreground hover:text-foreground ml-2"
                            onClick={() => removeItem('perks', index)}
                            disabled={!isEditing}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                      {field.value.length === 0 && (
                        <div className="text-muted-foreground text-sm">
                          No perks added yet.
                        </div>
                      )}
                    </div>
                    <FormDescription>
                      What benefits do you offer to your employees?
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>
          </ProfileFormSection>

          <ProfileFormSection
            title="Work Environment"
            description="Characteristics of your workplace culture"
            icon={Coffee}
            className="dark:bg-accent"
          >
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="newEnvironment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Work Environment Traits</FormLabel>
                    <div className="flex gap-3">
                      <FormControl>
                        <Input
                          placeholder="Add a trait (e.g. 'Collaborative')"
                          {...field}
                          onKeyDown={(e) => {
                            setCurrentField('workEnvironment');
                            handleKeyPress(e);
                          }}
                          disabled={!isEditing}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        onClick={() => {
                          setCurrentField('workEnvironment');
                          addItem();
                        }}
                        disabled={!isEditing}
                      >
                        Add
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="workEnvironment"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex flex-wrap gap-2">
                      {field.value.map((env, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-sm"
                        >
                          {env}
                          <button
                            type="button"
                            className="text-muted-foreground hover:text-foreground ml-2"
                            onClick={() => removeItem('workEnvironment', index)}
                            disabled={!isEditing}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                      {field.value.length === 0 && (
                        <div className="text-muted-foreground text-sm">
                          No environment traits added yet.
                        </div>
                      )}
                    </div>
                    <FormDescription>
                      What characteristics define your work environment?
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>
          </ProfileFormSection>

          {isEditing && (
            <Button
              type="submit"
              className="w-full md:w-auto"
              disabled={isLoading || !hasRealChanges}
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

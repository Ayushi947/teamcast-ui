'use client';

import { type FC, useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { ContactPhoneInput } from '@/components/ui/contact-phone-input';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  CompanyTypeEnum,
  CompanyIndustryEnum,
  CompanySizeEnum,
  CompanyStageEnum,
  IClientProfileBasic,
} from '@/lib/shared';
import { clientProfileService } from '@/lib/services/services';
import { enumToReadableText } from '@/lib/utils';
import {
  Loader2,
  Building2,
  Mail,
  Phone,
  User,
  Calendar,
  Globe,
  Briefcase,
} from 'lucide-react';
import { ProfileFormSection } from '../ui/profile-form-section';
import { useApp } from '@/lib/context/app-context';
import { ActivityChange } from '@/lib/hooks/use-activity-tracking';
import { logger } from '@/lib/shared';

type FormValues = {
  name: string;
  description: string;
  companyType: CompanyTypeEnum;
  industry: CompanyIndustryEnum;
  size: CompanySizeEnum;
  stage: CompanyStageEnum;
  foundedYear: number;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactName?: string;
  country?: string;
  benefits: string[];
};

const formSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Company name must be at least 2 characters' }),
  description: z
    .string()
    .min(10, { message: 'Description must be at least 10 characters' }),
  companyType: z.nativeEnum(CompanyTypeEnum),
  industry: z.nativeEnum(CompanyIndustryEnum),
  size: z.nativeEnum(CompanySizeEnum),
  stage: z.nativeEnum(CompanyStageEnum),
  foundedYear: z.coerce.number().min(1900).max(new Date().getFullYear()),
  website: z
    .string()
    .url({ message: 'Please enter a valid URL' })
    .optional()
    .or(z.literal('')),
  contactEmail: z
    .string()
    .email({ message: 'Please enter a valid email' })
    .optional()
    .or(z.literal('')),
  contactPhone: z.string().optional(),
  contactName: z.string().optional(),
  country: z.string().optional(),
  benefits: z.array(z.string()),
});

interface BasicProfileFormProps {
  initialData?: IClientProfileBasic;
  onSuccess?: () => void;
  isEditing?: boolean;
}

export const BasicProfileForm: FC<BasicProfileFormProps> = ({
  initialData,
  onSuccess,
  isEditing = true,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState<IClientProfileBasic | null>(
    null
  );
  const [phoneValidationError, setPhoneValidationError] = useState<
    string | null
  >(null);
  const { user } = useApp();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      companyType: Object.values(CompanyTypeEnum)[0],
      industry: Object.values(CompanyIndustryEnum)[0],
      size: Object.values(CompanySizeEnum)[0],
      stage: Object.values(CompanyStageEnum)[0],
      foundedYear: 2020,
      website: '',
      contactEmail: '',
      contactPhone: '',
      contactName: '',
      country: '',
      benefits: [],
    },
  });

  const { isDirty } = form.formState;

  // Function to reset form with data
  const resetFormWithData = (data: IClientProfileBasic) => {
    const formData = {
      name: data.name || '',
      description: data.description || '',
      companyType: data.companyType || Object.values(CompanyTypeEnum)[0],
      industry: data.industry || Object.values(CompanyIndustryEnum)[0],
      size: data.size || Object.values(CompanySizeEnum)[0],
      stage: data.stage || Object.values(CompanyStageEnum)[0],
      foundedYear: data.foundedYear || 2020,
      website: data.website || '',
      contactEmail: data.contactEmail || '',
      contactPhone: data.contactPhone || '',
      contactName: data.contactName || '',
      benefits: data.benefits || [],
    };

    // Handle phone number parsing for the new component
    if (data.contactPhone) {
      // Parse phone number in format: +dialcode-actualNumber
      const phoneMatch = data.contactPhone.match(/^(\+\d{1,4})-(.*)$/);
      if (phoneMatch) {
        const phoneWithoutDialCode = phoneMatch[2];
        formData.contactPhone = phoneWithoutDialCode;
      } else {
        // Fallback: try old format or treat as just the number
        const oldFormatMatch = data.contactPhone.match(/^(\+\d{1,4})(.*)/);
        if (oldFormatMatch) {
          const phoneWithoutDialCode = oldFormatMatch[2].trim();
          formData.contactPhone = phoneWithoutDialCode;
        } else {
          // If phone doesn't start with +, treat it as just the number
          formData.contactPhone = data.contactPhone;
        }
      }
    } else {
      formData.contactPhone = '';
    }

    // Use setTimeout to ensure the form is properly reset after render
    setTimeout(() => {
      form.reset(formData);
    }, 0);
  };

  useEffect(() => {
    if (initialData) {
      setProfileData(initialData);
      resetFormWithData(initialData);
    } else {
      const fetchProfileData = async () => {
        setIsLoading(true);
        try {
          const data = await clientProfileService.getBasicProfile();
          setProfileData(data);
          resetFormWithData(data);
        } catch (error) {
          toast.error('Failed to load profile data');
          logger.error(error);
          // Set default values when there's an error
        } finally {
          setIsLoading(false);
        }
      };

      fetchProfileData();
    }
  }, [initialData]);

  const [dialCode, setDialCode] = useState('+1');
  const [_selectedCountry, setSelectedCountry] = useState('United States');

  const onSubmit = async (values: FormValues) => {
    // Check if form has any changes
    if (!isDirty) {
      toast.info('No changes to save');
      return;
    }

    setIsLoading(true);
    try {
      // Converting the form values to the expected API model
      const updatedProfileData: IClientProfileBasic = {
        name: values.name,
        description: values.description,
        companyType: values.companyType,
        industry: values.industry,
        size: values.size,
        stage: values.stage,
        foundedYear: values.foundedYear,
        website: values.website,
        contactEmail: values.contactEmail,
        contactPhone: values.contactPhone
          ? `${dialCode}-${values.contactPhone}`
          : '',
        contactName: values.contactName,
        benefits: values.benefits,
      };

      await clientProfileService.updateBasicProfile(updatedProfileData);

      if (user?.id) {
        const changes: ActivityChange[] = [];

        // Use profileData (current state) instead of initialData for comparison
        const currentData = profileData || initialData;

        if (currentData?.name !== values.name) {
          changes.push({
            field: 'name',
            oldValue: currentData?.name,
            newValue: values.name,
          });
        }

        if (currentData?.description !== values.description) {
          changes.push({
            field: 'description',
            oldValue: currentData?.description,
            newValue: values.description,
          });
        }

        if (currentData?.companyType !== values.companyType) {
          changes.push({
            field: 'companyType',
            oldValue: currentData?.companyType,
            newValue: values.companyType,
          });
        }

        if (currentData?.industry !== values.industry) {
          changes.push({
            field: 'industry',
            oldValue: currentData?.industry,
            newValue: values.industry,
          });
        }

        if (currentData?.size !== values.size) {
          changes.push({
            field: 'size',
            oldValue: currentData?.size,
            newValue: values.size,
          });
        }

        if (currentData?.stage !== values.stage) {
          changes.push({
            field: 'stage',
            oldValue: currentData?.stage,
            newValue: values.stage,
          });
        }

        if (currentData?.foundedYear !== values.foundedYear) {
          changes.push({
            field: 'foundedYear',
            oldValue: currentData?.foundedYear,
            newValue: values.foundedYear,
          });
        }

        if (currentData?.website !== values.website) {
          changes.push({
            field: 'website',
            oldValue: currentData?.website,
            newValue: values.website,
          });
        }

        if (currentData?.contactEmail !== values.contactEmail) {
          changes.push({
            field: 'contactEmail',
            oldValue: currentData?.contactEmail,
            newValue: values.contactEmail,
          });
        }

        const currentPhoneWithDialCode = currentData?.contactPhone || '';
        const newPhoneWithDialCode = values.contactPhone
          ? `${dialCode}-${values.contactPhone}`
          : '';

        if (currentPhoneWithDialCode !== newPhoneWithDialCode) {
          changes.push({
            field: 'contactPhone',
            oldValue: currentPhoneWithDialCode,
            newValue: newPhoneWithDialCode,
          });
        }

        if (currentData?.contactName !== values.contactName) {
          changes.push({
            field: 'contactName',
            oldValue: currentData?.contactName,
            newValue: values.contactName,
          });
        }
      }

      // Update local state with new data
      setProfileData(updatedProfileData);
      resetFormWithData(updatedProfileData); // This resets isDirty to false
      toast.success('Profile updated successfully');

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error('Failed to update profile');
      logger.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !profileData && !initialData) {
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
            title="Company Information"
            description="Basic details about your company"
            icon={Building2}
            className="dark:bg-accent"
          >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-blue-600" />
                      Company Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={!isEditing}
                        placeholder="Enter company name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <Globe className="text-muted-foreground h-3.5 w-3.5" />
                      Website
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={!isEditing}
                        placeholder="https://company.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="mt-6">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={!isEditing}
                      placeholder="Enter company description"
                      className="min-h-[120px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Describe your company, mission, and what sets you apart
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </ProfileFormSection>

          <ProfileFormSection
            title="Company Classification"
            description="Industry and company details"
            icon={Briefcase}
            className="dark:bg-accent"
          >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="companyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Type</FormLabel>
                    <Select
                      disabled={!isEditing}
                      onValueChange={field.onChange}
                      value={field.value} // Use value instead of defaultValue
                    >
                      <FormControl>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Select company type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(CompanyTypeEnum).map((type) => (
                          <SelectItem key={type} value={type}>
                            {enumToReadableText(type)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry</FormLabel>
                    <Select
                      disabled={!isEditing}
                      onValueChange={field.onChange}
                      value={field.value} // Use value instead of defaultValue
                    >
                      <FormControl>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(CompanyIndustryEnum).map((industry) => (
                          <SelectItem key={industry} value={industry}>
                            {enumToReadableText(industry)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Size</FormLabel>
                    <Select
                      disabled={!isEditing}
                      onValueChange={field.onChange}
                      value={field.value} // Use value instead of defaultValue
                    >
                      <FormControl>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Select company size" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(CompanySizeEnum).map((size) => (
                          <SelectItem key={size} value={size}>
                            {enumToReadableText(size)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Stage</FormLabel>
                    <Select
                      disabled={!isEditing}
                      onValueChange={field.onChange}
                      value={field.value} // Use value instead of defaultValue
                    >
                      <FormControl>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Select company stage" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(CompanyStageEnum).map((stage) => (
                          <SelectItem key={stage} value={stage}>
                            {enumToReadableText(stage)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="foundedYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <Calendar className="text-muted-foreground h-3.5 w-3.5" />
                      Founded Year
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={!isEditing}
                        type="number"
                        min={1900}
                        max={new Date().getFullYear()}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </ProfileFormSection>

          <ProfileFormSection
            title="Contact Information"
            description="How candidates can reach you"
            icon={Phone}
            className="dark:bg-accent"
          >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <FormField
                control={form.control}
                name="contactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <User className="text-muted-foreground h-3.5 w-3.5" />
                      Contact Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={!isEditing}
                        placeholder="John Doe"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <Mail className="text-muted-foreground h-3.5 w-3.5" />
                      Contact Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={!isEditing}
                        placeholder="contact@company.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <Phone className="text-muted-foreground h-3.5 w-3.5" />
                      Contact Phone
                    </FormLabel>
                    <FormControl>
                      <ContactPhoneInput
                        value={field.value}
                        onChange={field.onChange}
                        onValidationError={setPhoneValidationError}
                        onDialCodeChange={(dialCode, country) => {
                          setDialCode(dialCode);
                          setSelectedCountry(country);
                          form.setValue('country', country);
                        }}
                        disabled={!isEditing}
                        placeholder="Phone number"
                        showLabel={false}
                      />
                    </FormControl>
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
              disabled={isLoading || !isDirty || phoneValidationError !== null}
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

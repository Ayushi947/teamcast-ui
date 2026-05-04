'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect, useState, useMemo } from 'react';
import { logger } from '@/lib/logger';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePickerCalendar } from '@/components/ui/date-picker-calendar';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { cn, enumToReadableText, formatEnumValue } from '@/lib/utils';
import {
  Briefcase,
  Wallet,
  MapPin,
  Calendar as CalendarIcon,
  Save,
  User,
  Building2,
  Clock,
  BriefcaseIcon,
  GraduationCap,
  Building,
  Globe,
  Timer,
  CalendarDays,
  Settings,
  Coins,
  Tags,
  Users,
  X,
} from 'lucide-react';
import {
  IResume,
  ICombinedLocation,
  ILookupCategoryMinimal,
  WorkTypeEnum,
  WorkScheduleEnum,
  WorkCommitmentEnum,
  NoticePeriodEnum,
  ILocationNamesApiRequest,
  ILocationListResponse,
} from '@/lib/shared';
import { useQuery } from '@tanstack/react-query';
import { supportLookupService, locationService } from '@/lib/services/services';
import { Badge } from '@/components/ui/badge';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { apiClient } from '@/lib/api-client';

const noConsecutiveSpecialChars = (val?: string) =>
  !val || !/[^a-zA-Z0-9\s]{2,}/.test(val);

const noMoreThan5ConsecutiveNumbers = (val?: string) =>
  !val || !/\d{6,}/.test(val);

const onlyLettersAndSpacesRegex = /^[A-Za-z0-9,\s.-]+$/;

/* ---- professionalDetailsSchema ---- */
export const professionalDetailsSchema = z
  .object({
    summary: z
      .string()
      .min(1, 'Professional summary is required')
      .min(20, 'Summary should be at least 20 characters')
      .max(1000, 'Summary cannot exceed 1000 characters')
      .refine(
        (val) => noConsecutiveSpecialChars(val),
        'Summary should not contain consecutive special characters'
      )
      .refine(
        (val) => noMoreThan5ConsecutiveNumbers(val),
        'Summary should not contain more than 5 consecutive numbers'
      ),

    currentJobTitle: z
      .string()
      .max(100, 'Job title cannot exceed 100 characters')
      .regex(
        onlyLettersAndSpacesRegex,
        'Job title should only contain letters and spaces'
      )
      .optional(),

    currentCompany: z
      .string()
      .max(100, 'Company cannot exceed 100 characters')
      .regex(
        /^[A-Za-z0-9\s.,]+$/,
        'Company can only contain letters, numbers, spaces, commas, and periods'
      )
      .refine(
        (val) => !val || !/\d{3,}/.test(val),
        'Company should not contain more than 2 consecutive numbers'
      )
      .optional(),

    currentIndustry: z.string().optional(),

    currentWorkLocation: z.string().optional(),

    currentWorkType: z.nativeEnum(WorkTypeEnum).optional(),
    currentWorkCommitment: z.nativeEnum(WorkCommitmentEnum).optional(),
    currentWorkSchedule: z.nativeEnum(WorkScheduleEnum).optional(),

    currentSalary: z
      .number()
      .optional()
      .refine((val) => !val || val > 0, {
        message: 'Salary must be a positive number',
      }),

    currentSalaryCurrency: z.string().optional(),

    availableFrom: z.date().optional(),

    noticePeriod: z.nativeEnum(NoticePeriodEnum).optional(),

    resumeSkills: z
      .array(z.string())
      .optional()
      .transform((val) => (val?.length === 0 ? undefined : val)),

    industries: z
      .string()
      .min(1, 'At least one industry is required')
      .max(100, 'Industry cannot exceed 100 characters')
      .regex(
        onlyLettersAndSpacesRegex,
        'Industry should only contain letters and spaces'
      ),
  })
  .refine(
    (data) => {
      // If availableFrom is given, it cannot be in the past
      if (!data.availableFrom) return true;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return data.availableFrom >= today;
    },
    {
      message: 'Available from date cannot be in the past',
      path: ['availableFrom'],
    }
  );

type ProfessionalDetailsFormData = z.infer<typeof professionalDetailsSchema>;

const workTypes = Object.values(WorkTypeEnum);
const workSchedules = Object.values(WorkScheduleEnum);
const workCommitments = Object.values(WorkCommitmentEnum);
const noticePeriods = Object.values(NoticePeriodEnum);
// const industries = Object.values(CompanyIndustryEnum);
const currencies = [
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
  { code: 'CAD', symbol: 'C$' },
  { code: 'AUD', symbol: 'A$' },
  { code: 'INR', symbol: '₹' },
];

interface ProfessionalDetailsFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<IResume>) => Promise<void>;
  resume?: IResume;
}

// Override the locationService getLocationNames method to use Google Places API
locationService.getLocationNames = async (
  params?: ILocationNamesApiRequest
): Promise<ILocationListResponse<ICombinedLocation>> => {
  try {
    const response = await apiClient.get('/api/google-places/autocomplete', {
      params: {
        input: params?.search || '',
        types: 'geocode',
        language: 'en',
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = response.data;

    if (data.error) {
      throw new Error(data.error);
    }

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Google Places API error: ${data.status}`);
    }

    // Transform the response to match our expected format
    const items: ICombinedLocation[] = (data.predictions || []).map(
      (prediction: any) => ({
        id: prediction.place_id,
        name: prediction.description,
      })
    );

    return {
      items: items.slice(0, 20),
      total: items.length,
      limit: 20,
      offset: 0,
    };
  } catch (error) {
    logger.error('Error fetching locations', error);
    throw new Error('Failed to fetch location suggestions');
  }
};

export function ProfessionalDetailsForm({
  isOpen,
  onClose,
  onSubmit,
  resume,
}: ProfessionalDetailsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [skillsSearch, setSkillsSearch] = useState('');
  const [industrySearch, setIndustrySearch] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);

  const debouncedLocationSearch = useDebounce(locationSearch, 500);

  // Fetch skills, companies, and industries lookup categories
  const {
    data: lookupCategories,
    isLoading: isLookupCategoriesLoading,
    error: _lookupCategoriesError,
  } = useQuery<ILookupCategoryMinimal[]>({
    queryKey: ['lookup-categories-professional-details'],
    queryFn: async () => {
      const response = await supportLookupService.getLookupValuesByCategories([
        'skills',
        'industry',
      ]);
      return response as ILookupCategoryMinimal[];
    },
  });

  // Find the industry category from the fetched list
  const industryCategory = useMemo(() => {
    return lookupCategories?.find(
      (category: ILookupCategoryMinimal) => category.name === 'industry'
    );
  }, [lookupCategories]);

  // Find the skills category from the fetched list
  const skillsCategory = useMemo(() => {
    return lookupCategories?.find(
      (category: ILookupCategoryMinimal) => category.name === 'skills'
    );
  }, [lookupCategories]);

  // Location query
  const { data: locations } = useQuery({
    queryKey: ['locations', debouncedLocationSearch],
    queryFn: async () => {
      if (!debouncedLocationSearch || debouncedLocationSearch.length < 2) {
        return [];
      }
      setIsSearching(true);
      try {
        const response = await locationService.getLocationNames({
          search: debouncedLocationSearch,
        });
        return response.items || [];
      } finally {
        setIsSearching(false);
      }
    },
    enabled: debouncedLocationSearch.length >= 2,
    staleTime: 10 * 60 * 1000, // Cache results for 10 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    refetchOnWindowFocus: false,
    retry: 1,
    refetchOnMount: false,
    refetchOnReconnect: false,
    networkMode: 'offlineFirst',
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ProfessionalDetailsFormData>({
    resolver: zodResolver(professionalDetailsSchema),
    defaultValues: {
      summary: '',
      currentJobTitle: '',
      currentCompany: '',
      currentIndustry: '',
      currentWorkLocation: '',
      currentWorkType: WorkTypeEnum.CONTRACTOR,
      currentWorkCommitment: WorkCommitmentEnum.PART_TIME,
      currentWorkSchedule: WorkScheduleEnum.REGULAR,
      currentSalary: 0,
      currentSalaryCurrency: undefined,
      availableFrom: new Date(),
      noticePeriod: NoticePeriodEnum.THREE_MONTHS,
      resumeSkills: [],
      industries: '',
    },
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  useEffect(() => {
    const initializeForm = async () => {
      if (resume) {
        setValue('summary', resume.summary);
        setValue('currentJobTitle', resume.currentJobTitle);
        setValue('currentCompany', resume.currentCompany);
        setValue('currentIndustry', resume.currentIndustry);
        setValue('currentWorkLocation', resume.currentWorkLocation);
        setSelectedLocation(resume.currentWorkLocation || '');
        setLocationSearch(resume.currentWorkLocation || '');
        setValue('currentWorkType', resume.currentWorkType);
        setValue('currentWorkCommitment', resume.currentWorkCommitment);
        setValue('currentWorkSchedule', resume.currentWorkSchedule);
        setValue('currentSalary', resume.currentSalary);
        setValue('currentSalaryCurrency', resume.currentSalaryCurrency);
        setValue(
          'availableFrom',
          resume.availableFrom ? new Date(resume.availableFrom) : undefined
        );
        setValue('noticePeriod', resume.noticePeriod);
        setSelectedSkills(resume.resumeSkills || []);
        setValue('resumeSkills', resume.resumeSkills || []);
        setValue('industries', resume.industries.join(', '));
      }
    };
    // Wait for a short delay before initializing the form
    setTimeout(() => {
      initializeForm();
    }, 100);
  }, [resume, setValue]);

  // Keep locationSearch in sync with form value when dialog opens or value changes
  useEffect(() => {
    const formLocation = watch('currentWorkLocation');
    if (formLocation && formLocation !== locationSearch) {
      setLocationSearch(formLocation);
    }
    if (!formLocation && locationSearch) {
      setLocationSearch('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, watch('currentWorkLocation')]);

  const handleFormSubmit = async (data: ProfessionalDetailsFormData) => {
    try {
      setIsSubmitting(true);
      const formattedData = {
        ...data,
        resumeSkills: selectedSkills,
        industries: data.industries.split(',').map((item) => item.trim()),
        currentIndustry:
          data.currentIndustry && data.currentIndustry.length >= 2
            ? data.currentIndustry
            : undefined,
        currentWorkLocation:
          data.currentWorkLocation && data.currentWorkLocation.length >= 2
            ? data.currentWorkLocation
            : undefined,
      };

      await onSubmit(formattedData);
      reset();
      onClose();
    } catch (error) {
      logger.error('Error submitting professional details:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // After all useState/useQuery declarations, but before any JSX or handler that uses them:
  const filteredSkills =
    skillsCategory?.lookupValues?.filter(
      (skill: { label: string }) =>
        skill.label.toLowerCase().includes(skillsSearch.toLowerCase()) &&
        !selectedSkills.includes(skill.label)
    ) ?? [];

  const filteredIndustries =
    industryCategory?.lookupValues?.filter((industry: { label: string }) =>
      industry.label.toLowerCase().includes(industrySearch.toLowerCase())
    ) ?? [];

  const filteredLocations =
    locations?.filter((location: ICombinedLocation) =>
      location.name.toLowerCase().includes(locationSearch.toLowerCase())
    ) ?? [];

  // Work Location single-select dropdown (same pattern as profile-form.tsx)
  const workLocationField = (
    <div>
      <Label
        htmlFor="currentWorkLocation"
        className="text-foreground mb-1 flex items-center gap-2 text-sm font-medium"
      >
        <MapPin className="text-muted-foreground h-4 w-4" />
        Work Location
      </Label>
      <Select
        value={selectedLocation}
        onValueChange={(val) => {
          setSelectedLocation(val);
          setValue('currentWorkLocation', val, { shouldValidate: true });
          setLocationSearch('');
        }}
      >
        <SelectTrigger
          className={errors.currentWorkLocation ? 'border-destructive' : ''}
        >
          <SelectValue
            placeholder={selectedLocation || 'Select or search location'}
          />
        </SelectTrigger>
        <SelectContent>
          <div className="p-2">
            <Input
              placeholder="Search locations..."
              value={locationSearch}
              onChange={(e) => setLocationSearch(e.target.value)}
              className="mb-2"
            />
          </div>
          {isSearching ? (
            <div className="flex items-center justify-center py-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="border-t-primary h-4 w-4 animate-spin rounded-full border-2 border-gray-300"></div>
                <span>Searching locations...</span>
              </div>
            </div>
          ) : filteredLocations.length > 0 ? (
            filteredLocations.map((location: ICombinedLocation) => (
              <SelectItem key={location.id} value={location.name}>
                {location.name}
              </SelectItem>
            ))
          ) : (
            <div className="text-muted-foreground px-2 py-1 text-sm">
              No locations found.
            </div>
          )}
        </SelectContent>
      </Select>
      {/* Always show the selected location below the field if present */}
      {selectedLocation && (
        <div className="mt-2 flex flex-wrap gap-2">
          <Badge
            key={`${selectedLocation}`}
            variant="secondary"
            className="flex items-center gap-1"
          >
            {selectedLocation}
            <button
              type="button"
              onClick={() => {
                setSelectedLocation('');
                setValue('currentWorkLocation', '', {
                  shouldValidate: true,
                });
              }}
              className="ring-offset-background focus:ring-ring ml-1 rounded-full outline-none focus:ring-2 focus:ring-offset-2"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        </div>
      )}
      {errors.currentWorkLocation && (
        <p className="text-destructive mt-0.5 text-xs">
          {errors.currentWorkLocation.message}
        </p>
      )}
    </div>
  );

  // Industry single-select dropdown (same pattern as profile-form.tsx)
  const industryField = (
    <div>
      <Label
        htmlFor="currentIndustry"
        className="text-foreground mb-1 block flex items-center gap-2 text-sm font-medium"
      >
        <Globe className="text-muted-foreground h-4 w-4" />
        Industry
      </Label>
      <Select
        value={watch('currentIndustry')}
        onValueChange={(val) => {
          setValue('currentIndustry', val, { shouldValidate: true });
          setIndustrySearch('');
        }}
      >
        <SelectTrigger
          className={errors.currentIndustry ? 'border-destructive' : ''}
        >
          <SelectValue
            placeholder={
              watch('currentIndustry') || 'Select or search industry'
            }
          />
        </SelectTrigger>
        <SelectContent>
          <div className="p-2">
            <Input
              placeholder={
                isLookupCategoriesLoading ? 'Loading...' : 'Search industry...'
              }
              value={industrySearch}
              onChange={(e) => setIndustrySearch(e.target.value)}
              className="mb-2"
            />
          </div>
          {filteredIndustries.length > 0 ? (
            filteredIndustries.map(
              (industry: { id: string; label: string }) => (
                <SelectItem key={industry.id} value={industry.label}>
                  {enumToReadableText(industry.label)}
                </SelectItem>
              )
            )
          ) : (
            <div className="text-muted-foreground px-2 py-1 text-sm">
              No industry found.
            </div>
          )}
        </SelectContent>
      </Select>
      {errors.currentIndustry && (
        <p className="text-destructive mt-0.5 text-xs">
          {errors.currentIndustry.message}
        </p>
      )}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 sm:max-w-[900px]">
        <div className="flex h-[80vh] flex-col">
          {/* Header */}
          <div className="border-b px-6 py-4">
            <DialogTitle className="text-foreground flex items-center gap-2 text-xl font-semibold">
              <Settings className="text-muted-foreground h-5 w-5" />
              {resume
                ? 'Edit Professional Details'
                : 'Add Professional Details'}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground mt-1 text-sm">
              {resume
                ? 'Update your professional information'
                : 'Add your professional information'}
            </DialogDescription>
            {Object.keys(errors).length > 0 && (
              <div className="bg-destructive/10 dark:bg-destructive/20 mt-4 rounded-md p-3">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-destructive dark:text-destructive text-sm font-medium">
                      There {Object.keys(errors).length === 1 ? 'is' : 'are'}{' '}
                      {Object.keys(errors).length}{' '}
                      {Object.keys(errors).length === 1 ? 'error' : 'errors'} in
                      your form
                    </h3>
                    <div className="text-destructive dark:text-destructive/90 mt-2 text-sm">
                      <ul className="list-disc space-y-1 pl-5">
                        {Object.entries(errors).map(([field, error]) => (
                          <li key={field}>{error.message}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <form
              onSubmit={handleSubmit(handleFormSubmit)}
              className="space-y-8"
            >
              {/* Personal Summary Section */}
              <div className="space-y-4">
                <h3 className="text-foreground flex items-center gap-2 text-lg font-semibold">
                  <User className="text-muted-foreground h-5 w-5" />
                  Personal Summary
                </h3>
                <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <Label
                      htmlFor="summary"
                      className="text-foreground mb-1 block flex items-center gap-2 text-sm font-medium"
                    >
                      <GraduationCap className="text-muted-foreground h-4 w-4" />
                      Professional Summary
                    </Label>
                    <Textarea
                      id="summary"
                      {...register('summary')}
                      placeholder="Describe your professional background and career goals..."
                      rows={4}
                      className={cn(
                        'resize-none',
                        errors.summary ? 'border-destructive' : ''
                      )}
                    />
                    {errors.summary && (
                      <p className="text-destructive mt-0.5 text-xs">
                        {errors.summary.message}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <Label
                      htmlFor="resumeSkills"
                      className="text-foreground mb-1 block flex items-center gap-2 text-sm font-medium"
                    >
                      <Tags className="text-muted-foreground h-4 w-4" />
                      Skills
                    </Label>
                    <div className="space-y-2">
                      <Select
                        value=""
                        onValueChange={(val) => {
                          if (!selectedSkills.includes(val)) {
                            const newSkills = [...selectedSkills, val];
                            setSelectedSkills(newSkills);
                            setValue('resumeSkills', newSkills, {
                              shouldValidate: true,
                            });
                          }
                          setSkillsSearch('');
                        }}
                      >
                        <SelectTrigger
                          className={
                            errors.resumeSkills ? 'border-destructive' : ''
                          }
                        >
                          <SelectValue placeholder="Select or search skills" />
                        </SelectTrigger>
                        <SelectContent>
                          <div className="p-2">
                            <Input
                              placeholder={
                                isLookupCategoriesLoading
                                  ? 'Loading...'
                                  : 'Search skills...'
                              }
                              value={skillsSearch}
                              onChange={(e) => setSkillsSearch(e.target.value)}
                              className="mb-2"
                            />
                          </div>
                          {filteredSkills.length > 0 ? (
                            filteredSkills.map(
                              (skill: { id: string; label: string }) => (
                                <SelectItem key={skill.id} value={skill.label}>
                                  {formatEnumValue(skill.label)}
                                </SelectItem>
                              )
                            )
                          ) : (
                            <div className="text-muted-foreground px-2 py-1 text-sm">
                              No skills found.
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedSkills.map((skill, idx) => (
                          <Badge
                            key={`${skill}-${idx}`}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {formatEnumValue(skill)}
                            <button
                              type="button"
                              onClick={() => {
                                const newSkills = selectedSkills.filter(
                                  (s) => s !== skill
                                );
                                setSelectedSkills(newSkills);
                                setValue('resumeSkills', newSkills, {
                                  shouldValidate: true,
                                });
                              }}
                              className="ring-offset-background focus:ring-ring ml-1 rounded-full outline-none focus:ring-2 focus:ring-offset-2"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {errors.resumeSkills && (
                      <p className="text-destructive mt-0.5 text-xs">
                        {errors.resumeSkills.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Current Employment Section */}
              <div className="space-y-4">
                <h3 className="text-foreground flex items-center gap-2 text-lg font-semibold">
                  <Building2 className="text-muted-foreground h-5 w-5" />
                  Current Employment
                </h3>
                <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
                  <div>
                    <Label
                      htmlFor="currentJobTitle"
                      className="text-foreground mb-1 block flex items-center gap-2 text-sm font-medium"
                    >
                      <BriefcaseIcon className="text-muted-foreground h-4 w-4" />
                      Job Title
                    </Label>
                    <Input
                      id="currentJobTitle"
                      {...register('currentJobTitle')}
                      placeholder="e.g. Senior Frontend Developer"
                      className={cn(
                        errors.currentJobTitle ? 'border-destructive' : ''
                      )}
                    />
                    {errors.currentJobTitle && (
                      <p className="text-destructive mt-0.5 text-xs">
                        {errors.currentJobTitle.message}
                      </p>
                    )}
                  </div>

                  {/* Company Input */}
                  <div>
                    <Label
                      htmlFor="currentCompany"
                      className="text-foreground mb-1 block flex items-center gap-2 text-sm font-medium"
                    >
                      <Building className="text-muted-foreground h-4 w-4" />
                      Company
                    </Label>
                    <Input
                      id="currentCompany"
                      {...register('currentCompany')}
                      placeholder="e.g. Acme Corporation"
                      className={cn(
                        errors.currentCompany ? 'border-destructive' : ''
                      )}
                    />
                    {errors.currentCompany && (
                      <p className="text-destructive mt-0.5 text-xs">
                        {errors.currentCompany.message}
                      </p>
                    )}
                  </div>

                  {workLocationField}

                  {industryField}
                </div>
              </div>

              {/* Work Arrangement Section */}
              <div className="space-y-4">
                <h3 className="text-foreground flex items-center gap-2 text-lg font-semibold">
                  <CalendarIcon className="text-muted-foreground h-5 w-5" />
                  Work Arrangement
                </h3>
                <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
                  <div>
                    <Label
                      htmlFor="currentWorkType"
                      className="text-foreground mb-1 block flex items-center gap-2 text-sm font-medium"
                    >
                      <Briefcase className="text-muted-foreground h-4 w-4" />
                      Work Type
                    </Label>
                    <Select
                      value={watch('currentWorkType')}
                      onValueChange={(value) =>
                        setValue('currentWorkType', value as WorkTypeEnum)
                      }
                    >
                      <SelectTrigger
                        className={
                          errors.currentWorkType ? 'border-destructive' : ''
                        }
                      >
                        <SelectValue placeholder="Select work type" />
                      </SelectTrigger>
                      <SelectContent>
                        {workTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {enumToReadableText(type)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.currentWorkType && (
                      <p className="text-destructive mt-0.5 text-xs">
                        {errors.currentWorkType.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label
                      htmlFor="currentWorkCommitment"
                      className="text-foreground mb-1 block flex items-center gap-2 text-sm font-medium"
                    >
                      <Users className="text-muted-foreground h-4 w-4" />
                      Work Commitment
                    </Label>
                    <Select
                      value={watch('currentWorkCommitment')}
                      onValueChange={(value) =>
                        setValue(
                          'currentWorkCommitment',
                          value as WorkCommitmentEnum
                        )
                      }
                    >
                      <SelectTrigger
                        className={
                          errors.currentWorkCommitment
                            ? 'border-destructive'
                            : ''
                        }
                      >
                        <SelectValue placeholder="Select work commitment" />
                      </SelectTrigger>
                      <SelectContent>
                        {workCommitments.map((commitment) => (
                          <SelectItem key={commitment} value={commitment}>
                            {enumToReadableText(commitment)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.currentWorkCommitment && (
                      <p className="text-destructive mt-0.5 text-xs">
                        {errors.currentWorkCommitment.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label
                      htmlFor="currentWorkSchedule"
                      className="text-foreground mb-1 block flex items-center gap-2 text-sm font-medium"
                    >
                      <Clock className="text-muted-foreground h-4 w-4" />
                      Work Schedule
                    </Label>
                    <Select
                      value={watch('currentWorkSchedule')}
                      onValueChange={(value) =>
                        setValue(
                          'currentWorkSchedule',
                          value as WorkScheduleEnum
                        )
                      }
                    >
                      <SelectTrigger
                        className={
                          errors.currentWorkSchedule ? 'border-destructive' : ''
                        }
                      >
                        <SelectValue placeholder="Select work schedule" />
                      </SelectTrigger>
                      <SelectContent>
                        {workSchedules.map((schedule) => (
                          <SelectItem key={schedule} value={schedule}>
                            {enumToReadableText(schedule)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.currentWorkSchedule && (
                      <p className="text-destructive mt-0.5 text-xs">
                        {errors.currentWorkSchedule.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label
                      htmlFor="industries"
                      className="text-foreground mb-1 block flex items-center gap-2 text-sm font-medium"
                    >
                      <Building2 className="text-muted-foreground h-4 w-4" />
                      Industry Experience
                    </Label>
                    <Textarea
                      id="industries"
                      {...register('industries')}
                      placeholder="Enter industries separated by commas (e.g., Fintech, SaaS, E-commerce)"
                      rows={2}
                      className={cn(
                        'resize-none',
                        errors.industries ? 'border-destructive' : ''
                      )}
                    />
                    {errors.industries && (
                      <p className="text-destructive mt-0.5 text-xs">
                        {errors.industries.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Compensation & Availability Section */}
              <div className="space-y-4">
                <h3 className="text-foreground flex items-center gap-2 text-lg font-semibold">
                  <Coins className="text-muted-foreground h-5 w-5" />
                  Compensation & Availability
                </h3>
                <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
                  <div>
                    <Label
                      htmlFor="currentSalary"
                      className="text-foreground mb-1 block flex items-center gap-2 text-sm font-medium"
                    >
                      <Wallet className="text-muted-foreground h-4 w-4" />
                      Current Salary (Annual)
                    </Label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        {watch('currentSalaryCurrency')
                          ? currencies.find(
                              (c) => c.code === watch('currentSalaryCurrency')
                            )?.symbol || '$'
                          : '$'}
                      </div>
                      <Input
                        id="currentSalary"
                        type="number"
                        {...register('currentSalary', { valueAsNumber: true })}
                        className={cn(
                          'pl-8',
                          errors.currentSalary ? 'border-destructive' : ''
                        )}
                        placeholder="e.g. 80000"
                      />
                    </div>
                    {errors.currentSalary && (
                      <p className="text-destructive mt-0.5 text-xs">
                        {errors.currentSalary.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label
                      htmlFor="currentSalaryCurrency"
                      className="text-foreground mb-1 block flex items-center gap-2 text-sm font-medium"
                    >
                      <Coins className="text-muted-foreground h-4 w-4" />
                      Currency
                    </Label>
                    <Select
                      value={watch('currentSalaryCurrency')}
                      onValueChange={(value) =>
                        setValue('currentSalaryCurrency', value)
                      }
                    >
                      <SelectTrigger
                        className={
                          errors.currentSalaryCurrency
                            ? 'border-destructive'
                            : ''
                        }
                      >
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            {currency.code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.currentSalaryCurrency && (
                      <p className="text-destructive mt-0.5 text-xs">
                        {errors.currentSalaryCurrency.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label
                      htmlFor="noticePeriod"
                      className="text-foreground mb-1 block flex items-center gap-2 text-sm font-medium"
                    >
                      <Timer className="text-muted-foreground h-4 w-4" />
                      Notice Period
                    </Label>
                    <Select
                      value={watch('noticePeriod')}
                      onValueChange={(value) =>
                        setValue('noticePeriod', value as NoticePeriodEnum)
                      }
                    >
                      <SelectTrigger
                        className={
                          errors.noticePeriod ? 'border-destructive' : ''
                        }
                      >
                        <SelectValue placeholder="Select notice period" />
                      </SelectTrigger>
                      <SelectContent>
                        {noticePeriods.map((period) => (
                          <SelectItem key={period} value={period}>
                            {enumToReadableText(period)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.noticePeriod && (
                      <p className="text-destructive mt-0.5 text-xs">
                        {errors.noticePeriod.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label
                      htmlFor="availableFrom"
                      className="text-foreground mb-1 block flex items-center gap-2 text-sm font-medium"
                    >
                      <CalendarDays className="text-muted-foreground h-4 w-4" />
                      Available From
                    </Label>
                    <DatePickerCalendar
                      value={watch('availableFrom') as Date}
                      onChange={(date) => setValue('availableFrom', date)}
                      placeholder="Select available date"
                      minDate={new Date()}
                      maxDate={new Date(new Date().getFullYear() + 2, 11, 31)}
                      className={cn(
                        errors.availableFrom ? 'border-destructive' : ''
                      )}
                    />
                    {errors.availableFrom && (
                      <p className="text-destructive mt-0.5 text-xs">
                        {errors.availableFrom.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="bg-muted/50 border-t px-6 py-4">
            <DialogFooter className="gap-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                onClick={handleSubmit(handleFormSubmit)}
                disabled={isSubmitting}
              >
                <div className="relative flex items-center gap-2">
                  <div
                    className={cn(
                      'absolute inset-0 flex items-center justify-center transition-opacity duration-200',
                      isSubmitting ? 'opacity-100' : 'opacity-0'
                    )}
                  >
                    <div className="border-background h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                  </div>
                  <div
                    className={cn(
                      'flex items-center gap-2 transition-opacity duration-200',
                      isSubmitting ? 'opacity-0' : 'opacity-100'
                    )}
                  >
                    <Save className="h-4 w-4" />
                    {resume ? 'Update Details' : 'Add Details'}
                  </div>
                </div>
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

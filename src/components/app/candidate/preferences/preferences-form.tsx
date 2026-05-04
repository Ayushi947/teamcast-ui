'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect, useState, useMemo, useRef } from 'react';
import { logger } from '@/lib/logger';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Settings,
  Wallet,
  Save,
  Briefcase,
  Building2,
  Clock,
  MapPin,
  Coins,
  Gift,
  ListChecks,
  Tags,
  Calendar,
  Users,
  Workflow,
  X,
} from 'lucide-react';
import {
  ICandidatePreferences,
  WorkTypeEnum,
  WorkCommitmentEnum,
  WorkScheduleEnum,
  CompanyIndustryEnum,
  ILookupCategory,
  ICombinedLocation,
  ILookupCategoryMinimal,
  ILocationNamesApiRequest,
  ILocationListResponse,
} from '@/lib/shared';
import { cn, enumToReadableText, formatEnumValue } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supportLookupService, locationService } from '@/lib/services/services';
import { useDebounce } from '@/lib/hooks/use-debounce';

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import axios from 'axios';

const preferencesSchema = z
  .object({
    preferredIndustries: z.string().min(1, 'At least one industry is required'),
    preferredLocations: z.string().min(1, 'At least one location is required'),
    preferredWorkTypes: z.string().min(1, 'At least one work type is required'),
    preferredJobTitles: z.string().min(1, 'At least one job title is required'),
    preferredJobCommitments: z
      .string()
      .min(1, 'At least one job commitment is required'),
    preferredJobSchedules: z
      .string()
      .min(1, 'At least one job schedule is required'),
    preferredSalaryMin: z.coerce
      .number()
      .min(0, 'Minimum salary must be 0 or greater')
      .optional()
      .or(z.literal(undefined)),
    preferredSalaryMax: z.coerce
      .number()
      .min(0, 'Maximum salary must be 0 or greater')
      .optional()
      .or(z.literal(undefined)),
    preferredSalaryCurrency: z.string().optional(),
    preferredEquity: z.boolean().optional(),
    preferredBenefits: z
      .array(z.string())
      .optional()
      .transform((val) => (val?.length === 0 ? undefined : val)),
    preferredResponsibilities: z
      .array(z.string())
      .optional()
      .transform((val) => (val?.length === 0 ? undefined : val)),
    preferredTags: z
      .string()
      .regex(
        /^[A-Za-z\s\-,]*$/,
        'Tags should only contain letters, spaces, hyphens, or commas'
      )
      .optional()
      .or(z.literal('')), // allow empty string
  })
  .superRefine((data, ctx) => {
    if (
      data.preferredSalaryMin !== undefined &&
      data.preferredSalaryMax !== undefined &&
      data.preferredSalaryMin > data.preferredSalaryMax
    ) {
      ctx.addIssue({
        path: ['preferredSalaryMin'],
        code: z.ZodIssueCode.custom,
        message: 'Minimum salary cannot be greater than Maximum salary',
      });
      ctx.addIssue({
        path: ['preferredSalaryMax'],
        code: z.ZodIssueCode.custom,
        message: 'Maximum salary cannot be less than Minimum salary',
      });
    }
  });

type PreferencesFormData = z.infer<typeof preferencesSchema>;
const workTypes = Object.values(WorkTypeEnum);
const workSchedules = Object.values(WorkScheduleEnum);
const workCommitments = Object.values(WorkCommitmentEnum);
const industries = Object.values(CompanyIndustryEnum);
const currencies = [
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
  { code: 'CAD', symbol: 'C$' },
  { code: 'AUD', symbol: 'A$' },
  { code: 'INR', symbol: '₹' },
];

interface PreferencesFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<ICandidatePreferences>) => Promise<void>;
  preferences?: ICandidatePreferences;
}

// Override the locationService getLocationNames method to use Google Places API
locationService.getLocationNames = async (
  params?: ILocationNamesApiRequest
): Promise<ILocationListResponse<ICombinedLocation>> => {
  try {
    const response = await axios.get('/api/google-places/autocomplete', {
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

export function PreferencesForm({
  isOpen,
  onClose,
  onSubmit,
  preferences,
}: PreferencesFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedResponsibilities, setSelectedResponsibilities] = useState<
    string[]
  >([]);
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>([]);
  const [selectedJobTitles, setSelectedJobTitles] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [locationSearch, setLocationSearch] = useState('');
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [focusedLocationIndex, setFocusedLocationIndex] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);

  const debouncedLocationSearch = useDebounce(locationSearch, 800);

  const { data: lookupCategories, isLoading: isLookupCategoriesLoading } =
    useQuery<ILookupCategory[] | ILookupCategoryMinimal[]>({
      queryKey: ['lookup-categories-preferences'],
      queryFn: () =>
        supportLookupService.getLookupValuesByCategories([
          'preferred_responsibilities',
          'preferred_job_titles',
          'preferred_benefits',
        ]),
    });

  // Find the responsibilities category from the fetched list
  const responsibilitiesCategory = useMemo(() => {
    const categories = lookupCategories as ILookupCategoryMinimal[] | undefined;
    return categories?.find(
      (category) => category.name === 'preferred_responsibilities'
    );
  }, [lookupCategories]);

  // Find the benefits category from the fetched list
  const benefitsCategory = useMemo(() => {
    const categories = lookupCategories as ILookupCategoryMinimal[] | undefined;
    return categories?.find(
      (category) => category.name === 'preferred_benefits'
    );
  }, [lookupCategories]);

  // Find the job titles category from the fetched list
  const jobTitlesCategory = useMemo(() => {
    const categories = lookupCategories as ILookupCategoryMinimal[] | undefined;
    return categories?.find(
      (category) => category.name === 'preferred_job_titles'
    );
  }, [lookupCategories]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<PreferencesFormData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      preferredIndustries: '',
      preferredLocations: '',
      preferredWorkTypes: '',
      preferredJobTitles: '',
      preferredJobCommitments: '',
      preferredJobSchedules: '',
      preferredSalaryMin: undefined,
      preferredSalaryMax: undefined,
      preferredSalaryCurrency: 'USD',
      preferredEquity: false,
      preferredBenefits: [],
      preferredResponsibilities: [],
      preferredTags: '',
    },
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  // Watch required fields to determine if form is ready for submission
  const watchedFields = watch([
    'preferredIndustries',
    'preferredLocations',
    'preferredWorkTypes',
    'preferredJobTitles',
    'preferredJobCommitments',
    'preferredJobSchedules',
  ]);

  // Check if all required fields are filled
  const isFormValid = useMemo(() => {
    if (preferences) {
      return true;
    }
    const [
      industries,
      locations,
      workTypes,
      jobTitles,
      commitments,
      schedules,
    ] = watchedFields;

    return !!(
      industries &&
      industries.trim().length > 0 &&
      locations &&
      locations.trim().length > 0 &&
      workTypes &&
      workTypes.trim().length > 0 &&
      jobTitles &&
      jobTitles.trim().length > 0 &&
      commitments &&
      commitments.trim().length > 0 &&
      schedules &&
      schedules.trim().length > 0 &&
      selectedJobTitles.length > 0 &&
      selectedLocations.length > 0
    );
  }, [preferences, watchedFields, selectedJobTitles, selectedLocations]);

  useEffect(() => {
    const initializeForm = async () => {
      if (preferences) {
        setValue(
          'preferredIndustries',
          preferences.preferredIndustries.join(', ')
        );
        setValue(
          'preferredLocations',
          preferences.preferredLocations.join(', ')
        );
        setSelectedLocations(preferences.preferredLocations || []);
        setValue(
          'preferredWorkTypes',
          preferences.preferredWorkTypes.join(', ')
        );
        setValue(
          'preferredJobTitles',
          preferences.preferredJobTitles!.join(', ')
        );
        setSelectedJobTitles(preferences.preferredJobTitles || []);
        setValue(
          'preferredJobCommitments',
          preferences.preferredJobCommitments!.join(', ')
        );
        setValue(
          'preferredJobSchedules',
          preferences.preferredJobSchedules!.join(', ')
        );
        setValue('preferredSalaryMin', preferences.preferredSalaryMin);
        setValue('preferredSalaryMax', preferences.preferredSalaryMax);
        setValue(
          'preferredSalaryCurrency',
          preferences.preferredSalaryCurrency || 'USD'
        );
        setValue('preferredEquity', preferences.preferredEquity);
        setValue('preferredBenefits', preferences.preferredBenefits || []);
        setSelectedBenefits(preferences.preferredBenefits || []);
        setValue(
          'preferredResponsibilities',
          preferences.preferredResponsibilities || []
        );
        setSelectedResponsibilities(
          preferences.preferredResponsibilities || []
        );
        setValue(
          'preferredTags',
          preferences.preferredTags && preferences.preferredTags.length > 0
            ? preferences.preferredTags.join(', ')
            : ''
        );
      }
    };

    initializeForm();
  }, [preferences, setValue]);

  const handleFormSubmit = async (data: PreferencesFormData) => {
    try {
      setIsSubmitting(true);
      const formattedData = {
        ...data,
        preferredIndustries: data.preferredIndustries
          .split(',')
          .map((item) => item.trim()),
        preferredLocations: data.preferredLocations
          .split(',')
          .map((item) => item.trim()),
        preferredWorkTypes: data.preferredWorkTypes
          .split(',')
          .map((item) => item.trim() as WorkTypeEnum),
        preferredJobTitles: selectedJobTitles,
        preferredJobCommitments: data.preferredJobCommitments
          .split(',')
          .map((item) => item.trim() as WorkCommitmentEnum),
        preferredJobSchedules: data.preferredJobSchedules
          .split(',')
          .map((item) => item.trim() as WorkScheduleEnum),
        preferredBenefits: selectedBenefits,
        preferredResponsibilities: selectedResponsibilities,
        preferredTags:
          data.preferredTags && data.preferredTags.trim()
            ? data.preferredTags
                .split(',')
                .map((item) => item.trim())
                .filter((item) => item.length > 0)
            : [],
        preferredSalaryCurrency: data.preferredSalaryCurrency || 'USD',
      };

      await onSubmit(formattedData);
      reset({
        preferredIndustries: '',
        preferredLocations: '',
        preferredWorkTypes: '',
        preferredJobTitles: '',
        preferredJobCommitments: '',
        preferredJobSchedules: '',
        preferredSalaryMin: undefined,
        preferredSalaryMax: undefined,
        preferredSalaryCurrency: 'USD',
        preferredEquity: false,
        preferredBenefits: [],
        preferredResponsibilities: [],
        preferredTags: '',
      });
      setSelectedJobTitles([]);
      setSelectedLocations([]);
      setSelectedBenefits([]);
      setSelectedResponsibilities([]);
      setLocationSearch('');
      setJobTitlesSearch('');
      setBenefitsSearch('');
      setResponsibilitiesSearch('');
      onClose();
    } catch (error) {
      logger.error('Error submitting preferences:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Location query with optimized settings
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
      } catch (error: unknown) {
        if (
          error &&
          typeof error === 'object' &&
          'name' in error &&
          error.name === 'AbortError'
        ) {
          return []; // Return empty array for cancelled requests
        }
        throw error;
      } finally {
        setIsSearching(false);
      }
    },
    enabled: debouncedLocationSearch.length >= 2,
    staleTime: 5 * 60 * 1000, // Cache results for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: false,
    retry: 1,
    refetchOnMount: false,
    refetchOnReconnect: false,
    networkMode: 'offlineFirst',
    select: (data) => {
      // Optimize the data structure for faster rendering
      return data.map((location) => ({
        id: location.id,
        name: location.name,
        // Only include necessary fields
      }));
    },
  });

  const filteredLocations =
    locations?.filter(
      (location: ICombinedLocation) =>
        location.name.toLowerCase().includes(locationSearch.toLowerCase()) &&
        !selectedLocations.includes(location.name)
    ) ?? [];

  const handleLocationSelect = (value: string) => {
    if (!selectedLocations.includes(value)) {
      const newLocations = [...selectedLocations, value];
      setSelectedLocations(newLocations);
      setValue('preferredLocations', newLocations.join(', '), {
        shouldValidate: true,
      });
    }
    setLocationSearch('');
    setFocusedLocationIndex(-1);
  };

  const handleLocationInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (!filteredLocations.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedLocationIndex((prev) => (prev + 1) % filteredLocations.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedLocationIndex(
        (prev) =>
          (prev - 1 + filteredLocations.length) % filteredLocations.length
      );
    } else if (e.key === 'Enter' || e.key === ' ') {
      if (
        focusedLocationIndex >= 0 &&
        focusedLocationIndex < filteredLocations.length
      ) {
        handleLocationSelect(filteredLocations[focusedLocationIndex].name);
      }
    } else if (e.key === 'Escape') {
      setIsPopoverOpen(false);
      setLocationSearch('');
    }
  };

  // Add state for search inputs for each field
  const [jobTitlesSearch, setJobTitlesSearch] = useState('');
  const [benefitsSearch, setBenefitsSearch] = useState('');
  const [responsibilitiesSearch, setResponsibilitiesSearch] = useState('');
  const [isJobTitlesSelectOpen, setIsJobTitlesSelectOpen] = useState(false);
  const jobTitlesInputRef = useRef<HTMLInputElement>(null);

  const filteredJobTitles =
    jobTitlesCategory?.lookupValues?.filter((item: { label: string }) => {
      const searchTerm = jobTitlesSearch.toLowerCase().trim();
      if (!searchTerm) return !selectedJobTitles.includes(item.label);

      const labelLower = item.label.toLowerCase();
      const readableText = enumToReadableText(item.label).toLowerCase();

      // Search in both the enum label and the readable text
      const matchesLabel = labelLower.includes(searchTerm);
      const matchesReadableText = readableText.includes(searchTerm);

      return (
        (matchesLabel || matchesReadableText) &&
        !selectedJobTitles.includes(item.label)
      );
    }) ?? [];

  const filteredBenefits =
    benefitsCategory?.lookupValues?.filter((item: { label: string }) => {
      const searchTerm = benefitsSearch.toLowerCase().trim();
      if (!searchTerm) return !selectedBenefits.includes(item.label);

      const labelLower = item.label.toLowerCase();
      const readableText = enumToReadableText(item.label).toLowerCase();

      // Search in both the enum label and the readable text
      const matchesLabel = labelLower.includes(searchTerm);
      const matchesReadableText = readableText.includes(searchTerm);

      return (
        (matchesLabel || matchesReadableText) &&
        !selectedBenefits.includes(item.label)
      );
    }) ?? [];

  const filteredResponsibilities =
    responsibilitiesCategory?.lookupValues?.filter(
      (item: { label: string }) => {
        const searchTerm = responsibilitiesSearch.toLowerCase().trim();
        if (!searchTerm) return !selectedResponsibilities.includes(item.label);

        const labelLower = item.label.toLowerCase();
        const readableText = enumToReadableText(item.label).toLowerCase();

        // Search in both the enum label and the readable text
        const matchesLabel = labelLower.includes(searchTerm);
        const matchesReadableText = readableText.includes(searchTerm);

        return (
          (matchesLabel || matchesReadableText) &&
          !selectedResponsibilities.includes(item.label)
        );
      }
    ) ?? [];

  // Auto-focus the job titles search input when Select opens
  useEffect(() => {
    if (isJobTitlesSelectOpen && jobTitlesInputRef.current) {
      // Small delay to ensure the SelectContent is rendered
      setTimeout(() => {
        jobTitlesInputRef.current?.focus();
      }, 100);
    }
  }, [isJobTitlesSelectOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 sm:max-w-[900px]">
        <div className="flex h-[80vh] flex-col">
          {/* Header */}
          <div className="border-b px-6 py-4">
            <DialogTitle className="text-foreground flex items-center gap-2 text-xl font-semibold">
              <Settings className="text-muted-foreground h-5 w-5" />
              {preferences ? 'Edit Preferences' : 'Add Preferences'}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground mt-1 text-sm">
              {preferences
                ? 'Update your job preferences'
                : 'Add your job preferences'}
            </DialogDescription>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <form
              onSubmit={handleSubmit(handleFormSubmit)}
              className="space-y-8"
            >
              {/* Basic Job Preferences Section */}
              <div className="space-y-4">
                <h3 className="text-foreground flex items-center gap-2 text-lg font-semibold">
                  <Briefcase className="text-muted-foreground h-5 w-5" />
                  Basic Job Preferences
                </h3>
                <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
                  <div>
                    <Label
                      htmlFor="preferredJobTitles"
                      className="text-foreground mb-1 block flex items-center gap-2 text-sm font-medium"
                    >
                      <Workflow className="text-muted-foreground h-4 w-4" />
                      Preferred Job Titles
                      <span className="text-red-600">*</span>
                    </Label>
                    <div className="space-y-2">
                      <Select
                        value=""
                        open={isJobTitlesSelectOpen}
                        onOpenChange={setIsJobTitlesSelectOpen}
                        onValueChange={(val) => {
                          if (!selectedJobTitles.includes(val)) {
                            const newItems = [...selectedJobTitles, val];
                            setSelectedJobTitles(newItems);
                            setValue(
                              'preferredJobTitles',
                              newItems.join(', '),
                              { shouldValidate: true }
                            );
                          }
                          setJobTitlesSearch('');
                        }}
                      >
                        <SelectTrigger
                          className={
                            errors.preferredJobTitles
                              ? 'border-destructive'
                              : ''
                          }
                        >
                          <SelectValue placeholder="Select or search job titles" />
                        </SelectTrigger>
                        <SelectContent>
                          <div
                            className="p-2"
                            onClick={(e) => {
                              // Stop propagation to prevent Select from closing when clicking in search area
                              e.stopPropagation();
                            }}
                          >
                            <Input
                              ref={jobTitlesInputRef}
                              placeholder={
                                isLookupCategoriesLoading
                                  ? 'Loading...'
                                  : 'Search job titles...'
                              }
                              value={jobTitlesSearch}
                              onChange={(e) =>
                                setJobTitlesSearch(e.target.value)
                              }
                              onKeyDown={(e) => {
                                // Stop propagation to prevent Select from capturing keyboard events
                                e.stopPropagation();
                              }}
                              onClick={(e) => {
                                // Stop propagation to prevent Select from closing
                                e.stopPropagation();
                              }}
                              className="mb-2"
                            />
                          </div>
                          {filteredJobTitles.length > 0 ? (
                            filteredJobTitles.map(
                              (item: { id: string; label: string }) => (
                                <SelectItem key={item.id} value={item.label}>
                                  {enumToReadableText(item.label)}
                                </SelectItem>
                              )
                            )
                          ) : (
                            <div className="text-muted-foreground px-2 py-1 text-sm">
                              No job titles found.
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedJobTitles.map((item) => (
                          <Badge
                            key={item}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {formatEnumValue(item)}
                            <button
                              type="button"
                              onClick={() => {
                                const newItems = selectedJobTitles.filter(
                                  (i) => i !== item
                                );
                                setSelectedJobTitles(newItems);
                                setValue(
                                  'preferredJobTitles',
                                  newItems.join(', '),
                                  { shouldValidate: true }
                                );
                              }}
                              className="ring-offset-background focus:ring-ring ml-1 rounded-full outline-none focus:ring-2 focus:ring-offset-2"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {errors.preferredJobTitles && (
                      <p className="text-destructive mt-0.5 text-xs">
                        {errors.preferredJobTitles.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label
                      htmlFor="preferredIndustries"
                      className="text-foreground mb-1 block flex items-center gap-2 text-sm font-medium"
                    >
                      <Building2 className="text-muted-foreground h-4 w-4" />
                      Preferred Industries
                      <span className="text-red-600">*</span>
                    </Label>
                    <div className="space-y-2">
                      <Select
                        value=""
                        onValueChange={(value) => {
                          const currentValues =
                            watch('preferredIndustries')
                              ?.split(',')
                              .filter(Boolean) || [];
                          if (!currentValues.includes(value)) {
                            setValue(
                              'preferredIndustries',
                              [...currentValues, value].join(',')
                            );
                          }
                        }}
                      >
                        <SelectTrigger
                          className={
                            errors.preferredIndustries
                              ? 'border-destructive'
                              : ''
                          }
                        >
                          <SelectValue placeholder="Select industries" />
                        </SelectTrigger>
                        <SelectContent>
                          {industries.map((industry) => (
                            <SelectItem key={industry} value={industry}>
                              {industry
                                .replace(/_/g, ' ')
                                .toLowerCase()
                                .replace(/\b\w/g, (l) => l.toUpperCase())}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex flex-wrap gap-2">
                        {watch('preferredIndustries')
                          ?.split(',')
                          .filter(Boolean)
                          .map((industry) => (
                            <Badge
                              key={industry}
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              {industry
                                .replace(/_/g, ' ')
                                .toLowerCase()
                                .replace(/\b\w/g, (l) => l.toUpperCase())}
                              <button
                                type="button"
                                onClick={() => {
                                  const currentValues =
                                    watch('preferredIndustries')
                                      ?.split(',')
                                      .filter(Boolean) || [];
                                  setValue(
                                    'preferredIndustries',
                                    currentValues
                                      .filter((v) => v !== industry)
                                      .join(',')
                                  );
                                }}
                                className="ring-offset-background focus:ring-ring ml-1 rounded-full outline-none focus:ring-2 focus:ring-offset-2"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                      </div>
                    </div>
                    {errors.preferredIndustries && (
                      <p className="text-destructive mt-0.5 text-xs">
                        {errors.preferredIndustries.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Work Arrangement Section */}
              <div className="space-y-4">
                <h3 className="text-foreground flex items-center gap-2 text-lg font-semibold">
                  <Calendar className="text-muted-foreground h-5 w-5" />
                  Work Arrangement
                </h3>
                <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
                  <div>
                    <Label
                      htmlFor="preferredWorkTypes"
                      className="text-foreground mb-1 block flex items-center gap-2 text-sm font-medium"
                    >
                      <Briefcase className="text-muted-foreground h-4 w-4" />
                      Work Types
                      <span className="text-red-600">*</span>
                    </Label>
                    <div className="space-y-2">
                      <Select
                        value=""
                        onValueChange={(value) => {
                          const currentValues =
                            watch('preferredWorkTypes')
                              ?.split(',')
                              .filter(Boolean) || [];
                          if (!currentValues.includes(value)) {
                            setValue(
                              'preferredWorkTypes',
                              [...currentValues, value].join(',')
                            );
                          }
                        }}
                      >
                        <SelectTrigger
                          className={
                            errors.preferredWorkTypes
                              ? 'border-destructive'
                              : ''
                          }
                        >
                          <SelectValue placeholder="Select work types" />
                        </SelectTrigger>
                        <SelectContent>
                          {workTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {enumToReadableText(type)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex flex-wrap gap-2">
                        {watch('preferredWorkTypes')
                          ?.split(',')
                          .filter(Boolean)
                          .map((type) => (
                            <Badge
                              key={type}
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              {formatEnumValue(type)}
                              <button
                                type="button"
                                onClick={() => {
                                  const currentValues =
                                    watch('preferredWorkTypes')
                                      ?.split(',')
                                      .filter(Boolean) || [];
                                  setValue(
                                    'preferredWorkTypes',
                                    currentValues
                                      .filter((v) => v !== type)
                                      .join(',')
                                  );
                                }}
                                className="ring-offset-background focus:ring-ring ml-1 rounded-full outline-none focus:ring-2 focus:ring-offset-2"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                      </div>
                    </div>
                    {errors.preferredWorkTypes && (
                      <p className="text-destructive mt-0.5 text-xs">
                        {errors.preferredWorkTypes.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label
                      htmlFor="preferredJobCommitments"
                      className="text-foreground mb-1 block flex items-center gap-2 text-sm font-medium"
                    >
                      <Users className="text-muted-foreground h-4 w-4" />
                      Job Commitments
                      <span className="text-red-600">*</span>
                    </Label>
                    <div className="space-y-2">
                      <Select
                        value=""
                        onValueChange={(value) => {
                          const currentValues =
                            watch('preferredJobCommitments')
                              ?.split(',')
                              .filter(Boolean) || [];
                          if (!currentValues.includes(value)) {
                            setValue(
                              'preferredJobCommitments',
                              [...currentValues, value].join(',')
                            );
                          }
                        }}
                      >
                        <SelectTrigger
                          className={
                            errors.preferredJobCommitments
                              ? 'border-destructive'
                              : ''
                          }
                        >
                          <SelectValue placeholder="Select job commitments" />
                        </SelectTrigger>
                        <SelectContent>
                          {workCommitments.map((commitment) => (
                            <SelectItem key={commitment} value={commitment}>
                              {formatEnumValue(commitment)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex flex-wrap gap-2">
                        {watch('preferredJobCommitments')
                          ?.split(',')
                          .filter(Boolean)
                          .map((commitment) => (
                            <Badge
                              key={commitment}
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              {formatEnumValue(commitment)}
                              <button
                                type="button"
                                onClick={() => {
                                  const currentValues =
                                    watch('preferredJobCommitments')
                                      ?.split(',')
                                      .filter(Boolean) || [];
                                  setValue(
                                    'preferredJobCommitments',
                                    currentValues
                                      .filter((v) => v !== commitment)
                                      .join(',')
                                  );
                                }}
                                className="ring-offset-background focus:ring-ring ml-1 rounded-full outline-none focus:ring-2 focus:ring-offset-2"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                      </div>
                    </div>
                    {errors.preferredJobCommitments && (
                      <p className="text-destructive mt-0.5 text-xs">
                        {errors.preferredJobCommitments.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label
                      htmlFor="preferredJobSchedules"
                      className="text-foreground mb-1 block flex items-center gap-2 text-sm font-medium"
                    >
                      <Clock className="text-muted-foreground h-4 w-4" />
                      Work Schedules
                      <span className="text-red-600">*</span>
                    </Label>
                    <div className="space-y-2">
                      <Select
                        value=""
                        onValueChange={(value) => {
                          const currentValues =
                            watch('preferredJobSchedules')
                              ?.split(',')
                              .filter(Boolean) || [];
                          if (!currentValues.includes(value)) {
                            setValue(
                              'preferredJobSchedules',
                              [...currentValues, value].join(',')
                            );
                          }
                        }}
                      >
                        <SelectTrigger
                          className={
                            errors.preferredJobSchedules
                              ? 'border-destructive'
                              : ''
                          }
                        >
                          <SelectValue placeholder="Select work schedules" />
                        </SelectTrigger>
                        <SelectContent>
                          {workSchedules.map((schedule) => (
                            <SelectItem key={schedule} value={schedule}>
                              {enumToReadableText(schedule)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex flex-wrap gap-2">
                        {watch('preferredJobSchedules')
                          ?.split(',')
                          .filter(Boolean)
                          .map((schedule) => (
                            <Badge
                              key={schedule}
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              {formatEnumValue(schedule)}
                              <button
                                type="button"
                                onClick={() => {
                                  const currentValues =
                                    watch('preferredJobSchedules')
                                      ?.split(',')
                                      .filter(Boolean) || [];
                                  setValue(
                                    'preferredJobSchedules',
                                    currentValues
                                      .filter((v) => v !== schedule)
                                      .join(',')
                                  );
                                }}
                                className="ring-offset-background focus:ring-ring ml-1 rounded-full outline-none focus:ring-2 focus:ring-offset-2"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                      </div>
                    </div>
                    {errors.preferredJobSchedules && (
                      <p className="text-destructive mt-0.5 text-xs">
                        {errors.preferredJobSchedules.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label
                      htmlFor="preferredLocations"
                      className="text-foreground mb-1 block flex items-center gap-2 text-sm font-medium"
                    >
                      <MapPin className="text-muted-foreground h-4 w-4" />
                      Preferred Locations
                      <span className="text-red-600">*</span>
                    </Label>
                    <Popover
                      open={isPopoverOpen}
                      onOpenChange={setIsPopoverOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !selectedLocations.length &&
                              'text-muted-foreground',
                            errors.preferredLocations
                              ? 'border-destructive'
                              : ''
                          )}
                        >
                          {locationSearch ? locationSearch : 'Select locations'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0">
                        <div className="p-2">
                          <Input
                            placeholder="Search locations..."
                            value={locationSearch}
                            onChange={(e) => {
                              setLocationSearch(e.target.value);
                              setFocusedLocationIndex(-1);
                            }}
                            className="mb-2"
                            onKeyDown={handleLocationInputKeyDown}
                            aria-activedescendant={
                              focusedLocationIndex >= 0 &&
                              filteredLocations[focusedLocationIndex]
                                ? `location-option-${filteredLocations[focusedLocationIndex].id}`
                                : undefined
                            }
                            aria-controls="locations-listbox"
                            role="combobox"
                            aria-expanded="true"
                          />
                          {isSearching ? (
                            <div className="flex items-center justify-center py-4">
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <div className="border-t-primary h-4 w-4 animate-spin rounded-full border-2 border-gray-300"></div>
                                <span>Searching locations...</span>
                              </div>
                            </div>
                          ) : (
                            <div
                              id="locations-listbox"
                              role="listbox"
                              aria-multiselectable="true"
                              className="max-h-48 overflow-y-auto"
                            >
                              {filteredLocations.length > 0 ? (
                                filteredLocations.map(
                                  (
                                    location: ICombinedLocation,
                                    idx: number
                                  ) => (
                                    <div
                                      id={`location-option-${location.id}`}
                                      key={location.id}
                                      role="option"
                                      aria-selected={false}
                                      tabIndex={-1}
                                      className={cn(
                                        'hover:bg-accent flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm',
                                        idx === focusedLocationIndex &&
                                          'bg-accent text-accent-foreground'
                                      )}
                                      onMouseDown={(e) => {
                                        e.preventDefault();
                                        handleLocationSelect(location.name);
                                      }}
                                      onMouseEnter={() =>
                                        setFocusedLocationIndex(idx)
                                      }
                                    >
                                      {location.name}
                                    </div>
                                  )
                                )
                              ) : (
                                <div className="text-muted-foreground px-2 py-1 text-sm">
                                  No locations found.
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                    <div className="text-xs text-gray-500">
                      Select your preferred work locations
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedLocations.map((location) => (
                        <Badge
                          key={location}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {formatEnumValue(location)}
                          <button
                            type="button"
                            onClick={() => {
                              const newLocations = selectedLocations.filter(
                                (l) => l !== location
                              );
                              setSelectedLocations(newLocations);
                              setValue(
                                'preferredLocations',
                                newLocations.join(', '),
                                { shouldValidate: true }
                              );
                            }}
                            className="ring-offset-background focus:ring-ring ml-1 rounded-full outline-none focus:ring-2 focus:ring-offset-2"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Compensation Section */}
              <div className="space-y-4">
                <h3 className="text-foreground flex items-center gap-2 text-lg font-semibold">
                  <Coins className="text-muted-foreground h-5 w-5" />
                  Compensation & Benefits
                </h3>
                <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label
                        htmlFor="preferredSalaryMin"
                        className="text-foreground mb-1 block flex items-center gap-2 text-sm font-medium"
                      >
                        <Wallet className="text-muted-foreground h-4 w-4" />
                        Minimum Salary
                      </Label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          {watch('preferredSalaryCurrency')
                            ? currencies.find(
                                (c) =>
                                  c.code === watch('preferredSalaryCurrency')
                              )?.symbol || '$'
                            : '$'}
                        </div>
                        <Input
                          id="preferredSalaryMin"
                          type="number"
                          min={0}
                          {...register('preferredSalaryMin', {
                            valueAsNumber: true,
                            setValueAs: (v) =>
                              v === '' || v === null
                                ? undefined
                                : Math.max(0, Number(v)),
                          })}
                          className={`pl-8 ${errors.preferredSalaryMin ? 'border-destructive' : ''}`}
                          placeholder="e.g. 80000"
                        />
                      </div>
                      {errors.preferredSalaryMin && (
                        <p className="text-destructive mt-0.5 text-xs">
                          {errors.preferredSalaryMin.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label
                        htmlFor="preferredSalaryMax"
                        className="text-foreground mb-1 block flex items-center gap-2 text-sm font-medium"
                      >
                        <Wallet className="text-muted-foreground h-4 w-4" />
                        Maximum Salary
                      </Label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          {watch('preferredSalaryCurrency')
                            ? currencies.find(
                                (c) =>
                                  c.code === watch('preferredSalaryCurrency')
                              )?.symbol || '$'
                            : '$'}
                        </div>
                        <Input
                          id="preferredSalaryMax"
                          type="number"
                          min={0}
                          {...register('preferredSalaryMax', {
                            valueAsNumber: true,
                            setValueAs: (v) =>
                              v === '' || v === null
                                ? undefined
                                : Math.max(0, Number(v)),
                          })}
                          className={`pl-8 ${errors.preferredSalaryMax ? 'border-destructive' : ''}`}
                          placeholder="e.g. 120000"
                        />
                      </div>
                      {errors.preferredSalaryMax && (
                        <p className="text-destructive mt-0.5 text-xs">
                          {errors.preferredSalaryMax.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="preferredSalaryCurrency"
                      className="text-foreground mb-1 block flex items-center gap-2 text-sm font-medium"
                    >
                      <Coins className="text-muted-foreground h-4 w-4" />
                      Salary Currency
                    </Label>
                    <Select
                      value={watch('preferredSalaryCurrency') || 'USD'}
                      onValueChange={(value) =>
                        setValue('preferredSalaryCurrency', value)
                      }
                    >
                      <SelectTrigger
                        className={
                          errors.preferredSalaryCurrency
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
                    {errors.preferredSalaryCurrency && (
                      <p className="text-destructive mt-0.5 text-xs">
                        {errors.preferredSalaryCurrency.message}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="preferredEquity"
                      checked={watch('preferredEquity')}
                      onCheckedChange={(checked) =>
                        setValue('preferredEquity', checked)
                      }
                    />
                    <Label
                      htmlFor="preferredEquity"
                      className="text-foreground flex items-center gap-2 text-base font-medium"
                    >
                      <Coins className="text-muted-foreground h-4 w-4" />
                      Open to Equity Compensation
                    </Label>
                  </div>

                  <div>
                    <Label
                      htmlFor="preferredBenefits"
                      className="text-foreground mb-1 block flex items-center gap-2 text-sm font-medium"
                    >
                      <Gift className="text-muted-foreground h-4 w-4" />
                      Preferred Benefits
                    </Label>
                    <div className="space-y-2">
                      <Select
                        value=""
                        onValueChange={(val) => {
                          if (!selectedBenefits.includes(val)) {
                            const newItems = [...selectedBenefits, val];
                            setSelectedBenefits(newItems);
                            setValue('preferredBenefits', newItems, {
                              shouldValidate: true,
                            });
                          }
                          setBenefitsSearch('');
                        }}
                      >
                        <SelectTrigger
                          className={
                            errors.preferredBenefits ? 'border-destructive' : ''
                          }
                        >
                          <SelectValue placeholder="Select or search benefits" />
                        </SelectTrigger>
                        <SelectContent>
                          <div className="p-2">
                            <Input
                              placeholder={
                                isLookupCategoriesLoading
                                  ? 'Loading...'
                                  : 'Search benefits...'
                              }
                              value={benefitsSearch}
                              onChange={(e) =>
                                setBenefitsSearch(e.target.value)
                              }
                              className="mb-2"
                            />
                          </div>
                          {filteredBenefits.length > 0 ? (
                            filteredBenefits.map(
                              (item: { id: string; label: string }) => (
                                <SelectItem key={item.id} value={item.label}>
                                  {formatEnumValue(item.label)}
                                </SelectItem>
                              )
                            )
                          ) : (
                            <div className="text-muted-foreground px-2 py-1 text-sm">
                              No benefits found.
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedBenefits.map((item) => (
                          <Badge
                            key={item}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {formatEnumValue(item)}
                            <button
                              type="button"
                              onClick={() => {
                                const newItems = selectedBenefits.filter(
                                  (i) => i !== item
                                );
                                setSelectedBenefits(newItems);
                                setValue('preferredBenefits', newItems, {
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
                    {errors.preferredBenefits && (
                      <p className="text-destructive mt-0.5 text-xs">
                        {errors.preferredBenefits.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Preferences Section */}
              <div className="space-y-4">
                <h3 className="text-foreground flex items-center gap-2 text-lg font-semibold">
                  <ListChecks className="text-muted-foreground h-5 w-5" />
                  Additional Preferences
                </h3>
                <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
                  <div>
                    <Label
                      htmlFor="preferredResponsibilities"
                      className="text-foreground mb-1 block flex items-center gap-2 text-sm font-medium"
                    >
                      <Workflow className="text-muted-foreground h-4 w-4" />
                      Preferred Responsibilities
                    </Label>
                    <div className="space-y-2">
                      <Select
                        value=""
                        onValueChange={(val) => {
                          if (!selectedResponsibilities.includes(val)) {
                            const newItems = [...selectedResponsibilities, val];
                            setSelectedResponsibilities(newItems);
                            setValue('preferredResponsibilities', newItems, {
                              shouldValidate: true,
                            });
                          }
                          setResponsibilitiesSearch('');
                        }}
                      >
                        <SelectTrigger
                          className={
                            errors.preferredResponsibilities
                              ? 'border-destructive'
                              : ''
                          }
                        >
                          <SelectValue placeholder="Select or search responsibilities" />
                        </SelectTrigger>
                        <SelectContent>
                          <div className="p-2">
                            <Input
                              placeholder={
                                isLookupCategoriesLoading
                                  ? 'Loading...'
                                  : 'Search responsibilities...'
                              }
                              value={responsibilitiesSearch}
                              onChange={(e) =>
                                setResponsibilitiesSearch(e.target.value)
                              }
                              className="mb-2"
                            />
                          </div>
                          {filteredResponsibilities.length > 0 ? (
                            filteredResponsibilities.map(
                              (item: { id: string; label: string }) => (
                                <SelectItem key={item.id} value={item.label}>
                                  {enumToReadableText(item.label)}
                                </SelectItem>
                              )
                            )
                          ) : (
                            <div className="text-muted-foreground px-2 py-1 text-sm">
                              No responsibilities found.
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedResponsibilities.map((item) => (
                          <Badge
                            key={item}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {formatEnumValue(item)}
                            <button
                              type="button"
                              onClick={() => {
                                const newItems =
                                  selectedResponsibilities.filter(
                                    (i) => i !== item
                                  );
                                setSelectedResponsibilities(newItems);
                                setValue(
                                  'preferredResponsibilities',
                                  newItems,
                                  { shouldValidate: true }
                                );
                              }}
                              className="ring-offset-background focus:ring-ring ml-1 rounded-full outline-none focus:ring-2 focus:ring-offset-2"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {errors.preferredResponsibilities && (
                      <p className="text-destructive mt-0.5 text-xs">
                        {errors.preferredResponsibilities.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label
                      htmlFor="preferredTags"
                      className="text-foreground mb-1 block flex items-center gap-2 text-sm font-medium"
                    >
                      <Tags className="text-muted-foreground h-4 w-4" />
                      Preferred Tags
                    </Label>
                    <Input
                      id="preferredTags"
                      {...register('preferredTags')}
                      placeholder="e.g. Remote-first, Startup, Enterprise"
                      className={
                        errors.preferredTags ? 'border-destructive' : ''
                      }
                    />
                    {errors.preferredTags && (
                      <p className="text-destructive mt-0.5 text-xs">
                        {errors.preferredTags.message}
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
                disabled={isSubmitting || !isFormValid}
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
                    {preferences ? 'Update Preferences' : 'Add Preferences'}
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

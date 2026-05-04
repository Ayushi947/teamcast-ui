'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ContactPhoneInput } from '@/components/ui/contact-phone-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
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
  Calendar as CalendarIcon,
  Save,
  UserCheck,
  Phone,
  MapPin,
  Languages,
  Linkedin,
  Github,
  Globe,
  X,
  Loader2,
} from 'lucide-react';
import {
  ICandidateProfile,
  ICandidateProfileBasicUpdate,
  IResume,
  IResumeUpdate,
  IResumeSocial,
  IResumeSocialUpdate,
  MaritalStatusEnum,
  SexEnum,
  ICombinedLocation,
  ILookupCategoryMinimal,
  ILocationNamesApiRequest,
  ILocationListResponse,
} from '@/lib/shared';
import { useQuery } from '@tanstack/react-query';
import { supportLookupService, locationService } from '@/lib/services/services';
import { Badge } from '@/components/ui/badge';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { apiClient } from '@/lib/api-client';

// Override the locationService getLocationNames method to use the correct endpoint and return type
locationService.getLocationNames = async (
  params?: ILocationNamesApiRequest
): Promise<ILocationListResponse<ICombinedLocation>> => {
  const response = await apiClient.get('/locations/all', {
    params,
    headers: {
      'Content-Type': 'application/json',
    },
  });
  // Transform the response to match the expected structure
  return {
    items: response.data.data.cities || [],
    total: response.data.data.cities?.length || 0,
    limit: 50,
    offset: 0,
  };
};

const profileFormSchema = z.object({
  // Profile
  sex: z.string().min(1, 'Sex is required'),
  birthDate: z
    .date()
    .optional()
    .refine(
      (date) => {
        if (!date) return true; // Allow empty dates
        const today = new Date();
        today.setHours(23, 59, 59, 999); // Set to end of today to allow today's date
        return date <= today;
      },
      {
        message: 'Birth date cannot be in the future',
      }
    )
    .refine(
      (date) => {
        if (!date) return true; // Allow empty dates
        const minDate = new Date(1900, 0, 1); // January 1, 1900
        const maxDate = new Date(); // Today
        return date >= minDate && date <= maxDate;
      },
      {
        message: 'Birth date must be between 1900 and today',
      }
    ),
  maritalStatus: z
    .nativeEnum(MaritalStatusEnum, {
      errorMap: () => ({ message: 'Marital status is required' }),
    })
    .optional(),
  // Resume
  phone: z
    .string()
    .optional()
    .transform((val) => (val === '' ? undefined : val))
    .pipe(
      z
        .string()
        .refine(
          (val) => {
            if (!val) return true; // Allow empty values

            // Remove all non-digit characters except + at the beginning
            const cleaned = val.replace(/[^\d+]/g, '');

            // Check if it starts with + (international format)
            if (cleaned.startsWith('+')) {
              // International format: + followed by 7-15 digits
              return /^\+[1-9]\d{6,14}$/.test(cleaned);
            } else {
              // National format: 7-15 digits (no leading zeros)
              return /^[1-9]\d{6,14}$/.test(cleaned);
            }
          },
          {
            message:
              'Phone number must be 7-15 digits. Use international format (+1234567890) or national format (1234567890)',
          }
        )
        .refine(
          (val) => {
            if (!val) return true;

            // Additional validation for common country codes
            const cleaned = val.replace(/[^\d+]/g, '');

            if (cleaned.startsWith('+')) {
              // Check for valid country codes (1-3 digits)
              const validCountryCodes = [
                '1',
                '7',
                '20',
                '27',
                '30',
                '31',
                '32',
                '33',
                '34',
                '36',
                '39',
                '40',
                '41',
                '43',
                '44',
                '45',
                '46',
                '47',
                '48',
                '49',
                '51',
                '52',
                '53',
                '54',
                '55',
                '56',
                '57',
                '58',
                '60',
                '61',
                '62',
                '63',
                '64',
                '65',
                '66',
                '81',
                '82',
                '84',
                '86',
                '90',
                '91',
                '92',
                '93',
                '94',
                '95',
                '98',
              ];

              // Check if the country code is valid (1-3 digits)
              return validCountryCodes.some((code) =>
                cleaned.startsWith('+' + code)
              );
            }

            return true; // National format is always valid if it passes length check
          },
          {
            message:
              'Please use a valid country code (e.g., +1 for US/Canada, +44 for UK, +91 for India)',
          }
        )
        .optional()
    ),
  location: z
    .string()
    .optional()
    .transform((val) => (val === '' ? undefined : val))
    .pipe(
      z
        .string()
        .min(2, { message: 'Location must be at least 2 characters long' })
        .max(200, { message: 'Location must be at most 200 characters long' })
        .optional()
    ),
  languages: z
    .array(z.string())
    .optional()
    .transform((val) => (val?.length === 0 ? undefined : val)),
  // Resume Social Links
  linkedin: z
    .string()
    .optional()
    .transform((val) => (val === '' ? undefined : val))
    .pipe(
      z
        .string()
        .refine(
          (val) => {
            if (!val) return true; // Allow empty values

            try {
              const url = new URL(val);
              // Check if it's a valid LinkedIn URL
              return (
                (url.protocol === 'https:' || url.protocol === 'http:') &&
                (url.hostname === 'linkedin.com' ||
                  url.hostname === 'www.linkedin.com' ||
                  url.hostname.endsWith('.linkedin.com'))
              );
            } catch {
              return false;
            }
          },
          {
            message:
              'LinkedIn URL must be a valid LinkedIn profile URL (e.g., https://linkedin.com/in/username)',
          }
        )
        .optional()
    ),
  github: z
    .string()
    .optional()
    .transform((val) => (val === '' ? undefined : val))
    .pipe(
      z
        .string()
        .refine(
          (val) => {
            if (!val) return true; // Allow empty values

            try {
              const url = new URL(val);
              // Check if it's a valid GitHub URL
              return (
                (url.protocol === 'https:' || url.protocol === 'http:') &&
                (url.hostname === 'github.com' ||
                  url.hostname === 'www.github.com' ||
                  url.hostname.endsWith('.github.com'))
              );
            } catch {
              return false;
            }
          },
          {
            message:
              'GitHub URL must be a valid GitHub profile URL (e.g., https://github.com/username)',
          }
        )
        .optional()
    ),
  portfolio: z
    .string()
    .optional()
    .transform((val) => (val === '' ? undefined : val))
    .pipe(
      z
        .string()
        .refine(
          (val) => {
            if (!val) return true; // Allow empty values

            try {
              const url = new URL(val);
              // Check if it's a valid URL with proper protocol
              return (
                url.protocol === 'https:' ||
                url.protocol === 'http:' ||
                url.protocol === 'ftp:'
              );
            } catch {
              return false;
            }
          },
          {
            message:
              'Portfolio URL must be a valid URL (e.g., https://your-portfolio.com)',
          }
        )
        .optional()
    ),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

const sexOptions = ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'] as const;
const maritalStatusOptions = Object.values(
  MaritalStatusEnum
) as readonly MaritalStatusEnum[];

interface ProfileFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    profile: ICandidateProfileBasicUpdate;
    resume: IResumeUpdate;
    social: IResumeSocialUpdate;
  }) => Promise<void>;
  profile?: ICandidateProfile;
  resume?: IResume;
  social?: IResumeSocial;
}

export function ProfileForm({
  isOpen,
  onClose,
  onSubmit,
  profile,
  resume,
  social,
}: ProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneValidationError, setPhoneValidationError] = useState<
    string | null
  >(null);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const [focusedLocationIndex, setFocusedLocationIndex] = useState<number>(-1);

  // Fetch lookup categories for languages
  const {
    data: lookupCategories,
    isLoading: isLookupCategoriesLoading,
    error: _lookupCategoriesError,
  } = useQuery<ILookupCategoryMinimal[]>({
    queryKey: ['lookup-categories'],
    queryFn: async () => {
      const response = await supportLookupService.getLookupValuesByCategories([
        'languages',
      ]);
      return response as ILookupCategoryMinimal[];
    },
  });

  // Find the languages category from the fetched list
  const languagesCategory = useMemo(() => {
    return lookupCategories?.[0];
  }, [lookupCategories]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      sex: SexEnum.OTHER,
      birthDate: undefined,
      maritalStatus: MaritalStatusEnum.SINGLE,
      phone: undefined,
      location: undefined,
      languages: [],
      linkedin: undefined,
      github: undefined,
      portfolio: undefined,
    },
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  const debouncedLocationSearch = useDebounce(locationSearch, 300);

  // Memoize handlers to prevent unnecessary re-renders
  // const handleLocationSearchChange = useCallback((value: string) => { ... });
  // const handleLocationSelect = useCallback((value: string) => { ... });
  // const handleKeyDown = useCallback((e: React.KeyboardEvent) => { ... });

  // Optimize location query with better caching and performance settings
  const { data: locations, isLoading: isLocationsLoading } = useQuery({
    queryKey: ['locations', debouncedLocationSearch],
    queryFn: async () => {
      if (!debouncedLocationSearch || debouncedLocationSearch.length < 2) {
        return [];
      }
      const response = await locationService.getLocationNames({
        search: debouncedLocationSearch,
      });
      return response.items || [];
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

  // Initialize form with existing data
  useEffect(() => {
    if (profile && resume && social) {
      setValue('sex', profile.sex || SexEnum.OTHER);
      setValue(
        'maritalStatus',
        profile.maritalStatus || MaritalStatusEnum.SINGLE
      );
      setValue(
        'birthDate',
        profile.birthDate ? new Date(profile.birthDate) : undefined
      );
      setValue('location', resume.location || undefined);
      setLocationSearch(resume.location || '');
      setValue('phone', resume.phone || undefined);
      setValue('languages', resume.languages || []);
      setSelectedLanguages(resume.languages || []);
      setValue('linkedin', social.linkedin || undefined);
      setValue('github', social.github || undefined);
      setValue('portfolio', social.portfolio || undefined);
    }
  }, [profile, resume, social, setValue]);

  // Keep locationSearch in sync with form value when dialog opens or value changes
  useEffect(() => {
    const formLocation = watch('location');
    if (formLocation && formLocation !== locationSearch) {
      setLocationSearch(formLocation);
    }
    if (!formLocation && locationSearch) {
      setLocationSearch('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, watch('location')]);

  // Keep selectedLanguages in sync with form value
  useEffect(() => {
    const subscription = watch((value) => {
      if (Array.isArray(value.languages)) {
        setSelectedLanguages(
          (value.languages ?? []).filter(
            (lang): lang is string => typeof lang === 'string'
          )
        );
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const handleLanguageChange = (value: string) => {
    const isAlreadySelected = selectedLanguages.some(
      (lang) => lang.toLowerCase() === value.toLowerCase()
    );

    const newLanguages = isAlreadySelected
      ? selectedLanguages.filter(
          (lang) => lang.toLowerCase() !== value.toLowerCase()
        )
      : [...selectedLanguages, value];

    setSelectedLanguages(newLanguages);
    setValue('languages', newLanguages);
  };

  const filteredLanguages =
    languagesCategory?.lookupValues?.filter((language: { label: string }) => {
      const isAlreadySelected = selectedLanguages.some(
        (selectedLang) =>
          selectedLang.toLowerCase() === language.label.toLowerCase()
      );
      const matchesSearch = language.label
        .toLowerCase()
        .includes(searchInput.toLowerCase());
      return !isAlreadySelected && matchesSearch;
    }) ?? [];

  const handleLanguageOptionSelect = (languageLabel: string) => {
    // Check if language is already selected (case-insensitive)
    const isAlreadySelected = selectedLanguages.some(
      (lang) => lang.toLowerCase() === languageLabel.toLowerCase()
    );

    if (!isAlreadySelected) {
      handleLanguageChange(languageLabel);
    }

    setSearchInput('');
    setFocusedIndex(-1);
  };

  const handleLanguageInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (!filteredLanguages.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev + 1) % filteredLanguages.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(
        (prev) =>
          (prev - 1 + filteredLanguages.length) % filteredLanguages.length
      );
    } else if (e.key === 'Enter' || e.key === ' ') {
      if (focusedIndex >= 0 && focusedIndex < filteredLanguages.length) {
        handleLanguageOptionSelect(filteredLanguages[focusedIndex].label);
      }
    }
  };

  const filteredLocations =
    locations?.filter((loc: { name: string }) =>
      loc.name.toLowerCase().includes(locationSearch.toLowerCase())
    ) ?? [];

  const handleLocationOptionSelect = (locationName: string) => {
    setLocationSearch(locationName);
    setValue('location', locationName, { shouldValidate: true });
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
        handleLocationOptionSelect(
          filteredLocations[focusedLocationIndex].name
        );
      }
    }
  };

  const handleFormSubmit = async (data: ProfileFormData) => {
    try {
      setIsSubmitting(true);
      const profileUpdate: ICandidateProfileBasicUpdate = {
        ...(data.sex && { sex: data.sex as SexEnum }),
        ...(data.maritalStatus && {
          maritalStatus: data.maritalStatus as MaritalStatusEnum,
        }),
        ...(data.birthDate && { birthDate: data.birthDate }),
      };

      const resumeUpdate: IResumeUpdate = {
        ...(data.location && { location: data.location }),
        ...(data.phone && { phone: data.phone }),
        ...(data.languages && {
          languages: data.languages,
        }),
      };

      const socialUpdate: IResumeSocialUpdate = {
        ...(data.linkedin && { linkedin: data.linkedin }),
        ...(data.github && { github: data.github }),
        ...(data.portfolio && { portfolio: data.portfolio }),
      };

      await onSubmit({
        profile: profileUpdate,
        resume: resumeUpdate,
        social: socialUpdate,
      });

      reset();
      onClose();
    } catch (error) {
      logger.error('Error submitting profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Replace languagesSection with new multi-select Popover
  const languagesSection = (
    <div>
      <Label
        htmlFor="languages"
        className="text-foreground mb-1 block flex items-center gap-2 text-sm font-medium"
      >
        <Languages className="text-muted-foreground h-4 w-4" />
        Languages
      </Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !selectedLanguages.length && 'text-muted-foreground',
              errors.languages ? 'border-destructive' : ''
            )}
          >
            {searchInput ? searchInput : 'Select languages'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <div className="p-2">
            <Input
              placeholder={
                isLookupCategoriesLoading ? 'Loading...' : 'Search languages...'
              }
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setFocusedIndex(-1);
              }}
              className="mb-2"
              onKeyDown={handleLanguageInputKeyDown}
              aria-activedescendant={
                focusedIndex >= 0 && filteredLanguages[focusedIndex]
                  ? `language-option-${filteredLanguages[focusedIndex].id}`
                  : undefined
              }
              aria-controls="languages-listbox"
              role="combobox"
              aria-expanded="true"
            />
            <div
              id="languages-listbox"
              role="listbox"
              aria-multiselectable="true"
              className="max-h-48 overflow-y-auto"
            >
              {filteredLanguages.length > 0 ? (
                filteredLanguages.map(
                  (language: { id: string; label: string }, idx: number) => (
                    <div
                      id={`language-option-${language.id}`}
                      key={language.id}
                      role="option"
                      aria-selected={false}
                      tabIndex={-1}
                      className={cn(
                        'hover:bg-accent flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm',
                        idx === focusedIndex &&
                          'bg-accent text-accent-foreground'
                      )}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleLanguageOptionSelect(language.label);
                      }}
                      onMouseEnter={() => setFocusedIndex(idx)}
                    >
                      {enumToReadableText(language.label)}
                    </div>
                  )
                )
              ) : (
                <div className="text-muted-foreground px-2 py-1 text-sm">
                  No languages found.
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <div className="mt-2 flex flex-wrap gap-2">
        {selectedLanguages.map((lang, idx) => (
          <Badge
            key={`${lang}-${idx}`}
            variant="secondary"
            className="flex items-center gap-1"
          >
            {formatEnumValue(lang)}
            <button
              type="button"
              onClick={() => handleLanguageChange(lang)}
              className="ring-offset-background focus:ring-ring ml-1 rounded-full outline-none focus:ring-2 focus:ring-offset-2"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      {errors.languages && (
        <p className="text-destructive mt-0.5 text-xs">
          {errors.languages.message}
        </p>
      )}
    </div>
  );

  const locationField = (
    <div>
      <Label
        htmlFor="location"
        className="text-foreground mb-1 block flex items-center gap-2 text-sm font-medium"
      >
        <MapPin className="text-muted-foreground h-4 w-4" />
        Location
      </Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !locationSearch && 'text-muted-foreground',
              errors.location ? 'border-destructive' : ''
            )}
          >
            {locationSearch || 'Select or type location'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <div className="p-2">
            <Input
              placeholder={
                isLocationsLoading ? 'Loading...' : 'Search locations...'
              }
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
                  ? `location-option-${filteredLocations[focusedLocationIndex].name}`
                  : undefined
              }
              aria-controls="locations-listbox"
              role="combobox"
              aria-expanded="true"
            />
          </div>
          <div
            id="locations-listbox"
            role="listbox"
            aria-multiselectable="false"
            className="max-h-48 overflow-y-auto"
          >
            {isLocationsLoading ? (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="text-muted-foreground mr-2 h-4 w-4 animate-spin" />
                <span className="text-muted-foreground text-sm">
                  Loading...
                </span>
              </div>
            ) : filteredLocations.length > 0 ? (
              filteredLocations.map((loc: { name: string }, idx: number) => (
                <div
                  id={`location-option-${loc.name}`}
                  key={loc.name}
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
                    handleLocationOptionSelect(loc.name);
                  }}
                  onMouseEnter={() => setFocusedLocationIndex(idx)}
                >
                  {loc.name}
                </div>
              ))
            ) : debouncedLocationSearch.length < 2 ? (
              <div className="text-muted-foreground px-2 py-1 text-sm">
                Type at least 2 characters to search
              </div>
            ) : (
              <div className="text-muted-foreground px-2 py-1 text-sm">
                No locations found.
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
      {errors.location && (
        <p className="text-destructive mt-0.5 text-xs">
          {errors.location.message}
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
              <UserCheck className="text-muted-foreground h-5 w-5" />
              {profile ? 'Edit Profile' : 'Add Profile'}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground mt-1 text-sm">
              {profile
                ? 'Update your basic information'
                : 'Add your basic information'}
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
              {/* Personal Information Section */}
              <div className="space-y-4">
                <div className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
                  <div className="text-foreground flex items-center gap-2 pb-4">
                    <UserCheck className="text-muted-foreground h-8 w-8" />
                    <div>
                      <h3 className="text-foreground text-lg font-semibold">
                        Personal Information
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Tell us about your basic personal details like birth
                        date, sex, and marital status.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
                  {/* Birth Date */}
                  <div>
                    <Label
                      htmlFor="birthDate"
                      className="text-foreground mb-1 block flex items-center gap-2 text-sm font-medium"
                    >
                      <CalendarIcon className="text-muted-foreground h-4 w-4" />
                      Birth Date
                    </Label>
                    <DatePickerCalendar
                      value={watch('birthDate') as Date}
                      onChange={(date) => setValue('birthDate', date)}
                      minDate={new Date(1900, 0, 1)}
                      maxDate={(() => {
                        const sixteenYearsAgo = new Date();
                        sixteenYearsAgo.setFullYear(
                          sixteenYearsAgo.getFullYear() - 16
                        );
                        return sixteenYearsAgo;
                      })()}
                      placeholder="Select your birth date"
                      className={cn(
                        errors.birthDate ? 'border-destructive' : ''
                      )}
                    />
                    {errors.birthDate && (
                      <p className="text-destructive mt-0.5 text-xs">
                        {errors.birthDate.message}
                      </p>
                    )}
                  </div>

                  {/* Sex */}
                  <div>
                    <Label
                      htmlFor="sex"
                      className="text-foreground mb-1 block flex items-center gap-2 text-sm font-medium"
                    >
                      <UserCheck className="text-muted-foreground h-4 w-4" />
                      Sex
                    </Label>
                    <Select
                      value={watch('sex')}
                      onValueChange={(value) => setValue('sex', value)}
                    >
                      <SelectTrigger
                        className={errors.sex ? 'border-destructive' : ''}
                      >
                        <SelectValue placeholder="Select sex" />
                      </SelectTrigger>
                      <SelectContent>
                        {sexOptions.map((sex) => (
                          <SelectItem key={sex} value={sex}>
                            {enumToReadableText(sex)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.sex && (
                      <p className="text-destructive mt-0.5 text-xs">
                        {errors.sex.message}
                      </p>
                    )}
                  </div>

                  {/* Marital Status */}
                  <div>
                    <Label
                      htmlFor="maritalStatus"
                      className="text-foreground mb-1 block flex items-center gap-2 text-sm font-medium"
                    >
                      <UserCheck className="text-muted-foreground h-4 w-4" />
                      Marital Status
                    </Label>
                    <Select
                      value={watch('maritalStatus') as unknown as string}
                      onValueChange={(value) =>
                        setValue('maritalStatus', value as MaritalStatusEnum)
                      }
                    >
                      <SelectTrigger
                        className={
                          errors.maritalStatus ? 'border-destructive' : ''
                        }
                      >
                        <SelectValue placeholder="Select marital status" />
                      </SelectTrigger>
                      <SelectContent>
                        {maritalStatusOptions.map((status) => (
                          <SelectItem key={status} value={status}>
                            {formatEnumValue(status)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.maritalStatus && (
                      <p className="text-destructive mt-0.5 text-xs">
                        {errors.maritalStatus.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Information Section */}
              <div className="space-y-4">
                <div className="text-foreground flex items-center gap-2 pb-4">
                  <Phone className="text-muted-foreground h-7 w-8" />
                  <div>
                    <h3 className="text-foreground text-lg font-semibold">
                      Contact Information
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Share your contact details and language preferences to
                      help recruiters reach you.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
                  {/* Phone */}
                  <div>
                    <ContactPhoneInput
                      value={watch('phone')}
                      onChange={(value) => setValue('phone', value)}
                      onValidationError={setPhoneValidationError}
                      placeholder="e.g. 123 456 7890"
                      label="Phone Number"
                      error={errors.phone?.message}
                    />
                  </div>

                  {/* Location */}
                  {locationField}

                  {languagesSection}
                </div>
              </div>

              {/* Social Links Section */}
              <div className="space-y-4">
                <div className="text-foreground flex items-center gap-2 pb-4">
                  <Globe className="text-muted-foreground h-7 w-8" />
                  <div>
                    <h3 className="text-foreground text-lg font-semibold">
                      Social & Portfolio Links
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Add your professional profiles and portfolio to showcase
                      your work and experience.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
                  {/* LinkedIn */}
                  <div>
                    <Label
                      htmlFor="linkedin"
                      className="text-foreground mb-1 block flex items-center gap-2 text-sm font-medium"
                    >
                      <Linkedin className="text-muted-foreground h-4 w-4" />
                      LinkedIn
                    </Label>
                    <Input
                      id="linkedin"
                      {...register('linkedin')}
                      placeholder="https://linkedin.com/in/your-profile"
                      className={cn(
                        errors.linkedin ? 'border-destructive' : ''
                      )}
                    />
                    {errors.linkedin && (
                      <p className="text-destructive mt-0.5 text-xs">
                        {errors.linkedin.message}
                      </p>
                    )}
                  </div>

                  {/* GitHub */}
                  <div>
                    <Label
                      htmlFor="github"
                      className="text-foreground mb-1 block flex items-center gap-2 text-sm font-medium"
                    >
                      <Github className="text-muted-foreground h-4 w-4" />
                      GitHub
                    </Label>
                    <Input
                      id="github"
                      {...register('github')}
                      placeholder="https://github.com/your-username"
                      className={cn(errors.github ? 'border-destructive' : '')}
                    />
                    {errors.github && (
                      <p className="text-destructive mt-0.5 text-xs">
                        {errors.github.message}
                      </p>
                    )}
                  </div>

                  {/* Portfolio */}
                  <div className="md:col-span-2">
                    <Label
                      htmlFor="portfolio"
                      className="text-foreground mb-1 block flex items-center gap-2 text-sm font-medium"
                    >
                      <Globe className="text-muted-foreground h-4 w-4" />
                      Portfolio / Website
                    </Label>
                    <Input
                      id="portfolio"
                      {...register('portfolio')}
                      placeholder="https://your-portfolio.com"
                      className={cn(
                        errors.portfolio ? 'border-destructive' : ''
                      )}
                    />
                    {errors.portfolio && (
                      <p className="text-destructive mt-0.5 text-xs">
                        {errors.portfolio.message}
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
                disabled={isSubmitting || phoneValidationError !== null}
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
                    {profile ? 'Update Profile' : 'Add Profile'}
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

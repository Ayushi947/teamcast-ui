'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
import { DatePickerCalendar } from '@/components/ui/date-picker-calendar';
import {
  Building2,
  GraduationCap,
  Calendar as CalendarIcon,
  Award,
  CalendarDays,
} from 'lucide-react';
import {
  IResumeEducation,
  IResumeEducationCreate,
  EducationLevelEnum,
  logger,
} from '@/lib/shared';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect, useMemo, useState } from 'react';
import { cn, formatEnumValue } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supportLookupService } from '@/lib/services/services';
import React from 'react';

const educationLevels = Object.values(EducationLevelEnum);

const noConsecutiveSpecialChars = (val?: string) =>
  !val || !/[^a-zA-Z0-9\s]{3,}/.test(val);

const noMoreThan5ConsecutiveNumbers = (val?: string) =>
  !val || !/\d{6,}/.test(val);

export const educationSchema = z
  .object({
    institution: z
      .string()
      .min(1, 'Institution name is required')
      .max(150, 'Institution name cannot exceed 150 characters')
      .regex(
        /^(?!.*[^A-Za-z\s]{3,})(?!.*\d).*$/,
        'Institution name can not contain numbers'
      )
      .refine(
        noConsecutiveSpecialChars,
        'Institution name cannot contain more than 2 consecutive special characters'
      )
      .refine(
        (val) => !/\d{3,}/.test(val),
        'Institution name cannot contain more than 2 consecutive numbers'
      ),

    level: z.nativeEnum(EducationLevelEnum, {
      errorMap: () => ({ message: 'Please select a valid education level' }),
    }),

    degree: z
      .string()
      .min(1, 'Degree name is required')
      .max(100, 'Degree name cannot exceed 100 characters')
      .refine(
        noConsecutiveSpecialChars,
        'Degree name cannot contain more than 2 consecutive special characters'
      )
      .refine(
        noMoreThan5ConsecutiveNumbers,
        'Degree name cannot contain more than 5 consecutive numbers'
      ),

    fieldOfStudy: z
      .string()
      .min(1, 'Field of study is required')
      .max(100, 'Field of study cannot exceed 100 characters'),

    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().optional(),
    currentlyPursuing: z.boolean(),

    gpa: z
      .number()
      .min(0, 'GPA must be at least 0.0')
      .max(10, 'GPA cannot be higher than 10.0')
      .optional(),

    achievements: z
      .string()
      .max(500, 'Achievements cannot exceed 500 characters')
      .refine(
        noConsecutiveSpecialChars,
        'Achievements cannot contain more than 2 consecutive special characters'
      )
      .refine(
        noMoreThan5ConsecutiveNumbers,
        'Achievements cannot contain more than 5 consecutive numbers'
      )
      .optional(),
  })
  .refine(
    (data) => {
      if (data.currentlyPursuing) return true;
      if (!data.endDate) return true;

      const startDate = new Date(data.startDate as string);
      const endDate = new Date(data.endDate as string);
      return endDate >= startDate;
    },
    {
      message: 'End date must be later than or equal to the start date',
      path: ['endDate'],
    }
  );

type EducationFormData = z.infer<typeof educationSchema>;

interface EducationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: IResumeEducationCreate) => Promise<void>;
  education?: IResumeEducation;
}

export function EducationForm({
  isOpen,
  onClose,
  onSubmit,
  education,
}: EducationFormProps) {
  // Fetch institutions and fields of study lookup categories
  const {
    data: lookupCategories,
    isLoading: isLookupCategoriesLoading,
    error: _lookupCategoriesError,
  } = useQuery({
    queryKey: ['lookup-categories-education'],
    queryFn: () =>
      supportLookupService.getLookupValuesByCategories(['field_of_study']),
  });

  const [fieldOfStudySearch, setFieldOfStudySearch] = useState('');

  // Find the field of study category from the fetched list
  const fieldOfStudyCategory = useMemo(() => {
    return lookupCategories?.find(
      (category) => category.name === 'field_of_study'
    );
  }, [lookupCategories]);

  const filteredFields =
    fieldOfStudyCategory?.lookupValues?.filter((field: { label: string }) =>
      field.label.toLowerCase().includes(fieldOfStudySearch.toLowerCase())
    ) ?? [];

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<EducationFormData>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      institution: '',
      level: 'BACHELORS' as EducationLevelEnum,
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      currentlyPursuing: false,
      gpa: undefined,
      achievements: '',
    },
  });

  const startDateWatch = watch('startDate');
  const endDateWatch = watch('endDate');

  // Helper function to format date to YYYY-MM-DD without timezone issues
  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper function to create date without timezone issues
  const createLocalDate = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day); // month is 0-indexed in Date constructor
  };

  useEffect(() => {
    if (education) {
      setValue('institution', education.institution);
      setValue('level', education.level);
      setValue('degree', education.degree);
      setValue('fieldOfStudy', education.fieldOfStudy);
      setValue(
        'startDate',
        education.startDate
          ? formatDateForInput(new Date(education.startDate))
          : ''
      );
      setValue(
        'endDate',
        education.endDate ? formatDateForInput(new Date(education.endDate)) : ''
      );
      setValue(
        'currentlyPursuing',
        education.currentlyPursuing ? education.currentlyPursuing : false
      );
      setValue('gpa', education.gpa);
      setValue('achievements', (education.achievements || []).join('\n'));
    } else {
      reset({
        institution: '',
        level: EducationLevelEnum.BACHELORS,
        degree: '',
        fieldOfStudy: '',
        startDate: '',
        endDate: '',
        currentlyPursuing: false,
        gpa: 0,
        achievements: '',
      });
    }
  }, [education, setValue, reset]);

  const handleFormSubmit = async (data: EducationFormData) => {
    try {
      const educationData: IResumeEducationCreate = {
        ...data,
        startDate: createLocalDate(data.startDate),
        endDate: data.currentlyPursuing
          ? undefined
          : data.endDate
            ? createLocalDate(data.endDate)
            : undefined,
        level: data.level as EducationLevelEnum,
        achievements: data.achievements
          ? data.achievements
              .split('\n')
              .map((line) => line.trim())
              .filter((line) => line.length > 0)
          : [],
      };
      await onSubmit(educationData);
      reset();
      onClose();
    } catch (error) {
      logger.error('Error submitting form:', { error });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="p-0 sm:max-w-[900px]"
      >
        <div className="flex h-[80vh] flex-col">
          {/* Header */}
          <div className="border-b px-6 py-4">
            <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
              <GraduationCap className="text-primary h-5 w-5" />
              {education ? 'Edit Education' : 'Add Education'}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground mt-1 text-sm">
              {education
                ? 'Update your education details'
                : 'Add a new education to your profile'}
            </DialogDescription>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <form
              onSubmit={handleSubmit(handleFormSubmit)}
              className="space-y-8"
            >
              {/* Institution Information Section */}
              <div className="space-y-4">
                <h3 className="text-foreground flex items-center gap-2 text-lg font-semibold">
                  <Building2 className="text-muted-foreground h-5 w-5" />
                  Institution Information
                </h3>
                <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
                  {/* Institution Name Input */}
                  <div>
                    <Label
                      htmlFor="institution"
                      className="text-foreground mb-1 block flex items-center gap-2 text-sm font-medium"
                    >
                      <Building2 className="text-muted-foreground h-4 w-4" />
                      Institution Name{' '}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="institution"
                      {...register('institution')}
                      placeholder="Enter institution name"
                      className={cn(
                        'h-10',
                        errors.institution ? 'border-destructive' : ''
                      )}
                    />
                    {errors.institution && (
                      <p className="text-destructive mt-0.5 text-xs">
                        {errors.institution.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label
                      htmlFor="level"
                      className="text-foreground mb-1 block flex items-center gap-2 text-sm font-medium"
                    >
                      <GraduationCap className="text-muted-foreground h-4 w-4" />
                      Education Level{' '}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={watch('level')}
                      onValueChange={(value) =>
                        setValue('level', value as EducationLevelEnum)
                      }
                    >
                      <SelectTrigger
                        className={errors.level ? 'border-destructive' : ''}
                      >
                        <SelectValue placeholder="Select education level" />
                      </SelectTrigger>
                      <SelectContent>
                        {educationLevels.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level
                              .replace(/_/g, ' ')
                              .toLowerCase()
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.level && (
                      <p className="text-destructive mt-0.5 text-xs">
                        {errors.level.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Degree Information Section */}
              <div className="space-y-4">
                <div className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
                  <GraduationCap className="text-primary h-4 w-4" />
                  Degree Information
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <Label className="mb-2 block text-sm font-medium">
                      Degree <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      {...register('degree')}
                      placeholder="Enter your degree"
                      className="h-10"
                    />
                    {errors.degree && (
                      <p className="text-destructive mt-1 text-sm">
                        {errors.degree.message}
                      </p>
                    )}
                  </div>

                  {/* Field of Study Dropdown */}
                  <div>
                    <Label
                      htmlFor="fieldOfStudy"
                      className="text-foreground mb-1 block flex items-center gap-2 text-sm font-medium"
                    >
                      <GraduationCap className="text-muted-foreground h-4 w-4" />
                      Field of Study <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={watch('fieldOfStudy')}
                      onValueChange={(val) => {
                        setValue('fieldOfStudy', val, { shouldValidate: true });
                        setFieldOfStudySearch('');
                      }}
                    >
                      <SelectTrigger
                        id="fieldOfStudy"
                        className={
                          errors.fieldOfStudy ? 'border-destructive' : ''
                        }
                      >
                        <SelectValue placeholder="Select or search field of study" />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="p-2">
                          <Input
                            placeholder={
                              isLookupCategoriesLoading
                                ? 'Loading...'
                                : 'Search field of study...'
                            }
                            value={fieldOfStudySearch}
                            onChange={(e) =>
                              setFieldOfStudySearch(e.target.value)
                            }
                            className="mb-2"
                          />
                        </div>
                        {filteredFields.length > 0 ? (
                          filteredFields.map(
                            (field: { id: string; label: string }) => (
                              <SelectItem key={field.id} value={field.label}>
                                {formatEnumValue(field.label)}
                              </SelectItem>
                            )
                          )
                        ) : (
                          <div className="text-muted-foreground px-2 py-1 text-sm">
                            No field of study found.
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    {errors.fieldOfStudy && (
                      <p className="text-destructive mt-0.5 text-xs">
                        {errors.fieldOfStudy.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="mb-2 block text-sm font-medium">
                      GPA (Optional)
                    </Label>
                    <Input
                      {...register('gpa', {
                        valueAsNumber: true,
                        min: 0,
                        max: 10,
                      })}
                      type="number"
                      step="0.01"
                      placeholder="Enter your GPA (0-10)"
                      className="h-10"
                    />
                    {errors.gpa && (
                      <p className="text-destructive mt-1 text-sm">
                        {errors.gpa.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Duration Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
                    <CalendarIcon className="text-primary h-4 w-4" />
                    Duration
                  </div>
                  <div className="flex items-center space-x-2">
                    <Label
                      htmlFor="currentlyPursuing"
                      className="text-sm font-medium"
                    >
                      Currently Studying
                    </Label>
                    <Switch
                      id="currentlyPursuing"
                      checked={watch('currentlyPursuing')}
                      onCheckedChange={(checked) => {
                        setValue('currentlyPursuing', checked);
                        if (checked) {
                          setValue('endDate', '');
                        } else {
                          setValue('endDate', '');
                        }
                      }}
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label
                      htmlFor="startDate"
                      className="text-foreground mb-1 block flex items-center gap-2 text-sm font-medium"
                    >
                      <CalendarDays className="text-muted-foreground h-4 w-4" />
                      Start Date <span className="text-destructive">*</span>
                    </Label>
                    <DatePickerCalendar
                      value={
                        startDateWatch
                          ? new Date(startDateWatch as string)
                          : undefined
                      }
                      onChange={(date) => {
                        setValue(
                          'startDate',
                          date ? formatDateForInput(date) : ''
                        );
                      }}
                      placeholder="Select start date"
                      minDate={new Date(1900, 0, 1)}
                      maxDate={new Date()}
                      className={errors.startDate ? 'border-destructive' : ''}
                    />
                    {errors.startDate && (
                      <p className="text-destructive mt-0.5 text-xs">
                        {errors.startDate.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label
                      htmlFor="endDate"
                      className="text-foreground mb-1 block flex items-center gap-2 text-sm font-medium"
                    >
                      <CalendarDays className="text-muted-foreground h-4 w-4" />
                      End Date
                    </Label>
                    <DatePickerCalendar
                      value={
                        endDateWatch
                          ? new Date(endDateWatch as string)
                          : undefined
                      }
                      onChange={(date) => {
                        setValue(
                          'endDate',
                          date ? formatDateForInput(date) : ''
                        );
                      }}
                      placeholder="Select end date"
                      minDate={
                        startDateWatch
                          ? new Date(startDateWatch as string)
                          : new Date(1900, 0, 1)
                      }
                      maxDate={new Date(new Date().getFullYear() + 10, 11, 31)}
                      disabled={watch('currentlyPursuing')}
                      className={errors.endDate ? 'border-destructive' : ''}
                    />
                    {errors.endDate && (
                      <p className="text-destructive mt-0.5 text-xs">
                        {errors.endDate.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Achievements Section */}
              <div className="space-y-4">
                <div className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
                  <Award className="text-primary h-4 w-4" />
                  Achievements
                </div>
                <div>
                  <Label className="mb-2 block text-sm font-medium">
                    Academic Achievements
                  </Label>
                  <Textarea
                    {...register('achievements')}
                    placeholder="Enter your achievements (one per line)"
                    rows={4}
                    className="resize-none"
                  />
                  <p className="text-muted-foreground mt-2 text-sm">
                    Enter each achievement on a new line
                  </p>
                  {errors.achievements && (
                    <p className="text-destructive mt-1 text-sm">
                      {errors.achievements.message}
                    </p>
                  )}
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
              <Button type="submit" onClick={handleSubmit(handleFormSubmit)}>
                {education ? 'Update Education' : 'Add Education'}
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

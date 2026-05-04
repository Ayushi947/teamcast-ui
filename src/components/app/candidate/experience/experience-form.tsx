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
  Briefcase,
  Calendar as CalendarIcon,
  FileText,
  Workflow,
  CalendarDays,
} from 'lucide-react';
import {
  IResumeExperience,
  IResumeExperienceCreate,
  WorkTypeEnum,
  WorkCommitmentEnum,
  CompanyIndustryEnum,
  logger,
} from '@/lib/shared';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect } from 'react';
import { Resolver } from 'react-hook-form';
import { SkillSelector, type Skill } from '@/components/ui/skill-selector';
import React from 'react';

const workTypes = Object.values(WorkTypeEnum);
const workCommitments = Object.values(WorkCommitmentEnum);
const industries = Object.values(CompanyIndustryEnum);

const parseSkillString = (skillStr: string): Skill => {
  const [name, level, yearsOfExperience] = skillStr.split(':');
  return {
    name,
    level: level as 'Beginner' | 'Intermediate' | 'Expert',
    yearsOfExperience,
  };
};

const formatSkills = (skills: Skill[]): string[] => {
  return skills.map(
    (skill) => `${skill.name}:${skill.level}:${skill.yearsOfExperience}`
  );
};

// Utility function to check for date range overlaps
const checkDateOverlap = (
  start1: Date,
  end1: Date | undefined,
  start2: Date,
  end2: Date | undefined
): boolean => {
  // If either experience has no end date (currently working), treat end as today
  const effectiveEnd1 = end1 || new Date();
  const effectiveEnd2 = end2 || new Date();

  // Check if the date ranges overlap
  return start1 <= effectiveEnd2 && start2 <= effectiveEnd1;
};

// Create dynamic schema with overlap validation
const noConsecutiveSpecialChars = (val?: string) =>
  !val || !/[^a-zA-Z0-9\s]{3,}/.test(val);

const noMoreThan5ConsecutiveNumbers = (val?: string) =>
  !val || !/\d{6,}/.test(val);
//added validations
const createExperienceSchema = (
  existingExperiences: IResumeExperience[],
  currentExperienceId?: string
) => {
  return (
    z
      .object({
        company: z
          .string()
          .min(1, 'Company name is required')
          .max(150, 'Company name cannot exceed 150 characters')
          .regex(
            /^(?!.*[^A-Za-z0-9\s]{3,}).+$/,
            'Company name can only include letters, numbers, spaces, and , . - /'
          )
          .refine(
            noConsecutiveSpecialChars,
            'Company name cannot contain more than 2 consecutive special characters'
          )
          .refine(
            noMoreThan5ConsecutiveNumbers,
            'Company name cannot contain more than 5 consecutive numbers'
          ),

        position: z
          .string()
          .min(1, 'Position is required')
          .max(100, 'Position cannot exceed 100 characters')
          .regex(
            /^(?!.*[^A-Za-z0-9\s]{3,}).+$/,
            'Position can only include letters, numbers, spaces, and , . - /'
          )
          .refine(
            noConsecutiveSpecialChars,
            'Position cannot contain more than 2 consecutive special characters'
          )
          .refine(
            noMoreThan5ConsecutiveNumbers,
            'Position cannot contain more than 5 consecutive numbers'
          ),

        industry: z.string().min(1, 'Industry is required'),
        type: z.nativeEnum(WorkTypeEnum),
        commitment: z.nativeEnum(WorkCommitmentEnum),
        startDate: z.string().min(1, 'Start date is required'),
        endDate: z.string().optional(),
        currentlyWorking: z.boolean(),

        description: z
          .string()
          .optional()
          .refine(
            (val) => !val || /^(?!.*[^A-Za-z0-9\s]{3,}).+$/.test(val),
            'Description is Invalid'
          )
          .refine(
            (val) => !val || !/\d{6,}/.test(val),
            'Description cannot contain more than 5 consecutive numbers'
          ),

        responsibilities: z
          .string()
          .optional()
          .refine(
            (val) => !val || /^(?!.*[^A-Za-z0-9\s]{3,}).+$/.test(val),
            'Responsibilities cannot contain more than 2 consecutive special characters'
          )
          .refine(
            (val) => !val || !/\d{6,}/.test(val),
            'Responsibilities cannot contain more than 5 consecutive numbers'
          ),

        achievements: z
          .string()
          .optional()
          .refine(
            (val) => !val || !/[^A-Za-z0-9\s]{3,}/.test(val),
            'Achievements cannot contain more than 2 consecutive special characters'
          )
          .refine(
            (val) => !val || !/\d{6,}/.test(val),
            'Achievements cannot contain more than 5 consecutive numbers'
          ),

        skills: z.array(z.custom<Skill>()).default([]),
      })
      // ✅ End date >= start date validation
      .refine(
        (data) => {
          if (data.currentlyWorking) return true;
          if (!data.endDate) return true;

          const startDate = new Date(data.startDate);
          const endDate = new Date(data.endDate);
          return endDate >= startDate;
        },
        {
          message: 'End date must not be before start date',
          path: ['endDate'],
        }
      )
      // ✅ Overlap validation
      .refine(
        (data) => {
          const newStartDate = new Date(data.startDate);
          const newEndDate = data.currentlyWorking
            ? undefined
            : data.endDate
              ? new Date(data.endDate)
              : undefined;

          return !existingExperiences.some((existingExp) => {
            if (currentExperienceId && existingExp.id === currentExperienceId) {
              return false;
            }

            const existingStartDate = new Date(existingExp.startDate);
            const existingEndDate = existingExp.currentlyWorking
              ? undefined
              : existingExp.endDate;

            return checkDateOverlap(
              newStartDate,
              newEndDate,
              existingStartDate,
              existingEndDate
            );
          });
        },
        {
          message:
            'The entered dates conflict with an existing experience. Please update the period.',
          path: ['startDate'],
        }
      )
  );
};

type ExperienceFormData = z.infer<ReturnType<typeof createExperienceSchema>>;

interface ExperienceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: IResumeExperienceCreate) => Promise<void>;
  experience?: IResumeExperience;
  existingExperiences?: IResumeExperience[];
}

export function ExperienceForm({
  isOpen,
  onClose,
  onSubmit,
  experience,
  existingExperiences = [],
}: ExperienceFormProps) {
  const experienceSchema = createExperienceSchema(
    existingExperiences,
    experience?.id
  );

  const form = useForm<ExperienceFormData>({
    resolver: zodResolver(experienceSchema) as Resolver<ExperienceFormData>,
    defaultValues: {
      company: '',
      position: '',
      industry: '',
      type: WorkTypeEnum.EMPLOYEE,
      commitment: WorkCommitmentEnum.FULL_TIME,
      startDate: '',
      endDate: '',
      currentlyWorking: false,
      description: '',
      skills: [],
      achievements: '',
      responsibilities: '',
    },
  });

  const {
    register,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = form;

  const startDateWatch = watch('startDate');
  const endDateWatch = watch('endDate');

  const [, setStartCalendarMonth] = React.useState<Date | undefined>(
    startDateWatch ? new Date(startDateWatch) : undefined
  );
  const [, setEndCalendarMonth] = React.useState<Date | undefined>(
    endDateWatch ? new Date(endDateWatch) : undefined
  );

  // Helper function to format date to YYYY-MM-DD without timezone issues
  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (isOpen) {
      if (experience) {
        // Editing existing experience - populate with experience data
        setValue('company', experience.company);
        setValue('position', experience.position);
        setValue('industry', experience.industry);
        setValue('type', experience.type);
        setValue('commitment', experience.commitment);
        setValue(
          'startDate',
          experience.startDate
            ? formatDateForInput(new Date(experience.startDate))
            : ''
        );
        setValue(
          'endDate',
          experience.endDate
            ? formatDateForInput(new Date(experience.endDate))
            : ''
        );
        setValue(
          'currentlyWorking',
          experience.currentlyWorking ? experience.currentlyWorking : false
        );
        setValue('description', experience.description);
        setValue(
          'skills',
          experience.skills ? experience.skills.map(parseSkillString) : []
        );
        setValue('achievements', experience.achievements?.join('\n') || '');
        setValue(
          'responsibilities',
          experience.responsibilities?.join('\n') || ''
        );
        setStartCalendarMonth(
          experience.startDate ? new Date(experience.startDate) : undefined
        );
        setEndCalendarMonth(
          experience.endDate ? new Date(experience.endDate) : undefined
        );
      } else {
        // Adding new experience - reset to default values
        reset({
          company: '',
          position: '',
          industry: '',
          type: WorkTypeEnum.EMPLOYEE,
          commitment: WorkCommitmentEnum.FULL_TIME,
          startDate: '',
          endDate: '',
          currentlyWorking: false,
          description: '',
          skills: [],
          achievements: '',
          responsibilities: '',
        });
        setStartCalendarMonth(undefined);
        setEndCalendarMonth(undefined);
      }
    }
  }, [isOpen, experience, setValue, reset]);

  // Helper function to create date without timezone issues
  const createLocalDate = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day); // month is 0-indexed in Date constructor
  };

  const onFormSubmit = form.handleSubmit(async (data) => {
    try {
      const experienceData: IResumeExperienceCreate = {
        company: data.company,
        position: data.position,
        industry: data.industry,
        type: data.type,
        commitment: data.commitment,
        startDate: createLocalDate(data.startDate),
        endDate: data.currentlyWorking
          ? undefined
          : data.endDate
            ? createLocalDate(data.endDate)
            : undefined,
        currentlyWorking: data.currentlyWorking,
        description: data.description || '',
        skills: formatSkills(data.skills),
        achievements: data.achievements?.split('\n').filter(Boolean) || [],
        responsibilities:
          data.responsibilities?.split('\n').filter(Boolean) || [],
      };
      await onSubmit(experienceData);
      reset();
      onClose();
    } catch (error) {
      logger.error('Error submitting form:', { error });
    }
  });

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
              <Briefcase className="h-5 w-5" />
              {experience ? 'Edit Experience' : 'Add Experience'}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground mt-1 text-sm">
              {experience
                ? 'Update your work experience details'
                : 'Add a new work experience to your profile'}
            </DialogDescription>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <form onSubmit={onFormSubmit} className="space-y-8">
              {/* Company Information Section */}
              <div className="space-y-4">
                <div className="text-foreground flex items-center gap-2 pb-4">
                  <Building2 className="text-muted-foreground h-7 w-8" />
                  <div>
                    <h3 className="text-foreground text-lg font-semibold">
                      Company Information
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Add the company you worked at and the position you held.
                    </p>
                  </div>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Company Name Dropdown */}
                  <div>
                    <Label
                      htmlFor="company"
                      className="text-foreground mb-1 block text-sm font-medium"
                    >
                      Company Name
                    </Label>
                    <Input
                      id="company"
                      {...register('company')}
                      className={errors.company ? 'border-destructive' : ''}
                      placeholder="Enter company name"
                    />
                    {errors.company && (
                      <p className="text-destructive mt-0.5 text-xs">
                        {errors.company.message}
                      </p>
                    )}
                  </div>

                  {/* Position Dropdown */}
                  <div>
                    <Label
                      htmlFor="position"
                      className="text-foreground mb-1 block text-sm font-medium"
                    >
                      Position
                    </Label>
                    <Input
                      id="position"
                      {...register('position')}
                      className={errors.position ? 'border-destructive' : ''}
                      placeholder="Enter position"
                    />
                    {errors.position && (
                      <p className="text-destructive mt-0.5 text-xs">
                        {errors.position.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Role Details Section */}
              <div className="space-y-4">
                <div className="text-foreground flex items-center gap-2 pb-4">
                  <Workflow className="text-muted-foreground h-7 w-8" />
                  <div>
                    <h3 className="text-foreground text-lg font-semibold">
                      Role Details
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Add the industry you worked in and the type of work you
                      did.
                    </p>
                  </div>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <Label
                      htmlFor="industry"
                      className="text-foreground mb-1 flex items-center gap-2 text-sm font-medium"
                    >
                      <Building2 className="text-muted-foreground h-4 w-4" />
                      Industry
                    </Label>
                    <Select
                      value={watch('industry')}
                      onValueChange={(value) => setValue('industry', value)}
                    >
                      <SelectTrigger
                        className={errors.industry ? 'border-destructive' : ''}
                      >
                        <SelectValue placeholder="Select industry" />
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
                    {errors.industry && (
                      <p className="text-destructive mt-0.5 text-xs">
                        {errors.industry.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label
                      htmlFor="type"
                      className="text-foreground mb-1 flex items-center gap-2 text-sm font-medium"
                    >
                      <Briefcase className="text-muted-foreground h-4 w-4" />
                      Experience Type
                    </Label>
                    <Select
                      value={watch('type')}
                      onValueChange={(value) =>
                        setValue('type', value as WorkTypeEnum)
                      }
                    >
                      <SelectTrigger
                        className={errors.type ? 'border-destructive' : ''}
                      >
                        <SelectValue placeholder="Select experience type" />
                      </SelectTrigger>
                      <SelectContent>
                        {workTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type
                              .replace(/_/g, ' ')
                              .toLowerCase()
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.type && (
                      <p className="text-destructive mt-0.5 text-xs">
                        {errors.type.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label
                      htmlFor="commitment"
                      className="text-foreground mb-1 flex items-center gap-2 text-sm font-medium"
                    >
                      <Workflow className="text-muted-foreground h-4 w-4" />
                      Work Commitment
                    </Label>
                    <Select
                      value={watch('commitment')}
                      onValueChange={(value) =>
                        setValue('commitment', value as WorkCommitmentEnum)
                      }
                    >
                      <SelectTrigger
                        className={
                          errors.commitment ? 'border-destructive' : ''
                        }
                      >
                        <SelectValue placeholder="Select work commitment" />
                      </SelectTrigger>
                      <SelectContent>
                        {workCommitments.map((commitment) => (
                          <SelectItem key={commitment} value={commitment}>
                            {commitment
                              .replace(/_/g, ' ')
                              .toLowerCase()
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.commitment && (
                      <p className="text-destructive mt-0.5 text-xs">
                        {errors.commitment.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Duration Section */}
              <div className="space-y-4">
                <div className="text-foreground flex items-center justify-between pb-4">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="text-muted-foreground h-7 w-8" />
                    <div>
                      <h3 className="text-foreground text-lg font-semibold">
                        Duration
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Add the start and end date of your work experience.
                      </p>
                    </div>
                  </div>
                  {/* Currently Working Toggle */}
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="currentlyWorking" className="text-sm">
                      Currently Working
                    </Label>
                    <Switch
                      id="currentlyWorking"
                      checked={watch('currentlyWorking')}
                      onCheckedChange={(checked) => {
                        setValue('currentlyWorking', checked);
                        if (checked) {
                          const today = formatDateForInput(new Date());
                          setValue('endDate', today);
                          setEndCalendarMonth(new Date());
                        } else {
                          setValue('endDate', undefined);
                        }
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  {/* Date Fields */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label
                        htmlFor="startDate"
                        className="text-foreground mb-1 flex items-center gap-2 text-sm font-medium"
                      >
                        <CalendarDays className="text-muted-foreground h-4 w-4" />
                        Start Date
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
                          setStartCalendarMonth(date);
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
                        className="text-foreground mb-1 flex items-center gap-2 text-sm font-medium"
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
                          setEndCalendarMonth(date);
                        }}
                        placeholder="Select end date"
                        minDate={
                          startDateWatch
                            ? new Date(startDateWatch as string)
                            : new Date(1900, 0, 1)
                        }
                        maxDate={new Date()}
                        disabled={watch('currentlyWorking')}
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
              </div>

              {/* Description Section */}
              <div className="space-y-4">
                <div className="text-foreground flex items-center gap-2 pb-4">
                  <FileText className="text-muted-foreground h-7 w-8" />
                  <div>
                    <h3 className="text-foreground text-lg font-semibold">
                      Description
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Add a description of your work experience.
                    </p>
                  </div>
                </div>
                <div>
                  <Textarea
                    {...register('description')}
                    placeholder="Describe your key responsibilities, achievements, and impact in this role"
                    rows={6}
                    className="resize-none"
                  />
                  <p className="text-muted-foreground mt-2 text-sm">
                    Include specific examples of your work, metrics, and
                    outcomes
                  </p>
                  {errors.description && (
                    <p className="text-destructive mt-1 text-sm">
                      {errors.description.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="mb-2 block text-sm font-medium">
                    Responsibilities
                  </Label>
                  <Textarea
                    {...register('responsibilities')}
                    placeholder="Enter responsibilities (one per line)"
                    rows={4}
                    className="resize-none"
                  />
                  <p className="text-muted-foreground mt-2 text-sm">
                    List your key responsibilities, one per line
                  </p>
                  {errors.responsibilities && (
                    <p className="text-destructive mt-1 text-sm">
                      {errors.responsibilities.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="mb-2 block text-sm font-medium">
                    Skills
                  </Label>
                  <SkillSelector
                    value={watch('skills')}
                    onChange={(skills) => setValue('skills', skills)}
                    error={errors.skills?.message}
                  />
                  <p className="text-muted-foreground mt-2 text-sm">
                    Add your skills with their experience levels and years of
                    experience.
                  </p>
                </div>

                <div>
                  <Label className="mb-2 block text-sm font-medium">
                    Achievements
                  </Label>
                  <Textarea
                    {...register('achievements')}
                    placeholder="Enter achievements (one per line)"
                    rows={4}
                    className="resize-none"
                  />
                  <p className="text-muted-foreground mt-2 text-sm">
                    List your key achievements, one per line
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
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                onClick={onFormSubmit}
                className="cursor-pointer"
              >
                {experience ? 'Update Experience' : 'Add Experience'}
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

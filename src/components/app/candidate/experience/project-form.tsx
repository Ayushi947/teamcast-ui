'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { DatePickerCalendar } from '@/components/ui/date-picker-calendar';
import { Briefcase, FileText, ListChecks, CalendarDays } from 'lucide-react';
import {
  IResumeProject,
  IResumeProjectCreate,
  IResumeExperience,
  logger,
} from '@/lib/shared';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Resolver } from 'react-hook-form';
import { useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { SkillSelector, type Skill } from '@/components/ui/skill-selector';
import React from 'react';

// Create a function that returns the schema with experience validation
const noConsecutiveSpecialChars = (val?: string) =>
  !val || !/[^a-zA-Z0-9\s]{3,}/.test(val);

const noMoreThan5ConsecutiveNumbers = (val?: string) =>
  !val || !/\d{6,}/.test(val);

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

export const createProjectSchema = (experience?: IResumeExperience) =>
  z
    .object({
      name: z
        .string()
        .min(1, 'Project name is required')
        .regex(
          /^(?!.*[^A-Za-z0-9\s]{3,}).*$/,
          'Project name should not contain more than 2 consecutive special characters'
        )
        .refine(
          (val) => !/\d{3,}/.test(val),
          'Project name should not contain more than 2 consecutive numbers'
        ),

      role: z
        .string()
        .min(1, 'Role is required')
        .max(100, 'Role cannot exceed 100 characters')
        .regex(/^[A-Za-z\s]+$/, 'Role should only contain letters and spaces'),

      startDate: z.string().min(1, 'Start date is required'),
      endDate: z.string().optional(),
      currentlyWorking: z.boolean().default(false),

      description: z
        .string()
        .min(10, 'Description must be at least 10 characters')
        .refine(
          noConsecutiveSpecialChars,
          'Description should not contain more than 2 consecutive special characters'
        )
        .refine(
          noMoreThan5ConsecutiveNumbers,
          'Description should not contain more than 5 consecutive numbers'
        ),

      responsibilities: z
        .string()
        .optional()
        .refine(
          noConsecutiveSpecialChars,
          'Responsibilities should not contain more than 2 consecutive special characters'
        )
        .refine(
          noMoreThan5ConsecutiveNumbers,
          'Responsibilities should not contain more than 5 consecutive numbers'
        ),

      achievements: z
        .string()
        .optional()
        .refine(
          noConsecutiveSpecialChars,
          'Achievements should not contain more than 2 consecutive special characters'
        )
        .refine(
          noMoreThan5ConsecutiveNumbers,
          'Achievements should not contain more than 5 consecutive numbers'
        ),

      challenges: z
        .string()
        .optional()
        .refine(
          noConsecutiveSpecialChars,
          'Challenges should not contain more than 2 consecutive special characters'
        )
        .refine(
          noMoreThan5ConsecutiveNumbers,
          'Challenges should not contain more than 5 consecutive numbers'
        ),

      solutions: z
        .string()
        .optional()
        .refine(
          noConsecutiveSpecialChars,
          'Solutions should not contain more than 2 consecutive special characters'
        )
        .refine(
          noMoreThan5ConsecutiveNumbers,
          'Solutions should not contain more than 5 consecutive numbers'
        ),

      impact: z
        .string()
        .optional()
        .refine(
          noConsecutiveSpecialChars,
          'Impact should not contain more than 2 consecutive special characters'
        )
        .refine(
          noMoreThan5ConsecutiveNumbers,
          'Impact should not contain more than 5 consecutive numbers'
        ),

      skills: z.array(z.custom<Skill>()).default([]),
    })

    // ✅ End date >= start date
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

    // ✅ Project end date <= experience end date
    .refine(
      (data) => {
        if (!experience || data.currentlyWorking) return true;
        if (!data.endDate) return true;

        const projectEndDate = new Date(data.endDate);
        const experienceEndDate = experience.currentlyWorking
          ? new Date()
          : experience.endDate
            ? new Date(experience.endDate)
            : new Date();

        return projectEndDate <= experienceEndDate;
      },
      {
        message: experience?.currentlyWorking
          ? 'Project end date cannot be in the future for current experience'
          : 'Project end date cannot be after experience end date',
        path: ['endDate'],
      }
    )

    // ✅ Project start date >= experience start date
    .refine(
      (data) => {
        if (!experience) return true;

        const projectStartDate = new Date(data.startDate);
        const experienceStartDate = new Date(experience.startDate);

        return projectStartDate >= experienceStartDate;
      },
      {
        message: 'Project start date cannot be before experience start date',
        path: ['startDate'],
      }
    );

type ProjectFormData = z.infer<ReturnType<typeof createProjectSchema>>;

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

interface ProjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: IResumeProjectCreate) => Promise<void>;
  project?: IResumeProject;
  experience?: IResumeExperience;
}

export function ProjectForm({
  isOpen,
  onClose,
  onSubmit,
  project,
  experience,
}: ProjectFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(
      createProjectSchema(experience)
    ) as Resolver<ProjectFormData>,
    defaultValues: {
      name: '',
      role: '',
      startDate: '',
      endDate: '',
      currentlyWorking: false,
      description: '',
      responsibilities: '',
      achievements: '',
      challenges: '',
      solutions: '',
      impact: '',
      skills: [],
    },
  });

  const startDateWatch = watch('startDate');
  const endDateWatch = watch('endDate');

  useEffect(() => {
    if (isOpen) {
      if (project) {
        // Editing existing project - populate with project data
        setValue('name', project.name);
        setValue('role', project.role);
        setValue(
          'startDate',
          project.startDate
            ? formatDateForInput(new Date(project.startDate))
            : ''
        );
        setValue(
          'endDate',
          project.endDate ? formatDateForInput(new Date(project.endDate)) : ''
        );
        setValue(
          'currentlyWorking',
          project.currentlyWorking ? project.currentlyWorking : false
        );
        setValue('description', project.description);
        setValue('responsibilities', project.responsibilities.join('\n'));
        setValue('achievements', project.achievements.join('\n'));
        setValue('challenges', project.challenges.join('\n'));
        setValue('solutions', project.solutions.join('\n'));
        setValue('impact', project.impact.join('\n'));
        setValue(
          'skills',
          project.skills ? project.skills.map(parseSkillString) : []
        );
      } else {
        // Adding new project - reset to default values
        reset({
          name: '',
          role: '',
          startDate: '',
          endDate: '',
          currentlyWorking: false, // Always false for projects when experience is completed
          description: '',
          responsibilities: '',
          achievements: '',
          challenges: '',
          solutions: '',
          impact: '',
          skills: [],
        });
      }
    }
  }, [isOpen, project, setValue, reset]);

  const handleFormSubmit = async (data: ProjectFormData) => {
    try {
      const projectData: IResumeProjectCreate = {
        ...data,
        startDate: createLocalDate(data.startDate),
        endDate: data.currentlyWorking
          ? undefined
          : data.endDate
            ? createLocalDate(data.endDate)
            : undefined,
        responsibilities:
          data.responsibilities?.split('\n').filter(Boolean) || [],
        challenges: data.challenges?.split('\n').filter(Boolean) || [],
        solutions: data.solutions?.split('\n').filter(Boolean) || [],
        impact: data.impact?.split('\n').filter(Boolean) || [],
        achievements: data.achievements?.split('\n').filter(Boolean) || [],
        skills: formatSkills(data.skills),
        ...(project?.id && { id: project.id }),
      };
      await onSubmit(projectData);
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
              <Briefcase className="h-5 w-5" />
              {project ? 'Edit Project' : 'Add Project'}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground mt-1 text-sm">
              {project
                ? 'Update your project details'
                : 'Add a new project to your experience'}
            </DialogDescription>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <form
              onSubmit={handleSubmit(handleFormSubmit)}
              className="space-y-8"
            >
              {/* Basic Information Section */}
              <div className="space-y-4">
                <div className="text-foreground flex items-center gap-2 pb-4">
                  <Briefcase className="text-muted-foreground h-7 w-8" />
                  <div>
                    <h3 className="text-foreground text-lg font-semibold">
                      Project Information
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Add the project you worked on and the position you held.
                    </p>
                  </div>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <Label className="mb-2 block text-sm font-medium">
                      Project Name
                    </Label>
                    <Input
                      {...register('name')}
                      placeholder="Enter project name"
                      className="h-10"
                    />
                    {errors.name && (
                      <p className="text-destructive mt-1 text-sm">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="mb-2 block text-sm font-medium">
                      Your Role
                    </Label>
                    <Input
                      {...register('role')}
                      placeholder="Enter your role in the project"
                      className="h-10"
                    />
                    {errors.role && (
                      <p className="text-destructive mt-1 text-sm">
                        {errors.role.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Duration Section */}
              <div className="space-y-4">
                <div className="text-foreground flex items-center justify-between pb-4">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="text-muted-foreground h-7 w-8" />
                    <div>
                      <h3 className="text-foreground text-lg font-semibold">
                        Duration
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Add the start and end date of your project.
                      </p>
                    </div>
                  </div>
                  {/* Currently Working Switch - only show if experience is currently working */}
                  {experience?.currentlyWorking && (
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
                          } else {
                            setValue('endDate', undefined);
                          }
                        }}
                      />
                    </div>
                  )}
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
                        }}
                        placeholder="Select start date"
                        minDate={
                          experience
                            ? new Date(experience.startDate)
                            : new Date(1900, 0, 1)
                        }
                        maxDate={
                          experience &&
                          experience.endDate &&
                          !experience.currentlyWorking
                            ? new Date(experience.endDate)
                            : new Date()
                        }
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
                        }}
                        placeholder="Select end date"
                        minDate={
                          startDateWatch
                            ? new Date(startDateWatch as string)
                            : experience
                              ? new Date(experience.startDate)
                              : new Date(1900, 0, 1)
                        }
                        maxDate={
                          experience &&
                          experience.endDate &&
                          !experience.currentlyWorking
                            ? new Date(experience.endDate)
                            : new Date()
                        }
                        disabled={
                          experience?.currentlyWorking
                            ? watch('currentlyWorking')
                            : false
                        }
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
                      Project Description
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Add a description of the project and its goals.
                    </p>
                  </div>
                </div>
                <div>
                  <Label className="mb-2 block text-sm font-medium">
                    Project Overview
                  </Label>
                  <Textarea
                    {...register('description')}
                    placeholder="Describe the project and its goals"
                    rows={4}
                    className="resize-none"
                  />
                  <p className="text-muted-foreground mt-2 text-sm">
                    Provide a clear overview of the project&apos;s purpose and
                    objectives
                  </p>
                  {errors.description && (
                    <p className="text-destructive mt-1 text-sm">
                      {errors.description.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Project Details Section */}
              <div className="space-y-4">
                <div className="text-foreground flex items-center gap-2 pb-4">
                  <ListChecks className="text-muted-foreground h-7 w-8" />
                  <div>
                    <h3 className="text-foreground text-lg font-semibold">
                      Project Details
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Add the responsibilities, challenges, solutions, and
                      impact of the project.
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Skills */}
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

                  {/* Responsibilities */}
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
                    {errors.responsibilities && (
                      <p className="text-destructive mt-1 text-sm">
                        {errors.responsibilities.message}
                      </p>
                    )}
                  </div>

                  {/* Achievements */}
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
                    {errors.achievements && (
                      <p className="text-destructive mt-1 text-sm">
                        {errors.achievements.message}
                      </p>
                    )}
                  </div>

                  {/* Challenges */}
                  <div>
                    <Label className="mb-2 block text-sm font-medium">
                      Challenges
                    </Label>
                    <Textarea
                      {...register('challenges')}
                      placeholder="Enter challenges (one per line)"
                      rows={4}
                      className="resize-none"
                    />
                    {errors.challenges && (
                      <p className="text-destructive mt-1 text-sm">
                        {errors.challenges.message}
                      </p>
                    )}
                  </div>

                  {/* Solutions */}
                  <div>
                    <Label className="mb-2 block text-sm font-medium">
                      Solutions
                    </Label>
                    <Textarea
                      {...register('solutions')}
                      placeholder="Enter solutions (one per line)"
                      rows={4}
                      className="resize-none"
                    />
                    {errors.solutions && (
                      <p className="text-destructive mt-1 text-sm">
                        {errors.solutions.message}
                      </p>
                    )}
                  </div>

                  {/* Impact */}
                  <div>
                    <Label className="mb-2 block text-sm font-medium">
                      Impact
                    </Label>
                    <Textarea
                      {...register('impact')}
                      placeholder="Enter impact (one per line)"
                      rows={4}
                      className="resize-none"
                    />
                    {errors.impact && (
                      <p className="text-destructive mt-1 text-sm">
                        {errors.impact.message}
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
              <Button type="submit" onClick={handleSubmit(handleFormSubmit)}>
                {project ? 'Update Project' : 'Add Project'}
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

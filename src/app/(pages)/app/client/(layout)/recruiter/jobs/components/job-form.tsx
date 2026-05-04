'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  Building2,
  Calendar as CalendarIcon,
  DollarSign,
  Plus,
  X,
  Users,
  CheckCircle2,
  FileText,
  XCircle,
} from 'lucide-react';
import {
  IClientJobPosting,
  IClientJobPostingCreate,
  IClientJobPostingUpdate,
  WorkTypeEnum,
  WorkCommitmentEnum,
  WorkScheduleEnum,
  CompanyIndustryEnum,
  JobPostingStatusEnum,
  logger,
} from '@/lib/shared';
import {
  activityLogService,
  clientJobPostingService,
} from '@/lib/services/services';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import * as z from 'zod';
import {
  loadParsedJDFormData,
  clearParsedJDData,
} from '@/lib/utils/jd-parser-utils';
import { useApp } from '@/lib/context/app-context';
import { ActivityChange } from '@/lib/hooks/use-activity-tracking';
import { ActivityActionEnums, ActivityTitleEnum } from '@/lib/models/activity';
import { ActivityEntityTypeEnum, ActivityModuleEnum } from '@/lib/shared';
import { useClientNotifications } from '@/lib/hooks/use-client-notifications';
import { ChangeEvent } from 'react';

// Helper function to format enum values
const formatEnumValue = (value: string) => {
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const jobFormSchema = z
  .object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    jobType: z.nativeEnum(WorkTypeEnum),
    jobCommitment: z.nativeEnum(WorkCommitmentEnum),
    jobSchedule: z.nativeEnum(WorkScheduleEnum),
    industry: z.nativeEnum(CompanyIndustryEnum),
    totalExperience: z
      .number()
      .min(0, 'Total experience must be a positive number'),
    department: z
      .string()
      .min(2, 'Department must be at least 2 characters long'),
    teamSize: z.number().optional(),
    reportingTo: z.string().optional(),
    hiring_manager_email: z
      .string()
      .email('Please enter a valid email address')
      .optional()
      .or(z.literal('')),
    status: z.nativeEnum(JobPostingStatusEnum),
    applicationDeadline: z.date().optional(),
    availableFrom: z.date().optional(),
    numberOfOpenings: z.number().min(1, 'At least one opening is required'),
    applicationUrl: z.string().url().optional().or(z.literal('')),
    isFeatured: z.boolean(),
    minSalary: z.number().min(0, 'Minimum salary must be a positive number'),
    maxSalary: z.number().min(0, 'Maximum salary must be a positive number'),
    salaryCurrency: z.string().min(1, 'Salary currency is required'),
    equity: z.boolean(),
    responsibilities: z
      .array(z.string())
      .min(1, 'At least one responsibility is required'),
    benefits: z.array(z.string()).min(1, 'At least one benefit is required'),
    tags: z.array(z.string()).min(1, 'At least one tag is required'),
    isRemote: z.boolean(),
    requiredSkills: z
      .array(z.string())
      .min(1, 'At least one required skill is required'),
    preferredSkills: z.array(z.string()).optional(),
    preferredUniversities: z.array(z.string()).optional(),
    preferredDegrees: z.array(z.string()).optional(),
    preferredLocations: z.array(z.string()).optional(),
    preferredIndustries: z.array(z.string()).optional(),
  })
  .refine((data) => data.maxSalary > data.minSalary, {
    message: 'Maximum salary must be greater than minimum salary',
    path: ['maxSalary'],
  });

type JobFormValues = z.infer<typeof jobFormSchema>;

// Type for parsed job description data
interface ParsedJDData {
  title?: string;
  description?: string;
  jobType?: WorkTypeEnum;
  jobCommitment?: WorkCommitmentEnum;
  jobSchedule?: WorkScheduleEnum;
  industry?: CompanyIndustryEnum;
  totalExperience?: number;
  department?: string;
  teamSize?: number;
  reportingTo?: string;
  hiring_manager_email?: string;
  status?: JobPostingStatusEnum;
  numberOfOpenings?: number;
  applicationUrl?: string;
  isFeatured?: boolean;
  minSalary?: number;
  maxSalary?: number;
  salaryCurrency?: string;
  equity?: boolean;
  responsibilities?: string[];
  benefits?: string[];
  tags?: string[];
  isRemote?: boolean;
  requiredSkills?: string[];
  preferredSkills?: string[];
  preferredUniversities?: string[];
  preferredDegrees?: string[];
  preferredLocations?: string[];
  preferredIndustries?: string[];
}

// Type for array field names
type ArrayFieldName = Extract<
  keyof JobFormValues,
  | 'responsibilities'
  | 'benefits'
  | 'tags'
  | 'requiredSkills'
  | 'preferredSkills'
  | 'preferredUniversities'
  | 'preferredDegrees'
  | 'preferredLocations'
  | 'preferredIndustries'
>;

interface JobFormProps {
  job?: IClientJobPosting;
  onClose: () => void;
  onSuccess: () => void;
}

export function JobForm({ job, onClose, onSuccess }: JobFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [parsedJDData, setParsedJDData] = useState<ParsedJDData | null>(null);
  const { user } = useApp();
  const clientNotifications = useClientNotifications();

  useEffect(() => {
    if (!job) {
      const parsedData = loadParsedJDFormData();
      if (parsedData) {
        setParsedJDData(parsedData);
        toast.info('Form pre-filled with parsed job description data');
      }
    } else {
      setParsedJDData(null);
    }
  }, [job]);

  const getDefaultValue = <T,>(
    fieldName: keyof ParsedJDData,
    defaultValue: T
  ): T => {
    if (job) {
      const jobValue = job[fieldName as keyof IClientJobPosting];
      return jobValue !== undefined ? (jobValue as T) : defaultValue;
    }
    if (parsedJDData && parsedJDData[fieldName] !== undefined) {
      return parsedJDData[fieldName] as T;
    }
    return defaultValue;
  };

  const getFormDefaultValues = () => ({
    title: getDefaultValue('title', ''),
    description: getDefaultValue('description', ''),
    jobType: getDefaultValue('jobType', WorkTypeEnum.EMPLOYEE),
    jobCommitment: getDefaultValue(
      'jobCommitment',
      WorkCommitmentEnum.FULL_TIME
    ),
    jobSchedule: getDefaultValue('jobSchedule', WorkScheduleEnum.REGULAR),
    industry: getDefaultValue('industry', CompanyIndustryEnum.TECHNOLOGY),
    totalExperience: getDefaultValue('totalExperience', 0),
    department: getDefaultValue('department', ''),
    teamSize: getDefaultValue('teamSize', undefined),
    reportingTo: getDefaultValue('reportingTo', ''),
    hiring_manager_email: getDefaultValue('hiring_manager_email', ''),
    status: getDefaultValue('status', JobPostingStatusEnum.DRAFT),
    applicationDeadline: job?.applicationDeadline
      ? new Date(job.applicationDeadline)
      : undefined,
    availableFrom: job?.availableFrom ? new Date(job.availableFrom) : undefined,
    numberOfOpenings: getDefaultValue('numberOfOpenings', 1),
    applicationUrl: getDefaultValue('applicationUrl', ''),
    isFeatured: getDefaultValue('isFeatured', false),
    minSalary: getDefaultValue('minSalary', 0),
    maxSalary: getDefaultValue('maxSalary', 0),
    salaryCurrency: getDefaultValue('salaryCurrency', 'USD'),
    equity: getDefaultValue('equity', false),
    responsibilities: getDefaultValue('responsibilities', ['']),
    benefits: getDefaultValue('benefits', ['']),
    tags: getDefaultValue('tags', []),
    isRemote: getDefaultValue('isRemote', false),
    requiredSkills: getDefaultValue('requiredSkills', ['']),
    preferredSkills: getDefaultValue('preferredSkills', []),
    preferredUniversities: getDefaultValue('preferredUniversities', []),
    preferredDegrees: getDefaultValue('preferredDegrees', []),
    preferredLocations: getDefaultValue('preferredLocations', []),
    preferredIndustries: getDefaultValue('preferredIndustries', []),
  });

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: getFormDefaultValues(),
  });

  useEffect(() => {
    form.reset(getFormDefaultValues());
  }, [job, parsedJDData]);

  const onSubmit = async (data: JobFormValues) => {
    try {
      setIsSubmitting(true);
      const jobData = {
        ...data,
        applicationDeadline: data.applicationDeadline?.toISOString(),
        availableFrom: data.availableFrom?.toISOString(),
      } as IClientJobPostingCreate | IClientJobPostingUpdate;

      let jobId = '';

      if (job) {
        // Update existing job
        await clientJobPostingService.updateJobPosting(
          job.id,
          jobData as IClientJobPostingUpdate
        );
        jobId = job.id;

        // Track job update activity
        if (user?.id) {
          // Collect changes for activity log
          const changes: ActivityChange[] = [];

          // Compare original values with new values for key fields
          if (job.title !== data.title) {
            changes.push({
              field: 'title',
              oldValue: job.title || '',
              newValue: data.title,
            });
          }

          if (job.description !== data.description) {
            changes.push({
              field: 'description',
              oldValue: job.description?.substring(0, 100) + '...' || '',
              newValue: data.description.substring(0, 100) + '...',
            });
          }

          if (job.status !== data.status) {
            changes.push({
              field: 'status',
              oldValue: formatEnumValue(job.status),
              newValue: formatEnumValue(data.status),
            });
          }

          if (
            job.minSalary !== data.minSalary ||
            job.maxSalary !== data.maxSalary
          ) {
            changes.push({
              field: 'salary range',
              oldValue: `${job.minSalary ?? 0}-${job.maxSalary ?? 0} ${job.salaryCurrency || 'USD'}`,
              newValue: `${data.minSalary}-${data.maxSalary} ${data.salaryCurrency}`,
            });
          }

          // Add department change if applicable
          if (job.department !== data.department) {
            changes.push({
              field: 'department',
              oldValue: job.department || '',
              newValue: data.department,
            });
          }

          // Add job type changes if applicable
          if (job.jobType !== data.jobType) {
            changes.push({
              field: 'job type',
              oldValue: formatEnumValue(job.jobType),
              newValue: formatEnumValue(data.jobType),
            });
          }

          // Only log if there are actual changes
          if (changes.length > 0) {
            await activityLogService.createActivityLog({
              module: ActivityModuleEnum.JOB,
              action: ActivityActionEnums.UPDATE,
              entityId: job.id,
              entityType: ActivityEntityTypeEnum.JOB_POSTING,
              description: `Job posting "${data.title}" was updated`,
              metadata: {
                userName: user?.name,
                title: ActivityTitleEnum.JOB_UPDATED,
                jobId: job.id,
                jobTitle: data.title,
                department: data.department,
                changes: changes,
                oldStatus: job.status,
                newStatus: data.status,
              },
            });
          }
        }
      } else {
        // Create new job
        const result = await clientJobPostingService.createJobPosting(
          jobData as IClientJobPostingCreate
        );
        jobId = result.id;
        clearParsedJDData();

        if (user?.id && jobId) {
          await activityLogService.createActivityLog({
            module: ActivityModuleEnum.JOB,
            action: ActivityActionEnums.CREATE,
            entityId: jobId,
            entityType: ActivityEntityTypeEnum.JOB_POSTING,
            description: `New job posting "${data.title}" was created`,
            metadata: {
              userName: user?.name,
              title: ActivityTitleEnum.JOB_CREATED,
              jobId: jobId,
              jobTitle: data.title,
              department: data.department,
              jobStatus: data.status,
              jobType: formatEnumValue(data.jobType),
              commitment: formatEnumValue(data.jobCommitment),
              isRemote: data.isRemote ? 'Remote' : 'On-site',
              experience: `${data.totalExperience} years`,
              salary: `${data.minSalary}-${data.maxSalary} ${data.salaryCurrency}`,
            },
          });

          // Send notification for job creation
          if (data.status === JobPostingStatusEnum.PUBLISHED) {
            clientNotifications.jobPosted(user.id, data.title);
          }
        }
      }

      onSuccess();
      toast.success(`Job posting ${job ? 'updated' : 'created'} successfully.`);
    } catch (error) {
      logger.error('Error saving job:', error);
      toast.error(
        `Failed to ${job ? 'update' : 'create'} job posting. Please try again.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const formSteps = [
    {
      title: 'Basic Information',
      description: 'Enter the basic job details',
      icon: Building2,
      fields: [
        ['title', 'department'],
        ['description'],
        ['status', 'isFeatured'],
      ],
    },
    {
      title: 'Job Details',
      description: 'Specify job requirements and conditions',
      icon: Users,
      fields: [
        ['jobType', 'jobCommitment'],
        ['jobSchedule', 'industry'],
        ['totalExperience', 'teamSize'],
        ['reportingTo', 'hiring_manager_email'],
        ['numberOfOpenings', 'isRemote'],
      ],
    },
    {
      title: 'Compensation',
      description: 'Define salary and benefits',
      icon: DollarSign,
      fields: [
        ['minSalary', 'maxSalary'],
        ['salaryCurrency', 'equity'],
        ['benefits'],
      ],
    },
    {
      title: 'Requirements & Skills',
      description: 'Specify required and preferred qualifications',
      icon: CheckCircle2,
      fields: [
        ['requiredSkills'],
        ['preferredSkills'],
        ['preferredDegrees', 'preferredUniversities'],
        ['preferredLocations', 'preferredIndustries'],
      ],
    },
    {
      title: 'Additional Details',
      description: 'Add responsibilities and other details',
      icon: CalendarIcon,
      fields: [
        ['responsibilities'],
        ['tags'],
        ['applicationUrl'],
        ['applicationDeadline', 'availableFrom'],
      ],
    },
  ];

  const currentStepFields = formSteps[currentStep].fields;
  const StepIcon = formSteps[currentStep].icon;

  const addArrayField = (fieldName: ArrayFieldName) => {
    const currentValues = form.getValues(fieldName) as string[];
    form.setValue(fieldName, [...currentValues, '']);
  };

  const removeArrayField = (fieldName: ArrayFieldName, index: number) => {
    const currentValues = form.getValues(fieldName) as string[];
    if (currentValues.length > 1) {
      form.setValue(
        fieldName,
        currentValues.filter((_, i) => i !== index)
      );
    }
  };

  const renderField = (fieldName: keyof JobFormValues) => {
    switch (fieldName) {
      case 'title':
      case 'department':
      case 'reportingTo':
      case 'hiring_manager_email':
      case 'applicationUrl':
        return (
          <FormField
            key={fieldName}
            control={form.control}
            name={fieldName}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="capitalize">
                  {fieldName.replace(/([A-Z])/g, ' $1').trim()}
                </FormLabel>
                <FormControl>
                  <Input {...field} className="w-full" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'description':
        return (
          <FormField
            key={fieldName}
            control={form.control}
            name={fieldName}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea {...field} className="min-h-[150px] resize-y" />
                </FormControl>
                <FormDescription>
                  Write a detailed description of the job role and
                  responsibilities.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'jobType':
      case 'jobCommitment':
      case 'jobSchedule':
      case 'industry':
      case 'status':
      case 'salaryCurrency': {
        const getFieldOptions = (field: string) => {
          switch (field) {
            case 'jobType':
              return Object.values(WorkTypeEnum);
            case 'jobCommitment':
              return Object.values(WorkCommitmentEnum);
            case 'jobSchedule':
              return Object.values(WorkScheduleEnum);
            case 'industry':
              return Object.values(CompanyIndustryEnum);
            case 'status':
              return Object.values(JobPostingStatusEnum);
            case 'salaryCurrency':
              return ['USD', 'EUR', 'GBP', 'INR'];
            default:
              return [];
          }
        };
        const options = getFieldOptions(fieldName);

        return (
          <FormField
            key={fieldName}
            control={form.control}
            name={fieldName}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="capitalize">
                  {fieldName.replace(/([A-Z])/g, ' $1').trim()}
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={`Select ${fieldName
                          .replace(/([A-Z])/g, ' $1')
                          .trim()
                          .toLowerCase()}`}
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {fieldName === 'status'
                      ? Object.values(JobPostingStatusEnum).map((value) => (
                          <SelectItem key={value} value={value}>
                            <div className="flex items-center gap-2">
                              {value === JobPostingStatusEnum.PUBLISHED && (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              )}
                              {value === JobPostingStatusEnum.DRAFT && (
                                <FileText className="h-4 w-4 text-gray-500" />
                              )}
                              {value === JobPostingStatusEnum.CLOSED && (
                                <XCircle className="h-4 w-4 text-red-500" />
                              )}
                              {formatEnumValue(value)}
                            </div>
                          </SelectItem>
                        ))
                      : options.map((value) => (
                          <SelectItem key={String(value)} value={String(value)}>
                            {fieldName === 'salaryCurrency'
                              ? value
                              : formatEnumValue(String(value))}
                          </SelectItem>
                        ))}
                  </SelectContent>
                </Select>
                {fieldName === 'status' && (
                  <FormDescription>
                    {field.value === JobPostingStatusEnum.PUBLISHED
                      ? 'Job is visible to candidates and accepting applications'
                      : field.value === JobPostingStatusEnum.DRAFT
                        ? 'Job is not visible to candidates'
                        : 'Job is no longer accepting applications'}
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );
      }

      case 'totalExperience':
      case 'teamSize':
      case 'numberOfOpenings':
      case 'minSalary':
      case 'maxSalary':
        return (
          <FormField
            key={fieldName}
            control={form.control}
            name={fieldName}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="capitalize">
                  {fieldName.replace(/([A-Z])/g, ' $1').trim()}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="number"
                      {...field}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        field.onChange(Number(e.target.value))
                      }
                      className={cn(
                        'w-full',
                        fieldName.includes('Salary') && 'pl-8'
                      )}
                      min={0}
                      step={fieldName.includes('Salary') ? 1000 : 1}
                    />
                    {fieldName.includes('Salary') && (
                      <DollarSign className="text-muted-foreground absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2" />
                    )}
                  </div>
                </FormControl>
                {fieldName.includes('Salary') && (
                  <FormDescription>
                    Enter amount in selected currency
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'applicationDeadline':
      case 'availableFrom':
        return (
          <FormField
            key={fieldName}
            control={form.control}
            name={fieldName}
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="capitalize">
                  {fieldName.replace(/([A-Z])/g, ' $1').trim()}
                </FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'w-full pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => {
                        if (fieldName === 'applicationDeadline') {
                          return (
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          );
                        }
                        return false;
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {fieldName === 'availableFrom' &&
                  field.value &&
                  new Date(field.value) < new Date() && (
                    <FormDescription className="text-yellow-600 dark:text-yellow-400">
                      Warning: Available from date is in the past
                    </FormDescription>
                  )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'isFeatured':
      case 'isRemote':
      case 'equity':
        return (
          <FormField
            key={fieldName}
            control={form.control}
            name={fieldName}
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    {fieldName === 'isFeatured'
                      ? 'Feature Job'
                      : fieldName === 'isRemote'
                        ? 'Remote Work'
                        : 'Equity Offered'}
                  </FormLabel>
                  <FormDescription>
                    {fieldName === 'isFeatured'
                      ? 'Feature this job posting to increase visibility'
                      : fieldName === 'isRemote'
                        ? 'Allow remote work for this position'
                        : 'Offer equity compensation'}
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        );

      case 'responsibilities':
      case 'benefits':
      case 'tags':
      case 'requiredSkills':
      case 'preferredSkills':
      case 'preferredUniversities':
      case 'preferredDegrees':
      case 'preferredLocations':
      case 'preferredIndustries':
        return (
          <FormField
            key={fieldName}
            control={form.control}
            name={fieldName}
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="capitalize">
                  {fieldName.replace(/([A-Z])/g, ' $1').trim()}
                </FormLabel>
                <div className="space-y-2">
                  <div className="grid gap-2">
                    {(field.value as string[]).map((value, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <FormControl>
                          <Input
                            value={value}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                              const newValues = [...(field.value as string[])];
                              newValues[index] = e.target.value;
                              field.onChange(newValues);
                            }}
                            className="w-full"
                            placeholder={`Enter ${fieldName
                              .replace(/([A-Z])/g, ' $1')
                              .trim()
                              .toLowerCase()}`}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeArrayField(fieldName, index)}
                          className="shrink-0"
                          disabled={(field.value as string[]).length <= 1}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addArrayField(fieldName)}
                    className="w-full"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add {fieldName.replace(/([A-Z])/g, ' $1').trim()}
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            {StepIcon && <StepIcon className="text-muted-foreground h-5 w-5" />}
            <div>
              <h3 className="text-lg font-semibold tracking-tight">
                {formSteps[currentStep].title}
              </h3>
              <p className="text-muted-foreground text-sm">
                {formSteps[currentStep].description}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {formSteps.map((_step, index) => (
              <Badge
                key={index}
                variant={currentStep === index ? 'default' : 'outline'}
                className={cn(
                  'cursor-pointer transition-colors',
                  currentStep === index
                    ? 'hover:bg-primary/80'
                    : 'hover:bg-muted'
                )}
                onClick={() => setCurrentStep(index)}
              >
                {index + 1}
              </Badge>
            ))}
          </div>
        </div>

        <div className="mx-auto max-w-5xl space-y-8">
          {currentStepFields.map((fieldRow, rowIndex) => (
            <div
              key={rowIndex}
              className={cn(
                'grid gap-6',
                fieldRow.length > 1
                  ? 'grid-cols-1 md:grid-cols-2'
                  : 'grid-cols-1'
              )}
            >
              {fieldRow.map((fieldName) => (
                <div
                  key={fieldName}
                  className="animate-in fade-in-50 duration-500"
                >
                  {renderField(fieldName as keyof JobFormValues)}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col-reverse items-center justify-between gap-4 border-t pt-6 sm:flex-row">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <div className="flex w-full gap-2 sm:w-auto">
            {currentStep > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                Previous
              </Button>
            )}
            {currentStep < formSteps.length - 1 ? (
              <Button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span>Saving...</span>
                  </div>
                ) : job ? (
                  'Update Job'
                ) : (
                  'Create Job'
                )}
              </Button>
            )}
          </div>
        </div>
      </form>
    </Form>
  );
}

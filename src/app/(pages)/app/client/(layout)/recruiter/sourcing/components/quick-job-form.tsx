'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
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
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Briefcase,
  Plus,
  X,
  Building2,
  MapPin,
  DollarSign,
  Lightbulb,
  Users,
  Target,
  Award,
  Clock,
  Star,
} from 'lucide-react';
import {
  WorkTypeEnum,
  WorkCommitmentEnum,
  WorkScheduleEnum,
  CompanyIndustryEnum,
  logger,
} from '@/lib/shared';
import { clientJobPostingService } from '@/lib/services/services';
import * as z from 'zod';

// Quick form schema with essential fields
const quickJobSchema = z
  .object({
    title: z.string().min(1, 'Title is required'),
    description: z
      .string()
      .min(50, 'Description must be at least 50 characters'),
    department: z.string().optional(),
    jobType: z.nativeEnum(WorkTypeEnum),
    jobCommitment: z.nativeEnum(WorkCommitmentEnum),
    industry: z.nativeEnum(CompanyIndustryEnum),
    totalExperience: z.number().min(0, 'Experience must be positive'),
    minSalary: z.number().min(0, 'Minimum salary is required'),
    maxSalary: z.number().min(0, 'Maximum salary is required'),
    salaryCurrency: z.string(),
    isRemote: z.boolean().optional(),
    numberOfOpenings: z.number().min(1, 'At least one opening required'),
    skills: z.array(z.string()).min(1, 'At least one skill required'),
  })
  .refine((data) => data.maxSalary > data.minSalary, {
    message: 'Maximum salary must be greater than minimum salary',
    path: ['maxSalary'],
  });

type QuickJobFormValues = z.infer<typeof quickJobSchema>;

interface QuickJobFormProps {
  onClose: () => void;
  onSuccess: () => void;
  job?: any;
}

const formatEnumValue = (value: string) => {
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const popularSkills = [
  'JavaScript',
  'React',
  'Node.js',
  'Python',
  'TypeScript',
  'AWS',
  'MongoDB',
  'PostgreSQL',
  'Docker',
  'Git',
  'CSS',
  'HTML',
];

export function QuickJobForm({ onClose, onSuccess, job }: QuickJobFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<QuickJobFormValues>({
    resolver: zodResolver(quickJobSchema),
    mode: 'onChange',
    defaultValues: {
      title: job?.title || '',
      description: job?.description || '',
      department: job?.department,
      jobType: job?.jobType || WorkTypeEnum.EMPLOYEE,
      jobCommitment: job?.jobCommitment || WorkCommitmentEnum.FULL_TIME,
      industry: job?.industry || CompanyIndustryEnum.TECHNOLOGY,
      totalExperience: job?.totalExperience || 2,
      minSalary: job?.minSalary || 50000,
      maxSalary: job?.maxSalary || 80000,
      salaryCurrency: job?.salaryCurrency || 'USD',
      isRemote: job?.isRemote,
      numberOfOpenings: job?.numberOfOpenings || 1,
      skills: job?.requiredSkills || [''],
    },
  });

  const addSkill = () => {
    const currentSkills = form.getValues('skills');
    form.setValue('skills', [...currentSkills, '']);
  };

  const removeSkill = (index: number) => {
    const currentSkills = form.getValues('skills');
    if (currentSkills.length > 1) {
      form.setValue(
        'skills',
        currentSkills.filter((_, i) => i !== index)
      );
    }
  };

  const addPopularSkill = (skill: string) => {
    const currentSkills = form.getValues('skills');
    if (!currentSkills.includes(skill)) {
      // Replace first empty skill or add new one
      const emptyIndex = currentSkills.findIndex((s) => !s.trim());
      if (emptyIndex !== -1) {
        const newSkills = [...currentSkills];
        newSkills[emptyIndex] = skill;
        form.setValue('skills', newSkills);
      } else {
        form.setValue('skills', [...currentSkills, skill]);
      }
    }
  };

  const onSubmit: SubmitHandler<QuickJobFormValues> = async (data) => {
    try {
      setIsSubmitting(true);

      // Auto-generate additional required fields
      const jobData = {
        ...data,
        jobSchedule: WorkScheduleEnum.REGULAR,
        responsibilities: [
          'Collaborate with cross-functional teams to deliver high-quality solutions',
          'Participate in code reviews and maintain coding standards',
          'Contribute to technical discussions and architectural decisions',
        ],
        benefits: [
          'Competitive salary and comprehensive benefits package',
          'Professional development opportunities',
          'Flexible work arrangements',
          'Health and wellness programs',
        ],
        tags: data.skills.filter((s) => s.trim()).slice(0, 5),
        requiredSkills: data.skills.filter((s) => s.trim()),
        preferredSkills: [],
        preferredUniversities: [],
        preferredDegrees: [],
        preferredLocations: [],
        preferredIndustries: [],
      };

      // Remove the skills field from data as it's moved to requiredSkills
      const { skills, ...finalData } = jobData;

      if (job) {
        await clientJobPostingService.updateJobPosting(
          job.id,
          finalData as any
        );
      } else {
        await clientJobPostingService.createJobPosting(finalData as any);
      }

      onSuccess();
      toast.success(`Job ${job ? 'updated' : 'created'} successfully!`);
    } catch (error) {
      logger.error('Error saving job:', error);
      toast.error(`Failed to ${job ? 'update' : 'create'} job posting`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl overflow-hidden rounded-xl bg-white shadow-xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Quick Job Posting</h2>
            <p className="mt-1 text-blue-100">
              Create a professional job posting in 2 minutes
            </p>
          </div>
          <div className="rounded-lg bg-white/20 px-4 py-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">~2 mins</span>
            </div>
          </div>
        </div>
      </div>

      <ScrollArea className="h-[70vh]">
        <Form {...form}>
          <div className="space-y-8 p-8">
            {/* Basic Information Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-gray-200 pb-3">
                <div className="rounded-lg bg-blue-100 p-2">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Basic Information
                  </h3>
                  <p className="text-sm text-gray-600">
                    Essential details about the position
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-sm font-semibold">
                          <Star className="h-4 w-4 text-amber-500" />
                          Job Title *
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Senior Software Engineer, Product Manager"
                            {...field}
                            className="h-12 border-gray-200 text-base focus:border-blue-500 focus:ring-blue-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-sm font-semibold">
                        <Building2 className="h-4 w-4 text-blue-600" />
                        Department
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Engineering, Marketing"
                          {...field}
                          className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="numberOfOpenings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-sm font-semibold">
                        <Users className="h-4 w-4 text-green-600" />
                        Positions Available *
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                          min={1}
                          className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
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
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">
                      Job Description *
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Describe the role, key responsibilities, and what success looks like in this position..."
                        className="min-h-[120px] resize-none border-gray-200 text-base focus:border-blue-500 focus:ring-blue-500"
                      />
                    </FormControl>
                    <FormDescription>
                      Minimum 50 characters. Be specific about the role and its
                      impact.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Job Specifications Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-gray-200 pb-3">
                <div className="rounded-lg bg-green-100 p-2">
                  <Target className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Job Specifications
                  </h3>
                  <p className="text-sm text-gray-600">
                    Work type and requirements
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="jobType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">
                        Job Type *
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(WorkTypeEnum).map((type) => (
                            <SelectItem key={type} value={type}>
                              {formatEnumValue(type)}
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
                  name="jobCommitment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">
                        Commitment *
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(WorkCommitmentEnum).map(
                            (commitment) => (
                              <SelectItem key={commitment} value={commitment}>
                                {formatEnumValue(commitment)}
                              </SelectItem>
                            )
                          )}
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
                      <FormLabel className="text-sm font-semibold">
                        Industry *
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(CompanyIndustryEnum).map(
                            (industry) => (
                              <SelectItem key={industry} value={industry}>
                                {formatEnumValue(industry)}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="totalExperience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">
                        Required Experience (Years) *
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                          min={0}
                          className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <FormField
                    control={form.control}
                    name="isRemote"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between space-y-0">
                        <div className="space-y-0.5">
                          <FormLabel className="flex items-center gap-2 text-base font-semibold">
                            <MapPin className="h-5 w-5 text-blue-600" />
                            Remote Work
                          </FormLabel>
                          <FormDescription className="text-sm">
                            Allow remote or hybrid work
                          </FormDescription>
                        </div>
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Compensation Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-gray-200 pb-3">
                <div className="rounded-lg bg-green-100 p-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Compensation
                  </h3>
                  <p className="text-sm text-gray-600">
                    Salary range and currency
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="minSalary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">
                        Minimum Salary *
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                          step={1000}
                          className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxSalary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">
                        Maximum Salary *
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                          step={1000}
                          className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="salaryCurrency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">
                        Currency *
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                          <SelectItem value="INR">INR</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Skills Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-gray-200 pb-3">
                <div className="rounded-lg bg-purple-100 p-2">
                  <Award className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Required Skills
                  </h3>
                  <p className="text-sm text-gray-600">
                    Essential skills and technologies
                  </p>
                </div>
              </div>

              <FormField
                control={form.control}
                name="skills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">
                      Skills *
                    </FormLabel>
                    <div className="space-y-4">
                      <div className="space-y-3">
                        {field.value.map((skill, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <FormControl>
                              <Input
                                value={skill}
                                onChange={(e) => {
                                  const newSkills = [...field.value];
                                  newSkills[index] = e.target.value;
                                  field.onChange(newSkills);
                                }}
                                placeholder="e.g. React, Node.js, Python"
                                className="h-11 flex-1 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                              />
                            </FormControl>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => removeSkill(index)}
                              disabled={field.value.length <= 1}
                              className="h-11 w-11 border-gray-200 hover:border-red-300 hover:bg-red-50"
                            >
                              <X className="h-4 w-4 text-gray-500 hover:text-red-500" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={addSkill}
                          className="h-11 w-full border-dashed border-gray-300 text-gray-600 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600"
                          size="sm"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Skill
                        </Button>
                      </div>

                      <div className="rounded-lg bg-gray-50 p-4">
                        <div className="mb-3 flex items-center gap-2">
                          <Lightbulb className="h-4 w-4 text-amber-500" />
                          <span className="text-sm font-medium text-gray-700">
                            Popular Skills
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {popularSkills.map((skill) => (
                            <Badge
                              key={skill}
                              variant="secondary"
                              className="cursor-pointer transition-colors hover:bg-blue-100 hover:text-blue-700"
                              onClick={() => addPopularSkill(skill)}
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </Form>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-gray-200 bg-gray-50 px-8 py-6">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="border-gray-300"
          >
            Cancel
          </Button>

          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="bg-blue-600 px-8 text-white hover:bg-blue-700"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span>Creating...</span>
              </div>
            ) : job ? (
              'Update Job'
            ) : (
              'Create Job Posting'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

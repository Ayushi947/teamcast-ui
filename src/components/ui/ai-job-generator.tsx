'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { LocationAutocomplete } from '@/components/ui/location-autocomplete';
import { cn } from '@/lib/utils';
import {
  Briefcase,
  DollarSign,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  X,
  HelpCircle,
  Zap,
  Target,
  Loader2,
} from 'lucide-react';
import {
  CURRENCY_CONFIGS,
  SALARY_UNITS,
  SalaryUnit,
  validateSalaryRange,
  getAvailableUnits,
  convertToBaseValue,
  convertFromBaseValue,
} from '@/lib/utils/currency-utils';

// Types and Constants
export interface AIJobData {
  jobTitle: string;
  location: string;
  remoteOption: boolean;
  experienceLevel: number;
  jobType: 'fulltime' | 'contract' | 'parttime';
  currency: string;
  minSalary: number;
  maxSalary: number;
  salaryUnit: SalaryUnit;
  requiredSkills: string[];
  preferredSkills: string[];
  industry: string;
  department: string;
  modeSpecific: boolean;
}

interface AIJobGeneratorProps {
  isGenerating: boolean;
  onGenerate: (data: AIJobData) => void;
  onReset: () => void;
}

const STEPS = [
  {
    id: 'basics',
    title: 'Job Basics',
    description: 'Title, location, and work arrangement',
    icon: Briefcase,
  },
  {
    id: 'details',
    title: 'Job Details',
    description: 'Experience, type, and industry',
    icon: Target,
  },
  {
    id: 'compensation',
    title: 'Compensation',
    description: 'Salary range and currency',
    icon: DollarSign,
  },
  {
    id: 'skills',
    title: 'Skills & Requirements',
    description: 'Required and preferred skills',
    icon: CheckCircle2,
  },
  {
    id: 'review',
    title: 'Review & Generate',
    description: 'Final review and AI generation',
    icon: Zap,
  },
];

const JOB_SUGGESTIONS = {
  'Software Engineer': ['JavaScript', 'React', 'Node.js', 'TypeScript'],
  'Product Manager': ['Product Strategy', 'Agile', 'Analytics', 'Roadmapping'],
  Designer: ['Figma', 'UI/UX', 'Design Systems', 'Prototyping'],
  'Data Scientist': ['Python', 'Machine Learning', 'SQL', 'Statistics'],
  'DevOps Engineer': ['AWS', 'Docker', 'Kubernetes', 'CI/CD'],
  'Marketing Manager': [
    'Digital Marketing',
    'Analytics',
    'Content Strategy',
    'SEO',
  ],
};

const COMMON_SKILLS = [
  'JavaScript',
  'React',
  'Node.js',
  'Python',
  'TypeScript',
  'AWS',
  'Docker',
  'SQL',
  'Git',
  'Agile',
  'REST APIs',
  'GraphQL',
  'MongoDB',
  'PostgreSQL',
  'CI/CD',
  'Kubernetes',
  'Machine Learning',
  'UI/UX',
  'Figma',
  'Analytics',
];

const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'E-commerce',
  'Manufacturing',
  'Consulting',
  'Media',
  'Real Estate',
  'Automotive',
];

const JOB_TYPES = [
  { value: 'fulltime', label: 'Full-Time', desc: 'Standard 40-hour work week' },
  { value: 'contract', label: 'Contract', desc: 'Project-based or temporary' },
  {
    value: 'parttime',
    label: 'Part-Time',
    desc: 'Less than 40 hours per week',
  },
];

const DEFAULT_FORM_DATA: AIJobData = {
  jobTitle: '',
  location: 'San Francisco, CA',
  remoteOption: true,
  experienceLevel: 3,
  jobType: 'fulltime',
  currency: 'USD',
  minSalary: 100000,
  maxSalary: 150000,
  salaryUnit: 'thousands',
  requiredSkills: [],
  preferredSkills: [],
  industry: 'Technology',
  department: '',
  modeSpecific: true,
};

// Custom Hooks
function useFormValidation(formData: AIJobData, currentStep: number) {
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [hasInteracted, setHasInteracted] = useState<Record<string, boolean>>(
    {}
  );

  useEffect(() => {
    const errors: Record<string, string> = {};

    if (currentStep >= 0) {
      if (!formData.jobTitle.trim() && hasInteracted.jobTitle) {
        errors.jobTitle = 'Job title is required';
      }
      if (!formData.location.trim() && hasInteracted.location) {
        errors.location = 'Location is required';
      }
    }

    if (currentStep >= 2) {
      const salaryValidation = validateSalaryRange(
        formData.minSalary,
        formData.maxSalary,
        formData.currency
      );
      if (!salaryValidation.isValid && hasInteracted.salary) {
        errors.salary = salaryValidation.error || 'Invalid salary range';
      }
    }

    if (currentStep >= 3) {
      if (formData.requiredSkills.length === 0 && hasInteracted.skills) {
        errors.skills = 'At least one required skill is needed';
      }
    }

    setValidationErrors(errors);
  }, [formData, currentStep, hasInteracted]);

  const markFieldAsInteracted = (fieldName: string) => {
    setHasInteracted((prev) => ({ ...prev, [fieldName]: true }));
  };

  return { validationErrors, markFieldAsInteracted };
}

function useSmartDefaults(
  formData: AIJobData,
  updateFormData: (updates: Partial<AIJobData>) => void
) {
  useEffect(() => {
    if (formData.jobTitle) {
      const titleLower = formData.jobTitle.toLowerCase();
      let suggestedSkills: string[] = [];

      Object.entries(JOB_SUGGESTIONS).forEach(([role, skills]) => {
        if (titleLower.includes(role.toLowerCase().split(' ')[0])) {
          suggestedSkills = skills;
        }
      });

      if (suggestedSkills.length > 0 && formData.requiredSkills.length === 0) {
        updateFormData({
          requiredSkills: suggestedSkills.slice(0, 3),
          preferredSkills: suggestedSkills.slice(3, 5),
        });
      }
    }
  }, [formData.jobTitle, formData.requiredSkills.length, updateFormData]);
}

// Step Components
function BasicsStep({
  formData,
  updateFormData,
  validationErrors,
  markFieldAsInteracted,
}: {
  formData: AIJobData;
  updateFormData: (updates: Partial<AIJobData>) => void;
  validationErrors: Record<string, string>;
  markFieldAsInteracted: (fieldName: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="jobTitle" className="text-sm font-medium">
            Job Title <span className="text-red-500">*</span>
          </Label>
          <Input
            id="jobTitle"
            placeholder="e.g., Senior Software Engineer, Product Manager"
            value={formData.jobTitle}
            onChange={(e) => updateFormData({ jobTitle: e.target.value })}
            onBlur={() => markFieldAsInteracted('jobTitle')}
            className={cn(
              'mt-1.5 h-11',
              validationErrors.jobTitle && 'border-red-500'
            )}
          />
          {validationErrors.jobTitle && (
            <p className="mt-1 text-xs text-red-500">
              {validationErrors.jobTitle}
            </p>
          )}

          <div className="mt-3">
            <p className="mb-2 text-xs text-gray-500">Popular roles:</p>
            <div className="flex flex-wrap gap-2">
              {Object.keys(JOB_SUGGESTIONS).map((role) => (
                <Button
                  key={role}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    updateFormData({ jobTitle: role });
                    markFieldAsInteracted('jobTitle');
                  }}
                  className="h-7 text-xs"
                >
                  {role}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium">
            Location <span className="text-red-500">*</span>
          </Label>
          <div className="mt-1.5 flex items-start gap-3">
            <div className="flex-1">
              <LocationAutocomplete
                value={formData.location}
                onValueChange={(location) => {
                  updateFormData({ location });
                  markFieldAsInteracted('location');
                }}
                placeholder="Search for a location..."
                error={validationErrors.location}
                className="h-11"
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <Switch
                checked={formData.remoteOption}
                onCheckedChange={(checked) =>
                  updateFormData({ remoteOption: checked })
                }
              />
              <Label className="text-sm">Remote OK</Label>
            </div>
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium">Department (Optional)</Label>
          <Input
            placeholder="e.g., Engineering, Marketing, Sales"
            value={formData.department}
            onChange={(e) => updateFormData({ department: e.target.value })}
            className="mt-1.5 h-11"
          />
        </div>
      </div>
    </div>
  );
}

function DetailsStep({
  formData,
  updateFormData,
}: {
  formData: AIJobData;
  updateFormData: (updates: Partial<AIJobData>) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-6">
        <div>
          <Label className="text-sm font-medium">Industry</Label>
          <Select
            value={formData.industry}
            onValueChange={(value) => updateFormData({ industry: value })}
          >
            <SelectTrigger className="mt-1.5 h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INDUSTRIES.map((industry) => (
                <SelectItem key={industry} value={industry}>
                  {industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <Label className="text-sm font-medium">Experience Level</Label>
            <Badge variant="secondary" className="text-primary bg-primary/10">
              {formData.experienceLevel}{' '}
              {formData.experienceLevel === 1 ? 'year' : 'years'}
            </Badge>
          </div>
          <div className="px-3 py-4">
            <input
              type="range"
              min={0}
              max={15}
              step={1}
              value={formData.experienceLevel}
              onChange={(e) =>
                updateFormData({ experienceLevel: parseInt(e.target.value) })
              }
              className="[&::-webkit-slider-thumb]:bg-primary [&::-moz-range-thumb]:bg-primary h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full"
            />
            <div className="mt-2 flex justify-between text-xs text-gray-500">
              <span>Entry (0-2)</span>
              <span>Mid (3-5)</span>
              <span>Senior (6-10)</span>
              <span>Lead (10+)</span>
            </div>
          </div>
        </div>

        <div>
          <Label className="mb-3 block text-sm font-medium">
            Employment Type
          </Label>
          <RadioGroup
            value={formData.jobType}
            onValueChange={(value: any) => updateFormData({ jobType: value })}
            className="grid grid-cols-1 gap-3 md:grid-cols-3"
          >
            {JOB_TYPES.map((option) => (
              <div
                key={option.value}
                className="flex items-center space-x-3 rounded-lg border border-gray-200 p-4 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                <RadioGroupItem value={option.value} id={option.value} />
                <div className="flex-1">
                  <Label
                    htmlFor={option.value}
                    className="cursor-pointer font-medium"
                  >
                    {option.label}
                  </Label>
                  <p className="mt-1 text-xs text-gray-500">{option.desc}</p>
                </div>
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>
    </div>
  );
}

function CompensationStep({
  formData,
  updateFormData,
  validationErrors,
  markFieldAsInteracted,
}: {
  formData: AIJobData;
  updateFormData: (updates: Partial<AIJobData>) => void;
  validationErrors: Record<string, string>;
  markFieldAsInteracted: (fieldName: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium">Currency</Label>
          <Select
            value={formData.currency}
            onValueChange={(value) => {
              const defaultUnit =
                CURRENCY_CONFIGS[value]?.defaultUnit || 'thousands';
              updateFormData({ currency: value, salaryUnit: defaultUnit });
            }}
          >
            <SelectTrigger className="mt-1.5 h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.values(CURRENCY_CONFIGS).map((currency) => (
                <SelectItem key={currency.code} value={currency.code}>
                  {currency.symbol} {currency.code} - {currency.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label className="text-sm font-medium">Minimum Salary</Label>
            <div className="mt-1.5 flex items-center gap-2">
              <Input
                type="number"
                value={convertFromBaseValue(
                  formData.minSalary,
                  formData.salaryUnit
                )}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  updateFormData({
                    minSalary: convertToBaseValue(value, formData.salaryUnit),
                  });
                }}
                onBlur={() => markFieldAsInteracted('salary')}
                className="flex-1"
              />
              <Select
                value={formData.salaryUnit}
                onValueChange={(unit: SalaryUnit) =>
                  updateFormData({ salaryUnit: unit })
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableUnits(formData.currency).map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {SALARY_UNITS[unit].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Maximum Salary</Label>
            <div className="mt-1.5 flex items-center gap-2">
              <Input
                type="number"
                value={convertFromBaseValue(
                  formData.maxSalary,
                  formData.salaryUnit
                )}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  updateFormData({
                    maxSalary: convertToBaseValue(value, formData.salaryUnit),
                  });
                }}
                onBlur={() => markFieldAsInteracted('salary')}
                className="flex-1"
              />
              <Select
                value={formData.salaryUnit}
                onValueChange={(unit: SalaryUnit) =>
                  updateFormData({ salaryUnit: unit })
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableUnits(formData.currency).map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {SALARY_UNITS[unit].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {validationErrors.salary && (
          <div className="rounded-md bg-red-50 p-3 dark:bg-red-900/20">
            <p className="text-sm text-red-700 dark:text-red-400">
              {validationErrors.salary}
            </p>
          </div>
        )}

        {formData.minSalary > 0 &&
          formData.maxSalary > 0 &&
          !validationErrors.salary && (
            <div className="bg-primary/10 dark:bg-primary/20 rounded-md p-3">
              <p className="text-primary dark:text-primary text-sm">
                <span className="font-medium">Salary Range:</span>{' '}
                {CURRENCY_CONFIGS[formData.currency]?.symbol}
                {convertFromBaseValue(
                  formData.minSalary,
                  formData.salaryUnit
                ).toLocaleString()}{' '}
                - {CURRENCY_CONFIGS[formData.currency]?.symbol}
                {convertFromBaseValue(
                  formData.maxSalary,
                  formData.salaryUnit
                ).toLocaleString()}{' '}
                {SALARY_UNITS[formData.salaryUnit].label}
              </p>
            </div>
          )}
      </div>
    </div>
  );
}

function SkillsStep({
  formData,
  updateFormData,
  validationErrors,
  markFieldAsInteracted,
}: {
  formData: AIJobData;
  updateFormData: (updates: Partial<AIJobData>) => void;
  validationErrors: Record<string, string>;
  markFieldAsInteracted: (fieldName: string) => void;
}) {
  const [skillInput, setSkillInput] = useState('');

  const addSkill = (skill: string, type: 'required' | 'preferred') => {
    if (!skill.trim()) return;

    const skillToAdd = skill.trim();
    markFieldAsInteracted('skills');

    if (type === 'required') {
      if (!formData.requiredSkills.includes(skillToAdd)) {
        updateFormData({
          requiredSkills: [...formData.requiredSkills, skillToAdd],
        });
      }
    } else {
      if (!formData.preferredSkills.includes(skillToAdd)) {
        updateFormData({
          preferredSkills: [...formData.preferredSkills, skillToAdd],
        });
      }
    }
    setSkillInput('');
  };

  const removeSkill = (skill: string, type: 'required' | 'preferred') => {
    markFieldAsInteracted('skills');

    if (type === 'required') {
      updateFormData({
        requiredSkills: formData.requiredSkills.filter((s) => s !== skill),
      });
    } else {
      updateFormData({
        preferredSkills: formData.preferredSkills.filter((s) => s !== skill),
      });
    }
  };

  return (
    <div className="space-y-6 p-2">
      <div className="space-y-6">
        <div>
          <Label className="mb-3 block text-sm font-medium">
            Add Skills
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="ml-1 inline h-4 w-4 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Type a skill and click &quot;Required&quot; or
                    &quot;Preferred&quot; to categorize it
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Label>
          <div className="flex gap-2">
            <Input
              placeholder="Type a skill..."
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && skillInput.trim()) {
                  e.preventDefault();
                  addSkill(skillInput, 'required');
                }
              }}
              onBlur={() => markFieldAsInteracted('skills')}
              className="flex-1"
            />
            <Button
              type="button"
              variant="default"
              onClick={() => addSkill(skillInput, 'required')}
              disabled={!skillInput.trim()}
              size="sm"
            >
              Required
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => addSkill(skillInput, 'preferred')}
              disabled={!skillInput.trim()}
              size="sm"
            >
              Preferred
            </Button>
          </div>

          <div className="mt-3">
            <p className="mb-2 text-xs text-gray-500">Quick add:</p>
            <div className="flex flex-wrap gap-1">
              {COMMON_SKILLS.filter(
                (skill) =>
                  !formData.requiredSkills.includes(skill) &&
                  !formData.preferredSkills.includes(skill)
              )
                .slice(0, 8)
                .map((skill) => (
                  <Button
                    key={skill}
                    variant="ghost"
                    size="sm"
                    onClick={() => addSkill(skill, 'required')}
                    className="h-6 px-2 text-xs"
                  >
                    + {skill}
                  </Button>
                ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div>
            <Label className="mb-2 block text-sm font-medium">
              Required Skills
              {formData.requiredSkills.length === 0 && (
                <span className="ml-1 text-red-500">*</span>
              )}
            </Label>
            <div className="min-h-[100px] rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
              {formData.requiredSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {formData.requiredSkills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="default"
                      className="text-primary bg-primary/10 hover:bg-primary/20 dark:bg-primary/10 dark:text-primary"
                    >
                      {skill}
                      <button
                        className="ml-2 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800"
                        onClick={() => removeSkill(skill, 'required')}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-gray-500 italic">
                    No required skills added yet
                  </p>
                </div>
              )}
            </div>
          </div>

          <div>
            <Label className="mb-2 block text-sm font-medium">
              Preferred Skills
            </Label>
            <div className="min-h-[100px] rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
              {formData.preferredSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {formData.preferredSkills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="outline"
                      className="border-gray-300 bg-white text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
                    >
                      {skill}
                      <button
                        className="ml-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                        onClick={() => removeSkill(skill, 'preferred')}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-gray-500 italic">
                    No preferred skills added yet
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {validationErrors.skills && (
          <div className="rounded-md bg-red-50 p-3 dark:bg-red-900/20">
            <p className="text-sm text-red-700 dark:text-red-400">
              {validationErrors.skills}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ReviewStep({
  formData,
  updateFormData,
}: {
  formData: AIJobData;
  updateFormData: (updates: Partial<AIJobData>) => void;
}) {
  return (
    <div className="space-y-6 p-2">
      <div className="rounded-lg border-2 border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
        <h4 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Job Summary
        </h4>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
            <div>
              <span className="font-medium text-gray-600 dark:text-gray-400">
                Title:
              </span>
              <p className="font-semibold">{formData.jobTitle}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600 dark:text-gray-400">
                Location:
              </span>
              <p>
                {formData.location}
                {formData.remoteOption && ' (Remote OK)'}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-600 dark:text-gray-400">
                Experience:
              </span>
              <p>{formData.experienceLevel}+ years</p>
            </div>
            <div>
              <span className="font-medium text-gray-600 dark:text-gray-400">
                Type:
              </span>
              <p className="capitalize">
                {formData.jobType.replace('time', '-Time')}
              </p>
            </div>
            <div className="col-span-2">
              <span className="font-medium text-gray-600 dark:text-gray-400">
                Salary Range:
              </span>
              <p>
                {CURRENCY_CONFIGS[formData.currency]?.symbol}
                {convertFromBaseValue(
                  formData.minSalary,
                  formData.salaryUnit
                ).toLocaleString()}{' '}
                - {CURRENCY_CONFIGS[formData.currency]?.symbol}
                {convertFromBaseValue(
                  formData.maxSalary,
                  formData.salaryUnit
                ).toLocaleString()}{' '}
                {SALARY_UNITS[formData.salaryUnit].label}
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 dark:border-gray-600">
            <div className="grid grid-cols-1 gap-4 text-sm lg:grid-cols-2">
              <div>
                <span className="mb-2 block font-medium text-gray-600 dark:text-gray-400">
                  Required Skills ({formData.requiredSkills.length}):
                </span>
                <div className="flex flex-wrap gap-1">
                  {formData.requiredSkills.map((skill) => (
                    <Badge key={skill} variant="default" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <span className="mb-2 block font-medium text-gray-600 dark:text-gray-400">
                  Preferred Skills ({formData.preferredSkills.length}):
                </span>
                <div className="flex flex-wrap gap-1">
                  {formData.preferredSkills.map((skill) => (
                    <Badge key={skill} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-primary/10 bg-primary/10 dark:border-primary/10 dark:bg-primary/10 rounded-lg border p-4">
        <div className="flex items-start space-x-3">
          <Switch
            checked={formData.modeSpecific}
            onCheckedChange={(checked) =>
              updateFormData({ modeSpecific: checked })
            }
          />
          <div>
            <Label className="text-sm font-medium text-gray-900 dark:text-white">
              Generate detailed, role-specific content
            </Label>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
              Create comprehensive requirements and responsibilities tailored to
              this specific role
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Component
export function AIJobGenerator({
  isGenerating,
  onGenerate,
  onReset,
}: AIJobGeneratorProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<AIJobData>(DEFAULT_FORM_DATA);

  const updateFormData = (updates: Partial<AIJobData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const { validationErrors, markFieldAsInteracted } = useFormValidation(
    formData,
    currentStep
  );
  useSmartDefaults(formData, updateFormData);

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return formData.jobTitle.trim() && formData.location.trim();
      case 1:
        return formData.industry && formData.jobType;
      case 2:
        return !validationErrors.salary;
      case 3:
        return formData.requiredSkills.length > 0;
      case 4:
        return Object.keys(validationErrors).length === 0;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (canProceed() && currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGenerate = () => {
    if (canProceed() && Object.keys(validationErrors).length === 0) {
      onGenerate(formData);
    }
  };

  const handleReset = () => {
    setFormData(DEFAULT_FORM_DATA);
    setCurrentStep(0);
    onReset();
  };

  const renderStep = () => {
    const stepProps = {
      formData,
      updateFormData,
      validationErrors,
      markFieldAsInteracted,
    };

    switch (currentStep) {
      case 0:
        return <BasicsStep {...stepProps} />;
      case 1:
        return <DetailsStep {...stepProps} />;
      case 2:
        return <CompensationStep {...stepProps} />;
      case 3:
        return <SkillsStep {...stepProps} />;
      case 4:
        return <ReviewStep {...stepProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 p-2">
      {/* Progress Header */}
      <div className="space-y-4">
        <Progress
          value={((currentStep + 1) / STEPS.length) * 100}
          className="h-2 w-full"
        />

        {/* Step indicators */}
        <div className="flex justify-between text-xs">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;

            return (
              <div
                key={step.id}
                className={cn(
                  'flex w-full flex-1 flex-col items-center space-y-1',
                  index < STEPS.length - 1 &&
                    'mr-2 border-r border-gray-200 pr-2 dark:border-gray-700'
                )}
              >
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors',
                    isActive
                      ? 'bg-primary dark:bg-primary text-white'
                      : isCompleted
                        ? 'border-primary bg-primary text-white'
                        : 'border-gray-300 bg-white text-gray-400 dark:border-gray-600 dark:bg-gray-800'
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="text-center">
                  <p
                    className={cn(
                      'font-medium',
                      isActive
                        ? 'text-primary dark:text-primary'
                        : isCompleted
                          ? 'text-primary dark:text-primary'
                          : 'text-gray-500'
                    )}
                  >
                    {step.title}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="min-h-[400px]">{renderStep()}</div>

      {/* Navigation */}
      <div className="flex justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
        <div className="flex items-center gap-2">
          {currentStep > 0 && (
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
          )}

          <Button
            variant="ghost"
            onClick={handleReset}
            disabled={isGenerating}
            className="flex items-center gap-2 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
          >
            <X className="h-4 w-4" />
            Reset
          </Button>
        </div>

        <div className="flex gap-2">
          {currentStep < STEPS.length - 1 ? (
            <Button
              onClick={nextStep}
              disabled={!canProceed() || isGenerating}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleGenerate}
              disabled={
                !canProceed() ||
                Object.keys(validationErrors).length > 0 ||
                isGenerating
              }
              className="bg-primary hover:bg-primary/90 flex items-center gap-2"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5" />
                  Generate Job Description
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

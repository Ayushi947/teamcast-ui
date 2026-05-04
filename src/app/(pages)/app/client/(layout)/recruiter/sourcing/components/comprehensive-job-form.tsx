'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useForm, SubmitHandler, useWatch } from 'react-hook-form';
import { useApp } from '@/lib/context/app-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Building2,
  Plus,
  X,
  Users,
  User,
  MapPin,
  Target,
  Award,
  DollarSign,
  CheckCircle2,
  Briefcase,
  GraduationCap,
  Star,
  Upload,
  FileText,
  Loader,
  Minus,
  BotMessageSquare,
  MessageCircle,
  Brain,
  Shield,
  Video,
  CheckCircle,
  Clock,
  Repeat,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Save,
  PenTool,
  Globe,
  Bot,
  UploadCloud,
  AlertCircle,
  Settings,
  FolderOpen,
  List,
  Zap,
  BarChart3,
  AlertTriangle,
  PlayCircle,
  Tag,
} from 'lucide-react';
import {
  WorkTypeEnum,
  WorkCommitmentEnum,
  WorkScheduleEnum,
  CompanyIndustryEnum,
  ActivityEntityTypeEnum,
  ActivityModuleEnum,
  logger,
  JobParsingTaskStatusEnum,
  DifficultyLevelEnum,
} from '@/lib/shared';
import {
  clientJobPostingService,
  clientJobParsingService,
  activityLogService,
  clientProfileService,
} from '@/lib/services/services';
import { IJobParsed } from '@/lib/shared';
import { convertParsedJDToFormData } from '@/lib/utils/jd-parser-utils';
import * as z from 'zod';
import { SalaryRangeInput } from '@/components/ui/salary-input';
import {
  CURRENCY_CONFIGS,
  SalaryUnit,
  formatSalaryDisplay,
} from '@/lib/utils/currency-utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { AIJobGenerator } from '@/components/ui/ai-job-generator';
import { LocationAutocomplete } from '@/components/ui/location-autocomplete';
import { ActivityActionEnums, ActivityTitleEnum } from '@/lib/models/activity';
import { AxiosError } from 'axios';
import { getCurrentLocationAddress } from '@/lib/utils/geolocation';
import { DialogTourWrapper } from '@/components/tour/dialog-tour-wrapper';
import { useTourContext } from '@/lib/context/tour-context';
import TourGuide from '@/components/tour/tour-guide';
import { IVoiceSynthesizeRequest } from '@/lib/shared';
import { voiceService } from '@/lib/services/services';

// Enhanced Types and Enums

// English Dialect Configuration
interface EnglishDialect {
  code: string;
  name: string;
  nameNative: string;
  flag: string;
  voiceOptions: {
    female: string;
    male: string;
  };
}

const DEFAULT_SAMPLE_TEXT = {
  ENGLISH:
    'Welcome to your AI assessment. Please listen carefully to each question and provide thoughtful responses.',
};

const createDialect = (
  code: string,
  name: string,
  nameNative: string,
  flag: string,
  fallbackCode?: string // For dialects without Chirp3-HD voices, use fallback
): EnglishDialect => {
  // Use fallback code if provided (e.g., en-CA uses en-US voices)
  const voiceCode = fallbackCode || code;
  return {
    code,
    name,
    nameNative,
    flag,
    voiceOptions: {
      female: `${voiceCode}-Chirp3-HD-Aoede`,
      male: `${voiceCode}-Chirp3-HD-Puck`,
    },
  };
};

const ENGLISH_DIALECTS: EnglishDialect[] = [
  createDialect('en-US', 'American English', 'American English', '🇺🇸'),
  createDialect('en-GB', 'British English', 'British English', '🇬🇧'),
  createDialect('en-AU', 'Australian English', 'Australian English', '🇦🇺'),
  // Canadian English uses US voices as fallback (no en-CA Chirp3-HD voices available)
  createDialect('en-CA', 'Canadian English', 'Canadian English', '🇨🇦', 'en-US'),
  createDialect('en-IN', 'Indian English', 'Indian English', '🇮🇳'),
];
enum CreationMethod {
  METHOD_SELECTION = 'method-selection',
  MANUAL = 'manual',
  PDF_UPLOAD = 'pdf-upload',
  TEXT_PASTE = 'text-paste',
  AI_GENERATOR = 'ai-generator',
}

interface CreationMethodCard {
  id: CreationMethod;
  title: string;
  description: string;
  benefits: string[];
  bestFor: string;
  icon: React.ComponentType<{ className?: string }>;
  estimatedTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  actionText: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
  dataTour: string;
}

interface FormState {
  currentMethod: CreationMethod;
  activeSection: string;
  completionData: {
    methodSelected: boolean;
    basicInfoComplete: boolean;
    parsedDataAvailable: boolean;
    hasErrors: boolean;
  };
  progress: number;
}

interface FieldGuidance {
  helpText: string;
  examples: string[];
  bestPractices: string[];
  commonMistakes: string[];
  placeholder: string;
  characterLimit?: { min: number; max: number };
}

interface QualityMetrics {
  completeness: number;
  clarity: number;
  competitiveness: number;
  inclusivity: number;
  seoScore: number;
  overallScore: number;
}

// Enhanced Schema with better validation
const jobFormSchema = z
  .object({
    // Basic Info
    title: z
      .string()
      .min(5, 'Title should be at least 5 characters for better clarity')
      .max(100, 'Title must be less than 100 characters')
      .refine(
        (val) => val.trim().split(' ').length >= 2,
        'Job title should contain at least 2 words'
      ),
    description: z
      .string()
      .min(
        100,
        'Description should be at least 100 characters for better candidate understanding'
      )
      .max(5000, 'Description must be less than 5000 characters')
      .refine(
        (val) => val.split('.').length >= 3,
        'Description should contain at least 3 sentences'
      ),
    department: z.string().optional(),

    // Job Details
    jobType: z.nativeEnum(WorkTypeEnum),
    jobCommitment: z.nativeEnum(WorkCommitmentEnum),
    jobSchedule: z.nativeEnum(WorkScheduleEnum),
    industry: z.nativeEnum(CompanyIndustryEnum),

    // Experience & Team
    totalExperience: z
      .number()
      .min(0, 'Experience must be positive')
      .max(50, 'Experience seems unreasonably high'),
    teamSize: z.number().min(0).optional(),
    reportingTo: z
      .string()
      .max(100, 'Reports to must be less than 100 characters')
      .optional(),
    hiring_manager_email: z
      .string()
      .email('Please enter a valid email address')
      .min(1, 'Hiring manager email is required'),
    numberOfOpenings: z
      .number()
      .min(1, 'At least one opening required')
      .max(100, 'Number of openings seems unreasonably high'),

    // Dates
    applicationDeadline: z.date().optional(),
    availableFrom: z.date().optional(),

    // Application
    applicationUrl: z.string().url().optional().or(z.literal('')),
    isFeatured: z.boolean().optional(),

    // Compensation
    minSalary: z
      .number()
      .min(1, 'Minimum salary is required and must be greater than 0'),
    maxSalary: z.number().min(1, 'Maximum salary is required'),
    salaryCurrency: z.string().min(1, 'Currency is required'),
    equity: z.boolean().optional(),

    // Work Details
    responsibilities: z
      .array(z.string().min(1, 'Responsibility cannot be empty'))
      .min(3, 'At least 3 responsibilities required for better job clarity')
      .max(20, 'Too many responsibilities'),
    benefits: z
      .array(z.string().min(1, 'Benefit cannot be empty'))
      .max(20, 'Too many benefits')
      .optional(),
    tags: z
      .array(z.string().min(1, 'Tag cannot be empty'))
      .max(20, 'Too many tags')
      .optional(),
    isRemote: z.boolean().optional(),

    // Skills & Preferences
    requiredSkills: z
      .array(z.string().min(1, 'Skill cannot be empty'))
      .min(
        3,
        'At least 3 required skills needed for proper candidate filtering'
      )
      .max(50, 'Too many required skills (maximum 50)'),
    preferredSkills: z
      .array(z.string().min(1, 'Skill cannot be empty'))
      .max(50, 'Too many preferred skills (maximum 50)')
      .optional(),
    preferredUniversities: z
      .array(z.string().min(1, 'University cannot be empty'))
      .max(20, 'Too many universities')
      .optional(),
    preferredDegrees: z
      .array(z.string().min(1, 'Degree cannot be empty'))
      .max(20, 'Too many degrees')
      .optional(),
    preferredLocations: z
      .array(z.string().min(1, 'Location cannot be empty'))
      .min(1, 'At least one preferred location required for better matching')
      .max(20, 'Too many locations'),
    preferredIndustries: z
      .array(z.string().min(1, 'Industry cannot be empty'))
      .max(20, 'Too many industries')
      .optional(),

    // AI Assessment Settings
    aiAssessmentSettings: z
      .object({
        greetingMessage: z.string().optional(),
        requiredSections: z.array(z.string()).optional(),
        defaultAssessmentDuration: z.number().min(1).max(7200).optional(),
        defaultPassingScore: z.number().min(0).max(1).optional(),
        maximumAttempts: z.number().min(1).max(10).optional(),
        cooldownPeriod: z.number().min(1).max(168).optional(),
        maxAssessmentDuration: z.number().min(1).max(14400).optional(),
        assessmentBuffer: z.number().min(0).max(3600).optional(),
        useCustomPrompts: z.boolean().optional(),
        aiDifficulty: z.nativeEnum(DifficultyLevelEnum).optional(),
        maxSections: z.number().min(1).max(20).optional(),
        maxQuestionsPerSection: z.number().min(1).max(50).optional(),
        proctoringEnabled: z.boolean().optional(),
        maxWarnings: z.number().min(1).max(10).optional(),
        tabSwitchLimit: z.number().min(0).max(20).optional(),
        copyPasteAllowed: z.boolean().optional(),
        videoRecordingEnabled: z.boolean().optional(),
        minimumVideoLength: z.number().min(1).max(300).optional(),
        aiVideoAnalysisEnabled: z.boolean().optional(),
        autoPublishOnSuccess: z.boolean().optional(),
        autoNotifyOnComplete: z.boolean().optional(),
        interviewLanguage: z.string().optional(),
        interviewDialect: z.string().optional(),
        interviewVoiceGender: z.enum(['female', 'male']).optional(),
      })
      .optional(),
  })
  .refine((data) => data.maxSalary > data.minSalary, {
    message: 'Maximum salary must be greater than minimum salary',
    path: ['maxSalary'],
  });

type JobFormValues = z.infer<typeof jobFormSchema>;

// Field Guidance Configuration
const FIELD_GUIDANCE: Record<string, FieldGuidance> = {
  title: {
    helpText: 'A clear, specific job title helps attract the right candidates',
    examples: [
      'Senior Software Engineer',
      'Marketing Manager - Digital',
      'Full Stack Developer',
    ],
    bestPractices: [
      'Be specific about seniority level',
      'Include key technologies if relevant',
      'Avoid internal jargon',
    ],
    commonMistakes: [
      'Too generic titles',
      'Internal code names',
      'Unclear seniority',
    ],
    placeholder: 'e.g. Senior React Developer',
    characterLimit: { min: 10, max: 100 },
  },
  description: {
    helpText:
      'Detailed description helps candidates understand the role and company culture',
    examples: [
      'Join our growing team as a Senior Software Engineer...',
      'We are looking for a passionate Marketing Manager...',
      'Exciting opportunity for a Full Stack Developer...',
    ],
    bestPractices: [
      'Start with role impact and excitement',
      'Include company culture and values',
      'Mention growth opportunities',
      'Be specific about daily responsibilities',
    ],
    commonMistakes: [
      'Too vague descriptions',
      'Only listing requirements',
      'No company context',
    ],
    placeholder:
      'Describe the role, impact, and what makes this opportunity exciting...',
    characterLimit: { min: 100, max: 5000 },
  },
  responsibilities: {
    helpText:
      'Clear responsibilities help candidates understand day-to-day work',
    examples: [
      'Design and develop scalable web applications',
      'Collaborate with cross-functional teams',
      'Lead code reviews and mentor junior developers',
    ],
    bestPractices: [
      'Use action verbs',
      'Be specific about technologies',
      'Include collaboration aspects',
      'Mention impact and outcomes',
    ],
    commonMistakes: [
      'Vague descriptions',
      'Too many responsibilities',
      'No context about impact',
    ],
    placeholder:
      'e.g. Design and develop scalable web applications using React and Node.js',
  },
  requiredSkills: {
    helpText: 'Essential skills help filter qualified candidates',
    examples: ['React', 'TypeScript', 'Node.js', 'AWS', 'PostgreSQL'],
    bestPractices: [
      'List only truly required skills',
      'Include both technical and soft skills',
    ],
    commonMistakes: [
      'Too many required skills',
      'Outdated technologies',
      'Unrealistic combinations',
    ],
    placeholder: 'e.g. React, TypeScript, RESTful APIs',
  },
  benefits: {
    helpText: 'Attractive benefits help differentiate your job posting',
    examples: [
      'Comprehensive health insurance',
      'Flexible working hours',
      'Professional development budget',
      'Remote work options',
    ],
    bestPractices: [
      'Highlight unique benefits',
      'Include both monetary and non-monetary',
      'Mention work-life balance',
      'Be specific about amounts when possible',
    ],
    commonMistakes: [
      'Generic benefit lists',
      'Outdated offerings',
      'Vague descriptions',
    ],
    placeholder:
      'e.g. Comprehensive health insurance including dental and vision',
  },
};

// Creation Method Cards Configuration
const CREATION_METHODS: CreationMethodCard[] = [
  {
    id: CreationMethod.PDF_UPLOAD,
    title: 'Upload PDF',
    description: 'Quick conversion from existing job description files',
    benefits: ['Instant extraction', 'Multiple formats', 'Preserves context'],
    bestFor: 'Existing job descriptions or templates',
    icon: UploadCloud,
    estimatedTime: '2-3 min',
    difficulty: 'Easy',
    actionText: 'Upload File',
    color: 'green',
    dataTour: 'upload-pdf',
  },
  {
    id: CreationMethod.TEXT_PASTE,
    title: 'Paste Text',
    description: 'Smart parsing from any text source or document',
    benefits: ['Flexible input', 'Intelligent parsing', 'Quick migration'],
    bestFor: 'Content from websites or documents',
    icon: FileText,
    estimatedTime: '3-5 min',
    difficulty: 'Easy',
    actionText: 'Paste Content',
    color: 'purple',
    dataTour: 'paste-text',
  },
  {
    id: CreationMethod.AI_GENERATOR,
    title: 'AI Generator',
    description: 'Professional job descriptions powered by AI',
    benefits: ['Best practices', 'SEO optimized', 'Industry standards'],
    bestFor: 'New roles and professional formatting',
    icon: Bot,
    estimatedTime: '5-7 min',
    difficulty: 'Medium',
    actionText: 'Generate with AI',
    color: 'orange',
    dataTour: 'ai-generator',
  },
  {
    id: CreationMethod.MANUAL,
    title: 'Manual Entry',
    description: 'Step-by-step creation with full control and guidance',
    benefits: [
      'Complete customization',
      'Real-time validation',
      'Auto-save progress',
    ],
    bestFor: 'Custom roles with specific requirements',
    icon: PenTool,
    estimatedTime: '10-15 min',
    difficulty: 'Hard',
    actionText: 'Start Creating',
    color: 'blue',
    dataTour: 'manual-creation',
  },
];

// Form Sections Configuration
const FORM_SECTIONS = [
  {
    id: 'basic',
    title: 'Basic Information',
    icon: Briefcase,
    description: 'Essential job details and description',
    weight: 25,
    requiredFields: ['title', 'description', 'numberOfOpenings'],
    dataTour: 'basic-info-section',
  },
  {
    id: 'details',
    title: 'Job Specifications',
    icon: Target,
    description: 'Type, commitment, and work requirements',
    weight: 20,
    requiredFields: [
      'jobType',
      'jobCommitment',
      'jobSchedule',
      'industry',
      'totalExperience',
      'hiring_manager_email',
    ],
    dataTour: 'job-specification-section',
  },
  {
    id: 'compensation',
    title: 'Compensation & Benefits',
    icon: DollarSign,
    description: 'Salary, benefits, and perks',
    weight: 20,
    requiredFields: ['minSalary', 'maxSalary', 'salaryCurrency'],
    dataTour: 'compensation-section',
  },
  {
    id: 'requirements',
    title: 'Skills & Responsibilities',
    icon: CheckCircle2,
    description: 'Required skills and job duties',
    weight: 25,
    requiredFields: ['requiredSkills', 'responsibilities'],
    dataTour: 'skills-section',
  },
  {
    id: 'preferences',
    title: 'Preferred Qualifications',
    icon: Star,
    description: 'Nice-to-have qualifications and preferences',
    weight: 5,
    requiredFields: ['preferredLocations'],
    dataTour: 'preferred-qualifications-section',
  },
  {
    id: 'settings',
    title: 'AI Assessment Settings',
    icon: BotMessageSquare,
    description: 'AI Assessment configuration for this job',
    weight: 5,
    requiredFields: [],
    dataTour: 'ai-assessment-settings-section',
  },
];

// Constants
const POLLING_INTERVAL = 2000;
const AUTO_SAVE_INTERVAL = 30000;
const PROCESSING_MESSAGES = [
  'Extracting information from job description...',
  'Analyzing job requirements and responsibilities...',
  'Identifying required and preferred skills...',
  'Processing compensation and benefits details...',
  'Mapping job specifications and requirements...',
  'Optimizing content for better candidate attraction...',
  'Organizing job information and structure...',
  'Finalizing details and formatting...',
];

interface EnhancedJobFormProps {
  onClose: () => void;
  onSuccess: () => void;
  job?: any;
  isModal?: boolean; // New prop to control modal rendering
  onJobCreated?: (jobId: string, jobTitle: string) => void; // New prop for job creation callback
}

const formatEnumValue = (value: string): string => {
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Utility function to ensure tour elements are properly scrolled into view
const ensureTourElementVisible = (element: HTMLElement | null) => {
  if (!element) return;

  // Find the scrollable container
  const findScrollableContainer = (el: HTMLElement): HTMLElement => {
    let parent = el.parentElement;
    while (parent) {
      const style = window.getComputedStyle(parent);
      const overflow = style.overflow + style.overflowY + style.overflowX;

      if (overflow.includes('auto') || overflow.includes('scroll')) {
        return parent;
      }

      if (
        parent.hasAttribute('data-radix-dialog-content') ||
        (parent.hasAttribute('role') &&
          parent.getAttribute('role') === 'dialog')
      ) {
        return parent;
      }

      parent = parent.parentElement;
    }
    return document.documentElement;
  };

  const scrollableContainer = findScrollableContainer(element);
  const elementRect = element.getBoundingClientRect();

  // Get container bounds
  let containerRect: DOMRect;
  if (scrollableContainer === document.documentElement) {
    containerRect = new DOMRect(0, 0, window.innerWidth, window.innerHeight);
  } else {
    containerRect = scrollableContainer.getBoundingClientRect();
  }

  // Check if element needs scrolling
  const needsScrolling =
    elementRect.top < containerRect.top ||
    elementRect.bottom > containerRect.bottom ||
    elementRect.left < containerRect.left ||
    elementRect.right > containerRect.right;

  if (needsScrolling) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest',
    });
  }
};

const calculateQualityMetrics = (
  formData: Partial<JobFormValues>
): QualityMetrics => {
  const completeness = calculateCompleteness(formData);
  const clarity = calculateClarity(formData);
  const competitiveness = calculateCompetitiveness(formData);
  const inclusivity = calculateInclusivity(formData);
  const seoScore = calculateSeoScore(formData);

  const overallScore = Math.round(
    completeness * 0.3 +
      clarity * 0.25 +
      competitiveness * 0.2 +
      inclusivity * 0.15 +
      seoScore * 0.1
  );

  return {
    completeness,
    clarity,
    competitiveness,
    inclusivity,
    seoScore,
    overallScore,
  };
};

const calculateCompleteness = (data: Partial<JobFormValues>): number => {
  const requiredFields = [
    'title',
    'description',
    'requiredSkills',
    'responsibilities',
    'benefits',
    'minSalary',
    'maxSalary',
  ];
  const completed = requiredFields.filter((field) => {
    const value = data[field as keyof JobFormValues];
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== null && value !== '';
  }).length;
  return Math.round((completed / requiredFields.length) * 100);
};

const calculateClarity = (data: Partial<JobFormValues>): number => {
  let score = 0;
  if (data.title && data.title.length >= 10) score += 20;
  if (data.description && data.description.length >= 100) score += 30;
  if (data.responsibilities && data.responsibilities.length >= 3) score += 25;
  if (
    data.requiredSkills &&
    data.requiredSkills.length >= 3 &&
    data.requiredSkills.length <= 10
  )
    score += 25;
  return Math.round(score);
};

const calculateCompetitiveness = (data: Partial<JobFormValues>): number => {
  let score = 50; // Base score
  if (data.benefits && data.benefits.length >= 5) score += 20;
  if (data.equity) score += 15;
  if (data.isRemote) score += 10;
  if (data.preferredSkills && data.preferredSkills.length > 0) score += 5;
  return Math.min(100, Math.round(score));
};

const calculateInclusivity = (data: Partial<JobFormValues>): number => {
  let score = 60; // Base score
  const description = data.description?.toLowerCase() || '';

  // Check for inclusive language
  if (
    !description.includes('ninja') &&
    !description.includes('rockstar') &&
    !description.includes('guru')
  )
    score += 10;
  if (
    description.includes('diverse') ||
    description.includes('inclusive') ||
    description.includes('equal opportunity')
  )
    score += 15;
  if (data.isRemote) score += 10;
  if (data.totalExperience !== undefined && data.totalExperience <= 3)
    score += 5;

  return Math.min(100, Math.round(score));
};

const calculateSeoScore = (data: Partial<JobFormValues>): number => {
  let score = 0;
  if (data.title && data.title.length >= 10 && data.title.length <= 60)
    score += 25;
  if (data.description && data.description.length >= 150) score += 25;
  if (data.tags && data.tags.length >= 3) score += 20;
  if (data.preferredLocations && data.preferredLocations.length > 0)
    score += 15;
  if (data.requiredSkills && data.requiredSkills.length >= 3) score += 15;
  return Math.round(score);
};

export function ComprehensiveJobForm({
  onClose,
  onSuccess,
  job,
  isModal = true,
  onJobCreated,
}: EnhancedJobFormProps) {
  // Create refs for tour elements
  const basicInfoHeaderRef = useRef<HTMLDivElement | null>(null);
  const jobTitleFieldRef = useRef<HTMLDivElement | null>(null);
  const jobDescriptionFieldRef = useRef<HTMLDivElement | null>(null);
  const formNavigationSidebarRef = useRef<HTMLDivElement | null>(null);

  // Container ref for relative positioning test
  const containerRef = useRef<HTMLDivElement>(null);
  const { user } = useApp();
  const { getDialogTourKey, dialogState } = useTourContext();

  // Container refs for smooth scrolling
  const methodSelectionRef = useRef<HTMLDivElement | null>(null);
  const formSectionRef = useRef<HTMLDivElement | null>(null);
  const uploadMethodRef = useRef<HTMLDivElement | null>(null);
  const basicInfoRef = useRef<HTMLDivElement | null>(null);
  const jobDetailsRef = useRef<HTMLDivElement | null>(null);
  const salaryRef = useRef<HTMLDivElement | null>(null);
  const requirementsRef = useRef<HTMLDivElement | null>(null);
  const locationRef = useRef<HTMLDivElement | null>(null);
  const settingsRef = useRef<HTMLDivElement | null>(null);
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const mainContentRef = useRef<HTMLDivElement | null>(null);

  // Enhanced State Management
  const [formState, setFormState] = useState<FormState>({
    currentMethod: job
      ? CreationMethod.MANUAL
      : CreationMethod.METHOD_SELECTION,
    activeSection: 'basic',
    completionData: {
      methodSelected: !!job,
      basicInfoComplete: false,
      parsedDataAvailable: false,
      hasErrors: false,
    },
    progress: 0,
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [salaryUnit, setSalaryUnit] = useState<SalaryUnit>('thousands');
  const [_qualityMetrics, setQualityMetrics] = useState<QualityMetrics>({
    completeness: 0,
    clarity: 0,
    competitiveness: 0,
    inclusivity: 0,
    seoScore: 0,
    overallScore: 0,
  });

  // Upload states
  const [file, setFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState<string>('');

  // Scroll function for tour elements
  const scrollToElement = useCallback((tourId: string) => {
    // Try to find element by data-tour attribute first
    const tourElement = document.querySelector(`[data-tour="${tourId}"]`);
    if (tourElement) {
      tourElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest',
      });
      return;
    }

    // Fallback: try to find by container ID
    const containerElement = document.getElementById(tourId);
    if (containerElement) {
      containerElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest',
      });
      return;
    }

    // Additional fallback: scroll to specific refs based on tour ID
    const refMap: Record<string, React.RefObject<HTMLDivElement | null>> = {
      'method-selection': methodSelectionRef,
      'form-section': formSectionRef,
      'upload-method': uploadMethodRef,
      'basic-info': basicInfoRef,
      'job-details': jobDetailsRef,
      salary: salaryRef,
      requirements: requirementsRef,
      location: locationRef,
      settings: settingsRef,
      sidebar: sidebarRef,
      'main-content': mainContentRef,
    };

    const targetRef = refMap[tourId];
    if (targetRef?.current) {
      targetRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest',
      });
    }
  }, []);

  // Expose scroll function globally for tour system
  useEffect(() => {
    // Make scrollToElement available globally for tour system
    (window as any).scrollToJobFormElement = scrollToElement;

    return () => {
      // Cleanup on unmount
      delete (window as any).scrollToJobFormElement;
    };
  }, [scrollToElement]);

  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [aiGenerating, setAiGenerating] = useState<boolean>(false);
  const [generatedJDText, setGeneratedJDText] = useState<string>('');
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);
  const [newBenefit, setNewBenefit] = useState<string>('');
  const [newIndustry, setNewIndustry] = useState<string>('');
  const [newUniversity, setNewUniversity] = useState<string>('');
  const [newDegree, setNewDegree] = useState<string>('');
  const [requiredSectionsInput, setRequiredSectionsInput] =
    useState<string>('');
  const [isGettingLocation, setIsGettingLocation] = useState<boolean>(false);
  const [locationPermissionDenied, setLocationPermissionDenied] =
    useState<boolean>(false);
  const [previewingDialect, setPreviewingDialect] = useState<{
    code: string;
    voiceType: 'female' | 'male';
  } | null>(null);
  const [_audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Fetch AI Assessment Settings
  const { data: aiAssessmentSettings, isLoading: isLoadingAiSettings } =
    useQuery({
      queryKey: ['clientAiAssessmentSettings'],
      queryFn: () => clientProfileService.getAiAssessmentSettings(),
    });

  // Fetch AI Assessment Settings
  const {
    data: IndividualAiAssessmentSettings,
    isLoading: isLoadingIndividualAiSettings,
  } = useQuery({
    queryKey: ['clientAiAssessmentSettings', job?.id],
    queryFn: () =>
      clientProfileService.getJobPostingAiAssessmentSettings(job?.id),
  });

  // Enhanced Form with better defaults
  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    mode: 'onChange',
    defaultValues: {
      title: job?.title || '',
      description: job?.description || '',
      department: job?.department || '',
      jobType: job?.jobType || WorkTypeEnum.EMPLOYEE,
      jobCommitment: job?.jobCommitment || WorkCommitmentEnum.FULL_TIME,
      jobSchedule: job?.jobSchedule || WorkScheduleEnum.REGULAR,
      industry: job?.industry || CompanyIndustryEnum.TECHNOLOGY,
      totalExperience: job?.totalExperience || 2,
      teamSize: job?.teamSize || undefined,
      reportingTo: job?.reportingTo || '',
      hiring_manager_email: job?.hiring_manager_email || user?.email || '',
      numberOfOpenings: job?.numberOfOpenings || 1,
      applicationDeadline: job?.applicationDeadline
        ? new Date(job.applicationDeadline)
        : undefined,
      availableFrom: job?.availableFrom
        ? new Date(job.availableFrom)
        : undefined,
      applicationUrl: job?.applicationUrl || '',
      isFeatured: job?.isFeatured || false,
      minSalary: job?.minSalary || 50000,
      maxSalary: job?.maxSalary || 80000,
      salaryCurrency: job?.salaryCurrency || 'USD',
      equity: job?.equity ?? true,
      responsibilities: job?.responsibilities || [],
      benefits: job?.benefits?.filter((b: string) => b.trim()) || [],
      tags: job?.tags || [],
      isRemote: job?.isRemote || false,
      requiredSkills: job?.requiredSkills || [],
      preferredSkills: job?.preferredSkills || [],
      preferredUniversities: job?.preferredUniversities || [],
      preferredDegrees: job?.preferredDegrees || [],
      preferredLocations: job?.preferredLocations || [],
      preferredIndustries: job?.preferredIndustries || [],
      aiAssessmentSettings: {
        greetingMessage:
          job?.aiAssessmentSettings?.greetingMessage ||
          (IndividualAiAssessmentSettings || aiAssessmentSettings)
            ?.greetingMessage ||
          '',
        requiredSections:
          job?.aiAssessmentSettings?.requiredSections ||
          (IndividualAiAssessmentSettings || aiAssessmentSettings)
            ?.requiredSections ||
          [],
        defaultAssessmentDuration:
          job?.aiAssessmentSettings?.defaultAssessmentDuration ||
          (IndividualAiAssessmentSettings || aiAssessmentSettings)
            ?.defaultAssessmentDuration ||
          1800,
        defaultPassingScore:
          job?.aiAssessmentSettings?.defaultPassingScore ||
          (IndividualAiAssessmentSettings || aiAssessmentSettings)
            ?.defaultPassingScore ||
          0.7,
        maximumAttempts:
          job?.aiAssessmentSettings?.maximumAttempts ||
          (IndividualAiAssessmentSettings || aiAssessmentSettings)
            ?.maximumAttempts ||
          3,
        cooldownPeriod:
          job?.aiAssessmentSettings?.cooldownPeriod ||
          (IndividualAiAssessmentSettings || aiAssessmentSettings)
            ?.cooldownPeriod ||
          24, // Default: 24 hours
        maxAssessmentDuration:
          job?.aiAssessmentSettings?.maxAssessmentDuration ||
          (IndividualAiAssessmentSettings || aiAssessmentSettings)
            ?.maxAssessmentDuration ||
          3600, // Default: 60 minutes
        assessmentBuffer:
          job?.aiAssessmentSettings?.assessmentBuffer ||
          (IndividualAiAssessmentSettings || aiAssessmentSettings)
            ?.assessmentBuffer ||
          600, // Default: 10 minutes
        useCustomPrompts:
          job?.aiAssessmentSettings?.useCustomPrompts ??
          (IndividualAiAssessmentSettings || aiAssessmentSettings)
            ?.useCustomPrompts ??
          false, // Default: false
        aiDifficulty:
          job?.aiAssessmentSettings?.aiDifficulty ||
          (IndividualAiAssessmentSettings || aiAssessmentSettings)
            ?.aiDifficulty ||
          DifficultyLevelEnum.MEDIUM,
        maxSections:
          job?.aiAssessmentSettings?.maxSections ||
          (IndividualAiAssessmentSettings || aiAssessmentSettings)
            ?.maxSections ||
          5,
        maxQuestionsPerSection:
          job?.aiAssessmentSettings?.maxQuestionsPerSection ||
          (IndividualAiAssessmentSettings || aiAssessmentSettings)
            ?.maxQuestionsPerSection ||
          10,
        proctoringEnabled:
          job?.aiAssessmentSettings?.proctoringEnabled ??
          (IndividualAiAssessmentSettings || aiAssessmentSettings)
            ?.proctoringEnabled ??
          true,
        maxWarnings:
          job?.aiAssessmentSettings?.maxWarnings ||
          (IndividualAiAssessmentSettings || aiAssessmentSettings)
            ?.maxWarnings ||
          3,
        tabSwitchLimit:
          job?.aiAssessmentSettings?.tabSwitchLimit ||
          (IndividualAiAssessmentSettings || aiAssessmentSettings)
            ?.tabSwitchLimit ||
          5,
        copyPasteAllowed:
          job?.aiAssessmentSettings?.copyPasteAllowed ??
          (IndividualAiAssessmentSettings || aiAssessmentSettings)
            ?.copyPasteAllowed ??
          false, // Default: false
        videoRecordingEnabled:
          job?.aiAssessmentSettings?.videoRecordingEnabled ??
          (IndividualAiAssessmentSettings || aiAssessmentSettings)
            ?.videoRecordingEnabled ??
          true, // Default: true
        minimumVideoLength:
          job?.aiAssessmentSettings?.minimumVideoLength ||
          (IndividualAiAssessmentSettings || aiAssessmentSettings)
            ?.minimumVideoLength ||
          30,
        aiVideoAnalysisEnabled:
          job?.aiAssessmentSettings?.aiVideoAnalysisEnabled ??
          (IndividualAiAssessmentSettings || aiAssessmentSettings)
            ?.aiVideoAnalysisEnabled ??
          true, // Default: true
        autoPublishOnSuccess:
          job?.aiAssessmentSettings?.autoPublishOnSuccess ??
          (IndividualAiAssessmentSettings || aiAssessmentSettings)
            ?.autoPublishOnSuccess ??
          true,
        autoNotifyOnComplete:
          job?.aiAssessmentSettings?.autoNotifyOnComplete ??
          (IndividualAiAssessmentSettings || aiAssessmentSettings)
            ?.autoNotifyOnComplete ??
          true, // Default: true
        interviewLanguage:
          job?.aiAssessmentSettings?.interviewLanguage ||
          ((IndividualAiAssessmentSettings || aiAssessmentSettings) as any)
            ?.interviewLanguage ||
          'ENGLISH',
        interviewDialect:
          job?.aiAssessmentSettings?.interviewDialect ||
          ((IndividualAiAssessmentSettings || aiAssessmentSettings) as any)
            ?.interviewDialect ||
          'en-US',
        interviewVoiceGender:
          job?.aiAssessmentSettings?.interviewVoiceGender ||
          ((IndividualAiAssessmentSettings || aiAssessmentSettings) as any)
            ?.interviewVoiceGender ||
          'female',
      },
    },
  });

  // Watch form values for quality metrics calculation
  const watchedValues = useWatch({ control: form.control });

  // Effects
  useEffect(() => {
    const metrics = calculateQualityMetrics(watchedValues);
    setQualityMetrics(metrics);
  }, [watchedValues]);

  // Initialize form with AI settings when they're loaded
  useEffect(() => {
    if (aiAssessmentSettings && !job) {
      // For new jobs, set default AI settings
      form.setValue(
        'aiAssessmentSettings.greetingMessage',
        aiAssessmentSettings.greetingMessage || ''
      );
      form.setValue(
        'aiAssessmentSettings.requiredSections',
        aiAssessmentSettings.requiredSections || []
      );
    }
  }, [aiAssessmentSettings, job, form]);

  // Update form with individual AI assessment settings when they're loaded for editing
  useEffect(() => {
    if (
      job &&
      IndividualAiAssessmentSettings &&
      !isLoadingIndividualAiSettings
    ) {
      // For editing jobs, update AI settings with individual job settings
      const effectiveAiSettings = IndividualAiAssessmentSettings;

      // Only update if the individual settings are different from what's currently in the form
      const currentSettings = form.getValues('aiAssessmentSettings');

      if (!currentSettings) return;

      if (
        effectiveAiSettings.greetingMessage !== currentSettings.greetingMessage
      ) {
        form.setValue(
          'aiAssessmentSettings.greetingMessage',
          job.aiAssessmentSettings?.greetingMessage ||
            effectiveAiSettings.greetingMessage ||
            ''
        );
      }

      if (
        JSON.stringify(effectiveAiSettings.requiredSections) !==
        JSON.stringify(currentSettings.requiredSections)
      ) {
        form.setValue(
          'aiAssessmentSettings.requiredSections',
          job.aiAssessmentSettings?.requiredSections ||
            effectiveAiSettings.requiredSections ||
            []
        );
      }

      // Update other AI assessment settings
      const settingsToUpdate = {
        defaultAssessmentDuration:
          effectiveAiSettings.defaultAssessmentDuration,
        defaultPassingScore: effectiveAiSettings.defaultPassingScore,
        maximumAttempts: effectiveAiSettings.maximumAttempts,
        cooldownPeriod: effectiveAiSettings.cooldownPeriod,
        maxAssessmentDuration: effectiveAiSettings.maxAssessmentDuration,
        assessmentBuffer: effectiveAiSettings.assessmentBuffer,
        useCustomPrompts: effectiveAiSettings.useCustomPrompts,
        aiDifficulty: effectiveAiSettings.aiDifficulty,
        maxSections: effectiveAiSettings.maxSections,
        maxQuestionsPerSection: effectiveAiSettings.maxQuestionsPerSection,
        proctoringEnabled: effectiveAiSettings.proctoringEnabled,
        maxWarnings: effectiveAiSettings.maxWarnings,
        tabSwitchLimit: effectiveAiSettings.tabSwitchLimit,
        copyPasteAllowed: effectiveAiSettings.copyPasteAllowed,
        videoRecordingEnabled: effectiveAiSettings.videoRecordingEnabled,
        minimumVideoLength: effectiveAiSettings.minimumVideoLength,
        aiVideoAnalysisEnabled: effectiveAiSettings.aiVideoAnalysisEnabled,
        autoPublishOnSuccess: effectiveAiSettings.autoPublishOnSuccess,
        autoNotifyOnComplete: effectiveAiSettings.autoNotifyOnComplete,
      };

      Object.entries(settingsToUpdate).forEach(([key, value]) => {
        if (value !== undefined) {
          const currentValue =
            currentSettings[key as keyof typeof currentSettings];
          const jobValue =
            job.aiAssessmentSettings?.[
              key as keyof typeof job.aiAssessmentSettings
            ];
          const finalValue = jobValue !== undefined ? jobValue : value;

          if (currentValue !== finalValue) {
            form.setValue(`aiAssessmentSettings.${key}` as any, finalValue);
          }
        }
      });
    }
  }, [
    IndividualAiAssessmentSettings,
    isLoadingIndividualAiSettings,
    job,
    form,
  ]);

  // Reset form when job data is loaded for editing
  useEffect(() => {
    if (job) {
      // Use individual AI assessment settings if available, otherwise fall back to global settings
      const effectiveAiSettings =
        IndividualAiAssessmentSettings || aiAssessmentSettings;

      form.reset({
        title: job.title || '',
        description: job.description || '',
        department: job.department || '',
        jobType: job.jobType || WorkTypeEnum.EMPLOYEE,
        jobCommitment: job.jobCommitment || WorkCommitmentEnum.FULL_TIME,
        jobSchedule: job.jobSchedule || WorkScheduleEnum.REGULAR,
        industry: job.industry || CompanyIndustryEnum.TECHNOLOGY,
        totalExperience: job.totalExperience || 2,
        teamSize: job.teamSize || undefined,
        reportingTo: job.reportingTo || '',
        hiring_manager_email: job.hiring_manager_email || user?.email || '',
        numberOfOpenings: job.numberOfOpenings || 1,
        applicationDeadline: job.applicationDeadline
          ? new Date(job.applicationDeadline)
          : undefined,
        availableFrom: job.availableFrom
          ? new Date(job.availableFrom)
          : undefined,
        applicationUrl: job.applicationUrl || '',
        isFeatured: job.isFeatured || false,
        minSalary: job.minSalary || 50000,
        maxSalary: job.maxSalary || 80000,
        salaryCurrency: job.salaryCurrency || 'USD',
        equity: job.equity ?? true,
        responsibilities: job.responsibilities || [],
        benefits: job.benefits?.filter((b: string) => b.trim()) || [],
        tags: job.tags || [],
        isRemote: job.isRemote || false,
        requiredSkills: job.requiredSkills || [],
        preferredSkills: job.preferredSkills || [],
        preferredUniversities: job.preferredUniversities || [],
        preferredDegrees: job.preferredDegrees || [],
        preferredLocations: job.preferredLocations || [],
        preferredIndustries: job.preferredIndustries || [],
        aiAssessmentSettings: {
          greetingMessage:
            job.aiAssessmentSettings?.greetingMessage ||
            effectiveAiSettings?.greetingMessage ||
            '',
          requiredSections:
            job.aiAssessmentSettings?.requiredSections ||
            effectiveAiSettings?.requiredSections ||
            [],
          defaultAssessmentDuration:
            job.aiAssessmentSettings?.defaultAssessmentDuration ||
            effectiveAiSettings?.defaultAssessmentDuration ||
            1800,
          defaultPassingScore:
            job.aiAssessmentSettings?.defaultPassingScore ||
            effectiveAiSettings?.defaultPassingScore ||
            0.7,
          maximumAttempts:
            job.aiAssessmentSettings?.maximumAttempts ||
            effectiveAiSettings?.maximumAttempts ||
            3,
          cooldownPeriod:
            job.aiAssessmentSettings?.cooldownPeriod ||
            effectiveAiSettings?.cooldownPeriod ||
            24,
          maxAssessmentDuration:
            job.aiAssessmentSettings?.maxAssessmentDuration ||
            effectiveAiSettings?.maxAssessmentDuration ||
            3600,
          assessmentBuffer:
            job.aiAssessmentSettings?.assessmentBuffer ||
            effectiveAiSettings?.assessmentBuffer ||
            600,
          useCustomPrompts:
            job.aiAssessmentSettings?.useCustomPrompts ??
            effectiveAiSettings?.useCustomPrompts ??
            false,
          aiDifficulty:
            job.aiAssessmentSettings?.aiDifficulty ||
            effectiveAiSettings?.aiDifficulty ||
            DifficultyLevelEnum.MEDIUM,
          maxSections:
            job.aiAssessmentSettings?.maxSections ||
            effectiveAiSettings?.maxSections ||
            5,
          maxQuestionsPerSection:
            job.aiAssessmentSettings?.maxQuestionsPerSection ||
            effectiveAiSettings?.maxQuestionsPerSection ||
            10,
          proctoringEnabled:
            job.aiAssessmentSettings?.proctoringEnabled ??
            effectiveAiSettings?.proctoringEnabled ??
            true,
          maxWarnings:
            job.aiAssessmentSettings?.maxWarnings ||
            effectiveAiSettings?.maxWarnings ||
            3,
          tabSwitchLimit:
            job.aiAssessmentSettings?.tabSwitchLimit ||
            effectiveAiSettings?.tabSwitchLimit ||
            5,
          copyPasteAllowed:
            job.aiAssessmentSettings?.copyPasteAllowed ??
            effectiveAiSettings?.copyPasteAllowed ??
            false,
          videoRecordingEnabled:
            job.aiAssessmentSettings?.videoRecordingEnabled ??
            effectiveAiSettings?.videoRecordingEnabled ??
            false,
          minimumVideoLength:
            job.aiAssessmentSettings?.minimumVideoLength ||
            effectiveAiSettings?.minimumVideoLength ||
            30,
          aiVideoAnalysisEnabled:
            job.aiAssessmentSettings?.aiVideoAnalysisEnabled ??
            effectiveAiSettings?.aiVideoAnalysisEnabled ??
            false,
          autoPublishOnSuccess:
            job.aiAssessmentSettings?.autoPublishOnSuccess ??
            effectiveAiSettings?.autoPublishOnSuccess ??
            true,
          autoNotifyOnComplete:
            job.aiAssessmentSettings?.autoNotifyOnComplete ??
            effectiveAiSettings?.autoNotifyOnComplete ??
            true,
          interviewLanguage:
            job.aiAssessmentSettings?.interviewLanguage ||
            (effectiveAiSettings as any)?.interviewLanguage ||
            'ENGLISH',
          interviewDialect:
            job.aiAssessmentSettings?.interviewDialect ||
            (effectiveAiSettings as any)?.interviewDialect ||
            'en-US',
          interviewVoiceGender:
            job.aiAssessmentSettings?.interviewVoiceGender ||
            (effectiveAiSettings as any)?.interviewVoiceGender ||
            'female',
        },
      });
    }
  }, [
    job,
    aiAssessmentSettings,
    IndividualAiAssessmentSettings,
    form,
    user?.email,
  ]);

  useEffect(() => {
    if (!job) {
      const pendingJDData = localStorage.getItem('pendingJDData');

      if (pendingJDData) {
        try {
          const parsedData = JSON.parse(pendingJDData);
          if (parsedData && parsedData.parsedJob) {
            const formData = convertParsedJDToFormData(parsedData);

            Object.entries(formData).forEach(([key, value]) => {
              if (value !== undefined) {
                form.setValue(key as keyof JobFormValues, value as any);
              }
            });

            setFormState((prev) => ({
              ...prev,
              currentMethod: CreationMethod.MANUAL,
              completionData: {
                ...prev.completionData,
                methodSelected: true,
                parsedDataAvailable: true,
              },
            }));

            toast.success('Job description loaded from parsed data!');
          }
        } catch (error) {
          logger.error('Error loading pending JD data:', error);
          localStorage.removeItem('pendingJDData');
        }
      }
    }
  }, [job, form]);

  useEffect(() => {
    // For edit mode, always mark method as selected since we skip method selection
    if (job) {
      setFormState((prev) => ({
        ...prev,
        completionData: { ...prev.completionData, methodSelected: true },
      }));
    } else if (formState.currentMethod !== CreationMethod.METHOD_SELECTION) {
      // For create mode, mark method as selected when user chooses a method
      setFormState((prev) => ({
        ...prev,
        completionData: { ...prev.completionData, methodSelected: true },
      }));
    }
  }, [formState.currentMethod, job]);

  // Get current location and set as default for preferred locations
  const getCurrentLocationAndSetDefault = useCallback(async () => {
    // Only get location for new jobs, not when editing
    if (job) return;

    // Check if we already have preferred locations set
    const currentPreferredLocations = form.getValues('preferredLocations');
    if (currentPreferredLocations && currentPreferredLocations.length > 0) {
      return; // Already has locations set
    }

    setIsGettingLocation(true);
    setLocationPermissionDenied(false);

    try {
      const address = await getCurrentLocationAddress();

      if (address) {
        // Set the current location as the first preferred location
        form.setValue('preferredLocations', [address]);

        // Clear any form errors for preferredLocations
        form.clearErrors('preferredLocations');
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('permission denied')) {
          setLocationPermissionDenied(true);
          toast.error(
            'Location permission denied. Please allow location access or add locations manually.'
          );
        }
      } else {
        toast.error(error instanceof Error ? error.message : 'Unknown error');
      }
    } finally {
      setIsGettingLocation(false);
    }
  }, [job, form]);

  // Get current location when modal loads (for new jobs only)
  useEffect(() => {
    if (!job && formState.currentMethod === CreationMethod.MANUAL) {
      // Small delay to ensure form is properly initialized
      const timer = setTimeout(() => {
        getCurrentLocationAndSetDefault();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [job, formState.currentMethod, getCurrentLocationAndSetDefault]);

  // Clear form errors when preferred locations are set
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (
        name === 'preferredLocations' &&
        value.preferredLocations &&
        value.preferredLocations.length > 0
      ) {
        // Clear the error if locations are now set
        form.clearErrors('preferredLocations');
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  // Auto-save functionality
  useEffect(() => {
    if (formState.currentMethod === CreationMethod.MANUAL) {
      const interval = setInterval(() => {
        const formData = form.getValues();
        localStorage.setItem('jobFormDraft', JSON.stringify(formData));
        setLastAutoSave(new Date());
      }, AUTO_SAVE_INTERVAL);

      return () => clearInterval(interval);
    }
  }, [formState.currentMethod, form]);

  // Processing animation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isUploading) {
      interval = setInterval(() => {
        setCurrentMessageIndex(
          (prev) => (prev + 1) % PROCESSING_MESSAGES.length
        );
        setUploadProgress((prev) => Math.min(prev + 5, 95));
      }, POLLING_INTERVAL);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isUploading]);

  // Method Selection Handler
  const handleMethodSelection = useCallback((method: CreationMethod) => {
    setFormState((prev) => ({
      ...prev,
      currentMethod: method,
      completionData: { ...prev.completionData, methodSelected: true },
    }));
  }, []);

  // Back to Method Selection
  const handleBackToMethodSelection = useCallback(() => {
    setFormState((prev) => ({
      ...prev,
      currentMethod: CreationMethod.METHOD_SELECTION,
      completionData: { ...prev.completionData, methodSelected: false },
    }));
  }, []);

  // File validation
  const validateFile = useCallback((file: File): boolean => {
    const allowedTypes = ['application/pdf'];
    const maxSize = 10 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      const allowedExtensions = ['.pdf'];
      const fileExtension = file.name
        .toLowerCase()
        .substring(file.name.lastIndexOf('.'));
      if (!allowedExtensions.includes(fileExtension)) {
        toast.error('Please upload a PDF file only');
        return false;
      }
    }

    if (file.size > maxSize) {
      toast.error('File size must be less than 10MB');
      return false;
    }

    return true;
  }, []);

  // File handling
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile && validateFile(selectedFile)) {
        setFile(selectedFile);
        setJdText('');
      }
    },
    [validateFile]
  );

  // Drag and drop handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const droppedFile = e.dataTransfer.files[0];
        if (validateFile(droppedFile)) {
          setFile(droppedFile);
          setJdText('');
        }
      }
    },
    [validateFile]
  );

  // Upload success handler
  const handleJDUploadSuccess = useCallback(
    (parsedData: IJobParsed) => {
      try {
        const formData = convertParsedJDToFormData(parsedData);

        Object.entries(formData).forEach(([key, value]) => {
          if (value !== undefined) {
            form.setValue(key as keyof JobFormValues, value as any);
          }
        });

        toast.success('Job description parsed and form filled successfully!');
        setFormState((prev) => ({
          ...prev,
          currentMethod: CreationMethod.MANUAL,
          completionData: { ...prev.completionData, parsedDataAvailable: true },
        }));
        setFile(null);
        setJdText('');
      } catch (error) {
        logger.error('Error processing parsed JD:', error);
        toast.error('Failed to process parsed job description');
      }
    },
    [form]
  );

  // File upload handler
  const handleFileUpload = useCallback(async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    if (!validateFile(file)) return;

    setIsUploading(true);
    setUploadProgress(0);
    setCurrentMessageIndex(0);
    setUploadError(null);

    try {
      const uploadTask =
        await clientJobParsingService.uploadJobDescriptionPublic(
          file,
          'GENERATIVE'
        );

      if (!uploadTask || !uploadTask.id) {
        throw new Error('Failed to start job description parsing');
      }

      const pollTask = async (): Promise<void> => {
        try {
          const taskStatus = await clientJobParsingService.getPublicParsingTask(
            uploadTask.id
          );

          if (taskStatus.status === JobParsingTaskStatusEnum.COMPLETED) {
            const parsedJD =
              await clientJobParsingService.getParsedJobDescriptionFromPublicTask(
                uploadTask.id
              );

            if (!parsedJD) {
              throw new Error('Failed to retrieve parsed job description data');
            }

            setUploadProgress(100);
            handleJDUploadSuccess(parsedJD);
            setIsUploading(false);
          } else if (taskStatus.status === JobParsingTaskStatusEnum.FAILED) {
            setUploadError(
              taskStatus.error || 'Job description parsing failed'
            );
            setIsUploading(false);
            setUploadProgress(100);
            return;
          } else if (
            taskStatus.status === JobParsingTaskStatusEnum.PENDING ||
            taskStatus.status === JobParsingTaskStatusEnum.PROCESSING ||
            taskStatus.status ===
              JobParsingTaskStatusEnum.UPDATING_JOB_POSTING ||
            taskStatus.status === 'LLM_PROCESSING'
          ) {
            setTimeout(pollTask, POLLING_INTERVAL);
          }
        } catch (pollError) {
          logger.error('Job description polling error:', pollError);
          throw pollError;
        }
      };

      await pollTask();
    } catch (error) {
      logger.error('File upload error:', error);
      setUploadError(
        error instanceof Error
          ? error.message
          : 'Failed to upload and parse job description. Please try again.'
      );
      setIsUploading(false);
      setUploadProgress(100);
    }
  }, [file, validateFile, handleJDUploadSuccess]);

  // Text upload handler
  const handleTextUpload = useCallback(async () => {
    if (!jdText.trim()) {
      toast.error('Please enter job description text');
      return;
    }

    if (jdText.trim().length < 50) {
      toast.error('Job description text is too short (minimum 50 characters)');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setCurrentMessageIndex(0);
    setUploadError(null);

    try {
      const textBlob = new Blob([jdText.trim()], { type: 'text/plain' });
      const textFile = new File([textBlob], 'job-description.txt', {
        type: 'text/plain',
      });

      const uploadTask =
        await clientJobParsingService.uploadJobDescriptionPublic(
          textFile,
          'GENERATIVE'
        );

      if (!uploadTask || !uploadTask.id) {
        throw new Error('Failed to start job description parsing');
      }

      const pollTask = async (): Promise<void> => {
        try {
          const taskStatus = await clientJobParsingService.getPublicParsingTask(
            uploadTask.id
          );

          if (taskStatus.status === JobParsingTaskStatusEnum.COMPLETED) {
            const parsedJD =
              await clientJobParsingService.getParsedJobDescriptionFromPublicTask(
                uploadTask.id
              );

            if (!parsedJD) {
              throw new Error('Failed to retrieve parsed job description data');
            }

            setUploadProgress(100);
            handleJDUploadSuccess(parsedJD);
            setIsUploading(false);
          } else if (taskStatus.status === JobParsingTaskStatusEnum.FAILED) {
            setUploadError(
              taskStatus.error || 'Job description parsing failed'
            );
            setIsUploading(false);
            setUploadProgress(100);
            return;
          } else if (
            taskStatus.status === JobParsingTaskStatusEnum.PENDING ||
            taskStatus.status === JobParsingTaskStatusEnum.PROCESSING ||
            taskStatus.status ===
              JobParsingTaskStatusEnum.UPDATING_JOB_POSTING ||
            taskStatus.status === 'LLM_PROCESSING'
          ) {
            setTimeout(pollTask, POLLING_INTERVAL);
          }
        } catch (pollError) {
          logger.error('Job description polling error:', pollError);
          throw pollError;
        }
      };

      await pollTask();
    } catch (error) {
      logger.error('Job description text upload error:', error);
      setUploadError(
        error instanceof Error
          ? error.message
          : 'Failed to process job description. Please try again.'
      );
      setIsUploading(false);
      setUploadProgress(100);
    }
  }, [jdText, handleJDUploadSuccess]);

  // Audio preview function for dialects
  const previewDialectAudio = useCallback(
    async (dialectCode: string, voiceType: 'female' | 'male' = 'female') => {
      try {
        setPreviewingDialect({ code: dialectCode, voiceType });
        const dialect = ENGLISH_DIALECTS.find((d) => d.code === dialectCode);
        if (!dialect) {
          toast.error('Dialect not found');
          return;
        }

        const voice = dialect.voiceOptions[voiceType];
        // Extract language code from voice (e.g., "en-US-Chirp3-HD-Aoede" -> "en-US")
        // This handles cases where dialect uses fallback voices (e.g., en-CA uses en-US voices)
        const voiceLanguageCode = voice.split('-').slice(0, 2).join('-');

        const request: IVoiceSynthesizeRequest = {
          text: DEFAULT_SAMPLE_TEXT.ENGLISH,
          voice: voice,
          languageCode: voiceLanguageCode,
        };

        const response = await voiceService.synthesizeSpeech(request);
        if (response.audioContent) {
          const audioUrl = `data:audio/mp3;base64,${response.audioContent}`;
          setAudioPreviewUrl(audioUrl);

          // Play the audio
          const audio = new Audio(audioUrl);
          audio.play().catch((error) => {
            logger.error('Error playing audio preview:', error);
            toast.error('Failed to play audio preview');
          });

          // Clean up after playback
          audio.onended = () => {
            setPreviewingDialect(null);
            setAudioPreviewUrl(null);
          };
        }
      } catch (error) {
        logger.error('Error generating audio preview:', error);
        toast.error('Failed to generate audio preview');
        setPreviewingDialect(null);
      }
    },
    []
  );

  // Array field management
  const addArrayField = useCallback(
    (fieldName: keyof JobFormValues) => {
      const currentValues = (form.getValues(fieldName) as string[]) || [];
      form.setValue(fieldName, [...currentValues, ''] as any);
    },
    [form]
  );

  const removeArrayField = useCallback(
    (fieldName: keyof JobFormValues, index: number) => {
      const currentValues = (form.getValues(fieldName) as string[]) || [];
      const minLength = fieldName === 'tags' ? 0 : 1;

      if (currentValues.length > minLength) {
        form.setValue(
          fieldName,
          currentValues.filter((_, i) => i !== index) as any
        );
      }
    },
    [form]
  );

  // Section completion checker
  const isSectionCompleted = useCallback(
    (sectionId: string): boolean => {
      const values = form.getValues();
      const errors = form.formState.errors;

      switch (sectionId) {
        case 'basic':
          return (
            !!(
              values.title &&
              values.description &&
              values.title.length >= 10 &&
              values.description.length >= 100 &&
              values.numberOfOpenings
            ) &&
            !errors.title &&
            !errors.description &&
            !errors.numberOfOpenings
          );

        case 'details':
          return (
            !!(
              values.jobType &&
              values.jobCommitment &&
              values.jobSchedule &&
              values.industry &&
              values.totalExperience !== undefined &&
              values.hiring_manager_email
            ) &&
            !errors.jobType &&
            !errors.jobCommitment &&
            !errors.jobSchedule &&
            !errors.industry &&
            !errors.totalExperience &&
            !errors.hiring_manager_email
          );

        case 'compensation':
          return (
            !!(
              values.minSalary &&
              values.maxSalary &&
              values.salaryCurrency &&
              values.minSalary > 0 &&
              values.maxSalary > 0 &&
              values.maxSalary > values.minSalary
            ) &&
            !errors.minSalary &&
            !errors.maxSalary &&
            !errors.salaryCurrency
          );

        case 'requirements':
          return (
            !!(
              values.requiredSkills &&
              values.requiredSkills.length >= 3 &&
              values.requiredSkills.some((skill) => skill.trim()) &&
              values.responsibilities &&
              values.responsibilities.length >= 3 &&
              values.responsibilities.some((resp) => resp.trim())
            ) &&
            !errors.requiredSkills &&
            !errors.responsibilities
          );

        case 'preferences':
          return (
            !!(
              values.preferredLocations &&
              values.preferredLocations.length >= 1 &&
              values.preferredLocations.some((loc) => loc.trim())
            ) && !errors.preferredLocations
          );

        case 'settings':
          return true; // AI Assessment settings are optional

        default:
          return false;
      }
    },
    [form]
  );

  // Section error checker - NEW FUNCTION
  const isSectionHasErrors = useCallback(
    (sectionId: string): boolean => {
      const errors = form.formState.errors;

      switch (sectionId) {
        case 'basic':
          return !!(
            errors.title ||
            errors.description ||
            errors.numberOfOpenings ||
            errors.department
          );

        case 'details':
          return !!(
            errors.jobType ||
            errors.jobCommitment ||
            errors.jobSchedule ||
            errors.industry ||
            errors.totalExperience ||
            errors.hiring_manager_email ||
            errors.teamSize ||
            errors.reportingTo ||
            errors.isRemote
          );

        case 'compensation':
          return !!(
            errors.minSalary ||
            errors.maxSalary ||
            errors.salaryCurrency ||
            errors.benefits ||
            errors.equity
          );

        case 'requirements':
          return !!(
            errors.requiredSkills ||
            errors.responsibilities ||
            errors.preferredSkills ||
            errors.tags
          );

        case 'preferences':
          return !!(
            errors.preferredLocations ||
            errors.preferredUniversities ||
            errors.preferredDegrees ||
            errors.preferredIndustries
          );

        case 'settings':
          return !!errors.aiAssessmentSettings;

        default:
          return false;
      }
    },
    [form.formState.errors]
  );

  // Form submission
  const onSubmit: SubmitHandler<JobFormValues> = useCallback(
    async (data) => {
      try {
        setIsSubmitting(true);

        const isValid = await form.trigger();
        if (!isValid) {
          const errors = form.formState.errors;
          const errorMessages = Object.entries(errors)
            .map(
              ([field, error]) =>
                `${field}: ${error?.message || 'Unknown error'}`
            )
            .join(', ');

          logger.error('Form validation failed:', errors);
          toast.error(`Form validation failed: ${errorMessages}`);
          return;
        }

        const jobData = {
          ...data,
          applicationDeadline: data.applicationDeadline?.toISOString(),
          availableFrom: data.availableFrom?.toISOString(),
          responsibilities: data.responsibilities.filter((r) => r.trim()),
          benefits: data.benefits?.filter((b) => b.trim()) || [],
          tags: data.tags?.filter((t) => t.trim()) || [],
          requiredSkills: data.requiredSkills.filter((s) => s.trim()),
          preferredSkills: data.preferredSkills?.filter((s) => s.trim()) || [],
          preferredUniversities:
            data.preferredUniversities?.filter((u) => u.trim()) || [],
          preferredDegrees:
            data.preferredDegrees?.filter((d) => d.trim()) || [],
          preferredLocations:
            data.preferredLocations?.filter((l) => l.trim()) || [],
          preferredIndustries:
            data.preferredIndustries?.filter((i) => i.trim()) || [],
          aiAssessmentSettings: data.aiAssessmentSettings,
        };

        let response: any;

        if (job) {
          await clientJobPostingService.updateJobPosting(
            job.id,
            jobData as any
          );

          // Invalidate AI assessment settings queries to refresh the data
          queryClient.invalidateQueries({
            queryKey: ['clientAiAssessmentSettings', job.id],
            exact: true,
          });

          // Also invalidate global AI assessment settings
          queryClient.invalidateQueries({
            queryKey: ['clientAiAssessmentSettings'],
            exact: true,
          });

          activityLogService.createActivityLog({
            module: ActivityModuleEnum.JOB,
            action: ActivityActionEnums.UPDATE,
            entityId: user?.clientId,
            entityType: ActivityEntityTypeEnum.JOB_POSTING,
            description: 'Job updated successfully!',
            metadata: {
              userName: user?.name,
              title: ActivityTitleEnum.JOB_UPDATED,
              jobId: job.id,
              clientId: job.clientId,
              jobTitle: job.title,
              jobDescription: job.description,
              jobType: job.jobType,
              jobCommitment: job.jobCommitment,
              link: `/app/client/recruiter/sourcing?jobId=${job.id}`,
            },
          });

          // Set response to job for consistency
          response = job;
        } else {
          response = await clientJobPostingService.createJobPosting(
            jobData as any
          );

          // Invalidate AI assessment settings queries for new job
          queryClient.invalidateQueries({
            queryKey: ['clientAiAssessmentSettings'],
            exact: true,
          });

          activityLogService.createActivityLog({
            module: ActivityModuleEnum.JOB,
            action: ActivityActionEnums.CREATE,
            entityId: user?.clientId,
            entityType: ActivityEntityTypeEnum.JOB_POSTING,
            description: 'Job created successfully!',
            metadata: {
              title: ActivityTitleEnum.JOB_CREATED,
              userName: user?.name,
              clientId: response.clientId,
              jobId: response.id,
              jobTitle: response.title,
              jobDescription: response.description,
              jobType: response.jobType,
              jobCommitment: response.jobCommitment,
              link: `/app/client/recruiter/sourcing?jobId=${response.id}`,
            },
          });
        }

        localStorage.removeItem('jobFormDraft');
        localStorage.removeItem('pendingJDData');
        localStorage.removeItem('pendingJDParsingTask');

        if (job) {
          // For editing, close immediately
          toast.success('Job updated successfully!');
          onSuccess();
          onClose();
        } else {
          // For new job creation, close form and trigger success dialog
          toast.success('Job created successfully!');
          onSuccess();
          onClose();

          // Trigger external success dialog
          if (onJobCreated) {
            onJobCreated(response.id, data.title);
          }
        }
      } catch (error) {
        logger.error('Error saving job:', error);
        let errorMessage = 'Failed to save job';

        if (error instanceof Error) {
          const message = error.message;
          if (message.includes('preferredLocations')) {
            errorMessage = 'Please add at least one preferred location';
          } else if (message.includes('Validation error')) {
            errorMessage = 'Please check all required fields';
          } else {
            errorMessage =
              error instanceof AxiosError
                ? error.response?.data.message
                : error.message;
          }
        }

        toast.error(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    },
    [form, job, onSuccess, onClose, queryClient]
  );

  // Method Selection Component
  const renderMethodSelection = (): React.JSX.Element => (
    <div
      ref={methodSelectionRef}
      id="method-selection"
      className="flex h-full flex-col bg-gray-50/50 dark:bg-gray-900/50"
      data-tour-section="method-selection"
      data-active={
        formState.currentMethod === CreationMethod.METHOD_SELECTION
          ? 'true'
          : 'false'
      }
    >
      {/* Compact Header */}
      <div
        className="px-6 py-6 dark:border-gray-800 dark:bg-gray-900"
        data-tour="method-selection-header"
      >
        <div className="text-center">
          {/* <div className="bg-primary mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl">
            <Briefcase className="h-6 w-6 text-white" />
          </div> */}
          <h1
            className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white"
            data-tour="method-selection-title"
          >
            Choose a method to create a job posting
          </h1>
          <p
            className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-gray-500 dark:text-gray-500"
            data-tour="method-selection-description"
          >
            Select the approach that best fits your hiring needs. From
            AI-powered generation to manual creation, we offer multiple ways to
            create compelling job postings that attract top talent.
          </p>
        </div>
      </div>

      {/* Scrollable Content Area with proper spacing */}
      <div className="flex-1 overflow-y-auto">
        {/* Method Cards Container with proper padding */}
        <div className="px-6 py-6" data-tour="method-cards-container">
          <div className="mx-auto max-w-7xl">
            {/* Responsive Grid: 1 col mobile, 2 cols tablet, 4 cols desktop */}
            <div
              className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"
              data-tour="method-cards-grid"
            >
              {CREATION_METHODS.map((method) => {
                const Icon = method.icon;

                const cardStyles = {
                  blue: 'border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/20 hover:border-primary hover:shadow-primary/20 dark:border-primary/30 dark:from-primary/10 dark:to-primary/5 dark:hover:from-primary/20 dark:hover:to-primary/15 dark:hover:border-primary',
                  green:
                    'border-primary/15 bg-gradient-to-br from-primary/3 to-primary/8 hover:from-primary/8 hover:to-primary/15 hover:border-primary hover:shadow-primary/15 dark:border-primary/25 dark:from-primary/8 dark:to-primary/3 dark:hover:from-primary/15 dark:hover:to-primary/10 dark:hover:border-primary',
                  purple:
                    'border-primary/10 bg-gradient-to-br from-primary/2 to-primary/6 hover:from-primary/6 hover:to-primary/12 hover:border-primary hover:shadow-primary/10 dark:border-primary/20 dark:from-primary/6 dark:to-primary/2 dark:hover:from-primary/12 dark:hover:to-primary/8 dark:hover:border-primary',
                  orange:
                    'border-primary/12 bg-gradient-to-br from-primary/4 to-primary/9 hover:from-primary/9 hover:to-primary/18 hover:border-primary hover:shadow-primary/12 dark:border-primary/22 dark:from-primary/9 dark:to-primary/4 dark:hover:from-primary/18 dark:hover:to-primary/12 dark:hover:border-primary',
                };

                const iconStyles = {
                  blue: 'text-primary dark:text-primary/90 group-hover:text-primary/80 dark:group-hover:text-primary',
                  green:
                    'text-primary/80 dark:text-primary/70 group-hover:text-primary/90 dark:group-hover:text-primary/80',
                  purple:
                    'text-primary/70 dark:text-primary/60 group-hover:text-primary/80 dark:group-hover:text-primary/70',
                  orange:
                    'text-primary/75 dark:text-primary/65 group-hover:text-primary/85 dark:group-hover:text-primary/75',
                };

                return (
                  <Card
                    key={method.id}
                    className={cn(
                      'group relative flex h-full cursor-pointer flex-col border transition-all duration-300 hover:scale-[1.01] hover:shadow-lg',
                      cardStyles[method.color]
                    )}
                    onClick={() => handleMethodSelection(method.id)}
                    data-tour={method.dataTour}
                  >
                    {/* Compact Header */}
                    <CardHeader className="pt-6 pb-4">
                      <div className="flex flex-col items-center space-y-3 text-center">
                        <div className="relative">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/70 shadow-sm dark:bg-gray-800/70">
                            <Icon
                              className={cn(
                                'h-6 w-6 transition-colors duration-200',
                                iconStyles[method.color]
                              )}
                            />
                          </div>
                        </div>

                        <div>
                          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                            {method.title}
                          </CardTitle>
                          <div className="mt-2">
                            <Badge
                              className={cn(
                                'h-4 px-1.5 py-0 text-[10px] font-medium',
                                method.difficulty === 'Easy' &&
                                  'border-green-200 bg-green-100 text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-400',
                                method.difficulty === 'Medium' &&
                                  'border-yellow-200 bg-yellow-100 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
                                method.difficulty === 'Hard' &&
                                  'border-red-200 bg-red-100 text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400'
                              )}
                            >
                              {method.difficulty}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    {/* Compact Content */}
                    <CardContent className="flex-1 space-y-4 pt-3 pb-4">
                      <CardDescription className="min-h-[2.5rem] px-2 text-center text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                        {method.description.substring(0, 80)}...
                      </CardDescription>

                      {/* Compact Benefits - Show only 2 */}
                      <div className="space-y-2.5">
                        <div className="flex flex-col gap-1.5">
                          {method.benefits.slice(0, 4).map((benefit, index) => (
                            <div
                              key={index}
                              className="flex items-center px-2 text-xs text-gray-600 dark:text-gray-400"
                            >
                              <CheckCircle className="mr-1.5 h-3 w-3 flex-shrink-0 text-green-500" />
                              <span className="truncate">{benefit}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Compact Best For */}
                      <div className="mx-2 rounded-md bg-gray-50/70 px-3 py-2.5 dark:bg-gray-800/30">
                        <p className="text-center text-xs leading-tight text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Best for:</span>{' '}
                          {method.bestFor.substring(0, 40)}...
                        </p>
                      </div>
                    </CardContent>

                    {/* Compact Action Button */}
                    <CardFooter className="px-4 pt-3 pb-5">
                      <Button
                        size="sm"
                        className={cn(
                          'h-8 w-full py-2 text-sm font-medium transition-all duration-200',
                          method.color === 'blue' &&
                            'bg-primary hover:bg-primary/90',
                          method.color === 'green' &&
                            'bg-primary/90 hover:bg-primary/80',
                          method.color === 'purple' &&
                            'bg-primary/80 hover:bg-primary/70',
                          method.color === 'orange' &&
                            'bg-primary/85 hover:bg-primary/75'
                        )}
                        data-tour={`method-button-${method.id}`}
                      >
                        {method.actionText.split(' ').slice(0, 2).join(' ')}
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Enhanced Array Field Renderer
  const renderArrayField = (
    fieldName: keyof JobFormValues,
    label: string,
    placeholder: string,
    IconComponent?: React.ComponentType<{ className?: string }>,
    guidance?: FieldGuidance,
    dataTour?: string
  ): React.JSX.Element => (
    <FormField
      key={fieldName}
      control={form.control}
      name={fieldName as any}
      render={({ field, fieldState }) => {
        // Safely handle field.value as array with proper type checking
        const fieldArray = Array.isArray(field.value) ? field.value : [];
        const displayArray = fieldArray.length === 0 ? [''] : fieldArray;

        return (
          <FormItem className="space-y-3">
            <FormLabel className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
              {IconComponent && (
                <IconComponent className="text-primary dark:text-primary/90 h-4 w-4" />
              )}
              {label}
              {guidance && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 cursor-help text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">
                          {guidance.helpText}
                        </p>
                        {guidance.examples.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                              Examples:
                            </p>
                            <ul className="text-xs text-gray-500 dark:text-gray-400">
                              {guidance.examples
                                .slice(0, 2)
                                .map((example, i) => (
                                  <li key={i}>• {example}</li>
                                ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </FormLabel>

            <div className="space-y-0">
              {displayArray.map((value, index) => (
                <div
                  key={index}
                  className="group flex items-center gap-3 rounded-lg p-1 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-900/50"
                >
                  <FormControl>
                    <Input
                      value={value || ''}
                      onChange={(e) => {
                        const currentValues = Array.isArray(field.value)
                          ? field.value
                          : [''];
                        const newValues = [...currentValues];
                        newValues[index] = e.target.value;
                        field.onChange(newValues);
                      }}
                      placeholder={guidance?.placeholder || placeholder}
                      data-tour={dataTour}
                      className={cn(
                        'group-hover:border-primary/30 group-hover:ring-primary/20 h-10 flex-1 transition-all duration-200 group-hover:ring-1',
                        fieldState.error &&
                          'border-red-500 focus:border-red-500 focus:ring-red-500'
                      )}
                    />
                  </FormControl>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => removeArrayField(fieldName, index)}
                          disabled={
                            fieldName === 'tags'
                              ? false
                              : (Array.isArray(field.value) ? field.value : [])
                                  .length <= 1
                          }
                          className="h-12 flex-shrink-0 border-2 border-red-100 bg-red-100 px-3 transition-all duration-200 group-hover:scale-110 hover:scale-105 hover:border-red-600 hover:bg-red-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 disabled:group-hover:scale-100 disabled:hover:scale-100 dark:border-red-400 dark:bg-red-700/50 dark:text-red-100 dark:hover:border-red-300 dark:hover:bg-red-700/70 dark:hover:text-white"
                        >
                          <Minus className="h-4 w-4 font-bold" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Remove {label.replace(/s$/, '')}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={() => addArrayField(fieldName)}
                className="border-primary/30 bg-primary/5 text-primary hover:border-primary/50 hover:bg-primary/10 dark:border-primary/40 dark:bg-primary/10 dark:text-primary/90 dark:hover:border-primary/60 dark:hover:bg-primary/20 h-12 w-full border-dashed transition-all duration-200 hover:scale-[1.02]"
                size="sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add {label.replace(/s$/, '')}
              </Button>
            </div>

            <FormMessage className="text-destructive dark:text-destructive text-xs font-medium" />
          </FormItem>
        );
      }}
    />
  );

  // Enhanced Form Section Renderer
  const renderFormSection = (): React.JSX.Element => {
    switch (formState.activeSection) {
      case 'basic':
        return (
          <div
            ref={basicInfoRef}
            id="basic-info"
            className="space-y-8"
            data-tour-section="basic-info"
            data-active={formState.activeSection === 'basic' ? 'true' : 'false'}
          >
            {/* Section Header */}
            <div
              data-tour="basic-info-header"
              ref={basicInfoHeaderRef}
              id="basic-info-header"
              className="border-primary/20 from-primary/5 to-primary/10 dark:border-primary/30 dark:from-primary/10 dark:to-primary/5 rounded-2xl border bg-gradient-to-r p-6"
            >
              <div className="flex h-full items-center justify-between">
                <div>
                  <h2 className="mb-3 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Job Overview
                  </h2>
                  <p className="text-base leading-relaxed text-gray-600 dark:text-gray-400">
                    Start by providing the essential information about this
                    position.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="px-3 py-1 text-sm">
                    {Math.round((3 / 6) * 100)}% Complete
                  </Badge>
                  {lastAutoSave && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Save className="h-4 w-4" />
                      Auto-saved {lastAutoSave.toLocaleTimeString()}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Job Title Field */}
            <div
              data-tour="job-title-field"
              ref={jobTitleFieldRef}
              id="job-title-field"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field, fieldState }) => (
                  <FormItem className="space-y-3 p-2">
                    <FormLabel className="flex items-center gap-3 text-base font-semibold text-gray-900 dark:text-gray-100">
                      <Briefcase className="text-primary h-5 w-5" />
                      Job Title <span className="text-red-500">*</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-5 w-5 cursor-help text-gray-400 hover:text-gray-600" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-md">
                            <div className="space-y-3">
                              <p className="text-sm font-medium">
                                {FIELD_GUIDANCE.title.helpText}
                              </p>
                              <div>
                                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                                  Examples:
                                </p>
                                <ul className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
                                  {FIELD_GUIDANCE.title.examples.map(
                                    (example, i) => (
                                      <li key={i}>• {example}</li>
                                    )
                                  )}
                                </ul>
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={FIELD_GUIDANCE.title.placeholder}
                        {...field}
                        data-tour="job-title-input"
                        className={cn(
                          'h-10 text-sm',
                          fieldState.error &&
                            'border-red-500 focus:border-red-500 focus:ring-red-500'
                        )}
                      />
                    </FormControl>
                    <div className="flex items-center justify-between">
                      <FormMessage />
                      <span className="text-sm font-medium text-gray-500">
                        {field.value?.length || 0}/
                        {FIELD_GUIDANCE.title.characterLimit?.max}
                      </span>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {/* Job Description Field */}
            <div
              data-tour="job-description-field"
              id="job-description-field"
              ref={jobDescriptionFieldRef}
            >
              <FormField
                control={form.control}
                name="description"
                render={({ field, fieldState }) => (
                  <FormItem className="space-y-3 p-2">
                    <FormLabel className="flex items-center gap-3 text-base font-semibold text-gray-900 dark:text-gray-100">
                      <FileText className="text-primary h-5 w-5" />
                      Job Description <span className="text-red-500">*</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 cursor-help text-gray-400 hover:text-gray-600" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-sm">
                            <div className="space-y-2">
                              <p className="text-sm font-medium">
                                {FIELD_GUIDANCE.description.helpText}
                              </p>
                              <div>
                                <p className="text-xs font-medium text-gray-600">
                                  Best Practices:
                                </p>
                                <ul className="text-xs text-gray-500">
                                  {FIELD_GUIDANCE.description.bestPractices
                                    .slice(0, 3)
                                    .map((practice, i) => (
                                      <li key={i}>• {practice}</li>
                                    ))}
                                </ul>
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder={FIELD_GUIDANCE.description.placeholder}
                        data-tour="job-description-textarea"
                        className={cn(
                          'min-h-[140px] resize-none text-base',
                          fieldState.error &&
                            'border-red-500 focus:border-red-500 focus:ring-red-500'
                        )}
                      />
                    </FormControl>
                    <div className="flex items-center justify-between">
                      <FormMessage />
                      <span
                        className={cn(
                          'text-sm',
                          field.value?.length >= 100
                            ? 'text-gray-500'
                            : 'text-gray-500'
                        )}
                      >
                        {field.value?.length || 0}/
                        {FIELD_GUIDANCE.description.characterLimit?.max}
                      </span>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {/* Department and Number of Openings */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-sm font-semibold">
                      <Building2 className="text-primary h-4 w-4" />
                      Department
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Engineering, Marketing"
                        {...field}
                        data-tour="department-input"
                        className="h-10"
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
                      <Users className="text-primary h-4 w-4" />
                      Number of Openings <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        min={1}
                        data-tour="number-of-openings"
                        className="h-10"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        );

      case 'details':
        return (
          <div
            ref={jobDetailsRef}
            id="job-details"
            className="space-y-6 p-1"
            data-tour-section="job-specification"
            data-active={
              formState.activeSection === 'details' ? 'true' : 'false'
            }
          >
            {/* Section Header */}

            {/* Job Type, Commitment, Schedule, Industry Grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
              <FormField
                control={form.control}
                name="jobType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">
                      Job Type <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger
                          className="h-10"
                          data-tour="job-type-select"
                        >
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
                      Job Commitment <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger
                          className="h-10"
                          data-tour="job-commitment-select"
                        >
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(WorkCommitmentEnum).map((commitment) => (
                          <SelectItem key={commitment} value={commitment}>
                            {formatEnumValue(commitment)}
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
                name="jobSchedule"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">
                      Job Schedule <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger
                          className="h-10"
                          data-tour="job-schedule-select"
                        >
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(WorkScheduleEnum).map((schedule) => (
                          <SelectItem key={schedule} value={schedule}>
                            {formatEnumValue(schedule)}
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
                    <FormLabel className="text-sm font-semibold">
                      Industry <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger
                          className="h-10"
                          data-tour="industry-select"
                        >
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(CompanyIndustryEnum).map((industry) => (
                          <SelectItem key={industry} value={industry}>
                            {formatEnumValue(industry)}
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
                name="totalExperience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">
                      Required Experience (Years){' '}
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        min={0}
                        data-tour="experience-select"
                        className="h-10"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="teamSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">
                      Team Size
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                        min={0}
                        placeholder="Optional"
                        className="h-10"
                        data-tour="team-size-input"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reportingTo"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">
                      Reports To
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Engineering Manager"
                        {...field}
                        className={cn(
                          'h-10',
                          fieldState.error &&
                            'border-red-500 focus:border-red-500 focus:ring-red-500'
                        )}
                        data-tour="reports-to-input"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hiring_manager_email"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">
                      Hiring Manager Email{' '}
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="e.g. hiring@company.com"
                        {...field}
                        className={cn(
                          'h-10',
                          fieldState.error &&
                            'border-red-500 focus:border-red-500 focus:ring-red-500'
                        )}
                        data-tour="hiring-manager-email-input"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Remote Work Option */}
            <div className="border-primary/20 bg-primary/5 dark:border-primary/30 dark:bg-primary/10 rounded-xl border p-6">
              <FormField
                control={form.control}
                name="isRemote"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between">
                    <div className="space-y-0.5">
                      <FormLabel className="flex items-center gap-2 text-base font-semibold">
                        <MapPin className="text-primary dark:text-primary/90 h-5 w-5" />
                        Remote Work
                      </FormLabel>
                      <FormDescription className="text-sm">
                        Enable this if the position allows remote work or is
                        fully remote
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-primary dark:data-[state=checked]:bg-primary/90"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
        );

      case 'compensation':
        return (
          <div
            ref={salaryRef}
            id="salary"
            className="space-y-6 p-1"
            data-tour-section="compensation"
            data-active={
              formState.activeSection === 'compensation' ? 'true' : 'false'
            }
          >
            {/* Section Header */}

            {/* Currency Selection */}
            <FormField
              control={form.control}
              name="salaryCurrency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-sm font-semibold">
                    <Globe className="text-primary h-4 w-4" />
                    Currency <span className="text-red-500">*</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 cursor-help text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs text-sm">
                            Select the currency for this position. Different
                            currencies support different formatting options.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger
                        className="h-10"
                        data-tour="currency-select"
                      >
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(CURRENCY_CONFIGS).map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.code} - {currency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Salary Range Input */}
            <div>
              <SalaryRangeInput
                currencyCode={form.watch('salaryCurrency')}
                minValue={form.watch('minSalary')}
                maxValue={form.watch('maxSalary')}
                onMinChange={(value) => form.setValue('minSalary', value)}
                onMaxChange={(value) => form.setValue('maxSalary', value)}
                unit={salaryUnit}
                onUnitChange={setSalaryUnit}
                minError={undefined}
                maxError={undefined}
                disabled={isSubmitting}
              />
            </div>

            {/* Benefits */}
            <FormField
              control={form.control}
              name="benefits"
              render={({ field, fieldState }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
                    <Award className="text-primary dark:text-primary/90 h-4 w-4" />
                    Benefits & Perks
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 cursor-help text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-sm">
                          <div className="space-y-2">
                            <p className="text-sm font-medium">
                              {FIELD_GUIDANCE.benefits.helpText}
                            </p>
                            <div>
                              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                Examples:
                              </p>
                              <ul className="text-xs text-gray-500 dark:text-gray-400">
                                {FIELD_GUIDANCE.benefits.examples
                                  .slice(0, 2)
                                  .map((example, i) => (
                                    <li key={i}>• {example}</li>
                                  ))}
                              </ul>
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </FormLabel>

                  {/* Benefits Chips */}
                  <div className="space-y-3">
                    {/* Input for adding new benefits */}
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="e.g. Health Insurance, 401k, Flexible PTO"
                        value={newBenefit}
                        data-tour="benefits-and-perks-input"
                        onChange={(e) => setNewBenefit(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && newBenefit.trim()) {
                            e.preventDefault();
                            const currentBenefits = Array.isArray(field.value)
                              ? field.value
                              : [];
                            field.onChange([
                              ...currentBenefits,
                              newBenefit.trim(),
                            ]);
                            setNewBenefit('');
                          }
                        }}
                        className="h-10 flex-1"
                      />
                      <div data-tour="benefits-and-perks-add-button">
                        <Button
                          type="button"
                          onClick={() => {
                            if (newBenefit.trim()) {
                              const currentBenefits = Array.isArray(field.value)
                                ? field.value
                                : [];
                              field.onChange([
                                ...currentBenefits,
                                newBenefit.trim(),
                              ]);
                              setNewBenefit('');
                            }
                          }}
                          disabled={!newBenefit.trim()}
                          className="h-10 px-4"
                        >
                          Add
                        </Button>
                      </div>
                    </div>

                    {/* Benefits Chips */}
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(field.value) &&
                        field.value.map((benefit, index) => (
                          <div
                            key={index}
                            className="group bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20 dark:text-primary/90 dark:hover:bg-primary/30 flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200"
                          >
                            <span>{benefit}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const currentBenefits = Array.isArray(
                                  field.value
                                )
                                  ? field.value
                                  : [];
                                const updatedBenefits = currentBenefits.filter(
                                  (_, i) => i !== index
                                );
                                field.onChange(updatedBenefits);
                              }}
                              className="bg-primary/20 text-primary hover:bg-primary/30 dark:bg-primary/30 dark:hover:bg-primary/50 flex h-4 w-4 items-center justify-center rounded-full transition-colors hover:text-white"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                    </div>

                    {fieldState.error && (
                      <p className="text-sm text-red-500">
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                </FormItem>
              )}
            />
          </div>
        );

      case 'requirements':
        return (
          <div
            ref={requirementsRef}
            id="requirements"
            className="space-y-10 p-1"
            data-tour-section="skills-responsibilities"
            data-active={
              formState.activeSection === 'requirements' ? 'true' : 'false'
            }
          >
            {/* Section Header */}

            {renderArrayField(
              'requiredSkills',
              'Required Skills',
              'e.g. React, Node.js, Python, AWS',
              CheckCircle2,
              FIELD_GUIDANCE.requiredSkills,
              'required-skills-input'
            )}
            {renderArrayField(
              'preferredSkills',
              'Preferred Skills',
              'e.g. GraphQL, Docker, Kubernetes',
              Star,
              FIELD_GUIDANCE.preferredSkills,
              'preferred-skills-input'
            )}
            {renderArrayField(
              'responsibilities',
              'Key Responsibilities',
              'e.g. Design and develop scalable web applications',
              Target,
              FIELD_GUIDANCE.responsibilities,
              'key-responsibilities-input'
            )}
            {renderArrayField(
              'tags',
              'Job Tags (Optional)',
              'e.g. Frontend, Backend, Full-Stack',
              Tag,
              FIELD_GUIDANCE.tags,
              'job-tags-input'
            )}
          </div>
        );

      case 'preferences':
        return (
          <div
            ref={locationRef}
            id="location"
            className="space-y-6 p-1"
            data-tour-section="preferred-qualifications"
            data-active={
              formState.activeSection === 'preferences' ? 'true' : 'false'
            }
          >
            {/* Section Header */}

            {/* Enhanced Universities Field with Chip Input */}
            <FormField
              control={form.control}
              name="preferredUniversities"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
                    <GraduationCap className="text-primary dark:text-primary/90 h-4 w-4" />
                    Preferred Universities
                  </FormLabel>
                  <FormControl>
                    <div className="space-y-3">
                      {/* Input for adding new universities */}
                      <div className="flex gap-2">
                        <Input
                          placeholder="e.g. Stanford, MIT, UC Berkeley"
                          value={newUniversity}
                          data-tour="preferred-universities-input"
                          onChange={(e) => setNewUniversity(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ',') {
                              e.preventDefault();
                              if (newUniversity.trim()) {
                                const currentUniversities = Array.isArray(
                                  field.value
                                )
                                  ? field.value
                                  : [];
                                if (
                                  !currentUniversities.includes(
                                    newUniversity.trim()
                                  )
                                ) {
                                  field.onChange([
                                    ...currentUniversities,
                                    newUniversity.trim(),
                                  ]);
                                }
                                setNewUniversity('');
                              }
                            }
                          }}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          onClick={() => {
                            if (newUniversity.trim()) {
                              const currentUniversities = Array.isArray(
                                field.value
                              )
                                ? field.value
                                : [];
                              if (
                                !currentUniversities.includes(
                                  newUniversity.trim()
                                )
                              ) {
                                field.onChange([
                                  ...currentUniversities,
                                  newUniversity.trim(),
                                ]);
                              }
                              setNewUniversity('');
                            }
                          }}
                          disabled={!newUniversity.trim()}
                          className="px-4"
                        >
                          Add
                        </Button>
                      </div>

                      {/* Display existing universities as chips */}
                      {Array.isArray(field.value) && field.value.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {field.value.map((university, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="gap-1 py-1 pr-1 pl-2 text-xs"
                            >
                              <span className="max-w-[150px] truncate">
                                {university}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const currentUniversities = Array.isArray(
                                    field.value
                                  )
                                    ? field.value
                                    : [];
                                  field.onChange(
                                    currentUniversities.filter(
                                      (_, i) => i !== index
                                    )
                                  );
                                }}
                                className="hover:bg-muted-foreground/20 focus:ring-muted-foreground ml-1 rounded-full p-0.5 focus:ring-1 focus:outline-none"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription className="text-xs text-gray-500 dark:text-gray-400">
                    Press Enter or comma to add universities. Click the X to
                    remove.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Enhanced Degrees Field with Chip Input */}
            <FormField
              control={form.control}
              name="preferredDegrees"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
                    <Award className="text-primary dark:text-primary/90 h-4 w-4" />
                    Preferred Degrees
                  </FormLabel>
                  <FormControl>
                    <div className="space-y-3">
                      {/* Input for adding new degrees */}
                      <div className="flex gap-2">
                        <Input
                          placeholder="e.g. Computer Science, Software Engineering"
                          value={newDegree}
                          data-tour="preferred-degrees-input"
                          onChange={(e) => setNewDegree(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ',') {
                              e.preventDefault();
                              if (newDegree.trim()) {
                                const currentDegrees = Array.isArray(
                                  field.value
                                )
                                  ? field.value
                                  : [];
                                if (
                                  !currentDegrees.includes(newDegree.trim())
                                ) {
                                  field.onChange([
                                    ...currentDegrees,
                                    newDegree.trim(),
                                  ]);
                                }
                                setNewDegree('');
                              }
                            }
                          }}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          onClick={() => {
                            if (newDegree.trim()) {
                              const currentDegrees = Array.isArray(field.value)
                                ? field.value
                                : [];
                              if (!currentDegrees.includes(newDegree.trim())) {
                                field.onChange([
                                  ...currentDegrees,
                                  newDegree.trim(),
                                ]);
                              }
                              setNewDegree('');
                            }
                          }}
                          disabled={!newDegree.trim()}
                          className="px-4"
                        >
                          Add
                        </Button>
                      </div>

                      {/* Display existing degrees as chips */}
                      {Array.isArray(field.value) && field.value.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {field.value.map((degree, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="gap-1 py-1 pr-1 pl-2 text-xs"
                            >
                              <span className="max-w-[150px] truncate">
                                {degree}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const currentDegrees = Array.isArray(
                                    field.value
                                  )
                                    ? field.value
                                    : [];
                                  field.onChange(
                                    currentDegrees.filter((_, i) => i !== index)
                                  );
                                }}
                                className="hover:bg-muted-foreground/20 focus:ring-muted-foreground ml-1 rounded-full p-0.5 focus:ring-1 focus:outline-none"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription className="text-xs text-gray-500 dark:text-gray-400">
                    Press Enter or comma to add degrees. Click the X to remove.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Enhanced Location Field */}
            <FormField
              control={form.control}
              name="preferredLocations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
                    <MapPin className="text-primary dark:text-primary/90 h-4 w-4" />
                    Preferred Locations <span className="text-red-500">*</span>
                    {isGettingLocation && (
                      <div className="text-primary flex items-center gap-1 text-xs">
                        <div className="border-primary h-3 w-3 animate-spin rounded-full border border-t-transparent"></div>
                        <span>Detecting location...</span>
                      </div>
                    )}
                  </FormLabel>
                  <FormControl>
                    <div data-tour="preferred-locations-input">
                      <LocationAutocomplete
                        value={
                          Array.isArray(field.value)
                            ? field.value.join(' | ')
                            : ''
                        }
                        onValueChange={(value) => {
                          const locations = value
                            ? value
                                .split(' | ')
                                ?.map((loc: string) => loc.trim())
                                ?.filter((loc: string) => loc.length > 0)
                            : [];
                          field.onChange(locations);
                        }}
                        placeholder={
                          isGettingLocation
                            ? 'Detecting your location...'
                            : 'Search for preferred locations...'
                        }
                        allowMultiple={true}
                        maxSelections={10}
                        className="h-10"
                        disabled={isGettingLocation}
                      />
                    </div>
                  </FormControl>
                  <div className="flex items-center justify-between">
                    <FormDescription className="text-xs">
                      {isGettingLocation
                        ? 'Getting your current location to set as default...'
                        : 'Select up to 10 preferred locations for this position'}
                    </FormDescription>
                    {!isGettingLocation && !locationPermissionDenied && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={getCurrentLocationAndSetDefault}
                        className="text-primary hover:text-primary/80 h-6 px-2 text-xs"
                      >
                        <MapPin className="mr-1 h-3 w-3" />
                        Use My Location
                      </Button>
                    )}
                  </div>
                  {locationPermissionDenied && (
                    <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                      <span>Location permission denied.</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={getCurrentLocationAndSetDefault}
                        disabled={isGettingLocation}
                        className="h-6 px-2 text-xs"
                      >
                        {isGettingLocation ? (
                          <div className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent"></div>
                        ) : (
                          'Try Again'
                        )}
                      </Button>
                    </div>
                  )}
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {field?.value && field?.value?.length > 0 ? (
                      <span className="text-accent dark:text-accent/90"></span>
                    ) : (
                      <></>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Enhanced Industry Field with Chip Input */}
            <FormField
              control={form.control}
              name="preferredIndustries"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
                    <Building2 className="text-primary dark:text-primary/90 h-4 w-4" />
                    Preferred Industry Experience
                  </FormLabel>
                  <FormControl>
                    <div className="space-y-3">
                      {/* Input for adding new industries */}
                      <div className="flex gap-2">
                        <Input
                          placeholder="e.g. Technology, Healthcare, Finance"
                          data-tour="preferred-industry-experience-input"
                          value={newIndustry}
                          onChange={(e) => setNewIndustry(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ',') {
                              e.preventDefault();
                              if (newIndustry.trim()) {
                                const currentIndustries = Array.isArray(
                                  field.value
                                )
                                  ? field.value
                                  : [];
                                if (
                                  !currentIndustries.includes(
                                    newIndustry.trim()
                                  )
                                ) {
                                  field.onChange([
                                    ...currentIndustries,
                                    newIndustry.trim(),
                                  ]);
                                }
                                setNewIndustry('');
                              }
                            }
                          }}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          onClick={() => {
                            if (newIndustry.trim()) {
                              const currentIndustries = Array.isArray(
                                field.value
                              )
                                ? field.value
                                : [];
                              if (
                                !currentIndustries.includes(newIndustry.trim())
                              ) {
                                field.onChange([
                                  ...currentIndustries,
                                  newIndustry.trim(),
                                ]);
                              }
                              setNewIndustry('');
                            }
                          }}
                          disabled={!newIndustry.trim()}
                          className="px-4"
                        >
                          Add
                        </Button>
                      </div>

                      {/* Display existing industries as chips */}
                      {Array.isArray(field.value) && field.value.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {field.value.map((industry, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="gap-1 py-1 pr-1 pl-2 text-xs"
                            >
                              <span className="max-w-[150px] truncate">
                                {industry}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const currentIndustries = Array.isArray(
                                    field.value
                                  )
                                    ? field.value
                                    : [];
                                  field.onChange(
                                    currentIndustries.filter(
                                      (_, i) => i !== index
                                    )
                                  );
                                }}
                                className="hover:bg-muted-foreground/20 focus:ring-muted-foreground ml-1 rounded-full p-0.5 focus:ring-1 focus:outline-none"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription className="text-xs text-gray-500 dark:text-gray-400">
                    Press Enter or comma to add industries. Click the X to
                    remove.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 'settings':
        return (
          <div
            ref={settingsRef}
            id="settings"
            className="space-y-6 p-1"
            data-tour-section="ai-assessment-settings"
            data-active={
              formState.activeSection === 'settings' ? 'true' : 'false'
            }
          >
            {/* Header Section */}
            <div className="border-primary/20 from-primary/5 to-primary/10 dark:border-primary/30 dark:from-primary/10 dark:to-primary/5 rounded-xl border bg-gradient-to-r p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="mb-2 text-lg font-semibold tracking-tight text-gray-900 dark:text-white">
                    AI Assessment Settings
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Configure AI assessment settings for this job position.
                    {isLoadingAiSettings && (
                      <span className="text-primary ml-2">
                        Loading settings...
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Bot className="text-primary dark:text-primary/90 h-6 w-6" />
                  <span className="text-primary dark:text-primary/90 text-sm font-medium">
                    AI-Powered
                  </span>
                </div>
              </div>
            </div>

            {isLoadingAiSettings ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3">
                  <div className="border-primary/20 border-t-primary h-6 w-6 animate-spin rounded-full border-2"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Loading AI assessment settings...
                  </span>
                </div>
              </div>
            ) : (
              <>
                {/* Basic Configuration Section */}
                <div className="border-primary/20 bg-primary/5 dark:border-primary/30 dark:bg-primary/10 rounded-xl border p-6">
                  <h4 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                    <Settings className="text-primary dark:text-primary/90 h-5 w-5" />
                    Basic Configuration
                  </h4>

                  {/* Greeting Message */}
                  <FormField
                    control={form.control}
                    name="aiAssessmentSettings.greetingMessage"
                    render={({ field }) => (
                      <FormItem className="mb-6">
                        <FormLabel className="flex items-center gap-2 text-sm font-semibold">
                          <MessageCircle className="text-primary h-4 w-4" />
                          Greeting Message
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="h-4 w-4 cursor-help text-gray-400 hover:text-gray-600" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs text-sm">
                                  Welcome message shown to candidates at the
                                  start of their assessment.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Welcome to your AI assessment! Please read all questions carefully and take your time to provide thoughtful responses..."
                            className="min-h-[100px] resize-none"
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          This message will be displayed to candidates before
                          they begin their assessment.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Required Sections */}
                  <FormField
                    control={form.control}
                    name="aiAssessmentSettings.requiredSections"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-sm font-semibold">
                          <FileText className="text-primary h-4 w-4" />
                          Required Sections
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="h-4 w-4 cursor-help text-gray-400 hover:text-gray-600" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs text-sm">
                                  Specify which assessment sections are
                                  mandatory for all candidates.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </FormLabel>
                        <FormControl>
                          <div className="space-y-3">
                            <div className="flex gap-2">
                              <Input
                                data-tour="required-sections-input"
                                value={requiredSectionsInput}
                                onChange={(e) => {
                                  setRequiredSectionsInput(e.target.value);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    if (requiredSectionsInput.trim()) {
                                      const currentSections = Array.isArray(
                                        field.value
                                      )
                                        ? field.value
                                        : [];
                                      const newSection =
                                        requiredSectionsInput.trim();
                                      if (
                                        !currentSections.includes(newSection)
                                      ) {
                                        field.onChange([
                                          ...currentSections,
                                          newSection,
                                        ]);
                                      }
                                      setRequiredSectionsInput('');
                                    }
                                  } else if (e.key === ',') {
                                    e.preventDefault();
                                    if (requiredSectionsInput.trim()) {
                                      const currentSections = Array.isArray(
                                        field.value
                                      )
                                        ? field.value
                                        : [];
                                      const newSection =
                                        requiredSectionsInput.trim();
                                      if (
                                        !currentSections.includes(newSection)
                                      ) {
                                        field.onChange([
                                          ...currentSections,
                                          newSection,
                                        ]);
                                      }
                                      setRequiredSectionsInput('');
                                    }
                                  }
                                }}
                                onBlur={() => {
                                  // Add any remaining text when user leaves the input
                                  if (requiredSectionsInput.trim()) {
                                    const currentSections = Array.isArray(
                                      field.value
                                    )
                                      ? field.value
                                      : [];
                                    const newSection =
                                      requiredSectionsInput.trim();
                                    if (!currentSections.includes(newSection)) {
                                      field.onChange([
                                        ...currentSections,
                                        newSection,
                                      ]);
                                    }
                                    setRequiredSectionsInput('');
                                  }
                                }}
                                placeholder="Type section names and press Enter or comma to add"
                                className="flex-1"
                              />
                              <Button
                                type="button"
                                onClick={() => {
                                  if (requiredSectionsInput.trim()) {
                                    const currentSections = Array.isArray(
                                      field.value
                                    )
                                      ? field.value
                                      : [];
                                    const newSection =
                                      requiredSectionsInput.trim();
                                    if (!currentSections.includes(newSection)) {
                                      field.onChange([
                                        ...currentSections,
                                        newSection,
                                      ]);
                                    }
                                    setRequiredSectionsInput('');
                                  }
                                }}
                                disabled={!requiredSectionsInput.trim()}
                                className="px-4"
                              >
                                Add
                              </Button>
                            </div>
                            {/* Display current sections as chips */}
                            {Array.isArray(field.value) &&
                              field.value.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {field.value.map((section, index) => (
                                    <Badge
                                      key={index}
                                      variant="secondary"
                                      className="gap-1 py-1 pr-1 pl-2 text-xs"
                                    >
                                      <span className="max-w-[150px] truncate">
                                        {section}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const currentSections = Array.isArray(
                                            field.value
                                          )
                                            ? field.value
                                            : [];
                                          field.onChange(
                                            currentSections.filter(
                                              (_, i) => i !== index
                                            )
                                          );
                                        }}
                                        className="hover:bg-muted-foreground/20 focus:ring-muted-foreground ml-1 rounded-full p-0.5 focus:ring-1 focus:outline-none"
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </Badge>
                                  ))}
                                </div>
                              )}
                          </div>
                        </FormControl>
                        <FormDescription className="text-xs">
                          <span className="text-gray-400">
                            Common sections: Technical Skills, Problem Solving,
                            Communication, Cultural Fit, Leadership, Teamwork
                          </span>
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Interview Language & Dialect Selection */}
                  <div className="mt-6 space-y-4">
                    <FormField
                      control={form.control}
                      name="aiAssessmentSettings.interviewLanguage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-sm font-semibold">
                            <Globe className="text-primary h-4 w-4" />
                            Interview Language
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <HelpCircle className="h-4 w-4 cursor-help text-gray-400 hover:text-gray-600" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="max-w-xs text-sm">
                                    Select the primary language for conducting
                                    AI assessments.
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value || 'ENGLISH'}
                            >
                              <SelectTrigger
                                className="h-10"
                                data-tour="interview-language-select"
                              >
                                <SelectValue placeholder="Select language" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ENGLISH">English</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="aiAssessmentSettings.interviewDialect"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-sm font-semibold">
                            <MessageCircle className="text-primary h-4 w-4" />
                            English Dialect
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <HelpCircle className="h-4 w-4 cursor-help text-gray-400 hover:text-gray-600" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="max-w-xs text-sm">
                                    Choose the English dialect for voice
                                    synthesis during assessments. Click the play
                                    button to preview each dialect.
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </FormLabel>
                          <FormControl>
                            <div className="space-y-3">
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value || 'en-US'}
                              >
                                <SelectTrigger
                                  className="h-10"
                                  data-tour="interview-dialect-select"
                                >
                                  <SelectValue placeholder="Select dialect" />
                                </SelectTrigger>
                                <SelectContent>
                                  {ENGLISH_DIALECTS.map((dialect) => (
                                    <SelectItem
                                      key={dialect.code}
                                      value={dialect.code}
                                    >
                                      <div className="flex items-center gap-2">
                                        <span>{dialect.flag}</span>
                                        <span>{dialect.name}</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>

                              {/* Dialect Preview Cards */}
                              <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                                {ENGLISH_DIALECTS.map((dialect) => {
                                  const isSelected =
                                    field.value === dialect.code;
                                  const isPreviewingFemale =
                                    previewingDialect?.code === dialect.code &&
                                    previewingDialect?.voiceType === 'female';
                                  const isPreviewingMale =
                                    previewingDialect?.code === dialect.code &&
                                    previewingDialect?.voiceType === 'male';

                                  return (
                                    <div
                                      key={dialect.code}
                                      className={cn(
                                        'group relative flex flex-col rounded-lg border p-3 transition-all duration-200',
                                        isSelected
                                          ? 'border-primary bg-primary/10 dark:border-primary/30 dark:bg-primary/20'
                                          : 'hover:border-primary/50 hover:bg-primary/5 dark:hover:border-primary/50 dark:hover:bg-primary/10 border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900'
                                      )}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                          <span className="text-2xl">
                                            {dialect.flag}
                                          </span>
                                          <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                              {dialect.name}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                              {dialect.nameNative}
                                            </p>
                                          </div>
                                        </div>
                                        {isSelected && (
                                          <CheckCircle className="text-primary h-4 w-4" />
                                        )}
                                      </div>
                                      <div className="mt-3 flex items-center gap-2">
                                        <TooltipProvider>
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                  previewDialectAudio(
                                                    dialect.code,
                                                    'female'
                                                  )
                                                }
                                                disabled={
                                                  isPreviewingFemale ||
                                                  isPreviewingMale
                                                }
                                                className={cn(
                                                  'h-8 flex-1 gap-1.5 text-xs',
                                                  isPreviewingFemale &&
                                                    'bg-primary/20'
                                                )}
                                                data-tour={`dialect-preview-${dialect.code}-female`}
                                              >
                                                {isPreviewingFemale ? (
                                                  <Loader className="text-primary h-3 w-3 animate-spin" />
                                                ) : (
                                                  <>
                                                    <User className="h-3 w-3 text-pink-600 dark:text-pink-400" />
                                                    <span className="text-xs">
                                                      Female
                                                    </span>
                                                  </>
                                                )}
                                              </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <p>Preview female voice</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>
                                        <TooltipProvider>
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                  previewDialectAudio(
                                                    dialect.code,
                                                    'male'
                                                  )
                                                }
                                                disabled={
                                                  isPreviewingFemale ||
                                                  isPreviewingMale
                                                }
                                                className={cn(
                                                  'h-8 flex-1 gap-1.5 text-xs',
                                                  isPreviewingMale &&
                                                    'bg-primary/20'
                                                )}
                                                data-tour={`dialect-preview-${dialect.code}-male`}
                                              >
                                                {isPreviewingMale ? (
                                                  <Loader className="text-primary h-3 w-3 animate-spin" />
                                                ) : (
                                                  <>
                                                    <Users className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                                                    <span className="text-xs">
                                                      Male
                                                    </span>
                                                  </>
                                                )}
                                              </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <p>Preview male voice</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </FormControl>
                          <FormDescription className="text-xs">
                            Select the English dialect for voice synthesis. Use
                            the preview buttons to hear how each dialect sounds
                            with different voice types.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="aiAssessmentSettings.interviewVoiceGender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-sm font-semibold">
                            <Users className="text-primary h-4 w-4" />
                            Voice Gender
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <HelpCircle className="h-4 w-4 cursor-help text-gray-400 hover:text-gray-600" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="max-w-xs text-sm">
                                    Select the gender of the voice for AI
                                    assessment interviews.
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value || 'female'}
                            >
                              <SelectTrigger
                                className="h-10"
                                data-tour="interview-voice-gender-select"
                              >
                                <SelectValue placeholder="Select voice gender" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="female">
                                  <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                                    <span>Female</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="male">
                                  <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    <span>Male</span>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormDescription className="text-xs">
                            Choose whether to use a female or male voice for the
                            AI assessment interviews.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Assessment Configuration Grid */}
                <div className="border-primary/20 bg-primary/5 dark:border-primary/30 dark:bg-primary/10 rounded-xl border p-6">
                  <h4 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                    <Clock className="text-primary dark:text-primary/90 h-5 w-5" />
                    Assessment Configuration
                  </h4>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="aiAssessmentSettings.defaultAssessmentDuration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-sm font-semibold">
                            <Clock className="text-primary h-4 w-4" />
                            Default Duration (min)
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <HelpCircle className="h-4 w-4 cursor-help text-gray-400 hover:text-gray-600" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="max-w-xs text-sm">
                                    Standard time limit for AI assessments.
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              data-tour="default-duration-input"
                              onChange={(e) =>
                                field.onChange(Number(e.target.value) * 60)
                              }
                              value={Math.round((field.value || 1800) / 60)}
                              min={1}
                              max={120}
                              className="h-10"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="aiAssessmentSettings.defaultPassingScore"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-sm font-semibold">
                            <Target className="text-primary h-4 w-4" />
                            Passing Score (%)
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <HelpCircle className="h-4 w-4 cursor-help text-gray-400 hover:text-gray-600" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="max-w-xs text-sm">
                                    Minimum score required to pass the
                                    assessment.
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              data-tour="default-passing-score-input"
                              onChange={(e) =>
                                field.onChange(Number(e.target.value) / 100)
                              }
                              value={Math.round((field.value || 0.7) * 100)}
                              min={0}
                              max={100}
                              className="h-10"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="aiAssessmentSettings.maximumAttempts"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-sm font-semibold">
                            <Repeat className="text-primary h-4 w-4" />
                            Max Attempts
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <HelpCircle className="h-4 w-4 cursor-help text-gray-400 hover:text-gray-600" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="max-w-xs text-sm">
                                    Maximum number of times a candidate can
                                    retake the assessment.
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              data-tour="max-attempts-input"
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                              value={field.value || 3}
                              min={1}
                              max={10}
                              className="h-10"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* AI Configuration Section */}
                <div className="border-primary/20 bg-primary/5 dark:border-primary/30 dark:bg-primary/10 rounded-xl border p-6">
                  <h4 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                    <Brain className="text-primary dark:text-primary/90 h-5 w-5" />
                    AI Configuration
                  </h4>

                  {/* AI Difficulty Selection */}
                  <FormField
                    control={form.control}
                    name="aiAssessmentSettings.aiDifficulty"
                    render={({ field }) => (
                      <FormItem className="mb-6">
                        <FormLabel className="flex items-center gap-2 text-sm font-semibold">
                          <Brain className="text-primary h-4 w-4" />
                          AI Difficulty Level
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="h-4 w-4 cursor-help text-gray-400 hover:text-gray-600" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs text-sm">
                                  Controls the complexity of AI-generated
                                  questions and evaluation criteria.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger
                              className="h-10"
                              data-tour="ai-difficulty-level-select"
                            >
                              <SelectValue placeholder="Select difficulty level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={DifficultyLevelEnum.EASY}>
                              Easy
                            </SelectItem>
                            <SelectItem value={DifficultyLevelEnum.MEDIUM}>
                              Medium
                            </SelectItem>
                            <SelectItem value={DifficultyLevelEnum.HARD}>
                              Hard
                            </SelectItem>
                            <SelectItem value={DifficultyLevelEnum.EXPERT}>
                              Expert
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Assessment Structure */}
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="aiAssessmentSettings.maxSections"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-sm font-semibold">
                            <FolderOpen className="text-primary h-4 w-4" />
                            Max Sections
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <HelpCircle className="h-4 w-4 cursor-help text-gray-400 hover:text-gray-600" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="max-w-xs text-sm">
                                    Maximum number of sections in an assessment.
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                              value={field.value || 5}
                              min={1}
                              data-tour="max-sections-input"
                              max={20}
                              className="h-10"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="aiAssessmentSettings.maxQuestionsPerSection"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-sm font-semibold">
                            <List className="text-primary h-4 w-4" />
                            Max Questions Per Section
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <HelpCircle className="h-4 w-4 cursor-help text-gray-400 hover:text-gray-600" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="max-w-xs text-sm">
                                    Maximum questions allowed per section.
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              data-tour="max-questions-per-section-input"
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                              value={field.value || 10}
                              min={1}
                              max={50}
                              className="h-10"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Assessment Features Section */}
                <div className="border-primary/20 bg-primary/5 dark:border-primary/30 dark:bg-primary/10 rounded-xl border p-6">
                  <h4 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                    <Zap className="text-primary dark:text-primary/90 h-5 w-5" />
                    Assessment Features
                  </h4>

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="aiAssessmentSettings.proctoringEnabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between">
                          <div className="space-y-0.5">
                            <FormLabel className="flex items-center gap-2 text-base font-semibold">
                              <Shield className="text-primary dark:text-primary/90 h-5 w-5" />
                              Proctoring Enabled
                            </FormLabel>
                            <FormDescription className="text-sm">
                              Monitor candidates during assessment for security
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value || false}
                              onCheckedChange={field.onChange}
                              data-tour="proctoring-enabled-checkbox"
                              className="data-[state=checked]:bg-primary dark:data-[state=checked]:bg-primary/90"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="aiAssessmentSettings.videoRecordingEnabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between">
                          <div className="space-y-0.5">
                            <FormLabel className="flex items-center gap-2 text-base font-semibold">
                              <Video className="text-primary dark:text-primary/90 h-5 w-5" />
                              Video Recording
                            </FormLabel>
                            <FormDescription className="text-sm">
                              Record video during assessment for review
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value || false}
                              onCheckedChange={field.onChange}
                              data-tour="video-recording-enabled-checkbox"
                              className="data-[state=checked]:bg-primary dark:data-[state=checked]:bg-primary/90"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="aiAssessmentSettings.aiVideoAnalysisEnabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between">
                          <div className="space-y-0.5">
                            <FormLabel className="flex items-center gap-2 text-base font-semibold">
                              <BarChart3 className="text-primary dark:text-primary/90 h-5 w-5" />
                              AI Video Analysis
                            </FormLabel>
                            <FormDescription className="text-sm">
                              Use AI to analyze candidate behavior in video
                              recordings
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value || false}
                              onCheckedChange={field.onChange}
                              data-tour="ai-video-analysis-enabled-checkbox"
                              className="data-[state=checked]:bg-primary dark:data-[state=checked]:bg-primary/90"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Conditional Settings Sections */}
                <FormField
                  control={form.control}
                  name="aiAssessmentSettings.proctoringEnabled"
                  render={({ field }) => (
                    <>
                      {field.value && (
                        <div className="space-y-4 rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-900/20">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                            <h4 className="font-medium text-orange-800 dark:text-orange-300">
                              Proctoring Configuration
                            </h4>
                          </div>
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <FormField
                              control={form.control}
                              name="aiAssessmentSettings.maxWarnings"
                              render={({ field: warningField }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-medium text-orange-700 dark:text-orange-300">
                                    Max Warnings
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      {...warningField}
                                      data-tour="proctoring-max-warnings-input"
                                      onChange={(e) =>
                                        warningField.onChange(
                                          Number(e.target.value)
                                        )
                                      }
                                      value={warningField.value || 3}
                                      min={1}
                                      max={10}
                                      className="h-10"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="aiAssessmentSettings.tabSwitchLimit"
                              render={({ field: tabField }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-medium text-orange-700 dark:text-orange-300">
                                    Tab Switch Limit
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      {...tabField}
                                      data-tour="proctoring-tab-switch-limit-input"
                                      onChange={(e) =>
                                        tabField.onChange(
                                          Number(e.target.value)
                                        )
                                      }
                                      value={tabField.value || 5}
                                      min={0}
                                      max={20}
                                      className="h-10"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      )}
                    </>
                  )}
                />

                <FormField
                  control={form.control}
                  name="aiAssessmentSettings.videoRecordingEnabled"
                  render={({ field }) => (
                    <>
                      {field.value && (
                        <div className="space-y-4 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                          <div className="flex items-center gap-2">
                            <PlayCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            <h4 className="font-medium text-blue-800 dark:text-blue-300">
                              Video Recording Configuration
                            </h4>
                          </div>
                          <FormField
                            control={form.control}
                            name="aiAssessmentSettings.minimumVideoLength"
                            render={({ field: videoField }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                  Minimum Video Length (seconds)
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    {...videoField}
                                    onChange={(e) =>
                                      videoField.onChange(
                                        Number(e.target.value)
                                      )
                                    }
                                    value={videoField.value || 30}
                                    min={1}
                                    max={300}
                                    className="h-10"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </>
                  )}
                />
              </>
            )}
          </div>
        );

      default:
        return <div>Section not found</div>;
    }
  };

  // Upload Methods Renderer
  const renderUploadMethod = (): React.JSX.Element => {
    switch (formState.currentMethod) {
      case CreationMethod.PDF_UPLOAD:
        return (
          <div ref={uploadMethodRef} id="upload-method" className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Upload PDF
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Upload your job description PDF for automatic parsing
                </p>
              </div>
              {!job && (
                <Button
                  variant="outline"
                  onClick={handleBackToMethodSelection}
                  disabled={isUploading}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Methods
                </Button>
              )}
            </div>

            {/* File Upload Area */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
              disabled={isUploading}
            />

            {!file && !isUploading ? (
              <div
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className={cn(
                  'group relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center transition-all duration-300 ease-in-out',
                  dragActive
                    ? 'border-primary bg-primary/10 dark:border-primary/90 dark:bg-primary/20 scale-[1.02] shadow-lg'
                    : 'border-primary/30 bg-primary/5 hover:border-primary/50 hover:bg-primary/10 dark:border-primary/40 dark:bg-primary/10 dark:hover:border-primary/60 dark:hover:bg-primary/20 hover:scale-[1.02] hover:shadow-lg',
                  isUploading && 'cursor-not-allowed opacity-50'
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="from-primary to-primary/80 rounded-full bg-gradient-to-br p-4 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl">
                  <Upload className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-primary/80 group-hover:text-primary dark:text-primary/70 dark:group-hover:text-primary/90 mt-6 text-2xl font-bold transition-colors duration-300">
                  Upload Your Job Description PDF
                </h3>
                <p className="text-primary/60 group-hover:text-primary/80 dark:text-primary/60 dark:group-hover:text-primary/70 mt-3 max-w-md text-base transition-colors duration-300">
                  Simply upload your job description PDF and our AI will
                  automatically extract all the key information for you
                </p>
                <div className="text-primary/60 group-hover:text-primary/80 dark:text-primary/60 dark:group-hover:text-primary/70 mt-4 flex items-center justify-center space-x-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>PDF only</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>Max 10MB</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>Instant processing</span>
                  </div>
                </div>
              </div>
            ) : isUploading ? (
              <div className="flex flex-col items-center justify-center gap-4 py-12">
                <div className="relative scale-125">
                  <div className="border-primary/20 border-t-primary h-16 w-16 animate-spin rounded-full border-4"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FileText className="text-primary dark:text-primary/90 h-6 w-6" />
                  </div>
                </div>
                <div className="text-center">
                  <h4 className="text-primary dark:text-primary/90 mb-2 text-lg font-semibold">
                    Analyzing Job Description
                  </h4>
                  <p className="text-primary/80 dark:text-primary/70 mb-4 text-sm">
                    {PROCESSING_MESSAGES[currentMessageIndex]}
                  </p>
                  <div className="mx-auto h-2 w-64 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                    <div
                      className="from-primary to-primary/80 h-2 rounded-full bg-gradient-to-r transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="border-primary/20 bg-primary/5 dark:border-primary/30 dark:bg-primary/10 rounded-lg border p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="text-primary dark:text-primary/90 h-8 w-8" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {file?.name}
                      </p>
                      {file && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => setFile(null)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Remove
                  </Button>
                </div>
                <Button
                  onClick={handleFileUpload}
                  className="mt-4 w-full"
                  disabled={!file}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Parse Job Description
                </Button>
              </div>
            )}

            {uploadError && (
              <div className="rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  {uploadError}
                </p>
              </div>
            )}

            {/* Simple Information Section */}
            <div className="mt-8 text-center">
              <h4 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                How It Works
              </h4>
              <div className="mx-auto max-w-2xl space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center justify-center space-x-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <span>Upload your job description PDF (max 10MB)</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Brain className="h-4 w-4 text-purple-500" />
                  <span>
                    Our AI extracts job title, requirements, skills, and company
                    details
                  </span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>
                    Get a structured, editable job posting ready for review
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      case CreationMethod.TEXT_PASTE:
        return (
          <div className="space-y-6" data-tour="paste-text">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Paste Text
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Paste your job description text for automatic parsing
                </p>
              </div>
              {!job && (
                <Button
                  variant="outline"
                  onClick={handleBackToMethodSelection}
                  disabled={isUploading}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Methods
                </Button>
              )}
            </div>

            {generatedJDText && jdText === generatedJDText && (
              <div className="border-primary/20 bg-primary/10 text-primary dark:border-primary/30 dark:bg-primary/20 dark:text-primary/90 flex items-center rounded-md border p-3">
                <CheckCircle2 className="text-primary dark:text-primary/90 mr-2 h-5 w-5" />
                <p className="text-sm font-medium">
                  AI-generated job description is ready! Review and parse when
                  ready.
                </p>
              </div>
            )}

            <div className="space-y-3">
              <Textarea
                placeholder="Paste your job description here..."
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                disabled={isUploading}
                className="h-auto min-h-[250px] w-full resize-none"
              />
              <div className="flex items-center justify-between">
                <p className="text-primary/60 dark:text-primary/50 text-xs">
                  Minimum 50 characters required
                </p>
                <span
                  className={cn(
                    'text-xs',
                    jdText.length >= 50 ? 'text-accent' : 'text-gray-500'
                  )}
                >
                  {jdText.length} characters
                </span>
              </div>
            </div>

            {isUploading ? (
              <div className="flex flex-col items-center justify-center gap-4 py-8">
                <div className="relative scale-110">
                  <div className="border-primary/20 border-t-primary h-12 w-12 animate-spin rounded-full border-4"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FileText className="text-primary dark:text-primary/90 h-5 w-5" />
                  </div>
                </div>
                <div className="text-center">
                  <h4 className="text-primary dark:text-primary/90 mb-2 text-lg font-semibold">
                    Processing Job Description
                  </h4>
                  <p className="text-primary/80 dark:text-primary/70 mb-4 text-sm">
                    {PROCESSING_MESSAGES[currentMessageIndex]}
                  </p>
                  <div className="mx-auto h-1.5 w-48 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                    <div
                      className="from-primary to-primary/80 h-1.5 rounded-full bg-gradient-to-r transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <Button
                onClick={handleTextUpload}
                disabled={isUploading || jdText.trim().length < 50}
                className="w-full transition-all duration-200"
              >
                {isUploading ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Parse Job Description
                  </>
                )}
              </Button>
            )}

            {uploadError && (
              <div className="rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  {uploadError}
                </p>
              </div>
            )}

            {/* Simple Information Section */}
            <div className="mt-8 text-center">
              <h4 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                How It Works
              </h4>
              <div className="mx-auto max-w-2xl space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center justify-center space-x-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <span>Paste your job description text (any format)</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Brain className="h-4 w-4 text-purple-500" />
                  <span>
                    Our AI extracts job title, requirements, skills, and company
                    details
                  </span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>
                    Get a structured, editable job posting ready for review
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      case CreationMethod.AI_GENERATOR:
        return (
          <div className="space-y-6" data-tour="ai-generator">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  AI Generator
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Answer a few questions to generate a professional job
                  description
                </p>
              </div>
              {!job && (
                <Button
                  variant="outline"
                  onClick={handleBackToMethodSelection}
                  disabled={aiGenerating}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Methods
                </Button>
              )}
            </div>

            <AIJobGenerator
              isGenerating={aiGenerating}
              onGenerate={(data) => {
                setAiGenerating(true);

                setTimeout(() => {
                  const locationText = data.remoteOption
                    ? `${data.location}`
                    : data.location;
                  const jobTitle = data.modeSpecific
                    ? `${data.jobTitle}`
                    : data.jobTitle;

                  const requirements = [
                    `${data.experienceLevel}+ years of experience with modern frameworks`,
                    `Strong proficiency in ${data.jobType === 'fulltime' ? 'full-stack development' : 'contract-based delivery'}`,
                    'Experience with collaborative team environments',
                    'Knowledge of industry best practices and standards',
                    'Understanding of performance optimization techniques',
                  ];

                  const mustHaveSkills =
                    data.requiredSkills.length > 0
                      ? data.requiredSkills
                      : ['JavaScript', 'React', 'TypeScript'];
                  const goodToHaveSkills =
                    data.preferredSkills.length > 0
                      ? data.preferredSkills
                      : ['Next.js', 'GraphQL', 'CSS-in-JS libraries'];

                  const responsibilities = [
                    'Develop and maintain high-quality applications',
                    'Collaborate with cross-functional teams',
                    'Optimize application performance',
                    'Mentor junior developers and conduct code reviews',
                    'Participate in agile development processes',
                  ];

                  const generatedText = `
# ${jobTitle}

**Location:** ${locationText}
**Compensation:** ${formatSalaryDisplay(data.minSalary, data.currency, 'units', false)} - ${formatSalaryDisplay(data.maxSalary, data.currency, 'units', false)}
**Experience Level:** ${data.experienceLevel}+ years
**Employment Type:** ${data.jobType === 'fulltime' ? 'Full-Time' : data.jobType === 'contract' ? 'Contract' : 'Part-Time'}

## Job Overview
We are seeking a talented ${jobTitle} to join our dynamic team. This role offers an exciting opportunity to work with cutting-edge technologies and contribute to innovative projects that make a real impact.

## Requirements
${requirements.map((req) => `• ${req}`).join('\n')}

## Key Responsibilities
${responsibilities.map((resp) => `• ${resp}`).join('\n')}

## Required Skills
${mustHaveSkills.map((skill) => `• ${skill}`).join('\n')}

## Preferred Skills
${goodToHaveSkills.map((skill) => `• ${skill}`).join('\n')}

## What We Offer
• Competitive salary and benefits package
• Flexible working arrangements
• Professional development opportunities
• Collaborative and inclusive work environment
• Cutting-edge technology stack

Join us in building the future of technology!
                  `.trim();

                  setGeneratedJDText(generatedText);
                  setJdText(generatedText);
                  setAiGenerating(false);

                  setFormState((prev) => ({
                    ...prev,
                    currentMethod: CreationMethod.TEXT_PASTE,
                  }));

                  toast.success(
                    'AI-generated job description is ready! You can now review and parse it.'
                  );
                }, 1500);
              }}
              onReset={() => {
                setGeneratedJDText('');
              }}
            />
          </div>
        );

      default:
        return <div>Method not implemented</div>;
    }
  };

  // Manual Form Navigation
  const currentSectionIndex = FORM_SECTIONS.findIndex(
    (s) => s.id === formState.activeSection
  );
  const isFirstSection = currentSectionIndex === 0;
  const isLastSection = currentSectionIndex === FORM_SECTIONS.length - 1;

  // Calculate overall progress
  const completedSections = FORM_SECTIONS.filter((s) =>
    isSectionCompleted(s.id)
  ).length;
  const overallProgress = Math.round(
    (completedSections / FORM_SECTIONS.length) * 100
  );

  // Effect to ensure tour elements are visible when sections change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Find tour elements in the current section
      const tourElements = document.querySelectorAll('[data-tour]');
      tourElements.forEach((element) => {
        const htmlElement = element as HTMLElement;
        const rect = htmlElement.getBoundingClientRect();

        // Check if element is visible
        if (rect.width > 0 && rect.height > 0) {
          ensureTourElementVisible(htmlElement);
        }
      });
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [formState.activeSection]);

  const modalContent = (
    <div
      ref={containerRef}
      className="mx-auto flex h-auto max-h-[90vh] w-full max-w-7xl overflow-hidden rounded-xl border border-gray-200 bg-white pb-10 shadow-2xl dark:border-gray-800 dark:bg-gray-950"
      style={{
        // Add scroll-margin support for tour guide elements
        scrollMarginTop: '60px', // Account for fixed headers
        scrollMarginBottom: '60px',
      }}
    >
      {formState.currentMethod === CreationMethod.METHOD_SELECTION ? (
        // Method Selection View
        <div className="flex w-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {job ? 'Edit Job Posting' : 'Create Job Posting'}
            </h2>
          </div>
          {renderMethodSelection()}
        </div>
      ) : formState.currentMethod === CreationMethod.MANUAL ? (
        // Manual Form View (existing layout)
        <>
          {/* Sidebar */}
          <div
            ref={sidebarRef}
            id="sidebar"
            data-tour="section-navigation"
            className="flex w-72 flex-col border-r border-gray-200 bg-gradient-to-b from-gray-50 to-white dark:border-gray-800 dark:from-gray-950 dark:to-gray-900"
          >
            <div className="flex-shrink-0 border-b border-gray-200 p-5 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {job ? 'Edit Job' : 'Create Job'}
                </h3>
              </div>
              <p className="mt-1.5 text-sm text-gray-600 dark:text-gray-400">
                Complete all sections to {job ? 'update' : 'publish'}
              </p>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Progress
                  </span>
                  <span className="text-gray-500">{overallProgress}%</span>
                </div>
                <Progress value={overallProgress} className="mt-2 h-2" />
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div
                data-tour="form-navigation-sidebar"
                ref={formNavigationSidebarRef}
                id="form-navigation-sidebar"
                className="space-y-2 p-4"
              >
                {FORM_SECTIONS.map((section) => {
                  const Icon = section.icon;
                  const isActive = formState.activeSection === section.id;
                  const isCompleted = isSectionCompleted(section.id);
                  const hasErrors = isSectionHasErrors(section.id);

                  return (
                    <div
                      key={section.id}
                      data-tour={section.dataTour}
                      id={section.dataTour}
                    >
                      <button
                        onClick={() =>
                          setFormState((prev) => ({
                            ...prev,
                            activeSection: section.id,
                          }))
                        }
                        className={cn(
                          'relative w-full rounded-lg p-3.5 text-left transition-all duration-200',
                          isActive
                            ? 'bg-primary dark:bg-primary text-white shadow-md'
                            : hasErrors
                              ? 'border-2 border-red-200 bg-red-50 text-red-800 hover:bg-red-100 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200 dark:hover:bg-red-900/30'
                              : isCompleted
                                ? 'border-primary/20 bg-primary/10 text-primary hover:bg-primary/20 dark:border-primary/30 dark:bg-primary/20 dark:text-primary/90 dark:hover:bg-primary/30 border'
                                : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800'
                        )}
                      >
                        {/* Error indicator strip */}
                        {hasErrors && (
                          <div className="absolute top-0 bottom-0 left-0 w-1 rounded-l-lg bg-red-500" />
                        )}

                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              'flex-shrink-0 rounded-md p-2',
                              isActive
                                ? 'bg-primary-foreground/20'
                                : hasErrors
                                  ? 'bg-red-100 dark:bg-red-900/30'
                                  : isCompleted
                                    ? 'bg-primary/20 dark:bg-primary/30'
                                    : 'bg-gray-100 dark:bg-gray-800'
                            )}
                          >
                            {hasErrors ? (
                              <AlertCircle
                                className={cn(
                                  'h-4 w-4',
                                  isActive
                                    ? 'text-white'
                                    : 'text-red-500 dark:text-red-400'
                                )}
                              />
                            ) : (
                              <Icon
                                className={cn(
                                  'h-4 w-4',
                                  isActive
                                    ? 'text-white'
                                    : isCompleted
                                      ? 'text-primary dark:text-primary/90'
                                      : 'text-gray-600 dark:text-gray-400'
                                )}
                              />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p
                                className={cn(
                                  'line-clamp-1 text-sm font-semibold',
                                  isActive ? 'text-white' : ''
                                )}
                              >
                                {section.title}
                              </p>
                              {hasErrors && (
                                <span
                                  className={cn(
                                    'rounded-full px-1.5 py-0.5 text-xs font-medium',
                                    isActive
                                      ? 'bg-white/20 text-white'
                                      : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                                  )}
                                >
                                  Error
                                </span>
                              )}
                            </div>
                            <p
                              className={cn(
                                'mt-1 line-clamp-2 text-xs',
                                isActive
                                  ? 'text-primary-foreground/80'
                                  : hasErrors
                                    ? 'text-red-600 dark:text-red-400'
                                    : isCompleted
                                      ? 'text-primary/80 dark:text-primary/70'
                                      : 'text-gray-500 dark:text-gray-400'
                              )}
                            >
                              {hasErrors
                                ? 'Please fix validation errors'
                                : section.description}
                            </p>
                          </div>
                          {isCompleted && !hasErrors && (
                            <CheckCircle2 className="text-primary dark:text-primary/90 h-5 w-5 flex-shrink-0" />
                          )}
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Main Content */}
          <div
            ref={mainContentRef}
            id="main-content"
            data-tour="manual-creation"
            className="flex flex-1 flex-col"
          >
            <div
              data-tour="main-content-header"
              id="main-content-header"
              className="flex-shrink-0 border-b border-gray-200 px-8 py-5 dark:border-gray-800"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {
                      FORM_SECTIONS.find(
                        (s) => s.id === formState.activeSection
                      )?.title
                    }
                  </h2>
                  <p className="mt-1.5 text-sm text-gray-600 dark:text-gray-400">
                    {
                      FORM_SECTIONS.find(
                        (s) => s.id === formState.activeSection
                      )?.description
                    }
                  </p>
                </div>
                <div className="flex items-center gap-3"></div>
              </div>
            </div>

            <ScrollArea className="flex-1 px-8 py-5">
              <Form {...form}>
                <div
                  ref={formSectionRef}
                  id="form-section"
                  data-tour="form-section"
                  className="w-full max-w-4xl space-y-6 px-3 py-5"
                >
                  {renderFormSection()}
                </div>
              </Form>
            </ScrollArea>

            {/* Footer */}
            <div
              data-tour="form-footer"
              id="form-footer"
              className="flex-shrink-0 border-t border-gray-200 bg-white/80 px-8 py-6 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
                <div className="flex gap-4">
                  {!isFirstSection && (
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => {
                        setFormState((prev) => ({
                          ...prev,
                          activeSection:
                            FORM_SECTIONS[currentSectionIndex - 1].id,
                        }));
                      }}
                      disabled={isSubmitting}
                      className="border-gray-300 px-4 py-3 font-semibold hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
                    >
                      <ArrowLeft className="mr-2 h-5 w-5" />
                      Previous
                    </Button>
                  )}

                  {!isLastSection ? (
                    <div className="flex items-center gap-3">
                      {!job && formState.activeSection === 'basic' && (
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={handleBackToMethodSelection}
                          disabled={isUploading}
                          className="flex items-center gap-2"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          Back to Methods
                        </Button>
                      )}
                      <div data-tour="next-button" id="next-button">
                        <Button
                          size="lg"
                          onClick={async () => {
                            const section = FORM_SECTIONS.find(
                              (s) => s.id === formState.activeSection
                            );
                            if (section?.requiredFields) {
                              const isValid = await form.trigger(
                                section.requiredFields as any
                              );
                              if (!isValid) {
                                const errors = form.formState.errors;
                                const errorFields = Object.keys(errors).filter(
                                  (key) => section.requiredFields.includes(key)
                                );

                                if (errorFields.length > 0) {
                                  const firstError =
                                    errors[
                                      errorFields[0] as keyof typeof errors
                                    ];
                                  toast.error(
                                    firstError?.message ||
                                      `Please fill in all required fields in ${section.title} before proceeding`
                                  );
                                }
                                return;
                              }
                            }
                            setFormState((prev) => ({
                              ...prev,
                              activeSection:
                                FORM_SECTIONS[currentSectionIndex + 1].id,
                            }));
                          }}
                          disabled={isSubmitting}
                          className="bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90 px-8 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
                        >
                          Next
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div data-tour="create-job-button" id="create-job-button">
                      <Button
                        size="lg"
                        onClick={async () => {
                          const isValid = await form.trigger();
                          if (!isValid) {
                            const errors = form.formState.errors;
                            const errorKeys = Object.keys(errors);
                            if (errorKeys.length > 0) {
                              const firstError =
                                errors[errorKeys[0] as keyof typeof errors];
                              toast.error(
                                firstError?.message ||
                                  'Please fix the form errors before submitting'
                              );
                            }
                            return;
                          }
                          form.handleSubmit(onSubmit)();
                        }}
                        disabled={isSubmitting}
                        className="bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90 px-10 py-3 font-semibold text-white transition-all duration-200 hover:scale-105"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center gap-3">
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            <span>Saving...</span>
                          </div>
                        ) : job ? (
                          'Update Job'
                        ) : (
                          'Create Job'
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        // Upload Methods View
        <div className="flex w-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {job ? 'Edit Job Posting' : 'Create Job Posting'}
            </h2>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {renderUploadMethod()}
          </div>
        </div>
      )}
      {formState.currentMethod === CreationMethod.MANUAL &&
        dialogState.isOpen &&
        currentSectionIndex === 0 && (
          <TourGuide
            tourKey={
              getDialogTourKey(formState.activeSection) ||
              'client_job_basic_info_tour'
            }
            portalContainer={containerRef.current}
            autoStart={true}
          />
        )}
    </div>
  );

  // Return with or without modal wrapper based on isModal prop
  if (isModal) {
    return (
      <DialogTourWrapper
        dialogType="job-creation"
        defaultSection={formState.activeSection}
        onSectionChange={(section) => {
          // Update active section when tour changes sections
          setFormState((prev) => ({ ...prev, activeSection: section }));
        }}
      >
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          {modalContent}
        </div>
      </DialogTourWrapper>
    );
  }

  return modalContent;
}

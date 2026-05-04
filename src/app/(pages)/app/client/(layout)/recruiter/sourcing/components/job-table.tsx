'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Calendar,
  Users,
  Plus,
  Trash2,
  XCircle,
  PlayCircle,
  AlertTriangle,
  Send,
  X,
  AlertCircle,
  CheckCircle,
  Briefcase,
  Clock,
  AlarmClock,
  MapPin,
  List,
  Edit,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  IClientJobPosting,
  IClientJobApplication,
  JobPostingStatusEnum,
  JobPostingAssessmentRecommendationEnum,
  IJobPostingAssessment,
  logger,
  IClientJobPostingList,
} from '@/lib/shared';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn, formatEnumValue, generateNameFromEmail } from '@/lib/utils';
import {
  clientJobInviteApiService,
  clientJobPostingAssessmentService,
} from '@/lib/services/services';
import { toast } from 'sonner';
import { AiAssessmentReviewModal } from './ai-assessment-review-modal';
import AIPoweredLogo from '@/components/app/common/animations/ai-powered-logo';
import { getDateDifferenceInDays } from '@/lib/utils/data-masking';
import { isDevelopmentEnvironment, isLocalEnvironment } from '@/lib/env';

interface JobTableProps {
  jobs: IClientJobPostingList[];
  applications: { [jobId: string]: IClientJobApplication[] };
  recommendations: { [jobId: string]: any[] };
  isLoading: boolean;
  searchQuery: string;
  sortBy: string;
  statusFilter: JobPostingStatusEnum | 'ALL';
  onSearchChange: (query: string) => void;
  onSortChange: (sortBy: string) => void;
  onStatusFilterChange: (status: JobPostingStatusEnum | 'ALL') => void;
  onCreateJob: () => void;
  onEditJob: (job: IClientJobPosting) => void;
  onStatusChange: (
    jobId: string,
    status: JobPostingStatusEnum,
    jobTitle: string
  ) => void;
  onDeleteJob: (jobId: string, jobTitle: string) => void;
  onViewDetails: (job: IClientJobPosting) => void;
  canCreateJob?: boolean;
}

// Get status badge variant
const getStatusBadge = (status: JobPostingStatusEnum) => {
  switch (status) {
    case JobPostingStatusEnum.PUBLISHED:
      return (
        <div className="flex items-center rounded-full bg-green-100 px-3 py-1 text-xs text-green-800">
          <div className="mr-2 h-2 w-2 animate-pulse rounded-full bg-green-600"></div>
          Actively Sourcing
        </div>
      );
    case JobPostingStatusEnum.DRAFT:
      return (
        <Badge className="hover:none inline-flex items-center gap-1.5 border-0 bg-orange-100 px-2.5 py-1 text-xs font-medium text-orange-800 hover:bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400">
          <div className="h-2 w-2 rounded-full bg-orange-600 dark:bg-orange-400"></div>
          Draft
        </Badge>
      );
    case JobPostingStatusEnum.CLOSED:
      return (
        <Badge className="hover:none inline-flex items-center gap-1.5 border-0 bg-red-100 px-2.5 py-1 text-xs font-medium text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400">
          <div className="h-2 w-2 rounded-full bg-red-600 dark:bg-red-400"></div>
          Closed
        </Badge>
      );
    case JobPostingStatusEnum.ARCHIVED:
      return (
        <Badge className="hover:none inline-flex items-center gap-1.5 border-0 bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-800 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300">
          <div className="h-2 w-2 rounded-full bg-gray-600 dark:bg-gray-400"></div>
          Archived
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="hover:none text-xs">
          {status}
        </Badge>
      );
  }
};

// Helper function to get the location display
const getLocationDisplay = (job: IClientJobPosting) => {
  if (job.isRemote) {
    return 'Remote';
  }

  if (job.preferredLocations && job.preferredLocations.length > 0) {
    return job.preferredLocations.join(', ');
  }

  return 'Location not specified';
};

// Helper function to check if publish button should be shown
const shouldShowPublishButton = (assessment: IJobPostingAssessment | null) => {
  if (!assessment || !assessment.recommendation) {
    return false;
  }

  return (
    assessment.recommendation ===
      JobPostingAssessmentRecommendationEnum.RECOMMENDED ||
    assessment.recommendation ===
      JobPostingAssessmentRecommendationEnum.HIGHLY_RECOMMENDED
  );
};

// Helper function to get assessment result badge
const getAssessmentResultBadge = (assessment: IJobPostingAssessment | null) => {
  if (!assessment) {
    return null;
  }

  switch (assessment.result) {
    case 'PASSED':
      return (
        <Badge className="inline-flex items-center gap-1.5 border-0 bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800 hover:bg-green-100 hover:text-green-800 dark:bg-green-900/30 dark:text-green-400">
          <div className="h-2 w-2 rounded-full bg-green-600 dark:bg-green-400"></div>
          Passed
        </Badge>
      );
    case 'AI_REVIEW_FAILED':
      return (
        <Badge className="inline-flex items-center gap-1.5 border-0 bg-red-100 px-2.5 py-1 text-xs font-medium text-red-800 hover:bg-red-100 hover:text-red-800 dark:bg-red-900/30 dark:text-red-400">
          <div className="h-2 w-2 rounded-full bg-red-600 dark:bg-red-400"></div>
          AI Review Failed
        </Badge>
      );
    case 'MANUAL_REVIEW_FAILED':
      return (
        <Badge className="inline-flex items-center gap-1.5 border-0 bg-orange-100 px-2.5 py-1 text-xs font-medium text-orange-800 hover:bg-orange-100 hover:text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
          <div className="h-2 w-2 rounded-full bg-orange-600 dark:bg-orange-400"></div>
          Manual Review Failed
        </Badge>
      );
    case 'NOT_AVAILABLE':
      return (
        <Badge className="inline-flex items-center gap-1.5 border-0 bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-800 hover:bg-gray-100 hover:text-gray-800 dark:bg-gray-700 dark:text-gray-300">
          <div className="h-2 w-2 rounded-full bg-gray-600 dark:bg-gray-400"></div>
          Not Available
        </Badge>
      );
    default:
      return (
        <Badge className="inline-flex items-center gap-1.5 border-0 bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-800 hover:bg-gray-100 hover:text-gray-800 dark:bg-gray-700 dark:text-gray-300">
          <div className="h-2 w-2 rounded-full bg-gray-600 dark:bg-gray-400"></div>
          {formatEnumValue(assessment.result)}
        </Badge>
      );
  }
};

// Helper function to get assessment short description
const getAssessmentDescription = (assessment: IJobPostingAssessment | null) => {
  if (!assessment) {
    return null;
  }

  if (assessment.overallFeedback) {
    // Return first 100 characters of overall feedback
    return assessment.overallFeedback.length > 180
      ? `${assessment.overallFeedback.substring(0, 180)}...`
      : assessment.overallFeedback;
  }

  if (assessment.strengths && assessment.strengths.length > 0) {
    return `Strengths: ${assessment.strengths.slice(0, 2).join(', ')}`;
  }

  if (
    assessment.areasForImprovement &&
    assessment.areasForImprovement.length > 0
  ) {
    return `Areas for improvement: ${assessment.areasForImprovement.slice(0, 2).join(', ')}`;
  }

  return `Score: ${Math.round(assessment.score * 100)}%`;
};

// Utility to truncate description to 20-30 words
function truncateWords(text: string, wordLimit: number = 25): string {
  if (!text) return '';
  const words = text.split(/\s+/);
  if (words.length <= wordLimit) return text;
  return words.slice(0, wordLimit).join(' ') + '...';
}

export function JobTable({
  jobs,
  applications,
  recommendations,
  isLoading,
  searchQuery,
  sortBy,
  statusFilter,
  onSearchChange,
  onSortChange,
  onStatusFilterChange,
  onCreateJob,
  onViewDetails,
  onEditJob,
  onStatusChange,
  onDeleteJob,
  canCreateJob = true,
}: JobTableProps) {
  const [deleteJobId, setDeleteJobId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [selectedJob, setSelectedJob] = useState<IClientJobPosting | null>(
    null
  );
  const [viewType, setViewType] = useState<'grid' | 'list'>('list');
  const [emailInput, setEmailInput] = useState('');
  const [emailList, setEmailList] = useState<string[]>([]);
  const [emailError, setEmailError] = useState<string>('');
  const [isSendingInvites, setIsSendingInvites] = useState(false);
  const [isReviewing, setIsReviewing] = useState<{ [jobId: string]: boolean }>(
    {}
  );

  const [assessments, setAssessments] = useState<{
    [jobId: string]: IJobPostingAssessment | null;
  }>({});
  const [loadingAssessments, setLoadingAssessments] = useState<{
    [jobId: string]: boolean;
  }>({});
  const [showAiAssessmentModal, setShowAiAssessmentModal] = useState(false);
  const [selectedAssessment, setSelectedAssessment] =
    useState<IJobPostingAssessment | null>(null);

  // Load latest assessments for all jobs
  useEffect(() => {
    const loadAssessments = async () => {
      const assessmentPromises = jobs.map(async (job) => {
        try {
          setLoadingAssessments((prev) => ({ ...prev, [job.id]: true }));
          let assessment = null;
          try {
            assessment =
              await clientJobPostingAssessmentService.getLatestAssessment(
                job.id
              );
          } catch (error) {
            // Assessment not found - this is normal for jobs without assessments
            logger.debug(`No assessment found for job: ${job.id}`, error);
          }

          setAssessments((prev) => ({ ...prev, [job.id]: assessment }));
        } catch (error) {
          logger.error('Unexpected error getting assessment for job:', error);
        } finally {
          setLoadingAssessments((prev) => ({ ...prev, [job.id]: false }));
        }
      });

      await Promise.allSettled(assessmentPromises);
    };

    if (jobs.length > 0) {
      loadAssessments();
    }
  }, [jobs]);

  const getApplicationCount = (jobId: string) => {
    return applications[jobId]?.length || 0;
  };

  const handleDeleteConfirm = async () => {
    if (!deleteJobId) return;

    setIsDeleting(true);
    try {
      await onDeleteJob(
        deleteJobId,
        jobs.find((job) => job.id === deleteJobId)?.title || ''
      );
      setDeleteJobId(null);
    } catch (error) {
      logger.info('Error deleting job:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleShareJob = (job: IClientJobPosting, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedJob(job);
    setShowShareDialog(true);
    setEmailList([]);
  };

  const handleReviewJob = async (
    job: IClientJobPosting,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();

    setIsReviewing((prev) => ({ ...prev, [job.id]: true }));
    try {
      await clientJobPostingAssessmentService.startAssessment(job.id);
      toast.success('Job assessment started successfully');

      // Poll for assessment completion since it's a background task
      let assessment = null;
      let attempts = 0;
      const maxAttempts = 10; // Maximum 10 attempts (10 seconds)
      const pollInterval = 4000; // 1 second interval

      while (attempts < maxAttempts) {
        try {
          assessment =
            await clientJobPostingAssessmentService.getLatestAssessment(job.id);
          if (assessment) {
            // Assessment found, break out of polling
            break;
          }
        } catch (error) {
          // Assessment not found yet, continue polling
          logger.debug(
            `Assessment not ready for job ${job.id}, attempt ${attempts + 1}`,
            error
          );
        }

        // Wait before next attempt
        await new Promise((resolve) => setTimeout(resolve, pollInterval));
        attempts++;
      }

      if (assessment) {
        setAssessments((prev) => ({ ...prev, [job.id]: assessment }));
        toast.success('Assessment completed successfully');
      } else {
        // Assessment not found after all attempts
        logger.warn(
          `Assessment not found for job ${job.id} after ${maxAttempts} attempts`
        );
        toast.info(
          'Assessment is being processed. Please check back in a few moments.'
        );
      }
    } catch (error) {
      logger.error('Error in handleReviewJob:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to start assessment'
      );
    } finally {
      setIsReviewing((prev) => ({ ...prev, [job.id]: false }));
    }
  };

  const validateEmail = (email: string): boolean => {
    if (isDevelopmentEnvironment() || isLocalEnvironment()) {
      return true;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const parseEmails = (input: string): string[] => {
    // Split by comma, semicolon, space, or newline, then filter out empty strings
    return input
      .split(/[,;\s\n]+/)
      .map((email) => email.trim())
      .filter((email) => email.length > 0);
  };

  const handleAddEmail = () => {
    // Clear any previous errors first
    setEmailError('');

    const trimmedInput = emailInput.trim();

    // Validation: Check if input is empty
    if (!trimmedInput) {
      setEmailError('Please enter an email address');
      return;
    }

    // Parse multiple emails from input
    const emails = parseEmails(trimmedInput);

    // Validation: Check if we got any emails after parsing
    if (emails.length === 0) {
      setEmailError('Please enter at least one valid email address');
      return;
    }

    const invalidEmails: string[] = [];
    const duplicateEmails: string[] = [];
    const validNewEmails: string[] = [];

    // Validate each email individually
    emails.forEach((email) => {
      // Trim and normalize email
      const normalizedEmail = email.toLowerCase().trim();

      // Validation: Check email format
      if (!validateEmail(normalizedEmail)) {
        invalidEmails.push(email);
      }
      // Validation: Check for duplicates in existing list
      else if (
        emailList.some(
          (existingEmail) => existingEmail.toLowerCase() === normalizedEmail
        )
      ) {
        duplicateEmails.push(email);
      }
      // Validation: Check for duplicates within the current input
      else if (
        validNewEmails.some(
          (validEmail) => validEmail.toLowerCase() === normalizedEmail
        )
      ) {
        duplicateEmails.push(email);
      } else {
        validNewEmails.push(normalizedEmail);
      }
    });

    // Show appropriate error messages based on validation results
    if (invalidEmails.length > 0 && duplicateEmails.length > 0) {
      setEmailError(
        `Invalid emails: ${invalidEmails.join(', ')}. Duplicate emails: ${duplicateEmails.join(', ')}`
      );
    } else if (invalidEmails.length > 0) {
      setEmailError(
        invalidEmails.length === 1
          ? `Invalid email format: ${invalidEmails[0]}`
          : `Invalid email formats: ${invalidEmails.join(', ')}`
      );
    } else if (duplicateEmails.length > 0 && validNewEmails.length === 0) {
      setEmailError(
        duplicateEmails.length === 1
          ? `Email already added: ${duplicateEmails[0]}`
          : `Emails already added: ${duplicateEmails.join(', ')}`
      );
      return;
    } else if (validNewEmails.length === 0) {
      setEmailError('No valid new emails to add');
      return;
    }

    // Only add emails if validation passes
    if (validNewEmails.length > 0) {
      setEmailList([...emailList, ...validNewEmails]);
      setEmailInput('');

      // Show success message if there were some invalid/duplicate emails but some were added
      if (invalidEmails.length > 0 || duplicateEmails.length > 0) {
        // Error message already set above, but don't clear it so user sees what was wrong
        // The valid emails were still added
      } else {
        // All emails were valid and added successfully
        setEmailError('');
      }
    }
  };

  const handleEmailInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setEmailInput(e.target.value);
    setEmailError(''); // Clear error when user starts typing
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    setEmailList(emailList.filter((email) => email !== emailToRemove));
  };

  // UI-based filtering and sorting
  const filteredAndSortedJobs = jobs
    .filter((job) => {
      if (
        statusFilter === 'ALL' &&
        job.status === JobPostingStatusEnum.CLOSED
      ) {
        return false;
      }
      // Status filter
      if (statusFilter !== 'ALL' && job.status !== statusFilter) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const searchableFields = [
          job.title,
          job.department,
          job.description,
          ...job.requiredSkills,
          ...(job.preferredSkills || []),
          ...job.tags,
          ...job.preferredLocations,
        ].filter(Boolean);

        return searchableFields.some((field) =>
          field?.toLowerCase().includes(query)
        );
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'createdAt':
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case 'updatedAt':
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        case 'applications':
          return (
            (getApplicationCount(b.id) || 0) - (getApplicationCount(a.id) || 0)
          );
        default:
          return 0;
      }
    });

  const handleSendInvites = async () => {
    if (!selectedJob) {
      toast.error('No job selected for sharing');
      return;
    }

    if (emailList.length === 0) {
      toast.error('Please add at least one email address');
      return;
    }

    try {
      setIsSendingInvites(true);
      const response = await clientJobInviteApiService.createJobInvite({
        candidates: emailList?.map((email) => ({
          email,
          name: generateNameFromEmail(email),
        })),
        jobTitle: selectedJob.title,
        jobId: selectedJob.id,
      });

      // ApiService unwraps the response, so response is already the array
      const invites = Array.isArray(response) ? response : [];

      if (!invites || invites.length === 0) {
        toast.error(invites?.[0]?.message || 'Failed to send invites');
        return;
      }

      const successfulInvites = invites.filter((invite) => invite.success);
      const failedInvites = invites.filter((invite) => !invite.success);

      // All invites succeeded
      if (failedInvites.length === 0) {
        const message =
          successfulInvites.length === 1
            ? 'Invite sent successfully'
            : `All ${successfulInvites.length} invites sent successfully`;
        toast.success(message);
        return;
      }

      // All invites failed
      if (successfulInvites.length === 0) {
        const errorMessages = failedInvites
          .map((invite) => invite.message)
          .filter(Boolean)
          .join('; ');
        toast.error(
          errorMessages ||
            `Failed to send ${failedInvites.length} invite${failedInvites.length > 1 ? 's' : ''}`
        );
        return;
      }

      // Partial success - some succeeded, some failed
      const errorMessages = failedInvites
        .map((invite) => invite.message)
        .filter(Boolean)
        .join('; ');
      toast.error(
        `${successfulInvites.length} invite${successfulInvites.length > 1 ? 's' : ''} sent, but ${failedInvites.length} failed. ${errorMessages || ''}`
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to send invites'
      );
    } finally {
      setIsSendingInvites(false);
      setShowShareDialog(false);
      setEmailList([]);
      setSelectedJob(null);
    }
  };

  return (
    <div className="space-y-2">
      {/* Header Card - Made Sticky */}
      <div className="bg-muted/80 sticky top-0 z-20 flex w-full py-4 backdrop-blur-3xl">
        <Card className="sticky top-0 z-20 w-full rounded-xl border-0 bg-white shadow-sm dark:bg-gray-900">
          <CardHeader className="dark:bg-primary/10 rounded-xl border-b border-gray-200 bg-white px-6 py-5 dark:border-gray-700">
            <div className="space-y-5">
              {/* Header */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
                    Job Postings
                  </CardTitle>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Manage and track your {jobs.length} job{' '}
                    {jobs.length === 1 ? 'position' : 'positions'}
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Select value={sortBy} onValueChange={onSortChange}>
                    <SelectTrigger className="dark:bg-primary/10 h-10 w-full rounded-lg border-gray-300 bg-white sm:w-40 dark:border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-primary/10 rounded-lg">
                      <SelectItem
                        value="createdAt"
                        className="dark:bg-primary/10 dark:text-white"
                      >
                        <div className="flex items-center gap-2 rounded-lg">
                          <Calendar className="h-4 w-4" />
                          <span>Created Date</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="updatedAt">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Updated Date</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="applications">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>Applications</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2">
                    {/* <Button
                      variant={viewType === 'grid' ? 'default' : 'outline'}
                      size="icon"
                      onClick={() => setViewType('grid')}
                      className="h-10 w-10"
                    >
                      <LayoutGrid className="h-5 w-5" />
                    </Button> */}
                    <Button
                      variant={viewType === 'list' ? 'default' : 'outline'}
                      size="icon"
                      onClick={() => setViewType('list')}
                      className="h-10 w-10"
                    >
                      <List className="h-5 w-5" />
                    </Button>
                  </div>
                  <Button
                    variant="default"
                    onClick={onCreateJob}
                    disabled={!canCreateJob}
                    className="gap-2 rounded-lg"
                  >
                    <Plus className="h-4 w-4" />
                    Create Job
                  </Button>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <Input
                    placeholder="Search jobs by title or department"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="dark:bg-primary/10 rounded-lg border-gray-300 bg-white pl-9 dark:border-gray-600"
                  />
                </div>
                <Select
                  value={statusFilter}
                  onValueChange={onStatusFilterChange}
                >
                  <SelectTrigger className="dark:bg-primary/10 w-full rounded-lg border-gray-300 bg-white sm:w-40 dark:border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg">
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value={JobPostingStatusEnum.PUBLISHED}>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        <span>Active</span>
                      </div>
                    </SelectItem>
                    <SelectItem value={JobPostingStatusEnum.DRAFT}>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                        <span>Draft</span>
                      </div>
                    </SelectItem>
                    <SelectItem value={JobPostingStatusEnum.CLOSED}>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-red-500"></div>
                        <span>Closed</span>
                      </div>
                    </SelectItem>
                    <SelectItem value={JobPostingStatusEnum.ARCHIVED}>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-gray-500"></div>
                        <span>Archived</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Job Cards - Scrollable Container */}
      <div className="space-y-2">
        <div
          className={cn(
            'space-y-2',
            viewType === 'grid' &&
              'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          )}
        >
          {filteredAndSortedJobs.map((job, index) => (
            <div key={job.id + index} data-tour="job-card">
              <Card
                onClick={() => onViewDetails(job)}
                className={cn(
                  'group hover:border-primary/20 dark:hover:border-primary/30 cursor-pointer rounded-xl border border-gray-200 bg-white shadow-none transition-all duration-300 ease-in-out dark:border-gray-700 dark:bg-gray-800/50',
                  viewType === 'grid' &&
                    'flex h-full flex-col hover:scale-[1.02]',
                  viewType === 'list' && 'mb-3'
                )}
              >
                <CardContent
                  className={cn(
                    'relative w-full flex-1 overflow-hidden p-0',
                    viewType === 'grid' && 'flex h-full flex-col'
                  )}
                >
                  <div
                    className={cn(
                      'relative flex w-full items-start justify-between p-6',
                      viewType === 'grid' && 'h-full flex-col'
                    )}
                  >
                    <div
                      className={cn(
                        'flex w-full items-start gap-4',
                        viewType === 'grid' && 'w-full'
                      )}
                    >
                      <div className="flex-1">
                        <div
                          className={cn(
                            'flex w-full items-start gap-4',
                            viewType === 'grid' && 'w-full flex-col'
                          )}
                        >
                          <div
                            className={cn(
                              'w-full space-y-2',
                              viewType === 'grid' && 'relative'
                            )}
                          >
                            {viewType === 'grid' && (
                              <div className="absolute top-0 right-0">
                                {getStatusBadge(job.status)}
                              </div>
                            )}
                            <div
                              className={cn(
                                'flex items-center gap-2',
                                viewType === 'list' && 'justify-between'
                              )}
                            >
                              <h3
                                className={cn(
                                  'group-hover:text-primary bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-lg font-semibold text-gray-900 transition-colors dark:text-white dark:group-hover:text-blue-100',
                                  viewType === 'grid' && 'text-left'
                                )}
                              >
                                {job.title}
                              </h3>
                            </div>
                            {/* Job Description Preview */}
                            {job.description && (
                              <p className="mt-2 line-clamp-2 max-w-5xl overflow-hidden text-sm leading-relaxed break-words whitespace-normal text-gray-600 dark:text-gray-400">
                                {truncateWords(job.description, 40)}
                              </p>
                            )}
                            <div
                              className={cn(
                                'mt-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4',
                                viewType === 'grid' && 'items-start text-left'
                              )}
                            >
                              <div className="flex items-center gap-1.5">
                                <MapPin className="flex h-4 w-4 text-gray-500" />
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                  {getLocationDisplay(job)}
                                </span>
                              </div>
                              <div
                                className={cn(
                                  'flex flex-col gap-2 text-sm text-gray-500 sm:flex-row sm:gap-4 dark:text-gray-400',
                                  viewType === 'grid' && 'justify-start'
                                )}
                              >
                                <div className="flex items-center gap-1.5">
                                  <Briefcase className="flex h-4 w-4 text-gray-500" />
                                  <span className="font-medium text-gray-600 dark:text-gray-300">
                                    {job.jobType
                                      ? formatEnumValue(job.jobType)
                                      : 'Full-time'}{' '}
                                    {`(${
                                      job.jobCommitment &&
                                      formatEnumValue(job.jobCommitment)
                                    })`}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Clock className="flex h-4 w-4 text-gray-500" />
                                  <span className="font-medium text-gray-600 dark:text-gray-300">
                                    {job.totalExperience || 0} years experience
                                  </span>
                                </div>
                              </div>
                              <div
                                className={cn(
                                  'flex flex-col gap-2 text-sm text-gray-500 sm:flex-row sm:flex-wrap sm:gap-3 dark:text-gray-400',
                                  viewType === 'grid' && 'justify-start'
                                )}
                              >
                                {job?.applicationDeadline && (
                                  <div className="flex items-center gap-1.5">
                                    <AlarmClock className="flex h-4 w-4 text-gray-500" />
                                    <span className="font-medium text-gray-600 dark:text-gray-300">
                                      Expires on:{' '}
                                      {format(
                                        new Date(
                                          job?.applicationDeadline || ''
                                        ),
                                        'MMM dd, yyyy'
                                      )}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            {/* Stats section for List View - Only show for non-draft jobs */}
                            {viewType === 'list' &&
                              job.status !== JobPostingStatusEnum.DRAFT && (
                                <div className="mt-3 pt-2">
                                  <div className="grid grid-cols-3 gap-4">
                                    {/* Applications */}
                                    <div className="rounded-lg bg-blue-50 p-3">
                                      <div className="flex items-center justify-between">
                                        <p className="text-xs font-medium text-gray-500">
                                          Applications
                                        </p>
                                      </div>
                                      <div className="mt-1 flex items-baseline">
                                        <span className="text-xl font-bold text-blue-700">
                                          {job.applications?.length || 0}
                                        </span>
                                        <span className="ml-1 text-xs text-gray-500">
                                          total
                                        </span>
                                      </div>
                                    </div>
                                    {/* Recommendations */}
                                    <div className="rounded-lg bg-green-50 p-3">
                                      <p className="text-xs font-medium text-gray-500">
                                        Recommendations
                                      </p>
                                      <div className="mt-1 flex items-baseline">
                                        <span className="text-xl font-bold text-green-700">
                                          {job.recommendations?.length || 0}
                                        </span>
                                        <span className="ml-1 text-xs text-gray-500">
                                          matches
                                        </span>
                                      </div>
                                    </div>
                                    {/* Recommendations */}
                                    <div className="bg-primary/10 rounded-lg p-3">
                                      <p className="text-xs font-medium text-gray-500">
                                        Active since
                                      </p>
                                      <div className="mt-1 flex items-baseline">
                                        <span className="text-primary text-xl font-bold">
                                          {getDateDifferenceInDays(
                                            job?.createdAt || new Date()
                                          )}
                                        </span>
                                        <span className="ml-1 text-xs text-gray-500">
                                          days
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            {/* Assessment Information for List View */}
                            {viewType === 'list' && assessments[job.id] && (
                              <>
                                <div className="my-4 w-full border-t border-gray-200 bg-gradient-to-r from-transparent via-gray-100 to-transparent dark:border-gray-700 dark:via-gray-700"></div>
                                <div className="mt-2 space-y-3">
                                  {/* Job Posting Assessment Header */}
                                  <div className="space-y-2">
                                    <div className="flex w-full items-center justify-between gap-2">
                                      <div className="flex items-center gap-2">
                                        <h4 className="text-sm font-normal whitespace-nowrap text-gray-500 dark:text-white">
                                          Job Posting Assessment
                                        </h4>
                                        <AIPoweredLogo />
                                      </div>

                                      {getAssessmentResultBadge(
                                        assessments[job.id]
                                      )}
                                    </div>

                                    {getAssessmentDescription(
                                      assessments[job.id]
                                    ) && (
                                      <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {getAssessmentDescription(
                                          assessments[job.id]
                                        )}
                                      </p>
                                    )}

                                    <Badge
                                      variant="outline"
                                      className="group hover:bg-primary/10 hover:text-primary mt-2 inline-flex cursor-pointer items-center gap-1.5 px-2 text-xs transition-colors"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedAssessment(
                                          assessments[job.id]!
                                        );
                                        setShowAiAssessmentModal(true);
                                      }}
                                    >
                                      <span>More Details</span>
                                      <svg
                                        className="h-3 w-3 transition-transform group-hover:translate-x-0.5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M9 5l7 7-7 7"
                                        />
                                      </svg>
                                    </Badge>
                                  </div>
                                </div>
                              </>
                            )}

                            {/* Footer with date and actions for List View */}
                            {viewType === 'list' && (
                              <div className="mt-4 border-t border-gray-100 pt-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center text-xs text-gray-500">
                                    <Calendar size={14} className="mr-1" />
                                    Posted on{' '}
                                    {format(
                                      new Date(job.createdAt),
                                      'MMM dd, yyyy'
                                    )}
                                  </div>
                                  <div className="flex space-x-2">
                                    {/* Edit Button - Only for DRAFT jobs */}
                                    {job.status ===
                                      JobPostingStatusEnum.DRAFT && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onEditJob(job);
                                        }}
                                      >
                                        <Edit className="mr-1 h-3.5 w-3.5" />
                                        Edit
                                      </Button>
                                    )}
                                    {/* AI Review Button - Only for DRAFT jobs */}
                                    {job.status ===
                                      JobPostingStatusEnum.DRAFT && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleReviewJob(job, e);
                                        }}
                                        disabled={
                                          isReviewing[job.id] ||
                                          loadingAssessments[job.id]
                                        }
                                      >
                                        {isReviewing[job.id] ? (
                                          <div className="mr-1 h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                        ) : (
                                          <CheckCircle className="mr-1 h-3.5 w-3.5" />
                                        )}
                                        AI Review
                                      </Button>
                                    )}
                                    {/* Invite Button - Only for PUBLISHED jobs */}
                                    {job.status ===
                                      JobPostingStatusEnum.PUBLISHED && (
                                      <Button
                                        size="sm"
                                        variant="default"
                                        className="bg-primary hover:bg-primary/90 flex items-center rounded-lg px-3 py-1.5 text-sm text-white transition-colors"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleShareJob(job, e);
                                        }}
                                      >
                                        <Send className="mr-1 h-3.5 w-3.5" />
                                        Invite
                                      </Button>
                                    )}
                                    {/* Publish Button - Only for DRAFT jobs with assessment */}
                                    {job.status ===
                                      JobPostingStatusEnum.DRAFT &&
                                      shouldShowPublishButton(
                                        assessments[job.id]
                                      ) && (
                                        <div data-tour="publish-job-button">
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="rounded-lg border border-green-300 px-3 py-1.5 text-sm text-green-700 transition-colors hover:bg-green-50"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              onStatusChange(
                                                job.id,
                                                JobPostingStatusEnum.PUBLISHED,
                                                job.title
                                              );
                                            }}
                                          >
                                            <PlayCircle className="mr-1 h-3.5 w-3.5" />
                                            Publish
                                          </Button>
                                        </div>
                                      )}
                                    {/* Close Button - Only for PUBLISHED jobs */}
                                    {job.status ===
                                      JobPostingStatusEnum.PUBLISHED && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-700 transition-colors hover:bg-red-50"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onStatusChange(
                                            job.id,
                                            JobPostingStatusEnum.CLOSED,
                                            job.title
                                          );
                                        }}
                                      >
                                        <XCircle className="mr-1 h-3.5 w-3.5" />
                                        Close
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div
                      className={cn(
                        'flex items-center gap-4',
                        viewType === 'grid' && 'mt-auto w-full flex-col'
                      )}
                    >
                      {viewType === 'grid' &&
                        job.status !== JobPostingStatusEnum.ARCHIVED &&
                        job.status !== JobPostingStatusEnum.CLOSED && (
                          <div className="mt-2 w-full border-t border-gray-200 dark:border-gray-700"></div>
                        )}
                      <div
                        className={cn(
                          'flex items-center gap-4',
                          viewType === 'grid' && 'mt-auto w-full flex-col'
                        )}
                      >
                        {viewType === 'list' && (
                          <div
                            className={cn(
                              'flex items-center gap-2',
                              'absolute top-6 right-6 justify-end'
                            )}
                          >
                            {(job.numberOfViews || 0) > 0 && (
                              <Badge
                                variant="secondary"
                                className="bg-primary/10 text-primary flex items-center gap-1 font-medium dark:bg-blue-900/30 dark:text-blue-300"
                              >
                                {job.numberOfViews || 0} Views
                              </Badge>
                            )}
                            {getApplicationCount(job.id) > 0 && (
                              <Badge
                                variant="secondary"
                                className="bg-primary/10 text-primary flex items-center gap-1 font-medium dark:bg-blue-900/30 dark:text-blue-300"
                              >
                                {getApplicationCount(job.id)} Applications
                              </Badge>
                            )}
                            {getStatusBadge(job.status)}
                          </div>
                        )}

                        {/* Stats section for Grid View - Only show for non-draft jobs */}
                        {viewType === 'grid' &&
                          job.status !== JobPostingStatusEnum.DRAFT && (
                            <div className="mt-5 border-t border-gray-100 pt-4">
                              <div className="grid grid-cols-1 gap-3">
                                {/* Applications */}
                                <div className="rounded-lg bg-blue-50 p-3">
                                  <div className="flex items-center justify-between">
                                    <p className="text-xs font-medium text-gray-500">
                                      Applications
                                    </p>
                                    {assessments[job.id] && (
                                      <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-xs text-indigo-700">
                                        AI
                                      </span>
                                    )}
                                  </div>
                                  <div className="mt-1 flex items-baseline">
                                    <span className="text-xl font-bold text-blue-700">
                                      {getApplicationCount(job.id)}
                                    </span>
                                    <span className="ml-1 text-xs text-gray-500">
                                      total
                                    </span>
                                  </div>
                                </div>
                                {/* Recommendations */}
                                <div className="rounded-lg bg-purple-50 p-3">
                                  <p className="text-xs font-medium text-gray-500">
                                    Recommendations
                                  </p>
                                  <div className="mt-1 flex items-baseline">
                                    <span className="text-lg font-bold text-purple-700">
                                      {recommendations[job.id]?.length || 0}
                                    </span>
                                    <span className="ml-1 text-xs text-gray-500">
                                      matches
                                    </span>
                                  </div>
                                </div>
                                {/* Assessment Status */}
                                <div className="rounded-lg bg-gray-50 p-3">
                                  <p className="text-xs font-medium text-gray-500">
                                    Assessment
                                  </p>
                                  <div className="mt-1 flex items-center">
                                    {assessments[job.id] ? (
                                      <>
                                        <CheckCircle
                                          size={16}
                                          className="mr-1 text-green-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">
                                          {assessments[job.id]?.result ===
                                          'PASSED'
                                            ? 'Passed'
                                            : 'In Review'}
                                        </span>
                                      </>
                                    ) : (
                                      <>
                                        <AlertCircle
                                          size={16}
                                          className="mr-1 text-gray-400"
                                        />
                                        <span className="text-sm font-medium text-gray-700">
                                          Not Started
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                        {/* Action buttons for Grid View */}
                        {viewType === 'grid' && (
                          <div className="mt-4 flex flex-col gap-2 border-t border-gray-100 pt-4">
                            {/* Edit Button - Only for DRAFT jobs */}
                            {job.status === JobPostingStatusEnum.DRAFT && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-full gap-1.5 px-2.5 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEditJob(job);
                                }}
                              >
                                <Edit className="h-3.5 w-3.5" />
                                Edit
                              </Button>
                            )}
                            {(!assessments[job.id] ||
                              assessments[job.id]?.result !== 'PASSED') &&
                              job.status === JobPostingStatusEnum.DRAFT && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-primary h-8 w-full gap-1.5 px-2.5 text-xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleReviewJob(job, e);
                                  }}
                                  disabled={
                                    isReviewing[job.id] ||
                                    loadingAssessments[job.id]
                                  }
                                >
                                  {isReviewing[job.id] ? (
                                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                  ) : (
                                    <CheckCircle className="h-3.5 w-3.5" />
                                  )}
                                  AI Review
                                </Button>
                              )}

                            {job.status === JobPostingStatusEnum.PUBLISHED && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-primary h-8 w-full gap-1.5 px-2.5 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleShareJob(job, e);
                                }}
                              >
                                <Send className="h-3.5 w-3.5" />
                                Invite
                              </Button>
                            )}

                            {job.status === JobPostingStatusEnum.DRAFT &&
                              shouldShowPublishButton(assessments[job.id]) && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 w-full gap-1.5 px-2.5 text-xs text-green-600 hover:text-green-700"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onStatusChange(
                                      job.id,
                                      JobPostingStatusEnum.PUBLISHED,
                                      job.title
                                    );
                                  }}
                                >
                                  <PlayCircle className="h-3.5 w-3.5" />
                                  Publish
                                </Button>
                              )}

                            {job.status === JobPostingStatusEnum.PUBLISHED && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-full gap-1.5 px-2.5 text-xs text-red-600 hover:text-red-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onStatusChange(
                                    job.id,
                                    JobPostingStatusEnum.CLOSED,
                                    job.title
                                  );
                                }}
                              >
                                <XCircle className="h-3.5 w-3.5" />
                                Close
                              </Button>
                            )}
                          </div>
                        )}

                        {/* Footer with date and actions for Grid View */}
                        {viewType === 'grid' && (
                          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                            <div className="flex items-center text-xs text-gray-500">
                              <Calendar size={14} className="mr-1" />
                              Posted on{' '}
                              {format(new Date(job.createdAt), 'MMM dd, yyyy')}
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onViewDetails(job);
                                }}
                              >
                                View Details
                              </Button>
                              <Button
                                size="sm"
                                variant="default"
                                className="flex items-center rounded-lg bg-indigo-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-indigo-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // This could be expanded to show candidate management
                                  onViewDetails(job);
                                }}
                              >
                                <Users size={14} className="mr-1" />
                                Manage Candidates
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>{' '}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {filteredAndSortedJobs.length === 0 && !isLoading && (
        <Card className="rounded-lg border border-gray-200 shadow-none dark:border-gray-700 dark:bg-gray-800">
          <CardContent className="flex min-h-[400px] flex-col items-center justify-center p-12 text-center">
            <div className="mb-6 rounded-full bg-blue-50 p-6 dark:bg-blue-900/20">
              <Search className="text-primary dark:text-primary h-10 w-10" />
            </div>
            <h3 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">
              No job postings found
            </h3>
            <p className="mb-6 max-w-md text-gray-600 dark:text-gray-400">
              {searchQuery
                ? "Try adjusting your search criteria or filters to find what you're looking for"
                : 'Get started by creating your first job posting to attract top talent'}
            </p>
            <Button
              onClick={onCreateJob}
              className="bg-primary hover:bg-primary/80 dark:bg-primary dark:hover:bg-primary/80 gap-2 rounded-lg"
            >
              <Plus className="h-4 w-4" />
              Create Your First Job
            </Button>
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <Card className="rounded-lg border border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <CardContent className="flex min-h-[300px] items-center justify-center">
            <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
              <span>Loading job postings...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteJobId}
        onOpenChange={() => setDeleteJobId(null)}
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex w-full items-center gap-4">
              <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full">
                <AlertTriangle className="text-primary h-6 w-6" />
              </div>
              <div className="flex flex-1 flex-col justify-center">
                <AlertDialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                  Delete Job Posting
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm text-gray-600 dark:text-gray-400">
                  Are you sure you want to delete this job posting? This action
                  cannot be undone and will permanently remove the job from your
                  listings.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-2 gap-3">
            <AlertDialogCancel
              onClick={() => setDeleteJobId(null)}
              className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90 text-white"
            >
              {isDeleting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Job
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Share Job Dialog */}
      <Dialog
        open={showShareDialog}
        onOpenChange={(open) => {
          setShowShareDialog(open);
          if (!open) {
            setSelectedJob(null);
            setEmailInput('');
            setEmailError('');
            setEmailList([]);
          }
        }}
      >
        <DialogContent className="max-w-xl overflow-x-hidden">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Invite Candidates
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              {selectedJob ? (
                <>
                  Share{' '}
                  <span className="font-medium text-gray-900 dark:text-white">
                    {selectedJob.title}
                  </span>{' '}
                  with candidates
                </>
              ) : (
                'Enter email addresses to share this job posting with candidates'
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="w-full space-y-4 overflow-hidden py-6">
            <div className="space-y-2">
              <div className="w-full space-y-4 overflow-hidden p-2">
                <Textarea
                  placeholder="Enter email(s) separated by comma, space, or newline"
                  value={emailInput}
                  onChange={handleEmailInputChange}
                  onKeyDown={(e) => {
                    // Allow Ctrl+Enter or Cmd+Enter to submit
                    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                      e.preventDefault();
                      handleAddEmail();
                    }
                  }}
                  className={cn(
                    'min-h-[80px] w-full resize-y overflow-x-hidden break-words [&::-webkit-resizer]:hidden',
                    emailError && 'border-red-500 focus-visible:ring-red-500'
                  )}
                  rows={3}
                  style={{
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                  }}
                />
                {emailError && (
                  <div className="flex w-full max-w-full flex-wrap items-start gap-1.5 overflow-hidden px-1 text-xs text-red-500">
                    <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
                    <span className="overflow-wrap-anywhere min-w-0 flex-1 break-all">
                      {emailError}
                    </span>
                  </div>
                )}
                {!emailError && (
                  <p className="px-1 text-xs text-gray-500">
                    You can paste multiple emails separated by commas, spaces,
                    or newlines. Press Ctrl+Enter to add emails.
                  </p>
                )}
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={handleAddEmail}
                  className="bg-primary hover:bg-primary/90 gap-2"
                  disabled={!emailInput.trim()}
                >
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>
            </div>

            {emailList.length > 0 && (
              <div className="max-h-[200px] w-full overflow-x-hidden overflow-y-auto rounded-md border border-gray-200 p-2 dark:border-gray-700">
                <div className="flex w-full flex-wrap gap-2">
                  {emailList.map((email) => (
                    <Badge
                      key={email}
                      variant="secondary"
                      className="bg-primary/10 text-primary inline-flex max-w-[calc(100%-0.5rem)] flex-wrap items-center gap-2 pr-2"
                    >
                      <span className="min-w-0 break-all">{email}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 shrink-0 p-0"
                        onClick={() => handleRemoveEmail(email)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowShareDialog(false);
                setEmailInput('');
                setEmailError('');
                setEmailList([]);
                setSelectedJob(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendInvites}
              className="bg-primary hover:bg-primary/90"
              disabled={
                !selectedJob || emailList.length === 0 || isSendingInvites
              }
            >
              {isSendingInvites ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Sending...
                </>
              ) : (
                'Send Invites'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AiAssessmentReviewModal
        open={showAiAssessmentModal}
        onClose={() => setShowAiAssessmentModal(false)}
        assessment={selectedAssessment}
      />
    </div>
  );
}

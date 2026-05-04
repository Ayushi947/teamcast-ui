'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  AlertTriangle,
  ArrowLeft,
  Briefcase,
  Loader2,
  PlayCircle,
  RefreshCw,
} from 'lucide-react';
import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import Banner from '@/components/ui/banner';

// Services
import {
  activityLogService,
  clientJobApplicationService,
  clientJobPostingRecommendationApiService,
  clientJobPostingService,
  clientJobParsingService,
  subscriptionLimitsService,
} from '@/lib/services/services';

// Types
import {
  ActivityEntityTypeEnum,
  ActivityModuleEnum,
  ApplicationStatusEnum,
  IClientJobApplication,
  IClientJobPosting,
  JobPostingStatusEnum,
  JobParsingTaskStatusEnum,
  logger,
} from '@/lib/shared';

// Components
import { CustomTabs } from '@/components/ui/custom-tabs';
import { useApp } from '@/lib/context/app-context';
import { ActivityActionEnums, ActivityTitleEnum } from '@/lib/models/activity';
import { useCreateNotification } from '@/lib/services/notification.service';
import { formatEnumValue } from '@/lib/utils';
import { FinderCandidateTab } from '../components/finder-candidate-tab';
import { JobApplicationsTab } from '../components/job-applications-tab';
import { HiredCandidateTab } from '../components/hired-candidate-tab';
import { JobOverviewTab } from '../components/job-overview-tab';
import { JobRecommendationsTab } from '../components/job-recommendations-tab';
import { JobOutsourceTab } from '../components/job-outsource-tab';
import { JobTable } from '../components/job-table';
import { ComprehensiveJobForm } from '../components/comprehensive-job-form';
import { StatsDashboard } from '../components/stats-dashboard';
import { JobPostingSuccessDialog } from '@/components/ui/job-posting-success-dialog';
import { useRouter, useSearchParams } from 'next/navigation';

import { AIAvatar } from '@/components/app/common/animations/ai-avatar';
import TourGuide from '@/components/tour/tour-guide';

const PROCESSING_MESSAGES = [
  'Uploading job description...',
  'Analyzing requirements and responsibilities...',
  'Extracting key qualifications...',
  'Processing skills and experience requirements...',
  'Identifying role expectations...',
  'Optimizing for candidate matching...',
  'Finalizing job posting details...',
  'Almost ready...',
];

interface LoadingOverlayProps {
  isPolling: boolean;
  pollingMessage: string;
}

const LoadingOverlay = ({ isPolling, pollingMessage }: LoadingOverlayProps) => {
  if (!isPolling) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/90 backdrop-blur-sm"
      style={{
        width: '100vw',
        height: '100vh',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20 }}
        className="bg-card dark:bg-primary/10 relative mx-4 w-full max-w-xl rounded-2xl p-10 shadow-lg"
        style={{ maxHeight: '90vh' }}
      >
        <div className="flex flex-col items-center">
          {/* AI Avatar */}
          <div className="mb-16 scale-125 pt-16">
            <AIAvatar isSpeaking={true} />
          </div>

          {/* Content */}
          <div className="text-center">
            <h3 className="text-foreground mb-4 text-xl font-semibold dark:text-white">
              Processing Job Description
            </h3>
            <p className="text-md text-muted-foreground mb-8 dark:text-gray-300">
              {pollingMessage}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Helper functions for advanced search evaluation
const evaluateFilterCondition = (
  job: IClientJobPosting,
  filter: SearchFilter
): boolean => {
  const fieldValue = getFieldValue(job, filter.field);
  const filterValue = filter.value.toLowerCase();

  switch (filter.comparisonOperator) {
    case '=':
      return fieldValue === filterValue;
    case '!=':
      return fieldValue !== filterValue;
    case '>':
      return parseFloat(fieldValue) > parseFloat(filterValue);
    case '<':
      return parseFloat(fieldValue) < parseFloat(filterValue);
    case '>=':
      return parseFloat(fieldValue) >= parseFloat(filterValue);
    case '<=':
      return parseFloat(fieldValue) <= parseFloat(filterValue);
    case 'contains':
      return fieldValue.includes(filterValue);
    case 'starts_with':
      return fieldValue.startsWith(filterValue);
    default:
      return fieldValue.includes(filterValue);
  }
};

const getFieldValue = (job: IClientJobPosting, field: string): string => {
  switch (field) {
    case 'title':
      return job.title?.toString().toLowerCase() || '';
    case 'description':
      return job.description?.toString().toLowerCase() || '';
    case 'department':
      return job.department?.toString().toLowerCase() || '';
    case 'location':
      return job.preferredLocations?.toString().toLowerCase() || '';
    case 'skills':
      return job.requiredSkills?.join(' ').toLowerCase() || '';
    case 'experience':
      return job.totalExperience?.toString() || '0';
    case 'salary':
      return job.minSalary?.toString() || '0';
    case 'employment_type':
      return job.jobType?.toString().toLowerCase() || '';
    case 'remote':
      return job.isRemote ? 'true' : 'false';
    default:
      return (job as any)[field]?.toString().toLowerCase() || '';
  }
};

const evaluateComplexQuery = (
  job: IClientJobPosting,
  filters: SearchFilter[]
): boolean => {
  // This is a simplified implementation of complex query evaluation
  // In a real-world scenario, you might want to use a proper expression parser
  let result = true;
  let currentOperator: 'AND' | 'OR' | 'NOT' = 'AND';
  let groupResults: boolean[] = [];
  let inGroup = false;

  for (let i = 0; i < filters.length; i++) {
    const filter = filters[i];
    const conditionResult = evaluateFilterCondition(job, filter);

    // Handle grouping
    if (filter.groupStart) {
      inGroup = true;
      groupResults = [];
    }

    // Apply logical operator
    let finalResult = conditionResult;
    if (filter.logicalOperator === 'NOT') {
      finalResult = !conditionResult;
    }

    if (inGroup) {
      groupResults.push(finalResult);
    } else {
      // Apply to main result
      if (i === 0) {
        result = finalResult;
      } else {
        switch (currentOperator) {
          case 'AND':
            result = result && finalResult;
            break;
          case 'OR':
            result = result || finalResult;
            break;
          case 'NOT':
            result = result && !finalResult;
            break;
        }
      }
    }

    // Handle group end
    if (filter.groupEnd) {
      inGroup = false;
      const groupResult =
        groupResults.length > 0 ? groupResults.some(Boolean) : true;

      if (i === 0) {
        result = groupResult;
      } else {
        switch (currentOperator) {
          case 'AND':
            result = result && groupResult;
            break;
          case 'OR':
            result = result || groupResult;
            break;
          case 'NOT':
            result = result && !groupResult;
            break;
        }
      }
    }

    // Set next operator
    if (filter.logicalOperator && i < filters.length - 1) {
      currentOperator = filter.logicalOperator;
    }
  }

  return result;
};

// Search state interface
interface SearchFilter {
  id: string;
  field: string;
  comparisonOperator:
    | '='
    | '!='
    | '>'
    | '<'
    | '>='
    | '<='
    | 'contains'
    | 'starts_with';
  value: string;
  logicalOperator?: 'AND' | 'OR' | 'NOT';
  groupStart?: boolean;
  groupEnd?: boolean;
  type: 'text' | 'select' | 'boolean' | 'date' | 'number';
}

interface AdvancedSearchState {
  filters: SearchFilter[];
  globalOperator: 'AND' | 'OR' | 'NOT';
  booleanMode: boolean;
  queryString: string;
}

// Sourcing Header Component
const SourcingHeader = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  user,
  hasDraftJobPostings,
  setHasDraftJobPostings,
  publishFirstJobPosting,
  isInitialLoading,
}: {
  user: any;
  onRefresh: () => void;
  isLoading: boolean;
  hasDraftJobPostings: boolean;
  setHasDraftJobPostings: (hasDraftJobPostings: boolean) => void;
  publishFirstJobPosting: () => Promise<void>;
  isInitialLoading: boolean;
}) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="">
          <div className="flex items-center gap-3">
            <h1 className="from-primary to-primary/80 bg-gradient-to-r bg-clip-text text-2xl font-bold text-transparent">
              Sourcing & Recruitment
            </h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Manage job postings, track applications, and discover top talent
            with AI-powered insights
          </p>
        </div>
      </div>
      {hasDraftJobPostings && (
        <div className="border-primary/20 bg-primary/5 dark:border-primary/30 dark:bg-primary/10 rounded-xl border p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 dark:bg-primary/20 flex h-12 w-12 items-center justify-center rounded-full">
                <Briefcase className="text-primary h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h2 className="text-primary dark:text-primary-foreground text-lg font-semibold">
                  Congratulations! You&apos;ve created your first job posting.
                </h2>
                <p className="text-primary/80 dark:text-primary/70 text-sm">
                  Once your job posting is published, you can begin sourcing
                  candidates and leveraging our AI-powered asses sment tools to
                  identify the best fit.
                </p>
                <div className="flex items-center gap-3 pt-2">
                  {isInitialLoading ? (
                    <Button variant="outline" disabled={true}>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Publishing...
                    </Button>
                  ) : (
                    <div data-tour="publish-job-button">
                      <button
                        onClick={publishFirstJobPosting}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                      >
                        <PlayCircle className="h-4 w-4" />
                        Publish Job Posting →
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setHasDraftJobPostings(false);
                    }}
                    className="order-primary/30 bg-background text-primary hover:bg-primary/5 dark:border-primary/40 dark:hover:bg-primary/10 cursor-pointer rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
                  >
                    I&apos;ll do this later
                  </button>
                </div>
              </div>
            </div>
            <button className="text-primary/60 hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20 dark:hover:text-primary/80 rounded-full p-1 transition-colors">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function SourcingPage() {
  const searchParams = useSearchParams();
  const createJobPosting = searchParams.get('create-job-posting');

  useLayoutEffect(() => {
    if (createJobPosting) {
      setShowCreateJobDialog(true);
    }
  }, [createJobPosting]);

  // Component state
  const [selectedJob, setSelectedJob] = useState<IClientJobPosting | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [statusFilter, setStatusFilter] = useState<
    JobPostingStatusEnum | 'ALL'
  >('ALL');
  const [_applicationStatusFilter, _setApplicationStatusFilter] =
    useState('ALL');
  const [_showAdvancedSearch, _setShowAdvancedSearch] = useState(false);
  const [advancedSearchState, _setAdvancedSearchState] =
    useState<AdvancedSearchState>({
      filters: [],
      globalOperator: 'AND',
      booleanMode: false,
      queryString: '',
    });

  // Detail view state
  const [showDetailView, setShowDetailView] = useState(false);
  const [detailViewJob, setDetailViewJob] = useState<IClientJobPosting | null>(
    null
  );
  const [activeTab, setActiveTab] = useState('overview');

  // Dialog states
  const [showCreateJobDialog, setShowCreateJobDialog] = useState(false);
  const [showEditJobDialog, setShowEditJobDialog] = useState(false);
  const [jobToEdit, setJobToEdit] = useState<IClientJobPosting | null>(null);
  const [hasDraftJobPostings, setHasDraftJobPostings] = useState(false);

  // Success dialog state
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [createdJobData, setCreatedJobData] = useState<{
    jobId: string;
    jobTitle: string;
  } | null>(null);
  const createNotification = useCreateNotification();
  const { user } = useApp();

  // Handler for job creation success
  const handleJobCreated = (jobId: string, jobTitle: string) => {
    setCreatedJobData({ jobId, jobTitle });
    setShowSuccessDialog(true);

    // Remove the 'create-job-posting' parameter from URL after job creation
    if (createJobPosting) {
      const currentPath = window.location.pathname;
      router.replace(currentPath);
    }
  };

  // Handler for editing job from success dialog
  const handleEditJobFromSuccess = () => {
    if (createdJobData) {
      // Find the created job and open edit dialog
      clientJobPostingService
        .getJobPosting(createdJobData.jobId)
        .then((job) => {
          setJobToEdit(job);
          setShowEditJobDialog(true);
          setShowSuccessDialog(false);
        })
        .catch((error) => {
          logger.error('Error fetching job for editing:', error);
          toast.error('Failed to load job for editing');
        });
    }
  };

  const queryClient = useQueryClient();
  const tabs = [
    { label: 'Overview', key: 'overview', dataTour: 'overview-tab' },
    {
      label: 'Sourced Candidates',
      key: 'sourced_candidates',
      dataTour: 'sourced-candidates-tab',
    },
    {
      label: 'Recommendations',
      key: 'recommendations',
      dataTour: 'recommendations-tab',
    },
    { label: 'In Progress', key: 'in_progress', dataTour: 'in-progress-tab' },
    { label: 'Hired', key: 'hired', dataTour: 'hired-tab' },
  ];

  const { data: usageSummary } = useQuery({
    queryKey: ['usage-summary'],
    queryFn: () => subscriptionLimitsService.getUsageSummary(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch job postings
  const {
    data: jobsResponse,
    isLoading: jobsLoading,
    error: jobsError,
    refetch: refetchJobs,
  } = useQuery({
    queryKey: ['client-job-postings', searchQuery, statusFilter],
    queryFn: () =>
      clientJobPostingService.getJobPostings({
        search: searchQuery || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        page: 1,
        limit: 100,
        sortBy,
        sortOrder: 'desc',
      }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useLayoutEffect(() => {
    if (jobsResponse?.items?.length == 1) {
      setHasDraftJobPostings(
        jobsResponse?.items.some(
          (job) => job.status === JobPostingStatusEnum.DRAFT
        )
      );
    }
  }, [jobsResponse]);

  // Extract jobs array from paginated response
  const jobsData = jobsResponse?.items || [];

  // Helper function to transform job application data to IClientJobApplication format
  const toClientApplicationDomain = (
    application: any
  ): IClientJobApplication => {
    return {
      id: application.id || '',
      jobId: application.jobPostingId || '',
      userId: application.candidateId || '',
      status: application.status || ApplicationStatusEnum.APPLIED,
      coverLetter: application.coverLetter || '',
      resumeUrl: application.resumeUrl || '',
      createdAt: application.createdAt || new Date().toISOString(),
      updatedAt: application.updatedAt || new Date().toISOString(),
      candidate: application.candidate || '',
      companyName: application.companyName || '',
      jobTitle: application.jobTitle || '',
    };
  };

  const publishFirstJobPosting = async () => {
    setIsInitialLoading(true);
    try {
      await handleStatusChange(
        jobsData[0].id,
        JobPostingStatusEnum.PUBLISHED,
        jobsData[0].title
      );

      toast.success('Job posting published successfully!');
      setIsInitialLoading(false);
    } catch (error) {
      logger.error('Error publishing job posting:', error);
      toast.error('Failed to publish job posting');
      setIsInitialLoading(false);
    }
  };

  // Extract applications from selected job and convert to correct format
  const applicationsData = selectedJob?.applications
    ? selectedJob.applications.map((app) => toClientApplicationDomain(app))
    : [];

  // Filter applications based on status (currently unused in new design)
  const _filteredApplications = useMemo(() => {
    return applicationsData;
  }, [applicationsData]);

  // Recommendations query
  const {
    data: recommendationsData,
    isLoading: recommendationsLoading,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['job-recommendations', selectedJob?.id],
    queryFn: async ({ pageParam = 1 }) => {
      if (!selectedJob) return { items: [], nextPage: 1 };

      const response =
        await clientJobPostingRecommendationApiService.getJobPostingRecommendations(
          selectedJob.id
        );

      const results = response.items;
      const groundingInfo = response.pagination;

      // If no results found and it's not the first page, show toast
      if (results.length === 0 && pageParam > 1) {
        toast.info('No more recommendations found');
      }

      return {
        items: results,
        nextPage: pageParam + 1,
        groundingInfo: groundingInfo,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: !!selectedJob,
    staleTime: 5 * 60 * 1000,
  });

  const { data: jobApplications, isLoading: jobApplicationsLoading } = useQuery(
    {
      queryKey: ['job-applications', selectedJob?.id],
      queryFn: () =>
        clientJobApplicationService.getJobApplications({
          jobId: selectedJob?.id,
          page: 1,
          limit: 100,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        }),
      enabled: !!selectedJob?.id,
    }
  );

  // Flatten recommendations data and filter out candidates with rejected/accepted applications
  const flattenedRecommendations = useMemo(() => {
    const allRecommendations =
      recommendationsData?.pages?.flatMap((page) => page.items) || [];

    // Deduplicate by candidate.id (keep first occurrence)
    const seen = new Set();
    const uniqueRecommendations = allRecommendations.filter((rec) => {
      const id = rec.candidate?.id || rec.candidateId || rec.id;
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });

    // If no job applications data, return all unique recommendations
    if (!jobApplications?.items || jobApplications.items.length === 0) {
      return uniqueRecommendations;
    }

    // Get candidate IDs from applications that are rejected or accepted
    const rejectedOrAcceptedCandidateIds = new Set(
      jobApplications.items
        .filter(
          (app: any) =>
            app.status === ApplicationStatusEnum.REJECTED ||
            app.status === ApplicationStatusEnum.ACCEPTED
        )
        .map((app: any) => app.candidateId || app.candidate?.id)
        .filter(Boolean)
    );

    // Get candidate IDs from applications that are invited
    const invitedCandidateIds = new Set(
      jobApplications.items
        .filter((app: any) => app.status === ApplicationStatusEnum.INVITED)
        .map((app: any) => app.candidateId || app.candidate?.id)
        .filter(Boolean)
    );

    // Filter out recommendations for candidates who have been rejected or accepted
    // and add invitation status for invited candidates
    return uniqueRecommendations
      .filter(
        (recommendation: any) =>
          !rejectedOrAcceptedCandidateIds.has(recommendation.candidate?.id)
      )
      .map((recommendation: any) => ({
        ...recommendation,
        isInvited: invitedCandidateIds.has(recommendation.candidate?.id),
      }));
  }, [recommendationsData, jobApplications]);

  // Handle load more recommendations (currently unused in new design)
  const handleLoadMoreRecommendations = () => {
    if (!isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // Organize applications by job ID for the new table layout
  const applicationsByJob = useMemo(() => {
    const organized: { [jobId: string]: IClientJobApplication[] } = {};
    if (jobsData) {
      jobsData.forEach((job) => {
        // Initialize with applications from job data if available
        organized[job.id] = job.applications
          ? job.applications.map((app: any) => toClientApplicationDomain(app))
          : [];
      });
    }
    return organized;
  }, [jobsData]);

  // Organize recommendations by job ID for the new table layout
  const recommendationsByJob = useMemo(() => {
    const organized: { [jobId: string]: any[] } = {};
    if (jobsData) {
      jobsData.forEach((job) => {
        organized[job.id] = []; // Initialize empty - in real app would fetch per job
      });
    }
    // For the selected job, use the current recommendations
    if (selectedJob && flattenedRecommendations) {
      organized[selectedJob.id] = flattenedRecommendations;
    }
    return organized;
  }, [jobsData, selectedJob, flattenedRecommendations]);

  // Delete job mutation
  const deleteJobMutation = useMutation({
    mutationFn: (jobId: string) =>
      clientJobPostingService.deleteJobPosting(jobId),
    onSuccess: (_, deletedJobId) => {
      queryClient.invalidateQueries({ queryKey: ['client-job-postings'] });
      queryClient.invalidateQueries({ queryKey: ['activityLogs'] });
      setSelectedJob(null);
      logger.info(deletedJobId);
      toast.success('Job deleted successfully!');
    },
    onError: (_error) => {
      toast.error('Failed to delete job posting');
    },
  });

  // Update job status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: JobPostingStatusEnum;
      jobTitle: string;
    }) => clientJobPostingService.updateJobPosting(id, { status } as any),
    onSuccess: (_, { id, status, jobTitle }) => {
      queryClient.invalidateQueries({ queryKey: ['client-job-postings'] });
      queryClient.invalidateQueries({ queryKey: ['activityLogs'] });

      // Update selectedJob if it was the one updated
      if (selectedJob && selectedJob.id === id) {
        setSelectedJob((prev) => (prev ? { ...prev, status } : null));
      }
      activityLogService.createActivityLog({
        module: ActivityModuleEnum.JOB,
        action: ActivityActionEnums.UPDATE,
        entityId: user?.clientId || user?.id,
        entityType: ActivityEntityTypeEnum.JOB_POSTING,
        description: `Job status changed to ${formatEnumValue(status)}`,
        metadata: {
          userName: user?.name,
          id,
          title: ActivityTitleEnum.JOB_STATUS_UPDATED,
          newValue: formatEnumValue(status),
          clientId: user?.clientId || user?.id,
          jobTitle: jobTitle,
          jobStatus: status,
          link: `/app/client/recruiter/sourcing?jobId=${id}`,
          jobId: id,
        },
      });
      toast.success('Job status updated successfully!');
    },
    onError: (error) => {
      logger.error('Error updating job status:', error);
      toast.error('Failed to update job status');
    },
  });

  // Filter and search jobs
  const filteredJobs = useMemo(() => {
    let filtered = [...jobsData];

    // Advanced search filters only - basic search is handled by the API
    if (advancedSearchState.filters.length > 0) {
      filtered = filtered.filter((job) => {
        // Handle boolean mode vs simple mode differently
        if (advancedSearchState.booleanMode) {
          // In boolean mode, evaluate complex logic with grouping and logical operators
          return evaluateComplexQuery(job, advancedSearchState.filters);
        } else {
          // Simple mode with global operator
          const results = advancedSearchState.filters.map((filter) => {
            return evaluateFilterCondition(job, filter);
          });

          return advancedSearchState.globalOperator === 'AND'
            ? results.every(Boolean)
            : results.some(Boolean);
        }
      });
    }

    // Note: We're not sorting here since the API handles sorting
    return filtered;
  }, [jobsData, advancedSearchState]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalJobs = jobsData.length;
    const activeJobs = jobsData.filter(
      (job) => job.status === JobPostingStatusEnum.PUBLISHED
    ).length;
    const draftJobs = jobsData.filter(
      (job) => job.status === JobPostingStatusEnum.DRAFT
    ).length;
    const closedJobs = jobsData.filter(
      (job) => job.status === JobPostingStatusEnum.CLOSED
    ).length;
    const totalApplications = jobsData.reduce(
      (sum, job) => sum + (job.numberOfApplications || 0),
      0
    );
    const pendingApplications = Math.floor(totalApplications * 0.6); // Mock calculation
    const successRate =
      totalApplications > 0 ? Math.floor(totalApplications * 0.15) : 0;
    const avgApplicationsPerJob =
      totalJobs > 0 ? totalApplications / totalJobs : 0;

    return {
      totalJobs,
      activeJobs,
      draftJobs,
      closedJobs,
      totalApplications,
      pendingApplications,
      successRate,
      avgApplicationsPerJob,
    };
  }, [jobsData]);

  // Event handlers
  const handleEditJob = (job: IClientJobPosting) => {
    setJobToEdit(job);
    setShowEditJobDialog(true);
  };

  const handleDeleteJob = async (jobId: string, jobTitle: string) => {
    deleteJobMutation.mutate(jobId);

    // Create activity log for job deletion
    activityLogService.createActivityLog({
      module: ActivityModuleEnum.JOB,
      action: ActivityActionEnums.DELETE,
      entityId: user?.clientId || user?.id,
      entityType: ActivityEntityTypeEnum.JOB_POSTING,
      description: `Job posting "${jobTitle}" has been deleted`,
      metadata: {
        userName: user?.name,
        id: jobId,
        title: ActivityTitleEnum.JOB_DELETED,
        jobTitle: jobTitle,
        clientId: user?.clientId || user?.id,
        jobId: jobId,
        link: `/app/client/recruiter/sourcing?jobId=${jobId}`,
      },
    });

    await createNotification({
      userId: user?.id as string,
      userType: 'client',
      title: 'Job Deleted',
      message: `Job ${jobTitle} has been deleted`,
      type: 'success',
      priority: 'medium',
    });
  };

  const handleStatusChange = async (
    jobId: string,
    status: JobPostingStatusEnum,
    jobTitle: string
  ) => {
    updateStatusMutation.mutate({ id: jobId, status, jobTitle });

    await createNotification({
      userId: user?.id as string,
      userType: 'client',
      title: 'Job Status Changed',
      message: `Job ${jobTitle} has been changed to ${formatEnumValue(status)}`,
      type: 'success',
      priority: 'medium',
    });
  };

  const handleRefresh = () => {
    refetchJobs();
    if (selectedJob) {
      // Also refresh applications if a job is selected
      queryClient.invalidateQueries({
        queryKey: ['job-applications', selectedJob.id],
      });
      // And recommendations
      queryClient.invalidateQueries({
        queryKey: ['job-recommendations', selectedJob.id],
      });
    }
    toast.success('Data refreshed!');
  };

  // On view job details
  const handleViewJobDetails = (job: IClientJobPosting) => {
    setDetailViewJob(job);
    setSelectedJob(job);
    setShowDetailView(true);
    setActiveTab('overview');

    // Update the URL to include ?jobId=...
    window.history.pushState({}, '', `?jobId=${job.id}`);
  };
  // On back (hide detail view)
  const handleBackFromDetails = () => {
    setShowDetailView(false);
    setDetailViewJob(null);
    setSelectedJob(null);
    setActiveTab('overview');

    // Remove jobId from the URL
    const url = new URL(window.location.href);
    url.searchParams.delete('jobId');
    url.searchParams.delete('isRecommendations');
    url.searchParams.delete('isApplications');
    window.history.pushState({}, '', url.pathname);
  };

  useEffect(() => {
    const url = new URL(window.location.href);
    const jobId = url.searchParams.get('jobId');
    const isRecommendations =
      url.searchParams.get('isRecommendations') === 'true';
    const isApplications = url.searchParams.get('isApplications') === 'true';

    if (jobId && jobsData.length > 0) {
      const job = jobsData.find((job) => job.id === jobId);
      if (job) {
        setDetailViewJob(job);
        setSelectedJob(job);
        setShowDetailView(true);
        if (isRecommendations) {
          setActiveTab('recommendations');
        } else if (isApplications) {
          setActiveTab('in_progress');
        } else {
          setActiveTab('overview');
        }
      }
    }
  }, [jobsData]);

  useEffect(() => {
    const hasPendingJD = localStorage.getItem('pendingJDData');
    const hasPendingTask = localStorage.getItem('pendingJDParsingTask');

    // Handle pending JD data
    if (hasPendingJD) {
      // If we have parsed data, show loader briefly for smooth UX, then open dialog
      setIsWaitingForParsing(true);
      setCurrentMessageIndex(0);
      setTimeout(() => {
        setIsWaitingForParsing(false);
        setShowCreateJobDialog(true);
      }, 1000);
    } else if (hasPendingTask) {
      // Wait for parsing to complete
      setIsWaitingForParsing(true);
      setCurrentMessageIndex(0);

      const pollForCompletion = async () => {
        try {
          const taskStatus =
            await clientJobParsingService.getPublicParsingTask(hasPendingTask);

          if (taskStatus.status === JobParsingTaskStatusEnum.COMPLETED) {
            const parsedJob =
              await clientJobParsingService.getParsedJobDescriptionFromPublicTask(
                hasPendingTask
              );
            if (parsedJob && parsedJob.parsedJob) {
              localStorage.setItem('pendingJDData', JSON.stringify(parsedJob));
              localStorage.removeItem('pendingJDParsingTask');
              setIsWaitingForParsing(false);
              // Add a small delay to ensure the loader animation completes before opening dialog
              setTimeout(() => {
                setShowCreateJobDialog(true);
              }, 500);
            }
          } else if (taskStatus.status === JobParsingTaskStatusEnum.FAILED) {
            localStorage.removeItem('pendingJDParsingTask');
            setIsWaitingForParsing(false);
            // Add a small delay to ensure the loader animation completes before opening dialog
            setTimeout(() => {
              setShowCreateJobDialog(true);
            }, 500);
          } else {
            // Task is still processing, continue polling
            setTimeout(pollForCompletion, 2000);
          }
        } catch (error) {
          logger.error('Error polling for job parsing completion:', error);
          setIsWaitingForParsing(false);
          // Add a small delay to ensure the loader animation completes before opening dialog
          setTimeout(() => {
            setShowCreateJobDialog(true);
          }, 500);
        }
      };

      pollForCompletion();
    }
  }, [jobsData]);

  const [showLimitReachedDialog, setShowLimitReachedDialog] = useState(false);
  const [isWaitingForParsing, setIsWaitingForParsing] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(false);

  // Prevent body scrolling when loading overlay is active
  useEffect(() => {
    if (isWaitingForParsing) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isWaitingForParsing]);

  // Cycle through processing messages when overlay is active
  useEffect(() => {
    if (!isWaitingForParsing) {
      setCurrentMessageIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % PROCESSING_MESSAGES.length);
    }, 1500);

    return () => clearInterval(interval);
  }, [isWaitingForParsing]);

  const handleCreateJob = () => {
    if (!usageSummary?.jobPostings.canCreate) {
      setShowLimitReachedDialog(true);
      return;
    }
    setShowCreateJobDialog(true);
  };

  const [showUsageWarnings, setShowUsageWarnings] = useState(true);
  const router = useRouter();

  // Calculate usage percentages and warnings
  const usageWarnings = useMemo(() => {
    if (!usageSummary) return [];

    const THRESHOLD = 85; // 85% threshold

    // Calculate percentages for all categories
    const aiAssessmentPercentage =
      (usageSummary.aiAssessments.used / usageSummary.aiAssessments.limit) *
      100;
    const candidateViewsPercentage =
      (usageSummary.candidateViews.used / usageSummary.candidateViews.limit) *
      100;
    const jobPostingsPercentage =
      (usageSummary.jobPostings.used / usageSummary.jobPostings.limit) * 100;

    // Check if any category exceeds threshold
    const hasHighUsage =
      aiAssessmentPercentage >= THRESHOLD ||
      candidateViewsPercentage >= THRESHOLD ||
      jobPostingsPercentage >= THRESHOLD;

    // Check if any category is at 100%
    const hasExhaustedQuota =
      aiAssessmentPercentage >= 100 ||
      candidateViewsPercentage >= 100 ||
      jobPostingsPercentage >= 100;

    if (hasHighUsage) {
      return [
        {
          type: hasExhaustedQuota ? 'warning' : 'info',
          message:
            "You're approaching or have reached your usage limits. Consider upgrading your plan to continue using all features.",
        },
      ];
    }

    return [];
  }, [usageSummary]);

  // Error state
  if (jobsError) {
    return (
      <div className="space-y-6 p-4">
        <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
          <div className="bg-destructive/10 mb-4 rounded-full p-4">
            <AlertTriangle className="text-destructive h-12 w-12" />
          </div>
          <h3 className="text-foreground mb-2 text-xl font-semibold">
            Failed to Load Jobs
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            We encountered an error while loading your job postings. Please try
            again.
          </p>
          <Button onClick={handleRefresh} className="space-x-2">
            <RefreshCw className="h-4 w-4" />
            <span>Retry</span>
          </Button>
        </div>
      </div>
    );
  }

  // If showing detail view, render only the detail view
  if (showDetailView && detailViewJob) {
    return (
      <div className="flex h-[calc(100vh-100px)] flex-col p-4">
        {/* Sticky Back Button Section */}
        <div className="bg-background/95 supports-[backdrop-filter]:bg-background/60 border-border/40 sticky top-0 z-20 mb-4 pb-4 backdrop-blur">
          <Button
            variant="outline"
            onClick={handleBackFromDetails}
            className="border-primary/20 hover:border-primary/40 hover:bg-primary/5 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Job Listings
          </Button>
          <div className="mt-4 space-y-1">
            <h1 className="from-primary to-primary/80 bg-gradient-to-r bg-clip-text text-2xl font-bold tracking-tight text-transparent">
              {detailViewJob.title}
            </h1>
            <p className="text-muted-foreground text-sm">
              Job posting details and candidate management
            </p>
          </div>
        </div>

        {/* Sticky Tabs Section */}
        <div className="bg-background/95 supports-[backdrop-filter]:bg-background/60 border-border/40 sticky top-[120px] z-10 mb-4 pb-4 backdrop-blur">
          <CustomTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(tab) => {
              setActiveTab(tab);
            }}
          />
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="rounded-xl dark:border-gray-700">
            <div className="min-h-[500px]">
              {activeTab === 'overview' && (
                <div className="m-0 focus-visible:outline-none">
                  <JobOverviewTab job={detailViewJob} />
                </div>
              )}
              {activeTab === 'in_progress' && (
                <div className="m-0 focus-visible:outline-none">
                  <JobApplicationsTab
                    job={detailViewJob}
                    applications={(jobApplications?.items || []).filter((app) =>
                      [
                        'APPLIED',
                        'REVIEWING',
                        'SHORTLISTED',
                        'ASSESSING',
                        'OFFERED',
                        'ACCEPTED',
                        'INVITED',
                        'REJECTED',
                      ].includes(app.status)
                    )}
                    isLoading={jobApplicationsLoading}
                    statusFilter="ALL"
                    onStatusFilterChange={() => {}}
                    onNavigateToRecommendations={() => {
                      setActiveTab('recommendations');
                    }}
                  />
                </div>
              )}
              {activeTab === 'recommendations' && (
                <div className="m-0 focus-visible:outline-none">
                  <JobRecommendationsTab
                    recommendations={flattenedRecommendations}
                    onViewProfile={() => {}}
                    job={detailViewJob}
                    onLoadMore={handleLoadMoreRecommendations}
                    isLoadingMore={isFetchingNextPage}
                    isLoading={recommendationsLoading}
                    shortlistedCandidates={detailViewJob.candidateShortlists}
                    canViewRecommendations={
                      usageSummary?.candidateViews.canView
                    }
                  />
                </div>
              )}
              {activeTab === 'outsource' && (
                <div className="m-0 focus-visible:outline-none">
                  <JobOutsourceTab
                    job={detailViewJob}
                    onUploadSuccess={() => {
                      // Refresh the outsource tab data
                      queryClient.invalidateQueries({
                        queryKey: ['candidate-imports', detailViewJob?.id],
                      });
                    }}
                  />
                </div>
              )}
              {activeTab === 'sourced_candidates' && (
                <div className="m-0 focus-visible:outline-none">
                  <FinderCandidateTab
                    job={detailViewJob}
                    onUploadSuccess={() => {}}
                  />
                </div>
              )}
              {activeTab === 'hired' && (
                <div className="m-0 focus-visible:outline-none">
                  <HiredCandidateTab job={detailViewJob} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-3">
      <LoadingOverlay
        isPolling={isWaitingForParsing}
        pollingMessage={PROCESSING_MESSAGES[currentMessageIndex]}
      />
      {/* Welcome Banner */}

      {/* Usage Warning Banners */}
      {showUsageWarnings &&
        usageWarnings.map((warning, index) => (
          <Banner
            key={index}
            variant={warning.type as 'warning' | 'info' | 'error' | 'success'}
            title={
              warning.type === 'warning'
                ? 'Usage Limit Warning'
                : 'Usage Limit Notice'
            }
            description={warning.message}
            buttonText="Upgrade Plan"
            buttonRoute="/app/client/subscription"
            onClose={() => setShowUsageWarnings(false)}
          />
        ))}

      {/* Header */}
      <SourcingHeader
        user={user}
        onRefresh={handleRefresh}
        isLoading={jobsLoading}
        hasDraftJobPostings={hasDraftJobPostings}
        setHasDraftJobPostings={setHasDraftJobPostings}
        publishFirstJobPosting={publishFirstJobPosting}
        isInitialLoading={isInitialLoading}
      />

      {/* Stats Dashboard */}
      <StatsDashboard stats={stats} isLoading={jobsLoading} />

      {/* Main Content */}
      <div className="space-y-6 pb-8">
        <JobTable
          jobs={filteredJobs}
          applications={applicationsByJob}
          recommendations={recommendationsByJob}
          isLoading={jobsLoading}
          searchQuery={searchQuery}
          sortBy={sortBy}
          statusFilter={statusFilter}
          onSearchChange={setSearchQuery}
          onSortChange={setSortBy}
          onStatusFilterChange={setStatusFilter}
          onCreateJob={handleCreateJob}
          onEditJob={handleEditJob}
          onStatusChange={handleStatusChange}
          onDeleteJob={handleDeleteJob}
          onViewDetails={handleViewJobDetails}
          canCreateJob={usageSummary?.jobPostings.canCreate}
        />
      </div>

      {/* Create Job Dialog */}
      <Dialog
        open={showCreateJobDialog}
        onOpenChange={(open) => {
          if (!open) {
            localStorage.removeItem('pendingJDData');
          }
          setShowCreateJobDialog(open);
        }}
      >
        <DialogTitle></DialogTitle>
        <DialogContent className="max-h-[90vh] max-w-7xl overflow-hidden p-0">
          <ComprehensiveJobForm
            isModal={false}
            onClose={() => {
              // Clean up pending JD data when dialog is closed
              localStorage.removeItem('pendingJDData');
              localStorage.removeItem('pendingJDParsingTask');
              setShowCreateJobDialog(false);
            }}
            onSuccess={async () => {
              setShowCreateJobDialog(false);
              queryClient.invalidateQueries({
                queryKey: ['client-job-postings'],
                exact: false,
              });

              refetchJobs();

              // Create notification (moved after dialog close to prevent blocking)
              if (user?.id) {
                try {
                  await createNotification({
                    userId: user.id,
                    userType: 'client',
                    title: 'Job Posted',
                    message: 'New job posting has been created successfully',
                    type: 'success',
                    priority: 'medium',
                  });
                } catch (error) {
                  logger.error('Failed to create notification:', error);
                }
              }
            }}
            onJobCreated={handleJobCreated}
          />
        </DialogContent>
      </Dialog>

      {/* Limit Reached Dialog */}
      <Dialog
        open={showLimitReachedDialog}
        onOpenChange={setShowLimitReachedDialog}
      >
        <DialogContent className="max-w-lg">
          <div className="space-y-6 p-2">
            {/* Title Section */}
            <div className="space-y-2">
              <DialogTitle className="text-2xl font-semibold tracking-tight">
                Job Posting Limit Reached
              </DialogTitle>
              <DialogDescription className="text-base">
                You&apos;ve reached your plan&apos;s limit of{' '}
                <span className="text-primary dark:text-primary font-medium">
                  {usageSummary?.jobPostings.limit} job postings
                </span>
                . Upgrade your plan to create more job postings and unlock
                additional features.
              </DialogDescription>
            </div>

            {/* Current Usage Stats */}
            <div className="bg-primary/5 dark:bg-primary/10 rounded-lg border p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Current Usage</span>
                  <span className="text-primary dark:text-primary font-semibold">
                    {usageSummary?.jobPostings.used}/
                    {usageSummary?.jobPostings.limit}
                  </span>
                </div>
                <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                  <div
                    className="bg-primary/90 dark:bg-primary/80 h-full"
                    style={{
                      width: `${Math.min(
                        ((usageSummary?.jobPostings?.used ?? 0) /
                          (usageSummary?.jobPostings?.limit ?? 1)) *
                          100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                onClick={() => setShowLimitReachedDialog(false)}
                className="sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  router.push('/app/client/subscription');
                }}
                className="bg-primary hover:bg-primary/90 text-primary-foreground sm:w-auto"
              >
                Upgrade Plan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Job Dialog */}
      <Dialog open={showEditJobDialog} onOpenChange={setShowEditJobDialog}>
        <DialogTitle></DialogTitle>
        <DialogContent className="max-h-[90vh] max-w-7xl overflow-hidden p-0">
          {jobToEdit && (
            <ComprehensiveJobForm
              isModal={false}
              job={jobToEdit}
              onClose={() => {
                setShowEditJobDialog(false);
                setJobToEdit(null);
              }}
              onSuccess={async () => {
                queryClient.invalidateQueries({
                  queryKey: ['client-job-postings'],
                  exact: false,
                });

                // Invalidate AI assessment settings queries to refresh the data
                queryClient.invalidateQueries({
                  queryKey: ['clientAiAssessmentSettings', jobToEdit.id],
                  exact: true,
                });

                queryClient.invalidateQueries({
                  queryKey: ['clientAiAssessmentSettings'],
                  exact: true,
                });

                // Update selected job if it was the one edited
                if (selectedJob && selectedJob.id === jobToEdit.id) {
                  queryClient.invalidateQueries({
                    queryKey: [
                      'client-job-postings',
                      searchQuery,
                      statusFilter,
                    ],
                    exact: true,
                  });
                  // Refetch the job data directly
                  try {
                    const updatedJob =
                      await clientJobPostingService.getJobPosting(jobToEdit.id);
                    setSelectedJob(updatedJob);
                  } catch (error) {
                    logger.error('Error fetching updated job:', error);
                  }
                }

                // Create notification
                if (user?.id) {
                  await createNotification({
                    userId: user.id,
                    userType: 'client',
                    title: 'Job Updated',
                    message: `Job "${jobToEdit.title}" has been updated successfully`,
                    type: 'success',
                    priority: 'medium',
                  });
                }

                setShowEditJobDialog(false);
                setJobToEdit(null);
                toast.success('Job updated successfully!');
                refetchJobs();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Job Posting Success Dialog */}
      {createdJobData && (
        <JobPostingSuccessDialog
          isOpen={showSuccessDialog}
          onClose={() => {
            setShowSuccessDialog(false);
            setCreatedJobData(null);
          }}
          jobId={createdJobData.jobId}
          jobTitle={createdJobData.jobTitle}
          onEditJob={handleEditJobFromSuccess}
        />
      )}

      {hasDraftJobPostings &&
        !showCreateJobDialog &&
        !showEditJobDialog &&
        !showSuccessDialog && (
          <TourGuide
            tourKey="client_job_sourcing_page_tour"
            autoStart={true}
            showProgress={false}
          />
        )}
    </div>
  );
}

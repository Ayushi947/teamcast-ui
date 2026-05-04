'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  ISupportCandidate,
  CandidateStatusEnum,
  CandidateAssessmentStageEnum,
  CandidateResumeAssessmentStatusEnum,
  IPaginatedResponse,
  OnboardingAssessmentRecommendationEnum,
  OnboardingAssessmentStatusEnum,
  CandidateOnboardingAssessmentStatusEnum,
  ResumeAssessmentRecommendationEnum,
  JobAiAssessmentStatusEnum,
  JobAiAssessmentRecommendationEnum,
} from '@/lib/shared';
import { formatEnumValue } from '@/lib/utils';
import SaasDataTable, {
  SaasTableColumn,
  SaasTableFilter,
  SaasPaginationInfo,
  SaasTableAction,
  commonActions,
} from '@/components/app/common/tables/saas-data-table';
import {
  supportCandidateManagementService,
  supportClientManagementService,
} from '@/lib/services/services';
import { logger } from '@/lib/logger';
import { UpdateCandidateDialog } from '../[candidateId]/components/update-candidate-dialog';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { getLatestOnboardingAssessment } from '@/lib/utils/assessment.utils';
import { useTableQueryParams } from '@/lib/hooks/use-table-query-params';
import { Send } from 'lucide-react';

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

interface CandidatesListProps {
  initialData?: IPaginatedResponse<ISupportCandidate>;
}

export function CandidatesList({
  initialData: _initialData,
}: CandidatesListProps) {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    (CandidateStatusEnum | 'ALL')[]
  >(['ALL']);
  const [assessmentStageFilter, setAssessmentStageFilter] = useState<
    (CandidateAssessmentStageEnum | 'ALL')[]
  >(['ALL']);

  const {
    page: currentPage,
    pageSize,
    sortBy,
    sortOrder,
    setPage,
    setPageSize,
    setSort,
    requestParams: paginationParams,
  } = useTableQueryParams({
    defaultPage: 1,
    defaultPageSize: 10,
    defaultSortBy: 'createdAt',
    defaultSortOrder: 'desc',
    pageParam: 'page',
    pageSizeParam: 'pageSize',
    requestParamNames: {
      page: 'page',
      pageSize: 'limit',
      sortBy: 'sortBy',
      sortOrder: 'sortOrder',
    },
    preserveDefaultsInQuery: false,
  });
  const [editingCandidate, setEditingCandidate] =
    useState<ISupportCandidate | null>(null);

  const handlePageSizeChange = (newSize: number) => {
    if (totalItems > 0) {
      const newTotalPages = Math.ceil(totalItems / newSize);
      if (currentPage <= newTotalPages) {
        setPageSize(newSize, { resetPage: false });
      } else {
        setPageSize(newSize, { resetPage: true });
      }
    } else {
      setPageSize(newSize, { resetPage: true });
    }
  };

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = searchTerm.trim();
      setDebouncedSearchTerm(searchTerm);

      if (trimmed && currentPage !== 1) {
        setPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  // Handle sort change
  const handleSortChange = (
    field: string | null,
    order: 'asc' | 'desc' | null
  ) => {
    setSort(field || '', order || 'desc');
  };

  // Build query parameters for server-side filtering
  const buildQueryParams = () => {
    const params: Record<string, string | number> = {
      ...paginationParams,
    };

    if (debouncedSearchTerm.trim()) {
      params.search = debouncedSearchTerm.trim();
    }

    // Add status filter
    if (statusFilter.length > 0 && !statusFilter.includes('ALL')) {
      params.status = statusFilter.join(',');
    }

    // Add assessment stage filter
    if (
      assessmentStageFilter.length > 0 &&
      !assessmentStageFilter.includes('ALL')
    ) {
      params.assessmentStage = assessmentStageFilter.join(',');
    }

    if (sortBy && sortOrder) {
      params.sortBy = sortBy;
      params.sortOrder = sortOrder;
    }

    return params;
  };

  // Server-side query
  const {
    data: candidatesResponse,
    isLoading,
    error,
    refetch,
  } = useQuery<IPaginatedResponse<ISupportCandidate>>({
    queryKey: [
      'candidates',
      currentPage,
      pageSize,
      statusFilter.join(','),
      assessmentStageFilter.join(','),
      debouncedSearchTerm,
      sortBy,
      sortOrder,
    ],
    queryFn: () =>
      supportCandidateManagementService.getSupportCandidates(
        buildQueryParams()
      ),
  });

  const candidates = candidatesResponse?.items || [];
  const totalPages = candidatesResponse?.pagination?.totalPages || 1;
  const totalItems = candidatesResponse?.pagination?.total || 0;

  // Extract unique client IDs and integration provider IDs for fetching additional data
  const clientIds = [
    ...new Set(
      candidates
        .map((candidate) => candidate.importedByClientId)
        .filter((id): id is string => id !== null && id !== undefined)
    ),
  ];

  const integrationProviderIds = [
    ...new Set(
      candidates
        .map((candidate) => candidate.importedIntegrationId)
        .filter((id): id is string => id !== null && id !== undefined)
    ),
  ];

  // Fetch client information for imported candidates
  const {
    data: clients,
    isLoading: clientsLoading,
    error: clientsError,
  } = useQuery({
    queryKey: ['supportClients', clientIds],
    queryFn: async () => {
      const clientsData = await Promise.all(
        clientIds.map(async (id) => {
          return await supportClientManagementService.getSupportClient(id);
        })
      );
      return clientsData.reduce(
        (acc, client, index) => {
          if (client) {
            acc[clientIds[index]] = client;
          }
          return acc;
        },
        {} as Record<string, any>
      );
    },
    enabled: clientIds.length > 0,
  });

  // Fetch integration provider details for imported candidates
  const {
    data: integrationProviders,
    isLoading: integrationProvidersLoading,
    error: integrationProvidersError,
  } = useQuery({
    queryKey: ['integrationProviders', integrationProviderIds],
    queryFn: async () => {
      const providers = await Promise.all(
        integrationProviderIds.map(async (id) => {
          return await supportClientManagementService.getIntegrationProviderDetails(
            id
          );
        })
      );
      return providers.reduce(
        (acc, provider, index) => {
          if (provider) {
            acc[integrationProviderIds[index]] = provider;
          }
          return acc;
        },
        {} as Record<string, any>
      );
    },
    enabled: integrationProviderIds.length > 0,
  });

  // Event handlers
  const handleViewCandidate = (candidateId: string) => {
    // Include current page in the URL so we can return to it
    router.push(
      `/app/support/candidates/${candidateId}?tab=candidates&page=${currentPage}`
    );
  };

  const handleSendReminder = async (candidate: ISupportCandidate) => {
    try {
      await supportCandidateManagementService.sendOnboardingReminder({
        candidateId: candidate.id,
      });

      toast.success('Reminder sent', {
        description: candidate.email
          ? `Onboarding reminder sent to ${candidate.email}`
          : 'Onboarding reminder sent to the candidate.',
      });
    } catch (error: any) {
      logger.error('Error sending onboarding reminder', error);

      toast.error('Failed to send reminder', {
        description:
          error?.message ?? 'An error occurred while sending the reminder.',
      });
    }
  };

  // Badge variant helpers
  const getStatusBadgeVariant = (
    status:
      | CandidateStatusEnum
      | OnboardingAssessmentRecommendationEnum
      | ResumeAssessmentRecommendationEnum
      | JobAiAssessmentRecommendationEnum
      | string
  ) => {
    switch (status) {
      // Candidate status cases
      case CandidateStatusEnum.ONBOARDED:
        return 'default';
      case CandidateStatusEnum.NEW:
        return 'secondary';
      case CandidateStatusEnum.HIRED:
        return 'default';
      case CandidateStatusEnum.REJECTED:
        return 'destructive';

      // Recommendation cases
      case OnboardingAssessmentRecommendationEnum.HIGHLY_RECOMMENDED:
        return 'default';
      case OnboardingAssessmentRecommendationEnum.RECOMMENDED:
        return 'secondary';
      case OnboardingAssessmentRecommendationEnum.NOT_RECOMMENDED:
        return 'destructive';
      case ResumeAssessmentRecommendationEnum.HIGHLY_RECOMMENDED:
        return 'default';
      case ResumeAssessmentRecommendationEnum.RECOMMENDED:
        return 'secondary';
      case ResumeAssessmentRecommendationEnum.NOT_RECOMMENDED:
        return 'destructive';
      case JobAiAssessmentRecommendationEnum.HIGHLY_RECOMMENDED:
        return 'default';
      case JobAiAssessmentRecommendationEnum.RECOMMENDED:
        return 'secondary';
      case JobAiAssessmentRecommendationEnum.NOT_RECOMMENDED:
        return 'destructive';

      // Fallback for "Not Available" or unknown values
      case 'Not Available':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getAssessmentStageBadgeVariant = (stage: string) => {
    switch (stage) {
      case CandidateAssessmentStageEnum.RESUME_ASSESSMENT:
        return 'secondary';
      case CandidateAssessmentStageEnum.ONBOARDING_ASSESSMENT:
        return 'default';
      case CandidateAssessmentStageEnum.JOB_AI_ASSESSMENT:
        return 'default';
      default:
        return 'outline';
    }
  };

  // Table configuration
  const columns: SaasTableColumn<ISupportCandidate>[] = [
    {
      key: 'fullName',
      label: 'Name',
      render: (candidate: ISupportCandidate) => {
        const integrationProvider = candidate.importedIntegrationId
          ? integrationProviders?.[candidate.importedIntegrationId]
          : null;

        return (
          <div className="flex items-center gap-2">
            <div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="hover:text-primary cursor-pointer text-left font-medium hover:underline"
                  onClick={() => handleViewCandidate(candidate.id)}
                >
                  {candidate.fullName || '-'}
                </button>
                {integrationProvider && (
                  <div className="flex items-center space-x-1">
                    {integrationProvider.logoUrl ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <img
                            src={integrationProvider.logoUrl}
                            alt={integrationProvider.name}
                            className="h-5 w-5 cursor-pointer rounded"
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{integrationProvider.name}</p>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <></>
                    )}
                  </div>
                )}
              </div>
              <button
                type="button"
                className="text-muted-foreground hover:text-primary cursor-pointer text-left text-sm hover:underline"
                onClick={() => handleViewCandidate(candidate.id)}
              >
                {candidate.email}
              </button>
            </div>
          </div>
        );
      },
    },
    {
      key: 'phone',
      label: 'Phone',
      sortable: false,
      render: (candidate: ISupportCandidate) => (
        <span
          className="text-muted-foreground hover:text-primary cursor-pointer text-sm hover:underline"
          onClick={() => handleViewCandidate(candidate.id)}
        >
          {candidate.phone || '-'}
        </span>
      ),
    },
    {
      key: 'partner',
      label: 'Partner/Client',
      sortable: false,
      render: (candidate: ISupportCandidate) => {
        // Show partner information if available
        if (candidate.partner) {
          return (
            <span className="text-muted-foreground text-sm">
              {candidate.partner.name}
            </span>
          );
        }

        // Show client information for imported candidates
        if (
          candidate.importedByClientId &&
          clients?.[candidate.importedByClientId]
        ) {
          const client = clients[candidate.importedByClientId];
          return (
            <span className="text-muted-foreground text-sm">
              {client.company?.name || 'Unknown Client'}
            </span>
          );
        }

        return <span className="text-muted-foreground text-sm">-</span>;
      },
    },
    {
      key: 'completionPercentage',
      label: 'Completion',
      sortable: true,
      render: (candidate: ISupportCandidate) => (
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">
            {candidate.completionPercentage || 0}%
          </span>
          <Progress
            value={candidate.completionPercentage || 0}
            className="w-16"
          />
        </div>
      ),
    },

    {
      key: 'assessmentStage',
      label: 'Assessment Stage',
      sortable: false,
      render: (candidate: ISupportCandidate) => {
        // Check if onboarding assessment is reset - show "RESET_ASSESSMENT" instead of actual stage
        const isOnboardingReset =
          candidate.onboardingAssessmentStatus ===
          CandidateOnboardingAssessmentStatusEnum.ASSESSMENT_RESET;

        if (isOnboardingReset) {
          return (
            <Badge variant="outline">
              {formatEnumValue('RESET_ASSESSMENT')}
            </Badge>
          );
        }

        return (
          <Badge
            variant={getAssessmentStageBadgeVariant(candidate.assessmentStage)}
          >
            {formatEnumValue(candidate.assessmentStage)}
          </Badge>
        );
      },
    },
    {
      key: 'recommendationStatus',
      label: 'Status',
      sortable: false,
      render: (candidate: ISupportCandidate) => {
        const isResumeStage =
          candidate.assessmentStage ===
          CandidateAssessmentStageEnum.RESUME_ASSESSMENT;
        const isOnboardingStage =
          candidate.assessmentStage ===
          CandidateAssessmentStageEnum.ONBOARDING_ASSESSMENT;
        const isJobAiStage =
          candidate.assessmentStage ===
          CandidateAssessmentStageEnum.JOB_AI_ASSESSMENT;

        // Resume assessment branch (legacy/early-stage candidates)
        if (isResumeStage) {
          if (
            candidate.resumeAssessmentStatus ===
            CandidateResumeAssessmentStatusEnum.ASSESSMENT_IN_PROGRESS
          ) {
            return (
              <Badge variant="secondary">
                {formatEnumValue(
                  CandidateResumeAssessmentStatusEnum.ASSESSMENT_IN_PROGRESS
                )}
              </Badge>
            );
          }

          if (
            candidate.resumeAssessmentStatus ===
            CandidateResumeAssessmentStatusEnum.ASSESSMENT_COMPLETED
          ) {
            const recommendation = candidate.resumeAssessmentRecommendation;

            if (recommendation) {
              return (
                <Badge
                  variant={getStatusBadgeVariant(
                    recommendation as ResumeAssessmentRecommendationEnum
                  )}
                >
                  {formatEnumValue(
                    recommendation as ResumeAssessmentRecommendationEnum
                  )}
                </Badge>
              );
            }

            return (
              <Badge variant="default">
                {formatEnumValue(
                  CandidateResumeAssessmentStatusEnum.ASSESSMENT_COMPLETED
                )}
              </Badge>
            );
          }

          if (
            candidate.resumeAssessmentStatus ===
            CandidateResumeAssessmentStatusEnum.ASSESSMENT_FAILED
          ) {
            return <Badge variant="destructive">Assessment Failed</Badge>;
          }
        }

        // Onboarding assessment branch (existing behavior)
        if (isOnboardingStage) {
          // Show null when assessment is reset
          if (
            candidate.onboardingAssessmentStatus ===
            CandidateOnboardingAssessmentStatusEnum.ASSESSMENT_RESET
          ) {
            return <span className="text-muted-foreground text-sm">-</span>;
          }

          // If recommendation exists, prefer showing it regardless of status
          if (candidate.onboardingAssessmentRecommendation) {
            return (
              <Badge
                variant={getStatusBadgeVariant(
                  candidate.onboardingAssessmentRecommendation as OnboardingAssessmentRecommendationEnum
                )}
              >
                {formatEnumValue(
                  candidate.onboardingAssessmentRecommendation as OnboardingAssessmentRecommendationEnum
                )}
              </Badge>
            );
          }

          // Show status when CandidateOnboardingAssessmentStatusEnum is ASSESSMENT_IN_PROGRESS
          if (
            candidate.onboardingAssessmentStatus ===
            CandidateOnboardingAssessmentStatusEnum.ASSESSMENT_IN_PROGRESS
          ) {
            return (
              <Badge variant="secondary">
                {formatEnumValue(
                  CandidateOnboardingAssessmentStatusEnum.ASSESSMENT_IN_PROGRESS
                )}
              </Badge>
            );
          }

          // Show recommendation when status is AI_REVIEW_COMPLETED or ASSESSMENT_COMPLETED
          if (
            candidate.onboardingAssessmentStatus ===
              OnboardingAssessmentStatusEnum.AI_REVIEW_COMPLETED ||
            candidate.onboardingAssessmentStatus ===
              OnboardingAssessmentStatusEnum.ASSESSMENT_COMPLETED
          ) {
            // Get the latest onboarding assessment to get the most recent recommendation
            const latestAssessment = getLatestOnboardingAssessment(candidate);
            const recommendation =
              latestAssessment?.recommendation ||
              candidate.onboardingAssessmentRecommendation;

            // If no recommendation is available
            if (!recommendation) {
              return <span className="text-muted-foreground text-sm">-</span>;
            }

            return (
              <Badge
                variant={getStatusBadgeVariant(
                  recommendation as OnboardingAssessmentRecommendationEnum
                )}
              >
                {formatEnumValue(
                  recommendation as OnboardingAssessmentRecommendationEnum
                )}
              </Badge>
            );
          }
        }

        // Job AI assessment branch
        if (isJobAiStage) {
          // Prefer recommendation when available
          if (candidate.jobAiAssessmentRecommendation) {
            return (
              <Badge
                variant={getStatusBadgeVariant(
                  candidate.jobAiAssessmentRecommendation as JobAiAssessmentRecommendationEnum
                )}
              >
                {formatEnumValue(
                  candidate.jobAiAssessmentRecommendation as JobAiAssessmentRecommendationEnum
                )}
              </Badge>
            );
          }

          // Handle in-progress states
          if (
            candidate.jobAiAssessmentStatus ===
              JobAiAssessmentStatusEnum.CANDIDATE_ASSESSMENT_IN_PROGRESS ||
            candidate.jobAiAssessmentStatus ===
              JobAiAssessmentStatusEnum.AI_INITIALIZATION_IN_PROGRESS ||
            candidate.jobAiAssessmentStatus ===
              JobAiAssessmentStatusEnum.AI_REVIEW_IN_PROGRESS ||
            candidate.jobAiAssessmentStatus ===
              JobAiAssessmentStatusEnum.MANUAL_REVIEW_IN_PROGRESS
          ) {
            return (
              <Badge variant="secondary">
                {formatEnumValue(
                  candidate.jobAiAssessmentStatus as JobAiAssessmentStatusEnum
                )}
              </Badge>
            );
          }

          // Completed states without recommendation
          if (
            candidate.jobAiAssessmentStatus ===
              JobAiAssessmentStatusEnum.AI_REVIEW_COMPLETED ||
            candidate.jobAiAssessmentStatus ===
              JobAiAssessmentStatusEnum.ASSESSMENT_COMPLETED ||
            candidate.jobAiAssessmentStatus ===
              JobAiAssessmentStatusEnum.MANUAL_REVIEW_COMPLETED
          ) {
            return (
              <Badge variant="default">
                {formatEnumValue(
                  candidate.jobAiAssessmentStatus as JobAiAssessmentStatusEnum
                )}
              </Badge>
            );
          }

          if (
            candidate.jobAiAssessmentStatus ===
            JobAiAssessmentStatusEnum.ASSESSMENT_FAILED
          ) {
            return <Badge variant="destructive">Assessment Failed</Badge>;
          }
        }

        // Show dash when neither condition is met
        return <span className="text-muted-foreground text-sm">-</span>;
      },
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (candidate: ISupportCandidate) => (
        <span className="text-muted-foreground text-sm">
          {candidate.createdAt
            ? format(new Date(candidate.createdAt), 'MMM d, yyyy')
            : '-'}
        </span>
      ),
    },
  ];

  const actions: SaasTableAction<ISupportCandidate>[] = [
    {
      key: 'view-details',
      label: 'View Details',
      icon: commonActions.view,
      onClick: (candidate: ISupportCandidate) =>
        handleViewCandidate(candidate.id),
    },
    {
      key: 'send-reminder',
      label: 'Send Reminder',
      icon: <Send className="h-4 w-4" />,
      onClick: (candidate: ISupportCandidate) => handleSendReminder(candidate),
    },
  ];

  // Table filters
  const filters: SaasTableFilter[] = [
    {
      key: 'status',
      label: 'Status',
      type: 'multiselect',
      placeholder: 'Select status',
      value: statusFilter,
      onChange: (value) => {
        if (Array.isArray(value)) {
          setStatusFilter(value as (CandidateStatusEnum | 'ALL')[]);
        } else {
          setStatusFilter([value as CandidateStatusEnum | 'ALL']);
        }
        setPage(1);
      },
      options: [
        { label: 'All Status', value: 'ALL' },
        ...Object.values(CandidateStatusEnum).map((status) => ({
          label: formatEnumValue(status),
          value: status,
        })),
      ],
    },
    {
      key: 'assessmentStage',
      label: 'Assessment Stage',
      type: 'multiselect',
      placeholder: 'Select assessment stage',
      value: assessmentStageFilter,
      onChange: (value) => {
        if (Array.isArray(value)) {
          setAssessmentStageFilter(
            value as (CandidateAssessmentStageEnum | 'ALL')[]
          );
        } else {
          setAssessmentStageFilter([
            value as CandidateAssessmentStageEnum | 'ALL',
          ]);
        }
        setPage(1);
      },
      options: [
        { label: 'All Assessment Stages', value: 'ALL' },
        ...Object.values(CandidateAssessmentStageEnum).map((stage) => ({
          label: formatEnumValue(stage),
          value: stage,
        })),
      ],
    },
  ];

  // Pagination configuration
  const pagination: SaasPaginationInfo = {
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    onPageChange: setPage,
    onPageSizeChange: handlePageSizeChange,
    pageSizeOptions: PAGE_SIZE_OPTIONS,
    sortBy: sortBy ?? undefined,
    sortOrder: sortBy ? sortOrder : undefined,
    onSortChange: handleSortChange,
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Candidates refreshed');
  };

  return (
    <TooltipProvider>
      <>
        <SaasDataTable<ISupportCandidate>
          columns={columns}
          data={candidates}
          isLoading={isLoading || clientsLoading || integrationProvidersLoading}
          searchable={true}
          searchValue={searchTerm}
          searchPlaceholder="Search candidates by name or email..."
          onSearchChange={setSearchTerm}
          filters={filters}
          pagination={pagination}
          onRefresh={handleRefresh}
          emptyState={{
            title: 'No candidates found',
            description: 'Try adjusting your search criteria or filters',
          }}
          getRowKey={(candidate) => candidate.id}
          actions={actions}
          error={
            error?.message ||
            clientsError?.message ||
            integrationProvidersError?.message ||
            null
          }
        />

        {/* Update Candidate Dialog */}
        {editingCandidate && (
          <UpdateCandidateDialog
            candidate={editingCandidate}
            onCandidateUpdated={() => {
              refetch();
              setEditingCandidate(null);
            }}
          />
        )}
      </>
    </TooltipProvider>
  );
}

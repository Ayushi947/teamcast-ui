'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Building,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Bot,
} from 'lucide-react';
import { format } from 'date-fns';
import SaasDataTable, {
  SaasTableColumn,
  SaasTableFilter,
  SaasPaginationInfo,
} from '@/components/app/common/tables/saas-data-table';
import { useQuery } from '@tanstack/react-query';
import {
  candidateJobAiAssessmentService,
  candidatePanelInterviewService,
  candidateProfileService,
} from '@/lib/services/services';
import {
  InterviewTypeEnum,
  JobPanelAssessmentStatusEnum,
  JobAiAssessmentInviteStatusEnum,
  InterviewInvitationStatusEnum,
  CandidateResumeAssessmentStatusEnum,
  ICandidateProfile,
  JobAiAssessmentStatusEnum,
} from '@/lib/shared';
import { toast } from 'sonner';
import { formatEnumValue } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Define interview interface
interface Interview {
  id: string;
  type?: InterviewTypeEnum;
  jobPosition?: string;
  companyName?: string;
  slot?: string;
  meetingStatus?: string; // Now string for both types
  scheduledTime?: string;
  jobPostingId?: string;
  invitationUrl?: string;
}

// Add EmptyState component

export default function InterviewsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<(InterviewTypeEnum | 'ALL')[]>([
    'ALL',
  ]);
  const [statusFilter, setStatusFilter] = useState<string[]>(['ALL']);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  // Store the column key (not the mapped API field) for sorting state
  // This allows the table component to properly detect when the same column is clicked
  // Store the column key (not the mapped API field) for sorting state
  // This allows the table component to properly detect when the same column is clicked
  const [sortBy, setSortBy] = useState<string | null>('scheduledDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>('desc');
  const [isAiAssessmentFilterSelected, setIsAiAssessmentFilterSelected] =
    useState(true);
  const [isPanelAssessmentFilterSelected, setIsPanelAssessmentFilterSelected] =
    useState(true);

  // Fetch candidate profile to check resume assessment status
  const { data: profile } = useQuery<ICandidateProfile>({
    queryKey: ['candidate-profile'],
    queryFn: () => candidateProfileService.getProfile(),
  });

  // Check if resume assessment is completed
  const isResumeAssessmentCompleted =
    profile?.resumeAssessmentStatus ===
    CandidateResumeAssessmentStatusEnum.ASSESSMENT_COMPLETED;

  // Status mapping logic (same as assessment-cards.tsx)
  const inProgressAssessmentStatuses: JobAiAssessmentStatusEnum[] = [
    JobAiAssessmentStatusEnum.AI_INITIALIZATION_IN_PROGRESS,
    JobAiAssessmentStatusEnum.AI_INITIALIZATION_COMPLETED,
    JobAiAssessmentStatusEnum.CANDIDATE_ASSESSMENT_IN_PROGRESS,
    JobAiAssessmentStatusEnum.AI_REVIEW_IN_PROGRESS,
    JobAiAssessmentStatusEnum.MANUAL_REVIEW_IN_PROGRESS,
  ];
  const completedAssessmentStatuses: JobAiAssessmentStatusEnum[] = [
    JobAiAssessmentStatusEnum.CANDIDATE_ASSESSMENT_COMPLETED,
    JobAiAssessmentStatusEnum.AI_REVIEW_COMPLETED,
    JobAiAssessmentStatusEnum.MANUAL_REVIEW_COMPLETED,
    JobAiAssessmentStatusEnum.ASSESSMENT_COMPLETED,
  ];
  const failedAssessmentStatuses: JobAiAssessmentStatusEnum[] = [
    JobAiAssessmentStatusEnum.ASSESSMENT_FAILED,
  ];

  // Helper function to map assessment status to display string
  const mapAssessmentStatusToDisplay = (
    status: string | undefined | null
  ): string => {
    if (!status) return 'Not Done';

    // Check if it's a JobAiAssessmentStatusEnum
    const assessmentStatus = status as JobAiAssessmentStatusEnum;

    if (completedAssessmentStatuses.includes(assessmentStatus)) {
      return 'Completed';
    }
    if (failedAssessmentStatuses.includes(assessmentStatus)) {
      return 'Failed';
    }
    if (inProgressAssessmentStatuses.includes(assessmentStatus)) {
      return 'In Progress';
    }

    // Handle invite statuses (PENDING, ACCEPTED, etc.)
    if (status === JobAiAssessmentInviteStatusEnum.PENDING) {
      return 'Not Done';
    }
    if (status === JobAiAssessmentInviteStatusEnum.ACCEPTED) {
      return 'Not Done'; // Accepted but not started yet
    }
    if (
      status === JobAiAssessmentInviteStatusEnum.DECLINED ||
      status === JobAiAssessmentInviteStatusEnum.EXPIRED ||
      status === JobAiAssessmentInviteStatusEnum.CANCELLED
    ) {
      return status; // Keep these as-is for now
    }

    // Default fallback
    return 'Not Done';
  };

  const {
    data: candidatePanelAssessmentSlots,
    isLoading: isInterviewsLoading,
    refetch,
  } = useQuery({
    queryKey: [
      'candidatePanelAssessmentSlots',
      searchTerm,
      statusFilter.join(','), // Serialize array to ensure React Query detects changes
      typeFilter.join(','), // Serialize array to ensure React Query detects changes
      currentPage,
      pageSize,
      sortBy,
      sortOrder,
      isPanelAssessmentFilterSelected,
    ],
    queryFn: () => {
      // Map column key to API field name for backend
      const apiSortBy = sortBy === 'scheduledDate' ? 'scheduledTime' : sortBy;

      const params: any = {
        search: searchTerm || undefined,
        page: currentPage,
        limit: pageSize,
        sortBy: apiSortBy,
        sortOrder,
      };

      // Only add status filter if panel assessment is specifically selected (not ALL)
      if (
        typeFilter.includes(InterviewTypeEnum.PANEL_ASSESSMENT) &&
        !typeFilter.includes('ALL') &&
        !statusFilter.includes('ALL')
      ) {
        params.status = statusFilter;
      }

      return candidatePanelInterviewService.listScheduledInterviews(params);
    },
    enabled: isPanelAssessmentFilterSelected,
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast.success('Interviews refreshed');
    } finally {
      setIsRefreshing(false);
    }
  };

  const panelInterviews: Interview[] =
    (Array.isArray(candidatePanelAssessmentSlots)
      ? candidatePanelAssessmentSlots
      : candidatePanelAssessmentSlots?.items || []
    ).map((item) => ({
      id: item.id,
      type: InterviewTypeEnum.PANEL_ASSESSMENT,
      jobPosition: item.jobTitle,
      companyName: item.companyName,
      slot: item.slotId ? `Slot #${item.slotId.substring(0, 8)}` : 'N/A',
      meetingStatus: (item.meetingStatus ||
        'MEETING_SCHEDULED') as JobPanelAssessmentStatusEnum,
      scheduledTime: item.selectedSlotDateTime || item.createdAt,
      jobPostingId: item.jobPostingId, // ensure this is present if available
      invitationUrl: item.invitationUrl, // Pass invitationUrl if present
    })) || [];

  const { data: aiInvitesData, isLoading: isAiInvitesLoading } = useQuery({
    queryKey: [
      'candidateJobAiAssessmentInterviews',
      searchTerm,
      statusFilter.join(','), // Serialize array to ensure React Query detects changes
      typeFilter.join(','), // Serialize array to ensure React Query detects changes
      currentPage,
      pageSize,
      sortBy,
      sortOrder,
      isAiAssessmentFilterSelected,
    ],
    queryFn: () => {
      const params: any = {
        search: searchTerm || undefined,
        page: currentPage,
        limit: pageSize,
      };

      // Only add sort parameters if sorting is active
      if (sortBy && sortOrder) {
        // Map column key to API field name for backend
        const apiSortBy = sortBy === 'scheduledDate' ? 'scheduledTime' : sortBy;
        params.sortBy = apiSortBy;
        params.sortOrder = sortOrder;
      }

      // Add status filter based on selection
      // If "ALL" is selected, all statuses are deselected, or type filter includes 'ALL': send all status values
      const hasSpecificStatusFilter =
        typeFilter.includes(InterviewTypeEnum.AI_INTERVIEW) &&
        !typeFilter.includes('ALL') &&
        !statusFilter.includes('ALL') &&
        statusFilter.length > 0 &&
        statusFilter.filter((s) => s !== 'ALL').length > 0;

      if (hasSpecificStatusFilter) {
        // Specific statuses selected (excluding 'ALL')
        params.status = statusFilter.filter((s) => s !== 'ALL');
      } else {
        // "ALL" selected, all deselected, or type filter includes 'ALL': send all statuses as query params
        params.status = Object.values(JobAiAssessmentInviteStatusEnum);
      }

      return candidateJobAiAssessmentService.listJobAiAssessmentInterviews(
        params
      );
    },
    enabled: isAiAssessmentFilterSelected,
  });

  const aiInterviews: Interview[] =
    (Array.isArray(aiInvitesData?.items)
      ? aiInvitesData.items
      : aiInvitesData?.items || []
    ).map((invite: any) => {
      // Use assessmentStatus if available, otherwise fall back to status
      const rawStatus = invite.assessmentStatus || invite.status;
      const mappedStatus = mapAssessmentStatusToDisplay(rawStatus);

      return {
        id: invite.id,
        type: InterviewTypeEnum.AI_INTERVIEW,
        jobPosition: invite.jobTitle,
        companyName: invite.companyName,
        slot: undefined,
        meetingStatus: mappedStatus,
        scheduledTime: invite.createdAt,
        jobPostingId: undefined,
        invitationUrl: invite.invitationUrl,
      };
    }) || [];

  // Combine interviews from both APIs (backend now handles filtering and pagination)
  const isLoadingCombined = isInterviewsLoading || isAiInvitesLoading;

  // Merge interviews - filtering is already handled by query enabled flags
  const allInterviews: Interview[] = [...panelInterviews, ...aiInterviews];

  // Get pagination info by combining totals from both API responses
  // When both are enabled, sum the totals; otherwise use the active one's pagination
  const panelTotal = Array.isArray(candidatePanelAssessmentSlots)
    ? candidatePanelAssessmentSlots.length
    : candidatePanelAssessmentSlots?.pagination?.total || 0;
  const aiTotal = aiInvitesData?.pagination?.total || 0;

  // Calculate combined totals
  const combinedTotal =
    (isPanelAssessmentFilterSelected ? panelTotal : 0) +
    (isAiAssessmentFilterSelected ? aiTotal : 0);

  const paginationInfo = {
    total: combinedTotal || allInterviews.length,
    page: currentPage,
    limit: pageSize,
    totalPages:
      Math.ceil((combinedTotal || allInterviews.length) / pageSize) || 1,
  };

  // Get status badge variant
  const getStatusBadgeVariant = (meetingStatus: string | undefined) => {
    switch (meetingStatus) {
      case JobPanelAssessmentStatusEnum.MEETING_SCHEDULED:
        return 'default';
      case JobPanelAssessmentStatusEnum.COMPLETED:
        return 'success';
      case JobPanelAssessmentStatusEnum.CANCELLED:
        return 'destructive';
      case JobPanelAssessmentStatusEnum.INVITATION_SENT:
        return 'secondary';
      // Mapped AI Assessment statuses
      case 'Not Done':
        return 'secondary';
      case 'In Progress':
        return 'default';
      case 'Completed':
        return 'success';
      case 'Failed':
        return 'destructive';
      // Legacy/fallback statuses
      case 'Pending':
      case 'PENDING':
        return 'secondary';
      case 'Declined':
      case 'Expired':
      case 'Cancelled':
      case 'DECLINED':
      case 'EXPIRED':
      case 'CANCELLED':
        return 'destructive';
      case 'ACCEPTED':
        return 'success';
      default:
        return 'default';
    }
  };

  // Get status icon
  const getStatusIcon = (meetingStatus: string | undefined) => {
    switch (meetingStatus) {
      case JobPanelAssessmentStatusEnum.MEETING_SCHEDULED:
        return <Calendar className="h-3 w-3" />;
      case JobPanelAssessmentStatusEnum.COMPLETED:
        return <CheckCircle className="h-3 w-3" />;
      case JobPanelAssessmentStatusEnum.CANCELLED:
        return <XCircle className="h-3 w-3" />;
      case JobPanelAssessmentStatusEnum.INVITATION_SENT:
        return <AlertCircle className="h-3 w-3" />;
      // Mapped AI Assessment statuses
      case 'Not Done':
        return <AlertCircle className="h-3 w-3" />;
      case 'In Progress':
        return <Clock className="h-3 w-3" />;
      case 'Completed':
        return <CheckCircle className="h-3 w-3" />;
      case 'Failed':
        return <XCircle className="h-3 w-3" />;
      // Legacy/fallback statuses
      case 'Pending':
      case 'PENDING':
        return <AlertCircle className="h-3 w-3" />;
      case 'Declined':
      case 'Expired':
      case 'Cancelled':
      case 'DECLINED':
      case 'EXPIRED':
      case 'CANCELLED':
        return <XCircle className="h-3 w-3" />;
      case 'ACCEPTED':
        return <CheckCircle className="h-3 w-3" />;
      default:
        return <Calendar className="h-3 w-3" />;
    }
  };

  // Get interview type icon
  const getInterviewTypeIcon = (type: InterviewTypeEnum) => {
    switch (type) {
      case InterviewTypeEnum.AI_INTERVIEW:
        return <Bot className="h-4 w-4" />;
      case InterviewTypeEnum.PANEL_ASSESSMENT:
        return <Users className="h-4 w-4" />;
      default:
        return <Bot className="h-4 w-4" />;
    }
  };

  // Table columns
  const columns: SaasTableColumn<Interview>[] = [
    {
      key: 'type',
      label: 'Interview Type',
      sortable: false,
      render: (interview: Interview) => (
        <div className="flex items-center gap-2">
          {getInterviewTypeIcon(
            interview?.type ?? InterviewTypeEnum.AI_INTERVIEW
          )}
          <span>{formatEnumValue(interview?.type ?? '')}</span>
        </div>
      ),
    },
    {
      key: 'jobPosition',
      label: 'Position',
      sortable: false,
      render: (interview: Interview) => (
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4" />
          <div>
            <div className="font-medium">{interview?.jobPosition ?? 'N/A'}</div>
            <div className="text-muted-foreground text-sm">
              {interview?.companyName ?? 'N/A'}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'scheduledDate',
      label: 'Date',
      sortable: true,
      render: (interview: Interview) => {
        const date = interview.scheduledTime || null;

        return (
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>
              {date ? format(new Date(date), 'MMM d, yyyy') : 'Not scheduled'}
            </span>
          </div>
        );
      },
    },
    // Move 'Next Step' column here, before 'Time'
    {
      key: 'startAiAssessment',
      label: 'Next Step',
      sortable: false,
      render: (interview: Interview) => {
        if (interview.type === InterviewTypeEnum.PANEL_ASSESSMENT) {
          if (interview.invitationUrl) {
            return (
              <button
                type="button"
                onClick={() => window.open(interview.invitationUrl, '_blank')}
                className={`bg-primary hover:bg-primary/90 focus:ring-primary ${
                  interview.meetingStatus ===
                  JobPanelAssessmentStatusEnum.COMPLETED
                    ? 'cursor-not-allowed opacity-50'
                    : ''
                } inline-flex items-center rounded-md px-3 py-1.5 text-xs font-semibold text-white shadow-sm focus:ring-2 focus:ring-offset-2 focus:outline-none ${loadingAssessmentId === interview.id ? 'cursor-not-allowed opacity-70' : ''}`}
                disabled={
                  loadingAssessmentId === interview.id ||
                  interview.meetingStatus ===
                    JobPanelAssessmentStatusEnum.COMPLETED
                }
              >
                {loadingAssessmentId === interview.id
                  ? 'Processing...'
                  : 'Start Assessment'}
              </button>
            );
          } else {
            return <span className="text-muted-foreground">N/A</span>;
          }
        }
        // Default: AI_INTERVIEW or fallback
        // Check for terminal states first
        const isTerminalState =
          interview.meetingStatus === 'Expired' ||
          interview.meetingStatus === 'Declined' ||
          interview.meetingStatus === 'Cancelled' ||
          interview.meetingStatus === 'Completed' ||
          interview.meetingStatus === 'Failed';

        if (isTerminalState) {
          return <span className="text-muted-foreground">N/A</span>;
        }

        // Check if resume assessment is not completed
        if (!isResumeAssessmentCompleted) {
          // Show tooltip for resume assessment requirement
          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <button
                      type="button"
                      disabled
                      className="bg-primary hover:bg-primary/90 focus:ring-primary inline-flex cursor-not-allowed items-center rounded-md px-3 py-1.5 text-xs font-semibold text-white opacity-70 shadow-sm focus:ring-2 focus:ring-offset-2 focus:outline-none"
                    >
                      Start Assessment
                    </button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Please complete resume assessment first</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }

        // Resume assessment is completed, show enabled button
        return (
          <button
            type="button"
            onClick={() => handleStartAIAssessment(interview)}
            className="bg-primary hover:bg-primary/90 focus:ring-primary inline-flex items-center rounded-md px-3 py-1.5 text-xs font-semibold text-white shadow-sm focus:ring-2 focus:ring-offset-2 focus:outline-none"
            disabled={loadingAssessmentId === interview.id}
          >
            {loadingAssessmentId === interview.id
              ? 'Processing...'
              : 'Start Assessment'}
          </button>
        );
      },
    },
    {
      key: 'scheduledTime',
      label: 'Time',
      sortable: false,
      render: (interview: Interview) => {
        const date = interview.scheduledTime || null;

        return (
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{date ? format(new Date(date), 'hh:mm a') : 'N/A'}</span>
          </div>
        );
      },
    },
    {
      key: 'meetingStatus',
      label: 'Status',
      sortable: false,
      render: (interview: Interview) => {
        const status = interview?.meetingStatus ?? '';

        return (
          <Badge variant={getStatusBadgeVariant(status) as any}>
            {getStatusIcon(status)}
            <span className="ml-1">
              {/* Display mapped status directly, or format if it's an enum value */}
              {status === 'Not Done' ||
              status === 'In Progress' ||
              status === 'Completed' ||
              status === 'Failed'
                ? status
                : formatEnumValue(status)}
            </span>
          </Badge>
        );
      },
    },
  ];

  const pagination: SaasPaginationInfo = {
    currentPage: paginationInfo.page,
    pageSize: paginationInfo.limit,
    totalPages: paginationInfo.totalPages,
    totalItems: paginationInfo.total,
    sortBy,
    sortOrder,
    onSortChange: (field: string | null, order: 'asc' | 'desc' | null) => {
      // Store the column key directly (not the mapped API field)
      // This allows the table to properly detect when the same column is clicked for toggling
      setSortBy(field || null);
      setSortOrder(order || null);
      setCurrentPage(1); // Reset to first page when sorting changes
    },
    onPageChange: (page) => {
      setCurrentPage(page);
    },
    onPageSizeChange: (size) => {
      setPageSize(size);
    },
  };

  // Determine which interview type is selected for conditional status filter
  const isOnlyPanelSelected =
    typeFilter.includes(InterviewTypeEnum.PANEL_ASSESSMENT) &&
    !typeFilter.includes(InterviewTypeEnum.AI_INTERVIEW) &&
    !typeFilter.includes('ALL');

  const isOnlyAiSelected =
    typeFilter.includes(InterviewTypeEnum.AI_INTERVIEW) &&
    !typeFilter.includes(InterviewTypeEnum.PANEL_ASSESSMENT) &&
    !typeFilter.includes('ALL');

  // Get appropriate status options based on selected interview type
  const getStatusOptions = () => {
    if (isOnlyPanelSelected) {
      return [
        { label: 'All Statuses', value: 'ALL' },
        ...Object.values(JobPanelAssessmentStatusEnum).map((status) => ({
          label: formatEnumValue(status),
          value: status,
        })),
      ];
    } else if (isOnlyAiSelected) {
      // Use the display statuses for AI interviews
      return [
        { label: 'All Statuses', value: 'ALL' },
        ...Object.values(InterviewInvitationStatusEnum).map((status) => ({
          label: formatEnumValue(status),
          value: status,
        })),
      ];
    }
    return [];
  };

  // Table filters
  const filters: SaasTableFilter[] = [
    {
      key: 'type',
      label: 'Interview Type',
      placeholder: 'Select type',
      value: typeFilter,
      onChange: (value) => {
        let newFilter: (InterviewTypeEnum | 'ALL')[];

        if (Array.isArray(value)) {
          newFilter = value as (InterviewTypeEnum | 'ALL')[];
        } else {
          newFilter = [value as InterviewTypeEnum | 'ALL'];
        }

        setTypeFilter(newFilter);

        // Update the boolean filter states based on selected values
        // If no filter is selected (empty array) or 'ALL' is selected, fetch both types
        const shouldFetchAll =
          newFilter.length === 0 || newFilter.includes('ALL');

        setIsPanelAssessmentFilterSelected(
          shouldFetchAll ||
            newFilter.includes(InterviewTypeEnum.PANEL_ASSESSMENT)
        );
        setIsAiAssessmentFilterSelected(
          shouldFetchAll || newFilter.includes(InterviewTypeEnum.AI_INTERVIEW)
        );

        // Reset status filter when interview type changes
        setStatusFilter(['ALL']);
        setCurrentPage(1);
      },
      options: [
        { label: 'All Types', value: 'ALL' },
        ...Object.values(InterviewTypeEnum).map((type) => ({
          label: formatEnumValue(type),
          value: type,
        })),
      ],
      type: 'multiselect',
    },
  ];

  // Add status filter conditionally when a specific interview type is selected
  if (isOnlyPanelSelected || isOnlyAiSelected) {
    filters.push({
      key: 'status',
      label: 'Status',
      placeholder: 'Select status',
      value: statusFilter,
      onChange: (value) => {
        if (Array.isArray(value)) {
          setStatusFilter(value as string[]);
        } else {
          setStatusFilter([value as string]);
        }
        setCurrentPage(1);
      },
      options: getStatusOptions(),
      type: 'multiselect',
    });
  }

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadingAssessmentId, setLoadingAssessmentId] = useState<string | null>(
    null
  );
  const handleStartAIAssessment = async (interview: Interview) => {
    setLoadingAssessmentId(interview.id);
    try {
      const responseUrl =
        await candidateJobAiAssessmentService.getJobAiAssessmentInvitationUrl(
          interview.id
        );
      if (typeof responseUrl === 'string' && responseUrl.trim()) {
        window.location.href = responseUrl;
      } else {
        toast.error('Assessment not found');
      }
    } catch (error: any) {
      // Handle specific error cases
      if (error?.response?.status === 403) {
        const errorMessage =
          error?.response?.data?.message || error?.message || '';

        // Check if the error is about Resume Assessment not being completed
        if (errorMessage.toLowerCase().includes('resume assessment')) {
          toast.error('Please complete your Resume Assessment first.');
        } else {
          // Other 403 errors (e.g., invite not accepted)
          toast.error(
            'You must accept the assessment Application before starting the assessment. Please check your Applications page.'
          );
        }
      } else if (error?.response?.status === 404) {
        toast.error('Assessment invitation not found');
      } else {
        toast.error(
          error instanceof Error
            ? error.message
            : 'Error starting AI assessment'
        );
      }
    } finally {
      setLoadingAssessmentId(null);
    }
  };

  // Add row click handler for panel assessment with invitationUrl
  const handleRowClick = (interview: Interview) => {
    if (
      interview.type === InterviewTypeEnum.PANEL_ASSESSMENT &&
      interview.invitationUrl
    ) {
      window.open(interview.invitationUrl, '_blank');
    }
  };

  return (
    <div className="h-full space-y-6 px-4 pt-2 pb-10">
      {/* Page header */}
      <div className="mb-2">
        <h1 className="text-primary text-2xl font-bold">Next Step</h1>
        <p className="text-md text-gray-600 dark:text-gray-400">
          View and manage your interviews. Only interviews for assessment
          invites you have accepted will be displayed here.
        </p>
      </div>
      <SaasDataTable<Interview>
        title=""
        description=""
        columns={columns}
        data={allInterviews}
        isLoading={isLoadingCombined || isRefreshing}
        searchable={true}
        searchValue={searchTerm}
        searchPlaceholder="Search by position or company..."
        onSearchChange={setSearchTerm}
        filters={filters}
        pagination={pagination}
        onRefresh={handleRefresh}
        emptyState={{
          title: 'No interviews found',
          description:
            'You have no interviews available. Make sure you have accepted assessment invites to see your interviews here.',
        }}
        getRowKey={(interview) => interview?.id ?? ''}
        onRowClick={handleRowClick} // Add this prop if supported
      />
    </div>
  );
}

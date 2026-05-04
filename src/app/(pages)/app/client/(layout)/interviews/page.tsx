'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Calendar,
  Clock,
  Building,
  Eye,
  MoreHorizontal,
  Users,
  Bot,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';

import { formatEnumValue } from '@/lib/utils';
import SaasDataTable, {
  SaasTableColumn,
  SaasTableFilter,
  SaasPaginationInfo,
} from '@/components/app/common/tables/saas-data-table';
import { toast } from 'sonner';
import {
  IScheduledInterviewItem,
  InterviewTypeEnum,
  JobPanelAssessmentSlotStatusEnum,
  JobPanelAssessmentStatusEnum,
  JobAiAssessmentStatusEnum,
  InterviewInvitationStatusEnum,
} from '@/lib/shared';
import {
  clientJobAiAssessmentInviteService,
  clientPanelInterviewService,
} from '@/lib/services/services';
import { InterviewDetailsDialog } from '@/app/(pages)/app/client/(layout)/interviews/components/interview-details-dialog';
import { AiInterviewDetailsDialog } from '@/app/(pages)/app/client/(layout)/interviews/components/ai-interview-details-dialog';
import { ScheduleMeetingDialog } from '@/app/(pages)/app/client/(layout)/interviews/components/schedule-meeting-dialog';
import { useDebounce } from '@/lib/hooks/use-debounce';

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

function ClientInterviewsTableContent() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<(InterviewTypeEnum | 'ALL')[]>([
    'ALL',
  ]);
  const [statusFilter, setStatusFilter] = useState<string[]>(['ALL']);
  const [jobFilter, setJobFilter] = useState<string>('ALL');
  const [aiAssessmentStatusFilter, setAiAssessmentStatusFilter] = useState<
    string[]
  >(['ALL']);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<string | null>('scheduledDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>('desc');
  const [isAiDetailsDialogOpen, setIsAiDetailsDialogOpen] = useState(false);
  const [isScheduleMeetingDialogOpen, setIsScheduleMeetingDialogOpen] =
    useState(false);
  const [selectedInterviewId, setSelectedInterviewId] = useState<string>('');
  const [selectedAiInterviewId, setSelectedAiInterviewId] =
    useState<string>('');
  const [selectedPanelInterviewSlotId, setSelectedPanelInterviewSlotId] =
    useState<string>('');
  const [isPanelDetailsDialogOpen, setIsPanelDetailsDialogOpen] =
    useState(false);
  const [isPanelAssessmentFilterSelected, setIsPanelAssessmentFilterSelected] =
    useState(true);
  const [isAiAssessmentFilterSelected, setIsAiAssessmentFilterSelected] =
    useState(true);
  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Reset to first page when page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [pageSize]);

  const {
    data: scheduledPanelInterviewsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [
      'scheduledInterviews',
      debouncedSearchTerm,
      statusFilter.join(','), // Serialize array to ensure React Query detects changes
      typeFilter.join(','), // Serialize array to ensure React Query detects changes
      currentPage,
      pageSize,
      sortBy,
      sortOrder,
      isPanelAssessmentFilterSelected,
      jobFilter,
    ],
    queryFn: () => {
      const params: any = {
        page: currentPage,
        limit: pageSize,
        search: debouncedSearchTerm || undefined,
        sortBy,
        sortOrder,
      };

      if (jobFilter && jobFilter !== 'ALL') {
        params.jobPostingId = jobFilter;
      }

      // Add status filter based on selection
      // If "ALL" is selected, all statuses are deselected, or type filter includes 'ALL': send all status values
      const hasSpecificStatusFilter =
        typeFilter.includes(InterviewTypeEnum.PANEL_ASSESSMENT) &&
        !typeFilter.includes('ALL') &&
        !statusFilter.includes('ALL') &&
        statusFilter.length > 0 &&
        statusFilter.filter((s) => s !== 'ALL').length > 0;

      if (hasSpecificStatusFilter) {
        // Specific statuses selected (excluding 'ALL')
        params.status = statusFilter.filter((s) => s !== 'ALL');
      }
      // Otherwise, don't send status filter - backend will use default

      return clientPanelInterviewService.listScheduledInterviews(params);
    },
    enabled: isPanelAssessmentFilterSelected,
  });

  const { data: scheduledAiInterviewsData } = useQuery({
    queryKey: [
      'scheduledAiInterviews',
      debouncedSearchTerm,
      statusFilter.join(','), // Serialize array to ensure React Query detects changes
      typeFilter.join(','), // Serialize array to ensure React Query detects changes
      currentPage,
      pageSize,
      sortBy,
      sortOrder,
      isAiAssessmentFilterSelected,
      jobFilter,
      aiAssessmentStatusFilter.join(','),
    ],
    queryFn: () => {
      const params: any = {
        page: currentPage,
        limit: pageSize,
        search: debouncedSearchTerm || undefined,
        sortBy,
        sortOrder,
      };

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
      } else if (
        typeFilter.includes(InterviewTypeEnum.AI_INTERVIEW) &&
        !typeFilter.includes('ALL')
      ) {
        // "ALL" selected or all deselected: send all statuses as query params
        params.status = Object.values(InterviewInvitationStatusEnum);
      }

      // Add AI assessment status filter if set
      const normalizedAiStatusFilter = aiAssessmentStatusFilter.filter(
        (s) => s !== 'ALL'
      );
      if (
        normalizedAiStatusFilter.length > 0 &&
        typeFilter.includes(InterviewTypeEnum.AI_INTERVIEW)
      ) {
        const assessmentStatuses: JobAiAssessmentStatusEnum[] = [];

        if (normalizedAiStatusFilter.includes('Completed')) {
          assessmentStatuses.push(...completedAssessmentStatuses);
        }
        if (normalizedAiStatusFilter.includes('In Progress')) {
          assessmentStatuses.push(...inProgressAssessmentStatuses);
        }
        if (normalizedAiStatusFilter.includes('Failed')) {
          assessmentStatuses.push(...failedAssessmentStatuses);
        }

        if (assessmentStatuses.length > 0) {
          params.assessmentStatus = assessmentStatuses;
        }
      }

      if (jobFilter && jobFilter !== 'ALL') {
        params.jobPostingId = jobFilter;
      }
      // Otherwise, don't send status filter - backend will use default

      return clientJobAiAssessmentInviteService.listJobAiAssessmentInterviews(
        params
      );
    },
    enabled: isAiAssessmentFilterSelected,
  });

  const scheduledPanelInterviews = scheduledPanelInterviewsData?.items;
  const scheduledAiInterviews = scheduledAiInterviewsData?.items;

  // Merge interviews - filtering is already handled by query enabled flags
  const flattenedScheduledInterviews: IScheduledInterviewItem[] = [
    ...(scheduledPanelInterviews || []),
    ...((scheduledAiInterviews || []) as IScheduledInterviewItem[]),
  ];

  // Get pagination info by combining totals from both API responses
  const panelTotal = scheduledPanelInterviewsData?.pagination?.total || 0;
  const aiTotal = scheduledAiInterviewsData?.pagination?.total || 0;

  // Calculate combined totals
  const combinedTotal =
    (isPanelAssessmentFilterSelected ? panelTotal : 0) +
    (isAiAssessmentFilterSelected ? aiTotal : 0);

  const handleViewDetails = async (interview: IScheduledInterviewItem) => {
    setIsPanelDetailsDialogOpen(true);
    setSelectedPanelInterviewSlotId(interview.slotId);
  };

  const handleAiInterviewDetails = (interview: IScheduledInterviewItem) => {
    setSelectedAiInterviewId(interview.id);
    setIsAiDetailsDialogOpen(true);
  };

  const handleScheduleMeeting = (interview: IScheduledInterviewItem) => {
    if (interview.type === InterviewTypeEnum.AI_INTERVIEW) {
      return;
    }

    setSelectedInterviewId(interview.id);
    setIsScheduleMeetingDialogOpen(true);
  };

  const handleMeetingScheduled = () => {
    refetch();
    toast.success('Interview meeting scheduled successfully');
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Interviews refreshed');
  };

  const getInterviewTypeIcon = (interview: IScheduledInterviewItem) => {
    switch (interview.type) {
      case InterviewTypeEnum.AI_INTERVIEW:
        return <Bot className="h-4 w-4" />;
      case InterviewTypeEnum.PANEL_ASSESSMENT:
        return <Users className="h-4 w-4" />;
      default:
        return <Bot className="h-4 w-4" />;
    }
  };

  // Badge variant helpers
  const getJobPanelAssessmentStatusBadgeVariant = (
    status: JobPanelAssessmentStatusEnum
  ) => {
    switch (status) {
      case JobPanelAssessmentStatusEnum.INVITATION_SENT:
        return 'info';
      case JobPanelAssessmentStatusEnum.CANCELLED:
        return 'error';
      case JobPanelAssessmentStatusEnum.MEETING_SCHEDULED:
        return 'success';
      case JobPanelAssessmentStatusEnum.SLOT_SELECTED:
        return 'success';

      default:
        return 'default';
    }
  };

  // Map AI assessment status (invite or assessment) to display status
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

  const mapAiStatusToDisplay = (status?: string | null): string => {
    if (!status) return 'Not Done';
    const normalized = status as JobAiAssessmentStatusEnum;

    if (completedAssessmentStatuses.includes(normalized)) return 'Completed';
    if (failedAssessmentStatuses.includes(normalized)) return 'Failed';
    if (inProgressAssessmentStatuses.includes(normalized)) return 'In Progress';

    // Treat invite states as not done
    switch (status) {
      case InterviewInvitationStatusEnum.PENDING:
        return 'Not Done';
      case InterviewInvitationStatusEnum.ACCEPTED:
        return 'Not Done';
      case InterviewInvitationStatusEnum.DECLINED:
      case InterviewInvitationStatusEnum.EXPIRED:
      case InterviewInvitationStatusEnum.CANCELLED:
        return status;
      default:
        return 'Not Done';
    }
  };

  const getAiAssessmentStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'Failed':
        return 'destructive';
      case 'In Progress':
        return 'default';
      case 'Not Done':
        return 'secondary';
      case InterviewInvitationStatusEnum.DECLINED:
      case InterviewInvitationStatusEnum.EXPIRED:
      case InterviewInvitationStatusEnum.CANCELLED:
        return 'destructive';
      default:
        return 'default';
    }
  };
  // Table configuration
  const columns: SaasTableColumn<IScheduledInterviewItem>[] = [
    {
      key: 'type',
      label: 'Interview Type',
      sortable: false,
      render: (interview: IScheduledInterviewItem) => (
        <div className="flex items-center gap-2">
          {getInterviewTypeIcon(interview)}
          <span>{formatEnumValue(interview?.type ?? '')}</span>
        </div>
      ),
    },
    {
      key: 'candidate',
      label: 'Candidate',
      sortable: false,
      render: (interview: IScheduledInterviewItem) => (
        <div className="flex items-center gap-3">
          <div>
            <div className="font-medium">
              {interview?.candidateName || 'N/A'}
            </div>
            <div className="text-muted-foreground text-sm">
              {interview?.candidateEmail || 'N/A'}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'jobTitle',
      label: 'Position',
      sortable: false,
      render: (interview: IScheduledInterviewItem) => (
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4" />
          <div>
            <div className="font-medium">{interview.jobTitle || 'N/A'}</div>
            <div className="text-muted-foreground text-sm">
              {interview?.companyName || 'N/A'}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'scheduledDate',
      label: 'Start Date',
      sortable: true,
      render: (interview: IScheduledInterviewItem) => {
        // Use the selected slot's date if available
        const date = interview.selectedSlotDateTime || null;

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
    {
      key: 'scheduledTime',
      label: 'Start Time',
      sortable: false,
      render: (interview: IScheduledInterviewItem) => {
        // Use the selected slot's time if available
        const date = interview.selectedSlotDateTime || null;

        return (
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>
              {date ? format(new Date(date), 'hh:mm a') : 'Not scheduled'}
            </span>
          </div>
        );
      },
    },

    {
      key: 'status',
      label: 'Status',
      sortable: false,
      render: (interview: IScheduledInterviewItem) => {
        if (interview.type === InterviewTypeEnum.AI_INTERVIEW) {
          const rawStatus =
            // Prefer assessment status if present, otherwise fall back to meeting/invite status
            interview.assessmentStatus || interview.meetingStatus;
          const displayStatus = mapAiStatusToDisplay(rawStatus);

          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant={getAiAssessmentStatusBadgeVariant(displayStatus)}
                    className="cursor-pointer"
                  >
                    {displayStatus}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {displayStatus === 'Completed' &&
                      'The candidate has finished the AI assessment and results are available.'}
                    {displayStatus === 'In Progress' &&
                      'The candidate has started but not yet completed the AI assessment.'}
                    {displayStatus === 'Failed' &&
                      'The candidate did not meet the passing criteria for this AI assessment.'}
                    {!['Completed', 'In Progress', 'Failed'].includes(
                      displayStatus
                    ) && 'Status of this AI interview invitation.'}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }

        // Panel interviews: keep existing meeting/slot logic
        const shouldShowSlotStatus =
          interview.slotStatus === 'SELECTED' &&
          interview.meetingStatus !== 'MEETING_SCHEDULED';

        const statusToShow = shouldShowSlotStatus
          ? (interview.slotStatus as
              | JobPanelAssessmentSlotStatusEnum
              | undefined)
          : interview.meetingStatus;

        const formattedStatus = formatEnumValue(statusToShow || '');

        const tooltipText =
          statusToShow === JobPanelAssessmentSlotStatusEnum.SELECTED
            ? 'The candidate selected an interview slot; the meeting is not yet fully scheduled.'
            : statusToShow === JobPanelAssessmentStatusEnum.MEETING_SCHEDULED
              ? 'The interview meeting is scheduled with confirmed date and time.'
              : statusToShow === JobPanelAssessmentStatusEnum.COMPLETED
                ? 'The panel interview has been completed.'
                : statusToShow === JobPanelAssessmentStatusEnum.CANCELLED
                  ? 'The panel interview was cancelled and will not take place.'
                  : 'Status of this panel interview.';

        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant={getJobPanelAssessmentStatusBadgeVariant(
                    interview.meetingStatus as JobPanelAssessmentStatusEnum
                  )}
                  className="cursor-pointer"
                >
                  {formattedStatus}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>{tooltipText}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (interview: IScheduledInterviewItem) => {
        // For AI interviews, show direct button with eye icon
        if (interview.type === InterviewTypeEnum.AI_INTERVIEW) {
          const applicationId = interview.jobApplicationId;
          return (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (applicationId) {
                  router.push(
                    `/app/client/candidates/applications/${applicationId}`
                  );
                } else {
                  handleAiInterviewDetails(interview);
                }
              }}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              View Details
            </Button>
          );
        }

        // For panel assessments, show dropdown menu
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => handleViewDetails(interview)}
                className="cursor-pointer"
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              {interview.type === InterviewTypeEnum.PANEL_ASSESSMENT && (
                <DropdownMenuItem
                  onClick={() => handleScheduleMeeting(interview)}
                  className="cursor-pointer"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Meeting
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

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
      label: 'Type',
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
        { label: 'All Type', value: 'ALL' },
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

  // Job posting filter (for both interview types)
  const jobOptions: { id: string; title: string }[] = Array.from(
    new Map<string, string>(
      flattenedScheduledInterviews
        .filter((interview) => !!interview.jobPostingId)
        .map((interview) => [
          interview.jobPostingId as string,
          interview.jobTitle || 'Untitled Job',
        ])
    ).entries()
  ).map(([id, title]) => ({ id, title }));

  if (jobOptions.length > 0) {
    filters.push({
      key: 'job',
      label: 'Job Posting',
      placeholder: 'Select job',
      value: jobFilter,
      onChange: (value) => {
        const newValue = Array.isArray(value)
          ? (value[0] as string)
          : (value as string);
        setJobFilter(newValue ?? 'ALL');
        setCurrentPage(1);
      },
      options: [
        { label: 'All Jobs', value: 'ALL' },
        ...jobOptions.map((job) => ({
          label: job.title,
          value: job.id,
        })),
      ],
      type: 'select',
    });
  }

  // AI assessment status filter (only when AI is selected)
  if (isOnlyAiSelected) {
    filters.push({
      key: 'aiAssessmentStatus',
      label: 'AI Assessment Status',
      placeholder: 'Select status',
      value: aiAssessmentStatusFilter,
      onChange: (value) => {
        if (Array.isArray(value)) {
          setAiAssessmentStatusFilter(value as string[]);
        } else {
          setAiAssessmentStatusFilter([value as string]);
        }
        setCurrentPage(1);
      },
      options: [
        { label: 'All Statuses', value: 'ALL' },
        { label: 'Completed', value: 'Completed' },
        { label: 'In Progress', value: 'In Progress' },
        { label: 'Failed', value: 'Failed' },
      ],
      type: 'multiselect',
    });
  }

  // Pagination configuration
  const pagination: SaasPaginationInfo = {
    currentPage,
    totalPages:
      Math.ceil(
        (combinedTotal || flattenedScheduledInterviews?.length || 0) / pageSize
      ) || 1,
    totalItems: combinedTotal || flattenedScheduledInterviews?.length || 0,
    pageSize,
    onPageChange: setCurrentPage,
    onPageSizeChange: setPageSize,
    pageSizeOptions: PAGE_SIZE_OPTIONS,
    sortBy,
    sortOrder,
    onSortChange: (field: string | null, order: 'asc' | 'desc' | null) => {
      // Store the column key directly (not the mapped API field)
      // This allows the table to properly detect when the same column is clicked for toggling
      setSortBy(field || null);
      setSortOrder(order || null);
      setCurrentPage(1); // Reset to first page when sorting changes
    },
  };

  return (
    <div className="flex h-full flex-col">
      {/* Table container with scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <SaasDataTable<IScheduledInterviewItem>
            title="Interviews"
            description="Manage and track all scheduled interviews with candidates"
            columns={columns}
            data={flattenedScheduledInterviews || []}
            isLoading={isLoading}
            searchable={true}
            searchValue={searchTerm}
            searchPlaceholder="Search by candidate name, email, job title, or company..."
            onSearchChange={setSearchTerm}
            filters={filters}
            pagination={pagination}
            onRefresh={handleRefresh}
            emptyState={{
              title: 'No interviews found',
              description: 'Try adjusting your search criteria or filters.',
            }}
            getRowKey={(interview) => interview.id}
            containerClassName="h-full flex flex-col"
            className="flex-1"
          />
        </div>
      </div>

      {/* Panel Interview Details Dialog */}
      {selectedPanelInterviewSlotId && (
        <InterviewDetailsDialog
          isOpen={isPanelDetailsDialogOpen}
          onClose={() => setIsPanelDetailsDialogOpen(false)}
          selectedSlotId={selectedPanelInterviewSlotId}
        />
      )}

      {/* AI Interview Details Dialog */}
      <AiInterviewDetailsDialog
        isOpen={isAiDetailsDialogOpen}
        onClose={() => setIsAiDetailsDialogOpen(false)}
        invitationId={selectedAiInterviewId}
      />

      {/* Schedule Meeting Dialog */}
      <ScheduleMeetingDialog
        isOpen={isScheduleMeetingDialogOpen}
        onClose={() => setIsScheduleMeetingDialogOpen(false)}
        interviewId={selectedInterviewId}
        onSuccess={handleMeetingScheduled}
      />
    </div>
  );
}

export default function ClientInterviewsTablePage() {
  return <ClientInterviewsTableContent />;
}

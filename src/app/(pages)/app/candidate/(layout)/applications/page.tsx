'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import {
  Building,
  BriefcaseIcon,
  MoreHorizontal,
  XCircle,
  CheckCircle,
  Eye,
} from 'lucide-react';
import { format } from 'date-fns';
import { candidateApplicationService } from '@/lib/services/services';
import { ICandidateJobApplication } from '@/lib/shared/models/domain/candidate/application.domain';
import { ApplicationStatusEnum } from '@/lib/shared/models/common/enums';
import { IPaginatedResponse } from '@/lib/shared/models/api/common/common.api';
import { formatEnumValue } from '@/lib/utils';
import SaasDataTable, {
  SaasTableColumn,
  SaasTableFilter,
  SaasPaginationInfo,
} from '@/components/app/common/tables/saas-data-table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

function ApplicationsPageContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    (ApplicationStatusEnum | 'ALL')[]
  >([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<string>('appliedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [processingAppId, setProcessingAppId] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState<
    'accept' | 'decline' | null
  >(null);
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);
  const [selectedApplication, setSelectedApplication] =
    useState<ICandidateJobApplication | null>(null);

  // Debounce search term - exact same pattern as candidates page
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset to first page when page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [pageSize]);

  // Handle sort change - exact same pattern as candidates page
  const handleSortChange = (
    field: string | null,
    order: 'asc' | 'desc' | null
  ) => {
    setSortBy(field || '');
    setSortOrder(order || 'desc');
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  // Build query parameters for server-side filtering - exact same pattern as candidates page
  const buildQueryParams = () => {
    const params: any = {
      page: currentPage,
      limit: pageSize,
    };

    if (debouncedSearchTerm.trim()) {
      params.search = debouncedSearchTerm.trim();
    }

    if (statusFilter.length > 0 && !statusFilter.includes('ALL')) {
      params.status = statusFilter;
    }

    if (sortBy && sortOrder) {
      params.sortBy = sortBy;
      params.sortOrder = sortOrder;
    }

    return params;
  };

  // Server-side query - exact same pattern as candidates page
  const {
    data: applicationsResponse,
    isLoading,
    refetch,
  } = useQuery<IPaginatedResponse<ICandidateJobApplication>>({
    queryKey: [
      'candidateApplications',
      currentPage,
      debouncedSearchTerm,
      statusFilter,
      pageSize,
      sortBy,
      sortOrder,
    ],
    queryFn: () =>
      candidateApplicationService.getApplications(buildQueryParams()),
  });

  // Custom refresh handler to manage loading state
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast.success('Applications refreshed');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Extract data - exact same pattern as candidates page
  const applications = applicationsResponse?.items || [];
  const totalPages = applicationsResponse?.pagination?.totalPages || 1;
  const totalItems = applicationsResponse?.pagination?.total || 0;

  const handleViewDetails = (application: ICandidateJobApplication) => {
    router.push(`/app/candidate/applications/${application.jobPostingId}`);
  };

  const handleApplicationAccept = async (
    application: ICandidateJobApplication
  ) => {
    setProcessingAppId(application.id);
    setProcessingAction('accept');
    try {
      // Try to apply - backend will validate invite status
      await candidateApplicationService.acceptApplication(application.id, {});
      toast.success(
        'Application confirmed! Redirecting you to your resume for Job AI.'
      );
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['candidateApplications'] }),
        queryClient.invalidateQueries({ queryKey: ['candidate-applications'] }),
        queryClient.invalidateQueries({ queryKey: ['candidate-profile'] }),
        queryClient.invalidateQueries({
          queryKey: ['candidate-job-ai-assessment-invitations-dashboard'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['candidate-job-ai-assessment-invitations'],
        }),
      ]);
      router.push('/app/candidate/resume');
    } catch (error: any) {
      const errorCode = error?.response?.data?.code;
      const errorMessage =
        error?.response?.data?.message || error?.message || '';

      // Check if error is about invite being expired
      if (
        errorCode === 'ERR_3007' ||
        errorMessage.includes('expired') ||
        errorMessage.includes('Invite has expired')
      ) {
        toast.error('Invite has expired, Contact support for new invite', {
          duration: 6000,
        });
        // Optionally redirect to assessment invites page where they might see expired invites
        router.push('/app/candidate/assessment-invites');
      }
      // Check if error is about invite not being accepted
      else if (
        errorCode === 'ERR_9011' ||
        errorMessage.includes('accept the invitation') ||
        errorMessage.includes('accept the job invitation')
      ) {
        toast.error(
          'You must accept the job invitation before applying. Please accept the invitation first.',
          {
            duration: 5000,
          }
        );
        // Redirect to assessment invites page
        router.push('/app/candidate/assessment-invites');
      } else {
        toast.error(errorMessage || 'Failed to confirm application.');
      }
    } finally {
      setProcessingAppId(null);
      setProcessingAction(null);
    }
  };

  const handleApplicationDecline = (application: ICandidateJobApplication) => {
    setSelectedApplication(application);
    setShowDeclineDialog(true);
  };

  const confirmDecline = async () => {
    if (!selectedApplication) return;
    setProcessingAppId(selectedApplication.id);
    setProcessingAction('decline');
    try {
      await candidateApplicationService.rejectApplication(
        selectedApplication.id,
        {
          notes: 'Candidate declined from applications list',
        }
      );
      toast.success('Application declined Successfully');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['candidateApplications'] }),
        queryClient.invalidateQueries({ queryKey: ['candidate-profile'] }),
        queryClient.invalidateQueries({
          queryKey: ['candidate-assessment-invites-pending'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['candidateJobAssessmentInvites'],
        }),
      ]);
      setShowDeclineDialog(false);
      setSelectedApplication(null);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to decline application.'
      );
    } finally {
      setProcessingAppId(null);
      setProcessingAction(null);
    }
  };

  // Badge variant helpers - exact same pattern as candidates page
  const getStatusBadgeVariant = (status: ApplicationStatusEnum) => {
    switch (status) {
      case ApplicationStatusEnum.APPLIED:
        return 'secondary';
      case ApplicationStatusEnum.REVIEWING:
        return 'outline';
      case ApplicationStatusEnum.SHORTLISTED:
        return 'default';
      case ApplicationStatusEnum.OFFERED:
        return 'default';
      case ApplicationStatusEnum.ACCEPTED:
        return 'default';
      case ApplicationStatusEnum.REJECTED:
        return 'destructive';
      case ApplicationStatusEnum.DECLINED:
        return 'destructive';
      case ApplicationStatusEnum.WITHDRAWN:
        return 'secondary';
      default:
        return 'default';
    }
  };

  // Table configuration - exact same pattern as candidates page
  const columns: SaasTableColumn<ICandidateJobApplication>[] = [
    {
      key: 'jobPosting.title',
      label: 'Position',
      sortable: false,
      render: (application: ICandidateJobApplication) => (
        <div className="flex items-center gap-2">
          <Building className="text-muted-foreground h-4 w-4" />
          <span className="text-sm font-medium">
            {application.jobPosting?.title || 'N/A'}
          </span>
        </div>
      ),
    },
    {
      key: 'jobPosting.company.name',
      label: 'Company',
      sortable: false,
      render: (application: ICandidateJobApplication) => (
        <span className="text-muted-foreground text-sm">
          {application.jobPosting?.company?.name || 'N/A'}
        </span>
      ),
    },
    {
      key: 'appliedAt',
      label: 'Applied Date',
      sortable: true,
      render: (application: ICandidateJobApplication) => (
        <div className="flex items-center gap-2">
          {application.acceptedAt ? (
            <>
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">
                {format(new Date(application.acceptedAt), 'MMM d, yyyy')}
              </span>
            </>
          ) : (
            <span className="text-muted-foreground text-sm">-</span>
          )}
        </div>
      ),
    },
    {
      key: 'declinedAt',
      label: 'Declined',
      sortable: true,
      render: (application: ICandidateJobApplication) => (
        <div className="flex items-center gap-2">
          {application.declinedAt ? (
            <>
              <XCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm">
                {format(new Date(application.declinedAt), 'MMM d, yyyy')}
              </span>
            </>
          ) : (
            <span className="text-muted-foreground text-sm">-</span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: false,
      render: (application: ICandidateJobApplication) => (
        <Badge
          variant={getStatusBadgeVariant(application.status) as any}
          className="text-xs"
        >
          {formatEnumValue(application.status)}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (application: ICandidateJobApplication) => {
        const isInvited = application.status === ApplicationStatusEnum.INVITED;
        const isProcessing = processingAppId === application.id;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewDetails(application)}
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </Button>
            {isInvited && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-md">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => handleApplicationAccept(application)}
                    disabled={isProcessing}
                  >
                    {isProcessing && processingAction === 'accept'
                      ? 'Applying...'
                      : 'Apply'}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleApplicationDecline(application)}
                    disabled={isProcessing}
                    className="text-destructive focus:text-destructive"
                  >
                    {isProcessing && processingAction === 'decline'
                      ? 'Declining...'
                      : 'Decline'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        );
      },
    },
  ];

  // Table filters - exact same pattern as candidates page
  const filters: SaasTableFilter[] = [
    {
      key: 'status',
      label: 'Status',
      placeholder: 'Select status',
      value: statusFilter,
      onChange: (value) => {
        if (Array.isArray(value)) {
          setStatusFilter(value as (ApplicationStatusEnum | 'ALL')[]);
        } else {
          setStatusFilter([value as ApplicationStatusEnum | 'ALL']);
        }
        setCurrentPage(1);
      },
      options: [
        ...Object.values(ApplicationStatusEnum).map((status) => ({
          label: formatEnumValue(status),
          value: status,
        })),
      ],
      type: 'multiselect',
    },
  ];

  // Pagination configuration - exact same pattern as candidates page
  const pagination: SaasPaginationInfo = {
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    onPageChange: setCurrentPage,
    onPageSizeChange: setPageSize,
    pageSizeOptions: PAGE_SIZE_OPTIONS,
    sortBy,
    sortOrder,
    onSortChange: handleSortChange,
  };

  const handleApplyNow = () => {
    router.push('/app/candidate/job-recommendations');
  };

  return (
    <div className="h-full space-y-6 px-4 py-2">
      {/* Custom header with Apply Now button */}
      <div className="flex items-start justify-between">
        <div>
          <div className="mb-2 flex items-center">
            <h1 className="text-primary dark:text-muted-foreground text-2xl font-bold">
              Job Applications
            </h1>
          </div>
          <p className="text-md text-gray-600 dark:text-gray-400">
            View and manage your job applications. Apply to new jobs and track
          </p>
        </div>

        <Button onClick={handleApplyNow} size="default" className="shrink-0">
          <BriefcaseIcon className="mr-2 h-4 w-4" />
          Find Jobs
        </Button>
      </div>

      <SaasDataTable<ICandidateJobApplication>
        title=""
        description=""
        columns={columns}
        data={applications}
        isLoading={isLoading || isRefreshing}
        searchable={true}
        searchValue={searchTerm}
        searchPlaceholder="Search applications by position or company..."
        onSearchChange={setSearchTerm}
        filters={filters}
        pagination={pagination}
        onRefresh={handleRefresh}
        emptyState={{
          title: 'No applications found',
          description: 'Try adjusting your search criteria or filters.',
        }}
        getRowKey={(application) => application.id}
      />

      {/* Decline Confirmation Dialog */}
      <Dialog open={showDeclineDialog} onOpenChange={setShowDeclineDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decline Application</DialogTitle>
            <DialogDescription>
              Are you sure you want to decline this application for{' '}
              <strong>{selectedApplication?.jobPosting?.title}</strong> at{' '}
              <strong>{selectedApplication?.jobPosting?.company?.name}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeclineDialog(false);
                setSelectedApplication(null);
              }}
              disabled={processingAppId === selectedApplication?.id}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDecline}
              disabled={processingAppId === selectedApplication?.id}
            >
              {processingAppId === selectedApplication?.id &&
              processingAction === 'decline'
                ? 'Declining...'
                : 'Decline Application'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ApplicationsPage() {
  return <ApplicationsPageContent />;
}

'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Eye, FileText, Calendar, Building, User, X } from 'lucide-react';
import { format } from 'date-fns';
import {
  ApplicationStatusEnum,
  IPartnerJobApplicationDetails,
  IPaginatedResponse,
} from '@/lib/shared';
import { formatEnumValue } from '@/lib/utils';
import { TooltipProvider } from '@/components/ui/tooltip';
import SaasDataTable, {
  SaasTableColumn,
  SaasTableAction,
  SaasTableFilter,
  SaasPaginationInfo,
} from '@/components/app/common/tables/saas-data-table';
import { partnerJobApplicationsService } from '@/lib/services/services';
import { toast } from 'sonner';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { logger } from '@/lib/logger';

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

const PartnerApplicationsPage = () => {
  // Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Pagination and filter states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<string>('appliedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Withdrawal dialog states
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [withdrawReason, setWithdrawReason] = useState('');
  const [selectedApplication, setSelectedApplication] =
    useState<IPartnerJobApplicationDetails | null>(null);

  // Details dialog states
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedApplicationForDetails, setSelectedApplicationForDetails] =
    useState<IPartnerJobApplicationDetails | null>(null);

  // Debounce search term - same pattern as jobs page
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

  // Handle sort change - same pattern as jobs page
  const handleSortChange = (
    field: string | null,
    order: 'asc' | 'desc' | null
  ) => {
    setSortBy(field || '');
    setSortOrder(order || 'desc');
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  // Build query parameters for server-side filtering - same pattern as jobs page
  const buildQueryParams = () => {
    const params: any = {
      page: currentPage,
      limit: pageSize,
    };

    if (debouncedSearchTerm.trim()) {
      params.search = debouncedSearchTerm.trim();
    }

    if (statusFilter && statusFilter !== 'all') {
      params.status = statusFilter;
    }

    if (sortBy && sortOrder) {
      params.sortBy = sortBy;
      params.sortOrder = sortOrder;
    }

    return params;
  };

  // Fetch applications with server-side query - same pattern as jobs page
  const {
    data: applicationsData,
    isLoading,
    error,
    refetch,
  } = useQuery<IPaginatedResponse<IPartnerJobApplicationDetails>>({
    queryKey: [
      'partner-job-applications',
      currentPage,
      debouncedSearchTerm,

      statusFilter,
      pageSize,
      sortBy,
      sortOrder,
    ],
    queryFn: () =>
      partnerJobApplicationsService.getJobApplications(buildQueryParams()),
  });

  // Get status badge variant
  const getStatusVariant = (status: ApplicationStatusEnum) => {
    switch (status) {
      case ApplicationStatusEnum.APPLIED:
        return 'default';
      case ApplicationStatusEnum.REVIEWING:
        return 'secondary';
      case ApplicationStatusEnum.SHORTLISTED:
        return 'default';
      case ApplicationStatusEnum.OFFERED:
        return 'success';
      case ApplicationStatusEnum.ACCEPTED:
        return 'success';
      case ApplicationStatusEnum.REJECTED:
        return 'destructive';
      case ApplicationStatusEnum.WITHDRAWN:
        return 'outline';
      case ApplicationStatusEnum.FAILED:
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  // Handle withdraw application
  const handleWithdrawApplication = async (applicationId: string) => {
    try {
      const withdrawData = withdrawReason.trim()
        ? { reason: withdrawReason.trim() }
        : {};
      await partnerJobApplicationsService.withdrawJobApplication(
        applicationId,
        withdrawData
      );
      toast.success('Application withdrawn successfully');
      refetch();
      // Reset dialog state
      setWithdrawDialogOpen(false);
      setWithdrawReason('');
      setSelectedApplication(null);
    } catch (error) {
      logger.error(error as string);
      toast.error('Failed to withdraw the application. Please try again.');
    }
  };

  // Open withdrawal dialog
  const openWithdrawDialog = (application: IPartnerJobApplicationDetails) => {
    setSelectedApplication(application);
    setWithdrawDialogOpen(true);
  };

  // Open details dialog
  const openDetailsDialog = (application: IPartnerJobApplicationDetails) => {
    setSelectedApplicationForDetails(application);
    setDetailsDialogOpen(true);
  };

  // Close details dialog
  const closeDetailsDialog = () => {
    setDetailsDialogOpen(false);
    setSelectedApplicationForDetails(null);
  };

  // Table columns
  const columns: SaasTableColumn<IPartnerJobApplicationDetails>[] = [
    {
      key: 'candidate.name',
      label: 'Candidate',
      sortable: true,
      render: (application) => (
        <div className="flex items-center space-x-3">
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {application.candidate.name}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {application.candidate.email}
            </div>
            {application.candidate.jobTitle && (
              <div className="text-xs text-gray-400 dark:text-gray-500">
                {application.candidate.jobTitle}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'jobPosting.title',
      label: 'Job',
      sortable: true,
      render: (application) => (
        <div className="flex items-center space-x-3">
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {application.jobPosting.title}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {application.jobPosting.company}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (application) => (
        <Badge variant={getStatusVariant(application.status)}>
          {formatEnumValue(application.status)}
        </Badge>
      ),
    },
    {
      key: 'appliedAt',
      label: 'Applied Date',
      sortable: true,
      render: (application) => (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {format(new Date(application.appliedAt), 'MMM dd, yyyy')}
          </span>
        </div>
      ),
    },
    {
      key: 'notes',
      label: 'Notes',
      render: (application) => (
        <div className="max-w-xs truncate text-sm text-gray-600 dark:text-gray-300">
          {application.notes || 'No notes'}
        </div>
      ),
    },
  ];

  // Table actions
  const actions: SaasTableAction<IPartnerJobApplicationDetails>[] = [
    {
      key: 'view',
      label: 'View Details',
      icon: <Eye className="h-4 w-4" />,
      onClick: (application) => openDetailsDialog(application),
    },
    {
      key: 'withdraw',
      label: 'Withdraw',
      icon: <X className="h-4 w-4" />,
      onClick: (application) => openWithdrawDialog(application),
      variant: 'destructive',
      hidden: (application: IPartnerJobApplicationDetails) =>
        application.status !== ApplicationStatusEnum.APPLIED &&
        application.status !== ApplicationStatusEnum.REVIEWING,
    },
  ];

  // Table filters - same pattern as jobs page
  const filters_config: SaasTableFilter[] = [
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      value: statusFilter,
      onChange: (value) => {
        setStatusFilter(value as string);
        setCurrentPage(1);
      },
      options: [
        { label: 'All Statuses', value: 'all' },
        ...Object.values(ApplicationStatusEnum).map((status) => ({
          label: formatEnumValue(status),
          value: status,
        })),
      ],
    },
  ];

  // Extract data - same pattern as jobs page
  const applications = applicationsData?.items || [];
  const totalPages = applicationsData?.pagination?.totalPages || 1;
  const totalItems = applicationsData?.pagination?.total || 0;

  // Pagination configuration - same pattern as jobs page
  const paginationInfo: SaasPaginationInfo = {
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    onPageChange: setCurrentPage,
    onPageSizeChange: setPageSize,
    pageSizeOptions: PAGE_SIZE_OPTIONS,
    sortBy,
    sortOrder,
    onSortChange: handleSortChange,
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Applications refreshed');
  };

  if (error) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Error loading applications
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      {/* <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {applicationsData?.pagination?.total || 0} applications
          </span>
        </div>
      </div> */}

      {/* Applications Table */}
      <TooltipProvider>
        <SaasDataTable<IPartnerJobApplicationDetails>
          title="Job Applications"
          description="Track and manage your submitted job applications"
          data={applications}
          columns={columns}
          actions={actions}
          filters={filters_config}
          pagination={paginationInfo}
          isLoading={isLoading}
          searchable={true}
          searchValue={searchTerm}
          searchPlaceholder="Search applications by job title or candidate name..."
          onSearchChange={setSearchTerm}
          onRefresh={handleRefresh}
          getRowKey={(item) => item.id}
          emptyState={{
            title: 'No applications found',
            description: searchTerm.trim()
              ? 'Try adjusting your search criteria or filters'
              : "You haven't submitted any job applications yet.",
            icon: <FileText className="h-12 w-12" />,
          }}
        />
      </TooltipProvider>

      {/* Withdrawal Confirmation Dialog */}
      <AlertDialog
        open={withdrawDialogOpen}
        onOpenChange={setWithdrawDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Withdraw Application</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to withdraw this application? This action
              cannot be undone.
              {selectedApplication && (
                <div className="mt-2 rounded-md bg-gray-50 p-3 dark:bg-gray-800">
                  <div className="text-sm">
                    <strong>Job:</strong> {selectedApplication.jobPosting.title}
                  </div>
                  <div className="text-sm">
                    <strong>Candidate:</strong>{' '}
                    {selectedApplication.candidate.name}
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="withdraw-reason">
                Reason for withdrawal (optional)
              </Label>
              <Textarea
                id="withdraw-reason"
                placeholder="Please provide a reason for withdrawing this application..."
                value={withdrawReason}
                onChange={(e) => setWithdrawReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setWithdrawReason('');
                setSelectedApplication(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                selectedApplication &&
                handleWithdrawApplication(selectedApplication.id)
              }
              className="bg-red-600 hover:bg-red-700"
            >
              Withdraw Application
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Application Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={closeDetailsDialog}>
        <DialogContent className="max-h-[80vh] max-w-2xl">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>

          <ScrollArea className="scrollbar-hide max-h-[60vh]">
            {selectedApplicationForDetails && (
              <div className="space-y-6">
                {/* Application Status */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Status</h3>
                  <Badge
                    variant={getStatusVariant(
                      selectedApplicationForDetails.status
                    )}
                  >
                    {formatEnumValue(selectedApplicationForDetails.status)}
                  </Badge>
                </div>

                <Separator />

                {/* Candidate Information */}
                <div className="space-y-4">
                  <h3 className="flex items-center gap-2 text-lg font-semibold">
                    <User className="h-5 w-5" />
                    Candidate Information
                  </h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">
                        Name
                      </Label>
                      <p className="text-sm">
                        {selectedApplicationForDetails.candidate.name}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">
                        Email
                      </Label>
                      <p className="text-sm">
                        {selectedApplicationForDetails.candidate.email}
                      </p>
                    </div>
                    {selectedApplicationForDetails.candidate.jobTitle && (
                      <div>
                        <Label className="text-sm font-medium text-gray-500">
                          Current Job Title
                        </Label>
                        <p className="text-sm">
                          {selectedApplicationForDetails.candidate.jobTitle}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Job Information */}
                <div className="space-y-4">
                  <h3 className="flex items-center gap-2 text-lg font-semibold">
                    <Building className="h-5 w-5" />
                    Job Information
                  </h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">
                        Job Title
                      </Label>
                      <p className="text-sm font-medium">
                        {selectedApplicationForDetails.jobPosting.title}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">
                        Company
                      </Label>
                      <p className="text-sm">
                        {selectedApplicationForDetails.jobPosting.company}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Application Timeline */}
                <div className="space-y-4">
                  <h3 className="flex items-center gap-2 text-lg font-semibold">
                    <Calendar className="h-5 w-5" />
                    Application Timeline
                  </h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">
                        Applied Date
                      </Label>
                      <p className="text-sm">
                        {format(
                          new Date(selectedApplicationForDetails.appliedAt),
                          'PPP'
                        )}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">
                        Last Updated
                      </Label>
                      <p className="text-sm">
                        {format(
                          new Date(selectedApplicationForDetails.updatedAt),
                          'PPP'
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Notes Section */}
                {selectedApplicationForDetails.notes && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <h3 className="flex items-center gap-2 text-lg font-semibold">
                        <FileText className="h-5 w-5" />
                        Notes
                      </h3>
                      <div className="rounded-md bg-gray-50 p-4 dark:bg-gray-800">
                        <p className="text-sm whitespace-pre-wrap">
                          {selectedApplicationForDetails.notes}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PartnerApplicationsPage;

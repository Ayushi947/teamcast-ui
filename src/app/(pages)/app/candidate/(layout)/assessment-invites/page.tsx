'use client';

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Clock, Building, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  IPaginatedResponse,
  JobAssessmentInviteStatusEnum,
  ICandidateJobAssessmentInviteResponse,
} from '@/lib/shared';
import { formatEnumValue } from '@/lib/utils';
import { candidateJobAssessmentInviteService } from '@/lib/services/services';
import SaasDataTable, {
  SaasTableColumn,
  SaasTableAction,
  SaasTableFilter,
  SaasPaginationInfo,
} from '@/components/app/common/tables/saas-data-table';

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

function AssessmentInvitesPageContent() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    (JobAssessmentInviteStatusEnum | 'ALL')[]
  >(['ALL']);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Dialog states
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);
  const [selectedInvite, setSelectedInvite] =
    useState<ICandidateJobAssessmentInviteResponse | null>(null);
  const [declineReason, setDeclineReason] = useState('');
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Debounce search term
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

  // Handle sort change
  const handleSortChange = (
    field: string | null,
    order: 'asc' | 'desc' | null
  ) => {
    setSortBy(field || '');
    setSortOrder(order || 'desc');
    setCurrentPage(1);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast.success('Assessment invites refreshed');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Build query parameters - match applications page pattern
  const buildQueryParams = () => {
    const params: any = {
      page: currentPage,
      limit: pageSize,
      sortBy,
      sortOrder,
    };

    if (debouncedSearchTerm.trim()) {
      params.search = debouncedSearchTerm.trim();
    }

    // Match applications page pattern - send status as array
    if (statusFilter.length > 0 && !statusFilter.includes('ALL')) {
      params.status = statusFilter;
    }

    return params;
  };

  // Fetch assessment invites with debugging
  const {
    data: invitesResponse,
    isLoading,
    error,
    refetch,
  } = useQuery<IPaginatedResponse<ICandidateJobAssessmentInviteResponse>>({
    queryKey: [
      'candidateJobAssessmentInvites',
      currentPage,
      debouncedSearchTerm,
      statusFilter,
      pageSize,
      sortBy,
      sortOrder,
    ],
    queryFn: async () => {
      const params = buildQueryParams();

      try {
        const result =
          await candidateJobAssessmentInviteService.getInvites(params);

        return result;
      } catch (err: any) {
        toast.error('Failed to load assessment invites. Please try again.');
        throw err;
      }
    },
  });

  // Handle error display
  useEffect(() => {
    if (error) {
      toast.error('Failed to load assessment invites. Please try again.');
    }
  }, [error]);

  // Extract data with proper null checks
  const invites = invitesResponse?.items || [];
  const totalPages =
    invitesResponse?.pagination?.totalPages ||
    Math.ceil((invitesResponse?.pagination?.total || 0) / pageSize) ||
    1;
  const totalItems = invitesResponse?.pagination?.total || 0;

  // Handle accept invite
  const handleAcceptInvite = (
    invite: ICandidateJobAssessmentInviteResponse
  ) => {
    setSelectedInvite(invite);
    setShowAcceptDialog(true);
  };

  // Handle decline invite
  const handleDeclineInvite = (
    invite: ICandidateJobAssessmentInviteResponse
  ) => {
    setSelectedInvite(invite);
    setShowDeclineDialog(true);
  };

  // Confirm accept
  const confirmAccept = async () => {
    if (!selectedInvite) return;
    setIsAccepting(true);
    try {
      await candidateJobAssessmentInviteService.acceptInvite(selectedInvite.id);
      toast.success(
        'Assessment invite accepted successfully! You can now apply to the job.'
      );
      setShowAcceptDialog(false);
      setSelectedInvite(null);

      // Invalidate queries to refresh data on both invite and interview pages
      // Also invalidate applications to sync invite status
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['candidateJobAssessmentInvites'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['candidateJobAiAssessmentInterviews'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['candidate-assessment-invites-pending'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['candidateApplications'],
        }),
      ]);

      refetch();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to accept assessment invite');
    } finally {
      setIsAccepting(false);
    }
  };

  // Confirm decline
  const confirmDecline = async () => {
    if (!selectedInvite) return;
    setIsDeclining(true);
    try {
      await candidateJobAssessmentInviteService.declineInvite(
        selectedInvite.id,
        declineReason.trim() ? { reason: declineReason.trim() } : undefined
      );
      toast.success('Assessment invite declined successfully.');
      setShowDeclineDialog(false);
      setSelectedInvite(null);
      setDeclineReason('');

      // Invalidate queries to refresh data on both invite and interview pages
      // Also invalidate applications to sync invite status (application will be declined)
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['candidateJobAssessmentInvites'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['candidateJobAiAssessmentInterviews'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['candidate-assessment-invites-pending'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['candidateApplications'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['candidate-applications'],
        }),
      ]);

      refetch();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to decline assessment invite');
    } finally {
      setIsDeclining(false);
    }
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: JobAssessmentInviteStatusEnum) => {
    switch (status) {
      case JobAssessmentInviteStatusEnum.PENDING:
        return 'secondary';
      case JobAssessmentInviteStatusEnum.ACCEPTED:
        return 'default';
      case JobAssessmentInviteStatusEnum.DECLINED:
        return 'destructive';
      case JobAssessmentInviteStatusEnum.EXPIRED:
        return 'outline';
      default:
        return 'default';
    }
  };

  // Define table columns
  const columns: SaasTableColumn<ICandidateJobAssessmentInviteResponse>[] = [
    {
      key: 'jobPostingTitle',
      label: 'Position',
      sortable: false,
      render: (invite: ICandidateJobAssessmentInviteResponse) => (
        <div className="space-y-1">
          <div className="text-sm font-medium">
            {invite.jobPostingTitle || 'N/A'}
          </div>
        </div>
      ),
    },
    {
      key: 'companyName',
      label: 'Company',
      sortable: false,
      render: (invite: ICandidateJobAssessmentInviteResponse) => (
        <div className="flex items-center gap-1 text-sm">
          <Building className="text-muted-foreground h-3 w-3" />
          {invite.companyName || 'N/A'}
        </div>
      ),
    },
    {
      key: 'inviterName',
      label: 'Invited By',
      sortable: false,
      render: (invite: ICandidateJobAssessmentInviteResponse) => (
        <div className="text-sm">{invite.inviterName || 'System'}</div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Invited',
      sortable: true,
      render: (invite: ICandidateJobAssessmentInviteResponse) => (
        <div className="flex items-center gap-1 text-sm">
          <Calendar className="text-muted-foreground h-3 w-3" />
          {invite.createdAt
            ? format(new Date(invite.createdAt), 'MMM d, yyyy')
            : 'N/A'}
        </div>
      ),
    },
    {
      key: 'expiresAt',
      label: 'Expires',
      sortable: true,
      render: (invite: ICandidateJobAssessmentInviteResponse) => {
        if (!invite.expiresAt) {
          return (
            <span className="text-muted-foreground text-sm">No expiry</span>
          );
        }
        const isExpired = new Date(invite.expiresAt) < new Date();
        return (
          <div
            className={`flex items-center gap-1 text-sm ${isExpired ? 'text-destructive' : 'text-muted-foreground'}`}
          >
            <Clock className="h-3 w-3" />
            {format(new Date(invite.expiresAt), 'MMM d, yyyy')}
          </div>
        );
      },
    },
    {
      key: 'acceptedAt',
      label: 'Accepted',
      sortable: true,
      render: (invite: ICandidateJobAssessmentInviteResponse) => (
        <div className="flex items-center gap-1 text-sm">
          {invite.acceptedAt ? (
            <>
              <CheckCircle className="h-3 w-3 text-green-500" />
              {format(new Date(invite.acceptedAt), 'MMM d, yyyy')}
            </>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
      ),
    },
    {
      key: 'declinedAt',
      label: 'Declined',
      sortable: true,
      render: (invite: ICandidateJobAssessmentInviteResponse) => (
        <div className="flex items-center gap-1 text-sm">
          {invite.declinedAt ? (
            <>
              <XCircle className="h-3 w-3 text-red-500" />
              {format(new Date(invite.declinedAt), 'MMM d, yyyy')}
            </>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: false,
      render: (invite: ICandidateJobAssessmentInviteResponse) => (
        <Badge variant={getStatusBadgeVariant(invite.status) as any}>
          {formatEnumValue(invite.status)}
        </Badge>
      ),
    },
  ];

  // Table actions
  const actions: SaasTableAction<ICandidateJobAssessmentInviteResponse>[] = [
    {
      key: 'accept',
      label: 'Accept',
      icon: <CheckCircle className="h-4 w-4" />,
      hidden: (invite) =>
        invite.status !== JobAssessmentInviteStatusEnum.PENDING,
      onClick: (invite: ICandidateJobAssessmentInviteResponse) => {
        const isExpired =
          invite.expiresAt && new Date(invite.expiresAt) < new Date();
        if (!isExpired) {
          handleAcceptInvite(invite);
        } else {
          toast.error('This invitation has expired');
        }
      },
    },
    {
      key: 'decline',
      label: 'Decline',
      icon: <XCircle className="h-4 w-4" />,
      variant: 'destructive' as const,
      hidden: (invite) =>
        invite.status !== JobAssessmentInviteStatusEnum.PENDING,
      onClick: (invite: ICandidateJobAssessmentInviteResponse) => {
        const isExpired =
          invite.expiresAt && new Date(invite.expiresAt) < new Date();
        if (!isExpired) {
          handleDeclineInvite(invite);
        } else {
          toast.error('This invitation has expired');
        }
      },
    },
  ];

  // Filter options
  const filters: SaasTableFilter[] = [
    {
      key: 'status',
      label: 'Status',
      placeholder: 'Select status',
      value: statusFilter,
      onChange: (value) => {
        if (Array.isArray(value)) {
          setStatusFilter(value as (JobAssessmentInviteStatusEnum | 'ALL')[]);
        } else {
          setStatusFilter([value as JobAssessmentInviteStatusEnum | 'ALL']);
        }
        setCurrentPage(1);
      },
      options: [
        { label: 'All Status', value: 'ALL' },
        ...Object.values(JobAssessmentInviteStatusEnum).map((status) => ({
          label: formatEnumValue(status),
          value: status as string,
        })),
      ],
      type: 'multiselect',
    },
  ];

  // Pagination configuration
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

  return (
    <div className="h-full space-y-6 px-4 py-2">
      <div>
        <div className="mb-2 flex items-center">
          <h1 className="text-primary dark:text-muted-foreground text-2xl font-bold">
            Assessment Invites
          </h1>
        </div>
        <p className="text-md text-gray-600 dark:text-gray-400">
          Review and respond to assessment invitations from potential employers
        </p>
      </div>
      <SaasDataTable<ICandidateJobAssessmentInviteResponse>
        title=""
        description=""
        columns={columns}
        data={invites}
        actions={actions}
        isLoading={isLoading || isRefreshing}
        searchable={true}
        searchValue={searchTerm}
        searchPlaceholder="Search by position, company, or invited by..."
        onSearchChange={setSearchTerm}
        filters={filters}
        pagination={pagination}
        onRefresh={handleRefresh}
        emptyState={{
          title: 'No assessment invites found',
          description:
            "You haven't received any assessment invitations yet. Check back later or adjust your search criteria.",
        }}
        getRowKey={(invite) => invite.id}
      />

      {/* Accept Confirmation Dialog */}
      <Dialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accept Assessment Invite</DialogTitle>
            <DialogDescription>
              Are you sure you want to accept this assessment invitation
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAcceptDialog(false)}
              disabled={isAccepting}
            >
              Cancel
            </Button>
            <Button onClick={confirmAccept} disabled={isAccepting}>
              {isAccepting ? 'Accepting...' : 'Accept Invite'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Decline Confirmation Dialog */}
      <Dialog open={showDeclineDialog} onOpenChange={setShowDeclineDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decline Assessment Invite</DialogTitle>
            <DialogDescription>
              Are you sure you want to decline this assessment invitation for{' '}
              <strong>{selectedInvite?.jobPostingTitle}</strong> at{' '}
              <strong>{selectedInvite?.companyName}</strong>?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="decline-reason">
                Reason for declining (optional)
              </Label>
              <Textarea
                id="decline-reason"
                placeholder="Please provide a reason for declining this invitation..."
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeclineDialog(false)}
              disabled={isDeclining}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDecline}
              disabled={isDeclining}
            >
              {isDeclining ? 'Declining...' : 'Decline Invite'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AssessmentInvitesPage() {
  return <AssessmentInvitesPageContent />;
}

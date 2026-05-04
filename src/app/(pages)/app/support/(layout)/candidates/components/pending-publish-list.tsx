'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { formatEnumValue, formatScore } from '@/lib/utils';
import { ISupportRecommendedCandidate } from '@/lib/shared';
import { supportCandidateManagementService } from '@/lib/services/services';
import { Send, X } from 'lucide-react';
import SaasDataTable, {
  SaasTableColumn,
  SaasTableAction,
  SaasTableFilter,
  SaasPaginationInfo,
} from '@/components/app/common/tables/saas-data-table';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useTableQueryParams } from '@/lib/hooks/use-table-query-params';

interface ClickableTooltipProps {
  children: React.ReactNode;
  tooltipContent?: string;
  className?: string;
  onClick?: () => void;
}

interface ViewProfileTooltipProps {
  children: React.ReactNode;
  onViewProfile: () => void;
  className?: string;
}

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export function PendingPublishList() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>(['ALL']);

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

  // Publish dialog state
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] =
    useState<ISupportRecommendedCandidate | null>(null);
  const [publishNote, setPublishNote] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  // Do Not Publish dialog state
  const [isDoNotPublishDialogOpen, setIsDoNotPublishDialogOpen] =
    useState(false);
  const [doNotPublishNote, setDoNotPublishNote] = useState('');
  const [isDoNotPublishing, setIsDoNotPublishing] = useState(false);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1);
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
    const params: Record<string, string | number | string[]> = {
      ...paginationParams,
    };

    if (debouncedSearchTerm.trim()) {
      params.search = debouncedSearchTerm.trim();
    }

    if (statusFilter.length > 0 && !statusFilter.includes('ALL')) {
      params.status = statusFilter;
    }

    return params;
  };

  // Server-side query
  const {
    data: candidatesResponse,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [
      'support-recommended-candidates',
      currentPage,
      debouncedSearchTerm,
      statusFilter,
      pageSize,
      sortBy,
      sortOrder,
    ],
    queryFn: () =>
      supportCandidateManagementService.getRecommendedCandidates({
        ...buildQueryParams(),
      }),
  });

  // Extract data
  const candidates = candidatesResponse?.items || [];
  const totalPages = candidatesResponse?.pagination?.totalPages || 1;
  const totalItems = candidatesResponse?.pagination?.total || 0;

  const handlePublishClick = (candidate: ISupportRecommendedCandidate) => {
    setSelectedCandidate(candidate);
    setPublishNote('');
    setIsPublishDialogOpen(true);
  };

  const handleDoNotPublishClick = (candidate: ISupportRecommendedCandidate) => {
    setSelectedCandidate(candidate);
    setDoNotPublishNote('');
    setIsDoNotPublishDialogOpen(true);
  };

  const handlePublishConfirm = async () => {
    if (!selectedCandidate || !publishNote.trim()) return;

    setIsPublishing(true);
    try {
      await supportCandidateManagementService.publishCandidate(
        selectedCandidate.id,
        publishNote.trim()
      );
      toast.success('Candidate published successfully');
      setIsPublishDialogOpen(false);
      setSelectedCandidate(null);
      setPublishNote('');
      refetch();
    } catch (error) {
      toast.error('Failed to publish candidate');
      logger.error('Error publishing candidate:', error);
    } finally {
      setIsPublishing(false);
    }
  };

  const handlePublishCancel = () => {
    setIsPublishDialogOpen(false);
    setSelectedCandidate(null);
    setPublishNote('');
  };

  const handleDoNotPublishConfirm = async () => {
    if (!selectedCandidate || !doNotPublishNote.trim()) return;

    setIsDoNotPublishing(true);
    try {
      await supportCandidateManagementService.doNotPublishCandidate(
        selectedCandidate.id,
        doNotPublishNote.trim()
      );
      toast.success('Candidate marked as do not publish successfully');
      setIsDoNotPublishDialogOpen(false);
      setSelectedCandidate(null);
      setDoNotPublishNote('');
      refetch();
    } catch (error) {
      toast.error('Failed to mark candidate as do not publish');
      logger.error('Error marking candidate as do not publish:', error);
    } finally {
      setIsDoNotPublishing(false);
    }
  };

  const handleDoNotPublishCancel = () => {
    setIsDoNotPublishDialogOpen(false);
    setSelectedCandidate(null);
    setDoNotPublishNote('');
  };

  const handleViewProfile = (candidate: ISupportRecommendedCandidate) => {
    router.push(
      `/app/support/candidates/${candidate.id}?tab=pending-publish&page=${currentPage}`
    );
  };

  // Badge variant helpers
  const getRecommendationBadgeVariant = (recommendation: string) => {
    switch (recommendation) {
      case 'HIGHLY_RECOMMENDED':
        return 'default';
      case 'RECOMMENDED':
        return 'secondary';
      case 'NOT_RECOMMENDED':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Table configuration
  const columns: SaasTableColumn<ISupportRecommendedCandidate>[] = [
    {
      key: 'fullName',
      label: 'Name',
      render: (candidate: ISupportRecommendedCandidate) => (
        <ViewProfileTooltip
          onViewProfile={() => handleViewProfile(candidate)}
          className="hover:text-primary cursor-pointer font-medium transition-colors"
        >
          {candidate.fullName}
        </ViewProfileTooltip>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      render: (candidate: ISupportRecommendedCandidate) => (
        <ViewProfileTooltip onViewProfile={() => handleViewProfile(candidate)}>
          {candidate.email}
        </ViewProfileTooltip>
      ),
    },
    {
      key: 'assessmentScore',
      label: 'Assessment Score',
      sortable: true,
      render: (candidate: ISupportRecommendedCandidate) => {
        const score = candidate.onboardingAssessment?.score;
        if (!score) return 'N/A';

        return (
          <ViewProfileTooltip
            onViewProfile={() => handleViewProfile(candidate)}
            className="hover:text-primary flex cursor-pointer items-center gap-2 transition-colors"
          >
            <span className="text-sm text-gray-600">{formatScore(score)}%</span>
            <Progress value={formatScore(score)} className="w-16" />
          </ViewProfileTooltip>
        );
      },
    },
    {
      key: 'assessmentCompletedAt',
      label: 'Assessment Completed',
      sortable: true,
      render: (candidate: ISupportRecommendedCandidate) => (
        <ViewProfileTooltip onViewProfile={() => handleViewProfile(candidate)}>
          {candidate.onboardingAssessment?.completedAt
            ? format(
                new Date(candidate.onboardingAssessment.completedAt),
                'MMM d, yyyy'
              )
            : '-'}
        </ViewProfileTooltip>
      ),
    },
    {
      key: 'recommendation',
      label: 'Recommendation',
      render: (candidate: ISupportRecommendedCandidate) => {
        const recommendation = candidate.onboardingAssessment?.recommendation;
        if (!recommendation) return 'No assessment';

        return (
          <ViewProfileTooltip
            onViewProfile={() => handleViewProfile(candidate)}
          >
            <Badge
              variant={getRecommendationBadgeVariant(recommendation) as any}
            >
              {formatEnumValue(recommendation)}
            </Badge>
          </ViewProfileTooltip>
        );
      },
    },
  ];

  // Table actions - dropdown menu with publish and do not publish options
  const actions: SaasTableAction<ISupportRecommendedCandidate>[] = [
    {
      key: 'publish',
      label: 'Publish',
      icon: <Send className="h-4 w-4" />,
      onClick: (candidate: ISupportRecommendedCandidate) =>
        handlePublishClick(candidate),
      hidden: (candidate: ISupportRecommendedCandidate) =>
        candidate.isPublished,
    },
    {
      key: 'do-not-publish',
      label: 'Do Not Publish',
      icon: <X className="h-4 w-4" />,
      onClick: (candidate: ISupportRecommendedCandidate) =>
        handleDoNotPublishClick(candidate),
      variant: 'destructive',
      hidden: (candidate: ISupportRecommendedCandidate) =>
        candidate.isPublished,
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
          setStatusFilter(value as string[]);
        } else {
          setStatusFilter([value as string]);
        }
        setPage(1);
      },
      options: [
        { label: 'All Status', value: 'ALL' },
        { label: 'Active', value: 'ACTIVE' },
        { label: 'Inactive', value: 'INACTIVE' },
        { label: 'Blocked', value: 'BLOCKED' },
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
    onPageSizeChange: setPageSize,
    pageSizeOptions: PAGE_SIZE_OPTIONS,
    sortBy: sortBy ?? undefined,
    sortOrder: sortBy ? sortOrder : undefined,
    onSortChange: handleSortChange,
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Pending publish candidates refreshed');
  };

  return (
    <>
      <SaasDataTable<ISupportRecommendedCandidate>
        columns={columns}
        data={candidates}
        actions={actions}
        isLoading={isLoading}
        searchable={true}
        searchValue={searchTerm}
        searchPlaceholder="Search candidates by name or email..."
        onSearchChange={setSearchTerm}
        filters={filters}
        pagination={pagination}
        onRefresh={handleRefresh}
        emptyState={{
          title: 'No candidates pending publish',
          description:
            'All candidates have been published or no recommendations available',
        }}
        getRowKey={(candidate) => candidate.id}
        onRowClick={handleViewProfile}
      />

      {/* Publish Dialog */}
      <Dialog open={isPublishDialogOpen} onOpenChange={setIsPublishDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Publish Candidate</DialogTitle>
            <DialogDescription>
              Are you sure you want to publish{' '}
              <span className="font-semibold">
                {selectedCandidate?.fullName}
              </span>
              ? This will make their profile visible to clients.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="publish-note">
                Note <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="publish-note"
                placeholder="Add a note about why this candidate is being published..."
                value={publishNote}
                onChange={(e) => setPublishNote(e.target.value)}
                rows={3}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handlePublishCancel}
              disabled={isPublishing}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePublishConfirm}
              disabled={isPublishing || !publishNote.trim()}
              className="bg-primary"
            >
              {isPublishing ? 'Publishing...' : 'Publish Candidate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Do Not Publish Dialog */}
      <Dialog
        open={isDoNotPublishDialogOpen}
        onOpenChange={setIsDoNotPublishDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Do Not Publish Candidate</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark{' '}
              <span className="font-semibold">
                {selectedCandidate?.fullName}
              </span>{' '}
              as do not publish? This will mark the candidate as reviewed but
              not published.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="do-not-publish-note">
                Note <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="do-not-publish-note"
                placeholder="Add a note about why this candidate is not being published..."
                value={doNotPublishNote}
                onChange={(e) => setDoNotPublishNote(e.target.value)}
                rows={3}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleDoNotPublishCancel}
              disabled={isDoNotPublishing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDoNotPublishConfirm}
              disabled={isDoNotPublishing || !doNotPublishNote.trim()}
            >
              {isDoNotPublishing ? 'Processing...' : 'Do Not Publish'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function ClickableTooltip({
  children,
  tooltipContent = 'View Profile',
  className = 'hover:text-primary cursor-pointer transition-colors',
  onClick,
}: ClickableTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={className} onClick={onClick}>
            {children}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipContent}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function ViewProfileTooltip({
  children,
  onViewProfile,
  className = 'hover:text-primary cursor-pointer transition-colors',
}: ViewProfileTooltipProps) {
  return (
    <ClickableTooltip
      tooltipContent="View Profile"
      className={className}
      onClick={onViewProfile}
    >
      {children}
    </ClickableTooltip>
  );
}

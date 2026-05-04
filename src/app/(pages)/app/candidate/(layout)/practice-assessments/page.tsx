'use client';

import { useQuery } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, ExternalLink, Calendar, MessageSquare } from 'lucide-react';
import { candidatePracticeAssessmentService } from '@/lib/services/services';
import {
  IPublicPracticeAssessment,
  PublicPracticeAssessmentStatusEnum,
  PublicPracticeAssessmentRecommendationEnum,
} from '@/lib/shared';
import { formatEnumValue, analyzeFeedbackSummary } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { PracticeAssessmentDetailsDialog } from './components/practice-assessment-details-dialog';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import SaasDataTable, {
  SaasTableColumn,
  SaasTableAction,
  SaasPaginationInfo,
} from '@/components/app/common/tables/saas-data-table';
import { format } from 'date-fns';

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export default function PracticeAssessmentsPage() {
  const router = useRouter();
  const [selectedAssessment, setSelectedAssessment] =
    useState<IPublicPracticeAssessment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchValue, setSearchValue] = useState('');

  const {
    data: assessmentsData,
    isLoading,
    error,
    refetch,
  } = useQuery<{
    items: IPublicPracticeAssessment[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }>({
    queryKey: [
      'candidate-practice-assessments',
      currentPage,
      pageSize,
      sortBy,
      sortOrder,
    ],
    queryFn: () =>
      candidatePracticeAssessmentService.getPracticeAssessmentsForCandidate({
        page: currentPage,
        limit: pageSize,
        sortBy: sortBy,
        sortOrder: sortOrder,
      }),
  });

  const handleViewDetails = (assessment: IPublicPracticeAssessment) => {
    setSelectedAssessment(assessment);
    setIsDialogOpen(true);
  };

  const handleSortChange = (
    field: string | null,
    order: 'asc' | 'desc' | null
  ) => {
    setSortBy(field || 'createdAt');
    setSortOrder(order || 'desc');
    setCurrentPage(1);
  };

  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return 'N/A';
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return format(dateObj, 'MMM dd, yyyy');
    } catch {
      return 'N/A';
    }
  };

  const getStatusBadge = (status: PublicPracticeAssessmentStatusEnum) => {
    if (
      status === PublicPracticeAssessmentStatusEnum.COMPLETED ||
      status === PublicPracticeAssessmentStatusEnum.AI_REVIEW_COMPLETED
    ) {
      return (
        <Badge className="rounded-full border border-green-500 bg-transparent px-2.5 py-0.5 text-xs font-normal text-green-500 dark:border-green-600 dark:text-green-400">
          Completed
        </Badge>
      );
    }
    if (
      status === PublicPracticeAssessmentStatusEnum.IN_PROGRESS ||
      status === PublicPracticeAssessmentStatusEnum.AI_REVIEW_IN_PROGRESS
    ) {
      return (
        <Badge className="rounded-full border border-amber-500 bg-transparent px-2.5 py-0.5 text-xs font-normal text-amber-500 dark:border-amber-600 dark:text-amber-400">
          In Progress
        </Badge>
      );
    }
    return (
      <Badge className="rounded-full border border-gray-500 bg-transparent px-2.5 py-0.5 text-xs font-normal text-gray-500 dark:border-gray-600 dark:text-gray-400">
        {formatEnumValue(status)}
      </Badge>
    );
  };

  const getRecommendationBadge = (
    recommendation: PublicPracticeAssessmentRecommendationEnum
  ) => {
    if (
      recommendation ===
        PublicPracticeAssessmentRecommendationEnum.RECOMMENDED ||
      recommendation ===
        PublicPracticeAssessmentRecommendationEnum.HIGHLY_RECOMMENDED
    ) {
      return (
        <Badge className="rounded-full border border-green-200 bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800 dark:border-green-700 dark:bg-green-900/20 dark:text-green-400">
          {formatEnumValue(recommendation)}
        </Badge>
      );
    }
    return (
      <Badge className="rounded-full border border-red-200 bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800 dark:border-red-700 dark:bg-red-900/20 dark:text-red-400">
        {formatEnumValue(recommendation)}
      </Badge>
    );
  };

  const columns: SaasTableColumn<IPublicPracticeAssessment>[] = [
    {
      key: 'title',
      label: 'Assessment',
      render: (assessment) => (
        <div className="flex flex-col gap-1">
          <span className="font-medium text-gray-900 dark:text-white">
            {assessment.title || 'Practice Assessment'}
          </span>
          {assessment.sourceJobUrl && (
            <a
              href={assessment.sourceJobUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary dark:text-primary inline-flex items-center gap-1 text-xs hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              <span>View Job Posting</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (assessment) => {
        const isCompleted =
          assessment.status === PublicPracticeAssessmentStatusEnum.COMPLETED ||
          assessment.status ===
            PublicPracticeAssessmentStatusEnum.AI_REVIEW_COMPLETED;
        const hasRecommendation = !!assessment.recommendation;

        if (isCompleted && hasRecommendation) {
          return getRecommendationBadge(assessment.recommendation!);
        }
        return getStatusBadge(assessment.status);
      },
    },
    {
      key: 'feedback',
      label: 'Feedback',
      align: 'center',
      render: (assessment) => {
        const isAiReviewCompleted =
          assessment.status ===
            PublicPracticeAssessmentStatusEnum.AI_REVIEW_COMPLETED ||
          assessment.status === PublicPracticeAssessmentStatusEnum.COMPLETED;
        const hasFeedback = !!assessment.overallFeedback;

        if (!isAiReviewCompleted || !hasFeedback) {
          return <span className="text-muted-foreground text-sm">-</span>;
        }

        const feedbackSummary = analyzeFeedbackSummary(
          assessment.overallFeedback
        );

        if (!feedbackSummary) {
          return <span className="text-muted-foreground text-sm">-</span>;
        }

        // Get badge colors based on category
        const getBadgeStyles = () => {
          switch (feedbackSummary.category) {
            case 'excellent':
              return 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400';
            case 'good':
              return 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400';
            case 'better':
              return 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400';
            case 'needs-improvement':
              return 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400';
            default:
              return 'bg-gray-50 border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400';
          }
        };

        const badgeStyles = getBadgeStyles();

        return (
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help">
                  <Badge
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${badgeStyles} transition-all hover:scale-105`}
                  >
                    <div className="flex cursor-pointer items-center gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>{feedbackSummary.label}</span>
                    </div>
                  </Badge>
                </div>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                variant="secondary"
                maxWidth="max-w-md"
                className="p-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <span className="text-sm font-semibold">
                      {feedbackSummary.label}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                    {assessment.overallFeedback}
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (assessment) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {formatDate(assessment.createdAt)}
          </span>
        </div>
      ),
    },
    {
      key: 'completedAt',
      label: 'Completed',
      render: (assessment) => {
        if (!assessment.completedAt) {
          return <span className="text-muted-foreground text-sm">-</span>;
        }
        return (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {formatDate(assessment.completedAt)}
            </span>
          </div>
        );
      },
    },
  ];

  const actions: SaasTableAction<IPublicPracticeAssessment>[] = [
    {
      key: 'view',
      label: 'View Results',
      icon: <Eye className="h-4 w-4" />,
      onClick: handleViewDetails,
      disabled: (assessment) =>
        assessment.status !== PublicPracticeAssessmentStatusEnum.COMPLETED &&
        assessment.status !==
          PublicPracticeAssessmentStatusEnum.AI_REVIEW_COMPLETED,
    },
  ];

  const assessments = assessmentsData?.items || [];

  // Client-side search filtering
  const filteredAssessments = useMemo(() => {
    if (!searchValue.trim()) {
      return assessments;
    }

    const searchLower = searchValue.toLowerCase().trim();
    return assessments.filter((assessment) => {
      const title = (assessment.title || '').toLowerCase();
      const description = (assessment.description || '').toLowerCase();
      const status = formatEnumValue(assessment.status).toLowerCase();
      const recommendation = assessment.recommendation
        ? formatEnumValue(assessment.recommendation).toLowerCase()
        : '';

      return (
        title.includes(searchLower) ||
        description.includes(searchLower) ||
        status.includes(searchLower) ||
        recommendation.includes(searchLower)
      );
    });
  }, [assessments, searchValue]);

  const totalPages = assessmentsData?.pagination?.totalPages || 1;
  const totalItems = assessmentsData?.pagination?.total || 0;

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

  const handleRefresh = () => {
    refetch();
    toast.success('Practice assessments refreshed');
  };

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Practice Assessment Results
          </h1>
          <p className="text-muted-foreground">
            View your practice assessment results and performance
          </p>
        </div>
        {assessments.length > 0 && (
          <Button onClick={() => router.push('/candidate')}>
            Start New Practice Assessment
          </Button>
        )}
      </div>

      <SaasDataTable<IPublicPracticeAssessment>
        columns={columns}
        data={filteredAssessments}
        actions={actions}
        isLoading={isLoading}
        error={error ? 'Failed to load practice assessments' : null}
        getRowKey={(assessment) => assessment.id}
        pagination={pagination}
        onRefresh={handleRefresh}
        searchable={true}
        searchValue={searchValue}
        searchPlaceholder="Search assessments by title, status, or recommendation..."
        onSearchChange={setSearchValue}
        emptyState={{
          title: searchValue
            ? 'No assessments match your search'
            : 'No practice assessments found',
          description: searchValue
            ? 'Try adjusting your search terms'
            : 'Start a practice assessment to see your results here.',
          action: searchValue
            ? undefined
            : {
                label: 'Start Practice Assessment',
                onClick: () => router.push('/candidate'),
              },
        }}
      />

      {selectedAssessment && (
        <PracticeAssessmentDetailsDialog
          key={selectedAssessment.id}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          assessment={selectedAssessment}
        />
      )}
    </div>
  );
}

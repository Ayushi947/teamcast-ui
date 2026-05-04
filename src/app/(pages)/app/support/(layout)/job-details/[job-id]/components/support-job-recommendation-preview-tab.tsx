'use client';

import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  MapPin,
  RefreshCw,
  User,
  Eye,
  Edit,
  Loader2,
  Search,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  ISupportJobRecommendationPreview,
  IClientJobPosting,
} from '@/lib/shared';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import {
  supportJobPostingRecommendationService,
  supportClientManagementService,
} from '@/lib/services/services';
import { CommonTags } from '@/components/ui/common-tags';
import AIPoweredLogo from '@/components/app/common/animations/ai-powered-logo';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { logger } from '@/lib/logger';

interface SupportJobRecommendationPreviewTabProps {
  job: IClientJobPosting;
  onRecommendationStored?: () => void;
}

interface MetadataFormData {
  score: number;
  overallGroundingInfo: string;
}

// Interface for integration provider
interface IntegrationProvider {
  id: string;
  name: string;
  logoUrl?: string;
  type: string;
}

export const SupportJobRecommendationPreviewTab: React.FC<
  SupportJobRecommendationPreviewTabProps
> = ({ job, onRecommendationStored }) => {
  const router = useRouter();
  const [selectedRecommendation, setSelectedRecommendation] =
    useState<ISupportJobRecommendationPreview | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editedMetadata, setEditedMetadata] = useState<MetadataFormData>({
    score: 0,
    overallGroundingInfo: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Candidate search state
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Debounce candidate search term - following the same pattern as candidates-list.tsx
  useEffect(() => {
    if (searchTerm !== debouncedSearchTerm) {
      setIsSearching(true);
    }

    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to first page when searching
      setIsSearching(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, debouncedSearchTerm]);

  // Reset to first page when page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [pageSize]);

  // Helper function to convert decimal to percentage
  const decimalToPercentage = (decimal: number): number => {
    if (decimal > 1) {
      return Math.round(decimal);
    }
    return Math.round(decimal * 100);
  };

  // Helper function to convert percentage to decimal
  const percentageToDecimal = (percentage: number): number => {
    const clampedPercentage = Math.max(0, Math.min(100, percentage));
    return parseFloat((clampedPercentage / 100).toFixed(3));
  };

  // Fetch recommendations preview with pagination and candidate search
  const {
    data: recommendationsData,
    isLoading: recommendationsLoading,
    error: recommendationsError,
    refetch: refetchRecommendations,
  } = useQuery({
    queryKey: [
      'support-job-recommendations-preview',
      job.id,
      currentPage,
      pageSize,
      debouncedSearchTerm.trim(),
    ],
    queryFn: async () => {
      const filters = debouncedSearchTerm.trim()
        ? { candidateSearch: debouncedSearchTerm.trim() }
        : undefined;

      const result =
        await supportJobPostingRecommendationService.getRecommendationsPreview(
          job.id,
          filters,
          { page: currentPage, limit: pageSize }
        );

      // Log the results to debug what's being returned
      logger.info('Recommendations data received', {
        searchType: debouncedSearchTerm.trim()
          ? 'candidate_search'
          : 'ai_recommendations',
        resultCount: result?.items?.length || 0,
        firstResult: result?.items?.[0],
        filters,
      });

      return result;
    },
    enabled: !!job.id && !isSearching,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
  });

  const recommendations = recommendationsData?.items || [];
  const pagination = recommendationsData?.pagination;

  // Get unique integration provider IDs from imported candidates
  const integrationProviderIds = Array.from(
    new Set(
      recommendations
        .filter(
          (rec) =>
            rec.candidate?.isImportedCandidate &&
            rec.candidate?.importedIntegrationId
        )
        .map((rec) => rec.candidate.importedIntegrationId!)
    )
  );

  // Fetch integration provider details for imported candidates
  const { data: integrationProviders } = useQuery({
    queryKey: ['integration-providers', integrationProviderIds],
    queryFn: async () => {
      const providers: Record<string, IntegrationProvider> = {};

      for (const providerId of integrationProviderIds) {
        try {
          const provider =
            await supportClientManagementService.getIntegrationProviderDetails(
              providerId
            );
          providers[providerId] = provider;
        } catch (error) {
          logger.info(error as string);
        }
      }

      return providers;
    },
    enabled: integrationProviderIds.length > 0,
  });

  const handleViewProfile = (
    candidate: ISupportJobRecommendationPreview['candidate']
  ) => {
    router.push(`/app/support/candidates/${candidate.id}?jobId=${job.id}`);
  };

  const handleEditGroundingInfo = (
    recommendation: ISupportJobRecommendationPreview
  ) => {
    setSelectedRecommendation(recommendation);
    setEditedMetadata({
      score: decimalToPercentage(recommendation.score || 0),
      overallGroundingInfo: recommendation.metadata?.overallGroundingInfo || '',
    });
    setShowEditDialog(true);
  };

  const handleSaveGroundingInfo = async () => {
    if (!selectedRecommendation) return;

    setIsSaving(true);
    try {
      await supportJobPostingRecommendationService.storeSelectedRecommendations(
        job.id,
        {
          jobPostingId: job.id,
          selectedCandidateIds: [selectedRecommendation.candidateId],
          recommendations: [
            {
              metadata: {
                semanticScore: percentageToDecimal(editedMetadata.score),
              },
              matchReason: editedMetadata.overallGroundingInfo,
            },
          ],
        }
      );

      toast.success('Recommendation stored successfully');
      setShowEditDialog(false);
      setSelectedRecommendation(null);
      setEditedMetadata({ score: 0, overallGroundingInfo: '' });
      refetchRecommendations();

      // Automatically switch to recommendations tab after successful store
      if (onRecommendationStored) {
        onRecommendationStored();
      }
    } catch (_error) {
      toast.error('Failed to store recommendation');
    } finally {
      setIsSaving(false);
    }
  };

  const getScoreBadge = (score: number) => {
    if (score >= 85) {
      return (
        <Badge
          variant="default"
          className="bg-green-100 text-green-600 hover:bg-green-700"
        >
          Highly Recommended
        </Badge>
      );
    } else if (score >= 60) {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-600">
          Recommended
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-600">
          Low Match
        </Badge>
      );
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  // Candidate search handlers
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    // Page reset is handled in the debounce useEffect
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setIsSearching(false);
    setCurrentPage(1);
  }, []);
  // Check if candidate search is active
  const hasActiveSearch = debouncedSearchTerm.trim();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + K to focus candidate search
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        const searchInput = document.getElementById('candidate-search');
        searchInput?.focus();
      }
      // Escape to clear search
      if (event.key === 'Escape' && hasActiveSearch) {
        handleClearSearch();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [hasActiveSearch, handleClearSearch]);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    if (!pagination) return [];

    const pages = [];
    const maxVisiblePages = 5;
    const totalPages = pagination.totalPages;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, currentPage - 2);
      const end = Math.min(totalPages, start + maxVisiblePages - 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  if (recommendationsLoading) {
    return (
      <div className="animate-fadeIn mt-6 flex min-h-[50vh] w-full flex-col items-center justify-center space-y-6">
        <div className="flex flex-col items-center justify-center gap-4">
          {/* Animated Bot icon */}
          <Loader2 className="text-primary h-12 w-12 animate-spin font-normal" />
          {/* Shimmer loading text */}
          <p className="relative overflow-hidden text-sm text-gray-500 dark:text-gray-400">
            <span className="inline-block animate-pulse">
              Loading recommendations...
            </span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recommendation Preview
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            AI-powered candidate recommendations for this job posting
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => refetchRecommendations()}
          className="space-x-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Search Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              id="candidate-search"
              type="text"
              placeholder="Search candidates by name or email"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pr-10 pl-10"
            />
            <div className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-1">
              {(isSearching || (recommendationsLoading && hasActiveSearch)) && (
                <Loader2 className="text-primary h-4 w-4 animate-spin" />
              )}
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSearch}
                  className="h-7 w-7 rounded-full p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Clear search</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Candidate Search Results Count */}
        {hasActiveSearch && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {!recommendationsLoading && (
              <span>
                {pagination?.total || 0} candidate
                {pagination?.total !== 1 ? 's' : ''} found for{' '}
                {`"${debouncedSearchTerm}"`}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Loading State */}
      {recommendationsLoading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="flex items-start space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {recommendationsError && (
        <div className="flex min-h-[200px] flex-col items-center justify-center text-center">
          <div className="mb-4 rounded-full bg-red-100 p-4 dark:bg-red-900/20">
            <User className="h-12 w-12 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
            Error Loading Recommendations
          </h3>
          <p className="mb-4 max-w-md text-gray-500 dark:text-gray-400">
            Failed to load recommendations. Please try again.
          </p>
          <Button
            onClick={() => refetchRecommendations()}
            size="sm"
            className="space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Retry</span>
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!recommendationsLoading &&
        !recommendationsError &&
        recommendations.length === 0 && (
          <div className="flex min-h-[200px] flex-col items-center justify-center text-center">
            <div className="mb-4 rounded-full bg-blue-100 p-4 dark:bg-blue-900/20">
              {hasActiveSearch ? (
                <Search className="h-12 w-12 text-blue-600 dark:text-blue-400" />
              ) : (
                <User className="h-12 w-12 text-blue-600 dark:text-blue-400" />
              )}
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              {hasActiveSearch
                ? 'No Search Results'
                : 'No Recommendations Available'}
            </h3>
            <p className="mb-4 max-w-md text-gray-500 dark:text-gray-400">
              {hasActiveSearch
                ? `No candidates found in embeddings matching "${debouncedSearchTerm}". The system will fall back to AI recommendations.`
                : 'No candidate recommendations are currently available for this job posting.'}
            </p>

            <div className="flex gap-2">
              {hasActiveSearch && (
                <Button
                  onClick={handleClearSearch}
                  variant="outline"
                  size="sm"
                  className="space-x-2"
                >
                  <X className="h-4 w-4" />
                  <span>Clear Search</span>
                </Button>
              )}
              <Button
                onClick={() => refetchRecommendations()}
                size="sm"
                className="space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh Recommendations</span>
              </Button>
            </div>
          </div>
        )}

      {/* Recommendations List - Matching the exact dialog structure */}
      {!recommendationsLoading && recommendations.length > 0 && (
        <div className="space-y-4">
          {recommendations.map(
            (
              recommendation: ISupportJobRecommendationPreview,
              index: number
            ) => {
              const candidate = recommendation.candidate;
              const semanticScore = decimalToPercentage(
                recommendation.metadata?.semanticScore || 0
              );

              // Get integration provider info for imported candidates
              const integrationProvider =
                candidate?.isImportedCandidate &&
                candidate?.importedIntegrationId
                  ? integrationProviders?.[candidate.importedIntegrationId]
                  : null;

              return (
                <TooltipProvider key={`${recommendation.id}-${index}`}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Card
                        className="bg-card dark:bg-background/30 relative cursor-pointer overflow-hidden border border-l-4 border-gray-200 transition-all hover:shadow-md dark:border-gray-700"
                        style={{
                          borderLeftColor:
                            semanticScore >= 90
                              ? '#10b981'
                              : semanticScore >= 85
                                ? '#3b82f6'
                                : semanticScore >= 80
                                  ? '#f59e0b'
                                  : '#6b7280',
                        }}
                        onClick={() => handleViewProfile(candidate)}
                      >
                        {/* Integration Provider Logo - Top Right Corner */}
                        {integrationProvider && (
                          <div className="absolute top-5 right-3 z-10">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                    {integrationProvider.logoUrl ? (
                                      <img
                                        src={integrationProvider.logoUrl}
                                        alt={integrationProvider.name}
                                        className="h-6 w-6 object-contain"
                                        onError={(e) => {
                                          // Fallback to text if image fails to load
                                          const target =
                                            e.target as HTMLImageElement;
                                          target.style.display = 'none';
                                          target.nextElementSibling?.classList.remove(
                                            'hidden'
                                          );
                                        }}
                                      />
                                    ) : null}
                                    <span
                                      className={`text-xs font-medium text-gray-600 dark:text-gray-400 ${integrationProvider.logoUrl ? 'hidden' : ''}`}
                                    >
                                      {integrationProvider.name
                                        .charAt(0)
                                        .toUpperCase()}
                                    </span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    Imported from {integrationProvider.name}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        )}

                        <div className="p-6">
                          <div className="flex items-start justify-between">
                            {/* Candidate Info */}
                            <div className="flex items-start gap-4">
                              <Avatar className="h-12 w-12 rounded-full border">
                                <AvatarImage
                                  src={candidate.profilePicture || ''}
                                  alt={`${candidate.name || ''}`}
                                />
                                <AvatarFallback>
                                  {candidate.name
                                    ? candidate.name
                                        .split(' ')
                                        .map((n: string) => n[0])
                                        .join('')
                                        .toUpperCase()
                                    : ''}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <h3 className="mb-1 text-base font-semibold text-gray-900 dark:text-gray-50">
                                  {candidate.name}
                                </h3>
                                {/* Email */}
                                {candidate?.email && (
                                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                    {candidate.email}
                                  </p>
                                )}

                                {/* Single row with all candidate info */}
                                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                  {/* Location */}
                                  {candidate.currentLocation && (
                                    <div className="flex items-center gap-1">
                                      <MapPin className="h-4 w-4" />
                                      <span>{candidate.currentLocation}</span>
                                    </div>
                                  )}
                                </div>

                                {/* Skills */}
                                {candidate.skills &&
                                  candidate.skills.length > 0 && (
                                    <div className="mt-4">
                                      <CommonTags
                                        values={candidate.skills}
                                        maxVisible={8}
                                      />
                                    </div>
                                  )}
                              </div>
                            </div>

                            <div className="mr-6 flex items-center gap-3">
                              <div className="text-right">
                                <div className="mb-1">
                                  {getScoreBadge(semanticScore)}
                                </div>
                                <div className="mr-2 text-sm text-gray-500 dark:text-gray-400">
                                  {semanticScore}% Match
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Separator with match reason and action buttons - Exact match to dialog */}
                          <div className="mt-4 border-t pt-4">
                            <div className="flex items-start justify-between">
                              {/* Left side with heading and match reason */}
                              <div className="flex-1">
                                <div className="mb-2 flex items-center gap-2">
                                  {!hasActiveSearch && <AIPoweredLogo />}
                                </div>
                                {/* Overall Grounding Info from metadata */}
                                {recommendation.metadata
                                  ?.overallGroundingInfo && (
                                  <div className="mt-2">
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                      {
                                        recommendation.metadata
                                          .overallGroundingInfo
                                      }
                                    </p>
                                  </div>
                                )}
                              </div>
                              {/* Action buttons on the right */}
                              <div className="flex items-center gap-1.5">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewProfile(candidate);
                                  }}
                                  className="h-8 cursor-pointer px-2.5 text-xs"
                                >
                                  <Eye className="mr-1 h-3 w-3" />
                                  View Profile
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditGroundingInfo(recommendation);
                                  }}
                                  className="h-8 cursor-pointer px-2.5 text-xs"
                                >
                                  <Edit className="mr-1 h-3 w-3" />
                                  Edit & Store
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Click to view candidate profile</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            }
          )}
        </div>
      )}

      {/* Pagination */}
      {!recommendationsLoading && pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col items-center space-y-2 py-4 sm:flex-row sm:justify-between sm:space-y-0">
          <div className="text-muted-foreground text-sm">
            Showing{' '}
            <span className="font-medium">
              {(currentPage - 1) * pageSize + 1}
            </span>{' '}
            to{' '}
            <span className="font-medium">
              {Math.min(currentPage * pageSize, pagination.total)}
            </span>{' '}
            of <span className="font-medium">{pagination.total}</span> results
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => handlePageSizeChange(Number(value))}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={pageSize.toString()} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-muted-foreground ml-2 text-sm">
                per page
              </span>
            </div>

            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous page</span>
              </Button>

              {getPageNumbers().map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="sm"
                  className="h-8 w-8"
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </Button>
              ))}

              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.totalPages}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next page</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Metadata Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Recommendation Metadata</DialogTitle>
            <DialogDescription>
              Update the metadata for {selectedRecommendation?.candidate.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Score Field */}
            <div>
              <Label htmlFor="score">Score (%)</Label>
              <Input
                id="score"
                type="number"
                step="1"
                min="0"
                max="100"
                value={editedMetadata.score === 0 ? '' : editedMetadata.score}
                placeholder="Enter score (0-100)"
                onChange={(e) => {
                  const value = e.target.value;
                  setEditedMetadata((prev) => ({
                    ...prev,
                    score: value === '' ? 0 : parseInt(value) || 0,
                  }));
                }}
              />
            </div>

            {/* Overall Grounding Info */}
            <div>
              <Label htmlFor="overall-grounding-info">
                Overall Grounding Information
              </Label>
              <Textarea
                id="overall-grounding-info"
                placeholder="Enter overall grounding information..."
                value={editedMetadata.overallGroundingInfo}
                onChange={(e) =>
                  setEditedMetadata((prev) => ({
                    ...prev,
                    overallGroundingInfo: e.target.value,
                  }))
                }
                className="min-h-[200px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveGroundingInfo} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Push to recommendations'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

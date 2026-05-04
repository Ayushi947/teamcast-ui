'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  MessageCircleWarning,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  IClientJobPosting,
  ISupportJobRecommendationPreview,
  ISupportStoredJobRecommendation,
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
import { logger } from '@/lib/logger';

interface SupportJobRecommendationsTabProps {
  job: IClientJobPosting;
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

export const SupportJobRecommendationsTab: React.FC<
  SupportJobRecommendationsTabProps
> = ({ job }) => {
  const router = useRouter();
  const [selectedRecommendation, setSelectedRecommendation] =
    useState<ISupportJobRecommendationPreview | null>(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editedMetadata, setEditedMetadata] = useState<MetadataFormData>({
    score: 0,
    overallGroundingInfo: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showStoredRecommendations, setShowStoredRecommendations] =
    useState(true);

  // Helper function to convert decimal to percentage
  const decimalToPercentage = (decimal: number): number => {
    // If the value is already in percentage format (greater than 1), return as is
    if (decimal > 1) {
      return Math.round(decimal);
    }
    // Otherwise convert from decimal to percentage
    return Math.round(decimal * 100);
  };

  // Helper function to convert percentage to decimal
  const percentageToDecimal = (percentage: number): number => {
    // Ensure we're working with a percentage value (0-100)
    const clampedPercentage = Math.max(0, Math.min(100, percentage));
    return parseFloat((clampedPercentage / 100).toFixed(3));
  };

  // Fetch recommendations preview
  const {
    data: recommendationsData,
    isLoading: recommendationsLoading,
    error: recommendationsError,
    refetch: refetchRecommendations,
  } = useQuery({
    queryKey: ['support-job-recommendations-preview', job.id],
    queryFn: async () => {
      const result =
        await supportJobPostingRecommendationService.getRecommendationsPreview(
          job.id,
          undefined,
          { page: 1, limit: 25 }
        );

      return result;
    },
    enabled: !!job.id && showPreviewDialog,
  });

  // Fetch stored recommendations
  const {
    data: storedRecommendationsData,
    isLoading: storedRecommendationsLoading,
    error: storedRecommendationsError,
    refetch: refetchStoredRecommendations,
  } = useQuery({
    queryKey: ['support-job-stored-recommendations', job.id],
    queryFn: async () => {
      const result =
        await supportJobPostingRecommendationService.getStoredRecommendations(
          job.id,
          { page: 1, limit: 25 }
        );
      return result;
    },
    enabled: !!job.id && showStoredRecommendations,
  });

  const recommendations = recommendationsData?.items || [];
  const storedRecommendations = storedRecommendationsData?.items || [];

  // Get unique integration provider IDs from imported candidates in stored recommendations
  const integrationProviderIds = Array.from(
    new Set(
      storedRecommendations
        .filter(
          (rec) =>
            rec.candidate?.isImportedCandidate &&
            rec.candidate?.importedIntegrationId
        )
        .map((rec) => rec.candidate!.importedIntegrationId!)
    )
  );

  // Fetch integration provider details for imported candidates
  const { data: integrationProviders } = useQuery({
    queryKey: ['integration-providers-stored', integrationProviderIds],
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
      // Store the recommendation with updated metadata using the correct API structure
      await supportJobPostingRecommendationService.storeSelectedRecommendations(
        job.id,
        {
          jobPostingId: job.id,
          selectedCandidateIds: [selectedRecommendation.candidateId],
          recommendations: [
            {
              metadata: {
                semanticScore: percentageToDecimal(editedMetadata.score), // Convert score back to decimal
              },
              matchReason: editedMetadata.overallGroundingInfo, // This is the overall grounding info as a string
            },
          ],
        }
      );

      toast.success('Metadata updated successfully');
      setShowEditDialog(false);
      setSelectedRecommendation(null);
      setEditedMetadata({ score: 0, overallGroundingInfo: '' }); // Reset form

      // Close preview dialog and show stored recommendations
      setShowPreviewDialog(false);
      setShowStoredRecommendations(true);
      refetchStoredRecommendations();
    } catch (_error) {
      toast.error('Failed to update metadata');
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          {storedRecommendations.length < 5 && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 p-3 dark:border-orange-800 dark:bg-orange-900/20">
              <MessageCircleWarning className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              <span className="text-sm text-orange-600 dark:text-orange-400">
                Your recommendation count is below the expected threshold.
                Kindly review and take the necessary actions.
              </span>
            </div>
          )}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Job Recommendations
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage AI-powered candidate recommendations for this position
          </p>
        </div>
      </div>

      {/* Stored Recommendations List */}
      {showStoredRecommendations && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="text-md font-medium text-gray-900 dark:text-white">
                Stored Recommendations ({storedRecommendations.length})
              </h4>
            </div>
            <Button
              variant="outline"
              onClick={() => refetchStoredRecommendations()}
              size="sm"
              className="space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
          </div>

          {storedRecommendationsLoading && (
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

          {storedRecommendationsError && (
            <div className="flex min-h-[200px] flex-col items-center justify-center text-center">
              <div className="mb-4 rounded-full bg-red-100 p-4 dark:bg-red-900/20">
                <User className="h-12 w-12 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                Error Loading Stored Recommendations
              </h3>
              <p className="mb-4 max-w-md text-gray-500 dark:text-gray-400">
                Failed to load stored recommendations. Please try again.
              </p>
              <Button
                onClick={() => refetchStoredRecommendations()}
                size="sm"
                className="space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Retry</span>
              </Button>
            </div>
          )}

          {!storedRecommendationsLoading &&
            !storedRecommendationsError &&
            storedRecommendations.length === 0 && (
              <div className="flex min-h-[200px] flex-col items-center justify-center text-center">
                <div className="mb-4 rounded-full bg-blue-100 p-4 dark:bg-blue-900/20">
                  <User className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                  No Stored Recommendations
                </h3>
                <p className="mb-4 max-w-md text-gray-500 dark:text-gray-400">
                  No recommendations have been stored for this job yet. View and
                  select recommendations to get started.
                </p>
              </div>
            )}

          {/* Render stored recommendations */}
          {!storedRecommendationsLoading &&
            storedRecommendations.length > 0 && (
              <div className="space-y-4">
                {storedRecommendations.map(
                  (
                    recommendation: ISupportStoredJobRecommendation,
                    index: number
                  ) => {
                    const candidate = recommendation.candidate;
                    const score = decimalToPercentage(
                      recommendation.score || 0
                    );

                    // Get integration provider info for imported candidates
                    const integrationProvider =
                      candidate?.isImportedCandidate &&
                      candidate?.importedIntegrationId
                        ? integrationProviders?.[
                            candidate.importedIntegrationId
                          ]
                        : null;

                    return (
                      <Card
                        key={`${recommendation.id}-${index}`}
                        className="bg-card dark:bg-background/30 relative cursor-pointer overflow-hidden border border-l-4 border-gray-200 transition-all hover:shadow-md dark:border-gray-700"
                        style={{
                          borderLeftColor:
                            score >= 90
                              ? '#10b981'
                              : score >= 85
                                ? '#3b82f6'
                                : score >= 80
                                  ? '#f59e0b'
                                  : '#6b7280',
                        }}
                        onClick={() => {
                          if (candidate) {
                            handleViewProfile(candidate);
                          }
                        }}
                      >
                        {/* Integration Provider Logo - Top Right Corner */}
                        {integrationProvider && (
                          <div className="absolute top-5 right-3 z-10">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div>
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
                                  src={candidate?.profilePicture || ''}
                                  alt={`${candidate?.name || ''}`}
                                />
                                <AvatarFallback>
                                  {candidate?.name
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
                                  {candidate?.name}
                                </h3>

                                {candidate?.email && (
                                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                    {candidate.email}
                                  </p>
                                )}

                                {/* Single row with all candidate info */}
                                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                  {/* Location */}
                                  {candidate?.currentLocation && (
                                    <div className="flex items-center gap-1">
                                      <MapPin className="h-4 w-4" />
                                      <span>{candidate.currentLocation}</span>
                                    </div>
                                  )}
                                </div>

                                {/* Skills */}
                                {candidate?.skills &&
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
                                  {getScoreBadge(score)}
                                </div>
                                <div className="mr-2 text-sm text-gray-500 dark:text-gray-400">
                                  {score}% Match
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Match Reason */}
                          <div className="mt-4 border-t pt-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="mb-2 flex items-center gap-2">
                                  <h4 className="text-sm font-normal whitespace-nowrap text-gray-500 dark:text-white">
                                    Match Reason
                                  </h4>
                                </div>
                                {recommendation.matchReason &&
                                  recommendation.matchReason.length > 0 && (
                                    <div className="mt-2">
                                      <p className="text-xs text-gray-600 dark:text-gray-400">
                                        {recommendation.matchReason.join(', ')}
                                      </p>
                                    </div>
                                  )}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (candidate) {
                                      handleViewProfile(candidate);
                                    }
                                  }}
                                  className="h-8 cursor-pointer px-2.5 text-xs"
                                >
                                  <Eye className="mr-1 h-3 w-3" />
                                  View Profile
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  }
                )}
              </div>
            )}
        </div>
      )}

      {/* Preview Recommendations Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-h-[80vh] max-w-6xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>AI-Powered Recommendations Preview</DialogTitle>
            <DialogDescription>
              Review and select recommendations before storing them
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
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

            {!recommendationsLoading &&
              !recommendationsError &&
              recommendations.length === 0 && (
                <div className="flex min-h-[200px] flex-col items-center justify-center text-center">
                  <div className="mb-4 rounded-full bg-blue-100 p-4 dark:bg-blue-900/20">
                    <User className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                    No Recommendations Available
                  </h3>
                  <p className="mb-4 max-w-md text-gray-500 dark:text-gray-400">
                    No candidate recommendations are currently available for
                    this job posting.
                  </p>
                  <Button
                    onClick={() => refetchRecommendations()}
                    size="sm"
                    className="space-x-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Refresh Recommendations</span>
                  </Button>
                </div>
              )}

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

                    return (
                      <TooltipProvider key={`${recommendation.id}-${index}`}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Card
                              className="bg-card dark:bg-background/30 cursor-pointer overflow-hidden border border-l-4 border-gray-200 transition-all hover:shadow-md dark:border-gray-700"
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
                                            <span>
                                              {candidate.currentLocation}
                                            </span>
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

                                  <div className="flex items-center gap-3">
                                    <div className="text-right">
                                      <div className="mb-1">
                                        {getScoreBadge(semanticScore)}
                                      </div>
                                      <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {semanticScore}% Match
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Separator with match reason and action buttons */}
                                <div className="mt-4 border-t pt-4">
                                  <div className="flex items-start justify-between">
                                    {/* Left side with heading and match reason */}
                                    <div className="flex-1">
                                      <div className="mb-2 flex items-center gap-2">
                                        <h4 className="text-sm font-normal whitespace-nowrap text-gray-500 dark:text-white">
                                          Recommendation
                                        </h4>
                                        <AIPoweredLogo />
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
                                          handleEditGroundingInfo(
                                            recommendation
                                          );
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
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPreviewDialog(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

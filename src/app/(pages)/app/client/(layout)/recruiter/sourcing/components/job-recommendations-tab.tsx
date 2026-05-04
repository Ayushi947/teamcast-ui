'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApp } from '@/lib/context/app-context';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  MapPin,
  Briefcase,
  Send,
  BookmarkPlus,
  RefreshCw,
  CheckCircle,
  User,
  ThumbsDown,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  ActivityEntityTypeEnum,
  ActivityModuleEnum,
  IClientCandidateShortlist,
  IClientJobPosting,
  JobRecommendationFeedbackTypeEnum,
  IJobPostingRecommendation,
} from '@/lib/shared';
import { CandidateProfileModal } from './candidate-profile-modal';
import { ResumeViewDialog } from './resume-view-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  activityLogService,
  clientCandidateShortlistService,
  clientJobPostingRecommendationApiService,
  clientJobPostingService,
  clientResumeViewService,
  clientSubscriptionService,
  subscriptionLimitsService,
} from '@/lib/services/services';
import { ActivityActionEnums, ActivityTitleEnum } from '@/lib/models/activity';
import { useRouter } from 'next/navigation';
import { CommonTags } from '@/components/ui/common-tags';
import {
  RecommendationsEmptyState,
  LoadingState,
} from './enhanced-empty-states';
import AIPoweredLogo from '@/components/app/common/animations/ai-powered-logo';

interface JobRecommendationsTabProps {
  recommendations: IJobPostingRecommendation[];
  onViewProfile: (candidate: IJobPostingRecommendation['candidate']) => void;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
  isLoading?: boolean;
  job: IClientJobPosting;
  groundingInfo?: string;
  shortlistedCandidates?: IClientCandidateShortlist[];
  canViewRecommendations?: boolean;
}

type CandidateWithCandidateId = IJobPostingRecommendation['candidate'] & {
  candidateId: string;
  resume?: any; // Use any for flexibility with different resume data structures
};

export const JobRecommendationsTab: React.FC<JobRecommendationsTabProps> = ({
  recommendations,
  onScroll,
  onLoadMore,
  isLoadingMore = false,
  isLoading = false,
  job,
  shortlistedCandidates,
  canViewRecommendations,
}) => {
  const queryClient = useQueryClient();
  const { user } = useApp();
  const router = useRouter();
  const [selectedCandidate, setSelectedCandidate] =
    useState<CandidateWithCandidateId | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [feedbackType, setFeedbackType] = useState<
    JobRecommendationFeedbackTypeEnum | ''
  >('');
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackRecommendation, setFeedbackRecommendation] =
    useState<IJobPostingRecommendation | null>(null);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  // Resume view dialog state
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [resumeViewUrl, setResumeViewUrl] = useState<string | null>(null);
  const [resumeCandidate, setResumeCandidate] = useState<
    IJobPostingRecommendation['candidate'] | null
  >(null);

  // Loading states for individual actions
  const [shortlistingCandidates, setShortlistingCandidates] = useState<
    Set<string>
  >(new Set());
  const [invitingCandidates, setInvitingCandidates] = useState<Set<string>>(
    new Set()
  );
  const [viewingResumeCandidates, setViewingResumeCandidates] = useState<
    Set<string>
  >(new Set());

  // Utility to truncate description to 20-30 words
  function truncateWords(text: string, wordLimit: number = 25): string {
    if (!text) return '';
    const words = text.split(/\s+/);
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(' ') + '...';
  }

  const { data: usageSummary } = useQuery({
    queryKey: ['usage-summary'],
    queryFn: () => subscriptionLimitsService.getUsageSummary(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Log candidate view mutation
  const logCandidateViewMutation = useMutation({
    mutationFn: (data: { candidateId: string; jobPostingId: string }) =>
      clientSubscriptionService.logCandidateView(
        data.candidateId,
        data.jobPostingId
      ),
  });

  // Show loader while initial loading
  if (isLoading || (isLoadingMore && recommendations.length === 0)) {
    return <LoadingState message="Finding the best candidates..." />;
  }

  // Show empty state when candidate visibility pack is expired
  if (canViewRecommendations === false) {
    return (
      <RecommendationsEmptyState
        variant="visibility-expired"
        onAction={() => router.push('/app/client/subscription')}
        actionLabel="Upgrade Plan"
        isLoading={false}
      />
    );
  }

  // Show empty state when no recommendations
  if (!isLoading && !isLoadingMore && recommendations.length === 0) {
    return (
      <RecommendationsEmptyState
        variant="no-recommendations"
        onAction={onLoadMore}
        actionLabel="Refresh Recommendations"
        isLoading={isLoadingMore}
      />
    );
  }

  // Update filteredRecommendations mapping to ensure candidateId is present for modal
  const filteredRecommendations = recommendations.map((rec) => ({
    id: rec.candidate?.id || rec.candidateId || rec.id,
    candidate: rec.candidate
      ? {
          ...rec.candidate,
          candidateId: rec.candidate.id,
        }
      : undefined,
    matchReason: rec.matchReason,
    confidence: rec.score,
    isInvited: rec.isInvited,
    isSaved: rec.isSaved,
    isViewed: rec.isViewed,
    score: rec.score * 100,
    resume: rec.resume,
  }));

  const handleViewProfile = (
    candidate: IJobPostingRecommendation['candidate']
  ) => {
    if (candidate) {
      // Log the candidate view
      logCandidateViewMutation.mutate({
        candidateId: candidate.id as string,
        jobPostingId: job.id as string,
      });

      const candidateId = candidate.id;
      router.push(`/app/client/candidates/${candidateId}`);
    }
  };

  const handleShortlist = async (
    candidate: IJobPostingRecommendation['candidate']
  ) => {
    if (!candidate) return;

    const candidateId = candidate.id;
    setShortlistingCandidates((prev) => new Set(prev).add(candidateId));

    try {
      const result =
        await clientCandidateShortlistService.createCandidateShortlist({
          candidateId: candidate.id,
          jobPostingId: job.id,
        });

      if (result) {
        toast.success(`${candidate.name} added to shortlist!`);
        // Invalidate queries to refresh the data
        queryClient.invalidateQueries({
          queryKey: ['job-recommendations', job.id],
        });
        queryClient.invalidateQueries({
          queryKey: ['shortlisted-candidates', job.id],
        });
        queryClient.invalidateQueries({
          queryKey: ['client-candidate-shortlists'],
        });
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to shortlist candidate'
      );
    } finally {
      setShortlistingCandidates((prev) => {
        const newSet = new Set(prev);
        newSet.delete(candidateId);
        return newSet;
      });
    }
  };

  const handleSendInvite = async (
    candidate: IJobPostingRecommendation['candidate']
  ) => {
    if (!candidate) return;

    const candidateId = candidate.id;
    setInvitingCandidates((prev) => new Set(prev).add(candidateId));

    try {
      const response = await clientJobPostingService.inviteCandidate(job.id, {
        candidateId: candidate.id,
        message: 'Interview Invitation',
        coverLetterUrl: 'Interview Invitation',
      });
      if (response) {
        toast.success(`Invitation sent to ${candidate.name}!`);
        queryClient.invalidateQueries({
          queryKey: ['job-recommendations', job.id],
        });
        queryClient.invalidateQueries({
          queryKey: ['job-applications', job.id],
        });
        await activityLogService.createActivityLog({
          entityType: ActivityEntityTypeEnum.CLIENT,
          entityId: job.clientId,
          module: ActivityModuleEnum.CLIENT,
          action: ActivityActionEnums.INVITE_CANDIDATE,
          description: `Invitation sent to ${candidate.name}`,
          metadata: {
            userName: user?.name,
            jobTitle: job.title,
            title: ActivityTitleEnum.INVITE_CANDIDATE,
            candidateId: candidate.id,
            candidateName: candidate.name,
            candidateEmail: candidate.email,
            // No phone or social fields in new model
          },
        });
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to send invitation'
      );
    } finally {
      setInvitingCandidates((prev) => {
        const newSet = new Set(prev);
        newSet.delete(candidateId);
        return newSet;
      });
    }
  };

  const handleViewResume = async (
    candidate: IJobPostingRecommendation['candidate']
  ) => {
    if (!candidate) return;

    const candidateId = candidate.id;
    setViewingResumeCandidates((prev) => new Set(prev).add(candidateId));

    try {
      const response = await clientResumeViewService.viewResume(candidate.id);

      const viewUrl = response?.result?.viewUrl;

      if (viewUrl) {
        // Set the resume data and open dialog
        setResumeViewUrl(viewUrl);
        setResumeCandidate(candidate);
        setShowResumeDialog(true);
        toast.success(`Opening ${candidate.name}'s resume`);
      } else {
        toast.error('Resume not available - no view URL found');
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to view resume'
      );
    } finally {
      setViewingResumeCandidates((prev) => {
        const newSet = new Set(prev);
        newSet.delete(candidateId);
        return newSet;
      });
    }
  };

  const handleNotInterested = (
    candidate: IJobPostingRecommendation['candidate']
  ) => {
    if (!candidate) return;

    // Find the full recommendation object for this candidate
    const recommendation = recommendations.find(
      (rec) => rec.candidate?.id === candidate.id
    );

    if (!recommendation) return;

    setFeedbackRecommendation(recommendation);
    setFeedbackType('');
    setFeedbackComment('');
    setShowFeedbackDialog(true);
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackRecommendation || !feedbackType) {
      toast.error('Please select a feedback type');
      return;
    }

    setIsSubmittingFeedback(true);

    try {
      await clientJobPostingRecommendationApiService.rejectJobPostingRecommendation(
        job.id,
        feedbackRecommendation.id as string,
        {
          feedbackType: feedbackType as JobRecommendationFeedbackTypeEnum,
          comment: feedbackComment,
          reason: feedbackComment,
          isHelpful: false,
        } as any
      );

      toast.success('Feedback submitted successfully', {
        description: `Thank you for your feedback on ${feedbackRecommendation.candidate?.name}`,
      });

      // Close dialog and reset state
      setShowFeedbackDialog(false);
      setFeedbackRecommendation(null);
      setFeedbackType('');
      setFeedbackComment('');

      // Refresh recommendations
      queryClient.invalidateQueries({
        queryKey: ['job-recommendations', job.id],
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to submit feedback'
      );
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  return (
    <>
      <div className="space-y-6" onScroll={onScroll}>
        {/* AI Insights with Grounding Information */}

        {/* Recommendations List */}
        <div className="space-y-4">
          {filteredRecommendations.map((rec, index) => {
            const isShortlisting = shortlistingCandidates.has(
              rec.candidate?.id || ''
            );
            const isInviting = invitingCandidates.has(rec.candidate?.id || '');
            const isViewingResume = viewingResumeCandidates.has(
              rec.candidate?.id || ''
            );
            const isShortlisted = !!shortlistedCandidates?.find(
              (s) => s.candidateId === rec.candidate?.id
            );

            return (
              <TooltipProvider key={`${rec.id}-${index}`}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Card
                      className={`bg-card dark:bg-background/30 overflow-hidden border border-l-4 border-gray-200 transition-all hover:shadow-md dark:border-gray-700 ${usageSummary?.candidateViews?.canView ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                      style={{
                        borderLeftColor:
                          Math.round(rec.score || 0) >= 90
                            ? '#10b981'
                            : Math.round(rec.score || 0) >= 85
                              ? '#3b82f6'
                              : Math.round(rec.score || 0) >= 80
                                ? '#f59e0b'
                                : '#6b7280',
                      }}
                      onClick={(e) => {
                        // Only handle click if not clicking on a button
                        if (!(e.target as HTMLElement).closest('button')) {
                          // Check if user has view permissions before navigating
                          if (usageSummary?.candidateViews?.canView) {
                            handleViewProfile(rec.candidate);
                          } else {
                            toast.error(
                              `Candidate view limit reached (${usageSummary?.candidateViews?.used}/${usageSummary?.candidateViews?.limit})`
                            );
                          }
                        }
                      }}
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between">
                          {/* Candidate Info */}
                          <div className="flex items-start gap-4">
                            <Avatar className="h-12 w-12 rounded-full border">
                              <AvatarImage
                                src={rec.candidate?.profilePicture || ''}
                                alt={`${rec.candidate?.name || ''}`}
                              />
                              <AvatarFallback>
                                {rec.candidate?.name
                                  ? rec.candidate.name
                                      .split(' ')
                                      .map((n) => n[0])
                                      .join('')
                                      .toUpperCase()
                                  : ''}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h3 className="mb-1 text-base font-semibold text-gray-900 dark:text-gray-50">
                                {rec.candidate?.name}
                              </h3>

                              {/* Single row with all candidate info */}
                              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                {/* Job Title */}
                                {rec.resume?.currentJobTitle && (
                                  <div className="flex items-center gap-1">
                                    <User className="h-4 w-4" />
                                    <span>{rec.resume.currentJobTitle}</span>
                                  </div>
                                )}

                                {/* Experience */}
                                {(rec.candidate?.experience ||
                                  rec.resume?.totalExperience) && (
                                  <div className="flex items-center gap-1">
                                    <Briefcase className="h-4 w-4" />
                                    <span>
                                      {rec.candidate?.experience ||
                                        rec.resume?.totalExperience}{' '}
                                      yrs
                                    </span>
                                  </div>
                                )}

                                {/* Location */}
                                {(rec.candidate?.currentLocation ||
                                  rec.resume?.currentWorkLocation ||
                                  rec.resume?.location) && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    <span>
                                      {rec.candidate?.currentLocation ||
                                        rec.resume?.currentWorkLocation ||
                                        rec.resume?.location}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Summary */}
                              {rec.resume?.summary && (
                                <p className="mt-4 max-w-3xl text-sm text-gray-500 dark:text-gray-400">
                                  {truncateWords(rec.resume.summary, 30)}
                                </p>
                              )}

                              {/* Skills */}
                              {(
                                rec?.candidate?.skills ||
                                rec?.resume?.resumeSkills ||
                                []
                              ).length > 0 && (
                                <div className="mt-4">
                                  <CommonTags
                                    values={
                                      rec.candidate?.skills ||
                                      rec.resume?.resumeSkills ||
                                      []
                                    }
                                    maxVisible={8}
                                  />
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className="mb-1">
                                {(() => {
                                  const score = rec?.score || 0;
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
                                      <Badge
                                        variant="secondary"
                                        className="bg-green-100 text-green-600"
                                      >
                                        Recommended
                                      </Badge>
                                    );
                                  }
                                })()}
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
                              {/* Match Reason below the heading */}
                              {rec.matchReason &&
                                rec.matchReason.length > 0 && (
                                  <p className="text-primary dark:text-primary text-xs font-medium">
                                    {rec.matchReason[0]}
                                  </p>
                                )}
                            </div>
                            {/* Action buttons on the right */}
                            <div className="flex items-center gap-1.5">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewResume(rec.candidate)}
                                disabled={isViewingResume}
                                className="h-8 cursor-pointer px-2.5 text-xs"
                              >
                                {isViewingResume ? (
                                  <>
                                    <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                                    Loading...
                                  </>
                                ) : (
                                  <>
                                    <FileText className="mr-1 h-3 w-3" />
                                    View Resume
                                  </>
                                )}
                              </Button>
                              <Button
                                disabled={isShortlisted || isShortlisting}
                                variant="outline"
                                size="sm"
                                onClick={() => handleShortlist(rec.candidate)}
                                className="h-8 cursor-pointer px-2.5 text-xs"
                              >
                                {isShortlisting ? (
                                  <>
                                    <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                                    Adding...
                                  </>
                                ) : isShortlisted ? (
                                  <>
                                    <CheckCircle className="mr-1 h-3 w-3" />
                                    Shortlisted
                                  </>
                                ) : (
                                  <>
                                    <BookmarkPlus className="mr-1 h-3 w-3" />
                                    Shortlist
                                  </>
                                )}
                              </Button>
                              <Button
                                variant={
                                  rec.isInvited ? 'secondary' : 'default'
                                }
                                size="sm"
                                onClick={() => handleSendInvite(rec.candidate)}
                                disabled={rec.isInvited || isInviting}
                                className="h-8 cursor-pointer px-2.5 text-xs"
                              >
                                {isInviting ? (
                                  <>
                                    <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                                    Sending...
                                  </>
                                ) : rec.isInvited ? (
                                  <>
                                    <CheckCircle className="mr-1 h-3 w-3" />
                                    Invited
                                  </>
                                ) : (
                                  <>
                                    <Send className="mr-1 h-3 w-3" />
                                    Send Invite
                                  </>
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleNotInterested(rec.candidate)
                                }
                                className="border-primary/20 text-primary hover:bg-primary/10 hover:text-primary dark:border-primary/30 dark:text-primary dark:hover:bg-primary/20 h-8 cursor-pointer px-2.5 text-xs"
                              >
                                <ThumbsDown className="mr-1 h-3 w-3" />
                                Not Interested
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </TooltipTrigger>
                  {!usageSummary?.candidateViews?.canView && (
                    <TooltipContent>
                      <p>
                        Candidate view limit reached (
                        {usageSummary?.candidateViews?.used}/
                        {usageSummary?.candidateViews?.limit})
                      </p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            );
          })}

          {/* Loading indicator in the middle of the list */}
          {isLoadingMore && recommendations.length > 0 && (
            <div className="flex items-center justify-center py-4">
              <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
                <RefreshCw className="h-5 w-5 animate-spin text-[#6e55cf]" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Loading more candidates...
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Candidate Profile Modal */}
      {selectedCandidate && (
        <CandidateProfileModal
          candidate={selectedCandidate}
          job={job}
          isOpen={showProfileModal}
          onClose={() => {
            setShowProfileModal(false);
            setSelectedCandidate(null);
          }}
          onShortlist={() => handleShortlist(selectedCandidate)}
          isInvited={
            recommendations.find(
              (r) => r.candidate?.id === selectedCandidate.id
            )?.isInvited || false
          }
        />
      )}

      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ThumbsDown className="text-primary h-5 w-5" />
              Not Interested Feedback
            </DialogTitle>
            <DialogDescription>
              {feedbackRecommendation?.candidate && (
                <span>
                  Please tell us why you&apos;re not interested in{' '}
                  <strong>{feedbackRecommendation.candidate.name}</strong>. This
                  helps us improve our recommendations.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="feedback-type">Reason</Label>
              <Select
                value={feedbackType}
                onValueChange={(value) =>
                  setFeedbackType(value as JobRecommendationFeedbackTypeEnum)
                }
              >
                <SelectTrigger id="feedback-type">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value={JobRecommendationFeedbackTypeEnum.NOT_INTERESTED}
                  >
                    Not Interested
                  </SelectItem>
                  <SelectItem
                    value={JobRecommendationFeedbackTypeEnum.ALREADY_INVITED}
                  >
                    Already Invited
                  </SelectItem>
                  <SelectItem
                    value={JobRecommendationFeedbackTypeEnum.NOT_RELEVANT}
                  >
                    Not Relevant
                  </SelectItem>
                  <SelectItem
                    value={JobRecommendationFeedbackTypeEnum.TOO_JUNIOR}
                  >
                    Too Junior
                  </SelectItem>
                  <SelectItem
                    value={JobRecommendationFeedbackTypeEnum.TOO_SENIOR}
                  >
                    Too Senior
                  </SelectItem>
                  <SelectItem
                    value={JobRecommendationFeedbackTypeEnum.LOCATION_MISMATCH}
                  >
                    Location Mismatch
                  </SelectItem>
                  <SelectItem
                    value={JobRecommendationFeedbackTypeEnum.SALARY_MISMATCH}
                  >
                    Salary Mismatch
                  </SelectItem>
                  <SelectItem
                    value={JobRecommendationFeedbackTypeEnum.SKILL_MISMATCH}
                  >
                    Skill Mismatch
                  </SelectItem>
                  <SelectItem value={JobRecommendationFeedbackTypeEnum.OTHER}>
                    Other
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback-comment">Additional Comments</Label>
              <Textarea
                id="feedback-comment"
                placeholder="Add any additional feedback or comments here..."
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              disabled={isSubmittingFeedback}
              onClick={() => {
                setShowFeedbackDialog(false);
                setFeedbackRecommendation(null);
                setFeedbackType('');
                setFeedbackComment('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitFeedback}
              disabled={
                !feedbackRecommendation || !feedbackType || isSubmittingFeedback
              }
              className="bg-primary hover:bg-primary/90 text-white"
            >
              {isSubmittingFeedback ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Feedback'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resume View Dialog */}
      <ResumeViewDialog
        isOpen={showResumeDialog}
        onClose={() => {
          setShowResumeDialog(false);
          setResumeViewUrl(null);
          setResumeCandidate(null);
        }}
        candidate={resumeCandidate}
        viewUrl={resumeViewUrl}
        isLoading={viewingResumeCandidates.size > 0}
      />
    </>
  );
};

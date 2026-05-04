import { getInitials } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import { ISearchResult } from '@/lib/shared';
import { motion } from 'framer-motion';
import { GraduationCap, UsersIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useApp } from '@/lib/context/app-context';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { shortlistService } from '@/lib/models/shortlist';
import { clientCandidateShortlistService } from '@/lib/services/services';
import { IClientCandidateShortlistCreate } from '@/lib/shared/models/domain/client/candidate.shortlist.domain';
import { CandidateShortlistStatusEnum } from '@/lib/shared/models/common/enums';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface CandidateCardProps {
  candidateId: string;
  candidate: ISearchResult;
  viewMode?: 'grid' | 'list';
  isSelected?: boolean;
  toggleSelection: (id: string) => void;
  showMatchDetails: string | null;
  toggleMatchDetails: (id: string) => void;
}

export const CandidateCard = ({
  candidateId,
  candidate,
  viewMode = 'grid',
}: CandidateCardProps) => {
  const [showAllSkills, setShowAllSkills] = useState(false);
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [isShortlisting, setIsShortlisting] = useState(false);

  // Authentication
  const { user } = useApp();

  // API service for backend shortlisting (use imported service)
  const queryClient = useQueryClient();

  // Fetch current shortlist status from backend for authenticated users
  const { data: shortlistData, isLoading: loadingShortlistStatus } = useQuery({
    queryKey: ['candidate-shortlist-status', candidateId],

    queryFn: async () => {
      try {
        // Filter by candidateId to get only shortlists for this specific candidate
        const response =
          await clientCandidateShortlistService.listCandidateShortlists({
            page: 1,
            limit: 1, // We only need to know if it exists
            candidateId: candidateId, // Filter by specific candidate
          });

        // Handle different possible response structures
        if (response && typeof response === 'object') {
          // If response has a 'data' property (IClientCandidateShortlistListData structure)
          if ('data' in response && Array.isArray(response.data)) {
            return response.data.length > 0 ? response.data[0] : null;
          }
          // If response is directly an array (extracted by ApiService)
          else if (Array.isArray(response)) {
            return response.length > 0 ? response[0] : null;
          }
        }

        return null;
      } catch (error) {
        logger.error('Error fetching shortlist status:', error);
        return null;
      }
    },
    enabled: !!user, // Only fetch if user is authenticated
  });

  // Check shortlist status on mount and when candidate changes
  useEffect(() => {
    if (user) {
      // Handle different data structures
      let isCurrentlyShortlisted = false;

      if (shortlistData) {
        // If shortlistData is a single object with status
        if ('status' in shortlistData) {
          isCurrentlyShortlisted =
            shortlistData.status === CandidateShortlistStatusEnum.SHORTLISTED;
        }
        // If shortlistData is an array, check the first item
        else if (Array.isArray(shortlistData) && shortlistData.length > 0) {
          isCurrentlyShortlisted =
            shortlistData[0].status ===
            CandidateShortlistStatusEnum.SHORTLISTED;
        }
      }

      setIsShortlisted(isCurrentlyShortlisted);
    } else {
      // For non-authenticated users, use local storage
      const shortlisted = shortlistService.isShortlisted(candidateId);
      setIsShortlisted(shortlisted);
    }
  }, [candidateId, user, shortlistData]);

  const skills = candidate.metadata?.skills || [];
  const displayedSkills = showAllSkills ? skills : skills.slice(0, 3);
  const hasMoreSkills = skills.length > 3;

  const handleShortlist = async (e: React.MouseEvent) => {
    e.stopPropagation();

    // Check if user is authenticated
    if (!user) {
      toast.error('Please log in to shortlist candidates');
      return;
    }

    setIsShortlisting(true);
    try {
      if (isShortlisted && shortlistData) {
        // Get the shortlist ID based on data structure
        let shortlistId: string;

        if ('id' in shortlistData) {
          shortlistId = shortlistData.id;
        } else if (Array.isArray(shortlistData) && shortlistData.length > 0) {
          shortlistId = shortlistData[0].id;
        } else {
          throw new Error('Cannot find shortlist ID to delete');
        }

        // Remove from shortlist using backend API
        logger.info('Removing candidate from shortlist using backend API', {
          shortlistId,
          candidateId,
        });

        await clientCandidateShortlistService.deleteCandidateShortlist(
          shortlistId
        );

        toast.success(`${candidate.name} removed from shortlist!`);
        setIsShortlisted(false);

        // Invalidate queries to refresh data
        queryClient.invalidateQueries({
          queryKey: ['candidate-shortlist-status', candidateId],
        });
        queryClient.invalidateQueries({
          queryKey: ['client-candidate-shortlists'],
        });
        queryClient.invalidateQueries({
          queryKey: ['shortlisted-candidates'],
        });
      } else {
        // Add to shortlist using backend API with correct payload
        const shortlistPayload: IClientCandidateShortlistCreate = {
          candidateId: candidateId,
          notes: `Shortlisted from search results: ${candidate.name}`,
          tags: ['search-result', 'independent-shortlist'],
        };

        logger.info('Adding candidate to shortlist using backend API', {
          candidateId,
          payload: shortlistPayload,
        });

        const result =
          await clientCandidateShortlistService.createCandidateShortlist(
            shortlistPayload
          );

        if (result) {
          toast.success(`${candidate.name} added to shortlist!`);
          setIsShortlisted(true);

          // Invalidate queries to refresh data
          queryClient.invalidateQueries({
            queryKey: ['candidate-shortlist-status', candidateId],
          });
          queryClient.invalidateQueries({
            queryKey: ['client-candidate-shortlists'],
          });
          queryClient.invalidateQueries({
            queryKey: ['shortlisted-candidates'],
          });
        }
      }
    } catch (error) {
      logger.error('Error with shortlist operation:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update shortlist';
      toast.error(errorMessage);
    } finally {
      setIsShortlisting(false);
    }
  };

  const handleViewProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Navigate to the public candidate profile page
    window.open(`/candidate/profile/${candidateId}`, '_blank');
  };

  const toggleSkills = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowAllSkills(!showAllSkills);
  };

  // Grid view component
  if (viewMode === 'grid') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="group border-border bg-card relative cursor-pointer overflow-hidden rounded-xl border transition-all duration-200 hover:shadow-lg"
      >
        {/* Card Content */}
        <div className="p-5 pt-8">
          {/* Header with avatar and basic info */}
          <div className="mb-3 flex items-center gap-3">
            <Avatar className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#F5F5FF] dark:border-indigo-900/40 dark:bg-indigo-900/20">
              <AvatarImage
                src={candidate.image || ''}
                alt={candidate.name || ''}
              />
              <AvatarFallback className="text-primary text-lg font-medium dark:text-indigo-400">
                {getInitials(candidate.name || '')}
              </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col justify-center gap-y-1">
              <h3 className="text-foreground text-xl font-semibold">
                {candidate.name || 'Unnamed Candidate'}
              </h3>
              <p className="text-muted-foreground text-sm">
                {candidate.jobTitle || 'No Title'}
              </p>
            </div>
          </div>

          <div className="flex gap-x-4">
            <div className="mb-1">
              <p className="text-muted-foreground flex items-center gap-x-2 text-base">
                <UsersIcon className="h-4 w-4" />
                <span className="font-medium">
                  {candidate.metadata?.experience || 'N/A'} years
                </span>
              </p>
            </div>

            {/* Location and education */}
            <div className="text-muted-foreground mb-2 flex items-center gap-5 text-sm">
              <div className="flex items-center gap-3">
                <GraduationCap className="h-5 w-5" />
                <span className="text-base">
                  {candidate.metadata?.education
                    ? candidate.metadata.education
                        .toLowerCase()
                        .replace(/_/g, ' ')
                        .replace(/\b\w/g, (char: string) => char.toUpperCase())
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Candidate description */}
          <p className="mt-3 line-clamp-2 h-16 text-base text-gray-900 dark:text-white">
            {candidate.description ||
              'No introduction available No introduction available No introduction available'}
          </p>

          <div className="mb-4">
            <p className="text-foreground mb-2 text-base">
              Preferred Locations
            </p>
            <div className="mb-3 flex flex-wrap gap-2">
              {candidate.metadata?.locations
                ?.slice(0, 3)
                .map((location: string, index: number) => (
                  <div
                    key={index}
                    className="dark:bg-primary/10 rounded-md border border-gray-200 bg-white px-2 py-1 text-sm text-gray-600 dark:border-gray-700 dark:text-white"
                  >
                    {location}
                  </div>
                ))}
              {candidate.metadata?.locations?.length > 3 && (
                <div className="rounded-md border border-gray-200 bg-white px-2 py-1 text-sm">
                  +{candidate.metadata.locations.length - 3}
                </div>
              )}
            </div>
          </div>

          {/* Key Skills */}
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-foreground text-base">Key Skills</p>
              {hasMoreSkills && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSkills}
                  className="h-auto p-1 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                >
                  {showAllSkills ? 'Show Less' : `+${skills.length - 3} more`}
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {displayedSkills.map((skill: string, index: number) => (
                <div
                  key={index}
                  className="dark:bg-primary/10 rounded-md border border-gray-200 bg-white px-2 py-1 text-sm text-gray-600 dark:border-gray-700 dark:text-white"
                >
                  {skill}
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-10 flex items-center gap-2">
            {!user ? (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  toast.info('Please log in to shortlist candidates');
                  // Redirect to login page
                  window.location.href = '/app/auth/login?user_type=client';
                }}
                className="bg-primary hover:bg-primary/90 flex-1 font-medium text-white"
              >
                Login to Shortlist
              </Button>
            ) : (
              <Button
                onClick={isShortlisted ? undefined : handleShortlist}
                disabled={
                  isShortlisting || loadingShortlistStatus || isShortlisted
                }
                className={
                  'bg-primary hover:bg-primary/90 flex-1 cursor-not-allowed font-medium text-white'
                }
              >
                {isShortlisting
                  ? 'Updating...'
                  : loadingShortlistStatus
                    ? 'Loading...'
                    : isShortlisted
                      ? 'Shortlisted ✓'
                      : 'Shortlist Candidate'}
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleViewProfile}
              className="border-primary text-primary hover:bg-primary dark:border-primary/10 dark:bg-primary/10 dark:hover:bg-primary flex-1 hover:text-white dark:text-white"
            >
              View Profile
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  // List view component
  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="group border-border bg-card relative cursor-pointer overflow-hidden rounded-xl border transition-all duration-200 hover:shadow-lg"
      >
        {/* Card Content */}
        <div className="p-5 pt-8">
          {/* Header with avatar and basic info */}
          <div className="mb-3 flex items-center gap-3">
            <Avatar className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#F5F5FF] dark:border-indigo-900/40 dark:bg-indigo-900/20">
              <AvatarImage
                src={candidate.metadata?.image || ''}
                alt={candidate.name || ''}
              />
              <AvatarFallback className="text-primary text-lg font-medium dark:text-indigo-400">
                {getInitials(candidate.name || '')}
              </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col justify-center gap-y-1">
              <h3 className="text-foreground text-xl font-semibold">
                {candidate.name || 'Unnamed Candidate'}
              </h3>
              <p className="text-muted-foreground text-sm">
                {candidate.jobTitle || 'No Title'}
              </p>
            </div>
          </div>

          <div className="flex gap-x-4">
            <div className="mb-1">
              <p className="text-muted-foreground flex items-center gap-x-2 text-base">
                <UsersIcon className="h-4 w-4" />
                <span className="font-medium">
                  {candidate.metadata?.experience || 'N/A'} years
                </span>
              </p>
            </div>

            {/* Location and education */}
            <div className="text-muted-foreground mb-2 flex items-center gap-5 text-sm">
              <div className="flex items-center gap-3">
                <GraduationCap className="h-5 w-5" />
                <span className="text-base">
                  {candidate.metadata?.education
                    ? candidate.metadata.education
                        .toLowerCase()
                        .replace(/_/g, ' ')
                        .replace(/\b\w/g, (char: string) => char.toUpperCase())
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Candidate description */}
          <p className="mt-3 line-clamp-2 h-16 text-base text-gray-900 dark:text-white">
            {candidate.description ||
              'No introduction available No introduction available No introduction available'}
          </p>

          <div className="mb-4">
            <p className="text-foreground mb-2 text-base">
              Preferred Locations
            </p>
            <div className="mb-3 flex flex-wrap gap-2">
              {candidate.metadata?.locations
                ?.slice(0, 3)
                .map((location: string, index: number) => (
                  <div
                    key={index}
                    className="dark:bg-primary/10 rounded-md border border-gray-200 bg-white px-2 py-1 text-sm text-gray-600 dark:border-gray-700 dark:text-white"
                  >
                    {location}
                  </div>
                ))}
              {candidate.metadata?.locations?.length > 3 && (
                <div className="rounded-md border border-gray-200 bg-white px-2 py-1 text-sm">
                  +{candidate.metadata.locations.length - 3}
                </div>
              )}
            </div>
          </div>

          {/* Key Skills */}
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-foreground text-base">Key Skills</p>
              {hasMoreSkills && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSkills}
                  className="h-auto p-1 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                >
                  {showAllSkills ? 'Show Less' : `+${skills.length - 3} more`}
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {displayedSkills.map((skill: string, index: number) => (
                <div
                  key={index}
                  className="dark:bg-primary/10 rounded-md border border-gray-200 bg-white px-2 py-1 text-sm text-gray-600 dark:border-gray-700 dark:text-white"
                >
                  {skill}
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-10 flex items-center gap-2">
            {!user ? (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  toast.info('Please log in to shortlist candidates');
                  // Redirect to login page
                  window.location.href = '/app/auth/login?user_type=client';
                }}
                className="bg-primary hover:bg-primary/90 flex-1 font-medium text-white"
              >
                Login to Shortlist
              </Button>
            ) : (
              <Button
                onClick={isShortlisted ? undefined : handleShortlist}
                disabled={
                  isShortlisting || loadingShortlistStatus || isShortlisted
                }
                className={
                  'bg-primary hover:bg-primary/90 flex-1 cursor-not-allowed font-medium text-white'
                }
              >
                {isShortlisting
                  ? 'Updating...'
                  : loadingShortlistStatus
                    ? 'Loading...'
                    : isShortlisted
                      ? 'Shortlisted ✓'
                      : 'Shortlist Candidate'}
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleViewProfile}
              className="border-primary text-primary hover:bg-primary dark:border-primary/10 dark:bg-primary/10 dark:hover:bg-primary flex-1 hover:text-white dark:text-white"
            >
              View Profile
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  return null;
};

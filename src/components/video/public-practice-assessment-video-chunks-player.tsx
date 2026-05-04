'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { EnhancedSequentialPlayer } from './enhanced-sequential-player';
import { logger } from '@/lib/logger';
import { cn } from '@/lib/utils';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface PublicPracticeVideoChunksService {
  getVideoChunks: (
    assessmentId: string,
    options?: {
      questionId?: string;
      sectionId?: string;
      includeAnalysis?: boolean;
      includePlaybackUrls?: boolean;
    }
  ) => Promise<
    Array<{
      id: string;
      chunkIndex: number;
      questionId: string | null;
      sectionId: string | null;
      attemptNumber: number;
      status: string;
      createdAt: Date;
      analysis?: any;
      playbackUrl?: string;
      playbackUrlError?: string;
    }>
  >;
}

interface PublicPracticeAssessmentVideoChunksPlayerProps {
  assessmentId: string;
  service: PublicPracticeVideoChunksService;
  className?: string;
  questionId?: string;
  sectionId?: string;
  includeAnalysis?: boolean;
  // Fallback props for backward compatibility
  videoUrl?: string;
  highlightsVideoUrl?: string;
}

export const PublicPracticeAssessmentVideoChunksPlayer = ({
  assessmentId,
  service,
  className,
  questionId,
  sectionId,
  includeAnalysis,
  videoUrl,
  highlightsVideoUrl,
}: PublicPracticeAssessmentVideoChunksPlayerProps) => {
  const [videoChunks, setVideoChunks] = useState<
    Array<{ chunkIndex: number; playbackUrl: string }>
  >([]);
  const [chunksLoading, setChunksLoading] = useState(false);
  const [chunksError, setChunksError] = useState<string | null>(null);
  const [useFullVideo, setUseFullVideo] = useState(false);
  const [_hasAttemptedLoad, setHasAttemptedLoad] = useState(false);

  useEffect(() => {
    // Reset state when assessmentId changes
    setVideoChunks([]);
    setChunksLoading(false);
    setChunksError(null);
    setHasAttemptedLoad(false);

    // Load chunks for the new assessmentId
    if (!assessmentId) {
      return;
    }

    const loadChunks = async () => {
      setChunksLoading(true);
      setChunksError(null);
      setHasAttemptedLoad(true);

      try {
        logger.info(
          'Fetching video chunks for PublicPracticeAssessmentVideoChunksPlayer',
          {
            assessmentId,
          }
        );

        const result = await service.getVideoChunks(assessmentId, {
          questionId,
          sectionId,
          includeAnalysis,
          includePlaybackUrls: true,
        });

        if (!result || result.length === 0) {
          // No chunks found - check if we have fallback URLs
          if (!videoUrl && !highlightsVideoUrl) {
            setChunksError(
              'No video chunks found and no fallback video URLs available.'
            );
          } else {
            // We have fallback URLs, so don't set error
            setChunksError(null);
          }
          setChunksLoading(false);
          return;
        }

        const processedChunks = result
          .filter((c) => !!c.playbackUrl)
          .map((c) => ({
            chunkIndex: c.chunkIndex,
            playbackUrl: c.playbackUrl!,
          }))
          .sort((a, b) => a.chunkIndex - b.chunkIndex);

        if (processedChunks.length === 0) {
          // No chunks with URLs - check if we have fallback URLs
          if (!videoUrl && !highlightsVideoUrl) {
            setChunksError(
              'No video chunks found and no fallback video URLs available.'
            );
          } else {
            setChunksError(null);
          }
          setChunksLoading(false);
          return;
        }

        setVideoChunks(processedChunks);
      } catch (error: any) {
        logger.warn(
          'Error fetching video chunks, will try fallback video URLs',
          {
            assessmentId,
            error,
          }
        );
        // Only set error if we don't have fallback URLs
        if (!videoUrl && !highlightsVideoUrl) {
          const errorMessage =
            error?.message || 'Failed to load video chunks. Please try again.';
          setChunksError(errorMessage);
        } else {
          setChunksError(null);
        }
      } finally {
        setChunksLoading(false);
      }
    };

    loadChunks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessmentId]); // Only depend on assessmentId - reset and load when it changes

  const fetchVideoChunks = useCallback(async (): Promise<
    Array<{
      chunkIndex: number;
      playbackUrl: string;
    }>
  > => {
    logger.info(
      'Refreshing video chunks for PublicPracticeAssessmentVideoChunksPlayer',
      {
        assessmentId,
      }
    );
    try {
      const result = await service.getVideoChunks(assessmentId, {
        questionId,
        sectionId,
        includeAnalysis,
        includePlaybackUrls: true,
      });

      if (!result || result.length === 0) {
        return [];
      }

      const processedChunks = result
        .filter((c) => !!c.playbackUrl)
        .map((c) => ({
          chunkIndex: c.chunkIndex,
          playbackUrl: c.playbackUrl!,
        }))
        .sort((a, b) => a.chunkIndex - b.chunkIndex);

      return processedChunks;
    } catch (error) {
      logger.warn('Error refreshing video chunks', {
        assessmentId,
        error,
      });
      return [];
    }
  }, [assessmentId, service, questionId, sectionId, includeAnalysis]);

  const handleUrlExpired = useCallback(async () => {
    logger.info(
      'Refreshing video chunk URLs for PublicPracticeAssessmentVideoChunksPlayer',
      {
        assessmentId,
      }
    );
    const freshChunks = await fetchVideoChunks();
    if (freshChunks && freshChunks.length > 0) {
      setVideoChunks(freshChunks);
      return freshChunks;
    }
    // If no chunks, return empty array
    return [];
  }, [fetchVideoChunks, assessmentId]);

  const memoizedVideoChunks = useMemo(
    () => videoChunks,
    [
      videoChunks.length,
      videoChunks.map((c) => c.playbackUrl.substring(0, 150)).join(','),
    ]
  );

  if (chunksLoading) {
    return (
      <div
        className={cn(
          'flex aspect-video min-h-[280px] w-full flex-col items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800',
          className
        )}
      >
        <Loader2 className="text-primary mb-4 h-12 w-12 animate-spin" />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Loading video...
        </p>
      </div>
    );
  }

  // If we have video chunks, show the chunk-based player
  if (videoChunks.length > 0) {
    return (
      <EnhancedSequentialPlayer
        chunks={memoizedVideoChunks}
        onUrlExpired={handleUrlExpired}
        className={className}
      />
    );
  }

  // If chunks failed/not available but we have fallback video URLs, show old video player
  if (videoUrl || highlightsVideoUrl) {
    const currentVideoUrl = useFullVideo
      ? videoUrl
      : highlightsVideoUrl || videoUrl;

    return (
      <div className={className}>
        {/* Video Toggle */}
        {highlightsVideoUrl && videoUrl && (
          <div className="mb-4 flex items-center justify-end gap-2">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {useFullVideo ? 'Full Video' : 'Highlights'}
            </span>
            <Switch checked={useFullVideo} onCheckedChange={setUseFullVideo} />
          </div>
        )}

        {/* Video Player - matching EnhancedSequentialPlayer styling */}
        {currentVideoUrl && (
          <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
            <video
              src={currentVideoUrl}
              controls
              className="absolute inset-0 h-full w-full object-contain"
              playsInline
              preload="auto"
            />
          </div>
        )}
      </div>
    );
  }

  // Show error or no video message
  if (chunksError) {
    return (
      <div className="flex items-center justify-center rounded-lg bg-red-50 p-8 dark:bg-red-900/20">
        <AlertTriangle className="mr-2 h-5 w-5 text-red-600" />
        <p className="text-sm text-red-600 dark:text-red-400">{chunksError}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center rounded-lg bg-gray-100 p-8 dark:bg-gray-800">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        No video available for this assessment.
      </p>
    </div>
  );
};

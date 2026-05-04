'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  AlertCircle,
} from 'lucide-react';

interface VideoChunk {
  chunkIndex: number;
  playbackUrl: string;
  duration?: number; // Duration in seconds from backend (if available)
}

interface EnhancedSequentialPlayerProps {
  chunks: VideoChunk[];
  className?: string;
  onUrlExpired?: () => Promise<VideoChunk[]>;
}

export const EnhancedSequentialPlayer = ({
  chunks,
  className,
  onUrlExpired,
}: EnhancedSequentialPlayerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [chunkDurations, setChunkDurations] = useState<number[]>([]);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isCalculatingDuration, setIsCalculatingDuration] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [activePrimaryVideo, setActivePrimaryVideo] = useState(true); // true = primary, false = secondary

  const primaryVideoRef = useRef<HTMLVideoElement>(null);
  const secondaryVideoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const shouldPlayRef = useRef(false);
  const seekTargetRef = useRef<number | null>(null);
  const retryCountRef = useRef<Map<number, number>>(new Map());
  const playbackWatchdogRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const durationCalculationInProgressRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const transitionInProgressRef = useRef(false);
  const urlRefreshTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const chunksLoadedAtRef = useRef<number>(Date.now());

  // Get active and inactive video refs
  const getActiveVideoRef = () =>
    activePrimaryVideo ? primaryVideoRef : secondaryVideoRef;
  const getInactiveVideoRef = () =>
    activePrimaryVideo ? secondaryVideoRef : primaryVideoRef;

  // Initialize video elements on mount
  useEffect(() => {
    const primaryVideo = primaryVideoRef.current;
    const secondaryVideo = secondaryVideoRef.current;

    if (primaryVideo) {
      primaryVideo.volume = volume;
      primaryVideo.muted = isMuted;
    }
    if (secondaryVideo) {
      secondaryVideo.volume = volume;
      secondaryVideo.muted = isMuted;
    }
  }, []);

  // Proactive URL refresh - refresh before expiration (URLs expire in 180s, refresh at 120s)
  useEffect(() => {
    if (!onUrlExpired) return;

    // Clear any existing timer
    if (urlRefreshTimerRef.current) {
      clearTimeout(urlRefreshTimerRef.current);
    }

    // Update timestamp when chunks change
    chunksLoadedAtRef.current = Date.now();

    // Set timer to refresh URLs after 2 minutes (before 3 minute expiration)
    const REFRESH_INTERVAL = 120000; // 120 seconds = 2 minutes

    urlRefreshTimerRef.current = setTimeout(async () => {
      try {
        await onUrlExpired();
      } catch (_error) {
        // Error will be handled when video actually tries to load
      }
    }, REFRESH_INTERVAL);

    return () => {
      if (urlRefreshTimerRef.current) {
        clearTimeout(urlRefreshTimerRef.current);
      }
    };
  }, [chunks, onUrlExpired]);

  // Validate chunk URL
  const isValidUrl = (url: string): boolean => {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
    } catch {
      return false;
    }
  };

  // Calculate durations for chunks progressively
  useEffect(() => {
    if (!chunks || chunks.length === 0) return;

    // Prevent duplicate calls
    if (durationCalculationInProgressRef.current) {
      return;
    }

    // Abort any previous calculation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const getDurationsProgressively = async () => {
      durationCalculationInProgressRef.current = true;
      setIsCalculatingDuration(true);
      setError(null);

      // Validate all URLs first (fast check)
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        if (!chunk.playbackUrl || !isValidUrl(chunk.playbackUrl)) {
          setError(`Chunk ${i} has invalid playback URL`);
          durationCalculationInProgressRef.current = false;
          return;
        }
      }

      const chunksNeedingCalculation = chunks.filter(
        (chunk) => !chunk.duration || chunk.duration <= 0
      );

      // Use backend durations if available, otherwise use estimates
      const initialDurations = chunks.map((chunk) => {
        if (chunk.duration && chunk.duration > 0) {
          return chunk.duration; // Use backend duration
        }
        return 30; // Fallback estimate
      });

      setChunkDurations(initialDurations);
      const initialTotal = initialDurations.reduce((sum, d) => sum + d, 0);
      setTotalDuration(initialTotal);
      setIsCalculatingDuration(false);
      durationCalculationInProgressRef.current = false;

      if (chunksNeedingCalculation.length === 0) {
        // All chunks have backend duration - no client-side calculation needed
        return;
      }

      // Calculate actual durations in background (parallel, non-blocking)
      Promise.all(
        chunksNeedingCalculation.map((chunk, _originalIndex) => {
          // Find the original index in the full chunks array
          const index = chunks.findIndex((c) => c === chunk);
          return getVideoDuration(chunk.playbackUrl, abortController.signal)
            .then((duration) => ({ index, duration }))
            .catch(() => ({ index, duration: 30 })); // Fallback on error
        })
      )
        .then((results) => {
          if (abortController.signal.aborted) return;

          const actualDurations = [...initialDurations];
          results.forEach(({ index, duration }) => {
            actualDurations[index] = duration;
          });

          setChunkDurations(actualDurations);
          const total = actualDurations.reduce((sum, d) => sum + d, 0);
          setTotalDuration(total);
        })
        .catch(() => {
          // Keep initial durations (backend + estimates) if background calculation fails
        });
    };

    getDurationsProgressively();

    // Cleanup function
    return () => {
      abortController.abort();
      durationCalculationInProgressRef.current = false;
    };
  }, [chunks]);

  const getVideoDuration = (
    url: string,
    signal?: AbortSignal
  ): Promise<number> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.crossOrigin = 'anonymous';

      let timeoutId = setTimeout(() => {
        cleanup();
        reject(new Error('Timeout'));
      }, 10000); // 10 second timeout
      let isCleanedUp = false;

      const cleanup = () => {
        if (isCleanedUp) return;
        isCleanedUp = true;

        clearTimeout(timeoutId);
        video.src = '';
        video.load(); // Force cleanup
      };

      const timeout = setTimeout(() => {
        cleanup();
        reject(new Error('Timeout'));
      }, 10000); // 10 second timeout
      timeoutId = timeout;

      // Handle abort signal
      if (signal) {
        signal.addEventListener('abort', () => {
          cleanup();
          reject(new Error('AbortError'));
        });
      }

      const handleLoadedMetadata = () => {
        const duration = video.duration;
        cleanup();
        resolve(duration);
      };

      const handleError = (_e: Event) => {
        cleanup();
        reject(new Error('Load error'));
      };

      video.addEventListener('loadedmetadata', handleLoadedMetadata, {
        once: true,
      });
      video.addEventListener('error', handleError, { once: true });

      video.src = url;
    });
  };

  // Playback watchdog - ensures video keeps playing
  useEffect(() => {
    // Clear any existing watchdog
    if (playbackWatchdogRef.current) {
      clearInterval(playbackWatchdogRef.current);
    }

    // Don't start watchdog if there's an error or we're calculating duration
    if (error || isCalculatingDuration) {
      return;
    }

    // Start watchdog
    playbackWatchdogRef.current = setInterval(() => {
      const video = getActiveVideoRef().current;
      if (!video) return;

      // Don't interfere if video has an error
      if (video.error) {
        return;
      }

      // If video should be playing but is paused/stalled
      // Only try if video has sufficient data loaded (readyState >= 2)
      if (
        shouldPlayRef.current &&
        video.paused &&
        !video.ended &&
        video.readyState >= 2
      ) {
        // Try to resume playback
        video
          .play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch((_err) => {
            // Don't keep trying if play fails
            shouldPlayRef.current = false;
          });
      }
    }, 2000); // Check every 2 seconds (less aggressive)

    return () => {
      if (playbackWatchdogRef.current) {
        clearInterval(playbackWatchdogRef.current);
      }
    };
  }, [error, isCalculatingDuration, activePrimaryVideo]);

  // Preload next chunk in inactive video for seamless transitions
  useEffect(() => {
    if (!chunks || isTransitioning) return;

    const nextIndex = currentIndex + 1;
    if (nextIndex < chunks.length) {
      const nextChunk = chunks[nextIndex];
      const inactiveVideo = getInactiveVideoRef().current;

      if (nextChunk && isValidUrl(nextChunk.playbackUrl) && inactiveVideo) {
        inactiveVideo.src = nextChunk.playbackUrl;
        inactiveVideo.preload = 'auto';
        inactiveVideo.volume = volume;
        inactiveVideo.muted = isMuted;
        inactiveVideo.load();
      }
    }
  }, [
    currentIndex,
    chunks,
    isTransitioning,
    volume,
    isMuted,
    activePrimaryVideo,
  ]);

  // Update current time across all chunks
  useEffect(() => {
    const video = getActiveVideoRef().current;
    if (!video) return;

    const updateTime = () => {
      const previousTime = chunkDurations
        .slice(0, currentIndex)
        .reduce((sum, d) => sum + d, 0);

      setCurrentTime(previousTime + video.currentTime);
    };

    video.addEventListener('timeupdate', updateTime);
    return () => video.removeEventListener('timeupdate', updateTime);
  }, [currentIndex, chunkDurations, activePrimaryVideo]);

  // Handle video errors
  const handleVideoError = useCallback(
    async (e: Event) => {
      const video = e.target as HTMLVideoElement;
      const error = video.error;

      const retryCount = retryCountRef.current.get(currentIndex) || 0;

      // Error code 4 (MEDIA_ERR_SRC_NOT_SUPPORTED) often indicates expired/invalid URL
      const isPotentiallyExpiredUrl =
        error?.code === 4 || error?.message?.includes('Format error');

      // If URL might be expired and we have a refresh callback, try refreshing URLs first
      if (isPotentiallyExpiredUrl && retryCount === 0 && onUrlExpired) {
        setError('Video URL expired. Refreshing...');

        try {
          await onUrlExpired();
          setError(null);

          // Force video to reload with new URL
          // The parent component will update chunks, triggering a re-render
          retryCountRef.current.set(currentIndex, retryCount + 1);
          return;
        } catch (_refreshError) {
          setError('Failed to refresh video URLs. Please reload the page.');
        }
      }

      if (retryCount < 3) {
        // Retry loading this chunk
        retryCountRef.current.set(currentIndex, retryCount + 1);

        setTimeout(
          () => {
            if (video) {
              video.load();
            }
          },
          1000 * (retryCount + 1)
        ); // Exponential backoff
      } else {
        // Skip to next chunk after 3 failed retries
        retryCountRef.current.delete(currentIndex);

        const nextIndex = currentIndex + 1;
        if (nextIndex < chunks.length) {
          setCurrentIndex(nextIndex);
          shouldPlayRef.current = isPlaying;
        } else {
          setError(
            'Video playback failed. Please refresh the page and try again.'
          );
          setIsPlaying(false);
        }
      }
    },
    [currentIndex, chunks, isPlaying, onUrlExpired]
  );

  // Handle buffering states
  useEffect(() => {
    const video = getActiveVideoRef().current;
    if (!video) return;

    const handleWaiting = () => {
      setIsBuffering(true);
    };

    const handleCanPlay = () => {
      setIsBuffering(false);

      // If we have a seek target, apply it
      if (seekTargetRef.current !== null) {
        const targetTime = seekTargetRef.current;
        seekTargetRef.current = null;

        // Calculate time within this chunk
        const previousTime = chunkDurations
          .slice(0, currentIndex)
          .reduce((sum, d) => sum + d, 0);
        const timeInChunk = targetTime - previousTime;

        video.currentTime = Math.max(0, timeInChunk);
      }

      // Auto-play if needed - CRITICAL for continuous playback
      if (shouldPlayRef.current && !isTransitioning) {
        // Use a small delay to ensure video is fully ready
        setTimeout(() => {
          video
            .play()
            .then(() => {
              setIsPlaying(true);
            })
            .catch((_err) => {
              setIsPlaying(false);
              shouldPlayRef.current = false;
            });
        }, 50);
      }
    };

    const handleCanPlayThrough = () => {
      // Additional safety: try to play if shouldPlay is true but video is paused
      if (shouldPlayRef.current && video.paused && !isTransitioning) {
        video
          .play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch((_err) => {});
      }
    };

    const handlePlaying = () => {
      setIsBuffering(false);
      setIsPlaying(true);
    };

    const handlePause = () => {
      // Only update state if it wasn't a user action
      if (!shouldPlayRef.current) {
        setIsPlaying(false);
      }
    };

    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('canplaythrough', handleCanPlayThrough);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('pause', handlePause);
    video.addEventListener('error', handleVideoError);

    return () => {
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('canplaythrough', handleCanPlayThrough);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('error', handleVideoError);
    };
  }, [
    currentIndex,
    chunkDurations,
    handleVideoError,
    activePrimaryVideo,
    isTransitioning,
  ]);

  // Seamless chunk transition
  const performSeamlessTransition = useCallback(
    async (nextIndex: number) => {
      if (transitionInProgressRef.current) {
        return;
      }

      transitionInProgressRef.current = true;
      setIsTransitioning(true);

      const currentVideo = getActiveVideoRef().current;
      const nextVideo = getInactiveVideoRef().current;

      if (!currentVideo || !nextVideo) {
        transitionInProgressRef.current = false;
        setIsTransitioning(false);
        return;
      }

      const wasPlaying = !currentVideo.paused || shouldPlayRef.current;

      try {
        // Ensure next video is loaded and ready
        if (nextVideo.readyState < 2) {
          await new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error('Timeout waiting for video'));
            }, 5000);

            const handleCanPlay = () => {
              clearTimeout(timeout);
              nextVideo.removeEventListener('canplay', handleCanPlay);
              resolve();
            };

            nextVideo.addEventListener('canplay', handleCanPlay);

            // If already ready, resolve immediately
            if (nextVideo.readyState >= 2) {
              clearTimeout(timeout);
              nextVideo.removeEventListener('canplay', handleCanPlay);
              resolve();
            }
          });
        }

        // Start playing the next video if we were playing
        if (wasPlaying) {
          nextVideo.currentTime = 0;
          await nextVideo.play();
        }

        // Crossfade: pause current video
        currentVideo.pause();

        // Switch active video (this triggers CSS transition via opacity)
        setActivePrimaryVideo(!activePrimaryVideo);
        setCurrentIndex(nextIndex);
        retryCountRef.current.delete(nextIndex);

        if (wasPlaying) {
          setIsPlaying(true);
          shouldPlayRef.current = true;
        }
      } catch (_error) {
        // Fallback: just switch index
        setCurrentIndex(nextIndex);
        shouldPlayRef.current = wasPlaying;
      } finally {
        transitionInProgressRef.current = false;
        setIsTransitioning(false);
      }
    },
    [currentIndex, activePrimaryVideo]
  );

  // Handle chunk end - move to next chunk
  const handleChunkEnd = useCallback(() => {
    const nextIndex = currentIndex + 1;

    if (nextIndex < chunks.length) {
      performSeamlessTransition(nextIndex);
    } else {
      setIsPlaying(false);
      shouldPlayRef.current = false;
    }
  }, [currentIndex, chunks.length, isPlaying, performSeamlessTransition]);

  // Seeking across chunks
  const handleSeek = (seekTime: number) => {
    if (chunkDurations.length === 0) {
      return;
    }

    let accumulatedTime = 0;
    let targetChunkIndex = 0;
    let timeInChunk = seekTime;

    // Find which chunk contains this time
    for (let i = 0; i < chunkDurations.length; i++) {
      if (accumulatedTime + chunkDurations[i] > seekTime) {
        targetChunkIndex = i;
        timeInChunk = seekTime - accumulatedTime;
        break;
      }
      accumulatedTime += chunkDurations[i];
    }

    if (targetChunkIndex !== currentIndex) {
      // Need to switch chunks
      shouldPlayRef.current = isPlaying;
      seekTargetRef.current = seekTime; // Store seek target
      setCurrentIndex(targetChunkIndex);
    } else {
      // Same chunk, just seek
      const video = getActiveVideoRef().current;
      if (video) {
        video.currentTime = timeInChunk;
      }
    }
  };

  const togglePlay = () => {
    const video = getActiveVideoRef().current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
      shouldPlayRef.current = false;
    } else {
      shouldPlayRef.current = true; // Set BEFORE calling play
      video
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((_err) => {
          shouldPlayRef.current = false;
          setError('Failed to play video. Please refresh and try again.');
        });
    }
  };

  const toggleMute = () => {
    const primaryVideo = primaryVideoRef.current;
    const secondaryVideo = secondaryVideoRef.current;

    if (primaryVideo) primaryVideo.muted = !isMuted;
    if (secondaryVideo) secondaryVideo.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (newVolume: number) => {
    const primaryVideo = primaryVideoRef.current;
    const secondaryVideo = secondaryVideoRef.current;

    if (primaryVideo) primaryVideo.volume = newVolume;
    if (secondaryVideo) secondaryVideo.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const resetControlsTimeout = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    if (isPlaying && !isBuffering) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || !isFinite(seconds)) return '0:00';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (error) {
    const isUrlExpiredError =
      error.includes('expired') || error.includes('Refreshing');

    return (
      <div className="flex items-center justify-center rounded-lg bg-red-50 p-8 dark:bg-red-900/20">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-3 h-10 w-10 text-red-500" />
          <p className="text-sm font-semibold text-red-600 dark:text-red-400">
            {error}
          </p>
          {isUrlExpiredError ? (
            <p className="mt-2 text-xs text-red-500 dark:text-red-500">
              Video URLs are being refreshed automatically...
            </p>
          ) : (
            <>
              <p className="mt-2 text-xs text-red-500 dark:text-red-500">
                Please check the video source and try again
              </p>
              {onUrlExpired && (
                <button
                  onClick={async () => {
                    setError(null);
                    try {
                      await onUrlExpired();
                      retryCountRef.current.clear();
                    } catch (_err) {
                      setError(
                        'Failed to refresh video. Please reload the page.'
                      );
                    }
                  }}
                  className="mt-4 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                >
                  Refresh Video
                </button>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  if (!chunks || chunks.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg bg-gray-100 p-8 dark:bg-gray-800">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          No video available
        </p>
      </div>
    );
  }

  const currentChunk = chunks[currentIndex];

  if (!currentChunk || !isValidUrl(currentChunk.playbackUrl)) {
    return (
      <div className="flex items-center justify-center rounded-lg bg-red-50 p-8 dark:bg-red-900/20">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-3 h-10 w-10 text-red-500" />
          <p className="text-sm font-semibold text-red-600 dark:text-red-400">
            Invalid video source
          </p>
          <p className="mt-2 text-xs text-red-500 dark:text-red-500">
            Chunk {currentIndex} has an invalid playback URL
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative aspect-video w-full overflow-hidden rounded-lg bg-black',
        className
      )}
      onMouseMove={resetControlsTimeout}
      onMouseLeave={() => isPlaying && !isBuffering && setShowControls(false)}
    >
      {/* Primary Video Element */}
      <video
        ref={primaryVideoRef}
        src={
          activePrimaryVideo
            ? currentChunk.playbackUrl
            : chunks[currentIndex + 1]?.playbackUrl || ''
        }
        className={cn(
          'absolute inset-0 h-full w-full object-contain transition-opacity duration-500',
          activePrimaryVideo ? 'z-10 opacity-100' : 'z-0 opacity-0'
        )}
        onPlay={() => activePrimaryVideo && setIsPlaying(true)}
        onPause={() => activePrimaryVideo && setIsPlaying(false)}
        onEnded={() => activePrimaryVideo && handleChunkEnd()}
        playsInline
        preload="auto"
        crossOrigin="anonymous"
      />

      {/* Secondary Video Element */}
      <video
        ref={secondaryVideoRef}
        src={
          !activePrimaryVideo
            ? currentChunk.playbackUrl
            : chunks[currentIndex + 1]?.playbackUrl || ''
        }
        className={cn(
          'absolute inset-0 h-full w-full object-contain transition-opacity duration-500',
          !activePrimaryVideo ? 'z-10 opacity-100' : 'z-0 opacity-0'
        )}
        onPlay={() => !activePrimaryVideo && setIsPlaying(true)}
        onPause={() => !activePrimaryVideo && setIsPlaying(false)}
        onEnded={() => !activePrimaryVideo && handleChunkEnd()}
        playsInline
        preload="auto"
        crossOrigin="anonymous"
      />

      {/* Calculating Duration Overlay */}
      {isCalculatingDuration && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80">
          <div className="text-center">
            <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
            <p className="text-lg font-medium text-white">Preparing video...</p>
            <p className="mt-2 text-sm text-white/80">
              Calculating duration...
            </p>
          </div>
        </div>
      )}

      {/* Buffering Overlay */}
      {isBuffering && !isCalculatingDuration && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50">
          <div className="text-center">
            <div className="mb-3 inline-block h-10 w-10 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
            <p className="text-sm font-medium text-white">Loading...</p>
          </div>
        </div>
      )}

      {/* Custom Controls Overlay */}
      <div
        className={cn(
          'absolute inset-0 z-30 flex flex-col justify-end bg-gradient-to-t from-black/70 via-transparent to-transparent transition-opacity duration-300',
          showControls || isBuffering ? 'opacity-100' : 'opacity-0'
        )}
      >
        <div className="space-y-3 p-4">
          {/* Progress Bar */}
          <div className="space-y-1">
            <input
              type="range"
              min="0"
              max={totalDuration || 0}
              value={currentTime}
              onChange={(e) => handleSeek(parseFloat(e.target.value))}
              disabled={isCalculatingDuration}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/30 disabled:cursor-not-allowed disabled:opacity-50 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
            />
            <div className="flex justify-between text-xs text-white">
              <span>{formatTime(currentTime)}</span>
              <span>
                {isCalculatingDuration
                  ? 'Calculating...'
                  : formatTime(totalDuration)}
              </span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                disabled={isCalculatingDuration}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="ml-0.5 h-5 w-5" />
                )}
              </button>

              {/* Volume */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  className="text-white hover:text-white/80"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) =>
                    handleVolumeChange(parseFloat(e.target.value))
                  }
                  className="h-1 w-20 cursor-pointer appearance-none rounded-full bg-white/30"
                />
              </div>
            </div>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="text-white transition-colors hover:text-white/80"
            >
              {isFullscreen ? (
                <Minimize className="h-5 w-5" />
              ) : (
                <Maximize className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

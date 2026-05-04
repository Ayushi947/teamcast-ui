import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useApp } from '@/lib/context/app-context';
import { toast } from 'sonner';

// Import frontend-compatible service
import { tourGuidanceService } from '@/lib/services/services';
import {
  ITourDefinition,
  ITourStep,
  IUserTourProgress,
  ITourStatusResponse,
  TourActionEnum,
  UserTourStatusEnum,
} from '@/lib/shared';
import { logger } from '../logger';

// Retry configuration
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAYS = [1000, 2000, 5000]; // Progressive delays
const AUTO_START_DELAY = 500; // Increased delay for better page readiness

export interface SimpleTourProgress {
  currentStepIndex: number;
  totalSteps: number;
  completedSteps: number;
  percentComplete: number;
  canGoNext: boolean;
  canGoPrevious: boolean;
  canSkip: boolean;
}

export interface UseSimpleTourOptions {
  autoStart?: boolean;
  showProgress?: boolean;
}

export function useTourHook(
  tourKey: string,
  options: UseSimpleTourOptions = {}
) {
  const { autoStart = true, showProgress = true } = options;

  const { user } = useApp();

  // State
  const [tourDefinition, setTourDefinition] = useState<ITourDefinition | null>(
    null
  );
  const [tourProgress, setTourProgress] = useState<IUserTourProgress | null>(
    null
  );
  const [currentStep, setCurrentStep] = useState<ITourStep | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isStartingTour, setIsStartingTour] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastStartAttempt, setLastStartAttempt] = useState<number>(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [tourStatus, setTourStatus] = useState<ITourStatusResponse | null>(
    null
  );

  // Refs for better state management
  const autoStartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Use singleton service instance
  const tourService = tourGuidanceService;

  // Check if tour is completed
  const isTourCompleted = useMemo(() => {
    return tourStatus?.isCompleted || false;
  }, [tourStatus]);

  // Check if tour is dismissed
  const isTourDismissed = useMemo(() => {
    return tourStatus?.isDismissed || false;
  }, [tourStatus]);

  // Check if tour should be shown
  const shouldShowTour = useMemo(() => {
    return !isTourCompleted && !isTourDismissed && !!tourKey;
  }, [isTourCompleted, isTourDismissed, tourKey]);

  // Derived states
  const isActive = useMemo(() => {
    return !!(
      tourProgress &&
      tourProgress.status === UserTourStatusEnum.IN_PROGRESS &&
      currentStep &&
      !isPaused
    );
  }, [tourProgress, currentStep, isPaused]);

  const shouldShowResumePrompt = useMemo(() => {
    return isPaused && showResumePrompt && !!tourProgress && !!currentStep;
  }, [isPaused, showResumePrompt, tourProgress, currentStep]);

  // Progress calculation
  const progress = useMemo((): SimpleTourProgress => {
    const totalSteps = tourDefinition?.tourSteps?.length || 0;

    if (!tourProgress || !tourDefinition) {
      return {
        currentStepIndex: 0,
        totalSteps,
        completedSteps: 0,
        percentComplete: 0,
        canGoNext: false,
        canGoPrevious: false,
        canSkip: false,
      };
    }

    const currentStepIndex = tourProgress.currentStepIndex || 0;
    const completedSteps = tourProgress.completedSteps?.length || 0;

    // Debug logging for skip button visibility
    const stepSkipEnabled = currentStep?.showSkip || false;
    const tourSkipEnabled = tourDefinition?.tourSettings?.allowSkip || false;
    const canSkip = stepSkipEnabled && tourSkipEnabled;

    return {
      currentStepIndex,
      totalSteps,
      completedSteps,
      percentComplete:
        totalSteps > 0
          ? Math.round(((currentStepIndex + 1) / totalSteps) * 100)
          : 0,
      canGoNext: currentStepIndex < totalSteps - 1,
      canGoPrevious: currentStepIndex > 0,
      canSkip,
    };
  }, [tourProgress, tourDefinition, currentStep]);

  // Load tour definition
  const loadTourDefinition = useCallback(async () => {
    if (!tourKey) {
      setTourDefinition(null);
      return;
    }

    try {
      // Get tour definition from available tours
      const tours = await tourService.getUserTours();
      const definition = tours.availableTours.find(
        (tour) => tour.tourKey === tourKey
      );

      if (definition) {
        setTourDefinition(definition as ITourDefinition);
        logger.info(`Tour definition loaded for: ${tourKey}`);
      } else {
        logger.warn(`Tour definition not found for key: ${tourKey}`);
        setTourDefinition(null);
      }
    } catch (err: any) {
      logger.error('Error loading tour definition:', err);
      setTourDefinition(null);
    }
  }, [tourKey, tourService]);

  // Check tour status by key
  const checkTourStatus = useCallback(async () => {
    if (!tourKey || !user) {
      setTourStatus(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const status = await tourService.getTourStatusByKey(tourKey);
      setTourStatus(status);

      logger.info(`Tour status checked for: ${tourKey}`, {
        status: status.status,
        isCompleted: status.isCompleted,
        isDismissed: status.isDismissed,
        isPaused: status.isPaused,
      });

      // If tour is in progress, load the progress details
      if (status.status === UserTourStatusEnum.IN_PROGRESS && status.progress) {
        setTourProgress(status.progress);
      } else {
        setTourProgress(null);
      }
    } catch (err: any) {
      logger.error('Error checking tour status:', err);
      const errorMessage = err?.message || 'Failed to check tour status';

      if (err?.response?.status === 404) {
        // Tour not found - this is normal for new tours
        setTourStatus(null);
        setTourProgress(null);
        logger.info(
          `Tour not found for key: ${tourKey} - this is normal for new tours`
        );
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, [tourKey, user, tourService]);

  // Load current step information
  const loadCurrentStep = useCallback(() => {
    if (
      !tourProgress?.tourId ||
      tourProgress.status !== UserTourStatusEnum.IN_PROGRESS
    ) {
      setCurrentStep(null);
      return;
    }

    try {
      // Get step from tour definition using stepId
      if (tourDefinition && tourProgress.stepId) {
        const step = tourDefinition.tourSteps.find(
          (s: ITourStep) => s.id === tourProgress.stepId
        );
        if (step) {
          setCurrentStep(step as ITourStep);
          if (process.env.NODE_ENV === 'development') {
            logger.debug('Current step loaded by stepId:', {
              stepId: tourProgress.stepId,
              stepTitle: step.title,
              showSkip: step.showSkip,
            });
          }
          return;
        }
      }

      // Fallback: get step by currentStepIndex if stepId is not available
      if (tourDefinition && tourDefinition.tourSteps.length > 0) {
        const currentStepIndex = tourProgress.currentStepIndex || 0;
        if (currentStepIndex < tourDefinition.tourSteps.length) {
          const step = tourDefinition.tourSteps[currentStepIndex];
          setCurrentStep(step as ITourStep);
          if (process.env.NODE_ENV === 'development') {
            logger.debug('Current step loaded by currentStepIndex:', {
              currentStepIndex,
              stepTitle: step.title,
              showSkip: step.showSkip,
            });
          }
          return;
        }
      }

      // Last resort: get first step if no valid step found
      if (tourDefinition && tourDefinition.tourSteps.length > 0) {
        const step = tourDefinition.tourSteps[0];
        setCurrentStep(step as ITourStep);
        if (process.env.NODE_ENV === 'development') {
          logger.debug('Current step loaded as fallback (first step):', {
            stepTitle: step.title,
            showSkip: step.showSkip,
          });
        }
      }
    } catch (err) {
      logger.error('Error loading current step:', err);
      setCurrentStep(null);
    }
  }, [tourProgress, tourDefinition]);

  // Enhanced start tour with retry logic
  const startTour = useCallback(
    async (isRetry = false) => {
      if (!user || !tourKey || !shouldShowTour || isStartingTour) {
        logger.info('Tour start blocked:', {
          hasUser: !!user,
          tourKey,
          shouldShowTour,
          isStartingTour,
          isRetry,
        });
        return;
      }

      // Prevent starting if tour is already completed
      if (isTourCompleted) {
        return;
      }

      // Prevent overlapping if tour is already active
      if (
        tourProgress &&
        tourProgress.status === UserTourStatusEnum.IN_PROGRESS
      ) {
        return;
      }

      // Debounce mechanism for non-retry attempts
      if (!isRetry) {
        const now = Date.now();
        if (now - lastStartAttempt < 2000) {
          logger.info('Start tour debounced - too frequent calls');
          return;
        }
        setLastStartAttempt(now);
      }

      try {
        setIsStartingTour(true);
        setIsLoading(true);
        setError(null);

        logger.info(`Starting tour${isRetry ? ' (retry attempt)' : ''}:`, {
          tourKey,
          retryCount: isRetry ? retryCount : 0,
        });

        const progress = await tourService.startTour(tourKey);
        setTourProgress(progress as IUserTourProgress);
        setIsPaused(false);
        setShowResumePrompt(false);

        // Reset retry count on success
        setRetryCount(0);

        logger.info('Tour started successfully:', {
          tourKey,
          progressId: progress.id,
        });
      } catch (err: any) {
        logger.error('Error starting tour:', err);

        const errorMessage = err?.message || 'Failed to start tour';
        setError(errorMessage);

        // Only retry for network/server errors and if we haven't exceeded max retries
        if (
          (err?.response?.status >= 500 || !err?.response) &&
          retryCount < MAX_RETRY_ATTEMPTS
        ) {
          const currentRetryCount = retryCount + 1;
          setRetryCount(currentRetryCount);

          const retryDelay =
            RETRY_DELAYS[
              Math.min(currentRetryCount - 1, RETRY_DELAYS.length - 1)
            ];

          logger.info(
            `Scheduling retry attempt ${currentRetryCount} in ${retryDelay}ms`
          );

          retryTimeoutRef.current = setTimeout(() => {
            startTour(true);
          }, retryDelay);
        } else {
          // Show user-friendly error message
          if (retryCount >= MAX_RETRY_ATTEMPTS) {
            toast.error(
              'Tour failed to start after multiple attempts. Please refresh the page and try again.'
            );
          } else {
            toast.error('Failed to start tour');
          }
        }
      } finally {
        setIsLoading(false);
        setIsStartingTour(false);
      }
    },
    [
      user,
      tourKey,
      shouldShowTour,
      isStartingTour,
      lastStartAttempt,
      tourService,
      retryCount,
      isTourCompleted,
      tourProgress,
    ]
  );

  // Complete current tour
  const completeTour = useCallback(async () => {
    if (!tourProgress?.tourId || !tourKey) return;

    try {
      setIsLoading(true);
      await tourService.completeTour(tourProgress.tourId);

      setTourProgress(null);
      setCurrentStep(null);
      setIsPaused(false);
      setShowResumePrompt(false);

      // Refresh tour status
      await checkTourStatus();

      logger.info(`Tour completed for: ${tourKey}`);
    } catch (err: any) {
      logger.error('Error completing tour:', err);
      toast.error('Failed to complete tour');
    } finally {
      setIsLoading(false);
    }
  }, [tourProgress, tourKey, tourService, checkTourStatus]);

  // Navigate to next step
  const nextStep = useCallback(async () => {
    if (!tourProgress?.tourId || !currentStep || isLoading) return;

    try {
      setIsLoading(true);
      setError(null);

      const updatedProgress = await tourService.updateTourProgress({
        tourId: tourProgress.tourId,
        action: TourActionEnum.NEXT_STEP as TourActionEnum,
        stepId: currentStep.id,
      });

      setTourProgress(updatedProgress as IUserTourProgress);

      // If tour is completed, hide it and mark as completed
      if (updatedProgress.status === UserTourStatusEnum.COMPLETED) {
        await completeTour();
      }
    } catch (err) {
      logger.error('Error moving to next step:', err);
      setError('Failed to move to next step');
      toast.error('Failed to proceed to next step');
    } finally {
      setIsLoading(false);
    }
  }, [tourProgress, currentStep, isLoading, completeTour, tourService]);

  // Navigate to previous step
  const previousStep = useCallback(async () => {
    if (!tourProgress?.tourId || !currentStep || isLoading) return;

    try {
      setIsLoading(true);
      setError(null);

      const updatedProgress = await tourService.updateTourProgress({
        tourId: tourProgress.tourId,
        action: TourActionEnum.PREVIOUS_STEP as TourActionEnum,
        stepId: currentStep.id,
      });

      setTourProgress(updatedProgress as IUserTourProgress);
    } catch (err) {
      logger.error('Error moving to previous step:', err);
      setError('Failed to move to previous step');
      toast.error('Failed to go to previous step');
    } finally {
      setIsLoading(false);
    }
  }, [tourProgress, currentStep, isLoading, tourService]);

  // Skip current step
  const skipStep = useCallback(async () => {
    if (!tourProgress?.tourId || !currentStep || isLoading) return;

    try {
      setIsLoading(true);
      setError(null);

      const updatedProgress = await tourService.updateTourProgress({
        tourId: tourProgress.tourId,
        action: TourActionEnum.SKIP_STEP as TourActionEnum,
        stepId: currentStep.id,
      });

      setTourProgress(updatedProgress as IUserTourProgress);

      // If tour is completed after skip, hide it and mark as completed
      if (updatedProgress.status === UserTourStatusEnum.COMPLETED) {
        await completeTour();
      }
    } catch (err) {
      logger.error('Error skipping step:', err);
      setError('Failed to skip step');
      toast.error('Failed to skip step');
    } finally {
      setIsLoading(false);
    }
  }, [tourProgress, currentStep, isLoading, completeTour, tourService]);

  // Skip the entire tour
  const skipTour = useCallback(async () => {
    if (!tourProgress?.tourId || !tourKey || isLoading) return;

    try {
      setIsLoading(true);
      setError(null);

      // Call backend to skip the tour
      await tourService.skipTour(tourProgress.tourId);

      setTourProgress(null);
      setCurrentStep(null);
      setIsPaused(false);
      setShowResumePrompt(false);

      // Refresh tour status
      await checkTourStatus();

      toast.info('Tour skipped.');
    } catch (err: any) {
      logger.error('Error skipping tour:', err);
      toast.error('Failed to skip tour');
    } finally {
      setIsLoading(false);
    }
  }, [tourProgress, tourKey, isLoading, tourService, checkTourStatus]);

  // Dismiss tour
  const dismissTour = useCallback(async () => {
    if (!tourProgress?.tourId || !tourKey) return;

    try {
      setIsLoading(true);
      await tourService.dismissTour(tourProgress.tourId);

      setTourProgress(null);
      setCurrentStep(null);
      setIsPaused(false);
      setShowResumePrompt(false);

      // Refresh tour status
      await checkTourStatus();

      toast.info('Tour dismissed.');
    } catch (err: any) {
      logger.error('Error dismissing tour:', err);
      toast.error('Failed to dismiss tour');
    } finally {
      setIsLoading(false);
    }
  }, [tourProgress, tourKey, tourService, checkTourStatus]);

  // Pause tour (when user clicks outside)
  const pauseTour = useCallback(() => {
    if (!isActive) return;
    nextStep();
    setIsPaused(true);
    setShowResumePrompt(true);
  }, [isActive]);

  // Resume tour
  const resumeTour = useCallback(() => {
    setIsPaused(false);
    setShowResumePrompt(false);
  }, []);

  // Reset tour
  const resetTour = useCallback(async () => {
    if (!tourKey) return;

    try {
      setIsLoading(true);

      // Reset progress
      if (tourProgress?.tourId) {
        await tourService.resetTour(tourProgress.tourId);
      }

      setTourProgress(null);
      setCurrentStep(null);
      setIsPaused(false);
      setShowResumePrompt(false);

      // Refresh tour status
      await checkTourStatus();

      // Restart tour
      setTimeout(() => {
        startTour();
      }, 500);

      toast.success('Tour reset and restarted!');
    } catch (err: any) {
      logger.error('Error resetting tour:', err);
      toast.error('Failed to reset tour');
    } finally {
      setIsLoading(false);
    }
  }, [tourKey, tourProgress, startTour, tourService, checkTourStatus]);

  // Enhanced auto-start logic
  const attemptAutoStart = useCallback(() => {
    if (
      !autoStart ||
      !shouldShowTour ||
      tourProgress ||
      isLoading ||
      isStartingTour ||
      error ||
      !tourDefinition
    ) {
      return false;
    }

    logger.info('Attempting auto-start of tour:', {
      tourKey,
    });

    return true;
  }, [
    autoStart,
    shouldShowTour,
    tourProgress,
    isLoading,
    isStartingTour,
    error,
    tourDefinition,
    tourKey,
  ]);

  // Load tour definition when tourKey changes
  useEffect(() => {
    loadTourDefinition();
  }, [loadTourDefinition]);

  // Check tour status when tourKey or user changes
  useEffect(() => {
    if (tourKey && user) {
      checkTourStatus();
    } else {
      setTourStatus(null);
      setTourProgress(null);
    }
  }, [tourKey, user, checkTourStatus]);

  // Load current step when tour progress or definition changes
  useEffect(() => {
    loadCurrentStep();
  }, [loadCurrentStep]);

  // Enhanced auto-start tour with better timing and retry logic
  useEffect(() => {
    // Clear any existing timeouts
    if (autoStartTimeoutRef.current) {
      clearTimeout(autoStartTimeoutRef.current);
    }

    if (attemptAutoStart()) {
      // Progressive delay based on page complexity
      const delay = AUTO_START_DELAY;

      autoStartTimeoutRef.current = setTimeout(() => {
        if (attemptAutoStart()) {
          startTour();
        }
      }, delay);

      return () => {
        if (autoStartTimeoutRef.current) {
          clearTimeout(autoStartTimeoutRef.current);
        }
      };
    }
  }, [
    autoStart,
    shouldShowTour,
    tourProgress,
    isLoading,
    isStartingTour,
    error,
    tourDefinition,
    attemptAutoStart,
    startTour,
  ]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (autoStartTimeoutRef.current) {
        clearTimeout(autoStartTimeoutRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  return {
    // Current state
    tourDefinition,
    tourProgress,
    currentStep,
    isActive,
    isLoading,
    error,
    isPaused,
    tourStatus,

    // Computed states
    shouldShowTour,
    shouldShowResumePrompt,
    isTourCompleted,
    isTourDismissed,
    progress,
    tourKey,

    // Actions
    startTour,
    completeTour,
    nextStep,
    previousStep,
    skipStep,
    skipTour,
    dismissTour,
    resetTour,
    pauseTour,
    resumeTour,
    checkTourStatus,

    // Configuration
    showProgress,
  };
}

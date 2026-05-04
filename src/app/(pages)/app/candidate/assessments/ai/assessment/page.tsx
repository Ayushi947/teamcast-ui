'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState, Suspense } from 'react';
import { AIAvatar } from '@/components/app/common/animations/ai-avatar';
import { WelcomeScreen } from './components/welcome-screen';
import { MultipleChoiceAnswer } from './components/question-types/multiple-choice-answer';
import { BooleanAnswer } from './components/question-types/boolean-answer';
import { CodeAnswer } from './components/question-types/code-answer';
import { logger } from '@/lib/logger';
import { toast } from 'sonner';
import { ENV } from '@/lib/env';
import {
  activityLogService,
  candidateJobAiAssessmentService,
  voiceService,
} from '@/lib/services/services';
import { Clock, CheckCircle2, ThumbsUp, Mic, Power } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  ActivityEntityTypeEnum,
  ActivityModuleEnum,
  ICandidateJobAiAssessment,
  ICandidateJobAiAssessmentQuestion,
  ICandidateJobAiAssessmentSection,
  IVoiceSynthesizeRequest,
  JobAiAssessmentStatusEnum,
} from '@/lib/shared';
import { ActivityActionEnums, ActivityTitleEnum } from '@/lib/models/activity';
import { useApp } from '@/lib/context/app-context';
import { useLiveAssessmentAnalyticsService } from '@/lib/hooks/convex-live-assessments/live-assessment-analytics-hook';
import { FaceDetectionOverlay } from './components/face-detection-overlay';
import { useStreamingSTT } from '@/lib/hooks/useStreamingSTT';

type SpeechRecognitionWindow = Window & {
  webkitSpeechRecognition?: typeof SpeechRecognition;
  SpeechRecognition?: typeof SpeechRecognition;
};

// Import voice utilities
import { getVoiceConfig } from '@/lib/utils/voice-utils';

declare global {
  interface Window {
    Sentry?: {
      captureMessage?: (
        message: string,
        captureContext?: {
          level?:
            | 'fatal'
            | 'error'
            | 'warning'
            | 'log'
            | 'info'
            | 'debug'
            | 'critical';
          extra?: Record<string, unknown>;
          tags?: Record<string, string>;
        }
      ) => void;
      addBreadcrumb?: (breadcrumb: {
        category?: string;
        message?: string;
        level?: 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug';
        data?: Record<string, unknown>;
      }) => void;
    };
  }
}

type TextCtaTelemetryPhase = 'before' | 'after';
type FrequencyDataArray = Uint8Array<ArrayBuffer>;

const InterviewPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const assessmentId = searchParams.get('id');
  const { user } = useApp();
  const candidateId = user?.candidateId;
  const candidateName = user?.name;

  // Set the system is initialized to false
  const [systemInitialized, setSystemInitialized] = useState(false);
  const [assessment, setAssessment] =
    useState<ICandidateJobAiAssessment | null>(null);
  const [currentQuestion, setCurrentQuestion] =
    useState<ICandidateJobAiAssessmentQuestion | null>(null);

  // Settings for video recording and proctoring
  const [videoRecordingEnabled, setVideoRecordingEnabled] = useState(false);
  const [proctoringEnabled, setProctoringEnabled] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [code, setCode] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [isInterviewComplete, setIsInterviewComplete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isTimeWarning, setIsTimeWarning] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [windowBlurCount, setWindowBlurCount] = useState(0);
  const [isAssessmentSubmitted, setIsAssessmentSubmitted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showEndAssessmentDialog, setShowEndAssessmentDialog] = useState(false);
  const [isMicEnabled, _setIsMicEnabled] = useState(true); // Track microphone enabled state

  const streamingSttAvailable = Boolean(ENV.NEXT_PUBLIC_WS_URL);
  const [speechMode, setSpeechMode] = useState<'streaming' | 'browser'>(
    streamingSttAvailable ? 'streaming' : 'browser'
  );
  const [listeningMode, setListeningMode] = useState<
    'streaming' | 'browser' | null
  >(null);
  const speechRecognitionRef = useRef<SpeechRecognition | null>(null);
  const shouldKeepListeningRef = useRef(false);
  const accumulatedTranscriptRef = useRef('');

  // Video chunk tracking - use ref to avoid stale closures in MediaRecorder callback
  const currentChunkIndexRef = useRef(0);
  const currentQuestionIdRef = useRef<string | undefined>(undefined);
  const currentSectionIdRef = useRef<string | undefined>(undefined);

  // Audio context for system audio capture
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const systemAudioSourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  // NEW: Streaming STT using Google Cloud Speech-to-Text
  const {
    isConnected: sttConnected,
    isListening: sttListening,
    transcript: streamingTranscript,
    startListening: startStreamingSTT,
    stopListening: stopStreamingSTT,
    resetTranscript: resetStreamingTranscript,
  } = useStreamingSTT({
    assessmentId: assessmentId || '',
    minConfidence: 0.6, // Accept 60%+ confidence - Google STT typical range is 0.6-0.9
    minStability: 0.8, // Show interim results with 80%+ stability
    enabled: speechMode === 'streaming',
    isMicEnabled: isMicEnabled,
    suppressMicWarnings: true, // Suppress mic warnings since UI toggle is removed
    onTranscript: (result) => {
      logger.debug('Transcript received from streaming STT', {
        isFinal: result.isFinal,
        confidence: result.confidence,
        text: result.transcript,
      });
    },
    onError: (error) => {
      logger.error('Streaming STT error:', error);
      if (speechMode === 'streaming') {
        toast.warning(
          'Streaming speech recognition is unavailable. Switching to browser speech recognition.',
          { duration: 4000 }
        );
        setSpeechMode('browser');
      }
    },
  });

  // Speech recognition (using streaming STT state)
  const [transcript, setTranscript] = useState('');
  const [hasUserSpoken, setHasUserSpoken] = useState(false);

  // Sync streaming transcript to local state
  useEffect(() => {
    if (speechMode !== 'streaming') {
      return;
    }

    if (streamingTranscript) {
      setTranscript(streamingTranscript);
      logger.info('✅ Transcript updated from streaming STT', {
        length: streamingTranscript.length,
        preview: streamingTranscript.substring(0, 100),
        questionId: currentQuestion?.id,
      });
    }
  }, [streamingTranscript, currentQuestion?.id, speechMode]);

  // Set hasUserSpoken when transcript has content
  useEffect(() => {
    if (transcript.length > 0 && !hasUserSpoken) {
      setHasUserSpoken(true);
    }
  }, [transcript]);

  const initializeBrowserSpeechRecognition = useCallback(() => {
    if (typeof window === 'undefined' || speechRecognitionRef.current) {
      return;
    }

    const speechWindow = window as SpeechRecognitionWindow;
    const SpeechRecognitionClass =
      speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      logger.warn('Browser speech recognition not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognitionClass();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const currentResult = event.results[event.resultIndex];
      if (!currentResult || !currentResult[0]) {
        return;
      }

      const text = currentResult[0].transcript ?? '';
      if (!text) {
        return;
      }

      if (currentResult.isFinal) {
        accumulatedTranscriptRef.current =
          `${accumulatedTranscriptRef.current} ${text}`.trim();
        setTranscript(accumulatedTranscriptRef.current);
      } else {
        setTranscript(`${accumulatedTranscriptRef.current} ${text}`.trim());
      }
    };

    recognition.onerror = (event: any) => {
      logger.error('Browser speech recognition error:', event?.error);
      if (shouldKeepListeningRef.current) {
        setTimeout(() => {
          try {
            recognition.start();
          } catch (err) {
            logger.error('Failed to restart browser speech recognition:', err);
            shouldKeepListeningRef.current = false;
            setIsListening(false);
          }
        }, 300);
      } else {
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      if (shouldKeepListeningRef.current) {
        try {
          recognition.start();
        } catch (err) {
          logger.error('Failed to restart browser speech recognition:', err);
          shouldKeepListeningRef.current = false;
          setIsListening(false);
        }
      } else {
        setIsListening(false);
      }
    };

    speechRecognitionRef.current = recognition;
    logger.info('Browser speech recognition initialized');
  }, []);

  const startBrowserSpeechRecognition = useCallback(async () => {
    // Don't start if microphone is disabled
    if (!isMicEnabled) {
      logger.warn(
        'Cannot start browser speech recognition - microphone is disabled'
      );
      return;
    }

    initializeBrowserSpeechRecognition();

    if (!speechRecognitionRef.current) {
      toast.error(
        'Speech recognition is not supported in this browser. Please type your answer.',
        { duration: 4000 }
      );
      return;
    }

    try {
      shouldKeepListeningRef.current = true;
      accumulatedTranscriptRef.current = '';
      setTranscript('');
      speechRecognitionRef.current.start();
      setIsListening(true);
      setListeningMode('browser');
      logger.info('Browser speech recognition started');
    } catch (error) {
      logger.error('Failed to start browser speech recognition:', error);
      shouldKeepListeningRef.current = false;
      toast.error('Unable to start speech recognition. Please try again.');
    }
  }, [initializeBrowserSpeechRecognition, isMicEnabled]);

  const stopBrowserSpeechRecognition = useCallback(() => {
    shouldKeepListeningRef.current = false;
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (error) {
        logger.error('Error stopping browser speech recognition:', error);
      }
    }
    setIsListening(false);
    setListeningMode((mode) => (mode === 'browser' ? null : mode));
  }, []);

  const minTextAnswerLength = ENV.NEXT_PUBLIC_MIN_TEXT_ANSWER_LENGTH;
  const canSubmitTextAnswer =
    hasUserSpoken && transcript.length >= minTextAnswerLength;

  // Log when button state changes
  useEffect(() => {
    logger.info('🔘 Submit button state changed', {
      canSubmit: canSubmitTextAnswer,
      transcriptLength: transcript.length,
      minRequired: minTextAnswerLength,
      hasUserSpoken,
      isProcessing,
      questionId: currentQuestion?.id,
      buttonDisabled: isProcessing || !canSubmitTextAnswer,
    });
  }, [
    canSubmitTextAnswer,
    transcript.length,
    minTextAnswerLength,
    hasUserSpoken,
    isProcessing,
    currentQuestion?.id,
  ]);

  const logTextCtaTelemetry = useCallback(
    (phase: TextCtaTelemetryPhase, metadata: Record<string, unknown>) => {
      const message = `[TEXT_CTA_${phase.toUpperCase()}] Done answering? Tap to continue.`;

      if (typeof window !== 'undefined') {
        try {
          window.Sentry?.captureMessage?.(message, {
            level: 'info',
            extra: metadata,
          });
          window.Sentry?.addBreadcrumb?.({
            category: 'assessment-text-cta',
            message,
            level: 'info',
            data: metadata,
          });
        } catch (error) {
          logger.error('Failed to report CTA telemetry to Sentry', error);
        }
      }

      logger.info(message, metadata);
    },
    []
  );

  // Audio analysis for microphone visualization
  const audioContextAnalysisRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<FrequencyDataArray | null>(null);
  const microphoneStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const textCtaVisibilityLoggedRef = useRef(false);
  const isListeningRef = useRef(false);

  const [audioLevel, setAudioLevel] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);

  // Video recording
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const videoStreamRef = useRef<MediaStream | null>(null); // To store the displayMediaStream
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // Live assessment analytics service
  const liveAssessmentAnalyticsService = useLiveAssessmentAnalyticsService();

  // Set the global error handler
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Set up global error handler to suppress MediaPipe informational messages
      const originalErrorHandler = window.onerror;

      const handleError = (
        message: string | Event,
        source?: string,
        lineno?: number,
        colno?: number,
        error?: Error
      ): boolean => {
        // Suppress TensorFlow Lite informational messages
        if (
          typeof message === 'string' &&
          (message.includes('TensorFlow Lite') ||
            message.includes('XNNPACK delegate') ||
            message.includes('INFO:'))
        ) {
          return true; // Prevent default error handling
        }

        // Call original handler for real errors
        if (originalErrorHandler) {
          return originalErrorHandler(message, source, lineno, colno, error);
        }
        return false;
      };

      const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
        // Suppress MediaPipe-related promise rejections that are informational
        if (
          event.reason &&
          typeof event.reason === 'string' &&
          (event.reason.includes('TensorFlow Lite') ||
            event.reason.includes('XNNPACK delegate'))
        ) {
          event.preventDefault();
          return;
        }
      };

      window.onerror = handleError;
      window.addEventListener('unhandledrejection', handleUnhandledRejection);

      // Cleanup function to restore original error handlers
      return () => {
        window.onerror = originalErrorHandler;
        window.removeEventListener(
          'unhandledrejection',
          handleUnhandledRejection
        );
      };
    }
  });

  // Initialize everything
  useEffect(() => {
    if (systemInitialized) {
      logger.info('System already initialized');
      return;
    }

    if (typeof window !== 'undefined') {
      // Initialize audio context for system audio capture
      initializeAudio();

      // OLD: Browser speech recognition - DISABLED (using streaming STT now)
      // initializeSpeechRecognition();
      // NEW: Using Google Cloud Streaming STT via useStreamingSTT hook

      // DON'T initialize media streams here - wait for assessment settings

      // Set system initialized to true
      setSystemInitialized(true);

      // Cleanup function to restore original error handlers
      return () => {
        logger.info('Cleaning up system');
      };
    }
  }, [systemInitialized]);

  // Initialize media streams only when needed for video recording
  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const initVideoRecording = async () => {
      if (!isStarted || !videoRecordingEnabled) {
        logger.info(
          'Video recording not needed, skipping media initialization'
        );
        return;
      }

      if (isAudioInitialized) {
        logger.info('Media streams already initialized');
        return;
      }

      try {
        await initializeMediaStreams();

        // Set up cleanup function
        cleanup = () => {
          cleanupMediaStreams();
        };
      } catch (error) {
        logger.error('Failed to initialize video recording:', error);
      }
    };

    initVideoRecording();

    return cleanup;
  }, [isStarted, videoRecordingEnabled]);

  // Fetch assessment
  useEffect(() => {
    const fetchAssessment = async () => {
      if (!assessmentId) {
        // Assessment is not in progress, redirect to check page
        logger.info('Assessment not in progress, redirecting to dashboard');
        router.replace('/app/candidate/dashboard');
        return;
      }

      try {
        const assessment =
          await candidateJobAiAssessmentService.getAssessment(assessmentId);
        logger.info('Assessment status:', assessment?.status);

        if (assessment?.status !== 'CANDIDATE_ASSESSMENT_IN_PROGRESS') {
          // Assessment is not in progress, redirect to check page
          logger.info('Assessment not in progress, redirecting to dashboard');
          router.replace('/app/candidate/dashboard');
          return;
        }
        // Initialize everything on assessment load
        setTimeRemaining(assessment.duration || 0);
        setTabSwitchCount(assessment.proctoring?.tabSwitches || 0);
        setWindowBlurCount(assessment.proctoring?.tabSwitches || 0);
        setVideoRecordingEnabled(
          assessment.jobAiAssessmentSettings?.videoRecordingEnabled || false
        );
        const proctoring =
          assessment.jobAiAssessmentSettings?.proctoringEnabled || false;
        setProctoringEnabled(proctoring);
        logger.info('Proctoring settings loaded', {
          proctoringEnabled: proctoring,
          videoRecordingEnabled:
            assessment.jobAiAssessmentSettings?.videoRecordingEnabled || false,
        });

        const firstQuestion = getQuestionOnLoad();
        if (firstQuestion) {
          setCurrentQuestion(firstQuestion);
          await speakQuestion(firstQuestion);
        }

        // Initialize chunk index from server to handle page refresh correctly
        try {
          const response = await candidateJobAiAssessmentService.getVideoChunks(
            assessmentId,
            {
              includePlaybackUrls: false,
            }
          );

          const chunks = response.chunks || [];

          if (chunks.length > 0) {
            // Find the highest chunk index and set next index
            const maxChunkIndex = Math.max(
              ...chunks.map((c: { chunkIndex: number }) => c.chunkIndex)
            );
            currentChunkIndexRef.current = maxChunkIndex + 1;

            logger.info('Restored chunk index from server', {
              chunksCount: chunks.length,
              maxChunkIndex,
              nextChunkIndex: currentChunkIndexRef.current,
            });
          } else {
            logger.info('No existing chunks, starting from index 0');
            currentChunkIndexRef.current = 0;
          }
        } catch (error) {
          logger.warn(
            'Failed to fetch existing chunks, starting from index 0',
            {
              error: error instanceof Error ? error.message : 'Unknown error',
            }
          );
          currentChunkIndexRef.current = 0;
        }

        setAssessment(assessment);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('Failed to fetch assessment')
        );
        logger.error('Error fetching assessment:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssessment();
  }, [assessmentId, router]);

  // Initialize timer when assessment starts
  useEffect(() => {
    if (!assessment || !isStarted || isInterviewComplete) {
      logger.debug('Timer not started:', {
        hasAssessmentId: !!assessment?.id,
        isStarted,
        isInterviewComplete,
      });
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleInterviewComplete();
          return 0;
        }
        if (prev % ENV.NEXT_PUBLIC_ASSESSMENT_HEARTBEAT_INTERVAL === 0) {
          sendHeartbeat(assessment.id, prev - 1);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isStarted]);

  // Handle time warning states
  useEffect(() => {
    if (timeRemaining <= ENV.NEXT_PUBLIC_ASSESSMENT_TIME_WARNING_THRESHOLD) {
      setIsTimeWarning(true);
    } else {
      setIsTimeWarning(false);
    }
  }, [timeRemaining]);

  // Handle tab visibility changes and window blur for proctoring
  useEffect(() => {
    if (!isStarted || isInterviewComplete) return;

    const tabSwitchLimit = assessment?.jobAiAssessmentSettings?.tabSwitchLimit;
    let isHandlingViolation = false;

    const handleVisibilityChange = async () => {
      // Handles tab switch and minimize
      if (document.hidden && !isHandlingViolation) {
        isHandlingViolation = true;
        try {
          // Report proctoring violation if enabled (but don't stop video streaming)
          if (proctoringEnabled) {
            const newCount = tabSwitchCount + 1;
            setTabSwitchCount(newCount);
            // Report violation to backend
            await candidateJobAiAssessmentService.proctor(
              assessment?.id || '',
              'TAB_SWITCHED'
            );

            // Always show toast notification for violation
            if (tabSwitchLimit) {
              if (newCount >= tabSwitchLimit) {
                // Auto-submit on last violation
                toast.error(
                  `Tab switching detected (${newCount}/${tabSwitchLimit}). Maximum tab switches exceeded. Assessment will be submitted automatically.`
                );
                await handleInterviewComplete();
              } else {
                // Show warning with remaining violations and count
                toast.warning(
                  `Warning: Tab switching detected (${newCount}/${tabSwitchLimit}). ${tabSwitchLimit - newCount} more violations will result in automatic submission.`
                );
              }
            } else {
              // Show warning even if no limit is set
              toast.warning(
                `Tab switching detected (${newCount}). This violation has been logged.`
              );
            }
          }
        } catch (error) {
          logger.error('Error reporting proctoring violation:', error);
          // Show toast even on error with count
          const errorCount = tabSwitchCount + 1;
          if (tabSwitchLimit) {
            toast.warning(
              `Tab switching detected (${errorCount}/${tabSwitchLimit}). This violation has been logged.`
            );
          } else {
            toast.warning(
              `Tab switching detected (${errorCount}). This violation has been logged.`
            );
          }
          // Even if proctoring fails, we should still submit if limit is reached
          if (
            proctoringEnabled &&
            tabSwitchLimit &&
            tabSwitchCount + 1 >= tabSwitchLimit
          ) {
            await handleInterviewComplete();
          }
        } finally {
          isHandlingViolation = false;
        }
      }
    };

    const handleWindowBlur = async () => {
      // Handles window switch, browser switch, and out of focus
      // When window loses focus (user switches to another app/window)
      // Note: Video streaming continues even when window loses focus
      // Window blur has a separate limit of 3 violations
      const WINDOW_BLUR_LIMIT =
        assessment?.jobAiAssessmentSettings?.tabSwitchLimit || 3;

      if (!isHandlingViolation) {
        isHandlingViolation = true;
        try {
          // Report proctoring violation if enabled (but don't stop video streaming)
          if (proctoringEnabled) {
            const newCount = windowBlurCount + 1;
            setWindowBlurCount(newCount);
            // Report violation to backend
            await candidateJobAiAssessmentService.proctor(
              assessment?.id || '',
              'WINDOW_BLUR'
            );

            // Always show toast notification for violation
            if (newCount >= WINDOW_BLUR_LIMIT) {
              // Auto-submit on last violation
              toast.error(
                `Window focus lost detected (${newCount}/${WINDOW_BLUR_LIMIT}). Maximum window focus violations exceeded. Assessment will be submitted automatically.`
              );
              await handleInterviewComplete();
            } else {
              // Show warning with remaining violations and count
              toast.warning(
                `Warning: Window focus lost detected (${newCount}/${WINDOW_BLUR_LIMIT}). ${WINDOW_BLUR_LIMIT - newCount} more violations will result in automatic submission.`
              );
            }
          }
        } catch (error) {
          logger.error('Error reporting proctoring violation:', error);
          // Show toast even on error with count
          const errorCount = windowBlurCount + 1;
          if (errorCount >= WINDOW_BLUR_LIMIT) {
            toast.error(
              `Window focus lost detected (${errorCount}/${WINDOW_BLUR_LIMIT}). Maximum window focus violations exceeded. Assessment will be submitted automatically.`
            );
            await handleInterviewComplete();
          } else {
            toast.warning(
              `Window focus lost detected (${errorCount}/${WINDOW_BLUR_LIMIT}). This violation has been logged.`
            );
          }
        } finally {
          isHandlingViolation = false;
        }
      }
    };

    // Add visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange);
    // Add window blur listener
    window.addEventListener('blur', handleWindowBlur);

    // Cleanup function to remove event listeners
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [
    isStarted,
    isInterviewComplete,
    assessment?.id,
    proctoringEnabled,
    assessment?.jobAiAssessmentSettings?.tabSwitchLimit,
    tabSwitchCount,
    windowBlurCount,
    videoRecordingEnabled,
  ]);

  // NEW: Copy-paste detection for CODE questions
  useEffect(() => {
    if (
      !isStarted ||
      !proctoringEnabled ||
      currentQuestion?.questionType !== 'CODE'
    ) {
      return;
    }

    const handlePaste = async (e: ClipboardEvent) => {
      const pastedText = e.clipboardData?.getData('text') || '';

      // Only report significant pastes (more than 50 characters)
      if (pastedText.length > 50) {
        logger.warn('Copy-paste detected in CODE question', {
          assessmentId: assessment?.id,
          questionId: currentQuestion?.id,
          pastedLength: pastedText.length,
        });

        try {
          await candidateJobAiAssessmentService.proctor(
            assessment?.id || '',
            'COPY_PASTE'
          );

          toast.warning('Copy-paste detected. This has been logged.', {
            duration: 4000,
          });
        } catch (error) {
          logger.error('Error reporting copy-paste violation:', error);
        }
      }
    };

    document.addEventListener('paste', handlePaste);

    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [isStarted, proctoringEnabled, currentQuestion, assessment?.id]);

  // Reset form state when question changes
  useEffect(() => {
    if (!currentQuestion) return;

    // Update current question ID and section ID refs for video chunk tracking
    currentQuestionIdRef.current = currentQuestion.id;
    currentSectionIdRef.current = currentQuestion.sectionId;

    // Reset form fields when question changes
    setCode('');
    setSelectedOption(null);
    setTranscript('');
    setHasUserSpoken(false);
    resetStreamingTranscript();
    setIsProcessing(false);
  }, [currentQuestion?.id]);

  // Redirect to check page if user refreshes during interview
  useEffect(() => {
    // Check if this is a page refresh by looking for sessionStorage flag
    const hasStartedBefore = sessionStorage.getItem(
      `teamcast-job-ai-assessment-${assessmentId}-started`
    );

    if (hasStartedBefore === 'true' && !isStarted) {
      // User refreshed the page during an interview, redirect to check page
      logger.info('User refreshed during interview, redirecting to check page');
      router.replace('/app/candidate/assessments/ai/check');
      return;
    }
  }, [assessmentId, isStarted, router]);

  // Cleanup sessionStorage flag on component unmount
  useEffect(() => {
    return () => {
      // Clear sessionStorage flag when component unmounts
      if (assessmentId) {
        sessionStorage.removeItem(
          `teamcast-job-ai-assessment-${assessmentId}-started`
        );
      }
    };
  }, [assessmentId]);

  // Initialize audio context for system audio capture
  const initializeAudio = () => {
    if (systemInitialized) {
      logger.info('Audio context already initialized');
      return;
    }

    try {
      // Create the audio context
      audioContextRef.current = new AudioContext();

      if (!audioContextRef.current) {
        throw new Error('Audio context not initialized');
      }

      // Create the audio element
      audioRef.current = new Audio();

      if (!audioRef.current) {
        throw new Error('Audio element not initialized');
      }

      audioRef.current.onended = () => {
        logger.info('Audio ended');
        setIsSpeaking(false);
      };

      audioRef.current.onerror = (error) => {
        logger.error('Audio playback error:', error);
        setIsSpeaking(false);
      };
    } catch (error) {
      logger.error('Failed to initialize audio context:', error);
    }
  };

  // Initialize microphone for audio visualization
  const initializeMediaStreams = async () => {
    logger.info('Initializing media streams for video recording');

    try {
      // Single getUserMedia call for both video and audio
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: ENV.NEXT_PUBLIC_VIDEO_WIDTH },
          height: { ideal: ENV.NEXT_PUBLIC_VIDEO_HEIGHT },
          frameRate: { ideal: ENV.NEXT_PUBLIC_VIDEO_FRAME_RATE },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      // Store the main stream
      videoStreamRef.current = stream;
      microphoneStreamRef.current = stream; // Reuse same stream

      // Set video element source and wait for it to be ready
      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        // Wait for video to be ready before proceeding
        await new Promise<void>((resolve, reject) => {
          if (!videoRef.current) {
            reject(new Error('Video element not found'));
            return;
          }

          const handleLoadedMetadata = () => {
            logger.info('Video metadata loaded, video is ready');
            resolve();
          };

          const handleError = (error: Event) => {
            logger.error('Video loading error:', error);
            reject(new Error('Video failed to load'));
          };

          videoRef.current.addEventListener(
            'loadedmetadata',
            handleLoadedMetadata,
            { once: true }
          );
          videoRef.current.addEventListener('error', handleError, {
            once: true,
          });

          // Fallback timeout
          setTimeout(() => {
            if (videoRef.current && videoRef.current.readyState >= 2) {
              resolve();
            } else {
              reject(new Error('Video loading timeout'));
            }
          }, 5000);
        });
      }

      // Set up audio analysis using the same stream
      setupAudioAnalysis(stream);

      // Set up MediaRecorder with mixed audio
      setupMediaRecorder(stream);

      // Start recording immediately after setup
      await startVideoRecordingImmediate();

      setIsAudioInitialized(true);
      logger.info(
        'Media streams initialized and recording started successfully'
      );
    } catch (error) {
      logger.error('Failed to initialize media streams:', error);
      setIsAudioInitialized(false);

      // Show user-friendly error message
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          toast.error(
            'Camera and microphone access denied. Please enable permissions for video recording and audio visualization.'
          );
        } else if (error.name === 'NotFoundError') {
          toast.error(
            'No camera or microphone found. Video recording and audio visualization will not be available.'
          );
        } else {
          logger.error('Media initialization failed:', error);
          toast.error(
            'Failed to initialize camera and microphone. Please refresh and try again.'
          );
        }
      } else {
        logger.error('Media initialization failed with unknown error:', error);
        toast.error(
          'Failed to initialize camera and microphone. Please refresh and try again.'
        );
      }
    }
  };

  // Cleanup media streams
  const cleanupMediaStreams = () => {
    logger.info('Cleaning up media streams');

    // Stop all tracks
    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach((track) => {
        track.stop();
        logger.info(`Stopped ${track.kind} track`);
      });
      videoStreamRef.current = null;
    }

    if (
      microphoneStreamRef.current &&
      microphoneStreamRef.current !== videoStreamRef.current
    ) {
      microphoneStreamRef.current.getTracks().forEach((track) => track.stop());
      microphoneStreamRef.current = null;
    }

    // Clean up video element
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    // Clean up MediaRecorder
    if (mediaRecorderRef.current) {
      if (mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      mediaRecorderRef.current = null;
    }

    // Clean up system audio source
    if (systemAudioSourceRef.current) {
      systemAudioSourceRef.current.disconnect();
      systemAudioSourceRef.current = null;
    }

    // Clean up audio contexts
    if (audioContextAnalysisRef.current) {
      audioContextAnalysisRef.current.close();
      audioContextAnalysisRef.current = null;
    }

    // Note: Don't close audioContextRef.current as it's needed for AI speech playback

    // Reset states
    setIsRecording(false);
    setIsAudioInitialized(false);

    logger.info('Media streams cleanup completed');
  };

  // Set up audio analysis
  const setupAudioAnalysis = (stream: MediaStream) => {
    try {
      audioContextAnalysisRef.current = new AudioContext();

      if (!audioContextAnalysisRef.current) {
        throw new Error('Audio context not initialized');
      }

      // Create audio analysis nodes
      const source =
        audioContextAnalysisRef.current.createMediaStreamSource(stream);
      const analyser = audioContextAnalysisRef.current.createAnalyser();

      // Configure analyser for better audio visualization
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;
      analyser.minDecibels = -90;
      analyser.maxDecibels = -10;

      source.connect(analyser);
      analyserRef.current = analyser;

      // Create data array for frequency analysis
      const bufferLength = analyser.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength) as FrequencyDataArray;

      logger.info('Audio analysis setup completed');
    } catch (error) {
      logger.error('Failed to setup audio analysis:', error);
    }
  };

  // Set up MediaRecorder with mixed audio
  const setupMediaRecorder = (stream: MediaStream) => {
    try {
      let recordingStream = stream;

      // If we have an audio context and audio element, create mixed stream
      if (audioContextRef.current && audioRef.current) {
        recordingStream = createMixedAudioStream(stream);
      }

      const mediaRecorder = new MediaRecorder(recordingStream, {
        mimeType: 'video/webm;codecs=vp8,opus',
        videoBitsPerSecond: 250000,
      });

      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          await uploadChunk(event.data);
        }
      };

      mediaRecorder.onerror = (error) => {
        logger.error('MediaRecorder error:', error);
      };

      mediaRecorderRef.current = mediaRecorder;
      logger.info('MediaRecorder setup completed with mixed audio');
    } catch (error) {
      logger.error('Failed to setup MediaRecorder:', error);
    }
  };

  // Create mixed audio stream combining microphone and AI speech
  const createMixedAudioStream = (videoStream: MediaStream): MediaStream => {
    try {
      if (!audioContextRef.current || !audioRef.current) {
        logger.warn(
          'Audio context or audio element not available, using original stream'
        );
        return videoStream;
      }

      logger.info('Creating mixed audio stream with AI speech capture');

      // Get microphone audio track from video stream
      const microphoneTrack = videoStream.getAudioTracks()[0];
      if (!microphoneTrack) {
        logger.warn('No microphone track found in video stream');
        return videoStream;
      }

      // Create microphone audio source
      const microphoneSource = audioContextRef.current.createMediaStreamSource(
        new MediaStream([microphoneTrack])
      );

      // Create gain nodes for volume control
      const microphoneGain = audioContextRef.current.createGain();
      const systemGain = audioContextRef.current.createGain();

      // Set volume levels
      microphoneGain.gain.value = 0.8; // Slightly reduce microphone volume
      systemGain.gain.value = 1.0; // Full AI speech volume

      // Create a merger to combine both audio sources
      const audioMerger = audioContextRef.current.createChannelMerger(2);

      // Connect microphone to merger (left channel)
      microphoneSource.connect(microphoneGain);
      microphoneGain.connect(audioMerger, 0, 0);

      // Prepare for system audio, but don't require it immediately
      // The system audio source will be connected later when AI speech plays

      // Create destination stream
      const destination =
        audioContextRef.current.createMediaStreamDestination();

      // Connect merged audio to destination
      audioMerger.connect(destination);

      // Try to create and connect system audio source if not already done
      try {
        if (!systemAudioSourceRef.current) {
          systemAudioSourceRef.current =
            audioContextRef.current.createMediaElementSource(audioRef.current);
          // Reconnect to destination so user can hear AI speech
          systemAudioSourceRef.current.connect(
            audioContextRef.current.destination
          );
          logger.info('System audio source created during mixed stream setup');
        }

        // Connect system audio to merger (right channel)
        systemAudioSourceRef.current.connect(systemGain);
        systemGain.connect(audioMerger, 0, 1);
        logger.info('System audio connected to mixed stream');
      } catch (error) {
        logger.warn(
          'Could not connect system audio to mixed stream (will connect later):',
          error
        );
        // This is fine - system audio will be connected when AI first speaks
      }

      // Get video track from original stream
      const videoTrack = videoStream.getVideoTracks()[0];
      if (!videoTrack) {
        logger.warn('No video track found in video stream');
        return videoStream;
      }

      // Create new stream with mixed audio and original video
      const mixedStream = new MediaStream([
        videoTrack,
        ...destination.stream.getAudioTracks(),
      ]);

      logger.info('Successfully created mixed audio stream', {
        originalTracks: videoStream.getTracks().length,
        mixedTracks: mixedStream.getTracks().length,
        audioTracks: mixedStream.getAudioTracks().length,
        videoTracks: mixedStream.getVideoTracks().length,
        systemAudioReady: !!systemAudioSourceRef.current,
      });

      return mixedStream;
    } catch (error) {
      logger.error('Error creating mixed audio stream:', error);
      logger.info('Falling back to original stream without AI speech capture');
      return videoStream; // Fallback to original stream
    }
  };

  // Real-time audio analysis
  const startAudioAnalysis = () => {
    if (!analyserRef.current || !dataArrayRef.current) {
      logger.warn(
        'Cannot start audio analysis - analyser or data array not ready'
      );
      return;
    }

    logger.info('Starting audio analysis');

    const analyzeAudio = () => {
      if (!analyserRef.current || !dataArrayRef.current || !isListening) {
        // Stop analysis when not listening
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        setAudioLevel(0);
        setPitch(0);
        logger.info('Audio analysis stopped', {
          audioLevel,
          pitch,
          isListening,
        });
        return;
      }

      try {
        // Get frequency data
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);

        // Calculate overall volume level (0-100)
        let sum = 0;
        for (let i = 0; i < dataArrayRef.current.length; i++) {
          sum += dataArrayRef.current[i];
        }
        const average = sum / dataArrayRef.current.length;
        const normalizedLevel = Math.min(100, (average / 255) * 100);

        // Calculate dominant frequency for pitch (simplified)
        let maxAmp = 0;
        let maxIndex = 0;

        // Focus on human speech frequency range (80Hz - 1000Hz)
        const sampleRate = audioContextRef.current?.sampleRate || 44100;
        const minIndex = Math.floor(
          (80 / (sampleRate / 2)) * dataArrayRef.current.length
        );
        const maxIndexRange = Math.floor(
          (1000 / (sampleRate / 2)) * dataArrayRef.current.length
        );

        for (let i = minIndex; i < maxIndexRange; i++) {
          if (dataArrayRef.current[i] > maxAmp) {
            maxAmp = dataArrayRef.current[i];
            maxIndex = i;
          }
        }

        // Convert index to frequency
        const frequency =
          (maxIndex / dataArrayRef.current.length) * (sampleRate / 2);
        const normalizedPitch = Math.min(100, (frequency / 500) * 100); // Normalize to 0-100

        // Smooth the values to prevent jittery animations
        setAudioLevel((prev) => prev * 0.7 + normalizedLevel * 0.3);
        setPitch((prev) => prev * 0.8 + normalizedPitch * 0.2);

        // Continue analysis
        animationFrameRef.current = requestAnimationFrame(analyzeAudio);
      } catch (error) {
        logger.error('Error in audio analysis:', error);
        // Stop analysis on error
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
      }
    };

    analyzeAudio();
  };

  // Define uploadChunk function at component level with useCallback
  const uploadChunk = async (chunk: Blob) => {
    if (!assessmentId) {
      logger.error('Assessment ID is not set');
      return;
    }

    // CRITICAL: Claim chunk index FIRST to prevent race conditions
    // MediaRecorder fires every 250ms, but upload takes 1-2s
    // Without this, multiple chunks read the same index before any increment
    const chunkIndex = currentChunkIndexRef.current;
    currentChunkIndexRef.current = chunkIndex + 1; // Increment immediately
    const questionId = currentQuestionIdRef.current;
    const sectionId = currentSectionIdRef.current;

    try {
      // Get presigned URL from backend with the chunk index
      // This prevents race conditions where multiple chunks request URLs simultaneously
      const response = await candidateJobAiAssessmentService.getPresignedUrl(
        assessmentId,
        chunkIndex
      );
      const { presignedUrl } = response;

      if (!presignedUrl) {
        throw new Error('Failed to get presigned URL');
      }

      // Extract GCS URI from presigned URL
      const gcsUrl = new URL(presignedUrl);
      const pathParts = gcsUrl.pathname.split('/').filter(Boolean);
      const bucketName = pathParts[0];
      const filePath = pathParts.slice(1).join('/');
      const finalGcsUri = `gs://${bucketName}/${filePath}`;

      logger.info('Uploading video chunk to GCS', {
        chunkIndex,
        gcsUri: finalGcsUri,
        chunkSize: chunk.size,
        questionId,
        sectionId,
      });

      // Upload chunk to Google Cloud Storage
      const uploadResponse = await fetch(presignedUrl, {
        method: 'PUT',
        body: chunk,
        headers: {
          'Content-Type': 'video/webm;codecs=vp8,opus',
          Origin: window.location.origin,
          'Access-Control-Request-Method': 'PUT',
          'Access-Control-Request-Headers': 'Content-Type',
        },
        mode: 'cors',
        credentials: 'omit',
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed with status: ${uploadResponse.status}`);
      }

      logger.info('Chunk uploaded to GCS successfully', { chunkIndex });

      try {
        const recordResponse =
          await candidateJobAiAssessmentService.recordChunkUpload(
            assessmentId,
            chunkIndex,
            finalGcsUri,
            questionId, // Link chunk to current question
            sectionId // Link chunk to current section (for job AI assessments)
          );

        logger.info('Chunk recorded and analysis triggered', {
          chunkIndex,
          chunkId: recordResponse.chunkId,
          questionId,
          sectionId,
        });
      } catch (error) {
        logger.warn(
          'Recording chunk upload is not available. Continuing without analytics.',
          error
        );
      }
    } catch (error) {
      logger.error('Error uploading video chunk:', error);
      // NOTE: We already incremented the index, so this chunk index is lost on error
      // This is acceptable - failed chunks just leave gaps (0, 1, 3, 4... skipping 2)
    }
  };

  const startVideoRecordingImmediate = async () => {
    if (!mediaRecorderRef.current) {
      throw new Error('Media recorder not initialized');
    }

    if (mediaRecorderRef.current.state === 'recording') {
      logger.info('Video recording already started');
      return;
    }

    // Ensure video element is ready
    if (!videoRef.current || videoRef.current.readyState < 2) {
      throw new Error('Video element not ready for recording');
    }

    try {
      // Start recording immediately
      mediaRecorderRef.current.start();
      setIsRecording(true);
      logger.info('Video recording started successfully');

      // Set up chunking interval
      const interval = ENV.NEXT_PUBLIC_VIDEO_CHUNK_INTERVAL * 1000;
      const chunkInterval = setInterval(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.stop();
          setTimeout(() => {
            if (mediaRecorderRef.current?.state === 'inactive') {
              mediaRecorderRef.current?.start();
            }
          }, 100);
        }
      }, interval);

      // Store cleanup function for this interval
      if (mediaRecorderRef.current) {
        (mediaRecorderRef.current as any)._chunkInterval = chunkInterval;
      }
    } catch (error) {
      logger.error('Failed to start video recording:', error);
      throw error;
    }
  };

  // Start video recording
  useEffect(() => {
    // Remove this effect since recording now starts automatically in initializeMediaStreams
    return () => {
      // Cleanup interval on unmount
      if (
        mediaRecorderRef.current &&
        (mediaRecorderRef.current as any)._chunkInterval
      ) {
        clearInterval((mediaRecorderRef.current as any)._chunkInterval);
      }
    };
  }, []);

  // Start audio analysis
  useEffect(() => {
    if (isListening) {
      startAudioAnalysis();
    } else {
      // stopAudioAnalysis();
    }
  }, [isListening]);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    const shouldResetLogging =
      !currentQuestion ||
      currentQuestion.questionType !== 'TEXT' ||
      !isStarted ||
      isInterviewComplete ||
      !canSubmitTextAnswer;

    if (shouldResetLogging) {
      textCtaVisibilityLoggedRef.current = false;
      return;
    }

    if (textCtaVisibilityLoggedRef.current) {
      return;
    }

    textCtaVisibilityLoggedRef.current = true;

    const metadata = {
      assessmentId,
      questionId: currentQuestion.id,
      transcriptLength: transcript.length,
      minLength: minTextAnswerLength,
      platform:
        typeof navigator !== 'undefined' ? navigator.platform : 'unknown',
      userAgent:
        typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      timestamp: new Date().toISOString(),
    };

    logTextCtaTelemetry('before', metadata);

    const afterLog = () => {
      logTextCtaTelemetry('after', {
        ...metadata,
        afterFrame: true,
      });
    };

    if (typeof window !== 'undefined' && window.requestAnimationFrame) {
      const rafId = window.requestAnimationFrame(afterLog);
      return () => {
        window.cancelAnimationFrame(rafId);
      };
    }

    const timeoutId = setTimeout(afterLog, 0);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [
    assessmentId,
    canSubmitTextAnswer,
    currentQuestion,
    isInterviewComplete,
    isStarted,
    logTextCtaTelemetry,
    minTextAnswerLength,
    transcript.length,
  ]);

  // Component cleanup
  useEffect(() => {
    return () => {
      logger.info('Component unmounting, cleaning up all media resources');
      cleanupMediaStreams();
    };
  }, []);

  // Stop speaking
  const stopSpeaking = () => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;

        // Clear any event listeners to prevent memory leaks
        audioRef.current.onended = null;
        audioRef.current.onerror = null;
      }
      logger.debug('Speech stopped successfully');
    } catch (error) {
      logger.error('Error stopping speech:', error);
    }
  };

  const waitUntilSpeechFinished = async () => {
    logger.debug('Waiting for speech to finish', { isSpeaking });
    while (isSpeaking) {
      logger.debug('Waiting for speech to finish', { isSpeaking });
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  };

  // Speak text
  const speakText = async (
    text: string,
    force: boolean = false
  ): Promise<void> => {
    if (!text) {
      logger.warn('Empty text provided to speakText');
      return;
    }

    if (isSpeaking && force) {
      stopSpeaking();
    } else {
      // wait for earlier speech to finish
      await waitUntilSpeechFinished();
    }

    // Set isSpeaking to true
    setIsSpeaking(true);

    try {
      // Get voice configuration from assessment settings
      const dialectCode =
        assessment?.jobAiAssessmentSettings?.interviewDialect || 'en-US';
      const voiceGender =
        (assessment?.jobAiAssessmentSettings?.interviewVoiceGender as
          | 'female'
          | 'male') || 'female';

      const voiceConfig = getVoiceConfig(dialectCode, voiceGender);

      const request: IVoiceSynthesizeRequest = {
        text,
        voice: voiceConfig.voice,
        languageCode: voiceConfig.languageCode,
      };
      const response = await voiceService.synthesizeSpeech(request);
      if (!response.audioContent) {
        throw new Error('No audio content received');
      }
      const audioUrl = URL.createObjectURL(
        new Blob([Buffer.from(response.audioContent, 'base64')], {
          type: 'audio/mpeg',
        })
      );
      if (!audioRef.current) {
        throw new Error('Audio element not found');
      }

      // Ensure system audio source is connected for recording if recording is active
      if (audioContextRef.current && audioRef.current && isRecording) {
        try {
          // Create system audio source if not already created
          if (!systemAudioSourceRef.current) {
            systemAudioSourceRef.current =
              audioContextRef.current.createMediaElementSource(
                audioRef.current
              );
            // Reconnect to destination so user can still hear the audio
            systemAudioSourceRef.current.connect(
              audioContextRef.current.destination
            );
            logger.info(
              'System audio source created and connected for recording'
            );
          }
        } catch (error) {
          // This might fail if the source is already created, which is fine
          logger.debug(
            'System audio source already exists or failed to create:',
            error
          );
        }
      }

      // Return a promise that resolves when audio playback is complete
      return new Promise<void>((resolve, reject) => {
        if (!audioRef.current) {
          reject(new Error('Audio element not found'));
          return;
        }

        const handleEnded = () => {
          setIsSpeaking(false);
          cleanup();
          resolve();
        };

        const handleError = (error: Event) => {
          logger.error('Audio playback failed:', error);
          setIsSpeaking(false);
          cleanup();
          reject(new Error('Audio playback failed'));
        };

        const cleanup = () => {
          if (audioRef.current) {
            audioRef.current.removeEventListener('ended', handleEnded);
            audioRef.current.removeEventListener('error', handleError);
            // Clean up the blob URL to prevent memory leaks
            URL.revokeObjectURL(audioUrl);
          }
        };

        audioRef.current.addEventListener('ended', handleEnded);
        audioRef.current.addEventListener('error', handleError);
        audioRef.current.src = audioUrl;

        // Log that we're about to play AI speech
        if (isRecording) {
          logger.info(
            'Playing AI speech during recording - will be captured in video'
          );
        }

        audioRef.current.play().catch((playError) => {
          setIsSpeaking(false);
          cleanup();
          reject(new Error(`Failed to play audio: ${playError.message}`));
        });
      });
    } catch (error) {
      setIsSpeaking(false);
      throw error;
    }
  };

  const stopStreamingRecognition = useCallback(() => {
    try {
      logger.info('Stopping Google Cloud streaming STT');
      if (isListeningRef.current || sttListening) {
        isListeningRef.current = false;
        setIsListening(false);
        setListeningMode((mode) => (mode === 'streaming' ? null : mode));
        stopStreamingSTT();
        logger.info(
          'Google Cloud streaming STT stopped, isListening set to FALSE'
        );
      } else {
        logger.info('Streaming speech recognition was not running');
      }
    } catch (error) {
      logger.error('Error stopping streaming STT:', error);
    }
  }, [sttListening, stopStreamingSTT]);

  const startStreamingRecognition = useCallback(async () => {
    // Don't start if microphone is disabled
    if (!isMicEnabled) {
      logger.warn(
        'Cannot start streaming speech recognition - microphone is disabled'
      );
      return;
    }

    const questionId = currentQuestionIdRef.current;

    logger.info('🎤 Starting Google Cloud streaming speech recognition', {
      sttConnected,
      sttListening,
      isListening,
      isSpeaking,
      hasUserSpoken,
      isMicEnabled,
      questionId,
    });

    if (!sttConnected) {
      throw new Error('Streaming STT not connected');
    }

    if (isSpeaking) {
      logger.warn(
        '⏸️ Cannot start listening while AI is speaking - waiting...'
      );
      await waitUntilSpeechFinished();
      logger.info('✅ AI finished speaking, now starting listener');
    }

    logger.info('🔄 Resetting transcript before starting listener', {
      questionId,
    });
    resetStreamingTranscript();
    accumulatedTranscriptRef.current = '';
    setTranscript('');
    setHasUserSpoken(false);

    if (isListeningRef.current || sttListening) {
      logger.warn(
        '⚠️ Speech recognition already active, force stopping before restart'
      );
      stopStreamingRecognition();
      logger.info('⏳ Waiting 800ms for STT cleanup...');
      await new Promise((resolve) => setTimeout(resolve, 800));
    }

    await startStreamingSTT(hasUserSpoken);
    setIsListening(true);
    setListeningMode('streaming');
    isListeningRef.current = true;
    logger.info('✅ Google Cloud streaming STT started successfully', {
      isListening: true,
      sttListening,
      questionId,
    });
  }, [
    isListening,
    isSpeaking,
    hasUserSpoken,
    isMicEnabled,
    resetStreamingTranscript,
    startStreamingSTT,
    sttConnected,
    sttListening,
    stopStreamingRecognition,
    waitUntilSpeechFinished,
  ]);

  const startListening = async () => {
    // Don't start if microphone is disabled
    if (!isMicEnabled) {
      logger.warn('Cannot start listening - microphone is disabled');
      return;
    }

    if (speechMode === 'streaming') {
      if (!sttConnected) {
        logger.warn(
          'Streaming STT not connected. Switching to browser speech recognition.'
        );
        toast.warning(
          'Speech recognition not ready. Switching to browser recognition.',
          { duration: 4000 }
        );
        setSpeechMode('browser');
        await startBrowserSpeechRecognition();
        return;
      }

      try {
        await startStreamingRecognition();
      } catch (error) {
        logger.error(
          '❌ Error starting streaming STT, falling back to browser recognition:',
          error
        );
        toast.warning(
          'Unable to connect to speech service. Using browser speech recognition instead.',
          { duration: 4000 }
        );
        setSpeechMode('browser');
        await startBrowserSpeechRecognition();
      }
      return;
    }

    await startBrowserSpeechRecognition();
  };

  const stopListening = () => {
    if (listeningMode === 'streaming') {
      stopStreamingRecognition();
    } else if (listeningMode === 'browser') {
      stopBrowserSpeechRecognition();
    } else {
      stopStreamingRecognition();
      stopBrowserSpeechRecognition();
    }
  };

  // Stop speech recognition when microphone is disabled
  useEffect(() => {
    if (!isMicEnabled && (isListening || sttListening)) {
      logger.info('Microphone disabled - stopping speech recognition');
      stopListening();
      setIsListening(false);
      isListeningRef.current = false;
    }
  }, [isMicEnabled, isListening, sttListening, stopListening]);

  useEffect(() => {
    return () => {
      stopBrowserSpeechRecognition();
    };
  }, [stopBrowserSpeechRecognition]);

  useEffect(() => {
    if (speechMode === 'browser') {
      stopStreamingRecognition();
      resetStreamingTranscript();
      accumulatedTranscriptRef.current = '';
      setTranscript('');
    } else {
      stopBrowserSpeechRecognition();
    }
  }, [
    speechMode,
    stopBrowserSpeechRecognition,
    stopStreamingRecognition,
    resetStreamingTranscript,
  ]);

  // Submit the answer to the server and update the question
  const handleSubmitAnswer = async (answer: string) => {
    try {
      setIsProcessing(true);
      logger.info('handleSubmitAnswer - Starting answer submission', {
        answerLength: answer.length,
        questionId: currentQuestion?.id,
      });

      if (!currentQuestion || !assessmentId) {
        throw new Error('Current question or assessment ID is required');
      }

      // Stop recording and clean up resources before submitting
      if (isListening || sttListening) {
        logger.info('Stopping speech recognition before submitting answer');
        stopListening();
        // Wait for cleanup
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      logger.info('Submitting answer to backend...');
      const response = await candidateJobAiAssessmentService.submitAnswer(
        assessmentId,
        currentQuestion.id,
        answer
      );

      logger.info('Successfully submitted answer:', {
        nextQuestionId: response.nextQuestion?.id,
        nextQuestionType: response.nextQuestion?.questionType,
        shouldEndAssessment: response.shouldEndAssessment,
      });

      // Reset all form state before updating question
      setCode('');
      setSelectedOption(null);
      setTranscript('');
      resetStreamingTranscript();
      logger.info('🔄 Cleared all transcript state for next question', {
        nextQuestionId: response.nextQuestion?.id,
        nextQuestionType: response.nextQuestion?.questionType,
      });

      // Update the question state AND the refs immediately
      setCurrentQuestion(response.nextQuestion);
      currentQuestionIdRef.current = response.nextQuestion?.id;
      currentSectionIdRef.current = response.nextQuestion?.sectionId;
      logger.info('Updated current question state and refs', {
        questionId: response.nextQuestion?.id,
        sectionId: response.nextQuestion?.sectionId,
      });

      if (response.shouldEndAssessment) {
        logger.info('Assessment complete - showing final message');
        // Wait for state update to complete before speaking
        await new Promise((resolve) => setTimeout(resolve, 500));
        await speakText(response.nextQuestion.question, true);
        await handleInterviewComplete();
      } else {
        logger.info('Moving to next question - will speak and start listening');
        // Wait longer for state propagation + STT cleanup from previous stop
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await speakQuestion(response.nextQuestion);
      }

      logger.info('Answer submission flow completed successfully');
      // Set processing to false after question is updated and spoken
      setIsProcessing(false);
    } catch (error) {
      logger.error('handleSubmitAnswer - Error submitting answer:', error);
      await speakText(
        'There was an error submitting your answer. Please try again.'
      );
      if (currentQuestion) {
        await speakQuestion(currentQuestion);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Get question on load
  const getQuestionOnLoad = ():
    | ICandidateJobAiAssessmentQuestion
    | undefined => {
    if (!assessment) {
      return;
    }

    if (
      !assessment?.progressState?.currentSectionId ||
      !assessment?.progressState?.currentQuestionId
    ) {
      throw new Error('Current section or question ID is required');
    }

    const currentSection = assessment.sections.find(
      (section: ICandidateJobAiAssessmentSection) =>
        section.id === assessment.progressState?.currentSectionId
    );

    const question = currentSection?.questions.find(
      (question: ICandidateJobAiAssessmentQuestion) =>
        question.id === assessment.progressState?.currentQuestionId
    );

    if (!question) {
      throw new Error('Question not found');
    }

    return question;
  };

  // Handle start
  const handleStart = async () => {
    if (!assessment) return;
    setIsStarted(true);

    // Set sessionStorage flag to track that interview has started
    if (assessmentId) {
      sessionStorage.setItem(
        `teamcast-job-ai-assessment-${assessmentId}-started`,
        'true'
      );
    }

    await speakText("Let's begin the assessment. Wish you the best of luck!.");

    const firstQuestion = getQuestionOnLoad();
    if (firstQuestion) {
      setCurrentQuestion(firstQuestion);
      await speakQuestion(firstQuestion);
    } else {
      logger.error('No question found on load');
    }
  };

  // Speak question
  const speakQuestion = async (question: ICandidateJobAiAssessmentQuestion) => {
    if (!question) return;

    // Speak the question and wait for it to finish
    await speakText(question.question);

    if (question?.questionType === 'TEXT') {
      // CRITICAL: Add delay after AI finishes speaking to prevent echo/feedback
      logger.info(
        'Waiting 1 second after AI speech before starting listener...'
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));

      logger.info('Starting speech recognition for user answer');
      await startListening();
    }
  };

  // Handle recording complete
  const handleRecordingComplete = async () => {
    try {
      if (!transcript || transcript.length < minTextAnswerLength) {
        logger.warn('Transcript too short:', {
          length: transcript.length,
          minLength: minTextAnswerLength,
        });

        // Stop listening before AI speaks
        if (isListening || sttListening) {
          stopListening();
        }

        // AI asks for more detail
        await speakText(
          'Your answer is too brief. Could you please elaborate more on your response?'
        );

        // Wait 1 second after AI finishes speaking
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Restart listening
        await startListening();
      } else {
        await handleSubmitAnswer(transcript);
      }
    } catch (error) {
      logger.error('Error completing recording:', error);
      toast.error('Error processing your response. Please try again.');
    }
  };

  const handleInterviewComplete = async () => {
    logger.info('handleInterviewComplete - Handling interview complete');

    // Clear sessionStorage flag when interview completes
    if (assessmentId) {
      sessionStorage.removeItem(
        `teamcast-job-ai-assessment-${assessmentId}-started`
      );
    }

    // wait for 10ms for the audio stream to be accumulated
    await new Promise((resolve) => setTimeout(resolve, 10));

    if (isAssessmentSubmitted) {
      logger.info('Assessment already submitted, skipping submission');
      return;
    }

    try {
      setIsInterviewComplete(true);
      setIsSubmitting(true);
      setIsAssessmentSubmitted(true);

      if (assessment?.id) {
        await candidateJobAiAssessmentService.submitAssessment(assessment.id);
        logger.info('Assessment submitted successfully');
      }

      setIsSubmitting(false);

      await speakText(
        'Thank you for completing the assessment! Your responses have been submitted for review. Once the results are available, you will be notified and can view them in your dashboard.',
        true
      );
      await activityLogService.createActivityLog({
        entityId: candidateId,
        entityType: ActivityEntityTypeEnum.CANDIDATE,
        module: ActivityModuleEnum.ASSESSMENT,
        action: ActivityActionEnums.COMPLETE_ASSESSMENT,
        description: `${candidateName}'s JobAi Assessment Completed Successfully`,
        metadata: {
          candidateId: candidateId,
          title: ActivityTitleEnum.ASSESSMENT_COMPLETED,
          assessmentId: assessmentId,
          userName: candidateName,
          assessmentDuration: assessment?.duration,
          assessmentScore: assessment?.score,
          assessmentStatus: assessment?.status,
        },
      });

      try {
        if (!candidateId || !user?.id) {
          throw new Error('Candidate ID or user ID is required');
        }

        await liveAssessmentAnalyticsService.upsertAnalytics(
          assessmentId!,
          candidateId,
          0,
          JobAiAssessmentStatusEnum.CANDIDATE_ASSESSMENT_COMPLETED,
          assessment?.result || 'IN_PROGRESS',
          'JOB_AI_ASSESSMENT',
          user?.id,
          'candidate'
        );
      } catch (error) {
        logger.error('Error updating analytics:', error);
      }
    } catch (error) {
      logger.error('Error submitting assessment:', error);
      toast.error(
        'There was an error submitting your assessment. Please try again later.'
      );
      setIsSubmitting(false);
      setIsInterviewComplete(false);
      setIsAssessmentSubmitted(false);
    } finally {
      setTimeout(() => {
        router.push('/app/candidate/dashboard');
      }, 5000);
      setIsSubmitting(false);
    }
  };

  // Handle end assessment request
  const handleEndAssessment = async () => {
    logger.info('User requested to end assessment early');
    setShowEndAssessmentDialog(false);

    // Stop any ongoing processes
    if (isListening) {
      stopListening();
    }

    if (isSpeaking) {
      stopSpeaking();
    }

    // End the assessment
    await handleInterviewComplete();
  };

  const sendHeartbeat = async (assessmentId: string, timeRemaining: number) => {
    if (isInterviewComplete) {
      logger.debug('Cleaning up heartbeat interval');
      return;
    }
    try {
      logger.debug('Sending heartbeat', { assessmentId, timeRemaining });
      const duration = timeRemaining;
      await candidateJobAiAssessmentService.heartbeat(
        assessmentId,
        duration,
        'IN_PROGRESS'
      );
      // Update analytics
      if (candidateId) {
        try {
          await liveAssessmentAnalyticsService.upsertAnalytics(
            assessmentId!,
            candidateId,
            duration,
            JobAiAssessmentStatusEnum.CANDIDATE_ASSESSMENT_IN_PROGRESS,
            'IN_PROGRESS',
            'JOB_AI_ASSESSMENT',
            user?.id,
            'candidate'
          );
        } catch (error) {
          logger.error('Error updating analytics:', error);
        }
      }
    } catch (error) {
      logger.error('Error sending heartbeat:', error);
      // Don't stop the heartbeat on error, just log it
    }
  };

  // Format time remaining
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
        <span className="text-text-secondary ml-3">Loading assessment...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
        <h2 className="text-text-primary mb-4 text-2xl font-bold">
          Error occurred
        </h2>
        <p className="text-text-secondary mb-6">
          There was an error loading your assessment. Please try again later.
        </p>
        <button
          onClick={() => router.push('/app/candidate/dashboard')}
          className="bg-primary text-surface hover:bg-primary-dark rounded-xl px-6 py-3 shadow-md transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="bg-background min-h-screen">
        <>
          {!isStarted ? (
            <>
              <WelcomeScreen
                onStart={handleStart}
                proctoringEnabled={proctoringEnabled}
              />
            </>
          ) : isInterviewComplete ? (
            <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
              <div className="mb-8">
                <AIAvatar isSpeaking={isSpeaking} />
              </div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md"
              >
                <h2 className="text-text-primary mb-4 text-2xl font-bold">
                  Assessment Complete!
                </h2>
                <p className="text-text-secondary mb-6">
                  Thank you for completing the assessment. Your responses have
                  been submitted for review.
                </p>
                <p className="text-text-tertiary mb-8">
                  Once the results are available, you will be notified and can
                  view them in your dashboard.
                </p>
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
                    <span className="text-text-secondary ml-3">
                      Submitting your responses...
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <p className="text-text-tertiary mb-4 text-sm">
                      Redirecting to dashboard in a few seconds...
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => router.push('/app/candidate/dashboard')}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-6 py-3 transition-colors"
                    >
                      Go to Dashboard Now
                    </motion.button>
                  </div>
                )}
              </motion.div>
            </div>
          ) : (
            <>
              {/* Top Navigation - Fixed */}
              <div className="bg-surface fixed top-0 right-0 left-0 z-50 shadow-sm">
                <div className="mx-auto max-w-7xl px-3 py-2 sm:px-4 md:px-6 md:py-3">
                  <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
                    <div className="flex w-full items-center justify-between">
                      {/* Section Navigation */}
                      {currentQuestion ? (
                        <div className="flex items-center space-x-8">
                          {/* Current Section */}
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                              <div className="bg-primary text-surface flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium">
                                {(assessment?.sections?.findIndex(
                                  (s) => s.id === currentQuestion?.sectionId
                                ) ?? -1) + 1}
                              </div>
                              <div>
                                <div className="text-text-primary text-sm font-medium">
                                  {assessment?.sections?.find(
                                    (s) => s.id === currentQuestion?.sectionId
                                  )?.title || 'Loading...'}
                                </div>
                                <div className="text-text-tertiary text-xs">
                                  Section{' '}
                                  {(assessment?.sections?.findIndex(
                                    (s) => s.id === currentQuestion?.sectionId
                                  ) ?? -1) + 1}{' '}
                                  of {assessment?.sections?.length || 0}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Upcoming Section */}
                          {assessment?.sections && (
                            <div className="text-text-tertiary hidden items-center space-x-3 text-sm md:flex">
                              {(() => {
                                const currentSectionIndex =
                                  assessment.sections.findIndex(
                                    (s) => s.id === currentQuestion?.sectionId
                                  );
                                const isLastSection =
                                  currentSectionIndex ===
                                  assessment.sections.length - 1;

                                return (
                                  <div className="flex items-center space-x-2">
                                    {isLastSection ? (
                                      <div className="border-border text-text-secondary flex h-8 w-8 items-center justify-center rounded-full border text-sm font-medium">
                                        <ThumbsUp className="h-4 w-4" />
                                      </div>
                                    ) : (
                                      <div className="border-border text-text-secondary flex h-8 w-8 items-center justify-center rounded-full border text-sm font-medium">
                                        {currentSectionIndex + 2}
                                      </div>
                                    )}
                                    <div>
                                      <div className="text-text-secondary text-sm">
                                        {isLastSection
                                          ? 'You&apos;re almost there!'
                                          : assessment.sections[
                                              currentSectionIndex + 1
                                            ]?.title}
                                      </div>
                                      <div className="text-text-tertiary text-xs">
                                        {isLastSection
                                          ? 'Last section of the assessment'
                                          : 'Coming up next'}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <div className="bg-muted text-muted-foreground flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium">
                              <div className="bg-muted-foreground/50 h-4 w-4 animate-pulse rounded-full" />
                            </div>
                            <div>
                              <div className="text-text-tertiary text-sm font-medium">
                                <div className="bg-muted-foreground/50 h-4 w-24 animate-pulse rounded" />
                              </div>
                              <div className="text-text-tertiary text-xs">
                                <div className="bg-muted-foreground/50 mt-1 h-3 w-16 animate-pulse rounded" />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center space-x-2">
                        {/* End Assessment Button - Desktop */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowEndAssessmentDialog(true)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 hidden p-2 sm:flex"
                          disabled={isSubmitting || isInterviewComplete}
                        >
                          <Power className="h-5 w-5" />
                        </Button>

                        {/* End Assessment Button - Mobile */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowEndAssessmentDialog(true)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 p-2 sm:hidden"
                          disabled={isSubmitting || isInterviewComplete}
                        >
                          <Power className="h-5 w-5" />
                        </Button>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>
                              <ThemeToggle />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Toggle Theme</p>
                          </TooltipContent>
                        </Tooltip>
                        {/* Duration */}
                        <motion.div
                          className={`flex items-center space-x-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-300 md:text-sm ${
                            isTimeWarning
                              ? 'bg-destructive/10 text-destructive'
                              : 'bg-muted text-muted-foreground'
                          }`}
                          animate={{
                            scale: isTimeWarning ? [1, 1.05, 1] : 1,
                            transition: {
                              duration: 1,
                              repeat: isTimeWarning ? Infinity : 0,
                              repeatType: 'reverse',
                            },
                          }}
                        >
                          <motion.div
                            animate={{
                              rotate: isTimeWarning ? 360 : 0,
                            }}
                            transition={{
                              duration: 2,
                              repeat: isTimeWarning ? Infinity : 0,
                              ease: 'linear',
                            }}
                          >
                            <Clock
                              className={`h-4 w-4 ${isTimeWarning ? 'text-destructive' : 'text-muted-foreground'}`}
                            />
                          </motion.div>
                          <motion.span
                            className={`font-mono ${isTimeWarning ? 'font-bold' : 'font-medium'}`}
                            animate={{
                              color: isTimeWarning
                                ? 'var(--destructive)'
                                : 'var(--muted-foreground)',
                            }}
                          >
                            {formatTime(timeRemaining)}
                          </motion.span>
                          {isTimeWarning && (
                            <motion.span
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-destructive text-xs font-medium"
                            >
                              remaining
                            </motion.span>
                          )}
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content - Scrollable */}
              <div className="relative flex min-h-screen items-center justify-center sm:pt-8 md:pt-6">
                <div className="mx-auto min-h-148 w-full max-w-4xl px-3 sm:px-4 md:px-6">
                  {/* AI Avatar Section - Scrollable */}
                  <div className="mt-12 mb-6 sm:mt-8 md:mt-8 md:mb-8">
                    <div className="flex flex-col items-center">
                      <div className="mb-3 sm:mb-4 md:mb-8">
                        <AIAvatar
                          isSpeaking={isListening || isSpeaking}
                          audioLevel={isListening ? audioLevel : -1}
                          isAudioLevelMode={isListening}
                        />
                      </div>

                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentQuestion?.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="px-0 text-center sm:px-4"
                        >
                          <p className="sm:text-md text-text-primary pt-6 text-lg md:text-lg">
                            {currentQuestion?.question}
                          </p>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Response Area */}
                  <div className="mt-3 pb-24 sm:mt-4 sm:pb-20 md:mt-8 md:pb-12">
                    {isProcessing ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
                        <span className="text-text-secondary ml-3">
                          Processing your response...
                        </span>
                      </div>
                    ) : currentQuestion?.questionType === 'CODE' ? (
                      <div className="bg-surface rounded-2xl p-3 shadow-sm sm:p-4 md:p-6">
                        <CodeAnswer
                          template={currentQuestion?.options?.template || ''}
                          languages={
                            currentQuestion?.options?.languages || [
                              'javascript',
                            ]
                          }
                          testCases={currentQuestion?.options?.testCases || []}
                          value={code}
                          onChange={setCode}
                          selectedLanguage={selectedLanguage}
                          onLanguageChange={setSelectedLanguage}
                        />
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleSubmitAnswer(code)}
                          disabled={isProcessing || isSpeaking || !code.trim()}
                          className={`mx-auto mt-4 block w-full rounded-xl px-4 py-2.5 text-sm font-medium transition-colors sm:mt-6 md:mt-8 md:w-auto md:px-8 md:py-3 ${
                            isProcessing || isSpeaking || !code.trim()
                              ? 'bg-muted text-muted-foreground cursor-not-allowed'
                              : 'bg-primary text-primary-foreground hover:bg-primary/90'
                          }`}
                        >
                          {isProcessing
                            ? 'Processing...'
                            : isSpeaking
                              ? 'Please wait...'
                              : !code.trim()
                                ? 'Please write some code'
                                : 'Submit and Continue'}
                        </motion.button>
                      </div>
                    ) : currentQuestion?.questionType === 'TEXT' ? (
                      <div>
                        {/* Speech Recognition Status - Show when listening and mic is enabled */}
                        {(isListening || sttListening) && isMicEnabled && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="disabled mt-12 mb-3 flex flex-col items-center justify-center sm:mb-4"
                          >
                            <div className="bg-primary/10 text-primary flex items-center space-x-2 rounded-full px-3 py-1.5 sm:px-4 sm:py-2">
                              <Mic className="h-4 w-4 animate-pulse" />
                              <span className="text-xs font-medium sm:text-sm">
                                {audioLevel > 1
                                  ? "I'm listening…"
                                  : 'Speak up!'}
                              </span>
                            </div>

                            {/* Transcript Display */}
                            {/* <div className="bg-surface mt-4 min-h-12 w-full rounded-lg p-4">
                            <p className="text-text-primary text-center text-sm">
                              {transcript}
                            </p>
                          </div> */}
                          </motion.div>
                        )}

                        {/* Continue Button - Always show for TEXT questions */}
                        <div className="flex flex-col items-center">
                          <motion.button
                            whileHover={
                              !isProcessing && canSubmitTextAnswer
                                ? { scale: 1.02 }
                                : {}
                            }
                            whileTap={
                              !isProcessing && canSubmitTextAnswer
                                ? { scale: 0.98 }
                                : {}
                            }
                            onClick={handleRecordingComplete}
                            disabled={isProcessing || !canSubmitTextAnswer}
                            className={`bg-primary text-primary-foreground mx-auto mt-12 flex w-full items-center justify-center space-x-2 rounded-md px-4 py-3 text-sm font-medium transition-all sm:mt-12 md:mt-16 md:w-auto md:px-8 md:py-3 ${
                              isProcessing || !canSubmitTextAnswer
                                ? 'cursor-not-allowed opacity-50 saturate-50'
                                : 'hover:bg-primary/90'
                            }`}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Done answering? Tap to continue.</span>
                          </motion.button>
                          {!isProcessing && !canSubmitTextAnswer && (
                            <p className="text-muted-foreground mt-2 text-xs">
                              Speak at least{' '}
                              {minTextAnswerLength - transcript.length} more
                              characters
                            </p>
                          )}
                        </div>
                      </div>
                    ) : currentQuestion?.questionType === 'MULTIPLE_CHOICE' ? (
                      <>
                        <MultipleChoiceAnswer
                          options={currentQuestion?.options || {}}
                          value={selectedOption}
                          onChange={setSelectedOption}
                        />
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() =>
                            handleSubmitAnswer(selectedOption || '')
                          }
                          disabled={
                            isProcessing || !selectedOption || isSpeaking
                          }
                          className={`mx-auto mt-4 block w-full rounded-xl px-4 py-2.5 text-sm font-medium transition-colors sm:mt-6 md:mt-8 md:w-auto md:px-8 md:py-3 ${
                            isProcessing || !selectedOption || isSpeaking
                              ? 'bg-muted text-muted-foreground cursor-not-allowed'
                              : 'bg-primary text-primary-foreground hover:bg-primary/90'
                          }`}
                        >
                          {isProcessing
                            ? 'Processing...'
                            : !selectedOption
                              ? 'Please select an option'
                              : isSpeaking
                                ? 'Please wait...'
                                : 'Submit and Continue'}
                        </motion.button>
                      </>
                    ) : currentQuestion?.questionType === 'BOOLEAN' ? (
                      <>
                        <BooleanAnswer
                          value={selectedOption}
                          onChange={setSelectedOption}
                        />
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() =>
                            handleSubmitAnswer(selectedOption || '')
                          }
                          disabled={
                            isProcessing || !selectedOption || isSpeaking
                          }
                          className={`mx-auto mt-4 block w-full rounded-xl px-4 py-2.5 text-sm font-medium transition-colors sm:mt-6 md:mt-8 md:w-auto md:px-8 md:py-3 ${
                            isProcessing || !selectedOption || isSpeaking
                              ? 'bg-muted text-muted-foreground cursor-not-allowed'
                              : 'bg-primary text-primary-foreground hover:bg-primary/90'
                          }`}
                        >
                          {isProcessing
                            ? 'Processing...'
                            : !selectedOption
                              ? 'Please select an option'
                              : isSpeaking
                                ? 'Please wait...'
                                : 'Submit and Continue'}
                        </motion.button>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Fixed Elements */}
              {videoRecordingEnabled && (
                <div className="fixed right-4 bottom-4 h-40 w-52 overflow-hidden rounded-2xl bg-white shadow-sm sm:h-48 sm:w-64 md:bottom-6 md:left-6 md:h-64 md:w-96">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="h-full w-full object-cover"
                  />
                  {isRecording && (
                    <div className="absolute right-2 bottom-2 flex items-center space-x-1 rounded-full bg-red-500 px-2 py-1 text-xs text-white">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-white" />
                      <span>Recording</span>
                    </div>
                  )}
                  {/* Face Detection Overlay */}
                  <FaceDetectionOverlay
                    videoRef={videoRef}
                    isEnabled={proctoringEnabled}
                    assessmentId={assessmentId || ''}
                  />
                </div>
              )}
            </>
          )}

          <div className="text-text-tertiary fixed right-0 bottom-2 left-0 z-40 text-center text-xs sm:text-sm">
            Need help? email{' '}
            <a
              href="mailto:help@teamcast.ai"
              className="text-info hover:underline"
            >
              help@teamcast.ai
            </a>
          </div>

          {/* End Assessment Confirmation Dialog */}
          <AlertDialog
            open={showEndAssessmentDialog}
            onOpenChange={setShowEndAssessmentDialog}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>End Assessment?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to end this assessment? This action
                  cannot be undone and your current progress will be submitted
                  automatically.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Continue Assessment</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleEndAssessment}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  End Assessment
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      </div>
    </TooltipProvider>
  );
};

const InterviewPage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
          <span className="text-text-secondary ml-3">
            Loading assessment...
          </span>
        </div>
      }
    >
      <InterviewPageContent />
    </Suspense>
  );
};

export default InterviewPage;

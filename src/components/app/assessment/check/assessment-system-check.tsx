import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Clock,
  Globe,
  Headphones,
  LucideIcon,
  Mic,
  Wifi,
  XCircle,
  User,
  SquareArrowOutUpRight,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { logger } from '@/lib/logger';
import SystemCheckProgress from './check-progress';
import { ENV } from '@/lib/env';
import { useApp } from '@/lib/context/app-context';
import { CandidateOnboardingAssessmentApiService } from '@/lib/shared/services/candidate/onboarding.assessment.api.service';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

// MediaPipe imports
import { FilesetResolver, FaceDetector } from '@mediapipe/tasks-vision';

interface importantInfo {
  icon: LucideIcon;
  text: string;
  color: string;
}

interface AssessmentCheckProps {
  startAssessment: () => void;
  title: string;
  description: string;
  importantInformation: importantInfo[];
  assessmentId?: string; // Optional assessment ID for terms acceptance tracking
  inviteId?: string; // Optional invite ID for terms acceptance tracking
}

const AssessmentCheck = ({
  startAssessment,
  title,
  description,
  importantInformation,
}: AssessmentCheckProps) => {
  const router = useRouter();
  const { user } = useApp();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const faceDetectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [_stream, setStream] = useState<MediaStream | null>(null);
  const globalStreamRef = useRef<MediaStream | null>(null);
  const [cameraStatus, setCameraStatus] = useState<
    'checking' | 'success' | 'error'
  >('checking');
  const [micStatus, setMicStatus] = useState<'checking' | 'success' | 'error'>(
    'checking'
  );
  const [faceDetectionStatus, setFaceDetectionStatus] = useState<
    'checking' | 'success' | 'error'
  >('checking');
  const [locationStatus, setLocationStatus] = useState<
    'checking' | 'success' | 'error'
  >('checking');
  const [speakerStatus, setSpeakerStatus] = useState<
    'idle' | 'checking' | 'success' | 'error'
  >('checking');
  const [internetSpeed, setInternetSpeed] = useState<number | null>(null);
  const [micVolume, setMicVolume] = useState(0);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isUpdatingTerms, setIsUpdatingTerms] = useState(false);
  const [termsError, setTermsError] = useState<string | null>(null);
  const [testAudio] = useState(() => {
    if (typeof window !== 'undefined') {
      const audio = new Audio('/sounds/ebs-test-loop.mp3');
      audio.preload = 'auto';

      // Add error handler to prevent unhandled audio errors
      audio.onerror = (error) => {
        logger.error('Audio element error:', error);
        // Error will be handled by speaker test functions
      };

      return audio;
    }
    return null;
  });
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [faceDetected, setFaceDetected] = useState(false);
  const [faceDetector, setFaceDetector] = useState<FaceDetector | null>(null);
  const faceDetectionStatusRef = useRef(faceDetectionStatus);
  const hasAutoTestedRef = useRef(false);
  const [videoReady, setVideoReady] = useState(false);

  // Initialize API service for candidate onboarding assessment operations
  // Use useMemo to prevent recreation on every render
  const candidateAssessmentService = useMemo(
    () => new CandidateOnboardingAssessmentApiService(apiClient),
    []
  );

  // Fetch current terms acceptance status
  const fetchTermsAcceptanceStatus = useCallback(async () => {
    if (!user?.candidateId) {
      return;
    }

    try {
      // Always try to get the latest assessment for terms status
      // The backend updateTermsAccepted method will automatically find the latest assessment
      const latestAssessment =
        await candidateAssessmentService.getLatestAssessment();
      setTermsAccepted(latestAssessment.termsAccepted || false);
      logger.info('Fetched terms acceptance status from latest assessment', {
        assessmentId: latestAssessment.id,
        status: latestAssessment.termsAccepted,
      });
    } catch (_error) {
      // If no assessment exists yet, set default to false
      // This is normal for candidates who haven't started assessments
      logger.info(
        'No assessment found yet, setting terms accepted to false by default'
      );
      setTermsAccepted(false);
    }
  }, [user?.candidateId, candidateAssessmentService]);

  // Fetch terms acceptance status on mount
  useEffect(() => {
    fetchTermsAcceptanceStatus();
  }, [fetchTermsAcceptanceStatus]);

  // Handle terms acceptance with API call
  const handleTermsAcceptance = async (accepted: boolean) => {
    if (!user?.candidateId) {
      logger.error('No candidate ID found in user context');
      toast.error('Authentication error. Please log in again.');
      return;
    }

    // Prevent multiple simultaneous API calls
    if (isUpdatingTerms) {
      return;
    }

    setIsUpdatingTerms(true);
    try {
      // Call the API to update terms acceptance
      // Note: The backend automatically finds the latest assessment using the candidateId from JWT token
      // No assessmentId is required - this works even before the first assessment is created
      const result =
        await candidateAssessmentService.updateTermsAccepted(accepted);

      // Update local state
      setTermsAccepted(accepted);

      // Clear any previous errors
      setTermsError(null);

      if (accepted) {
        toast.success(
          result.message || 'Terms and conditions accepted successfully'
        );
        logger.info('Terms accepted via API', {
          candidateId: user.candidateId,
          result,
        });
      } else {
        toast.info(result.message || 'Terms acceptance revoked');
        logger.info('Terms acceptance revoked via API', {
          candidateId: user.candidateId,
          result,
        });
      }
    } catch (error) {
      logger.error('Failed to update terms acceptance:', error);

      // Revert the checkbox state on error
      setTermsAccepted(!accepted);

      // Set error state with more specific error messages
      let errorMessage = 'Failed to update terms acceptance. Please try again.';

      if (error instanceof Error) {
        if (error.message.includes('Terms accepted must be a boolean')) {
          errorMessage = 'Invalid request. Please try again.';
        } else if (error.message.includes('Candidate ID is required')) {
          errorMessage = 'Authentication error. Please log in again.';
        }
      }

      setTermsError(errorMessage);

      // Show appropriate error message
      toast.error(errorMessage);

      // Clear error after 5 seconds
      setTimeout(() => setTermsError(null), 5000);
    } finally {
      setIsUpdatingTerms(false);
    }
  };

  // Update ref when status changes
  useEffect(() => {
    faceDetectionStatusRef.current = faceDetectionStatus;
  }, [faceDetectionStatus]);

  // Cleanup function to stop all media and audio resources
  const cleanupResources = useCallback(() => {
    // Stop all media streams - try both local and global references
    if (_stream) {
      _stream.getTracks().forEach((track) => {
        track.stop();
      });
    }

    if (globalStreamRef.current) {
      globalStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      globalStreamRef.current = null;
    }

    // Stop audio context
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
      analyserRef.current = null;
    }

    // Stop test audio if playing
    if (testAudio) {
      testAudio.pause();
      testAudio.currentTime = 0;
    }

    // Cancel any pending animation frames
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = undefined;
    }

    // Clear face detection interval
    if (faceDetectionIntervalRef.current) {
      clearInterval(faceDetectionIntervalRef.current);
      faceDetectionIntervalRef.current = null;
    }

    // Clear stream state after cleanup
    setStream(null);
  }, [_stream, testAudio]);

  // Browser navigation cleanup - handle browser back button and page unload
  useEffect(() => {
    const handleBrowserBack = () => {
      cleanupResources();
    };

    const handleBeforeUnload = () => {
      cleanupResources();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        cleanupResources();
      }
    };

    // Listen for browser navigation events
    window.addEventListener('popstate', handleBrowserBack);
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup function to remove event listeners
    return () => {
      window.removeEventListener('popstate', handleBrowserBack);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [cleanupResources]);

  // Constants
  const INTERNET_SPEED_THRESHOLD = ENV.NEXT_PUBLIC_INTERNET_SPEED_THRESHOLD;

  // Initialize MediaPipe Face Detector
  const initializeFaceDetector = useCallback(async () => {
    try {
      // Suppress console errors from MediaPipe/TensorFlow during initialization
      // eslint-disable-next-line no-console
      const originalConsoleError = console.error;
      // eslint-disable-next-line no-console
      console.error = (...args) => {
        const message = args[0];
        const messageStr =
          typeof message === 'string' ? message : String(message);

        // Enhanced suppression of MediaPipe/TensorFlow informational messages
        const isMediaPipeInfo =
          messageStr.includes('TensorFlow Lite') ||
          messageStr.includes('XNNPACK delegate') ||
          messageStr.includes('Created TensorFlow Lite') ||
          messageStr.includes('INFO:') ||
          messageStr.includes('mediapipe') ||
          messageStr.includes('vision_wasm_internal') ||
          messageStr.includes('put_char') ||
          messageStr.includes('write') ||
          messageStr.includes('doWritev') ||
          messageStr.includes('_fd_write');

        if (isMediaPipeInfo) {
          return;
        }
        originalConsoleError.apply(console, args);
      };

      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      const detector = await FaceDetector.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite',
        },
        runningMode: 'VIDEO',
        minDetectionConfidence: 0.7,
        minSuppressionThreshold: 0.3,
      });

      setFaceDetector(detector);
      logger.info('MediaPipe Face Detector initialized successfully');

      // Restore original console.error
      // eslint-disable-next-line no-console
      console.error = originalConsoleError;
    } catch (error) {
      logger.error('Error initializing MediaPipe Face Detector:', error);
      setFaceDetectionStatus('error');
    }
  }, []);

  // Face detection using MediaPipe
  const detectFace = useCallback(async () => {
    if (!videoRef.current || !faceDetector) return false;

    const video = videoRef.current;

    try {
      const timestamp = Date.now();

      if (
        video.readyState >= 2 &&
        !video.paused &&
        video.videoWidth > 0 &&
        video.videoHeight > 0
      ) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          return false;
        }

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const detections = faceDetector.detectForVideo(video, timestamp);

        // Check for complete face detection
        for (const detection of detections.detections) {
          const boundingBox = detection.boundingBox;
          if (!boundingBox) continue;

          // Calculate face size as percentage of video frame
          const faceWidth = boundingBox.width;
          const faceHeight = boundingBox.height;
          const faceArea = faceWidth * faceHeight;
          const frameArea = canvas.width * canvas.height;
          const facePercentage = (faceArea / frameArea) * 100;

          // Check if face is large enough (at least 5% of frame) and well-positioned
          const isLargeEnough = facePercentage >= 5;
          const isWellPositioned =
            boundingBox.originX > 0 &&
            boundingBox.originY > 0 &&
            boundingBox.originX + boundingBox.width < canvas.width &&
            boundingBox.originY + boundingBox.height < canvas.height;

          // Check if face is roughly centered (not too close to edges)
          const centerX = boundingBox.originX + boundingBox.width / 2;
          const centerY = boundingBox.originY + boundingBox.height / 2;
          const frameCenterX = canvas.width / 2;
          const frameCenterY = canvas.height / 2;
          const distanceFromCenter = Math.sqrt(
            Math.pow(centerX - frameCenterX, 2) +
              Math.pow(centerY - frameCenterY, 2)
          );
          const maxDistance = Math.min(canvas.width, canvas.height) * 0.3; // Within 30% of center
          const isCentered = distanceFromCenter < maxDistance;

          // Check if face has reasonable aspect ratio (not too stretched)
          const aspectRatio = boundingBox.width / boundingBox.height;
          const hasGoodAspectRatio = aspectRatio >= 0.7 && aspectRatio <= 1.3;

          if (
            isLargeEnough &&
            isWellPositioned &&
            isCentered &&
            hasGoodAspectRatio
          ) {
            return true;
          }
        }

        return false;
      }
      return false;
    } catch (error) {
      // Only log actual errors, not informational messages
      if (
        error instanceof Error &&
        !error.message.includes('TensorFlow Lite')
      ) {
        logger.error('Face detection error:', error);
      }
      return false;
    }
  }, [faceDetector]);

  // Simple skin tone detection as fallback
  const detectSkinTone = useCallback((imageData: ImageData): boolean => {
    const data = imageData.data;
    let skinPixels = 0;
    let totalPixels = 0;
    const width = imageData.width;
    const height = imageData.height;

    // Sample pixels more densely for better accuracy
    for (let i = 0; i < data.length; i += 8) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      if (
        r > 95 &&
        g > 40 &&
        b > 20 &&
        Math.max(r, g, b) - Math.min(r, g, b) > 15 &&
        r > g &&
        r > b &&
        g > b &&
        Math.abs(r - g) > 15 &&
        r < 250 &&
        g < 250 &&
        b < 250
      ) {
        skinPixels++;
      }
      totalPixels++;
    }

    const skinPercentage = (skinPixels / totalPixels) * 100;

    // Require higher skin tone percentage for complete face
    const hasEnoughSkinTone = skinPercentage > 8;

    // Additional check: ensure skin tone is distributed across the image (not just one corner)
    if (hasEnoughSkinTone) {
      // Check if skin tone is present in multiple quadrants
      const quadrants = [
        { x: 0, y: 0, w: width / 2, h: height / 2 },
        { x: width / 2, y: 0, w: width / 2, h: height / 2 },
        { x: 0, y: height / 2, w: width / 2, h: height / 2 },
        { x: width / 2, y: height / 2, w: width / 2, h: height / 2 },
      ];

      let quadrantsWithSkin = 0;

      for (const quadrant of quadrants) {
        let quadrantSkinPixels = 0;
        let quadrantTotalPixels = 0;

        for (let y = quadrant.y; y < quadrant.y + quadrant.h; y += 4) {
          for (let x = quadrant.x; x < quadrant.x + quadrant.w; x += 4) {
            const index = (y * width + x) * 4;
            const r = data[index];
            const g = data[index + 1];
            const b = data[index + 2];

            if (
              r > 95 &&
              g > 40 &&
              b > 20 &&
              Math.max(r, g, b) - Math.min(r, g, b) > 15 &&
              r > g &&
              r > b &&
              g > b &&
              Math.abs(r - g) > 15 &&
              r < 250 &&
              g < 250 &&
              b < 250
            ) {
              quadrantSkinPixels++;
            }
            quadrantTotalPixels++;
          }
        }

        const quadrantSkinPercentage =
          (quadrantSkinPixels / quadrantTotalPixels) * 100;
        if (quadrantSkinPercentage > 3) {
          quadrantsWithSkin++;
        }
      }

      // Require skin tone in at least 2 quadrants for a complete face
      return quadrantsWithSkin >= 2;
    }

    return false;
  }, []);

  // Fallback face detection using skin tone detection
  const detectFaceFallback = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return false;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return false;

    try {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      if ('FaceDetector' in window) {
        try {
          const browserFaceDetector = new (window as any).FaceDetector({
            fastMode: true,
            maxDetectedFaces: 1,
          });

          const browserFaces = await browserFaceDetector.detect(canvas);
          return browserFaces.length > 0;
        } catch (browserError) {
          // Continue to skin tone detection
          logger.error('Browser face detection error:', browserError);
        }
      }

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      return detectSkinTone(imageData);
    } catch (error) {
      logger.error('Fallback face detection error:', error);
      return false;
    }
  }, [detectSkinTone]);

  // Combined face detection with fallback
  const detectFaceCombined = useCallback(async () => {
    try {
      // Try MediaPipe first
      const mediaPipeResult = await detectFace();
      if (mediaPipeResult) return true;

      // Fallback to browser API
      const fallbackResult = await detectFaceFallback();
      return fallbackResult;
    } catch (error) {
      logger.error('Combined face detection error:', error);
      return false;
    }
  }, [detectFace, detectFaceFallback]);

  // Start face detection monitoring
  const startFaceDetection = useCallback(() => {
    if (!faceDetector) return;

    let detectionCount = 0;
    const maxDetectionAttempts = 30; // Try for 30 seconds

    const renderLoop = async () => {
      if (cameraStatus === 'success' && videoRef.current?.readyState === 4) {
        try {
          const hasFace = await detectFaceCombined();
          detectionCount++;

          if (hasFace) {
            setFaceDetected(true);
            setFaceDetectionStatus('success');
            return; // Stop detection once face is found
          }

          // Stop if we've tried too many times
          if (detectionCount >= maxDetectionAttempts) {
            setFaceDetectionStatus('error');
            return;
          }
        } catch (error) {
          logger.error('Face detection loop error:', error);
          detectionCount++;

          if (detectionCount >= maxDetectionAttempts) {
            setFaceDetectionStatus('error');
            return;
          }
        }
      }

      // Continue detection loop with a delay to avoid overwhelming the system
      if (
        faceDetectionStatusRef.current !== 'success' &&
        faceDetectionStatusRef.current !== 'error'
      ) {
        setTimeout(() => {
          // Check current state again before continuing
          if (
            faceDetectionStatusRef.current !== 'success' &&
            faceDetectionStatusRef.current !== 'error'
          ) {
            requestAnimationFrame(renderLoop);
          }
        }, 1000); // Check every second
      }
    };

    renderLoop();
  }, [cameraStatus, detectFaceCombined, faceDetector]);

  // Check location
  const checkLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationStatus('success');
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          logger.error('Error getting location:', error);
          setLocationStatus('error');
          // Set a more specific error message based on the error code
          switch (error.code) {
            case error.PERMISSION_DENIED:
              setLocationError(
                'Location access was denied. Please enable location access in your browser settings.'
              );
              break;
            case error.POSITION_UNAVAILABLE:
              setLocationError(
                'Location information is unavailable. Please check your device settings.'
              );
              break;
            case error.TIMEOUT:
              setLocationError('Location request timed out. Please try again.');
              break;
            default:
              setLocationError(
                'An error occurred while getting location. Please try again.'
              );
          }
        },
        {
          enableHighAccuracy: false,
          timeout: 10000, // Increased timeout to 10 seconds
          maximumAge: 0,
        }
      );
    } else {
      setLocationStatus('error');
      setLocationError('Geolocation is not supported by your browser.');
    }
  };

  // Check internet speed
  const checkInternetSpeed = async () => {
    try {
      setInternetSpeed(null); // Reset to show loading state
      const startTime = performance.now();
      await fetch('/favicon.ico');
      const endTime = performance.now();
      const duration = endTime - startTime;
      const speed = Math.round(1000 / duration);
      setInternetSpeed(speed);
    } catch (error) {
      logger.error('Error checking internet speed:', error);
      setInternetSpeed(0);
    }
  };

  // Auto test speakers
  const autoTestSpeakers = useCallback(async () => {
    if (!testAudio) {
      setSpeakerStatus('error');
      return;
    }

    // Prevent multiple auto tests from re-renders
    if (hasAutoTestedRef.current) return;

    try {
      hasAutoTestedRef.current = true;
      setIsTesting(true);
      setSpeakerStatus('checking');

      // Reset audio to ensure it's ready to play
      testAudio.currentTime = 0;

      // Add temporary error handler for this test
      const handleAudioError = (event: string | Event) => {
        logger.error('Audio playback error during auto test:', event);
        setSpeakerStatus('error');
        setIsTesting(false);
      };

      testAudio.onerror = handleAudioError;

      await testAudio.play();
      setSpeakerStatus('success');

      // Stop audio after 1 second
      setTimeout(() => {
        if (testAudio) {
          testAudio.pause();
          testAudio.currentTime = 0;
          setIsTesting(false);
        }
      }, 1000);
    } catch (error) {
      logger.error('Error playing test audio:', error);
      setSpeakerStatus('error');
      setIsTesting(false);
    }
  }, [testAudio, setIsTesting, setSpeakerStatus]);

  // Initialize face detector on component mount
  useEffect(() => {
    // Set up global error handler to suppress MediaPipe informational messages
    const originalErrorHandler = window.onerror;

    const handleError = (
      message: string | Event,
      source?: string,
      lineno?: number,
      colno?: number,
      error?: Error
    ): boolean => {
      // Enhanced suppression of MediaPipe/TensorFlow informational messages
      const messageStr =
        typeof message === 'string' ? message : String(message);
      const sourceStr = source || '';
      const errorStr = error ? error.message || error.toString() : '';

      const isMediaPipeInfo =
        messageStr.includes('TensorFlow Lite') ||
        messageStr.includes('XNNPACK delegate') ||
        messageStr.includes('Created TensorFlow Lite') ||
        messageStr.includes('INFO:') ||
        sourceStr.includes('mediapipe') ||
        sourceStr.includes('vision_wasm_internal') ||
        sourceStr.includes('tasks-vision') ||
        errorStr.includes('TensorFlow Lite') ||
        errorStr.includes('XNNPACK') ||
        errorStr.includes('mediapipe') ||
        (error &&
          error.stack &&
          (error.stack.includes('mediapipe') ||
            error.stack.includes('vision_wasm_internal') ||
            error.stack.includes('put_char') ||
            error.stack.includes('write') ||
            error.stack.includes('doWritev') ||
            error.stack.includes('_fd_write')));

      if (isMediaPipeInfo) {
        return true; // Prevent default error handling
      }

      // Call original handler for real errors
      if (originalErrorHandler) {
        return originalErrorHandler(message, source, lineno, colno, error);
      }
      return false;
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Enhanced suppression of MediaPipe-related promise rejections
      if (event.reason) {
        const reasonStr =
          typeof event.reason === 'string'
            ? event.reason
            : String(event.reason);
        const isMediaPipeInfo =
          reasonStr.includes('TensorFlow Lite') ||
          reasonStr.includes('XNNPACK delegate') ||
          reasonStr.includes('Created TensorFlow Lite') ||
          reasonStr.includes('INFO:') ||
          reasonStr.includes('mediapipe') ||
          reasonStr.includes('vision_wasm_internal') ||
          (event.reason instanceof Error &&
            event.reason.stack &&
            (event.reason.stack.includes('mediapipe') ||
              event.reason.stack.includes('vision_wasm_internal') ||
              event.reason.stack.includes('put_char') ||
              event.reason.stack.includes('write') ||
              event.reason.stack.includes('doWritev') ||
              event.reason.stack.includes('_fd_write')));

        if (isMediaPipeInfo) {
          event.preventDefault();
          return;
        }
      }
    };

    window.onerror = handleError;
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    initializeFaceDetector();

    // Cleanup function to restore original error handlers
    return () => {
      window.onerror = originalErrorHandler;
      window.removeEventListener(
        'unhandledrejection',
        handleUnhandledRejection
      );
    };
  }, [initializeFaceDetector]);

  useEffect(() => {
    let isMounted = true;
    const _mediaStream: MediaStream | null = null;

    // Check camera, microphone, and location separately
    const checkPermissions = async () => {
      try {
        // Request camera and microphone permissions separately
        let cameraStream: MediaStream | null = null;
        let micStream: MediaStream | null = null;
        let combinedStream: MediaStream | null = null;

        // Try to get camera permission first
        try {
          cameraStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
          setCameraStatus('success');
        } catch (cameraError) {
          logger.error('Camera permission denied:', cameraError);
          setCameraStatus('error');
        }

        // Try to get microphone permission separately
        try {
          micStream = await navigator.mediaDevices.getUserMedia({
            video: false,
            audio: true,
          });
          setMicStatus('success');
        } catch (micError) {
          logger.error('Microphone permission denied:', micError);
          setMicStatus('error');
        }

        // If we have both streams, combine them
        if (cameraStream && micStream) {
          // Combine video and audio tracks
          combinedStream = new MediaStream([
            ...cameraStream.getVideoTracks(),
            ...micStream.getAudioTracks(),
          ]);
        } else if (cameraStream) {
          // Only camera available
          combinedStream = cameraStream;
        } else if (micStream) {
          // Only microphone available
          combinedStream = micStream;
        }

        if (!isMounted) {
          if (cameraStream)
            cameraStream.getTracks().forEach((track) => track.stop());
          if (micStream) micStream.getTracks().forEach((track) => track.stop());
          if (combinedStream)
            combinedStream.getTracks().forEach((track) => track.stop());
          return;
        }

        if (combinedStream) {
          setStream(combinedStream);
          globalStreamRef.current = combinedStream; // Store globally for reliable cleanup
        }

        // Set up video element if we have camera
        if (videoRef.current && cameraStream) {
          // Only set srcObject if it's different to prevent flickering
          if (videoRef.current.srcObject !== cameraStream) {
            videoRef.current.srcObject = cameraStream;
          }

          // Start face detection once video is ready and face detector is initialized
          videoRef.current.onloadedmetadata = () => {
            setVideoReady(true);
            if (isMounted && faceDetector) {
              startFaceDetection();
            }
          };

          // Add error handling for video
          videoRef.current.onerror = (error) => {
            logger.error('Video error:', error);
            setCameraStatus('error');
          };
        }

        // Set up audio analysis for microphone volume if we have audio
        if (micStream && !audioContextRef.current) {
          audioContextRef.current = new AudioContext();
          analyserRef.current = audioContextRef.current.createAnalyser();
          const source =
            audioContextRef.current.createMediaStreamSource(micStream);
          source.connect(analyserRef.current);
          analyserRef.current.fftSize = 256;

          const updateMicVolume = () => {
            if (!isMounted || !analyserRef.current) return;

            const dataArray = new Uint8Array(
              analyserRef.current.frequencyBinCount
            );
            analyserRef.current.getByteFrequencyData(dataArray);
            const average =
              dataArray.reduce((a, b) => a + b) / dataArray.length;
            setMicVolume(average);

            if (isMounted) {
              animationFrameRef.current =
                requestAnimationFrame(updateMicVolume);
            }
          };
          updateMicVolume();
        }

        // Request location permission
        checkLocation();

        // Auto test speakers
        autoTestSpeakers();
      } catch (error) {
        logger.error('Error accessing media devices:', error);
        if (isMounted) {
          setCameraStatus('error');
          setMicStatus('error');
          setFaceDetectionStatus('error');
        }
      }
    };

    checkPermissions();
    checkInternetSpeed();

    // Reset testing state on page load
    setIsTesting(false);

    return () => {
      isMounted = false;
      hasAutoTestedRef.current = false;
      setVideoReady(false);

      // Aggressive cleanup for browser navigation
      cleanupResources();

      // Additional fallback cleanup is handled by cleanupResources function
    };
  }, [faceDetector, startFaceDetection]);

  const handleStartAssessment = () => {
    if (!termsAccepted) return;
    cleanupResources();
    startAssessment();
  };

  const handleTakeLater = () => {
    cleanupResources();
    router.back();
  };

  const handleTestSpeakers = async () => {
    if (!testAudio) {
      setSpeakerStatus('error');
      return;
    }

    try {
      setIsTesting(true);
      setSpeakerStatus('checking');

      // Reset audio to ensure it's ready to play
      testAudio.currentTime = 0;

      // Add temporary error handler for this test
      const handleAudioError = (event: string | Event) => {
        logger.error('Audio playback error during test:', event);
        setSpeakerStatus('error');
        setIsTesting(false);
      };

      testAudio.onerror = handleAudioError;

      await testAudio.play();
      setSpeakerStatus('success');

      // Stop audio after 1 second
      setTimeout(() => {
        if (testAudio) {
          testAudio.pause();
          testAudio.currentTime = 0;
          setIsTesting(false);
        }
      }, 1000);
    } catch (error) {
      logger.error('Error playing test audio:', error);
      setSpeakerStatus('error');
      setIsTesting(false);
    }
  };

  const isSystemReady =
    cameraStatus === 'success' &&
    micStatus === 'success' &&
    faceDetectionStatus === 'success' &&
    speakerStatus === 'success' &&
    internetSpeed !== null &&
    internetSpeed > INTERNET_SPEED_THRESHOLD &&
    termsAccepted;

  return (
    <TooltipProvider>
      <div className="bg-background min-h-screen">
        {/* Fixed Navigation Bar */}
        <div className="border-border bg-card fixed top-0 right-0 left-0 z-50 border-b shadow-sm">
          <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
            <Button
              variant="ghost"
              onClick={handleTakeLater}
              className="text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div className="flex items-center gap-3">
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
              <Button
                variant="outline"
                onClick={handleTakeLater}
                className="border-border text-foreground hover:bg-accent hover:text-accent-foreground"
              >
                I&apos;ll take it later
              </Button>
              <div data-tour="start-assessment-button">
                <Button
                  size="default"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={handleStartAssessment}
                  disabled={!termsAccepted || !isSystemReady}
                  title={
                    !termsAccepted
                      ? 'Please accept the terms and conditions'
                      : !isSystemReady
                        ? 'Please complete all system checks'
                        : 'I am ready, start the assessment'
                  }
                >
                  {!termsAccepted
                    ? 'Please accept the terms and conditions'
                    : !isSystemReady
                      ? 'Please complete all system checks'
                      : 'I am ready, start the assessment'}
                  <Clock className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content with Padding for Fixed Nav */}
        <div className="container mx-auto max-w-7xl px-4 pt-24 pb-8">
          {/* Tour Modal Container */}
          <div data-tour="modal-container" className="hidden" />

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Left Column - Instructions and Terms */}
            <div className="space-y-6">
              <div data-tour="assessment-title-section">
                <Card className="bg-card border-none shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-foreground text-xl">
                      {title}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground text-base">
                      {description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border-border bg-muted rounded-lg border p-6">
                        <h3 className="text-muted-foreground mb-3 text-sm">
                          <strong>Important Information</strong>
                        </h3>
                        <ul className="text-muted-foreground space-y-2 text-sm">
                          {importantInformation.map((info) => (
                            <li
                              key={info.text}
                              className="flex items-start gap-2"
                            >
                              <span>
                                <info.icon
                                  className={`mt-0.5 h-4 w-4 flex-shrink-0 ${info.color}`}
                                />
                              </span>
                              <span>{info.text}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div data-tour="terms-and-conditions-section">
                <Card className="bg-card border-none shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-foreground text-xl">
                      Candidate consent and acknowledgement
                    </CardTitle>
                    <CardDescription className="text-muted-foreground text-base">
                      Please read and accept the terms before starting
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border-border bg-muted text-muted-foreground rounded-lg border p-4 text-sm">
                        <p className="mb-2">
                          <strong>
                            By participating in the Teamcast.ai recruitment
                            process, including AI interviews, skills
                            assessments, and psychometric evaluations, I
                            acknowledge that:
                          </strong>
                        </p>
                        <ul className="space-y-2 pt-1.5">
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="text-success mt-0.5 h-4 w-4 flex-shrink-0" />
                            <span>
                              I have read and understood this Privacy Policy
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="text-success mt-0.5 h-4 w-4 flex-shrink-0" />
                            <span>
                              I consent to the collection, processing, and use
                              of my personal data as described
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="text-success mt-0.5 h-4 w-4 flex-shrink-0" />
                            <span>
                              I understand that AI agents will process my
                              information for recruitment purposes
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="text-success mt-0.5 h-4 w-4 flex-shrink-0" />
                            <span>
                              I agree to the international transfer of my data
                              as necessary for service provision
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="text-success mt-0.5 h-4 w-4 flex-shrink-0" />
                            <span>
                              I understand my rights and how to exercise them
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="text-success mt-0.5 h-4 w-4 flex-shrink-0" />
                            <span>
                              I consent to sharing my information with potential
                              employers and clients
                            </span>
                          </li>
                        </ul>
                      </div>
                      <div className="border-border bg-muted text-muted-foreground rounded-lg border p-4 text-sm">
                        <p className="mb-2">
                          <strong>
                            Special Consent for Sensitive Data Processing:
                          </strong>
                        </p>
                        <ul className="list-inside list-none space-y-2">
                          <li>
                            Where applicable, I provide explicit consent for the
                            processing of sensitive personal data including
                            psychometric assessments, biometric identifiers, and
                            other sensitive information relevant to recruitment.
                          </li>
                        </ul>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="terms"
                            checked={termsAccepted}
                            data-tour="accept-terms-and-conditions-button"
                            onChange={(e) => {
                              const newValue = e.target.checked;
                              // Make API call to update terms acceptance
                              handleTermsAcceptance(newValue);
                            }}
                            disabled={isUpdatingTerms}
                            className="border-input bg-background checked:bg-primary h-4 w-4 rounded disabled:opacity-50"
                          />
                          {isUpdatingTerms && (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          )}
                        </div>
                        <label
                          htmlFor="terms"
                          className="text-foreground text-sm"
                        >
                          {isUpdatingTerms ? 'Updating...' : 'I accept '}
                        </label>
                        <button
                          onClick={() => window.open('/terms', '_blank')}
                          className="text-primary flex cursor-pointer items-center gap-1 text-sm"
                        >
                          Terms
                          <SquareArrowOutUpRight className="h-4 w-4" />
                        </button>
                        <p>and</p>
                        <button
                          onClick={() =>
                            window.open('/privacy/candidate', '_blank')
                          }
                          className="text-primary flex cursor-pointer items-center gap-1 text-sm"
                        >
                          Candidate Policy
                          <SquareArrowOutUpRight className="h-4 w-4" />
                        </button>
                      </div>
                      {termsError && (
                        <div className="mt-2 flex items-center justify-between rounded-md bg-red-50 p-2 dark:bg-red-900/20">
                          <span className="text-sm text-red-600 dark:text-red-400">
                            {termsError}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTermsAcceptance(termsAccepted)}
                            className="h-6 px-2 text-xs text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/30"
                          >
                            Retry
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="mb-8" data-tour="system-check-summary-section">
                <SystemCheckProgress
                  cameraStatus={cameraStatus}
                  micStatus={micStatus}
                  speakerStatus={speakerStatus}
                  internetSpeed={internetSpeed}
                  termsAccepted={termsAccepted}
                  locationStatus={locationStatus}
                  faceDetectionStatus={faceDetectionStatus}
                />
              </div>
            </div>

            {/* Right Column - System Requirements */}
            <div className="space-y-6">
              <div data-tour="system-requirements-section">
                <Card className="bg-card border-none shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-foreground text-xl">
                      System Requirements Check
                    </CardTitle>
                    <CardDescription className="text-muted-foreground text-base">
                      Let&apos;s verify your setup to ensure a smooth assessment
                      experience
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6">
                      {/* Camera Check */}
                      <div className="space-y-4" data-tour="camera-check">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Camera className="text-primary h-5 w-5" />
                            <span className="text-foreground font-medium">
                              Camera
                            </span>
                          </div>
                          {cameraStatus === 'checking' && (
                            <div className="border-muted border-t-primary h-4 w-4 animate-spin rounded-full border-2" />
                          )}
                          {cameraStatus === 'success' && (
                            <CheckCircle2 className="text-success h-5 w-5" />
                          )}
                          {cameraStatus === 'error' && (
                            <XCircle className="text-destructive h-5 w-5" />
                          )}
                        </div>
                        <div className="bg-muted relative aspect-video overflow-hidden rounded-lg">
                          {!videoReady && cameraStatus === 'checking' && (
                            <div className="bg-muted absolute inset-0 z-10 flex items-center justify-center">
                              <div className="text-muted-foreground flex items-center gap-2">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                <span className="text-sm">
                                  Initializing camera...
                                </span>
                              </div>
                            </div>
                          )}
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className={`h-full w-full object-cover transition-opacity duration-300 ${
                              videoReady ? 'opacity-100' : 'opacity-0'
                            }`}
                            style={{
                              transform: 'scaleX(-1)', // Mirror the video
                              willChange: 'auto', // Optimize for performance
                              backfaceVisibility: 'hidden', // Prevent flickering
                            }}
                          />
                          {/* Hidden canvas for face detection */}
                          <canvas
                            ref={canvasRef}
                            className="hidden"
                            style={{ display: 'none' }}
                          />
                          {/* Face detection overlay */}
                          {faceDetectionStatus === 'success' && (
                            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                              <div className="bg-success/20 border-success rounded-full border-2 p-2">
                                <User className="text-success h-6 w-6" />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Face Detection Check */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <User className="text-primary h-5 w-5" />
                            <span className="text-foreground font-medium">
                              Face Detection
                            </span>
                          </div>
                          {faceDetectionStatus === 'checking' && (
                            <div className="border-muted border-t-primary h-4 w-4 animate-spin rounded-full border-2" />
                          )}
                          {faceDetectionStatus === 'success' && (
                            <CheckCircle2 className="text-success h-5 w-5" />
                          )}
                          {faceDetectionStatus === 'error' && (
                            <XCircle className="text-destructive h-5 w-5" />
                          )}
                        </div>
                        <div className="border-border bg-muted rounded-lg border p-4">
                          <p className="text-muted-foreground text-sm">
                            {faceDetectionStatus === 'success'
                              ? 'Face detected successfully using MediaPipe AI'
                              : faceDetectionStatus === 'error'
                                ? 'Please ensure your face is clearly visible in the camera'
                                : 'Position your face in the camera view...'}
                          </p>
                        </div>
                      </div>

                      {/* Microphone Check */}
                      <div className="space-y-4" data-tour="microphone-check">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Mic className="text-primary h-5 w-5" />
                            <span className="text-foreground font-medium">
                              Microphone
                            </span>
                          </div>
                          {micStatus === 'checking' && (
                            <div className="border-muted border-t-primary h-4 w-4 animate-spin rounded-full border-2" />
                          )}
                          {micStatus === 'success' && (
                            <CheckCircle2 className="text-success h-5 w-5" />
                          )}
                          {micStatus === 'error' && (
                            <XCircle className="text-destructive h-5 w-5" />
                          )}
                        </div>
                        <div className="border-border bg-muted rounded-lg border p-4">
                          <div className="bg-muted mb-2 flex h-2 w-full items-center gap-1 overflow-hidden rounded-full">
                            {Array.from({ length: 20 }).map((_, i) => (
                              <div
                                key={i}
                                className="bg-primary h-full flex-1 rounded-full"
                                style={{
                                  opacity: micVolume > i * 12.75 ? 1 : 0.3,
                                  transition: 'opacity 100ms ease-in-out',
                                }}
                              />
                            ))}
                          </div>
                          <p className="text-muted-foreground text-sm">
                            {micStatus === 'success'
                              ? 'Speak to test your microphone'
                              : micStatus === 'error'
                                ? 'Please check your microphone settings'
                                : 'Checking microphone...'}
                          </p>
                        </div>
                      </div>

                      {/* Speaker Check */}
                      <div className="space-y-4" data-tour="speaker-check">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Headphones className="text-primary h-5 w-5" />
                            <span className="text-foreground font-medium">
                              Speakers
                            </span>
                          </div>
                          {speakerStatus === 'checking' && (
                            <div className="border-muted border-t-primary h-4 w-4 animate-spin rounded-full border-2" />
                          )}
                          {speakerStatus === 'success' && (
                            <CheckCircle2 className="text-success h-5 w-5" />
                          )}
                          {speakerStatus === 'error' && (
                            <XCircle className="text-destructive h-5 w-5" />
                          )}
                        </div>
                        <div className="border-border bg-muted flex items-center justify-between rounded-lg border p-4">
                          <p className="text-muted-foreground text-sm">
                            {speakerStatus === 'success'
                              ? 'Speakers are working properly'
                              : speakerStatus === 'error'
                                ? 'Please check your speaker settings'
                                : speakerStatus === 'checking'
                                  ? 'Testing speakers...'
                                  : 'Click the speaker icon to test your audio'}
                          </p>
                          <div className="h-10 w-10">
                            {!isTesting && speakerStatus !== 'success' && (
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={handleTestSpeakers}
                                disabled={speakerStatus === 'checking'}
                                className={`h-10 w-10 transition-all duration-200 ${
                                  speakerStatus === 'error'
                                    ? 'border-destructive text-destructive hover:bg-destructive/10'
                                    : 'hover:bg-primary/10'
                                }`}
                              >
                                {speakerStatus === 'checking' ? (
                                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                ) : speakerStatus === 'error' ? (
                                  <XCircle className="h-5 w-5" />
                                ) : (
                                  <Headphones className="h-5 w-5" />
                                )}
                              </Button>
                            )}
                            {isTesting && (
                              <Button
                                variant="outline"
                                size="icon"
                                disabled
                                className="h-10 w-10"
                              >
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Location Check */}
                      <div className="space-y-4" data-tour="location-check">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Globe className="text-primary h-5 w-5" />
                            <span className="text-foreground font-medium">
                              Location (Optional)
                            </span>
                          </div>
                          {locationStatus === 'checking' && (
                            <div className="border-muted border-t-primary h-4 w-4 animate-spin rounded-full border-2" />
                          )}
                          {locationStatus === 'success' && (
                            <CheckCircle2 className="text-success h-5 w-5" />
                          )}
                          {locationStatus === 'error' && (
                            <XCircle className="text-destructive h-5 w-5" />
                          )}
                        </div>
                        <div className="border-border bg-muted rounded-lg border p-4">
                          <div className="flex items-center justify-between">
                            <p className="text-muted-foreground text-sm">
                              {locationStatus === 'success' && location
                                ? `Location detected: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
                                : locationStatus === 'error'
                                  ? locationError ||
                                    'Please enable location access'
                                  : 'Checking location access...'}
                            </p>
                            {locationStatus === 'error' && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-primary text-primary hover:bg-primary/10"
                                onClick={checkLocation}
                              >
                                <Globe className="mr-2 h-4 w-4" />
                                Retest
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Internet Speed Check */}
                      <div
                        className="space-y-4"
                        data-tour="internet-speed-check"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Wifi className="text-primary h-5 w-5" />
                            <span className="text-foreground font-medium">
                              Internet Speed
                            </span>
                          </div>
                          {internetSpeed === null ? (
                            <div className="border-muted border-t-primary h-4 w-4 animate-spin rounded-full border-2" />
                          ) : internetSpeed > INTERNET_SPEED_THRESHOLD ? (
                            <CheckCircle2 className="text-success h-5 w-5" />
                          ) : (
                            <XCircle className="text-destructive h-5 w-5" />
                          )}
                        </div>
                        <div className="border-border bg-muted flex items-center justify-between rounded-lg border p-4">
                          <p className="text-muted-foreground text-sm">
                            {internetSpeed === null
                              ? 'Checking internet speed...'
                              : internetSpeed > INTERNET_SPEED_THRESHOLD
                                ? `Internet speed: ${internetSpeed} Mbps (Good)`
                                : `Internet speed: ${internetSpeed} Mbps (Poor - Please check your connection)`}
                          </p>
                          {internetSpeed !== null &&
                            internetSpeed <= INTERNET_SPEED_THRESHOLD && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={checkInternetSpeed}
                                className="border-primary text-primary hover:bg-primary/10 ml-2"
                              >
                                <Wifi className="mr-2 h-4 w-4" />
                                Retest
                              </Button>
                            )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default AssessmentCheck;

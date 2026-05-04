import {
  ArrowLeft,
  Video,
  CheckCircle,
  Clock,
  MapPin,
  Headphones,
  LucideIcon,
  Mic,
  Wifi,
  Check,
  Moon,
  Sun,
  XCircle,
  Loader2,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { logger } from '@/lib/logger';
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

interface AssessmentCheckV2Props {
  startAssessment: () => void;
  title: string;
  description: string;
  importantInformation: importantInfo[];
  assessmentId?: string;
  inviteId?: string;
}

const AssessmentCheckV2 = ({
  startAssessment,
  title,
  description,
  importantInformation,
}: AssessmentCheckV2Props) => {
  const router = useRouter();
  const { user } = useApp();
  const { theme, setTheme } = useTheme();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const [stream, setStream] = useState<MediaStream | null>(null);
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
      audio.onerror = (error) => {
        logger.error('Audio element error:', error);
      };
      return audio;
    }
    return null;
  });
  const [_locationError, setLocationError] = useState<string | null>(null);
  const [faceDetector, setFaceDetector] = useState<FaceDetector | null>(null);
  const faceDetectionStatusRef = useRef(faceDetectionStatus);
  const hasAutoTestedRef = useRef(false);
  const hasScrolledToTermsRef = useRef(false);
  const termsSectionRef = useRef<HTMLDivElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [cameraErrorMessage, setCameraErrorMessage] = useState<string | null>(
    null
  );

  const candidateAssessmentService = useMemo(
    () => new CandidateOnboardingAssessmentApiService(apiClient),
    []
  );

  const INTERNET_SPEED_THRESHOLD = ENV.NEXT_PUBLIC_INTERNET_SPEED_THRESHOLD;

  // Fetch current terms acceptance status
  const fetchTermsAcceptanceStatus = useCallback(async () => {
    if (!user?.candidateId) {
      return;
    }

    try {
      const latestAssessment =
        await candidateAssessmentService.getLatestAssessment();
      setTermsAccepted(latestAssessment.termsAccepted || false);
      logger.info('Fetched terms acceptance status from latest assessment', {
        assessmentId: latestAssessment.id,
        status: latestAssessment.termsAccepted,
      });
    } catch (_error) {
      logger.info(
        'No assessment found yet, setting terms accepted to false by default'
      );
      setTermsAccepted(false);
    }
  }, [user?.candidateId, candidateAssessmentService]);

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

    if (isUpdatingTerms) {
      return;
    }

    setIsUpdatingTerms(true);
    try {
      const result =
        await candidateAssessmentService.updateTermsAccepted(accepted);

      setTermsAccepted(accepted);
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
      setTermsAccepted(!accepted);

      let errorMessage = 'Failed to update terms acceptance. Please try again.';

      if (error instanceof Error) {
        if (error.message.includes('Terms accepted must be a boolean')) {
          errorMessage = 'Invalid request. Please try again.';
        } else if (error.message.includes('Candidate ID is required')) {
          errorMessage = 'Authentication error. Please log in again.';
        }
      }

      setTermsError(errorMessage);
      toast.error(errorMessage);
      setTimeout(() => setTermsError(null), 5000);
    } finally {
      setIsUpdatingTerms(false);
    }
  };

  useEffect(() => {
    faceDetectionStatusRef.current = faceDetectionStatus;
  }, [faceDetectionStatus]);

  // Cleanup function to stop all media and audio resources
  const cleanupResources = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop();
      });
    }

    if (globalStreamRef.current) {
      globalStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      globalStreamRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
      analyserRef.current = null;
    }

    if (testAudio) {
      testAudio.pause();
      testAudio.currentTime = 0;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = undefined;
    }

    setStream(null);
  }, [stream, testAudio]);

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

    window.addEventListener('popstate', handleBrowserBack);
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('popstate', handleBrowserBack);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [cleanupResources]);

  // Initialize MediaPipe Face Detector
  const initializeFaceDetector = useCallback(async () => {
    try {
      // eslint-disable-next-line no-console
      const originalConsoleError = console.error;
      // eslint-disable-next-line no-console
      console.error = (...args) => {
        const message = args[0];
        const messageStr =
          typeof message === 'string' ? message : String(message);

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

        for (const detection of detections.detections) {
          const boundingBox = detection.boundingBox;
          if (!boundingBox) continue;

          const faceWidth = boundingBox.width;
          const faceHeight = boundingBox.height;
          const faceArea = faceWidth * faceHeight;
          const frameArea = canvas.width * canvas.height;
          const facePercentage = (faceArea / frameArea) * 100;

          const isLargeEnough = facePercentage >= 5;
          const isWellPositioned =
            boundingBox.originX > 0 &&
            boundingBox.originY > 0 &&
            boundingBox.originX + boundingBox.width < canvas.width &&
            boundingBox.originY + boundingBox.height < canvas.height;

          const centerX = boundingBox.originX + boundingBox.width / 2;
          const centerY = boundingBox.originY + boundingBox.height / 2;
          const frameCenterX = canvas.width / 2;
          const frameCenterY = canvas.height / 2;
          const distanceFromCenter = Math.sqrt(
            Math.pow(centerX - frameCenterX, 2) +
              Math.pow(centerY - frameCenterY, 2)
          );
          const maxDistance = Math.min(canvas.width, canvas.height) * 0.3;
          const isCentered = distanceFromCenter < maxDistance;

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
    const hasEnoughSkinTone = skinPercentage > 8;

    if (hasEnoughSkinTone) {
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
      const mediaPipeResult = await detectFace();
      if (mediaPipeResult) return true;

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
    const maxDetectionAttempts = 30;

    const renderLoop = async () => {
      if (cameraStatus === 'success' && videoRef.current?.readyState === 4) {
        try {
          const hasFace = await detectFaceCombined();
          detectionCount++;

          if (hasFace) {
            setFaceDetectionStatus('success');
            return;
          }

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

      if (
        faceDetectionStatusRef.current !== 'success' &&
        faceDetectionStatusRef.current !== 'error'
      ) {
        setTimeout(() => {
          if (
            faceDetectionStatusRef.current !== 'success' &&
            faceDetectionStatusRef.current !== 'error'
          ) {
            requestAnimationFrame(renderLoop);
          }
        }, 1000);
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
          timeout: 10000,
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
      setInternetSpeed(null);
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

    if (hasAutoTestedRef.current) return;

    try {
      hasAutoTestedRef.current = true;
      setSpeakerStatus('checking');

      testAudio.currentTime = 0;

      const handleAudioError = (event: string | Event) => {
        logger.error('Audio playback error during auto test:', event);
        setSpeakerStatus('error');
      };

      testAudio.onerror = handleAudioError;

      await testAudio.play();
      setSpeakerStatus('success');

      setTimeout(() => {
        if (testAudio) {
          testAudio.pause();
          testAudio.currentTime = 0;
        }
      }, 1000);
    } catch (error) {
      logger.error('Error playing test audio:', error);
      setSpeakerStatus('error');
    }
  }, [testAudio]);

  // Initialize face detector on component mount
  useEffect(() => {
    const originalErrorHandler = window.onerror;

    const handleError = (
      message: string | Event,
      source?: string,
      lineno?: number,
      colno?: number,
      error?: Error
    ): boolean => {
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
        return true;
      }

      if (originalErrorHandler) {
        return originalErrorHandler(message, source, lineno, colno, error);
      }
      return false;
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
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

    const checkPermissions = async () => {
      try {
        let cameraStream: MediaStream | null = null;
        let micStream: MediaStream | null = null;
        let combinedStream: MediaStream | null = null;

        try {
          cameraStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
          setCameraStatus('success');
          setCameraErrorMessage(null);
        } catch (cameraError) {
          logger.error('Camera permission denied:', cameraError);
          setCameraStatus('error');
          const err =
            cameraError instanceof Error
              ? cameraError
              : new Error(String(cameraError));
          const isTimeout =
            err.name === 'AbortError' || /timeout|timed out/i.test(err.message);
          setCameraErrorMessage(
            isTimeout
              ? 'Camera timed out. Close other apps using the camera (Zoom, Teams, etc.) and try again.'
              : 'Camera access failed. Please allow camera permission and try again.'
          );
        }

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

        if (cameraStream && micStream) {
          combinedStream = new MediaStream([
            ...cameraStream.getVideoTracks(),
            ...micStream.getAudioTracks(),
          ]);
        } else if (cameraStream) {
          combinedStream = cameraStream;
        } else if (micStream) {
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
          globalStreamRef.current = combinedStream;
        }

        if (videoRef.current && cameraStream) {
          if (videoRef.current.srcObject !== cameraStream) {
            videoRef.current.srcObject = cameraStream;
          }

          videoRef.current.onloadedmetadata = () => {
            setVideoReady(true);
            if (isMounted && faceDetector) {
              startFaceDetection();
            }
          };

          videoRef.current.onerror = (error) => {
            logger.error('Video error:', error);
            setCameraStatus('error');
          };
        }

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

        checkLocation();
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

    return () => {
      isMounted = false;
      hasAutoTestedRef.current = false;
      setVideoReady(false);
      cleanupResources();
    };
  }, [faceDetector, startFaceDetection]);

  const retryCamera = useCallback(async () => {
    setCameraStatus('checking');
    setCameraErrorMessage(null);
    setVideoReady(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      setStream(stream);
      globalStreamRef.current = stream;
      setCameraStatus('success');
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setVideoReady(true);
          if (faceDetector) startFaceDetection();
        };
      }
    } catch (cameraError) {
      logger.error('Camera retry failed:', cameraError);
      setCameraStatus('error');
      const err =
        cameraError instanceof Error
          ? cameraError
          : new Error(String(cameraError));
      const isTimeout =
        err.name === 'AbortError' || /timeout|timed out/i.test(err.message);
      setCameraErrorMessage(
        isTimeout
          ? 'Camera timed out. Close other apps using the camera (Zoom, Teams, etc.) and try again.'
          : 'Camera access failed. Please allow camera permission and try again.'
      );
    }
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
      setSpeakerStatus('checking');

      testAudio.currentTime = 0;

      const handleAudioError = (event: string | Event) => {
        logger.error('Audio playback error during test:', event);
        setSpeakerStatus('error');
      };

      testAudio.onerror = handleAudioError;

      await testAudio.play();
      setSpeakerStatus('success');

      setTimeout(() => {
        if (testAudio) {
          testAudio.pause();
          testAudio.currentTime = 0;
        }
      }, 1000);
    } catch (error) {
      logger.error('Error playing test audio:', error);
      setSpeakerStatus('error');
    }
  };

  const allSystemChecksPassed =
    cameraStatus === 'success' &&
    micStatus === 'success' &&
    faceDetectionStatus === 'success' &&
    speakerStatus === 'success' &&
    internetSpeed !== null &&
    internetSpeed > INTERNET_SPEED_THRESHOLD;

  const isSystemReady = allSystemChecksPassed && termsAccepted;

  // Auto-scroll to terms section when all system checks pass (so user can accept terms)
  useEffect(() => {
    if (
      allSystemChecksPassed &&
      !termsAccepted &&
      !hasScrolledToTermsRef.current &&
      termsSectionRef.current
    ) {
      hasScrolledToTermsRef.current = true;
      termsSectionRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [allSystemChecksPassed, termsAccepted]);

  // Camera preview shows "Connected" only when camera is on AND MediaPipe has detected a face
  const cameraPreviewStatus: 'checking' | 'success' | 'error' =
    cameraStatus === 'error' || faceDetectionStatus === 'error'
      ? 'error'
      : cameraStatus === 'success' && faceDetectionStatus === 'success'
        ? 'success'
        : 'checking';

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const StatusIndicator = ({
    status,
  }: {
    status: 'checking' | 'success' | 'error';
  }) => (
    <AnimatePresence mode="wait">
      {status === 'checking' && (
        <motion.span
          key="checking"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="flex items-center gap-1.5 text-sm font-medium text-amber-500 dark:text-amber-400"
        >
          <Loader2 className="h-4 w-4 animate-spin" />
          Checking...
        </motion.span>
      )}
      {status === 'success' && (
        <motion.span
          key="success"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="flex items-center gap-2 text-sm font-medium text-emerald-500"
        >
          <CheckCircle className="h-4 w-4" />
          Connected
        </motion.span>
      )}
      {status === 'error' && (
        <motion.span
          key="error"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="flex items-center gap-2 text-sm font-medium text-red-500 dark:text-red-400"
        >
          <XCircle className="h-4 w-4" />
          Disconnected
        </motion.span>
      )}
    </AnimatePresence>
  );

  const StatusIcon = ({
    status,
  }: {
    status: 'checking' | 'success' | 'error' | 'idle';
  }) => (
    <AnimatePresence mode="wait">
      {(status === 'checking' || status === 'idle') && (
        <motion.span
          key="checking"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Loader2 className="text-primary h-4 w-4 animate-spin" />
        </motion.span>
      )}
      {status === 'success' && (
        <motion.span
          key="success"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
        >
          <CheckCircle className="h-4 w-4 text-emerald-500" />
        </motion.span>
      )}
      {status === 'error' && (
        <motion.span
          key="error"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
        >
          <XCircle className="h-4 w-4 text-red-500 dark:text-red-400" />
        </motion.span>
      )}
    </AnimatePresence>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-[90rem] items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleTakeLater}
              className="hover:text-primary flex cursor-pointer items-center gap-2 text-slate-500 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="font-medium">Back</span>
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={toggleTheme}
              className="cursor-pointer rounded-full p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Sun className="h-5 w-5 dark:hidden" />
              <Moon className="hidden h-5 w-5 text-yellow-400 dark:block" />
            </button>
            <button
              type="button"
              onClick={handleTakeLater}
              className="cursor-pointer rounded-lg px-5 py-2 font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              I&apos;ll take it later
            </button>
            <button
              type="button"
              onClick={handleStartAssessment}
              disabled={!termsAccepted || !isSystemReady}
              title={
                !termsAccepted
                  ? 'Please accept the terms and conditions'
                  : !isSystemReady
                    ? 'Please complete all system checks'
                    : 'I am ready, start the assessment'
              }
              className="bg-primary shadow-primary/20 flex cursor-pointer items-center gap-2 rounded-lg px-6 py-2.5 font-semibold text-white shadow-lg transition-all hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {!termsAccepted
                ? 'Please accept the terms and conditions'
                : !isSystemReady
                  ? 'Please complete all system checks'
                  : 'I am ready, start the assessment'}
              <Clock className="h-4 w-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content - wider layout */}
      <main className="mx-auto max-w-[90rem] px-6 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Column - System Checks */}
          <div className="space-y-6 lg:col-span-7">
            <motion.header
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="mb-1 text-2xl font-bold">
                System Requirements Check
              </h1>
              <p className="text-slate-500 dark:text-slate-400">
                Let&apos;s verify your setup to ensure a smooth assessment
                experience.
              </p>
            </motion.header>

            {/* Camera Preview Card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 }}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="mb-4 flex items-center justify-between px-2">
                <div className="flex items-center gap-2 font-semibold">
                  <Video className="text-primary h-5 w-5" />
                  Camera Preview
                </div>
                <StatusIndicator status={cameraPreviewStatus} />
              </div>
              <div className="group relative aspect-video overflow-hidden rounded-xl bg-slate-900">
                {!videoReady && cameraStatus === 'checking' && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900">
                    <div className="flex items-center gap-2 text-slate-400">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      <span className="text-sm">Initializing camera...</span>
                    </div>
                  </div>
                )}
                {cameraStatus === 'error' && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-slate-900 p-4 text-center">
                    <p className="text-sm text-slate-300">
                      {cameraErrorMessage ??
                        'Camera access failed. Please allow camera and try again.'}
                    </p>
                    <button
                      type="button"
                      onClick={retryCamera}
                      className="bg-primary cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-700"
                    >
                      Retry camera
                    </button>
                  </div>
                )}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`h-full w-full object-cover opacity-90 transition-opacity duration-300 ${
                    videoReady ? 'opacity-90' : 'opacity-0'
                  }`}
                  style={{
                    transform: 'scaleX(-1)',
                    willChange: 'auto',
                    backfaceVisibility: 'hidden',
                  }}
                />
                <canvas
                  ref={canvasRef}
                  className="hidden"
                  style={{ display: 'none' }}
                />
                {/* Status badge bottom-right: Connected only when MediaPipe has detected face */}
                <div className="absolute right-4 bottom-4 z-10">
                  <AnimatePresence mode="wait">
                    {cameraPreviewStatus === 'checking' && (
                      <motion.div
                        key="checking"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2 rounded-lg bg-black/50 px-3 py-2 text-sm text-white backdrop-blur-sm"
                      >
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Checking...
                      </motion.div>
                    )}
                    {cameraPreviewStatus === 'success' && (
                      <motion.div
                        key="connected"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2 rounded-lg bg-emerald-600/90 px-3 py-2 text-sm font-medium text-white backdrop-blur-sm"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Connected
                      </motion.div>
                    )}
                    {cameraPreviewStatus === 'error' && (
                      <motion.div
                        key="disconnected"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2 rounded-lg bg-red-600/90 px-3 py-2 text-sm font-medium text-white backdrop-blur-sm"
                      >
                        <XCircle className="h-4 w-4" />
                        Disconnected
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {/* Success message */}
                <AnimatePresence>
                  {faceDetectionStatus === 'success' && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute right-4 bottom-4 left-4 flex items-center gap-2 rounded-lg bg-black/40 px-4 py-2 text-sm text-white backdrop-blur-sm"
                    >
                      <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                      Face detected successfully using MediaPipe AI
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* System Checks Grid */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.1 }}
              className="grid grid-cols-1 gap-4 md:grid-cols-2"
            >
              {/* Microphone */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                className={`rounded-xl border p-5 transition-colors ${
                  micStatus === 'success'
                    ? 'border-emerald-200/80 bg-emerald-50/60 dark:border-emerald-800/50 dark:bg-emerald-900/20'
                    : 'border-red-200/80 bg-red-50/40 dark:border-red-800/50 dark:bg-red-900/20'
                }`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 font-medium">
                    <Mic className="text-primary h-5 w-5" />
                    Microphone
                  </div>
                  <StatusIcon status={micStatus} />
                </div>
                <div className="mb-2 flex h-2 gap-1">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scaleX: 0.5, opacity: 0.5 }}
                      animate={{
                        scaleX: 1,
                        opacity: micVolume > i * 42.5 ? 1 : 0.3,
                      }}
                      transition={{ duration: 0.15 }}
                      className={`flex-1 rounded-full ${
                        micVolume > i * 42.5
                          ? 'bg-primary'
                          : 'bg-slate-100 dark:bg-slate-700'
                      } ${micVolume > i * 42.5 && i === 3 ? 'animate-pulse' : ''}`}
                    />
                  ))}
                </div>
                <p className="text-xs text-slate-400">
                  Speak to test your levels
                </p>
              </motion.div>

              {/* Internet Speed */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                className={`rounded-xl border p-5 transition-colors ${
                  internetSpeed !== null &&
                  internetSpeed > INTERNET_SPEED_THRESHOLD
                    ? 'border-emerald-200/80 bg-emerald-50/60 dark:border-emerald-800/50 dark:bg-emerald-900/20'
                    : 'border-red-200/80 bg-red-50/40 dark:border-red-800/50 dark:bg-red-900/20'
                }`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 font-medium">
                    <Wifi className="text-primary h-5 w-5" />
                    Internet Speed
                  </div>
                  <StatusIcon
                    status={
                      internetSpeed === null
                        ? 'checking'
                        : internetSpeed > INTERNET_SPEED_THRESHOLD
                          ? 'success'
                          : 'error'
                    }
                  />
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-lg font-bold">
                    {internetSpeed !== null ? `${internetSpeed} Mbps` : '...'}
                  </div>
                  <AnimatePresence mode="wait">
                    {internetSpeed !== null &&
                      internetSpeed > INTERNET_SPEED_THRESHOLD && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                        >
                          Stable Connection
                        </motion.div>
                      )}
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Speakers */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                className={`rounded-xl border p-5 transition-colors ${
                  speakerStatus === 'success'
                    ? 'border-emerald-200/80 bg-emerald-50/60 dark:border-emerald-800/50 dark:bg-emerald-900/20'
                    : 'border-red-200/80 bg-red-50/40 dark:border-red-800/50 dark:bg-red-900/20'
                }`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 font-medium">
                    <Headphones className="text-primary h-5 w-5" />
                    Speakers
                  </div>
                  <StatusIcon status={speakerStatus} />
                </div>
                <button
                  type="button"
                  onClick={handleTestSpeakers}
                  disabled={
                    speakerStatus === 'checking' || speakerStatus === 'success'
                  }
                  className="w-full cursor-pointer rounded-lg border border-slate-100 bg-slate-50 py-2 text-xs font-semibold transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900"
                >
                  {speakerStatus === 'success'
                    ? 'Test Passed'
                    : 'Play Test Sound'}
                </button>
              </motion.div>

              {/* Location */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                className={`rounded-xl border p-5 transition-colors ${
                  locationStatus === 'success'
                    ? 'border-emerald-200/80 bg-emerald-50/60 dark:border-emerald-800/50 dark:bg-emerald-900/20'
                    : 'border-red-200/80 bg-red-50/40 dark:border-red-800/50 dark:bg-red-900/20'
                }`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 font-medium">
                    <MapPin className="text-primary h-5 w-5" />
                    Location
                  </div>
                  <StatusIcon status={locationStatus} />
                </div>
                <p className="font-mono text-sm text-slate-500 dark:text-slate-400">
                  {locationStatus === 'success' && location
                    ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
                    : locationStatus === 'error'
                      ? 'Unable to detect'
                      : 'Detecting...'}
                </p>
              </motion.div>
            </motion.div>

            {/* All Systems Ready Banner */}
            <AnimatePresence>
              {isSystemReady && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50 p-4 dark:border-emerald-800/30 dark:bg-emerald-900/10"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-emerald-500 p-1.5">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-emerald-900 dark:text-emerald-200">
                        All systems ready
                      </p>
                      <p className="text-sm text-emerald-700 dark:text-emerald-400">
                        You are good to start the interview.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold tracking-wider text-emerald-600 uppercase dark:text-emerald-400">
                    Verified
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column - Info & Consent (wider) */}
          <aside className="space-y-6 lg:col-span-5">
            {/* Screening Interview Info */}
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 0.08 }}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800"
            >
              <h2 className="mb-4 text-lg font-bold">{title}</h2>
              <p className="mb-6 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {description}
              </p>
              <div className="space-y-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-900/50">
                <p className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                  Important Information
                </p>
                <ul className="space-y-2.5">
                  {importantInformation.map((info, index) => (
                    <li
                      key={index}
                      className="flex gap-3 text-sm text-slate-600 dark:text-slate-300"
                    >
                      <info.icon className="text-primary mt-0.5 h-5 w-5 flex-shrink-0" />
                      {info.text}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Candidate Consent - no fixed height so instructions show without scroll */}
            <motion.div
              ref={termsSectionRef}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 0.12 }}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800"
            >
              <h2 className="mb-4 text-lg font-bold">Candidate Consent</h2>
              <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
                Please read and accept the terms before starting.
              </p>
              <div className="mb-6 rounded-xl border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50">
                <div className="space-y-4 p-4 text-sm text-slate-600 dark:text-slate-300">
                  <p className="font-medium">
                    By participating in the recruitment process, I acknowledge
                    that:
                  </p>
                  <ul className="space-y-3 pl-4 opacity-90">
                    <li className="list-disc">
                      I have read and understood the Privacy Policy in its
                      entirety.
                    </li>
                    <li className="list-disc">
                      I consent to the collection and processing of my personal
                      data as described.
                    </li>
                    <li className="list-disc">
                      I understand that AI agents will process my information
                      for recruitment purposes.
                    </li>
                    <li className="list-disc">
                      I agree to the international transfer of my data as
                      necessary for service provision.
                    </li>
                    <li className="list-disc">
                      I understand my rights regarding data access and how to
                      exercise them.
                    </li>
                    <li className="list-disc">
                      I consent to sharing information with potential employers
                      and clients.
                    </li>
                  </ul>
                  <div className="border-t border-slate-200 pt-2 dark:border-slate-700">
                    <p className="mb-2 text-xs font-bold text-slate-400 uppercase">
                      Special Consent
                    </p>
                    <p className="text-xs leading-relaxed">
                      Where applicable, I provide explicit consent for
                      processing sensitive personal data including psychometric
                      assessments and biometric identifiers.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <label className="group flex cursor-pointer items-start gap-3">
                  <div
                    className={`relative flex shrink-0 items-center ${!termsAccepted ? 'animate-pulse' : ''}`}
                  >
                    <input
                      type="checkbox"
                      id="terms-v2"
                      checked={termsAccepted}
                      onChange={(e) => {
                        const newValue = e.target.checked;
                        handleTermsAcceptance(newValue);
                      }}
                      disabled={isUpdatingTerms}
                      className={`text-primary focus:ring-primary h-5 w-5 cursor-pointer rounded-full border-slate-300 transition-all dark:border-slate-700 dark:bg-slate-800 ${!termsAccepted ? 'ring-primary ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-800' : ''}`}
                    />
                  </div>
                  <span className="text-sm text-slate-700 transition-colors group-hover:text-slate-900 dark:text-slate-300 dark:group-hover:text-white">
                    I accept the{' '}
                    <a
                      href="/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary cursor-pointer font-medium hover:underline"
                    >
                      Terms
                    </a>{' '}
                    and{' '}
                    <a
                      href="/privacy/candidate"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary cursor-pointer font-medium hover:underline"
                    >
                      Candidate Policy
                    </a>
                  </span>
                </label>
                {termsError && (
                  <div className="mt-2 flex items-center justify-between rounded-md bg-red-50 p-2 dark:bg-red-900/20">
                    <span className="text-sm text-red-600 dark:text-red-400">
                      {termsError}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleTermsAcceptance(termsAccepted)}
                      className="h-6 cursor-pointer px-2 text-xs text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/30"
                    >
                      Retry
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </aside>
        </div>
      </main>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
        }
      `}</style>
    </div>
  );
};

export default AssessmentCheckV2;

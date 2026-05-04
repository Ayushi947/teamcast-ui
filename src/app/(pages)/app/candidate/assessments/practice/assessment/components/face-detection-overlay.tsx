import { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, AlertTriangle } from 'lucide-react';
import { logger } from '@/lib/logger';

// MediaPipe imports
import { FilesetResolver, FaceDetector } from '@mediapipe/tasks-vision';

interface FaceDetectionOverlayProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isEnabled?: boolean;
  assessmentId: string;
}

export const FaceDetectionOverlay = ({
  videoRef,
  isEnabled = true,
  assessmentId,
}: FaceDetectionOverlayProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [faceDetected, setFaceDetected] = useState(false);
  const [faceDetector, setFaceDetector] = useState<FaceDetector | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [mediaPipeError, setMediaPipeError] = useState<string | null>(null);

  // NEW: Track multiple person violations and consecutive no-face frames
  const consecutiveNoFaceFramesRef = useRef<number>(0);
  const consecutiveFaceFramesRef = useRef<number>(0);
  const multiplePersonReportedRef = useRef<boolean>(false);
  const showWarningRef = useRef<boolean>(false); // Track warning state with ref to avoid stale closures

  // Configuration: Only show warning after N consecutive no-face detections
  const NO_FACE_THRESHOLD = 2; // Show warning after 2 seconds of no face
  const FACE_CONFIRMED_THRESHOLD = 1; // Hide warning after 2 seconds of face detected

  // Initialize MediaPipe Face Detector
  const initializeFaceDetector = useCallback(async () => {
    if (!isEnabled) return;

    try {
      setMediaPipeError(null);

      // Suppress console errors from MediaPipe/TensorFlow during initialization
      // eslint-disable-next-line no-console
      const originalConsoleError = console.error;
      // eslint-disable-next-line no-console
      const originalConsoleWarn = console.warn;

      // eslint-disable-next-line no-console
      console.error = (...args) => {
        const message = args[0];
        // Suppress TensorFlow Lite informational messages
        if (
          typeof message === 'string' &&
          (message.includes('TensorFlow Lite') ||
            message.includes('XNNPACK delegate') ||
            message.includes('INFO:') ||
            message.includes('WASM'))
        ) {
          return;
        }
        originalConsoleError.apply(console, args);
      };

      // eslint-disable-next-line no-console
      console.warn = (...args) => {
        const message = args[0];
        // Suppress MediaPipe warnings
        if (
          typeof message === 'string' &&
          (message.includes('MediaPipe') ||
            message.includes('TensorFlow') ||
            message.includes('WASM'))
        ) {
          return;
        }
        originalConsoleWarn.apply(console, args);
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
        minDetectionConfidence: 0.7, // Higher confidence for complete face
        minSuppressionThreshold: 0.3,
      });

      setFaceDetector(detector);
      setIsInitialized(true);
      logger.info(
        'MediaPipe Face Detector initialized for assessment monitoring'
      );

      // Restore original console methods
      // eslint-disable-next-line no-console
      console.error = originalConsoleError;
      // eslint-disable-next-line no-console
      console.warn = originalConsoleWarn;
    } catch (error) {
      logger.error(
        'Error initializing MediaPipe Face Detector for assessment:',
        error
      );
      setIsInitialized(false);
      setMediaPipeError(
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }, [isEnabled]);

  // Face detection using MediaPipe
  const detectFace = useCallback(async () => {
    if (!videoRef.current || !faceDetector || !isEnabled) {
      return false;
    }

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
      if (
        error instanceof Error &&
        !error.message.includes('TensorFlow Lite') &&
        !error.message.includes('WASM')
      ) {
        logger.error('Assessment face detection error:', error);
      }
      return false;
    }
  }, [faceDetector, videoRef, isEnabled]);

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

    const hasEnoughSkinTone = skinPercentage > 12;

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
        if (quadrantSkinPercentage > 5) {
          quadrantsWithSkin++;
        }
      }

      return quadrantsWithSkin >= 3;
    }

    return false;
  }, []);

  // Fallback face detection using skin tone detection
  const detectFaceFallback = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !isEnabled) return false;

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
  }, [videoRef, isEnabled, detectSkinTone]);

  // Combined face detection with fallback
  const detectFaceCombined = useCallback(async () => {
    try {
      if (faceDetector && !mediaPipeError) {
        const mediaPipeResult = await detectFace();
        return mediaPipeResult;
      }

      logger.debug('Using fallback detection (MediaPipe not available)');
      const fallbackResult = await detectFaceFallback();
      return fallbackResult;
    } catch (error) {
      logger.error('Combined face detection error:', error);
      return false;
    }
  }, [faceDetector, mediaPipeError, detectFace, detectFaceFallback]);

  // Start continuous face detection
  const startFaceDetection = useCallback(() => {
    if (!isEnabled || !videoRef.current) {
      logger.info('Face detection not started', {
        isEnabled,
        hasVideoRef: !!videoRef.current,
      });
      return;
    }

    logger.info('Starting face detection monitoring', {
      assessmentId,
      isEnabled,
    });

    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }

    detectionIntervalRef.current = setInterval(async () => {
      if (!videoRef.current) return;

      const hasFace = await detectFaceCombined();
      setFaceDetected(hasFace);

      if (faceDetector && videoRef.current && !mediaPipeError) {
        try {
          const video = videoRef.current;

          // CRITICAL FIX: Check video readiness and dimensions before detection
          if (
            video.readyState >= 2 &&
            !video.paused &&
            video.videoWidth > 0 &&
            video.videoHeight > 0
          ) {
            const timestamp = Date.now();

            // Use detectForVideo() for VIDEO mode
            const detections = faceDetector.detectForVideo(video, timestamp);

            // DETECT MULTIPLE PEOPLE
            if (
              detections &&
              detections.detections &&
              detections.detections.length > 1
            ) {
              // Multiple people detected - report only once
              if (!multiplePersonReportedRef.current) {
                multiplePersonReportedRef.current = true;
                logger.warn('Multiple people detected!', {
                  count: detections.detections.length,
                });

                // Import service and report violation
                import('@/lib/services/services').then(
                  ({ publicPracticeAssessmentService }) => {
                    publicPracticeAssessmentService.recordProctoringEvent(
                      assessmentId,
                      'MULTIPLE_PERSONS_DETECTED'
                    );
                  }
                );

                import('sonner').then(({ toast }) => {
                  toast.error(
                    `Multiple people detected! This is a violation. Count: ${detections.detections.length}`,
                    { duration: 5000 }
                  );
                });
              }
            } else if (
              detections &&
              detections.detections &&
              detections.detections.length <= 1
            ) {
              // Reset flag if back to one person
              multiplePersonReportedRef.current = false;
            }
          }
        } catch (error) {
          // Silently fail - detection will continue
          // Only log non-MediaPipe internal errors
          if (
            error instanceof Error &&
            !error.message.includes('ROI width and height') &&
            !error.message.includes('Graph has errors')
          ) {
            logger.debug('Error checking for multiple people:', error);
          }
        }
      }

      if (!hasFace) {
        consecutiveNoFaceFramesRef.current++;
        consecutiveFaceFramesRef.current = 0; // Reset face confirmation counter

        // Clear any pending hide timeout since we detected no face
        if (warningTimeoutRef.current) {
          clearTimeout(warningTimeoutRef.current);
          warningTimeoutRef.current = null;
        }

        // Only show warning after multiple consecutive no-face detections
        // This prevents false positives from temporary detection misses
        if (consecutiveNoFaceFramesRef.current >= NO_FACE_THRESHOLD) {
          // REPORT NO FACE VIOLATION after threshold consecutive frames
          if (consecutiveNoFaceFramesRef.current === NO_FACE_THRESHOLD) {
            logger.warn(`No face detected for ${NO_FACE_THRESHOLD} seconds`);

            import('@/lib/services/services').then(
              ({ publicPracticeAssessmentService }) => {
                publicPracticeAssessmentService.recordProctoringEvent(
                  assessmentId,
                  'NO_FACE_DETECTED'
                );
              }
            );
          }

          // Show warning only after threshold is met
          if (!showWarningRef.current) {
            showWarningRef.current = true;
            setShowWarning(true);
          }
        }
        // Note: If threshold not met but warning is already showing, keep it showing
        // It will be hidden when face is consistently detected (see else branch)
      } else {
        // Face detected - reset no-face counter
        consecutiveNoFaceFramesRef.current = 0;
        consecutiveFaceFramesRef.current++;

        // Only hide warning after face is consistently detected for multiple frames
        // This prevents flickering when detection alternates between face/no-face
        if (
          consecutiveFaceFramesRef.current >= FACE_CONFIRMED_THRESHOLD &&
          showWarningRef.current
        ) {
          // Clear any existing timeout
          if (warningTimeoutRef.current) {
            clearTimeout(warningTimeoutRef.current);
            warningTimeoutRef.current = null;
          }

          // Add a small delay before hiding to ensure stability
          warningTimeoutRef.current = setTimeout(() => {
            showWarningRef.current = false;
            setShowWarning(false);
            warningTimeoutRef.current = null;
          }, 500); // 500ms delay to prevent flickering
        }
      }
    }, 1000);
  }, [
    isEnabled,
    detectFaceCombined,
    faceDetector,
    mediaPipeError,
    assessmentId,
  ]);

  // Sync ref with state (for consistency, though state is primary source of truth)
  useEffect(() => {
    showWarningRef.current = showWarning;
  }, [showWarning]);

  // Initialize face detector on component mount
  useEffect(() => {
    initializeFaceDetector();
  }, [initializeFaceDetector]);

  // Start detection when initialized or when MediaPipe fails
  useEffect(() => {
    if (isEnabled && (isInitialized || mediaPipeError)) {
      startFaceDetection();
    }
  }, [isInitialized, mediaPipeError, isEnabled, startFaceDetection]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, []);

  if (!isEnabled) {
    return null;
  }

  return (
    <>
      {/* Hidden canvas for face detection */}
      <canvas ref={canvasRef} className="hidden" style={{ display: 'none' }} />

      {/* Face Detection Warning Overlay */}
      <AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-destructive/95 text-destructive-foreground mx-8 max-w-lg rounded-3xl p-8 text-center shadow-2xl"
            >
              <div className="mb-6 flex justify-center">
                <div className="bg-destructive-foreground/20 rounded-full p-4">
                  <AlertTriangle className="h-12 w-12" />
                </div>
              </div>
              <h3 className="mb-4 text-2xl font-bold">Face Not Detected</h3>
              <p className="mb-6 text-lg opacity-90">
                Please ensure your face is clearly visible in the camera. The
                assessment requires continuous face monitoring for integrity.
              </p>
              <div className="flex items-center justify-center space-x-3 text-base opacity-75">
                <User className="h-6 w-6" />
                <span>Position your face in the camera view</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

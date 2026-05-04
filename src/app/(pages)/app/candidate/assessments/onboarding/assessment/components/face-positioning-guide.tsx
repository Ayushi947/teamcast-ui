'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Camera } from 'lucide-react';
import { logger } from '@/lib/logger';
import { FilesetResolver, FaceDetector } from '@mediapipe/tasks-vision';

interface FacePositionStatus {
  isReady: boolean;
  centeredFace: boolean;
  shouldersVisible: boolean;
  goodLighting: boolean;
  faceDetected: boolean;
}

interface FacePositioningGuideProps {
  onReady?: (isReady: boolean) => void;
  onStatusChange?: (status: FacePositionStatus) => void;
  preload?: boolean; // If true, initialize camera in background even when not visible
  onInitialized?: () => void; // Callback when camera is initialized
}

export function FacePositioningGuide({
  onReady,
  onStatusChange,
  preload: _preload = false,
  onInitialized: onInitialized,
}: FacePositioningGuideProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [faceDetector, setFaceDetector] = useState<FaceDetector | null>(null);
  const [isPositioned, setIsPositioned] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const animationFrameRef = useRef<number | null>(null);
  const [status, setStatus] = useState<FacePositionStatus>({
    isReady: false,
    centeredFace: false,
    shouldersVisible: false,
    goodLighting: false,
    faceDetected: false,
  });
  const prevStatusRef = useRef<FacePositionStatus>(status);

  // Initialize MediaPipe Face Detector
  const initializeFaceDetector = useCallback(async () => {
    try {
      // Suppress console errors from MediaPipe/TensorFlow
      // eslint-disable-next-line no-console
      const originalConsoleError = console.error;
      // eslint-disable-next-line no-console
      const originalConsoleWarn = console.warn;

      // eslint-disable-next-line no-console
      console.error = (...args) => {
        const message = args[0];
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
        minDetectionConfidence: 0.7,
        minSuppressionThreshold: 0.3,
      });

      setFaceDetector(detector);
      logger.info('Face detector initialized for positioning guide');

      // Restore console methods
      // eslint-disable-next-line no-console
      console.error = originalConsoleError;
      // eslint-disable-next-line no-console
      console.warn = originalConsoleWarn;
    } catch (error) {
      logger.error('Error initializing face detector:', error);
      setError('Failed to initialize face detection');
    }
  }, []);

  // Initialize camera
  const initializeCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 30 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await new Promise<void>((resolve) => {
          if (!videoRef.current) {
            resolve();
            return;
          }
          const handleLoadedMetadata = () => {
            resolve();
          };
          videoRef.current.addEventListener(
            'loadedmetadata',
            handleLoadedMetadata,
            { once: true }
          );
        });
        setIsInitialized(true);
        setIsLoading(false);
        if (onInitialized) {
          onInitialized();
        }
      }
    } catch (err) {
      logger.error('Error initializing camera:', err);
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Camera access denied. Please allow camera permissions.');
        } else if (err.name === 'NotFoundError') {
          setError('No camera found. Please connect a camera.');
        } else {
          setError('Failed to access camera. Please try again.');
        }
      } else {
        setError('Failed to access camera.');
      }
    }
  }, []);

  // Detect face and check positioning
  const detectAndCheckPosition = useCallback(async () => {
    if (!videoRef.current || !faceDetector || !canvasRef.current) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    try {
      if (
        video.readyState >= 2 &&
        !video.paused &&
        video.videoWidth > 0 &&
        video.videoHeight > 0
      ) {
        // Draw video frame to canvas
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const timestamp = Date.now();
        const detections = faceDetector.detectForVideo(video, timestamp);

        let hasGoodPosition = false;
        let centeredFace = false;
        let shouldersVisible = false;
        let goodLighting = false;

        // Check for face detection
        for (const detection of detections.detections) {
          const boundingBox = detection.boundingBox;
          if (!boundingBox) continue;

          // Calculate face size as percentage of video frame
          const faceWidth = boundingBox.width;
          const faceHeight = boundingBox.height;
          const faceArea = faceWidth * faceHeight;
          const frameArea = canvas.width * canvas.height;
          const facePercentage = (faceArea / frameArea) * 100;

          // Check if face is large enough (at least 5% of frame)
          const isLargeEnough = facePercentage >= 5;

          // Check if face is roughly centered
          const centerX = boundingBox.originX + boundingBox.width / 2;
          const centerY = boundingBox.originY + boundingBox.height / 2;
          const frameCenterX = canvas.width / 2;
          const frameCenterY = canvas.height / 2;
          const distanceFromCenter = Math.sqrt(
            Math.pow(centerX - frameCenterX, 2) +
              Math.pow(centerY - frameCenterY, 2)
          );
          const maxDistance = Math.min(canvas.width, canvas.height) * 0.3;
          centeredFace = distanceFromCenter < maxDistance;

          // Check aspect ratio
          const aspectRatio = boundingBox.width / boundingBox.height;
          const hasGoodAspectRatio = aspectRatio >= 0.7 && aspectRatio <= 1.3;

          // Check if face is well-positioned (not too close to edges)
          const isWellPositioned =
            boundingBox.originX > 0 &&
            boundingBox.originY > 0 &&
            boundingBox.originX + boundingBox.width < canvas.width &&
            boundingBox.originY + boundingBox.height < canvas.height;

          // Check if neck/shoulders are visible (face should not be too high)
          const faceBottomY = boundingBox.originY + boundingBox.height;
          const frameBottom = canvas.height;
          shouldersVisible = faceBottomY < frameBottom * 0.85; // Face should not be in bottom 15%

          goodLighting = facePercentage >= 8 && isWellPositioned;

          if (
            isLargeEnough &&
            isWellPositioned &&
            centeredFace &&
            hasGoodAspectRatio &&
            shouldersVisible
          ) {
            hasGoodPosition = true;
            break;
          }
        }

        const hasFace = detections.detections.length > 0;
        setFaceDetected(hasFace);
        setIsPositioned(hasGoodPosition);

        // Update status
        const newStatus: FacePositionStatus = {
          isReady: hasGoodPosition,
          centeredFace: centeredFace && hasFace,
          shouldersVisible: shouldersVisible && hasFace,
          goodLighting: goodLighting && hasFace,
          faceDetected: hasFace,
        };

        // Only update state and call callbacks if status actually changed
        const prevStatus = prevStatusRef.current;
        const statusChanged =
          prevStatus.isReady !== newStatus.isReady ||
          prevStatus.centeredFace !== newStatus.centeredFace ||
          prevStatus.shouldersVisible !== newStatus.shouldersVisible ||
          prevStatus.goodLighting !== newStatus.goodLighting ||
          prevStatus.faceDetected !== newStatus.faceDetected;

        if (statusChanged) {
          prevStatusRef.current = newStatus;
          setStatus(newStatus);

          // Notify parent components only when status changes
          if (onReady) {
            onReady(hasGoodPosition);
          }
          if (onStatusChange) {
            onStatusChange(newStatus);
          }
        }
      }
    } catch (error) {
      if (
        error instanceof Error &&
        !error.message.includes('TensorFlow Lite') &&
        !error.message.includes('WASM')
      ) {
        logger.debug('Face detection error in guide:', error);
      }
    }
  }, [faceDetector, onReady]);

  // Start detection loop
  useEffect(() => {
    if (!isInitialized || !faceDetector) return;

    const detectLoop = () => {
      detectAndCheckPosition();
      animationFrameRef.current = requestAnimationFrame(detectLoop);
    };

    detectLoop();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isInitialized, faceDetector, detectAndCheckPosition]);

  // Initialize on mount
  useEffect(() => {
    // Initialize immediately when component mounts
    initializeFaceDetector();
    initializeCamera();

    return () => {
      // Cleanup
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [initializeFaceDetector, initializeCamera]);

  if (error) {
    return (
      <div className="bg-destructive/10 border-destructive/20 text-destructive rounded-lg border p-4 text-center">
        <AlertCircle className="mx-auto mb-2 h-6 w-6" />
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Video Preview */}
      <div
        className="relative w-full overflow-hidden rounded-xl bg-black"
        style={{ aspectRatio: '16/9' }}
      >
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-900">
            <div className="flex flex-col items-center space-y-3">
              <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
              <p className="text-sm text-gray-400">Initializing camera...</p>
            </div>
          </div>
        )}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          style={{ transform: 'scaleX(-1)' }} // Mirror the video
          onLoadedData={() => {
            setIsLoading(false);
            if (videoRef.current) {
              // Ensure video maintains aspect ratio
              videoRef.current.style.width = '100%';
              videoRef.current.style.height = '100%';
              videoRef.current.style.objectFit = 'cover';
            }
          }}
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Status indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <AnimatePresence mode="wait">
            {isPositioned ? (
              <motion.div
                key="ready"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center space-x-2 rounded-full bg-green-500/90 px-4 py-2 text-white shadow-lg"
              >
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-sm font-medium">Perfect Position!</span>
              </motion.div>
            ) : faceDetected ? (
              <motion.div
                key="adjusting"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center space-x-2 rounded-full bg-yellow-500/90 px-4 py-2 text-white shadow-lg"
              >
                <AlertCircle className="h-5 w-5" />
                <span className="text-sm font-medium">
                  Adjust your position
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="no-face"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center space-x-2 rounded-full bg-gray-500/90 px-4 py-2 text-white shadow-lg"
              >
                <Camera className="h-5 w-5" />
                <span className="text-sm font-medium">
                  Position your face in frame
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export type { FacePositionStatus };

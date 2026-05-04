'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  FacePositioningGuide,
  type FacePositionStatus,
} from '@/app/(pages)/app/candidate/assessments/onboarding/assessment/components/face-positioning-guide';
import { FileText, Play, CheckCircle2, Info, Camera, Eye } from 'lucide-react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ENV } from '@/lib/env';
import { AIAvatar } from '@/components/app/common/animations/ai-avatar';

interface WelcomeScreenProps {
  onStart: () => void;
  isReady?: boolean;
  proctoringEnabled?: boolean;
}

export function WelcomeScreen({
  onStart,
  isReady = true,
  proctoringEnabled = false,
}: WelcomeScreenProps) {
  // Check if face detection feature is enabled via environment variable
  const faceDetectionEnabled = ENV.NEXT_PUBLIC_FACE_DETECTION_ENABLED;

  // All hooks must be called unconditionally before any early returns
  const [facePositionReady, setFacePositionReady] = useState(false);
  const [showStaticGuide, setShowStaticGuide] = useState(true);
  const [faceStatus, setFaceStatus] = useState<FacePositionStatus>({
    isReady: false,
    centeredFace: false,
    shouldersVisible: false,
    goodLighting: false,
    faceDetected: false,
  });
  const [allConditionsMet, setAllConditionsMet] = useState(false);

  // Check if all conditions are met
  useEffect(() => {
    if (proctoringEnabled && faceDetectionEnabled) {
      const conditionsMet =
        faceStatus.isReady &&
        faceStatus.centeredFace &&
        faceStatus.shouldersVisible &&
        faceStatus.goodLighting;

      // Only update if value actually changed to prevent infinite loops
      setAllConditionsMet((prev) => {
        if (prev !== conditionsMet) {
          return conditionsMet;
        }
        return prev;
      });

      setFacePositionReady((prev) => {
        if (prev !== conditionsMet) {
          return conditionsMet;
        }
        return prev;
      });
    } else {
      setAllConditionsMet(true);
      setFacePositionReady(true);
    }
  }, [
    faceStatus.isReady,
    faceStatus.centeredFace,
    faceStatus.shouldersVisible,
    faceStatus.goodLighting,
    proctoringEnabled,
    faceDetectionEnabled,
  ]);

  // If face detection is disabled, render the simple version
  if (!faceDetectionEnabled) {
    return (
      <div className="bg-background fixed inset-0 flex items-center justify-center">
        <div className="relative w-full max-w-7xl px-6">
          <div className="grid grid-cols-12 gap-12">
            {/* Left side - Instructions */}
            <div className="col-span-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="space-y-2">
                  <h1 className="text-text-primary text-2xl font-semibold">
                    Before starting the practice assessment,
                  </h1>
                  <div className="text-text-secondary space-y-4 pt-6">
                    <div className="flex items-start space-x-3">
                      <span className="bg-primary-light text-primary flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-medium">
                        {proctoringEnabled ? '2' : '1'}
                      </span>
                      <p>
                        Please note that your practice assessment recording will
                        be available for review.
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="bg-primary-light text-primary flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-medium">
                        {proctoringEnabled ? '3' : '2'}
                      </span>
                      <p>Don&apos;t leave to any other tabs.</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="bg-primary-light text-primary flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-medium">
                        {proctoringEnabled ? '4' : '3'}
                      </span>
                      <p>
                        Keep general eye contact with the screen and try not to
                        look away too much.
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="bg-primary-light text-primary flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-medium">
                        {proctoringEnabled ? '5' : '4'}
                      </span>
                      <p>
                        Feel free to ask any clarifying questions throughout the
                        assessment.
                      </p>
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: isReady ? 1.02 : 1 }}
                  whileTap={{ scale: isReady ? 0.98 : 1 }}
                  onClick={isReady ? onStart : undefined}
                  disabled={!isReady}
                  className={`cursor-pointer rounded-lg px-12 py-4 pl-8 text-sm font-medium transition-colors ${
                    isReady
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  }`}
                >
                  {isReady
                    ? 'Done, start the assessment'
                    : 'Preparing assessment...'}
                </motion.button>
              </motion.div>
            </div>

            {/* Right side - AI Avatar */}
            <div className="col-span-4 flex items-center justify-center">
              <AIAvatar isSpeaking={true} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="bg-background fixed inset-0 flex flex-col overflow-y-auto">
        {/* Header */}
        <div className="border-border bg-background sticky top-0 z-10 border-b">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FileText className="text-primary h-5 w-5" />
                <h2 className="text-text-primary text-lg font-semibold">
                  Assessment Instructions
                </h2>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-text-secondary text-sm">Ready</span>
                </div>
                <motion.div
                  className="flex items-center space-x-2"
                  animate={{
                    opacity: facePositionReady ? 1 : 0.6,
                  }}
                >
                  <motion.div
                    className={`h-2 w-2 rounded-full ${facePositionReady ? 'bg-green-500' : 'bg-gray-400'}`}
                    animate={{
                      scale: facePositionReady ? [1, 1.3, 1] : 1,
                      boxShadow: facePositionReady
                        ? [
                            '0 0 0 0 rgba(34, 197, 94, 0.4)',
                            '0 0 0 4px rgba(34, 197, 94, 0)',
                            '0 0 0 0 rgba(34, 197, 94, 0)',
                          ]
                        : 'none',
                    }}
                    transition={{
                      scale: {
                        duration: 0.5,
                        repeat: Infinity,
                        repeatDelay: 1,
                      },
                      boxShadow: { duration: 1.5, repeat: Infinity },
                    }}
                  />
                  <span className="text-text-secondary text-sm">
                    Face Positioned
                  </span>
                </motion.div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
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
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <motion.button
                      whileHover={{
                        scale: allConditionsMet && isReady ? 1.02 : 1,
                      }}
                      whileTap={{
                        scale: allConditionsMet && isReady ? 0.98 : 1,
                      }}
                      onClick={
                        allConditionsMet && isReady ? onStart : undefined
                      }
                      disabled={!allConditionsMet || !isReady}
                      className={`flex cursor-pointer items-center space-x-2 rounded-lg px-6 py-2.5 text-sm font-medium transition-all ${
                        allConditionsMet && isReady
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20 shadow-lg'
                          : 'bg-muted text-muted-foreground cursor-not-allowed opacity-60'
                      }`}
                    >
                      <AnimatePresence mode="wait">
                        {allConditionsMet && isReady ? (
                          <motion.div
                            key="ready"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                          >
                            <Play className="h-4 w-4" />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="not-ready"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                          >
                            <Play className="h-4 w-4" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <span>Start Assessment</span>
                    </motion.button>
                  </div>
                </TooltipTrigger>
                {(!allConditionsMet || !isReady) && proctoringEnabled && (
                  <TooltipContent
                    side="bottom"
                    className="bg-popover text-popover-foreground border-border max-w-xs border shadow-lg"
                  >
                    <div className="space-y-2">
                      <p className="text-foreground font-semibold">
                        Complete face positioning first
                      </p>
                      {showStaticGuide ? (
                        <p className="text-muted-foreground text-sm">
                          Click &quot;Live Preview&quot; in the Face Detection
                          Setup section to start positioning your face and meet
                          all conditions.
                        </p>
                      ) : (
                        <>
                          <p className="text-muted-foreground text-sm">
                            Position yourself correctly in the live preview to
                            meet all conditions:
                          </p>
                          <div className="mt-2 space-y-1.5">
                            {!faceStatus.centeredFace && (
                              <p className="text-foreground flex items-center gap-1.5 text-xs">
                                <span className="font-semibold text-yellow-500">
                                  ○
                                </span>
                                Center your face in the frame
                              </p>
                            )}
                            {!faceStatus.shouldersVisible && (
                              <p className="text-foreground flex items-center gap-1.5 text-xs">
                                <span className="font-semibold text-yellow-500">
                                  ○
                                </span>
                                Ensure shoulders are visible
                              </p>
                            )}
                            {!faceStatus.goodLighting && (
                              <p className="text-foreground flex items-center gap-1.5 text-xs">
                                <span className="font-semibold text-yellow-500">
                                  ○
                                </span>
                                Improve lighting conditions
                              </p>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </TooltipContent>
                )}
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Welcome Title */}
            <div className="space-y-3">
              <h1 className="text-text-primary text-4xl font-bold">
                Welcome to Your Practice Assessment
              </h1>
              <p className="text-text-secondary text-base">
                Please review the following instructions carefully to ensure a
                smooth and successful assessment experience. Ensure your
                environment is quiet and well-lit.
              </p>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Left Panel - Face Detection Setup */}
              {proctoringEnabled && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-muted/50 rounded-xl p-6"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                        <Camera className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-text-primary mb-1 text-lg font-semibold">
                          Face Detection Setup
                        </h2>
                        <p className="text-text-secondary text-sm">
                          Position yourself correctly using the live camera
                          preview.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowStaticGuide(true)}
                        className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-all ${
                          showStaticGuide
                            ? 'border-primary bg-primary/10 text-primary shadow-sm'
                            : 'border-border bg-background text-muted-foreground hover:bg-muted hover:border-primary/50'
                        }`}
                      >
                        <Eye className="h-4 w-4 shrink-0" />
                        <span className="whitespace-nowrap">View Guide</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowStaticGuide(false)}
                        className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-all ${
                          !showStaticGuide
                            ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                            : 'border-border bg-background text-muted-foreground hover:bg-muted hover:border-primary/50'
                        }`}
                      >
                        <Camera className="h-4 w-4 shrink-0" />
                        <span className="whitespace-nowrap">Live Preview</span>
                      </motion.button>
                    </div>
                  </div>

                  {/* Camera Preview Area */}
                  <div className="relative mb-4 overflow-hidden rounded-xl bg-gray-900">
                    {showStaticGuide ? (
                      <div className="relative aspect-video w-full">
                        <Image
                          src="/images/face_positions/face_position.png"
                          alt="Face positioning guide"
                          fill
                          className="object-contain"
                          priority
                        />
                        {/* Overlay with green bounding box */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div
                            className="rounded-lg border-2 border-dashed border-green-500"
                            style={{
                              width: '60%',
                              height: '70%',
                            }}
                          />
                        </div>
                        {/* Perfect Position Badge */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                          <div className="flex items-center space-x-2 rounded-full bg-green-500 px-4 py-2 text-white shadow-lg">
                            <CheckCircle2 className="h-4 w-4" />
                            <span className="text-sm font-medium">
                              Perfect Position!
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                        className="w-full"
                      >
                        <FacePositioningGuide
                          onReady={(ready) => setFacePositionReady(ready)}
                          onStatusChange={(status) => setFaceStatus(status)}
                        />
                      </motion.div>
                    )}
                  </div>

                  {/* Success Message when all conditions are met */}
                  <AnimatePresence>
                    {!showStaticGuide && allConditionsMet && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                        className="mb-4 rounded-lg border border-green-500/20 bg-green-500/10 p-3"
                      >
                        <div className="flex items-center space-x-2">
                          <motion.div
                            animate={{ rotate: [0, 360] }}
                            transition={{ duration: 0.5 }}
                          >
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          </motion.div>
                          <p className="text-sm font-medium text-green-700 dark:text-green-400">
                            All conditions met! You&apos;re ready to start.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Status Checkmarks - Show real-time status when live preview is active */}
                  <div className="mb-6 flex flex-wrap gap-2">
                    <motion.div
                      animate={{
                        backgroundColor: showStaticGuide
                          ? 'rgba(34, 197, 94, 0.1)'
                          : faceStatus.centeredFace
                            ? 'rgba(34, 197, 94, 0.1)'
                            : 'rgba(156, 163, 175, 0.1)',
                        color: showStaticGuide
                          ? '#16a34a'
                          : faceStatus.centeredFace
                            ? '#16a34a'
                            : '#6b7280',
                        scale:
                          faceStatus.centeredFace && !showStaticGuide
                            ? [1, 1.05, 1]
                            : 1,
                      }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center space-x-2 rounded-full px-3 py-1.5 text-sm"
                    >
                      <AnimatePresence mode="wait">
                        {showStaticGuide || faceStatus.centeredFace ? (
                          <motion.div
                            key="check"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 180 }}
                            transition={{ type: 'spring', stiffness: 200 }}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="pending"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="h-4 w-4 rounded-full border-2 border-current"
                          />
                        )}
                      </AnimatePresence>
                      <span>Centered Face</span>
                    </motion.div>
                    <motion.div
                      animate={{
                        backgroundColor: showStaticGuide
                          ? 'rgba(34, 197, 94, 0.1)'
                          : faceStatus.shouldersVisible
                            ? 'rgba(34, 197, 94, 0.1)'
                            : 'rgba(156, 163, 175, 0.1)',
                        color: showStaticGuide
                          ? '#16a34a'
                          : faceStatus.shouldersVisible
                            ? '#16a34a'
                            : '#6b7280',
                        scale:
                          faceStatus.shouldersVisible && !showStaticGuide
                            ? [1, 1.05, 1]
                            : 1,
                      }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      className="flex items-center space-x-2 rounded-full px-3 py-1.5 text-sm"
                    >
                      <AnimatePresence mode="wait">
                        {showStaticGuide || faceStatus.shouldersVisible ? (
                          <motion.div
                            key="check"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 180 }}
                            transition={{ type: 'spring', stiffness: 200 }}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="pending"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="h-4 w-4 rounded-full border-2 border-current"
                          />
                        )}
                      </AnimatePresence>
                      <span>Shoulders Visible</span>
                    </motion.div>
                    <motion.div
                      animate={{
                        backgroundColor: showStaticGuide
                          ? 'rgba(34, 197, 94, 0.1)'
                          : faceStatus.goodLighting
                            ? 'rgba(34, 197, 94, 0.1)'
                            : 'rgba(156, 163, 175, 0.1)',
                        color: showStaticGuide
                          ? '#16a34a'
                          : faceStatus.goodLighting
                            ? '#16a34a'
                            : '#6b7280',
                        scale:
                          faceStatus.goodLighting && !showStaticGuide
                            ? [1, 1.05, 1]
                            : 1,
                      }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                      className="flex items-center space-x-2 rounded-full px-3 py-1.5 text-sm"
                    >
                      <AnimatePresence mode="wait">
                        {showStaticGuide || faceStatus.goodLighting ? (
                          <motion.div
                            key="check"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 180 }}
                            transition={{ type: 'spring', stiffness: 200 }}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="pending"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="h-4 w-4 rounded-full border-2 border-current"
                          />
                        )}
                      </AnimatePresence>
                      <span>Good Lighting</span>
                    </motion.div>
                  </div>

                  {/* Detailed Instructions */}
                  <div className="space-y-3">
                    <div className="text-text-secondary flex items-start space-x-2 text-sm">
                      <Info className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                      <p>
                        Position your face in the center of the camera frame for
                        optimal tracking.
                      </p>
                    </div>
                    <div className="text-text-secondary flex items-start space-x-2 text-sm">
                      <Info className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                      <p>
                        Ensure your face, neck, and slight shoulders are visible
                        at all times.
                      </p>
                    </div>
                    <div className="text-text-secondary flex items-start space-x-2 text-sm">
                      <Info className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                      <p>
                        Maintain good lighting so your face is clearly visible
                        to the proctoring AI.
                      </p>
                    </div>
                    <div className="text-text-secondary flex items-start space-x-2 text-sm">
                      <Info className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                      <p>
                        Avoid covering your face with hands, objects, or
                        excessive shadows.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Right Panel - Important Guidelines */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-muted/50 rounded-xl p-6"
              >
                <div className="mb-6 flex items-center space-x-2">
                  <FileText className="text-primary h-5 w-5" />
                  <h2 className="text-text-primary text-lg font-semibold">
                    Important Guidelines
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <span className="bg-primary/20 text-primary flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-medium">
                      {proctoringEnabled ? '1' : '1'}
                    </span>
                    <p className="text-text-secondary text-sm">
                      Please note that your practice assessment recording will
                      be securely stored and available for review.
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="bg-primary/20 text-primary flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-medium">
                      {proctoringEnabled ? '2' : '2'}
                    </span>
                    <p className="text-text-secondary mt-1 text-sm">
                      Don&apos;t leave to any other tabs or switch windows. This
                      will be flagged as an alert.
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="bg-primary/20 text-primary flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-medium">
                      {proctoringEnabled ? '3' : '3'}
                    </span>
                    <p className="text-text-secondary text-sm">
                      Keep general eye contact with the screen and try not to
                      look away from your device too much.
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="bg-primary/20 text-primary flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-medium">
                      {proctoringEnabled ? '4' : '4'}
                    </span>
                    <p className="text-text-secondary mt-1 text-sm">
                      Feel free to ask any clarifying questions throughout the
                      assessment.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </TooltipProvider>
  );
}

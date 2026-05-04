'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, {
  Suspense,
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from 'react';

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
import { candidateJobAiAssessmentService } from '@/lib/services/services';
import { liveKitService } from '@/lib/services/services';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import type { ICandidateJobAiAssessment } from '@/lib/shared';
import { Room } from 'livekit-client';
import {
  RoomAudioRenderer,
  RoomContext,
  StartAudio,
  useVoiceAssistant,
  useRoomContext,
  useTranscriptions,
} from '@livekit/components-react';
import { AgentTile } from '@/components/interview/AgentTile';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Power,
  Mic,
  MicOff,
  ThumbsUp,
  Timer,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Button } from '@/components/ui/button';
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
import { AIAvatar } from '@/components/app/common/animations/ai-avatar';
import { CandidateAudioVisualizer } from '@/components/interview/CandidateAudioVisualizer';
import { FaceDetectionOverlay } from '../assessment/components/face-detection-overlay';
import { ENV } from '@/lib/env';
import { useApp } from '@/lib/context/app-context';

// Telemetry helper for AI Interview events
const logAIInterviewTelemetry = (
  event: string,
  metadata: Record<string, unknown>
) => {
  const message = `[JOB_AI_INTERVIEW] ${event}`;

  if (typeof window !== 'undefined') {
    try {
      window.Sentry?.captureMessage?.(message, {
        level: 'info',
        extra: metadata,
      });
      window.Sentry?.addBreadcrumb?.({
        category: 'job-ai-interview',
        message,
        level: 'info',
        data: metadata,
      });
    } catch (error) {
      logger.error('Failed to report telemetry to Sentry', error);
    }
  }

  logger.info(message, metadata);
};

function AIInterviewPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const assessmentId = searchParams.get('id');
  const { user } = useApp();
  const candidateId = user?.candidateId;

  const [interviewStarted, setInterviewStarted] = useState(true); // Start immediately, bypass welcome screen
  const [isConnected, setIsConnected] = useState(false);
  const [assessment, setAssessment] =
    useState<ICandidateJobAiAssessment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  const [isTimeWarning, setIsTimeWarning] = useState(false);
  // Fetch assessment settings to check recording and proctoring
  useEffect(() => {
    const fetchAssessment = async () => {
      if (!assessmentId) {
        toast.error('Assessment ID is required');
        router.back();
        return;
      }

      try {
        const data =
          await candidateJobAiAssessmentService.getAssessment(assessmentId);
        setAssessment(data);
      } catch (error) {
        logger.error('Error fetching assessment:', error);
        toast.error('Failed to load assessment');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssessment();
  }, [assessmentId, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
        <span className="text-text-secondary ml-3">Loading assessment...</span>
      </div>
    );
  }

  if (!assessmentId || !candidateId || !assessment) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
        <h2 className="text-text-primary mb-4 text-2xl font-bold">
          Invalid Assessment
        </h2>
        <p className="text-text-secondary mb-6">
          Assessment ID or Candidate ID is missing
        </p>
        <button
          onClick={() => router.back()}
          className="bg-primary text-surface hover:bg-primary-dark rounded-xl px-6 py-3 shadow-md transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const videoRecordingEnabled =
    assessment.jobAiAssessmentSettings?.videoRecordingEnabled || false;
  const proctoringEnabled =
    assessment.jobAiAssessmentSettings?.proctoringEnabled || false;

  return (
    <TooltipProvider>
      <div className="bg-background min-h-screen">
        {!interviewStarted ? (
          <WelcomeScreen onStart={() => setInterviewStarted(true)} />
        ) : (
          <InterviewSessionWithLiveKit
            assessmentId={assessmentId}
            assessment={assessment}
            videoRecordingEnabled={videoRecordingEnabled}
            proctoringEnabled={proctoringEnabled}
            onConnectionChange={setIsConnected}
            isConnected={isConnected}
            showEndDialog={showEndDialog}
            setShowEndDialog={setShowEndDialog}
            router={router}
            timeRemaining={timeRemaining}
            setTimeRemaining={setTimeRemaining}
            isTimeWarning={isTimeWarning}
            setIsTimeWarning={setIsTimeWarning}
          />
        )}
      </div>
    </TooltipProvider>
  );
}

// Welcome Screen Component matching old assessment UI
function WelcomeScreen({ onStart }: { onStart: () => void }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check microphone permission
    const checkPermissions = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        stream.getTracks().forEach((track) => track.stop());
        setIsReady(true);
      } catch (error) {
        logger.error('Microphone permission denied:', error);
        toast.error('Please grant microphone access to continue');
      }
    };

    checkPermissions();
  }, []);

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
                  Before starting the interview,
                </h1>
                <div className="text-text-secondary space-y-4 pt-6">
                  <div className="flex items-start space-x-3">
                    <span className="bg-primary-light text-primary flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-medium">
                      1
                    </span>
                    <p>
                      Please note that your AI Interview recording will be
                      available in your profile.
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="bg-primary-light text-primary flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-medium">
                      2
                    </span>
                    <p>Don&apos;t leave to any other tabs.</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="bg-primary-light text-primary flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-medium">
                      3
                    </span>
                    <p>
                      Keep general eye contact with the screen and try not to
                      look away too much.
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="bg-primary-light text-primary flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-medium">
                      4
                    </span>
                    <p>
                      Feel free to ask any clarifying questions throughout the
                      interview.
                    </p>
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: isReady ? 1.02 : 1 }}
                whileTap={{ scale: isReady ? 0.98 : 1 }}
                onClick={isReady ? onStart : undefined}
                disabled={!isReady}
                className={`rounded-lg px-12 py-4 pl-8 text-sm font-medium transition-colors ${
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

// Interview Session with LiveKit Integration
function InterviewSessionWithLiveKit({
  assessmentId,
  assessment,
  videoRecordingEnabled,
  proctoringEnabled,
  onConnectionChange,
  isConnected,
  showEndDialog,
  setShowEndDialog,
  router,
  timeRemaining,
  setTimeRemaining,
  isTimeWarning,
  setIsTimeWarning,
}: {
  assessmentId: string;
  assessment: ICandidateJobAiAssessment | null;
  videoRecordingEnabled: boolean;
  proctoringEnabled: boolean;
  onConnectionChange: (connected: boolean) => void;
  isConnected: boolean;
  showEndDialog: boolean;
  setShowEndDialog: (show: boolean) => void;
  router: ReturnType<typeof useRouter>;
  timeRemaining: number;
  setTimeRemaining: (time: number) => void;
  isTimeWarning: boolean;
  setIsTimeWarning: (isTimeWarning: boolean) => void;
}) {
  const room = useMemo(() => new Room(), []);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMicEnabled, setIsMicEnabled] = useState(true); // Start enabled for audio capture
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const { user } = useApp();
  const candidateId = user?.candidateId;

  useEffect(() => {
    let aborted = false;

    const connectToRoom = async () => {
      setIsConnecting(true);

      try {
        // Request microphone permissions first to ensure audio capture is ready
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          stream.getTracks().forEach((track) => track.stop());
          logger.info('✅ Microphone permissions granted');
        } catch (permError) {
          logger.error('Microphone permission denied:', permError);
          toast.error('Please grant microphone access to continue');
          throw permError;
        }

        const roomData = await liveKitService.createRoom({
          candidateId: candidateId!,
          assessmentId,
          assessmentType: 'JOB_AI',
        });

        if (aborted) return;

        await room.connect(
          roomData.connectionDetails.serverUrl,
          roomData.connectionDetails.participantToken
        );

        if (aborted) return;

        logAIInterviewTelemetry('Connected to LiveKit room', {
          assessmentId,
          platform:
            typeof navigator !== 'undefined' ? navigator.platform : 'unknown',
          userAgent:
            typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        });

        // Enable microphone for audio capture
        // Note: LiveKit's turn detector will automatically manage mic state during conversation
        await room.localParticipant.setMicrophoneEnabled(true);
        setIsMicEnabled(true); // Sync UI state with actual mic state

        logAIInterviewTelemetry('Microphone enabled', {
          assessmentId,
          micEnabled: true,
        });

        // Enable camera to publish video to LiveKit room (required for server-side recording)
        await room.localParticipant.setCameraEnabled(true);

        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Verify video track is published for recording
        const videoTrack = Array.from(
          room.localParticipant.videoTrackPublications.values()
        ).find((track) => track.source === 'camera');

        if (videoTrack) {
          logger.info(
            '✅ Camera video track published to LiveKit room for recording:',
            {
              trackSid: videoTrack.trackSid,
              source: videoTrack.source,
              muted: videoTrack.isMuted,
            }
          );
        } else {
          logger.warn(
            '⚠️ Camera video track NOT found - recording may be audio-only!'
          );
        }

        // Listen for track muted/unmuted events to sync UI state
        // This handles when LiveKit's turn detector automatically changes mic state
        room.localParticipant.on('trackMuted', (publication) => {
          if (publication.source === 'microphone') {
            logger.info('🎤 Microphone muted by LiveKit');
            setIsMicEnabled(false);
          }
        });

        room.localParticipant.on('trackUnmuted', (publication) => {
          if (publication.source === 'microphone') {
            logger.info('🎤 Microphone unmuted by LiveKit');
            setIsMicEnabled(true);
          }
        });

        onConnectionChange(true);
      } catch (error) {
        if (aborted) return;

        logger.error('Failed to connect to LiveKit:', error);
        toast.error('Failed to connect to interview session');

        try {
          room.disconnect();
        } catch (disconnectError) {
          logger.error('Error during disconnect:', disconnectError);
        }
      } finally {
        if (!aborted) {
          setIsConnecting(false);
        }
      }
    };

    connectToRoom();

    return () => {
      aborted = true;
      room.disconnect();
      onConnectionChange(false);
    };
  }, [assessmentId, room, onConnectionChange]);

  const toggleMicrophone = useCallback(async () => {
    try {
      const newState = !isMicEnabled;

      logAIInterviewTelemetry('Microphone toggle requested', {
        assessmentId,
        currentState: isMicEnabled,
        newState,
        platform:
          typeof navigator !== 'undefined' ? navigator.platform : 'unknown',
      });

      await room.localParticipant.setMicrophoneEnabled(newState);
      setIsMicEnabled(newState);

      logAIInterviewTelemetry('Microphone toggle completed', {
        assessmentId,
        micEnabled: newState,
      });

      toast.success(`Microphone ${newState ? 'enabled' : 'disabled'}`, {
        duration: 2000,
      });
    } catch (error) {
      logger.error('Failed to toggle microphone:', error);

      logAIInterviewTelemetry('Microphone toggle failed', {
        assessmentId,
        error: error instanceof Error ? error.message : String(error),
        platform:
          typeof navigator !== 'undefined' ? navigator.platform : 'unknown',
      });

      toast.error('Failed to toggle microphone');
    }
  }, [isMicEnabled, room, assessmentId]);

  // Auto-disable microphone function that can be called from child components
  const disableMicrophone = useCallback(async () => {
    try {
      if (!room || !room.localParticipant) {
        logger.error('Room or local participant not available');
        toast.error('Unable to control microphone');
        return false;
      }

      await room.localParticipant.setMicrophoneEnabled(false);
      setIsMicEnabled(false);

      toast.info('Microphone muted - AI is evaluating your answer');
      return true;
    } catch (error) {
      logger.error('Failed to auto-disable microphone:', error);
      toast.error('Failed to mute microphone automatically');
      return false;
    }
  }, [room, isMicEnabled]);

  const handleEndAssessment = async () => {
    setShowEndDialog(false);

    try {
      // Call backend API to terminate the assessment
      await liveKitService.terminateAssessment({
        assessmentId: assessmentId,
        assessmentType: 'JOB_AI',
        reason: 'CANDIDATE_REQUESTED',
      });

      toast.success('Assessment ended successfully');
    } catch (error) {
      logger.error('Failed to terminate assessment:', error);
      toast.error('Failed to end assessment. Redirecting anyway...');
    } finally {
      // Disconnect from room
      room.disconnect();

      // Redirect to dashboard
      router.push('/app/candidate/dashboard');
    }
  };

  const advanceToNextSection = useCallback(
    (targetIndex?: number) => {
      if (!assessment?.sections) return;

      // If a specific index is provided, jump to that section
      if (targetIndex !== undefined) {
        if (targetIndex >= 0 && targetIndex < assessment.sections.length) {
          logger.info(`📍 Jumping to section ${targetIndex + 1}`);

          logAIInterviewTelemetry('Section changed (jump)', {
            assessmentId,
            previousSectionIndex: currentSectionIndex,
            newSectionIndex: targetIndex,
            sectionTitle: assessment.sections[targetIndex]?.title,
            platform:
              typeof navigator !== 'undefined' ? navigator.platform : 'unknown',
          });

          setCurrentSectionIndex(targetIndex);
        }
      } else {
        // Otherwise, advance to next section using function updater to avoid dependency
        setCurrentSectionIndex((prevIndex) => {
          if (prevIndex < assessment.sections.length - 1) {
            const newIndex = prevIndex + 1;
            logger.info(`➡️ Advancing to section ${newIndex + 1}`);

            logAIInterviewTelemetry('Section changed (advance)', {
              assessmentId,
              previousSectionIndex: prevIndex,
              newSectionIndex: newIndex,
              sectionTitle: assessment.sections[newIndex]?.title,
              platform:
                typeof navigator !== 'undefined'
                  ? navigator.platform
                  : 'unknown',
            });

            return newIndex;
          }
          return prevIndex;
        });
      }
    },
    [assessment?.sections, assessmentId, currentSectionIndex] // Added dependencies for telemetry
  );

  // Initialize section index when assessment loads
  useEffect(() => {
    if (assessment?.sections && assessment.sections.length > 0) {
      setCurrentSectionIndex(0);
      logger.info('📚 Assessment loaded with sections:', {
        totalSections: assessment.sections.length,
        sections: assessment.sections.map((s, idx) => ({
          index: idx,
          id: s.id,
          title: s.title,
          questionCount: s.questions?.length || 0,
        })),
      });
    }
  }, [assessment]);

  return (
    <RoomContext.Provider value={room}>
      <div className="relative flex h-screen w-full items-center justify-center">
        <RoomAudioRenderer />
        <StartAudio label="Enable Audio" />

        {/* Top Navigation - Fixed */}
        <div className="bg-surface fixed top-0 right-0 left-0 z-50 shadow-sm">
          <div className="mx-auto max-w-7xl px-3 py-2 sm:px-4 md:px-6 md:py-3">
            <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
              <div className="flex w-full flex-col space-y-2">
                <div className="flex w-full items-center justify-between">
                  {/* Section Navigation */}
                  {assessment?.sections && assessment.sections.length > 0 ? (
                    <div className="flex items-center space-x-8">
                      {/* Current Section */}
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <div className="bg-primary text-surface flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium">
                            {currentSectionIndex + 1}
                          </div>
                          <div>
                            <div className="text-text-primary text-sm font-medium">
                              {assessment.sections[currentSectionIndex]
                                ?.title || 'AI Interview'}
                            </div>
                            <div className="text-text-tertiary text-xs">
                              Section {currentSectionIndex + 1} of{' '}
                              {assessment.sections.length}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Upcoming Section */}
                      {assessment.sections && (
                        <div className="text-text-tertiary hidden items-center space-x-3 text-sm md:flex">
                          {(() => {
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
                                      ? 'Complete your interview'
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

                  {/* Right side controls */}
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowEndDialog(true)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 hidden p-2 sm:flex"
                      disabled={!isConnected}
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
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {isConnecting && (
          <div className="flex flex-col items-center justify-center text-center">
            <div className="relative">
              <div className="border-primary/20 h-16 w-16 animate-spin rounded-full border-4"></div>
              <div className="border-t-primary absolute top-0 left-0 h-16 w-16 animate-spin rounded-full border-4 border-transparent"></div>
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-foreground text-lg font-semibold">
                Connecting to Interview
              </h3>
              <p className="text-muted-foreground text-sm">
                Please wait while we establish the connection
              </p>
            </div>
          </div>
        )}

        {isConnected && (
          <InterviewContent
            isMicEnabled={isMicEnabled}
            setIsMicEnabled={setIsMicEnabled}
            disableMicrophone={disableMicrophone}
            videoRecordingEnabled={videoRecordingEnabled}
            proctoringEnabled={proctoringEnabled}
            timeRemaining={timeRemaining}
            setTimeRemaining={setTimeRemaining}
            isTimeWarning={isTimeWarning}
            setIsTimeWarning={setIsTimeWarning}
            currentSectionIndex={currentSectionIndex}
            advanceToNextSection={advanceToNextSection}
            assessment={assessment}
            room={room}
          />
        )}

        {!isConnecting && !isConnected && (
          <div className="flex flex-col items-center justify-center text-center">
            <p className="text-destructive mb-4 font-medium">
              Failed to connect. Please try again.
            </p>
          </div>
        )}

        {/* Control Panel - Bottom Center */}
        {isConnected && (
          <div className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 transform">
            <div className="bg-surface/95 border-border flex items-center gap-4 rounded-full border px-6 py-3 shadow-xl backdrop-blur-sm">
              <button
                onClick={toggleMicrophone}
                className={`rounded-full p-3 transition-all duration-200 ${
                  isMicEnabled
                    ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                    : 'bg-destructive hover:bg-destructive/90 text-destructive-foreground'
                }`}
                title={isMicEnabled ? 'Mute Microphone' : 'Unmute Microphone'}
              >
                {isMicEnabled ? <Mic size={20} /> : <MicOff size={20} />}
              </button>

              <div className="flex items-center gap-2">
                <CandidateAudioVisualizer />
              </div>

              <div className="hidden items-center gap-2 px-3 sm:flex">
                <div
                  className={`h-2 w-2 rounded-full ${
                    isMicEnabled
                      ? 'animate-pulse bg-green-500'
                      : 'bg-muted-foreground'
                  }`}
                />
                <span className="text-text-secondary text-sm font-medium">
                  {isMicEnabled ? 'Listening' : 'Muted'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* End Assessment Dialog */}
        <AlertDialog open={showEndDialog} onOpenChange={setShowEndDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>End Assessment?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to end this assessment? This action cannot
                be undone and your current progress will be submitted
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

        {/* Video Feed with Face Detection */}
        {videoRecordingEnabled && (
          <VideoRecordingComponent
            assessmentId={assessmentId}
            proctoringEnabled={proctoringEnabled}
          />
        )}
      </div>
    </RoomContext.Provider>
  );
}

// Interview Content Component
function InterviewContent({
  isMicEnabled: isMicEnabled,
  setIsMicEnabled: setIsMicEnabled,
  disableMicrophone: disableMicrophone,
  videoRecordingEnabled: _videoRecordingEnabled,
  proctoringEnabled: _proctoringEnabled,
  timeRemaining: timeRemaining,
  setTimeRemaining: _setTimeRemaining,
  isTimeWarning: _isTimeWarning,
  setIsTimeWarning: setIsTimeWarning,
  currentSectionIndex: currentSectionIndex,
  advanceToNextSection: advanceToNextSection,
  assessment: assessment,
  room: room,
}: {
  isMicEnabled: boolean;
  setIsMicEnabled: (enabled: boolean) => void;
  disableMicrophone: () => Promise<boolean>;
  videoRecordingEnabled: boolean;
  proctoringEnabled: boolean;
  timeRemaining: number;
  setTimeRemaining: (time: number) => void;
  isTimeWarning: boolean;
  setIsTimeWarning: (isTimeWarning: boolean) => void;
  currentSectionIndex: number;
  advanceToNextSection: (targetIndex?: number) => void;
  assessment: ICandidateJobAiAssessment | null;
  room: Room;
}) {
  const { state: agentState, audioTrack: agentAudioTrack } =
    useVoiceAssistant();

  // Get transcriptions from LiveKit
  const transcriptions = useTranscriptions();

  logger.info('transcriptions', {
    transcriptions,
  });
  // Track agent speaking state for UI
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);

  useEffect(() => {
    if (
      timeRemaining <=
        ENV.NEXT_PUBLIC_ASSESSMENT_TIME_WARNING_THRESHOLD_ONBOARDING &&
      timeRemaining > 0
    ) {
      setIsTimeWarning(true);
    } else {
      setIsTimeWarning(false);
    }
  }, [timeRemaining]);

  // Update agent speaking state for UI (LiveKit turn detector handles mic control)
  useEffect(() => {
    setIsAgentSpeaking(agentState === 'speaking');
  }, [agentState]);

  // Auto-mute candidate when interviewer is speaking to prevent background noise
  const wasAutoMutedRef = useRef(false);
  const previousAgentSpeakingRef = useRef(false);

  useEffect(() => {
    if (!room?.localParticipant) return;

    const handleAutoMute = async () => {
      try {
        const agentStartedSpeaking =
          isAgentSpeaking && !previousAgentSpeakingRef.current;
        const agentStoppedSpeaking =
          !isAgentSpeaking && previousAgentSpeakingRef.current;

        // Agent started speaking - mute candidate to prevent background noise
        if (agentStartedSpeaking && isMicEnabled) {
          wasAutoMutedRef.current = true;
          await room.localParticipant.setMicrophoneEnabled(false);
          setIsMicEnabled(false);
          logger.info(
            '🔇 Auto-muted candidate microphone - interviewer is speaking'
          );
        }

        // Agent stopped speaking - unmute candidate so they can answer
        if (agentStoppedSpeaking && wasAutoMutedRef.current && !isMicEnabled) {
          wasAutoMutedRef.current = false;
          await room.localParticipant.setMicrophoneEnabled(true);
          setIsMicEnabled(true);
          logger.info(
            '🔊 Auto-unmuted candidate microphone - interviewer finished speaking'
          );
        }

        // If user manually unmutes while agent is speaking, clear the auto-mute flag
        // so we don't try to auto-unmute later
        if (isAgentSpeaking && isMicEnabled && wasAutoMutedRef.current) {
          wasAutoMutedRef.current = false;
          logger.info(
            '🔄 User manually unmuted during agent speech - clearing auto-mute flag'
          );
        }

        // If user manually mutes while agent is not speaking, clear the auto-mute flag
        if (!isAgentSpeaking && !isMicEnabled && wasAutoMutedRef.current) {
          wasAutoMutedRef.current = false;
          logger.info('🔄 User manually muted - clearing auto-mute flag');
        }

        previousAgentSpeakingRef.current = isAgentSpeaking;
      } catch (error) {
        logger.error('Failed to auto-control microphone:', error);
        // Reset flags on error to prevent stuck state
        wasAutoMutedRef.current = false;
      }
    };

    handleAutoMute();
  }, [isAgentSpeaking, isMicEnabled, room, setIsMicEnabled]);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center text-center">
      <div className="mb-8 flex flex-col items-center pt-16">
        {agentAudioTrack && (
          <div className="mb-6 flex flex-col items-center">
            <div className="relative mb-4">
              <AgentTile
                state={agentState}
                audioTrack={agentAudioTrack}
                className="scale-150"
              />
              {/* Visual indicator when agent is speaking */}
              {isAgentSpeaking && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute -bottom-6 left-1/2 -translate-x-1/2 transform"
                >
                  <div className="bg-primary/20 text-primary flex items-center gap-2 rounded-full px-4 py-1.5 backdrop-blur-sm">
                    <div className="bg-primary h-2 w-2 animate-pulse rounded-full" />
                    <span className="text-xs font-medium">Speaking...</span>
                  </div>
                </motion.div>
              )}
            </div>
            {/* Live Transcript below AgentTile */}
            <LiveTranscript
              transcriptions={transcriptions}
              room={room}
              currentSectionIndex={currentSectionIndex}
              assessment={assessment}
              isMicEnabled={isMicEnabled}
              setIsMicEnabled={setIsMicEnabled}
              disableMicrophone={disableMicrophone}
              isAgentSpeaking={isAgentSpeaking}
              advanceToNextSection={advanceToNextSection}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Live Transcript Component - Based on agent-starter-react pattern
function LiveTranscript({
  transcriptions,
  room,
  currentSectionIndex,
  assessment,
  isMicEnabled,
  disableMicrophone,
  isAgentSpeaking,
  advanceToNextSection,
}: {
  transcriptions: Array<{
    text?: string;
    participantInfo?: { identity?: string };
    streamInfo?: {
      id?: string;
      timestamp?: number;
      attributes?: Record<string, string>;
    };
  }>;
  room: Room;
  currentSectionIndex: number;
  assessment: ICandidateJobAiAssessment | null;
  isMicEnabled: boolean;
  setIsMicEnabled: (enabled: boolean) => void;
  disableMicrophone: () => Promise<boolean>;
  isAgentSpeaking: boolean;
  advanceToNextSection: (targetIndex?: number) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user: _user } = useApp();

  // Answer timer state
  const [answerTimerActive, setAnswerTimerActive] = useState(false);
  const [answerElapsedTime, setAnswerElapsedTime] = useState(0);

  // Track the last known section ID to detect section changes
  const lastSectionIdRef = useRef<string | null>(null);

  // Use ref to track latest mic state to avoid stale closure
  const isMicEnabledRef = useRef(isMicEnabled);

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Memoize time limit and progress calculations for performance
  const timeLimit = useMemo(
    () => ENV.NEXT_PUBLIC_ANSWER_EVALUATION_TIME_LIMIT,
    []
  );
  const progressPercentage = useMemo(
    () => (answerElapsedTime / timeLimit) * 100,
    [answerElapsedTime, timeLimit]
  );
  const remainingTime = useMemo(
    () => timeLimit - answerElapsedTime,
    [answerElapsedTime, timeLimit]
  );
  const isNearLimit = useMemo(
    () => answerElapsedTime >= 50,
    [answerElapsedTime]
  );
  const isApproachingLimit = useMemo(
    () => answerElapsedTime >= 40,
    [answerElapsedTime]
  );

  // Process individual messages (no grouping)
  const messages = useMemo(() => {
    if (transcriptions.length === 0) return [];

    const processed: Array<{
      speaker: string;
      isAgent: boolean;
      isCandidate: boolean;
      isEvaluation: boolean;
      text: string;
      timestamp: number;
      index: number;
      sectionTitle?: string;
      sectionId?: string;
      evaluationData?: {
        is_correct?: boolean;
        is_relevant?: boolean;
        quality_score?: number;
      } | null;
    }> = [];

    const localAudioTrackId =
      room?.localParticipant?.audioTrackPublications?.values()?.next()?.value
        ?.trackSid || '';

    transcriptions.forEach((transcription, index) => {
      const text = transcription.text || '';
      if (!text.trim()) return;

      const transcribedTrackId =
        transcription.streamInfo?.attributes?.['lk.transcribed_track_id'] || '';

      const isCandidate = transcribedTrackId === localAudioTrackId;
      const isAgent = !isCandidate;
      const speaker = isAgent ? 'Eva' : 'You';

      // Check if this is an evaluation message (shown differently in UI)
      const isEvaluation =
        text.includes('[EVALUATION]') ||
        text.includes('[IMMEDIATE_EVALUATION]');

      // Skip system messages (signals) and internal markers from display
      if (
        text.includes('[TIMER_START]') ||
        text.includes('[MIC_MUTE_COMMAND]') ||
        text.includes('[ANSWER_IRRELEVANT]') ||
        text.includes('[SECTION_COMPLETE]') ||
        text.includes('[SECTION_START]') ||
        text.includes('[ASK_QUESTION]') ||
        text.includes('[ask_question]') ||
        text.includes('[silence]') ||
        text.includes('ask_question') ||
        text.includes('next_question') ||
        text.includes('evaluate_answer') ||
        text.trim() === 'ask_question' ||
        text.trim() === 'next_question' ||
        /^ask_question\s*$/i.test(text.trim())
      ) {
        return;
      }

      // Parse evaluation if present
      let evaluationData: {
        is_correct?: boolean;
        is_relevant?: boolean;
        quality_score?: number;
      } | null = null;

      if (isEvaluation) {
        const correctMatch = text.match(/is_correct=(true|false)/);
        const relevantMatch = text.match(/is_relevant=(true|false)/);
        const qualityMatch = text.match(/quality_score=([\d.]+)/);

        evaluationData = {
          is_correct: correctMatch ? correctMatch[1] === 'true' : undefined,
          is_relevant: relevantMatch ? relevantMatch[1] === 'true' : undefined,
          quality_score: qualityMatch ? parseFloat(qualityMatch[1]) : undefined,
        };
      }

      // Get current section information from assessment
      const currentSection = assessment?.sections?.[currentSectionIndex];
      const sectionTitle = currentSection?.title;
      const sectionId = currentSection?.id;

      processed.push({
        speaker,
        isAgent,
        isCandidate,
        isEvaluation,
        text,
        timestamp: transcription.streamInfo?.timestamp || Date.now(),
        index,
        sectionTitle,
        sectionId,
        evaluationData,
      });
    });

    return processed;
  }, [transcriptions, room, assessment, currentSectionIndex]);

  // Simplified: Section detection is now handled by backend API polling only
  // (See useEffect for backend transcript polling below)

  // Update ref when mic state changes
  useEffect(() => {
    isMicEnabledRef.current = isMicEnabled;
  }, [isMicEnabled]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcriptions]);

  // Process control signals from transcriptions (timer, mic mute, etc.)
  // Note: Section changes are now handled by backend API polling (see useEffect below)
  const processSignal = useCallback(
    (text: string) => {
      // Early return if not a signal
      if (!text.includes('[')) return;

      // Check for TIMER_START signal from backend (SYNCHRONIZED)
      if (text.includes('[TIMER_START]')) {
        const timeLimitMatch = text.match(/time_limit=(\d+)/);
        const backendTimeLimit = timeLimitMatch
          ? parseInt(timeLimitMatch[1])
          : timeLimit;

        logger.info(
          `🔔 Received TIMER_START signal from backend (${backendTimeLimit}s)`
        );

        logAIInterviewTelemetry('Answer timer started', {
          timeLimit: backendTimeLimit,
          platform:
            typeof navigator !== 'undefined' ? navigator.platform : 'unknown',
        });

        // Start timer synchronized with backend
        setAnswerTimerActive(true);
        setAnswerElapsedTime(0);
        return;
      }

      // Check for ANSWER_IRRELEVANT signal from backend (IMMEDIATE)
      if (text.includes('[ANSWER_IRRELEVANT]')) {
        logger.warn(
          '⚠️ Received ANSWER_IRRELEVANT signal - answer was off-topic'
        );

        logAIInterviewTelemetry('Answer marked as irrelevant', {
          platform:
            typeof navigator !== 'undefined' ? navigator.platform : 'unknown',
        });

        // Stop timer immediately
        setAnswerTimerActive(false);
        setAnswerElapsedTime(0);

        // Mute microphone immediately
        if (isMicEnabledRef.current) {
          logger.info('🎤 Auto-disabling microphone per backend command');
          disableMicrophone()
            .then((success) => {
              logger.info(
                success
                  ? '✅ Microphone auto-disabled (backend command)'
                  : '⚠️ Microphone disable failed'
              );

              logAIInterviewTelemetry(
                'Microphone auto-disabled (irrelevant answer)',
                {
                  success,
                  platform:
                    typeof navigator !== 'undefined'
                      ? navigator.platform
                      : 'unknown',
                }
              );
            })
            .catch((error) => {
              logger.error('❌ Microphone disable error:', error);

              logAIInterviewTelemetry('Microphone auto-disable failed', {
                error: error instanceof Error ? error.message : String(error),
                platform:
                  typeof navigator !== 'undefined'
                    ? navigator.platform
                    : 'unknown',
              });
            });
        }

        toast.warning('Your answer was off-topic. Moving to next question.');
        return;
      }

      // Check for MIC_MUTE_COMMAND from backend
      if (text.includes('[MIC_MUTE_COMMAND]')) {
        logger.info('🔇 Received MIC_MUTE_COMMAND from backend');

        logAIInterviewTelemetry('Mic mute command received', {
          platform:
            typeof navigator !== 'undefined' ? navigator.platform : 'unknown',
        });

        // Stop timer
        setAnswerTimerActive(false);
        setAnswerElapsedTime(0);

        // Mute microphone immediately
        if (isMicEnabledRef.current) {
          disableMicrophone();
        }
        return;
      }

      // Check for evaluation messages (stop timer)
      if (
        text.includes('[EVALUATION]') ||
        text.includes('[IMMEDIATE_EVALUATION]')
      ) {
        logAIInterviewTelemetry('Evaluation started', {
          evaluationType: text.includes('[IMMEDIATE_EVALUATION]')
            ? 'immediate'
            : 'normal',
          platform:
            typeof navigator !== 'undefined' ? navigator.platform : 'unknown',
        });

        setAnswerTimerActive(false);
        setAnswerElapsedTime(0);
        return;
      }
    },
    [timeLimit, disableMicrophone]
  );

  // Process signals from transcriptions
  useEffect(() => {
    transcriptions.forEach((transcription) => {
      if (transcription.text) {
        processSignal(transcription.text);
      }
    });
  }, [transcriptions, processSignal]);

  /**
   * Poll backend for transcripts with section information (PRIMARY SOURCE)
   *
   * The backend receives transcript chunks from the LiveKit agent with rich metadata
   * including sectionId and sectionTitle. We poll the backend API every 5 seconds to:
   * 1. Get the latest transcripts with section metadata
   * 2. Detect section changes by comparing sectionTitle with current section title
   * 3. Update the section navigation header automatically
   *
   * This is simpler and more reliable than parsing signals or matching questions.
   */
  useEffect(() => {
    if (!assessment?.sections || assessment.sections.length === 0) return;

    const searchParams = new URLSearchParams(window.location.search);
    const assessmentId = searchParams.get('id');
    if (!assessmentId) return;

    const fetchAndCheckSection = async () => {
      try {
        const response = await liveKitService.getRecentTranscripts(
          assessmentId,
          'JOB_AI',
          10 // Get last 10 transcripts (enough to catch section changes)
        );

        const transcripts = response.transcripts || [];

        if (!transcripts || transcripts.length === 0) {
          logger.debug('No transcripts available yet');
          return;
        }

        // Find the most recent transcript with section information
        // Prioritize [SECTION_START] system messages as they contain the current section
        const latestWithSection = transcripts[0];

        if (!latestWithSection?.sectionTitle) {
          logger.debug('No transcript with section information found');
          return;
        }

        const { sectionId, sectionTitle } = latestWithSection;

        // Get current section title from state
        const currentSectionTitle =
          assessment.sections[currentSectionIndex]?.title;

        logger.info('📍 Section title check:', {
          apiSectionTitle: sectionTitle,
          currentSectionTitle,
          apiSectionId: sectionId,
          currentSectionIndex,
        });

        // Check if the section title from API is different from current state
        if (sectionTitle !== currentSectionTitle) {
          // Find the section index by matching the title from API
          const newSectionIndex = assessment.sections.findIndex(
            (s) => s.title === sectionTitle
          );

          logger.info('🔍 Section title mismatch detected:', {
            apiTitle: sectionTitle,
            currentTitle: currentSectionTitle,
            newSectionIndex,
            availableSections: assessment.sections.map((s, idx) => ({
              index: idx,
              id: s.id,
              title: s.title,
            })),
          });

          // Update UI if we found a valid section that's different from current
          if (
            newSectionIndex !== -1 &&
            newSectionIndex !== currentSectionIndex
          ) {
            logger.info(
              `✅ Section updated: "${currentSectionTitle}" → "${sectionTitle}" (index ${currentSectionIndex} → ${newSectionIndex})`
            );

            // Update tracking ref
            lastSectionIdRef.current = sectionId ?? null;

            // Update section in UI
            advanceToNextSection(newSectionIndex);

            // Show toast notification
            toast.info(`Moving to: ${sectionTitle}`);
          } else if (newSectionIndex === -1) {
            logger.warn(
              `⚠️ Section title "${sectionTitle}" not found in assessment sections`
            );
          }
        } else {
          // Titles match - sync the ref if needed
          if (sectionId !== lastSectionIdRef.current) {
            lastSectionIdRef.current = sectionId ?? null;
            logger.debug('Section ref synchronized:', sectionId);
          }
        }
      } catch (error) {
        logger.error('Failed to fetch transcripts from backend:', error);
        // Silent fail - this is background polling
      }
    };

    // Initial fetch and then poll every 5 seconds
    fetchAndCheckSection();
    pollingIntervalRef.current = setInterval(fetchAndCheckSection, 5000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [assessment, currentSectionIndex, advanceToNextSection]);

  return (
    <div className="bg-surface/80 border-border/50 mt-4 w-[640px] rounded-xl border p-4 shadow-md backdrop-blur-sm">
      {/* Header with status */}
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full ${
              isAgentSpeaking
                ? 'animate-pulse bg-blue-500'
                : transcriptions.length > 0
                  ? 'animate-pulse bg-green-500'
                  : 'bg-gray-400'
            }`}
          />
          <span className="text-text-secondary text-xs font-medium tracking-wide">
            {isAgentSpeaking ? (
              <span className="text-primary">Interviewer Speaking...</span>
            ) : (
              <>
                Live Transcript{' '}
                {transcriptions.length === 0 && '(Waiting for speech...)'}
              </>
            )}
          </span>
        </div>

        {/* Answer Timer Display */}
        <AnimatePresence>
          {answerTimerActive && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`flex items-center gap-2 rounded-full px-3 py-1.5 ${
                isNearLimit
                  ? 'bg-red-500/20 text-red-600 dark:text-red-400'
                  : isApproachingLimit
                    ? 'bg-orange-500/20 text-orange-600 dark:text-orange-400'
                    : 'bg-primary/20 text-primary'
              }`}
            >
              <Timer className="h-3.5 w-3.5" />
              <span className="text-xs font-semibold">
                {answerElapsedTime}s / {timeLimit}s
              </span>
              {answerElapsedTime >= 55 && (
                <AlertCircle className="h-3.5 w-3.5 animate-pulse" />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Answer Timer Progress Bar */}
      <AnimatePresence>
        {answerTimerActive && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3"
          >
            <div className="bg-muted relative h-2 overflow-hidden rounded-full">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.3 }}
                className={`h-full ${
                  isNearLimit
                    ? 'bg-red-500'
                    : isApproachingLimit
                      ? 'bg-orange-500'
                      : 'bg-primary'
                }`}
              />
            </div>
            <p className="text-text-tertiary mt-1 text-xs">
              {answerElapsedTime < timeLimit
                ? `AI will evaluate in ${remainingTime}s (mic will mute automatically)`
                : 'Evaluating your answer...'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      <div
        ref={scrollRef}
        className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border/50 max-h-48 space-y-2 overflow-y-auto"
      >
        {transcriptions.length === 0 ? (
          <p className="text-text-secondary text-sm italic">
            Transcriptions will appear here as you speak...
          </p>
        ) : messages.length === 0 ? (
          <p className="text-text-secondary text-sm italic">
            Transcriptions will appear here as you speak...
          </p>
        ) : (
          messages.map((message) => (
            <motion.div
              key={`message-${message.index}-${message.timestamp}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`rounded-lg p-3 ${
                message.isEvaluation
                  ? 'border border-blue-500/30 bg-blue-500/10'
                  : message.isAgent
                    ? 'bg-primary/10 text-text-primary'
                    : 'bg-muted/50 text-text-secondary'
              }`}
            >
              <div className="mb-1 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-semibold ${
                      message.isEvaluation
                        ? 'text-blue-600 dark:text-blue-400'
                        : message.isAgent
                          ? 'text-primary'
                          : 'text-gray-500'
                    }`}
                  >
                    {message.isEvaluation ? 'Evaluation' : message.speaker}
                  </span>

                  {message.isEvaluation && message.evaluationData && (
                    <div className="flex items-center gap-1">
                      {message.evaluationData.is_correct &&
                      message.evaluationData.is_relevant ? (
                        <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                      ) : !message.evaluationData.is_correct ||
                        !message.evaluationData.is_relevant ? (
                        <XCircle className="h-3.5 w-3.5 text-red-600" />
                      ) : (
                        <AlertCircle className="h-3.5 w-3.5 text-orange-600" />
                      )}
                      <span className="text-muted-foreground text-xs">
                        Score:{' '}
                        {(
                          (message.evaluationData.quality_score || 0) * 100
                        ).toFixed(0)}
                        %
                      </span>
                    </div>
                  )}
                </div>
                <span className="text-text-secondary text-xs">
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <p className="text-text-primary text-sm leading-relaxed">
                {message.isEvaluation ? (
                  <span className="text-muted-foreground italic">
                    Answer evaluated - Check AI feedback above
                  </span>
                ) : (
                  message.text
                )}
              </p>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

// Video Recording Component with Optimized Audio Mixing
function VideoRecordingComponent({
  assessmentId,
  proctoringEnabled,
}: {
  assessmentId: string;
  proctoringEnabled: boolean;
}) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const chunksRef = React.useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const room = useRoomContext();

  useEffect(() => {
    const videoElement = videoRef.current;
    let audioContext: AudioContext | null = null;
    let mixedStream: MediaStream | null = null;

    const initVideoAndAudioRecording = async () => {
      try {
        // Get video stream from camera
        const videoStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user',
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 48000,
          },
        });

        // Display video preview
        if (videoElement) {
          videoElement.srcObject = videoStream;
          videoElement.muted = true;

          // Handle play() promise properly to avoid interruption errors
          try {
            await videoElement.play();
            setIsVideoReady(true);
          } catch (playError: any) {
            // Ignore AbortError which happens when play() is interrupted by a new load
            if (playError.name !== 'AbortError') {
              logger.error('Failed to play video:', playError);
            }
          }
        }

        // Create audio context for mixing
        audioContext = new AudioContext({ sampleRate: 48000 });
        const destination = audioContext.createMediaStreamDestination();

        // Mix candidate microphone audio
        const micAudioTrack = videoStream.getAudioTracks()[0];
        if (micAudioTrack) {
          const micSource = audioContext.createMediaStreamSource(
            new MediaStream([micAudioTrack])
          );
          const micGain = audioContext.createGain();
          micGain.gain.value = 1.0; // Full volume for candidate
          micSource.connect(micGain);
          micGain.connect(destination);
        }

        // Mix agent audio from LiveKit room
        if (room) {
          const agentAudioTracks: MediaStreamTrack[] = [];

          // Get all remote participant audio tracks (agent)
          room.remoteParticipants.forEach((participant) => {
            participant.audioTrackPublications.forEach((publication) => {
              if (publication.track && publication.track.mediaStreamTrack) {
                agentAudioTracks.push(publication.track.mediaStreamTrack);
              }
            });
          });

          // If agent tracks exist, mix them
          if (agentAudioTracks.length > 0) {
            const agentStream = new MediaStream(agentAudioTracks);
            const agentSource =
              audioContext.createMediaStreamSource(agentStream);
            const agentGain = audioContext.createGain();
            agentGain.gain.value = 1.2; // Slightly boost agent volume
            agentSource.connect(agentGain);
            agentGain.connect(destination);
          }

          // Listen for new agent participants joining
          room.on('trackSubscribed', (track, _publication) => {
            if (track.kind === 'audio' && track.mediaStreamTrack) {
              const source = audioContext!.createMediaStreamSource(
                new MediaStream([track.mediaStreamTrack])
              );
              const gain = audioContext!.createGain();
              gain.gain.value = 1.2;
              source.connect(gain);
              gain.connect(destination);
            }
          });
        }

        // Create mixed stream with video and mixed audio
        const videoTrack = videoStream.getVideoTracks()[0];
        const mixedAudioTrack = destination.stream.getAudioTracks()[0];
        mixedStream = new MediaStream([videoTrack, mixedAudioTrack]);

        // Configure MediaRecorder with optimized settings
        const options = {
          mimeType: 'video/webm;codecs=vp8,opus',
          videoBitsPerSecond: 500000, // 500 kbps for video (reduced from default)
          audioBitsPerSecond: 64000, // 64 kbps for audio
        };

        // Fallback if VP8 not supported
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          options.mimeType = 'video/webm';
          logger.warn('VP8/Opus not supported, using default webm codec');
        }

        const mediaRecorder = new MediaRecorder(mixedStream, options);
        mediaRecorderRef.current = mediaRecorder;

        // Handle data available - collect chunks
        mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            chunksRef.current.push(event.data);
          }
        };

        // Handle recording stop - upload to backend
        mediaRecorder.onstop = async () => {
          const blob = new Blob(chunksRef.current, { type: 'video/webm' });
          const sizeMB = (blob.size / (1024 * 1024)).toFixed(2);
          logger.info(
            `Client-side recording complete: ${sizeMB} MB (${chunksRef.current.length} chunks)`
          );

          // Upload to backend
          try {
            const formData = new FormData();
            formData.append(
              'video',
              blob,
              `interview-${assessmentId}-${Date.now()}.webm`
            );
            formData.append('assessmentId', assessmentId);

            // TODO: Replace with actual upload endpoint
            // await fetch('/api/upload-interview-recording', {
            //   method: 'POST',
            //   body: formData,
            // });
          } catch (error) {
            logger.error('Failed to upload recording:', error);
            toast.error('Failed to save interview recording');
          }

          // Clear chunks
          chunksRef.current = [];
        };

        // Start recording with 10-second chunks for progressive upload
        mediaRecorder.start(10000);
        setIsRecording(true);
        logger.info(
          '✅ Client-side video recording started (backup/proctoring)'
        );

        logAIInterviewTelemetry('Video recording started', {
          assessmentId,
          mimeType: options.mimeType,
          videoBitsPerSecond: options.videoBitsPerSecond,
          audioBitsPerSecond: options.audioBitsPerSecond,
          platform:
            typeof navigator !== 'undefined' ? navigator.platform : 'unknown',
        });
      } catch (error) {
        logger.error('Failed to initialize video/audio recording:', error);
        // Note: Server-side recording via LiveKit Egress is the primary recording method
        // Client-side recording is optional/backup, so we just log the error without showing toast
      }
    };

    initVideoAndAudioRecording();

    return () => {
      // Stop recording
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== 'inactive'
      ) {
        mediaRecorderRef.current.stop();
      }

      // Stop video stream
      if (videoElement?.srcObject) {
        const stream = videoElement.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }

      // Close audio context
      if (audioContext) {
        audioContext.close();
      }

      // Stop mixed stream
      if (mixedStream) {
        mixedStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [assessmentId, room]);

  return (
    <div className="bg-surface fixed right-4 bottom-4 h-40 w-52 overflow-hidden rounded-2xl shadow-lg sm:h-48 sm:w-64 md:right-auto md:bottom-6 md:left-6 md:h-64 md:w-96">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="h-full w-full scale-x-[-1] transform object-cover"
        onLoadedMetadata={() => setIsVideoReady(true)}
      />
      {isRecording && (
        <div className="absolute right-2 bottom-2 flex items-center space-x-1 rounded-full bg-red-500 px-2 py-1 text-xs text-white">
          <div className="h-2 w-2 animate-pulse rounded-full bg-white" />
          <span>Recording</span>
        </div>
      )}
      {proctoringEnabled && isVideoReady && videoRef.current && (
        <FaceDetectionOverlay
          videoRef={videoRef}
          isEnabled={proctoringEnabled}
          assessmentId={assessmentId}
        />
      )}
    </div>
  );
}

export default function AIInterviewPage() {
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
      <AIInterviewPageContent />
    </Suspense>
  );
}

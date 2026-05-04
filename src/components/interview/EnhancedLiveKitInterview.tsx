'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { Room, RoomEvent } from 'livekit-client';
import {
  RoomAudioRenderer,
  RoomContext,
  StartAudio,
  useVoiceAssistant,
  useTranscriptions,
} from '@livekit/components-react';
import { liveKitService } from '@/lib/services/services';
import {
  candidateOnboardingAssessmentService,
  candidateJobAiAssessmentService,
} from '@/lib/services/services';
import { AgentTile } from './AgentTile';
import { CandidateAudioVisualizer } from './CandidateAudioVisualizer';
import { Transcript, TranscriptEntry } from './Transcript';
import { FaceDetectionOverlay } from '@/app/(pages)/app/candidate/assessments/onboarding/assessment/components/face-detection-overlay';
import { logger } from '@/lib/logger';
import { Mic, MicOff, MessageSquare } from 'lucide-react';
import { useApp } from '@/lib/context/app-context';

interface EnhancedLiveKitInterviewProps {
  assessmentId: string;
  assessmentType: 'ONBOARDING' | 'JOB_AI';
  videoRecordingEnabled?: boolean;
  proctoringEnabled?: boolean;
  onConnectionChange?: (connected: boolean) => void;
  onError?: (error: Error) => void;
  onRecordingStart?: () => void;
  onRecordingStop?: () => void;
}

export function EnhancedLiveKitInterview({
  assessmentId,
  assessmentType,
  videoRecordingEnabled = false,
  proctoringEnabled = false,
  onConnectionChange,
  onError,
  onRecordingStart,
  onRecordingStop,
}: EnhancedLiveKitInterviewProps) {
  const room = useMemo(() => new Room(), []);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);

  // Transcript state - visible by default
  const [isTranscriptVisible, setIsTranscriptVisible] = useState(true);

  // Interview progress tracking
  const [interviewProgress, setInterviewProgress] = useState<{
    currentSectionId?: string;
    currentSectionTitle?: string;
    currentSectionIndex?: number;
    totalSections?: number;
    questionsAsked?: number;
  } | null>(null);

  // Video recording refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);
  const { user } = useApp();
  const candidateId = user?.candidateId;

  useEffect(() => {
    let aborted = false;

    const connectToRoom = async () => {
      setIsConnecting(true);

      try {
        const roomData = await liveKitService.createRoom({
          candidateId: candidateId!,
          assessmentId,
          assessmentType,
          roomConfig: {
            useHttpPolling: true, // ✅ FORCE HTTP Polling mode
            useRedisMode: false, // ❌ Disable Redis mode
          },
        });

        if (aborted) return;

        await room.connect(
          roomData.connectionDetails.serverUrl,
          roomData.connectionDetails.participantToken
        );

        if (aborted) return;

        // Enable microphone AFTER connection is established
        logger.info('Enabling microphone for participant...');
        await room.localParticipant.setMicrophoneEnabled(true);

        // Enable camera to publish video to LiveKit room (required for server-side recording)
        logger.info('Enabling camera for participant...');
        await room.localParticipant.setCameraEnabled(true);

        // Wait a moment for tracks to be created
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Verify microphone track is published
        const micTrack = room.localParticipant.audioTrackPublications
          .values()
          .next().value;
        if (micTrack) {
          logger.info('Microphone track published successfully:', {
            sid: micTrack.trackSid,
            muted: micTrack.isMuted,
          });
        } else {
          logger.warn('No microphone track found after enabling!');
        }

        // Verify camera track is published
        const cameraTrack = Array.from(
          room.localParticipant.videoTrackPublications.values()
        ).find((track) => track.source === 'camera');
        if (cameraTrack) {
          logger.info('Camera track published successfully:', {
            sid: cameraTrack.trackSid,
            muted: cameraTrack.isMuted,
          });
        } else {
          logger.warn('No camera track found after enabling!');
        }

        // Initialize video recording if enabled (for client-side backup/proctoring)
        if (videoRecordingEnabled) {
          await initializeVideoRecording();
        }

        if (aborted) return;

        // Set up event listeners for track publishing
        room.localParticipant.on('trackPublished', (publication) => {
          logger.info('Track published:', {
            kind: publication.kind,
            sid: publication.trackSid,
            source: publication.source,
          });
        });

        setIsConnected(true);
        onConnectionChange?.(true);

        // Load initial interview progress
        loadInterviewProgress();
      } catch (error) {
        if (aborted) return;

        logger.error('Failed to connect to LiveKit:', error);

        // Disconnect if there was an error
        try {
          room.disconnect();
        } catch (disconnectError) {
          logger.error('Error during disconnect:', disconnectError);
        }

        onError?.(
          error instanceof Error ? error : new Error('Connection failed')
        );
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
      setIsConnected(false);
      onConnectionChange?.(false);
      cleanupVideoRecording();
    };
  }, [assessmentId, assessmentType, room, videoRecordingEnabled]);

  // Initialize video recording
  const initializeVideoRecording = async () => {
    try {
      // Get user media (video + audio)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: true,
      });

      videoStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true; // Mute local playback
        await videoRef.current.play();
      }

      // Set up MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8,opus',
      });

      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          await uploadVideoChunk(event.data);
        }
      };

      mediaRecorder.onerror = (event) => {
        logger.error('MediaRecorder error:', event);
      };

      mediaRecorderRef.current = mediaRecorder;

      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      setIsVideoEnabled(true);
      onRecordingStart?.();

      // Set up chunking (every 30 seconds)
      const chunkInterval = setInterval(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
          setTimeout(() => {
            if (mediaRecorder.state === 'inactive') {
              mediaRecorder.start();
            }
          }, 100);
        }
      }, 30000);

      // Store interval reference for cleanup
      (mediaRecorder as any)._chunkInterval = chunkInterval;

      logger.info('Video recording initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize video recording:', error);
      onError?.(
        error instanceof Error ? error : new Error('Video recording failed')
      );
    }
  };

  // Upload video chunk
  const uploadVideoChunk = async (chunk: Blob) => {
    if (!assessmentId) {
      logger.error('Assessment ID is not set');
      return;
    }

    try {
      // Get presigned URL based on assessment type
      const service =
        assessmentType === 'ONBOARDING'
          ? candidateOnboardingAssessmentService
          : candidateJobAiAssessmentService;

      const response = await service.getPresignedUrl(assessmentId);
      const presignedUrl = response.presignedUrl;

      if (!presignedUrl) {
        throw new Error('Failed to get presigned URL');
      }

      // Upload chunk to cloud storage
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

      logger.info('Video chunk uploaded successfully:', chunk.size);
    } catch (error) {
      logger.error('Error uploading video chunk:', error);
    }
  };

  // Cleanup video recording
  const cleanupVideoRecording = () => {
    if (mediaRecorderRef.current) {
      const interval = (mediaRecorderRef.current as any)._chunkInterval;
      if (interval) {
        clearInterval(interval);
      }

      if (mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    }

    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach((track) => track.stop());
    }

    setIsRecording(false);
    setIsVideoEnabled(false);
    setIsVideoReady(false);
    onRecordingStop?.();
  };

  // Toggle microphone
  const toggleMicrophone = async () => {
    try {
      await room.localParticipant.setMicrophoneEnabled(!isMicEnabled);
      setIsMicEnabled(!isMicEnabled);
    } catch (error) {
      logger.error('Failed to toggle microphone:', error);
    }
  };

  // Load interview progress from backend
  const loadInterviewProgress = async () => {
    try {
      const service =
        assessmentType === 'ONBOARDING'
          ? candidateOnboardingAssessmentService
          : candidateJobAiAssessmentService;

      const assessment = await service.getAssessment(assessmentId);

      // Get sections
      const sections = assessment.sections || [];
      const progressData =
        (assessment.progressState?.progressData as any) || {};

      // Get max questions per section from settings
      const maxQuestionsPerSection =
        assessmentType === 'ONBOARDING'
          ? (assessment as any)?.onboardingAssessmentSettings
              ?.maxQuestionsPerSection
          : (assessment as any)?.jobAiAssessmentSettings
              ?.maxQuestionsPerSection;

      // Get questions asked in current section
      const questionsAskedInSection = progressData.questionsAskedInSection || 0;

      // Console logs for debugging
      logger.info('=== Section Progress Info ===');
      logger.info('Max Questions Per Section:', maxQuestionsPerSection);
      logger.info(
        'Questions Asked in Current Section:',
        questionsAskedInSection
      );
      logger.info('Current Section ID:', progressData.currentSectionId);
      logger.info('============================');

      if (progressData && progressData.currentSectionId) {
        const currentSection = sections.find(
          (s: any) => s.id === progressData.currentSectionId
        );
        const currentIndex = sections.findIndex(
          (s: any) => s.id === progressData.currentSectionId
        );

        setInterviewProgress({
          currentSectionId: progressData.currentSectionId,
          currentSectionTitle: currentSection?.title || 'Unknown Section',
          currentSectionIndex: currentIndex + 1,
          totalSections: sections.length,
          questionsAsked: questionsAskedInSection,
        });
      } else {
        // Set initial state
        setInterviewProgress({
          currentSectionIndex: 1,
          currentSectionTitle: sections[0]?.title || 'Introduction',
          totalSections: sections.length,
          questionsAsked: 0,
        });
      }
    } catch (error) {
      logger.error('Failed to load interview progress:', error);
    }
  };

  // Poll for interview progress every 10 seconds
  useEffect(() => {
    if (!isConnected) return;

    const intervalId = setInterval(() => {
      loadInterviewProgress();
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(intervalId);
  }, [isConnected, assessmentId, assessmentType]);

  // Handle room events
  useEffect(() => {
    const onDisconnected = () => {
      setIsConnected(false);
      onConnectionChange?.(false);
    };

    const onMediaDevicesError = (error: Error) => {
      logger.error('Media devices error:', error);
      onError?.(error);
    };

    room.on(RoomEvent.Disconnected, onDisconnected);
    room.on(RoomEvent.MediaDevicesError, onMediaDevicesError);

    return () => {
      room.off(RoomEvent.Disconnected, onDisconnected);
      room.off(RoomEvent.MediaDevicesError, onMediaDevicesError);
    };
  }, [room, onConnectionChange, onError]);

  return (
    <RoomContext.Provider value={room}>
      <div className="relative flex h-full w-full items-center justify-center">
        <RoomAudioRenderer />
        <StartAudio label="Enable Audio" />

        {/* Main Content Area */}
        <div className="flex h-full w-full items-center justify-center">
          {/* Connection Status */}
          {isConnecting && (
            <div className="flex flex-col items-center justify-center text-center">
              <div className="border-primary mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2"></div>
              <p className="text-text-primary font-medium">
                Connecting to interview...
              </p>
            </div>
          )}

          {isConnected && (
            <InterviewSession
              isMicEnabled={isMicEnabled}
              interviewProgress={interviewProgress}
            />
          )}

          {!isConnecting && !isConnected && (
            <div className="flex flex-col items-center justify-center text-center">
              <p className="text-destructive mb-4 font-medium">
                Failed to connect. Please try again.
              </p>
            </div>
          )}
        </div>

        {/* Video Feed - Bottom Left Corner (Fixed) */}
        {videoRecordingEnabled && (
          <div className="bg-surface fixed right-4 bottom-4 h-40 w-52 overflow-hidden rounded-2xl shadow-lg sm:h-48 sm:w-64 md:right-auto md:bottom-6 md:left-6 md:h-64 md:w-96">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover"
              onLoadedMetadata={() => setIsVideoReady(true)}
            />
            {isRecording && (
              <div className="absolute right-2 bottom-2 flex items-center space-x-1 rounded-full bg-red-500 px-2 py-1 text-xs text-white">
                <div className="h-2 w-2 animate-pulse rounded-full bg-white" />
                <span>Recording</span>
              </div>
            )}
            {/* Face Detection Overlay */}
            {proctoringEnabled &&
              isVideoEnabled &&
              isVideoReady &&
              videoRef.current && (
                <FaceDetectionOverlay
                  videoRef={videoRef}
                  isEnabled={proctoringEnabled}
                  assessmentId={assessmentId}
                />
              )}
          </div>
        )}

        {/* Control Panel - Bottom Center (Fixed) */}
        {isConnected && (
          <div className="fixed bottom-8 left-1/2 z-10 -translate-x-1/2 transform">
            <div className="bg-surface/95 border-border flex items-center gap-4 rounded-full border px-6 py-3 shadow-xl backdrop-blur-sm">
              {/* Microphone Toggle */}
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

              {/* Candidate Audio Visualizer - Right side of mic button */}
              <div className="flex items-center gap-2">
                <CandidateAudioVisualizer />
              </div>

              {/* Transcript Toggle */}
              <button
                onClick={() => setIsTranscriptVisible(!isTranscriptVisible)}
                className={`rounded-full p-3 transition-all duration-200 ${
                  isTranscriptVisible
                    ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                    : 'bg-secondary hover:bg-secondary/90 text-secondary-foreground'
                }`}
                title={
                  isTranscriptVisible ? 'Hide Transcript' : 'Show Transcript'
                }
              >
                <MessageSquare size={20} />
              </button>

              {/* Microphone Status Text */}
              <div className="hidden items-center gap-2 px-3 sm:flex">
                <div
                  className={`h-2 w-2 rounded-full ${isMicEnabled ? 'animate-pulse bg-green-500' : 'bg-muted-foreground'}`}
                />
                <span className="text-text-secondary text-sm font-medium">
                  {isMicEnabled ? 'Listening' : 'Muted'}
                </span>
              </div>

              {/* Recording Indicator */}
              {videoRecordingEnabled && isRecording && (
                <div className="border-border hidden items-center gap-2 border-l px-3 md:flex">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                  <span className="text-text-secondary text-sm font-medium">
                    Recording
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Transcript Panel Wrapper - Must be inside RoomContext */}
        {isConnected && (
          <TranscriptWrapper
            isVisible={isTranscriptVisible}
            onToggle={() => setIsTranscriptVisible(!isTranscriptVisible)}
          />
        )}
      </div>
    </RoomContext.Provider>
  );
}

function InterviewSession({
  isMicEnabled: _isMicEnabled,
  interviewProgress,
}: {
  isMicEnabled: boolean;
  interviewProgress?: {
    currentSectionTitle?: string;
    currentSectionIndex?: number;
    totalSections?: number;
    questionsAsked?: number;
  } | null;
}) {
  const { state: agentState, audioTrack: agentAudioTrack } =
    useVoiceAssistant();

  return (
    <div className="flex h-full w-full flex-col items-center justify-center text-center">
      {/* Interview Progress Bar - Top */}
      {interviewProgress && interviewProgress.totalSections && (
        <div className="fixed top-4 left-1/2 z-10 w-full max-w-2xl -translate-x-1/2 transform px-4">
          <div className="bg-surface/95 border-border rounded-lg border p-4 shadow-lg backdrop-blur-sm">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-text-secondary text-sm font-medium">
                Section {interviewProgress.currentSectionIndex || 1} of{' '}
                {interviewProgress.totalSections}
              </span>
              <span className="text-text-tertiary text-xs">
                {interviewProgress.questionsAsked || 0} questions asked
              </span>
            </div>
            <h3 className="text-text-primary mb-3 text-lg font-semibold">
              {interviewProgress.currentSectionTitle || 'Interview in Progress'}
            </h3>
            <div className="bg-muted h-2 w-full rounded-full">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${((interviewProgress.currentSectionIndex || 1) / interviewProgress.totalSections) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* AI Avatar Section - Similar to old assessment */}
      <div className="mb-8 flex flex-col items-center">
        {/* AI Avatar with AgentTile */}
        {agentAudioTrack && (
          <div className="mb-6 flex flex-col items-center">
            <div className="mb-4">
              <AgentTile
                state={agentState}
                audioTrack={agentAudioTrack}
                className="scale-350"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Transcript Wrapper - Must be inside RoomContext to use useTranscriptions
function TranscriptWrapper({
  isVisible,
  onToggle,
}: {
  isVisible: boolean;
  onToggle: () => void;
}) {
  // Use LiveKit's useTranscriptions hook to get all transcriptions
  const transcriptions = useTranscriptions();

  // Convert LiveKit transcription format to our TranscriptEntry format
  const transcriptEntries: TranscriptEntry[] = transcriptions.map((t) => ({
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    speaker: t.participantInfo.identity?.includes('agent')
      ? 'agent'
      : 'candidate',
    text: t.text || '',
    isFinal: true,
  }));

  return (
    <>
      {/* Transcript Panel - Right Side (Fixed) */}
      {isVisible && (
        <div className="fixed top-20 right-4 z-20 max-h-[calc(100vh-8rem)] w-80">
          <Transcript
            entries={transcriptEntries}
            isVisible={isVisible}
            onToggle={onToggle}
            onClear={() => {
              // Note: LiveKit transcriptions are read-only, can't clear
              logger.info('Clear transcript requested (read-only)');
            }}
            className="h-full"
          />
        </div>
      )}

      {/* Floating Transcript Button - Top Right */}
      {!isVisible && (
        <div className="fixed top-20 right-4 z-20">
          <button
            onClick={onToggle}
            className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2 rounded-full px-4 py-2 shadow-lg transition-all duration-200 hover:scale-105"
            title="Show Transcript"
          >
            <MessageSquare size={16} />
            <span className="text-sm font-medium">Transcript</span>
            {transcriptEntries.length > 0 && (
              <span className="bg-primary-foreground text-primary rounded-full px-2 py-1 text-xs font-bold">
                {transcriptEntries.length}
              </span>
            )}
          </button>
        </div>
      )}
    </>
  );
}

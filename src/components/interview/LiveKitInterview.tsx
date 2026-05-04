'use client';

import { useEffect, useMemo, useState } from 'react';
import { Room, RoomEvent } from 'livekit-client';
import {
  RoomAudioRenderer,
  RoomContext,
  StartAudio,
  useConnectionState,
  useTracks,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import { liveKitService } from '@/lib/services/services';
import { logger } from '@/lib/shared';
import { useApp } from '@/lib/context/app-context';

interface LiveKitInterviewProps {
  assessmentId: string;
  assessmentType: 'ONBOARDING' | 'JOB_AI';
  onConnectionChange?: (connected: boolean) => void;
  onError?: (error: Error) => void;
}

export function LiveKitInterview({
  assessmentId,
  assessmentType,
  onConnectionChange,
  onError,
}: LiveKitInterviewProps) {
  const room = useMemo(() => new Room(), []);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useApp();
  const candidateId = user?.candidateId;

  useEffect(() => {
    let aborted = false;

    const connectToRoom = async () => {
      setIsConnecting(true);

      try {
        // Create room and get connection details from backend
        // Note: candidateId is extracted from JWT token by backend
        logger.info('[LiveKitInterview] Creating room with:', {
          assessmentId,
          assessmentType,
        });

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

        // Connect to room FIRST
        await room.connect(
          roomData.connectionDetails.serverUrl,
          roomData.connectionDetails.participantToken
        );

        logger.info(
          '[LiveKitInterview] Connected! Enabling microphone and camera...'
        );

        if (aborted) return;

        // Enable microphone AFTER connection is established
        await room.localParticipant.setMicrophoneEnabled(true);

        // Enable camera to publish video to LiveKit room (required for server-side recording)
        await room.localParticipant.setCameraEnabled(true);

        if (aborted) return;

        setIsConnected(true);
        onConnectionChange?.(true);
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
    };
  }, [assessmentId, assessmentType, room]);

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
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg bg-gradient-to-br from-blue-50 to-indigo-100 p-6 shadow-lg">
        <RoomAudioRenderer />
        <StartAudio label="Enable Audio" />

        {isConnecting && (
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600"></div>
            <p className="font-medium text-gray-700">
              Connecting to interview...
            </p>
          </div>
        )}

        {isConnected && <InterviewSession />}

        {!isConnecting && !isConnected && (
          <div className="text-center">
            <p className="font-medium text-red-600">
              Failed to connect. Please try again.
            </p>
          </div>
        )}
      </div>
    </RoomContext.Provider>
  );
}

function InterviewSession() {
  const connectionState = useConnectionState();
  const tracks = useTracks([Track.Source.Microphone]);

  const isMicActive = tracks.some(
    (track) => track.publication.isMuted === false
  );

  return (
    <div className="space-y-4 text-center">
      <div className="flex items-center justify-center space-x-3">
        <div
          className={`h-4 w-4 rounded-full ${
            connectionState === 'connected'
              ? 'animate-pulse bg-green-500'
              : 'bg-gray-400'
          }`}
        />
        <span className="text-lg font-semibold text-gray-800">
          {connectionState === 'connected'
            ? 'Interview in Progress'
            : 'Connecting...'}
        </span>
      </div>

      {connectionState === 'connected' && (
        <>
          <div className="flex items-center justify-center space-x-2">
            <svg
              className={`h-6 w-6 ${isMicActive ? 'text-green-600' : 'text-gray-400'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
            <span className="text-sm text-gray-600">
              {isMicActive ? 'Microphone Active' : 'Microphone Muted'}
            </span>
          </div>

          <p className="max-w-md text-sm text-gray-600">
            Your AI interviewer is ready. Speak naturally and answer the
            questions as they are asked.
          </p>
        </>
      )}
    </div>
  );
}

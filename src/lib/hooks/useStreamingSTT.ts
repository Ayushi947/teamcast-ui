import { useEffect, useRef, useState, useCallback } from 'react';
import { logger } from '@/lib/logger';
import { toast } from 'sonner';
import { ENV } from '@/lib/env';
import { getToken } from '@/lib/utils/auth-utils';

export interface TranscriptResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
  stability: number;
  words?: Array<{
    word: string;
    confidence: number;
    startTime: number;
    endTime: number;
  }>;
}

export interface UseStreamingSTTProps {
  assessmentId: string;
  onTranscript?: (result: TranscriptResult) => void;
  onError?: (error: string) => void;
  minConfidence?: number; // Minimum confidence to accept final transcripts
  minStability?: number; // Minimum stability to show interim transcripts
  enabled?: boolean;
  isMicEnabled?: boolean; // Microphone enabled state - if false, won't send audio
  requireAuth?: boolean; // Whether authentication is required (default: true)
  suppressMicWarnings?: boolean;
}

export const useStreamingSTT = ({
  assessmentId,
  onTranscript,
  onError,
  minConfidence = 0.7,
  minStability = 0.8,
  enabled = true,
  isMicEnabled = true,
  requireAuth = true,
  suppressMicWarnings = false,
}: UseStreamingSTTProps) => {
  // Refs & state
  const wsRef = useRef<WebSocket | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recorderGenerationRef = useRef<number>(0); // Invalidate stale recorder events

  const isMicEnabledRef = useRef<boolean>(isMicEnabled);
  const isListeningRef = useRef<boolean>(false);
  const wasListeningBeforeMicOffRef = useRef<boolean>(false); // Track if we were listening before mic was turned off

  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const accumulatedTranscriptRef = useRef<string>('');

  const reconnectAttempts = useRef<number>(0);
  const maxReconnectAttempts = 3;
  const reconnectTimeout = useRef<number | null>(null);

  // Callback refs to avoid re-creating handlers
  const onTranscriptRef = useRef(onTranscript);
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  // Helper: get token (optional if requireAuth is false)
  const getAuthToken = useCallback(async (): Promise<string | null> => {
    if (!requireAuth) {
      // For public assessments, token is optional
      const tokenData = getToken();
      return tokenData?.accessToken || null;
    }
    // For authenticated assessments, token is required
    const tokenData = getToken();
    if (!tokenData || !tokenData.accessToken) {
      throw new Error('No authentication token found');
    }
    return tokenData.accessToken;
  }, [requireAuth]);

  // ------------------------
  // WebSocket helpers
  // ------------------------
  const sendWs = useCallback((payload: any) => {
    try {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(payload));
      }
    } catch (err) {
      logger.warn('Failed to send ws message', err);
    }
  }, []);

  const safeCloseWs = useCallback(() => {
    try {
      if (wsRef.current) {
        wsRef.current.close(1000, 'Normal closure');
        wsRef.current = null;
      }
    } catch (err) {
      logger.warn('Error closing websocket', err);
    }
    setIsConnected(false);
  }, []);

  // ------------------------
  // Media helpers
  // ------------------------
  const stopAllTracks = useCallback(() => {
    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getAudioTracks().forEach((t) => {
          try {
            t.enabled = false;
          } catch (_err) {
            // Track may already be stopped or disabled - safe to ignore
          }
          try {
            t.stop();
          } catch (_err) {
            // Track may already be stopped - safe to ignore
          }
          logger.debug('Stopped audio track', { id: t.id, label: t.label });
        });
      } catch (err) {
        logger.warn('Error stopping tracks', err);
      } finally {
        mediaStreamRef.current = null;
      }
    }
  }, []);

  const stopAndInvalidateRecorder = useCallback(() => {
    // Bump generation so any in-flight dataavailable handlers are ignored.
    recorderGenerationRef.current++;
    const recorder = mediaRecorderRef.current;
    if (recorder) {
      try {
        // If the browser is recording or paused, stop it.
        if (recorder.state === 'recording' || recorder.state === 'paused') {
          recorder.stop();
        }
      } catch (err) {
        logger.warn('Error stopping MediaRecorder', err);
      }
    }
    mediaRecorderRef.current = null;
  }, []);

  // Full local cleanup (recorder + tracks)
  const localCleanup = useCallback(() => {
    stopAndInvalidateRecorder();
    stopAllTracks();
  }, [stopAllTracks, stopAndInvalidateRecorder]);

  // ------------------------
  // Connect
  // ------------------------
  const connect = useCallback(async () => {
    if (!enabled) {
      logger.info('Streaming STT disabled - skipping connection');
      return;
    }

    // Check if WebSocket URL is configured
    if (!ENV.NEXT_PUBLIC_WS_URL) {
      const errorMsg = 'WebSocket URL not configured';
      logger.error(errorMsg, {
        hasEnvVar:
          typeof process !== 'undefined' && !!process.env.NEXT_PUBLIC_WS_URL,
        envValue: ENV.NEXT_PUBLIC_WS_URL,
      });
      onErrorRef.current?.(errorMsg);
      return;
    }

    try {
      const token = await getAuthToken();

      // Build WebSocket URL - token is optional for public assessments
      let wsUrl: string;
      if (token) {
        wsUrl = `${ENV.NEXT_PUBLIC_WS_URL}/api/voice/stream?token=${token}&assessmentId=${assessmentId}`;
      } else {
        // For public assessments without auth, only send assessmentId
        wsUrl = `${ENV.NEXT_PUBLIC_WS_URL}/api/voice/stream?assessmentId=${assessmentId}`;
      }

      const maskedWsUrl = wsUrl.replace(/token=[^&]+/, 'token=***');
      logger.info('Connecting to streaming STT WebSocket', {
        wsUrl: maskedWsUrl,
        hasToken: !!token,
        requireAuth,
        assessmentId,
      });

      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        logger.info('Streaming STT WebSocket connected');
        setIsConnected(true);
        reconnectAttempts.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          // If transcript arrives while mic is off or not listening, show warning and ignore.
          if (msg.type === 'transcript') {
            const result: TranscriptResult = msg.data;

            logger.info('📝 Transcript received from server', {
              isFinal: result.isFinal,
              confidence: result.confidence,
              stability: result.stability,
              text: result.transcript?.substring(0, 50),
              isMicEnabled: isMicEnabledRef.current,
              isListening: isListeningRef.current,
              minConfidence,
              minStability,
            });

            if (!isMicEnabledRef.current || !isListeningRef.current) {
              logger.warn(
                '⚠️ Transcript arrived while mic off / not listening; ignoring',
                {
                  isMicEnabled: isMicEnabledRef.current,
                  isListening: isListeningRef.current,
                  transcript: result.transcript?.substring(0, 50),
                }
              );
              // Only show warning if mic warnings are not suppressed and mic is actually disabled
              // (don't warn during normal question transitions where listening stops but mic is still enabled)
              if (!suppressMicWarnings && !isMicEnabledRef.current) {
                toast.warning('Turn ON the mic to answer', { duration: 2000 });
              }
              return;
            }

            // Apply confidence and stability rules
            if (result.isFinal && result.confidence >= minConfidence) {
              accumulatedTranscriptRef.current += ' ' + result.transcript;
              const finalTranscript = accumulatedTranscriptRef.current.trim();
              setTranscript(finalTranscript);
              logger.info('Final transcript accepted', {
                confidence: result.confidence,
                text: result.transcript,
              });
              onTranscriptRef.current?.({
                ...result,
                transcript: finalTranscript,
              });
            } else if (!result.isFinal) {
              // For interim results, be more lenient - show if stability is reasonable
              // This helps users see their voice is being analyzed
              const minInterimStability = Math.max(0.3, minStability * 0.5); // At least 30% or half of minStability
              if (result.stability >= minInterimStability) {
                const interim = (
                  accumulatedTranscriptRef.current +
                  ' ' +
                  result.transcript
                ).trim();
                setTranscript(interim);
                logger.info('✅ Interim transcript displayed', {
                  stability: result.stability,
                  minStability,
                  minInterimStability,
                  text: result.transcript,
                });
              } else {
                logger.debug('⏭️ Interim transcript filtered (low stability)', {
                  stability: result.stability,
                  minInterimStability,
                  text: result.transcript?.substring(0, 30),
                });
              }
            } else if (result.isFinal && result.confidence < minConfidence) {
              if (result.confidence >= 0.4) {
                accumulatedTranscriptRef.current += ' ' + result.transcript;
                const finalTranscript = accumulatedTranscriptRef.current.trim();
                setTranscript(finalTranscript);
                logger.warn('Low confidence transcript accepted with warning', {
                  confidence: result.confidence,
                  text: result.transcript,
                });
                onTranscriptRef.current?.({
                  ...result,
                  transcript: finalTranscript,
                });
              } else {
                // Very low confidence - only show toast if mic is still enabled & listening
                logger.warn('❌ Very low confidence transcript rejected', {
                  confidence: result.confidence,
                  minConfidence,
                  text: result.transcript,
                });
                // Double-check mic is still enabled before showing unclear speech toast
                if (isMicEnabledRef.current && isListeningRef.current) {
                  toast.warning(
                    'Speech unclear. Please speak louder and more clearly.',
                    { duration: 2000 }
                  );
                }
              }
            } else {
              // Transcript doesn't meet criteria - log why
              logger.debug('⏭️ Transcript filtered out', {
                isFinal: result.isFinal,
                confidence: result.confidence,
                minConfidence,
                stability: result.stability,
                minStability,
                text: result.transcript?.substring(0, 50),
                reason: result.isFinal
                  ? `confidence ${result.confidence} < ${minConfidence}`
                  : `stability ${result.stability} < ${minStability}`,
              });
            }
          } else if (msg.type === 'error') {
            logger.error('STT error from server:', {
              message: msg.message,
              sessionId: msg.sessionId,
            });
            // Don't show toast here - let onError callback handle user notification
            onErrorRef.current?.(msg.message || 'Speech recognition error');
          } else if (msg.type === 'ready') {
            logger.info('STT session ready', { sessionId: msg.sessionId });
          } else if (msg.type === 'connected') {
            logger.info('STT connected', { sessionId: msg.sessionId });
          }
        } catch (err) {
          logger.error('Error processing WebSocket message:', err);
        }
      };

      ws.onerror = (error) => {
        logger.error('WebSocket error', {
          error,
          readyState: ws.readyState,
          url: maskedWsUrl,
        });

        if (
          ws.readyState !== WebSocket.CLOSING &&
          ws.readyState !== WebSocket.CLOSED
        ) {
          onErrorRef.current?.('WebSocket connection error');
        }
      };

      ws.onclose = (event) => {
        logger.info('WebSocket closed', {
          code: event.code,
          reason: event.reason,
        });
        setIsConnected(false);
        setIsListening(false);
        isListeningRef.current = false;

        // Attempt reconnect for abnormal closures
        if (
          event.code !== 1000 &&
          event.code !== 1001 &&
          reconnectAttempts.current < maxReconnectAttempts
        ) {
          reconnectAttempts.current++;
          const delay = Math.min(
            1000 * Math.pow(2, reconnectAttempts.current),
            10000
          );
          logger.info('Attempting to reconnect', {
            attempt: reconnectAttempts.current,
            delay,
          });
          if (reconnectTimeout.current) {
            clearTimeout(reconnectTimeout.current);
          }
          reconnectTimeout.current = window.setTimeout(() => connect(), delay);
        } else if (reconnectAttempts.current >= maxReconnectAttempts) {
          logger.error('Max reconnection attempts reached', {
            attempts: reconnectAttempts.current,
            closeCode: event.code,
            reason: event.reason,
          });
          onErrorRef.current?.(
            'Failed to connect to speech recognition after multiple attempts'
          );
        }
      };

      wsRef.current = ws;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Connection failed';
      logger.error('Failed to connect to streaming STT:', {
        error: err,
        message: errorMessage,
        wsUrl: ENV.NEXT_PUBLIC_WS_URL
          ? `${ENV.NEXT_PUBLIC_WS_URL}/api/voice/stream?token=***&assessmentId=${assessmentId}`
          : 'not configured',
        assessmentId,
      });

      onErrorRef.current?.(errorMessage);
    }
  }, [assessmentId, enabled, getAuthToken, minConfidence, minStability]);

  // ------------------------
  // Start Listening
  // ------------------------
  const startListening = useCallback(
    async (hasUserSpoken?: boolean) => {
      logger.info('startListening called', {
        enabled,
        isMicEnabled: isMicEnabledRef.current,
        isConnected,
        hasUserSpoken,
      });

      if (!enabled) {
        logger.debug('Streaming STT disabled - startListening noop');
        return;
      }

      if (!isMicEnabledRef.current) {
        logger.warn('Cannot start listening - mic is disabled', {
          isMicEnabledRef: isMicEnabledRef.current,
        });
        if (!suppressMicWarnings) {
          toast.warning('Please turn on the mic to answer');
        }
        return;
      }

      if (!isConnected) {
        toast.error('Please wait for connection to establish');
        return;
      }

      // If already listening, do a clean restart
      if (isListeningRef.current) {
        logger.debug('Already listening - restarting');
        // immediate cleanup
        sendWs({ type: 'stop' });
        stopAndInvalidateRecorder();
        stopAllTracks();
        isListeningRef.current = false;
        setIsListening(false);
        // small delay to ensure resources freed (browsers sometimes need a tick)
        await new Promise((r) => setTimeout(r, 120));
      }

      try {
        // Tell server to start a speech stream (backend will open Google stream)
        sendWs({ type: 'start' });

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 48000,
            channelCount: 1,
          },
        });

        // If mic was toggled off during getUserMedia, stop and exit
        if (!isMicEnabledRef.current) {
          // immediate stop of tracks we just acquired
          stream.getAudioTracks().forEach((t) => {
            try {
              t.stop();
            } catch (_err) {
              // Track may already be stopped - safe to ignore
            }
          });
          if (!suppressMicWarnings) {
            toast.warning('Turn ON the mic to answer');
          }
          return;
        }

        mediaStreamRef.current = stream;

        // Monitor audio tracks for unexpected endings
        stream.getAudioTracks().forEach((track) => {
          track.onended = () => {
            logger.warn('Audio track ended unexpectedly', {
              trackId: track.id,
              trackLabel: track.label,
              readyState: track.readyState,
              enabled: track.enabled,
              muted: track.muted,
              generation,
              isListening: isListeningRef.current,
            });
            // If we're still supposed to be listening, this is unexpected
            if (
              isListeningRef.current &&
              generation === recorderGenerationRef.current
            ) {
              isListeningRef.current = false;
              setIsListening(false);
              toast.warning(
                'Microphone access lost. Please check permissions.'
              );
              onErrorRef.current?.('Audio track ended unexpectedly');
            }
          };
        });

        // Create recorder and capture current generation
        const generation = (recorderGenerationRef.current += 1);
        const recorder = new MediaRecorder(stream, {
          mimeType: 'audio/webm;codecs=opus',
        });

        recorder.ondataavailable = (ev: BlobEvent) => {
          // ignore stale recorder events
          if (generation !== recorderGenerationRef.current) {
            logger.debug(
              'Ignoring stale dataavailable event (generation mismatch)'
            );
            return;
          }
          // Basic checks: listening, mic enabled, ws open, non-empty blob
          if (
            ev.data.size > 0 &&
            isListeningRef.current &&
            isMicEnabledRef.current &&
            wsRef.current?.readyState === WebSocket.OPEN
          ) {
            try {
              wsRef.current.send(ev.data);
              // Log periodically to confirm audio is being sent
              if (Math.random() < 0.01) {
                // Log ~1% of chunks to avoid spam
                logger.debug('🎤 Audio chunk sent', {
                  size: ev.data.size,
                  wsState: wsRef.current.readyState,
                });
              }
            } catch (err) {
              logger.warn('Error sending audio chunk', err);
            }
          } else {
            logger.debug('Skipped sending audio chunk', {
              size: ev.data.size,
              isListening: isListeningRef.current,
              isMicEnabled: isMicEnabledRef.current,
              wsState: wsRef.current?.readyState,
              trackState:
                mediaStreamRef.current?.getAudioTracks()[0]?.readyState,
              trackEnabled:
                mediaStreamRef.current?.getAudioTracks()[0]?.enabled,
            });
          }
        };

        recorder.onstop = () => {
          // Check if this is an unexpected stop (not from our cleanup)
          if (
            generation === recorderGenerationRef.current &&
            isListeningRef.current
          ) {
            logger.warn('MediaRecorder stopped unexpectedly', {
              generation,
              currentGeneration: recorderGenerationRef.current,
              isListening: isListeningRef.current,
              micEnabled: isMicEnabledRef.current,
              wsState: wsRef.current?.readyState,
            });
            // Reset listening state if recorder stopped unexpectedly
            isListeningRef.current = false;
            setIsListening(false);
            toast.warning('Recording stopped unexpectedly. Please try again.');
          } else {
            logger.debug('MediaRecorder stopped (expected)', {
              generation,
              currentGeneration: recorderGenerationRef.current,
            });
          }
        };

        recorder.onerror = (event: Event) => {
          logger.error('MediaRecorder error', {
            error: event,
            generation,
            isListening: isListeningRef.current,
          });
          // Stop listening on error
          if (generation === recorderGenerationRef.current) {
            isListeningRef.current = false;
            setIsListening(false);
            toast.error('Recording error occurred. Please try again.');
            onErrorRef.current?.('MediaRecorder error');
          }
        };

        // Start recorder (250ms slices as before)
        recorder.start(250);
        mediaRecorderRef.current = recorder;

        isListeningRef.current = true;
        setIsListening(true);

        logger.info('Started listening with streaming STT', {
          micEnabled: isMicEnabledRef.current,
          tracks: stream
            .getAudioTracks()
            .map((t) => ({ id: t.id, label: t.label })),
        });
      } catch (err) {
        logger.error('Failed to start listening:', err);
        toast.error('Microphone access denied. Please enable permissions.');
        onErrorRef.current?.(
          err instanceof Error ? err.message : 'Microphone access denied'
        );
      }
    },
    [enabled, isConnected, sendWs, stopAllTracks, stopAndInvalidateRecorder]
  );

  // ------------------------
  // Stop Listening (public)
  // ------------------------
  const stopListening = useCallback(() => {
    // immediate synchronous state changes to avoid race
    setIsListening(false);
    isListeningRef.current = false;

    // send stop to server right away
    sendWs({ type: 'stop' });

    // stop recorder and tracks instantly
    stopAndInvalidateRecorder();
    stopAllTracks();

    logger.info('Stopped listening');
  }, [sendWs, stopAllTracks, stopAndInvalidateRecorder]);

  // ------------------------
  // Mic toggle effect -> instant stop behavior
  // ------------------------
  useEffect(() => {
    const prev = isMicEnabledRef.current;
    isMicEnabledRef.current = isMicEnabled;

    // Mic turned OFF
    if (!isMicEnabled && prev !== isMicEnabled) {
      logger.info('Microphone disabled - performing instant cutoff');

      // Store if we were listening before turning mic off
      wasListeningBeforeMicOffRef.current = isListeningRef.current;

      // immediate stop on UI and internal refs
      setIsListening(false);
      isListeningRef.current = false;

      // Stop sending to backend and cleanup local capture
      try {
        sendWs({ type: 'stop' });
      } catch (err) {
        logger.warn('Error sending stop on mic off', err);
      }

      // Hard-stop tracks and recorder (stop() + generation bump)
      stopAndInvalidateRecorder();
      stopAllTracks();

      // Only show warning if mic warnings are not suppressed
      if (!suppressMicWarnings) {
        toast.warning('Turn ON the mic to answer');
      }
      return;
    }

    // Mic turned ON: restart listening if we were listening before OR if no stream exists
    if (isMicEnabled && prev !== isMicEnabled) {
      logger.info(
        'Microphone enabled - checking if we should restart listening',
        {
          wasListening: wasListeningBeforeMicOffRef.current,
          isConnected,
          hasStream: !!mediaStreamRef.current,
          enabled,
        }
      );

      // If we were listening before mic was turned off, always restart listening
      // OR if there's no stream (tracks were stopped), restart to get a new stream
      // This is necessary because stopped tracks cannot be re-enabled - we need a new stream
      const shouldRestart =
        (wasListeningBeforeMicOffRef.current || !mediaStreamRef.current) &&
        isConnected &&
        enabled;

      if (shouldRestart) {
        logger.info('Restarting listening after mic was turned back on', {
          hasTranscript: transcript.length > 0,
          reason: wasListeningBeforeMicOffRef.current
            ? 'was listening before'
            : 'no stream available',
        });
        // Small delay to ensure mic is fully enabled and state has propagated
        setTimeout(() => {
          // Pass true if there's already a transcript (user had spoken before)
          startListening(transcript.length > 0).catch((err) => {
            logger.error(
              'Failed to restart listening after mic turned on:',
              err
            );
            toast.error('Failed to restart audio capture. Please try again.');
          });
        }, 200);
      } else {
        // Try to re-enable tracks if stream exists and tracks are not stopped
        // Note: Once tracks are stopped, they cannot be re-enabled - need new stream
        logger.info(
          'Microphone enabled - checking if tracks can be re-enabled'
        );
        if (mediaStreamRef.current) {
          const tracks = mediaStreamRef.current.getAudioTracks();
          const activeTracks = tracks.filter((t) => t.readyState === 'live');

          if (activeTracks.length > 0) {
            try {
              activeTracks.forEach((t) => {
                try {
                  t.enabled = true;
                  logger.debug('Re-enabled audio track', { id: t.id });
                } catch (_err) {
                  logger.warn('Failed to re-enable track', { id: t.id });
                }
              });
            } catch (err) {
              logger.warn('Error re-enabling tracks', err);
            }
          } else {
            logger.info(
              'No active tracks found - stream may have been stopped. Need to restart listening to get new stream.'
            );
            // If no active tracks but we're connected and enabled, try to restart
            if (isConnected && enabled) {
              logger.info(
                'Attempting to restart listening due to no active tracks'
              );
              setTimeout(() => {
                startListening(transcript.length > 0).catch((err) => {
                  logger.error(
                    'Failed to restart listening after mic turned on:',
                    err
                  );
                });
              }, 200);
            }
          }
        } else {
          logger.info(
            'No stream available - tracks were stopped when mic was turned off'
          );
          // If no stream but we're connected and enabled, try to restart
          if (isConnected && enabled) {
            logger.info(
              'Attempting to restart listening due to no stream available'
            );
            setTimeout(() => {
              startListening(transcript.length > 0).catch((err) => {
                logger.error(
                  'Failed to restart listening after mic turned on:',
                  err
                );
              });
            }, 200);
          }
        }
      }
      // Reset the flag
      wasListeningBeforeMicOffRef.current = false;
    }
  }, [
    isMicEnabled,
    sendWs,
    stopAllTracks,
    stopAndInvalidateRecorder,
    startListening,
    isConnected,
    enabled,
    transcript,
  ]);

  // ------------------------
  // Reset transcript
  // ------------------------
  const resetTranscript = useCallback(() => {
    accumulatedTranscriptRef.current = '';
    setTranscript('');
    logger.debug('Transcript reset');
  }, []);

  // ------------------------
  // Disconnect
  // ------------------------
  const disconnect = useCallback(() => {
    // clear reconnect timer
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = null;
    }
    // stop everything
    try {
      sendWs({ type: 'stop' });
    } catch (_err) {
      // Connection may already be closed - safe to ignore
    }
    localCleanup();
    safeCloseWs();
    setIsConnected(false);
    setIsListening(false);
    isListeningRef.current = false;
    logger.info('Disconnected from streaming STT');
  }, [localCleanup, safeCloseWs, sendWs]);

  // ------------------------
  // Initialize / cleanup on mount/unmount or enabled change
  // ------------------------
  useEffect(() => {
    if (!enabled) {
      disconnect();
      return;
    }
    connect();
    return () => {
      disconnect();
    };
    // intentionally include connect/disconnect to keep stable; they are memoized
  }, [connect, disconnect, enabled]);

  // Expose API
  return {
    isConnected,
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    reconnect: connect,
  };
};

'use client';

import { useState, useCallback, useRef } from 'react';
import { TranscriptEntry } from '@/components/interview/Transcript';
import { logger } from '@/lib/logger';

export interface UseTranscriptOptions {
  onTranscriptUpdate?: (entries: TranscriptEntry[]) => void;
  autoSave?: boolean;
  maxEntries?: number;
}

export function useTranscript(options: UseTranscriptOptions = {}) {
  const { maxEntries = 1000 } = options;

  const [entries, setEntries] = useState<TranscriptEntry[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isListeningRef = useRef(false);

  // Initialize speech recognition
  const initializeSpeechRecognition = useCallback(() => {
    if (
      typeof window === 'undefined' ||
      (!('webkitSpeechRecognition' in window) &&
        !('SpeechRecognition' in window))
    ) {
      logger.warn('Speech recognition not supported in this browser');
      return false;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      logger.info('Speech recognition started');
      setIsRecording(true);
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        addEntry('candidate', finalTranscript, true);
      } else if (interimTranscript) {
        // Update current speaking text
        logger.debug('Interim transcript:', interimTranscript);
      }
    };

    recognition.onerror = (event) => {
      logger.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        logger.error('Microphone permission denied');
      }
    };

    recognition.onend = () => {
      logger.info('Speech recognition ended');
      setIsRecording(false);
      isListeningRef.current = false;
    };

    recognitionRef.current = recognition;
    return true;
  }, []);

  // Add transcript entry
  const addEntry = useCallback(
    (speaker: 'candidate' | 'agent', text: string, isFinal: boolean = true) => {
      const entry: TranscriptEntry = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        speaker,
        text: text.trim(),
        isFinal,
      };

      setEntries((prev) => {
        const newEntries = [...prev, entry];

        // Limit entries to maxEntries
        if (newEntries.length > maxEntries) {
          return newEntries.slice(-maxEntries);
        }

        return newEntries;
      });

      logger.info('Transcript entry added:', {
        speaker,
        text: text.substring(0, 50) + '...',
      });
    },
    [maxEntries]
  );

  // Start listening
  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      if (!initializeSpeechRecognition()) {
        return false;
      }
    }

    if (isListeningRef.current) {
      return true;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        isListeningRef.current = true;
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Failed to start speech recognition:', error);
      return false;
    }
  }, [initializeSpeechRecognition]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListeningRef.current) {
      recognitionRef.current.stop();
      isListeningRef.current = false;
    }
  }, []);

  // Clear transcript
  const clearTranscript = useCallback(() => {
    setEntries([]);
    logger.info('Transcript cleared');
  }, []);

  // Get transcript as text
  const getTranscriptText = useCallback(() => {
    return entries
      .map(
        (entry) =>
          `[${entry.timestamp.toLocaleTimeString()}] ${entry.speaker.toUpperCase()}: ${entry.text}`
      )
      .join('\n');
  }, [entries]);

  // Export transcript
  const exportTranscript = useCallback(
    (format: 'text' | 'json' = 'text') => {
      if (format === 'json') {
        return JSON.stringify(entries, null, 2);
      }
      return getTranscriptText();
    },
    [entries, getTranscriptText]
  );

  return {
    entries,
    isRecording,
    addEntry,
    startListening,
    stopListening,
    clearTranscript,
    getTranscriptText,
    exportTranscript,
  };
}

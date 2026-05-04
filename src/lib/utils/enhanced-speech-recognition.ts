/**
 * Enhanced Speech Recognition Service
 * Provides robust speech recognition with device-specific optimizations and error recovery
 */

import { logger } from '@/lib/logger';
import { toast } from 'sonner';
import {
  getDeviceCapabilities,
  type DeviceCapabilities,
} from './device-capability';

// Type definitions for Speech Recognition API
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

export interface RecognitionOptions {
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
  language?: string;
  grammars?: string[];
  timeout?: number;
  noSpeechTimeout?: number;
  autoRestart?: boolean;
}

export interface RecognitionState {
  isListening: boolean;
  isActive: boolean;
  transcript: string;
  interimTranscript: string;
  confidence: number;
  lastError: string | null;
  restartCount: number;
  quality: 'good' | 'poor' | 'very-poor';
}

export interface RecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
  alternatives: Array<{
    transcript: string;
    confidence: number;
  }>;
}

export class EnhancedSpeechRecognition {
  private recognition: any = null;
  private capabilities: DeviceCapabilities | null = null;
  private options: RecognitionOptions = {};
  private state: RecognitionState = {
    isListening: false,
    isActive: false,
    transcript: '',
    interimTranscript: '',
    confidence: 0,
    lastError: null,
    restartCount: 0,
    quality: 'good',
  };
  private stateCallbacks: Set<(state: RecognitionState) => void> = new Set();
  private resultCallbacks: Set<(result: RecognitionResult) => void> = new Set();
  private accumulatedTranscript: string = '';
  private lastRestartTime: number = 0;
  private restartTimeouts: Set<NodeJS.Timeout> = new Set();
  private noSpeechTimeout: NodeJS.Timeout | null = null;
  private isInitialized = false;

  async initialize(options: RecognitionOptions = {}): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Detect device capabilities
      this.capabilities = await getDeviceCapabilities();

      if (!this.capabilities.speechRecognition.supported) {
        throw new Error('Speech recognition is not supported on this device');
      }

      // Merge options with defaults
      this.options = {
        continuous: true,
        interimResults: true,
        maxAlternatives: 3,
        language: 'en-US',
        timeout: 30000,
        noSpeechTimeout: 10000,
        autoRestart: true,
        ...options,
      };

      // Adjust options based on device capabilities
      this.optimizeForDevice();

      // Initialize recognition
      await this.createRecognition();

      // Log configuration for debugging
      if (process.env.NODE_ENV === 'development') {
        this.logConfiguration();
      }

      this.isInitialized = true;
      logger.info('Enhanced speech recognition initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize enhanced speech recognition:', error);
      this.state.lastError =
        error instanceof Error ? error.message : 'Initialization failed';
      this.notifyStateChange();
      throw error;
    }
  }

  private optimizeForDevice(): void {
    if (!this.capabilities) return;

    const { browser, network, speechRecognition } = this.capabilities;

    // Adjust for mobile devices
    if (browser.isMobile) {
      this.options.timeout = 45000; // Longer timeout for mobile
      this.options.noSpeechTimeout = 15000; // More patient with mobile mics

      if (browser.isIOS) {
        // iOS specific optimizations
        this.options.continuous = false; // iOS has issues with continuous mode
        this.options.autoRestart = true; // Compensate with auto-restart
      }
    }

    // Adjust for network conditions
    if (network.effectiveType === 'slow-2g' || network.downlink < 0.5) {
      this.options.timeout = 60000;
      this.options.noSpeechTimeout = 20000;
    }

    // Adjust for speech recognition quality
    if (speechRecognition.quality === 'low') {
      this.options.maxAlternatives = 1; // Reduce processing
      this.options.noSpeechTimeout = 15000; // Be more patient
    } else if (speechRecognition.quality === 'high') {
      this.options.maxAlternatives = 5; // Use more alternatives
    }

    // Adjust based on browser
    if (browser.name === 'Firefox') {
      this.options.continuous = false; // Firefox has limited support
      this.options.autoRestart = true;
    }
  }

  private async createRecognition(): Promise<void> {
    // Try to get speech recognition constructor with proper type handling
    let SpeechRecognitionConstructor: any = null;

    if (typeof window !== 'undefined') {
      SpeechRecognitionConstructor =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition ||
        (window as any).mozSpeechRecognition ||
        (window as any).msSpeechRecognition;
    }

    if (!SpeechRecognitionConstructor) {
      throw new Error('Speech recognition not available in this browser');
    }

    try {
      this.recognition = new SpeechRecognitionConstructor();
      this.configureRecognition();
      this.setupEventHandlers();
    } catch (error) {
      throw new Error(`Failed to create speech recognition instance: ${error}`);
    }
  }

  private configureRecognition(): void {
    if (!this.recognition) return;

    this.recognition.continuous = this.options.continuous || false;
    this.recognition.interimResults = this.options.interimResults || false;
    this.recognition.maxAlternatives = this.options.maxAlternatives || 1;
    this.recognition.lang = this.options.language || 'en-US';

    // Set grammar if provided (experimental)
    if (this.options.grammars && this.recognition.grammars !== undefined) {
      try {
        const SpeechGrammarList = (window as any).SpeechGrammarList;
        if (SpeechGrammarList) {
          const grammarList = new SpeechGrammarList();
          this.options.grammars.forEach((grammar) => {
            grammarList.addFromString(grammar, 1);
          });
          this.recognition.grammars = grammarList;
        }
      } catch (error) {
        logger.warn('Failed to set speech grammar:', error);
      }
    }
  }

  private setupEventHandlers(): void {
    if (!this.recognition) return;

    this.recognition.onstart = () => {
      this.state.isActive = true;
      this.state.lastError = null;
      this.assessAudioQuality();
      this.startNoSpeechTimer();
      this.notifyStateChange();
      logger.debug('Speech recognition started');
    };

    this.recognition.onresult = (event: Event) => {
      this.clearNoSpeechTimer();
      this.processResults(event as SpeechRecognitionEvent);
      this.startNoSpeechTimer(); // Restart timer after getting results
    };

    this.recognition.onerror = (event: Event) => {
      this.clearNoSpeechTimer();
      this.handleError(event as SpeechRecognitionErrorEvent);
    };

    this.recognition.onend = () => {
      this.clearNoSpeechTimer();
      this.handleEnd();
    };

    this.recognition.onnomatch = () => {
      logger.debug('No speech recognition match');
      this.state.quality = 'poor';
      this.notifyStateChange();
    };

    this.recognition.onspeechstart = () => {
      this.clearNoSpeechTimer();
      logger.debug('Speech detected');
      this.state.quality = 'good';
      this.notifyStateChange();
    };

    this.recognition.onspeechend = () => {
      logger.debug('Speech ended');
    };

    this.recognition.onaudiostart = () => {
      logger.debug('Audio capture started');
    };

    this.recognition.onaudioend = () => {
      logger.debug('Audio capture ended');
    };
  }

  private processResults(event: SpeechRecognitionEvent): void {
    let interimTranscript = '';
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      const transcript = result[0].transcript;

      if (result.isFinal) {
        finalTranscript += transcript;
        this.accumulatedTranscript += ' ' + transcript;
      } else {
        interimTranscript += transcript;
      }

      // Notify result callbacks
      const recognitionResult: RecognitionResult = {
        transcript,
        confidence: result[0].confidence || 0.5,
        isFinal: result.isFinal,
        alternatives: Array.from(result).map((alt) => ({
          transcript: alt.transcript,
          confidence: alt.confidence || 0.5,
        })),
      };

      this.notifyResultCallbacks(recognitionResult);
    }

    // Update state
    if (finalTranscript) {
      this.state.transcript = this.accumulatedTranscript.trim();
      this.state.confidence =
        event.results[event.results.length - 1][0].confidence || 0.5;
    }

    this.state.interimTranscript = (
      this.accumulatedTranscript +
      ' ' +
      interimTranscript
    ).trim();
    this.notifyStateChange();
  }

  private handleError(event: SpeechRecognitionErrorEvent): void {
    this.state.isActive = false;
    this.state.lastError = event.error;

    logger.debug('Speech recognition error:', event.error);

    // Handle different error types
    switch (event.error) {
      case 'no-speech':
        logger.debug('No speech detected, this is normal');
        if (this.options.autoRestart && this.state.isListening) {
          this.scheduleRestart('No speech detected', 1000);
        }
        break;

      case 'audio-capture':
        logger.warn('Audio capture failed, attempting restart');
        if (this.options.autoRestart && this.state.isListening) {
          this.scheduleRestart('Audio capture failed', 2000);
        } else {
          toast.error(
            'Microphone access failed. Please check your microphone permissions.'
          );
        }
        break;

      case 'not-allowed':
        logger.error('Microphone permission denied');
        this.state.isListening = false;
        toast.error(
          'Microphone access denied. Please enable microphone permissions to continue.'
        );
        break;

      case 'network':
        logger.error('Network error in speech recognition');
        if (this.options.autoRestart && this.state.isListening) {
          this.scheduleRestart('Network error', 3000);
        } else {
          toast.error(
            'Network error. Please check your connection and try again.'
          );
        }
        break;

      case 'service-not-allowed':
        logger.error('Speech recognition service not allowed');
        this.state.isListening = false;
        toast.error('Speech recognition service is not available.');
        break;

      case 'bad-grammar':
        logger.error('Bad grammar in speech recognition');
        // Continue without grammar
        if (this.recognition) {
          this.recognition.grammars = null;
          this.scheduleRestart('Bad grammar, retrying without', 1000);
        }
        break;

      default:
        logger.error('Unknown speech recognition error:', event.error);
        if (this.options.autoRestart && this.state.isListening) {
          this.scheduleRestart(`Unknown error: ${event.error}`, 2000);
        } else {
          this.state.isListening = false;
        }
        break;
    }

    this.notifyStateChange();
  }

  private handleEnd(): void {
    this.state.isActive = false;
    logger.debug('Speech recognition ended');

    // Auto-restart if still supposed to be listening
    if (this.state.isListening && this.options.autoRestart) {
      this.scheduleRestart('Normal end, restarting', 500);
    }

    this.notifyStateChange();
  }

  private scheduleRestart(reason: string, delay: number): void {
    const now = Date.now();
    const timeSinceLastRestart = now - this.lastRestartTime;
    const minRestartInterval = 2000; // Minimum 2 seconds between restarts

    if (timeSinceLastRestart < minRestartInterval) {
      logger.debug(
        `Debouncing recognition restart: ${reason} (${timeSinceLastRestart}ms since last restart)`
      );
      return;
    }

    if (this.state.restartCount >= 10) {
      logger.error('Too many recognition restart attempts, stopping');
      this.state.isListening = false;
      this.state.lastError = 'Too many restart attempts';
      this.notifyStateChange();
      toast.error(
        'Speech recognition failed multiple times. Please refresh and try again.'
      );
      return;
    }

    logger.debug(
      `Scheduling recognition restart: ${reason} (delay: ${delay}ms)`
    );

    const timeout = setTimeout(() => {
      this.restartTimeouts.delete(timeout);

      if (this.state.isListening && !this.state.isActive) {
        try {
          this.lastRestartTime = Date.now();
          this.state.restartCount++;
          this.recognition?.start();
          logger.debug(
            `Recognition restarted (attempt ${this.state.restartCount}): ${reason}`
          );
        } catch (error) {
          logger.error('Failed to restart recognition:', error);
          this.state.lastError = 'Restart failed';
          this.notifyStateChange();
        }
      }
    }, delay);

    this.restartTimeouts.add(timeout);
  }

  private startNoSpeechTimer(): void {
    this.clearNoSpeechTimer();

    if (!this.options.noSpeechTimeout) return;

    this.noSpeechTimeout = setTimeout(() => {
      if (this.state.isActive && this.state.transcript.length === 0) {
        logger.debug('No speech timeout reached');
        this.state.quality = 'very-poor';
        this.notifyStateChange();

        if (this.options.autoRestart) {
          this.stop();
          setTimeout(() => this.start(), 1000);
        }
      }
    }, this.options.noSpeechTimeout);
  }

  private clearNoSpeechTimer(): void {
    if (this.noSpeechTimeout) {
      clearTimeout(this.noSpeechTimeout);
      this.noSpeechTimeout = null;
    }
  }

  private assessAudioQuality(): void {
    // Simple heuristic for audio quality assessment
    setTimeout(() => {
      if (this.state.isActive && this.state.transcript.length === 0) {
        this.state.quality = 'poor';
        this.notifyStateChange();
      }
    }, 3000);
  }

  async start(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.recognition) {
      throw new Error('Speech recognition not available');
    }

    if (this.state.isListening) {
      logger.debug('Speech recognition already started');
      return;
    }

    try {
      this.state.isListening = true;
      this.state.restartCount = 0;
      this.state.lastError = null;
      this.accumulatedTranscript = '';
      this.state.transcript = '';
      this.state.interimTranscript = '';
      this.notifyStateChange();

      this.recognition.start();
      logger.info('Speech recognition started');
    } catch (error) {
      this.state.isListening = false;
      this.state.lastError =
        error instanceof Error ? error.message : 'Failed to start';
      this.notifyStateChange();
      logger.error('Failed to start speech recognition:', error);
      throw error;
    }
  }

  stop(): void {
    this.state.isListening = false;
    this.state.isActive = false;
    this.clearNoSpeechTimer();

    // Clear all restart timeouts
    this.restartTimeouts.forEach((timeout) => clearTimeout(timeout));
    this.restartTimeouts.clear();

    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (error) {
        logger.warn('Error stopping speech recognition:', error);
      }
    }

    this.notifyStateChange();
    logger.info('Speech recognition stopped');
  }

  reset(): void {
    this.accumulatedTranscript = '';
    this.state.transcript = '';
    this.state.interimTranscript = '';
    this.state.confidence = 0;
    this.state.restartCount = 0;
    this.state.lastError = null;
    this.state.quality = 'good';
    this.notifyStateChange();
  }

  getState(): RecognitionState {
    return { ...this.state };
  }

  onStateChange(callback: (state: RecognitionState) => void): () => void {
    this.stateCallbacks.add(callback);
    return () => this.stateCallbacks.delete(callback);
  }

  onResult(callback: (result: RecognitionResult) => void): () => void {
    this.resultCallbacks.add(callback);
    return () => this.resultCallbacks.delete(callback);
  }

  private notifyStateChange(): void {
    this.stateCallbacks.forEach((callback) => {
      try {
        callback(this.getState());
      } catch (error) {
        logger.error('Error in recognition state callback:', error);
      }
    });
  }

  private notifyResultCallbacks(result: RecognitionResult): void {
    this.resultCallbacks.forEach((callback) => {
      try {
        callback(result);
      } catch (error) {
        logger.error('Error in recognition result callback:', error);
      }
    });
  }

  private logConfiguration(): void {
    if (!this.capabilities) return;

    logger.info('🎤 Enhanced Speech Recognition Configuration');
    logger.info('🔄 Continuous:', this.options.continuous);
    logger.info('📝 Interim Results:', this.options.interimResults);
    logger.info('🔤 Max Alternatives:', this.options.maxAlternatives);
    logger.info('🌐 Language:', this.options.language);
    logger.info('⏱️ Timeout:', `${this.options.timeout! / 1000}s`);
    logger.info(
      '🔇 No Speech Timeout:',
      `${this.options.noSpeechTimeout! / 1000}s`
    );
    logger.info(
      '📱 Device:',
      `${this.capabilities.browser.name} ${this.capabilities.browser.version}`
    );
    logger.info('🎤 Quality:', this.capabilities.speechRecognition.quality);
  }

  dispose(): void {
    this.stop();
    this.stateCallbacks.clear();
    this.resultCallbacks.clear();
    this.recognition = null;
    this.isInitialized = false;
  }
}

// Global instance
export const enhancedSpeechRecognition = new EnhancedSpeechRecognition();

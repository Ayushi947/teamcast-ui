/**
 * Enhanced Speech Synthesis Service
 * Provides robust speech synthesis with device-specific optimizations and fallbacks
 */

import { logger } from '@/lib/logger';
import { voiceService } from '@/lib/services/services';
import { IVoiceSynthesizeRequest } from '@/lib/shared';
import {
  getDeviceCapabilities,
  type DeviceCapabilities,
  type VoiceConfig,
} from './device-capability';

// Type declarations for Speech Synthesis API
declare global {
  interface Window {
    AudioContext: any;
    webkitAudioContext: any;
  }
}

export interface SpeechOptions {
  text: string;
  force?: boolean;
  priority?: 'high' | 'medium' | 'low';
  fallbackToWebSpeech?: boolean;
  retryAttempts?: number;
}

export interface SpeechState {
  isSpeaking: boolean;
  currentText: string;
  queue: SpeechOptions[];
  lastError: string | null;
  synthesisMethod: 'cloud' | 'webspeech' | 'none';
}

export class EnhancedSpeechSynthesis {
  private audioRef: HTMLAudioElement | null = null;
  private audioContextRef: AudioContext | null = null;
  private capabilities: DeviceCapabilities | null = null;
  private voiceConfig: VoiceConfig | null = null;
  private speechState: SpeechState = {
    isSpeaking: false,
    currentText: '',
    queue: [],
    lastError: null,
    synthesisMethod: 'none',
  };
  private stateCallbacks: Set<(state: SpeechState) => void> = new Set();
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Detect device capabilities
      this.capabilities = await getDeviceCapabilities();
      this.voiceConfig = this.getOptimalConfig();

      // Initialize audio elements
      await this.initializeAudio();

      // Log capabilities for debugging
      if (process.env.NODE_ENV === 'development') {
        this.logConfiguration();
      }

      this.isInitialized = true;
      logger.info('Enhanced speech synthesis initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize enhanced speech synthesis:', error);
      this.speechState.lastError =
        error instanceof Error ? error.message : 'Initialization failed';
      this.notifyStateChange();
    }
  }

  private async initializeAudio(): Promise<void> {
    try {
      // Create audio element
      this.audioRef = new Audio();
      this.audioRef.crossOrigin = 'anonymous';

      // Create audio context if supported
      if (this.capabilities?.audioContext.supported) {
        const AudioContextClass =
          window.AudioContext || (window as any).webkitAudioContext;
        this.audioContextRef = new AudioContextClass();
      }

      // Set up event handlers
      this.setupAudioEventHandlers();
    } catch (error) {
      logger.error('Failed to initialize audio:', error);
      throw error;
    }
  }

  private setupAudioEventHandlers(): void {
    if (!this.audioRef) return;

    const handleEnded = () => this.onSpeechEnded();
    const handleError = (event: Event) => this.onSpeechError(event);
    const handleLoadStart = () => logger.debug('Audio loading started');
    const handleCanPlay = () => logger.debug('Audio can start playing');

    this.audioRef.addEventListener('ended', handleEnded);
    this.audioRef.addEventListener('error', handleError);
    this.audioRef.addEventListener('loadstart', handleLoadStart);
    this.audioRef.addEventListener('canplay', handleCanPlay);

    // Store handlers for cleanup
    (this.audioRef as any)._boundHandlers = {
      ended: handleEnded,
      error: handleError,
      loadstart: handleLoadStart,
      canplay: handleCanPlay,
    };
  }

  private getOptimalConfig(): VoiceConfig {
    if (!this.capabilities) {
      // Fallback configuration
      return {
        primary: 'en-US-Standard-A',
        fallbacks: [],
        webSpeechFallbacks: [],
        languageCode: 'en-US',
        timeout: 30000,
      };
    }

    const config: VoiceConfig = {
      primary: 'en-US-Chirp3-HD-Aoede',
      fallbacks: ['en-US-Standard-A', 'en-US-Wavenet-A'],
      webSpeechFallbacks: [],
      languageCode: 'en-US',
      timeout: 30000,
    };

    // Optimize based on device capabilities
    const { browser, network, speechSynthesis } = this.capabilities;

    // Adjust for mobile devices
    if (browser.isMobile) {
      config.timeout = 45000; // Longer timeout for mobile

      if (browser.isIOS) {
        // iOS specific optimizations
        config.primary = 'en-US-Standard-A';
        config.fallbacks = ['en-US-Wavenet-A'];
      } else if (browser.isAndroid) {
        // Android specific optimizations
        config.primary = 'en-US-Standard-A';
        config.fallbacks = ['en-US-Wavenet-A'];
      }
    }

    // Adjust for network conditions
    if (network.effectiveType === 'slow-2g' || network.downlink < 0.5) {
      config.timeout = 60000;
      config.primary = 'en-US-Standard-A'; // Use lighter model
      config.fallbacks = [];
    } else if (network.effectiveType === '2g' || network.downlink < 1) {
      config.timeout = 45000;
      config.primary = 'en-US-Standard-A';
      config.fallbacks = ['en-US-Wavenet-A'];
    }

    // Add web speech fallbacks
    if (speechSynthesis.supported && speechSynthesis.voices.length > 0) {
      config.webSpeechFallbacks = speechSynthesis.voices
        .filter((voice) => voice.lang.startsWith('en-'))
        .slice(0, 3);
    }

    return config;
  }

  async speak(options: SpeechOptions): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Handle force option
    if (options.force && this.speechState.isSpeaking) {
      this.stop();
    }

    // Add to queue if currently speaking
    if (this.speechState.isSpeaking && !options.force) {
      this.speechState.queue.push(options);
      this.notifyStateChange();
      return;
    }

    await this.processSpeech(options);
  }

  private async processSpeech(options: SpeechOptions): Promise<void> {
    this.speechState.isSpeaking = true;
    this.speechState.currentText = options.text;
    this.speechState.lastError = null;
    this.notifyStateChange();

    const maxRetries = options.retryAttempts || 3;
    let attempts = 0;

    while (attempts < maxRetries) {
      try {
        // Try cloud synthesis first
        if (await this.tryCloudSynthesis(options)) {
          this.speechState.synthesisMethod = 'cloud';
          return;
        }

        // Fallback to web speech if enabled
        if (
          options.fallbackToWebSpeech !== false &&
          this.capabilities?.speechSynthesis.supported
        ) {
          if (await this.tryWebSpeechSynthesis(options)) {
            this.speechState.synthesisMethod = 'webspeech';
            return;
          }
        }

        attempts++;
        logger.warn(`Speech synthesis attempt ${attempts} failed`);

        if (attempts < maxRetries) {
          // Wait before retry with exponential backoff
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, attempts) * 1000)
          );
        }
      } catch (error) {
        attempts++;
        logger.error(`Speech synthesis error (attempt ${attempts}):`, error);
        this.speechState.lastError =
          error instanceof Error ? error.message : 'Speech synthesis failed';

        if (attempts >= maxRetries) {
          break;
        }
      }
    }

    // All attempts failed
    this.speechState.synthesisMethod = 'none';
    this.speechState.lastError = 'All speech synthesis methods failed';
    this.onSpeechEnded();
  }

  private async tryCloudSynthesis(options: SpeechOptions): Promise<boolean> {
    if (!this.voiceConfig || !this.audioRef) {
      return false;
    }

    const voices = [this.voiceConfig.primary, ...this.voiceConfig.fallbacks];

    for (const voice of voices) {
      try {
        const request: IVoiceSynthesizeRequest = {
          text: options.text,
          voice,
          languageCode: this.voiceConfig.languageCode,
        };

        const response = (await Promise.race([
          voiceService.synthesizeSpeech(request),
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error('Request timeout')),
              this.voiceConfig!.timeout
            )
          ),
        ])) as any;

        if (!response.audioContent) {
          continue; // Try next voice
        }

        const audioUrl = URL.createObjectURL(
          new Blob([Buffer.from(response.audioContent, 'base64')], {
            type: 'audio/mpeg',
          })
        );

        await this.playAudio(audioUrl);
        return true;
      } catch (error) {
        logger.warn(`Cloud synthesis failed for voice ${voice}:`, error);
        continue; // Try next voice
      }
    }

    return false;
  }

  private async tryWebSpeechSynthesis(
    options: SpeechOptions
  ): Promise<boolean> {
    if (!this.capabilities?.speechSynthesis.supported || !this.voiceConfig) {
      return false;
    }

    return new Promise((resolve) => {
      try {
        const utterance = new SpeechSynthesisUtterance(options.text);

        // Configure utterance
        utterance.lang = this.voiceConfig!.languageCode;
        utterance.rate = 0.9; // Slightly slower for better comprehension
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        // Use best available voice
        if (this.capabilities!.speechSynthesis.preferredVoice) {
          utterance.voice = this.capabilities!.speechSynthesis.preferredVoice;
        } else if (this.voiceConfig!.webSpeechFallbacks.length > 0) {
          utterance.voice = this.voiceConfig!.webSpeechFallbacks[0];
        }

        utterance.onend = () => {
          this.onSpeechEnded();
          resolve(true);
        };

        utterance.onerror = (event) => {
          logger.error('Web speech synthesis error:', event);
          resolve(false);
        };

        // Cancel any ongoing speech
        speechSynthesis.cancel();

        // Start speaking
        speechSynthesis.speak(utterance);

        // Timeout fallback
        setTimeout(() => {
          if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
            resolve(false);
          }
        }, this.voiceConfig!.timeout);
      } catch (error) {
        logger.error('Web speech synthesis setup error:', error);
        resolve(false);
      }
    });
  }

  private async playAudio(audioUrl: string): Promise<void> {
    if (!this.audioRef) {
      throw new Error('Audio element not available');
    }

    return new Promise((resolve, reject) => {
      const cleanup = () => {
        URL.revokeObjectURL(audioUrl);
        if (this.audioRef) {
          this.audioRef.removeEventListener('ended', handleEnded);
          this.audioRef.removeEventListener('error', handleError);
        }
      };

      const handleEnded = () => {
        cleanup();
        resolve();
      };

      const handleError = (_event: Event) => {
        cleanup();
        reject(new Error('Audio playback failed'));
      };

      if (!this.audioRef) {
        cleanup();
        reject(new Error('Audio element not available'));
        return;
      }

      this.audioRef.addEventListener('ended', handleEnded);
      this.audioRef.addEventListener('error', handleError);
      this.audioRef.src = audioUrl;

      this.audioRef.play().catch((error) => {
        cleanup();
        reject(error);
      });
    });
  }

  private onSpeechEnded(): void {
    this.speechState.isSpeaking = false;
    this.speechState.currentText = '';
    this.notifyStateChange();

    // Process next item in queue
    if (this.speechState.queue.length > 0) {
      const nextOptions = this.speechState.queue.shift()!;
      setTimeout(() => this.processSpeech(nextOptions), 100);
    }
  }

  private onSpeechError(event: Event): void {
    logger.error('Speech playback error:', event);
    this.speechState.lastError = 'Audio playback failed';
    this.onSpeechEnded();
  }

  stop(): void {
    // Stop audio playback
    if (this.audioRef) {
      this.audioRef.pause();
      this.audioRef.currentTime = 0;
    }

    // Stop web speech
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }

    // Clear queue
    this.speechState.queue = [];
    this.speechState.isSpeaking = false;
    this.speechState.currentText = '';
    this.notifyStateChange();
  }

  getState(): SpeechState {
    return { ...this.speechState };
  }

  onStateChange(callback: (state: SpeechState) => void): () => void {
    this.stateCallbacks.add(callback);
    return () => this.stateCallbacks.delete(callback);
  }

  private notifyStateChange(): void {
    this.stateCallbacks.forEach((callback) => {
      try {
        callback(this.getState());
      } catch (error) {
        logger.error('Error in speech state callback:', error);
      }
    });
  }

  private logConfiguration(): void {
    if (!this.capabilities || !this.voiceConfig) return;

    logger.info('🎤 Enhanced Speech Synthesis Configuration');
    logger.info('🔊 Primary Voice:', this.voiceConfig.primary);
    logger.info('🔄 Fallback Voices:', this.voiceConfig.fallbacks);
    logger.info(
      '🌐 Web Speech Voices:',
      this.voiceConfig.webSpeechFallbacks.length
    );
    logger.info('⏱️ Timeout:', `${this.voiceConfig.timeout / 1000}s`);
    logger.info(
      '📱 Device:',
      `${this.capabilities.browser.name} ${this.capabilities.browser.version}`
    );
    logger.info(
      '🌐 Network:',
      `${this.capabilities.network.effectiveType} (${this.capabilities.network.downlink} Mbps)`
    );
  }

  dispose(): void {
    this.stop();

    if (this.audioRef) {
      // Remove event listeners using stored handlers
      const handlers = (this.audioRef as any)._boundHandlers;
      if (handlers) {
        this.audioRef.removeEventListener('ended', handlers.ended);
        this.audioRef.removeEventListener('error', handlers.error);
        this.audioRef.removeEventListener('loadstart', handlers.loadstart);
        this.audioRef.removeEventListener('canplay', handlers.canplay);
      }
      this.audioRef = null;
    }

    if (this.audioContextRef) {
      this.audioContextRef.close();
      this.audioContextRef = null;
    }

    this.stateCallbacks.clear();
    this.isInitialized = false;
  }
}

// Global instance
export const enhancedSpeechSynthesis = new EnhancedSpeechSynthesis();

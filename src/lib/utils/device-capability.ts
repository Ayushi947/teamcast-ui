/**
 * Device Capability Detection Utility
 * Detects browser and device capabilities for speech synthesis and recognition
 */

import { logger } from '../logger';

export interface DeviceCapabilities {
  speechSynthesis: {
    supported: boolean;
    voices: SpeechSynthesisVoice[];
    preferredVoice: SpeechSynthesisVoice | null;
    quality: 'high' | 'medium' | 'low' | 'none';
  };
  speechRecognition: {
    supported: boolean;
    continuous: boolean;
    interimResults: boolean;
    maxAlternatives: number;
    quality: 'high' | 'medium' | 'low' | 'none';
  };
  audioContext: {
    supported: boolean;
    maxChannels: number;
    sampleRate: number;
  };
  mediaDevices: {
    supported: boolean;
    audio: boolean;
    video: boolean;
  };
  browser: {
    name: string;
    version: string;
    isMobile: boolean;
    isIOS: boolean;
    isAndroid: boolean;
    supportsWebRTC: boolean;
  };
  network: {
    effectiveType: string;
    downlink: number;
    rtt: number;
  };
}

export interface VoiceConfig {
  primary: string;
  fallbacks: string[];
  webSpeechFallbacks: SpeechSynthesisVoice[];
  languageCode: string;
  timeout: number;
}

class DeviceCapabilityDetector {
  private capabilities: DeviceCapabilities | null = null;
  private voicesLoaded = false;

  async detectCapabilities(): Promise<DeviceCapabilities> {
    if (this.capabilities) {
      return this.capabilities;
    }

    const capabilities: DeviceCapabilities = {
      speechSynthesis: await this.detectSpeechSynthesis(),
      speechRecognition: await this.detectSpeechRecognition(),
      audioContext: this.detectAudioContext(),
      mediaDevices: await this.detectMediaDevices(),
      browser: this.detectBrowser(),
      network: this.detectNetwork(),
    };

    this.capabilities = capabilities;
    return capabilities;
  }

  private async detectSpeechSynthesis() {
    const result: {
      supported: boolean;
      voices: SpeechSynthesisVoice[];
      preferredVoice: SpeechSynthesisVoice | null;
      quality: 'high' | 'medium' | 'low' | 'none';
    } = {
      supported: false,
      voices: [] as SpeechSynthesisVoice[],
      preferredVoice: null as SpeechSynthesisVoice | null,
      quality: 'none',
    };

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return result;
    }

    result.supported = true;

    // Wait for voices to load
    if (!this.voicesLoaded) {
      await this.waitForVoices();
    }

    const voices = speechSynthesis.getVoices();
    result.voices = voices;

    // Find best voice
    const preferredVoices = [
      'en-US-Chirp3-HD-Aoede', // Google Cloud
      'en-US-Neural2-A', // Google Cloud Neural
      'en-US-Standard-A', // Google Cloud Standard
      'en-US-Wavenet-A', // Google Cloud Wavenet
      'Microsoft Zira - English (United States)', // Microsoft
      'Microsoft David - English (United States)', // Microsoft
      'Google US English', // Chrome
      'Alex', // Safari
      'Samantha', // macOS
    ];

    for (const voiceName of preferredVoices) {
      const voice = voices.find(
        (v) => v.name.includes(voiceName) || v.voiceURI.includes(voiceName)
      );
      if (voice) {
        result.preferredVoice = voice;
        break;
      }
    }

    // Fallback to any English voice
    if (!result.preferredVoice) {
      result.preferredVoice =
        voices.find((v) => v.lang.startsWith('en-') && v.localService) ||
        voices.find((v) => v.lang.startsWith('en-')) ||
        voices[0] ||
        null;
    }

    // Determine quality based on available voices
    if (
      voices.some(
        (v) => v.name.includes('Neural') || v.name.includes('Wavenet')
      )
    ) {
      result.quality = 'high';
    } else if (voices.some((v) => v.localService)) {
      result.quality = 'medium';
    } else if (voices.length > 0) {
      result.quality = 'low';
    }

    return result;
  }

  private async detectSpeechRecognition() {
    const result: {
      supported: boolean;
      continuous: boolean;
      interimResults: boolean;
      maxAlternatives: number;
      quality: 'high' | 'medium' | 'low' | 'none';
    } = {
      supported: false,
      continuous: false,
      interimResults: false,
      maxAlternatives: 1,
      quality: 'none',
    };

    if (typeof window === 'undefined') {
      return result;
    }

    // Check for different speech recognition implementations
    let SpeechRecognitionConstructor: any = null;

    if (typeof window !== 'undefined') {
      SpeechRecognitionConstructor =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition ||
        (window as any).mozSpeechRecognition ||
        (window as any).msSpeechRecognition;
    }

    if (!SpeechRecognitionConstructor) {
      return result;
    }

    result.supported = true;

    try {
      const recognition = new SpeechRecognitionConstructor();

      // Test capabilities
      recognition.continuous = true;
      result.continuous = true;

      recognition.interimResults = true;
      result.interimResults = true;

      recognition.maxAlternatives = 5;
      result.maxAlternatives = 5;

      // Determine quality based on browser
      const browser = this.detectBrowser();
      if (browser.name === 'Chrome' && parseInt(browser.version) >= 25) {
        result.quality = 'high';
      } else if (
        browser.name === 'Safari' &&
        parseFloat(browser.version) >= 14.1
      ) {
        result.quality = 'medium';
      } else if (browser.name === 'Firefox') {
        result.quality = 'low'; // Firefox has limited support
      } else {
        result.quality = 'medium';
      }
    } catch (error) {
      logger.warn('Speech recognition capability test failed:', error);
      result.quality = 'low';
    }

    return result;
  }

  private detectAudioContext() {
    const result = {
      supported: false,
      maxChannels: 0,
      sampleRate: 0,
    };

    if (typeof window === 'undefined') {
      return result;
    }

    const AudioContextClass =
      window.AudioContext || (window as any).webkitAudioContext;

    if (!AudioContextClass) {
      return result;
    }

    result.supported = true;

    try {
      const tempContext = new AudioContextClass();
      result.maxChannels = tempContext.destination.maxChannelCount;
      result.sampleRate = tempContext.sampleRate;
      tempContext.close();
    } catch (error) {
      logger.warn('AudioContext capability test failed:', error);
      result.maxChannels = 2; // Default stereo
      result.sampleRate = 44100; // Default sample rate
    }

    return result;
  }

  private async detectMediaDevices() {
    const result = {
      supported: false,
      audio: false,
      video: false,
    };

    if (typeof window === 'undefined' || !navigator.mediaDevices) {
      return result;
    }

    result.supported = true;

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      result.audio = devices.some((device) => device.kind === 'audioinput');
      result.video = devices.some((device) => device.kind === 'videoinput');
    } catch (error) {
      logger.warn('Media devices detection failed:', error);
      // Assume basic capabilities if enumeration fails
      result.audio = true;
      result.video = true;
    }

    return result;
  }

  private detectBrowser() {
    const result = {
      name: 'unknown',
      version: '0',
      isMobile: false,
      isIOS: false,
      isAndroid: false,
      supportsWebRTC: false,
    };

    if (typeof window === 'undefined') {
      return result;
    }

    const userAgent = navigator.userAgent;

    // Detect browser
    if (userAgent.includes('Chrome')) {
      result.name = 'Chrome';
      result.version = userAgent.match(/Chrome\/(\d+)/)?.[1] || '0';
    } else if (userAgent.includes('Firefox')) {
      result.name = 'Firefox';
      result.version = userAgent.match(/Firefox\/(\d+)/)?.[1] || '0';
    } else if (userAgent.includes('Safari')) {
      result.name = 'Safari';
      result.version = userAgent.match(/Version\/(\d+)/)?.[1] || '0';
    } else if (userAgent.includes('Edge')) {
      result.name = 'Edge';
      result.version = userAgent.match(/Edge\/(\d+)/)?.[1] || '0';
    }

    // Detect mobile
    result.isMobile =
      /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        userAgent
      );
    result.isIOS = /iPad|iPhone|iPod/.test(userAgent);
    result.isAndroid = /Android/.test(userAgent);

    // Detect WebRTC support
    result.supportsWebRTC = !!(
      navigator.mediaDevices?.getUserMedia ||
      (navigator as any).webkitGetUserMedia ||
      (navigator as any).mozGetUserMedia ||
      (navigator as any).msGetUserMedia
    );

    return result;
  }

  private detectNetwork() {
    const result = {
      effectiveType: 'unknown',
      downlink: 0,
      rtt: 0,
    };

    if (typeof window === 'undefined') {
      return result;
    }

    const connection =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection;

    if (connection) {
      result.effectiveType = connection.effectiveType || 'unknown';
      result.downlink = connection.downlink || 0;
      result.rtt = connection.rtt || 0;
    }

    return result;
  }

  private waitForVoices(): Promise<void> {
    return new Promise((resolve) => {
      if (speechSynthesis.getVoices().length > 0) {
        this.voicesLoaded = true;
        resolve();
        return;
      }

      let attempts = 0;
      const maxAttempts = 10;

      const checkVoices = () => {
        attempts++;
        if (speechSynthesis.getVoices().length > 0 || attempts >= maxAttempts) {
          this.voicesLoaded = true;
          resolve();
        } else {
          setTimeout(checkVoices, 100);
        }
      };

      // Listen for voiceschanged event
      speechSynthesis.addEventListener(
        'voiceschanged',
        () => {
          this.voicesLoaded = true;
          resolve();
        },
        { once: true }
      );

      // Start checking
      setTimeout(checkVoices, 100);
    });
  }

  getOptimalVoiceConfig(capabilities: DeviceCapabilities): VoiceConfig {
    const config: VoiceConfig = {
      primary: 'en-US-Chirp3-HD-Aoede',
      fallbacks: ['en-US-Standard-A', 'en-US-Wavenet-A'],
      webSpeechFallbacks: [],
      languageCode: 'en-US',
      timeout: 30000,
    };

    // Adjust based on capabilities
    if (capabilities.speechSynthesis.quality === 'high') {
      config.primary = 'en-US-Chirp3-HD-Aoede';
      config.fallbacks = [
        'en-US-Neural2-A',
        'en-US-Wavenet-A',
        'en-US-Standard-A',
      ];
    } else if (capabilities.speechSynthesis.quality === 'medium') {
      config.primary = 'en-US-Standard-A';
      config.fallbacks = ['en-US-Wavenet-A'];
    } else if (capabilities.speechSynthesis.quality === 'low') {
      config.primary = 'en-US-Standard-A';
      config.fallbacks = [];
    }

    // Add web speech fallbacks
    if (
      capabilities.speechSynthesis.supported &&
      capabilities.speechSynthesis.voices.length > 0
    ) {
      config.webSpeechFallbacks = capabilities.speechSynthesis.voices
        .filter((voice) => voice.lang.startsWith('en-'))
        .slice(0, 3);
    }

    // Adjust timeout based on network
    if (
      capabilities.network.effectiveType === 'slow-2g' ||
      capabilities.network.downlink < 0.5
    ) {
      config.timeout = 60000; // 60 seconds for slow connections
    } else if (
      capabilities.network.effectiveType === '2g' ||
      capabilities.network.downlink < 1
    ) {
      config.timeout = 45000; // 45 seconds for 2G
    }

    return config;
  }

  logCapabilities(capabilities: DeviceCapabilities) {
    logger.info('🔍 Device Capabilities Detected');
    logger.info(
      '📱 Browser:',
      `${capabilities.browser.name} ${capabilities.browser.version}`
    );
    logger.info('📱 Mobile:', capabilities.browser.isMobile);
    logger.info(
      '🎤 Speech Recognition:',
      capabilities.speechRecognition.supported
        ? `✅ ${capabilities.speechRecognition.quality}`
        : '❌'
    );
    logger.info(
      '🔊 Speech Synthesis:',
      capabilities.speechSynthesis.supported
        ? `✅ ${capabilities.speechSynthesis.quality}`
        : '❌'
    );
    logger.info(
      '🎵 Audio Context:',
      capabilities.audioContext.supported ? '✅' : '❌'
    );
    logger.info(
      '📹 Media Devices:',
      capabilities.mediaDevices.supported ? '✅' : '❌'
    );
    logger.info(
      '🌐 Network:',
      `${capabilities.network.effectiveType} (${capabilities.network.downlink} Mbps)`
    );
  }
}

// Singleton instance
export const deviceCapabilityDetector = new DeviceCapabilityDetector();

// Convenience functions
export async function getDeviceCapabilities(): Promise<DeviceCapabilities> {
  return deviceCapabilityDetector.detectCapabilities();
}

export async function getOptimalVoiceConfig(): Promise<VoiceConfig> {
  const capabilities = await getDeviceCapabilities();
  return deviceCapabilityDetector.getOptimalVoiceConfig(capabilities);
}

export function logDeviceCapabilities(): Promise<void> {
  return getDeviceCapabilities().then((capabilities) => {
    deviceCapabilityDetector.logCapabilities(capabilities);
  });
}

import { ApiService } from '../core/api.service';
import {
  IVoiceSynthesizeRequest,
  IVoiceSynthesizeResponse,
  ISpeechToTextRequest,
  ISpeechToTextResponse,
} from '../../models/domain/voice/voice.domain';

/**
 * API endpoints for voice synthesis related operations
 */
const VOICE_ENDPOINTS = {
  BASE: '/voice/synthesize',
  TRANSCRIBE: '/voice/transcribe',
} as const;

export class VoiceApiService extends ApiService {
  /**
   * Synthesize text to speech
   */
  public async synthesizeSpeech(
    data: IVoiceSynthesizeRequest
  ): Promise<IVoiceSynthesizeResponse> {
    try {
      return await this.apiPost<IVoiceSynthesizeResponse>(
        VOICE_ENDPOINTS.BASE,
        data
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Convert speech to text
   */
  public async transcribeSpeech(
    data: ISpeechToTextRequest
  ): Promise<ISpeechToTextResponse> {
    try {
      return await this.apiPost<ISpeechToTextResponse>(
        VOICE_ENDPOINTS.TRANSCRIBE,
        data
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }
}

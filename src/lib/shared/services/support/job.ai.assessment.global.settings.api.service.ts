import { ApiService } from '../core/api.service';
import {
  IGlobalJobAiAssessmentSettings,
  IGlobalJobAiAssessmentSettingsUpdate,
} from '../../models/domain/candidate/job.ai.assessment.domain';

/**
 * API endpoints for job AI assessment global settings management
 */
const JOB_AI_ASSESSMENT_GLOBAL_SETTINGS_ENDPOINTS = {
  BASE: '/support/job-ai-assessment-global-settings',
} as const;

export class JobAiAssessmentGlobalSettingsApiService extends ApiService {
  /**
   * Get global job AI assessment settings
   * @returns Promise resolving to global job AI assessment settings
   */
  public async getGlobalJobAiAssessmentSettings(): Promise<IGlobalJobAiAssessmentSettings> {
    try {
      return await this.apiGet<IGlobalJobAiAssessmentSettings>(
        JOB_AI_ASSESSMENT_GLOBAL_SETTINGS_ENDPOINTS.BASE
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update global job AI assessment settings
   * @param data - Settings data to update
   * @returns Promise resolving to updated settings
   */
  public async updateGlobalJobAiAssessmentSettings(
    data: IGlobalJobAiAssessmentSettingsUpdate
  ): Promise<IGlobalJobAiAssessmentSettings> {
    try {
      return await this.apiPatch<IGlobalJobAiAssessmentSettings>(
        JOB_AI_ASSESSMENT_GLOBAL_SETTINGS_ENDPOINTS.BASE,
        data
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }
}

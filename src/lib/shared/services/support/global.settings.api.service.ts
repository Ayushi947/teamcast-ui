import { ApiService } from '../core/api.service';
import {
  IGlobalSettings,
  IGlobalSettingsUpdate,
} from '../../models/domain/support/global.settings.domain';

/**
 * API endpoints for global settings management
 */
const GLOBAL_SETTINGS_ENDPOINTS = {
  BASE: '/support/global-settings',
} as const;

export class GlobalSettingsApiService extends ApiService {
  /**
   * Get global settings
   * @returns Promise resolving to global settings
   */
  public async getGlobalSettings(): Promise<IGlobalSettings> {
    try {
      return await this.apiGet<IGlobalSettings>(GLOBAL_SETTINGS_ENDPOINTS.BASE);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update global settings
   * @param data - Settings data to update
   * @returns Promise resolving to updated settings
   */
  public async updateGlobalSettings(
    data: IGlobalSettingsUpdate
  ): Promise<IGlobalSettings> {
    try {
      return await this.apiPatch<IGlobalSettings>(
        GLOBAL_SETTINGS_ENDPOINTS.BASE,
        data
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }
}

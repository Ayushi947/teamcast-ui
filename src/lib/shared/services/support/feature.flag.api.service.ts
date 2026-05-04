import { ApiService } from '../core/api.service';
import type { IPaginatedResponse } from '../../models/api/common/common.api';
import type {
  IFeatureFlag,
  IFeatureFlagCreate,
  IFeatureFlagUpdate,
  IFeatureFlagListParams,
  IFeatureFlagPreset,
  IFeatureFlagPresetCreate,
  IFeatureFlagPresetUpdate,
  IFeatureFlagSchedule,
  IFeatureFlagScheduleCreate,
} from '../../models/domain/support/feature.flag.domain';

/**
 * API endpoints for feature flag management
 */
const FEATURE_FLAG_ENDPOINTS = {
  BASE: '/support/feature-flags',
  PUBLIC: '/support/feature-flags/public',
  BULK_TOGGLE: '/support/feature-flags/bulk/toggle',
} as const;

export type { IFeatureFlagListParams };

export class SupportFeatureFlagApiService extends ApiService {
  /**
   * List feature flags with search, filters and pagination (admin only)
   */
  public async listFeatureFlags(
    params: IFeatureFlagListParams
  ): Promise<IPaginatedResponse<IFeatureFlag>> {
    try {
      const queryString = this.buildQueryString({
        page: params.page,
        limit: params.limit,
        search: params.search,
        category: params.category,
        enabled: params.enabled,
        sortBy: params.sortBy,
        sortOrder: params.sortOrder,
      });
      return await this.apiGet<IPaginatedResponse<IFeatureFlag>>(
        `${FEATURE_FLAG_ENDPOINTS.BASE}${queryString}`
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get all feature flags (admin only)
   */
  public async getAllFeatureFlags(): Promise<IFeatureFlag[]> {
    try {
      return await this.apiGet<IFeatureFlag[]>(FEATURE_FLAG_ENDPOINTS.BASE);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get public feature flags (for clients)
   */
  public async getPublicFeatureFlags(
    clientId?: string,
    userType?: string
  ): Promise<Record<string, boolean>> {
    try {
      const params = new URLSearchParams();
      if (clientId) params.append('clientId', clientId);
      if (userType) params.append('userType', userType);

      const queryString = params.toString();
      const url = queryString
        ? `${FEATURE_FLAG_ENDPOINTS.PUBLIC}?${queryString}`
        : FEATURE_FLAG_ENDPOINTS.PUBLIC;

      return await this.apiGet<Record<string, boolean>>(url);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get feature flag by ID
   */
  public async getFeatureFlagById(id: string): Promise<IFeatureFlag> {
    try {
      return await this.apiGet<IFeatureFlag>(
        `${FEATURE_FLAG_ENDPOINTS.BASE}/${id}`
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create a new feature flag
   */
  public async createFeatureFlag(
    data: IFeatureFlagCreate
  ): Promise<IFeatureFlag> {
    try {
      return await this.apiPost<IFeatureFlag>(FEATURE_FLAG_ENDPOINTS.BASE, {
        data,
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update an existing feature flag
   */
  public async updateFeatureFlag(
    id: string,
    data: IFeatureFlagUpdate
  ): Promise<IFeatureFlag> {
    try {
      return await this.apiPatch<IFeatureFlag>(
        `${FEATURE_FLAG_ENDPOINTS.BASE}/${id}`,
        { data }
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete a feature flag
   */
  public async deleteFeatureFlag(id: string): Promise<void> {
    try {
      return await this.apiDelete<void>(`${FEATURE_FLAG_ENDPOINTS.BASE}/${id}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Bulk toggle feature flags
   */
  public async bulkToggleFeatureFlags(
    ids: string[],
    enabled: boolean
  ): Promise<IFeatureFlag[]> {
    try {
      return await this.apiPost<IFeatureFlag[]>(
        FEATURE_FLAG_ENDPOINTS.BULK_TOGGLE,
        { ids, enabled }
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Copy a feature flag to selected clients (creates client-specific overrides)
   */
  public async copyFeatureFlagToClients(
    flagId: string,
    clientIds: string[]
  ): Promise<{ created: IFeatureFlag[]; skipped: string[] }> {
    try {
      const response = await this.apiPost<{
        created: IFeatureFlag[];
        skipped: string[];
      }>(`${FEATURE_FLAG_ENDPOINTS.BASE}/${flagId}/copy-to-clients`, {
        clientIds,
      });
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get diff: global vs client overrides for a client
   */
  public async getFeatureFlagDiff(clientId: string): Promise<{
    global: IFeatureFlag[];
    clientOverrides: IFeatureFlag[];
  }> {
    try {
      return await this.apiGet<{
        global: IFeatureFlag[];
        clientOverrides: IFeatureFlag[];
      }>(
        `${FEATURE_FLAG_ENDPOINTS.BASE}/diff?clientId=${encodeURIComponent(clientId)}`
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * List presets
   */
  public async listPresets(): Promise<IFeatureFlagPreset[]> {
    try {
      return await this.apiGet<IFeatureFlagPreset[]>(
        `${FEATURE_FLAG_ENDPOINTS.BASE}/presets`
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get preset by ID
   */
  public async getPresetById(id: string): Promise<IFeatureFlagPreset> {
    try {
      return await this.apiGet<IFeatureFlagPreset>(
        `${FEATURE_FLAG_ENDPOINTS.BASE}/presets/${id}`
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create preset
   */
  public async createPreset(
    data: IFeatureFlagPresetCreate
  ): Promise<IFeatureFlagPreset> {
    try {
      return await this.apiPost<IFeatureFlagPreset>(
        `${FEATURE_FLAG_ENDPOINTS.BASE}/presets`,
        { data }
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update preset
   */
  public async updatePreset(
    id: string,
    data: IFeatureFlagPresetUpdate
  ): Promise<IFeatureFlagPreset> {
    try {
      return await this.apiPatch<IFeatureFlagPreset>(
        `${FEATURE_FLAG_ENDPOINTS.BASE}/presets/${id}`,
        { data }
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete preset
   */
  public async deletePreset(id: string): Promise<void> {
    try {
      return await this.apiDelete<void>(
        `${FEATURE_FLAG_ENDPOINTS.BASE}/presets/${id}`
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Apply preset to client
   */
  public async applyPresetToClient(
    presetId: string,
    clientId: string
  ): Promise<IFeatureFlag[]> {
    try {
      return await this.apiPost<IFeatureFlag[]>(
        `${FEATURE_FLAG_ENDPOINTS.BASE}/presets/${presetId}/apply`,
        { clientId }
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create schedule
   */
  public async createSchedule(
    data: IFeatureFlagScheduleCreate
  ): Promise<IFeatureFlagSchedule> {
    try {
      return await this.apiPost<IFeatureFlagSchedule>(
        `${FEATURE_FLAG_ENDPOINTS.BASE}/schedules`,
        { data }
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * List schedules
   */
  public async listSchedules(params?: {
    featureFlagId?: string;
    clientId?: string;
    status?: string;
  }): Promise<IFeatureFlagSchedule[]> {
    try {
      const query = new URLSearchParams();
      if (params?.featureFlagId)
        query.set('featureFlagId', params.featureFlagId);
      if (params?.clientId) query.set('clientId', params.clientId);
      if (params?.status) query.set('status', params.status);
      const qs = query.toString();
      return await this.apiGet<IFeatureFlagSchedule[]>(
        `${FEATURE_FLAG_ENDPOINTS.BASE}/schedules${qs ? `?${qs}` : ''}`
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Cancel schedule
   */
  public async cancelSchedule(id: string): Promise<IFeatureFlagSchedule> {
    try {
      return await this.apiPost<IFeatureFlagSchedule>(
        `${FEATURE_FLAG_ENDPOINTS.BASE}/schedules/${id}/cancel`
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }
}

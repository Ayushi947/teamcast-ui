import { ApiService } from '../core/api.service';
import {
  ITourDefinitionExtended,
  IGetTourDefinitionsFilters,
  IGetTourGroupsApiResponse,
} from '../../models/api/support/tour.definition.management.api';
import {
  IPaginationRequest,
  IPaginatedResponse,
} from '../../models/api/common/common.api';

/**
 * API endpoints for tour definition management
 */
const TOUR_DEFINITION_ENDPOINTS = {
  BASE: '/support/tour-definitions',
  GROUPS: '/support/tour-definitions/groups',
  BY_ID: '/support/tour-definitions/:tourId',
  BY_KEY: '/support/tour-definitions/key/:tourKey',
  TOGGLE_STATUS: '/support/tour-definitions/:tourId/toggle-status',
} as const;

export class TourDefinitionManagementApiService extends ApiService {
  /**
   * Get all tour definitions with pagination and filters
   */
  public async getAllTourDefinitions(
    pagination?: IPaginationRequest,
    filters?: IGetTourDefinitionsFilters
  ): Promise<IPaginatedResponse<ITourDefinitionExtended>> {
    try {
      const params = {
        ...this.buildPaginationParams(pagination),
        ...filters,
      };
      const queryString = this.buildQueryString(params);
      const url = `${TOUR_DEFINITION_ENDPOINTS.BASE}${queryString}`;
      return await this.apiGet<IPaginatedResponse<ITourDefinitionExtended>>(
        url
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get a single tour definition by ID
   */
  public async getTourDefinitionById(
    tourId: string
  ): Promise<ITourDefinitionExtended> {
    try {
      const url = TOUR_DEFINITION_ENDPOINTS.BY_ID.replace(':tourId', tourId);
      return await this.apiGet<ITourDefinitionExtended>(url);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get a single tour definition by tour key
   */
  public async getTourDefinitionByKey(
    tourKey: string
  ): Promise<ITourDefinitionExtended> {
    try {
      const url = TOUR_DEFINITION_ENDPOINTS.BY_KEY.replace(':tourKey', tourKey);
      return await this.apiGet<ITourDefinitionExtended>(url);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create a new tour definition
   */
  public async createTourDefinition(
    data: Omit<ITourDefinitionExtended, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ITourDefinitionExtended> {
    try {
      return await this.apiPost<ITourDefinitionExtended>(
        TOUR_DEFINITION_ENDPOINTS.BASE,
        { data }
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update an existing tour definition
   */
  public async updateTourDefinition(
    tourId: string,
    data: Partial<
      Omit<
        ITourDefinitionExtended,
        'id' | 'tourKey' | 'createdAt' | 'updatedAt'
      >
    >
  ): Promise<ITourDefinitionExtended> {
    try {
      const url = TOUR_DEFINITION_ENDPOINTS.BY_ID.replace(':tourId', tourId);
      return await this.apiPut<ITourDefinitionExtended>(url, { data });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete a tour definition
   */
  public async deleteTourDefinition(tourId: string): Promise<void> {
    try {
      const url = TOUR_DEFINITION_ENDPOINTS.BY_ID.replace(':tourId', tourId);
      await this.apiDelete<void>(url);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Toggle tour definition active status
   */
  public async toggleTourDefinitionStatus(
    tourId: string
  ): Promise<ITourDefinitionExtended> {
    try {
      const url = TOUR_DEFINITION_ENDPOINTS.TOGGLE_STATUS.replace(
        ':tourId',
        tourId
      );
      return await this.apiPut<ITourDefinitionExtended>(url);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get all unique tour groups
   */
  public async getTourGroups(): Promise<IGetTourGroupsApiResponse> {
    try {
      return await this.apiGet<IGetTourGroupsApiResponse>(
        TOUR_DEFINITION_ENDPOINTS.GROUPS
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }
}

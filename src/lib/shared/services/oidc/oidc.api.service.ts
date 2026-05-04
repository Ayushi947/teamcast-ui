import { ApiService } from '../core/api.service';
import { AxiosInstance } from 'axios';
import {
  IOIDCAuthorizeResponse,
  IOIDCDeelStatus,
} from '../../models/domain/oidc/oidc.domain';

/**
 * Access the protected apiClient from ApiService
 * This is needed because the authorize endpoint returns direct JSON (not wrapped in data)
 */
function getApiClient(service: ApiService): AxiosInstance {
  return (service as any).apiClient as AxiosInstance;
}

/**
 * API endpoints for OIDC operations
 * Note: baseURL already includes /api, so we only need /v1/oidc/...
 */
const OIDC_ENDPOINTS = {
  AUTHORIZE: '/v1/oidc/authorize',
  DEEL_STATUS: '/v1/oidc/deel/status',
} as const;

/**
 * Service for handling OIDC related API operations
 * Manages OAuth2/OIDC authorization flow with Deel
 */
export class OIDCApiService extends ApiService {
  constructor(apiClient: AxiosInstance) {
    super(apiClient);
  }

  /**
   * Initiate OAuth2 authorization flow with Deel
   * Generates authorization code and returns redirect URL
   *
   * @param params - OAuth2 authorization parameters from Deel
   * @returns Promise resolving to redirect URL with authorization code
   * @throws Error if the API request fails or user is not authenticated
   */
  public async authorize(params: {
    response_type: string;
    client_id: string;
    redirect_uri: string;
    scope: string;
    state?: string;
  }): Promise<IOIDCAuthorizeResponse> {
    try {
      const queryParams = new URLSearchParams({
        response_type: params.response_type,
        client_id: params.client_id,
        redirect_uri: params.redirect_uri,
        scope: params.scope,
        ...(params.state && { state: params.state }),
      });

      // The backend /authorize endpoint returns { redirect_url: string } directly
      // (not wrapped in { success: true, data: {...} }), so we need to handle it specially
      const apiClient = getApiClient(this);
      const response = await apiClient.get<IOIDCAuthorizeResponse>(
        `${OIDC_ENDPOINTS.AUTHORIZE}?${queryParams.toString()}`,
        {
          // Prevent automatic redirects
          maxRedirects: 0,
          validateStatus: (status: number) => status >= 200 && status < 400,
        }
      );

      // Backend returns { redirect_url: string } directly
      const responseData = response.data;
      if (responseData?.redirect_url) {
        return responseData;
      }

      // Fallback: check if response is wrapped in data (shouldn't happen, but just in case)
      const wrappedData = (responseData as any)?.data;
      if (wrappedData?.redirect_url) {
        return wrappedData;
      }

      throw new Error('Invalid response format from authorize endpoint');
    } catch (error: any) {
      // Handle redirect response
      if (error.response?.status === 302 || error.response?.status === 301) {
        const redirectUrl = error.response.headers.location;
        if (redirectUrl) {
          return { redirect_url: redirectUrl };
        }
      }
      throw this.handleError(error);
    }
  }

  /**
   * Check if Deel SSO is enabled for authenticated user's organization
   *
   * @returns Promise resolving to Deel status
   * @throws Error if the API request fails
   */
  public async getDeelStatus(): Promise<IOIDCDeelStatus> {
    try {
      return await this.apiGet<IOIDCDeelStatus>(OIDC_ENDPOINTS.DEEL_STATUS);
    } catch (error) {
      throw this.handleError(error);
    }
  }
}

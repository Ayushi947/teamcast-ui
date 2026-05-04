import { ApiService } from '../core/api.service';

import type {
  IMcpClient,
  IMcpClientCreate,
  IMcpClientUpdate,
  IMcpClientWithApiKey,
  IMcpClientFilterQuery,
  IMcpClientWebhookConfig,
  IMcpClientScope,
  IMcpWebhookTestResult,
} from '../../models/domain/client/mcp.client.domain';
import type {
  IMcpActivityLogListResult,
  IMcpActivityLogFilterQuery,
} from '../../models/domain/client/mcp.activity.log.domain';
import type { IPaginationRequest } from '../../models/api/common/common.api';

/**
 * API endpoints for MCP client management operations
 */
const MCP_CLIENT_ENDPOINTS = {
  BASE: '/client/mcp-clients',
  DETAIL: '/client/mcp-clients/:mcpClientId',
  REGENERATE_KEY: '/client/mcp-clients/:mcpClientId/regenerate-key',
  WEBHOOK: '/client/mcp-clients/:mcpClientId/webhook',
  TEST_WEBHOOK: '/client/mcp-clients/:mcpClientId/webhook/test',
  ACTIVITY_LOGS: '/client/mcp-clients/:mcpClientId/activity-logs',
  SCOPES: '/client/mcp-clients/scopes',
} as const;

export class McpClientApiService extends ApiService {
  /**
   * Get list of MCP clients
   */
  public async getMcpClients(
    filter?: IMcpClientFilterQuery & IPaginationRequest
  ): Promise<IMcpClient[]> {
    try {
      return await this.apiGet<IMcpClient[]>(
        `${MCP_CLIENT_ENDPOINTS.BASE}${filter ? this.buildQueryString(filter) : ''}`
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get a specific MCP client
   */
  public async getMcpClient(mcpClientId: string): Promise<IMcpClient> {
    try {
      return await this.apiGet<IMcpClient>(
        MCP_CLIENT_ENDPOINTS.DETAIL.replace(':mcpClientId', mcpClientId)
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create a new MCP client
   */
  public async createMcpClient(
    data: IMcpClientCreate
  ): Promise<IMcpClientWithApiKey> {
    try {
      return await this.apiPost<IMcpClientWithApiKey>(
        MCP_CLIENT_ENDPOINTS.BASE,
        data
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update an MCP client
   */
  public async updateMcpClient(
    mcpClientId: string,
    data: IMcpClientUpdate
  ): Promise<IMcpClient> {
    try {
      return await this.apiPatch<IMcpClient>(
        MCP_CLIENT_ENDPOINTS.DETAIL.replace(':mcpClientId', mcpClientId),
        data
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete an MCP client
   */
  public async deleteMcpClient(mcpClientId: string): Promise<boolean> {
    try {
      return await this.apiDelete<boolean>(
        MCP_CLIENT_ENDPOINTS.DETAIL.replace(':mcpClientId', mcpClientId)
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Regenerate API key for an MCP client
   */
  public async regenerateApiKey(
    mcpClientId: string
  ): Promise<IMcpClientWithApiKey> {
    try {
      return await this.apiPost<IMcpClientWithApiKey>(
        MCP_CLIENT_ENDPOINTS.REGENERATE_KEY.replace(':mcpClientId', mcpClientId)
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Configure webhook for an MCP client
   */
  public async configureWebhook(
    mcpClientId: string,
    config: IMcpClientWebhookConfig
  ): Promise<IMcpClient> {
    try {
      return await this.apiPut<IMcpClient>(
        MCP_CLIENT_ENDPOINTS.WEBHOOK.replace(':mcpClientId', mcpClientId),
        config
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Test webhook configuration
   */
  public async testWebhook(
    mcpClientId: string
  ): Promise<IMcpWebhookTestResult> {
    try {
      return await this.apiPost<IMcpWebhookTestResult>(
        MCP_CLIENT_ENDPOINTS.TEST_WEBHOOK.replace(':mcpClientId', mcpClientId)
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get activity logs for an MCP client
   */
  public async getActivityLogs(
    mcpClientId: string,
    filter?: IMcpActivityLogFilterQuery & {
      limit?: number;
      offset?: number;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<IMcpActivityLogListResult> {
    try {
      return await this.apiGet<IMcpActivityLogListResult>(
        `${MCP_CLIENT_ENDPOINTS.ACTIVITY_LOGS.replace(':mcpClientId', mcpClientId)}${filter ? this.buildQueryString(filter) : ''}`
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get available scopes
   */
  public async getAvailableScopes(): Promise<IMcpClientScope[]> {
    try {
      return await this.apiGet<IMcpClientScope[]>(MCP_CLIENT_ENDPOINTS.SCOPES);
    } catch (error) {
      throw this.handleError(error);
    }
  }
}

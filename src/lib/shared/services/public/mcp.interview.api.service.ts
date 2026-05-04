/**
 * MCP Interview Public API Service
 * Handles public interview acceptance/decline operations
 */

import { ApiService } from '../core/api.service';
import type {
  IMcpInterviewAcceptRequest,
  IMcpInterviewDeclineRequest,
} from '../../models/api/client/mcp.interview.api';
import type {
  IMcpInterviewLandingData,
  IMcpInterviewAcceptResponse,
} from '../../models/domain/client/mcp.interview.domain';
import type { IAuthUser } from '../../models/domain/auth/auth.user.domain';
import type { IAuthToken } from '../../models/domain/auth/auth.token.domain';

/**
 * API endpoints for MCP interview public operations
 */
const MCP_INTERVIEW_ENDPOINTS = {
  LANDING: '/public/interviews/:interviewId',
  ACCEPT: '/public/interviews/:interviewId/accept',
  DECLINE: '/public/interviews/:interviewId/decline',
  START: '/public/interviews/:interviewId/start',
} as const;

/**
 * MCP Interview Public API Service
 * Provides methods for candidate interview acceptance
 */
export class McpInterviewPublicApiService extends ApiService {
  /**
   * Get interview landing page data
   */
  public async getInterviewLanding(
    interviewId: string
  ): Promise<IMcpInterviewLandingData> {
    const url = MCP_INTERVIEW_ENDPOINTS.LANDING.replace(
      ':interviewId',
      interviewId
    );
    return this.apiGet<IMcpInterviewLandingData>(url);
  }

  /**
   * Accept interview invitation
   */
  public async acceptInterview(
    interviewId: string,
    data: IMcpInterviewAcceptRequest
  ): Promise<IMcpInterviewAcceptResponse> {
    const url = MCP_INTERVIEW_ENDPOINTS.ACCEPT.replace(
      ':interviewId',
      interviewId
    );
    return this.apiPost<IMcpInterviewAcceptResponse>(url, data);
  }

  /**
   * Decline interview invitation
   */
  public async declineInterview(
    interviewId: string,
    data?: IMcpInterviewDeclineRequest
  ): Promise<void> {
    const url = MCP_INTERVIEW_ENDPOINTS.DECLINE.replace(
      ':interviewId',
      interviewId
    );
    await this.apiPost<void>(url, data || {});
  }

  /**
   * Start interview assessment
   * Creates job posting, application, and assessment invitation
   */
  public async startInterview(interviewId: string): Promise<{
    success: boolean;
    assessmentInviteId: string;
    redirectUrl: string;
    authToken: IAuthToken;
    authUser: IAuthUser;
  }> {
    const url = MCP_INTERVIEW_ENDPOINTS.START.replace(
      ':interviewId',
      interviewId
    );
    return this.apiPost<{
      success: boolean;
      assessmentInviteId: string;
      redirectUrl: string;
      authToken: IAuthToken;
      authUser: IAuthUser;
    }>(url, {});
  }
}

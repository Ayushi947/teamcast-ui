/**
 * MCP Interview API Models
 * DTOs for API requests and responses
 */

import {
  McpInterviewStatusEnum,
  IMcpInterviewLandingData,
  IMcpInterviewAcceptInput,
  IMcpInterviewDeclineInput,
  IMcpInterviewAcceptResponse,
} from '../../domain/client/mcp.interview.domain';

/**
 * Interview landing response
 */
export interface IMcpInterviewLandingResponse {
  success: boolean;
  data: IMcpInterviewLandingData;
}

/**
 * Accept interview request
 */
export type IMcpInterviewAcceptRequest = IMcpInterviewAcceptInput;

/**
 * Accept interview response
 */
export interface IMcpInterviewAcceptApiResponse {
  success: boolean;
  data: {
    redirectUrl: string;
  };
  message?: string;
}

/**
 * Decline interview request
 */
export type IMcpInterviewDeclineRequest = IMcpInterviewDeclineInput;

/**
 * Decline interview response
 */
export interface IMcpInterviewDeclineApiResponse {
  success: boolean;
  message: string;
}

// Re-export domain types for convenience
export type {
  IMcpInterviewLandingData,
  IMcpInterviewAcceptInput,
  IMcpInterviewDeclineInput,
  IMcpInterviewAcceptResponse,
};
export { McpInterviewStatusEnum };

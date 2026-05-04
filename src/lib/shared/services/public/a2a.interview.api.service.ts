/**
 * A2A Interview API Service
 * Handles Agent-to-Agent protocol interview operations
 */

import { ApiService } from '../core/api.service';
import {
  type IA2AJsonRpcRequest,
  type IA2AInterviewRequestParams,
  type IA2ATask,
  type IA2ATaskListParams,
  type IA2ATaskListResponse,
  A2AMessageRole,
  A2APartType,
  type IA2AMessage,
  type IA2APart,
} from '../../models/api/client/a2a.interview.api';

/**
 * A2A API endpoints
 * Note: Base URL already includes /api prefix
 */
const A2A_ENDPOINTS = {
  BASE: '/a2a',
  MESSAGE: '/a2a/message',
  TASKS: '/a2a/tasks',
  TASK_DETAIL: '/a2a/tasks/:taskId',
  TASK_CANCEL: '/a2a/tasks/:taskId/cancel',
  SKILLS: '/a2a/skills',
  AGENT: '/a2a/agent.json',
} as const;

/**
 * A2A Interview API Service
 * Provides JSON-RPC client for A2A protocol operations
 */
export class A2AInterviewApiService extends ApiService {
  private requestIdCounter = 0;
  private apiKey: string | null = null;

  /**
   * Set API key for A2A authentication
   */
  public setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  /**
   * Clear API key
   */
  public clearApiKey(): void {
    this.apiKey = null;
  }

  /**
   * Generate a unique request ID
   */
  private generateRequestId(): string {
    this.requestIdCounter++;
    return `a2a-${Date.now()}-${this.requestIdCounter}`;
  }

  /**
   * Override apiPost to inject API key and handle JSON-RPC responses
   */
  protected async apiPost<T>(
    url: string,
    data: unknown,
    config?: any
  ): Promise<T> {
    try {
      const headers: Record<string, string> = {
        ...config?.headers,
      };

      // Add API key if set
      if (this.apiKey) {
        headers['X-API-Key'] = this.apiKey;
      }

      // Make raw axios request to handle JSON-RPC format
      const response = await (this as any).apiClient.post(url, data, {
        ...config,
        headers,
      });

      // For JSON-RPC responses, return the result directly
      if (response.data?.jsonrpc === '2.0') {
        if (response.data.error) {
          throw new Error(
            `A2A Error ${response.data.error.code}: ${response.data.error.message}`
          );
        }
        return response.data.result as T;
      }

      // For standard API responses, use base class logic
      if (response.data?.data) {
        return response.data.data as T;
      }

      return response.data as T;
    } catch (error: any) {
      // Handle JSON-RPC errors
      if (
        error.response?.data?.jsonrpc === '2.0' &&
        error.response?.data?.error
      ) {
        const rpcError = error.response.data.error;
        const customError = new Error(rpcError.message);
        Object.assign(customError, {
          status: error.response.status,
          code: rpcError.code,
          data: rpcError.data,
        });
        throw customError;
      }
      throw this.handleError(error);
    }
  }

  /**
   * Override apiGet to inject API key
   */
  protected async apiGet<T>(url: string, config?: any): Promise<T> {
    try {
      const headers: Record<string, string> = {
        ...config?.headers,
      };

      // Add API key if set
      if (this.apiKey) {
        headers['X-API-Key'] = this.apiKey;
      }

      // Make raw axios request
      const response = await (this as any).apiClient.get(url, {
        ...config,
        headers,
      });

      // For JSON-RPC responses, return the result directly
      if (response.data?.jsonrpc === '2.0') {
        if (response.data.error) {
          throw new Error(
            `A2A Error ${response.data.error.code}: ${response.data.error.message}`
          );
        }
        return response.data.result as T;
      }

      // For standard API responses
      if (response.data?.data) {
        return response.data.data as T;
      }

      return response.data as T;
    } catch (error: any) {
      // Handle JSON-RPC errors
      if (
        error.response?.data?.jsonrpc === '2.0' &&
        error.response?.data?.error
      ) {
        const rpcError = error.response.data.error;
        const customError = new Error(rpcError.message);
        Object.assign(customError, {
          status: error.response.status,
          code: rpcError.code,
          data: rpcError.data,
        });
        throw customError;
      }
      throw this.handleError(error);
    }
  }

  /**
   * Make a JSON-RPC request
   */
  private async jsonRpcRequest<T>(
    method: string,
    params?: Record<string, unknown>
  ): Promise<T> {
    const request: IA2AJsonRpcRequest = {
      jsonrpc: '2.0',
      method,
      params,
      id: this.generateRequestId(),
    };

    const result = await this.apiPost<T>(A2A_ENDPOINTS.BASE, request);

    return result;
  }

  /**
   * Create a text message part
   */
  private createTextPart(text: string): IA2APart {
    return {
      type: A2APartType.TEXT,
      text,
    };
  }

  /**
   * Create a data message part
   */
  private createDataPart(data: Record<string, unknown>): IA2APart {
    return {
      type: A2APartType.DATA,
      data,
    };
  }

  /**
   * Request an interview assessment via A2A protocol
   * Uses interview.request skill
   */
  public async requestInterview(
    params: IA2AInterviewRequestParams
  ): Promise<IA2ATask> {
    const message: Partial<IA2AMessage> = {
      role: A2AMessageRole.USER,
      parts: [
        this.createTextPart(
          `Request interview for ${params.candidateName} (${params.candidateEmail}) to assess: ${params.skillsToAssess.join(', ')}`
        ),
        this.createDataPart({
          skillId: 'interview.request',
          ...params,
        }),
      ],
    };

    const result = await this.jsonRpcRequest<{ task: IA2ATask }>(
      'message/send',
      {
        message,
        contextId: `interview-${Date.now()}`,
      }
    );

    return result.task;
  }

  /**
   * Get interview status via A2A protocol
   * Uses interview.status skill
   */
  public async getInterviewStatus(params: {
    interviewId?: string;
    externalReferenceId?: string;
    candidateEmail?: string;
  }): Promise<IA2ATask> {
    const message: Partial<IA2AMessage> = {
      role: A2AMessageRole.USER,
      parts: [
        this.createTextPart(
          `Get interview status${
            params.interviewId
              ? ` for interview ${params.interviewId}`
              : params.externalReferenceId
                ? ` with reference ${params.externalReferenceId}`
                : ''
          }`
        ),
        this.createDataPart({
          skillId: 'interview.status',
          ...params,
        }),
      ],
    };

    const result = await this.jsonRpcRequest<{ task: IA2ATask }>(
      'message/send',
      {
        message,
      }
    );

    return result.task;
  }

  /**
   * Get interview results via A2A protocol
   * Uses interview.results skill
   */
  public async getInterviewResults(params: {
    interviewId?: string;
    externalReferenceId?: string;
  }): Promise<IA2ATask> {
    const message: Partial<IA2AMessage> = {
      role: A2AMessageRole.USER,
      parts: [
        this.createTextPart(
          `Get interview results for ${params.interviewId || params.externalReferenceId}`
        ),
        this.createDataPart({
          skillId: 'interview.results',
          ...params,
        }),
      ],
    };

    const result = await this.jsonRpcRequest<{ task: IA2ATask }>(
      'message/send',
      {
        message,
      }
    );

    return result.task;
  }

  /**
   * Get a specific task by ID
   */
  public async getTask(taskId: string): Promise<IA2ATask | null> {
    const result = await this.jsonRpcRequest<{ task: IA2ATask | null }>(
      'tasks/get',
      { taskId } as Record<string, unknown>
    );

    return result.task;
  }

  /**
   * List tasks with optional filtering
   */
  public async listTasks(
    params?: IA2ATaskListParams
  ): Promise<IA2ATaskListResponse> {
    return await this.jsonRpcRequest<IA2ATaskListResponse>(
      'tasks/list',
      params as Record<string, unknown>
    );
  }

  /**
   * Cancel a task
   */
  public async cancelTask(
    taskId: string,
    reason?: string
  ): Promise<IA2ATask | null> {
    const result = await this.jsonRpcRequest<{ task: IA2ATask | null }>(
      'tasks/cancel',
      { taskId, reason } as Record<string, unknown>
    );

    return result.task;
  }

  /**
   * Get agent information
   */
  public async getAgentInfo(): Promise<Record<string, unknown>> {
    return await this.jsonRpcRequest<Record<string, unknown>>('agent/info');
  }

  /**
   * Get available skills
   */
  public async getSkills(): Promise<{ skills: unknown[]; total: number }> {
    return await this.apiGet<{ skills: unknown[]; total: number }>(
      A2A_ENDPOINTS.SKILLS
    );
  }

  /**
   * Poll a task until it reaches a terminal state
   * Useful for waiting for interview results
   */
  public async pollTaskUntilComplete(
    taskId: string,
    options: {
      maxAttempts?: number;
      intervalMs?: number;
      onProgress?: (task: IA2ATask) => void;
    } = {}
  ): Promise<IA2ATask> {
    const maxAttempts = options.maxAttempts || 60; // 60 attempts = 1 minute with 1s interval
    const intervalMs = options.intervalMs || 1000;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const task = await this.getTask(taskId);

      if (!task) {
        throw new Error(`Task ${taskId} not found`);
      }

      if (options.onProgress) {
        options.onProgress(task);
      }

      // Check if task is in terminal state
      if (
        task.state === 'completed' ||
        task.state === 'failed' ||
        task.state === 'cancelled' ||
        task.state === 'rejected'
      ) {
        return task;
      }

      // Wait before next poll
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }

    throw new Error(`Task ${taskId} did not complete within timeout`);
  }
}

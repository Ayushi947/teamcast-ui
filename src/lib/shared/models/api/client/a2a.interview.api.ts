/**
 * A2A Interview API Models
 * API request/response types for A2A interview operations via Agent-to-Agent protocol
 */

import { IApiResponse } from '../common/common.api';

// ============================================================================
// A2A JSON-RPC Types
// ============================================================================

export interface IA2AJsonRpcRequest {
  jsonrpc: '2.0';
  method: string;
  params?: Record<string, unknown>;
  id?: string | number | null;
}

export interface IA2AJsonRpcResponse {
  jsonrpc: '2.0';
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
  id: string | number | null;
}

// ============================================================================
// A2A Task Types
// ============================================================================

export enum A2ATaskState {
  WORKING = 'working',
  INPUT_REQUIRED = 'input-required',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REJECTED = 'rejected',
}

export enum A2AMessageRole {
  USER = 'user',
  AGENT = 'agent',
}

export enum A2APartType {
  TEXT = 'text',
  FILE = 'file',
  DATA = 'data',
}

export interface IA2ATextPart {
  type: A2APartType.TEXT;
  text: string;
  metadata?: Record<string, unknown>;
}

export interface IA2ADataPart {
  type: A2APartType.DATA;
  data: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export type IA2APart = IA2ATextPart | IA2ADataPart;

export interface IA2AMessage {
  messageId: string;
  role: A2AMessageRole;
  parts: IA2APart[];
  timestamp?: string;
  metadata?: Record<string, unknown>;
}

export interface IA2AArtifact {
  artifactId: string;
  name: string;
  parts: IA2APart[];
  metadata?: Record<string, unknown>;
}

export interface IA2ATask {
  taskId: string;
  contextId?: string;
  state: A2ATaskState;
  messages: IA2AMessage[];
  artifacts?: IA2AArtifact[];
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// A2A Interview Request (via message/send)
// ============================================================================

export interface IA2AInterviewRequestParams {
  candidateEmail: string;
  candidateName: string;
  phone?: string;
  currentTitle?: string;
  currentCompany?: string;
  yearsOfExperience?: number;
  linkedInUrl?: string;
  githubUrl?: string;
  skillsToAssess: string[];
  assessmentLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  jobTitle?: string;
  jobDescription?: string;
  jobLocation?: string;
  companyName?: string;
  expiryDays?: number;
  customInstructions?: string;
  inviteMessage?: string;
  externalReferenceId?: string;
  externalCandidateId?: string;
  expectedDurationMinutes?: number; // Expected assessment duration in minutes
  maxSections?: number; // Maximum number of assessment sections
  resumeFile?: string; // Base64 encoded resume file
  resumeFileName?: string; // Original resume filename
}

export interface IA2AInterviewRequestResponse {
  task: IA2ATask;
}

// ============================================================================
// A2A Interview Status
// ============================================================================

export interface IA2AInterviewStatusParams {
  interviewId?: string;
  externalReferenceId?: string;
  candidateEmail?: string;
}

export interface IA2AInterviewStatusResponse {
  task: IA2ATask;
}

// ============================================================================
// A2A Interview Results
// ============================================================================

export interface IA2AInterviewResultsParams {
  interviewId?: string;
  externalReferenceId?: string;
}

export interface IA2AInterviewResultsResponse {
  task: IA2ATask;
}

// ============================================================================
// A2A Interview List
// ============================================================================

export interface IA2AInterviewListParams {
  status?: string[];
  candidateEmail?: string;
  externalReferenceId?: string;
  fromDate?: string;
  toDate?: string;
  limit?: number;
  offset?: number;
}

export interface IA2AInterviewListResponse {
  task: IA2ATask;
}

// ============================================================================
// A2A Task Management
// ============================================================================

export interface IA2ATaskGetParams {
  taskId: string;
}

export interface IA2ATaskGetResponse {
  task: IA2ATask | null;
}

export interface IA2ATaskListParams {
  contextId?: string;
  state?: A2ATaskState[];
  limit?: number;
  offset?: number;
}

export interface IA2ATaskListResponse {
  tasks: IA2ATask[];
  total: number;
}

export interface IA2ATaskCancelParams {
  taskId: string;
  reason?: string;
}

export interface IA2ATaskCancelResponse {
  task: IA2ATask | null;
}

// ============================================================================
// Client-facing API Response Types
// ============================================================================

export type IA2AInterviewApiResponse =
  IApiResponse<IA2AInterviewRequestResponse>;
export type IA2ATaskApiResponse = IApiResponse<IA2ATask>;
export type IA2ATaskListApiResponse = IApiResponse<IA2ATaskListResponse>;

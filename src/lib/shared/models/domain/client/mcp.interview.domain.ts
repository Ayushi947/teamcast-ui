/**
 * MCP Interview Domain Models
 * Agent-initiated interview requests for skill assessment
 */

/**
 * Interview status enum
 */
export enum McpInterviewStatusEnum {
  INVITED = 'INVITED',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  EXPIRED = 'EXPIRED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  EVALUATING = 'EVALUATING',
  RESULTS_READY = 'RESULTS_READY',
  CANCELLED = 'CANCELLED',
}

/**
 * Assessment level enum
 */
export enum McpAssessmentLevelEnum {
  JUNIOR = 'JUNIOR',
  INTERMEDIATE = 'INTERMEDIATE',
  SENIOR = 'SENIOR',
  LEAD = 'LEAD',
}

/**
 * Skill proficiency level enum
 */
export enum McpSkillProficiencyEnum {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT',
}

/**
 * External candidate data structure
 */
export interface IMcpExternalCandidateData {
  name: string;
  email: string;
  phone?: string;
  currentTitle?: string;
  currentCompany?: string;
  yearsOfExperience?: number;
  linkedInUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  resumeUrl?: string;
  location?: string;
  timezone?: string;
  sourceSystem?: string;
  sourcedAt?: string;
  agentNotes?: string;
  externalCandidateId?: string;
}

/**
 * Job context shown to candidate
 */
export interface IMcpInterviewJobContext {
  title: string;
  company?: string;
  description?: string;
  location?: string;
}

/**
 * Per-skill result
 */
export interface IMcpInterviewSkillResult {
  id: string;
  interviewId: string;
  skillName: string;
  score: number | null;
  proficiencyLevel: McpSkillProficiencyEnum | null;
  strengths: string[];
  improvements: string[];
  feedback: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * MCP Interview domain model
 */
export interface IMcpInterview {
  id: string;
  candidateId: string | null;
  isNewCandidate: boolean;
  candidateData: IMcpExternalCandidateData | null;
  candidateEmail: string;
  candidateName: string;
  linkedUserId: string | null;
  mcpClientId: string;
  externalReferenceId: string | null;
  externalCandidateId: string | null;
  jobTitle: string | null;
  companyName: string | null;
  jobDescription: string | null;
  jobLocation: string | null;
  skillsToAssess: string[];
  assessmentLevel: McpAssessmentLevelEnum;
  customInstructions: string | null;
  status: McpInterviewStatusEnum;
  invitedAt: Date;
  acceptedAt: Date | null;
  declinedAt: Date | null;
  declineReason: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  resultsReadyAt: Date | null;
  expiresAt: Date;
  assessmentId: string | null;
  overallScore: number | null;
  recommendation: string | null;
  resultSummary: string | null;
  skillResults?: IMcpInterviewSkillResult[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interview landing page data (for candidate view)
 */
export interface IMcpInterviewLandingData {
  interviewId: string;
  status: McpInterviewStatusEnum;
  isExpired: boolean;
  candidateName: string;
  candidateEmail: string;
  isNewCandidate: boolean;
  jobTitle: string | null;
  companyName: string | null;
  jobDescription: string | null;
  jobLocation: string | null;
  skillsCount: number;
  expectedDurationMinutes: number | null;
  maxSections: number | null;
  estimatedDuration: number;
  expiresAt: Date;
}

/**
 * Accept interview input
 */
export interface IMcpInterviewAcceptInput {
  password?: string;
  acceptTerms?: boolean;
}

/**
 * Decline interview input
 */
export interface IMcpInterviewDeclineInput {
  reason?: string;
}

/**
 * Accept interview response
 */
export interface IMcpInterviewAcceptResponse {
  success: boolean;
  redirectUrl: string;
  message?: string;
}

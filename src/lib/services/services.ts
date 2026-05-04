import {
  AuthApiService,
  CandidateJobApplicationApiService,
  CandidateJobPostingApiService,
  CandidateOnboardingAssessmentApiService,
  CandidateProfileApiService,
  CandidateProfileSettingsService,
  CandidateResumeApiService,
  CandidateResumeAssessmentApiService,
  CandidateResumeParsingApiService,
  CandidateSignupApiService,
  CandidateSubscriptionApiService,
  ClientJobApplicationApiService,
  ClientJobPostingApiService,
  ClientProfileApiService,
  ClientSignupApiService,
  ClientSubscriptionApiService,
  ClientUserInvitationApiService,
  ClientUserManagementApiService,
  ClientUserProfileApiService,
  ClientProfileSetupApiService,
  PartnerSignupApiService,
  PartnerProfileApiService,
  PartnerUserManagementApiService,
  PartnerUserProfileApiService,
  PartnerProfileSetupApiService,
  SupportClientManagementApiService,
  SupportUserManagementApiService,
  DeelConfigurationApiService,
  VoiceApiService,
  LiveKitApiService,
  PartnerCandidateApiService,
  SupportLookupManagementApiService,
  PartnerUserInvitationApiService,
  ActivityLogApiService,
  PartnerJobPostingsApiService,
  LocationApiService,
  SupportPartnerManagementApiService,
  SupportCandidateManagementApiService,
  DocumentConfigApiService,
  OnboardingAssessmentSettingsApiService,
  OnboardingAssessmentGlobalSettingsApiService,
  PracticeAssessmentSettingsApiService,
  JobAiAssessmentGlobalSettingsApiService,
  GlobalSettingsApiService,
  SupportFeatureFlagApiService,
  SearchApiService,
  ClientDocumentApiService,
  PartnerDocumentApiService,
  StripeApiService,
  ClientAdminAnalyticsApiService,
  CandidateJobAiAssessmentApiService,
  CandidateJobAssessmentInviteApiService,
  ClientJobAiAssessmentInviteApiService,
  PublicPracticeAssessmentApiService,
  ClientPanelAssessmentApiService,
  CandidatePanelAssessmentApiService,
  ClientJobParsingApiService,
  SubscriptionLimitsApiService,
  ClientCandidateShortlistApiService,
  ClientCandidateApiService,
  ClientJobInviteApiService,
  WorkableIntegrationApiService,
  ClientJobPostingAssessmentApiService,
  ClientJobPostingRecommendationApiService,
  ClientResumeViewApiService,
  CandidateRecommendationApiService,
  IntegrationCommonApiService,
  SupportInvitationApiService,
  PartnerJobApplicationsApiService,
  AccountManagerAssignmentService,
  ClientAccountManagerService,
  SupportJobPostingApiService,
  SupportJobPostingInviteApiService,
  JobPostingRecruiterAssignmentApiService,
  SupportImpersonationApiService,
  SupportJobPostingRecommendationApiService,
  SupportDocumentApiService,
  // ADD: Support applications API service
  SupportJobApplicationApiService,
  // ADD: Support KPIs API service
  SupportKpisApiService,
  TourGuidanceApiService,
  TourDefinitionManagementApiService,
  SupportInvitationImportApiService,
  AccountManagerTicketsApiService,
  SupportTicketApiService,
  ClientSupportTicketApiService,
  SupportTicketActivityApiService,
  // ADD: Demo API service
  DemoApiService,
  DemoStorageService,
  CandidateSupportTicketApiService,
  SupportResumeViewApiService,
  OIDCApiService,
  McpClientApiService,
  McpInterviewPublicApiService,
  A2AInterviewApiService,
} from '@/lib/shared';
import { apiClient, publicApiClient } from '@/lib/api-client';
import { SupportPlatformUserApiService } from '@/lib/shared/services/support/platform.user.api.service';

export const authService = new AuthApiService(apiClient);

/**
 * Candidate services
 */

// Candidate application service
export const candidateApplicationService =
  new CandidateJobApplicationApiService(apiClient);

// Candidate job posting service
export const candidateJobPostingService = new CandidateJobPostingApiService(
  apiClient
);

// Candidate onboarding assessment service
export const candidateOnboardingAssessmentService =
  new CandidateOnboardingAssessmentApiService(apiClient);

// Client job ai assessment invite service
export const clientJobAiAssessmentInviteService =
  new ClientJobAiAssessmentInviteApiService(apiClient);

// Client job posting assessment service
export const clientJobPostingAssessmentService =
  new ClientJobPostingAssessmentApiService(apiClient);

// Candidate job assessment invite service
export const candidateJobAssessmentInviteService =
  new CandidateJobAssessmentInviteApiService(apiClient);

// Candidate job ai assessment service
export const candidateJobAiAssessmentService =
  new CandidateJobAiAssessmentApiService(apiClient);

// Public practice assessment service
// Public practice assessment service uses public API client (no auth required)
// Public practice assessment service - uses publicApiClient for unauthenticated endpoints
export const publicPracticeAssessmentService =
  new PublicPracticeAssessmentApiService(publicApiClient);

// Authenticated practice assessment service - uses apiClient for authenticated endpoints
export const candidatePracticeAssessmentService =
  new PublicPracticeAssessmentApiService(apiClient);

// Candidate profile service
export const candidateProfileService = new CandidateProfileApiService(
  apiClient
);

// Candidate resume assessment service
export const candidateResumeAssessmentService =
  new CandidateResumeAssessmentApiService(apiClient);

// Candidate profile settings service
export const candidateSettingsService = new CandidateProfileSettingsService(
  apiClient
);

// Candidate resume service
export const candidateResumeService = new CandidateResumeApiService(apiClient);

// Candidate resume parsing service
export const candidateResumeParsingService =
  new CandidateResumeParsingApiService(apiClient);

// Canidate signup service
export const candidateSignupService = new CandidateSignupApiService(apiClient);

// Candidate subscription service
export const candidateSubscriptionService = new CandidateSubscriptionApiService(
  apiClient
);

// Support user management service
export const supportUserManagementService = new SupportUserManagementApiService(
  apiClient
);

// Support platform user management service (support admin only)
export const supportPlatformUserService = new SupportPlatformUserApiService(
  apiClient
);

// Support client management service
export const supportClientManagementService =
  new SupportClientManagementApiService(apiClient);

// Deel configuration service
export const deelConfigurationService = new DeelConfigurationApiService(
  apiClient
);

// Support job posting recruiter assignment service
export const supportJobPostingRecruiterAssignmentService =
  new JobPostingRecruiterAssignmentApiService(apiClient);

/**
 * Voice services
 */

// Voice service
export const voiceService = new VoiceApiService(apiClient);

/**
 * LiveKit services
 */

// LiveKit service
export const liveKitService = new LiveKitApiService(apiClient);

/**
 * Client services
 */

// Client Job parsing service
export const clientJobParsingService = new ClientJobParsingApiService(
  apiClient
);

// Client job application service
export const clientJobApplicationService = new ClientJobApplicationApiService(
  apiClient
);

// ADD: Support job application service
export const supportJobApplicationService = new SupportJobApplicationApiService(
  apiClient
);

// Client job posting service
export const clientJobPostingService = new ClientJobPostingApiService(
  apiClient
);

// Client profile service
export const clientProfileService = new ClientProfileApiService(apiClient);

// Client signup service
export const clientSignupService = new ClientSignupApiService(apiClient);

// Client subscription service
export const clientSubscriptionService = new ClientSubscriptionApiService(
  apiClient
);

// Client user management service
export const clientUserManagementService = new ClientUserManagementApiService(
  apiClient
);

// MCP client management service
export const mcpClientService = new McpClientApiService(apiClient);

// MCP interview public service (for candidate interview acceptance)
export const mcpInterviewPublicService = new McpInterviewPublicApiService(
  publicApiClient
);

// A2A interview service (Agent-to-Agent protocol for interviews)
export const a2aInterviewService = new A2AInterviewApiService(publicApiClient);

// Client user invitation service
export const clientUserInvitationService = new ClientUserInvitationApiService(
  apiClient
);

// Client user profile service
export const clientUserProfileService = new ClientUserProfileApiService(
  apiClient
);

// Client profile setup service
export const clientProfileSetupService = new ClientProfileSetupApiService(
  apiClient
);

// Partner signup service
export const partnerSignupService = new PartnerSignupApiService(apiClient);

// Partner Invitation Service
export const partnerInvtiationService = new PartnerUserInvitationApiService(
  apiClient
);

// Support lookup service
export const supportLookupService = new SupportLookupManagementApiService(
  apiClient
);

// Partner profile service
export const partnerProfileService = new PartnerProfileApiService(apiClient);

// Partner user management service
export const partnerUserManagementService = new PartnerUserManagementApiService(
  apiClient
);

// Partner user invitation service
export const partnerUserInvitationService = new PartnerUserInvitationApiService(
  apiClient
);

// Partner user profile service
export const partnerUserProfileService = new PartnerUserProfileApiService(
  apiClient
);

// Partner candidate service
export const partnerCandidateService = new PartnerCandidateApiService(
  apiClient
);

// Location service
export const locationService = new LocationApiService(apiClient);

/**
 * Activity Log service
 */

export const activityLogService = new ActivityLogApiService(apiClient);

// Partner Job Posting Service
export const partnerJobPostingService = new PartnerJobPostingsApiService(
  apiClient
);

// Partner Job Applications Service
export const partnerJobApplicationsService =
  new PartnerJobApplicationsApiService(apiClient);

// Support partner management service
export const supportPartnerManagementService =
  new SupportPartnerManagementApiService(apiClient);

// Support candidate management service
export const supportCandidateManagementService =
  new SupportCandidateManagementApiService(apiClient);

// Support resume view service
export const supportResumeViewService = new SupportResumeViewApiService(
  apiClient
);

// Support user invitation service
export const supportInvitationService = new SupportInvitationApiService(
  apiClient
);

// Support invitation import service
export const supportInvitationImportService =
  new SupportInvitationImportApiService(apiClient);

// Support impersonation service
export const supportImpersonationApiService =
  new SupportImpersonationApiService(apiClient);

// Admin Document Api service
export const documentConfigService = new DocumentConfigApiService(apiClient);

// Onboarding Assessment Settings service
export const onboardingAssessmentSettingsService =
  new OnboardingAssessmentSettingsApiService(apiClient);

// Onboarding Assessment Global Settings service
export const onboardingAssessmentGlobalSettingsService =
  new OnboardingAssessmentGlobalSettingsApiService(apiClient);

// Practice Assessment Settings service
export const practiceAssessmentSettingsService =
  new PracticeAssessmentSettingsApiService(apiClient);

// Job AI Assessment Global Settings service
export const jobAiAssessmentGlobalSettingsService =
  new JobAiAssessmentGlobalSettingsApiService(apiClient);

export const globalSettingsService = new GlobalSettingsApiService(apiClient);

// Feature flag service
export const featureFlagService = new SupportFeatureFlagApiService(apiClient);

//Search Service
export const SearchService = new SearchApiService(apiClient);

// Client Document Api service
export const clientDocumentService = new ClientDocumentApiService(apiClient);

//Partner Document Api service
export const partnerDocumentService = new PartnerDocumentApiService(apiClient);

// Partner profile setup service
export const partnerProfileSetupService = new PartnerProfileSetupApiService(
  apiClient
);

// Stripe service
export const stripeService = new StripeApiService(apiClient);

// Client analysis
export const clientAnalyticsService = new ClientAdminAnalyticsApiService(
  apiClient
);

// Client panel interview service
export const clientPanelInterviewService = new ClientPanelAssessmentApiService(
  apiClient
);

// Candidate panel interview service
export const candidatePanelInterviewService =
  new CandidatePanelAssessmentApiService(apiClient);

export const subscriptionLimitsService = new SubscriptionLimitsApiService(
  apiClient
);

export const clientCandidateShortlistService =
  new ClientCandidateShortlistApiService(apiClient);

// Client candidate service (for onboarding assessment video chunks)
export const clientCandidateApiService = new ClientCandidateApiService(
  apiClient
);

export const clientJobInviteApiService = new ClientJobInviteApiService(
  apiClient
);

// Workable integration service
export const workableService = new WorkableIntegrationApiService(apiClient);

// Client candidate recommendation service
export const clientJobPostingRecommendationApiService =
  new ClientJobPostingRecommendationApiService(apiClient);

// Client resume view service
export const clientResumeViewService = new ClientResumeViewApiService(
  apiClient
);

export const candidateRecommendationApiService =
  new CandidateRecommendationApiService(apiClient);

export const integrationCommonService = new IntegrationCommonApiService(
  apiClient
);

export const supportAccountManagerAssignmentService =
  new AccountManagerAssignmentService(apiClient);
// Client account manager service
export const clientAccountManagerService = new ClientAccountManagerService(
  apiClient
);

// Support job posting service
export const supportJobPostingService = new SupportJobPostingApiService(
  apiClient
);

// Support job posting invite service
export const supportJobPostingInviteService =
  new SupportJobPostingInviteApiService(apiClient);

// Support job posting recommendation service
export const supportJobPostingRecommendationService =
  new SupportJobPostingRecommendationApiService(apiClient);

// Support Document Config service
export const supportDocumentConfigService = new SupportDocumentApiService(
  apiClient
);

// Support KPIs service
export const supportKpisService = new SupportKpisApiService(apiClient);

// Tour guidance service
export const tourGuidanceService = new TourGuidanceApiService(apiClient);

// Tour definition management service
export const tourDefinitionManagementService =
  new TourDefinitionManagementApiService(apiClient);

// Support account manager tickets service
export const supportAccountManagerTicketsService =
  new AccountManagerTicketsApiService(apiClient);

// Support ticket service (consolidated)
export const supportTicketService = new SupportTicketApiService(apiClient);

// Candidate support ticket service
export const candidateSupportTicketService =
  new CandidateSupportTicketApiService(apiClient);

// Support ticket audit service
export const supportTicketActivityService = new SupportTicketActivityApiService(
  apiClient
);

// Client support ticket service
export const clientSupportTicketService = new ClientSupportTicketApiService(
  apiClient
);

// Demo service
export const demoService = new DemoApiService(apiClient);

// Demo storage service
export const demoStorageService = new DemoStorageService();

// OIDC service
export const oidcService = new OIDCApiService(apiClient);

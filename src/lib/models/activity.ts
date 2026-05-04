import { ActivityModuleEnum } from '@/lib/shared';
import {
  Activity,
  Briefcase,
  Calendar,
  CheckCircle,
  Eye,
  FileText,
  Pencil,
  Trash,
  User,
  UserPlus,
  X,
  Shield,
  Building,
  Handshake,
  ClipboardList,
  BarChart3,
  Settings,
  CreditCard,
  Bell,
  MessageSquare,
  Mail,
  Clock,
  Star,
  Download,
  Upload,
  Archive,
  RefreshCw,
  XCircle,
  UserMinus,
  PlayCircle,
  PauseCircle,
  StopCircle,
} from 'lucide-react';

// Local interface extending the commons interface for filter in UI
export interface IActivityLogFilter {
  userId?: string;
  module?: string;
  action?: string;
  entityId?: string;
  entityType?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  status?: 'success' | 'failed' | 'pending';
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Pagination options for activity logs
export interface IPaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Activity log entry interface
export interface IActivityLogEntry {
  id: string;
  userId: string;
  userName?: string;
  module: string;
  action: string;
  entityId?: string;
  entityType?: string;
  description: string;
  metadata?: Record<string, any>;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'success' | 'failed' | 'pending';
}

export const ActivityTitleEnum = {
  // Candidate actions
  NEW_APPLICATION_SUBMITTED: 'New Application Submitted',
  APPLICATION_WITHDRAWN: 'Application Withdrawn',
  PROFILE_CREATED: 'Profile Created',
  PROFILE_UPDATED: 'Profile Updated',
  RESUME_UPLOADED: 'Resume Uploaded',
  COVER_LETTER_UPLOADED: 'Cover Letter Uploaded',
  AI_RESUME_SCREENING: 'AI Resume Screening',
  ASSESSMENT_COMPLETED: 'Screening Assessment Completed',
  PROFILE_ASSESSMENT_COMPLETED: 'Profile Assesment Completed',
  PROFILE_ASSESSMENT_FAILED: 'Profile Assesment Failed',

  // Recruiter/HR actions
  JOB_CREATED: 'Job Created',
  JOB_UPDATED: 'Job Updated',
  JOB_DELETED: 'Job Deleted',
  JOB_STATUS_UPDATED: 'Job Status Updated',
  APPLICATION_REVIEWED: 'Application Reviewed',
  CANDIDATE_SHORTLISTED: 'Candidate Shortlisted',
  CANDIDATE_UNSHORTLISTED: 'Candidate Removed from Shortlist',
  INTERVIEW_SCHEDULED: 'Interview Scheduled',
  INTERVIEW_RESCHEDULED: 'Interview Rescheduled',
  INTERVIEW_CANCELED: 'Interview Canceled',
  OFFER_EXTENDED: 'Offer Extended',
  OFFER_REVOKED: 'Offer Revoked',
  OFFER_ACCEPTED: 'Offer Accepted',
  OFFER_DECLINED: 'Offer Declined',
  APPLICATION_REJECTED: 'Application Rejected',
  COMMENT_ADDED: 'Comment Added',
  NOTE_ADDED: 'Internal Note Added',

  // Admin/system actions
  USER_CREATED: 'User Account Created',
  USER_DELETED: 'User Account Deleted',
  ROLE_ASSIGNED: 'User Role Assigned',
  PASSWORD_RESET: 'Password Reset',
  EMAIL_VERIFIED: 'Email Verified',
  LOGIN_SUCCESS: 'User Logged In',
  LOGIN_FAILED: 'Failed Login Attempt',
  ACCOUNT_LOCKED: 'Account Locked Due to Failed Attempts',
  TWO_FACTOR_ENABLED: 'Two-Factor Authentication Enabled',
  TWO_FACTOR_DISABLED: 'Two-Factor Authentication Disabled',
  COMPANY_VERIFIED: 'Company Verified',
  COMPANY_UNVERIFIED: 'Company Unverified',

  // Communication
  EMAIL_SENT_TO_CANDIDATE: 'Email Sent to Candidate',
  EMAIL_RECEIVED_FROM_CANDIDATE: 'Email Received from Candidate',
  MESSAGE_SENT: 'Message Sent',
  MESSAGE_RECEIVED: 'Message Received',
  NOTIFICATION_SENT: 'Notification Sent',

  // Client
  INVITE_CANDIDATE: 'Invitation Sent to Candidate',
};

// Enhanced activity action enums
export const ActivityActionEnums = {
  // CRUD Operations
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  VIEW: 'VIEW',
  READ: 'READ',

  // Application/Job related
  APPLY: 'APPLY',
  REJECT: 'REJECT',
  HIRE: 'HIRE',
  SHORTLIST: 'SHORTLIST',
  WITHDRAW: 'WITHDRAW',

  // Authentication
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  REGISTER: 'REGISTER',
  PASSWORD_RESET: 'PASSWORD_RESET',
  PASSWORD_CHANGE: 'PASSWORD_CHANGE',
  EMAIL_VERIFICATION_REQUEST: 'EMAIL_VERIFICATION_REQUEST',
  EMAIL_VERIFICATION_SUCCESS: 'EMAIL_VERIFICATION_SUCCESS',
  EMAIL_VERIFICATION_FAILED: 'EMAIL_VERIFICATION_FAILED',

  // Communication
  SEND_MESSAGE: 'SEND_MESSAGE',
  SEND_EMAIL: 'SEND_EMAIL',
  SCHEDULE_INTERVIEW: 'SCHEDULE_INTERVIEW',
  RESCHEDULE_INTERVIEW: 'RESCHEDULE_INTERVIEW',
  CANCEL_INTERVIEW: 'CANCEL_INTERVIEW',

  // Status changes
  ACTIVATE: 'ACTIVATE',
  DEACTIVATE: 'DEACTIVATE',
  SUSPEND: 'SUSPEND',
  ARCHIVE: 'ARCHIVE',
  RESTORE: 'RESTORE',

  // File operations
  UPLOAD: 'UPLOAD',
  DOWNLOAD: 'DOWNLOAD',
  EXPORT: 'EXPORT',
  IMPORT: 'IMPORT',

  // Assessment
  START_ASSESSMENT: 'START_ASSESSMENT',
  COMPLETE_ASSESSMENT: 'COMPLETE_ASSESSMENT',
  GRADE_ASSESSMENT: 'GRADE_ASSESSMENT',
  FAIL_ASSESSMENT: 'FAIL_ASSESSMENT',

  // System
  BACKUP: 'BACKUP',
  SYNC: 'SYNC',
  REFRESH: 'REFRESH',
  CONFIGURE: 'CONFIGURE',

  INVITE_CANDIDATE: 'INVITE_CANDIDATE',
  COMPANY_VERIFIED: 'COMPANY_VERIFIED',
  COMPANY_UNVERIFIED: 'COMPANY_UNVERIFIED',
} as const;

// Activity severity levels
export const ActivitySeverityEnum = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

// Activity status enum
export const ActivityStatusEnum = {
  SUCCESS: 'success',
  FAILED: 'failed',
  PENDING: 'pending',
} as const;

// Enhanced color mappings for activity modules
export const ActivityModuleColors: Record<string, string> = {
  [ActivityModuleEnum.AUTH]: 'emerald',
  [ActivityModuleEnum.CANDIDATE]: 'green',
  [ActivityModuleEnum.CLIENT]: 'purple',
  [ActivityModuleEnum.PARTNER]: 'indigo',
  [ActivityModuleEnum.JOB]: 'blue',
  [ActivityModuleEnum.APPLICATION]: 'orange',
  [ActivityModuleEnum.ASSESSMENT]: 'pink',
  [ActivityModuleEnum.SYSTEM]: 'gray',
  [ActivityModuleEnum.SUBSCRIPTION]: 'cyan',
  [ActivityModuleEnum.NOTIFICATION]: 'teal',
  INTERVIEW: 'amber',
  PROFILE: 'violet',
  COMMUNICATION: 'rose',
  DOCUMENT: 'slate',
};

// Comprehensive icon mapping
export const getActivityIcon = (module: string, action: string) => {
  // First check for action-specific icons
  const actionIcons = {
    [ActivityActionEnums.CREATE]: UserPlus,
    [ActivityActionEnums.UPDATE]: Pencil,
    [ActivityActionEnums.DELETE]: Trash,
    [ActivityActionEnums.VIEW]: Eye,
    [ActivityActionEnums.READ]: Eye,
    [ActivityActionEnums.APPLY]: FileText,
    [ActivityActionEnums.REJECT]: X,
    [ActivityActionEnums.HIRE]: CheckCircle,
    [ActivityActionEnums.SHORTLIST]: Star,
    [ActivityActionEnums.WITHDRAW]: UserMinus,
    [ActivityActionEnums.LOGIN]: Shield,
    [ActivityActionEnums.LOGOUT]: Shield,
    [ActivityActionEnums.REGISTER]: UserPlus,
    [ActivityActionEnums.PASSWORD_RESET]: RefreshCw,
    [ActivityActionEnums.PASSWORD_CHANGE]: Settings,
    [ActivityActionEnums.EMAIL_VERIFICATION_REQUEST]: Mail,
    [ActivityActionEnums.EMAIL_VERIFICATION_SUCCESS]: CheckCircle,
    [ActivityActionEnums.EMAIL_VERIFICATION_FAILED]: XCircle,
    [ActivityActionEnums.SEND_MESSAGE]: MessageSquare,
    [ActivityActionEnums.SEND_EMAIL]: Mail,
    [ActivityActionEnums.SCHEDULE_INTERVIEW]: Calendar,
    [ActivityActionEnums.RESCHEDULE_INTERVIEW]: Clock,
    [ActivityActionEnums.CANCEL_INTERVIEW]: XCircle,
    [ActivityActionEnums.ACTIVATE]: PlayCircle,
    [ActivityActionEnums.DEACTIVATE]: PauseCircle,
    [ActivityActionEnums.SUSPEND]: StopCircle,
    [ActivityActionEnums.ARCHIVE]: Archive,
    [ActivityActionEnums.RESTORE]: RefreshCw,
    [ActivityActionEnums.UPLOAD]: Upload,
    [ActivityActionEnums.DOWNLOAD]: Download,
    [ActivityActionEnums.EXPORT]: Download,
    [ActivityActionEnums.IMPORT]: Upload,
    [ActivityActionEnums.START_ASSESSMENT]: PlayCircle,
    [ActivityActionEnums.COMPLETE_ASSESSMENT]: CheckCircle,
    [ActivityActionEnums.GRADE_ASSESSMENT]: BarChart3,
    [ActivityActionEnums.BACKUP]: Archive,
    [ActivityActionEnums.SYNC]: RefreshCw,
    [ActivityActionEnums.REFRESH]: RefreshCw,
    [ActivityActionEnums.CONFIGURE]: Settings,
    [ActivityActionEnums.COMPANY_VERIFIED]: CheckCircle,
    [ActivityActionEnums.COMPANY_UNVERIFIED]: XCircle,
  };

  // Then check for module-specific icons
  const moduleIcons = {
    [ActivityModuleEnum.AUTH]: Shield,
    [ActivityModuleEnum.JOB]: Briefcase,
    [ActivityModuleEnum.APPLICATION]: FileText,
    [ActivityModuleEnum.CANDIDATE]: User,
    [ActivityModuleEnum.CLIENT]: Building,
    [ActivityModuleEnum.PARTNER]: Handshake,
    [ActivityModuleEnum.ASSESSMENT]: ClipboardList,
    [ActivityModuleEnum.SYSTEM]: Settings,
    [ActivityModuleEnum.SUBSCRIPTION]: CreditCard,
    [ActivityModuleEnum.NOTIFICATION]: Bell,
    INTERVIEW: Calendar,
    PROFILE: User,
    COMMUNICATION: MessageSquare,
    DOCUMENT: FileText,
  };

  return (
    actionIcons[action as keyof typeof actionIcons] ||
    moduleIcons[module as keyof typeof moduleIcons] ||
    Activity
  );
};

// Enhanced color utility with better organization
export const getActivityColor = (
  module: string,
  variant: 'default' | 'light' | 'dark' = 'default'
) => {
  const colorMap = {
    [ActivityModuleEnum.AUTH]: {
      default: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      light: 'text-emerald-500 bg-emerald-25 border-emerald-100',
      dark: 'text-emerald-400 bg-emerald-900/30 border-emerald-700',
    },
    [ActivityModuleEnum.JOB]: {
      default: 'text-blue-600 bg-blue-50 border-blue-200',
      light: 'text-blue-500 bg-blue-25 border-blue-100',
      dark: 'text-blue-400 bg-blue-900/30 border-blue-700',
    },
    [ActivityModuleEnum.APPLICATION]: {
      default: 'text-orange-600 bg-orange-50 border-orange-200',
      light: 'text-orange-500 bg-orange-25 border-orange-100',
      dark: 'text-orange-400 bg-orange-900/30 border-orange-700',
    },
    [ActivityModuleEnum.CANDIDATE]: {
      default: 'text-green-600 bg-green-50 border-green-200',
      light: 'text-green-500 bg-green-25 border-green-100',
      dark: 'text-green-400 bg-green-900/30 border-green-700',
    },
    [ActivityModuleEnum.CLIENT]: {
      default: 'text-purple-600 bg-purple-50 border-purple-200',
      light: 'text-purple-500 bg-purple-25 border-purple-100',
      dark: 'text-purple-400 bg-purple-900/30 border-purple-700',
    },
    [ActivityModuleEnum.PARTNER]: {
      default: 'text-indigo-600 bg-indigo-50 border-indigo-200',
      light: 'text-indigo-500 bg-indigo-25 border-indigo-100',
      dark: 'text-indigo-400 bg-indigo-900/30 border-indigo-700',
    },
    [ActivityModuleEnum.ASSESSMENT]: {
      default: 'text-pink-600 bg-pink-50 border-pink-200',
      light: 'text-pink-500 bg-pink-25 border-pink-100',
      dark: 'text-pink-400 bg-pink-900/30 border-pink-700',
    },
    [ActivityModuleEnum.SYSTEM]: {
      default: 'text-gray-600 bg-gray-50 border-gray-200',
      light: 'text-gray-500 bg-gray-25 border-gray-100',
      dark: 'text-gray-400 bg-gray-800/50 border-gray-700',
    },
    [ActivityModuleEnum.SUBSCRIPTION]: {
      default: 'text-cyan-600 bg-cyan-50 border-cyan-200',
      light: 'text-cyan-500 bg-cyan-25 border-cyan-100',
      dark: 'text-cyan-400 bg-cyan-900/30 border-cyan-700',
    },
    [ActivityModuleEnum.NOTIFICATION]: {
      default: 'text-teal-600 bg-teal-50 border-teal-200',
      light: 'text-teal-500 bg-teal-25 border-teal-100',
      dark: 'text-teal-400 bg-teal-900/30 border-teal-700',
    },
    INTERVIEW: {
      default: 'text-amber-600 bg-amber-50 border-amber-200',
      light: 'text-amber-500 bg-amber-25 border-amber-100',
      dark: 'text-amber-400 bg-amber-900/30 border-amber-700',
    },
    PROFILE: {
      default: 'text-violet-600 bg-violet-50 border-violet-200',
      light: 'text-violet-500 bg-violet-25 border-violet-100',
      dark: 'text-violet-400 bg-violet-900/30 border-violet-700',
    },
    COMMUNICATION: {
      default: 'text-rose-600 bg-rose-50 border-rose-200',
      light: 'text-rose-500 bg-rose-25 border-rose-100',
      dark: 'text-rose-400 bg-rose-900/30 border-rose-700',
    },
    DOCUMENT: {
      default: 'text-slate-600 bg-slate-50 border-slate-200',
      light: 'text-slate-500 bg-slate-25 border-slate-100',
      dark: 'text-slate-400 bg-slate-800/50 border-slate-700',
    },
  };

  const colors = colorMap[module as keyof typeof colorMap];
  return colors
    ? colors[variant]
    : colorMap[ActivityModuleEnum.SYSTEM][variant];
};

// Severity color mapping
export const getSeverityColor = (severity: string) => {
  const severityColors = {
    low: 'text-green-600 bg-green-50 border-green-200',
    medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    high: 'text-orange-600 bg-orange-50 border-orange-200',
    critical: 'text-red-600 bg-red-50 border-red-200',
  };
  return (
    severityColors[severity as keyof typeof severityColors] ||
    severityColors.low
  );
};

// Status color mapping
export const getStatusColor = (status: string) => {
  const statusColors = {
    success: 'text-green-600 bg-green-50 border-green-200',
    failed: 'text-red-600 bg-red-50 border-red-200',
    pending: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  };
  return (
    statusColors[status as keyof typeof statusColors] || statusColors.pending
  );
};

// Utility to format activity description
export const formatActivityDescription = (
  action: string,
  module: string,
  entityType?: string,
  entityId?: string,
  _metadata?: Record<string, any>
): string => {
  const actionText = action.toLowerCase().replace('_', ' ');
  const moduleText = module.toLowerCase();
  const entityText = entityType ? ` ${entityType.toLowerCase()}` : '';
  const idText = entityId ? ` (ID: ${entityId})` : '';

  return `${actionText} ${moduleText}${entityText}${idText}`;
};

// Utility to get readable timestamp
export const getRelativeTime = (timestamp: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor(
    (now.getTime() - timestamp.getTime()) / 1000
  );

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000)
    return `${Math.floor(diffInSeconds / 86400)} days ago`;

  return timestamp.toLocaleDateString();
};

// Filter utilities
export const createActivityFilter = (
  baseFilter: Partial<IActivityLogFilter> = {}
): IActivityLogFilter => {
  return {
    page: 1,
    limit: 50,
    sortBy: 'timestamp',
    sortOrder: 'desc',
    ...baseFilter,
  };
};

// Default pagination
export const defaultPagination: IPaginationOptions = {
  page: 1,
  limit: 50,
  sortBy: 'timestamp',
  sortOrder: 'desc',
};

// Activity module labels for UI
export const ActivityModuleLabels = {
  [ActivityModuleEnum.AUTH]: 'Authentication',
  [ActivityModuleEnum.CANDIDATE]: 'Candidate Management',
  [ActivityModuleEnum.CLIENT]: 'Client Management',
  [ActivityModuleEnum.PARTNER]: 'Partner Management',
  [ActivityModuleEnum.JOB]: 'Job Management',
  [ActivityModuleEnum.APPLICATION]: 'Application Management',
  [ActivityModuleEnum.ASSESSMENT]: 'Assessment Management',
  [ActivityModuleEnum.SYSTEM]: 'System Operations',
  [ActivityModuleEnum.SUBSCRIPTION]: 'Subscription Management',
  [ActivityModuleEnum.NOTIFICATION]: 'Notification Management',
  INTERVIEW: 'Interview Management',
  PROFILE: 'Profile Management',
  COMMUNICATION: 'Communication',
  DOCUMENT: 'Document Management',
};

// Activity action labels for UI
export const ActivityActionLabels = {
  [ActivityActionEnums.CREATE]: 'Created',
  [ActivityActionEnums.UPDATE]: 'Updated',
  [ActivityActionEnums.DELETE]: 'Deleted',
  [ActivityActionEnums.VIEW]: 'Viewed',
  [ActivityActionEnums.READ]: 'Read',
  [ActivityActionEnums.APPLY]: 'Applied',
  [ActivityActionEnums.REJECT]: 'Rejected',
  [ActivityActionEnums.HIRE]: 'Hired',
  [ActivityActionEnums.SHORTLIST]: 'Shortlisted',
  [ActivityActionEnums.WITHDRAW]: 'Withdrawn',
  [ActivityActionEnums.LOGIN]: 'Logged In',
  [ActivityActionEnums.LOGOUT]: 'Logged Out',
  [ActivityActionEnums.REGISTER]: 'Registered',
  [ActivityActionEnums.PASSWORD_RESET]: 'Password Reset',
  [ActivityActionEnums.PASSWORD_CHANGE]: 'Password Changed',
  [ActivityActionEnums.EMAIL_VERIFICATION_REQUEST]:
    'Email Verification Requested',
  [ActivityActionEnums.EMAIL_VERIFICATION_SUCCESS]: 'Email Verified',
  [ActivityActionEnums.EMAIL_VERIFICATION_FAILED]: 'Email Verification Failed',
  [ActivityActionEnums.SEND_MESSAGE]: 'Message Sent',
  [ActivityActionEnums.SEND_EMAIL]: 'Email Sent',
  [ActivityActionEnums.SCHEDULE_INTERVIEW]: 'Interview Scheduled',
  [ActivityActionEnums.RESCHEDULE_INTERVIEW]: 'Interview Rescheduled',
  [ActivityActionEnums.CANCEL_INTERVIEW]: 'Interview Cancelled',
  [ActivityActionEnums.ACTIVATE]: 'Activated',
  [ActivityActionEnums.DEACTIVATE]: 'Deactivated',
  [ActivityActionEnums.SUSPEND]: 'Suspended',
  [ActivityActionEnums.ARCHIVE]: 'Archived',
  [ActivityActionEnums.RESTORE]: 'Restored',
  [ActivityActionEnums.UPLOAD]: 'Uploaded',
  [ActivityActionEnums.DOWNLOAD]: 'Downloaded',
  [ActivityActionEnums.EXPORT]: 'Exported',
  [ActivityActionEnums.IMPORT]: 'Imported',
  [ActivityActionEnums.START_ASSESSMENT]: 'Assessment Started',
  [ActivityActionEnums.COMPLETE_ASSESSMENT]: 'Assessment Completed',
  [ActivityActionEnums.GRADE_ASSESSMENT]: 'Assessment Graded',
  [ActivityActionEnums.BACKUP]: 'Backup Created',
  [ActivityActionEnums.SYNC]: 'Synchronized',
  [ActivityActionEnums.REFRESH]: 'Refreshed',
  [ActivityActionEnums.CONFIGURE]: 'Configured',
  [ActivityActionEnums.COMPANY_VERIFIED]: 'Company Verified',
  [ActivityActionEnums.COMPANY_UNVERIFIED]: 'Company Unverified',
};

// Type guards
export const isValidActivityModule = (
  module: string
): module is ActivityModuleEnum => {
  return Object.values(ActivityModuleEnum).includes(
    module as ActivityModuleEnum
  );
};

export const isValidActivityAction = (action: string): boolean => {
  return Object.values(ActivityActionEnums).includes(action as any);
};

export const isValidSeverity = (
  severity: string
): severity is 'low' | 'medium' | 'high' | 'critical' => {
  return ['low', 'medium', 'high', 'critical'].includes(severity);
};

export const isValidStatus = (
  status: string
): status is 'success' | 'failed' | 'pending' => {
  return ['success', 'failed', 'pending'].includes(status);
};

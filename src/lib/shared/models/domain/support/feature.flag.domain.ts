import {
  FeatureFlagCategoryEnum,
  UserTypeEnum,
  UserRoleEnum,
} from '../../common/enums';

/**
 * @openapi
 * components:
 *   schemas:
 *     IFeatureFlag:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         key: { type: string }
 *         name: { type: string }
 *         description: { type: string, nullable: true }
 *         enabled: { type: boolean }
 *         category: { $ref: '#/components/schemas/FeatureFlagCategoryEnum' }
 *         targetUserType: { $ref: '#/components/schemas/UserTypeEnum', nullable: true }
 *         targetUserRole: { $ref: '#/components/schemas/UserRoleEnum', nullable: true }
 *         clientId: { type: string, format: uuid, nullable: true }
 *         rolloutPercentage: { type: integer, minimum: 0, maximum: 100 }
 *         metadata: { type: object, nullable: true }
 *         createdBy: { type: string, nullable: true }
 *         updatedBy: { type: string, nullable: true }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 */
export interface IFeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string | null;
  enabled: boolean;
  category: FeatureFlagCategoryEnum;
  targetUserType: UserTypeEnum | null;
  targetUserRole: UserRoleEnum | null;
  clientId: string | null;
  rolloutPercentage: number;
  metadata: any | null;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IFeatureFlagCreate {
  key: string;
  name: string;
  description?: string;
  enabled?: boolean;
  category?: FeatureFlagCategoryEnum;
  targetUserType?: UserTypeEnum;
  targetUserRole?: UserRoleEnum;
  clientId?: string;
  rolloutPercentage?: number;
  metadata?: any;
}

export interface IFeatureFlagUpdate {
  name?: string;
  description?: string;
  enabled?: boolean;
  category?: FeatureFlagCategoryEnum;
  targetUserType?: UserTypeEnum | null;
  targetUserRole?: UserRoleEnum | null;
  clientId?: string | null;
  rolloutPercentage?: number;
  metadata?: any;
}

/**
 * Query params for listing feature flags with search, filters and pagination.
 */
export interface IFeatureFlagListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  enabled?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/** One item in a preset (snapshot of flag config) */
export interface IFeatureFlagPresetItem {
  key: string;
  name: string;
  description?: string | null;
  enabled: boolean;
  category: FeatureFlagCategoryEnum;
  targetUserType?: UserTypeEnum | null;
  targetUserRole?: UserRoleEnum | null;
  rolloutPercentage?: number;
  metadata?: any;
}

export interface IFeatureFlagPreset {
  id: string;
  name: string;
  description: string | null;
  flagConfigs: IFeatureFlagPresetItem[];
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IFeatureFlagPresetCreate {
  name: string;
  description?: string | null;
  flagConfigs: IFeatureFlagPresetItem[];
}

export interface IFeatureFlagPresetUpdate {
  name?: string;
  description?: string | null;
  flagConfigs?: IFeatureFlagPresetItem[];
}

export type FeatureFlagScheduleAction = 'ENABLE' | 'DISABLE';
export type FeatureFlagScheduleStatus = 'PENDING' | 'APPLIED' | 'CANCELLED';

export interface IFeatureFlagSchedule {
  id: string;
  featureFlagId: string;
  clientId: string | null;
  scheduledAt: string;
  action: FeatureFlagScheduleAction;
  status: FeatureFlagScheduleStatus;
  createdBy: string | null;
  createdAt: string;
  appliedAt: string | null;
}

export interface IFeatureFlagScheduleCreate {
  featureFlagId: string;
  clientId?: string | null;
  scheduledAt: string;
  action: FeatureFlagScheduleAction;
}

/** Common feature flag keys */
export const FEATURE_FLAGS = {
  FACE_DETECTION_ENABLED: 'FACE_DETECTION_ENABLED',
  TOUR_GUIDE_ENABLED: 'TOUR_GUIDE_ENABLED',
  SUPPORT_TICKET_ENABLED: 'SUPPORT_TICKET_ENABLED',
  AI_PROCTORING_ENABLED: 'AI_PROCTORING_ENABLED',
  VIDEO_RECORDING_ENABLED: 'VIDEO_RECORDING_ENABLED',
  LIVE_INTERVIEW_ENABLED: 'LIVE_INTERVIEW_ENABLED',
  ADVANCED_ANALYTICS_ENABLED: 'ADVANCED_ANALYTICS_ENABLED',
  ASSESSMENT_SYSTEM_CHECK_NEW_UI: 'ASSESSMENT_SYSTEM_CHECK_NEW_UI',
  ASSESSMENT_CAMERA_PREVIEW_ENHANCED: 'ASSESSMENT_CAMERA_PREVIEW_ENHANCED',
  ASSESSMENT_INSTRUCTIONS_NEW_UI: 'ASSESSMENT_INSTRUCTIONS_NEW_UI',
} as const;

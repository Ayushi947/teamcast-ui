/**
 * Re-export from lib/shared for backward compatibility
 */
export {
  FeatureFlagCategoryEnum as FeatureFlagCategory,
  UserTypeEnum as UserType,
  UserRoleEnum,
  FEATURE_FLAGS,
} from '@/lib/shared';

export type {
  IFeatureFlag,
  IFeatureFlagCreate,
  IFeatureFlagUpdate,
} from '@/lib/shared';

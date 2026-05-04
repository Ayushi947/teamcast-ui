import { toast } from 'sonner';
import { supportImpersonationApiService } from '@/lib/services/services';
import { useApp } from '@/lib/context/app-context';
import { setUser, setToken, getUser, getToken } from '@/lib/utils/auth-utils';
import { UserTypeEnum, UserRoleEnum } from '@/lib/shared/models/common/enums';
import { useRouter } from 'next/navigation';

const IMPERSONATION_KEYS = {
  IS_IMPERSONATING: 'is_impersonating',
  ORIGINAL_SESSION: 'original_session',
  IMPERSONATION_DATA: 'impersonation_data',
} as const;

/**
 * Check if the current user is a support user who can perform impersonation
 * Support recruiters can only impersonate candidates, while admins and technical support can impersonate any user
 */
export const canPerformImpersonation = (user: any): boolean => {
  return (
    user?.type === UserTypeEnum.SUPPORT &&
    (user?.role === UserRoleEnum.ADMIN ||
      user?.role === UserRoleEnum.TECHNICAL_SUPPORT ||
      user?.role === UserRoleEnum.RECRUITER)
  );
};

/**
 * Check if the current user can impersonate client users (admin or account manager)
 */
export const canImpersonateClientUsers = (user: any): boolean => {
  return (
    user?.type === UserTypeEnum.SUPPORT &&
    (user?.role === UserRoleEnum.ADMIN ||
      user?.role === UserRoleEnum.ACCOUNT_MANAGER ||
      user?.role === UserRoleEnum.TECHNICAL_SUPPORT)
  );
};

export const useImpersonation = () => {
  const { setUser: setAppUser, setToken: setAppToken } = useApp();
  const router = useRouter();

  const startImpersonation = async (
    targetUserId: string,
    targetUserType: UserTypeEnum,
    reason?: string
  ) => {
    try {
      const originalUser = getUser();
      const originalToken = getToken();

      if (!originalUser || !originalToken) {
        throw new Error('No original session found');
      }

      const originalSession = {
        user: originalUser,
        token: originalToken,
      };

      localStorage.setItem(
        IMPERSONATION_KEYS.ORIGINAL_SESSION,
        JSON.stringify(originalSession)
      );

      const response = await supportImpersonationApiService.startImpersonation({
        targetUserId,
        targetUserType,
        reason,
      });

      localStorage.setItem(IMPERSONATION_KEYS.IS_IMPERSONATING, 'true');

      const impersonationData = {
        targetUserId,
        targetUserType,
        reason,
        impersonationId: response.impersonationId,
        startedAt: new Date().toISOString(),
        duration: 0, // Will be calculated when session ends
        targetUserImage: response.targetUserImage || '', // Get image from the response
        supportUserName: originalUser.name,
        supportUserEmail: originalUser.email,
        supportUserImage: response.supportUserImage || '', // Get support admin image from response
      };

      localStorage.setItem(
        IMPERSONATION_KEYS.IMPERSONATION_DATA,
        JSON.stringify(impersonationData)
      );

      setAppUser(response.user);
      setAppToken(response.token);

      setUser(response.user);
      setToken(response.token);

      toast.success(`Now signed in as ${response.user.name}`);

      const dashboardPath = getDashboardPath(
        response.user.type,
        response.user.role
      );
      router.push(dashboardPath);
    } catch (error) {
      let errorMessage = 'Failed to start impersonation. Please try again.';

      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as {
          response?: { data?: { message?: string } };
        };
        if (apiError.response?.data?.message) {
          errorMessage = apiError.response.data.message;
        }
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = (error as { message: string }).message;
      }

      toast.error(errorMessage);
    }
  };

  const stopImpersonation = async () => {
    try {
      const isImpersonating = localStorage.getItem(
        IMPERSONATION_KEYS.IS_IMPERSONATING
      );
      if (!isImpersonating) {
        toast.error('No active session found.');
        return;
      }

      const impersonationDataStr = localStorage.getItem(
        IMPERSONATION_KEYS.IMPERSONATION_DATA
      );
      if (!impersonationDataStr) {
        toast.error('No session data found.');
        return;
      }

      const impersonationData = JSON.parse(impersonationDataStr);
      const impersonationId = impersonationData.impersonationId;

      if (!impersonationId) {
        toast.error('No active session found.');
        return;
      }

      const response = await supportImpersonationApiService.stopImpersonation({
        impersonationId,
      });

      localStorage.removeItem(IMPERSONATION_KEYS.IS_IMPERSONATING);
      localStorage.removeItem(IMPERSONATION_KEYS.IMPERSONATION_DATA);
      localStorage.removeItem(IMPERSONATION_KEYS.ORIGINAL_SESSION);

      setAppUser(response.user);
      setAppToken(response.token);

      setUser(response.user);
      setToken(response.token);

      toast.success('Signed out. Back to support view.');

      router.push('/app/support/dashboard');
    } catch (_error) {
      toast.error('Failed to sign out. Please log in again.');

      // Only clear impersonation-related keys, not all localStorage
      localStorage.removeItem(IMPERSONATION_KEYS.IS_IMPERSONATING);
      localStorage.removeItem(IMPERSONATION_KEYS.IMPERSONATION_DATA);
      localStorage.removeItem(IMPERSONATION_KEYS.ORIGINAL_SESSION);
      router.push('/app/auth/login');
    }
  };

  const getDashboardPath = (
    userType: UserTypeEnum,
    userRole?: string
  ): string => {
    switch (userType) {
      case UserTypeEnum.CANDIDATE:
        return '/app/candidate/dashboard';
      case UserTypeEnum.CLIENT:
        return '/app/client/dashboard';
      case UserTypeEnum.PARTNER:
        if (userRole === UserRoleEnum.PARTNER_RESOURCE) {
          return '/app/candidate/dashboard';
        }
        return '/app/partner/dashboard';
      default:
        return '/app/support/dashboard';
    }
  };

  const isImpersonating = (): boolean => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(IMPERSONATION_KEYS.IS_IMPERSONATING) === 'true';
  };

  const getImpersonationData = () => {
    if (typeof window === 'undefined') return null;
    const dataStr = localStorage.getItem(IMPERSONATION_KEYS.IMPERSONATION_DATA);
    return dataStr ? JSON.parse(dataStr) : null;
  };

  return {
    startImpersonation,
    stopImpersonation,
    isImpersonating,
    getImpersonationData,
  };
};

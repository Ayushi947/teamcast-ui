import { IActivityLog } from '@/lib/shared';

/**
 * Custom interface to match the actual API response structure
 */
export interface ActivityLogResponse {
  success: boolean;
  message?: string;
  data: {
    data: IActivityLog[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

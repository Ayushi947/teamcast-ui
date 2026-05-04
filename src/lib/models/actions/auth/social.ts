import { IAuthUser } from '@/lib/shared';
import { IDataActionResult } from '../common/common';

export interface ISocialLoginActionResult
  extends IDataActionResult<{
    user: IAuthUser;
  }> {}

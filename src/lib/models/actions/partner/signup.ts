import { IAuthUser } from '@/lib/shared';
import { IDataActionResult } from '../common/common';

export interface IPartnerSignupActionResult
  extends IDataActionResult<{
    user: IAuthUser;
  }> {}

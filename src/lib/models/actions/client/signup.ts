import { IAuthUser } from '@/lib/shared';
import { IDataActionResult } from '../common/common';

export interface IClientSignupActionResult
  extends IDataActionResult<{
    user: IAuthUser;
  }> {}

import { IAuthUser } from '@/lib/shared';
import { IDataActionResult } from '../common/common';

export interface ILoginActionResult
  extends IDataActionResult<{
    user: IAuthUser;
  }> {}

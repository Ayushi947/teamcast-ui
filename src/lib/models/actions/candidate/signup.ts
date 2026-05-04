import { IAuthUser, IAuthToken } from '@/lib/shared';
import { IDataActionResult } from '../common/common';

export interface ICandidateSignupActionResult
  extends IDataActionResult<{
    user: IAuthUser;
    token?: IAuthToken;
  }> {}

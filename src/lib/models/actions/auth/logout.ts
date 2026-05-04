import { IActionResult } from '../common/common';

export interface ILogoutActionResult extends IActionResult {
  logoutUrl?: string;
}

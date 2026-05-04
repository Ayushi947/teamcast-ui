export interface IActionResult {
  success: boolean;
  error?: string;
}

export interface IDataActionResult<T> extends IActionResult {
  data?: T;
}

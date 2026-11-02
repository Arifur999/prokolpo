// The envelope every service returns and every _action.ts resolves to.
// Callers narrow on `success` and never touch an axios error.
// Key names match prokolpo-backend's envelope (README, "API contract").
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<TData = unknown> {
  success: true;
  message: string;
  data: TData;
  meta?: PaginationMeta;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  fieldErrors?: Record<string, string>;
}

export type ApiResult<TData = unknown> = ApiResponse<TData> | ApiErrorResponse;

// What the API sends on the wire. httpClient unwraps the success body; actionError reads the error body.
export interface IApiFieldError {
  path: string;
  message: string;
}

export interface IApiSuccessBody<TData> {
  success: true;
  message: string;
  data: TData;
  meta?: PaginationMeta;
}

export interface IApiErrorBody {
  success: false;
  message: string;
  errorSource: IApiFieldError[];
}

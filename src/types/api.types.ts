// The envelope every service returns and every _action.ts resolves to.
// Callers narrow on `success` and never touch an axios error.
// Key names must match the API. totalPages is the standard; cashfo's admin API still sends totalPage.
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

// Raw body of a `{ data, meta }` list endpoint, before httpClient lifts meta.
export interface IPaginatedBody<TItem> {
  data: TItem[];
  meta: PaginationMeta;
}

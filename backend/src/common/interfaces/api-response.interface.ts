export interface ApiError {
  code: string | number;
  message: string;
  details?: string | number | Record<string, unknown> | unknown;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiFailure {
  success: false;
  error: ApiError;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

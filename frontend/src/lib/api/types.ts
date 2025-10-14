export interface LoginRequest {
  email: string;
  password: string;
}

export type LoginResponse = ApiResponse<{
  token: string;
  user: {
    id: number;
    email: string;
  };
}>;

export interface ForgotPasswordRequest {
  email: string;
}

export type ForgotPasswordResponse = ApiResponse<{
  token: string;
}>;

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

type TApiError = {
  code: string;
  message: string;
  details?: unknown;
};
export interface ApiResponse<T = void> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}
export interface ApiSuccess<T = void> extends ApiResponse<T> {
  success: true;
  message?: string;
  data?: T;
  error: never;
}
export interface ApiError extends ApiResponse {
  success: false;
  message?: string;
  error: TApiError;
  data: never;
}

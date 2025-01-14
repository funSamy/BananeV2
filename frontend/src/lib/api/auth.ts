import axiosInstance from "./axios";

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

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

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

const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await axiosInstance.post("/auth/login", data);
    return response.data;
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<ApiResponse> => {
    const response = await axiosInstance.post("/auth/forgot-password", data);
    return response.data;
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<ApiResponse> => {
    const response = await axiosInstance.post("/auth/reset-password", data);
    return response.data;
  },
};

export default authApi;

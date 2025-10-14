import {
  ApiSuccess,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  LoginResponse,
  ResetPasswordRequest,
} from ".";
import axiosInstance from "./axios";

const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await axiosInstance.post("/auth/login", data);
    return response.data;
  },

  forgotPassword: async (
    data: ForgotPasswordRequest
  ): Promise<ForgotPasswordResponse> => {
    const response = await axiosInstance.post("/auth/forgot-password", data);
    return response.data;
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<ApiSuccess> => {
    const response = await axiosInstance.post("/auth/reset-password", data);
    return response.data;
  },
};

export default authApi;

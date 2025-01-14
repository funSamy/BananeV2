import { useMutation } from "@tanstack/react-query";
import authApi, { ForgotPasswordRequest, ApiResponse } from "@/lib/api/auth";

export function useForgotPassword() {
  return useMutation<ApiResponse, Error, ForgotPasswordRequest>({
    mutationFn: (data) => authApi.forgotPassword(data),
  });
}

import { useMutation } from "@tanstack/react-query";
import authApi, { ResetPasswordRequest, ApiResponse } from "@/lib/api/auth";
import { useNavigate } from "react-router-dom";

export function useResetPassword() {
  const navigate = useNavigate();

  return useMutation<ApiResponse, Error, ResetPasswordRequest>({
    mutationFn: (data) => authApi.resetPassword(data),
    onSuccess: () => {
      // Redirect to login page after successful password reset
      navigate("/login");
    },
  });
}

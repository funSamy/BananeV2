import { useMutation } from "@tanstack/react-query";
import {
  ResetPasswordRequest,
  ApiError,
  ApiSuccess,
} from "@/lib/api";
import { toast } from "sonner";
import authApi from "@/lib/api/auth";

export function useResetPassword() {
  return useMutation<ApiSuccess, ApiError, ResetPasswordRequest>({
    mutationFn: (data) => authApi.resetPassword(data),
    onSuccess: () => {
      toast.success("Password updated successfully");
    },
    onError: (error) =>
      toast.error("An error occured", {
        description: error.message || error.error.message,
      }),
  });
}

import { useMutation } from "@tanstack/react-query";
import {
  ApiError,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
} from "@/lib/api";
import { toast } from "sonner";
import authApi from "@/lib/api/auth";

export function useForgotPassword() {
  return useMutation<ForgotPasswordResponse, ApiError, ForgotPasswordRequest>({
    mutationFn: (data) => authApi.forgotPassword(data),
    onError(error) {
      toast.error("An error occured. Try reloading the page", {
        description: error.error.message || error.message,
      });
      console.error({ error: error.error.message });
    },
  });
}

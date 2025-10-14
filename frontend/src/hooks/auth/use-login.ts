import { useMutation } from "@tanstack/react-query";
import { ApiError, LoginRequest, LoginResponse } from "@/lib/api";
import { setCookie } from "@/lib/utils";
import { toast } from "sonner";
import authApi from "@/lib/api/auth";

export function useLogin() {

  return useMutation<LoginResponse, ApiError, LoginRequest>({
    mutationFn: (data) => authApi.login(data),
    onSuccess: (response) => {
      // Store token in localStorage
      setCookie("token", response.data!.token);
      // Store user data
      setCookie("user", JSON.stringify(response.data!.user));      
    },
    onError: (error) => {
      toast.error("Login failed. Please check your credentials.");
      console.error(error);
    },
  });
}

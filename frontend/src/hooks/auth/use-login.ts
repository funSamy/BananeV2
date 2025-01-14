import { useMutation } from "@tanstack/react-query";
import authApi, { LoginRequest, LoginResponse } from "@/lib/api/auth";
import { setCookie } from "@/lib/utils";
import { toast } from "sonner";

export function useLogin() {

  return useMutation<LoginResponse, Error, LoginRequest>({
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

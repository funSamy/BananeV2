import axios from "axios";
import { getCookie, removeCookie } from "../utils";

const API_URL = import.meta.env.VITE_API_URL;

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // Add credentials config
  withCredentials: true,
});

// Request interceptor for API calls
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getCookie("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Clear auth data
      removeCookie("token");
      removeCookie("user");

      // Get current location
      const currentPath = window.location.pathname;
      const currentSearch = window.location.search;

      // Check if current URL already has a returnUrl parameter
      const searchParams = new URLSearchParams(currentSearch);
      const existingReturnUrl = searchParams.get("returnUrl");

      // If there's already a returnUrl, use that instead of the current path
      const returnPath = existingReturnUrl
        ? decodeURIComponent(existingReturnUrl)
        : currentPath;

      // Encode the final return URL
      const returnUrl = encodeURIComponent(returnPath);

      // Redirect to login with return URL
      window.location.replace(`/login?returnUrl=${returnUrl}`);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

import {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
  ProductionData,
  ProductionFilters,
} from "@/types/api";
import axiosInstance from "./axios";

export const productionApi = {
  create: async (
    data: Omit<ProductionData, "id" | "stock" | "remains">
  ): Promise<ApiResponse<ProductionData>> => {
    const response = await axiosInstance.post<ApiResponse<ProductionData>>(
      "/production/data",
      data
    );
    return response.data;
  },

  getList: async (
    params: PaginationParams & { filters?: ProductionFilters }
  ): Promise<PaginatedResponse<ProductionData>> => {
    const response = await axiosInstance.get<PaginatedResponse<ProductionData>>(
      "/production/data",
      { params }
    );
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<ProductionData>> => {
    const response = await axiosInstance.get<ApiResponse<ProductionData>>(
      `/production/data/${id}`
    );
    return response.data;
  },

  update: async (
    id: number,
    data: Partial<ProductionData>
  ): Promise<ApiResponse<ProductionData>> => {
    const response = await axiosInstance.put<ApiResponse<ProductionData>>(
      `/production/data/${id}`,
      data
    );
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.delete<ApiResponse<void>>(
      `/production/data/${id}`
    );
    return response.data;
  },
};

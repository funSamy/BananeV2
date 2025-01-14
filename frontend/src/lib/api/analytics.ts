import {
  AnalyticsOverview,
  ApiResponse,
  ExpenditureBreakdown,
  MonthlyTrend,
} from "@/types/api";
import axiosInstance from "./axios";

interface DateRangeParams {
  startDate?: Date;
  endDate?: Date;
}

export const analyticsApi = {
  getOverview: async (
    params?: DateRangeParams
  ): Promise<ApiResponse<AnalyticsOverview>> => {
    const response = await axiosInstance.get<ApiResponse<AnalyticsOverview>>(
      "/analytics/overview",
      { params }
    );
    return response.data;
  },

  getMonthlyTrends: async (
    params?: DateRangeParams
  ): Promise<ApiResponse<MonthlyTrend[]>> => {
    const response = await axiosInstance.get<ApiResponse<MonthlyTrend[]>>(
      "/analytics/monthly-trends",
      { params }
    );
    return response.data;
  },

  getExpenditureBreakdown: async (
    params?: DateRangeParams & { limit?: number }
  ): Promise<ApiResponse<ExpenditureBreakdown[]>> => {
    const response = await axiosInstance.get<
      ApiResponse<ExpenditureBreakdown[]>
    >("/analytics/expenditure-breakdown", { params });
    return response.data;
  },
};

import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/lib/api/analytics";

interface DateRangeParams {
  startDate?: Date;
  endDate?: Date;
}

interface ExpenditureBreakdownParams extends DateRangeParams {
  limit?: number;
}

const ANALYTICS_KEYS = {
  all: ["analytics"] as const,
  overview: (params?: DateRangeParams) =>
    [...ANALYTICS_KEYS.all, "overview", params] as const,
  monthlyTrends: (params?: DateRangeParams) =>
    [...ANALYTICS_KEYS.all, "monthly-trends", params] as const,
  expenditureBreakdown: (params?: ExpenditureBreakdownParams) =>
    [...ANALYTICS_KEYS.all, "expenditure-breakdown", params] as const,
};

const staleTime: Readonly<number> = 5 * 60 * 1000; // 5 minutes cache
export function useAnalyticsOverview(params?: DateRangeParams) {
  return useQuery({
    queryKey: ANALYTICS_KEYS.overview(params),
    queryFn: () => analyticsApi.getOverview(params),
    staleTime,
  });
}

export function useMonthlyTrends(params?: DateRangeParams) {
  return useQuery({
    queryKey: ANALYTICS_KEYS.monthlyTrends(params),
    queryFn: () => analyticsApi.getMonthlyTrends(params),
    staleTime,
  });
}

export function useExpenditureBreakdown(params?: ExpenditureBreakdownParams) {
  return useQuery({
    queryKey: ANALYTICS_KEYS.expenditureBreakdown(params),
    queryFn: () => analyticsApi.getExpenditureBreakdown(params),
    staleTime,
  });
}

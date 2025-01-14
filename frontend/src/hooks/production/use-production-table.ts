import { useQuery } from "@tanstack/react-query";
import { productionApi } from "@/lib/api/production";
import { DataEntry } from "@/types/data";
import { PaginationParams, ProductionFilters } from "@/types/api";
import { DateRange } from "react-day-picker";
import { SortingState } from "@tanstack/react-table";

const PRODUCTION_TABLE_KEYS = {
  all: ["production", "table"] as const,
  list: (params: PaginationParams & { filters?: ProductionFilters }) =>
    [...PRODUCTION_TABLE_KEYS.all, params] as const,
};

export function useProductionTable(
  pagination: PaginationParams,
  sorting: SortingState,
  dateRange?: DateRange
) {
  const filters: ProductionFilters = {};

  // Convert date range to filter format
  if (dateRange?.from) {
    filters.startDate = dateRange.from;
  }
  if (dateRange?.to) {
    filters.endDate = dateRange.to;
  }

  // Convert sorting to API format
  const sortBy = sorting[0]?.id;
  const sortOrder = sorting[0]?.desc ? "desc" : "asc";

  return useQuery({
    queryKey: PRODUCTION_TABLE_KEYS.list({
      ...pagination,
      sortBy,
      sortOrder,
      filters,
    }),
    queryFn: () =>
      productionApi.getList({
        page: pagination.page,
        pageSize: pagination.pageSize,
        sortBy,
        sortOrder,
        ...filters,
      }),
    select: (response) => ({
      data: response.data.items.map((item) => ({
        ...item,
        id: item.id, // Convert id to string
        date: new Date(item.date), // Convert ISO string to Date
      })) satisfies DataEntry[],
      pagination: response.data.pagination,
    }),
  });
}

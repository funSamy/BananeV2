export interface ProductionData {
  id: number;
  date: string;
  purchased: number;
  produced: number;
  sales: number;
  stock: number;
  remains: number;
  expenditures?: ExpenditureItem[];
}

export const isProductionData = (data: unknown): data is ProductionData => {
  return typeof data === "object" && data !== null && "id" in data;
};

export function assertProductionData(
  data: unknown
): asserts data is ProductionData {
  if (!isProductionData(data)) {
    throw new Error("Invalid production data");
  }
}

export interface ExpenditureItem {
  name: string;
  amount: number;
}

export type SortBy =
  | "date"
  | "produced"
  | "purchased"
  | "sales"
  | "stock"
  | "remains";
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: SortBy;
  sortOrder?: "asc" | "desc";
}

export interface ProductionFilters {
  startDate?: Date;
  endDate?: Date;
  produced?: number;
  remains?: number;
  sales?: number;
  purchased?: number;
  stock?: number;
}

export interface PaginatedResponse<T> {
  data: {
    items: T[];
    pagination: {
      total: number;
      pageCount: number;
      currentPage: number;
      pageSize: number;
      from: number;
      to: number;
    };
  };
  summary?: {
    selectedCount: number;
    filteredCount: number;
  };
}

export interface AnalyticsOverview {
  totalProduced: number;
  totalSales: number;
  totalExpenses: number;
  avgStock: number;
  revenue: number;
}

export interface MonthlyTrend {
  month: string;
  produced: number;
  sales: number;
  stock: number;
  expenses: number;
}

export interface ExpenditureBreakdown {
  name: string;
  value: number;
  percentage: number;
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import {
  ExpenditureChart,
  chartConfig,
} from "@/components/charts/expenditure-chart";
import { OverviewChart } from "@/components/charts/overview-chart";
import { StockChart } from "@/components/charts/stock-chart";
// import { generateMockData } from "@/data/mocks";
import { format, subMonths } from "date-fns";
import {
  DollarSign,
  Loader2,
  Package,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { DateRange } from "react-day-picker";
import { useState, useMemo, ReactNode } from "react";
import { useProductionList } from "@/hooks/production/use-production-data";
import { useTranslation } from "react-i18next";

// Formatter functions
const compactNumberFormatter = (value: number) => {
  return new Intl.NumberFormat("fr-CM", {
    notation: "compact",
  }).format(value);
};

const compactCurrencyFormatter = (value: number) => {
  const formatted = new Intl.NumberFormat("fr-CM", {
    notation: "compact",
    style: "currency",
    maximumFractionDigits: 2,
    currency: "XAF",
  }).format(value);
  return formatted;
};

const TOP_EXPENSES_COUNT = 5;

export default function Dashboard() {
  const { t } = useTranslation();
  const [date, setDate] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 6),
    to: new Date(),
  });

  const { data, isLoading, isError } = useProductionList({
    startDate: date?.from,
    endDate: date?.to,
    sortOrder: "desc",
    pageSize: 500, // Request all data for dashboard aggregation (max allowed by backend)
  });

  // Calculate metrics based on date range
  const metrics = useMemo(() => {
    const productionData = data?.data.items;
    if (!productionData)
      return {
        avgStock: 0,
        revenue: 0,
        totalExpenses: 0,
        totalProduced: 0,
        totalSales: 0,
      };

    const totalProduced = productionData.reduce(
      (sum, item) => sum + (item.produced || 0),
      0
    );
    const totalSales = productionData.reduce(
      (sum, item) => sum + (item.sales || 0),
      0
    );
    const totalExpenses = productionData.reduce(
      (sum, item) =>
        sum + (item.expenditures?.reduce((s, e) => s + e.amount, 0) || 0),
      0
    );
    const avgStock =
      productionData.length > 0
        ? productionData.reduce((sum, item) => sum + item.stock, 0) /
          productionData.length
        : 0;

    return {
      totalProduced,
      totalSales,
      totalExpenses,
      avgStock,
      revenue: totalSales - totalExpenses,
    };
  }, [data?.data.items]);

  // Update chart data to respect date range
  const chartData = useMemo(() => {
    const productionData = data?.data.items;
    if (!productionData || productionData.length === 0) return [];

    console.log("Processing data - Total items:", productionData.length);

    // Group data by month, keeping track of dates for proper sorting
    const monthlyData = new Map<
      string,
      {
        month: string;
        sortKey: Date;
        produced: number;
        sales: number;
        stock: number;
        expenses: number;
        lastDate: Date;
      }
    >();

    productionData.forEach((item) => {
      const itemDate = new Date(item.date);
      const monthKey = format(itemDate, "MMM yyyy");

      const existing = monthlyData.get(monthKey);

      if (!existing) {
        // First entry for this month
        monthlyData.set(monthKey, {
          month: monthKey,
          sortKey: itemDate,
          produced: item.produced || 0,
          sales: item.sales || 0,
          stock: item.stock || 0,
          expenses:
            item.expenditures?.reduce((sum, e) => sum + e.amount, 0) || 0,
          lastDate: itemDate,
        });
      } else {
        // Accumulate produced, sales, and expenses
        existing.produced += item.produced || 0;
        existing.sales += item.sales || 0;
        existing.expenses +=
          item.expenditures?.reduce((sum, e) => sum + e.amount, 0) || 0;

        // Use the stock value from the most recent date in the month
        if (itemDate > existing.lastDate) {
          existing.stock = item.stock || 0;
          existing.lastDate = itemDate;
        }
      }
    });

    // Convert to array and sort by date
    const result = Array.from(monthlyData.values())
      .sort((a, b) => a.sortKey.getTime() - b.sortKey.getTime())
      .map(({ month, produced, sales, stock, expenses }) => ({
        month,
        produced,
        sales,
        stock,
        expenses,
      }));

    console.log(
      "Chart data - Months found:",
      result.length,
      result.map((r) => r.month)
    );
    return result;
  }, [data?.data.items]);

  // Update expenditure data preparation
  const expenditureData = useMemo(() => {
    const categories = new Map<string, number>();

    // Filter data based on selected date range first
    const productionData = data?.data.items;
    if (!productionData) return [];

    productionData.forEach((item) => {
      item.expenditures?.forEach((exp) => {
        const existing = categories.get(exp.name) || 0;
        categories.set(exp.name, existing + (exp.amount || 0));
      });
    });

    // Convert to array and sort by amount
    const sortedExpenses = Array.from(categories.entries())
      .map(([name, amount]) => ({
        name,
        value: amount,
        fill: chartConfig[name]?.color ?? chartConfig["other"].color,
      }))
      .sort((a, b) => b.value - a.value);

    // Take top expenses and sum the rest into "Other"
    const topExpenses = sortedExpenses.slice(0, TOP_EXPENSES_COUNT);
    const otherExpenses = sortedExpenses.slice(TOP_EXPENSES_COUNT);

    if (otherExpenses.length > 0) {
      const otherTotal = otherExpenses.reduce((sum, exp) => sum + exp.value, 0);
      topExpenses.push({
        name: "Other",
        value: otherTotal,
        fill: chartConfig["other"].color,
      });
    }

    return topExpenses;
  }, [data?.data.items]);

  function LoadingIndicator({ children }: { children: ReactNode }) {
    return isLoading ? <Loader2 className="animate-spin" /> : children;
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          {t("dashboard.title")}
        </h2>
        <div className="flex items-center space-x-2">
          <LoadingIndicator>
            <DatePickerWithRange
              date={date}
              setDate={setDate}
              className={isError ? "cursor-not-allowed opacity-60" : ""}
              text={t("dashboard.pickDateRange")}
            />
          </LoadingIndicator>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.totalProduction")}
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <LoadingIndicator>
              <div className="text-2xl font-bold">
                {compactNumberFormatter(metrics.totalProduced)}
              </div>
              <p className="text-xs text-muted-foreground">
                {t("dashboard.unitsProduced")}{" "}
                {date?.from
                  ? t("dashboard.since", {
                      date: format(date.from, "MMM d, yyyy"),
                    })
                  : t("dashboard.thisPeriod")}
              </p>
            </LoadingIndicator>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.totalSales")}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <LoadingIndicator>
              <div className="text-2xl font-bold">
                {compactNumberFormatter(metrics.totalSales)}
              </div>
              <p className="text-xs text-muted-foreground">
                {t("dashboard.unitsSold")}{" "}
                {date?.from
                  ? t("dashboard.since", {
                      date: format(date.from, "MMM d, yyyy"),
                    })
                  : t("dashboard.thisPeriod")}
              </p>
            </LoadingIndicator>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.totalExpenses")}
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <LoadingIndicator>
              <div className="text-2xl font-bold">
                {compactCurrencyFormatter(metrics.totalExpenses)}
              </div>
              <p className="text-xs text-muted-foreground">
                {t("dashboard.totalExpenditures")}{" "}
                {date?.from
                  ? t("dashboard.since", {
                      date: format(date.from, "MMM d, yyyy"),
                    })
                  : t("dashboard.thisPeriod")}
              </p>
            </LoadingIndicator>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.revenue")}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <LoadingIndicator>
              <div className="text-2xl font-bold">
                {compactCurrencyFormatter(metrics.revenue)}
              </div>
              <p className="text-xs text-muted-foreground">
                {t("dashboard.netRevenue")}{" "}
                {date?.from
                  ? t("dashboard.since", {
                      date: format(date.from, "MMM d, yyyy"),
                    })
                  : t("dashboard.thisPeriod")}
              </p>
            </LoadingIndicator>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <OverviewChart data={chartData} />
        <ExpenditureChart
          data={expenditureData}
          currencyFormatter={compactCurrencyFormatter}
        />
      </div>

      <div className="grid gap-4 grid-cols-1">
        <StockChart data={chartData} numberFormatter={compactNumberFormatter} />
      </div>
    </div>
  );
}

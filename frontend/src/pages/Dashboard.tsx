import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import {
  ExpenditureChart,
  chartConfig,
} from "@/components/charts/expenditure-chart";
import { OverviewChart } from "@/components/charts/overview-chart";
import { StockChart } from "@/components/charts/stock-chart";
import { generateMockData } from "@/data/mocks";
import { format, subMonths } from "date-fns";
import { DollarSign, Package, TrendingDown, TrendingUp } from "lucide-react";
import { DateRange } from "react-day-picker";
import { useState, useMemo } from "react";

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

const TOP_EXPENSES_COUNT = 4;

export default function Dashboard() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 6),
    to: new Date(),
  });

  // Fetch mock data - replace with actual API call
  const data = useMemo(() => generateMockData(1200), []);

  // Calculate metrics based on date range
  const metrics = useMemo(() => {
    let filteredData = data;
    if (date?.from || date?.to) {
      filteredData = data.filter((item) => {
        const itemDate = new Date(item.date);
        if (date.from && date.to) {
          return itemDate >= date.from && itemDate <= date.to;
        } else if (date.from) {
          return itemDate >= date.from;
        } else if (date.to) {
          return itemDate <= date.to;
        }
        return true;
      });
    }

    const totalProduced = filteredData.reduce(
      (sum, item) => sum + (item.produced || 0),
      0
    );
    const totalSales = filteredData.reduce(
      (sum, item) => sum + (item.sales || 0),
      0
    );
    const totalExpenses = filteredData.reduce(
      (sum, item) =>
        sum + item.expenditures.reduce((s, e) => s + (e.amount || 0), 0),
      0
    );
    const avgStock =
      filteredData.length > 0
        ? filteredData.reduce((sum, item) => sum + (item.stock || 0), 0) /
          filteredData.length
        : 0;

    return {
      totalProduced,
      totalSales,
      totalExpenses,
      avgStock,
      revenue: totalSales - totalExpenses,
    };
  }, [data, date]);

  // Update chart data to respect date range
  const chartData = useMemo(() => {
    const monthlyData = new Map<
      string,
      {
        month: string;
        produced: number;
        sales: number;
        stock: number;
        expenses: number;
      }
    >();

    // Filter data based on selected date range first
    const filteredData = data.filter((item) => {
      const itemDate = new Date(item.date);
      if (date?.from && date?.to) {
        return itemDate >= date.from && itemDate <= date.to;
      } else if (date?.from) {
        return itemDate >= date.from;
      } else if (date?.to) {
        return itemDate <= date.to;
      }
      return true;
    });

    filteredData.forEach((item) => {
      const monthKey = format(item.date, "MMM yyyy");
      const existing = monthlyData.get(monthKey) || {
        month: monthKey,
        produced: 0,
        sales: 0,
        stock: 0,
        expenses: 0,
      };

      existing.produced += item.produced || 0;
      existing.sales += item.sales || 0;
      existing.stock = item.stock || 0;
      existing.expenses += item.expenditures.reduce(
        (sum, e) => sum + (e.amount || 0),
        0
      );

      monthlyData.set(monthKey, existing);
    });

    return Array.from(monthlyData.values()).sort(
      (a, b) => new Date(a.month).getTime() - new Date(b.month).getTime()
    );
  }, [data, date]);

  // Update expenditure data preparation
  const expenditureData = useMemo(() => {
    const categories = new Map<string, number>();

    // Filter data based on selected date range first
    const filteredData = data.filter((item) => {
      const itemDate = new Date(item.date);
      if (date?.from && date?.to) {
        return itemDate >= date.from && itemDate <= date.to;
      } else if (date?.from) {
        return itemDate >= date.from;
      } else if (date?.to) {
        return itemDate <= date.to;
      }
      return true;
    });

    filteredData.forEach((item) => {
      item.expenditures.forEach((exp) => {
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
  }, [data, date]);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <DatePickerWithRange date={date} setDate={setDate} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Production
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {compactNumberFormatter(metrics.totalProduced)}
            </div>
            <p className="text-xs text-muted-foreground">
              Units produced{" "}
              {date?.from
                ? `since ${format(date.from, "MMM d, yyyy")}`
                : "this period"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {compactNumberFormatter(metrics.totalSales)}
            </div>
            <p className="text-xs text-muted-foreground">
              Units sold{" "}
              {date?.from
                ? `since ${format(date.from, "MMM d, yyyy")}`
                : "this period"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expenses
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {compactCurrencyFormatter(metrics.totalExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total expenditures{" "}
              {date?.from
                ? `since ${format(date.from, "MMM d, yyyy")}`
                : "this period"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {compactCurrencyFormatter(metrics.revenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Net revenue{" "}
              {date?.from
                ? `since ${format(date.from, "MMM d, yyyy")}`
                : "this period"}
            </p>
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

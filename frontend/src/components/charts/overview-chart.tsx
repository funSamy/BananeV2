import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartLegendContent,
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";
import { useTranslation } from "react-i18next";

interface OverviewChartProps {
  data: {
    month: string;
    produced: number;
    sales: number;
    stock: number;
    expenses: number;
  }[];
}

const chartConfig: ChartConfig = {
  produced: {
    label: "Production",
    color: "red",
  },
  sales: {
    label: "Sales",
  },
};

export function OverviewChart({ data }: OverviewChartProps) {
  const { t } = useTranslation();
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>{t("dashboard.prodSales")}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid
              className="stroke-accentForeground/30"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Area
              dataKey="produced"
              type="linear"
              stackId={0}
              fillOpacity={0.4}
              fill="#eab308"
              stroke="#eab308"
            />
            <Area
              dataKey="sales"
              stackId={0}
              type="linear"
              fillOpacity={0.4}
              fill="#a855f7"
              stroke="#a855f7"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

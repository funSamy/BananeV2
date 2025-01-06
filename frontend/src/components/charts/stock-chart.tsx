import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GitCommitVertical } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";

interface StockChartProps {
  data: {
    month: string;
    stock: number;
  }[];
  numberFormatter: (value: number) => string;
}
const chartConfig: ChartConfig = {
  stock: {
    label: "Stock",
    color: "hsl(var(--chart-4))",
  },
};

export function StockChart({ data }: StockChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Stock Level Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer className="max-h-[400px] w-full" config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              top: 12,
              bottom: 5,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent />}
            />
            <Line
              type="natural"
              dataKey="stock"
              name="Stock Level"
              stroke="hsl(var(--chart-4))"
              strokeWidth={2}
              dot={({ cx, cy, payload }) => {
                const r = 24;
                return (
                  <GitCommitVertical
                    key={payload.month}
                    x={cx - r / 2}
                    y={cy - r / 2}
                    width={r}
                    height={r}
                    fill="hsl(var(--background))"
                    stroke="hsl(var(--chart-4))"
                  />
                );
              }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

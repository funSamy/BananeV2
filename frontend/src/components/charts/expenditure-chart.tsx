import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cell, LabelList, Pie, PieChart } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "../ui/chart";
import { useTranslation } from "react-i18next";

export const chartConfig: ChartConfig = {
  transport: {
    label: "Transport",
    color: "hsl(var(--chart-1))",
  },
  labor: {
    label: "Labor",
    color: "hsl(var(--chart-2))",
  },
  rent: {
    label: "Rent",
    color: "hsl(var(--chart-3))",
  },
  taxes: {
    label: "Taxes",
    color: "hsl(var(--chart-4))",
  },
  marketing: {
    label: "Marketing",
    color: "hsl(var(--chart-5))",
  },
  other: {
    label: "Other",
    color: "hsl(var(--muted))",
  },
};

interface ExpenditureChartProps {
  data: {
    name: string;
    value: number;
    fill?: string;
  }[];
  currencyFormatter?: (value: number) => string;
}

export function ExpenditureChart({
  data,
  currencyFormatter,
}: ExpenditureChartProps) {
  const COLORS = Object.values(chartConfig).map((config) => config.color);
  const { t } = useTranslation();

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>{t("dashboard.expenditureDistribution")}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center">
        <ChartContainer
          config={chartConfig}
          className="w-[500px] aspect-square max-h-[400px]"
        >
          <PieChart className="w-full h-auto overflow-visible">
            <ChartTooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const data = payload[0].payload;
                return (
                  <div className="rounded-lg border border-background bg-background p-2 shadow-sm">
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                          {data.name}
                        </span>
                        <span className="font-bold">
                          {currencyFormatter
                            ? currencyFormatter(data.value)
                            : data.value}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }}
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={0}
              outerRadius={150}
              paddingAngle={1}
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
              <LabelList
                dataKey="name"
                position="outside"
                className="fill-background dark:fill-foreground"
                offset={20}
                formatter={(value: string) =>
                  chartConfig[value.toLowerCase()]?.label || value
                }
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

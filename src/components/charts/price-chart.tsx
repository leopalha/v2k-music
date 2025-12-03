"use client";

import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { cn } from "@/lib/utils/cn";
import { formatCurrency } from "@/lib/utils";

interface PriceChartProps {
  data: Array<{ date: string; price: number }>;
  height?: number;
  showGrid?: boolean;
  className?: string;
}

type Period = "7d" | "30d" | "3m" | "all";

export function PriceChart({
  data,
  height = 300,
  showGrid = true,
  className,
}: PriceChartProps) {
  const [period, setPeriod] = useState<Period>("30d");

  // Filter data based on period
  const filteredData = useMemo(() => {
    const now = new Date();
    let daysBack = 30;

    switch (period) {
      case "7d":
        daysBack = 7;
        break;
      case "30d":
        daysBack = 30;
        break;
      case "3m":
        daysBack = 90;
        break;
      case "all":
        return data;
    }

    const cutoffDate = new Date(now);
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);

    return data.filter((item) => new Date(item.date) >= cutoffDate);
  }, [data, period]);

  // Calculate change
  const priceChange = useMemo(() => {
    if (filteredData.length < 2) return { value: 0, percent: 0 };

    const firstPrice = filteredData[0].price;
    const lastPrice = filteredData[filteredData.length - 1].price;
    const change = lastPrice - firstPrice;
    const percent = (change / firstPrice) * 100;

    return { value: change, percent };
  }, [filteredData]);

  const isPositive = priceChange.percent >= 0;

  const periods: { label: string; value: Period }[] = [
    { label: "7D", value: "7d" },
    { label: "30D", value: "30d" },
    { label: "3M", value: "3m" },
    { label: "Tudo", value: "all" },
  ];

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-bg-secondary border border-border-default rounded-xl p-3 shadow-lg">
          <p className="text-xs text-text-tertiary mb-1">
            {new Date(label).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>
          <p className="text-lg font-mono font-bold text-text-primary">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with period selector */}
      <div className="flex items-center justify-between">
        <div>
          <div
            className={cn(
              "text-2xl font-mono font-bold",
              isPositive ? "text-success" : "text-error"
            )}
          >
            {isPositive ? "+" : ""}
            {priceChange.percent.toFixed(2)}%
          </div>
          <div className="text-sm text-text-tertiary">
            {isPositive ? "+" : ""}
            {formatCurrency(priceChange.value)} no período
          </div>
        </div>

        {/* Period Tabs */}
        <div className="flex gap-1 bg-bg-elevated rounded-lg p-1">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                period === p.value
                  ? "bg-primary-400 text-white"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-secondary"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      {filteredData.length === 0 ? (
        <div className="flex items-center justify-center" style={{ height }}>
          <p className="text-text-tertiary text-sm">Sem dados de histórico disponíveis</p>
        </div>
      ) : (
        <div style={{ height, minWidth: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={isPositive ? "#22C55E" : "#EF4444"}
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor={isPositive ? "#22C55E" : "#EF4444"}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>

            {showGrid && (
              <>
                <XAxis
                  dataKey="date"
                  stroke="#404040"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#737373", fontSize: 12 }}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                    });
                  }}
                  interval="preserveStartEnd"
                  minTickGap={50}
                />
                <YAxis
                  stroke="#404040"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#737373", fontSize: 12 }}
                  tickFormatter={(value) => `R$${value.toFixed(0)}`}
                  domain={["dataMin - 0.5", "dataMax + 0.5"]}
                  width={60}
                />
              </>
            )}

            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey="price"
              stroke={isPositive ? "#22C55E" : "#EF4444"}
              strokeWidth={2}
              fill="url(#colorPrice)"
              dot={false}
              activeDot={{
                r: 6,
                fill: isPositive ? "#22C55E" : "#EF4444",
                stroke: "#0A0A0A",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      )}
    </div>
  );
}

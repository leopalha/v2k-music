"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";

interface Transaction {
  id: string;
  type: "BUY" | "SELL" | "TRANSFER" | "ROYALTY_CLAIM" | "DEPOSIT" | "WITHDRAWAL";
  amount: number;
  price: number;
  totalValue: number;
  track: {
    id: string;
    title: string;
    artistName: string;
  };
  createdAt: string;
}

interface PLChartProps {
  transactions: Transaction[];
}

interface DataPoint {
  date: string;
  pl: number;
  cumulative: number;
}

export function PLChart({ transactions }: PLChartProps) {
  const chartData = useMemo(() => {
    if (transactions.length === 0) return [];

    // Sort transactions by date
    const sorted = [...transactions].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    let cumulativePL = 0;
    const dataPoints: DataPoint[] = [];

    sorted.forEach((tx) => {
      let pl = 0;

      if (tx.type === "BUY") {
        pl = -tx.totalValue; // Negative because it's a cost
      } else if (tx.type === "SELL") {
        pl = tx.totalValue; // Positive because it's revenue
      } else if (tx.type === "ROYALTY_CLAIM") {
        pl = tx.totalValue; // Positive income
      } else if (tx.type === "WITHDRAWAL") {
        pl = -tx.totalValue;
      } else if (tx.type === "DEPOSIT") {
        pl = tx.totalValue;
      }

      cumulativePL += pl;

      dataPoints.push({
        date: new Date(tx.createdAt).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "short",
        }),
        pl,
        cumulative: cumulativePL,
      });
    });

    return dataPoints;
  }, [transactions]);

  const finalPL = chartData.length > 0 ? chartData[chartData.length - 1].cumulative : 0;
  const isProfit = finalPL >= 0;

  if (chartData.length === 0) {
    return null;
  }

  return (
    <div className="bg-bg-secondary border border-border-default rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">
            Profit & Loss ao Longo do Tempo
          </h3>
          <p className="text-sm text-text-tertiary mt-1">
            Evolução acumulada das suas transações
          </p>
        </div>

        <div className="text-right">
          <div className="text-xs text-text-tertiary mb-1">P&L Total</div>
          <div
            className={`text-2xl font-bold flex items-center gap-2 ${
              isProfit ? "text-success" : "text-error"
            }`}
          >
            {isProfit ? (
              <TrendingUp className="w-5 h-5" />
            ) : (
              <TrendingDown className="w-5 h-5" />
            )}
            R$ {Math.abs(finalPL).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorPL" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor={isProfit ? "#22C55E" : "#EF4444"}
                stopOpacity={0.3}
              />
              <stop
                offset="95%"
                stopColor={isProfit ? "#22C55E" : "#EF4444"}
                stopOpacity={0}
              />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />

          <XAxis
            dataKey="date"
            stroke="#6B7280"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: "#374151" }}
          />

          <YAxis
            stroke="#6B7280"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: "#374151" }}
            tickFormatter={(value) => `R$ ${value.toFixed(0)}`}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: "#1F2937",
              border: "1px solid #374151",
              borderRadius: "8px",
              color: "#F9FAFB",
            }}
            labelStyle={{ color: "#9CA3AF" }}
            formatter={(value: number) => [
              `R$ ${value.toFixed(2)}`,
              value >= 0 ? "Lucro" : "Prejuízo",
            ]}
          />

          <Area
            type="monotone"
            dataKey="cumulative"
            stroke={isProfit ? "#22C55E" : "#EF4444"}
            strokeWidth={2}
            fill="url(#colorPL)"
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-border-subtle">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-success" />
          <span className="text-xs text-text-secondary">Compras</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-accent-orange" />
          <span className="text-xs text-text-secondary">Vendas</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-accent-green" />
          <span className="text-xs text-text-secondary">Royalties</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="bg-bg-elevated rounded-lg p-3 border border-border-subtle">
          <div className="text-xs text-text-tertiary mb-1">Transações</div>
          <div className="text-lg font-semibold text-text-primary">
            {chartData.length}
          </div>
        </div>

        <div className="bg-bg-elevated rounded-lg p-3 border border-border-subtle">
          <div className="text-xs text-text-tertiary mb-1">Maior Alta</div>
          <div className="text-lg font-semibold text-success">
            R$ {Math.max(...chartData.map((d) => d.cumulative)).toFixed(2)}
          </div>
        </div>

        <div className="bg-bg-elevated rounded-lg p-3 border border-border-subtle">
          <div className="text-xs text-text-tertiary mb-1">Maior Baixa</div>
          <div className="text-lg font-semibold text-error">
            R$ {Math.abs(Math.min(...chartData.map((d) => d.cumulative))).toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}

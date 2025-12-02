"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface PerformanceData {
  date: string;
  portfolioValue: number;
  invested: number;
  profitLoss: number;
}

interface PortfolioPerformanceChartProps {
  data: PerformanceData[];
}

export function PortfolioPerformanceChart({ data }: PortfolioPerformanceChartProps) {
  const stats = useMemo(() => {
    if (data.length === 0) return null;

    const latest = data[data.length - 1];
    const first = data[0];

    const totalGain = latest.portfolioValue - first.portfolioValue;
    const totalGainPercentage =
      first.portfolioValue > 0 ? (totalGain / first.portfolioValue) * 100 : 0;

    // Find highest and lowest points
    const highestValue = Math.max(...data.map((d) => d.portfolioValue));
    const lowestValue = Math.min(...data.map((d) => d.portfolioValue));

    return {
      currentValue: latest.portfolioValue,
      totalGain,
      totalGainPercentage,
      highestValue,
      lowestValue,
      isPositive: totalGain >= 0,
    };
  }, [data]);

  if (!stats || data.length === 0) {
    return (
      <div className="bg-bg-secondary border border-border-default rounded-xl p-8 text-center">
        <p className="text-text-tertiary">Sem dados de performance disponíveis</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isPositive = data.profitLoss >= 0;

      return (
        <div className="bg-bg-elevated border border-border-default rounded-lg p-3 shadow-lg">
          <p className="text-xs text-text-tertiary mb-2">
            {new Date(label).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "short",
            })}
          </p>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-text-secondary">Valor:</span>
              <span className="text-sm font-mono font-medium text-text-primary">
                R$ {data.portfolioValue.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-text-secondary">Investido:</span>
              <span className="text-sm font-mono font-medium text-text-tertiary">
                R$ {data.invested.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-text-secondary">P&L:</span>
              <span
                className={cn(
                  "text-sm font-mono font-medium",
                  isPositive ? "text-success" : "text-error"
                )}
              >
                {isPositive ? "+" : ""}R$ {data.profitLoss.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-bg-secondary border border-border-default rounded-xl p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Performance do Portfolio (30 dias)
        </h3>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-bg-elevated rounded-lg p-3">
            <div className="text-xs text-text-tertiary mb-1">Valor Atual</div>
            <div className="text-lg font-mono font-bold text-text-primary">
              R$ {stats.currentValue.toFixed(2)}
            </div>
          </div>

          <div className="bg-bg-elevated rounded-lg p-3">
            <div className="text-xs text-text-tertiary mb-1">Ganho/Perda</div>
            <div
              className={cn(
                "text-lg font-mono font-bold flex items-center gap-1",
                stats.isPositive ? "text-success" : "text-error"
              )}
            >
              {stats.isPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              {stats.isPositive ? "+" : ""}
              {stats.totalGainPercentage.toFixed(1)}%
            </div>
          </div>

          <div className="bg-bg-elevated rounded-lg p-3">
            <div className="text-xs text-text-tertiary mb-1">Máxima</div>
            <div className="text-lg font-mono font-bold text-success">
              R$ {stats.highestValue.toFixed(2)}
            </div>
          </div>

          <div className="bg-bg-elevated rounded-lg p-3">
            <div className="text-xs text-text-tertiary mb-1">Mínima</div>
            <div className="text-lg font-mono font-bold text-error">
              R$ {stats.lowestValue.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="investedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#9CA3AF" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#9CA3AF" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />

          <XAxis
            dataKey="date"
            stroke="#6B7280"
            style={{ fontSize: "12px" }}
            tickFormatter={(value) => {
              const date = new Date(value);
              return date.toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
              });
            }}
          />

          <YAxis
            stroke="#6B7280"
            style={{ fontSize: "12px" }}
            tickFormatter={(value) => `R$ ${value.toFixed(0)}`}
          />

          <Tooltip content={<CustomTooltip />} />

          <Legend
            wrapperStyle={{ fontSize: "12px" }}
            iconType="circle"
            formatter={(value) => (
              <span className="text-text-secondary">{value}</span>
            )}
          />

          <Area
            type="monotone"
            dataKey="invested"
            stroke="#9CA3AF"
            strokeWidth={2}
            fill="url(#investedGradient)"
            name="Investido"
          />

          <Area
            type="monotone"
            dataKey="portfolioValue"
            stroke="#8B5CF6"
            strokeWidth={2}
            fill="url(#portfolioGradient)"
            name="Valor do Portfolio"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

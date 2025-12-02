"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Music } from "lucide-react";

interface AssetAllocation {
  genre: string;
  value: number;
  percentage: number;
}

interface AssetAllocationChartProps {
  data: AssetAllocation[];
}

const GENRE_COLORS: { [key: string]: string } = {
  TRAP: "#8B5CF6", // Purple
  FUNK: "#EC4899", // Pink
  RAP: "#F59E0B", // Amber
  RNB: "#10B981", // Emerald
  REGGAETON: "#EF4444", // Red
  POP: "#3B82F6", // Blue
  ELECTRONIC: "#06B6D4", // Cyan
  ROCK: "#F97316", // Orange
  OTHER: "#6B7280", // Gray
};

export function AssetAllocationChart({ data }: AssetAllocationChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-bg-secondary border border-border-default rounded-xl p-8 text-center">
        <Music className="w-12 h-12 text-text-tertiary mx-auto mb-3" />
        <p className="text-text-tertiary">Sem alocação de ativos disponível</p>
      </div>
    );
  }

  const chartData = data.map((item) => ({
    name: item.genre,
    value: item.value,
    percentage: item.percentage,
    color: GENRE_COLORS[item.genre] || GENRE_COLORS.OTHER,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-bg-elevated border border-border-default rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-text-primary mb-1">{data.name}</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-text-secondary">Valor:</span>
              <span className="text-sm font-mono font-medium text-text-primary">
                R$ {data.value.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-text-secondary">Porcentagem:</span>
              <span className="text-sm font-mono font-medium text-text-primary">
                {data.percentage.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Only show label if percentage is > 5%
    if (percent < 0.05) return null;

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="bg-bg-secondary border border-border-default rounded-xl p-6">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          Alocação de Ativos por Gênero
        </h3>
        <p className="text-sm text-text-tertiary">
          Distribuição do seu portfolio por categoria musical
        </p>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-8">
        {/* Pie Chart */}
        <div className="flex-1 w-full" style={{ minHeight: "300px" }}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={CustomLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend with values */}
        <div className="flex-1 w-full">
          <div className="space-y-3">
            {chartData
              .sort((a, b) => b.percentage - a.percentage)
              .map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-bg-elevated rounded-lg hover:bg-bg-primary transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium text-text-primary">
                      {item.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono font-medium text-text-primary">
                      {item.percentage.toFixed(1)}%
                    </div>
                    <div className="text-xs text-text-tertiary">
                      R$ {item.value.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

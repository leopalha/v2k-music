"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { cn } from "@/lib/utils/cn";

interface RoyaltyPieChartProps {
  data: {
    spotify: number;
    youtube: number;
    appleMusic: number;
    other: number;
  };
  className?: string;
}

const COLORS = {
  spotify: "#1DB954",
  youtube: "#FF0000",
  appleMusic: "#FC3C44",
  other: "#737373",
};

const LABELS = {
  spotify: "Spotify",
  youtube: "YouTube",
  appleMusic: "Apple Music",
  other: "Outros",
};

export function RoyaltyPieChart({ data, className }: RoyaltyPieChartProps) {
  // Validate data with fallbacks
  const safeData = {
    spotify: data?.spotify ?? 0,
    youtube: data?.youtube ?? 0,
    appleMusic: data?.appleMusic ?? 0,
    other: data?.other ?? 0,
  };

  const chartData = [
    { name: "Spotify", value: safeData.spotify, color: COLORS.spotify },
    { name: "YouTube", value: safeData.youtube, color: COLORS.youtube },
    { name: "Apple Music", value: safeData.appleMusic, color: COLORS.appleMusic },
    { name: "Outros", value: safeData.other, color: COLORS.other },
  ];

  // Normalize to 100%
  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  const normalizedData = chartData.map((item) => ({
    ...item,
    value: Math.round((item.value / total) * 100),
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-bg-secondary border border-border-default rounded-xl p-3 shadow-lg">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: payload[0].payload.color }}
            />
            <span className="text-sm font-medium text-text-primary">
              {payload[0].name}
            </span>
          </div>
          <p className="text-lg font-mono font-bold text-text-primary mt-1">
            {payload[0].value}%
          </p>
        </div>
      );
    }
    return null;
  };

  // Check if there's any data
  const hasData = total > 0;

  if (!hasData) {
    return (
      <div className={cn("flex items-center justify-center h-40", className)}>
        <p className="text-text-tertiary text-sm">Sem dados de royalties disponíveis</p>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-6", className)}>
      {/* Chart */}
      <div className="w-40 h-40 flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={normalizedData}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={70}
              paddingAngle={2}
              dataKey="value"
            >
              {normalizedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="space-y-3">
        {normalizedData.map((item) => (
          <div key={item.name} className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <div className="flex-1">
              <div className="text-sm text-text-secondary">{item.name}</div>
            </div>
            <div className="text-sm font-mono font-medium text-text-primary">
              {item.value}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

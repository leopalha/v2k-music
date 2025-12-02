'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface StreamsPlatformChartProps {
  data: {
    spotify: number;
    youtube: number;
    tiktok: number;
    apple: number;
  };
}

const COLORS = {
  spotify: '#1DB954',
  youtube: '#FF0000',
  tiktok: '#000000',
  apple: '#FA243C',
};

export default function StreamsPlatformChart({ data }: StreamsPlatformChartProps) {
  const chartData = [
    { name: 'Spotify', value: data.spotify, color: COLORS.spotify },
    { name: 'YouTube', value: data.youtube, color: COLORS.youtube },
    { name: 'TikTok', value: data.tiktok, color: COLORS.tiktok },
    { name: 'Apple Music', value: data.apple, color: COLORS.apple },
  ].filter(item => item.value > 0); // Only show platforms with data

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[300px]">
        <p className="text-text-tertiary">Nenhum dado de streams disponível</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => value.toLocaleString()}
          contentStyle={{
            backgroundColor: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: '8px',
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

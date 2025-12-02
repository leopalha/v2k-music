'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency, formatNumber } from '@/lib/utils';

interface PerformanceTimelineChartProps {
  data: Array<{
    date: string;
    streams: number;
    revenue: number;
  }>;
}

export default function PerformanceTimelineChart({ data }: PerformanceTimelineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[300px]">
        <p className="text-text-tertiary">Nenhum dado disponível</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
        <XAxis
          dataKey="date"
          stroke="#888"
          tick={{ fill: '#888' }}
          tickFormatter={(value) => {
            const date = new Date(value);
            return `${date.getDate()}/${date.getMonth() + 1}`;
          }}
        />
        <YAxis
          yAxisId="left"
          stroke="#888"
          tick={{ fill: '#888' }}
          tickFormatter={(value) => formatNumber(value)}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          stroke="#888"
          tick={{ fill: '#888' }}
          tickFormatter={(value) => formatCurrency(value)}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: '8px',
          }}
          labelFormatter={(value) => {
            const date = new Date(value);
            return date.toLocaleDateString('pt-BR');
          }}
          formatter={(value: number, name: string) => {
            if (name === 'Streams') {
              return [formatNumber(value), name];
            }
            return [formatCurrency(value), name];
          }}
        />
        <Legend />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="streams"
          name="Streams"
          stroke="#8b5cf6"
          strokeWidth={2}
          dot={false}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="revenue"
          name="Revenue"
          stroke="#10b981"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

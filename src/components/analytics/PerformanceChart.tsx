'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import PeriodSelector from './PeriodSelector';

interface PerformanceData {
  history: {
    date: string;
    portfolioValue: number;
    profitLoss: number;
    royalties: number;
  }[];
  summary: {
    startValue: number;
    endValue: number;
    change: number;
    changePercent: number;
  };
}

export default function PerformanceChart() {
  const [period, setPeriod] = useState('30d');
  const [data, setData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPerformance() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/analytics/performance?period=${period}`);

        if (!response.ok) {
          throw new Error('Failed to fetch performance data');
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error('Error fetching performance:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchPerformance();
  }, [period]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Erro ao carregar gráfico: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Performance do Portfolio</h3>
          {data && (
            <p className="text-sm text-gray-600 mt-1">
              {formatCurrency(data.summary.change)}{' '}
              <span className={data.summary.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}>
                ({data.summary.changePercent >= 0 ? '+' : ''}
                {data.summary.changePercent.toFixed(2)}%)
              </span>{' '}
              no período
            </p>
          )}
        </div>
        <PeriodSelector value={period} onChange={setPeriod} />
      </div>

      {loading ? (
        <div className="h-80 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : data && data.history.length > 0 ? (
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={data.history}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorRoyalties" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              stroke="#6B7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              tickFormatter={(value) => formatCurrency(value)}
              stroke="#6B7280"
              style={{ fontSize: '12px' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFF',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                padding: '12px',
              }}
              labelFormatter={(label) => {
                const date = new Date(label);
                return date.toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                });
              }}
              formatter={(value: number) => formatCurrency(value)}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="portfolioValue"
              name="Valor do Portfolio"
              stroke="#3B82F6"
              strokeWidth={2}
              fill="url(#colorValue)"
            />
            <Area
              type="monotone"
              dataKey="royalties"
              name="Royalties Acumulados"
              stroke="#10B981"
              strokeWidth={2}
              fill="url(#colorRoyalties)"
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-80 flex items-center justify-center">
          <p className="text-gray-500">Nenhum dado disponível</p>
        </div>
      )}
    </div>
  );
}

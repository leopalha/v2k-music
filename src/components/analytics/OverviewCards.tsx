'use client';

import { useEffect, useState } from 'react';
import StatCard from './StatCard';
import { TrendingUp, DollarSign, Wallet, Music } from 'lucide-react';

interface OverviewData {
  totalInvested: number;
  currentValue: number;
  totalProfitLoss: number;
  totalProfitLossPercent: number;
  totalRoyalties: number;
  tracksOwned: number;
  avgROI: number;
  bestPerformingTrack: {
    id: string;
    title: string;
    artist: string;
    roi: number;
    profitLoss: number;
  } | null;
  worstPerformingTrack: {
    id: string;
    title: string;
    artist: string;
    roi: number;
    profitLoss: number;
  } | null;
}

export default function OverviewCards() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOverview() {
      try {
        const response = await fetch('/api/analytics/overview');

        if (!response.ok) {
          throw new Error('Failed to fetch analytics overview');
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error('Error fetching overview:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchOverview();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Erro ao carregar dados: {error}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Valor do Portfolio"
        value={data ? formatCurrency(data.currentValue) : '—'}
        change={data?.totalProfitLossPercent}
        changeLabel="total"
        icon={Wallet}
        iconColor="text-blue-600"
        iconBgColor="bg-blue-100"
        loading={loading}
      />

      <StatCard
        title="Total Investido"
        value={data ? formatCurrency(data.totalInvested) : '—'}
        icon={DollarSign}
        iconColor="text-green-600"
        iconBgColor="bg-green-100"
        loading={loading}
      />

      <StatCard
        title="Lucro/Prejuízo"
        value={data ? formatCurrency(data.totalProfitLoss) : '—'}
        change={data?.totalProfitLossPercent}
        icon={TrendingUp}
        iconColor={data && data.totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}
        iconBgColor={data && data.totalProfitLoss >= 0 ? 'bg-green-100' : 'bg-red-100'}
        loading={loading}
      />

      <StatCard
        title="Músicas no Portfolio"
        value={data?.tracksOwned ?? '—'}
        icon={Music}
        iconColor="text-purple-600"
        iconBgColor="bg-purple-100"
        loading={loading}
      />
    </div>
  );
}

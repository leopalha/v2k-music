'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout, PageHeader } from '@/components/layout';
import { Play, DollarSign, Users, TrendingUp, Download, Loader2, Music } from 'lucide-react';
import { Button } from '@/components/ui';
import { formatCurrency, formatNumber } from '@/lib/utils';
import AnalyticsCard from '@/components/artist/AnalyticsCard';
import StreamsPlatformChart from '@/components/artist/StreamsPlatformChart';
import PerformanceTimelineChart from '@/components/artist/PerformanceTimelineChart';
import TopHoldersTable from '@/components/artist/TopHoldersTable';
import Link from 'next/link';

interface AnalyticsData {
  overview: {
    totalStreams: number;
    totalRevenue: number;
    totalHolders: number;
    avgRoyaltyPerStream: number;
  };
  streamsByPlatform: {
    spotify: number;
    youtube: number;
    tiktok: number;
    apple: number;
  };
  revenueBreakdown: {
    tokenSales: number;
    royalties: number;
    streamingRevenue: number;
  };
  topTracks: Array<{
    id: string;
    title: string;
    coverUrl: string;
    streams: number;
    revenue: number;
    holders: number;
    status: string;
  }>;
  holdersDemographics: {
    totalHolders: number;
    avgTokensPerHolder: number;
    topHolders: Array<{
      userId: string;
      username: string;
      profileImageUrl: string | null;
      tokens: number;
      percentage: number;
    }>;
  };
  performanceOverTime: Array<{
    date: string;
    streams: number;
    revenue: number;
  }>;
}

export default function ArtistAnalyticsPage() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('/api/artist/analytics');
        if (!res.ok) throw new Error('Failed to fetch analytics');
        const data = await res.json();
        setAnalytics(data);
      } catch (err) {
        console.error(err);
        setError('Erro ao carregar analytics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const handleExportCSV = () => {
    if (!analytics) return;

    // Prepare CSV data
    const csvRows = [
      ['V2K Music - Analytics Report'],
      ['Generated:', new Date().toLocaleDateString('pt-BR')],
      [''],
      ['Overview'],
      ['Total Streams', analytics.overview.totalStreams],
      ['Total Revenue', `R$ ${analytics.overview.totalRevenue.toFixed(2)}`],
      ['Total Holders', analytics.overview.totalHolders],
      ['Avg Royalty/Stream', `R$ ${analytics.overview.avgRoyaltyPerStream.toFixed(3)}`],
      [''],
      ['Revenue Breakdown'],
      ['Token Sales', `R$ ${analytics.revenueBreakdown.tokenSales.toFixed(2)}`],
      ['Royalties', `R$ ${analytics.revenueBreakdown.royalties.toFixed(2)}`],
      [''],
      ['Top Tracks'],
      ['Title', 'Streams', 'Revenue', 'Holders'],
      ...analytics.topTracks.map(t => [
        t.title,
        t.streams,
        `R$ ${t.revenue.toFixed(2)}`,
        t.holders,
      ]),
    ];

    // Convert to CSV string
    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `v2k-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (error || !analytics) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <p className="text-text-secondary">{error || 'Erro ao carregar analytics'}</p>
          <Button onClick={() => router.back()}>Voltar</Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <PageHeader
          title="Analytics"
          subtitle="Análise completa do desempenho das suas músicas"
          action={{
            label: 'Exportar CSV',
            onClick: handleExportCSV,
            icon: <Download className="w-4 h-4" />,
          }}
        />

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <AnalyticsCard
            title="Total Streams"
            value={formatNumber(analytics.overview.totalStreams)}
            icon={<Play className="w-5 h-5 text-primary" />}
            subtitle="Todas as plataformas"
          />
          <AnalyticsCard
            title="Receita Total"
            value={formatCurrency(analytics.overview.totalRevenue)}
            icon={<DollarSign className="w-5 h-5 text-accent-green" />}
            subtitle="Vendas + Royalties"
          />
          <AnalyticsCard
            title="Total de Holders"
            value={analytics.overview.totalHolders}
            icon={<Users className="w-5 h-5 text-secondary" />}
            subtitle="Investidores únicos"
          />
          <AnalyticsCard
            title="Royalty/Stream"
            value={formatCurrency(analytics.overview.avgRoyaltyPerStream)}
            icon={<TrendingUp className="w-5 h-5 text-accent" />}
            subtitle="Média por reprodução"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Performance Timeline */}
          <div className="bg-bg-secondary border border-border-primary rounded-xl p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Performance (Últimos 30 dias)
            </h3>
            <PerformanceTimelineChart data={analytics.performanceOverTime} />
          </div>

          {/* Streams by Platform */}
          <div className="bg-bg-secondary border border-border-primary rounded-xl p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Streams por Plataforma
            </h3>
            <StreamsPlatformChart data={analytics.streamsByPlatform} />
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div className="bg-bg-secondary border border-border-primary rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-text-primary mb-6">
            Breakdown de Receita
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm text-text-tertiary mb-2">Vendas de Tokens</p>
              <p className="text-3xl font-bold text-primary">
                {formatCurrency(analytics.revenueBreakdown.tokenSales)}
              </p>
              <p className="text-xs text-text-tertiary mt-1">
                {analytics.revenueBreakdown.tokenSales > 0
                  ? ((analytics.revenueBreakdown.tokenSales / analytics.overview.totalRevenue) * 100).toFixed(0)
                  : 0}% do total
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-text-tertiary mb-2">Royalties</p>
              <p className="text-3xl font-bold text-accent-green">
                {formatCurrency(analytics.revenueBreakdown.royalties)}
              </p>
              <p className="text-xs text-text-tertiary mt-1">
                {analytics.revenueBreakdown.royalties > 0
                  ? ((analytics.revenueBreakdown.royalties / analytics.overview.totalRevenue) * 100).toFixed(0)
                  : 0}% do total
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-text-tertiary mb-2">Streaming</p>
              <p className="text-3xl font-bold text-secondary">
                {formatCurrency(analytics.revenueBreakdown.streamingRevenue)}
              </p>
              <p className="text-xs text-text-tertiary mt-1">Em breve</p>
            </div>
          </div>
        </div>

        {/* Top Tracks */}
        <div className="bg-bg-secondary border border-border-primary rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-text-primary mb-6">
            Top Músicas por Streams
          </h3>
          {analytics.topTracks.length > 0 ? (
            <div className="space-y-4">
              {analytics.topTracks.map((track, index) => (
                <Link
                  key={track.id}
                  href={`/track/${track.id}`}
                  className="flex items-center gap-4 p-4 bg-bg-tertiary hover:bg-bg-elevated rounded-lg transition-colors"
                >
                  <span className="text-2xl font-bold text-text-tertiary w-8">
                    #{index + 1}
                  </span>
                  <div className="w-12 h-12 rounded-lg bg-bg-elevated overflow-hidden flex-shrink-0">
                    {track.coverUrl ? (
                      <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        <Music className="w-5 h-5 text-text-tertiary" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-text-primary truncate">{track.title}</h4>
                    <p className="text-sm text-text-tertiary">
                      {formatNumber(track.streams)} streams • {track.holders} holders
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-accent-green">{formatCurrency(track.revenue)}</p>
                    <p className="text-xs text-text-tertiary">{track.status}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Music className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
              <p className="text-text-secondary">Nenhuma música ainda</p>
            </div>
          )}
        </div>

        {/* Top Holders */}
        <div className="bg-bg-secondary border border-border-primary rounded-xl p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-6">
            Top 10 Holders
          </h3>
          <TopHoldersTable holders={analytics.holdersDemographics.topHolders} />
          <div className="mt-6 pt-6 border-t border-border-subtle">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-sm text-text-tertiary mb-1">Média de Tokens/Holder</p>
                <p className="text-2xl font-bold text-text-primary">
                  {formatNumber(analytics.holdersDemographics.avgTokensPerHolder)}
                </p>
              </div>
              <div>
                <p className="text-sm text-text-tertiary mb-1">Total de Holders</p>
                <p className="text-2xl font-bold text-text-primary">
                  {analytics.holdersDemographics.totalHolders}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

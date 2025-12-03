'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Music, TrendingUp, DollarSign } from 'lucide-react';

interface AdminStats {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalTracks: number;
    totalTransactions: number;
    totalRevenue: number;
    todayUsers: number;
    todayTransactions: number;
    todayRevenue: number;
  };
  topTracks: Array<{
    id: string;
    title: string;
    artist: string;
    _count: { transactions: number };
  }>;
  recentTransactions: Array<{
    id: string;
    type: string;
    amount: number;
    createdAt: string;
    user: { name: string | null; email: string };
    track: { title: string; artist: string };
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-500">Erro: {error}</div>
      </div>
    );
  }

  if (!stats) return null;

  const { overview, topTracks, recentTransactions } = stats;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do sistema</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" data-testid="admin-stats">
        <Card data-testid="stat-total-users">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{overview.todayUsers} hoje
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.activeUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Últimos 30 dias
            </p>
          </CardContent>
        </Card>

        <Card data-testid="stat-total-tracks">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Músicas</CardTitle>
            <Music className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalTracks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {overview.totalTransactions.toLocaleString()} transações
            </p>
          </CardContent>
        </Card>

        <Card data-testid="stat-total-investments">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {(overview.totalRevenue / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              R$ {(overview.todayRevenue / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} hoje
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Tracks */}
        <Card>
          <CardHeader>
            <CardTitle>Músicas Mais Negociadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topTracks.map((track, index) => (
                <div key={track.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{track.title}</div>
                      <div className="text-sm text-muted-foreground">{track.artist}</div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {track._count.transactions} transações
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Transações Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">
                      {tx.track.title} - {tx.track.artist}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {tx.user.name || tx.user.email}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {tx.type === 'BUY' ? '+' : '-'}R$ {(tx.amount / 100).toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(tx.createdAt).toLocaleTimeString('pt-BR')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { AppLayout, PageHeader } from "@/components/layout";
import { Button } from "@/components/ui";
import {
  Music,
  Plus,
  TrendingUp,
  DollarSign,
  Users,
  Play,
  MoreVertical,
  Upload,
  BarChart3,
  Loader2,
} from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/utils";
import Link from "next/link";

interface ArtistStats {
  totalEarnings: number;
  monthlyEarnings: number;
  totalStreams: number;
  totalInvestors: number;
  tracksListed: number;
  pendingTracks: number;
}

interface Track {
  id: string;
  title: string;
  coverUrl: string;
  status: string;
  tokenInfo: {
    total: number;
    sold: number;
    available: number;
    pricePerToken: number;
  };
  earnings: {
    totalRaised: number;
    monthlyStreams: number;
    monthlyRoyalties: number;
  };
  holders: number;
}

export default function ArtistDashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [stats, setStats] = useState<ArtistStats | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingTracks, setIsLoadingTracks] = useState(true);
  const [error, setError] = useState("");

  // Fetch stats on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/artist/stats");
        if (!res.ok) throw new Error("Failed to fetch stats");
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error(err);
        setError("Erro ao carregar estatísticas");
      } finally {
        setIsLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  // Fetch tracks on mount
  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const res = await fetch("/api/artist/tracks");
        if (!res.ok) throw new Error("Failed to fetch tracks");
        const data = await res.json();
        setTracks(data.tracks || []);
      } catch (err) {
        console.error(err);
        setError("Erro ao carregar músicas");
      } finally {
        setIsLoadingTracks(false);
      }
    };
    fetchTracks();
  }, []);

  const getStatusBadge = (status: string) => {
    const normalized = status.toUpperCase();
    switch (normalized) {
      case "LIVE":
        return (
          <span className="px-2 py-1 bg-accent-green/10 text-accent-green text-xs font-medium rounded-full">
            Ativo
          </span>
        );
      case "PENDING":
        return (
          <span className="px-2 py-1 bg-yellow-500/10 text-yellow-500 text-xs font-medium rounded-full">
            Pendente
          </span>
        );
      case "REJECTED":
        return (
          <span className="px-2 py-1 bg-error/10 text-error text-xs font-medium rounded-full">
            Rejeitado
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <PageHeader
          title="Dashboard do Artista"
          subtitle="Gerencie suas músicas e acompanhe seus ganhos"
          action={{
            label: "Nova Música",
            onClick: () => router.push("/artist/upload"),
            icon: <Plus className="w-4 h-4" />,
          }}
        />

        {/* Stats Grid */}
        {isLoadingStats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-bg-secondary rounded-xl p-5 border border-border-primary animate-pulse">
                <div className="h-4 bg-bg-tertiary rounded w-24 mb-3"></div>
                <div className="h-8 bg-bg-tertiary rounded w-32 mb-1"></div>
                <div className="h-3 bg-bg-tertiary rounded w-20"></div>
              </div>
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-bg-secondary rounded-xl p-5 border border-border-primary">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-accent-green/10 rounded-lg">
                  <DollarSign className="w-5 h-5 text-accent-green" />
                </div>
                <span className="text-sm text-text-secondary">Total Arrecadado</span>
              </div>
              <p className="text-2xl font-bold text-text-primary">
                {formatCurrency(stats.totalEarnings)}
              </p>
              <p className="text-xs text-accent-green mt-1">
                +{formatCurrency(stats.monthlyEarnings)} este mês
              </p>
            </div>

            <div className="bg-bg-secondary rounded-xl p-5 border border-border-primary">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Play className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm text-text-secondary">Total de Streams</span>
              </div>
              <p className="text-2xl font-bold text-text-primary">
                {formatNumber(stats.totalStreams)}
              </p>
              <p className="text-xs text-text-tertiary mt-1">Todas as plataformas</p>
            </div>

            <div className="bg-bg-secondary rounded-xl p-5 border border-border-primary">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <Users className="w-5 h-5 text-secondary" />
                </div>
                <span className="text-sm text-text-secondary">Investidores</span>
              </div>
              <p className="text-2xl font-bold text-text-primary">
                {stats.totalInvestors}
              </p>
              <p className="text-xs text-text-tertiary mt-1">Holders únicos</p>
            </div>

            <div className="bg-bg-secondary rounded-xl p-5 border border-border-primary">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Music className="w-5 h-5 text-accent" />
                </div>
                <span className="text-sm text-text-secondary">Músicas Listadas</span>
              </div>
              <p className="text-2xl font-bold text-text-primary">
                {stats.tracksListed}
              </p>
              <p className="text-xs text-text-tertiary mt-1">
                {stats.pendingTracks > 0 && `${stats.pendingTracks} pendentes`}
              </p>
            </div>
          </div>
        ) : null}

        {/* My Tracks Section */}
        <div className="bg-bg-secondary rounded-xl border border-border-primary overflow-hidden">
          <div className="p-6 border-b border-border-subtle">
            <h2 className="text-lg font-semibold text-text-primary">Minhas Músicas</h2>
          </div>

          {isLoadingTracks ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-text-tertiary mx-auto" />
              <p className="text-text-secondary mt-3">Carregando músicas...</p>
            </div>
          ) : tracks.length > 0 ? (
            <div className="divide-y divide-border-subtle">
              {tracks.map((track) => (
                <div
                  key={track.id}
                  className="p-6 hover:bg-bg-elevated transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {/* Cover */}
                    <div className="w-16 h-16 rounded-lg bg-bg-tertiary overflow-hidden flex-shrink-0">
                      {track.coverUrl ? (
                        <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                          <Music className="w-6 h-6 text-text-tertiary" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-text-primary truncate">
                          {track.title}
                        </h3>
                        {getStatusBadge(track.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-text-secondary">
                        <span>
                          {track.tokenInfo.sold.toLocaleString()} / {track.tokenInfo.total.toLocaleString()} tokens
                        </span>
                        <span>•</span>
                        <span>{formatCurrency(track.tokenInfo.pricePerToken)} / token</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="hidden md:flex items-center gap-8">
                      <div className="text-right">
                        <p className="text-sm text-text-secondary">Arrecadado</p>
                        <p className="font-semibold text-text-primary">
                          {formatCurrency(track.earnings.totalRaised)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-text-secondary">Streams/mês</p>
                        <p className="font-semibold text-text-primary">
                          {formatNumber(track.earnings.monthlyStreams)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-text-secondary">Royalties/mês</p>
                        <p className="font-semibold text-accent-green">
                          {formatCurrency(track.earnings.monthlyRoyalties)}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <BarChart3 className="w-4 h-4" />
                      </Button>
                      <button className="p-2 hover:bg-bg-tertiary rounded-lg transition-colors">
                        <MoreVertical className="w-5 h-5 text-text-tertiary" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-text-tertiary mb-1">
                      <span>Progresso da venda</span>
                      <span>
                        {Math.round((track.tokenInfo.sold / track.tokenInfo.total) * 100)}%
                      </span>
                    </div>
                    <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all"
                        style={{
                          width: `${(track.tokenInfo.sold / track.tokenInfo.total) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <Upload className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Nenhuma música ainda
              </h3>
              <p className="text-text-secondary mb-6">
                Liste sua primeira música e comece a receber investimentos
              </p>
              <Link href="/artist/upload">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Música
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <button className="flex items-center gap-4 p-6 bg-bg-secondary rounded-xl border border-border-primary hover:border-primary/50 transition-colors text-left">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-text-primary">Upload de Música</p>
              <p className="text-sm text-text-secondary">Adicionar nova faixa</p>
            </div>
          </button>

          <button className="flex items-center gap-4 p-6 bg-bg-secondary rounded-xl border border-border-primary hover:border-primary/50 transition-colors text-left">
            <div className="p-3 bg-accent-green/10 rounded-lg">
              <DollarSign className="w-6 h-6 text-accent-green" />
            </div>
            <div>
              <p className="font-semibold text-text-primary">Distribuir Royalties</p>
              <p className="text-sm text-text-secondary">Pagar investidores</p>
            </div>
          </button>

          <button className="flex items-center gap-4 p-6 bg-bg-secondary rounded-xl border border-border-primary hover:border-primary/50 transition-colors text-left">
            <div className="p-3 bg-secondary/10 rounded-lg">
              <BarChart3 className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <p className="font-semibold text-text-primary">Ver Analytics</p>
              <p className="text-sm text-text-secondary">Métricas detalhadas</p>
            </div>
          </button>
        </div>
      </div>
    </AppLayout>
  );
}

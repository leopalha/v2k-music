"use client";

import { useState } from "react";
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
} from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/utils";

// Mock data
const mockArtistStats = {
  totalEarnings: 45000,
  monthlyEarnings: 8500,
  totalStreams: 12500000,
  totalInvestors: 342,
  tracksListed: 5,
};

const mockTracks = [
  {
    id: 1,
    title: "Modo Turbo",
    coverUrl: "/api/placeholder/80/80",
    status: "active",
    tokensTotal: 10000,
    tokensSold: 6500,
    currentPrice: 0.015,
    totalRaised: 97.5,
    monthlyStreams: 2500000,
    monthlyRoyalties: 2500,
  },
  {
    id: 2,
    title: "Rave de Favela",
    coverUrl: "/api/placeholder/80/80",
    status: "active",
    tokensTotal: 8000,
    tokensSold: 6000,
    currentPrice: 0.02,
    totalRaised: 120,
    monthlyStreams: 1800000,
    monthlyRoyalties: 1800,
  },
  {
    id: 3,
    title: "Beat Envolvente",
    coverUrl: "/api/placeholder/80/80",
    status: "pending",
    tokensTotal: 12000,
    tokensSold: 0,
    currentPrice: 0.01,
    totalRaised: 0,
    monthlyStreams: 0,
    monthlyRoyalties: 0,
  },
];

export default function ArtistDashboardPage() {
  const [selectedTrack, setSelectedTrack] = useState<number | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="px-2 py-1 bg-accent-green/10 text-accent-green text-xs font-medium rounded-full">
            Ativo
          </span>
        );
      case "pending":
        return (
          <span className="px-2 py-1 bg-yellow-500/10 text-yellow-500 text-xs font-medium rounded-full">
            Pendente
          </span>
        );
      case "sold_out":
        return (
          <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
            Esgotado
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
            onClick: () => console.log("Nova música"),
            icon: <Plus className="w-4 h-4" />,
          }}
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-bg-secondary rounded-xl p-5 border border-border-primary">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-accent-green/10 rounded-lg">
                <DollarSign className="w-5 h-5 text-accent-green" />
              </div>
              <span className="text-sm text-text-secondary">Total Arrecadado</span>
            </div>
            <p className="text-2xl font-bold text-text-primary">
              {formatCurrency(mockArtistStats.totalEarnings)}
            </p>
            <p className="text-xs text-accent-green mt-1">
              +{formatCurrency(mockArtistStats.monthlyEarnings)} este mês
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
              {formatNumber(mockArtistStats.totalStreams)}
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
              {mockArtistStats.totalInvestors}
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
              {mockArtistStats.tracksListed}
            </p>
            <p className="text-xs text-text-tertiary mt-1">Na plataforma</p>
          </div>
        </div>

        {/* My Tracks Section */}
        <div className="bg-bg-secondary rounded-xl border border-border-primary overflow-hidden">
          <div className="p-6 border-b border-border-subtle">
            <h2 className="text-lg font-semibold text-text-primary">Minhas Músicas</h2>
          </div>

          {mockTracks.length > 0 ? (
            <div className="divide-y divide-border-subtle">
              {mockTracks.map((track) => (
                <div
                  key={track.id}
                  className="p-6 hover:bg-bg-elevated transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {/* Cover */}
                    <div className="w-16 h-16 rounded-lg bg-bg-tertiary overflow-hidden flex-shrink-0">
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        <Music className="w-6 h-6 text-text-tertiary" />
                      </div>
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
                          {track.tokensSold.toLocaleString()} / {track.tokensTotal.toLocaleString()} tokens
                        </span>
                        <span>•</span>
                        <span>{formatCurrency(track.currentPrice)} / token</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="hidden md:flex items-center gap-8">
                      <div className="text-right">
                        <p className="text-sm text-text-secondary">Arrecadado</p>
                        <p className="font-semibold text-text-primary">
                          {formatCurrency(track.totalRaised)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-text-secondary">Streams/mês</p>
                        <p className="font-semibold text-text-primary">
                          {formatNumber(track.monthlyStreams)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-text-secondary">Royalties/mês</p>
                        <p className="font-semibold text-accent-green">
                          {formatCurrency(track.monthlyRoyalties)}
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
                        {Math.round((track.tokensSold / track.tokensTotal) * 100)}%
                      </span>
                    </div>
                    <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all"
                        style={{
                          width: `${(track.tokensSold / track.tokensTotal) * 100}%`,
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
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Música
              </Button>
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

"use client";

import { useState, useEffect } from "react";
import { AppLayout, PageHeader } from "@/components/layout";
import { Button, Badge } from "@/components/ui";
import {
  Eye,
  TrendingUp,
  TrendingDown,
  Trash2,
  LineChart,
  DollarSign,
  Activity,
  Star
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";

interface WatchlistTrack {
  id: string;
  trackId: string;
  tokenId: number | null;
  title: string;
  artistName: string;
  genre: string;
  coverUrl: string;
  currentPrice: number;
  initialPrice: number;
  priceChange: number;
  priceChangePercent: number;
  priceChange24h: number;
  volume24h: number;
  totalSupply: number;
  availableSupply: number;
  soldPercentage: number;
  marketCap: number;
  holders: number;
  totalStreams: number;
  monthlyRoyalty: number;
  totalRoyalties: number;
  aiScore: number;
  predictedROI: number | null;
  addedAt: Date;
}

interface WatchlistSummary {
  totalTracks: number;
  avgPriceChange: number;
  gainers: number;
  losers: number;
  totalVolume24h: number;
  avgAiScore: number;
}

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<WatchlistTrack[]>([]);
  const [summary, setSummary] = useState<WatchlistSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"added" | "performance" | "volume">("performance");

  // Fetch watchlist
  const fetchWatchlist = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/watchlist");

      if (!response.ok) {
        throw new Error("Failed to fetch watchlist");
      }

      const data = await response.json();
      setWatchlist(data.watchlist);
      setSummary(data.summary);
    } catch (error) {
      console.error("Error fetching watchlist:", error);
      toast.error("Erro ao carregar watchlist");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  // Remove from watchlist
  const handleRemove = async (trackId: string) => {
    if (!confirm("Remover esta música da watchlist?")) {
      return;
    }

    try {
      setDeletingId(trackId);
      const response = await fetch(`/api/watchlist/${trackId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to remove from watchlist");
      }

      toast.success("Música removida da watchlist");
      setWatchlist((prev) => prev.filter((t) => t.trackId !== trackId));

      // Recalculate summary
      if (summary) {
        setSummary({
          ...summary,
          totalTracks: summary.totalTracks - 1,
        });
      }
    } catch (error) {
      console.error("Error removing from watchlist:", error);
      toast.error("Erro ao remover da watchlist");
    } finally {
      setDeletingId(null);
    }
  };

  // Sort watchlist
  const sortedWatchlist = [...watchlist].sort((a, b) => {
    switch (sortBy) {
      case "performance":
        return b.priceChangePercent - a.priceChangePercent;
      case "volume":
        return b.volume24h - a.volume24h;
      case "added":
      default:
        return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
    }
  });

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <PageHeader
          title="Watchlist"
          subtitle="Acompanhe o desempenho das músicas que você está observando"
        />

        {/* Summary Stats */}
        {summary && watchlist.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-bg-secondary border border-border-default rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary">Total de Músicas</p>
                  <p className="text-2xl font-bold text-text-primary mt-1">
                    {summary.totalTracks}
                  </p>
                </div>
                <Eye className="w-8 h-8 text-text-tertiary" />
              </div>
            </div>

            <div className="bg-bg-secondary border border-border-default rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary">Performance Média</p>
                  <p className={`text-2xl font-bold mt-1 ${
                    summary.avgPriceChange >= 0 ? "text-success" : "text-error"
                  }`}>
                    {summary.avgPriceChange >= 0 ? "+" : ""}
                    {summary.avgPriceChange.toFixed(1)}%
                  </p>
                </div>
                {summary.avgPriceChange >= 0 ? (
                  <TrendingUp className="w-8 h-8 text-success" />
                ) : (
                  <TrendingDown className="w-8 h-8 text-error" />
                )}
              </div>
            </div>

            <div className="bg-bg-secondary border border-border-default rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary">Ganhadores / Perdedores</p>
                  <p className="text-2xl font-bold text-text-primary mt-1">
                    <span className="text-success">{summary.gainers}</span>
                    {" / "}
                    <span className="text-error">{summary.losers}</span>
                  </p>
                </div>
                <Activity className="w-8 h-8 text-text-tertiary" />
              </div>
            </div>

            <div className="bg-bg-secondary border border-border-default rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary">AI Score Médio</p>
                  <p className="text-2xl font-bold text-primary mt-1">
                    {summary.avgAiScore.toFixed(0)}/100
                  </p>
                </div>
                <Star className="w-8 h-8 text-primary" />
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && watchlist.length === 0 && (
          <div className="bg-bg-secondary border border-border-default rounded-lg p-12 text-center">
            <Eye className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              Nenhuma música na watchlist
            </h3>
            <p className="text-text-secondary mb-6">
              Adicione músicas à sua watchlist para acompanhar o desempenho delas
            </p>
            <Link href="/marketplace">
              <Button variant="primary">
                <Eye className="w-4 h-4 mr-2" />
                Explorar Marketplace
              </Button>
            </Link>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <p className="text-text-secondary">Carregando watchlist...</p>
          </div>
        )}

        {/* Watchlist Items */}
        {!isLoading && watchlist.length > 0 && (
          <div>
            {/* Sort Controls */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-text-primary">
                Músicas ({watchlist.length})
              </h2>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-4 py-2 bg-bg-secondary border border-border-primary rounded-lg text-sm focus:outline-none focus:border-primary transition-colors"
              >
                <option value="performance">Melhor Performance</option>
                <option value="volume">Maior Volume</option>
                <option value="added">Adicionado Recentemente</option>
              </select>
            </div>

            {/* Tracks List */}
            <div className="space-y-4">
              {sortedWatchlist.map((track) => (
                <WatchlistCard
                  key={track.id}
                  track={track}
                  onRemove={() => handleRemove(track.trackId)}
                  isDeleting={deletingId === track.trackId}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

interface WatchlistCardProps {
  track: WatchlistTrack;
  onRemove: () => void;
  isDeleting: boolean;
}

function WatchlistCard({ track, onRemove, isDeleting }: WatchlistCardProps) {
  return (
    <div className="bg-bg-secondary border border-border-default rounded-lg p-4 hover:border-border-hover transition-colors">
      <div className="flex items-start gap-4">
        {/* Cover Art */}
        <Link href={`/track/${track.trackId}`}>
          <img
            src={track.coverUrl}
            alt={track.title}
            className="w-20 h-20 rounded-lg object-cover flex-shrink-0 hover:opacity-80 transition-opacity cursor-pointer"
          />
        </Link>

        {/* Track Info & Metrics */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex-1 min-w-0">
              <Link href={`/track/${track.trackId}`}>
                <h3 className="font-semibold text-text-primary truncate hover:text-primary transition-colors cursor-pointer">
                  {track.title}
                </h3>
              </Link>
              <p className="text-sm text-text-secondary truncate">{track.artistName}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="default" size="sm">
                  {track.genre}
                </Badge>
                <Badge variant="primary" size="sm">
                  AI Score: {track.aiScore}/100
                </Badge>
              </div>
            </div>

            {/* Price Performance */}
            <div className="text-right flex-shrink-0">
              <p className="text-lg font-bold text-text-primary">
                R$ {track.currentPrice.toFixed(2)}
              </p>
              <div className="flex items-center gap-1 justify-end">
                {track.priceChangePercent >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-success" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-error" />
                )}
                <p className={`text-sm font-semibold ${
                  track.priceChangePercent >= 0 ? "text-success" : "text-error"
                }`}>
                  {track.priceChangePercent >= 0 ? "+" : ""}
                  {track.priceChangePercent.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
            <div>
              <p className="text-xs text-text-tertiary">Volume 24h</p>
              <p className="text-sm font-semibold text-text-primary">
                R$ {track.volume24h.toFixed(2)}
              </p>
            </div>

            <div>
              <p className="text-xs text-text-tertiary">Market Cap</p>
              <p className="text-sm font-semibold text-text-primary">
                R$ {(track.marketCap / 1000).toFixed(1)}K
              </p>
            </div>

            <div>
              <p className="text-xs text-text-tertiary">Royalty Mensal</p>
              <p className="text-sm font-semibold text-text-primary">
                R$ {track.monthlyRoyalty.toFixed(2)}
              </p>
            </div>

            <div>
              <p className="text-xs text-text-tertiary">Vendido</p>
              <p className="text-sm font-semibold text-text-primary">
                {track.soldPercentage}%
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-text-tertiary">
              Adicionado {formatDistanceToNow(new Date(track.addedAt), { addSuffix: true, locale: ptBR })}
            </p>

            <div className="flex items-center gap-2">
              <Link href={`/track/${track.trackId}`}>
                <Button variant="outline" size="sm">
                  <LineChart className="w-3 h-3 mr-1" />
                  Ver Detalhes
                </Button>
              </Link>

              <Button
                variant="ghost"
                size="sm"
                onClick={onRemove}
                disabled={isDeleting}
                loading={isDeleting}
                className="text-error hover:text-error hover:bg-error/10"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Remover
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

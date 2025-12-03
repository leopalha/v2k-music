"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AppLayout, PageHeader } from "@/components/layout";
import { type Track } from "@/components/tracks";
import { TrendingUp, TrendingDown, Flame, Clock, BarChart3, Play, Heart, Loader2, Music } from "lucide-react";
import { formatCurrency, formatPercentage } from "@/lib/utils";

interface TrendingTrack extends Track {
  rank: number;
  trendScore: number;
  volume: number;
  transactions: number;
  priceChange: number;
  holders: number;
}

interface TrendingData {
  tracks: TrendingTrack[];
  stats: {
    topGainer: { title: string; change: number } | null;
    totalVolume: number;
    totalTransactions: number;
  };
  timeRange: string;
}

type TimeRange = "24h" | "7d" | "30d";

export default function TrendingPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("24h");
  const [data, setData] = useState<TrendingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/trending?range=${timeRange}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
        setError("Erro ao carregar trending");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrending();
  }, [timeRange]);

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <PageHeader
          title="Em Alta"
          subtitle="Músicas com maior valorização e volume de negociação"
        />

        {/* Time Range Selector */}
        <div className="flex items-center gap-4 mb-8">
          <span className="text-sm text-text-secondary">Período:</span>
          <div className="flex items-center bg-bg-secondary rounded-lg p-1">
            {(["24h", "7d", "30d"] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  timeRange === range
                    ? "bg-primary text-white"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {range === "24h" ? "24 Horas" : range === "7d" ? "7 Dias" : "30 Dias"}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-bg-secondary rounded-xl p-4 border border-border-primary animate-pulse">
                <div className="h-4 bg-bg-tertiary rounded w-24 mb-2"></div>
                <div className="h-8 bg-bg-tertiary rounded w-32"></div>
              </div>
            ))}
          </div>
        ) : data ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-bg-secondary rounded-xl p-4 border border-border-primary">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-accent-green/10 rounded-lg">
                  <Flame className="w-5 h-5 text-accent-green" />
                </div>
                <span className="text-sm text-text-secondary">Maior Alta</span>
              </div>
              {data.stats.topGainer ? (
                <>
                  <p className="text-2xl font-bold text-accent-green">
                    +{data.stats.topGainer.change.toFixed(1)}%
                  </p>
                  <p className="text-sm text-text-tertiary">{data.stats.topGainer.title}</p>
                </>
              ) : (
                <p className="text-sm text-text-tertiary">Sem dados</p>
              )}
            </div>

            <div className="bg-bg-secondary rounded-xl p-4 border border-border-primary">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm text-text-secondary">Volume Total</span>
              </div>
              <p className="text-2xl font-bold text-text-primary">
                {formatCurrency(data.stats.totalVolume)}
              </p>
              <p className="text-sm text-text-tertiary">Últimas {timeRange}</p>
            </div>

            <div className="bg-bg-secondary rounded-xl p-4 border border-border-primary">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <Clock className="w-5 h-5 text-secondary" />
                </div>
                <span className="text-sm text-text-secondary">Transações</span>
              </div>
              <p className="text-2xl font-bold text-text-primary">
                {data.stats.totalTransactions}
              </p>
              <p className="text-sm text-text-tertiary">Últimas {timeRange}</p>
            </div>
          </div>
        ) : null}

        {/* Trending List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-text-secondary">{error}</p>
          </div>
        ) : data && data.tracks.length > 0 ? (
          <div className="space-y-4">
            {data.tracks.map((track, index) => (
            <Link href={`/track/${track.id}`} key={track.id}>
              <div className="flex items-center gap-4 bg-bg-secondary rounded-xl p-4 border border-border-primary hover:border-primary/50 transition-colors cursor-pointer group">
                {/* Rank */}
                <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                  {index < 3 ? (
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        index === 0
                          ? "bg-yellow-500/20 text-yellow-500"
                          : index === 1
                          ? "bg-gray-400/20 text-gray-400"
                          : "bg-orange-500/20 text-orange-500"
                      }`}
                    >
                      {index + 1}
                    </div>
                  ) : (
                    <span className="text-text-tertiary font-medium">{index + 1}</span>
                  )}
                </div>

                {/* Cover Art */}
                <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-primary-400 to-secondary-400">
                  {track.coverArt ? (
                    <img src={track.coverArt} alt={track.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {track.title[0]}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* Track Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-text-primary truncate">
                    {track.title}
                  </h3>
                  <p className="text-sm text-text-tertiary truncate">{track.artist}</p>
                </div>

                {/* Stats */}
                <div className="hidden sm:flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-text-tertiary">Preço</p>
                    <p className="font-semibold text-text-primary">
                      {formatCurrency(track.pricePerToken)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-text-tertiary">ROI</p>
                    <p className={`font-semibold flex items-center justify-end gap-1 ${
                      track.currentROI >= 0 ? "text-accent-green" : "text-accent-red"
                    }`}>
                      {track.currentROI >= 0 ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      {formatPercentage(track.currentROI)}
                    </p>
                  </div>
                </div>

                {/* Favorite */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  className="p-2 rounded-lg hover:bg-bg-elevated transition-colors"
                >
                  <Heart className="w-5 h-5 text-text-tertiary hover:text-accent-400" />
                </button>
              </div>
            </Link>
          ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Music className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
            <p className="text-text-secondary">Nenhuma música em trending no momento</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

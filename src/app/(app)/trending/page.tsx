"use client";

import { useState } from "react";
import Link from "next/link";
import { AppLayout, PageHeader } from "@/components/layout";
import { type Track } from "@/components/tracks";
import { TrendingUp, TrendingDown, Flame, Clock, BarChart3, Play, Heart } from "lucide-react";
import { formatCurrency, formatPercentage } from "@/lib/utils";

// Mock data - will be replaced with real data
const mockTrending: (Track & { rank: number })[] = [
  {
    id: "1",
    title: "Modo Turbo",
    artist: "MC Kevinho",
    coverArt: "",
    genre: "Funk",
    pricePerToken: 0.015,
    currentROI: 15.2,
    riskLevel: "LOW",
    totalTokens: 10000,
    availableTokens: 3500,
    rank: 1,
  },
  {
    id: "2",
    title: "Rave de Favela",
    artist: "MC Lan",
    coverArt: "",
    genre: "Funk",
    pricePerToken: 0.02,
    currentROI: 12.5,
    riskLevel: "MEDIUM",
    totalTokens: 8000,
    availableTokens: 2000,
    rank: 2,
  },
  {
    id: "3",
    title: "Beat Envolvente",
    artist: "DJ Lucas Beat",
    coverArt: "",
    genre: "Funk",
    pricePerToken: 0.018,
    currentROI: 10.3,
    riskLevel: "LOW",
    totalTokens: 12000,
    availableTokens: 5000,
    rank: 3,
  },
  {
    id: "4",
    title: "Solta o Som",
    artist: "MC Davi",
    coverArt: "",
    genre: "Funk",
    pricePerToken: 0.025,
    currentROI: 8.7,
    riskLevel: "MEDIUM",
    totalTokens: 6000,
    availableTokens: 1500,
    rank: 4,
  },
  {
    id: "5",
    title: "Baile do Piso",
    artist: "DJ Rennan",
    coverArt: "",
    genre: "Funk",
    pricePerToken: 0.011,
    currentROI: 6.2,
    riskLevel: "LOW",
    totalTokens: 15000,
    availableTokens: 8000,
    rank: 5,
  },
];

type TimeRange = "24h" | "7d" | "30d";

export default function TrendingPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("24h");

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-bg-secondary rounded-xl p-4 border border-border-primary">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-accent-green/10 rounded-lg">
                <Flame className="w-5 h-5 text-accent-green" />
              </div>
              <span className="text-sm text-text-secondary">Maior Alta</span>
            </div>
            <p className="text-2xl font-bold text-accent-green">+15.2%</p>
            <p className="text-sm text-text-tertiary">Modo Turbo</p>
          </div>

          <div className="bg-bg-secondary rounded-xl p-4 border border-border-primary">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm text-text-secondary">Volume Total</span>
            </div>
            <p className="text-2xl font-bold text-text-primary">R$ 45.2K</p>
            <p className="text-sm text-text-tertiary">Últimas {timeRange}</p>
          </div>

          <div className="bg-bg-secondary rounded-xl p-4 border border-border-primary">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <Clock className="w-5 h-5 text-secondary" />
              </div>
              <span className="text-sm text-text-secondary">Transações</span>
            </div>
            <p className="text-2xl font-bold text-text-primary">1,234</p>
            <p className="text-sm text-text-tertiary">Últimas {timeRange}</p>
          </div>
        </div>

        {/* Trending List */}
        <div className="space-y-4">
          {mockTrending.map((track, index) => (
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
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {track.title[0]}
                    </span>
                  </div>
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
      </div>
    </AppLayout>
  );
}

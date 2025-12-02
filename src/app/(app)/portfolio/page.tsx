"use client";

import { useState, useMemo, useEffect } from "react";
import { AppLayout, PageHeader } from "@/components/layout";
import { PortfolioStats, PortfolioCard, RoyaltyHistory, ClaimRoyaltiesButton } from "@/components/portfolio";
import { ShareCard } from "@/components/portfolio/ShareCard";
import { PortfolioMetrics } from "@/components/portfolio/PortfolioMetrics";
import { PortfolioPerformanceChart } from "@/components/portfolio/PortfolioPerformanceChart";
import { AssetAllocationChart } from "@/components/portfolio/AssetAllocationChart";
import { TopPerformersTable } from "@/components/portfolio/TopPerformersTable";
import { Button } from "@/components/ui";
import { Download, Filter, TrendingUp } from "lucide-react";
import { useUserPortfolio, useUserClaimableDistributions } from "@/lib/web3/hooks";
import { useAccount } from "wagmi";
import { usePortfolioAPI } from "@/hooks/usePortfolioAPI";

// Mock data - will be replaced with real data from blockchain
const mockPortfolioData = {
  stats: {
    totalValue: 5420.5,
    totalInvested: 4800,
    totalEarnings: 620.5,
    totalTracks: 8,
    roi: 12.93,
  },
  holdings: [
    {
      trackId: 1,
      title: "Modo Turbo",
      artist: "MC Kevinho",
      coverUrl: "/api/placeholder/64/64",
      tokensOwned: 500,
      totalSupply: 10000,
      currentPrice: 0.015,
      purchasePrice: 0.01,
      totalValue: 7.5,
      monthlyEarnings: 2.5,
      priceChange24h: 5.2,
    },
    {
      trackId: 2,
      title: "Rave de Favela",
      artist: "MC Lan",
      coverUrl: "/api/placeholder/64/64",
      tokensOwned: 1000,
      totalSupply: 8000,
      currentPrice: 0.02,
      purchasePrice: 0.015,
      totalValue: 20,
      monthlyEarnings: 8.0,
      priceChange24h: 8.5,
    },
    {
      trackId: 3,
      title: "Beat do Tik Tok",
      artist: "DJ GBR",
      coverUrl: "/api/placeholder/64/64",
      tokensOwned: 250,
      totalSupply: 5000,
      currentPrice: 0.012,
      purchasePrice: 0.013,
      totalValue: 3,
      monthlyEarnings: 1.2,
      priceChange24h: -7.7,
    },
  ],
  royaltyHistory: [
    {
      id: "1",
      trackTitle: "Modo Turbo",
      trackId: 1,
      amount: 2.5,
      source: "Spotify",
      date: new Date("2025-11-15"),
      status: "completed" as const,
      txHash: "0x1234567890abcdef",
    },
    {
      id: "2",
      trackTitle: "Rave de Favela",
      trackId: 2,
      amount: 8.0,
      source: "YouTube",
      date: new Date("2025-11-15"),
      status: "completed" as const,
      txHash: "0xabcdef1234567890",
    },
    {
      id: "3",
      trackTitle: "Beat do Tik Tok",
      trackId: 3,
      amount: 1.2,
      source: "Apple Music",
      date: new Date("2025-11-15"),
      status: "pending" as const,
    },
  ],
};

export default function PortfolioPage() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"value" | "performance" | "earnings">("value");
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(true);

  // Get real blockchain data
  const { isConnected } = useAccount();
  const { holdings: blockchainHoldings, totalTracks, isLoading } = useUserPortfolio();
  const { distributions: blockchainDistributions } = useUserClaimableDistributions();

  // Get enhanced data from API
  const { data: portfolioData, isLoading: isLoadingAPI, error: portfolioError } = usePortfolioAPI();

  // Load analytics data
  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setIsLoadingAnalytics(true);
        const res = await fetch("/api/portfolio/analytics");
        const data = await res.json();

        if (res.ok) {
          setAnalytics(data);
        }
      } catch (error) {
        console.error("Error loading analytics:", error);
      } finally {
        setIsLoadingAnalytics(false);
      }
    };

    loadAnalytics();
  }, []);

  // Combine blockchain data with UI data
  const realHoldings = useMemo(() => {
    if (!isConnected || isLoading) {
      return [];
    }

    return blockchainHoldings.map((holding) => ({
      trackId: holding.trackId,
      title: holding.title,
      artist: holding.artist,
      coverUrl: "/api/placeholder/64/64",
      tokensOwned: holding.tokensOwned,
      totalSupply: holding.totalSupply,
      currentPrice: holding.pricePerToken,
      purchasePrice: holding.pricePerToken, // TODO: Track actual purchase price
      totalValue: holding.tokensOwned * holding.pricePerToken,
      monthlyEarnings: 0, // TODO: Calculate from royalty distributions
      priceChange24h: 0, // TODO: Track price changes
    }));
  }, [blockchainHoldings, isConnected, isLoading]);

  // Use API data if available, then blockchain data, then mock
  const holdings = portfolioData?.holdings.map(h => ({
    trackId: parseInt(h.songId),
    title: h.title,
    artist: h.artist,
    coverUrl: h.coverArt,
    tokensOwned: h.tokensOwned,
    totalSupply: 10000, // TODO: Get from track info
    currentPrice: h.currentValue / h.tokensOwned,
    purchasePrice: h.costBasis / h.tokensOwned,
    totalValue: h.currentValue,
    monthlyEarnings: h.lastRoyaltyAmount || 0,
    priceChange24h: h.profitLossPercent,
  })) || (realHoldings.length > 0 ? realHoldings : mockPortfolioData.holdings);

  // Calculate real stats from API or blockchain
  const stats = useMemo(() => {
    if (portfolioData?.summary) {
      return {
        totalValue: portfolioData.summary.totalValue,
        totalInvested: portfolioData.summary.totalValue / (1 + portfolioData.summary.totalReturnPercent / 100),
        totalEarnings: portfolioData.summary.totalValue * (portfolioData.summary.totalReturnPercent / 100),
        totalTracks: portfolioData.summary.totalSongs,
        roi: portfolioData.summary.totalReturnPercent,
      };
    }

    if (realHoldings.length === 0) {
      return mockPortfolioData.stats;
    }

    const totalValue = realHoldings.reduce((sum, h) => sum + h.totalValue, 0);
    const totalInvested = realHoldings.reduce((sum, h) => sum + (h.tokensOwned * h.purchasePrice), 0);
    const totalEarnings = totalValue - totalInvested;
    const roi = totalInvested > 0 ? (totalEarnings / totalInvested) * 100 : 0;

    return {
      totalValue,
      totalInvested,
      totalEarnings,
      totalTracks: realHoldings.length,
      roi,
    };
  }, [realHoldings, portfolioData]);

  // Claimable distributions (pending royalties)
  // Use real blockchain distributions if available, otherwise use mock
  const claimableDistributions = blockchainDistributions.length > 0
    ? blockchainDistributions
    : mockPortfolioData.royaltyHistory
        .filter((payment) => payment.status === "pending")
        .map((payment) => ({
          id: parseInt(payment.id),
          trackTitle: payment.trackTitle,
          amount: payment.amount,
          source: payment.source,
          date: payment.date,
        }));

  const sortedHoldings = [...holdings].sort((a, b) => {
    switch (sortBy) {
      case "value":
        return b.totalValue - a.totalValue;
      case "performance":
        return b.priceChange24h - a.priceChange24h;
      case "earnings":
        return b.monthlyEarnings - a.monthlyEarnings;
      default:
        return 0;
    }
  });

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <PageHeader
          title="Meu Portfolio"
          subtitle="Gerencie seus investimentos e acompanhe seus rendimentos"
        />

        {/* Stats */}
        <div className="mb-8">
          <PortfolioStats {...stats} />
        </div>

        {/* Claim Royalties */}
        {claimableDistributions.length > 0 && (
          <div className="mb-8">
            <ClaimRoyaltiesButton distributions={claimableDistributions} />
          </div>
        )}

        {/* Portfolio Sharing */}
        <div className="mb-8">
          <ShareCard />
        </div>

        {/* Portfolio Analytics */}
        {analytics && !isLoadingAnalytics && (
          <div className="mb-8">
            {/* Toggle Button */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-text-primary">
                  Analytics do Portfolio
                </h2>
                <p className="text-sm text-text-secondary mt-1">
                  Análise detalhada de performance e distribuição de ativos
                </p>
              </div>
              <Button
                variant={showAnalytics ? "primary" : "outline"}
                size="sm"
                onClick={() => setShowAnalytics(!showAnalytics)}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                {showAnalytics ? "Ocultar" : "Mostrar"} Analytics
              </Button>
            </div>

            {showAnalytics && (
              <div className="space-y-6">
                {/* Metrics Cards */}
                <PortfolioMetrics overview={analytics.overview} />

                {/* Performance Chart */}
                {analytics.performanceData && analytics.performanceData.length > 0 && (
                  <PortfolioPerformanceChart data={analytics.performanceData} />
                )}

                {/* Asset Allocation & Top Performers */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Asset Allocation */}
                  {analytics.assetAllocation && analytics.assetAllocation.length > 0 && (
                    <AssetAllocationChart data={analytics.assetAllocation} />
                  )}

                  {/* Placeholder if only one chart */}
                  {(!analytics.assetAllocation || analytics.assetAllocation.length === 0) && (
                    <div className="bg-bg-secondary border border-border-default rounded-xl p-8 text-center">
                      <p className="text-text-tertiary">
                        Invista em diferentes gêneros para ver a distribuição
                      </p>
                    </div>
                  )}
                </div>

                {/* Top Performers Table */}
                {(analytics.bestPerformers?.length > 0 || analytics.worstPerformers?.length > 0) && (
                  <TopPerformersTable
                    bestPerformers={analytics.bestPerformers || []}
                    worstPerformers={analytics.worstPerformers || []}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {isLoadingAnalytics && (
          <div className="mb-8 bg-bg-secondary border border-border-default rounded-xl p-12 text-center">
            <div className="animate-pulse text-text-tertiary">
              Carregando analytics do portfolio...
            </div>
          </div>
        )}

        {/* Holdings Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-text-primary">
                Minhas Músicas ({holdings.length})
              </h2>
              <p className="text-sm text-text-secondary mt-1">
                {isConnected
                  ? (isLoading ? "Carregando da blockchain..." : "Tokens que você possui")
                  : "Conecte sua carteira para ver seus tokens"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-4 py-2 bg-bg-secondary border border-border-primary rounded-lg text-sm focus:outline-none focus:border-primary transition-colors"
              >
                <option value="value">Maior Valor</option>
                <option value="performance">Melhor Performance</option>
                <option value="earnings">Maior Rendimento</option>
              </select>

              {/* Filter Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilterOpen(!filterOpen)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtrar
              </Button>

              {/* Export */}
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>

          {/* Holdings Grid */}
          <div className="space-y-4">
            {sortedHoldings.map((holding) => (
              <PortfolioCard key={holding.trackId} {...holding} />
            ))}
          </div>
        </div>

        {/* Royalty History */}
        <div>
          <RoyaltyHistory payments={mockPortfolioData.royaltyHistory} />
        </div>
      </div>
    </AppLayout>
  );
}

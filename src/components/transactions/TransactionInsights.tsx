"use client";

import { TrendingUp, TrendingDown, Star, Zap } from "lucide-react";
import { Badge } from "@/components/ui";

interface Transaction {
  id: string;
  type: "BUY" | "SELL" | "TRANSFER" | "ROYALTY_CLAIM" | "DEPOSIT" | "WITHDRAWAL";
  amount: number;
  price: number;
  totalValue: number;
  track: {
    id: string;
    title: string;
    artistName: string;
  };
  createdAt: string;
}

interface TransactionInsightsProps {
  transactions: Transaction[];
}

export function TransactionInsights({ transactions }: TransactionInsightsProps) {
  // Calculate insights
  const buyTransactions = transactions.filter((t) => t.type === "BUY");
  const sellTransactions = transactions.filter((t) => t.type === "SELL");

  // Biggest gain (sell > buy price for same track)
  let biggestGain = { amount: 0, track: "", percentage: 0 };
  let biggestLoss = { amount: 0, track: "", percentage: 0 };

  sellTransactions.forEach((sell) => {
    const relatedBuys = buyTransactions.filter(
      (buy) => buy.track.id === sell.track.id && new Date(buy.createdAt) < new Date(sell.createdAt)
    );

    if (relatedBuys.length > 0) {
      // Use average buy price
      const avgBuyPrice = relatedBuys.reduce((sum, buy) => sum + buy.price, 0) / relatedBuys.length;
      const gain = (sell.price - avgBuyPrice) * sell.amount;
      const percentage = ((sell.price - avgBuyPrice) / avgBuyPrice) * 100;

      if (gain > biggestGain.amount) {
        biggestGain = {
          amount: gain,
          track: sell.track.title,
          percentage,
        };
      }

      if (gain < biggestLoss.amount) {
        biggestLoss = {
          amount: Math.abs(gain),
          track: sell.track.title,
          percentage: Math.abs(percentage),
        };
      }
    }
  });

  // Most traded track
  const trackCounts: Record<string, { title: string; count: number; volume: number }> = {};
  transactions.forEach((t) => {
    if (t.type === "BUY" || t.type === "SELL") {
      if (!trackCounts[t.track.id]) {
        trackCounts[t.track.id] = {
          title: t.track.title,
          count: 0,
          volume: 0,
        };
      }
      trackCounts[t.track.id].count++;
      trackCounts[t.track.id].volume += t.totalValue;
    }
  });

  const mostTradedTrack = Object.values(trackCounts).sort((a, b) => b.count - a.count)[0];

  // Total profit/loss
  const totalBuyValue = buyTransactions.reduce((sum, t) => sum + t.totalValue, 0);
  const totalSellValue = sellTransactions.reduce((sum, t) => sum + t.totalValue, 0);
  const totalProfit = totalSellValue - totalBuyValue;
  const totalProfitPercentage = totalBuyValue > 0 ? (totalProfit / totalBuyValue) * 100 : 0;

  if (transactions.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Profit/Loss */}
      <InsightCard
        icon={totalProfit >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
        title="Lucro Total"
        value={`R$ ${Math.abs(totalProfit).toFixed(2)}`}
        subtitle={`${totalProfit >= 0 ? "+" : "-"}${Math.abs(totalProfitPercentage).toFixed(1)}%`}
        variant={totalProfit >= 0 ? "success" : "error"}
      />

      {/* Biggest Gain */}
      {biggestGain.amount > 0 && (
        <InsightCard
          icon={<TrendingUp className="w-5 h-5" />}
          title="Maior Ganho"
          value={`R$ ${biggestGain.amount.toFixed(2)}`}
          subtitle={`${biggestGain.track} (+${biggestGain.percentage.toFixed(1)}%)`}
          variant="success"
        />
      )}

      {/* Biggest Loss */}
      {biggestLoss.amount > 0 && (
        <InsightCard
          icon={<TrendingDown className="w-5 h-5" />}
          title="Maior Perda"
          value={`R$ ${biggestLoss.amount.toFixed(2)}`}
          subtitle={`${biggestLoss.track} (-${biggestLoss.percentage.toFixed(1)}%)`}
          variant="error"
        />
      )}

      {/* Most Traded */}
      {mostTradedTrack && (
        <InsightCard
          icon={<Star className="w-5 h-5" />}
          title="Mais Negociada"
          value={mostTradedTrack.title}
          subtitle={`${mostTradedTrack.count} transações • R$ ${mostTradedTrack.volume.toFixed(2)}`}
          variant="primary"
        />
      )}
    </div>
  );
}

interface InsightCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
  variant: "success" | "error" | "primary" | "warning";
}

function InsightCard({ icon, title, value, subtitle, variant }: InsightCardProps) {
  const colors = {
    success: "text-success border-success/20 bg-success/5",
    error: "text-error border-error/20 bg-error/5",
    primary: "text-primary border-primary/20 bg-primary/5",
    warning: "text-warning border-warning/20 bg-warning/5",
  };

  return (
    <div className="bg-bg-secondary border border-border-default rounded-lg p-4 hover:border-border-hover transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className={`p-2 rounded-lg ${colors[variant]}`}>{icon}</div>
        <Badge variant={variant} size="sm">
          <Zap className="w-3 h-3 mr-1" />
          Insight
        </Badge>
      </div>
      <h3 className="text-xs font-medium text-text-tertiary uppercase tracking-wide mb-1">{title}</h3>
      <p className="text-lg font-bold text-text-primary truncate mb-1">{value}</p>
      <p className="text-xs text-text-secondary truncate">{subtitle}</p>
    </div>
  );
}

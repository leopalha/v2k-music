"use client";

import { TrendingUp, DollarSign, Music, Calendar } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/utils";

interface PortfolioStatsProps {
  totalValue: number;
  totalInvested: number;
  totalEarnings: number;
  totalTracks: number;
  roi: number;
}

export function PortfolioStats({
  totalValue,
  totalInvested,
  totalEarnings,
  totalTracks,
  roi,
}: PortfolioStatsProps) {
  const profitLoss = totalValue - totalInvested;
  const isProfit = profitLoss >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Value */}
      <div className="bg-bg-secondary border border-border-primary rounded-xl p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-text-secondary">Valor Total</span>
          <div className="p-2 bg-primary/10 rounded-lg">
            <DollarSign className="w-5 h-5 text-primary" />
          </div>
        </div>
        <div className="text-2xl font-bold text-text-primary mb-1">
          {formatCurrency(totalValue)}
        </div>
        <div className={`text-sm ${isProfit ? "text-accent-green" : "text-accent-red"}`}>
          {isProfit ? "+" : ""}
          {formatCurrency(profitLoss)} ({roi > 0 ? "+" : ""}
          {roi.toFixed(2)}%)
        </div>
      </div>

      {/* Total Invested */}
      <div className="bg-bg-secondary border border-border-primary rounded-xl p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-text-secondary">Total Investido</span>
          <div className="p-2 bg-secondary/10 rounded-lg">
            <TrendingUp className="w-5 h-5 text-secondary" />
          </div>
        </div>
        <div className="text-2xl font-bold text-text-primary">
          {formatCurrency(totalInvested)}
        </div>
        <div className="text-sm text-text-tertiary">Capital inicial</div>
      </div>

      {/* Total Earnings */}
      <div className="bg-bg-secondary border border-border-primary rounded-xl p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-text-secondary">Rendimentos Totais</span>
          <div className="p-2 bg-accent-green/10 rounded-lg">
            <Calendar className="w-5 h-5 text-accent-green" />
          </div>
        </div>
        <div className="text-2xl font-bold text-text-primary">
          {formatCurrency(totalEarnings)}
        </div>
        <div className="text-sm text-text-tertiary">Royalties recebidos</div>
      </div>

      {/* Total Tracks */}
      <div className="bg-bg-secondary border border-border-primary rounded-xl p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-text-secondary">Músicas</span>
          <div className="p-2 bg-tertiary/10 rounded-lg">
            <Music className="w-5 h-5 text-tertiary" />
          </div>
        </div>
        <div className="text-2xl font-bold text-text-primary">
          {formatNumber(totalTracks)}
        </div>
        <div className="text-sm text-text-tertiary">No portfolio</div>
      </div>
    </div>
  );
}

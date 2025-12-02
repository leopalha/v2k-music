"use client";

import Link from "next/link";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui";
import { formatCurrency, formatNumber } from "@/lib/utils";

interface PortfolioCardProps {
  trackId: number;
  title: string;
  artist: string;
  coverUrl?: string;
  tokensOwned: number;
  totalSupply: number;
  currentPrice: number;
  purchasePrice: number;
  totalValue: number;
  monthlyEarnings: number;
  priceChange24h: number;
}

export function PortfolioCard({
  trackId,
  title,
  artist,
  coverUrl,
  tokensOwned,
  totalSupply,
  currentPrice,
  purchasePrice,
  totalValue,
  monthlyEarnings,
  priceChange24h,
}: PortfolioCardProps) {
  const ownershipPercentage = (tokensOwned / totalSupply) * 100;
  const profitLoss = (currentPrice - purchasePrice) * tokensOwned;
  const profitLossPercentage = ((currentPrice - purchasePrice) / purchasePrice) * 100;
  const isProfit = profitLoss >= 0;

  return (
    <Link href={`/track/${trackId}`}>
      <div className="bg-bg-secondary border border-border-primary rounded-xl p-4 hover:border-primary transition-all hover:shadow-lg hover:shadow-primary/5 group">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          {/* Cover */}
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-bg-tertiary flex-shrink-0">
            {coverUrl ? (
              <img
                src={coverUrl}
                alt={title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary to-secondary" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-text-primary truncate group-hover:text-primary transition-colors">
              {title}
            </h3>
            <p className="text-sm text-text-secondary truncate">{artist}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-text-tertiary">
                {formatNumber(tokensOwned)} tokens ({ownershipPercentage.toFixed(2)}%)
              </span>
            </div>
          </div>

          {/* Price Change Badge */}
          <div className="flex-shrink-0">
            <Badge
              variant={isProfit ? "success" : "error"}
              className="flex items-center gap-1"
            >
              {isProfit ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {profitLossPercentage > 0 ? "+" : ""}
              {profitLossPercentage.toFixed(2)}%
            </Badge>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Current Value */}
          <div>
            <div className="text-xs text-text-tertiary mb-1">Valor Atual</div>
            <div className="font-semibold text-text-primary">
              {formatCurrency(totalValue)}
            </div>
          </div>

          {/* Profit/Loss */}
          <div>
            <div className="text-xs text-text-tertiary mb-1">Lucro/Prejuízo</div>
            <div
              className={`font-semibold ${
                isProfit ? "text-accent-green" : "text-accent-red"
              }`}
            >
              {isProfit ? "+" : ""}
              {formatCurrency(profitLoss)}
            </div>
          </div>

          {/* Current Price */}
          <div>
            <div className="text-xs text-text-tertiary mb-1">Preço Atual</div>
            <div className="font-semibold text-text-primary">
              {formatCurrency(currentPrice)}
            </div>
          </div>

          {/* Monthly Earnings */}
          <div>
            <div className="text-xs text-text-tertiary mb-1">Rendimento Mensal</div>
            <div className="font-semibold text-accent-green">
              {formatCurrency(monthlyEarnings)}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

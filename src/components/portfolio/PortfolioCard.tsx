"use client";

import { useState } from "react";
import Link from "next/link";
import { TrendingUp, TrendingDown, DollarSign, Loader2 } from "lucide-react";
import { Badge, Button } from "@/components/ui";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";

interface PortfolioCardProps {
  trackId: number | string;
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
  unclaimedRoyalties?: number;
  onClaimSuccess?: () => void;
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
  unclaimedRoyalties = 0,
  onClaimSuccess,
}: PortfolioCardProps) {
  const [isClaiming, setIsClaiming] = useState(false);
  const ownershipPercentage = (tokensOwned / totalSupply) * 100;
  const profitLoss = (currentPrice - purchasePrice) * tokensOwned;
  const profitLossPercentage = ((currentPrice - purchasePrice) / purchasePrice) * 100;
  const isProfit = profitLoss >= 0;

  const handleClaim = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsClaiming(true);
    try {
      const response = await fetch('/api/investor/royalties/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trackId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao fazer claim');
      }

      toast.success(
        'Royalties resgatados!',
        `Você recebeu ${formatCurrency(data.claimedAmount)} no seu saldo`
      );

      if (onClaimSuccess) {
        onClaimSuccess();
      }
    } catch (err: any) {
      toast.error(
        'Erro ao resgatar royalties',
        err.message || 'Tente novamente'
      );
    } finally {
      setIsClaiming(false);
    }
  };

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

        {/* Unclaimed Royalties Banner */}
        {unclaimedRoyalties > 0 && (
          <div className="mt-4 pt-4 border-t border-border-subtle">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 bg-accent-green/10 rounded-lg">
                  <DollarSign className="w-4 h-4 text-accent-green" />
                </div>
                <div>
                  <div className="text-xs text-text-tertiary">Royalties Disponíveis</div>
                  <div className="font-semibold text-accent-green">
                    {formatCurrency(unclaimedRoyalties)}
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                onClick={handleClaim}
                disabled={isClaiming}
                className="flex items-center gap-2"
              >
                {isClaiming ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Resgatando...
                  </>
                ) : (
                  <>
                    <DollarSign className="w-3 h-3" />
                    Resgatar
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}

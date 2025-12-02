"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Copy,
  TrendingUp,
  Users,
  Target,
  Award,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface TraderStats {
  totalProfit: number;
  winRate: number;
  totalTrades: number;
  portfolioValue: number;
  followersCount: number;
  copiersCount: number;
}

interface TopTrader {
  id: string;
  name: string | null;
  username: string | null;
  profileImageUrl: string | null;
  level: number;
  stats: TraderStats;
  roi: number;
  isCopying: boolean;
}

interface CopyTraderCardProps {
  trader: TopTrader;
  onCopyStart?: (traderId: string) => void;
  onCopyStop?: (traderId: string) => void;
  variant?: "card" | "list";
}

export function CopyTraderCard({
  trader,
  onCopyStart,
  onCopyStop,
  variant = "card",
}: CopyTraderCardProps) {
  const [isCopying, setIsCopying] = useState(trader.isCopying);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleCopy = async () => {
    setIsLoading(true);

    try {
      if (isCopying) {
        // Stop copying - need to fetch the copy trade ID first
        const response = await fetch("/api/copy-trading");
        const data = await response.json();
        const copyTrade = data.copyTrades?.find(
          (ct: any) => ct.trader.id === trader.id
        );

        if (copyTrade) {
          await fetch(`/api/copy-trading/${copyTrade.id}`, {
            method: "DELETE",
          });
        }

        setIsCopying(false);
        toast.success("Você parou de copiar este trader");
        onCopyStop?.(trader.id);
      } else {
        // Start copying
        const response = await fetch("/api/copy-trading", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            traderId: trader.id,
            allocationPercent: 10,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Erro ao iniciar copy trading");
        }

        setIsCopying(true);
        toast.success("Você está copiando este trader!");
        onCopyStart?.(trader.id);
      }
    } catch (error) {
      console.error("Error toggling copy:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao processar");
    } finally {
      setIsLoading(false);
    }
  };

  const levelBadgeColor = trader.level >= 10
    ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
    : trader.level >= 5
      ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
      : "bg-blue-500/20 text-blue-400 border-blue-500/30";

  if (variant === "list") {
    return (
      <div className="flex items-center justify-between p-4 rounded-xl bg-bg-secondary border border-border-default hover:border-border-strong transition-all">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <Link href={`/profile/${trader.id}`}>
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-bg-elevated">
              {trader.profileImageUrl ? (
                <Image
                  src={trader.profileImageUrl}
                  alt={trader.name || "Trader"}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xl font-bold text-text-tertiary">
                  {(trader.name || "T")[0].toUpperCase()}
                </div>
              )}
            </div>
          </Link>

          {/* Info */}
          <div>
            <Link
              href={`/profile/${trader.id}`}
              className="font-semibold text-text-primary hover:text-primary transition-colors"
            >
              {trader.name || trader.username || "Trader"}
            </Link>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={cn("text-xs", levelBadgeColor)}>
                Nível {trader.level}
              </Badge>
              <span className="text-xs text-text-tertiary">
                {trader.stats.copiersCount} copiers
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <div className="text-sm text-text-tertiary">Win Rate</div>
            <div className="font-semibold text-text-primary">
              {trader.stats.winRate.toFixed(1)}%
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-text-tertiary">ROI</div>
            <div
              className={cn(
                "font-semibold",
                trader.roi >= 0 ? "text-success" : "text-error"
              )}
            >
              {formatPercentage(trader.roi)}
            </div>
          </div>

          {/* Copy Button */}
          <Button
            onClick={handleToggleCopy}
            disabled={isLoading}
            variant={isCopying ? "outline" : "primary"}
            size="sm"
            className="min-w-[100px]"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isCopying ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Copiando
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-1" />
                Copiar
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Card variant
  return (
    <div className="rounded-xl bg-bg-secondary border border-border-default hover:border-border-strong transition-all overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <Link href={`/profile/${trader.id}`}>
            <div className="relative w-14 h-14 rounded-full overflow-hidden bg-bg-elevated">
              {trader.profileImageUrl ? (
                <Image
                  src={trader.profileImageUrl}
                  alt={trader.name || "Trader"}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-text-tertiary">
                  {(trader.name || "T")[0].toUpperCase()}
                </div>
              )}
            </div>
          </Link>
          <div className="flex-1">
            <Link
              href={`/profile/${trader.id}`}
              className="font-semibold text-text-primary hover:text-primary transition-colors"
            >
              {trader.name || trader.username || "Trader"}
            </Link>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={cn("text-xs", levelBadgeColor)}>
                <Award className="w-3 h-3 mr-1" />
                Nível {trader.level}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-px bg-border-subtle">
        <div className="bg-bg-secondary p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-text-tertiary mb-1">
            <TrendingUp className="w-3 h-3" />
            <span className="text-xs">ROI</span>
          </div>
          <div
            className={cn(
              "text-lg font-bold",
              trader.roi >= 0 ? "text-success" : "text-error"
            )}
          >
            {formatPercentage(trader.roi)}
          </div>
        </div>
        <div className="bg-bg-secondary p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-text-tertiary mb-1">
            <Target className="w-3 h-3" />
            <span className="text-xs">Win Rate</span>
          </div>
          <div className="text-lg font-bold text-text-primary">
            {trader.stats.winRate.toFixed(1)}%
          </div>
        </div>
        <div className="bg-bg-secondary p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-text-tertiary mb-1">
            <Users className="w-3 h-3" />
            <span className="text-xs">Copiers</span>
          </div>
          <div className="text-lg font-bold text-text-primary">
            {trader.stats.copiersCount}
          </div>
        </div>
        <div className="bg-bg-secondary p-3 text-center">
          <div className="text-xs text-text-tertiary mb-1">Lucro Total</div>
          <div
            className={cn(
              "text-lg font-bold",
              trader.stats.totalProfit >= 0 ? "text-success" : "text-error"
            )}
          >
            {formatCurrency(trader.stats.totalProfit)}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4">
        <Button
          onClick={handleToggleCopy}
          disabled={isLoading}
          variant={isCopying ? "outline" : "primary"}
          className="w-full"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isCopying ? (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Copiando
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              Copiar Trades
            </>
          )}
        </Button>
        <p className="text-xs text-text-tertiary text-center mt-2">
          {trader.stats.totalTrades} trades realizados
        </p>
      </div>
    </div>
  );
}

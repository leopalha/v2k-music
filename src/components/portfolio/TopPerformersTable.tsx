"use client";

import Image from "next/image";
import Link from "next/link";
import { TrendingUp, TrendingDown, Trophy, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface Performer {
  trackId: string;
  title: string;
  artistName: string;
  coverUrl: string;
  amount: number;
  invested: number;
  currentValue: number;
  profit: number;
  profitPercentage: number;
  priceChange24h: number;
}

interface TopPerformersTableProps {
  bestPerformers: Performer[];
  worstPerformers: Performer[];
}

export function TopPerformersTable({
  bestPerformers,
  worstPerformers,
}: TopPerformersTableProps) {
  const PerformerRow = ({ performer, rank }: { performer: Performer; rank: number }) => {
    const isPositive = performer.profitPercentage >= 0;

    return (
      <Link
        href={`/track/${performer.trackId}`}
        className="flex items-center gap-4 p-4 bg-bg-elevated rounded-lg hover:bg-bg-primary transition-colors border border-border-subtle hover:border-border-hover"
      >
        {/* Rank */}
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-bg-secondary text-text-tertiary font-bold text-sm">
          {rank}
        </div>

        {/* Cover */}
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-bg-secondary flex-shrink-0">
          {performer.coverUrl ? (
            <Image
              src={performer.coverUrl}
              alt={performer.title}
              width={48}
              height={48}
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-400 to-secondary-400" />
          )}
        </div>

        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-text-primary truncate">{performer.title}</h4>
          <p className="text-sm text-text-tertiary truncate">{performer.artistName}</p>
        </div>

        {/* Stats */}
        <div className="text-right hidden sm:block">
          <div className="text-xs text-text-tertiary">Investido</div>
          <div className="text-sm font-mono font-medium text-text-primary">
            R$ {performer.invested.toFixed(2)}
          </div>
        </div>

        <div className="text-right hidden md:block">
          <div className="text-xs text-text-tertiary">Valor Atual</div>
          <div className="text-sm font-mono font-medium text-text-primary">
            R$ {performer.currentValue.toFixed(2)}
          </div>
        </div>

        {/* Performance */}
        <div className="text-right min-w-[100px]">
          <div
            className={cn(
              "text-lg font-mono font-bold flex items-center justify-end gap-1",
              isPositive ? "text-success" : "text-error"
            )}
          >
            {isPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            {isPositive ? "+" : ""}
            {performer.profitPercentage.toFixed(1)}%
          </div>
          <div
            className={cn(
              "text-xs font-mono",
              isPositive ? "text-success/70" : "text-error/70"
            )}
          >
            {isPositive ? "+" : ""}R$ {performer.profit.toFixed(2)}
          </div>
        </div>
      </Link>
    );
  };

  if (bestPerformers.length === 0 && worstPerformers.length === 0) {
    return (
      <div className="bg-bg-secondary border border-border-default rounded-xl p-8 text-center">
        <p className="text-text-tertiary">Sem dados de performance disponíveis</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Best Performers */}
      {bestPerformers.length > 0 && (
        <div className="bg-bg-secondary border border-border-default rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-accent" />
            <h3 className="text-lg font-semibold text-text-primary">
              Melhores Performances
            </h3>
          </div>

          <div className="space-y-3">
            {bestPerformers.map((performer, index) => (
              <PerformerRow key={performer.trackId} performer={performer} rank={index + 1} />
            ))}
          </div>
        </div>
      )}

      {/* Worst Performers */}
      {worstPerformers.length > 0 && worstPerformers.some((p) => p.profitPercentage < 0) && (
        <div className="bg-bg-secondary border border-border-default rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-warning" />
            <h3 className="text-lg font-semibold text-text-primary">
              Performances Negativas
            </h3>
          </div>

          <div className="space-y-3">
            {worstPerformers
              .filter((p) => p.profitPercentage < 0)
              .map((performer, index) => (
                <PerformerRow key={performer.trackId} performer={performer} rank={index + 1} />
              ))}
          </div>

          <div className="mt-4 p-3 bg-warning/10 border border-warning/30 rounded-lg">
            <p className="text-xs text-text-secondary">
              💡 <span className="font-medium">Dica:</span> Considere diversificar seu
              portfolio ou aguardar recuperação. Música é um investimento de longo prazo.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

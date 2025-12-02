"use client";

import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  Shield,
  AlertTriangle,
  Target,
  Coins,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface Overview {
  totalInvested: number;
  currentValue: number;
  totalProfitLoss: number;
  totalProfitLossPercentage: number;
  totalRoyalties: number;
  totalAssets: number;
  diversificationScore: number;
  riskScore: number;
  avgROI: number;
}

interface PortfolioMetricsProps {
  overview: Overview;
}

export function PortfolioMetrics({ overview }: PortfolioMetricsProps) {
  const isPositive = overview.totalProfitLoss >= 0;

  // Risk level based on score
  const getRiskLevel = (score: number): { label: string; color: string } => {
    if (score < 30) return { label: "Baixo", color: "text-success" };
    if (score < 60) return { label: "Médio", color: "text-warning" };
    return { label: "Alto", color: "text-error" };
  };

  // Diversification level
  const getDiversificationLevel = (score: number): { label: string; color: string } => {
    if (score >= 70) return { label: "Excelente", color: "text-success" };
    if (score >= 50) return { label: "Bom", color: "text-primary-400" };
    if (score >= 30) return { label: "Moderado", color: "text-warning" };
    return { label: "Baixo", color: "text-error" };
  };

  const risk = getRiskLevel(overview.riskScore);
  const diversification = getDiversificationLevel(overview.diversificationScore);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Invested */}
      <div className="bg-bg-secondary border border-border-default rounded-xl p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-primary-400/10 rounded-lg">
            <DollarSign className="w-5 h-5 text-primary-400" />
          </div>
          <span className="text-xs text-text-tertiary">Total Investido</span>
        </div>
        <div className="text-2xl font-mono font-bold text-text-primary">
          R$ {overview.totalInvested.toFixed(2)}
        </div>
        <div className="text-xs text-text-tertiary mt-1">
          Em {overview.totalAssets} {overview.totalAssets === 1 ? "música" : "músicas"}
        </div>
      </div>

      {/* Current Value */}
      <div className="bg-bg-secondary border border-border-default rounded-xl p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-accent/10 rounded-lg">
            <Coins className="w-5 h-5 text-accent" />
          </div>
          <span className="text-xs text-text-tertiary">Valor Atual</span>
        </div>
        <div className="text-2xl font-mono font-bold text-text-primary">
          R$ {overview.currentValue.toFixed(2)}
        </div>
        <div
          className={cn(
            "text-sm font-medium flex items-center gap-1 mt-1",
            isPositive ? "text-success" : "text-error"
          )}
        >
          {isPositive ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          {isPositive ? "+" : ""}
          {overview.totalProfitLossPercentage.toFixed(1)}%
        </div>
      </div>

      {/* Total P&L */}
      <div
        className={cn(
          "bg-bg-secondary border rounded-xl p-6",
          isPositive ? "border-success/30" : "border-error/30"
        )}
      >
        <div className="flex items-center justify-between mb-3">
          <div
            className={cn(
              "p-2 rounded-lg",
              isPositive ? "bg-success/10" : "bg-error/10"
            )}
          >
            {isPositive ? (
              <TrendingUp className="w-5 h-5 text-success" />
            ) : (
              <TrendingDown className="w-5 h-5 text-error" />
            )}
          </div>
          <span className="text-xs text-text-tertiary">Lucro/Prejuízo</span>
        </div>
        <div
          className={cn(
            "text-2xl font-mono font-bold",
            isPositive ? "text-success" : "text-error"
          )}
        >
          {isPositive ? "+" : ""}R$ {Math.abs(overview.totalProfitLoss).toFixed(2)}
        </div>
        <div className="text-xs text-text-tertiary mt-1">
          ROI Médio: {overview.avgROI.toFixed(1)}%
        </div>
      </div>

      {/* Total Royalties */}
      <div className="bg-bg-secondary border border-border-default rounded-xl p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-secondary-400/10 rounded-lg">
            <Target className="w-5 h-5 text-secondary-400" />
          </div>
          <span className="text-xs text-text-tertiary">Royalties Ganhos</span>
        </div>
        <div className="text-2xl font-mono font-bold text-text-primary">
          R$ {overview.totalRoyalties.toFixed(2)}
        </div>
        <div className="text-xs text-text-tertiary mt-1">Renda passiva acumulada</div>
      </div>

      {/* Diversification Score */}
      <div className="bg-bg-secondary border border-border-default rounded-xl p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-primary-400/10 rounded-lg">
            <PieChart className="w-5 h-5 text-primary-400" />
          </div>
          <span className="text-xs text-text-tertiary">Diversificação</span>
        </div>
        <div className="flex items-baseline gap-2">
          <div className="text-2xl font-mono font-bold text-text-primary">
            {overview.diversificationScore}
          </div>
          <div className="text-sm text-text-tertiary">/100</div>
        </div>
        <div className={cn("text-xs font-medium mt-1", diversification.color)}>
          {diversification.label}
        </div>
      </div>

      {/* Risk Score */}
      <div className="bg-bg-secondary border border-border-default rounded-xl p-6">
        <div className="flex items-center justify-between mb-3">
          <div
            className={cn(
              "p-2 rounded-lg",
              overview.riskScore < 30
                ? "bg-success/10"
                : overview.riskScore < 60
                ? "bg-warning/10"
                : "bg-error/10"
            )}
          >
            {overview.riskScore < 30 ? (
              <Shield className="w-5 h-5 text-success" />
            ) : (
              <AlertTriangle
                className={cn(
                  "w-5 h-5",
                  overview.riskScore < 60 ? "text-warning" : "text-error"
                )}
              />
            )}
          </div>
          <span className="text-xs text-text-tertiary">Nível de Risco</span>
        </div>
        <div className="flex items-baseline gap-2">
          <div className="text-2xl font-mono font-bold text-text-primary">
            {overview.riskScore}
          </div>
          <div className="text-sm text-text-tertiary">/100</div>
        </div>
        <div className={cn("text-xs font-medium mt-1", risk.color)}>{risk.label}</div>
      </div>

      {/* Progress Bars */}
      <div className="bg-bg-secondary border border-border-default rounded-xl p-6 md:col-span-2">
        <h4 className="text-sm font-semibold text-text-primary mb-4">
          Scores de Portfolio
        </h4>

        <div className="space-y-4">
          {/* Diversification Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text-secondary">Diversificação</span>
              <span className="text-xs font-mono font-medium text-text-primary">
                {overview.diversificationScore}%
              </span>
            </div>
            <div className="h-2 bg-bg-elevated rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full transition-all"
                style={{ width: `${overview.diversificationScore}%` }}
              />
            </div>
          </div>

          {/* Risk Progress (inverted - lower is better) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text-secondary">Risco</span>
              <span className="text-xs font-mono font-medium text-text-primary">
                {overview.riskScore}%
              </span>
            </div>
            <div className="h-2 bg-bg-elevated rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  overview.riskScore < 30
                    ? "bg-success"
                    : overview.riskScore < 60
                    ? "bg-warning"
                    : "bg-error"
                )}
                style={{ width: `${overview.riskScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Recommendation */}
        <div className="mt-4 p-3 bg-primary-400/10 border border-primary-400/30 rounded-lg">
          <p className="text-xs text-text-secondary">
            {overview.diversificationScore >= 70
              ? "✨ Excelente diversificação! Seu portfolio está bem balanceado."
              : overview.diversificationScore >= 50
              ? "👍 Boa diversificação. Considere adicionar mais variedade para melhorar."
              : "💡 Diversifique mais! Invista em diferentes gêneros musicais para reduzir risco."}
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { Sparkles, TrendingUp, AlertTriangle, Zap } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface AIScoreBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  variant?: "badge" | "pill" | "full";
  className?: string;
}

function getScoreConfig(score: number) {
  if (score >= 80) {
    return {
      label: "Excelente",
      shortLabel: "AI Top",
      color: "emerald",
      bgClass: "bg-emerald-500/20",
      textClass: "text-emerald-400",
      borderClass: "border-emerald-500/30",
      icon: Sparkles,
      glow: "shadow-emerald-500/20",
    };
  }
  if (score >= 60) {
    return {
      label: "Bom",
      shortLabel: "AI Bom",
      color: "green",
      bgClass: "bg-green-500/20",
      textClass: "text-green-400",
      borderClass: "border-green-500/30",
      icon: TrendingUp,
      glow: "shadow-green-500/20",
    };
  }
  if (score >= 40) {
    return {
      label: "Regular",
      shortLabel: "AI Regular",
      color: "yellow",
      bgClass: "bg-yellow-500/20",
      textClass: "text-yellow-400",
      borderClass: "border-yellow-500/30",
      icon: Zap,
      glow: "",
    };
  }
  if (score >= 20) {
    return {
      label: "Baixo",
      shortLabel: "AI Baixo",
      color: "orange",
      bgClass: "bg-orange-500/20",
      textClass: "text-orange-400",
      borderClass: "border-orange-500/30",
      icon: AlertTriangle,
      glow: "",
    };
  }
  return {
    label: "Muito Baixo",
    shortLabel: "AI",
    color: "red",
    bgClass: "bg-red-500/20",
    textClass: "text-red-400",
    borderClass: "border-red-500/30",
    icon: AlertTriangle,
    glow: "",
  };
}

export function AIScoreBadge({
  score,
  size = "md",
  showLabel = true,
  variant = "badge",
  className,
}: AIScoreBadgeProps) {
  const config = getScoreConfig(score);
  const Icon = config.icon;

  const sizeClasses = {
    sm: {
      badge: "px-1.5 py-0.5 text-xs gap-1",
      icon: "w-3 h-3",
      score: "text-xs",
    },
    md: {
      badge: "px-2 py-1 text-sm gap-1.5",
      icon: "w-4 h-4",
      score: "text-sm",
    },
    lg: {
      badge: "px-3 py-1.5 text-base gap-2",
      icon: "w-5 h-5",
      score: "text-base",
    },
  };

  if (variant === "pill") {
    return (
      <div
        className={cn(
          "inline-flex items-center rounded-full border",
          config.bgClass,
          config.borderClass,
          config.glow && `shadow-lg ${config.glow}`,
          sizeClasses[size].badge,
          className
        )}
        title={`AI Score: ${score}/100 - ${config.label}`}
      >
        <Icon className={cn(sizeClasses[size].icon, config.textClass)} />
        <span className={cn("font-bold", config.textClass, sizeClasses[size].score)}>
          {score}
        </span>
      </div>
    );
  }

  if (variant === "full") {
    return (
      <div
        className={cn(
          "inline-flex items-center rounded-lg border backdrop-blur-sm",
          config.bgClass,
          config.borderClass,
          config.glow && `shadow-lg ${config.glow}`,
          sizeClasses[size].badge,
          className
        )}
      >
        <Icon className={cn(sizeClasses[size].icon, config.textClass)} />
        <div className="flex items-center gap-1">
          <span className={cn("font-bold", config.textClass, sizeClasses[size].score)}>
            {score}
          </span>
          {showLabel && (
            <span className={cn("opacity-80", config.textClass, sizeClasses[size].score)}>
              • {config.label}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Default badge variant
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border backdrop-blur-sm",
        config.bgClass,
        config.borderClass,
        config.glow && `shadow-lg ${config.glow}`,
        sizeClasses[size].badge,
        className
      )}
      title={`AI Score: ${score}/100 - ${config.label}`}
    >
      <Icon className={cn(sizeClasses[size].icon, config.textClass)} />
      <span className={cn("font-bold", config.textClass, sizeClasses[size].score)}>
        {score}
      </span>
      {showLabel && (
        <span className={cn("hidden sm:inline opacity-70", config.textClass, sizeClasses[size].score)}>
          AI
        </span>
      )}
    </div>
  );
}

// Componente para mostrar score detalhado em tooltips ou modals
interface AIScoreDetailProps {
  score: number;
  breakdown?: {
    streamingScore: number;
    engagementScore: number;
    momentumScore: number;
    qualityScore: number;
  };
  predictedROI?: number;
  viralProbability?: number;
  riskLevel?: "LOW" | "MEDIUM" | "HIGH";
  insights?: string[];
}

export function AIScoreDetail({
  score,
  breakdown,
  predictedROI,
  viralProbability,
  riskLevel,
  insights,
}: AIScoreDetailProps) {
  const config = getScoreConfig(score);
  const Icon = config.icon;

  const riskConfig = {
    LOW: { label: "Baixo", color: "text-green-400", bg: "bg-green-500/10" },
    MEDIUM: { label: "Médio", color: "text-yellow-400", bg: "bg-yellow-500/10" },
    HIGH: { label: "Alto", color: "text-red-400", bg: "bg-red-500/10" },
  };

  return (
    <div className="space-y-4">
      {/* Score Principal */}
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "w-16 h-16 rounded-xl flex items-center justify-center",
            config.bgClass,
            "border",
            config.borderClass
          )}
        >
          <span className={cn("text-2xl font-bold", config.textClass)}>{score}</span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <Icon className={cn("w-5 h-5", config.textClass)} />
            <span className={cn("text-lg font-semibold", config.textClass)}>
              {config.label}
            </span>
          </div>
          <p className="text-sm text-text-tertiary mt-1">Score AI baseado em métricas de mercado</p>
        </div>
      </div>

      {/* Breakdown */}
      {breakdown && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-text-secondary">Breakdown do Score</h4>
          <div className="grid grid-cols-2 gap-2">
            <ScoreBar label="Streaming" value={breakdown.streamingScore} max={40} />
            <ScoreBar label="Engajamento" value={breakdown.engagementScore} max={20} />
            <ScoreBar label="Momentum" value={breakdown.momentumScore} max={20} />
            <ScoreBar label="Qualidade" value={breakdown.qualityScore} max={20} />
          </div>
        </div>
      )}

      {/* Métricas Adicionais */}
      <div className="grid grid-cols-3 gap-3">
        {predictedROI !== undefined && (
          <div className="bg-bg-elevated rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-primary">{predictedROI}%</div>
            <div className="text-xs text-text-tertiary">ROI Previsto</div>
          </div>
        )}
        {viralProbability !== undefined && (
          <div className="bg-bg-elevated rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-secondary">
              {Math.round(viralProbability * 100)}%
            </div>
            <div className="text-xs text-text-tertiary">Potencial Viral</div>
          </div>
        )}
        {riskLevel && (
          <div className={cn("rounded-lg p-3 text-center", riskConfig[riskLevel].bg)}>
            <div className={cn("text-lg font-bold", riskConfig[riskLevel].color)}>
              {riskConfig[riskLevel].label}
            </div>
            <div className="text-xs text-text-tertiary">Nível de Risco</div>
          </div>
        )}
      </div>

      {/* Insights */}
      {insights && insights.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-text-secondary">Insights da IA</h4>
          <ul className="space-y-1">
            {insights.map((insight, index) => (
              <li
                key={index}
                className="text-sm text-text-tertiary flex items-start gap-2"
              >
                <span className="text-primary mt-1">•</span>
                {insight}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Barra de progresso para breakdown
function ScoreBar({
  label,
  value,
  max,
}: {
  label: string;
  value: number;
  max: number;
}) {
  const percentage = (value / max) * 100;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-text-tertiary">{label}</span>
        <span className="text-text-secondary font-medium">
          {value.toFixed(1)}/{max}
        </span>
      </div>
      <div className="h-1.5 bg-bg-elevated rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

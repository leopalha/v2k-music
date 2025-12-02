"use client";

import { AchievementTier } from "@prisma/client";
import { getTierBadgeColor } from "@/lib/gamification/achievements";
import {
  Trophy,
  TrendingUp,
  Coins,
  Repeat,
  Layers,
  Users,
  Calendar,
  DollarSign,
  Crown,
  Star,
  Gem,
  LucideIcon,
} from "lucide-react";

interface AchievementBadgeProps {
  icon?: string;
  title: string;
  description: string;
  tier: AchievementTier;
  points: number;
  progress: number;
  target: number;
  unlocked: boolean;
  unlockedAt?: Date | null;
  showProgress?: boolean;
}

const iconMap: Record<string, LucideIcon> = {
  rocket: Trophy,
  "trending-up": TrendingUp,
  coins: Coins,
  repeat: Repeat,
  layers: Layers,
  users: Users,
  calendar: Calendar,
  "dollar-sign": DollarSign,
  crown: Crown,
  star: Star,
  gem: Gem,
};

export function AchievementBadge({
  icon = "trophy",
  title,
  description,
  tier,
  points,
  progress,
  target,
  unlocked,
  unlockedAt,
  showProgress = true,
}: AchievementBadgeProps) {
  const Icon = iconMap[icon] || Trophy;
  const tierColor = getTierBadgeColor(tier);
  const progressPercent = Math.min(100, (progress / target) * 100);

  return (
    <div
      className={`
        relative rounded-lg border p-4 transition-all
        ${
          unlocked
            ? "bg-bg-elevated border-border-default shadow-md"
            : "bg-bg-secondary border-border-subtle opacity-60"
        }
      `}
    >
      {/* Unlocked Badge */}
      {unlocked && (
        <div className="absolute top-2 right-2">
          <div className="bg-green-500/10 text-green-500 text-xs font-semibold px-2 py-1 rounded-full border border-green-500/20">
            Desbloqueado
          </div>
        </div>
      )}

      {/* Icon and Tier */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className={`
            w-12 h-12 rounded-full flex items-center justify-center
            ${unlocked ? tierColor : "bg-bg-tertiary text-text-tertiary"}
          `}
        >
          <Icon className="w-6 h-6" />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-text-primary">{title}</h3>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded border ${tierColor}`}
            >
              {tier}
            </span>
          </div>
          <p className="text-sm text-text-secondary">{description}</p>
        </div>
      </div>

      {/* Progress Bar */}
      {showProgress && !unlocked && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-text-tertiary mb-1">
            <span>Progresso</span>
            <span>
              {progress.toLocaleString()} / {target.toLocaleString()}
            </span>
          </div>
          <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-400 to-secondary-400 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Unlocked Date */}
      {unlocked && unlockedAt && (
        <div className="text-xs text-text-tertiary mb-2">
          Desbloqueado em {new Date(unlockedAt).toLocaleDateString("pt-BR")}
        </div>
      )}

      {/* Points */}
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-primary-400">
          +{points} XP
        </div>
        {unlocked && (
          <div className="text-xs text-green-500 font-medium">✓ Completo</div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Play, Pause, TrendingUp, TrendingDown, Bell, Eye } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import { Badge } from "@/components/ui";
import { CreatePriceAlertModal } from "@/components/alerts/CreatePriceAlertModal";
import { AIScoreBadge } from "@/components/tracks/ai-score-badge";
import { toast } from "sonner";

export interface Track {
  id: string;
  title: string;
  artist: string;
  coverArt: string;
  genre: string;
  pricePerToken: number;
  currentROI: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  totalTokens: number;
  availableTokens: number;
  isFavorite?: boolean;
  previewUrl?: string;
  aiScore?: number;
}

interface TrackCardProps {
  track: Track;
  variant?: "grid" | "list";
  showStats?: boolean;
  onFavorite?: (trackId: string) => void;
  onPlay?: (trackId: string) => void;
  isPlaying?: boolean;
}

export function TrackCard({
  track,
  variant = "grid",
  showStats = true,
  onFavorite,
  onPlay,
  isPlaying = false,
}: TrackCardProps) {
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isTogglingWatchlist, setIsTogglingWatchlist] = useState(false);

  // Check if track is in watchlist
  useEffect(() => {
    const checkWatchlistStatus = async () => {
      try {
        const response = await fetch(`/api/watchlist/${track.id}`);
        if (response.ok) {
          const data = await response.json();
          setIsInWatchlist(data.isInWatchlist);
        }
      } catch (error) {
        // Silent fail - not critical
      }
    };
    checkWatchlistStatus();
  }, [track.id]);

  // Toggle watchlist
  const handleToggleWatchlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isTogglingWatchlist) return;

    setIsTogglingWatchlist(true);

    try {
      if (isInWatchlist) {
        // Remove from watchlist
        const response = await fetch(`/api/watchlist/${track.id}`, {
          method: "DELETE",
        });

        if (!response.ok) throw new Error("Failed to remove");

        setIsInWatchlist(false);
        toast.success("Removido da watchlist");
      } else {
        // Add to watchlist
        const response = await fetch("/api/watchlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ trackId: track.id }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to add");
        }

        setIsInWatchlist(true);
        toast.success("Adicionado à watchlist");
      }
    } catch (error) {
      console.error("Error toggling watchlist:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao atualizar watchlist");
    } finally {
      setIsTogglingWatchlist(false);
    }
  };

  const riskColors = {
    LOW: "text-success",
    MEDIUM: "text-warning",
    HIGH: "text-error",
  };

  const riskLabels = {
    LOW: "Baixo",
    MEDIUM: "Médio",
    HIGH: "Alto",
  };

  const listCard = variant === "list" ? (
    <>
      <Link href={`/track/${track.id}`}>
        <div className="flex items-center gap-4 p-4 rounded-xl bg-bg-secondary border border-border-default hover:bg-bg-elevated hover:border-border-strong transition-all cursor-pointer group">
          {/* Small Cover Art */}
          <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
            {track.coverArt ? (
              <Image
                src={track.coverArt}
                alt={track.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {track.title[0]}
                </span>
              </div>
            )}

            {/* Play Button Overlay */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onPlay?.(track.id);
              }}
              className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 text-white" />
              ) : (
                <Play className="w-6 h-6 text-white" />
              )}
            </button>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-text-primary truncate">
              {track.title}
            </h3>
            <p className="text-sm text-text-tertiary truncate">{track.artist}</p>
          </div>

          {/* Stats (right side) */}
          {showStats && (
            <div className="flex items-center gap-6">
              <div className="text-right hidden sm:block">
                <div className="text-sm text-text-tertiary">Gênero</div>
                <div className="text-sm font-medium text-text-secondary">
                  {track.genre}
                </div>
              </div>

              <div className="text-right">
                <div className="text-lg font-mono font-medium text-text-primary">
                  {formatCurrency(track.pricePerToken)}
                </div>
                <div
                  className={cn(
                    "text-sm font-semibold flex items-center justify-end gap-1",
                    track.currentROI >= 0 ? "text-success" : "text-error"
                  )}
                >
                  {track.currentROI >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {formatPercentage(track.currentROI)}
                </div>
              </div>

              {/* Watchlist Button */}
              <button
                onClick={handleToggleWatchlist}
                disabled={isTogglingWatchlist}
                className="p-2 rounded-lg hover:bg-bg-elevated transition-colors disabled:opacity-50"
                title={isInWatchlist ? "Remover da watchlist" : "Adicionar à watchlist"}
              >
                <Eye
                  className={cn(
                    "w-5 h-5 transition-colors",
                    isInWatchlist
                      ? "fill-secondary text-secondary"
                      : "text-text-tertiary hover:text-secondary"
                  )}
                />
              </button>

              {/* Alert Button */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowAlertModal(true);
                }}
                className="p-2 rounded-lg hover:bg-bg-elevated transition-colors"
                title="Criar alerta de preço"
              >
                <Bell className="w-5 h-5 text-text-tertiary hover:text-primary transition-colors" />
              </button>

              {/* Favorite */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onFavorite?.(track.id);
                }}
                className="p-2 rounded-lg hover:bg-bg-elevated transition-colors"
              >
                <Heart
                  className={cn(
                    "w-5 h-5 transition-colors",
                    track.isFavorite
                      ? "fill-accent-400 text-accent-400"
                      : "text-text-tertiary hover:text-accent-400"
                  )}
                />
              </button>
            </div>
          )}
        </div>
      </Link>

      {/* Price Alert Modal */}
      <CreatePriceAlertModal
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        track={{
          id: track.id,
          title: track.title,
          artistName: track.artist,
          currentPrice: track.pricePerToken,
          coverUrl: track.coverArt,
        }}
      />
    </>
  ) : null;

  // Grid variant (default)
  const gridCard = (
    <>
      <Link href={`/track/${track.id}`}>
        <div className="group relative overflow-hidden rounded-xl bg-bg-secondary border border-border-default transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:border-border-strong cursor-pointer">
        {/* Cover Art */}
        <div className="relative aspect-square">
          {track.coverArt ? (
            <Image
              src={track.coverArt}
              alt={track.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-400 via-secondary-400 to-accent-400 flex items-center justify-center">
              <span className="text-white font-bold text-4xl">
                {track.title[0]}
              </span>
            </div>
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Play Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onPlay?.(track.id);
              }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="w-16 h-16 rounded-full bg-primary-400 flex items-center justify-center hover:bg-primary-500 transition-colors">
                {isPlaying ? (
                  <Pause className="w-8 h-8 text-white" />
                ) : (
                  <Play className="w-8 h-8 text-white ml-1" />
                )}
              </div>
            </button>
          </div>

          {/* Action Buttons (top right) */}
          <div className="absolute top-3 right-3 flex gap-2 z-10">
            {/* Watchlist Button */}
            <button
              onClick={handleToggleWatchlist}
              disabled={isTogglingWatchlist}
              className="p-2 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-all disabled:opacity-50"
              title={isInWatchlist ? "Remover da watchlist" : "Adicionar à watchlist"}
            >
              <Eye
                className={cn(
                  "w-5 h-5 transition-colors",
                  isInWatchlist
                    ? "fill-secondary text-secondary"
                    : "text-white hover:text-secondary"
                )}
              />
            </button>

            {/* Alert Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowAlertModal(true);
              }}
              className="p-2 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-all"
              title="Criar alerta de preço"
            >
              <Bell className="w-5 h-5 text-white hover:text-primary transition-colors" />
            </button>

            {/* Favorite Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onFavorite?.(track.id);
              }}
              className="p-2 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-all"
            >
              <Heart
                className={cn(
                  "w-5 h-5 transition-colors",
                  track.isFavorite
                    ? "fill-accent-400 text-accent-400"
                    : "text-white hover:text-accent-400"
                )}
              />
            </button>
          </div>

          {/* Genre Badge (top left) */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            <Badge variant="default" size="sm">
              {track.genre}
            </Badge>
            {/* AI Score Badge */}
            {track.aiScore !== undefined && track.aiScore > 0 && (
              <AIScoreBadge score={track.aiScore} size="sm" variant="pill" />
            )}
          </div>

          {/* Risk indicator (bottom left) */}
          <div className="absolute bottom-3 left-3">
            <Badge
              variant={
                track.riskLevel === "LOW"
                  ? "success"
                  : track.riskLevel === "MEDIUM"
                    ? "warning"
                    : "error"
              }
              size="sm"
            >
              Risco {riskLabels[track.riskLevel]}
            </Badge>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="text-base font-semibold text-text-primary truncate">
            {track.title}
          </h3>
          <p className="text-sm text-text-tertiary truncate">{track.artist}</p>

          {showStats && (
            <div className="flex items-center justify-between mt-3">
              <span className="text-lg font-mono font-medium text-text-primary">
                {formatCurrency(track.pricePerToken)}
              </span>
              <span
                className={cn(
                  "text-sm font-semibold flex items-center gap-1",
                  track.currentROI >= 0 ? "text-success" : "text-error"
                )}
              >
                {track.currentROI >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {formatPercentage(track.currentROI)}
              </span>
            </div>
          )}

          {/* Available tokens */}
          <div className="mt-3 pt-3 border-t border-border-subtle">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-tertiary">Disponível</span>
              <span className="text-text-secondary font-medium">
                {track.availableTokens.toLocaleString("pt-BR")} /{" "}
                {track.totalTokens.toLocaleString("pt-BR")} tokens
              </span>
            </div>
            {/* Progress bar */}
            <div className="mt-2 h-1.5 bg-bg-elevated rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-400 rounded-full transition-all"
                style={{
                  width: `${((track.totalTokens - track.availableTokens) / track.totalTokens) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
        </div>
      </Link>

      {/* Price Alert Modal */}
      <CreatePriceAlertModal
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        track={{
          id: track.id,
          title: track.title,
          artistName: track.artist,
          currentPrice: track.pricePerToken,
          coverUrl: track.coverArt,
        }}
      />
    </>
  );

  return variant === "list" ? listCard : gridCard;
}

// Skeleton for loading state
export function TrackCardSkeleton({ variant = "grid" }: { variant?: "grid" | "list" }) {
  if (variant === "list") {
    return (
      <div className="flex items-center gap-4 p-4 rounded-xl bg-bg-secondary border border-border-default">
        <div className="w-16 h-16 rounded-lg bg-bg-elevated animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-bg-elevated rounded animate-pulse w-3/4" />
          <div className="h-3 bg-bg-elevated rounded animate-pulse w-1/2" />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-bg-elevated rounded animate-pulse w-20" />
          <div className="h-3 bg-bg-elevated rounded animate-pulse w-16" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-bg-secondary border border-border-default overflow-hidden">
      <div className="aspect-square bg-bg-elevated animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-bg-elevated rounded animate-pulse w-3/4" />
        <div className="h-3 bg-bg-elevated rounded animate-pulse w-1/2" />
        <div className="flex justify-between mt-3">
          <div className="h-5 bg-bg-elevated rounded animate-pulse w-20" />
          <div className="h-5 bg-bg-elevated rounded animate-pulse w-16" />
        </div>
        <div className="pt-3 border-t border-border-subtle">
          <div className="h-3 bg-bg-elevated rounded animate-pulse w-full" />
          <div className="h-1.5 bg-bg-elevated rounded-full animate-pulse w-full mt-2" />
        </div>
      </div>
    </div>
  );
}

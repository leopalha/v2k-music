"use client";

import { TrackCard, TrackCardSkeleton, type Track } from "./track-card";
import { cn } from "@/lib/utils/cn";
import { Music } from "lucide-react";
import { Button } from "@/components/ui";
import Link from "next/link";

interface TrackGridProps {
  tracks: Track[];
  variant?: "grid" | "list";
  loading?: boolean;
  skeletonCount?: number;
  onFavorite?: (trackId: string) => void;
  onPlay?: (trackId: string) => void;
  playingTrackId?: string | null;
  emptyMessage?: string;
  emptyAction?: {
    label: string;
    href: string;
  };
  className?: string;
}

export function TrackGrid({
  tracks,
  variant = "grid",
  loading = false,
  skeletonCount = 8,
  onFavorite,
  onPlay,
  playingTrackId,
  emptyMessage = "Nenhuma música encontrada",
  emptyAction,
  className,
}: TrackGridProps) {
  // Loading state
  if (loading) {
    return (
      <div
        className={cn(
          variant === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-4",
          className
        )}
      >
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <TrackCardSkeleton key={i} variant={variant} />
        ))}
      </div>
    );
  }

  // Empty state
  if (tracks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-20 h-20 rounded-full bg-bg-elevated flex items-center justify-center mb-6">
          <Music className="w-10 h-10 text-text-tertiary" />
        </div>
        <h3 className="text-xl font-semibold text-text-primary mb-2">
          {emptyMessage}
        </h3>
        <p className="text-text-secondary text-center max-w-md mb-6">
          Tente ajustar os filtros ou explore outras categorias
        </p>
        {emptyAction && (
          <Link href={emptyAction.href}>
            <Button variant="primary">{emptyAction.label}</Button>
          </Link>
        )}
      </div>
    );
  }

  // Grid/List view
  return (
    <div
      className={cn(
        variant === "grid"
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          : "space-y-4",
        className
      )}
    >
      {tracks.map((track) => (
        <TrackCard
          key={track.id}
          track={track}
          variant={variant}
          onFavorite={onFavorite}
          onPlay={onPlay}
          isPlaying={playingTrackId === track.id}
        />
      ))}
    </div>
  );
}

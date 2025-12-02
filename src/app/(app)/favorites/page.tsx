"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AppLayout, PageHeader } from "@/components/layout";
import { TrackCard, type Track } from "@/components/tracks";
import { Button } from "@/components/ui";
import { Heart, Filter, Grid, List, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function FavoritesPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/favorites");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao carregar favoritos");
      }

      // Map API data to Track interface
      const mappedTracks: Track[] = data.tracks.map((track: any) => ({
        id: track.id,
        title: track.title,
        artist: track.artistName,
        coverArt: track.coverUrl || "",
        genre: track.genre,
        pricePerToken: track.currentPrice,
        currentROI: 0, // TODO: Calculate from historical data
        riskLevel: "MEDIUM" as const,
        totalTokens: track.totalSupply,
        availableTokens: track.availableSupply,
        isFavorite: true,
      }));

      setTracks(mappedTracks);
    } catch (error) {
      toast.error(
        "Erro ao carregar favoritos",
        error instanceof Error ? error.message : "Tente novamente"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFavoriteToggle = async (trackId: string) => {
    // Optimistic update
    setTracks((prev) => prev.filter((track) => track.id !== trackId));

    try {
      const res = await fetch(`/api/tracks/${trackId}/favorite`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Erro ao remover favorito");
      }

      toast.success("Removido", "Track removida dos favoritos");
    } catch (error) {
      // Revert on error
      loadFavorites();
      toast.error(
        "Erro",
        error instanceof Error ? error.message : "Tente novamente"
      );
    }
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <PageHeader
          title="Favoritos"
          subtitle="Músicas que você salvou para acompanhar"
        />

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
          </div>
        ) : (
          <>
            {/* Controls */}
            {tracks.length > 0 && (
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-text-secondary">
                  {tracks.length} {tracks.length === 1 ? "música salva" : "músicas salvas"}
                </p>
                <div className="flex items-center bg-bg-secondary rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === "grid"
                        ? "bg-bg-elevated text-text-primary"
                        : "text-text-tertiary hover:text-text-secondary"
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === "list"
                        ? "bg-bg-elevated text-text-primary"
                        : "text-text-tertiary hover:text-text-secondary"
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Favorites Grid */}
            {tracks.length > 0 ? (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    : "space-y-4"
                }
              >
                {tracks.map((track) => (
                  <TrackCard
                    key={track.id}
                    track={track}
                    variant={viewMode}
                    onFavorite={handleFavoriteToggle}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Heart className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  Nenhum favorito ainda
                </h3>
                <p className="text-text-secondary mb-6">
                  Explore o marketplace e salve músicas que você quer acompanhar
                </p>
                <Link href="/marketplace">
                  <Button>Explorar Marketplace</Button>
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}

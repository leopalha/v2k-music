"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { AppLayout, PageHeader } from "@/components/layout";
import {
  TrackGrid,
  FilterBar,
  SearchInput,
  defaultFilters,
  type FilterOptions,
} from "@/components/tracks";
import { toast } from "@/components/ui";
import { useTracksAPI } from "@/hooks/useTracksAPI";

export default function MarketplacePage() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams?.get("search") || "";

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [filters, setFilters] = useState<FilterOptions>(defaultFilters);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("v2k-recent-searches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Fetch tracks from API
  const { data, isLoading, error } = useTracksAPI({
    genre: filters.genres.length > 0 ? filters.genres[0] : undefined,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    sortBy: filters.sortBy
  })

  // Server-side search with fallback to client-side filtering
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      try {
        setIsSearching(true);
        const params = new URLSearchParams({ q: searchQuery });
        if (filters.genres.length > 0) params.append("genre", filters.genres[0]);
        if (filters.minPrice) params.append("minPrice", filters.minPrice.toString());
        if (filters.maxPrice) params.append("maxPrice", filters.maxPrice.toString());
        params.append("sortBy", filters.sortBy);

        const res = await fetch(`/api/search?${params.toString()}`);
        const searchData = await res.json();
        if (res.ok) {
          setSearchResults(searchData.tracks);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [searchQuery, filters]);

  const filteredTracks = useMemo(() => {
    if (!data?.tracks) return [];

    // Use search results if user is searching
    if (searchQuery.trim() && searchResults.length > 0) {
      return searchResults.map((track: any) => ({
        id: track.id,
        title: track.title,
        artist: track.artistName,
        coverArt: track.coverUrl || "",
        genre: track.genre,
        pricePerToken: track.currentPrice,
        currentROI: 0,
        riskLevel: "MEDIUM" as const,
        totalTokens: track.totalSupply,
        availableTokens: track.availableSupply,
        isFavorite: false,
      }));
    }

    return data.tracks;
  }, [data, searchQuery, searchResults])

  // Handle search
  const handleSearch = (query: string) => {
    if (query.trim() && !recentSearches.includes(query)) {
      const newRecent = [query, ...recentSearches.slice(0, 4)];
      setRecentSearches(newRecent);
      localStorage.setItem("v2k-recent-searches", JSON.stringify(newRecent));
    }
  };

  // Handle favorite toggle
  const handleFavorite = (trackId: string) => {
    // TODO: Implement with real API
    toast.success("Adicionado aos favoritos!");
  };

  // Handle play preview
  const handlePlay = (trackId: string) => {
    if (playingTrackId === trackId) {
      setPlayingTrackId(null);
    } else {
      setPlayingTrackId(trackId);
      // TODO: Implement actual audio playback
    }
  };

  // Clear recent searches
  const handleClearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("v2k-recent-searches");
  };

  // Show onboarding success toast
  useEffect(() => {
    if (searchParams?.get("onboarding") === "complete") {
      toast.success("Bem-vindo ao V2K!", "Seu cadastro foi concluído. Explore as músicas disponíveis!");
      // Clean URL
      window.history.replaceState({}, "", "/marketplace");
    }
  }, [searchParams]);

  return (
    <AppLayout>
      <PageHeader
        title="Marketplace"
        subtitle="Explore músicas tokenizadas e encontre sua próxima oportunidade de investimento"
      />

      {/* Search */}
      <div className="mb-6">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          onSearch={handleSearch}
          suggestions={searchQuery ? filteredTracks.slice(0, 5) : []}
          recentSearches={recentSearches}
          onClearRecentSearches={handleClearRecentSearches}
          className="max-w-xl"
        />
      </div>

      {/* Filters */}
      <FilterBar
        filters={filters}
        onFiltersChange={setFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalResults={filteredTracks.length}
        className="mb-8"
      />

      {/* Track Grid */}
      {error ? (
        <div className="text-center py-12">
          <p className="text-text-muted">Erro ao carregar músicas. Tente novamente.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-dark"
          >
            Recarregar
          </button>
        </div>
      ) : (
        <TrackGrid
          tracks={filteredTracks}
          variant={viewMode}
          onFavorite={handleFavorite}
          onPlay={handlePlay}
          playingTrackId={playingTrackId}
          loading={isLoading || isSearching}
          emptyMessage="Nenhuma música encontrada com esses filtros"
          emptyAction={{
            label: "Limpar Filtros",
            href: "/marketplace",
          }}
        />
      )}
    </AppLayout>
  );
}

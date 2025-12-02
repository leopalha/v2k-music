"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { AppLayout, PageHeader } from "@/components/layout";
import { TrackCard, type Track } from "@/components/tracks";
import { Button } from "@/components/ui";
import { Search, Filter, Grid, List, Loader2, SlidersHorizontal, X } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const GENRES = [
  "Todos",
  "Eletrônica",
  "Hip-Hop",
  "Pop",
  "Rock",
  "Jazz",
  "Clássica",
  "Reggae",
  "Country",
  "Blues",
];

const SORT_OPTIONS = [
  { value: "newest", label: "Mais Recentes" },
  { value: "price_asc", label: "Menor Preço" },
  { value: "price_desc", label: "Maior Preço" },
  { value: "popular", label: "Mais Populares" },
];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams?.get("q") || "";

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [query, setQuery] = useState(initialQuery);
  const [selectedGenre, setSelectedGenre] = useState("Todos");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    if (initialQuery) {
      performSearch();
    }
  }, [initialQuery]);

  const performSearch = async () => {
    try {
      setIsLoading(true);

      // Build query params
      const params = new URLSearchParams();
      if (query) params.append("q", query);
      if (selectedGenre !== "Todos") params.append("genre", selectedGenre);
      if (minPrice) params.append("minPrice", minPrice);
      if (maxPrice) params.append("maxPrice", maxPrice);
      params.append("sortBy", sortBy);

      const res = await fetch(`/api/search?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao buscar");
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
        isFavorite: false, // TODO: Fetch from favorites API
      }));

      setTracks(mappedTracks);
    } catch (error) {
      toast.error(
        "Erro ao buscar",
        error instanceof Error ? error.message : "Tente novamente"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    performSearch();
  };

  const clearFilters = () => {
    setSelectedGenre("Todos");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("newest");
  };

  const hasActiveFilters =
    selectedGenre !== "Todos" || minPrice !== "" || maxPrice !== "";

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <PageHeader
          title="Buscar Músicas"
          subtitle="Encontre as melhores oportunidades de investimento"
        />

        {/* Search Bar */}
        <div className="mb-6 flex gap-3">
          <div className="flex-1 flex gap-3">
            <input
              type="text"
              placeholder="Buscar músicas, artistas, gêneros..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1 px-4 py-3 bg-bg-elevated border border-border-subtle rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary-400 transition-colors"
            />
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
            </Button>
          </div>

          {/* Filter Toggle (Mobile) */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden px-4 py-3 bg-bg-elevated border border-border-subtle rounded-lg hover:bg-bg-secondary transition-colors"
          >
            <SlidersHorizontal className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <aside
            className={`${
              showFilters ? "block" : "hidden"
            } lg:block w-full lg:w-64 flex-shrink-0`}
          >
            <div className="bg-bg-elevated border border-border-subtle rounded-lg p-4 sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-text-primary">Filtros</h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-primary-400 hover:text-primary-300"
                  >
                    Limpar
                  </button>
                )}
              </div>

              {/* Genre Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Gênero
                </label>
                <div className="space-y-2">
                  {GENRES.map((genre) => (
                    <label
                      key={genre}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="genre"
                        value={genre}
                        checked={selectedGenre === genre}
                        onChange={(e) => setSelectedGenre(e.target.value)}
                        className="w-4 h-4 text-primary-400 border-border-subtle focus:ring-primary-400"
                      />
                      <span className="text-sm text-text-primary">{genre}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Faixa de Preço (R$)
                </label>
                <div className="space-y-2">
                  <input
                    type="number"
                    placeholder="Mín"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-bg-secondary border border-border-subtle rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary-400"
                  />
                  <input
                    type="number"
                    placeholder="Máx"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-bg-secondary border border-border-subtle rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary-400"
                  />
                </div>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Ordenar por
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 bg-bg-secondary border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-primary-400"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Apply Filters Button */}
              <Button
                onClick={handleSearch}
                className="w-full mt-4"
                disabled={isLoading}
              >
                Aplicar Filtros
              </Button>
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1 min-w-0">
            {/* Results Header */}
            {!isLoading && tracks.length > 0 && (
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-text-secondary">
                  {tracks.length} {tracks.length === 1 ? "resultado encontrado" : "resultados encontrados"}
                  {query && ` para "${query}"`}
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

            {/* Loading State */}
            {isLoading ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
              </div>
            ) : tracks.length > 0 ? (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "space-y-4"
                }
              >
                {tracks.map((track) => (
                  <TrackCard
                    key={track.id}
                    track={track}
                    variant={viewMode}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Search className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  {query ? "Nenhum resultado encontrado" : "Faça uma busca"}
                </h3>
                <p className="text-text-secondary mb-6">
                  {query
                    ? "Tente ajustar os filtros ou usar termos diferentes"
                    : "Digite algo na barra de busca para encontrar músicas"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

"use client";

import { useState } from "react";
import {
  Filter,
  X,
  ChevronDown,
  Grid3X3,
  List,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button, Badge, RangeSlider } from "@/components/ui";

export interface FilterOptions {
  genres: string[];
  minPrice: number;
  maxPrice: number;
  minROI: number | null;
  riskLevels: ("LOW" | "MEDIUM" | "HIGH")[];
  sortBy: "popular" | "newest" | "price_asc" | "price_desc" | "roi" | "name" | "volume" | "holders" | "streams";
}

const defaultFilters: FilterOptions = {
  genres: [],
  minPrice: 0,
  maxPrice: 100,
  minROI: null,
  riskLevels: [],
  sortBy: "popular",
};

const GENRES = ["Trap", "Funk", "Rap", "R&B", "Reggaeton", "Pop", "Rock", "Eletrônica"];
const ROI_OPTIONS = [
  { label: "Qualquer", value: null },
  { label: "> 5%", value: 5 },
  { label: "> 10%", value: 10 },
  { label: "> 20%", value: 20 },
  { label: "> 50%", value: 50 },
];
const SORT_OPTIONS = [
  { label: "Mais Populares", value: "popular" },
  { label: "Mais Recentes", value: "newest" },
  { label: "Menor Preço", value: "price_asc" },
  { label: "Maior Preço", value: "price_desc" },
  { label: "Maior ROI", value: "roi" },
  { label: "Maior Volume 24h", value: "volume" },
  { label: "Mais Holders", value: "holders" },
  { label: "Mais Streams", value: "streams" },
  { label: "Nome A-Z", value: "name" },
];

interface FilterBarProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  totalResults?: number;
  className?: string;
}

export function FilterBar({
  filters,
  onFiltersChange,
  viewMode,
  onViewModeChange,
  totalResults,
  className,
}: FilterBarProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const activeFilterCount =
    filters.genres.length +
    filters.riskLevels.length +
    (filters.minROI !== null ? 1 : 0) +
    (filters.minPrice > 0 || filters.maxPrice < 100 ? 1 : 0);

  const handleGenreToggle = (genre: string) => {
    const newGenres = filters.genres.includes(genre)
      ? filters.genres.filter((g) => g !== genre)
      : [...filters.genres, genre];
    onFiltersChange({ ...filters, genres: newGenres });
  };

  const handleRiskToggle = (risk: "LOW" | "MEDIUM" | "HIGH") => {
    const newRisks = filters.riskLevels.includes(risk)
      ? filters.riskLevels.filter((r) => r !== risk)
      : [...filters.riskLevels, risk];
    onFiltersChange({ ...filters, riskLevels: newRisks });
  };

  const handleClearFilters = () => {
    onFiltersChange(defaultFilters);
  };

  const currentSortLabel =
    SORT_OPTIONS.find((opt) => opt.value === filters.sortBy)?.label || "Ordenar";

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left side - Filter button & Results count */}
        <div className="flex items-center gap-4">
          <Button
            variant={showFilters ? "primary" : "secondary"}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            icon={<Filter className="w-4 h-4" />}
            data-testid="genre-filter"
          >
            Filtros
            {activeFilterCount > 0 && (
              <Badge variant="primary" size="sm" className="ml-2">
                {activeFilterCount}
              </Badge>
            )}
          </Button>

          {totalResults !== undefined && (
            <span className="text-sm text-text-secondary">
              {(totalResults ?? 0).toLocaleString("pt-BR")} músicas
            </span>
          )}
        </div>

        {/* Right side - Sort & View toggle */}
        <div className="flex items-center gap-3">
          {/* Sort Dropdown */}
          <div className="relative">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              icon={<SlidersHorizontal className="w-4 h-4" />}
            >
              {currentSortLabel}
              <ChevronDown
                className={cn(
                  "w-4 h-4 ml-1 transition-transform",
                  showSortDropdown && "rotate-180"
                )}
              />
            </Button>

            {showSortDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowSortDropdown(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-48 bg-bg-secondary border border-border-default rounded-xl shadow-xl z-20 overflow-hidden">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        onFiltersChange({
                          ...filters,
                          sortBy: option.value as FilterOptions["sortBy"],
                        });
                        setShowSortDropdown(false);
                      }}
                      className={cn(
                        "w-full px-4 py-3 text-left text-sm transition-colors",
                        filters.sortBy === option.value
                          ? "bg-primary-400/10 text-primary-400"
                          : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* View Mode Toggle - Hidden on small mobile */}
          <div className="hidden xs:flex items-center bg-bg-secondary rounded-lg border border-border-default p-1">
            <button
              onClick={() => onViewModeChange("grid")}
              className={cn(
                "p-2 rounded-lg transition-colors",
                viewMode === "grid"
                  ? "bg-primary-400 text-white"
                  : "text-text-tertiary hover:text-text-primary"
              )}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange("list")}
              className={cn(
                "p-2 rounded-lg transition-colors",
                viewMode === "list"
                  ? "bg-primary-400 text-white"
                  : "text-text-tertiary hover:text-text-primary"
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Filters Panel */}
      {showFilters && (
        <div className="p-4 sm:p-6 bg-bg-secondary rounded-xl sm:rounded-2xl border border-border-default space-y-4 sm:space-y-6">
          {/* Genres */}
          <div>
            <h4 className="text-xs sm:text-sm font-medium text-text-primary mb-2 sm:mb-3">
              Gênero
            </h4>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {GENRES.map((genre) => (
                <button
                  key={genre}
                  onClick={() => handleGenreToggle(genre)}
                  data-testid={`genre-${genre.toLowerCase()}`}
                  className={cn(
                    "px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all",
                    filters.genres.includes(genre)
                      ? "bg-primary-400 text-white"
                      : "bg-bg-elevated text-text-secondary hover:bg-bg-elevated/80 hover:text-text-primary"
                  )}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h4 className="text-sm font-medium text-text-primary mb-3">
              Faixa de Preço
            </h4>
            <RangeSlider
              min={0}
              max={100}
              value={[filters.minPrice, filters.maxPrice]}
              onChange={([min, max]) =>
                onFiltersChange({ ...filters, minPrice: min, maxPrice: max })
              }
              step={1}
              formatLabel={(v) => `R$ ${v.toFixed(2)}`}
            />
          </div>

          {/* ROI */}
          <div>
            <h4 className="text-xs sm:text-sm font-medium text-text-primary mb-2 sm:mb-3">
              ROI Mínimo
            </h4>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {ROI_OPTIONS.map((option) => (
                <button
                  key={option.value ?? "any"}
                  onClick={() =>
                    onFiltersChange({ ...filters, minROI: option.value })
                  }
                  className={cn(
                    "px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all",
                    filters.minROI === option.value
                      ? "bg-primary-400 text-white"
                      : "bg-bg-elevated text-text-secondary hover:bg-bg-elevated/80 hover:text-text-primary"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Risk Level */}
          <div>
            <h4 className="text-xs sm:text-sm font-medium text-text-primary mb-2 sm:mb-3">
              Nível de Risco
            </h4>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {(["LOW", "MEDIUM", "HIGH"] as const).map((risk) => (
                <button
                  key={risk}
                  onClick={() => handleRiskToggle(risk)}
                  className={cn(
                    "px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all",
                    filters.riskLevels.includes(risk)
                      ? risk === "LOW"
                        ? "bg-success text-white"
                        : risk === "MEDIUM"
                          ? "bg-warning text-black"
                          : "bg-error text-white"
                      : "bg-bg-elevated text-text-secondary hover:bg-bg-elevated/80 hover:text-text-primary"
                  )}
                >
                  {risk === "LOW" ? "Baixo" : risk === "MEDIUM" ? "Médio" : "Alto"}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-0 pt-3 sm:pt-4 border-t border-border-subtle">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              icon={<X className="w-4 h-4" />}
              className="order-2 sm:order-1"
            >
              Limpar Filtros
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowFilters(false)}
              className="order-1 sm:order-2"
            >
              Aplicar
            </Button>
          </div>
        </div>
      )}

      {/* Active Filter Tags */}
      {activeFilterCount > 0 && !showFilters && (
        <div className="flex flex-wrap items-center gap-2">
          {filters.genres.map((genre) => (
            <Badge
              key={genre}
              variant="primary"
              className="cursor-pointer"
              onClick={() => handleGenreToggle(genre)}
            >
              {genre}
              <X className="w-3 h-3 ml-1" />
            </Badge>
          ))}
          {filters.riskLevels.map((risk) => (
            <Badge
              key={risk}
              variant={
                risk === "LOW"
                  ? "success"
                  : risk === "MEDIUM"
                    ? "warning"
                    : "error"
              }
              className="cursor-pointer"
              onClick={() => handleRiskToggle(risk)}
            >
              Risco {risk === "LOW" ? "Baixo" : risk === "MEDIUM" ? "Médio" : "Alto"}
              <X className="w-3 h-3 ml-1" />
            </Badge>
          ))}
          {filters.minROI !== null && (
            <Badge
              variant="secondary"
              className="cursor-pointer"
              onClick={() => onFiltersChange({ ...filters, minROI: null })}
            >
              ROI {">"} {filters.minROI}%
              <X className="w-3 h-3 ml-1" />
            </Badge>
          )}
          {(filters.minPrice > 0 || filters.maxPrice < 100) && (
            <Badge
              variant="secondary"
              className="cursor-pointer"
              onClick={() =>
                onFiltersChange({ ...filters, minPrice: 0, maxPrice: 100 })
              }
            >
              R$ {filters.minPrice} - R$ {filters.maxPrice}
              <X className="w-3 h-3 ml-1" />
            </Badge>
          )}
          <button
            onClick={handleClearFilters}
            className="text-sm text-primary-400 hover:text-primary-500"
          >
            Limpar todos
          </button>
        </div>
      )}
    </div>
  );
}

export { defaultFilters };

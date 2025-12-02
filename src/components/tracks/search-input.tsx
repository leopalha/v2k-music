"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, X, Music, Clock, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Track } from "./track-card";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (query: string) => void;
  placeholder?: string;
  suggestions?: Track[];
  recentSearches?: string[];
  onClearRecentSearches?: () => void;
  loading?: boolean;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  onSearch,
  placeholder = "Buscar músicas, artistas...",
  suggestions = [],
  recentSearches = [],
  onClearRecentSearches,
  loading = false,
  className,
}: SearchInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [debouncedValue, setDebouncedValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce search value
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, 300);

    return () => clearTimeout(timer);
  }, [value]);

  // Trigger search when debounced value changes
  useEffect(() => {
    if (debouncedValue && onSearch) {
      onSearch(debouncedValue);
    }
  }, [debouncedValue, onSearch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && value.trim()) {
      setIsFocused(false);
      // Navigate to search results page
      window.location.href = `/marketplace?search=${encodeURIComponent(value)}`;
    }
    if (e.key === "Escape") {
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  const handleClear = () => {
    onChange("");
    inputRef.current?.focus();
  };

  const showDropdown =
    isFocused && (value.length > 0 || recentSearches.length > 0);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Input */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary">
          <Search className="w-5 h-5" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            "w-full pl-12 pr-10 py-3 rounded-xl",
            "bg-bg-secondary border border-border-default text-text-primary placeholder:text-text-tertiary",
            "focus:outline-none focus:ring-2 focus:ring-primary-400/20 focus:border-primary-400",
            "transition-all"
          )}
        />
        {value && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-bg-secondary border border-border-default rounded-xl shadow-xl z-50 overflow-hidden">
          {/* Loading */}
          {loading && (
            <div className="p-4 text-center">
              <div className="w-6 h-6 border-2 border-primary-400 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          )}

          {/* Suggestions */}
          {!loading && value.length > 0 && suggestions.length > 0 && (
            <div className="py-2">
              <div className="px-4 py-2 text-xs font-medium text-text-tertiary uppercase tracking-wide">
                Resultados
              </div>
              {suggestions.slice(0, 5).map((track) => (
                <Link
                  key={track.id}
                  href={`/track/${track.id}`}
                  onClick={() => setIsFocused(false)}
                >
                  <div className="flex items-center gap-3 px-4 py-3 hover:bg-bg-elevated transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center flex-shrink-0">
                      <Music className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {track.title}
                      </p>
                      <p className="text-xs text-text-tertiary truncate">
                        {track.artist}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-mono text-text-secondary">
                        R$ {track.pricePerToken.toFixed(2)}
                      </p>
                      <p
                        className={cn(
                          "text-xs font-medium",
                          track.currentROI >= 0 ? "text-success" : "text-error"
                        )}
                      >
                        {track.currentROI >= 0 ? "+" : ""}
                        {track.currentROI.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
              {suggestions.length > 5 && (
                <Link
                  href={`/marketplace?search=${encodeURIComponent(value)}`}
                  onClick={() => setIsFocused(false)}
                >
                  <div className="px-4 py-3 text-center text-sm text-primary-400 hover:bg-bg-elevated transition-colors">
                    Ver todos os {suggestions.length} resultados
                  </div>
                </Link>
              )}
            </div>
          )}

          {/* No Results */}
          {!loading && value.length > 0 && suggestions.length === 0 && (
            <div className="p-6 text-center">
              <Search className="w-8 h-8 text-text-tertiary mx-auto mb-2" />
              <p className="text-text-secondary">
                Nenhum resultado para &quot;{value}&quot;
              </p>
            </div>
          )}

          {/* Recent Searches */}
          {!loading && value.length === 0 && recentSearches.length > 0 && (
            <div className="py-2">
              <div className="flex items-center justify-between px-4 py-2">
                <span className="text-xs font-medium text-text-tertiary uppercase tracking-wide">
                  Buscas Recentes
                </span>
                {onClearRecentSearches && (
                  <button
                    onClick={onClearRecentSearches}
                    className="text-xs text-primary-400 hover:text-primary-500"
                  >
                    Limpar
                  </button>
                )}
              </div>
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => {
                    onChange(search);
                    setIsFocused(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 hover:bg-bg-elevated transition-colors text-left"
                >
                  <Clock className="w-4 h-4 text-text-tertiary" />
                  <span className="text-sm text-text-secondary">{search}</span>
                </button>
              ))}
            </div>
          )}

          {/* Trending Searches */}
          {!loading && value.length === 0 && recentSearches.length === 0 && (
            <div className="py-2">
              <div className="px-4 py-2 text-xs font-medium text-text-tertiary uppercase tracking-wide">
                Em Alta
              </div>
              {["Funk", "MC Kevinho", "Trap Brasil", "Anitta"].map(
                (term, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      onChange(term);
                      setIsFocused(false);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 hover:bg-bg-elevated transition-colors text-left"
                  >
                    <TrendingUp className="w-4 h-4 text-primary-400" />
                    <span className="text-sm text-text-secondary">{term}</span>
                  </button>
                )
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

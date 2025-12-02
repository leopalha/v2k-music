"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Clock, TrendingUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import Image from "next/image";

interface SearchResult {
  id: string;
  title: string;
  artistName: string;
  genre: string;
  currentPrice: number;
  coverUrl: string;
}

interface SearchDropdownProps {
  query: string;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export function SearchDropdown({
  query,
  isOpen,
  onClose,
  className,
}: SearchDropdownProps) {
  const router = useRouter();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    const timeoutId = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();

        if (res.ok) {
          setResults(data.tracks.slice(0, 5)); // Show only top 5 results
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const saveRecentSearch = (searchQuery: string) => {
    const updated = [
      searchQuery,
      ...recentSearches.filter((s) => s !== searchQuery),
    ].slice(0, 5);

    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const handleResultClick = (trackId: string) => {
    saveRecentSearch(query);
    onClose();
    router.push(`/track/${trackId}`);
  };

  const handleRecentSearchClick = (searchQuery: string) => {
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    onClose();
  };

  const handleViewAll = () => {
    if (query) {
      saveRecentSearch(query);
      router.push(`/search?q=${encodeURIComponent(query)}`);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className={cn(
        "absolute top-full left-0 right-0 mt-2 bg-bg-elevated border border-border-subtle rounded-lg shadow-xl overflow-hidden z-50",
        className
      )}
    >
      {/* Loading State */}
      {isLoading && (
        <div className="p-4 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-primary-400" />
        </div>
      )}

      {/* Empty Query - Show Recent Searches */}
      {!query && !isLoading && (
        <div className="p-2">
          {recentSearches.length > 0 ? (
            <>
              <div className="px-3 py-2 text-xs font-medium text-text-tertiary">
                Buscas Recentes
              </div>
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleRecentSearchClick(search)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-bg-secondary transition-colors text-left"
                >
                  <Clock className="w-4 h-4 text-text-tertiary" />
                  <span className="text-sm text-text-primary">{search}</span>
                </button>
              ))}
            </>
          ) : (
            <div className="px-3 py-4 text-center text-sm text-text-secondary">
              Nenhuma busca recente
            </div>
          )}
        </div>
      )}

      {/* Search Results */}
      {query && !isLoading && results.length > 0 && (
        <div className="p-2">
          <div className="px-3 py-2 text-xs font-medium text-text-tertiary">
            Resultados
          </div>
          {results.map((track) => (
            <button
              key={track.id}
              onClick={() => handleResultClick(track.id)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-bg-secondary transition-colors text-left"
            >
              {/* Cover Art */}
              <div className="w-10 h-10 rounded-lg bg-bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
                {track.coverUrl ? (
                  <Image
                    src={track.coverUrl}
                    alt={track.title}
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                ) : (
                  <TrendingUp className="w-5 h-5 text-text-tertiary" />
                )}
              </div>

              {/* Track Info */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-text-primary truncate">
                  {track.title}
                </div>
                <div className="text-xs text-text-secondary truncate">
                  {track.artistName} • {track.genre}
                </div>
              </div>

              {/* Price */}
              <div className="text-sm font-medium text-primary-400">
                R$ {track.currentPrice.toFixed(2)}
              </div>
            </button>
          ))}

          {/* View All Button */}
          <button
            onClick={handleViewAll}
            className="w-full mt-2 px-3 py-2 text-sm font-medium text-primary-400 hover:bg-bg-secondary rounded-lg transition-colors"
          >
            Ver todos os resultados
          </button>
        </div>
      )}

      {/* No Results */}
      {query && !isLoading && results.length === 0 && (
        <div className="p-4 text-center">
          <Search className="w-8 h-8 text-text-tertiary mx-auto mb-2" />
          <p className="text-sm text-text-secondary">
            Nenhum resultado encontrado para "{query}"
          </p>
        </div>
      )}
    </div>
  );
}

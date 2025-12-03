"use client";

import Link from "next/link";
import { TrendingUp, TrendingDown, Sparkles } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Image from "next/image";

interface SimilarTrack {
  id: string;
  title: string;
  artist: string;
  coverArt: string;
  pricePerToken: number;
  priceChange24h: number;
  aiScore: number;
}

interface SimilarTracksProps {
  tracks: SimilarTrack[];
  currentTrackTitle?: string;
}

export function SimilarTracks({ tracks, currentTrackTitle }: SimilarTracksProps) {
  if (!tracks || tracks.length === 0) {
    return null;
  }

  return (
    <div className="bg-bg-secondary rounded-xl border border-border-primary p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-text-primary">
            Músicas Similares
          </h2>
          <p className="text-sm text-text-secondary">
            {currentTrackTitle ? `Baseado em ${currentTrackTitle}` : "Você também pode gostar"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tracks.map((track) => {
          const isPositive = track.priceChange24h > 0;
          
          return (
            <Link
              key={track.id}
              href={`/track/${track.id}`}
              className="group relative bg-bg-elevated hover:bg-bg-tertiary border border-border-subtle hover:border-primary/50 rounded-lg p-4 transition-all"
            >
              <div className="flex gap-3">
                {/* Cover */}
                <div className="w-16 h-16 rounded-lg bg-bg-tertiary overflow-hidden flex-shrink-0">
                  {track.coverArt ? (
                    <Image
                      src={track.coverArt}
                      alt={track.title}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-text-primary truncate group-hover:text-primary transition-colors">
                    {track.title}
                  </h3>
                  <p className="text-sm text-text-secondary truncate">
                    {track.artist}
                  </p>
                  
                  <div className="flex items-center gap-3 mt-2">
                    {/* Price */}
                    <div>
                      <p className="text-xs text-text-tertiary">Preço</p>
                      <p className="text-sm font-semibold text-text-primary">
                        {formatCurrency(track.pricePerToken)}
                      </p>
                    </div>
                    
                    {/* Change */}
                    <div>
                      <p className="text-xs text-text-tertiary">24h</p>
                      <div className={`flex items-center gap-1 text-sm font-semibold ${
                        isPositive ? "text-accent-green" : "text-accent-red"
                      }`}>
                        {isPositive ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {Math.abs(track.priceChange24h).toFixed(1)}%
                      </div>
                    </div>

                    {/* AI Score */}
                    <div>
                      <p className="text-xs text-text-tertiary">Score</p>
                      <p className="text-sm font-semibold text-primary">
                        {track.aiScore}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hover indicator */}
              <div className="absolute inset-0 rounded-lg ring-2 ring-primary opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </Link>
          );
        })}
      </div>

      {/* AI Badge */}
      <div className="mt-6 p-3 bg-primary/5 border border-primary/20 rounded-lg flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
        <p className="text-xs text-text-secondary">
          <span className="font-semibold text-primary">Recomendado por IA:</span>{" "}
          Músicas selecionadas com base no gênero, performance e score de viralidade.
        </p>
      </div>
    </div>
  );
}

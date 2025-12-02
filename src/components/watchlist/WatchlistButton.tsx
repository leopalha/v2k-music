"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui";
import { toast } from "sonner";

interface WatchlistButtonProps {
  trackId: string;
  initialIsInWatchlist?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  showIcon?: boolean;
  showText?: boolean;
}

export function WatchlistButton({
  trackId,
  initialIsInWatchlist = false,
  size = "md",
  variant = "ghost",
  showIcon = true,
  showText = true,
}: WatchlistButtonProps) {
  const [isInWatchlist, setIsInWatchlist] = useState(initialIsInWatchlist);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const previousState = isInWatchlist;
    setIsInWatchlist(!isInWatchlist);
    setIsLoading(true);

    try {
      if (isInWatchlist) {
        const res = await fetch(`/api/watchlist/${trackId}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          throw new Error("Failed to remove from watchlist");
        }

        toast.success("Removido da watchlist");
      } else {
        const res = await fetch("/api/watchlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ trackId }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to add to watchlist");
        }

        toast.success("Adicionado à watchlist");
      }
    } catch (error) {
      setIsInWatchlist(previousState);
      toast.error(
        error instanceof Error
          ? error.message
          : "Erro ao atualizar watchlist"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const Icon = isInWatchlist ? EyeOff : Eye;

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggle}
      disabled={isLoading}
      className="gap-2"
    >
      {showIcon && <Icon className="w-4 h-4" />}
      {showText && (isInWatchlist ? "Remover" : "Observar")}
    </Button>
  );
}

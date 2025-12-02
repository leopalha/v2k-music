"use client";

import { useState } from "react";
import { UserPlus, UserMinus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";

interface FollowButtonProps {
  userId: string;
  initialIsFollowing: boolean;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
}

export function FollowButton({
  userId,
  initialIsFollowing,
  variant = "primary",
  size = "md",
  showIcon = true,
  className,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);

  const handleFollow = async () => {
    if (isLoading) return;

    setIsLoading(true);

    // Optimistic update
    const previousState = isFollowing;
    setIsFollowing(!isFollowing);

    try {
      const method = isFollowing ? "DELETE" : "POST";
      const res = await fetch(`/api/users/${userId}/follow`, {
        method,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao atualizar");
      }

      toast.success(
        isFollowing ? "Deixou de seguir" : "Seguindo com sucesso!"
      );
    } catch (error) {
      // Revert on error
      setIsFollowing(previousState);
      toast.error(error instanceof Error ? error.message : "Erro ao atualizar");
    } finally {
      setIsLoading(false);
    }
  };

  const buttonVariant = isFollowing ? "outline" : variant;

  return (
    <Button
      onClick={handleFollow}
      disabled={isLoading}
      variant={buttonVariant}
      size={size}
      className={cn("min-w-[120px]", className)}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          {isFollowing ? "Deixando..." : "Seguindo..."}
        </>
      ) : (
        <>
          {showIcon &&
            (isFollowing ? (
              <UserMinus className="w-4 h-4 mr-2" />
            ) : (
              <UserPlus className="w-4 h-4 mr-2" />
            ))}
          {isFollowing ? "Seguindo" : "Seguir"}
        </>
      )}
    </Button>
  );
}

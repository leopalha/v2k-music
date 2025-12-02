"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, UserX } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui";
import { UserCard } from "@/components/social/UserCard";
import { toast } from "sonner";

interface Follower {
  id: string;
  name: string | null;
  username: string | null;
  profileImageUrl: string | null;
  bio: string | null;
  isFollowing: boolean;
  followedAt: string;
}

export default function FollowersPage() {
  const params = useParams();
  const userId = params?.id as string;
  const { data: session } = useSession();

  const [followers, setFollowers] = useState<Follower[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const limit = 20;

  useEffect(() => {
    loadFollowers(0);
  }, [userId]);

  const loadFollowers = async (currentOffset: number) => {
    try {
      const isInitial = currentOffset === 0;
      if (isInitial) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const res = await fetch(
        `/api/users/${userId}/followers?limit=${limit}&offset=${currentOffset}`
      );

      if (!res.ok) {
        throw new Error("Erro ao carregar seguidores");
      }

      const data = await res.json();

      if (isInitial) {
        setFollowers(data.followers);
      } else {
        setFollowers((prev) => [...prev, ...data.followers]);
      }

      setHasMore(data.hasMore);
      setOffset(currentOffset + limit);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao carregar seguidores"
      );
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      loadFollowers(offset);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-primary">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href={`/profile/${userId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-text-primary">Seguidores</h1>
          </div>

          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="bg-bg-elevated rounded-lg p-4 animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-bg-secondary" />
                  <div className="flex-1">
                    <div className="h-4 bg-bg-secondary rounded w-32 mb-2" />
                    <div className="h-3 bg-bg-secondary rounded w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href={`/profile/${userId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Seguidores</h1>
            <p className="text-sm text-text-secondary">
              {followers.length === 0
                ? "Nenhum seguidor ainda"
                : `${followers.length} ${followers.length === 1 ? "seguidor" : "seguidores"}`}
            </p>
          </div>
        </div>

        {/* Followers List */}
        {followers.length === 0 ? (
          <div className="bg-bg-elevated rounded-lg p-12 text-center">
            <UserX className="w-16 h-16 mx-auto mb-4 text-text-tertiary" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Nenhum seguidor ainda
            </h3>
            <p className="text-text-secondary">
              Quando alguém seguir este perfil, aparecerá aqui.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {followers.map((follower) => (
              <UserCard
                key={follower.id}
                user={follower}
                currentUserId={session?.user?.id}
                showFollowButton={true}
              />
            ))}

            {/* Load More */}
            {hasMore && (
              <div className="pt-4 text-center">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? "Carregando..." : "Carregar mais"}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

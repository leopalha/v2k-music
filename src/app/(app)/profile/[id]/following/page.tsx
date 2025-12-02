"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, UserX } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui";
import { UserCard } from "@/components/social/UserCard";
import { toast } from "sonner";

interface Following {
  id: string;
  name: string | null;
  username: string | null;
  profileImageUrl: string | null;
  bio: string | null;
  isFollowing: boolean;
  followedAt: string;
}

export default function FollowingPage() {
  const params = useParams();
  const userId = params?.id as string;
  const { data: session } = useSession();

  const [following, setFollowing] = useState<Following[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const limit = 20;

  useEffect(() => {
    loadFollowing(0);
  }, [userId]);

  const loadFollowing = async (currentOffset: number) => {
    try {
      const isInitial = currentOffset === 0;
      if (isInitial) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const res = await fetch(
        `/api/users/${userId}/following?limit=${limit}&offset=${currentOffset}`
      );

      if (!res.ok) {
        throw new Error("Erro ao carregar seguindo");
      }

      const data = await res.json();

      if (isInitial) {
        setFollowing(data.following);
      } else {
        setFollowing((prev) => [...prev, ...data.following]);
      }

      setHasMore(data.hasMore);
      setOffset(currentOffset + limit);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao carregar seguindo"
      );
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      loadFollowing(offset);
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
            <h1 className="text-2xl font-bold text-text-primary">Seguindo</h1>
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
            <h1 className="text-2xl font-bold text-text-primary">Seguindo</h1>
            <p className="text-sm text-text-secondary">
              {following.length === 0
                ? "Não está seguindo ninguém ainda"
                : `${following.length} ${following.length === 1 ? "pessoa" : "pessoas"}`}
            </p>
          </div>
        </div>

        {/* Following List */}
        {following.length === 0 ? (
          <div className="bg-bg-elevated rounded-lg p-12 text-center">
            <UserX className="w-16 h-16 mx-auto mb-4 text-text-tertiary" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Não está seguindo ninguém ainda
            </h3>
            <p className="text-text-secondary">
              Quando este perfil seguir alguém, aparecerá aqui.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {following.map((user) => (
              <UserCard
                key={user.id}
                user={user}
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

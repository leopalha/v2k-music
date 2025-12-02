"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Users, Calendar, MapPin, Link as LinkIcon, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui";
import { FollowButton } from "@/components/social/FollowButton";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  name: string | null;
  username: string | null;
  bio: string | null;
  profileImageUrl: string | null;
  createdAt: string;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
}

export default function UserProfilePage() {
  const params = useParams();
  const userId = params?.id as string;
  const { data: session } = useSession();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, [userId]);

  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/users/${userId}/profile`);

      if (!res.ok) {
        throw new Error("Erro ao carregar perfil");
      }

      const data = await res.json();
      setUser(data.user);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao carregar perfil"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-primary">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-bg-primary">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-text-secondary">Usuário não encontrado</p>
            <Link href="/" className="mt-4 inline-block">
              <Button variant="outline">Voltar para início</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const displayName = user.name || user.username || "Usuário";
  const isOwnProfile = session?.user?.id === user.id;
  const memberSince = new Date(user.createdAt).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
        </div>

        {/* Profile Header */}
        <div className="bg-bg-elevated rounded-xl p-8 border border-border-default mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-bg-secondary">
                {user.profileImageUrl ? (
                  <Image
                    src={user.profileImageUrl}
                    alt={displayName}
                    width={128}
                    height={128}
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-400 to-secondary-400 text-white text-4xl font-bold">
                    {displayName[0].toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-text-primary mb-1">
                    {displayName}
                  </h1>
                  {user.username && (
                    <p className="text-lg text-text-tertiary mb-2">
                      @{user.username}
                    </p>
                  )}
                </div>

                {/* Follow Button or Edit Profile */}
                {isOwnProfile ? (
                  <Link href="/profile">
                    <Button variant="outline">Editar Perfil</Button>
                  </Link>
                ) : (
                  session?.user?.id && (
                    <FollowButton
                      userId={user.id}
                      initialIsFollowing={user.isFollowing}
                      variant="primary"
                      size="md"
                      showIcon={true}
                    />
                  )
                )}
              </div>

              {/* Bio */}
              {user.bio && (
                <p className="text-text-secondary mb-4">{user.bio}</p>
              )}

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <Link
                  href={`/profile/${user.id}/followers`}
                  className="flex items-center gap-2 hover:text-primary-400 transition-colors"
                >
                  <Users className="w-4 h-4 text-text-tertiary" />
                  <span className="font-semibold text-text-primary">
                    {user.followersCount}
                  </span>
                  <span className="text-text-secondary">
                    {user.followersCount === 1 ? "seguidor" : "seguidores"}
                  </span>
                </Link>

                <Link
                  href={`/profile/${user.id}/following`}
                  className="flex items-center gap-2 hover:text-primary-400 transition-colors"
                >
                  <Users className="w-4 h-4 text-text-tertiary" />
                  <span className="font-semibold text-text-primary">
                    {user.followingCount}
                  </span>
                  <span className="text-text-secondary">seguindo</span>
                </Link>

                <div className="flex items-center gap-2 text-text-secondary">
                  <Calendar className="w-4 h-4 text-text-tertiary" />
                  <span>Membro desde {memberSince}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="bg-bg-elevated rounded-xl p-6 border border-border-default">
          <h2 className="text-xl font-bold text-text-primary mb-4">
            Atividade Recente
          </h2>
          <div className="text-center py-12">
            <p className="text-text-tertiary">
              Nenhuma atividade recente para exibir
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

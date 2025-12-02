"use client";

import Image from "next/image";
import Link from "next/link";
import { Trophy, TrendingUp, Coins, Users } from "lucide-react";

interface LeaderboardCardProps {
  rank: number;
  userId: string;
  name: string;
  username?: string | null;
  profileImageUrl?: string | null;
  level: number;
  categoryValue: number;
  category: string;
  stats?: {
    totalPoints?: number;
    totalInvested?: number;
    totalProfit?: number;
    portfolioValue?: number;
    totalRoyalties?: number;
    followersCount?: number;
    achievementsUnlocked?: number;
  };
  isCurrentUser?: boolean;
}

export function LeaderboardCard({
  rank,
  userId,
  name,
  username,
  profileImageUrl,
  level,
  categoryValue,
  category,
  stats,
  isCurrentUser = false,
}: LeaderboardCardProps) {
  const displayName = name || username || "Usuário";

  // Get rank badge color
  const getRankColor = () => {
    if (rank === 1) return "text-yellow-500";
    if (rank === 2) return "text-gray-400";
    if (rank === 3) return "text-orange-600";
    return "text-text-tertiary";
  };

  // Get rank icon
  const getRankIcon = () => {
    if (rank <= 3) return <Trophy className={`w-5 h-5 ${getRankColor()}`} />;
    return null;
  };

  // Format category value
  const formatCategoryValue = (value: number, cat: string) => {
    if (cat === "totalPoints" || cat === "followersCount") {
      return value.toLocaleString();
    }
    return `R$ ${value.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Get category label
  const getCategoryLabel = (cat: string) => {
    const labels: Record<string, string> = {
      totalPoints: "Pontos",
      totalInvested: "Investido",
      totalProfit: "Lucro",
      portfolioValue: "Portfólio",
      totalRoyalties: "Royalties",
      followersCount: "Seguidores",
    };
    return labels[cat] || cat;
  };

  return (
    <Link href={`/profile/${userId}`}>
      <div
        className={`
          flex items-center gap-4 p-4 rounded-lg border transition-all hover:shadow-md
          ${
            isCurrentUser
              ? "bg-primary-400/5 border-primary-400/20"
              : "bg-bg-elevated border-border-default hover:border-border-hover"
          }
        `}
      >
        {/* Rank */}
        <div className="flex items-center justify-center w-12 flex-shrink-0">
          {rank <= 3 ? (
            getRankIcon()
          ) : (
            <span className={`text-2xl font-bold ${getRankColor()}`}>
              {rank}
            </span>
          )}
        </div>

        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-bg-secondary">
            {profileImageUrl ? (
              <Image
                src={profileImageUrl}
                alt={displayName}
                width={48}
                height={48}
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-400 to-secondary-400 text-white text-lg font-bold">
                {displayName[0].toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-text-primary truncate">
              {displayName}
            </h3>
            {isCurrentUser && (
              <span className="text-xs bg-primary-400/10 text-primary-400 px-2 py-0.5 rounded border border-primary-400/20">
                Você
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm text-text-secondary">
            {username && <span>@{username}</span>}
            <span className="flex items-center gap-1">
              <span className="text-primary-400">Lvl {level}</span>
            </span>
          </div>
        </div>

        {/* Category Value */}
        <div className="text-right flex-shrink-0">
          <div className="text-sm text-text-tertiary mb-1">
            {getCategoryLabel(category)}
          </div>
          <div className="text-lg font-bold text-text-primary">
            {formatCategoryValue(categoryValue, category)}
          </div>
        </div>

        {/* Quick Stats */}
        {stats && (
          <div className="hidden lg:flex items-center gap-4 ml-4 pl-4 border-l border-border-default flex-shrink-0">
            {stats.totalPoints !== undefined && category !== "totalPoints" && (
              <div className="text-center">
                <div className="text-xs text-text-tertiary mb-1">Pontos</div>
                <div className="text-sm font-semibold text-text-primary">
                  {stats.totalPoints.toLocaleString()}
                </div>
              </div>
            )}
            {stats.achievementsUnlocked !== undefined && (
              <div className="text-center">
                <div className="text-xs text-text-tertiary mb-1">Conquistas</div>
                <div className="text-sm font-semibold text-text-primary">
                  {stats.achievementsUnlocked}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

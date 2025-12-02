"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { LeaderboardCard } from "@/components/gamification/LeaderboardCard";
import { Button } from "@/components/ui";
import {
  Trophy,
  TrendingUp,
  Coins,
  BarChart3,
  DollarSign,
  Users,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { LeaderboardCategory } from "@/app/api/leaderboard/route";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  username?: string | null;
  profileImageUrl?: string | null;
  level: number;
  xp: number;
  stats: {
    totalPoints: number;
    totalInvested: number;
    totalProfit: number;
    portfolioValue: number;
    totalRoyalties: number;
    followersCount: number;
    achievementsUnlocked: number;
    winRate: number;
    totalTrades: number;
    portfolioDiversity: number;
    loginStreak: number;
  };
  categoryValue: number;
}

const categories: Array<{
  id: LeaderboardCategory;
  label: string;
  icon: any;
  color: string;
}> = [
  {
    id: "totalPoints",
    label: "Pontos Totais",
    icon: Trophy,
    color: "text-yellow-500",
  },
  {
    id: "totalInvested",
    label: "Total Investido",
    icon: Coins,
    color: "text-blue-500",
  },
  {
    id: "totalProfit",
    label: "Lucro Total",
    icon: TrendingUp,
    color: "text-green-500",
  },
  {
    id: "portfolioValue",
    label: "Valor do Portfólio",
    icon: BarChart3,
    color: "text-purple-500",
  },
  {
    id: "totalRoyalties",
    label: "Royalties Totais",
    icon: DollarSign,
    color: "text-emerald-500",
  },
  {
    id: "followersCount",
    label: "Seguidores",
    icon: Users,
    color: "text-pink-500",
  },
];

export default function LeaderboardPage() {
  const { data: session } = useSession();
  const [activeCategory, setActiveCategory] =
    useState<LeaderboardCategory>("totalPoints");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    loadLeaderboard();
  }, [activeCategory]);

  const loadLeaderboard = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(
        `/api/leaderboard?category=${activeCategory}&limit=50`
      );

      if (!res.ok) {
        throw new Error("Erro ao carregar leaderboard");
      }

      const data = await res.json();
      setLeaderboard(data.leaderboard);
      setHasMore(data.pagination.hasMore);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao carregar leaderboard"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const currentCategory = categories.find((c) => c.id === activeCategory);
  const CategoryIcon = currentCategory?.icon || Trophy;

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-8 h-8 text-primary-400" />
            <h1 className="text-4xl font-bold text-text-primary">
              Leaderboard
            </h1>
          </div>
          <p className="text-text-secondary">
            Veja os melhores investidores da plataforma
          </p>
        </div>

        {/* Category Filters */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = activeCategory === category.id;

              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg border transition-all
                    ${
                      isActive
                        ? "bg-primary-400/10 border-primary-400 text-primary-400"
                        : "bg-bg-elevated border-border-default text-text-secondary hover:border-border-hover"
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "" : category.color}`} />
                  <span className="font-medium">{category.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Current Category Info */}
        <div className="bg-bg-elevated rounded-lg border border-border-default p-4 mb-6">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-full bg-bg-secondary flex items-center justify-center ${currentCategory?.color}`}
            >
              <CategoryIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                {currentCategory?.label}
              </h2>
              <p className="text-sm text-text-secondary">
                Top 50 usuários nesta categoria
              </p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
          </div>
        )}

        {/* Leaderboard List */}
        {!isLoading && leaderboard.length > 0 && (
          <div className="space-y-3">
            {leaderboard.map((entry) => (
              <LeaderboardCard
                key={entry.userId}
                {...entry}
                category={activeCategory}
                isCurrentUser={session?.user?.id === entry.userId}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && leaderboard.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
            <p className="text-text-secondary">
              Nenhum usuário encontrado nesta categoria
            </p>
          </div>
        )}

        {/* Load More */}
        {!isLoading && hasMore && (
          <div className="mt-6 text-center">
            <Button variant="outline" onClick={loadLeaderboard}>
              Carregar Mais
            </Button>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-8 p-4 bg-bg-elevated rounded-lg border border-border-default">
          <p className="text-sm text-text-secondary text-center">
            O ranking é atualizado em tempo real com base nas atividades dos
            usuários.
            <br />
            Complete conquistas e invista em músicas para subir no ranking!
          </p>
        </div>
      </div>
    </div>
  );
}

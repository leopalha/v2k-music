"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  Trophy,
  Calendar,
  Lock,
  ExternalLink
} from "lucide-react";
import { Logo } from "@/components/ui";
import { cn } from "@/lib/utils/cn";

interface SharedPortfolio {
  user: {
    name: string;
    username: string;
    profileImageUrl: string;
    bio?: string;
    memberSince: string;
  };
  stats: {
    totalTracks: number;
  };
  holdings?: Array<{
    track: {
      id: string;
      title: string;
      artistName: string;
      genre: string;
      coverUrl: string;
    };
    amount: number;
    value: number;
  }>;
  performance?: {
    totalHoldings: number;
    totalInvested: number;
    totalProfit: number;
    totalProfitPercentage: number;
    bestPerformers: Array<{
      track: {
        id: string;
        title: string;
        artistName: string;
        coverUrl: string;
      };
      profitPercentage: number;
    }>;
  };
}

export default function SharedPortfolioPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [portfolio, setPortfolio] = useState<SharedPortfolio | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPortfolio = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/portfolio/share/${slug}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Erro ao carregar portfolio");
        }

        setPortfolio(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setIsLoading(false);
      }
    };

    loadPortfolio();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-primary flex items-center justify-center">
        <div className="animate-pulse text-text-primary">Carregando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-primary flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-bg-secondary border border-border-default rounded-2xl p-8 text-center">
          <Lock className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-text-primary mb-2">{error}</h1>
          <p className="text-text-secondary mb-6">
            Verifique o link ou entre em contato com o proprietário
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-400 text-white rounded-lg hover:bg-primary-500 transition-colors"
          >
            Ir para V2K
          </Link>
        </div>
      </div>
    );
  }

  if (!portfolio) return null;

  const isPositive = portfolio.performance
    ? portfolio.performance.totalProfit >= 0
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-primary">
      {/* Header */}
      <header className="border-b border-border-subtle bg-bg-secondary/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Logo />
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 bg-primary-400 text-white rounded-lg hover:bg-primary-500 transition-colors text-sm font-medium"
          >
            Criar minha conta
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* User Info */}
        <div className="bg-bg-secondary border border-border-default rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-bg-elevated flex-shrink-0">
              {portfolio.user.profileImageUrl ? (
                <Image
                  src={portfolio.user.profileImageUrl}
                  alt={portfolio.user.name}
                  width={80}
                  height={80}
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-400 to-secondary-400 text-white text-2xl font-bold">
                  {portfolio.user.name[0]}
                </div>
              )}
            </div>

            <div className="flex-1">
              <h1 className="text-2xl font-bold text-text-primary">
                {portfolio.user.name}
              </h1>
              {portfolio.user.username && (
                <p className="text-text-tertiary">@{portfolio.user.username}</p>
              )}
              {portfolio.user.bio && (
                <p className="text-text-secondary mt-2">{portfolio.user.bio}</p>
              )}
              <div className="flex items-center gap-2 text-sm text-text-tertiary mt-3">
                <Calendar className="w-4 h-4" />
                Investidor desde{" "}
                {new Date(portfolio.user.memberSince).toLocaleDateString("pt-BR", {
                  month: "long",
                  year: "numeric",
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Performance Stats */}
        {portfolio.performance && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-bg-secondary border border-border-default rounded-xl p-6">
              <div className="text-xs text-text-tertiary mb-2">
                Valor do Portfolio
              </div>
              <div className="text-3xl font-bold text-text-primary">
                R$ {portfolio.performance.totalHoldings.toFixed(2)}
              </div>
            </div>

            <div className="bg-bg-secondary border border-border-default rounded-xl p-6">
              <div className="text-xs text-text-tertiary mb-2">Total Investido</div>
              <div className="text-3xl font-bold text-text-primary">
                R$ {portfolio.performance.totalInvested.toFixed(2)}
              </div>
            </div>

            <div
              className={cn(
                "bg-bg-secondary border border-border-default rounded-xl p-6",
                isPositive ? "border-success/30" : "border-error/30"
              )}
            >
              <div className="text-xs text-text-tertiary mb-2">
                Lucro/Prejuízo Total
              </div>
              <div
                className={cn(
                  "text-3xl font-bold flex items-center gap-2",
                  isPositive ? "text-success" : "text-error"
                )}
              >
                {isPositive ? (
                  <TrendingUp className="w-6 h-6" />
                ) : (
                  <TrendingDown className="w-6 h-6" />
                )}
                R$ {Math.abs(portfolio.performance.totalProfit).toFixed(2)}
                <span className="text-lg">
                  ({isPositive ? "+" : ""}
                  {portfolio.performance.totalProfitPercentage.toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Best Performers */}
        {portfolio.performance?.bestPerformers &&
          portfolio.performance.bestPerformers.length > 0 && (
            <div className="bg-bg-secondary border border-border-default rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-accent" />
                <h2 className="text-lg font-semibold text-text-primary">
                  Melhores Performances
                </h2>
              </div>

              <div className="space-y-3">
                {portfolio.performance.bestPerformers.map((performer, index) => (
                  <div
                    key={performer.track.id}
                    className="flex items-center gap-4 p-3 bg-bg-elevated rounded-lg"
                  >
                    <div className="text-2xl font-bold text-text-tertiary w-8">
                      #{index + 1}
                    </div>

                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-bg-secondary flex-shrink-0">
                      {performer.track.coverUrl ? (
                        <Image
                          src={performer.track.coverUrl}
                          alt={performer.track.title}
                          width={48}
                          height={48}
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary-400 to-secondary-400" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-text-primary truncate">
                        {performer.track.title}
                      </h3>
                      <p className="text-sm text-text-tertiary truncate">
                        {performer.track.artistName}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-bold text-success">
                        +{performer.profitPercentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Holdings */}
        {portfolio.holdings && portfolio.holdings.length > 0 && (
          <div className="bg-bg-secondary border border-border-default rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">
              Holdings ({portfolio.stats.totalTracks} músicas)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {portfolio.holdings.map((holding) => (
                <div
                  key={holding.track.id}
                  className="bg-bg-elevated border border-border-subtle rounded-lg p-4 hover:border-border-hover transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-bg-secondary flex-shrink-0">
                      {holding.track.coverUrl ? (
                        <Image
                          src={holding.track.coverUrl}
                          alt={holding.track.title}
                          width={64}
                          height={64}
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary-400 to-secondary-400" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-text-primary truncate">
                        {holding.track.title}
                      </h3>
                      <p className="text-sm text-text-tertiary truncate">
                        {holding.track.artistName}
                      </p>
                      <div className="mt-2">
                        <div className="text-xs text-text-tertiary">
                          {holding.amount} tokens
                        </div>
                        <div className="text-sm font-medium text-text-primary">
                          R$ {holding.value.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-8 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            Invista na próxima grande música
          </h2>
          <p className="text-white/90 mb-6">
            Crie sua conta no V2K e comece a investir em músicas tokenizadas
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-400 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
          >
            Começar agora
            <ExternalLink className="w-5 h-5" />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border-subtle bg-bg-secondary/50 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-text-tertiary">
          <Logo className="mx-auto mb-4" />
          <p>© 2025 V2K - Invista na próxima grande música</p>
        </div>
      </footer>
    </div>
  );
}

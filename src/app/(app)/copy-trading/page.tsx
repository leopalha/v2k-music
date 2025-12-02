"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Copy,
  Users,
  TrendingUp,
  Award,
  Filter,
  Loader2,
} from "lucide-react";
import { CopyTraderCard } from "@/components/copy-trading/CopyTraderCard";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

interface TopTrader {
  id: string;
  name: string | null;
  username: string | null;
  profileImageUrl: string | null;
  level: number;
  stats: {
    totalProfit: number;
    winRate: number;
    totalTrades: number;
    portfolioValue: number;
    followersCount: number;
    copiersCount: number;
  };
  roi: number;
  isCopying: boolean;
}

interface MyCopyTrade {
  id: string;
  trader: {
    id: string;
    name: string | null;
    username: string | null;
    profileImageUrl: string | null;
    stats: any;
  };
  settings: {
    isActive: boolean;
    allocationPercent: number;
    maxPerTrade: number | null;
    copyBuys: boolean;
    copySells: boolean;
  };
  performance: {
    totalCopied: number;
    totalInvested: number;
    totalProfit: number;
    roi: number;
  };
  startedAt: string;
}

export default function CopyTradingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"discover" | "my-copies">("discover");
  const [topTraders, setTopTraders] = useState<TopTrader[]>([]);
  const [myCopyTrades, setMyCopyTrades] = useState<MyCopyTrade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState("profit");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchData();
    }
  }, [status, activeTab, sortBy]);

  const fetchData = async () => {
    setIsLoading(true);

    try {
      if (activeTab === "discover") {
        const response = await fetch(
          `/api/copy-trading/top-traders?sortBy=${sortBy}&limit=20`
        );
        if (response.ok) {
          const data = await response.json();
          setTopTraders(data.traders || []);
        }
      } else {
        const response = await fetch("/api/copy-trading");
        if (response.ok) {
          const data = await response.json();
          setMyCopyTrades(data.copyTrades || []);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate total stats from my copies
  const totalStats = myCopyTrades.reduce(
    (acc, ct) => ({
      totalInvested: acc.totalInvested + ct.performance.totalInvested,
      totalProfit: acc.totalProfit + ct.performance.totalProfit,
      totalCopied: acc.totalCopied + ct.performance.totalCopied,
    }),
    { totalInvested: 0, totalProfit: 0, totalCopied: 0 }
  );

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
          <Copy className="w-8 h-8 text-primary" />
          Copy Trading
        </h1>
        <p className="text-text-tertiary mt-2">
          Copie automaticamente os trades dos melhores investidores
        </p>
      </div>

      {/* Stats Cards */}
      {myCopyTrades.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-bg-secondary rounded-xl p-4 border border-border-default">
            <div className="text-sm text-text-tertiary mb-1">Traders Copiados</div>
            <div className="text-2xl font-bold text-text-primary">
              {myCopyTrades.filter((ct) => ct.settings.isActive).length}
            </div>
          </div>
          <div className="bg-bg-secondary rounded-xl p-4 border border-border-default">
            <div className="text-sm text-text-tertiary mb-1">Total Investido</div>
            <div className="text-2xl font-bold text-text-primary">
              {formatCurrency(totalStats.totalInvested)}
            </div>
          </div>
          <div className="bg-bg-secondary rounded-xl p-4 border border-border-default">
            <div className="text-sm text-text-tertiary mb-1">Lucro/Prejuízo</div>
            <div
              className={`text-2xl font-bold ${
                totalStats.totalProfit >= 0 ? "text-success" : "text-error"
              }`}
            >
              {formatCurrency(totalStats.totalProfit)}
            </div>
          </div>
          <div className="bg-bg-secondary rounded-xl p-4 border border-border-default">
            <div className="text-sm text-text-tertiary mb-1">Trades Copiados</div>
            <div className="text-2xl font-bold text-text-primary">
              {totalStats.totalCopied}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={activeTab === "discover" ? "primary" : "outline"}
          onClick={() => setActiveTab("discover")}
        >
          <Users className="w-4 h-4 mr-2" />
          Descobrir Traders
        </Button>
        <Button
          variant={activeTab === "my-copies" ? "primary" : "outline"}
          onClick={() => setActiveTab("my-copies")}
        >
          <Copy className="w-4 h-4 mr-2" />
          Meus Copies ({myCopyTrades.length})
        </Button>
      </div>

      {/* Discover Tab */}
      {activeTab === "discover" && (
        <>
          {/* Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2 text-sm text-text-tertiary">
              <Filter className="w-4 h-4" />
              Ordenar por:
            </div>
            <div className="flex gap-2">
              {[
                { value: "profit", label: "Lucro" },
                { value: "winRate", label: "Win Rate" },
                { value: "followers", label: "Seguidores" },
                { value: "trades", label: "Trades" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    sortBy === option.value
                      ? "bg-primary text-white"
                      : "bg-bg-elevated text-text-secondary hover:bg-bg-secondary"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Traders Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : topTraders.length === 0 ? (
            <div className="text-center py-20">
              <Award className="w-16 h-16 mx-auto text-text-tertiary mb-4" />
              <h3 className="text-lg font-medium text-text-secondary">
                Nenhum trader disponível
              </h3>
              <p className="text-text-tertiary mt-2">
                Os melhores traders aparecerão aqui quando houver mais atividade
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topTraders.map((trader) => (
                <CopyTraderCard
                  key={trader.id}
                  trader={trader}
                  onCopyStart={() => fetchData()}
                  onCopyStop={() => fetchData()}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* My Copies Tab */}
      {activeTab === "my-copies" && (
        <>
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : myCopyTrades.length === 0 ? (
            <div className="text-center py-20">
              <Copy className="w-16 h-16 mx-auto text-text-tertiary mb-4" />
              <h3 className="text-lg font-medium text-text-secondary">
                Você ainda não está copiando ninguém
              </h3>
              <p className="text-text-tertiary mt-2 mb-6">
                Descubra os melhores traders e comece a copiar
              </p>
              <Button onClick={() => setActiveTab("discover")}>
                <Users className="w-4 h-4 mr-2" />
                Descobrir Traders
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {myCopyTrades.map((copyTrade) => (
                <div
                  key={copyTrade.id}
                  className="bg-bg-secondary rounded-xl border border-border-default p-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-bg-elevated flex items-center justify-center text-xl font-bold text-text-tertiary">
                        {(copyTrade.trader.name || "T")[0].toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-text-primary">
                          {copyTrade.trader.name || copyTrade.trader.username}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              copyTrade.settings.isActive
                                ? "bg-success"
                                : "bg-warning"
                            }`}
                          />
                          <span className="text-sm text-text-tertiary">
                            {copyTrade.settings.isActive ? "Ativo" : "Pausado"}
                          </span>
                          <span className="text-sm text-text-tertiary">
                            • {copyTrade.settings.allocationPercent}% alocação
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-sm text-text-tertiary">
                          Trades Copiados
                        </div>
                        <div className="font-semibold text-text-primary">
                          {copyTrade.performance.totalCopied}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-text-tertiary">
                          Investido
                        </div>
                        <div className="font-semibold text-text-primary">
                          {formatCurrency(copyTrade.performance.totalInvested)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-text-tertiary">
                          Lucro/Prejuízo
                        </div>
                        <div
                          className={`font-semibold ${
                            copyTrade.performance.totalProfit >= 0
                              ? "text-success"
                              : "text-error"
                          }`}
                        >
                          {formatCurrency(copyTrade.performance.totalProfit)}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          router.push(`/copy-trading/${copyTrade.id}`)
                        }
                      >
                        Gerenciar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

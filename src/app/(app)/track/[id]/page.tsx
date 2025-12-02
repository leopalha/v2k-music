"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Play,
  Pause,
  Heart,
  Share2,
  Music,
  Users,
  TrendingUp,
  DollarSign,
  Clock,
  Calendar,
  Shield,
  AlertTriangle,
  CheckCircle,
  Minus,
  Plus,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { Button } from "@/components/ui";
import { PriceChart, RoyaltyPieChart } from "@/components/charts";
import { TrackCard } from "@/components/tracks";
import { AudioPlayer } from "@/components/audio";
import InvestmentModal from "@/components/modals/InvestmentModal";
import { LimitOrderModal } from "@/components/trading/LimitOrderModal";
import { LimitOrdersList } from "@/components/trading/LimitOrdersList";
import { CommentSection } from "@/components/social/CommentSection";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId } from "wagmi";
import { useSession } from "next-auth/react";
import { parseEther } from "viem";
import { MusicTokenABI } from "@/lib/web3/abis";
import { getContractAddresses } from "@/lib/web3/config";
import { toast } from "@/components/ui/use-toast";
import { useTrackDetails } from "@/hooks/useTracksAPI";

export default function TrackDetailPage() {
  const params = useParams();
  const router = useRouter();
  const trackId = params?.id as string;

  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: session } = useSession();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [tokenAmount, setTokenAmount] = useState(10);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isInvestModalOpen, setIsInvestModalOpen] = useState(false);
  const [isLimitOrderModalOpen, setIsLimitOrderModalOpen] = useState(false);
  const [userBalance, setUserBalance] = useState(0);
  const [userTokens, setUserTokens] = useState(0);
  const [priceHistory, setPriceHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string | null; profileImageUrl: string | null } | null>(null);

  // Contract interaction hooks
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Monitor transaction status
  useEffect(() => {
    if (isPending) {
      toast.info(
        "Confirme a transação",
        "Por favor, confirme a transação na sua carteira MetaMask"
      );
    }
  }, [isPending]);

  useEffect(() => {
    if (isConfirming) {
      toast.info(
        "Processando compra",
        "Aguarde enquanto a transação é confirmada na blockchain..."
      );
    }
  }, [isConfirming]);

  useEffect(() => {
    if (isConfirmed) {
      toast.success(
        "Compra realizada com sucesso!",
        `Você comprou ${tokenAmount} tokens. Redirecionando para seu portfolio...`
      );
      setTimeout(() => {
        router.push("/portfolio");
      }, 2000);
    }
  }, [isConfirmed, tokenAmount, router]);

  useEffect(() => {
    if (error) {
      console.error("Transaction error:", error);
      toast.error(
        "Erro ao comprar tokens",
        "Ocorreu um erro na transação. Por favor, tente novamente."
      );
    }
  }, [error]);

  // Fetch track data from API
  const { data: trackData, isLoading: isLoadingTrack, error: trackError } = useTrackDetails(trackId);

  // Fetch current user data for comments
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (session?.user?.email) {
        try {
          const res = await fetch("/api/user/me");
          if (res.ok) {
            const data = await res.json();
            setCurrentUser({
              id: data.user.id,
              name: data.user.name,
              profileImageUrl: data.user.profileImageUrl,
            });
          }
        } catch (error) {
          console.error("Error fetching current user:", error);
        }
      } else {
        setCurrentUser(null);
      }
    };

    fetchCurrentUser();
  }, [session]);

  // Fetch user balance and portfolio
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch user balance
        const balanceRes = await fetch("/api/user/balance");
        if (balanceRes.ok) {
          const balanceData = await balanceRes.json();
          setUserBalance(balanceData.balance || 0);
        }

        // Fetch user portfolio for this track
        if (trackId) {
          const portfolioRes = await fetch(`/api/portfolio?trackId=${trackId}`);
          if (portfolioRes.ok) {
            const portfolioData = await portfolioRes.json();
            const holding = portfolioData.portfolio?.find((p: any) => p.trackId === trackId);
            setUserTokens(holding?.amount || 0);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [trackId]);

  // Fetch price history for advanced chart
  useEffect(() => {
    const fetchPriceHistory = async () => {
      if (!trackId) return;

      try {
        setIsLoadingHistory(true);
        const res = await fetch(`/api/tracks/${trackId}/price-history?timeframe=1d`);
        const data = await res.json();

        if (res.ok) {
          setPriceHistory(data.data);
        }
      } catch (error) {
        console.error("Error fetching price history:", error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchPriceHistory();
  }, [trackId]);

  const track = trackData?.song;
  const similarTracks = trackData?.similarSongs || [];

  // Loading state
  if (isLoadingTrack) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Carregando música...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (trackError || !track) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <Music className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
          <h1 className="text-xl font-medium text-text-primary mb-2">
            Música não encontrada
          </h1>
          <p className="text-text-secondary mb-6">
            A música que você está procurando não existe ou foi removida.
          </p>
          <Button onClick={() => router.push("/marketplace")}>
            Voltar ao Marketplace
          </Button>
        </div>
      </div>
    );
  }

  const soldTokens = track.totalTokens - track.availableTokens;
  const soldPercentage = (soldTokens / track.totalTokens) * 100;
  const investmentTotal = tokenAmount * track.pricePerToken;
  const estimatedMonthlyReturn = tokenAmount * track.avgRoyaltyPerToken;

  const riskConfig = {
    LOW: {
      label: "Baixo",
      color: "text-success",
      bgColor: "bg-success/10",
      icon: Shield,
    },
    MEDIUM: {
      label: "Médio",
      color: "text-warning",
      bgColor: "bg-warning/10",
      icon: AlertTriangle,
    },
    HIGH: {
      label: "Alto",
      color: "text-error",
      bgColor: "bg-error/10",
      icon: AlertTriangle,
    },
  } as const;

  const risk = riskConfig[track.riskLevel as keyof typeof riskConfig];
  const RiskIcon = risk.icon;

  const handlePurchase = async () => {
    if (!isConnected || !address) {
      toast.warning(
        "Carteira não conectada",
        "Por favor, conecte sua carteira MetaMask para comprar tokens"
      );
      return;
    }

    try {
      const addresses = getContractAddresses(chainId);
      const totalCost = BigInt(tokenAmount) * parseEther(track.pricePerToken.toString());

      // Call purchaseTokens on the MusicToken contract
      writeContract({
        address: addresses.musicToken as `0x${string}`,
        abi: MusicTokenABI,
        functionName: "purchaseTokens",
        args: [BigInt(1), BigInt(tokenAmount)], // trackId = 1 (primeira track criada no contrato), amount
        value: totalCost,
      });
    } catch (error) {
      console.error("Error purchasing tokens:", error);
      toast.error(
        "Erro ao comprar tokens",
        "Ocorreu um erro ao tentar comprar tokens. Tente novamente."
      );
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-bg-primary/80 backdrop-blur-lg border-b border-border-default">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Voltar</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={cn(
                  "p-2 rounded-xl transition-colors",
                  isFavorite
                    ? "bg-error/10 text-error"
                    : "bg-bg-secondary text-text-tertiary hover:text-text-primary"
                )}
              >
                <Heart
                  className={cn("w-5 h-5", isFavorite && "fill-current")}
                />
              </button>
              <button className="p-2 rounded-xl bg-bg-secondary text-text-tertiary hover:text-text-primary transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Track Info */}
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Cover Art */}
              <div className="relative w-full sm:w-48 aspect-square rounded-2xl overflow-hidden flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-secondary-400" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Music className="w-16 h-16 text-white/50" />
                </div>
                {/* Play Button */}
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity"
                >
                  <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
                    {isPlaying ? (
                      <Pause className="w-8 h-8 text-black" />
                    ) : (
                      <Play className="w-8 h-8 text-black ml-1" />
                    )}
                  </div>
                </button>
              </div>

              {/* Track Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-medium",
                      risk.bgColor,
                      risk.color
                    )}
                  >
                    <RiskIcon className="w-3 h-3 inline mr-1" />
                    Risco {risk.label}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-bg-elevated text-text-secondary">
                    {track.genre}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-1 truncate">
                  {track.title}
                </h1>
                <p className="text-lg text-text-secondary mb-4">{track.artist}</p>

                <p className="text-sm text-text-tertiary mb-4 line-clamp-2">
                  {track.description}
                </p>

                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-1.5 text-text-secondary">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(track.releaseDate).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-text-secondary">
                    <Clock className="w-4 h-4" />
                    <span>{track.duration}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-text-secondary">
                    <span className="text-text-tertiary">ISRC:</span>
                    <span className="font-mono">{track.isrc}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Audio Player */}
            <AudioPlayer
              track={{
                id: track.id,
                title: track.title,
                artist: track.artist,
                coverArt: track.coverArt,
                previewUrl: track.previewUrl,
              }}
            />

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              <div className="bg-bg-secondary rounded-xl p-3 sm:p-4">
                <div className="flex items-center gap-1.5 sm:gap-2 text-text-tertiary mb-1 sm:mb-2">
                  <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="text-[10px] sm:text-xs">Preço/Token</span>
                </div>
                <p className="text-base sm:text-xl font-mono font-bold text-text-primary">
                  {formatCurrency(track.pricePerToken)}
                </p>
              </div>

              <div className="bg-bg-secondary rounded-xl p-3 sm:p-4">
                <div className="flex items-center gap-1.5 sm:gap-2 text-text-tertiary mb-1 sm:mb-2">
                  <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="text-[10px] sm:text-xs">ROI Atual</span>
                </div>
                <p
                  className={cn(
                    "text-base sm:text-xl font-mono font-bold",
                    track.currentROI >= 0 ? "text-success" : "text-error"
                  )}
                >
                  {track.currentROI >= 0 ? "+" : ""}
                  {(track.currentROI || 0).toFixed(1)}%
                </p>
              </div>

              <div className="bg-bg-secondary rounded-xl p-3 sm:p-4">
                <div className="flex items-center gap-1.5 sm:gap-2 text-text-tertiary mb-1 sm:mb-2">
                  <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="text-[10px] sm:text-xs">Investidores</span>
                </div>
                <p className="text-base sm:text-xl font-mono font-bold text-text-primary">
                  {track.holders || 0}
                </p>
              </div>

              <div className="bg-bg-secondary rounded-xl p-3 sm:p-4">
                <div className="flex items-center gap-1.5 sm:gap-2 text-text-tertiary mb-1 sm:mb-2">
                  <Music className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="text-[10px] sm:text-xs">Streams</span>
                </div>
                <p className="text-base sm:text-xl font-mono font-bold text-text-primary">
                  {formatNumber(track.totalStreams)}
                </p>
              </div>
            </div>

            {/* Price Chart */}
            {track.performance && track.performance.length > 0 && (
              <div className="bg-bg-secondary border border-border-default rounded-xl p-4">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Histórico de Preço</h3>
                <PriceChart data={track.performance} />
              </div>
            )}

            {/* Limit Orders Section */}
            <div className="bg-bg-secondary rounded-2xl p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <h2 className="text-base sm:text-lg font-semibold text-text-primary">
                  Minhas Ordens Limitadas
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={() => setIsLimitOrderModalOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Ordem
                </Button>
              </div>
              <LimitOrdersList trackId={trackId} />
            </div>

            {/* Royalty Breakdown */}
            <div className="bg-bg-secondary rounded-2xl p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-text-primary mb-4">
                Distribuição de Royalties
              </h2>
              <div className="flex flex-col items-center gap-6 sm:gap-8">
                <RoyaltyPieChart data={track.royaltyBreakdown} />
                <div className="flex-1 space-y-4">
                <div className="bg-bg-elevated rounded-xl p-4">
                    <p className="text-sm text-text-tertiary mb-1">
                      Total Royalties
                    </p>
                    <p className="text-2xl font-mono font-bold text-text-primary">
                      {formatCurrency(track.totalRoyalties)}
                    </p>
                  </div>
                  <div className="bg-bg-elevated rounded-xl p-4">
                    <p className="text-sm text-text-tertiary mb-1">
                      Royalty Médio por Token
                    </p>
                    <p className="text-2xl font-mono font-bold text-success">
                      {formatCurrency(track.avgRoyaltyPerToken)}/mês
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Similar Tracks */}
            {similarTracks.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h2 className="text-base sm:text-lg font-semibold text-text-primary">
                    Músicas Similares
                  </h2>
                  <Link
                    href={`/marketplace?genre=${track.genre}`}
                    className="text-xs sm:text-sm text-primary-400 hover:text-primary-500 transition-colors"
                  >
                    Ver mais
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                  {similarTracks.map((similarTrack: any) => (
                    <TrackCard
                      key={similarTrack.id}
                      track={similarTrack}
                      variant="grid"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Comment Section */}
            <div>
              <CommentSection
                trackId={trackId}
                currentUser={currentUser || undefined}
              />
            </div>
          </div>

          {/* Sidebar - Investment Calculator (hidden on mobile, shown as modal) */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Investment Card */}
              <div className="bg-bg-secondary rounded-2xl p-6 border border-border-default">
                <h2 className="text-lg font-semibold text-text-primary mb-6">
                  Investir
                </h2>

                {/* Token Progress */}
                <div className="mb-6">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-text-secondary">Tokens vendidos</span>
                    <span className="text-text-primary font-medium">
                      {soldTokens.toLocaleString()} / {track.totalTokens.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-3 bg-bg-elevated rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full transition-all"
                      style={{ width: `${soldPercentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-text-tertiary mt-1">
                    {track.availableTokens.toLocaleString()} tokens disponíveis
                  </p>
                </div>

                {/* Token Amount Selector */}
                <div className="mb-6">
                  <label className="block text-sm text-text-secondary mb-2">
                    Quantidade de Tokens
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setTokenAmount(Math.max(1, tokenAmount - 10))}
                      className="w-10 h-10 rounded-xl bg-bg-elevated flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-bg-primary transition-colors"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <input
                      type="number"
                      value={tokenAmount}
                      onChange={(e) =>
                        setTokenAmount(
                          Math.max(1, Math.min(track.availableTokens, parseInt(e.target.value) || 1))
                        )
                      }
                      className="flex-1 bg-bg-elevated border border-border-default rounded-xl px-4 py-2.5 text-center text-lg font-mono font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-400/20"
                    />
                    <button
                      onClick={() =>
                        setTokenAmount(Math.min(track.availableTokens, tokenAmount + 10))
                      }
                      className="w-10 h-10 rounded-xl bg-bg-elevated flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-bg-primary transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  {/* Quick select buttons */}
                  <div className="flex gap-2 mt-3">
                    {[10, 50, 100, 500].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setTokenAmount(Math.min(track.availableTokens, amount))}
                        className={cn(
                          "flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors",
                          tokenAmount === amount
                            ? "bg-primary-400 text-white"
                            : "bg-bg-elevated text-text-secondary hover:text-text-primary"
                        )}
                      >
                        {amount}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Investment Summary */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Preço por token</span>
                    <span className="text-text-primary font-mono">
                      {formatCurrency(track.pricePerToken)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Quantidade</span>
                    <span className="text-text-primary font-mono">
                      {tokenAmount} tokens
                    </span>
                  </div>
                  <div className="h-px bg-border-default" />
                  <div className="flex items-center justify-between">
                    <span className="text-text-primary font-medium">Total</span>
                    <span className="text-xl font-mono font-bold text-text-primary">
                      {formatCurrency(investmentTotal)}
                    </span>
                  </div>
                </div>

                {/* Estimated Returns */}
                <div className="bg-bg-elevated rounded-xl p-4 mb-6">
                  <p className="text-sm text-text-tertiary mb-2">
                    Retorno Estimado (mensal)
                  </p>
                  <p className="text-lg font-mono font-bold text-success">
                    {formatCurrency(estimatedMonthlyReturn)}
                  </p>
                  <p className="text-xs text-text-tertiary mt-1">
                    Baseado nos royalties dos últimos 30 dias
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => setIsInvestModalOpen(true)}
                  >
                    Investir Agora
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full"
                    size="lg"
                    onClick={() => setIsLimitOrderModalOpen(true)}
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Criar Ordem Limitada
                  </Button>
                </div>

                <p className="text-xs text-text-tertiary text-center mt-4">
                  Ao comprar, você concorda com os{" "}
                  <Link href="/terms" className="text-primary-400 hover:underline">
                    Termos de Uso
                  </Link>
                </p>
              </div>

              {/* Additional Info */}
              <div className="bg-bg-secondary rounded-2xl p-6 border border-border-default">
                <h3 className="text-sm font-semibold text-text-primary mb-4">
                  Informações do Contrato
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-text-tertiary">Blockchain</span>
                    <span className="text-text-primary">Polygon</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-tertiary">Token Standard</span>
                    <span className="text-text-primary">ERC-1155</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-tertiary">Total Supply</span>
                    <span className="text-text-primary font-mono">
                      {track.totalTokens.toLocaleString()}
                    </span>
                  </div>
                </div>
                <a
                  href="#"
                  className="flex items-center justify-center gap-2 mt-4 text-sm text-primary-400 hover:text-primary-500 transition-colors"
                >
                  <span>Ver no PolygonScan</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Fixed Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-bg-secondary/95 backdrop-blur-lg border-t border-border-default p-4 z-40">
        <div className="flex items-center justify-between gap-4 max-w-lg mx-auto">
          <div className="flex-1">
            <p className="text-xs text-text-tertiary">Preço por token</p>
            <p className="text-lg font-mono font-bold text-text-primary">
              {formatCurrency(track.pricePerToken)}
            </p>
          </div>
          <Button
            className="flex-1 max-w-[180px]"
            size="lg"
            onClick={() => setIsInvestModalOpen(true)}
          >
            Investir
          </Button>
        </div>
      </div>

      {/* Add padding at bottom for mobile fixed bar */}
      <div className="h-24 lg:hidden" />

      {/* Investment Modal */}
      {trackData && (
        <InvestmentModal
          isOpen={isInvestModalOpen}
          onClose={() => setIsInvestModalOpen(false)}
          track={{
            id: trackId,
            title: trackData.title,
            artistName: trackData.artistName,
            coverUrl: trackData.coverUrl || '',
            currentPrice: trackData.currentPrice,
            availableSupply: trackData.availableSupply,
          }}
        />
      )}

      {/* Limit Order Modal */}
      {track && (
        <LimitOrderModal
          isOpen={isLimitOrderModalOpen}
          onClose={() => setIsLimitOrderModalOpen(false)}
          trackId={trackId}
          trackTitle={track.title}
          currentPrice={track.pricePerToken}
          userBalance={userBalance}
          userTokens={userTokens}
          onOrderCreated={() => {
            // Refresh limit orders list (the LimitOrdersList component will handle this)
          }}
        />
      )}
    </div>
  );
}

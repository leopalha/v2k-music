import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Get all portfolio holdings
    const portfolio = await prisma.portfolio.findMany({
      where: { userId: user.id },
      include: {
        track: {
          select: {
            id: true,
            title: true,
            artistName: true,
            genre: true,
            coverUrl: true,
            currentPrice: true,
            initialPrice: true,
            priceChange24h: true,
          },
        },
      },
    });

    // Get all transactions for historical performance
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        type: { in: ["BUY", "SELL", "ROYALTY_CLAIM"] },
        status: "COMPLETED",
      },
      orderBy: { createdAt: "asc" },
      include: {
        track: {
          select: {
            title: true,
            currentPrice: true,
          },
        },
      },
    });

    // Calculate overall metrics
    const totalInvested = portfolio.reduce((sum, item) => sum + item.totalInvested, 0);
    const currentValue = portfolio.reduce(
      (sum, item) => sum + item.amount * item.track.currentPrice,
      0
    );
    const totalProfitLoss = currentValue - totalInvested;
    const totalProfitLossPercentage =
      totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;

    // Calculate total royalties earned
    const totalRoyalties = portfolio.reduce(
      (sum, item) => sum + item.totalRoyaltiesEarned,
      0
    );

    // Get best and worst performers
    const performers = portfolio
      .map((item) => {
        const currentVal = item.amount * item.track.currentPrice;
        const profit = currentVal - item.totalInvested;
        const profitPercentage =
          item.totalInvested > 0 ? (profit / item.totalInvested) * 100 : 0;

        return {
          trackId: item.track.id,
          title: item.track.title,
          artistName: item.track.artistName,
          coverUrl: item.track.coverUrl,
          amount: item.amount,
          invested: item.totalInvested,
          currentValue: currentVal,
          profit,
          profitPercentage,
          priceChange24h: item.track.priceChange24h,
        };
      })
      .sort((a, b) => b.profitPercentage - a.profitPercentage);

    const bestPerformers = performers.slice(0, 5);
    const worstPerformers = performers.slice(-5).reverse();

    // Asset allocation by genre
    const allocationByGenre: { [key: string]: number } = {};
    portfolio.forEach((item) => {
      const value = item.amount * item.track.currentPrice;
      const genre = item.track.genre;
      allocationByGenre[genre] = (allocationByGenre[genre] || 0) + value;
    });

    const assetAllocation = Object.entries(allocationByGenre).map(([genre, value]) => ({
      genre,
      value,
      percentage: currentValue > 0 ? (value / currentValue) * 100 : 0,
    }));

    // Calculate portfolio performance over time (last 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Group transactions by day
    const performanceByDay: { [key: string]: number } = {};
    let cumulativeValue = 0;

    // Get transactions from last 30 days
    const recentTransactions = transactions.filter(
      (tx) => new Date(tx.createdAt) >= thirtyDaysAgo
    );

    // Sort by date
    recentTransactions.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    // Calculate cumulative portfolio value day by day
    const performanceData: Array<{
      date: string;
      portfolioValue: number;
      invested: number;
      profitLoss: number;
    }> = [];

    let runningInvested = 0;
    let runningPortfolioValue = 0;

    // Create daily snapshots for last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split("T")[0];

      // Get transactions up to this date
      const txUpToDate = transactions.filter(
        (tx) => new Date(tx.createdAt) <= date
      );

      // Calculate invested and portfolio value at this point
      let invested = 0;
      const holdings: { [trackId: string]: { amount: number; invested: number } } = {};

      txUpToDate.forEach((tx) => {
        if (!holdings[tx.trackId]) {
          holdings[tx.trackId] = { amount: 0, invested: 0 };
        }

        if (tx.type === "BUY") {
          holdings[tx.trackId].amount += tx.amount;
          holdings[tx.trackId].invested += tx.totalValue;
          invested += tx.totalValue;
        } else if (tx.type === "SELL") {
          const sellRatio = tx.amount / holdings[tx.trackId].amount;
          const investedSold = holdings[tx.trackId].invested * sellRatio;
          holdings[tx.trackId].amount -= tx.amount;
          holdings[tx.trackId].invested -= investedSold;
          invested -= investedSold;
        }
      });

      // Calculate current value of holdings at this date
      // (using current prices as approximation - ideally would use historical prices)
      let portfolioValue = 0;
      Object.entries(holdings).forEach(([trackId, holding]) => {
        const track = portfolio.find((p) => p.trackId === trackId);
        if (track && holding.amount > 0) {
          portfolioValue += holding.amount * track.track.currentPrice;
        }
      });

      performanceData.push({
        date: dateStr,
        portfolioValue,
        invested,
        profitLoss: portfolioValue - invested,
      });
    }

    // Diversification score (0-100)
    // Based on number of unique tracks and genre distribution
    const uniqueTracks = portfolio.length;
    const uniqueGenres = Object.keys(allocationByGenre).length;

    // Calculate Herfindahl index for concentration
    const totalValue = assetAllocation.reduce((sum, a) => sum + a.value, 0);
    const herfindahlIndex = assetAllocation.reduce((sum, a) => {
      const share = a.value / totalValue;
      return sum + share * share;
    }, 0);

    // Diversification score: lower HHI = better diversification
    // Perfect diversification (equal weights) would be 1/n
    const perfectDiversification = uniqueGenres > 0 ? 1 / uniqueGenres : 0;
    const diversificationScore = Math.max(
      0,
      Math.min(100, (1 - (herfindahlIndex - perfectDiversification)) * 100)
    );

    // Risk score (0-100) - based on portfolio volatility
    // Higher concentration in few assets = higher risk
    const riskScore = Math.min(100, herfindahlIndex * 100 * uniqueGenres);

    // Calculate average ROI
    const avgROI =
      portfolio.length > 0
        ? portfolio.reduce((sum, item) => {
            const roi =
              item.totalInvested > 0
                ? ((item.amount * item.track.currentPrice - item.totalInvested) /
                    item.totalInvested) *
                  100
                : 0;
            return sum + roi;
          }, 0) / portfolio.length
        : 0;

    return NextResponse.json({
      overview: {
        totalInvested,
        currentValue,
        totalProfitLoss,
        totalProfitLossPercentage,
        totalRoyalties,
        totalAssets: portfolio.length,
        diversificationScore: Math.round(diversificationScore),
        riskScore: Math.round(riskScore),
        avgROI,
      },
      bestPerformers,
      worstPerformers,
      assetAllocation,
      performanceData,
    });
  } catch (error) {
    console.error("Error fetching portfolio analytics:", error);
    return NextResponse.json(
      { error: "Erro ao buscar analytics" },
      { status: 500 }
    );
  }
}

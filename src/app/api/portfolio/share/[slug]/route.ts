import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Find user by share slug
    const user = await prisma.user.findUnique({
      where: { shareSlug: slug },
      select: {
        id: true,
        name: true,
        username: true,
        profileImageUrl: true,
        bio: true,
        portfolioPublic: true,
        showHoldings: true,
        showPerformance: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Portfolio não encontrado" }, { status: 404 });
    }

    if (!user.portfolioPublic) {
      return NextResponse.json(
        { error: "Este portfolio é privado" },
        { status: 403 }
      );
    }

    // Get portfolio data
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
          },
        },
      },
    });

    // Calculate stats
    const totalHoldings = portfolio.reduce(
      (sum, item) => sum + item.amount * item.track.currentPrice,
      0
    );

    const totalInvested = portfolio.reduce(
      (sum, item) => sum + item.totalInvested,
      0
    );

    const totalProfit = totalHoldings - totalInvested;
    const totalProfitPercentage =
      totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

    // Top holdings
    const topHoldings = portfolio
      .map((item) => ({
        track: item.track,
        amount: item.amount,
        value: item.amount * item.track.currentPrice,
        profit: item.amount * item.track.currentPrice - item.totalInvested,
        profitPercentage:
          item.totalInvested > 0
            ? ((item.amount * item.track.currentPrice - item.totalInvested) /
                item.totalInvested) *
              100
            : 0,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    // Best performers
    const bestPerformers = [...portfolio]
      .map((item) => ({
        track: item.track,
        profitPercentage:
          item.totalInvested > 0
            ? ((item.amount * item.track.currentPrice - item.totalInvested) /
                item.totalInvested) *
              100
            : 0,
      }))
      .filter((item) => item.profitPercentage > 0)
      .sort((a, b) => b.profitPercentage - a.profitPercentage)
      .slice(0, 5);

    // Response based on privacy settings
    const response: any = {
      user: {
        name: user.name,
        username: user.username,
        profileImageUrl: user.profileImageUrl,
        bio: user.bio,
        memberSince: user.createdAt,
      },
      stats: {
        totalTracks: portfolio.length,
      },
    };

    if (user.showHoldings) {
      response.holdings = topHoldings.map((h) => ({
        track: h.track,
        amount: h.amount,
        value: h.value,
      }));
    }

    if (user.showPerformance) {
      response.performance = {
        totalHoldings,
        totalInvested,
        totalProfit,
        totalProfitPercentage,
        bestPerformers: bestPerformers.map((p) => ({
          track: p.track,
          profitPercentage: p.profitPercentage,
        })),
      };
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching shared portfolio:", error);
    return NextResponse.json(
      { error: "Erro ao carregar portfolio" },
      { status: 500 }
    );
  }
}

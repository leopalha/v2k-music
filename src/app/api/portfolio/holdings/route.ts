import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get all portfolio holdings with track details
    const portfolios = await prisma.portfolio.findMany({
      where: {
        userId,
        amount: {
          gt: 0, // Only active holdings
        },
      },
      include: {
        track: {
          select: {
            id: true,
            title: true,
            artistName: true,
            coverUrl: true,
            currentPrice: true,
            totalSupply: true,
            genre: true,
            status: true,
          },
        },
      },
      orderBy: {
        currentValue: 'desc',
      },
    });

    // Transform to frontend format
    const holdings = portfolios.map(portfolio => ({
      trackId: portfolio.trackId,
      title: portfolio.track.title,
      artist: portfolio.track.artistName,
      coverUrl: portfolio.track.coverUrl || '',
      tokensOwned: portfolio.amount,
      totalSupply: portfolio.track.totalSupply,
      currentPrice: portfolio.track.currentPrice,
      purchasePrice: portfolio.avgBuyPrice,
      totalValue: portfolio.currentValue,
      totalInvested: portfolio.totalInvested,
      unrealizedPnL: portfolio.unrealizedPnL,
      monthlyEarnings: 0, // TODO: Calculate from last 30 days royalties
      priceChange24h: ((portfolio.track.currentPrice - portfolio.avgBuyPrice) / portfolio.avgBuyPrice) * 100,
      totalRoyaltiesEarned: portfolio.totalRoyaltiesEarned,
      unclaimedRoyalties: portfolio.unclaimedRoyalties,
      genre: portfolio.track.genre,
      status: portfolio.track.status,
    }));

    // Calculate summary stats
    const totalValue = portfolios.reduce((sum, p) => sum + p.currentValue, 0);
    const totalInvested = portfolios.reduce((sum, p) => sum + p.totalInvested, 0);
    const totalEarnings = totalValue - totalInvested;
    const totalRoyalties = portfolios.reduce((sum, p) => sum + p.totalRoyaltiesEarned, 0);
    const totalUnclaimedRoyalties = portfolios.reduce((sum, p) => sum + p.unclaimedRoyalties, 0);
    const roi = totalInvested > 0 ? (totalEarnings / totalInvested) * 100 : 0;

    return NextResponse.json({
      holdings,
      summary: {
        totalValue,
        totalInvested,
        totalEarnings,
        totalRoyalties,
        totalUnclaimedRoyalties,
        roi,
        totalTracks: portfolios.length,
      },
    });
  } catch (error) {
    console.error('[PORTFOLIO_HOLDINGS_ERROR]', error);
    return NextResponse.json(
      { error: 'Erro ao buscar portfolio' },
      { status: 500 }
    );
  }
}

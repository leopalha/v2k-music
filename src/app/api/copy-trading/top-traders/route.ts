import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db/prisma';

/**
 * GET /api/copy-trading/top-traders
 * List top traders available for copy trading
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);

    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'profit'; // profit, winRate, followers, roi

    let currentUserId: string | null = null;

    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });
      currentUserId = user?.id || null;
    }

    // Build order by based on sortBy
    let orderBy: any = { totalProfit: 'desc' };
    switch (sortBy) {
      case 'profit':
        orderBy = { totalProfit: 'desc' };
        break;
      case 'winRate':
        orderBy = { winRate: 'desc' };
        break;
      case 'followers':
        orderBy = { followersCount: 'desc' };
        break;
      case 'trades':
        orderBy = { totalTrades: 'desc' };
        break;
    }

    // Get top traders with public portfolios and good stats
    const topTraders = await prisma.userStats.findMany({
      where: {
        user: {
          portfolioPublic: true,
        },
        totalTrades: { gte: 5 }, // Minimum 5 trades
        totalProfit: { gte: 0 }, // Profitable
      },
      orderBy,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            profileImageUrl: true,
            level: true,
            _count: {
              select: {
                copiedBy: {
                  where: { isActive: true },
                },
              },
            },
          },
        },
      },
    });

    // Get list of traders current user is already copying
    let copiedTraderIds: string[] = [];
    if (currentUserId) {
      const existingCopyTrades = await prisma.copyTrade.findMany({
        where: {
          copierId: currentUserId,
          isActive: true,
        },
        select: { traderId: true },
      });
      copiedTraderIds = existingCopyTrades.map((ct) => ct.traderId);
    }

    // Format response
    const formattedTraders = topTraders
      .filter((stats) => stats.user.id !== currentUserId) // Exclude self
      .map((stats) => ({
        id: stats.user.id,
        name: stats.user.name,
        username: stats.user.username,
        profileImageUrl: stats.user.profileImageUrl,
        level: stats.user.level,
        stats: {
          totalProfit: stats.totalProfit,
          winRate: stats.winRate,
          totalTrades: stats.totalTrades,
          portfolioValue: stats.portfolioValue,
          followersCount: stats.followersCount,
          copiersCount: stats.user._count.copiedBy,
        },
        roi: stats.totalInvested > 0
          ? (stats.totalProfit / stats.totalInvested) * 100
          : 0,
        isCopying: copiedTraderIds.includes(stats.user.id),
      }));

    return NextResponse.json({
      traders: formattedTraders,
      total: formattedTraders.length,
    });
  } catch (error) {
    console.error('Error fetching top traders:', error);
    return NextResponse.json(
      {
        error: 'Erro ao buscar traders',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

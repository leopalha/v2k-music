import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

/**
 * GET /api/share/[slug]
 * Get public portfolio data by share slug
 */
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
        level: true,
        xp: true,
        badges: true,
        portfolioPublic: true,
        showHoldings: true,
        showPerformance: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Portfolio não encontrado' },
        { status: 404 }
      );
    }

    // Check if portfolio is public
    if (!user.portfolioPublic) {
      return NextResponse.json(
        { error: 'Este portfolio é privado' },
        { status: 403 }
      );
    }

    // Get portfolio data if user allows it
    let holdings = null;
    let performanceData = null;

    if (user.showHoldings) {
      const portfolio = await prisma.portfolio.findMany({
        where: { userId: user.id },
        include: {
          track: {
            select: {
              id: true,
              title: true,
              artistName: true,
              coverUrl: true,
              currentPrice: true,
              genre: true,
            },
          },
        },
      });

      holdings = portfolio.map(p => ({
        trackId: p.trackId,
        trackTitle: p.track.title,
        trackArtist: p.track.artistName,
        trackCover: p.track.coverUrl,
        trackGenre: p.track.genre,
        sharesOwned: p.amount,
        currentPrice: p.track.currentPrice,
        currentValue: p.currentValue,
        profitLoss: p.unrealizedPnL,
        royaltiesEarned: p.totalRoyaltiesEarned,
      }));
    }

    if (user.showPerformance) {
      const portfolio = await prisma.portfolio.findMany({
        where: { userId: user.id },
        select: {
          totalInvested: true,
          currentValue: true,
          unrealizedPnL: true,
          totalRoyaltiesEarned: true,
        },
      });

      const totalInvested = portfolio.reduce((sum, p) => sum + p.totalInvested, 0);
      const currentValue = portfolio.reduce((sum, p) => sum + p.currentValue, 0);
      const totalPnL = portfolio.reduce((sum, p) => sum + p.unrealizedPnL, 0);
      const totalRoyalties = portfolio.reduce((sum, p) => sum + p.totalRoyaltiesEarned, 0);
      const roi = totalInvested > 0 ? ((totalPnL / totalInvested) * 100) : 0;

      performanceData = {
        totalInvested,
        currentValue,
        totalPnL,
        totalRoyalties,
        roi,
        tracksOwned: portfolio.length,
      };
    }

    // Get user stats (optional - may not exist)
    const userStats = await prisma.userStats.findUnique({
      where: { userId: user.id },
    });

    // Get followers/following count
    const followersCount = await prisma.follow.count({ where: { followingId: user.id } });
    const followingCount = await prisma.follow.count({ where: { followerId: user.id } });

    return NextResponse.json({
      user: {
        name: user.name,
        username: user.username,
        profileImage: user.profileImageUrl,
        bio: user.bio,
        level: user.level,
        xp: user.xp,
        badges: user.badges,
        memberSince: user.createdAt,
        followersCount,
        followingCount,
      },
      holdings: user.showHoldings ? holdings : null,
      performance: user.showPerformance ? performanceData : null,
      stats: userStats,
    });
  } catch (error) {
    console.error('Get public portfolio error:', error);
    return NextResponse.json(
      {
        error: 'Erro ao buscar portfolio público',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

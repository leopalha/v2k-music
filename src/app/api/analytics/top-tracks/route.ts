import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db/prisma';
import { calculateTrackPerformance } from '@/lib/analytics/calculations';

/**
 * GET /api/analytics/top-tracks?sortBy=roi&limit=10
 * Returns top performing tracks in user's portfolio
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get('sortBy') || 'roi';
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    // Get portfolio holdings
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
            totalSupply: true,
            availableSupply: true,
          },
        },
      },
    });

    if (portfolio.length === 0) {
      return NextResponse.json({ tracks: [] });
    }

    // Calculate track performances
    const trackPerformances = portfolio.map(p => {
      const performance = calculateTrackPerformance(
        p.trackId,
        p.totalInvested,
        p.currentValue,
        p.totalRoyaltiesEarned
      );

      return {
        trackId: p.trackId,
        title: p.track.title,
        artist: p.track.artistName,
        imageUrl: p.track.coverUrl,
        sharesOwned: p.amount,
        totalInvested: p.totalInvested,
        currentValue: p.currentValue,
        profitLoss: performance.profitLoss,
        roi: performance.roi,
        royaltiesEarned: p.totalRoyaltiesEarned,
        performance: performance.performance,
        currentPrice: p.track.currentPrice,
        totalShares: p.track.totalSupply,
        availableShares: p.track.availableSupply,
      };
    });

    // Sort by requested field
    let sorted = [...trackPerformances];

    switch (sortBy) {
      case 'roi':
        sorted.sort((a, b) => b.roi - a.roi);
        break;
      case 'profitLoss':
        sorted.sort((a, b) => b.profitLoss - a.profitLoss);
        break;
      case 'volume':
        sorted.sort((a, b) => b.currentValue - a.currentValue);
        break;
      case 'royalties':
        sorted.sort((a, b) => b.royaltiesEarned - a.royaltiesEarned);
        break;
      default:
        sorted.sort((a, b) => b.roi - a.roi);
    }

    // Limit results
    const topTracks = sorted.slice(0, limit);

    return NextResponse.json({
      tracks: topTracks,
      total: portfolio.length,
    });
  } catch (error) {
    console.error('Analytics top tracks error:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar top tracks', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

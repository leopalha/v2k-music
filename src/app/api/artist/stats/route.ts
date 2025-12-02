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

    // Get all tracks from this artist
    const tracks = await prisma.track.findMany({
      where: {
        artistId: userId,
      },
      select: {
        id: true,
        status: true,
        totalSupply: true,
        availableSupply: true,
        pricePerToken: true,
        totalStreams: true,
        monthlyRoyalty: true,
        createdAt: true,
        portfolio: {
          select: {
            userId: true,
            amount: true,
          },
        },
      },
    });

    // Calculate stats
    const totalStreams = tracks.reduce((sum, track) => sum + (track.totalStreams || 0), 0);
    
    const tracksListed = tracks.filter(t => t.status === 'LIVE').length;
    const pendingTracks = tracks.filter(t => t.status === 'PENDING').length;

    // Get unique investors (holders)
    const uniqueInvestors = new Set(
      tracks.flatMap(track => track.portfolio.map(p => p.userId))
    );
    const totalInvestors = uniqueInvestors.size;

    // Calculate earnings from token sales
    const tokenSalesEarnings = tracks.reduce((sum, track) => {
      const tokensSold = track.totalSupply - track.availableSupply;
      return sum + (tokensSold * track.pricePerToken);
    }, 0);

    // Calculate monthly royalties (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentRoyalties = await prisma.transaction.aggregate({
      where: {
        userId: userId,
        type: 'ROYALTY_CLAIM',
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      _sum: {
        amountBRL: true,
      },
    });

    const monthlyEarnings = recentRoyalties._sum.amountBRL || 0;
    const totalEarnings = tokenSalesEarnings + monthlyEarnings;

    // Calculate total royalties paid to investors
    const totalRoyaltiesPaid = await prisma.transaction.aggregate({
      where: {
        type: 'ROYALTY_CLAIM',
        track: {
          artistId: userId,
        },
      },
      _sum: {
        amountBRL: true,
      },
    });

    const stats = {
      totalEarnings: Math.round(totalEarnings * 100) / 100,
      monthlyEarnings: Math.round(monthlyEarnings * 100) / 100,
      totalStreams,
      totalInvestors,
      tracksListed,
      pendingTracks,
      totalRoyaltiesPaid: Math.round((totalRoyaltiesPaid._sum.amountBRL || 0) * 100) / 100,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('[ARTIST_STATS_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to fetch artist stats' },
      { status: 500 }
    );
  }
}

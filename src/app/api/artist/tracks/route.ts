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

    // Get all tracks from this artist with detailed info
    const tracks = await prisma.track.findMany({
      where: {
        artistId: userId,
      },
      select: {
        id: true,
        title: true,
        coverUrl: true,
        status: true,
        totalSupply: true,
        availableSupply: true,
        currentPrice: true,
        totalStreams: true,
        monthlyRoyalty: true,
        createdAt: true,
        genre: true,
        portfolio: {
          select: {
            userId: true,
            amount: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform data to match expected format
    const transformedTracks = tracks.map(track => {
      const tokensSold = track.totalSupply - track.availableSupply;
      const totalRaised = tokensSold * track.currentPrice;
      const uniqueHolders = new Set(track.portfolio.map(p => p.userId)).size;

      return {
        id: track.id,
        title: track.title,
        coverUrl: track.coverUrl || '',
        status: track.status,
        tokenInfo: {
          total: track.totalSupply,
          sold: tokensSold,
          available: track.availableSupply,
          pricePerToken: track.currentPrice,
        },
        earnings: {
          totalRaised: Math.round(totalRaised * 100) / 100,
          monthlyStreams: track.totalStreams || 0,
          monthlyRoyalties: track.monthlyRoyalty || 0,
        },
        holders: uniqueHolders,
        genre: track.genre,
        createdAt: track.createdAt,
      };
    });

    return NextResponse.json({
      tracks: transformedTracks,
      total: transformedTracks.length,
    });
  } catch (error) {
    console.error('[ARTIST_TRACKS_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to fetch artist tracks' },
      { status: 500 }
    );
  }
}

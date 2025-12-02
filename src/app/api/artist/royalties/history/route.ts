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

    // Get query params
    const { searchParams } = new URL(request.url);
    const trackId = searchParams.get('trackId');

    // Build where clause
    const whereClause: any = {
      track: {
        artistId: userId,
      },
    };

    if (trackId) {
      whereClause.trackId = trackId;
    }

    // Get all tracks with last royalty dates
    const tracks = await prisma.track.findMany({
      where: {
        artistId: userId,
      },
      select: {
        id: true,
        title: true,
        coverUrl: true,
        totalRoyalties: true,
        lastRoyaltyDate: true,
        holders: true,
      },
      orderBy: {
        lastRoyaltyDate: 'desc',
      },
    });

    // Get IDs of tracks owned by this artist
    const artistTrackIds = tracks.map(t => t.id);

    // Get royalty claim notifications for artist's tracks
    // This is a workaround since we don't have a RoyaltyDistribution table
    const notifications = await prisma.notification.findMany({
      where: {
        type: 'ROYALTY_RECEIVED',
        message: {
          contains: 'Você recebeu',
        },
        trackId: {
          in: artistTrackIds,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100, // Limit to last 100 distributions
    });

    // Group notifications by track and date (month)
    const distributionsMap = new Map();
    
    notifications.forEach(notif => {
      const metadata = notif.data as any;
      const referenceMonth = metadata?.referenceMonth || notif.createdAt.toISOString().substring(0, 7);
      const key = `${notif.trackId}-${referenceMonth}`;
      
      if (!notif.trackId) return; // Skip if no trackId
      
      if (!distributionsMap.has(key)) {
        const track = tracks.find(t => t.id === notif.trackId);
        distributionsMap.set(key, {
          trackId: notif.trackId,
          trackTitle: track?.title || metadata?.trackTitle || 'Unknown',
          referenceMonth,
          totalAmount: 0,
          holdersCount: 0,
          distributedAt: notif.createdAt,
          holders: new Set(),
        });
      }
      
      const dist = distributionsMap.get(key);
      dist.totalAmount += (metadata?.amount || 0);
      dist.holders.add(notif.userId);
      dist.holdersCount = dist.holders.size;
    });

    // Convert to array and format
    const distributions = Array.from(distributionsMap.values()).map(dist => ({
      trackId: dist.trackId,
      trackTitle: dist.trackTitle,
      totalAmount: Math.round(dist.totalAmount * 100) / 100,
      holdersCount: dist.holdersCount,
      referenceMonth: dist.referenceMonth,
      distributedAt: dist.distributedAt,
    }));

    // Sort by date descending
    distributions.sort((a, b) => 
      new Date(b.distributedAt).getTime() - new Date(a.distributedAt).getTime()
    );

    // Add summary per track
    const trackSummary = tracks.map(track => ({
      trackId: track.id,
      trackTitle: track.title,
      coverUrl: track.coverUrl,
      totalRoyaltiesPaid: track.totalRoyalties,
      lastDistribution: track.lastRoyaltyDate,
      currentHolders: track.holders,
      distributionsCount: distributions.filter(d => d.trackId === track.id).length,
    }));

    return NextResponse.json({
      distributions,
      trackSummary,
      totalDistributions: distributions.length,
    });
  } catch (error) {
    console.error('[ROYALTIES_HISTORY_ERROR]', error);
    return NextResponse.json(
      { error: 'Erro ao buscar histórico de royalties' },
      { status: 500 }
    );
  }
}

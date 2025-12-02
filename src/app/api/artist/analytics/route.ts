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
      artistId: userId,
    };

    if (trackId) {
      whereClause.id = trackId;
    }

    // Get all tracks from this artist
    const tracks = await prisma.track.findMany({
      where: whereClause,
      include: {
        portfolio: {
          select: {
            userId: true,
            amount: true,
            user: {
              select: {
                name: true,
                username: true,
                profileImageUrl: true,
              },
            },
          },
        },
        transactions: {
          where: {
            type: {
              in: ['BUY', 'SELL'],
            },
            status: 'COMPLETED',
          },
          select: {
            type: true,
            totalValue: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        totalStreams: 'desc',
      },
    });

    if (tracks.length === 0) {
      return NextResponse.json({
        overview: {
          totalStreams: 0,
          totalRevenue: 0,
          totalHolders: 0,
          avgRoyaltyPerStream: 0,
        },
        streamsByPlatform: {
          spotify: 0,
          youtube: 0,
          tiktok: 0,
          apple: 0,
        },
        revenueBreakdown: {
          tokenSales: 0,
          royalties: 0,
          streamingRevenue: 0,
        },
        topTracks: [],
        holdersDemographics: {
          totalHolders: 0,
          avgTokensPerHolder: 0,
          topHolders: [],
        },
        performanceOverTime: [],
      });
    }

    // Calculate overview metrics
    const totalStreams = tracks.reduce((sum, t) => sum + (t.totalStreams || 0), 0);
    const totalSpotifyStreams = tracks.reduce((sum, t) => sum + (t.spotifyStreams || 0), 0);
    const totalYoutubeViews = tracks.reduce((sum, t) => sum + (t.youtubeViews || 0), 0);
    const totalTiktokViews = tracks.reduce((sum, t) => sum + (t.tiktokViews || 0), 0);

    // Calculate revenue from token sales
    const tokenSalesRevenue = tracks.reduce((sum, track) => {
      const tokensSold = track.totalSupply - track.availableSupply;
      return sum + (tokensSold * track.currentPrice);
    }, 0);

    // Calculate royalties revenue
    const royaltiesRevenue = tracks.reduce((sum, t) => sum + (t.totalRoyalties || 0), 0);

    // Total revenue (token sales + royalties)
    const totalRevenue = tokenSalesRevenue + royaltiesRevenue;

    // Get unique holders across all tracks
    const uniqueHolders = new Set(
      tracks.flatMap(track => track.portfolio.map(p => p.userId))
    );
    const totalHolders = uniqueHolders.size;

    // Avg royalty per stream (if streams > 0)
    const avgRoyaltyPerStream = totalStreams > 0 ? royaltiesRevenue / totalStreams : 0;

    // Streams by platform
    const streamsByPlatform = {
      spotify: totalSpotifyStreams,
      youtube: totalYoutubeViews,
      tiktok: totalTiktokViews,
      apple: 0, // TODO: Add Apple Music integration
    };

    // Revenue breakdown
    const revenueBreakdown = {
      tokenSales: tokenSalesRevenue,
      royalties: royaltiesRevenue,
      streamingRevenue: 0, // TODO: Calculate based on streaming contracts
    };

    // Top tracks
    const topTracks = tracks.slice(0, 10).map(track => {
      const tokensSold = track.totalSupply - track.availableSupply;
      const trackRevenue = (tokensSold * track.currentPrice) + (track.totalRoyalties || 0);
      
      return {
        id: track.id,
        title: track.title,
        coverUrl: track.coverUrl,
        streams: track.totalStreams || 0,
        revenue: Math.round(trackRevenue * 100) / 100,
        holders: new Set(track.portfolio.map(p => p.userId)).size,
        status: track.status,
      };
    });

    // Holders demographics
    const allHolders = tracks.flatMap(track => 
      track.portfolio.map(p => ({
        userId: p.userId,
        username: p.user.username || p.user.name || 'Unknown',
        profileImageUrl: p.user.profileImageUrl,
        tokens: p.amount,
      }))
    );

    // Aggregate by userId
    const holderMap = new Map<string, any>();
    allHolders.forEach(holder => {
      if (holderMap.has(holder.userId)) {
        holderMap.get(holder.userId).tokens += holder.tokens;
      } else {
        holderMap.set(holder.userId, holder);
      }
    });

    const aggregatedHolders = Array.from(holderMap.values());
    const totalTokensHeld = aggregatedHolders.reduce((sum, h) => sum + h.tokens, 0);
    const avgTokensPerHolder = totalHolders > 0 ? totalTokensHeld / totalHolders : 0;

    // Top 10 holders
    const topHolders = aggregatedHolders
      .sort((a, b) => b.tokens - a.tokens)
      .slice(0, 10)
      .map(holder => ({
        userId: holder.userId,
        username: holder.username,
        profileImageUrl: holder.profileImageUrl,
        tokens: holder.tokens,
        percentage: totalTokensHeld > 0 ? (holder.tokens / totalTokensHeld) * 100 : 0,
      }));

    // Performance over time (last 30 days)
    // Since we don't have daily data, we'll create a simple projection
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const performanceOverTime = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo);
      date.setDate(date.getDate() + i);
      
      performanceOverTime.push({
        date: date.toISOString().split('T')[0],
        streams: Math.round((totalStreams / 30) * (i + 1)), // Simple projection
        revenue: Math.round((totalRevenue / 30) * (i + 1) * 100) / 100,
      });
    }

    return NextResponse.json({
      overview: {
        totalStreams,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalHolders,
        avgRoyaltyPerStream: Math.round(avgRoyaltyPerStream * 1000) / 1000,
      },
      streamsByPlatform,
      revenueBreakdown: {
        tokenSales: Math.round(tokenSalesRevenue * 100) / 100,
        royalties: Math.round(royaltiesRevenue * 100) / 100,
        streamingRevenue: 0,
      },
      topTracks,
      holdersDemographics: {
        totalHolders,
        avgTokensPerHolder: Math.round(avgTokensPerHolder),
        topHolders,
      },
      performanceOverTime,
    });
  } catch (error) {
    console.error('[ARTIST_ANALYTICS_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

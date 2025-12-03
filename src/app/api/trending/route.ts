import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('range') || '24h';

    // Calculate time threshold
    const now = new Date();
    const threshold = new Date(now);
    
    switch (timeRange) {
      case '24h':
        threshold.setHours(now.getHours() - 24);
        break;
      case '7d':
        threshold.setDate(now.getDate() - 7);
        break;
      case '30d':
        threshold.setDate(now.getDate() - 30);
        break;
    }

    // Get all active tracks with their metrics
    const tracks = await prisma.track.findMany({
      where: {
        status: 'LIVE',
        isActive: true,
      },
      select: {
        id: true,
        title: true,
        artistName: true,
        coverUrl: true,
        genre: true,
        currentPrice: true,
        initialPrice: true,
        totalSupply: true,
        availableSupply: true,
        holders: true,
        volume24h: true,
        priceChange24h: true,
        totalStreams: true,
        createdAt: true,
        transactions: {
          where: {
            createdAt: {
              gte: threshold,
            },
            status: 'COMPLETED',
            type: {
              in: ['BUY', 'SELL'],
            },
          },
          select: {
            totalValue: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate trend score for each track
    const tracksWithScore = tracks.map(track => {
      const recentVolume = track.transactions.reduce((sum, tx) => sum + tx.totalValue, 0);
      const recentTransactions = track.transactions.length;
      const priceChange = track.priceChange24h || 0;
      const tokensSold = track.totalSupply - track.availableSupply;
      const salesPercentage = (tokensSold / track.totalSupply) * 100;

      // Trend score algorithm (weighted sum)
      const trendScore = 
        (recentVolume * 0.3) +          // 30% weight on volume
        (recentTransactions * 10 * 0.2) + // 20% weight on transactions
        (Math.abs(priceChange) * 100 * 0.25) + // 25% weight on price movement
        (track.holders * 5 * 0.15) +    // 15% weight on holders
        (salesPercentage * 0.1);        // 10% weight on sales progress

      return {
        id: track.id,
        title: track.title,
        artist: track.artistName,
        coverArt: track.coverUrl || '',
        genre: track.genre,
        pricePerToken: track.currentPrice,
        currentROI: track.initialPrice > 0 
          ? ((track.currentPrice - track.initialPrice) / track.initialPrice) * 100 
          : 0,
        riskLevel: salesPercentage > 80 ? 'LOW' : salesPercentage > 50 ? 'MEDIUM' : 'HIGH',
        totalTokens: track.totalSupply,
        availableTokens: track.availableSupply,
        holders: track.holders,
        volume: recentVolume,
        transactions: recentTransactions,
        priceChange: priceChange,
        trendScore,
      };
    });

    // Sort by trend score descending
    tracksWithScore.sort((a, b) => b.trendScore - a.trendScore);

    // Add ranking
    const rankedTracks = tracksWithScore.map((track, index) => ({
      ...track,
      rank: index + 1,
    }));

    // Calculate stats
    const topGainer = rankedTracks.length > 0 
      ? rankedTracks.reduce((max, track) => 
          track.priceChange > max.priceChange ? track : max
        )
      : null;

    const totalVolume = rankedTracks.reduce((sum, track) => sum + track.volume, 0);
    const totalTransactions = rankedTracks.reduce((sum, track) => sum + track.transactions, 0);

    return NextResponse.json({
      tracks: rankedTracks.slice(0, 50), // Top 50
      stats: {
        topGainer: topGainer ? {
          title: topGainer.title,
          change: topGainer.priceChange,
        } : null,
        totalVolume: Math.round(totalVolume * 100) / 100,
        totalTransactions,
      },
      timeRange,
    });
  } catch (error) {
    console.error('[TRENDING_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending tracks' },
      { status: 500 }
    );
  }
}

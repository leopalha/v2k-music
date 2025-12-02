import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

// GET /api/watchlist - Get user's watchlist with track info and performance data
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get watchlist items with track data
    const watchlistItems = await prisma.favorite.findMany({
      where: {
        userId: user.id,
        type: "WATCHLIST",
      },
      include: {
        track: {
          select: {
            id: true,
            tokenId: true,
            title: true,
            artistName: true,
            genre: true,
            coverUrl: true,
            currentPrice: true,
            initialPrice: true,
            priceChange24h: true,
            volume24h: true,
            totalSupply: true,
            availableSupply: true,
            marketCap: true,
            holders: true,
            totalStreams: true,
            monthlyRoyalty: true,
            totalRoyalties: true,
            aiScore: true,
            predictedROI: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate performance metrics for each track
    const watchlistWithMetrics = watchlistItems.map((item) => {
      const track = item.track;
      const priceChange = track.currentPrice - track.initialPrice;
      const priceChangePercent = ((priceChange / track.initialPrice) * 100).toFixed(2);
      const soldPercentage = ((track.totalSupply - track.availableSupply) / track.totalSupply * 100).toFixed(1);

      return {
        id: item.id,
        trackId: track.id,
        tokenId: track.tokenId,
        title: track.title,
        artistName: track.artistName,
        genre: track.genre,
        coverUrl: track.coverUrl,
        currentPrice: track.currentPrice,
        initialPrice: track.initialPrice,
        priceChange,
        priceChangePercent: parseFloat(priceChangePercent),
        priceChange24h: track.priceChange24h,
        volume24h: track.volume24h,
        totalSupply: track.totalSupply,
        availableSupply: track.availableSupply,
        soldPercentage: parseFloat(soldPercentage),
        marketCap: track.marketCap,
        holders: track.holders,
        totalStreams: track.totalStreams,
        monthlyRoyalty: track.monthlyRoyalty,
        totalRoyalties: track.totalRoyalties,
        aiScore: track.aiScore,
        predictedROI: track.predictedROI,
        addedAt: item.createdAt,
      };
    });

    // Calculate summary stats
    const summary = {
      totalTracks: watchlistWithMetrics.length,
      avgPriceChange: watchlistWithMetrics.reduce((sum, t) => sum + t.priceChangePercent, 0) / (watchlistWithMetrics.length || 1),
      gainers: watchlistWithMetrics.filter((t) => t.priceChangePercent > 0).length,
      losers: watchlistWithMetrics.filter((t) => t.priceChangePercent < 0).length,
      totalVolume24h: watchlistWithMetrics.reduce((sum, t) => sum + t.volume24h, 0),
      avgAiScore: watchlistWithMetrics.reduce((sum, t) => sum + t.aiScore, 0) / (watchlistWithMetrics.length || 1),
    };

    return NextResponse.json({
      watchlist: watchlistWithMetrics,
      summary,
    });
  } catch (error) {
    console.error("Error fetching watchlist:", error);
    return NextResponse.json(
      { error: "Failed to fetch watchlist" },
      { status: 500 }
    );
  }
}

// POST /api/watchlist - Add track to watchlist
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { trackId } = await request.json();

    if (!trackId) {
      return NextResponse.json(
        { error: "Track ID is required" },
        { status: 400 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if track exists
    const track = await prisma.track.findUnique({
      where: { id: trackId },
    });

    if (!track) {
      return NextResponse.json(
        { error: "Track not found" },
        { status: 404 }
      );
    }

    // Check if already in watchlist
    const existing = await prisma.favorite.findFirst({
      where: {
        userId: user.id,
        trackId,
        type: "WATCHLIST",
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Track already in watchlist" },
        { status: 409 }
      );
    }

    // Add to watchlist
    const watchlistItem = await prisma.favorite.create({
      data: {
        userId: user.id,
        trackId,
        type: "WATCHLIST",
      },
      include: {
        track: {
          select: {
            id: true,
            title: true,
            artistName: true,
            coverUrl: true,
            currentPrice: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Track added to watchlist",
        watchlistItem,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding to watchlist:", error);
    return NextResponse.json(
      { error: "Failed to add to watchlist" },
      { status: 500 }
    );
  }
}

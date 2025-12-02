import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { prisma } from '@/lib/db/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get current user session to check favorites
    const session = await getServerSession(authOptions)
    const userId = session?.user?.email

    // Fetch track from Prisma
    const track = await prisma.track.findUnique({
      where: { id },
      include: {
        artist: {
          select: {
            id: true,
            name: true,
            profileImageUrl: true,
            username: true
          }
        },
        priceHistory: {
          orderBy: { timestamp: 'desc' },
          take: 30 // Last 30 data points
        }
      }
    })

    if (!track) {
      return NextResponse.json(
        { error: 'Track not found' },
        { status: 404 }
      )
    }

    // Check if user favorited this track
    let isFavorite = false
    if (userId) {
      const user = await prisma.user.findUnique({ where: { email: userId } })
      if (user) {
        const favorite = await prisma.favorite.findUnique({
          where: {
            userId_trackId_type: {
              userId: user.id,
              trackId: track.id,
              type: 'FAVORITE'
            }
          }
        })
        isFavorite = !!favorite
      }
    }

    // Calculate ROI from price history
    const initialPrice = track.initialPrice
    const currentPrice = track.currentPrice
    const currentROI = ((currentPrice - initialPrice) / initialPrice) * 100

    // Determine risk level based on price volatility
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM'
    if (Math.abs(track.priceChange24h) < 5) riskLevel = 'LOW'
    else if (Math.abs(track.priceChange24h) > 15) riskLevel = 'HIGH'

    // Build track response
    const trackResponse = {
      id: track.id,
      tokenId: track.tokenId || 0,
      title: track.title,
      artist: track.artist?.name || track.artistName,
      artistId: track.artistId,
      genre: track.genre,
      coverArt: track.coverUrl,
      audioUrl: track.audioUrl,
      pricePerToken: track.currentPrice,
      totalSupply: track.totalSupply,
      availableSupply: track.availableSupply,
      // Aliases for frontend compatibility
      totalTokens: track.totalSupply,
      availableTokens: track.availableSupply,
      avgRoyaltyPerToken: track.monthlyRoyalty / Math.max(track.totalSupply, 1),

      // Market data
      currentROI,
      riskLevel,
      marketCap: track.marketCap,
      volume24h: track.volume24h,
      holders: track.holders,
      priceChange24h: track.priceChange24h,

      // Performance
      totalStreams: track.totalStreams,
      spotifyStreams: track.spotifyStreams,
      youtubeViews: track.youtubeViews,
      tiktokViews: track.tiktokViews,

      // Royalties
      totalRoyalties: track.totalRoyalties,
      monthlyRoyalty: track.monthlyRoyalty,
      lastRoyaltyDate: track.lastRoyaltyDate,
      royaltyBreakdown: {
        spotify: 0.45,
        youtube: 0.30,
        appleMusic: 0.15,
        other: 0.10
      },

      // Additional info
      description: `${track.title} by ${track.artist?.name || track.artistName} - ${track.genre} music with AI Score ${track.aiScore}/100`,
      releaseDate: track.createdAt.toISOString(),
      duration: track.duration,
      bpm: track.bpm,
      key: track.key,
      isrc: '',
      previewUrl: track.audioUrl,
      isFavorite,

      // AI Analysis
      aiScore: track.aiScore,
      predictedROI: track.predictedROI,
      viralProbability: track.viralProbability,

      // Status
      status: track.status,
      isActive: track.isActive,
      isFeatured: track.isFeatured,

      // Price history for charts
      performance: track.priceHistory.map(ph => ({
        date: ph.timestamp.toISOString().split('T')[0],
        price: ph.price
      })).reverse() // Oldest first
    }

    // Get similar tracks (same genre, exclude current)
    const similarTracks = await prisma.track.findMany({
      where: {
        genre: track.genre,
        id: { not: track.id },
        status: 'LIVE',
        isActive: true
      },
      take: 6,
      orderBy: {
        aiScore: 'desc'
      },
      select: {
        id: true,
        title: true,
        artistName: true,
        coverUrl: true,
        currentPrice: true,
        priceChange24h: true,
        aiScore: true
      }
    })

    return NextResponse.json({
      song: trackResponse,
      similarSongs: similarTracks.map(t => ({
        id: t.id,
        title: t.title,
        artist: t.artistName,
        coverArt: t.coverUrl,
        pricePerToken: t.currentPrice,
        priceChange24h: t.priceChange24h,
        aiScore: t.aiScore
      }))
    })

  } catch (error) {
    console.error('Error fetching track details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch track details', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

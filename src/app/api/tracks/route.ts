import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { prisma } from '@/lib/db/prisma'
import type { Genre } from '@prisma/client'
import * as cache from '@/lib/cache/redis'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '24')
    const genre = searchParams.get('genre')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const sortBy = searchParams.get('sortBy') || 'popular'

    // Build cache key from query params
    const cacheParams = { page, limit, genre, minPrice, maxPrice, sortBy }
    const cacheKey = cache.CacheKeys.tracks(cacheParams)

    // Try to get from cache first (for non-authenticated or favorites don't matter)
    if (!session) {
      const cached = await cache.get(cacheKey)
      if (cached) {
        return NextResponse.json(cached)
      }
    }

    // Build where clause for filters
    const where: any = {
      isActive: true,
      status: 'LIVE'
    }

    if (genre && genre !== 'all') {
      where.genre = genre.toUpperCase() as Genre
    }

    if (minPrice || maxPrice) {
      where.currentPrice = {}
      if (minPrice) where.currentPrice.gte = parseFloat(minPrice)
      if (maxPrice) where.currentPrice.lte = parseFloat(maxPrice)
    }

    // Build orderBy clause
    let orderBy: any = { createdAt: 'desc' } // default: newest first

    switch (sortBy) {
      case 'newest':
        orderBy = { createdAt: 'desc' }
        break
      case 'price-low':
        orderBy = { currentPrice: 'asc' }
        break
      case 'price-high':
        orderBy = { currentPrice: 'desc' }
        break
      case 'roi':
        orderBy = { predictedROI: 'desc' }
        break
      case 'name':
        orderBy = { title: 'asc' }
        break
      case 'popular':
      default:
        orderBy = { totalStreams: 'desc' }
        break
    }

    // Fetch tracks from database
    const [tracks, total] = await Promise.all([
      prisma.track.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          title: true,
          artistName: true,
          genre: true,
          coverUrl: true,
          audioUrl: true,
          currentPrice: true,
          initialPrice: true,
          totalSupply: true,
          availableSupply: true,
          aiScore: true,
          predictedROI: true,
          totalStreams: true,
          marketCap: true,
          volume24h: true,
          priceChange24h: true,
          holders: true,
          duration: true,
          contractAddress: true,
        }
      }),
      prisma.track.count({ where })
    ])

    // Get user favorites if authenticated
    let favoriteTrackIds: string[] = []
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
      })
      if (user) {
        const favorites = await prisma.favorite.findMany({
          where: { 
            userId: user.id,
            type: 'FAVORITE'
          },
          select: { trackId: true }
        })
        favoriteTrackIds = favorites.map(f => f.trackId)
      }
    }

    // Helper to calculate risk level from AI score
    const getRiskLevel = (aiScore: number, holders: number): 'LOW' | 'MEDIUM' | 'HIGH' => {
      if (aiScore >= 60 && holders >= 20) return 'LOW'
      if (aiScore >= 40 && holders >= 5) return 'MEDIUM'
      return 'HIGH'
    }

    // Format tracks for response
    const formattedTracks = tracks.map(track => ({
      id: track.id,
      title: track.title,
      artist: track.artistName,
      genre: track.genre,
      coverArt: track.coverUrl || `/api/placeholder/300/300?text=${encodeURIComponent(track.title)}`,
      audioUrl: track.audioUrl,
      pricePerToken: track.currentPrice,
      totalSupply: track.totalSupply,
      availableSupply: track.availableSupply,
      totalTokens: track.totalSupply,
      availableTokens: track.availableSupply,
      currentROI: track.predictedROI || 0,
      aiScore: track.aiScore,
      riskLevel: getRiskLevel(track.aiScore, track.holders),
      previewUrl: track.audioUrl,
      isFavorite: favoriteTrackIds.includes(track.id),
      totalStreams: track.totalStreams,
      marketCap: track.marketCap,
      volume24h: track.volume24h,
      priceChange24h: track.priceChange24h,
      holders: track.holders,
      duration: track.duration,
      contractAddress: track.contractAddress,
      monthlyRoyalty: 0 // TODO: calculate from royalty payments
    }))

    const response = {
      tracks: formattedTracks,
      total,
      page,
      limit,
      hasMore: page * limit < total
    }

    // Cache the response (5 minutes TTL)
    if (!session) {
      await cache.set(cacheKey, response, { ttl: cache.CacheTTL.MEDIUM })
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error fetching tracks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tracks', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

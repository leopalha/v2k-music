/**
 * Public API v1 - Tracks Endpoint
 * GET /api/v1/tracks - List tracks (requires READ_ONLY permission)
 * 
 * This is an example of a public API endpoint that requires API key authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withApiKeyAuth } from '@/lib/middleware/api-auth';
import { ApiPermission } from '@prisma/client';

/**
 * GET /api/v1/tracks
 * List all active tracks with pagination
 * 
 * Query params:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20, max: 100)
 * - genre: Filter by genre
 * - sortBy: Sort field (price, volume24h, priceChange24h)
 * - order: asc or desc
 */
async function handleGet(
  request: NextRequest,
  context: any,
  apiKeyData: {
    id: string;
    userId: string;
    permissions: ApiPermission[];
    environment: 'PRODUCTION' | 'SANDBOX';
  }
) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const skip = (page - 1) * limit;

    // Parse filters
    const genre = searchParams.get('genre');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const order = searchParams.get('order') === 'asc' ? 'asc' : 'desc';

    // Build where clause
    const where: any = {
      status: 'LIVE',
      isActive: true,
    };

    if (genre) {
      where.genre = genre.toUpperCase();
    }

    // If using sandbox key, only return test data
    if (apiKeyData.environment === 'SANDBOX') {
      where.title = {
        contains: 'Test',
      };
    }

    // Build orderBy clause
    const orderBy: any = {};
    if (sortBy === 'price') {
      orderBy.currentPrice = order;
    } else if (sortBy === 'volume24h') {
      orderBy.volume24h = order;
    } else if (sortBy === 'priceChange24h') {
      orderBy.priceChange24h = order;
    } else {
      orderBy.createdAt = order;
    }

    // Fetch tracks
    const [tracks, totalCount] = await Promise.all([
      prisma.track.findMany({
        where,
        select: {
          id: true,
          title: true,
          artistName: true,
          genre: true,
          coverUrl: true,
          audioUrl: true,
          currentPrice: true,
          priceChange24h: true,
          volume24h: true,
          holders: true,
          totalSupply: true,
          availableSupply: true,
          marketCap: true,
          totalStreams: true,
          spotifyStreams: true,
          aiScore: true,
          predictedROI: true,
          viralProbability: true,
          createdAt: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.track.count({ where }),
    ]);

    // Calculate pagination meta
    const totalPages = Math.ceil(totalCount / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return NextResponse.json({
      success: true,
      data: tracks,
      meta: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext,
        hasPrev,
      },
      environment: apiKeyData.environment,
    });
  } catch (error) {
    console.error('[API_V1_TRACKS_GET]', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// Export with API key authentication
// Requires READ_ONLY permission or higher
export const GET = withApiKeyAuth(handleGet, [ApiPermission.READ_ONLY]);

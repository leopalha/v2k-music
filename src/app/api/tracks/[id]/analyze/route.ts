import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db/prisma';
import { calculateTrackScore, getScoreCategory, type TrackMetrics } from '@/lib/ai/track-scoring';

/**
 * GET /api/tracks/[id]/analyze
 * Analisa uma track e retorna score AI com insights
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Buscar track com todas as métricas
    const track = await prisma.track.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            comments: true,
            favorites: true,
          },
        },
      },
    });

    if (!track) {
      return NextResponse.json(
        { error: 'Track não encontrada' },
        { status: 404 }
      );
    }

    // Preparar métricas para o algoritmo
    const metrics: TrackMetrics = {
      totalStreams: track.totalStreams,
      spotifyStreams: track.spotifyStreams,
      youtubeViews: track.youtubeViews,
      tiktokViews: track.tiktokViews,
      currentPrice: track.currentPrice,
      initialPrice: track.initialPrice,
      priceChange24h: track.priceChange24h,
      volume24h: track.volume24h,
      holders: track.holders,
      marketCap: track.marketCap,
      duration: track.duration,
      bpm: track.bpm,
      createdAt: track.createdAt,
      commentsCount: track._count.comments,
      favoritesCount: track._count.favorites,
    };

    // Calcular score
    const scoringResult = calculateTrackScore(metrics);
    const category = getScoreCategory(scoringResult.totalScore);

    // Atualizar track com novo score (se mudou significativamente)
    const scoreDiff = Math.abs(track.aiScore - scoringResult.totalScore);
    if (scoreDiff >= 5 || track.aiScore === 0) {
      await prisma.track.update({
        where: { id },
        data: {
          aiScore: scoringResult.totalScore,
          predictedROI: scoringResult.predictedROI,
          viralProbability: scoringResult.viralProbability,
        },
      });
    }

    return NextResponse.json({
      trackId: id,
      trackTitle: track.title,
      artistName: track.artistName,
      analysis: {
        score: scoringResult.totalScore,
        category: category.label,
        categoryColor: category.color,
        categoryDescription: category.description,
        breakdown: scoringResult.breakdown,
        predictedROI: scoringResult.predictedROI,
        viralProbability: scoringResult.viralProbability,
        riskLevel: scoringResult.riskLevel,
        insights: scoringResult.insights,
      },
      metrics: {
        totalStreams: track.totalStreams,
        holders: track.holders,
        volume24h: track.volume24h,
        priceChange24h: track.priceChange24h,
        marketCap: track.marketCap,
      },
      analyzedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error analyzing track:', error);
    return NextResponse.json(
      {
        error: 'Erro ao analisar track',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tracks/[id]/analyze
 * Força recálculo do score (apenas admin/owner)
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    // Buscar track
    const track = await prisma.track.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            comments: true,
            favorites: true,
          },
        },
      },
    });

    if (!track) {
      return NextResponse.json(
        { error: 'Track não encontrada' },
        { status: 404 }
      );
    }

    // Preparar métricas
    const metrics: TrackMetrics = {
      totalStreams: track.totalStreams,
      spotifyStreams: track.spotifyStreams,
      youtubeViews: track.youtubeViews,
      tiktokViews: track.tiktokViews,
      currentPrice: track.currentPrice,
      initialPrice: track.initialPrice,
      priceChange24h: track.priceChange24h,
      volume24h: track.volume24h,
      holders: track.holders,
      marketCap: track.marketCap,
      duration: track.duration,
      bpm: track.bpm,
      createdAt: track.createdAt,
      commentsCount: track._count.comments,
      favoritesCount: track._count.favorites,
    };

    // Calcular score
    const scoringResult = calculateTrackScore(metrics);
    const category = getScoreCategory(scoringResult.totalScore);

    // Atualizar track com novo score
    const updatedTrack = await prisma.track.update({
      where: { id },
      data: {
        aiScore: scoringResult.totalScore,
        predictedROI: scoringResult.predictedROI,
        viralProbability: scoringResult.viralProbability,
      },
    });

    return NextResponse.json({
      trackId: id,
      trackTitle: track.title,
      previousScore: track.aiScore,
      newScore: scoringResult.totalScore,
      analysis: {
        score: scoringResult.totalScore,
        category: category.label,
        categoryColor: category.color,
        breakdown: scoringResult.breakdown,
        predictedROI: scoringResult.predictedROI,
        viralProbability: scoringResult.viralProbability,
        riskLevel: scoringResult.riskLevel,
        insights: scoringResult.insights,
      },
      updatedAt: updatedTrack.updatedAt,
    });
  } catch (error) {
    console.error('Error recalculating track score:', error);
    return NextResponse.json(
      {
        error: 'Erro ao recalcular score',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

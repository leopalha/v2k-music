import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db/prisma';
import {
  calculatePortfolioMetrics,
  calculateTrackPerformance,
  calculateAverageROI,
  findBestWorst,
} from '@/lib/analytics/calculations';

/**
 * GET /api/analytics/overview
 * Returns comprehensive portfolio overview metrics
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Get portfolio holdings
    const portfolio = await prisma.portfolio.findMany({
      where: { userId: user.id },
      include: {
        track: {
          select: {
            id: true,
            title: true,
            artistName: true,
            currentPrice: true,
          },
        },
      },
    });

    // Calculate totals
    const totalInvested = portfolio.reduce((sum, p) => sum + p.totalInvested, 0);
    const currentValue = portfolio.reduce((sum, p) => sum + p.currentValue, 0);
    const totalRoyalties = portfolio.reduce((sum, p) => sum + p.totalRoyaltiesEarned, 0);

    // Calculate portfolio metrics
    const metrics = calculatePortfolioMetrics(totalInvested, currentValue);

    // Calculate track performances
    const trackPerformances = portfolio.map(p =>
      calculateTrackPerformance(
        p.trackId,
        p.totalInvested,
        p.currentValue,
        p.totalRoyaltiesEarned
      )
    );

    // Find best and worst performing tracks
    const { best, worst } = findBestWorst(trackPerformances);

    // Get track details for best/worst
    let bestPerformingTrack = null;
    let worstPerformingTrack = null;

    if (best) {
      const track = portfolio.find(p => p.trackId === best.trackId)?.track;
      bestPerformingTrack = {
        id: best.trackId,
        title: track?.title || 'Unknown',
        artist: track?.artistName || 'Unknown',
        roi: best.roi,
        profitLoss: best.profitLoss,
      };
    }

    if (worst) {
      const track = portfolio.find(p => p.trackId === worst.trackId)?.track;
      worstPerformingTrack = {
        id: worst.trackId,
        title: track?.title || 'Unknown',
        artist: track?.artistName || 'Unknown',
        roi: worst.roi,
        profitLoss: worst.profitLoss,
      };
    }

    // Calculate average ROI
    const avgROI = calculateAverageROI(
      portfolio.map(p => ({
        invested: p.totalInvested,
        currentValue: p.currentValue,
      }))
    );

    return NextResponse.json({
      totalInvested: metrics.totalInvested,
      currentValue: metrics.currentValue,
      totalProfitLoss: metrics.profitLoss,
      totalProfitLossPercent: metrics.profitLossPercent,
      totalRoyalties,
      tracksOwned: portfolio.length,
      avgROI,
      bestPerformingTrack,
      worstPerformingTrack,
    });
  } catch (error) {
    console.error('Analytics overview error:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar analytics', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

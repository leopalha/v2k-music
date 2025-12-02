import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db/prisma';
import { generateInsights } from '@/lib/analytics/insights';
import { calculateTrackPerformance, calculateAverageROI } from '@/lib/analytics/calculations';

/**
 * GET /api/analytics/insights
 * Returns AI-generated portfolio insights and recommendations
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
          },
        },
      },
    });

    // Calculate totals
    const totalInvested = portfolio.reduce((sum, p) => sum + p.totalInvested, 0);
    const currentValue = portfolio.reduce((sum, p) => sum + p.currentValue, 0);
    const totalRoyalties = portfolio.reduce((sum, p) => sum + p.totalRoyaltiesEarned, 0);
    const profitLoss = currentValue - totalInvested;
    const roi = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;

    // Calculate track performances
    const trackPerformances = portfolio.map(p =>
      calculateTrackPerformance(
        p.trackId,
        p.totalInvested,
        p.currentValue,
        p.totalRoyaltiesEarned
      )
    );

    // Calculate average platform ROI (simulated for now)
    // TODO: In the future, calculate this from all users' portfolios
    const avgPlatformROI = 12.5;

    // Generate insights
    const insights = generateInsights({
      totalInvested,
      currentValue,
      profitLoss,
      roi,
      tracksOwned: portfolio.length,
      totalRoyalties,
      trackPerformances,
      avgPlatformROI,
    });

    return NextResponse.json({
      insights,
      meta: {
        totalInvested,
        currentValue,
        roi,
        tracksOwned: portfolio.length,
        avgPlatformROI,
      },
    });
  } catch (error) {
    console.error('Analytics insights error:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar insights', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

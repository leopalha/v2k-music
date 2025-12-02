import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db/prisma';
import { generatePerformanceHistory, calculatePercentChange } from '@/lib/analytics/calculations';

/**
 * GET /api/analytics/performance?period=30d
 * Returns historical performance data for charts
 */
export async function GET(request: NextRequest) {
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

    // Get period parameter
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';

    // Parse period to days
    const periodToDays: Record<string, number> = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365,
    };

    const days = periodToDays[period] || 30;

    // Get current portfolio value
    const portfolio = await prisma.portfolio.findMany({
      where: { userId: user.id },
    });

    const currentValue = portfolio.reduce((sum, p) => sum + p.currentValue, 0);
    const totalRoyalties = portfolio.reduce((sum, p) => sum + p.totalRoyaltiesEarned, 0);

    // TODO: In the future, fetch actual historical data from PriceHistory table
    // For now, generate realistic-looking performance data
    const history = generatePerformanceHistory(currentValue, days);

    // Add royalties data to history (simulated)
    const historyWithRoyalties = history.map((point, index) => {
      // Simulate gradual royalty accumulation
      const royaltyProgress = index / history.length;
      const profitLoss = point.value - (currentValue * 0.7); // Assume started at 70% of current

      return {
        date: point.date,
        portfolioValue: point.value,
        profitLoss,
        royalties: totalRoyalties * royaltyProgress,
      };
    });

    // Calculate summary
    const startValue = history[0].value;
    const endValue = history[history.length - 1].value;
    const change = endValue - startValue;
    const changePercent = calculatePercentChange(startValue, endValue);

    return NextResponse.json({
      history: historyWithRoyalties,
      summary: {
        startValue,
        endValue,
        change,
        changePercent,
      },
    });
  } catch (error) {
    console.error('Analytics performance error:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar performance', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

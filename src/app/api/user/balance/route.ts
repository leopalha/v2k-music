import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        cashBalance: true,
        portfolio: {
          select: {
            amount: true,
            currentValue: true,
            unrealizedPnL: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Calculate total portfolio value
    const totalPortfolioValue = user.portfolio.reduce(
      (sum, holding) => sum + holding.currentValue,
      0
    );

    // Calculate total unrealized P&L
    const totalUnrealizedPnL = user.portfolio.reduce(
      (sum, holding) => sum + holding.unrealizedPnL,
      0
    );

    return NextResponse.json({
      balance: user.cashBalance,
      totalPortfolioValue,
      totalUnrealizedPnL,
      totalAssets: user.cashBalance + totalPortfolioValue,
    });
  } catch (error) {
    console.error('Get balance error:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar saldo' },
      { status: 500 }
    );
  }
}

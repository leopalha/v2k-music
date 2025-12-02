import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: Request) {
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
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // BUY, SELL, TRANSFER, ROYALTY_CLAIM
    const status = searchParams.get('status'); // PENDING, COMPLETED, FAILED
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause
    const where: any = {
      userId: user.id,
    };

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    // Fetch transactions
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          track: {
            select: {
              id: true,
              title: true,
              artistName: true,
              coverUrl: true,
              tokenId: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      prisma.transaction.count({ where }),
    ]);

    // Calculate summary stats
    const summary = await prisma.transaction.aggregate({
      where: {
        userId: user.id,
        status: 'COMPLETED',
      },
      _sum: {
        totalValue: true,
        fee: true,
      },
      _count: true,
    });

    const totalInvested = await prisma.transaction.aggregate({
      where: {
        userId: user.id,
        type: 'BUY',
        status: 'COMPLETED',
      },
      _sum: {
        totalValue: true,
      },
    });

    const totalWithdrawn = await prisma.transaction.aggregate({
      where: {
        userId: user.id,
        type: 'SELL',
        status: 'COMPLETED',
      },
      _sum: {
        totalValue: true,
      },
    });

    const totalRoyalties = await prisma.transaction.aggregate({
      where: {
        userId: user.id,
        type: 'ROYALTY_CLAIM',
        status: 'COMPLETED',
      },
      _sum: {
        totalValue: true,
      },
    });

    return NextResponse.json({
      success: true,
      transactions: transactions.map((tx: any) => ({
        id: tx.id,
        type: tx.type,
        status: tx.status,
        amount: tx.amount,
        price: tx.price,
        totalValue: tx.totalValue,
        fee: tx.fee,
        paymentMethod: tx.paymentMethod,
        txHash: tx.txHash,
        track: tx.track,
        createdAt: tx.createdAt.toISOString(),
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
      summary: {
        totalTransactions: summary._count,
        totalVolume: summary._sum.totalValue || 0,
        totalFees: summary._sum.fee || 0,
        totalInvested: totalInvested._sum.totalValue || 0,
        totalWithdrawn: totalWithdrawn._sum.totalValue || 0,
        totalRoyalties: totalRoyalties._sum.totalValue || 0,
      },
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    return NextResponse.json(
      {
        error: 'Erro ao buscar transações',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

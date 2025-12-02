import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db/prisma';

/**
 * GET /api/copy-trading
 * List all traders being copied by the current user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

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

    // Get all copy trades for this user
    const copyTrades = await prisma.copyTrade.findMany({
      where: { copierId: user.id },
      include: {
        trader: {
          select: {
            id: true,
            name: true,
            username: true,
            profileImageUrl: true,
            userStats: {
              select: {
                totalProfit: true,
                winRate: true,
                totalTrades: true,
                portfolioValue: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Format response
    const formattedTrades = copyTrades.map((ct) => ({
      id: ct.id,
      trader: {
        id: ct.trader.id,
        name: ct.trader.name,
        username: ct.trader.username,
        profileImageUrl: ct.trader.profileImageUrl,
        stats: ct.trader.userStats,
      },
      settings: {
        isActive: ct.isActive,
        allocationPercent: ct.allocationPercent,
        maxPerTrade: ct.maxPerTrade,
        copyBuys: ct.copyBuys,
        copySells: ct.copySells,
      },
      performance: {
        totalCopied: ct.totalCopied,
        totalInvested: ct.totalInvested,
        totalProfit: ct.totalProfit,
        roi: ct.totalInvested > 0 ? (ct.totalProfit / ct.totalInvested) * 100 : 0,
      },
      startedAt: ct.startedAt,
      pausedAt: ct.pausedAt,
    }));

    return NextResponse.json({
      copyTrades: formattedTrades,
      total: copyTrades.length,
      activeCount: copyTrades.filter((ct) => ct.isActive).length,
    });
  } catch (error) {
    console.error('Error fetching copy trades:', error);
    return NextResponse.json(
      {
        error: 'Erro ao buscar copy trades',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/copy-trading
 * Start copying a trader
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

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

    const body = await request.json();
    const {
      traderId,
      allocationPercent = 10,
      maxPerTrade,
      copyBuys = true,
      copySells = true,
    } = body;

    if (!traderId) {
      return NextResponse.json(
        { error: 'traderId é obrigatório' },
        { status: 400 }
      );
    }

    // Can't copy yourself
    if (traderId === user.id) {
      return NextResponse.json(
        { error: 'Você não pode copiar a si mesmo' },
        { status: 400 }
      );
    }

    // Check if trader exists
    const trader = await prisma.user.findUnique({
      where: { id: traderId },
      select: {
        id: true,
        name: true,
        portfolioPublic: true,
      },
    });

    if (!trader) {
      return NextResponse.json(
        { error: 'Trader não encontrado' },
        { status: 404 }
      );
    }

    // Check if portfolio is public (required for copy trading)
    if (!trader.portfolioPublic) {
      return NextResponse.json(
        { error: 'Este trader não permite copy trading (portfolio privado)' },
        { status: 403 }
      );
    }

    // Check if already copying this trader
    const existingCopyTrade = await prisma.copyTrade.findUnique({
      where: {
        copierId_traderId: {
          copierId: user.id,
          traderId: traderId,
        },
      },
    });

    if (existingCopyTrade) {
      // Reactivate if was stopped
      if (!existingCopyTrade.isActive) {
        const updated = await prisma.copyTrade.update({
          where: { id: existingCopyTrade.id },
          data: {
            isActive: true,
            allocationPercent,
            maxPerTrade,
            copyBuys,
            copySells,
            pausedAt: null,
            stoppedAt: null,
          },
        });

        return NextResponse.json({
          message: 'Copy trade reativado',
          copyTrade: updated,
        });
      }

      return NextResponse.json(
        { error: 'Você já está copiando este trader' },
        { status: 400 }
      );
    }

    // Create new copy trade
    const copyTrade = await prisma.copyTrade.create({
      data: {
        copierId: user.id,
        traderId: traderId,
        allocationPercent: Math.min(Math.max(allocationPercent, 1), 100),
        maxPerTrade,
        copyBuys,
        copySells,
      },
      include: {
        trader: {
          select: {
            id: true,
            name: true,
            username: true,
            profileImageUrl: true,
          },
        },
      },
    });

    // Create notification for trader
    await prisma.notification.create({
      data: {
        userId: traderId,
        type: 'NEW_FOLLOWER',
        title: 'Novo copier',
        message: `${session.user.name || 'Um usuário'} começou a copiar seus trades`,
        link: `/profile/${user.id}`,
      },
    });

    return NextResponse.json({
      message: 'Copy trade iniciado com sucesso',
      copyTrade: {
        id: copyTrade.id,
        trader: copyTrade.trader,
        settings: {
          isActive: copyTrade.isActive,
          allocationPercent: copyTrade.allocationPercent,
          maxPerTrade: copyTrade.maxPerTrade,
          copyBuys: copyTrade.copyBuys,
          copySells: copyTrade.copySells,
        },
        startedAt: copyTrade.startedAt,
      },
    });
  } catch (error) {
    console.error('Error creating copy trade:', error);
    return NextResponse.json(
      {
        error: 'Erro ao iniciar copy trade',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db/prisma';

/**
 * GET /api/copy-trading/[id]
 * Get details of a specific copy trade
 */
export async function GET(
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

    const { id } = await context.params;

    const copyTrade = await prisma.copyTrade.findUnique({
      where: { id },
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
                followersCount: true,
              },
            },
          },
        },
      },
    });

    if (!copyTrade) {
      return NextResponse.json(
        { error: 'Copy trade não encontrado' },
        { status: 404 }
      );
    }

    // Check ownership
    if (copyTrade.copierId !== user.id) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      );
    }

    // Get recent executions
    const executions = await prisma.copyTradeExecution.findMany({
      where: { copyTradeId: id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return NextResponse.json({
      copyTrade: {
        id: copyTrade.id,
        trader: {
          id: copyTrade.trader.id,
          name: copyTrade.trader.name,
          username: copyTrade.trader.username,
          profileImageUrl: copyTrade.trader.profileImageUrl,
          stats: copyTrade.trader.userStats,
        },
        settings: {
          isActive: copyTrade.isActive,
          allocationPercent: copyTrade.allocationPercent,
          maxPerTrade: copyTrade.maxPerTrade,
          copyBuys: copyTrade.copyBuys,
          copySells: copyTrade.copySells,
        },
        performance: {
          totalCopied: copyTrade.totalCopied,
          totalInvested: copyTrade.totalInvested,
          totalProfit: copyTrade.totalProfit,
          roi: copyTrade.totalInvested > 0
            ? (copyTrade.totalProfit / copyTrade.totalInvested) * 100
            : 0,
        },
        startedAt: copyTrade.startedAt,
        pausedAt: copyTrade.pausedAt,
        stoppedAt: copyTrade.stoppedAt,
      },
      recentExecutions: executions,
    });
  } catch (error) {
    console.error('Error fetching copy trade:', error);
    return NextResponse.json(
      {
        error: 'Erro ao buscar copy trade',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/copy-trading/[id]
 * Update copy trade settings
 */
export async function PATCH(
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

    const { id } = await context.params;

    const copyTrade = await prisma.copyTrade.findUnique({
      where: { id },
    });

    if (!copyTrade) {
      return NextResponse.json(
        { error: 'Copy trade não encontrado' },
        { status: 404 }
      );
    }

    if (copyTrade.copierId !== user.id) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const updateData: any = {};

    if (typeof body.isActive === 'boolean') {
      updateData.isActive = body.isActive;
      if (body.isActive) {
        updateData.pausedAt = null;
      } else {
        updateData.pausedAt = new Date();
      }
    }

    if (typeof body.allocationPercent === 'number') {
      updateData.allocationPercent = Math.min(Math.max(body.allocationPercent, 1), 100);
    }

    if (body.maxPerTrade !== undefined) {
      updateData.maxPerTrade = body.maxPerTrade;
    }

    if (typeof body.copyBuys === 'boolean') {
      updateData.copyBuys = body.copyBuys;
    }

    if (typeof body.copySells === 'boolean') {
      updateData.copySells = body.copySells;
    }

    const updated = await prisma.copyTrade.update({
      where: { id },
      data: updateData,
      include: {
        trader: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Configurações atualizadas',
      copyTrade: {
        id: updated.id,
        trader: updated.trader,
        settings: {
          isActive: updated.isActive,
          allocationPercent: updated.allocationPercent,
          maxPerTrade: updated.maxPerTrade,
          copyBuys: updated.copyBuys,
          copySells: updated.copySells,
        },
      },
    });
  } catch (error) {
    console.error('Error updating copy trade:', error);
    return NextResponse.json(
      {
        error: 'Erro ao atualizar copy trade',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/copy-trading/[id]
 * Stop copy trading a trader
 */
export async function DELETE(
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

    const { id } = await context.params;

    const copyTrade = await prisma.copyTrade.findUnique({
      where: { id },
    });

    if (!copyTrade) {
      return NextResponse.json(
        { error: 'Copy trade não encontrado' },
        { status: 404 }
      );
    }

    if (copyTrade.copierId !== user.id) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      );
    }

    // Soft delete - mark as stopped
    await prisma.copyTrade.update({
      where: { id },
      data: {
        isActive: false,
        stoppedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: 'Copy trade encerrado com sucesso',
    });
  } catch (error) {
    console.error('Error deleting copy trade:', error);
    return NextResponse.json(
      {
        error: 'Erro ao encerrar copy trade',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

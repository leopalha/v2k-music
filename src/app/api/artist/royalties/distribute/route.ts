import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Parse request body
    const body = await request.json();
    const { trackId, totalAmount, referenceMonth } = body;

    // Validate input
    if (!trackId || !totalAmount || !referenceMonth) {
      return NextResponse.json(
        { error: 'trackId, totalAmount e referenceMonth são obrigatórios' },
        { status: 400 }
      );
    }

    if (typeof totalAmount !== 'number' || totalAmount <= 0) {
      return NextResponse.json(
        { error: 'totalAmount deve ser um número positivo' },
        { status: 400 }
      );
    }

    // Validate referenceMonth format (YYYY-MM)
    if (!/^\d{4}-\d{2}$/.test(referenceMonth)) {
      return NextResponse.json(
        { error: 'referenceMonth deve estar no formato YYYY-MM' },
        { status: 400 }
      );
    }

    // Verify track exists and user is the artist
    const track = await prisma.track.findUnique({
      where: { id: trackId },
      select: {
        id: true,
        artistId: true,
        title: true,
        totalSupply: true,
        totalRoyalties: true,
      },
    });

    if (!track) {
      return NextResponse.json(
        { error: 'Track não encontrada' },
        { status: 404 }
      );
    }

    if (track.artistId !== userId) {
      return NextResponse.json(
        { error: 'Você não é o artista desta track' },
        { status: 403 }
      );
    }

    // Get all holders (portfolios) for this track
    const portfolios = await prisma.portfolio.findMany({
      where: {
        trackId,
        amount: {
          gt: 0, // Only holders with tokens
        },
      },
      select: {
        id: true,
        userId: true,
        amount: true,
        unclaimedRoyalties: true,
      },
    });

    if (portfolios.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum holder encontrado para esta track' },
        { status: 400 }
      );
    }

    // Calculate royalties per holder
    const updates = portfolios.map(portfolio => {
      const royaltyAmount = (portfolio.amount / track.totalSupply) * totalAmount;
      return {
        portfolioId: portfolio.id,
        userId: portfolio.userId,
        amount: royaltyAmount,
        tokens: portfolio.amount,
      };
    });

    // Execute distribution in a transaction
    await prisma.$transaction(async (tx) => {
      // Update each portfolio with unclaimed royalties
      for (const update of updates) {
        await tx.portfolio.update({
          where: { id: update.portfolioId },
          data: {
            unclaimedRoyalties: {
              increment: update.amount,
            },
          },
        });

        // Create notification for each holder
        await tx.notification.create({
          data: {
            userId: update.userId,
            type: 'ROYALTY_RECEIVED',
            title: 'Novos Royalties Disponíveis',
            message: `Você recebeu R$ ${update.amount.toFixed(2)} em royalties da música "${track.title}". Faça o claim no seu portfolio!`,
            data: {
              trackId,
              trackTitle: track.title,
              amount: update.amount,
              referenceMonth,
            },
          },
        });
      }

      // Update track totals
      await tx.track.update({
        where: { id: trackId },
        data: {
          totalRoyalties: {
            increment: totalAmount,
          },
          lastRoyaltyDate: new Date(),
        },
      });
    });

    const summary = {
      success: true,
      totalDistributed: totalAmount,
      holdersCount: portfolios.length,
      referenceMonth,
      trackTitle: track.title,
      distributions: updates.map(u => ({
        userId: u.userId,
        tokens: u.tokens,
        royaltyAmount: Math.round(u.amount * 100) / 100,
      })),
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error('[ROYALTIES_DISTRIBUTE_ERROR]', error);
    return NextResponse.json(
      { error: 'Erro ao distribuir royalties' },
      { status: 500 }
    );
  }
}

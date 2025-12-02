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
    const { trackId } = body;

    // Validate input
    if (!trackId) {
      return NextResponse.json(
        { error: 'trackId é obrigatório' },
        { status: 400 }
      );
    }

    // Find portfolio for this user and track
    const portfolio = await prisma.portfolio.findUnique({
      where: {
        userId_trackId: {
          userId,
          trackId,
        },
      },
      include: {
        track: {
          select: {
            title: true,
            coverUrl: true,
          },
        },
      },
    });

    if (!portfolio) {
      return NextResponse.json(
        { error: 'Você não possui tokens desta track' },
        { status: 404 }
      );
    }

    // Check if there are unclaimed royalties
    if (portfolio.unclaimedRoyalties <= 0) {
      return NextResponse.json(
        { error: 'Você não possui royalties disponíveis para claim' },
        { status: 400 }
      );
    }

    const claimAmount = portfolio.unclaimedRoyalties;

    // Execute claim in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          type: 'ROYALTY_CLAIM',
          trackId,
          userId,
          amount: 0, // Not relevant for royalty claims
          price: 0,
          totalValue: claimAmount,
          fee: 0,
          status: 'COMPLETED',
        },
      });

      // Update user balance
      await tx.user.update({
        where: { id: userId },
        data: {
          cashBalance: {
            increment: claimAmount,
          },
        },
      });

      // Update portfolio
      await tx.portfolio.update({
        where: { id: portfolio.id },
        data: {
          totalRoyaltiesEarned: {
            increment: claimAmount,
          },
          unclaimedRoyalties: 0,
        },
      });

      // Create success notification
      await tx.notification.create({
        data: {
          userId,
          type: 'ROYALTY_RECEIVED',
          title: 'Royalties Recebidos!',
          message: `Você recebeu R$ ${claimAmount.toFixed(2)} de royalties da música "${portfolio.track.title}"`,
          data: {
            trackId,
            trackTitle: portfolio.track.title,
            amount: claimAmount,
            transactionId: transaction.id,
          },
        },
      });

      return {
        transaction,
        newBalance: await tx.user.findUnique({
          where: { id: userId },
          select: { cashBalance: true },
        }),
      };
    });

    return NextResponse.json({
      success: true,
      claimedAmount: Math.round(claimAmount * 100) / 100,
      trackTitle: portfolio.track.title,
      transactionId: result.transaction.id,
      newBalance: result.newBalance?.cashBalance || 0,
    });
  } catch (error) {
    console.error('[ROYALTIES_CLAIM_ERROR]', error);
    return NextResponse.json(
      { error: 'Erro ao fazer claim de royalties' },
      { status: 500 }
    );
  }
}

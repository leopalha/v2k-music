import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe, STRIPE_MOCK_MODE } from '@/lib/stripe/stripe';
import { prisma } from '@/lib/db/prisma';
import { randomUUID } from 'crypto';
import { triggerWebhooks } from '@/lib/webhooks/manager';
import { sendTradeConfirmationEmail } from '@/lib/email/notifications';

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const { paymentIntentId } = await request.json();

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'paymentIntentId é obrigatório' },
        { status: 400 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Get transaction from database first
    const transaction = await prisma.transaction.findFirst({
      where: {
        stripePaymentId: paymentIntentId,
        userId: user.id,
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transação não encontrada' },
        { status: 404 }
      );
    }

    // Verify payment with Stripe (or mock in dev mode)
    let paymentIntent: any;

    if (STRIPE_MOCK_MODE) {
      // In mock mode, simulate successful payment
      if (!paymentIntentId.startsWith('pi_mock_')) {
        return NextResponse.json(
          { error: 'PaymentIntent inválido para modo mock' },
          { status: 400 }
        );
      }

      paymentIntent = {
        id: paymentIntentId,
        status: 'succeeded',
        metadata: {
          trackId: transaction.trackId,
          tokensAmount: transaction.amount.toString(),
        },
      };
    } else {
      paymentIntent = await stripe!.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status !== 'succeeded') {
        return NextResponse.json(
          { error: 'Pagamento não confirmado', paymentStatus: paymentIntent.status },
          { status: 400 }
        );
      }
    }

    if (transaction.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Transação já foi processada', transaction },
        { status: 400 }
      );
    }

    // Extract metadata
    const trackId = paymentIntent.metadata.trackId;
    const tokensAmount = parseInt(paymentIntent.metadata.tokensAmount);

    // Use Prisma transaction for atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Get track with lock
      const track = await tx.track.findUnique({
        where: { id: trackId },
        select: {
          id: true,
          title: true,
          artistName: true,
          availableSupply: true,
          currentPrice: true,
          holders: true,
        }
      });

      if (!track) {
        throw new Error('Track não encontrada');
      }

      // Validate supply one more time (race condition protection)
      if (track.availableSupply < tokensAmount) {
        throw new Error(`Apenas ${track.availableSupply} tokens disponíveis`);
      }

      // Check if user already holds this track
      const existingHolding = await tx.portfolio.findUnique({
        where: {
          userId_trackId: {
            userId: user.id,
            trackId: trackId,
          },
        },
      });

      const isNewHolder = !existingHolding;

      // Update track supply and holders
      await tx.track.update({
        where: { id: trackId },
        data: {
          availableSupply: { decrement: tokensAmount },
          holders: isNewHolder ? { increment: 1 } : undefined,
        },
      });

      // Update or create portfolio
      if (existingHolding) {
        const newAmount = existingHolding.amount + tokensAmount;
        const newTotalInvested = existingHolding.totalInvested + transaction.totalValue;
        const newAvgBuyPrice = newTotalInvested / newAmount;

        await tx.portfolio.update({
          where: { id: existingHolding.id },
          data: {
            amount: newAmount,
            avgBuyPrice: newAvgBuyPrice,
            totalInvested: newTotalInvested,
            currentValue: newAmount * track.currentPrice,
            unrealizedPnL: (newAmount * track.currentPrice) - newTotalInvested,
          },
        });
      } else {
        await tx.portfolio.create({
          data: {
            userId: user.id,
            trackId: trackId,
            amount: tokensAmount,
            avgBuyPrice: transaction.price,
            totalInvested: transaction.totalValue,
            currentValue: tokensAmount * track.currentPrice,
            unrealizedPnL: 0,
          },
        });
      }

      // Generate simulated txHash for tracking
      const txHash = `0x${randomUUID().replace(/-/g, '')}`;

      // Update transaction status
      const updatedTransaction = await tx.transaction.update({
        where: { id: transaction.id },
        data: {
          txHash,
          status: 'COMPLETED',
        },
      });

      // Create notification
      await tx.notification.create({
        data: {
          userId: user.id,
          type: 'INVESTMENT_CONFIRMED',
          title: 'Investimento confirmado!',
          message: `Você adquiriu ${tokensAmount} tokens de ${track.title}`,
          link: `/portfolio`,
          read: false,
        },
      });

      return { updatedTransaction, txHash, track };
    });

    // Trigger webhooks (don't block if it fails)
    try {
      await triggerWebhooks('trade.completed', {
        tradeId: result.updatedTransaction.id,
        userId: user.id,
        trackId,
        type: 'BUY',
        quantity: tokensAmount,
        price: transaction.price,
        totalValue: transaction.totalValue,
        txHash: result.txHash,
      }, user.id);
    } catch (error) {
      console.error('Failed to trigger webhooks:', error);
    }

    // Send email notification (don't block if it fails)
    try {
      await sendTradeConfirmationEmail(
        { email: user.email, name: user.name },
        {
          id: result.updatedTransaction.id,
          type: 'BUY',
          amount: tokensAmount,
          price: transaction.price,
          totalValue: transaction.totalValue,
        },
        {
          id: result.track.id,
          title: result.track.title,
          artistName: result.track.artistName,
          currentPrice: result.track.currentPrice,
        }
      );
    } catch (error) {
      console.error('Failed to send email:', error);
    }

    return NextResponse.json(
      {
        success: true,
        transaction: {
          id: result.updatedTransaction.id,
          trackId: result.updatedTransaction.trackId,
          amount: result.updatedTransaction.amount,
          totalValue: result.updatedTransaction.totalValue,
          txHash: result.txHash,
          status: result.updatedTransaction.status,
        },
        message: `Investimento confirmado! Você agora possui ${tokensAmount} tokens de ${result.track.title}`,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Confirm investment error:', error);

    // Mark transaction as failed
    // Note: This is a simplified error handling. In production, implement retry logic.

    return NextResponse.json(
      {
        error: 'Erro ao processar investimento',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

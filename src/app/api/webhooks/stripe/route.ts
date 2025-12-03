import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe/stripe';
import { prisma } from '@/lib/db/prisma';
import Stripe from 'stripe';

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  try {
    // Stripe webhooks não funcionam em modo mock
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe não configurado' },
        { status: 501 }
      );
    }

    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature found' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.canceled':
        await handlePaymentCanceled(event.data.object as Stripe.PaymentIntent);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('Checkout completed:', session.id);

  // Get transaction by session ID
  const transaction = await prisma.transaction.findFirst({
    where: {
      stripePaymentId: session.id,
    },
    include: {
      track: true,
      user: true,
    },
  });

  if (!transaction) {
    console.error('Transaction not found for session:', session.id);
    return;
  }

  if (transaction.status === 'COMPLETED') {
    console.log('Transaction already completed:', transaction.id);
    return;
  }

  // Use Prisma transaction for atomicity
  try {
    await prisma.$transaction(async (tx) => {
      // Get track with lock
      const track = await tx.track.findUnique({
        where: { id: transaction.trackId },
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

      // Validate supply
      if (track.availableSupply < transaction.amount) {
        throw new Error(`Apenas ${track.availableSupply} tokens disponíveis`);
      }

      // Check if user already holds this track
      const existingHolding = await tx.portfolio.findUnique({
        where: {
          userId_trackId: {
            userId: transaction.userId,
            trackId: transaction.trackId,
          },
        },
      });

      const isNewHolder = !existingHolding;

      // Update track supply and holders
      await tx.track.update({
        where: { id: transaction.trackId },
        data: {
          availableSupply: { decrement: transaction.amount },
          holders: isNewHolder ? { increment: 1 } : undefined,
        },
      });

      // Update or create portfolio
      if (existingHolding) {
        const newAmount = existingHolding.amount + transaction.amount;
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
            userId: transaction.userId,
            trackId: transaction.trackId,
            amount: transaction.amount,
            avgBuyPrice: transaction.price,
            totalInvested: transaction.totalValue,
            currentValue: transaction.amount * track.currentPrice,
            unrealizedPnL: 0,
          },
        });
      }

      // Generate txHash
      const txHash = `0x${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;

      // Update transaction status
      await tx.transaction.update({
        where: { id: transaction.id },
        data: {
          txHash,
          status: 'COMPLETED',
          paymentMethod: session.payment_method_types?.[0] === 'card' ? 'CREDIT_CARD' : 'PIX',
        },
      });

      // Create notification
      await tx.notification.create({
        data: {
          userId: transaction.userId,
          type: 'INVESTMENT_CONFIRMED',
          title: 'Investimento confirmado!',
          message: `Você adquiriu ${transaction.amount} tokens de ${track.title}`,
          link: `/portfolio`,
          read: false,
        },
      });

      console.log('Transaction completed successfully:', transaction.id);
    });
  } catch (error) {
    console.error('Error processing checkout completion:', error);
    // Mark transaction as failed
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: 'FAILED' },
    });
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment succeeded:', paymentIntent.id);

  // Update transaction status
  const transaction = await prisma.transaction.findFirst({
    where: {
      stripePaymentId: paymentIntent.id,
    },
  });

  if (!transaction) {
    console.error('Transaction not found for payment:', paymentIntent.id);
    return;
  }

  // Update payment method based on what was actually used
  const paymentMethodType = (paymentIntent as any).charges?.data[0]?.payment_method_details?.type;
  let paymentMethod = 'PIX';
  if (paymentMethodType === 'card') {
    paymentMethod = 'CREDIT_CARD';
  }

  await prisma.transaction.update({
    where: { id: transaction.id },
    data: {
      paymentMethod: paymentMethod as 'PIX' | 'CREDIT_CARD',
      // Note: Don't mark as COMPLETED here - wait for blockchain confirmation in /confirm endpoint
    },
  });

  console.log('Transaction updated with payment method:', paymentMethod);
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment failed:', paymentIntent.id);

  const transaction = await prisma.transaction.findFirst({
    where: {
      stripePaymentId: paymentIntent.id,
    },
  });

  if (!transaction) {
    console.error('Transaction not found for payment:', paymentIntent.id);
    return;
  }

  await prisma.transaction.update({
    where: { id: transaction.id },
    data: {
      status: 'FAILED',
    },
  });

  console.log('Transaction marked as failed');
}

async function handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment canceled:', paymentIntent.id);

  const transaction = await prisma.transaction.findFirst({
    where: {
      stripePaymentId: paymentIntent.id,
    },
  });

  if (!transaction) {
    console.error('Transaction not found for payment:', paymentIntent.id);
    return;
  }

  await prisma.transaction.update({
    where: { id: transaction.id },
    data: {
      status: 'FAILED',
    },
  });

  console.log('Transaction marked as failed (canceled)');
}

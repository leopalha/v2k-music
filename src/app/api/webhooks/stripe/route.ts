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

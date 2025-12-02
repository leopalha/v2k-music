import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe, STRIPE_CONFIG, STRIPE_MOCK_MODE, createMockPaymentIntent } from '@/lib/stripe/stripe';
import { prisma } from '@/lib/prisma';

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

    const { trackId, amountBRL } = await request.json();

    // Validate input
    if (!trackId || !amountBRL) {
      return NextResponse.json(
        { error: 'trackId e amountBRL são obrigatórios' },
        { status: 400 }
      );
    }

    if (amountBRL < 10) {
      return NextResponse.json(
        { error: 'Investimento mínimo é R$ 10,00' },
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

    // Check KYC status
    if (user.kycStatus !== 'VERIFIED') {
      return NextResponse.json(
        { error: 'Complete seu cadastro (KYC) antes de investir', requiresKyc: true },
        { status: 403 }
      );
    }

    // Fetch track data from Prisma database
    const track = await prisma.track.findUnique({
      where: { id: trackId },
      select: {
        id: true,
        title: true,
        artistName: true,
        currentPrice: true,
        totalSupply: true,
        availableSupply: true,
        status: true,
      }
    });

    if (!track) {
      return NextResponse.json(
        { error: 'Track não encontrada' },
        { status: 404 }
      );
    }

    if (track.status !== 'LIVE') {
      return NextResponse.json(
        { error: 'Track não está disponível para investimento' },
        { status: 400 }
      );
    }

    // Calculate tokens amount
    const tokensAmount = Math.floor(amountBRL / track.currentPrice);

    // Validate sufficient supply
    if (tokensAmount > track.availableSupply) {
      return NextResponse.json(
        {
          error: `Apenas ${track.availableSupply} tokens disponíveis (máx R$ ${(track.availableSupply * track.currentPrice).toFixed(2)})`,
        },
        { status: 400 }
      );
    }

    if (tokensAmount <= 0) {
      return NextResponse.json(
        { error: 'Quantidade de tokens inválida' },
        { status: 400 }
      );
    }

    // Create Stripe Payment Intent (or mock in dev mode)
    const paymentIntent = STRIPE_MOCK_MODE
      ? createMockPaymentIntent({
          amount: Math.round(amountBRL * 100),
          currency: STRIPE_CONFIG.currency,
          metadata: {
            userId: user.id,
            trackId: track.id,
            tokensAmount: tokensAmount.toString(),
            pricePerToken: track.currentPrice.toString(),
          },
          description: `Investimento em ${track.title} - ${track.artistName}`,
        })
      : await stripe!.paymentIntents.create({
          amount: Math.round(amountBRL * 100), // Convert to cents
          currency: STRIPE_CONFIG.currency,
          payment_method_types: [...STRIPE_CONFIG.paymentMethods],
          metadata: {
            userId: user.id,
            trackId: track.id,
            tokensAmount: tokensAmount.toString(),
            pricePerToken: track.currentPrice.toString(),
          },
          description: `Investimento em ${track.title} - ${track.artistName}`,
        });

    // Create pending transaction in database
    await prisma.transaction.create({
      data: {
        type: 'BUY',
        trackId: track.id,
        userId: user.id,
        amount: tokensAmount,
        price: track.currentPrice,
        totalValue: amountBRL,
        fee: amountBRL * 0.025, // 2.5% platform fee
        status: 'PENDING',
        paymentMethod: 'CREDIT_CARD', // Default for Stripe
        stripePaymentId: paymentIntent.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        paymentIntent: {
          id: paymentIntent.id,
          clientSecret: paymentIntent.client_secret,
          amount: paymentIntent.amount,
        },
        investment: {
          trackId: track.id,
          trackTitle: track.title,
          artistName: track.artistName,
          tokensAmount,
          pricePerToken: track.currentPrice,
          totalValue: amountBRL,
        },
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Create investment error:', error);
    return NextResponse.json(
      {
        error: 'Erro ao criar investimento',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

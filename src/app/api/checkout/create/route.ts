import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe, STRIPE_MOCK_MODE } from '@/lib/stripe/stripe';
import { prisma } from '@/lib/prisma';
import { checkCSRF } from '@/lib/csrf';

export async function POST(request: Request) {
  try {
    // CSRF protection (critical financial endpoint)
    const csrfCheck = await checkCSRF(request as any);
    if (!csrfCheck.allowed) {
      return csrfCheck.response;
    }

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

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Check KYC
    if (user.kycStatus !== 'VERIFIED') {
      return NextResponse.json(
        { error: 'Complete seu cadastro (KYC) antes de investir', requiresKyc: true },
        { status: 403 }
      );
    }

    // Fetch track
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

    // Calculate tokens
    const tokensAmount = Math.floor(amountBRL / track.currentPrice);

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

    // If in mock mode, return mock response
    if (STRIPE_MOCK_MODE) {
      const mockPaymentIntent = {
        id: `pi_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        client_secret: `mock_secret_${Date.now()}`,
        amount: Math.round(amountBRL * 100),
      };

      // Create pending transaction
      await prisma.transaction.create({
        data: {
          type: 'BUY',
          trackId: track.id,
          userId: user.id,
          amount: tokensAmount,
          price: track.currentPrice,
          totalValue: amountBRL,
          fee: amountBRL * 0.025,
          status: 'PENDING',
          paymentMethod: 'CREDIT_CARD',
          stripePaymentId: mockPaymentIntent.id,
        },
      });

      return NextResponse.json({
        success: true,
        isMockMode: true,
        paymentIntent: mockPaymentIntent,
        investment: {
          trackId: track.id,
          trackTitle: track.title,
          artistName: track.artistName,
          tokensAmount,
          pricePerToken: track.currentPrice,
          totalValue: amountBRL,
        },
      });
    }

    // PRODUCTION: Create Stripe Checkout Session
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe não configurado. Configure STRIPE_SECRET_KEY no .env' },
        { status: 500 }
      );
    }

    // Create pending transaction first
    const transaction = await prisma.transaction.create({
      data: {
        type: 'BUY',
        trackId: track.id,
        userId: user.id,
        amount: tokensAmount,
        price: track.currentPrice,
        totalValue: amountBRL,
        fee: amountBRL * 0.025,
        status: 'PENDING',
      },
    });

    // Create Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'boleto'], // PIX não disponível no modo test, usar boleto como alternativa
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: `${tokensAmount} tokens - ${track.title}`,
              description: `Investimento em ${track.title} - ${track.artistName}`,
            },
            unit_amount: Math.round(amountBRL * 100), // Centavos
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/portfolio?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/track/${trackId}?payment=cancelled`,
      metadata: {
        userId: user.id,
        trackId: track.id,
        tokensAmount: tokensAmount.toString(),
        pricePerToken: track.currentPrice.toString(),
        transactionId: transaction.id,
      },
      client_reference_id: transaction.id,
    });

    // Update transaction with Stripe session ID
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        stripePaymentId: checkoutSession.id,
      },
    });

    return NextResponse.json({
      success: true,
      isMockMode: false,
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
      investment: {
        trackId: track.id,
        trackTitle: track.title,
        artistName: track.artistName,
        tokensAmount,
        pricePerToken: track.currentPrice,
        totalValue: amountBRL,
      },
    });

  } catch (error) {
    console.error('Create checkout error:', error);
    return NextResponse.json(
      {
        error: 'Erro ao criar checkout',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

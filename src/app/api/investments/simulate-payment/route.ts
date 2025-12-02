import { NextResponse } from 'next/server';
import { STRIPE_MOCK_MODE } from '@/lib/stripe/stripe';

/**
 * DEV ONLY: Simulate successful payment for mock PaymentIntents
 * This endpoint should be removed or protected in production
 */
export async function POST(request: Request) {
  // Only allow in development with mock mode
  if (!STRIPE_MOCK_MODE) {
    return NextResponse.json(
      { error: 'Este endpoint só está disponível em modo de desenvolvimento' },
      { status: 403 }
    );
  }

  try {
    const { paymentIntentId } = await request.json();

    if (!paymentIntentId || !paymentIntentId.startsWith('pi_mock_')) {
      return NextResponse.json(
        { error: 'PaymentIntent ID inválido' },
        { status: 400 }
      );
    }

    // In mock mode, we just return success
    // The actual confirmation happens in /api/investments/confirm
    return NextResponse.json({
      success: true,
      paymentIntent: {
        id: paymentIntentId,
        status: 'succeeded',
      },
      message: 'Pagamento simulado com sucesso (DEV MODE)',
    });
  } catch (error) {
    console.error('Simulate payment error:', error);
    return NextResponse.json(
      { error: 'Erro ao simular pagamento' },
      { status: 500 }
    );
  }
}

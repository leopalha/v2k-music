import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const isDevelopment = process.env.NODE_ENV === 'development';
const isValidStripeKey = STRIPE_SECRET_KEY.startsWith('sk_');

// Use mock mode if no valid Stripe key in development
export const STRIPE_MOCK_MODE = isDevelopment && !isValidStripeKey;

if (STRIPE_MOCK_MODE) {
  console.warn('⚠️  STRIPE MOCK MODE ATIVO - Pagamentos simulados (apenas desenvolvimento)');
}

if (!STRIPE_MOCK_MODE && !STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

export const stripe = STRIPE_MOCK_MODE
  ? null
  : new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2025-11-17.clover',
      typescript: true,
    });

export const STRIPE_CONFIG = {
  currency: 'brl',
  paymentMethods: ['pix', 'card'] as const,
  // Platform fee is handled in smart contract (2.5%)
  // Stripe fee: ~3.5% for cards, ~1% for PIX
};

// Mock PaymentIntent for development
export function createMockPaymentIntent(data: {
  amount: number;
  currency: string;
  metadata: Record<string, string>;
  description: string;
}) {
  const mockId = `pi_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  return {
    id: mockId,
    client_secret: `${mockId}_secret_mock`,
    amount: data.amount,
    currency: data.currency,
    status: 'requires_payment_method' as const,
    metadata: data.metadata,
    description: data.description,
  };
}

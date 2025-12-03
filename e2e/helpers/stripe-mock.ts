import { Page, Route } from '@playwright/test';

/**
 * Mock Stripe API calls for payment testing
 */
export async function mockStripePayment(page: Page) {
  // Mock Stripe checkout session creation
  await page.route('**/api/payments/create-checkout', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        sessionId: 'cs_test_mock_session_id',
        url: 'https://checkout.stripe.com/mock',
      }),
    });
  });

  // Mock Stripe payment intent
  await page.route('**/api/payments/intent', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        clientSecret: 'pi_test_mock_client_secret',
      }),
    });
  });

  // Mock Stripe webhook (payment success)
  await page.route('**/api/webhooks/stripe', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ received: true }),
    });
  });
}

/**
 * Simulate successful Stripe payment
 */
export async function simulateSuccessfulPayment(page: Page, amount: number) {
  // Mock payment confirmation
  await page.evaluate(
    ({ amount }) => {
      // @ts-ignore - mock window.stripe
      window.mockStripePaymentSuccess = { amount, status: 'succeeded' };
    },
    { amount }
  );
}

/**
 * Mock Resend email API for notification testing
 */
export async function mockResendEmail(page: Page) {
  await page.route('**/api/emails/send', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'email_test_mock_id',
        sent: true,
      }),
    });
  });
}

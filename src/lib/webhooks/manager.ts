import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export type WebhookEvent =
  | 'trade.completed'
  | 'trade.failed'
  | 'alert.triggered'
  | 'royalty.claimed'
  | 'portfolio.updated'
  | 'user.kyc.approved'
  | 'user.kyc.rejected';

interface WebhookPayload {
  event: WebhookEvent;
  timestamp: string;
  data: any;
}

/**
 * Sign webhook payload with HMAC SHA256
 */
export function signPayload(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

/**
 * Verify webhook signature
 */
export function verifySignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = signPayload(payload, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Trigger webhooks for a specific event
 */
export async function triggerWebhooks(
  event: WebhookEvent,
  data: any,
  userId?: string
) {
  try {
    // Find webhooks subscribed to this event
    const where: any = {
      isActive: true,
      events: {
        has: event,
      },
    };

    if (userId) {
      where.userId = userId;
    }

    const webhooks = await prisma.webhook.findMany({ where });

    if (webhooks.length === 0) {
      return;
    }

    // Trigger all webhooks in parallel
    const deliveries = webhooks.map((webhook) =>
      deliverWebhook(webhook.id, event, data)
    );

    await Promise.allSettled(deliveries);
  } catch (error) {
    console.error('[WEBHOOKS] Failed to trigger webhooks:', error);
  }
}

/**
 * Deliver webhook to endpoint
 */
async function deliverWebhook(
  webhookId: string,
  event: WebhookEvent,
  data: any,
  attempt = 1
): Promise<void> {
  const startTime = Date.now();

  try {
    const webhook = await prisma.webhook.findUnique({
      where: { id: webhookId },
    });

    if (!webhook || !webhook.isActive) {
      return;
    }

    // Create payload
    const payload: WebhookPayload = {
      event,
      timestamp: new Date().toISOString(),
      data,
    };

    const payloadString = JSON.stringify(payload);
    const signature = signPayload(payloadString, webhook.secret);

    // Send webhook
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-V2K-Signature': signature,
        'X-V2K-Event': event,
        'X-V2K-Delivery-Attempt': attempt.toString(),
        'User-Agent': 'V2K-Webhooks/1.0',
      },
      body: payloadString,
      signal: AbortSignal.timeout(10000), // 10s timeout
    });

    const duration = Date.now() - startTime;
    const responseText = await response.text().catch(() => '');

    // Create delivery record
    await prisma.webhookDelivery.create({
      data: {
        webhookId,
        event,
        payload: payload as any,
        response: responseText.substring(0, 1000), // Limit response size
        statusCode: response.status,
        success: response.ok,
        attempt,
        duration,
      },
    });

    // Update webhook stats
    if (response.ok) {
      await prisma.webhook.update({
        where: { id: webhookId },
        data: {
          lastTriggeredAt: new Date(),
          failureCount: 0,
        },
      });
    } else {
      // Increment failure count
      await prisma.webhook.update({
        where: { id: webhookId },
        data: {
          failureCount: { increment: 1 },
          lastFailedAt: new Date(),
        },
      });

      // Retry with exponential backoff (max 3 attempts)
      if (attempt < 3) {
        const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        setTimeout(() => {
          deliverWebhook(webhookId, event, data, attempt + 1);
        }, delay);
      } else {
        // Disable webhook after 3 failed attempts
        const webhook = await prisma.webhook.findUnique({
          where: { id: webhookId },
        });
        if (webhook && webhook.failureCount >= 10) {
          await prisma.webhook.update({
            where: { id: webhookId },
            data: { isActive: false },
          });
        }
      }
    }
  } catch (error: any) {
    const duration = Date.now() - startTime;

    // Create failed delivery record
    await prisma.webhookDelivery.create({
      data: {
        webhookId,
        event,
        payload: { event, data } as any,
        success: false,
        attempt,
        errorMessage: error.message?.substring(0, 500) || 'Unknown error',
        duration,
      },
    });

    // Update failure count
    await prisma.webhook.update({
      where: { id: webhookId },
      data: {
        failureCount: { increment: 1 },
        lastFailedAt: new Date(),
      },
    });

    // Retry logic
    if (attempt < 3) {
      const delay = Math.pow(2, attempt) * 1000;
      setTimeout(() => {
        deliverWebhook(webhookId, event, data, attempt + 1);
      }, delay);
    }
  }
}

/**
 * Retry a failed webhook delivery
 */
export async function retryWebhookDelivery(deliveryId: string): Promise<void> {
  const delivery = await prisma.webhookDelivery.findUnique({
    where: { id: deliveryId },
    include: { webhook: true },
  });

  if (!delivery || !delivery.webhook) {
    throw new Error('Delivery not found');
  }

  if (delivery.success) {
    throw new Error('Delivery already successful');
  }

  await deliverWebhook(
    delivery.webhookId,
    delivery.event as WebhookEvent,
    delivery.payload,
    delivery.attempt + 1
  );
}

/**
 * Generate a secure webhook secret
 */
export function generateWebhookSecret(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Test a webhook by sending a test event
 */
export async function testWebhook(webhookId: string): Promise<boolean> {
  try {
    await deliverWebhook(webhookId, 'trade.completed', {
      test: true,
      message: 'This is a test webhook delivery',
      timestamp: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.error('[WEBHOOKS] Test failed:', error);
    return false;
  }
}

/**
 * Pusher Server Instance
 * Real-time communication server-side
 */

import Pusher from 'pusher';

// Check if Pusher is configured
const isPusherConfigured = Boolean(
  process.env.PUSHER_APP_ID &&
  process.env.PUSHER_KEY &&
  process.env.PUSHER_SECRET &&
  process.env.PUSHER_CLUSTER
);

// Create Pusher instance if configured
export const pusher = isPusherConfigured
  ? new Pusher({
      appId: process.env.PUSHER_APP_ID!,
      key: process.env.PUSHER_KEY!,
      secret: process.env.PUSHER_SECRET!,
      cluster: process.env.PUSHER_CLUSTER!,
      useTLS: true,
    })
  : null;

/**
 * Trigger event on Pusher channel
 * Graceful fallback if Pusher not configured
 */
export async function triggerPusherEvent(
  channel: string,
  event: string,
  data: any
): Promise<boolean> {
  if (!pusher) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[PUSHER] Not configured. Event not sent:', { channel, event });
    }
    return false;
  }

  try {
    await pusher.trigger(channel, event, data);
    return true;
  } catch (error) {
    console.error('[PUSHER] Error triggering event:', error);
    return false;
  }
}

/**
 * Trigger multiple events in batch
 */
export async function triggerPusherBatch(
  batch: Array<{ channel: string; name: string; data: any }>
): Promise<boolean> {
  if (!pusher) return false;

  try {
    await pusher.triggerBatch(batch);
    return true;
  } catch (error) {
    console.error('[PUSHER] Error triggering batch:', error);
    return false;
  }
}

export { isPusherConfigured };

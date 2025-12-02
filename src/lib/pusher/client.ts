/**
 * Pusher Client Instance
 * Real-time communication client-side (browser)
 */

'use client';

import PusherJS from 'pusher-js';
import type { Channel } from 'pusher-js';

// Check if Pusher is configured
const isPusherConfigured = Boolean(
  process.env.NEXT_PUBLIC_PUSHER_KEY &&
  process.env.NEXT_PUBLIC_PUSHER_CLUSTER
);

// Create Pusher client instance
export const pusherClient = isPusherConfigured
  ? new PusherJS(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    })
  : null;

/**
 * Subscribe to a channel
 */
export function subscribeToChannel(channelName: string): Channel | null {
  if (!pusherClient) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[PUSHER] Client not configured. Cannot subscribe to:', channelName);
    }
    return null;
  }

  return pusherClient.subscribe(channelName);
}

/**
 * Unsubscribe from a channel
 */
export function unsubscribeFromChannel(channelName: string): void {
  if (!pusherClient) return;
  pusherClient.unsubscribe(channelName);
}

/**
 * Bind event to channel
 */
export function bindChannelEvent(
  channel: Channel | null,
  event: string,
  callback: (data: any) => void
): void {
  if (!channel) return;
  channel.bind(event, callback);
}

/**
 * Unbind event from channel
 */
export function unbindChannelEvent(
  channel: Channel | null,
  event: string,
  callback?: (data: any) => void
): void {
  if (!channel) return;
  channel.unbind(event, callback);
}

export { isPusherConfigured };

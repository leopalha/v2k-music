/**
 * useTradingFeed Hook
 * Real-time trading feed updates
 */

'use client';

import { useEffect, useState } from 'react';
import { subscribeToChannel, unsubscribeFromChannel, bindChannelEvent, unbindChannelEvent } from '@/lib/pusher/client';
import type { Channel } from 'pusher-js';

export interface TradeEvent {
  id: string;
  userId: string;
  userName: string;
  trackId: string;
  trackTitle: string;
  artist: string;
  type: 'BUY' | 'SELL';
  amount: number;
  price: number;
  timestamp: string;
}

export function useTradingFeed(maxItems = 20) {
  const [trades, setTrades] = useState<TradeEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const channelName = 'trading-feed';
    let channel: Channel | null = null;

    try {
      channel = subscribeToChannel(channelName);
      
      if (channel) {
        setIsConnected(true);

        const handleTradeExecuted = (data: TradeEvent) => {
          setTrades((prev) => {
            const newTrades = [data, ...prev];
            return newTrades.slice(0, maxItems);
          });
        };

        bindChannelEvent(channel, 'trade-executed', handleTradeExecuted);

        return () => {
          unbindChannelEvent(channel, 'trade-executed', handleTradeExecuted);
          unsubscribeFromChannel(channelName);
        };
      } else {
        setIsConnected(false);
      }
    } catch (error) {
      console.error('[useTradingFeed] Error:', error);
      setIsConnected(false);
    }
  }, [maxItems]);

  return { trades, isConnected };
}

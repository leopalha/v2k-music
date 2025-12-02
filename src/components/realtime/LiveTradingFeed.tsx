'use client';

import { useTradingFeed } from '@/hooks/useTradingFeed';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Wifi, WifiOff } from 'lucide-react';

export default function LiveTradingFeed() {
  const { trades, isConnected } = useTradingFeed(15);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Live Trading Feed</span>
          {isConnected ? (
            <Badge variant="success" className="flex items-center gap-1">
              <Wifi className="h-3 w-3" />
              Live
            </Badge>
          ) : (
            <Badge variant="secondary" className="flex items-center gap-1">
              <WifiOff className="h-3 w-3" />
              Offline
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isConnected && (
          <div className="text-sm text-muted-foreground mb-4 p-3 bg-secondary rounded">
            Real-time updates unavailable. Configure Pusher to enable live feed.
          </div>
        )}

        {trades.length === 0 && isConnected && (
          <div className="text-center text-muted-foreground py-8">
            Waiting for trades...
          </div>
        )}

        {trades.length === 0 && !isConnected && (
          <div className="text-center text-muted-foreground py-8">
            No recent trades
          </div>
        )}

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {trades.map((trade) => (
            <div
              key={trade.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-secondary/50 transition-colors animate-in fade-in slide-in-from-top-2 duration-300"
            >
              <div className="flex items-center gap-3">
                {trade.type === 'BUY' ? (
                  <TrendingUp className="h-5 w-5 text-green-500" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-500" />
                )}
                <div>
                  <div className="font-medium text-sm">
                    {trade.trackTitle}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {trade.artist} • {trade.userName}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <Badge
                  variant={trade.type === 'BUY' ? 'success' : 'error'}
                >
                  {trade.type}
                </Badge>
                <div className="text-sm font-medium mt-1">
                  R$ {(trade.amount / 100).toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(trade.timestamp).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

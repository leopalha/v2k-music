"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui";
import { Clock, X, Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface LimitOrder {
  id: string;
  type: "BUY" | "SELL";
  status: "PENDING" | "FILLED" | "CANCELLED" | "EXPIRED";
  price: number;
  quantity: number;
  filled: number;
  track: {
    id: string;
    title: string;
    artistName: string;
    coverUrl: string;
    currentPrice: number;
  };
  createdAt: string;
  expiresAt?: string;
}

export function LimitOrdersSection() {
  const [orders, setOrders] = useState<LimitOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/limit-orders?status=PENDING");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error("Error loading limit orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelOrder = async (orderId: string) => {
    try {
      setCancellingId(orderId);
      const res = await fetch(`/api/limit-orders/${orderId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        // Remove from list
        setOrders(orders.filter((o) => o.id !== orderId));
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
    } finally {
      setCancellingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-bg-secondary rounded-xl border border-border-primary p-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-text-tertiary mx-auto" />
        <p className="text-text-secondary mt-3">Carregando ordens...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div
        className="bg-bg-secondary rounded-xl border border-border-primary p-8 text-center"
        data-testid="empty-orders"
      >
        <Clock className="w-12 h-12 text-text-tertiary mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          Nenhuma ordem pendente
        </h3>
        <p className="text-text-secondary">
          Suas ordens limitadas aparecerão aqui quando forem criadas
        </p>
      </div>
    );
  }

  return (
    <div className="bg-bg-secondary rounded-xl border border-border-primary overflow-hidden" data-testid="orders-section">
      <div className="p-6 border-b border-border-subtle">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">
              Ordens Limitadas
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              {orders.length} {orders.length === 1 ? "ordem pendente" : "ordens pendentes"}
            </p>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="divide-y divide-border-subtle">
        {orders.map((order) => {
          const isAboveMarket = order.price > order.track.currentPrice;
          const priceDiff = ((order.price - order.track.currentPrice) / order.track.currentPrice) * 100;
          const isCancelling = cancellingId === order.id;

          return (
            <div
              key={order.id}
              className="p-6 hover:bg-bg-elevated transition-colors"
              data-testid="order-item"
            >
              <div className="flex items-center gap-4">
                {/* Track Cover */}
                <div className="w-16 h-16 rounded-lg bg-bg-tertiary overflow-hidden flex-shrink-0">
                  {order.track.coverUrl ? (
                    <img
                      src={order.track.coverUrl}
                      alt={order.track.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20" />
                  )}
                </div>

                {/* Order Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        order.type === "BUY"
                          ? "bg-accent-green/10 text-accent-green"
                          : "bg-accent-orange/10 text-accent-orange"
                      }`}
                    >
                      {order.type === "BUY" ? "Compra" : "Venda"}
                    </span>
                    <h3 className="font-semibold text-text-primary truncate">
                      {order.track.title}
                    </h3>
                  </div>
                  <p className="text-sm text-text-secondary truncate">
                    {order.track.artistName}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-text-tertiary">
                    <span>
                      {order.quantity} tokens @ {formatCurrency(order.price)}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      {isAboveMarket ? (
                        <TrendingUp className="w-3 h-3 text-accent-green" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-accent-red" />
                      )}
                      {Math.abs(priceDiff).toFixed(1)}% {isAboveMarket ? "acima" : "abaixo"} do mercado
                    </span>
                  </div>
                </div>

                {/* Current Price & Actions */}
                <div className="text-right">
                  <p className="text-sm text-text-secondary mb-1">Preço atual</p>
                  <p className="text-lg font-semibold text-text-primary mb-3">
                    {formatCurrency(order.track.currentPrice)}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => cancelOrder(order.id)}
                    disabled={isCancelling}
                    className="border-error text-error hover:bg-error/10"
                  >
                    {isCancelling ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <X className="w-4 h-4 mr-2" />
                        Cancelar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

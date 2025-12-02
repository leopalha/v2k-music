"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  TrendingUp,
  TrendingDown,
  X,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";

interface LimitOrder {
  id: string;
  orderType: "BUY" | "SELL";
  targetPrice: number;
  amount: number;
  status: "PENDING" | "EXECUTED" | "CANCELLED" | "EXPIRED" | "FAILED";
  expiresAt: string | null;
  executedAt: string | null;
  executedPrice: number | null;
  createdAt: string;
  track: {
    id: string;
    title: string;
    artistName: string;
    coverUrl: string;
    currentPrice: number;
  };
}

interface LimitOrdersListProps {
  trackId?: string;
  onOrderCancelled?: () => void;
}

export function LimitOrdersList({ trackId, onOrderCancelled }: LimitOrdersListProps) {
  const [orders, setOrders] = useState<LimitOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "PENDING" | "EXECUTED">("all");

  useEffect(() => {
    loadOrders();
  }, [trackId]);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (trackId) params.append("trackId", trackId);

      const res = await fetch(`/api/limit-orders?${params.toString()}`);
      const data = await res.json();

      if (res.ok) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error("Error loading limit orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/limit-orders/${orderId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      toast.success("Ordem cancelada com sucesso");
      loadOrders();
      onOrderCancelled?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao cancelar ordem");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="w-4 h-4 text-accent" />;
      case "EXECUTED":
        return <CheckCircle className="w-4 h-4 text-success" />;
      case "CANCELLED":
        return <XCircle className="w-4 h-4 text-text-tertiary" />;
      case "EXPIRED":
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      case "FAILED":
        return <XCircle className="w-4 h-4 text-error" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Pendente";
      case "EXECUTED":
        return "Executada";
      case "CANCELLED":
        return "Cancelada";
      case "EXPIRED":
        return "Expirada";
      case "FAILED":
        return "Falhou";
      default:
        return status;
    }
  };

  const filteredOrders =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  if (isLoading) {
    return (
      <div className="text-center py-8 text-text-tertiary">
        Carregando ordens...
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="w-12 h-12 text-text-tertiary mx-auto mb-3" />
        <p className="text-text-secondary">Nenhuma ordem limitada criada</p>
        <p className="text-sm text-text-tertiary mt-1">
          Crie ordens para comprar ou vender automaticamente ao atingir um preço alvo
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setFilter("all")}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            filter === "all"
              ? "bg-primary-400 text-white"
              : "bg-bg-elevated text-text-tertiary hover:text-text-primary"
          )}
        >
          Todas ({orders.length})
        </button>
        <button
          onClick={() => setFilter("PENDING")}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            filter === "PENDING"
              ? "bg-primary-400 text-white"
              : "bg-bg-elevated text-text-tertiary hover:text-text-primary"
          )}
        >
          Ativas ({orders.filter((o) => o.status === "PENDING").length})
        </button>
        <button
          onClick={() => setFilter("EXECUTED")}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            filter === "EXECUTED"
              ? "bg-primary-400 text-white"
              : "bg-bg-elevated text-text-tertiary hover:text-text-primary"
          )}
        >
          Executadas ({orders.filter((o) => o.status === "EXECUTED").length})
        </button>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filteredOrders.map((order) => {
          const priceDiff =
            ((order.targetPrice - order.track.currentPrice) /
              order.track.currentPrice) *
            100;
          const totalValue = order.targetPrice * order.amount;

          return (
            <div
              key={order.id}
              className="bg-bg-elevated border border-border-subtle rounded-lg p-4 hover:border-border-hover transition-colors"
            >
              <div className="flex items-start gap-3">
                {/* Track Image */}
                {!trackId && (
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-bg-secondary flex-shrink-0">
                    {order.track.coverUrl ? (
                      <Image
                        src={order.track.coverUrl}
                        alt={order.track.title}
                        width={48}
                        height={48}
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary-400 to-secondary-400" />
                    )}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  {/* Track Info */}
                  {!trackId && (
                    <div className="mb-2">
                      <h4 className="font-medium text-text-primary truncate">
                        {order.track.title}
                      </h4>
                      <p className="text-xs text-text-tertiary truncate">
                        {order.track.artistName}
                      </p>
                    </div>
                  )}

                  {/* Order Details */}
                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Order Type */}
                    <div
                      className={cn(
                        "flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium",
                        order.orderType === "BUY"
                          ? "bg-success/10 text-success"
                          : "bg-error/10 text-error"
                      )}
                    >
                      {order.orderType === "BUY" ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {order.orderType === "BUY" ? "COMPRA" : "VENDA"}
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-bg-secondary rounded text-xs">
                      {getStatusIcon(order.status)}
                      {getStatusLabel(order.status)}
                    </div>

                    {/* Amount */}
                    <span className="text-xs text-text-tertiary">
                      {order.amount} tokens
                    </span>
                  </div>

                  {/* Price Info */}
                  <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-xs text-text-tertiary">Preço Alvo</div>
                      <div className="font-medium text-text-primary">
                        R$ {order.targetPrice.toFixed(4)}
                      </div>
                      <div
                        className={cn(
                          "text-xs",
                          priceDiff > 0 ? "text-success" : "text-error"
                        )}
                      >
                        {priceDiff > 0 ? "+" : ""}
                        {priceDiff.toFixed(1)}%
                      </div>
                    </div>

                    {order.status === "EXECUTED" && order.executedPrice ? (
                      <div>
                        <div className="text-xs text-text-tertiary">
                          Preço Executado
                        </div>
                        <div className="font-medium text-text-primary">
                          R$ {order.executedPrice.toFixed(4)}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-xs text-text-tertiary">Valor Total</div>
                        <div className="font-medium text-text-primary">
                          R$ {totalValue.toFixed(2)}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Expiration */}
                  {order.expiresAt && order.status === "PENDING" && (
                    <div className="mt-2 text-xs text-text-tertiary">
                      Expira em{" "}
                      {new Date(order.expiresAt).toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  )}
                </div>

                {/* Cancel Button */}
                {order.status === "PENDING" && (
                  <button
                    onClick={() => handleCancelOrder(order.id)}
                    className="p-2 hover:bg-bg-secondary rounded-lg transition-colors text-text-tertiary hover:text-error"
                    title="Cancelar ordem"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

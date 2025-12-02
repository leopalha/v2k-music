"use client";

import { useState } from "react";
import { X, TrendingUp, TrendingDown, Calendar, AlertCircle } from "lucide-react";
import { Button, Modal, Input } from "@/components/ui";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";

interface LimitOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  trackId: string;
  trackTitle: string;
  currentPrice: number;
  userBalance: number;
  userTokens?: number;
  onOrderCreated?: () => void;
}

type OrderType = "BUY" | "SELL";

export function LimitOrderModal({
  isOpen,
  onClose,
  trackId,
  trackTitle,
  currentPrice,
  userBalance,
  userTokens = 0,
  onOrderCreated,
}: LimitOrderModalProps) {
  const [orderType, setOrderType] = useState<OrderType>("BUY");
  const [targetPrice, setTargetPrice] = useState("");
  const [amount, setAmount] = useState("");
  const [expiresIn, setExpiresIn] = useState<string>("24h");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!targetPrice || !amount) {
      toast.error("Preencha todos os campos");
      return;
    }

    const targetPriceNum = parseFloat(targetPrice);
    const amountNum = parseInt(amount);

    if (targetPriceNum <= 0 || amountNum <= 0) {
      toast.error("Valores devem ser maiores que zero");
      return;
    }

    // Validate SELL orders
    if (orderType === "SELL" && amountNum > userTokens) {
      toast.error("Você não possui tokens suficientes");
      return;
    }

    // Validate BUY orders
    if (orderType === "BUY") {
      const estimatedCost = targetPriceNum * amountNum;
      if (estimatedCost > userBalance) {
        toast.error("Saldo insuficiente para esta ordem");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Calculate expiration date
      let expiresAt: Date | null = null;
      if (expiresIn !== "never") {
        const hours = parseInt(expiresIn);
        expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + hours);
      }

      const res = await fetch("/api/limit-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackId,
          orderType,
          targetPrice: targetPriceNum,
          amount: amountNum,
          expiresAt,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao criar ordem");
      }

      toast.success(
        `Ordem ${orderType === "BUY" ? "de compra" : "de venda"} criada com sucesso!`
      );

      // Reset form
      setTargetPrice("");
      setAmount("");
      setExpiresIn("24h");

      onOrderCreated?.();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao criar ordem");
    } finally {
      setIsSubmitting(false);
    }
  };

  const estimatedTotal = targetPrice && amount
    ? parseFloat(targetPrice) * parseInt(amount)
    : 0;

  const priceDifference = targetPrice
    ? ((parseFloat(targetPrice) - currentPrice) / currentPrice) * 100
    : 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" title="Ordem Limitada">
      <div className="bg-bg-secondary rounded-xl border border-border-default max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-subtle">
          <div>
            <h2 className="text-xl font-bold text-text-primary">Ordem Limitada</h2>
            <p className="text-sm text-text-tertiary mt-1">{trackTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-bg-elevated rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-text-tertiary" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Order Type Tabs */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            <button
              type="button"
              onClick={() => setOrderType("BUY")}
              className={cn(
                "px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2",
                orderType === "BUY"
                  ? "bg-success text-white"
                  : "bg-bg-elevated text-text-tertiary hover:text-text-primary"
              )}
            >
              <TrendingUp className="w-5 h-5" />
              Comprar
            </button>
            <button
              type="button"
              onClick={() => setOrderType("SELL")}
              className={cn(
                "px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2",
                orderType === "SELL"
                  ? "bg-error text-white"
                  : "bg-bg-elevated text-text-tertiary hover:text-text-primary"
              )}
            >
              <TrendingDown className="w-5 h-5" />
              Vender
            </button>
          </div>

          {/* Current Price Info */}
          <div className="bg-bg-elevated border border-border-subtle rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-tertiary">Preço Atual</span>
              <span className="text-lg font-bold text-text-primary">
                R$ {currentPrice.toFixed(4)}
              </span>
            </div>
          </div>

          {/* Target Price */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Preço Alvo (R$)
            </label>
            <Input
              type="number"
              step="0.0001"
              min="0.0001"
              value={targetPrice}
              onChange={(value) => setTargetPrice(value)}
              placeholder="0.0000"
              className="w-full"
            />
            {targetPrice && (
              <p
                className={cn(
                  "text-xs mt-1 flex items-center gap-1",
                  priceDifference > 0 ? "text-success" : "text-error"
                )}
              >
                {priceDifference > 0 ? "+" : ""}
                {priceDifference.toFixed(2)}% do preço atual
              </p>
            )}
          </div>

          {/* Amount */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Quantidade (tokens)
            </label>
            <Input
              type="number"
              step="1"
              min="1"
              value={amount}
              onChange={(value) => setAmount(value)}
              placeholder="0"
              className="w-full"
            />
            {orderType === "SELL" && (
              <p className="text-xs text-text-tertiary mt-1">
                Disponível: {userTokens} tokens
              </p>
            )}
          </div>

          {/* Expiration */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-text-secondary mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Expira em
            </label>
            <select
              value={expiresIn}
              onChange={(e) => setExpiresIn(e.target.value)}
              className="w-full px-3 py-2 bg-bg-elevated border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-400"
            >
              <option value="1">1 hora</option>
              <option value="6">6 horas</option>
              <option value="24">24 horas</option>
              <option value="72">3 dias</option>
              <option value="168">7 dias</option>
              <option value="never">Nunca</option>
            </select>
          </div>

          {/* Estimated Total */}
          {estimatedTotal > 0 && (
            <div className="bg-bg-elevated border border-border-subtle rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-text-tertiary">Total Estimado</span>
                <span className="text-lg font-bold text-text-primary">
                  R$ {estimatedTotal.toFixed(2)}
                </span>
              </div>
              {orderType === "BUY" && (
                <p className="text-xs text-text-tertiary">
                  Saldo disponível: R$ {userBalance.toFixed(2)}
                </p>
              )}
            </div>
          )}

          {/* Warning */}
          <div className="bg-accent/10 border border-accent/30 rounded-lg p-3 mb-6">
            <div className="flex gap-2">
              <AlertCircle className="w-5 h-5 text-accent flex-shrink-0" />
              <p className="text-xs text-text-secondary">
                Sua ordem será executada automaticamente quando o preço atingir o valor
                alvo. Ordens de compra executam quando o preço cai ao alvo ou abaixo.
                Ordens de venda executam quando o preço sobe ao alvo ou acima.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              disabled={isSubmitting || !targetPrice || !amount}
            >
              {isSubmitting ? "Criando..." : "Criar Ordem"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

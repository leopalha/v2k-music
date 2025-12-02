"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { formatEther, parseEther } from "viem";
import { X, Minus, Plus, Loader2, CheckCircle, AlertCircle, ExternalLink } from "lucide-react";
import { Button, Modal } from "@/components/ui";
import { ConnectWallet } from "@/components/web3";
import { usePurchaseTokens, useAvailableTokens, useTokenBalance } from "@/hooks";

interface BuyTokensModalProps {
  isOpen: boolean;
  onClose: () => void;
  track: {
    id: number;
    title: string;
    artist: string;
    pricePerToken: bigint;
    coverUrl?: string;
  };
}

export function BuyTokensModal({ isOpen, onClose, track }: BuyTokensModalProps) {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState(10);

  const { data: availableTokens } = useAvailableTokens(track.id);
  const { data: userBalance } = useTokenBalance(track.id);
  const { purchase, isPending, isConfirming, isSuccess, hash, error } = usePurchaseTokens();

  const totalCost = track.pricePerToken * BigInt(amount);
  const maxTokens = availableTokens ? Number(availableTokens) : 0;

  useEffect(() => {
    if (isSuccess) {
      // Reset after successful purchase
      setTimeout(() => {
        setAmount(10);
      }, 3000);
    }
  }, [isSuccess]);

  const handleAmountChange = (newAmount: number) => {
    if (newAmount >= 1 && newAmount <= Math.min(maxTokens, 10000)) {
      setAmount(newAmount);
    }
  };

  const handlePurchase = () => {
    if (!isConnected) return;
    purchase(track.id, amount, track.pricePerToken);
  };

  const quickAmounts = [10, 50, 100, 500];

  return (
    <Modal title="Buy Tokens" isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-md">

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Track Info */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-bg-tertiary rounded-lg overflow-hidden">
              {track.coverUrl ? (
                <img
                  src={track.coverUrl}
                  alt={track.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary to-secondary" />
              )}
            </div>
            <div>
              <h3 className="font-semibold">{track.title}</h3>
              <p className="text-sm text-text-secondary">{track.artist}</p>
              <p className="text-sm text-text-tertiary mt-1">
                {formatEther(track.pricePerToken)} MATIC per token
              </p>
            </div>
          </div>

          {/* Amount Selector */}
          <div className="space-y-3">
            <label className="text-sm text-text-secondary">Amount</label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleAmountChange(amount - 1)}
                disabled={amount <= 1}
                className="p-2 bg-bg-tertiary rounded-lg hover:bg-bg-elevated disabled:opacity-50 transition-colors"
              >
                <Minus className="w-5 h-5" />
              </button>
              <input
                type="number"
                value={amount}
                onChange={(e) => handleAmountChange(parseInt(e.target.value) || 1)}
                className="flex-1 text-center text-2xl font-bold bg-transparent border-none outline-none"
              />
              <button
                onClick={() => handleAmountChange(amount + 1)}
                disabled={amount >= maxTokens}
                className="p-2 bg-bg-tertiary rounded-lg hover:bg-bg-elevated disabled:opacity-50 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Select */}
            <div className="flex gap-2">
              {quickAmounts.map((qty) => (
                <button
                  key={qty}
                  onClick={() => handleAmountChange(qty)}
                  disabled={qty > maxTokens}
                  className={`flex-1 py-2 text-sm rounded-lg transition-colors ${
                    amount === qty
                      ? "bg-primary text-white"
                      : "bg-bg-tertiary hover:bg-bg-elevated disabled:opacity-50"
                  }`}
                >
                  {qty}
                </button>
              ))}
            </div>

            <p className="text-xs text-text-tertiary text-center">
              {maxTokens.toLocaleString()} tokens available
            </p>
          </div>

          {/* Summary */}
          <div className="bg-bg-tertiary rounded-xl p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Price per token</span>
              <span>{formatEther(track.pricePerToken)} MATIC</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Quantity</span>
              <span>{amount} tokens</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Platform fee (2.5%)</span>
              <span>{formatEther((totalCost * BigInt(25)) / BigInt(1000))} MATIC</span>
            </div>
            <div className="h-px bg-border-primary" />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span className="text-primary">{formatEther(totalCost)} MATIC</span>
            </div>
          </div>

          {/* Your Balance */}
          {isConnected && userBalance !== undefined && (
            <div className="text-sm text-text-secondary text-center">
              You own: <span className="font-medium text-text-primary">{userBalance.toString()}</span> tokens of this track
            </div>
          )}

          {/* Transaction Status */}
          {(isPending || isConfirming) && (
            <div className="flex items-center gap-3 p-3 bg-primary/10 border border-primary/20 rounded-xl">
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
              <span className="text-sm">
                {isPending ? "Confirm in wallet..." : "Processing transaction..."}
              </span>
            </div>
          )}

          {isSuccess && hash && (
            <div className="flex items-center gap-3 p-3 bg-accent-green/10 border border-accent-green/20 rounded-xl">
              <CheckCircle className="w-5 h-5 text-accent-green" />
              <div className="flex-1">
                <span className="text-sm">Purchase successful!</span>
                <a
                  href={`https://polygonscan.com/tx/${hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-primary mt-1"
                >
                  View transaction <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-3 p-3 bg-accent-red/10 border border-accent-red/20 rounded-xl">
              <AlertCircle className="w-5 h-5 text-accent-red" />
              <span className="text-sm text-accent-red">
                {error.message.includes("insufficient")
                  ? "Insufficient balance"
                  : "Transaction failed"}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border-primary">
          {isConnected ? (
            <Button
              onClick={handlePurchase}
              disabled={isPending || isConfirming || amount < 1 || amount > maxTokens}
              className="w-full"
            >
              {isPending || isConfirming ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {isPending
                ? "Confirm in Wallet"
                : isConfirming
                ? "Processing..."
                : `Buy ${amount} Tokens`}
            </Button>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <p className="text-sm text-text-secondary">Connect your wallet to purchase</p>
              <ConnectWallet />
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

"use client";

import { useState } from "react";
import { Modal, Button, Input } from "@/components/ui";
import { Bell, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";

interface CreatePriceAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  track: {
    id: string;
    title: string;
    artistName: string;
    currentPrice: number;
    coverUrl?: string;
  };
  onSuccess?: () => void;
}

export function CreatePriceAlertModal({
  isOpen,
  onClose,
  track,
  onSuccess,
}: CreatePriceAlertModalProps) {
  const [targetPrice, setTargetPrice] = useState(track.currentPrice.toString());
  const [condition, setCondition] = useState<"ABOVE" | "BELOW">("ABOVE");
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyPush, setNotifyPush] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const price = parseFloat(targetPrice);

    // Validation
    if (isNaN(price) || price <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    if (condition === "ABOVE" && price <= track.currentPrice) {
      toast.error("Target price must be higher than current price for ABOVE alerts");
      return;
    }

    if (condition === "BELOW" && price >= track.currentPrice) {
      toast.error("Target price must be lower than current price for BELOW alerts");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackId: track.id,
          targetPrice: price,
          condition,
          notifyEmail,
          notifyPush,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create alert");
      }

      toast.success("Price alert created successfully!");
      onSuccess?.();
      onClose();

      // Reset form
      setTargetPrice(track.currentPrice.toString());
      setCondition("ABOVE");
    } catch (error) {
      console.error("Error creating alert:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create alert");
    } finally {
      setIsLoading(false);
    }
  };

  const priceDiff = parseFloat(targetPrice) - track.currentPrice;
  const percentDiff = ((priceDiff / track.currentPrice) * 100).toFixed(1);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Price Alert"
      size="md"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Track Info */}
        <div className="flex items-center gap-4 p-4 bg-bg-tertiary rounded-lg">
          {track.coverUrl && (
            <img
              src={track.coverUrl}
              alt={track.title}
              className="w-16 h-16 rounded-lg object-cover"
            />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-text-primary truncate">
              {track.title}
            </h3>
            <p className="text-sm text-text-secondary truncate">
              {track.artistName}
            </p>
            <p className="text-sm text-text-tertiary mt-1">
              Current: R$ {track.currentPrice.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Condition Selection */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-3">
            Alert me when price goes
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setCondition("ABOVE")}
              className={`p-4 rounded-lg border-2 transition-all ${
                condition === "ABOVE"
                  ? "border-success bg-success/10"
                  : "border-border-default hover:border-border-hover"
              }`}
            >
              <TrendingUp
                className={`w-6 h-6 mx-auto mb-2 ${
                  condition === "ABOVE" ? "text-success" : "text-text-tertiary"
                }`}
              />
              <span
                className={`text-sm font-medium ${
                  condition === "ABOVE" ? "text-success" : "text-text-secondary"
                }`}
              >
                Above
              </span>
            </button>

            <button
              type="button"
              onClick={() => setCondition("BELOW")}
              className={`p-4 rounded-lg border-2 transition-all ${
                condition === "BELOW"
                  ? "border-error bg-error/10"
                  : "border-border-default hover:border-border-hover"
              }`}
            >
              <TrendingDown
                className={`w-6 h-6 mx-auto mb-2 ${
                  condition === "BELOW" ? "text-error" : "text-text-tertiary"
                }`}
              />
              <span
                className={`text-sm font-medium ${
                  condition === "BELOW" ? "text-error" : "text-text-secondary"
                }`}
              >
                Below
              </span>
            </button>
          </div>
        </div>

        {/* Target Price */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Target Price (R$)
          </label>
          <Input
            type="number"
            step="0.01"
            min="0.01"
            value={targetPrice}
            onChange={setTargetPrice}
            placeholder="0.00"
            required
          />
          {!isNaN(parseFloat(targetPrice)) && parseFloat(targetPrice) > 0 && (
            <p className="mt-2 text-sm text-text-tertiary">
              {priceDiff > 0 ? "+" : ""}
              {percentDiff}% from current price
            </p>
          )}
        </div>

        {/* Notification Preferences */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-text-primary">
            Notify me via
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={notifyEmail}
              onChange={(e) => setNotifyEmail(e.target.checked)}
              className="w-4 h-4 rounded border-border-default"
            />
            <span className="text-sm text-text-secondary">Email notification</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={notifyPush}
              onChange={(e) => setNotifyPush(e.target.checked)}
              className="w-4 h-4 rounded border-border-default"
            />
            <span className="text-sm text-text-secondary">
              Push notification (coming soon)
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isLoading}
            disabled={isLoading || (!notifyEmail && !notifyPush)}
            className="flex-1"
          >
            <Bell className="w-4 h-4 mr-2" />
            Create Alert
          </Button>
        </div>

        {!notifyEmail && !notifyPush && (
          <p className="text-sm text-warning text-center">
            Please select at least one notification method
          </p>
        )}
      </form>
    </Modal>
  );
}

"use client";

import { useState, useEffect } from "react";
import { DollarSign, CheckCircle, AlertCircle, ExternalLink, Loader2 } from "lucide-react";
import { Button, Modal } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { useClaimRoyalties } from "@/hooks";
import { useAccount } from "wagmi";
import { ConnectWallet } from "@/components/web3";
import { toast } from "@/components/ui/use-toast";

interface ClaimableDistribution {
  id: number;
  trackTitle: string;
  amount: number;
  source: string;
  date: Date;
}

interface ClaimRoyaltiesButtonProps {
  distributions: ClaimableDistribution[];
  onSuccess?: () => void;
}

export function ClaimRoyaltiesButton({ distributions, onSuccess }: ClaimRoyaltiesButtonProps) {
  const { address, isConnected } = useAccount();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDistributions, setSelectedDistributions] = useState<number[]>([]);

  const { claimSingle, claimMultiple, isPending, isConfirming, isSuccess, hash, error } =
    useClaimRoyalties();

  const totalClaimable = distributions.reduce((sum, d) => sum + d.amount, 0);

  const handleClaim = () => {
    if (selectedDistributions.length === 0) {
      // Claim all
      const ids = distributions.map((d) => d.id);
      claimMultiple(ids);
    } else if (selectedDistributions.length === 1) {
      claimSingle(selectedDistributions[0]);
    } else {
      claimMultiple(selectedDistributions);
    }
  };

  const toggleDistribution = (id: number) => {
    setSelectedDistributions((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectedTotal = distributions
    .filter((d) => selectedDistributions.includes(d.id))
    .reduce((sum, d) => sum + d.amount, 0);

  // Monitor transaction status and provide feedback
  useEffect(() => {
    if (isPending) {
      toast.info(
        "Confirme o resgate",
        "Por favor, confirme a transação na sua carteira MetaMask"
      );
    }
  }, [isPending]);

  useEffect(() => {
    if (isConfirming) {
      toast.info(
        "Processando resgate",
        "Aguarde enquanto a transação é confirmada na blockchain..."
      );
    }
  }, [isConfirming]);

  useEffect(() => {
    if (error) {
      toast.error(
        "Erro ao resgatar royalties",
        "Ocorreu um erro na transação. Por favor, tente novamente."
      );
    }
  }, [error]);

  // Close modal and refresh after successful claim
  useEffect(() => {
    if (isSuccess && hash) {
      const total = selectedDistributions.length > 0 ? selectedTotal : totalClaimable;
      toast.success(
        "Resgate realizado com sucesso!",
        `Você resgatou ${formatCurrency(total)} em royalties`
      );

      setTimeout(() => {
        setIsModalOpen(false);
        if (onSuccess) {
          onSuccess();
        }
        // Refresh the page to update the distributions
        window.location.reload();
      }, 3000); // Wait 3 seconds to show success message
    }
  }, [isSuccess, hash, onSuccess, selectedDistributions.length, selectedTotal, totalClaimable]);

  if (distributions.length === 0) {
    return null;
  }

  return (
    <>
      <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
        <DollarSign className="w-4 h-4" />
        Resgatar Royalties ({formatCurrency(totalClaimable)})
      </Button>

      <Modal
        title="Resgatar Royalties"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="p-6 border-b border-border-primary">
            <p className="text-sm text-text-secondary mt-1">
              Selecione os royalties que deseja resgatar
            </p>
          </div>

          {/* Content */}
          <div className="p-6 max-h-96 overflow-y-auto">
            {!isConnected ? (
              <div className="text-center py-8">
                <p className="text-sm text-text-secondary mb-4">
                  Conecte sua carteira para resgatar royalties
                </p>
                <ConnectWallet />
              </div>
            ) : (
              <>
                {/* Distributions List */}
                <div className="space-y-3 mb-6">
                  {distributions.map((distribution) => (
                    <label
                      key={distribution.id}
                      className={`flex items-center justify-between p-4 bg-bg-tertiary rounded-lg cursor-pointer hover:bg-bg-elevated transition-colors ${
                        selectedDistributions.includes(distribution.id)
                          ? "ring-2 ring-primary"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedDistributions.includes(distribution.id)}
                          onChange={() => toggleDistribution(distribution.id)}
                          className="w-4 h-4 text-primary bg-bg-secondary border-border-primary rounded focus:ring-primary focus:ring-2"
                        />
                        <div>
                          <div className="font-medium text-text-primary">
                            {distribution.trackTitle}
                          </div>
                          <div className="text-xs text-text-secondary mt-0.5">
                            {distribution.source} •{" "}
                            {distribution.date.toLocaleDateString("pt-BR")}
                          </div>
                        </div>
                      </div>
                      <div className="font-semibold text-accent-green">
                        {formatCurrency(distribution.amount)}
                      </div>
                    </label>
                  ))}
                </div>

                {/* Summary */}
                <div className="bg-bg-tertiary rounded-xl p-4 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-text-secondary">
                      Total selecionado ({selectedDistributions.length || distributions.length}{" "}
                      distribuições)
                    </span>
                    <span className="text-lg font-bold text-accent-green">
                      {formatCurrency(
                        selectedDistributions.length > 0 ? selectedTotal : totalClaimable
                      )}
                    </span>
                  </div>
                  <div className="text-xs text-text-tertiary">
                    Você receberá este valor em sua carteira
                  </div>
                </div>

                {/* Transaction Status */}
                {(isPending || isConfirming) && (
                  <div className="flex items-center gap-3 p-3 bg-primary/10 border border-primary/20 rounded-xl mb-4">
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    <span className="text-sm">
                      {isPending
                        ? "Confirme a transação na sua carteira..."
                        : "Processando resgate..."}
                    </span>
                  </div>
                )}

                {isSuccess && hash && (
                  <div className="flex items-center gap-3 p-3 bg-accent-green/10 border border-accent-green/20 rounded-xl mb-4">
                    <CheckCircle className="w-5 h-5 text-accent-green" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">Resgate realizado com sucesso!</div>
                      <a
                        href={`https://polygonscan.com/tx/${hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-primary mt-1"
                      >
                        Ver transação <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-3 p-3 bg-accent-red/10 border border-accent-red/20 rounded-xl mb-4">
                    <AlertCircle className="w-5 h-5 text-accent-red" />
                    <span className="text-sm text-accent-red">
                      Erro ao resgatar. Tente novamente.
                    </span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          {isConnected && (
            <div className="p-6 border-t border-border-primary flex gap-3">
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="flex-1"
                disabled={isPending || isConfirming}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleClaim}
                disabled={isPending || isConfirming || distributions.length === 0}
                loading={isPending || isConfirming}
                className="flex-1"
              >
                {isPending
                  ? "Confirme na Carteira"
                  : isConfirming
                  ? "Processando..."
                  : `Resgatar ${formatCurrency(
                      selectedDistributions.length > 0 ? selectedTotal : totalClaimable
                    )}`}
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}

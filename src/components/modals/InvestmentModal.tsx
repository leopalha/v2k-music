"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  X,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Button, Input } from "@/components/ui";
import { useRouter } from "next/navigation";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

type Step = 1 | 2 | 3;

interface InvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  track: {
    id: string;
    title: string;
    artistName: string;
    coverUrl: string;
    currentPrice: number;
    availableSupply: number;
  };
}

export default function InvestmentModal({
  isOpen,
  onClose,
  track,
}: InvestmentModalProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [amount, setAmount] = useState("50");
  const [acceptRisks, setAcceptRisks] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const amountNum = parseFloat(amount) || 0;
  const tokensAmount = Math.floor(amountNum / track.currentPrice);
  const ownershipPercent = (tokensAmount / 10000) * 100; // Assuming 10k total supply
  const estimatedMonthly = tokensAmount * 0.001; // Simplified calculation

  const validateAmount = () => {
    if (amountNum < 10) {
      setError("Investimento mínimo é R$ 10");
      return false;
    }
    if (tokensAmount > track.availableSupply) {
      setError(
        `Apenas ${track.availableSupply} tokens disponíveis (máx R$ ${(track.availableSupply * track.currentPrice).toFixed(2)})`
      );
      return false;
    }
    if (tokensAmount <= 0) {
      setError("Valor inválido");
      return false;
    }
    setError("");
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && !validateAmount()) return;
    if (currentStep === 2 && !acceptRisks) {
      setError("Você precisa aceitar os riscos para continuar");
      return;
    }
    setError("");
    if (currentStep < 3) {
      setCurrentStep((currentStep + 1) as Step);
    }
  };

  const handleBack = () => {
    setError("");
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  const handlePayment = async () => {
    setIsLoading(true);
    setError("");

    try {
      // Create checkout session
      const checkoutRes = await fetch("/api/checkout/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackId: track.id,
          amountBRL: amountNum,
        }),
      });

      const checkoutData = await checkoutRes.json();

      if (!checkoutRes.ok) {
        if (checkoutData.requiresKyc) {
          setError("Complete seu cadastro (KYC) antes de investir");
          setTimeout(() => router.push("/onboarding"), 2000);
          return;
        }
        throw new Error(checkoutData.error || "Erro ao criar checkout");
      }

      // Check if we're in mock mode (dev only)
      if (checkoutData.isMockMode) {
        // DEV MODE: Simulate payment success
        console.log('[DEV] Mock Payment created:', checkoutData.paymentIntent.id);
        
        // Simulate payment delay
        await new Promise((resolve) => setTimeout(resolve, 1500));
        
        // Simulate payment approval
        const simulateRes = await fetch('/api/investments/simulate-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentIntentId: checkoutData.paymentIntent.id,
          }),
        });
        
        if (!simulateRes.ok) {
          throw new Error('Erro ao simular pagamento');
        }

        // Confirm investment on backend
        const confirmRes = await fetch("/api/investments/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentIntentId: checkoutData.paymentIntent.id,
          }),
        });

        const confirmData = await confirmRes.json();

        if (!confirmRes.ok) {
          throw new Error(confirmData.error || "Erro ao confirmar investimento");
        }

        // Show success
        setSuccess(true);
        setTimeout(() => {
          onClose();
          router.push("/portfolio");
        }, 2000);
      } else {
        // PRODUCTION: Redirect to Stripe Checkout
        if (checkoutData.checkoutUrl) {
          window.location.href = checkoutData.checkoutUrl;
          return;
        }
        
        throw new Error('Checkout URL não retornada. Verifique configuração do Stripe');
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao processar pagamento"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const quickAmounts = [50, 100, 250, 500];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-bg-secondary rounded-2xl border border-border-default max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-border-subtle flex items-center justify-between sticky top-0 bg-bg-secondary z-10">
          <h2 className="text-xl font-display font-bold text-text-primary">
            {success
              ? "Investimento Realizado!"
              : currentStep === 1
                ? "Quanto deseja investir?"
                : currentStep === 2
                  ? "Revisar Investimento"
                  : "Pagamento"}
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-text-tertiary hover:text-text-primary transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Success State */}
          {success && (
            <div className="text-center py-8">
              <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-success" />
              </div>
              <h3 className="text-2xl font-display font-bold text-text-primary mb-2">
                Parabéns! 🎉
              </h3>
              <p className="text-text-secondary mb-4">
                Você agora possui {tokensAmount} tokens de
              </p>
              <p className="text-lg font-semibold text-text-primary">
                {track.title} - {track.artistName}
              </p>
              <p className="text-sm text-text-tertiary mt-6">
                Redirecionando para seu portfólio...
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && !success && (
            <div className="mb-6 p-4 rounded-xl bg-error/10 border border-error/20 text-error text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Step 1: Amount */}
          {!success && currentStep === 1 && (
            <div>
              <p className="text-text-secondary mb-6">
                Escolha o valor que deseja investir em {track.title}
              </p>

              <Input
                label="Valor (R$)"
                type="number"
                placeholder="50.00"
                value={amount}
                onChange={setAmount}
                min="10"
                step="0.01"
                required
              />

              {/* Quick amounts */}
              <div className="grid grid-cols-4 gap-2 mt-4">
                {quickAmounts.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setAmount(amt.toString())}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      parseFloat(amount) === amt
                        ? "bg-primary-400 text-white"
                        : "bg-bg-elevated text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
                    }`}
                  >
                    R$ {amt}
                  </button>
                ))}
              </div>

              {/* Preview */}
              {amountNum >= 10 && (
                <div className="mt-6 p-4 rounded-xl bg-bg-elevated border border-border-default">
                  <h4 className="text-sm font-semibold text-text-secondary mb-3">
                    Você receberá:
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-tertiary">Tokens:</span>
                      <span className="text-text-primary font-mono font-semibold">
                        {tokensAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-tertiary">% da música:</span>
                      <span className="text-text-primary font-mono font-semibold">
                        ~{ownershipPercent.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-tertiary">
                        Est. mensal:
                      </span>
                      <span className="text-success font-mono font-semibold">
                        ~R$ {estimatedMonthly.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-text-tertiary mt-3">
                    * Baseado na média dos últimos 30 dias
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Review */}
          {!success && currentStep === 2 && (
            <div>
              {/* Track Info */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-bg-elevated mb-6">
                {track.coverUrl && (
                  <img
                    src={track.coverUrl}
                    alt={track.title}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                )}
                <div>
                  <h4 className="font-semibold text-text-primary">
                    {track.title}
                  </h4>
                  <p className="text-sm text-text-tertiary">
                    {track.artistName}
                  </p>
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-text-tertiary">Investimento:</span>
                  <span className="text-text-primary font-semibold">
                    R$ {amountNum.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-tertiary">Tokens:</span>
                  <span className="text-text-primary font-semibold">
                    {tokensAmount} (~{ownershipPercent.toFixed(2)}%)
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-tertiary">Est. mensal:</span>
                  <span className="text-success font-semibold">
                    ~R$ {estimatedMonthly.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-tertiary">Taxa:</span>
                  <span className="text-text-primary font-semibold">
                    R$ 0,00
                  </span>
                </div>
                <div className="pt-3 border-t border-border-subtle flex justify-between">
                  <span className="font-semibold text-text-primary">
                    Total:
                  </span>
                  <span className="font-bold text-xl text-text-primary font-mono">
                    R$ {amountNum.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Risk Acceptance */}
              <label className="flex items-start gap-3 p-4 rounded-xl bg-bg-elevated border border-border-default hover:border-border-strong transition-all cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptRisks}
                  onChange={(e) => setAcceptRisks(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-border-default bg-bg-secondary text-primary-400 focus:ring-primary-400 focus:ring-offset-0"
                />
                <div>
                  <span className="font-medium text-text-primary text-sm">
                    Entendo os riscos
                  </span>
                  <p className="text-xs text-text-tertiary mt-1">
                    Investir em royalties musicais envolve riscos. Retornos
                    passados não garantem resultados futuros.
                  </p>
                </div>
              </label>
            </div>
          )}

          {/* Step 3: Payment */}
          {!success && currentStep === 3 && (
            <div className="text-center py-8">
              <div className="w-20 h-20 rounded-full bg-primary-400/10 flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-10 h-10 text-primary-400 animate-spin" />
              </div>
              <h3 className="text-xl font-display font-bold text-text-primary mb-2">
                Processando pagamento...
              </h3>
              <p className="text-text-secondary mb-4">
                Estamos confirmando seu investimento na blockchain
              </p>
              <p className="text-sm text-text-tertiary">
                Isso pode levar alguns segundos
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div className="p-6 border-t border-border-subtle flex items-center justify-between">
            {currentStep > 1 && currentStep < 3 ? (
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={isLoading}
                icon={<ArrowLeft className="w-4 h-4" />}
              >
                Voltar
              </Button>
            ) : (
              <div />
            )}

            {currentStep < 3 && (
              <Button
                variant="primary"
                onClick={
                  currentStep === 2 ? () => {
                    setCurrentStep(3);
                    handlePayment();
                  } : handleNext
                }
                disabled={isLoading}
                icon={
                  currentStep === 2 ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )
                }
                iconPosition="right"
              >
                {currentStep === 2 ? "Confirmar e Pagar" : "Continuar"}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

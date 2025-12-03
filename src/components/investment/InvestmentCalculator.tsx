"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui";
import { Calculator, TrendingUp, AlertTriangle, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface InvestmentCalculatorProps {
  trackId: string;
  trackTitle: string;
  currentPrice: number;
  monthlyStreams?: number;
  totalSupply: number;
  onInvest?: (quantity: number) => void;
}

export function InvestmentCalculator({
  trackId,
  trackTitle,
  currentPrice,
  monthlyStreams = 50000,
  totalSupply,
  onInvest,
}: InvestmentCalculatorProps) {
  const [quantity, setQuantity] = useState(10);
  const [showCalculator, setShowCalculator] = useState(false);

  // Calculate ROI estimates
  const calculations = useMemo(() => {
    const totalInvestment = quantity * currentPrice;
    
    // Royalty calculation (simplified)
    // Assume $0.004 per stream, 70% goes to token holders
    const monthlyRoyaltyPerStream = 0.004 * 0.7 * (4.8 / 5); // Convert USD to BRL
    const monthlyRoyaltyTotal = monthlyStreams * monthlyRoyaltyPerStream;
    const monthlyRoyaltyPerToken = monthlyRoyaltyTotal / totalSupply;
    const monthlyEarnings = monthlyRoyaltyPerToken * quantity;
    
    // Annual projections
    const annualEarnings = monthlyEarnings * 12;
    const annualROI = (annualEarnings / totalInvestment) * 100;
    
    // Time to break even (months)
    const breakEvenMonths = totalInvestment / monthlyEarnings;
    
    // Conservative, base, and optimistic scenarios
    const scenarios = {
      conservative: {
        streams: monthlyStreams * 0.5,
        monthlyEarnings: monthlyEarnings * 0.5,
        annualROI: annualROI * 0.5,
      },
      base: {
        streams: monthlyStreams,
        monthlyEarnings,
        annualROI,
      },
      optimistic: {
        streams: monthlyStreams * 2,
        monthlyEarnings: monthlyEarnings * 2,
        annualROI: annualROI * 2,
      },
    };
    
    return {
      totalInvestment,
      monthlyEarnings,
      annualEarnings,
      annualROI,
      breakEvenMonths,
      scenarios,
    };
  }, [quantity, currentPrice, monthlyStreams, totalSupply]);

  if (!showCalculator) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowCalculator(true)}
        className="w-full sm:w-auto"
      >
        <Calculator className="w-4 h-4 mr-2" />
        Calcular ROI
      </Button>
    );
  }

  return (
    <div className="bg-bg-secondary rounded-xl border border-border-primary p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Calculator className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary">
              Calculadora de Investimento
            </h3>
            <p className="text-sm text-text-secondary">
              Estime seus retornos em {trackTitle}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowCalculator(false)}
        >
          ×
        </Button>
      </div>

      {/* Quantity Input */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          Quantidade de Tokens
        </label>
        <input
          type="number"
          min="1"
          max={totalSupply}
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
          className="w-full px-4 py-3 bg-bg-elevated border border-border-default rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <p className="text-xs text-text-tertiary mt-2">
          Total: {formatCurrency(calculations.totalInvestment)}
        </p>
      </div>

      {/* Base Scenario */}
      <div className="bg-bg-elevated rounded-lg p-4 space-y-3">
        <h4 className="text-sm font-semibold text-text-primary flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-accent-green" />
          Cenário Base ({monthlyStreams.toLocaleString()} streams/mês)
        </h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-text-tertiary">Rendimento Mensal</p>
            <p className="text-lg font-bold text-accent-green">
              {formatCurrency(calculations.monthlyEarnings)}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-tertiary">ROI Anual</p>
            <p className="text-lg font-bold text-text-primary">
              {calculations.annualROI.toFixed(2)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-text-tertiary">Rendimento Anual</p>
            <p className="text-lg font-bold text-text-primary">
              {formatCurrency(calculations.annualEarnings)}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-tertiary">Break Even</p>
            <p className="text-lg font-bold text-text-primary">
              {calculations.breakEvenMonths.toFixed(1)} meses
            </p>
          </div>
        </div>
      </div>

      {/* Scenario Comparison */}
      <div className="grid grid-cols-3 gap-3">
        {/* Conservative */}
        <div className="bg-bg-elevated rounded-lg p-3 text-center">
          <p className="text-xs text-text-tertiary mb-1">Conservador</p>
          <p className="text-sm font-semibold text-accent-orange">
            {calculations.scenarios.conservative.annualROI.toFixed(1)}%
          </p>
          <p className="text-xs text-text-tertiary mt-1">
            {formatCurrency(calculations.scenarios.conservative.monthlyEarnings)}/mês
          </p>
        </div>

        {/* Base */}
        <div className="bg-primary/10 rounded-lg p-3 text-center border-2 border-primary">
          <p className="text-xs text-primary mb-1">Base</p>
          <p className="text-sm font-semibold text-primary">
            {calculations.scenarios.base.annualROI.toFixed(1)}%
          </p>
          <p className="text-xs text-text-tertiary mt-1">
            {formatCurrency(calculations.scenarios.base.monthlyEarnings)}/mês
          </p>
        </div>

        {/* Optimistic */}
        <div className="bg-bg-elevated rounded-lg p-3 text-center">
          <p className="text-xs text-text-tertiary mb-1">Otimista</p>
          <p className="text-sm font-semibold text-accent-green">
            {calculations.scenarios.optimistic.annualROI.toFixed(1)}%
          </p>
          <p className="text-xs text-text-tertiary mt-1">
            {formatCurrency(calculations.scenarios.optimistic.monthlyEarnings)}/mês
          </p>
        </div>
      </div>

      {/* Risk Disclaimer */}
      <div className="bg-accent-orange/10 border border-accent-orange/20 rounded-lg p-4 flex gap-3">
        <AlertTriangle className="w-5 h-5 text-accent-orange flex-shrink-0 mt-0.5" />
        <div className="text-xs text-text-secondary space-y-1">
          <p className="font-semibold text-text-primary">Aviso de Risco</p>
          <p>
            • Estes cálculos são <strong>estimativas</strong> baseadas em dados atuais e podem não refletir resultados reais.
          </p>
          <p>
            • O número de streams pode variar significativamente ao longo do tempo.
          </p>
          <p>
            • Investimentos em ativos digitais envolvem riscos. Invista apenas o que pode perder.
          </p>
          <p>
            • Rentabilidade passada não garante rentabilidade futura.
          </p>
        </div>
      </div>

      {/* Invest Button */}
      {onInvest && (
        <Button
          variant="primary"
          fullWidth
          onClick={() => onInvest(quantity)}
          size="lg"
        >
          <DollarSign className="w-5 h-5 mr-2" />
          Investir {formatCurrency(calculations.totalInvestment)}
        </Button>
      )}
    </div>
  );
}
